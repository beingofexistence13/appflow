/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SmoothScrollingOperation = exports.SmoothScrollingUpdate = exports.Scrollable = exports.ScrollState = exports.ScrollbarVisibility = void 0;
    var ScrollbarVisibility;
    (function (ScrollbarVisibility) {
        ScrollbarVisibility[ScrollbarVisibility["Auto"] = 1] = "Auto";
        ScrollbarVisibility[ScrollbarVisibility["Hidden"] = 2] = "Hidden";
        ScrollbarVisibility[ScrollbarVisibility["Visible"] = 3] = "Visible";
    })(ScrollbarVisibility || (exports.ScrollbarVisibility = ScrollbarVisibility = {}));
    class ScrollState {
        constructor(_forceIntegerValues, width, scrollWidth, scrollLeft, height, scrollHeight, scrollTop) {
            this._forceIntegerValues = _forceIntegerValues;
            this._scrollStateBrand = undefined;
            if (this._forceIntegerValues) {
                width = width | 0;
                scrollWidth = scrollWidth | 0;
                scrollLeft = scrollLeft | 0;
                height = height | 0;
                scrollHeight = scrollHeight | 0;
                scrollTop = scrollTop | 0;
            }
            this.rawScrollLeft = scrollLeft; // before validation
            this.rawScrollTop = scrollTop; // before validation
            if (width < 0) {
                width = 0;
            }
            if (scrollLeft + width > scrollWidth) {
                scrollLeft = scrollWidth - width;
            }
            if (scrollLeft < 0) {
                scrollLeft = 0;
            }
            if (height < 0) {
                height = 0;
            }
            if (scrollTop + height > scrollHeight) {
                scrollTop = scrollHeight - height;
            }
            if (scrollTop < 0) {
                scrollTop = 0;
            }
            this.width = width;
            this.scrollWidth = scrollWidth;
            this.scrollLeft = scrollLeft;
            this.height = height;
            this.scrollHeight = scrollHeight;
            this.scrollTop = scrollTop;
        }
        equals(other) {
            return (this.rawScrollLeft === other.rawScrollLeft
                && this.rawScrollTop === other.rawScrollTop
                && this.width === other.width
                && this.scrollWidth === other.scrollWidth
                && this.scrollLeft === other.scrollLeft
                && this.height === other.height
                && this.scrollHeight === other.scrollHeight
                && this.scrollTop === other.scrollTop);
        }
        withScrollDimensions(update, useRawScrollPositions) {
            return new ScrollState(this._forceIntegerValues, (typeof update.width !== 'undefined' ? update.width : this.width), (typeof update.scrollWidth !== 'undefined' ? update.scrollWidth : this.scrollWidth), useRawScrollPositions ? this.rawScrollLeft : this.scrollLeft, (typeof update.height !== 'undefined' ? update.height : this.height), (typeof update.scrollHeight !== 'undefined' ? update.scrollHeight : this.scrollHeight), useRawScrollPositions ? this.rawScrollTop : this.scrollTop);
        }
        withScrollPosition(update) {
            return new ScrollState(this._forceIntegerValues, this.width, this.scrollWidth, (typeof update.scrollLeft !== 'undefined' ? update.scrollLeft : this.rawScrollLeft), this.height, this.scrollHeight, (typeof update.scrollTop !== 'undefined' ? update.scrollTop : this.rawScrollTop));
        }
        createScrollEvent(previous, inSmoothScrolling) {
            const widthChanged = (this.width !== previous.width);
            const scrollWidthChanged = (this.scrollWidth !== previous.scrollWidth);
            const scrollLeftChanged = (this.scrollLeft !== previous.scrollLeft);
            const heightChanged = (this.height !== previous.height);
            const scrollHeightChanged = (this.scrollHeight !== previous.scrollHeight);
            const scrollTopChanged = (this.scrollTop !== previous.scrollTop);
            return {
                inSmoothScrolling: inSmoothScrolling,
                oldWidth: previous.width,
                oldScrollWidth: previous.scrollWidth,
                oldScrollLeft: previous.scrollLeft,
                width: this.width,
                scrollWidth: this.scrollWidth,
                scrollLeft: this.scrollLeft,
                oldHeight: previous.height,
                oldScrollHeight: previous.scrollHeight,
                oldScrollTop: previous.scrollTop,
                height: this.height,
                scrollHeight: this.scrollHeight,
                scrollTop: this.scrollTop,
                widthChanged: widthChanged,
                scrollWidthChanged: scrollWidthChanged,
                scrollLeftChanged: scrollLeftChanged,
                heightChanged: heightChanged,
                scrollHeightChanged: scrollHeightChanged,
                scrollTopChanged: scrollTopChanged,
            };
        }
    }
    exports.ScrollState = ScrollState;
    class Scrollable extends lifecycle_1.Disposable {
        constructor(options) {
            super();
            this._scrollableBrand = undefined;
            this._onScroll = this._register(new event_1.Emitter());
            this.onScroll = this._onScroll.event;
            this._smoothScrollDuration = options.smoothScrollDuration;
            this._scheduleAtNextAnimationFrame = options.scheduleAtNextAnimationFrame;
            this._state = new ScrollState(options.forceIntegerValues, 0, 0, 0, 0, 0, 0);
            this._smoothScrolling = null;
        }
        dispose() {
            if (this._smoothScrolling) {
                this._smoothScrolling.dispose();
                this._smoothScrolling = null;
            }
            super.dispose();
        }
        setSmoothScrollDuration(smoothScrollDuration) {
            this._smoothScrollDuration = smoothScrollDuration;
        }
        validateScrollPosition(scrollPosition) {
            return this._state.withScrollPosition(scrollPosition);
        }
        getScrollDimensions() {
            return this._state;
        }
        setScrollDimensions(dimensions, useRawScrollPositions) {
            const newState = this._state.withScrollDimensions(dimensions, useRawScrollPositions);
            this._setState(newState, Boolean(this._smoothScrolling));
            // Validate outstanding animated scroll position target
            this._smoothScrolling?.acceptScrollDimensions(this._state);
        }
        /**
         * Returns the final scroll position that the instance will have once the smooth scroll animation concludes.
         * If no scroll animation is occurring, it will return the current scroll position instead.
         */
        getFutureScrollPosition() {
            if (this._smoothScrolling) {
                return this._smoothScrolling.to;
            }
            return this._state;
        }
        /**
         * Returns the current scroll position.
         * Note: This result might be an intermediate scroll position, as there might be an ongoing smooth scroll animation.
         */
        getCurrentScrollPosition() {
            return this._state;
        }
        setScrollPositionNow(update) {
            // no smooth scrolling requested
            const newState = this._state.withScrollPosition(update);
            // Terminate any outstanding smooth scrolling
            if (this._smoothScrolling) {
                this._smoothScrolling.dispose();
                this._smoothScrolling = null;
            }
            this._setState(newState, false);
        }
        setScrollPositionSmooth(update, reuseAnimation) {
            if (this._smoothScrollDuration === 0) {
                // Smooth scrolling not supported.
                return this.setScrollPositionNow(update);
            }
            if (this._smoothScrolling) {
                // Combine our pending scrollLeft/scrollTop with incoming scrollLeft/scrollTop
                update = {
                    scrollLeft: (typeof update.scrollLeft === 'undefined' ? this._smoothScrolling.to.scrollLeft : update.scrollLeft),
                    scrollTop: (typeof update.scrollTop === 'undefined' ? this._smoothScrolling.to.scrollTop : update.scrollTop)
                };
                // Validate `update`
                const validTarget = this._state.withScrollPosition(update);
                if (this._smoothScrolling.to.scrollLeft === validTarget.scrollLeft && this._smoothScrolling.to.scrollTop === validTarget.scrollTop) {
                    // No need to interrupt or extend the current animation since we're going to the same place
                    return;
                }
                let newSmoothScrolling;
                if (reuseAnimation) {
                    newSmoothScrolling = new SmoothScrollingOperation(this._smoothScrolling.from, validTarget, this._smoothScrolling.startTime, this._smoothScrolling.duration);
                }
                else {
                    newSmoothScrolling = this._smoothScrolling.combine(this._state, validTarget, this._smoothScrollDuration);
                }
                this._smoothScrolling.dispose();
                this._smoothScrolling = newSmoothScrolling;
            }
            else {
                // Validate `update`
                const validTarget = this._state.withScrollPosition(update);
                this._smoothScrolling = SmoothScrollingOperation.start(this._state, validTarget, this._smoothScrollDuration);
            }
            // Begin smooth scrolling animation
            this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame(() => {
                if (!this._smoothScrolling) {
                    return;
                }
                this._smoothScrolling.animationFrameDisposable = null;
                this._performSmoothScrolling();
            });
        }
        hasPendingScrollAnimation() {
            return Boolean(this._smoothScrolling);
        }
        _performSmoothScrolling() {
            if (!this._smoothScrolling) {
                return;
            }
            const update = this._smoothScrolling.tick();
            const newState = this._state.withScrollPosition(update);
            this._setState(newState, true);
            if (!this._smoothScrolling) {
                // Looks like someone canceled the smooth scrolling
                // from the scroll event handler
                return;
            }
            if (update.isDone) {
                this._smoothScrolling.dispose();
                this._smoothScrolling = null;
                return;
            }
            // Continue smooth scrolling animation
            this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame(() => {
                if (!this._smoothScrolling) {
                    return;
                }
                this._smoothScrolling.animationFrameDisposable = null;
                this._performSmoothScrolling();
            });
        }
        _setState(newState, inSmoothScrolling) {
            const oldState = this._state;
            if (oldState.equals(newState)) {
                // no change
                return;
            }
            this._state = newState;
            this._onScroll.fire(this._state.createScrollEvent(oldState, inSmoothScrolling));
        }
    }
    exports.Scrollable = Scrollable;
    class SmoothScrollingUpdate {
        constructor(scrollLeft, scrollTop, isDone) {
            this.scrollLeft = scrollLeft;
            this.scrollTop = scrollTop;
            this.isDone = isDone;
        }
    }
    exports.SmoothScrollingUpdate = SmoothScrollingUpdate;
    function createEaseOutCubic(from, to) {
        const delta = to - from;
        return function (completion) {
            return from + delta * easeOutCubic(completion);
        };
    }
    function createComposed(a, b, cut) {
        return function (completion) {
            if (completion < cut) {
                return a(completion / cut);
            }
            return b((completion - cut) / (1 - cut));
        };
    }
    class SmoothScrollingOperation {
        constructor(from, to, startTime, duration) {
            this.from = from;
            this.to = to;
            this.duration = duration;
            this.startTime = startTime;
            this.animationFrameDisposable = null;
            this._initAnimations();
        }
        _initAnimations() {
            this.scrollLeft = this._initAnimation(this.from.scrollLeft, this.to.scrollLeft, this.to.width);
            this.scrollTop = this._initAnimation(this.from.scrollTop, this.to.scrollTop, this.to.height);
        }
        _initAnimation(from, to, viewportSize) {
            const delta = Math.abs(from - to);
            if (delta > 2.5 * viewportSize) {
                let stop1, stop2;
                if (from < to) {
                    // scroll to 75% of the viewportSize
                    stop1 = from + 0.75 * viewportSize;
                    stop2 = to - 0.75 * viewportSize;
                }
                else {
                    stop1 = from - 0.75 * viewportSize;
                    stop2 = to + 0.75 * viewportSize;
                }
                return createComposed(createEaseOutCubic(from, stop1), createEaseOutCubic(stop2, to), 0.33);
            }
            return createEaseOutCubic(from, to);
        }
        dispose() {
            if (this.animationFrameDisposable !== null) {
                this.animationFrameDisposable.dispose();
                this.animationFrameDisposable = null;
            }
        }
        acceptScrollDimensions(state) {
            this.to = state.withScrollPosition(this.to);
            this._initAnimations();
        }
        tick() {
            return this._tick(Date.now());
        }
        _tick(now) {
            const completion = (now - this.startTime) / this.duration;
            if (completion < 1) {
                const newScrollLeft = this.scrollLeft(completion);
                const newScrollTop = this.scrollTop(completion);
                return new SmoothScrollingUpdate(newScrollLeft, newScrollTop, false);
            }
            return new SmoothScrollingUpdate(this.to.scrollLeft, this.to.scrollTop, true);
        }
        combine(from, to, duration) {
            return SmoothScrollingOperation.start(from, to, duration);
        }
        static start(from, to, duration) {
            // +10 / -10 : pretend the animation already started for a quicker response to a scroll request
            duration = duration + 10;
            const startTime = Date.now() - 10;
            return new SmoothScrollingOperation(from, to, startTime, duration);
        }
    }
    exports.SmoothScrollingOperation = SmoothScrollingOperation;
    function easeInCubic(t) {
        return Math.pow(t, 3);
    }
    function easeOutCubic(t) {
        return 1 - easeInCubic(1 - t);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsYWJsZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL3Njcm9sbGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLElBQWtCLG1CQUlqQjtJQUpELFdBQWtCLG1CQUFtQjtRQUNwQyw2REFBUSxDQUFBO1FBQ1IsaUVBQVUsQ0FBQTtRQUNWLG1FQUFXLENBQUE7SUFDWixDQUFDLEVBSmlCLG1CQUFtQixtQ0FBbkIsbUJBQW1CLFFBSXBDO0lBOEJELE1BQWEsV0FBVztRQWF2QixZQUNrQixtQkFBNEIsRUFDN0MsS0FBYSxFQUNiLFdBQW1CLEVBQ25CLFVBQWtCLEVBQ2xCLE1BQWMsRUFDZCxZQUFvQixFQUNwQixTQUFpQjtZQU5BLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBUztZQWI5QyxzQkFBaUIsR0FBUyxTQUFTLENBQUM7WUFxQm5DLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUM3QixLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDbEIsV0FBVyxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBQzlCLFVBQVUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDcEIsWUFBWSxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUM7Z0JBQ2hDLFNBQVMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO2FBQzFCO1lBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsQ0FBQyxvQkFBb0I7WUFDckQsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsQ0FBQyxvQkFBb0I7WUFFbkQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO2dCQUNkLEtBQUssR0FBRyxDQUFDLENBQUM7YUFDVjtZQUNELElBQUksVUFBVSxHQUFHLEtBQUss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