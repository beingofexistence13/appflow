/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/scrollable", "vs/editor/common/viewLayout/linesLayout", "vs/editor/common/viewModel", "vs/editor/common/viewModelEventDispatcher"], function (require, exports, event_1, lifecycle_1, scrollable_1, linesLayout_1, viewModel_1, viewModelEventDispatcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iY = void 0;
    const SMOOTH_SCROLLING_TIME = 125;
    class EditorScrollDimensions {
        constructor(width, contentWidth, height, contentHeight) {
            width = width | 0;
            contentWidth = contentWidth | 0;
            height = height | 0;
            contentHeight = contentHeight | 0;
            if (width < 0) {
                width = 0;
            }
            if (contentWidth < 0) {
                contentWidth = 0;
            }
            if (height < 0) {
                height = 0;
            }
            if (contentHeight < 0) {
                contentHeight = 0;
            }
            this.width = width;
            this.contentWidth = contentWidth;
            this.scrollWidth = Math.max(width, contentWidth);
            this.height = height;
            this.contentHeight = contentHeight;
            this.scrollHeight = Math.max(height, contentHeight);
        }
        equals(other) {
            return (this.width === other.width
                && this.contentWidth === other.contentWidth
                && this.height === other.height
                && this.contentHeight === other.contentHeight);
        }
    }
    class EditorScrollable extends lifecycle_1.$kc {
        constructor(smoothScrollDuration, scheduleAtNextAnimationFrame) {
            super();
            this.c = this.B(new event_1.$fd());
            this.onDidContentSizeChange = this.c.event;
            this.b = new EditorScrollDimensions(0, 0, 0, 0);
            this.a = this.B(new scrollable_1.$Nr({
                forceIntegerValues: true,
                smoothScrollDuration,
                scheduleAtNextAnimationFrame
            }));
            this.onDidScroll = this.a.onScroll;
        }
        getScrollable() {
            return this.a;
        }
        setSmoothScrollDuration(smoothScrollDuration) {
            this.a.setSmoothScrollDuration(smoothScrollDuration);
        }
        validateScrollPosition(scrollPosition) {
            return this.a.validateScrollPosition(scrollPosition);
        }
        getScrollDimensions() {
            return this.b;
        }
        setScrollDimensions(dimensions) {
            if (this.b.equals(dimensions)) {
                return;
            }
            const oldDimensions = this.b;
            this.b = dimensions;
            this.a.setScrollDimensions({
                width: dimensions.width,
                scrollWidth: dimensions.scrollWidth,
                height: dimensions.height,
                scrollHeight: dimensions.scrollHeight
            }, true);
            const contentWidthChanged = (oldDimensions.contentWidth !== dimensions.contentWidth);
            const contentHeightChanged = (oldDimensions.contentHeight !== dimensions.contentHeight);
            if (contentWidthChanged || contentHeightChanged) {
                this.c.fire(new viewModelEventDispatcher_1.$1X(oldDimensions.contentWidth, oldDimensions.contentHeight, dimensions.contentWidth, dimensions.contentHeight));
            }
        }
        getFutureScrollPosition() {
            return this.a.getFutureScrollPosition();
        }
        getCurrentScrollPosition() {
            return this.a.getCurrentScrollPosition();
        }
        setScrollPositionNow(update) {
            this.a.setScrollPositionNow(update);
        }
        setScrollPositionSmooth(update) {
            this.a.setScrollPositionSmooth(update);
        }
        hasPendingScrollAnimation() {
            return this.a.hasPendingScrollAnimation();
        }
    }
    class $iY extends lifecycle_1.$kc {
        constructor(configuration, lineCount, scheduleAtNextAnimationFrame) {
            super();
            this.a = configuration;
            const options = this.a.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const padding = options.get(83 /* EditorOption.padding */);
            this.b = new linesLayout_1.$hY(lineCount, options.get(66 /* EditorOption.lineHeight */), padding.top, padding.bottom);
            this.c = 0;
            this.f = 0;
            this.g = this.B(new EditorScrollable(0, scheduleAtNextAnimationFrame));
            this.h();
            this.g.setScrollDimensions(new EditorScrollDimensions(layoutInfo.contentWidth, 0, layoutInfo.height, 0));
            this.onDidScroll = this.g.onDidScroll;
            this.onDidContentSizeChange = this.g.onDidContentSizeChange;
            this.n();
        }
        dispose() {
            super.dispose();
        }
        getScrollable() {
            return this.g.getScrollable();
        }
        onHeightMaybeChanged() {
            this.n();
        }
        h() {
            this.g.setSmoothScrollDuration(this.a.options.get(113 /* EditorOption.smoothScrolling */) ? SMOOTH_SCROLLING_TIME : 0);
        }
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            const options = this.a.options;
            if (e.hasChanged(66 /* EditorOption.lineHeight */)) {
                this.b.setLineHeight(options.get(66 /* EditorOption.lineHeight */));
            }
            if (e.hasChanged(83 /* EditorOption.padding */)) {
                const padding = options.get(83 /* EditorOption.padding */);
                this.b.setPadding(padding.top, padding.bottom);
            }
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
                const width = layoutInfo.contentWidth;
                const height = layoutInfo.height;
                const scrollDimensions = this.g.getScrollDimensions();
                const contentWidth = scrollDimensions.contentWidth;
                this.g.setScrollDimensions(new EditorScrollDimensions(width, scrollDimensions.contentWidth, height, this.m(width, height, contentWidth)));
            }
            else {
                this.n();
            }
            if (e.hasChanged(113 /* EditorOption.smoothScrolling */)) {
                this.h();
            }
        }
        onFlushed(lineCount) {
            this.b.onFlushed(lineCount);
        }
        onLinesDeleted(fromLineNumber, toLineNumber) {
            this.b.onLinesDeleted(fromLineNumber, toLineNumber);
        }
        onLinesInserted(fromLineNumber, toLineNumber) {
            this.b.onLinesInserted(fromLineNumber, toLineNumber);
        }
        // ---- end view event handlers
        j(width, scrollWidth) {
            const options = this.a.options;
            const scrollbar = options.get(102 /* EditorOption.scrollbar */);
            if (scrollbar.horizontal === 2 /* ScrollbarVisibility.Hidden */) {
                // horizontal scrollbar not visible
                return 0;
            }
            if (width >= scrollWidth) {
                // horizontal scrollbar not visible
                return 0;
            }
            return scrollbar.horizontalScrollbarSize;
        }
        m(width, height, contentWidth) {
            const options = this.a.options;
            let result = this.b.getLinesTotalHeight();
            if (options.get(104 /* EditorOption.scrollBeyondLastLine */)) {
                result += Math.max(0, height - options.get(66 /* EditorOption.lineHeight */) - options.get(83 /* EditorOption.padding */).bottom);
            }
            else {
                result += this.j(width, contentWidth);
            }
            return result;
        }
        n() {
            const scrollDimensions = this.g.getScrollDimensions();
            const width = scrollDimensions.width;
            const height = scrollDimensions.height;
            const contentWidth = scrollDimensions.contentWidth;
            this.g.setScrollDimensions(new EditorScrollDimensions(width, scrollDimensions.contentWidth, height, this.m(width, height, contentWidth)));
        }
        // ---- Layouting logic
        getCurrentViewport() {
            const scrollDimensions = this.g.getScrollDimensions();
            const currentScrollPosition = this.g.getCurrentScrollPosition();
            return new viewModel_1.$0U(currentScrollPosition.scrollTop, currentScrollPosition.scrollLeft, scrollDimensions.width, scrollDimensions.height);
        }
        getFutureViewport() {
            const scrollDimensions = this.g.getScrollDimensions();
            const currentScrollPosition = this.g.getFutureScrollPosition();
            return new viewModel_1.$0U(currentScrollPosition.scrollTop, currentScrollPosition.scrollLeft, scrollDimensions.width, scrollDimensions.height);
        }
        r() {
            const options = this.a.options;
            const maxLineWidth = this.c;
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            if (wrappingInfo.isViewportWrapping) {
                const minimap = options.get(72 /* EditorOption.minimap */);
                if (maxLineWidth > layoutInfo.contentWidth + fontInfo.typicalHalfwidthCharacterWidth) {
                    // This is a case where viewport wrapping is on, but the line extends above the viewport
                    if (minimap.enabled && minimap.side === 'right') {
                        // We need to accomodate the scrollbar width
                        return maxLineWidth + layoutInfo.verticalScrollbarWidth;
                    }
                }
                return maxLineWidth;
            }
            else {
                const extraHorizontalSpace = options.get(103 /* EditorOption.scrollBeyondLastColumn */) * fontInfo.typicalHalfwidthCharacterWidth;
                const whitespaceMinWidth = this.b.getWhitespaceMinWidth();
                return Math.max(maxLineWidth + extraHorizontalSpace + layoutInfo.verticalScrollbarWidth, whitespaceMinWidth, this.f);
            }
        }
        setMaxLineWidth(maxLineWidth) {
            this.c = maxLineWidth;
            this.s();
        }
        setOverlayWidgetsMinWidth(maxMinWidth) {
            this.f = maxMinWidth;
            this.s();
        }
        s() {
            const scrollDimensions = this.g.getScrollDimensions();
            this.g.setScrollDimensions(new EditorScrollDimensions(scrollDimensions.width, this.r(), scrollDimensions.height, scrollDimensions.contentHeight));
            // The height might depend on the fact that there is a horizontal scrollbar or not
            this.n();
        }
        // ---- view state
        saveState() {
            const currentScrollPosition = this.g.getFutureScrollPosition();
            const scrollTop = currentScrollPosition.scrollTop;
            const firstLineNumberInViewport = this.b.getLineNumberAtOrAfterVerticalOffset(scrollTop);
            const whitespaceAboveFirstLine = this.b.getWhitespaceAccumulatedHeightBeforeLineNumber(firstLineNumberInViewport);
            return {
                scrollTop: scrollTop,
                scrollTopWithoutViewZones: scrollTop - whitespaceAboveFirstLine,
                scrollLeft: currentScrollPosition.scrollLeft
            };
        }
        // ----
        changeWhitespace(callback) {
            const hadAChange = this.b.changeWhitespace(callback);
            if (hadAChange) {
                this.onHeightMaybeChanged();
            }
            return hadAChange;
        }
        getVerticalOffsetForLineNumber(lineNumber, includeViewZones = false) {
            return this.b.getVerticalOffsetForLineNumber(lineNumber, includeViewZones);
        }
        getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones = false) {
            return this.b.getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones);
        }
        isAfterLines(verticalOffset) {
            return this.b.isAfterLines(verticalOffset);
        }
        isInTopPadding(verticalOffset) {
            return this.b.isInTopPadding(verticalOffset);
        }
        isInBottomPadding(verticalOffset) {
            return this.b.isInBottomPadding(verticalOffset);
        }
        getLineNumberAtVerticalOffset(verticalOffset) {
            return this.b.getLineNumberAtOrAfterVerticalOffset(verticalOffset);
        }
        getWhitespaceAtVerticalOffset(verticalOffset) {
            return this.b.getWhitespaceAtVerticalOffset(verticalOffset);
        }
        getLinesViewportData() {
            const visibleBox = this.getCurrentViewport();
            return this.b.getLinesViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
        }
        getLinesViewportDataAtScrollTop(scrollTop) {
            // do some minimal validations on scrollTop
            const scrollDimensions = this.g.getScrollDimensions();
            if (scrollTop + scrollDimensions.height > scrollDimensions.scrollHeight) {
                scrollTop = scrollDimensions.scrollHeight - scrollDimensions.height;
            }
            if (scrollTop < 0) {
                scrollTop = 0;
            }
            return this.b.getLinesViewportData(scrollTop, scrollTop + scrollDimensions.height);
        }
        getWhitespaceViewportData() {
            const visibleBox = this.getCurrentViewport();
            return this.b.getWhitespaceViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
        }
        getWhitespaces() {
            return this.b.getWhitespaces();
        }
        // ----
        getContentWidth() {
            const scrollDimensions = this.g.getScrollDimensions();
            return scrollDimensions.contentWidth;
        }
        getScrollWidth() {
            const scrollDimensions = this.g.getScrollDimensions();
            return scrollDimensions.scrollWidth;
        }
        getContentHeight() {
            const scrollDimensions = this.g.getScrollDimensions();
            return scrollDimensions.contentHeight;
        }
        getScrollHeight() {
            const scrollDimensions = this.g.getScrollDimensions();
            return scrollDimensions.scrollHeight;
        }
        getCurrentScrollLeft() {
            const currentScrollPosition = this.g.getCurrentScrollPosition();
            return currentScrollPosition.scrollLeft;
        }
        getCurrentScrollTop() {
            const currentScrollPosition = this.g.getCurrentScrollPosition();
            return currentScrollPosition.scrollTop;
        }
        validateScrollPosition(scrollPosition) {
            return this.g.validateScrollPosition(scrollPosition);
        }
        setScrollPosition(position, type) {
            if (type === 1 /* ScrollType.Immediate */) {
                this.g.setScrollPositionNow(position);
            }
            else {
                this.g.setScrollPositionSmooth(position);
            }
        }
        hasPendingScrollAnimation() {
            return this.g.hasPendingScrollAnimation();
        }
        deltaScrollNow(deltaScrollLeft, deltaScrollTop) {
            const currentScrollPosition = this.g.getCurrentScrollPosition();
            this.g.setScrollPositionNow({
                scrollLeft: currentScrollPosition.scrollLeft + deltaScrollLeft,
                scrollTop: currentScrollPosition.scrollTop + deltaScrollTop
            });
        }
    }
    exports.$iY = $iY;
});
//# sourceMappingURL=viewLayout.js.map