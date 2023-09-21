/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder", "vs/editor/common/languages/modesRegistry", "vs/workbench/contrib/notebook/common/model/notebookCellOutputTextModel"], function (require, exports, event_1, hash_1, lifecycle_1, UUID, range_1, pieceTreeTextBuffer_1, pieceTreeTextBufferBuilder_1, modesRegistry_1, notebookCellOutputTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IH = exports.$HH = void 0;
    class $HH extends lifecycle_1.$kc {
        get outputs() {
            return this.n;
        }
        get metadata() {
            return this.s;
        }
        set metadata(newMetadata) {
            this.s = newMetadata;
            this.y = null;
            this.g.fire();
        }
        get internalMetadata() {
            return this.t;
        }
        set internalMetadata(newInternalMetadata) {
            const lastRunSuccessChanged = this.t.lastRunSuccess !== newInternalMetadata.lastRunSuccess;
            newInternalMetadata = {
                ...newInternalMetadata,
                ...{ runStartTimeAdjustment: computeRunStartTimeAdjustment(this.t, newInternalMetadata) }
            };
            this.t = newInternalMetadata;
            this.y = null;
            this.h.fire({ lastRunSuccessChanged });
        }
        get language() {
            return this.I;
        }
        set language(newLanguage) {
            if (this.F
                // 1. the language update is from workspace edit, checking if it's the same as text model's mode
                && this.F.getLanguageId() === this.L.getLanguageIdByLanguageName(newLanguage)
                // 2. the text model's mode might be the same as the `this.language`, even if the language friendly name is not the same, we should not trigger an update
                && this.F.getLanguageId() === this.L.getLanguageIdByLanguageName(this.language)) {
                return;
            }
            const newLanguageId = this.L.getLanguageIdByLanguageName(newLanguage);
            if (newLanguageId === null) {
                return;
            }
            if (this.F) {
                const languageId = this.L.createById(newLanguageId);
                this.F.setLanguage(languageId.languageId);
            }
            if (this.I === newLanguage) {
                return;
            }
            this.I = newLanguage;
            this.y = null;
            this.j.fire(newLanguage);
            this.f.fire('language');
        }
        get mime() {
            return this.J;
        }
        set mime(newMime) {
            if (this.J === newMime) {
                return;
            }
            this.J = newMime;
            this.y = null;
            this.f.fire('mime');
        }
        get textBuffer() {
            if (this.u) {
                return this.u;
            }
            const builder = new pieceTreeTextBufferBuilder_1.$tC();
            builder.acceptChunk(this.H);
            const bufferFactory = builder.finish(true);
            const { textBuffer, disposable } = bufferFactory.create(1 /* model.DefaultEndOfLine.LF */);
            this.u = textBuffer;
            this.B(disposable);
            this.B(this.u.onDidChangeContent(() => {
                this.y = null;
                if (!this.F) {
                    this.f.fire('content');
                }
            }));
            return this.u;
        }
        get alternativeId() {
            return this.C;
        }
        get textModel() {
            return this.F;
        }
        set textModel(m) {
            if (this.F === m) {
                return;
            }
            this.D.clear();
            this.F = m;
            if (this.F) {
                this.G(this.L, this.F.getLanguageId(), this.language);
                // Listen to language changes on the model
                this.D.add(this.F.onDidChangeLanguage((e) => this.G(this.L, e.newLanguage, this.language)));
                this.D.add(this.F.onWillDispose(() => this.textModel = undefined));
                this.D.add(this.F.onDidChangeContent(() => {
                    if (this.F) {
                        this.z = this.F.getVersionId();
                        this.C = this.F.getAlternativeVersionId();
                    }
                    this.f.fire('content');
                }));
                this.F._overwriteVersionId(this.z);
                this.F._overwriteAlternativeVersionId(this.z);
            }
        }
        G(languageService, newLanguage, currentLanguage) {
            // The language defined in the cell might not be supported in the editor so the text model might be using the default fallback
            // If so let's not modify the language
            const isFallBackLanguage = (newLanguage === modesRegistry_1.$Yt || newLanguage === 'jupyter');
            if (!languageService.isRegisteredLanguageId(currentLanguage) && isFallBackLanguage) {
                // notify to display warning, but don't change the language
                this.j.fire(currentLanguage);
            }
            else {
                this.language = newLanguage;
            }
        }
        constructor(uri, handle, H, I, J, cellKind, outputs, metadata, internalMetadata, collapseState, transientOptions, L) {
            super();
            this.uri = uri;
            this.handle = handle;
            this.H = H;
            this.I = I;
            this.J = J;
            this.cellKind = cellKind;
            this.collapseState = collapseState;
            this.transientOptions = transientOptions;
            this.L = L;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeOutputs = this.a.event;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeOutputItems = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeContent = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeMetadata = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidChangeInternalMetadata = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeLanguage = this.j.event;
            this.w = null;
            this.y = null;
            this.z = 1;
            this.C = 1;
            this.D = this.B(new lifecycle_1.$jc());
            this.F = undefined;
            this.n = outputs.map(op => new notebookCellOutputTextModel_1.$GH(op));
            this.s = metadata ?? {};
            this.t = internalMetadata ?? {};
        }
        resetTextBuffer(textBuffer) {
            this.u = textBuffer;
        }
        getValue() {
            const fullRange = this.getFullModelRange();
            const eol = this.textBuffer.getEOL();
            if (eol === '\n') {
                return this.textBuffer.getValueInRange(fullRange, 1 /* model.EndOfLinePreference.LF */);
            }
            else {
                return this.textBuffer.getValueInRange(fullRange, 2 /* model.EndOfLinePreference.CRLF */);
            }
        }
        getTextBufferHash() {
            if (this.w !== null) {
                return this.w;
            }
            const shaComputer = new hash_1.$vi();
            const snapshot = this.textBuffer.createSnapshot(false);
            let text;
            while ((text = snapshot.read())) {
                shaComputer.update(text);
            }
            this.w = shaComputer.digest();
            return this.w;
        }
        getHashValue() {
            if (this.y !== null) {
                return this.y;
            }
            this.y = (0, hash_1.$pi)([(0, hash_1.$pi)(this.language), this.getTextBufferHash(), this.M(), this.transientOptions.transientOutputs ? [] : this.n.map(op => ({
                    outputs: op.outputs.map(output => ({
                        mime: output.mime,
                        data: Array.from(output.data.buffer)
                    })),
                    metadata: op.metadata
                }))]);
            return this.y;
        }
        M() {
            const filteredMetadata = {};
            const transientCellMetadata = this.transientOptions.transientCellMetadata;
            const keys = new Set([...Object.keys(this.metadata)]);
            for (const key of keys) {
                if (!(transientCellMetadata[key])) {
                    filteredMetadata[key] = this.metadata[key];
                }
            }
            return filteredMetadata;
        }
        getTextLength() {
            return this.textBuffer.getLength();
        }
        getFullModelRange() {
            const lineCount = this.textBuffer.getLineCount();
            return new range_1.$ks(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
        }
        spliceNotebookCellOutputs(splice) {
            if (splice.deleteCount > 0 && splice.newOutputs.length > 0) {
                const commonLen = Math.min(splice.deleteCount, splice.newOutputs.length);
                // update
                for (let i = 0; i < commonLen; i++) {
                    const currentOutput = this.outputs[splice.start + i];
                    const newOutput = splice.newOutputs[i];
                    this.replaceOutput(currentOutput.outputId, newOutput);
                }
                this.outputs.splice(splice.start + commonLen, splice.deleteCount - commonLen, ...splice.newOutputs.slice(commonLen));
                this.a.fire({ start: splice.start + commonLen, deleteCount: splice.deleteCount - commonLen, newOutputs: splice.newOutputs.slice(commonLen) });
            }
            else {
                this.outputs.splice(splice.start, splice.deleteCount, ...splice.newOutputs);
                this.a.fire(splice);
            }
        }
        replaceOutput(outputId, newOutputItem) {
            const outputIndex = this.outputs.findIndex(output => output.outputId === outputId);
            if (outputIndex < 0) {
                return false;
            }
            const output = this.outputs[outputIndex];
            output.replaceData(newOutputItem);
            this.c.fire();
            return true;
        }
        changeOutputItems(outputId, append, items) {
            const outputIndex = this.outputs.findIndex(output => output.outputId === outputId);
            if (outputIndex < 0) {
                return false;
            }
            const output = this.outputs[outputIndex];
            if (append) {
                output.appendData(items);
            }
            else {
                output.replaceData({ outputId: outputId, outputs: items, metadata: output.metadata });
            }
            this.c.fire();
            return true;
        }
        N(left, right) {
            if (left.length !== right.length) {
                return false;
            }
            for (let i = 0; i < this.outputs.length; i++) {
                const l = left[i];
                const r = right[i];
                if (l.outputs.length !== r.outputs.length) {
                    return false;
                }
                for (let k = 0; k < l.outputs.length; k++) {
                    if (l.outputs[k].mime !== r.outputs[k].mime) {
                        return false;
                    }
                    if (l.outputs[k].data.byteLength !== r.outputs[k].data.byteLength) {
                        return false;
                    }
                }
            }
            return true;
        }
        equal(b) {
            if (this.language !== b.language) {
                return false;
            }
            if (this.getTextLength() !== b.getTextLength()) {
                return false;
            }
            if (!this.transientOptions.transientOutputs) {
                // compare outputs
                if (!this.N(this.outputs, b.outputs)) {
                    return false;
                }
            }
            return this.getHashValue() === b.getHashValue();
        }
        /**
         * Only compares
         * - language
         * - mime
         * - cellKind
         * - internal metadata
         * - source
         */
        fastEqual(b) {
            if (this.language !== b.language) {
                return false;
            }
            if (this.mime !== b.mime) {
                return false;
            }
            if (this.cellKind !== b.cellKind) {
                return false;
            }
            if (this.internalMetadata?.executionOrder !== b.internalMetadata?.executionOrder
                || this.internalMetadata?.lastRunSuccess !== b.internalMetadata?.lastRunSuccess
                || this.internalMetadata?.runStartTime !== b.internalMetadata?.runStartTime
                || this.internalMetadata?.runStartTimeAdjustment !== b.internalMetadata?.runStartTimeAdjustment
                || this.internalMetadata?.runEndTime !== b.internalMetadata?.runEndTime) {
                return false;
            }
            // Once we attach the cell text buffer to an editor, the source of truth is the text buffer instead of the original source
            if (this.u && this.getValue() !== b.source) {
                return false;
            }
            else if (this.H !== b.source) {
                return false;
            }
            return true;
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.n);
            // Manually release reference to previous text buffer to avoid large leaks
            // in case someone leaks a CellTextModel reference
            const emptyDisposedTextBuffer = new pieceTreeTextBuffer_1.$sC([], '', '\n', false, false, true, true);
            emptyDisposedTextBuffer.dispose();
            this.u = emptyDisposedTextBuffer;
            super.dispose();
        }
    }
    exports.$HH = $HH;
    function $IH(cell) {
        return {
            source: cell.getValue(),
            language: cell.language,
            mime: cell.mime,
            cellKind: cell.cellKind,
            outputs: cell.outputs.map(output => ({
                outputs: output.outputs,
                /* paste should generate new outputId */ outputId: UUID.$4f()
            })),
            metadata: {}
        };
    }
    exports.$IH = $IH;
    function computeRunStartTimeAdjustment(oldMetadata, newMetadata) {
        if (oldMetadata.runStartTime !== newMetadata.runStartTime && typeof newMetadata.runStartTime === 'number') {
            const offset = Date.now() - newMetadata.runStartTime;
            return offset < 0 ? Math.abs(offset) : 0;
        }
        else {
            return newMetadata.runStartTimeAdjustment;
        }
    }
});
//# sourceMappingURL=notebookCellTextModel.js.map