/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/keyCodes", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/editorContextKeys", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/nls!vs/workbench/contrib/inlineChat/browser/inlineChatActions", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/base/common/date", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp", "vs/platform/accessibility/common/accessibility", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/editor/common/core/position", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/accessibility/browser/accessibleViewActions"], function (require, exports, codicons_1, keyCodes_1, editorExtensions_1, embeddedCodeEditorWidget_1, editorContextKeys_1, inlineChatController_1, inlineChat_1, nls_1, actions_1, clipboardService_1, contextkey_1, quickInput_1, editorService_1, codeEditorService_1, range_1, selection_1, date_1, inlineChatSession_1, chatAccessibilityHelp_1, accessibility_1, lifecycle_1, commands_1, position_1, configuration_1, accessibleViewActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FJb = exports.$EJb = exports.$DJb = exports.$CJb = exports.$BJb = exports.$AJb = exports.$zJb = exports.$yJb = exports.$xJb = exports.$wJb = exports.$vJb = exports.$uJb = exports.$tJb = exports.$sJb = exports.$rJb = exports.$qJb = exports.$pJb = exports.$oJb = exports.$nJb = exports.$mJb = exports.$lJb = exports.$kJb = exports.$jJb = void 0;
    commands_1.$Gr.registerCommandAlias('interactiveEditor.start', 'inlineChat.start');
    class $jJb extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'inlineChat.start',
                title: { value: (0, nls_1.localize)(0, null), original: 'Start Code Chat' },
                category: AbstractInlineChatAction.category,
                f1: true,
                precondition: contextkey_1.$Ii.and(inlineChat_1.$gz, editorContextKeys_1.EditorContextKeys.writable),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */,
                    secondary: [(0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 39 /* KeyCode.KeyI */)],
                }
            });
        }
        d(options) {
            const { initialSelection, initialRange, message, autoSend, position } = options;
            if (typeof message !== 'undefined' && typeof message !== 'string'
                || typeof autoSend !== 'undefined' && typeof autoSend !== 'boolean'
                || typeof initialRange !== 'undefined' && !range_1.$ks.isIRange(initialRange)
                || typeof initialSelection !== 'undefined' && !selection_1.$ms.isISelection(initialSelection)
                || typeof position !== 'undefined' && !position_1.$js.isIPosition(position)) {
                return false;
            }
            return true;
        }
        runEditorCommand(_accessor, editor, ..._args) {
            let options;
            const arg = _args[0];
            if (arg && this.d(arg)) {
                options = arg;
            }
            inlineChatController_1.$Qqb.get(editor)?.run(options);
        }
    }
    exports.$jJb = $jJb;
    class $kJb extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'inlineChat.unstash',
                title: { value: (0, nls_1.localize)(1, null), original: 'Resume Last Dismissed Code Chat' },
                category: AbstractInlineChatAction.category,
                precondition: contextkey_1.$Ii.and(inlineChat_1.$sz, editorContextKeys_1.EditorContextKeys.writable),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */,
                }
            });
        }
        runEditorCommand(_accessor, editor, ..._args) {
            const ctrl = inlineChatController_1.$Qqb.get(editor);
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
    exports.$kJb = $kJb;
    class AbstractInlineChatAction extends editorExtensions_1.$uV {
        static { this.category = { value: (0, nls_1.localize)(2, null), original: 'Inline Chat' }; }
        constructor(desc) {
            super({
                ...desc,
                category: AbstractInlineChatAction.category,
                precondition: contextkey_1.$Ii.and(inlineChat_1.$gz, desc.precondition)
            });
        }
        runEditorCommand(accessor, editor, ..._args) {
            if (editor instanceof embeddedCodeEditorWidget_1.$w3) {
                editor = editor.getParentEditor();
            }
            const ctrl = inlineChatController_1.$Qqb.get(editor);
            if (!ctrl) {
                for (const diffEditor of accessor.get(codeEditorService_1.$nV).listDiffEditors()) {
                    if (diffEditor.getOriginalEditor() === editor || diffEditor.getModifiedEditor() === editor) {
                        if (diffEditor instanceof embeddedCodeEditorWidget_1.$x3) {
                            this.runEditorCommand(accessor, diffEditor.getParentEditor(), ..._args);
                        }
                    }
                }
                return;
            }
            this.runInlineChatCommand(accessor, ctrl, editor, ..._args);
        }
    }
    class $lJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.accept',
                title: (0, nls_1.localize)(3, null),
                icon: codicons_1.$Pj.send,
                precondition: contextkey_1.$Ii.and(inlineChat_1.$hz, inlineChat_1.$kz.negate()),
                keybinding: {
                    when: inlineChat_1.$iz,
                    weight: 0 /* KeybindingWeight.EditorCore */ + 7,
                    primary: 3 /* KeyCode.Enter */
                },
                menu: {
                    id: inlineChat_1.$Dz,
                    group: 'main',
                    order: 1,
                    when: inlineChat_1.$rz.isEqualTo(false)
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.acceptInput();
        }
    }
    exports.$lJb = $lJb;
    class $mJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: inlineChat_1.$Bz,
                title: (0, nls_1.localize)(4, null),
                shortTitle: (0, nls_1.localize)(5, null),
                icon: codicons_1.$Pj.refresh,
                precondition: contextkey_1.$Ii.and(inlineChat_1.$hz, inlineChat_1.$kz.negate(), inlineChat_1.$tz),
                menu: {
                    id: inlineChat_1.$Fz,
                    group: '2_feedback',
                    order: 3,
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl) {
            ctrl.regenerate();
        }
    }
    exports.$mJb = $mJb;
    class $nJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.stop',
                title: (0, nls_1.localize)(6, null),
                icon: codicons_1.$Pj.debugStop,
                precondition: contextkey_1.$Ii.and(inlineChat_1.$hz, inlineChat_1.$kz.negate(), inlineChat_1.$rz),
                menu: {
                    id: inlineChat_1.$Dz,
                    group: 'main',
                    order: 1,
                    when: inlineChat_1.$rz
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
    exports.$nJb = $nJb;
    class $oJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.arrowOutUp',
                title: (0, nls_1.localize)(7, null),
                precondition: contextkey_1.$Ii.and(inlineChat_1.$iz, inlineChat_1.$lz, editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate(), accessibility_1.$2r.negate()),
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
    exports.$oJb = $oJb;
    class $pJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.arrowOutDown',
                title: (0, nls_1.localize)(8, null),
                precondition: contextkey_1.$Ii.and(inlineChat_1.$iz, inlineChat_1.$mz, editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate(), accessibility_1.$2r.negate()),
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
    exports.$pJb = $pJb;
    class $qJb extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'inlineChat.focus',
                title: { value: (0, nls_1.localize)(9, null), original: 'Focus Input' },
                f1: true,
                category: AbstractInlineChatAction.category,
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, inlineChat_1.$hz, inlineChat_1.$iz.negate(), accessibility_1.$2r.negate()),
                keybinding: [{
                        weight: 0 /* KeybindingWeight.EditorCore */ + 10,
                        when: contextkey_1.$Ii.and(inlineChat_1.$qz.isEqualTo('above'), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 18 /* KeyCode.DownArrow */,
                    }, {
                        weight: 0 /* KeybindingWeight.EditorCore */ + 10,
                        when: contextkey_1.$Ii.and(inlineChat_1.$qz.isEqualTo('below'), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 16 /* KeyCode.UpArrow */,
                    }]
            });
        }
        runEditorCommand(_accessor, editor, ..._args) {
            inlineChatController_1.$Qqb.get(editor)?.focus();
        }
    }
    exports.$qJb = $qJb;
    class $rJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.previousFromHistory',
                title: (0, nls_1.localize)(10, null),
                precondition: contextkey_1.$Ii.and(inlineChat_1.$iz, inlineChat_1.$nz),
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
    exports.$rJb = $rJb;
    class $sJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.nextFromHistory',
                title: (0, nls_1.localize)(11, null),
                precondition: contextkey_1.$Ii.and(inlineChat_1.$iz, inlineChat_1.$oz),
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
    exports.$sJb = $sJb;
    actions_1.$Tu.appendMenuItem(inlineChat_1.$Fz, {
        submenu: inlineChat_1.$Hz,
        title: (0, nls_1.localize)(12, null),
        icon: codicons_1.$Pj.discard,
        group: '0_main',
        order: 2,
        when: contextkey_1.$Ii.and(inlineChat_1.$zz.notEqualsTo("preview" /* EditMode.Preview */), inlineChat_1.$uz.notEqualsTo("onlyMessages" /* InlineChateResponseTypes.OnlyMessages */)),
        rememberDefaultAction: true
    });
    class $tJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.discard',
                title: (0, nls_1.localize)(13, null),
                icon: codicons_1.$Pj.discard,
                precondition: inlineChat_1.$hz,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */,
                    when: inlineChat_1.$wz.negate()
                },
                menu: {
                    id: inlineChat_1.$Hz,
                    group: '0_main',
                    order: 0
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.cancelSession();
        }
    }
    exports.$tJb = $tJb;
    class $uJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.discardToClipboard',
                title: (0, nls_1.localize)(14, null),
                precondition: contextkey_1.$Ii.and(inlineChat_1.$hz, inlineChat_1.$vz),
                // keybinding: {
                // 	weight: KeybindingWeight.EditorContrib + 10,
                // 	primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyZ,
                // 	mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyZ },
                // },
                menu: {
                    id: inlineChat_1.$Hz,
                    group: '0_main',
                    order: 1
                }
            });
        }
        async runInlineChatCommand(accessor, ctrl) {
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            const changedText = ctrl.cancelSession();
            if (changedText !== undefined) {
                clipboardService.writeText(changedText);
            }
        }
    }
    exports.$uJb = $uJb;
    class $vJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.discardToFile',
                title: (0, nls_1.localize)(15, null),
                precondition: contextkey_1.$Ii.and(inlineChat_1.$hz, inlineChat_1.$vz),
                menu: {
                    id: inlineChat_1.$Hz,
                    group: '0_main',
                    order: 2
                }
            });
        }
        async runInlineChatCommand(accessor, ctrl, editor, ..._args) {
            const editorService = accessor.get(editorService_1.$9C);
            const changedText = ctrl.cancelSession();
            if (changedText !== undefined) {
                const input = { forceUntitled: true, resource: undefined, contents: changedText, languageId: editor.getModel()?.getLanguageId() };
                editorService.openEditor(input, editorService_1.$$C);
            }
        }
    }
    exports.$vJb = $vJb;
    class $wJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.feedbackHelpful',
                title: (0, nls_1.localize)(16, null),
                icon: codicons_1.$Pj.thumbsup,
                precondition: inlineChat_1.$hz,
                toggled: inlineChat_1.$xz.isEqualTo('helpful'),
                menu: {
                    id: inlineChat_1.$Gz,
                    when: inlineChat_1.$tz.notEqualsTo(undefined),
                    group: '2_feedback',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl) {
            ctrl.feedbackLast(true);
        }
    }
    exports.$wJb = $wJb;
    class $xJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.feedbackunhelpful',
                title: (0, nls_1.localize)(17, null),
                icon: codicons_1.$Pj.thumbsdown,
                precondition: inlineChat_1.$hz,
                toggled: inlineChat_1.$xz.isEqualTo('unhelpful'),
                menu: {
                    id: inlineChat_1.$Gz,
                    when: inlineChat_1.$tz.notEqualsTo(undefined),
                    group: '2_feedback',
                    order: 2
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl) {
            ctrl.feedbackLast(false);
        }
    }
    exports.$xJb = $xJb;
    class $yJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.toggleDiff',
                title: {
                    original: 'Show Diff',
                    value: (0, nls_1.localize)(18, null),
                    mnemonicTitle: (0, nls_1.localize)(19, null),
                },
                toggled: {
                    condition: contextkey_1.$Ii.equals('config.inlineChat.showDiff', true),
                    title: (0, nls_1.localize)(20, null),
                    mnemonicTitle: (0, nls_1.localize)(21, null)
                },
                precondition: contextkey_1.$Ii.notEquals('config.inlineChat.mode', 'preview'),
                menu: [
                    { id: actions_1.$Ru.CommandPalette },
                    { id: inlineChat_1.$Iz }
                ]
            });
        }
        runInlineChatCommand(accessor, _ctrl) {
            const configurationService = accessor.get(configuration_1.$8h);
            const newValue = !configurationService.getValue('inlineChat.showDiff');
            configurationService.updateValue('inlineChat.showDiff', newValue);
        }
    }
    exports.$yJb = $yJb;
    class $zJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: inlineChat_1.$Az,
                title: (0, nls_1.localize)(22, null),
                shortTitle: (0, nls_1.localize)(23, null),
                icon: codicons_1.$Pj.check,
                precondition: contextkey_1.$Ii.and(inlineChat_1.$hz, contextkey_1.$Ii.or(inlineChat_1.$yz.toNegated(), inlineChat_1.$zz.notEqualsTo("preview" /* EditMode.Preview */))),
                keybinding: [{
                        weight: 100 /* KeybindingWeight.EditorContrib */ + 10,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    }, {
                        primary: 9 /* KeyCode.Escape */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: inlineChat_1.$wz,
                    }],
                menu: {
                    when: inlineChat_1.$uz.notEqualsTo("onlyMessages" /* InlineChateResponseTypes.OnlyMessages */),
                    id: inlineChat_1.$Fz,
                    group: '0_main',
                    order: 0
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl) {
            ctrl.acceptSession();
        }
    }
    exports.$zJb = $zJb;
    class $AJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.cancel',
                title: (0, nls_1.localize)(24, null),
                icon: codicons_1.$Pj.clearAll,
                precondition: inlineChat_1.$hz,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 1,
                    primary: 9 /* KeyCode.Escape */
                },
                menu: {
                    id: inlineChat_1.$Fz,
                    when: contextkey_1.$Ii.or(inlineChat_1.$zz.isEqualTo("preview" /* EditMode.Preview */), inlineChat_1.$uz.isEqualTo("onlyMessages" /* InlineChateResponseTypes.OnlyMessages */)),
                    group: '0_main',
                    order: 3
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.cancelSession();
        }
    }
    exports.$AJb = $AJb;
    class $BJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.copyRecordings',
                f1: true,
                title: {
                    value: (0, nls_1.localize)(25, null),
                    original: '(Developer) Write Exchange to Clipboard'
                }
            });
        }
        async runInlineChatCommand(accessor) {
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            const quickPickService = accessor.get(quickInput_1.$Gq);
            const ieSessionService = accessor.get(inlineChatSession_1.$bqb);
            const recordings = ieSessionService.recordings().filter(r => r.exchanges.length > 0);
            if (recordings.length === 0) {
                return;
            }
            const picks = recordings.map(rec => {
                return {
                    rec,
                    label: (0, nls_1.localize)(26, null, rec.exchanges[0].prompt, rec.exchanges.length - 1, (0, date_1.$6l)(rec.when, true)),
                    tooltip: rec.exchanges.map(ex => ex.prompt).join('\n'),
                };
            });
            const pick = await quickPickService.pick(picks, { canPickMany: false });
            if (pick) {
                clipboardService.writeText(JSON.stringify(pick.rec, undefined, 2));
            }
        }
    }
    exports.$BJb = $BJb;
    class $CJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: inlineChat_1.$Cz,
                title: (0, nls_1.localize)(27, null),
                icon: codicons_1.$Pj.commentDiscussion,
                precondition: inlineChat_1.$hz,
                menu: {
                    id: inlineChat_1.$Fz,
                    when: inlineChat_1.$tz.isEqualTo("message" /* InlineChatResponseType.Message */),
                    group: '0_main',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.viewInChat();
        }
    }
    exports.$CJb = $CJb;
    class $DJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.expandMessageAction',
                title: (0, nls_1.localize)(28, null),
                icon: codicons_1.$Pj.chevronDown,
                precondition: inlineChat_1.$hz,
                menu: {
                    id: inlineChat_1.$Ez,
                    when: contextkey_1.$Ii.and(inlineChat_1.$tz.isEqualTo('message'), inlineChat_1.$pz.isEqualTo('cropped')),
                    group: '2_expandOrContract',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.updateExpansionState(true);
        }
    }
    exports.$DJb = $DJb;
    class $EJb extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.contractMessageAction',
                title: (0, nls_1.localize)(29, null),
                icon: codicons_1.$Pj.chevronUp,
                precondition: inlineChat_1.$hz,
                menu: {
                    id: inlineChat_1.$Ez,
                    when: contextkey_1.$Ii.and(inlineChat_1.$tz.isEqualTo('message'), inlineChat_1.$pz.isEqualTo('expanded')),
                    group: '2_expandOrContract',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.updateExpansionState(false);
        }
    }
    exports.$EJb = $EJb;
    class $FJb extends lifecycle_1.$kc {
        constructor() {
            super();
            this.B(accessibleViewActions_1.$tGb.addImplementation(106, 'inlineChat', async (accessor) => {
                const codeEditor = accessor.get(codeEditorService_1.$nV).getActiveCodeEditor() || accessor.get(codeEditorService_1.$nV).getFocusedCodeEditor();
                if (!codeEditor) {
                    return;
                }
                (0, chatAccessibilityHelp_1.$xGb)(accessor, codeEditor, 'inlineChat');
            }, contextkey_1.$Ii.or(inlineChat_1.$jz, inlineChat_1.$iz)));
        }
    }
    exports.$FJb = $FJb;
});
//# sourceMappingURL=inlineChatActions.js.map