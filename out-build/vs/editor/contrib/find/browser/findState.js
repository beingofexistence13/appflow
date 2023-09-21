/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "./findModel"], function (require, exports, event_1, lifecycle_1, range_1, findModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$t7 = exports.FindOptionOverride = void 0;
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
    class $t7 extends lifecycle_1.$kc {
        get searchString() { return this.a; }
        get replaceString() { return this.b; }
        get isRevealed() { return this.c; }
        get isReplaceRevealed() { return this.f; }
        get isRegex() { return effectiveOptionValue(this.h, this.g); }
        get wholeWord() { return effectiveOptionValue(this.m, this.j); }
        get matchCase() { return effectiveOptionValue(this.r, this.n); }
        get preserveCase() { return effectiveOptionValue(this.t, this.s); }
        get actualIsRegex() { return this.g; }
        get actualWholeWord() { return this.j; }
        get actualMatchCase() { return this.n; }
        get actualPreserveCase() { return this.s; }
        get searchScope() { return this.u; }
        get matchesPosition() { return this.w; }
        get matchesCount() { return this.y; }
        get currentMatch() { return this.z; }
        get isSearching() { return this.D; }
        get filters() { return this.F; }
        constructor() {
            super();
            this.G = this.B(new event_1.$fd());
            this.onFindReplaceStateChange = this.G.event;
            this.a = '';
            this.b = '';
            this.c = false;
            this.f = false;
            this.g = false;
            this.h = 0 /* FindOptionOverride.NotSet */;
            this.j = false;
            this.m = 0 /* FindOptionOverride.NotSet */;
            this.n = false;
            this.r = 0 /* FindOptionOverride.NotSet */;
            this.s = false;
            this.t = 0 /* FindOptionOverride.NotSet */;
            this.u = null;
            this.w = 0;
            this.y = 0;
            this.z = null;
            this.C = true;
            this.D = false;
            this.F = null;
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
            if (this.w !== matchesPosition) {
                this.w = matchesPosition;
                changeEvent.matchesPosition = true;
                somethingChanged = true;
            }
            if (this.y !== matchesCount) {
                this.y = matchesCount;
                changeEvent.matchesCount = true;
                somethingChanged = true;
            }
            if (typeof currentMatch !== 'undefined') {
                if (!range_1.$ks.equalsRange(this.z, currentMatch)) {
                    this.z = currentMatch;
                    changeEvent.currentMatch = true;
                    somethingChanged = true;
                }
            }
            if (somethingChanged) {
                this.G.fire(changeEvent);
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
                if (this.a !== newState.searchString) {
                    this.a = newState.searchString;
                    changeEvent.searchString = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.replaceString !== 'undefined') {
                if (this.b !== newState.replaceString) {
                    this.b = newState.replaceString;
                    changeEvent.replaceString = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isRevealed !== 'undefined') {
                if (this.c !== newState.isRevealed) {
                    this.c = newState.isRevealed;
                    changeEvent.isRevealed = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isReplaceRevealed !== 'undefined') {
                if (this.f !== newState.isReplaceRevealed) {
                    this.f = newState.isReplaceRevealed;
                    changeEvent.isReplaceRevealed = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isRegex !== 'undefined') {
                this.g = newState.isRegex;
            }
            if (typeof newState.wholeWord !== 'undefined') {
                this.j = newState.wholeWord;
            }
            if (typeof newState.matchCase !== 'undefined') {
                this.n = newState.matchCase;
            }
            if (typeof newState.preserveCase !== 'undefined') {
                this.s = newState.preserveCase;
            }
            if (typeof newState.searchScope !== 'undefined') {
                if (!newState.searchScope?.every((newSearchScope) => {
                    return this.u?.some(existingSearchScope => {
                        return !range_1.$ks.equalsRange(existingSearchScope, newSearchScope);
                    });
                })) {
                    this.u = newState.searchScope;
                    changeEvent.searchScope = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.loop !== 'undefined') {
                if (this.C !== newState.loop) {
                    this.C = newState.loop;
                    changeEvent.loop = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isSearching !== 'undefined') {
                if (this.D !== newState.isSearching) {
                    this.D = newState.isSearching;
                    changeEvent.isSearching = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.filters !== 'undefined') {
                if (this.F) {
                    this.F.update(newState.filters);
                }
                else {
                    this.F = newState.filters;
                }
                changeEvent.filters = true;
                somethingChanged = true;
            }
            // Overrides get set when they explicitly come in and get reset anytime something else changes
            this.h = (typeof newState.isRegexOverride !== 'undefined' ? newState.isRegexOverride : 0 /* FindOptionOverride.NotSet */);
            this.m = (typeof newState.wholeWordOverride !== 'undefined' ? newState.wholeWordOverride : 0 /* FindOptionOverride.NotSet */);
            this.r = (typeof newState.matchCaseOverride !== 'undefined' ? newState.matchCaseOverride : 0 /* FindOptionOverride.NotSet */);
            this.t = (typeof newState.preserveCaseOverride !== 'undefined' ? newState.preserveCaseOverride : 0 /* FindOptionOverride.NotSet */);
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
                this.G.fire(changeEvent);
            }
        }
        canNavigateBack() {
            return this.H() || (this.matchesPosition !== 1);
        }
        canNavigateForward() {
            return this.H() || (this.matchesPosition < this.matchesCount);
        }
        H() {
            return this.C || (this.matchesCount >= findModel_1.$I7);
        }
    }
    exports.$t7 = $t7;
});
//# sourceMappingURL=findState.js.map