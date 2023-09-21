/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/indexTreeModel", "vs/base/browser/ui/tree/tree", "vs/base/common/iterator"], function (require, exports, indexTreeModel_1, tree_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObjectTreeModel = void 0;
    class ObjectTreeModel {
        get size() { return this.nodes.size; }
        constructor(user, list, options = {}) {
            this.user = user;
            this.rootRef = null;
            this.nodes = new Map();
            this.nodesByIdentity = new Map();
            this.model = new indexTreeModel_1.IndexTreeModel(user, list, null, options);
            this.onDidSplice = this.model.onDidSplice;
            this.onDidChangeCollapseState = this.model.onDidChangeCollapseState;
            this.onDidChangeRenderNodeCount = this.model.onDidChangeRenderNodeCount;
            if (options.sorter) {
                this.sorter = {
                    compare(a, b) {
                        return options.sorter.compare(a.element, b.element);
                    }
                };
            }
            this.identityProvider = options.identityProvider;
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options = {}) {
            const location = this.getElementLocation(element);
            this._setChildren(location, this.preserveCollapseState(children), options);
        }
        _setChildren(location, children = iterator_1.Iterable.empty(), options) {
            const insertedElements = new Set();
            const insertedElementIds = new Set();
            const onDidCreateNode = (node) => {
                if (node.element === null) {
                    return;
                }
                const tnode = node;
                insertedElements.add(tnode.element);
                this.nodes.set(tnode.element, tnode);
                if (this.identityProvider) {
                    const id = this.identityProvider.getId(tnode.element).toString();
                    insertedElementIds.add(id);
                    this.nodesByIdentity.set(id, tnode);
                }
                options.onDidCreateNode?.(tnode);
            };
            const onDidDeleteNode = (node) => {
                if (node.element === null) {
                    return;
                }
                const tnode = node;
                if (!insertedElements.has(tnode.element)) {
                    this.nodes.delete(tnode.element);
                }
                if (this.identityProvider) {
                    const id = this.identityProvider.getId(tnode.element).toString();
                    if (!insertedElementIds.has(id)) {
                        this.nodesByIdentity.delete(id);
                    }
                }
                options.onDidDeleteNode?.(tnode);
            };
            this.model.splice([...location, 0], Number.MAX_VALUE, children, { ...options, onDidCreateNode, onDidDeleteNode });
        }
        preserveCollapseState(elements = iterator_1.Iterable.empty()) {
            if (this.sorter) {
                elements = [...elements].sort(this.sorter.compare.bind(this.sorter));
            }
            return iterator_1.Iterable.map(elements, treeElement => {
                let node = this.nodes.get(treeElement.element);
                if (!node && this.identityProvider) {
                    const id = this.identityProvider.getId(treeElement.element).toString();
                    node = this.nodesByIdentity.get(id);
                }
                if (!node) {
                    let collapsed;
                    if (typeof treeElement.collapsed === 'undefined') {
                        collapsed = undefined;
                    }
                    else if (treeElement.collapsed === tree_1.ObjectTreeElementCollapseState.Collapsed || treeElement.collapsed === tree_1.ObjectTreeElementCollapseState.PreserveOrCollapsed) {
                        collapsed = true;
                    }
                    else if (treeElement.collapsed === tree_1.ObjectTreeElementCollapseState.Expanded || treeElement.collapsed === tree_1.ObjectTreeElementCollapseState.PreserveOrExpanded) {
                        collapsed = false;
                    }
                    else {
                        collapsed = Boolean(treeElement.collapsed);
                    }
                    return {
                        ...treeElement,
                        children: this.preserveCollapseState(treeElement.children),
                        collapsed
                    };
                }
                const collapsible = typeof treeElement.collapsible === 'boolean' ? treeElement.collapsible : node.collapsible;
                let collapsed;
                if (typeof treeElement.collapsed === 'undefined' || treeElement.collapsed === tree_1.ObjectTreeElementCollapseState.PreserveOrCollapsed || treeElement.collapsed === tree_1.ObjectTreeElementCollapseState.PreserveOrExpanded) {
                    collapsed = node.collapsed;
                }
                else if (treeElement.collapsed === tree_1.ObjectTreeElementCollapseState.Collapsed) {
                    collapsed = true;
                }
                else if (treeElement.collapsed === tree_1.ObjectTreeElementCollapseState.Expanded) {
                    collapsed = false;
                }
                else {
                    collapsed = Boolean(treeElement.collapsed);
                }
                return {
                    ...treeElement,
                    collapsible,
                    collapsed,
                    children: this.preserveCollapseState(treeElement.children)
                };
            });
        }
        rerender(element) {
            const location = this.getElementLocation(element);
            this.model.rerender(location);
        }
        updateElementHeight(element, height) {
            const location = this.getElementLocation(element);
            this.model.updateElementHeight(location, height);
        }
        resort(element = null, recursive = true) {
            if (!this.sorter) {
                return;
            }
            const location = this.getElementLocation(element);
            const node = this.model.getNode(location);
            this._setChildren(location, this.resortChildren(node, recursive), {});
        }
        resortChildren(node, recursive, first = true) {
            let childrenNodes = [...node.children];
            if (recursive || first) {
                childrenNodes = childrenNodes.sort(this.sorter.compare.bind(this.sorter));
            }
            return iterator_1.Iterable.map(childrenNodes, node => ({
                element: node.element,
                collapsible: node.collapsible,
                collapsed: node.collapsed,
                children: this.resortChildren(node, recursive, false)
            }));
        }
        getFirstElementChild(ref = null) {
            const location = this.getElementLocation(ref);
            return this.model.getFirstElementChild(location);
        }
        getLastElementAncestor(ref = null) {
            const location = this.getElementLocation(ref);
            return this.model.getLastElementAncestor(location);
        }
        has(element) {
            return this.nodes.has(element);
        }
        getListIndex(element) {
            const location = this.getElementLocation(element);
            return this.model.getListIndex(location);
        }
        getListRenderCount(element) {
            const location = this.getElementLocation(element);
            return this.model.getListRenderCount(location);
        }
        isCollapsible(element) {
            const location = this.getElementLocation(element);
            return this.model.isCollapsible(location);
        }
        setCollapsible(element, collapsible) {
            const location = this.getElementLocation(element);
            return this.model.setCollapsible(location, collapsible);
        }
        isCollapsed(element) {
            const location = this.getElementLocation(element);
            return this.model.isCollapsed(location);
        }
        setCollapsed(element, collapsed, recursive) {
            const location = this.getElementLocation(element);
            return this.model.setCollapsed(location, collapsed, recursive);
        }
        expandTo(element) {
            const location = this.getElementLocation(element);
            this.model.expandTo(location);
        }
        refilter() {
            this.model.refilter();
        }
        getNode(element = null) {
            if (element === null) {
                return this.model.getNode(this.model.rootRef);
            }
            const node = this.nodes.get(element);
            if (!node) {
                throw new tree_1.TreeError(this.user, `Tree element not found: ${element}`);
            }
            return node;
        }
        getNodeLocation(node) {
            return node.element;
        }
        getParentNodeLocation(element) {
            if (element === null) {
                throw new tree_1.TreeError(this.user, `Invalid getParentNodeLocation call`);
            }
            const node = this.nodes.get(element);
            if (!node) {
                throw new tree_1.TreeError(this.user, `Tree element not found: ${element}`);
            }
            const location = this.model.getNodeLocation(node);
            const parentLocation = this.model.getParentNodeLocation(location);
            const parent = this.model.getNode(parentLocation);
            return parent.element;
        }
        getElementLocation(element) {
            if (element === null) {
                return [];
            }
            const node = this.nodes.get(element);
            if (!node) {
                throw new tree_1.TreeError(this.user, `Tree element not found: ${element}`);
            }
            return this.model.getNodeLocation(node);
        }
    }
    exports.ObjectTreeModel = ObjectTreeModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0VHJlZU1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3RyZWUvb2JqZWN0VHJlZU1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXdCaEcsTUFBYSxlQUFlO1FBYzNCLElBQUksSUFBSSxLQUFhLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRTlDLFlBQ1MsSUFBWSxFQUNwQixJQUFzQyxFQUN0QyxVQUFtRCxFQUFFO1lBRjdDLFNBQUksR0FBSixJQUFJLENBQVE7WUFmWixZQUFPLEdBQUcsSUFBSSxDQUFDO1lBR2hCLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztZQUM5QyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFxQyxDQUFDO1lBZS9FLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSwrQkFBYyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFDMUMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQTRFLENBQUM7WUFDeEgsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsMEJBQThELENBQUM7WUFFNUcsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHO29CQUNiLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDWCxPQUFPLE9BQU8sQ0FBQyxNQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN0RCxDQUFDO2lCQUNELENBQUM7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