/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/editor/common/encodedTokenAttributes", "vs/editor/common/languages"], function (require, exports, event_1, lifecycle_1, stopwatch_1, encodedTokenAttributes_1, languages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMateTokenizationSupport = void 0;
    class TextMateTokenizationSupport extends lifecycle_1.Disposable {
        constructor(_grammar, _initialState, _containsEmbeddedLanguages, _createBackgroundTokenizer, _backgroundTokenizerShouldOnlyVerifyTokens, _reportTokenizationTime, _reportSlowTokenization) {
            super();
            this._grammar = _grammar;
            this._initialState = _initialState;
            this._containsEmbeddedLanguages = _containsEmbeddedLanguages;
            this._createBackgroundTokenizer = _createBackgroundTokenizer;
            this._backgroundTokenizerShouldOnlyVerifyTokens = _backgroundTokenizerShouldOnlyVerifyTokens;
            this._reportTokenizationTime = _reportTokenizationTime;
            this._reportSlowTokenization = _reportSlowTokenization;
            this._seenLanguages = [];
            this._onDidEncounterLanguage = this._register(new event_1.Emitter());
            this.onDidEncounterLanguage = this._onDidEncounterLanguage.event;
        }
        get backgroundTokenizerShouldOnlyVerifyTokens() {
            return this._backgroundTokenizerShouldOnlyVerifyTokens();
        }
        getInitialState() {
            return this._initialState;
        }
        tokenize(line, hasEOL, state) {
            throw new Error('Not supported!');
        }
        createBackgroundTokenizer(textModel, store) {
            if (this._createBackgroundTokenizer) {
                return this._createBackgroundTokenizer(textModel, store);
            }
            return undefined;
        }
        tokenizeEncoded(line, hasEOL, state) {
            const isRandomSample = Math.random() * 10000 < 1;
            const shouldMeasure = this._reportSlowTokenization || isRandomSample;
            const sw = shouldMeasure ? new stopwatch_1.StopWatch(true) : undefined;
            const textMateResult = this._grammar.tokenizeLine2(line, state, 500);
            if (shouldMeasure) {
                const timeMS = sw.elapsed();
                if (isRandomSample || timeMS > 32) {
                    this._reportTokenizationTime(timeMS, line.length, isRandomSample);
                }
            }
            if (textMateResult.stoppedEarly) {
                console.warn(`Time limit reached when tokenizing line: ${line.substring(0, 100)}`);
                // return the state at the beginning of the line
                return new languages_1.EncodedTokenizationResult(textMateResult.tokens, state);
            }
            if (this._containsEmbeddedLanguages) {
                const seenLanguages = this._seenLanguages;
                const tokens = textMateResult.tokens;
                // Must check if any of the embedded languages was hit
                for (let i = 0, len = (tokens.length >>> 1); i < len; i++) {
                    const metadata = tokens[(i << 1) + 1];
                    const languageId = encodedTokenAttributes_1.TokenMetadata.getLanguageId(metadata);
                    if (!seenLanguages[languageId]) {
                        seenLanguages[languageId] = true;
                        this._onDidEncounterLanguage.fire(languageId);
                    }
                }
            }
            let endState;
            // try to save an object if possible
            if (state.equals(textMateResult.ruleStack)) {
                endState = state;
            }
            else {
                endState = textMateResult.ruleStack;
            }
            return new languages_1.EncodedTokenizationResult(textMateResult.tokens, endState);
        }
    }
    exports.TextMateTokenizationSupport = TextMateTokenizationSupport;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1hdGVUb2tlbml6YXRpb25TdXBwb3J0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RleHRNYXRlL2Jyb3dzZXIvdG9rZW5pemF0aW9uU3VwcG9ydC90ZXh0TWF0ZVRva2VuaXphdGlvblN1cHBvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsMkJBQTRCLFNBQVEsc0JBQVU7UUFLMUQsWUFDa0IsUUFBa0IsRUFDbEIsYUFBeUIsRUFDekIsMEJBQW1DLEVBQ25DLDBCQUErSSxFQUMvSSwwQ0FBeUQsRUFDekQsdUJBQThGLEVBQzlGLHVCQUFnQztZQUVqRCxLQUFLLEVBQUUsQ0FBQztZQVJTLGFBQVEsR0FBUixRQUFRLENBQVU7WUFDbEIsa0JBQWEsR0FBYixhQUFhLENBQVk7WUFDekIsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUFTO1lBQ25DLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBcUg7WUFDL0ksK0NBQTBDLEdBQTFDLDBDQUEwQyxDQUFlO1lBQ3pELDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBdUU7WUFDOUYsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFTO1lBWGpDLG1CQUFjLEdBQWMsRUFBRSxDQUFDO1lBQy9CLDRCQUF1QixHQUF3QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFjLENBQUMsQ0FBQztZQUMxRiwyQkFBc0IsR0FBc0IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztRQVkvRixDQUFDO1FBRUQsSUFBVyx5Q0FBeUM7WUFDbkQsT0FBTyxJQUFJLENBQUMsMENBQTBDLEVBQUUsQ0FBQztRQUMxRCxDQUFDO1FBRU0sZUFBZTtZQUNyQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVNLFFBQVEsQ0FBQyxJQUFZLEVBQUUsTUFBZSxF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