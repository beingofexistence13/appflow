/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/oneCursor", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, arrays_1, arraysFind_1, cursorCommon_1, oneCursor_1, position_1, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XX = void 0;
    class $XX {
        constructor(context) {
            this.a = context;
            this.b = [new oneCursor_1.$WX(context)];
            this.d = 0;
        }
        dispose() {
            for (const cursor of this.b) {
                cursor.dispose(this.a);
            }
        }
        startTrackingSelections() {
            for (const cursor of this.b) {
                cursor.startTrackingSelection(this.a);
            }
        }
        stopTrackingSelections() {
            for (const cursor of this.b) {
                cursor.stopTrackingSelection(this.a);
            }
        }
        updateContext(context) {
            this.a = context;
        }
        ensureValidState() {
            for (const cursor of this.b) {
                cursor.ensureValidState(this.a);
            }
        }
        readSelectionFromMarkers() {
            return this.b.map(c => c.readSelectionFromMarkers(this.a));
        }
        getAll() {
            return this.b.map(c => c.asCursorState());
        }
        getViewPositions() {
            return this.b.map(c => c.viewState.position);
        }
        getTopMostViewPosition() {
            return (0, arraysFind_1.$nb)(this.b, (0, arrays_1.$5b)(c => c.viewState.position, position_1.$js.compare)).viewState.position;
        }
        getBottomMostViewPosition() {
            return (0, arraysFind_1.$mb)(this.b, (0, arrays_1.$5b)(c => c.viewState.position, position_1.$js.compare)).viewState.position;
        }
        getSelections() {
            return this.b.map(c => c.modelState.selection);
        }
        getViewSelections() {
            return this.b.map(c => c.viewState.selection);
        }
        setSelections(selections) {
            this.setStates(cursorCommon_1.$JU.fromModelSelections(selections));
        }
        getPrimaryCursor() {
            return this.b[0].asCursorState();
        }
        setStates(states) {
            if (states === null) {
                return;
            }
            this.b[0].setState(this.a, states[0].modelState, states[0].viewState);
            this.e(states.slice(1));
        }
        /**
         * Creates or disposes secondary cursors as necessary to match the number of `secondarySelections`.
         */
        e(secondaryStates) {
            const secondaryCursorsLength = this.b.length - 1;
            const secondaryStatesLength = secondaryStates.length;
            if (secondaryCursorsLength < secondaryStatesLength) {
                const createCnt = secondaryStatesLength - secondaryCursorsLength;
                for (let i = 0; i < createCnt; i++) {
                    this.f();
                }
            }
            else if (secondaryCursorsLength > secondaryStatesLength) {
                const removeCnt = secondaryCursorsLength - secondaryStatesLength;
                for (let i = 0; i < removeCnt; i++) {
                    this.g(this.b.length - 2);
                }
            }
            for (let i = 0; i < secondaryStatesLength; i++) {
                this.b[i + 1].setState(this.a, secondaryStates[i].modelState, secondaryStates[i].viewState);
            }
        }
        killSecondaryCursors() {
            this.e([]);
        }
        f() {
            this.b.push(new oneCursor_1.$WX(this.a));
            this.d = this.b.length - 1;
        }
        getLastAddedCursorIndex() {
            if (this.b.length === 1 || this.d === 0) {
                return 0;
            }
            return this.d;
        }
        g(removeIndex) {
            if (this.d >= removeIndex + 1) {
                this.d--;
            }
            this.b[removeIndex + 1].dispose(this.a);
            this.b.splice(removeIndex + 1, 1);
        }
        normalize() {
            if (this.b.length === 1) {
                return;
            }
            const cursors = this.b.slice(0);
            const sortedCursors = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                sortedCursors.push({
                    index: i,
                    selection: cursors[i].modelState.selection,
                });
            }
            sortedCursors.sort((0, arrays_1.$5b)(s => s.selection, range_1.$ks.compareRangesUsingStarts));
            for (let sortedCursorIndex = 0; sortedCursorIndex < sortedCursors.length - 1; sortedCursorIndex++) {
                const current = sortedCursors[sortedCursorIndex];
                const next = sortedCursors[sortedCursorIndex + 1];
                const currentSelection = current.selection;
                const nextSelection = next.selection;
                if (!this.a.cursorConfig.multiCursorMergeOverlapping) {
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
                        if (looserIndex === this.d) {
                            resultingSelectionIsLTR = looserSelectionIsLTR;
                            this.d = winnerIndex;
                        }
                        else {
                            // Winner takes it all
                            resultingSelectionIsLTR = winnerSelectionIsLTR;
                        }
                        let resultingSelection;
                        if (resultingSelectionIsLTR) {
                            resultingSelection = new selection_1.$ms(resultingRange.startLineNumber, resultingRange.startColumn, resultingRange.endLineNumber, resultingRange.endColumn);
                        }
                        else {
                            resultingSelection = new selection_1.$ms(resultingRange.endLineNumber, resultingRange.endColumn, resultingRange.startLineNumber, resultingRange.startColumn);
                        }
                        sortedCursors[winnerSortedCursorIndex].selection = resultingSelection;
                        const resultingState = cursorCommon_1.$JU.fromModelSelection(resultingSelection);
                        cursors[winnerIndex].setState(this.a, resultingState.modelState, resultingState.viewState);
                    }
                    for (const sortedCursor of sortedCursors) {
                        if (sortedCursor.index > looserIndex) {
                            sortedCursor.index--;
                        }
                    }
                    cursors.splice(looserIndex, 1);
                    sortedCursors.splice(looserSortedCursorIndex, 1);
                    this.g(looserIndex - 1);
                    sortedCursorIndex--;
                }
            }
        }
    }
    exports.$XX = $XX;
});
//# sourceMappingURL=cursorCollection.js.map