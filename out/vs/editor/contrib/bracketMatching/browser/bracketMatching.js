/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./bracketMatching"], function (require, exports, async_1, lifecycle_1, editorExtensions_1, position_1, range_1, selection_1, editorContextKeys_1, model_1, textModel_1, nls, actions_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BracketMatchingController = void 0;
    const overviewRulerBracketMatchForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.bracketMatchForeground', { dark: '#A0A0A0', light: '#A0A0A0', hcDark: '#A0A0A0', hcLight: '#A0A0A0' }, nls.localize('overviewRulerBracketMatchForeground', 'Overview ruler marker color for matching brackets.'));
    class JumpToBracketAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.jumpToBracket',
                label: nls.localize('smartSelect.jumpBracket', "Go to Bracket"),
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
            BracketMatchingController.get(editor)?.jumpToBracket();
        }
    }
    class SelectToBracketAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.selectToBracket',
                label: nls.localize('smartSelect.selectToBracket', "Select to Bracket"),
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
            BracketMatchingController.get(editor)?.selectToBracket(selectBrackets);
        }
    }
    class RemoveBracketsAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.removeBrackets',
                label: nls.localize('smartSelect.removeBrackets', "Remove Brackets"),
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
            BracketMatchingController.get(editor)?.removeBrackets(this.id);
        }
    }
    class BracketsData {
        constructor(position, brackets, options) {
            this.position = position;
            this.brackets = brackets;
            this.options = options;
        }
    }
    class BracketMatchingController extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.bracketMatchingController'; }
        static get(editor) {
            return editor.getContribution(BracketMatchingController.ID);
        }
        constructor(editor) {
            super();
            this._editor = editor;
            this._lastBracketsData = [];
            this._lastVersionId = 0;
            this._decorations = this._editor.createDecorationsCollection();
            this._updateBracketsSoon = this._register(new async_1.RunOnceScheduler(() => this._updateBrackets(), 50));
            this._matchBrackets = this._editor.getOption(71 /* EditorOption.matchBrackets */);
            this._updateBracketsSoon.schedule();
            this._register(editor.onDidChangeCursorPosition((e) => {
                if (this._matchBrackets === 'never') {
                    // Early exit if nothing needs to be done!
                    // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                    return;
                }
                this._updateBracketsSoon.schedule();
            }));
            this._register(editor.onDidChangeModelContent((e) => {
                this._updateBracketsSoon.schedule();
            }));
            this._register(editor.onDidChangeModel((e) => {
                this._lastBracketsData = [];
                this._updateBracketsSoon.schedule();
            }));
            this._register(editor.onDidChangeModelLanguageConfiguration((e) => {
                this._lastBracketsData = [];
                this._updateBracketsSoon.schedule();
            }));
            this._register(editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(71 /* EditorOption.matchBrackets */)) {
                    this._matchBrackets = this._editor.getOption(71 /* EditorOption.matchBrackets */);
                    this._decorations.clear();
                    this._lastBracketsData = [];
                    this._lastVersionId = 0;
                    this._updateBracketsSoon.schedule();
                }
            }));
            this._register(editor.onDidBlurEditorWidget(() => {
                this._updateBracketsSoon.schedule();
            }));
            this._register(editor.onDidFocusEditorWidget(() => {
                this._updateBracketsSoon.schedule();
            }));
        }
        jumpToBracket() {
            if (!this._editor.hasModel()) {
                return;
            }
            const model = this._editor.getModel();
            const newSelections = this._editor.getSelections().map(selection => {
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
                    return new selection_1.Selection(newCursorPosition.lineNumber, newCursorPosition.column, newCursorPosition.lineNumber, newCursorPosition.column);
                }
                return new selection_1.Selection(position.lineNumber, position.column, position.lineNumber, position.column);
            });
            this._editor.setSelections(newSelections);
            this._editor.revealRange(newSelections[0]);
        }
        selectToBracket(selectBrackets) {
            if (!this._editor.hasModel()) {
                return;
            }
            const model = this._editor.getModel();
            const newSelections = [];
            this._editor.getSelections().forEach(selection => {
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
                    brackets.sort(range_1.Range.compareRangesUsingStarts);
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
                    newSelections.push(new selection_1.Selection(selectFrom.lineNumber, selectFrom.column, selectTo.lineNumber, selectTo.column));
                }
            });
            if (newSelections.length > 0) {
                this._editor.setSelections(newSelections);
                this._editor.revealRange(newSelections[0]);
            }
        }
        removeBrackets(editSource) {
            if (!this._editor.hasModel()) {
                return;
            }
            const model = this._editor.getModel();
            this._editor.getSelections().forEach((selection) => {
                const position = selection.getPosition();
                let brackets = model.bracketPairs.matchBracket(position);
                if (!brackets) {
                    brackets = model.bracketPairs.findEnclosingBrackets(position);
                }
                if (brackets) {
                    this._editor.pushUndoStop();
                    this._editor.executeEdits(editSource, [
                        { range: brackets[0], text: '' },
                        { range: brackets[1], text: '' }
                    ]);
                    this._editor.pushUndoStop();
                }
            });
        }
        static { this._DECORATION_OPTIONS_WITH_OVERVIEW_RULER = textModel_1.ModelDecorationOptions.register({
            description: 'bracket-match-overview',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'bracket-match',
            overviewRuler: {
                color: (0, themeService_1.themeColorFromId)(overviewRulerBracketMatchForeground),
                position: model_1.OverviewRulerLane.Center
            }
        }); }
        static { this._DECORATION_OPTIONS_WITHOUT_OVERVIEW_RULER = textModel_1.ModelDecorationOptions.register({
            description: 'bracket-match-no-overview',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'bracket-match'
        }); }
        _updateBrackets() {
            if (this._matchBrackets === 'never') {
                return;
            }
            this._recomputeBrackets();
            const newDecorations = [];
            let newDecorationsLen = 0;
            for (const bracketData of this._lastBracketsData) {
                const brackets = bracketData.brackets;
                if (brackets) {
                    newDecorations[newDecorationsLen++] = { range: brackets[0], options: bracketData.options };
                    newDecorations[newDecorationsLen++] = { range: brackets[1], options: bracketData.options };
                }
            }
            this._decorations.set(newDecorations);
        }
        _recomputeBrackets() {
            if (!this._editor.hasModel() || !this._editor.hasWidgetFocus()) {
                // no model or no focus => no brackets!
                this._lastBracketsData = [];
                this._lastVersionId = 0;
                return;
            }
            const selections = this._editor.getSelections();
            if (selections.length > 100) {
                // no bracket matching for high numbers of selections
                this._lastBracketsData = [];
                this._lastVersionId = 0;
                return;
            }
            const model = this._editor.getModel();
            const versionId = model.getVersionId();
            let previousData = [];
            if (this._lastVersionId === versionId) {
                // use the previous data only if the model is at the same version id
                previousData = this._lastBracketsData;
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
                positions.sort(position_1.Position.compare);
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
                    let options = BracketMatchingController._DECORATION_OPTIONS_WITH_OVERVIEW_RULER;
                    if (!brackets && this._matchBrackets === 'always') {
                        brackets = model.bracketPairs.findEnclosingBrackets(position, 20 /* give at most 20ms to compute */);
                        options = BracketMatchingController._DECORATION_OPTIONS_WITHOUT_OVERVIEW_RULER;
                    }
                    newData[newDataLen++] = new BracketsData(position, brackets, options);
                }
            }
            this._lastBracketsData = newData;
            this._lastVersionId = versionId;
        }
    }
    exports.BracketMatchingController = BracketMatchingController;
    (0, editorExtensions_1.registerEditorContribution)(BracketMatchingController.ID, BracketMatchingController, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.registerEditorAction)(SelectToBracketAction);
    (0, editorExtensions_1.registerEditorAction)(JumpToBracketAction);
    (0, editorExtensions_1.registerEditorAction)(RemoveBracketsAction);
    // Go to menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '5_infile_nav',
        command: {
            id: 'editor.action.jumpToBracket',
            title: nls.localize({ key: 'miGoToBracket', comment: ['&& denotes a mnemonic'] }, "Go to &&Bracket")
        },
        order: 2
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhY2tldE1hdGNoaW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvYnJhY2tldE1hdGNoaW5nL2Jyb3dzZXIvYnJhY2tldE1hdGNoaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNCaEcsTUFBTSxtQ0FBbUMsR0FBRyxJQUFBLDZCQUFhLEVBQUMsNENBQTRDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSxvREFBb0QsQ0FBQyxDQUFDLENBQUM7SUFFalMsTUFBTSxtQkFBb0IsU0FBUSwrQkFBWTtRQUM3QztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNkJBQTZCO2dCQUNqQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxlQUFlLENBQUM7Z0JBQy9ELEtBQUssRUFBRSxlQUFlO2dCQUN0QixZQUFZLEVBQUUsU0FBUztnQkFDdkIsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxlQUFlO29CQUN6QyxPQUFPLEVBQUUsbURBQTZCLDZCQUFvQjtvQkFDMUQsTUFBTSwwQ0FBZ0M7aUJBQ3RDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLEdBQUcsQ0FBQyxRQUEwQixFQUFFLE1BQW1CO1lBQ3pELHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQztRQUN4RCxDQUFDO0tBQ0Q7SUFFRCxNQUFNLHFCQUFzQixTQUFRLCtCQUFZO1FBQy9DO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSwrQkFBK0I7Z0JBQ25DLEtBQUssRUFB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