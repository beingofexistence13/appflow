/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/mouseEvent", "vs/base/browser/ui/scrollbar/abstractScrollbar", "vs/base/browser/ui/scrollbar/scrollbarArrow", "vs/base/browser/ui/scrollbar/scrollbarState", "vs/base/common/codicons"], function (require, exports, mouseEvent_1, abstractScrollbar_1, scrollbarArrow_1, scrollbarState_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OP = void 0;
    class $OP extends abstractScrollbar_1.$NP {
        constructor(scrollable, options, host) {
            const scrollDimensions = scrollable.getScrollDimensions();
            const scrollPosition = scrollable.getCurrentScrollPosition();
            super({
                lazyRender: options.lazyRender,
                host: host,
                scrollbarState: new scrollbarState_1.$LP((options.horizontalHasArrows ? options.arrowSize : 0), (options.horizontal === 2 /* ScrollbarVisibility.Hidden */ ? 0 : options.horizontalScrollbarSize), (options.vertical === 2 /* ScrollbarVisibility.Hidden */ ? 0 : options.verticalScrollbarSize), scrollDimensions.width, scrollDimensions.scrollWidth, scrollPosition.scrollLeft),
                visibility: options.horizontal,
                extraScrollbarClassName: 'horizontal',
                scrollable: scrollable,
                scrollByPage: options.scrollByPage
            });
            if (options.horizontalHasArrows) {
                const arrowDelta = (options.arrowSize - scrollbarArrow_1.$JP) / 2;
                const scrollbarDelta = (options.horizontalScrollbarSize - scrollbarArrow_1.$JP) / 2;
                this.t({
                    className: 'scra',
                    icon: codicons_1.$Pj.scrollbarButtonLeft,
                    top: scrollbarDelta,
                    left: arrowDelta,
                    bottom: undefined,
                    right: undefined,
                    bgWidth: options.arrowSize,
                    bgHeight: options.horizontalScrollbarSize,
                    onActivate: () => this.a.onMouseWheel(new mouseEvent_1.$gO(null, 1, 0)),
                });
                this.t({
                    className: 'scra',
                    icon: codicons_1.$Pj.scrollbarButtonRight,
                    top: scrollbarDelta,
                    left: undefined,
                    bottom: undefined,
                    right: arrowDelta,
                    bgWidth: options.arrowSize,
                    bgHeight: options.horizontalScrollbarSize,
                    onActivate: () => this.a.onMouseWheel(new mouseEvent_1.$gO(null, -1, 0)),
                });
            }
            this.w(Math.floor((options.horizontalScrollbarSize - options.horizontalSliderSize) / 2), 0, undefined, options.horizontalSliderSize);
        }
        R(sliderSize, sliderPosition) {
            this.slider.setWidth(sliderSize);
            this.slider.setLeft(sliderPosition);
        }
        Q(largeSize, smallSize) {
            this.domNode.setWidth(largeSize);
            this.domNode.setHeight(smallSize);
            this.domNode.setLeft(0);
            this.domNode.setBottom(0);
        }
        onDidScroll(e) {
            this.s = this.J(e.scrollWidth) || this.s;
            this.s = this.L(e.scrollLeft) || this.s;
            this.s = this.y(e.width) || this.s;
            return this.s;
        }
        S(offsetX, offsetY) {
            return offsetX;
        }
        U(e) {
            return e.pageX;
        }
        W(e) {
            return e.pageY;
        }
        X(size) {
            this.slider.setHeight(size);
        }
        writeScrollPosition(target, scrollPosition) {
            target.scrollLeft = scrollPosition;
        }
        updateOptions(options) {
            this.updateScrollbarSize(options.horizontal === 2 /* ScrollbarVisibility.Hidden */ ? 0 : options.horizontalScrollbarSize);
            this.h.setOppositeScrollbarSize(options.vertical === 2 /* ScrollbarVisibility.Hidden */ ? 0 : options.verticalScrollbarSize);
            this.n.setVisibility(options.horizontal);
            this.c = options.scrollByPage;
        }
    }
    exports.$OP = $OP;
});
//# sourceMappingURL=horizontalScrollbar.js.map