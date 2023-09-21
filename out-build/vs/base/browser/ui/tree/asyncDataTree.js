/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/list/listView", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/indexTreeModel", "vs/base/browser/ui/tree/objectTree", "vs/base/browser/ui/tree/tree", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/types"], function (require, exports, listView_1, abstractTree_1, indexTreeModel_1, objectTree_1, tree_1, async_1, codicons_1, themables_1, errors_1, event_1, iterator_1, lifecycle_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pS = exports.$oS = void 0;
    function createAsyncDataTreeNode(props) {
        return {
            ...props,
            children: [],
            refreshPromise: undefined,
            stale: true,
            slow: false,
            collapsedByDefault: undefined
        };
    }
    function isAncestor(ancestor, descendant) {
        if (!descendant.parent) {
            return false;
        }
        else if (descendant.parent === ancestor) {
            return true;
        }
        else {
            return isAncestor(ancestor, descendant.parent);
        }
    }
    function intersects(node, other) {
        return node === other || isAncestor(node, other) || isAncestor(other, node);
    }
    class AsyncDataTreeNodeWrapper {
        get element() { return this.a.element.element; }
        get children() { return this.a.children.map(node => new AsyncDataTreeNodeWrapper(node)); }
        get depth() { return this.a.depth; }
        get visibleChildrenCount() { return this.a.visibleChildrenCount; }
        get visibleChildIndex() { return this.a.visibleChildIndex; }
        get collapsible() { return this.a.collapsible; }
        get collapsed() { return this.a.collapsed; }
        get visible() { return this.a.visible; }
        get filterData() { return this.a.filterData; }
        constructor(a) {
            this.a = a;
        }
    }
    class AsyncDataTreeRenderer {
        constructor(b, d, onDidChangeTwistieState) {
            this.b = b;
            this.d = d;
            this.onDidChangeTwistieState = onDidChangeTwistieState;
            this.a = new Map();
            this.templateId = b.templateId;
        }
        renderTemplate(container) {
            const templateData = this.b.renderTemplate(container);
            return { templateData };
        }
        renderElement(node, index, templateData, height) {
            this.b.renderElement(this.d.map(node), index, templateData.templateData, height);
        }
        renderTwistie(element, twistieElement) {
            if (element.slow) {
                twistieElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.treeItemLoading));
                return true;
            }
            else {
                twistieElement.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.treeItemLoading));
                return false;
            }
        }
        disposeElement(node, index, templateData, height) {
            this.b.disposeElement?.(this.d.map(node), index, templateData.templateData, height);
        }
        disposeTemplate(templateData) {
            this.b.disposeTemplate(templateData.templateData);
        }
        dispose() {
            this.a.clear();
        }
    }
    function asTreeEvent(e) {
        return {
            browserEvent: e.browserEvent,
            elements: e.elements.map(e => e.element)
        };
    }
    function asTreeMouseEvent(e) {
        return {
            browserEvent: e.browserEvent,
            element: e.element && e.element.element,
            target: e.target
        };
    }
    function asTreeContextMenuEvent(e) {
        return {
            browserEvent: e.browserEvent,
            element: e.element && e.element.element,
            anchor: e.anchor
        };
    }
    class AsyncDataTreeElementsDragAndDropData extends listView_1.$jQ {
        set context(context) {
            this.f.context = context;
        }
        get context() {
            return this.f.context;
        }
        constructor(f) {
            super(f.elements.map(node => node.element));
            this.f = f;
        }
    }
    function asAsyncDataTreeDragAndDropData(data) {
        if (data instanceof listView_1.$jQ) {
            return new AsyncDataTreeElementsDragAndDropData(data);
        }
        return data;
    }
    class AsyncDataTreeNodeListDragAndDrop {
        constructor(a) {
            this.a = a;
        }
        getDragURI(node) {
            return this.a.getDragURI(node.element);
        }
        getDragLabel(nodes, originalEvent) {
            if (this.a.getDragLabel) {
                return this.a.getDragLabel(nodes.map(node => node.element), originalEvent);
            }
            return undefined;
        }
        onDragStart(data, originalEvent) {
            this.a.onDragStart?.(asAsyncDataTreeDragAndDropData(data), originalEvent);
        }
        onDragOver(data, targetNode, targetIndex, originalEvent, raw = true) {
            return this.a.onDragOver(asAsyncDataTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, originalEvent);
        }
        drop(data, targetNode, targetIndex, originalEvent) {
            this.a.drop(asAsyncDataTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, originalEvent);
        }
        onDragEnd(originalEvent) {
            this.a.onDragEnd?.(originalEvent);
        }
    }
    function asObjectTreeOptions(options) {
        return options && {
            ...options,
            collapseByDefault: true,
            identityProvider: options.identityProvider && {
                getId(el) {
                    return options.identityProvider.getId(el.element);
                }
            },
            dnd: options.dnd && new AsyncDataTreeNodeListDragAndDrop(options.dnd),
            multipleSelectionController: options.multipleSelectionController && {
                isSelectionSingleChangeEvent(e) {
                    return options.multipleSelectionController.isSelectionSingleChangeEvent({ ...e, element: e.element });
                },
                isSelectionRangeChangeEvent(e) {
                    return options.multipleSelectionController.isSelectionRangeChangeEvent({ ...e, element: e.element });
                }
            },
            accessibilityProvider: options.accessibilityProvider && {
                ...options.accessibilityProvider,
                getPosInSet: undefined,
                getSetSize: undefined,
                getRole: options.accessibilityProvider.getRole ? (el) => {
                    return options.accessibilityProvider.getRole(el.element);
                } : () => 'treeitem',
                isChecked: options.accessibilityProvider.isChecked ? (e) => {
                    return !!(options.accessibilityProvider?.isChecked(e.element));
                } : undefined,
                getAriaLabel(e) {
                    return options.accessibilityProvider.getAriaLabel(e.element);
                },
                getWidgetAriaLabel() {
                    return options.accessibilityProvider.getWidgetAriaLabel();
                },
                getWidgetRole: options.accessibilityProvider.getWidgetRole ? () => options.accessibilityProvider.getWidgetRole() : () => 'tree',
                getAriaLevel: options.accessibilityProvider.getAriaLevel && (node => {
                    return options.accessibilityProvider.getAriaLevel(node.element);
                }),
                getActiveDescendantId: options.accessibilityProvider.getActiveDescendantId && (node => {
                    return options.accessibilityProvider.getActiveDescendantId(node.element);
                })
            },
            filter: options.filter && {
                filter(e, parentVisibility) {
                    return options.filter.filter(e.element, parentVisibility);
                }
            },
            keyboardNavigationLabelProvider: options.keyboardNavigationLabelProvider && {
                ...options.keyboardNavigationLabelProvider,
                getKeyboardNavigationLabel(e) {
                    return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e.element);
                }
            },
            sorter: undefined,
            expandOnlyOnTwistieClick: typeof options.expandOnlyOnTwistieClick === 'undefined' ? undefined : (typeof options.expandOnlyOnTwistieClick !== 'function' ? options.expandOnlyOnTwistieClick : (e => options.expandOnlyOnTwistieClick(e.element))),
            defaultFindVisibility: e => {
                if (e.hasChildren && e.stale) {
                    return 1 /* TreeVisibility.Visible */;
                }
                else if (typeof options.defaultFindVisibility === 'number') {
                    return options.defaultFindVisibility;
                }
                else if (typeof options.defaultFindVisibility === 'undefined') {
                    return 2 /* TreeVisibility.Recurse */;
                }
                else {
                    return options.defaultFindVisibility(e.element);
                }
            }
        };
    }
    function dfs(node, fn) {
        fn(node);
        node.children.forEach(child => dfs(child, fn));
    }
    class $oS {
        get onDidScroll() { return this.a.onDidScroll; }
        get onDidChangeFocus() { return event_1.Event.map(this.a.onDidChangeFocus, asTreeEvent); }
        get onDidChangeSelection() { return event_1.Event.map(this.a.onDidChangeSelection, asTreeEvent); }
        get onKeyDown() { return this.a.onKeyDown; }
        get onMouseClick() { return event_1.Event.map(this.a.onMouseClick, asTreeMouseEvent); }
        get onMouseDblClick() { return event_1.Event.map(this.a.onMouseDblClick, asTreeMouseEvent); }
        get onContextMenu() { return event_1.Event.map(this.a.onContextMenu, asTreeContextMenuEvent); }
        get onTap() { return event_1.Event.map(this.a.onTap, asTreeMouseEvent); }
        get onPointer() { return event_1.Event.map(this.a.onPointer, asTreeMouseEvent); }
        get onDidFocus() { return this.a.onDidFocus; }
        get onDidBlur() { return this.a.onDidBlur; }
        /**
         * To be used internally only!
         * @deprecated
         */
        get onDidChangeModel() { return this.a.onDidChangeModel; }
        get onDidChangeCollapseState() { return this.a.onDidChangeCollapseState; }
        get onDidUpdateOptions() { return this.a.onDidUpdateOptions; }
        get onDidChangeFindOpenState() { return this.a.onDidChangeFindOpenState; }
        get findMode() { return this.a.findMode; }
        set findMode(mode) { this.a.findMode = mode; }
        get expandOnlyOnTwistieClick() {
            if (typeof this.a.expandOnlyOnTwistieClick === 'boolean') {
                return this.a.expandOnlyOnTwistieClick;
            }
            const fn = this.a.expandOnlyOnTwistieClick;
            return element => fn(this.d.get((element === this.b.element ? null : element)) || null);
        }
        get onDidDispose() { return this.a.onDidDispose; }
        constructor(u, container, delegate, renderers, w, options = {}) {
            this.u = u;
            this.w = w;
            this.d = new Map();
            this.h = new Map();
            this.j = new Map();
            this.o = new event_1.$fd();
            this.p = new event_1.$fd();
            this.q = new tree_1.$0R(node => new AsyncDataTreeNodeWrapper(node));
            this.t = new lifecycle_1.$jc();
            this.k = options.identityProvider;
            this.m = typeof options.autoExpandSingleChildren === 'undefined' ? false : options.autoExpandSingleChildren;
            this.f = options.sorter;
            this.g = options.collapseByDefault;
            this.a = this.y(u, container, delegate, renderers, options);
            this.onDidChangeFindMode = this.a.onDidChangeFindMode;
            this.b = createAsyncDataTreeNode({
                element: undefined,
                parent: null,
                hasChildren: true
            });
            if (this.k) {
                this.b = {
                    ...this.b,
                    id: null
                };
            }
            this.d.set(null, this.b);
            this.a.onDidChangeCollapseState(this.G, this, this.t);
        }
        y(user, container, delegate, renderers, options) {
            const objectTreeDelegate = new abstractTree_1.$bS(delegate);
            const objectTreeRenderers = renderers.map(r => new AsyncDataTreeRenderer(r, this.q, this.p.event));
            const objectTreeOptions = asObjectTreeOptions(options) || {};
            return new objectTree_1.$mS(user, container, objectTreeDelegate, objectTreeRenderers, objectTreeOptions);
        }
        updateOptions(options = {}) {
            this.a.updateOptions(options);
        }
        get options() {
            return this.a.options;
        }
        // Widget
        getHTMLElement() {
            return this.a.getHTMLElement();
        }
        get contentHeight() {
            return this.a.contentHeight;
        }
        get contentWidth() {
            return this.a.contentWidth;
        }
        get onDidChangeContentHeight() {
            return this.a.onDidChangeContentHeight;
        }
        get onDidChangeContentWidth() {
            return this.a.onDidChangeContentWidth;
        }
        get scrollTop() {
            return this.a.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.a.scrollTop = scrollTop;
        }
        get scrollLeft() {
            return this.a.scrollLeft;
        }
        set scrollLeft(scrollLeft) {
            this.a.scrollLeft = scrollLeft;
        }
        get scrollHeight() {
            return this.a.scrollHeight;
        }
        get renderHeight() {
            return this.a.renderHeight;
        }
        get lastVisibleElement() {
            return this.a.lastVisibleElement.element;
        }
        get ariaLabel() {
            return this.a.ariaLabel;
        }
        set ariaLabel(value) {
            this.a.ariaLabel = value;
        }
        domFocus() {
            this.a.domFocus();
        }
        layout(height, width) {
            this.a.layout(height, width);
        }
        style(styles) {
            this.a.style(styles);
        }
        // Model
        getInput() {
            return this.b.element;
        }
        async setInput(input, viewState) {
            this.j.forEach(promise => promise.cancel());
            this.j.clear();
            this.b.element = input;
            const viewStateContext = viewState && { viewState, focus: [], selection: [] };
            await this.z(input, true, false, viewStateContext);
            if (viewStateContext) {
                this.a.setFocus(viewStateContext.focus);
                this.a.setSelection(viewStateContext.selection);
            }
            if (viewState && typeof viewState.scrollTop === 'number') {
                this.scrollTop = viewState.scrollTop;
            }
        }
        async updateChildren(element = this.b.element, recursive = true, rerender = false, options) {
            await this.z(element, recursive, rerender, undefined, options);
        }
        async z(element = this.b.element, recursive = true, rerender = false, viewStateContext, options) {
            if (typeof this.b.element === 'undefined') {
                throw new tree_1.$9R(this.u, 'Tree input not set');
            }
            if (this.b.refreshPromise) {
                await this.b.refreshPromise;
                await event_1.Event.toPromise(this.o.event);
            }
            const node = this.A(element);
            await this.B(node, recursive, viewStateContext, options);
            if (rerender) {
                try {
                    this.a.rerender(node);
                }
                catch {
                    // missing nodes are fine, this could've resulted from
                    // parallel refresh calls, removing `node` altogether
                }
            }
        }
        resort(element = this.b.element, recursive = true) {
            this.a.resort(this.A(element), recursive);
        }
        hasNode(element) {
            return element === this.b.element || this.d.has(element);
        }
        // View
        rerender(element) {
            if (element === undefined || element === this.b.element) {
                this.a.rerender();
                return;
            }
            const node = this.A(element);
            this.a.rerender(node);
        }
        updateWidth(element) {
            const node = this.A(element);
            this.a.updateWidth(node);
        }
        // Tree
        getNode(element = this.b.element) {
            const dataNode = this.A(element);
            const node = this.a.getNode(dataNode === this.b ? null : dataNode);
            return this.q.map(node);
        }
        collapse(element, recursive = false) {
            const node = this.A(element);
            return this.a.collapse(node === this.b ? null : node, recursive);
        }
        async expand(element, recursive = false) {
            if (typeof this.b.element === 'undefined') {
                throw new tree_1.$9R(this.u, 'Tree input not set');
            }
            if (this.b.refreshPromise) {
                await this.b.refreshPromise;
                await event_1.Event.toPromise(this.o.event);
            }
            const node = this.A(element);
            if (this.a.hasElement(node) && !this.a.isCollapsible(node)) {
                return false;
            }
            if (node.refreshPromise) {
                await this.b.refreshPromise;
                await event_1.Event.toPromise(this.o.event);
            }
            if (node !== this.b && !node.refreshPromise && !this.a.isCollapsed(node)) {
                return false;
            }
            const result = this.a.expand(node === this.b ? null : node, recursive);
            if (node.refreshPromise) {
                await this.b.refreshPromise;
                await event_1.Event.toPromise(this.o.event);
            }
            return result;
        }
        toggleCollapsed(element, recursive = false) {
            return this.a.toggleCollapsed(this.A(element), recursive);
        }
        expandAll() {
            this.a.expandAll();
        }
        collapseAll() {
            this.a.collapseAll();
        }
        isCollapsible(element) {
            return this.a.isCollapsible(this.A(element));
        }
        isCollapsed(element) {
            return this.a.isCollapsed(this.A(element));
        }
        triggerTypeNavigation() {
            this.a.triggerTypeNavigation();
        }
        openFind() {
            this.a.openFind();
        }
        closeFind() {
            this.a.closeFind();
        }
        refilter() {
            this.a.refilter();
        }
        setAnchor(element) {
            this.a.setAnchor(typeof element === 'undefined' ? undefined : this.A(element));
        }
        getAnchor() {
            const node = this.a.getAnchor();
            return node?.element;
        }
        setSelection(elements, browserEvent) {
            const nodes = elements.map(e => this.A(e));
            this.a.setSelection(nodes, browserEvent);
        }
        getSelection() {
            const nodes = this.a.getSelection();
            return nodes.map(n => n.element);
        }
        setFocus(elements, browserEvent) {
            const nodes = elements.map(e => this.A(e));
            this.a.setFocus(nodes, browserEvent);
        }
        focusNext(n = 1, loop = false, browserEvent) {
            this.a.focusNext(n, loop, browserEvent);
        }
        focusPrevious(n = 1, loop = false, browserEvent) {
            this.a.focusPrevious(n, loop, browserEvent);
        }
        focusNextPage(browserEvent) {
            return this.a.focusNextPage(browserEvent);
        }
        focusPreviousPage(browserEvent) {
            return this.a.focusPreviousPage(browserEvent);
        }
        focusLast(browserEvent) {
            this.a.focusLast(browserEvent);
        }
        focusFirst(browserEvent) {
            this.a.focusFirst(browserEvent);
        }
        getFocus() {
            const nodes = this.a.getFocus();
            return nodes.map(n => n.element);
        }
        reveal(element, relativeTop) {
            this.a.reveal(this.A(element), relativeTop);
        }
        getRelativeTop(element) {
            return this.a.getRelativeTop(this.A(element));
        }
        // Tree navigation
        getParentElement(element) {
            const node = this.a.getParentElement(this.A(element));
            return (node && node.element);
        }
        getFirstElementChild(element = this.b.element) {
            const dataNode = this.A(element);
            const node = this.a.getFirstElementChild(dataNode === this.b ? null : dataNode);
            return (node && node.element);
        }
        // Implementation
        A(element) {
            const node = this.d.get((element === this.b.element ? null : element));
            if (!node) {
                throw new tree_1.$9R(this.u, `Data tree node not found: ${element}`);
            }
            return node;
        }
        async B(node, recursive, viewStateContext, options) {
            await this.C(node, recursive, viewStateContext);
            this.I(node, viewStateContext, options);
        }
        async C(node, recursive, viewStateContext) {
            let result;
            this.h.forEach((refreshPromise, refreshNode) => {
                if (!result && intersects(refreshNode, node)) {
                    result = refreshPromise.then(() => this.C(node, recursive, viewStateContext));
                }
            });
            if (result) {
                return result;
            }
            if (node !== this.b) {
                const treeNode = this.a.getNode(node);
                if (treeNode.collapsed) {
                    node.hasChildren = !!this.w.hasChildren(node.element);
                    node.stale = true;
                    return;
                }
            }
            return this.D(node, recursive, viewStateContext);
        }
        async D(node, recursive, viewStateContext) {
            let done;
            node.refreshPromise = new Promise(c => done = c);
            this.h.set(node, node.refreshPromise);
            node.refreshPromise.finally(() => {
                node.refreshPromise = undefined;
                this.h.delete(node);
            });
            try {
                const childrenToRefresh = await this.E(node, recursive, viewStateContext);
                node.stale = false;
                await async_1.Promises.settled(childrenToRefresh.map(child => this.D(child, recursive, viewStateContext)));
            }
            finally {
                done();
            }
        }
        async E(node, recursive, viewStateContext) {
            node.hasChildren = !!this.w.hasChildren(node.element);
            let childrenPromise;
            if (!node.hasChildren) {
                childrenPromise = Promise.resolve(iterator_1.Iterable.empty());
            }
            else {
                const children = this.F(node);
                if ((0, types_1.$of)(children)) {
                    childrenPromise = Promise.resolve(children);
                }
                else {
                    const slowTimeout = (0, async_1.$Hg)(800);
                    slowTimeout.then(() => {
                        node.slow = true;
                        this.p.fire(node);
                    }, _ => null);
                    childrenPromise = children.finally(() => slowTimeout.cancel());
                }
            }
            try {
                const children = await childrenPromise;
                return this.H(node, children, recursive, viewStateContext);
            }
            catch (err) {
                if (node !== this.b && this.a.hasElement(node)) {
                    this.a.collapse(node);
                }
                if ((0, errors_1.$2)(err)) {
                    return [];
                }
                throw err;
            }
            finally {
                if (node.slow) {
                    node.slow = false;
                    this.p.fire(node);
                }
            }
        }
        F(node) {
            let result = this.j.get(node);
            if (result) {
                return result;
            }
            const children = this.w.getChildren(node.element);
            if ((0, types_1.$of)(children)) {
                return this.K(children);
            }
            else {
                result = (0, async_1.$ug)(async () => this.K(await children));
                this.j.set(node, result);
                return result.finally(() => { this.j.delete(node); });
            }
        }
        G({ node, deep }) {
            if (node.element === null) {
                return;
            }
            if (!node.collapsed && node.element.stale) {
                if (deep) {
                    this.collapse(node.element.element);
                }
                else {
                    this.B(node.element, false)
                        .catch(errors_1.$Y);
                }
            }
        }
        H(node, childrenElementsIterable, recursive, viewStateContext) {
            const childrenElements = [...childrenElementsIterable];
            // perf: if the node was and still is a leaf, avoid all this hassle
            if (node.children.length === 0 && childrenElements.length === 0) {
                return [];
            }
            const nodesToForget = new Map();
            const childrenTreeNodesById = new Map();
            for (const child of node.children) {
                nodesToForget.set(child.element, child);
                if (this.k) {
                    const collapsed = this.a.isCollapsed(child);
                    childrenTreeNodesById.set(child.id, { node: child, collapsed });
                }
            }
            const childrenToRefresh = [];
            const children = childrenElements.map(element => {
                const hasChildren = !!this.w.hasChildren(element);
                if (!this.k) {
                    const asyncDataTreeNode = createAsyncDataTreeNode({ element, parent: node, hasChildren });
                    if (hasChildren && this.g && !this.g(element)) {
                        asyncDataTreeNode.collapsedByDefault = false;
                        childrenToRefresh.push(asyncDataTreeNode);
                    }
                    return asyncDataTreeNode;
                }
                const id = this.k.getId(element).toString();
                const result = childrenTreeNodesById.get(id);
                if (result) {
                    const asyncDataTreeNode = result.node;
                    nodesToForget.delete(asyncDataTreeNode.element);
                    this.d.delete(asyncDataTreeNode.element);
                    this.d.set(element, asyncDataTreeNode);
                    asyncDataTreeNode.element = element;
                    asyncDataTreeNode.hasChildren = hasChildren;
                    if (recursive) {
                        if (result.collapsed) {
                            asyncDataTreeNode.children.forEach(node => dfs(node, node => this.d.delete(node.element)));
                            asyncDataTreeNode.children.splice(0, asyncDataTreeNode.children.length);
                            asyncDataTreeNode.stale = true;
                        }
                        else {
                            childrenToRefresh.push(asyncDataTreeNode);
                        }
                    }
                    else if (hasChildren && this.g && !this.g(element)) {
                        asyncDataTreeNode.collapsedByDefault = false;
                        childrenToRefresh.push(asyncDataTreeNode);
                    }
                    return asyncDataTreeNode;
                }
                const childAsyncDataTreeNode = createAsyncDataTreeNode({ element, parent: node, id, hasChildren });
                if (viewStateContext && viewStateContext.viewState.focus && viewStateContext.viewState.focus.indexOf(id) > -1) {
                    viewStateContext.focus.push(childAsyncDataTreeNode);
                }
                if (viewStateContext && viewStateContext.viewState.selection && viewStateContext.viewState.selection.indexOf(id) > -1) {
                    viewStateContext.selection.push(childAsyncDataTreeNode);
                }
                if (viewStateContext && viewStateContext.viewState.expanded && viewStateContext.viewState.expanded.indexOf(id) > -1) {
                    childrenToRefresh.push(childAsyncDataTreeNode);
                }
                else if (hasChildren && this.g && !this.g(element)) {
                    childAsyncDataTreeNode.collapsedByDefault = false;
                    childrenToRefresh.push(childAsyncDataTreeNode);
                }
                return childAsyncDataTreeNode;
            });
            for (const node of nodesToForget.values()) {
                dfs(node, node => this.d.delete(node.element));
            }
            for (const child of children) {
                this.d.set(child.element, child);
            }
            node.children.splice(0, node.children.length, ...children);
            // TODO@joao this doesn't take filter into account
            if (node !== this.b && this.m && children.length === 1 && childrenToRefresh.length === 0) {
                children[0].collapsedByDefault = false;
                childrenToRefresh.push(children[0]);
            }
            return childrenToRefresh;
        }
        I(node, viewStateContext, options) {
            const children = node.children.map(node => this.J(node, viewStateContext));
            const objectTreeOptions = options && {
                ...options,
                diffIdentityProvider: options.diffIdentityProvider && {
                    getId(node) {
                        return options.diffIdentityProvider.getId(node.element);
                    }
                }
            };
            this.a.setChildren(node === this.b ? null : node, children, objectTreeOptions);
            if (node !== this.b) {
                this.a.setCollapsible(node, node.hasChildren);
            }
            this.o.fire();
        }
        J(node, viewStateContext) {
            if (node.stale) {
                return {
                    element: node,
                    collapsible: node.hasChildren,
                    collapsed: true
                };
            }
            let collapsed;
            if (viewStateContext && viewStateContext.viewState.expanded && node.id && viewStateContext.viewState.expanded.indexOf(node.id) > -1) {
                collapsed = false;
            }
            else {
                collapsed = node.collapsedByDefault;
            }
            node.collapsedByDefault = undefined;
            return {
                element: node,
                children: node.hasChildren ? iterator_1.Iterable.map(node.children, child => this.J(child, viewStateContext)) : [],
                collapsible: node.hasChildren,
                collapsed
            };
        }
        K(children) {
            if (this.f) {
                children = [...children].sort(this.f.compare.bind(this.f));
            }
            return children;
        }
        // view state
        getViewState() {
            if (!this.k) {
                throw new tree_1.$9R(this.u, 'Can\'t get tree view state without an identity provider');
            }
            const getId = (element) => this.k.getId(element).toString();
            const focus = this.getFocus().map(getId);
            const selection = this.getSelection().map(getId);
            const expanded = [];
            const root = this.a.getNode();
            const stack = [root];
            while (stack.length > 0) {
                const node = stack.pop();
                if (node !== root && node.collapsible && !node.collapsed) {
                    expanded.push(getId(node.element.element));
                }
                stack.push(...node.children);
            }
            return { focus, selection, expanded, scrollTop: this.scrollTop };
        }
        dispose() {
            this.t.dispose();
            this.a.dispose();
        }
    }
    exports.$oS = $oS;
    class CompressibleAsyncDataTreeNodeWrapper {
        get element() {
            return {
                elements: this.a.element.elements.map(e => e.element),
                incompressible: this.a.element.incompressible
            };
        }
        get children() { return this.a.children.map(node => new CompressibleAsyncDataTreeNodeWrapper(node)); }
        get depth() { return this.a.depth; }
        get visibleChildrenCount() { return this.a.visibleChildrenCount; }
        get visibleChildIndex() { return this.a.visibleChildIndex; }
        get collapsible() { return this.a.collapsible; }
        get collapsed() { return this.a.collapsed; }
        get visible() { return this.a.visible; }
        get filterData() { return this.a.filterData; }
        constructor(a) {
            this.a = a;
        }
    }
    class CompressibleAsyncDataTreeRenderer {
        constructor(d, f, g, onDidChangeTwistieState) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.onDidChangeTwistieState = onDidChangeTwistieState;
            this.a = new Map();
            this.b = [];
            this.templateId = d.templateId;
        }
        renderTemplate(container) {
            const templateData = this.d.renderTemplate(container);
            return { templateData };
        }
        renderElement(node, index, templateData, height) {
            this.d.renderElement(this.f.map(node), index, templateData.templateData, height);
        }
        renderCompressedElements(node, index, templateData, height) {
            this.d.renderCompressedElements(this.g().map(node), index, templateData.templateData, height);
        }
        renderTwistie(element, twistieElement) {
            if (element.slow) {
                twistieElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.treeItemLoading));
                return true;
            }
            else {
                twistieElement.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.treeItemLoading));
                return false;
            }
        }
        disposeElement(node, index, templateData, height) {
            this.d.disposeElement?.(this.f.map(node), index, templateData.templateData, height);
        }
        disposeCompressedElements(node, index, templateData, height) {
            this.d.disposeCompressedElements?.(this.g().map(node), index, templateData.templateData, height);
        }
        disposeTemplate(templateData) {
            this.d.disposeTemplate(templateData.templateData);
        }
        dispose() {
            this.a.clear();
            this.b = (0, lifecycle_1.$fc)(this.b);
        }
    }
    function asCompressibleObjectTreeOptions(options) {
        const objectTreeOptions = options && asObjectTreeOptions(options);
        return objectTreeOptions && {
            ...objectTreeOptions,
            keyboardNavigationLabelProvider: objectTreeOptions.keyboardNavigationLabelProvider && {
                ...objectTreeOptions.keyboardNavigationLabelProvider,
                getCompressedNodeKeyboardNavigationLabel(els) {
                    return options.keyboardNavigationLabelProvider.getCompressedNodeKeyboardNavigationLabel(els.map(e => e.element));
                }
            }
        };
    }
    class $pS extends $oS {
        constructor(user, container, virtualDelegate, L, renderers, dataSource, options = {}) {
            super(user, container, virtualDelegate, renderers, dataSource, options);
            this.L = L;
            this.v = new tree_1.$0R(node => new CompressibleAsyncDataTreeNodeWrapper(node));
            this.x = options.filter;
        }
        y(user, container, delegate, renderers, options) {
            const objectTreeDelegate = new abstractTree_1.$bS(delegate);
            const objectTreeRenderers = renderers.map(r => new CompressibleAsyncDataTreeRenderer(r, this.q, () => this.v, this.p.event));
            const objectTreeOptions = asCompressibleObjectTreeOptions(options) || {};
            return new objectTree_1.$nS(user, container, objectTreeDelegate, objectTreeRenderers, objectTreeOptions);
        }
        J(node, viewStateContext) {
            return {
                incompressible: this.L.isIncompressible(node.element),
                ...super.J(node, viewStateContext)
            };
        }
        updateOptions(options = {}) {
            this.a.updateOptions(options);
        }
        getViewState() {
            if (!this.k) {
                throw new tree_1.$9R(this.u, 'Can\'t get tree view state without an identity provider');
            }
            const getId = (element) => this.k.getId(element).toString();
            const focus = this.getFocus().map(getId);
            const selection = this.getSelection().map(getId);
            const expanded = [];
            const root = this.a.getCompressedTreeNode();
            const stack = [root];
            while (stack.length > 0) {
                const node = stack.pop();
                if (node !== root && node.collapsible && !node.collapsed) {
                    for (const asyncNode of node.element.elements) {
                        expanded.push(getId(asyncNode.element));
                    }
                }
                stack.push(...node.children);
            }
            return { focus, selection, expanded, scrollTop: this.scrollTop };
        }
        I(node, viewStateContext) {
            if (!this.k) {
                return super.I(node, viewStateContext);
            }
            // Preserve traits across compressions. Hacky but does the trick.
            // This is hard to fix properly since it requires rewriting the traits
            // across trees and lists. Let's just keep it this way for now.
            const getId = (element) => this.k.getId(element).toString();
            const getUncompressedIds = (nodes) => {
                const result = new Set();
                for (const node of nodes) {
                    const compressedNode = this.a.getCompressedTreeNode(node === this.b ? null : node);
                    if (!compressedNode.element) {
                        continue;
                    }
                    for (const node of compressedNode.element.elements) {
                        result.add(getId(node.element));
                    }
                }
                return result;
            };
            const oldSelection = getUncompressedIds(this.a.getSelection());
            const oldFocus = getUncompressedIds(this.a.getFocus());
            super.I(node, viewStateContext);
            const selection = this.getSelection();
            let didChangeSelection = false;
            const focus = this.getFocus();
            let didChangeFocus = false;
            const visit = (node) => {
                const compressedNode = node.element;
                if (compressedNode) {
                    for (let i = 0; i < compressedNode.elements.length; i++) {
                        const id = getId(compressedNode.elements[i].element);
                        const element = compressedNode.elements[compressedNode.elements.length - 1].element;
                        // github.com/microsoft/vscode/issues/85938
                        if (oldSelection.has(id) && selection.indexOf(element) === -1) {
                            selection.push(element);
                            didChangeSelection = true;
                        }
                        if (oldFocus.has(id) && focus.indexOf(element) === -1) {
                            focus.push(element);
                            didChangeFocus = true;
                        }
                    }
                }
                node.children.forEach(visit);
            };
            visit(this.a.getCompressedTreeNode(node === this.b ? null : node));
            if (didChangeSelection) {
                this.setSelection(selection);
            }
            if (didChangeFocus) {
                this.setFocus(focus);
            }
        }
        // For compressed async data trees, `TreeVisibility.Recurse` doesn't currently work
        // and we have to filter everything beforehand
        // Related to #85193 and #85835
        K(children) {
            if (this.x) {
                children = iterator_1.Iterable.filter(children, e => {
                    const result = this.x.filter(e, 1 /* TreeVisibility.Visible */);
                    const visibility = getVisibility(result);
                    if (visibility === 2 /* TreeVisibility.Recurse */) {
                        throw new Error('Recursive tree visibility not supported in async data compressed trees');
                    }
                    return visibility === 1 /* TreeVisibility.Visible */;
                });
            }
            return super.K(children);
        }
    }
    exports.$pS = $pS;
    function getVisibility(filterResult) {
        if (typeof filterResult === 'boolean') {
            return filterResult ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */;
        }
        else if ((0, indexTreeModel_1.$$R)(filterResult)) {
            return (0, indexTreeModel_1.$_R)(filterResult.visibility);
        }
        else {
            return (0, indexTreeModel_1.$_R)(filterResult);
        }
    }
});
//# sourceMappingURL=asyncDataTree.js.map