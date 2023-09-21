/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScrollbarState = void 0;
    /**
     * The minimal size of the slider (such that it can still be clickable) -- it is artificially enlarged.
     */
    const MINIMUM_SLIDER_SIZE = 20;
    class ScrollbarState {
        constructor(arrowSize, scrollbarSize, oppositeScrollbarSize, visibleSize, scrollSize, scrollPosition) {
            this._scrollbarSize = Math.round(scrollbarSize);
            this._oppositeScrollbarSize = Math.round(oppositeScrollbarSize);
            this._arrowSize = Math.round(arrowSize);
            this._visibleSize = visibleSize;
            this._scrollSize = scrollSize;
            this._scrollPosition = scrollPosition;
            this._computedAvailableSize = 0;
            this._computedIsNeeded = false;
            this._computedSliderSize = 0;
            this._computedSliderRatio = 0;
            this._computedSliderPosition = 0;
            this._refreshComputedValues();
        }
        clone() {
            return new ScrollbarState(this._arrowSize, this._scrollbarSize, this._oppositeScrollbarSize, this._visibleSize, this._scrollSize, this._scrollPosition);
        }
        setVisibleSize(visibleSize) {
            const iVisibleSize = Math.round(visibleSize);
            if (this._visibleSize !== iVisibleSize) {
                this._visibleSize = iVisibleSize;
                this._refreshComputedValues();
                return true;
            }
            return false;
        }
        setScrollSize(scrollSize) {
            const iScrollSize = Math.round(scrollSize);
            if (this._scrollSize !== iScrollSize) {
                this._scrollSize = iScrollSize;
                this._refreshComputedValues();
                return true;
            }
            return false;
        }
        setScrollPosition(scrollPosition) {
            const iScrollPosition = Math.round(scrollPosition);
            if (this._scrollPosition !== iScrollPosition) {
                this._scrollPosition = iScrollPosition;
                this._refreshComputedValues();
                return true;
            }
            return false;
        }
        setScrollbarSize(scrollbarSize) {
            this._scrollbarSize = Math.round(scrollbarSize);
        }
        setOppositeScrollbarSize(oppositeScrollbarSize) {
            this._oppositeScrollbarSize = Math.round(oppositeScrollbarSize);
        }
        static _computeValues(oppositeScrollbarSize, arrowSize, visibleSize, scrollSize, scrollPosition) {
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
        _refreshComputedValues() {
            const r = ScrollbarState._computeValues(this._oppositeScrollbarSize, this._arrowSize, this._visibleSize, this._scrollSize, this._scrollPosition);
            this._computedAvailableSize = r.computedAvailableSize;
            this._computedIsNeeded = r.computedIsNeeded;
            this._computedSliderSize = r.computedSliderSize;
            this._computedSliderRatio = r.computedSliderRatio;
            this._computedSliderPosition = r.computedSliderPosition;
        }
        getArrowSize() {
            return this._arrowSize;
        }
        getScrollPosition() {
            return this._scrollPosition;
        }
        getRectangleLargeSize() {
            return this._computedAvailableSize;
        }
        getRectangleSmallSize() {
            return this._scrollbarSize;
        }
        isNeeded() {
            return this._computedIsNeeded;
        }
        getSliderSize() {
            return this._computedSliderSize;
        }
        getSliderPosition() {
            return this._computedSliderPosition;
        }
        /**
         * Compute a desired `scrollPosition` such that `offset` ends up in the center of the slider.
         * `offset` is based on the same coordinate system as the `sliderPosition`.
         */
        getDesiredScrollPositionFromOffset(offset) {
            if (!this._computedIsNeeded) {
                // no need for a slider
                return 0;
            }
            const desiredSliderPosition = offset - this._arrowSize - this._computedSliderSize / 2;
            return Math.round(desiredSliderPosition / this._computedSliderRatio);
        }
        /**
         * Compute a desired `scrollPosition` from if offset is before or after the slider position.
         * If offset is before slider, treat as a page up (or left).  If after, page down (or right).
         * `offset` and `_computedSliderPosition` are based on the same coordinate system.
         * `_visibleSize` corresponds to a "page" of lines in the returned coordinate system.
         */
        getDesiredScrollPositionFromOffsetPaged(offset) {
            if (!this._computedIsNeeded) {
                // no need for a slider
                return 0;
            }
            const correctedOffset = offset - this._arrowSize; // compensate if has arrows
            let desiredScrollPosition = this._scrollPosition;
            if (correctedOffset < this._computedSliderPosition) {
                desiredScrollPosition -= this._visibleSize; // page up/left
            }
            else {
                desiredScrollPosition += this._visibleSize; // page down/right
            }
            return desiredScrollPosition;
        }
        /**
         * Compute a desired `scrollPosition` such that the slider moves by `delta`.
         */
        getDesiredScrollPositionFromDelta(delta) {
            if (!this._computedIsNeeded) {
                // no need for a slider
                return 0;
            }
            const desiredSliderPosition = this._computedSliderPosition + delta;
            return Math.round(desiredSliderPosition / this._computedSliderRatio);
        }
    }
    exports.ScrollbarState = ScrollbarState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsYmFyU3RhdGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvc2Nyb2xsYmFyL3Njcm9sbGJhclN0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUVoRzs7T0FFRztJQUNILE1BQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0lBRS9CLE1BQWEsY0FBYztRQXNEMUIsWUFBWSxTQUFpQixFQUFFLGFBQXFCLEVBQUUscUJBQTZCLEVBQUUsV0FBbUIsRUFBRSxVQUFrQixFQUFFLGNBQXNCO1lBQ25KLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV4QyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztZQUNoQyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUM5QixJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztZQUV0QyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDL0IsSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLENBQUM7WUFFakMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUVNLEtBQUs7WUFDWCxPQUFPLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFV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