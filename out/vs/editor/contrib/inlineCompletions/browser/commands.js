/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observable", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/contrib/inlineCompletions/browser/commandIds", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/suggest/browser/suggest", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey"], function (require, exports, observable_1, editorExtensions_1, editorContextKeys_1, commandIds_1, inlineCompletionContextKeys_1, inlineCompletionsController_1, suggest_1, nls, actions_1, configuration_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleAlwaysShowInlineSuggestionToolbar = exports.HideInlineCompletion = exports.AcceptInlineCompletion = exports.AcceptNextLineOfInlineCompletion = exports.AcceptNextWordOfInlineCompletion = exports.TriggerInlineSuggestionAction = exports.ShowPreviousInlineSuggestionAction = exports.ShowNextInlineSuggestionAction = void 0;
    class ShowNextInlineSuggestionAction extends editorExtensions_1.EditorAction {
        static { this.ID = commandIds_1.showNextInlineSuggestionActionId; }
        constructor() {
            super({
                id: ShowNextInlineSuggestionAction.ID,
                label: nls.localize('action.inlineSuggest.showNext', "Show Next Inline Suggestion"),
                alias: 'Show Next Inline Suggestion',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionVisible),
                kbOpts: {
                    weight: 100,
                    primary: 512 /* KeyMod.Alt */ | 94 /* KeyCode.BracketRight */,
                },
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.InlineCompletionsController.get(editor);
            controller?.model.get()?.next();
        }
    }
    exports.ShowNextInlineSuggestionAction = ShowNextInlineSuggestionAction;
    class ShowPreviousInlineSuggestionAction extends editorExtensions_1.EditorAction {
        static { this.ID = commandIds_1.showPreviousInlineSuggestionActionId; }
        constructor() {
            super({
                id: ShowPreviousInlineSuggestionAction.ID,
                label: nls.localize('action.inlineSuggest.showPrevious', "Show Previous Inline Suggestion"),
                alias: 'Show Previous Inline Suggestion',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionVisible),
                kbOpts: {
                    weight: 100,
                    primary: 512 /* KeyMod.Alt */ | 92 /* KeyCode.BracketLeft */,
                },
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.InlineCompletionsController.get(editor);
            controller?.model.get()?.previous();
        }
    }
    exports.ShowPreviousInlineSuggestionAction = ShowPreviousInlineSuggestionAction;
    class TriggerInlineSuggestionAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.inlineSuggest.trigger',
                label: nls.localize('action.inlineSuggest.trigger', "Trigger Inline Suggestion"),
                alias: 'Trigger Inline Suggestion',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.InlineCompletionsController.get(editor);
            controller?.model.get()?.triggerExplicitly();
        }
    }
    exports.TriggerInlineSuggestionAction = TriggerInlineSuggestionAction;
    class AcceptNextWordOfInlineCompletion extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.inlineSuggest.acceptNextWord',
                label: nls.localize('action.inlineSuggest.acceptNextWord', "Accept Next Word Of Inline Suggestion"),
                alias: 'Accept Next Word Of Inline Suggestion',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionVisible),
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */,
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionVisible),
                },
                menuOpts: [{
                        menuId: actions_1.MenuId.InlineSuggestionToolbar,
                        title: nls.localize('acceptWord', 'Accept Word'),
                        group: 'primary',
                        order: 2,
                    }],
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.InlineCompletionsController.get(editor);
            await controller?.model.get()?.acceptNextWord(controller.editor);
        }
    }
    exports.AcceptNextWordOfInlineCompletion = AcceptNextWordOfInlineCompletion;
    class AcceptNextLineOfInlineCompletion extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.inlineSuggest.acceptNextLine',
                label: nls.localize('action.inlineSuggest.acceptNextLine', "Accept Next Line Of Inline Suggestion"),
                alias: 'Accept Next Line Of Inline Suggestion',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionVisible),
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                },
                menuOpts: [{
                        menuId: actions_1.MenuId.InlineSuggestionToolbar,
                        title: nls.localize('acceptLine', 'Accept Line'),
                        group: 'secondary',
                        order: 2,
                    }],
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.InlineCompletionsController.get(editor);
            await controller?.model.get()?.acceptNextLine(controller.editor);
        }
    }
    exports.AcceptNextLineOfInlineCompletion = AcceptNextLineOfInlineCompletion;
    class AcceptInlineCompletion extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: commandIds_1.inlineSuggestCommitId,
                label: nls.localize('action.inlineSuggest.accept', "Accept Inline Suggestion"),
                alias: 'Accept Inline Suggestion',
                precondition: inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionVisible,
                menuOpts: [{
                        menuId: actions_1.MenuId.InlineSuggestionToolbar,
                        title: nls.localize('accept', "Accept"),
                        group: 'primary',
                        order: 1,
                    }],
                kbOpts: {
                    primary: 2 /* KeyCode.Tab */,
                    weight: 200,
                    kbExpr: contextkey_1.ContextKeyExpr.and(inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionVisible, editorContextKeys_1.EditorContextKeys.tabMovesFocus.toNegated(), inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize, suggest_1.Context.Visible.toNegated(), editorContextKeys_1.EditorContextKeys.hoverFocused.toNegated()),
                }
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.InlineCompletionsController.get(editor);
            if (controller) {
                controller.model.get()?.accept(controller.editor);
                controller.editor.focus();
            }
        }
    }
    exports.AcceptInlineCompletion = AcceptInlineCompletion;
    class HideInlineCompletion extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.inlineSuggest.hide'; }
        constructor() {
            super({
                id: HideInlineCompletion.ID,
                label: nls.localize('action.inlineSuggest.hide', "Hide Inline Suggestion"),
                alias: 'Hide Inline Suggestion',
                precondition: inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionVisible,
                kbOpts: {
                    weight: 100,
                    primary: 9 /* KeyCode.Escape */,
                }
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.InlineCompletionsController.get(editor);
            (0, observable_1.transaction)(tx => {
                controller?.model.get()?.stop(tx);
            });
        }
    }
    exports.HideInlineCompletion = HideInlineCompletion;
    class ToggleAlwaysShowInlineSuggestionToolbar extends actions_1.Action2 {
        static { this.ID = 'editor.action.inlineSuggest.toggleAlwaysShowToolbar'; }
        constructor() {
            super({
                id: ToggleAlwaysShowInlineSuggestionToolbar.ID,
                title: nls.localize('action.inlineSuggest.alwaysShowToolbar', "Always Show Toolbar"),
                f1: false,
                precondition: undefined,
                menu: [{
                        id: actions_1.MenuId.InlineSuggestionToolbar,
                        group: 'secondary',
                        order: 10,
                    }],
                toggled: contextkey_1.ContextKeyExpr.equals('config.editor.inlineSuggest.showToolbar', 'always')
            });
        }
        async run(accessor, editor) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            const currentValue = configService.getValue('editor.inlineSuggest.showToolbar');
            const newValue = currentValue === 'always' ? 'onHover' : 'always';
            configService.updateValue('editor.inlineSuggest.showToolbar', newValue);
        }
    }
    exports.ToggleAlwaysShowInlineSuggestionToolbar = ToggleAlwaysShowInlineSuggestionToolbar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy9icm93c2VyL2NvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsTUFBYSw4QkFBK0IsU0FBUSwrQkFBWTtpQkFDakQsT0FBRSxHQUFHLDZDQUFnQyxDQUFDO1FBQ3BEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw4QkFBOEIsQ0FBQyxFQUFFO2dCQUNyQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSw2QkFBNkIsQ0FBQztnQkFDbkYsS0FBSyxFQUFFLDZCQUE2QjtnQkFDcEMsWUFBWSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLHFDQUFpQixDQUFDLFFBQVEsRUFBRSx5REFBMkIsQ0FBQyx1QkFBdUIsQ0FBQztnQkFDakgsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSxHQUFHO29CQUNYLE9BQU8sRUFBRSxvREFBaUM7aUJBQzFDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBc0MsRUFBRSxNQUFtQjtZQUMzRSxNQUFNLFVBQVUsR0FBRyx5REFBMkIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0QsVUFBVSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUNqQyxDQUFDOztJQWxCRix3RUFtQkM7SUFFRCxNQUFhLGtDQUFtQyxTQUFRLCtCQUFZO2lCQUNyRCxPQUFFLEdBQUcsaURBQW9DLENBQUM7UUFDeEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGtDQUFrQyxDQUFDLEVBQUU7Z0JBQ3pDLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG1DQUFt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