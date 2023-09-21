/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/globalPointerMoveMonitor", "vs/base/browser/ui/scrollbar/scrollbarArrow", "vs/base/browser/ui/scrollbar/scrollbarVisibilityController", "vs/base/browser/ui/widget", "vs/base/common/platform"], function (require, exports, dom, fastDomNode_1, globalPointerMoveMonitor_1, scrollbarArrow_1, scrollbarVisibilityController_1, widget_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NP = void 0;
    /**
     * The orthogonal distance to the slider at which dragging "resets". This implements "snapping"
     */
    const POINTER_DRAG_RESET_DISTANCE = 140;
    class $NP extends widget_1.$IP {
        constructor(opts) {
            super();
            this.g = opts.lazyRender;
            this.a = opts.host;
            this.b = opts.scrollable;
            this.c = opts.scrollByPage;
            this.h = opts.scrollbarState;
            this.n = this.B(new scrollbarVisibilityController_1.$MP(opts.visibility, 'visible scrollbar ' + opts.extraScrollbarClassName, 'invisible scrollbar ' + opts.extraScrollbarClassName));
            this.n.setIsNeeded(this.h.isNeeded());
            this.r = this.B(new globalPointerMoveMonitor_1.$HP());
            this.s = true;
            this.domNode = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.domNode.setAttribute('role', 'presentation');
            this.domNode.setAttribute('aria-hidden', 'true');
            this.n.setDomNode(this.domNode);
            this.domNode.setPosition('absolute');
            this.B(dom.$nO(this.domNode.domNode, dom.$3O.POINTER_DOWN, (e) => this.M(e)));
        }
        // ----------------- creation
        /**
         * Creates the dom node for an arrow & adds it to the container
         */
        t(opts) {
            const arrow = this.B(new scrollbarArrow_1.$KP(opts));
            this.domNode.domNode.appendChild(arrow.bgDomNode);
            this.domNode.domNode.appendChild(arrow.domNode);
        }
        /**
         * Creates the slider dom node, adds it to the container & hooks up the events
         */
        w(top, left, width, height) {
            this.slider = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.slider.setClassName('slider');
            this.slider.setPosition('absolute');
            this.slider.setTop(top);
            this.slider.setLeft(left);
            if (typeof width === 'number') {
                this.slider.setWidth(width);
            }
            if (typeof height === 'number') {
                this.slider.setHeight(height);
            }
            this.slider.setLayerHinting(true);
            this.slider.setContain('strict');
            this.domNode.domNode.appendChild(this.slider.domNode);
            this.B(dom.$nO(this.slider.domNode, dom.$3O.POINTER_DOWN, (e) => {
                if (e.button === 0) {
                    e.preventDefault();
                    this.O(e);
                }
            }));
            this.f(this.slider.domNode, e => {
                if (e.leftButton) {
                    e.stopPropagation();
                }
            });
        }
        // ----------------- Update state
        y(visibleSize) {
            if (this.h.setVisibleSize(visibleSize)) {
                this.n.setIsNeeded(this.h.isNeeded());
                this.s = true;
                if (!this.g) {
                    this.render();
                }
            }
            return this.s;
        }
        J(elementScrollSize) {
            if (this.h.setScrollSize(elementScrollSize)) {
                this.n.setIsNeeded(this.h.isNeeded());
                this.s = true;
                if (!this.g) {
                    this.render();
                }
            }
            return this.s;
        }
        L(elementScrollPosition) {
            if (this.h.setScrollPosition(elementScrollPosition)) {
                this.n.setIsNeeded(this.h.isNeeded());
                this.s = true;
                if (!this.g) {
                    this.render();
                }
            }
            return this.s;
        }
        // ----------------- rendering
        beginReveal() {
            this.n.setShouldBeVisible(true);
        }
        beginHide() {
            this.n.setShouldBeVisible(false);
        }
        render() {
            if (!this.s) {
                return;
            }
            this.s = false;
            this.Q(this.h.getRectangleLargeSize(), this.h.getRectangleSmallSize());
            this.R(this.h.getSliderSize(), this.h.getArrowSize() + this.h.getSliderPosition());
        }
        // ----------------- DOM events
        M(e) {
            if (e.target !== this.domNode.domNode) {
                return;
            }
            this.N(e);
        }
        delegatePointerDown(e) {
            const domTop = this.domNode.domNode.getClientRects()[0].top;
            const sliderStart = domTop + this.h.getSliderPosition();
            const sliderStop = domTop + this.h.getSliderPosition() + this.h.getSliderSize();
            const pointerPos = this.U(e);
            if (sliderStart <= pointerPos && pointerPos <= sliderStop) {
                // Act as if it was a pointer down on the slider
                if (e.button === 0) {
                    e.preventDefault();
                    this.O(e);
                }
            }
            else {
                // Act as if it was a pointer down on the scrollbar
                this.N(e);
            }
        }
        N(e) {
            let offsetX;
            let offsetY;
            if (e.target === this.domNode.domNode && typeof e.offsetX === 'number' && typeof e.offsetY === 'number') {
                offsetX = e.offsetX;
                offsetY = e.offsetY;
            }
            else {
                const domNodePosition = dom.$FO(this.domNode.domNode);
                offsetX = e.pageX - domNodePosition.left;
                offsetY = e.pageY - domNodePosition.top;
            }
            const offset = this.S(offsetX, offsetY);
            this.P(this.c
                ? this.h.getDesiredScrollPositionFromOffsetPaged(offset)
                : this.h.getDesiredScrollPositionFromOffset(offset));
            if (e.button === 0) {
                // left button
                e.preventDefault();
                this.O(e);
            }
        }
        O(e) {
            if (!e.target || !(e.target instanceof Element)) {
                return;
            }
            const initialPointerPosition = this.U(e);
            const initialPointerOrthogonalPosition = this.W(e);
            const initialScrollbarState = this.h.clone();
            this.slider.toggleClassName('active', true);
            this.r.startMonitoring(e.target, e.pointerId, e.buttons, (pointerMoveData) => {
                const pointerOrthogonalPosition = this.W(pointerMoveData);
                const pointerOrthogonalDelta = Math.abs(pointerOrthogonalPosition - initialPointerOrthogonalPosition);
                if (platform.$i && pointerOrthogonalDelta > POINTER_DRAG_RESET_DISTANCE) {
                    // The pointer has wondered away from the scrollbar => reset dragging
                    this.P(initialScrollbarState.getScrollPosition());
                    return;
                }
                const pointerPosition = this.U(pointerMoveData);
                const pointerDelta = pointerPosition - initialPointerPosition;
                this.P(initialScrollbarState.getDesiredScrollPositionFromDelta(pointerDelta));
            }, () => {
                this.slider.toggleClassName('active', false);
                this.a.onDragEnd();
            });
            this.a.onDragStart();
        }
        P(_desiredScrollPosition) {
            const desiredScrollPosition = {};
            this.writeScrollPosition(desiredScrollPosition, _desiredScrollPosition);
            this.b.setScrollPositionNow(desiredScrollPosition);
        }
        updateScrollbarSize(scrollbarSize) {
            this.X(scrollbarSize);
            this.h.setScrollbarSize(scrollbarSize);
            this.s = true;
            if (!this.g) {
                this.render();
            }
        }
        isNeeded() {
            return this.h.isNeeded();
        }
    }
    exports.$NP = $NP;
});
//# sourceMappingURL=abstractScrollbar.js.map