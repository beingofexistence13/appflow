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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, lifecycle_1, contextkey_1, instantiation_1, notebookBrowser_1, cellPart_1, codeCellViewModel_1, markupCellViewModel_1, notebookCommon_1, notebookContextKeys_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tob = exports.$sob = void 0;
    let $sob = class $sob extends cellPart_1.$Hnb {
        constructor(notebookEditor, b) {
            super();
            this.b = b;
            this.a = this.B(this.b.createInstance($tob, notebookEditor, undefined));
        }
        didRenderCell(element) {
            this.a.updateForElement(element);
        }
    };
    exports.$sob = $sob;
    exports.$sob = $sob = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $sob);
    let $tob = class $tob extends lifecycle_1.$kc {
        constructor(w, y, z, C) {
            super();
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.u = this.B(new lifecycle_1.$jc());
            this.z.bufferChangeEvents(() => {
                this.a = notebookContextKeys_1.$_nb.bindTo(this.z);
                this.b = notebookContextKeys_1.$aob.bindTo(this.z);
                this.c = notebookContextKeys_1.$bob.bindTo(this.z);
                this.f = notebookContextKeys_1.$cob.bindTo(this.z);
                this.t = notebookContextKeys_1.$dob.bindTo(this.z);
                this.g = notebookContextKeys_1.$fob.bindTo(this.z);
                this.h = notebookContextKeys_1.$gob.bindTo(this.z);
                this.j = notebookContextKeys_1.$hob.bindTo(this.z);
                this.m = notebookContextKeys_1.$iob.bindTo(this.z);
                this.n = notebookContextKeys_1.$job.bindTo(this.z);
                this.r = notebookContextKeys_1.$eob.bindTo(this.z);
                this.s = notebookContextKeys_1.$kob.bindTo(this.z);
                if (y) {
                    this.updateForElement(y);
                }
            });
            this.B(this.C.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && this.y && e.affectsCell(this.y.uri)) {
                    this.G();
                }
            }));
        }
        updateForElement(element) {
            this.u.clear();
            this.y = element;
            if (!element) {
                return;
            }
            this.u.add(element.onDidChangeState(e => this.D(e)));
            if (element instanceof codeCellViewModel_1.$Rnb) {
                this.u.add(element.onDidChangeOutputs(() => this.J()));
            }
            this.u.add(this.w.onDidChangeActiveCell(() => this.F()));
            if (this.y instanceof markupCellViewModel_1.$Snb) {
                this.a.set('markup');
            }
            else if (this.y instanceof codeCellViewModel_1.$Rnb) {
                this.a.set('code');
            }
            this.z.bufferChangeEvents(() => {
                this.F();
                this.G();
                this.H();
                this.I();
                this.J();
                this.r.set(this.y.lineNumbers);
                this.s.set(this.y.uri.toString());
            });
        }
        D(e) {
            this.z.bufferChangeEvents(() => {
                if (e.internalMetadataChanged) {
                    this.G();
                }
                if (e.editStateChanged) {
                    this.H();
                }
                if (e.focusModeChanged) {
                    this.F();
                }
                if (e.cellLineNumberChanged) {
                    this.r.set(this.y.lineNumbers);
                }
                if (e.inputCollapsedChanged || e.outputCollapsedChanged) {
                    this.I();
                }
            });
        }
        F() {
            if (!this.y) {
                return;
            }
            const activeCell = this.w.getActiveCell();
            this.c.set(this.w.getActiveCell() === this.y);
            if (activeCell === this.y) {
                this.f.set(this.y.focusMode === notebookBrowser_1.CellFocusMode.Editor);
            }
            else {
                this.f.set(false);
            }
        }
        G() {
            if (!this.y) {
                return;
            }
            const internalMetadata = this.y.internalMetadata;
            this.b.set(!this.w.isReadOnly);
            const exeState = this.C.getCellExecution(this.y.uri);
            if (this.y instanceof markupCellViewModel_1.$Snb) {
                this.g.reset();
                this.h.reset();
            }
            else if (exeState?.state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                this.g.set('executing');
                this.h.set(true);
            }
            else if (exeState?.state === notebookCommon_1.NotebookCellExecutionState.Pending || exeState?.state === notebookCommon_1.NotebookCellExecutionState.Unconfirmed) {
                this.g.set('pending');
                this.h.set(true);
            }
            else if (internalMetadata.lastRunSuccess === true) {
                this.g.set('succeeded');
                this.h.set(false);
            }
            else if (internalMetadata.lastRunSuccess === false) {
                this.g.set('failed');
                this.h.set(false);
            }
            else {
                this.g.set('idle');
                this.h.set(false);
            }
        }
        H() {
            if (!this.y) {
                return;
            }
            if (this.y instanceof markupCellViewModel_1.$Snb) {
                this.t.set(this.y.getEditState() === notebookBrowser_1.CellEditState.Editing);
            }
            else {
                this.t.set(false);
            }
        }
        I() {
            if (!this.y) {
                return;
            }
            this.m.set(!!this.y.isInputCollapsed);
            this.n.set(!!this.y.isOutputCollapsed);
        }
        J() {
            if (this.y instanceof codeCellViewModel_1.$Rnb) {
                this.j.set(this.y.outputsViewModels.length > 0);
            }
            else {
                this.j.set(false);
            }
        }
    };
    exports.$tob = $tob;
    exports.$tob = $tob = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, notebookExecutionStateService_1.$_H)
    ], $tob);
});
//# sourceMappingURL=cellContextKeys.js.map