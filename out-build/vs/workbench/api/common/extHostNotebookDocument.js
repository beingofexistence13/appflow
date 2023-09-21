/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, network_1, uri_1, extHostTypeConverters, extHostTypes_1, notebookCommon) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Dcc = exports.$Ccc = void 0;
    class RawContentChangeEvent {
        constructor(start, deletedCount, deletedItems, items) {
            this.start = start;
            this.deletedCount = deletedCount;
            this.deletedItems = deletedItems;
            this.items = items;
        }
        asApiEvent() {
            return {
                range: new extHostTypes_1.$nL(this.start, this.start + this.deletedCount),
                addedCells: this.items.map(cell => cell.apiCell),
                removedCells: this.deletedItems,
            };
        }
    }
    class $Ccc {
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
        constructor(notebook, h, j) {
            this.notebook = notebook;
            this.h = h;
            this.j = j;
            this.handle = j.handle;
            this.uri = uri_1.URI.revive(j.uri);
            this.cellKind = j.cellKind;
            this.a = j.outputs.map(extHostTypeConverters.NotebookCellOutput.to);
            this.e = j.internalMetadata ?? {};
            this.b = Object.freeze(j.metadata ?? {});
            this.d = Object.freeze(extHostTypeConverters.NotebookCellExecutionSummary.to(j.internalMetadata ?? {}));
        }
        get internalMetadata() {
            return this.e;
        }
        get apiCell() {
            if (!this.f) {
                const that = this;
                const data = this.h.getDocument(this.uri);
                if (!data) {
                    throw new Error(`MISSING extHostDocument for notebook cell: ${this.uri}`);
                }
                const apiCell = {
                    get index() { return that.notebook.getCellIndex(that); },
                    notebook: that.notebook.apiNotebook,
                    kind: extHostTypeConverters.NotebookCellKind.to(this.j.cellKind),
                    document: data.document,
                    get mime() { return that.g; },
                    set mime(value) { that.g = value; },
                    get outputs() { return that.a.slice(0); },
                    get metadata() { return that.b; },
                    get executionSummary() { return that.d; }
                };
                this.f = Object.freeze(apiCell);
            }
            return this.f;
        }
        setOutputs(newOutputs) {
            this.a = newOutputs.map(extHostTypeConverters.NotebookCellOutput.to);
        }
        setOutputItems(outputId, append, newOutputItems) {
            const newItems = newOutputItems.map(extHostTypeConverters.NotebookCellOutputItem.to);
            const output = this.a.find(op => op.id === outputId);
            if (output) {
                if (!append) {
                    output.items.length = 0;
                }
                output.items.push(...newItems);
                if (output.items.length > 1 && output.items.every(item => notebookCommon.$9H(item.mime))) {
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
                        const compressed = notebookCommon.$0H(mimeOutputs.get(mime));
                        output.items.push({
                            mime,
                            data: compressed.data.buffer
                        });
                    });
                }
            }
        }
        setMetadata(newMetadata) {
            this.b = Object.freeze(newMetadata);
        }
        setInternalMetadata(newInternalMetadata) {
            this.e = newInternalMetadata;
            this.d = Object.freeze(extHostTypeConverters.NotebookCellExecutionSummary.to(newInternalMetadata));
        }
        setMime(newMime) {
        }
    }
    exports.$Ccc = $Ccc;
    class $Dcc {
        static { this.a = 0; }
        constructor(k, l, m, uri, data) {
            this.k = k;
            this.l = l;
            this.m = m;
            this.uri = uri;
            this.handle = $Dcc.a++;
            this.b = [];
            this.g = 0;
            this.h = false;
            this.j = false;
            this.d = data.viewType;
            this.f = Object.freeze(data.metadata ?? Object.create(null));
            this.r([[0, 0, data.cells]], true /* init -> no event*/, undefined);
            this.g = data.versionId;
        }
        dispose() {
            this.j = true;
        }
        get versionId() {
            return this.g;
        }
        get apiNotebook() {
            if (!this.e) {
                const that = this;
                const apiObject = {
                    get uri() { return that.uri; },
                    get version() { return that.g; },
                    get notebookType() { return that.d; },
                    get isDirty() { return that.h; },
                    get isUntitled() { return that.uri.scheme === network_1.Schemas.untitled; },
                    get isClosed() { return that.j; },
                    get metadata() { return that.f; },
                    get cellCount() { return that.b.length; },
                    cellAt(index) {
                        index = that.n(index);
                        return that.b[index].apiCell;
                    },
                    getCells(range) {
                        const cells = range ? that.p(range) : that.b;
                        return cells.map(cell => cell.apiCell);
                    },
                    save() {
                        return that.q();
                    }
                };
                this.e = Object.freeze(apiObject);
            }
            return this.e;
        }
        acceptDocumentPropertiesChanged(data) {
            if (data.metadata) {
                this.f = Object.freeze({ ...this.f, ...data.metadata });
            }
        }
        acceptDirty(isDirty) {
            this.h = isDirty;
        }
        acceptModelChanged(event, isDirty, newMetadata) {
            this.g = event.versionId;
            this.h = isDirty;
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
                    this.r(rawEvent.changes, false, result.contentChanges);
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.Move) {
                    this.s(rawEvent.index, rawEvent.length, rawEvent.newIdx, result.contentChanges);
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.Output) {
                    this.t(rawEvent.index, rawEvent.outputs);
                    relaxedCellChanges.push({ cell: this.b[rawEvent.index].apiCell, outputs: this.b[rawEvent.index].apiCell.outputs });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.OutputItem) {
                    this.u(rawEvent.index, rawEvent.outputId, rawEvent.append, rawEvent.outputItems);
                    relaxedCellChanges.push({ cell: this.b[rawEvent.index].apiCell, outputs: this.b[rawEvent.index].apiCell.outputs });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellLanguage) {
                    this.v(rawEvent.index, rawEvent.language);
                    relaxedCellChanges.push({ cell: this.b[rawEvent.index].apiCell, document: this.b[rawEvent.index].apiCell.document });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellContent) {
                    relaxedCellChanges.push({ cell: this.b[rawEvent.index].apiCell, document: this.b[rawEvent.index].apiCell.document });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellMime) {
                    this.w(rawEvent.index, rawEvent.mime);
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellMetadata) {
                    this.x(rawEvent.index, rawEvent.metadata);
                    relaxedCellChanges.push({ cell: this.b[rawEvent.index].apiCell, metadata: this.b[rawEvent.index].apiCell.metadata });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellInternalMetadata) {
                    this.y(rawEvent.index, rawEvent.internalMetadata);
                    relaxedCellChanges.push({ cell: this.b[rawEvent.index].apiCell, executionSummary: this.b[rawEvent.index].apiCell.executionSummary });
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
        n(index) {
            index = index | 0;
            if (index < 0) {
                return 0;
            }
            else if (index >= this.b.length) {
                return this.b.length - 1;
            }
            else {
                return index;
            }
        }
        o(range) {
            let start = range.start | 0;
            let end = range.end | 0;
            if (start < 0) {
                start = 0;
            }
            if (end > this.b.length) {
                end = this.b.length;
            }
            return range.with({ start, end });
        }
        p(range) {
            range = this.o(range);
            const result = [];
            for (let i = range.start; i < range.end; i++) {
                result.push(this.b[i]);
            }
            return result;
        }
        async q() {
            if (this.j) {
                return Promise.reject(new Error('Notebook has been closed'));
            }
            return this.k.$trySaveNotebook(this.uri);
        }
        r(splices, initialization, bucket) {
            if (this.j) {
                return;
            }
            const contentChangeEvents = [];
            const addedCellDocuments = [];
            const removedCellDocuments = [];
            splices.reverse().forEach(splice => {
                const cellDtos = splice[2];
                const newCells = cellDtos.map(cell => {
                    const extCell = new $Ccc(this, this.l, cell);
                    if (!initialization) {
                        addedCellDocuments.push($Ccc.asModelAddData(this.apiNotebook, cell));
                    }
                    return extCell;
                });
                const changeEvent = new RawContentChangeEvent(splice[0], splice[1], [], newCells);
                const deletedItems = this.b.splice(splice[0], splice[1], ...newCells);
                for (const cell of deletedItems) {
                    removedCellDocuments.push(cell.uri);
                    changeEvent.deletedItems.push(cell.apiCell);
                }
                contentChangeEvents.push(changeEvent);
            });
            this.l.acceptDocumentsAndEditorsDelta({
                addedDocuments: addedCellDocuments,
                removedDocuments: removedCellDocuments
            });
            if (bucket) {
                for (const changeEvent of contentChangeEvents) {
                    bucket.push(changeEvent.asApiEvent());
                }
            }
        }
        s(index, length, newIdx, bucket) {
            const cells = this.b.splice(index, length);
            this.b.splice(newIdx, 0, ...cells);
            const changes = [
                new RawContentChangeEvent(index, length, cells.map(c => c.apiCell), []),
                new RawContentChangeEvent(newIdx, 0, [], cells)
            ];
            for (const change of changes) {
                bucket.push(change.asApiEvent());
            }
        }
        t(index, outputs) {
            const cell = this.b[index];
            cell.setOutputs(outputs);
        }
        u(index, outputId, append, outputItems) {
            const cell = this.b[index];
            cell.setOutputItems(outputId, append, outputItems);
        }
        v(index, newLanguageId) {
            const cell = this.b[index];
            if (cell.apiCell.document.languageId !== newLanguageId) {
                this.m.$acceptModelLanguageChanged(cell.uri, newLanguageId);
            }
        }
        w(index, newMime) {
            const cell = this.b[index];
            cell.apiCell.mime = newMime;
        }
        x(index, newMetadata) {
            const cell = this.b[index];
            cell.setMetadata(newMetadata);
        }
        y(index, newInternalMetadata) {
            const cell = this.b[index];
            cell.setInternalMetadata(newInternalMetadata);
        }
        getCellFromApiCell(apiCell) {
            return this.b.find(cell => cell.apiCell === apiCell);
        }
        getCellFromIndex(index) {
            return this.b[index];
        }
        getCell(cellHandle) {
            return this.b.find(cell => cell.handle === cellHandle);
        }
        getCellIndex(cell) {
            return this.b.indexOf(cell);
        }
    }
    exports.$Dcc = $Dcc;
});
//# sourceMappingURL=extHostNotebookDocument.js.map