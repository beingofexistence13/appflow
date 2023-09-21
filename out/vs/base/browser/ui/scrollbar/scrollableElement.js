/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/mouseEvent", "vs/base/browser/ui/scrollbar/horizontalScrollbar", "vs/base/browser/ui/scrollbar/verticalScrollbar", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/scrollable", "vs/css!./media/scrollbars"], function (require, exports, browser_1, dom, fastDomNode_1, mouseEvent_1, horizontalScrollbar_1, verticalScrollbar_1, widget_1, async_1, event_1, lifecycle_1, platform, scrollable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DomScrollableElement = exports.SmoothScrollableElement = exports.ScrollableElement = exports.AbstractScrollableElement = exports.MouseWheelClassifier = void 0;
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
    class MouseWheelClassifier {
        static { this.INSTANCE = new MouseWheelClassifier(); }
        constructor() {
            this._capacity = 5;
            this._memory = [];
            this._front = -1;
            this._rear = -1;
        }
        isPhysicalMouseWheel() {
            if (this._front === -1 && this._rear === -1) {
                // no elements
                return false;
            }
            // 0.5 * last + 0.25 * 2nd last + 0.125 * 3rd last + ...
            let remainingInfluence = 1;
            let score = 0;
            let iteration = 1;
            let index = this._rear;
            do {
                const influence = (index === this._front ? remainingInfluence : Math.pow(2, -iteration));
                remainingInfluence -= influence;
                score += this._memory[index].score * influence;
                if (index === this._front) {
                    break;
                }
                index = (this._capacity + index - 1) % this._capacity;
                iteration++;
            } while (true);
            return (score <= 0.5);
        }
        acceptStandardWheelEvent(e) {
            const osZoomFactor = window.devicePixelRatio / (0, browser_1.getZoomFactor)();
            if (platform.isWindows || platform.isLinux) {
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
            item.score = this._computeScore(item);
            if (this._front === -1 && this._rear === -1) {
                this._memory[0] = item;
                this._front = 0;
                this._rear = 0;
            }
            else {
                this._rear = (this._rear + 1) % this._capacity;
                if (this._rear === this._front) {
                    // Drop oldest
                    this._front = (this._front + 1) % this._capacity;
                }
                this._memory[this._rear] = item;
            }
        }
        /**
         * A score between 0 and 1 for `item`.
         *  - a score towards 0 indicates that the source appears to be a physical mouse wheel
         *  - a score towards 1 indicates that the source appears to be a touchpad or magic mouse, etc.
         */
        _computeScore(item) {
            if (Math.abs(item.deltaX) > 0 && Math.abs(item.deltaY) > 0) {
                // both axes exercised => definitely not a physical mouse wheel
                return 1;
            }
            let score = 0.5;
            const prev = (this._front === -1 && this._rear === -1 ? null : this._memory[this._rear]);
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
            if (!this._isAlmostInt(item.deltaX) || !this._isAlmostInt(item.deltaY)) {
                // non-integer deltas => indicator that this is not a physical mouse wheel
                score += 0.25;
            }
            return Math.min(Math.max(score, 0), 1);
        }
        _isAlmostInt(value) {
            const delta = Math.abs(Math.round(value) - value);
            return (delta < 0.01);
        }
    }
    exports.MouseWheelClassifier = MouseWheelClassifier;
    class AbstractScrollableElement extends widget_1.Widget {
        get options() {
            return this._options;
        }
        constructor(element, options, scrollable) {
            super();
            this._onScroll = this._register(new event_1.Emitter());
            this.onScroll = this._onScroll.event;
            this._onWillScroll = this._register(new event_1.Emitter());
            this.onWillScroll = this._onWillScroll.event;
            element.style.overflow = 'hidden';
            this._options = resolveOptions(options);
            this._scrollable = scrollable;
            this._register(this._scrollable.onScroll((e) => {
                this._onWillScroll.fire(e);
                this._onDidScroll(e);
                this._onScroll.fire(e);
            }));
            const scrollbarHost = {
                onMouseWheel: (mouseWheelEvent) => this._onMouseWheel(mouseWheelEvent),
                onDragStart: () => this._onDragStart(),
                onDragEnd: () => this._onDragEnd(),
            };
            this._verticalScrollbar = this._register(new verticalScrollbar_1.VerticalScrollbar(this._scrollable, this._options, scrollbarHost));
            this._horizontalScrollbar = this._register(new horizontalScrollbar_1.HorizontalScrollbar(this._scrollable, this._options, scrollbarHost));
            this._domNode = document.createElement('div');
            this._domNode.className = 'monaco-scrollable-element ' + this._options.className;
            this._domNode.setAttribute('role', 'presentation');
            this._domNode.style.position = 'relative';
            this._domNode.style.overflow = 'hidden';
            this._domNode.appendChild(element);
            this._domNode.appendChild(this._horizontalScrollbar.domNode.domNode);
            this._domNode.appendChild(this._verticalScrollbar.domNode.domNode);
            if (this._options.useShadows) {
                this._leftShadowDomNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
                this._leftShadowDomNode.setClassName('shadow');
                this._domNode.appendChild(this._leftShadowDomNode.domNode);
                this._topShadowDomNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
                this._topShadowDomNode.setClassName('shadow');
                this._domNode.appendChild(this._topShadowDomNode.domNode);
                this._topLeftShadowDomNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
                this._topLeftShadowDomNode.setClassName('shadow');
                this._domNode.appendChild(this._topLeftShadowDomNode.domNode);
            }
            else {
                this._leftShadowDomNode = null;
                this._topShadowDomNode = null;
                this._topLeftShadowDomNode = null;
            }
            this._listenOnDomNode = this._options.listenOnDomNode || this._domNode;
            this._mouseWheelToDispose = [];
            this._setListeningToMouseWheel(this._options.handleMouseWheel);
            this.onmouseover(this._listenOnDomNode, (e) => this._onMouseOver(e));
            this.onmouseleave(this._listenOnDomNode, (e) => this._onMouseLeave(e));
            this._hideTimeout = this._register(new async_1.TimeoutTimer());
            this._isDragging = false;
            this._mouseIsOver = false;
            this._shouldRender = true;
            this._revealOnScroll = true;
        }
        dispose() {
            this._mouseWheelToDispose = (0, lifecycle_1.dispose)(this._mouseWheelToDispose);
            super.dispose();
        }
        /**
         * Get the generated 'scrollable' dom node
         */
        getDomNode() {
            return this._domNode;
        }
        getOverviewRulerLayoutInfo() {
            return {
                parent: this._domNode,
                insertBefore: this._verticalScrollbar.domNode.domNode,
            };
        }
        /**
         * Delegate a pointer down event to the vertical scrollbar.
         * This is to help with clicking somewhere else and having the scrollbar react.
         */
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this._verticalScrollbar.delegatePointerDown(browserEvent);
        }
        getScrollDimensions() {
            return this._scrollable.getScrollDimensions();
        }
        setScrollDimensions(dimensions) {
            this._scrollable.setScrollDimensions(dimensions, false);
        }
        /**
         * Update the class name of the scrollable element.
         */
        updateClassName(newClassName) {
            this._options.className = newClassName;
            // Defaults are different on Macs
            if (platform.isMacintosh) {
                this._options.className += ' mac';
            }
            this._domNode.className = 'monaco-scrollable-element ' + this._options.className;
        }
        /**
         * Update configuration options for the scrollbar.
         */
        updateOptions(newOptions) {
            if (typeof newOptions.handleMouseWheel !== 'undefined') {
                this._options.handleMouseWheel = newOptions.handleMouseWheel;
                this._setListeningToMouseWheel(this._options.handleMouseWheel);
            }
            if (typeof newOptions.mouseWheelScrollSensitivity !== 'undefined') {
                this._options.mouseWheelScrollSensitivity = newOptions.mouseWheelScrollSensitivity;
            }
            if (typeof newOptions.fastScrollSensitivity !== 'undefined') {
                this._options.fastScrollSensitivity = newOptions.fastScrollSensitivity;
            }
            if (typeof newOptions.scrollPredominantAxis !== 'undefined') {
                this._options.scrollPredominantAxis = newOptions.scrollPredominantAxis;
            }
            if (typeof newOptions.horizontal !== 'undefined') {
                this._options.horizontal = newOptions.horizontal;
            }
            if (typeof newOptions.vertical !== 'undefined') {
                this._options.vertical = newOptions.vertical;
            }
            if (typeof newOptions.horizontalScrollbarSize !== 'undefined') {
                this._options.horizontalScrollbarSize = newOptions.horizontalScrollbarSize;
            }
            if (typeof newOptions.verticalScrollbarSize !== 'undefined') {
                this._options.verticalScrollbarSize = newOptions.verticalScrollbarSize;
            }
            if (typeof newOptions.scrollByPage !== 'undefined') {
                this._options.scrollByPage = newOptions.scrollByPage;
            }
            this._horizontalScrollbar.updateOptions(this._options);
            this._verticalScrollbar.updateOptions(this._options);
            if (!this._options.lazyRender) {
                this._render();
            }
        }
        setRevealOnScroll(value) {
            this._revealOnScroll = value;
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this._onMouseWheel(new mouseEvent_1.StandardWheelEvent(browserEvent));
        }
        // -------------------- mouse wheel scrolling --------------------
        _setListeningToMouseWheel(shouldListen) {
            const isListening = (this._mouseWheelToDispose.length > 0);
            if (isListening === shouldListen) {
                // No change
                return;
            }
            // Stop listening (if necessary)
            this._mouseWheelToDispose = (0, lifecycle_1.dispose)(this._mouseWheelToDispose);
            // Start listening (if necessary)
            if (shouldListen) {
                const onMouseWheel = (browserEvent) => {
                    this._onMouseWheel(new mouseEvent_1.StandardWheelEvent(browserEvent));
                };
                this._mouseWheelToDispose.push(dom.addDisposableListener(this._listenOnDomNode, dom.EventType.MOUSE_WHEEL, onMouseWheel, { passive: false }));
            }
        }
        _onMouseWheel(e) {
            if (e.browserEvent?.defaultPrevented) {
                return;
            }
            const classifier = MouseWheelClassifier.INSTANCE;
            if (SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED) {
                classifier.acceptStandardWheelEvent(e);
            }
            // console.log(`${Date.now()}, ${e.deltaY}, ${e.deltaX}`);
            let didScroll = false;
            if (e.deltaY || e.deltaX) {
                let deltaY = e.deltaY * this._options.mouseWheelScrollSensitivity;
                let deltaX = e.deltaX * this._options.mouseWheelScrollSensitivity;
                if (this._options.scrollPredominantAxis) {
                    if (this._options.scrollYToX && deltaX + deltaY === 0) {
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
                if (this._options.flipAxes) {
                    [deltaY, deltaX] = [deltaX, deltaY];
                }
                // Convert vertical scrolling to horizontal if shift is held, this
                // is handled at a higher level on Mac
                const shiftConvert = !platform.isMacintosh && e.browserEvent && e.browserEvent.shiftKey;
                if ((this._options.scrollYToX || shiftConvert) && !deltaX) {
                    deltaX = deltaY;
                    deltaY = 0;
                }
                if (e.browserEvent && e.browserEvent.altKey) {
                    // fastScrolling
                    deltaX = deltaX * this._options.fastScrollSensitivity;
                    deltaY = deltaY * this._options.fastScrollSensitivity;
                }
                const futureScrollPosition = this._scrollable.getFutureScrollPosition();
                let desiredScrollPosition = {};
                if (deltaY) {
                    const deltaScrollTop = SCROLL_WHEEL_SENSITIVITY * deltaY;
                    // Here we convert values such as -0.3 to -1 or 0.3 to 1, otherwise low speed scrolling will never scroll
                    const desiredScrollTop = futureScrollPosition.scrollTop - (deltaScrollTop < 0 ? Math.floor(deltaScrollTop) : Math.ceil(deltaScrollTop));
                    this._verticalScrollbar.writeScrollPosition(desiredScrollPosition, desiredScrollTop);
                }
                if (deltaX) {
                    const deltaScrollLeft = SCROLL_WHEEL_SENSITIVITY * deltaX;
                    // Here we convert values such as -0.3 to -1 or 0.3 to 1, otherwise low speed scrolling will never scroll
                    const desiredScrollLeft = futureScrollPosition.scrollLeft - (deltaScrollLeft < 0 ? Math.floor(deltaScrollLeft) : Math.ceil(deltaScrollLeft));
                    this._horizontalScrollbar.writeScrollPosition(desiredScrollPosition, desiredScrollLeft);
                }
                // Check that we are scrolling towards a location which is valid
                desiredScrollPosition = this._scrollable.validateScrollPosition(desiredScrollPosition);
                if (futureScrollPosition.scrollLeft !== desiredScrollPosition.scrollLeft || futureScrollPosition.scrollTop !== desiredScrollPosition.scrollTop) {
                    const canPerformSmoothScroll = (SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED
                        && this._options.mouseWheelSmoothScroll
                        && classifier.isPhysicalMouseWheel());
                    if (canPerformSmoothScroll) {
                        this._scrollable.setScrollPositionSmooth(desiredScrollPosition);
                    }
                    else {
                        this._scrollable.setScrollPositionNow(desiredScrollPosition);
                    }
                    didScroll = true;
                }
            }
            let consumeMouseWheel = didScroll;
            if (!consumeMouseWheel && this._options.alwaysConsumeMouseWheel) {
                consumeMouseWheel = true;
            }
            if (!consumeMouseWheel && this._options.consumeMouseWheelIfScrollbarIsNeeded && (this._verticalScrollbar.isNeeded() || this._horizontalScrollbar.isNeeded())) {
                consumeMouseWheel = true;
            }
            if (consumeMouseWheel) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
        _onDidScroll(e) {
            this._shouldRender = this._horizontalScrollbar.onDidScroll(e) || this._shouldRender;
            this._shouldRender = this._verticalScrollbar.onDidScroll(e) || this._shouldRender;
            if (this._options.useShadows) {
                this._shouldRender = true;
            }
            if (this._revealOnScroll) {
                this._reveal();
            }
            if (!this._options.lazyRender) {
                this._render();
            }
        }
        /**
         * Render / mutate the DOM now.
         * Should be used together with the ctor option `lazyRender`.
         */
        renderNow() {
            if (!this._options.lazyRender) {
                throw new Error('Please use `lazyRender` together with `renderNow`!');
            }
            this._render();
        }
        _render() {
            if (!this._shouldRender) {
                return;
            }
            this._shouldRender = false;
            this._horizontalScrollbar.render();
            this._verticalScrollbar.render();
            if (this._options.useShadows) {
                const scrollState = this._scrollable.getCurrentScrollPosition();
                const enableTop = scrollState.scrollTop > 0;
                const enableLeft = scrollState.scrollLeft > 0;
                const leftClassName = (enableLeft ? ' left' : '');
                const topClassName = (enableTop ? ' top' : '');
                const topLeftClassName = (enableLeft || enableTop ? ' top-left-corner' : '');
                this._leftShadowDomNode.setClassName(`shadow${leftClassName}`);
                this._topShadowDomNode.setClassName(`shadow${topClassName}`);
                this._topLeftShadowDomNode.setClassName(`shadow${topLeftClassName}${topClassName}${leftClassName}`);
            }
        }
        // -------------------- fade in / fade out --------------------
        _onDragStart() {
            this._isDragging = true;
            this._reveal();
        }
        _onDragEnd() {
            this._isDragging = false;
            this._hide();
        }
        _onMouseLeave(e) {
            this._mouseIsOver = false;
            this._hide();
        }
        _onMouseOver(e) {
            this._mouseIsOver = true;
            this._reveal();
        }
        _reveal() {
            this._verticalScrollbar.beginReveal();
            this._horizontalScrollbar.beginReveal();
            this._scheduleHide();
        }
        _hide() {
            if (!this._mouseIsOver && !this._isDragging) {
                this._verticalScrollbar.beginHide();
                this._horizontalScrollbar.beginHide();
            }
        }
        _scheduleHide() {
            if (!this._mouseIsOver && !this._isDragging) {
                this._hideTimeout.cancelAndSet(() => this._hide(), HIDE_TIMEOUT);
            }
        }
    }
    exports.AbstractScrollableElement = AbstractScrollableElement;
    class ScrollableElement extends AbstractScrollableElement {
        constructor(element, options) {
            options = options || {};
            options.mouseWheelSmoothScroll = false;
            const scrollable = new scrollable_1.Scrollable({
                forceIntegerValues: true,
                smoothScrollDuration: 0,
                scheduleAtNextAnimationFrame: (callback) => dom.scheduleAtNextAnimationFrame(callback)
            });
            super(element, options, scrollable);
            this._register(scrollable);
        }
        setScrollPosition(update) {
            this._scrollable.setScrollPositionNow(update);
        }
        getScrollPosition() {
            return this._scrollable.getCurrentScrollPosition();
        }
    }
    exports.ScrollableElement = ScrollableElement;
    class SmoothScrollableElement extends AbstractScrollableElement {
        constructor(element, options, scrollable) {
            super(element, options, scrollable);
        }
        setScrollPosition(update) {
            if (update.reuseAnimation) {
                this._scrollable.setScrollPositionSmooth(update, update.reuseAnimation);
            }
            else {
                this._scrollable.setScrollPositionNow(update);
            }
        }
        getScrollPosition() {
            return this._scrollable.getCurrentScrollPosition();
        }
    }
    exports.SmoothScrollableElement = SmoothScrollableElement;
    class DomScrollableElement extends AbstractScrollableElement {
        constructor(element, options) {
            options = options || {};
            options.mouseWheelSmoothScroll = false;
            const scrollable = new scrollable_1.Scrollable({
                forceIntegerValues: false,
                smoothScrollDuration: 0,
                scheduleAtNextAnimationFrame: (callback) => dom.scheduleAtNextAnimationFrame(callback)
            });
            super(element, options, scrollable);
            this._register(scrollable);
            this._element = element;
            this._register(this.onScroll((e) => {
                if (e.scrollTopChanged) {
                    this._element.scrollTop = e.scrollTop;
                }
                if (e.scrollLeftChanged) {
                    this._element.scrollLeft = e.scrollLeft;
                }
            }));
            this.scanDomNode();
        }
        setScrollPosition(update) {
            this._scrollable.setScrollPositionNow(update);
        }
        getScrollPosition() {
            return this._scrollable.getCurrentScrollPosition();
        }
        scanDomNode() {
            // width, scrollLeft, scrollWidth, height, scrollTop, scrollHeight
            this.setScrollDimensions({
                width: this._element.clientWidth,
                scrollWidth: this._element.scrollWidth,
                height: this._element.clientHeight,
                scrollHeight: this._element.scrollHeight
            });
            this.setScrollPosition({
                scrollLeft: this._element.scrollLeft,
                scrollTop: this._element.scrollTop,
            });
        }
    }
    exports.DomScrollableElement = DomScrollableElement;
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
        if (platform.isMacintosh) {
            result.className += ' mac';
        }
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsYWJsZUVsZW1lbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvc2Nyb2xsYmFyL3Njcm9sbGFibGVFbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDO0lBQ3pCLE1BQU0sd0JBQXdCLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLE1BQU0sa0NBQWtDLEdBQUcsSUFBSSxDQUFDO0lBT2hELE1BQU0sd0JBQXdCO1FBTTdCLFlBQVksU0FBaUIsRUFBRSxNQUFjLEVBQUUsTUFBYztZQUM1RCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNoQixDQUFDO0tBQ0Q7SUFFRCxNQUFhLG9CQUFvQjtpQkFFVCxhQUFRLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO1FBTzdEO1lBQ0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLENBQUM7UUFFTSxvQkFBb0I7WUFDMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzVDLGNBQWM7Z0JBQ2QsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELHdEQUF3RDtZQUN4RCxJQUFJLGtCQUFrQixHQUFHLENB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