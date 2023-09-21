/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/simpleCommentEditor", "vs/workbench/services/editor/common/editorService", "vs/platform/actions/common/actions", "vs/editor/common/editorContextKeys", "vs/workbench/contrib/comments/browser/commentsController", "vs/editor/common/core/range", "vs/platform/notification/common/notification", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/css!./media/review"], function (require, exports, keyCodes_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, nls, commands_1, keybindingsRegistry_1, commentService_1, simpleCommentEditor_1, editorService_1, actions_1, editorContextKeys_1, commentsController_1, range_1, notification_1, commentContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getActiveEditor = exports.PreviousCommentingRangeAction = exports.NextCommentingRangeAction = exports.PreviousCommentThreadAction = exports.NextCommentThreadAction = void 0;
    class NextCommentThreadAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.nextCommentThreadAction',
                label: nls.localize('nextCommentThreadAction', "Go to Next Comment Thread"),
                alias: 'Go to Next Comment Thread',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 512 /* KeyMod.Alt */ | 67 /* KeyCode.F9 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = commentsController_1.CommentController.get(editor);
            controller?.nextCommentThread();
        }
    }
    exports.NextCommentThreadAction = NextCommentThreadAction;
    class PreviousCommentThreadAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.previousCommentThreadAction',
                label: nls.localize('previousCommentThreadAction', "Go to Previous Comment Thread"),
                alias: 'Go to Previous Comment Thread',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 67 /* KeyCode.F9 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = commentsController_1.CommentController.get(editor);
            controller?.previousCommentThread();
        }
    }
    exports.PreviousCommentThreadAction = PreviousCommentThreadAction;
    (0, editorExtensions_1.registerEditorContribution)(commentsController_1.ID, commentsController_1.CommentController, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.registerEditorAction)(NextCommentThreadAction);
    (0, editorExtensions_1.registerEditorAction)(PreviousCommentThreadAction);
    class NextCommentingRangeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.goToNextCommentingRange',
                label: nls.localize('goToNextCommentingRange', "Go to Next Commenting Range"),
                alias: 'Go to Next Commenting Range',
                precondition: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = commentsController_1.CommentController.get(editor);
            controller?.nextCommentingRange();
        }
    }
    exports.NextCommentingRangeAction = NextCommentingRangeAction;
    class PreviousCommentingRangeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.goToPreviousCommentingRange',
                label: nls.localize('goToPreviousCommentingRange', "Go to Previous Commenting Range"),
                alias: 'Go to Next Commenting Range',
                precondition: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = commentsController_1.CommentController.get(editor);
            controller?.previousCommentingRange();
        }
    }
    exports.PreviousCommentingRangeAction = PreviousCommentingRangeAction;
    (0, editorExtensions_1.registerEditorAction)(NextCommentingRangeAction);
    (0, editorExtensions_1.registerEditorAction)(PreviousCommentingRangeAction);
    const TOGGLE_COMMENTING_COMMAND = 'workbench.action.toggleCommenting';
    commands_1.CommandsRegistry.registerCommand({
        id: TOGGLE_COMMENTING_COMMAND,
        handler: (accessor) => {
            const commentService = accessor.get(commentService_1.ICommentService);
            const enable = commentService.isCommentingEnabled;
            commentService.enableCommenting(!enable);
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: TOGGLE_COMMENTING_COMMAND,
            title: nls.localize('comments.toggleCommenting', "Toggle Editor Commenting"),
            category: 'Comments',
        },
        when: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting
    });
    const ADD_COMMENT_COMMAND = 'workbench.action.addComment';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: ADD_COMMENT_COMMAND,
        handler: async (accessor, args) => {
            const activeEditor = getActiveEditor(accessor);
            if (!activeEditor) {
                return Promise.resolve();
            }
            const controller = commentsController_1.CommentController.get(activeEditor);
            if (!controller) {
                return Promise.resolve();
            }
            const position = args?.range ? new range_1.Range(args.range.startLineNumber, args.range.startLineNumber, args.range.endLineNumber, args.range.endColumn)
                : (args?.fileComment ? undefined : activeEditor.getSelection());
            const notificationService = accessor.get(notification_1.INotificationService);
            try {
                await controller.addOrToggleCommentAtLine(position, undefined);
            }
            catch (e) {
                notificationService.error(nls.localize('comments.addCommand.error', "The cursor must be within a commenting range to add a comment")); // TODO: Once we have commands to go to next commenting range they should be included as buttons in the error.
            }
        },
        weight: 100 /* KeybindingWeight.EditorContrib */,
        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */),
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: ADD_COMMENT_COMMAND,
            title: nls.localize('comments.addCommand', "Add Comment on Current Selection"),
            category: 'Comments'
        },
        when: commentContextKeys_1.CommentContextKeys.activeCursorHasCommentingRange
    });
    const COLLAPSE_ALL_COMMENT_COMMAND = 'workbench.action.collapseAllComments';
    commands_1.CommandsRegistry.registerCommand({
        id: COLLAPSE_ALL_COMMENT_COMMAND,
        handler: (accessor) => {
            return getActiveController(accessor)?.collapseAll();
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: COLLAPSE_ALL_COMMENT_COMMAND,
            title: nls.localize('comments.collapseAll', "Collapse All Comments"),
            category: 'Comments'
        },
        when: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting
    });
    const EXPAND_ALL_COMMENT_COMMAND = 'workbench.action.expandAllComments';
    commands_1.CommandsRegistry.registerCommand({
        id: EXPAND_ALL_COMMENT_COMMAND,
        handler: (accessor) => {
            return getActiveController(accessor)?.expandAll();
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: EXPAND_ALL_COMMENT_COMMAND,
            title: nls.localize('comments.expandAll', "Expand All Comments"),
            category: 'Comments'
        },
        when: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting
    });
    const EXPAND_UNRESOLVED_COMMENT_COMMAND = 'workbench.action.expandUnresolvedComments';
    commands_1.CommandsRegistry.registerCommand({
        id: EXPAND_UNRESOLVED_COMMENT_COMMAND,
        handler: (accessor) => {
            return getActiveController(accessor)?.expandUnresolved();
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: EXPAND_UNRESOLVED_COMMENT_COMMAND,
            title: nls.localize('comments.expandUnresolved', "Expand Unresolved Comments"),
            category: 'Comments'
        },
        when: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.submitComment',
        weight: 100 /* KeybindingWeight.EditorContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        when: simpleCommentEditor_1.ctxCommentEditorFocused,
        handler: (accessor, args) => {
            const activeCodeEditor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
            if (activeCodeEditor instanceof simpleCommentEditor_1.SimpleCommentEditor) {
                activeCodeEditor.getParentThread().submitComment();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.hideComment',
        weight: 100 /* KeybindingWeight.EditorContrib */,
        primary: 9 /* KeyCode.Escape */,
        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        when: simpleCommentEditor_1.ctxCommentEditorFocused,
        handler: (accessor, args) => {
            const activeCodeEditor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
            if (activeCodeEditor instanceof simpleCommentEditor_1.SimpleCommentEditor) {
                activeCodeEditor.getParentThread().collapse();
            }
        }
    });
    function getActiveEditor(accessor) {
        let activeTextEditorControl = accessor.get(editorService_1.IEditorService).activeTextEditorControl;
        if ((0, editorBrowser_1.isDiffEditor)(activeTextEditorControl)) {
            if (activeTextEditorControl.getOriginalEditor().hasTextFocus()) {
                activeTextEditorControl = activeTextEditorControl.getOriginalEditor();
            }
            else {
                activeTextEditorControl = activeTextEditorControl.getModifiedEditor();
            }
        }
        if (!(0, editorBrowser_1.isCodeEditor)(activeTextEditorControl) || !activeTextEditorControl.hasModel()) {
            return null;
        }
        return activeTextEditorControl;
    }
    exports.getActiveEditor = getActiveEditor;
    function getActiveController(accessor) {
        const activeEditor = getActiveEditor(accessor);
        if (!activeEditor) {
            return undefined;
        }
        const controller = commentsController_1.CommentController.get(activeEditor);
        if (!controller) {
            return undefined;
        }
        return controller;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNFZGl0b3JDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnRzRWRpdG9yQ29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsTUFBYSx1QkFBd0IsU0FBUSwrQkFBWTtRQUN4RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsdUNBQXVDO2dCQUMzQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSwyQkFBMkIsQ0FBQztnQkFDM0UsS0FBSyxFQUFFLDJCQUEyQjtnQkFDbEMsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLE1BQU0sRUFBRTtvQkFDUCxNQUFNLEVBQUUscUNBQWlCLENBQUMsS0FBSztvQkFDL0IsT0FBTyxFQUFFLDBDQUF1QjtvQkFDaEMsTUFBTSwwQ0FBZ0M7aUJBQ3RDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLEdBQUcsQ0FBQyxRQUEwQixFQUFFLE1BQW1CO1lBQ3pELE1BQU0sVUFBVSxHQUFHLHNDQUFpQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRCxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQztRQUNqQyxDQUFDO0tBQ0Q7SUFuQkQsMERBbUJDO0lBRUQsTUFBYSwyQkFBNEIsU0FBUSwrQkFBWTtRQUM1RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsMkNBQTJDO2dCQUMvQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSwrQkFBK0IsQ0FBQztnQkFDbkYsS0FBSyxFQUFFLCtCQUErQjtnQkFDdEMsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLE1BQU0sRUFBRTtvQkFDUCxNQUFNLEVBQUUscUNBQWlCLENB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