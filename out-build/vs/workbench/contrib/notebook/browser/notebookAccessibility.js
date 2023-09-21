/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/notebookAccessibility", "vs/base/common/strings", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/notebook/browser/notebookBrowser"], function (require, exports, nls_1, strings_1, keybinding_1, accessibleView_1, notebookBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sGb = exports.$rGb = exports.$qGb = void 0;
    function $qGb(accessor) {
        const keybindingService = accessor.get(keybinding_1.$2D);
        const content = [];
        content.push((0, nls_1.localize)(0, null));
        content.push(descriptionForCommand('notebook.cell.edit', (0, nls_1.localize)(1, null), (0, nls_1.localize)(2, null), keybindingService));
        content.push(descriptionForCommand('notebook.cell.quitEdit', (0, nls_1.localize)(3, null), (0, nls_1.localize)(4, null), keybindingService));
        content.push(descriptionForCommand('notebook.cell.focusInOutput', (0, nls_1.localize)(5, null), (0, nls_1.localize)(6, null), keybindingService));
        content.push((0, nls_1.localize)(7, null));
        content.push(descriptionForCommand('notebook.cell.executeAndFocusContainer', (0, nls_1.localize)(8, null), (0, nls_1.localize)(9, null), keybindingService));
        content.push((0, nls_1.localize)(10, null));
        content.push((0, nls_1.localize)(11, null));
        return content.join('\n\n');
    }
    exports.$qGb = $qGb;
    function descriptionForCommand(commandId, msg, noKbMsg, keybindingService) {
        const kb = keybindingService.lookupKeybinding(commandId);
        if (kb) {
            return (0, strings_1.$ne)(msg, kb.getAriaLabel());
        }
        return (0, strings_1.$ne)(noKbMsg, commandId);
    }
    async function $rGb(accessor, editor) {
        const accessibleViewService = accessor.get(accessibleView_1.$wqb);
        const helpText = $qGb(accessor);
        accessibleViewService.show({
            verbositySettingKey: "accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */,
            provideContent: () => helpText,
            onClose: () => {
                editor.focus();
            },
            options: { type: "help" /* AccessibleViewType.Help */ }
        });
    }
    exports.$rGb = $rGb;
    function $sGb(accessibleViewService, editorService) {
        const activePane = editorService.activeEditorPane;
        const notebookEditor = (0, notebookBrowser_1.$Zbb)(activePane);
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
    exports.$sGb = $sGb;
});
//# sourceMappingURL=notebookAccessibility.js.map