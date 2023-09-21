/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/contrib/inlineCompletions/browser/commands", "vs/editor/contrib/inlineCompletions/browser/hoverParticipant", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/platform/actions/common/actions"], function (require, exports, editorExtensions_1, hoverTypes_1, commands_1, hoverParticipant_1, inlineCompletionsController_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.registerEditorContribution)(inlineCompletionsController_1.InlineCompletionsController.ID, inlineCompletionsController_1.InlineCompletionsController, 3 /* EditorContributionInstantiation.Eventually */);
    (0, editorExtensions_1.registerEditorAction)(commands_1.TriggerInlineSuggestionAction);
    (0, editorExtensions_1.registerEditorAction)(commands_1.ShowNextInlineSuggestionAction);
    (0, editorExtensions_1.registerEditorAction)(commands_1.ShowPreviousInlineSuggestionAction);
    (0, editorExtensions_1.registerEditorAction)(commands_1.AcceptNextWordOfInlineCompletion);
    (0, editorExtensions_1.registerEditorAction)(commands_1.AcceptNextLineOfInlineCompletion);
    (0, editorExtensions_1.registerEditorAction)(commands_1.AcceptInlineCompletion);
    (0, editorExtensions_1.registerEditorAction)(commands_1.HideInlineCompletion);
    (0, actions_1.registerAction2)(commands_1.ToggleAlwaysShowInlineSuggestionToolbar);
    hoverTypes_1.HoverParticipantRegistry.register(hoverParticipant_1.InlineCompletionsHoverParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbnMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5saW5lQ29tcGxldGlvbnMvYnJvd3Nlci9pbmxpbmVDb21wbGV0aW9ucy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsSUFBQSw2Q0FBMEIsRUFBQyx5REFBMkIsQ0FBQyxFQUFFLEVBQUUseURBQTJCLHFEQUE2QyxDQUFDO0lBRXBJLElBQUEsdUNBQW9CLEVBQUMsd0NBQTZCLENBQUMsQ0FBQztJQUNwRCxJQUFBLHVDQUFvQixFQUFDLHlDQUE4QixDQUFDLENBQUM7SUFDckQsSUFBQSx1Q0FBb0IsRUFBQyw2Q0FBa0MsQ0FBQyxDQUFDO0lBQ3pELElBQUEsdUNBQW9CLEVBQUMsMkNBQWdDLENBQUMsQ0FBQztJQUN2RCxJQUFBLHVDQUFvQixFQUFDLDJDQUFnQyxDQUFDLENBQUM7SUFDdkQsSUFBQSx1Q0FBb0IsRUFBQyxpQ0FBc0IsQ0FBQyxDQUFDO0lBQzdDLElBQUEsdUNBQW9CLEVBQUMsK0JBQW9CLENBQUMsQ0FBQztJQUMzQyxJQUFBLHlCQUFlLEVBQUMsa0RBQXVDLENBQUMsQ0FBQztJQUV6RCxxQ0FBd0IsQ0FBQyxRQUFRLENBQUMsb0RBQWlDLENBQUMsQ0FBQyJ9