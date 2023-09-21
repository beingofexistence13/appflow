/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/languages/supports", "vs/editor/common/languages/supports/richEditBrackets", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/bracketPairsTree"], function (require, exports, arrays_1, event_1, lifecycle_1, range_1, supports_1, richEditBrackets_1, bracketPairsTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QA = void 0;
    class $QA extends lifecycle_1.$kc {
        get f() {
            const maxSupportedDocumentLength = /* max lines */ 50000 * /* average column count */ 100;
            return this.h.getValueLength() <= maxSupportedDocumentLength;
        }
        constructor(h, j) {
            super();
            this.h = h;
            this.j = j;
            this.a = this.B(new lifecycle_1.$lc());
            this.c = new event_1.$fd();
            this.onDidChange = this.c.event;
            this.g = false;
            this.B(this.j.onDidChange(e => {
                if (!e.languageId || this.a.value?.object.didLanguageChange(e.languageId)) {
                    this.a.clear();
                    this.m();
                }
            }));
        }
        //#region TextModel events
        handleDidChangeOptions(e) {
            this.a.clear();
            this.m();
        }
        handleDidChangeLanguage(e) {
            this.a.clear();
            this.m();
        }
        handleDidChangeContent(change) {
            this.a.value?.object.handleContentChanged(change);
        }
        handleDidChangeBackgroundTokenizationState() {
            this.a.value?.object.handleDidChangeBackgroundTokenizationState();
        }
        handleDidChangeTokens(e) {
            this.a.value?.object.handleDidChangeTokens(e);
        }
        //#endregion
        m() {
            if (this.g && this.f) {
                if (!this.a.value) {
                    const store = new lifecycle_1.$jc();
                    this.a.value = createDisposableRef(store.add(new bracketPairsTree_1.$PA(this.h, (languageId) => {
                        return this.j.getLanguageConfiguration(languageId);
                    })), store);
                    store.add(this.a.value.object.onDidChange(e => this.c.fire(e)));
                    this.c.fire();
                }
            }
            else {
                if (this.a.value) {
                    this.a.clear();
                    // Important: Don't call fire if there was no change!
                    this.c.fire();
                }
            }
        }
        /**
         * Returns all bracket pairs that intersect the given range.
         * The result is sorted by the start position.
        */
        getBracketPairsInRange(range) {
            this.g = true;
            this.m();
            return this.a.value?.object.getBracketPairsInRange(range, false) || arrays_1.$$b.empty;
        }
        getBracketPairsInRangeWithMinIndentation(range) {
            this.g = true;
            this.m();
            return this.a.value?.object.getBracketPairsInRange(range, true) || arrays_1.$$b.empty;
        }
        getBracketsInRange(range, onlyColorizedBrackets = false) {
            this.g = true;
            this.m();
            return this.a.value?.object.getBracketsInRange(range, onlyColorizedBrackets) || arrays_1.$$b.empty;
        }
        findMatchingBracketUp(_bracket, _position, maxDuration) {
            const position = this.h.validatePosition(_position);
            const languageId = this.h.getLanguageIdAtPosition(position.lineNumber, position.column);
            if (this.f) {
                const closingBracketInfo = this.j
                    .getLanguageConfiguration(languageId)
                    .bracketsNew.getClosingBracketInfo(_bracket);
                if (!closingBracketInfo) {
                    return null;
                }
                const bracketPair = this.getBracketPairsInRange(range_1.$ks.fromPositions(_position, _position)).findLast((b) => closingBracketInfo.closes(b.openingBracketInfo));
                if (bracketPair) {
                    return bracketPair.openingBracketRange;
                }
                return null;
            }
            else {
                // Fallback to old bracket matching code:
                const bracket = _bracket.toLowerCase();
                const bracketsSupport = this.j.getLanguageConfiguration(languageId).brackets;
                if (!bracketsSupport) {
                    return null;
                }
                const data = bracketsSupport.textIsBracket[bracket];
                if (!data) {
                    return null;
                }
                return stripBracketSearchCanceled(this.u(data, position, createTimeBasedContinueBracketSearchPredicate(maxDuration)));
            }
        }
        matchBracket(position, maxDuration) {
            if (this.f) {
                const bracketPair = this.getBracketPairsInRange(range_1.$ks.fromPositions(position, position)).filter((item) => item.closingBracketRange !== undefined &&
                    (item.openingBracketRange.containsPosition(position) ||
                        item.closingBracketRange.containsPosition(position))).findLastMaxBy((0, arrays_1.$5b)((item) => item.openingBracketRange.containsPosition(position)
                    ? item.openingBracketRange
                    : item.closingBracketRange, range_1.$ks.compareRangesUsingStarts));
                if (bracketPair) {
                    return [bracketPair.openingBracketRange, bracketPair.closingBracketRange];
                }
                return null;
            }
            else {
                // Fallback to old bracket matching code:
                const continueSearchPredicate = createTimeBasedContinueBracketSearchPredicate(maxDuration);
                return this.s(this.h.validatePosition(position), continueSearchPredicate);
            }
        }
        n(position, lineTokens, modeBrackets, tokenIndex) {
            const tokenCount = lineTokens.getCount();
            const currentLanguageId = lineTokens.getLanguageId(tokenIndex);
            // limit search to not go before `maxBracketLength`
            let searchStartOffset = Math.max(0, position.column - 1 - modeBrackets.maxBracketLength);
            for (let i = tokenIndex - 1; i >= 0; i--) {
                const tokenEndOffset = lineTokens.getEndOffset(i);
                if (tokenEndOffset <= searchStartOffset) {
                    break;
                }
                if ((0, supports_1.$ft)(lineTokens.getStandardTokenType(i)) || lineTokens.getLanguageId(i) !== currentLanguageId) {
                    searchStartOffset = tokenEndOffset;
                    break;
                }
            }
            // limit search to not go after `maxBracketLength`
            let searchEndOffset = Math.min(lineTokens.getLineContent().length, position.column - 1 + modeBrackets.maxBracketLength);
            for (let i = tokenIndex + 1; i < tokenCount; i++) {
                const tokenStartOffset = lineTokens.getStartOffset(i);
                if (tokenStartOffset >= searchEndOffset) {
                    break;
                }
                if ((0, supports_1.$ft)(lineTokens.getStandardTokenType(i)) || lineTokens.getLanguageId(i) !== currentLanguageId) {
                    searchEndOffset = tokenStartOffset;
                    break;
                }
            }
            return { searchStartOffset, searchEndOffset };
        }
        s(position, continueSearchPredicate) {
            const lineNumber = position.lineNumber;
            const lineTokens = this.h.tokenization.getLineTokens(lineNumber);
            const lineText = this.h.getLineContent(lineNumber);
            const tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
            if (tokenIndex < 0) {
                return null;
            }
            const currentModeBrackets = this.j.getLanguageConfiguration(lineTokens.getLanguageId(tokenIndex)).brackets;
            // check that the token is not to be ignored
            if (currentModeBrackets && !(0, supports_1.$ft)(lineTokens.getStandardTokenType(tokenIndex))) {
                let { searchStartOffset, searchEndOffset } = this.n(position, lineTokens, currentModeBrackets, tokenIndex);
                // it might be the case that [currentTokenStart -> currentTokenEnd] contains multiple brackets
                // `bestResult` will contain the most right-side result
                let bestResult = null;
                while (true) {
                    const foundBracket = richEditBrackets_1.$Rt.findNextBracketInRange(currentModeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (!foundBracket) {
                        // there are no more brackets in this text
                        break;
                    }
                    // check that we didn't hit a bracket too far away from position
                    if (foundBracket.startColumn <= position.column && position.column <= foundBracket.endColumn) {
                        const foundBracketText = lineText.substring(foundBracket.startColumn - 1, foundBracket.endColumn - 1).toLowerCase();
                        const r = this.t(foundBracket, currentModeBrackets.textIsBracket[foundBracketText], currentModeBrackets.textIsOpenBracket[foundBracketText], continueSearchPredicate);
                        if (r) {
                            if (r instanceof BracketSearchCanceled) {
                                return null;
                            }
                            bestResult = r;
                        }
                    }
                    searchStartOffset = foundBracket.endColumn - 1;
                }
                if (bestResult) {
                    return bestResult;
                }
            }
            // If position is in between two tokens, try also looking in the previous token
            if (tokenIndex > 0 && lineTokens.getStartOffset(tokenIndex) === position.column - 1) {
                const prevTokenIndex = tokenIndex - 1;
                const prevModeBrackets = this.j.getLanguageConfiguration(lineTokens.getLanguageId(prevTokenIndex)).brackets;
                // check that previous token is not to be ignored
                if (prevModeBrackets && !(0, supports_1.$ft)(lineTokens.getStandardTokenType(prevTokenIndex))) {
                    const { searchStartOffset, searchEndOffset } = this.n(position, lineTokens, prevModeBrackets, prevTokenIndex);
                    const foundBracket = richEditBrackets_1.$Rt.findPrevBracketInRange(prevModeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    // check that we didn't hit a bracket too far away from position
                    if (foundBracket && foundBracket.startColumn <= position.column && position.column <= foundBracket.endColumn) {
                        const foundBracketText = lineText.substring(foundBracket.startColumn - 1, foundBracket.endColumn - 1).toLowerCase();
                        const r = this.t(foundBracket, prevModeBrackets.textIsBracket[foundBracketText], prevModeBrackets.textIsOpenBracket[foundBracketText], continueSearchPredicate);
                        if (r) {
                            if (r instanceof BracketSearchCanceled) {
                                return null;
                            }
                            return r;
                        }
                    }
                }
            }
            return null;
        }
        t(foundBracket, data, isOpen, continueSearchPredicate) {
            if (!data) {
                return null;
            }
            const matched = (isOpen
                ? this.w(data, foundBracket.getEndPosition(), continueSearchPredicate)
                : this.u(data, foundBracket.getStartPosition(), continueSearchPredicate));
            if (!matched) {
                return null;
            }
            if (matched instanceof BracketSearchCanceled) {
                return matched;
            }
            return [foundBracket, matched];
        }
        u(bracket, position, continueSearchPredicate) {
            // console.log('_findMatchingBracketUp: ', 'bracket: ', JSON.stringify(bracket), 'startPosition: ', String(position));
            const languageId = bracket.languageId;
            const reversedBracketRegex = bracket.reversedRegex;
            let count = -1;
            let totalCallCount = 0;
            const searchPrevMatchingBracketInRange = (lineNumber, lineText, searchStartOffset, searchEndOffset) => {
                while (true) {
                    if (continueSearchPredicate && (++totalCallCount) % 100 === 0 && !continueSearchPredicate()) {
                        return BracketSearchCanceled.INSTANCE;
                    }
                    const r = richEditBrackets_1.$Rt.findPrevBracketInRange(reversedBracketRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (!r) {
                        break;
                    }
                    const hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
                    if (bracket.isOpen(hitText)) {
                        count++;
                    }
                    else if (bracket.isClose(hitText)) {
                        count--;
                    }
                    if (count === 0) {
                        return r;
                    }
                    searchEndOffset = r.startColumn - 1;
                }
                return null;
            };
            for (let lineNumber = position.lineNumber; lineNumber >= 1; lineNumber--) {
                const lineTokens = this.h.tokenization.getLineTokens(lineNumber);
                const tokenCount = lineTokens.getCount();
                const lineText = this.h.getLineContent(lineNumber);
                let tokenIndex = tokenCount - 1;
                let searchStartOffset = lineText.length;
                let searchEndOffset = lineText.length;
                if (lineNumber === position.lineNumber) {
                    tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
                    searchStartOffset = position.column - 1;
                    searchEndOffset = position.column - 1;
                }
                let prevSearchInToken = true;
                for (; tokenIndex >= 0; tokenIndex--) {
                    const searchInToken = (lineTokens.getLanguageId(tokenIndex) === languageId && !(0, supports_1.$ft)(lineTokens.getStandardTokenType(tokenIndex)));
                    if (searchInToken) {
                        // this token should be searched
                        if (prevSearchInToken) {
                            // the previous token should be searched, simply extend searchStartOffset
                            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                        }
                        else {
                            // the previous token should not be searched
                            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                        }
                    }
                    else {
                        // this token should not be searched
                        if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
                            const r = searchPrevMatchingBracketInRange(lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return r;
                            }
                        }
                    }
                    prevSearchInToken = searchInToken;
                }
                if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
                    const r = searchPrevMatchingBracketInRange(lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (r) {
                        return r;
                    }
                }
            }
            return null;
        }
        w(bracket, position, continueSearchPredicate) {
            // console.log('_findMatchingBracketDown: ', 'bracket: ', JSON.stringify(bracket), 'startPosition: ', String(position));
            const languageId = bracket.languageId;
            const bracketRegex = bracket.forwardRegex;
            let count = 1;
            let totalCallCount = 0;
            const searchNextMatchingBracketInRange = (lineNumber, lineText, searchStartOffset, searchEndOffset) => {
                while (true) {
                    if (continueSearchPredicate && (++totalCallCount) % 100 === 0 && !continueSearchPredicate()) {
                        return BracketSearchCanceled.INSTANCE;
                    }
                    const r = richEditBrackets_1.$Rt.findNextBracketInRange(bracketRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (!r) {
                        break;
                    }
                    const hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
                    if (bracket.isOpen(hitText)) {
                        count++;
                    }
                    else if (bracket.isClose(hitText)) {
                        count--;
                    }
                    if (count === 0) {
                        return r;
                    }
                    searchStartOffset = r.endColumn - 1;
                }
                return null;
            };
            const lineCount = this.h.getLineCount();
            for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
                const lineTokens = this.h.tokenization.getLineTokens(lineNumber);
                const tokenCount = lineTokens.getCount();
                const lineText = this.h.getLineContent(lineNumber);
                let tokenIndex = 0;
                let searchStartOffset = 0;
                let searchEndOffset = 0;
                if (lineNumber === position.lineNumber) {
                    tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
                    searchStartOffset = position.column - 1;
                    searchEndOffset = position.column - 1;
                }
                let prevSearchInToken = true;
                for (; tokenIndex < tokenCount; tokenIndex++) {
                    const searchInToken = (lineTokens.getLanguageId(tokenIndex) === languageId && !(0, supports_1.$ft)(lineTokens.getStandardTokenType(tokenIndex)));
                    if (searchInToken) {
                        // this token should be searched
                        if (prevSearchInToken) {
                            // the previous token should be searched, simply extend searchEndOffset
                            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                        }
                        else {
                            // the previous token should not be searched
                            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                        }
                    }
                    else {
                        // this token should not be searched
                        if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
                            const r = searchNextMatchingBracketInRange(lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return r;
                            }
                        }
                    }
                    prevSearchInToken = searchInToken;
                }
                if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
                    const r = searchNextMatchingBracketInRange(lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (r) {
                        return r;
                    }
                }
            }
            return null;
        }
        findPrevBracket(_position) {
            const position = this.h.validatePosition(_position);
            if (this.f) {
                this.g = true;
                this.m();
                return this.a.value?.object.getFirstBracketBefore(position) || null;
            }
            let languageId = null;
            let modeBrackets = null;
            let bracketConfig = null;
            for (let lineNumber = position.lineNumber; lineNumber >= 1; lineNumber--) {
                const lineTokens = this.h.tokenization.getLineTokens(lineNumber);
                const tokenCount = lineTokens.getCount();
                const lineText = this.h.getLineContent(lineNumber);
                let tokenIndex = tokenCount - 1;
                let searchStartOffset = lineText.length;
                let searchEndOffset = lineText.length;
                if (lineNumber === position.lineNumber) {
                    tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
                    searchStartOffset = position.column - 1;
                    searchEndOffset = position.column - 1;
                    const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                    if (languageId !== tokenLanguageId) {
                        languageId = tokenLanguageId;
                        modeBrackets = this.j.getLanguageConfiguration(languageId).brackets;
                        bracketConfig = this.j.getLanguageConfiguration(languageId).bracketsNew;
                    }
                }
                let prevSearchInToken = true;
                for (; tokenIndex >= 0; tokenIndex--) {
                    const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                    if (languageId !== tokenLanguageId) {
                        // language id change!
                        if (modeBrackets && bracketConfig && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                            const r = richEditBrackets_1.$Rt.findPrevBracketInRange(modeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return this.y(bracketConfig, r);
                            }
                            prevSearchInToken = false;
                        }
                        languageId = tokenLanguageId;
                        modeBrackets = this.j.getLanguageConfiguration(languageId).brackets;
                        bracketConfig = this.j.getLanguageConfiguration(languageId).bracketsNew;
                    }
                    const searchInToken = (!!modeBrackets && !(0, supports_1.$ft)(lineTokens.getStandardTokenType(tokenIndex)));
                    if (searchInToken) {
                        // this token should be searched
                        if (prevSearchInToken) {
                            // the previous token should be searched, simply extend searchStartOffset
                            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                        }
                        else {
                            // the previous token should not be searched
                            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                        }
                    }
                    else {
                        // this token should not be searched
                        if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                            const r = richEditBrackets_1.$Rt.findPrevBracketInRange(modeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return this.y(bracketConfig, r);
                            }
                        }
                    }
                    prevSearchInToken = searchInToken;
                }
                if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                    const r = richEditBrackets_1.$Rt.findPrevBracketInRange(modeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (r) {
                        return this.y(bracketConfig, r);
                    }
                }
            }
            return null;
        }
        findNextBracket(_position) {
            const position = this.h.validatePosition(_position);
            if (this.f) {
                this.g = true;
                this.m();
                return this.a.value?.object.getFirstBracketAfter(position) || null;
            }
            const lineCount = this.h.getLineCount();
            let languageId = null;
            let modeBrackets = null;
            let bracketConfig = null;
            for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
                const lineTokens = this.h.tokenization.getLineTokens(lineNumber);
                const tokenCount = lineTokens.getCount();
                const lineText = this.h.getLineContent(lineNumber);
                let tokenIndex = 0;
                let searchStartOffset = 0;
                let searchEndOffset = 0;
                if (lineNumber === position.lineNumber) {
                    tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
                    searchStartOffset = position.column - 1;
                    searchEndOffset = position.column - 1;
                    const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                    if (languageId !== tokenLanguageId) {
                        languageId = tokenLanguageId;
                        modeBrackets = this.j.getLanguageConfiguration(languageId).brackets;
                        bracketConfig = this.j.getLanguageConfiguration(languageId).bracketsNew;
                    }
                }
                let prevSearchInToken = true;
                for (; tokenIndex < tokenCount; tokenIndex++) {
                    const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                    if (languageId !== tokenLanguageId) {
                        // language id change!
                        if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                            const r = richEditBrackets_1.$Rt.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return this.y(bracketConfig, r);
                            }
                            prevSearchInToken = false;
                        }
                        languageId = tokenLanguageId;
                        modeBrackets = this.j.getLanguageConfiguration(languageId).brackets;
                        bracketConfig = this.j.getLanguageConfiguration(languageId).bracketsNew;
                    }
                    const searchInToken = (!!modeBrackets && !(0, supports_1.$ft)(lineTokens.getStandardTokenType(tokenIndex)));
                    if (searchInToken) {
                        // this token should be searched
                        if (prevSearchInToken) {
                            // the previous token should be searched, simply extend searchEndOffset
                            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                        }
                        else {
                            // the previous token should not be searched
                            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                        }
                    }
                    else {
                        // this token should not be searched
                        if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                            const r = richEditBrackets_1.$Rt.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return this.y(bracketConfig, r);
                            }
                        }
                    }
                    prevSearchInToken = searchInToken;
                }
                if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                    const r = richEditBrackets_1.$Rt.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (r) {
                        return this.y(bracketConfig, r);
                    }
                }
            }
            return null;
        }
        findEnclosingBrackets(_position, maxDuration) {
            const position = this.h.validatePosition(_position);
            if (this.f) {
                const range = range_1.$ks.fromPositions(position);
                const bracketPair = this.getBracketPairsInRange(range_1.$ks.fromPositions(position, position)).findLast((item) => item.closingBracketRange !== undefined && item.range.strictContainsRange(range));
                if (bracketPair) {
                    return [bracketPair.openingBracketRange, bracketPair.closingBracketRange];
                }
                return null;
            }
            const continueSearchPredicate = createTimeBasedContinueBracketSearchPredicate(maxDuration);
            const lineCount = this.h.getLineCount();
            const savedCounts = new Map();
            let counts = [];
            const resetCounts = (languageId, modeBrackets) => {
                if (!savedCounts.has(languageId)) {
                    const tmp = [];
                    for (let i = 0, len = modeBrackets ? modeBrackets.brackets.length : 0; i < len; i++) {
                        tmp[i] = 0;
                    }
                    savedCounts.set(languageId, tmp);
                }
                counts = savedCounts.get(languageId);
            };
            let totalCallCount = 0;
            const searchInRange = (modeBrackets, lineNumber, lineText, searchStartOffset, searchEndOffset) => {
                while (true) {
                    if (continueSearchPredicate && (++totalCallCount) % 100 === 0 && !continueSearchPredicate()) {
                        return BracketSearchCanceled.INSTANCE;
                    }
                    const r = richEditBrackets_1.$Rt.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (!r) {
                        break;
                    }
                    const hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
                    const bracket = modeBrackets.textIsBracket[hitText];
                    if (bracket) {
                        if (bracket.isOpen(hitText)) {
                            counts[bracket.index]++;
                        }
                        else if (bracket.isClose(hitText)) {
                            counts[bracket.index]--;
                        }
                        if (counts[bracket.index] === -1) {
                            return this.t(r, bracket, false, continueSearchPredicate);
                        }
                    }
                    searchStartOffset = r.endColumn - 1;
                }
                return null;
            };
            let languageId = null;
            let modeBrackets = null;
            for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
                const lineTokens = this.h.tokenization.getLineTokens(lineNumber);
                const tokenCount = lineTokens.getCount();
                const lineText = this.h.getLineContent(lineNumber);
                let tokenIndex = 0;
                let searchStartOffset = 0;
                let searchEndOffset = 0;
                if (lineNumber === position.lineNumber) {
                    tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
                    searchStartOffset = position.column - 1;
                    searchEndOffset = position.column - 1;
                    const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                    if (languageId !== tokenLanguageId) {
                        languageId = tokenLanguageId;
                        modeBrackets = this.j.getLanguageConfiguration(languageId).brackets;
                        resetCounts(languageId, modeBrackets);
                    }
                }
                let prevSearchInToken = true;
                for (; tokenIndex < tokenCount; tokenIndex++) {
                    const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                    if (languageId !== tokenLanguageId) {
                        // language id change!
                        if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                            const r = searchInRange(modeBrackets, lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return stripBracketSearchCanceled(r);
                            }
                            prevSearchInToken = false;
                        }
                        languageId = tokenLanguageId;
                        modeBrackets = this.j.getLanguageConfiguration(languageId).brackets;
                        resetCounts(languageId, modeBrackets);
                    }
                    const searchInToken = (!!modeBrackets && !(0, supports_1.$ft)(lineTokens.getStandardTokenType(tokenIndex)));
                    if (searchInToken) {
                        // this token should be searched
                        if (prevSearchInToken) {
                            // the previous token should be searched, simply extend searchEndOffset
                            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                        }
                        else {
                            // the previous token should not be searched
                            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                        }
                    }
                    else {
                        // this token should not be searched
                        if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                            const r = searchInRange(modeBrackets, lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return stripBracketSearchCanceled(r);
                            }
                        }
                    }
                    prevSearchInToken = searchInToken;
                }
                if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                    const r = searchInRange(modeBrackets, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (r) {
                        return stripBracketSearchCanceled(r);
                    }
                }
            }
            return null;
        }
        y(bracketConfig, r) {
            if (!r) {
                return null;
            }
            let text = this.h.getValueInRange(r);
            text = text.toLowerCase();
            const bracketInfo = bracketConfig.getBracketInfo(text);
            if (!bracketInfo) {
                return null;
            }
            return {
                range: r,
                bracketInfo
            };
        }
    }
    exports.$QA = $QA;
    function createDisposableRef(object, disposable) {
        return {
            object,
            dispose: () => disposable?.dispose(),
        };
    }
    function createTimeBasedContinueBracketSearchPredicate(maxDuration) {
        if (typeof maxDuration === 'undefined') {
            return () => true;
        }
        else {
            const startTime = Date.now();
            return () => {
                return (Date.now() - startTime <= maxDuration);
            };
        }
    }
    class BracketSearchCanceled {
        static { this.INSTANCE = new BracketSearchCanceled(); }
        constructor() {
            this._searchCanceledBrand = undefined;
        }
    }
    function stripBracketSearchCanceled(result) {
        if (result instanceof BracketSearchCanceled) {
            return null;
        }
        return result;
    }
});
//# sourceMappingURL=bracketPairsImpl.js.map