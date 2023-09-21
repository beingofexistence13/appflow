/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/stopwatch", "vs/editor/common/core/eolCounter", "vs/editor/common/core/lineRange", "vs/editor/common/core/offsetRange", "vs/editor/common/languages/nullTokenize", "vs/editor/common/model/fixedArray", "vs/editor/common/tokens/contiguousMultilineTokensBuilder", "vs/editor/common/tokens/lineTokens"], function (require, exports, async_1, errors_1, platform_1, stopwatch_1, eolCounter_1, lineRange_1, offsetRange_1, nullTokenize_1, fixedArray_1, contiguousMultilineTokensBuilder_1, lineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EC = exports.$DC = exports.$CC = exports.$BC = exports.$AC = exports.$zC = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["CHEAP_TOKENIZATION_LENGTH_LIMIT"] = 2048] = "CHEAP_TOKENIZATION_LENGTH_LIMIT";
    })(Constants || (Constants = {}));
    class $zC {
        constructor(lineCount, tokenizationSupport) {
            this.tokenizationSupport = tokenizationSupport;
            this.a = this.tokenizationSupport.getInitialState();
            this.store = new $BC(lineCount);
        }
        getStartState(lineNumber) {
            return this.store.getStartState(lineNumber, this.a);
        }
        getFirstInvalidLine() {
            return this.store.getFirstInvalidLine(this.a);
        }
    }
    exports.$zC = $zC;
    class $AC extends $zC {
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
            const lineTokens = new lineTokens_1.$Xs(r.tokens, text, this._languageIdCodec);
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
            const lineTokens = new lineTokens_1.$Xs(result.tokens, newLineContent, this._languageIdCodec);
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
            let state = this.b(startLineNumber);
            const languageId = this._textModel.getLanguageId();
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const text = this._textModel.getLineContent(lineNumber);
                const r = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, text, true, state);
                builder.add(lineNumber, r.tokens);
                state = r.endState;
            }
            return { heuristicTokens: true };
        }
        b(lineNumber) {
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
    exports.$AC = $AC;
    /**
     * **Invariant:**
     * If the text model is retokenized from line 1 to {@link getFirstInvalidEndStateLineNumber}() - 1,
     * then the recomputed end state for line l will be equal to {@link getEndState}(l).
     */
    class $BC {
        constructor(d) {
            this.d = d;
            this.a = new $CC();
            this.b = new $DC();
            this.b.addRange(new offsetRange_1.$rs(1, d + 1));
        }
        getEndState(lineNumber) {
            return this.a.getEndState(lineNumber);
        }
        /**
         * @returns if the end state has changed.
         */
        setEndState(lineNumber, state) {
            if (!state) {
                throw new errors_1.$ab('Cannot set null/undefined state');
            }
            this.b.delete(lineNumber);
            const r = this.a.setEndState(lineNumber, state);
            if (r && lineNumber < this.d) {
                // because the state changed, we cannot trust the next state anymore and have to invalidate it.
                this.b.addRange(new offsetRange_1.$rs(lineNumber + 1, lineNumber + 2));
            }
            return r;
        }
        acceptChange(range, newLineCount) {
            this.d += newLineCount - range.length;
            this.a.acceptChange(range, newLineCount);
            this.b.addRangeAndResize(new offsetRange_1.$rs(range.startLineNumber, range.endLineNumberExclusive), newLineCount);
        }
        acceptChanges(changes) {
            for (const c of changes) {
                const [eolCount] = (0, eolCounter_1.$Ws)(c.text);
                this.acceptChange(new lineRange_1.$ts(c.range.startLineNumber, c.range.endLineNumber + 1), eolCount + 1);
            }
        }
        invalidateEndStateRange(range) {
            this.b.addRange(new offsetRange_1.$rs(range.startLineNumber, range.endLineNumberExclusive));
        }
        getFirstInvalidEndStateLineNumber() { return this.b.min; }
        getFirstInvalidEndStateLineNumberOrMax() {
            return this.getFirstInvalidEndStateLineNumber() || Number.MAX_SAFE_INTEGER;
        }
        allStatesValid() { return this.b.min === null; }
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
                throw new errors_1.$ab('Start state must be defined');
            }
            return { lineNumber, startState };
        }
    }
    exports.$BC = $BC;
    class $CC {
        constructor() {
            this.a = new fixedArray_1.$xC(null);
        }
        getEndState(lineNumber) {
            return this.a.get(lineNumber);
        }
        setEndState(lineNumber, state) {
            const oldState = this.a.get(lineNumber);
            if (oldState && oldState.equals(state)) {
                return false;
            }
            this.a.set(lineNumber, state);
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
            this.a.replace(range.startLineNumber, length, newLineCount);
        }
        acceptChanges(changes) {
            for (const c of changes) {
                const [eolCount] = (0, eolCounter_1.$Ws)(c.text);
                this.acceptChange(new lineRange_1.$ts(c.range.startLineNumber, c.range.endLineNumber + 1), eolCount + 1);
            }
        }
    }
    exports.$CC = $CC;
    class $DC {
        constructor() {
            this.a = [];
        }
        getRanges() {
            return this.a;
        }
        get min() {
            if (this.a.length === 0) {
                return null;
            }
            return this.a[0].start;
        }
        removeMin() {
            if (this.a.length === 0) {
                return null;
            }
            const range = this.a[0];
            if (range.start + 1 === range.endExclusive) {
                this.a.shift();
            }
            else {
                this.a[0] = new offsetRange_1.$rs(range.start + 1, range.endExclusive);
            }
            return range.start;
        }
        delete(value) {
            const idx = this.a.findIndex(r => r.contains(value));
            if (idx !== -1) {
                const range = this.a[idx];
                if (range.start === value) {
                    if (range.endExclusive === value + 1) {
                        this.a.splice(idx, 1);
                    }
                    else {
                        this.a[idx] = new offsetRange_1.$rs(value + 1, range.endExclusive);
                    }
                }
                else {
                    if (range.endExclusive === value + 1) {
                        this.a[idx] = new offsetRange_1.$rs(range.start, value);
                    }
                    else {
                        this.a.splice(idx, 1, new offsetRange_1.$rs(range.start, value), new offsetRange_1.$rs(value + 1, range.endExclusive));
                    }
                }
            }
        }
        addRange(range) {
            offsetRange_1.$rs.addRange(range, this.a);
        }
        addRangeAndResize(range, newLength) {
            let idxFirstMightBeIntersecting = 0;
            while (!(idxFirstMightBeIntersecting >= this.a.length || range.start <= this.a[idxFirstMightBeIntersecting].endExclusive)) {
                idxFirstMightBeIntersecting++;
            }
            let idxFirstIsAfter = idxFirstMightBeIntersecting;
            while (!(idxFirstIsAfter >= this.a.length || range.endExclusive < this.a[idxFirstIsAfter].start)) {
                idxFirstIsAfter++;
            }
            const delta = newLength - range.length;
            for (let i = idxFirstIsAfter; i < this.a.length; i++) {
                this.a[i] = this.a[i].delta(delta);
            }
            if (idxFirstMightBeIntersecting === idxFirstIsAfter) {
                const newRange = new offsetRange_1.$rs(range.start, range.start + newLength);
                if (!newRange.isEmpty) {
                    this.a.splice(idxFirstMightBeIntersecting, 0, newRange);
                }
            }
            else {
                const start = Math.min(range.start, this.a[idxFirstMightBeIntersecting].start);
                const endEx = Math.max(range.endExclusive, this.a[idxFirstIsAfter - 1].endExclusive);
                const newRange = new offsetRange_1.$rs(start, endEx + delta);
                if (!newRange.isEmpty) {
                    this.a.splice(idxFirstMightBeIntersecting, idxFirstIsAfter - idxFirstMightBeIntersecting, newRange);
                }
                else {
                    this.a.splice(idxFirstMightBeIntersecting, idxFirstIsAfter - idxFirstMightBeIntersecting);
                }
            }
        }
        toString() {
            return this.a.map(r => r.toString()).join(' + ');
        }
    }
    exports.$DC = $DC;
    function safeTokenize(languageIdCodec, languageId, tokenizationSupport, text, hasEOL, state) {
        let r = null;
        if (tokenizationSupport) {
            try {
                r = tokenizationSupport.tokenizeEncoded(text, hasEOL, state.clone());
            }
            catch (e) {
                (0, errors_1.$Y)(e);
            }
        }
        if (!r) {
            r = (0, nullTokenize_1.$wC)(languageIdCodec.encodeLanguageId(languageId), state);
        }
        lineTokens_1.$Xs.convertToEndOffset(r.tokens, text.length);
        return r;
    }
    class $EC {
        constructor(b, d) {
            this.b = b;
            this.d = d;
            this.a = false;
            this.f = false;
        }
        dispose() {
            this.a = true;
        }
        handleChanges() {
            this.g();
        }
        g() {
            if (this.f || !this.b._textModel.isAttachedToEditor() || !this.k()) {
                return;
            }
            this.f = true;
            (0, async_1.$Wg)((deadline) => {
                this.f = false;
                this.h(deadline);
            });
        }
        /**
         * Tokenize until the deadline occurs, but try to yield every 1-2ms.
         */
        h(deadline) {
            // Read the time remaining from the `deadline` immediately because it is unclear
            // if the `deadline` object will be valid after execution leaves this function.
            const endTime = Date.now() + deadline.timeRemaining();
            const execute = () => {
                if (this.a || !this.b._textModel.isAttachedToEditor() || !this.k()) {
                    // disposed in the meantime or detached or finished
                    return;
                }
                this.j();
                if (Date.now() < endTime) {
                    // There is still time before reaching the deadline, so yield to the browser and then
                    // continue execution
                    (0, platform_1.$A)(execute);
                }
                else {
                    // The deadline has been reached, so schedule a new idle callback if necessary
                    this.g();
                }
            };
            execute();
        }
        /**
         * Tokenize for at least 1ms.
         */
        j() {
            const lineCount = this.b._textModel.getLineCount();
            const builder = new contiguousMultilineTokensBuilder_1.$yC();
            const sw = stopwatch_1.$bd.create(false);
            do {
                if (sw.elapsed() > 1) {
                    // the comparison is intentionally > 1 and not >= 1 to ensure that
                    // a full millisecond has elapsed, given how microseconds are rounded
                    // to milliseconds
                    break;
                }
                const tokenizedLineNumber = this.l(builder);
                if (tokenizedLineNumber >= lineCount) {
                    break;
                }
            } while (this.k());
            this.d.setTokens(builder.finalize());
            this.checkFinished();
        }
        k() {
            if (!this.b) {
                return false;
            }
            return !this.b.store.allStatesValid();
        }
        l(builder) {
            const firstInvalidLine = this.b?.getFirstInvalidLine();
            if (!firstInvalidLine) {
                return this.b._textModel.getLineCount() + 1;
            }
            this.b.updateTokensUntilLine(builder, firstInvalidLine.lineNumber);
            return firstInvalidLine.lineNumber;
        }
        checkFinished() {
            if (this.a) {
                return;
            }
            if (this.b.store.allStatesValid()) {
                this.d.backgroundTokenizationFinished();
            }
        }
        requestTokens(startLineNumber, endLineNumberExclusive) {
            this.b.store.invalidateEndStateRange(new lineRange_1.$ts(startLineNumber, endLineNumberExclusive));
        }
    }
    exports.$EC = $EC;
});
//# sourceMappingURL=textModelTokens.js.map