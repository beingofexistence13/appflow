/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle"], function (require, exports, DOM, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jnb = exports.$Inb = exports.$Hnb = void 0;
    /**
     * A content part is a non-floating element that is rendered inside a cell.
     * The rendering of the content part is synchronous to avoid flickering.
     */
    class $Hnb extends lifecycle_1.$kc {
        constructor() {
            super();
            this.f = new lifecycle_1.$jc();
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
            this.c = element;
            this.didRenderCell(element);
        }
        didRenderCell(element) { }
        /**
         * Dispose any disposables generated from `didRenderCell`
         */
        unrenderCell(element) {
            this.c = undefined;
            this.f.clear();
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
    exports.$Hnb = $Hnb;
    /**
     * An overlay part renders on top of other components.
     * The rendering of the overlay part might be postponed to the next animation frame to avoid forced reflow.
     */
    class $Inb extends lifecycle_1.$kc {
        constructor() {
            super();
            this.b = this.B(new lifecycle_1.$jc());
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
            this.a = element;
            this.didRenderCell(element);
        }
        didRenderCell(element) { }
        /**
         * Dispose any disposables generated from `didRenderCell`
         */
        unrenderCell(element) {
            this.a = undefined;
            this.b.clear();
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
    exports.$Inb = $Inb;
    class $Jnb extends lifecycle_1.$kc {
        constructor(f, g) {
            super();
            this.f = f;
            this.g = g;
            this.a = this.B(new lifecycle_1.$lc());
            this.b = this.B(new lifecycle_1.$lc());
            this.c = this.B(new lifecycle_1.$lc());
        }
        concatContentPart(other) {
            return new $Jnb(this.f.concat(other), this.g);
        }
        concatOverlayPart(other) {
            return new $Jnb(this.f, this.g.concat(other));
        }
        scheduleRenderCell(element) {
            // prepare model
            for (const part of this.f) {
                part.prepareRenderCell(element);
            }
            for (const part of this.g) {
                part.prepareRenderCell(element);
            }
            // render content parts
            for (const part of this.f) {
                part.renderCell(element);
            }
            this.a.value = DOM.$xO(() => {
                for (const part of this.g) {
                    part.renderCell(element);
                }
            });
        }
        unrenderCell(element) {
            for (const part of this.f) {
                part.unrenderCell(element);
            }
            this.a.value = undefined;
            this.b.value = undefined;
            this.c.value = undefined;
            for (const part of this.g) {
                part.unrenderCell(element);
            }
        }
        updateInternalLayoutNow(viewCell) {
            for (const part of this.f) {
                part.updateInternalLayoutNow(viewCell);
            }
            for (const part of this.g) {
                part.updateInternalLayoutNow(viewCell);
            }
        }
        prepareLayout() {
            for (const part of this.f) {
                part.prepareLayout();
            }
        }
        updateState(viewCell, e) {
            for (const part of this.f) {
                part.updateState(viewCell, e);
            }
            this.b.value = DOM.$xO(() => {
                for (const part of this.g) {
                    part.updateState(viewCell, e);
                }
            });
        }
        updateForExecutionState(viewCell, e) {
            for (const part of this.f) {
                part.updateForExecutionState(viewCell, e);
            }
            this.c.value = DOM.$xO(() => {
                for (const part of this.g) {
                    part.updateForExecutionState(viewCell, e);
                }
            });
        }
    }
    exports.$Jnb = $Jnb;
});
//# sourceMappingURL=cellPart.js.map