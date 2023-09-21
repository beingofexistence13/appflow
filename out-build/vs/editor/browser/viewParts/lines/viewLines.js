/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/base/common/async", "vs/base/common/platform", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/view/renderingContext", "vs/editor/browser/view/viewLayer", "vs/editor/browser/view/viewPart", "vs/editor/browser/viewParts/lines/domReadingContext", "vs/editor/browser/viewParts/lines/viewLine", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/css!./viewLines"], function (require, exports, mouseCursor_1, async_1, platform, domFontInfo_1, renderingContext_1, viewLayer_1, viewPart_1, domReadingContext_1, viewLine_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tX = void 0;
    class LastRenderedData {
        constructor() {
            this.a = new range_1.$ks(1, 1, 1, 1);
        }
        getCurrentVisibleRange() {
            return this.a;
        }
        setCurrentVisibleRange(currentVisibleRange) {
            this.a = currentVisibleRange;
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
    class $tX extends viewPart_1.$FW {
        /**
         * Adds this amount of pixels to the right of lines (no-one wants to type near the edge of the viewport)
         */
        static { this.a = 30; }
        constructor(context, linesContent) {
            super(context);
            this.b = linesContent;
            this.c = document.createElement('div');
            this.g = new viewLayer_1.$IW(this);
            this.j = this.g.domNode;
            const conf = this._context.configuration;
            const options = this._context.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            this.m = options.get(66 /* EditorOption.lineHeight */);
            this.n = fontInfo.typicalHalfwidthCharacterWidth;
            this.s = wrappingInfo.isViewportWrapping;
            this.t = options.get(99 /* EditorOption.revealHorizontalRightPadding */);
            this.u = options.get(29 /* EditorOption.cursorSurroundingLines */);
            this.w = options.get(30 /* EditorOption.cursorSurroundingLinesStyle */);
            this.y = !options.get(32 /* EditorOption.disableLayerHinting */);
            this.z = new viewLine_1.$XW(conf, this._context.theme.type);
            viewPart_1.$GW.write(this.j, 7 /* PartFingerprint.ViewLines */);
            this.j.setClassName(`view-lines ${mouseCursor_1.$WR}`);
            (0, domFontInfo_1.$vU)(this.j, fontInfo);
            // --- width & height
            this.C = 0;
            this.D = new async_1.$Sg(() => {
                this.Q();
            }, 200);
            this.F = new async_1.$Sg(() => {
                this.U();
            }, 2000);
            this.H = new LastRenderedData();
            this.G = null;
            // sticky scroll widget
            this.I = options.get(114 /* EditorOption.stickyScroll */).enabled;
            this.J = options.get(114 /* EditorOption.stickyScroll */).maxLineCount;
        }
        dispose() {
            this.D.dispose();
            this.F.dispose();
            super.dispose();
        }
        getDomNode() {
            return this.j;
        }
        // ---- begin IVisibleLinesHost
        createVisibleLine() {
            return new viewLine_1.$YW(this.z);
        }
        // ---- end IVisibleLinesHost
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            this.g.onConfigurationChanged(e);
            if (e.hasChanged(144 /* EditorOption.wrappingInfo */)) {
                this.C = 0;
            }
            const options = this._context.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            this.m = options.get(66 /* EditorOption.lineHeight */);
            this.n = fontInfo.typicalHalfwidthCharacterWidth;
            this.s = wrappingInfo.isViewportWrapping;
            this.t = options.get(99 /* EditorOption.revealHorizontalRightPadding */);
            this.u = options.get(29 /* EditorOption.cursorSurroundingLines */);
            this.w = options.get(30 /* EditorOption.cursorSurroundingLinesStyle */);
            this.y = !options.get(32 /* EditorOption.disableLayerHinting */);
            // sticky scroll
            this.I = options.get(114 /* EditorOption.stickyScroll */).enabled;
            this.J = options.get(114 /* EditorOption.stickyScroll */).maxLineCount;
            (0, domFontInfo_1.$vU)(this.j, fontInfo);
            this.L();
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                this.C = 0;
            }
            return true;
        }
        L() {
            const conf = this._context.configuration;
            const newViewLineOptions = new viewLine_1.$XW(conf, this._context.theme.type);
            if (!this.z.equals(newViewLineOptions)) {
                this.z = newViewLineOptions;
                const startLineNumber = this.g.getStartLineNumber();
                const endLineNumber = this.g.getEndLineNumber();
                for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                    const line = this.g.getVisibleLine(lineNumber);
                    line.onOptionsChanged(this.z);
                }
                return true;
            }
            return false;
        }
        onCursorStateChanged(e) {
            const rendStartLineNumber = this.g.getStartLineNumber();
            const rendEndLineNumber = this.g.getEndLineNumber();
            let r = false;
            for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                r = this.g.getVisibleLine(lineNumber).onSelectionChanged() || r;
            }
            return r;
        }
        onDecorationsChanged(e) {
            if (true /*e.inlineDecorationsChanged*/) {
                const rendStartLineNumber = this.g.getStartLineNumber();
                const rendEndLineNumber = this.g.getEndLineNumber();
                for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                    this.g.getVisibleLine(lineNumber).onDecorationsChanged();
                }
            }
            return true;
        }
        onFlushed(e) {
            const shouldRender = this.g.onFlushed(e);
            this.C = 0;
            return shouldRender;
        }
        onLinesChanged(e) {
            return this.g.onLinesChanged(e);
        }
        onLinesDeleted(e) {
            return this.g.onLinesDeleted(e);
        }
        onLinesInserted(e) {
            return this.g.onLinesInserted(e);
        }
        onRevealRangeRequest(e) {
            // Using the future viewport here in order to handle multiple
            // incoming reveal range requests that might all desire to be animated
            const desiredScrollTop = this.X(this._context.viewLayout.getFutureViewport(), e.source, e.minimalReveal, e.range, e.selections, e.verticalType);
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
                    this.G = new HorizontalRevealRangeRequest(e.minimalReveal, e.range.startLineNumber, e.range.startColumn, e.range.endColumn, this._context.viewLayout.getCurrentScrollTop(), newScrollPosition.scrollTop, e.scrollType);
                }
                else if (e.selections && e.selections.length > 0) {
                    this.G = new HorizontalRevealSelectionsRequest(e.minimalReveal, e.selections, this._context.viewLayout.getCurrentScrollTop(), newScrollPosition.scrollTop, e.scrollType);
                }
            }
            else {
                this.G = null;
            }
            const scrollTopDelta = Math.abs(this._context.viewLayout.getCurrentScrollTop() - newScrollPosition.scrollTop);
            const scrollType = (scrollTopDelta <= this.m ? 1 /* ScrollType.Immediate */ : e.scrollType);
            this._context.viewModel.viewLayout.setScrollPosition(newScrollPosition, scrollType);
            return true;
        }
        onScrollChanged(e) {
            if (this.G && e.scrollLeftChanged) {
                // cancel any outstanding horizontal reveal request if someone else scrolls horizontally.
                this.G = null;
            }
            if (this.G && e.scrollTopChanged) {
                const min = Math.min(this.G.startScrollTop, this.G.stopScrollTop);
                const max = Math.max(this.G.startScrollTop, this.G.stopScrollTop);
                if (e.scrollTop < min || e.scrollTop > max) {
                    // cancel any outstanding horizontal reveal request if someone else scrolls vertically.
                    this.G = null;
                }
            }
            this.j.setWidth(e.scrollWidth);
            return this.g.onScrollChanged(e) || true;
        }
        onTokensChanged(e) {
            return this.g.onTokensChanged(e);
        }
        onZonesChanged(e) {
            this._context.viewModel.viewLayout.setMaxLineWidth(this.C);
            return this.g.onZonesChanged(e);
        }
        onThemeChanged(e) {
            return this.L();
        }
        // ---- end view event handlers
        // ----------- HELPERS FOR OTHERS
        getPositionFromDOMInfo(spanNode, offset) {
            const viewLineDomNode = this.M(spanNode);
            if (viewLineDomNode === null) {
                // Couldn't find view line node
                return null;
            }
            const lineNumber = this.N(viewLineDomNode);
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
                return new position_1.$js(lineNumber, 1);
            }
            const rendStartLineNumber = this.g.getStartLineNumber();
            const rendEndLineNumber = this.g.getEndLineNumber();
            if (lineNumber < rendStartLineNumber || lineNumber > rendEndLineNumber) {
                // Couldn't find line
                return null;
            }
            let column = this.g.getVisibleLine(lineNumber).getColumnOfNodeOffset(spanNode, offset);
            const minColumn = this._context.viewModel.getLineMinColumn(lineNumber);
            if (column < minColumn) {
                column = minColumn;
            }
            return new position_1.$js(lineNumber, column);
        }
        M(node) {
            while (node && node.nodeType === 1) {
                if (node.className === viewLine_1.$YW.CLASS_NAME) {
                    return node;
                }
                node = node.parentElement;
            }
            return null;
        }
        /**
         * @returns the line number of this view line dom node.
         */
        N(domNode) {
            const startLineNumber = this.g.getStartLineNumber();
            const endLineNumber = this.g.getEndLineNumber();
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const line = this.g.getVisibleLine(lineNumber);
                if (domNode === line.getDomNode()) {
                    return lineNumber;
                }
            }
            return -1;
        }
        getLineWidth(lineNumber) {
            const rendStartLineNumber = this.g.getStartLineNumber();
            const rendEndLineNumber = this.g.getEndLineNumber();
            if (lineNumber < rendStartLineNumber || lineNumber > rendEndLineNumber) {
                // Couldn't find line
                return -1;
            }
            const context = new domReadingContext_1.$JW(this.j.domNode, this.c);
            const result = this.g.getVisibleLine(lineNumber).getWidth(context);
            this.R(context);
            return result;
        }
        linesVisibleRangesForRange(_range, includeNewLines) {
            if (this.shouldRender()) {
                // Cannot read from the DOM because it is dirty
                // i.e. the model & the dom are out of sync, so I'd be reading something stale
                return null;
            }
            const originalEndLineNumber = _range.endLineNumber;
            const range = range_1.$ks.intersectRanges(_range, this.H.getCurrentVisibleRange());
            if (!range) {
                return null;
            }
            const visibleRanges = [];
            let visibleRangesLen = 0;
            const domReadingContext = new domReadingContext_1.$JW(this.j.domNode, this.c);
            let nextLineModelLineNumber = 0;
            if (includeNewLines) {
                nextLineModelLineNumber = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.$js(range.startLineNumber, 1)).lineNumber;
            }
            const rendStartLineNumber = this.g.getStartLineNumber();
            const rendEndLineNumber = this.g.getEndLineNumber();
            for (let lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
                if (lineNumber < rendStartLineNumber || lineNumber > rendEndLineNumber) {
                    continue;
                }
                const startColumn = lineNumber === range.startLineNumber ? range.startColumn : 1;
                const continuesInNextLine = lineNumber !== range.endLineNumber;
                const endColumn = continuesInNextLine ? this._context.viewModel.getLineMaxColumn(lineNumber) : range.endColumn;
                const visibleRangesForLine = this.g.getVisibleLine(lineNumber).getVisibleRangesForRange(lineNumber, startColumn, endColumn, domReadingContext);
                if (!visibleRangesForLine) {
                    continue;
                }
                if (includeNewLines && lineNumber < originalEndLineNumber) {
                    const currentLineModelLineNumber = nextLineModelLineNumber;
                    nextLineModelLineNumber = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.$js(lineNumber + 1, 1)).lineNumber;
                    if (currentLineModelLineNumber !== nextLineModelLineNumber) {
                        visibleRangesForLine.ranges[visibleRangesForLine.ranges.length - 1].width += this.n;
                    }
                }
                visibleRanges[visibleRangesLen++] = new renderingContext_1.$zW(visibleRangesForLine.outsideRenderedLine, lineNumber, renderingContext_1.$AW.from(visibleRangesForLine.ranges), continuesInNextLine);
            }
            this.R(domReadingContext);
            if (visibleRangesLen === 0) {
                return null;
            }
            return visibleRanges;
        }
        O(lineNumber, startColumn, endColumn) {
            if (this.shouldRender()) {
                // Cannot read from the DOM because it is dirty
                // i.e. the model & the dom are out of sync, so I'd be reading something stale
                return null;
            }
            if (lineNumber < this.g.getStartLineNumber() || lineNumber > this.g.getEndLineNumber()) {
                return null;
            }
            const domReadingContext = new domReadingContext_1.$JW(this.j.domNode, this.c);
            const result = this.g.getVisibleLine(lineNumber).getVisibleRangesForRange(lineNumber, startColumn, endColumn, domReadingContext);
            this.R(domReadingContext);
            return result;
        }
        visibleRangeForPosition(position) {
            const visibleRanges = this.O(position.lineNumber, position.column, position.column);
            if (!visibleRanges) {
                return null;
            }
            return new renderingContext_1.$CW(visibleRanges.outsideRenderedLine, visibleRanges.ranges[0].left);
        }
        // --- implementation
        updateLineWidths() {
            this.S(false);
        }
        /**
         * Updates the max line width if it is fast to compute.
         * Returns true if all lines were taken into account.
         * Returns false if some lines need to be reevaluated (in a slow fashion).
         */
        P() {
            return this.S(true);
        }
        Q() {
            this.S(false);
        }
        /**
         * Update the line widths using DOM layout information after someone else
         * has caused a synchronous layout.
         */
        R(domReadingContext) {
            if (!domReadingContext.didDomLayout) {
                // only proceed if we just did a layout
                return;
            }
            if (this.D.isScheduled()) {
                // reading widths is not scheduled => widths are up-to-date
                return;
            }
            this.D.cancel();
            this.Q();
        }
        S(fast) {
            const rendStartLineNumber = this.g.getStartLineNumber();
            const rendEndLineNumber = this.g.getEndLineNumber();
            let localMaxLineWidth = 1;
            let allWidthsComputed = true;
            for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                const visibleLine = this.g.getVisibleLine(lineNumber);
                if (fast && !visibleLine.getWidthIsFast()) {
                    // Cannot compute width in a fast way for this line
                    allWidthsComputed = false;
                    continue;
                }
                localMaxLineWidth = Math.max(localMaxLineWidth, visibleLine.getWidth(null));
            }
            if (allWidthsComputed && rendStartLineNumber === 1 && rendEndLineNumber === this._context.viewModel.getLineCount()) {
                // we know the max line width for all the lines
                this.C = 0;
            }
            this.W(localMaxLineWidth);
            return allWidthsComputed;
        }
        U() {
            // Problems with monospace assumptions are more apparent for longer lines,
            // as small rounding errors start to sum up, so we will select the longest
            // line for a closer inspection
            let longestLineNumber = -1;
            let longestWidth = -1;
            const rendStartLineNumber = this.g.getStartLineNumber();
            const rendEndLineNumber = this.g.getEndLineNumber();
            for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                const visibleLine = this.g.getVisibleLine(lineNumber);
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
            if (!this.g.getVisibleLine(longestLineNumber).monospaceAssumptionsAreValid()) {
                for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                    const visibleLine = this.g.getVisibleLine(lineNumber);
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
            this.g.renderLines(viewportData);
            this.H.setCurrentVisibleRange(viewportData.visibleRange);
            this.j.setWidth(this._context.viewLayout.getScrollWidth());
            this.j.setHeight(Math.min(this._context.viewLayout.getScrollHeight(), 1000000));
            // (2) compute horizontal scroll position:
            //  - this must happen after the lines are in the DOM since it might need a line that rendered just now
            //  - it might change `scrollWidth` and `scrollLeft`
            if (this.G) {
                const horizontalRevealRequest = this.G;
                // Check that we have the line that contains the horizontal range in the viewport
                if (viewportData.startLineNumber <= horizontalRevealRequest.minLineNumber && horizontalRevealRequest.maxLineNumber <= viewportData.endLineNumber) {
                    this.G = null;
                    // allow `visibleRangesForRange2` to work
                    this.onDidRender();
                    // compute new scroll position
                    const newScrollLeft = this.Y(horizontalRevealRequest);
                    if (newScrollLeft) {
                        if (!this.s) {
                            // ensure `scrollWidth` is large enough
                            this.W(newScrollLeft.maxHorizontalOffset);
                        }
                        // set `scrollLeft`
                        this._context.viewModel.viewLayout.setScrollPosition({
                            scrollLeft: newScrollLeft.scrollLeft
                        }, horizontalRevealRequest.scrollType);
                    }
                }
            }
            // Update max line width (not so important, it is just so the horizontal scrollbar doesn't get too small)
            if (!this.P()) {
                // Computing the width of some lines would be slow => delay it
                this.D.schedule();
            }
            else {
                this.D.cancel();
            }
            if (platform.$k && !this.F.isScheduled()) {
                const rendStartLineNumber = this.g.getStartLineNumber();
                const rendEndLineNumber = this.g.getEndLineNumber();
                for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                    const visibleLine = this.g.getVisibleLine(lineNumber);
                    if (visibleLine.needsMonospaceFontCheck()) {
                        this.F.schedule();
                        break;
                    }
                }
            }
            // (3) handle scrolling
            this.b.setLayerHinting(this.y);
            this.b.setContain('strict');
            const adjustedScrollTop = this._context.viewLayout.getCurrentScrollTop() - viewportData.bigNumbersDelta;
            this.b.setTop(-adjustedScrollTop);
            this.b.setLeft(-this._context.viewLayout.getCurrentScrollLeft());
        }
        // --- width
        W(lineWidth) {
            const iLineWidth = Math.ceil(lineWidth);
            if (this.C < iLineWidth) {
                this.C = iLineWidth;
                this._context.viewModel.viewLayout.setMaxLineWidth(this.C);
            }
        }
        X(viewport, source, minimalReveal, range, selections, verticalType) {
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
                boxEndY = this._context.viewLayout.getVerticalOffsetForLineNumber(maxLineNumber) + this.m;
            }
            else if (range) {
                boxIsSingleRange = true;
                boxStartY = this._context.viewLayout.getVerticalOffsetForLineNumber(range.startLineNumber);
                boxEndY = this._context.viewLayout.getVerticalOffsetForLineNumber(range.endLineNumber) + this.m;
            }
            else {
                return -1;
            }
            const shouldIgnoreScrollOff = (source === 'mouse' || minimalReveal) && this.w === 'default';
            let paddingTop = 0;
            let paddingBottom = 0;
            if (!shouldIgnoreScrollOff) {
                const context = Math.min((viewportHeight / this.m) / 2, this.u);
                if (this.I) {
                    paddingTop = Math.max(context, this.J) * this.m;
                }
                else {
                    paddingTop = context * this.m;
                }
                paddingBottom = Math.max(0, (context - 1)) * this.m;
            }
            else {
                if (!minimalReveal) {
                    // Reveal one more line above (this case is hit when dragging)
                    paddingTop = this.m;
                }
            }
            if (!minimalReveal) {
                if (verticalType === 0 /* viewEvents.VerticalRevealType.Simple */ || verticalType === 4 /* viewEvents.VerticalRevealType.Bottom */) {
                    // Reveal one line more when the last line would be covered by the scrollbar - arrow down case or revealing a line explicitly at bottom
                    paddingBottom += this.m;
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
                    const desiredGapAbove = Math.max(5 * this.m, viewportHeight * 0.2);
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
                newScrollTop = this.Z(viewportStartY, viewportEndY, boxStartY, boxEndY, verticalType === 3 /* viewEvents.VerticalRevealType.Top */, verticalType === 4 /* viewEvents.VerticalRevealType.Bottom */);
            }
            return newScrollTop;
        }
        Y(horizontalRevealRequest) {
            const viewport = this._context.viewLayout.getCurrentViewport();
            const layoutInfo = this._context.configuration.options.get(143 /* EditorOption.layoutInfo */);
            const viewportStartX = viewport.left;
            const viewportEndX = viewportStartX + viewport.width - layoutInfo.verticalScrollbarWidth;
            let boxStartX = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
            let boxEndX = 0;
            if (horizontalRevealRequest.type === 'range') {
                const visibleRanges = this.O(horizontalRevealRequest.lineNumber, horizontalRevealRequest.startColumn, horizontalRevealRequest.endColumn);
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
                    const visibleRanges = this.O(selection.startLineNumber, selection.startColumn, selection.endColumn);
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
                boxStartX = Math.max(0, boxStartX - $tX.a);
                boxEndX += this.t;
            }
            if (horizontalRevealRequest.type === 'selections' && boxEndX - boxStartX > viewport.width) {
                return null;
            }
            const newScrollLeft = this.Z(viewportStartX, viewportEndX, boxStartX, boxEndX);
            return {
                scrollLeft: newScrollLeft,
                maxHorizontalOffset: boxEndX
            };
        }
        Z(viewportStart, viewportEnd, boxStart, boxEnd, revealAtStart, revealAtEnd) {
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
    exports.$tX = $tX;
});
//# sourceMappingURL=viewLines.js.map