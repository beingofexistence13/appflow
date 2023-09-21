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
define(["require", "exports", "vs/base/browser/ui/progressbar/progressbar", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, progressbar_1, defaultStyles_1, cellPart_1, notebookCommon_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rpb = void 0;
    let $rpb = class $rpb extends cellPart_1.$Hnb {
        constructor(editorContainer, collapsedInputContainer, g) {
            super();
            this.g = g;
            this.a = this.B(new progressbar_1.$YR(editorContainer, defaultStyles_1.$k2));
            this.a.hide();
            this.b = this.B(new progressbar_1.$YR(collapsedInputContainer, defaultStyles_1.$k2));
            this.b.hide();
        }
        didRenderCell(element) {
            this.h(element);
        }
        updateForExecutionState(element, e) {
            this.h(element, e);
        }
        updateState(element, e) {
            if (e.metadataChanged || e.internalMetadataChanged) {
                this.h(element);
            }
            if (e.inputCollapsedChanged) {
                const exeState = this.g.getCellExecution(element.uri);
                if (element.isInputCollapsed) {
                    this.a.hide();
                    if (exeState?.state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                        this.h(element);
                    }
                }
                else {
                    this.b.hide();
                    if (exeState?.state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                        this.h(element);
                    }
                }
            }
        }
        h(element, e) {
            const exeState = e?.changed ?? this.g.getCellExecution(element.uri);
            const progressBar = element.isInputCollapsed ? this.b : this.a;
            if (exeState?.state === notebookCommon_1.NotebookCellExecutionState.Executing && (!exeState.didPause || element.isInputCollapsed)) {
                showProgressBar(progressBar);
            }
            else {
                progressBar.hide();
            }
        }
    };
    exports.$rpb = $rpb;
    exports.$rpb = $rpb = __decorate([
        __param(2, notebookExecutionStateService_1.$_H)
    ], $rpb);
    function showProgressBar(progressBar) {
        progressBar.infinite().show(500);
    }
});
//# sourceMappingURL=cellProgressBar.js.map