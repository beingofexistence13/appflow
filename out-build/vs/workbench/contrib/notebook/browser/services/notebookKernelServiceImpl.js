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
    var $8Eb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8Eb = void 0;
    class KernelInfo {
        static { this.c = 0; }
        constructor(kernel) {
            this.notebookPriorities = new map_1.$zi();
            this.kernel = kernel;
            this.score = -1;
            this.time = KernelInfo.c++;
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
    class SourceAction extends lifecycle_1.$kc {
        constructor(action, model, isPrimary) {
            super();
            this.action = action;
            this.model = model;
            this.isPrimary = isPrimary;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeState = this.c.event;
        }
        async runAction() {
            if (this.execution) {
                return this.execution;
            }
            this.execution = this.f();
            this.c.fire();
            await this.execution;
            this.execution = undefined;
            this.c.fire();
        }
        async f() {
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
    let $8Eb = class $8Eb extends lifecycle_1.$kc {
        static { $8Eb_1 = this; }
        static { this.z = 'notebook.controller2NotebookBindings'; }
        constructor(C, D, F, G) {
            super();
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.c = new Map();
            this.f = new map_1.$Ci(1000, 0.7);
            this.g = this.B(new event_1.$fd());
            this.h = this.B(new event_1.$fd());
            this.j = this.B(new event_1.$fd());
            this.m = this.B(new event_1.$fd());
            this.n = this.B(new event_1.$fd());
            this.r = new Map();
            this.t = new Map();
            this.u = new Map();
            this.w = this.B(new event_1.$fd());
            this.y = new Map();
            this.onDidChangeSelectedNotebooks = this.g.event;
            this.onDidAddKernel = this.h.event;
            this.onDidRemoveKernel = this.j.event;
            this.onDidChangeNotebookAffinity = this.m.event;
            this.onDidChangeSourceActions = this.n.event;
            this.onDidChangeKernelDetectionTasks = this.w.event;
            // auto associate kernels to new notebook documents, also emit event when
            // a notebook has been closed (but don't update the memento)
            this.B(C.onDidAddNotebookDocument(this.L, this));
            this.B(C.onWillRemoveNotebookDocument(notebook => {
                const id = NotebookTextModelLikeId.str(notebook);
                const kernelId = this.f.get(id);
                if (kernelId && notebook.uri.scheme === network_1.Schemas.untitled) {
                    this.selectKernelForNotebook(undefined, notebook);
                }
                this.t.get(id)?.dispose();
                this.t.delete(id);
            }));
            // restore from storage
            try {
                const data = JSON.parse(this.D.get($8Eb_1.z, 1 /* StorageScope.WORKSPACE */, '[]'));
                this.f.fromJSON(data);
            }
            catch {
                // ignore
            }
        }
        dispose() {
            this.c.clear();
            this.r.forEach(v => {
                v.menu.dispose();
                v.actions.forEach(a => a[1].dispose());
            });
            this.t.forEach(v => {
                v.dispose();
            });
            this.t.clear();
            super.dispose();
        }
        I() {
            this.H?.dispose();
            this.H = (0, async_1.$Wg)(() => {
                this.D.store($8Eb_1.z, JSON.stringify(this.f), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }, 100);
        }
        static J(kernel, notebook) {
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
        L(notebook, onlyThisKernel) {
            const id = this.f.get(NotebookTextModelLikeId.str(notebook));
            if (!id) {
                // no kernel associated
                return;
            }
            const existingKernel = this.c.get(id);
            if (!existingKernel || !$8Eb_1.J(existingKernel.kernel, notebook)) {
                // associated kernel not known, not matching
                return;
            }
            if (!onlyThisKernel || existingKernel.kernel === onlyThisKernel) {
                this.g.fire({ notebook: notebook.uri, oldKernel: undefined, newKernel: existingKernel.kernel.id });
            }
        }
        registerKernel(kernel) {
            if (this.c.has(kernel.id)) {
                throw new Error(`NOTEBOOK CONTROLLER with id '${kernel.id}' already exists`);
            }
            this.c.set(kernel.id, new KernelInfo(kernel));
            this.h.fire(kernel);
            // auto associate the new kernel to existing notebooks it was
            // associated to in the past.
            for (const notebook of this.C.getNotebookTextModels()) {
                this.L(notebook, kernel);
            }
            return (0, lifecycle_1.$ic)(() => {
                if (this.c.delete(kernel.id)) {
                    this.j.fire(kernel);
                }
                for (const [key, candidate] of Array.from(this.f)) {
                    if (candidate === kernel.id) {
                        this.g.fire({ notebook: NotebookTextModelLikeId.obj(key).uri, oldKernel: kernel.id, newKernel: undefined });
                    }
                }
            });
        }
        getMatchingKernel(notebook) {
            // all applicable kernels
            const kernels = [];
            for (const info of this.c.values()) {
                const score = $8Eb_1.J(info.kernel, notebook);
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
            const selectedId = this.f.get(NotebookTextModelLikeId.str(notebook));
            const selected = selectedId ? this.c.get(selectedId)?.kernel : undefined;
            const suggestions = kernels.filter(item => item.instanceAffinity > 1).map(item => item.kernel);
            const hidden = kernels.filter(item => item.instanceAffinity < 0).map(item => item.kernel);
            return { all, selected, suggestions, hidden };
        }
        getSelectedOrSuggestedKernel(notebook) {
            const info = this.getMatchingKernel(notebook);
            if (info.selected) {
                return info.selected;
            }
            const preferred = info.all.filter(kernel => this.c.get(kernel.id)?.notebookPriorities.get(notebook.uri) === 2 /* vscode.NotebookControllerPriority.Preferred */);
            if (preferred.length === 1) {
                return preferred[0];
            }
            return info.all.length === 1 ? info.all[0] : undefined;
        }
        // a notebook has one kernel, a kernel has N notebooks
        // notebook <-1----N-> kernel
        selectKernelForNotebook(kernel, notebook) {
            const key = NotebookTextModelLikeId.str(notebook);
            const oldKernel = this.f.get(key);
            if (oldKernel !== kernel?.id) {
                if (kernel) {
                    this.f.set(key, kernel.id);
                }
                else {
                    this.f.delete(key);
                }
                this.g.fire({ notebook: notebook.uri, oldKernel, newKernel: kernel?.id });
                this.I();
            }
        }
        preselectKernelForNotebook(kernel, notebook) {
            const key = NotebookTextModelLikeId.str(notebook);
            const oldKernel = this.f.get(key);
            if (oldKernel !== kernel?.id) {
                this.f.set(key, kernel.id);
                this.I();
            }
        }
        updateKernelNotebookAffinity(kernel, notebook, preference) {
            const info = this.c.get(kernel.id);
            if (!info) {
                throw new Error(`UNKNOWN kernel '${kernel.id}'`);
            }
            if (preference === undefined) {
                info.notebookPriorities.delete(notebook);
            }
            else {
                info.notebookPriorities.set(notebook, preference);
            }
            this.m.fire();
        }
        getRunningSourceActions(notebook) {
            const id = NotebookTextModelLikeId.str(notebook);
            const existingInfo = this.r.get(id);
            if (existingInfo) {
                return existingInfo.actions.filter(action => action[0].execution).map(action => action[0]);
            }
            return [];
        }
        getSourceActions(notebook, contextKeyService) {
            contextKeyService = contextKeyService ?? this.G;
            const id = NotebookTextModelLikeId.str(notebook);
            const existingInfo = this.r.get(id);
            if (existingInfo) {
                return existingInfo.actions.map(a => a[0]);
            }
            const sourceMenu = this.B(this.F.createMenu(actions_1.$Ru.NotebookKernelSource, contextKeyService));
            const info = { menu: sourceMenu, actions: [] };
            const loadActionsFromMenu = (menu, document) => {
                const groups = menu.getActions({ shouldForwardArgs: true });
                const sourceActions = [];
                groups.forEach(group => {
                    const isPrimary = /^primary/.test(group[0]);
                    group[1].forEach(action => {
                        const sourceAction = new SourceAction(action, document, isPrimary);
                        const stateChangeListener = sourceAction.onDidChangeState(() => {
                            this.n.fire({
                                notebook: document.uri,
                                viewType: document.viewType,
                            });
                        });
                        sourceActions.push([sourceAction, stateChangeListener]);
                    });
                });
                info.actions = sourceActions;
                this.r.set(id, info);
                this.n.fire({ notebook: document.uri, viewType: document.viewType });
            };
            this.t.get(id)?.dispose();
            this.t.set(id, sourceMenu.onDidChange(() => {
                loadActionsFromMenu(sourceMenu, notebook);
            }));
            loadActionsFromMenu(sourceMenu, notebook);
            return info.actions.map(a => a[0]);
        }
        registerNotebookKernelDetectionTask(task) {
            const notebookType = task.notebookType;
            const all = this.u.get(notebookType) ?? [];
            all.push(task);
            this.u.set(notebookType, all);
            this.w.fire(notebookType);
            return (0, lifecycle_1.$ic)(() => {
                const all = this.u.get(notebookType) ?? [];
                const idx = all.indexOf(task);
                if (idx >= 0) {
                    all.splice(idx, 1);
                    this.u.set(notebookType, all);
                    this.w.fire(notebookType);
                }
            });
        }
        getKernelDetectionTasks(notebook) {
            return this.u.get(notebook.viewType) ?? [];
        }
        registerKernelSourceActionProvider(viewType, provider) {
            const providers = this.y.get(viewType) ?? [];
            providers.push(provider);
            this.y.set(viewType, providers);
            this.n.fire({ viewType: viewType });
            const eventEmitterDisposable = provider.onDidChangeSourceActions?.(() => {
                this.n.fire({ viewType: viewType });
            });
            return (0, lifecycle_1.$ic)(() => {
                const providers = this.y.get(viewType) ?? [];
                const idx = providers.indexOf(provider);
                if (idx >= 0) {
                    providers.splice(idx, 1);
                    this.y.set(viewType, providers);
                }
                eventEmitterDisposable?.dispose();
            });
        }
        /**
         * Get kernel source actions from providers
         */
        getKernelSourceActions2(notebook) {
            const viewType = notebook.viewType;
            const providers = this.y.get(viewType) ?? [];
            const promises = providers.map(provider => provider.provideKernelSourceActions());
            return Promise.all(promises).then(actions => {
                return actions.reduce((a, b) => a.concat(b), []);
            });
        }
    };
    exports.$8Eb = $8Eb;
    exports.$8Eb = $8Eb = $8Eb_1 = __decorate([
        __param(0, notebookService_1.$ubb),
        __param(1, storage_1.$Vo),
        __param(2, actions_1.$Su),
        __param(3, contextkey_1.$3i)
    ], $8Eb);
});
//# sourceMappingURL=notebookKernelServiceImpl.js.map