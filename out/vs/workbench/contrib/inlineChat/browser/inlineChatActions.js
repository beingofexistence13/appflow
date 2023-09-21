/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/keyCodes", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/editorContextKeys", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/base/common/date", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp", "vs/platform/accessibility/common/accessibility", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/editor/common/core/position", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/accessibility/browser/accessibleViewActions"], function (require, exports, codicons_1, keyCodes_1, editorExtensions_1, embeddedCodeEditorWidget_1, editorContextKeys_1, inlineChatController_1, inlineChat_1, nls_1, actions_1, clipboardService_1, contextkey_1, quickInput_1, editorService_1, codeEditorService_1, range_1, selection_1, date_1, inlineChatSession_1, chatAccessibilityHelp_1, accessibility_1, lifecycle_1, commands_1, position_1, configuration_1, accessibleViewActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineAccessibilityHelpContribution = exports.ContractMessageAction = exports.ExpandMessageAction = exports.ViewInChatAction = exports.CopyRecordings = exports.CancelSessionAction = exports.ApplyPreviewEdits = exports.ToggleInlineDiff = exports.FeebackUnhelpfulCommand = exports.FeebackHelpfulCommand = exports.DiscardUndoToNewFileAction = exports.DiscardToClipboardAction = exports.DiscardAction = exports.NextFromHistory = exports.PreviousFromHistory = exports.FocusInlineChat = exports.ArrowOutDownAction = exports.ArrowOutUpAction = exports.StopRequestAction = exports.ReRunRequestAction = exports.MakeRequestAction = exports.UnstashSessionAction = exports.StartSessionAction = void 0;
    commands_1.CommandsRegistry.registerCommandAlias('interactiveEditor.start', 'inlineChat.start');
    class StartSessionAction extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'inlineChat.start',
                title: { value: (0, nls_1.localize)('run', 'Start Code Chat'), original: 'Start Code Chat' },
                category: AbstractInlineChatAction.category,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_HAS_PROVIDER, editorContextKeys_1.EditorContextKeys.writable),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */,
                    secondary: [(0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 39 /* KeyCode.KeyI */)],
                }
            });
        }
        _isInteractivEditorOptions(options) {
            const { initialSelection, initialRange, message, autoSend, position } = options;
            if (typeof message !== 'undefined' && typeof message !== 'string'
                || typeof autoSend !== 'undefined' && typeof autoSend !== 'boolean'
                || typeof initialRange !== 'undefined' && !range_1.Range.isIRange(initialRange)
                || typeof initialSelection !== 'undefined' && !selection_1.Selection.isISelection(initialSelection)
                || typeof position !== 'undefined' && !position_1.Position.isIPosition(position)) {
                return false;
            }
            return true;
        }
        runEditorCommand(_accessor, editor, ..._args) {
            let options;
            const arg = _args[0];
            if (arg && this._isInteractivEditorOptions(arg)) {
                options = arg;
            }
            inlineChatController_1.InlineChatController.get(editor)?.run(options);
        }
    }
    exports.StartSessionAction = StartSessionAction;
    class UnstashSessionAction extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'inlineChat.unstash',
                title: { value: (0, nls_1.localize)('unstash', 'Resume Last Dismissed Code Chat'), original: 'Resume Last Dismissed Code Chat' },
                category: AbstractInlineChatAction.category,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_HAS_STASHED_SESSION, editorContextKeys_1.EditorContextKeys.writable),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */,
                }
            });
        }
        runEditorCommand(_accessor, editor, ..._args) {
            const ctrl = inlineChatController_1.InlineChatController.get(editor);
            if (ctrl) {
                const session = ctrl.unstashLastSession();
                if (session) {
                    ctrl.run({
                        existingSession: session,
                        isUnstashed: true
                    });
                }
            }
        }
    }
    exports.UnstashSessionAction = UnstashSessionAction;
    class AbstractInlineChatAction extends editorExtensions_1.EditorAction2 {
        static { this.category = { value: (0, nls_1.localize)('cat', 'Inline Chat'), original: 'Inline Chat' }; }
        constructor(desc) {
            super({
                ...desc,
                category: AbstractInlineChatAction.category,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_HAS_PROVIDER, desc.precondition)
            });
        }
        runEditorCommand(accessor, editor, ..._args) {
            if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
                editor = editor.getParentEditor();
            }
            const ctrl = inlineChatController_1.InlineChatController.get(editor);
            if (!ctrl) {
                for (const diffEditor of accessor.get(codeEditorService_1.ICodeEditorService).listDiffEditors()) {
                    if (diffEditor.getOriginalEditor() === editor || diffEditor.getModifiedEditor() === editor) {
                        if (diffEditor instanceof embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget) {
                            this.runEditorCommand(accessor, diffEditor.getParentEditor(), ..._args);
                        }
                    }
                }
                return;
            }
            this.runInlineChatCommand(accessor, ctrl, editor, ..._args);
        }
    }
    class MakeRequestAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.accept',
                title: (0, nls_1.localize)('accept', 'Make Request'),
                icon: codicons_1.Codicon.send,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_EMPTY.negate()),
                keybinding: {
                    when: inlineChat_1.CTX_INLINE_CHAT_FOCUSED,
                    weight: 0 /* KeybindingWeight.EditorCore */ + 7,
                    primary: 3 /* KeyCode.Enter */
                },
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET,
                    group: 'main',
                    order: 1,
                    when: inlineChat_1.CTX_INLINE_CHAT_HAS_ACTIVE_REQUEST.isEqualTo(false)
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.acceptInput();
        }
    }
    exports.MakeRequestAction = MakeRequestAction;
    class ReRunRequestAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: inlineChat_1.ACTION_REGENERATE_RESPONSE,
                title: (0, nls_1.localize)('rerun', 'Regenerate Response'),
                shortTitle: (0, nls_1.localize)('rerunShort', 'Regenerate'),
                icon: codicons_1.Codicon.refresh,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_EMPTY.negate(), inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE),
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS,
                    group: '2_feedback',
                    order: 3,
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl) {
            ctrl.regenerate();
        }
    }
    exports.ReRunRequestAction = ReRunRequestAction;
    class StopRequestAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.stop',
                title: (0, nls_1.localize)('stop', 'Stop Request'),
                icon: codicons_1.Codicon.debugStop,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_EMPTY.negate(), inlineChat_1.CTX_INLINE_CHAT_HAS_ACTIVE_REQUEST),
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET,
                    group: 'main',
                    order: 1,
                    when: inlineChat_1.CTX_INLINE_CHAT_HAS_ACTIVE_REQUEST
                },
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.cancelCurrentRequest();
        }
    }
    exports.StopRequestAction = StopRequestAction;
    class ArrowOutUpAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.arrowOutUp',
                title: (0, nls_1.localize)('arrowUp', 'Cursor Up'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_FIRST, editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate(), accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                keybinding: {
                    weight: 0 /* KeybindingWeight.EditorCore */,
                    primary: 16 /* KeyCode.UpArrow */
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.arrowOut(true);
        }
    }
    exports.ArrowOutUpAction = ArrowOutUpAction;
    class ArrowOutDownAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.arrowOutDown',
                title: (0, nls_1.localize)('arrowDown', 'Cursor Down'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_LAST, editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate(), accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                keybinding: {
                    weight: 0 /* KeybindingWeight.EditorCore */,
                    primary: 18 /* KeyCode.DownArrow */
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.arrowOut(false);
        }
    }
    exports.ArrowOutDownAction = ArrowOutDownAction;
    class FocusInlineChat extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'inlineChat.focus',
                title: { value: (0, nls_1.localize)('focus', 'Focus Input'), original: 'Focus Input' },
                f1: true,
                category: AbstractInlineChatAction.category,
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_FOCUSED.negate(), accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                keybinding: [{
                        weight: 0 /* KeybindingWeight.EditorCore */ + 10,
                        when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.isEqualTo('above'), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 18 /* KeyCode.DownArrow */,
                    }, {
                        weight: 0 /* KeybindingWeight.EditorCore */ + 10,
                        when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.isEqualTo('below'), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 16 /* KeyCode.UpArrow */,
                    }]
            });
        }
        runEditorCommand(_accessor, editor, ..._args) {
            inlineChatController_1.InlineChatController.get(editor)?.focus();
        }
    }
    exports.FocusInlineChat = FocusInlineChat;
    class PreviousFromHistory extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.previousFromHistory',
                title: (0, nls_1.localize)('previousFromHistory', 'Previous From History'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_START),
                keybinding: {
                    weight: 0 /* KeybindingWeight.EditorCore */ + 10,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.populateHistory(true);
        }
    }
    exports.PreviousFromHistory = PreviousFromHistory;
    class NextFromHistory extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.nextFromHistory',
                title: (0, nls_1.localize)('nextFromHistory', 'Next From History'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_END),
                keybinding: {
                    weight: 0 /* KeybindingWeight.EditorCore */ + 10,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.populateHistory(false);
        }
    }
    exports.NextFromHistory = NextFromHistory;
    actions_1.MenuRegistry.appendMenuItem(inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS, {
        submenu: inlineChat_1.MENU_INLINE_CHAT_WIDGET_DISCARD,
        title: (0, nls_1.localize)('discardMenu', "Discard..."),
        icon: codicons_1.Codicon.discard,
        group: '0_main',
        order: 2,
        when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_EDIT_MODE.notEqualsTo("preview" /* EditMode.Preview */), inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("onlyMessages" /* InlineChateResponseTypes.OnlyMessages */)),
        rememberDefaultAction: true
    });
    class DiscardAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.discard',
                title: (0, nls_1.localize)('discard', 'Discard'),
                icon: codicons_1.Codicon.discard,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */,
                    when: inlineChat_1.CTX_INLINE_CHAT_USER_DID_EDIT.negate()
                },
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_DISCARD,
                    group: '0_main',
                    order: 0
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.cancelSession();
        }
    }
    exports.DiscardAction = DiscardAction;
    class DiscardToClipboardAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.discardToClipboard',
                title: (0, nls_1.localize)('undo.clipboard', 'Discard to Clipboard'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_DID_EDIT),
                // keybinding: {
                // 	weight: KeybindingWeight.EditorContrib + 10,
                // 	primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyZ,
                // 	mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyZ },
                // },
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_DISCARD,
                    group: '0_main',
                    order: 1
                }
            });
        }
        async runInlineChatCommand(accessor, ctrl) {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const changedText = ctrl.cancelSession();
            if (changedText !== undefined) {
                clipboardService.writeText(changedText);
            }
        }
    }
    exports.DiscardToClipboardAction = DiscardToClipboardAction;
    class DiscardUndoToNewFileAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.discardToFile',
                title: (0, nls_1.localize)('undo.newfile', 'Discard to New File'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_DID_EDIT),
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_DISCARD,
                    group: '0_main',
                    order: 2
                }
            });
        }
        async runInlineChatCommand(accessor, ctrl, editor, ..._args) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const changedText = ctrl.cancelSession();
            if (changedText !== undefined) {
                const input = { forceUntitled: true, resource: undefined, contents: changedText, languageId: editor.getModel()?.getLanguageId() };
                editorService.openEditor(input, editorService_1.SIDE_GROUP);
            }
        }
    }
    exports.DiscardUndoToNewFileAction = DiscardUndoToNewFileAction;
    class FeebackHelpfulCommand extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.feedbackHelpful',
                title: (0, nls_1.localize)('feedback.helpful', 'Helpful'),
                icon: codicons_1.Codicon.thumbsup,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                toggled: inlineChat_1.CTX_INLINE_CHAT_LAST_FEEDBACK.isEqualTo('helpful'),
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_FEEDBACK,
                    when: inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE.notEqualsTo(undefined),
                    group: '2_feedback',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl) {
            ctrl.feedbackLast(true);
        }
    }
    exports.FeebackHelpfulCommand = FeebackHelpfulCommand;
    class FeebackUnhelpfulCommand extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.feedbackunhelpful',
                title: (0, nls_1.localize)('feedback.unhelpful', 'Unhelpful'),
                icon: codicons_1.Codicon.thumbsdown,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                toggled: inlineChat_1.CTX_INLINE_CHAT_LAST_FEEDBACK.isEqualTo('unhelpful'),
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_FEEDBACK,
                    when: inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE.notEqualsTo(undefined),
                    group: '2_feedback',
                    order: 2
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl) {
            ctrl.feedbackLast(false);
        }
    }
    exports.FeebackUnhelpfulCommand = FeebackUnhelpfulCommand;
    class ToggleInlineDiff extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.toggleDiff',
                title: {
                    original: 'Show Diff',
                    value: (0, nls_1.localize)('showDiff', 'Show Diff'),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miShowDiff', comment: ['&& denotes a mnemonic'] }, "&&Show Diff"),
                },
                toggled: {
                    condition: contextkey_1.ContextKeyExpr.equals('config.inlineChat.showDiff', true),
                    title: (0, nls_1.localize)('showDiff2', "Show Diff"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miShowDiff2', comment: ['&& denotes a mnemonic'] }, "&&Show Diff")
                },
                precondition: contextkey_1.ContextKeyExpr.notEquals('config.inlineChat.mode', 'preview'),
                menu: [
                    { id: actions_1.MenuId.CommandPalette },
                    { id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_TOGGLE }
                ]
            });
        }
        runInlineChatCommand(accessor, _ctrl) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('inlineChat.showDiff');
            configurationService.updateValue('inlineChat.showDiff', newValue);
        }
    }
    exports.ToggleInlineDiff = ToggleInlineDiff;
    class ApplyPreviewEdits extends AbstractInlineChatAction {
        constructor() {
            super({
                id: inlineChat_1.ACTION_ACCEPT_CHANGES,
                title: (0, nls_1.localize)('apply1', 'Accept Changes'),
                shortTitle: (0, nls_1.localize)('apply2', 'Accept'),
                icon: codicons_1.Codicon.check,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, contextkey_1.ContextKeyExpr.or(inlineChat_1.CTX_INLINE_CHAT_DOCUMENT_CHANGED.toNegated(), inlineChat_1.CTX_INLINE_CHAT_EDIT_MODE.notEqualsTo("preview" /* EditMode.Preview */))),
                keybinding: [{
                        weight: 100 /* KeybindingWeight.EditorContrib */ + 10,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    }, {
                        primary: 9 /* KeyCode.Escape */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: inlineChat_1.CTX_INLINE_CHAT_USER_DID_EDIT,
                    }],
                menu: {
                    when: inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("onlyMessages" /* InlineChateResponseTypes.OnlyMessages */),
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS,
                    group: '0_main',
                    order: 0
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl) {
            ctrl.acceptSession();
        }
    }
    exports.ApplyPreviewEdits = ApplyPreviewEdits;
    class CancelSessionAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.cancel',
                title: (0, nls_1.localize)('cancel', 'Cancel'),
                icon: codicons_1.Codicon.clearAll,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 1,
                    primary: 9 /* KeyCode.Escape */
                },
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS,
                    when: contextkey_1.ContextKeyExpr.or(inlineChat_1.CTX_INLINE_CHAT_EDIT_MODE.isEqualTo("preview" /* EditMode.Preview */), inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.isEqualTo("onlyMessages" /* InlineChateResponseTypes.OnlyMessages */)),
                    group: '0_main',
                    order: 3
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.cancelSession();
        }
    }
    exports.CancelSessionAction = CancelSessionAction;
    class CopyRecordings extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.copyRecordings',
                f1: true,
                title: {
                    value: (0, nls_1.localize)('copyRecordings', '(Developer) Write Exchange to Clipboard'),
                    original: '(Developer) Write Exchange to Clipboard'
                }
            });
        }
        async runInlineChatCommand(accessor) {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const quickPickService = accessor.get(quickInput_1.IQuickInputService);
            const ieSessionService = accessor.get(inlineChatSession_1.IInlineChatSessionService);
            const recordings = ieSessionService.recordings().filter(r => r.exchanges.length > 0);
            if (recordings.length === 0) {
                return;
            }
            const picks = recordings.map(rec => {
                return {
                    rec,
                    label: (0, nls_1.localize)('label', "'{0}' and {1} follow ups ({2})", rec.exchanges[0].prompt, rec.exchanges.length - 1, (0, date_1.fromNow)(rec.when, true)),
                    tooltip: rec.exchanges.map(ex => ex.prompt).join('\n'),
                };
            });
            const pick = await quickPickService.pick(picks, { canPickMany: false });
            if (pick) {
                clipboardService.writeText(JSON.stringify(pick.rec, undefined, 2));
            }
        }
    }
    exports.CopyRecordings = CopyRecordings;
    class ViewInChatAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: inlineChat_1.ACTION_VIEW_IN_CHAT,
                title: (0, nls_1.localize)('viewInChat', 'View in Chat'),
                icon: codicons_1.Codicon.commentDiscussion,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS,
                    when: inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE.isEqualTo("message" /* InlineChatResponseType.Message */),
                    group: '0_main',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.viewInChat();
        }
    }
    exports.ViewInChatAction = ViewInChatAction;
    class ExpandMessageAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.expandMessageAction',
                title: (0, nls_1.localize)('expandMessage', 'Show More'),
                icon: codicons_1.Codicon.chevronDown,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_MARKDOWN_MESSAGE,
                    when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE.isEqualTo('message'), inlineChat_1.CTX_INLINE_CHAT_MESSAGE_CROP_STATE.isEqualTo('cropped')),
                    group: '2_expandOrContract',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.updateExpansionState(true);
        }
    }
    exports.ExpandMessageAction = ExpandMessageAction;
    class ContractMessageAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.contractMessageAction',
                title: (0, nls_1.localize)('contractMessage', 'Show Less'),
                icon: codicons_1.Codicon.chevronUp,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_MARKDOWN_MESSAGE,
                    when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE.isEqualTo('message'), inlineChat_1.CTX_INLINE_CHAT_MESSAGE_CROP_STATE.isEqualTo('expanded')),
                    group: '2_expandOrContract',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.updateExpansionState(false);
        }
    }
    exports.ContractMessageAction = ContractMessageAction;
    class InlineAccessibilityHelpContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibilityHelpAction.addImplementation(106, 'inlineChat', async (accessor) => {
                const codeEditor = accessor.get(codeEditorService_1.ICodeEditorService).getActiveCodeEditor() || accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
                if (!codeEditor) {
                    return;
                }
                (0, chatAccessibilityHelp_1.runAccessibilityHelpAction)(accessor, codeEditor, 'inlineChat');
            }, contextkey_1.ContextKeyExpr.or(inlineChat_1.CTX_INLINE_CHAT_RESPONSE_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_FOCUSED)));
        }
    }
    exports.InlineAccessibilityHelpContribution = InlineAccessibilityHelpContribution;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbmxpbmVDaGF0L2Jyb3dzZXIvaW5saW5lQ2hhdEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0NoRywyQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyx5QkFBeUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBRXJGLE1BQWEsa0JBQW1CLFNBQVEsZ0NBQWE7UUFFcEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGtCQUFrQjtnQkFDdEIsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRTtnQkFDakYsUUFBUSxFQUFFLHdCQUF3QixDQUFDLFFBQVE7Z0JBQzNDLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyx5Q0FBNEIsRUFBRSxxQ0FBaUIsQ0FBQyxRQUFRLENBQUM7Z0JBQzFGLFVBQVUsRUFBRTtvQkFDWCxNQUFNLDZDQUFtQztvQkFDekMsT0FBTyxFQUFFLGlEQUE2QjtvQkFDdEMsU0FBUyxFQUFFLENBQUMsSUFBQSxtQkFBUSxFQUFDLGlEQUE2Qix3QkFBZSxDQUFDO2lCQUNsRTthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTywwQkFBMEIsQ0FBQyxPQUFZO1lBQzlDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUM7WUFDaEYsSUFDQyxPQUFPLE9BQU8sS0FBSyxXQUFXLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUTttQkFDMUQsT0FBTyxRQUFRLEtBQUssV0FBVyxJQUFJ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