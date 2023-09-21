/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/cursorCommon", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, cursorCommon_1, position_1, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Cursor = void 0;
    /**
     * Represents a single cursor.
    */
    class Cursor {
        constructor(context) {
            this._selTrackedRange = null;
            this._trackSelection = true;
            this._setState(context, new cursorCommon_1.SingleCursorState(new range_1.Range(1, 1, 1, 1), 0 /* SelectionStartKind.Simple */, 0, new position_1.Position(1, 1), 0), new cursorCommon_1.SingleCursorState(new range_1.Range(1, 1, 1, 1), 0 /* SelectionStartKind.Simple */, 0, new position_1.Position(1, 1), 0));
        }
        dispose(context) {
            this._removeTrackedRange(context);
        }
        startTrackingSelection(context) {
            this._trackSelection = true;
            this._updateTrackedRange(context);
        }
        stopTrackingSelection(context) {
            this._trackSelection = false;
            this._removeTrackedRange(context);
        }
        _updateTrackedRange(context) {
            if (!this._trackSelection) {
                // don't track the selection
                return;
            }
            this._selTrackedRange = context.model._setTrackedRange(this._selTrackedRange, this.modelState.selection, 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */);
        }
        _removeTrackedRange(context) {
            this._selTrackedRange = context.model._setTrackedRange(this._selTrackedRange, null, 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */);
        }
        asCursorState() {
            return new cursorCommon_1.CursorState(this.modelState, this.viewState);
        }
        readSelectionFromMarkers(context) {
            const range = context.model._getTrackedRange(this._selTrackedRange);
            if (this.modelState.selection.isEmpty() && !range.isEmpty()) {
                // Avoid selecting text when recovering from markers
                return selection_1.Selection.fromRange(range.collapseToEnd(), this.modelState.selection.getDirection());
            }
            return selection_1.Selection.fromRange(range, this.modelState.selection.getDirection());
        }
        ensureValidState(context) {
            this._setState(context, this.modelState, this.viewState);
        }
        setState(context, modelState, viewState) {
            this._setState(context, modelState, viewState);
        }
        static _validatePositionWithCache(viewModel, position, cacheInput, cacheOutput) {
            if (position.equals(cacheInput)) {
                return cacheOutput;
            }
            return viewModel.normalizePosition(position, 2 /* PositionAffinity.None */);
        }
        static _validateViewState(viewModel, viewState) {
            const position = viewState.position;
            const sStartPosition = viewState.selectionStart.getStartPosition();
            const sEndPosition = viewState.selectionStart.getEndPosition();
            const validPosition = viewModel.normalizePosition(position, 2 /* PositionAffinity.None */);
            const validSStartPosition = this._validatePositionWithCache(viewModel, sStartPosition, position, validPosition);
            const validSEndPosition = this._validatePositionWithCache(viewModel, sEndPosition, sStartPosition, validSStartPosition);
            if (position.equals(validPosition) && sStartPosition.equals(validSStartPosition) && sEndPosition.equals(validSEndPosition)) {
                // fast path: the state is valid
                return viewState;
            }
            return new cursorCommon_1.SingleCursorState(range_1.Range.fromPositions(validSStartPosition, validSEndPosition), viewState.selectionStartKind, viewState.selectionStartLeftoverVisibleColumns + sStartPosition.column - validSStartPosition.column, validPosition, viewState.leftoverVisibleColumns + position.column - validPosition.column);
        }
        _setState(context, modelState, viewState) {
            if (viewState) {
                viewState = Cursor._validateViewState(context.viewModel, viewState);
            }
            if (!modelState) {
                if (!viewState) {
                    return;
                }
                // We only have the view state => compute the model state
                const selectionStart = context.model.validateRange(context.coordinatesConverter.convertViewRangeToModelRange(viewState.selectionStart));
                const position = context.model.validatePosition(context.coordinatesConverter.convertViewPositionToModelPosition(viewState.position));
                modelState = new cursorCommon_1.SingleCursorState(selectionStart, viewState.selectionStartKind, viewState.selectionStartLeftoverVisibleColumns, position, viewState.leftoverVisibleColumns);
            }
            else {
                // Validate new model state
                const selectionStart = context.model.validateRange(modelState.selectionStart);
                const selectionStartLeftoverVisibleColumns = modelState.selectionStart.equalsRange(selectionStart) ? modelState.selectionStartLeftoverVisibleColumns : 0;
                const position = context.model.validatePosition(modelState.position);
                const leftoverVisibleColumns = modelState.position.equals(position) ? modelState.leftoverVisibleColumns : 0;
                modelState = new cursorCommon_1.SingleCursorState(selectionStart, modelState.selectionStartKind, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns);
            }
            if (!viewState) {
                // We only have the model state => compute the view state
                const viewSelectionStart1 = context.coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelState.selectionStart.startLineNumber, modelState.selectionStart.startColumn));
                const viewSelectionStart2 = context.coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelState.selectionStart.endLineNumber, modelState.selectionStart.endColumn));
                const viewSelectionStart = new range_1.Range(viewSelectionStart1.lineNumber, viewSelectionStart1.column, viewSelectionStart2.lineNumber, viewSelectionStart2.column);
                const viewPosition = context.coordinatesConverter.convertModelPositionToViewPosition(modelState.position);
                viewState = new cursorCommon_1.SingleCursorState(viewSelectionStart, modelState.selectionStartKind, modelState.selectionStartLeftoverVisibleColumns, viewPosition, modelState.leftoverVisibleColumns);
            }
            else {
                // Validate new view state
                const viewSelectionStart = context.coordinatesConverter.validateViewRange(viewState.selectionStart, modelState.selectionStart);
                const viewPosition = context.coordinatesConverter.validateViewPosition(viewState.position, modelState.position);
                viewState = new cursorCommon_1.SingleCursorState(viewSelectionStart, modelState.selectionStartKind, modelState.selectionStartLeftoverVisibleColumns, viewPosition, modelState.leftoverVisibleColumns);
            }
            this.modelState = modelState;
            this.viewState = viewState;
            this._updateTrackedRange(context);
        }
    }
    exports.Cursor = Cursor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25lQ3Vyc29yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jdXJzb3Ivb25lQ3Vyc29yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRzs7TUFFRTtJQUNGLE1BQWEsTUFBTTtRQVFsQixZQUFZLE9BQXNCO1lBQ2pDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDN0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFFNUIsSUFBSSxDQUFDLFNBQVMsQ0FDYixPQUFPLEVBQ1AsSUFBSSxnQ0FBaUIsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMscUNBQTZCLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNqRyxJQUFJLGdDQUFpQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxxQ0FBNkIsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ2pHLENBQUM7UUFDSCxDQUFDO1FBRU0sT0FBTyxDQUFDLE9BQXNCO1lBQ3BDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRU0sc0JBQXNCLENBQUMsT0FBc0I7WUFDbkQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTSxxQkFBcUIsQ0FBQyxPQUFzQjtZQUNsRCxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztZQUM3QixJQUFJLENBQUMsbUJB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