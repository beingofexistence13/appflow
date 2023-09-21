/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/canIUse", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/browser/dompurify/dompurify", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri"], function (require, exports, browser, canIUse_1, keyboardEvent_1, mouseEvent_1, async_1, errors_1, event, dompurify, lifecycle_1, network_1, platform, uri_1) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.h = exports.$zP = exports.$yP = exports.$xP = exports.$wP = exports.$vP = exports.$uP = exports.$tP = exports.$sP = exports.DetectedFullscreenMode = exports.$rP = exports.$qP = exports.$pP = exports.$oP = exports.$nP = exports.$mP = exports.$lP = exports.$kP = exports.$jP = exports.$iP = exports.$hP = exports.$gP = exports.$fP = exports.$eP = exports.$dP = exports.$cP = exports.$bP = exports.$ = exports.Namespace = exports.$_O = exports.$$O = exports.$0O = exports.$9O = exports.$8O = exports.$7O = exports.$6O = exports.$5O = exports.$4O = exports.$3O = exports.$2O = exports.$1O = exports.$ZO = exports.$YO = exports.$XO = exports.$WO = exports.$VO = exports.$UO = exports.$TO = exports.$SO = exports.$RO = exports.$QO = exports.$PO = exports.$OO = exports.$NO = exports.$MO = exports.$LO = exports.$KO = exports.$JO = exports.$IO = exports.$HO = exports.$GO = exports.$FO = exports.$EO = exports.$DO = exports.$CO = exports.$BO = exports.$AO = exports.$zO = exports.$yO = exports.$xO = exports.$wO = exports.$vO = exports.$uO = exports.$tO = exports.$sO = exports.$rO = exports.$qO = exports.$pO = exports.$oO = exports.$nO = exports.$mO = exports.$lO = exports.onDidCreateWindow = exports.getWindows = exports.registerWindow = void 0;
    _a = (function () {
        const windows = [];
        const onDidCreateWindow = new event.$fd();
        return {
            onDidCreateWindow: onDidCreateWindow.event,
            registerWindow(window) {
                windows.push(window);
                const disposableStore = new lifecycle_1.$jc();
                disposableStore.add((0, lifecycle_1.$ic)(() => {
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
    function $lO(node) {
        while (node.firstChild) {
            node.firstChild.remove();
        }
    }
    exports.$lO = $lO;
    /**
     * @deprecated Use node.isConnected directly
     */
    function $mO(node) {
        return node?.isConnected ?? false;
    }
    exports.$mO = $mO;
    class DomListener {
        constructor(node, type, handler, options) {
            this.f = node;
            this.g = type;
            this.d = handler;
            this.j = (options || false);
            this.f.addEventListener(this.g, this.d, this.j);
        }
        dispose() {
            if (!this.d) {
                // Already disposed
                return;
            }
            this.f.removeEventListener(this.g, this.d, this.j);
            // Prevent leakers from holding on to the dom or handler func
            this.f = null;
            this.d = null;
        }
    }
    function $nO(node, type, handler, useCaptureOrOptions) {
        return new DomListener(node, type, handler, useCaptureOrOptions);
    }
    exports.$nO = $nO;
    function _wrapAsStandardMouseEvent(handler) {
        return function (e) {
            return handler(new mouseEvent_1.$eO(e));
        };
    }
    function _wrapAsStandardKeyboardEvent(handler) {
        return function (e) {
            return handler(new keyboardEvent_1.$jO(e));
        };
    }
    const $oO = function addStandardDisposableListener(node, type, handler, useCapture) {
        let wrapHandler = handler;
        if (type === 'click' || type === 'mousedown') {
            wrapHandler = _wrapAsStandardMouseEvent(handler);
        }
        else if (type === 'keydown' || type === 'keypress' || type === 'keyup') {
            wrapHandler = _wrapAsStandardKeyboardEvent(handler);
        }
        return $nO(node, type, wrapHandler, useCapture);
    };
    exports.$oO = $oO;
    const $pO = function addStandardDisposableListener(node, handler, useCapture) {
        const wrapHandler = _wrapAsStandardMouseEvent(handler);
        return $rO(node, wrapHandler, useCapture);
    };
    exports.$pO = $pO;
    const $qO = function addStandardDisposableListener(node, handler, useCapture) {
        const wrapHandler = _wrapAsStandardMouseEvent(handler);
        return $tO(node, wrapHandler, useCapture);
    };
    exports.$qO = $qO;
    function $rO(node, handler, useCapture) {
        return $nO(node, platform.$q && canIUse_1.$bO.pointerEvents ? exports.$3O.POINTER_DOWN : exports.$3O.MOUSE_DOWN, handler, useCapture);
    }
    exports.$rO = $rO;
    function $sO(node, handler, useCapture) {
        return $nO(node, platform.$q && canIUse_1.$bO.pointerEvents ? exports.$3O.POINTER_MOVE : exports.$3O.MOUSE_MOVE, handler, useCapture);
    }
    exports.$sO = $sO;
    function $tO(node, handler, useCapture) {
        return $nO(node, platform.$q && canIUse_1.$bO.pointerEvents ? exports.$3O.POINTER_UP : exports.$3O.MOUSE_UP, handler, useCapture);
    }
    exports.$tO = $tO;
    class AnimationFrameQueueItem {
        constructor(runner, priority = 0) {
            this.d = runner;
            this.priority = priority;
            this.f = false;
        }
        dispose() {
            this.f = true;
        }
        execute() {
            if (this.f) {
                return;
            }
            try {
                this.d();
            }
            catch (e) {
                (0, errors_1.$Y)(e);
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
        exports.$vO = (runner, priority = 0) => {
            const item = new AnimationFrameQueueItem(runner, priority);
            NEXT_QUEUE.push(item);
            if (!animFrameRequested) {
                animFrameRequested = true;
                requestAnimationFrame(animationFrameRunner);
            }
            return item;
        };
        exports.$uO = (runner, priority) => {
            if (inAnimationFrameRunner) {
                const item = new AnimationFrameQueueItem(runner, priority);
                CURRENT_QUEUE.push(item);
                return item;
            }
            else {
                return (0, exports.$vO)(runner, priority);
            }
        };
    })();
    function $wO(callback) {
        return (0, exports.$vO)(callback, 10000 /* must be early */);
    }
    exports.$wO = $wO;
    function $xO(callback) {
        return (0, exports.$vO)(callback, -10000 /* must be late */);
    }
    exports.$xO = $xO;
    const MINIMUM_TIME_MS = 8;
    const DEFAULT_EVENT_MERGER = function (lastEvent, currentEvent) {
        return currentEvent;
    };
    class TimeoutThrottledDomListener extends lifecycle_1.$kc {
        constructor(node, type, handler, eventMerger = DEFAULT_EVENT_MERGER, minimumTimeMs = MINIMUM_TIME_MS) {
            super();
            let lastEvent = null;
            let lastHandlerTime = 0;
            const timeout = this.B(new async_1.$Qg());
            const invokeHandler = () => {
                lastHandlerTime = (new Date()).getTime();
                handler(lastEvent);
                lastEvent = null;
            };
            this.B($nO(node, type, (e) => {
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
    function $yO(node, type, handler, eventMerger, minimumTimeMs) {
        return new TimeoutThrottledDomListener(node, type, handler, eventMerger, minimumTimeMs);
    }
    exports.$yO = $yO;
    function $zO(el) {
        return el.ownerDocument.defaultView.getComputedStyle(el, null);
    }
    exports.$zO = $zO;
    function $AO(element) {
        const elDocument = element.ownerDocument;
        const elWindow = elDocument.defaultView?.window;
        // Try with DOM clientWidth / clientHeight
        if (element !== elDocument.body) {
            return new $BO(element.clientWidth, element.clientHeight);
        }
        // If visual view port exits and it's on mobile, it should be used instead of window innerWidth / innerHeight, or document.body.clientWidth / document.body.clientHeight
        if (platform.$q && elWindow?.visualViewport) {
            return new $BO(elWindow.visualViewport.width, elWindow.visualViewport.height);
        }
        // Try innerWidth / innerHeight
        if (elWindow?.innerWidth && elWindow.innerHeight) {
            return new $BO(elWindow.innerWidth, elWindow.innerHeight);
        }
        // Try with document.body.clientWidth / document.body.clientHeight
        if (elDocument.body && elDocument.body.clientWidth && elDocument.body.clientHeight) {
            return new $BO(elDocument.body.clientWidth, elDocument.body.clientHeight);
        }
        // Try with document.documentElement.clientWidth / document.documentElement.clientHeight
        if (elDocument.documentElement && elDocument.documentElement.clientWidth && elDocument.documentElement.clientHeight) {
            return new $BO(elDocument.documentElement.clientWidth, elDocument.documentElement.clientHeight);
        }
        throw new Error('Unable to figure out browser width and height');
    }
    exports.$AO = $AO;
    class SizeUtils {
        // Adapted from WinJS
        // Converts a CSS positioning string for the specified element to pixels.
        static d(element, value) {
            return parseFloat(value) || 0;
        }
        static f(element, cssPropertyName, jsPropertyName) {
            const computedStyle = $zO(element);
            const value = computedStyle ? computedStyle.getPropertyValue(cssPropertyName) : '0';
            return SizeUtils.d(element, value);
        }
        static getBorderLeftWidth(element) {
            return SizeUtils.f(element, 'border-left-width', 'borderLeftWidth');
        }
        static getBorderRightWidth(element) {
            return SizeUtils.f(element, 'border-right-width', 'borderRightWidth');
        }
        static getBorderTopWidth(element) {
            return SizeUtils.f(element, 'border-top-width', 'borderTopWidth');
        }
        static getBorderBottomWidth(element) {
            return SizeUtils.f(element, 'border-bottom-width', 'borderBottomWidth');
        }
        static getPaddingLeft(element) {
            return SizeUtils.f(element, 'padding-left', 'paddingLeft');
        }
        static getPaddingRight(element) {
            return SizeUtils.f(element, 'padding-right', 'paddingRight');
        }
        static getPaddingTop(element) {
            return SizeUtils.f(element, 'padding-top', 'paddingTop');
        }
        static getPaddingBottom(element) {
            return SizeUtils.f(element, 'padding-bottom', 'paddingBottom');
        }
        static getMarginLeft(element) {
            return SizeUtils.f(element, 'margin-left', 'marginLeft');
        }
        static getMarginTop(element) {
            return SizeUtils.f(element, 'margin-top', 'marginTop');
        }
        static getMarginRight(element) {
            return SizeUtils.f(element, 'margin-right', 'marginRight');
        }
        static getMarginBottom(element) {
            return SizeUtils.f(element, 'margin-bottom', 'marginBottom');
        }
    }
    class $BO {
        static { this.None = new $BO(0, 0); }
        constructor(width, height) {
            this.width = width;
            this.height = height;
        }
        with(width = this.width, height = this.height) {
            if (width !== this.width || height !== this.height) {
                return new $BO(width, height);
            }
            else {
                return this;
            }
        }
        static is(obj) {
            return typeof obj === 'object' && typeof obj.height === 'number' && typeof obj.width === 'number';
        }
        static lift(obj) {
            if (obj instanceof $BO) {
                return obj;
            }
            else {
                return new $BO(obj.width, obj.height);
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
    exports.$BO = $BO;
    function $CO(element) {
        // Adapted from WinJS.Utilities.getPosition
        // and added borders to the mix
        let offsetParent = element.offsetParent;
        let top = element.offsetTop;
        let left = element.offsetLeft;
        while ((element = element.parentNode) !== null
            && element !== element.ownerDocument.body
            && element !== element.ownerDocument.documentElement) {
            top -= element.scrollTop;
            const c = $SO(element) ? null : $zO(element);
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
    exports.$CO = $CO;
    function $DO(element, width, height) {
        if (typeof width === 'number') {
            element.style.width = `${width}px`;
        }
        if (typeof height === 'number') {
            element.style.height = `${height}px`;
        }
    }
    exports.$DO = $DO;
    function $EO(element, top, right, bottom, left, position = 'absolute') {
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
    exports.$EO = $EO;
    /**
     * Returns the position of a dom node relative to the entire page.
     */
    function $FO(domNode) {
        const bb = domNode.getBoundingClientRect();
        return {
            left: bb.left + (domNode.ownerDocument.defaultView?.scrollX ?? 0),
            top: bb.top + (domNode.ownerDocument.defaultView?.scrollY ?? 0),
            width: bb.width,
            height: bb.height
        };
    }
    exports.$FO = $FO;
    /**
     * Returns the effective zoom on a given element before window zoom level is applied
     */
    function $GO(domNode) {
        let testElement = domNode;
        let zoom = 1.0;
        do {
            const elementZoomLevel = $zO(testElement).zoom;
            if (elementZoomLevel !== null && elementZoomLevel !== undefined && elementZoomLevel !== '1') {
                zoom *= elementZoomLevel;
            }
            testElement = testElement.parentElement;
        } while (testElement !== null && testElement !== testElement.ownerDocument.documentElement);
        return zoom;
    }
    exports.$GO = $GO;
    // Adapted from WinJS
    // Gets the width of the element, including margins.
    function $HO(element) {
        const margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
        return element.offsetWidth + margin;
    }
    exports.$HO = $HO;
    function $IO(element) {
        const border = SizeUtils.getBorderLeftWidth(element) + SizeUtils.getBorderRightWidth(element);
        const padding = SizeUtils.getPaddingLeft(element) + SizeUtils.getPaddingRight(element);
        return element.offsetWidth - border - padding;
    }
    exports.$IO = $IO;
    function $JO(element) {
        const margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
        return element.scrollWidth + margin;
    }
    exports.$JO = $JO;
    // Adapted from WinJS
    // Gets the height of the content of the specified element. The content height does not include borders or padding.
    function $KO(element) {
        const border = SizeUtils.getBorderTopWidth(element) + SizeUtils.getBorderBottomWidth(element);
        const padding = SizeUtils.getPaddingTop(element) + SizeUtils.getPaddingBottom(element);
        return element.offsetHeight - border - padding;
    }
    exports.$KO = $KO;
    // Adapted from WinJS
    // Gets the height of the element, including its margins.
    function $LO(element) {
        const margin = SizeUtils.getMarginTop(element) + SizeUtils.getMarginBottom(element);
        return element.offsetHeight + margin;
    }
    exports.$LO = $LO;
    // Gets the left coordinate of the specified element relative to the specified parent.
    function getRelativeLeft(element, parent) {
        if (element === null) {
            return 0;
        }
        const elementPosition = $CO(element);
        const parentPosition = $CO(parent);
        return elementPosition.left - parentPosition.left;
    }
    function $MO(parent, children) {
        const childWidths = children.map((child) => {
            return Math.max($JO(child), $HO(child)) + getRelativeLeft(child, parent) || 0;
        });
        const maxWidth = Math.max(...childWidths);
        return maxWidth;
    }
    exports.$MO = $MO;
    // ----------------------------------------------------------------------------------------
    function $NO(testChild, testAncestor) {
        while (testChild) {
            if (testChild === testAncestor) {
                return true;
            }
            testChild = testChild.parentNode;
        }
        return false;
    }
    exports.$NO = $NO;
    const parentFlowToDataKey = 'parentFlowToElementId';
    /**
     * Set an explicit parent to use for nodes that are not part of the
     * regular dom structure.
     */
    function $OO(fromChildElement, toParentElement) {
        fromChildElement.dataset[parentFlowToDataKey] = toParentElement.id;
    }
    exports.$OO = $OO;
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
    function $PO(testChild, testAncestor) {
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
    exports.$PO = $PO;
    function $QO(node, clazz, stopAtClazzOrNode) {
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
    exports.$QO = $QO;
    function $RO(node, clazz, stopAtClazzOrNode) {
        return !!$QO(node, clazz, stopAtClazzOrNode);
    }
    exports.$RO = $RO;
    function $SO(node) {
        return (node && !!node.host && !!node.mode);
    }
    exports.$SO = $SO;
    function $TO(domNode) {
        return !!$UO(domNode);
    }
    exports.$TO = $TO;
    function $UO(domNode) {
        while (domNode.parentNode) {
            if (domNode === domNode.ownerDocument?.body) {
                // reached the body
                return null;
            }
            domNode = domNode.parentNode;
        }
        return $SO(domNode) ? domNode : null;
    }
    exports.$UO = $UO;
    /**
     * Returns the active element across all child windows.
     * Use this instead of `document.activeElement` to handle multiple windows.
     */
    function $VO() {
        let result = $WO().activeElement;
        while (result?.shadowRoot) {
            result = result.shadowRoot.activeElement;
        }
        return result;
    }
    exports.$VO = $VO;
    /**
     * Returns the active document across all child windows.
     * Use this instead of `document` when reacting to dom events to handle multiple windows.
     */
    function $WO() {
        const documents = [document, ...(0, exports.getWindows)().map(w => w.document)];
        return documents.find(doc => doc.hasFocus()) ?? document;
    }
    exports.$WO = $WO;
    function $XO(container = document.getElementsByTagName('head')[0], beforeAppend) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.media = 'screen';
        beforeAppend?.(style);
        container.appendChild(style);
        return style;
    }
    exports.$XO = $XO;
    function $YO(container = document.getElementsByTagName('head')[0]) {
        const meta = document.createElement('meta');
        container.appendChild(meta);
        return meta;
    }
    exports.$YO = $YO;
    let _sharedStyleSheet = null;
    function getSharedStyleSheet() {
        if (!_sharedStyleSheet) {
            _sharedStyleSheet = $XO();
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
    function $ZO(selector, cssText, style = getSharedStyleSheet()) {
        if (!style || !cssText) {
            return;
        }
        style.sheet.insertRule(selector + '{' + cssText + '}', 0);
    }
    exports.$ZO = $ZO;
    function $1O(ruleName, style = getSharedStyleSheet()) {
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
    exports.$1O = $1O;
    function $2O(o) {
        if (typeof HTMLElement === 'object') {
            return o instanceof HTMLElement;
        }
        return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
    }
    exports.$2O = $2O;
    exports.$3O = {
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
        ANIMATION_START: browser.$6N ? 'webkitAnimationStart' : 'animationstart',
        ANIMATION_END: browser.$6N ? 'webkitAnimationEnd' : 'animationend',
        ANIMATION_ITERATION: browser.$6N ? 'webkitAnimationIteration' : 'animationiteration'
    };
    function $4O(obj) {
        const candidate = obj;
        return !!(candidate && typeof candidate.preventDefault === 'function' && typeof candidate.stopPropagation === 'function');
    }
    exports.$4O = $4O;
    exports.$5O = {
        stop: (e, cancelBubble) => {
            e.preventDefault();
            if (cancelBubble) {
                e.stopPropagation();
            }
            return e;
        }
    };
    function $6O(node) {
        const r = [];
        for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
            r[i] = node.scrollTop;
            node = node.parentNode;
        }
        return r;
    }
    exports.$6O = $6O;
    function $7O(node, state) {
        for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
            if (node.scrollTop !== state[i]) {
                node.scrollTop = state[i];
            }
            node = node.parentNode;
        }
    }
    exports.$7O = $7O;
    class FocusTracker extends lifecycle_1.$kc {
        static m(element) {
            if ($2O(element)) {
                const shadowRoot = $UO(element);
                const activeElement = (shadowRoot ? shadowRoot.activeElement : element.ownerDocument.activeElement);
                return $NO(activeElement, element);
            }
            else {
                return $NO(window.document.activeElement, window.document);
            }
        }
        constructor(element) {
            super();
            this.f = this.B(new event.$fd());
            this.onDidFocus = this.f.event;
            this.g = this.B(new event.$fd());
            this.onDidBlur = this.g.event;
            let hasFocus = FocusTracker.m(element);
            let loosingFocus = false;
            const onFocus = () => {
                loosingFocus = false;
                if (!hasFocus) {
                    hasFocus = true;
                    this.f.fire();
                }
            };
            const onBlur = () => {
                if (hasFocus) {
                    loosingFocus = true;
                    window.setTimeout(() => {
                        if (loosingFocus) {
                            loosingFocus = false;
                            hasFocus = false;
                            this.g.fire();
                        }
                    }, 0);
                }
            };
            this.j = () => {
                const currentNodeHasFocus = FocusTracker.m(element);
                if (currentNodeHasFocus !== hasFocus) {
                    if (hasFocus) {
                        onBlur();
                    }
                    else {
                        onFocus();
                    }
                }
            };
            this.B($nO(element, exports.$3O.FOCUS, onFocus, true));
            this.B($nO(element, exports.$3O.BLUR, onBlur, true));
            if (element instanceof HTMLElement) {
                this.B($nO(element, exports.$3O.FOCUS_IN, () => this.j()));
                this.B($nO(element, exports.$3O.FOCUS_OUT, () => this.j()));
            }
        }
        refreshState() {
            this.j();
        }
    }
    /**
     * Creates a new `IFocusTracker` instance that tracks focus changes on the given `element` and its descendants.
     *
     * @param element The `HTMLElement` or `Window` to track focus changes on.
     * @returns An `IFocusTracker` instance.
     */
    function $8O(element) {
        return new FocusTracker(element);
    }
    exports.$8O = $8O;
    function $9O(sibling, child) {
        sibling.after(child);
        return child;
    }
    exports.$9O = $9O;
    function $0O(parent, ...children) {
        parent.append(...children);
        if (children.length === 1 && typeof children[0] !== 'string') {
            return children[0];
        }
    }
    exports.$0O = $0O;
    function $$O(parent, child) {
        parent.insertBefore(child, parent.firstChild);
        return child;
    }
    exports.$$O = $$O;
    /**
     * Removes all children from `parent` and appends `children`
     */
    function $_O(parent, ...children) {
        parent.innerText = '';
        $0O(parent, ...children);
    }
    exports.$_O = $_O;
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
    function $bP(nodes, separator) {
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
    exports.$bP = $bP;
    function $cP(visible, ...elements) {
        if (visible) {
            $dP(...elements);
        }
        else {
            $eP(...elements);
        }
    }
    exports.$cP = $cP;
    function $dP(...elements) {
        for (const element of elements) {
            element.style.display = '';
            element.removeAttribute('aria-hidden');
        }
    }
    exports.$dP = $dP;
    function $eP(...elements) {
        for (const element of elements) {
            element.style.display = 'none';
            element.setAttribute('aria-hidden', 'true');
        }
    }
    exports.$eP = $eP;
    function findParentWithAttribute(node, attribute) {
        while (node && node.nodeType === node.ELEMENT_NODE) {
            if (node instanceof HTMLElement && node.hasAttribute(attribute)) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }
    function $fP(node) {
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
    exports.$fP = $fP;
    function $gP(fn) {
        return e => {
            e.preventDefault();
            e.stopPropagation();
            fn(e);
        };
    }
    exports.$gP = $gP;
    function $hP() {
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
    exports.$hP = $hP;
    /**
     * Find a value usable for a dom node size such that the likelihood that it would be
     * displayed with constant screen pixels size is as high as possible.
     *
     * e.g. We would desire for the cursors to be 2px (CSS px) wide. Under a devicePixelRatio
     * of 1.25, the cursor will be 2.5 screen pixels wide. Depending on how the dom node aligns/"snaps"
     * with the screen pixels, it will sometimes be rendered with 2 screen pixels, and sometimes with 3 screen pixels.
     */
    function $iP(cssPx) {
        const screenPx = window.devicePixelRatio * cssPx;
        return Math.max(1, Math.floor(screenPx)) / window.devicePixelRatio;
    }
    exports.$iP = $iP;
    /**
     * Open safely a new window. This is the best way to do so, but you cannot tell
     * if the window was opened or if it was blocked by the browser's popup blocker.
     * If you want to tell if the browser blocked the new window, use {@link $lP}.
     *
     * See https://github.com/microsoft/monaco-editor/issues/601
     * To protect against malicious code in the linked site, particularly phishing attempts,
     * the window.opener should be set to null to prevent the linked site from having access
     * to change the location of the current page.
     * See https://mathiasbynens.github.io/rel-noopener/
     */
    function $jP(url) {
        // By using 'noopener' in the `windowFeatures` argument, the newly created window will
        // not be able to use `window.opener` to reach back to the current page.
        // See https://stackoverflow.com/a/46958731
        // See https://developer.mozilla.org/en-US/docs/Web/API/Window/open#noopener
        // However, this also doesn't allow us to realize if the browser blocked
        // the creation of the window.
        window.open(url, '_blank', 'noopener');
    }
    exports.$jP = $jP;
    /**
     * Open a new window in a popup. This is the best way to do so, but you cannot tell
     * if the window was opened or if it was blocked by the browser's popup blocker.
     * If you want to tell if the browser blocked the new window, use {@link $lP}.
     *
     * Note: this does not set {@link window.opener} to null. This is to allow the opened popup to
     * be able to use {@link window.close} to close itself. Because of this, you should only use
     * this function on urls that you trust.
     *
     * In otherwords, you should almost always use {@link $jP} instead of this function.
     */
    const popupWidth = 780, popupHeight = 640;
    function $kP(url) {
        const left = Math.floor(window.screenLeft + window.innerWidth / 2 - popupWidth / 2);
        const top = Math.floor(window.screenTop + window.innerHeight / 2 - popupHeight / 2);
        window.open(url, '_blank', `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`);
    }
    exports.$kP = $kP;
    /**
     * Attempts to open a window and returns whether it succeeded. This technique is
     * not appropriate in certain contexts, like for example when the JS context is
     * executing inside a sandboxed iframe. If it is not necessary to know if the
     * browser blocked the new window, use {@link $jP}.
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
    function $lP(url, noOpener = true) {
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
    exports.$lP = $lP;
    function $mP(fn) {
        const step = () => {
            fn();
            stepDisposable = (0, exports.$vO)(step);
        };
        let stepDisposable = (0, exports.$vO)(step);
        return (0, lifecycle_1.$ic)(() => stepDisposable.dispose());
    }
    exports.$mP = $mP;
    network_1.$Wf.setPreferredWebSchema(/^https:/.test(window.location.href) ? 'https' : 'http');
    /**
     * returns url('...')
     */
    function $nP(uri) {
        if (!uri) {
            return `url('')`;
        }
        return `url('${network_1.$2f.uriToBrowserUri(uri).toString(true).replace(/'/g, '%27')}')`;
    }
    exports.$nP = $nP;
    function $oP(value) {
        return `'${value.replace(/'/g, '%27')}'`;
    }
    exports.$oP = $oP;
    function $pP(cssPropertyValue, dflt) {
        if (cssPropertyValue !== undefined) {
            const variableMatch = cssPropertyValue.match(/^\s*var\((.+)\)$/);
            if (variableMatch) {
                const varArguments = variableMatch[1].split(',', 2);
                if (varArguments.length === 2) {
                    dflt = $pP(varArguments[1].trim(), dflt);
                }
                return `var(${varArguments[0]}, ${dflt})`;
            }
            return cssPropertyValue;
        }
        return dflt;
    }
    exports.$pP = $pP;
    function $qP(dataOrUri, name) {
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
    exports.$qP = $qP;
    function $rP() {
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
    exports.$rP = $rP;
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
    function $sP() {
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
        if (platform.$j || platform.$k) {
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
    exports.$sP = $sP;
    // -- sanitize and trusted html
    /**
     * Hooks dompurify using `afterSanitizeAttributes` to check that all `href` and `src`
     * attributes are valid.
     */
    function $tP(allowedProtocols, allowDataImages = false) {
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
        return (0, lifecycle_1.$ic)(() => {
            dompurify.removeHook('afterSanitizeAttributes');
        });
    }
    exports.$tP = $tP;
    const defaultSafeProtocols = [
        network_1.Schemas.http,
        network_1.Schemas.https,
        network_1.Schemas.command,
    ];
    /**
     * List of safe, non-input html tags.
     */
    exports.$uP = Object.freeze([
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
    function $vP(node, value) {
        const hook = $tP(defaultSafeProtocols);
        try {
            const html = dompurify.sanitize(value, defaultDomPurifyConfig);
            node.innerHTML = html;
        }
        finally {
            hook.dispose();
        }
    }
    exports.$vP = $vP;
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
    function $wP(str) {
        return btoa(toBinary(str));
    }
    exports.$wP = $wP;
    class $xP extends event.$fd {
        constructor() {
            super();
            this.s = new lifecycle_1.$jc();
            this.B = {
                altKey: false,
                shiftKey: false,
                ctrlKey: false,
                metaKey: false
            };
            this.s.add($nO(window, 'keydown', e => {
                if (e.defaultPrevented) {
                    return;
                }
                const event = new keyboardEvent_1.$jO(e);
                // If Alt-key keydown event is repeated, ignore it #112347
                // Only known to be necessary for Alt-Key at the moment #115810
                if (event.keyCode === 6 /* KeyCode.Alt */ && e.repeat) {
                    return;
                }
                if (e.altKey && !this.B.altKey) {
                    this.B.lastKeyPressed = 'alt';
                }
                else if (e.ctrlKey && !this.B.ctrlKey) {
                    this.B.lastKeyPressed = 'ctrl';
                }
                else if (e.metaKey && !this.B.metaKey) {
                    this.B.lastKeyPressed = 'meta';
                }
                else if (e.shiftKey && !this.B.shiftKey) {
                    this.B.lastKeyPressed = 'shift';
                }
                else if (event.keyCode !== 6 /* KeyCode.Alt */) {
                    this.B.lastKeyPressed = undefined;
                }
                else {
                    return;
                }
                this.B.altKey = e.altKey;
                this.B.ctrlKey = e.ctrlKey;
                this.B.metaKey = e.metaKey;
                this.B.shiftKey = e.shiftKey;
                if (this.B.lastKeyPressed) {
                    this.B.event = e;
                    this.fire(this.B);
                }
            }, true));
            this.s.add($nO(window, 'keyup', e => {
                if (e.defaultPrevented) {
                    return;
                }
                if (!e.altKey && this.B.altKey) {
                    this.B.lastKeyReleased = 'alt';
                }
                else if (!e.ctrlKey && this.B.ctrlKey) {
                    this.B.lastKeyReleased = 'ctrl';
                }
                else if (!e.metaKey && this.B.metaKey) {
                    this.B.lastKeyReleased = 'meta';
                }
                else if (!e.shiftKey && this.B.shiftKey) {
                    this.B.lastKeyReleased = 'shift';
                }
                else {
                    this.B.lastKeyReleased = undefined;
                }
                if (this.B.lastKeyPressed !== this.B.lastKeyReleased) {
                    this.B.lastKeyPressed = undefined;
                }
                this.B.altKey = e.altKey;
                this.B.ctrlKey = e.ctrlKey;
                this.B.metaKey = e.metaKey;
                this.B.shiftKey = e.shiftKey;
                if (this.B.lastKeyReleased) {
                    this.B.event = e;
                    this.fire(this.B);
                }
            }, true));
            this.s.add($nO(document.body, 'mousedown', () => {
                this.B.lastKeyPressed = undefined;
            }, true));
            this.s.add($nO(document.body, 'mouseup', () => {
                this.B.lastKeyPressed = undefined;
            }, true));
            this.s.add($nO(document.body, 'mousemove', e => {
                if (e.buttons) {
                    this.B.lastKeyPressed = undefined;
                }
            }, true));
            this.s.add($nO(window, 'blur', () => {
                this.resetKeyStatus();
            }));
        }
        get keyStatus() {
            return this.B;
        }
        get isModifierPressed() {
            return this.B.altKey || this.B.ctrlKey || this.B.metaKey || this.B.shiftKey;
        }
        /**
         * Allows to explicitly reset the key status based on more knowledge (#109062)
         */
        resetKeyStatus() {
            this.D();
            this.fire(this.B);
        }
        D() {
            this.B = {
                altKey: false,
                shiftKey: false,
                ctrlKey: false,
                metaKey: false
            };
        }
        static getInstance() {
            if (!$xP.C) {
                $xP.C = new $xP();
            }
            return $xP.C;
        }
        dispose() {
            super.dispose();
            this.s.dispose();
        }
    }
    exports.$xP = $xP;
    function $yP(name) {
        const match = document.cookie.match('(^|[^;]+)\\s*' + name + '\\s*=\\s*([^;]+)'); // See https://stackoverflow.com/a/25490531
        return match ? match.pop() : undefined;
    }
    exports.$yP = $yP;
    class $zP extends lifecycle_1.$kc {
        constructor(j, m) {
            super();
            this.j = j;
            this.m = m;
            // A helper to fix issues with repeated DRAG_ENTER / DRAG_LEAVE
            // calls see https://github.com/microsoft/vscode/issues/14470
            // when the element has child elements where the events are fired
            // repeadedly.
            this.f = 0;
            // Allows to measure the duration of the drag operation.
            this.g = 0;
            this.n();
        }
        n() {
            this.B($nO(this.j, exports.$3O.DRAG_ENTER, (e) => {
                this.f++;
                this.g = e.timeStamp;
                this.m.onDragEnter(e);
            }));
            this.B($nO(this.j, exports.$3O.DRAG_OVER, (e) => {
                e.preventDefault(); // needed so that the drop event fires (https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome)
                this.m.onDragOver?.(e, e.timeStamp - this.g);
            }));
            this.B($nO(this.j, exports.$3O.DRAG_LEAVE, (e) => {
                this.f--;
                if (this.f === 0) {
                    this.g = 0;
                    this.m.onDragLeave(e);
                }
            }));
            this.B($nO(this.j, exports.$3O.DRAG_END, (e) => {
                this.f = 0;
                this.g = 0;
                this.m.onDragEnd(e);
            }));
            this.B($nO(this.j, exports.$3O.DROP, (e) => {
                this.f = 0;
                this.g = 0;
                this.m.onDrop(e);
            }));
        }
    }
    exports.$zP = $zP;
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
//# sourceMappingURL=dom.js.map