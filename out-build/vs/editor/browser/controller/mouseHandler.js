/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/browser/controller/mouseTarget", "vs/editor/browser/editorDom", "vs/editor/common/config/editorZoom", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/common/viewEventHandler", "vs/base/browser/ui/scrollbar/scrollableElement"], function (require, exports, dom, mouseEvent_1, lifecycle_1, platform, mouseTarget_1, editorDom_1, editorZoom_1, position_1, selection_1, viewEventHandler_1, scrollableElement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6W = void 0;
    class $6W extends viewEventHandler_1.$9U {
        constructor(context, viewController, viewHelper) {
            super();
            this.r = null;
            this.a = context;
            this.b = viewController;
            this.c = viewHelper;
            this.g = new mouseTarget_1.$5W(this.a, viewHelper);
            this.j = this.B(new MouseDownOperation(this.a, this.b, this.c, this.g, (e, testEventTarget) => this.u(e, testEventTarget), (e) => this.w(e)));
            this.m = -1;
            this.n = this.a.configuration.options.get(143 /* EditorOption.layoutInfo */).height;
            const mouseEvents = new editorDom_1.$sW(this.c.viewDomNode);
            this.B(mouseEvents.onContextMenu(this.c.viewDomNode, (e) => this.z(e, true)));
            this.B(mouseEvents.onMouseMove(this.c.viewDomNode, (e) => {
                this.C(e);
                // See https://github.com/microsoft/vscode/issues/138789
                // When moving the mouse really quickly, the browser sometimes forgets to
                // send us a `mouseleave` or `mouseout` event. We therefore install here
                // a global `mousemove` listener to manually recover if the mouse goes outside
                // the editor. As soon as the mouse leaves outside of the editor, we
                // remove this listener
                if (!this.r) {
                    this.r = dom.$nO(this.c.viewDomNode.ownerDocument, 'mousemove', (e) => {
                        if (!this.c.viewDomNode.contains(e.target)) {
                            // went outside the editor!
                            this.D(new editorDom_1.$rW(e, false, this.c.viewDomNode));
                        }
                    });
                }
            }));
            this.B(mouseEvents.onMouseUp(this.c.viewDomNode, (e) => this.F(e)));
            this.B(mouseEvents.onMouseLeave(this.c.viewDomNode, (e) => this.D(e)));
            // `pointerdown` events can't be used to determine if there's a double click, or triple click
            // because their `e.detail` is always 0.
            // We will therefore save the pointer id for the mouse and then reuse it in the `mousedown` event
            // for `element.setPointerCapture`.
            let capturePointerId = 0;
            this.B(mouseEvents.onPointerDown(this.c.viewDomNode, (e, pointerId) => {
                capturePointerId = pointerId;
            }));
            // The `pointerup` listener registered by `GlobalEditorPointerMoveMonitor` does not get invoked 100% of the times.
            // I speculate that this is because the `pointerup` listener is only registered during the `mousedown` event, and perhaps
            // the `pointerup` event is already queued for dispatching, which makes it that the new listener doesn't get fired.
            // See https://github.com/microsoft/vscode/issues/146486 for repro steps.
            // To compensate for that, we simply register here a `pointerup` listener and just communicate it.
            this.B(dom.$nO(this.c.viewDomNode, dom.$3O.POINTER_UP, (e) => {
                this.j.onPointerUp();
            }));
            this.B(mouseEvents.onMouseDown(this.c.viewDomNode, (e) => this.G(e, capturePointerId)));
            this.s();
            this.a.addEventHandler(this);
        }
        s() {
            const classifier = scrollableElement_1.$QP.INSTANCE;
            let prevMouseWheelTime = 0;
            let gestureStartZoomLevel = editorZoom_1.EditorZoom.getZoomLevel();
            let gestureHasZoomModifiers = false;
            let gestureAccumulatedDelta = 0;
            const onMouseWheel = (browserEvent) => {
                this.b.emitMouseWheel(browserEvent);
                if (!this.a.configuration.options.get(75 /* EditorOption.mouseWheelZoom */)) {
                    return;
                }
                const e = new mouseEvent_1.$gO(browserEvent);
                classifier.acceptStandardWheelEvent(e);
                if (classifier.isPhysicalMouseWheel()) {
                    if (hasMouseWheelZoomModifiers(browserEvent)) {
                        const zoomLevel = editorZoom_1.EditorZoom.getZoomLevel();
                        const delta = e.deltaY > 0 ? 1 : -1;
                        editorZoom_1.EditorZoom.setZoomLevel(zoomLevel + delta);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
                else {
                    // we consider mousewheel events that occur within 50ms of each other to be part of the same gesture
                    // we don't want to consider mouse wheel events where ctrl/cmd is pressed during the inertia phase
                    // we also want to accumulate deltaY values from the same gesture and use that to set the zoom level
                    if (Date.now() - prevMouseWheelTime > 50) {
                        // reset if more than 50ms have passed
                        gestureStartZoomLevel = editorZoom_1.EditorZoom.getZoomLevel();
                        gestureHasZoomModifiers = hasMouseWheelZoomModifiers(browserEvent);
                        gestureAccumulatedDelta = 0;
                    }
                    prevMouseWheelTime = Date.now();
                    gestureAccumulatedDelta += e.deltaY;
                    if (gestureHasZoomModifiers) {
                        editorZoom_1.EditorZoom.setZoomLevel(gestureStartZoomLevel + gestureAccumulatedDelta / 5);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            };
            this.B(dom.$nO(this.c.viewDomNode, dom.$3O.MOUSE_WHEEL, onMouseWheel, { capture: true, passive: false }));
            function hasMouseWheelZoomModifiers(browserEvent) {
                return (platform.$j
                    // on macOS we support cmd + two fingers scroll (`metaKey` set)
                    // and also the two fingers pinch gesture (`ctrKey` set)
                    ? ((browserEvent.metaKey || browserEvent.ctrlKey) && !browserEvent.shiftKey && !browserEvent.altKey)
                    : (browserEvent.ctrlKey && !browserEvent.metaKey && !browserEvent.shiftKey && !browserEvent.altKey));
            }
        }
        dispose() {
            this.a.removeEventHandler(this);
            if (this.r) {
                this.r.dispose();
                this.r = null;
            }
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                // layout change
                const height = this.a.configuration.options.get(143 /* EditorOption.layoutInfo */).height;
                if (this.n !== height) {
                    this.n = height;
                    this.j.onHeightChanged();
                }
            }
            return false;
        }
        onCursorStateChanged(e) {
            this.j.onCursorStateChanged(e);
            return false;
        }
        onFocusChanged(e) {
            return false;
        }
        // --- end event handlers
        getTargetAtClientPoint(clientX, clientY) {
            const clientPos = new editorDom_1.$mW(clientX, clientY);
            const pos = clientPos.toPageCoordinates();
            const editorPos = (0, editorDom_1.$pW)(this.c.viewDomNode);
            if (pos.y < editorPos.y || pos.y > editorPos.y + editorPos.height || pos.x < editorPos.x || pos.x > editorPos.x + editorPos.width) {
                return null;
            }
            const relativePos = (0, editorDom_1.$qW)(this.c.viewDomNode, editorPos, pos);
            return this.g.createMouseTarget(this.c.getLastRenderData(), editorPos, pos, relativePos, null);
        }
        u(e, testEventTarget) {
            let target = e.target;
            if (!this.c.viewDomNode.contains(target)) {
                const shadowRoot = dom.$UO(this.c.viewDomNode);
                if (shadowRoot) {
                    target = shadowRoot.elementsFromPoint(e.posx, e.posy).find((el) => this.c.viewDomNode.contains(el));
                }
            }
            return this.g.createMouseTarget(this.c.getLastRenderData(), e.editorPos, e.pos, e.relativePos, testEventTarget ? target : null);
        }
        w(e) {
            return this.g.getMouseColumn(e.relativePos);
        }
        z(e, testEventTarget) {
            this.b.emitContextMenu({
                event: e,
                target: this.u(e, testEventTarget)
            });
        }
        C(e) {
            const targetIsWidget = this.g.mouseTargetIsWidget(e);
            if (!targetIsWidget) {
                e.preventDefault();
            }
            if (this.j.isActive()) {
                // In selection/drag operation
                return;
            }
            const actualMouseMoveTime = e.timestamp;
            if (actualMouseMoveTime < this.m) {
                // Due to throttling, this event occurred before the mouse left the editor, therefore ignore it.
                return;
            }
            this.b.emitMouseMove({
                event: e,
                target: this.u(e, true)
            });
        }
        D(e) {
            if (this.r) {
                this.r.dispose();
                this.r = null;
            }
            this.m = (new Date()).getTime();
            this.b.emitMouseLeave({
                event: e,
                target: null
            });
        }
        F(e) {
            this.b.emitMouseUp({
                event: e,
                target: this.u(e, true)
            });
        }
        G(e, pointerId) {
            const t = this.u(e, true);
            const targetIsContent = (t.type === 6 /* MouseTargetType.CONTENT_TEXT */ || t.type === 7 /* MouseTargetType.CONTENT_EMPTY */);
            const targetIsGutter = (t.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ || t.type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */ || t.type === 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */);
            const targetIsLineNumbers = (t.type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */);
            const selectOnLineNumbers = this.a.configuration.options.get(108 /* EditorOption.selectOnLineNumbers */);
            const targetIsViewZone = (t.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */ || t.type === 5 /* MouseTargetType.GUTTER_VIEW_ZONE */);
            const targetIsWidget = (t.type === 9 /* MouseTargetType.CONTENT_WIDGET */);
            let shouldHandle = e.leftButton || e.middleButton;
            if (platform.$j && e.leftButton && e.ctrlKey) {
                shouldHandle = false;
            }
            const focus = () => {
                e.preventDefault();
                this.c.focusTextArea();
            };
            if (shouldHandle && (targetIsContent || (targetIsLineNumbers && selectOnLineNumbers))) {
                focus();
                this.j.start(t.type, e, pointerId);
            }
            else if (targetIsGutter) {
                // Do not steal focus
                e.preventDefault();
            }
            else if (targetIsViewZone) {
                const viewZoneData = t.detail;
                if (shouldHandle && this.c.shouldSuppressMouseDownOnViewZone(viewZoneData.viewZoneId)) {
                    focus();
                    this.j.start(t.type, e, pointerId);
                    e.preventDefault();
                }
            }
            else if (targetIsWidget && this.c.shouldSuppressMouseDownOnWidget(t.detail)) {
                focus();
                e.preventDefault();
            }
            this.b.emitMouseDown({
                event: e,
                target: t
            });
        }
        H(e) {
            this.b.emitMouseWheel(e);
        }
    }
    exports.$6W = $6W;
    class MouseDownOperation extends lifecycle_1.$kc {
        constructor(n, r, s, u, createMouseTarget, getMouseColumn) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.u = u;
            this.a = createMouseTarget;
            this.b = getMouseColumn;
            this.c = this.B(new editorDom_1.$uW(this.s.viewDomNode));
            this.f = this.B(new TopBottomDragScrolling(this.n, this.s, this.u, (position, inSelectionMode, revealType) => this.G(position, inSelectionMode, revealType)));
            this.g = new MouseDownState();
            this.h = new selection_1.$ms(1, 1, 1, 1);
            this.j = false;
            this.m = null;
        }
        dispose() {
            super.dispose();
        }
        isActive() {
            return this.j;
        }
        w(e) {
            this.m = e;
            this.g.setModifiers(e);
            const position = this.D(e, false);
            if (!position) {
                // Ignoring because position is unknown
                return;
            }
            if (this.g.isDragAndDrop) {
                this.r.emitMouseDrag({
                    event: e,
                    target: position
                });
            }
            else {
                if (position.type === 13 /* MouseTargetType.OUTSIDE_EDITOR */ && (position.outsidePosition === 'above' || position.outsidePosition === 'below')) {
                    this.f.start(position, e);
                }
                else {
                    this.f.stop();
                    this.G(position, true, 1 /* NavigationCommandRevealType.Minimal */);
                }
            }
        }
        start(targetType, e, pointerId) {
            this.m = e;
            this.g.setStartedOnLineNumbers(targetType === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */);
            this.g.setStartButtons(e);
            this.g.setModifiers(e);
            const position = this.D(e, true);
            if (!position || !position.position) {
                // Ignoring because position is unknown
                return;
            }
            this.g.trySetCount(e.detail, position.position);
            // Overwrite the detail of the MouseEvent, as it will be sent out in an event and contributions might rely on it.
            e.detail = this.g.count;
            const options = this.n.configuration.options;
            if (!options.get(90 /* EditorOption.readOnly */)
                && options.get(35 /* EditorOption.dragAndDrop */)
                && !options.get(22 /* EditorOption.columnSelection */)
                && !this.g.altKey // we don't support multiple mouse
                && e.detail < 2 // only single click on a selection can work
                && !this.j // the mouse is not down yet
                && !this.h.isEmpty() // we don't drag single cursor
                && (position.type === 6 /* MouseTargetType.CONTENT_TEXT */) // single click on text
                && position.position && this.h.containsPosition(position.position) // single click on a selection
            ) {
                this.g.isDragAndDrop = true;
                this.j = true;
                this.c.startMonitoring(this.s.viewLinesDomNode, pointerId, e.buttons, (e) => this.w(e), (browserEvent) => {
                    const position = this.D(this.m, false);
                    if (browserEvent && browserEvent instanceof KeyboardEvent) {
                        // cancel
                        this.r.emitMouseDropCanceled();
                    }
                    else {
                        this.r.emitMouseDrop({
                            event: this.m,
                            target: (position ? this.a(this.m, true) : null) // Ignoring because position is unknown, e.g., Content View Zone
                        });
                    }
                    this.z();
                });
                return;
            }
            this.g.isDragAndDrop = false;
            this.G(position, e.shiftKey, 1 /* NavigationCommandRevealType.Minimal */);
            if (!this.j) {
                this.j = true;
                this.c.startMonitoring(this.s.viewLinesDomNode, pointerId, e.buttons, (e) => this.w(e), () => this.z());
            }
        }
        z() {
            this.j = false;
            this.f.stop();
        }
        onHeightChanged() {
            this.c.stopMonitoring();
        }
        onPointerUp() {
            this.c.stopMonitoring();
        }
        onCursorStateChanged(e) {
            this.h = e.selections[0];
        }
        C(e) {
            const editorContent = e.editorPos;
            const model = this.n.viewModel;
            const viewLayout = this.n.viewLayout;
            const mouseColumn = this.b(e);
            if (e.posy < editorContent.y) {
                const outsideDistance = editorContent.y - e.posy;
                const verticalOffset = Math.max(viewLayout.getCurrentScrollTop() - outsideDistance, 0);
                const viewZoneData = mouseTarget_1.$4W.getZoneAtCoord(this.n, verticalOffset);
                if (viewZoneData) {
                    const newPosition = this.F(viewZoneData);
                    if (newPosition) {
                        return mouseTarget_1.$3W.createOutsideEditor(mouseColumn, newPosition, 'above', outsideDistance);
                    }
                }
                const aboveLineNumber = viewLayout.getLineNumberAtVerticalOffset(verticalOffset);
                return mouseTarget_1.$3W.createOutsideEditor(mouseColumn, new position_1.$js(aboveLineNumber, 1), 'above', outsideDistance);
            }
            if (e.posy > editorContent.y + editorContent.height) {
                const outsideDistance = e.posy - editorContent.y - editorContent.height;
                const verticalOffset = viewLayout.getCurrentScrollTop() + e.relativePos.y;
                const viewZoneData = mouseTarget_1.$4W.getZoneAtCoord(this.n, verticalOffset);
                if (viewZoneData) {
                    const newPosition = this.F(viewZoneData);
                    if (newPosition) {
                        return mouseTarget_1.$3W.createOutsideEditor(mouseColumn, newPosition, 'below', outsideDistance);
                    }
                }
                const belowLineNumber = viewLayout.getLineNumberAtVerticalOffset(verticalOffset);
                return mouseTarget_1.$3W.createOutsideEditor(mouseColumn, new position_1.$js(belowLineNumber, model.getLineMaxColumn(belowLineNumber)), 'below', outsideDistance);
            }
            const possibleLineNumber = viewLayout.getLineNumberAtVerticalOffset(viewLayout.getCurrentScrollTop() + e.relativePos.y);
            if (e.posx < editorContent.x) {
                const outsideDistance = editorContent.x - e.posx;
                return mouseTarget_1.$3W.createOutsideEditor(mouseColumn, new position_1.$js(possibleLineNumber, 1), 'left', outsideDistance);
            }
            if (e.posx > editorContent.x + editorContent.width) {
                const outsideDistance = e.posx - editorContent.x - editorContent.width;
                return mouseTarget_1.$3W.createOutsideEditor(mouseColumn, new position_1.$js(possibleLineNumber, model.getLineMaxColumn(possibleLineNumber)), 'right', outsideDistance);
            }
            return null;
        }
        D(e, testEventTarget) {
            const positionOutsideEditor = this.C(e);
            if (positionOutsideEditor) {
                return positionOutsideEditor;
            }
            const t = this.a(e, testEventTarget);
            const hintedPosition = t.position;
            if (!hintedPosition) {
                return null;
            }
            if (t.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */ || t.type === 5 /* MouseTargetType.GUTTER_VIEW_ZONE */) {
                const newPosition = this.F(t.detail);
                if (newPosition) {
                    return mouseTarget_1.$3W.createViewZone(t.type, t.element, t.mouseColumn, newPosition, t.detail);
                }
            }
            return t;
        }
        F(viewZoneData) {
            // Force position on view zones to go above or below depending on where selection started from
            const selectionStart = new position_1.$js(this.h.selectionStartLineNumber, this.h.selectionStartColumn);
            const positionBefore = viewZoneData.positionBefore;
            const positionAfter = viewZoneData.positionAfter;
            if (positionBefore && positionAfter) {
                if (positionBefore.isBefore(selectionStart)) {
                    return positionBefore;
                }
                else {
                    return positionAfter;
                }
            }
            return null;
        }
        G(position, inSelectionMode, revealType) {
            if (!position.position) {
                return;
            }
            this.r.dispatchMouse({
                position: position.position,
                mouseColumn: position.mouseColumn,
                startedOnLineNumbers: this.g.startedOnLineNumbers,
                revealType,
                inSelectionMode: inSelectionMode,
                mouseDownCount: this.g.count,
                altKey: this.g.altKey,
                ctrlKey: this.g.ctrlKey,
                metaKey: this.g.metaKey,
                shiftKey: this.g.shiftKey,
                leftButton: this.g.leftButton,
                middleButton: this.g.middleButton,
                onInjectedText: position.type === 6 /* MouseTargetType.CONTENT_TEXT */ && position.detail.injectedText !== null
            });
        }
    }
    class TopBottomDragScrolling extends lifecycle_1.$kc {
        constructor(b, c, f, g) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = null;
        }
        dispose() {
            super.dispose();
            this.stop();
        }
        start(position, mouseEvent) {
            if (this.a) {
                this.a.setPosition(position, mouseEvent);
            }
            else {
                this.a = new TopBottomDragScrollingOperation(this.b, this.c, this.f, this.g, position, mouseEvent);
            }
        }
        stop() {
            if (this.a) {
                this.a.dispose();
                this.a = null;
            }
        }
    }
    class TopBottomDragScrollingOperation extends lifecycle_1.$kc {
        constructor(g, h, j, m, position, mouseEvent) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = position;
            this.b = mouseEvent;
            this.c = Date.now();
            this.f = dom.$vO(() => this.s());
        }
        dispose() {
            this.f.dispose();
        }
        setPosition(position, mouseEvent) {
            this.a = position;
            this.b = mouseEvent;
        }
        /**
         * update internal state and return elapsed ms since last time
         */
        n() {
            const now = Date.now();
            const elapsed = now - this.c;
            this.c = now;
            return elapsed;
        }
        /**
         * get the number of lines per second to auto-scroll
         */
        r() {
            const lineHeight = this.g.configuration.options.get(66 /* EditorOption.lineHeight */);
            const viewportInLines = this.g.configuration.options.get(143 /* EditorOption.layoutInfo */).height / lineHeight;
            const outsideDistanceInLines = this.a.outsideDistance / lineHeight;
            if (outsideDistanceInLines <= 1.5) {
                return Math.max(30, viewportInLines * (1 + outsideDistanceInLines));
            }
            if (outsideDistanceInLines <= 3) {
                return Math.max(60, viewportInLines * (2 + outsideDistanceInLines));
            }
            return Math.max(200, viewportInLines * (7 + outsideDistanceInLines));
        }
        s() {
            const lineHeight = this.g.configuration.options.get(66 /* EditorOption.lineHeight */);
            const scrollSpeedInLines = this.r();
            const elapsed = this.n();
            const scrollInPixels = scrollSpeedInLines * (elapsed / 1000) * lineHeight;
            const scrollValue = (this.a.outsidePosition === 'above' ? -scrollInPixels : scrollInPixels);
            this.g.viewModel.viewLayout.deltaScrollNow(0, scrollValue);
            this.h.renderNow();
            const viewportData = this.g.viewLayout.getLinesViewportData();
            const edgeLineNumber = (this.a.outsidePosition === 'above' ? viewportData.startLineNumber : viewportData.endLineNumber);
            // First, try to find a position that matches the horizontal position of the mouse
            let mouseTarget;
            {
                const editorPos = (0, editorDom_1.$pW)(this.h.viewDomNode);
                const horizontalScrollbarHeight = this.g.configuration.options.get(143 /* EditorOption.layoutInfo */).horizontalScrollbarHeight;
                const pos = new editorDom_1.$lW(this.b.pos.x, editorPos.y + editorPos.height - horizontalScrollbarHeight - 0.1);
                const relativePos = (0, editorDom_1.$qW)(this.h.viewDomNode, editorPos, pos);
                mouseTarget = this.j.createMouseTarget(this.h.getLastRenderData(), editorPos, pos, relativePos, null);
            }
            if (!mouseTarget.position || mouseTarget.position.lineNumber !== edgeLineNumber) {
                if (this.a.outsidePosition === 'above') {
                    mouseTarget = mouseTarget_1.$3W.createOutsideEditor(this.a.mouseColumn, new position_1.$js(edgeLineNumber, 1), 'above', this.a.outsideDistance);
                }
                else {
                    mouseTarget = mouseTarget_1.$3W.createOutsideEditor(this.a.mouseColumn, new position_1.$js(edgeLineNumber, this.g.viewModel.getLineMaxColumn(edgeLineNumber)), 'below', this.a.outsideDistance);
                }
            }
            this.m(mouseTarget, true, 2 /* NavigationCommandRevealType.None */);
            this.f = dom.$vO(() => this.s());
        }
    }
    class MouseDownState {
        static { this.a = 400; } // ms
        get altKey() { return this.b; }
        get ctrlKey() { return this.c; }
        get metaKey() { return this.d; }
        get shiftKey() { return this.f; }
        get leftButton() { return this.g; }
        get middleButton() { return this.h; }
        get startedOnLineNumbers() { return this.i; }
        constructor() {
            this.b = false;
            this.c = false;
            this.d = false;
            this.f = false;
            this.g = false;
            this.h = false;
            this.i = false;
            this.j = null;
            this.k = 0;
            this.l = 0;
            this.m = 0;
            this.isDragAndDrop = false;
        }
        get count() {
            return this.l;
        }
        setModifiers(source) {
            this.b = source.altKey;
            this.c = source.ctrlKey;
            this.d = source.metaKey;
            this.f = source.shiftKey;
        }
        setStartButtons(source) {
            this.g = source.leftButton;
            this.h = source.middleButton;
        }
        setStartedOnLineNumbers(startedOnLineNumbers) {
            this.i = startedOnLineNumbers;
        }
        trySetCount(setMouseDownCount, newMouseDownPosition) {
            // a. Invalidate multiple clicking if too much time has passed (will be hit by IE because the detail field of mouse events contains garbage in IE10)
            const currentTime = (new Date()).getTime();
            if (currentTime - this.m > MouseDownState.a) {
                setMouseDownCount = 1;
            }
            this.m = currentTime;
            // b. Ensure that we don't jump from single click to triple click in one go (will be hit by IE because the detail field of mouse events contains garbage in IE10)
            if (setMouseDownCount > this.l + 1) {
                setMouseDownCount = this.l + 1;
            }
            // c. Invalidate multiple clicking if the logical position is different
            if (this.j && this.j.equals(newMouseDownPosition)) {
                this.k++;
            }
            else {
                this.k = 1;
            }
            this.j = newMouseDownPosition;
            // Finally set the lastMouseDownCount
            this.l = Math.min(setMouseDownCount, this.k);
        }
    }
});
//# sourceMappingURL=mouseHandler.js.map