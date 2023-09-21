/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/cursorCommon", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, cursorCommon_1, position_1, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WX = void 0;
    /**
     * Represents a single cursor.
    */
    class $WX {
        constructor(context) {
            this.a = null;
            this.b = true;
            this.g(context, new cursorCommon_1.$MU(new range_1.$ks(1, 1, 1, 1), 0 /* SelectionStartKind.Simple */, 0, new position_1.$js(1, 1), 0), new cursorCommon_1.$MU(new range_1.$ks(1, 1, 1, 1), 0 /* SelectionStartKind.Simple */, 0, new position_1.$js(1, 1), 0));
        }
        dispose(context) {
            this.d(context);
        }
        startTrackingSelection(context) {
            this.b = true;
            this.c(context);
        }
        stopTrackingSelection(context) {
            this.b = false;
            this.d(context);
        }
        c(context) {
            if (!this.b) {
                // don't track the selection
                return;
            }
            this.a = context.model._setTrackedRange(this.a, this.modelState.selection, 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */);
        }
        d(context) {
            this.a = context.model._setTrackedRange(this.a, null, 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */);
        }
        asCursorState() {
            return new cursorCommon_1.$JU(this.modelState, this.viewState);
        }
        readSelectionFromMarkers(context) {
            const range = context.model._getTrackedRange(this.a);
            if (this.modelState.selection.isEmpty() && !range.isEmpty()) {
                // Avoid selecting text when recovering from markers
                return selection_1.$ms.fromRange(range.collapseToEnd(), this.modelState.selection.getDirection());
            }
            return selection_1.$ms.fromRange(range, this.modelState.selection.getDirection());
        }
        ensureValidState(context) {
            this.g(context, this.modelState, this.viewState);
        }
        setState(context, modelState, viewState) {
            this.g(context, modelState, viewState);
        }
        static e(viewModel, position, cacheInput, cacheOutput) {
            if (position.equals(cacheInput)) {
                return cacheOutput;
            }
            return viewModel.normalizePosition(position, 2 /* PositionAffinity.None */);
        }
        static f(viewModel, viewState) {
            const position = viewState.position;
            const sStartPosition = viewState.selectionStart.getStartPosition();
            const sEndPosition = viewState.selectionStart.getEndPosition();
            const validPosition = viewModel.normalizePosition(position, 2 /* PositionAffinity.None */);
            const validSStartPosition = this.e(viewModel, sStartPosition, position, validPosition);
            const validSEndPosition = this.e(viewModel, sEndPosition, sStartPosition, validSStartPosition);
            if (position.equals(validPosition) && sStartPosition.equals(validSStartPosition) && sEndPosition.equals(validSEndPosition)) {
                // fast path: the state is valid
                return viewState;
            }
            return new cursorCommon_1.$MU(range_1.$ks.fromPositions(validSStartPosition, validSEndPosition), viewState.selectionStartKind, viewState.selectionStartLeftoverVisibleColumns + sStartPosition.column - validSStartPosition.column, validPosition, viewState.leftoverVisibleColumns + position.column - validPosition.column);
        }
        g(context, modelState, viewState) {
            if (viewState) {
                viewState = $WX.f(context.viewModel, viewState);
            }
            if (!modelState) {
                if (!viewState) {
                    return;
                }
                // We only have the view state => compute the model state
                const selectionStart = context.model.validateRange(context.coordinatesConverter.convertViewRangeToModelRange(viewState.selectionStart));
                const position = context.model.validatePosition(context.coordinatesConverter.convertViewPositionToModelPosition(viewState.position));
                modelState = new cursorCommon_1.$MU(selectionStart, viewState.selectionStartKind, viewState.selectionStartLeftoverVisibleColumns, position, viewState.leftoverVisibleColumns);
            }
            else {
                // Validate new model state
                const selectionStart = context.model.validateRange(modelState.selectionStart);
                const selectionStartLeftoverVisibleColumns = modelState.selectionStart.equalsRange(selectionStart) ? modelState.selectionStartLeftoverVisibleColumns : 0;
                const position = context.model.validatePosition(modelState.position);
                const leftoverVisibleColumns = modelState.position.equals(position) ? modelState.leftoverVisibleColumns : 0;
                modelState = new cursorCommon_1.$MU(selectionStart, modelState.selectionStartKind, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns);
            }
            if (!viewState) {
                // We only have the model state => compute the view state
                const viewSelectionStart1 = context.coordinatesConverter.convertModelPositionToViewPosition(new position_1.$js(modelState.selectionStart.startLineNumber, modelState.selectionStart.startColumn));
                const viewSelectionStart2 = context.coordinatesConverter.convertModelPositionToViewPosition(new position_1.$js(modelState.selectionStart.endLineNumber, modelState.selectionStart.endColumn));
                const viewSelectionStart = new range_1.$ks(viewSelectionStart1.lineNumber, viewSelectionStart1.column, viewSelectionStart2.lineNumber, viewSelectionStart2.column);
                const viewPosition = context.coordinatesConverter.convertModelPositionToViewPosition(modelState.position);
                viewState = new cursorCommon_1.$MU(viewSelectionStart, modelState.selectionStartKind, modelState.selectionStartLeftoverVisibleColumns, viewPosition, modelState.leftoverVisibleColumns);
            }
            else {
                // Validate new view state
                const viewSelectionStart = context.coordinatesConverter.validateViewRange(viewState.selectionStart, modelState.selectionStart);
                const viewPosition = context.coordinatesConverter.validateViewPosition(viewState.position, modelState.position);
                viewState = new cursorCommon_1.$MU(viewSelectionStart, modelState.selectionStartKind, modelState.selectionStartLeftoverVisibleColumns, viewPosition, modelState.leftoverVisibleColumns);
            }
            this.modelState = modelState;
            this.viewState = viewState;
            this.c(context);
        }
    }
    exports.$WX = $WX;
});
//# sourceMappingURL=oneCursor.js.map