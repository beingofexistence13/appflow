/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/api/common/extHostTreeViews", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/base/common/async", "vs/workbench/api/common/extHostTypes", "vs/base/common/types", "vs/base/common/arrays", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/htmlContent", "vs/base/common/cancellation", "vs/editor/common/services/treeViewsDnd", "vs/workbench/services/extensions/common/extensions"], function (require, exports, nls_1, resources_1, uri_1, event_1, lifecycle_1, views_1, async_1, extHostTypes, types_1, arrays_1, extHostTypeConverters_1, htmlContent_1, cancellation_1, treeViewsDnd_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8bc = void 0;
    function toTreeItemLabel(label, extension) {
        if ((0, types_1.$jf)(label)) {
            return { label };
        }
        if (label
            && typeof label === 'object'
            && typeof label.label === 'string') {
            let highlights = undefined;
            if (Array.isArray(label.highlights)) {
                highlights = label.highlights.filter((highlight => highlight.length === 2 && typeof highlight[0] === 'number' && typeof highlight[1] === 'number'));
                highlights = highlights.length ? highlights : undefined;
            }
            return { label: label.label, highlights };
        }
        return undefined;
    }
    class $8bc extends lifecycle_1.$kc {
        constructor(f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = new Map();
            this.b = new treeViewsDnd_1.$l7();
            function isTreeViewConvertableItem(arg) {
                return arg && arg.$treeViewId && (arg.$treeItemHandle || arg.$selectedTreeItems || arg.$focusedTreeItem);
            }
            g.registerArgumentProcessor({
                processArgument: arg => {
                    if (isTreeViewConvertableItem(arg)) {
                        return this.r(arg);
                    }
                    else if (Array.isArray(arg) && (arg.length > 0)) {
                        return arg.map(item => {
                            if (isTreeViewConvertableItem(item)) {
                                return this.r(item);
                            }
                            return item;
                        });
                    }
                    return arg;
                }
            });
        }
        registerTreeDataProvider(id, treeDataProvider, extension) {
            const treeView = this.createTreeView(id, { treeDataProvider }, extension);
            return { dispose: () => treeView.dispose() };
        }
        createTreeView(viewId, options, extension) {
            if (!options || !options.treeDataProvider) {
                throw new Error('Options with treeDataProvider is mandatory');
            }
            const dropMimeTypes = options.dragAndDropController?.dropMimeTypes ?? [];
            const dragMimeTypes = options.dragAndDropController?.dragMimeTypes ?? [];
            const hasHandleDrag = !!options.dragAndDropController?.handleDrag;
            const hasHandleDrop = !!options.dragAndDropController?.handleDrop;
            const treeView = this.m(viewId, options, extension);
            const proxyOptions = { showCollapseAll: !!options.showCollapseAll, canSelectMany: !!options.canSelectMany, dropMimeTypes, dragMimeTypes, hasHandleDrag, hasHandleDrop, manuallyManageCheckboxes: !!options.manageCheckboxStateManually };
            const registerPromise = this.f.$registerTreeViewDataProvider(viewId, proxyOptions);
            const view = {
                get onDidCollapseElement() { return treeView.onDidCollapseElement; },
                get onDidExpandElement() { return treeView.onDidExpandElement; },
                get selection() { return treeView.selectedElements; },
                get onDidChangeSelection() { return treeView.onDidChangeSelection; },
                get activeItem() {
                    (0, extensions_1.$QF)(extension, 'treeViewActiveItem');
                    return treeView.focusedElement;
                },
                get onDidChangeActiveItem() {
                    (0, extensions_1.$QF)(extension, 'treeViewActiveItem');
                    return treeView.onDidChangeActiveItem;
                },
                get visible() { return treeView.visible; },
                get onDidChangeVisibility() { return treeView.onDidChangeVisibility; },
                get onDidChangeCheckboxState() {
                    return treeView.onDidChangeCheckboxState;
                },
                get message() { return treeView.message; },
                set message(message) {
                    if ((0, htmlContent_1.$Zj)(message)) {
                        (0, extensions_1.$QF)(extension, 'treeViewMarkdownMessage');
                    }
                    treeView.message = message;
                },
                get title() { return treeView.title; },
                set title(title) {
                    treeView.title = title;
                },
                get description() {
                    return treeView.description;
                },
                set description(description) {
                    treeView.description = description;
                },
                get badge() {
                    return treeView.badge;
                },
                set badge(badge) {
                    if ((badge !== undefined) && extHostTypes.ViewBadge.isViewBadge(badge)) {
                        treeView.badge = {
                            value: Math.floor(Math.abs(badge.value)),
                            tooltip: badge.tooltip
                        };
                    }
                    else if (badge === undefined) {
                        treeView.badge = undefined;
                    }
                },
                reveal: (element, options) => {
                    return treeView.reveal(element, options);
                },
                dispose: async () => {
                    // Wait for the registration promise to finish before doing the dispose.
                    await registerPromise;
                    this.a.delete(viewId);
                    treeView.dispose();
                }
            };
            this.B(view);
            return view;
        }
        $getChildren(treeViewId, treeItemHandle) {
            const treeView = this.a.get(treeViewId);
            if (!treeView) {
                return Promise.reject(new views_1.$bF(treeViewId));
            }
            return treeView.getChildren(treeItemHandle);
        }
        async $handleDrop(destinationViewId, requestId, treeDataTransferDTO, targetItemHandle, token, operationUuid, sourceViewId, sourceTreeItemHandles) {
            const treeView = this.a.get(destinationViewId);
            if (!treeView) {
                return Promise.reject(new views_1.$bF(destinationViewId));
            }
            const treeDataTransfer = extHostTypeConverters_1.DataTransfer.toDataTransfer(treeDataTransferDTO, async (dataItemIndex) => {
                return (await this.f.$resolveDropFileData(destinationViewId, requestId, dataItemIndex)).buffer;
            });
            if ((sourceViewId === destinationViewId) && sourceTreeItemHandles) {
                await this.j(treeDataTransfer, treeView, sourceTreeItemHandles, token, operationUuid);
            }
            return treeView.onDrop(treeDataTransfer, targetItemHandle, token);
        }
        async j(treeDataTransfer, treeView, sourceTreeItemHandles, token, operationUuid) {
            const existingTransferOperation = this.b.removeDragOperationTransfer(operationUuid);
            if (existingTransferOperation) {
                (await existingTransferOperation)?.forEach((value, key) => {
                    if (value) {
                        treeDataTransfer.set(key, value);
                    }
                });
            }
            else if (operationUuid && treeView.handleDrag) {
                const willDropPromise = treeView.handleDrag(sourceTreeItemHandles, treeDataTransfer, token);
                this.b.addDragOperationTransfer(operationUuid, willDropPromise);
                await willDropPromise;
            }
            return treeDataTransfer;
        }
        async $handleDrag(sourceViewId, sourceTreeItemHandles, operationUuid, token) {
            const treeView = this.a.get(sourceViewId);
            if (!treeView) {
                return Promise.reject(new views_1.$bF(sourceViewId));
            }
            const treeDataTransfer = await this.j(new extHostTypes.$TK(), treeView, sourceTreeItemHandles, token, operationUuid);
            if (!treeDataTransfer || token.isCancellationRequested) {
                return;
            }
            return extHostTypeConverters_1.DataTransfer.from(treeDataTransfer);
        }
        async $hasResolve(treeViewId) {
            const treeView = this.a.get(treeViewId);
            if (!treeView) {
                throw new views_1.$bF(treeViewId);
            }
            return treeView.hasResolve;
        }
        $resolve(treeViewId, treeItemHandle, token) {
            const treeView = this.a.get(treeViewId);
            if (!treeView) {
                throw new views_1.$bF(treeViewId);
            }
            return treeView.resolveTreeItem(treeItemHandle, token);
        }
        $setExpanded(treeViewId, treeItemHandle, expanded) {
            const treeView = this.a.get(treeViewId);
            if (!treeView) {
                throw new views_1.$bF(treeViewId);
            }
            treeView.setExpanded(treeItemHandle, expanded);
        }
        $setSelectionAndFocus(treeViewId, selectedHandles, focusedHandle) {
            const treeView = this.a.get(treeViewId);
            if (!treeView) {
                throw new views_1.$bF(treeViewId);
            }
            treeView.setSelectionAndFocus(selectedHandles, focusedHandle);
        }
        $setVisible(treeViewId, isVisible) {
            const treeView = this.a.get(treeViewId);
            if (!treeView) {
                if (!isVisible) {
                    return;
                }
                throw new views_1.$bF(treeViewId);
            }
            treeView.setVisible(isVisible);
        }
        $changeCheckboxState(treeViewId, checkboxUpdate) {
            const treeView = this.a.get(treeViewId);
            if (!treeView) {
                throw new views_1.$bF(treeViewId);
            }
            treeView.setCheckboxState(checkboxUpdate);
        }
        m(id, options, extension) {
            const treeView = this.B(new ExtHostTreeView(id, options, this.f, this.g.converter, this.h, extension));
            this.a.set(id, treeView);
            return treeView;
        }
        r(arg) {
            const treeView = this.a.get(arg.$treeViewId);
            if (treeView && '$treeItemHandle' in arg) {
                return treeView.getExtensionElement(arg.$treeItemHandle);
            }
            if (treeView && '$focusedTreeItem' in arg && arg.$focusedTreeItem) {
                return treeView.focusedElement;
            }
            return null;
        }
    }
    exports.$8bc = $8bc;
    class ExtHostTreeView extends lifecycle_1.$kc {
        static { this.a = '0'; }
        static { this.b = '1'; }
        get visible() { return this.r; }
        get selectedElements() { return this.s.map(handle => this.getExtensionElement(handle)).filter(element => !(0, types_1.$sf)(element)); }
        get focusedElement() { return (this.t ? this.getExtensionElement(this.t) : undefined); }
        constructor(I, options, J, L, M, N) {
            super();
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.h = undefined;
            this.j = new Map();
            this.m = new Map();
            this.r = false;
            this.s = [];
            this.t = undefined;
            this.u = this.B(new event_1.$fd());
            this.onDidExpandElement = this.u.event;
            this.w = this.B(new event_1.$fd());
            this.onDidCollapseElement = this.w.event;
            this.y = this.B(new event_1.$fd());
            this.onDidChangeSelection = this.y.event;
            this.z = this.B(new event_1.$fd());
            this.onDidChangeActiveItem = this.z.event;
            this.C = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.C.event;
            this.D = this.B(new event_1.$fd());
            this.onDidChangeCheckboxState = this.D.event;
            this.F = this.B(new event_1.$fd());
            this.G = Promise.resolve();
            this.H = Promise.resolve();
            this.O = '';
            this.P = '';
            this.Z = new cancellation_1.$pd();
            if (N.contributes && N.contributes.views) {
                for (const location in N.contributes.views) {
                    for (const view of N.contributes.views[location]) {
                        if (view.id === I) {
                            this.P = view.name;
                        }
                    }
                }
            }
            this.f = options.treeDataProvider;
            this.g = options.dragAndDropController;
            if (this.f.onDidChangeTreeData) {
                this.B(this.f.onDidChangeTreeData(elementOrElements => this.F.fire({ message: false, element: elementOrElements })));
            }
            let refreshingPromise;
            let promiseCallback;
            const onDidChangeData = event_1.Event.debounce(this.F.event, (result, current) => {
                if (!result) {
                    result = { message: false, elements: [] };
                }
                if (current.element !== false) {
                    if (!refreshingPromise) {
                        // New refresh has started
                        refreshingPromise = new Promise(c => promiseCallback = c);
                        this.G = this.G.then(() => refreshingPromise);
                    }
                    if (Array.isArray(current.element)) {
                        result.elements.push(...current.element);
                    }
                    else {
                        result.elements.push(current.element);
                    }
                }
                if (current.message) {
                    result.message = true;
                }
                return result;
            }, 200, true);
            this.B(onDidChangeData(({ message, elements }) => {
                if (elements.length) {
                    this.H = this.H.then(() => {
                        const _promiseCallback = promiseCallback;
                        refreshingPromise = null;
                        return this.$(elements).then(() => _promiseCallback());
                    });
                }
                if (message) {
                    this.J.$setMessage(this.I, extHostTypeConverters_1.MarkdownString.fromStrict(this.O) ?? '');
                }
            }));
        }
        async getChildren(parentHandle) {
            const parentElement = parentHandle ? this.getExtensionElement(parentHandle) : undefined;
            if (parentHandle && !parentElement) {
                this.M.error(`No tree item with id \'${parentHandle}\' found.`);
                return Promise.resolve([]);
            }
            let childrenNodes = this.X(parentHandle); // Get it from cache
            if (!childrenNodes) {
                childrenNodes = await this.Y(parentElement);
            }
            return childrenNodes ? childrenNodes.map(n => n.item) : undefined;
        }
        getExtensionElement(treeItemHandle) {
            return this.j.get(treeItemHandle);
        }
        reveal(element, options) {
            options = options ? options : { select: true, focus: false };
            const select = (0, types_1.$sf)(options.select) ? true : options.select;
            const focus = (0, types_1.$sf)(options.focus) ? false : options.focus;
            const expand = (0, types_1.$sf)(options.expand) ? false : options.expand;
            if (typeof this.f.getParent !== 'function') {
                return Promise.reject(new Error(`Required registered TreeDataProvider to implement 'getParent' method to access 'reveal' method`));
            }
            if (element) {
                return this.G
                    .then(() => this.S(element))
                    .then(parentChain => this.W(element, parentChain[parentChain.length - 1])
                    .then(treeNode => this.J.$reveal(this.I, { item: treeNode.item, parentChain: parentChain.map(p => p.item) }, { select, focus, expand })), error => this.M.error(error));
            }
            else {
                return this.J.$reveal(this.I, undefined, { select, focus, expand });
            }
        }
        get message() {
            return this.O;
        }
        set message(message) {
            this.O = message;
            this.F.fire({ message: true, element: false });
        }
        get title() {
            return this.P;
        }
        set title(title) {
            this.P = title;
            this.J.$setTitle(this.I, title, this.Q);
        }
        get description() {
            return this.Q;
        }
        set description(description) {
            this.Q = description;
            this.J.$setTitle(this.I, this.P, description);
        }
        get badge() {
            return this.R;
        }
        set badge(badge) {
            if (this.R?.value === badge?.value &&
                this.R?.tooltip === badge?.tooltip) {
                return;
            }
            this.R = extHostTypeConverters_1.ViewBadge.from(badge);
            this.J.$setBadge(this.I, badge);
        }
        setExpanded(treeItemHandle, expanded) {
            const element = this.getExtensionElement(treeItemHandle);
            if (element) {
                if (expanded) {
                    this.u.fire(Object.freeze({ element }));
                }
                else {
                    this.w.fire(Object.freeze({ element }));
                }
            }
        }
        setSelectionAndFocus(selectedHandles, focusedHandle) {
            const changedSelection = !(0, arrays_1.$sb)(this.s, selectedHandles);
            this.s = selectedHandles;
            const changedFocus = this.t !== focusedHandle;
            this.t = focusedHandle;
            if (changedSelection) {
                this.y.fire(Object.freeze({ selection: this.selectedElements }));
            }
            if (changedFocus) {
                this.z.fire(Object.freeze({ activeItem: this.focusedElement }));
            }
        }
        setVisible(visible) {
            if (visible !== this.r) {
                this.r = visible;
                this.C.fire(Object.freeze({ visible: this.r }));
            }
        }
        async setCheckboxState(checkboxUpdates) {
            const items = (await Promise.all(checkboxUpdates.map(async (checkboxUpdate) => {
                const extensionItem = this.getExtensionElement(checkboxUpdate.treeItemHandle);
                if (extensionItem) {
                    return {
                        extensionItem: extensionItem,
                        treeItem: await this.f.getTreeItem(extensionItem),
                        newState: checkboxUpdate.newState ? extHostTypes.TreeItemCheckboxState.Checked : extHostTypes.TreeItemCheckboxState.Unchecked
                    };
                }
                return Promise.resolve(undefined);
            }))).filter((item) => item !== undefined);
            items.forEach(item => {
                item.treeItem.checkboxState = item.newState ? extHostTypes.TreeItemCheckboxState.Checked : extHostTypes.TreeItemCheckboxState.Unchecked;
            });
            this.D.fire({ items: items.map(item => [item.extensionItem, item.newState]) });
        }
        async handleDrag(sourceTreeItemHandles, treeDataTransfer, token) {
            const extensionTreeItems = [];
            for (const sourceHandle of sourceTreeItemHandles) {
                const extensionItem = this.getExtensionElement(sourceHandle);
                if (extensionItem) {
                    extensionTreeItems.push(extensionItem);
                }
            }
            if (!this.g?.handleDrag || (extensionTreeItems.length === 0)) {
                return;
            }
            await this.g.handleDrag(extensionTreeItems, treeDataTransfer, token);
            return treeDataTransfer;
        }
        get hasHandleDrag() {
            return !!this.g?.handleDrag;
        }
        async onDrop(treeDataTransfer, targetHandleOrNode, token) {
            const target = targetHandleOrNode ? this.getExtensionElement(targetHandleOrNode) : undefined;
            if ((!target && targetHandleOrNode) || !this.g?.handleDrop) {
                return;
            }
            return (0, async_1.$zg)(() => this.g?.handleDrop
                ? this.g.handleDrop(target, treeDataTransfer, token)
                : undefined);
        }
        get hasResolve() {
            return !!this.f.resolveTreeItem;
        }
        async resolveTreeItem(treeItemHandle, token) {
            if (!this.f.resolveTreeItem) {
                return;
            }
            const element = this.j.get(treeItemHandle);
            if (element) {
                const node = this.m.get(element);
                if (node) {
                    const resolve = await this.f.resolveTreeItem(node.extensionItem, element, token) ?? node.extensionItem;
                    this.hb(resolve);
                    // Resolvable elements. Currently only tooltip and command.
                    node.item.tooltip = this.eb(resolve.tooltip);
                    node.item.command = this.fb(node.disposableStore, resolve.command);
                    return node.item;
                }
            }
            return;
        }
        S(element) {
            return this.U(element)
                .then((parent) => {
                if (!parent) {
                    return Promise.resolve([]);
                }
                return this.S(parent)
                    .then(result => this.W(parent, result[result.length - 1])
                    .then(parentNode => {
                    result.push(parentNode);
                    return result;
                }));
            });
        }
        U(element) {
            const node = this.m.get(element);
            if (node) {
                return Promise.resolve(node.parent ? this.j.get(node.parent.item.handle) : undefined);
            }
            return (0, async_1.$zg)(() => this.f.getParent(element));
        }
        W(element, parent) {
            const node = this.m.get(element);
            if (node) {
                return Promise.resolve(node);
            }
            return (0, async_1.$zg)(() => this.f.getTreeItem(element))
                .then(extTreeItem => this.kb(element, extTreeItem, parent, true))
                .then(handle => this.getChildren(parent ? parent.item.handle : undefined)
                .then(() => {
                const cachedElement = this.getExtensionElement(handle);
                if (cachedElement) {
                    const node = this.m.get(cachedElement);
                    if (node) {
                        return Promise.resolve(node);
                    }
                }
                throw new Error(`Cannot resolve tree item for element ${handle} from extension ${this.N.identifier.value}`);
            }));
        }
        X(parentNodeOrHandle) {
            if (parentNodeOrHandle) {
                let parentNode;
                if (typeof parentNodeOrHandle === 'string') {
                    const parentElement = this.getExtensionElement(parentNodeOrHandle);
                    parentNode = parentElement ? this.m.get(parentElement) : undefined;
                }
                else {
                    parentNode = parentNodeOrHandle;
                }
                return parentNode ? parentNode.children || undefined : undefined;
            }
            return this.h;
        }
        async Y(parentElement) {
            // clear children cache
            this.rb(parentElement);
            const cts = new cancellation_1.$pd(this.Z.token);
            try {
                const parentNode = parentElement ? this.m.get(parentElement) : undefined;
                const elements = await this.f.getChildren(parentElement);
                if (cts.token.isCancellationRequested) {
                    return undefined;
                }
                const items = await Promise.all((0, arrays_1.$Fb)(elements || []).map(async (element) => {
                    const item = await this.f.getTreeItem(element);
                    return item && !cts.token.isCancellationRequested ? this.db(element, item, parentNode) : null;
                }));
                if (cts.token.isCancellationRequested) {
                    return undefined;
                }
                return (0, arrays_1.$Fb)(items);
            }
            finally {
                cts.dispose();
            }
        }
        $(elements) {
            const hasRoot = elements.some(element => !element);
            if (hasRoot) {
                // Cancel any pending children fetches
                this.Z.dispose(true);
                this.Z = new cancellation_1.$pd();
                this.tb(); // clear cache
                return this.J.$refresh(this.I);
            }
            else {
                const handlesToRefresh = this.ab(elements);
                if (handlesToRefresh.length) {
                    return this.bb(handlesToRefresh);
                }
            }
            return Promise.resolve(undefined);
        }
        ab(elements) {
            const elementsToUpdate = new Set();
            const elementNodes = elements.map(element => this.m.get(element));
            for (const elementNode of elementNodes) {
                if (elementNode && !elementsToUpdate.has(elementNode.item.handle)) {
                    // check if an ancestor of extElement is already in the elements list
                    let currentNode = elementNode;
                    while (currentNode && currentNode.parent && elementNodes.findIndex(node => currentNode && currentNode.parent && node && node.item.handle === currentNode.parent.item.handle) === -1) {
                        const parentElement = this.j.get(currentNode.parent.item.handle);
                        currentNode = parentElement ? this.m.get(parentElement) : undefined;
                    }
                    if (currentNode && !currentNode.parent) {
                        elementsToUpdate.add(elementNode.item.handle);
                    }
                }
            }
            const handlesToUpdate = [];
            // Take only top level elements
            elementsToUpdate.forEach((handle) => {
                const element = this.j.get(handle);
                if (element) {
                    const node = this.m.get(element);
                    if (node && (!node.parent || !elementsToUpdate.has(node.parent.item.handle))) {
                        handlesToUpdate.push(handle);
                    }
                }
            });
            return handlesToUpdate;
        }
        bb(itemHandles) {
            const itemsToRefresh = {};
            return Promise.all(itemHandles.map(treeItemHandle => this.cb(treeItemHandle)
                .then(node => {
                if (node) {
                    itemsToRefresh[treeItemHandle] = node.item;
                }
            })))
                .then(() => Object.keys(itemsToRefresh).length ? this.J.$refresh(this.I, itemsToRefresh) : undefined);
        }
        cb(treeItemHandle) {
            const extElement = this.getExtensionElement(treeItemHandle);
            if (extElement) {
                const existing = this.m.get(extElement);
                if (existing) {
                    this.rb(extElement); // clear children cache
                    return (0, async_1.$zg)(() => this.f.getTreeItem(extElement))
                        .then(extTreeItem => {
                        if (extTreeItem) {
                            const newNode = this.ib(extElement, extTreeItem, existing.parent);
                            this.pb(extElement, newNode, existing, existing.parent);
                            existing.dispose();
                            return newNode;
                        }
                        return null;
                    });
                }
            }
            return Promise.resolve(null);
        }
        db(element, extTreeItem, parentNode) {
            const node = this.ib(element, extTreeItem, parentNode);
            if (extTreeItem.id && this.j.has(node.item.handle)) {
                throw new Error((0, nls_1.localize)(0, null, extTreeItem.id));
            }
            this.ob(element, node);
            this.qb(node, parentNode);
            return node;
        }
        eb(tooltip) {
            if (extHostTypes.$qK.isMarkdownString(tooltip)) {
                return extHostTypeConverters_1.MarkdownString.from(tooltip);
            }
            return tooltip;
        }
        fb(disposable, command) {
            return command ? { ...this.L.toInternal(command, disposable), originalId: command.command } : undefined;
        }
        gb(extensionTreeItem) {
            if (extensionTreeItem.checkboxState === undefined) {
                return undefined;
            }
            let checkboxState;
            let tooltip = undefined;
            let accessibilityInformation = undefined;
            if (typeof extensionTreeItem.checkboxState === 'number') {
                checkboxState = extensionTreeItem.checkboxState;
            }
            else {
                checkboxState = extensionTreeItem.checkboxState.state;
                tooltip = extensionTreeItem.checkboxState.tooltip;
                accessibilityInformation = extensionTreeItem.checkboxState.accessibilityInformation;
            }
            return { isChecked: checkboxState === extHostTypes.TreeItemCheckboxState.Checked, tooltip, accessibilityInformation };
        }
        hb(extensionTreeItem) {
            if (!extHostTypes.$OK.isTreeItem(extensionTreeItem, this.N)) {
                throw new Error(`Extension ${this.N.identifier.value} has provided an invalid tree item.`);
            }
        }
        ib(element, extensionTreeItem, parent) {
            this.hb(extensionTreeItem);
            const disposableStore = this.B(new lifecycle_1.$jc());
            const handle = this.kb(element, extensionTreeItem, parent);
            const icon = this.lb(extensionTreeItem);
            const item = {
                handle,
                parentHandle: parent ? parent.item.handle : undefined,
                label: toTreeItemLabel(extensionTreeItem.label, this.N),
                description: extensionTreeItem.description,
                resourceUri: extensionTreeItem.resourceUri,
                tooltip: this.eb(extensionTreeItem.tooltip),
                command: this.fb(disposableStore, extensionTreeItem.command),
                contextValue: extensionTreeItem.contextValue,
                icon,
                iconDark: this.mb(extensionTreeItem) || icon,
                themeIcon: this.jb(extensionTreeItem),
                collapsibleState: (0, types_1.$sf)(extensionTreeItem.collapsibleState) ? extHostTypes.TreeItemCollapsibleState.None : extensionTreeItem.collapsibleState,
                accessibilityInformation: extensionTreeItem.accessibilityInformation,
                checkbox: this.gb(extensionTreeItem),
            };
            return {
                item,
                extensionItem: extensionTreeItem,
                parent,
                children: undefined,
                disposableStore,
                dispose() { disposableStore.dispose(); }
            };
        }
        jb(extensionTreeItem) {
            return extensionTreeItem.iconPath instanceof extHostTypes.$WK ? extensionTreeItem.iconPath : undefined;
        }
        kb(element, { id, label, resourceUri }, parent, returnFirst) {
            if (id) {
                return `${ExtHostTreeView.b}/${id}`;
            }
            const treeItemLabel = toTreeItemLabel(label, this.N);
            const prefix = parent ? parent.item.handle : ExtHostTreeView.a;
            let elementId = treeItemLabel ? treeItemLabel.label : resourceUri ? (0, resources_1.$fg)(resourceUri) : '';
            elementId = elementId.indexOf('/') !== -1 ? elementId.replace('/', '//') : elementId;
            const existingHandle = this.m.has(element) ? this.m.get(element).item.handle : undefined;
            const childrenNodes = (this.X(parent) || []);
            let handle;
            let counter = 0;
            do {
                handle = `${prefix}/${counter}:${elementId}`;
                if (returnFirst || !this.j.has(handle) || existingHandle === handle) {
                    // Return first if asked for or
                    // Return if handle does not exist or
                    // Return if handle is being reused
                    break;
                }
                counter++;
            } while (counter <= childrenNodes.length);
            return handle;
        }
        lb(extensionTreeItem) {
            if (extensionTreeItem.iconPath && !(extensionTreeItem.iconPath instanceof extHostTypes.$WK)) {
                if (typeof extensionTreeItem.iconPath === 'string'
                    || uri_1.URI.isUri(extensionTreeItem.iconPath)) {
                    return this.nb(extensionTreeItem.iconPath);
                }
                return this.nb(extensionTreeItem.iconPath.light);
            }
            return undefined;
        }
        mb(extensionTreeItem) {
            if (extensionTreeItem.iconPath && !(extensionTreeItem.iconPath instanceof extHostTypes.$WK) && extensionTreeItem.iconPath.dark) {
                return this.nb(extensionTreeItem.iconPath.dark);
            }
            return undefined;
        }
        nb(iconPath) {
            if (uri_1.URI.isUri(iconPath)) {
                return iconPath;
            }
            return uri_1.URI.file(iconPath);
        }
        ob(element, node) {
            this.j.set(node.item.handle, element);
            this.m.set(element, node);
        }
        pb(element, newNode, existing, parentNode) {
            // Remove from the cache
            this.j.delete(newNode.item.handle);
            this.m.delete(element);
            if (newNode.item.handle !== existing.item.handle) {
                this.j.delete(existing.item.handle);
            }
            // Add the new node to the cache
            this.ob(element, newNode);
            // Replace the node in parent's children nodes
            const childrenNodes = (this.X(parentNode) || []);
            const childNode = childrenNodes.filter(c => c.item.handle === existing.item.handle)[0];
            if (childNode) {
                childrenNodes.splice(childrenNodes.indexOf(childNode), 1, newNode);
            }
        }
        qb(node, parentNode) {
            if (parentNode) {
                if (!parentNode.children) {
                    parentNode.children = [];
                }
                parentNode.children.push(node);
            }
            else {
                if (!this.h) {
                    this.h = [];
                }
                this.h.push(node);
            }
        }
        rb(parentElement) {
            if (parentElement) {
                const node = this.m.get(parentElement);
                if (node) {
                    if (node.children) {
                        for (const child of node.children) {
                            const childElement = this.j.get(child.item.handle);
                            if (childElement) {
                                this.sb(childElement);
                            }
                        }
                    }
                    node.children = undefined;
                }
            }
            else {
                this.tb();
            }
        }
        sb(element) {
            const node = this.m.get(element);
            if (node) {
                if (node.children) {
                    for (const child of node.children) {
                        const childElement = this.j.get(child.item.handle);
                        if (childElement) {
                            this.sb(childElement);
                        }
                    }
                }
                this.m.delete(element);
                this.j.delete(node.item.handle);
                node.dispose();
            }
        }
        tb() {
            this.h = undefined;
            this.j.clear();
            this.m.forEach(node => node.dispose());
            this.m.clear();
        }
        dispose() {
            super.dispose();
            this.Z.dispose();
            this.tb();
            this.J.$disposeTree(this.I);
        }
    }
});
//# sourceMappingURL=extHostTreeViews.js.map