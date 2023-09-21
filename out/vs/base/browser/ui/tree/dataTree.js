/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/objectTreeModel", "vs/base/browser/ui/tree/tree", "vs/base/common/iterator"], function (require, exports, abstractTree_1, objectTreeModel_1, tree_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DataTree = void 0;
    class DataTree extends abstractTree_1.AbstractTree {
        constructor(user, container, delegate, renderers, dataSource, options = {}) {
            super(user, container, delegate, renderers, options);
            this.user = user;
            this.dataSource = dataSource;
            this.nodesByIdentity = new Map();
            this.identityProvider = options.identityProvider;
        }
        // Model
        getInput() {
            return this.input;
        }
        setInput(input, viewState) {
            if (viewState && !this.identityProvider) {
                throw new tree_1.TreeError(this.user, 'Can\'t restore tree view state without an identity provider');
            }
            this.input = input;
            if (!input) {
                this.nodesByIdentity.clear();
                this.model.setChildren(null, iterator_1.Iterable.empty());
                return;
            }
            if (!viewState) {
                this._refresh(input);
                return;
            }
            const focus = [];
            const selection = [];
            const isCollapsed = (element) => {
                const id = this.identityProvider.getId(element).toString();
                return !viewState.expanded[id];
            };
            const onDidCreateNode = (node) => {
                const id = this.identityProvider.getId(node.element).toString();
                if (viewState.focus.has(id)) {
                    focus.push(node.element);
                }
                if (viewState.selection.has(id)) {
                    selection.push(node.element);
                }
            };
            this._refresh(input, isCollapsed, onDidCreateNode);
            this.setFocus(focus);
            this.setSelection(selection);
            if (viewState && typeof viewState.scrollTop === 'number') {
                this.scrollTop = viewState.scrollTop;
            }
        }
        updateChildren(element = this.input) {
            if (typeof this.input === 'undefined') {
                throw new tree_1.TreeError(this.user, 'Tree input not set');
            }
            let isCollapsed;
            if (this.identityProvider) {
                isCollapsed = element => {
                    const id = this.identityProvider.getId(element).toString();
                    const node = this.nodesByIdentity.get(id);
                    if (!node) {
                        return undefined;
                    }
                    return node.collapsed;
                };
            }
            this._refresh(element, isCollapsed);
        }
        resort(element = this.input, recursive = true) {
            this.model.resort((element === this.input ? null : element), recursive);
        }
        // View
        refresh(element) {
            if (element === undefined) {
                this.view.rerender();
                return;
            }
            this.model.rerender(element);
        }
        // Implementation
        _refresh(element, isCollapsed, onDidCreateNode) {
            let onDidDeleteNode;
            if (this.identityProvider) {
                const insertedElements = new Set();
                const outerOnDidCreateNode = onDidCreateNode;
                onDidCreateNode = (node) => {
                    const id = this.identityProvider.getId(node.element).toString();
                    insertedElements.add(id);
                    this.nodesByIdentity.set(id, node);
                    outerOnDidCreateNode?.(node);
                };
                onDidDeleteNode = (node) => {
                    const id = this.identityProvider.getId(node.element).toString();
                    if (!insertedElements.has(id)) {
                        this.nodesByIdentity.delete(id);
                    }
                };
            }
            this.model.setChildren((element === this.input ? null : element), this.iterate(element, isCollapsed).elements, { onDidCreateNode, onDidDeleteNode });
        }
        iterate(element, isCollapsed) {
            const children = [...this.dataSource.getChildren(element)];
            const elements = iterator_1.Iterable.map(children, element => {
                const { elements: children, size } = this.iterate(element, isCollapsed);
                const collapsible = this.dataSource.hasChildren ? this.dataSource.hasChildren(element) : undefined;
                const collapsed = size === 0 ? undefined : (isCollapsed && isCollapsed(element));
                return { element, children, collapsible, collapsed };
            });
            return { elements, size: children.length };
        }
        createModel(user, view, options) {
            return new objectTreeModel_1.ObjectTreeModel(user, view, options);
        }
    }
    exports.DataTree = DataTree;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVRyZWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvdHJlZS9kYXRhVHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBYSxRQUF3QyxTQUFRLDJCQUE2QztRQVF6RyxZQUNTLElBQVksRUFDcEIsU0FBc0IsRUFDdEIsUUFBaUMsRUFDakMsU0FBK0MsRUFDdkMsVUFBa0MsRUFDMUMsVUFBNEMsRUFBRTtZQUU5QyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQWtELENBQUMsQ0FBQztZQVB4RixTQUFJLEdBQUosSUFBSSxDQUFRO1lBSVosZUFBVSxHQUFWLFVBQVUsQ0FBd0I7WUFQbkMsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztZQVd0RSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1FBQ2xELENBQUM7UUFFRCxRQUFRO1FBRVIsUUFBUTtZQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRUQsUUFBUSxDQUFDLEtBQXlCLEVBQUUsU0FBaUM7WUFDcEUsSUFBSSxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3hDLE1BQU0sSUFBSSxnQkFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNkRBQTZELENBQUMsQ0FBQzthQUM5RjtZQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRW5CLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLG1CQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFD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