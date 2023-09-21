/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/controller/cellOutputActions", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/platform/log/common/log", "vs/workbench/contrib/notebook/browser/contrib/clipboard/cellOutputClipboard", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls_1, actions_1, clipboardService_1, coreActions_1, notebookContextKeys_1, icons, log_1, cellOutputClipboard_1, editorService_1, notebookBrowser_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Vpb = void 0;
    exports.$Vpb = 'notebook.cellOutput.copy';
    (0, actions_1.$Xu)(class CopyCellOutputAction extends actions_1.$Wu {
        constructor() {
            super({
                id: exports.$Vpb,
                title: (0, nls_1.localize)(0, null),
                menu: {
                    id: actions_1.$Ru.NotebookOutputToolbar,
                    when: notebookContextKeys_1.$hob
                },
                category: coreActions_1.$7ob,
                icon: icons.$Qpb,
            });
        }
        async run(accessor, outputContext) {
            const editorService = accessor.get(editorService_1.$9C);
            const notebookEditor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
            if (!notebookEditor) {
                return;
            }
            let outputViewModel;
            if ('outputId' in outputContext && typeof outputContext.outputId === 'string') {
                outputViewModel = getOutputViewModelFromId(outputContext.outputId, notebookEditor);
            }
            else {
                outputViewModel = outputContext.outputViewModel;
            }
            if (!outputViewModel) {
                return;
            }
            const mimeType = outputViewModel.pickedMimeType?.mimeType;
            if (mimeType?.startsWith('image/')) {
                const focusOptions = { skipReveal: true, outputId: outputViewModel.model.outputId, altOutputId: outputViewModel.model.alternativeOutputId };
                await notebookEditor.focusNotebookCell(outputViewModel.cellViewModel, 'output', focusOptions);
                notebookEditor.copyOutputImage(outputViewModel);
            }
            else {
                const clipboardService = accessor.get(clipboardService_1.$UZ);
                const logService = accessor.get(log_1.$5i);
                (0, cellOutputClipboard_1.$Tpb)(mimeType, outputViewModel, clipboardService, logService);
            }
        }
    });
    function getOutputViewModelFromId(outputId, notebookEditor) {
        const notebookViewModel = notebookEditor.getViewModel();
        if (notebookViewModel) {
            const codeCells = notebookViewModel.viewCells.filter(cell => cell.cellKind === notebookCommon_1.CellKind.Code);
            for (const cell of codeCells) {
                const output = cell.outputsViewModels.find(output => output.model.outputId === outputId);
                if (output) {
                    return output;
                }
            }
        }
        return undefined;
    }
});
//# sourceMappingURL=cellOutputActions.js.map