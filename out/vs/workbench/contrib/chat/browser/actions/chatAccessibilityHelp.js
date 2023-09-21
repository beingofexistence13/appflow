/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/strings", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/editor/browser/widget/diffEditor/diffEditor.contribution"], function (require, exports, nls_1, strings_1, keybinding_1, chat_1, inlineChatController_1, accessibleView_1, diffEditor_contribution_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runAccessibilityHelpAction = exports.getAccessibilityHelpText = void 0;
    function getAccessibilityHelpText(accessor, type) {
        const keybindingService = accessor.get(keybinding_1.IKeybindingService);
        const content = [];
        const openAccessibleViewKeybinding = keybindingService.lookupKeybinding('editor.action.accessibleView')?.getAriaLabel();
        if (type === 'panelChat') {
            content.push((0, nls_1.localize)('chat.overview', 'The chat view is comprised of an input box and a request/response list. The input box is used to make requests and the list is used to display responses.'));
            content.push((0, nls_1.localize)('chat.requestHistory', 'In the input box, use up and down arrows to navigate your request history. Edit input and use enter or the submit button to run a new request.'));
            content.push(openAccessibleViewKeybinding ? (0, nls_1.localize)('chat.inspectResponse', 'In the input box, inspect the last response in the accessible view via {0}', openAccessibleViewKeybinding) : (0, nls_1.localize)('chat.inspectResponseNoKb', 'With the input box focused, inspect the last response in the accessible view via the Open Accessible View command, which is currently not triggerable by a keybinding.'));
            content.push((0, nls_1.localize)('chat.announcement', 'Chat responses will be announced as they come in. A response will indicate the number of code blocks, if any, and then the rest of the response.'));
            content.push(descriptionForCommand('chat.action.focus', (0, nls_1.localize)('workbench.action.chat.focus', 'To focus the chat request/response list, which can be navigated with up and down arrows, invoke the Focus Chat command ({0}).'), (0, nls_1.localize)('workbench.action.chat.focusNoKb', 'To focus the chat request/response list, which can be navigated with up and down arrows, invoke The Focus Chat List command, which is currently not triggerable by a keybinding.'), keybindingService));
            content.push(descriptionForCommand('workbench.action.chat.focusInput', (0, nls_1.localize)('workbench.action.chat.focusInput', 'To focus the input box for chat requests, invoke the Focus Chat Input command ({0})'), (0, nls_1.localize)('workbench.action.interactiveSession.focusInputNoKb', 'To focus the input box for chat requests, invoke the Focus Chat Input command, which is currently not triggerable by a keybinding.'), keybindingService));
            content.push(descriptionForCommand('workbench.action.chat.nextCodeBlock', (0, nls_1.localize)('workbench.action.chat.nextCodeBlock', 'To focus the next code block within a response, invoke the Chat: Next Code Block command ({0}).'), (0, nls_1.localize)('workbench.action.chat.nextCodeBlockNoKb', 'To focus the next code block within a response, invoke the Chat: Next Code Block command, which is currently not triggerable by a keybinding.'), keybindingService));
            content.push(descriptionForCommand('workbench.action.chat.nextFileTree', (0, nls_1.localize)('workbench.action.chat.nextFileTree', 'To focus the next file tree within a response, invoke the Chat: Next File Tree command ({0}).'), (0, nls_1.localize)('workbench.action.chat.nextFileTreeNoKb', 'To focus the next file tree within a response, invoke the Chat: Next File Tree command, which is currently not triggerable by a keybinding.'), keybindingService));
            content.push(descriptionForCommand('workbench.action.chat.clear', (0, nls_1.localize)('workbench.action.chat.clear', 'To clear the request/response list, invoke the Chat Clear command ({0}).'), (0, nls_1.localize)('workbench.action.chat.clearNoKb', 'To clear the request/response list, invoke the Chat Clear command, which is currently not triggerable by a keybinding.'), keybindingService));
        }
        else {
            const startChatKeybinding = keybindingService.lookupKeybinding('inlineChat.start')?.getAriaLabel();
            content.push((0, nls_1.localize)('inlineChat.overview', "Inline chat occurs within a code editor and takes into account the current selection. It is useful for making changes to the current editor. For example, fixing diagnostics, documenting or refactoring code. Keep in mind that AI generated code may be incorrect."));
            content.push((0, nls_1.localize)('inlineChat.access', "It can be activated via code actions or directly using the command: Inline Chat: Start Code Chat ({0}).", startChatKeybinding));
            const upHistoryKeybinding = keybindingService.lookupKeybinding('inlineChat.previousFromHistory')?.getAriaLabel();
            const downHistoryKeybinding = keybindingService.lookupKeybinding('inlineChat.nextFromHistory')?.getAriaLabel();
            if (upHistoryKeybinding && downHistoryKeybinding) {
                content.push((0, nls_1.localize)('inlineChat.requestHistory', 'In the input box, use {0} and {1} to navigate your request history. Edit input and use enter or the submit button to run a new request.', upHistoryKeybinding, downHistoryKeybinding));
            }
            content.push(openAccessibleViewKeybinding ? (0, nls_1.localize)('inlineChat.inspectResponse', 'In the input box, inspect the response in the accessible view via {0}', openAccessibleViewKeybinding) : (0, nls_1.localize)('inlineChat.inspectResponseNoKb', 'With the input box focused, inspect the response in the accessible view via the Open Accessible View command, which is currently not triggerable by a keybinding.'));
            content.push((0, nls_1.localize)('inlineChat.contextActions', "Context menu actions may run a request prefixed with a /. Type / to discover such ready-made commands."));
            content.push((0, nls_1.localize)('inlineChat.fix', "If a fix action is invoked, a response will indicate the problem with the current code. A diff editor will be rendered and can be reached by tabbing."));
            const diffReviewKeybinding = keybindingService.lookupKeybinding(diffEditor_contribution_1.AccessibleDiffViewerNext.id)?.getAriaLabel();
            content.push(diffReviewKeybinding ? (0, nls_1.localize)('inlineChat.diff', "Once in the diff editor, enter review mode with ({0}). Use up and down arrows to navigate lines with the proposed changes.", diffReviewKeybinding) : (0, nls_1.localize)('inlineChat.diffNoKb', "Tab again to enter the Diff editor with the changes and enter review mode with the Go to Next Difference Command. Use Up/DownArrow to navigate lines with the proposed changes."));
            content.push((0, nls_1.localize)('inlineChat.toolbar', "Use tab to reach conditional parts like commands, status, message responses and more."));
        }
        content.push((0, nls_1.localize)('chat.audioCues', "Audio cues can be changed via settings with a prefix of audioCues.chat. By default, if a request takes more than 4 seconds, you will hear an audio cue indicating that progress is still occurring."));
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
    async function runAccessibilityHelpAction(accessor, editor, type) {
        const widgetService = accessor.get(chat_1.IChatWidgetService);
        const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
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
        const helpText = getAccessibilityHelpText(accessor, type);
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
                        inlineChatController_1.InlineChatController.get(editor)?.focus();
                    }
                }
            },
            options: { type: "help" /* AccessibleViewType.Help */ }
        });
    }
    exports.runAccessibilityHelpAction = runAccessibilityHelpAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEFjY2Vzc2liaWxpdHlIZWxwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2FjdGlvbnMvY2hhdEFjY2Vzc2liaWxpdHlIZWxwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxTQUFnQix3QkFBd0IsQ0FBQyxRQUEwQixFQUFFLElBQWdDO1FBQ3BHLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1FBQzNELE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNuQixNQUFNLDRCQUE0QixHQUFHLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLDhCQUE4QixDQUFDLEVBQUUsWUFBWSxFQUFFLENBQUM7UUFDeEgsSUFBSSxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFFLDJKQUEySixDQUFDLENBQUMsQ0FBQztZQUNyTSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUEsY0FBUSxFQUFDLHFCQUFxQixFQUFFLGdKQUFnSixDQUFDLENBQUMsQ0FBQztZQUNoTSxPQUFPLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSw0RUFBNEUsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSx3S0FBd0ssQ0FBQyxDQUFDLENBQUM7WUFDM1ksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSxrSkFBa0osQ0FBQyxDQUFDLENBQUM7WUFDaE0sT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsRUFBRSxJQUFBLGNB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