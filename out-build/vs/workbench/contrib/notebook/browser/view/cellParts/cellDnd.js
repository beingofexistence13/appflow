/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, DOM, async_1, lifecycle_1, platform, notebookBrowser_1, cellPart_1, notebookCellTextModel_1, notebookCommon_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Dob = exports.$Cob = exports.$Bob = void 0;
    const $ = DOM.$;
    const DRAGGING_CLASS = 'cell-dragging';
    const GLOBAL_DRAG_CLASS = 'global-drag-active';
    class $Bob extends cellPart_1.$Hnb {
        constructor(g) {
            super();
            this.g = g;
        }
        didRenderCell(element) {
            this.h(element);
        }
        updateState(element, e) {
            if (e.dragStateChanged) {
                this.h(element);
            }
        }
        h(element) {
            this.g.classList.toggle(DRAGGING_CLASS, element.dragging);
        }
    }
    exports.$Bob = $Bob;
    class $Cob extends lifecycle_1.$kc {
        constructor(r, t) {
            super();
            this.r = r;
            this.t = t;
            this.f = [];
            this.j = false;
            this.n = this.B(new lifecycle_1.$lc());
            this.g = DOM.$0O(t, $('.cell-list-insertion-indicator'));
            this.B(DOM.$nO(document.body, DOM.$3O.DRAG_START, this.y.bind(this), true));
            this.B(DOM.$nO(document.body, DOM.$3O.DRAG_END, this.z.bind(this), true));
            const addCellDragListener = (eventType, handler, useCapture = false) => {
                this.B(DOM.$nO(r.getDomNode(), eventType, e => {
                    const cellDragEvent = this.w(e);
                    if (cellDragEvent) {
                        handler(cellDragEvent);
                    }
                }, useCapture));
            };
            addCellDragListener(DOM.$3O.DRAG_OVER, event => {
                if (!this.c) {
                    return;
                }
                event.browserEvent.preventDefault();
                this.C(event);
            }, true);
            addCellDragListener(DOM.$3O.DROP, event => {
                if (!this.c) {
                    return;
                }
                event.browserEvent.preventDefault();
                this.G(event);
            });
            addCellDragListener(DOM.$3O.DRAG_LEAVE, event => {
                event.browserEvent.preventDefault();
                this.J(event);
            });
            this.m = this.B(new async_1.$Dg(200));
        }
        setList(value) {
            this.h = value;
            this.n.value = this.h.onWillScroll(e => {
                if (!e.scrollTopChanged) {
                    return;
                }
                this.u(false);
                this.j = true;
                this.m.trigger(() => {
                    this.j = false;
                });
            });
        }
        u(visible) {
            this.g.style.opacity = visible ? '1' : '0';
        }
        w(event) {
            const targetTop = this.t.getBoundingClientRect().top;
            const dragOffset = this.h.scrollTop + event.clientY - targetTop;
            const draggedOverCell = this.h.elementAt(dragOffset);
            if (!draggedOverCell) {
                return undefined;
            }
            const cellTop = this.h.getCellViewScrollTop(draggedOverCell);
            const cellHeight = this.h.elementHeight(draggedOverCell);
            const dragPosInElement = dragOffset - cellTop;
            const dragPosRatio = dragPosInElement / cellHeight;
            return {
                browserEvent: event,
                draggedOverCell,
                cellTop,
                cellHeight,
                dragPosRatio
            };
        }
        clearGlobalDragState() {
            this.r.getDomNode().classList.remove(GLOBAL_DRAG_CLASS);
        }
        y() {
            this.r.getDomNode().classList.add(GLOBAL_DRAG_CLASS);
        }
        z() {
            this.r.getDomNode().classList.remove(GLOBAL_DRAG_CLASS);
        }
        C(event) {
            if (!event.browserEvent.dataTransfer) {
                return;
            }
            if (!this.c) {
                event.browserEvent.dataTransfer.dropEffect = 'none';
                return;
            }
            if (this.j || this.c === event.draggedOverCell) {
                this.u(false);
                return;
            }
            const dropDirection = this.F(event.dragPosRatio);
            const insertionIndicatorAbsolutePos = dropDirection === 'above' ? event.cellTop : event.cellTop + event.cellHeight;
            this.D(dropDirection, insertionIndicatorAbsolutePos);
        }
        D(dropDirection, insertionIndicatorAbsolutePos) {
            const { bottomToolbarGap } = this.r.notebookOptions.computeBottomToolbarDimensions(this.r.textModel?.viewType);
            const insertionIndicatorTop = insertionIndicatorAbsolutePos - this.h.scrollTop + bottomToolbarGap / 2;
            if (insertionIndicatorTop >= 0) {
                this.g.style.top = `${insertionIndicatorTop}px`;
                this.u(true);
            }
            else {
                this.u(false);
            }
        }
        F(dragPosRatio) {
            return dragPosRatio < 0.5 ? 'above' : 'below';
        }
        G(event) {
            const draggedCell = this.c;
            if (this.j || this.c === event.draggedOverCell) {
                return;
            }
            this.L();
            const dropDirection = this.F(event.dragPosRatio);
            this.I(draggedCell, dropDirection, event.browserEvent, event.draggedOverCell);
        }
        H(draggedCellIndex) {
            const selections = this.r.getSelections();
            const modelRanges = (0, notebookBrowser_1.$1bb)(this.r, selections);
            const nearestRange = modelRanges.find(range => range.start <= draggedCellIndex && draggedCellIndex < range.end);
            if (nearestRange) {
                return nearestRange;
            }
            else {
                return { start: draggedCellIndex, end: draggedCellIndex + 1 };
            }
        }
        I(draggedCell, dropDirection, ctx, draggedOverCell) {
            const cellTop = this.h.getCellViewScrollTop(draggedOverCell);
            const cellHeight = this.h.elementHeight(draggedOverCell);
            const insertionIndicatorAbsolutePos = dropDirection === 'above' ? cellTop : cellTop + cellHeight;
            const { bottomToolbarGap } = this.r.notebookOptions.computeBottomToolbarDimensions(this.r.textModel?.viewType);
            const insertionIndicatorTop = insertionIndicatorAbsolutePos - this.h.scrollTop + bottomToolbarGap / 2;
            const editorHeight = this.r.getDomNode().getBoundingClientRect().height;
            if (insertionIndicatorTop < 0 || insertionIndicatorTop > editorHeight) {
                // Ignore drop, insertion point is off-screen
                return;
            }
            const isCopy = (ctx.ctrlKey && !platform.$j) || (ctx.altKey && platform.$j);
            if (!this.r.hasModel()) {
                return;
            }
            const textModel = this.r.textModel;
            if (isCopy) {
                const draggedCellIndex = this.r.getCellIndex(draggedCell);
                const range = this.H(draggedCellIndex);
                let originalToIdx = this.r.getCellIndex(draggedOverCell);
                if (dropDirection === 'below') {
                    const relativeToIndex = this.r.getCellIndex(draggedOverCell);
                    const newIdx = this.r.getNextVisibleCellIndex(relativeToIndex);
                    originalToIdx = newIdx;
                }
                let finalSelection;
                let finalFocus;
                if (originalToIdx <= range.start) {
                    finalSelection = { start: originalToIdx, end: originalToIdx + range.end - range.start };
                    finalFocus = { start: originalToIdx + draggedCellIndex - range.start, end: originalToIdx + draggedCellIndex - range.start + 1 };
                }
                else {
                    const delta = (originalToIdx - range.start);
                    finalSelection = { start: range.start + delta, end: range.end + delta };
                    finalFocus = { start: draggedCellIndex + delta, end: draggedCellIndex + delta + 1 };
                }
                textModel.applyEdits([
                    {
                        editType: 1 /* CellEditType.Replace */,
                        index: originalToIdx,
                        count: 0,
                        cells: (0, notebookRange_1.$PH)([range]).map(index => (0, notebookCellTextModel_1.$IH)(this.r.cellAt(index).model))
                    }
                ], true, { kind: notebookCommon_1.SelectionStateType.Index, focus: this.r.getFocus(), selections: this.r.getSelections() }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: finalFocus, selections: [finalSelection] }), undefined, true);
                this.r.revealCellRangeInView(finalSelection);
            }
            else {
                $Dob(this.r, draggedCell, dropDirection, draggedOverCell);
            }
        }
        J(event) {
            if (!event.browserEvent.relatedTarget || !DOM.$NO(event.browserEvent.relatedTarget, this.r.getDomNode())) {
                this.u(false);
            }
        }
        L() {
            if (this.c) {
                this.f.forEach(cell => cell.dragging = false);
                this.c = undefined;
                this.f = [];
            }
            this.u(false);
        }
        registerDragHandle(templateData, cellRoot, dragHandles, dragImageProvider) {
            const container = templateData.container;
            for (const dragHandle of dragHandles) {
                dragHandle.setAttribute('draggable', 'true');
            }
            const onDragEnd = () => {
                if (!this.r.notebookOptions.getLayoutConfiguration().dragAndDropEnabled || !!this.r.isReadOnly) {
                    return;
                }
                // Note, templateData may have a different element rendered into it by now
                container.classList.remove(DRAGGING_CLASS);
                this.L();
            };
            for (const dragHandle of dragHandles) {
                templateData.templateDisposables.add(DOM.$nO(dragHandle, DOM.$3O.DRAG_END, onDragEnd));
            }
            const onDragStart = (event) => {
                if (!event.dataTransfer) {
                    return;
                }
                if (!this.r.notebookOptions.getLayoutConfiguration().dragAndDropEnabled || !!this.r.isReadOnly) {
                    return;
                }
                this.c = templateData.currentRenderedCell;
                this.f = this.r.getSelections().map(range => this.r.getCellsInRange(range)).flat();
                this.f.forEach(cell => cell.dragging = true);
                const dragImage = dragImageProvider();
                cellRoot.parentElement.appendChild(dragImage);
                event.dataTransfer.setDragImage(dragImage, 0, 0);
                setTimeout(() => cellRoot.parentElement.removeChild(dragImage), 0); // Comment this out to debug drag image layout
            };
            for (const dragHandle of dragHandles) {
                templateData.templateDisposables.add(DOM.$nO(dragHandle, DOM.$3O.DRAG_START, onDragStart));
            }
        }
        startExplicitDrag(cell, _dragOffsetY) {
            if (!this.r.notebookOptions.getLayoutConfiguration().dragAndDropEnabled || !!this.r.isReadOnly) {
                return;
            }
            this.c = cell;
            this.u(true);
        }
        explicitDrag(cell, dragOffsetY) {
            if (!this.r.notebookOptions.getLayoutConfiguration().dragAndDropEnabled || !!this.r.isReadOnly) {
                return;
            }
            const target = this.h.elementAt(dragOffsetY);
            if (target && target !== cell) {
                const cellTop = this.h.getCellViewScrollTop(target);
                const cellHeight = this.h.elementHeight(target);
                const dropDirection = this.M(dragOffsetY, cellTop, cellHeight);
                const insertionIndicatorAbsolutePos = dropDirection === 'above' ? cellTop : cellTop + cellHeight;
                this.D(dropDirection, insertionIndicatorAbsolutePos);
            }
            // Try scrolling list if needed
            if (this.c !== cell) {
                return;
            }
            const notebookViewRect = this.r.getDomNode().getBoundingClientRect();
            const eventPositionInView = dragOffsetY - this.h.scrollTop;
            // Percentage from the top/bottom of the screen where we start scrolling while dragging
            const notebookViewScrollMargins = 0.2;
            const maxScrollDeltaPerFrame = 20;
            const eventPositionRatio = eventPositionInView / notebookViewRect.height;
            if (eventPositionRatio < notebookViewScrollMargins) {
                this.h.scrollTop -= maxScrollDeltaPerFrame * (1 - eventPositionRatio / notebookViewScrollMargins);
            }
            else if (eventPositionRatio > 1 - notebookViewScrollMargins) {
                this.h.scrollTop += maxScrollDeltaPerFrame * (1 - ((1 - eventPositionRatio) / notebookViewScrollMargins));
            }
        }
        endExplicitDrag(_cell) {
            this.u(false);
        }
        explicitDrop(cell, ctx) {
            this.c = undefined;
            this.u(false);
            const target = this.h.elementAt(ctx.dragOffsetY);
            if (!target || target === cell) {
                return;
            }
            const cellTop = this.h.getCellViewScrollTop(target);
            const cellHeight = this.h.elementHeight(target);
            const dropDirection = this.M(ctx.dragOffsetY, cellTop, cellHeight);
            this.I(cell, dropDirection, ctx, target);
        }
        M(clientY, cellTop, cellHeight) {
            const dragPosInElement = clientY - cellTop;
            const dragPosRatio = dragPosInElement / cellHeight;
            return this.F(dragPosRatio);
        }
        dispose() {
            this.r = null;
            super.dispose();
        }
    }
    exports.$Cob = $Cob;
    function $Dob(editor, draggedCell, dropDirection, draggedOverCell) {
        const draggedCellIndex = editor.getCellIndex(draggedCell);
        let originalToIdx = editor.getCellIndex(draggedOverCell);
        if (typeof draggedCellIndex !== 'number' || typeof originalToIdx !== 'number') {
            return;
        }
        // If dropped on a folded markdown range, insert after the folding range
        if (dropDirection === 'below') {
            const newIdx = editor.getNextVisibleCellIndex(originalToIdx) ?? originalToIdx;
            originalToIdx = newIdx;
        }
        let selections = editor.getSelections();
        if (!selections.length) {
            selections = [editor.getFocus()];
        }
        let originalFocusIdx = editor.getFocus().start;
        // If the dragged cell is not focused/selected, ignore the current focus/selection and use the dragged idx
        if (!selections.some(s => s.start <= draggedCellIndex && s.end > draggedCellIndex)) {
            selections = [{ start: draggedCellIndex, end: draggedCellIndex + 1 }];
            originalFocusIdx = draggedCellIndex;
        }
        const droppedInSelection = selections.find(range => range.start <= originalToIdx && range.end > originalToIdx);
        if (droppedInSelection) {
            originalToIdx = droppedInSelection.start;
        }
        let numCells = 0;
        let focusNewIdx = originalToIdx;
        let newInsertionIdx = originalToIdx;
        // Compute a set of edits which will be applied in reverse order by the notebook text model.
        // `index`: the starting index of the range, after previous edits have been applied
        // `newIdx`: the destination index, after this edit's range has been removed
        selections.sort((a, b) => b.start - a.start);
        const edits = selections.map(range => {
            const length = range.end - range.start;
            // If this range is before the insertion point, subtract the cells in this range from the "to" index
            let toIndexDelta = 0;
            if (range.end <= newInsertionIdx) {
                toIndexDelta = -length;
            }
            const newIdx = newInsertionIdx + toIndexDelta;
            // If this range contains the focused cell, set the new focus index to the new index of the cell
            if (originalFocusIdx >= range.start && originalFocusIdx <= range.end) {
                const offset = originalFocusIdx - range.start;
                focusNewIdx = newIdx + offset;
            }
            // If below the insertion point, the original index will have been shifted down
            const fromIndexDelta = range.start >= originalToIdx ? numCells : 0;
            const edit = {
                editType: 6 /* CellEditType.Move */,
                index: range.start + fromIndexDelta,
                length,
                newIdx
            };
            numCells += length;
            // If a range was moved down, the insertion index needs to be adjusted
            if (range.end < newInsertionIdx) {
                newInsertionIdx -= length;
            }
            return edit;
        });
        const lastEdit = edits[edits.length - 1];
        const finalSelection = { start: lastEdit.newIdx, end: lastEdit.newIdx + numCells };
        const finalFocus = { start: focusNewIdx, end: focusNewIdx + 1 };
        editor.textModel.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: editor.getFocus(), selections: editor.getSelections() }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: finalFocus, selections: [finalSelection] }), undefined, true);
        editor.revealCellRangeInView(finalSelection);
    }
    exports.$Dob = $Dob;
});
//# sourceMappingURL=cellDnd.js.map