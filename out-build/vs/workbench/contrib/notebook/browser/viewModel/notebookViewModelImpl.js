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
define(["require", "exports", "vs/base/common/collections", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/strings", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/editor/common/model/editStack", "vs/editor/common/model/intervalTree", "vs/editor/common/model/textModel", "vs/editor/common/services/resolverService", "vs/platform/instantiation/common/instantiation", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/viewModel/cellSelectionCollection", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/browser/notebookViewEvents", "vs/workbench/contrib/notebook/browser/contrib/find/findModel", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, collections_1, errors_1, event_1, lifecycle_1, numbers_1, strings, bulkEditService_1, range_1, editStack_1, intervalTree_1, textModel_1, resolverService_1, instantiation_1, undoRedo_1, notebookBrowser_1, cellSelectionCollection_1, codeCellViewModel_1, markupCellViewModel_1, notebookCommon_1, notebookRange_1, notebookViewEvents_1, findModel_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Aob = exports.$zob = void 0;
    const invalidFunc = () => { throw new Error(`Invalid change accessor`); };
    class DecorationsTree {
        constructor() {
            this.a = new intervalTree_1.$6B();
        }
        intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations = false) {
            const r1 = this.a.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            return r1;
        }
        search(filterOwnerId, filterOutValidation, overviewRulerOnly, cachedVersionId, onlyMarginDecorations) {
            return this.a.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
        }
        collectNodesFromOwner(ownerId) {
            const r1 = this.a.collectNodesFromOwner(ownerId);
            return r1;
        }
        collectNodesPostOrder() {
            const r1 = this.a.collectNodesPostOrder();
            return r1;
        }
        insert(node) {
            this.a.insert(node);
        }
        delete(node) {
            this.a.delete(node);
        }
        resolveNode(node, cachedVersionId) {
            this.a.resolveNode(node, cachedVersionId);
        }
        acceptReplace(offset, length, textLength, forceMoveMarkers) {
            this.a.acceptReplace(offset, length, textLength, forceMoveMarkers);
        }
    }
    const TRACKED_RANGE_OPTIONS = [
        textModel_1.$RC.register({ description: 'notebook-view-model-tracked-range-always-grows-when-typing-at-edges', stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */ }),
        textModel_1.$RC.register({ description: 'notebook-view-model-tracked-range-never-grows-when-typing-at-edges', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */ }),
        textModel_1.$RC.register({ description: 'notebook-view-model-tracked-range-grows-only-when-typing-before', stickiness: 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */ }),
        textModel_1.$RC.register({ description: 'notebook-view-model-tracked-range-grows-only-when-typing-after', stickiness: 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */ }),
    ];
    function _normalizeOptions(options) {
        if (options instanceof textModel_1.$RC) {
            return options;
        }
        return textModel_1.$RC.createDynamic(options);
    }
    let MODEL_ID = 0;
    let $zob = class $zob extends lifecycle_1.$kc {
        get options() { return this.I; }
        get onDidChangeOptions() { return this.c.event; }
        get viewCells() {
            return this.f;
        }
        set viewCells(_) {
            throw new Error('NotebookViewModel.viewCells is readonly');
        }
        get length() {
            return this.f.length;
        }
        get notebookDocument() {
            return this.F;
        }
        get uri() {
            return this.F.uri;
        }
        get metadata() {
            return this.F.metadata;
        }
        get onDidChangeViewCells() { return this.g.event; }
        get lastNotebookEditResource() {
            if (this.h.length) {
                return this.h[this.h.length - 1];
            }
            return null;
        }
        get layoutInfo() {
            return this.H;
        }
        get onDidChangeSelection() { return this.j.event; }
        get n() {
            const handlesSet = new Set();
            const handles = [];
            (0, notebookRange_1.$PH)(this.m.selections).map(index => index < this.length ? this.cellAt(index) : undefined).forEach(cell => {
                if (cell && !handlesSet.has(cell.handle)) {
                    handles.push(cell.handle);
                }
            });
            return handles;
        }
        set n(selectionHandles) {
            const indexes = selectionHandles.map(handle => this.f.findIndex(cell => cell.handle === handle));
            this.m.setSelections((0, notebookRange_1.$OH)(indexes), true, 'model');
        }
        get focused() {
            return this.z;
        }
        constructor(viewType, F, G, H, I, J, L, M, N, notebookExecutionStateService) {
            super();
            this.viewType = viewType;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.a = this.B(new lifecycle_1.$jc());
            this.b = new Map();
            this.c = this.B(new event_1.$fd());
            this.f = [];
            this.g = this.B(new event_1.$fd());
            this.h = [];
            this.j = this.B(new event_1.$fd());
            this.m = this.B(new cellSelectionCollection_1.$uob());
            this.r = new DecorationsTree();
            this.s = Object.create(null);
            this.t = 0;
            this.w = null;
            this.y = [];
            this.z = true;
            this.C = new Map();
            this.D = new Map();
            MODEL_ID++;
            this.id = '$notebookViewModel' + MODEL_ID;
            this.u = strings.$df(MODEL_ID);
            const compute = (changes, synchronous) => {
                const diffs = changes.map(splice => {
                    return [splice[0], splice[1], splice[2].map(cell => {
                            return $Aob(this.J, this, cell, this.G);
                        })];
                });
                diffs.reverse().forEach(diff => {
                    const deletedCells = this.f.splice(diff[0], diff[1], ...diff[2]);
                    this.r.acceptReplace(diff[0], diff[1], diff[2].length, true);
                    deletedCells.forEach(cell => {
                        this.b.delete(cell.handle);
                        // dispose the cell to release ref to the cell text document
                        cell.dispose();
                    });
                    diff[2].forEach(cell => {
                        this.b.set(cell.handle, cell);
                        this.a.add(cell);
                    });
                });
                const selectionHandles = this.n;
                this.g.fire({
                    synchronous: synchronous,
                    splices: diffs
                });
                let endSelectionHandles = [];
                if (selectionHandles.length) {
                    const primaryHandle = selectionHandles[0];
                    const primarySelectionIndex = this.f.indexOf(this.getCellByHandle(primaryHandle));
                    endSelectionHandles = [primaryHandle];
                    let delta = 0;
                    for (let i = 0; i < diffs.length; i++) {
                        const diff = diffs[0];
                        if (diff[0] + diff[1] <= primarySelectionIndex) {
                            delta += diff[2].length - diff[1];
                            continue;
                        }
                        if (diff[0] > primarySelectionIndex) {
                            endSelectionHandles = [primaryHandle];
                            break;
                        }
                        if (diff[0] + diff[1] > primarySelectionIndex) {
                            endSelectionHandles = [this.f[diff[0] + delta].handle];
                            break;
                        }
                    }
                }
                // TODO@rebornix
                const selectionIndexes = endSelectionHandles.map(handle => this.f.findIndex(cell => cell.handle === handle));
                this.m.setState((0, notebookRange_1.$OH)([selectionIndexes[0]])[0], (0, notebookRange_1.$OH)(selectionIndexes), true, 'model');
            };
            this.B(this.F.onDidChangeContent(e => {
                for (let i = 0; i < e.rawEvents.length; i++) {
                    const change = e.rawEvents[i];
                    let changes = [];
                    const synchronous = e.synchronous ?? true;
                    if (change.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange || change.kind === notebookCommon_1.NotebookCellsChangeType.Initialize) {
                        changes = change.changes;
                        compute(changes, synchronous);
                        continue;
                    }
                    else if (change.kind === notebookCommon_1.NotebookCellsChangeType.Move) {
                        compute([[change.index, change.length, []]], synchronous);
                        compute([[change.newIdx, 0, change.cells]], synchronous);
                    }
                    else {
                        continue;
                    }
                }
            }));
            this.B(this.F.onDidChangeContent(contentChanges => {
                contentChanges.rawEvents.forEach(e => {
                    if (e.kind === notebookCommon_1.NotebookCellsChangeType.ChangeDocumentMetadata) {
                        this.G.eventDispatcher.emit([new notebookViewEvents_1.$nbb(this.F.metadata)]);
                    }
                });
                if (contentChanges.endSelectionState) {
                    this.updateSelectionsState(contentChanges.endSelectionState);
                }
            }));
            this.B(this.G.eventDispatcher.onDidChangeLayout((e) => {
                this.H = e.value;
                this.f.forEach(cell => {
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        if (e.source.width || e.source.fontInfo) {
                            cell.layoutChange({ outerWidth: e.value.width, font: e.value.fontInfo });
                        }
                    }
                    else {
                        if (e.source.width !== undefined) {
                            cell.layoutChange({ outerWidth: e.value.width, font: e.value.fontInfo });
                        }
                    }
                });
            }));
            this.B(this.G.notebookOptions.onDidChangeOptions(e => {
                for (let i = 0; i < this.length; i++) {
                    const cell = this.f[i];
                    cell.updateOptions(e);
                }
            }));
            this.B(notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.type !== notebookExecutionStateService_1.NotebookExecutionType.cell) {
                    return;
                }
                const cell = this.getCellByHandle(e.cellHandle);
                if (cell instanceof codeCellViewModel_1.$Rnb) {
                    cell.updateExecutionState(e);
                }
            }));
            this.B(this.m.onDidChangeSelection(e => {
                this.j.fire(e);
            }));
            this.f = this.F.cells.map(cell => {
                return $Aob(this.J, this, cell, this.G);
            });
            this.f.forEach(cell => {
                this.b.set(cell.handle, cell);
            });
        }
        updateOptions(newOptions) {
            this.I = { ...this.I, ...newOptions };
            this.c.fire();
        }
        getFocus() {
            return this.m.focus;
        }
        getSelections() {
            return this.m.selections;
        }
        setEditorFocus(focused) {
            this.z = focused;
        }
        /**
         * Empty selection will be turned to `null`
         */
        validateRange(cellRange) {
            if (!cellRange) {
                return null;
            }
            const start = (0, numbers_1.$Hl)(cellRange.start, 0, this.length);
            const end = (0, numbers_1.$Hl)(cellRange.end, 0, this.length);
            if (start === end) {
                return null;
            }
            if (start < end) {
                return { start, end };
            }
            else {
                return { start: end, end: start };
            }
        }
        // selection change from list view's `setFocus` and `setSelection` should always use `source: view` to prevent events breaking the list view focus/selection change transaction
        updateSelectionsState(state, source = 'model') {
            if (this.z || source === 'model') {
                if (state.kind === notebookCommon_1.SelectionStateType.Handle) {
                    const primaryIndex = state.primary !== null ? this.getCellIndexByHandle(state.primary) : null;
                    const primarySelection = primaryIndex !== null ? this.validateRange({ start: primaryIndex, end: primaryIndex + 1 }) : null;
                    const selections = (0, notebookRange_1.$OH)(state.selections.map(sel => this.getCellIndexByHandle(sel)))
                        .map(range => this.validateRange(range))
                        .filter(range => range !== null);
                    this.m.setState(primarySelection, (0, notebookRange_1.$QH)(selections), true, source);
                }
                else {
                    const primarySelection = this.validateRange(state.focus);
                    const selections = state.selections
                        .map(range => this.validateRange(range))
                        .filter(range => range !== null);
                    this.m.setState(primarySelection, (0, notebookRange_1.$QH)(selections), true, source);
                }
            }
        }
        getFoldingStartIndex(index) {
            if (!this.w) {
                return -1;
            }
            const range = this.w.findRange(index + 1);
            const startIndex = this.w.getStartLineNumber(range) - 1;
            return startIndex;
        }
        getFoldingState(index) {
            if (!this.w) {
                return 0 /* CellFoldingState.None */;
            }
            const range = this.w.findRange(index + 1);
            const startIndex = this.w.getStartLineNumber(range) - 1;
            if (startIndex !== index) {
                return 0 /* CellFoldingState.None */;
            }
            return this.w.isCollapsed(range) ? 2 /* CellFoldingState.Collapsed */ : 1 /* CellFoldingState.Expanded */;
        }
        getFoldedLength(index) {
            if (!this.w) {
                return 0;
            }
            const range = this.w.findRange(index + 1);
            const startIndex = this.w.getStartLineNumber(range) - 1;
            const endIndex = this.w.getEndLineNumber(range) - 1;
            return endIndex - startIndex;
        }
        updateFoldingRanges(ranges) {
            this.w = ranges;
            let updateHiddenAreas = false;
            const newHiddenAreas = [];
            let i = 0; // index into hidden
            let k = 0;
            let lastCollapsedStart = Number.MAX_VALUE;
            let lastCollapsedEnd = -1;
            for (; i < ranges.length; i++) {
                if (!ranges.isCollapsed(i)) {
                    continue;
                }
                const startLineNumber = ranges.getStartLineNumber(i) + 1; // the first line is not hidden
                const endLineNumber = ranges.getEndLineNumber(i);
                if (lastCollapsedStart <= startLineNumber && endLineNumber <= lastCollapsedEnd) {
                    // ignore ranges contained in collapsed regions
                    continue;
                }
                if (!updateHiddenAreas && k < this.y.length && this.y[k].start + 1 === startLineNumber && (this.y[k].end + 1) === endLineNumber) {
                    // reuse the old ranges
                    newHiddenAreas.push(this.y[k]);
                    k++;
                }
                else {
                    updateHiddenAreas = true;
                    newHiddenAreas.push({ start: startLineNumber - 1, end: endLineNumber - 1 });
                }
                lastCollapsedStart = startLineNumber;
                lastCollapsedEnd = endLineNumber;
            }
            if (updateHiddenAreas || k < this.y.length) {
                this.y = newHiddenAreas;
            }
            this.f.forEach(cell => {
                if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                    cell.triggerFoldingStateChange();
                }
            });
        }
        getHiddenRanges() {
            return this.y;
        }
        getCellByHandle(handle) {
            return this.b.get(handle);
        }
        getCellIndexByHandle(handle) {
            return this.f.findIndex(cell => cell.handle === handle);
        }
        getCellIndex(cell) {
            return this.f.indexOf(cell);
        }
        cellAt(index) {
            // if (index < 0 || index >= this.length) {
            // 	throw new Error(`Invalid index ${index}`);
            // }
            return this.f[index];
        }
        getCellsInRange(range) {
            if (!range) {
                return this.f.slice(0);
            }
            const validatedRange = this.validateRange(range);
            if (validatedRange) {
                const result = [];
                for (let i = validatedRange.start; i < validatedRange.end; i++) {
                    result.push(this.f[i]);
                }
                return result;
            }
            return [];
        }
        /**
         * If this._viewCells[index] is visible then return index
         */
        getNearestVisibleCellIndexUpwards(index) {
            for (let i = this.y.length - 1; i >= 0; i--) {
                const cellRange = this.y[i];
                const foldStart = cellRange.start - 1;
                const foldEnd = cellRange.end;
                if (foldStart > index) {
                    continue;
                }
                if (foldStart <= index && foldEnd >= index) {
                    return index;
                }
                // foldStart <= index, foldEnd < index
                break;
            }
            return index;
        }
        getNextVisibleCellIndex(index) {
            for (let i = 0; i < this.y.length; i++) {
                const cellRange = this.y[i];
                const foldStart = cellRange.start - 1;
                const foldEnd = cellRange.end;
                if (foldEnd < index) {
                    continue;
                }
                // foldEnd >= index
                if (foldStart <= index) {
                    return foldEnd + 1;
                }
                break;
            }
            return index + 1;
        }
        getPreviousVisibleCellIndex(index) {
            for (let i = this.y.length - 1; i >= 0; i--) {
                const cellRange = this.y[i];
                const foldStart = cellRange.start - 1;
                const foldEnd = cellRange.end;
                if (foldEnd < index) {
                    return index;
                }
                if (foldStart <= index) {
                    return foldStart;
                }
            }
            return index;
        }
        hasCell(cell) {
            return this.b.has(cell.handle);
        }
        getVersionId() {
            return this.F.versionId;
        }
        getAlternativeId() {
            return this.F.alternativeVersionId;
        }
        getTrackedRange(id) {
            return this.O(id);
        }
        O(decorationId) {
            const node = this.s[decorationId];
            if (!node) {
                return null;
            }
            const versionId = this.getVersionId();
            if (node.cachedVersionId !== versionId) {
                this.r.resolveNode(node, versionId);
            }
            if (node.range === null) {
                return { start: node.cachedAbsoluteStart - 1, end: node.cachedAbsoluteEnd - 1 };
            }
            return { start: node.range.startLineNumber - 1, end: node.range.endLineNumber - 1 };
        }
        setTrackedRange(id, newRange, newStickiness) {
            const node = (id ? this.s[id] : null);
            if (!node) {
                if (!newRange) {
                    return null;
                }
                return this.P(0, [], [{ range: new range_1.$ks(newRange.start + 1, 1, newRange.end + 1, 1), options: TRACKED_RANGE_OPTIONS[newStickiness] }])[0];
            }
            if (!newRange) {
                // node exists, the request is to delete => delete node
                this.r.delete(node);
                delete this.s[node.id];
                return null;
            }
            this.r.delete(node);
            node.reset(this.getVersionId(), newRange.start, newRange.end + 1, new range_1.$ks(newRange.start + 1, 1, newRange.end + 1, 1));
            node.setOptions(TRACKED_RANGE_OPTIONS[newStickiness]);
            this.r.insert(node);
            return node.id;
        }
        P(ownerId, oldDecorationsIds, newDecorations) {
            const versionId = this.getVersionId();
            const oldDecorationsLen = oldDecorationsIds.length;
            let oldDecorationIndex = 0;
            const newDecorationsLen = newDecorations.length;
            let newDecorationIndex = 0;
            const result = new Array(newDecorationsLen);
            while (oldDecorationIndex < oldDecorationsLen || newDecorationIndex < newDecorationsLen) {
                let node = null;
                if (oldDecorationIndex < oldDecorationsLen) {
                    // (1) get ourselves an old node
                    do {
                        node = this.s[oldDecorationsIds[oldDecorationIndex++]];
                    } while (!node && oldDecorationIndex < oldDecorationsLen);
                    // (2) remove the node from the tree (if it exists)
                    if (node) {
                        this.r.delete(node);
                    }
                }
                if (newDecorationIndex < newDecorationsLen) {
                    // (3) create a new node if necessary
                    if (!node) {
                        const internalDecorationId = (++this.t);
                        const decorationId = `${this.u};${internalDecorationId}`;
                        node = new intervalTree_1.$4B(decorationId, 0, 0);
                        this.s[decorationId] = node;
                    }
                    // (4) initialize node
                    const newDecoration = newDecorations[newDecorationIndex];
                    const range = newDecoration.range;
                    const options = _normalizeOptions(newDecoration.options);
                    node.ownerId = ownerId;
                    node.reset(versionId, range.startLineNumber, range.endLineNumber, range_1.$ks.lift(range));
                    node.setOptions(options);
                    this.r.insert(node);
                    result[newDecorationIndex] = node.id;
                    newDecorationIndex++;
                }
                else {
                    if (node) {
                        delete this.s[node.id];
                    }
                }
            }
            return result;
        }
        deltaCellDecorations(oldDecorations, newDecorations) {
            oldDecorations.forEach(id => {
                const handle = this.C.get(id);
                if (handle !== undefined) {
                    const cell = this.getCellByHandle(handle);
                    cell?.deltaCellDecorations([id], []);
                }
            });
            const result = [];
            newDecorations.forEach(decoration => {
                const cell = this.getCellByHandle(decoration.handle);
                const ret = cell?.deltaCellDecorations([], [decoration.options]) || [];
                ret.forEach(id => {
                    this.C.set(id, decoration.handle);
                });
                result.push(...ret);
            });
            return result;
        }
        deltaCellStatusBarItems(oldItems, newItems) {
            const deletesByHandle = (0, collections_1.$I)(oldItems, id => this.D.get(id) ?? -1);
            const result = [];
            newItems.forEach(itemDelta => {
                const cell = this.getCellByHandle(itemDelta.handle);
                const deleted = deletesByHandle[itemDelta.handle] ?? [];
                delete deletesByHandle[itemDelta.handle];
                deleted.forEach(id => this.D.delete(id));
                const ret = cell?.deltaCellStatusBarItems(deleted, itemDelta.items) || [];
                ret.forEach(id => {
                    this.D.set(id, itemDelta.handle);
                });
                result.push(...ret);
            });
            for (const _handle in deletesByHandle) {
                const handle = parseInt(_handle);
                const ids = deletesByHandle[handle];
                const cell = this.getCellByHandle(handle);
                cell?.deltaCellStatusBarItems(ids, []);
                ids.forEach(id => this.D.delete(id));
            }
            return result;
        }
        nearestCodeCellIndex(index /* exclusive */) {
            const nearest = this.viewCells.slice(0, index).reverse().findIndex(cell => cell.cellKind === notebookCommon_1.CellKind.Code);
            if (nearest > -1) {
                return index - nearest - 1;
            }
            else {
                const nearestCellTheOtherDirection = this.viewCells.slice(index + 1).findIndex(cell => cell.cellKind === notebookCommon_1.CellKind.Code);
                if (nearestCellTheOtherDirection > -1) {
                    return index + 1 + nearestCellTheOtherDirection;
                }
                return -1;
            }
        }
        getEditorViewState() {
            const editingCells = {};
            const collapsedInputCells = {};
            const collapsedOutputCells = {};
            const cellLineNumberStates = {};
            this.f.forEach((cell, i) => {
                if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                    editingCells[i] = true;
                }
                if (cell.isInputCollapsed) {
                    collapsedInputCells[i] = true;
                }
                if (cell instanceof codeCellViewModel_1.$Rnb && cell.isOutputCollapsed) {
                    collapsedOutputCells[i] = true;
                }
                if (cell.lineNumbers !== 'inherit') {
                    cellLineNumberStates[i] = cell.lineNumbers;
                }
            });
            const editorViewStates = {};
            this.f.map(cell => ({ handle: cell.model.handle, state: cell.saveEditorViewState() })).forEach((viewState, i) => {
                if (viewState.state) {
                    editorViewStates[i] = viewState.state;
                }
            });
            return {
                editingCells,
                editorViewStates,
                cellLineNumberStates,
                collapsedInputCells,
                collapsedOutputCells
            };
        }
        restoreEditorViewState(viewState) {
            if (!viewState) {
                return;
            }
            this.f.forEach((cell, index) => {
                const isEditing = viewState.editingCells && viewState.editingCells[index];
                const editorViewState = viewState.editorViewStates && viewState.editorViewStates[index];
                cell.updateEditState(isEditing ? notebookBrowser_1.CellEditState.Editing : notebookBrowser_1.CellEditState.Preview, 'viewState');
                const cellHeight = viewState.cellTotalHeights ? viewState.cellTotalHeights[index] : undefined;
                cell.restoreEditorViewState(editorViewState, cellHeight);
                if (viewState.collapsedInputCells && viewState.collapsedInputCells[index]) {
                    cell.isInputCollapsed = true;
                }
                if (viewState.collapsedOutputCells && viewState.collapsedOutputCells[index] && cell instanceof codeCellViewModel_1.$Rnb) {
                    cell.isOutputCollapsed = true;
                }
                if (viewState.cellLineNumberStates && viewState.cellLineNumberStates[index]) {
                    cell.lineNumbers = viewState.cellLineNumberStates[index];
                }
            });
        }
        /**
         * Editor decorations across cells. For example, find decorations for multiple code cells
         * The reason that we can't completely delegate this to CodeEditorWidget is most of the time, the editors for cells are not created yet but we already have decorations for them.
         */
        changeModelDecorations(callback) {
            const changeAccessor = {
                deltaDecorations: (oldDecorations, newDecorations) => {
                    return this.Q(oldDecorations, newDecorations);
                }
            };
            let result = null;
            try {
                result = callback(changeAccessor);
            }
            catch (e) {
                (0, errors_1.$Y)(e);
            }
            changeAccessor.deltaDecorations = invalidFunc;
            return result;
        }
        Q(oldDecorations, newDecorations) {
            const mapping = new Map();
            oldDecorations.forEach(oldDecoration => {
                const ownerId = oldDecoration.ownerId;
                if (!mapping.has(ownerId)) {
                    const cell = this.f.find(cell => cell.handle === ownerId);
                    if (cell) {
                        mapping.set(ownerId, { cell: cell, oldDecorations: [], newDecorations: [] });
                    }
                }
                const data = mapping.get(ownerId);
                if (data) {
                    data.oldDecorations = oldDecoration.decorations;
                }
            });
            newDecorations.forEach(newDecoration => {
                const ownerId = newDecoration.ownerId;
                if (!mapping.has(ownerId)) {
                    const cell = this.f.find(cell => cell.handle === ownerId);
                    if (cell) {
                        mapping.set(ownerId, { cell: cell, oldDecorations: [], newDecorations: [] });
                    }
                }
                const data = mapping.get(ownerId);
                if (data) {
                    data.newDecorations = newDecoration.decorations;
                }
            });
            const ret = [];
            mapping.forEach((value, ownerId) => {
                const cellRet = value.cell.deltaModelDecorations(value.oldDecorations, value.newDecorations);
                ret.push({
                    ownerId: ownerId,
                    decorations: cellRet
                });
            });
            return ret;
        }
        //#region Find
        find(value, options) {
            const matches = [];
            this.f.forEach((cell, index) => {
                const cellMatches = cell.startFind(value, options);
                if (cellMatches) {
                    matches.push(new findModel_1.$xob(cellMatches.cell, index, cellMatches.contentMatches, []));
                }
            });
            // filter based on options and editing state
            return matches.filter(match => {
                if (match.cell.cellKind === notebookCommon_1.CellKind.Code) {
                    // code cell, we only include its match if include input is enabled
                    return options.includeCodeInput;
                }
                // markup cell, it depends on the editing state
                if (match.cell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                    // editing, even if we includeMarkupPreview
                    return options.includeMarkupInput;
                }
                else {
                    // cell in preview mode, we should only include it if includeMarkupPreview is false but includeMarkupInput is true
                    // if includeMarkupPreview is true, then we should include the webview match result other than this
                    return !options.includeMarkupPreview && options.includeMarkupInput;
                }
            });
        }
        replaceOne(cell, range, text) {
            const viewCell = cell;
            this.h.push(viewCell.uri);
            return viewCell.resolveTextModel().then(() => {
                this.L.apply([new bulkEditService_1.$p1(cell.uri, { range, text })], { quotableLabel: 'Notebook Replace' });
            });
        }
        async replaceAll(matches, texts) {
            if (!matches.length) {
                return;
            }
            const textEdits = [];
            this.h.push(matches[0].cell.uri);
            matches.forEach(match => {
                match.contentMatches.forEach((singleMatch, index) => {
                    textEdits.push({
                        versionId: undefined,
                        textEdit: { range: singleMatch.range, text: texts[index] },
                        resource: match.cell.uri
                    });
                });
            });
            return Promise.all(matches.map(match => {
                return match.cell.resolveTextModel();
            })).then(async () => {
                this.L.apply({ edits: textEdits }, { quotableLabel: 'Notebook Replace All' });
                return;
            });
        }
        //#endregion
        //#region Undo/Redo
        async R(element, callback) {
            const viewCells = this.f.filter(cell => element.matchesResource(cell.uri));
            const refs = await Promise.all(viewCells.map(cell => this.N.createModelReference(cell.uri)));
            await callback();
            refs.forEach(ref => ref.dispose());
        }
        async undo() {
            const editStack = this.M.getElements(this.uri);
            const element = editStack.past.length ? editStack.past[editStack.past.length - 1] : undefined;
            if (element && element instanceof editStack_1.$SB || element instanceof editStack_1.$TB) {
                await this.R(element, async () => {
                    await this.M.undo(this.uri);
                });
                return (element instanceof editStack_1.$SB) ? [element.resource] : element.resources;
            }
            await this.M.undo(this.uri);
            return [];
        }
        async redo() {
            const editStack = this.M.getElements(this.uri);
            const element = editStack.future[0];
            if (element && element instanceof editStack_1.$SB || element instanceof editStack_1.$TB) {
                await this.R(element, async () => {
                    await this.M.redo(this.uri);
                });
                return (element instanceof editStack_1.$SB) ? [element.resource] : element.resources;
            }
            await this.M.redo(this.uri);
            return [];
        }
        //#endregion
        equal(notebook) {
            return this.F === notebook;
        }
        dispose() {
            this.a.clear();
            this.f.forEach(cell => {
                cell.dispose();
            });
            super.dispose();
        }
    };
    exports.$zob = $zob;
    exports.$zob = $zob = __decorate([
        __param(5, instantiation_1.$Ah),
        __param(6, bulkEditService_1.$n1),
        __param(7, undoRedo_1.$wu),
        __param(8, resolverService_1.$uA),
        __param(9, notebookExecutionStateService_1.$_H)
    ], $zob);
    function $Aob(instantiationService, notebookViewModel, cell, viewContext) {
        if (cell.cellKind === notebookCommon_1.CellKind.Code) {
            return instantiationService.createInstance(codeCellViewModel_1.$Rnb, notebookViewModel.viewType, cell, notebookViewModel.layoutInfo, viewContext);
        }
        else {
            return instantiationService.createInstance(markupCellViewModel_1.$Snb, notebookViewModel.viewType, cell, notebookViewModel.layoutInfo, notebookViewModel, viewContext);
        }
    }
    exports.$Aob = $Aob;
});
//# sourceMappingURL=notebookViewModelImpl.js.map