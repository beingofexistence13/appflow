/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/platform/log/common/log", "vs/workbench/contrib/notebook/browser/contrib/clipboard/cellOutputClipboard", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls_1, actions_1, clipboardService_1, coreActions_1, notebookContextKeys_1, icons, log_1, cellOutputClipboard_1, editorService_1, notebookBrowser_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.COPY_OUTPUT_COMMAND_ID = void 0;
    exports.COPY_OUTPUT_COMMAND_ID = 'notebook.cellOutput.copy';
    (0, actions_1.registerAction2)(class CopyCellOutputAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.COPY_OUTPUT_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.copyOutput', "Copy Output"),
                menu: {
                    id: actions_1.MenuId.NotebookOutputToolbar,
                    when: notebookContextKeys_1.NOTEBOOK_CELL_HAS_OUTPUTS
                },
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                icon: icons.copyIcon,
            });
        }
        async run(accessor, outputContext) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const notebookEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
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
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const logService = accessor.get(log_1.ILogService);
                (0, cellOutputClipboard_1.copyCellOutput)(mimeType, outputViewModel, clipboardService, logService);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbE91dHB1dEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyb2xsZXIvY2VsbE91dHB1dEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JuRixRQUFBLHNCQUFzQixHQUFHLDBCQUEwQixDQUFDO0lBRWpFLElBQUEseUJBQWUsRUFBQyxNQUFNLG9CQUFxQixTQUFRLGlCQUFPO1FBQ3pEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw4QkFBc0I7Z0JBQzFCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSxhQUFhLENBQUM7Z0JBQzVELElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxxQkFBcUI7b0JBQ2hDLElBQUksRUFBRSwrQ0FBeUI7aUJBQy9CO2dCQUNELFFBQVEsRUFBRSx1Q0FBeUI7Z0JBQ25DLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUTthQUNwQixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLGFBQXVGO1lBQzVILE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sY0FBYyxHQUFHLElBQUEsaURBQStCLEVBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFdkYsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDcEIsT0FBTzthQUNQO1lBRUQsSUFBSSxlQUFpRCxDQUFDO1lBQ3RELElBQUksVUFBVSxJQUFJLGFBQWEsSUFBSSxPQUFPLGFBQWEsQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUM5RSxlQUFlLEdBQUcsd0JBQXdCLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQzthQUNuRjtpQkFBTTtnQkFDTixlQUFlLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQzthQUNoRDtZQUVELElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3JCLE9BQU87YUFDUDtZQUVELE1BQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDO1lBRTFELElBQUksUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbkMsTUFBTSxZQUFZLEdBQUcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUM1SSxNQUFNLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsYUFBK0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ2hILGNBQWMsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ04sTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7Z0JBQ3pELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQVcsQ0FBQyxDQUFDO2dCQUU3QyxJQUFBLG9DQUFjLEVBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN4RTtRQUNGLENBQUM7S0FFRCxDQUFDLENBQUM7SUFFSCxTQUFTLHdCQUF3QixDQUFDLFFBQWdCLEVBQUUsY0FBK0I7UUFDbEYsTUFBTSxpQkFBaUIsR0FBRyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDeEQsSUFBSSxpQkFBaUIsRUFBRTtZQUN0QixNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyx5QkFBUSxDQUFDLElBQUksQ0FBd0IsQ0FBQztZQUNySCxLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsRUFBRTtnQkFDN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RixJQUFJLE1BQU0sRUFBRTtvQkFDWCxPQUFPLE1BQU0sQ0FBQztpQkFDZDthQUNEO1NBQ0Q7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDIn0=