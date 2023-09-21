/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Pr = exports.$Or = exports.$Nr = exports.$Mr = exports.ScrollbarVisibility = void 0;
    var ScrollbarVisibility;
    (function (ScrollbarVisibility) {
        ScrollbarVisibility[ScrollbarVisibility["Auto"] = 1] = "Auto";
        ScrollbarVisibility[ScrollbarVisibility["Hidden"] = 2] = "Hidden";
        ScrollbarVisibility[ScrollbarVisibility["Visible"] = 3] = "Visible";
    })(ScrollbarVisibility || (exports.ScrollbarVisibility = ScrollbarVisibility = {}));
    class $Mr {
        constructor(c, width, scrollWidth, scrollLeft, height, scrollHeight, scrollTop) {
            this.c = c;
            this._scrollStateBrand = undefined;
            if (this.c) {
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
            return new $Mr(this.c, (typeof update.width !== 'undefined' ? update.width : this.width), (typeof update.scrollWidth !== 'undefined' ? update.scrollWidth : this.scrollWidth), useRawScrollPositions ? this.rawScrollLeft : this.scrollLeft, (typeof update.height !== 'undefined' ? update.height : this.height), (typeof update.scrollHeight !== 'undefined' ? update.scrollHeight : this.scrollHeight), useRawScrollPositions ? this.rawScrollTop : this.scrollTop);
        }
        withScrollPosition(update) {
            return new $Mr(this.c, this.width, this.scrollWidth, (typeof update.scrollLeft !== 'undefined' ? update.scrollLeft : this.rawScrollLeft), this.height, this.scrollHeight, (typeof update.scrollTop !== 'undefined' ? update.scrollTop : this.rawScrollTop));
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
    exports.$Mr = $Mr;
    class $Nr extends lifecycle_1.$kc {
        constructor(options) {
            super();
            this._scrollableBrand = undefined;
            this.j = this.B(new event_1.$fd());
            this.onScroll = this.j.event;
            this.c = options.smoothScrollDuration;
            this.f = options.scheduleAtNextAnimationFrame;
            this.g = new $Mr(options.forceIntegerValues, 0, 0, 0, 0, 0, 0);
            this.h = null;
        }
        dispose() {
            if (this.h) {
                this.h.dispose();
                this.h = null;
            }
            super.dispose();
        }
        setSmoothScrollDuration(smoothScrollDuration) {
            this.c = smoothScrollDuration;
        }
        validateScrollPosition(scrollPosition) {
            return this.g.withScrollPosition(scrollPosition);
        }
        getScrollDimensions() {
            return this.g;
        }
        setScrollDimensions(dimensions, useRawScrollPositions) {
            const newState = this.g.withScrollDimensions(dimensions, useRawScrollPositions);
            this.n(newState, Boolean(this.h));
            // Validate outstanding animated scroll position target
            this.h?.acceptScrollDimensions(this.g);
        }
        /**
         * Returns the final scroll position that the instance will have once the smooth scroll animation concludes.
         * If no scroll animation is occurring, it will return the current scroll position instead.
         */
        getFutureScrollPosition() {
            if (this.h) {
                return this.h.to;
            }
            return this.g;
        }
        /**
         * Returns the current scroll position.
         * Note: This result might be an intermediate scroll position, as there might be an ongoing smooth scroll animation.
         */
        getCurrentScrollPosition() {
            return this.g;
        }
        setScrollPositionNow(update) {
            // no smooth scrolling requested
            const newState = this.g.withScrollPosition(update);
            // Terminate any outstanding smooth scrolling
            if (this.h) {
                this.h.dispose();
                this.h = null;
            }
            this.n(newState, false);
        }
        setScrollPositionSmooth(update, reuseAnimation) {
            if (this.c === 0) {
                // Smooth scrolling not supported.
                return this.setScrollPositionNow(update);
            }
            if (this.h) {
                // Combine our pending scrollLeft/scrollTop with incoming scrollLeft/scrollTop
                update = {
                    scrollLeft: (typeof update.scrollLeft === 'undefined' ? this.h.to.scrollLeft : update.scrollLeft),
                    scrollTop: (typeof update.scrollTop === 'undefined' ? this.h.to.scrollTop : update.scrollTop)
                };
                // Validate `update`
                const validTarget = this.g.withScrollPosition(update);
                if (this.h.to.scrollLeft === validTarget.scrollLeft && this.h.to.scrollTop === validTarget.scrollTop) {
                    // No need to interrupt or extend the current animation since we're going to the same place
                    return;
                }
                let newSmoothScrolling;
                if (reuseAnimation) {
                    newSmoothScrolling = new $Pr(this.h.from, validTarget, this.h.startTime, this.h.duration);
                }
                else {
                    newSmoothScrolling = this.h.combine(this.g, validTarget, this.c);
                }
                this.h.dispose();
                this.h = newSmoothScrolling;
            }
            else {
                // Validate `update`
                const validTarget = this.g.withScrollPosition(update);
                this.h = $Pr.start(this.g, validTarget, this.c);
            }
            // Begin smooth scrolling animation
            this.h.animationFrameDisposable = this.f(() => {
                if (!this.h) {
                    return;
                }
                this.h.animationFrameDisposable = null;
                this.m();
            });
        }
        hasPendingScrollAnimation() {
            return Boolean(this.h);
        }
        m() {
            if (!this.h) {
                return;
            }
            const update = this.h.tick();
            const newState = this.g.withScrollPosition(update);
            this.n(newState, true);
            if (!this.h) {
                // Looks like someone canceled the smooth scrolling
                // from the scroll event handler
                return;
            }
            if (update.isDone) {
                this.h.dispose();
                this.h = null;
                return;
            }
            // Continue smooth scrolling animation
            this.h.animationFrameDisposable = this.f(() => {
                if (!this.h) {
                    return;
                }
                this.h.animationFrameDisposable = null;
                this.m();
            });
        }
        n(newState, inSmoothScrolling) {
            const oldState = this.g;
            if (oldState.equals(newState)) {
                // no change
                return;
            }
            this.g = newState;
            this.j.fire(this.g.createScrollEvent(oldState, inSmoothScrolling));
        }
    }
    exports.$Nr = $Nr;
    class $Or {
        constructor(scrollLeft, scrollTop, isDone) {
            this.scrollLeft = scrollLeft;
            this.scrollTop = scrollTop;
            this.isDone = isDone;
        }
    }
    exports.$Or = $Or;
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
    class $Pr {
        constructor(from, to, startTime, duration) {
            this.from = from;
            this.to = to;
            this.duration = duration;
            this.startTime = startTime;
            this.animationFrameDisposable = null;
            this.e();
        }
        e() {
            this.c = this.f(this.from.scrollLeft, this.to.scrollLeft, this.to.width);
            this.d = this.f(this.from.scrollTop, this.to.scrollTop, this.to.height);
        }
        f(from, to, viewportSize) {
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
            this.e();
        }
        tick() {
            return this.g(Date.now());
        }
        g(now) {
            const completion = (now - this.startTime) / this.duration;
            if (completion < 1) {
                const newScrollLeft = this.c(completion);
                const newScrollTop = this.d(completion);
                return new $Or(newScrollLeft, newScrollTop, false);
            }
            return new $Or(this.to.scrollLeft, this.to.scrollTop, true);
        }
        combine(from, to, duration) {
            return $Pr.start(from, to, duration);
        }
        static start(from, to, duration) {
            // +10 / -10 : pretend the animation already started for a quicker response to a scroll request
            duration = duration + 10;
            const startTime = Date.now() - 10;
            return new $Pr(from, to, startTime, duration);
        }
    }
    exports.$Pr = $Pr;
    function easeInCubic(t) {
        return Math.pow(t, 3);
    }
    function easeOutCubic(t) {
        return 1 - easeInCubic(1 - t);
    }
});
//# sourceMappingURL=scrollable.js.map