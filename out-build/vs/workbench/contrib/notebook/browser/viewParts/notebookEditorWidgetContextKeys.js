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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/services/extensions/common/extensions"], function (require, exports, DOM, lifecycle_1, contextkey_1, notebookBrowser_1, notebookContextKeys_1, notebookExecutionStateService_1, notebookKernelService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jrb = void 0;
    let $jrb = class $jrb {
        constructor(u, v, contextKeyService, w, x) {
            this.u = u;
            this.v = v;
            this.w = w;
            this.x = x;
            this.q = new lifecycle_1.$jc();
            this.r = new lifecycle_1.$jc();
            this.s = [];
            this.t = new lifecycle_1.$jc();
            this.a = notebookContextKeys_1.$lob.bindTo(contextKeyService);
            this.b = notebookContextKeys_1.$mob.bindTo(contextKeyService);
            this.f = notebookContextKeys_1.$oob.bindTo(contextKeyService);
            this.g = notebookContextKeys_1.$pob.bindTo(contextKeyService);
            this.h = notebookContextKeys_1.$4nb.bindTo(contextKeyService);
            this.j = notebookContextKeys_1.$5nb.bindTo(contextKeyService);
            this.l = notebookContextKeys_1.$6nb.bindTo(contextKeyService);
            this.k = notebookContextKeys_1.$rob.bindTo(contextKeyService);
            this.m = notebookContextKeys_1.$$nb.bindTo(contextKeyService);
            this.n = notebookContextKeys_1.$qob.bindTo(contextKeyService);
            this.d = notebookContextKeys_1.$nob.bindTo(contextKeyService);
            this.o = notebookContextKeys_1.$8nb.bindTo(contextKeyService);
            this.p = notebookContextKeys_1.$0nb.bindTo(contextKeyService);
            this.y();
            this.D();
            this.q.add(u.onDidChangeModel(this.y, this));
            this.q.add(v.onDidAddKernel(this.C, this));
            this.q.add(v.onDidChangeSelectedNotebooks(this.C, this));
            this.q.add(v.onDidChangeSourceActions(this.C, this));
            this.q.add(u.notebookOptions.onDidChangeOptions(this.D, this));
            this.q.add(w.onDidChangeExtensions(this.B, this));
            this.q.add(x.onDidChangeExecution(this.z, this));
            this.q.add(x.onDidChangeLastRunFailState(this.A, this));
        }
        dispose() {
            this.q.dispose();
            this.r.dispose();
            this.b.reset();
            this.d.reset();
            this.g.reset();
            this.h.reset();
            this.j.reset();
            this.m.reset();
            (0, lifecycle_1.$fc)(this.s);
            this.s.length = 0;
        }
        y() {
            this.C();
            this.D();
            this.r.clear();
            (0, lifecycle_1.$fc)(this.s);
            this.s.length = 0;
            if (!this.u.hasModel()) {
                return;
            }
            const recomputeOutputsExistence = () => {
                let hasOutputs = false;
                if (this.u.hasModel()) {
                    for (let i = 0; i < this.u.getLength(); i++) {
                        if (this.u.cellAt(i).outputsViewModels.length > 0) {
                            hasOutputs = true;
                            break;
                        }
                    }
                }
                this.k.set(hasOutputs);
            };
            const layoutDisposable = this.r.add(new lifecycle_1.$jc());
            const addCellOutputsListener = (c) => {
                return c.model.onDidChangeOutputs(() => {
                    layoutDisposable.clear();
                    layoutDisposable.add(DOM.$vO(() => {
                        recomputeOutputsExistence();
                    }));
                });
            };
            for (let i = 0; i < this.u.getLength(); i++) {
                const cell = this.u.cellAt(i);
                this.s.push(addCellOutputsListener(cell));
            }
            recomputeOutputsExistence();
            this.B();
            this.r.add(this.u.onDidChangeViewCells(e => {
                [...e.splices].reverse().forEach(splice => {
                    const [start, deleted, newCells] = splice;
                    const deletedCellOutputStates = this.s.splice(start, deleted, ...newCells.map(addCellOutputsListener));
                    (0, lifecycle_1.$fc)(deletedCellOutputStates);
                });
            }));
            this.m.set(this.u.textModel.viewType);
        }
        z(e) {
            if (this.u.textModel) {
                const notebookExe = this.x.getExecution(this.u.textModel.uri);
                const notebookCellExe = this.x.getCellExecutionsForNotebook(this.u.textModel.uri);
                this.j.set(notebookCellExe.length > 0 || !!notebookExe);
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell) {
                    this.h.set(notebookCellExe.length > 0);
                }
            }
            else {
                this.j.set(false);
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell) {
                    this.h.set(false);
                }
            }
        }
        A(e) {
            if (e.notebook === this.u.textModel?.uri) {
                this.p.set(e.visible);
            }
        }
        async B() {
            if (!this.u.hasModel()) {
                return;
            }
            const viewType = this.u.textModel.viewType;
            const kernelExtensionId = notebookBrowser_1.$Xbb.get(viewType);
            this.n.set(!!kernelExtensionId && !(await this.w.getExtension(kernelExtensionId)));
        }
        C() {
            if (!this.u.hasModel()) {
                this.b.reset();
                this.d.reset();
                this.g.reset();
                return;
            }
            const { selected, all } = this.v.getMatchingKernel(this.u.textModel);
            const sourceActions = this.v.getSourceActions(this.u.textModel, this.u.scopedContextKeyService);
            this.b.set(all.length);
            this.d.set(sourceActions.length);
            this.g.set(selected?.implementsInterrupt ?? false);
            this.f.set(Boolean(selected));
            this.a.set(selected?.id ?? '');
            this.t.clear();
            if (selected) {
                this.t.add(selected.onDidChange(() => {
                    this.g.set(selected?.implementsInterrupt ?? false);
                }));
            }
        }
        D() {
            const layout = this.u.notebookOptions.getLayoutConfiguration();
            this.l.set(layout.consolidatedOutputButton);
            this.o.set(this.u.notebookOptions.computeCellToolbarLocation(this.u.textModel?.viewType));
        }
    };
    exports.$jrb = $jrb;
    exports.$jrb = $jrb = __decorate([
        __param(1, notebookKernelService_1.$Bbb),
        __param(2, contextkey_1.$3i),
        __param(3, extensions_1.$MF),
        __param(4, notebookExecutionStateService_1.$_H)
    ], $jrb);
});
//# sourceMappingURL=notebookEditorWidgetContextKeys.js.map