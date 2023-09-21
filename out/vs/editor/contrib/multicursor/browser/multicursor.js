/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/cursor/cursorMoveCommands", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/contrib/find/browser/findController", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/wordHighlighter/browser/highlightDecorations", "vs/platform/instantiation/common/instantiation"], function (require, exports, aria_1, async_1, keyCodes_1, lifecycle_1, editorExtensions_1, cursorMoveCommands_1, range_1, selection_1, editorContextKeys_1, findController_1, nls, actions_1, contextkey_1, languageFeatures_1, highlightDecorations_1, instantiation_1) {
    "use strict";
    var SelectionHighlighter_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FocusPreviousCursor = exports.FocusNextCursor = exports.SelectionHighlighter = exports.CompatChangeAll = exports.SelectHighlightsAction = exports.MoveSelectionToPreviousFindMatchAction = exports.MoveSelectionToNextFindMatchAction = exports.AddSelectionToPreviousFindMatchAction = exports.AddSelectionToNextFindMatchAction = exports.MultiCursorSelectionControllerAction = exports.MultiCursorSelectionController = exports.MultiCursorSession = exports.MultiCursorSessionResult = exports.InsertCursorBelow = exports.InsertCursorAbove = void 0;
    function announceCursorChange(previousCursorState, cursorState) {
        const cursorDiff = cursorState.filter(cs => !previousCursorState.find(pcs => pcs.equals(cs)));
        if (cursorDiff.length >= 1) {
            const cursorPositions = cursorDiff.map(cs => `line ${cs.viewState.position.lineNumber} column ${cs.viewState.position.column}`).join(', ');
            const msg = cursorDiff.length === 1 ? nls.localize('cursorAdded', "Cursor added: {0}", cursorPositions) : nls.localize('cursorsAdded', "Cursors added: {0}", cursorPositions);
            (0, aria_1.status)(msg);
        }
    }
    class InsertCursorAbove extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.insertCursorAbove',
                label: nls.localize('mutlicursor.insertAbove', "Add Cursor Above"),
                alias: 'Add Cursor Above',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                    linux: {
                        primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */]
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize({ key: 'miInsertCursorAbove', comment: ['&& denotes a mnemonic'] }, "&&Add Cursor Above"),
                    order: 2
                }
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            let useLogicalLine = true;
            if (args && args.logicalLine === false) {
                useLogicalLine = false;
            }
            const viewModel = editor._getViewModel();
            if (viewModel.cursorConfig.readOnly) {
                return;
            }
            viewModel.model.pushStackElement();
            const previousCursorState = viewModel.getCursorStates();
            viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, cursorMoveCommands_1.CursorMoveCommands.addCursorUp(viewModel, previousCursorState, useLogicalLine));
            viewModel.revealTopMostCursor(args.source);
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    exports.InsertCursorAbove = InsertCursorAbove;
    class InsertCursorBelow extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.insertCursorBelow',
                label: nls.localize('mutlicursor.insertBelow', "Add Cursor Below"),
                alias: 'Add Cursor Below',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                    linux: {
                        primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */]
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize({ key: 'miInsertCursorBelow', comment: ['&& denotes a mnemonic'] }, "A&&dd Cursor Below"),
                    order: 3
                }
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            let useLogicalLine = true;
            if (args && args.logicalLine === false) {
                useLogicalLine = false;
            }
            const viewModel = editor._getViewModel();
            if (viewModel.cursorConfig.readOnly) {
                return;
            }
            viewModel.model.pushStackElement();
            const previousCursorState = viewModel.getCursorStates();
            viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, cursorMoveCommands_1.CursorMoveCommands.addCursorDown(viewModel, previousCursorState, useLogicalLine));
            viewModel.revealBottomMostCursor(args.source);
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    exports.InsertCursorBelow = InsertCursorBelow;
    class InsertCursorAtEndOfEachLineSelected extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.insertCursorAtEndOfEachLineSelected',
                label: nls.localize('mutlicursor.insertAtEndOfEachLineSelected', "Add Cursors to Line Ends"),
                alias: 'Add Cursors to Line Ends',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 39 /* KeyCode.KeyI */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize({ key: 'miInsertCursorAtEndOfEachLineSelected', comment: ['&& denotes a mnemonic'] }, "Add C&&ursors to Line Ends"),
                    order: 4
                }
            });
        }
        getCursorsForSelection(selection, model, result) {
            if (selection.isEmpty()) {
                return;
            }
            for (let i = selection.startLineNumber; i < selection.endLineNumber; i++) {
                const currentLineMaxColumn = model.getLineMaxColumn(i);
                result.push(new selection_1.Selection(i, currentLineMaxColumn, i, currentLineMaxColumn));
            }
            if (selection.endColumn > 1) {
                result.push(new selection_1.Selection(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn));
            }
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const model = editor.getModel();
            const selections = editor.getSelections();
            const viewModel = editor._getViewModel();
            const previousCursorState = viewModel.getCursorStates();
            const newSelections = [];
            selections.forEach((sel) => this.getCursorsForSelection(sel, model, newSelections));
            if (newSelections.length > 0) {
                editor.setSelections(newSelections);
            }
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    class InsertCursorAtEndOfLineSelected extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.addCursorsToBottom',
                label: nls.localize('mutlicursor.addCursorsToBottom', "Add Cursors To Bottom"),
                alias: 'Add Cursors To Bottom',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const selections = editor.getSelections();
            const lineCount = editor.getModel().getLineCount();
            const newSelections = [];
            for (let i = selections[0].startLineNumber; i <= lineCount; i++) {
                newSelections.push(new selection_1.Selection(i, selections[0].startColumn, i, selections[0].endColumn));
            }
            const viewModel = editor._getViewModel();
            const previousCursorState = viewModel.getCursorStates();
            if (newSelections.length > 0) {
                editor.setSelections(newSelections);
            }
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    class InsertCursorAtTopOfLineSelected extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.addCursorsToTop',
                label: nls.localize('mutlicursor.addCursorsToTop', "Add Cursors To Top"),
                alias: 'Add Cursors To Top',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const selections = editor.getSelections();
            const newSelections = [];
            for (let i = selections[0].startLineNumber; i >= 1; i--) {
                newSelections.push(new selection_1.Selection(i, selections[0].startColumn, i, selections[0].endColumn));
            }
            const viewModel = editor._getViewModel();
            const previousCursorState = viewModel.getCursorStates();
            if (newSelections.length > 0) {
                editor.setSelections(newSelections);
            }
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    class MultiCursorSessionResult {
        constructor(selections, revealRange, revealScrollType) {
            this.selections = selections;
            this.revealRange = revealRange;
            this.revealScrollType = revealScrollType;
        }
    }
    exports.MultiCursorSessionResult = MultiCursorSessionResult;
    class MultiCursorSession {
        static create(editor, findController) {
            if (!editor.hasModel()) {
                return null;
            }
            const findState = findController.getState();
            // Find widget owns entirely what we search for if:
            //  - focus is not in the editor (i.e. it is in the find widget)
            //  - and the search widget is visible
            //  - and the search string is non-empty
            if (!editor.hasTextFocus() && findState.isRevealed && findState.searchString.length > 0) {
                // Find widget owns what is searched for
                return new MultiCursorSession(editor, findController, false, findState.searchString, findState.wholeWord, findState.matchCase, null);
            }
            // Otherwise, the selection gives the search text, and the find widget gives the search settings
            // The exception is the find state disassociation case: when beginning with a single, collapsed selection
            let isDisconnectedFromFindController = false;
            let wholeWord;
            let matchCase;
            const selections = editor.getSelections();
            if (selections.length === 1 && selections[0].isEmpty()) {
                isDisconnectedFromFindController = true;
                wholeWord = true;
                matchCase = true;
            }
            else {
                wholeWord = findState.wholeWord;
                matchCase = findState.matchCase;
            }
            // Selection owns what is searched for
            const s = editor.getSelection();
            let searchText;
            let currentMatch = null;
            if (s.isEmpty()) {
                // selection is empty => expand to current word
                const word = editor.getConfiguredWordAtPosition(s.getStartPosition());
                if (!word) {
                    return null;
                }
                searchText = word.word;
                currentMatch = new selection_1.Selection(s.startLineNumber, word.startColumn, s.startLineNumber, word.endColumn);
            }
            else {
                searchText = editor.getModel().getValueInRange(s).replace(/\r\n/g, '\n');
            }
            return new MultiCursorSession(editor, findController, isDisconnectedFromFindController, searchText, wholeWord, matchCase, currentMatch);
        }
        constructor(_editor, findController, isDisconnectedFromFindController, searchText, wholeWord, matchCase, currentMatch) {
            this._editor = _editor;
            this.findController = findController;
            this.isDisconnectedFromFindController = isDisconnectedFromFindController;
            this.searchText = searchText;
            this.wholeWord = wholeWord;
            this.matchCase = matchCase;
            this.currentMatch = currentMatch;
        }
        addSelectionToNextFindMatch() {
            if (!this._editor.hasModel()) {
                return null;
            }
            const nextMatch = this._getNextMatch();
            if (!nextMatch) {
                return null;
            }
            const allSelections = this._editor.getSelections();
            return new MultiCursorSessionResult(allSelections.concat(nextMatch), nextMatch, 0 /* ScrollType.Smooth */);
        }
        moveSelectionToNextFindMatch() {
            if (!this._editor.hasModel()) {
                return null;
            }
            const nextMatch = this._getNextMatch();
            if (!nextMatch) {
                return null;
            }
            const allSelections = this._editor.getSelections();
            return new MultiCursorSessionResult(allSelections.slice(0, allSelections.length - 1).concat(nextMatch), nextMatch, 0 /* ScrollType.Smooth */);
        }
        _getNextMatch() {
            if (!this._editor.hasModel()) {
                return null;
            }
            if (this.currentMatch) {
                const result = this.currentMatch;
                this.currentMatch = null;
                return result;
            }
            this.findController.highlightFindOptions();
            const allSelections = this._editor.getSelections();
            const lastAddedSelection = allSelections[allSelections.length - 1];
            const nextMatch = this._editor.getModel().findNextMatch(this.searchText, lastAddedSelection.getEndPosition(), false, this.matchCase, this.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, false);
            if (!nextMatch) {
                return null;
            }
            return new selection_1.Selection(nextMatch.range.startLineNumber, nextMatch.range.startColumn, nextMatch.range.endLineNumber, nextMatch.range.endColumn);
        }
        addSelectionToPreviousFindMatch() {
            if (!this._editor.hasModel()) {
                return null;
            }
            const previousMatch = this._getPreviousMatch();
            if (!previousMatch) {
                return null;
            }
            const allSelections = this._editor.getSelections();
            return new MultiCursorSessionResult(allSelections.concat(previousMatch), previousMatch, 0 /* ScrollType.Smooth */);
        }
        moveSelectionToPreviousFindMatch() {
            if (!this._editor.hasModel()) {
                return null;
            }
            const previousMatch = this._getPreviousMatch();
            if (!previousMatch) {
                return null;
            }
            const allSelections = this._editor.getSelections();
            return new MultiCursorSessionResult(allSelections.slice(0, allSelections.length - 1).concat(previousMatch), previousMatch, 0 /* ScrollType.Smooth */);
        }
        _getPreviousMatch() {
            if (!this._editor.hasModel()) {
                return null;
            }
            if (this.currentMatch) {
                const result = this.currentMatch;
                this.currentMatch = null;
                return result;
            }
            this.findController.highlightFindOptions();
            const allSelections = this._editor.getSelections();
            const lastAddedSelection = allSelections[allSelections.length - 1];
            const previousMatch = this._editor.getModel().findPreviousMatch(this.searchText, lastAddedSelection.getStartPosition(), false, this.matchCase, this.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, false);
            if (!previousMatch) {
                return null;
            }
            return new selection_1.Selection(previousMatch.range.startLineNumber, previousMatch.range.startColumn, previousMatch.range.endLineNumber, previousMatch.range.endColumn);
        }
        selectAll(searchScope) {
            if (!this._editor.hasModel()) {
                return [];
            }
            this.findController.highlightFindOptions();
            const editorModel = this._editor.getModel();
            if (searchScope) {
                return editorModel.findMatches(this.searchText, searchScope, false, this.matchCase, this.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
            }
            return editorModel.findMatches(this.searchText, true, false, this.matchCase, this.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        }
    }
    exports.MultiCursorSession = MultiCursorSession;
    class MultiCursorSelectionController extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.multiCursorController'; }
        static get(editor) {
            return editor.getContribution(MultiCursorSelectionController.ID);
        }
        constructor(editor) {
            super();
            this._sessionDispose = this._register(new lifecycle_1.DisposableStore());
            this._editor = editor;
            this._ignoreSelectionChange = false;
            this._session = null;
        }
        dispose() {
            this._endSession();
            super.dispose();
        }
        _beginSessionIfNeeded(findController) {
            if (!this._session) {
                // Create a new session
                const session = MultiCursorSession.create(this._editor, findController);
                if (!session) {
                    return;
                }
                this._session = session;
                const newState = { searchString: this._session.searchText };
                if (this._session.isDisconnectedFromFindController) {
                    newState.wholeWordOverride = 1 /* FindOptionOverride.True */;
                    newState.matchCaseOverride = 1 /* FindOptionOverride.True */;
                    newState.isRegexOverride = 2 /* FindOptionOverride.False */;
                }
                findController.getState().change(newState, false);
                this._sessionDispose.add(this._editor.onDidChangeCursorSelection((e) => {
                    if (this._ignoreSelectionChange) {
                        return;
                    }
                    this._endSession();
                }));
                this._sessionDispose.add(this._editor.onDidBlurEditorText(() => {
                    this._endSession();
                }));
                this._sessionDispose.add(findController.getState().onFindReplaceStateChange((e) => {
                    if (e.matchCase || e.wholeWord) {
                        this._endSession();
                    }
                }));
            }
        }
        _endSession() {
            this._sessionDispose.clear();
            if (this._session && this._session.isDisconnectedFromFindController) {
                const newState = {
                    wholeWordOverride: 0 /* FindOptionOverride.NotSet */,
                    matchCaseOverride: 0 /* FindOptionOverride.NotSet */,
                    isRegexOverride: 0 /* FindOptionOverride.NotSet */,
                };
                this._session.findController.getState().change(newState, false);
            }
            this._session = null;
        }
        _setSelections(selections) {
            this._ignoreSelectionChange = true;
            this._editor.setSelections(selections);
            this._ignoreSelectionChange = false;
        }
        _expandEmptyToWord(model, selection) {
            if (!selection.isEmpty()) {
                return selection;
            }
            const word = this._editor.getConfiguredWordAtPosition(selection.getStartPosition());
            if (!word) {
                return selection;
            }
            return new selection_1.Selection(selection.startLineNumber, word.startColumn, selection.startLineNumber, word.endColumn);
        }
        _applySessionResult(result) {
            if (!result) {
                return;
            }
            this._setSelections(result.selections);
            if (result.revealRange) {
                this._editor.revealRangeInCenterIfOutsideViewport(result.revealRange, result.revealScrollType);
            }
        }
        getSession(findController) {
            return this._session;
        }
        addSelectionToNextFindMatch(findController) {
            if (!this._editor.hasModel()) {
                return;
            }
            if (!this._session) {
                // If there are multiple cursors, handle the case where they do not all select the same text.
                const allSelections = this._editor.getSelections();
                if (allSelections.length > 1) {
                    const findState = findController.getState();
                    const matchCase = findState.matchCase;
                    const selectionsContainSameText = modelRangesContainSameText(this._editor.getModel(), allSelections, matchCase);
                    if (!selectionsContainSameText) {
                        const model = this._editor.getModel();
                        const resultingSelections = [];
                        for (let i = 0, len = allSelections.length; i < len; i++) {
                            resultingSelections[i] = this._expandEmptyToWord(model, allSelections[i]);
                        }
                        this._editor.setSelections(resultingSelections);
                        return;
                    }
                }
            }
            this._beginSessionIfNeeded(findController);
            if (this._session) {
                this._applySessionResult(this._session.addSelectionToNextFindMatch());
            }
        }
        addSelectionToPreviousFindMatch(findController) {
            this._beginSessionIfNeeded(findController);
            if (this._session) {
                this._applySessionResult(this._session.addSelectionToPreviousFindMatch());
            }
        }
        moveSelectionToNextFindMatch(findController) {
            this._beginSessionIfNeeded(findController);
            if (this._session) {
                this._applySessionResult(this._session.moveSelectionToNextFindMatch());
            }
        }
        moveSelectionToPreviousFindMatch(findController) {
            this._beginSessionIfNeeded(findController);
            if (this._session) {
                this._applySessionResult(this._session.moveSelectionToPreviousFindMatch());
            }
        }
        selectAll(findController) {
            if (!this._editor.hasModel()) {
                return;
            }
            let matches = null;
            const findState = findController.getState();
            // Special case: find widget owns entirely what we search for if:
            // - focus is not in the editor (i.e. it is in the find widget)
            // - and the search widget is visible
            // - and the search string is non-empty
            // - and we're searching for a regex
            if (findState.isRevealed && findState.searchString.length > 0 && findState.isRegex) {
                const editorModel = this._editor.getModel();
                if (findState.searchScope) {
                    matches = editorModel.findMatches(findState.searchString, findState.searchScope, findState.isRegex, findState.matchCase, findState.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
                }
                else {
                    matches = editorModel.findMatches(findState.searchString, true, findState.isRegex, findState.matchCase, findState.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
                }
            }
            else {
                this._beginSessionIfNeeded(findController);
                if (!this._session) {
                    return;
                }
                matches = this._session.selectAll(findState.searchScope);
            }
            if (matches.length > 0) {
                const editorSelection = this._editor.getSelection();
                // Have the primary cursor remain the one where the action was invoked
                for (let i = 0, len = matches.length; i < len; i++) {
                    const match = matches[i];
                    const intersection = match.range.intersectRanges(editorSelection);
                    if (intersection) {
                        // bingo!
                        matches[i] = matches[0];
                        matches[0] = match;
                        break;
                    }
                }
                this._setSelections(matches.map(m => new selection_1.Selection(m.range.startLineNumber, m.range.startColumn, m.range.endLineNumber, m.range.endColumn)));
            }
        }
        selectAllUsingSelections(selections) {
            if (selections.length > 0) {
                this._setSelections(selections);
            }
        }
    }
    exports.MultiCursorSelectionController = MultiCursorSelectionController;
    class MultiCursorSelectionControllerAction extends editorExtensions_1.EditorAction {
        run(accessor, editor) {
            const multiCursorController = MultiCursorSelectionController.get(editor);
            if (!multiCursorController) {
                return;
            }
            const viewModel = editor._getViewModel();
            if (viewModel) {
                const previousCursorState = viewModel.getCursorStates();
                const findController = findController_1.CommonFindController.get(editor);
                if (findController) {
                    this._run(multiCursorController, findController);
                }
                else {
                    const newFindController = accessor.get(instantiation_1.IInstantiationService).createInstance(findController_1.CommonFindController, editor);
                    this._run(multiCursorController, newFindController);
                    newFindController.dispose();
                }
                announceCursorChange(previousCursorState, viewModel.getCursorStates());
            }
        }
    }
    exports.MultiCursorSelectionControllerAction = MultiCursorSelectionControllerAction;
    class AddSelectionToNextFindMatchAction extends MultiCursorSelectionControllerAction {
        constructor() {
            super({
                id: 'editor.action.addSelectionToNextFindMatch',
                label: nls.localize('addSelectionToNextFindMatch', "Add Selection To Next Find Match"),
                alias: 'Add Selection To Next Find Match',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 34 /* KeyCode.KeyD */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize({ key: 'miAddSelectionToNextFindMatch', comment: ['&& denotes a mnemonic'] }, "Add &&Next Occurrence"),
                    order: 5
                }
            });
        }
        _run(multiCursorController, findController) {
            multiCursorController.addSelectionToNextFindMatch(findController);
        }
    }
    exports.AddSelectionToNextFindMatchAction = AddSelectionToNextFindMatchAction;
    class AddSelectionToPreviousFindMatchAction extends MultiCursorSelectionControllerAction {
        constructor() {
            super({
                id: 'editor.action.addSelectionToPreviousFindMatch',
                label: nls.localize('addSelectionToPreviousFindMatch', "Add Selection To Previous Find Match"),
                alias: 'Add Selection To Previous Find Match',
                precondition: undefined,
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize({ key: 'miAddSelectionToPreviousFindMatch', comment: ['&& denotes a mnemonic'] }, "Add P&&revious Occurrence"),
                    order: 6
                }
            });
        }
        _run(multiCursorController, findController) {
            multiCursorController.addSelectionToPreviousFindMatch(findController);
        }
    }
    exports.AddSelectionToPreviousFindMatchAction = AddSelectionToPreviousFindMatchAction;
    class MoveSelectionToNextFindMatchAction extends MultiCursorSelectionControllerAction {
        constructor() {
            super({
                id: 'editor.action.moveSelectionToNextFindMatch',
                label: nls.localize('moveSelectionToNextFindMatch', "Move Last Selection To Next Find Match"),
                alias: 'Move Last Selection To Next Find Match',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 34 /* KeyCode.KeyD */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _run(multiCursorController, findController) {
            multiCursorController.moveSelectionToNextFindMatch(findController);
        }
    }
    exports.MoveSelectionToNextFindMatchAction = MoveSelectionToNextFindMatchAction;
    class MoveSelectionToPreviousFindMatchAction extends MultiCursorSelectionControllerAction {
        constructor() {
            super({
                id: 'editor.action.moveSelectionToPreviousFindMatch',
                label: nls.localize('moveSelectionToPreviousFindMatch', "Move Last Selection To Previous Find Match"),
                alias: 'Move Last Selection To Previous Find Match',
                precondition: undefined
            });
        }
        _run(multiCursorController, findController) {
            multiCursorController.moveSelectionToPreviousFindMatch(findController);
        }
    }
    exports.MoveSelectionToPreviousFindMatchAction = MoveSelectionToPreviousFindMatchAction;
    class SelectHighlightsAction extends MultiCursorSelectionControllerAction {
        constructor() {
            super({
                id: 'editor.action.selectHighlights',
                label: nls.localize('selectAllOccurrencesOfFindMatch', "Select All Occurrences of Find Match"),
                alias: 'Select All Occurrences of Find Match',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 42 /* KeyCode.KeyL */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize({ key: 'miSelectHighlights', comment: ['&& denotes a mnemonic'] }, "Select All &&Occurrences"),
                    order: 7
                }
            });
        }
        _run(multiCursorController, findController) {
            multiCursorController.selectAll(findController);
        }
    }
    exports.SelectHighlightsAction = SelectHighlightsAction;
    class CompatChangeAll extends MultiCursorSelectionControllerAction {
        constructor() {
            super({
                id: 'editor.action.changeAll',
                label: nls.localize('changeAll.label', "Change All Occurrences"),
                alias: 'Change All Occurrences',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 60 /* KeyCode.F2 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.2
                }
            });
        }
        _run(multiCursorController, findController) {
            multiCursorController.selectAll(findController);
        }
    }
    exports.CompatChangeAll = CompatChangeAll;
    class SelectionHighlighterState {
        constructor(_model, _searchText, _matchCase, _wordSeparators, prevState) {
            this._model = _model;
            this._searchText = _searchText;
            this._matchCase = _matchCase;
            this._wordSeparators = _wordSeparators;
            this._modelVersionId = this._model.getVersionId();
            this._cachedFindMatches = null;
            if (prevState
                && this._model === prevState._model
                && this._searchText === prevState._searchText
                && this._matchCase === prevState._matchCase
                && this._wordSeparators === prevState._wordSeparators
                && this._modelVersionId === prevState._modelVersionId) {
                this._cachedFindMatches = prevState._cachedFindMatches;
            }
        }
        findMatches() {
            if (this._cachedFindMatches === null) {
                this._cachedFindMatches = this._model.findMatches(this._searchText, true, false, this._matchCase, this._wordSeparators, false).map(m => m.range);
                this._cachedFindMatches.sort(range_1.Range.compareRangesUsingStarts);
            }
            return this._cachedFindMatches;
        }
    }
    let SelectionHighlighter = class SelectionHighlighter extends lifecycle_1.Disposable {
        static { SelectionHighlighter_1 = this; }
        static { this.ID = 'editor.contrib.selectionHighlighter'; }
        constructor(editor, _languageFeaturesService) {
            super();
            this._languageFeaturesService = _languageFeaturesService;
            this.editor = editor;
            this._isEnabled = editor.getOption(107 /* EditorOption.selectionHighlight */);
            this._decorations = editor.createDecorationsCollection();
            this.updateSoon = this._register(new async_1.RunOnceScheduler(() => this._update(), 300));
            this.state = null;
            this._register(editor.onDidChangeConfiguration((e) => {
                this._isEnabled = editor.getOption(107 /* EditorOption.selectionHighlight */);
            }));
            this._register(editor.onDidChangeCursorSelection((e) => {
                if (!this._isEnabled) {
                    // Early exit if nothing needs to be done!
                    // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                    return;
                }
                if (e.selection.isEmpty()) {
                    if (e.reason === 3 /* CursorChangeReason.Explicit */) {
                        if (this.state) {
                            // no longer valid
                            this._setState(null);
                        }
                        this.updateSoon.schedule();
                    }
                    else {
                        this._setState(null);
                    }
                }
                else {
                    this._update();
                }
            }));
            this._register(editor.onDidChangeModel((e) => {
                this._setState(null);
            }));
            this._register(editor.onDidChangeModelContent((e) => {
                if (this._isEnabled) {
                    this.updateSoon.schedule();
                }
            }));
            const findController = findController_1.CommonFindController.get(editor);
            if (findController) {
                this._register(findController.getState().onFindReplaceStateChange((e) => {
                    this._update();
                }));
            }
            this.updateSoon.schedule();
        }
        _update() {
            this._setState(SelectionHighlighter_1._createState(this.state, this._isEnabled, this.editor));
        }
        static _createState(oldState, isEnabled, editor) {
            if (!isEnabled) {
                return null;
            }
            if (!editor.hasModel()) {
                return null;
            }
            const s = editor.getSelection();
            if (s.startLineNumber !== s.endLineNumber) {
                // multiline forbidden for perf reasons
                return null;
            }
            const multiCursorController = MultiCursorSelectionController.get(editor);
            if (!multiCursorController) {
                return null;
            }
            const findController = findController_1.CommonFindController.get(editor);
            if (!findController) {
                return null;
            }
            let r = multiCursorController.getSession(findController);
            if (!r) {
                const allSelections = editor.getSelections();
                if (allSelections.length > 1) {
                    const findState = findController.getState();
                    const matchCase = findState.matchCase;
                    const selectionsContainSameText = modelRangesContainSameText(editor.getModel(), allSelections, matchCase);
                    if (!selectionsContainSameText) {
                        return null;
                    }
                }
                r = MultiCursorSession.create(editor, findController);
            }
            if (!r) {
                return null;
            }
            if (r.currentMatch) {
                // This is an empty selection
                // Do not interfere with semantic word highlighting in the no selection case
                return null;
            }
            if (/^[ \t]+$/.test(r.searchText)) {
                // whitespace only selection
                return null;
            }
            if (r.searchText.length > 200) {
                // very long selection
                return null;
            }
            // TODO: better handling of this case
            const findState = findController.getState();
            const caseSensitive = findState.matchCase;
            // Return early if the find widget shows the exact same matches
            if (findState.isRevealed) {
                let findStateSearchString = findState.searchString;
                if (!caseSensitive) {
                    findStateSearchString = findStateSearchString.toLowerCase();
                }
                let mySearchString = r.searchText;
                if (!caseSensitive) {
                    mySearchString = mySearchString.toLowerCase();
                }
                if (findStateSearchString === mySearchString && r.matchCase === findState.matchCase && r.wholeWord === findState.wholeWord && !findState.isRegex) {
                    return null;
                }
            }
            return new SelectionHighlighterState(editor.getModel(), r.searchText, r.matchCase, r.wholeWord ? editor.getOption(129 /* EditorOption.wordSeparators */) : null, oldState);
        }
        _setState(newState) {
            this.state = newState;
            if (!this.state) {
                this._decorations.clear();
                return;
            }
            if (!this.editor.hasModel()) {
                return;
            }
            const model = this.editor.getModel();
            if (model.isTooLargeForTokenization()) {
                // the file is too large, so searching word under cursor in the whole document would be blocking the UI.
                return;
            }
            const allMatches = this.state.findMatches();
            const selections = this.editor.getSelections();
            selections.sort(range_1.Range.compareRangesUsingStarts);
            // do not overlap with selection (issue #64 and #512)
            const matches = [];
            for (let i = 0, j = 0, len = allMatches.length, lenJ = selections.length; i < len;) {
                const match = allMatches[i];
                if (j >= lenJ) {
                    // finished all editor selections
                    matches.push(match);
                    i++;
                }
                else {
                    const cmp = range_1.Range.compareRangesUsingStarts(match, selections[j]);
                    if (cmp < 0) {
                        // match is before sel
                        if (selections[j].isEmpty() || !range_1.Range.areIntersecting(match, selections[j])) {
                            matches.push(match);
                        }
                        i++;
                    }
                    else if (cmp > 0) {
                        // sel is before match
                        j++;
                    }
                    else {
                        // sel is equal to match
                        i++;
                        j++;
                    }
                }
            }
            const hasSemanticHighlights = this._languageFeaturesService.documentHighlightProvider.has(model) && this.editor.getOption(80 /* EditorOption.occurrencesHighlight */);
            const decorations = matches.map(r => {
                return {
                    range: r,
                    options: (0, highlightDecorations_1.getSelectionHighlightDecorationOptions)(hasSemanticHighlights)
                };
            });
            this._decorations.set(decorations);
        }
        dispose() {
            this._setState(null);
            super.dispose();
        }
    };
    exports.SelectionHighlighter = SelectionHighlighter;
    exports.SelectionHighlighter = SelectionHighlighter = SelectionHighlighter_1 = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService)
    ], SelectionHighlighter);
    function modelRangesContainSameText(model, ranges, matchCase) {
        const selectedText = getValueInRange(model, ranges[0], !matchCase);
        for (let i = 1, len = ranges.length; i < len; i++) {
            const range = ranges[i];
            if (range.isEmpty()) {
                return false;
            }
            const thisSelectedText = getValueInRange(model, range, !matchCase);
            if (selectedText !== thisSelectedText) {
                return false;
            }
        }
        return true;
    }
    function getValueInRange(model, range, toLowerCase) {
        const text = model.getValueInRange(range);
        return (toLowerCase ? text.toLowerCase() : text);
    }
    class FocusNextCursor extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.focusNextCursor',
                label: nls.localize('mutlicursor.focusNextCursor', "Focus Next Cursor"),
                description: {
                    description: nls.localize('mutlicursor.focusNextCursor.description', "Focuses the next cursor"),
                    args: [],
                },
                alias: 'Focus Next Cursor',
                precondition: undefined
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const viewModel = editor._getViewModel();
            if (viewModel.cursorConfig.readOnly) {
                return;
            }
            viewModel.model.pushStackElement();
            const previousCursorState = Array.from(viewModel.getCursorStates());
            const firstCursor = previousCursorState.shift();
            if (!firstCursor) {
                return;
            }
            previousCursorState.push(firstCursor);
            viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, previousCursorState);
            viewModel.revealPrimaryCursor(args.source, true);
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    exports.FocusNextCursor = FocusNextCursor;
    class FocusPreviousCursor extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.focusPreviousCursor',
                label: nls.localize('mutlicursor.focusPreviousCursor', "Focus Previous Cursor"),
                description: {
                    description: nls.localize('mutlicursor.focusPreviousCursor.description', "Focuses the previous cursor"),
                    args: [],
                },
                alias: 'Focus Previous Cursor',
                precondition: undefined
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const viewModel = editor._getViewModel();
            if (viewModel.cursorConfig.readOnly) {
                return;
            }
            viewModel.model.pushStackElement();
            const previousCursorState = Array.from(viewModel.getCursorStates());
            const firstCursor = previousCursorState.pop();
            if (!firstCursor) {
                return;
            }
            previousCursorState.unshift(firstCursor);
            viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, previousCursorState);
            viewModel.revealPrimaryCursor(args.source, true);
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    exports.FocusPreviousCursor = FocusPreviousCursor;
    (0, editorExtensions_1.registerEditorContribution)(MultiCursorSelectionController.ID, MultiCursorSelectionController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.registerEditorContribution)(SelectionHighlighter.ID, SelectionHighlighter, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.registerEditorAction)(InsertCursorAbove);
    (0, editorExtensions_1.registerEditorAction)(InsertCursorBelow);
    (0, editorExtensions_1.registerEditorAction)(InsertCursorAtEndOfEachLineSelected);
    (0, editorExtensions_1.registerEditorAction)(AddSelectionToNextFindMatchAction);
    (0, editorExtensions_1.registerEditorAction)(AddSelectionToPreviousFindMatchAction);
    (0, editorExtensions_1.registerEditorAction)(MoveSelectionToNextFindMatchAction);
    (0, editorExtensions_1.registerEditorAction)(MoveSelectionToPreviousFindMatchAction);
    (0, editorExtensions_1.registerEditorAction)(SelectHighlightsAction);
    (0, editorExtensions_1.registerEditorAction)(CompatChangeAll);
    (0, editorExtensions_1.registerEditorAction)(InsertCursorAtEndOfLineSelected);
    (0, editorExtensions_1.registerEditorAction)(InsertCursorAtTopOfLineSelected);
    (0, editorExtensions_1.registerEditorAction)(FocusNextCursor);
    (0, editorExtensions_1.registerEditorAction)(FocusPreviousCursor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGljdXJzb3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9tdWx0aWN1cnNvci9icm93c2VyL211bHRpY3Vyc29yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE0QmhHLFNBQVMsb0JBQW9CLENBQUMsbUJBQWtDLEVBQUUsV0FBMEI7UUFDM0YsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUYsSUFBSSxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUMzQixNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0ksTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLG1CQUFtQixFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxvQkFBb0IsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUM5SyxJQUFBLGFBQU0sRUFBQyxHQUFHLENBQUMsQ0FBQztTQUNaO0lBQ0YsQ0FBQztJQUVELE1BQWEsaUJBQWtCLFNBQVEsK0JBQVk7UUFFbEQ7WUFDQyxLQUFLLENB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