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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/map", "vs/nls!vs/workbench/contrib/notebook/browser/services/notebookKernelHistoryServiceImpl", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/storage/common/storage", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookLoggingService"], function (require, exports, lifecycle_1, map_1, nls_1, actionCommonCategories_1, actions_1, storage_1, notebookKernelService_1, notebookLoggingService_1) {
    "use strict";
    var $oGb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oGb = void 0;
    const MAX_KERNELS_IN_HISTORY = 5;
    let $oGb = class $oGb extends lifecycle_1.$kc {
        static { $oGb_1 = this; }
        static { this.a = 'notebook.kernelHistory'; }
        constructor(c, f, g) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.b = {};
            this.m();
            this.B(this.c.onWillSaveState(() => this.h()));
            this.B(this.c.onDidChangeValue(1 /* StorageScope.WORKSPACE */, $oGb_1.a, this.B(new lifecycle_1.$jc()))(() => {
                this.j();
            }));
        }
        getKernels(notebook) {
            const allAvailableKernels = this.f.getMatchingKernel(notebook);
            const allKernels = allAvailableKernels.all;
            const selectedKernel = allAvailableKernels.selected;
            // We will suggest the only kernel
            const suggested = allAvailableKernels.all.length === 1 ? allAvailableKernels.all[0] : undefined;
            this.g.debug('History', `getMatchingKernels: ${allAvailableKernels.all.length} kernels available for ${notebook.uri.path}. Selected: ${allAvailableKernels.selected?.label}. Suggested: ${suggested?.label}`);
            const mostRecentKernelIds = this.b[notebook.viewType] ? [...this.b[notebook.viewType].values()] : [];
            const all = mostRecentKernelIds.map(kernelId => allKernels.find(kernel => kernel.id === kernelId)).filter(kernel => !!kernel);
            this.g.debug('History', `mru: ${mostRecentKernelIds.length} kernels in history, ${all.length} registered already.`);
            return {
                selected: selectedKernel ?? suggested,
                all
            };
        }
        addMostRecentKernel(kernel) {
            const key = kernel.id;
            const viewType = kernel.viewType;
            const recentKeynels = this.b[viewType] ?? new map_1.$Bi();
            recentKeynels.set(key, key, 1 /* Touch.AsOld */);
            if (recentKeynels.size > MAX_KERNELS_IN_HISTORY) {
                const reserved = [...recentKeynels.entries()].slice(0, MAX_KERNELS_IN_HISTORY);
                recentKeynels.fromJSON(reserved);
            }
            this.b[viewType] = recentKeynels;
        }
        h() {
            let notEmpty = false;
            for (const [_, kernels] of Object.entries(this.b)) {
                notEmpty = notEmpty || kernels.size > 0;
            }
            if (notEmpty) {
                const serialized = this.n();
                this.c.store($oGb_1.a, JSON.stringify(serialized), 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
            }
            else {
                this.c.remove($oGb_1.a, 1 /* StorageScope.WORKSPACE */);
            }
        }
        j() {
            const serialized = this.c.get($oGb_1.a, 1 /* StorageScope.WORKSPACE */);
            if (serialized) {
                try {
                    for (const [viewType, kernels] of JSON.parse(serialized)) {
                        const linkedMap = this.b[viewType] ?? new map_1.$Bi();
                        for (const entry of kernels.entries) {
                            linkedMap.set(entry, entry, 1 /* Touch.AsOld */);
                        }
                        this.b[viewType] = linkedMap;
                    }
                }
                catch (e) {
                    console.error('Deserialize notebook kernel history failed', e);
                }
            }
        }
        m() {
            const serialized = this.c.get($oGb_1.a, 1 /* StorageScope.WORKSPACE */);
            if (serialized) {
                try {
                    this.r(JSON.parse(serialized));
                }
                catch (e) {
                    this.b = {};
                }
            }
            else {
                this.b = {};
            }
        }
        n() {
            const result = Object.create(null);
            for (const [viewType, kernels] of Object.entries(this.b)) {
                result[viewType] = {
                    entries: [...kernels.values()]
                };
            }
            return result;
        }
        r(serialized) {
            this.b = {};
            for (const [viewType, kernels] of Object.entries(serialized)) {
                const linkedMap = new map_1.$Bi();
                const mapValues = [];
                for (const entry of kernels.entries) {
                    mapValues.push([entry, entry]);
                }
                linkedMap.fromJSON(mapValues);
                this.b[viewType] = linkedMap;
            }
        }
        _clear() {
            this.b = {};
            this.h();
        }
    };
    exports.$oGb = $oGb;
    exports.$oGb = $oGb = $oGb_1 = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, notebookKernelService_1.$Bbb),
        __param(2, notebookLoggingService_1.$1ob)
    ], $oGb);
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.clearNotebookKernelsMRUCache',
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Clear Notebook Kernels MRU Cache'
                },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(notebookKernelService_1.$Cbb);
            historyService._clear();
        }
    });
});
//# sourceMappingURL=notebookKernelHistoryServiceImpl.js.map