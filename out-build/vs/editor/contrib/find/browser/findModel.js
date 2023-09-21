/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/common/commands/replaceCommand", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/model/textModelSearch", "vs/editor/contrib/find/browser/findDecorations", "vs/editor/contrib/find/browser/replaceAllCommand", "vs/editor/contrib/find/browser/replacePattern", "vs/platform/contextkey/common/contextkey"], function (require, exports, arraysFind_1, async_1, lifecycle_1, replaceCommand_1, position_1, range_1, selection_1, textModelSearch_1, findDecorations_1, replaceAllCommand_1, replacePattern_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$J7 = exports.$I7 = exports.$H7 = exports.$G7 = exports.$F7 = exports.$E7 = exports.$D7 = exports.$C7 = exports.$B7 = exports.$A7 = exports.$z7 = exports.$y7 = void 0;
    exports.$y7 = new contextkey_1.$2i('findWidgetVisible', false);
    exports.$z7 = exports.$y7.toNegated();
    // Keep ContextKey use of 'Focussed' to not break when clauses
    exports.$A7 = new contextkey_1.$2i('findInputFocussed', false);
    exports.$B7 = new contextkey_1.$2i('replaceInputFocussed', false);
    exports.$C7 = {
        primary: 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */ }
    };
    exports.$D7 = {
        primary: 512 /* KeyMod.Alt */ | 53 /* KeyCode.KeyW */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 53 /* KeyCode.KeyW */ }
    };
    exports.$E7 = {
        primary: 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */ }
    };
    exports.$F7 = {
        primary: 512 /* KeyMod.Alt */ | 42 /* KeyCode.KeyL */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 42 /* KeyCode.KeyL */ }
    };
    exports.$G7 = {
        primary: 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */ }
    };
    exports.$H7 = {
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
    exports.$I7 = 19999;
    const RESEARCH_DELAY = 240;
    class $J7 {
        constructor(editor, state) {
            this.c = new lifecycle_1.$jc();
            this.a = editor;
            this.b = state;
            this.j = false;
            this.g = new async_1.$Qg();
            this.d = new findDecorations_1.$s7(editor);
            this.c.add(this.d);
            this.h = new async_1.$Sg(() => this.n(false), 100);
            this.c.add(this.h);
            this.c.add(this.a.onDidChangeCursorPosition((e) => {
                if (e.reason === 3 /* CursorChangeReason.Explicit */
                    || e.reason === 5 /* CursorChangeReason.Undo */
                    || e.reason === 6 /* CursorChangeReason.Redo */) {
                    this.d.setStartPosition(this.a.getPosition());
                }
            }));
            this.f = false;
            this.c.add(this.a.onDidChangeModelContent((e) => {
                if (this.f) {
                    return;
                }
                if (e.isFlush) {
                    // a model.setValue() was called
                    this.d.reset();
                }
                this.d.setStartPosition(this.a.getPosition());
                this.h.schedule();
            }));
            this.c.add(this.b.onFindReplaceStateChange((e) => this.k(e)));
            this.n(false, this.b.searchScope);
        }
        dispose() {
            this.j = true;
            (0, lifecycle_1.$fc)(this.g);
            this.c.dispose();
        }
        k(e) {
            if (this.j) {
                // The find model is disposed during a find state changed event
                return;
            }
            if (!this.a.hasModel()) {
                // The find model will be disposed momentarily
                return;
            }
            if (e.searchString || e.isReplaceRevealed || e.isRegex || e.wholeWord || e.matchCase || e.searchScope) {
                const model = this.a.getModel();
                if (model.isTooLargeForSyncing()) {
                    this.g.cancel();
                    this.g.setIfNotSet(() => {
                        if (e.searchScope) {
                            this.n(e.moveCursor, this.b.searchScope);
                        }
                        else {
                            this.n(e.moveCursor);
                        }
                    }, RESEARCH_DELAY);
                }
                else {
                    if (e.searchScope) {
                        this.n(e.moveCursor, this.b.searchScope);
                    }
                    else {
                        this.n(e.moveCursor);
                    }
                }
            }
        }
        static l(model, findScope) {
            // If we have set now or before a find scope, use it for computing the search range
            if (findScope) {
                return findScope;
            }
            return model.getFullModelRange();
        }
        n(moveCursor, newFindScope) {
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
                findScopes = this.d.getFindScopes();
            }
            if (findScopes !== null) {
                findScopes = findScopes.map(findScope => {
                    if (findScope.startLineNumber !== findScope.endLineNumber) {
                        let endLineNumber = findScope.endLineNumber;
                        if (findScope.endColumn === 1) {
                            endLineNumber = endLineNumber - 1;
                        }
                        return new range_1.$ks(findScope.startLineNumber, 1, endLineNumber, this.a.getModel().getLineMaxColumn(endLineNumber));
                    }
                    return findScope;
                });
            }
            const findMatches = this.y(findScopes, false, exports.$I7);
            this.d.set(findMatches, findScopes);
            const editorSelection = this.a.getSelection();
            let currentMatchesPosition = this.d.getCurrentMatchesPosition(editorSelection);
            if (currentMatchesPosition === 0 && findMatches.length > 0) {
                // current selection is not on top of a match
                // try to find its nearest result from the top of the document
                const matchAfterSelection = (0, arraysFind_1.$ib)(findMatches.map(match => match.range), range => range_1.$ks.compareRangesUsingStarts(range, editorSelection) >= 0);
                currentMatchesPosition = matchAfterSelection > 0 ? matchAfterSelection - 1 + 1 /** match position is one based */ : currentMatchesPosition;
            }
            this.b.changeMatchInfo(currentMatchesPosition, this.d.getCount(), undefined);
            if (moveCursor && this.a.getOption(41 /* EditorOption.find */).cursorMoveOnType) {
                this.u(this.d.getStartPosition());
            }
        }
        o() {
            return (this.b.matchesCount > 0);
        }
        p() {
            if (!this.o()) {
                const findScope = this.d.getFindScope();
                if (findScope) {
                    // Reveal the selection so user is reminded that 'selection find' is on.
                    this.a.revealRangeInCenterIfOutsideViewport(findScope, 0 /* ScrollType.Smooth */);
                }
                return true;
            }
            return false;
        }
        q(match) {
            const matchesPosition = this.d.setCurrentFindMatch(match);
            this.b.changeMatchInfo(matchesPosition, this.d.getCount(), match);
            this.a.setSelection(match);
            this.a.revealRangeInCenterIfOutsideViewport(match, 0 /* ScrollType.Smooth */);
        }
        r(before) {
            const isUsingLineStops = this.b.isRegex && (this.b.searchString.indexOf('^') >= 0
                || this.b.searchString.indexOf('$') >= 0);
            let { lineNumber, column } = before;
            const model = this.a.getModel();
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
            return new position_1.$js(lineNumber, column);
        }
        s(before, isRecursed = false) {
            if (!this.b.canNavigateBack()) {
                // we are beyond the first matched find result
                // instead of doing nothing, we should refocus the first item
                const nextMatchRange = this.d.matchAfterPosition(before);
                if (nextMatchRange) {
                    this.q(nextMatchRange);
                }
                return;
            }
            if (this.d.getCount() < exports.$I7) {
                let prevMatchRange = this.d.matchBeforePosition(before);
                if (prevMatchRange && prevMatchRange.isEmpty() && prevMatchRange.getStartPosition().equals(before)) {
                    before = this.r(before);
                    prevMatchRange = this.d.matchBeforePosition(before);
                }
                if (prevMatchRange) {
                    this.q(prevMatchRange);
                }
                return;
            }
            if (this.p()) {
                return;
            }
            const findScope = this.d.getFindScope();
            const searchRange = $J7.l(this.a.getModel(), findScope);
            // ...(----)...|...
            if (searchRange.getEndPosition().isBefore(before)) {
                before = searchRange.getEndPosition();
            }
            // ...|...(----)...
            if (before.isBefore(searchRange.getStartPosition())) {
                before = searchRange.getEndPosition();
            }
            const { lineNumber, column } = before;
            const model = this.a.getModel();
            let position = new position_1.$js(lineNumber, column);
            let prevMatch = model.findPreviousMatch(this.b.searchString, position, this.b.isRegex, this.b.matchCase, this.b.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, false);
            if (prevMatch && prevMatch.range.isEmpty() && prevMatch.range.getStartPosition().equals(position)) {
                // Looks like we're stuck at this position, unacceptable!
                position = this.r(position);
                prevMatch = model.findPreviousMatch(this.b.searchString, position, this.b.isRegex, this.b.matchCase, this.b.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, false);
            }
            if (!prevMatch) {
                // there is precisely one match and selection is on top of it
                return;
            }
            if (!isRecursed && !searchRange.containsRange(prevMatch.range)) {
                return this.s(prevMatch.range.getStartPosition(), true);
            }
            this.q(prevMatch.range);
        }
        moveToPrevMatch() {
            this.s(this.a.getSelection().getStartPosition());
        }
        t(after) {
            const isUsingLineStops = this.b.isRegex && (this.b.searchString.indexOf('^') >= 0
                || this.b.searchString.indexOf('$') >= 0);
            let { lineNumber, column } = after;
            const model = this.a.getModel();
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
            return new position_1.$js(lineNumber, column);
        }
        u(after) {
            if (!this.b.canNavigateForward()) {
                // we are beyond the last matched find result
                // instead of doing nothing, we should refocus the last item
                const prevMatchRange = this.d.matchBeforePosition(after);
                if (prevMatchRange) {
                    this.q(prevMatchRange);
                }
                return;
            }
            if (this.d.getCount() < exports.$I7) {
                let nextMatchRange = this.d.matchAfterPosition(after);
                if (nextMatchRange && nextMatchRange.isEmpty() && nextMatchRange.getStartPosition().equals(after)) {
                    // Looks like we're stuck at this position, unacceptable!
                    after = this.t(after);
                    nextMatchRange = this.d.matchAfterPosition(after);
                }
                if (nextMatchRange) {
                    this.q(nextMatchRange);
                }
                return;
            }
            const nextMatch = this.v(after, false, true);
            if (nextMatch) {
                this.q(nextMatch.range);
            }
        }
        v(after, captureMatches, forceMove, isRecursed = false) {
            if (this.p()) {
                return null;
            }
            const findScope = this.d.getFindScope();
            const searchRange = $J7.l(this.a.getModel(), findScope);
            // ...(----)...|...
            if (searchRange.getEndPosition().isBefore(after)) {
                after = searchRange.getStartPosition();
            }
            // ...|...(----)...
            if (after.isBefore(searchRange.getStartPosition())) {
                after = searchRange.getStartPosition();
            }
            const { lineNumber, column } = after;
            const model = this.a.getModel();
            let position = new position_1.$js(lineNumber, column);
            let nextMatch = model.findNextMatch(this.b.searchString, position, this.b.isRegex, this.b.matchCase, this.b.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, captureMatches);
            if (forceMove && nextMatch && nextMatch.range.isEmpty() && nextMatch.range.getStartPosition().equals(position)) {
                // Looks like we're stuck at this position, unacceptable!
                position = this.t(position);
                nextMatch = model.findNextMatch(this.b.searchString, position, this.b.isRegex, this.b.matchCase, this.b.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, captureMatches);
            }
            if (!nextMatch) {
                // there is precisely one match and selection is on top of it
                return null;
            }
            if (!isRecursed && !searchRange.containsRange(nextMatch.range)) {
                return this.v(nextMatch.range.getEndPosition(), captureMatches, forceMove, true);
            }
            return nextMatch;
        }
        moveToNextMatch() {
            this.u(this.a.getSelection().getEndPosition());
        }
        w(index) {
            const decorationRange = this.d.getDecorationRangeAt(index);
            if (decorationRange) {
                this.q(decorationRange);
            }
        }
        moveToMatch(index) {
            this.w(index);
        }
        x() {
            if (this.b.isRegex) {
                return (0, replacePattern_1.$x7)(this.b.replaceString);
            }
            return replacePattern_1.$v7.fromStaticValue(this.b.replaceString);
        }
        replace() {
            if (!this.o()) {
                return;
            }
            const replacePattern = this.x();
            const selection = this.a.getSelection();
            const nextMatch = this.v(selection.getStartPosition(), true, false);
            if (nextMatch) {
                if (selection.equalsRange(nextMatch.range)) {
                    // selection sits on a find match => replace it!
                    const replaceString = replacePattern.buildReplaceString(nextMatch.matches, this.b.preserveCase);
                    const command = new replaceCommand_1.$UV(selection, replaceString);
                    this.B('replace', command);
                    this.d.setStartPosition(new position_1.$js(selection.startLineNumber, selection.startColumn + replaceString.length));
                    this.n(true);
                }
                else {
                    this.d.setStartPosition(this.a.getPosition());
                    this.q(nextMatch.range);
                }
            }
        }
        y(findScopes, captureMatches, limitResultCount) {
            const searchRanges = (findScopes || [null]).map((scope) => $J7.l(this.a.getModel(), scope));
            return this.a.getModel().findMatches(this.b.searchString, searchRanges, this.b.isRegex, this.b.matchCase, this.b.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, captureMatches, limitResultCount);
        }
        replaceAll() {
            if (!this.o()) {
                return;
            }
            const findScopes = this.d.getFindScopes();
            if (findScopes === null && this.b.matchesCount >= exports.$I7) {
                // Doing a replace on the entire file that is over ${MATCHES_LIMIT} matches
                this.z();
            }
            else {
                this.A(findScopes);
            }
            this.n(false);
        }
        z() {
            const searchParams = new textModelSearch_1.$hC(this.b.searchString, this.b.isRegex, this.b.matchCase, this.b.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null);
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
            const model = this.a.getModel();
            const modelText = model.getValue(1 /* EndOfLinePreference.LF */);
            const fullModelRange = model.getFullModelRange();
            const replacePattern = this.x();
            let resultText;
            const preserveCase = this.b.preserveCase;
            if (replacePattern.hasReplacementPatterns || preserveCase) {
                resultText = modelText.replace(searchRegex, function () {
                    return replacePattern.buildReplaceString(arguments, preserveCase);
                });
            }
            else {
                resultText = modelText.replace(searchRegex, replacePattern.buildReplaceString(null, preserveCase));
            }
            const command = new replaceCommand_1.$YV(fullModelRange, resultText, this.a.getSelection());
            this.B('replaceAll', command);
        }
        A(findScopes) {
            const replacePattern = this.x();
            // Get all the ranges (even more than the highlighted ones)
            const matches = this.y(findScopes, replacePattern.hasReplacementPatterns || this.b.preserveCase, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
            const replaceStrings = [];
            for (let i = 0, len = matches.length; i < len; i++) {
                replaceStrings[i] = replacePattern.buildReplaceString(matches[i].matches, this.b.preserveCase);
            }
            const command = new replaceAllCommand_1.$u7(this.a.getSelection(), matches.map(m => m.range), replaceStrings);
            this.B('replaceAll', command);
        }
        selectAllMatches() {
            if (!this.o()) {
                return;
            }
            const findScopes = this.d.getFindScopes();
            // Get all the ranges (even more than the highlighted ones)
            const matches = this.y(findScopes, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
            let selections = matches.map(m => new selection_1.$ms(m.range.startLineNumber, m.range.startColumn, m.range.endLineNumber, m.range.endColumn));
            // If one of the ranges is the editor selection, then maintain it as primary
            const editorSelection = this.a.getSelection();
            for (let i = 0, len = selections.length; i < len; i++) {
                const sel = selections[i];
                if (sel.equalsRange(editorSelection)) {
                    selections = [editorSelection].concat(selections.slice(0, i)).concat(selections.slice(i + 1));
                    break;
                }
            }
            this.a.setSelections(selections);
        }
        B(source, command) {
            try {
                this.f = true;
                this.a.pushUndoStop();
                this.a.executeCommand(source, command);
                this.a.pushUndoStop();
            }
            finally {
                this.f = false;
            }
        }
    }
    exports.$J7 = $J7;
});
//# sourceMappingURL=findModel.js.map