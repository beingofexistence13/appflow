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
    var $MH_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MH = void 0;
    class StackOperation {
        constructor(textModel, label, undoRedoGroup, l, m, selectionState, beginAlternativeVersionId) {
            this.textModel = textModel;
            this.label = label;
            this.undoRedoGroup = undoRedoGroup;
            this.l = l;
            this.m = m;
            this.code = 'undoredo.notebooks.stackOperation';
            this.d = [];
            this.f = undefined;
            this.g = undefined;
            this.type = 1 /* UndoRedoElementType.Workspace */;
            this.f = selectionState;
            this.h = beginAlternativeVersionId;
            this.j = beginAlternativeVersionId;
        }
        get resources() {
            return [this.textModel.uri];
        }
        get isEmpty() {
            return this.d.length === 0;
        }
        pushEndState(alternativeVersionId, selectionState) {
            this.j = alternativeVersionId;
            this.g = selectionState;
        }
        pushEditOperation(element, beginSelectionState, resultSelectionState) {
            if (this.d.length === 0) {
                this.f = this.f ?? beginSelectionState;
            }
            this.d.push(element);
            this.g = resultSelectionState;
        }
        async undo() {
            this.l.pause();
            for (let i = this.d.length - 1; i >= 0; i--) {
                await this.d[i].undo();
            }
            this.m(this.h);
            this.l.fire({
                rawEvents: [],
                synchronous: undefined,
                versionId: this.textModel.versionId,
                endSelectionState: this.f
            });
            this.l.resume();
        }
        async redo() {
            this.l.pause();
            for (let i = 0; i < this.d.length; i++) {
                await this.d[i].redo();
            }
            this.m(this.j);
            this.l.fire({
                rawEvents: [],
                synchronous: undefined,
                versionId: this.textModel.versionId,
                endSelectionState: this.g
            });
            this.l.resume();
        }
    }
    class NotebookOperationManager {
        constructor(f, g, h, j) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.d = null;
        }
        isUndoStackEmpty() {
            return this.d === null || this.d.isEmpty;
        }
        pushStackElement(label, selectionState, undoRedoGroup, alternativeVersionId) {
            if (this.d) {
                this.d.pushEndState(alternativeVersionId, selectionState);
                if (!this.d.isEmpty) {
                    this.g.pushElement(this.d, this.d.undoRedoGroup);
                }
                this.d = null;
                return;
            }
            this.d = new StackOperation(this.f, label, undoRedoGroup, this.h, this.j, selectionState, alternativeVersionId);
        }
        pushEditOperation(element, beginSelectionState, resultSelectionState) {
            if (this.d) {
                this.d.pushEditOperation(element, beginSelectionState, resultSelectionState);
                return;
            }
            this.g.pushElement(element);
        }
    }
    class NotebookEventEmitter extends event_1.$id {
        isDirtyEvent() {
            for (const e of this.s) {
                for (let i = 0; i < e.rawEvents.length; i++) {
                    if (!e.rawEvents[i].transient) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    let $MH = $MH_1 = class $MH extends lifecycle_1.$kc {
        get length() {
            return this.r.length;
        }
        get cells() {
            return this.r;
        }
        get versionId() {
            return this.t;
        }
        get alternativeVersionId() {
            return this.w;
        }
        constructor(viewType, uri, cells, metadata, options, C, D, F) {
            super();
            this.viewType = viewType;
            this.uri = uri;
            this.C = C;
            this.D = D;
            this.F = F;
            this.f = false;
            this.g = this.B(new event_1.$fd());
            this.h = this.B(new event_1.$fd());
            this.j = this.B(new event_1.$fd());
            this.onWillDispose = this.g.event;
            this.onWillAddRemoveCells = this.h.event;
            this.onDidChangeContent = this.j.event;
            this.m = 0;
            this.n = new Map();
            this.r = [];
            this.metadata = {};
            this.transientOptions = { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} };
            this.t = 0;
            /**
             * This alternative id is only for non-cell-content changes.
             */
            this.u = 0;
            /**
             * Unlike, versionId, this can go down (via undo) or go to previous values (via redo)
             */
            this.w = '1';
            this.transientOptions = options;
            this.metadata = metadata;
            this._initialize(cells);
            const maybeUpdateCellTextModel = (textModel) => {
                if (textModel.uri.scheme === network_1.Schemas.vscodeNotebookCell && textModel instanceof textModel_1.$MC) {
                    const cellUri = notebookCommon_1.CellUri.parse(textModel.uri);
                    if (cellUri && (0, resources_1.$bg)(cellUri.notebook, this.uri)) {
                        const cellIdx = this.I(cellUri.handle);
                        if (cellIdx >= 0) {
                            const cell = this.cells[cellIdx];
                            if (cell) {
                                cell.textModel = textModel;
                            }
                        }
                    }
                }
            };
            this.B(D.onModelAdded(e => maybeUpdateCellTextModel(e)));
            this.z = new NotebookEventEmitter({
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
            this.B(this.z.event(e => {
                if (e.rawEvents.length) {
                    this.j.fire(e);
                }
            }));
            this.y = new NotebookOperationManager(this, this.C, this.z, (alternativeVersionId) => {
                this.U(true);
                this.W(alternativeVersionId);
            });
        }
        setCellCollapseDefault(collapseConfig) {
            this.s = collapseConfig;
        }
        _initialize(cells, triggerDirty) {
            this.r = [];
            this.t = 0;
            this.u = 0;
            const mainCells = cells.map(cell => {
                const cellHandle = this.m++;
                const cellUri = notebookCommon_1.CellUri.generate(this.uri, cellHandle);
                const collapseState = this.R(cell);
                return new notebookCellTextModel_1.$HH(cellUri, cellHandle, cell.source, cell.language, cell.mime, cell.cellKind, cell.outputs, cell.metadata, cell.internalMetadata, collapseState, this.transientOptions, this.F);
            });
            for (let i = 0; i < mainCells.length; i++) {
                const dirtyStateListener = mainCells[i].onDidChangeContent((e) => {
                    this.G(mainCells[i], e);
                });
                this.n.set(mainCells[i].handle, dirtyStateListener);
                this.B(mainCells[i]);
            }
            this.r.splice(0, 0, ...mainCells);
            this.w = this.H();
            if (triggerDirty) {
                this.z.fire({
                    rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.Unknown, transient: false }],
                    versionId: this.versionId,
                    synchronous: true,
                    endSelectionState: undefined
                });
            }
        }
        G(cell, e) {
            this.U(e === 'content');
            switch (e) {
                case 'content':
                    this.z.fire({
                        rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellContent, index: this.I(cell.handle), transient: false }],
                        versionId: this.versionId,
                        synchronous: true,
                        endSelectionState: undefined
                    });
                    break;
                case 'language':
                    this.z.fire({
                        rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage, index: this.I(cell.handle), language: cell.language, transient: false }],
                        versionId: this.versionId,
                        synchronous: true,
                        endSelectionState: undefined
                    });
                    break;
                case 'mime':
                    this.z.fire({
                        rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellMime, index: this.I(cell.handle), mime: cell.mime, transient: false }],
                        versionId: this.versionId,
                        synchronous: true,
                        endSelectionState: undefined
                    });
                    break;
            }
        }
        H() {
            return `${this.u}_` + this.cells.map(cell => cell.handle + ',' + cell.alternativeId).join(';');
        }
        dispose() {
            if (this.f) {
                // NotebookEditorModel can be disposed twice, don't fire onWillDispose again
                return;
            }
            this.f = true;
            this.g.fire();
            this.C.removeElements(this.uri);
            (0, lifecycle_1.$fc)(this.n.values());
            this.n.clear();
            (0, lifecycle_1.$fc)(this.r);
            this.r = [];
            super.dispose();
        }
        pushStackElement(label, selectionState, undoRedoGroup) {
            this.y.pushStackElement(label, selectionState, undoRedoGroup, this.alternativeVersionId);
        }
        I(handle) {
            return this.cells.findIndex(c => c.handle === handle);
        }
        J(outputId, rawEdits) {
            const edit = rawEdits.find(e => 'outputs' in e && e.outputs.some(o => o.outputId === outputId));
            if (edit) {
                if ('index' in edit) {
                    return edit.index;
                }
                else if ('handle' in edit) {
                    const cellIndex = this.I(edit.handle);
                    this.mb(cellIndex);
                    return cellIndex;
                }
            }
            return -1;
        }
        L(outputId) {
            return this.cells.findIndex(c => !!c.outputs.find(o => o.outputId === outputId));
        }
        reset(cells, metadata, transientOptions) {
            this.transientOptions = transientOptions;
            const edits = $MH_1.computeEdits(this, cells);
            this.applyEdits([
                ...edits,
                { editType: 5 /* CellEditType.DocumentMetadata */, metadata }
            ], true, undefined, () => undefined, undefined, false);
        }
        static computeEdits(model, cells) {
            const edits = [];
            const commonPrefix = this.N(model.cells, model.cells.length, 0, cells, cells.length, 0);
            if (commonPrefix > 0) {
                for (let i = 0; i < commonPrefix; i++) {
                    edits.push({
                        editType: 3 /* CellEditType.Metadata */,
                        index: i,
                        metadata: cells[i].metadata ?? {}
                    }, ...this.M(i, model.cells[i].outputs, cells[i].outputs));
                }
            }
            if (model.cells.length === cells.length && commonPrefix === model.cells.length) {
                return edits;
            }
            const commonSuffix = this.O(model.cells, model.cells.length - commonPrefix, commonPrefix, cells, cells.length - commonPrefix, commonPrefix);
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
                    }, ...this.M(model.cells.length - i, model.cells[model.cells.length - i].outputs, cells[cells.length - i].outputs));
                }
            }
            return edits;
        }
        static M(index, a, b) {
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
        static N(a, aLen, aDelta, b, bLen, bDelta) {
            const maxResult = Math.min(aLen, bLen);
            let result = 0;
            for (let i = 0; i < maxResult && a[aDelta + i].fastEqual(b[bDelta + i]); i++) {
                result++;
            }
            return result;
        }
        static O(a, aLen, aDelta, b, bLen, bDelta) {
            const maxResult = Math.min(aLen, bLen);
            let result = 0;
            for (let i = 0; i < maxResult && a[aDelta + aLen - i - 1].fastEqual(b[bDelta + bLen - i - 1]); i++) {
                result++;
            }
            return result;
        }
        applyEdits(rawEdits, synchronous, beginSelectionState, endSelectionsComputer, undoRedoGroup, computeUndoRedo) {
            this.z.pause();
            this.pushStackElement('edit', beginSelectionState, undoRedoGroup);
            try {
                this.P(rawEdits, synchronous, computeUndoRedo);
                return true;
            }
            finally {
                // Update selection and versionId after applying edits.
                const endSelections = endSelectionsComputer();
                this.U(this.y.isUndoStackEmpty() && !this.z.isDirtyEvent());
                // Finalize undo element
                this.pushStackElement('edit', endSelections, undefined);
                // Broadcast changes
                this.z.fire({ rawEvents: [], versionId: this.versionId, synchronous: synchronous, endSelectionState: endSelections });
                this.z.resume();
            }
        }
        P(rawEdits, synchronous, computeUndoRedo) {
            const editsWithDetails = rawEdits.map((edit, index) => {
                let cellIndex = -1;
                if ('index' in edit) {
                    cellIndex = edit.index;
                }
                else if ('handle' in edit) {
                    cellIndex = this.I(edit.handle);
                    this.mb(cellIndex);
                }
                else if ('outputId' in edit) {
                    cellIndex = this.L(edit.outputId);
                    if (this.nb(cellIndex)) {
                        // The referenced output may have been created in this batch of edits
                        cellIndex = this.J(edit.outputId, rawEdits.slice(0, index));
                    }
                    if (this.nb(cellIndex)) {
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
            }).filter(types_1.$rf);
            // compress all edits which have no side effects on cell index
            const edits = this.Q(editsWithDetails)
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
                        this.S(edit.index, edit.count, edit.cells, synchronous, computeUndoRedo);
                        break;
                    case 2 /* CellEditType.Output */: {
                        this.mb(cellIndex);
                        const cell = this.r[cellIndex];
                        if (edit.append) {
                            this.ib(cell, { start: cell.outputs.length, deleteCount: 0, newOutputs: edit.outputs.map(op => new notebookCellOutputTextModel_1.$GH(op)) }, true, computeUndoRedo);
                        }
                        else {
                            this.hb(cell, edit.outputs.map(op => new notebookCellOutputTextModel_1.$GH(op)), computeUndoRedo);
                        }
                        break;
                    }
                    case 7 /* CellEditType.OutputItems */:
                        {
                            this.mb(cellIndex);
                            const cell = this.r[cellIndex];
                            if (edit.append) {
                                this.jb(cell, edit.outputId, edit.items);
                            }
                            else {
                                this.kb(cell, edit.outputId, edit.items);
                            }
                        }
                        break;
                    case 3 /* CellEditType.Metadata */:
                        this.mb(edit.index);
                        this.eb(this.r[edit.index], edit.metadata, computeUndoRedo);
                        break;
                    case 8 /* CellEditType.PartialMetadata */:
                        this.mb(cellIndex);
                        this.db(this.r[cellIndex], edit.metadata, computeUndoRedo);
                        break;
                    case 9 /* CellEditType.PartialInternalMetadata */:
                        this.mb(cellIndex);
                        this.fb(this.r[cellIndex], edit.internalMetadata);
                        break;
                    case 4 /* CellEditType.CellLanguage */:
                        this.mb(edit.index);
                        this.gb(this.r[edit.index], edit.language, computeUndoRedo);
                        break;
                    case 5 /* CellEditType.DocumentMetadata */:
                        this.X(edit.metadata, computeUndoRedo);
                        break;
                    case 6 /* CellEditType.Move */:
                        this.lb(edit.index, edit.length, edit.newIdx, synchronous, computeUndoRedo, undefined, undefined);
                        break;
                }
            }
        }
        Q(rawEdits) {
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
        R(cellDto) {
            const defaultConfig = cellDto.cellKind === notebookCommon_1.CellKind.Code ? this.s?.codeCell : this.s?.markupCell;
            return cellDto.collapseState ?? (defaultConfig ?? undefined);
        }
        S(index, count, cellDtos, synchronous, computeUndoRedo) {
            if (count === 0 && cellDtos.length === 0) {
                return;
            }
            const oldViewCells = this.r.slice(0);
            const oldSet = new Set();
            oldViewCells.forEach(cell => {
                oldSet.add(cell.handle);
            });
            // prepare remove
            for (let i = index; i < Math.min(index + count, this.r.length); i++) {
                const cell = this.r[i];
                this.n.get(cell.handle)?.dispose();
                this.n.delete(cell.handle);
            }
            // prepare add
            const cells = cellDtos.map(cellDto => {
                const cellHandle = this.m++;
                const cellUri = notebookCommon_1.CellUri.generate(this.uri, cellHandle);
                const collapseState = this.R(cellDto);
                const cell = new notebookCellTextModel_1.$HH(cellUri, cellHandle, cellDto.source, cellDto.language, cellDto.mime, cellDto.cellKind, cellDto.outputs || [], cellDto.metadata, cellDto.internalMetadata, collapseState, this.transientOptions, this.F);
                const textModel = this.D.getModel(cellUri);
                if (textModel && textModel instanceof textModel_1.$MC) {
                    cell.textModel = textModel;
                    cell.language = cellDto.language;
                    cell.textModel.setValue(cellDto.source);
                    cell.resetTextBuffer(cell.textModel.getTextBuffer());
                }
                const dirtyStateListener = cell.onDidChangeContent((e) => {
                    this.G(cell, e);
                });
                this.n.set(cell.handle, dirtyStateListener);
                return cell;
            });
            // compute change
            const cellsCopy = this.r.slice(0);
            cellsCopy.splice(index, count, ...cells);
            const diffs = (0, notebookCommon_1.$2H)(this.r, cellsCopy, cell => {
                return oldSet.has(cell.handle);
            }).map(diff => {
                return [diff.start, diff.deleteCount, diff.toInsert];
            });
            this.h.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes: diffs } });
            // make change
            this.r = cellsCopy;
            const undoDiff = diffs.map(diff => {
                const deletedCells = oldViewCells.slice(diff[0], diff[0] + diff[1]);
                return [diff[0], deletedCells, diff[2]];
            });
            if (computeUndoRedo) {
                this.y.pushEditOperation(new cellEdit_1.$KH(this.uri, undoDiff, {
                    insertCell: (index, cell, endSelections) => { this.Y(index, [cell], true, endSelections); },
                    deleteCell: (index, endSelections) => { this.Z(index, 1, true, endSelections); },
                    replaceCell: (index, count, cells, endSelections) => { this.$(index, count, cells, true, endSelections); },
                }, undefined, undefined), undefined, undefined);
            }
            // should be deferred
            this.z.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes: diffs, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: undefined
            });
        }
        U(transient) {
            this.t = this.t + 1;
            if (!transient) {
                this.u = this.t;
            }
            this.w = this.H();
        }
        W(newAlternativeVersionId) {
            this.w = newAlternativeVersionId;
            this.u = Number(newAlternativeVersionId.substring(0, newAlternativeVersionId.indexOf('_')));
        }
        X(metadata, computeUndoRedo) {
            const oldMetadata = this.metadata;
            const triggerDirtyChange = this.ab(this.metadata, metadata);
            if (triggerDirtyChange) {
                if (computeUndoRedo) {
                    const that = this;
                    this.y.pushEditOperation(new class {
                        constructor() {
                            this.type = 0 /* UndoRedoElementType.Resource */;
                            this.label = 'Update Notebook Metadata';
                            this.code = 'undoredo.notebooks.updateCellMetadata';
                        }
                        get resource() {
                            return that.uri;
                        }
                        undo() {
                            that.X(oldMetadata, false);
                        }
                        redo() {
                            that.X(metadata, false);
                        }
                    }(), undefined, undefined);
                }
            }
            this.metadata = metadata;
            this.z.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeDocumentMetadata, metadata: this.metadata, transient: !triggerDirtyChange }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        Y(index, cells, synchronous, endSelections) {
            for (let i = 0; i < cells.length; i++) {
                const dirtyStateListener = cells[i].onDidChangeContent((e) => {
                    this.G(cells[i], e);
                });
                this.n.set(cells[i].handle, dirtyStateListener);
            }
            const changes = [[index, 0, cells]];
            this.h.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes } });
            this.r.splice(index, 0, ...cells);
            this.z.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
            return;
        }
        Z(index, count, synchronous, endSelections) {
            for (let i = index; i < index + count; i++) {
                const cell = this.r[i];
                this.n.get(cell.handle)?.dispose();
                this.n.delete(cell.handle);
            }
            const changes = [[index, count, []]];
            this.h.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes } });
            this.r.splice(index, count);
            this.z.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
        }
        $(index, count, cells, synchronous, endSelections) {
            for (let i = index; i < index + count; i++) {
                const cell = this.r[i];
                this.n.get(cell.handle)?.dispose();
                this.n.delete(cell.handle);
            }
            for (let i = 0; i < cells.length; i++) {
                const dirtyStateListener = cells[i].onDidChangeContent((e) => {
                    this.G(cells[i], e);
                });
                this.n.set(cells[i].handle, dirtyStateListener);
            }
            const changes = [[index, count, cells]];
            this.h.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes } });
            this.r.splice(index, count, ...cells);
            this.z.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
        }
        ab(a, b) {
            const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
            for (const key of keys) {
                if (key === 'custom') {
                    if (!this.cb(a[key], b[key])
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
        bb(a, b) {
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
        cb(a, b) {
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
        db(cell, metadata, computeUndoRedo) {
            const newMetadata = {
                ...cell.metadata
            };
            let k;
            for (k in metadata) {
                const value = metadata[k] ?? undefined;
                newMetadata[k] = value;
            }
            return this.eb(cell, newMetadata, computeUndoRedo);
        }
        eb(cell, metadata, computeUndoRedo) {
            const triggerDirtyChange = this.bb(cell.metadata, metadata);
            if (triggerDirtyChange) {
                if (computeUndoRedo) {
                    const index = this.r.indexOf(cell);
                    this.y.pushEditOperation(new cellEdit_1.$LH(this.uri, index, Object.freeze(cell.metadata), Object.freeze(metadata), {
                        updateCellMetadata: (index, newMetadata) => {
                            const cell = this.r[index];
                            if (!cell) {
                                return;
                            }
                            this.eb(cell, newMetadata, false);
                        }
                    }), undefined, undefined);
                }
            }
            // should be deferred
            cell.metadata = metadata;
            this.z.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata, index: this.r.indexOf(cell), metadata: cell.metadata, transient: !triggerDirtyChange }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        fb(cell, internalMetadata) {
            const newInternalMetadata = {
                ...cell.internalMetadata
            };
            let k;
            for (k in internalMetadata) {
                const value = internalMetadata[k] ?? undefined;
                newInternalMetadata[k] = value;
            }
            cell.internalMetadata = newInternalMetadata;
            this.z.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellInternalMetadata, index: this.r.indexOf(cell), internalMetadata: cell.internalMetadata, transient: true }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        gb(cell, languageId, computeUndoRedo) {
            if (cell.language === languageId) {
                return;
            }
            const oldLanguage = cell.language;
            cell.language = languageId;
            if (computeUndoRedo) {
                const that = this;
                this.y.pushEditOperation(new class {
                    constructor() {
                        this.type = 0 /* UndoRedoElementType.Resource */;
                        this.label = 'Update Cell Language';
                        this.code = 'undoredo.notebooks.updateCellLanguage';
                    }
                    get resource() {
                        return that.uri;
                    }
                    undo() {
                        that.gb(cell, oldLanguage, false);
                    }
                    redo() {
                        that.gb(cell, languageId, false);
                    }
                }(), undefined, undefined);
            }
            this.z.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage, index: this.r.indexOf(cell), language: languageId, transient: false }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        hb(cell, outputs, computeUndoRedo) {
            if (outputs.length === 0 && cell.outputs.length === 0) {
                return;
            }
            if (outputs.length <= 1) {
                this.ib(cell, { start: 0, deleteCount: cell.outputs.length, newOutputs: outputs }, false, computeUndoRedo);
                return;
            }
            const diff = new diff_1.$qs(new OutputSequence(cell.outputs), new OutputSequence(outputs));
            const diffResult = diff.ComputeDiff(false);
            const splices = diffResult.changes.map(change => ({ start: change.originalStart, deleteCount: change.originalLength, newOutputs: outputs.slice(change.modifiedStart, change.modifiedStart + change.modifiedLength) }));
            splices.reverse().forEach(splice => {
                this.ib(cell, splice, false, computeUndoRedo);
            });
        }
        ib(cell, splice, append, computeUndoRedo) {
            cell.spliceNotebookCellOutputs(splice);
            this.z.fire({
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.Output,
                        index: this.r.indexOf(cell),
                        outputs: cell.outputs.map(output => output.asDto()) ?? [],
                        append,
                        transient: this.transientOptions.transientOutputs,
                    }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        jb(cell, outputId, items) {
            if (cell.changeOutputItems(outputId, true, items)) {
                this.z.fire({
                    rawEvents: [{
                            kind: notebookCommon_1.NotebookCellsChangeType.OutputItem,
                            index: this.r.indexOf(cell),
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
        kb(cell, outputId, items) {
            if (cell.changeOutputItems(outputId, false, items)) {
                this.z.fire({
                    rawEvents: [{
                            kind: notebookCommon_1.NotebookCellsChangeType.OutputItem,
                            index: this.r.indexOf(cell),
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
        lb(index, length, newIdx, synchronous, pushedToUndoStack, beforeSelections, endSelections) {
            if (pushedToUndoStack) {
                this.y.pushEditOperation(new cellEdit_1.$JH(this.uri, index, length, newIdx, {
                    moveCell: (fromIndex, length, toIndex, beforeSelections, endSelections) => {
                        this.lb(fromIndex, length, toIndex, true, false, beforeSelections, endSelections);
                    },
                }, beforeSelections, endSelections), beforeSelections, endSelections);
            }
            this.mb(index);
            this.mb(newIdx);
            const cells = this.r.splice(index, length);
            this.r.splice(newIdx, 0, ...cells);
            this.z.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.Move, index, length, newIdx, cells, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
            return true;
        }
        mb(index) {
            if (this.nb(index)) {
                throw new Error(`model index out of range ${index}`);
            }
        }
        nb(index) {
            return index < 0 || index >= this.r.length;
        }
    };
    exports.$MH = $MH;
    exports.$MH = $MH = $MH_1 = __decorate([
        __param(5, undoRedo_1.$wu),
        __param(6, model_1.$yA),
        __param(7, language_1.$ct)
    ], $MH);
    class OutputSequence {
        constructor(outputs) {
            this.outputs = outputs;
        }
        getElements() {
            return this.outputs.map(output => {
                return (0, hash_1.$pi)(output.outputs.map(output => ({
                    mime: output.mime,
                    data: output.data
                })));
            });
        }
    }
});
//# sourceMappingURL=notebookTextModel.js.map