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
    exports.createCellViewModel = exports.NotebookViewModel = void 0;
    const invalidFunc = () => { throw new Error(`Invalid change accessor`); };
    class DecorationsTree {
        constructor() {
            this._decorationsTree = new intervalTree_1.IntervalTree();
        }
        intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations = false) {
            const r1 = this._decorationsTree.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            return r1;
        }
        search(filterOwnerId, filterOutValidation, overviewRulerOnly, cachedVersionId, onlyMarginDecorations) {
            return this._decorationsTree.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
        }
        collectNodesFromOwner(ownerId) {
            const r1 = this._decorationsTree.collectNodesFromOwner(ownerId);
            return r1;
        }
        collectNodesPostOrder() {
            const r1 = this._decorationsTree.collectNodesPostOrder();
            return r1;
        }
        insert(node) {
            this._decorationsTree.insert(node);
        }
        delete(node) {
            this._decorationsTree.delete(node);
        }
        resolveNode(node, cachedVersionId) {
            this._decorationsTree.resolveNode(node, cachedVersionId);
        }
        acceptReplace(offset, length, textLength, forceMoveMarkers) {
            this._decorationsTree.acceptReplace(offset, length, textLength, forceMoveMarkers);
        }
    }
    const TRACKED_RANGE_OPTIONS = [
        textModel_1.ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-always-grows-when-typing-at-edges', stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */ }),
        textModel_1.ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-never-grows-when-typing-at-edges', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */ }),
        textModel_1.ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-grows-only-when-typing-before', stickiness: 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */ }),
        textModel_1.ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-grows-only-when-typing-after', stickiness: 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */ }),
    ];
    function _normalizeOptions(options) {
        if (options instanceof textModel_1.ModelDecorationOptions) {
            return options;
        }
        return textModel_1.ModelDecorationOptions.createDynamic(options);
    }
    let MODEL_ID = 0;
    let NotebookViewModel = class NotebookViewModel extends lifecycle_1.Disposable {
        get options() { return this._options; }
        get onDidChangeOptions() { return this._onDidChangeOptions.event; }
        get viewCells() {
            return this._viewCells;
        }
        set viewCells(_) {
            throw new Error('NotebookViewModel.viewCells is readonly');
        }
        get length() {
            return this._viewCells.length;
        }
        get notebookDocument() {
            return this._notebook;
        }
        get uri() {
            return this._notebook.uri;
        }
        get metadata() {
            return this._notebook.metadata;
        }
        get onDidChangeViewCells() { return this._onDidChangeViewCells.event; }
        get lastNotebookEditResource() {
            if (this._lastNotebookEditResource.length) {
                return this._lastNotebookEditResource[this._lastNotebookEditResource.length - 1];
            }
            return null;
        }
        get layoutInfo() {
            return this._layoutInfo;
        }
        get onDidChangeSelection() { return this._onDidChangeSelection.event; }
        get selectionHandles() {
            const handlesSet = new Set();
            const handles = [];
            (0, notebookRange_1.cellRangesToIndexes)(this._selectionCollection.selections).map(index => index < this.length ? this.cellAt(index) : undefined).forEach(cell => {
                if (cell && !handlesSet.has(cell.handle)) {
                    handles.push(cell.handle);
                }
            });
            return handles;
        }
        set selectionHandles(selectionHandles) {
            const indexes = selectionHandles.map(handle => this._viewCells.findIndex(cell => cell.handle === handle));
            this._selectionCollection.setSelections((0, notebookRange_1.cellIndexesToRanges)(indexes), true, 'model');
        }
        get focused() {
            return this._focused;
        }
        constructor(viewType, _notebook, _viewContext, _layoutInfo, _options, _instantiationService, _bulkEditService, _undoService, _textModelService, notebookExecutionStateService) {
            super();
            this.viewType = viewType;
            this._notebook = _notebook;
            this._viewContext = _viewContext;
            this._layoutInfo = _layoutInfo;
            this._options = _options;
            this._instantiationService = _instantiationService;
            this._bulkEditService = _bulkEditService;
            this._undoService = _undoService;
            this._textModelService = _textModelService;
            this._localStore = this._register(new lifecycle_1.DisposableStore());
            this._handleToViewCellMapping = new Map();
            this._onDidChangeOptions = this._register(new event_1.Emitter());
            this._viewCells = [];
            this._onDidChangeViewCells = this._register(new event_1.Emitter());
            this._lastNotebookEditResource = [];
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this._selectionCollection = this._register(new cellSelectionCollection_1.NotebookCellSelectionCollection());
            this._decorationsTree = new DecorationsTree();
            this._decorations = Object.create(null);
            this._lastDecorationId = 0;
            this._foldingRanges = null;
            this._hiddenRanges = [];
            this._focused = true;
            this._decorationIdToCellMap = new Map();
            this._statusBarItemIdToCellMap = new Map();
            MODEL_ID++;
            this.id = '$notebookViewModel' + MODEL_ID;
            this._instanceId = strings.singleLetterHash(MODEL_ID);
            const compute = (changes, synchronous) => {
                const diffs = changes.map(splice => {
                    return [splice[0], splice[1], splice[2].map(cell => {
                            return createCellViewModel(this._instantiationService, this, cell, this._viewContext);
                        })];
                });
                diffs.reverse().forEach(diff => {
                    const deletedCells = this._viewCells.splice(diff[0], diff[1], ...diff[2]);
                    this._decorationsTree.acceptReplace(diff[0], diff[1], diff[2].length, true);
                    deletedCells.forEach(cell => {
                        this._handleToViewCellMapping.delete(cell.handle);
                        // dispose the cell to release ref to the cell text document
                        cell.dispose();
                    });
                    diff[2].forEach(cell => {
                        this._handleToViewCellMapping.set(cell.handle, cell);
                        this._localStore.add(cell);
                    });
                });
                const selectionHandles = this.selectionHandles;
                this._onDidChangeViewCells.fire({
                    synchronous: synchronous,
                    splices: diffs
                });
                let endSelectionHandles = [];
                if (selectionHandles.length) {
                    const primaryHandle = selectionHandles[0];
                    const primarySelectionIndex = this._viewCells.indexOf(this.getCellByHandle(primaryHandle));
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
                            endSelectionHandles = [this._viewCells[diff[0] + delta].handle];
                            break;
                        }
                    }
                }
                // TODO@rebornix
                const selectionIndexes = endSelectionHandles.map(handle => this._viewCells.findIndex(cell => cell.handle === handle));
                this._selectionCollection.setState((0, notebookRange_1.cellIndexesToRanges)([selectionIndexes[0]])[0], (0, notebookRange_1.cellIndexesToRanges)(selectionIndexes), true, 'model');
            };
            this._register(this._notebook.onDidChangeContent(e => {
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
            this._register(this._notebook.onDidChangeContent(contentChanges => {
                contentChanges.rawEvents.forEach(e => {
                    if (e.kind === notebookCommon_1.NotebookCellsChangeType.ChangeDocumentMetadata) {
                        this._viewContext.eventDispatcher.emit([new notebookViewEvents_1.NotebookMetadataChangedEvent(this._notebook.metadata)]);
                    }
                });
                if (contentChanges.endSelectionState) {
                    this.updateSelectionsState(contentChanges.endSelectionState);
                }
            }));
            this._register(this._viewContext.eventDispatcher.onDidChangeLayout((e) => {
                this._layoutInfo = e.value;
                this._viewCells.forEach(cell => {
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
            this._register(this._viewContext.notebookOptions.onDidChangeOptions(e => {
                for (let i = 0; i < this.length; i++) {
                    const cell = this._viewCells[i];
                    cell.updateOptions(e);
                }
            }));
            this._register(notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.type !== notebookExecutionStateService_1.NotebookExecutionType.cell) {
                    return;
                }
                const cell = this.getCellByHandle(e.cellHandle);
                if (cell instanceof codeCellViewModel_1.CodeCellViewModel) {
                    cell.updateExecutionState(e);
                }
            }));
            this._register(this._selectionCollection.onDidChangeSelection(e => {
                this._onDidChangeSelection.fire(e);
            }));
            this._viewCells = this._notebook.cells.map(cell => {
                return createCellViewModel(this._instantiationService, this, cell, this._viewContext);
            });
            this._viewCells.forEach(cell => {
                this._handleToViewCellMapping.set(cell.handle, cell);
            });
        }
        updateOptions(newOptions) {
            this._options = { ...this._options, ...newOptions };
            this._onDidChangeOptions.fire();
        }
        getFocus() {
            return this._selectionCollection.focus;
        }
        getSelections() {
            return this._selectionCollection.selections;
        }
        setEditorFocus(focused) {
            this._focused = focused;
        }
        /**
         * Empty selection will be turned to `null`
         */
        validateRange(cellRange) {
            if (!cellRange) {
                return null;
            }
            const start = (0, numbers_1.clamp)(cellRange.start, 0, this.length);
            const end = (0, numbers_1.clamp)(cellRange.end, 0, this.length);
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
            if (this._focused || source === 'model') {
                if (state.kind === notebookCommon_1.SelectionStateType.Handle) {
                    const primaryIndex = state.primary !== null ? this.getCellIndexByHandle(state.primary) : null;
                    const primarySelection = primaryIndex !== null ? this.validateRange({ start: primaryIndex, end: primaryIndex + 1 }) : null;
                    const selections = (0, notebookRange_1.cellIndexesToRanges)(state.selections.map(sel => this.getCellIndexByHandle(sel)))
                        .map(range => this.validateRange(range))
                        .filter(range => range !== null);
                    this._selectionCollection.setState(primarySelection, (0, notebookRange_1.reduceCellRanges)(selections), true, source);
                }
                else {
                    const primarySelection = this.validateRange(state.focus);
                    const selections = state.selections
                        .map(range => this.validateRange(range))
                        .filter(range => range !== null);
                    this._selectionCollection.setState(primarySelection, (0, notebookRange_1.reduceCellRanges)(selections), true, source);
                }
            }
        }
        getFoldingStartIndex(index) {
            if (!this._foldingRanges) {
                return -1;
            }
            const range = this._foldingRanges.findRange(index + 1);
            const startIndex = this._foldingRanges.getStartLineNumber(range) - 1;
            return startIndex;
        }
        getFoldingState(index) {
            if (!this._foldingRanges) {
                return 0 /* CellFoldingState.None */;
            }
            const range = this._foldingRanges.findRange(index + 1);
            const startIndex = this._foldingRanges.getStartLineNumber(range) - 1;
            if (startIndex !== index) {
                return 0 /* CellFoldingState.None */;
            }
            return this._foldingRanges.isCollapsed(range) ? 2 /* CellFoldingState.Collapsed */ : 1 /* CellFoldingState.Expanded */;
        }
        getFoldedLength(index) {
            if (!this._foldingRanges) {
                return 0;
            }
            const range = this._foldingRanges.findRange(index + 1);
            const startIndex = this._foldingRanges.getStartLineNumber(range) - 1;
            const endIndex = this._foldingRanges.getEndLineNumber(range) - 1;
            return endIndex - startIndex;
        }
        updateFoldingRanges(ranges) {
            this._foldingRanges = ranges;
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
                if (!updateHiddenAreas && k < this._hiddenRanges.length && this._hiddenRanges[k].start + 1 === startLineNumber && (this._hiddenRanges[k].end + 1) === endLineNumber) {
                    // reuse the old ranges
                    newHiddenAreas.push(this._hiddenRanges[k]);
                    k++;
                }
                else {
                    updateHiddenAreas = true;
                    newHiddenAreas.push({ start: startLineNumber - 1, end: endLineNumber - 1 });
                }
                lastCollapsedStart = startLineNumber;
                lastCollapsedEnd = endLineNumber;
            }
            if (updateHiddenAreas || k < this._hiddenRanges.length) {
                this._hiddenRanges = newHiddenAreas;
            }
            this._viewCells.forEach(cell => {
                if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                    cell.triggerFoldingStateChange();
                }
            });
        }
        getHiddenRanges() {
            return this._hiddenRanges;
        }
        getCellByHandle(handle) {
            return this._handleToViewCellMapping.get(handle);
        }
        getCellIndexByHandle(handle) {
            return this._viewCells.findIndex(cell => cell.handle === handle);
        }
        getCellIndex(cell) {
            return this._viewCells.indexOf(cell);
        }
        cellAt(index) {
            // if (index < 0 || index >= this.length) {
            // 	throw new Error(`Invalid index ${index}`);
            // }
            return this._viewCells[index];
        }
        getCellsInRange(range) {
            if (!range) {
                return this._viewCells.slice(0);
            }
            const validatedRange = this.validateRange(range);
            if (validatedRange) {
                const result = [];
                for (let i = validatedRange.start; i < validatedRange.end; i++) {
                    result.push(this._viewCells[i]);
                }
                return result;
            }
            return [];
        }
        /**
         * If this._viewCells[index] is visible then return index
         */
        getNearestVisibleCellIndexUpwards(index) {
            for (let i = this._hiddenRanges.length - 1; i >= 0; i--) {
                const cellRange = this._hiddenRanges[i];
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
            for (let i = 0; i < this._hiddenRanges.length; i++) {
                const cellRange = this._hiddenRanges[i];
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
            for (let i = this._hiddenRanges.length - 1; i >= 0; i--) {
                const cellRange = this._hiddenRanges[i];
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
            return this._handleToViewCellMapping.has(cell.handle);
        }
        getVersionId() {
            return this._notebook.versionId;
        }
        getAlternativeId() {
            return this._notebook.alternativeVersionId;
        }
        getTrackedRange(id) {
            return this._getDecorationRange(id);
        }
        _getDecorationRange(decorationId) {
            const node = this._decorations[decorationId];
            if (!node) {
                return null;
            }
            const versionId = this.getVersionId();
            if (node.cachedVersionId !== versionId) {
                this._decorationsTree.resolveNode(node, versionId);
            }
            if (node.range === null) {
                return { start: node.cachedAbsoluteStart - 1, end: node.cachedAbsoluteEnd - 1 };
            }
            return { start: node.range.startLineNumber - 1, end: node.range.endLineNumber - 1 };
        }
        setTrackedRange(id, newRange, newStickiness) {
            const node = (id ? this._decorations[id] : null);
            if (!node) {
                if (!newRange) {
                    return null;
                }
                return this._deltaCellDecorationsImpl(0, [], [{ range: new range_1.Range(newRange.start + 1, 1, newRange.end + 1, 1), options: TRACKED_RANGE_OPTIONS[newStickiness] }])[0];
            }
            if (!newRange) {
                // node exists, the request is to delete => delete node
                this._decorationsTree.delete(node);
                delete this._decorations[node.id];
                return null;
            }
            this._decorationsTree.delete(node);
            node.reset(this.getVersionId(), newRange.start, newRange.end + 1, new range_1.Range(newRange.start + 1, 1, newRange.end + 1, 1));
            node.setOptions(TRACKED_RANGE_OPTIONS[newStickiness]);
            this._decorationsTree.insert(node);
            return node.id;
        }
        _deltaCellDecorationsImpl(ownerId, oldDecorationsIds, newDecorations) {
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
                        node = this._decorations[oldDecorationsIds[oldDecorationIndex++]];
                    } while (!node && oldDecorationIndex < oldDecorationsLen);
                    // (2) remove the node from the tree (if it exists)
                    if (node) {
                        this._decorationsTree.delete(node);
                    }
                }
                if (newDecorationIndex < newDecorationsLen) {
                    // (3) create a new node if necessary
                    if (!node) {
                        const internalDecorationId = (++this._lastDecorationId);
                        const decorationId = `${this._instanceId};${internalDecorationId}`;
                        node = new intervalTree_1.IntervalNode(decorationId, 0, 0);
                        this._decorations[decorationId] = node;
                    }
                    // (4) initialize node
                    const newDecoration = newDecorations[newDecorationIndex];
                    const range = newDecoration.range;
                    const options = _normalizeOptions(newDecoration.options);
                    node.ownerId = ownerId;
                    node.reset(versionId, range.startLineNumber, range.endLineNumber, range_1.Range.lift(range));
                    node.setOptions(options);
                    this._decorationsTree.insert(node);
                    result[newDecorationIndex] = node.id;
                    newDecorationIndex++;
                }
                else {
                    if (node) {
                        delete this._decorations[node.id];
                    }
                }
            }
            return result;
        }
        deltaCellDecorations(oldDecorations, newDecorations) {
            oldDecorations.forEach(id => {
                const handle = this._decorationIdToCellMap.get(id);
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
                    this._decorationIdToCellMap.set(id, decoration.handle);
                });
                result.push(...ret);
            });
            return result;
        }
        deltaCellStatusBarItems(oldItems, newItems) {
            const deletesByHandle = (0, collections_1.groupBy)(oldItems, id => this._statusBarItemIdToCellMap.get(id) ?? -1);
            const result = [];
            newItems.forEach(itemDelta => {
                const cell = this.getCellByHandle(itemDelta.handle);
                const deleted = deletesByHandle[itemDelta.handle] ?? [];
                delete deletesByHandle[itemDelta.handle];
                deleted.forEach(id => this._statusBarItemIdToCellMap.delete(id));
                const ret = cell?.deltaCellStatusBarItems(deleted, itemDelta.items) || [];
                ret.forEach(id => {
                    this._statusBarItemIdToCellMap.set(id, itemDelta.handle);
                });
                result.push(...ret);
            });
            for (const _handle in deletesByHandle) {
                const handle = parseInt(_handle);
                const ids = deletesByHandle[handle];
                const cell = this.getCellByHandle(handle);
                cell?.deltaCellStatusBarItems(ids, []);
                ids.forEach(id => this._statusBarItemIdToCellMap.delete(id));
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
            this._viewCells.forEach((cell, i) => {
                if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                    editingCells[i] = true;
                }
                if (cell.isInputCollapsed) {
                    collapsedInputCells[i] = true;
                }
                if (cell instanceof codeCellViewModel_1.CodeCellViewModel && cell.isOutputCollapsed) {
                    collapsedOutputCells[i] = true;
                }
                if (cell.lineNumbers !== 'inherit') {
                    cellLineNumberStates[i] = cell.lineNumbers;
                }
            });
            const editorViewStates = {};
            this._viewCells.map(cell => ({ handle: cell.model.handle, state: cell.saveEditorViewState() })).forEach((viewState, i) => {
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
            this._viewCells.forEach((cell, index) => {
                const isEditing = viewState.editingCells && viewState.editingCells[index];
                const editorViewState = viewState.editorViewStates && viewState.editorViewStates[index];
                cell.updateEditState(isEditing ? notebookBrowser_1.CellEditState.Editing : notebookBrowser_1.CellEditState.Preview, 'viewState');
                const cellHeight = viewState.cellTotalHeights ? viewState.cellTotalHeights[index] : undefined;
                cell.restoreEditorViewState(editorViewState, cellHeight);
                if (viewState.collapsedInputCells && viewState.collapsedInputCells[index]) {
                    cell.isInputCollapsed = true;
                }
                if (viewState.collapsedOutputCells && viewState.collapsedOutputCells[index] && cell instanceof codeCellViewModel_1.CodeCellViewModel) {
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
                    return this._deltaModelDecorationsImpl(oldDecorations, newDecorations);
                }
            };
            let result = null;
            try {
                result = callback(changeAccessor);
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
            changeAccessor.deltaDecorations = invalidFunc;
            return result;
        }
        _deltaModelDecorationsImpl(oldDecorations, newDecorations) {
            const mapping = new Map();
            oldDecorations.forEach(oldDecoration => {
                const ownerId = oldDecoration.ownerId;
                if (!mapping.has(ownerId)) {
                    const cell = this._viewCells.find(cell => cell.handle === ownerId);
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
                    const cell = this._viewCells.find(cell => cell.handle === ownerId);
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
            this._viewCells.forEach((cell, index) => {
                const cellMatches = cell.startFind(value, options);
                if (cellMatches) {
                    matches.push(new findModel_1.CellFindMatchModel(cellMatches.cell, index, cellMatches.contentMatches, []));
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
            this._lastNotebookEditResource.push(viewCell.uri);
            return viewCell.resolveTextModel().then(() => {
                this._bulkEditService.apply([new bulkEditService_1.ResourceTextEdit(cell.uri, { range, text })], { quotableLabel: 'Notebook Replace' });
            });
        }
        async replaceAll(matches, texts) {
            if (!matches.length) {
                return;
            }
            const textEdits = [];
            this._lastNotebookEditResource.push(matches[0].cell.uri);
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
                this._bulkEditService.apply({ edits: textEdits }, { quotableLabel: 'Notebook Replace All' });
                return;
            });
        }
        //#endregion
        //#region Undo/Redo
        async _withElement(element, callback) {
            const viewCells = this._viewCells.filter(cell => element.matchesResource(cell.uri));
            const refs = await Promise.all(viewCells.map(cell => this._textModelService.createModelReference(cell.uri)));
            await callback();
            refs.forEach(ref => ref.dispose());
        }
        async undo() {
            const editStack = this._undoService.getElements(this.uri);
            const element = editStack.past.length ? editStack.past[editStack.past.length - 1] : undefined;
            if (element && element instanceof editStack_1.SingleModelEditStackElement || element instanceof editStack_1.MultiModelEditStackElement) {
                await this._withElement(element, async () => {
                    await this._undoService.undo(this.uri);
                });
                return (element instanceof editStack_1.SingleModelEditStackElement) ? [element.resource] : element.resources;
            }
            await this._undoService.undo(this.uri);
            return [];
        }
        async redo() {
            const editStack = this._undoService.getElements(this.uri);
            const element = editStack.future[0];
            if (element && element instanceof editStack_1.SingleModelEditStackElement || element instanceof editStack_1.MultiModelEditStackElement) {
                await this._withElement(element, async () => {
                    await this._undoService.redo(this.uri);
                });
                return (element instanceof editStack_1.SingleModelEditStackElement) ? [element.resource] : element.resources;
            }
            await this._undoService.redo(this.uri);
            return [];
        }
        //#endregion
        equal(notebook) {
            return this._notebook === notebook;
        }
        dispose() {
            this._localStore.clear();
            this._viewCells.forEach(cell => {
                cell.dispose();
            });
            super.dispose();
        }
    };
    exports.NotebookViewModel = NotebookViewModel;
    exports.NotebookViewModel = NotebookViewModel = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, bulkEditService_1.IBulkEditService),
        __param(7, undoRedo_1.IUndoRedoService),
        __param(8, resolverService_1.ITextModelService),
        __param(9, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], NotebookViewModel);
    function createCellViewModel(instantiationService, notebookViewModel, cell, viewContext) {
        if (cell.cellKind === notebookCommon_1.CellKind.Code) {
            return instantiationService.createInstance(codeCellViewModel_1.CodeCellViewModel, notebookViewModel.viewType, cell, notebookViewModel.layoutInfo, viewContext);
        }
        else {
            return instantiationService.createInstance(markupCellViewModel_1.MarkupCellViewModel, notebookViewModel.viewType, cell, notebookViewModel.layoutInfo, notebookViewModel, viewContext);
        }
    }
    exports.createCellViewModel = createCellViewModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tWaWV3TW9kZWxJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3TW9kZWwvbm90ZWJvb2tWaWV3TW9kZWxJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtDaEcsTUFBTSxXQUFXLEdBQUcsR0FBRyxFQUFFLEdBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTFFLE1BQU0sZUFBZTtRQUdwQjtZQUNDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLDJCQUFZLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBRU0sY0FBYyxDQUFDLEtBQWEsRUFBRSxHQUFXLEVBQUUsYUFBcUIsRUFBRSxtQkFBNEIsRUFBRSxlQUF1QixFQUFFLHdCQUFpQyxLQUFLO1lBQ3JLLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsbUJBQW1CLEVBQUUsZUFBZSxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDeEksT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRU0sTUFBTSxDQUFDLGFBQXFCLEVBQUUsbUJBQTRCLEVBQUUsaUJBQTBCLEVBQUUsZUFBdUIsRUFBRSxxQkFBOEI7WUFDckosT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxtQkFBbUIsRUFBRSxlQUFlLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUVqSCxDQUFDO1FBRU0scUJBQXFCLENBQUMsT0FBZTtZQUMzQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFD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