/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/base/common/async", "vs/workbench/api/common/extHostTypes", "vs/base/common/types", "vs/base/common/arrays", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/htmlContent", "vs/base/common/cancellation", "vs/editor/common/services/treeViewsDnd", "vs/workbench/services/extensions/common/extensions"], function (require, exports, nls_1, resources_1, uri_1, event_1, lifecycle_1, views_1, async_1, extHostTypes, types_1, arrays_1, extHostTypeConverters_1, htmlContent_1, cancellation_1, treeViewsDnd_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostTreeViews = void 0;
    function toTreeItemLabel(label, extension) {
        if ((0, types_1.isString)(label)) {
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
    class ExtHostTreeViews extends lifecycle_1.Disposable {
        constructor(_proxy, commands, logService) {
            super();
            this._proxy = _proxy;
            this.commands = commands;
            this.logService = logService;
            this.treeViews = new Map();
            this.treeDragAndDropService = new treeViewsDnd_1.TreeViewsDnDService();
            function isTreeViewConvertableItem(arg) {
                return arg && arg.$treeViewId && (arg.$treeItemHandle || arg.$selectedTreeItems || arg.$focusedTreeItem);
            }
            commands.registerArgumentProcessor({
                processArgument: arg => {
                    if (isTreeViewConvertableItem(arg)) {
                        return this.convertArgument(arg);
                    }
                    else if (Array.isArray(arg) && (arg.length > 0)) {
                        return arg.map(item => {
                            if (isTreeViewConvertableItem(item)) {
                                return this.convertArgument(item);
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
            const treeView = this.createExtHostTreeView(viewId, options, extension);
            const proxyOptions = { showCollapseAll: !!options.showCollapseAll, canSelectMany: !!options.canSelectMany, dropMimeTypes, dragMimeTypes, hasHandleDrag, hasHandleDrop, manuallyManageCheckboxes: !!options.manageCheckboxStateManually };
            const registerPromise = this._proxy.$registerTreeViewDataProvider(viewId, proxyOptions);
            const view = {
                get onDidCollapseElement() { return treeView.onDidCollapseElement; },
                get onDidExpandElement() { return treeView.onDidExpandElement; },
                get selection() { return treeView.selectedElements; },
                get onDidChangeSelection() { return treeView.onDidChangeSelection; },
                get activeItem() {
                    (0, extensions_1.checkProposedApiEnabled)(extension, 'treeViewActiveItem');
                    return treeView.focusedElement;
                },
                get onDidChangeActiveItem() {
                    (0, extensions_1.checkProposedApiEnabled)(extension, 'treeViewActiveItem');
                    return treeView.onDidChangeActiveItem;
                },
                get visible() { return treeView.visible; },
                get onDidChangeVisibility() { return treeView.onDidChangeVisibility; },
                get onDidChangeCheckboxState() {
                    return treeView.onDidChangeCheckboxState;
                },
                get message() { return treeView.message; },
                set message(message) {
                    if ((0, htmlContent_1.isMarkdownString)(message)) {
                        (0, extensions_1.checkProposedApiEnabled)(extension, 'treeViewMarkdownMessage');
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
                    this.treeViews.delete(viewId);
                    treeView.dispose();
                }
            };
            this._register(view);
            return view;
        }
        $getChildren(treeViewId, treeItemHandle) {
            const treeView = this.treeViews.get(treeViewId);
            if (!treeView) {
                return Promise.reject(new views_1.NoTreeViewError(treeViewId));
            }
            return treeView.getChildren(treeItemHandle);
        }
        async $handleDrop(destinationViewId, requestId, treeDataTransferDTO, targetItemHandle, token, operationUuid, sourceViewId, sourceTreeItemHandles) {
            const treeView = this.treeViews.get(destinationViewId);
            if (!treeView) {
                return Promise.reject(new views_1.NoTreeViewError(destinationViewId));
            }
            const treeDataTransfer = extHostTypeConverters_1.DataTransfer.toDataTransfer(treeDataTransferDTO, async (dataItemIndex) => {
                return (await this._proxy.$resolveDropFileData(destinationViewId, requestId, dataItemIndex)).buffer;
            });
            if ((sourceViewId === destinationViewId) && sourceTreeItemHandles) {
                await this.addAdditionalTransferItems(treeDataTransfer, treeView, sourceTreeItemHandles, token, operationUuid);
            }
            return treeView.onDrop(treeDataTransfer, targetItemHandle, token);
        }
        async addAdditionalTransferItems(treeDataTransfer, treeView, sourceTreeItemHandles, token, operationUuid) {
            const existingTransferOperation = this.treeDragAndDropService.removeDragOperationTransfer(operationUuid);
            if (existingTransferOperation) {
                (await existingTransferOperation)?.forEach((value, key) => {
                    if (value) {
                        treeDataTransfer.set(key, value);
                    }
                });
            }
            else if (operationUuid && treeView.handleDrag) {
                const willDropPromise = treeView.handleDrag(sourceTreeItemHandles, treeDataTransfer, token);
                this.treeDragAndDropService.addDragOperationTransfer(operationUuid, willDropPromise);
                await willDropPromise;
            }
            return treeDataTransfer;
        }
        async $handleDrag(sourceViewId, sourceTreeItemHandles, operationUuid, token) {
            const treeView = this.treeViews.get(sourceViewId);
            if (!treeView) {
                return Promise.reject(new views_1.NoTreeViewError(sourceViewId));
            }
            const treeDataTransfer = await this.addAdditionalTransferItems(new extHostTypes.DataTransfer(), treeView, sourceTreeItemHandles, token, operationUuid);
            if (!treeDataTransfer || token.isCancellationRequested) {
                return;
            }
            return extHostTypeConverters_1.DataTransfer.from(treeDataTransfer);
        }
        async $hasResolve(treeViewId) {
            const treeView = this.treeViews.get(treeViewId);
            if (!treeView) {
                throw new views_1.NoTreeViewError(treeViewId);
            }
            return treeView.hasResolve;
        }
        $resolve(treeViewId, treeItemHandle, token) {
            const treeView = this.treeViews.get(treeViewId);
            if (!treeView) {
                throw new views_1.NoTreeViewError(treeViewId);
            }
            return treeView.resolveTreeItem(treeItemHandle, token);
        }
        $setExpanded(treeViewId, treeItemHandle, expanded) {
            const treeView = this.treeViews.get(treeViewId);
            if (!treeView) {
                throw new views_1.NoTreeViewError(treeViewId);
            }
            treeView.setExpanded(treeItemHandle, expanded);
        }
        $setSelectionAndFocus(treeViewId, selectedHandles, focusedHandle) {
            const treeView = this.treeViews.get(treeViewId);
            if (!treeView) {
                throw new views_1.NoTreeViewError(treeViewId);
            }
            treeView.setSelectionAndFocus(selectedHandles, focusedHandle);
        }
        $setVisible(treeViewId, isVisible) {
            const treeView = this.treeViews.get(treeViewId);
            if (!treeView) {
                if (!isVisible) {
                    return;
                }
                throw new views_1.NoTreeViewError(treeViewId);
            }
            treeView.setVisible(isVisible);
        }
        $changeCheckboxState(treeViewId, checkboxUpdate) {
            const treeView = this.treeViews.get(treeViewId);
            if (!treeView) {
                throw new views_1.NoTreeViewError(treeViewId);
            }
            treeView.setCheckboxState(checkboxUpdate);
        }
        createExtHostTreeView(id, options, extension) {
            const treeView = this._register(new ExtHostTreeView(id, options, this._proxy, this.commands.converter, this.logService, extension));
            this.treeViews.set(id, treeView);
            return treeView;
        }
        convertArgument(arg) {
            const treeView = this.treeViews.get(arg.$treeViewId);
            if (treeView && '$treeItemHandle' in arg) {
                return treeView.getExtensionElement(arg.$treeItemHandle);
            }
            if (treeView && '$focusedTreeItem' in arg && arg.$focusedTreeItem) {
                return treeView.focusedElement;
            }
            return null;
        }
    }
    exports.ExtHostTreeViews = ExtHostTreeViews;
    class ExtHostTreeView extends lifecycle_1.Disposable {
        static { this.LABEL_HANDLE_PREFIX = '0'; }
        static { this.ID_HANDLE_PREFIX = '1'; }
        get visible() { return this._visible; }
        get selectedElements() { return this._selectedHandles.map(handle => this.getExtensionElement(handle)).filter(element => !(0, types_1.isUndefinedOrNull)(element)); }
        get focusedElement() { return (this._focusedHandle ? this.getExtensionElement(this._focusedHandle) : undefined); }
        constructor(viewId, options, proxy, commands, logService, extension) {
            super();
            this.viewId = viewId;
            this.proxy = proxy;
            this.commands = commands;
            this.logService = logService;
            this.extension = extension;
            this.roots = undefined;
            this.elements = new Map();
            this.nodes = new Map();
            this._visible = false;
            this._selectedHandles = [];
            this._focusedHandle = undefined;
            this._onDidExpandElement = this._register(new event_1.Emitter());
            this.onDidExpandElement = this._onDidExpandElement.event;
            this._onDidCollapseElement = this._register(new event_1.Emitter());
            this.onDidCollapseElement = this._onDidCollapseElement.event;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._onDidChangeActiveItem = this._register(new event_1.Emitter());
            this.onDidChangeActiveItem = this._onDidChangeActiveItem.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._onDidChangeCheckboxState = this._register(new event_1.Emitter());
            this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
            this._onDidChangeData = this._register(new event_1.Emitter());
            this.refreshPromise = Promise.resolve();
            this.refreshQueue = Promise.resolve();
            this._message = '';
            this._title = '';
            this._refreshCancellationSource = new cancellation_1.CancellationTokenSource();
            if (extension.contributes && extension.contributes.views) {
                for (const location in extension.contributes.views) {
                    for (const view of extension.contributes.views[location]) {
                        if (view.id === viewId) {
                            this._title = view.name;
                        }
                    }
                }
            }
            this.dataProvider = options.treeDataProvider;
            this.dndController = options.dragAndDropController;
            if (this.dataProvider.onDidChangeTreeData) {
                this._register(this.dataProvider.onDidChangeTreeData(elementOrElements => this._onDidChangeData.fire({ message: false, element: elementOrElements })));
            }
            let refreshingPromise;
            let promiseCallback;
            const onDidChangeData = event_1.Event.debounce(this._onDidChangeData.event, (result, current) => {
                if (!result) {
                    result = { message: false, elements: [] };
                }
                if (current.element !== false) {
                    if (!refreshingPromise) {
                        // New refresh has started
                        refreshingPromise = new Promise(c => promiseCallback = c);
                        this.refreshPromise = this.refreshPromise.then(() => refreshingPromise);
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
            this._register(onDidChangeData(({ message, elements }) => {
                if (elements.length) {
                    this.refreshQueue = this.refreshQueue.then(() => {
                        const _promiseCallback = promiseCallback;
                        refreshingPromise = null;
                        return this.refresh(elements).then(() => _promiseCallback());
                    });
                }
                if (message) {
                    this.proxy.$setMessage(this.viewId, extHostTypeConverters_1.MarkdownString.fromStrict(this._message) ?? '');
                }
            }));
        }
        async getChildren(parentHandle) {
            const parentElement = parentHandle ? this.getExtensionElement(parentHandle) : undefined;
            if (parentHandle && !parentElement) {
                this.logService.error(`No tree item with id \'${parentHandle}\' found.`);
                return Promise.resolve([]);
            }
            let childrenNodes = this.getChildrenNodes(parentHandle); // Get it from cache
            if (!childrenNodes) {
                childrenNodes = await this.fetchChildrenNodes(parentElement);
            }
            return childrenNodes ? childrenNodes.map(n => n.item) : undefined;
        }
        getExtensionElement(treeItemHandle) {
            return this.elements.get(treeItemHandle);
        }
        reveal(element, options) {
            options = options ? options : { select: true, focus: false };
            const select = (0, types_1.isUndefinedOrNull)(options.select) ? true : options.select;
            const focus = (0, types_1.isUndefinedOrNull)(options.focus) ? false : options.focus;
            const expand = (0, types_1.isUndefinedOrNull)(options.expand) ? false : options.expand;
            if (typeof this.dataProvider.getParent !== 'function') {
                return Promise.reject(new Error(`Required registered TreeDataProvider to implement 'getParent' method to access 'reveal' method`));
            }
            if (element) {
                return this.refreshPromise
                    .then(() => this.resolveUnknownParentChain(element))
                    .then(parentChain => this.resolveTreeNode(element, parentChain[parentChain.length - 1])
                    .then(treeNode => this.proxy.$reveal(this.viewId, { item: treeNode.item, parentChain: parentChain.map(p => p.item) }, { select, focus, expand })), error => this.logService.error(error));
            }
            else {
                return this.proxy.$reveal(this.viewId, undefined, { select, focus, expand });
            }
        }
        get message() {
            return this._message;
        }
        set message(message) {
            this._message = message;
            this._onDidChangeData.fire({ message: true, element: false });
        }
        get title() {
            return this._title;
        }
        set title(title) {
            this._title = title;
            this.proxy.$setTitle(this.viewId, title, this._description);
        }
        get description() {
            return this._description;
        }
        set description(description) {
            this._description = description;
            this.proxy.$setTitle(this.viewId, this._title, description);
        }
        get badge() {
            return this._badge;
        }
        set badge(badge) {
            if (this._badge?.value === badge?.value &&
                this._badge?.tooltip === badge?.tooltip) {
                return;
            }
            this._badge = extHostTypeConverters_1.ViewBadge.from(badge);
            this.proxy.$setBadge(this.viewId, badge);
        }
        setExpanded(treeItemHandle, expanded) {
            const element = this.getExtensionElement(treeItemHandle);
            if (element) {
                if (expanded) {
                    this._onDidExpandElement.fire(Object.freeze({ element }));
                }
                else {
                    this._onDidCollapseElement.fire(Object.freeze({ element }));
                }
            }
        }
        setSelectionAndFocus(selectedHandles, focusedHandle) {
            const changedSelection = !(0, arrays_1.equals)(this._selectedHandles, selectedHandles);
            this._selectedHandles = selectedHandles;
            const changedFocus = this._focusedHandle !== focusedHandle;
            this._focusedHandle = focusedHandle;
            if (changedSelection) {
                this._onDidChangeSelection.fire(Object.freeze({ selection: this.selectedElements }));
            }
            if (changedFocus) {
                this._onDidChangeActiveItem.fire(Object.freeze({ activeItem: this.focusedElement }));
            }
        }
        setVisible(visible) {
            if (visible !== this._visible) {
                this._visible = visible;
                this._onDidChangeVisibility.fire(Object.freeze({ visible: this._visible }));
            }
        }
        async setCheckboxState(checkboxUpdates) {
            const items = (await Promise.all(checkboxUpdates.map(async (checkboxUpdate) => {
                const extensionItem = this.getExtensionElement(checkboxUpdate.treeItemHandle);
                if (extensionItem) {
                    return {
                        extensionItem: extensionItem,
                        treeItem: await this.dataProvider.getTreeItem(extensionItem),
                        newState: checkboxUpdate.newState ? extHostTypes.TreeItemCheckboxState.Checked : extHostTypes.TreeItemCheckboxState.Unchecked
                    };
                }
                return Promise.resolve(undefined);
            }))).filter((item) => item !== undefined);
            items.forEach(item => {
                item.treeItem.checkboxState = item.newState ? extHostTypes.TreeItemCheckboxState.Checked : extHostTypes.TreeItemCheckboxState.Unchecked;
            });
            this._onDidChangeCheckboxState.fire({ items: items.map(item => [item.extensionItem, item.newState]) });
        }
        async handleDrag(sourceTreeItemHandles, treeDataTransfer, token) {
            const extensionTreeItems = [];
            for (const sourceHandle of sourceTreeItemHandles) {
                const extensionItem = this.getExtensionElement(sourceHandle);
                if (extensionItem) {
                    extensionTreeItems.push(extensionItem);
                }
            }
            if (!this.dndController?.handleDrag || (extensionTreeItems.length === 0)) {
                return;
            }
            await this.dndController.handleDrag(extensionTreeItems, treeDataTransfer, token);
            return treeDataTransfer;
        }
        get hasHandleDrag() {
            return !!this.dndController?.handleDrag;
        }
        async onDrop(treeDataTransfer, targetHandleOrNode, token) {
            const target = targetHandleOrNode ? this.getExtensionElement(targetHandleOrNode) : undefined;
            if ((!target && targetHandleOrNode) || !this.dndController?.handleDrop) {
                return;
            }
            return (0, async_1.asPromise)(() => this.dndController?.handleDrop
                ? this.dndController.handleDrop(target, treeDataTransfer, token)
                : undefined);
        }
        get hasResolve() {
            return !!this.dataProvider.resolveTreeItem;
        }
        async resolveTreeItem(treeItemHandle, token) {
            if (!this.dataProvider.resolveTreeItem) {
                return;
            }
            const element = this.elements.get(treeItemHandle);
            if (element) {
                const node = this.nodes.get(element);
                if (node) {
                    const resolve = await this.dataProvider.resolveTreeItem(node.extensionItem, element, token) ?? node.extensionItem;
                    this.validateTreeItem(resolve);
                    // Resolvable elements. Currently only tooltip and command.
                    node.item.tooltip = this.getTooltip(resolve.tooltip);
                    node.item.command = this.getCommand(node.disposableStore, resolve.command);
                    return node.item;
                }
            }
            return;
        }
        resolveUnknownParentChain(element) {
            return this.resolveParent(element)
                .then((parent) => {
                if (!parent) {
                    return Promise.resolve([]);
                }
                return this.resolveUnknownParentChain(parent)
                    .then(result => this.resolveTreeNode(parent, result[result.length - 1])
                    .then(parentNode => {
                    result.push(parentNode);
                    return result;
                }));
            });
        }
        resolveParent(element) {
            const node = this.nodes.get(element);
            if (node) {
                return Promise.resolve(node.parent ? this.elements.get(node.parent.item.handle) : undefined);
            }
            return (0, async_1.asPromise)(() => this.dataProvider.getParent(element));
        }
        resolveTreeNode(element, parent) {
            const node = this.nodes.get(element);
            if (node) {
                return Promise.resolve(node);
            }
            return (0, async_1.asPromise)(() => this.dataProvider.getTreeItem(element))
                .then(extTreeItem => this.createHandle(element, extTreeItem, parent, true))
                .then(handle => this.getChildren(parent ? parent.item.handle : undefined)
                .then(() => {
                const cachedElement = this.getExtensionElement(handle);
                if (cachedElement) {
                    const node = this.nodes.get(cachedElement);
                    if (node) {
                        return Promise.resolve(node);
                    }
                }
                throw new Error(`Cannot resolve tree item for element ${handle} from extension ${this.extension.identifier.value}`);
            }));
        }
        getChildrenNodes(parentNodeOrHandle) {
            if (parentNodeOrHandle) {
                let parentNode;
                if (typeof parentNodeOrHandle === 'string') {
                    const parentElement = this.getExtensionElement(parentNodeOrHandle);
                    parentNode = parentElement ? this.nodes.get(parentElement) : undefined;
                }
                else {
                    parentNode = parentNodeOrHandle;
                }
                return parentNode ? parentNode.children || undefined : undefined;
            }
            return this.roots;
        }
        async fetchChildrenNodes(parentElement) {
            // clear children cache
            this.clearChildren(parentElement);
            const cts = new cancellation_1.CancellationTokenSource(this._refreshCancellationSource.token);
            try {
                const parentNode = parentElement ? this.nodes.get(parentElement) : undefined;
                const elements = await this.dataProvider.getChildren(parentElement);
                if (cts.token.isCancellationRequested) {
                    return undefined;
                }
                const items = await Promise.all((0, arrays_1.coalesce)(elements || []).map(async (element) => {
                    const item = await this.dataProvider.getTreeItem(element);
                    return item && !cts.token.isCancellationRequested ? this.createAndRegisterTreeNode(element, item, parentNode) : null;
                }));
                if (cts.token.isCancellationRequested) {
                    return undefined;
                }
                return (0, arrays_1.coalesce)(items);
            }
            finally {
                cts.dispose();
            }
        }
        refresh(elements) {
            const hasRoot = elements.some(element => !element);
            if (hasRoot) {
                // Cancel any pending children fetches
                this._refreshCancellationSource.dispose(true);
                this._refreshCancellationSource = new cancellation_1.CancellationTokenSource();
                this.clearAll(); // clear cache
                return this.proxy.$refresh(this.viewId);
            }
            else {
                const handlesToRefresh = this.getHandlesToRefresh(elements);
                if (handlesToRefresh.length) {
                    return this.refreshHandles(handlesToRefresh);
                }
            }
            return Promise.resolve(undefined);
        }
        getHandlesToRefresh(elements) {
            const elementsToUpdate = new Set();
            const elementNodes = elements.map(element => this.nodes.get(element));
            for (const elementNode of elementNodes) {
                if (elementNode && !elementsToUpdate.has(elementNode.item.handle)) {
                    // check if an ancestor of extElement is already in the elements list
                    let currentNode = elementNode;
                    while (currentNode && currentNode.parent && elementNodes.findIndex(node => currentNode && currentNode.parent && node && node.item.handle === currentNode.parent.item.handle) === -1) {
                        const parentElement = this.elements.get(currentNode.parent.item.handle);
                        currentNode = parentElement ? this.nodes.get(parentElement) : undefined;
                    }
                    if (currentNode && !currentNode.parent) {
                        elementsToUpdate.add(elementNode.item.handle);
                    }
                }
            }
            const handlesToUpdate = [];
            // Take only top level elements
            elementsToUpdate.forEach((handle) => {
                const element = this.elements.get(handle);
                if (element) {
                    const node = this.nodes.get(element);
                    if (node && (!node.parent || !elementsToUpdate.has(node.parent.item.handle))) {
                        handlesToUpdate.push(handle);
                    }
                }
            });
            return handlesToUpdate;
        }
        refreshHandles(itemHandles) {
            const itemsToRefresh = {};
            return Promise.all(itemHandles.map(treeItemHandle => this.refreshNode(treeItemHandle)
                .then(node => {
                if (node) {
                    itemsToRefresh[treeItemHandle] = node.item;
                }
            })))
                .then(() => Object.keys(itemsToRefresh).length ? this.proxy.$refresh(this.viewId, itemsToRefresh) : undefined);
        }
        refreshNode(treeItemHandle) {
            const extElement = this.getExtensionElement(treeItemHandle);
            if (extElement) {
                const existing = this.nodes.get(extElement);
                if (existing) {
                    this.clearChildren(extElement); // clear children cache
                    return (0, async_1.asPromise)(() => this.dataProvider.getTreeItem(extElement))
                        .then(extTreeItem => {
                        if (extTreeItem) {
                            const newNode = this.createTreeNode(extElement, extTreeItem, existing.parent);
                            this.updateNodeCache(extElement, newNode, existing, existing.parent);
                            existing.dispose();
                            return newNode;
                        }
                        return null;
                    });
                }
            }
            return Promise.resolve(null);
        }
        createAndRegisterTreeNode(element, extTreeItem, parentNode) {
            const node = this.createTreeNode(element, extTreeItem, parentNode);
            if (extTreeItem.id && this.elements.has(node.item.handle)) {
                throw new Error((0, nls_1.localize)('treeView.duplicateElement', 'Element with id {0} is already registered', extTreeItem.id));
            }
            this.addNodeToCache(element, node);
            this.addNodeToParentCache(node, parentNode);
            return node;
        }
        getTooltip(tooltip) {
            if (extHostTypes.MarkdownString.isMarkdownString(tooltip)) {
                return extHostTypeConverters_1.MarkdownString.from(tooltip);
            }
            return tooltip;
        }
        getCommand(disposable, command) {
            return command ? { ...this.commands.toInternal(command, disposable), originalId: command.command } : undefined;
        }
        getCheckbox(extensionTreeItem) {
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
        validateTreeItem(extensionTreeItem) {
            if (!extHostTypes.TreeItem.isTreeItem(extensionTreeItem, this.extension)) {
                throw new Error(`Extension ${this.extension.identifier.value} has provided an invalid tree item.`);
            }
        }
        createTreeNode(element, extensionTreeItem, parent) {
            this.validateTreeItem(extensionTreeItem);
            const disposableStore = this._register(new lifecycle_1.DisposableStore());
            const handle = this.createHandle(element, extensionTreeItem, parent);
            const icon = this.getLightIconPath(extensionTreeItem);
            const item = {
                handle,
                parentHandle: parent ? parent.item.handle : undefined,
                label: toTreeItemLabel(extensionTreeItem.label, this.extension),
                description: extensionTreeItem.description,
                resourceUri: extensionTreeItem.resourceUri,
                tooltip: this.getTooltip(extensionTreeItem.tooltip),
                command: this.getCommand(disposableStore, extensionTreeItem.command),
                contextValue: extensionTreeItem.contextValue,
                icon,
                iconDark: this.getDarkIconPath(extensionTreeItem) || icon,
                themeIcon: this.getThemeIcon(extensionTreeItem),
                collapsibleState: (0, types_1.isUndefinedOrNull)(extensionTreeItem.collapsibleState) ? extHostTypes.TreeItemCollapsibleState.None : extensionTreeItem.collapsibleState,
                accessibilityInformation: extensionTreeItem.accessibilityInformation,
                checkbox: this.getCheckbox(extensionTreeItem),
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
        getThemeIcon(extensionTreeItem) {
            return extensionTreeItem.iconPath instanceof extHostTypes.ThemeIcon ? extensionTreeItem.iconPath : undefined;
        }
        createHandle(element, { id, label, resourceUri }, parent, returnFirst) {
            if (id) {
                return `${ExtHostTreeView.ID_HANDLE_PREFIX}/${id}`;
            }
            const treeItemLabel = toTreeItemLabel(label, this.extension);
            const prefix = parent ? parent.item.handle : ExtHostTreeView.LABEL_HANDLE_PREFIX;
            let elementId = treeItemLabel ? treeItemLabel.label : resourceUri ? (0, resources_1.basename)(resourceUri) : '';
            elementId = elementId.indexOf('/') !== -1 ? elementId.replace('/', '//') : elementId;
            const existingHandle = this.nodes.has(element) ? this.nodes.get(element).item.handle : undefined;
            const childrenNodes = (this.getChildrenNodes(parent) || []);
            let handle;
            let counter = 0;
            do {
                handle = `${prefix}/${counter}:${elementId}`;
                if (returnFirst || !this.elements.has(handle) || existingHandle === handle) {
                    // Return first if asked for or
                    // Return if handle does not exist or
                    // Return if handle is being reused
                    break;
                }
                counter++;
            } while (counter <= childrenNodes.length);
            return handle;
        }
        getLightIconPath(extensionTreeItem) {
            if (extensionTreeItem.iconPath && !(extensionTreeItem.iconPath instanceof extHostTypes.ThemeIcon)) {
                if (typeof extensionTreeItem.iconPath === 'string'
                    || uri_1.URI.isUri(extensionTreeItem.iconPath)) {
                    return this.getIconPath(extensionTreeItem.iconPath);
                }
                return this.getIconPath(extensionTreeItem.iconPath.light);
            }
            return undefined;
        }
        getDarkIconPath(extensionTreeItem) {
            if (extensionTreeItem.iconPath && !(extensionTreeItem.iconPath instanceof extHostTypes.ThemeIcon) && extensionTreeItem.iconPath.dark) {
                return this.getIconPath(extensionTreeItem.iconPath.dark);
            }
            return undefined;
        }
        getIconPath(iconPath) {
            if (uri_1.URI.isUri(iconPath)) {
                return iconPath;
            }
            return uri_1.URI.file(iconPath);
        }
        addNodeToCache(element, node) {
            this.elements.set(node.item.handle, element);
            this.nodes.set(element, node);
        }
        updateNodeCache(element, newNode, existing, parentNode) {
            // Remove from the cache
            this.elements.delete(newNode.item.handle);
            this.nodes.delete(element);
            if (newNode.item.handle !== existing.item.handle) {
                this.elements.delete(existing.item.handle);
            }
            // Add the new node to the cache
            this.addNodeToCache(element, newNode);
            // Replace the node in parent's children nodes
            const childrenNodes = (this.getChildrenNodes(parentNode) || []);
            const childNode = childrenNodes.filter(c => c.item.handle === existing.item.handle)[0];
            if (childNode) {
                childrenNodes.splice(childrenNodes.indexOf(childNode), 1, newNode);
            }
        }
        addNodeToParentCache(node, parentNode) {
            if (parentNode) {
                if (!parentNode.children) {
                    parentNode.children = [];
                }
                parentNode.children.push(node);
            }
            else {
                if (!this.roots) {
                    this.roots = [];
                }
                this.roots.push(node);
            }
        }
        clearChildren(parentElement) {
            if (parentElement) {
                const node = this.nodes.get(parentElement);
                if (node) {
                    if (node.children) {
                        for (const child of node.children) {
                            const childElement = this.elements.get(child.item.handle);
                            if (childElement) {
                                this.clear(childElement);
                            }
                        }
                    }
                    node.children = undefined;
                }
            }
            else {
                this.clearAll();
            }
        }
        clear(element) {
            const node = this.nodes.get(element);
            if (node) {
                if (node.children) {
                    for (const child of node.children) {
                        const childElement = this.elements.get(child.item.handle);
                        if (childElement) {
                            this.clear(childElement);
                        }
                    }
                }
                this.nodes.delete(element);
                this.elements.delete(node.item.handle);
                node.dispose();
            }
        }
        clearAll() {
            this.roots = undefined;
            this.elements.clear();
            this.nodes.forEach(node => node.dispose());
            this.nodes.clear();
        }
        dispose() {
            super.dispose();
            this._refreshCancellationSource.dispose();
            this.clearAll();
            this.proxy.$disposeTree(this.viewId);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRyZWVWaWV3cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RUcmVlVmlld3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMEJoRyxTQUFTLGVBQWUsQ0FBQyxLQUFVLEVBQUUsU0FBZ0M7UUFDcEUsSUFBSSxJQUFBLGdCQUFRLEVBQUMsS0FBSyxDQUFDLEVBQUU7WUFDcEIsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ2pCO1FBRUQsSUFBSSxLQUFLO2VBQ0wsT0FBTyxLQUFLLEtBQUssUUFBUTtlQUN6QixPQUFPLEtBQUssQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQ3BDLElBQUksVUFBVSxHQUFtQyxTQUFTLENBQUM7WUFDM0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDcEMsVUFBVSxHQUF3QixLQUFLLENBQUMsVUFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFJLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzFLLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzthQUN4RDtZQUNELE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQztTQUMxQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFHRCxNQUFhLGdCQUFpQixTQUFRLHNCQUFVO1FBSy9DLFlBQ1MsTUFBZ0MsRUFDaEMsUUFBeUIsRUFDekIsVUFBdUI7WUFFL0IsS0FBSyxFQUFFLENBQUM7WUFKQSxXQUFNLEdBQU4sTUFBTSxDQUEwQjtZQUNoQyxhQUFRLEdBQVIsUUFBUSxDQUFpQjtZQUN6QixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBTnhCLGNBQVMsR0FBc0MsSUFBSSxHQUFHLEVBQWdDLENBQUM7WUFDdkYsMkJBQXNCLEdBQThDLElBQUksa0NBQW1CLEVBQXVCLENBQUM7WUFRMUgsU0FBUyx5QkFBeUIsQ0FBQyxHQUFRO2dCQUMxQyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsSUFBSSxHQUFHLENBQUMsa0JBQWtCLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDMUcsQ0FBQztZQUNELFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQztnQkFDbEMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxFQUFFO29CQUN0QixJQUFJLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUNuQyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ2pDO3lCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7d0JBQ2xELE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTs0QkFDckIsSUFBSSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQ0FDcEMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDOzZCQUNsQzs0QkFDRCxPQUFPLElBQUksQ0FBQzt3QkFDYixDQUFDLENBQUMsQ0FBQztxQkFDSDtvQkFDRCxPQUFPLEdBQUcsQ0FBQztnQkFDWixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELHdCQUF3QixDQUFJLEVBQVUsRUFBRSxnQkFBNEMsRUFBRSxTQUFnQztZQUNySCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDMUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBRUQsY0FBYyxDQUFJLE1BQWMsRUFBRSxPQUFrQyxFQUFFLFNBQWdDO1lBQ3JHLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzFDLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQzthQUM5RDtZQUNELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxhQUFhLElBQUksRUFBRSxDQUFDO1lBQ3pFLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxhQUFhLElBQUksRUFBRSxDQUFDO1lBQ3pFLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsVUFBVSxDQUFDO1lBQ2xFLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsVUFBVSxDQUFDO1lBQ2xFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sWUFBWSxHQUFHLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ3pPLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsNkJBQTZCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3hGLE1BQU0sSUFBSSxHQUFHO2dCQUNaLElBQUksb0JBQW9CLEtBQUssT0FBTyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLGtCQUFrQixLQUFLLE9BQU8sUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxTQUFTLEtBQUssT0FBTyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLG9CQUFvQixLQUFLLE9BQU8sUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDcEUsSUFBSSxVQUFVO29CQUNiLElBQUEsb0NBQXVCLEVBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQUM7b0JBQ3pELE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQztnQkFDaEMsQ0FBQztnQkFDRCxJQUFJLHFCQUFxQjtvQkFDeEIsSUFBQSxvQ0FBdUIsRUFBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztvQkFDekQsT0FBTyxRQUFRLENBQUMscUJBQXFCLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsSUFBSSxPQUFPLEtBQUssT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxxQkFBcUIsS0FBSyxPQUFPLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RFLElBQUksd0JBQXdCO29CQUMzQixPQUFPLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQztnQkFDMUMsQ0FBQztnQkFDRCxJQUFJLE9BQU8sS0FBSyxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLE9BQU8sQ0FBQyxPQUF1QztvQkFDbEQsSUFBSSxJQUFBLDhCQUFnQixFQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUM5QixJQUFBLG9DQUF1QixFQUFDLFNBQVMsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO3FCQUM5RDtvQkFDRCxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztnQkFDNUIsQ0FBQztnQkFDRCxJQUFJLEtBQUssS0FBSyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLEtBQUssQ0FBQyxLQUFhO29CQUN0QixRQUFRLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztnQkFDeEIsQ0FBQztnQkFDRCxJQUFJLFdBQVc7b0JBQ2QsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDO2dCQUM3QixDQUFDO2dCQUNELElBQUksV0FBVyxDQUFDLFdBQStCO29CQUM5QyxRQUFRLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztnQkFDcEMsQ0FBQztnQkFDRCxJQUFJLEtBQUs7b0JBQ1IsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUN2QixDQUFDO2dCQUNELElBQUksS0FBSyxDQUFDLEtBQW1DO29CQUM1QyxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUN2RSxRQUFRLENBQUMsS0FBSyxHQUFHOzRCQUNoQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDeEMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO3lCQUN0QixDQUFDO3FCQUNGO3lCQUFNLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTt3QkFDL0IsUUFBUSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7cUJBQzNCO2dCQUNGLENBQUM7Z0JBQ0QsTUFBTSxFQUFFLENBQUMsT0FBVSxFQUFFLE9BQXdCLEVBQWlCLEVBQUU7b0JBQy9ELE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzFDLENBQUM7Z0JBQ0QsT0FBTyxFQUFFLEtBQUssSUFBSSxFQUFFO29CQUNuQix3RUFBd0U7b0JBQ3hFLE1BQU0sZUFBZSxDQUFDO29CQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDOUIsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNwQixDQUFDO2FBQ0QsQ0FBQztZQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckIsT0FBTyxJQUEwQixDQUFDO1FBQ25DLENBQUM7UUFFRCxZQUFZLENBQUMsVUFBa0IsRUFBRSxjQUF1QjtZQUN2RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLHVCQUFlLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzthQUN2RDtZQUNELE9BQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxpQkFBeUIsRUFBRSxTQUFpQixFQUFFLG1CQUFvQyxFQUFFLGdCQUFvQyxFQUFFLEtBQXdCLEVBQ25LLGFBQXNCLEVBQUUsWUFBcUIsRUFBRSxxQkFBZ0M7WUFDL0UsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLHVCQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2FBQzlEO1lBRUQsTUFBTSxnQkFBZ0IsR0FBRyxvQ0FBWSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUMsYUFBYSxFQUFDLEVBQUU7Z0JBQy9GLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3JHLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFlBQVksS0FBSyxpQkFBaUIsQ0FBQyxJQUFJLHFCQUFxQixFQUFFO2dCQUNsRSxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQy9HO1lBQ0QsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFTyxLQUFLLENBQUMsMEJBQTBCLENBQUMsZ0JBQXFDLEVBQUUsUUFBOEIsRUFDN0cscUJBQStCLEVBQUUsS0FBd0IsRUFBRSxhQUFzQjtZQUNqRixNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQywyQkFBMkIsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN6RyxJQUFJLHlCQUF5QixFQUFFO2dCQUM5QixDQUFDLE1BQU0seUJBQXlCLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7b0JBQ3pELElBQUksS0FBSyxFQUFFO3dCQUNWLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7cUJBQ2pDO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2FBQ0g7aUJBQU0sSUFBSSxhQUFhLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRTtnQkFDaEQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUYsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHdCQUF3QixDQUFDLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDckYsTUFBTSxlQUFlLENBQUM7YUFDdEI7WUFDRCxPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFlBQW9CLEVBQUUscUJBQStCLEVBQUUsYUFBcUIsRUFBRSxLQUF3QjtZQUN2SCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLHVCQUFlLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzthQUN6RDtZQUVELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxZQUFZLENBQUMsWUFBWSxFQUFFLEVBQUUsUUFBUSxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN2SixJQUFJLENBQUMsZ0JBQWdCLElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFO2dCQUN2RCxPQUFPO2FBQ1A7WUFFRCxPQUFPLG9DQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBa0I7WUFDbkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxNQUFNLElBQUksdUJBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN0QztZQUNELE9BQU8sUUFBUSxDQUFDLFVBQVUsQ0FBQztRQUM1QixDQUFDO1FBRUQsUUFBUSxDQUFDLFVBQWtCLEVBQUUsY0FBc0IsRUFBRSxLQUErQjtZQUNuRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLE1BQU0sSUFBSSx1QkFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3RDO1lBQ0QsT0FBTyxRQUFRLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsWUFBWSxDQUFDLFVBQWtCLEVBQUUsY0FBc0IsRUFBRSxRQUFpQjtZQUN6RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLE1BQU0sSUFBSSx1QkFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3RDO1lBQ0QsUUFBUSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELHFCQUFxQixDQUFDLFVBQWtCLEVBQUUsZUFBeUIsRUFBRSxhQUFxQjtZQUN6RixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLE1BQU0sSUFBSSx1QkFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3RDO1lBQ0QsUUFBUSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsV0FBVyxDQUFDLFVBQWtCLEVBQUUsU0FBa0I7WUFDakQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNmLE9BQU87aUJBQ1A7Z0JBQ0QsTUFBTSxJQUFJLHVCQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdEM7WUFDRCxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxVQUFrQixFQUFFLGNBQWdDO1lBQ3hFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsTUFBTSxJQUFJLHVCQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdEM7WUFDRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVPLHFCQUFxQixDQUFJLEVBQVUsRUFBRSxPQUFrQyxFQUFFLFNBQWdDO1lBQ2hILE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFlLENBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN2SSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDakMsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztRQUVPLGVBQWUsQ0FBQyxHQUFrRDtZQUN6RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckQsSUFBSSxRQUFRLElBQUksaUJBQWlCLElBQUksR0FBRyxFQUFFO2dCQUN6QyxPQUFPLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDekQ7WUFDRCxJQUFJLFFBQVEsSUFBSSxrQkFBa0IsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLGdCQUFnQixFQUFFO2dCQUNsRSxPQUFPLFFBQVEsQ0FBQyxjQUFjLENBQUM7YUFDL0I7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FDRDtJQXZPRCw0Q0F1T0M7SUFhRCxNQUFNLGVBQW1CLFNBQVEsc0JBQVU7aUJBRWxCLHdCQUFtQixHQUFHLEdBQUcsQUFBTixDQUFPO2lCQUMxQixxQkFBZ0IsR0FBRyxHQUFHLEFBQU4sQ0FBTztRQVUvQyxJQUFJLE9BQU8sS0FBYyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBR2hELElBQUksZ0JBQWdCLEtBQVUsT0FBWSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLHlCQUFpQixFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBR2pLLElBQUksY0FBYyxLQUFvQixPQUFzQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQXlCaEosWUFDUyxNQUFjLEVBQUUsT0FBa0MsRUFDbEQsS0FBK0IsRUFDL0IsUUFBMkIsRUFDM0IsVUFBdUIsRUFDdkIsU0FBZ0M7WUFFeEMsS0FBSyxFQUFFLENBQUM7WUFOQSxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2QsVUFBSyxHQUFMLEtBQUssQ0FBMEI7WUFDL0IsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7WUFDM0IsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUN2QixjQUFTLEdBQVQsU0FBUyxDQUF1QjtZQXpDakMsVUFBSyxHQUEyQixTQUFTLENBQUM7WUFDMUMsYUFBUSxHQUEyQixJQUFJLEdBQUcsRUFBcUIsQ0FBQztZQUNoRSxVQUFLLEdBQXFCLElBQUksR0FBRyxFQUFlLENBQUM7WUFFakQsYUFBUSxHQUFZLEtBQUssQ0FBQztZQUcxQixxQkFBZ0IsR0FBcUIsRUFBRSxDQUFDO1lBR3hDLG1CQUFjLEdBQStCLFNBQVMsQ0FBQztZQUd2RCx3QkFBbUIsR0FBOEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBb0MsQ0FBQyxDQUFDO1lBQ2hJLHVCQUFrQixHQUE0QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBRTlGLDBCQUFxQixHQUE4QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFvQyxDQUFDLENBQUM7WUFDbEkseUJBQW9CLEdBQTRDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUM7WUFFbEcsMEJBQXFCLEdBQW9ELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTBDLENBQUMsQ0FBQztZQUM5SSx5QkFBb0IsR0FBa0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQztZQUV4RywyQkFBc0IsR0FBcUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBMkMsQ0FBQyxDQUFDO1lBQ2pKLDBCQUFxQixHQUFtRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBRTNHLDJCQUFzQixHQUFrRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF3QyxDQUFDLENBQUM7WUFDM0ksMEJBQXFCLEdBQWdELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFFeEcsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBcUMsQ0FBQyxDQUFDO1lBQzVGLDZCQUF3QixHQUE2QyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDO1lBRTNHLHFCQUFnQixHQUF5QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFlLENBQUMsQ0FBQztZQUVwRixtQkFBYyxHQUFrQixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbEQsaUJBQVksR0FBa0IsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBc0doRCxhQUFRLEdBQW1DLEVBQUUsQ0FBQztZQVU5QyxXQUFNLEdBQVcsRUFBRSxDQUFDO1lBbU9wQiwrQkFBMEIsR0FBRyxJQUFJLHNDQUF1QixFQUFFLENBQUM7WUF6VWxFLElBQUksU0FBUyxDQUFDLFdBQVcsSUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRTtnQkFDekQsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRTtvQkFDbkQsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDekQsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLE1BQU0sRUFBRTs0QkFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO3lCQUN4QjtxQkFDRDtpQkFDRDthQUNEO1lBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7WUFDN0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUM7WUFDbkQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFO2dCQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZKO1lBRUQsSUFBSSxpQkFBdUMsQ0FBQztZQUM1QyxJQUFJLGVBQTJCLENBQUM7WUFDaEMsTUFBTSxlQUFlLEdBQUcsYUFBSyxDQUFDLFFBQVEsQ0FBNEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDbEosSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixNQUFNLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQztpQkFDMUM7Z0JBQ0QsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssRUFBRTtvQkFDOUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFO3dCQUN2QiwwQkFBMEI7d0JBQzFCLGlCQUFpQixHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUMxRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGlCQUFrQixDQUFDLENBQUM7cUJBQ3pFO29CQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ25DLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUN6Qzt5QkFBTTt3QkFDTixNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7cUJBQ3RDO2lCQUNEO2dCQUNELElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtvQkFDcEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7aUJBQ3RCO2dCQUNELE9BQU8sTUFBTSxDQUFDO1lBQ2YsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRTtnQkFDeEQsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO29CQUNwQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTt3QkFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7d0JBQ3pDLGlCQUFpQixHQUFHLElBQUksQ0FBQzt3QkFDekIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7b0JBQzlELENBQUMsQ0FBQyxDQUFDO2lCQUNIO2dCQUNELElBQUksT0FBTyxFQUFFO29CQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsc0NBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUNwRjtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxZQUFtQztZQUNwRCxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3hGLElBQUksWUFBWSxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsWUFBWSxXQUFXLENBQUMsQ0FBQztnQkFDekUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzNCO1lBRUQsSUFBSSxhQUFhLEdBQTJCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLG9CQUFvQjtZQUVyRyxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUNuQixhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDN0Q7WUFFRCxPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ25FLENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxjQUE4QjtZQUNqRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBc0IsRUFBRSxPQUF3QjtZQUN0RCxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDN0QsTUFBTSxNQUFNLEdBQUcsSUFBQSx5QkFBaUIsRUFBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUN6RSxNQUFNLEtBQUssR0FBRyxJQUFBLHlCQUFpQixFQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ3ZFLE1BQU0sTUFBTSxHQUFHLElBQUEseUJBQWlCLEVBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFFMUUsSUFBSSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxLQUFLLFVBQVUsRUFBRTtnQkFDdEQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLGdHQUFnRyxDQUFDLENBQUMsQ0FBQzthQUNuSTtZQUVELElBQUksT0FBTyxFQUFFO2dCQUNaLE9BQU8sSUFBSSxDQUFDLGNBQWM7cUJBQ3hCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7cUJBQ25ELElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUNyRixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUM1TDtpQkFBTTtnQkFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQzdFO1FBQ0YsQ0FBQztRQUdELElBQUksT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBRUQsSUFBSSxPQUFPLENBQUMsT0FBdUM7WUFDbEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDeEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUdELElBQUksS0FBSztZQUNSLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsS0FBYTtZQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUdELElBQUksV0FBVztZQUNkLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBRUQsSUFBSSxXQUFXLENBQUMsV0FBK0I7WUFDOUMsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7WUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFHRCxJQUFJLEtBQUs7WUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVELElBQUksS0FBSyxDQUFDLEtBQW1DO1lBQzVDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEtBQUssS0FBSyxFQUFFLEtBQUs7Z0JBQ3RDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUFLLEtBQUssRUFBRSxPQUFPLEVBQUU7Z0JBQ3pDLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsaUNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRUQsV0FBVyxDQUFDLGNBQThCLEVBQUUsUUFBaUI7WUFDNUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3pELElBQUksT0FBTyxFQUFFO2dCQUNaLElBQUksUUFBUSxFQUFFO29CQUNiLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDMUQ7cUJBQU07b0JBQ04sSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUM1RDthQUNEO1FBQ0YsQ0FBQztRQUVELG9CQUFvQixDQUFDLGVBQWlDLEVBQUUsYUFBcUI7WUFDNUUsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLElBQUEsZUFBTSxFQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1lBRXhDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLEtBQUssYUFBYSxDQUFDO1lBQzNELElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1lBRXBDLElBQUksZ0JBQWdCLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDckY7WUFFRCxJQUFJLFlBQVksRUFBRTtnQkFDakIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDckY7UUFDRixDQUFDO1FBRUQsVUFBVSxDQUFDLE9BQWdCO1lBQzFCLElBQUksT0FBTyxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO2dCQUN4QixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM1RTtRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZUFBaUM7WUFFdkQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsY0FBYyxFQUFDLEVBQUU7Z0JBQzNFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzlFLElBQUksYUFBYSxFQUFFO29CQUNsQixPQUFPO3dCQUNOLGFBQWEsRUFBRSxhQUFhO3dCQUM1QixRQUFRLEVBQUUsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7d0JBQzVELFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsU0FBUztxQkFDN0gsQ0FBQztpQkFDRjtnQkFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBeUIsQ0FBQyxJQUFJLEVBQWtDLEVBQUUsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUM7WUFFbEcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQztZQUN6SSxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEcsQ0FBQztRQUVELEtBQUssQ0FBQyxVQUFVLENBQUMscUJBQXVDLEVBQUUsZ0JBQXFDLEVBQUUsS0FBd0I7WUFDeEgsTUFBTSxrQkFBa0IsR0FBUSxFQUFFLENBQUM7WUFDbkMsS0FBSyxNQUFNLFlBQVksSUFBSSxxQkFBcUIsRUFBRTtnQkFDakQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLGFBQWEsRUFBRTtvQkFDbEIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2lCQUN2QzthQUNEO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsVUFBVSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUN6RSxPQUFPO2FBQ1A7WUFDRCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pGLE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQztRQUVELElBQUksYUFBYTtZQUNoQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQztRQUN6QyxDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBcUMsRUFBRSxrQkFBOEMsRUFBRSxLQUF3QjtZQUMzSCxNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUM3RixJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFO2dCQUN2RSxPQUFPO2FBQ1A7WUFDRCxPQUFPLElBQUEsaUJBQVMsRUFBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQVU7Z0JBQ3BELENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDO2dCQUNoRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDZixDQUFDO1FBRUQsSUFBSSxVQUFVO1lBQ2IsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUM7UUFDNUMsQ0FBQztRQUVELEtBQUssQ0FBQyxlQUFlLENBQUMsY0FBc0IsRUFBRSxLQUErQjtZQUM1RSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3ZDLE9BQU87YUFDUDtZQUNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2xELElBQUksT0FBTyxFQUFFO2dCQUNaLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLElBQUksRUFBRTtvQkFDVCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUM7b0JBQ2xILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDL0IsMkRBQTJEO29CQUMzRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDckQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDM0UsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO2lCQUNqQjthQUNEO1lBQ0QsT0FBTztRQUNSLENBQUM7UUFFTyx5QkFBeUIsQ0FBQyxPQUFVO1lBQzNDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7aUJBQ2hDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUNoQixJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDM0I7Z0JBQ0QsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDO3FCQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDckUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN4QixPQUFPLE1BQU0sQ0FBQztnQkFDZixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sYUFBYSxDQUFDLE9BQVU7WUFDL0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckMsSUFBSSxJQUFJLEVBQUU7Z0JBQ1QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM3RjtZQUNELE9BQU8sSUFBQSxpQkFBUyxFQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVPLGVBQWUsQ0FBQyxPQUFVLEVBQUUsTUFBaUI7WUFDcEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckMsSUFBSSxJQUFJLEVBQUU7Z0JBQ1QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzdCO1lBQ0QsT0FBTyxJQUFBLGlCQUFTLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzVELElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQzFFLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2lCQUN2RSxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNWLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxhQUFhLEVBQUU7b0JBQ2xCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUMzQyxJQUFJLElBQUksRUFBRTt3QkFDVCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQzdCO2lCQUNEO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLE1BQU0sbUJBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDckgsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTyxnQkFBZ0IsQ0FBQyxrQkFBb0Q7WUFDNUUsSUFBSSxrQkFBa0IsRUFBRTtnQkFDdkIsSUFBSSxVQUFnQyxDQUFDO2dCQUNyQyxJQUFJLE9BQU8sa0JBQWtCLEtBQUssUUFBUSxFQUFFO29CQUMzQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDbkUsVUFBVSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztpQkFDdkU7cUJBQU07b0JBQ04sVUFBVSxHQUFHLGtCQUFrQixDQUFDO2lCQUNoQztnQkFDRCxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzthQUNqRTtZQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRU8sS0FBSyxDQUFDLGtCQUFrQixDQUFDLGFBQWlCO1lBQ2pELHVCQUF1QjtZQUN2QixJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRWxDLE1BQU0sR0FBRyxHQUFHLElBQUksc0NBQXVCLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRS9FLElBQUk7Z0JBQ0gsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM3RSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUU7b0JBQ3RDLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjtnQkFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBQSxpQkFBUSxFQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO29CQUM1RSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUMxRCxPQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RILENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFO29CQUN0QyxPQUFPLFNBQVMsQ0FBQztpQkFDakI7Z0JBRUQsT0FBTyxJQUFBLGlCQUFRLEVBQUMsS0FBSyxDQUFDLENBQUM7YUFDdkI7b0JBQVM7Z0JBQ1QsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ2Q7UUFDRixDQUFDO1FBSU8sT0FBTyxDQUFDLFFBQXNCO1lBQ3JDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25ELElBQUksT0FBTyxFQUFFO2dCQUNaLHNDQUFzQztnQkFDdEMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksc0NBQXVCLEVBQUUsQ0FBQztnQkFFaEUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsY0FBYztnQkFDL0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDeEM7aUJBQU07Z0JBQ04sTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQU0sUUFBUSxDQUFDLENBQUM7Z0JBQ2pFLElBQUksZ0JBQWdCLENBQUMsTUFBTSxFQUFFO29CQUM1QixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDN0M7YUFDRDtZQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRU8sbUJBQW1CLENBQUMsUUFBYTtZQUN4QyxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQ25ELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLEtBQUssTUFBTSxXQUFXLElBQUksWUFBWSxFQUFFO2dCQUN2QyxJQUFJLFdBQVcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNsRSxxRUFBcUU7b0JBQ3JFLElBQUksV0FBVyxHQUF5QixXQUFXLENBQUM7b0JBQ3BELE9BQU8sV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTt3QkFDcEwsTUFBTSxhQUFhLEdBQWtCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUN2RixXQUFXLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO3FCQUN4RTtvQkFDRCxJQUFJLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7d0JBQ3ZDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUM5QztpQkFDRDthQUNEO1lBRUQsTUFBTSxlQUFlLEdBQXFCLEVBQUUsQ0FBQztZQUM3QywrQkFBK0I7WUFDL0IsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ25DLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLE9BQU8sRUFBRTtvQkFDWixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDckMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTt3QkFDN0UsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDN0I7aUJBQ0Q7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7UUFFTyxjQUFjLENBQUMsV0FBNkI7WUFDbkQsTUFBTSxjQUFjLEdBQTRDLEVBQUUsQ0FBQztZQUNuRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQztpQkFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNaLElBQUksSUFBSSxFQUFFO29CQUNULGNBQWMsQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO2lCQUMzQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ0osSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqSCxDQUFDO1FBRU8sV0FBVyxDQUFDLGNBQThCO1lBQ2pELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1RCxJQUFJLFVBQVUsRUFBRTtnQkFDZixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxRQUFRLEVBQUU7b0JBQ2IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLHVCQUF1QjtvQkFDdkQsT0FBTyxJQUFBLGlCQUFTLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7eUJBQy9ELElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTt3QkFDbkIsSUFBSSxXQUFXLEVBQUU7NEJBQ2hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQzlFLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNyRSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7NEJBQ25CLE9BQU8sT0FBTyxDQUFDO3lCQUNmO3dCQUNELE9BQU8sSUFBSSxDQUFDO29CQUNiLENBQUMsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Q7WUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVPLHlCQUF5QixDQUFDLE9BQVUsRUFBRSxXQUE0QixFQUFFLFVBQTJCO1lBQ3RHLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNuRSxJQUFJLFdBQVcsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDMUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSwyQ0FBMkMsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNwSDtZQUNELElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDNUMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU8sVUFBVSxDQUFDLE9BQXdDO1lBQzFELElBQUksWUFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDMUQsT0FBTyxzQ0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNwQztZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7UUFFTyxVQUFVLENBQUMsVUFBMkIsRUFBRSxPQUF3QjtZQUN2RSxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDaEgsQ0FBQztRQUVPLFdBQVcsQ0FBQyxpQkFBa0M7WUFDckQsSUFBSSxpQkFBaUIsQ0FBQyxhQUFhLEtBQUssU0FBUyxFQUFFO2dCQUNsRCxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELElBQUksYUFBaUQsQ0FBQztZQUN0RCxJQUFJLE9BQU8sR0FBdUIsU0FBUyxDQUFDO1lBQzVDLElBQUksd0JBQXdCLEdBQTBDLFNBQVMsQ0FBQztZQUNoRixJQUFJLE9BQU8saUJBQWlCLENBQUMsYUFBYSxLQUFLLFFBQVEsRUFBRTtnQkFDeEQsYUFBYSxHQUFHLGlCQUFpQixDQUFDLGFBQWEsQ0FBQzthQUNoRDtpQkFBTTtnQkFDTixhQUFhLEdBQUcsaUJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztnQkFDdEQsT0FBTyxHQUFHLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7Z0JBQ2xELHdCQUF3QixHQUFHLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQzthQUNwRjtZQUNELE9BQU8sRUFBRSxTQUFTLEVBQUUsYUFBYSxLQUFLLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLENBQUM7UUFDdkgsQ0FBQztRQUVPLGdCQUFnQixDQUFDLGlCQUFrQztZQUMxRCxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN6RSxNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxxQ0FBcUMsQ0FBQyxDQUFDO2FBQ25HO1FBQ0YsQ0FBQztRQUVPLGNBQWMsQ0FBQyxPQUFVLEVBQUUsaUJBQWtDLEVBQUUsTUFBdUI7WUFDN0YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDekMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQzlELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sSUFBSSxHQUFjO2dCQUN2QixNQUFNO2dCQUNOLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTO2dCQUNyRCxLQUFLLEVBQUUsZUFBZSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUMvRCxXQUFXLEVBQUUsaUJBQWlCLENBQUMsV0FBVztnQkFDMUMsV0FBVyxFQUFFLGlCQUFpQixDQUFDLFdBQVc7Z0JBQzFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztnQkFDbkQsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztnQkFDcEUsWUFBWSxFQUFFLGlCQUFpQixDQUFDLFlBQVk7Z0JBQzVDLElBQUk7Z0JBQ0osUUFBUSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsSUFBSSxJQUFJO2dCQUN6RCxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztnQkFDL0MsZ0JBQWdCLEVBQUUsSUFBQSx5QkFBaUIsRUFBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0I7Z0JBQ3pKLHdCQUF3QixFQUFFLGlCQUFpQixDQUFDLHdCQUF3QjtnQkFDcEUsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUM7YUFDN0MsQ0FBQztZQUVGLE9BQU87Z0JBQ04sSUFBSTtnQkFDSixhQUFhLEVBQUUsaUJBQWlCO2dCQUNoQyxNQUFNO2dCQUNOLFFBQVEsRUFBRSxTQUFTO2dCQUNuQixlQUFlO2dCQUNmLE9BQU8sS0FBVyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzlDLENBQUM7UUFDSCxDQUFDO1FBRU8sWUFBWSxDQUFDLGlCQUFrQztZQUN0RCxPQUFPLGlCQUFpQixDQUFDLFFBQVEsWUFBWSxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUM5RyxDQUFDO1FBRU8sWUFBWSxDQUFDLE9BQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFtQixFQUFFLE1BQXVCLEVBQUUsV0FBcUI7WUFDM0gsSUFBSSxFQUFFLEVBQUU7Z0JBQ1AsT0FBTyxHQUFHLGVBQWUsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFLEVBQUUsQ0FBQzthQUNuRDtZQUVELE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sTUFBTSxHQUFXLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQztZQUN6RixJQUFJLFNBQVMsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBQSxvQkFBUSxFQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDL0YsU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDckYsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNsRyxNQUFNLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUU1RCxJQUFJLE1BQXNCLENBQUM7WUFDM0IsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLEdBQUc7Z0JBQ0YsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDN0MsSUFBSSxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxjQUFjLEtBQUssTUFBTSxFQUFFO29CQUMzRSwrQkFBK0I7b0JBQy9CLHFDQUFxQztvQkFDckMsbUNBQW1DO29CQUNuQyxNQUFNO2lCQUNOO2dCQUNELE9BQU8sRUFBRSxDQUFDO2FBQ1YsUUFBUSxPQUFPLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUUxQyxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTyxnQkFBZ0IsQ0FBQyxpQkFBa0M7WUFDMUQsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsWUFBWSxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ2xHLElBQUksT0FBTyxpQkFBaUIsQ0FBQyxRQUFRLEtBQUssUUFBUTt1QkFDOUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDMUMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNwRDtnQkFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQStDLGlCQUFpQixDQUFDLFFBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN6RztZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTyxlQUFlLENBQUMsaUJBQWtDO1lBQ3pELElBQUksaUJBQWlCLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLFlBQVksWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFrRCxpQkFBaUIsQ0FBQyxRQUFTLENBQUMsSUFBSSxFQUFFO2dCQUNwTCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQStDLGlCQUFpQixDQUFDLFFBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN4RztZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTyxXQUFXLENBQUMsUUFBc0I7WUFDekMsSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN4QixPQUFPLFFBQVEsQ0FBQzthQUNoQjtZQUNELE9BQU8sU0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRU8sY0FBYyxDQUFDLE9BQVUsRUFBRSxJQUFjO1lBQ2hELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRU8sZUFBZSxDQUFDLE9BQVUsRUFBRSxPQUFpQixFQUFFLFFBQWtCLEVBQUUsVUFBMkI7WUFDckcsd0JBQXdCO1lBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0IsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUMzQztZQUVELGdDQUFnQztZQUNoQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV0Qyw4Q0FBOEM7WUFDOUMsTUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDaEUsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkYsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsYUFBYSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNuRTtRQUNGLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxJQUFjLEVBQUUsVUFBMkI7WUFDdkUsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQ3pCLFVBQVUsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO2lCQUN6QjtnQkFDRCxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMvQjtpQkFBTTtnQkFDTixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7aUJBQ2hCO2dCQUNELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3RCO1FBQ0YsQ0FBQztRQUVPLGFBQWEsQ0FBQyxhQUFpQjtZQUN0QyxJQUFJLGFBQWEsRUFBRTtnQkFDbEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzNDLElBQUksSUFBSSxFQUFFO29CQUNULElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTt3QkFDbEIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFOzRCQUNsQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUMxRCxJQUFJLFlBQVksRUFBRTtnQ0FDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQzs2QkFDekI7eUJBQ0Q7cUJBQ0Q7b0JBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7aUJBQzFCO2FBQ0Q7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ2hCO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxPQUFVO1lBQ3ZCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLElBQUksSUFBSSxFQUFFO2dCQUNULElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDbEIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO3dCQUNsQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMxRCxJQUFJLFlBQVksRUFBRTs0QkFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQzt5QkFDekI7cUJBQ0Q7aUJBQ0Q7Z0JBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNmO1FBQ0YsQ0FBQztRQUVPLFFBQVE7WUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRVEsT0FBTztZQUNmLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFMUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QyxDQUFDIn0=