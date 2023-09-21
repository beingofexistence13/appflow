/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/eolCounter", "vs/editor/common/core/lineRange", "vs/editor/common/core/position", "vs/editor/common/core/wordHelper", "vs/editor/common/languages", "vs/editor/common/model/textModelPart", "vs/editor/common/model/textModelTokens", "vs/editor/common/tokens/contiguousMultilineTokensBuilder", "vs/editor/common/tokens/contiguousTokensStore", "vs/editor/common/tokens/sparseTokensStore"], function (require, exports, arrays_1, async_1, errors_1, event_1, lifecycle_1, eolCounter_1, lineRange_1, position_1, wordHelper_1, languages_1, textModelPart_1, textModelTokens_1, contiguousMultilineTokensBuilder_1, contiguousTokensStore_1, sparseTokensStore_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HC = void 0;
    class $HC extends textModelPart_1.$WB {
        constructor(t, u, w, y, z, C) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.h = new sparseTokensStore_1.$GC(this.t.languageIdCodec);
            this.j = this.B(new event_1.$fd());
            this.onDidChangeLanguage = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidChangeLanguageConfiguration = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onDidChangeTokens = this.n.event;
            this.r = this.B(new GrammarTokens(this.t.languageIdCodec, this.w, () => this.z, this.C));
            this.B(this.u.onDidChange(e => {
                if (e.affects(this.z)) {
                    this.m.fire({});
                }
            }));
            this.B(this.r.onDidChangeTokens(e => {
                this.D(e);
            }));
            this.B(this.r.onDidChangeBackgroundTokenizationState(e => {
                this.y.handleDidChangeBackgroundTokenizationState();
            }));
        }
        _hasListeners() {
            return (this.j.hasListeners()
                || this.m.hasListeners()
                || this.n.hasListeners());
        }
        handleDidChangeContent(e) {
            if (e.isFlush) {
                this.h.flush();
            }
            else if (!e.isEolChange) { // We don't have to do anything on an EOL change
                for (const c of e.changes) {
                    const [eolCount, firstLineLength, lastLineLength] = (0, eolCounter_1.$Ws)(c.text);
                    this.h.acceptEdit(c.range, eolCount, firstLineLength, lastLineLength, c.text.length > 0 ? c.text.charCodeAt(0) : 0 /* CharCode.Null */);
                }
            }
            this.r.handleDidChangeContent(e);
        }
        handleDidChangeAttached() {
            this.r.handleDidChangeAttached();
        }
        /**
         * Includes grammar and semantic tokens.
         */
        getLineTokens(lineNumber) {
            this.F(lineNumber);
            const syntacticTokens = this.r.getLineTokens(lineNumber);
            return this.h.addSparseTokens(lineNumber, syntacticTokens);
        }
        D(e) {
            if (!this.w._isDisposing()) {
                this.y.handleDidChangeTokens(e);
                this.n.fire(e);
            }
        }
        // #region Grammar Tokens
        F(lineNumber) {
            if (lineNumber < 1 || lineNumber > this.w.getLineCount()) {
                throw new errors_1.$ab('Illegal value for lineNumber');
            }
        }
        get hasTokens() {
            return this.r.hasTokens;
        }
        resetTokenization() {
            this.r.resetTokenization();
        }
        get backgroundTokenizationState() {
            return this.r.backgroundTokenizationState;
        }
        forceTokenization(lineNumber) {
            this.F(lineNumber);
            this.r.forceTokenization(lineNumber);
        }
        isCheapToTokenize(lineNumber) {
            this.F(lineNumber);
            return this.r.isCheapToTokenize(lineNumber);
        }
        tokenizeIfCheap(lineNumber) {
            this.F(lineNumber);
            this.r.tokenizeIfCheap(lineNumber);
        }
        getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
            return this.r.getTokenTypeIfInsertingCharacter(lineNumber, column, character);
        }
        tokenizeLineWithEdit(position, length, newText) {
            return this.r.tokenizeLineWithEdit(position, length, newText);
        }
        // #endregion
        // #region Semantic Tokens
        setSemanticTokens(tokens, isComplete) {
            this.h.set(tokens, isComplete);
            this.D({
                semanticTokensApplied: tokens !== null,
                ranges: [{ fromLineNumber: 1, toLineNumber: this.w.getLineCount() }],
            });
        }
        hasCompleteSemanticTokens() {
            return this.h.isComplete();
        }
        hasSomeSemanticTokens() {
            return !this.h.isEmpty();
        }
        setPartialSemanticTokens(range, tokens) {
            if (this.hasCompleteSemanticTokens()) {
                return;
            }
            const changedRange = this.w.validateRange(this.h.setPartial(range, tokens));
            this.D({
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
            this.g();
            const position = this.w.validatePosition(_position);
            const lineContent = this.w.getLineContent(position.lineNumber);
            const lineTokens = this.getLineTokens(position.lineNumber);
            const tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
            // (1). First try checking right biased word
            const [rbStartOffset, rbEndOffset] = $HC.H(lineTokens, tokenIndex);
            const rightBiasedWord = (0, wordHelper_1.$Zr)(position.column, this.G(lineTokens.getLanguageId(tokenIndex)).getWordDefinition(), lineContent.substring(rbStartOffset, rbEndOffset), rbStartOffset);
            // Make sure the result touches the original passed in position
            if (rightBiasedWord &&
                rightBiasedWord.startColumn <= _position.column &&
                _position.column <= rightBiasedWord.endColumn) {
                return rightBiasedWord;
            }
            // (2). Else, if we were at a language boundary, check the left biased word
            if (tokenIndex > 0 && rbStartOffset === position.column - 1) {
                // edge case, where `position` sits between two tokens belonging to two different languages
                const [lbStartOffset, lbEndOffset] = $HC.H(lineTokens, tokenIndex - 1);
                const leftBiasedWord = (0, wordHelper_1.$Zr)(position.column, this.G(lineTokens.getLanguageId(tokenIndex - 1)).getWordDefinition(), lineContent.substring(lbStartOffset, lbEndOffset), lbStartOffset);
                // Make sure the result touches the original passed in position
                if (leftBiasedWord &&
                    leftBiasedWord.startColumn <= _position.column &&
                    _position.column <= leftBiasedWord.endColumn) {
                    return leftBiasedWord;
                }
            }
            return null;
        }
        G(languageId) {
            return this.u.getLanguageConfiguration(languageId);
        }
        static H(lineTokens, tokenIndex) {
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
            return this.z;
        }
        getLanguageIdAtPosition(lineNumber, column) {
            const position = this.w.validatePosition(new position_1.$js(lineNumber, column));
            const lineTokens = this.getLineTokens(position.lineNumber);
            return lineTokens.getLanguageId(lineTokens.findTokenIndexAtOffset(position.column - 1));
        }
        setLanguageId(languageId, source = 'api') {
            if (this.z === languageId) {
                // There's nothing to do
                return;
            }
            const e = {
                oldLanguage: this.z,
                newLanguage: languageId,
                source
            };
            this.z = languageId;
            this.y.handleDidChangeLanguage(e);
            this.r.resetTokenization();
            this.j.fire(e);
            this.m.fire({});
        }
    }
    exports.$HC = $HC;
    class GrammarTokens extends lifecycle_1.$kc {
        get backgroundTokenizationState() {
            return this.t;
        }
        constructor(z, C, D, attachedViews) {
            super();
            this.z = z;
            this.C = C;
            this.D = D;
            this.f = null;
            this.g = null;
            this.h = this.B(new lifecycle_1.$lc());
            this.j = new contiguousTokensStore_1.$FC(this.z);
            this.r = this.B(new lifecycle_1.$lc());
            this.t = 1 /* BackgroundTokenizationState.InProgress */;
            this.u = this.B(new event_1.$fd());
            /** @internal, should not be exposed by the text model! */
            this.onDidChangeBackgroundTokenizationState = this.u.event;
            this.w = this.B(new event_1.$fd());
            /** @internal, should not be exposed by the text model! */
            this.onDidChangeTokens = this.w.event;
            this.y = this.B(new lifecycle_1.$sc());
            this.B(languages_1.$bt.onDidChange((e) => {
                const languageId = this.D();
                if (e.changedLanguages.indexOf(languageId) === -1) {
                    return;
                }
                this.resetTokenization();
            }));
            this.resetTokenization();
            this.B(attachedViews.onDidChangeVisibleRanges(({ view, state }) => {
                if (state) {
                    let existing = this.y.get(view);
                    if (!existing) {
                        existing = new AttachedViewHandler(() => this.H(existing.lineRanges));
                        this.y.set(view, existing);
                    }
                    existing.handleStateChange(state);
                }
                else {
                    this.y.deleteAndDispose(view);
                }
            }));
        }
        resetTokenization(fireTokenChangeEvent = true) {
            this.j.flush();
            this.m?.flush();
            if (this.n) {
                this.n = new textModelTokens_1.$BC(this.C.getLineCount());
            }
            if (fireTokenChangeEvent) {
                this.w.fire({
                    semanticTokensApplied: false,
                    ranges: [
                        {
                            fromLineNumber: 1,
                            toLineNumber: this.C.getLineCount(),
                        },
                    ],
                });
            }
            const initializeTokenization = () => {
                if (this.C.isTooLargeForTokenization()) {
                    return [null, null];
                }
                const tokenizationSupport = languages_1.$bt.get(this.D());
                if (!tokenizationSupport) {
                    return [null, null];
                }
                let initialState;
                try {
                    initialState = tokenizationSupport.getInitialState();
                }
                catch (e) {
                    (0, errors_1.$Y)(e);
                    return [null, null];
                }
                return [tokenizationSupport, initialState];
            };
            const [tokenizationSupport, initialState] = initializeTokenization();
            if (tokenizationSupport && initialState) {
                this.f = new textModelTokens_1.$AC(this.C.getLineCount(), tokenizationSupport, this.C, this.z);
            }
            else {
                this.f = null;
            }
            this.h.clear();
            this.g = null;
            if (this.f) {
                const b = {
                    setTokens: (tokens) => {
                        this.F(tokens);
                    },
                    backgroundTokenizationFinished: () => {
                        if (this.t === 2 /* BackgroundTokenizationState.Completed */) {
                            // We already did a full tokenization and don't go back to progressing.
                            return;
                        }
                        const newState = 2 /* BackgroundTokenizationState.Completed */;
                        this.t = newState;
                        this.u.fire();
                    },
                    setEndState: (lineNumber, state) => {
                        if (!this.f) {
                            return;
                        }
                        const firstInvalidEndStateLineNumber = this.f.store.getFirstInvalidEndStateLineNumber();
                        // Don't accept states for definitely valid states, the renderer is ahead of the worker!
                        if (firstInvalidEndStateLineNumber !== null && lineNumber >= firstInvalidEndStateLineNumber) {
                            this.f?.store.setEndState(lineNumber, state);
                        }
                    },
                };
                if (tokenizationSupport && tokenizationSupport.createBackgroundTokenizer && !tokenizationSupport.backgroundTokenizerShouldOnlyVerifyTokens) {
                    this.h.value = tokenizationSupport.createBackgroundTokenizer(this.C, b);
                }
                if (!this.h.value) {
                    this.h.value = this.g =
                        new textModelTokens_1.$EC(this.f, b);
                    this.g.handleChanges();
                }
                if (tokenizationSupport?.backgroundTokenizerShouldOnlyVerifyTokens && tokenizationSupport.createBackgroundTokenizer) {
                    this.m = new contiguousTokensStore_1.$FC(this.z);
                    this.n = new textModelTokens_1.$BC(this.C.getLineCount());
                    this.r.clear();
                    this.r.value = tokenizationSupport.createBackgroundTokenizer(this.C, {
                        setTokens: (tokens) => {
                            this.m?.setMultilineTokens(tokens, this.C);
                        },
                        backgroundTokenizationFinished() {
                            // NO OP
                        },
                        setEndState: (lineNumber, state) => {
                            this.n?.setEndState(lineNumber, state);
                        },
                    });
                }
                else {
                    this.m = undefined;
                    this.n = undefined;
                    this.r.value = undefined;
                }
            }
            this.G();
        }
        handleDidChangeAttached() {
            this.g?.handleChanges();
        }
        handleDidChangeContent(e) {
            if (e.isFlush) {
                // Don't fire the event, as the view might not have got the text change event yet
                this.resetTokenization(false);
            }
            else if (!e.isEolChange) { // We don't have to do anything on an EOL change
                for (const c of e.changes) {
                    const [eolCount, firstLineLength] = (0, eolCounter_1.$Ws)(c.text);
                    this.j.acceptEdit(c.range, eolCount, firstLineLength);
                    this.m?.acceptEdit(c.range, eolCount, firstLineLength);
                }
                this.n?.acceptChanges(e.changes);
                if (this.f) {
                    this.f.store.acceptChanges(e.changes);
                }
                this.g?.handleChanges();
            }
        }
        F(tokens) {
            const { changes } = this.j.setMultilineTokens(tokens, this.C);
            if (changes.length > 0) {
                this.w.fire({ semanticTokensApplied: false, ranges: changes, });
            }
            return { changes: changes };
        }
        G() {
            const ranges = lineRange_1.$ts.joinMany([...this.y].map(([_, s]) => s.lineRanges));
            this.H(ranges);
        }
        H(ranges) {
            for (const range of ranges) {
                this.I(range.startLineNumber, range.endLineNumberExclusive - 1);
            }
        }
        I(startLineNumber, endLineNumber) {
            if (!this.f) {
                return;
            }
            startLineNumber = Math.max(1, Math.min(this.C.getLineCount(), startLineNumber));
            endLineNumber = Math.min(this.C.getLineCount(), endLineNumber);
            const builder = new contiguousMultilineTokensBuilder_1.$yC();
            const { heuristicTokens } = this.f.tokenizeHeuristically(builder, startLineNumber, endLineNumber);
            const changedTokens = this.F(builder.finalize());
            if (heuristicTokens) {
                // We overrode tokens with heuristically computed ones.
                // Because old states might get reused (thus stopping invalidation),
                // we have to explicitly request the tokens for the changed ranges again.
                for (const c of changedTokens.changes) {
                    this.h.value?.requestTokens(c.fromLineNumber, c.toLineNumber + 1);
                }
            }
            this.g?.checkFinished();
        }
        forceTokenization(lineNumber) {
            const builder = new contiguousMultilineTokensBuilder_1.$yC();
            this.f?.updateTokensUntilLine(builder, lineNumber);
            this.F(builder.finalize());
            this.g?.checkFinished();
        }
        isCheapToTokenize(lineNumber) {
            if (!this.f) {
                return true;
            }
            return this.f.isCheapToTokenize(lineNumber);
        }
        tokenizeIfCheap(lineNumber) {
            if (this.isCheapToTokenize(lineNumber)) {
                this.forceTokenization(lineNumber);
            }
        }
        getLineTokens(lineNumber) {
            const lineText = this.C.getLineContent(lineNumber);
            const result = this.j.getTokens(this.C.getLanguageId(), lineNumber - 1, lineText);
            if (this.m && this.n && this.f) {
                if (this.n.getFirstInvalidEndStateLineNumberOrMax() > lineNumber && this.f.store.getFirstInvalidEndStateLineNumberOrMax() > lineNumber) {
                    const backgroundResult = this.m.getTokens(this.C.getLanguageId(), lineNumber - 1, lineText);
                    if (!result.equals(backgroundResult) && this.r.value?.reportMismatchingTokens) {
                        this.r.value.reportMismatchingTokens(lineNumber);
                    }
                }
            }
            return result;
        }
        getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
            if (!this.f) {
                return 0 /* StandardTokenType.Other */;
            }
            const position = this.C.validatePosition(new position_1.$js(lineNumber, column));
            this.forceTokenization(position.lineNumber);
            return this.f.getTokenTypeIfInsertingCharacter(position, character);
        }
        tokenizeLineWithEdit(position, length, newText) {
            if (!this.f) {
                return null;
            }
            const validatedPosition = this.C.validatePosition(position);
            this.forceTokenization(validatedPosition.lineNumber);
            return this.f.tokenizeLineWithEdit(validatedPosition, length, newText);
        }
        get hasTokens() {
            return this.j.hasTokens;
        }
    }
    class AttachedViewHandler extends lifecycle_1.$kc {
        get lineRanges() { return this.h; }
        constructor(j) {
            super();
            this.j = j;
            this.f = this.B(new async_1.$Sg(() => this.m(), 50));
            this.g = [];
            this.h = [];
        }
        m() {
            if ((0, arrays_1.$sb)(this.g, this.h, (a, b) => a.equals(b))) {
                return;
            }
            this.g = this.h;
            this.j();
        }
        handleStateChange(state) {
            this.h = state.visibleLineRanges;
            if (state.stabilized) {
                this.f.cancel();
                this.m();
            }
            else {
                this.f.schedule();
            }
        }
    }
});
//# sourceMappingURL=tokenizationTextModelPart.js.map