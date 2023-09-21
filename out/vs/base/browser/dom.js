/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/canIUse", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/browser/dompurify/dompurify", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri"], function (require, exports, browser, canIUse_1, keyboardEvent_1, mouseEvent_1, async_1, errors_1, event, dompurify, lifecycle_1, network_1, platform, uri_1) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.h = exports.DragAndDropObserver = exports.getCookieValue = exports.ModifierKeyEmitter = exports.multibyteAwareBtoa = exports.safeInnerHtml = exports.basicMarkupHtmlTags = exports.hookDomPurifyHrefAndSrcSanitizer = exports.detectFullscreen = exports.DetectedFullscreenMode = exports.triggerUpload = exports.triggerDownload = exports.asCssValueWithDefault = exports.asCSSPropertyValue = exports.asCSSUrl = exports.animate = exports.windowOpenWithSuccess = exports.windowOpenPopup = exports.windowOpenNoOpener = exports.computeScreenAwareSize = exports.domContentLoaded = exports.finalHandler = exports.removeTabIndexAndUpdateFocus = exports.hide = exports.show = exports.setVisibility = exports.join = exports.$ = exports.Namespace = exports.reset = exports.prepend = exports.append = exports.after = exports.trackFocus = exports.restoreParentsScrollTop = exports.saveParentsScrollTop = exports.EventHelper = exports.isEventLike = exports.EventType = exports.isHTMLElement = exports.removeCSSRulesContainingSelector = exports.createCSSRule = exports.createMetaElement = exports.createStyleSheet = exports.getActiveDocument = exports.getActiveElement = exports.getShadowRoot = exports.isInShadowDOM = exports.isShadowRoot = exports.hasParentWithClass = exports.findParentWithClass = exports.isAncestorUsingFlowTo = exports.setParentFlowTo = exports.isAncestor = exports.getLargestChildWidth = exports.getTotalHeight = exports.getContentHeight = exports.getTotalScrollWidth = exports.getContentWidth = exports.getTotalWidth = exports.getDomNodeZoomLevel = exports.getDomNodePagePosition = exports.position = exports.size = exports.getTopLeftOffset = exports.Dimension = exports.getClientArea = exports.getComputedStyle = exports.addDisposableThrottledListener = exports.modify = exports.measure = exports.scheduleAtNextAnimationFrame = exports.runAtThisOrScheduleAtNextAnimationFrame = exports.addDisposableGenericMouseUpListener = exports.addDisposableGenericMouseMoveListener = exports.addDisposableGenericMouseDownListener = exports.addStandardDisposableGenericMouseUpListener = exports.addStandardDisposableGenericMouseDownListener = exports.addStandardDisposableListener = exports.addDisposableListener = exports.isInDOM = exports.clearNode = exports.onDidCreateWindow = exports.getWindows = exports.registerWindow = void 0;
    _a = (function () {
        const windows = [];
        const onDidCreateWindow = new event.Emitter();
        return {
            onDidCreateWindow: onDidCreateWindow.event,
            registerWindow(window) {
                windows.push(window);
                const disposableStore = new lifecycle_1.DisposableStore();
                disposableStore.add((0, lifecycle_1.toDisposable)(() => {
                    const index = windows.indexOf(window);
                    if (index !== -1) {
                        windows.splice(index, 1);
                    }
                }));
                onDidCreateWindow.fire({ window, disposableStore });
                return disposableStore;
            },
            getWindows() {
                return windows;
            }
        };
    })(), exports.registerWindow = _a.registerWindow, exports.getWindows = _a.getWindows, exports.onDidCreateWindow = _a.onDidCreateWindow;
    function clearNode(node) {
        while (node.firstChild) {
            node.firstChild.remove();
        }
    }
    exports.clearNode = clearNode;
    /**
     * @deprecated Use node.isConnected directly
     */
    function isInDOM(node) {
        return node?.isConnected ?? false;
    }
    exports.isInDOM = isInDOM;
    class DomListener {
        constructor(node, type, handler, options) {
            this._node = node;
            this._type = type;
            this._handler = handler;
            this._options = (options || false);
            this._node.addEventListener(this._type, this._handler, this._options);
        }
        dispose() {
            if (!this._handler) {
                // Already disposed
                return;
            }
            this._node.removeEventListener(this._type, this._handler, this._options);
            // Prevent leakers from holding on to the dom or handler func
            this._node = null;
            this._handler = null;
        }
    }
    function addDisposableListener(node, type, handler, useCaptureOrOptions) {
        return new DomListener(node, type, handler, useCaptureOrOptions);
    }
    exports.addDisposableListener = addDisposableListener;
    function _wrapAsStandardMouseEvent(handler) {
        return function (e) {
            return handler(new mouseEvent_1.StandardMouseEvent(e));
        };
    }
    function _wrapAsStandardKeyboardEvent(handler) {
        return function (e) {
            return handler(new keyboardEvent_1.StandardKeyboardEvent(e));
        };
    }
    const addStandardDisposableListener = function addStandardDisposableListener(node, type, handler, useCapture) {
        let wrapHandler = handler;
        if (type === 'click' || type === 'mousedown') {
            wrapHandler = _wrapAsStandardMouseEvent(handler);
        }
        else if (type === 'keydown' || type === 'keypress' || type === 'keyup') {
            wrapHandler = _wrapAsStandardKeyboardEvent(handler);
        }
        return addDisposableListener(node, type, wrapHandler, useCapture);
    };
    exports.addStandardDisposableListener = addStandardDisposableListener;
    const addStandardDisposableGenericMouseDownListener = function addStandardDisposableListener(node, handler, useCapture) {
        const wrapHandler = _wrapAsStandardMouseEvent(handler);
        return addDisposableGenericMouseDownListener(node, wrapHandler, useCapture);
    };
    exports.addStandardDisposableGenericMouseDownListener = addStandardDisposableGenericMouseDownListener;
    const addStandardDisposableGenericMouseUpListener = function addStandardDisposableListener(node, handler, useCapture) {
        const wrapHandler = _wrapAsStandardMouseEvent(handler);
        return addDisposableGenericMouseUpListener(node, wrapHandler, useCapture);
    };
    exports.addStandardDisposableGenericMouseUpListener = addStandardDisposableGenericMouseUpListener;
    function addDisposableGenericMouseDownListener(node, handler, useCapture) {
        return addDisposableListener(node, platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents ? exports.EventType.POINTER_DOWN : exports.EventType.MOUSE_DOWN, handler, useCapture);
    }
    exports.addDisposableGenericMouseDownListener = addDisposableGenericMouseDownListener;
    function addDisposableGenericMouseMoveListener(node, handler, useCapture) {
        return addDisposableListener(node, platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents ? exports.EventType.POINTER_MOVE : exports.EventType.MOUSE_MOVE, handler, useCapture);
    }
    exports.addDisposableGenericMouseMoveListener = addDisposableGenericMouseMoveListener;
    function addDisposableGenericMouseUpListener(node, handler, useCapture) {
        return addDisposableListener(node, platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents ? exports.EventType.POINTER_UP : exports.EventType.MOUSE_UP, handler, useCapture);
    }
    exports.addDisposableGenericMouseUpListener = addDisposableGenericMouseUpListener;
    class AnimationFrameQueueItem {
        constructor(runner, priority = 0) {
            this._runner = runner;
            this.priority = priority;
            this._canceled = false;
        }
        dispose() {
            this._canceled = true;
        }
        execute() {
            if (this._canceled) {
                return;
            }
            try {
                this._runner();
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
        }
        // Sort by priority (largest to lowest)
        static sort(a, b) {
            return b.priority - a.priority;
        }
    }
    (function () {
        /**
         * The runners scheduled at the next animation frame
         */
        let NEXT_QUEUE = [];
        /**
         * The runners scheduled at the current animation frame
         */
        let CURRENT_QUEUE = null;
        /**
         * A flag to keep track if the native requestAnimationFrame was already called
         */
        let animFrameRequested = false;
        /**
         * A flag to indicate if currently handling a native requestAnimationFrame callback
         */
        let inAnimationFrameRunner = false;
        const animationFrameRunner = () => {
            animFrameRequested = false;
            CURRENT_QUEUE = NEXT_QUEUE;
            NEXT_QUEUE = [];
            inAnimationFrameRunner = true;
            while (CURRENT_QUEUE.length > 0) {
                CURRENT_QUEUE.sort(AnimationFrameQueueItem.sort);
                const top = CURRENT_QUEUE.shift();
                top.execute();
            }
            inAnimationFrameRunner = false;
        };
        exports.scheduleAtNextAnimationFrame = (runner, priority = 0) => {
            const item = new AnimationFrameQueueItem(runner, priority);
            NEXT_QUEUE.push(item);
            if (!animFrameRequested) {
                animFrameRequested = true;
                requestAnimationFrame(animationFrameRunner);
            }
            return item;
        };
        exports.runAtThisOrScheduleAtNextAnimationFrame = (runner, priority) => {
            if (inAnimationFrameRunner) {
                const item = new AnimationFrameQueueItem(runner, priority);
                CURRENT_QUEUE.push(item);
                return item;
            }
            else {
                return (0, exports.scheduleAtNextAnimationFrame)(runner, priority);
            }
        };
    })();
    function measure(callback) {
        return (0, exports.scheduleAtNextAnimationFrame)(callback, 10000 /* must be early */);
    }
    exports.measure = measure;
    function modify(callback) {
        return (0, exports.scheduleAtNextAnimationFrame)(callback, -10000 /* must be late */);
    }
    exports.modify = modify;
    const MINIMUM_TIME_MS = 8;
    const DEFAULT_EVENT_MERGER = function (lastEvent, currentEvent) {
        return currentEvent;
    };
    class TimeoutThrottledDomListener extends lifecycle_1.Disposable {
        constructor(node, type, handler, eventMerger = DEFAULT_EVENT_MERGER, minimumTimeMs = MINIMUM_TIME_MS) {
            super();
            let lastEvent = null;
            let lastHandlerTime = 0;
            const timeout = this._register(new async_1.TimeoutTimer());
            const invokeHandler = () => {
                lastHandlerTime = (new Date()).getTime();
                handler(lastEvent);
                lastEvent = null;
            };
            this._register(addDisposableListener(node, type, (e) => {
                lastEvent = eventMerger(lastEvent, e);
                const elapsedTime = (new Date()).getTime() - lastHandlerTime;
                if (elapsedTime >= minimumTimeMs) {
                    timeout.cancel();
                    invokeHandler();
                }
                else {
                    timeout.setIfNotSet(invokeHandler, minimumTimeMs - elapsedTime);
                }
            }));
        }
    }
    function addDisposableThrottledListener(node, type, handler, eventMerger, minimumTimeMs) {
        return new TimeoutThrottledDomListener(node, type, handler, eventMerger, minimumTimeMs);
    }
    exports.addDisposableThrottledListener = addDisposableThrottledListener;
    function getComputedStyle(el) {
        return el.ownerDocument.defaultView.getComputedStyle(el, null);
    }
    exports.getComputedStyle = getComputedStyle;
    function getClientArea(element) {
        const elDocument = element.ownerDocument;
        const elWindow = elDocument.defaultView?.window;
        // Try with DOM clientWidth / clientHeight
        if (element !== elDocument.body) {
            return new Dimension(element.clientWidth, element.clientHeight);
        }
        // If visual view port exits and it's on mobile, it should be used instead of window innerWidth / innerHeight, or document.body.clientWidth / document.body.clientHeight
        if (platform.isIOS && elWindow?.visualViewport) {
            return new Dimension(elWindow.visualViewport.width, elWindow.visualViewport.height);
        }
        // Try innerWidth / innerHeight
        if (elWindow?.innerWidth && elWindow.innerHeight) {
            return new Dimension(elWindow.innerWidth, elWindow.innerHeight);
        }
        // Try with document.body.clientWidth / document.body.clientHeight
        if (elDocument.body && elDocument.body.clientWidth && elDocument.body.clientHeight) {
            return new Dimension(elDocument.body.clientWidth, elDocument.body.clientHeight);
        }
        // Try with document.documentElement.clientWidth / document.documentElement.clientHeight
        if (elDocument.documentElement && elDocument.documentElement.clientWidth && elDocument.documentElement.clientHeight) {
            return new Dimension(elDocument.documentElement.clientWidth, elDocument.documentElement.clientHeight);
        }
        throw new Error('Unable to figure out browser width and height');
    }
    exports.getClientArea = getClientArea;
    class SizeUtils {
        // Adapted from WinJS
        // Converts a CSS positioning string for the specified element to pixels.
        static convertToPixels(element, value) {
            return parseFloat(value) || 0;
        }
        static getDimension(element, cssPropertyName, jsPropertyName) {
            const computedStyle = getComputedStyle(element);
            const value = computedStyle ? computedStyle.getPropertyValue(cssPropertyName) : '0';
            return SizeUtils.convertToPixels(element, value);
        }
        static getBorderLeftWidth(element) {
            return SizeUtils.getDimension(element, 'border-left-width', 'borderLeftWidth');
        }
        static getBorderRightWidth(element) {
            return SizeUtils.getDimension(element, 'border-right-width', 'borderRightWidth');
        }
        static getBorderTopWidth(element) {
            return SizeUtils.getDimension(element, 'border-top-width', 'borderTopWidth');
        }
        static getBorderBottomWidth(element) {
            return SizeUtils.getDimension(element, 'border-bottom-width', 'borderBottomWidth');
        }
        static getPaddingLeft(element) {
            return SizeUtils.getDimension(element, 'padding-left', 'paddingLeft');
        }
        static getPaddingRight(element) {
            return SizeUtils.getDimension(element, 'padding-right', 'paddingRight');
        }
        static getPaddingTop(element) {
            return SizeUtils.getDimension(element, 'padding-top', 'paddingTop');
        }
        static getPaddingBottom(element) {
            return SizeUtils.getDimension(element, 'padding-bottom', 'paddingBottom');
        }
        static getMarginLeft(element) {
            return SizeUtils.getDimension(element, 'margin-left', 'marginLeft');
        }
        static getMarginTop(element) {
            return SizeUtils.getDimension(element, 'margin-top', 'marginTop');
        }
        static getMarginRight(element) {
            return SizeUtils.getDimension(element, 'margin-right', 'marginRight');
        }
        static getMarginBottom(element) {
            return SizeUtils.getDimension(element, 'margin-bottom', 'marginBottom');
        }
    }
    class Dimension {
        static { this.None = new Dimension(0, 0); }
        constructor(width, height) {
            this.width = width;
            this.height = height;
        }
        with(width = this.width, height = this.height) {
            if (width !== this.width || height !== this.height) {
                return new Dimension(width, height);
            }
            else {
                return this;
            }
        }
        static is(obj) {
            return typeof obj === 'object' && typeof obj.height === 'number' && typeof obj.width === 'number';
        }
        static lift(obj) {
            if (obj instanceof Dimension) {
                return obj;
            }
            else {
                return new Dimension(obj.width, obj.height);
            }
        }
        static equals(a, b) {
            if (a === b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.width === b.width && a.height === b.height;
        }
    }
    exports.Dimension = Dimension;
    function getTopLeftOffset(element) {
        // Adapted from WinJS.Utilities.getPosition
        // and added borders to the mix
        let offsetParent = element.offsetParent;
        let top = element.offsetTop;
        let left = element.offsetLeft;
        while ((element = element.parentNode) !== null
            && element !== element.ownerDocument.body
            && element !== element.ownerDocument.documentElement) {
            top -= element.scrollTop;
            const c = isShadowRoot(element) ? null : getComputedStyle(element);
            if (c) {
                left -= c.direction !== 'rtl' ? element.scrollLeft : -element.scrollLeft;
            }
            if (element === offsetParent) {
                left += SizeUtils.getBorderLeftWidth(element);
                top += SizeUtils.getBorderTopWidth(element);
                top += element.offsetTop;
                left += element.offsetLeft;
                offsetParent = element.offsetParent;
            }
        }
        return {
            left: left,
            top: top
        };
    }
    exports.getTopLeftOffset = getTopLeftOffset;
    function size(element, width, height) {
        if (typeof width === 'number') {
            element.style.width = `${width}px`;
        }
        if (typeof height === 'number') {
            element.style.height = `${height}px`;
        }
    }
    exports.size = size;
    function position(element, top, right, bottom, left, position = 'absolute') {
        if (typeof top === 'number') {
            element.style.top = `${top}px`;
        }
        if (typeof right === 'number') {
            element.style.right = `${right}px`;
        }
        if (typeof bottom === 'number') {
            element.style.bottom = `${bottom}px`;
        }
        if (typeof left === 'number') {
            element.style.left = `${left}px`;
        }
        element.style.position = position;
    }
    exports.position = position;
    /**
     * Returns the position of a dom node relative to the entire page.
     */
    function getDomNodePagePosition(domNode) {
        const bb = domNode.getBoundingClientRect();
        return {
            left: bb.left + (domNode.ownerDocument.defaultView?.scrollX ?? 0),
            top: bb.top + (domNode.ownerDocument.defaultView?.scrollY ?? 0),
            width: bb.width,
            height: bb.height
        };
    }
    exports.getDomNodePagePosition = getDomNodePagePosition;
    /**
     * Returns the effective zoom on a given element before window zoom level is applied
     */
    function getDomNodeZoomLevel(domNode) {
        let testElement = domNode;
        let zoom = 1.0;
        do {
            const elementZoomLevel = getComputedStyle(testElement).zoom;
            if (elementZoomLevel !== null && elementZoomLevel !== undefined && elementZoomLevel !== '1') {
                zoom *= elementZoomLevel;
            }
            testElement = testElement.parentElement;
        } while (testElement !== null && testElement !== testElement.ownerDocument.documentElement);
        return zoom;
    }
    exports.getDomNodeZoomLevel = getDomNodeZoomLevel;
    // Adapted from WinJS
    // Gets the width of the element, including margins.
    function getTotalWidth(element) {
        const margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
        return element.offsetWidth + margin;
    }
    exports.getTotalWidth = getTotalWidth;
    function getContentWidth(element) {
        const border = SizeUtils.getBorderLeftWidth(element) + SizeUtils.getBorderRightWidth(element);
        const padding = SizeUtils.getPaddingLeft(element) + SizeUtils.getPaddingRight(element);
        return element.offsetWidth - border - padding;
    }
    exports.getContentWidth = getContentWidth;
    function getTotalScrollWidth(element) {
        const margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
        return element.scrollWidth + margin;
    }
    exports.getTotalScrollWidth = getTotalScrollWidth;
    // Adapted from WinJS
    // Gets the height of the content of the specified element. The content height does not include borders or padding.
    function getContentHeight(element) {
        const border = SizeUtils.getBorderTopWidth(element) + SizeUtils.getBorderBottomWidth(element);
        const padding = SizeUtils.getPaddingTop(element) + SizeUtils.getPaddingBottom(element);
        return element.offsetHeight - border - padding;
    }
    exports.getContentHeight = getContentHeight;
    // Adapted from WinJS
    // Gets the height of the element, including its margins.
    function getTotalHeight(element) {
        const margin = SizeUtils.getMarginTop(element) + SizeUtils.getMarginBottom(element);
        return element.offsetHeight + margin;
    }
    exports.getTotalHeight = getTotalHeight;
    // Gets the left coordinate of the specified element relative to the specified parent.
    function getRelativeLeft(element, parent) {
        if (element === null) {
            return 0;
        }
        const elementPosition = getTopLeftOffset(element);
        const parentPosition = getTopLeftOffset(parent);
        return elementPosition.left - parentPosition.left;
    }
    function getLargestChildWidth(parent, children) {
        const childWidths = children.map((child) => {
            return Math.max(getTotalScrollWidth(child), getTotalWidth(child)) + getRelativeLeft(child, parent) || 0;
        });
        const maxWidth = Math.max(...childWidths);
        return maxWidth;
    }
    exports.getLargestChildWidth = getLargestChildWidth;
    // ----------------------------------------------------------------------------------------
    function isAncestor(testChild, testAncestor) {
        while (testChild) {
            if (testChild === testAncestor) {
                return true;
            }
            testChild = testChild.parentNode;
        }
        return false;
    }
    exports.isAncestor = isAncestor;
    const parentFlowToDataKey = 'parentFlowToElementId';
    /**
     * Set an explicit parent to use for nodes that are not part of the
     * regular dom structure.
     */
    function setParentFlowTo(fromChildElement, toParentElement) {
        fromChildElement.dataset[parentFlowToDataKey] = toParentElement.id;
    }
    exports.setParentFlowTo = setParentFlowTo;
    function getParentFlowToElement(node) {
        const flowToParentId = node.dataset[parentFlowToDataKey];
        if (typeof flowToParentId === 'string') {
            return node.ownerDocument.getElementById(flowToParentId);
        }
        return null;
    }
    /**
     * Check if `testAncestor` is an ancestor of `testChild`, observing the explicit
     * parents set by `setParentFlowTo`.
     */
    function isAncestorUsingFlowTo(testChild, testAncestor) {
        let node = testChild;
        while (node) {
            if (node === testAncestor) {
                return true;
            }
            if (node instanceof HTMLElement) {
                const flowToParentElement = getParentFlowToElement(node);
                if (flowToParentElement) {
                    node = flowToParentElement;
                    continue;
                }
            }
            node = node.parentNode;
        }
        return false;
    }
    exports.isAncestorUsingFlowTo = isAncestorUsingFlowTo;
    function findParentWithClass(node, clazz, stopAtClazzOrNode) {
        while (node && node.nodeType === node.ELEMENT_NODE) {
            if (node.classList.contains(clazz)) {
                return node;
            }
            if (stopAtClazzOrNode) {
                if (typeof stopAtClazzOrNode === 'string') {
                    if (node.classList.contains(stopAtClazzOrNode)) {
                        return null;
                    }
                }
                else {
                    if (node === stopAtClazzOrNode) {
                        return null;
                    }
                }
            }
            node = node.parentNode;
        }
        return null;
    }
    exports.findParentWithClass = findParentWithClass;
    function hasParentWithClass(node, clazz, stopAtClazzOrNode) {
        return !!findParentWithClass(node, clazz, stopAtClazzOrNode);
    }
    exports.hasParentWithClass = hasParentWithClass;
    function isShadowRoot(node) {
        return (node && !!node.host && !!node.mode);
    }
    exports.isShadowRoot = isShadowRoot;
    function isInShadowDOM(domNode) {
        return !!getShadowRoot(domNode);
    }
    exports.isInShadowDOM = isInShadowDOM;
    function getShadowRoot(domNode) {
        while (domNode.parentNode) {
            if (domNode === domNode.ownerDocument?.body) {
                // reached the body
                return null;
            }
            domNode = domNode.parentNode;
        }
        return isShadowRoot(domNode) ? domNode : null;
    }
    exports.getShadowRoot = getShadowRoot;
    /**
     * Returns the active element across all child windows.
     * Use this instead of `document.activeElement` to handle multiple windows.
     */
    function getActiveElement() {
        let result = getActiveDocument().activeElement;
        while (result?.shadowRoot) {
            result = result.shadowRoot.activeElement;
        }
        return result;
    }
    exports.getActiveElement = getActiveElement;
    /**
     * Returns the active document across all child windows.
     * Use this instead of `document` when reacting to dom events to handle multiple windows.
     */
    function getActiveDocument() {
        const documents = [document, ...(0, exports.getWindows)().map(w => w.document)];
        return documents.find(doc => doc.hasFocus()) ?? document;
    }
    exports.getActiveDocument = getActiveDocument;
    function createStyleSheet(container = document.getElementsByTagName('head')[0], beforeAppend) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.media = 'screen';
        beforeAppend?.(style);
        container.appendChild(style);
        return style;
    }
    exports.createStyleSheet = createStyleSheet;
    function createMetaElement(container = document.getElementsByTagName('head')[0]) {
        const meta = document.createElement('meta');
        container.appendChild(meta);
        return meta;
    }
    exports.createMetaElement = createMetaElement;
    let _sharedStyleSheet = null;
    function getSharedStyleSheet() {
        if (!_sharedStyleSheet) {
            _sharedStyleSheet = createStyleSheet();
        }
        return _sharedStyleSheet;
    }
    function getDynamicStyleSheetRules(style) {
        if (style?.sheet?.rules) {
            // Chrome, IE
            return style.sheet.rules;
        }
        if (style?.sheet?.cssRules) {
            // FF
            return style.sheet.cssRules;
        }
        return [];
    }
    function createCSSRule(selector, cssText, style = getSharedStyleSheet()) {
        if (!style || !cssText) {
            return;
        }
        style.sheet.insertRule(selector + '{' + cssText + '}', 0);
    }
    exports.createCSSRule = createCSSRule;
    function removeCSSRulesContainingSelector(ruleName, style = getSharedStyleSheet()) {
        if (!style) {
            return;
        }
        const rules = getDynamicStyleSheetRules(style);
        const toDelete = [];
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (rule.selectorText.indexOf(ruleName) !== -1) {
                toDelete.push(i);
            }
        }
        for (let i = toDelete.length - 1; i >= 0; i--) {
            style.sheet.deleteRule(toDelete[i]);
        }
    }
    exports.removeCSSRulesContainingSelector = removeCSSRulesContainingSelector;
    function isHTMLElement(o) {
        if (typeof HTMLElement === 'object') {
            return o instanceof HTMLElement;
        }
        return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
    }
    exports.isHTMLElement = isHTMLElement;
    exports.EventType = {
        // Mouse
        CLICK: 'click',
        AUXCLICK: 'auxclick',
        DBLCLICK: 'dblclick',
        MOUSE_UP: 'mouseup',
        MOUSE_DOWN: 'mousedown',
        MOUSE_OVER: 'mouseover',
        MOUSE_MOVE: 'mousemove',
        MOUSE_OUT: 'mouseout',
        MOUSE_ENTER: 'mouseenter',
        MOUSE_LEAVE: 'mouseleave',
        MOUSE_WHEEL: 'wheel',
        POINTER_UP: 'pointerup',
        POINTER_DOWN: 'pointerdown',
        POINTER_MOVE: 'pointermove',
        POINTER_LEAVE: 'pointerleave',
        CONTEXT_MENU: 'contextmenu',
        WHEEL: 'wheel',
        // Keyboard
        KEY_DOWN: 'keydown',
        KEY_PRESS: 'keypress',
        KEY_UP: 'keyup',
        // HTML Document
        LOAD: 'load',
        BEFORE_UNLOAD: 'beforeunload',
        UNLOAD: 'unload',
        PAGE_SHOW: 'pageshow',
        PAGE_HIDE: 'pagehide',
        ABORT: 'abort',
        ERROR: 'error',
        RESIZE: 'resize',
        SCROLL: 'scroll',
        FULLSCREEN_CHANGE: 'fullscreenchange',
        WK_FULLSCREEN_CHANGE: 'webkitfullscreenchange',
        // Form
        SELECT: 'select',
        CHANGE: 'change',
        SUBMIT: 'submit',
        RESET: 'reset',
        FOCUS: 'focus',
        FOCUS_IN: 'focusin',
        FOCUS_OUT: 'focusout',
        BLUR: 'blur',
        INPUT: 'input',
        // Local Storage
        STORAGE: 'storage',
        // Drag
        DRAG_START: 'dragstart',
        DRAG: 'drag',
        DRAG_ENTER: 'dragenter',
        DRAG_LEAVE: 'dragleave',
        DRAG_OVER: 'dragover',
        DROP: 'drop',
        DRAG_END: 'dragend',
        // Animation
        ANIMATION_START: browser.isWebKit ? 'webkitAnimationStart' : 'animationstart',
        ANIMATION_END: browser.isWebKit ? 'webkitAnimationEnd' : 'animationend',
        ANIMATION_ITERATION: browser.isWebKit ? 'webkitAnimationIteration' : 'animationiteration'
    };
    function isEventLike(obj) {
        const candidate = obj;
        return !!(candidate && typeof candidate.preventDefault === 'function' && typeof candidate.stopPropagation === 'function');
    }
    exports.isEventLike = isEventLike;
    exports.EventHelper = {
        stop: (e, cancelBubble) => {
            e.preventDefault();
            if (cancelBubble) {
                e.stopPropagation();
            }
            return e;
        }
    };
    function saveParentsScrollTop(node) {
        const r = [];
        for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
            r[i] = node.scrollTop;
            node = node.parentNode;
        }
        return r;
    }
    exports.saveParentsScrollTop = saveParentsScrollTop;
    function restoreParentsScrollTop(node, state) {
        for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
            if (node.scrollTop !== state[i]) {
                node.scrollTop = state[i];
            }
            node = node.parentNode;
        }
    }
    exports.restoreParentsScrollTop = restoreParentsScrollTop;
    class FocusTracker extends lifecycle_1.Disposable {
        static hasFocusWithin(element) {
            if (isHTMLElement(element)) {
                const shadowRoot = getShadowRoot(element);
                const activeElement = (shadowRoot ? shadowRoot.activeElement : element.ownerDocument.activeElement);
                return isAncestor(activeElement, element);
            }
            else {
                return isAncestor(window.document.activeElement, window.document);
            }
        }
        constructor(element) {
            super();
            this._onDidFocus = this._register(new event.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            let hasFocus = FocusTracker.hasFocusWithin(element);
            let loosingFocus = false;
            const onFocus = () => {
                loosingFocus = false;
                if (!hasFocus) {
                    hasFocus = true;
                    this._onDidFocus.fire();
                }
            };
            const onBlur = () => {
                if (hasFocus) {
                    loosingFocus = true;
                    window.setTimeout(() => {
                        if (loosingFocus) {
                            loosingFocus = false;
                            hasFocus = false;
                            this._onDidBlur.fire();
                        }
                    }, 0);
                }
            };
            this._refreshStateHandler = () => {
                const currentNodeHasFocus = FocusTracker.hasFocusWithin(element);
                if (currentNodeHasFocus !== hasFocus) {
                    if (hasFocus) {
                        onBlur();
                    }
                    else {
                        onFocus();
                    }
                }
            };
            this._register(addDisposableListener(element, exports.EventType.FOCUS, onFocus, true));
            this._register(addDisposableListener(element, exports.EventType.BLUR, onBlur, true));
            if (element instanceof HTMLElement) {
                this._register(addDisposableListener(element, exports.EventType.FOCUS_IN, () => this._refreshStateHandler()));
                this._register(addDisposableListener(element, exports.EventType.FOCUS_OUT, () => this._refreshStateHandler()));
            }
        }
        refreshState() {
            this._refreshStateHandler();
        }
    }
    /**
     * Creates a new `IFocusTracker` instance that tracks focus changes on the given `element` and its descendants.
     *
     * @param element The `HTMLElement` or `Window` to track focus changes on.
     * @returns An `IFocusTracker` instance.
     */
    function trackFocus(element) {
        return new FocusTracker(element);
    }
    exports.trackFocus = trackFocus;
    function after(sibling, child) {
        sibling.after(child);
        return child;
    }
    exports.after = after;
    function append(parent, ...children) {
        parent.append(...children);
        if (children.length === 1 && typeof children[0] !== 'string') {
            return children[0];
        }
    }
    exports.append = append;
    function prepend(parent, child) {
        parent.insertBefore(child, parent.firstChild);
        return child;
    }
    exports.prepend = prepend;
    /**
     * Removes all children from `parent` and appends `children`
     */
    function reset(parent, ...children) {
        parent.innerText = '';
        append(parent, ...children);
    }
    exports.reset = reset;
    const SELECTOR_REGEX = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;
    var Namespace;
    (function (Namespace) {
        Namespace["HTML"] = "http://www.w3.org/1999/xhtml";
        Namespace["SVG"] = "http://www.w3.org/2000/svg";
    })(Namespace || (exports.Namespace = Namespace = {}));
    function _$(namespace, description, attrs, ...children) {
        const match = SELECTOR_REGEX.exec(description);
        if (!match) {
            throw new Error('Bad use of emmet');
        }
        const tagName = match[1] || 'div';
        let result;
        if (namespace !== Namespace.HTML) {
            result = document.createElementNS(namespace, tagName);
        }
        else {
            result = document.createElement(tagName);
        }
        if (match[3]) {
            result.id = match[3];
        }
        if (match[4]) {
            result.className = match[4].replace(/\./g, ' ').trim();
        }
        if (attrs) {
            Object.entries(attrs).forEach(([name, value]) => {
                if (typeof value === 'undefined') {
                    return;
                }
                if (/^on\w+$/.test(name)) {
                    result[name] = value;
                }
                else if (name === 'selected') {
                    if (value) {
                        result.setAttribute(name, 'true');
                    }
                }
                else {
                    result.setAttribute(name, value);
                }
            });
        }
        result.append(...children);
        return result;
    }
    function $(description, attrs, ...children) {
        return _$(Namespace.HTML, description, attrs, ...children);
    }
    exports.$ = $;
    $.SVG = function (description, attrs, ...children) {
        return _$(Namespace.SVG, description, attrs, ...children);
    };
    function join(nodes, separator) {
        const result = [];
        nodes.forEach((node, index) => {
            if (index > 0) {
                if (separator instanceof Node) {
                    result.push(separator.cloneNode());
                }
                else {
                    result.push(document.createTextNode(separator));
                }
            }
            result.push(node);
        });
        return result;
    }
    exports.join = join;
    function setVisibility(visible, ...elements) {
        if (visible) {
            show(...elements);
        }
        else {
            hide(...elements);
        }
    }
    exports.setVisibility = setVisibility;
    function show(...elements) {
        for (const element of elements) {
            element.style.display = '';
            element.removeAttribute('aria-hidden');
        }
    }
    exports.show = show;
    function hide(...elements) {
        for (const element of elements) {
            element.style.display = 'none';
            element.setAttribute('aria-hidden', 'true');
        }
    }
    exports.hide = hide;
    function findParentWithAttribute(node, attribute) {
        while (node && node.nodeType === node.ELEMENT_NODE) {
            if (node instanceof HTMLElement && node.hasAttribute(attribute)) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }
    function removeTabIndexAndUpdateFocus(node) {
        if (!node || !node.hasAttribute('tabIndex')) {
            return;
        }
        // If we are the currently focused element and tabIndex is removed,
        // standard DOM behavior is to move focus to the <body> element. We
        // typically never want that, rather put focus to the closest element
        // in the hierarchy of the parent DOM nodes.
        if (node.ownerDocument.activeElement === node) {
            const parentFocusable = findParentWithAttribute(node.parentElement, 'tabIndex');
            parentFocusable?.focus();
        }
        node.removeAttribute('tabindex');
    }
    exports.removeTabIndexAndUpdateFocus = removeTabIndexAndUpdateFocus;
    function finalHandler(fn) {
        return e => {
            e.preventDefault();
            e.stopPropagation();
            fn(e);
        };
    }
    exports.finalHandler = finalHandler;
    function domContentLoaded() {
        return new Promise(resolve => {
            const readyState = document.readyState;
            if (readyState === 'complete' || (document && document.body !== null)) {
                resolve(undefined);
            }
            else {
                window.addEventListener('DOMContentLoaded', resolve, false);
            }
        });
    }
    exports.domContentLoaded = domContentLoaded;
    /**
     * Find a value usable for a dom node size such that the likelihood that it would be
     * displayed with constant screen pixels size is as high as possible.
     *
     * e.g. We would desire for the cursors to be 2px (CSS px) wide. Under a devicePixelRatio
     * of 1.25, the cursor will be 2.5 screen pixels wide. Depending on how the dom node aligns/"snaps"
     * with the screen pixels, it will sometimes be rendered with 2 screen pixels, and sometimes with 3 screen pixels.
     */
    function computeScreenAwareSize(cssPx) {
        const screenPx = window.devicePixelRatio * cssPx;
        return Math.max(1, Math.floor(screenPx)) / window.devicePixelRatio;
    }
    exports.computeScreenAwareSize = computeScreenAwareSize;
    /**
     * Open safely a new window. This is the best way to do so, but you cannot tell
     * if the window was opened or if it was blocked by the browser's popup blocker.
     * If you want to tell if the browser blocked the new window, use {@link windowOpenWithSuccess}.
     *
     * See https://github.com/microsoft/monaco-editor/issues/601
     * To protect against malicious code in the linked site, particularly phishing attempts,
     * the window.opener should be set to null to prevent the linked site from having access
     * to change the location of the current page.
     * See https://mathiasbynens.github.io/rel-noopener/
     */
    function windowOpenNoOpener(url) {
        // By using 'noopener' in the `windowFeatures` argument, the newly created window will
        // not be able to use `window.opener` to reach back to the current page.
        // See https://stackoverflow.com/a/46958731
        // See https://developer.mozilla.org/en-US/docs/Web/API/Window/open#noopener
        // However, this also doesn't allow us to realize if the browser blocked
        // the creation of the window.
        window.open(url, '_blank', 'noopener');
    }
    exports.windowOpenNoOpener = windowOpenNoOpener;
    /**
     * Open a new window in a popup. This is the best way to do so, but you cannot tell
     * if the window was opened or if it was blocked by the browser's popup blocker.
     * If you want to tell if the browser blocked the new window, use {@link windowOpenWithSuccess}.
     *
     * Note: this does not set {@link window.opener} to null. This is to allow the opened popup to
     * be able to use {@link window.close} to close itself. Because of this, you should only use
     * this function on urls that you trust.
     *
     * In otherwords, you should almost always use {@link windowOpenNoOpener} instead of this function.
     */
    const popupWidth = 780, popupHeight = 640;
    function windowOpenPopup(url) {
        const left = Math.floor(window.screenLeft + window.innerWidth / 2 - popupWidth / 2);
        const top = Math.floor(window.screenTop + window.innerHeight / 2 - popupHeight / 2);
        window.open(url, '_blank', `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`);
    }
    exports.windowOpenPopup = windowOpenPopup;
    /**
     * Attempts to open a window and returns whether it succeeded. This technique is
     * not appropriate in certain contexts, like for example when the JS context is
     * executing inside a sandboxed iframe. If it is not necessary to know if the
     * browser blocked the new window, use {@link windowOpenNoOpener}.
     *
     * See https://github.com/microsoft/monaco-editor/issues/601
     * See https://github.com/microsoft/monaco-editor/issues/2474
     * See https://mathiasbynens.github.io/rel-noopener/
     *
     * @param url the url to open
     * @param noOpener whether or not to set the {@link window.opener} to null. You should leave the default
     * (true) unless you trust the url that is being opened.
     * @returns boolean indicating if the {@link window.open} call succeeded
     */
    function windowOpenWithSuccess(url, noOpener = true) {
        const newTab = window.open();
        if (newTab) {
            if (noOpener) {
                // see `windowOpenNoOpener` for details on why this is important
                newTab.opener = null;
            }
            newTab.location.href = url;
            return true;
        }
        return false;
    }
    exports.windowOpenWithSuccess = windowOpenWithSuccess;
    function animate(fn) {
        const step = () => {
            fn();
            stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(step);
        };
        let stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(step);
        return (0, lifecycle_1.toDisposable)(() => stepDisposable.dispose());
    }
    exports.animate = animate;
    network_1.RemoteAuthorities.setPreferredWebSchema(/^https:/.test(window.location.href) ? 'https' : 'http');
    /**
     * returns url('...')
     */
    function asCSSUrl(uri) {
        if (!uri) {
            return `url('')`;
        }
        return `url('${network_1.FileAccess.uriToBrowserUri(uri).toString(true).replace(/'/g, '%27')}')`;
    }
    exports.asCSSUrl = asCSSUrl;
    function asCSSPropertyValue(value) {
        return `'${value.replace(/'/g, '%27')}'`;
    }
    exports.asCSSPropertyValue = asCSSPropertyValue;
    function asCssValueWithDefault(cssPropertyValue, dflt) {
        if (cssPropertyValue !== undefined) {
            const variableMatch = cssPropertyValue.match(/^\s*var\((.+)\)$/);
            if (variableMatch) {
                const varArguments = variableMatch[1].split(',', 2);
                if (varArguments.length === 2) {
                    dflt = asCssValueWithDefault(varArguments[1].trim(), dflt);
                }
                return `var(${varArguments[0]}, ${dflt})`;
            }
            return cssPropertyValue;
        }
        return dflt;
    }
    exports.asCssValueWithDefault = asCssValueWithDefault;
    function triggerDownload(dataOrUri, name) {
        // If the data is provided as Buffer, we create a
        // blob URL out of it to produce a valid link
        let url;
        if (uri_1.URI.isUri(dataOrUri)) {
            url = dataOrUri.toString(true);
        }
        else {
            const blob = new Blob([dataOrUri]);
            url = URL.createObjectURL(blob);
            // Ensure to free the data from DOM eventually
            setTimeout(() => URL.revokeObjectURL(url));
        }
        // In order to download from the browser, the only way seems
        // to be creating a <a> element with download attribute that
        // points to the file to download.
        // See also https://developers.google.com/web/updates/2011/08/Downloading-resources-in-HTML5-a-download
        const anchor = document.createElement('a');
        document.body.appendChild(anchor);
        anchor.download = name;
        anchor.href = url;
        anchor.click();
        // Ensure to remove the element from DOM eventually
        setTimeout(() => document.body.removeChild(anchor));
    }
    exports.triggerDownload = triggerDownload;
    function triggerUpload() {
        return new Promise(resolve => {
            // In order to upload to the browser, create a
            // input element of type `file` and click it
            // to gather the selected files
            const input = document.createElement('input');
            document.body.appendChild(input);
            input.type = 'file';
            input.multiple = true;
            // Resolve once the input event has fired once
            event.Event.once(event.Event.fromDOMEventEmitter(input, 'input'))(() => {
                resolve(input.files ?? undefined);
            });
            input.click();
            // Ensure to remove the element from DOM eventually
            setTimeout(() => document.body.removeChild(input));
        });
    }
    exports.triggerUpload = triggerUpload;
    var DetectedFullscreenMode;
    (function (DetectedFullscreenMode) {
        /**
         * The document is fullscreen, e.g. because an element
         * in the document requested to be fullscreen.
         */
        DetectedFullscreenMode[DetectedFullscreenMode["DOCUMENT"] = 1] = "DOCUMENT";
        /**
         * The browser is fullscreen, e.g. because the user enabled
         * native window fullscreen for it.
         */
        DetectedFullscreenMode[DetectedFullscreenMode["BROWSER"] = 2] = "BROWSER";
    })(DetectedFullscreenMode || (exports.DetectedFullscreenMode = DetectedFullscreenMode = {}));
    function detectFullscreen() {
        // Browser fullscreen: use DOM APIs to detect
        if (document.fullscreenElement || document.webkitFullscreenElement || document.webkitIsFullScreen) {
            return { mode: DetectedFullscreenMode.DOCUMENT, guess: false };
        }
        // There is no standard way to figure out if the browser
        // is using native fullscreen. Via checking on screen
        // height and comparing that to window height, we can guess
        // it though.
        if (window.innerHeight === screen.height) {
            // if the height of the window matches the screen height, we can
            // safely assume that the browser is fullscreen because no browser
            // chrome is taking height away (e.g. like toolbars).
            return { mode: DetectedFullscreenMode.BROWSER, guess: false };
        }
        if (platform.isMacintosh || platform.isLinux) {
            // macOS and Linux do not properly report `innerHeight`, only Windows does
            if (window.outerHeight === screen.height && window.outerWidth === screen.width) {
                // if the height of the browser matches the screen height, we can
                // only guess that we are in fullscreen. It is also possible that
                // the user has turned off taskbars in the OS and the browser is
                // simply able to span the entire size of the screen.
                return { mode: DetectedFullscreenMode.BROWSER, guess: true };
            }
        }
        // Not in fullscreen
        return null;
    }
    exports.detectFullscreen = detectFullscreen;
    // -- sanitize and trusted html
    /**
     * Hooks dompurify using `afterSanitizeAttributes` to check that all `href` and `src`
     * attributes are valid.
     */
    function hookDomPurifyHrefAndSrcSanitizer(allowedProtocols, allowDataImages = false) {
        // https://github.com/cure53/DOMPurify/blob/main/demos/hooks-scheme-allowlist.html
        // build an anchor to map URLs to
        const anchor = document.createElement('a');
        dompurify.addHook('afterSanitizeAttributes', (node) => {
            // check all href/src attributes for validity
            for (const attr of ['href', 'src']) {
                if (node.hasAttribute(attr)) {
                    const attrValue = node.getAttribute(attr);
                    if (attr === 'href' && attrValue.startsWith('#')) {
                        // Allow fragment links
                        continue;
                    }
                    anchor.href = attrValue;
                    if (!allowedProtocols.includes(anchor.protocol.replace(/:$/, ''))) {
                        if (allowDataImages && attr === 'src' && anchor.href.startsWith('data:')) {
                            continue;
                        }
                        node.removeAttribute(attr);
                    }
                }
            }
        });
        return (0, lifecycle_1.toDisposable)(() => {
            dompurify.removeHook('afterSanitizeAttributes');
        });
    }
    exports.hookDomPurifyHrefAndSrcSanitizer = hookDomPurifyHrefAndSrcSanitizer;
    const defaultSafeProtocols = [
        network_1.Schemas.http,
        network_1.Schemas.https,
        network_1.Schemas.command,
    ];
    /**
     * List of safe, non-input html tags.
     */
    exports.basicMarkupHtmlTags = Object.freeze([
        'a',
        'abbr',
        'b',
        'bdo',
        'blockquote',
        'br',
        'caption',
        'cite',
        'code',
        'col',
        'colgroup',
        'dd',
        'del',
        'details',
        'dfn',
        'div',
        'dl',
        'dt',
        'em',
        'figcaption',
        'figure',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'hr',
        'i',
        'img',
        'ins',
        'kbd',
        'label',
        'li',
        'mark',
        'ol',
        'p',
        'pre',
        'q',
        'rp',
        'rt',
        'ruby',
        'samp',
        'small',
        'small',
        'source',
        'span',
        'strike',
        'strong',
        'sub',
        'summary',
        'sup',
        'table',
        'tbody',
        'td',
        'tfoot',
        'th',
        'thead',
        'time',
        'tr',
        'tt',
        'u',
        'ul',
        'var',
        'video',
        'wbr',
    ]);
    const defaultDomPurifyConfig = Object.freeze({
        ALLOWED_TAGS: ['a', 'button', 'blockquote', 'code', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'input', 'label', 'li', 'p', 'pre', 'select', 'small', 'span', 'strong', 'textarea', 'ul', 'ol'],
        ALLOWED_ATTR: ['href', 'data-href', 'data-command', 'target', 'title', 'name', 'src', 'alt', 'class', 'id', 'role', 'tabindex', 'style', 'data-code', 'width', 'height', 'align', 'x-dispatch', 'required', 'checked', 'placeholder', 'type', 'start'],
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: true
    });
    /**
     * Sanitizes the given `value` and reset the given `node` with it.
     */
    function safeInnerHtml(node, value) {
        const hook = hookDomPurifyHrefAndSrcSanitizer(defaultSafeProtocols);
        try {
            const html = dompurify.sanitize(value, defaultDomPurifyConfig);
            node.innerHTML = html;
        }
        finally {
            hook.dispose();
        }
    }
    exports.safeInnerHtml = safeInnerHtml;
    /**
     * Convert a Unicode string to a string in which each 16-bit unit occupies only one byte
     *
     * From https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
     */
    function toBinary(str) {
        const codeUnits = new Uint16Array(str.length);
        for (let i = 0; i < codeUnits.length; i++) {
            codeUnits[i] = str.charCodeAt(i);
        }
        let binary = '';
        const uint8array = new Uint8Array(codeUnits.buffer);
        for (let i = 0; i < uint8array.length; i++) {
            binary += String.fromCharCode(uint8array[i]);
        }
        return binary;
    }
    /**
     * Version of the global `btoa` function that handles multi-byte characters instead
     * of throwing an exception.
     */
    function multibyteAwareBtoa(str) {
        return btoa(toBinary(str));
    }
    exports.multibyteAwareBtoa = multibyteAwareBtoa;
    class ModifierKeyEmitter extends event.Emitter {
        constructor() {
            super();
            this._subscriptions = new lifecycle_1.DisposableStore();
            this._keyStatus = {
                altKey: false,
                shiftKey: false,
                ctrlKey: false,
                metaKey: false
            };
            this._subscriptions.add(addDisposableListener(window, 'keydown', e => {
                if (e.defaultPrevented) {
                    return;
                }
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                // If Alt-key keydown event is repeated, ignore it #112347
                // Only known to be necessary for Alt-Key at the moment #115810
                if (event.keyCode === 6 /* KeyCode.Alt */ && e.repeat) {
                    return;
                }
                if (e.altKey && !this._keyStatus.altKey) {
                    this._keyStatus.lastKeyPressed = 'alt';
                }
                else if (e.ctrlKey && !this._keyStatus.ctrlKey) {
                    this._keyStatus.lastKeyPressed = 'ctrl';
                }
                else if (e.metaKey && !this._keyStatus.metaKey) {
                    this._keyStatus.lastKeyPressed = 'meta';
                }
                else if (e.shiftKey && !this._keyStatus.shiftKey) {
                    this._keyStatus.lastKeyPressed = 'shift';
                }
                else if (event.keyCode !== 6 /* KeyCode.Alt */) {
                    this._keyStatus.lastKeyPressed = undefined;
                }
                else {
                    return;
                }
                this._keyStatus.altKey = e.altKey;
                this._keyStatus.ctrlKey = e.ctrlKey;
                this._keyStatus.metaKey = e.metaKey;
                this._keyStatus.shiftKey = e.shiftKey;
                if (this._keyStatus.lastKeyPressed) {
                    this._keyStatus.event = e;
                    this.fire(this._keyStatus);
                }
            }, true));
            this._subscriptions.add(addDisposableListener(window, 'keyup', e => {
                if (e.defaultPrevented) {
                    return;
                }
                if (!e.altKey && this._keyStatus.altKey) {
                    this._keyStatus.lastKeyReleased = 'alt';
                }
                else if (!e.ctrlKey && this._keyStatus.ctrlKey) {
                    this._keyStatus.lastKeyReleased = 'ctrl';
                }
                else if (!e.metaKey && this._keyStatus.metaKey) {
                    this._keyStatus.lastKeyReleased = 'meta';
                }
                else if (!e.shiftKey && this._keyStatus.shiftKey) {
                    this._keyStatus.lastKeyReleased = 'shift';
                }
                else {
                    this._keyStatus.lastKeyReleased = undefined;
                }
                if (this._keyStatus.lastKeyPressed !== this._keyStatus.lastKeyReleased) {
                    this._keyStatus.lastKeyPressed = undefined;
                }
                this._keyStatus.altKey = e.altKey;
                this._keyStatus.ctrlKey = e.ctrlKey;
                this._keyStatus.metaKey = e.metaKey;
                this._keyStatus.shiftKey = e.shiftKey;
                if (this._keyStatus.lastKeyReleased) {
                    this._keyStatus.event = e;
                    this.fire(this._keyStatus);
                }
            }, true));
            this._subscriptions.add(addDisposableListener(document.body, 'mousedown', () => {
                this._keyStatus.lastKeyPressed = undefined;
            }, true));
            this._subscriptions.add(addDisposableListener(document.body, 'mouseup', () => {
                this._keyStatus.lastKeyPressed = undefined;
            }, true));
            this._subscriptions.add(addDisposableListener(document.body, 'mousemove', e => {
                if (e.buttons) {
                    this._keyStatus.lastKeyPressed = undefined;
                }
            }, true));
            this._subscriptions.add(addDisposableListener(window, 'blur', () => {
                this.resetKeyStatus();
            }));
        }
        get keyStatus() {
            return this._keyStatus;
        }
        get isModifierPressed() {
            return this._keyStatus.altKey || this._keyStatus.ctrlKey || this._keyStatus.metaKey || this._keyStatus.shiftKey;
        }
        /**
         * Allows to explicitly reset the key status based on more knowledge (#109062)
         */
        resetKeyStatus() {
            this.doResetKeyStatus();
            this.fire(this._keyStatus);
        }
        doResetKeyStatus() {
            this._keyStatus = {
                altKey: false,
                shiftKey: false,
                ctrlKey: false,
                metaKey: false
            };
        }
        static getInstance() {
            if (!ModifierKeyEmitter.instance) {
                ModifierKeyEmitter.instance = new ModifierKeyEmitter();
            }
            return ModifierKeyEmitter.instance;
        }
        dispose() {
            super.dispose();
            this._subscriptions.dispose();
        }
    }
    exports.ModifierKeyEmitter = ModifierKeyEmitter;
    function getCookieValue(name) {
        const match = document.cookie.match('(^|[^;]+)\\s*' + name + '\\s*=\\s*([^;]+)'); // See https://stackoverflow.com/a/25490531
        return match ? match.pop() : undefined;
    }
    exports.getCookieValue = getCookieValue;
    class DragAndDropObserver extends lifecycle_1.Disposable {
        constructor(element, callbacks) {
            super();
            this.element = element;
            this.callbacks = callbacks;
            // A helper to fix issues with repeated DRAG_ENTER / DRAG_LEAVE
            // calls see https://github.com/microsoft/vscode/issues/14470
            // when the element has child elements where the events are fired
            // repeadedly.
            this.counter = 0;
            // Allows to measure the duration of the drag operation.
            this.dragStartTime = 0;
            this.registerListeners();
        }
        registerListeners() {
            this._register(addDisposableListener(this.element, exports.EventType.DRAG_ENTER, (e) => {
                this.counter++;
                this.dragStartTime = e.timeStamp;
                this.callbacks.onDragEnter(e);
            }));
            this._register(addDisposableListener(this.element, exports.EventType.DRAG_OVER, (e) => {
                e.preventDefault(); // needed so that the drop event fires (https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome)
                this.callbacks.onDragOver?.(e, e.timeStamp - this.dragStartTime);
            }));
            this._register(addDisposableListener(this.element, exports.EventType.DRAG_LEAVE, (e) => {
                this.counter--;
                if (this.counter === 0) {
                    this.dragStartTime = 0;
                    this.callbacks.onDragLeave(e);
                }
            }));
            this._register(addDisposableListener(this.element, exports.EventType.DRAG_END, (e) => {
                this.counter = 0;
                this.dragStartTime = 0;
                this.callbacks.onDragEnd(e);
            }));
            this._register(addDisposableListener(this.element, exports.EventType.DROP, (e) => {
                this.counter = 0;
                this.dragStartTime = 0;
                this.callbacks.onDrop(e);
            }));
        }
    }
    exports.DragAndDropObserver = DragAndDropObserver;
    const H_REGEX = /(?<tag>[\w\-]+)?(?:#(?<id>[\w\-]+))?(?<class>(?:\.(?:[\w\-]+))*)(?:@(?<name>(?:[\w\_])+))?/;
    function h(tag, ...args) {
        let attributes;
        let children;
        if (Array.isArray(args[0])) {
            attributes = {};
            children = args[0];
        }
        else {
            attributes = args[0] || {};
            children = args[1];
        }
        const match = H_REGEX.exec(tag);
        if (!match || !match.groups) {
            throw new Error('Bad use of h');
        }
        const tagName = match.groups['tag'] || 'div';
        const el = document.createElement(tagName);
        if (match.groups['id']) {
            el.id = match.groups['id'];
        }
        const classNames = [];
        if (match.groups['class']) {
            for (const className of match.groups['class'].split('.')) {
                if (className !== '') {
                    classNames.push(className);
                }
            }
        }
        if (attributes.className !== undefined) {
            for (const className of attributes.className.split('.')) {
                if (className !== '') {
                    classNames.push(className);
                }
            }
        }
        if (classNames.length > 0) {
            el.className = classNames.join(' ');
        }
        const result = {};
        if (match.groups['name']) {
            result[match.groups['name']] = el;
        }
        if (children) {
            for (const c of children) {
                if (c instanceof HTMLElement) {
                    el.appendChild(c);
                }
                else if (typeof c === 'string') {
                    el.append(c);
                }
                else if ('root' in c) {
                    Object.assign(result, c);
                    el.appendChild(c.root);
                }
            }
        }
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'className') {
                continue;
            }
            else if (key === 'style') {
                for (const [cssKey, cssValue] of Object.entries(value)) {
                    el.style.setProperty(camelCaseToHyphenCase(cssKey), typeof cssValue === 'number' ? cssValue + 'px' : '' + cssValue);
                }
            }
            else if (key === 'tabIndex') {
                el.tabIndex = value;
            }
            else {
                el.setAttribute(camelCaseToHyphenCase(key), value.toString());
            }
        }
        result['root'] = el;
        return result;
    }
    exports.h = h;
    function camelCaseToHyphenCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL2RvbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7O0lBZ0JuRixLQUFvRCxDQUFDO1FBQ2pFLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztRQUM3QixNQUFNLGlCQUFpQixHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBd0QsQ0FBQztRQUNwRyxPQUFPO1lBQ04saUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsS0FBSztZQUMxQyxjQUFjLENBQUMsTUFBYztnQkFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckIsTUFBTSxlQUFlLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7Z0JBQzlDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtvQkFDckMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7d0JBQ2pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUN6QjtnQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNKLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRCxPQUFPLGVBQWUsQ0FBQztZQUN4QixDQUFDO1lBQ0QsVUFBVTtnQkFDVCxPQUFPLE9BQU8sQ0FBQztZQUNoQixDQUFDO1NBQ0QsQ0FBQztJQUNILENBQUMsQ0FBQyxFQUFFLEVBckJXLHNCQUFjLHNCQUFFLGtCQUFVLGtCQUFFLHlCQUFpQix3QkFxQnZEO0lBRUwsU0FBZ0IsU0FBUyxDQUFDLElBQWlCO1FBQzFDLE9BQU8sSUFBSSxDQUFD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