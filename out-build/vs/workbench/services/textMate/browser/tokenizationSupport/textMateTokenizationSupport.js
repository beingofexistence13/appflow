/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/editor/common/encodedTokenAttributes", "vs/editor/common/languages"], function (require, exports, event_1, lifecycle_1, stopwatch_1, encodedTokenAttributes_1, languages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rBb = void 0;
    class $rBb extends lifecycle_1.$kc {
        constructor(c, f, g, h, j, m, n) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.a = [];
            this.b = this.B(new event_1.$fd());
            this.onDidEncounterLanguage = this.b.event;
        }
        get backgroundTokenizerShouldOnlyVerifyTokens() {
            return this.j();
        }
        getInitialState() {
            return this.f;
        }
        tokenize(line, hasEOL, state) {
            throw new Error('Not supported!');
        }
        createBackgroundTokenizer(textModel, store) {
            if (this.h) {
                return this.h(textModel, store);
            }
            return undefined;
        }
        tokenizeEncoded(line, hasEOL, state) {
            const isRandomSample = Math.random() * 10000 < 1;
            const shouldMeasure = this.n || isRandomSample;
            const sw = shouldMeasure ? new stopwatch_1.$bd(true) : undefined;
            const textMateResult = this.c.tokenizeLine2(line, state, 500);
            if (shouldMeasure) {
                const timeMS = sw.elapsed();
                if (isRandomSample || timeMS > 32) {
                    this.m(timeMS, line.length, isRandomSample);
                }
            }
            if (textMateResult.stoppedEarly) {
                console.warn(`Time limit reached when tokenizing line: ${line.substring(0, 100)}`);
                // return the state at the beginning of the line
                return new languages_1.$6s(textMateResult.tokens, state);
            }
            if (this.g) {
                const seenLanguages = this.a;
                const tokens = textMateResult.tokens;
                // Must check if any of the embedded languages was hit
                for (let i = 0, len = (tokens.length >>> 1); i < len; i++) {
                    const metadata = tokens[(i << 1) + 1];
                    const languageId = encodedTokenAttributes_1.$Us.getLanguageId(metadata);
                    if (!seenLanguages[languageId]) {
                        seenLanguages[languageId] = true;
                        this.b.fire(languageId);
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
            return new languages_1.$6s(textMateResult.tokens, endState);
        }
    }
    exports.$rBb = $rBb;
});
//# sourceMappingURL=textMateTokenizationSupport.js.map