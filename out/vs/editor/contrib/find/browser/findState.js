/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "./findModel"], function (require, exports, event_1, lifecycle_1, range_1, findModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FindReplaceState = exports.FindOptionOverride = void 0;
    var FindOptionOverride;
    (function (FindOptionOverride) {
        FindOptionOverride[FindOptionOverride["NotSet"] = 0] = "NotSet";
        FindOptionOverride[FindOptionOverride["True"] = 1] = "True";
        FindOptionOverride[FindOptionOverride["False"] = 2] = "False";
    })(FindOptionOverride || (exports.FindOptionOverride = FindOptionOverride = {}));
    function effectiveOptionValue(override, value) {
        if (override === 1 /* FindOptionOverride.True */) {
            return true;
        }
        if (override === 2 /* FindOptionOverride.False */) {
            return false;
        }
        return value;
    }
    class FindReplaceState extends lifecycle_1.Disposable {
        get searchString() { return this._searchString; }
        get replaceString() { return this._replaceString; }
        get isRevealed() { return this._isRevealed; }
        get isReplaceRevealed() { return this._isReplaceRevealed; }
        get isRegex() { return effectiveOptionValue(this._isRegexOverride, this._isRegex); }
        get wholeWord() { return effectiveOptionValue(this._wholeWordOverride, this._wholeWord); }
        get matchCase() { return effectiveOptionValue(this._matchCaseOverride, this._matchCase); }
        get preserveCase() { return effectiveOptionValue(this._preserveCaseOverride, this._preserveCase); }
        get actualIsRegex() { return this._isRegex; }
        get actualWholeWord() { return this._wholeWord; }
        get actualMatchCase() { return this._matchCase; }
        get actualPreserveCase() { return this._preserveCase; }
        get searchScope() { return this._searchScope; }
        get matchesPosition() { return this._matchesPosition; }
        get matchesCount() { return this._matchesCount; }
        get currentMatch() { return this._currentMatch; }
        get isSearching() { return this._isSearching; }
        get filters() { return this._filters; }
        constructor() {
            super();
            this._onFindReplaceStateChange = this._register(new event_1.Emitter());
            this.onFindReplaceStateChange = this._onFindReplaceStateChange.event;
            this._searchString = '';
            this._replaceString = '';
            this._isRevealed = false;
            this._isReplaceRevealed = false;
            this._isRegex = false;
            this._isRegexOverride = 0 /* FindOptionOverride.NotSet */;
            this._wholeWord = false;
            this._wholeWordOverride = 0 /* FindOptionOverride.NotSet */;
            this._matchCase = false;
            this._matchCaseOverride = 0 /* FindOptionOverride.NotSet */;
            this._preserveCase = false;
            this._preserveCaseOverride = 0 /* FindOptionOverride.NotSet */;
            this._searchScope = null;
            this._matchesPosition = 0;
            this._matchesCount = 0;
            this._currentMatch = null;
            this._loop = true;
            this._isSearching = false;
            this._filters = null;
        }
        changeMatchInfo(matchesPosition, matchesCount, currentMatch) {
            const changeEvent = {
                moveCursor: false,
                updateHistory: false,
                searchString: false,
                replaceString: false,
                isRevealed: false,
                isReplaceRevealed: false,
                isRegex: false,
                wholeWord: false,
                matchCase: false,
                preserveCase: false,
                searchScope: false,
                matchesPosition: false,
                matchesCount: false,
                currentMatch: false,
                loop: false,
                isSearching: false,
                filters: false
            };
            let somethingChanged = false;
            if (matchesCount === 0) {
                matchesPosition = 0;
            }
            if (matchesPosition > matchesCount) {
                matchesPosition = matchesCount;
            }
            if (this._matchesPosition !== matchesPosition) {
                this._matchesPosition = matchesPosition;
                changeEvent.matchesPosition = true;
                somethingChanged = true;
            }
            if (this._matchesCount !== matchesCount) {
                this._matchesCount = matchesCount;
                changeEvent.matchesCount = true;
                somethingChanged = true;
            }
            if (typeof currentMatch !== 'undefined') {
                if (!range_1.Range.equalsRange(this._currentMatch, currentMatch)) {
                    this._currentMatch = currentMatch;
                    changeEvent.currentMatch = true;
                    somethingChanged = true;
                }
            }
            if (somethingChanged) {
                this._onFindReplaceStateChange.fire(changeEvent);
            }
        }
        change(newState, moveCursor, updateHistory = true) {
            const changeEvent = {
                moveCursor: moveCursor,
                updateHistory: updateHistory,
                searchString: false,
                replaceString: false,
                isRevealed: false,
                isReplaceRevealed: false,
                isRegex: false,
                wholeWord: false,
                matchCase: false,
                preserveCase: false,
                searchScope: false,
                matchesPosition: false,
                matchesCount: false,
                currentMatch: false,
                loop: false,
                isSearching: false,
                filters: false
            };
            let somethingChanged = false;
            const oldEffectiveIsRegex = this.isRegex;
            const oldEffectiveWholeWords = this.wholeWord;
            const oldEffectiveMatchCase = this.matchCase;
            const oldEffectivePreserveCase = this.preserveCase;
            if (typeof newState.searchString !== 'undefined') {
                if (this._searchString !== newState.searchString) {
                    this._searchString = newState.searchString;
                    changeEvent.searchString = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.replaceString !== 'undefined') {
                if (this._replaceString !== newState.replaceString) {
                    this._replaceString = newState.replaceString;
                    changeEvent.replaceString = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isRevealed !== 'undefined') {
                if (this._isRevealed !== newState.isRevealed) {
                    this._isRevealed = newState.isRevealed;
                    changeEvent.isRevealed = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isReplaceRevealed !== 'undefined') {
                if (this._isReplaceRevealed !== newState.isReplaceRevealed) {
                    this._isReplaceRevealed = newState.isReplaceRevealed;
                    changeEvent.isReplaceRevealed = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isRegex !== 'undefined') {
                this._isRegex = newState.isRegex;
            }
            if (typeof newState.wholeWord !== 'undefined') {
                this._wholeWord = newState.wholeWord;
            }
            if (typeof newState.matchCase !== 'undefined') {
                this._matchCase = newState.matchCase;
            }
            if (typeof newState.preserveCase !== 'undefined') {
                this._preserveCase = newState.preserveCase;
            }
            if (typeof newState.searchScope !== 'undefined') {
                if (!newState.searchScope?.every((newSearchScope) => {
                    return this._searchScope?.some(existingSearchScope => {
                        return !range_1.Range.equalsRange(existingSearchScope, newSearchScope);
                    });
                })) {
                    this._searchScope = newState.searchScope;
                    changeEvent.searchScope = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.loop !== 'undefined') {
                if (this._loop !== newState.loop) {
                    this._loop = newState.loop;
                    changeEvent.loop = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isSearching !== 'undefined') {
                if (this._isSearching !== newState.isSearching) {
                    this._isSearching = newState.isSearching;
                    changeEvent.isSearching = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.filters !== 'undefined') {
                if (this._filters) {
                    this._filters.update(newState.filters);
                }
                else {
                    this._filters = newState.filters;
                }
                changeEvent.filters = true;
                somethingChanged = true;
            }
            // Overrides get set when they explicitly come in and get reset anytime something else changes
            this._isRegexOverride = (typeof newState.isRegexOverride !== 'undefined' ? newState.isRegexOverride : 0 /* FindOptionOverride.NotSet */);
            this._wholeWordOverride = (typeof newState.wholeWordOverride !== 'undefined' ? newState.wholeWordOverride : 0 /* FindOptionOverride.NotSet */);
            this._matchCaseOverride = (typeof newState.matchCaseOverride !== 'undefined' ? newState.matchCaseOverride : 0 /* FindOptionOverride.NotSet */);
            this._preserveCaseOverride = (typeof newState.preserveCaseOverride !== 'undefined' ? newState.preserveCaseOverride : 0 /* FindOptionOverride.NotSet */);
            if (oldEffectiveIsRegex !== this.isRegex) {
                somethingChanged = true;
                changeEvent.isRegex = true;
            }
            if (oldEffectiveWholeWords !== this.wholeWord) {
                somethingChanged = true;
                changeEvent.wholeWord = true;
            }
            if (oldEffectiveMatchCase !== this.matchCase) {
                somethingChanged = true;
                changeEvent.matchCase = true;
            }
            if (oldEffectivePreserveCase !== this.preserveCase) {
                somethingChanged = true;
                changeEvent.preserveCase = true;
            }
            if (somethingChanged) {
                this._onFindReplaceStateChange.fire(changeEvent);
            }
        }
        canNavigateBack() {
            return this.canNavigateInLoop() || (this.matchesPosition !== 1);
        }
        canNavigateForward() {
            return this.canNavigateInLoop() || (this.matchesPosition < this.matchesCount);
        }
        canNavigateInLoop() {
            return this._loop || (this.matchesCount >= findModel_1.MATCHES_LIMIT);
        }
    }
    exports.FindReplaceState = FindReplaceState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZFN0YXRlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZmluZC9icm93c2VyL2ZpbmRTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE0QmhHLElBQWtCLGtCQUlqQjtJQUpELFdBQWtCLGtCQUFrQjtRQUNuQywrREFBVSxDQUFBO1FBQ1YsMkRBQVEsQ0FBQTtRQUNSLDZEQUFTLENBQUE7SUFDVixDQUFDLEVBSmlCLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBSW5DO0lBcUJELFNBQVMsb0JBQW9CLENBQUMsUUFBNEIsRUFBRSxLQUFjO1FBQ3pFLElBQUksUUFBUSxvQ0FBNEIsRUFBRTtZQUN6QyxPQUFPLElBQUksQ0FBQztTQUNaO1FBQ0QsSUFBSSxRQUFRLHFDQUE2QixFQUFFO1lBQzFDLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCxNQUFhLGdCQUFrRixTQUFRLHNCQUFVO1FBc0JoSCxJQUFXLFlBQVksS0FBYSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLElBQVcsYUFBYSxLQUFhLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDbEUsSUFBVyxVQUFVLEtBQWMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUM3RCxJQUFXLGlCQUFpQixLQUFjLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUMzRSxJQUFXLE9BQU8sS0FBYyxPQUFPLG9CQUFvQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BHLElBQVcsU0FBUyxLQUFjLE9BQU8sb0JBQW9CLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElB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