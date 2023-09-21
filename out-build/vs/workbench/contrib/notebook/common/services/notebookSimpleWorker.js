define(["require", "exports", "vs/base/common/diff/diff", "vs/base/common/hash", "vs/base/common/uri", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/editor/common/core/range", "vs/editor/common/model/textModelSearch"], function (require, exports, diff_1, hash_1, uri_1, pieceTreeTextBufferBuilder_1, notebookCommon_1, range_1, textModelSearch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = exports.NotebookEditorSimpleWorker = void 0;
    function bufferHash(buffer) {
        let initialHashVal = (0, hash_1.$ri)(104579, 0);
        for (let k = 0; k < buffer.buffer.length; k++) {
            initialHashVal = (0, hash_1.$qi)(buffer.buffer[k], initialHashVal);
        }
        return initialHashVal;
    }
    class MirrorCell {
        get textBuffer() {
            if (this.a) {
                return this.a;
            }
            const builder = new pieceTreeTextBufferBuilder_1.$tC();
            builder.acceptChunk(Array.isArray(this.d) ? this.d.join('\n') : this.d);
            const bufferFactory = builder.finish(true);
            this.a = bufferFactory.create(1 /* model.DefaultEndOfLine.LF */).textBuffer;
            return this.a;
        }
        primaryKey() {
            if (this.b === undefined) {
                this.b = (0, hash_1.$pi)(this.getValue());
            }
            return this.b;
        }
        constructor(handle, d, language, cellKind, outputs, metadata, internalMetadata) {
            this.handle = handle;
            this.d = d;
            this.language = language;
            this.cellKind = cellKind;
            this.outputs = outputs;
            this.metadata = metadata;
            this.internalMetadata = internalMetadata;
            this.b = null;
            this.c = null;
        }
        getFullModelRange() {
            const lineCount = this.textBuffer.getLineCount();
            return new range_1.$ks(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
        }
        getValue() {
            const fullRange = this.getFullModelRange();
            return this.textBuffer.getValueInRange(fullRange, 1 /* model.EndOfLinePreference.LF */);
        }
        getComparisonValue() {
            if (this.b !== null) {
                return this.b;
            }
            this.c = (0, hash_1.$pi)([(0, hash_1.$pi)(this.language), (0, hash_1.$pi)(this.getValue()), this.metadata, this.internalMetadata, this.outputs.map(op => ({
                    outputs: op.outputs.map(output => ({
                        mime: output.mime,
                        data: bufferHash(output.data)
                    })),
                    metadata: op.metadata
                }))]);
            return this.c;
        }
        getHashValue() {
            if (this.c !== null) {
                return this.c;
            }
            this.c = (0, hash_1.$pi)([(0, hash_1.$pi)(this.getValue()), this.language, this.metadata, this.internalMetadata]);
            return this.c;
        }
    }
    class MirrorNotebookDocument {
        constructor(uri, cells, metadata) {
            this.uri = uri;
            this.cells = cells;
            this.metadata = metadata;
        }
        acceptModelChanged(event) {
            // note that the cell content change is not applied to the MirrorCell
            // but it's fine as if a cell content is modified after the first diff, its position will not change any more
            // TODO@rebornix, but it might lead to interesting bugs in the future.
            event.rawEvents.forEach(e => {
                if (e.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange) {
                    this._spliceNotebookCells(e.changes);
                }
                else if (e.kind === notebookCommon_1.NotebookCellsChangeType.Move) {
                    const cells = this.cells.splice(e.index, 1);
                    this.cells.splice(e.newIdx, 0, ...cells);
                }
                else if (e.kind === notebookCommon_1.NotebookCellsChangeType.Output) {
                    const cell = this.cells[e.index];
                    cell.outputs = e.outputs;
                }
                else if (e.kind === notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage) {
                    this.a(e.index);
                    const cell = this.cells[e.index];
                    cell.language = e.language;
                }
                else if (e.kind === notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata) {
                    this.a(e.index);
                    const cell = this.cells[e.index];
                    cell.metadata = e.metadata;
                }
                else if (e.kind === notebookCommon_1.NotebookCellsChangeType.ChangeCellInternalMetadata) {
                    this.a(e.index);
                    const cell = this.cells[e.index];
                    cell.internalMetadata = e.internalMetadata;
                }
            });
        }
        a(index) {
            if (index < 0 || index >= this.cells.length) {
                throw new Error(`Illegal index ${index}. Cells length: ${this.cells.length}`);
            }
        }
        _spliceNotebookCells(splices) {
            splices.reverse().forEach(splice => {
                const cellDtos = splice[2];
                const newCells = cellDtos.map(cell => {
                    return new MirrorCell(cell.handle, cell.source, cell.language, cell.cellKind, cell.outputs, cell.metadata);
                });
                this.cells.splice(splice[0], splice[1], ...newCells);
            });
        }
    }
    class CellSequence {
        constructor(textModel) {
            this.textModel = textModel;
        }
        getElements() {
            const hashValue = new Int32Array(this.textModel.cells.length);
            for (let i = 0; i < this.textModel.cells.length; i++) {
                hashValue[i] = this.textModel.cells[i].getComparisonValue();
            }
            return hashValue;
        }
        getCellHash(cell) {
            const source = Array.isArray(cell.source) ? cell.source.join('\n') : cell.source;
            const hashVal = (0, hash_1.$pi)([(0, hash_1.$pi)(source), cell.metadata]);
            return hashVal;
        }
    }
    class NotebookEditorSimpleWorker {
        constructor() {
            this.a = Object.create(null);
        }
        dispose() {
        }
        acceptNewModel(uri, data) {
            this.a[uri] = new MirrorNotebookDocument(uri_1.URI.parse(uri), data.cells.map(dto => new MirrorCell(dto.handle, dto.source, dto.language, dto.cellKind, dto.outputs, dto.metadata)), data.metadata);
        }
        acceptModelChanged(strURL, event) {
            const model = this.a[strURL];
            model?.acceptModelChanged(event);
        }
        acceptRemovedModel(strURL) {
            if (!this.a[strURL]) {
                return;
            }
            delete this.a[strURL];
        }
        computeDiff(originalUrl, modifiedUrl) {
            const original = this.b(originalUrl);
            const modified = this.b(modifiedUrl);
            const diff = new diff_1.$qs(new CellSequence(original), new CellSequence(modified));
            const diffResult = diff.ComputeDiff(false);
            /* let cellLineChanges: { originalCellhandle: number, modifiedCellhandle: number, lineChanges: ILineChange[] }[] = [];
    
            diffResult.changes.forEach(change => {
                if (change.modifiedLength === 0) {
                    // deletion ...
                    return;
                }
    
                if (change.originalLength === 0) {
                    // insertion
                    return;
                }
    
                for (let i = 0, len = Math.min(change.modifiedLength, change.originalLength); i < len; i++) {
                    let originalIndex = change.originalStart + i;
                    let modifiedIndex = change.modifiedStart + i;
    
                    const originalCell = original.cells[originalIndex];
                    const modifiedCell = modified.cells[modifiedIndex];
    
                    if (originalCell.getValue() !== modifiedCell.getValue()) {
                        // console.log(`original cell ${originalIndex} content change`);
                        const originalLines = originalCell.textBuffer.getLinesContent();
                        const modifiedLines = modifiedCell.textBuffer.getLinesContent();
                        const diffComputer = new DiffComputer(originalLines, modifiedLines, {
                            shouldComputeCharChanges: true,
                            shouldPostProcessCharChanges: true,
                            shouldIgnoreTrimWhitespace: false,
                            shouldMakePrettyDiff: true,
                            maxComputationTime: 5000
                        });
    
                        const lineChanges = diffComputer.computeDiff().changes;
    
                        cellLineChanges.push({
                            originalCellhandle: originalCell.handle,
                            modifiedCellhandle: modifiedCell.handle,
                            lineChanges
                        });
    
                        // console.log(lineDecorations);
    
                    } else {
                        // console.log(`original cell ${originalIndex} metadata change`);
                    }
    
                }
            });
     */
            return {
                cellsDiff: diffResult,
                // linesDiff: cellLineChanges
            };
        }
        canPromptRecommendation(modelUrl) {
            const model = this.b(modelUrl);
            const cells = model.cells;
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                    continue;
                }
                if (cell.language !== 'python') {
                    continue;
                }
                const lineCount = cell.textBuffer.getLineCount();
                const maxLineCount = Math.min(lineCount, 20);
                const range = new range_1.$ks(1, 1, maxLineCount, cell.textBuffer.getLineLength(maxLineCount) + 1);
                const searchParams = new textModelSearch_1.$hC('import\\s*pandas|from\\s*pandas', true, false, null);
                const searchData = searchParams.parseSearchRequest();
                if (!searchData) {
                    continue;
                }
                const cellMatches = cell.textBuffer.findMatchesLineByLine(range, searchData, true, 1);
                if (cellMatches.length > 0) {
                    return true;
                }
            }
            return false;
        }
        b(uri) {
            return this.a[uri];
        }
    }
    exports.NotebookEditorSimpleWorker = NotebookEditorSimpleWorker;
    /**
     * Called on the worker side
     * @internal
     */
    function create(host) {
        return new NotebookEditorSimpleWorker();
    }
    exports.create = create;
});
//# sourceMappingURL=notebookSimpleWorker.js.map