/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LP = void 0;
    /**
     * The minimal size of the slider (such that it can still be clickable) -- it is artificially enlarged.
     */
    const MINIMUM_SLIDER_SIZE = 20;
    class $LP {
        constructor(arrowSize, scrollbarSize, oppositeScrollbarSize, visibleSize, scrollSize, scrollPosition) {
            this.a = Math.round(scrollbarSize);
            this.b = Math.round(oppositeScrollbarSize);
            this.c = Math.round(arrowSize);
            this.d = visibleSize;
            this.e = scrollSize;
            this.f = scrollPosition;
            this.g = 0;
            this.h = false;
            this.i = 0;
            this.j = 0;
            this.k = 0;
            this.m();
        }
        clone() {
            return new $LP(this.c, this.a, this.b, this.d, this.e, this.f);
        }
        setVisibleSize(visibleSize) {
            const iVisibleSize = Math.round(visibleSize);
            if (this.d !== iVisibleSize) {
                this.d = iVisibleSize;
                this.m();
                return true;
            }
            return false;
        }
        setScrollSize(scrollSize) {
            const iScrollSize = Math.round(scrollSize);
            if (this.e !== iScrollSize) {
                this.e = iScrollSize;
                this.m();
                return true;
            }
            return false;
        }
        setScrollPosition(scrollPosition) {
            const iScrollPosition = Math.round(scrollPosition);
            if (this.f !== iScrollPosition) {
                this.f = iScrollPosition;
                this.m();
                return true;
            }
            return false;
        }
        setScrollbarSize(scrollbarSize) {
            this.a = Math.round(scrollbarSize);
        }
        setOppositeScrollbarSize(oppositeScrollbarSize) {
            this.b = Math.round(oppositeScrollbarSize);
        }
        static l(oppositeScrollbarSize, arrowSize, visibleSize, scrollSize, scrollPosition) {
            const computedAvailableSize = Math.max(0, visibleSize - oppositeScrollbarSize);
            const computedRepresentableSize = Math.max(0, computedAvailableSize - 2 * arrowSize);
            const computedIsNeeded = (scrollSize > 0 && scrollSize > visibleSize);
            if (!computedIsNeeded) {
                // There is no need for a slider
                return {
                    computedAvailableSize: Math.round(computedAvailableSize),
                    computedIsNeeded: computedIsNeeded,
                    computedSliderSize: Math.round(computedRepresentableSize),
                    computedSliderRatio: 0,
                    computedSliderPosition: 0,
                };
            }
            // We must artificially increase the size of the slider if needed, since the slider would be too small to grab with the mouse otherwise
            const computedSliderSize = Math.round(Math.max(MINIMUM_SLIDER_SIZE, Math.floor(visibleSize * computedRepresentableSize / scrollSize)));
            // The slider can move from 0 to `computedRepresentableSize` - `computedSliderSize`
            // in the same way `scrollPosition` can move from 0 to `scrollSize` - `visibleSize`.
            const computedSliderRatio = (computedRepresentableSize - computedSliderSize) / (scrollSize - visibleSize);
            const computedSliderPosition = (scrollPosition * computedSliderRatio);
            return {
                computedAvailableSize: Math.round(computedAvailableSize),
                computedIsNeeded: computedIsNeeded,
                computedSliderSize: Math.round(computedSliderSize),
                computedSliderRatio: computedSliderRatio,
                computedSliderPosition: Math.round(computedSliderPosition),
            };
        }
        m() {
            const r = $LP.l(this.b, this.c, this.d, this.e, this.f);
            this.g = r.computedAvailableSize;
            this.h = r.computedIsNeeded;
            this.i = r.computedSliderSize;
            this.j = r.computedSliderRatio;
            this.k = r.computedSliderPosition;
        }
        getArrowSize() {
            return this.c;
        }
        getScrollPosition() {
            return this.f;
        }
        getRectangleLargeSize() {
            return this.g;
        }
        getRectangleSmallSize() {
            return this.a;
        }
        isNeeded() {
            return this.h;
        }
        getSliderSize() {
            return this.i;
        }
        getSliderPosition() {
            return this.k;
        }
        /**
         * Compute a desired `scrollPosition` such that `offset` ends up in the center of the slider.
         * `offset` is based on the same coordinate system as the `sliderPosition`.
         */
        getDesiredScrollPositionFromOffset(offset) {
            if (!this.h) {
                // no need for a slider
                return 0;
            }
            const desiredSliderPosition = offset - this.c - this.i / 2;
            return Math.round(desiredSliderPosition / this.j);
        }
        /**
         * Compute a desired `scrollPosition` from if offset is before or after the slider position.
         * If offset is before slider, treat as a page up (or left).  If after, page down (or right).
         * `offset` and `_computedSliderPosition` are based on the same coordinate system.
         * `_visibleSize` corresponds to a "page" of lines in the returned coordinate system.
         */
        getDesiredScrollPositionFromOffsetPaged(offset) {
            if (!this.h) {
                // no need for a slider
                return 0;
            }
            const correctedOffset = offset - this.c; // compensate if has arrows
            let desiredScrollPosition = this.f;
            if (correctedOffset < this.k) {
                desiredScrollPosition -= this.d; // page up/left
            }
            else {
                desiredScrollPosition += this.d; // page down/right
            }
            return desiredScrollPosition;
        }
        /**
         * Compute a desired `scrollPosition` such that the slider moves by `delta`.
         */
        getDesiredScrollPositionFromDelta(delta) {
            if (!this.h) {
                // no need for a slider
                return 0;
            }
            const desiredSliderPosition = this.k + delta;
            return Math.round(desiredSliderPosition / this.j);
        }
    }
    exports.$LP = $LP;
});
//# sourceMappingURL=scrollbarState.js.map