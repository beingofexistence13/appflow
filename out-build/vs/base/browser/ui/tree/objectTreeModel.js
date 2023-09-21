/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/indexTreeModel", "vs/base/browser/ui/tree/tree", "vs/base/common/iterator"], function (require, exports, indexTreeModel_1, tree_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gS = void 0;
    class $gS {
        get size() { return this.d.size; }
        constructor(k, list, options = {}) {
            this.k = k;
            this.rootRef = null;
            this.d = new Map();
            this.f = new Map();
            this.c = new indexTreeModel_1.$aS(k, list, null, options);
            this.onDidSplice = this.c.onDidSplice;
            this.onDidChangeCollapseState = this.c.onDidChangeCollapseState;
            this.onDidChangeRenderNodeCount = this.c.onDidChangeRenderNodeCount;
            if (options.sorter) {
                this.j = {
                    compare(a, b) {
                        return options.sorter.compare(a.element, b.element);
                    }
                };
            }
            this.h = options.identityProvider;
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options = {}) {
            const location = this.o(element);
            this.l(location, this.m(children), options);
        }
        l(location, children = iterator_1.Iterable.empty(), options) {
            const insertedElements = new Set();
            const insertedElementIds = new Set();
            const onDidCreateNode = (node) => {
                if (node.element === null) {
                    return;
                }
                const tnode = node;
                insertedElements.add(tnode.element);
                this.d.set(tnode.element, tnode);
                if (this.h) {
                    const id = this.h.getId(tnode.element).toString();
                    insertedElementIds.add(id);
                    this.f.set(id, tnode);
                }
                options.onDidCreateNode?.(tnode);
            };
            const onDidDeleteNode = (node) => {
                if (node.element === null) {
                    return;
                }
                const tnode = node;
                if (!insertedElements.has(tnode.element)) {
                    this.d.delete(tnode.element);
                }
                if (this.h) {
                    const id = this.h.getId(tnode.element).toString();
                    if (!insertedElementIds.has(id)) {
                        this.f.delete(id);
                    }
                }
                options.onDidDeleteNode?.(tnode);
            };
            this.c.splice([...location, 0], Number.MAX_VALUE, children, { ...options, onDidCreateNode, onDidDeleteNode });
        }
        m(elements = iterator_1.Iterable.empty()) {
            if (this.j) {
                elements = [...elements].sort(this.j.compare.bind(this.j));
            }
            return iterator_1.Iterable.map(elements, treeElement => {
                let node = this.d.get(treeElement.element);
                if (!node && this.h) {
                    const id = this.h.getId(treeElement.element).toString();
                    node = this.f.get(id);
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
                        children: this.m(treeElement.children),
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
                    children: this.m(treeElement.children)
                };
            });
        }
        rerender(element) {
            const location = this.o(element);
            this.c.rerender(location);
        }
        updateElementHeight(element, height) {
            const location = this.o(element);
            this.c.updateElementHeight(location, height);
        }
        resort(element = null, recursive = true) {
            if (!this.j) {
                return;
            }
            const location = this.o(element);
            const node = this.c.getNode(location);
            this.l(location, this.n(node, recursive), {});
        }
        n(node, recursive, first = true) {
            let childrenNodes = [...node.children];
            if (recursive || first) {
                childrenNodes = childrenNodes.sort(this.j.compare.bind(this.j));
            }
            return iterator_1.Iterable.map(childrenNodes, node => ({
                element: node.element,
                collapsible: node.collapsible,
                collapsed: node.collapsed,
                children: this.n(node, recursive, false)
            }));
        }
        getFirstElementChild(ref = null) {
            const location = this.o(ref);
            return this.c.getFirstElementChild(location);
        }
        getLastElementAncestor(ref = null) {
            const location = this.o(ref);
            return this.c.getLastElementAncestor(location);
        }
        has(element) {
            return this.d.has(element);
        }
        getListIndex(element) {
            const location = this.o(element);
            return this.c.getListIndex(location);
        }
        getListRenderCount(element) {
            const location = this.o(element);
            return this.c.getListRenderCount(location);
        }
        isCollapsible(element) {
            const location = this.o(element);
            return this.c.isCollapsible(location);
        }
        setCollapsible(element, collapsible) {
            const location = this.o(element);
            return this.c.setCollapsible(location, collapsible);
        }
        isCollapsed(element) {
            const location = this.o(element);
            return this.c.isCollapsed(location);
        }
        setCollapsed(element, collapsed, recursive) {
            const location = this.o(element);
            return this.c.setCollapsed(location, collapsed, recursive);
        }
        expandTo(element) {
            const location = this.o(element);
            this.c.expandTo(location);
        }
        refilter() {
            this.c.refilter();
        }
        getNode(element = null) {
            if (element === null) {
                return this.c.getNode(this.c.rootRef);
            }
            const node = this.d.get(element);
            if (!node) {
                throw new tree_1.$9R(this.k, `Tree element not found: ${element}`);
            }
            return node;
        }
        getNodeLocation(node) {
            return node.element;
        }
        getParentNodeLocation(element) {
            if (element === null) {
                throw new tree_1.$9R(this.k, `Invalid getParentNodeLocation call`);
            }
            const node = this.d.get(element);
            if (!node) {
                throw new tree_1.$9R(this.k, `Tree element not found: ${element}`);
            }
            const location = this.c.getNodeLocation(node);
            const parentLocation = this.c.getParentNodeLocation(location);
            const parent = this.c.getNode(parentLocation);
            return parent.element;
        }
        o(element) {
            if (element === null) {
                return [];
            }
            const node = this.d.get(element);
            if (!node) {
                throw new tree_1.$9R(this.k, `Tree element not found: ${element}`);
            }
            return this.c.getNodeLocation(node);
        }
    }
    exports.$gS = $gS;
});
//# sourceMappingURL=objectTreeModel.js.map