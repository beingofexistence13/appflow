/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/languages/supports", "vs/editor/common/languages/supports/richEditBrackets", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/bracketPairsTree"], function (require, exports, arrays_1, event_1, lifecycle_1, range_1, supports_1, richEditBrackets_1, bracketPairsTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BracketPairsTextModelPart = void 0;
    class BracketPairsTextModelPart extends lifecycle_1.Disposable {
        get canBuildAST() {
            const maxSupportedDocumentLength = /* max lines */ 50000 * /* average column count */ 100;
            return this.textModel.getValueLength() <= maxSupportedDocumentLength;
        }
        constructor(textModel, languageConfigurationService) {
            super();
            this.textModel = textModel;
            this.languageConfigurationService = languageConfigurationService;
            this.bracketPairsTree = this._register(new lifecycle_1.MutableDisposable());
            this.onDidChangeEmitter = new event_1.Emitter();
            this.onDidChange = this.onDidChangeEmitter.event;
            this.bracketsRequested = false;
            this._register(this.languageConfigurationService.onDidChange(e => {
                if (!e.languageId || this.bracketPairsTree.value?.object.didLanguageChange(e.languageId)) {
                    this.bracketPairsTree.clear();
                    this.updateBracketPairsTree();
                }
            }));
        }
        //#region TextModel events
        handleDidChangeOptions(e) {
            this.bracketPairsTree.clear();
            this.updateBracketPairsTree();
        }
        handleDidChangeLanguage(e) {
            this.bracketPairsTree.clear();
            this.updateBracketPairsTree();
        }
        handleDidChangeContent(change) {
            this.bracketPairsTree.value?.object.handleContentChanged(change);
        }
        handleDidChangeBackgroundTokenizationState() {
            this.bracketPairsTree.value?.object.handleDidChangeBackgroundTokenizationState();
        }
        handleDidChangeTokens(e) {
            this.bracketPairsTree.value?.object.handleDidChangeTokens(e);
        }
        //#endregion
        updateBracketPairsTree() {
            if (this.bracketsRequested && this.canBuildAST) {
                if (!this.bracketPairsTree.value) {
                    const store = new lifecycle_1.DisposableStore();
                    this.bracketPairsTree.value = createDisposableRef(store.add(new bracketPairsTree_1.BracketPairsTree(this.textModel, (languageId) => {
                        return this.languageConfigurationService.getLanguageConfiguration(languageId);
                    })), store);
                    store.add(this.bracketPairsTree.value.object.onDidChange(e => this.onDidChangeEmitter.fire(e)));
                    this.onDidChangeEmitter.fire();
                }
            }
            else {
                if (this.bracketPairsTree.value) {
                    this.bracketPairsTree.clear();
                    // Important: Don't call fire if there was no change!
                    this.onDidChangeEmitter.fire();
                }
            }
        }
        /**
         * Returns all bracket pairs that intersect the given range.
         * The result is sorted by the start position.
        */
        getBracketPairsInRange(range) {
            this.bracketsRequested = true;
            this.updateBracketPairsTree();
            return this.bracketPairsTree.value?.object.getBracketPairsInRange(range, false) || arrays_1.CallbackIterable.empty;
        }
        getBracketPairsInRangeWithMinIndentation(range) {
            this.bracketsRequested = true;
            this.updateBracketPairsTree();
            return this.bracketPairsTree.value?.object.getBracketPairsInRange(range, true) || arrays_1.CallbackIterable.empty;
        }
        getBracketsInRange(range, onlyColorizedBrackets = false) {
            this.bracketsRequested = true;
            this.updateBracketPairsTree();
            return this.bracketPairsTree.value?.object.getBracketsInRange(range, onlyColorizedBrackets) || arrays_1.CallbackIterable.empty;
        }
        findMatchingBracketUp(_bracket, _position, maxDuration) {
            const position = this.textModel.validatePosition(_position);
            const languageId = this.textModel.getLanguageIdAtPosition(position.lineNumber, position.column);
            if (this.canBuildAST) {
                const closingBracketInfo = this.languageConfigurationService
                    .getLanguageConfiguration(languageId)
                    .bracketsNew.getClosingBracketInfo(_bracket);
                if (!closingBracketInfo) {
                    return null;
                }
                const bracketPair = this.getBracketPairsInRange(range_1.Range.fromPositions(_position, _position)).findLast((b) => closingBracketInfo.closes(b.openingBracketInfo));
                if (bracketPair) {
                    return bracketPair.openingBracketRange;
                }
                return null;
            }
            else {
                // Fallback to old bracket matching code:
                const bracket = _bracket.toLowerCase();
                const bracketsSupport = this.languageConfigurationService.getLanguageConfiguration(languageId).brackets;
                if (!bracketsSupport) {
                    return null;
                }
                const data = bracketsSupport.textIsBracket[bracket];
                if (!data) {
                    return null;
                }
                return stripBracketSearchCanceled(this._findMatchingBracketUp(data, position, createTimeBasedContinueBracketSearchPredicate(maxDuration)));
            }
        }
        matchBracket(position, maxDuration) {
            if (this.canBuildAST) {
                const bracketPair = this.getBracketPairsInRange(range_1.Range.fromPositions(position, position)).filter((item) => item.closingBracketRange !== undefined &&
                    (item.openingBracketRange.containsPosition(position) ||
                        item.closingBracketRange.containsPosition(position))).findLastMaxBy((0, arrays_1.compareBy)((item) => item.openingBracketRange.containsPosition(position)
                    ? item.openingBracketRange
                    : item.closingBracketRange, range_1.Range.compareRangesUsingStarts));
                if (bracketPair) {
                    return [bracketPair.openingBracketRange, bracketPair.closingBracketRange];
                }
                return null;
            }
            else {
                // Fallback to old bracket matching code:
                const continueSearchPredicate = createTimeBasedContinueBracketSearchPredicate(maxDuration);
                return this._matchBracket(this.textModel.validatePosition(position), continueSearchPredicate);
            }
        }
        _establishBracketSearchOffsets(position, lineTokens, modeBrackets, tokenIndex) {
            const tokenCount = lineTokens.getCount();
            const currentLanguageId = lineTokens.getLanguageId(tokenIndex);
            // limit search to not go before `maxBracketLength`
            let searchStartOffset = Math.max(0, position.column - 1 - modeBrackets.maxBracketLength);
            for (let i = tokenIndex - 1; i >= 0; i--) {
                const tokenEndOffset = lineTokens.getEndOffset(i);
                if (tokenEndOffset <= searchStartOffset) {
                    break;
                }
                if ((0, supports_1.ignoreBracketsInToken)(lineTokens.getStandardTokenType(i)) || lineTokens.getLanguageId(i) !== currentLanguageId) {
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
                if ((0, supports_1.ignoreBracketsInToken)(lineTokens.getStandardTokenType(i)) || lineTokens.getLanguageId(i) !== currentLanguageId) {
                    searchEndOffset = tokenStartOffset;
                    break;
                }
            }
            return { searchStartOffset, searchEndOffset };
        }
        _matchBracket(position, continueSearchPredicate) {
            const lineNumber = position.lineNumber;
            const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
            const lineText = this.textModel.getLineContent(lineNumber);
            const tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
            if (tokenIndex < 0) {
                return null;
            }
            const currentModeBrackets = this.languageConfigurationService.getLanguageConfiguration(lineTokens.getLanguageId(tokenIndex)).brackets;
            // check that the token is not to be ignored
            if (currentModeBrackets && !(0, supports_1.ignoreBracketsInToken)(lineTokens.getStandardTokenType(tokenIndex))) {
                let { searchStartOffset, searchEndOffset } = this._establishBracketSearchOffsets(position, lineTokens, currentModeBrackets, tokenIndex);
                // it might be the case that [currentTokenStart -> currentTokenEnd] contains multiple brackets
                // `bestResult` will contain the most right-side result
                let bestResult = null;
                while (true) {
                    const foundBracket = richEditBrackets_1.BracketsUtils.findNextBracketInRange(currentModeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (!foundBracket) {
                        // there are no more brackets in this text
                        break;
                    }
                    // check that we didn't hit a bracket too far away from position
                    if (foundBracket.startColumn <= position.column && position.column <= foundBracket.endColumn) {
                        const foundBracketText = lineText.substring(foundBracket.startColumn - 1, foundBracket.endColumn - 1).toLowerCase();
                        const r = this._matchFoundBracket(foundBracket, currentModeBrackets.textIsBracket[foundBracketText], currentModeBrackets.textIsOpenBracket[foundBracketText], continueSearchPredicate);
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
                const prevModeBrackets = this.languageConfigurationService.getLanguageConfiguration(lineTokens.getLanguageId(prevTokenIndex)).brackets;
                // check that previous token is not to be ignored
                if (prevModeBrackets && !(0, supports_1.ignoreBracketsInToken)(lineTokens.getStandardTokenType(prevTokenIndex))) {
                    const { searchStartOffset, searchEndOffset } = this._establishBracketSearchOffsets(position, lineTokens, prevModeBrackets, prevTokenIndex);
                    const foundBracket = richEditBrackets_1.BracketsUtils.findPrevBracketInRange(prevModeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    // check that we didn't hit a bracket too far away from position
                    if (foundBracket && foundBracket.startColumn <= position.column && position.column <= foundBracket.endColumn) {
                        const foundBracketText = lineText.substring(foundBracket.startColumn - 1, foundBracket.endColumn - 1).toLowerCase();
                        const r = this._matchFoundBracket(foundBracket, prevModeBrackets.textIsBracket[foundBracketText], prevModeBrackets.textIsOpenBracket[foundBracketText], continueSearchPredicate);
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
        _matchFoundBracket(foundBracket, data, isOpen, continueSearchPredicate) {
            if (!data) {
                return null;
            }
            const matched = (isOpen
                ? this._findMatchingBracketDown(data, foundBracket.getEndPosition(), continueSearchPredicate)
                : this._findMatchingBracketUp(data, foundBracket.getStartPosition(), continueSearchPredicate));
            if (!matched) {
                return null;
            }
            if (matched instanceof BracketSearchCanceled) {
                return matched;
            }
            return [foundBracket, matched];
        }
        _findMatchingBracketUp(bracket, position, continueSearchPredicate) {
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
                    const r = richEditBrackets_1.BracketsUtils.findPrevBracketInRange(reversedBracketRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
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
                const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
                const tokenCount = lineTokens.getCount();
                const lineText = this.textModel.getLineContent(lineNumber);
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
                    const searchInToken = (lineTokens.getLanguageId(tokenIndex) === languageId && !(0, supports_1.ignoreBracketsInToken)(lineTokens.getStandardTokenType(tokenIndex)));
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
        _findMatchingBracketDown(bracket, position, continueSearchPredicate) {
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
                    const r = richEditBrackets_1.BracketsUtils.findNextBracketInRange(bracketRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
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
            const lineCount = this.textModel.getLineCount();
            for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
                const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
                const tokenCount = lineTokens.getCount();
                const lineText = this.textModel.getLineContent(lineNumber);
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
                    const searchInToken = (lineTokens.getLanguageId(tokenIndex) === languageId && !(0, supports_1.ignoreBracketsInToken)(lineTokens.getStandardTokenType(tokenIndex)));
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
            const position = this.textModel.validatePosition(_position);
            if (this.canBuildAST) {
                this.bracketsRequested = true;
                this.updateBracketPairsTree();
                return this.bracketPairsTree.value?.object.getFirstBracketBefore(position) || null;
            }
            let languageId = null;
            let modeBrackets = null;
            let bracketConfig = null;
            for (let lineNumber = position.lineNumber; lineNumber >= 1; lineNumber--) {
                const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
                const tokenCount = lineTokens.getCount();
                const lineText = this.textModel.getLineContent(lineNumber);
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
                        modeBrackets = this.languageConfigurationService.getLanguageConfiguration(languageId).brackets;
                        bracketConfig = this.languageConfigurationService.getLanguageConfiguration(languageId).bracketsNew;
                    }
                }
                let prevSearchInToken = true;
                for (; tokenIndex >= 0; tokenIndex--) {
                    const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                    if (languageId !== tokenLanguageId) {
                        // language id change!
                        if (modeBrackets && bracketConfig && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                            const r = richEditBrackets_1.BracketsUtils.findPrevBracketInRange(modeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return this._toFoundBracket(bracketConfig, r);
                            }
                            prevSearchInToken = false;
                        }
                        languageId = tokenLanguageId;
                        modeBrackets = this.languageConfigurationService.getLanguageConfiguration(languageId).brackets;
                        bracketConfig = this.languageConfigurationService.getLanguageConfiguration(languageId).bracketsNew;
                    }
                    const searchInToken = (!!modeBrackets && !(0, supports_1.ignoreBracketsInToken)(lineTokens.getStandardTokenType(tokenIndex)));
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
                            const r = richEditBrackets_1.BracketsUtils.findPrevBracketInRange(modeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return this._toFoundBracket(bracketConfig, r);
                            }
                        }
                    }
                    prevSearchInToken = searchInToken;
                }
                if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                    const r = richEditBrackets_1.BracketsUtils.findPrevBracketInRange(modeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (r) {
                        return this._toFoundBracket(bracketConfig, r);
                    }
                }
            }
            return null;
        }
        findNextBracket(_position) {
            const position = this.textModel.validatePosition(_position);
            if (this.canBuildAST) {
                this.bracketsRequested = true;
                this.updateBracketPairsTree();
                return this.bracketPairsTree.value?.object.getFirstBracketAfter(position) || null;
            }
            const lineCount = this.textModel.getLineCount();
            let languageId = null;
            let modeBrackets = null;
            let bracketConfig = null;
            for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
                const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
                const tokenCount = lineTokens.getCount();
                const lineText = this.textModel.getLineContent(lineNumber);
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
                        modeBrackets = this.languageConfigurationService.getLanguageConfiguration(languageId).brackets;
                        bracketConfig = this.languageConfigurationService.getLanguageConfiguration(languageId).bracketsNew;
                    }
                }
                let prevSearchInToken = true;
                for (; tokenIndex < tokenCount; tokenIndex++) {
                    const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                    if (languageId !== tokenLanguageId) {
                        // language id change!
                        if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                            const r = richEditBrackets_1.BracketsUtils.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return this._toFoundBracket(bracketConfig, r);
                            }
                            prevSearchInToken = false;
                        }
                        languageId = tokenLanguageId;
                        modeBrackets = this.languageConfigurationService.getLanguageConfiguration(languageId).brackets;
                        bracketConfig = this.languageConfigurationService.getLanguageConfiguration(languageId).bracketsNew;
                    }
                    const searchInToken = (!!modeBrackets && !(0, supports_1.ignoreBracketsInToken)(lineTokens.getStandardTokenType(tokenIndex)));
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
                            const r = richEditBrackets_1.BracketsUtils.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                            if (r) {
                                return this._toFoundBracket(bracketConfig, r);
                            }
                        }
                    }
                    prevSearchInToken = searchInToken;
                }
                if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                    const r = richEditBrackets_1.BracketsUtils.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                    if (r) {
                        return this._toFoundBracket(bracketConfig, r);
                    }
                }
            }
            return null;
        }
        findEnclosingBrackets(_position, maxDuration) {
            const position = this.textModel.validatePosition(_position);
            if (this.canBuildAST) {
                const range = range_1.Range.fromPositions(position);
                const bracketPair = this.getBracketPairsInRange(range_1.Range.fromPositions(position, position)).findLast((item) => item.closingBracketRange !== undefined && item.range.strictContainsRange(range));
                if (bracketPair) {
                    return [bracketPair.openingBracketRange, bracketPair.closingBracketRange];
                }
                return null;
            }
            const continueSearchPredicate = createTimeBasedContinueBracketSearchPredicate(maxDuration);
            const lineCount = this.textModel.getLineCount();
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
                    const r = richEditBrackets_1.BracketsUtils.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
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
                            return this._matchFoundBracket(r, bracket, false, continueSearchPredicate);
                        }
                    }
                    searchStartOffset = r.endColumn - 1;
                }
                return null;
            };
            let languageId = null;
            let modeBrackets = null;
            for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
                const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
                const tokenCount = lineTokens.getCount();
                const lineText = this.textModel.getLineContent(lineNumber);
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
                        modeBrackets = this.languageConfigurationService.getLanguageConfiguration(languageId).brackets;
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
                        modeBrackets = this.languageConfigurationService.getLanguageConfiguration(languageId).brackets;
                        resetCounts(languageId, modeBrackets);
                    }
                    const searchInToken = (!!modeBrackets && !(0, supports_1.ignoreBracketsInToken)(lineTokens.getStandardTokenType(tokenIndex)));
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
        _toFoundBracket(bracketConfig, r) {
            if (!r) {
                return null;
            }
            let text = this.textModel.getValueInRange(r);
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
    exports.BracketPairsTextModelPart = BracketPairsTextModelPart;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhY2tldFBhaXJzSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwvYnJhY2tldFBhaXJzVGV4dE1vZGVsUGFydC9icmFja2V0UGFpcnNJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsTUFBYSx5QkFBMEIsU0FBUSxzQkFBVTtRQU14RCxJQUFZLFdBQVc7WUFDdEIsTUFBTSwwQkFBMEIsR0FBRyxlQUFlLENBQUMsS0FBTSxHQUFHLDBCQUEwQixDQUFDLEdBQUcsQ0FBQztZQUMzRixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksMEJBQTBCLENBQUM7UUFDdEUsQ0FBQztRQUlELFlBQ2tCLFNBQW9CLEVBQ3BCLDRCQUEyRDtZQUU1RSxLQUFLLEVBQUUsQ0FBQztZQUhTLGNBQVMsR0FBVCxTQUFTLENBQVc7WUFDcEIsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUErQjtZQWQ1RCxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQWdDLENBQUMsQ0FBQztZQUV6Rix1QkFBa0IsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQzFDLGdCQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztZQU9wRCxzQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFRakMsSUFBSSxDQUFDLFNBQVMsQ0FDYixJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNqRCxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3pGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxL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