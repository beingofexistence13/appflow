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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/map", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/storage/common/storage", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookLoggingService"], function (require, exports, lifecycle_1, map_1, nls_1, actionCommonCategories_1, actions_1, storage_1, notebookKernelService_1, notebookLoggingService_1) {
    "use strict";
    var NotebookKernelHistoryService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookKernelHistoryService = void 0;
    const MAX_KERNELS_IN_HISTORY = 5;
    let NotebookKernelHistoryService = class NotebookKernelHistoryService extends lifecycle_1.Disposable {
        static { NotebookKernelHistoryService_1 = this; }
        static { this.STORAGE_KEY = 'notebook.kernelHistory'; }
        constructor(_storageService, _notebookKernelService, _notebookLoggingService) {
            super();
            this._storageService = _storageService;
            this._notebookKernelService = _notebookKernelService;
            this._notebookLoggingService = _notebookLoggingService;
            this._mostRecentKernelsMap = {};
            this._loadState();
            this._register(this._storageService.onWillSaveState(() => this._saveState()));
            this._register(this._storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, NotebookKernelHistoryService_1.STORAGE_KEY, this._register(new lifecycle_1.DisposableStore()))(() => {
                this._restoreState();
            }));
        }
        getKernels(notebook) {
            const allAvailableKernels = this._notebookKernelService.getMatchingKernel(notebook);
            const allKernels = allAvailableKernels.all;
            const selectedKernel = allAvailableKernels.selected;
            // We will suggest the only kernel
            const suggested = allAvailableKernels.all.length === 1 ? allAvailableKernels.all[0] : undefined;
            this._notebookLoggingService.debug('History', `getMatchingKernels: ${allAvailableKernels.all.length} kernels available for ${notebook.uri.path}. Selected: ${allAvailableKernels.selected?.label}. Suggested: ${suggested?.label}`);
            const mostRecentKernelIds = this._mostRecentKernelsMap[notebook.viewType] ? [...this._mostRecentKernelsMap[notebook.viewType].values()] : [];
            const all = mostRecentKernelIds.map(kernelId => allKernels.find(kernel => kernel.id === kernelId)).filter(kernel => !!kernel);
            this._notebookLoggingService.debug('History', `mru: ${mostRecentKernelIds.length} kernels in history, ${all.length} registered already.`);
            return {
                selected: selectedKernel ?? suggested,
                all
            };
        }
        addMostRecentKernel(kernel) {
            const key = kernel.id;
            const viewType = kernel.viewType;
            const recentKeynels = this._mostRecentKernelsMap[viewType] ?? new map_1.LinkedMap();
            recentKeynels.set(key, key, 1 /* Touch.AsOld */);
            if (recentKeynels.size > MAX_KERNELS_IN_HISTORY) {
                const reserved = [...recentKeynels.entries()].slice(0, MAX_KERNELS_IN_HISTORY);
                recentKeynels.fromJSON(reserved);
            }
            this._mostRecentKernelsMap[viewType] = recentKeynels;
        }
        _saveState() {
            let notEmpty = false;
            for (const [_, kernels] of Object.entries(this._mostRecentKernelsMap)) {
                notEmpty = notEmpty || kernels.size > 0;
            }
            if (notEmpty) {
                const serialized = this._serialize();
                this._storageService.store(NotebookKernelHistoryService_1.STORAGE_KEY, JSON.stringify(serialized), 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
            }
            else {
                this._storageService.remove(NotebookKernelHistoryService_1.STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            }
        }
        _restoreState() {
            const serialized = this._storageService.get(NotebookKernelHistoryService_1.STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            if (serialized) {
                try {
                    for (const [viewType, kernels] of JSON.parse(serialized)) {
                        const linkedMap = this._mostRecentKernelsMap[viewType] ?? new map_1.LinkedMap();
                        for (const entry of kernels.entries) {
                            linkedMap.set(entry, entry, 1 /* Touch.AsOld */);
                        }
                        this._mostRecentKernelsMap[viewType] = linkedMap;
                    }
                }
                catch (e) {
                    console.error('Deserialize notebook kernel history failed', e);
                }
            }
        }
        _loadState() {
            const serialized = this._storageService.get(NotebookKernelHistoryService_1.STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            if (serialized) {
                try {
                    this._deserialize(JSON.parse(serialized));
                }
                catch (e) {
                    this._mostRecentKernelsMap = {};
                }
            }
            else {
                this._mostRecentKernelsMap = {};
            }
        }
        _serialize() {
            const result = Object.create(null);
            for (const [viewType, kernels] of Object.entries(this._mostRecentKernelsMap)) {
                result[viewType] = {
                    entries: [...kernels.values()]
                };
            }
            return result;
        }
        _deserialize(serialized) {
            this._mostRecentKernelsMap = {};
            for (const [viewType, kernels] of Object.entries(serialized)) {
                const linkedMap = new map_1.LinkedMap();
                const mapValues = [];
                for (const entry of kernels.entries) {
                    mapValues.push([entry, entry]);
                }
                linkedMap.fromJSON(mapValues);
                this._mostRecentKernelsMap[viewType] = linkedMap;
            }
        }
        _clear() {
            this._mostRecentKernelsMap = {};
            this._saveState();
        }
    };
    exports.NotebookKernelHistoryService = NotebookKernelHistoryService;
    exports.NotebookKernelHistoryService = NotebookKernelHistoryService = NotebookKernelHistoryService_1 = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, notebookKernelService_1.INotebookKernelService),
        __param(2, notebookLoggingService_1.INotebookLoggingService)
    ], NotebookKernelHistoryService);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.clearNotebookKernelsMRUCache',
                title: {
                    value: (0, nls_1.localize)('workbench.notebook.clearNotebookKernelsMRUCache', "Clear Notebook Kernels MRU Cache"),
                    original: 'Clear Notebook Kernels MRU Cache'
                },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(notebookKernelService_1.INotebookKernelHistoryService);
            historyService._clear();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tLZXJuZWxIaXN0b3J5U2VydmljZUltcGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3NlcnZpY2VzL25vdGVib29rS2VybmVsSGlzdG9yeVNlcnZpY2VJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFvQmhHLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO0lBRTFCLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTZCLFNBQVEsc0JBQVU7O2lCQUc1QyxnQkFBVyxHQUFHLHdCQUF3QixBQUEzQixDQUE0QjtRQUd0RCxZQUE2QixlQUFpRCxFQUNyRCxzQkFBK0QsRUFDOUQsdUJBQWlFO1lBQzFGLEtBQUssRUFBRSxDQUFDO1lBSHFDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNwQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1lBQzdDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7WUFKbkYsMEJBQXFCLEdBQWlELEVBQUUsQ0FBQztZQU9oRixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsaUNBQXlCLDhCQUE0QixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xLLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0ws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