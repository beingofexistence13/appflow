/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/severity", "vs/nls!vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/base/common/labels", "vs/base/common/platform", "vs/base/common/objects"], function (require, exports, resources_1, severity_1, nls_1, instantiation_1, labels_1, platform_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sA = exports.$rA = exports.ConfirmResult = exports.$qA = exports.$pA = exports.$oA = void 0;
    exports.$oA = (0, instantiation_1.$Bh)('dialogService');
    var DialogKind;
    (function (DialogKind) {
        DialogKind[DialogKind["Confirmation"] = 1] = "Confirmation";
        DialogKind[DialogKind["Prompt"] = 2] = "Prompt";
        DialogKind[DialogKind["Input"] = 3] = "Input";
    })(DialogKind || (DialogKind = {}));
    class $pA {
        a(dialog) {
            return this.d(dialog, DialogKind.Confirmation);
        }
        b(dialog) {
            return this.d(dialog, DialogKind.Prompt);
        }
        c(dialog) {
            return this.d(dialog, DialogKind.Input);
        }
        d(dialog, kind) {
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
                        buttons.push((0, nls_1.localize)(0, null));
                    }
                    if (confirmationDialog.cancelButton) {
                        buttons.push(confirmationDialog.cancelButton);
                    }
                    else {
                        buttons.push((0, nls_1.localize)(1, null));
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
                            buttons.push((0, nls_1.localize)(2, null));
                        }
                        else if (typeof promptDialog.cancelButton === 'string') {
                            buttons.push(promptDialog.cancelButton);
                        }
                        else {
                            if (promptDialog.cancelButton.label) {
                                buttons.push(promptDialog.cancelButton.label);
                            }
                            else {
                                buttons.push((0, nls_1.localize)(3, null));
                            }
                        }
                    }
                    if (buttons.length === 0) {
                        buttons.push((0, nls_1.localize)(4, null));
                    }
                    break;
                }
                case DialogKind.Input: {
                    const inputDialog = dialog;
                    if (inputDialog.primaryButton) {
                        buttons.push(inputDialog.primaryButton);
                    }
                    else {
                        buttons.push((0, nls_1.localize)(5, null));
                    }
                    if (inputDialog.cancelButton) {
                        buttons.push(inputDialog.cancelButton);
                    }
                    else {
                        buttons.push((0, nls_1.localize)(6, null));
                    }
                    break;
                }
            }
            return buttons;
        }
        e(type) {
            if (typeof type === 'string') {
                return type;
            }
            if (typeof type === 'number') {
                return (type === severity_1.default.Info) ? 'info' : (type === severity_1.default.Error) ? 'error' : (type === severity_1.default.Warning) ? 'warning' : 'none';
            }
            return undefined;
        }
        async f(prompt, buttonIndex, checkboxChecked) {
            const promptButtons = [...(prompt.buttons ?? [])];
            if (prompt.cancelButton && typeof prompt.cancelButton !== 'string' && typeof prompt.cancelButton !== 'boolean') {
                promptButtons.push(prompt.cancelButton);
            }
            const result = await promptButtons[buttonIndex]?.run({ checkboxChecked });
            return { result, checkboxChecked };
        }
    }
    exports.$pA = $pA;
    exports.$qA = (0, instantiation_1.$Bh)('fileDialogService');
    var ConfirmResult;
    (function (ConfirmResult) {
        ConfirmResult[ConfirmResult["SAVE"] = 0] = "SAVE";
        ConfirmResult[ConfirmResult["DONT_SAVE"] = 1] = "DONT_SAVE";
        ConfirmResult[ConfirmResult["CANCEL"] = 2] = "CANCEL";
    })(ConfirmResult || (exports.ConfirmResult = ConfirmResult = {}));
    const MAX_CONFIRM_FILES = 10;
    function $rA(fileNamesOrResources) {
        const message = [];
        message.push(...fileNamesOrResources.slice(0, MAX_CONFIRM_FILES).map(fileNameOrResource => typeof fileNameOrResource === 'string' ? fileNameOrResource : (0, resources_1.$fg)(fileNameOrResource)));
        if (fileNamesOrResources.length > MAX_CONFIRM_FILES) {
            if (fileNamesOrResources.length - MAX_CONFIRM_FILES === 1) {
                message.push((0, nls_1.localize)(7, null));
            }
            else {
                message.push((0, nls_1.localize)(8, null, fileNamesOrResources.length - MAX_CONFIRM_FILES));
            }
        }
        message.push('');
        return message.join('\n');
    }
    exports.$rA = $rA;
    /**
     * A utility method to ensure the options for the message box dialog
     * are using properties that are consistent across all platforms and
     * specific to the platform where necessary.
     */
    function $sA(options, productService) {
        const massagedOptions = (0, objects_1.$Vm)(options);
        let buttons = (massagedOptions.buttons ?? []).map(button => (0, labels_1.$lA)(button));
        let buttonIndeces = (options.buttons || []).map((button, index) => index);
        let defaultId = 0; // by default the first button is default button
        let cancelId = massagedOptions.cancelId ?? buttons.length - 1; // by default the last button is cancel button
        // Apply HIG per OS when more than one button is used
        if (buttons.length > 1) {
            const cancelButton = typeof cancelId === 'number' ? buttons[cancelId] : undefined;
            if (platform_1.$k || platform_1.$j) {
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
                if (platform_1.$k && buttons.length > 1) {
                    buttons = buttons.reverse();
                    buttonIndeces = buttonIndeces.reverse();
                    defaultId = buttons.length - 1;
                    if (typeof cancelButton === 'string') {
                        cancelId = defaultId - 1;
                    }
                }
            }
            else if (platform_1.$i) {
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
    exports.$sA = $sA;
});
//# sourceMappingURL=dialogs.js.map