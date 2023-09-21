/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/nls!vs/editor/contrib/bracketMatching/browser/bracketMatching", "vs/platform/actions/common/actions", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./bracketMatching"], function (require, exports, async_1, lifecycle_1, editorExtensions_1, position_1, range_1, selection_1, editorContextKeys_1, model_1, textModel_1, nls, actions_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f1 = void 0;
    const overviewRulerBracketMatchForeground = (0, colorRegistry_1.$sv)('editorOverviewRuler.bracketMatchForeground', { dark: '#A0A0A0', light: '#A0A0A0', hcDark: '#A0A0A0', hcLight: '#A0A0A0' }, nls.localize(0, null));
    class JumpToBracketAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.jumpToBracket',
                label: nls.localize(1, null),
                alias: 'Go to Bracket',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 93 /* KeyCode.Backslash */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            $f1.get(editor)?.jumpToBracket();
        }
    }
    class SelectToBracketAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.selectToBracket',
                label: nls.localize(2, null),
                alias: 'Select to Bracket',
                precondition: undefined,
                description: {
                    description: `Select to Bracket`,
                    args: [{
                            name: 'args',
                            schema: {
                                type: 'object',
                                properties: {
                                    'selectBrackets': {
                                        type: 'boolean',
                                        default: true
                                    }
                                },
                            }
                        }]
                }
            });
        }
        run(accessor, editor, args) {
            let selectBrackets = true;
            if (args && args.selectBrackets === false) {
                selectBrackets = false;
            }
            $f1.get(editor)?.selectToBracket(selectBrackets);
        }
    }
    class RemoveBracketsAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.removeBrackets',
                label: nls.localize(3, null),
                alias: 'Remove Brackets',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1 /* KeyCode.Backspace */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            $f1.get(editor)?.removeBrackets(this.id);
        }
    }
    class BracketsData {
        constructor(position, brackets, options) {
            this.position = position;
            this.brackets = brackets;
            this.options = options;
        }
    }
    class $f1 extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.bracketMatchingController'; }
        static get(editor) {
            return editor.getContribution($f1.ID);
        }
        constructor(editor) {
            super();
            this.a = editor;
            this.b = [];
            this.c = 0;
            this.f = this.a.createDecorationsCollection();
            this.g = this.B(new async_1.$Sg(() => this.n(), 50));
            this.h = this.a.getOption(71 /* EditorOption.matchBrackets */);
            this.g.schedule();
            this.B(editor.onDidChangeCursorPosition((e) => {
                if (this.h === 'never') {
                    // Early exit if nothing needs to be done!
                    // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                    return;
                }
                this.g.schedule();
            }));
            this.B(editor.onDidChangeModelContent((e) => {
                this.g.schedule();
            }));
            this.B(editor.onDidChangeModel((e) => {
                this.b = [];
                this.g.schedule();
            }));
            this.B(editor.onDidChangeModelLanguageConfiguration((e) => {
                this.b = [];
                this.g.schedule();
            }));
            this.B(editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(71 /* EditorOption.matchBrackets */)) {
                    this.h = this.a.getOption(71 /* EditorOption.matchBrackets */);
                    this.f.clear();
                    this.b = [];
                    this.c = 0;
                    this.g.schedule();
                }
            }));
            this.B(editor.onDidBlurEditorWidget(() => {
                this.g.schedule();
            }));
            this.B(editor.onDidFocusEditorWidget(() => {
                this.g.schedule();
            }));
        }
        jumpToBracket() {
            if (!this.a.hasModel()) {
                return;
            }
            const model = this.a.getModel();
            const newSelections = this.a.getSelections().map(selection => {
                const position = selection.getStartPosition();
                // find matching brackets if position is on a bracket
                const brackets = model.bracketPairs.matchBracket(position);
                let newCursorPosition = null;
                if (brackets) {
                    if (brackets[0].containsPosition(position) && !brackets[1].containsPosition(position)) {
                        newCursorPosition = brackets[1].getStartPosition();
                    }
                    else if (brackets[1].containsPosition(position)) {
                        newCursorPosition = brackets[0].getStartPosition();
                    }
                }
                else {
                    // find the enclosing brackets if the position isn't on a matching bracket
                    const enclosingBrackets = model.bracketPairs.findEnclosingBrackets(position);
                    if (enclosingBrackets) {
                        newCursorPosition = enclosingBrackets[1].getStartPosition();
                    }
                    else {
                        // no enclosing brackets, try the very first next bracket
                        const nextBracket = model.bracketPairs.findNextBracket(position);
                        if (nextBracket && nextBracket.range) {
                            newCursorPosition = nextBracket.range.getStartPosition();
                        }
                    }
                }
                if (newCursorPosition) {
                    return new selection_1.$ms(newCursorPosition.lineNumber, newCursorPosition.column, newCursorPosition.lineNumber, newCursorPosition.column);
                }
                return new selection_1.$ms(position.lineNumber, position.column, position.lineNumber, position.column);
            });
            this.a.setSelections(newSelections);
            this.a.revealRange(newSelections[0]);
        }
        selectToBracket(selectBrackets) {
            if (!this.a.hasModel()) {
                return;
            }
            const model = this.a.getModel();
            const newSelections = [];
            this.a.getSelections().forEach(selection => {
                const position = selection.getStartPosition();
                let brackets = model.bracketPairs.matchBracket(position);
                if (!brackets) {
                    brackets = model.bracketPairs.findEnclosingBrackets(position);
                    if (!brackets) {
                        const nextBracket = model.bracketPairs.findNextBracket(position);
                        if (nextBracket && nextBracket.range) {
                            brackets = model.bracketPairs.matchBracket(nextBracket.range.getStartPosition());
                        }
                    }
                }
                let selectFrom = null;
                let selectTo = null;
                if (brackets) {
                    brackets.sort(range_1.$ks.compareRangesUsingStarts);
                    const [open, close] = brackets;
                    selectFrom = selectBrackets ? open.getStartPosition() : open.getEndPosition();
                    selectTo = selectBrackets ? close.getEndPosition() : close.getStartPosition();
                    if (close.containsPosition(position)) {
                        // select backwards if the cursor was on the closing bracket
                        const tmp = selectFrom;
                        selectFrom = selectTo;
                        selectTo = tmp;
                    }
                }
                if (selectFrom && selectTo) {
                    newSelections.push(new selection_1.$ms(selectFrom.lineNumber, selectFrom.column, selectTo.lineNumber, selectTo.column));
                }
            });
            if (newSelections.length > 0) {
                this.a.setSelections(newSelections);
                this.a.revealRange(newSelections[0]);
            }
        }
        removeBrackets(editSource) {
            if (!this.a.hasModel()) {
                return;
            }
            const model = this.a.getModel();
            this.a.getSelections().forEach((selection) => {
                const position = selection.getPosition();
                let brackets = model.bracketPairs.matchBracket(position);
                if (!brackets) {
                    brackets = model.bracketPairs.findEnclosingBrackets(position);
                }
                if (brackets) {
                    this.a.pushUndoStop();
                    this.a.executeEdits(editSource, [
                        { range: brackets[0], text: '' },
                        { range: brackets[1], text: '' }
                    ]);
                    this.a.pushUndoStop();
                }
            });
        }
        static { this.j = textModel_1.$RC.register({
            description: 'bracket-match-overview',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'bracket-match',
            overviewRuler: {
                color: (0, themeService_1.$hv)(overviewRulerBracketMatchForeground),
                position: model_1.OverviewRulerLane.Center
            }
        }); }
        static { this.m = textModel_1.$RC.register({
            description: 'bracket-match-no-overview',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'bracket-match'
        }); }
        n() {
            if (this.h === 'never') {
                return;
            }
            this.r();
            const newDecorations = [];
            let newDecorationsLen = 0;
            for (const bracketData of this.b) {
                const brackets = bracketData.brackets;
                if (brackets) {
                    newDecorations[newDecorationsLen++] = { range: brackets[0], options: bracketData.options };
                    newDecorations[newDecorationsLen++] = { range: brackets[1], options: bracketData.options };
                }
            }
            this.f.set(newDecorations);
        }
        r() {
            if (!this.a.hasModel() || !this.a.hasWidgetFocus()) {
                // no model or no focus => no brackets!
                this.b = [];
                this.c = 0;
                return;
            }
            const selections = this.a.getSelections();
            if (selections.length > 100) {
                // no bracket matching for high numbers of selections
                this.b = [];
                this.c = 0;
                return;
            }
            const model = this.a.getModel();
            const versionId = model.getVersionId();
            let previousData = [];
            if (this.c === versionId) {
                // use the previous data only if the model is at the same version id
                previousData = this.b;
            }
            const positions = [];
            let positionsLen = 0;
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                if (selection.isEmpty()) {
                    // will bracket match a cursor only if the selection is collapsed
                    positions[positionsLen++] = selection.getStartPosition();
                }
            }
            // sort positions for `previousData` cache hits
            if (positions.length > 1) {
                positions.sort(position_1.$js.compare);
            }
            const newData = [];
            let newDataLen = 0;
            let previousIndex = 0;
            const previousLen = previousData.length;
            for (let i = 0, len = positions.length; i < len; i++) {
                const position = positions[i];
                while (previousIndex < previousLen && previousData[previousIndex].position.isBefore(position)) {
                    previousIndex++;
                }
                if (previousIndex < previousLen && previousData[previousIndex].position.equals(position)) {
                    newData[newDataLen++] = previousData[previousIndex];
                }
                else {
                    let brackets = model.bracketPairs.matchBracket(position, 20 /* give at most 20ms to compute */);
                    let options = $f1.j;
                    if (!brackets && this.h === 'always') {
                        brackets = model.bracketPairs.findEnclosingBrackets(position, 20 /* give at most 20ms to compute */);
                        options = $f1.m;
                    }
                    newData[newDataLen++] = new BracketsData(position, brackets, options);
                }
            }
            this.b = newData;
            this.c = versionId;
        }
    }
    exports.$f1 = $f1;
    (0, editorExtensions_1.$AV)($f1.ID, $f1, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.$xV)(SelectToBracketAction);
    (0, editorExtensions_1.$xV)(JumpToBracketAction);
    (0, editorExtensions_1.$xV)(RemoveBracketsAction);
    // Go to menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarGoMenu, {
        group: '5_infile_nav',
        command: {
            id: 'editor.action.jumpToBracket',
            title: nls.localize(4, null)
        },
        order: 2
    });
});
//# sourceMappingURL=bracketMatching.js.map