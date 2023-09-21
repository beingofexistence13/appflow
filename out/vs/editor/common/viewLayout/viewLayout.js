/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/scrollable", "vs/editor/common/viewLayout/linesLayout", "vs/editor/common/viewModel", "vs/editor/common/viewModelEventDispatcher"], function (require, exports, event_1, lifecycle_1, scrollable_1, linesLayout_1, viewModel_1, viewModelEventDispatcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewLayout = void 0;
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
    class EditorScrollable extends lifecycle_1.Disposable {
        constructor(smoothScrollDuration, scheduleAtNextAnimationFrame) {
            super();
            this._onDidContentSizeChange = this._register(new event_1.Emitter());
            this.onDidContentSizeChange = this._onDidContentSizeChange.event;
            this._dimensions = new EditorScrollDimensions(0, 0, 0, 0);
            this._scrollable = this._register(new scrollable_1.Scrollable({
                forceIntegerValues: true,
                smoothScrollDuration,
                scheduleAtNextAnimationFrame
            }));
            this.onDidScroll = this._scrollable.onScroll;
        }
        getScrollable() {
            return this._scrollable;
        }
        setSmoothScrollDuration(smoothScrollDuration) {
            this._scrollable.setSmoothScrollDuration(smoothScrollDuration);
        }
        validateScrollPosition(scrollPosition) {
            return this._scrollable.validateScrollPosition(scrollPosition);
        }
        getScrollDimensions() {
            return this._dimensions;
        }
        setScrollDimensions(dimensions) {
            if (this._dimensions.equals(dimensions)) {
                return;
            }
            const oldDimensions = this._dimensions;
            this._dimensions = dimensions;
            this._scrollable.setScrollDimensions({
                width: dimensions.width,
                scrollWidth: dimensions.scrollWidth,
                height: dimensions.height,
                scrollHeight: dimensions.scrollHeight
            }, true);
            const contentWidthChanged = (oldDimensions.contentWidth !== dimensions.contentWidth);
            const contentHeightChanged = (oldDimensions.contentHeight !== dimensions.contentHeight);
            if (contentWidthChanged || contentHeightChanged) {
                this._onDidContentSizeChange.fire(new viewModelEventDispatcher_1.ContentSizeChangedEvent(oldDimensions.contentWidth, oldDimensions.contentHeight, dimensions.contentWidth, dimensions.contentHeight));
            }
        }
        getFutureScrollPosition() {
            return this._scrollable.getFutureScrollPosition();
        }
        getCurrentScrollPosition() {
            return this._scrollable.getCurrentScrollPosition();
        }
        setScrollPositionNow(update) {
            this._scrollable.setScrollPositionNow(update);
        }
        setScrollPositionSmooth(update) {
            this._scrollable.setScrollPositionSmooth(update);
        }
        hasPendingScrollAnimation() {
            return this._scrollable.hasPendingScrollAnimation();
        }
    }
    class ViewLayout extends lifecycle_1.Disposable {
        constructor(configuration, lineCount, scheduleAtNextAnimationFrame) {
            super();
            this._configuration = configuration;
            const options = this._configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const padding = options.get(83 /* EditorOption.padding */);
            this._linesLayout = new linesLayout_1.LinesLayout(lineCount, options.get(66 /* EditorOption.lineHeight */), padding.top, padding.bottom);
            this._maxLineWidth = 0;
            this._overlayWidgetsMinWidth = 0;
            this._scrollable = this._register(new EditorScrollable(0, scheduleAtNextAnimationFrame));
            this._configureSmoothScrollDuration();
            this._scrollable.setScrollDimensions(new EditorScrollDimensions(layoutInfo.contentWidth, 0, layoutInfo.height, 0));
            this.onDidScroll = this._scrollable.onDidScroll;
            this.onDidContentSizeChange = this._scrollable.onDidContentSizeChange;
            this._updateHeight();
        }
        dispose() {
            super.dispose();
        }
        getScrollable() {
            return this._scrollable.getScrollable();
        }
        onHeightMaybeChanged() {
            this._updateHeight();
        }
        _configureSmoothScrollDuration() {
            this._scrollable.setSmoothScrollDuration(this._configuration.options.get(113 /* EditorOption.smoothScrolling */) ? SMOOTH_SCROLLING_TIME : 0);
        }
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            const options = this._configuration.options;
            if (e.hasChanged(66 /* EditorOption.lineHeight */)) {
                this._linesLayout.setLineHeight(options.get(66 /* EditorOption.lineHeight */));
            }
            if (e.hasChanged(83 /* EditorOption.padding */)) {
                const padding = options.get(83 /* EditorOption.padding */);
                this._linesLayout.setPadding(padding.top, padding.bottom);
            }
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
                const width = layoutInfo.contentWidth;
                const height = layoutInfo.height;
                const scrollDimensions = this._scrollable.getScrollDimensions();
                const contentWidth = scrollDimensions.contentWidth;
                this._scrollable.setScrollDimensions(new EditorScrollDimensions(width, scrollDimensions.contentWidth, height, this._getContentHeight(width, height, contentWidth)));
            }
            else {
                this._updateHeight();
            }
            if (e.hasChanged(113 /* EditorOption.smoothScrolling */)) {
                this._configureSmoothScrollDuration();
            }
        }
        onFlushed(lineCount) {
            this._linesLayout.onFlushed(lineCount);
        }
        onLinesDeleted(fromLineNumber, toLineNumber) {
            this._linesLayout.onLinesDeleted(fromLineNumber, toLineNumber);
        }
        onLinesInserted(fromLineNumber, toLineNumber) {
            this._linesLayout.onLinesInserted(fromLineNumber, toLineNumber);
        }
        // ---- end view event handlers
        _getHorizontalScrollbarHeight(width, scrollWidth) {
            const options = this._configuration.options;
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
        _getContentHeight(width, height, contentWidth) {
            const options = this._configuration.options;
            let result = this._linesLayout.getLinesTotalHeight();
            if (options.get(104 /* EditorOption.scrollBeyondLastLine */)) {
                result += Math.max(0, height - options.get(66 /* EditorOption.lineHeight */) - options.get(83 /* EditorOption.padding */).bottom);
            }
            else {
                result += this._getHorizontalScrollbarHeight(width, contentWidth);
            }
            return result;
        }
        _updateHeight() {
            const scrollDimensions = this._scrollable.getScrollDimensions();
            const width = scrollDimensions.width;
            const height = scrollDimensions.height;
            const contentWidth = scrollDimensions.contentWidth;
            this._scrollable.setScrollDimensions(new EditorScrollDimensions(width, scrollDimensions.contentWidth, height, this._getContentHeight(width, height, contentWidth)));
        }
        // ---- Layouting logic
        getCurrentViewport() {
            const scrollDimensions = this._scrollable.getScrollDimensions();
            const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
            return new viewModel_1.Viewport(currentScrollPosition.scrollTop, currentScrollPosition.scrollLeft, scrollDimensions.width, scrollDimensions.height);
        }
        getFutureViewport() {
            const scrollDimensions = this._scrollable.getScrollDimensions();
            const currentScrollPosition = this._scrollable.getFutureScrollPosition();
            return new viewModel_1.Viewport(currentScrollPosition.scrollTop, currentScrollPosition.scrollLeft, scrollDimensions.width, scrollDimensions.height);
        }
        _computeContentWidth() {
            const options = this._configuration.options;
            const maxLineWidth = this._maxLineWidth;
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
                const whitespaceMinWidth = this._linesLayout.getWhitespaceMinWidth();
                return Math.max(maxLineWidth + extraHorizontalSpace + layoutInfo.verticalScrollbarWidth, whitespaceMinWidth, this._overlayWidgetsMinWidth);
            }
        }
        setMaxLineWidth(maxLineWidth) {
            this._maxLineWidth = maxLineWidth;
            this._updateContentWidth();
        }
        setOverlayWidgetsMinWidth(maxMinWidth) {
            this._overlayWidgetsMinWidth = maxMinWidth;
            this._updateContentWidth();
        }
        _updateContentWidth() {
            const scrollDimensions = this._scrollable.getScrollDimensions();
            this._scrollable.setScrollDimensions(new EditorScrollDimensions(scrollDimensions.width, this._computeContentWidth(), scrollDimensions.height, scrollDimensions.contentHeight));
            // The height might depend on the fact that there is a horizontal scrollbar or not
            this._updateHeight();
        }
        // ---- view state
        saveState() {
            const currentScrollPosition = this._scrollable.getFutureScrollPosition();
            const scrollTop = currentScrollPosition.scrollTop;
            const firstLineNumberInViewport = this._linesLayout.getLineNumberAtOrAfterVerticalOffset(scrollTop);
            const whitespaceAboveFirstLine = this._linesLayout.getWhitespaceAccumulatedHeightBeforeLineNumber(firstLineNumberInViewport);
            return {
                scrollTop: scrollTop,
                scrollTopWithoutViewZones: scrollTop - whitespaceAboveFirstLine,
                scrollLeft: currentScrollPosition.scrollLeft
            };
        }
        // ----
        changeWhitespace(callback) {
            const hadAChange = this._linesLayout.changeWhitespace(callback);
            if (hadAChange) {
                this.onHeightMaybeChanged();
            }
            return hadAChange;
        }
        getVerticalOffsetForLineNumber(lineNumber, includeViewZones = false) {
            return this._linesLayout.getVerticalOffsetForLineNumber(lineNumber, includeViewZones);
        }
        getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones = false) {
            return this._linesLayout.getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones);
        }
        isAfterLines(verticalOffset) {
            return this._linesLayout.isAfterLines(verticalOffset);
        }
        isInTopPadding(verticalOffset) {
            return this._linesLayout.isInTopPadding(verticalOffset);
        }
        isInBottomPadding(verticalOffset) {
            return this._linesLayout.isInBottomPadding(verticalOffset);
        }
        getLineNumberAtVerticalOffset(verticalOffset) {
            return this._linesLayout.getLineNumberAtOrAfterVerticalOffset(verticalOffset);
        }
        getWhitespaceAtVerticalOffset(verticalOffset) {
            return this._linesLayout.getWhitespaceAtVerticalOffset(verticalOffset);
        }
        getLinesViewportData() {
            const visibleBox = this.getCurrentViewport();
            return this._linesLayout.getLinesViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
        }
        getLinesViewportDataAtScrollTop(scrollTop) {
            // do some minimal validations on scrollTop
            const scrollDimensions = this._scrollable.getScrollDimensions();
            if (scrollTop + scrollDimensions.height > scrollDimensions.scrollHeight) {
                scrollTop = scrollDimensions.scrollHeight - scrollDimensions.height;
            }
            if (scrollTop < 0) {
                scrollTop = 0;
            }
            return this._linesLayout.getLinesViewportData(scrollTop, scrollTop + scrollDimensions.height);
        }
        getWhitespaceViewportData() {
            const visibleBox = this.getCurrentViewport();
            return this._linesLayout.getWhitespaceViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
        }
        getWhitespaces() {
            return this._linesLayout.getWhitespaces();
        }
        // ----
        getContentWidth() {
            const scrollDimensions = this._scrollable.getScrollDimensions();
            return scrollDimensions.contentWidth;
        }
        getScrollWidth() {
            const scrollDimensions = this._scrollable.getScrollDimensions();
            return scrollDimensions.scrollWidth;
        }
        getContentHeight() {
            const scrollDimensions = this._scrollable.getScrollDimensions();
            return scrollDimensions.contentHeight;
        }
        getScrollHeight() {
            const scrollDimensions = this._scrollable.getScrollDimensions();
            return scrollDimensions.scrollHeight;
        }
        getCurrentScrollLeft() {
            const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
            return currentScrollPosition.scrollLeft;
        }
        getCurrentScrollTop() {
            const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
            return currentScrollPosition.scrollTop;
        }
        validateScrollPosition(scrollPosition) {
            return this._scrollable.validateScrollPosition(scrollPosition);
        }
        setScrollPosition(position, type) {
            if (type === 1 /* ScrollType.Immediate */) {
                this._scrollable.setScrollPositionNow(position);
            }
            else {
                this._scrollable.setScrollPositionSmooth(position);
            }
        }
        hasPendingScrollAnimation() {
            return this._scrollable.hasPendingScrollAnimation();
        }
        deltaScrollNow(deltaScrollLeft, deltaScrollTop) {
            const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
            this._scrollable.setScrollPositionNow({
                scrollLeft: currentScrollPosition.scrollLeft + deltaScrollLeft,
                scrollTop: currentScrollPosition.scrollTop + deltaScrollTop
            });
        }
    }
    exports.ViewLayout = ViewLayout;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0xheW91dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vdmlld0xheW91dC92aWV3TGF5b3V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFNLHFCQUFxQixHQUFHLEdBQUcsQ0FBQztJQUVsQyxNQUFNLHNCQUFzQjtRQVUzQixZQUNDLEtBQWEsRUFDYixZQUFvQixFQUNwQixNQUFjLEVBQ2QsYUFBcUI7WUFFckIsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDbEIsWUFBWSxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUM7WUFDaEMsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDcEIsYUFBYSxHQUFHLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFFbEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO2dCQUNkLEtBQUssR0FBRyxDQUFDLENBQUM7YUFDVjtZQUNELElBQUksWUFBWSxHQUFHLENBQUMsRUFBRTtnQkFDckIsWUFBWSxHQUFHLENBQUMsQ0FBQzthQUNqQjtZQUVELElBQUksTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDZixNQUFNLEdBQUcsQ0FBQyxDQUFDO2FBQ1g7WUFDRCxJQUFJLGFBQWEsR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLGFBQWEsR0FBRyxDQUFDLENBQUM7YUFDbEI7WUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztZQUNqQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRWpELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1lBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLE1BQU0sQ0FBQyxLQUE2QjtZQUMxQyxPQUFPLENBQ04sSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsS0FBSzttQkFDdkIsSUFBSSxDQUFDLFlBQVksS0FBSyxLQUFLLENBQUMsWUFBWTttQkFDeEMsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsTUFBTTttQkFDNUIsSUFBSSxDQUFDLGFBQWEsS0FBSyxLQUFLLENBQUMsYUFBYSxDQUM3QyxDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBRUQsTUFBTSxnQkFBaUIsU0FBUSxzQkFBVTtRQVV4QyxZQUFZLG9CQUE0QixFQUFFLDRCQUFtRTtZQUM1RyxLQUFLLEVBQUUsQ0FBQztZQUpRLDRCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTJCLENBQUMsQ0FBQztZQUNsRiwyQkFBc0IsR0FBbUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQUkzRyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdUJBQVUsQ0FBQztnQkFDaEQsa0JBQWtCLEVBQUUsSUFBSTtnQkFDeEIsb0JBQW9CO2dCQUNwQiw0QkFBNEI7YUFDNUIsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQzlDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDO1FBRU0sdUJBQXVCLENBQUMsb0JBQTRCO1lBQzFELElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRU0sc0JBQXNCLENBQUMsY0FBa0M7WUFDL0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFTSxtQkFBbUI7WUFDekIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3pCLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxVQUFrQztZQUM1RCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN4QyxPQUFPO2FBQ1A7WUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBRTlCLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUM7Z0JBQ3BDLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSztnQkFDdkIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXO2dCQUNuQyxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07Z0JBQ3pCLFlBQVksRUFBRSxVQUFVLENBQUMsWUFBWTthQUNyQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRVQsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEtBQUssVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3JGLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxhQUFhLENBQUMsYUFBYSxLQUFLLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN4RixJQUFJLG1CQUFtQixJQUFJLG9CQUFvQixFQUFFO2dCQUNoRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksa0RBQXVCLENBQzVELGFBQWEsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLGFBQWEsRUFDdkQsVUFBVSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsYUFBYSxDQUNqRCxDQUFDLENBQUM7YUFDSDtRQUNGLENBQUM7UUFFTSx1QkFBdUI7WUFDN0IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDbkQsQ0FBQztRQUVNLHdCQUF3QjtZQUM5QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNwRCxDQUFDO1FBRU0sb0JBQW9CLENBQUMsTUFBMEI7WUFDckQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sdUJBQXVCLENBQUMsTUFBMEI7WUFDeEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ3JELENBQUM7S0FDRDtJQUVELE1BQWEsVUFBVyxTQUFRLHNCQUFVO1FBV3pDLFlBQVksYUFBbUMsRUFBRSxTQUFpQixFQUFFLDRCQUFtRTtZQUN0SSxLQUFLLEVBQUUsQ0FBQztZQUVSLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1lBQ3BDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO1lBQzVDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLG1DQUF5QixDQUFDO1lBQ3hELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLCtCQUFzQixDQUFDO1lBRWxELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSx5QkFBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxrQ0FBeUIsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsSCxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO1lBRWpDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLENBQUMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7WUFFdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLHNCQUFzQixDQUM5RCxVQUFVLENBQUMsWUFBWSxFQUN2QixDQUFDLEVBQ0QsVUFBVSxDQUFDLE1BQU0sRUFDakIsQ0FBQyxDQUNELENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUM7WUFDaEQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUM7WUFFdEUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFZSxPQUFPO1lBQ3RCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekMsQ0FBQztRQUVNLG9CQUFvQjtZQUMxQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQUVPLDhCQUE4QjtZQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsd0NBQThCLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNySSxDQUFDO1FBRUQsaUNBQWlDO1FBRTFCLHNCQUFzQixDQUFDLENBQTRCO1lBQ3pELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO1lBQzVDLElBQUksQ0FBQyxDQUFDLFVBQVUsa0NBQXlCLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLGtDQUF5QixDQUFDLENBQUM7YUFDdEU7WUFDRCxJQUFJLENBQUMsQ0FBQyxVQUFVLCtCQUFzQixFQUFFO2dCQUN2QyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRywrQkFBc0IsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDMUQ7WUFDRCxJQUFJLENBQUMsQ0FBQyxVQUFVLG1DQUF5QixFQUFFO2dCQUMxQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxtQ0FBeUIsQ0FBQztnQkFDeEQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQztnQkFDdEMsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztnQkFDakMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQ2hFLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDLFlBQVksQ0FBQztnQkFDbkQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLHNCQUFzQixDQUM5RCxLQUFLLEVBQ0wsZ0JBQWdCLENBQUMsWUFBWSxFQUM3QixNQUFNLEVBQ04sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQ25ELENBQUMsQ0FBQzthQUNIO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUNyQjtZQUNELElBQUksQ0FBQyxDQUFDLFVBQVUsd0NBQThCLEVBQUU7Z0JBQy9DLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO2FBQ3RDO1FBQ0YsQ0FBQztRQUNNLFNBQVMsQ0FBQyxTQUFpQjtZQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ00sY0FBYyxDQUFDLGNBQXNCLEVBQUUsWUFBb0I7WUFDakUsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFDTSxlQUFlLENBQUMsY0FBc0IsRUFBRSxZQUFvQjtZQUNsRSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELCtCQUErQjtRQUV2Qiw2QkFBNkIsQ0FBQyxLQUFhLEVBQUUsV0FBbUI7WUFDdkUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7WUFDNUMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsa0NBQXdCLENBQUM7WUFDdEQsSUFBSSxTQUFTLENBQUMsVUFBVSx1Q0FBK0IsRUFBRTtnQkFDeEQsbUNBQW1DO2dCQUNuQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBQ0QsSUFBSSxLQUFLLElBQUksV0FBVyxFQUFFO2dCQUN6QixtQ0FBbUM7Z0JBQ25DLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFDRCxPQUFPLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQztRQUMxQyxDQUFDO1FBRU8saUJBQWlCLENBQUMsS0FBYSxFQUFFLE1BQWMsRUFBRSxZQUFvQjtZQUM1RSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQztZQUU1QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDckQsSUFBSSxPQUFPLENBQUMsR0FBRyw2Q0FBbUMsRUFBRTtnQkFDbkQsTUFBTSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxrQ0FBeUIsR0FBRyxPQUFPLENBQUMsR0FBRywrQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNoSDtpQkFBTTtnQkFDTixNQUFNLElBQUksSUFBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQzthQUNsRTtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVPLGFBQWE7WUFDcEIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDaEUsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1lBQ3JDLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztZQUN2QyxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUM7WUFDbkQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLHNCQUFzQixDQUM5RCxLQUFLLEVBQ0wsZ0JBQWdCLENBQUMsWUFBWSxFQUM3QixNQUFNLEVBQ04sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQ25ELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCx1QkFBdUI7UUFFaEIsa0JBQWtCO1lBQ3hCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ2hFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQzFFLE9BQU8sSUFBSSxvQkFBUSxDQUNsQixxQkFBcUIsQ0FBQyxTQUFTLEVBQy9CLHFCQUFxQixDQUFDLFVBQVUsRUFDaEMsZ0JBQWdCLENBQUMsS0FBSyxFQUN0QixnQkFBZ0IsQ0FBQyxNQUFNLENBQ3ZCLENBQUM7UUFDSCxDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ2hFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBQ3pFLE9BQU8sSUFBSSxvQkFBUSxDQUNsQixxQkFBcUIsQ0FBQyxTQUFTLEVBQy9CLHFCQUFxQixDQUFDLFVBQVUsRUFDaEMsZ0JBQWdCLENBQUMsS0FBSyxFQUN0QixnQkFBZ0IsQ0FBQyxNQUFNLENBQ3ZCLENBQUM7UUFDSCxDQUFDO1FBRU8sb0JBQW9CO1lBQzNCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO1lBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDeEMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcscUNBQTJCLENBQUM7WUFDNUQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsZ0NBQXVCLENBQUM7WUFDcEQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsbUNBQXlCLENBQUM7WUFDeEQsSUFBSSxZQUFZLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3BDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLCtCQUFzQixDQUFDO2dCQUNsRCxJQUFJLFlBQVksR0FBRyxVQUFVLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRTtvQkFDckYsd0ZBQXdGO29CQUN4RixJQUFJLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7d0JBQ2hELDRDQUE0Qzt3QkFDNUMsT0FBTyxZQUFZLEdBQUcsVUFBVSxDQUFDLHNCQUFzQixDQUFDO3FCQUN4RDtpQkFDRDtnQkFDRCxPQUFPLFlBQVksQ0FBQzthQUNwQjtpQkFBTTtnQkFDTixNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxHQUFHLCtDQUFxQyxHQUFHLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQztnQkFDeEgsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ3JFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsb0JBQW9CLEdBQUcsVUFBVSxDQUFDLHNCQUFzQixFQUFFLGtCQUFrQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2FBQzNJO1FBQ0YsQ0FBQztRQUVNLGVBQWUsQ0FBQyxZQUFvQjtZQUMxQyxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztZQUNsQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU0seUJBQXlCLENBQUMsV0FBbUI7WUFDbkQsSUFBSSxDQUFDLHVCQUF1QixHQUFHLFdBQVcsQ0FBQztZQUMzQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU8sbUJBQW1CO1lBQzFCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ2hFLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsSUFBSSxzQkFBc0IsQ0FDOUQsZ0JBQWdCLENBQUMsS0FBSyxFQUN0QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFDM0IsZ0JBQWdCLENBQUMsTUFBTSxFQUN2QixnQkFBZ0IsQ0FBQyxhQUFhLENBQzlCLENBQUMsQ0FBQztZQUVILGtGQUFrRjtZQUNsRixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQUVELGtCQUFrQjtRQUVYLFNBQVM7WUFDZixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUN6RSxNQUFNLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxTQUFTLENBQUM7WUFDbEQsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLG9DQUFvQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BHLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyw4Q0FBOEMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQzdILE9BQU87Z0JBQ04sU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLHlCQUF5QixFQUFFLFNBQVMsR0FBRyx3QkFBd0I7Z0JBQy9ELFVBQVUsRUFBRSxxQkFBcUIsQ0FBQyxVQUFVO2FBQzVDLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTztRQUNBLGdCQUFnQixDQUFDLFFBQXVEO1lBQzlFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEUsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7YUFDNUI7WUFDRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO1FBQ00sOEJBQThCLENBQUMsVUFBa0IsRUFBRSxtQkFBNEIsS0FBSztZQUMxRixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsOEJBQThCLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUNNLGdDQUFnQyxDQUFDLFVBQWtCLEVBQUUsbUJBQTRCLEtBQUs7WUFDNUYsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLGdDQUFnQyxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFDTSxZQUFZLENBQUMsY0FBc0I7WUFDekMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBQ00sY0FBYyxDQUFDLGNBQXNCO1lBQzNDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUNELGlCQUFpQixDQUFDLGNBQXNCO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRU0sNkJBQTZCLENBQUMsY0FBc0I7WUFDMUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLG9DQUFvQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFTSw2QkFBNkIsQ0FBQyxjQUFzQjtZQUMxRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsNkJBQTZCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUNNLG9CQUFvQjtZQUMxQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUM3QyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRyxDQUFDO1FBQ00sK0JBQStCLENBQUMsU0FBaUI7WUFDdkQsMkNBQTJDO1lBQzNDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ2hFLElBQUksU0FBUyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3hFLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO2FBQ3BFO1lBQ0QsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQixTQUFTLEdBQUcsQ0FBQyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvRixDQUFDO1FBQ00seUJBQXlCO1lBQy9CLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzdDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hHLENBQUM7UUFDTSxjQUFjO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRUQsT0FBTztRQUVBLGVBQWU7WUFDckIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDaEUsT0FBTyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUM7UUFDdEMsQ0FBQztRQUNNLGNBQWM7WUFDcEIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDaEUsT0FBTyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUM7UUFDckMsQ0FBQztRQUNNLGdCQUFnQjtZQUN0QixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUNoRSxPQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQztRQUN2QyxDQUFDO1FBQ00sZUFBZTtZQUNyQixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUNoRSxPQUFPLGdCQUFnQixDQUFDLFlBQVksQ0FBQztRQUN0QyxDQUFDO1FBRU0sb0JBQW9CO1lBQzFCLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQzFFLE9BQU8scUJBQXFCLENBQUMsVUFBVSxDQUFDO1FBQ3pDLENBQUM7UUFDTSxtQkFBbUI7WUFDekIsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDMUUsT0FBTyxxQkFBcUIsQ0FBQyxTQUFTLENBQUM7UUFDeEMsQ0FBQztRQUVNLHNCQUFzQixDQUFDLGNBQWtDO1lBQy9ELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRU0saUJBQWlCLENBQUMsUUFBNEIsRUFBRSxJQUFnQjtZQUN0RSxJQUFJLElBQUksaUNBQXlCLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNuRDtRQUNGLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDckQsQ0FBQztRQUVNLGNBQWMsQ0FBQyxlQUF1QixFQUFFLGNBQXNCO1lBQ3BFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQzFFLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUM7Z0JBQ3JDLFVBQVUsRUFBRSxxQkFBcUIsQ0FBQyxVQUFVLEdBQUcsZUFBZTtnQkFDOUQsU0FBUyxFQUFFLHFCQUFxQixDQUFDLFNBQVMsR0FBRyxjQUFjO2FBQzNELENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQXJVRCxnQ0FxVUMifQ==