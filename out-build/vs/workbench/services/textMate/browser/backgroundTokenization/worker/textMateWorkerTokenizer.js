/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/amdX", "vs/base/common/async", "vs/base/common/observable", "vs/base/common/platform", "vs/editor/common/core/lineRange", "vs/editor/common/model/mirrorTextModel", "vs/editor/common/model/textModelTokens", "vs/editor/common/tokens/contiguousMultilineTokensBuilder", "vs/editor/common/tokens/lineTokens", "vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport", "vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit"], function (require, exports, amdX_1, async_1, observable_1, platform_1, lineRange_1, mirrorTextModel_1, textModelTokens_1, contiguousMultilineTokensBuilder_1, lineTokens_1, textMateTokenizationSupport_1, tokenizationSupportWithLineLimit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xBb = void 0;
    class $xBb extends mirrorTextModel_1.$Mu {
        constructor(uri, lines, eol, versionId, s, t, u, maxTokenizationLineLength) {
            super(uri, lines, eol, versionId);
            this.s = s;
            this.t = t;
            this.u = u;
            this.a = null;
            this.b = false;
            this.c = (0, observable_1.observableValue)(this, -1);
            this.q = new async_1.$Sg(() => this.w(), 10);
            this.c.set(maxTokenizationLineLength, undefined);
            this.v();
        }
        dispose() {
            this.b = true;
            super.dispose();
        }
        onLanguageId(languageId, encodedLanguageId) {
            this.t = languageId;
            this.u = encodedLanguageId;
            this.v();
        }
        onEvents(e) {
            super.onEvents(e);
            this.a?.store.acceptChanges(e.changes);
            this.q.schedule();
        }
        acceptMaxTokenizationLineLength(maxTokenizationLineLength) {
            this.c.set(maxTokenizationLineLength, undefined);
        }
        retokenize(startLineNumber, endLineNumberExclusive) {
            if (this.a) {
                this.a.store.invalidateEndStateRange(new lineRange_1.$ts(startLineNumber, endLineNumberExclusive));
                this.q.schedule();
            }
        }
        async v() {
            this.a = null;
            const languageId = this.t;
            const encodedLanguageId = this.u;
            const r = await this.s.getOrCreateGrammar(languageId, encodedLanguageId);
            if (this.b || languageId !== this.t || encodedLanguageId !== this.u || !r) {
                return;
            }
            if (r.grammar) {
                const tokenizationSupport = new tokenizationSupportWithLineLimit_1.$sBb(this.u, new textMateTokenizationSupport_1.$rBb(r.grammar, r.initialState, false, undefined, () => false, (timeMs, lineLength, isRandomSample) => {
                    this.s.reportTokenizationTime(timeMs, languageId, r.sourceExtensionId, lineLength, isRandomSample);
                }, false), this.c);
                this.a = new textModelTokens_1.$zC(this.f.length, tokenizationSupport);
            }
            else {
                this.a = null;
            }
            this.w();
        }
        async w() {
            if (this.b || !this.a) {
                return;
            }
            if (!this.m) {
                const { diffStateStacksRefEq } = await (0, amdX_1.$aD)('vscode-textmate', 'release/main.js');
                this.m = diffStateStacksRefEq;
            }
            const startTime = new Date().getTime();
            while (true) {
                let tokenizedLines = 0;
                const tokenBuilder = new contiguousMultilineTokensBuilder_1.$yC();
                const stateDeltaBuilder = new StateDeltaBuilder();
                while (true) {
                    const lineToTokenize = this.a.getFirstInvalidLine();
                    if (lineToTokenize === null || tokenizedLines > 200) {
                        break;
                    }
                    tokenizedLines++;
                    const text = this.f[lineToTokenize.lineNumber - 1];
                    const r = this.a.tokenizationSupport.tokenizeEncoded(text, true, lineToTokenize.startState);
                    if (this.a.store.setEndState(lineToTokenize.lineNumber, r.endState)) {
                        const delta = this.m(lineToTokenize.startState, r.endState);
                        stateDeltaBuilder.setState(lineToTokenize.lineNumber, delta);
                    }
                    else {
                        stateDeltaBuilder.setState(lineToTokenize.lineNumber, null);
                    }
                    lineTokens_1.$Xs.convertToEndOffset(r.tokens, text.length);
                    tokenBuilder.add(lineToTokenize.lineNumber, r.tokens);
                    const deltaMs = new Date().getTime() - startTime;
                    if (deltaMs > 20) {
                        // yield to check for changes
                        break;
                    }
                }
                if (tokenizedLines === 0) {
                    break;
                }
                const stateDeltas = stateDeltaBuilder.getStateDeltas();
                this.s.setTokensAndStates(this.h, tokenBuilder.serialize(), stateDeltas);
                const deltaMs = new Date().getTime() - startTime;
                if (deltaMs > 20) {
                    // yield to check for changes
                    (0, platform_1.$A)(() => this.w());
                    return;
                }
            }
        }
    }
    exports.$xBb = $xBb;
    class StateDeltaBuilder {
        constructor() {
            this.a = -1;
            this.b = [];
        }
        setState(lineNumber, stackDiff) {
            if (lineNumber === this.a + 1) {
                this.b[this.b.length - 1].stateDeltas.push(stackDiff);
            }
            else {
                this.b.push({ startLineNumber: lineNumber, stateDeltas: [stackDiff] });
            }
            this.a = lineNumber;
        }
        getStateDeltas() {
            return this.b;
        }
    }
});
//# sourceMappingURL=textMateWorkerTokenizer.js.map