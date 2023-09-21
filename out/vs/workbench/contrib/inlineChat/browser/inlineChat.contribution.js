/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/actions/common/actions", "vs/editor/browser/editorExtensions", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/browser/inlineChatActions", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/inlineChat/common/inlineChatServiceImpl", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/platform/registry/common/platform", "vs/workbench/contrib/inlineChat/browser/inlineChatNotebook", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/workbench/common/contributions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/accessibility/browser/accessibleViewActions"], function (require, exports, actions_1, editorExtensions_1, inlineChatController_1, InlineChatActions, inlineChat_1, extensions_1, inlineChatServiceImpl_1, inlineChatSession_1, platform_1, inlineChatNotebook_1, accessibleView_1, lifecycle_1, codeEditorService_1, contributions_1, contextkey_1, accessibleViewActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(inlineChat_1.IInlineChatService, inlineChatServiceImpl_1.InlineChatServiceImpl, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(inlineChatSession_1.IInlineChatSessionService, inlineChatSession_1.InlineChatSessionService, 1 /* InstantiationType.Delayed */);
    (0, editorExtensions_1.registerEditorContribution)(inlineChat_1.INLINE_CHAT_ID, inlineChatController_1.InlineChatController, 0 /* EditorContributionInstantiation.Eager */); // EAGER because of notebook dispose/create of editors
    (0, editorExtensions_1.registerEditorContribution)(inlineChat_1.INTERACTIVE_EDITOR_ACCESSIBILITY_HELP_ID, InlineChatActions.InlineAccessibilityHelpContribution, 3 /* EditorContributionInstantiation.Eventually */);
    (0, actions_1.registerAction2)(InlineChatActions.StartSessionAction);
    (0, actions_1.registerAction2)(InlineChatActions.UnstashSessionAction);
    (0, actions_1.registerAction2)(InlineChatActions.MakeRequestAction);
    (0, actions_1.registerAction2)(InlineChatActions.StopRequestAction);
    (0, actions_1.registerAction2)(InlineChatActions.ReRunRequestAction);
    (0, actions_1.registerAction2)(InlineChatActions.DiscardAction);
    (0, actions_1.registerAction2)(InlineChatActions.DiscardToClipboardAction);
    (0, actions_1.registerAction2)(InlineChatActions.DiscardUndoToNewFileAction);
    (0, actions_1.registerAction2)(InlineChatActions.CancelSessionAction);
    (0, actions_1.registerAction2)(InlineChatActions.ArrowOutUpAction);
    (0, actions_1.registerAction2)(InlineChatActions.ArrowOutDownAction);
    (0, actions_1.registerAction2)(InlineChatActions.FocusInlineChat);
    (0, actions_1.registerAction2)(InlineChatActions.PreviousFromHistory);
    (0, actions_1.registerAction2)(InlineChatActions.NextFromHistory);
    (0, actions_1.registerAction2)(InlineChatActions.ViewInChatAction);
    (0, actions_1.registerAction2)(InlineChatActions.ExpandMessageAction);
    (0, actions_1.registerAction2)(InlineChatActions.ContractMessageAction);
    (0, actions_1.registerAction2)(InlineChatActions.ToggleInlineDiff);
    (0, actions_1.registerAction2)(InlineChatActions.FeebackHelpfulCommand);
    (0, actions_1.registerAction2)(InlineChatActions.FeebackUnhelpfulCommand);
    (0, actions_1.registerAction2)(InlineChatActions.ApplyPreviewEdits);
    (0, actions_1.registerAction2)(InlineChatActions.CopyRecordings);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(inlineChatNotebook_1.InlineChatNotebookContribution, 3 /* LifecyclePhase.Restored */);
    class InlineChatAccessibleViewContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibleViewAction.addImplementation(100, 'inlineChat', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const editor = (codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor());
                if (!editor) {
                    return false;
                }
                const controller = inlineChatController_1.InlineChatController.get(editor);
                if (!controller) {
                    return false;
                }
                const responseContent = controller?.getMessage();
                if (!responseContent) {
                    return false;
                }
                accessibleViewService.show({
                    verbositySettingKey: "accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */,
                    provideContent() { return responseContent; },
                    onClose() {
                        controller.focus();
                    },
                    options: { type: "view" /* AccessibleViewType.View */ }
                });
                return true;
            }, contextkey_1.ContextKeyExpr.or(inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_RESPONSE_FOCUSED)));
        }
    }
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(InlineChatAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbmxpbmVDaGF0L2Jyb3dzZXIvaW5saW5lQ2hhdC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFxQmhHLElBQUEsOEJBQWlCLEVBQUMsK0JBQWtCLEVBQUUsNkNBQXFCLG9DQUE0QixDQUFDO0lBQ3hGLElBQUEsOEJBQWlCLEVBQUMsNkNBQXlCLEVBQUUsNENBQXdCLG9DQUE0QixDQUFDO0lBRWxHLElBQUEsNkNBQTBCLEVBQUMsMkJBQWMsRUFBRSwyQ0FBb0IsZ0RBQXdDLENBQUMsQ0FBQyxzREFBc0Q7SUFDL0osSUFBQSw2Q0FBMEIsRUFBQyxxREFBd0MsRUFBRSxpQkFBaUIsQ0FBQyxtQ0FBbUMscURBQTZDLENBQUM7SUFFeEssSUFBQSx5QkFBZSxFQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdEQsSUFBQSx5QkFBZSxFQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDeEQsSUFBQSx5QkFBZSxFQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDckQsSUFBQSx5QkFBZSxFQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDckQsSUFBQSx5QkFBZSxFQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdEQsSUFBQSx5QkFBZSxFQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2pELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQzVELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzlELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxtQkFB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