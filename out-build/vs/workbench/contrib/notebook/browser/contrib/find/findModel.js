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
    exports.$yob = exports.$xob = void 0;
    class $xob {
        get length() {
            return this.a.length + this.b.length;
        }
        get contentMatches() {
            return this.a;
        }
        get webviewMatches() {
            return this.b;
        }
        constructor(cell, index, contentMatches, webviewMatches) {
            this.cell = cell;
            this.index = index;
            this.a = contentMatches;
            this.b = webviewMatches;
        }
        getMatch(index) {
            if (index >= this.length) {
                throw new Error('NotebookCellFindMatch: index out of range');
            }
            if (index < this.a.length) {
                return this.a[index];
            }
            return this.b[index - this.a.length];
        }
    }
    exports.$xob = $xob;
    let $yob = class $yob extends lifecycle_1.$kc {
        get findMatches() {
            return this.a;
        }
        get currentMatch() {
            return this.f;
        }
        constructor(r, s, t) {
            super();
            this.r = r;
            this.s = s;
            this.t = t;
            this.a = [];
            this.b = null;
            this.f = -1;
            this.h = null;
            this.j = this.B(new lifecycle_1.$jc());
            this.g = new async_1.$Dg(20);
            this.h = null;
            this.B(s.onFindReplaceStateChange(e => {
                this.u(e);
                if (e.searchString || e.isRegex || e.matchCase || e.searchScope || e.wholeWord || (e.isRevealed && this.s.isRevealed) || e.filters || e.isReplaceRevealed) {
                    this.research();
                }
                if (e.isRevealed && !this.s.isRevealed) {
                    this.clear();
                }
            }));
            this.B(this.r.onDidChangeModel(e => {
                this.y(e);
            }));
            this.B(this.r.onDidChangeCellState(e => {
                if (e.cell.cellKind === notebookCommon_1.CellKind.Markup && e.source.editStateChanged) {
                    // research when markdown cell is switching between markdown preview and editing mode.
                    this.research();
                }
            }));
            if (this.r.hasModel()) {
                this.y(this.r.textModel);
            }
            this.n = new findMatchDecorationModel_1.$wob(this.r, this.r.getId());
        }
        u(e) {
            if (!this.s.filters?.markupInput) {
                return;
            }
            if (!this.s.filters?.markupPreview) {
                return;
            }
            // we only update cell state if users are using the hybrid mode (both input and preview are enabled)
            const updateEditingState = () => {
                const viewModel = this.r.getViewModel();
                if (!viewModel) {
                    return;
                }
                // search markup sources first to decide if a markup cell should be in editing mode
                const wordSeparators = this.t.inspect('editor.wordSeparators').value;
                const options = {
                    regex: this.s.isRegex,
                    wholeWord: this.s.wholeWord,
                    caseSensitive: this.s.matchCase,
                    wordSeparators: wordSeparators,
                    includeMarkupInput: true,
                    includeCodeInput: false,
                    includeMarkupPreview: false,
                    includeOutput: false
                };
                const contentMatches = viewModel.find(this.s.searchString, options);
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
            if (e.isReplaceRevealed && !this.s.isReplaceRevealed) {
                // replace is hidden, we need to switch all markdown cells to preview mode
                const viewModel = this.r.getViewModel();
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
            else if ((e.filters || e.isRevealed || e.searchString || e.replaceString) && this.s.isRevealed && this.s.isReplaceRevealed) {
                updateEditingState();
            }
        }
        ensureFindMatches() {
            if (!this.b) {
                this.z(this.a, true);
            }
        }
        getCurrentMatch() {
            const nextIndex = this.b.getIndexOf(this.f);
            const cell = this.a[nextIndex.index].cell;
            const match = this.a[nextIndex.index].getMatch(nextIndex.remainder);
            return {
                cell,
                match,
                isModelMatch: nextIndex.remainder < this.a[nextIndex.index].contentMatches.length
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
            const matchesBefore = findMatchIndex === 0 ? 0 : (this.b?.getPrefixSum(findMatchIndex - 1) ?? 0);
            this.f = matchesBefore + index;
            this.H(findMatchIndex, index).then(offset => {
                this.w(findMatchIndex, index, offset);
                this.s.changeMatchInfo(this.f, this.a.reduce((p, c) => p + c.length, 0), undefined);
            });
        }
        find(option) {
            if (!this.findMatches.length) {
                return;
            }
            // let currCell;
            if (!this.b) {
                this.z(this.a, true);
                if ('index' in option) {
                    this.f = option.index;
                }
            }
            else {
                // const currIndex = this._findMatchesStarts!.getIndexOf(this._currentMatch);
                // currCell = this._findMatches[currIndex.index].cell;
                const totalVal = this.b.getTotalSum();
                if ('index' in option) {
                    this.f = option.index;
                }
                else if (this.f === -1) {
                    this.f = option.previous ? totalVal - 1 : 0;
                }
                else {
                    const nextVal = (this.f + (option.previous ? -1 : 1) + totalVal) % totalVal;
                    this.f = nextVal;
                }
            }
            const nextIndex = this.b.getIndexOf(this.f);
            // const newFocusedCell = this._findMatches[nextIndex.index].cell;
            this.H(nextIndex.index, nextIndex.remainder).then(offset => {
                this.w(nextIndex.index, nextIndex.remainder, offset);
                this.s.changeMatchInfo(this.f, this.a.reduce((p, c) => p + c.length, 0), undefined);
            });
        }
        w(cellIndex, matchIndex, outputOffset) {
            const findMatch = this.a[cellIndex];
            if (matchIndex >= findMatch.contentMatches.length) {
                // reveal output range
                this.r.focusElement(findMatch.cell);
                const index = this.r.getCellIndex(findMatch.cell);
                if (index !== undefined) {
                    // const range: ICellRange = { start: index, end: index + 1 };
                    this.r.revealCellOffsetInCenterAsync(findMatch.cell, outputOffset ?? 0);
                }
            }
            else {
                const match = findMatch.getMatch(matchIndex);
                if (findMatch.cell.getEditState() !== notebookBrowser_1.CellEditState.Editing) {
                    findMatch.cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'find');
                }
                findMatch.cell.isInputCollapsed = false;
                this.r.focusElement(findMatch.cell);
                this.r.setCellEditorSelection(findMatch.cell, match.range);
                this.r.revealRangeInCenterIfOutsideViewportAsync(findMatch.cell, match.range);
            }
        }
        y(notebookTextModel) {
            this.j.clear();
            if (notebookTextModel) {
                this.j.add(notebookTextModel.onDidChangeContent((e) => {
                    if (!e.rawEvents.some(event => event.kind === notebookCommon_1.NotebookCellsChangeType.ChangeCellContent || event.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange)) {
                        return;
                    }
                    this.research();
                }));
            }
            this.research();
        }
        async research() {
            return this.g.trigger(async () => {
                this.s.change({ isSearching: true }, false);
                await this._research();
                this.s.change({ isSearching: false }, false);
            });
        }
        async _research() {
            this.h?.cancel();
            if (!this.s.isRevealed || !this.r.hasModel()) {
                this.z([], false);
                return;
            }
            this.h = (0, async_1.$ug)(token => this.C(token));
            const findMatches = await this.h;
            if (!findMatches) {
                this.z([], false);
                return;
            }
            if (findMatches.length === 0) {
                this.z([], false);
                return;
            }
            const findFirstMatchAfterCellIndex = (cellIndex) => {
                const matchAfterSelection = (0, arraysFind_1.$ib)(findMatches.map(match => match.index), index => index >= cellIndex);
                this.D(findMatches, this.F(findMatches, matchAfterSelection));
            };
            if (this.f === -1) {
                // no active current match
                if (this.r.getLength() === 0) {
                    this.z(findMatches, false);
                    return;
                }
                else {
                    const focus = this.r.getFocus().start;
                    findFirstMatchAfterCellIndex(focus);
                    this.z(findMatches, false);
                    return;
                }
            }
            const oldCurrIndex = this.b.getIndexOf(this.f);
            const oldCurrCell = this.a[oldCurrIndex.index].cell;
            const oldCurrMatchCellIndex = this.r.getCellIndex(oldCurrCell);
            if (oldCurrMatchCellIndex < 0) {
                // the cell containing the active match is deleted
                if (this.r.getLength() === 0) {
                    this.z(findMatches, false);
                    return;
                }
                findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
                return;
            }
            // the cell still exist
            const cell = this.r.cellAt(oldCurrMatchCellIndex);
            // we will try restore the active find match in this cell, if it contains any find match
            if (cell.cellKind === notebookCommon_1.CellKind.Markup && cell.getEditState() === notebookBrowser_1.CellEditState.Preview) {
                // find first match in this cell or below
                findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
                return;
            }
            // the cell is a markup cell in editing mode or a code cell, both should have monaco editor rendered
            if (!this.n.currentMatchDecorations) {
                // no current highlight decoration
                findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
                return;
            }
            // check if there is monaco editor selection and find the first match, otherwise find the first match above current cell
            // this._findMatches[cellIndex].matches[matchIndex].range
            if (this.n.currentMatchDecorations.kind === 'input') {
                const currentMatchDecorationId = this.n.currentMatchDecorations.decorations.find(decoration => decoration.ownerId === cell.handle);
                if (!currentMatchDecorationId) {
                    // current match decoration is no longer valid
                    findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
                    return;
                }
                const matchAfterSelection = (0, arraysFind_1.$ib)(findMatches, match => match.index >= oldCurrMatchCellIndex) % findMatches.length;
                if (findMatches[matchAfterSelection].index > oldCurrMatchCellIndex) {
                    // there is no search result in curr cell anymore, find the nearest one (from top to bottom)
                    this.D(findMatches, this.F(findMatches, matchAfterSelection));
                    return;
                }
                else {
                    // there are still some search results in current cell
                    let currMatchRangeInEditor = cell.editorAttached && currentMatchDecorationId.decorations[0] ? cell.getCellDecorationRange(currentMatchDecorationId.decorations[0]) : null;
                    if (currMatchRangeInEditor === null && oldCurrIndex.remainder < this.a[oldCurrIndex.index].contentMatches.length) {
                        currMatchRangeInEditor = this.a[oldCurrIndex.index].getMatch(oldCurrIndex.remainder).range;
                    }
                    if (currMatchRangeInEditor !== null) {
                        // we find a range for the previous current match, let's find the nearest one after it (can overlap)
                        const cellMatch = findMatches[matchAfterSelection];
                        const matchAfterOldSelection = (0, arraysFind_1.$ib)(cellMatch.contentMatches, match => range_1.$ks.compareRangesUsingStarts(match.range, currMatchRangeInEditor) >= 0);
                        this.D(findMatches, this.F(findMatches, matchAfterSelection) + matchAfterOldSelection);
                    }
                    else {
                        // no range found, let's fall back to finding the nearest match
                        this.D(findMatches, this.F(findMatches, matchAfterSelection));
                        return;
                    }
                }
            }
            else {
                // output now has the highlight
                const matchAfterSelection = (0, arraysFind_1.$ib)(findMatches.map(match => match.index), index => index >= oldCurrMatchCellIndex) % findMatches.length;
                this.D(findMatches, this.F(findMatches, matchAfterSelection));
            }
        }
        z(cellFindMatches, autoStart) {
            if (!cellFindMatches || !cellFindMatches.length) {
                this.a = [];
                this.n.setAllFindMatchesDecorations([]);
                this.G();
                this.f = -1;
                this.n.clearCurrentFindMatchDecoration();
                this.s.changeMatchInfo(this.f, this.a.reduce((p, c) => p + c.length, 0), undefined);
                return;
            }
            // all matches
            this.a = cellFindMatches;
            this.n.setAllFindMatchesDecorations(cellFindMatches || []);
            // current match
            this.G();
            if (autoStart) {
                this.f = 0;
                this.H(0, 0);
            }
            this.s.changeMatchInfo(this.f, this.a.reduce((p, c) => p + c.length, 0), undefined);
        }
        async C(token) {
            if (!this.r.hasModel()) {
                return null;
            }
            let ret = null;
            const val = this.s.searchString;
            const wordSeparators = this.t.inspect('editor.wordSeparators').value;
            const options = {
                regex: this.s.isRegex,
                wholeWord: this.s.wholeWord,
                caseSensitive: this.s.matchCase,
                wordSeparators: wordSeparators,
                includeMarkupInput: this.s.filters?.markupInput ?? true,
                includeCodeInput: this.s.filters?.codeInput ?? true,
                includeMarkupPreview: !!this.s.filters?.markupPreview,
                includeOutput: !!this.s.filters?.codeOutput
            };
            ret = await this.r.find(val, options, token);
            if (token.isCancellationRequested) {
                return null;
            }
            return ret;
        }
        D(findMatches, currentMatchesPosition) {
            this.z(findMatches, false);
            this.f = currentMatchesPosition % findMatches.length;
            const nextIndex = this.b.getIndexOf(this.f);
            this.H(nextIndex.index, nextIndex.remainder);
            this.s.changeMatchInfo(this.f, this.a.reduce((p, c) => p + c.length, 0), undefined);
        }
        F(findMatches, index) {
            let prevMatchesCount = 0;
            for (let i = 0; i < index; i++) {
                prevMatchesCount += findMatches[i].length;
            }
            return prevMatchesCount;
        }
        G() {
            if (this.a && this.a.length) {
                const values = new Uint32Array(this.a.length);
                for (let i = 0; i < this.a.length; i++) {
                    values[i] = this.a[i].length;
                }
                this.b = new prefixSumComputer_1.$Ju(values);
            }
            else {
                this.b = null;
            }
        }
        async H(cellIndex, matchIndex) {
            const cell = this.a[cellIndex].cell;
            const match = this.a[cellIndex].getMatch(matchIndex);
            if (matchIndex < this.a[cellIndex].contentMatches.length) {
                return this.n.highlightCurrentFindMatchDecorationInCell(cell, match.range);
            }
            else {
                return this.n.highlightCurrentFindMatchDecorationInWebview(cell, match.index);
            }
        }
        clear() {
            this.h?.cancel();
            this.g.cancel();
            this.z([], false);
        }
        dispose() {
            this.n.dispose();
            super.dispose();
        }
    };
    exports.$yob = $yob;
    exports.$yob = $yob = __decorate([
        __param(2, configuration_1.$8h)
    ], $yob);
});
//# sourceMappingURL=findModel.js.map