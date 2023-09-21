/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/common/views", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/arrays", "vs/platform/notification/common/notification", "vs/base/common/types", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extensions", "vs/platform/log/common/log", "vs/base/common/dataTransfer", "vs/workbench/api/common/shared/dataTransferCache", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, lifecycle_1, extHost_protocol_1, views_1, extHostCustomers_1, arrays_1, notification_1, types_1, platform_1, extensions_1, log_1, dataTransfer_1, dataTransferCache_1, typeConvert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTreeViews = void 0;
    let MainThreadTreeViews = class MainThreadTreeViews extends lifecycle_1.Disposable {
        constructor(extHostContext, viewsService, notificationService, extensionService, logService) {
            super();
            this.viewsService = viewsService;
            this.notificationService = notificationService;
            this.extensionService = extensionService;
            this.logService = logService;
            this._dataProviders = new Map();
            this._dndControllers = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostTreeViews);
        }
        async $registerTreeViewDataProvider(treeViewId, options) {
            this.logService.trace('MainThreadTreeViews#$registerTreeViewDataProvider', treeViewId, options);
            this.extensionService.whenInstalledExtensionsRegistered().then(() => {
                const dataProvider = new TreeViewDataProvider(treeViewId, this._proxy, this.notificationService);
                const disposables = new lifecycle_1.DisposableStore();
                this._register(disposables);
                this._dataProviders.set(treeViewId, { dataProvider, disposables });
                const dndController = (options.hasHandleDrag || options.hasHandleDrop)
                    ? new TreeViewDragAndDropController(treeViewId, options.dropMimeTypes, options.dragMimeTypes, options.hasHandleDrag, this._proxy) : undefined;
                const viewer = this.getTreeView(treeViewId);
                if (viewer) {
                    // Order is important here. The internal tree isn't created until the dataProvider is set.
                    // Set all other properties first!
                    viewer.showCollapseAllAction = options.showCollapseAll;
                    viewer.canSelectMany = options.canSelectMany;
                    viewer.manuallyManageCheckboxes = options.manuallyManageCheckboxes;
                    viewer.dragAndDropController = dndController;
                    if (dndController) {
                        this._dndControllers.set(treeViewId, dndController);
                    }
                    viewer.dataProvider = dataProvider;
                    this.registerListeners(treeViewId, viewer, disposables);
                    this._proxy.$setVisible(treeViewId, viewer.visible);
                }
                else {
                    this.notificationService.error('No view is registered with id: ' + treeViewId);
                }
            });
        }
        $reveal(treeViewId, itemInfo, options) {
            this.logService.trace('MainThreadTreeViews#$reveal', treeViewId, itemInfo?.item, itemInfo?.parentChain, options);
            return this.viewsService.openView(treeViewId, options.focus)
                .then(() => {
                const viewer = this.getTreeView(treeViewId);
                if (viewer && itemInfo) {
                    return this.reveal(viewer, this._dataProviders.get(treeViewId).dataProvider, itemInfo.item, itemInfo.parentChain, options);
                }
                return undefined;
            });
        }
        $refresh(treeViewId, itemsToRefreshByHandle) {
            this.logService.trace('MainThreadTreeViews#$refresh', treeViewId, itemsToRefreshByHandle);
            const viewer = this.getTreeView(treeViewId);
            const dataProvider = this._dataProviders.get(treeViewId);
            if (viewer && dataProvider) {
                const itemsToRefresh = dataProvider.dataProvider.getItemsToRefresh(itemsToRefreshByHandle);
                return viewer.refresh(itemsToRefresh.length ? itemsToRefresh : undefined);
            }
            return Promise.resolve();
        }
        $setMessage(treeViewId, message) {
            this.logService.trace('MainThreadTreeViews#$setMessage', treeViewId, message.toString());
            const viewer = this.getTreeView(treeViewId);
            if (viewer) {
                viewer.message = message;
            }
        }
        $setTitle(treeViewId, title, description) {
            this.logService.trace('MainThreadTreeViews#$setTitle', treeViewId, title, description);
            const viewer = this.getTreeView(treeViewId);
            if (viewer) {
                viewer.title = title;
                viewer.description = description;
            }
        }
        $setBadge(treeViewId, badge) {
            this.logService.trace('MainThreadTreeViews#$setBadge', treeViewId, badge?.value, badge?.tooltip);
            const viewer = this.getTreeView(treeViewId);
            if (viewer) {
                viewer.badge = badge;
            }
        }
        $resolveDropFileData(destinationViewId, requestId, dataItemId) {
            const controller = this._dndControllers.get(destinationViewId);
            if (!controller) {
                throw new Error('Unknown tree');
            }
            return controller.resolveDropFileData(requestId, dataItemId);
        }
        async $disposeTree(treeViewId) {
            const viewer = this.getTreeView(treeViewId);
            if (viewer) {
                viewer.dataProvider = undefined;
            }
            const dataProvider = this._dataProviders.get(treeViewId);
            if (dataProvider) {
                dataProvider.disposables.dispose();
                this._dataProviders.delete(treeViewId);
            }
        }
        async reveal(treeView, dataProvider, itemIn, parentChain, options) {
            options = options ? options : { select: false, focus: false };
            const select = (0, types_1.isUndefinedOrNull)(options.select) ? false : options.select;
            const focus = (0, types_1.isUndefinedOrNull)(options.focus) ? false : options.focus;
            let expand = Math.min((0, types_1.isNumber)(options.expand) ? options.expand : options.expand === true ? 1 : 0, 3);
            if (dataProvider.isEmpty()) {
                // Refresh if empty
                await treeView.refresh();
            }
            for (const parent of parentChain) {
                const parentItem = dataProvider.getItem(parent.handle);
                if (parentItem) {
                    await treeView.expand(parentItem);
                }
            }
            const item = dataProvider.getItem(itemIn.handle);
            if (item) {
                await treeView.reveal(item);
                if (select) {
                    treeView.setSelection([item]);
                }
                if (focus === false) {
                    treeView.setFocus();
                }
                else if (focus) {
                    treeView.setFocus(item);
                }
                let itemsToExpand = [item];
                for (; itemsToExpand.length > 0 && expand > 0; expand--) {
                    await treeView.expand(itemsToExpand);
                    itemsToExpand = itemsToExpand.reduce((result, itemValue) => {
                        const item = dataProvider.getItem(itemValue.handle);
                        if (item && item.children && item.children.length) {
                            result.push(...item.children);
                        }
                        return result;
                    }, []);
                }
            }
        }
        registerListeners(treeViewId, treeView, disposables) {
            disposables.add(treeView.onDidExpandItem(item => this._proxy.$setExpanded(treeViewId, item.handle, true)));
            disposables.add(treeView.onDidCollapseItem(item => this._proxy.$setExpanded(treeViewId, item.handle, false)));
            disposables.add(treeView.onDidChangeSelectionAndFocus(items => this._proxy.$setSelectionAndFocus(treeViewId, items.selection.map(({ handle }) => handle), items.focus.handle)));
            disposables.add(treeView.onDidChangeVisibility(isVisible => this._proxy.$setVisible(treeViewId, isVisible)));
            disposables.add(treeView.onDidChangeCheckboxState(items => {
                this._proxy.$changeCheckboxState(treeViewId, items.map(item => {
                    return { treeItemHandle: item.handle, newState: item.checkbox?.isChecked ?? false };
                }));
            }));
        }
        getTreeView(treeViewId) {
            const viewDescriptor = platform_1.Registry.as(views_1.Extensions.ViewsRegistry).getView(treeViewId);
            return viewDescriptor ? viewDescriptor.treeView : null;
        }
        dispose() {
            this._dataProviders.forEach((dataProvider, treeViewId) => {
                const treeView = this.getTreeView(treeViewId);
                if (treeView) {
                    treeView.dataProvider = undefined;
                }
            });
            this._dataProviders.clear();
            this._dndControllers.clear();
            super.dispose();
        }
    };
    exports.MainThreadTreeViews = MainThreadTreeViews;
    exports.MainThreadTreeViews = MainThreadTreeViews = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadTreeViews),
        __param(1, views_1.IViewsService),
        __param(2, notification_1.INotificationService),
        __param(3, extensions_1.IExtensionService),
        __param(4, log_1.ILogService)
    ], MainThreadTreeViews);
    class TreeViewDragAndDropController {
        constructor(treeViewId, dropMimeTypes, dragMimeTypes, hasWillDrop, _proxy) {
            this.treeViewId = treeViewId;
            this.dropMimeTypes = dropMimeTypes;
            this.dragMimeTypes = dragMimeTypes;
            this.hasWillDrop = hasWillDrop;
            this._proxy = _proxy;
            this.dataTransfersCache = new dataTransferCache_1.DataTransferFileCache();
        }
        async handleDrop(dataTransfer, targetTreeItem, token, operationUuid, sourceTreeId, sourceTreeItemHandles) {
            const request = this.dataTransfersCache.add(dataTransfer);
            try {
                const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                if (token.isCancellationRequested) {
                    return;
                }
                return await this._proxy.$handleDrop(this.treeViewId, request.id, dataTransferDto, targetTreeItem?.handle, token, operationUuid, sourceTreeId, sourceTreeItemHandles);
            }
            finally {
                request.dispose();
            }
        }
        async handleDrag(sourceTreeItemHandles, operationUuid, token) {
            if (!this.hasWillDrop) {
                return;
            }
            const additionalDataTransferDTO = await this._proxy.$handleDrag(this.treeViewId, sourceTreeItemHandles, operationUuid, token);
            if (!additionalDataTransferDTO) {
                return;
            }
            const additionalDataTransfer = new dataTransfer_1.VSDataTransfer();
            additionalDataTransferDTO.items.forEach(([type, item]) => {
                additionalDataTransfer.replace(type, (0, dataTransfer_1.createStringDataTransferItem)(item.asString));
            });
            return additionalDataTransfer;
        }
        resolveDropFileData(requestId, dataItemId) {
            return this.dataTransfersCache.resolveFileData(requestId, dataItemId);
        }
    }
    class TreeViewDataProvider {
        constructor(treeViewId, _proxy, notificationService) {
            this.treeViewId = treeViewId;
            this._proxy = _proxy;
            this.notificationService = notificationService;
            this.itemsMap = new Map();
            this.hasResolve = this._proxy.$hasResolve(this.treeViewId);
        }
        getChildren(treeItem) {
            return this._proxy.$getChildren(this.treeViewId, treeItem ? treeItem.handle : undefined)
                .then(children => this.postGetChildren(children), err => {
                // It can happen that a tree view is disposed right as `getChildren` is called. This results in an error because the data provider gets removed.
                // The tree will shortly get cleaned up in this case. We just need to handle the error here.
                if (!views_1.NoTreeViewError.is(err)) {
                    this.notificationService.error(err);
                }
                return [];
            });
        }
        getItemsToRefresh(itemsToRefreshByHandle) {
            const itemsToRefresh = [];
            if (itemsToRefreshByHandle) {
                for (const treeItemHandle of Object.keys(itemsToRefreshByHandle)) {
                    const currentTreeItem = this.getItem(treeItemHandle);
                    if (currentTreeItem) { // Refresh only if the item exists
                        const treeItem = itemsToRefreshByHandle[treeItemHandle];
                        // Update the current item with refreshed item
                        this.updateTreeItem(currentTreeItem, treeItem);
                        if (treeItemHandle === treeItem.handle) {
                            itemsToRefresh.push(currentTreeItem);
                        }
                        else {
                            // Update maps when handle is changed and refresh parent
                            this.itemsMap.delete(treeItemHandle);
                            this.itemsMap.set(currentTreeItem.handle, currentTreeItem);
                            const parent = treeItem.parentHandle ? this.itemsMap.get(treeItem.parentHandle) : null;
                            if (parent) {
                                itemsToRefresh.push(parent);
                            }
                        }
                    }
                }
            }
            return itemsToRefresh;
        }
        getItem(treeItemHandle) {
            return this.itemsMap.get(treeItemHandle);
        }
        isEmpty() {
            return this.itemsMap.size === 0;
        }
        async postGetChildren(elements) {
            if (elements === undefined) {
                return undefined;
            }
            const result = [];
            const hasResolve = await this.hasResolve;
            if (elements) {
                for (const element of elements) {
                    const resolvable = new views_1.ResolvableTreeItem(element, hasResolve ? (token) => {
                        return this._proxy.$resolve(this.treeViewId, element.handle, token);
                    } : undefined);
                    this.itemsMap.set(element.handle, resolvable);
                    result.push(resolvable);
                }
            }
            return result;
        }
        updateTreeItem(current, treeItem) {
            treeItem.children = treeItem.children ? treeItem.children : undefined;
            if (current) {
                const properties = (0, arrays_1.distinct)([...Object.keys(current instanceof views_1.ResolvableTreeItem ? current.asTreeItem() : current),
                    ...Object.keys(treeItem)]);
                for (const property of properties) {
                    current[property] = treeItem[property];
                }
                if (current instanceof views_1.ResolvableTreeItem) {
                    current.resetResolve();
                }
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFRyZWVWaWV3cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkVHJlZVZpZXdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTtRQU1sRCxZQUNDLGNBQStCLEVBQ2hCLFlBQTRDLEVBQ3JDLG1CQUEwRCxFQUM3RCxnQkFBb0QsRUFDMUQsVUFBd0M7WUFFckQsS0FBSyxFQUFFLENBQUM7WUFMd0IsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDcEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3pDLGVBQVUsR0FBVixVQUFVLENBQWE7WUFSckMsbUJBQWMsR0FBc0YsSUFBSSxHQUFHLEVBQWdGLENBQUM7WUFDNUwsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBeUMsQ0FBQztZQVVuRixJQUFJLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFRCxLQUFLLENBQUMsNkJBQTZCLENBQUMsVUFBa0IsRUFBRSxPQUFrTTtZQUN6UCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxtREFBbUQsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFaEcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlDQUFpQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDbkUsTUFBTSxZQUFZLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFD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