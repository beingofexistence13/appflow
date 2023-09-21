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
    exports.CellContextKeyManager = exports.CellContextKeyPart = void 0;
    let CellContextKeyPart = class CellContextKeyPart extends cellPart_1.CellContentPart {
        constructor(notebookEditor, instantiationService) {
            super();
            this.instantiationService = instantiationService;
            this.cellContextKeyManager = this._register(this.instantiationService.createInstance(CellContextKeyManager, notebookEditor, undefined));
        }
        didRenderCell(element) {
            this.cellContextKeyManager.updateForElement(element);
        }
    };
    exports.CellContextKeyPart = CellContextKeyPart;
    exports.CellContextKeyPart = CellContextKeyPart = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], CellContextKeyPart);
    let CellContextKeyManager = class CellContextKeyManager extends lifecycle_1.Disposable {
        constructor(notebookEditor, element, _contextKeyService, _notebookExecutionStateService) {
            super();
            this.notebookEditor = notebookEditor;
            this.element = element;
            this._contextKeyService = _contextKeyService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this.elementDisposables = this._register(new lifecycle_1.DisposableStore());
            this._contextKeyService.bufferChangeEvents(() => {
                this.cellType = notebookContextKeys_1.NOTEBOOK_CELL_TYPE.bindTo(this._contextKeyService);
                this.cellEditable = notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE.bindTo(this._contextKeyService);
                this.cellFocused = notebookContextKeys_1.NOTEBOOK_CELL_FOCUSED.bindTo(this._contextKeyService);
                this.cellEditorFocused = notebookContextKeys_1.NOTEBOOK_CELL_EDITOR_FOCUSED.bindTo(this._contextKeyService);
                this.markdownEditMode = notebookContextKeys_1.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.bindTo(this._contextKeyService);
                this.cellRunState = notebookContextKeys_1.NOTEBOOK_CELL_EXECUTION_STATE.bindTo(this._contextKeyService);
                this.cellExecuting = notebookContextKeys_1.NOTEBOOK_CELL_EXECUTING.bindTo(this._contextKeyService);
                this.cellHasOutputs = notebookContextKeys_1.NOTEBOOK_CELL_HAS_OUTPUTS.bindTo(this._contextKeyService);
                this.cellContentCollapsed = notebookContextKeys_1.NOTEBOOK_CELL_INPUT_COLLAPSED.bindTo(this._contextKeyService);
                this.cellOutputCollapsed = notebookContextKeys_1.NOTEBOOK_CELL_OUTPUT_COLLAPSED.bindTo(this._contextKeyService);
                this.cellLineNumbers = notebookContextKeys_1.NOTEBOOK_CELL_LINE_NUMBERS.bindTo(this._contextKeyService);
                this.cellResource = notebookContextKeys_1.NOTEBOOK_CELL_RESOURCE.bindTo(this._contextKeyService);
                if (element) {
                    this.updateForElement(element);
                }
            });
            this._register(this._notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && this.element && e.affectsCell(this.element.uri)) {
                    this.updateForExecutionState();
                }
            }));
        }
        updateForElement(element) {
            this.elementDisposables.clear();
            this.element = element;
            if (!element) {
                return;
            }
            this.elementDisposables.add(element.onDidChangeState(e => this.onDidChangeState(e)));
            if (element instanceof codeCellViewModel_1.CodeCellViewModel) {
                this.elementDisposables.add(element.onDidChangeOutputs(() => this.updateForOutputs()));
            }
            this.elementDisposables.add(this.notebookEditor.onDidChangeActiveCell(() => this.updateForFocusState()));
            if (this.element instanceof markupCellViewModel_1.MarkupCellViewModel) {
                this.cellType.set('markup');
            }
            else if (this.element instanceof codeCellViewModel_1.CodeCellViewModel) {
                this.cellType.set('code');
            }
            this._contextKeyService.bufferChangeEvents(() => {
                this.updateForFocusState();
                this.updateForExecutionState();
                this.updateForEditState();
                this.updateForCollapseState();
                this.updateForOutputs();
                this.cellLineNumbers.set(this.element.lineNumbers);
                this.cellResource.set(this.element.uri.toString());
            });
        }
        onDidChangeState(e) {
            this._contextKeyService.bufferChangeEvents(() => {
                if (e.internalMetadataChanged) {
                    this.updateForExecutionState();
                }
                if (e.editStateChanged) {
                    this.updateForEditState();
                }
                if (e.focusModeChanged) {
                    this.updateForFocusState();
                }
                if (e.cellLineNumberChanged) {
                    this.cellLineNumbers.set(this.element.lineNumbers);
                }
                if (e.inputCollapsedChanged || e.outputCollapsedChanged) {
                    this.updateForCollapseState();
                }
            });
        }
        updateForFocusState() {
            if (!this.element) {
                return;
            }
            const activeCell = this.notebookEditor.getActiveCell();
            this.cellFocused.set(this.notebookEditor.getActiveCell() === this.element);
            if (activeCell === this.element) {
                this.cellEditorFocused.set(this.element.focusMode === notebookBrowser_1.CellFocusMode.Editor);
            }
            else {
                this.cellEditorFocused.set(false);
            }
        }
        updateForExecutionState() {
            if (!this.element) {
                return;
            }
            const internalMetadata = this.element.internalMetadata;
            this.cellEditable.set(!this.notebookEditor.isReadOnly);
            const exeState = this._notebookExecutionStateService.getCellExecution(this.element.uri);
            if (this.element instanceof markupCellViewModel_1.MarkupCellViewModel) {
                this.cellRunState.reset();
                this.cellExecuting.reset();
            }
            else if (exeState?.state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                this.cellRunState.set('executing');
                this.cellExecuting.set(true);
            }
            else if (exeState?.state === notebookCommon_1.NotebookCellExecutionState.Pending || exeState?.state === notebookCommon_1.NotebookCellExecutionState.Unconfirmed) {
                this.cellRunState.set('pending');
                this.cellExecuting.set(true);
            }
            else if (internalMetadata.lastRunSuccess === true) {
                this.cellRunState.set('succeeded');
                this.cellExecuting.set(false);
            }
            else if (internalMetadata.lastRunSuccess === false) {
                this.cellRunState.set('failed');
                this.cellExecuting.set(false);
            }
            else {
                this.cellRunState.set('idle');
                this.cellExecuting.set(false);
            }
        }
        updateForEditState() {
            if (!this.element) {
                return;
            }
            if (this.element instanceof markupCellViewModel_1.MarkupCellViewModel) {
                this.markdownEditMode.set(this.element.getEditState() === notebookBrowser_1.CellEditState.Editing);
            }
            else {
                this.markdownEditMode.set(false);
            }
        }
        updateForCollapseState() {
            if (!this.element) {
                return;
            }
            this.cellContentCollapsed.set(!!this.element.isInputCollapsed);
            this.cellOutputCollapsed.set(!!this.element.isOutputCollapsed);
        }
        updateForOutputs() {
            if (this.element instanceof codeCellViewModel_1.CodeCellViewModel) {
                this.cellHasOutputs.set(this.element.outputsViewModels.length > 0);
            }
            else {
                this.cellHasOutputs.set(false);
            }
        }
    };
    exports.CellContextKeyManager = CellContextKeyManager;
    exports.CellContextKeyManager = CellContextKeyManager = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], CellContextKeyManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbENvbnRleHRLZXlzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9jZWxsQ29udGV4dEtleXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBY3pGLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsMEJBQWU7UUFHdEQsWUFDQyxjQUF1QyxFQUNDLG9CQUEyQztZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUZnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBSW5GLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMscUJBQXFCLEVBQUUsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDekksQ0FBQztRQUVRLGFBQWEsQ0FBQyxPQUF1QjtZQUM3QyxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEQsQ0FBQztLQUNELENBQUE7SUFmWSxnREFBa0I7aUNBQWxCLGtCQUFrQjtRQUs1QixXQUFBLHFDQUFxQixDQUFBO09BTFgsa0JBQWtCLENBZTlCO0lBRU0sSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxzQkFBVTtRQWtCcEQsWUFDa0IsY0FBdUMsRUFDaEQsT0FBbUMsRUFDdkIsa0JBQXVELEVBQzNDLDhCQUErRTtZQUUvRyxLQUFLLEVBQUUsQ0FBQztZQUxTLG1CQUFjLEdBQWQsY0FBYyxDQUF5QjtZQUNoRCxZQUFPLEdBQVAsT0FBTyxDQUE0QjtZQUNOLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDMUIsbUNBQThCLEdBQTlCLDhCQUE4QixDQUFnQztZQU4vRix1QkFB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