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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/storage/common/storage", "vs/base/common/uri", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/common/async", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/base/common/network"], function (require, exports, event_1, lifecycle_1, map_1, storage_1, uri_1, notebookService_1, async_1, actions_1, contextkey_1, network_1) {
    "use strict";
    var NotebookKernelService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookKernelService = void 0;
    class KernelInfo {
        static { this._logicClock = 0; }
        constructor(kernel) {
            this.notebookPriorities = new map_1.ResourceMap();
            this.kernel = kernel;
            this.score = -1;
            this.time = KernelInfo._logicClock++;
        }
    }
    class NotebookTextModelLikeId {
        static str(k) {
            return `${k.viewType}/${k.uri.toString()}`;
        }
        static obj(s) {
            const idx = s.indexOf('/');
            return {
                viewType: s.substring(0, idx),
                uri: uri_1.URI.parse(s.substring(idx + 1))
            };
        }
    }
    class SourceAction extends lifecycle_1.Disposable {
        constructor(action, model, isPrimary) {
            super();
            this.action = action;
            this.model = model;
            this.isPrimary = isPrimary;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
        }
        async runAction() {
            if (this.execution) {
                return this.execution;
            }
            this.execution = this._runAction();
            this._onDidChangeState.fire();
            await this.execution;
            this.execution = undefined;
            this._onDidChangeState.fire();
        }
        async _runAction() {
            try {
                await this.action.run({
                    uri: this.model.uri,
                    $mid: 14 /* MarshalledId.NotebookActionContext */
                });
            }
            catch (error) {
                console.warn(`Kernel source command failed: ${error}`);
            }
        }
    }
    let NotebookKernelService = class NotebookKernelService extends lifecycle_1.Disposable {
        static { NotebookKernelService_1 = this; }
        static { this._storageNotebookBinding = 'notebook.controller2NotebookBindings'; }
        constructor(_notebookService, _storageService, _menuService, _contextKeyService) {
            super();
            this._notebookService = _notebookService;
            this._storageService = _storageService;
            this._menuService = _menuService;
            this._contextKeyService = _contextKeyService;
            this._kernels = new Map();
            this._notebookBindings = new map_1.LRUCache(1000, 0.7);
            this._onDidChangeNotebookKernelBinding = this._register(new event_1.Emitter());
            this._onDidAddKernel = this._register(new event_1.Emitter());
            this._onDidRemoveKernel = this._register(new event_1.Emitter());
            this._onDidChangeNotebookAffinity = this._register(new event_1.Emitter());
            this._onDidChangeSourceActions = this._register(new event_1.Emitter());
            this._kernelSources = new Map();
            this._kernelSourceActionsUpdates = new Map();
            this._kernelDetectionTasks = new Map();
            this._onDidChangeKernelDetectionTasks = this._register(new event_1.Emitter());
            this._kernelSourceActionProviders = new Map();
            this.onDidChangeSelectedNotebooks = this._onDidChangeNotebookKernelBinding.event;
            this.onDidAddKernel = this._onDidAddKernel.event;
            this.onDidRemoveKernel = this._onDidRemoveKernel.event;
            this.onDidChangeNotebookAffinity = this._onDidChangeNotebookAffinity.event;
            this.onDidChangeSourceActions = this._onDidChangeSourceActions.event;
            this.onDidChangeKernelDetectionTasks = this._onDidChangeKernelDetectionTasks.event;
            // auto associate kernels to new notebook documents, also emit event when
            // a notebook has been closed (but don't update the memento)
            this._register(_notebookService.onDidAddNotebookDocument(this._tryAutoBindNotebook, this));
            this._register(_notebookService.onWillRemoveNotebookDocument(notebook => {
                const id = NotebookTextModelLikeId.str(notebook);
                const kernelId = this._notebookBindings.get(id);
                if (kernelId && notebook.uri.scheme === network_1.Schemas.untitled) {
                    this.selectKernelForNotebook(undefined, notebook);
                }
                this._kernelSourceActionsUpdates.get(id)?.dispose();
                this._kernelSourceActionsUpdates.delete(id);
            }));
            // restore from storage
            try {
                const data = JSON.parse(this._storageService.get(NotebookKernelService_1._storageNotebookBinding, 1 /* StorageScope.WORKSPACE */, '[]'));
                this._notebookBindings.fromJSON(data);
            }
            catch {
                // ignore
            }
        }
        dispose() {
            this._kernels.clear();
            this._kernelSources.forEach(v => {
                v.menu.dispose();
                v.actions.forEach(a => a[1].dispose());
            });
            this._kernelSourceActionsUpdates.forEach(v => {
                v.dispose();
            });
            this._kernelSourceActionsUpdates.clear();
            super.dispose();
        }
        _persistMementos() {
            this._persistSoonHandle?.dispose();
            this._persistSoonHandle = (0, async_1.runWhenIdle)(() => {
                this._storageService.store(NotebookKernelService_1._storageNotebookBinding, JSON.stringify(this._notebookBindings), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }, 100);
        }
        static _score(kernel, notebook) {
            if (kernel.viewType === '*') {
                return 5;
            }
            else if (kernel.viewType === notebook.viewType) {
                return 10;
            }
            else {
                return 0;
            }
        }
        _tryAutoBindNotebook(notebook, onlyThisKernel) {
            const id = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
            if (!id) {
                // no kernel associated
                return;
            }
            const existingKernel = this._kernels.get(id);
            if (!existingKernel || !NotebookKernelService_1._score(existingKernel.kernel, notebook)) {
                // associated kernel not known, not matching
                return;
            }
            if (!onlyThisKernel || existingKernel.kernel === onlyThisKernel) {
                this._onDidChangeNotebookKernelBinding.fire({ notebook: notebook.uri, oldKernel: undefined, newKernel: existingKernel.kernel.id });
            }
        }
        registerKernel(kernel) {
            if (this._kernels.has(kernel.id)) {
                throw new Error(`NOTEBOOK CONTROLLER with id '${kernel.id}' already exists`);
            }
            this._kernels.set(kernel.id, new KernelInfo(kernel));
            this._onDidAddKernel.fire(kernel);
            // auto associate the new kernel to existing notebooks it was
            // associated to in the past.
            for (const notebook of this._notebookService.getNotebookTextModels()) {
                this._tryAutoBindNotebook(notebook, kernel);
            }
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._kernels.delete(kernel.id)) {
                    this._onDidRemoveKernel.fire(kernel);
                }
                for (const [key, candidate] of Array.from(this._notebookBindings)) {
                    if (candidate === kernel.id) {
                        this._onDidChangeNotebookKernelBinding.fire({ notebook: NotebookTextModelLikeId.obj(key).uri, oldKernel: kernel.id, newKernel: undefined });
                    }
                }
            });
        }
        getMatchingKernel(notebook) {
            // all applicable kernels
            const kernels = [];
            for (const info of this._kernels.values()) {
                const score = NotebookKernelService_1._score(info.kernel, notebook);
                if (score) {
                    kernels.push({
                        score,
                        kernel: info.kernel,
                        instanceAffinity: info.notebookPriorities.get(notebook.uri) ?? 1 /* vscode.NotebookControllerPriority.Default */,
                    });
                }
            }
            kernels
                .sort((a, b) => b.instanceAffinity - a.instanceAffinity || a.score - b.score || a.kernel.label.localeCompare(b.kernel.label));
            const all = kernels.map(obj => obj.kernel);
            // bound kernel
            const selectedId = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
            const selected = selectedId ? this._kernels.get(selectedId)?.kernel : undefined;
            const suggestions = kernels.filter(item => item.instanceAffinity > 1).map(item => item.kernel);
            const hidden = kernels.filter(item => item.instanceAffinity < 0).map(item => item.kernel);
            return { all, selected, suggestions, hidden };
        }
        getSelectedOrSuggestedKernel(notebook) {
            const info = this.getMatchingKernel(notebook);
            if (info.selected) {
                return info.selected;
            }
            const preferred = info.all.filter(kernel => this._kernels.get(kernel.id)?.notebookPriorities.get(notebook.uri) === 2 /* vscode.NotebookControllerPriority.Preferred */);
            if (preferred.length === 1) {
                return preferred[0];
            }
            return info.all.length === 1 ? info.all[0] : undefined;
        }
        // a notebook has one kernel, a kernel has N notebooks
        // notebook <-1----N-> kernel
        selectKernelForNotebook(kernel, notebook) {
            const key = NotebookTextModelLikeId.str(notebook);
            const oldKernel = this._notebookBindings.get(key);
            if (oldKernel !== kernel?.id) {
                if (kernel) {
                    this._notebookBindings.set(key, kernel.id);
                }
                else {
                    this._notebookBindings.delete(key);
                }
                this._onDidChangeNotebookKernelBinding.fire({ notebook: notebook.uri, oldKernel, newKernel: kernel?.id });
                this._persistMementos();
            }
        }
        preselectKernelForNotebook(kernel, notebook) {
            const key = NotebookTextModelLikeId.str(notebook);
            const oldKernel = this._notebookBindings.get(key);
            if (oldKernel !== kernel?.id) {
                this._notebookBindings.set(key, kernel.id);
                this._persistMementos();
            }
        }
        updateKernelNotebookAffinity(kernel, notebook, preference) {
            const info = this._kernels.get(kernel.id);
            if (!info) {
                throw new Error(`UNKNOWN kernel '${kernel.id}'`);
            }
            if (preference === undefined) {
                info.notebookPriorities.delete(notebook);
            }
            else {
                info.notebookPriorities.set(notebook, preference);
            }
            this._onDidChangeNotebookAffinity.fire();
        }
        getRunningSourceActions(notebook) {
            const id = NotebookTextModelLikeId.str(notebook);
            const existingInfo = this._kernelSources.get(id);
            if (existingInfo) {
                return existingInfo.actions.filter(action => action[0].execution).map(action => action[0]);
            }
            return [];
        }
        getSourceActions(notebook, contextKeyService) {
            contextKeyService = contextKeyService ?? this._contextKeyService;
            const id = NotebookTextModelLikeId.str(notebook);
            const existingInfo = this._kernelSources.get(id);
            if (existingInfo) {
                return existingInfo.actions.map(a => a[0]);
            }
            const sourceMenu = this._register(this._menuService.createMenu(actions_1.MenuId.NotebookKernelSource, contextKeyService));
            const info = { menu: sourceMenu, actions: [] };
            const loadActionsFromMenu = (menu, document) => {
                const groups = menu.getActions({ shouldForwardArgs: true });
                const sourceActions = [];
                groups.forEach(group => {
                    const isPrimary = /^primary/.test(group[0]);
                    group[1].forEach(action => {
                        const sourceAction = new SourceAction(action, document, isPrimary);
                        const stateChangeListener = sourceAction.onDidChangeState(() => {
                            this._onDidChangeSourceActions.fire({
                                notebook: document.uri,
                                viewType: document.viewType,
                            });
                        });
                        sourceActions.push([sourceAction, stateChangeListener]);
                    });
                });
                info.actions = sourceActions;
                this._kernelSources.set(id, info);
                this._onDidChangeSourceActions.fire({ notebook: document.uri, viewType: document.viewType });
            };
            this._kernelSourceActionsUpdates.get(id)?.dispose();
            this._kernelSourceActionsUpdates.set(id, sourceMenu.onDidChange(() => {
                loadActionsFromMenu(sourceMenu, notebook);
            }));
            loadActionsFromMenu(sourceMenu, notebook);
            return info.actions.map(a => a[0]);
        }
        registerNotebookKernelDetectionTask(task) {
            const notebookType = task.notebookType;
            const all = this._kernelDetectionTasks.get(notebookType) ?? [];
            all.push(task);
            this._kernelDetectionTasks.set(notebookType, all);
            this._onDidChangeKernelDetectionTasks.fire(notebookType);
            return (0, lifecycle_1.toDisposable)(() => {
                const all = this._kernelDetectionTasks.get(notebookType) ?? [];
                const idx = all.indexOf(task);
                if (idx >= 0) {
                    all.splice(idx, 1);
                    this._kernelDetectionTasks.set(notebookType, all);
                    this._onDidChangeKernelDetectionTasks.fire(notebookType);
                }
            });
        }
        getKernelDetectionTasks(notebook) {
            return this._kernelDetectionTasks.get(notebook.viewType) ?? [];
        }
        registerKernelSourceActionProvider(viewType, provider) {
            const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
            providers.push(provider);
            this._kernelSourceActionProviders.set(viewType, providers);
            this._onDidChangeSourceActions.fire({ viewType: viewType });
            const eventEmitterDisposable = provider.onDidChangeSourceActions?.(() => {
                this._onDidChangeSourceActions.fire({ viewType: viewType });
            });
            return (0, lifecycle_1.toDisposable)(() => {
                const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
                const idx = providers.indexOf(provider);
                if (idx >= 0) {
                    providers.splice(idx, 1);
                    this._kernelSourceActionProviders.set(viewType, providers);
                }
                eventEmitterDisposable?.dispose();
            });
        }
        /**
         * Get kernel source actions from providers
         */
        getKernelSourceActions2(notebook) {
            const viewType = notebook.viewType;
            const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
            const promises = providers.map(provider => provider.provideKernelSourceActions());
            return Promise.all(promises).then(actions => {
                return actions.reduce((a, b) => a.concat(b), []);
            });
        }
    };
    exports.NotebookKernelService = NotebookKernelService;
    exports.NotebookKernelService = NotebookKernelService = NotebookKernelService_1 = __decorate([
        __param(0, notebookService_1.INotebookService),
        __param(1, storage_1.IStorageService),
        __param(2, actions_1.IMenuService),
        __param(3, contextkey_1.IContextKeyService)
    ], NotebookKernelService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tLZXJuZWxTZXJ2aWNlSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvc2VydmljZXMvbm90ZWJvb2tLZXJuZWxTZXJ2aWNlSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBaUJoRyxNQUFNLFVBQVU7aUJBRUEsZ0JBQVcsR0FBRyxDQUFDLEFBQUosQ0FBSztRQVEvQixZQUFZLE1BQXVCO1lBRjFCLHVCQUFrQixHQUFHLElBQUksaUJBQVcsRUFBVSxDQUFDO1lBR3ZELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdEMsQ0FBQzs7SUFHRixNQUFNLHVCQUF1QjtRQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQXlCO1lBQ25DLE9BQU8sR0FBRyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFTO1lBQ25CLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsT0FBTztnQkFDTixRQUFRLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO2dCQUM3QixHQUFHLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNwQyxDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBRUQsTUFBTSxZQUFhLFNBQVEs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