/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/touch", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/css!./sash"], function (require, exports, dom_1, event_1, touch_1, async_1, decorators_1, event_2, lifecycle_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Sash = exports.setGlobalHoverDelay = exports.setGlobalSashSize = exports.SashState = exports.Orientation = exports.OrthogonalEdge = void 0;
    /**
     * Allow the sashes to be visible at runtime.
     * @remark Use for development purposes only.
     */
    const DEBUG = false;
    var OrthogonalEdge;
    (function (OrthogonalEdge) {
        OrthogonalEdge["North"] = "north";
        OrthogonalEdge["South"] = "south";
        OrthogonalEdge["East"] = "east";
        OrthogonalEdge["West"] = "west";
    })(OrthogonalEdge || (exports.OrthogonalEdge = OrthogonalEdge = {}));
    var Orientation;
    (function (Orientation) {
        Orientation[Orientation["VERTICAL"] = 0] = "VERTICAL";
        Orientation[Orientation["HORIZONTAL"] = 1] = "HORIZONTAL";
    })(Orientation || (exports.Orientation = Orientation = {}));
    var SashState;
    (function (SashState) {
        /**
         * Disable any UI interaction.
         */
        SashState[SashState["Disabled"] = 0] = "Disabled";
        /**
         * Allow dragging down or to the right, depending on the sash orientation.
         *
         * Some OSs allow customizing the mouse cursor differently whenever
         * some resizable component can't be any smaller, but can be larger.
         */
        SashState[SashState["AtMinimum"] = 1] = "AtMinimum";
        /**
         * Allow dragging up or to the left, depending on the sash orientation.
         *
         * Some OSs allow customizing the mouse cursor differently whenever
         * some resizable component can't be any larger, but can be smaller.
         */
        SashState[SashState["AtMaximum"] = 2] = "AtMaximum";
        /**
         * Enable dragging.
         */
        SashState[SashState["Enabled"] = 3] = "Enabled";
    })(SashState || (exports.SashState = SashState = {}));
    let globalSize = 4;
    const onDidChangeGlobalSize = new event_2.Emitter();
    function setGlobalSashSize(size) {
        globalSize = size;
        onDidChangeGlobalSize.fire(size);
    }
    exports.setGlobalSashSize = setGlobalSashSize;
    let globalHoverDelay = 300;
    const onDidChangeHoverDelay = new event_2.Emitter();
    function setGlobalHoverDelay(size) {
        globalHoverDelay = size;
        onDidChangeHoverDelay.fire(size);
    }
    exports.setGlobalHoverDelay = setGlobalHoverDelay;
    class MouseEventFactory {
        constructor() {
            this.disposables = new lifecycle_1.DisposableStore();
        }
        get onPointerMove() {
            return this.disposables.add(new event_1.DomEmitter(window, 'mousemove')).event;
        }
        get onPointerUp() {
            return this.disposables.add(new event_1.DomEmitter(window, 'mouseup')).event;
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    __decorate([
        decorators_1.memoize
    ], MouseEventFactory.prototype, "onPointerMove", null);
    __decorate([
        decorators_1.memoize
    ], MouseEventFactory.prototype, "onPointerUp", null);
    class GestureEventFactory {
        get onPointerMove() {
            return this.disposables.add(new event_1.DomEmitter(this.el, touch_1.EventType.Change)).event;
        }
        get onPointerUp() {
            return this.disposables.add(new event_1.DomEmitter(this.el, touch_1.EventType.End)).event;
        }
        constructor(el) {
            this.el = el;
            this.disposables = new lifecycle_1.DisposableStore();
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    __decorate([
        decorators_1.memoize
    ], GestureEventFactory.prototype, "onPointerMove", null);
    __decorate([
        decorators_1.memoize
    ], GestureEventFactory.prototype, "onPointerUp", null);
    class OrthogonalPointerEventFactory {
        get onPointerMove() {
            return this.factory.onPointerMove;
        }
        get onPointerUp() {
            return this.factory.onPointerUp;
        }
        constructor(factory) {
            this.factory = factory;
        }
        dispose() {
            // noop
        }
    }
    __decorate([
        decorators_1.memoize
    ], OrthogonalPointerEventFactory.prototype, "onPointerMove", null);
    __decorate([
        decorators_1.memoize
    ], OrthogonalPointerEventFactory.prototype, "onPointerUp", null);
    const PointerEventsDisabledCssClass = 'pointer-events-disabled';
    /**
     * The {@link Sash} is the UI component which allows the user to resize other
     * components. It's usually an invisible horizontal or vertical line which, when
     * hovered, becomes highlighted and can be dragged along the perpendicular dimension
     * to its direction.
     *
     * Features:
     * - Touch event handling
     * - Corner sash support
     * - Hover with different mouse cursor support
     * - Configurable hover size
     * - Linked sash support, for 2x2 corner sashes
     */
    class Sash extends lifecycle_1.Disposable {
        get state() { return this._state; }
        get orthogonalStartSash() { return this._orthogonalStartSash; }
        get orthogonalEndSash() { return this._orthogonalEndSash; }
        /**
         * The state of a sash defines whether it can be interacted with by the user
         * as well as what mouse cursor to use, when hovered.
         */
        set state(state) {
            if (this._state === state) {
                return;
            }
            this.el.classList.toggle('disabled', state === 0 /* SashState.Disabled */);
            this.el.classList.toggle('minimum', state === 1 /* SashState.AtMinimum */);
            this.el.classList.toggle('maximum', state === 2 /* SashState.AtMaximum */);
            this._state = state;
            this.onDidEnablementChange.fire(state);
        }
        /**
         * A reference to another sash, perpendicular to this one, which
         * aligns at the start of this one. A corner sash will be created
         * automatically at that location.
         *
         * The start of a horizontal sash is its left-most position.
         * The start of a vertical sash is its top-most position.
         */
        set orthogonalStartSash(sash) {
            if (this._orthogonalStartSash === sash) {
                return;
            }
            this.orthogonalStartDragHandleDisposables.clear();
            this.orthogonalStartSashDisposables.clear();
            if (sash) {
                const onChange = (state) => {
                    this.orthogonalStartDragHandleDisposables.clear();
                    if (state !== 0 /* SashState.Disabled */) {
                        this._orthogonalStartDragHandle = (0, dom_1.append)(this.el, (0, dom_1.$)('.orthogonal-drag-handle.start'));
                        this.orthogonalStartDragHandleDisposables.add((0, lifecycle_1.toDisposable)(() => this._orthogonalStartDragHandle.remove()));
                        this.orthogonalStartDragHandleDisposables.add(new event_1.DomEmitter(this._orthogonalStartDragHandle, 'mouseenter')).event(() => Sash.onMouseEnter(sash), undefined, this.orthogonalStartDragHandleDisposables);
                        this.orthogonalStartDragHandleDisposables.add(new event_1.DomEmitter(this._orthogonalStartDragHandle, 'mouseleave')).event(() => Sash.onMouseLeave(sash), undefined, this.orthogonalStartDragHandleDisposables);
                    }
                };
                this.orthogonalStartSashDisposables.add(sash.onDidEnablementChange.event(onChange, this));
                onChange(sash.state);
            }
            this._orthogonalStartSash = sash;
        }
        /**
         * A reference to another sash, perpendicular to this one, which
         * aligns at the end of this one. A corner sash will be created
         * automatically at that location.
         *
         * The end of a horizontal sash is its right-most position.
         * The end of a vertical sash is its bottom-most position.
         */
        set orthogonalEndSash(sash) {
            if (this._orthogonalEndSash === sash) {
                return;
            }
            this.orthogonalEndDragHandleDisposables.clear();
            this.orthogonalEndSashDisposables.clear();
            if (sash) {
                const onChange = (state) => {
                    this.orthogonalEndDragHandleDisposables.clear();
                    if (state !== 0 /* SashState.Disabled */) {
                        this._orthogonalEndDragHandle = (0, dom_1.append)(this.el, (0, dom_1.$)('.orthogonal-drag-handle.end'));
                        this.orthogonalEndDragHandleDisposables.add((0, lifecycle_1.toDisposable)(() => this._orthogonalEndDragHandle.remove()));
                        this.orthogonalEndDragHandleDisposables.add(new event_1.DomEmitter(this._orthogonalEndDragHandle, 'mouseenter')).event(() => Sash.onMouseEnter(sash), undefined, this.orthogonalEndDragHandleDisposables);
                        this.orthogonalEndDragHandleDisposables.add(new event_1.DomEmitter(this._orthogonalEndDragHandle, 'mouseleave')).event(() => Sash.onMouseLeave(sash), undefined, this.orthogonalEndDragHandleDisposables);
                    }
                };
                this.orthogonalEndSashDisposables.add(sash.onDidEnablementChange.event(onChange, this));
                onChange(sash.state);
            }
            this._orthogonalEndSash = sash;
        }
        constructor(container, layoutProvider, options) {
            super();
            this.hoverDelay = globalHoverDelay;
            this.hoverDelayer = this._register(new async_1.Delayer(this.hoverDelay));
            this._state = 3 /* SashState.Enabled */;
            this.onDidEnablementChange = this._register(new event_2.Emitter());
            this._onDidStart = this._register(new event_2.Emitter());
            this._onDidChange = this._register(new event_2.Emitter());
            this._onDidReset = this._register(new event_2.Emitter());
            this._onDidEnd = this._register(new event_2.Emitter());
            this.orthogonalStartSashDisposables = this._register(new lifecycle_1.DisposableStore());
            this.orthogonalStartDragHandleDisposables = this._register(new lifecycle_1.DisposableStore());
            this.orthogonalEndSashDisposables = this._register(new lifecycle_1.DisposableStore());
            this.orthogonalEndDragHandleDisposables = this._register(new lifecycle_1.DisposableStore());
            /**
             * An event which fires whenever the user starts dragging this sash.
             */
            this.onDidStart = this._onDidStart.event;
            /**
             * An event which fires whenever the user moves the mouse while
             * dragging this sash.
             */
            this.onDidChange = this._onDidChange.event;
            /**
             * An event which fires whenever the user double clicks this sash.
             */
            this.onDidReset = this._onDidReset.event;
            /**
             * An event which fires whenever the user stops dragging this sash.
             */
            this.onDidEnd = this._onDidEnd.event;
            /**
             * A linked sash will be forwarded the same user interactions and events
             * so it moves exactly the same way as this sash.
             *
             * Useful in 2x2 grids. Not meant for widespread usage.
             */
            this.linkedSash = undefined;
            this.el = (0, dom_1.append)(container, (0, dom_1.$)('.monaco-sash'));
            if (options.orthogonalEdge) {
                this.el.classList.add(`orthogonal-edge-${options.orthogonalEdge}`);
            }
            if (platform_1.isMacintosh) {
                this.el.classList.add('mac');
            }
            const onMouseDown = this._register(new event_1.DomEmitter(this.el, 'mousedown')).event;
            this._register(onMouseDown(e => this.onPointerStart(e, new MouseEventFactory()), this));
            const onMouseDoubleClick = this._register(new event_1.DomEmitter(this.el, 'dblclick')).event;
            this._register(onMouseDoubleClick(this.onPointerDoublePress, this));
            const onMouseEnter = this._register(new event_1.DomEmitter(this.el, 'mouseenter')).event;
            this._register(onMouseEnter(() => Sash.onMouseEnter(this)));
            const onMouseLeave = this._register(new event_1.DomEmitter(this.el, 'mouseleave')).event;
            this._register(onMouseLeave(() => Sash.onMouseLeave(this)));
            this._register(touch_1.Gesture.addTarget(this.el));
            const onTouchStart = this._register(new event_1.DomEmitter(this.el, touch_1.EventType.Start)).event;
            this._register(onTouchStart(e => this.onPointerStart(e, new GestureEventFactory(this.el)), this));
            const onTap = this._register(new event_1.DomEmitter(this.el, touch_1.EventType.Tap)).event;
            let doubleTapTimeout = undefined;
            this._register(onTap(event => {
                if (doubleTapTimeout) {
                    clearTimeout(doubleTapTimeout);
                    doubleTapTimeout = undefined;
                    this.onPointerDoublePress(event);
                    return;
                }
                clearTimeout(doubleTapTimeout);
                doubleTapTimeout = setTimeout(() => doubleTapTimeout = undefined, 250);
            }, this));
            if (typeof options.size === 'number') {
                this.size = options.size;
                if (options.orientation === 0 /* Orientation.VERTICAL */) {
                    this.el.style.width = `${this.size}px`;
                }
                else {
                    this.el.style.height = `${this.size}px`;
                }
            }
            else {
                this.size = globalSize;
                this._register(onDidChangeGlobalSize.event(size => {
                    this.size = size;
                    this.layout();
                }));
            }
            this._register(onDidChangeHoverDelay.event(delay => this.hoverDelay = delay));
            this.layoutProvider = layoutProvider;
            this.orthogonalStartSash = options.orthogonalStartSash;
            this.orthogonalEndSash = options.orthogonalEndSash;
            this.orientation = options.orientation || 0 /* Orientation.VERTICAL */;
            if (this.orientation === 1 /* Orientation.HORIZONTAL */) {
                this.el.classList.add('horizontal');
                this.el.classList.remove('vertical');
            }
            else {
                this.el.classList.remove('horizontal');
                this.el.classList.add('vertical');
            }
            this.el.classList.toggle('debug', DEBUG);
            this.layout();
        }
        onPointerStart(event, pointerEventFactory) {
            dom_1.EventHelper.stop(event);
            let isMultisashResize = false;
            if (!event.__orthogonalSashEvent) {
                const orthogonalSash = this.getOrthogonalSash(event);
                if (orthogonalSash) {
                    isMultisashResize = true;
                    event.__orthogonalSashEvent = true;
                    orthogonalSash.onPointerStart(event, new OrthogonalPointerEventFactory(pointerEventFactory));
                }
            }
            if (this.linkedSash && !event.__linkedSashEvent) {
                event.__linkedSashEvent = true;
                this.linkedSash.onPointerStart(event, new OrthogonalPointerEventFactory(pointerEventFactory));
            }
            if (!this.state) {
                return;
            }
            const iframes = document.getElementsByTagName('iframe');
            for (const iframe of iframes) {
                iframe.classList.add(PointerEventsDisabledCssClass); // disable mouse events on iframes as long as we drag the sash
            }
            const startX = event.pageX;
            const startY = event.pageY;
            const altKey = event.altKey;
            const startEvent = { startX, currentX: startX, startY, currentY: startY, altKey };
            this.el.classList.add('active');
            this._onDidStart.fire(startEvent);
            // fix https://github.com/microsoft/vscode/issues/21675
            const style = (0, dom_1.createStyleSheet)(this.el);
            const updateStyle = () => {
                let cursor = '';
                if (isMultisashResize) {
                    cursor = 'all-scroll';
                }
                else if (this.orientation === 1 /* Orientation.HORIZONTAL */) {
                    if (this.state === 1 /* SashState.AtMinimum */) {
                        cursor = 's-resize';
                    }
                    else if (this.state === 2 /* SashState.AtMaximum */) {
                        cursor = 'n-resize';
                    }
                    else {
                        cursor = platform_1.isMacintosh ? 'row-resize' : 'ns-resize';
                    }
                }
                else {
                    if (this.state === 1 /* SashState.AtMinimum */) {
                        cursor = 'e-resize';
                    }
                    else if (this.state === 2 /* SashState.AtMaximum */) {
                        cursor = 'w-resize';
                    }
                    else {
                        cursor = platform_1.isMacintosh ? 'col-resize' : 'ew-resize';
                    }
                }
                style.textContent = `* { cursor: ${cursor} !important; }`;
            };
            const disposables = new lifecycle_1.DisposableStore();
            updateStyle();
            if (!isMultisashResize) {
                this.onDidEnablementChange.event(updateStyle, null, disposables);
            }
            const onPointerMove = (e) => {
                dom_1.EventHelper.stop(e, false);
                const event = { startX, currentX: e.pageX, startY, currentY: e.pageY, altKey };
                this._onDidChange.fire(event);
            };
            const onPointerUp = (e) => {
                dom_1.EventHelper.stop(e, false);
                this.el.removeChild(style);
                this.el.classList.remove('active');
                this._onDidEnd.fire();
                disposables.dispose();
                for (const iframe of iframes) {
                    iframe.classList.remove(PointerEventsDisabledCssClass);
                }
            };
            pointerEventFactory.onPointerMove(onPointerMove, null, disposables);
            pointerEventFactory.onPointerUp(onPointerUp, null, disposables);
            disposables.add(pointerEventFactory);
        }
        onPointerDoublePress(e) {
            const orthogonalSash = this.getOrthogonalSash(e);
            if (orthogonalSash) {
                orthogonalSash._onDidReset.fire();
            }
            if (this.linkedSash) {
                this.linkedSash._onDidReset.fire();
            }
            this._onDidReset.fire();
        }
        static onMouseEnter(sash, fromLinkedSash = false) {
            if (sash.el.classList.contains('active')) {
                sash.hoverDelayer.cancel();
                sash.el.classList.add('hover');
            }
            else {
                sash.hoverDelayer.trigger(() => sash.el.classList.add('hover'), sash.hoverDelay).then(undefined, () => { });
            }
            if (!fromLinkedSash && sash.linkedSash) {
                Sash.onMouseEnter(sash.linkedSash, true);
            }
        }
        static onMouseLeave(sash, fromLinkedSash = false) {
            sash.hoverDelayer.cancel();
            sash.el.classList.remove('hover');
            if (!fromLinkedSash && sash.linkedSash) {
                Sash.onMouseLeave(sash.linkedSash, true);
            }
        }
        /**
         * Forcefully stop any user interactions with this sash.
         * Useful when hiding a parent component, while the user is still
         * interacting with the sash.
         */
        clearSashHoverState() {
            Sash.onMouseLeave(this);
        }
        /**
         * Layout the sash. The sash will size and position itself
         * based on its provided {@link ISashLayoutProvider layout provider}.
         */
        layout() {
            if (this.orientation === 0 /* Orientation.VERTICAL */) {
                const verticalProvider = this.layoutProvider;
                this.el.style.left = verticalProvider.getVerticalSashLeft(this) - (this.size / 2) + 'px';
                if (verticalProvider.getVerticalSashTop) {
                    this.el.style.top = verticalProvider.getVerticalSashTop(this) + 'px';
                }
                if (verticalProvider.getVerticalSashHeight) {
                    this.el.style.height = verticalProvider.getVerticalSashHeight(this) + 'px';
                }
            }
            else {
                const horizontalProvider = this.layoutProvider;
                this.el.style.top = horizontalProvider.getHorizontalSashTop(this) - (this.size / 2) + 'px';
                if (horizontalProvider.getHorizontalSashLeft) {
                    this.el.style.left = horizontalProvider.getHorizontalSashLeft(this) + 'px';
                }
                if (horizontalProvider.getHorizontalSashWidth) {
                    this.el.style.width = horizontalProvider.getHorizontalSashWidth(this) + 'px';
                }
            }
        }
        getOrthogonalSash(e) {
            const target = e.initialTarget ?? e.target;
            if (!target || !(target instanceof HTMLElement)) {
                return undefined;
            }
            if (target.classList.contains('orthogonal-drag-handle')) {
                return target.classList.contains('start') ? this.orthogonalStartSash : this.orthogonalEndSash;
            }
            return undefined;
        }
        dispose() {
            super.dispose();
            this.el.remove();
        }
    }
    exports.Sash = Sash;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FzaC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9zYXNoL3Nhc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7O0lBWWhHOzs7T0FHRztJQUNILE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQztJQStCcEIsSUFBWSxjQUtYO0lBTEQsV0FBWSxjQUFjO1FBQ3pCLGlDQUFlLENBQUE7UUFDZixpQ0FBZSxDQUFBO1FBQ2YsK0JBQWEsQ0FBQTtRQUNiLCtCQUFhLENBQUE7SUFDZCxDQUFDLEVBTFcsY0FBYyw4QkFBZCxjQUFjLFFBS3pCO0lBd0RELElBQWtCLFdBR2pCO0lBSEQsV0FBa0IsV0FBVztRQUM1QixxREFBUSxDQUFBO1FBQ1IseURBQVUsQ0FBQTtJQUNYLENBQUMsRUFIaUIsV0FBVywyQkFBWCxXQUFXLFFBRzVCO0lBRUQsSUFBa0IsU0EyQmpCO0lBM0JELFdBQWtCLFNBQVM7UUFFMUI7O1dBRUc7UUFDSCxpREFBUSxDQUFBO1FBRVI7Ozs7O1dBS0c7UUFDSCxtREFBUyxDQUFBO1FBRVQ7Ozs7O1dBS0c7UUFDSCxtREFBUyxDQUFBO1FBRVQ7O1dBRUc7UUFDSCwrQ0FBTyxDQUFBO0lBQ1IsQ0FBQyxFQTNCaUIsU0FBUyx5QkFBVCxTQUFTLFFBMkIxQjtJQUVELElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNuQixNQUFNLHFCQUFxQixHQUFHLElBQUksZUFBTyxFQUFVLENBQUM7SUFDcEQsU0FBZ0IsaUJBQWlCLENBQUMsSUFBWTtRQUM3QyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBSEQsOENBR0M7SUFFRCxJQUFJLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztJQUMzQixNQUFNLHFCQUFxQixHQUFHLElBQUksZUFBTyxFQUFVLENBQUM7SUFDcEQsU0FBZ0IsbUJBQW1CLENBQUMsSUFBWTtRQUMvQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDeEIscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFIRCxrREFHQztJQWdCRCxNQUFNLGlCQUFpQjtRQUF2QjtZQUVrQixnQkFBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBZXRELENBQUM7UUFaQSxJQUFJLGFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGtCQUFVLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3hFLENBQUM7UUFHRCxJQUFJLFdBQVc7WUFDZCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksa0JBQVUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDdEUsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDRDtJQVpBO1FBREMsb0JBQU87MERBR1A7SUFHRDtRQURDLG9CQUFPO3dEQUdQO0lBT0YsTUFBTSxtQkFBbUI7UUFLeEIsSUFBSSxhQUFhO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxrQkFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsaUJBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5RSxDQUFDO1FBR0QsSUFBSSxXQUFXO1lBQ2QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGtCQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxpQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzNFLENBQUM7UUFFRCxZQUFvQixFQUFlO1lBQWYsT0FBRSxHQUFGLEVBQUUsQ0FBYTtZQVpsQixnQkFBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBWWQsQ0FBQztRQUV4QyxPQUFPO1lBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QixDQUFDO0tBQ0Q7SUFkQTtRQURDLG9CQUFPOzREQUdQO0lBR0Q7UUFEQyxvQkFBTzswREFHUDtJQVNGLE1BQU0sNkJBQTZCO1FBR2xDLElBQUksYUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBQ25DLENBQUM7UUFHRCxJQUFJLFdBQVc7WUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxZQUFvQixPQUE2QjtZQUE3QixZQUFPLEdBQVAsT0FBTyxDQUFzQjtRQUFJLENBQUM7UUFFdEQsT0FBTztZQUNOLE9BQU87UUFDUixDQUFDO0tBQ0Q7SUFkQTtRQURDLG9CQUFPO3NFQUdQO0lBR0Q7UUFEQyxvQkFBTztvRUFHUDtJQVNGLE1BQU0sNkJBQTZCLEdBQUcseUJBQXlCLENBQUM7SUFFaEU7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsTUFBYSxJQUFLLFNBQVEsc0JBQVU7UUF3Qm5DLElBQUksS0FBSyxLQUFnQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzlDLElBQUksbUJBQW1CLEtBQXVCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztRQUNqRixJQUFJLGlCQUFpQixLQUF1QixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFFN0U7OztXQUdHO1FBQ0gsSUFBSSxLQUFLLENBQUMsS0FBZ0I7WUFDekIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtnQkFDMUIsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLCtCQUF1QixDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLGdDQUF3QixDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLGdDQUF3QixDQUFDLENBQUM7WUFFbkUsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBK0JEOzs7Ozs7O1dBT0c7UUFDSCxJQUFJLG1CQUFtQixDQUFDLElBQXNCO1lBQzdDLElBQUksSUFBSSxDQUFDLG9CQUFvQixLQUFLLElBQUksRUFBRTtnQkFDdkMsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUU1QyxJQUFJLElBQUksRUFBRTtnQkFDVCxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtvQkFDckMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUVsRCxJQUFJLEtBQUssK0JBQXVCLEVBQUU7d0JBQ2pDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUEsT0FBQyxFQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQzt3QkFDdEYsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLDBCQUEyQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDN0csSUFBSSxDQUFDLG9DQUFvQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGtCQUFVLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUNoSCxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQzt3QkFDdkYsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGtCQUFVLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUNoSCxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztxQkFDdkY7Z0JBQ0YsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDMUYsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNyQjtZQUVELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7UUFDbEMsQ0FBQztRQUVEOzs7Ozs7O1dBT0c7UUFFSCxJQUFJLGlCQUFpQixDQUFDLElBQXNCO1lBQzNDLElBQUksSUFBSSxDQUFDLGtCQUFrQixLQUFLLElBQUksRUFBRTtnQkFDckMsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUUxQyxJQUFJLElBQUksRUFBRTtnQkFDVCxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtvQkFDckMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUVoRCxJQUFJLEtBQUssK0JBQXVCLEVBQUU7d0JBQ2pDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUEsT0FBQyxFQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQzt3QkFDbEYsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHdCQUF5QixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDekcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGtCQUFVLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUM1RyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQzt3QkFDckYsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGtCQUFVLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUM1RyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztxQkFDckY7Z0JBQ0YsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDeEYsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNyQjtZQUVELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFDaEMsQ0FBQztRQW1CRCxZQUFZLFNBQXNCLEVBQUUsY0FBbUMsRUFBRSxPQUFxQjtZQUM3RixLQUFLLEVBQUUsQ0FBQztZQWpLRCxlQUFVLEdBQUcsZ0JBQWdCLENBQUM7WUFDOUIsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBRTVELFdBQU0sNkJBQWdDO1lBQzdCLDBCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWEsQ0FBQyxDQUFDO1lBQ2pFLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBYyxDQUFDLENBQUM7WUFDeEQsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFjLENBQUMsQ0FBQztZQUN6RCxnQkFBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2xELGNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNoRCxtQ0FBOEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFFdkUseUNBQW9DLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBRTdFLGlDQUE0QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUVyRSx1Q0FBa0MsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUF3QjVGOztlQUVHO1lBQ00sZUFBVSxHQUFzQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUVoRTs7O2VBR0c7WUFDTSxnQkFBVyxHQUFzQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUVsRTs7ZUFFRztZQUNNLGVBQVUsR0FBZ0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFFMUQ7O2VBRUc7WUFDTSxhQUFRLEdBQWdCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBRXREOzs7OztlQUtHO1lBQ0gsZUFBVSxHQUFxQixTQUFTLENBQUM7WUFpR3hDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBQSxZQUFNLEVBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFFL0MsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO2dCQUMzQixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2FBQ25FO1lBRUQsSUFBSSxzQkFBVyxFQUFFO2dCQUNoQixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0I7WUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksa0JBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQy9FLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4RixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxrQkFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDckYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwRSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksa0JBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ2pGLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxrQkFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDakYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFNUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTNDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxrQkFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsaUJBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNwRixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsRyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksa0JBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGlCQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFFM0UsSUFBSSxnQkFBZ0IsR0FBUSxTQUFTLENBQUM7WUFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzVCLElBQUksZ0JBQWdCLEVBQUU7b0JBQ3JCLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUMvQixnQkFBZ0IsR0FBRyxTQUFTLENBQUM7b0JBQzdCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDakMsT0FBTztpQkFDUDtnQkFFRCxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDL0IsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN4RSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVWLElBQUksT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtnQkFDckMsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUV6QixJQUFJLE9BQU8sQ0FBQyxXQUFXLGlDQUF5QixFQUFFO29CQUNqRCxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7aUJBQ3ZDO3FCQUFNO29CQUNOLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztpQkFDeEM7YUFDRDtpQkFBTTtnQkFDTixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2pELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO29CQUNqQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2YsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFOUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7WUFFckMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztZQUN2RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1lBRW5ELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsZ0NBQXdCLENBQUM7WUFFL0QsSUFBSSxJQUFJLENBQUMsV0FBVyxtQ0FBMkIsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDckM7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDbEM7WUFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXpDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFFTyxjQUFjLENBQUMsS0FBbUIsRUFBRSxtQkFBeUM7WUFDcEYsaUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFeEIsSUFBSSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFFOUIsSUFBSSxDQUFFLEtBQWEsQ0FBQyxxQkFBcUIsRUFBRTtnQkFDMUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVyRCxJQUFJLGNBQWMsRUFBRTtvQkFDbkIsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO29CQUN4QixLQUFhLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO29CQUM1QyxjQUFjLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLDZCQUE2QixDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztpQkFDN0Y7YUFDRDtZQUVELElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFFLEtBQWEsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDeEQsS0FBYSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFDeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksNkJBQTZCLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO2FBQzlGO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hCLE9BQU87YUFDUDtZQUVELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4RCxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtnQkFDN0IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLDhEQUE4RDthQUNuSDtZQUVELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDM0IsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMzQixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQzVCLE1BQU0sVUFBVSxHQUFlLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFFOUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRWxDLHVEQUF1RDtZQUN2RCxNQUFNLEtBQUssR0FBRyxJQUFBLHNCQUFnQixFQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4QyxNQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUU7Z0JBQ3hCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztnQkFFaEIsSUFBSSxpQkFBaUIsRUFBRTtvQkFDdEIsTUFBTSxHQUFHLFlBQVksQ0FBQztpQkFDdEI7cUJBQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxtQ0FBMkIsRUFBRTtvQkFDdkQsSUFBSSxJQUFJLENBQUMsS0FBSyxnQ0FBd0IsRUFBRTt3QkFDdkMsTUFBTSxHQUFHLFVBQVUsQ0FBQztxQkFDcEI7eUJBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxnQ0FBd0IsRUFBRTt3QkFDOUMsTUFBTSxHQUFHLFVBQVUsQ0FBQztxQkFDcEI7eUJBQU07d0JBQ04sTUFBTSxHQUFHLHNCQUFXLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO3FCQUNsRDtpQkFDRDtxQkFBTTtvQkFDTixJQUFJLElBQUksQ0FBQyxLQUFLLGdDQUF3QixFQUFFO3dCQUN2QyxNQUFNLEdBQUcsVUFBVSxDQUFDO3FCQUNwQjt5QkFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLGdDQUF3QixFQUFFO3dCQUM5QyxNQUFNLEdBQUcsVUFBVSxDQUFDO3FCQUNwQjt5QkFBTTt3QkFDTixNQUFNLEdBQUcsc0JBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7cUJBQ2xEO2lCQUNEO2dCQUVELEtBQUssQ0FBQyxXQUFXLEdBQUcsZUFBZSxNQUFNLGdCQUFnQixDQUFDO1lBQzNELENBQUMsQ0FBQztZQUVGLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRTFDLFdBQVcsRUFBRSxDQUFDO1lBRWQsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUN2QixJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDakU7WUFFRCxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQWUsRUFBRSxFQUFFO2dCQUN6QyxpQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzNCLE1BQU0sS0FBSyxHQUFlLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztnQkFFM0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDO1lBRUYsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFlLEVBQUUsRUFBRTtnQkFDdkMsaUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUUzQixJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFM0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUV0QixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRXRCLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO29CQUM3QixNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO2lCQUN2RDtZQUNGLENBQUMsQ0FBQztZQUVGLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3BFLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2hFLFdBQVcsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRU8sb0JBQW9CLENBQUMsQ0FBYTtZQUN6QyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFakQsSUFBSSxjQUFjLEVBQUU7Z0JBQ25CLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDbEM7WUFFRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ25DO1lBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFVLEVBQUUsaUJBQTBCLEtBQUs7WUFDdEUsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3pDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMvQjtpQkFBTTtnQkFDTixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDNUc7WUFFRCxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN6QztRQUNGLENBQUM7UUFFTyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQVUsRUFBRSxpQkFBMEIsS0FBSztZQUN0RSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVsQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN6QztRQUNGLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsbUJBQW1CO1lBQ2xCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVEOzs7V0FHRztRQUNILE1BQU07WUFDTCxJQUFJLElBQUksQ0FBQyxXQUFXLGlDQUF5QixFQUFFO2dCQUM5QyxNQUFNLGdCQUFnQixHQUFpQyxJQUFJLENBQUMsY0FBZSxDQUFDO2dCQUM1RSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFFekYsSUFBSSxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRTtvQkFDeEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFDckU7Z0JBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxxQkFBcUIsRUFBRTtvQkFDM0MsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFDM0U7YUFDRDtpQkFBTTtnQkFDTixNQUFNLGtCQUFrQixHQUFtQyxJQUFJLENBQUMsY0FBZSxDQUFDO2dCQUNoRixJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFFM0YsSUFBSSxrQkFBa0IsQ0FBQyxxQkFBcUIsRUFBRTtvQkFDN0MsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFDM0U7Z0JBRUQsSUFBSSxrQkFBa0IsQ0FBQyxzQkFBc0IsRUFBRTtvQkFDOUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLGtCQUFrQixDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFDN0U7YUFDRDtRQUNGLENBQUM7UUFFTyxpQkFBaUIsQ0FBQyxDQUFlO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUUzQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLFlBQVksV0FBVyxDQUFDLEVBQUU7Z0JBQ2hELE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO2dCQUN4RCxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQzthQUM5RjtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFUSxPQUFPO1lBQ2YsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEIsQ0FBQztLQUNEO0lBdGJELG9CQXNiQyJ9