/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/base/common/async", "vs/base/common/platform", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/view/renderingContext", "vs/editor/browser/view/viewLayer", "vs/editor/browser/view/viewPart", "vs/editor/browser/viewParts/lines/domReadingContext", "vs/editor/browser/viewParts/lines/viewLine", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/css!./viewLines"], function (require, exports, mouseCursor_1, async_1, platform, domFontInfo_1, renderingContext_1, viewLayer_1, viewPart_1, domReadingContext_1, viewLine_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewLines = void 0;
    class LastRenderedData {
        constructor() {
            this._currentVisibleRange = new range_1.Range(1, 1, 1, 1);
        }
        getCurrentVisibleRange() {
            return this._currentVisibleRange;
        }
        setCurrentVisibleRange(currentVisibleRange) {
            this._currentVisibleRange = currentVisibleRange;
        }
    }
    class HorizontalRevealRangeRequest {
        constructor(minimalReveal, lineNumber, startColumn, endColumn, startScrollTop, stopScrollTop, scrollType) {
            this.minimalReveal = minimalReveal;
            this.lineNumber = lineNumber;
            this.startColumn = startColumn;
            this.endColumn = endColumn;
            this.startScrollTop = startScrollTop;
            this.stopScrollTop = stopScrollTop;
            this.scrollType = scrollType;
            this.type = 'range';
            this.minLineNumber = lineNumber;
            this.maxLineNumber = lineNumber;
        }
    }
    class HorizontalRevealSelectionsRequest {
        constructor(minimalReveal, selections, startScrollTop, stopScrollTop, scrollType) {
            this.minimalReveal = minimalReveal;
            this.selections = selections;
            this.startScrollTop = startScrollTop;
            this.stopScrollTop = stopScrollTop;
            this.scrollType = scrollType;
            this.type = 'selections';
            let minLineNumber = selections[0].startLineNumber;
            let maxLineNumber = selections[0].endLineNumber;
            for (let i = 1, len = selections.length; i < len; i++) {
                const selection = selections[i];
                minLineNumber = Math.min(minLineNumber, selection.startLineNumber);
                maxLineNumber = Math.max(maxLineNumber, selection.endLineNumber);
            }
            this.minLineNumber = minLineNumber;
            this.maxLineNumber = maxLineNumber;
        }
    }
    class ViewLines extends viewPart_1.ViewPart {
        /**
         * Adds this amount of pixels to the right of lines (no-one wants to type near the edge of the viewport)
         */
        static { this.HORIZONTAL_EXTRA_PX = 30; }
        constructor(context, linesContent) {
            super(context);
            this._linesContent = linesContent;
            this._textRangeRestingSpot = document.createElement('div');
            this._visibleLines = new viewLayer_1.VisibleLinesCollection(this);
            this.domNode = this._visibleLines.domNode;
            const conf = this._context.configuration;
            const options = this._context.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
            this._isViewportWrapping = wrappingInfo.isViewportWrapping;
            this._revealHorizontalRightPadding = options.get(99 /* EditorOption.revealHorizontalRightPadding */);
            this._cursorSurroundingLines = options.get(29 /* EditorOption.cursorSurroundingLines */);
            this._cursorSurroundingLinesStyle = options.get(30 /* EditorOption.cursorSurroundingLinesStyle */);
            this._canUseLayerHinting = !options.get(32 /* EditorOption.disableLayerHinting */);
            this._viewLineOptions = new viewLine_1.ViewLineOptions(conf, this._context.theme.type);
            viewPart_1.PartFingerprints.write(this.domNode, 7 /* PartFingerprint.ViewLines */);
            this.domNode.setClassName(`view-lines ${mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`);
            (0, domFontInfo_1.applyFontInfo)(this.domNode, fontInfo);
            // --- width & height
            this._maxLineWidth = 0;
            this._asyncUpdateLineWidths = new async_1.RunOnceScheduler(() => {
                this._updateLineWidthsSlow();
            }, 200);
            this._asyncCheckMonospaceFontAssumptions = new async_1.RunOnceScheduler(() => {
                this._checkMonospaceFontAssumptions();
            }, 2000);
            this._lastRenderedData = new LastRenderedData();
            this._horizontalRevealRequest = null;
            // sticky scroll widget
            this._stickyScrollEnabled = options.get(114 /* EditorOption.stickyScroll */).enabled;
            this._maxNumberStickyLines = options.get(114 /* EditorOption.stickyScroll */).maxLineCount;
        }
        dispose() {
            this._asyncUpdateLineWidths.dispose();
            this._asyncCheckMonospaceFontAssumptions.dispose();
            super.dispose();
        }
        getDomNode() {
            return this.domNode;
        }
        // ---- begin IVisibleLinesHost
        createVisibleLine() {
            return new viewLine_1.ViewLine(this._viewLineOptions);
        }
        // ---- end IVisibleLinesHost
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            this._visibleLines.onConfigurationChanged(e);
            if (e.hasChanged(144 /* EditorOption.wrappingInfo */)) {
                this._maxLineWidth = 0;
            }
            const options = this._context.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
            this._isViewportWrapping = wrappingInfo.isViewportWrapping;
            this._revealHorizontalRightPadding = options.get(99 /* EditorOption.revealHorizontalRightPadding */);
            this._cursorSurroundingLines = options.get(29 /* EditorOption.cursorSurroundingLines */);
            this._cursorSurroundingLinesStyle = options.get(30 /* EditorOption.cursorSurroundingLinesStyle */);
            this._canUseLayerHinting = !options.get(32 /* EditorOption.disableLayerHinting */);
            // sticky scroll
            this._stickyScrollEnabled = options.get(114 /* EditorOption.stickyScroll */).enabled;
            this._maxNumberStickyLines = options.get(114 /* EditorOption.stickyScroll */).maxLineCount;
            (0, domFontInfo_1.applyFontInfo)(this.domNode, fontInfo);
            this._onOptionsMaybeChanged();
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                this._maxLineWidth = 0;
            }
            return true;
        }
        _onOptionsMaybeChanged() {
            const conf = this._context.configuration;
            const newViewLineOptions = new viewLine_1.ViewLineOptions(conf, this._context.theme.type);
            if (!this._viewLineOptions.equals(newViewLineOptions)) {
                this._viewLineOptions = newViewLineOptions;
                const startLineNumber = this._visibleLines.getStartLineNumber();
                const endLineNumber = this._visibleLines.getEndLineNumber();
                for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                    const line = this._visibleLines.getVisibleLine(lineNumber);
                    line.onOptionsChanged(this._viewLineOptions);
                }
                return true;
            }
            return false;
        }
        onCursorStateChanged(e) {
            const rendStartLineNumber = this._visibleLines.getStartLineNumber();
            const rendEndLineNumber = this._visibleLines.getEndLineNumber();
            let r = false;
            for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                r = this._visibleLines.getVisibleLine(lineNumber).onSelectionChanged() || r;
            }
            return r;
        }
        onDecorationsChanged(e) {
            if (true /*e.inlineDecorationsChanged*/) {
                const rendStartLineNumber = this._visibleLines.getStartLineNumber();
                const rendEndLineNumber = this._visibleLines.getEndLineNumber();
                for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                    this._visibleLines.getVisibleLine(lineNumber).onDecorationsChanged();
                }
            }
            return true;
        }
        onFlushed(e) {
            const shouldRender = this._visibleLines.onFlushed(e);
            this._maxLineWidth = 0;
            return shouldRender;
        }
        onLinesChanged(e) {
            return this._visibleLines.onLinesChanged(e);
        }
        onLinesDeleted(e) {
            return this._visibleLines.onLinesDeleted(e);
        }
        onLinesInserted(e) {
            return this._visibleLines.onLinesInserted(e);
        }
        onRevealRangeRequest(e) {
            // Using the future viewport here in order to handle multiple
            // incoming reveal range requests that might all desire to be animated
            const desiredScrollTop = this._computeScrollTopToRevealRange(this._context.viewLayout.getFutureViewport(), e.source, e.minimalReveal, e.range, e.selections, e.verticalType);
            if (desiredScrollTop === -1) {
                // marker to abort the reveal range request
                return false;
            }
            // validate the new desired scroll top
            let newScrollPosition = this._context.viewLayout.validateScrollPosition({ scrollTop: desiredScrollTop });
            if (e.revealHorizontal) {
                if (e.range && e.range.startLineNumber !== e.range.endLineNumber) {
                    // Two or more lines? => scroll to base (That's how you see most of the two lines)
                    newScrollPosition = {
                        scrollTop: newScrollPosition.scrollTop,
                        scrollLeft: 0
                    };
                }
                else if (e.range) {
                    // We don't necessarily know the horizontal offset of this range since the line might not be in the view...
                    this._horizontalRevealRequest = new HorizontalRevealRangeRequest(e.minimalReveal, e.range.startLineNumber, e.range.startColumn, e.range.endColumn, this._context.viewLayout.getCurrentScrollTop(), newScrollPosition.scrollTop, e.scrollType);
                }
                else if (e.selections && e.selections.length > 0) {
                    this._horizontalRevealRequest = new HorizontalRevealSelectionsRequest(e.minimalReveal, e.selections, this._context.viewLayout.getCurrentScrollTop(), newScrollPosition.scrollTop, e.scrollType);
                }
            }
            else {
                this._horizontalRevealRequest = null;
            }
            const scrollTopDelta = Math.abs(this._context.viewLayout.getCurrentScrollTop() - newScrollPosition.scrollTop);
            const scrollType = (scrollTopDelta <= this._lineHeight ? 1 /* ScrollType.Immediate */ : e.scrollType);
            this._context.viewModel.viewLayout.setScrollPosition(newScrollPosition, scrollType);
            return true;
        }
        onScrollChanged(e) {
            if (this._horizontalRevealRequest && e.scrollLeftChanged) {
                // cancel any outstanding horizontal reveal request if someone else scrolls horizontally.
                this._horizontalRevealRequest = null;
            }
            if (this._horizontalRevealRequest && e.scrollTopChanged) {
                const min = Math.min(this._horizontalRevealRequest.startScrollTop, this._horizontalRevealRequest.stopScrollTop);
                const max = Math.max(this._horizontalRevealRequest.startScrollTop, this._horizontalRevealRequest.stopScrollTop);
                if (e.scrollTop < min || e.scrollTop > max) {
                    // cancel any outstanding horizontal reveal request if someone else scrolls vertically.
                    this._horizontalRevealRequest = null;
                }
            }
            this.domNode.setWidth(e.scrollWidth);
            return this._visibleLines.onScrollChanged(e) || true;
        }
        onTokensChanged(e) {
            return this._visibleLines.onTokensChanged(e);
        }
        onZonesChanged(e) {
            this._context.viewModel.viewLayout.setMaxLineWidth(this._maxLineWidth);
            return this._visibleLines.onZonesChanged(e);
        }
        onThemeChanged(e) {
            return this._onOptionsMaybeChanged();
        }
        // ---- end view event handlers
        // ----------- HELPERS FOR OTHERS
        getPositionFromDOMInfo(spanNode, offset) {
            const viewLineDomNode = this._getViewLineDomNode(spanNode);
            if (viewLineDomNode === null) {
                // Couldn't find view line node
                return null;
            }
            const lineNumber = this._getLineNumberFor(viewLineDomNode);
            if (lineNumber === -1) {
                // Couldn't find view line node
                return null;
            }
            if (lineNumber < 1 || lineNumber > this._context.viewModel.getLineCount()) {
                // lineNumber is outside range
                return null;
            }
            if (this._context.viewModel.getLineMaxColumn(lineNumber) === 1) {
                // Line is empty
                return new position_1.Position(lineNumber, 1);
            }
            const rendStartLineNumber = this._visibleLines.getStartLineNumber();
            const rendEndLineNumber = this._visibleLines.getEndLineNumber();
            if (lineNumber < rendStartLineNumber || lineNumber > rendEndLineNumber) {
                // Couldn't find line
                return null;
            }
            let column = this._visibleLines.getVisibleLine(lineNumber).getColumnOfNodeOffset(spanNode, offset);
            const minColumn = this._context.viewModel.getLineMinColumn(lineNumber);
            if (column < minColumn) {
                column = minColumn;
            }
            return new position_1.Position(lineNumber, column);
        }
        _getViewLineDomNode(node) {
            while (node && node.nodeType === 1) {
                if (node.className === viewLine_1.ViewLine.CLASS_NAME) {
                    return node;
                }
                node = node.parentElement;
            }
            return null;
        }
        /**
         * @returns the line number of this view line dom node.
         */
        _getLineNumberFor(domNode) {
            const startLineNumber = this._visibleLines.getStartLineNumber();
            const endLineNumber = this._visibleLines.getEndLineNumber();
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const line = this._visibleLines.getVisibleLine(lineNumber);
                if (domNode === line.getDomNode()) {
                    return lineNumber;
                }
            }
            return -1;
        }
        getLineWidth(lineNumber) {
            const rendStartLineNumber = this._visibleLines.getStartLineNumber();
            const rendEndLineNumber = this._visibleLines.getEndLineNumber();
            if (lineNumber < rendStartLineNumber || lineNumber > rendEndLineNumber) {
                // Couldn't find line
                return -1;
            }
            const context = new domReadingContext_1.DomReadingContext(this.domNode.domNode, this._textRangeRestingSpot);
            const result = this._visibleLines.getVisibleLine(lineNumber).getWidth(context);
            this._updateLineWidthsSlowIfDomDidLayout(context);
            return result;
        }
        linesVisibleRangesForRange(_range, includeNewLines) {
            if (this.shouldRender()) {
                // Cannot read from the DOM because it is dirty
                // i.e. the model & the dom are out of sync, so I'd be reading something stale
                return null;
            }
            const originalEndLineNumber = _range.endLineNumber;
            const range = range_1.Range.intersectRanges(_range, this._lastRenderedData.getCurrentVisibleRange());
            if (!range) {
                return null;
            }
            const visibleRanges = [];
            let visibleRangesLen = 0;
            const domReadingContext = new domReadingContext_1.DomReadingContext(this.domNode.domNode, this._textRangeRestingSpot);
            let nextLineModelLineNumber = 0;
            if (includeNewLines) {
                nextLineModelLineNumber = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(range.startLineNumber, 1)).lineNumber;
            }
            const rendStartLineNumber = this._visibleLines.getStartLineNumber();
            const rendEndLineNumber = this._visibleLines.getEndLineNumber();
            for (let lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
                if (lineNumber < rendStartLineNumber || lineNumber > rendEndLineNumber) {
                    continue;
                }
                const startColumn = lineNumber === range.startLineNumber ? range.startColumn : 1;
                const continuesInNextLine = lineNumber !== range.endLineNumber;
                const endColumn = continuesInNextLine ? this._context.viewModel.getLineMaxColumn(lineNumber) : range.endColumn;
                const visibleRangesForLine = this._visibleLines.getVisibleLine(lineNumber).getVisibleRangesForRange(lineNumber, startColumn, endColumn, domReadingContext);
                if (!visibleRangesForLine) {
                    continue;
                }
                if (includeNewLines && lineNumber < originalEndLineNumber) {
                    const currentLineModelLineNumber = nextLineModelLineNumber;
                    nextLineModelLineNumber = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(lineNumber + 1, 1)).lineNumber;
                    if (currentLineModelLineNumber !== nextLineModelLineNumber) {
                        visibleRangesForLine.ranges[visibleRangesForLine.ranges.length - 1].width += this._typicalHalfwidthCharacterWidth;
                    }
                }
                visibleRanges[visibleRangesLen++] = new renderingContext_1.LineVisibleRanges(visibleRangesForLine.outsideRenderedLine, lineNumber, renderingContext_1.HorizontalRange.from(visibleRangesForLine.ranges), continuesInNextLine);
            }
            this._updateLineWidthsSlowIfDomDidLayout(domReadingContext);
            if (visibleRangesLen === 0) {
                return null;
            }
            return visibleRanges;
        }
        _visibleRangesForLineRange(lineNumber, startColumn, endColumn) {
            if (this.shouldRender()) {
                // Cannot read from the DOM because it is dirty
                // i.e. the model & the dom are out of sync, so I'd be reading something stale
                return null;
            }
            if (lineNumber < this._visibleLines.getStartLineNumber() || lineNumber > this._visibleLines.getEndLineNumber()) {
                return null;
            }
            const domReadingContext = new domReadingContext_1.DomReadingContext(this.domNode.domNode, this._textRangeRestingSpot);
            const result = this._visibleLines.getVisibleLine(lineNumber).getVisibleRangesForRange(lineNumber, startColumn, endColumn, domReadingContext);
            this._updateLineWidthsSlowIfDomDidLayout(domReadingContext);
            return result;
        }
        visibleRangeForPosition(position) {
            const visibleRanges = this._visibleRangesForLineRange(position.lineNumber, position.column, position.column);
            if (!visibleRanges) {
                return null;
            }
            return new renderingContext_1.HorizontalPosition(visibleRanges.outsideRenderedLine, visibleRanges.ranges[0].left);
        }
        // --- implementation
        updateLineWidths() {
            this._updateLineWidths(false);
        }
        /**
         * Updates the max line width if it is fast to compute.
         * Returns true if all lines were taken into account.
         * Returns false if some lines need to be reevaluated (in a slow fashion).
         */
        _updateLineWidthsFast() {
            return this._updateLineWidths(true);
        }
        _updateLineWidthsSlow() {
            this._updateLineWidths(false);
        }
        /**
         * Update the line widths using DOM layout information after someone else
         * has caused a synchronous layout.
         */
        _updateLineWidthsSlowIfDomDidLayout(domReadingContext) {
            if (!domReadingContext.didDomLayout) {
                // only proceed if we just did a layout
                return;
            }
            if (this._asyncUpdateLineWidths.isScheduled()) {
                // reading widths is not scheduled => widths are up-to-date
                return;
            }
            this._asyncUpdateLineWidths.cancel();
            this._updateLineWidthsSlow();
        }
        _updateLineWidths(fast) {
            const rendStartLineNumber = this._visibleLines.getStartLineNumber();
            const rendEndLineNumber = this._visibleLines.getEndLineNumber();
            let localMaxLineWidth = 1;
            let allWidthsComputed = true;
            for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                const visibleLine = this._visibleLines.getVisibleLine(lineNumber);
                if (fast && !visibleLine.getWidthIsFast()) {
                    // Cannot compute width in a fast way for this line
                    allWidthsComputed = false;
                    continue;
                }
                localMaxLineWidth = Math.max(localMaxLineWidth, visibleLine.getWidth(null));
            }
            if (allWidthsComputed && rendStartLineNumber === 1 && rendEndLineNumber === this._context.viewModel.getLineCount()) {
                // we know the max line width for all the lines
                this._maxLineWidth = 0;
            }
            this._ensureMaxLineWidth(localMaxLineWidth);
            return allWidthsComputed;
        }
        _checkMonospaceFontAssumptions() {
            // Problems with monospace assumptions are more apparent for longer lines,
            // as small rounding errors start to sum up, so we will select the longest
            // line for a closer inspection
            let longestLineNumber = -1;
            let longestWidth = -1;
            const rendStartLineNumber = this._visibleLines.getStartLineNumber();
            const rendEndLineNumber = this._visibleLines.getEndLineNumber();
            for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                const visibleLine = this._visibleLines.getVisibleLine(lineNumber);
                if (visibleLine.needsMonospaceFontCheck()) {
                    const lineWidth = visibleLine.getWidth(null);
                    if (lineWidth > longestWidth) {
                        longestWidth = lineWidth;
                        longestLineNumber = lineNumber;
                    }
                }
            }
            if (longestLineNumber === -1) {
                return;
            }
            if (!this._visibleLines.getVisibleLine(longestLineNumber).monospaceAssumptionsAreValid()) {
                for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                    const visibleLine = this._visibleLines.getVisibleLine(lineNumber);
                    visibleLine.onMonospaceAssumptionsInvalidated();
                }
            }
        }
        prepareRender() {
            throw new Error('Not supported');
        }
        render() {
            throw new Error('Not supported');
        }
        renderText(viewportData) {
            // (1) render lines - ensures lines are in the DOM
            this._visibleLines.renderLines(viewportData);
            this._lastRenderedData.setCurrentVisibleRange(viewportData.visibleRange);
            this.domNode.setWidth(this._context.viewLayout.getScrollWidth());
            this.domNode.setHeight(Math.min(this._context.viewLayout.getScrollHeight(), 1000000));
            // (2) compute horizontal scroll position:
            //  - this must happen after the lines are in the DOM since it might need a line that rendered just now
            //  - it might change `scrollWidth` and `scrollLeft`
            if (this._horizontalRevealRequest) {
                const horizontalRevealRequest = this._horizontalRevealRequest;
                // Check that we have the line that contains the horizontal range in the viewport
                if (viewportData.startLineNumber <= horizontalRevealRequest.minLineNumber && horizontalRevealRequest.maxLineNumber <= viewportData.endLineNumber) {
                    this._horizontalRevealRequest = null;
                    // allow `visibleRangesForRange2` to work
                    this.onDidRender();
                    // compute new scroll position
                    const newScrollLeft = this._computeScrollLeftToReveal(horizontalRevealRequest);
                    if (newScrollLeft) {
                        if (!this._isViewportWrapping) {
                            // ensure `scrollWidth` is large enough
                            this._ensureMaxLineWidth(newScrollLeft.maxHorizontalOffset);
                        }
                        // set `scrollLeft`
                        this._context.viewModel.viewLayout.setScrollPosition({
                            scrollLeft: newScrollLeft.scrollLeft
                        }, horizontalRevealRequest.scrollType);
                    }
                }
            }
            // Update max line width (not so important, it is just so the horizontal scrollbar doesn't get too small)
            if (!this._updateLineWidthsFast()) {
                // Computing the width of some lines would be slow => delay it
                this._asyncUpdateLineWidths.schedule();
            }
            else {
                this._asyncUpdateLineWidths.cancel();
            }
            if (platform.isLinux && !this._asyncCheckMonospaceFontAssumptions.isScheduled()) {
                const rendStartLineNumber = this._visibleLines.getStartLineNumber();
                const rendEndLineNumber = this._visibleLines.getEndLineNumber();
                for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                    const visibleLine = this._visibleLines.getVisibleLine(lineNumber);
                    if (visibleLine.needsMonospaceFontCheck()) {
                        this._asyncCheckMonospaceFontAssumptions.schedule();
                        break;
                    }
                }
            }
            // (3) handle scrolling
            this._linesContent.setLayerHinting(this._canUseLayerHinting);
            this._linesContent.setContain('strict');
            const adjustedScrollTop = this._context.viewLayout.getCurrentScrollTop() - viewportData.bigNumbersDelta;
            this._linesContent.setTop(-adjustedScrollTop);
            this._linesContent.setLeft(-this._context.viewLayout.getCurrentScrollLeft());
        }
        // --- width
        _ensureMaxLineWidth(lineWidth) {
            const iLineWidth = Math.ceil(lineWidth);
            if (this._maxLineWidth < iLineWidth) {
                this._maxLineWidth = iLineWidth;
                this._context.viewModel.viewLayout.setMaxLineWidth(this._maxLineWidth);
            }
        }
        _computeScrollTopToRevealRange(viewport, source, minimalReveal, range, selections, verticalType) {
            const viewportStartY = viewport.top;
            const viewportHeight = viewport.height;
            const viewportEndY = viewportStartY + viewportHeight;
            let boxIsSingleRange;
            let boxStartY;
            let boxEndY;
            if (selections && selections.length > 0) {
                let minLineNumber = selections[0].startLineNumber;
                let maxLineNumber = selections[0].endLineNumber;
                for (let i = 1, len = selections.length; i < len; i++) {
                    const selection = selections[i];
                    minLineNumber = Math.min(minLineNumber, selection.startLineNumber);
                    maxLineNumber = Math.max(maxLineNumber, selection.endLineNumber);
                }
                boxIsSingleRange = false;
                boxStartY = this._context.viewLayout.getVerticalOffsetForLineNumber(minLineNumber);
                boxEndY = this._context.viewLayout.getVerticalOffsetForLineNumber(maxLineNumber) + this._lineHeight;
            }
            else if (range) {
                boxIsSingleRange = true;
                boxStartY = this._context.viewLayout.getVerticalOffsetForLineNumber(range.startLineNumber);
                boxEndY = this._context.viewLayout.getVerticalOffsetForLineNumber(range.endLineNumber) + this._lineHeight;
            }
            else {
                return -1;
            }
            const shouldIgnoreScrollOff = (source === 'mouse' || minimalReveal) && this._cursorSurroundingLinesStyle === 'default';
            let paddingTop = 0;
            let paddingBottom = 0;
            if (!shouldIgnoreScrollOff) {
                const context = Math.min((viewportHeight / this._lineHeight) / 2, this._cursorSurroundingLines);
                if (this._stickyScrollEnabled) {
                    paddingTop = Math.max(context, this._maxNumberStickyLines) * this._lineHeight;
                }
                else {
                    paddingTop = context * this._lineHeight;
                }
                paddingBottom = Math.max(0, (context - 1)) * this._lineHeight;
            }
            else {
                if (!minimalReveal) {
                    // Reveal one more line above (this case is hit when dragging)
                    paddingTop = this._lineHeight;
                }
            }
            if (!minimalReveal) {
                if (verticalType === 0 /* viewEvents.VerticalRevealType.Simple */ || verticalType === 4 /* viewEvents.VerticalRevealType.Bottom */) {
                    // Reveal one line more when the last line would be covered by the scrollbar - arrow down case or revealing a line explicitly at bottom
                    paddingBottom += this._lineHeight;
                }
            }
            boxStartY -= paddingTop;
            boxEndY += paddingBottom;
            let newScrollTop;
            if (boxEndY - boxStartY > viewportHeight) {
                // the box is larger than the viewport ... scroll to its top
                if (!boxIsSingleRange) {
                    // do not reveal multiple cursors if there are more than fit the viewport
                    return -1;
                }
                newScrollTop = boxStartY;
            }
            else if (verticalType === 5 /* viewEvents.VerticalRevealType.NearTop */ || verticalType === 6 /* viewEvents.VerticalRevealType.NearTopIfOutsideViewport */) {
                if (verticalType === 6 /* viewEvents.VerticalRevealType.NearTopIfOutsideViewport */ && viewportStartY <= boxStartY && boxEndY <= viewportEndY) {
                    // Box is already in the viewport... do nothing
                    newScrollTop = viewportStartY;
                }
                else {
                    // We want a gap that is 20% of the viewport, but with a minimum of 5 lines
                    const desiredGapAbove = Math.max(5 * this._lineHeight, viewportHeight * 0.2);
                    // Try to scroll just above the box with the desired gap
                    const desiredScrollTop = boxStartY - desiredGapAbove;
                    // But ensure that the box is not pushed out of viewport
                    const minScrollTop = boxEndY - viewportHeight;
                    newScrollTop = Math.max(minScrollTop, desiredScrollTop);
                }
            }
            else if (verticalType === 1 /* viewEvents.VerticalRevealType.Center */ || verticalType === 2 /* viewEvents.VerticalRevealType.CenterIfOutsideViewport */) {
                if (verticalType === 2 /* viewEvents.VerticalRevealType.CenterIfOutsideViewport */ && viewportStartY <= boxStartY && boxEndY <= viewportEndY) {
                    // Box is already in the viewport... do nothing
                    newScrollTop = viewportStartY;
                }
                else {
                    // Box is outside the viewport... center it
                    const boxMiddleY = (boxStartY + boxEndY) / 2;
                    newScrollTop = Math.max(0, boxMiddleY - viewportHeight / 2);
                }
            }
            else {
                newScrollTop = this._computeMinimumScrolling(viewportStartY, viewportEndY, boxStartY, boxEndY, verticalType === 3 /* viewEvents.VerticalRevealType.Top */, verticalType === 4 /* viewEvents.VerticalRevealType.Bottom */);
            }
            return newScrollTop;
        }
        _computeScrollLeftToReveal(horizontalRevealRequest) {
            const viewport = this._context.viewLayout.getCurrentViewport();
            const layoutInfo = this._context.configuration.options.get(143 /* EditorOption.layoutInfo */);
            const viewportStartX = viewport.left;
            const viewportEndX = viewportStartX + viewport.width - layoutInfo.verticalScrollbarWidth;
            let boxStartX = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
            let boxEndX = 0;
            if (horizontalRevealRequest.type === 'range') {
                const visibleRanges = this._visibleRangesForLineRange(horizontalRevealRequest.lineNumber, horizontalRevealRequest.startColumn, horizontalRevealRequest.endColumn);
                if (!visibleRanges) {
                    return null;
                }
                for (const visibleRange of visibleRanges.ranges) {
                    boxStartX = Math.min(boxStartX, Math.round(visibleRange.left));
                    boxEndX = Math.max(boxEndX, Math.round(visibleRange.left + visibleRange.width));
                }
            }
            else {
                for (const selection of horizontalRevealRequest.selections) {
                    if (selection.startLineNumber !== selection.endLineNumber) {
                        return null;
                    }
                    const visibleRanges = this._visibleRangesForLineRange(selection.startLineNumber, selection.startColumn, selection.endColumn);
                    if (!visibleRanges) {
                        return null;
                    }
                    for (const visibleRange of visibleRanges.ranges) {
                        boxStartX = Math.min(boxStartX, Math.round(visibleRange.left));
                        boxEndX = Math.max(boxEndX, Math.round(visibleRange.left + visibleRange.width));
                    }
                }
            }
            if (!horizontalRevealRequest.minimalReveal) {
                boxStartX = Math.max(0, boxStartX - ViewLines.HORIZONTAL_EXTRA_PX);
                boxEndX += this._revealHorizontalRightPadding;
            }
            if (horizontalRevealRequest.type === 'selections' && boxEndX - boxStartX > viewport.width) {
                return null;
            }
            const newScrollLeft = this._computeMinimumScrolling(viewportStartX, viewportEndX, boxStartX, boxEndX);
            return {
                scrollLeft: newScrollLeft,
                maxHorizontalOffset: boxEndX
            };
        }
        _computeMinimumScrolling(viewportStart, viewportEnd, boxStart, boxEnd, revealAtStart, revealAtEnd) {
            viewportStart = viewportStart | 0;
            viewportEnd = viewportEnd | 0;
            boxStart = boxStart | 0;
            boxEnd = boxEnd | 0;
            revealAtStart = !!revealAtStart;
            revealAtEnd = !!revealAtEnd;
            const viewportLength = viewportEnd - viewportStart;
            const boxLength = boxEnd - boxStart;
            if (boxLength < viewportLength) {
                // The box would fit in the viewport
                if (revealAtStart) {
                    return boxStart;
                }
                if (revealAtEnd) {
                    return Math.max(0, boxEnd - viewportLength);
                }
                if (boxStart < viewportStart) {
                    // The box is above the viewport
                    return boxStart;
                }
                else if (boxEnd > viewportEnd) {
                    // The box is below the viewport
                    return Math.max(0, boxEnd - viewportLength);
                }
            }
            else {
                // The box would not fit in the viewport
                // Reveal the beginning of the box
                return boxStart;
            }
            return viewportStart;
        }
    }
    exports.ViewLines = ViewLines;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0xpbmVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlld1BhcnRzL2xpbmVzL3ZpZXdMaW5lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3QmhHLE1BQU0sZ0JBQWdCO1FBSXJCO1lBQ0MsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFTSxzQkFBc0I7WUFDNUIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7UUFDbEMsQ0FBQztRQUVNLHNCQUFzQixDQUFDLG1CQUEwQjtZQUN2RCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7UUFDakQsQ0FBQztLQUNEO0lBRUQsTUFBTSw0QkFBNEI7UUFLakMsWUFDaUIsYUFBc0IsRUFDdEIsVUFBa0IsRUFDbEIsV0FBbUIsRUFDbkIsU0FBaUIsRUFDakIsY0FBc0IsRUFDdEIsYUFBcUIsRUFDckIsVUFBc0I7WUFOdEIsa0JBQWEsR0FBYixhQUFhLENBQVM7WUFDdEIsZUFBVSxHQUFWLFVBQVUsQ0FBUTtZQUNsQixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtZQUNuQixjQUFTLEdBQVQsU0FBUyxDQUFRO1lBQ2pCLG1CQUFjLEdBQWQsY0FBYyxDQUFRO1lBQ3RCLGtCQUFhLEdBQWIsYUFBYSxDQUFRO1lBQ3JCLGVBQVUsR0FBVixVQUFVLENBQVk7WUFYdkIsU0FBSSxHQUFHLE9BQU8sQ0FBQztZQWE5QixJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQztZQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQztRQUNqQyxDQUFDO0tBQ0Q7SUFFRCxNQUFNLGlDQUFpQztRQUt0QyxZQUNpQixhQUFzQixFQUN0QixVQUF1QixFQUN2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