/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, DOM, async_1, lifecycle_1, platform, notebookBrowser_1, cellPart_1, notebookCellTextModel_1, notebookCommon_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.performCellDropEdits = exports.CellDragAndDropController = exports.CellDragAndDropPart = void 0;
    const $ = DOM.$;
    const DRAGGING_CLASS = 'cell-dragging';
    const GLOBAL_DRAG_CLASS = 'global-drag-active';
    class CellDragAndDropPart extends cellPart_1.CellContentPart {
        constructor(container) {
            super();
            this.container = container;
        }
        didRenderCell(element) {
            this.update(element);
        }
        updateState(element, e) {
            if (e.dragStateChanged) {
                this.update(element);
            }
        }
        update(element) {
            this.container.classList.toggle(DRAGGING_CLASS, element.dragging);
        }
    }
    exports.CellDragAndDropPart = CellDragAndDropPart;
    class CellDragAndDropController extends lifecycle_1.Disposable {
        constructor(notebookEditor, notebookListContainer) {
            super();
            this.notebookEditor = notebookEditor;
            this.notebookListContainer = notebookListContainer;
            this.draggedCells = [];
            this.isScrolling = false;
            this.listOnWillScrollListener = this._register(new lifecycle_1.MutableDisposable());
            this.listInsertionIndicator = DOM.append(notebookListContainer, $('.cell-list-insertion-indicator'));
            this._register(DOM.addDisposableListener(document.body, DOM.EventType.DRAG_START, this.onGlobalDragStart.bind(this), true));
            this._register(DOM.addDisposableListener(document.body, DOM.EventType.DRAG_END, this.onGlobalDragEnd.bind(this), true));
            const addCellDragListener = (eventType, handler, useCapture = false) => {
                this._register(DOM.addDisposableListener(notebookEditor.getDomNode(), eventType, e => {
                    const cellDragEvent = this.toCellDragEvent(e);
                    if (cellDragEvent) {
                        handler(cellDragEvent);
                    }
                }, useCapture));
            };
            addCellDragListener(DOM.EventType.DRAG_OVER, event => {
                if (!this.currentDraggedCell) {
                    return;
                }
                event.browserEvent.preventDefault();
                this.onCellDragover(event);
            }, true);
            addCellDragListener(DOM.EventType.DROP, event => {
                if (!this.currentDraggedCell) {
                    return;
                }
                event.browserEvent.preventDefault();
                this.onCellDrop(event);
            });
            addCellDragListener(DOM.EventType.DRAG_LEAVE, event => {
                event.browserEvent.preventDefault();
                this.onCellDragLeave(event);
            });
            this.scrollingDelayer = this._register(new async_1.Delayer(200));
        }
        setList(value) {
            this.list = value;
            this.listOnWillScrollListener.value = this.list.onWillScroll(e => {
                if (!e.scrollTopChanged) {
                    return;
                }
                this.setInsertIndicatorVisibility(false);
                this.isScrolling = true;
                this.scrollingDelayer.trigger(() => {
                    this.isScrolling = false;
                });
            });
        }
        setInsertIndicatorVisibility(visible) {
            this.listInsertionIndicator.style.opacity = visible ? '1' : '0';
        }
        toCellDragEvent(event) {
            const targetTop = this.notebookListContainer.getBoundingClientRect().top;
            const dragOffset = this.list.scrollTop + event.clientY - targetTop;
            const draggedOverCell = this.list.elementAt(dragOffset);
            if (!draggedOverCell) {
                return undefined;
            }
            const cellTop = this.list.getCellViewScrollTop(draggedOverCell);
            const cellHeight = this.list.elementHeight(draggedOverCell);
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
            this.notebookEditor.getDomNode().classList.remove(GLOBAL_DRAG_CLASS);
        }
        onGlobalDragStart() {
            this.notebookEditor.getDomNode().classList.add(GLOBAL_DRAG_CLASS);
        }
        onGlobalDragEnd() {
            this.notebookEditor.getDomNode().classList.remove(GLOBAL_DRAG_CLASS);
        }
        onCellDragover(event) {
            if (!event.browserEvent.dataTransfer) {
                return;
            }
            if (!this.currentDraggedCell) {
                event.browserEvent.dataTransfer.dropEffect = 'none';
                return;
            }
            if (this.isScrolling || this.currentDraggedCell === event.draggedOverCell) {
                this.setInsertIndicatorVisibility(false);
                return;
            }
            const dropDirection = this.getDropInsertDirection(event.dragPosRatio);
            const insertionIndicatorAbsolutePos = dropDirection === 'above' ? event.cellTop : event.cellTop + event.cellHeight;
            this.updateInsertIndicator(dropDirection, insertionIndicatorAbsolutePos);
        }
        updateInsertIndicator(dropDirection, insertionIndicatorAbsolutePos) {
            const { bottomToolbarGap } = this.notebookEditor.notebookOptions.computeBottomToolbarDimensions(this.notebookEditor.textModel?.viewType);
            const insertionIndicatorTop = insertionIndicatorAbsolutePos - this.list.scrollTop + bottomToolbarGap / 2;
            if (insertionIndicatorTop >= 0) {
                this.listInsertionIndicator.style.top = `${insertionIndicatorTop}px`;
                this.setInsertIndicatorVisibility(true);
            }
            else {
                this.setInsertIndicatorVisibility(false);
            }
        }
        getDropInsertDirection(dragPosRatio) {
            return dragPosRatio < 0.5 ? 'above' : 'below';
        }
        onCellDrop(event) {
            const draggedCell = this.currentDraggedCell;
            if (this.isScrolling || this.currentDraggedCell === event.draggedOverCell) {
                return;
            }
            this.dragCleanup();
            const dropDirection = this.getDropInsertDirection(event.dragPosRatio);
            this._dropImpl(draggedCell, dropDirection, event.browserEvent, event.draggedOverCell);
        }
        getCellRangeAroundDragTarget(draggedCellIndex) {
            const selections = this.notebookEditor.getSelections();
            const modelRanges = (0, notebookBrowser_1.expandCellRangesWithHiddenCells)(this.notebookEditor, selections);
            const nearestRange = modelRanges.find(range => range.start <= draggedCellIndex && draggedCellIndex < range.end);
            if (nearestRange) {
                return nearestRange;
            }
            else {
                return { start: draggedCellIndex, end: draggedCellIndex + 1 };
            }
        }
        _dropImpl(draggedCell, dropDirection, ctx, draggedOverCell) {
            const cellTop = this.list.getCellViewScrollTop(draggedOverCell);
            const cellHeight = this.list.elementHeight(draggedOverCell);
            const insertionIndicatorAbsolutePos = dropDirection === 'above' ? cellTop : cellTop + cellHeight;
            const { bottomToolbarGap } = this.notebookEditor.notebookOptions.computeBottomToolbarDimensions(this.notebookEditor.textModel?.viewType);
            const insertionIndicatorTop = insertionIndicatorAbsolutePos - this.list.scrollTop + bottomToolbarGap / 2;
            const editorHeight = this.notebookEditor.getDomNode().getBoundingClientRect().height;
            if (insertionIndicatorTop < 0 || insertionIndicatorTop > editorHeight) {
                // Ignore drop, insertion point is off-screen
                return;
            }
            const isCopy = (ctx.ctrlKey && !platform.isMacintosh) || (ctx.altKey && platform.isMacintosh);
            if (!this.notebookEditor.hasModel()) {
                return;
            }
            const textModel = this.notebookEditor.textModel;
            if (isCopy) {
                const draggedCellIndex = this.notebookEditor.getCellIndex(draggedCell);
                const range = this.getCellRangeAroundDragTarget(draggedCellIndex);
                let originalToIdx = this.notebookEditor.getCellIndex(draggedOverCell);
                if (dropDirection === 'below') {
                    const relativeToIndex = this.notebookEditor.getCellIndex(draggedOverCell);
                    const newIdx = this.notebookEditor.getNextVisibleCellIndex(relativeToIndex);
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
                        cells: (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(this.notebookEditor.cellAt(index).model))
                    }
                ], true, { kind: notebookCommon_1.SelectionStateType.Index, focus: this.notebookEditor.getFocus(), selections: this.notebookEditor.getSelections() }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: finalFocus, selections: [finalSelection] }), undefined, true);
                this.notebookEditor.revealCellRangeInView(finalSelection);
            }
            else {
                performCellDropEdits(this.notebookEditor, draggedCell, dropDirection, draggedOverCell);
            }
        }
        onCellDragLeave(event) {
            if (!event.browserEvent.relatedTarget || !DOM.isAncestor(event.browserEvent.relatedTarget, this.notebookEditor.getDomNode())) {
                this.setInsertIndicatorVisibility(false);
            }
        }
        dragCleanup() {
            if (this.currentDraggedCell) {
                this.draggedCells.forEach(cell => cell.dragging = false);
                this.currentDraggedCell = undefined;
                this.draggedCells = [];
            }
            this.setInsertIndicatorVisibility(false);
        }
        registerDragHandle(templateData, cellRoot, dragHandles, dragImageProvider) {
            const container = templateData.container;
            for (const dragHandle of dragHandles) {
                dragHandle.setAttribute('draggable', 'true');
            }
            const onDragEnd = () => {
                if (!this.notebookEditor.notebookOptions.getLayoutConfiguration().dragAndDropEnabled || !!this.notebookEditor.isReadOnly) {
                    return;
                }
                // Note, templateData may have a different element rendered into it by now
                container.classList.remove(DRAGGING_CLASS);
                this.dragCleanup();
            };
            for (const dragHandle of dragHandles) {
                templateData.templateDisposables.add(DOM.addDisposableListener(dragHandle, DOM.EventType.DRAG_END, onDragEnd));
            }
            const onDragStart = (event) => {
                if (!event.dataTransfer) {
                    return;
                }
                if (!this.notebookEditor.notebookOptions.getLayoutConfiguration().dragAndDropEnabled || !!this.notebookEditor.isReadOnly) {
                    return;
                }
                this.currentDraggedCell = templateData.currentRenderedCell;
                this.draggedCells = this.notebookEditor.getSelections().map(range => this.notebookEditor.getCellsInRange(range)).flat();
                this.draggedCells.forEach(cell => cell.dragging = true);
                const dragImage = dragImageProvider();
                cellRoot.parentElement.appendChild(dragImage);
                event.dataTransfer.setDragImage(dragImage, 0, 0);
                setTimeout(() => cellRoot.parentElement.removeChild(dragImage), 0); // Comment this out to debug drag image layout
            };
            for (const dragHandle of dragHandles) {
                templateData.templateDisposables.add(DOM.addDisposableListener(dragHandle, DOM.EventType.DRAG_START, onDragStart));
            }
        }
        startExplicitDrag(cell, _dragOffsetY) {
            if (!this.notebookEditor.notebookOptions.getLayoutConfiguration().dragAndDropEnabled || !!this.notebookEditor.isReadOnly) {
                return;
            }
            this.currentDraggedCell = cell;
            this.setInsertIndicatorVisibility(true);
        }
        explicitDrag(cell, dragOffsetY) {
            if (!this.notebookEditor.notebookOptions.getLayoutConfiguration().dragAndDropEnabled || !!this.notebookEditor.isReadOnly) {
                return;
            }
            const target = this.list.elementAt(dragOffsetY);
            if (target && target !== cell) {
                const cellTop = this.list.getCellViewScrollTop(target);
                const cellHeight = this.list.elementHeight(target);
                const dropDirection = this.getExplicitDragDropDirection(dragOffsetY, cellTop, cellHeight);
                const insertionIndicatorAbsolutePos = dropDirection === 'above' ? cellTop : cellTop + cellHeight;
                this.updateInsertIndicator(dropDirection, insertionIndicatorAbsolutePos);
            }
            // Try scrolling list if needed
            if (this.currentDraggedCell !== cell) {
                return;
            }
            const notebookViewRect = this.notebookEditor.getDomNode().getBoundingClientRect();
            const eventPositionInView = dragOffsetY - this.list.scrollTop;
            // Percentage from the top/bottom of the screen where we start scrolling while dragging
            const notebookViewScrollMargins = 0.2;
            const maxScrollDeltaPerFrame = 20;
            const eventPositionRatio = eventPositionInView / notebookViewRect.height;
            if (eventPositionRatio < notebookViewScrollMargins) {
                this.list.scrollTop -= maxScrollDeltaPerFrame * (1 - eventPositionRatio / notebookViewScrollMargins);
            }
            else if (eventPositionRatio > 1 - notebookViewScrollMargins) {
                this.list.scrollTop += maxScrollDeltaPerFrame * (1 - ((1 - eventPositionRatio) / notebookViewScrollMargins));
            }
        }
        endExplicitDrag(_cell) {
            this.setInsertIndicatorVisibility(false);
        }
        explicitDrop(cell, ctx) {
            this.currentDraggedCell = undefined;
            this.setInsertIndicatorVisibility(false);
            const target = this.list.elementAt(ctx.dragOffsetY);
            if (!target || target === cell) {
                return;
            }
            const cellTop = this.list.getCellViewScrollTop(target);
            const cellHeight = this.list.elementHeight(target);
            const dropDirection = this.getExplicitDragDropDirection(ctx.dragOffsetY, cellTop, cellHeight);
            this._dropImpl(cell, dropDirection, ctx, target);
        }
        getExplicitDragDropDirection(clientY, cellTop, cellHeight) {
            const dragPosInElement = clientY - cellTop;
            const dragPosRatio = dragPosInElement / cellHeight;
            return this.getDropInsertDirection(dragPosRatio);
        }
        dispose() {
            this.notebookEditor = null;
            super.dispose();
        }
    }
    exports.CellDragAndDropController = CellDragAndDropController;
    function performCellDropEdits(editor, draggedCell, dropDirection, draggedOverCell) {
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
    exports.performCellDropEdits = performCellDropEdits;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbERuZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9jZWxsUGFydHMvY2VsbERuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVoQixNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUM7SUFDdkMsTUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQztJQVkvQyxNQUFhLG1CQUFvQixTQUFRLDBCQUFlO1FBQ3ZELFlBQ2tCLFNBQXNCO1lBRXZDLEtBQUssRUFBRSxDQUFDO1lBRlMsY0FBUyxHQUFULFNBQVMsQ0FBYTtRQUd4QyxDQUFDO1FBRVEsYUFBYSxDQUFDLE9BQXVCO1lBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUVRLFdBQVcsQ0FBQyxPQUF1QixFQUFFLENBQWdDO1lBQzdFLElBQUksQ0FBQyxDQUFDLGdCQUFnQixFQUFFO2dCQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3JCO1FBQ0YsQ0FBQztRQUVPLE1BQU0sQ0FBQyxPQUF1QjtZQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRSxDQUFDO0tBQ0Q7SUFwQkQsa0RBb0JDO0lBRUQsTUFBYSx5QkFBMEIsU0FBUSxzQkFBVTtRQWV4RCxZQUNTLGNBQXVDLEVBQzlCLHFCQUFrQztZQUVuRCxLQUFLLEVBQUUsQ0FBQztZQUhBLG1CQUFjLEdBQWQsY0FBYyxDQUF5QjtZQUM5QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQWE7WUFiNUMsaUJBQVksR0FBcUIsRUFBRSxDQUFD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