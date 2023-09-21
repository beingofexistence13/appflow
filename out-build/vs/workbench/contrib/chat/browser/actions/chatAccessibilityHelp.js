/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp", "vs/base/common/strings", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/editor/browser/widget/diffEditor/diffEditor.contribution"], function (require, exports, nls_1, strings_1, keybinding_1, chat_1, inlineChatController_1, accessibleView_1, diffEditor_contribution_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xGb = exports.$wGb = void 0;
    function $wGb(accessor, type) {
        const keybindingService = accessor.get(keybinding_1.$2D);
        const content = [];
        const openAccessibleViewKeybinding = keybindingService.lookupKeybinding('editor.action.accessibleView')?.getAriaLabel();
        if (type === 'panelChat') {
            content.push((0, nls_1.localize)(0, null));
            content.push((0, nls_1.localize)(1, null));
            content.push(openAccessibleViewKeybinding ? (0, nls_1.localize)(2, null, openAccessibleViewKeybinding) : (0, nls_1.localize)(3, null));
            content.push((0, nls_1.localize)(4, null));
            content.push(descriptionForCommand('chat.action.focus', (0, nls_1.localize)(5, null), (0, nls_1.localize)(6, null), keybindingService));
            content.push(descriptionForCommand('workbench.action.chat.focusInput', (0, nls_1.localize)(7, null), (0, nls_1.localize)(8, null), keybindingService));
            content.push(descriptionForCommand('workbench.action.chat.nextCodeBlock', (0, nls_1.localize)(9, null), (0, nls_1.localize)(10, null), keybindingService));
            content.push(descriptionForCommand('workbench.action.chat.nextFileTree', (0, nls_1.localize)(11, null), (0, nls_1.localize)(12, null), keybindingService));
            content.push(descriptionForCommand('workbench.action.chat.clear', (0, nls_1.localize)(13, null), (0, nls_1.localize)(14, null), keybindingService));
        }
        else {
            const startChatKeybinding = keybindingService.lookupKeybinding('inlineChat.start')?.getAriaLabel();
            content.push((0, nls_1.localize)(15, null));
            content.push((0, nls_1.localize)(16, null, startChatKeybinding));
            const upHistoryKeybinding = keybindingService.lookupKeybinding('inlineChat.previousFromHistory')?.getAriaLabel();
            const downHistoryKeybinding = keybindingService.lookupKeybinding('inlineChat.nextFromHistory')?.getAriaLabel();
            if (upHistoryKeybinding && downHistoryKeybinding) {
                content.push((0, nls_1.localize)(17, null, upHistoryKeybinding, downHistoryKeybinding));
            }
            content.push(openAccessibleViewKeybinding ? (0, nls_1.localize)(18, null, openAccessibleViewKeybinding) : (0, nls_1.localize)(19, null));
            content.push((0, nls_1.localize)(20, null));
            content.push((0, nls_1.localize)(21, null));
            const diffReviewKeybinding = keybindingService.lookupKeybinding(diffEditor_contribution_1.$b1.id)?.getAriaLabel();
            content.push(diffReviewKeybinding ? (0, nls_1.localize)(22, null, diffReviewKeybinding) : (0, nls_1.localize)(23, null));
            content.push((0, nls_1.localize)(24, null));
        }
        content.push((0, nls_1.localize)(25, null));
        return content.join('\n\n');
    }
    exports.$wGb = $wGb;
    function descriptionForCommand(commandId, msg, noKbMsg, keybindingService) {
        const kb = keybindingService.lookupKeybinding(commandId);
        if (kb) {
            return (0, strings_1.$ne)(msg, kb.getAriaLabel());
        }
        return (0, strings_1.$ne)(noKbMsg, commandId);
    }
    async function $xGb(accessor, editor, type) {
        const widgetService = accessor.get(chat_1.$Nqb);
        const accessibleViewService = accessor.get(accessibleView_1.$wqb);
        const inputEditor = type === 'panelChat' ? widgetService.lastFocusedWidget?.inputEditor : editor;
        if (!inputEditor) {
            return;
        }
        const domNode = inputEditor.getDomNode() ?? undefined;
        if (!domNode) {
            return;
        }
        const cachedPosition = inputEditor.getPosition();
        inputEditor.getSupportedActions();
        const helpText = $wGb(accessor, type);
        accessibleViewService.show({
            verbositySettingKey: type === 'panelChat' ? "accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */ : "accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */,
            provideContent: () => helpText,
            onClose: () => {
                if (type === 'panelChat' && cachedPosition) {
                    inputEditor.setPosition(cachedPosition);
                    inputEditor.focus();
                }
                else if (type === 'inlineChat') {
                    if (editor) {
                        inlineChatController_1.$Qqb.get(editor)?.focus();
                    }
                }
            },
            options: { type: "help" /* AccessibleViewType.Help */ }
        });
    }
    exports.$xGb = $xGb;
});
//# sourceMappingURL=chatAccessibilityHelp.js.map