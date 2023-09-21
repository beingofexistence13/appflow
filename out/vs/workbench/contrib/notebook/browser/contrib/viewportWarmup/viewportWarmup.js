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
    let NotebookViewportContribution = class NotebookViewportContribution extends lifecycle_1.Disposable {
        static { this.id = 'workbench.notebook.viewportWarmup'; }
        constructor(_notebookEditor, _notebookService, accessibilityService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._notebookService = _notebookService;
            this._warmupDocument = null;
            this._warmupViewport = new async_1.RunOnceScheduler(() => this._warmupViewportNow(), 200);
            this._register(this._warmupViewport);
            this._register(this._notebookEditor.onDidScroll(() => {
                this._warmupViewport.schedule();
            }));
            this._warmupDocument = new async_1.RunOnceScheduler(() => this._warmupDocumentNow(), 200);
            this._register(this._warmupDocument);
            this._register(this._notebookEditor.onDidAttachViewModel(() => {
                if (this._notebookEditor.hasModel()) {
                    this._warmupDocument?.schedule();
                }
            }));
            if (this._notebookEditor.hasModel()) {
                this._warmupDocument?.schedule();
            }
        }
        _warmupDocumentNow() {
            if (this._notebookEditor.hasModel()) {
                for (let i = 0; i < this._notebookEditor.getLength(); i++) {
                    const cell = this._notebookEditor.cellAt(i);
                    if (cell?.cellKind === notebookCommon_1.CellKind.Markup && cell?.getEditState() === notebookBrowser_1.CellEditState.Preview && !cell.isInputCollapsed) {
                        // TODO@rebornix currently we disable markdown cell rendering in webview for accessibility
                        // this._notebookEditor.createMarkupPreview(cell);
                    }
                    else if (cell?.cellKind === notebookCommon_1.CellKind.Code) {
                        this._warmupCodeCell(cell);
                    }
                }
            }
        }
        _warmupViewportNow() {
            if (this._notebookEditor.isDisposed) {
                return;
            }
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            const visibleRanges = this._notebookEditor.getVisibleRangesPlusViewportAboveAndBelow();
            (0, notebookRange_1.cellRangesToIndexes)(visibleRanges).forEach(index => {
                const cell = this._notebookEditor.cellAt(index);
                if (cell?.cellKind === notebookCommon_1.CellKind.Markup && cell?.getEditState() === notebookBrowser_1.CellEditState.Preview && !cell.isInputCollapsed) {
                    this._notebookEditor.createMarkupPreview(cell);
                }
                else if (cell?.cellKind === notebookCommon_1.CellKind.Code) {
                    this._warmupCodeCell(cell);
                }
            });
        }
        _warmupCodeCell(viewCell) {
            if (viewCell.isOutputCollapsed) {
                return;
            }
            const outputs = viewCell.outputsViewModels;
            for (const output of outputs.slice(0, codeCellViewModel_1.outputDisplayLimit)) {
                const [mimeTypes, pick] = output.resolveMimeTypes(this._notebookEditor.textModel, undefined);
                if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                    continue;
                }
                const pickedMimeTypeRenderer = mimeTypes[pick];
                if (!pickedMimeTypeRenderer) {
                    return;
                }
                if (!this._notebookEditor.hasModel()) {
                    return;
                }
                const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
                if (!renderer) {
                    return;
                }
                const result = { type: 1 /* RenderOutputType.Extension */, renderer, source: output, mimeType: pickedMimeTypeRenderer.mimeType };
                this._notebookEditor.createOutput(viewCell, result, 0, true);
            }
        }
    };
    NotebookViewportContribution = __decorate([
        __param(1, notebookService_1.INotebookService),
        __param(2, accessibility_1.IAccessibilityService)
    ], NotebookViewportContribution);
    (0, notebookEditorExtensions_1.registerNotebookContribution)(NotebookViewportContribution.id, NotebookViewportContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRXYXJtdXAuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyaWIvdmlld3BvcnRXYXJtdXAvdmlld3BvcnRXYXJtdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFZaEcsSUFBTSw0QkFBNEIsR0FBbEMsTUFBTSw0QkFBNkIsU0FBUSxzQkFBVTtpQkFDN0MsT0FBRSxHQUFXLG1DQUFtQyxBQUE5QyxDQUErQztRQUl4RCxZQUNrQixlQUFnQyxFQUMvQixnQkFBbUQsRUFDOUMsb0JBQTJDO1lBRWxFLEtBQUssRUFBRSxDQUFDO1lBSlMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ2QscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUpyRCxvQkFBZSxHQUE0QixJQUFJLENBQUM7WUFTaEUsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2xGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUNwRCxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksd0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFD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