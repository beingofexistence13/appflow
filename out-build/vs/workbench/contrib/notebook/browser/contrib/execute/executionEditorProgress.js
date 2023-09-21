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
define(["require", "exports", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/services/userActivity/common/userActivityService"], function (require, exports, decorators_1, lifecycle_1, notebookEditorExtensions_1, notebookCommon_1, notebookExecutionStateService_1, userActivityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gGb = void 0;
    let $gGb = class $gGb extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.executionEditorProgress'; }
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = this.B(new lifecycle_1.$lc());
            this.B(b.onDidScroll(() => this.g()));
            this.B(c.onDidChangeExecution(e => {
                if (e.notebook.toString() !== this.b.textModel?.uri.toString()) {
                    return;
                }
                this.g();
            }));
            this.B(b.onDidChangeModel(() => this.g()));
        }
        g() {
            if (!this.b.hasModel()) {
                return;
            }
            const cellExecutions = this.c.getCellExecutionsForNotebook(this.b.textModel?.uri)
                .filter(exe => exe.state === notebookCommon_1.NotebookCellExecutionState.Executing);
            const notebookExecution = this.c.getExecution(this.b.textModel?.uri);
            const executionIsVisible = (exe) => {
                for (const range of this.b.visibleRanges) {
                    for (const cell of this.b.getCellsInRange(range)) {
                        if (cell.handle === exe.cellHandle) {
                            const top = this.b.getAbsoluteTopOfElement(cell);
                            if (this.b.scrollTop < top + 5) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            };
            const hasAnyExecution = cellExecutions.length || notebookExecution;
            if (hasAnyExecution && !this.a.value) {
                this.a.value = this.f.markActive();
            }
            else if (!hasAnyExecution && this.a.value) {
                this.a.clear();
            }
            const shouldShowEditorProgressbarForCellExecutions = cellExecutions.length && !cellExecutions.some(executionIsVisible) && !cellExecutions.some(e => e.isPaused);
            const showEditorProgressBar = !!notebookExecution || shouldShowEditorProgressbarForCellExecutions;
            if (showEditorProgressBar) {
                this.b.showProgress();
            }
            else {
                this.b.hideProgress();
            }
        }
    };
    exports.$gGb = $gGb;
    __decorate([
        (0, decorators_1.$8g)(100)
    ], $gGb.prototype, "g", null);
    exports.$gGb = $gGb = __decorate([
        __param(1, notebookExecutionStateService_1.$_H),
        __param(2, userActivityService_1.$jlb)
    ], $gGb);
    (0, notebookEditorExtensions_1.$Fnb)($gGb.id, $gGb);
});
//# sourceMappingURL=executionEditorProgress.js.map