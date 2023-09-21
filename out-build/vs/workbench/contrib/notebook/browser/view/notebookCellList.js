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
    exports.$Hob = exports.$Gob = exports.$Fob = void 0;
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
    exports.$Fob = 5000;
    function validateWebviewBoundary(element) {
        const webviewTop = 0 - (parseInt(element.style.top, 10) || 0);
        return webviewTop >= 0 && webviewTop <= exports.$Fob * 2;
    }
    let $Gob = class $Gob extends listService_1.$p4 {
        get onWillScroll() { return this.k.onWillScroll; }
        get rowsContainer() {
            return this.k.containerDomNode;
        }
        get scrollableElement() {
            return this.k.scrollableElementDomNode;
        }
        get viewModel() {
            return this.Y;
        }
        get visibleRanges() {
            return this.cb;
        }
        set visibleRanges(ranges) {
            if ((0, notebookRange_1.$RH)(this.cb, ranges)) {
                return;
            }
            this.cb = ranges;
            this.bb.fire();
        }
        get isDisposed() {
            return this.db;
        }
        get webviewElement() {
            return this.fb;
        }
        get inRenderingTransaction() {
            return this.k.inRenderingTransaction;
        }
        constructor(gb, container, hb, delegate, renderers, contextKeyService, options, listService, configurationService, instantiationService) {
            super(gb, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService);
            this.gb = gb;
            this.hb = hb;
            this.s = [];
            this.R = new lifecycle_1.$jc();
            this.S = new lifecycle_1.$jc();
            this.V = this.R.add(new event_1.$fd());
            this.onDidRemoveOutputs = this.V.event;
            this.W = this.R.add(new event_1.$fd());
            this.onDidHideOutputs = this.W.event;
            this.X = this.R.add(new event_1.$fd());
            this.onDidRemoveCellsFromView = this.X.event;
            this.Y = null;
            this.Z = [];
            this.ab = null;
            this.bb = this.R.add(new event_1.$fd());
            this.onDidChangeVisibleRanges = this.bb.event;
            this.cb = [];
            this.db = false;
            this.eb = false;
            this.fb = null;
            notebookContextKeys_1.$Znb.bindTo(this.contextKeyService).set(true);
            this.s = this.getFocusedElements();
            this.R.add(this.onDidChangeFocus((e) => {
                this.s.forEach(element => {
                    if (e.elements.indexOf(element) < 0) {
                        element.onDeselect();
                    }
                });
                this.s = e.elements;
            }));
            const notebookEditorCursorAtBoundaryContext = notebookCommon_1.$3H.bindTo(contextKeyService);
            notebookEditorCursorAtBoundaryContext.set('none');
            const notebookEditorCursorAtLineBoundaryContext = notebookCommon_1.$4H.bindTo(contextKeyService);
            notebookEditorCursorAtLineBoundaryContext.set('none');
            const cursorSelectionListener = this.R.add(new lifecycle_1.$lc());
            const textEditorAttachListener = this.R.add(new lifecycle_1.$lc());
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
            this.R.add(this.onDidChangeFocus((e) => {
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
            this.R.add(this.k.onMouseDblClick(() => {
                const focus = this.getFocusedElements()[0];
                if (focus && focus.cellKind === notebookCommon_1.CellKind.Markup && !focus.isInputCollapsed && !this.Y?.options.isReadOnly) {
                    // scroll the cell into view if out of viewport
                    const focusedCellIndex = this.mb(focus);
                    if (focusedCellIndex >= 0) {
                        this.ob(focusedCellIndex);
                    }
                    focus.updateEditState(notebookBrowser_1.CellEditState.Editing, 'dbclick');
                    focus.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                }
            }));
            // update visibleRanges
            const updateVisibleRanges = () => {
                if (!this.k.length) {
                    return;
                }
                const top = this.getViewScrollTop();
                const bottom = this.getViewScrollBottom();
                if (top >= bottom) {
                    return;
                }
                const topViewIndex = (0, numbers_1.$Hl)(this.k.indexAt(top), 0, this.k.length - 1);
                const topElement = this.k.element(topViewIndex);
                const topModelIndex = this.Y.getCellIndex(topElement);
                const bottomViewIndex = (0, numbers_1.$Hl)(this.k.indexAt(bottom), 0, this.k.length - 1);
                const bottomElement = this.k.element(bottomViewIndex);
                const bottomModelIndex = this.Y.getCellIndex(bottomElement);
                if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
                    this.visibleRanges = [{ start: topModelIndex, end: bottomModelIndex + 1 }];
                }
                else {
                    this.visibleRanges = this.lb(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
                }
            };
            this.R.add(this.k.onDidChangeContentHeight(() => {
                if (this.eb) {
                    DOM.$vO(() => {
                        updateVisibleRanges();
                    });
                }
                updateVisibleRanges();
            }));
            this.R.add(this.k.onDidScroll(() => {
                if (this.eb) {
                    DOM.$vO(() => {
                        updateVisibleRanges();
                    });
                }
                updateVisibleRanges();
            }));
        }
        C(container, virtualDelegate, renderers, viewOptions) {
            return new notebookCellListView_1.$Eob(container, virtualDelegate, renderers, viewOptions);
        }
        attachWebview(element) {
            element.style.top = `-${exports.$Fob}px`;
            this.rowsContainer.insertAdjacentElement('afterbegin', element);
            this.fb = new fastDomNode_1.$FP(element);
        }
        elementAt(position) {
            if (!this.k.length) {
                return undefined;
            }
            const idx = this.k.indexAt(position);
            const clamped = (0, numbers_1.$Hl)(idx, 0, this.k.length - 1);
            return this.element(clamped);
        }
        elementHeight(element) {
            const index = this.mb(element);
            if (index === undefined || index < 0 || index >= this.length) {
                this.mb(element);
                throw new list_1.$cQ(this.gb, `Invalid index ${index}`);
            }
            return this.k.elementHeight(index);
        }
        detachViewModel() {
            this.S.clear();
            this.Y = null;
            this.ab = null;
        }
        attachViewModel(model) {
            this.Y = model;
            this.S.add(model.onDidChangeViewCells((e) => {
                if (this.db) {
                    return;
                }
                const currentRanges = this.Z.map(id => this.Y.getTrackedRange(id)).filter(range => range !== null);
                const newVisibleViewCells = getVisibleCells(this.Y.viewCells, currentRanges);
                const oldVisibleViewCells = [];
                const oldViewCellMapping = new Set();
                for (let i = 0; i < this.length; i++) {
                    oldVisibleViewCells.push(this.element(i));
                    oldViewCellMapping.add(this.element(i).uri.toString());
                }
                const viewDiffs = (0, notebookCommon_1.$2H)(oldVisibleViewCells, newVisibleViewCells, a => {
                    return oldViewCellMapping.has(a.uri.toString());
                });
                if (e.synchronous) {
                    this.jb(viewDiffs);
                }
                else {
                    this.S.add(DOM.$vO(() => {
                        if (this.db) {
                            return;
                        }
                        this.jb(viewDiffs);
                    }));
                }
            }));
            this.S.add(model.onDidChangeSelection((e) => {
                if (e === 'view') {
                    return;
                }
                // convert model selections to view selections
                const viewSelections = (0, notebookRange_1.$PH)(model.getSelections()).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this.mb(cell));
                this.setSelection(viewSelections, undefined, true);
                const primary = (0, notebookRange_1.$PH)([model.getFocus()]).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this.mb(cell));
                if (primary.length) {
                    this.setFocus(primary, undefined, true);
                }
            }));
            const hiddenRanges = model.getHiddenRanges();
            this.setHiddenAreas(hiddenRanges, false);
            const newRanges = (0, notebookRange_1.$QH)(hiddenRanges);
            const viewCells = model.viewCells.slice(0);
            newRanges.reverse().forEach(range => {
                const removedCells = viewCells.splice(range.start, range.end - range.start + 1);
                this.X.fire(removedCells);
            });
            this.splice2(0, 0, viewCells);
        }
        jb(viewDiffs) {
            viewDiffs.reverse().forEach((diff) => {
                const hiddenOutputs = [];
                const deletedOutputs = [];
                const removedMarkdownCells = [];
                for (let i = diff.start; i < diff.start + diff.deleteCount; i++) {
                    const cell = this.element(i);
                    if (cell.cellKind === notebookCommon_1.CellKind.Code) {
                        if (this.Y.hasCell(cell)) {
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
                this.W.fire(hiddenOutputs);
                this.V.fire(deletedOutputs);
                this.X.fire(removedMarkdownCells);
            });
        }
        clear() {
            super.splice(0, this.length);
        }
        setHiddenAreas(_ranges, triggerViewUpdate) {
            if (!this.Y) {
                return false;
            }
            const newRanges = (0, notebookRange_1.$QH)(_ranges);
            // delete old tracking ranges
            const oldRanges = this.Z.map(id => this.Y.getTrackedRange(id)).filter(range => range !== null);
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
                    this.kb(newRanges);
                    return false;
                }
            }
            this.Z.forEach(id => this.Y.setTrackedRange(id, null, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */));
            const hiddenAreaIds = newRanges.map(range => this.Y.setTrackedRange(null, range, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */)).filter(id => id !== null);
            this.Z = hiddenAreaIds;
            // set hidden ranges prefix sum
            this.kb(newRanges);
            if (triggerViewUpdate) {
                this.updateHiddenAreasInView(oldRanges, newRanges);
            }
            return true;
        }
        kb(newRanges) {
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
            for (let i = start; i < this.Y.length; i++) {
                ret.push(1);
            }
            const values = new Uint32Array(ret.length);
            for (let i = 0; i < ret.length; i++) {
                values[i] = ret[i];
            }
            this.ab = new prefixSumComputer_1.$Ju(values);
        }
        /**
         * oldRanges and newRanges are all reduced and sorted.
         */
        updateHiddenAreasInView(oldRanges, newRanges) {
            const oldViewCellEntries = getVisibleCells(this.Y.viewCells, oldRanges);
            const oldViewCellMapping = new Set();
            oldViewCellEntries.forEach(cell => {
                oldViewCellMapping.add(cell.uri.toString());
            });
            const newViewCellEntries = getVisibleCells(this.Y.viewCells, newRanges);
            const viewDiffs = (0, notebookCommon_1.$2H)(oldViewCellEntries, newViewCellEntries, a => {
                return oldViewCellMapping.has(a.uri.toString());
            });
            this.jb(viewDiffs);
        }
        splice2(start, deleteCount, elements = []) {
            // we need to convert start and delete count based on hidden ranges
            if (start < 0 || start > this.k.length) {
                return;
            }
            const focusInside = DOM.$NO(document.activeElement, this.rowsContainer);
            super.splice(start, deleteCount, elements);
            if (focusInside) {
                this.domFocus();
            }
            const selectionsLeft = [];
            this.getSelectedElements().forEach(el => {
                if (this.Y.hasCell(el)) {
                    selectionsLeft.push(el.handle);
                }
            });
            if (!selectionsLeft.length && this.Y.viewCells.length) {
                // after splice, the selected cells are deleted
                this.Y.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
            }
        }
        getModelIndex(cell) {
            const viewIndex = this.indexOf(cell);
            return this.getModelIndex2(viewIndex);
        }
        getModelIndex2(viewIndex) {
            if (!this.ab) {
                return viewIndex;
            }
            const modelIndex = this.ab.getPrefixSum(viewIndex - 1);
            return modelIndex;
        }
        getViewIndex(cell) {
            const modelIndex = this.Y.getCellIndex(cell);
            return this.getViewIndex2(modelIndex);
        }
        getViewIndex2(modelIndex) {
            if (!this.ab) {
                return modelIndex;
            }
            const viewIndexInfo = this.ab.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.ab.getTotalSum()) {
                    // it's already after the last hidden range
                    return modelIndex - (this.ab.getTotalSum() - this.ab.getCount());
                }
                return undefined;
            }
            else {
                return viewIndexInfo.index;
            }
        }
        lb(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex) {
            const stack = [];
            const ranges = [];
            // there are hidden ranges
            let index = topViewIndex;
            let modelIndex = topModelIndex;
            while (index <= bottomViewIndex) {
                const accu = this.ab.getPrefixSum(index);
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
            return (0, notebookRange_1.$QH)(ranges);
        }
        getVisibleRangesPlusViewportAboveAndBelow() {
            if (this.k.length <= 0) {
                return [];
            }
            const top = Math.max(this.getViewScrollTop() - this.renderHeight, 0);
            const topViewIndex = this.k.indexAt(top);
            const topElement = this.k.element(topViewIndex);
            const topModelIndex = this.Y.getCellIndex(topElement);
            const bottom = (0, numbers_1.$Hl)(this.getViewScrollBottom() + this.renderHeight, 0, this.scrollHeight);
            const bottomViewIndex = (0, numbers_1.$Hl)(this.k.indexAt(bottom), 0, this.k.length - 1);
            const bottomElement = this.k.element(bottomViewIndex);
            const bottomModelIndex = this.Y.getCellIndex(bottomElement);
            if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
                return [{ start: topModelIndex, end: bottomModelIndex }];
            }
            else {
                return this.lb(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
            }
        }
        mb(cell) {
            if (!this.Y) {
                return -1;
            }
            const modelIndex = this.Y.getCellIndex(cell);
            if (modelIndex === -1) {
                return -1;
            }
            if (!this.ab) {
                return modelIndex;
            }
            const viewIndexInfo = this.ab.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.ab.getTotalSum()) {
                    return modelIndex - (this.ab.getTotalSum() - this.ab.getCount());
                }
            }
            return viewIndexInfo.index;
        }
        nb(modelIndex) {
            if (!this.ab) {
                return modelIndex;
            }
            const viewIndexInfo = this.ab.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.ab.getTotalSum()) {
                    return modelIndex - (this.ab.getTotalSum() - this.ab.getCount());
                }
            }
            return viewIndexInfo.index;
        }
        focusElement(cell) {
            const index = this.mb(cell);
            if (index >= 0 && this.Y) {
                // update view model first, which will update both `focus` and `selection` in a single transaction
                const focusedElementHandle = this.element(index).handle;
                this.Y.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Handle,
                    primary: focusedElementHandle,
                    selections: [focusedElementHandle]
                }, 'view');
                // update the view as previous model update will not trigger event
                this.setFocus([index], undefined, false);
            }
        }
        selectElements(elements) {
            const indices = elements.map(cell => this.mb(cell)).filter(index => index >= 0);
            this.setSelection(indices);
        }
        getCellViewScrollTop(cell) {
            const index = this.mb(cell);
            if (index === undefined || index < 0 || index >= this.length) {
                throw new list_1.$cQ(this.gb, `Invalid index ${index}`);
            }
            return this.k.elementTop(index);
        }
        getCellViewScrollBottom(cell) {
            const index = this.mb(cell);
            if (index === undefined || index < 0 || index >= this.length) {
                throw new list_1.$cQ(this.gb, `Invalid index ${index}`);
            }
            const top = this.k.elementTop(index);
            const height = this.k.elementHeight(index);
            return top + height;
        }
        setFocus(indexes, browserEvent, ignoreTextModelUpdate) {
            if (ignoreTextModelUpdate) {
                super.setFocus(indexes, browserEvent);
                return;
            }
            if (!indexes.length) {
                if (this.Y) {
                    if (this.length) {
                        // Don't allow clearing focus, #121129
                        return;
                    }
                    this.Y.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: null,
                        selections: []
                    }, 'view');
                }
            }
            else {
                if (this.Y) {
                    const focusedElementHandle = this.element(indexes[0]).handle;
                    this.Y.updateSelectionsState({
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
                if (this.Y) {
                    this.Y.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: this.getFocusedElements()[0]?.handle ?? null,
                        selections: []
                    }, 'view');
                }
            }
            else {
                if (this.Y) {
                    this.Y.updateSelectionsState({
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
            const startIndex = this.nb(range.start);
            if (startIndex < 0) {
                return;
            }
            const endIndex = this.nb(range.end - 1);
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.k.elementTop(startIndex);
            if (elementTop >= scrollTop
                && elementTop < wrapperBottom) {
                // start element is visible
                // check end
                const endElementTop = this.k.elementTop(endIndex);
                const endElementHeight = this.k.elementHeight(endIndex);
                if (endElementTop + endElementHeight <= wrapperBottom) {
                    // fully visible
                    return;
                }
                if (endElementTop >= wrapperBottom) {
                    return this.pb(endIndex, false, 2 /* CellRevealPosition.Bottom */);
                }
                if (endElementTop < wrapperBottom) {
                    // end element partially visible
                    if (endElementTop + endElementHeight - wrapperBottom < elementTop - scrollTop) {
                        // there is enough space to just scroll up a little bit to make the end element visible
                        return this.k.setScrollTop(scrollTop + endElementTop + endElementHeight - wrapperBottom);
                    }
                    else {
                        // don't even try it
                        return this.pb(startIndex, false, 0 /* CellRevealPosition.Top */);
                    }
                }
            }
            this.ob(startIndex);
        }
        ob(viewIndex, firstLine) {
            const firstIndex = this.k.firstVisibleIndex;
            if (viewIndex <= firstIndex) {
                this.pb(viewIndex, true, 0 /* CellRevealPosition.Top */, firstLine);
            }
            else {
                this.pb(viewIndex, true, 2 /* CellRevealPosition.Bottom */, firstLine);
            }
        }
        scrollToBottom() {
            const scrollHeight = this.k.scrollHeight;
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            this.k.setScrollTop(scrollHeight - (wrapperBottom - scrollTop));
        }
        //#region Reveal Cell synchronously
        revealCell(cell, revealType) {
            const index = this.mb(cell);
            if (index < 0) {
                return;
            }
            switch (revealType) {
                case 2 /* CellRevealSyncType.Top */:
                    this.pb(index, false, 0 /* CellRevealPosition.Top */);
                    break;
                case 3 /* CellRevealSyncType.Center */:
                    this.pb(index, false, 1 /* CellRevealPosition.Center */);
                    break;
                case 4 /* CellRevealSyncType.CenterIfOutsideViewport */:
                    this.pb(index, true, 1 /* CellRevealPosition.Center */);
                    break;
                case 5 /* CellRevealSyncType.FirstLineIfOutsideViewport */:
                    this.ob(index, true);
                    break;
                case 1 /* CellRevealSyncType.Default */:
                    this.ob(index);
                    break;
            }
        }
        pb(viewIndex, ignoreIfInsideViewport, revealPosition, firstLine) {
            if (viewIndex >= this.k.length) {
                return;
            }
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.k.elementTop(viewIndex);
            const elementBottom = this.k.elementHeight(viewIndex) + elementTop;
            if (ignoreIfInsideViewport) {
                if (elementTop >= scrollTop && elementBottom < wrapperBottom) {
                    // element is already fully visible
                    return;
                }
            }
            switch (revealPosition) {
                case 0 /* CellRevealPosition.Top */:
                    this.k.setScrollTop(elementTop);
                    this.k.setScrollTop(this.k.elementTop(viewIndex));
                    break;
                case 1 /* CellRevealPosition.Center */:
                case 3 /* CellRevealPosition.NearTop */:
                    {
                        // reveal the cell top in the viewport center initially
                        this.k.setScrollTop(elementTop - this.k.renderHeight / 2);
                        // cell rendered already, we now have a more accurate cell height
                        const newElementTop = this.k.elementTop(viewIndex);
                        const newElementHeight = this.k.elementHeight(viewIndex);
                        const renderHeight = this.getViewScrollBottom() - this.getViewScrollTop();
                        if (newElementHeight >= renderHeight) {
                            // cell is larger than viewport, reveal top
                            this.k.setScrollTop(newElementTop);
                        }
                        else if (revealPosition === 1 /* CellRevealPosition.Center */) {
                            this.k.setScrollTop(newElementTop + (newElementHeight / 2) - (renderHeight / 2));
                        }
                        else if (revealPosition === 3 /* CellRevealPosition.NearTop */) {
                            this.k.setScrollTop(newElementTop - (renderHeight / 5));
                        }
                    }
                    break;
                case 2 /* CellRevealPosition.Bottom */:
                    if (firstLine) {
                        const lineHeight = this.viewModel?.layoutInfo?.fontInfo.lineHeight ?? 15;
                        const padding = this.hb.getLayoutConfiguration().cellTopMargin + this.hb.getLayoutConfiguration().editorTopPadding;
                        const firstLineLocation = elementTop + lineHeight + padding;
                        if (firstLineLocation < wrapperBottom) {
                            // first line is already visible
                            return;
                        }
                        this.k.setScrollTop(this.scrollTop + (firstLineLocation - wrapperBottom));
                        break;
                    }
                    this.k.setScrollTop(this.scrollTop + (elementBottom - wrapperBottom));
                    this.k.setScrollTop(this.scrollTop + (this.k.elementTop(viewIndex) + this.k.elementHeight(viewIndex) - this.getViewScrollBottom()));
                    break;
                default:
                    break;
            }
        }
        //#endregion
        //#region Reveal Cell asynchronously
        async revealCellAsync(cell, revealType) {
            const viewIndex = this.mb(cell);
            if (viewIndex < 0) {
                return;
            }
            const revealPosition = revealType === notebookBrowser_1.CellRevealType.NearTopIfOutsideViewport ? 3 /* CellRevealPosition.NearTop */ : 1 /* CellRevealPosition.Center */;
            this.pb(viewIndex, true, revealPosition);
            // wait for the editor to be created only if the cell is in editing mode (meaning it has an editor and will focus the editor)
            if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing && !cell.editorAttached) {
                return getEditorAttachedPromise(cell);
            }
            return;
        }
        //#endregion
        //#region Reveal Cell Editor Range asynchronously
        async revealCellRangeAsync(cell, range, revealType) {
            const index = this.mb(cell);
            if (index < 0) {
                return;
            }
            switch (revealType) {
                case notebookBrowser_1.CellRevealRangeType.Default:
                    return this.qb(index, range, 1 /* CellEditorRevealType.Range */);
                case notebookBrowser_1.CellRevealRangeType.Center:
                    return this.rb(index, range, 1 /* CellEditorRevealType.Range */);
                case notebookBrowser_1.CellRevealRangeType.CenterIfOutsideViewport:
                    return this.sb(index, range, 1 /* CellEditorRevealType.Range */);
            }
        }
        // List items have real dynamic heights, which means after we set `scrollTop` based on the `elementTop(index)`, the element at `index` might still be removed from the view once all relayouting tasks are done.
        // For example, we scroll item 10 into the view upwards, in the first round, items 7, 8, 9, 10 are all in the viewport. Then item 7 and 8 resize themselves to be larger and finally item 10 is removed from the view.
        // To ensure that item 10 is always there, we need to scroll item 10 to the top edge of the viewport.
        async qb(viewIndex, range, revealType) {
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.k.elementTop(viewIndex);
            const element = this.k.element(viewIndex);
            if (element.editorAttached) {
                this.tb(viewIndex, range, revealType, false, false);
            }
            else {
                const elementHeight = this.k.elementHeight(viewIndex);
                let upwards = false;
                if (elementTop + elementHeight < scrollTop) {
                    // scroll downwards
                    this.k.setScrollTop(elementTop);
                    upwards = false;
                }
                else if (elementTop > wrapperBottom) {
                    // scroll upwards
                    this.k.setScrollTop(elementTop - this.k.renderHeight / 2);
                    upwards = true;
                }
                const editorAttachedPromise = new Promise((resolve, reject) => {
                    element.onDidChangeEditorAttachState(() => {
                        element.editorAttached ? resolve() : reject();
                    });
                });
                return editorAttachedPromise.then(() => {
                    this.tb(viewIndex, range, revealType, true, upwards);
                });
            }
        }
        async rb(viewIndex, range, revealType) {
            const reveal = (viewIndex, range, revealType) => {
                const element = this.k.element(viewIndex);
                const positionOffset = element.getPositionScrollTopOffset(range);
                const positionOffsetInView = this.k.elementTop(viewIndex) + positionOffset;
                this.k.setScrollTop(positionOffsetInView - this.k.renderHeight / 2);
                if (revealType === 1 /* CellEditorRevealType.Range */) {
                    element.revealRangeInCenter(range);
                }
            };
            const elementTop = this.k.elementTop(viewIndex);
            const viewItemOffset = elementTop;
            this.k.setScrollTop(viewItemOffset - this.k.renderHeight / 2);
            const element = this.k.element(viewIndex);
            if (!element.editorAttached) {
                return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range, revealType));
            }
            else {
                reveal(viewIndex, range, revealType);
            }
        }
        async sb(viewIndex, range, revealType) {
            const reveal = (viewIndex, range, revealType) => {
                const element = this.k.element(viewIndex);
                const positionOffset = element.getPositionScrollTopOffset(range);
                const positionOffsetInView = this.k.elementTop(viewIndex) + positionOffset;
                this.k.setScrollTop(positionOffsetInView - this.k.renderHeight / 2);
                if (revealType === 1 /* CellEditorRevealType.Range */) {
                    element.revealRangeInCenter(range);
                }
            };
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.k.elementTop(viewIndex);
            const viewItemOffset = elementTop;
            const element = this.k.element(viewIndex);
            const positionOffset = viewItemOffset + element.getPositionScrollTopOffset(range);
            if (positionOffset < scrollTop || positionOffset > wrapperBottom) {
                // let it render
                this.k.setScrollTop(positionOffset - this.k.renderHeight / 2);
                // after rendering, it might be pushed down due to markdown cell dynamic height
                const newPositionOffset = this.k.elementTop(viewIndex) + element.getPositionScrollTopOffset(range);
                this.k.setScrollTop(newPositionOffset - this.k.renderHeight / 2);
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
        tb(viewIndex, range, revealType, newlyCreated, alignToBottom) {
            const element = this.k.element(viewIndex);
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const positionOffset = element.getPositionScrollTopOffset(range);
            const elementOriginalHeight = this.k.elementHeight(viewIndex);
            if (positionOffset >= elementOriginalHeight) {
                // we are revealing a range that is beyond current element height
                // if we don't update the element height now, and directly `setTop` to reveal the range
                // the element might be scrolled out of view
                // next frame, when we update the element height, the element will never be scrolled back into view
                const newTotalHeight = element.layoutInfo.totalHeight;
                this.updateElementHeight(viewIndex, newTotalHeight);
            }
            const elementTop = this.k.elementTop(viewIndex);
            const positionTop = elementTop + positionOffset;
            // TODO@rebornix 30 ---> line height * 1.5
            if (positionTop < scrollTop) {
                this.k.setScrollTop(positionTop - 30);
            }
            else if (positionTop > wrapperBottom) {
                this.k.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
            }
            else if (newlyCreated) {
                // newly scrolled into view
                if (alignToBottom) {
                    // align to the bottom
                    this.k.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
                }
                else {
                    // align to to top
                    this.k.setScrollTop(positionTop - 30);
                }
            }
            if (revealType === 1 /* CellEditorRevealType.Range */) {
                element.revealRangeInCenter(range);
            }
        }
        //#endregion
        //#region Reveal Cell offset
        async revealCellOffsetInCenterAsync(cell, offset) {
            const viewIndex = this.mb(cell);
            if (viewIndex >= 0) {
                const element = this.k.element(viewIndex);
                const elementTop = this.k.elementTop(viewIndex);
                if (element instanceof markupCellViewModel_1.$Snb) {
                    return this.ub(viewIndex);
                }
                else {
                    const rangeOffset = element.layoutInfo.outputContainerOffset + Math.min(offset, element.layoutInfo.outputTotalHeight);
                    this.k.setScrollTop(elementTop - this.k.renderHeight / 2);
                    this.k.setScrollTop(elementTop + rangeOffset - this.k.renderHeight / 2);
                }
            }
        }
        ub(viewIndex) {
            this.pb(viewIndex, true, 1 /* CellRevealPosition.Center */);
        }
        //#endregion
        domElementOfElement(element) {
            const index = this.mb(element);
            if (index >= 0) {
                return this.k.domElement(index);
            }
            return null;
        }
        focusView() {
            this.k.domNode.focus();
        }
        triggerScrollFromMouseWheelEvent(browserEvent) {
            this.k.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.k.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        vb(index) {
            const elementTop = this.k.elementTop(index);
            const elementBottom = elementTop + this.k.elementHeight(index);
            return elementBottom < this.scrollTop;
        }
        updateElementHeight2(element, size, anchorElementIndex = null) {
            const index = this.mb(element);
            if (index === undefined || index < 0 || index >= this.length) {
                return;
            }
            if (this.vb(index)) {
                // update element above viewport
                const oldHeight = this.elementHeight(element);
                const delta = oldHeight - size;
                if (this.fb) {
                    event_1.Event.once(this.k.onWillScroll)(() => {
                        const webviewTop = parseInt(this.fb.domNode.style.top, 10);
                        if (validateWebviewBoundary(this.fb.domNode)) {
                            this.fb.setTop(webviewTop - delta);
                        }
                        else {
                            // When the webview top boundary is below the list view scrollable element top boundary, then we can't insert a markdown cell at the top
                            // or when its bottom boundary is above the list view bottom boundary, then we can't insert a markdown cell at the end
                            // thus we have to revert the webview element position to initial state `-NOTEBOOK_WEBVIEW_BOUNDARY`.
                            // this will trigger one visual flicker (as we need to update element offsets in the webview)
                            // but as long as NOTEBOOK_WEBVIEW_BOUNDARY is large enough, it will happen less often
                            this.fb.setTop(-exports.$Fob);
                        }
                    });
                }
                this.k.updateElementHeight(index, size, anchorElementIndex);
                return;
            }
            if (anchorElementIndex !== null) {
                return this.k.updateElementHeight(index, size, anchorElementIndex);
            }
            const focused = this.getFocus();
            if (!focused.length) {
                return this.k.updateElementHeight(index, size, null);
            }
            const focus = focused[0];
            if (focus <= index) {
                return this.k.updateElementHeight(index, size, focus);
            }
            // the `element` is in the viewport, it's very often that the height update is triggerred by user interaction (collapse, run cell)
            // then we should make sure that the `element`'s visual view position doesn't change.
            if (this.k.elementTop(index) >= this.k.getScrollTop()) {
                return this.k.updateElementHeight(index, size, index);
            }
            this.k.updateElementHeight(index, size, focus);
        }
        // override
        domFocus() {
            const focused = this.getFocusedElements()[0];
            const focusedDomElement = focused && this.domElementOfElement(focused);
            if (document.activeElement && focusedDomElement && focusedDomElement.contains(document.activeElement)) {
                // for example, when focus goes into monaco editor, if we refocus the list view, the editor will lose focus.
                return;
            }
            if (!platform_1.$j && document.activeElement && isContextMenuFocused()) {
                return;
            }
            super.domFocus();
        }
        focusContainer() {
            super.domFocus();
        }
        getViewScrollTop() {
            return this.k.getScrollTop();
        }
        getViewScrollBottom() {
            return this.getViewScrollTop() + this.k.renderHeight;
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
            const selectorSuffix = this.k.domId;
            if (!this.U) {
                this.U = DOM.$XO(this.k.domNode);
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
            if (newStyles !== this.U.textContent) {
                this.U.textContent = newStyles;
            }
        }
        getRenderHeight() {
            return this.k.renderHeight;
        }
        getScrollHeight() {
            return this.k.scrollHeight;
        }
        layout(height, width) {
            this.eb = true;
            super.layout(height, width);
            if (this.renderHeight === 0) {
                this.k.domNode.style.visibility = 'hidden';
            }
            else {
                this.k.domNode.style.visibility = 'initial';
            }
            this.eb = false;
        }
        dispose() {
            this.db = true;
            this.S.dispose();
            this.R.dispose();
            super.dispose();
            // un-ref
            this.s = [];
            this.Y = null;
            this.Z = [];
            this.ab = null;
            this.cb = [];
        }
    };
    exports.$Gob = $Gob;
    exports.$Gob = $Gob = __decorate([
        __param(7, listService_1.$03),
        __param(8, configuration_1.$8h),
        __param(9, instantiation_1.$Ah)
    ], $Gob);
    class $Hob extends lifecycle_1.$kc {
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
    exports.$Hob = $Hob;
    function getEditorAttachedPromise(element) {
        return new Promise((resolve, reject) => {
            event_1.Event.once(element.onDidChangeEditorAttachState)(() => element.editorAttached ? resolve() : reject());
        });
    }
    function isContextMenuFocused() {
        return !!DOM.$QO(document.activeElement, 'context-view');
    }
});
//# sourceMappingURL=notebookCellList.js.map