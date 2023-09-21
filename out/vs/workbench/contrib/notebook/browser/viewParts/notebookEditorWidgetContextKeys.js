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
    exports.NotebookEditorContextKeys = void 0;
    let NotebookEditorContextKeys = class NotebookEditorContextKeys {
        constructor(_editor, _notebookKernelService, contextKeyService, _extensionService, _notebookExecutionStateService) {
            this._editor = _editor;
            this._notebookKernelService = _notebookKernelService;
            this._extensionService = _extensionService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._viewModelDisposables = new lifecycle_1.DisposableStore();
            this._cellOutputsListeners = [];
            this._selectedKernelDisposables = new lifecycle_1.DisposableStore();
            this._notebookKernel = notebookContextKeys_1.NOTEBOOK_KERNEL.bindTo(contextKeyService);
            this._notebookKernelCount = notebookContextKeys_1.NOTEBOOK_KERNEL_COUNT.bindTo(contextKeyService);
            this._notebookKernelSelected = notebookContextKeys_1.NOTEBOOK_KERNEL_SELECTED.bindTo(contextKeyService);
            this._interruptibleKernel = notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.bindTo(contextKeyService);
            this._someCellRunning = notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL.bindTo(contextKeyService);
            this._kernelRunning = notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING.bindTo(contextKeyService);
            this._useConsolidatedOutputButton = notebookContextKeys_1.NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON.bindTo(contextKeyService);
            this._hasOutputs = notebookContextKeys_1.NOTEBOOK_HAS_OUTPUTS.bindTo(contextKeyService);
            this._viewType = notebookContextKeys_1.NOTEBOOK_VIEW_TYPE.bindTo(contextKeyService);
            this._missingKernelExtension = notebookContextKeys_1.NOTEBOOK_MISSING_KERNEL_EXTENSION.bindTo(contextKeyService);
            this._notebookKernelSourceCount = notebookContextKeys_1.NOTEBOOK_KERNEL_SOURCE_COUNT.bindTo(contextKeyService);
            this._cellToolbarLocation = notebookContextKeys_1.NOTEBOOK_CELL_TOOLBAR_LOCATION.bindTo(contextKeyService);
            this._lastCellFailed = notebookContextKeys_1.NOTEBOOK_LAST_CELL_FAILED.bindTo(contextKeyService);
            this._handleDidChangeModel();
            this._updateForNotebookOptions();
            this._disposables.add(_editor.onDidChangeModel(this._handleDidChangeModel, this));
            this._disposables.add(_notebookKernelService.onDidAddKernel(this._updateKernelContext, this));
            this._disposables.add(_notebookKernelService.onDidChangeSelectedNotebooks(this._updateKernelContext, this));
            this._disposables.add(_notebookKernelService.onDidChangeSourceActions(this._updateKernelContext, this));
            this._disposables.add(_editor.notebookOptions.onDidChangeOptions(this._updateForNotebookOptions, this));
            this._disposables.add(_extensionService.onDidChangeExtensions(this._updateForInstalledExtension, this));
            this._disposables.add(_notebookExecutionStateService.onDidChangeExecution(this._updateForExecution, this));
            this._disposables.add(_notebookExecutionStateService.onDidChangeLastRunFailState(this._updateForLastRunFailState, this));
        }
        dispose() {
            this._disposables.dispose();
            this._viewModelDisposables.dispose();
            this._notebookKernelCount.reset();
            this._notebookKernelSourceCount.reset();
            this._interruptibleKernel.reset();
            this._someCellRunning.reset();
            this._kernelRunning.reset();
            this._viewType.reset();
            (0, lifecycle_1.dispose)(this._cellOutputsListeners);
            this._cellOutputsListeners.length = 0;
        }
        _handleDidChangeModel() {
            this._updateKernelContext();
            this._updateForNotebookOptions();
            this._viewModelDisposables.clear();
            (0, lifecycle_1.dispose)(this._cellOutputsListeners);
            this._cellOutputsListeners.length = 0;
            if (!this._editor.hasModel()) {
                return;
            }
            const recomputeOutputsExistence = () => {
                let hasOutputs = false;
                if (this._editor.hasModel()) {
                    for (let i = 0; i < this._editor.getLength(); i++) {
                        if (this._editor.cellAt(i).outputsViewModels.length > 0) {
                            hasOutputs = true;
                            break;
                        }
                    }
                }
                this._hasOutputs.set(hasOutputs);
            };
            const layoutDisposable = this._viewModelDisposables.add(new lifecycle_1.DisposableStore());
            const addCellOutputsListener = (c) => {
                return c.model.onDidChangeOutputs(() => {
                    layoutDisposable.clear();
                    layoutDisposable.add(DOM.scheduleAtNextAnimationFrame(() => {
                        recomputeOutputsExistence();
                    }));
                });
            };
            for (let i = 0; i < this._editor.getLength(); i++) {
                const cell = this._editor.cellAt(i);
                this._cellOutputsListeners.push(addCellOutputsListener(cell));
            }
            recomputeOutputsExistence();
            this._updateForInstalledExtension();
            this._viewModelDisposables.add(this._editor.onDidChangeViewCells(e => {
                [...e.splices].reverse().forEach(splice => {
                    const [start, deleted, newCells] = splice;
                    const deletedCellOutputStates = this._cellOutputsListeners.splice(start, deleted, ...newCells.map(addCellOutputsListener));
                    (0, lifecycle_1.dispose)(deletedCellOutputStates);
                });
            }));
            this._viewType.set(this._editor.textModel.viewType);
        }
        _updateForExecution(e) {
            if (this._editor.textModel) {
                const notebookExe = this._notebookExecutionStateService.getExecution(this._editor.textModel.uri);
                const notebookCellExe = this._notebookExecutionStateService.getCellExecutionsForNotebook(this._editor.textModel.uri);
                this._kernelRunning.set(notebookCellExe.length > 0 || !!notebookExe);
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell) {
                    this._someCellRunning.set(notebookCellExe.length > 0);
                }
            }
            else {
                this._kernelRunning.set(false);
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell) {
                    this._someCellRunning.set(false);
                }
            }
        }
        _updateForLastRunFailState(e) {
            if (e.notebook === this._editor.textModel?.uri) {
                this._lastCellFailed.set(e.visible);
            }
        }
        async _updateForInstalledExtension() {
            if (!this._editor.hasModel()) {
                return;
            }
            const viewType = this._editor.textModel.viewType;
            const kernelExtensionId = notebookBrowser_1.KERNEL_EXTENSIONS.get(viewType);
            this._missingKernelExtension.set(!!kernelExtensionId && !(await this._extensionService.getExtension(kernelExtensionId)));
        }
        _updateKernelContext() {
            if (!this._editor.hasModel()) {
                this._notebookKernelCount.reset();
                this._notebookKernelSourceCount.reset();
                this._interruptibleKernel.reset();
                return;
            }
            const { selected, all } = this._notebookKernelService.getMatchingKernel(this._editor.textModel);
            const sourceActions = this._notebookKernelService.getSourceActions(this._editor.textModel, this._editor.scopedContextKeyService);
            this._notebookKernelCount.set(all.length);
            this._notebookKernelSourceCount.set(sourceActions.length);
            this._interruptibleKernel.set(selected?.implementsInterrupt ?? false);
            this._notebookKernelSelected.set(Boolean(selected));
            this._notebookKernel.set(selected?.id ?? '');
            this._selectedKernelDisposables.clear();
            if (selected) {
                this._selectedKernelDisposables.add(selected.onDidChange(() => {
                    this._interruptibleKernel.set(selected?.implementsInterrupt ?? false);
                }));
            }
        }
        _updateForNotebookOptions() {
            const layout = this._editor.notebookOptions.getLayoutConfiguration();
            this._useConsolidatedOutputButton.set(layout.consolidatedOutputButton);
            this._cellToolbarLocation.set(this._editor.notebookOptions.computeCellToolbarLocation(this._editor.textModel?.viewType));
        }
    };
    exports.NotebookEditorContextKeys = NotebookEditorContextKeys;
    exports.NotebookEditorContextKeys = NotebookEditorContextKeys = __decorate([
        __param(1, notebookKernelService_1.INotebookKernelService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, extensions_1.IExtensionService),
        __param(4, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], NotebookEditorContextKeys);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JXaWRnZXRDb250ZXh0S2V5cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlld1BhcnRzL25vdGVib29rRWRpdG9yV2lkZ2V0Q29udGV4dEtleXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV3pGLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQXlCO1FBcUJyQyxZQUNrQixPQUFnQyxFQUN6QixzQkFBK0QsRUFDbkUsaUJBQXFDLEVBQ3RDLGlCQUFxRCxFQUN4Qyw4QkFBK0U7WUFKOUYsWUFBTyxHQUFQLE9BQU8sQ0FBeUI7WUFDUiwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1lBRW5ELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDdkIsbUNBQThCLEdBQTlCLDhCQUE4QixDQUFnQztZQVYvRixpQkFBWSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3JDLDBCQUFxQixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzlDLDBCQUFxQixHQUFrQixFQUFFLENBQUM7WUFDMUMsK0JBQTBCLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFTbkUsSUFBSSxDQUFDLGVBQWUsR0FBRyxxQ0FBZSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxvQkFBb0IsR0FBRywyQ0FBcUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsdUJBQXVCLEdBQUcsOENBQXdCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG1EQUE2QixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3BGLElBQUks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