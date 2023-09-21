/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/oneCursor", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, arrays_1, arraysFind_1, cursorCommon_1, oneCursor_1, position_1, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CursorCollection = void 0;
    class CursorCollection {
        constructor(context) {
            this.context = context;
            this.cursors = [new oneCursor_1.Cursor(context)];
            this.lastAddedCursorIndex = 0;
        }
        dispose() {
            for (const cursor of this.cursors) {
                cursor.dispose(this.context);
            }
        }
        startTrackingSelections() {
            for (const cursor of this.cursors) {
                cursor.startTrackingSelection(this.context);
            }
        }
        stopTrackingSelections() {
            for (const cursor of this.cursors) {
                cursor.stopTrackingSelection(this.context);
            }
        }
        updateContext(context) {
            this.context = context;
        }
        ensureValidState() {
            for (const cursor of this.cursors) {
                cursor.ensureValidState(this.context);
            }
        }
        readSelectionFromMarkers() {
            return this.cursors.map(c => c.readSelectionFromMarkers(this.context));
        }
        getAll() {
            return this.cursors.map(c => c.asCursorState());
        }
        getViewPositions() {
            return this.cursors.map(c => c.viewState.position);
        }
        getTopMostViewPosition() {
            return (0, arraysFind_1.findFirstMinBy)(this.cursors, (0, arrays_1.compareBy)(c => c.viewState.position, position_1.Position.compare)).viewState.position;
        }
        getBottomMostViewPosition() {
            return (0, arraysFind_1.findLastMaxBy)(this.cursors, (0, arrays_1.compareBy)(c => c.viewState.position, position_1.Position.compare)).viewState.position;
        }
        getSelections() {
            return this.cursors.map(c => c.modelState.selection);
        }
        getViewSelections() {
            return this.cursors.map(c => c.viewState.selection);
        }
        setSelections(selections) {
            this.setStates(cursorCommon_1.CursorState.fromModelSelections(selections));
        }
        getPrimaryCursor() {
            return this.cursors[0].asCursorState();
        }
        setStates(states) {
            if (states === null) {
                return;
            }
            this.cursors[0].setState(this.context, states[0].modelState, states[0].viewState);
            this._setSecondaryStates(states.slice(1));
        }
        /**
         * Creates or disposes secondary cursors as necessary to match the number of `secondarySelections`.
         */
        _setSecondaryStates(secondaryStates) {
            const secondaryCursorsLength = this.cursors.length - 1;
            const secondaryStatesLength = secondaryStates.length;
            if (secondaryCursorsLength < secondaryStatesLength) {
                const createCnt = secondaryStatesLength - secondaryCursorsLength;
                for (let i = 0; i < createCnt; i++) {
                    this._addSecondaryCursor();
                }
            }
            else if (secondaryCursorsLength > secondaryStatesLength) {
                const removeCnt = secondaryCursorsLength - secondaryStatesLength;
                for (let i = 0; i < removeCnt; i++) {
                    this._removeSecondaryCursor(this.cursors.length - 2);
                }
            }
            for (let i = 0; i < secondaryStatesLength; i++) {
                this.cursors[i + 1].setState(this.context, secondaryStates[i].modelState, secondaryStates[i].viewState);
            }
        }
        killSecondaryCursors() {
            this._setSecondaryStates([]);
        }
        _addSecondaryCursor() {
            this.cursors.push(new oneCursor_1.Cursor(this.context));
            this.lastAddedCursorIndex = this.cursors.length - 1;
        }
        getLastAddedCursorIndex() {
            if (this.cursors.length === 1 || this.lastAddedCursorIndex === 0) {
                return 0;
            }
            return this.lastAddedCursorIndex;
        }
        _removeSecondaryCursor(removeIndex) {
            if (this.lastAddedCursorIndex >= removeIndex + 1) {
                this.lastAddedCursorIndex--;
            }
            this.cursors[removeIndex + 1].dispose(this.context);
            this.cursors.splice(removeIndex + 1, 1);
        }
        normalize() {
            if (this.cursors.length === 1) {
                return;
            }
            const cursors = this.cursors.slice(0);
            const sortedCursors = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                sortedCursors.push({
                    index: i,
                    selection: cursors[i].modelState.selection,
                });
            }
            sortedCursors.sort((0, arrays_1.compareBy)(s => s.selection, range_1.Range.compareRangesUsingStarts));
            for (let sortedCursorIndex = 0; sortedCursorIndex < sortedCursors.length - 1; sortedCursorIndex++) {
                const current = sortedCursors[sortedCursorIndex];
                const next = sortedCursors[sortedCursorIndex + 1];
                const currentSelection = current.selection;
                const nextSelection = next.selection;
                if (!this.context.cursorConfig.multiCursorMergeOverlapping) {
                    continue;
                }
                let shouldMergeCursors;
                if (nextSelection.isEmpty() || currentSelection.isEmpty()) {
                    // Merge touching cursors if one of them is collapsed
                    shouldMergeCursors = nextSelection.getStartPosition().isBeforeOrEqual(currentSelection.getEndPosition());
                }
                else {
                    // Merge only overlapping cursors (i.e. allow touching ranges)
                    shouldMergeCursors = nextSelection.getStartPosition().isBefore(currentSelection.getEndPosition());
                }
                if (shouldMergeCursors) {
                    const winnerSortedCursorIndex = current.index < next.index ? sortedCursorIndex : sortedCursorIndex + 1;
                    const looserSortedCursorIndex = current.index < next.index ? sortedCursorIndex + 1 : sortedCursorIndex;
                    const looserIndex = sortedCursors[looserSortedCursorIndex].index;
                    const winnerIndex = sortedCursors[winnerSortedCursorIndex].index;
                    const looserSelection = sortedCursors[looserSortedCursorIndex].selection;
                    const winnerSelection = sortedCursors[winnerSortedCursorIndex].selection;
                    if (!looserSelection.equalsSelection(winnerSelection)) {
                        const resultingRange = looserSelection.plusRange(winnerSelection);
                        const looserSelectionIsLTR = (looserSelection.selectionStartLineNumber === looserSelection.startLineNumber && looserSelection.selectionStartColumn === looserSelection.startColumn);
                        const winnerSelectionIsLTR = (winnerSelection.selectionStartLineNumber === winnerSelection.startLineNumber && winnerSelection.selectionStartColumn === winnerSelection.startColumn);
                        // Give more importance to the last added cursor (think Ctrl-dragging + hitting another cursor)
                        let resultingSelectionIsLTR;
                        if (looserIndex === this.lastAddedCursorIndex) {
                            resultingSelectionIsLTR = looserSelectionIsLTR;
                            this.lastAddedCursorIndex = winnerIndex;
                        }
                        else {
                            // Winner takes it all
                            resultingSelectionIsLTR = winnerSelectionIsLTR;
                        }
                        let resultingSelection;
                        if (resultingSelectionIsLTR) {
                            resultingSelection = new selection_1.Selection(resultingRange.startLineNumber, resultingRange.startColumn, resultingRange.endLineNumber, resultingRange.endColumn);
                        }
                        else {
                            resultingSelection = new selection_1.Selection(resultingRange.endLineNumber, resultingRange.endColumn, resultingRange.startLineNumber, resultingRange.startColumn);
                        }
                        sortedCursors[winnerSortedCursorIndex].selection = resultingSelection;
                        const resultingState = cursorCommon_1.CursorState.fromModelSelection(resultingSelection);
                        cursors[winnerIndex].setState(this.context, resultingState.modelState, resultingState.viewState);
                    }
                    for (const sortedCursor of sortedCursors) {
                        if (sortedCursor.index > looserIndex) {
                            sortedCursor.index--;
                        }
                    }
                    cursors.splice(looserIndex, 1);
                    sortedCursors.splice(looserSortedCursorIndex, 1);
                    this._removeSecondaryCursor(looserIndex - 1);
                    sortedCursorIndex--;
                }
            }
        }
    }
    exports.CursorCollection = CursorCollection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yQ29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY3Vyc29yL2N1cnNvckNvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQWEsZ0JBQWdCO1FBYzVCLFlBQVksT0FBc0I7WUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksa0JBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVNLE9BQU87WUFDYixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzdCO1FBQ0YsQ0FBQztRQUVNLHVCQUF1QjtZQUM3QixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDNUM7UUFDRixDQUFDO1FBRU0sc0JBQXNCO1lBQzVCLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDbEMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMzQztRQUNGLENBQUM7UUFFTSxhQUFhLENBQUMsT0FBc0I7WUFDMUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUVNLGdCQUFnQjtZQUN0QixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xDLE1BQU0sQ0FBQyxnQkFB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