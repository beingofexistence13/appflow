/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/browser/controller/mouseTarget", "vs/editor/browser/editorDom", "vs/editor/common/config/editorZoom", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/common/viewEventHandler", "vs/base/browser/ui/scrollbar/scrollableElement"], function (require, exports, dom, mouseEvent_1, lifecycle_1, platform, mouseTarget_1, editorDom_1, editorZoom_1, position_1, selection_1, viewEventHandler_1, scrollableElement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MouseHandler = void 0;
    class MouseHandler extends viewEventHandler_1.ViewEventHandler {
        constructor(context, viewController, viewHelper) {
            super();
            this._mouseLeaveMonitor = null;
            this._context = context;
            this.viewController = viewController;
            this.viewHelper = viewHelper;
            this.mouseTargetFactory = new mouseTarget_1.MouseTargetFactory(this._context, viewHelper);
            this._mouseDownOperation = this._register(new MouseDownOperation(this._context, this.viewController, this.viewHelper, this.mouseTargetFactory, (e, testEventTarget) => this._createMouseTarget(e, testEventTarget), (e) => this._getMouseColumn(e)));
            this.lastMouseLeaveTime = -1;
            this._height = this._context.configuration.options.get(143 /* EditorOption.layoutInfo */).height;
            const mouseEvents = new editorDom_1.EditorMouseEventFactory(this.viewHelper.viewDomNode);
            this._register(mouseEvents.onContextMenu(this.viewHelper.viewDomNode, (e) => this._onContextMenu(e, true)));
            this._register(mouseEvents.onMouseMove(this.viewHelper.viewDomNode, (e) => {
                this._onMouseMove(e);
                // See https://github.com/microsoft/vscode/issues/138789
                // When moving the mouse really quickly, the browser sometimes forgets to
                // send us a `mouseleave` or `mouseout` event. We therefore install here
                // a global `mousemove` listener to manually recover if the mouse goes outside
                // the editor. As soon as the mouse leaves outside of the editor, we
                // remove this listener
                if (!this._mouseLeaveMonitor) {
                    this._mouseLeaveMonitor = dom.addDisposableListener(this.viewHelper.viewDomNode.ownerDocument, 'mousemove', (e) => {
                        if (!this.viewHelper.viewDomNode.contains(e.target)) {
                            // went outside the editor!
                            this._onMouseLeave(new editorDom_1.EditorMouseEvent(e, false, this.viewHelper.viewDomNode));
                        }
                    });
                }
            }));
            this._register(mouseEvents.onMouseUp(this.viewHelper.viewDomNode, (e) => this._onMouseUp(e)));
            this._register(mouseEvents.onMouseLeave(this.viewHelper.viewDomNode, (e) => this._onMouseLeave(e)));
            // `pointerdown` events can't be used to determine if there's a double click, or triple click
            // because their `e.detail` is always 0.
            // We will therefore save the pointer id for the mouse and then reuse it in the `mousedown` event
            // for `element.setPointerCapture`.
            let capturePointerId = 0;
            this._register(mouseEvents.onPointerDown(this.viewHelper.viewDomNode, (e, pointerId) => {
                capturePointerId = pointerId;
            }));
            // The `pointerup` listener registered by `GlobalEditorPointerMoveMonitor` does not get invoked 100% of the times.
            // I speculate that this is because the `pointerup` listener is only registered during the `mousedown` event, and perhaps
            // the `pointerup` event is already queued for dispatching, which makes it that the new listener doesn't get fired.
            // See https://github.com/microsoft/vscode/issues/146486 for repro steps.
            // To compensate for that, we simply register here a `pointerup` listener and just communicate it.
            this._register(dom.addDisposableListener(this.viewHelper.viewDomNode, dom.EventType.POINTER_UP, (e) => {
                this._mouseDownOperation.onPointerUp();
            }));
            this._register(mouseEvents.onMouseDown(this.viewHelper.viewDomNode, (e) => this._onMouseDown(e, capturePointerId)));
            this._setupMouseWheelZoomListener();
            this._context.addEventHandler(this);
        }
        _setupMouseWheelZoomListener() {
            const classifier = scrollableElement_1.MouseWheelClassifier.INSTANCE;
            let prevMouseWheelTime = 0;
            let gestureStartZoomLevel = editorZoom_1.EditorZoom.getZoomLevel();
            let gestureHasZoomModifiers = false;
            let gestureAccumulatedDelta = 0;
            const onMouseWheel = (browserEvent) => {
                this.viewController.emitMouseWheel(browserEvent);
                if (!this._context.configuration.options.get(75 /* EditorOption.mouseWheelZoom */)) {
                    return;
                }
                const e = new mouseEvent_1.StandardWheelEvent(browserEvent);
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
            this._register(dom.addDisposableListener(this.viewHelper.viewDomNode, dom.EventType.MOUSE_WHEEL, onMouseWheel, { capture: true, passive: false }));
            function hasMouseWheelZoomModifiers(browserEvent) {
                return (platform.isMacintosh
                    // on macOS we support cmd + two fingers scroll (`metaKey` set)
                    // and also the two fingers pinch gesture (`ctrKey` set)
                    ? ((browserEvent.metaKey || browserEvent.ctrlKey) && !browserEvent.shiftKey && !browserEvent.altKey)
                    : (browserEvent.ctrlKey && !browserEvent.metaKey && !browserEvent.shiftKey && !browserEvent.altKey));
            }
        }
        dispose() {
            this._context.removeEventHandler(this);
            if (this._mouseLeaveMonitor) {
                this._mouseLeaveMonitor.dispose();
                this._mouseLeaveMonitor = null;
            }
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                // layout change
                const height = this._context.configuration.options.get(143 /* EditorOption.layoutInfo */).height;
                if (this._height !== height) {
                    this._height = height;
                    this._mouseDownOperation.onHeightChanged();
                }
            }
            return false;
        }
        onCursorStateChanged(e) {
            this._mouseDownOperation.onCursorStateChanged(e);
            return false;
        }
        onFocusChanged(e) {
            return false;
        }
        // --- end event handlers
        getTargetAtClientPoint(clientX, clientY) {
            const clientPos = new editorDom_1.ClientCoordinates(clientX, clientY);
            const pos = clientPos.toPageCoordinates();
            const editorPos = (0, editorDom_1.createEditorPagePosition)(this.viewHelper.viewDomNode);
            if (pos.y < editorPos.y || pos.y > editorPos.y + editorPos.height || pos.x < editorPos.x || pos.x > editorPos.x + editorPos.width) {
                return null;
            }
            const relativePos = (0, editorDom_1.createCoordinatesRelativeToEditor)(this.viewHelper.viewDomNode, editorPos, pos);
            return this.mouseTargetFactory.createMouseTarget(this.viewHelper.getLastRenderData(), editorPos, pos, relativePos, null);
        }
        _createMouseTarget(e, testEventTarget) {
            let target = e.target;
            if (!this.viewHelper.viewDomNode.contains(target)) {
                const shadowRoot = dom.getShadowRoot(this.viewHelper.viewDomNode);
                if (shadowRoot) {
                    target = shadowRoot.elementsFromPoint(e.posx, e.posy).find((el) => this.viewHelper.viewDomNode.contains(el));
                }
            }
            return this.mouseTargetFactory.createMouseTarget(this.viewHelper.getLastRenderData(), e.editorPos, e.pos, e.relativePos, testEventTarget ? target : null);
        }
        _getMouseColumn(e) {
            return this.mouseTargetFactory.getMouseColumn(e.relativePos);
        }
        _onContextMenu(e, testEventTarget) {
            this.viewController.emitContextMenu({
                event: e,
                target: this._createMouseTarget(e, testEventTarget)
            });
        }
        _onMouseMove(e) {
            const targetIsWidget = this.mouseTargetFactory.mouseTargetIsWidget(e);
            if (!targetIsWidget) {
                e.preventDefault();
            }
            if (this._mouseDownOperation.isActive()) {
                // In selection/drag operation
                return;
            }
            const actualMouseMoveTime = e.timestamp;
            if (actualMouseMoveTime < this.lastMouseLeaveTime) {
                // Due to throttling, this event occurred before the mouse left the editor, therefore ignore it.
                return;
            }
            this.viewController.emitMouseMove({
                event: e,
                target: this._createMouseTarget(e, true)
            });
        }
        _onMouseLeave(e) {
            if (this._mouseLeaveMonitor) {
                this._mouseLeaveMonitor.dispose();
                this._mouseLeaveMonitor = null;
            }
            this.lastMouseLeaveTime = (new Date()).getTime();
            this.viewController.emitMouseLeave({
                event: e,
                target: null
            });
        }
        _onMouseUp(e) {
            this.viewController.emitMouseUp({
                event: e,
                target: this._createMouseTarget(e, true)
            });
        }
        _onMouseDown(e, pointerId) {
            const t = this._createMouseTarget(e, true);
            const targetIsContent = (t.type === 6 /* MouseTargetType.CONTENT_TEXT */ || t.type === 7 /* MouseTargetType.CONTENT_EMPTY */);
            const targetIsGutter = (t.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ || t.type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */ || t.type === 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */);
            const targetIsLineNumbers = (t.type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */);
            const selectOnLineNumbers = this._context.configuration.options.get(108 /* EditorOption.selectOnLineNumbers */);
            const targetIsViewZone = (t.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */ || t.type === 5 /* MouseTargetType.GUTTER_VIEW_ZONE */);
            const targetIsWidget = (t.type === 9 /* MouseTargetType.CONTENT_WIDGET */);
            let shouldHandle = e.leftButton || e.middleButton;
            if (platform.isMacintosh && e.leftButton && e.ctrlKey) {
                shouldHandle = false;
            }
            const focus = () => {
                e.preventDefault();
                this.viewHelper.focusTextArea();
            };
            if (shouldHandle && (targetIsContent || (targetIsLineNumbers && selectOnLineNumbers))) {
                focus();
                this._mouseDownOperation.start(t.type, e, pointerId);
            }
            else if (targetIsGutter) {
                // Do not steal focus
                e.preventDefault();
            }
            else if (targetIsViewZone) {
                const viewZoneData = t.detail;
                if (shouldHandle && this.viewHelper.shouldSuppressMouseDownOnViewZone(viewZoneData.viewZoneId)) {
                    focus();
                    this._mouseDownOperation.start(t.type, e, pointerId);
                    e.preventDefault();
                }
            }
            else if (targetIsWidget && this.viewHelper.shouldSuppressMouseDownOnWidget(t.detail)) {
                focus();
                e.preventDefault();
            }
            this.viewController.emitMouseDown({
                event: e,
                target: t
            });
        }
        _onMouseWheel(e) {
            this.viewController.emitMouseWheel(e);
        }
    }
    exports.MouseHandler = MouseHandler;
    class MouseDownOperation extends lifecycle_1.Disposable {
        constructor(_context, _viewController, _viewHelper, _mouseTargetFactory, createMouseTarget, getMouseColumn) {
            super();
            this._context = _context;
            this._viewController = _viewController;
            this._viewHelper = _viewHelper;
            this._mouseTargetFactory = _mouseTargetFactory;
            this._createMouseTarget = createMouseTarget;
            this._getMouseColumn = getMouseColumn;
            this._mouseMoveMonitor = this._register(new editorDom_1.GlobalEditorPointerMoveMonitor(this._viewHelper.viewDomNode));
            this._topBottomDragScrolling = this._register(new TopBottomDragScrolling(this._context, this._viewHelper, this._mouseTargetFactory, (position, inSelectionMode, revealType) => this._dispatchMouse(position, inSelectionMode, revealType)));
            this._mouseState = new MouseDownState();
            this._currentSelection = new selection_1.Selection(1, 1, 1, 1);
            this._isActive = false;
            this._lastMouseEvent = null;
        }
        dispose() {
            super.dispose();
        }
        isActive() {
            return this._isActive;
        }
        _onMouseDownThenMove(e) {
            this._lastMouseEvent = e;
            this._mouseState.setModifiers(e);
            const position = this._findMousePosition(e, false);
            if (!position) {
                // Ignoring because position is unknown
                return;
            }
            if (this._mouseState.isDragAndDrop) {
                this._viewController.emitMouseDrag({
                    event: e,
                    target: position
                });
            }
            else {
                if (position.type === 13 /* MouseTargetType.OUTSIDE_EDITOR */ && (position.outsidePosition === 'above' || position.outsidePosition === 'below')) {
                    this._topBottomDragScrolling.start(position, e);
                }
                else {
                    this._topBottomDragScrolling.stop();
                    this._dispatchMouse(position, true, 1 /* NavigationCommandRevealType.Minimal */);
                }
            }
        }
        start(targetType, e, pointerId) {
            this._lastMouseEvent = e;
            this._mouseState.setStartedOnLineNumbers(targetType === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */);
            this._mouseState.setStartButtons(e);
            this._mouseState.setModifiers(e);
            const position = this._findMousePosition(e, true);
            if (!position || !position.position) {
                // Ignoring because position is unknown
                return;
            }
            this._mouseState.trySetCount(e.detail, position.position);
            // Overwrite the detail of the MouseEvent, as it will be sent out in an event and contributions might rely on it.
            e.detail = this._mouseState.count;
            const options = this._context.configuration.options;
            if (!options.get(90 /* EditorOption.readOnly */)
                && options.get(35 /* EditorOption.dragAndDrop */)
                && !options.get(22 /* EditorOption.columnSelection */)
                && !this._mouseState.altKey // we don't support multiple mouse
                && e.detail < 2 // only single click on a selection can work
                && !this._isActive // the mouse is not down yet
                && !this._currentSelection.isEmpty() // we don't drag single cursor
                && (position.type === 6 /* MouseTargetType.CONTENT_TEXT */) // single click on text
                && position.position && this._currentSelection.containsPosition(position.position) // single click on a selection
            ) {
                this._mouseState.isDragAndDrop = true;
                this._isActive = true;
                this._mouseMoveMonitor.startMonitoring(this._viewHelper.viewLinesDomNode, pointerId, e.buttons, (e) => this._onMouseDownThenMove(e), (browserEvent) => {
                    const position = this._findMousePosition(this._lastMouseEvent, false);
                    if (browserEvent && browserEvent instanceof KeyboardEvent) {
                        // cancel
                        this._viewController.emitMouseDropCanceled();
                    }
                    else {
                        this._viewController.emitMouseDrop({
                            event: this._lastMouseEvent,
                            target: (position ? this._createMouseTarget(this._lastMouseEvent, true) : null) // Ignoring because position is unknown, e.g., Content View Zone
                        });
                    }
                    this._stop();
                });
                return;
            }
            this._mouseState.isDragAndDrop = false;
            this._dispatchMouse(position, e.shiftKey, 1 /* NavigationCommandRevealType.Minimal */);
            if (!this._isActive) {
                this._isActive = true;
                this._mouseMoveMonitor.startMonitoring(this._viewHelper.viewLinesDomNode, pointerId, e.buttons, (e) => this._onMouseDownThenMove(e), () => this._stop());
            }
        }
        _stop() {
            this._isActive = false;
            this._topBottomDragScrolling.stop();
        }
        onHeightChanged() {
            this._mouseMoveMonitor.stopMonitoring();
        }
        onPointerUp() {
            this._mouseMoveMonitor.stopMonitoring();
        }
        onCursorStateChanged(e) {
            this._currentSelection = e.selections[0];
        }
        _getPositionOutsideEditor(e) {
            const editorContent = e.editorPos;
            const model = this._context.viewModel;
            const viewLayout = this._context.viewLayout;
            const mouseColumn = this._getMouseColumn(e);
            if (e.posy < editorContent.y) {
                const outsideDistance = editorContent.y - e.posy;
                const verticalOffset = Math.max(viewLayout.getCurrentScrollTop() - outsideDistance, 0);
                const viewZoneData = mouseTarget_1.HitTestContext.getZoneAtCoord(this._context, verticalOffset);
                if (viewZoneData) {
                    const newPosition = this._helpPositionJumpOverViewZone(viewZoneData);
                    if (newPosition) {
                        return mouseTarget_1.MouseTarget.createOutsideEditor(mouseColumn, newPosition, 'above', outsideDistance);
                    }
                }
                const aboveLineNumber = viewLayout.getLineNumberAtVerticalOffset(verticalOffset);
                return mouseTarget_1.MouseTarget.createOutsideEditor(mouseColumn, new position_1.Position(aboveLineNumber, 1), 'above', outsideDistance);
            }
            if (e.posy > editorContent.y + editorContent.height) {
                const outsideDistance = e.posy - editorContent.y - editorContent.height;
                const verticalOffset = viewLayout.getCurrentScrollTop() + e.relativePos.y;
                const viewZoneData = mouseTarget_1.HitTestContext.getZoneAtCoord(this._context, verticalOffset);
                if (viewZoneData) {
                    const newPosition = this._helpPositionJumpOverViewZone(viewZoneData);
                    if (newPosition) {
                        return mouseTarget_1.MouseTarget.createOutsideEditor(mouseColumn, newPosition, 'below', outsideDistance);
                    }
                }
                const belowLineNumber = viewLayout.getLineNumberAtVerticalOffset(verticalOffset);
                return mouseTarget_1.MouseTarget.createOutsideEditor(mouseColumn, new position_1.Position(belowLineNumber, model.getLineMaxColumn(belowLineNumber)), 'below', outsideDistance);
            }
            const possibleLineNumber = viewLayout.getLineNumberAtVerticalOffset(viewLayout.getCurrentScrollTop() + e.relativePos.y);
            if (e.posx < editorContent.x) {
                const outsideDistance = editorContent.x - e.posx;
                return mouseTarget_1.MouseTarget.createOutsideEditor(mouseColumn, new position_1.Position(possibleLineNumber, 1), 'left', outsideDistance);
            }
            if (e.posx > editorContent.x + editorContent.width) {
                const outsideDistance = e.posx - editorContent.x - editorContent.width;
                return mouseTarget_1.MouseTarget.createOutsideEditor(mouseColumn, new position_1.Position(possibleLineNumber, model.getLineMaxColumn(possibleLineNumber)), 'right', outsideDistance);
            }
            return null;
        }
        _findMousePosition(e, testEventTarget) {
            const positionOutsideEditor = this._getPositionOutsideEditor(e);
            if (positionOutsideEditor) {
                return positionOutsideEditor;
            }
            const t = this._createMouseTarget(e, testEventTarget);
            const hintedPosition = t.position;
            if (!hintedPosition) {
                return null;
            }
            if (t.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */ || t.type === 5 /* MouseTargetType.GUTTER_VIEW_ZONE */) {
                const newPosition = this._helpPositionJumpOverViewZone(t.detail);
                if (newPosition) {
                    return mouseTarget_1.MouseTarget.createViewZone(t.type, t.element, t.mouseColumn, newPosition, t.detail);
                }
            }
            return t;
        }
        _helpPositionJumpOverViewZone(viewZoneData) {
            // Force position on view zones to go above or below depending on where selection started from
            const selectionStart = new position_1.Position(this._currentSelection.selectionStartLineNumber, this._currentSelection.selectionStartColumn);
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
        _dispatchMouse(position, inSelectionMode, revealType) {
            if (!position.position) {
                return;
            }
            this._viewController.dispatchMouse({
                position: position.position,
                mouseColumn: position.mouseColumn,
                startedOnLineNumbers: this._mouseState.startedOnLineNumbers,
                revealType,
                inSelectionMode: inSelectionMode,
                mouseDownCount: this._mouseState.count,
                altKey: this._mouseState.altKey,
                ctrlKey: this._mouseState.ctrlKey,
                metaKey: this._mouseState.metaKey,
                shiftKey: this._mouseState.shiftKey,
                leftButton: this._mouseState.leftButton,
                middleButton: this._mouseState.middleButton,
                onInjectedText: position.type === 6 /* MouseTargetType.CONTENT_TEXT */ && position.detail.injectedText !== null
            });
        }
    }
    class TopBottomDragScrolling extends lifecycle_1.Disposable {
        constructor(_context, _viewHelper, _mouseTargetFactory, _dispatchMouse) {
            super();
            this._context = _context;
            this._viewHelper = _viewHelper;
            this._mouseTargetFactory = _mouseTargetFactory;
            this._dispatchMouse = _dispatchMouse;
            this._operation = null;
        }
        dispose() {
            super.dispose();
            this.stop();
        }
        start(position, mouseEvent) {
            if (this._operation) {
                this._operation.setPosition(position, mouseEvent);
            }
            else {
                this._operation = new TopBottomDragScrollingOperation(this._context, this._viewHelper, this._mouseTargetFactory, this._dispatchMouse, position, mouseEvent);
            }
        }
        stop() {
            if (this._operation) {
                this._operation.dispose();
                this._operation = null;
            }
        }
    }
    class TopBottomDragScrollingOperation extends lifecycle_1.Disposable {
        constructor(_context, _viewHelper, _mouseTargetFactory, _dispatchMouse, position, mouseEvent) {
            super();
            this._context = _context;
            this._viewHelper = _viewHelper;
            this._mouseTargetFactory = _mouseTargetFactory;
            this._dispatchMouse = _dispatchMouse;
            this._position = position;
            this._mouseEvent = mouseEvent;
            this._lastTime = Date.now();
            this._animationFrameDisposable = dom.scheduleAtNextAnimationFrame(() => this._execute());
        }
        dispose() {
            this._animationFrameDisposable.dispose();
        }
        setPosition(position, mouseEvent) {
            this._position = position;
            this._mouseEvent = mouseEvent;
        }
        /**
         * update internal state and return elapsed ms since last time
         */
        _tick() {
            const now = Date.now();
            const elapsed = now - this._lastTime;
            this._lastTime = now;
            return elapsed;
        }
        /**
         * get the number of lines per second to auto-scroll
         */
        _getScrollSpeed() {
            const lineHeight = this._context.configuration.options.get(66 /* EditorOption.lineHeight */);
            const viewportInLines = this._context.configuration.options.get(143 /* EditorOption.layoutInfo */).height / lineHeight;
            const outsideDistanceInLines = this._position.outsideDistance / lineHeight;
            if (outsideDistanceInLines <= 1.5) {
                return Math.max(30, viewportInLines * (1 + outsideDistanceInLines));
            }
            if (outsideDistanceInLines <= 3) {
                return Math.max(60, viewportInLines * (2 + outsideDistanceInLines));
            }
            return Math.max(200, viewportInLines * (7 + outsideDistanceInLines));
        }
        _execute() {
            const lineHeight = this._context.configuration.options.get(66 /* EditorOption.lineHeight */);
            const scrollSpeedInLines = this._getScrollSpeed();
            const elapsed = this._tick();
            const scrollInPixels = scrollSpeedInLines * (elapsed / 1000) * lineHeight;
            const scrollValue = (this._position.outsidePosition === 'above' ? -scrollInPixels : scrollInPixels);
            this._context.viewModel.viewLayout.deltaScrollNow(0, scrollValue);
            this._viewHelper.renderNow();
            const viewportData = this._context.viewLayout.getLinesViewportData();
            const edgeLineNumber = (this._position.outsidePosition === 'above' ? viewportData.startLineNumber : viewportData.endLineNumber);
            // First, try to find a position that matches the horizontal position of the mouse
            let mouseTarget;
            {
                const editorPos = (0, editorDom_1.createEditorPagePosition)(this._viewHelper.viewDomNode);
                const horizontalScrollbarHeight = this._context.configuration.options.get(143 /* EditorOption.layoutInfo */).horizontalScrollbarHeight;
                const pos = new editorDom_1.PageCoordinates(this._mouseEvent.pos.x, editorPos.y + editorPos.height - horizontalScrollbarHeight - 0.1);
                const relativePos = (0, editorDom_1.createCoordinatesRelativeToEditor)(this._viewHelper.viewDomNode, editorPos, pos);
                mouseTarget = this._mouseTargetFactory.createMouseTarget(this._viewHelper.getLastRenderData(), editorPos, pos, relativePos, null);
            }
            if (!mouseTarget.position || mouseTarget.position.lineNumber !== edgeLineNumber) {
                if (this._position.outsidePosition === 'above') {
                    mouseTarget = mouseTarget_1.MouseTarget.createOutsideEditor(this._position.mouseColumn, new position_1.Position(edgeLineNumber, 1), 'above', this._position.outsideDistance);
                }
                else {
                    mouseTarget = mouseTarget_1.MouseTarget.createOutsideEditor(this._position.mouseColumn, new position_1.Position(edgeLineNumber, this._context.viewModel.getLineMaxColumn(edgeLineNumber)), 'below', this._position.outsideDistance);
                }
            }
            this._dispatchMouse(mouseTarget, true, 2 /* NavigationCommandRevealType.None */);
            this._animationFrameDisposable = dom.scheduleAtNextAnimationFrame(() => this._execute());
        }
    }
    class MouseDownState {
        static { this.CLEAR_MOUSE_DOWN_COUNT_TIME = 400; } // ms
        get altKey() { return this._altKey; }
        get ctrlKey() { return this._ctrlKey; }
        get metaKey() { return this._metaKey; }
        get shiftKey() { return this._shiftKey; }
        get leftButton() { return this._leftButton; }
        get middleButton() { return this._middleButton; }
        get startedOnLineNumbers() { return this._startedOnLineNumbers; }
        constructor() {
            this._altKey = false;
            this._ctrlKey = false;
            this._metaKey = false;
            this._shiftKey = false;
            this._leftButton = false;
            this._middleButton = false;
            this._startedOnLineNumbers = false;
            this._lastMouseDownPosition = null;
            this._lastMouseDownPositionEqualCount = 0;
            this._lastMouseDownCount = 0;
            this._lastSetMouseDownCountTime = 0;
            this.isDragAndDrop = false;
        }
        get count() {
            return this._lastMouseDownCount;
        }
        setModifiers(source) {
            this._altKey = source.altKey;
            this._ctrlKey = source.ctrlKey;
            this._metaKey = source.metaKey;
            this._shiftKey = source.shiftKey;
        }
        setStartButtons(source) {
            this._leftButton = source.leftButton;
            this._middleButton = source.middleButton;
        }
        setStartedOnLineNumbers(startedOnLineNumbers) {
            this._startedOnLineNumbers = startedOnLineNumbers;
        }
        trySetCount(setMouseDownCount, newMouseDownPosition) {
            // a. Invalidate multiple clicking if too much time has passed (will be hit by IE because the detail field of mouse events contains garbage in IE10)
            const currentTime = (new Date()).getTime();
            if (currentTime - this._lastSetMouseDownCountTime > MouseDownState.CLEAR_MOUSE_DOWN_COUNT_TIME) {
                setMouseDownCount = 1;
            }
            this._lastSetMouseDownCountTime = currentTime;
            // b. Ensure that we don't jump from single click to triple click in one go (will be hit by IE because the detail field of mouse events contains garbage in IE10)
            if (setMouseDownCount > this._lastMouseDownCount + 1) {
                setMouseDownCount = this._lastMouseDownCount + 1;
            }
            // c. Invalidate multiple clicking if the logical position is different
            if (this._lastMouseDownPosition && this._lastMouseDownPosition.equals(newMouseDownPosition)) {
                this._lastMouseDownPositionEqualCount++;
            }
            else {
                this._lastMouseDownPositionEqualCount = 1;
            }
            this._lastMouseDownPosition = newMouseDownPosition;
            // Finally set the lastMouseDownCount
            this._lastMouseDownCount = Math.min(setMouseDownCount, this._lastMouseDownPositionEqualCount);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW91c2VIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvY29udHJvbGxlci9tb3VzZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbURoRyxNQUFhLFlBQWEsU0FBUSxtQ0FBZ0I7UUFXakQsWUFBWSxPQUFvQixFQUFFLGNBQThCLEVBQUUsVUFBaUM7WUFDbEcsS0FBSyxFQUFFLENBQUM7WUFIRCx1QkFBa0IsR0FBdUIsSUFBSSxDQUFDO1lBS3JELElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzdCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGdDQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFNUUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxrQkFBa0IsQ0FDL0QsSUFBSSxDQUFDLFFBQVEsRUFDYixJQUFJLENBQUMsY0FBYyxFQUNuQixJQUFJLENBQUMsVUFBVSxFQUNmLElBQUksQ0FBQyxrQkFBa0IsRUFDdkIsQ0FBQyxDQUFDLEVBQUUsZUFBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxFQUNuRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FDOUIsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFD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