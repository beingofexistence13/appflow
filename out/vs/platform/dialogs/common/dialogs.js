/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/severity", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/base/common/labels", "vs/base/common/platform", "vs/base/common/objects"], function (require, exports, resources_1, severity_1, nls_1, instantiation_1, labels_1, platform_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.massageMessageBoxOptions = exports.getFileNamesMessage = exports.ConfirmResult = exports.IFileDialogService = exports.AbstractDialogHandler = exports.IDialogService = void 0;
    exports.IDialogService = (0, instantiation_1.createDecorator)('dialogService');
    var DialogKind;
    (function (DialogKind) {
        DialogKind[DialogKind["Confirmation"] = 1] = "Confirmation";
        DialogKind[DialogKind["Prompt"] = 2] = "Prompt";
        DialogKind[DialogKind["Input"] = 3] = "Input";
    })(DialogKind || (DialogKind = {}));
    class AbstractDialogHandler {
        getConfirmationButtons(dialog) {
            return this.getButtons(dialog, DialogKind.Confirmation);
        }
        getPromptButtons(dialog) {
            return this.getButtons(dialog, DialogKind.Prompt);
        }
        getInputButtons(dialog) {
            return this.getButtons(dialog, DialogKind.Input);
        }
        getButtons(dialog, kind) {
            // We put buttons in the order of "default" button first and "cancel"
            // button last. There maybe later processing when presenting the buttons
            // based on OS standards.
            const buttons = [];
            switch (kind) {
                case DialogKind.Confirmation: {
                    const confirmationDialog = dialog;
                    if (confirmationDialog.primaryButton) {
                        buttons.push(confirmationDialog.primaryButton);
                    }
                    else {
                        buttons.push((0, nls_1.localize)({ key: 'yesButton', comment: ['&& denotes a mnemonic'] }, "&&Yes"));
                    }
                    if (confirmationDialog.cancelButton) {
                        buttons.push(confirmationDialog.cancelButton);
                    }
                    else {
                        buttons.push((0, nls_1.localize)('cancelButton', "Cancel"));
                    }
                    break;
                }
                case DialogKind.Prompt: {
                    const promptDialog = dialog;
                    if (Array.isArray(promptDialog.buttons) && promptDialog.buttons.length > 0) {
                        buttons.push(...promptDialog.buttons.map(button => button.label));
                    }
                    if (promptDialog.cancelButton) {
                        if (promptDialog.cancelButton === true) {
                            buttons.push((0, nls_1.localize)('cancelButton', "Cancel"));
                        }
                        else if (typeof promptDialog.cancelButton === 'string') {
                            buttons.push(promptDialog.cancelButton);
                        }
                        else {
                            if (promptDialog.cancelButton.label) {
                                buttons.push(promptDialog.cancelButton.label);
                            }
                            else {
                                buttons.push((0, nls_1.localize)('cancelButton', "Cancel"));
                            }
                        }
                    }
                    if (buttons.length === 0) {
                        buttons.push((0, nls_1.localize)({ key: 'okButton', comment: ['&& denotes a mnemonic'] }, "&&OK"));
                    }
                    break;
                }
                case DialogKind.Input: {
                    const inputDialog = dialog;
                    if (inputDialog.primaryButton) {
                        buttons.push(inputDialog.primaryButton);
                    }
                    else {
                        buttons.push((0, nls_1.localize)({ key: 'okButton', comment: ['&& denotes a mnemonic'] }, "&&OK"));
                    }
                    if (inputDialog.cancelButton) {
                        buttons.push(inputDialog.cancelButton);
                    }
                    else {
                        buttons.push((0, nls_1.localize)('cancelButton', "Cancel"));
                    }
                    break;
                }
            }
            return buttons;
        }
        getDialogType(type) {
            if (typeof type === 'string') {
                return type;
            }
            if (typeof type === 'number') {
                return (type === severity_1.default.Info) ? 'info' : (type === severity_1.default.Error) ? 'error' : (type === severity_1.default.Warning) ? 'warning' : 'none';
            }
            return undefined;
        }
        async getPromptResult(prompt, buttonIndex, checkboxChecked) {
            const promptButtons = [...(prompt.buttons ?? [])];
            if (prompt.cancelButton && typeof prompt.cancelButton !== 'string' && typeof prompt.cancelButton !== 'boolean') {
                promptButtons.push(prompt.cancelButton);
            }
            const result = await promptButtons[buttonIndex]?.run({ checkboxChecked });
            return { result, checkboxChecked };
        }
    }
    exports.AbstractDialogHandler = AbstractDialogHandler;
    exports.IFileDialogService = (0, instantiation_1.createDecorator)('fileDialogService');
    var ConfirmResult;
    (function (ConfirmResult) {
        ConfirmResult[ConfirmResult["SAVE"] = 0] = "SAVE";
        ConfirmResult[ConfirmResult["DONT_SAVE"] = 1] = "DONT_SAVE";
        ConfirmResult[ConfirmResult["CANCEL"] = 2] = "CANCEL";
    })(ConfirmResult || (exports.ConfirmResult = ConfirmResult = {}));
    const MAX_CONFIRM_FILES = 10;
    function getFileNamesMessage(fileNamesOrResources) {
        const message = [];
        message.push(...fileNamesOrResources.slice(0, MAX_CONFIRM_FILES).map(fileNameOrResource => typeof fileNameOrResource === 'string' ? fileNameOrResource : (0, resources_1.basename)(fileNameOrResource)));
        if (fileNamesOrResources.length > MAX_CONFIRM_FILES) {
            if (fileNamesOrResources.length - MAX_CONFIRM_FILES === 1) {
                message.push((0, nls_1.localize)('moreFile', "...1 additional file not shown"));
            }
            else {
                message.push((0, nls_1.localize)('moreFiles', "...{0} additional files not shown", fileNamesOrResources.length - MAX_CONFIRM_FILES));
            }
        }
        message.push('');
        return message.join('\n');
    }
    exports.getFileNamesMessage = getFileNamesMessage;
    /**
     * A utility method to ensure the options for the message box dialog
     * are using properties that are consistent across all platforms and
     * specific to the platform where necessary.
     */
    function massageMessageBoxOptions(options, productService) {
        const massagedOptions = (0, objects_1.deepClone)(options);
        let buttons = (massagedOptions.buttons ?? []).map(button => (0, labels_1.mnemonicButtonLabel)(button));
        let buttonIndeces = (options.buttons || []).map((button, index) => index);
        let defaultId = 0; // by default the first button is default button
        let cancelId = massagedOptions.cancelId ?? buttons.length - 1; // by default the last button is cancel button
        // Apply HIG per OS when more than one button is used
        if (buttons.length > 1) {
            const cancelButton = typeof cancelId === 'number' ? buttons[cancelId] : undefined;
            if (platform_1.isLinux || platform_1.isMacintosh) {
                // Linux: the GNOME HIG (https://developer.gnome.org/hig/patterns/feedback/dialogs.html?highlight=dialog)
                // recommend the following:
                // "Always ensure that the cancel button appears first, before the affirmative button. In left-to-right
                //  locales, this is on the left. This button order ensures that users become aware of, and are reminded
                //  of, the ability to cancel prior to encountering the affirmative button."
                //
                // Electron APIs do not reorder buttons for us, so we ensure a reverse order of buttons and a position
                // of the cancel button (if provided) that matches the HIG
                // macOS: the HIG (https://developer.apple.com/design/human-interface-guidelines/components/presentation/alerts)
                // recommend the following:
                // "Place buttons where people expect. In general, place the button people are most likely to choose on the trailing side in a
                //  row of buttons or at the top in a stack of buttons. Always place the default button on the trailing side of a row or at the
                //  top of a stack. Cancel buttons are typically on the leading side of a row or at the bottom of a stack."
                //
                // However: it seems that older macOS versions where 3 buttons were presented in a row differ from this
                // recommendation. In fact, cancel buttons were placed to the left of the default button and secondary
                // buttons on the far left. To support these older macOS versions we have to manually shuffle the cancel
                // button in the same way as we do on Linux. This will not have any impact on newer macOS versions where
                // shuffling is done for us.
                if (typeof cancelButton === 'string' && buttons.length > 1 && cancelId !== 1) {
                    buttons.splice(cancelId, 1);
                    buttons.splice(1, 0, cancelButton);
                    const cancelButtonIndex = buttonIndeces[cancelId];
                    buttonIndeces.splice(cancelId, 1);
                    buttonIndeces.splice(1, 0, cancelButtonIndex);
                    cancelId = 1;
                }
                if (platform_1.isLinux && buttons.length > 1) {
                    buttons = buttons.reverse();
                    buttonIndeces = buttonIndeces.reverse();
                    defaultId = buttons.length - 1;
                    if (typeof cancelButton === 'string') {
                        cancelId = defaultId - 1;
                    }
                }
            }
            else if (platform_1.isWindows) {
                // Windows: the HIG (https://learn.microsoft.com/en-us/windows/win32/uxguide/win-dialog-box)
                // recommend the following:
                // "One of the following sets of concise commands: Yes/No, Yes/No/Cancel, [Do it]/Cancel,
                //  [Do it]/[Don't do it], [Do it]/[Don't do it]/Cancel."
                //
                // Electron APIs do not reorder buttons for us, so we ensure the position of the cancel button
                // (if provided) that matches the HIG
                if (typeof cancelButton === 'string' && buttons.length > 1 && cancelId !== buttons.length - 1 /* last action */) {
                    buttons.splice(cancelId, 1);
                    buttons.push(cancelButton);
                    const buttonIndex = buttonIndeces[cancelId];
                    buttonIndeces.splice(cancelId, 1);
                    buttonIndeces.push(buttonIndex);
                    cancelId = buttons.length - 1;
                }
            }
        }
        massagedOptions.buttons = buttons;
        massagedOptions.defaultId = defaultId;
        massagedOptions.cancelId = cancelId;
        massagedOptions.noLink = true;
        massagedOptions.title = massagedOptions.title || productService.nameLong;
        return {
            options: massagedOptions,
            buttonIndeces
        };
    }
    exports.massageMessageBoxOptions = massageMessageBoxOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9ncy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2RpYWxvZ3MvY29tbW9uL2RpYWxvZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaVFuRixRQUFBLGNBQWMsR0FBRyxJQUFBLCtCQUFlLEVBQWlCLGVBQWUsQ0FBQyxDQUFDO0lBeUMvRSxJQUFLLFVBSUo7SUFKRCxXQUFLLFVBQVU7UUFDZCwyREFBZ0IsQ0FBQTtRQUNoQiwrQ0FBTSxDQUFBO1FBQ04sNkNBQUssQ0FBQTtJQUNOLENBQUMsRUFKSSxVQUFVLEtBQVYsVUFBVSxRQUlkO0lBRUQsTUFBc0IscUJBQXFCO1FBRWhDLHNCQUFzQixDQUFDLE1BQXFCO1lBQ3JELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFUyxnQkFBZ0IsQ0FBQyxNQUF3QjtZQUNsRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRVMsZUFBZSxDQUFDLE1BQWM7WUFDdkMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUtPLFVBQVUsQ0FBQyxNQUFpRCxFQUFFLElBQWdCO1lBRXJGLHFFQUFxRTtZQUNyRSx3RUFBd0U7WUFDeEUseUJBQXlCO1lBRXpCLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztZQUU3QixRQUFRLElBQUksRUFBRTtnQkFDYixLQUFLLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDN0IsTUFBTSxrQkFBa0IsR0FBRyxNQUF1QixDQUFDO29CQUVuRCxJQUFJLGtCQUFrQixDQUFDLGFBQWEsRUFBRTt3QkFDckMsT0FBTyxD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