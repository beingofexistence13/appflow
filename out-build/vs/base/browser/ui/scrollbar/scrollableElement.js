/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/mouseEvent", "vs/base/browser/ui/scrollbar/horizontalScrollbar", "vs/base/browser/ui/scrollbar/verticalScrollbar", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/scrollable", "vs/css!./media/scrollbars"], function (require, exports, browser_1, dom, fastDomNode_1, mouseEvent_1, horizontalScrollbar_1, verticalScrollbar_1, widget_1, async_1, event_1, lifecycle_1, platform, scrollable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UP = exports.$TP = exports.$SP = exports.$RP = exports.$QP = void 0;
    const HIDE_TIMEOUT = 500;
    const SCROLL_WHEEL_SENSITIVITY = 50;
    const SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED = true;
    class MouseWheelClassifierItem {
        constructor(timestamp, deltaX, deltaY) {
            this.timestamp = timestamp;
            this.deltaX = deltaX;
            this.deltaY = deltaY;
            this.score = 0;
        }
    }
    class $QP {
        static { this.INSTANCE = new $QP(); }
        constructor() {
            this.a = 5;
            this.b = [];
            this.c = -1;
            this.d = -1;
        }
        isPhysicalMouseWheel() {
            if (this.c === -1 && this.d === -1) {
                // no elements
                return false;
            }
            // 0.5 * last + 0.25 * 2nd last + 0.125 * 3rd last + ...
            let remainingInfluence = 1;
            let score = 0;
            let iteration = 1;
            let index = this.d;
            do {
                const influence = (index === this.c ? remainingInfluence : Math.pow(2, -iteration));
                remainingInfluence -= influence;
                score += this.b[index].score * influence;
                if (index === this.c) {
                    break;
                }
                index = (this.a + index - 1) % this.a;
                iteration++;
            } while (true);
            return (score <= 0.5);
        }
        acceptStandardWheelEvent(e) {
            const osZoomFactor = window.devicePixelRatio / (0, browser_1.$ZN)();
            if (platform.$i || platform.$k) {
                // On Windows and Linux, the incoming delta events are multiplied with the OS zoom factor.
                // The OS zoom factor can be reverse engineered by using the device pixel ratio and the configured zoom factor into account.
                this.accept(Date.now(), e.deltaX / osZoomFactor, e.deltaY / osZoomFactor);
            }
            else {
                this.accept(Date.now(), e.deltaX, e.deltaY);
            }
        }
        accept(timestamp, deltaX, deltaY) {
            const item = new MouseWheelClassifierItem(timestamp, deltaX, deltaY);
            item.score = this.f(item);
            if (this.c === -1 && this.d === -1) {
                this.b[0] = item;
                this.c = 0;
                this.d = 0;
            }
            else {
                this.d = (this.d + 1) % this.a;
                if (this.d === this.c) {
                    // Drop oldest
                    this.c = (this.c + 1) % this.a;
                }
                this.b[this.d] = item;
            }
        }
        /**
         * A score between 0 and 1 for `item`.
         *  - a score towards 0 indicates that the source appears to be a physical mouse wheel
         *  - a score towards 1 indicates that the source appears to be a touchpad or magic mouse, etc.
         */
        f(item) {
            if (Math.abs(item.deltaX) > 0 && Math.abs(item.deltaY) > 0) {
                // both axes exercised => definitely not a physical mouse wheel
                return 1;
            }
            let score = 0.5;
            const prev = (this.c === -1 && this.d === -1 ? null : this.b[this.d]);
            if (prev) {
                // const deltaT = item.timestamp - prev.timestamp;
                // if (deltaT < 1000 / 30) {
                // 	// sooner than X times per second => indicator that this is not a physical mouse wheel
                // 	score += 0.25;
                // }
                // if (item.deltaX === prev.deltaX && item.deltaY === prev.deltaY) {
                // 	// equal amplitude => indicator that this is a physical mouse wheel
                // 	score -= 0.25;
                // }
            }
            if (!this.g(item.deltaX) || !this.g(item.deltaY)) {
                // non-integer deltas => indicator that this is not a physical mouse wheel
                score += 0.25;
            }
            return Math.min(Math.max(score, 0), 1);
        }
        g(value) {
            const delta = Math.abs(Math.round(value) - value);
            return (delta < 0.01);
        }
    }
    exports.$QP = $QP;
    class $RP extends widget_1.$IP {
        get options() {
            return this.a;
        }
        constructor(element, options, scrollable) {
            super();
            this.O = this.B(new event_1.$fd());
            this.onScroll = this.O.event;
            this.P = this.B(new event_1.$fd());
            this.onWillScroll = this.P.event;
            element.style.overflow = 'hidden';
            this.a = resolveOptions(options);
            this.b = scrollable;
            this.B(this.b.onScroll((e) => {
                this.P.fire(e);
                this.S(e);
                this.O.fire(e);
            }));
            const scrollbarHost = {
                onMouseWheel: (mouseWheelEvent) => this.R(mouseWheelEvent),
                onDragStart: () => this.W(),
                onDragEnd: () => this.X(),
            };
            this.c = this.B(new verticalScrollbar_1.$PP(this.b, this.a, scrollbarHost));
            this.g = this.B(new horizontalScrollbar_1.$OP(this.b, this.a, scrollbarHost));
            this.h = document.createElement('div');
            this.h.className = 'monaco-scrollable-element ' + this.a.className;
            this.h.setAttribute('role', 'presentation');
            this.h.style.position = 'relative';
            this.h.style.overflow = 'hidden';
            this.h.appendChild(element);
            this.h.appendChild(this.g.domNode.domNode);
            this.h.appendChild(this.c.domNode.domNode);
            if (this.a.useShadows) {
                this.n = (0, fastDomNode_1.$GP)(document.createElement('div'));
                this.n.setClassName('shadow');
                this.h.appendChild(this.n.domNode);
                this.r = (0, fastDomNode_1.$GP)(document.createElement('div'));
                this.r.setClassName('shadow');
                this.h.appendChild(this.r.domNode);
                this.s = (0, fastDomNode_1.$GP)(document.createElement('div'));
                this.s.setClassName('shadow');
                this.h.appendChild(this.s.domNode);
            }
            else {
                this.n = null;
                this.r = null;
                this.s = null;
            }
            this.t = this.a.listenOnDomNode || this.h;
            this.w = [];
            this.Q(this.a.handleMouseWheel);
            this.m(this.t, (e) => this.Z(e));
            this.u(this.t, (e) => this.Y(e));
            this.L = this.B(new async_1.$Qg());
            this.y = false;
            this.J = false;
            this.M = true;
            this.N = true;
        }
        dispose() {
            this.w = (0, lifecycle_1.$fc)(this.w);
            super.dispose();
        }
        /**
         * Get the generated 'scrollable' dom node
         */
        getDomNode() {
            return this.h;
        }
        getOverviewRulerLayoutInfo() {
            return {
                parent: this.h,
                insertBefore: this.c.domNode.domNode,
            };
        }
        /**
         * Delegate a pointer down event to the vertical scrollbar.
         * This is to help with clicking somewhere else and having the scrollbar react.
         */
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.c.delegatePointerDown(browserEvent);
        }
        getScrollDimensions() {
            return this.b.getScrollDimensions();
        }
        setScrollDimensions(dimensions) {
            this.b.setScrollDimensions(dimensions, false);
        }
        /**
         * Update the class name of the scrollable element.
         */
        updateClassName(newClassName) {
            this.a.className = newClassName;
            // Defaults are different on Macs
            if (platform.$j) {
                this.a.className += ' mac';
            }
            this.h.className = 'monaco-scrollable-element ' + this.a.className;
        }
        /**
         * Update configuration options for the scrollbar.
         */
        updateOptions(newOptions) {
            if (typeof newOptions.handleMouseWheel !== 'undefined') {
                this.a.handleMouseWheel = newOptions.handleMouseWheel;
                this.Q(this.a.handleMouseWheel);
            }
            if (typeof newOptions.mouseWheelScrollSensitivity !== 'undefined') {
                this.a.mouseWheelScrollSensitivity = newOptions.mouseWheelScrollSensitivity;
            }
            if (typeof newOptions.fastScrollSensitivity !== 'undefined') {
                this.a.fastScrollSensitivity = newOptions.fastScrollSensitivity;
            }
            if (typeof newOptions.scrollPredominantAxis !== 'undefined') {
                this.a.scrollPredominantAxis = newOptions.scrollPredominantAxis;
            }
            if (typeof newOptions.horizontal !== 'undefined') {
                this.a.horizontal = newOptions.horizontal;
            }
            if (typeof newOptions.vertical !== 'undefined') {
                this.a.vertical = newOptions.vertical;
            }
            if (typeof newOptions.horizontalScrollbarSize !== 'undefined') {
                this.a.horizontalScrollbarSize = newOptions.horizontalScrollbarSize;
            }
            if (typeof newOptions.verticalScrollbarSize !== 'undefined') {
                this.a.verticalScrollbarSize = newOptions.verticalScrollbarSize;
            }
            if (typeof newOptions.scrollByPage !== 'undefined') {
                this.a.scrollByPage = newOptions.scrollByPage;
            }
            this.g.updateOptions(this.a);
            this.c.updateOptions(this.a);
            if (!this.a.lazyRender) {
                this.U();
            }
        }
        setRevealOnScroll(value) {
            this.N = value;
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this.R(new mouseEvent_1.$gO(browserEvent));
        }
        // -------------------- mouse wheel scrolling --------------------
        Q(shouldListen) {
            const isListening = (this.w.length > 0);
            if (isListening === shouldListen) {
                // No change
                return;
            }
            // Stop listening (if necessary)
            this.w = (0, lifecycle_1.$fc)(this.w);
            // Start listening (if necessary)
            if (shouldListen) {
                const onMouseWheel = (browserEvent) => {
                    this.R(new mouseEvent_1.$gO(browserEvent));
                };
                this.w.push(dom.$nO(this.t, dom.$3O.MOUSE_WHEEL, onMouseWheel, { passive: false }));
            }
        }
        R(e) {
            if (e.browserEvent?.defaultPrevented) {
                return;
            }
            const classifier = $QP.INSTANCE;
            if (SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED) {
                classifier.acceptStandardWheelEvent(e);
            }
            // console.log(`${Date.now()}, ${e.deltaY}, ${e.deltaX}`);
            let didScroll = false;
            if (e.deltaY || e.deltaX) {
                let deltaY = e.deltaY * this.a.mouseWheelScrollSensitivity;
                let deltaX = e.deltaX * this.a.mouseWheelScrollSensitivity;
                if (this.a.scrollPredominantAxis) {
                    if (this.a.scrollYToX && deltaX + deltaY === 0) {
                        // when configured to map Y to X and we both see
                        // no dominant axis and X and Y are competing with
                        // identical values into opposite directions, we
                        // ignore the delta as we cannot make a decision then
                        deltaX = deltaY = 0;
                    }
                    else if (Math.abs(deltaY) >= Math.abs(deltaX)) {
                        deltaX = 0;
                    }
                    else {
                        deltaY = 0;
                    }
                }
                if (this.a.flipAxes) {
                    [deltaY, deltaX] = [deltaX, deltaY];
                }
                // Convert vertical scrolling to horizontal if shift is held, this
                // is handled at a higher level on Mac
                const shiftConvert = !platform.$j && e.browserEvent && e.browserEvent.shiftKey;
                if ((this.a.scrollYToX || shiftConvert) && !deltaX) {
                    deltaX = deltaY;
                    deltaY = 0;
                }
                if (e.browserEvent && e.browserEvent.altKey) {
                    // fastScrolling
                    deltaX = deltaX * this.a.fastScrollSensitivity;
                    deltaY = deltaY * this.a.fastScrollSensitivity;
                }
                const futureScrollPosition = this.b.getFutureScrollPosition();
                let desiredScrollPosition = {};
                if (deltaY) {
                    const deltaScrollTop = SCROLL_WHEEL_SENSITIVITY * deltaY;
                    // Here we convert values such as -0.3 to -1 or 0.3 to 1, otherwise low speed scrolling will never scroll
                    const desiredScrollTop = futureScrollPosition.scrollTop - (deltaScrollTop < 0 ? Math.floor(deltaScrollTop) : Math.ceil(deltaScrollTop));
                    this.c.writeScrollPosition(desiredScrollPosition, desiredScrollTop);
                }
                if (deltaX) {
                    const deltaScrollLeft = SCROLL_WHEEL_SENSITIVITY * deltaX;
                    // Here we convert values such as -0.3 to -1 or 0.3 to 1, otherwise low speed scrolling will never scroll
                    const desiredScrollLeft = futureScrollPosition.scrollLeft - (deltaScrollLeft < 0 ? Math.floor(deltaScrollLeft) : Math.ceil(deltaScrollLeft));
                    this.g.writeScrollPosition(desiredScrollPosition, desiredScrollLeft);
                }
                // Check that we are scrolling towards a location which is valid
                desiredScrollPosition = this.b.validateScrollPosition(desiredScrollPosition);
                if (futureScrollPosition.scrollLeft !== desiredScrollPosition.scrollLeft || futureScrollPosition.scrollTop !== desiredScrollPosition.scrollTop) {
                    const canPerformSmoothScroll = (SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED
                        && this.a.mouseWheelSmoothScroll
                        && classifier.isPhysicalMouseWheel());
                    if (canPerformSmoothScroll) {
                        this.b.setScrollPositionSmooth(desiredScrollPosition);
                    }
                    else {
                        this.b.setScrollPositionNow(desiredScrollPosition);
                    }
                    didScroll = true;
                }
            }
            let consumeMouseWheel = didScroll;
            if (!consumeMouseWheel && this.a.alwaysConsumeMouseWheel) {
                consumeMouseWheel = true;
            }
            if (!consumeMouseWheel && this.a.consumeMouseWheelIfScrollbarIsNeeded && (this.c.isNeeded() || this.g.isNeeded())) {
                consumeMouseWheel = true;
            }
            if (consumeMouseWheel) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
        S(e) {
            this.M = this.g.onDidScroll(e) || this.M;
            this.M = this.c.onDidScroll(e) || this.M;
            if (this.a.useShadows) {
                this.M = true;
            }
            if (this.N) {
                this.$();
            }
            if (!this.a.lazyRender) {
                this.U();
            }
        }
        /**
         * Render / mutate the DOM now.
         * Should be used together with the ctor option `lazyRender`.
         */
        renderNow() {
            if (!this.a.lazyRender) {
                throw new Error('Please use `lazyRender` together with `renderNow`!');
            }
            this.U();
        }
        U() {
            if (!this.M) {
                return;
            }
            this.M = false;
            this.g.render();
            this.c.render();
            if (this.a.useShadows) {
                const scrollState = this.b.getCurrentScrollPosition();
                const enableTop = scrollState.scrollTop > 0;
                const enableLeft = scrollState.scrollLeft > 0;
                const leftClassName = (enableLeft ? ' left' : '');
                const topClassName = (enableTop ? ' top' : '');
                const topLeftClassName = (enableLeft || enableTop ? ' top-left-corner' : '');
                this.n.setClassName(`shadow${leftClassName}`);
                this.r.setClassName(`shadow${topClassName}`);
                this.s.setClassName(`shadow${topLeftClassName}${topClassName}${leftClassName}`);
            }
        }
        // -------------------- fade in / fade out --------------------
        W() {
            this.y = true;
            this.$();
        }
        X() {
            this.y = false;
            this.ab();
        }
        Y(e) {
            this.J = false;
            this.ab();
        }
        Z(e) {
            this.J = true;
            this.$();
        }
        $() {
            this.c.beginReveal();
            this.g.beginReveal();
            this.bb();
        }
        ab() {
            if (!this.J && !this.y) {
                this.c.beginHide();
                this.g.beginHide();
            }
        }
        bb() {
            if (!this.J && !this.y) {
                this.L.cancelAndSet(() => this.ab(), HIDE_TIMEOUT);
            }
        }
    }
    exports.$RP = $RP;
    class $SP extends $RP {
        constructor(element, options) {
            options = options || {};
            options.mouseWheelSmoothScroll = false;
            const scrollable = new scrollable_1.$Nr({
                forceIntegerValues: true,
                smoothScrollDuration: 0,
                scheduleAtNextAnimationFrame: (callback) => dom.$vO(callback)
            });
            super(element, options, scrollable);
            this.B(scrollable);
        }
        setScrollPosition(update) {
            this.b.setScrollPositionNow(update);
        }
        getScrollPosition() {
            return this.b.getCurrentScrollPosition();
        }
    }
    exports.$SP = $SP;
    class $TP extends $RP {
        constructor(element, options, scrollable) {
            super(element, options, scrollable);
        }
        setScrollPosition(update) {
            if (update.reuseAnimation) {
                this.b.setScrollPositionSmooth(update, update.reuseAnimation);
            }
            else {
                this.b.setScrollPositionNow(update);
            }
        }
        getScrollPosition() {
            return this.b.getCurrentScrollPosition();
        }
    }
    exports.$TP = $TP;
    class $UP extends $RP {
        constructor(element, options) {
            options = options || {};
            options.mouseWheelSmoothScroll = false;
            const scrollable = new scrollable_1.$Nr({
                forceIntegerValues: false,
                smoothScrollDuration: 0,
                scheduleAtNextAnimationFrame: (callback) => dom.$vO(callback)
            });
            super(element, options, scrollable);
            this.B(scrollable);
            this.cb = element;
            this.B(this.onScroll((e) => {
                if (e.scrollTopChanged) {
                    this.cb.scrollTop = e.scrollTop;
                }
                if (e.scrollLeftChanged) {
                    this.cb.scrollLeft = e.scrollLeft;
                }
            }));
            this.scanDomNode();
        }
        setScrollPosition(update) {
            this.b.setScrollPositionNow(update);
        }
        getScrollPosition() {
            return this.b.getCurrentScrollPosition();
        }
        scanDomNode() {
            // width, scrollLeft, scrollWidth, height, scrollTop, scrollHeight
            this.setScrollDimensions({
                width: this.cb.clientWidth,
                scrollWidth: this.cb.scrollWidth,
                height: this.cb.clientHeight,
                scrollHeight: this.cb.scrollHeight
            });
            this.setScrollPosition({
                scrollLeft: this.cb.scrollLeft,
                scrollTop: this.cb.scrollTop,
            });
        }
    }
    exports.$UP = $UP;
    function resolveOptions(opts) {
        const result = {
            lazyRender: (typeof opts.lazyRender !== 'undefined' ? opts.lazyRender : false),
            className: (typeof opts.className !== 'undefined' ? opts.className : ''),
            useShadows: (typeof opts.useShadows !== 'undefined' ? opts.useShadows : true),
            handleMouseWheel: (typeof opts.handleMouseWheel !== 'undefined' ? opts.handleMouseWheel : true),
            flipAxes: (typeof opts.flipAxes !== 'undefined' ? opts.flipAxes : false),
            consumeMouseWheelIfScrollbarIsNeeded: (typeof opts.consumeMouseWheelIfScrollbarIsNeeded !== 'undefined' ? opts.consumeMouseWheelIfScrollbarIsNeeded : false),
            alwaysConsumeMouseWheel: (typeof opts.alwaysConsumeMouseWheel !== 'undefined' ? opts.alwaysConsumeMouseWheel : false),
            scrollYToX: (typeof opts.scrollYToX !== 'undefined' ? opts.scrollYToX : false),
            mouseWheelScrollSensitivity: (typeof opts.mouseWheelScrollSensitivity !== 'undefined' ? opts.mouseWheelScrollSensitivity : 1),
            fastScrollSensitivity: (typeof opts.fastScrollSensitivity !== 'undefined' ? opts.fastScrollSensitivity : 5),
            scrollPredominantAxis: (typeof opts.scrollPredominantAxis !== 'undefined' ? opts.scrollPredominantAxis : true),
            mouseWheelSmoothScroll: (typeof opts.mouseWheelSmoothScroll !== 'undefined' ? opts.mouseWheelSmoothScroll : true),
            arrowSize: (typeof opts.arrowSize !== 'undefined' ? opts.arrowSize : 11),
            listenOnDomNode: (typeof opts.listenOnDomNode !== 'undefined' ? opts.listenOnDomNode : null),
            horizontal: (typeof opts.horizontal !== 'undefined' ? opts.horizontal : 1 /* ScrollbarVisibility.Auto */),
            horizontalScrollbarSize: (typeof opts.horizontalScrollbarSize !== 'undefined' ? opts.horizontalScrollbarSize : 10),
            horizontalSliderSize: (typeof opts.horizontalSliderSize !== 'undefined' ? opts.horizontalSliderSize : 0),
            horizontalHasArrows: (typeof opts.horizontalHasArrows !== 'undefined' ? opts.horizontalHasArrows : false),
            vertical: (typeof opts.vertical !== 'undefined' ? opts.vertical : 1 /* ScrollbarVisibility.Auto */),
            verticalScrollbarSize: (typeof opts.verticalScrollbarSize !== 'undefined' ? opts.verticalScrollbarSize : 10),
            verticalHasArrows: (typeof opts.verticalHasArrows !== 'undefined' ? opts.verticalHasArrows : false),
            verticalSliderSize: (typeof opts.verticalSliderSize !== 'undefined' ? opts.verticalSliderSize : 0),
            scrollByPage: (typeof opts.scrollByPage !== 'undefined' ? opts.scrollByPage : false)
        };
        result.horizontalSliderSize = (typeof opts.horizontalSliderSize !== 'undefined' ? opts.horizontalSliderSize : result.horizontalScrollbarSize);
        result.verticalSliderSize = (typeof opts.verticalSliderSize !== 'undefined' ? opts.verticalSliderSize : result.verticalScrollbarSize);
        // Defaults are different on Macs
        if (platform.$j) {
            result.className += ' mac';
        }
        return result;
    }
});
//# sourceMappingURL=scrollableElement.js.map