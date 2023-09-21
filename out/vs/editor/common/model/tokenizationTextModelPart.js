/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/eolCounter", "vs/editor/common/core/lineRange", "vs/editor/common/core/position", "vs/editor/common/core/wordHelper", "vs/editor/common/languages", "vs/editor/common/model/textModelPart", "vs/editor/common/model/textModelTokens", "vs/editor/common/tokens/contiguousMultilineTokensBuilder", "vs/editor/common/tokens/contiguousTokensStore", "vs/editor/common/tokens/sparseTokensStore"], function (require, exports, arrays_1, async_1, errors_1, event_1, lifecycle_1, eolCounter_1, lineRange_1, position_1, wordHelper_1, languages_1, textModelPart_1, textModelTokens_1, contiguousMultilineTokensBuilder_1, contiguousTokensStore_1, sparseTokensStore_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenizationTextModelPart = void 0;
    class TokenizationTextModelPart extends textModelPart_1.TextModelPart {
        constructor(_languageService, _languageConfigurationService, _textModel, _bracketPairsTextModelPart, _languageId, _attachedViews) {
            super();
            this._languageService = _languageService;
            this._languageConfigurationService = _languageConfigurationService;
            this._textModel = _textModel;
            this._bracketPairsTextModelPart = _bracketPairsTextModelPart;
            this._languageId = _languageId;
            this._attachedViews = _attachedViews;
            this._semanticTokens = new sparseTokensStore_1.SparseTokensStore(this._languageService.languageIdCodec);
            this._onDidChangeLanguage = this._register(new event_1.Emitter());
            this.onDidChangeLanguage = this._onDidChangeLanguage.event;
            this._onDidChangeLanguageConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeLanguageConfiguration = this._onDidChangeLanguageConfiguration.event;
            this._onDidChangeTokens = this._register(new event_1.Emitter());
            this.onDidChangeTokens = this._onDidChangeTokens.event;
            this.grammarTokens = this._register(new GrammarTokens(this._languageService.languageIdCodec, this._textModel, () => this._languageId, this._attachedViews));
            this._register(this._languageConfigurationService.onDidChange(e => {
                if (e.affects(this._languageId)) {
                    this._onDidChangeLanguageConfiguration.fire({});
                }
            }));
            this._register(this.grammarTokens.onDidChangeTokens(e => {
                this._emitModelTokensChangedEvent(e);
            }));
            this._register(this.grammarTokens.onDidChangeBackgroundTokenizationState(e => {
                this._bracketPairsTextModelPart.handleDidChangeBackgroundTokenizationState();
            }));
        }
        _hasListeners() {
            return (this._onDidChangeLanguage.hasListeners()
                || this._onDidChangeLanguageConfiguration.hasListeners()
                || this._onDidChangeTokens.hasListeners());
        }
        handleDidChangeContent(e) {
            if (e.isFlush) {
                this._semanticTokens.flush();
            }
            else if (!e.isEolChange) { // We don't have to do anything on an EOL change
                for (const c of e.changes) {
                    const [eolCount, firstLineLength, lastLineLength] = (0, eolCounter_1.countEOL)(c.text);
                    this._semanticTokens.acceptEdit(c.range, eolCount, firstLineLength, lastLineLength, c.text.length > 0 ? c.text.charCodeAt(0) : 0 /* CharCode.Null */);
                }
            }
            this.grammarTokens.handleDidChangeContent(e);
        }
        handleDidChangeAttached() {
            this.grammarTokens.handleDidChangeAttached();
        }
        /**
         * Includes grammar and semantic tokens.
         */
        getLineTokens(lineNumber) {
            this.validateLineNumber(lineNumber);
            const syntacticTokens = this.grammarTokens.getLineTokens(lineNumber);
            return this._semanticTokens.addSparseTokens(lineNumber, syntacticTokens);
        }
        _emitModelTokensChangedEvent(e) {
            if (!this._textModel._isDisposing()) {
                this._bracketPairsTextModelPart.handleDidChangeTokens(e);
                this._onDidChangeTokens.fire(e);
            }
        }
        // #region Grammar Tokens
        validateLineNumber(lineNumber) {
            if (lineNumber < 1 || lineNumber > this._textModel.getLineCount()) {
                throw new errors_1.BugIndicatingError('Illegal value for lineNumber');
            }
        }
        get hasTokens() {
            return this.grammarTokens.hasTokens;
        }
        resetTokenization() {
            this.grammarTokens.resetTokenization();
        }
        get backgroundTokenizationState() {
            return this.grammarTokens.backgroundTokenizationState;
        }
        forceTokenization(lineNumber) {
            this.validateLineNumber(lineNumber);
            this.grammarTokens.forceTokenization(lineNumber);
        }
        isCheapToTokenize(lineNumber) {
            this.validateLineNumber(lineNumber);
            return this.grammarTokens.isCheapToTokenize(lineNumber);
        }
        tokenizeIfCheap(lineNumber) {
            this.validateLineNumber(lineNumber);
            this.grammarTokens.tokenizeIfCheap(lineNumber);
        }
        getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
            return this.grammarTokens.getTokenTypeIfInsertingCharacter(lineNumber, column, character);
        }
        tokenizeLineWithEdit(position, length, newText) {
            return this.grammarTokens.tokenizeLineWithEdit(position, length, newText);
        }
        // #endregion
        // #region Semantic Tokens
        setSemanticTokens(tokens, isComplete) {
            this._semanticTokens.set(tokens, isComplete);
            this._emitModelTokensChangedEvent({
                semanticTokensApplied: tokens !== null,
                ranges: [{ fromLineNumber: 1, toLineNumber: this._textModel.getLineCount() }],
            });
        }
        hasCompleteSemanticTokens() {
            return this._semanticTokens.isComplete();
        }
        hasSomeSemanticTokens() {
            return !this._semanticTokens.isEmpty();
        }
        setPartialSemanticTokens(range, tokens) {
            if (this.hasCompleteSemanticTokens()) {
                return;
            }
            const changedRange = this._textModel.validateRange(this._semanticTokens.setPartial(range, tokens));
            this._emitModelTokensChangedEvent({
                semanticTokensApplied: true,
                ranges: [
                    {
                        fromLineNumber: changedRange.startLineNumber,
                        toLineNumber: changedRange.endLineNumber,
                    },
                ],
            });
        }
        // #endregion
        // #region Utility Methods
        getWordAtPosition(_position) {
            this.assertNotDisposed();
            const position = this._textModel.validatePosition(_position);
            const lineContent = this._textModel.getLineContent(position.lineNumber);
            const lineTokens = this.getLineTokens(position.lineNumber);
            const tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
            // (1). First try checking right biased word
            const [rbStartOffset, rbEndOffset] = TokenizationTextModelPart._findLanguageBoundaries(lineTokens, tokenIndex);
            const rightBiasedWord = (0, wordHelper_1.getWordAtText)(position.column, this.getLanguageConfiguration(lineTokens.getLanguageId(tokenIndex)).getWordDefinition(), lineContent.substring(rbStartOffset, rbEndOffset), rbStartOffset);
            // Make sure the result touches the original passed in position
            if (rightBiasedWord &&
                rightBiasedWord.startColumn <= _position.column &&
                _position.column <= rightBiasedWord.endColumn) {
                return rightBiasedWord;
            }
            // (2). Else, if we were at a language boundary, check the left biased word
            if (tokenIndex > 0 && rbStartOffset === position.column - 1) {
                // edge case, where `position` sits between two tokens belonging to two different languages
                const [lbStartOffset, lbEndOffset] = TokenizationTextModelPart._findLanguageBoundaries(lineTokens, tokenIndex - 1);
                const leftBiasedWord = (0, wordHelper_1.getWordAtText)(position.column, this.getLanguageConfiguration(lineTokens.getLanguageId(tokenIndex - 1)).getWordDefinition(), lineContent.substring(lbStartOffset, lbEndOffset), lbStartOffset);
                // Make sure the result touches the original passed in position
                if (leftBiasedWord &&
                    leftBiasedWord.startColumn <= _position.column &&
                    _position.column <= leftBiasedWord.endColumn) {
                    return leftBiasedWord;
                }
            }
            return null;
        }
        getLanguageConfiguration(languageId) {
            return this._languageConfigurationService.getLanguageConfiguration(languageId);
        }
        static _findLanguageBoundaries(lineTokens, tokenIndex) {
            const languageId = lineTokens.getLanguageId(tokenIndex);
            // go left until a different language is hit
            let startOffset = 0;
            for (let i = tokenIndex; i >= 0 && lineTokens.getLanguageId(i) === languageId; i--) {
                startOffset = lineTokens.getStartOffset(i);
            }
            // go right until a different language is hit
            let endOffset = lineTokens.getLineContent().length;
            for (let i = tokenIndex, tokenCount = lineTokens.getCount(); i < tokenCount && lineTokens.getLanguageId(i) === languageId; i++) {
                endOffset = lineTokens.getEndOffset(i);
            }
            return [startOffset, endOffset];
        }
        getWordUntilPosition(position) {
            const wordAtPosition = this.getWordAtPosition(position);
            if (!wordAtPosition) {
                return { word: '', startColumn: position.column, endColumn: position.column, };
            }
            return {
                word: wordAtPosition.word.substr(0, position.column - wordAtPosition.startColumn),
                startColumn: wordAtPosition.startColumn,
                endColumn: position.column,
            };
        }
        // #endregion
        // #region Language Id handling
        getLanguageId() {
            return this._languageId;
        }
        getLanguageIdAtPosition(lineNumber, column) {
            const position = this._textModel.validatePosition(new position_1.Position(lineNumber, column));
            const lineTokens = this.getLineTokens(position.lineNumber);
            return lineTokens.getLanguageId(lineTokens.findTokenIndexAtOffset(position.column - 1));
        }
        setLanguageId(languageId, source = 'api') {
            if (this._languageId === languageId) {
                // There's nothing to do
                return;
            }
            const e = {
                oldLanguage: this._languageId,
                newLanguage: languageId,
                source
            };
            this._languageId = languageId;
            this._bracketPairsTextModelPart.handleDidChangeLanguage(e);
            this.grammarTokens.resetTokenization();
            this._onDidChangeLanguage.fire(e);
            this._onDidChangeLanguageConfiguration.fire({});
        }
    }
    exports.TokenizationTextModelPart = TokenizationTextModelPart;
    class GrammarTokens extends lifecycle_1.Disposable {
        get backgroundTokenizationState() {
            return this._backgroundTokenizationState;
        }
        constructor(_languageIdCodec, _textModel, getLanguageId, attachedViews) {
            super();
            this._languageIdCodec = _languageIdCodec;
            this._textModel = _textModel;
            this.getLanguageId = getLanguageId;
            this._tokenizer = null;
            this._defaultBackgroundTokenizer = null;
            this._backgroundTokenizer = this._register(new lifecycle_1.MutableDisposable());
            this._tokens = new contiguousTokensStore_1.ContiguousTokensStore(this._languageIdCodec);
            this._debugBackgroundTokenizer = this._register(new lifecycle_1.MutableDisposable());
            this._backgroundTokenizationState = 1 /* BackgroundTokenizationState.InProgress */;
            this._onDidChangeBackgroundTokenizationState = this._register(new event_1.Emitter());
            /** @internal, should not be exposed by the text model! */
            this.onDidChangeBackgroundTokenizationState = this._onDidChangeBackgroundTokenizationState.event;
            this._onDidChangeTokens = this._register(new event_1.Emitter());
            /** @internal, should not be exposed by the text model! */
            this.onDidChangeTokens = this._onDidChangeTokens.event;
            this._attachedViewStates = this._register(new lifecycle_1.DisposableMap());
            this._register(languages_1.TokenizationRegistry.onDidChange((e) => {
                const languageId = this.getLanguageId();
                if (e.changedLanguages.indexOf(languageId) === -1) {
                    return;
                }
                this.resetTokenization();
            }));
            this.resetTokenization();
            this._register(attachedViews.onDidChangeVisibleRanges(({ view, state }) => {
                if (state) {
                    let existing = this._attachedViewStates.get(view);
                    if (!existing) {
                        existing = new AttachedViewHandler(() => this.refreshRanges(existing.lineRanges));
                        this._attachedViewStates.set(view, existing);
                    }
                    existing.handleStateChange(state);
                }
                else {
                    this._attachedViewStates.deleteAndDispose(view);
                }
            }));
        }
        resetTokenization(fireTokenChangeEvent = true) {
            this._tokens.flush();
            this._debugBackgroundTokens?.flush();
            if (this._debugBackgroundStates) {
                this._debugBackgroundStates = new textModelTokens_1.TrackingTokenizationStateStore(this._textModel.getLineCount());
            }
            if (fireTokenChangeEvent) {
                this._onDidChangeTokens.fire({
                    semanticTokensApplied: false,
                    ranges: [
                        {
                            fromLineNumber: 1,
                            toLineNumber: this._textModel.getLineCount(),
                        },
                    ],
                });
            }
            const initializeTokenization = () => {
                if (this._textModel.isTooLargeForTokenization()) {
                    return [null, null];
                }
                const tokenizationSupport = languages_1.TokenizationRegistry.get(this.getLanguageId());
                if (!tokenizationSupport) {
                    return [null, null];
                }
                let initialState;
                try {
                    initialState = tokenizationSupport.getInitialState();
                }
                catch (e) {
                    (0, errors_1.onUnexpectedError)(e);
                    return [null, null];
                }
                return [tokenizationSupport, initialState];
            };
            const [tokenizationSupport, initialState] = initializeTokenization();
            if (tokenizationSupport && initialState) {
                this._tokenizer = new textModelTokens_1.TokenizerWithStateStoreAndTextModel(this._textModel.getLineCount(), tokenizationSupport, this._textModel, this._languageIdCodec);
            }
            else {
                this._tokenizer = null;
            }
            this._backgroundTokenizer.clear();
            this._defaultBackgroundTokenizer = null;
            if (this._tokenizer) {
                const b = {
                    setTokens: (tokens) => {
                        this.setTokens(tokens);
                    },
                    backgroundTokenizationFinished: () => {
                        if (this._backgroundTokenizationState === 2 /* BackgroundTokenizationState.Completed */) {
                            // We already did a full tokenization and don't go back to progressing.
                            return;
                        }
                        const newState = 2 /* BackgroundTokenizationState.Completed */;
                        this._backgroundTokenizationState = newState;
                        this._onDidChangeBackgroundTokenizationState.fire();
                    },
                    setEndState: (lineNumber, state) => {
                        if (!this._tokenizer) {
                            return;
                        }
                        const firstInvalidEndStateLineNumber = this._tokenizer.store.getFirstInvalidEndStateLineNumber();
                        // Don't accept states for definitely valid states, the renderer is ahead of the worker!
                        if (firstInvalidEndStateLineNumber !== null && lineNumber >= firstInvalidEndStateLineNumber) {
                            this._tokenizer?.store.setEndState(lineNumber, state);
                        }
                    },
                };
                if (tokenizationSupport && tokenizationSupport.createBackgroundTokenizer && !tokenizationSupport.backgroundTokenizerShouldOnlyVerifyTokens) {
                    this._backgroundTokenizer.value = tokenizationSupport.createBackgroundTokenizer(this._textModel, b);
                }
                if (!this._backgroundTokenizer.value) {
                    this._backgroundTokenizer.value = this._defaultBackgroundTokenizer =
                        new textModelTokens_1.DefaultBackgroundTokenizer(this._tokenizer, b);
                    this._defaultBackgroundTokenizer.handleChanges();
                }
                if (tokenizationSupport?.backgroundTokenizerShouldOnlyVerifyTokens && tokenizationSupport.createBackgroundTokenizer) {
                    this._debugBackgroundTokens = new contiguousTokensStore_1.ContiguousTokensStore(this._languageIdCodec);
                    this._debugBackgroundStates = new textModelTokens_1.TrackingTokenizationStateStore(this._textModel.getLineCount());
                    this._debugBackgroundTokenizer.clear();
                    this._debugBackgroundTokenizer.value = tokenizationSupport.createBackgroundTokenizer(this._textModel, {
                        setTokens: (tokens) => {
                            this._debugBackgroundTokens?.setMultilineTokens(tokens, this._textModel);
                        },
                        backgroundTokenizationFinished() {
                            // NO OP
                        },
                        setEndState: (lineNumber, state) => {
                            this._debugBackgroundStates?.setEndState(lineNumber, state);
                        },
                    });
                }
                else {
                    this._debugBackgroundTokens = undefined;
                    this._debugBackgroundStates = undefined;
                    this._debugBackgroundTokenizer.value = undefined;
                }
            }
            this.refreshAllVisibleLineTokens();
        }
        handleDidChangeAttached() {
            this._defaultBackgroundTokenizer?.handleChanges();
        }
        handleDidChangeContent(e) {
            if (e.isFlush) {
                // Don't fire the event, as the view might not have got the text change event yet
                this.resetTokenization(false);
            }
            else if (!e.isEolChange) { // We don't have to do anything on an EOL change
                for (const c of e.changes) {
                    const [eolCount, firstLineLength] = (0, eolCounter_1.countEOL)(c.text);
                    this._tokens.acceptEdit(c.range, eolCount, firstLineLength);
                    this._debugBackgroundTokens?.acceptEdit(c.range, eolCount, firstLineLength);
                }
                this._debugBackgroundStates?.acceptChanges(e.changes);
                if (this._tokenizer) {
                    this._tokenizer.store.acceptChanges(e.changes);
                }
                this._defaultBackgroundTokenizer?.handleChanges();
            }
        }
        setTokens(tokens) {
            const { changes } = this._tokens.setMultilineTokens(tokens, this._textModel);
            if (changes.length > 0) {
                this._onDidChangeTokens.fire({ semanticTokensApplied: false, ranges: changes, });
            }
            return { changes: changes };
        }
        refreshAllVisibleLineTokens() {
            const ranges = lineRange_1.LineRange.joinMany([...this._attachedViewStates].map(([_, s]) => s.lineRanges));
            this.refreshRanges(ranges);
        }
        refreshRanges(ranges) {
            for (const range of ranges) {
                this.refreshRange(range.startLineNumber, range.endLineNumberExclusive - 1);
            }
        }
        refreshRange(startLineNumber, endLineNumber) {
            if (!this._tokenizer) {
                return;
            }
            startLineNumber = Math.max(1, Math.min(this._textModel.getLineCount(), startLineNumber));
            endLineNumber = Math.min(this._textModel.getLineCount(), endLineNumber);
            const builder = new contiguousMultilineTokensBuilder_1.ContiguousMultilineTokensBuilder();
            const { heuristicTokens } = this._tokenizer.tokenizeHeuristically(builder, startLineNumber, endLineNumber);
            const changedTokens = this.setTokens(builder.finalize());
            if (heuristicTokens) {
                // We overrode tokens with heuristically computed ones.
                // Because old states might get reused (thus stopping invalidation),
                // we have to explicitly request the tokens for the changed ranges again.
                for (const c of changedTokens.changes) {
                    this._backgroundTokenizer.value?.requestTokens(c.fromLineNumber, c.toLineNumber + 1);
                }
            }
            this._defaultBackgroundTokenizer?.checkFinished();
        }
        forceTokenization(lineNumber) {
            const builder = new contiguousMultilineTokensBuilder_1.ContiguousMultilineTokensBuilder();
            this._tokenizer?.updateTokensUntilLine(builder, lineNumber);
            this.setTokens(builder.finalize());
            this._defaultBackgroundTokenizer?.checkFinished();
        }
        isCheapToTokenize(lineNumber) {
            if (!this._tokenizer) {
                return true;
            }
            return this._tokenizer.isCheapToTokenize(lineNumber);
        }
        tokenizeIfCheap(lineNumber) {
            if (this.isCheapToTokenize(lineNumber)) {
                this.forceTokenization(lineNumber);
            }
        }
        getLineTokens(lineNumber) {
            const lineText = this._textModel.getLineContent(lineNumber);
            const result = this._tokens.getTokens(this._textModel.getLanguageId(), lineNumber - 1, lineText);
            if (this._debugBackgroundTokens && this._debugBackgroundStates && this._tokenizer) {
                if (this._debugBackgroundStates.getFirstInvalidEndStateLineNumberOrMax() > lineNumber && this._tokenizer.store.getFirstInvalidEndStateLineNumberOrMax() > lineNumber) {
                    const backgroundResult = this._debugBackgroundTokens.getTokens(this._textModel.getLanguageId(), lineNumber - 1, lineText);
                    if (!result.equals(backgroundResult) && this._debugBackgroundTokenizer.value?.reportMismatchingTokens) {
                        this._debugBackgroundTokenizer.value.reportMismatchingTokens(lineNumber);
                    }
                }
            }
            return result;
        }
        getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
            if (!this._tokenizer) {
                return 0 /* StandardTokenType.Other */;
            }
            const position = this._textModel.validatePosition(new position_1.Position(lineNumber, column));
            this.forceTokenization(position.lineNumber);
            return this._tokenizer.getTokenTypeIfInsertingCharacter(position, character);
        }
        tokenizeLineWithEdit(position, length, newText) {
            if (!this._tokenizer) {
                return null;
            }
            const validatedPosition = this._textModel.validatePosition(position);
            this.forceTokenization(validatedPosition.lineNumber);
            return this._tokenizer.tokenizeLineWithEdit(validatedPosition, length, newText);
        }
        get hasTokens() {
            return this._tokens.hasTokens;
        }
    }
    class AttachedViewHandler extends lifecycle_1.Disposable {
        get lineRanges() { return this._lineRanges; }
        constructor(_refreshTokens) {
            super();
            this._refreshTokens = _refreshTokens;
            this.runner = this._register(new async_1.RunOnceScheduler(() => this.update(), 50));
            this._computedLineRanges = [];
            this._lineRanges = [];
        }
        update() {
            if ((0, arrays_1.equals)(this._computedLineRanges, this._lineRanges, (a, b) => a.equals(b))) {
                return;
            }
            this._computedLineRanges = this._lineRanges;
            this._refreshTokens();
        }
        handleStateChange(state) {
            this._lineRanges = state.visibleLineRanges;
            if (state.stabilized) {
                this.runner.cancel();
                this.update();
            }
            else {
                this.runner.schedule();
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5pemF0aW9uVGV4dE1vZGVsUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwvdG9rZW5pemF0aW9uVGV4dE1vZGVsUGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUErQmhHLE1BQWEseUJBQTBCLFNBQVEsNkJBQWE7UUFjM0QsWUFDa0IsZ0JBQWtDLEVBQ2xDLDZCQUE0RCxFQUM1RCxVQUFxQixFQUNyQiwwQkFBcUQsRUFDOUQsV0FBbUIsRUFDVixjQUE2QjtZQUU5QyxLQUFLLEVBQUUsQ0FBQztZQVBTLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDbEMsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUErQjtZQUM1RCxlQUFVLEdBQVYsVUFBVSxDQUFXO1lBQ3JCLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBMkI7WUFDOUQsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFDVixtQkFBYyxHQUFkLGNBQWMsQ0FBZTtZQW5COUIsb0JBQWUsR0FBc0IsSUFBSSxxQ0FBaUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFbEcseUJBQW9CLEdBQXdDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQThCLENBQUMsQ0FBQztZQUN2SCx3QkFBbUIsR0FBc0MsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQztZQUV4RixzQ0FBaUMsR0FBcUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBMkMsQ0FBQyxDQUFDO1lBQzlKLHFDQUFnQyxHQUFtRCxJQUFJLENBQUMsaUNBQWlDLENBQUMsS0FBSyxDQUFDO1lBRS9ILHVCQUFrQixHQUFzQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUE0QixDQUFDLENBQUM7WUFDakgsc0JBQWlCLEdBQW9DLElB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