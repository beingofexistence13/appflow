/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/actions/common/actions", "vs/editor/browser/editorExtensions", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/browser/inlineChatActions", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/inlineChat/common/inlineChatServiceImpl", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/platform/registry/common/platform", "vs/workbench/contrib/inlineChat/browser/inlineChatNotebook", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/workbench/common/contributions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/accessibility/browser/accessibleViewActions"], function (require, exports, actions_1, editorExtensions_1, inlineChatController_1, InlineChatActions, inlineChat_1, extensions_1, inlineChatServiceImpl_1, inlineChatSession_1, platform_1, inlineChatNotebook_1, accessibleView_1, lifecycle_1, codeEditorService_1, contributions_1, contextkey_1, accessibleViewActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.$mr)(inlineChat_1.$dz, inlineChatServiceImpl_1.$GJb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(inlineChatSession_1.$bqb, inlineChatSession_1.$cqb, 1 /* InstantiationType.Delayed */);
    (0, editorExtensions_1.$AV)(inlineChat_1.$ez, inlineChatController_1.$Qqb, 0 /* EditorContributionInstantiation.Eager */); // EAGER because of notebook dispose/create of editors
    (0, editorExtensions_1.$AV)(inlineChat_1.$fz, InlineChatActions.$FJb, 3 /* EditorContributionInstantiation.Eventually */);
    (0, actions_1.$Xu)(InlineChatActions.$jJb);
    (0, actions_1.$Xu)(InlineChatActions.$kJb);
    (0, actions_1.$Xu)(InlineChatActions.$lJb);
    (0, actions_1.$Xu)(InlineChatActions.$nJb);
    (0, actions_1.$Xu)(InlineChatActions.$mJb);
    (0, actions_1.$Xu)(InlineChatActions.$tJb);
    (0, actions_1.$Xu)(InlineChatActions.$uJb);
    (0, actions_1.$Xu)(InlineChatActions.$vJb);
    (0, actions_1.$Xu)(InlineChatActions.$AJb);
    (0, actions_1.$Xu)(InlineChatActions.$oJb);
    (0, actions_1.$Xu)(InlineChatActions.$pJb);
    (0, actions_1.$Xu)(InlineChatActions.$qJb);
    (0, actions_1.$Xu)(InlineChatActions.$rJb);
    (0, actions_1.$Xu)(InlineChatActions.$sJb);
    (0, actions_1.$Xu)(InlineChatActions.$CJb);
    (0, actions_1.$Xu)(InlineChatActions.$DJb);
    (0, actions_1.$Xu)(InlineChatActions.$EJb);
    (0, actions_1.$Xu)(InlineChatActions.$yJb);
    (0, actions_1.$Xu)(InlineChatActions.$wJb);
    (0, actions_1.$Xu)(InlineChatActions.$xJb);
    (0, actions_1.$Xu)(InlineChatActions.$zJb);
    (0, actions_1.$Xu)(InlineChatActions.$BJb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(inlineChatNotebook_1.$HJb, 3 /* LifecyclePhase.Restored */);
    class InlineChatAccessibleViewContribution extends lifecycle_1.$kc {
        constructor() {
            super();
            this.B(accessibleViewActions_1.$uGb.addImplementation(100, 'inlineChat', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.$wqb);
                const codeEditorService = accessor.get(codeEditorService_1.$nV);
                const editor = (codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor());
                if (!editor) {
                    return false;
                }
                const controller = inlineChatController_1.$Qqb.get(editor);
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
            }, contextkey_1.$Ii.or(inlineChat_1.$iz, inlineChat_1.$jz)));
        }
    }
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(InlineChatAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=inlineChat.contribution.js.map