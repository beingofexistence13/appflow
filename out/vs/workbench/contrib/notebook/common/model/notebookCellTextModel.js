/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder", "vs/editor/common/languages/modesRegistry", "vs/workbench/contrib/notebook/common/model/notebookCellOutputTextModel"], function (require, exports, event_1, hash_1, lifecycle_1, UUID, range_1, pieceTreeTextBuffer_1, pieceTreeTextBufferBuilder_1, modesRegistry_1, notebookCellOutputTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cloneNotebookCellTextModel = exports.NotebookCellTextModel = void 0;
    class NotebookCellTextModel extends lifecycle_1.Disposable {
        get outputs() {
            return this._outputs;
        }
        get metadata() {
            return this._metadata;
        }
        set metadata(newMetadata) {
            this._metadata = newMetadata;
            this._hash = null;
            this._onDidChangeMetadata.fire();
        }
        get internalMetadata() {
            return this._internalMetadata;
        }
        set internalMetadata(newInternalMetadata) {
            const lastRunSuccessChanged = this._internalMetadata.lastRunSuccess !== newInternalMetadata.lastRunSuccess;
            newInternalMetadata = {
                ...newInternalMetadata,
                ...{ runStartTimeAdjustment: computeRunStartTimeAdjustment(this._internalMetadata, newInternalMetadata) }
            };
            this._internalMetadata = newInternalMetadata;
            this._hash = null;
            this._onDidChangeInternalMetadata.fire({ lastRunSuccessChanged });
        }
        get language() {
            return this._language;
        }
        set language(newLanguage) {
            if (this._textModel
                // 1. the language update is from workspace edit, checking if it's the same as text model's mode
                && this._textModel.getLanguageId() === this._languageService.getLanguageIdByLanguageName(newLanguage)
                // 2. the text model's mode might be the same as the `this.language`, even if the language friendly name is not the same, we should not trigger an update
                && this._textModel.getLanguageId() === this._languageService.getLanguageIdByLanguageName(this.language)) {
                return;
            }
            const newLanguageId = this._languageService.getLanguageIdByLanguageName(newLanguage);
            if (newLanguageId === null) {
                return;
            }
            if (this._textModel) {
                const languageId = this._languageService.createById(newLanguageId);
                this._textModel.setLanguage(languageId.languageId);
            }
            if (this._language === newLanguage) {
                return;
            }
            this._language = newLanguage;
            this._hash = null;
            this._onDidChangeLanguage.fire(newLanguage);
            this._onDidChangeContent.fire('language');
        }
        get mime() {
            return this._mime;
        }
        set mime(newMime) {
            if (this._mime === newMime) {
                return;
            }
            this._mime = newMime;
            this._hash = null;
            this._onDidChangeContent.fire('mime');
        }
        get textBuffer() {
            if (this._textBuffer) {
                return this._textBuffer;
            }
            const builder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
            builder.acceptChunk(this._source);
            const bufferFactory = builder.finish(true);
            const { textBuffer, disposable } = bufferFactory.create(1 /* model.DefaultEndOfLine.LF */);
            this._textBuffer = textBuffer;
            this._register(disposable);
            this._register(this._textBuffer.onDidChangeContent(() => {
                this._hash = null;
                if (!this._textModel) {
                    this._onDidChangeContent.fire('content');
                }
            }));
            return this._textBuffer;
        }
        get alternativeId() {
            return this._alternativeId;
        }
        get textModel() {
            return this._textModel;
        }
        set textModel(m) {
            if (this._textModel === m) {
                return;
            }
            this._textModelDisposables.clear();
            this._textModel = m;
            if (this._textModel) {
                this.setRegisteredLanguage(this._languageService, this._textModel.getLanguageId(), this.language);
                // Listen to language changes on the model
                this._textModelDisposables.add(this._textModel.onDidChangeLanguage((e) => this.setRegisteredLanguage(this._languageService, e.newLanguage, this.language)));
                this._textModelDisposables.add(this._textModel.onWillDispose(() => this.textModel = undefined));
                this._textModelDisposables.add(this._textModel.onDidChangeContent(() => {
                    if (this._textModel) {
                        this._versionId = this._textModel.getVersionId();
                        this._alternativeId = this._textModel.getAlternativeVersionId();
                    }
                    this._onDidChangeContent.fire('content');
                }));
                this._textModel._overwriteVersionId(this._versionId);
                this._textModel._overwriteAlternativeVersionId(this._versionId);
            }
        }
        setRegisteredLanguage(languageService, newLanguage, currentLanguage) {
            // The language defined in the cell might not be supported in the editor so the text model might be using the default fallback
            // If so let's not modify the language
            const isFallBackLanguage = (newLanguage === modesRegistry_1.PLAINTEXT_LANGUAGE_ID || newLanguage === 'jupyter');
            if (!languageService.isRegisteredLanguageId(currentLanguage) && isFallBackLanguage) {
                // notify to display warning, but don't change the language
                this._onDidChangeLanguage.fire(currentLanguage);
            }
            else {
                this.language = newLanguage;
            }
        }
        constructor(uri, handle, _source, _language, _mime, cellKind, outputs, metadata, internalMetadata, collapseState, transientOptions, _languageService) {
            super();
            this.uri = uri;
            this.handle = handle;
            this._source = _source;
            this._language = _language;
            this._mime = _mime;
            this.cellKind = cellKind;
            this.collapseState = collapseState;
            this.transientOptions = transientOptions;
            this._languageService = _languageService;
            this._onDidChangeOutputs = this._register(new event_1.Emitter());
            this.onDidChangeOutputs = this._onDidChangeOutputs.event;
            this._onDidChangeOutputItems = this._register(new event_1.Emitter());
            this.onDidChangeOutputItems = this._onDidChangeOutputItems.event;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onDidChangeMetadata = this._register(new event_1.Emitter());
            this.onDidChangeMetadata = this._onDidChangeMetadata.event;
            this._onDidChangeInternalMetadata = this._register(new event_1.Emitter());
            this.onDidChangeInternalMetadata = this._onDidChangeInternalMetadata.event;
            this._onDidChangeLanguage = this._register(new event_1.Emitter());
            this.onDidChangeLanguage = this._onDidChangeLanguage.event;
            this._textBufferHash = null;
            this._hash = null;
            this._versionId = 1;
            this._alternativeId = 1;
            this._textModelDisposables = this._register(new lifecycle_1.DisposableStore());
            this._textModel = undefined;
            this._outputs = outputs.map(op => new notebookCellOutputTextModel_1.NotebookCellOutputTextModel(op));
            this._metadata = metadata ?? {};
            this._internalMetadata = internalMetadata ?? {};
        }
        resetTextBuffer(textBuffer) {
            this._textBuffer = textBuffer;
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
            if (this._textBufferHash !== null) {
                return this._textBufferHash;
            }
            const shaComputer = new hash_1.StringSHA1();
            const snapshot = this.textBuffer.createSnapshot(false);
            let text;
            while ((text = snapshot.read())) {
                shaComputer.update(text);
            }
            this._textBufferHash = shaComputer.digest();
            return this._textBufferHash;
        }
        getHashValue() {
            if (this._hash !== null) {
                return this._hash;
            }
            this._hash = (0, hash_1.hash)([(0, hash_1.hash)(this.language), this.getTextBufferHash(), this._getPersisentMetadata(), this.transientOptions.transientOutputs ? [] : this._outputs.map(op => ({
                    outputs: op.outputs.map(output => ({
                        mime: output.mime,
                        data: Array.from(output.data.buffer)
                    })),
                    metadata: op.metadata
                }))]);
            return this._hash;
        }
        _getPersisentMetadata() {
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
            return new range_1.Range(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
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
                this._onDidChangeOutputs.fire({ start: splice.start + commonLen, deleteCount: splice.deleteCount - commonLen, newOutputs: splice.newOutputs.slice(commonLen) });
            }
            else {
                this.outputs.splice(splice.start, splice.deleteCount, ...splice.newOutputs);
                this._onDidChangeOutputs.fire(splice);
            }
        }
        replaceOutput(outputId, newOutputItem) {
            const outputIndex = this.outputs.findIndex(output => output.outputId === outputId);
            if (outputIndex < 0) {
                return false;
            }
            const output = this.outputs[outputIndex];
            output.replaceData(newOutputItem);
            this._onDidChangeOutputItems.fire();
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
            this._onDidChangeOutputItems.fire();
            return true;
        }
        _outputNotEqualFastCheck(left, right) {
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
                if (!this._outputNotEqualFastCheck(this.outputs, b.outputs)) {
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
            if (this._textBuffer && this.getValue() !== b.source) {
                return false;
            }
            else if (this._source !== b.source) {
                return false;
            }
            return true;
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._outputs);
            // Manually release reference to previous text buffer to avoid large leaks
            // in case someone leaks a CellTextModel reference
            const emptyDisposedTextBuffer = new pieceTreeTextBuffer_1.PieceTreeTextBuffer([], '', '\n', false, false, true, true);
            emptyDisposedTextBuffer.dispose();
            this._textBuffer = emptyDisposedTextBuffer;
            super.dispose();
        }
    }
    exports.NotebookCellTextModel = NotebookCellTextModel;
    function cloneNotebookCellTextModel(cell) {
        return {
            source: cell.getValue(),
            language: cell.language,
            mime: cell.mime,
            cellKind: cell.cellKind,
            outputs: cell.outputs.map(output => ({
                outputs: output.outputs,
                /* paste should generate new outputId */ outputId: UUID.generateUuid()
            })),
            metadata: {}
        };
    }
    exports.cloneNotebookCellTextModel = cloneNotebookCellTextModel;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDZWxsVGV4dE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svY29tbW9uL21vZGVsL25vdGVib29rQ2VsbFRleHRNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQmhHLE1BQWEscUJBQXNCLFNBQVEsc0JBQVU7UUFxQnBELElBQUksT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBSUQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxJQUFJLFFBQVEsQ0FBQyxXQUFpQztZQUM3QyxJQUFJLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQztZQUM3QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEMsQ0FBQztRQUlELElBQUksZ0JBQWdCO1lBQ25CLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFJLGdCQUFnQixDQUFDLG1CQUFpRDtZQUNyRSxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEtBQUssbUJBQW1CLENBQUMsY0FBYyxDQUFDO1lBQzNHLG1CQUFtQixHQUFHO2dCQUNyQixHQUFHLG1CQUFtQjtnQkFDdEIsR0FBRyxFQUFFLHNCQUFzQixFQUFFLDZCQUE2QixDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFO2FBQ3pHLENBQUM7WUFDRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsbUJBQW1CLENBQUM7WUFDN0MsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLDRC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