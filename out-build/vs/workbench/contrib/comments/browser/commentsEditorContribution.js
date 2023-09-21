/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/nls!vs/workbench/contrib/comments/browser/commentsEditorContribution", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/simpleCommentEditor", "vs/workbench/services/editor/common/editorService", "vs/platform/actions/common/actions", "vs/editor/common/editorContextKeys", "vs/workbench/contrib/comments/browser/commentsController", "vs/editor/common/core/range", "vs/platform/notification/common/notification", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/css!./media/review"], function (require, exports, keyCodes_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, nls, commands_1, keybindingsRegistry_1, commentService_1, simpleCommentEditor_1, editorService_1, actions_1, editorContextKeys_1, commentsController_1, range_1, notification_1, commentContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rTb = exports.$qTb = exports.$pTb = exports.$oTb = exports.$nTb = void 0;
    class $nTb extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.nextCommentThreadAction',
                label: nls.localize(0, null),
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
            const controller = commentsController_1.$Lmb.get(editor);
            controller?.nextCommentThread();
        }
    }
    exports.$nTb = $nTb;
    class $oTb extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.previousCommentThreadAction',
                label: nls.localize(1, null),
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
            const controller = commentsController_1.$Lmb.get(editor);
            controller?.previousCommentThread();
        }
    }
    exports.$oTb = $oTb;
    (0, editorExtensions_1.$AV)(commentsController_1.ID, commentsController_1.$Lmb, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.$xV)($nTb);
    (0, editorExtensions_1.$xV)($oTb);
    class $pTb extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.goToNextCommentingRange',
                label: nls.localize(2, null),
                alias: 'Go to Next Commenting Range',
                precondition: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = commentsController_1.$Lmb.get(editor);
            controller?.nextCommentingRange();
        }
    }
    exports.$pTb = $pTb;
    class $qTb extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.goToPreviousCommentingRange',
                label: nls.localize(3, null),
                alias: 'Go to Next Commenting Range',
                precondition: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = commentsController_1.$Lmb.get(editor);
            controller?.previousCommentingRange();
        }
    }
    exports.$qTb = $qTb;
    (0, editorExtensions_1.$xV)($pTb);
    (0, editorExtensions_1.$xV)($qTb);
    const TOGGLE_COMMENTING_COMMAND = 'workbench.action.toggleCommenting';
    commands_1.$Gr.registerCommand({
        id: TOGGLE_COMMENTING_COMMAND,
        handler: (accessor) => {
            const commentService = accessor.get(commentService_1.$Ilb);
            const enable = commentService.isCommentingEnabled;
            commentService.enableCommenting(!enable);
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: TOGGLE_COMMENTING_COMMAND,
            title: nls.localize(4, null),
            category: 'Comments',
        },
        when: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting
    });
    const ADD_COMMENT_COMMAND = 'workbench.action.addComment';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: ADD_COMMENT_COMMAND,
        handler: async (accessor, args) => {
            const activeEditor = $rTb(accessor);
            if (!activeEditor) {
                return Promise.resolve();
            }
            const controller = commentsController_1.$Lmb.get(activeEditor);
            if (!controller) {
                return Promise.resolve();
            }
            const position = args?.range ? new range_1.$ks(args.range.startLineNumber, args.range.startLineNumber, args.range.endLineNumber, args.range.endColumn)
                : (args?.fileComment ? undefined : activeEditor.getSelection());
            const notificationService = accessor.get(notification_1.$Yu);
            try {
                await controller.addOrToggleCommentAtLine(position, undefined);
            }
            catch (e) {
                notificationService.error(nls.localize(5, null)); // TODO: Once we have commands to go to next commenting range they should be included as buttons in the error.
            }
        },
        weight: 100 /* KeybindingWeight.EditorContrib */,
        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */),
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: ADD_COMMENT_COMMAND,
            title: nls.localize(6, null),
            category: 'Comments'
        },
        when: commentContextKeys_1.CommentContextKeys.activeCursorHasCommentingRange
    });
    const COLLAPSE_ALL_COMMENT_COMMAND = 'workbench.action.collapseAllComments';
    commands_1.$Gr.registerCommand({
        id: COLLAPSE_ALL_COMMENT_COMMAND,
        handler: (accessor) => {
            return getActiveController(accessor)?.collapseAll();
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: COLLAPSE_ALL_COMMENT_COMMAND,
            title: nls.localize(7, null),
            category: 'Comments'
        },
        when: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting
    });
    const EXPAND_ALL_COMMENT_COMMAND = 'workbench.action.expandAllComments';
    commands_1.$Gr.registerCommand({
        id: EXPAND_ALL_COMMENT_COMMAND,
        handler: (accessor) => {
            return getActiveController(accessor)?.expandAll();
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: EXPAND_ALL_COMMENT_COMMAND,
            title: nls.localize(8, null),
            category: 'Comments'
        },
        when: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting
    });
    const EXPAND_UNRESOLVED_COMMENT_COMMAND = 'workbench.action.expandUnresolvedComments';
    commands_1.$Gr.registerCommand({
        id: EXPAND_UNRESOLVED_COMMENT_COMMAND,
        handler: (accessor) => {
            return getActiveController(accessor)?.expandUnresolved();
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: EXPAND_UNRESOLVED_COMMENT_COMMAND,
            title: nls.localize(9, null),
            category: 'Comments'
        },
        when: commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.action.submitComment',
        weight: 100 /* KeybindingWeight.EditorContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        when: simpleCommentEditor_1.$rmb,
        handler: (accessor, args) => {
            const activeCodeEditor = accessor.get(codeEditorService_1.$nV).getFocusedCodeEditor();
            if (activeCodeEditor instanceof simpleCommentEditor_1.$smb) {
                activeCodeEditor.getParentThread().submitComment();
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.action.hideComment',
        weight: 100 /* KeybindingWeight.EditorContrib */,
        primary: 9 /* KeyCode.Escape */,
        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        when: simpleCommentEditor_1.$rmb,
        handler: (accessor, args) => {
            const activeCodeEditor = accessor.get(codeEditorService_1.$nV).getFocusedCodeEditor();
            if (activeCodeEditor instanceof simpleCommentEditor_1.$smb) {
                activeCodeEditor.getParentThread().collapse();
            }
        }
    });
    function $rTb(accessor) {
        let activeTextEditorControl = accessor.get(editorService_1.$9C).activeTextEditorControl;
        if ((0, editorBrowser_1.$jV)(activeTextEditorControl)) {
            if (activeTextEditorControl.getOriginalEditor().hasTextFocus()) {
                activeTextEditorControl = activeTextEditorControl.getOriginalEditor();
            }
            else {
                activeTextEditorControl = activeTextEditorControl.getModifiedEditor();
            }
        }
        if (!(0, editorBrowser_1.$iV)(activeTextEditorControl) || !activeTextEditorControl.hasModel()) {
            return null;
        }
        return activeTextEditorControl;
    }
    exports.$rTb = $rTb;
    function getActiveController(accessor) {
        const activeEditor = $rTb(accessor);
        if (!activeEditor) {
            return undefined;
        }
        const controller = commentsController_1.$Lmb.get(activeEditor);
        if (!controller) {
            return undefined;
        }
        return controller;
    }
});
//# sourceMappingURL=commentsEditorContribution.js.map