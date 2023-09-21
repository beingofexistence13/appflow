/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/replaceCommand", "vs/editor/common/config/editorOptions", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/cursorWordOperations", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/languageConfigurationRegistry", "vs/nls!vs/editor/contrib/wordOperations/browser/wordOperations", "vs/platform/accessibility/common/accessibility", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys"], function (require, exports, editorExtensions_1, replaceCommand_1, editorOptions_1, cursorCommon_1, cursorWordOperations_1, wordCharacterClassifier_1, position_1, range_1, selection_1, editorContextKeys_1, languageConfigurationRegistry_1, nls, accessibility_1, contextkey_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$I$ = exports.$H$ = exports.$G$ = exports.$F$ = exports.$E$ = exports.$D$ = exports.$C$ = exports.$B$ = exports.$A$ = exports.$z$ = exports.$y$ = exports.$x$ = exports.$w$ = exports.$v$ = exports.$u$ = exports.$t$ = exports.$s$ = exports.$r$ = exports.$q$ = exports.$p$ = exports.$o$ = exports.$n$ = exports.$m$ = exports.$l$ = exports.$k$ = exports.$j$ = exports.$i$ = exports.$h$ = exports.$g$ = void 0;
    class $g$ extends editorExtensions_1.$rV {
        constructor(opts) {
            super(opts);
            this.d = opts.inSelectionMode;
            this.e = opts.wordNavigationType;
        }
        runEditorCommand(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const wordSeparators = (0, wordCharacterClassifier_1.$Ks)(editor.getOption(129 /* EditorOption.wordSeparators */));
            const model = editor.getModel();
            const selections = editor.getSelections();
            const result = selections.map((sel) => {
                const inPosition = new position_1.$js(sel.positionLineNumber, sel.positionColumn);
                const outPosition = this.j(wordSeparators, model, inPosition, this.e);
                return this.h(sel, outPosition, this.d);
            });
            model.pushStackElement();
            editor._getViewModel().setCursorStates('moveWordCommand', 3 /* CursorChangeReason.Explicit */, result.map(r => cursorCommon_1.$JU.fromModelSelection(r)));
            if (result.length === 1) {
                const pos = new position_1.$js(result[0].positionLineNumber, result[0].positionColumn);
                editor.revealPosition(pos, 0 /* ScrollType.Smooth */);
            }
        }
        h(from, to, inSelectionMode) {
            if (inSelectionMode) {
                // move just position
                return new selection_1.$ms(from.selectionStartLineNumber, from.selectionStartColumn, to.lineNumber, to.column);
            }
            else {
                // move everything
                return new selection_1.$ms(to.lineNumber, to.column, to.lineNumber, to.column);
            }
        }
    }
    exports.$g$ = $g$;
    class $h$ extends $g$ {
        j(wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.$4V.moveWordLeft(wordSeparators, model, position, wordNavigationType);
        }
    }
    exports.$h$ = $h$;
    class $i$ extends $g$ {
        j(wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.$4V.moveWordRight(wordSeparators, model, position, wordNavigationType);
        }
    }
    exports.$i$ = $i$;
    class $j$ extends $h$ {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordStartLeft',
                precondition: undefined
            });
        }
    }
    exports.$j$ = $j$;
    class $k$ extends $h$ {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordEndLeft',
                precondition: undefined
            });
        }
    }
    exports.$k$ = $k$;
    class $l$ extends $h$ {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 1 /* WordNavigationType.WordStartFast */,
                id: 'cursorWordLeft',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.$Ii.and(accessibility_1.$2r, contextkeys_1.$13)?.negate()),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.$l$ = $l$;
    class $m$ extends $h$ {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordStartLeftSelect',
                precondition: undefined
            });
        }
    }
    exports.$m$ = $m$;
    class $n$ extends $h$ {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordEndLeftSelect',
                precondition: undefined
            });
        }
    }
    exports.$n$ = $n$;
    class $o$ extends $h$ {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 1 /* WordNavigationType.WordStartFast */,
                id: 'cursorWordLeftSelect',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.$Ii.and(accessibility_1.$2r, contextkeys_1.$13)?.negate()),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.$o$ = $o$;
    // Accessibility navigation commands should only be enabled on windows since they are tuned to what NVDA expects
    class $p$ extends $h$ {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 3 /* WordNavigationType.WordAccessibility */,
                id: 'cursorWordAccessibilityLeft',
                precondition: undefined
            });
        }
        j(_, model, position, wordNavigationType) {
            return super.j((0, wordCharacterClassifier_1.$Ks)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.$p$ = $p$;
    class $q$ extends $h$ {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 3 /* WordNavigationType.WordAccessibility */,
                id: 'cursorWordAccessibilityLeftSelect',
                precondition: undefined
            });
        }
        j(_, model, position, wordNavigationType) {
            return super.j((0, wordCharacterClassifier_1.$Ks)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.$q$ = $q$;
    class $r$ extends $i$ {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordStartRight',
                precondition: undefined
            });
        }
    }
    exports.$r$ = $r$;
    class $s$ extends $i$ {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordEndRight',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.$Ii.and(accessibility_1.$2r, contextkeys_1.$13)?.negate()),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.$s$ = $s$;
    class $t$ extends $i$ {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordRight',
                precondition: undefined
            });
        }
    }
    exports.$t$ = $t$;
    class $u$ extends $i$ {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordStartRightSelect',
                precondition: undefined
            });
        }
    }
    exports.$u$ = $u$;
    class $v$ extends $i$ {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordEndRightSelect',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.$Ii.and(accessibility_1.$2r, contextkeys_1.$13)?.negate()),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.$v$ = $v$;
    class $w$ extends $i$ {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordRightSelect',
                precondition: undefined
            });
        }
    }
    exports.$w$ = $w$;
    class $x$ extends $i$ {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 3 /* WordNavigationType.WordAccessibility */,
                id: 'cursorWordAccessibilityRight',
                precondition: undefined
            });
        }
        j(_, model, position, wordNavigationType) {
            return super.j((0, wordCharacterClassifier_1.$Ks)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.$x$ = $x$;
    class $y$ extends $i$ {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 3 /* WordNavigationType.WordAccessibility */,
                id: 'cursorWordAccessibilityRightSelect',
                precondition: undefined
            });
        }
        j(_, model, position, wordNavigationType) {
            return super.j((0, wordCharacterClassifier_1.$Ks)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.$y$ = $y$;
    class $z$ extends editorExtensions_1.$rV {
        constructor(opts) {
            super(opts);
            this.d = opts.whitespaceHeuristics;
            this.e = opts.wordNavigationType;
        }
        runEditorCommand(accessor, editor, args) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
            if (!editor.hasModel()) {
                return;
            }
            const wordSeparators = (0, wordCharacterClassifier_1.$Ks)(editor.getOption(129 /* EditorOption.wordSeparators */));
            const model = editor.getModel();
            const selections = editor.getSelections();
            const autoClosingBrackets = editor.getOption(6 /* EditorOption.autoClosingBrackets */);
            const autoClosingQuotes = editor.getOption(11 /* EditorOption.autoClosingQuotes */);
            const autoClosingPairs = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getAutoClosingPairs();
            const viewModel = editor._getViewModel();
            const commands = selections.map((sel) => {
                const deleteRange = this.h({
                    wordSeparators,
                    model,
                    selection: sel,
                    whitespaceHeuristics: this.d,
                    autoClosingDelete: editor.getOption(9 /* EditorOption.autoClosingDelete */),
                    autoClosingBrackets,
                    autoClosingQuotes,
                    autoClosingPairs,
                    autoClosedCharacters: viewModel.getCursorAutoClosedCharacters()
                }, this.e);
                return new replaceCommand_1.$UV(deleteRange, '');
            });
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.$z$ = $z$;
    class $A$ extends $z$ {
        h(ctx, wordNavigationType) {
            const r = cursorWordOperations_1.$4V.deleteWordLeft(ctx, wordNavigationType);
            if (r) {
                return r;
            }
            return new range_1.$ks(1, 1, 1, 1);
        }
    }
    exports.$A$ = $A$;
    class $B$ extends $z$ {
        h(ctx, wordNavigationType) {
            const r = cursorWordOperations_1.$4V.deleteWordRight(ctx, wordNavigationType);
            if (r) {
                return r;
            }
            const lineCount = ctx.model.getLineCount();
            const maxColumn = ctx.model.getLineMaxColumn(lineCount);
            return new range_1.$ks(lineCount, maxColumn, lineCount, maxColumn);
        }
    }
    exports.$B$ = $B$;
    class $C$ extends $A$ {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'deleteWordStartLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.$C$ = $C$;
    class $D$ extends $A$ {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'deleteWordEndLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.$D$ = $D$;
    class $E$ extends $A$ {
        constructor() {
            super({
                whitespaceHeuristics: true,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'deleteWordLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 1 /* KeyCode.Backspace */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.$E$ = $E$;
    class $F$ extends $B$ {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'deleteWordStartRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.$F$ = $F$;
    class $G$ extends $B$ {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'deleteWordEndRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.$G$ = $G$;
    class $H$ extends $B$ {
        constructor() {
            super({
                whitespaceHeuristics: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'deleteWordRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 20 /* KeyCode.Delete */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 20 /* KeyCode.Delete */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.$H$ = $H$;
    class $I$ extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'deleteInsideWord',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                label: nls.localize(0, null),
                alias: 'Delete Word'
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const wordSeparators = (0, wordCharacterClassifier_1.$Ks)(editor.getOption(129 /* EditorOption.wordSeparators */));
            const model = editor.getModel();
            const selections = editor.getSelections();
            const commands = selections.map((sel) => {
                const deleteRange = cursorWordOperations_1.$4V.deleteInsideWord(wordSeparators, model, sel);
                return new replaceCommand_1.$UV(deleteRange, '');
            });
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.$I$ = $I$;
    (0, editorExtensions_1.$wV)(new $j$());
    (0, editorExtensions_1.$wV)(new $k$());
    (0, editorExtensions_1.$wV)(new $l$());
    (0, editorExtensions_1.$wV)(new $m$());
    (0, editorExtensions_1.$wV)(new $n$());
    (0, editorExtensions_1.$wV)(new $o$());
    (0, editorExtensions_1.$wV)(new $r$());
    (0, editorExtensions_1.$wV)(new $s$());
    (0, editorExtensions_1.$wV)(new $t$());
    (0, editorExtensions_1.$wV)(new $u$());
    (0, editorExtensions_1.$wV)(new $v$());
    (0, editorExtensions_1.$wV)(new $w$());
    (0, editorExtensions_1.$wV)(new $p$());
    (0, editorExtensions_1.$wV)(new $q$());
    (0, editorExtensions_1.$wV)(new $x$());
    (0, editorExtensions_1.$wV)(new $y$());
    (0, editorExtensions_1.$wV)(new $C$());
    (0, editorExtensions_1.$wV)(new $D$());
    (0, editorExtensions_1.$wV)(new $E$());
    (0, editorExtensions_1.$wV)(new $F$());
    (0, editorExtensions_1.$wV)(new $G$());
    (0, editorExtensions_1.$wV)(new $H$());
    (0, editorExtensions_1.$xV)($I$);
});
//# sourceMappingURL=wordOperations.js.map