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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, async_1, lifecycle_1, accessibility_1, notebookBrowser_1, notebookEditorExtensions_1, codeCellViewModel_1, notebookCommon_1, notebookRange_1, notebookService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let NotebookViewportContribution = class NotebookViewportContribution extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.viewportWarmup'; }
        constructor(c, f, accessibilityService) {
            super();
            this.c = c;
            this.f = f;
            this.b = null;
            this.a = new async_1.$Sg(() => this.h(), 200);
            this.B(this.a);
            this.B(this.c.onDidScroll(() => {
                this.a.schedule();
            }));
            this.b = new async_1.$Sg(() => this.g(), 200);
            this.B(this.b);
            this.B(this.c.onDidAttachViewModel(() => {
                if (this.c.hasModel()) {
                    this.b?.schedule();
                }
            }));
            if (this.c.hasModel()) {
                this.b?.schedule();
            }
        }
        g() {
            if (this.c.hasModel()) {
                for (let i = 0; i < this.c.getLength(); i++) {
                    const cell = this.c.cellAt(i);
                    if (cell?.cellKind === notebookCommon_1.CellKind.Markup && cell?.getEditState() === notebookBrowser_1.CellEditState.Preview && !cell.isInputCollapsed) {
                        // TODO@rebornix currently we disable markdown cell rendering in webview for accessibility
                        // this._notebookEditor.createMarkupPreview(cell);
                    }
                    else if (cell?.cellKind === notebookCommon_1.CellKind.Code) {
                        this.j(cell);
                    }
                }
            }
        }
        h() {
            if (this.c.isDisposed) {
                return;
            }
            if (!this.c.hasModel()) {
                return;
            }
            const visibleRanges = this.c.getVisibleRangesPlusViewportAboveAndBelow();
            (0, notebookRange_1.$PH)(visibleRanges).forEach(index => {
                const cell = this.c.cellAt(index);
                if (cell?.cellKind === notebookCommon_1.CellKind.Markup && cell?.getEditState() === notebookBrowser_1.CellEditState.Preview && !cell.isInputCollapsed) {
                    this.c.createMarkupPreview(cell);
                }
                else if (cell?.cellKind === notebookCommon_1.CellKind.Code) {
                    this.j(cell);
                }
            });
        }
        j(viewCell) {
            if (viewCell.isOutputCollapsed) {
                return;
            }
            const outputs = viewCell.outputsViewModels;
            for (const output of outputs.slice(0, codeCellViewModel_1.$Qnb)) {
                const [mimeTypes, pick] = output.resolveMimeTypes(this.c.textModel, undefined);
                if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                    continue;
                }
                const pickedMimeTypeRenderer = mimeTypes[pick];
                if (!pickedMimeTypeRenderer) {
                    return;
                }
                if (!this.c.hasModel()) {
                    return;
                }
                const renderer = this.f.getRendererInfo(pickedMimeTypeRenderer.rendererId);
                if (!renderer) {
                    return;
                }
                const result = { type: 1 /* RenderOutputType.Extension */, renderer, source: output, mimeType: pickedMimeTypeRenderer.mimeType };
                this.c.createOutput(viewCell, result, 0, true);
            }
        }
    };
    NotebookViewportContribution = __decorate([
        __param(1, notebookService_1.$ubb),
        __param(2, accessibility_1.$1r)
    ], NotebookViewportContribution);
    (0, notebookEditorExtensions_1.$Fnb)(NotebookViewportContribution.id, NotebookViewportContribution);
});
//# sourceMappingURL=viewportWarmup.js.map