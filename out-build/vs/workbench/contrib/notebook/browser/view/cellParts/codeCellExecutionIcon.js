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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/codeCellExecutionIcon", "vs/base/common/themables", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, DOM, iconLabels_1, lifecycle_1, nls_1, themables_1, notebookIcons_1, notebookCommon_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Tqb = void 0;
    let $Tqb = class $Tqb extends lifecycle_1.$kc {
        constructor(_notebookEditor, b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = false;
            this.g();
            this.B(this.f.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && e.affectsCell(this.b.uri)) {
                    this.g();
                }
            }));
            this.B(this.b.model.onDidChangeInternalMetadata(() => this.g()));
        }
        setVisibility(visible) {
            this.a = visible;
            this.g();
        }
        g() {
            if (!this.a) {
                return;
            }
            const runState = this.f.getCellExecution(this.b.uri);
            const item = this.h(runState, this.b.model.internalMetadata);
            if (item) {
                this.c.style.display = '';
                DOM.$_O(this.c, ...(0, iconLabels_1.$xQ)(item.text));
                this.c.title = item.tooltip ?? '';
            }
            else {
                this.c.style.display = 'none';
                DOM.$_O(this.c);
            }
        }
        h(runState, internalMetadata) {
            const state = runState?.state;
            const { lastRunSuccess } = internalMetadata;
            if (!state && lastRunSuccess) {
                return {
                    text: `$(${notebookIcons_1.$Gpb.id})`,
                    tooltip: (0, nls_1.localize)(0, null),
                };
            }
            else if (!state && lastRunSuccess === false) {
                return {
                    text: `$(${notebookIcons_1.$Hpb.id})`,
                    tooltip: (0, nls_1.localize)(1, null),
                };
            }
            else if (state === notebookCommon_1.NotebookCellExecutionState.Pending || state === notebookCommon_1.NotebookCellExecutionState.Unconfirmed) {
                return {
                    text: `$(${notebookIcons_1.$Ipb.id})`,
                    tooltip: (0, nls_1.localize)(2, null),
                };
            }
            else if (state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                const icon = themables_1.ThemeIcon.modify(notebookIcons_1.$Jpb, 'spin');
                return {
                    text: `$(${icon.id})`,
                    tooltip: (0, nls_1.localize)(3, null),
                };
            }
            return;
        }
    };
    exports.$Tqb = $Tqb;
    exports.$Tqb = $Tqb = __decorate([
        __param(3, notebookExecutionStateService_1.$_H)
    ], $Tqb);
});
//# sourceMappingURL=codeCellExecutionIcon.js.map