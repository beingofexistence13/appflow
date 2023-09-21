/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/amdX", "vs/base/common/async", "vs/base/common/observable", "vs/base/common/platform", "vs/editor/common/core/lineRange", "vs/editor/common/model/mirrorTextModel", "vs/editor/common/model/textModelTokens", "vs/editor/common/tokens/contiguousMultilineTokensBuilder", "vs/editor/common/tokens/lineTokens", "vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport", "vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit"], function (require, exports, amdX_1, async_1, observable_1, platform_1, lineRange_1, mirrorTextModel_1, textModelTokens_1, contiguousMultilineTokensBuilder_1, lineTokens_1, textMateTokenizationSupport_1, tokenizationSupportWithLineLimit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMateWorkerTokenizer = void 0;
    class TextMateWorkerTokenizer extends mirrorTextModel_1.MirrorTextModel {
        constructor(uri, lines, eol, versionId, _host, _languageId, _encodedLanguageId, maxTokenizationLineLength) {
            super(uri, lines, eol, versionId);
            this._host = _host;
            this._languageId = _languageId;
            this._encodedLanguageId = _encodedLanguageId;
            this._tokenizerWithStateStore = null;
            this._isDisposed = false;
            this._maxTokenizationLineLength = (0, observable_1.observableValue)(this, -1);
            this._tokenizeDebouncer = new async_1.RunOnceScheduler(() => this._tokenize(), 10);
            this._maxTokenizationLineLength.set(maxTokenizationLineLength, undefined);
            this._resetTokenization();
        }
        dispose() {
            this._isDisposed = true;
            super.dispose();
        }
        onLanguageId(languageId, encodedLanguageId) {
            this._languageId = languageId;
            this._encodedLanguageId = encodedLanguageId;
            this._resetTokenization();
        }
        onEvents(e) {
            super.onEvents(e);
            this._tokenizerWithStateStore?.store.acceptChanges(e.changes);
            this._tokenizeDebouncer.schedule();
        }
        acceptMaxTokenizationLineLength(maxTokenizationLineLength) {
            this._maxTokenizationLineLength.set(maxTokenizationLineLength, undefined);
        }
        retokenize(startLineNumber, endLineNumberExclusive) {
            if (this._tokenizerWithStateStore) {
                this._tokenizerWithStateStore.store.invalidateEndStateRange(new lineRange_1.LineRange(startLineNumber, endLineNumberExclusive));
                this._tokenizeDebouncer.schedule();
            }
        }
        async _resetTokenization() {
            this._tokenizerWithStateStore = null;
            const languageId = this._languageId;
            const encodedLanguageId = this._encodedLanguageId;
            const r = await this._host.getOrCreateGrammar(languageId, encodedLanguageId);
            if (this._isDisposed || languageId !== this._languageId || encodedLanguageId !== this._encodedLanguageId || !r) {
                return;
            }
            if (r.grammar) {
                const tokenizationSupport = new tokenizationSupportWithLineLimit_1.TokenizationSupportWithLineLimit(this._encodedLanguageId, new textMateTokenizationSupport_1.TextMateTokenizationSupport(r.grammar, r.initialState, false, undefined, () => false, (timeMs, lineLength, isRandomSample) => {
                    this._host.reportTokenizationTime(timeMs, languageId, r.sourceExtensionId, lineLength, isRandomSample);
                }, false), this._maxTokenizationLineLength);
                this._tokenizerWithStateStore = new textModelTokens_1.TokenizerWithStateStore(this._lines.length, tokenizationSupport);
            }
            else {
                this._tokenizerWithStateStore = null;
            }
            this._tokenize();
        }
        async _tokenize() {
            if (this._isDisposed || !this._tokenizerWithStateStore) {
                return;
            }
            if (!this._diffStateStacksRefEqFn) {
                const { diffStateStacksRefEq } = await (0, amdX_1.importAMDNodeModule)('vscode-textmate', 'release/main.js');
                this._diffStateStacksRefEqFn = diffStateStacksRefEq;
            }
            const startTime = new Date().getTime();
            while (true) {
                let tokenizedLines = 0;
                const tokenBuilder = new contiguousMultilineTokensBuilder_1.ContiguousMultilineTokensBuilder();
                const stateDeltaBuilder = new StateDeltaBuilder();
                while (true) {
                    const lineToTokenize = this._tokenizerWithStateStore.getFirstInvalidLine();
                    if (lineToTokenize === null || tokenizedLines > 200) {
                        break;
                    }
                    tokenizedLines++;
                    const text = this._lines[lineToTokenize.lineNumber - 1];
                    const r = this._tokenizerWithStateStore.tokenizationSupport.tokenizeEncoded(text, true, lineToTokenize.startState);
                    if (this._tokenizerWithStateStore.store.setEndState(lineToTokenize.lineNumber, r.endState)) {
                        const delta = this._diffStateStacksRefEqFn(lineToTokenize.startState, r.endState);
                        stateDeltaBuilder.setState(lineToTokenize.lineNumber, delta);
                    }
                    else {
                        stateDeltaBuilder.setState(lineToTokenize.lineNumber, null);
                    }
                    lineTokens_1.LineTokens.convertToEndOffset(r.tokens, text.length);
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
                this._host.setTokensAndStates(this._versionId, tokenBuilder.serialize(), stateDeltas);
                const deltaMs = new Date().getTime() - startTime;
                if (deltaMs > 20) {
                    // yield to check for changes
                    (0, platform_1.setTimeout0)(() => this._tokenize());
                    return;
                }
            }
        }
    }
    exports.TextMateWorkerTokenizer = TextMateWorkerTokenizer;
    class StateDeltaBuilder {
        constructor() {
            this._lastStartLineNumber = -1;
            this._stateDeltas = [];
        }
        setState(lineNumber, stackDiff) {
            if (lineNumber === this._lastStartLineNumber + 1) {
                this._stateDeltas[this._stateDeltas.length - 1].stateDeltas.push(stackDiff);
            }
            else {
                this._stateDeltas.push({ startLineNumber: lineNumber, stateDeltas: [stackDiff] });
            }
            this._lastStartLineNumber = lineNumber;
        }
        getStateDeltas() {
            return this._stateDeltas;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1hdGVXb3JrZXJUb2tlbml6ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dE1hdGUvYnJvd3Nlci9iYWNrZ3JvdW5kVG9rZW5pemF0aW9uL3dvcmtlci90ZXh0TWF0ZVdvcmtlclRva2VuaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF5QmhHLE1BQWEsdUJBQXdCLFNBQVEsaUNBQWU7UUFPM0QsWUFDQyxHQUFRLEVBQ1IsS0FBZSxFQUNmLEdBQVcsRUFDWCxTQUFpQixFQUNBLEtBQWlDLEVBQzFDLFdBQW1CLEVBQ25CLGtCQUE4QixFQUN0Qyx5QkFBaUM7WUFFakMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBTGpCLFVBQUssR0FBTCxLQUFLLENBQTRCO1lBQzFDLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQ25CLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBWTtZQWIvQiw2QkFBd0IsR0FBK0MsSUFBSSxDQUFDO1lBQzVFLGdCQUFXLEdBQVksS0FBSyxDQUFDO1lBQ3BCLCtCQUEwQixHQUFHLElBQUEsNEJBQWUsRUFBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV2RCx1QkFBa0IsR0FBRyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQWF0RixJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFZSxPQUFPO1lBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLEtBQUssQ0FBQyxP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