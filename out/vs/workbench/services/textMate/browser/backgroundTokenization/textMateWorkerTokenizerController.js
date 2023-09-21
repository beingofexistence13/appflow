/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/amdX", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/eolCounter", "vs/editor/common/core/lineRange", "vs/editor/common/core/range", "vs/editor/common/model/textModelTokens", "vs/editor/common/tokens/contiguousMultilineTokensBuilder", "vs/workbench/services/textMate/browser/arrayOperation"], function (require, exports, amdX_1, lifecycle_1, observable_1, eolCounter_1, lineRange_1, range_1, textModelTokens_1, contiguousMultilineTokensBuilder_1, arrayOperation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMateWorkerTokenizerController = void 0;
    class TextMateWorkerTokenizerController extends lifecycle_1.Disposable {
        static { this._id = 0; }
        constructor(_model, _worker, _languageIdCodec, _backgroundTokenizationStore, _configurationService, _maxTokenizationLineLength) {
            super();
            this._model = _model;
            this._worker = _worker;
            this._languageIdCodec = _languageIdCodec;
            this._backgroundTokenizationStore = _backgroundTokenizationStore;
            this._configurationService = _configurationService;
            this._maxTokenizationLineLength = _maxTokenizationLineLength;
            this.controllerId = TextMateWorkerTokenizerController._id++;
            this._pendingChanges = [];
            /**
             * These states will eventually equal the worker states.
             * _states[i] stores the state at the end of line number i+1.
             */
            this._states = new textModelTokens_1.TokenizationStateStore();
            this._loggingEnabled = observableConfigValue('editor.experimental.asyncTokenizationLogging', false, this._configurationService);
            this._register((0, observable_1.keepObserved)(this._loggingEnabled));
            this._register(this._model.onDidChangeContent((e) => {
                if (this._shouldLog) {
                    console.log('model change', {
                        fileName: this._model.uri.fsPath.split('\\').pop(),
                        changes: changesToString(e.changes),
                    });
                }
                this._worker.acceptModelChanged(this.controllerId, e);
                this._pendingChanges.push(e);
            }));
            this._register(this._model.onDidChangeLanguage((e) => {
                const languageId = this._model.getLanguageId();
                const encodedLanguageId = this._languageIdCodec.encodeLanguageId(languageId);
                this._worker.acceptModelLanguageChanged(this.controllerId, languageId, encodedLanguageId);
            }));
            const languageId = this._model.getLanguageId();
            const encodedLanguageId = this._languageIdCodec.encodeLanguageId(languageId);
            this._worker.acceptNewModel({
                uri: this._model.uri,
                versionId: this._model.getVersionId(),
                lines: this._model.getLinesContent(),
                EOL: this._model.getEOL(),
                languageId,
                encodedLanguageId,
                maxTokenizationLineLength: this._maxTokenizationLineLength.get(),
                controllerId: this.controllerId,
            });
            this._register((0, observable_1.autorun)(reader => {
                /** @description update maxTokenizationLineLength */
                const maxTokenizationLineLength = this._maxTokenizationLineLength.read(reader);
                this._worker.acceptMaxTokenizationLineLength(this.controllerId, maxTokenizationLineLength);
            }));
        }
        dispose() {
            super.dispose();
            this._worker.acceptRemovedModel(this.controllerId);
        }
        requestTokens(startLineNumber, endLineNumberExclusive) {
            this._worker.retokenize(this.controllerId, startLineNumber, endLineNumberExclusive);
        }
        /**
         * This method is called from the worker through the worker host.
         */
        async setTokensAndStates(controllerId, versionId, rawTokens, stateDeltas) {
            if (this.controllerId !== controllerId) {
                // This event is for an outdated controller (the worker didn't receive the delete/create messages yet), ignore the event.
                return;
            }
            // _states state, change{k}, ..., change{versionId}, state delta base & rawTokens, change{j}, ..., change{m}, current renderer state
            //                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^                                ^^^^^^^^^^^^^^^^^^^^^^^^^
            //                | past changes                                                   | future states
            let tokens = contiguousMultilineTokensBuilder_1.ContiguousMultilineTokensBuilder.deserialize(new Uint8Array(rawTokens));
            if (this._shouldLog) {
                console.log('received background tokenization result', {
                    fileName: this._model.uri.fsPath.split('\\').pop(),
                    updatedTokenLines: tokens.map((t) => t.getLineRange()).join(' & '),
                    updatedStateLines: stateDeltas.map((s) => new lineRange_1.LineRange(s.startLineNumber, s.startLineNumber + s.stateDeltas.length).toString()).join(' & '),
                });
            }
            if (this._shouldLog) {
                const changes = this._pendingChanges.filter(c => c.versionId <= versionId).map(c => c.changes).map(c => changesToString(c)).join(' then ');
                console.log('Applying changes to local states', changes);
            }
            // Apply past changes to _states
            while (this._pendingChanges.length > 0 &&
                this._pendingChanges[0].versionId <= versionId) {
                const change = this._pendingChanges.shift();
                this._states.acceptChanges(change.changes);
            }
            if (this._pendingChanges.length > 0) {
                if (this._shouldLog) {
                    const changes = this._pendingChanges.map(c => c.changes).map(c => changesToString(c)).join(' then ');
                    console.log('Considering non-processed changes', changes);
                }
                const curToFutureTransformerTokens = arrayOperation_1.MonotonousIndexTransformer.fromMany(this._pendingChanges.map((c) => fullLineArrayEditFromModelContentChange(c.changes)));
                // Filter tokens in lines that got changed in the future to prevent flickering
                // These tokens are recomputed anyway.
                const b = new contiguousMultilineTokensBuilder_1.ContiguousMultilineTokensBuilder();
                for (const t of tokens) {
                    for (let i = t.startLineNumber; i <= t.endLineNumber; i++) {
                        const result = curToFutureTransformerTokens.transform(i - 1);
                        // If result is undefined, the current line got touched by an edit.
                        // The webworker will send us new tokens for all the new/touched lines after it received the edits.
                        if (result !== undefined) {
                            b.add(i, t.getLineTokens(i));
                        }
                    }
                }
                tokens = b.finalize();
                // Apply future changes to tokens
                for (const change of this._pendingChanges) {
                    for (const innerChanges of change.changes) {
                        for (let j = 0; j < tokens.length; j++) {
                            tokens[j].applyEdit(innerChanges.range, innerChanges.text);
                        }
                    }
                }
            }
            const curToFutureTransformerStates = arrayOperation_1.MonotonousIndexTransformer.fromMany(this._pendingChanges.map((c) => fullLineArrayEditFromModelContentChange(c.changes)));
            if (!this._applyStateStackDiffFn || !this._initialState) {
                const { applyStateStackDiff, INITIAL } = await (0, amdX_1.importAMDNodeModule)('vscode-textmate', 'release/main.js');
                this._applyStateStackDiffFn = applyStateStackDiff;
                this._initialState = INITIAL;
            }
            // Apply state deltas to _states and _backgroundTokenizationStore
            for (const d of stateDeltas) {
                let prevState = d.startLineNumber <= 1 ? this._initialState : this._states.getEndState(d.startLineNumber - 1);
                for (let i = 0; i < d.stateDeltas.length; i++) {
                    const delta = d.stateDeltas[i];
                    let state;
                    if (delta) {
                        state = this._applyStateStackDiffFn(prevState, delta);
                        this._states.setEndState(d.startLineNumber + i, state);
                    }
                    else {
                        state = this._states.getEndState(d.startLineNumber + i);
                    }
                    const offset = curToFutureTransformerStates.transform(d.startLineNumber + i - 1);
                    if (offset !== undefined) {
                        // Only set the state if there is no future change in this line,
                        // as this might make consumers believe that the state/tokens are accurate
                        this._backgroundTokenizationStore.setEndState(offset + 1, state);
                    }
                    if (d.startLineNumber + i >= this._model.getLineCount() - 1) {
                        this._backgroundTokenizationStore.backgroundTokenizationFinished();
                    }
                    prevState = state;
                }
            }
            // First set states, then tokens, so that events fired from set tokens don't read invalid states
            this._backgroundTokenizationStore.setTokens(tokens);
        }
        get _shouldLog() { return this._loggingEnabled.get(); }
    }
    exports.TextMateWorkerTokenizerController = TextMateWorkerTokenizerController;
    function fullLineArrayEditFromModelContentChange(c) {
        return new arrayOperation_1.ArrayEdit(c.map((c) => new arrayOperation_1.SingleArrayEdit(c.range.startLineNumber - 1, 
        // Expand the edit range to include the entire line
        c.range.endLineNumber - c.range.startLineNumber + 1, (0, eolCounter_1.countEOL)(c.text)[0] + 1)));
    }
    function changesToString(changes) {
        return changes.map(c => range_1.Range.lift(c.range).toString() + ' => ' + c.text).join(' & ');
    }
    function observableConfigValue(key, defaultValue, configurationService) {
        return (0, observable_1.observableFromEvent)((handleChange) => configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(key)) {
                handleChange(e);
            }
        }), () => configurationService.getValue(key) ?? defaultValue);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1hdGVXb3JrZXJUb2tlbml6ZXJDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RleHRNYXRlL2Jyb3dzZXIvYmFja2dyb3VuZFRva2VuaXphdGlvbi90ZXh0TWF0ZVdvcmtlclRva2VuaXplckNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxNQUFhLGlDQUFrQyxTQUFRLHNCQUFVO2lCQUNqRCxRQUFHLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFnQnZCLFlBQ2tCLE1BQWtCLEVBQ2xCLE9BQW1DLEVBQ25DLGdCQUFrQyxFQUNsQyw0QkFBMEQsRUFDMUQscUJBQTRDLEVBQzVDLDBCQUErQztZQUVoRSxLQUFLLEVBQUUsQ0FBQztZQVBTLFdBQU0sR0FBTixNQUFNLENBQVk7WUFDbEIsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7WUFDbkMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNsQyxpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQThCO1lBQzFELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDNUMsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUFxQjtZQXBCakQsaUJBQVksR0FBRyxpQ0FBaUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN0RCxvQkFBZSxHQUFnQyxFQUFFLENBQUM7WUFFbkU7OztlQUdHO1lBQ2MsWUFBTyxHQUFHLElBQUksd0NBQXNCLEVBQWMsQ0FBQztZQUVuRCxvQkFBZSxHQUFHLHFCQUFxQixDQUFDLDhDQUE4QyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQWUzSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEseUJBQVksRUFBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUVuRCxJQUFJLENBQUMsU0FBUyxD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