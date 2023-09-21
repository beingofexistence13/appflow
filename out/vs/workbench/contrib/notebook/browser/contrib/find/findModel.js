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
define(["require", "exports", "vs/base/common/async", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/editor/common/core/range", "vs/editor/common/model/prefixSumComputer", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/arraysFind", "vs/workbench/contrib/notebook/browser/contrib/find/findMatchDecorationModel"], function (require, exports, async_1, notebookBrowser_1, range_1, prefixSumComputer_1, notebookCommon_1, configuration_1, lifecycle_1, arraysFind_1, findMatchDecorationModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FindModel = exports.CellFindMatchModel = void 0;
    class CellFindMatchModel {
        get length() {
            return this._contentMatches.length + this._webviewMatches.length;
        }
        get contentMatches() {
            return this._contentMatches;
        }
        get webviewMatches() {
            return this._webviewMatches;
        }
        constructor(cell, index, contentMatches, webviewMatches) {
            this.cell = cell;
            this.index = index;
            this._contentMatches = contentMatches;
            this._webviewMatches = webviewMatches;
        }
        getMatch(index) {
            if (index >= this.length) {
                throw new Error('NotebookCellFindMatch: index out of range');
            }
            if (index < this._contentMatches.length) {
                return this._contentMatches[index];
            }
            return this._webviewMatches[index - this._contentMatches.length];
        }
    }
    exports.CellFindMatchModel = CellFindMatchModel;
    let FindModel = class FindModel extends lifecycle_1.Disposable {
        get findMatches() {
            return this._findMatches;
        }
        get currentMatch() {
            return this._currentMatch;
        }
        constructor(_notebookEditor, _state, _configurationService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._state = _state;
            this._configurationService = _configurationService;
            this._findMatches = [];
            this._findMatchesStarts = null;
            this._currentMatch = -1;
            this._computePromise = null;
            this._modelDisposable = this._register(new lifecycle_1.DisposableStore());
            this._throttledDelayer = new async_1.Delayer(20);
            this._computePromise = null;
            this._register(_state.onFindReplaceStateChange(e => {
                this._updateCellStates(e);
                if (e.searchString || e.isRegex || e.matchCase || e.searchScope || e.wholeWord || (e.isRevealed && this._state.isRevealed) || e.filters || e.isReplaceRevealed) {
                    this.research();
                }
                if (e.isRevealed && !this._state.isRevealed) {
                    this.clear();
                }
            }));
            this._register(this._notebookEditor.onDidChangeModel(e => {
                this._registerModelListener(e);
            }));
            this._register(this._notebookEditor.onDidChangeCellState(e => {
                if (e.cell.cellKind === notebookCommon_1.CellKind.Markup && e.source.editStateChanged) {
                    // research when markdown cell is switching between markdown preview and editing mode.
                    this.research();
                }
            }));
            if (this._notebookEditor.hasModel()) {
                this._registerModelListener(this._notebookEditor.textModel);
            }
            this._findMatchDecorationModel = new findMatchDecorationModel_1.FindMatchDecorationModel(this._notebookEditor, this._notebookEditor.getId());
        }
        _updateCellStates(e) {
            if (!this._state.filters?.markupInput) {
                return;
            }
            if (!this._state.filters?.markupPreview) {
                return;
            }
            // we only update cell state if users are using the hybrid mode (both input and preview are enabled)
            const updateEditingState = () => {
                const viewModel = this._notebookEditor.getViewModel();
                if (!viewModel) {
                    return;
                }
                // search markup sources first to decide if a markup cell should be in editing mode
                const wordSeparators = this._configurationService.inspect('editor.wordSeparators').value;
                const options = {
                    regex: this._state.isRegex,
                    wholeWord: this._state.wholeWord,
                    caseSensitive: this._state.matchCase,
                    wordSeparators: wordSeparators,
                    includeMarkupInput: true,
                    includeCodeInput: false,
                    includeMarkupPreview: false,
                    includeOutput: false
                };
                const contentMatches = viewModel.find(this._state.searchString, options);
                for (let i = 0; i < viewModel.length; i++) {
                    const cell = viewModel.cellAt(i);
                    if (cell && cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        const foundContentMatch = contentMatches.find(m => m.cell.handle === cell.handle && m.contentMatches.length > 0);
                        const targetState = foundContentMatch ? notebookBrowser_1.CellEditState.Editing : notebookBrowser_1.CellEditState.Preview;
                        const currentEditingState = cell.getEditState();
                        if (currentEditingState === notebookBrowser_1.CellEditState.Editing && cell.editStateSource !== 'find') {
                            // it's already in editing mode, we should not update
                            continue;
                        }
                        if (currentEditingState !== targetState) {
                            cell.updateEditState(targetState, 'find');
                        }
                    }
                }
            };
            if (e.isReplaceRevealed && !this._state.isReplaceRevealed) {
                // replace is hidden, we need to switch all markdown cells to preview mode
                const viewModel = this._notebookEditor.getViewModel();
                if (!viewModel) {
                    return;
                }
                for (let i = 0; i < viewModel.length; i++) {
                    const cell = viewModel.cellAt(i);
                    if (cell && cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing && cell.editStateSource === 'find') {
                            cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'find');
                        }
                    }
                }
                return;
            }
            if (e.isReplaceRevealed) {
                updateEditingState();
            }
            else if ((e.filters || e.isRevealed || e.searchString || e.replaceString) && this._state.isRevealed && this._state.isReplaceRevealed) {
                updateEditingState();
            }
        }
        ensureFindMatches() {
            if (!this._findMatchesStarts) {
                this.set(this._findMatches, true);
            }
        }
        getCurrentMatch() {
            const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
            const cell = this._findMatches[nextIndex.index].cell;
            const match = this._findMatches[nextIndex.index].getMatch(nextIndex.remainder);
            return {
                cell,
                match,
                isModelMatch: nextIndex.remainder < this._findMatches[nextIndex.index].contentMatches.length
            };
        }
        refreshCurrentMatch(focus) {
            const findMatchIndex = this.findMatches.findIndex(match => match.cell === focus.cell);
            if (findMatchIndex === -1) {
                return;
            }
            const findMatch = this.findMatches[findMatchIndex];
            const index = findMatch.contentMatches.findIndex(match => match.range.intersectRanges(focus.range) !== null);
            if (index === undefined) {
                return;
            }
            const matchesBefore = findMatchIndex === 0 ? 0 : (this._findMatchesStarts?.getPrefixSum(findMatchIndex - 1) ?? 0);
            this._currentMatch = matchesBefore + index;
            this.highlightCurrentFindMatchDecoration(findMatchIndex, index).then(offset => {
                this.revealCellRange(findMatchIndex, index, offset);
                this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.length, 0), undefined);
            });
        }
        find(option) {
            if (!this.findMatches.length) {
                return;
            }
            // let currCell;
            if (!this._findMatchesStarts) {
                this.set(this._findMatches, true);
                if ('index' in option) {
                    this._currentMatch = option.index;
                }
            }
            else {
                // const currIndex = this._findMatchesStarts!.getIndexOf(this._currentMatch);
                // currCell = this._findMatches[currIndex.index].cell;
                const totalVal = this._findMatchesStarts.getTotalSum();
                if ('index' in option) {
                    this._currentMatch = option.index;
                }
                else if (this._currentMatch === -1) {
                    this._currentMatch = option.previous ? totalVal - 1 : 0;
                }
                else {
                    const nextVal = (this._currentMatch + (option.previous ? -1 : 1) + totalVal) % totalVal;
                    this._currentMatch = nextVal;
                }
            }
            const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
            // const newFocusedCell = this._findMatches[nextIndex.index].cell;
            this.highlightCurrentFindMatchDecoration(nextIndex.index, nextIndex.remainder).then(offset => {
                this.revealCellRange(nextIndex.index, nextIndex.remainder, offset);
                this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.length, 0), undefined);
            });
        }
        revealCellRange(cellIndex, matchIndex, outputOffset) {
            const findMatch = this._findMatches[cellIndex];
            if (matchIndex >= findMatch.contentMatches.length) {
                // reveal output range
                this._notebookEditor.focusElement(findMatch.cell);
                const index = this._notebookEditor.getCellIndex(findMatch.cell);
                if (index !== undefined) {
                    // const range: ICellRange = { start: index, end: index + 1 };
                    this._notebookEditor.revealCellOffsetInCenterAsync(findMatch.cell, outputOffset ?? 0);
                }
            }
            else {
                const match = findMatch.getMatch(matchIndex);
                if (findMatch.cell.getEditState() !== notebookBrowser_1.CellEditState.Editing) {
                    findMatch.cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'find');
                }
                findMatch.cell.isInputCollapsed = false;
                this._notebookEditor.focusElement(findMatch.cell);
                this._notebookEditor.setCellEditorSelection(findMatch.cell, match.range);
                this._notebookEditor.revealRangeInCenterIfOutsideViewportAsync(findMatch.cell, match.range);
            }
        }
        _registerModelListener(notebookTextModel) {
            this._modelDisposable.clear();
            if (notebookTextModel) {
                this._modelDisposable.add(notebookTextModel.onDidChangeContent((e) => {
                    if (!e.rawEvents.some(event => event.kind === notebookCommon_1.NotebookCellsChangeType.ChangeCellContent || event.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange)) {
                        return;
                    }
                    this.research();
                }));
            }
            this.research();
        }
        async research() {
            return this._throttledDelayer.trigger(async () => {
                this._state.change({ isSearching: true }, false);
                await this._research();
                this._state.change({ isSearching: false }, false);
            });
        }
        async _research() {
            this._computePromise?.cancel();
            if (!this._state.isRevealed || !this._notebookEditor.hasModel()) {
                this.set([], false);
                return;
            }
            this._computePromise = (0, async_1.createCancelablePromise)(token => this._compute(token));
            const findMatches = await this._computePromise;
            if (!findMatches) {
                this.set([], false);
                return;
            }
            if (findMatches.length === 0) {
                this.set([], false);
                return;
            }
            const findFirstMatchAfterCellIndex = (cellIndex) => {
                const matchAfterSelection = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(findMatches.map(match => match.index), index => index >= cellIndex);
                this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
            };
            if (this._currentMatch === -1) {
                // no active current match
                if (this._notebookEditor.getLength() === 0) {
                    this.set(findMatches, false);
                    return;
                }
                else {
                    const focus = this._notebookEditor.getFocus().start;
                    findFirstMatchAfterCellIndex(focus);
                    this.set(findMatches, false);
                    return;
                }
            }
            const oldCurrIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
            const oldCurrCell = this._findMatches[oldCurrIndex.index].cell;
            const oldCurrMatchCellIndex = this._notebookEditor.getCellIndex(oldCurrCell);
            if (oldCurrMatchCellIndex < 0) {
                // the cell containing the active match is deleted
                if (this._notebookEditor.getLength() === 0) {
                    this.set(findMatches, false);
                    return;
                }
                findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
                return;
            }
            // the cell still exist
            const cell = this._notebookEditor.cellAt(oldCurrMatchCellIndex);
            // we will try restore the active find match in this cell, if it contains any find match
            if (cell.cellKind === notebookCommon_1.CellKind.Markup && cell.getEditState() === notebookBrowser_1.CellEditState.Preview) {
                // find first match in this cell or below
                findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
                return;
            }
            // the cell is a markup cell in editing mode or a code cell, both should have monaco editor rendered
            if (!this._findMatchDecorationModel.currentMatchDecorations) {
                // no current highlight decoration
                findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
                return;
            }
            // check if there is monaco editor selection and find the first match, otherwise find the first match above current cell
            // this._findMatches[cellIndex].matches[matchIndex].range
            if (this._findMatchDecorationModel.currentMatchDecorations.kind === 'input') {
                const currentMatchDecorationId = this._findMatchDecorationModel.currentMatchDecorations.decorations.find(decoration => decoration.ownerId === cell.handle);
                if (!currentMatchDecorationId) {
                    // current match decoration is no longer valid
                    findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
                    return;
                }
                const matchAfterSelection = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(findMatches, match => match.index >= oldCurrMatchCellIndex) % findMatches.length;
                if (findMatches[matchAfterSelection].index > oldCurrMatchCellIndex) {
                    // there is no search result in curr cell anymore, find the nearest one (from top to bottom)
                    this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
                    return;
                }
                else {
                    // there are still some search results in current cell
                    let currMatchRangeInEditor = cell.editorAttached && currentMatchDecorationId.decorations[0] ? cell.getCellDecorationRange(currentMatchDecorationId.decorations[0]) : null;
                    if (currMatchRangeInEditor === null && oldCurrIndex.remainder < this._findMatches[oldCurrIndex.index].contentMatches.length) {
                        currMatchRangeInEditor = this._findMatches[oldCurrIndex.index].getMatch(oldCurrIndex.remainder).range;
                    }
                    if (currMatchRangeInEditor !== null) {
                        // we find a range for the previous current match, let's find the nearest one after it (can overlap)
                        const cellMatch = findMatches[matchAfterSelection];
                        const matchAfterOldSelection = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(cellMatch.contentMatches, match => range_1.Range.compareRangesUsingStarts(match.range, currMatchRangeInEditor) >= 0);
                        this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection) + matchAfterOldSelection);
                    }
                    else {
                        // no range found, let's fall back to finding the nearest match
                        this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
                        return;
                    }
                }
            }
            else {
                // output now has the highlight
                const matchAfterSelection = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(findMatches.map(match => match.index), index => index >= oldCurrMatchCellIndex) % findMatches.length;
                this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
            }
        }
        set(cellFindMatches, autoStart) {
            if (!cellFindMatches || !cellFindMatches.length) {
                this._findMatches = [];
                this._findMatchDecorationModel.setAllFindMatchesDecorations([]);
                this.constructFindMatchesStarts();
                this._currentMatch = -1;
                this._findMatchDecorationModel.clearCurrentFindMatchDecoration();
                this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.length, 0), undefined);
                return;
            }
            // all matches
            this._findMatches = cellFindMatches;
            this._findMatchDecorationModel.setAllFindMatchesDecorations(cellFindMatches || []);
            // current match
            this.constructFindMatchesStarts();
            if (autoStart) {
                this._currentMatch = 0;
                this.highlightCurrentFindMatchDecoration(0, 0);
            }
            this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.length, 0), undefined);
        }
        async _compute(token) {
            if (!this._notebookEditor.hasModel()) {
                return null;
            }
            let ret = null;
            const val = this._state.searchString;
            const wordSeparators = this._configurationService.inspect('editor.wordSeparators').value;
            const options = {
                regex: this._state.isRegex,
                wholeWord: this._state.wholeWord,
                caseSensitive: this._state.matchCase,
                wordSeparators: wordSeparators,
                includeMarkupInput: this._state.filters?.markupInput ?? true,
                includeCodeInput: this._state.filters?.codeInput ?? true,
                includeMarkupPreview: !!this._state.filters?.markupPreview,
                includeOutput: !!this._state.filters?.codeOutput
            };
            ret = await this._notebookEditor.find(val, options, token);
            if (token.isCancellationRequested) {
                return null;
            }
            return ret;
        }
        _updateCurrentMatch(findMatches, currentMatchesPosition) {
            this.set(findMatches, false);
            this._currentMatch = currentMatchesPosition % findMatches.length;
            const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
            this.highlightCurrentFindMatchDecoration(nextIndex.index, nextIndex.remainder);
            this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.length, 0), undefined);
        }
        _matchesCountBeforeIndex(findMatches, index) {
            let prevMatchesCount = 0;
            for (let i = 0; i < index; i++) {
                prevMatchesCount += findMatches[i].length;
            }
            return prevMatchesCount;
        }
        constructFindMatchesStarts() {
            if (this._findMatches && this._findMatches.length) {
                const values = new Uint32Array(this._findMatches.length);
                for (let i = 0; i < this._findMatches.length; i++) {
                    values[i] = this._findMatches[i].length;
                }
                this._findMatchesStarts = new prefixSumComputer_1.PrefixSumComputer(values);
            }
            else {
                this._findMatchesStarts = null;
            }
        }
        async highlightCurrentFindMatchDecoration(cellIndex, matchIndex) {
            const cell = this._findMatches[cellIndex].cell;
            const match = this._findMatches[cellIndex].getMatch(matchIndex);
            if (matchIndex < this._findMatches[cellIndex].contentMatches.length) {
                return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInCell(cell, match.range);
            }
            else {
                return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInWebview(cell, match.index);
            }
        }
        clear() {
            this._computePromise?.cancel();
            this._throttledDelayer.cancel();
            this.set([], false);
        }
        dispose() {
            this._findMatchDecorationModel.dispose();
            super.dispose();
        }
    };
    exports.FindModel = FindModel;
    exports.FindModel = FindModel = __decorate([
        __param(2, configuration_1.IConfigurationService)
    ], FindModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2ZpbmQvZmluZE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtCaEcsTUFBYSxrQkFBa0I7UUFLOUIsSUFBSSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztRQUNsRSxDQUFDO1FBRUQsSUFBSSxjQUFjO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM3QixDQUFDO1FBRUQsSUFBSSxjQUFjO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM3QixDQUFDO1FBRUQsWUFBWSxJQUFvQixFQUFFLEtBQWEsRUFBRSxjQUEyQixFQUFFLGNBQXNDO1lBQ25ILElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxRQUFRLENBQUMsS0FBYTtZQUNyQixJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7YUFDN0Q7WUFFRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRTtnQkFDeEMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ25DO1lBRUQsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssR0FBRyxJQUFJ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