/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/objectTreeModel", "vs/base/browser/ui/tree/tree", "vs/base/common/iterator"], function (require, exports, abstractTree_1, objectTreeModel_1, tree_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qS = void 0;
    class $qS extends abstractTree_1.$fS {
        constructor(f, container, delegate, renderers, g, options = {}) {
            super(f, container, delegate, renderers, options);
            this.f = f;
            this.g = g;
            this.d = new Map();
            this.c = options.identityProvider;
        }
        // Model
        getInput() {
            return this.b;
        }
        setInput(input, viewState) {
            if (viewState && !this.c) {
                throw new tree_1.$9R(this.f, 'Can\'t restore tree view state without an identity provider');
            }
            this.b = input;
            if (!input) {
                this.d.clear();
                this.o.setChildren(null, iterator_1.Iterable.empty());
                return;
            }
            if (!viewState) {
                this.m(input);
                return;
            }
            const focus = [];
            const selection = [];
            const isCollapsed = (element) => {
                const id = this.c.getId(element).toString();
                return !viewState.expanded[id];
            };
            const onDidCreateNode = (node) => {
                const id = this.c.getId(node.element).toString();
                if (viewState.focus.has(id)) {
                    focus.push(node.element);
                }
                if (viewState.selection.has(id)) {
                    selection.push(node.element);
                }
            };
            this.m(input, isCollapsed, onDidCreateNode);
            this.setFocus(focus);
            this.setSelection(selection);
            if (viewState && typeof viewState.scrollTop === 'number') {
                this.scrollTop = viewState.scrollTop;
            }
        }
        updateChildren(element = this.b) {
            if (typeof this.b === 'undefined') {
                throw new tree_1.$9R(this.f, 'Tree input not set');
            }
            let isCollapsed;
            if (this.c) {
                isCollapsed = element => {
                    const id = this.c.getId(element).toString();
                    const node = this.d.get(id);
                    if (!node) {
                        return undefined;
                    }
                    return node.collapsed;
                };
            }
            this.m(element, isCollapsed);
        }
        resort(element = this.b, recursive = true) {
            this.o.resort((element === this.b ? null : element), recursive);
        }
        // View
        refresh(element) {
            if (element === undefined) {
                this.j.rerender();
                return;
            }
            this.o.rerender(element);
        }
        // Implementation
        m(element, isCollapsed, onDidCreateNode) {
            let onDidDeleteNode;
            if (this.c) {
                const insertedElements = new Set();
                const outerOnDidCreateNode = onDidCreateNode;
                onDidCreateNode = (node) => {
                    const id = this.c.getId(node.element).toString();
                    insertedElements.add(id);
                    this.d.set(id, node);
                    outerOnDidCreateNode?.(node);
                };
                onDidDeleteNode = (node) => {
                    const id = this.c.getId(node.element).toString();
                    if (!insertedElements.has(id)) {
                        this.d.delete(id);
                    }
                };
            }
            this.o.setChildren((element === this.b ? null : element), this.s(element, isCollapsed).elements, { onDidCreateNode, onDidDeleteNode });
        }
        s(element, isCollapsed) {
            const children = [...this.g.getChildren(element)];
            const elements = iterator_1.Iterable.map(children, element => {
                const { elements: children, size } = this.s(element, isCollapsed);
                const collapsible = this.g.hasChildren ? this.g.hasChildren(element) : undefined;
                const collapsed = size === 0 ? undefined : (isCollapsed && isCollapsed(element));
                return { element, children, collapsible, collapsed };
            });
            return { elements, size: children.length };
        }
        I(user, view, options) {
            return new objectTreeModel_1.$gS(user, view, options);
        }
    }
    exports.$qS = $qS;
});
//# sourceMappingURL=dataTree.js.map