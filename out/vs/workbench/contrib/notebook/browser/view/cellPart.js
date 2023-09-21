/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle"], function (require, exports, DOM, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellPartsCollection = exports.CellOverlayPart = exports.CellContentPart = void 0;
    /**
     * A content part is a non-floating element that is rendered inside a cell.
     * The rendering of the content part is synchronous to avoid flickering.
     */
    class CellContentPart extends lifecycle_1.Disposable {
        constructor() {
            super();
            this.cellDisposables = new lifecycle_1.DisposableStore();
        }
        /**
         * Prepare model for cell part rendering
         * No DOM operations recommended within this operation
         */
        prepareRenderCell(element) { }
        /**
         * Update the DOM for the cell `element`
         */
        renderCell(element) {
            this.currentCell = element;
            this.didRenderCell(element);
        }
        didRenderCell(element) { }
        /**
         * Dispose any disposables generated from `didRenderCell`
         */
        unrenderCell(element) {
            this.currentCell = undefined;
            this.cellDisposables.clear();
        }
        /**
         * Perform DOM read operations to prepare for the list/cell layout update.
         */
        prepareLayout() { }
        /**
         * Update internal DOM (top positions) per cell layout info change
         * Note that a cell part doesn't need to call `DOM.scheduleNextFrame`,
         * the list view will ensure that layout call is invoked in the right frame
         */
        updateInternalLayoutNow(element) { }
        /**
         * Update per cell state change
         */
        updateState(element, e) { }
        /**
         * Update per execution state change.
         */
        updateForExecutionState(element, e) { }
    }
    exports.CellContentPart = CellContentPart;
    /**
     * An overlay part renders on top of other components.
     * The rendering of the overlay part might be postponed to the next animation frame to avoid forced reflow.
     */
    class CellOverlayPart extends lifecycle_1.Disposable {
        constructor() {
            super();
            this.cellDisposables = this._register(new lifecycle_1.DisposableStore());
        }
        /**
         * Prepare model for cell part rendering
         * No DOM operations recommended within this operation
         */
        prepareRenderCell(element) { }
        /**
         * Update the DOM for the cell `element`
         */
        renderCell(element) {
            this.currentCell = element;
            this.didRenderCell(element);
        }
        didRenderCell(element) { }
        /**
         * Dispose any disposables generated from `didRenderCell`
         */
        unrenderCell(element) {
            this.currentCell = undefined;
            this.cellDisposables.clear();
        }
        /**
         * Update internal DOM (top positions) per cell layout info change
         * Note that a cell part doesn't need to call `DOM.scheduleNextFrame`,
         * the list view will ensure that layout call is invoked in the right frame
         */
        updateInternalLayoutNow(element) { }
        /**
         * Update per cell state change
         */
        updateState(element, e) { }
        /**
         * Update per execution state change.
         */
        updateForExecutionState(element, e) { }
    }
    exports.CellOverlayPart = CellOverlayPart;
    class CellPartsCollection extends lifecycle_1.Disposable {
        constructor(contentParts, overlayParts) {
            super();
            this.contentParts = contentParts;
            this.overlayParts = overlayParts;
            this._scheduledOverlayRendering = this._register(new lifecycle_1.MutableDisposable());
            this._scheduledOverlayUpdateState = this._register(new lifecycle_1.MutableDisposable());
            this._scheduledOverlayUpdateExecutionState = this._register(new lifecycle_1.MutableDisposable());
        }
        concatContentPart(other) {
            return new CellPartsCollection(this.contentParts.concat(other), this.overlayParts);
        }
        concatOverlayPart(other) {
            return new CellPartsCollection(this.contentParts, this.overlayParts.concat(other));
        }
        scheduleRenderCell(element) {
            // prepare model
            for (const part of this.contentParts) {
                part.prepareRenderCell(element);
            }
            for (const part of this.overlayParts) {
                part.prepareRenderCell(element);
            }
            // render content parts
            for (const part of this.contentParts) {
                part.renderCell(element);
            }
            this._scheduledOverlayRendering.value = DOM.modify(() => {
                for (const part of this.overlayParts) {
                    part.renderCell(element);
                }
            });
        }
        unrenderCell(element) {
            for (const part of this.contentParts) {
                part.unrenderCell(element);
            }
            this._scheduledOverlayRendering.value = undefined;
            this._scheduledOverlayUpdateState.value = undefined;
            this._scheduledOverlayUpdateExecutionState.value = undefined;
            for (const part of this.overlayParts) {
                part.unrenderCell(element);
            }
        }
        updateInternalLayoutNow(viewCell) {
            for (const part of this.contentParts) {
                part.updateInternalLayoutNow(viewCell);
            }
            for (const part of this.overlayParts) {
                part.updateInternalLayoutNow(viewCell);
            }
        }
        prepareLayout() {
            for (const part of this.contentParts) {
                part.prepareLayout();
            }
        }
        updateState(viewCell, e) {
            for (const part of this.contentParts) {
                part.updateState(viewCell, e);
            }
            this._scheduledOverlayUpdateState.value = DOM.modify(() => {
                for (const part of this.overlayParts) {
                    part.updateState(viewCell, e);
                }
            });
        }
        updateForExecutionState(viewCell, e) {
            for (const part of this.contentParts) {
                part.updateForExecutionState(viewCell, e);
            }
            this._scheduledOverlayUpdateExecutionState.value = DOM.modify(() => {
                for (const part of this.overlayParts) {
                    part.updateForExecutionState(viewCell, e);
                }
            });
        }
    }
    exports.CellPartsCollection = CellPartsCollection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFBhcnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHOzs7T0FHRztJQUNILE1BQXNCLGVBQWdCLFNBQVEsc0JBQVU7UUFJdkQ7WUFDQyxLQUFLLEVBQUUsQ0FBQztZQUhDLG9CQUFlLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFJbEQsQ0FBQztRQUVEOzs7V0FHRztRQUNILGlCQUFpQixDQUFDLE9BQXVCLElBQVUsQ0FBQztRQUVwRDs7V0FFRztRQUNILFVBQVUsQ0FBQyxPQUF1QjtZQUNqQyxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztZQUMzQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFRCxhQUFhLENBQUMsT0FBdUIsSUFBVSxDQUFDO1FBRWhEOztXQUVHO1FBQ0gsWUFBWSxDQUFDLE9BQXVCO1lBQ25DLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO1lBQzdCLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVEOztXQUVHO1FBQ0gsYUFBYSxLQUFXLENBQUM7UUFFekI7Ozs7V0FJRztRQUNILHVCQUF1QixDQUFDLE9BQXVCLElBQVUsQ0FBQztRQUUxRDs7V0FFRztRQUNILFdBQVcsQ0FBQyxPQUF1QixFQUFFLENBQWdDLElBQVUsQ0FBQztRQUVoRjs7V0FFRztRQUNILHVCQUF1QixDQUFDLE9BQXVCLEVBQUUsQ0FBa0MsSUFBVSxDQUFDO0tBQzlGO0lBckRELDBDQXFEQztJQUVEOzs7T0FHRztJQUNILE1BQXNCLGVBQWdCLFNBQVEsc0JBQVU7UUFJdkQ7WUFDQyxLQUFLLEVBQUUsQ0FBQztZQUhV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