/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/common/model/cellEdit", "vs/base/common/diff/diff", "vs/base/common/hash", "vs/workbench/contrib/notebook/common/model/notebookCellOutputTextModel", "vs/editor/common/services/model", "vs/base/common/network", "vs/base/common/resources", "vs/editor/common/languages/language", "vs/editor/common/model/textModel", "vs/base/common/types"], function (require, exports, event_1, lifecycle_1, notebookCellTextModel_1, notebookCommon_1, undoRedo_1, cellEdit_1, diff_1, hash_1, notebookCellOutputTextModel_1, model_1, network_1, resources_1, language_1, textModel_1, types_1) {
    "use strict";
    var NotebookTextModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookTextModel = void 0;
    class StackOperation {
        constructor(textModel, label, undoRedoGroup, _pauseableEmitter, _postUndoRedo, selectionState, beginAlternativeVersionId) {
            this.textModel = textModel;
            this.label = label;
            this.undoRedoGroup = undoRedoGroup;
            this._pauseableEmitter = _pauseableEmitter;
            this._postUndoRedo = _postUndoRedo;
            this.code = 'undoredo.notebooks.stackOperation';
            this._operations = [];
            this._beginSelectionState = undefined;
            this._resultSelectionState = undefined;
            this.type = 1 /* UndoRedoElementType.Workspace */;
            this._beginSelectionState = selectionState;
            this._beginAlternativeVersionId = beginAlternativeVersionId;
            this._resultAlternativeVersionId = beginAlternativeVersionId;
        }
        get resources() {
            return [this.textModel.uri];
        }
        get isEmpty() {
            return this._operations.length === 0;
        }
        pushEndState(alternativeVersionId, selectionState) {
            this._resultAlternativeVersionId = alternativeVersionId;
            this._resultSelectionState = selectionState;
        }
        pushEditOperation(element, beginSelectionState, resultSelectionState) {
            if (this._operations.length === 0) {
                this._beginSelectionState = this._beginSelectionState ?? beginSelectionState;
            }
            this._operations.push(element);
            this._resultSelectionState = resultSelectionState;
        }
        async undo() {
            this._pauseableEmitter.pause();
            for (let i = this._operations.length - 1; i >= 0; i--) {
                await this._operations[i].undo();
            }
            this._postUndoRedo(this._beginAlternativeVersionId);
            this._pauseableEmitter.fire({
                rawEvents: [],
                synchronous: undefined,
                versionId: this.textModel.versionId,
                endSelectionState: this._beginSelectionState
            });
            this._pauseableEmitter.resume();
        }
        async redo() {
            this._pauseableEmitter.pause();
            for (let i = 0; i < this._operations.length; i++) {
                await this._operations[i].redo();
            }
            this._postUndoRedo(this._resultAlternativeVersionId);
            this._pauseableEmitter.fire({
                rawEvents: [],
                synchronous: undefined,
                versionId: this.textModel.versionId,
                endSelectionState: this._resultSelectionState
            });
            this._pauseableEmitter.resume();
        }
    }
    class NotebookOperationManager {
        constructor(_textModel, _undoService, _pauseableEmitter, _postUndoRedo) {
            this._textModel = _textModel;
            this._undoService = _undoService;
            this._pauseableEmitter = _pauseableEmitter;
            this._postUndoRedo = _postUndoRedo;
            this._pendingStackOperation = null;
        }
        isUndoStackEmpty() {
            return this._pendingStackOperation === null || this._pendingStackOperation.isEmpty;
        }
        pushStackElement(label, selectionState, undoRedoGroup, alternativeVersionId) {
            if (this._pendingStackOperation) {
                this._pendingStackOperation.pushEndState(alternativeVersionId, selectionState);
                if (!this._pendingStackOperation.isEmpty) {
                    this._undoService.pushElement(this._pendingStackOperation, this._pendingStackOperation.undoRedoGroup);
                }
                this._pendingStackOperation = null;
                return;
            }
            this._pendingStackOperation = new StackOperation(this._textModel, label, undoRedoGroup, this._pauseableEmitter, this._postUndoRedo, selectionState, alternativeVersionId);
        }
        pushEditOperation(element, beginSelectionState, resultSelectionState) {
            if (this._pendingStackOperation) {
                this._pendingStackOperation.pushEditOperation(element, beginSelectionState, resultSelectionState);
                return;
            }
            this._undoService.pushElement(element);
        }
    }
    class NotebookEventEmitter extends event_1.PauseableEmitter {
        isDirtyEvent() {
            for (const e of this._eventQueue) {
                for (let i = 0; i < e.rawEvents.length; i++) {
                    if (!e.rawEvents[i].transient) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    let NotebookTextModel = NotebookTextModel_1 = class NotebookTextModel extends lifecycle_1.Disposable {
        get length() {
            return this._cells.length;
        }
        get cells() {
            return this._cells;
        }
        get versionId() {
            return this._versionId;
        }
        get alternativeVersionId() {
            return this._alternativeVersionId;
        }
        constructor(viewType, uri, cells, metadata, options, _undoService, _modelService, _languageService) {
            super();
            this.viewType = viewType;
            this.uri = uri;
            this._undoService = _undoService;
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._isDisposed = false;
            this._onWillDispose = this._register(new event_1.Emitter());
            this._onWillAddRemoveCells = this._register(new event_1.Emitter());
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.onWillAddRemoveCells = this._onWillAddRemoveCells.event;
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._cellhandlePool = 0;
            this._cellListeners = new Map();
            this._cells = [];
            this.metadata = {};
            this.transientOptions = { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} };
            this._versionId = 0;
            /**
             * This alternative id is only for non-cell-content changes.
             */
            this._notebookSpecificAlternativeId = 0;
            /**
             * Unlike, versionId, this can go down (via undo) or go to previous values (via redo)
             */
            this._alternativeVersionId = '1';
            this.transientOptions = options;
            this.metadata = metadata;
            this._initialize(cells);
            const maybeUpdateCellTextModel = (textModel) => {
                if (textModel.uri.scheme === network_1.Schemas.vscodeNotebookCell && textModel instanceof textModel_1.TextModel) {
                    const cellUri = notebookCommon_1.CellUri.parse(textModel.uri);
                    if (cellUri && (0, resources_1.isEqual)(cellUri.notebook, this.uri)) {
                        const cellIdx = this._getCellIndexByHandle(cellUri.handle);
                        if (cellIdx >= 0) {
                            const cell = this.cells[cellIdx];
                            if (cell) {
                                cell.textModel = textModel;
                            }
                        }
                    }
                }
            };
            this._register(_modelService.onModelAdded(e => maybeUpdateCellTextModel(e)));
            this._pauseableEmitter = new NotebookEventEmitter({
                merge: (events) => {
                    const first = events[0];
                    const rawEvents = first.rawEvents;
                    let versionId = first.versionId;
                    let endSelectionState = first.endSelectionState;
                    let synchronous = first.synchronous;
                    for (let i = 1; i < events.length; i++) {
                        rawEvents.push(...events[i].rawEvents);
                        versionId = events[i].versionId;
                        endSelectionState = events[i].endSelectionState !== undefined ? events[i].endSelectionState : endSelectionState;
                        synchronous = events[i].synchronous !== undefined ? events[i].synchronous : synchronous;
                    }
                    return { rawEvents, versionId, endSelectionState, synchronous };
                }
            });
            this._register(this._pauseableEmitter.event(e => {
                if (e.rawEvents.length) {
                    this._onDidChangeContent.fire(e);
                }
            }));
            this._operationManager = new NotebookOperationManager(this, this._undoService, this._pauseableEmitter, (alternativeVersionId) => {
                this._increaseVersionId(true);
                this._overwriteAlternativeVersionId(alternativeVersionId);
            });
        }
        setCellCollapseDefault(collapseConfig) {
            this._defaultCollapseConfig = collapseConfig;
        }
        _initialize(cells, triggerDirty) {
            this._cells = [];
            this._versionId = 0;
            this._notebookSpecificAlternativeId = 0;
            const mainCells = cells.map(cell => {
                const cellHandle = this._cellhandlePool++;
                const cellUri = notebookCommon_1.CellUri.generate(this.uri, cellHandle);
                const collapseState = this._getDefaultCollapseState(cell);
                return new notebookCellTextModel_1.NotebookCellTextModel(cellUri, cellHandle, cell.source, cell.language, cell.mime, cell.cellKind, cell.outputs, cell.metadata, cell.internalMetadata, collapseState, this.transientOptions, this._languageService);
            });
            for (let i = 0; i < mainCells.length; i++) {
                const dirtyStateListener = mainCells[i].onDidChangeContent((e) => {
                    this._bindCellContentHandler(mainCells[i], e);
                });
                this._cellListeners.set(mainCells[i].handle, dirtyStateListener);
                this._register(mainCells[i]);
            }
            this._cells.splice(0, 0, ...mainCells);
            this._alternativeVersionId = this._generateAlternativeId();
            if (triggerDirty) {
                this._pauseableEmitter.fire({
                    rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.Unknown, transient: false }],
                    versionId: this.versionId,
                    synchronous: true,
                    endSelectionState: undefined
                });
            }
        }
        _bindCellContentHandler(cell, e) {
            this._increaseVersionId(e === 'content');
            switch (e) {
                case 'content':
                    this._pauseableEmitter.fire({
                        rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellContent, index: this._getCellIndexByHandle(cell.handle), transient: false }],
                        versionId: this.versionId,
                        synchronous: true,
                        endSelectionState: undefined
                    });
                    break;
                case 'language':
                    this._pauseableEmitter.fire({
                        rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage, index: this._getCellIndexByHandle(cell.handle), language: cell.language, transient: false }],
                        versionId: this.versionId,
                        synchronous: true,
                        endSelectionState: undefined
                    });
                    break;
                case 'mime':
                    this._pauseableEmitter.fire({
                        rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellMime, index: this._getCellIndexByHandle(cell.handle), mime: cell.mime, transient: false }],
                        versionId: this.versionId,
                        synchronous: true,
                        endSelectionState: undefined
                    });
                    break;
            }
        }
        _generateAlternativeId() {
            return `${this._notebookSpecificAlternativeId}_` + this.cells.map(cell => cell.handle + ',' + cell.alternativeId).join(';');
        }
        dispose() {
            if (this._isDisposed) {
                // NotebookEditorModel can be disposed twice, don't fire onWillDispose again
                return;
            }
            this._isDisposed = true;
            this._onWillDispose.fire();
            this._undoService.removeElements(this.uri);
            (0, lifecycle_1.dispose)(this._cellListeners.values());
            this._cellListeners.clear();
            (0, lifecycle_1.dispose)(this._cells);
            this._cells = [];
            super.dispose();
        }
        pushStackElement(label, selectionState, undoRedoGroup) {
            this._operationManager.pushStackElement(label, selectionState, undoRedoGroup, this.alternativeVersionId);
        }
        _getCellIndexByHandle(handle) {
            return this.cells.findIndex(c => c.handle === handle);
        }
        _getCellIndexWithOutputIdHandleFromEdits(outputId, rawEdits) {
            const edit = rawEdits.find(e => 'outputs' in e && e.outputs.some(o => o.outputId === outputId));
            if (edit) {
                if ('index' in edit) {
                    return edit.index;
                }
                else if ('handle' in edit) {
                    const cellIndex = this._getCellIndexByHandle(edit.handle);
                    this._assertIndex(cellIndex);
                    return cellIndex;
                }
            }
            return -1;
        }
        _getCellIndexWithOutputIdHandle(outputId) {
            return this.cells.findIndex(c => !!c.outputs.find(o => o.outputId === outputId));
        }
        reset(cells, metadata, transientOptions) {
            this.transientOptions = transientOptions;
            const edits = NotebookTextModel_1.computeEdits(this, cells);
            this.applyEdits([
                ...edits,
                { editType: 5 /* CellEditType.DocumentMetadata */, metadata }
            ], true, undefined, () => undefined, undefined, false);
        }
        static computeEdits(model, cells) {
            const edits = [];
            const commonPrefix = this._commonPrefix(model.cells, model.cells.length, 0, cells, cells.length, 0);
            if (commonPrefix > 0) {
                for (let i = 0; i < commonPrefix; i++) {
                    edits.push({
                        editType: 3 /* CellEditType.Metadata */,
                        index: i,
                        metadata: cells[i].metadata ?? {}
                    }, ...this._computeOutputEdit(i, model.cells[i].outputs, cells[i].outputs));
                }
            }
            if (model.cells.length === cells.length && commonPrefix === model.cells.length) {
                return edits;
            }
            const commonSuffix = this._commonSuffix(model.cells, model.cells.length - commonPrefix, commonPrefix, cells, cells.length - commonPrefix, commonPrefix);
            if (commonSuffix > 0) {
                edits.push({ editType: 1 /* CellEditType.Replace */, index: commonPrefix, count: model.cells.length - commonPrefix - commonSuffix, cells: cells.slice(commonPrefix, cells.length - commonSuffix) });
            }
            else if (commonPrefix > 0) {
                edits.push({ editType: 1 /* CellEditType.Replace */, index: commonPrefix, count: model.cells.length - commonPrefix, cells: cells.slice(commonPrefix) });
            }
            else {
                edits.push({ editType: 1 /* CellEditType.Replace */, index: 0, count: model.cells.length, cells });
            }
            if (commonSuffix > 0) {
                // has same suffix
                for (let i = commonSuffix; i > 0; i--) {
                    edits.push({
                        editType: 3 /* CellEditType.Metadata */,
                        index: model.cells.length - i,
                        metadata: cells[cells.length - i].metadata ?? {}
                    }, ...this._computeOutputEdit(model.cells.length - i, model.cells[model.cells.length - i].outputs, cells[cells.length - i].outputs));
                }
            }
            return edits;
        }
        static _computeOutputEdit(index, a, b) {
            if (a.length !== b.length) {
                return [
                    {
                        editType: 2 /* CellEditType.Output */,
                        index: index,
                        outputs: b,
                        append: false
                    }
                ];
            }
            if (a.length === 0) {
                // no output
                return [];
            }
            // same length
            return b.map((output, i) => {
                return {
                    editType: 7 /* CellEditType.OutputItems */,
                    outputId: a[i].outputId,
                    items: output.outputs,
                    append: false
                };
            });
        }
        static _commonPrefix(a, aLen, aDelta, b, bLen, bDelta) {
            const maxResult = Math.min(aLen, bLen);
            let result = 0;
            for (let i = 0; i < maxResult && a[aDelta + i].fastEqual(b[bDelta + i]); i++) {
                result++;
            }
            return result;
        }
        static _commonSuffix(a, aLen, aDelta, b, bLen, bDelta) {
            const maxResult = Math.min(aLen, bLen);
            let result = 0;
            for (let i = 0; i < maxResult && a[aDelta + aLen - i - 1].fastEqual(b[bDelta + bLen - i - 1]); i++) {
                result++;
            }
            return result;
        }
        applyEdits(rawEdits, synchronous, beginSelectionState, endSelectionsComputer, undoRedoGroup, computeUndoRedo) {
            this._pauseableEmitter.pause();
            this.pushStackElement('edit', beginSelectionState, undoRedoGroup);
            try {
                this._doApplyEdits(rawEdits, synchronous, computeUndoRedo);
                return true;
            }
            finally {
                // Update selection and versionId after applying edits.
                const endSelections = endSelectionsComputer();
                this._increaseVersionId(this._operationManager.isUndoStackEmpty() && !this._pauseableEmitter.isDirtyEvent());
                // Finalize undo element
                this.pushStackElement('edit', endSelections, undefined);
                // Broadcast changes
                this._pauseableEmitter.fire({ rawEvents: [], versionId: this.versionId, synchronous: synchronous, endSelectionState: endSelections });
                this._pauseableEmitter.resume();
            }
        }
        _doApplyEdits(rawEdits, synchronous, computeUndoRedo) {
            const editsWithDetails = rawEdits.map((edit, index) => {
                let cellIndex = -1;
                if ('index' in edit) {
                    cellIndex = edit.index;
                }
                else if ('handle' in edit) {
                    cellIndex = this._getCellIndexByHandle(edit.handle);
                    this._assertIndex(cellIndex);
                }
                else if ('outputId' in edit) {
                    cellIndex = this._getCellIndexWithOutputIdHandle(edit.outputId);
                    if (this._indexIsInvalid(cellIndex)) {
                        // The referenced output may have been created in this batch of edits
                        cellIndex = this._getCellIndexWithOutputIdHandleFromEdits(edit.outputId, rawEdits.slice(0, index));
                    }
                    if (this._indexIsInvalid(cellIndex)) {
                        // It's possible for an edit to refer to an output which was just cleared, ignore it without throwing
                        return null;
                    }
                }
                else if (edit.editType !== 5 /* CellEditType.DocumentMetadata */) {
                    throw new Error('Invalid cell edit');
                }
                return {
                    edit,
                    cellIndex,
                    end: (edit.editType === 5 /* CellEditType.DocumentMetadata */)
                        ? undefined
                        : (edit.editType === 1 /* CellEditType.Replace */ ? edit.index + edit.count : cellIndex),
                    originalIndex: index
                };
            }).filter(types_1.isDefined);
            // compress all edits which have no side effects on cell index
            const edits = this._mergeCellEdits(editsWithDetails)
                .sort((a, b) => {
                if (a.end === undefined) {
                    return -1;
                }
                if (b.end === undefined) {
                    return -1;
                }
                return b.end - a.end || b.originalIndex - a.originalIndex;
            }).reduce((prev, curr) => {
                if (!prev.length) {
                    // empty
                    prev.push([curr]);
                }
                else {
                    const last = prev[prev.length - 1];
                    const index = last[0].cellIndex;
                    if (curr.cellIndex === index) {
                        last.push(curr);
                    }
                    else {
                        prev.push([curr]);
                    }
                }
                return prev;
            }, []).map(editsOnSameIndex => {
                const replaceEdits = [];
                const otherEdits = [];
                editsOnSameIndex.forEach(edit => {
                    if (edit.edit.editType === 1 /* CellEditType.Replace */) {
                        replaceEdits.push(edit);
                    }
                    else {
                        otherEdits.push(edit);
                    }
                });
                return [...otherEdits.reverse(), ...replaceEdits];
            });
            const flattenEdits = edits.flat();
            for (const { edit, cellIndex } of flattenEdits) {
                switch (edit.editType) {
                    case 1 /* CellEditType.Replace */:
                        this._replaceCells(edit.index, edit.count, edit.cells, synchronous, computeUndoRedo);
                        break;
                    case 2 /* CellEditType.Output */: {
                        this._assertIndex(cellIndex);
                        const cell = this._cells[cellIndex];
                        if (edit.append) {
                            this._spliceNotebookCellOutputs(cell, { start: cell.outputs.length, deleteCount: 0, newOutputs: edit.outputs.map(op => new notebookCellOutputTextModel_1.NotebookCellOutputTextModel(op)) }, true, computeUndoRedo);
                        }
                        else {
                            this._spliceNotebookCellOutputs2(cell, edit.outputs.map(op => new notebookCellOutputTextModel_1.NotebookCellOutputTextModel(op)), computeUndoRedo);
                        }
                        break;
                    }
                    case 7 /* CellEditType.OutputItems */:
                        {
                            this._assertIndex(cellIndex);
                            const cell = this._cells[cellIndex];
                            if (edit.append) {
                                this._appendNotebookCellOutputItems(cell, edit.outputId, edit.items);
                            }
                            else {
                                this._replaceNotebookCellOutputItems(cell, edit.outputId, edit.items);
                            }
                        }
                        break;
                    case 3 /* CellEditType.Metadata */:
                        this._assertIndex(edit.index);
                        this._changeCellMetadata(this._cells[edit.index], edit.metadata, computeUndoRedo);
                        break;
                    case 8 /* CellEditType.PartialMetadata */:
                        this._assertIndex(cellIndex);
                        this._changeCellMetadataPartial(this._cells[cellIndex], edit.metadata, computeUndoRedo);
                        break;
                    case 9 /* CellEditType.PartialInternalMetadata */:
                        this._assertIndex(cellIndex);
                        this._changeCellInternalMetadataPartial(this._cells[cellIndex], edit.internalMetadata);
                        break;
                    case 4 /* CellEditType.CellLanguage */:
                        this._assertIndex(edit.index);
                        this._changeCellLanguage(this._cells[edit.index], edit.language, computeUndoRedo);
                        break;
                    case 5 /* CellEditType.DocumentMetadata */:
                        this._updateNotebookMetadata(edit.metadata, computeUndoRedo);
                        break;
                    case 6 /* CellEditType.Move */:
                        this._moveCellToIdx(edit.index, edit.length, edit.newIdx, synchronous, computeUndoRedo, undefined, undefined);
                        break;
                }
            }
        }
        _mergeCellEdits(rawEdits) {
            const mergedEdits = [];
            rawEdits.forEach(edit => {
                if (mergedEdits.length) {
                    const last = mergedEdits[mergedEdits.length - 1];
                    if (last.edit.editType === 2 /* CellEditType.Output */
                        && last.edit.append
                        && edit.edit.editType === 2 /* CellEditType.Output */
                        && edit.edit.append
                        && last.cellIndex === edit.cellIndex) {
                        last.edit.outputs = [...last.edit.outputs, ...edit.edit.outputs];
                    }
                    else if (last.edit.editType === 2 /* CellEditType.Output */
                        && !last.edit.append // last cell is not append
                        && last.edit.outputs.length === 0 // last cell is clear outputs
                        && edit.edit.editType === 2 /* CellEditType.Output */
                        && edit.edit.append
                        && last.cellIndex === edit.cellIndex) {
                        last.edit.append = false;
                        last.edit.outputs = edit.edit.outputs;
                    }
                    else {
                        mergedEdits.push(edit);
                    }
                }
                else {
                    mergedEdits.push(edit);
                }
            });
            return mergedEdits;
        }
        _getDefaultCollapseState(cellDto) {
            const defaultConfig = cellDto.cellKind === notebookCommon_1.CellKind.Code ? this._defaultCollapseConfig?.codeCell : this._defaultCollapseConfig?.markupCell;
            return cellDto.collapseState ?? (defaultConfig ?? undefined);
        }
        _replaceCells(index, count, cellDtos, synchronous, computeUndoRedo) {
            if (count === 0 && cellDtos.length === 0) {
                return;
            }
            const oldViewCells = this._cells.slice(0);
            const oldSet = new Set();
            oldViewCells.forEach(cell => {
                oldSet.add(cell.handle);
            });
            // prepare remove
            for (let i = index; i < Math.min(index + count, this._cells.length); i++) {
                const cell = this._cells[i];
                this._cellListeners.get(cell.handle)?.dispose();
                this._cellListeners.delete(cell.handle);
            }
            // prepare add
            const cells = cellDtos.map(cellDto => {
                const cellHandle = this._cellhandlePool++;
                const cellUri = notebookCommon_1.CellUri.generate(this.uri, cellHandle);
                const collapseState = this._getDefaultCollapseState(cellDto);
                const cell = new notebookCellTextModel_1.NotebookCellTextModel(cellUri, cellHandle, cellDto.source, cellDto.language, cellDto.mime, cellDto.cellKind, cellDto.outputs || [], cellDto.metadata, cellDto.internalMetadata, collapseState, this.transientOptions, this._languageService);
                const textModel = this._modelService.getModel(cellUri);
                if (textModel && textModel instanceof textModel_1.TextModel) {
                    cell.textModel = textModel;
                    cell.language = cellDto.language;
                    cell.textModel.setValue(cellDto.source);
                    cell.resetTextBuffer(cell.textModel.getTextBuffer());
                }
                const dirtyStateListener = cell.onDidChangeContent((e) => {
                    this._bindCellContentHandler(cell, e);
                });
                this._cellListeners.set(cell.handle, dirtyStateListener);
                return cell;
            });
            // compute change
            const cellsCopy = this._cells.slice(0);
            cellsCopy.splice(index, count, ...cells);
            const diffs = (0, notebookCommon_1.diff)(this._cells, cellsCopy, cell => {
                return oldSet.has(cell.handle);
            }).map(diff => {
                return [diff.start, diff.deleteCount, diff.toInsert];
            });
            this._onWillAddRemoveCells.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes: diffs } });
            // make change
            this._cells = cellsCopy;
            const undoDiff = diffs.map(diff => {
                const deletedCells = oldViewCells.slice(diff[0], diff[0] + diff[1]);
                return [diff[0], deletedCells, diff[2]];
            });
            if (computeUndoRedo) {
                this._operationManager.pushEditOperation(new cellEdit_1.SpliceCellsEdit(this.uri, undoDiff, {
                    insertCell: (index, cell, endSelections) => { this._insertNewCell(index, [cell], true, endSelections); },
                    deleteCell: (index, endSelections) => { this._removeCell(index, 1, true, endSelections); },
                    replaceCell: (index, count, cells, endSelections) => { this._replaceNewCells(index, count, cells, true, endSelections); },
                }, undefined, undefined), undefined, undefined);
            }
            // should be deferred
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes: diffs, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: undefined
            });
        }
        _increaseVersionId(transient) {
            this._versionId = this._versionId + 1;
            if (!transient) {
                this._notebookSpecificAlternativeId = this._versionId;
            }
            this._alternativeVersionId = this._generateAlternativeId();
        }
        _overwriteAlternativeVersionId(newAlternativeVersionId) {
            this._alternativeVersionId = newAlternativeVersionId;
            this._notebookSpecificAlternativeId = Number(newAlternativeVersionId.substring(0, newAlternativeVersionId.indexOf('_')));
        }
        _updateNotebookMetadata(metadata, computeUndoRedo) {
            const oldMetadata = this.metadata;
            const triggerDirtyChange = this._isDocumentMetadataChanged(this.metadata, metadata);
            if (triggerDirtyChange) {
                if (computeUndoRedo) {
                    const that = this;
                    this._operationManager.pushEditOperation(new class {
                        constructor() {
                            this.type = 0 /* UndoRedoElementType.Resource */;
                            this.label = 'Update Notebook Metadata';
                            this.code = 'undoredo.notebooks.updateCellMetadata';
                        }
                        get resource() {
                            return that.uri;
                        }
                        undo() {
                            that._updateNotebookMetadata(oldMetadata, false);
                        }
                        redo() {
                            that._updateNotebookMetadata(metadata, false);
                        }
                    }(), undefined, undefined);
                }
            }
            this.metadata = metadata;
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeDocumentMetadata, metadata: this.metadata, transient: !triggerDirtyChange }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        _insertNewCell(index, cells, synchronous, endSelections) {
            for (let i = 0; i < cells.length; i++) {
                const dirtyStateListener = cells[i].onDidChangeContent((e) => {
                    this._bindCellContentHandler(cells[i], e);
                });
                this._cellListeners.set(cells[i].handle, dirtyStateListener);
            }
            const changes = [[index, 0, cells]];
            this._onWillAddRemoveCells.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes } });
            this._cells.splice(index, 0, ...cells);
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
            return;
        }
        _removeCell(index, count, synchronous, endSelections) {
            for (let i = index; i < index + count; i++) {
                const cell = this._cells[i];
                this._cellListeners.get(cell.handle)?.dispose();
                this._cellListeners.delete(cell.handle);
            }
            const changes = [[index, count, []]];
            this._onWillAddRemoveCells.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes } });
            this._cells.splice(index, count);
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
        }
        _replaceNewCells(index, count, cells, synchronous, endSelections) {
            for (let i = index; i < index + count; i++) {
                const cell = this._cells[i];
                this._cellListeners.get(cell.handle)?.dispose();
                this._cellListeners.delete(cell.handle);
            }
            for (let i = 0; i < cells.length; i++) {
                const dirtyStateListener = cells[i].onDidChangeContent((e) => {
                    this._bindCellContentHandler(cells[i], e);
                });
                this._cellListeners.set(cells[i].handle, dirtyStateListener);
            }
            const changes = [[index, count, cells]];
            this._onWillAddRemoveCells.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes } });
            this._cells.splice(index, count, ...cells);
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
        }
        _isDocumentMetadataChanged(a, b) {
            const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
            for (const key of keys) {
                if (key === 'custom') {
                    if (!this._customMetadataEqual(a[key], b[key])
                        &&
                            !(this.transientOptions.transientDocumentMetadata[key])) {
                        return true;
                    }
                }
                else if ((a[key] !== b[key])
                    &&
                        !(this.transientOptions.transientDocumentMetadata[key])) {
                    return true;
                }
            }
            return false;
        }
        _isCellMetadataChanged(a, b) {
            const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
            for (const key of keys) {
                if ((a[key] !== b[key])
                    &&
                        !(this.transientOptions.transientCellMetadata[key])) {
                    return true;
                }
            }
            return false;
        }
        _customMetadataEqual(a, b) {
            if (!a && !b) {
                // both of them are nullish or undefined
                return true;
            }
            if (!a || !b) {
                return false;
            }
            const aProps = Object.getOwnPropertyNames(a);
            const bProps = Object.getOwnPropertyNames(b);
            if (aProps.length !== bProps.length) {
                return false;
            }
            for (let i = 0; i < aProps.length; i++) {
                const propName = aProps[i];
                if (a[propName] !== b[propName]) {
                    return false;
                }
            }
            return true;
        }
        _changeCellMetadataPartial(cell, metadata, computeUndoRedo) {
            const newMetadata = {
                ...cell.metadata
            };
            let k;
            for (k in metadata) {
                const value = metadata[k] ?? undefined;
                newMetadata[k] = value;
            }
            return this._changeCellMetadata(cell, newMetadata, computeUndoRedo);
        }
        _changeCellMetadata(cell, metadata, computeUndoRedo) {
            const triggerDirtyChange = this._isCellMetadataChanged(cell.metadata, metadata);
            if (triggerDirtyChange) {
                if (computeUndoRedo) {
                    const index = this._cells.indexOf(cell);
                    this._operationManager.pushEditOperation(new cellEdit_1.CellMetadataEdit(this.uri, index, Object.freeze(cell.metadata), Object.freeze(metadata), {
                        updateCellMetadata: (index, newMetadata) => {
                            const cell = this._cells[index];
                            if (!cell) {
                                return;
                            }
                            this._changeCellMetadata(cell, newMetadata, false);
                        }
                    }), undefined, undefined);
                }
            }
            // should be deferred
            cell.metadata = metadata;
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata, index: this._cells.indexOf(cell), metadata: cell.metadata, transient: !triggerDirtyChange }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        _changeCellInternalMetadataPartial(cell, internalMetadata) {
            const newInternalMetadata = {
                ...cell.internalMetadata
            };
            let k;
            for (k in internalMetadata) {
                const value = internalMetadata[k] ?? undefined;
                newInternalMetadata[k] = value;
            }
            cell.internalMetadata = newInternalMetadata;
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellInternalMetadata, index: this._cells.indexOf(cell), internalMetadata: cell.internalMetadata, transient: true }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        _changeCellLanguage(cell, languageId, computeUndoRedo) {
            if (cell.language === languageId) {
                return;
            }
            const oldLanguage = cell.language;
            cell.language = languageId;
            if (computeUndoRedo) {
                const that = this;
                this._operationManager.pushEditOperation(new class {
                    constructor() {
                        this.type = 0 /* UndoRedoElementType.Resource */;
                        this.label = 'Update Cell Language';
                        this.code = 'undoredo.notebooks.updateCellLanguage';
                    }
                    get resource() {
                        return that.uri;
                    }
                    undo() {
                        that._changeCellLanguage(cell, oldLanguage, false);
                    }
                    redo() {
                        that._changeCellLanguage(cell, languageId, false);
                    }
                }(), undefined, undefined);
            }
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage, index: this._cells.indexOf(cell), language: languageId, transient: false }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        _spliceNotebookCellOutputs2(cell, outputs, computeUndoRedo) {
            if (outputs.length === 0 && cell.outputs.length === 0) {
                return;
            }
            if (outputs.length <= 1) {
                this._spliceNotebookCellOutputs(cell, { start: 0, deleteCount: cell.outputs.length, newOutputs: outputs }, false, computeUndoRedo);
                return;
            }
            const diff = new diff_1.LcsDiff(new OutputSequence(cell.outputs), new OutputSequence(outputs));
            const diffResult = diff.ComputeDiff(false);
            const splices = diffResult.changes.map(change => ({ start: change.originalStart, deleteCount: change.originalLength, newOutputs: outputs.slice(change.modifiedStart, change.modifiedStart + change.modifiedLength) }));
            splices.reverse().forEach(splice => {
                this._spliceNotebookCellOutputs(cell, splice, false, computeUndoRedo);
            });
        }
        _spliceNotebookCellOutputs(cell, splice, append, computeUndoRedo) {
            cell.spliceNotebookCellOutputs(splice);
            this._pauseableEmitter.fire({
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.Output,
                        index: this._cells.indexOf(cell),
                        outputs: cell.outputs.map(output => output.asDto()) ?? [],
                        append,
                        transient: this.transientOptions.transientOutputs,
                    }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        _appendNotebookCellOutputItems(cell, outputId, items) {
            if (cell.changeOutputItems(outputId, true, items)) {
                this._pauseableEmitter.fire({
                    rawEvents: [{
                            kind: notebookCommon_1.NotebookCellsChangeType.OutputItem,
                            index: this._cells.indexOf(cell),
                            outputId: outputId,
                            outputItems: items,
                            append: true,
                            transient: this.transientOptions.transientOutputs
                        }],
                    versionId: this.versionId,
                    synchronous: true,
                    endSelectionState: undefined
                });
            }
        }
        _replaceNotebookCellOutputItems(cell, outputId, items) {
            if (cell.changeOutputItems(outputId, false, items)) {
                this._pauseableEmitter.fire({
                    rawEvents: [{
                            kind: notebookCommon_1.NotebookCellsChangeType.OutputItem,
                            index: this._cells.indexOf(cell),
                            outputId: outputId,
                            outputItems: items,
                            append: false,
                            transient: this.transientOptions.transientOutputs
                        }],
                    versionId: this.versionId,
                    synchronous: true,
                    endSelectionState: undefined
                });
            }
        }
        _moveCellToIdx(index, length, newIdx, synchronous, pushedToUndoStack, beforeSelections, endSelections) {
            if (pushedToUndoStack) {
                this._operationManager.pushEditOperation(new cellEdit_1.MoveCellEdit(this.uri, index, length, newIdx, {
                    moveCell: (fromIndex, length, toIndex, beforeSelections, endSelections) => {
                        this._moveCellToIdx(fromIndex, length, toIndex, true, false, beforeSelections, endSelections);
                    },
                }, beforeSelections, endSelections), beforeSelections, endSelections);
            }
            this._assertIndex(index);
            this._assertIndex(newIdx);
            const cells = this._cells.splice(index, length);
            this._cells.splice(newIdx, 0, ...cells);
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.Move, index, length, newIdx, cells, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
            return true;
        }
        _assertIndex(index) {
            if (this._indexIsInvalid(index)) {
                throw new Error(`model index out of range ${index}`);
            }
        }
        _indexIsInvalid(index) {
            return index < 0 || index >= this._cells.length;
        }
    };
    exports.NotebookTextModel = NotebookTextModel;
    exports.NotebookTextModel = NotebookTextModel = NotebookTextModel_1 = __decorate([
        __param(5, undoRedo_1.IUndoRedoService),
        __param(6, model_1.IModelService),
        __param(7, language_1.ILanguageService)
    ], NotebookTextModel);
    class OutputSequence {
        constructor(outputs) {
            this.outputs = outputs;
        }
        getElements() {
            return this.outputs.map(output => {
                return (0, hash_1.hash)(output.outputs.map(output => ({
                    mime: output.mime,
                    data: output.data
                })));
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tUZXh0TW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9jb21tb24vbW9kZWwvbm90ZWJvb2tUZXh0TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXFCaEcsTUFBTSxjQUFjO1FBV25CLFlBQ1UsU0FBNEIsRUFDNUIsS0FBYSxFQUNiLGFBQXdDLEVBQ3pDLGlCQUFrRSxFQUNsRSxhQUFxRCxFQUM3RCxjQUEyQyxFQUMzQyx5QkFBaUM7WUFOeEIsY0FBUyxHQUFULFNBQVMsQ0FBbUI7WUFDNUIsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNiLGtCQUFhLEdBQWIsYUFBYSxDQUEyQjtZQUN6QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWlEO1lBQ2xFLGtCQUFhLEdBQWIsYUFBYSxDQUF3QztZQWJyRCxTQUFJLEdBQUcsbUNBQW1DLENBQUM7WUFFNUMsZ0JBQVcsR0FBdUIsRUFBRSxDQUFDO1lBQ3JDLHlCQUFvQixHQUFnQyxTQUFTLENBQUM7WUFDOUQsMEJBQXFCLEdBQWdDLFNBQVMsQ0FBQztZQWF0RSxJQUFJLENBQUMsSUFBSSx3Q0FBZ0MsQ0FBQztZQUMxQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsY0FBYyxDQUFDO1lBQzNDLElBQUksQ0FBQywwQkFBMEIsR0FBRyx5QkFBeUIsQ0FBQztZQUM1RCxJQUFJLENBQUMsMkJBQTJCLEdBQUcseUJBQXlCLENBQUM7UUFDOUQsQ0FBQztRQUNELElBQUksU0FBUztZQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsWUFB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