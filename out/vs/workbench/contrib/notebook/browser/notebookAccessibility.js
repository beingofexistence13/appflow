/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/strings", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/notebook/browser/notebookBrowser"], function (require, exports, nls_1, strings_1, keybinding_1, accessibleView_1, notebookBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showAccessibleOutput = exports.runAccessibilityHelpAction = exports.getAccessibilityHelpText = void 0;
    function getAccessibilityHelpText(accessor) {
        const keybindingService = accessor.get(keybinding_1.IKeybindingService);
        const content = [];
        content.push((0, nls_1.localize)('notebook.overview', 'The notebook view is a collection of code and markdown cells. Code cells can be executed and will produce output directly below the cell.'));
        content.push(descriptionForCommand('notebook.cell.edit', (0, nls_1.localize)('notebook.cell.edit', 'The Edit Cell command ({0}) will focus on the cell input.'), (0, nls_1.localize)('notebook.cell.editNoKb', 'The Edit Cell command will focus on the cell input and is currently not triggerable by a keybinding.'), keybindingService));
        content.push(descriptionForCommand('notebook.cell.quitEdit', (0, nls_1.localize)('notebook.cell.quitEdit', 'The Quit Edit command ({0}) will set focus on the cell container. The default (Escape) key may need to be pressed twice first exit the virtual cursor if active.'), (0, nls_1.localize)('notebook.cell.quitEditNoKb', 'The Quit Edit command will set focus on the cell container and is currently not triggerable by a keybinding.'), keybindingService));
        content.push(descriptionForCommand('notebook.cell.focusInOutput', (0, nls_1.localize)('notebook.cell.focusInOutput', 'The Focus Output command ({0}) will set focus in the cell\'s output.'), (0, nls_1.localize)('notebook.cell.focusInOutputNoKb', 'The Quit Edit command will set focus in the cell\'s output and is currently not triggerable by a keybinding.'), keybindingService));
        content.push((0, nls_1.localize)('notebook.cellNavigation', 'The up and down arrows will move focus between cells while focused on the outer cell container'));
        content.push(descriptionForCommand('notebook.cell.executeAndFocusContainer', (0, nls_1.localize)('notebook.cell.executeAndFocusContainer', 'The Execute Cell command ({0}) executes the cell that currently has focus.'), (0, nls_1.localize)('notebook.cell.executeAndFocusContainerNoKb', 'The Execute Cell command executes the cell that currently has focus and is currently not triggerable by a keybinding.'), keybindingService));
        content.push((0, nls_1.localize)('notebook.cell.insertCodeCellBelowAndFocusContainer', 'The Insert Cell Above/Below commands will create new empty code cells'));
        content.push((0, nls_1.localize)('notebook.changeCellType', 'The Change Cell to Code/Markdown commands are used to switch between cell types.'));
        return content.join('\n\n');
    }
    exports.getAccessibilityHelpText = getAccessibilityHelpText;
    function descriptionForCommand(commandId, msg, noKbMsg, keybindingService) {
        const kb = keybindingService.lookupKeybinding(commandId);
        if (kb) {
            return (0, strings_1.format)(msg, kb.getAriaLabel());
        }
        return (0, strings_1.format)(noKbMsg, commandId);
    }
    async function runAccessibilityHelpAction(accessor, editor) {
        const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
        const helpText = getAccessibilityHelpText(accessor);
        accessibleViewService.show({
            verbositySettingKey: "accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */,
            provideContent: () => helpText,
            onClose: () => {
                editor.focus();
            },
            options: { type: "help" /* AccessibleViewType.Help */ }
        });
    }
    exports.runAccessibilityHelpAction = runAccessibilityHelpAction;
    function showAccessibleOutput(accessibleViewService, editorService) {
        const activePane = editorService.activeEditorPane;
        const notebookEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(activePane);
        const notebookViewModel = notebookEditor?.getViewModel();
        const selections = notebookViewModel?.getSelections();
        const notebookDocument = notebookViewModel?.notebookDocument;
        if (!selections || !notebookDocument || !notebookEditor?.textModel) {
            return false;
        }
        const viewCell = notebookViewModel.viewCells[selections[0].start];
        let outputContent = '';
        const decoder = new TextDecoder();
        for (let i = 0; i < viewCell.outputsViewModels.length; i++) {
            const outputViewModel = viewCell.outputsViewModels[i];
            const outputTextModel = viewCell.model.outputs[i];
            const [mimeTypes, pick] = outputViewModel.resolveMimeTypes(notebookEditor.textModel, undefined);
            const mimeType = mimeTypes[pick].mimeType;
            let buffer = outputTextModel.outputs.find(output => output.mime === mimeType);
            if (!buffer || mimeType.startsWith('image')) {
                buffer = outputTextModel.outputs.find(output => !output.mime.startsWith('image'));
            }
            let text = `${mimeType}`; // default in case we can't get the text value for some reason.
            if (buffer) {
                const charLimit = 100000;
                text = decoder.decode(buffer.data.slice(0, charLimit).buffer);
                if (buffer.data.byteLength > charLimit) {
                    text = text + '...(truncated)';
                }
                if (mimeType.endsWith('error')) {
                    text = text.replace(/\\u001b\[[0-9;]*m/gi, '').replaceAll('\\n', '\n');
                }
            }
            const index = viewCell.outputsViewModels.length > 1
                ? `Cell output ${i + 1} of ${viewCell.outputsViewModels.length}\n`
                : '';
            outputContent = outputContent.concat(`${index}${text}\n`);
        }
        if (!outputContent) {
            return false;
        }
        accessibleViewService.show({
            verbositySettingKey: "accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */,
            provideContent() { return outputContent; },
            onClose() {
                notebookEditor?.setFocus(selections[0]);
                activePane?.focus();
            },
            options: { type: "view" /* AccessibleViewType.View */ }
        });
        return true;
    }
    exports.showAccessibleOutput = showAccessibleOutput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tBY2Nlc3NpYmlsaXR5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9ub3RlYm9va0FjY2Vzc2liaWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLFNBQWdCLHdCQUF3QixDQUFDLFFBQTBCO1FBQ2xFLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1FBQzNELE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLDJJQUEySSxDQUFDLENBQUMsQ0FBQztRQUN6TCxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG9CQUFvQixFQUN0RCxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSwyREFBMkQsQ0FBQyxFQUMzRixJQUFBLGNBQVEsRUFBQyx3QkFBd0IsRUFBRSxzR0FBc0csQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNqSyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHdCQUF3QixFQUMxRCxJQUFBLGNBQVEsRUFBQyx3QkFBd0IsRUFBRSxrS0FBa0ssQ0FBQyxFQUN0TSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSw4R0FBOEcsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUM3SyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLDZCQUE2QixFQUMvRCxJQUFBLGNBQVEsRUFBQyw2QkFBNkIsRUFBRSxzRUFBc0UsQ0FBQyxFQUMvRyxJQUFBLGNBQVEsRUFBQyxpQ0FBaUMsRUFBRSw4R0FBOEcsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNsTCxP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