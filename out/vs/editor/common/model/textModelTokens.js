/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/stopwatch", "vs/editor/common/core/eolCounter", "vs/editor/common/core/lineRange", "vs/editor/common/core/offsetRange", "vs/editor/common/languages/nullTokenize", "vs/editor/common/model/fixedArray", "vs/editor/common/tokens/contiguousMultilineTokensBuilder", "vs/editor/common/tokens/lineTokens"], function (require, exports, async_1, errors_1, platform_1, stopwatch_1, eolCounter_1, lineRange_1, offsetRange_1, nullTokenize_1, fixedArray_1, contiguousMultilineTokensBuilder_1, lineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultBackgroundTokenizer = exports.RangePriorityQueueImpl = exports.TokenizationStateStore = exports.TrackingTokenizationStateStore = exports.TokenizerWithStateStoreAndTextModel = exports.TokenizerWithStateStore = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["CHEAP_TOKENIZATION_LENGTH_LIMIT"] = 2048] = "CHEAP_TOKENIZATION_LENGTH_LIMIT";
    })(Constants || (Constants = {}));
    class TokenizerWithStateStore {
        constructor(lineCount, tokenizationSupport) {
            this.tokenizationSupport = tokenizationSupport;
            this.initialState = this.tokenizationSupport.getInitialState();
            this.store = new TrackingTokenizationStateStore(lineCount);
        }
        getStartState(lineNumber) {
            return this.store.getStartState(lineNumber, this.initialState);
        }
        getFirstInvalidLine() {
            return this.store.getFirstInvalidLine(this.initialState);
        }
    }
    exports.TokenizerWithStateStore = TokenizerWithStateStore;
    class TokenizerWithStateStoreAndTextModel extends TokenizerWithStateStore {
        constructor(lineCount, tokenizationSupport, _textModel, _languageIdCodec) {
            super(lineCount, tokenizationSupport);
            this._textModel = _textModel;
            this._languageIdCodec = _languageIdCodec;
        }
        updateTokensUntilLine(builder, lineNumber) {
            const languageId = this._textModel.getLanguageId();
            while (true) {
                const lineToTokenize = this.getFirstInvalidLine();
                if (!lineToTokenize || lineToTokenize.lineNumber > lineNumber) {
                    break;
                }
                const text = this._textModel.getLineContent(lineToTokenize.lineNumber);
                const r = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, text, true, lineToTokenize.startState);
                builder.add(lineToTokenize.lineNumber, r.tokens);
                this.store.setEndState(lineToTokenize.lineNumber, r.endState);
            }
        }
        /** assumes state is up to date */
        getTokenTypeIfInsertingCharacter(position, character) {
            // TODO@hediet: use tokenizeLineWithEdit
            const lineStartState = this.getStartState(position.lineNumber);
            if (!lineStartState) {
                return 0 /* StandardTokenType.Other */;
            }
            const languageId = this._textModel.getLanguageId();
            const lineContent = this._textModel.getLineContent(position.lineNumber);
            // Create the text as if `character` was inserted
            const text = (lineContent.substring(0, position.column - 1)
                + character
                + lineContent.substring(position.column - 1));
            const r = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, text, true, lineStartState);
            const lineTokens = new lineTokens_1.LineTokens(r.tokens, text, this._languageIdCodec);
            if (lineTokens.getCount() === 0) {
                return 0 /* StandardTokenType.Other */;
            }
            const tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
            return lineTokens.getStandardTokenType(tokenIndex);
        }
        /** assumes state is up to date */
        tokenizeLineWithEdit(position, length, newText) {
            const lineNumber = position.lineNumber;
            const column = position.column;
            const lineStartState = this.getStartState(lineNumber);
            if (!lineStartState) {
                return null;
            }
            const curLineContent = this._textModel.getLineContent(lineNumber);
            const newLineContent = curLineContent.substring(0, column - 1)
                + newText + curLineContent.substring(column - 1 + length);
            const languageId = this._textModel.getLanguageIdAtPosition(lineNumber, 0);
            const result = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, newLineContent, true, lineStartState);
            const lineTokens = new lineTokens_1.LineTokens(result.tokens, newLineContent, this._languageIdCodec);
            return lineTokens;
        }
        isCheapToTokenize(lineNumber) {
            const firstInvalidLineNumber = this.store.getFirstInvalidEndStateLineNumberOrMax();
            if (lineNumber < firstInvalidLineNumber) {
                return true;
            }
            if (lineNumber === firstInvalidLineNumber
                && this._textModel.getLineLength(lineNumber) < 2048 /* Constants.CHEAP_TOKENIZATION_LENGTH_LIMIT */) {
                return true;
            }
            return false;
        }
        /**
         * The result is not cached.
         */
        tokenizeHeuristically(builder, startLineNumber, endLineNumber) {
            if (endLineNumber <= this.store.getFirstInvalidEndStateLineNumberOrMax()) {
                // nothing to do
                return { heuristicTokens: false };
            }
            if (startLineNumber <= this.store.getFirstInvalidEndStateLineNumberOrMax()) {
                // tokenization has reached the viewport start...
                this.updateTokensUntilLine(builder, endLineNumber);
                return { heuristicTokens: false };
            }
            let state = this.guessStartState(startLineNumber);
            const languageId = this._textModel.getLanguageId();
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const text = this._textModel.getLineContent(lineNumber);
                const r = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, text, true, state);
                builder.add(lineNumber, r.tokens);
                state = r.endState;
            }
            return { heuristicTokens: true };
        }
        guessStartState(lineNumber) {
            let nonWhitespaceColumn = this._textModel.getLineFirstNonWhitespaceColumn(lineNumber);
            const likelyRelevantLines = [];
            let initialState = null;
            for (let i = lineNumber - 1; nonWhitespaceColumn > 1 && i >= 1; i--) {
                const newNonWhitespaceIndex = this._textModel.getLineFirstNonWhitespaceColumn(i);
                // Ignore lines full of whitespace
                if (newNonWhitespaceIndex === 0) {
                    continue;
                }
                if (newNonWhitespaceIndex < nonWhitespaceColumn) {
                    likelyRelevantLines.push(this._textModel.getLineContent(i));
                    nonWhitespaceColumn = newNonWhitespaceIndex;
                    initialState = this.getStartState(i);
                    if (initialState) {
                        break;
                    }
                }
            }
            if (!initialState) {
                initialState = this.tokenizationSupport.getInitialState();
            }
            likelyRelevantLines.reverse();
            const languageId = this._textModel.getLanguageId();
            let state = initialState;
            for (const line of likelyRelevantLines) {
                const r = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, line, false, state);
                state = r.endState;
            }
            return state;
        }
    }
    exports.TokenizerWithStateStoreAndTextModel = TokenizerWithStateStoreAndTextModel;
    /**
     * **Invariant:**
     * If the text model is retokenized from line 1 to {@link getFirstInvalidEndStateLineNumber}() - 1,
     * then the recomputed end state for line l will be equal to {@link getEndState}(l).
     */
    class TrackingTokenizationStateStore {
        constructor(lineCount) {
            this.lineCount = lineCount;
            this._tokenizationStateStore = new TokenizationStateStore();
            this._invalidEndStatesLineNumbers = new RangePriorityQueueImpl();
            this._invalidEndStatesLineNumbers.addRange(new offsetRange_1.OffsetRange(1, lineCount + 1));
        }
        getEndState(lineNumber) {
            return this._tokenizationStateStore.getEndState(lineNumber);
        }
        /**
         * @returns if the end state has changed.
         */
        setEndState(lineNumber, state) {
            if (!state) {
                throw new errors_1.BugIndicatingError('Cannot set null/undefined state');
            }
            this._invalidEndStatesLineNumbers.delete(lineNumber);
            const r = this._tokenizationStateStore.setEndState(lineNumber, state);
            if (r && lineNumber < this.lineCount) {
                // because the state changed, we cannot trust the next state anymore and have to invalidate it.
                this._invalidEndStatesLineNumbers.addRange(new offsetRange_1.OffsetRange(lineNumber + 1, lineNumber + 2));
            }
            return r;
        }
        acceptChange(range, newLineCount) {
            this.lineCount += newLineCount - range.length;
            this._tokenizationStateStore.acceptChange(range, newLineCount);
            this._invalidEndStatesLineNumbers.addRangeAndResize(new offsetRange_1.OffsetRange(range.startLineNumber, range.endLineNumberExclusive), newLineCount);
        }
        acceptChanges(changes) {
            for (const c of changes) {
                const [eolCount] = (0, eolCounter_1.countEOL)(c.text);
                this.acceptChange(new lineRange_1.LineRange(c.range.startLineNumber, c.range.endLineNumber + 1), eolCount + 1);
            }
        }
        invalidateEndStateRange(range) {
            this._invalidEndStatesLineNumbers.addRange(new offsetRange_1.OffsetRange(range.startLineNumber, range.endLineNumberExclusive));
        }
        getFirstInvalidEndStateLineNumber() { return this._invalidEndStatesLineNumbers.min; }
        getFirstInvalidEndStateLineNumberOrMax() {
            return this.getFirstInvalidEndStateLineNumber() || Number.MAX_SAFE_INTEGER;
        }
        allStatesValid() { return this._invalidEndStatesLineNumbers.min === null; }
        getStartState(lineNumber, initialState) {
            if (lineNumber === 1) {
                return initialState;
            }
            return this.getEndState(lineNumber - 1);
        }
        getFirstInvalidLine(initialState) {
            const lineNumber = this.getFirstInvalidEndStateLineNumber();
            if (lineNumber === null) {
                return null;
            }
            const startState = this.getStartState(lineNumber, initialState);
            if (!startState) {
                throw new errors_1.BugIndicatingError('Start state must be defined');
            }
            return { lineNumber, startState };
        }
    }
    exports.TrackingTokenizationStateStore = TrackingTokenizationStateStore;
    class TokenizationStateStore {
        constructor() {
            this._lineEndStates = new fixedArray_1.FixedArray(null);
        }
        getEndState(lineNumber) {
            return this._lineEndStates.get(lineNumber);
        }
        setEndState(lineNumber, state) {
            const oldState = this._lineEndStates.get(lineNumber);
            if (oldState && oldState.equals(state)) {
                return false;
            }
            this._lineEndStates.set(lineNumber, state);
            return true;
        }
        acceptChange(range, newLineCount) {
            let length = range.length;
            if (newLineCount > 0 && length > 0) {
                // Keep the last state, even though it is unrelated.
                // But if the new state happens to agree with this last state, then we know we can stop tokenizing.
                length--;
                newLineCount--;
            }
            this._lineEndStates.replace(range.startLineNumber, length, newLineCount);
        }
        acceptChanges(changes) {
            for (const c of changes) {
                const [eolCount] = (0, eolCounter_1.countEOL)(c.text);
                this.acceptChange(new lineRange_1.LineRange(c.range.startLineNumber, c.range.endLineNumber + 1), eolCount + 1);
            }
        }
    }
    exports.TokenizationStateStore = TokenizationStateStore;
    class RangePriorityQueueImpl {
        constructor() {
            this._ranges = [];
        }
        getRanges() {
            return this._ranges;
        }
        get min() {
            if (this._ranges.length === 0) {
                return null;
            }
            return this._ranges[0].start;
        }
        removeMin() {
            if (this._ranges.length === 0) {
                return null;
            }
            const range = this._ranges[0];
            if (range.start + 1 === range.endExclusive) {
                this._ranges.shift();
            }
            else {
                this._ranges[0] = new offsetRange_1.OffsetRange(range.start + 1, range.endExclusive);
            }
            return range.start;
        }
        delete(value) {
            const idx = this._ranges.findIndex(r => r.contains(value));
            if (idx !== -1) {
                const range = this._ranges[idx];
                if (range.start === value) {
                    if (range.endExclusive === value + 1) {
                        this._ranges.splice(idx, 1);
                    }
                    else {
                        this._ranges[idx] = new offsetRange_1.OffsetRange(value + 1, range.endExclusive);
                    }
                }
                else {
                    if (range.endExclusive === value + 1) {
                        this._ranges[idx] = new offsetRange_1.OffsetRange(range.start, value);
                    }
                    else {
                        this._ranges.splice(idx, 1, new offsetRange_1.OffsetRange(range.start, value), new offsetRange_1.OffsetRange(value + 1, range.endExclusive));
                    }
                }
            }
        }
        addRange(range) {
            offsetRange_1.OffsetRange.addRange(range, this._ranges);
        }
        addRangeAndResize(range, newLength) {
            let idxFirstMightBeIntersecting = 0;
            while (!(idxFirstMightBeIntersecting >= this._ranges.length || range.start <= this._ranges[idxFirstMightBeIntersecting].endExclusive)) {
                idxFirstMightBeIntersecting++;
            }
            let idxFirstIsAfter = idxFirstMightBeIntersecting;
            while (!(idxFirstIsAfter >= this._ranges.length || range.endExclusive < this._ranges[idxFirstIsAfter].start)) {
                idxFirstIsAfter++;
            }
            const delta = newLength - range.length;
            for (let i = idxFirstIsAfter; i < this._ranges.length; i++) {
                this._ranges[i] = this._ranges[i].delta(delta);
            }
            if (idxFirstMightBeIntersecting === idxFirstIsAfter) {
                const newRange = new offsetRange_1.OffsetRange(range.start, range.start + newLength);
                if (!newRange.isEmpty) {
                    this._ranges.splice(idxFirstMightBeIntersecting, 0, newRange);
                }
            }
            else {
                const start = Math.min(range.start, this._ranges[idxFirstMightBeIntersecting].start);
                const endEx = Math.max(range.endExclusive, this._ranges[idxFirstIsAfter - 1].endExclusive);
                const newRange = new offsetRange_1.OffsetRange(start, endEx + delta);
                if (!newRange.isEmpty) {
                    this._ranges.splice(idxFirstMightBeIntersecting, idxFirstIsAfter - idxFirstMightBeIntersecting, newRange);
                }
                else {
                    this._ranges.splice(idxFirstMightBeIntersecting, idxFirstIsAfter - idxFirstMightBeIntersecting);
                }
            }
        }
        toString() {
            return this._ranges.map(r => r.toString()).join(' + ');
        }
    }
    exports.RangePriorityQueueImpl = RangePriorityQueueImpl;
    function safeTokenize(languageIdCodec, languageId, tokenizationSupport, text, hasEOL, state) {
        let r = null;
        if (tokenizationSupport) {
            try {
                r = tokenizationSupport.tokenizeEncoded(text, hasEOL, state.clone());
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
        }
        if (!r) {
            r = (0, nullTokenize_1.nullTokenizeEncoded)(languageIdCodec.encodeLanguageId(languageId), state);
        }
        lineTokens_1.LineTokens.convertToEndOffset(r.tokens, text.length);
        return r;
    }
    class DefaultBackgroundTokenizer {
        constructor(_tokenizerWithStateStore, _backgroundTokenStore) {
            this._tokenizerWithStateStore = _tokenizerWithStateStore;
            this._backgroundTokenStore = _backgroundTokenStore;
            this._isDisposed = false;
            this._isScheduled = false;
        }
        dispose() {
            this._isDisposed = true;
        }
        handleChanges() {
            this._beginBackgroundTokenization();
        }
        _beginBackgroundTokenization() {
            if (this._isScheduled || !this._tokenizerWithStateStore._textModel.isAttachedToEditor() || !this._hasLinesToTokenize()) {
                return;
            }
            this._isScheduled = true;
            (0, async_1.runWhenIdle)((deadline) => {
                this._isScheduled = false;
                this._backgroundTokenizeWithDeadline(deadline);
            });
        }
        /**
         * Tokenize until the deadline occurs, but try to yield every 1-2ms.
         */
        _backgroundTokenizeWithDeadline(deadline) {
            // Read the time remaining from the `deadline` immediately because it is unclear
            // if the `deadline` object will be valid after execution leaves this function.
            const endTime = Date.now() + deadline.timeRemaining();
            const execute = () => {
                if (this._isDisposed || !this._tokenizerWithStateStore._textModel.isAttachedToEditor() || !this._hasLinesToTokenize()) {
                    // disposed in the meantime or detached or finished
                    return;
                }
                this._backgroundTokenizeForAtLeast1ms();
                if (Date.now() < endTime) {
                    // There is still time before reaching the deadline, so yield to the browser and then
                    // continue execution
                    (0, platform_1.setTimeout0)(execute);
                }
                else {
                    // The deadline has been reached, so schedule a new idle callback if necessary
                    this._beginBackgroundTokenization();
                }
            };
            execute();
        }
        /**
         * Tokenize for at least 1ms.
         */
        _backgroundTokenizeForAtLeast1ms() {
            const lineCount = this._tokenizerWithStateStore._textModel.getLineCount();
            const builder = new contiguousMultilineTokensBuilder_1.ContiguousMultilineTokensBuilder();
            const sw = stopwatch_1.StopWatch.create(false);
            do {
                if (sw.elapsed() > 1) {
                    // the comparison is intentionally > 1 and not >= 1 to ensure that
                    // a full millisecond has elapsed, given how microseconds are rounded
                    // to milliseconds
                    break;
                }
                const tokenizedLineNumber = this._tokenizeOneInvalidLine(builder);
                if (tokenizedLineNumber >= lineCount) {
                    break;
                }
            } while (this._hasLinesToTokenize());
            this._backgroundTokenStore.setTokens(builder.finalize());
            this.checkFinished();
        }
        _hasLinesToTokenize() {
            if (!this._tokenizerWithStateStore) {
                return false;
            }
            return !this._tokenizerWithStateStore.store.allStatesValid();
        }
        _tokenizeOneInvalidLine(builder) {
            const firstInvalidLine = this._tokenizerWithStateStore?.getFirstInvalidLine();
            if (!firstInvalidLine) {
                return this._tokenizerWithStateStore._textModel.getLineCount() + 1;
            }
            this._tokenizerWithStateStore.updateTokensUntilLine(builder, firstInvalidLine.lineNumber);
            return firstInvalidLine.lineNumber;
        }
        checkFinished() {
            if (this._isDisposed) {
                return;
            }
            if (this._tokenizerWithStateStore.store.allStatesValid()) {
                this._backgroundTokenStore.backgroundTokenizationFinished();
            }
        }
        requestTokens(startLineNumber, endLineNumberExclusive) {
            this._tokenizerWithStateStore.store.invalidateEndStateRange(new lineRange_1.LineRange(startLineNumber, endLineNumberExclusive));
        }
    }
    exports.DefaultBackgroundTokenizer = DefaultBackgroundTokenizer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsVG9rZW5zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC90ZXh0TW9kZWxUb2tlbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJoRyxJQUFXLFNBRVY7SUFGRCxXQUFXLFNBQVM7UUFDbkIsa0dBQXNDLENBQUE7SUFDdkMsQ0FBQyxFQUZVLFNBQVMsS0FBVCxTQUFTLFFBRW5CO0lBRUQsTUFBYSx1QkFBdUI7UUFLbkMsWUFDQyxTQUFpQixFQUNELG1CQUF5QztZQUF6Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBTnpDLGlCQUFZLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBWSxDQUFDO1lBUXBGLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSw4QkFBOEIsQ0FBUyxTQUFTLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRU0sYUFBYSxDQUFDLFVBQWtCO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRU0sbUJBQW1CO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUQsQ0FBQztLQUNEO0lBbkJELDBEQW1CQztJQUVELE1BQWEsbUNBQW9FLFNBQVEsdUJBQStCO1FBQ3ZILFlBQ0MsU0FBaUIsRUFDakIsbUJBQXlDLEVBQ3pCLFVBQXNCLEVBQ3RCLGdCQUFrQztZQUVsRCxLQUFLLENBQUMsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFIdEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtZQUN0QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBR25ELENBQUM7UUFFTSxxQkFBcUIsQ0FB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