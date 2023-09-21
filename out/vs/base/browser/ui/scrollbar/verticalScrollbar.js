/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/mouseEvent", "vs/base/browser/ui/scrollbar/abstractScrollbar", "vs/base/browser/ui/scrollbar/scrollbarArrow", "vs/base/browser/ui/scrollbar/scrollbarState", "vs/base/common/codicons"], function (require, exports, mouseEvent_1, abstractScrollbar_1, scrollbarArrow_1, scrollbarState_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VerticalScrollbar = void 0;
    class VerticalScrollbar extends abstractScrollbar_1.AbstractScrollbar {
        constructor(scrollable, options, host) {
            const scrollDimensions = scrollable.getScrollDimensions();
            const scrollPosition = scrollable.getCurrentScrollPosition();
            super({
                lazyRender: options.lazyRender,
                host: host,
                scrollbarState: new scrollbarState_1.ScrollbarState((options.verticalHasArrows ? options.arrowSize : 0), (options.vertical === 2 /* ScrollbarVisibility.Hidden */ ? 0 : options.verticalScrollbarSize), 
                // give priority to vertical scroll bar over horizontal and let it scroll all the way to the bottom
                0, scrollDimensions.height, scrollDimensions.scrollHeight, scrollPosition.scrollTop),
                visibility: options.vertical,
                extraScrollbarClassName: 'vertical',
                scrollable: scrollable,
                scrollByPage: options.scrollByPage
            });
            if (options.verticalHasArrows) {
                const arrowDelta = (options.arrowSize - scrollbarArrow_1.ARROW_IMG_SIZE) / 2;
                const scrollbarDelta = (options.verticalScrollbarSize - scrollbarArrow_1.ARROW_IMG_SIZE) / 2;
                this._createArrow({
                    className: 'scra',
                    icon: codicons_1.Codicon.scrollbarButtonUp,
                    top: arrowDelta,
                    left: scrollbarDelta,
                    bottom: undefined,
                    right: undefined,
                    bgWidth: options.verticalScrollbarSize,
                    bgHeight: options.arrowSize,
                    onActivate: () => this._host.onMouseWheel(new mouseEvent_1.StandardWheelEvent(null, 0, 1)),
                });
                this._createArrow({
                    className: 'scra',
                    icon: codicons_1.Codicon.scrollbarButtonDown,
                    top: undefined,
                    left: scrollbarDelta,
                    bottom: arrowDelta,
                    right: undefined,
                    bgWidth: options.verticalScrollbarSize,
                    bgHeight: options.arrowSize,
                    onActivate: () => this._host.onMouseWheel(new mouseEvent_1.StandardWheelEvent(null, 0, -1)),
                });
            }
            this._createSlider(0, Math.floor((options.verticalScrollbarSize - options.verticalSliderSize) / 2), options.verticalSliderSize, undefined);
        }
        _updateSlider(sliderSize, sliderPosition) {
            this.slider.setHeight(sliderSize);
            this.slider.setTop(sliderPosition);
        }
        _renderDomNode(largeSize, smallSize) {
            this.domNode.setWidth(smallSize);
            this.domNode.setHeight(largeSize);
            this.domNode.setRight(0);
            this.domNode.setTop(0);
        }
        onDidScroll(e) {
            this._shouldRender = this._onElementScrollSize(e.scrollHeight) || this._shouldRender;
            this._shouldRender = this._onElementScrollPosition(e.scrollTop) || this._shouldRender;
            this._shouldRender = this._onElementSize(e.height) || this._shouldRender;
            return this._shouldRender;
        }
        _pointerDownRelativePosition(offsetX, offsetY) {
            return offsetY;
        }
        _sliderPointerPosition(e) {
            return e.pageY;
        }
        _sliderOrthogonalPointerPosition(e) {
            return e.pageX;
        }
        _updateScrollbarSize(size) {
            this.slider.setWidth(size);
        }
        writeScrollPosition(target, scrollPosition) {
            target.scrollTop = scrollPosition;
        }
        updateOptions(options) {
            this.updateScrollbarSize(options.vertical === 2 /* ScrollbarVisibility.Hidden */ ? 0 : options.verticalScrollbarSize);
            // give priority to vertical scroll bar over horizontal and let it scroll all the way to the bottom
            this._scrollbarState.setOppositeScrollbarSize(0);
            this._visibilityController.setVisibility(options.vertical);
            this._scrollByPage = options.scrollByPage;
        }
    }
    exports.VerticalScrollbar = VerticalScrollbar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVydGljYWxTY3JvbGxiYXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvc2Nyb2xsYmFyL3ZlcnRpY2FsU2Nyb2xsYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFhLGlCQUFrQixTQUFRLHFDQUFpQjtRQUV2RCxZQUFZLFVBQXNCLEVBQUUsT0FBeUMsRUFBRSxJQUFtQjtZQUNqRyxNQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzFELE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQzdELEtBQUssQ0FBQztnQkFDTCxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7Z0JBQzlCLElBQUksRUFBRSxJQUFJO2dCQUNWLGNBQWMsRUFBRSxJQUFJLCtCQUFjLENBQ2pDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDbkQsQ0FBQyxPQUFPLENBQUMsUUFBUSx1Q0FBK0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUM7Z0JBQ3JGLG1HQUFtRztnQkFDbkcsQ0FBQyxFQUNELGdCQUFnQixDQUFDLE1BQU0sRUFDdkIsZ0JBQWdCLENBQUMsWUFBWSxFQUM3QixjQUFjLENBQUMsU0FBUyxDQUN4QjtnQkFDRCxVQUFVLEVBQUUsT0FBTyxDQUFDLFFBQVE7Z0JBQzVCLHVCQUF1QixFQUFFLFVBQVU7Z0JBQ25DLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7YUFDbEMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzlCLE1BQU0sVUFB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