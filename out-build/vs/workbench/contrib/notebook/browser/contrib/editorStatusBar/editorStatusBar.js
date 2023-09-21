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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/editor/common/services/languageFeatures", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/editorStatusBar/editorStatusBar", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/contrib/navigation/arrow", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/statusbar/browser/statusbar"], function (require, exports, lifecycle_1, network_1, languageFeatures_1, nls, instantiation_1, log_1, platform_1, contributions_1, arrow_1, coreActions_1, notebookBrowser_1, notebookCommon_1, notebookKernelService_1, editorService_1, statusbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DFb = exports.$CFb = void 0;
    let ImplictKernelSelector = class ImplictKernelSelector {
        constructor(notebook, suggested, notebookKernelService, languageFeaturesService, logService) {
            const disposables = new lifecycle_1.$jc();
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
        __param(2, notebookKernelService_1.$Bbb),
        __param(3, languageFeatures_1.$hF),
        __param(4, log_1.$5i)
    ], ImplictKernelSelector);
    let $CFb = class $CFb extends lifecycle_1.$kc {
        constructor(c, f, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = this.B(new lifecycle_1.$jc());
            this.b = this.B(new lifecycle_1.$jc());
            this.B(this.c.onDidActiveEditorChange(() => this.j()));
        }
        j() {
            this.a.clear();
            const activeEditor = (0, notebookBrowser_1.$Zbb)(this.c.activeEditorPane);
            if (!activeEditor) {
                // not a notebook -> clean-up, done
                this.b.clear();
                return;
            }
            const updateStatus = () => {
                if (activeEditor.notebookOptions.getLayoutConfiguration().globalToolbar) {
                    // kernel info rendered in the notebook toolbar already
                    this.b.clear();
                    return;
                }
                const notebook = activeEditor.textModel;
                if (notebook) {
                    this.m(notebook);
                }
                else {
                    this.b.clear();
                }
            };
            this.a.add(this.g.onDidAddKernel(updateStatus));
            this.a.add(this.g.onDidChangeSelectedNotebooks(updateStatus));
            this.a.add(this.g.onDidChangeNotebookAffinity(updateStatus));
            this.a.add(activeEditor.onDidChangeModel(updateStatus));
            this.a.add(activeEditor.notebookOptions.onDidChangeOptions(updateStatus));
            updateStatus();
        }
        m(notebook) {
            this.b.clear();
            const { selected, suggestions, all } = this.g.getMatchingKernel(notebook);
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
                    this.b.add(this.h.createInstance(ImplictKernelSelector, notebook, kernel));
                }
                const tooltip = kernel.description ?? kernel.detail ?? kernel.label;
                this.b.add(this.f.addEntry({
                    name: nls.localize(0, null),
                    text: `$(notebook-kernel-select) ${kernel.label}`,
                    ariaLabel: kernel.label,
                    tooltip: isSuggested ? nls.localize(1, null, tooltip) : tooltip,
                    command: coreActions_1.$6ob,
                }, coreActions_1.$6ob, 1 /* StatusbarAlignment.RIGHT */, 10));
                this.b.add(kernel.onDidChange(() => this.m(notebook)));
            }
            else {
                // multiple kernels -> show selection hint
                this.b.add(this.f.addEntry({
                    name: nls.localize(2, null),
                    text: nls.localize(3, null),
                    ariaLabel: nls.localize(4, null),
                    command: coreActions_1.$6ob,
                    kind: 'prominent'
                }, coreActions_1.$6ob, 1 /* StatusbarAlignment.RIGHT */, 10));
            }
        }
    };
    exports.$CFb = $CFb;
    exports.$CFb = $CFb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, statusbar_1.$6$),
        __param(2, notebookKernelService_1.$Bbb),
        __param(3, instantiation_1.$Ah)
    ], $CFb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($CFb, 3 /* LifecyclePhase.Restored */);
    let $DFb = class $DFb extends lifecycle_1.$kc {
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = this.B(new lifecycle_1.$jc());
            this.b = this.B(new lifecycle_1.$lc());
            this.B(this.c.onDidActiveEditorChange(() => this.g()));
        }
        g() {
            this.a.clear();
            const activeEditor = (0, notebookBrowser_1.$Zbb)(this.c.activeEditorPane);
            if (activeEditor) {
                this.a.add(activeEditor.onDidChangeSelection(() => this.h(activeEditor)));
                this.a.add(activeEditor.onDidChangeActiveCell(() => this.h(activeEditor)));
                this.h(activeEditor);
            }
            else {
                this.b.clear();
            }
        }
        h(editor) {
            if (!editor.hasModel()) {
                this.b.clear();
                return;
            }
            const newText = this.j(editor);
            if (!newText) {
                this.b.clear();
                return;
            }
            const entry = {
                name: nls.localize(5, null),
                text: newText,
                ariaLabel: newText,
                command: arrow_1.$sFb
            };
            if (!this.b.value) {
                this.b.value = this.f.addEntry(entry, 'notebook.activeCellStatus', 1 /* StatusbarAlignment.RIGHT */, 100);
            }
            else {
                this.b.value.update(entry);
            }
        }
        j(editor) {
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
                nls.localize(6, null, idxFocused, numSelected) :
                nls.localize(7, null, idxFocused, totalCells);
        }
    };
    exports.$DFb = $DFb;
    exports.$DFb = $DFb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, statusbar_1.$6$)
    ], $DFb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($DFb, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=editorStatusBar.js.map