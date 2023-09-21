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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/editor/common/services/languageFeatures", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/contrib/navigation/arrow", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/statusbar/browser/statusbar"], function (require, exports, lifecycle_1, network_1, languageFeatures_1, nls, instantiation_1, log_1, platform_1, contributions_1, arrow_1, coreActions_1, notebookBrowser_1, notebookCommon_1, notebookKernelService_1, editorService_1, statusbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActiveCellStatus = exports.KernelStatus = void 0;
    let ImplictKernelSelector = class ImplictKernelSelector {
        constructor(notebook, suggested, notebookKernelService, languageFeaturesService, logService) {
            const disposables = new lifecycle_1.DisposableStore();
            this.dispose = disposables.dispose.bind(disposables);
            const selectKernel = () => {
                disposables.clear();
                notebookKernelService.selectKernelForNotebook(suggested, notebook);
            };
            // IMPLICITLY select a suggested kernel when the notebook has been changed
            // e.g change cell source, move cells, etc
            disposables.add(notebook.onDidChangeContent(e => {
                for (const event of e.rawEvents) {
                    switch (event.kind) {
                        case notebookCommon_1.NotebookCellsChangeType.ChangeCellContent:
                        case notebookCommon_1.NotebookCellsChangeType.ModelChange:
                        case notebookCommon_1.NotebookCellsChangeType.Move:
                        case notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage:
                            logService.trace('IMPLICIT kernel selection because of change event', event.kind);
                            selectKernel();
                            break;
                    }
                }
            }));
            // IMPLICITLY select a suggested kernel when users start to hover. This should
            // be a strong enough hint that the user wants to interact with the notebook. Maybe
            // add more triggers like goto-providers or completion-providers
            disposables.add(languageFeaturesService.hoverProvider.register({ scheme: network_1.Schemas.vscodeNotebookCell, pattern: notebook.uri.path }, {
                provideHover() {
                    logService.trace('IMPLICIT kernel selection because of hover');
                    selectKernel();
                    return undefined;
                }
            }));
        }
    };
    ImplictKernelSelector = __decorate([
        __param(2, notebookKernelService_1.INotebookKernelService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, log_1.ILogService)
    ], ImplictKernelSelector);
    let KernelStatus = class KernelStatus extends lifecycle_1.Disposable {
        constructor(_editorService, _statusbarService, _notebookKernelService, _instantiationService) {
            super();
            this._editorService = _editorService;
            this._statusbarService = _statusbarService;
            this._notebookKernelService = _notebookKernelService;
            this._instantiationService = _instantiationService;
            this._editorDisposables = this._register(new lifecycle_1.DisposableStore());
            this._kernelInfoElement = this._register(new lifecycle_1.DisposableStore());
            this._register(this._editorService.onDidActiveEditorChange(() => this._updateStatusbar()));
        }
        _updateStatusbar() {
            this._editorDisposables.clear();
            const activeEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
            if (!activeEditor) {
                // not a notebook -> clean-up, done
                this._kernelInfoElement.clear();
                return;
            }
            const updateStatus = () => {
                if (activeEditor.notebookOptions.getLayoutConfiguration().globalToolbar) {
                    // kernel info rendered in the notebook toolbar already
                    this._kernelInfoElement.clear();
                    return;
                }
                const notebook = activeEditor.textModel;
                if (notebook) {
                    this._showKernelStatus(notebook);
                }
                else {
                    this._kernelInfoElement.clear();
                }
            };
            this._editorDisposables.add(this._notebookKernelService.onDidAddKernel(updateStatus));
            this._editorDisposables.add(this._notebookKernelService.onDidChangeSelectedNotebooks(updateStatus));
            this._editorDisposables.add(this._notebookKernelService.onDidChangeNotebookAffinity(updateStatus));
            this._editorDisposables.add(activeEditor.onDidChangeModel(updateStatus));
            this._editorDisposables.add(activeEditor.notebookOptions.onDidChangeOptions(updateStatus));
            updateStatus();
        }
        _showKernelStatus(notebook) {
            this._kernelInfoElement.clear();
            const { selected, suggestions, all } = this._notebookKernelService.getMatchingKernel(notebook);
            const suggested = (suggestions.length === 1 ? suggestions[0] : undefined)
                ?? (all.length === 1) ? all[0] : undefined;
            let isSuggested = false;
            if (all.length === 0) {
                // no kernel -> no status
                return;
            }
            else if (selected || suggested) {
                // selected or single kernel
                let kernel = selected;
                if (!kernel) {
                    // proceed with suggested kernel - show UI and install handler that selects the kernel
                    // when non trivial interactions with the notebook happen.
                    kernel = suggested;
                    isSuggested = true;
                    this._kernelInfoElement.add(this._instantiationService.createInstance(ImplictKernelSelector, notebook, kernel));
                }
                const tooltip = kernel.description ?? kernel.detail ?? kernel.label;
                this._kernelInfoElement.add(this._statusbarService.addEntry({
                    name: nls.localize('notebook.info', "Notebook Kernel Info"),
                    text: `$(notebook-kernel-select) ${kernel.label}`,
                    ariaLabel: kernel.label,
                    tooltip: isSuggested ? nls.localize('tooltop', "{0} (suggestion)", tooltip) : tooltip,
                    command: coreActions_1.SELECT_KERNEL_ID,
                }, coreActions_1.SELECT_KERNEL_ID, 1 /* StatusbarAlignment.RIGHT */, 10));
                this._kernelInfoElement.add(kernel.onDidChange(() => this._showKernelStatus(notebook)));
            }
            else {
                // multiple kernels -> show selection hint
                this._kernelInfoElement.add(this._statusbarService.addEntry({
                    name: nls.localize('notebook.select', "Notebook Kernel Selection"),
                    text: nls.localize('kernel.select.label', "Select Kernel"),
                    ariaLabel: nls.localize('kernel.select.label', "Select Kernel"),
                    command: coreActions_1.SELECT_KERNEL_ID,
                    kind: 'prominent'
                }, coreActions_1.SELECT_KERNEL_ID, 1 /* StatusbarAlignment.RIGHT */, 10));
            }
        }
    };
    exports.KernelStatus = KernelStatus;
    exports.KernelStatus = KernelStatus = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, statusbar_1.IStatusbarService),
        __param(2, notebookKernelService_1.INotebookKernelService),
        __param(3, instantiation_1.IInstantiationService)
    ], KernelStatus);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(KernelStatus, 3 /* LifecyclePhase.Restored */);
    let ActiveCellStatus = class ActiveCellStatus extends lifecycle_1.Disposable {
        constructor(_editorService, _statusbarService) {
            super();
            this._editorService = _editorService;
            this._statusbarService = _statusbarService;
            this._itemDisposables = this._register(new lifecycle_1.DisposableStore());
            this._accessor = this._register(new lifecycle_1.MutableDisposable());
            this._register(this._editorService.onDidActiveEditorChange(() => this._update()));
        }
        _update() {
            this._itemDisposables.clear();
            const activeEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
            if (activeEditor) {
                this._itemDisposables.add(activeEditor.onDidChangeSelection(() => this._show(activeEditor)));
                this._itemDisposables.add(activeEditor.onDidChangeActiveCell(() => this._show(activeEditor)));
                this._show(activeEditor);
            }
            else {
                this._accessor.clear();
            }
        }
        _show(editor) {
            if (!editor.hasModel()) {
                this._accessor.clear();
                return;
            }
            const newText = this._getSelectionsText(editor);
            if (!newText) {
                this._accessor.clear();
                return;
            }
            const entry = {
                name: nls.localize('notebook.activeCellStatusName', "Notebook Editor Selections"),
                text: newText,
                ariaLabel: newText,
                command: arrow_1.CENTER_ACTIVE_CELL
            };
            if (!this._accessor.value) {
                this._accessor.value = this._statusbarService.addEntry(entry, 'notebook.activeCellStatus', 1 /* StatusbarAlignment.RIGHT */, 100);
            }
            else {
                this._accessor.value.update(entry);
            }
        }
        _getSelectionsText(editor) {
            if (!editor.hasModel()) {
                return undefined;
            }
            const activeCell = editor.getActiveCell();
            if (!activeCell) {
                return undefined;
            }
            const idxFocused = editor.getCellIndex(activeCell) + 1;
            const numSelected = editor.getSelections().reduce((prev, range) => prev + (range.end - range.start), 0);
            const totalCells = editor.getLength();
            return numSelected > 1 ?
                nls.localize('notebook.multiActiveCellIndicator', "Cell {0} ({1} selected)", idxFocused, numSelected) :
                nls.localize('notebook.singleActiveCellIndicator', "Cell {0} of {1}", idxFocused, totalCells);
        }
    };
    exports.ActiveCellStatus = ActiveCellStatus;
    exports.ActiveCellStatus = ActiveCellStatus = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, statusbar_1.IStatusbarService)
    ], ActiveCellStatus);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ActiveCellStatus, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU3RhdHVzQmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2VkaXRvclN0YXR1c0Jhci9lZGl0b3JTdGF0dXNCYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0JoRyxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFxQjtRQUkxQixZQUNDLFFBQTJCLEVBQzNCLFNBQTBCLEVBQ0YscUJBQTZDLEVBQzNDLHVCQUFpRCxFQUM5RCxVQUF1QjtZQUVwQyxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXJELE1BQU0sWUFBWSxHQUFHLEdBQUcsRUFBRTtnQkFDekIsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNwQixxQkFBcUIsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDcEUsQ0FBQyxDQUFDO1lBRUYsMEVBQTBFO1lBQzFFLDBDQUEwQztZQUMxQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDL0MsS0FBSyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFO29CQUNoQyxRQUFRLEtBQUssQ0FBQyxJQUFJLEVBQUU7d0JBQ25CLEtBQUssd0NBQXVCLENBQUMsaUJBQWlCLENBQUM7d0JBQy9DLEtBQUssd0NBQXVCLENBQUMsV0FBVyxDQUFDO3dCQUN6QyxLQUFLLHdDQUF1QixDQUFDLElBQUksQ0FBQzt3QkFDbEMsS0FBSyx3Q0FBdUIsQ0FBQyxrQkFBa0I7NEJBQzlDLFVBQVUsQ0FB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