/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/common/commands/replaceCommand", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/model/textModelSearch", "vs/editor/contrib/find/browser/findDecorations", "vs/editor/contrib/find/browser/replaceAllCommand", "vs/editor/contrib/find/browser/replacePattern", "vs/platform/contextkey/common/contextkey"], function (require, exports, arraysFind_1, async_1, lifecycle_1, replaceCommand_1, position_1, range_1, selection_1, textModelSearch_1, findDecorations_1, replaceAllCommand_1, replacePattern_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FindModelBoundToEditorModel = exports.MATCHES_LIMIT = exports.FIND_IDS = exports.TogglePreserveCaseKeybinding = exports.ToggleSearchScopeKeybinding = exports.ToggleRegexKeybinding = exports.ToggleWholeWordKeybinding = exports.ToggleCaseSensitiveKeybinding = exports.CONTEXT_REPLACE_INPUT_FOCUSED = exports.CONTEXT_FIND_INPUT_FOCUSED = exports.CONTEXT_FIND_WIDGET_NOT_VISIBLE = exports.CONTEXT_FIND_WIDGET_VISIBLE = void 0;
    exports.CONTEXT_FIND_WIDGET_VISIBLE = new contextkey_1.RawContextKey('findWidgetVisible', false);
    exports.CONTEXT_FIND_WIDGET_NOT_VISIBLE = exports.CONTEXT_FIND_WIDGET_VISIBLE.toNegated();
    // Keep ContextKey use of 'Focussed' to not break when clauses
    exports.CONTEXT_FIND_INPUT_FOCUSED = new contextkey_1.RawContextKey('findInputFocussed', false);
    exports.CONTEXT_REPLACE_INPUT_FOCUSED = new contextkey_1.RawContextKey('replaceInputFocussed', false);
    exports.ToggleCaseSensitiveKeybinding = {
        primary: 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */ }
    };
    exports.ToggleWholeWordKeybinding = {
        primary: 512 /* KeyMod.Alt */ | 53 /* KeyCode.KeyW */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 53 /* KeyCode.KeyW */ }
    };
    exports.ToggleRegexKeybinding = {
        primary: 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */ }
    };
    exports.ToggleSearchScopeKeybinding = {
        primary: 512 /* KeyMod.Alt */ | 42 /* KeyCode.KeyL */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 42 /* KeyCode.KeyL */ }
    };
    exports.TogglePreserveCaseKeybinding = {
        primary: 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */ }
    };
    exports.FIND_IDS = {
        StartFindAction: 'actions.find',
        StartFindWithSelection: 'actions.findWithSelection',
        StartFindWithArgs: 'editor.actions.findWithArgs',
        NextMatchFindAction: 'editor.action.nextMatchFindAction',
        PreviousMatchFindAction: 'editor.action.previousMatchFindAction',
        GoToMatchFindAction: 'editor.action.goToMatchFindAction',
        NextSelectionMatchFindAction: 'editor.action.nextSelectionMatchFindAction',
        PreviousSelectionMatchFindAction: 'editor.action.previousSelectionMatchFindAction',
        StartFindReplaceAction: 'editor.action.startFindReplaceAction',
        CloseFindWidgetCommand: 'closeFindWidget',
        ToggleCaseSensitiveCommand: 'toggleFindCaseSensitive',
        ToggleWholeWordCommand: 'toggleFindWholeWord',
        ToggleRegexCommand: 'toggleFindRegex',
        ToggleSearchScopeCommand: 'toggleFindInSelection',
        TogglePreserveCaseCommand: 'togglePreserveCase',
        ReplaceOneAction: 'editor.action.replaceOne',
        ReplaceAllAction: 'editor.action.replaceAll',
        SelectAllMatchesAction: 'editor.action.selectAllMatches'
    };
    exports.MATCHES_LIMIT = 19999;
    const RESEARCH_DELAY = 240;
    class FindModelBoundToEditorModel {
        constructor(editor, state) {
            this._toDispose = new lifecycle_1.DisposableStore();
            this._editor = editor;
            this._state = state;
            this._isDisposed = false;
            this._startSearchingTimer = new async_1.TimeoutTimer();
            this._decorations = new findDecorations_1.FindDecorations(editor);
            this._toDispose.add(this._decorations);
            this._updateDecorationsScheduler = new async_1.RunOnceScheduler(() => this.research(false), 100);
            this._toDispose.add(this._updateDecorationsScheduler);
            this._toDispose.add(this._editor.onDidChangeCursorPosition((e) => {
                if (e.reason === 3 /* CursorChangeReason.Explicit */
                    || e.reason === 5 /* CursorChangeReason.Undo */
                    || e.reason === 6 /* CursorChangeReason.Redo */) {
                    this._decorations.setStartPosition(this._editor.getPosition());
                }
            }));
            this._ignoreModelContentChanged = false;
            this._toDispose.add(this._editor.onDidChangeModelContent((e) => {
                if (this._ignoreModelContentChanged) {
                    return;
                }
                if (e.isFlush) {
                    // a model.setValue() was called
                    this._decorations.reset();
                }
                this._decorations.setStartPosition(this._editor.getPosition());
                this._updateDecorationsScheduler.schedule();
            }));
            this._toDispose.add(this._state.onFindReplaceStateChange((e) => this._onStateChanged(e)));
            this.research(false, this._state.searchScope);
        }
        dispose() {
            this._isDisposed = true;
            (0, lifecycle_1.dispose)(this._startSearchingTimer);
            this._toDispose.dispose();
        }
        _onStateChanged(e) {
            if (this._isDisposed) {
                // The find model is disposed during a find state changed event
                return;
            }
            if (!this._editor.hasModel()) {
                // The find model will be disposed momentarily
                return;
            }
            if (e.searchString || e.isReplaceRevealed || e.isRegex || e.wholeWord || e.matchCase || e.searchScope) {
                const model = this._editor.getModel();
                if (model.isTooLargeForSyncing()) {
                    this._startSearchingTimer.cancel();
                    this._startSearchingTimer.setIfNotSet(() => {
                        if (e.searchScope) {
                            this.research(e.moveCursor, this._state.searchScope);
                        }
                        else {
                            this.research(e.moveCursor);
                        }
                    }, RESEARCH_DELAY);
                }
                else {
                    if (e.searchScope) {
                        this.research(e.moveCursor, this._state.searchScope);
                    }
                    else {
                        this.research(e.moveCursor);
                    }
                }
            }
        }
        static _getSearchRange(model, findScope) {
            // If we have set now or before a find scope, use it for computing the search range
            if (findScope) {
                return findScope;
            }
            return model.getFullModelRange();
        }
        research(moveCursor, newFindScope) {
            let findScopes = null;
            if (typeof newFindScope !== 'undefined') {
                if (newFindScope !== null) {
                    if (!Array.isArray(newFindScope)) {
                        findScopes = [newFindScope];
                    }
                    else {
                        findScopes = newFindScope;
                    }
                }
            }
            else {
                findScopes = this._decorations.getFindScopes();
            }
            if (findScopes !== null) {
                findScopes = findScopes.map(findScope => {
                    if (findScope.startLineNumber !== findScope.endLineNumber) {
                        let endLineNumber = findScope.endLineNumber;
                        if (findScope.endColumn === 1) {
                            endLineNumber = endLineNumber - 1;
                        }
                        return new range_1.Range(findScope.startLineNumber, 1, endLineNumber, this._editor.getModel().getLineMaxColumn(endLineNumber));
                    }
                    return findScope;
                });
            }
            const findMatches = this._findMatches(findScopes, false, exports.MATCHES_LIMIT);
            this._decorations.set(findMatches, findScopes);
            const editorSelection = this._editor.getSelection();
            let currentMatchesPosition = this._decorations.getCurrentMatchesPosition(editorSelection);
            if (currentMatchesPosition === 0 && findMatches.length > 0) {
                // current selection is not on top of a match
                // try to find its nearest result from the top of the document
                const matchAfterSelection = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(findMatches.map(match => match.range), range => range_1.Range.compareRangesUsingStarts(range, editorSelection) >= 0);
                currentMatchesPosition = matchAfterSelection > 0 ? matchAfterSelection - 1 + 1 /** match position is one based */ : currentMatchesPosition;
            }
            this._state.changeMatchInfo(currentMatchesPosition, this._decorations.getCount(), undefined);
            if (moveCursor && this._editor.getOption(41 /* EditorOption.find */).cursorMoveOnType) {
                this._moveToNextMatch(this._decorations.getStartPosition());
            }
        }
        _hasMatches() {
            return (this._state.matchesCount > 0);
        }
        _cannotFind() {
            if (!this._hasMatches()) {
                const findScope = this._decorations.getFindScope();
                if (findScope) {
                    // Reveal the selection so user is reminded that 'selection find' is on.
                    this._editor.revealRangeInCenterIfOutsideViewport(findScope, 0 /* ScrollType.Smooth */);
                }
                return true;
            }
            return false;
        }
        _setCurrentFindMatch(match) {
            const matchesPosition = this._decorations.setCurrentFindMatch(match);
            this._state.changeMatchInfo(matchesPosition, this._decorations.getCount(), match);
            this._editor.setSelection(match);
            this._editor.revealRangeInCenterIfOutsideViewport(match, 0 /* ScrollType.Smooth */);
        }
        _prevSearchPosition(before) {
            const isUsingLineStops = this._state.isRegex && (this._state.searchString.indexOf('^') >= 0
                || this._state.searchString.indexOf('$') >= 0);
            let { lineNumber, column } = before;
            const model = this._editor.getModel();
            if (isUsingLineStops || column === 1) {
                if (lineNumber === 1) {
                    lineNumber = model.getLineCount();
                }
                else {
                    lineNumber--;
                }
                column = model.getLineMaxColumn(lineNumber);
            }
            else {
                column--;
            }
            return new position_1.Position(lineNumber, column);
        }
        _moveToPrevMatch(before, isRecursed = false) {
            if (!this._state.canNavigateBack()) {
                // we are beyond the first matched find result
                // instead of doing nothing, we should refocus the first item
                const nextMatchRange = this._decorations.matchAfterPosition(before);
                if (nextMatchRange) {
                    this._setCurrentFindMatch(nextMatchRange);
                }
                return;
            }
            if (this._decorations.getCount() < exports.MATCHES_LIMIT) {
                let prevMatchRange = this._decorations.matchBeforePosition(before);
                if (prevMatchRange && prevMatchRange.isEmpty() && prevMatchRange.getStartPosition().equals(before)) {
                    before = this._prevSearchPosition(before);
                    prevMatchRange = this._decorations.matchBeforePosition(before);
                }
                if (prevMatchRange) {
                    this._setCurrentFindMatch(prevMatchRange);
                }
                return;
            }
            if (this._cannotFind()) {
                return;
            }
            const findScope = this._decorations.getFindScope();
            const searchRange = FindModelBoundToEditorModel._getSearchRange(this._editor.getModel(), findScope);
            // ...(----)...|...
            if (searchRange.getEndPosition().isBefore(before)) {
                before = searchRange.getEndPosition();
            }
            // ...|...(----)...
            if (before.isBefore(searchRange.getStartPosition())) {
                before = searchRange.getEndPosition();
            }
            const { lineNumber, column } = before;
            const model = this._editor.getModel();
            let position = new position_1.Position(lineNumber, column);
            let prevMatch = model.findPreviousMatch(this._state.searchString, position, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, false);
            if (prevMatch && prevMatch.range.isEmpty() && prevMatch.range.getStartPosition().equals(position)) {
                // Looks like we're stuck at this position, unacceptable!
                position = this._prevSearchPosition(position);
                prevMatch = model.findPreviousMatch(this._state.searchString, position, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, false);
            }
            if (!prevMatch) {
                // there is precisely one match and selection is on top of it
                return;
            }
            if (!isRecursed && !searchRange.containsRange(prevMatch.range)) {
                return this._moveToPrevMatch(prevMatch.range.getStartPosition(), true);
            }
            this._setCurrentFindMatch(prevMatch.range);
        }
        moveToPrevMatch() {
            this._moveToPrevMatch(this._editor.getSelection().getStartPosition());
        }
        _nextSearchPosition(after) {
            const isUsingLineStops = this._state.isRegex && (this._state.searchString.indexOf('^') >= 0
                || this._state.searchString.indexOf('$') >= 0);
            let { lineNumber, column } = after;
            const model = this._editor.getModel();
            if (isUsingLineStops || column === model.getLineMaxColumn(lineNumber)) {
                if (lineNumber === model.getLineCount()) {
                    lineNumber = 1;
                }
                else {
                    lineNumber++;
                }
                column = 1;
            }
            else {
                column++;
            }
            return new position_1.Position(lineNumber, column);
        }
        _moveToNextMatch(after) {
            if (!this._state.canNavigateForward()) {
                // we are beyond the last matched find result
                // instead of doing nothing, we should refocus the last item
                const prevMatchRange = this._decorations.matchBeforePosition(after);
                if (prevMatchRange) {
                    this._setCurrentFindMatch(prevMatchRange);
                }
                return;
            }
            if (this._decorations.getCount() < exports.MATCHES_LIMIT) {
                let nextMatchRange = this._decorations.matchAfterPosition(after);
                if (nextMatchRange && nextMatchRange.isEmpty() && nextMatchRange.getStartPosition().equals(after)) {
                    // Looks like we're stuck at this position, unacceptable!
                    after = this._nextSearchPosition(after);
                    nextMatchRange = this._decorations.matchAfterPosition(after);
                }
                if (nextMatchRange) {
                    this._setCurrentFindMatch(nextMatchRange);
                }
                return;
            }
            const nextMatch = this._getNextMatch(after, false, true);
            if (nextMatch) {
                this._setCurrentFindMatch(nextMatch.range);
            }
        }
        _getNextMatch(after, captureMatches, forceMove, isRecursed = false) {
            if (this._cannotFind()) {
                return null;
            }
            const findScope = this._decorations.getFindScope();
            const searchRange = FindModelBoundToEditorModel._getSearchRange(this._editor.getModel(), findScope);
            // ...(----)...|...
            if (searchRange.getEndPosition().isBefore(after)) {
                after = searchRange.getStartPosition();
            }
            // ...|...(----)...
            if (after.isBefore(searchRange.getStartPosition())) {
                after = searchRange.getStartPosition();
            }
            const { lineNumber, column } = after;
            const model = this._editor.getModel();
            let position = new position_1.Position(lineNumber, column);
            let nextMatch = model.findNextMatch(this._state.searchString, position, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, captureMatches);
            if (forceMove && nextMatch && nextMatch.range.isEmpty() && nextMatch.range.getStartPosition().equals(position)) {
                // Looks like we're stuck at this position, unacceptable!
                position = this._nextSearchPosition(position);
                nextMatch = model.findNextMatch(this._state.searchString, position, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, captureMatches);
            }
            if (!nextMatch) {
                // there is precisely one match and selection is on top of it
                return null;
            }
            if (!isRecursed && !searchRange.containsRange(nextMatch.range)) {
                return this._getNextMatch(nextMatch.range.getEndPosition(), captureMatches, forceMove, true);
            }
            return nextMatch;
        }
        moveToNextMatch() {
            this._moveToNextMatch(this._editor.getSelection().getEndPosition());
        }
        _moveToMatch(index) {
            const decorationRange = this._decorations.getDecorationRangeAt(index);
            if (decorationRange) {
                this._setCurrentFindMatch(decorationRange);
            }
        }
        moveToMatch(index) {
            this._moveToMatch(index);
        }
        _getReplacePattern() {
            if (this._state.isRegex) {
                return (0, replacePattern_1.parseReplaceString)(this._state.replaceString);
            }
            return replacePattern_1.ReplacePattern.fromStaticValue(this._state.replaceString);
        }
        replace() {
            if (!this._hasMatches()) {
                return;
            }
            const replacePattern = this._getReplacePattern();
            const selection = this._editor.getSelection();
            const nextMatch = this._getNextMatch(selection.getStartPosition(), true, false);
            if (nextMatch) {
                if (selection.equalsRange(nextMatch.range)) {
                    // selection sits on a find match => replace it!
                    const replaceString = replacePattern.buildReplaceString(nextMatch.matches, this._state.preserveCase);
                    const command = new replaceCommand_1.ReplaceCommand(selection, replaceString);
                    this._executeEditorCommand('replace', command);
                    this._decorations.setStartPosition(new position_1.Position(selection.startLineNumber, selection.startColumn + replaceString.length));
                    this.research(true);
                }
                else {
                    this._decorations.setStartPosition(this._editor.getPosition());
                    this._setCurrentFindMatch(nextMatch.range);
                }
            }
        }
        _findMatches(findScopes, captureMatches, limitResultCount) {
            const searchRanges = (findScopes || [null]).map((scope) => FindModelBoundToEditorModel._getSearchRange(this._editor.getModel(), scope));
            return this._editor.getModel().findMatches(this._state.searchString, searchRanges, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null, captureMatches, limitResultCount);
        }
        replaceAll() {
            if (!this._hasMatches()) {
                return;
            }
            const findScopes = this._decorations.getFindScopes();
            if (findScopes === null && this._state.matchesCount >= exports.MATCHES_LIMIT) {
                // Doing a replace on the entire file that is over ${MATCHES_LIMIT} matches
                this._largeReplaceAll();
            }
            else {
                this._regularReplaceAll(findScopes);
            }
            this.research(false);
        }
        _largeReplaceAll() {
            const searchParams = new textModelSearch_1.SearchParams(this._state.searchString, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(129 /* EditorOption.wordSeparators */) : null);
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return;
            }
            let searchRegex = searchData.regex;
            if (!searchRegex.multiline) {
                let mod = 'mu';
                if (searchRegex.ignoreCase) {
                    mod += 'i';
                }
                if (searchRegex.global) {
                    mod += 'g';
                }
                searchRegex = new RegExp(searchRegex.source, mod);
            }
            const model = this._editor.getModel();
            const modelText = model.getValue(1 /* EndOfLinePreference.LF */);
            const fullModelRange = model.getFullModelRange();
            const replacePattern = this._getReplacePattern();
            let resultText;
            const preserveCase = this._state.preserveCase;
            if (replacePattern.hasReplacementPatterns || preserveCase) {
                resultText = modelText.replace(searchRegex, function () {
                    return replacePattern.buildReplaceString(arguments, preserveCase);
                });
            }
            else {
                resultText = modelText.replace(searchRegex, replacePattern.buildReplaceString(null, preserveCase));
            }
            const command = new replaceCommand_1.ReplaceCommandThatPreservesSelection(fullModelRange, resultText, this._editor.getSelection());
            this._executeEditorCommand('replaceAll', command);
        }
        _regularReplaceAll(findScopes) {
            const replacePattern = this._getReplacePattern();
            // Get all the ranges (even more than the highlighted ones)
            const matches = this._findMatches(findScopes, replacePattern.hasReplacementPatterns || this._state.preserveCase, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
            const replaceStrings = [];
            for (let i = 0, len = matches.length; i < len; i++) {
                replaceStrings[i] = replacePattern.buildReplaceString(matches[i].matches, this._state.preserveCase);
            }
            const command = new replaceAllCommand_1.ReplaceAllCommand(this._editor.getSelection(), matches.map(m => m.range), replaceStrings);
            this._executeEditorCommand('replaceAll', command);
        }
        selectAllMatches() {
            if (!this._hasMatches()) {
                return;
            }
            const findScopes = this._decorations.getFindScopes();
            // Get all the ranges (even more than the highlighted ones)
            const matches = this._findMatches(findScopes, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
            let selections = matches.map(m => new selection_1.Selection(m.range.startLineNumber, m.range.startColumn, m.range.endLineNumber, m.range.endColumn));
            // If one of the ranges is the editor selection, then maintain it as primary
            const editorSelection = this._editor.getSelection();
            for (let i = 0, len = selections.length; i < len; i++) {
                const sel = selections[i];
                if (sel.equalsRange(editorSelection)) {
                    selections = [editorSelection].concat(selections.slice(0, i)).concat(selections.slice(i + 1));
                    break;
                }
            }
            this._editor.setSelections(selections);
        }
        _executeEditorCommand(source, command) {
            try {
                this._ignoreModelContentChanged = true;
                this._editor.pushUndoStop();
                this._editor.executeCommand(source, command);
                this._editor.pushUndoStop();
            }
            finally {
                this._ignoreModelContentChanged = false;
            }
        }
    }
    exports.FindModelBoundToEditorModel = FindModelBoundToEditorModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZmluZC9icm93c2VyL2ZpbmRNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3Qm5GLFFBQUEsMkJBQTJCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JGLFFBQUEsK0JBQStCLEdBQUcsbUNBQTJCLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDdkYsOERBQThEO0lBQ2pELFFBQUEsMEJBQTBCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BGLFFBQUEsNkJBQTZCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTFGLFFBQUEsNkJBQTZCLEdBQWlCO1FBQzFELE9BQU8sRUFBRSw0Q0FBeUI7UUFDbEMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLGdEQUEyQix3QkFBZSxFQUFFO0tBQzVELENBQUM7SUFDVyxRQUFBLHlCQUF5QixHQUFpQjtRQUN0RCxPQUFPLEVBQUUsNENBQXlCO1FBQ2xDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxnREFBMkIsd0JBQWUsRUFBRTtLQUM1RCxDQUFDO0lBQ1csUUFBQSxxQkFBcUIsR0FBaUI7UUFDbEQsT0FBTyxFQUFFLDRDQUF5QjtRQUNsQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsZ0RBQTJCLHdCQUFlLEVBQUU7S0FDNUQsQ0FBQztJQUNXLFFBQUEsMkJBQTJCLEdBQWlCO1FBQ3hELE9BQU8sRUFBRSw0Q0FBeUI7UUFDbEMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLGdEQUEyQix3QkFBZSxFQUFFO0tBQzVELENBQUM7SUFDVyxRQUFBLDRCQUE0QixHQUFpQjtRQUN6RCxPQUFPLEVBQUUsNENBQXlCO1FBQ2xDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxnREFBMkIsd0JBQWUsRUFBRTtLQUM1RCxDQUFDO0lBRVcsUUFBQSxRQUFRLEdBQUc7UUFDdkIsZUFBZSxFQUFFLGNBQWM7UUFDL0Isc0JBQXNCLEVBQUUsMkJBQTJCO1FBQ25ELGlCQUFpQixFQUFFLDZCQUE2QjtRQUNoRCxtQkFBbUIsRUFBRSxtQ0FBbUM7UUFDeEQsdUJBQXVCLEVBQUUsdUNBQXVDO1FBQ2hFLG1CQUFtQixFQUFFLG1DQUFtQztRQUN4RCw0QkFBNEIsRUFBRSw0Q0FBNEM7UUFDMUUsZ0NBQWdDLEVBQUUsZ0RBQWdEO1FBQ2xGLHNCQUFzQixFQUFFLHNDQUFzQztRQUM5RCxzQkFBc0IsRUFBRSxpQkFBaUI7UUFDekMsMEJBQTBCLEVBQUUseUJBQXlCO1FBQ3JELHNCQUFzQixFQUFFLHFCQUFxQjtRQUM3QyxrQkFBa0IsRUFBRSxpQkFBaUI7UUFDckMsd0JBQXdCLEVBQUUsdUJBQXVCO1FBQ2pELHlCQUF5QixFQUFFLG9CQUFvQjtRQUMvQyxnQkFBZ0IsRUFBRSwwQkFBMEI7UUFDNUMsZ0JBQWdCLEVBQUUsMEJBQTBCO1FBQzVDLHNCQUFzQixFQUFFLGdDQUFnQztLQUN4RCxDQUFDO0lBRVcsUUFBQSxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBQ25DLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQztJQUUzQixNQUFhLDJCQUEyQjtRQVl2QyxZQUFZLE1BQXlCLEVBQUUsS0FBdUI7WUFSN0MsZUFBVSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBU25ELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLG9CQUFZLEVBQUUsQ0FBQztZQUUvQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksaUNBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFdkMsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksd0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN6RixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBOEIsRUFBRSxFQUFFO2dCQUM3RixJQUNDLENBQUMsQ0FBQyxNQUFNLHdDQUFnQzt1QkFDckMsQ0FBQyxDQUFDLE1BQU0sb0NBQTRCO3VCQUNwQyxDQUFDLENBQUMsTUFBTSxvQ0FBNEIsRUFDdEM7b0JBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7aUJBQy9EO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQywwQkFBMEIsR0FBRyxLQUFLLENBQUM7WUFDeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUM5RCxJQUFJLElBQUksQ0FBQywwQkFBMEIsRUFBRTtvQkFDcEMsT0FBTztpQkFDUDtnQkFDRCxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUU7b0JBQ2QsZ0NBQWdDO29CQUNoQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO2lCQUMxQjtnQkFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzdDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxRixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSxPQUFPO1lBQ2IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDeEIsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVPLGVBQWUsQ0FBQyxDQUErQjtZQUN0RCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JCLCtEQUErRDtnQkFDL0QsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzdCLDhDQUE4QztnQkFDOUMsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFO2dCQUN0RyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUV0QyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO29CQUNqQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBRW5DLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO3dCQUMxQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUU7NEJBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3lCQUNyRDs2QkFBTTs0QkFDTixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQzt5QkFDNUI7b0JBQ0YsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2lCQUNuQjtxQkFBTTtvQkFDTixJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUU7d0JBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3FCQUNyRDt5QkFBTTt3QkFDTixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFDNUI7aUJBQ0Q7YUFDRDtRQUNGLENBQUM7UUFFTyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQWlCLEVBQUUsU0FBdUI7WUFDeEUsbUZBQW1GO1lBQ25GLElBQUksU0FBUyxFQUFFO2dCQUNkLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRU8sUUFBUSxDQUFDLFVBQW1CLEVBQUUsWUFBcUM7WUFDMUUsSUFBSSxVQUFVLEdBQW1CLElBQUksQ0FBQztZQUN0QyxJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRTtnQkFDeEMsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO29CQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTt3QkFDakMsVUFBVSxHQUFHLENBQUMsWUFBcUIsQ0FBQyxDQUFDO3FCQUNyQzt5QkFBTTt3QkFDTixVQUFVLEdBQUcsWUFBWSxDQUFDO3FCQUMxQjtpQkFDRDthQUNEO2lCQUFNO2dCQUNOLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQy9DO1lBQ0QsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO2dCQUN4QixVQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDdkMsSUFBSSxTQUFTLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxhQUFhLEVBQUU7d0JBQzFELElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUM7d0JBRTVDLElBQUksU0FBUyxDQUFDLFNBQVMsS0FBSyxDQUFDLEVBQUU7NEJBQzlCLGFBQWEsR0FBRyxhQUFhLEdBQUcsQ0FBQyxDQUFDO3lCQUNsQzt3QkFFRCxPQUFPLElBQUksYUFBSyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7cUJBQ3ZIO29CQUNELE9BQU8sU0FBUyxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQzthQUNIO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFhLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFL0MsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNwRCxJQUFJLHNCQUFzQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMseUJBQXlCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDMUYsSUFBSSxzQkFBc0IsS0FBSyxDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzNELDZDQUE2QztnQkFDN0MsOERBQThEO2dCQUM5RCxNQUFNLG1CQUFtQixHQUFHLElBQUEsMkNBQThCLEVBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLGFBQUssQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3hLLHNCQUFzQixHQUFHLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUM7YUFDM0k7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FDMUIsc0JBQXNCLEVBQ3RCLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQzVCLFNBQVMsQ0FDVCxDQUFDO1lBRUYsSUFBSSxVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLGdCQUFnQixFQUFFO2dCQUM3RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7YUFDNUQ7UUFDRixDQUFDO1FBRU8sV0FBVztZQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVPLFdBQVc7WUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDeEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDbkQsSUFBSSxTQUFTLEVBQUU7b0JBQ2Qsd0VBQXdFO29CQUN4RSxJQUFJLENBQUMsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLFNBQVMsNEJBQW9CLENBQUM7aUJBQ2hGO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxLQUFZO1lBQ3hDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQzFCLGVBQWUsRUFDZixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxFQUM1QixLQUFLLENBQ0wsQ0FBQztZQUVGLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsS0FBSyw0QkFBb0IsQ0FBQztRQUM3RSxDQUFDO1FBRU8sbUJBQW1CLENBQUMsTUFBZ0I7WUFDM0MsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQzttQkFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FDN0MsQ0FBQztZQUNGLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBQ3BDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFdEMsSUFBSSxnQkFBZ0IsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNyQyxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUU7b0JBQ3JCLFVBQVUsR0FBRyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7aUJBQ2xDO3FCQUFNO29CQUNOLFVBQVUsRUFBRSxDQUFDO2lCQUNiO2dCQUNELE1BQU0sR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDNUM7aUJBQU07Z0JBQ04sTUFBTSxFQUFFLENBQUM7YUFDVDtZQUVELE9BQU8sSUFBSSxtQkFBUSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRU8sZ0JBQWdCLENBQUMsTUFBZ0IsRUFBRSxhQUFzQixLQUFLO1lBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFO2dCQUNuQyw4Q0FBOEM7Z0JBQzlDLDZEQUE2RDtnQkFDN0QsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFcEUsSUFBSSxjQUFjLEVBQUU7b0JBQ25CLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztpQkFDMUM7Z0JBQ0QsT0FBTzthQUNQO1lBQ0QsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxHQUFHLHFCQUFhLEVBQUU7Z0JBQ2pELElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRW5FLElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ25HLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzFDLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUMvRDtnQkFFRCxJQUFJLGNBQWMsRUFBRTtvQkFDbkIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDO2lCQUMxQztnQkFFRCxPQUFPO2FBQ1A7WUFFRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDdkIsT0FBTzthQUNQO1lBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNuRCxNQUFNLFdBQVcsR0FBRywyQkFBMkIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVwRyxtQkFBbUI7WUFDbkIsSUFBSSxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNsRCxNQUFNLEdBQUcsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQ3RDO1lBRUQsbUJBQW1CO1lBQ25CLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFO2dCQUNwRCxNQUFNLEdBQUcsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQ3RDO1lBRUQsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUM7WUFDdEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUV0QyxJQUFJLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRWhELElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyx1Q0FBNkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRW5OLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbEcseURBQXlEO2dCQUN6RCxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxTQUFTLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLHVDQUE2QixDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDL007WUFFRCxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNmLDZEQUE2RDtnQkFDN0QsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMvRCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdkU7WUFFRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFTSxlQUFlO1lBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRU8sbUJBQW1CLENBQUMsS0FBZTtZQUMxQyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLENBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO21CQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUM3QyxDQUFDO1lBRUYsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUM7WUFDbkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUV0QyxJQUFJLGdCQUFnQixJQUFJLE1BQU0sS0FBSyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3RFLElBQUksVUFBVSxLQUFLLEtBQUssQ0FBQyxZQUFZLEVBQUUsRUFBRTtvQkFDeEMsVUFBVSxHQUFHLENBQUMsQ0FBQztpQkFDZjtxQkFBTTtvQkFDTixVQUFVLEVBQUUsQ0FBQztpQkFDYjtnQkFDRCxNQUFNLEdBQUcsQ0FBQyxDQUFDO2FBQ1g7aUJBQU07Z0JBQ04sTUFBTSxFQUFFLENBQUM7YUFDVDtZQUVELE9BQU8sSUFBSSxtQkFBUSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRU8sZ0JBQWdCLENBQUMsS0FBZTtZQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxFQUFFO2dCQUN0Qyw2Q0FBNkM7Z0JBQzdDLDREQUE0RDtnQkFDNUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFcEUsSUFBSSxjQUFjLEVBQUU7b0JBQ25CLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztpQkFDMUM7Z0JBQ0QsT0FBTzthQUNQO1lBQ0QsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxHQUFHLHFCQUFhLEVBQUU7Z0JBQ2pELElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRWpFLElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2xHLHlEQUF5RDtvQkFDekQsS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDeEMsY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzdEO2dCQUNELElBQUksY0FBYyxFQUFFO29CQUNuQixJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUM7aUJBQzFDO2dCQUVELE9BQU87YUFDUDtZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6RCxJQUFJLFNBQVMsRUFBRTtnQkFDZCxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzNDO1FBQ0YsQ0FBQztRQUVPLGFBQWEsQ0FBQyxLQUFlLEVBQUUsY0FBdUIsRUFBRSxTQUFrQixFQUFFLGFBQXNCLEtBQUs7WUFDOUcsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25ELE1BQU0sV0FBVyxHQUFHLDJCQUEyQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXBHLG1CQUFtQjtZQUNuQixJQUFJLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2pELEtBQUssR0FBRyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzthQUN2QztZQUVELG1CQUFtQjtZQUNuQixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRTtnQkFDbkQsS0FBSyxHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBQ3ZDO1lBRUQsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUM7WUFDckMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUV0QyxJQUFJLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRWhELElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsdUNBQTZCLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUV4TixJQUFJLFNBQVMsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMvRyx5REFBeUQ7Z0JBQ3pELFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzlDLFNBQVMsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLHVDQUE2QixDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7YUFDcE47WUFFRCxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNmLDZEQUE2RDtnQkFDN0QsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDL0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM3RjtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTSxlQUFlO1lBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUVPLFlBQVksQ0FBQyxLQUFhO1lBQ2pDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEUsSUFBSSxlQUFlLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUMzQztRQUNGLENBQUM7UUFFTSxXQUFXLENBQUMsS0FBYTtZQUMvQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFFTyxrQkFBa0I7WUFDekIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDeEIsT0FBTyxJQUFBLG1DQUFrQixFQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDckQ7WUFDRCxPQUFPLCtCQUFjLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVNLE9BQU87WUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUN4QixPQUFPO2FBQ1A7WUFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUNqRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQzlDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hGLElBQUksU0FBUyxFQUFFO2dCQUNkLElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQzNDLGdEQUFnRDtvQkFDaEQsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFckcsTUFBTSxPQUFPLEdBQUcsSUFBSSwrQkFBYyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFFN0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFFL0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLG1CQUFRLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUMxSCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNwQjtxQkFBTTtvQkFDTixJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztvQkFDL0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDM0M7YUFDRDtRQUNGLENBQUM7UUFFTyxZQUFZLENBQUMsVUFBMEIsRUFBRSxjQUF1QixFQUFFLGdCQUF3QjtZQUNqRyxNQUFNLFlBQVksR0FBRyxDQUFDLFVBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQW1CLEVBQUUsRUFBRSxDQUM3RSwyQkFBMkIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FDM0UsQ0FBQztZQUVGLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsdUNBQTZCLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN0UCxDQUFDO1FBRU0sVUFBVTtZQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUN4QixPQUFPO2FBQ1A7WUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXJELElBQUksVUFBVSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxxQkFBYSxFQUFFO2dCQUNyRSwyRUFBMkU7Z0JBQzNFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNwQztZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUVPLGdCQUFnQjtZQUN2QixNQUFNLFlBQVksR0FBRyxJQUFJLDhCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyx1Q0FBNkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaE0sTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDckQsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsT0FBTzthQUNQO1lBRUQsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRTtnQkFDM0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO2dCQUNmLElBQUksV0FBVyxDQUFDLFVBQVUsRUFBRTtvQkFDM0IsR0FBRyxJQUFJLEdBQUcsQ0FBQztpQkFDWDtnQkFDRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7b0JBQ3ZCLEdBQUcsSUFBSSxHQUFHLENBQUM7aUJBQ1g7Z0JBQ0QsV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDbEQ7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLGdDQUF3QixDQUFDO1lBQ3pELE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRWpELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ2pELElBQUksVUFBa0IsQ0FBQztZQUN2QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztZQUU5QyxJQUFJLGNBQWMsQ0FBQyxzQkFBc0IsSUFBSSxZQUFZLEVBQUU7Z0JBQzFELFVBQVUsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRTtvQkFDM0MsT0FBTyxjQUFjLENBQUMsa0JBQWtCLENBQWdCLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDbEYsQ0FBQyxDQUFDLENBQUM7YUFDSDtpQkFBTTtnQkFDTixVQUFVLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO2FBQ25HO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxxREFBb0MsQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUNsSCxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxVQUEwQjtZQUNwRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUNqRCwyREFBMkQ7WUFDM0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLHNCQUFzQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxvREFBbUMsQ0FBQztZQUVuSixNQUFNLGNBQWMsR0FBYSxFQUFFLENBQUM7WUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbkQsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDcEc7WUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLHFDQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUM5RyxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDeEIsT0FBTzthQUNQO1lBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVyRCwyREFBMkQ7WUFDM0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsS0FBSyxvREFBbUMsQ0FBQztZQUN2RixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUV6SSw0RUFBNEU7WUFDNUUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNwRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN0RCxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsRUFBRTtvQkFDckMsVUFBVSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlGLE1BQU07aUJBQ047YUFDRDtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFTyxxQkFBcUIsQ0FBQyxNQUFjLEVBQUUsT0FBaUI7WUFDOUQsSUFBSTtnQkFDSCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDNUI7b0JBQVM7Z0JBQ1QsSUFBSSxDQUFDLDBCQUEwQixHQUFHLEtBQUssQ0FBQzthQUN4QztRQUNGLENBQUM7S0FDRDtJQWxoQkQsa0VBa2hCQyJ9