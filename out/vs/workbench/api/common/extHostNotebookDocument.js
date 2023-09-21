/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, network_1, uri_1, extHostTypeConverters, extHostTypes_1, notebookCommon) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookDocument = exports.ExtHostCell = void 0;
    class RawContentChangeEvent {
        constructor(start, deletedCount, deletedItems, items) {
            this.start = start;
            this.deletedCount = deletedCount;
            this.deletedItems = deletedItems;
            this.items = items;
        }
        asApiEvent() {
            return {
                range: new extHostTypes_1.NotebookRange(this.start, this.start + this.deletedCount),
                addedCells: this.items.map(cell => cell.apiCell),
                removedCells: this.deletedItems,
            };
        }
    }
    class ExtHostCell {
        static asModelAddData(notebook, cell) {
            return {
                EOL: cell.eol,
                lines: cell.source,
                languageId: cell.language,
                uri: cell.uri,
                isDirty: false,
                versionId: 1,
                notebook
            };
        }
        constructor(notebook, _extHostDocument, _cellData) {
            this.notebook = notebook;
            this._extHostDocument = _extHostDocument;
            this._cellData = _cellData;
            this.handle = _cellData.handle;
            this.uri = uri_1.URI.revive(_cellData.uri);
            this.cellKind = _cellData.cellKind;
            this._outputs = _cellData.outputs.map(extHostTypeConverters.NotebookCellOutput.to);
            this._internalMetadata = _cellData.internalMetadata ?? {};
            this._metadata = Object.freeze(_cellData.metadata ?? {});
            this._previousResult = Object.freeze(extHostTypeConverters.NotebookCellExecutionSummary.to(_cellData.internalMetadata ?? {}));
        }
        get internalMetadata() {
            return this._internalMetadata;
        }
        get apiCell() {
            if (!this._apiCell) {
                const that = this;
                const data = this._extHostDocument.getDocument(this.uri);
                if (!data) {
                    throw new Error(`MISSING extHostDocument for notebook cell: ${this.uri}`);
                }
                const apiCell = {
                    get index() { return that.notebook.getCellIndex(that); },
                    notebook: that.notebook.apiNotebook,
                    kind: extHostTypeConverters.NotebookCellKind.to(this._cellData.cellKind),
                    document: data.document,
                    get mime() { return that._mime; },
                    set mime(value) { that._mime = value; },
                    get outputs() { return that._outputs.slice(0); },
                    get metadata() { return that._metadata; },
                    get executionSummary() { return that._previousResult; }
                };
                this._apiCell = Object.freeze(apiCell);
            }
            return this._apiCell;
        }
        setOutputs(newOutputs) {
            this._outputs = newOutputs.map(extHostTypeConverters.NotebookCellOutput.to);
        }
        setOutputItems(outputId, append, newOutputItems) {
            const newItems = newOutputItems.map(extHostTypeConverters.NotebookCellOutputItem.to);
            const output = this._outputs.find(op => op.id === outputId);
            if (output) {
                if (!append) {
                    output.items.length = 0;
                }
                output.items.push(...newItems);
                if (output.items.length > 1 && output.items.every(item => notebookCommon.isTextStreamMime(item.mime))) {
                    // Look for the mimes in the items, and keep track of their order.
                    // Merge the streams into one output item, per mime type.
                    const mimeOutputs = new Map();
                    const mimeTypes = [];
                    output.items.forEach(item => {
                        let items;
                        if (mimeOutputs.has(item.mime)) {
                            items = mimeOutputs.get(item.mime);
                        }
                        else {
                            items = [];
                            mimeOutputs.set(item.mime, items);
                            mimeTypes.push(item.mime);
                        }
                        items.push(item.data);
                    });
                    output.items.length = 0;
                    mimeTypes.forEach(mime => {
                        const compressed = notebookCommon.compressOutputItemStreams(mimeOutputs.get(mime));
                        output.items.push({
                            mime,
                            data: compressed.data.buffer
                        });
                    });
                }
            }
        }
        setMetadata(newMetadata) {
            this._metadata = Object.freeze(newMetadata);
        }
        setInternalMetadata(newInternalMetadata) {
            this._internalMetadata = newInternalMetadata;
            this._previousResult = Object.freeze(extHostTypeConverters.NotebookCellExecutionSummary.to(newInternalMetadata));
        }
        setMime(newMime) {
        }
    }
    exports.ExtHostCell = ExtHostCell;
    class ExtHostNotebookDocument {
        static { this._handlePool = 0; }
        constructor(_proxy, _textDocumentsAndEditors, _textDocuments, uri, data) {
            this._proxy = _proxy;
            this._textDocumentsAndEditors = _textDocumentsAndEditors;
            this._textDocuments = _textDocuments;
            this.uri = uri;
            this.handle = ExtHostNotebookDocument._handlePool++;
            this._cells = [];
            this._versionId = 0;
            this._isDirty = false;
            this._disposed = false;
            this._notebookType = data.viewType;
            this._metadata = Object.freeze(data.metadata ?? Object.create(null));
            this._spliceNotebookCells([[0, 0, data.cells]], true /* init -> no event*/, undefined);
            this._versionId = data.versionId;
        }
        dispose() {
            this._disposed = true;
        }
        get versionId() {
            return this._versionId;
        }
        get apiNotebook() {
            if (!this._notebook) {
                const that = this;
                const apiObject = {
                    get uri() { return that.uri; },
                    get version() { return that._versionId; },
                    get notebookType() { return that._notebookType; },
                    get isDirty() { return that._isDirty; },
                    get isUntitled() { return that.uri.scheme === network_1.Schemas.untitled; },
                    get isClosed() { return that._disposed; },
                    get metadata() { return that._metadata; },
                    get cellCount() { return that._cells.length; },
                    cellAt(index) {
                        index = that._validateIndex(index);
                        return that._cells[index].apiCell;
                    },
                    getCells(range) {
                        const cells = range ? that._getCells(range) : that._cells;
                        return cells.map(cell => cell.apiCell);
                    },
                    save() {
                        return that._save();
                    }
                };
                this._notebook = Object.freeze(apiObject);
            }
            return this._notebook;
        }
        acceptDocumentPropertiesChanged(data) {
            if (data.metadata) {
                this._metadata = Object.freeze({ ...this._metadata, ...data.metadata });
            }
        }
        acceptDirty(isDirty) {
            this._isDirty = isDirty;
        }
        acceptModelChanged(event, isDirty, newMetadata) {
            this._versionId = event.versionId;
            this._isDirty = isDirty;
            this.acceptDocumentPropertiesChanged({ metadata: newMetadata });
            const result = {
                notebook: this.apiNotebook,
                metadata: newMetadata,
                cellChanges: [],
                contentChanges: [],
            };
            const relaxedCellChanges = [];
            // -- apply change and populate content changes
            for (const rawEvent of event.rawEvents) {
                if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ModelChange) {
                    this._spliceNotebookCells(rawEvent.changes, false, result.contentChanges);
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.Move) {
                    this._moveCells(rawEvent.index, rawEvent.length, rawEvent.newIdx, result.contentChanges);
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.Output) {
                    this._setCellOutputs(rawEvent.index, rawEvent.outputs);
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, outputs: this._cells[rawEvent.index].apiCell.outputs });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.OutputItem) {
                    this._setCellOutputItems(rawEvent.index, rawEvent.outputId, rawEvent.append, rawEvent.outputItems);
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, outputs: this._cells[rawEvent.index].apiCell.outputs });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellLanguage) {
                    this._changeCellLanguage(rawEvent.index, rawEvent.language);
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, document: this._cells[rawEvent.index].apiCell.document });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellContent) {
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, document: this._cells[rawEvent.index].apiCell.document });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellMime) {
                    this._changeCellMime(rawEvent.index, rawEvent.mime);
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellMetadata) {
                    this._changeCellMetadata(rawEvent.index, rawEvent.metadata);
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, metadata: this._cells[rawEvent.index].apiCell.metadata });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellInternalMetadata) {
                    this._changeCellInternalMetadata(rawEvent.index, rawEvent.internalMetadata);
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, executionSummary: this._cells[rawEvent.index].apiCell.executionSummary });
                }
            }
            // -- compact cellChanges
            const map = new Map();
            for (let i = 0; i < relaxedCellChanges.length; i++) {
                const relaxedCellChange = relaxedCellChanges[i];
                const existing = map.get(relaxedCellChange.cell);
                if (existing === undefined) {
                    const newLen = result.cellChanges.push({
                        document: undefined,
                        executionSummary: undefined,
                        metadata: undefined,
                        outputs: undefined,
                        ...relaxedCellChange,
                    });
                    map.set(relaxedCellChange.cell, newLen - 1);
                }
                else {
                    result.cellChanges[existing] = {
                        ...result.cellChanges[existing],
                        ...relaxedCellChange
                    };
                }
            }
            // Freeze event properties so handlers cannot accidentally modify them
            Object.freeze(result);
            Object.freeze(result.cellChanges);
            Object.freeze(result.contentChanges);
            return result;
        }
        _validateIndex(index) {
            index = index | 0;
            if (index < 0) {
                return 0;
            }
            else if (index >= this._cells.length) {
                return this._cells.length - 1;
            }
            else {
                return index;
            }
        }
        _validateRange(range) {
            let start = range.start | 0;
            let end = range.end | 0;
            if (start < 0) {
                start = 0;
            }
            if (end > this._cells.length) {
                end = this._cells.length;
            }
            return range.with({ start, end });
        }
        _getCells(range) {
            range = this._validateRange(range);
            const result = [];
            for (let i = range.start; i < range.end; i++) {
                result.push(this._cells[i]);
            }
            return result;
        }
        async _save() {
            if (this._disposed) {
                return Promise.reject(new Error('Notebook has been closed'));
            }
            return this._proxy.$trySaveNotebook(this.uri);
        }
        _spliceNotebookCells(splices, initialization, bucket) {
            if (this._disposed) {
                return;
            }
            const contentChangeEvents = [];
            const addedCellDocuments = [];
            const removedCellDocuments = [];
            splices.reverse().forEach(splice => {
                const cellDtos = splice[2];
                const newCells = cellDtos.map(cell => {
                    const extCell = new ExtHostCell(this, this._textDocumentsAndEditors, cell);
                    if (!initialization) {
                        addedCellDocuments.push(ExtHostCell.asModelAddData(this.apiNotebook, cell));
                    }
                    return extCell;
                });
                const changeEvent = new RawContentChangeEvent(splice[0], splice[1], [], newCells);
                const deletedItems = this._cells.splice(splice[0], splice[1], ...newCells);
                for (const cell of deletedItems) {
                    removedCellDocuments.push(cell.uri);
                    changeEvent.deletedItems.push(cell.apiCell);
                }
                contentChangeEvents.push(changeEvent);
            });
            this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({
                addedDocuments: addedCellDocuments,
                removedDocuments: removedCellDocuments
            });
            if (bucket) {
                for (const changeEvent of contentChangeEvents) {
                    bucket.push(changeEvent.asApiEvent());
                }
            }
        }
        _moveCells(index, length, newIdx, bucket) {
            const cells = this._cells.splice(index, length);
            this._cells.splice(newIdx, 0, ...cells);
            const changes = [
                new RawContentChangeEvent(index, length, cells.map(c => c.apiCell), []),
                new RawContentChangeEvent(newIdx, 0, [], cells)
            ];
            for (const change of changes) {
                bucket.push(change.asApiEvent());
            }
        }
        _setCellOutputs(index, outputs) {
            const cell = this._cells[index];
            cell.setOutputs(outputs);
        }
        _setCellOutputItems(index, outputId, append, outputItems) {
            const cell = this._cells[index];
            cell.setOutputItems(outputId, append, outputItems);
        }
        _changeCellLanguage(index, newLanguageId) {
            const cell = this._cells[index];
            if (cell.apiCell.document.languageId !== newLanguageId) {
                this._textDocuments.$acceptModelLanguageChanged(cell.uri, newLanguageId);
            }
        }
        _changeCellMime(index, newMime) {
            const cell = this._cells[index];
            cell.apiCell.mime = newMime;
        }
        _changeCellMetadata(index, newMetadata) {
            const cell = this._cells[index];
            cell.setMetadata(newMetadata);
        }
        _changeCellInternalMetadata(index, newInternalMetadata) {
            const cell = this._cells[index];
            cell.setInternalMetadata(newInternalMetadata);
        }
        getCellFromApiCell(apiCell) {
            return this._cells.find(cell => cell.apiCell === apiCell);
        }
        getCellFromIndex(index) {
            return this._cells[index];
        }
        getCell(cellHandle) {
            return this._cells.find(cell => cell.handle === cellHandle);
        }
        getCellIndex(cell) {
            return this._cells.indexOf(cell);
        }
    }
    exports.ExtHostNotebookDocument = ExtHostNotebookDocument;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rRG9jdW1lbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0Tm90ZWJvb2tEb2N1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBTSxxQkFBcUI7UUFFMUIsWUFDVSxLQUFhLEVBQ2IsWUFBb0IsRUFDcEIsWUFBbUMsRUFDbkMsS0FBb0I7WUFIcEIsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNiLGlCQUFZLEdBQVosWUFBWSxDQUFRO1lBQ3BCLGlCQUFZLEdBQVosWUFBWSxDQUF1QjtZQUNuQyxVQUFLLEdBQUwsS0FBSyxDQUFlO1FBQzFCLENBQUM7UUFFTCxVQUFVO1lBQ1QsT0FBTztnQkFDTixLQUFLLEVBQUUsSUFBSSw0QkFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUNwRSxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUNoRCxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7YUFDL0IsQ0FBQztRQUNILENBQUM7S0FDRDtJQUVELE1BQWEsV0FBVztRQUV2QixNQUFNLENBQUMsY0FBYyxDQUFDLFFBQWlDLEVBQUUsSUFBcUM7WUFDN0YsT0FBTztnQkFDTixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNsQixVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3pCLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztnQkFDYixPQUFPLEVBQUUsS0FBSztnQkFDZCxTQUFTLEVBQUUsQ0FBQztnQkFDWixRQUFRO2FBQ1IsQ0FB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