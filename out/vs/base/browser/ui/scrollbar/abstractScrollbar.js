/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/globalPointerMoveMonitor", "vs/base/browser/ui/scrollbar/scrollbarArrow", "vs/base/browser/ui/scrollbar/scrollbarVisibilityController", "vs/base/browser/ui/widget", "vs/base/common/platform"], function (require, exports, dom, fastDomNode_1, globalPointerMoveMonitor_1, scrollbarArrow_1, scrollbarVisibilityController_1, widget_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractScrollbar = void 0;
    /**
     * The orthogonal distance to the slider at which dragging "resets". This implements "snapping"
     */
    const POINTER_DRAG_RESET_DISTANCE = 140;
    class AbstractScrollbar extends widget_1.Widget {
        constructor(opts) {
            super();
            this._lazyRender = opts.lazyRender;
            this._host = opts.host;
            this._scrollable = opts.scrollable;
            this._scrollByPage = opts.scrollByPage;
            this._scrollbarState = opts.scrollbarState;
            this._visibilityController = this._register(new scrollbarVisibilityController_1.ScrollbarVisibilityController(opts.visibility, 'visible scrollbar ' + opts.extraScrollbarClassName, 'invisible scrollbar ' + opts.extraScrollbarClassName));
            this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
            this._pointerMoveMonitor = this._register(new globalPointerMoveMonitor_1.GlobalPointerMoveMonitor());
            this._shouldRender = true;
            this.domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this.domNode.setAttribute('role', 'presentation');
            this.domNode.setAttribute('aria-hidden', 'true');
            this._visibilityController.setDomNode(this.domNode);
            this.domNode.setPosition('absolute');
            this._register(dom.addDisposableListener(this.domNode.domNode, dom.EventType.POINTER_DOWN, (e) => this._domNodePointerDown(e)));
        }
        // ----------------- creation
        /**
         * Creates the dom node for an arrow & adds it to the container
         */
        _createArrow(opts) {
            const arrow = this._register(new scrollbarArrow_1.ScrollbarArrow(opts));
            this.domNode.domNode.appendChild(arrow.bgDomNode);
            this.domNode.domNode.appendChild(arrow.domNode);
        }
        /**
         * Creates the slider dom node, adds it to the container & hooks up the events
         */
        _createSlider(top, left, width, height) {
            this.slider = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
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
            this._register(dom.addDisposableListener(this.slider.domNode, dom.EventType.POINTER_DOWN, (e) => {
                if (e.button === 0) {
                    e.preventDefault();
                    this._sliderPointerDown(e);
                }
            }));
            this.onclick(this.slider.domNode, e => {
                if (e.leftButton) {
                    e.stopPropagation();
                }
            });
        }
        // ----------------- Update state
        _onElementSize(visibleSize) {
            if (this._scrollbarState.setVisibleSize(visibleSize)) {
                this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
                this._shouldRender = true;
                if (!this._lazyRender) {
                    this.render();
                }
            }
            return this._shouldRender;
        }
        _onElementScrollSize(elementScrollSize) {
            if (this._scrollbarState.setScrollSize(elementScrollSize)) {
                this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
                this._shouldRender = true;
                if (!this._lazyRender) {
                    this.render();
                }
            }
            return this._shouldRender;
        }
        _onElementScrollPosition(elementScrollPosition) {
            if (this._scrollbarState.setScrollPosition(elementScrollPosition)) {
                this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
                this._shouldRender = true;
                if (!this._lazyRender) {
                    this.render();
                }
            }
            return this._shouldRender;
        }
        // ----------------- rendering
        beginReveal() {
            this._visibilityController.setShouldBeVisible(true);
        }
        beginHide() {
            this._visibilityController.setShouldBeVisible(false);
        }
        render() {
            if (!this._shouldRender) {
                return;
            }
            this._shouldRender = false;
            this._renderDomNode(this._scrollbarState.getRectangleLargeSize(), this._scrollbarState.getRectangleSmallSize());
            this._updateSlider(this._scrollbarState.getSliderSize(), this._scrollbarState.getArrowSize() + this._scrollbarState.getSliderPosition());
        }
        // ----------------- DOM events
        _domNodePointerDown(e) {
            if (e.target !== this.domNode.domNode) {
                return;
            }
            this._onPointerDown(e);
        }
        delegatePointerDown(e) {
            const domTop = this.domNode.domNode.getClientRects()[0].top;
            const sliderStart = domTop + this._scrollbarState.getSliderPosition();
            const sliderStop = domTop + this._scrollbarState.getSliderPosition() + this._scrollbarState.getSliderSize();
            const pointerPos = this._sliderPointerPosition(e);
            if (sliderStart <= pointerPos && pointerPos <= sliderStop) {
                // Act as if it was a pointer down on the slider
                if (e.button === 0) {
                    e.preventDefault();
                    this._sliderPointerDown(e);
                }
            }
            else {
                // Act as if it was a pointer down on the scrollbar
                this._onPointerDown(e);
            }
        }
        _onPointerDown(e) {
            let offsetX;
            let offsetY;
            if (e.target === this.domNode.domNode && typeof e.offsetX === 'number' && typeof e.offsetY === 'number') {
                offsetX = e.offsetX;
                offsetY = e.offsetY;
            }
            else {
                const domNodePosition = dom.getDomNodePagePosition(this.domNode.domNode);
                offsetX = e.pageX - domNodePosition.left;
                offsetY = e.pageY - domNodePosition.top;
            }
            const offset = this._pointerDownRelativePosition(offsetX, offsetY);
            this._setDesiredScrollPositionNow(this._scrollByPage
                ? this._scrollbarState.getDesiredScrollPositionFromOffsetPaged(offset)
                : this._scrollbarState.getDesiredScrollPositionFromOffset(offset));
            if (e.button === 0) {
                // left button
                e.preventDefault();
                this._sliderPointerDown(e);
            }
        }
        _sliderPointerDown(e) {
            if (!e.target || !(e.target instanceof Element)) {
                return;
            }
            const initialPointerPosition = this._sliderPointerPosition(e);
            const initialPointerOrthogonalPosition = this._sliderOrthogonalPointerPosition(e);
            const initialScrollbarState = this._scrollbarState.clone();
            this.slider.toggleClassName('active', true);
            this._pointerMoveMonitor.startMonitoring(e.target, e.pointerId, e.buttons, (pointerMoveData) => {
                const pointerOrthogonalPosition = this._sliderOrthogonalPointerPosition(pointerMoveData);
                const pointerOrthogonalDelta = Math.abs(pointerOrthogonalPosition - initialPointerOrthogonalPosition);
                if (platform.isWindows && pointerOrthogonalDelta > POINTER_DRAG_RESET_DISTANCE) {
                    // The pointer has wondered away from the scrollbar => reset dragging
                    this._setDesiredScrollPositionNow(initialScrollbarState.getScrollPosition());
                    return;
                }
                const pointerPosition = this._sliderPointerPosition(pointerMoveData);
                const pointerDelta = pointerPosition - initialPointerPosition;
                this._setDesiredScrollPositionNow(initialScrollbarState.getDesiredScrollPositionFromDelta(pointerDelta));
            }, () => {
                this.slider.toggleClassName('active', false);
                this._host.onDragEnd();
            });
            this._host.onDragStart();
        }
        _setDesiredScrollPositionNow(_desiredScrollPosition) {
            const desiredScrollPosition = {};
            this.writeScrollPosition(desiredScrollPosition, _desiredScrollPosition);
            this._scrollable.setScrollPositionNow(desiredScrollPosition);
        }
        updateScrollbarSize(scrollbarSize) {
            this._updateScrollbarSize(scrollbarSize);
            this._scrollbarState.setScrollbarSize(scrollbarSize);
            this._shouldRender = true;
            if (!this._lazyRender) {
                this.render();
            }
        }
        isNeeded() {
            return this._scrollbarState.isNeeded();
        }
    }
    exports.AbstractScrollbar = AbstractScrollbar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RTY3JvbGxiYXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvc2Nyb2xsYmFyL2Fic3RyYWN0U2Nyb2xsYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRzs7T0FFRztJQUNILE1BQU0sMkJBQTJCLEdBQUcsR0FBRyxDQUFDO0lBd0J4QyxNQUFzQixpQkFBa0IsU0FBUSxlQUFNO1FBZXJELFlBQVksSUFBOEI7WUFDekMsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNuQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDdkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQzNDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkRBQTZCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztZQUM1TSxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLG1EQUF3QixFQUFFLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUEsK0JBQWlCLEVBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFakQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0ksQ0FBQztRQUVELDZCQUE2QjtRQUU3Qjs7V0FFRztRQUNPLFlBQVksQ0FBQyxJQUEyQjtZQUNqRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksK0JBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRUQ7O1dBRUc7UUFDTyxhQUFhLENBQUMsR0FBVyxFQUFFLElBQVksRUFBRSxLQUF5QixFQUFFLE1BQTBCO1lBQ3ZHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSwrQkFBaUIsRUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUIsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVCO1lBQ0QsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzlCO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUNuQixHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksRUFDMUIsQ0FBQyxDQUFlLEVBQUUsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDbkIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUNuQixJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzNCO1lBQ0YsQ0FBQyxDQUNELENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRTtvQkFDakIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO2lCQUNwQjtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELGlDQUFpQztRQUV2QixjQUFjLENBQUMsV0FBbUI7WUFDM0MsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDckQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3hFLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDdEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNkO2FBQ0Q7WUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVTLG9CQUFvQixDQUFDLGlCQUF5QjtZQUN2RCxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7Z0JBQzFELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztnQkFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDZDthQUNEO1lBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzNCLENBQUM7UUFFUyx3QkFBd0IsQ0FBQyxxQkFBNkI7WUFDL0QsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLEVBQUU7Z0JBQ2xFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztnQkFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDZDthQUNEO1lBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzNCLENBQUM7UUFFRCw4QkFBOEI7UUFFdkIsV0FBVztZQUNqQixJQUFJLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLFNBQVM7WUFDZixJQUFJLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVNLE1BQU07WUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDeEIsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFFM0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFxQixFQUFFLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7WUFDaEgsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDMUksQ0FBQztRQUNELCtCQUErQjtRQUV2QixtQkFBbUIsQ0FBQyxDQUFlO1lBQzFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtnQkFDdEMsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBRU0sbUJBQW1CLENBQUMsQ0FBZTtZQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDNUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN0RSxNQUFNLFVBQVUsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDNUcsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xELElBQUksV0FBVyxJQUFJLFVBQVUsSUFBSSxVQUFVLElBQUksVUFBVSxFQUFFO2dCQUMxRCxnREFBZ0Q7Z0JBQ2hELElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ25CLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDbkIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMzQjthQUNEO2lCQUFNO2dCQUNOLG1EQUFtRDtnQkFDbkQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2QjtRQUNGLENBQUM7UUFFTyxjQUFjLENBQUMsQ0FBZTtZQUNyQyxJQUFJLE9BQWUsQ0FBQztZQUNwQixJQUFJLE9BQWUsQ0FBQztZQUNwQixJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEtBQUssUUFBUSxFQUFFO2dCQUN4RyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7YUFDcEI7aUJBQU07Z0JBQ04sTUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pFLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUM7Z0JBQ3pDLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUM7YUFDeEM7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyw0QkFBNEIsQ0FDaEMsSUFBSSxDQUFDLGFBQWE7Z0JBQ2pCLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHVDQUF1QyxDQUFDLE1BQU0sQ0FBQztnQkFDdEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsa0NBQWtDLENBQUMsTUFBTSxDQUFDLENBQ2xFLENBQUM7WUFFRixJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNuQixjQUFjO2dCQUNkLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNCO1FBQ0YsQ0FBQztRQUVPLGtCQUFrQixDQUFDLENBQWU7WUFDekMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFlBQVksT0FBTyxDQUFDLEVBQUU7Z0JBQ2hELE9BQU87YUFDUDtZQUNELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sZ0NBQWdDLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMzRCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFNUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FDdkMsQ0FBQyxDQUFDLE1BQU0sRUFDUixDQUFDLENBQUMsU0FBUyxFQUNYLENBQUMsQ0FBQyxPQUFPLEVBQ1QsQ0FBQyxlQUE2QixFQUFFLEVBQUU7Z0JBQ2pDLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN6RixNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMseUJBQXlCLEdBQUcsZ0NBQWdDLENBQUMsQ0FBQztnQkFFdEcsSUFBSSxRQUFRLENBQUMsU0FBUyxJQUFJLHNCQUFzQixHQUFHLDJCQUEyQixFQUFFO29CQUMvRSxxRUFBcUU7b0JBQ3JFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7b0JBQzdFLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNyRSxNQUFNLFlBQVksR0FBRyxlQUFlLEdBQUcsc0JBQXNCLENBQUM7Z0JBQzlELElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxxQkFBcUIsQ0FBQyxpQ0FBaUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQzFHLENBQUMsRUFDRCxHQUFHLEVBQUU7Z0JBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3hCLENBQUMsQ0FDRCxDQUFDO1lBRUYsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8sNEJBQTRCLENBQUMsc0JBQThCO1lBRWxFLE1BQU0scUJBQXFCLEdBQXVCLEVBQUUsQ0FBQztZQUNyRCxJQUFJLENBQUMsbUJBQW1CLENBQUMscUJBQXFCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztZQUV4RSxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVNLG1CQUFtQixDQUFDLGFBQXFCO1lBQy9DLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUN0QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDZDtRQUNGLENBQUM7UUFFTSxRQUFRO1lBQ2QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hDLENBQUM7S0FhRDtJQW5RRCw4Q0FtUUMifQ==