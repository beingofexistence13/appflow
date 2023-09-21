/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/mouseEvent", "vs/base/browser/ui/scrollbar/abstractScrollbar", "vs/base/browser/ui/scrollbar/scrollbarArrow", "vs/base/browser/ui/scrollbar/scrollbarState", "vs/base/common/codicons"], function (require, exports, mouseEvent_1, abstractScrollbar_1, scrollbarArrow_1, scrollbarState_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PP = void 0;
    class $PP extends abstractScrollbar_1.$NP {
        constructor(scrollable, options, host) {
            const scrollDimensions = scrollable.getScrollDimensions();
            const scrollPosition = scrollable.getCurrentScrollPosition();
            super({
                lazyRender: options.lazyRender,
                host: host,
                scrollbarState: new scrollbarState_1.$LP((options.verticalHasArrows ? options.arrowSize : 0), (options.vertical === 2 /* ScrollbarVisibility.Hidden */ ? 0 : options.verticalScrollbarSize), 
                // give priority to vertical scroll bar over horizontal and let it scroll all the way to the bottom
                0, scrollDimensions.height, scrollDimensions.scrollHeight, scrollPosition.scrollTop),
                visibility: options.vertical,
                extraScrollbarClassName: 'vertical',
                scrollable: scrollable,
                scrollByPage: options.scrollByPage
            });
            if (options.verticalHasArrows) {
                const arrowDelta = (options.arrowSize - scrollbarArrow_1.$JP) / 2;
                const scrollbarDelta = (options.verticalScrollbarSize - scrollbarArrow_1.$JP) / 2;
                this.t({
                    className: 'scra',
                    icon: codicons_1.$Pj.scrollbarButtonUp,
                    top: arrowDelta,
                    left: scrollbarDelta,
                    bottom: undefined,
                    right: undefined,
                    bgWidth: options.verticalScrollbarSize,
                    bgHeight: options.arrowSize,
                    onActivate: () => this.a.onMouseWheel(new mouseEvent_1.$gO(null, 0, 1)),
                });
                this.t({
                    className: 'scra',
                    icon: codicons_1.$Pj.scrollbarButtonDown,
                    top: undefined,
                    left: scrollbarDelta,
                    bottom: arrowDelta,
                    right: undefined,
                    bgWidth: options.verticalScrollbarSize,
                    bgHeight: options.arrowSize,
                    onActivate: () => this.a.onMouseWheel(new mouseEvent_1.$gO(null, 0, -1)),
                });
            }
            this.w(0, Math.floor((options.verticalScrollbarSize - options.verticalSliderSize) / 2), options.verticalSliderSize, undefined);
        }
        R(sliderSize, sliderPosition) {
            this.slider.setHeight(sliderSize);
            this.slider.setTop(sliderPosition);
        }
        Q(largeSize, smallSize) {
            this.domNode.setWidth(smallSize);
            this.domNode.setHeight(largeSize);
            this.domNode.setRight(0);
            this.domNode.setTop(0);
        }
        onDidScroll(e) {
            this.s = this.J(e.scrollHeight) || this.s;
            this.s = this.L(e.scrollTop) || this.s;
            this.s = this.y(e.height) || this.s;
            return this.s;
        }
        S(offsetX, offsetY) {
            return offsetY;
        }
        U(e) {
            return e.pageY;
        }
        W(e) {
            return e.pageX;
        }
        X(size) {
            this.slider.setWidth(size);
        }
        writeScrollPosition(target, scrollPosition) {
            target.scrollTop = scrollPosition;
        }
        updateOptions(options) {
            this.updateScrollbarSize(options.vertical === 2 /* ScrollbarVisibility.Hidden */ ? 0 : options.verticalScrollbarSize);
            // give priority to vertical scroll bar over horizontal and let it scroll all the way to the bottom
            this.h.setOppositeScrollbarSize(0);
            this.n.setVisibility(options.vertical);
            this.c = options.scrollByPage;
        }
    }
    exports.$PP = $PP;
});
//# sourceMappingURL=verticalScrollbar.js.map