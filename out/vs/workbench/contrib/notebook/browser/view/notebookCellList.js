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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/list", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/common/model/prefixSumComputer", "vs/platform/configuration/common/configuration", "vs/platform/list/browser/listService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/base/common/numbers", "vs/base/browser/fastDomNode", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/view/notebookCellListView"], function (require, exports, DOM, list_1, event_1, lifecycle_1, platform_1, prefixSumComputer_1, configuration_1, listService_1, notebookBrowser_1, notebookCommon_1, notebookRange_1, notebookContextKeys_1, numbers_1, fastDomNode_1, markupCellViewModel_1, instantiation_1, notebookCellListView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListViewInfoAccessor = exports.NotebookCellList = exports.NOTEBOOK_WEBVIEW_BOUNDARY = void 0;
    var CellEditorRevealType;
    (function (CellEditorRevealType) {
        CellEditorRevealType[CellEditorRevealType["Line"] = 0] = "Line";
        CellEditorRevealType[CellEditorRevealType["Range"] = 1] = "Range";
    })(CellEditorRevealType || (CellEditorRevealType = {}));
    var CellRevealPosition;
    (function (CellRevealPosition) {
        CellRevealPosition[CellRevealPosition["Top"] = 0] = "Top";
        CellRevealPosition[CellRevealPosition["Center"] = 1] = "Center";
        CellRevealPosition[CellRevealPosition["Bottom"] = 2] = "Bottom";
        CellRevealPosition[CellRevealPosition["NearTop"] = 3] = "NearTop";
    })(CellRevealPosition || (CellRevealPosition = {}));
    function getVisibleCells(cells, hiddenRanges) {
        if (!hiddenRanges.length) {
            return cells;
        }
        let start = 0;
        let hiddenRangeIndex = 0;
        const result = [];
        while (start < cells.length && hiddenRangeIndex < hiddenRanges.length) {
            if (start < hiddenRanges[hiddenRangeIndex].start) {
                result.push(...cells.slice(start, hiddenRanges[hiddenRangeIndex].start));
            }
            start = hiddenRanges[hiddenRangeIndex].end + 1;
            hiddenRangeIndex++;
        }
        if (start < cells.length) {
            result.push(...cells.slice(start));
        }
        return result;
    }
    exports.NOTEBOOK_WEBVIEW_BOUNDARY = 5000;
    function validateWebviewBoundary(element) {
        const webviewTop = 0 - (parseInt(element.style.top, 10) || 0);
        return webviewTop >= 0 && webviewTop <= exports.NOTEBOOK_WEBVIEW_BOUNDARY * 2;
    }
    let NotebookCellList = class NotebookCellList extends listService_1.WorkbenchList {
        get onWillScroll() { return this.view.onWillScroll; }
        get rowsContainer() {
            return this.view.containerDomNode;
        }
        get scrollableElement() {
            return this.view.scrollableElementDomNode;
        }
        get viewModel() {
            return this._viewModel;
        }
        get visibleRanges() {
            return this._visibleRanges;
        }
        set visibleRanges(ranges) {
            if ((0, notebookRange_1.cellRangesEqual)(this._visibleRanges, ranges)) {
                return;
            }
            this._visibleRanges = ranges;
            this._onDidChangeVisibleRanges.fire();
        }
        get isDisposed() {
            return this._isDisposed;
        }
        get webviewElement() {
            return this._webviewElement;
        }
        get inRenderingTransaction() {
            return this.view.inRenderingTransaction;
        }
        constructor(listUser, container, notebookOptions, delegate, renderers, contextKeyService, options, listService, configurationService, instantiationService) {
            super(listUser, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService);
            this.listUser = listUser;
            this.notebookOptions = notebookOptions;
            this._previousFocusedElements = [];
            this._localDisposableStore = new lifecycle_1.DisposableStore();
            this._viewModelStore = new lifecycle_1.DisposableStore();
            this._onDidRemoveOutputs = this._localDisposableStore.add(new event_1.Emitter());
            this.onDidRemoveOutputs = this._onDidRemoveOutputs.event;
            this._onDidHideOutputs = this._localDisposableStore.add(new event_1.Emitter());
            this.onDidHideOutputs = this._onDidHideOutputs.event;
            this._onDidRemoveCellsFromView = this._localDisposableStore.add(new event_1.Emitter());
            this.onDidRemoveCellsFromView = this._onDidRemoveCellsFromView.event;
            this._viewModel = null;
            this._hiddenRangeIds = [];
            this.hiddenRangesPrefixSum = null;
            this._onDidChangeVisibleRanges = this._localDisposableStore.add(new event_1.Emitter());
            this.onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
            this._visibleRanges = [];
            this._isDisposed = false;
            this._isInLayout = false;
            this._webviewElement = null;
            notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED.bindTo(this.contextKeyService).set(true);
            this._previousFocusedElements = this.getFocusedElements();
            this._localDisposableStore.add(this.onDidChangeFocus((e) => {
                this._previousFocusedElements.forEach(element => {
                    if (e.elements.indexOf(element) < 0) {
                        element.onDeselect();
                    }
                });
                this._previousFocusedElements = e.elements;
            }));
            const notebookEditorCursorAtBoundaryContext = notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.bindTo(contextKeyService);
            notebookEditorCursorAtBoundaryContext.set('none');
            const notebookEditorCursorAtLineBoundaryContext = notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY.bindTo(contextKeyService);
            notebookEditorCursorAtLineBoundaryContext.set('none');
            const cursorSelectionListener = this._localDisposableStore.add(new lifecycle_1.MutableDisposable());
            const textEditorAttachListener = this._localDisposableStore.add(new lifecycle_1.MutableDisposable());
            const recomputeContext = (element) => {
                switch (element.cursorAtBoundary()) {
                    case notebookBrowser_1.CursorAtBoundary.Both:
                        notebookEditorCursorAtBoundaryContext.set('both');
                        break;
                    case notebookBrowser_1.CursorAtBoundary.Top:
                        notebookEditorCursorAtBoundaryContext.set('top');
                        break;
                    case notebookBrowser_1.CursorAtBoundary.Bottom:
                        notebookEditorCursorAtBoundaryContext.set('bottom');
                        break;
                    default:
                        notebookEditorCursorAtBoundaryContext.set('none');
                        break;
                }
                switch (element.cursorAtLineBoundary()) {
                    case notebookBrowser_1.CursorAtLineBoundary.Both:
                        notebookEditorCursorAtLineBoundaryContext.set('both');
                        break;
                    case notebookBrowser_1.CursorAtLineBoundary.Start:
                        notebookEditorCursorAtLineBoundaryContext.set('start');
                        break;
                    case notebookBrowser_1.CursorAtLineBoundary.End:
                        notebookEditorCursorAtLineBoundaryContext.set('end');
                        break;
                    default:
                        notebookEditorCursorAtLineBoundaryContext.set('none');
                        break;
                }
                return;
            };
            // Cursor Boundary context
            this._localDisposableStore.add(this.onDidChangeFocus((e) => {
                if (e.elements.length) {
                    // we only validate the first focused element
                    const focusedElement = e.elements[0];
                    cursorSelectionListener.value = focusedElement.onDidChangeState((e) => {
                        if (e.selectionChanged) {
                            recomputeContext(focusedElement);
                        }
                    });
                    textEditorAttachListener.value = focusedElement.onDidChangeEditorAttachState(() => {
                        if (focusedElement.editorAttached) {
                            recomputeContext(focusedElement);
                        }
                    });
                    recomputeContext(focusedElement);
                    return;
                }
                // reset context
                notebookEditorCursorAtBoundaryContext.set('none');
            }));
            this._localDisposableStore.add(this.view.onMouseDblClick(() => {
                const focus = this.getFocusedElements()[0];
                if (focus && focus.cellKind === notebookCommon_1.CellKind.Markup && !focus.isInputCollapsed && !this._viewModel?.options.isReadOnly) {
                    // scroll the cell into view if out of viewport
                    const focusedCellIndex = this._getViewIndexUpperBound(focus);
                    if (focusedCellIndex >= 0) {
                        this._revealInViewWithMinimalScrolling(focusedCellIndex);
                    }
                    focus.updateEditState(notebookBrowser_1.CellEditState.Editing, 'dbclick');
                    focus.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                }
            }));
            // update visibleRanges
            const updateVisibleRanges = () => {
                if (!this.view.length) {
                    return;
                }
                const top = this.getViewScrollTop();
                const bottom = this.getViewScrollBottom();
                if (top >= bottom) {
                    return;
                }
                const topViewIndex = (0, numbers_1.clamp)(this.view.indexAt(top), 0, this.view.length - 1);
                const topElement = this.view.element(topViewIndex);
                const topModelIndex = this._viewModel.getCellIndex(topElement);
                const bottomViewIndex = (0, numbers_1.clamp)(this.view.indexAt(bottom), 0, this.view.length - 1);
                const bottomElement = this.view.element(bottomViewIndex);
                const bottomModelIndex = this._viewModel.getCellIndex(bottomElement);
                if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
                    this.visibleRanges = [{ start: topModelIndex, end: bottomModelIndex + 1 }];
                }
                else {
                    this.visibleRanges = this._getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
                }
            };
            this._localDisposableStore.add(this.view.onDidChangeContentHeight(() => {
                if (this._isInLayout) {
                    DOM.scheduleAtNextAnimationFrame(() => {
                        updateVisibleRanges();
                    });
                }
                updateVisibleRanges();
            }));
            this._localDisposableStore.add(this.view.onDidScroll(() => {
                if (this._isInLayout) {
                    DOM.scheduleAtNextAnimationFrame(() => {
                        updateVisibleRanges();
                    });
                }
                updateVisibleRanges();
            }));
        }
        createListView(container, virtualDelegate, renderers, viewOptions) {
            return new notebookCellListView_1.NotebookCellListView(container, virtualDelegate, renderers, viewOptions);
        }
        attachWebview(element) {
            element.style.top = `-${exports.NOTEBOOK_WEBVIEW_BOUNDARY}px`;
            this.rowsContainer.insertAdjacentElement('afterbegin', element);
            this._webviewElement = new fastDomNode_1.FastDomNode(element);
        }
        elementAt(position) {
            if (!this.view.length) {
                return undefined;
            }
            const idx = this.view.indexAt(position);
            const clamped = (0, numbers_1.clamp)(idx, 0, this.view.length - 1);
            return this.element(clamped);
        }
        elementHeight(element) {
            const index = this._getViewIndexUpperBound(element);
            if (index === undefined || index < 0 || index >= this.length) {
                this._getViewIndexUpperBound(element);
                throw new list_1.ListError(this.listUser, `Invalid index ${index}`);
            }
            return this.view.elementHeight(index);
        }
        detachViewModel() {
            this._viewModelStore.clear();
            this._viewModel = null;
            this.hiddenRangesPrefixSum = null;
        }
        attachViewModel(model) {
            this._viewModel = model;
            this._viewModelStore.add(model.onDidChangeViewCells((e) => {
                if (this._isDisposed) {
                    return;
                }
                const currentRanges = this._hiddenRangeIds.map(id => this._viewModel.getTrackedRange(id)).filter(range => range !== null);
                const newVisibleViewCells = getVisibleCells(this._viewModel.viewCells, currentRanges);
                const oldVisibleViewCells = [];
                const oldViewCellMapping = new Set();
                for (let i = 0; i < this.length; i++) {
                    oldVisibleViewCells.push(this.element(i));
                    oldViewCellMapping.add(this.element(i).uri.toString());
                }
                const viewDiffs = (0, notebookCommon_1.diff)(oldVisibleViewCells, newVisibleViewCells, a => {
                    return oldViewCellMapping.has(a.uri.toString());
                });
                if (e.synchronous) {
                    this._updateElementsInWebview(viewDiffs);
                }
                else {
                    this._viewModelStore.add(DOM.scheduleAtNextAnimationFrame(() => {
                        if (this._isDisposed) {
                            return;
                        }
                        this._updateElementsInWebview(viewDiffs);
                    }));
                }
            }));
            this._viewModelStore.add(model.onDidChangeSelection((e) => {
                if (e === 'view') {
                    return;
                }
                // convert model selections to view selections
                const viewSelections = (0, notebookRange_1.cellRangesToIndexes)(model.getSelections()).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this._getViewIndexUpperBound(cell));
                this.setSelection(viewSelections, undefined, true);
                const primary = (0, notebookRange_1.cellRangesToIndexes)([model.getFocus()]).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this._getViewIndexUpperBound(cell));
                if (primary.length) {
                    this.setFocus(primary, undefined, true);
                }
            }));
            const hiddenRanges = model.getHiddenRanges();
            this.setHiddenAreas(hiddenRanges, false);
            const newRanges = (0, notebookRange_1.reduceCellRanges)(hiddenRanges);
            const viewCells = model.viewCells.slice(0);
            newRanges.reverse().forEach(range => {
                const removedCells = viewCells.splice(range.start, range.end - range.start + 1);
                this._onDidRemoveCellsFromView.fire(removedCells);
            });
            this.splice2(0, 0, viewCells);
        }
        _updateElementsInWebview(viewDiffs) {
            viewDiffs.reverse().forEach((diff) => {
                const hiddenOutputs = [];
                const deletedOutputs = [];
                const removedMarkdownCells = [];
                for (let i = diff.start; i < diff.start + diff.deleteCount; i++) {
                    const cell = this.element(i);
                    if (cell.cellKind === notebookCommon_1.CellKind.Code) {
                        if (this._viewModel.hasCell(cell)) {
                            hiddenOutputs.push(...cell?.outputsViewModels);
                        }
                        else {
                            deletedOutputs.push(...cell?.outputsViewModels);
                        }
                    }
                    else {
                        removedMarkdownCells.push(cell);
                    }
                }
                this.splice2(diff.start, diff.deleteCount, diff.toInsert);
                this._onDidHideOutputs.fire(hiddenOutputs);
                this._onDidRemoveOutputs.fire(deletedOutputs);
                this._onDidRemoveCellsFromView.fire(removedMarkdownCells);
            });
        }
        clear() {
            super.splice(0, this.length);
        }
        setHiddenAreas(_ranges, triggerViewUpdate) {
            if (!this._viewModel) {
                return false;
            }
            const newRanges = (0, notebookRange_1.reduceCellRanges)(_ranges);
            // delete old tracking ranges
            const oldRanges = this._hiddenRangeIds.map(id => this._viewModel.getTrackedRange(id)).filter(range => range !== null);
            if (newRanges.length === oldRanges.length) {
                let hasDifference = false;
                for (let i = 0; i < newRanges.length; i++) {
                    if (!(newRanges[i].start === oldRanges[i].start && newRanges[i].end === oldRanges[i].end)) {
                        hasDifference = true;
                        break;
                    }
                }
                if (!hasDifference) {
                    // they call 'setHiddenAreas' for a reason, even if the ranges are still the same, it's possible that the hiddenRangeSum is not update to date
                    this._updateHiddenRangePrefixSum(newRanges);
                    return false;
                }
            }
            this._hiddenRangeIds.forEach(id => this._viewModel.setTrackedRange(id, null, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */));
            const hiddenAreaIds = newRanges.map(range => this._viewModel.setTrackedRange(null, range, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */)).filter(id => id !== null);
            this._hiddenRangeIds = hiddenAreaIds;
            // set hidden ranges prefix sum
            this._updateHiddenRangePrefixSum(newRanges);
            if (triggerViewUpdate) {
                this.updateHiddenAreasInView(oldRanges, newRanges);
            }
            return true;
        }
        _updateHiddenRangePrefixSum(newRanges) {
            let start = 0;
            let index = 0;
            const ret = [];
            while (index < newRanges.length) {
                for (let j = start; j < newRanges[index].start - 1; j++) {
                    ret.push(1);
                }
                ret.push(newRanges[index].end - newRanges[index].start + 1 + 1);
                start = newRanges[index].end + 1;
                index++;
            }
            for (let i = start; i < this._viewModel.length; i++) {
                ret.push(1);
            }
            const values = new Uint32Array(ret.length);
            for (let i = 0; i < ret.length; i++) {
                values[i] = ret[i];
            }
            this.hiddenRangesPrefixSum = new prefixSumComputer_1.PrefixSumComputer(values);
        }
        /**
         * oldRanges and newRanges are all reduced and sorted.
         */
        updateHiddenAreasInView(oldRanges, newRanges) {
            const oldViewCellEntries = getVisibleCells(this._viewModel.viewCells, oldRanges);
            const oldViewCellMapping = new Set();
            oldViewCellEntries.forEach(cell => {
                oldViewCellMapping.add(cell.uri.toString());
            });
            const newViewCellEntries = getVisibleCells(this._viewModel.viewCells, newRanges);
            const viewDiffs = (0, notebookCommon_1.diff)(oldViewCellEntries, newViewCellEntries, a => {
                return oldViewCellMapping.has(a.uri.toString());
            });
            this._updateElementsInWebview(viewDiffs);
        }
        splice2(start, deleteCount, elements = []) {
            // we need to convert start and delete count based on hidden ranges
            if (start < 0 || start > this.view.length) {
                return;
            }
            const focusInside = DOM.isAncestor(document.activeElement, this.rowsContainer);
            super.splice(start, deleteCount, elements);
            if (focusInside) {
                this.domFocus();
            }
            const selectionsLeft = [];
            this.getSelectedElements().forEach(el => {
                if (this._viewModel.hasCell(el)) {
                    selectionsLeft.push(el.handle);
                }
            });
            if (!selectionsLeft.length && this._viewModel.viewCells.length) {
                // after splice, the selected cells are deleted
                this._viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
            }
        }
        getModelIndex(cell) {
            const viewIndex = this.indexOf(cell);
            return this.getModelIndex2(viewIndex);
        }
        getModelIndex2(viewIndex) {
            if (!this.hiddenRangesPrefixSum) {
                return viewIndex;
            }
            const modelIndex = this.hiddenRangesPrefixSum.getPrefixSum(viewIndex - 1);
            return modelIndex;
        }
        getViewIndex(cell) {
            const modelIndex = this._viewModel.getCellIndex(cell);
            return this.getViewIndex2(modelIndex);
        }
        getViewIndex2(modelIndex) {
            if (!this.hiddenRangesPrefixSum) {
                return modelIndex;
            }
            const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                    // it's already after the last hidden range
                    return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
                }
                return undefined;
            }
            else {
                return viewIndexInfo.index;
            }
        }
        _getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex) {
            const stack = [];
            const ranges = [];
            // there are hidden ranges
            let index = topViewIndex;
            let modelIndex = topModelIndex;
            while (index <= bottomViewIndex) {
                const accu = this.hiddenRangesPrefixSum.getPrefixSum(index);
                if (accu === modelIndex + 1) {
                    // no hidden area after it
                    if (stack.length) {
                        if (stack[stack.length - 1] === modelIndex - 1) {
                            ranges.push({ start: stack[stack.length - 1], end: modelIndex + 1 });
                        }
                        else {
                            ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
                        }
                    }
                    stack.push(modelIndex);
                    index++;
                    modelIndex++;
                }
                else {
                    // there are hidden ranges after it
                    if (stack.length) {
                        if (stack[stack.length - 1] === modelIndex - 1) {
                            ranges.push({ start: stack[stack.length - 1], end: modelIndex + 1 });
                        }
                        else {
                            ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
                        }
                    }
                    stack.push(modelIndex);
                    index++;
                    modelIndex = accu;
                }
            }
            if (stack.length) {
                ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
            }
            return (0, notebookRange_1.reduceCellRanges)(ranges);
        }
        getVisibleRangesPlusViewportAboveAndBelow() {
            if (this.view.length <= 0) {
                return [];
            }
            const top = Math.max(this.getViewScrollTop() - this.renderHeight, 0);
            const topViewIndex = this.view.indexAt(top);
            const topElement = this.view.element(topViewIndex);
            const topModelIndex = this._viewModel.getCellIndex(topElement);
            const bottom = (0, numbers_1.clamp)(this.getViewScrollBottom() + this.renderHeight, 0, this.scrollHeight);
            const bottomViewIndex = (0, numbers_1.clamp)(this.view.indexAt(bottom), 0, this.view.length - 1);
            const bottomElement = this.view.element(bottomViewIndex);
            const bottomModelIndex = this._viewModel.getCellIndex(bottomElement);
            if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
                return [{ start: topModelIndex, end: bottomModelIndex }];
            }
            else {
                return this._getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
            }
        }
        _getViewIndexUpperBound(cell) {
            if (!this._viewModel) {
                return -1;
            }
            const modelIndex = this._viewModel.getCellIndex(cell);
            if (modelIndex === -1) {
                return -1;
            }
            if (!this.hiddenRangesPrefixSum) {
                return modelIndex;
            }
            const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                    return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
                }
            }
            return viewIndexInfo.index;
        }
        _getViewIndexUpperBound2(modelIndex) {
            if (!this.hiddenRangesPrefixSum) {
                return modelIndex;
            }
            const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                    return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
                }
            }
            return viewIndexInfo.index;
        }
        focusElement(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0 && this._viewModel) {
                // update view model first, which will update both `focus` and `selection` in a single transaction
                const focusedElementHandle = this.element(index).handle;
                this._viewModel.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Handle,
                    primary: focusedElementHandle,
                    selections: [focusedElementHandle]
                }, 'view');
                // update the view as previous model update will not trigger event
                this.setFocus([index], undefined, false);
            }
        }
        selectElements(elements) {
            const indices = elements.map(cell => this._getViewIndexUpperBound(cell)).filter(index => index >= 0);
            this.setSelection(indices);
        }
        getCellViewScrollTop(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index === undefined || index < 0 || index >= this.length) {
                throw new list_1.ListError(this.listUser, `Invalid index ${index}`);
            }
            return this.view.elementTop(index);
        }
        getCellViewScrollBottom(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index === undefined || index < 0 || index >= this.length) {
                throw new list_1.ListError(this.listUser, `Invalid index ${index}`);
            }
            const top = this.view.elementTop(index);
            const height = this.view.elementHeight(index);
            return top + height;
        }
        setFocus(indexes, browserEvent, ignoreTextModelUpdate) {
            if (ignoreTextModelUpdate) {
                super.setFocus(indexes, browserEvent);
                return;
            }
            if (!indexes.length) {
                if (this._viewModel) {
                    if (this.length) {
                        // Don't allow clearing focus, #121129
                        return;
                    }
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: null,
                        selections: []
                    }, 'view');
                }
            }
            else {
                if (this._viewModel) {
                    const focusedElementHandle = this.element(indexes[0]).handle;
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: focusedElementHandle,
                        selections: this.getSelection().map(selection => this.element(selection).handle)
                    }, 'view');
                }
            }
            super.setFocus(indexes, browserEvent);
        }
        setSelection(indexes, browserEvent, ignoreTextModelUpdate) {
            if (ignoreTextModelUpdate) {
                super.setSelection(indexes, browserEvent);
                return;
            }
            if (!indexes.length) {
                if (this._viewModel) {
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: this.getFocusedElements()[0]?.handle ?? null,
                        selections: []
                    }, 'view');
                }
            }
            else {
                if (this._viewModel) {
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: this.getFocusedElements()[0]?.handle ?? null,
                        selections: indexes.map(index => this.element(index)).map(cell => cell.handle)
                    }, 'view');
                }
            }
            super.setSelection(indexes, browserEvent);
        }
        /**
         * The range will be revealed with as little scrolling as possible.
         */
        revealCellsInView(range) {
            const startIndex = this._getViewIndexUpperBound2(range.start);
            if (startIndex < 0) {
                return;
            }
            const endIndex = this._getViewIndexUpperBound2(range.end - 1);
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(startIndex);
            if (elementTop >= scrollTop
                && elementTop < wrapperBottom) {
                // start element is visible
                // check end
                const endElementTop = this.view.elementTop(endIndex);
                const endElementHeight = this.view.elementHeight(endIndex);
                if (endElementTop + endElementHeight <= wrapperBottom) {
                    // fully visible
                    return;
                }
                if (endElementTop >= wrapperBottom) {
                    return this._revealInternal(endIndex, false, 2 /* CellRevealPosition.Bottom */);
                }
                if (endElementTop < wrapperBottom) {
                    // end element partially visible
                    if (endElementTop + endElementHeight - wrapperBottom < elementTop - scrollTop) {
                        // there is enough space to just scroll up a little bit to make the end element visible
                        return this.view.setScrollTop(scrollTop + endElementTop + endElementHeight - wrapperBottom);
                    }
                    else {
                        // don't even try it
                        return this._revealInternal(startIndex, false, 0 /* CellRevealPosition.Top */);
                    }
                }
            }
            this._revealInViewWithMinimalScrolling(startIndex);
        }
        _revealInViewWithMinimalScrolling(viewIndex, firstLine) {
            const firstIndex = this.view.firstVisibleIndex;
            if (viewIndex <= firstIndex) {
                this._revealInternal(viewIndex, true, 0 /* CellRevealPosition.Top */, firstLine);
            }
            else {
                this._revealInternal(viewIndex, true, 2 /* CellRevealPosition.Bottom */, firstLine);
            }
        }
        scrollToBottom() {
            const scrollHeight = this.view.scrollHeight;
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            this.view.setScrollTop(scrollHeight - (wrapperBottom - scrollTop));
        }
        //#region Reveal Cell synchronously
        revealCell(cell, revealType) {
            const index = this._getViewIndexUpperBound(cell);
            if (index < 0) {
                return;
            }
            switch (revealType) {
                case 2 /* CellRevealSyncType.Top */:
                    this._revealInternal(index, false, 0 /* CellRevealPosition.Top */);
                    break;
                case 3 /* CellRevealSyncType.Center */:
                    this._revealInternal(index, false, 1 /* CellRevealPosition.Center */);
                    break;
                case 4 /* CellRevealSyncType.CenterIfOutsideViewport */:
                    this._revealInternal(index, true, 1 /* CellRevealPosition.Center */);
                    break;
                case 5 /* CellRevealSyncType.FirstLineIfOutsideViewport */:
                    this._revealInViewWithMinimalScrolling(index, true);
                    break;
                case 1 /* CellRevealSyncType.Default */:
                    this._revealInViewWithMinimalScrolling(index);
                    break;
            }
        }
        _revealInternal(viewIndex, ignoreIfInsideViewport, revealPosition, firstLine) {
            if (viewIndex >= this.view.length) {
                return;
            }
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(viewIndex);
            const elementBottom = this.view.elementHeight(viewIndex) + elementTop;
            if (ignoreIfInsideViewport) {
                if (elementTop >= scrollTop && elementBottom < wrapperBottom) {
                    // element is already fully visible
                    return;
                }
            }
            switch (revealPosition) {
                case 0 /* CellRevealPosition.Top */:
                    this.view.setScrollTop(elementTop);
                    this.view.setScrollTop(this.view.elementTop(viewIndex));
                    break;
                case 1 /* CellRevealPosition.Center */:
                case 3 /* CellRevealPosition.NearTop */:
                    {
                        // reveal the cell top in the viewport center initially
                        this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                        // cell rendered already, we now have a more accurate cell height
                        const newElementTop = this.view.elementTop(viewIndex);
                        const newElementHeight = this.view.elementHeight(viewIndex);
                        const renderHeight = this.getViewScrollBottom() - this.getViewScrollTop();
                        if (newElementHeight >= renderHeight) {
                            // cell is larger than viewport, reveal top
                            this.view.setScrollTop(newElementTop);
                        }
                        else if (revealPosition === 1 /* CellRevealPosition.Center */) {
                            this.view.setScrollTop(newElementTop + (newElementHeight / 2) - (renderHeight / 2));
                        }
                        else if (revealPosition === 3 /* CellRevealPosition.NearTop */) {
                            this.view.setScrollTop(newElementTop - (renderHeight / 5));
                        }
                    }
                    break;
                case 2 /* CellRevealPosition.Bottom */:
                    if (firstLine) {
                        const lineHeight = this.viewModel?.layoutInfo?.fontInfo.lineHeight ?? 15;
                        const padding = this.notebookOptions.getLayoutConfiguration().cellTopMargin + this.notebookOptions.getLayoutConfiguration().editorTopPadding;
                        const firstLineLocation = elementTop + lineHeight + padding;
                        if (firstLineLocation < wrapperBottom) {
                            // first line is already visible
                            return;
                        }
                        this.view.setScrollTop(this.scrollTop + (firstLineLocation - wrapperBottom));
                        break;
                    }
                    this.view.setScrollTop(this.scrollTop + (elementBottom - wrapperBottom));
                    this.view.setScrollTop(this.scrollTop + (this.view.elementTop(viewIndex) + this.view.elementHeight(viewIndex) - this.getViewScrollBottom()));
                    break;
                default:
                    break;
            }
        }
        //#endregion
        //#region Reveal Cell asynchronously
        async revealCellAsync(cell, revealType) {
            const viewIndex = this._getViewIndexUpperBound(cell);
            if (viewIndex < 0) {
                return;
            }
            const revealPosition = revealType === notebookBrowser_1.CellRevealType.NearTopIfOutsideViewport ? 3 /* CellRevealPosition.NearTop */ : 1 /* CellRevealPosition.Center */;
            this._revealInternal(viewIndex, true, revealPosition);
            // wait for the editor to be created only if the cell is in editing mode (meaning it has an editor and will focus the editor)
            if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing && !cell.editorAttached) {
                return getEditorAttachedPromise(cell);
            }
            return;
        }
        //#endregion
        //#region Reveal Cell Editor Range asynchronously
        async revealCellRangeAsync(cell, range, revealType) {
            const index = this._getViewIndexUpperBound(cell);
            if (index < 0) {
                return;
            }
            switch (revealType) {
                case notebookBrowser_1.CellRevealRangeType.Default:
                    return this._revealRangeInternalAsync(index, range, 1 /* CellEditorRevealType.Range */);
                case notebookBrowser_1.CellRevealRangeType.Center:
                    return this._revealRangeInCenterInternalAsync(index, range, 1 /* CellEditorRevealType.Range */);
                case notebookBrowser_1.CellRevealRangeType.CenterIfOutsideViewport:
                    return this._revealRangeInCenterIfOutsideViewportInternalAsync(index, range, 1 /* CellEditorRevealType.Range */);
            }
        }
        // List items have real dynamic heights, which means after we set `scrollTop` based on the `elementTop(index)`, the element at `index` might still be removed from the view once all relayouting tasks are done.
        // For example, we scroll item 10 into the view upwards, in the first round, items 7, 8, 9, 10 are all in the viewport. Then item 7 and 8 resize themselves to be larger and finally item 10 is removed from the view.
        // To ensure that item 10 is always there, we need to scroll item 10 to the top edge of the viewport.
        async _revealRangeInternalAsync(viewIndex, range, revealType) {
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(viewIndex);
            const element = this.view.element(viewIndex);
            if (element.editorAttached) {
                this._revealRangeCommon(viewIndex, range, revealType, false, false);
            }
            else {
                const elementHeight = this.view.elementHeight(viewIndex);
                let upwards = false;
                if (elementTop + elementHeight < scrollTop) {
                    // scroll downwards
                    this.view.setScrollTop(elementTop);
                    upwards = false;
                }
                else if (elementTop > wrapperBottom) {
                    // scroll upwards
                    this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                    upwards = true;
                }
                const editorAttachedPromise = new Promise((resolve, reject) => {
                    element.onDidChangeEditorAttachState(() => {
                        element.editorAttached ? resolve() : reject();
                    });
                });
                return editorAttachedPromise.then(() => {
                    this._revealRangeCommon(viewIndex, range, revealType, true, upwards);
                });
            }
        }
        async _revealRangeInCenterInternalAsync(viewIndex, range, revealType) {
            const reveal = (viewIndex, range, revealType) => {
                const element = this.view.element(viewIndex);
                const positionOffset = element.getPositionScrollTopOffset(range);
                const positionOffsetInView = this.view.elementTop(viewIndex) + positionOffset;
                this.view.setScrollTop(positionOffsetInView - this.view.renderHeight / 2);
                if (revealType === 1 /* CellEditorRevealType.Range */) {
                    element.revealRangeInCenter(range);
                }
            };
            const elementTop = this.view.elementTop(viewIndex);
            const viewItemOffset = elementTop;
            this.view.setScrollTop(viewItemOffset - this.view.renderHeight / 2);
            const element = this.view.element(viewIndex);
            if (!element.editorAttached) {
                return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range, revealType));
            }
            else {
                reveal(viewIndex, range, revealType);
            }
        }
        async _revealRangeInCenterIfOutsideViewportInternalAsync(viewIndex, range, revealType) {
            const reveal = (viewIndex, range, revealType) => {
                const element = this.view.element(viewIndex);
                const positionOffset = element.getPositionScrollTopOffset(range);
                const positionOffsetInView = this.view.elementTop(viewIndex) + positionOffset;
                this.view.setScrollTop(positionOffsetInView - this.view.renderHeight / 2);
                if (revealType === 1 /* CellEditorRevealType.Range */) {
                    element.revealRangeInCenter(range);
                }
            };
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(viewIndex);
            const viewItemOffset = elementTop;
            const element = this.view.element(viewIndex);
            const positionOffset = viewItemOffset + element.getPositionScrollTopOffset(range);
            if (positionOffset < scrollTop || positionOffset > wrapperBottom) {
                // let it render
                this.view.setScrollTop(positionOffset - this.view.renderHeight / 2);
                // after rendering, it might be pushed down due to markdown cell dynamic height
                const newPositionOffset = this.view.elementTop(viewIndex) + element.getPositionScrollTopOffset(range);
                this.view.setScrollTop(newPositionOffset - this.view.renderHeight / 2);
                // reveal editor
                if (!element.editorAttached) {
                    return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range, revealType));
                }
                else {
                    // for example markdown
                }
            }
            else {
                if (element.editorAttached) {
                    element.revealRangeInCenter(range);
                }
                else {
                    // for example, markdown cell in preview mode
                    return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range, revealType));
                }
            }
        }
        _revealRangeCommon(viewIndex, range, revealType, newlyCreated, alignToBottom) {
            const element = this.view.element(viewIndex);
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const positionOffset = element.getPositionScrollTopOffset(range);
            const elementOriginalHeight = this.view.elementHeight(viewIndex);
            if (positionOffset >= elementOriginalHeight) {
                // we are revealing a range that is beyond current element height
                // if we don't update the element height now, and directly `setTop` to reveal the range
                // the element might be scrolled out of view
                // next frame, when we update the element height, the element will never be scrolled back into view
                const newTotalHeight = element.layoutInfo.totalHeight;
                this.updateElementHeight(viewIndex, newTotalHeight);
            }
            const elementTop = this.view.elementTop(viewIndex);
            const positionTop = elementTop + positionOffset;
            // TODO@rebornix 30 ---> line height * 1.5
            if (positionTop < scrollTop) {
                this.view.setScrollTop(positionTop - 30);
            }
            else if (positionTop > wrapperBottom) {
                this.view.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
            }
            else if (newlyCreated) {
                // newly scrolled into view
                if (alignToBottom) {
                    // align to the bottom
                    this.view.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
                }
                else {
                    // align to to top
                    this.view.setScrollTop(positionTop - 30);
                }
            }
            if (revealType === 1 /* CellEditorRevealType.Range */) {
                element.revealRangeInCenter(range);
            }
        }
        //#endregion
        //#region Reveal Cell offset
        async revealCellOffsetInCenterAsync(cell, offset) {
            const viewIndex = this._getViewIndexUpperBound(cell);
            if (viewIndex >= 0) {
                const element = this.view.element(viewIndex);
                const elementTop = this.view.elementTop(viewIndex);
                if (element instanceof markupCellViewModel_1.MarkupCellViewModel) {
                    return this._revealInCenterIfOutsideViewport(viewIndex);
                }
                else {
                    const rangeOffset = element.layoutInfo.outputContainerOffset + Math.min(offset, element.layoutInfo.outputTotalHeight);
                    this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                    this.view.setScrollTop(elementTop + rangeOffset - this.view.renderHeight / 2);
                }
            }
        }
        _revealInCenterIfOutsideViewport(viewIndex) {
            this._revealInternal(viewIndex, true, 1 /* CellRevealPosition.Center */);
        }
        //#endregion
        domElementOfElement(element) {
            const index = this._getViewIndexUpperBound(element);
            if (index >= 0) {
                return this.view.domElement(index);
            }
            return null;
        }
        focusView() {
            this.view.domNode.focus();
        }
        triggerScrollFromMouseWheelEvent(browserEvent) {
            this.view.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.view.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        isElementAboveViewport(index) {
            const elementTop = this.view.elementTop(index);
            const elementBottom = elementTop + this.view.elementHeight(index);
            return elementBottom < this.scrollTop;
        }
        updateElementHeight2(element, size, anchorElementIndex = null) {
            const index = this._getViewIndexUpperBound(element);
            if (index === undefined || index < 0 || index >= this.length) {
                return;
            }
            if (this.isElementAboveViewport(index)) {
                // update element above viewport
                const oldHeight = this.elementHeight(element);
                const delta = oldHeight - size;
                if (this._webviewElement) {
                    event_1.Event.once(this.view.onWillScroll)(() => {
                        const webviewTop = parseInt(this._webviewElement.domNode.style.top, 10);
                        if (validateWebviewBoundary(this._webviewElement.domNode)) {
                            this._webviewElement.setTop(webviewTop - delta);
                        }
                        else {
                            // When the webview top boundary is below the list view scrollable element top boundary, then we can't insert a markdown cell at the top
                            // or when its bottom boundary is above the list view bottom boundary, then we can't insert a markdown cell at the end
                            // thus we have to revert the webview element position to initial state `-NOTEBOOK_WEBVIEW_BOUNDARY`.
                            // this will trigger one visual flicker (as we need to update element offsets in the webview)
                            // but as long as NOTEBOOK_WEBVIEW_BOUNDARY is large enough, it will happen less often
                            this._webviewElement.setTop(-exports.NOTEBOOK_WEBVIEW_BOUNDARY);
                        }
                    });
                }
                this.view.updateElementHeight(index, size, anchorElementIndex);
                return;
            }
            if (anchorElementIndex !== null) {
                return this.view.updateElementHeight(index, size, anchorElementIndex);
            }
            const focused = this.getFocus();
            if (!focused.length) {
                return this.view.updateElementHeight(index, size, null);
            }
            const focus = focused[0];
            if (focus <= index) {
                return this.view.updateElementHeight(index, size, focus);
            }
            // the `element` is in the viewport, it's very often that the height update is triggerred by user interaction (collapse, run cell)
            // then we should make sure that the `element`'s visual view position doesn't change.
            if (this.view.elementTop(index) >= this.view.getScrollTop()) {
                return this.view.updateElementHeight(index, size, index);
            }
            this.view.updateElementHeight(index, size, focus);
        }
        // override
        domFocus() {
            const focused = this.getFocusedElements()[0];
            const focusedDomElement = focused && this.domElementOfElement(focused);
            if (document.activeElement && focusedDomElement && focusedDomElement.contains(document.activeElement)) {
                // for example, when focus goes into monaco editor, if we refocus the list view, the editor will lose focus.
                return;
            }
            if (!platform_1.isMacintosh && document.activeElement && isContextMenuFocused()) {
                return;
            }
            super.domFocus();
        }
        focusContainer() {
            super.domFocus();
        }
        getViewScrollTop() {
            return this.view.getScrollTop();
        }
        getViewScrollBottom() {
            return this.getViewScrollTop() + this.view.renderHeight;
        }
        setCellEditorSelection(cell, range) {
            const element = cell;
            if (element.editorAttached) {
                element.setSelection(range);
            }
            else {
                getEditorAttachedPromise(element).then(() => { element.setSelection(range); });
            }
        }
        style(styles) {
            const selectorSuffix = this.view.domId;
            if (!this.styleElement) {
                this.styleElement = DOM.createStyleSheet(this.view.domNode);
            }
            const suffix = selectorSuffix && `.${selectorSuffix}`;
            const content = [];
            if (styles.listBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows { background: ${styles.listBackground}; }`);
            }
            if (styles.listFocusBackground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listFocusForeground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
            }
            if (styles.listActiveSelectionBackground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listActiveSelectionForeground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
            }
            if (styles.listFocusAndSelectionBackground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
            }
            if (styles.listFocusAndSelectionForeground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
            }
            if (styles.listInactiveFocusBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionForeground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
            }
            if (styles.listHoverBackground) {
                content.push(`.monaco-list${suffix}:not(.drop-target) > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { background-color:  ${styles.listHoverBackground}; }`);
            }
            if (styles.listHoverForeground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
            }
            if (styles.listSelectionOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
            }
            if (styles.listFocusOutline) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
            }
            if (styles.listInactiveFocusOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
            }
            if (styles.listHoverOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
            }
            if (styles.listDropBackground) {
                content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-row.drop-target { background-color: ${styles.listDropBackground} !important; color: inherit !important; }
			`);
            }
            const newStyles = content.join('\n');
            if (newStyles !== this.styleElement.textContent) {
                this.styleElement.textContent = newStyles;
            }
        }
        getRenderHeight() {
            return this.view.renderHeight;
        }
        getScrollHeight() {
            return this.view.scrollHeight;
        }
        layout(height, width) {
            this._isInLayout = true;
            super.layout(height, width);
            if (this.renderHeight === 0) {
                this.view.domNode.style.visibility = 'hidden';
            }
            else {
                this.view.domNode.style.visibility = 'initial';
            }
            this._isInLayout = false;
        }
        dispose() {
            this._isDisposed = true;
            this._viewModelStore.dispose();
            this._localDisposableStore.dispose();
            super.dispose();
            // un-ref
            this._previousFocusedElements = [];
            this._viewModel = null;
            this._hiddenRangeIds = [];
            this.hiddenRangesPrefixSum = null;
            this._visibleRanges = [];
        }
    };
    exports.NotebookCellList = NotebookCellList;
    exports.NotebookCellList = NotebookCellList = __decorate([
        __param(7, listService_1.IListService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, instantiation_1.IInstantiationService)
    ], NotebookCellList);
    class ListViewInfoAccessor extends lifecycle_1.Disposable {
        constructor(list) {
            super();
            this.list = list;
        }
        getViewIndex(cell) {
            return this.list.getViewIndex(cell) ?? -1;
        }
        getViewHeight(cell) {
            if (!this.list.viewModel) {
                return -1;
            }
            return this.list.elementHeight(cell);
        }
        getCellRangeFromViewRange(startIndex, endIndex) {
            if (!this.list.viewModel) {
                return undefined;
            }
            const modelIndex = this.list.getModelIndex2(startIndex);
            if (modelIndex === undefined) {
                throw new Error(`startIndex ${startIndex} out of boundary`);
            }
            if (endIndex >= this.list.length) {
                // it's the end
                const endModelIndex = this.list.viewModel.length;
                return { start: modelIndex, end: endModelIndex };
            }
            else {
                const endModelIndex = this.list.getModelIndex2(endIndex);
                if (endModelIndex === undefined) {
                    throw new Error(`endIndex ${endIndex} out of boundary`);
                }
                return { start: modelIndex, end: endModelIndex };
            }
        }
        getCellsFromViewRange(startIndex, endIndex) {
            if (!this.list.viewModel) {
                return [];
            }
            const range = this.getCellRangeFromViewRange(startIndex, endIndex);
            if (!range) {
                return [];
            }
            return this.list.viewModel.getCellsInRange(range);
        }
        getCellsInRange(range) {
            return this.list.viewModel?.getCellsInRange(range) ?? [];
        }
        getVisibleRangesPlusViewportAboveAndBelow() {
            return this.list?.getVisibleRangesPlusViewportAboveAndBelow() ?? [];
        }
    }
    exports.ListViewInfoAccessor = ListViewInfoAccessor;
    function getEditorAttachedPromise(element) {
        return new Promise((resolve, reject) => {
            event_1.Event.once(element.onDidChangeEditorAttachState)(() => element.editorAttached ? resolve() : reject());
        });
    }
    function isContextMenuFocused() {
        return !!DOM.findParentWithClass(document.activeElement, 'context-view');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDZWxsTGlzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9ub3RlYm9va0NlbGxMaXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdDaEcsSUFBVyxvQkFHVjtJQUhELFdBQVcsb0JBQW9CO1FBQzlCLCtEQUFJLENBQUE7UUFDSixpRUFBSyxDQUFBO0lBQ04sQ0FBQyxFQUhVLG9CQUFvQixLQUFwQixvQkFBb0IsUUFHOUI7SUFFRCxJQUFXLGtCQUtWO0lBTEQsV0FBVyxrQkFBa0I7UUFDNUIseURBQUcsQ0FBQTtRQUNILCtEQUFNLENBQUE7UUFDTiwrREFBTSxDQUFBO1FBQ04saUVBQU8sQ0FBQTtJQUNSLENBQUMsRUFMVSxrQkFBa0IsS0FBbEIsa0JBQWtCLFFBSzVCO0lBRUQsU0FBUyxlQUFlLENBQUMsS0FBc0IsRUFBRSxZQUEwQjtRQUMxRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUN6QixPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDekIsTUFBTSxNQUFNLEdBQW9CLEVBQUUsQ0FBQztRQUVuQyxPQUFPLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxJQUFJLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUU7WUFDdEUsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxFQUFFO2dCQUNqRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUN6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