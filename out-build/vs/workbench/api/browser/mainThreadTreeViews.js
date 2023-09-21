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
    exports.$7kb = void 0;
    let $7kb = class $7kb extends lifecycle_1.$kc {
        constructor(extHostContext, f, g, h, j) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.b = new Map();
            this.c = new Map();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostTreeViews);
        }
        async $registerTreeViewDataProvider(treeViewId, options) {
            this.j.trace('MainThreadTreeViews#$registerTreeViewDataProvider', treeViewId, options);
            this.h.whenInstalledExtensionsRegistered().then(() => {
                const dataProvider = new TreeViewDataProvider(treeViewId, this.a, this.g);
                const disposables = new lifecycle_1.$jc();
                this.B(disposables);
                this.b.set(treeViewId, { dataProvider, disposables });
                const dndController = (options.hasHandleDrag || options.hasHandleDrop)
                    ? new TreeViewDragAndDropController(treeViewId, options.dropMimeTypes, options.dragMimeTypes, options.hasHandleDrag, this.a) : undefined;
                const viewer = this.r(treeViewId);
                if (viewer) {
                    // Order is important here. The internal tree isn't created until the dataProvider is set.
                    // Set all other properties first!
                    viewer.showCollapseAllAction = options.showCollapseAll;
                    viewer.canSelectMany = options.canSelectMany;
                    viewer.manuallyManageCheckboxes = options.manuallyManageCheckboxes;
                    viewer.dragAndDropController = dndController;
                    if (dndController) {
                        this.c.set(treeViewId, dndController);
                    }
                    viewer.dataProvider = dataProvider;
                    this.n(treeViewId, viewer, disposables);
                    this.a.$setVisible(treeViewId, viewer.visible);
                }
                else {
                    this.g.error('No view is registered with id: ' + treeViewId);
                }
            });
        }
        $reveal(treeViewId, itemInfo, options) {
            this.j.trace('MainThreadTreeViews#$reveal', treeViewId, itemInfo?.item, itemInfo?.parentChain, options);
            return this.f.openView(treeViewId, options.focus)
                .then(() => {
                const viewer = this.r(treeViewId);
                if (viewer && itemInfo) {
                    return this.m(viewer, this.b.get(treeViewId).dataProvider, itemInfo.item, itemInfo.parentChain, options);
                }
                return undefined;
            });
        }
        $refresh(treeViewId, itemsToRefreshByHandle) {
            this.j.trace('MainThreadTreeViews#$refresh', treeViewId, itemsToRefreshByHandle);
            const viewer = this.r(treeViewId);
            const dataProvider = this.b.get(treeViewId);
            if (viewer && dataProvider) {
                const itemsToRefresh = dataProvider.dataProvider.getItemsToRefresh(itemsToRefreshByHandle);
                return viewer.refresh(itemsToRefresh.length ? itemsToRefresh : undefined);
            }
            return Promise.resolve();
        }
        $setMessage(treeViewId, message) {
            this.j.trace('MainThreadTreeViews#$setMessage', treeViewId, message.toString());
            const viewer = this.r(treeViewId);
            if (viewer) {
                viewer.message = message;
            }
        }
        $setTitle(treeViewId, title, description) {
            this.j.trace('MainThreadTreeViews#$setTitle', treeViewId, title, description);
            const viewer = this.r(treeViewId);
            if (viewer) {
                viewer.title = title;
                viewer.description = description;
            }
        }
        $setBadge(treeViewId, badge) {
            this.j.trace('MainThreadTreeViews#$setBadge', treeViewId, badge?.value, badge?.tooltip);
            const viewer = this.r(treeViewId);
            if (viewer) {
                viewer.badge = badge;
            }
        }
        $resolveDropFileData(destinationViewId, requestId, dataItemId) {
            const controller = this.c.get(destinationViewId);
            if (!controller) {
                throw new Error('Unknown tree');
            }
            return controller.resolveDropFileData(requestId, dataItemId);
        }
        async $disposeTree(treeViewId) {
            const viewer = this.r(treeViewId);
            if (viewer) {
                viewer.dataProvider = undefined;
            }
            const dataProvider = this.b.get(treeViewId);
            if (dataProvider) {
                dataProvider.disposables.dispose();
                this.b.delete(treeViewId);
            }
        }
        async m(treeView, dataProvider, itemIn, parentChain, options) {
            options = options ? options : { select: false, focus: false };
            const select = (0, types_1.$sf)(options.select) ? false : options.select;
            const focus = (0, types_1.$sf)(options.focus) ? false : options.focus;
            let expand = Math.min((0, types_1.$nf)(options.expand) ? options.expand : options.expand === true ? 1 : 0, 3);
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
        n(treeViewId, treeView, disposables) {
            disposables.add(treeView.onDidExpandItem(item => this.a.$setExpanded(treeViewId, item.handle, true)));
            disposables.add(treeView.onDidCollapseItem(item => this.a.$setExpanded(treeViewId, item.handle, false)));
            disposables.add(treeView.onDidChangeSelectionAndFocus(items => this.a.$setSelectionAndFocus(treeViewId, items.selection.map(({ handle }) => handle), items.focus.handle)));
            disposables.add(treeView.onDidChangeVisibility(isVisible => this.a.$setVisible(treeViewId, isVisible)));
            disposables.add(treeView.onDidChangeCheckboxState(items => {
                this.a.$changeCheckboxState(treeViewId, items.map(item => {
                    return { treeItemHandle: item.handle, newState: item.checkbox?.isChecked ?? false };
                }));
            }));
        }
        r(treeViewId) {
            const viewDescriptor = platform_1.$8m.as(views_1.Extensions.ViewsRegistry).getView(treeViewId);
            return viewDescriptor ? viewDescriptor.treeView : null;
        }
        dispose() {
            this.b.forEach((dataProvider, treeViewId) => {
                const treeView = this.r(treeViewId);
                if (treeView) {
                    treeView.dataProvider = undefined;
                }
            });
            this.b.clear();
            this.c.clear();
            super.dispose();
        }
    };
    exports.$7kb = $7kb;
    exports.$7kb = $7kb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadTreeViews),
        __param(1, views_1.$$E),
        __param(2, notification_1.$Yu),
        __param(3, extensions_1.$MF),
        __param(4, log_1.$5i)
    ], $7kb);
    class TreeViewDragAndDropController {
        constructor(b, dropMimeTypes, dragMimeTypes, hasWillDrop, c) {
            this.b = b;
            this.dropMimeTypes = dropMimeTypes;
            this.dragMimeTypes = dragMimeTypes;
            this.hasWillDrop = hasWillDrop;
            this.c = c;
            this.a = new dataTransferCache_1.$rkb();
        }
        async handleDrop(dataTransfer, targetTreeItem, token, operationUuid, sourceTreeId, sourceTreeItemHandles) {
            const request = this.a.add(dataTransfer);
            try {
                const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                if (token.isCancellationRequested) {
                    return;
                }
                return await this.c.$handleDrop(this.b, request.id, dataTransferDto, targetTreeItem?.handle, token, operationUuid, sourceTreeId, sourceTreeItemHandles);
            }
            finally {
                request.dispose();
            }
        }
        async handleDrag(sourceTreeItemHandles, operationUuid, token) {
            if (!this.hasWillDrop) {
                return;
            }
            const additionalDataTransferDTO = await this.c.$handleDrag(this.b, sourceTreeItemHandles, operationUuid, token);
            if (!additionalDataTransferDTO) {
                return;
            }
            const additionalDataTransfer = new dataTransfer_1.$Rs();
            additionalDataTransferDTO.items.forEach(([type, item]) => {
                additionalDataTransfer.replace(type, (0, dataTransfer_1.$Ps)(item.asString));
            });
            return additionalDataTransfer;
        }
        resolveDropFileData(requestId, dataItemId) {
            return this.a.resolveFileData(requestId, dataItemId);
        }
    }
    class TreeViewDataProvider {
        constructor(c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.a = new Map();
            this.b = this.d.$hasResolve(this.c);
        }
        getChildren(treeItem) {
            return this.d.$getChildren(this.c, treeItem ? treeItem.handle : undefined)
                .then(children => this.f(children), err => {
                // It can happen that a tree view is disposed right as `getChildren` is called. This results in an error because the data provider gets removed.
                // The tree will shortly get cleaned up in this case. We just need to handle the error here.
                if (!views_1.$bF.is(err)) {
                    this.e.error(err);
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
                        this.g(currentTreeItem, treeItem);
                        if (treeItemHandle === treeItem.handle) {
                            itemsToRefresh.push(currentTreeItem);
                        }
                        else {
                            // Update maps when handle is changed and refresh parent
                            this.a.delete(treeItemHandle);
                            this.a.set(currentTreeItem.handle, currentTreeItem);
                            const parent = treeItem.parentHandle ? this.a.get(treeItem.parentHandle) : null;
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
            return this.a.get(treeItemHandle);
        }
        isEmpty() {
            return this.a.size === 0;
        }
        async f(elements) {
            if (elements === undefined) {
                return undefined;
            }
            const result = [];
            const hasResolve = await this.b;
            if (elements) {
                for (const element of elements) {
                    const resolvable = new views_1.$aF(element, hasResolve ? (token) => {
                        return this.d.$resolve(this.c, element.handle, token);
                    } : undefined);
                    this.a.set(element.handle, resolvable);
                    result.push(resolvable);
                }
            }
            return result;
        }
        g(current, treeItem) {
            treeItem.children = treeItem.children ? treeItem.children : undefined;
            if (current) {
                const properties = (0, arrays_1.$Kb)([...Object.keys(current instanceof views_1.$aF ? current.asTreeItem() : current),
                    ...Object.keys(treeItem)]);
                for (const property of properties) {
                    current[property] = treeItem[property];
                }
                if (current instanceof views_1.$aF) {
                    current.resetResolve();
                }
            }
        }
    }
});
//# sourceMappingURL=mainThreadTreeViews.js.map