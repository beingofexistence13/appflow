/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/amdX", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/eolCounter", "vs/editor/common/core/lineRange", "vs/editor/common/core/range", "vs/editor/common/model/textModelTokens", "vs/editor/common/tokens/contiguousMultilineTokensBuilder", "vs/workbench/services/textMate/browser/arrayOperation"], function (require, exports, amdX_1, lifecycle_1, observable_1, eolCounter_1, lineRange_1, range_1, textModelTokens_1, contiguousMultilineTokensBuilder_1, arrayOperation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EBb = void 0;
    class $EBb extends lifecycle_1.$kc {
        static { this.a = 0; }
        constructor(r, u, w, y, z, C) {
            super();
            this.r = r;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.controllerId = $EBb.a++;
            this.f = [];
            /**
             * These states will eventually equal the worker states.
             * _states[i] stores the state at the end of line number i+1.
             */
            this.g = new textModelTokens_1.$CC();
            this.h = observableConfigValue('editor.experimental.asyncTokenizationLogging', false, this.z);
            this.B((0, observable_1.keepObserved)(this.h));
            this.B(this.r.onDidChangeContent((e) => {
                if (this.D) {
                    console.log('model change', {
                        fileName: this.r.uri.fsPath.split('\\').pop(),
                        changes: changesToString(e.changes),
                    });
                }
                this.u.acceptModelChanged(this.controllerId, e);
                this.f.push(e);
            }));
            this.B(this.r.onDidChangeLanguage((e) => {
                const languageId = this.r.getLanguageId();
                const encodedLanguageId = this.w.encodeLanguageId(languageId);
                this.u.acceptModelLanguageChanged(this.controllerId, languageId, encodedLanguageId);
            }));
            const languageId = this.r.getLanguageId();
            const encodedLanguageId = this.w.encodeLanguageId(languageId);
            this.u.acceptNewModel({
                uri: this.r.uri,
                versionId: this.r.getVersionId(),
                lines: this.r.getLinesContent(),
                EOL: this.r.getEOL(),
                languageId,
                encodedLanguageId,
                maxTokenizationLineLength: this.C.get(),
                controllerId: this.controllerId,
            });
            this.B((0, observable_1.autorun)(reader => {
                /** @description update maxTokenizationLineLength */
                const maxTokenizationLineLength = this.C.read(reader);
                this.u.acceptMaxTokenizationLineLength(this.controllerId, maxTokenizationLineLength);
            }));
        }
        dispose() {
            super.dispose();
            this.u.acceptRemovedModel(this.controllerId);
        }
        requestTokens(startLineNumber, endLineNumberExclusive) {
            this.u.retokenize(this.controllerId, startLineNumber, endLineNumberExclusive);
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
            let tokens = contiguousMultilineTokensBuilder_1.$yC.deserialize(new Uint8Array(rawTokens));
            if (this.D) {
                console.log('received background tokenization result', {
                    fileName: this.r.uri.fsPath.split('\\').pop(),
                    updatedTokenLines: tokens.map((t) => t.getLineRange()).join(' & '),
                    updatedStateLines: stateDeltas.map((s) => new lineRange_1.$ts(s.startLineNumber, s.startLineNumber + s.stateDeltas.length).toString()).join(' & '),
                });
            }
            if (this.D) {
                const changes = this.f.filter(c => c.versionId <= versionId).map(c => c.changes).map(c => changesToString(c)).join(' then ');
                console.log('Applying changes to local states', changes);
            }
            // Apply past changes to _states
            while (this.f.length > 0 &&
                this.f[0].versionId <= versionId) {
                const change = this.f.shift();
                this.g.acceptChanges(change.changes);
            }
            if (this.f.length > 0) {
                if (this.D) {
                    const changes = this.f.map(c => c.changes).map(c => changesToString(c)).join(' then ');
                    console.log('Considering non-processed changes', changes);
                }
                const curToFutureTransformerTokens = arrayOperation_1.$CBb.fromMany(this.f.map((c) => fullLineArrayEditFromModelContentChange(c.changes)));
                // Filter tokens in lines that got changed in the future to prevent flickering
                // These tokens are recomputed anyway.
                const b = new contiguousMultilineTokensBuilder_1.$yC();
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
                for (const change of this.f) {
                    for (const innerChanges of change.changes) {
                        for (let j = 0; j < tokens.length; j++) {
                            tokens[j].applyEdit(innerChanges.range, innerChanges.text);
                        }
                    }
                }
            }
            const curToFutureTransformerStates = arrayOperation_1.$CBb.fromMany(this.f.map((c) => fullLineArrayEditFromModelContentChange(c.changes)));
            if (!this.m || !this.n) {
                const { applyStateStackDiff, INITIAL } = await (0, amdX_1.$aD)('vscode-textmate', 'release/main.js');
                this.m = applyStateStackDiff;
                this.n = INITIAL;
            }
            // Apply state deltas to _states and _backgroundTokenizationStore
            for (const d of stateDeltas) {
                let prevState = d.startLineNumber <= 1 ? this.n : this.g.getEndState(d.startLineNumber - 1);
                for (let i = 0; i < d.stateDeltas.length; i++) {
                    const delta = d.stateDeltas[i];
                    let state;
                    if (delta) {
                        state = this.m(prevState, delta);
                        this.g.setEndState(d.startLineNumber + i, state);
                    }
                    else {
                        state = this.g.getEndState(d.startLineNumber + i);
                    }
                    const offset = curToFutureTransformerStates.transform(d.startLineNumber + i - 1);
                    if (offset !== undefined) {
                        // Only set the state if there is no future change in this line,
                        // as this might make consumers believe that the state/tokens are accurate
                        this.y.setEndState(offset + 1, state);
                    }
                    if (d.startLineNumber + i >= this.r.getLineCount() - 1) {
                        this.y.backgroundTokenizationFinished();
                    }
                    prevState = state;
                }
            }
            // First set states, then tokens, so that events fired from set tokens don't read invalid states
            this.y.setTokens(tokens);
        }
        get D() { return this.h.get(); }
    }
    exports.$EBb = $EBb;
    function fullLineArrayEditFromModelContentChange(c) {
        return new arrayOperation_1.$ABb(c.map((c) => new arrayOperation_1.$BBb(c.range.startLineNumber - 1, 
        // Expand the edit range to include the entire line
        c.range.endLineNumber - c.range.startLineNumber + 1, (0, eolCounter_1.$Ws)(c.text)[0] + 1)));
    }
    function changesToString(changes) {
        return changes.map(c => range_1.$ks.lift(c.range).toString() + ' => ' + c.text).join(' & ');
    }
    function observableConfigValue(key, defaultValue, configurationService) {
        return (0, observable_1.observableFromEvent)((handleChange) => configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(key)) {
                handleChange(e);
            }
        }), () => configurationService.getValue(key) ?? defaultValue);
    }
});
//# sourceMappingURL=textMateWorkerTokenizerController.js.map