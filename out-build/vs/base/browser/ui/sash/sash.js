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
    exports.$aR = exports.$_Q = exports.$$Q = exports.SashState = exports.Orientation = exports.OrthogonalEdge = void 0;
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
    const onDidChangeGlobalSize = new event_2.$fd();
    function $$Q(size) {
        globalSize = size;
        onDidChangeGlobalSize.fire(size);
    }
    exports.$$Q = $$Q;
    let globalHoverDelay = 300;
    const onDidChangeHoverDelay = new event_2.$fd();
    function $_Q(size) {
        globalHoverDelay = size;
        onDidChangeHoverDelay.fire(size);
    }
    exports.$_Q = $_Q;
    class MouseEventFactory {
        constructor() {
            this.a = new lifecycle_1.$jc();
        }
        get onPointerMove() {
            return this.a.add(new event_1.$9P(window, 'mousemove')).event;
        }
        get onPointerUp() {
            return this.a.add(new event_1.$9P(window, 'mouseup')).event;
        }
        dispose() {
            this.a.dispose();
        }
    }
    __decorate([
        decorators_1.$6g
    ], MouseEventFactory.prototype, "onPointerMove", null);
    __decorate([
        decorators_1.$6g
    ], MouseEventFactory.prototype, "onPointerUp", null);
    class GestureEventFactory {
        get onPointerMove() {
            return this.a.add(new event_1.$9P(this.b, touch_1.EventType.Change)).event;
        }
        get onPointerUp() {
            return this.a.add(new event_1.$9P(this.b, touch_1.EventType.End)).event;
        }
        constructor(b) {
            this.b = b;
            this.a = new lifecycle_1.$jc();
        }
        dispose() {
            this.a.dispose();
        }
    }
    __decorate([
        decorators_1.$6g
    ], GestureEventFactory.prototype, "onPointerMove", null);
    __decorate([
        decorators_1.$6g
    ], GestureEventFactory.prototype, "onPointerUp", null);
    class OrthogonalPointerEventFactory {
        get onPointerMove() {
            return this.a.onPointerMove;
        }
        get onPointerUp() {
            return this.a.onPointerUp;
        }
        constructor(a) {
            this.a = a;
        }
        dispose() {
            // noop
        }
    }
    __decorate([
        decorators_1.$6g
    ], OrthogonalPointerEventFactory.prototype, "onPointerMove", null);
    __decorate([
        decorators_1.$6g
    ], OrthogonalPointerEventFactory.prototype, "onPointerUp", null);
    const PointerEventsDisabledCssClass = 'pointer-events-disabled';
    /**
     * The {@link $aR} is the UI component which allows the user to resize other
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
    class $aR extends lifecycle_1.$kc {
        get state() { return this.j; }
        get orthogonalStartSash() { return this.w; }
        get orthogonalEndSash() { return this.D; }
        /**
         * The state of a sash defines whether it can be interacted with by the user
         * as well as what mouse cursor to use, when hovered.
         */
        set state(state) {
            if (this.j === state) {
                return;
            }
            this.a.classList.toggle('disabled', state === 0 /* SashState.Disabled */);
            this.a.classList.toggle('minimum', state === 1 /* SashState.AtMinimum */);
            this.a.classList.toggle('maximum', state === 2 /* SashState.AtMaximum */);
            this.j = state;
            this.m.fire(state);
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
            if (this.w === sash) {
                return;
            }
            this.y.clear();
            this.u.clear();
            if (sash) {
                const onChange = (state) => {
                    this.y.clear();
                    if (state !== 0 /* SashState.Disabled */) {
                        this.z = (0, dom_1.$0O)(this.a, (0, dom_1.$)('.orthogonal-drag-handle.start'));
                        this.y.add((0, lifecycle_1.$ic)(() => this.z.remove()));
                        this.y.add(new event_1.$9P(this.z, 'mouseenter')).event(() => $aR.J(sash), undefined, this.y);
                        this.y.add(new event_1.$9P(this.z, 'mouseleave')).event(() => $aR.L(sash), undefined, this.y);
                    }
                };
                this.u.add(sash.m.event(onChange, this));
                onChange(sash.state);
            }
            this.w = sash;
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
            if (this.D === sash) {
                return;
            }
            this.F.clear();
            this.C.clear();
            if (sash) {
                const onChange = (state) => {
                    this.F.clear();
                    if (state !== 0 /* SashState.Disabled */) {
                        this.G = (0, dom_1.$0O)(this.a, (0, dom_1.$)('.orthogonal-drag-handle.end'));
                        this.F.add((0, lifecycle_1.$ic)(() => this.G.remove()));
                        this.F.add(new event_1.$9P(this.G, 'mouseenter')).event(() => $aR.J(sash), undefined, this.F);
                        this.F.add(new event_1.$9P(this.G, 'mouseleave')).event(() => $aR.L(sash), undefined, this.F);
                    }
                };
                this.C.add(sash.m.event(onChange, this));
                onChange(sash.state);
            }
            this.D = sash;
        }
        constructor(container, layoutProvider, options) {
            super();
            this.g = globalHoverDelay;
            this.h = this.B(new async_1.$Dg(this.g));
            this.j = 3 /* SashState.Enabled */;
            this.m = this.B(new event_2.$fd());
            this.n = this.B(new event_2.$fd());
            this.r = this.B(new event_2.$fd());
            this.s = this.B(new event_2.$fd());
            this.t = this.B(new event_2.$fd());
            this.u = this.B(new lifecycle_1.$jc());
            this.y = this.B(new lifecycle_1.$jc());
            this.C = this.B(new lifecycle_1.$jc());
            this.F = this.B(new lifecycle_1.$jc());
            /**
             * An event which fires whenever the user starts dragging this sash.
             */
            this.onDidStart = this.n.event;
            /**
             * An event which fires whenever the user moves the mouse while
             * dragging this sash.
             */
            this.onDidChange = this.r.event;
            /**
             * An event which fires whenever the user double clicks this sash.
             */
            this.onDidReset = this.s.event;
            /**
             * An event which fires whenever the user stops dragging this sash.
             */
            this.onDidEnd = this.t.event;
            /**
             * A linked sash will be forwarded the same user interactions and events
             * so it moves exactly the same way as this sash.
             *
             * Useful in 2x2 grids. Not meant for widespread usage.
             */
            this.linkedSash = undefined;
            this.a = (0, dom_1.$0O)(container, (0, dom_1.$)('.monaco-sash'));
            if (options.orthogonalEdge) {
                this.a.classList.add(`orthogonal-edge-${options.orthogonalEdge}`);
            }
            if (platform_1.$j) {
                this.a.classList.add('mac');
            }
            const onMouseDown = this.B(new event_1.$9P(this.a, 'mousedown')).event;
            this.B(onMouseDown(e => this.H(e, new MouseEventFactory()), this));
            const onMouseDoubleClick = this.B(new event_1.$9P(this.a, 'dblclick')).event;
            this.B(onMouseDoubleClick(this.I, this));
            const onMouseEnter = this.B(new event_1.$9P(this.a, 'mouseenter')).event;
            this.B(onMouseEnter(() => $aR.J(this)));
            const onMouseLeave = this.B(new event_1.$9P(this.a, 'mouseleave')).event;
            this.B(onMouseLeave(() => $aR.L(this)));
            this.B(touch_1.$EP.addTarget(this.a));
            const onTouchStart = this.B(new event_1.$9P(this.a, touch_1.EventType.Start)).event;
            this.B(onTouchStart(e => this.H(e, new GestureEventFactory(this.a)), this));
            const onTap = this.B(new event_1.$9P(this.a, touch_1.EventType.Tap)).event;
            let doubleTapTimeout = undefined;
            this.B(onTap(event => {
                if (doubleTapTimeout) {
                    clearTimeout(doubleTapTimeout);
                    doubleTapTimeout = undefined;
                    this.I(event);
                    return;
                }
                clearTimeout(doubleTapTimeout);
                doubleTapTimeout = setTimeout(() => doubleTapTimeout = undefined, 250);
            }, this));
            if (typeof options.size === 'number') {
                this.f = options.size;
                if (options.orientation === 0 /* Orientation.VERTICAL */) {
                    this.a.style.width = `${this.f}px`;
                }
                else {
                    this.a.style.height = `${this.f}px`;
                }
            }
            else {
                this.f = globalSize;
                this.B(onDidChangeGlobalSize.event(size => {
                    this.f = size;
                    this.layout();
                }));
            }
            this.B(onDidChangeHoverDelay.event(delay => this.g = delay));
            this.b = layoutProvider;
            this.orthogonalStartSash = options.orthogonalStartSash;
            this.orthogonalEndSash = options.orthogonalEndSash;
            this.c = options.orientation || 0 /* Orientation.VERTICAL */;
            if (this.c === 1 /* Orientation.HORIZONTAL */) {
                this.a.classList.add('horizontal');
                this.a.classList.remove('vertical');
            }
            else {
                this.a.classList.remove('horizontal');
                this.a.classList.add('vertical');
            }
            this.a.classList.toggle('debug', DEBUG);
            this.layout();
        }
        H(event, pointerEventFactory) {
            dom_1.$5O.stop(event);
            let isMultisashResize = false;
            if (!event.__orthogonalSashEvent) {
                const orthogonalSash = this.M(event);
                if (orthogonalSash) {
                    isMultisashResize = true;
                    event.__orthogonalSashEvent = true;
                    orthogonalSash.H(event, new OrthogonalPointerEventFactory(pointerEventFactory));
                }
            }
            if (this.linkedSash && !event.__linkedSashEvent) {
                event.__linkedSashEvent = true;
                this.linkedSash.H(event, new OrthogonalPointerEventFactory(pointerEventFactory));
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
            this.a.classList.add('active');
            this.n.fire(startEvent);
            // fix https://github.com/microsoft/vscode/issues/21675
            const style = (0, dom_1.$XO)(this.a);
            const updateStyle = () => {
                let cursor = '';
                if (isMultisashResize) {
                    cursor = 'all-scroll';
                }
                else if (this.c === 1 /* Orientation.HORIZONTAL */) {
                    if (this.state === 1 /* SashState.AtMinimum */) {
                        cursor = 's-resize';
                    }
                    else if (this.state === 2 /* SashState.AtMaximum */) {
                        cursor = 'n-resize';
                    }
                    else {
                        cursor = platform_1.$j ? 'row-resize' : 'ns-resize';
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
                        cursor = platform_1.$j ? 'col-resize' : 'ew-resize';
                    }
                }
                style.textContent = `* { cursor: ${cursor} !important; }`;
            };
            const disposables = new lifecycle_1.$jc();
            updateStyle();
            if (!isMultisashResize) {
                this.m.event(updateStyle, null, disposables);
            }
            const onPointerMove = (e) => {
                dom_1.$5O.stop(e, false);
                const event = { startX, currentX: e.pageX, startY, currentY: e.pageY, altKey };
                this.r.fire(event);
            };
            const onPointerUp = (e) => {
                dom_1.$5O.stop(e, false);
                this.a.removeChild(style);
                this.a.classList.remove('active');
                this.t.fire();
                disposables.dispose();
                for (const iframe of iframes) {
                    iframe.classList.remove(PointerEventsDisabledCssClass);
                }
            };
            pointerEventFactory.onPointerMove(onPointerMove, null, disposables);
            pointerEventFactory.onPointerUp(onPointerUp, null, disposables);
            disposables.add(pointerEventFactory);
        }
        I(e) {
            const orthogonalSash = this.M(e);
            if (orthogonalSash) {
                orthogonalSash.s.fire();
            }
            if (this.linkedSash) {
                this.linkedSash.s.fire();
            }
            this.s.fire();
        }
        static J(sash, fromLinkedSash = false) {
            if (sash.a.classList.contains('active')) {
                sash.h.cancel();
                sash.a.classList.add('hover');
            }
            else {
                sash.h.trigger(() => sash.a.classList.add('hover'), sash.g).then(undefined, () => { });
            }
            if (!fromLinkedSash && sash.linkedSash) {
                $aR.J(sash.linkedSash, true);
            }
        }
        static L(sash, fromLinkedSash = false) {
            sash.h.cancel();
            sash.a.classList.remove('hover');
            if (!fromLinkedSash && sash.linkedSash) {
                $aR.L(sash.linkedSash, true);
            }
        }
        /**
         * Forcefully stop any user interactions with this sash.
         * Useful when hiding a parent component, while the user is still
         * interacting with the sash.
         */
        clearSashHoverState() {
            $aR.L(this);
        }
        /**
         * Layout the sash. The sash will size and position itself
         * based on its provided {@link ISashLayoutProvider layout provider}.
         */
        layout() {
            if (this.c === 0 /* Orientation.VERTICAL */) {
                const verticalProvider = this.b;
                this.a.style.left = verticalProvider.getVerticalSashLeft(this) - (this.f / 2) + 'px';
                if (verticalProvider.getVerticalSashTop) {
                    this.a.style.top = verticalProvider.getVerticalSashTop(this) + 'px';
                }
                if (verticalProvider.getVerticalSashHeight) {
                    this.a.style.height = verticalProvider.getVerticalSashHeight(this) + 'px';
                }
            }
            else {
                const horizontalProvider = this.b;
                this.a.style.top = horizontalProvider.getHorizontalSashTop(this) - (this.f / 2) + 'px';
                if (horizontalProvider.getHorizontalSashLeft) {
                    this.a.style.left = horizontalProvider.getHorizontalSashLeft(this) + 'px';
                }
                if (horizontalProvider.getHorizontalSashWidth) {
                    this.a.style.width = horizontalProvider.getHorizontalSashWidth(this) + 'px';
                }
            }
        }
        M(e) {
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
            this.a.remove();
        }
    }
    exports.$aR = $aR;
});
//# sourceMappingURL=sash.js.map