/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/globalPointerMoveMonitor", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/browser/view/viewLayer", "vs/editor/browser/view/viewPart", "vs/editor/common/config/editorOptions", "vs/editor/common/core/range", "vs/editor/common/core/rgba", "vs/editor/common/viewModel/minimapTokensColorTracker", "vs/editor/common/viewModel", "vs/platform/theme/common/colorRegistry", "vs/editor/common/core/selection", "vs/base/browser/touch", "vs/editor/browser/viewParts/minimap/minimapCharRendererFactory", "vs/editor/common/model", "vs/base/common/functional", "vs/css!./minimap"], function (require, exports, dom, fastDomNode_1, globalPointerMoveMonitor_1, lifecycle_1, platform, strings, viewLayer_1, viewPart_1, editorOptions_1, range_1, rgba_1, minimapTokensColorTracker_1, viewModel_1, colorRegistry_1, selection_1, touch_1, minimapCharRendererFactory_1, model_1, functional_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IX = void 0;
    /**
     * The orthogonal distance to the slider at which dragging "resets". This implements "snapping"
     */
    const POINTER_DRAG_RESET_DISTANCE = 140;
    const GUTTER_DECORATION_WIDTH = 2;
    class MinimapOptions {
        constructor(configuration, theme, tokensColorTracker) {
            const options = configuration.options;
            const pixelRatio = options.get(141 /* EditorOption.pixelRatio */);
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const minimapLayout = layoutInfo.minimap;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const minimapOpts = options.get(72 /* EditorOption.minimap */);
            this.renderMinimap = minimapLayout.renderMinimap;
            this.size = minimapOpts.size;
            this.minimapHeightIsEditorHeight = minimapLayout.minimapHeightIsEditorHeight;
            this.scrollBeyondLastLine = options.get(104 /* EditorOption.scrollBeyondLastLine */);
            this.paddingTop = options.get(83 /* EditorOption.padding */).top;
            this.paddingBottom = options.get(83 /* EditorOption.padding */).bottom;
            this.showSlider = minimapOpts.showSlider;
            this.autohide = minimapOpts.autohide;
            this.pixelRatio = pixelRatio;
            this.typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
            this.lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this.minimapLeft = minimapLayout.minimapLeft;
            this.minimapWidth = minimapLayout.minimapWidth;
            this.minimapHeight = layoutInfo.height;
            this.canvasInnerWidth = minimapLayout.minimapCanvasInnerWidth;
            this.canvasInnerHeight = minimapLayout.minimapCanvasInnerHeight;
            this.canvasOuterWidth = minimapLayout.minimapCanvasOuterWidth;
            this.canvasOuterHeight = minimapLayout.minimapCanvasOuterHeight;
            this.isSampling = minimapLayout.minimapIsSampling;
            this.editorHeight = layoutInfo.height;
            this.fontScale = minimapLayout.minimapScale;
            this.minimapLineHeight = minimapLayout.minimapLineHeight;
            this.minimapCharWidth = 1 /* Constants.BASE_CHAR_WIDTH */ * this.fontScale;
            this.charRenderer = (0, functional_1.$bb)(() => minimapCharRendererFactory_1.$HX.create(this.fontScale, fontInfo.fontFamily));
            this.defaultBackgroundColor = tokensColorTracker.getColor(2 /* ColorId.DefaultBackground */);
            this.backgroundColor = MinimapOptions.c(theme, this.defaultBackgroundColor);
            this.foregroundAlpha = MinimapOptions.d(theme);
        }
        static c(theme, defaultBackgroundColor) {
            const themeColor = theme.getColor(colorRegistry_1.$Hy);
            if (themeColor) {
                return new rgba_1.$BX(themeColor.rgba.r, themeColor.rgba.g, themeColor.rgba.b, Math.round(255 * themeColor.rgba.a));
            }
            return defaultBackgroundColor;
        }
        static d(theme) {
            const themeColor = theme.getColor(colorRegistry_1.$Iy);
            if (themeColor) {
                return rgba_1.$BX._clamp(Math.round(255 * themeColor.rgba.a));
            }
            return 255;
        }
        equals(other) {
            return (this.renderMinimap === other.renderMinimap
                && this.size === other.size
                && this.minimapHeightIsEditorHeight === other.minimapHeightIsEditorHeight
                && this.scrollBeyondLastLine === other.scrollBeyondLastLine
                && this.paddingTop === other.paddingTop
                && this.paddingBottom === other.paddingBottom
                && this.showSlider === other.showSlider
                && this.autohide === other.autohide
                && this.pixelRatio === other.pixelRatio
                && this.typicalHalfwidthCharacterWidth === other.typicalHalfwidthCharacterWidth
                && this.lineHeight === other.lineHeight
                && this.minimapLeft === other.minimapLeft
                && this.minimapWidth === other.minimapWidth
                && this.minimapHeight === other.minimapHeight
                && this.canvasInnerWidth === other.canvasInnerWidth
                && this.canvasInnerHeight === other.canvasInnerHeight
                && this.canvasOuterWidth === other.canvasOuterWidth
                && this.canvasOuterHeight === other.canvasOuterHeight
                && this.isSampling === other.isSampling
                && this.editorHeight === other.editorHeight
                && this.fontScale === other.fontScale
                && this.minimapLineHeight === other.minimapLineHeight
                && this.minimapCharWidth === other.minimapCharWidth
                && this.defaultBackgroundColor && this.defaultBackgroundColor.equals(other.defaultBackgroundColor)
                && this.backgroundColor && this.backgroundColor.equals(other.backgroundColor)
                && this.foregroundAlpha === other.foregroundAlpha);
        }
    }
    class MinimapLayout {
        constructor(
        /**
         * The given editor scrollTop (input).
         */
        scrollTop, 
        /**
         * The given editor scrollHeight (input).
         */
        scrollHeight, sliderNeeded, c, 
        /**
         * slider dom node top (in CSS px)
         */
        sliderTop, 
        /**
         * slider dom node height (in CSS px)
         */
        sliderHeight, 
        /**
         * empty lines to reserve at the top of the minimap.
         */
        topPaddingLineCount, 
        /**
         * minimap render start line number.
         */
        startLineNumber, 
        /**
         * minimap render end line number.
         */
        endLineNumber) {
            this.scrollTop = scrollTop;
            this.scrollHeight = scrollHeight;
            this.sliderNeeded = sliderNeeded;
            this.c = c;
            this.sliderTop = sliderTop;
            this.sliderHeight = sliderHeight;
            this.topPaddingLineCount = topPaddingLineCount;
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
        }
        /**
         * Compute a desired `scrollPosition` such that the slider moves by `delta`.
         */
        getDesiredScrollTopFromDelta(delta) {
            return Math.round(this.scrollTop + delta / this.c);
        }
        getDesiredScrollTopFromTouchLocation(pageY) {
            return Math.round((pageY - this.sliderHeight / 2) / this.c);
        }
        /**
         * Intersect a line range with `this.startLineNumber` and `this.endLineNumber`.
         */
        intersectWithViewport(range) {
            const startLineNumber = Math.max(this.startLineNumber, range.startLineNumber);
            const endLineNumber = Math.min(this.endLineNumber, range.endLineNumber);
            if (startLineNumber > endLineNumber) {
                // entirely outside minimap's viewport
                return null;
            }
            return [startLineNumber, endLineNumber];
        }
        /**
         * Get the inner minimap y coordinate for a line number.
         */
        getYForLineNumber(lineNumber, minimapLineHeight) {
            return +(lineNumber - this.startLineNumber + this.topPaddingLineCount) * minimapLineHeight;
        }
        static create(options, viewportStartLineNumber, viewportEndLineNumber, viewportStartLineNumberVerticalOffset, viewportHeight, viewportContainsWhitespaceGaps, lineCount, realLineCount, scrollTop, scrollHeight, previousLayout) {
            const pixelRatio = options.pixelRatio;
            const minimapLineHeight = options.minimapLineHeight;
            const minimapLinesFitting = Math.floor(options.canvasInnerHeight / minimapLineHeight);
            const lineHeight = options.lineHeight;
            if (options.minimapHeightIsEditorHeight) {
                let logicalScrollHeight = (realLineCount * options.lineHeight
                    + options.paddingTop
                    + options.paddingBottom);
                if (options.scrollBeyondLastLine) {
                    logicalScrollHeight += Math.max(0, viewportHeight - options.lineHeight - options.paddingBottom);
                }
                const sliderHeight = Math.max(1, Math.floor(viewportHeight * viewportHeight / logicalScrollHeight));
                const maxMinimapSliderTop = Math.max(0, options.minimapHeight - sliderHeight);
                // The slider can move from 0 to `maxMinimapSliderTop`
                // in the same way `scrollTop` can move from 0 to `scrollHeight` - `viewportHeight`.
                const computedSliderRatio = (maxMinimapSliderTop) / (scrollHeight - viewportHeight);
                const sliderTop = (scrollTop * computedSliderRatio);
                const sliderNeeded = (maxMinimapSliderTop > 0);
                const maxLinesFitting = Math.floor(options.canvasInnerHeight / options.minimapLineHeight);
                const topPaddingLineCount = Math.floor(options.paddingTop / options.lineHeight);
                return new MinimapLayout(scrollTop, scrollHeight, sliderNeeded, computedSliderRatio, sliderTop, sliderHeight, topPaddingLineCount, 1, Math.min(lineCount, maxLinesFitting));
            }
            // The visible line count in a viewport can change due to a number of reasons:
            //  a) with the same viewport width, different scroll positions can result in partial lines being visible:
            //    e.g. for a line height of 20, and a viewport height of 600
            //          * scrollTop = 0  => visible lines are [1, 30]
            //          * scrollTop = 10 => visible lines are [1, 31] (with lines 1 and 31 partially visible)
            //          * scrollTop = 20 => visible lines are [2, 31]
            //  b) whitespace gaps might make their way in the viewport (which results in a decrease in the visible line count)
            //  c) we could be in the scroll beyond last line case (which also results in a decrease in the visible line count, down to possibly only one line being visible)
            // We must first establish a desirable slider height.
            let sliderHeight;
            if (viewportContainsWhitespaceGaps && viewportEndLineNumber !== lineCount) {
                // case b) from above: there are whitespace gaps in the viewport.
                // In this case, the height of the slider directly reflects the visible line count.
                const viewportLineCount = viewportEndLineNumber - viewportStartLineNumber + 1;
                sliderHeight = Math.floor(viewportLineCount * minimapLineHeight / pixelRatio);
            }
            else {
                // The slider has a stable height
                const expectedViewportLineCount = viewportHeight / lineHeight;
                sliderHeight = Math.floor(expectedViewportLineCount * minimapLineHeight / pixelRatio);
            }
            const extraLinesAtTheTop = Math.floor(options.paddingTop / lineHeight);
            let extraLinesAtTheBottom = Math.floor(options.paddingBottom / lineHeight);
            if (options.scrollBeyondLastLine) {
                const expectedViewportLineCount = viewportHeight / lineHeight;
                extraLinesAtTheBottom = Math.max(extraLinesAtTheBottom, expectedViewportLineCount - 1);
            }
            let maxMinimapSliderTop;
            if (extraLinesAtTheBottom > 0) {
                const expectedViewportLineCount = viewportHeight / lineHeight;
                // The minimap slider, when dragged all the way down, will contain the last line at its top
                maxMinimapSliderTop = (extraLinesAtTheTop + lineCount + extraLinesAtTheBottom - expectedViewportLineCount - 1) * minimapLineHeight / pixelRatio;
            }
            else {
                // The minimap slider, when dragged all the way down, will contain the last line at its bottom
                maxMinimapSliderTop = Math.max(0, (extraLinesAtTheTop + lineCount) * minimapLineHeight / pixelRatio - sliderHeight);
            }
            maxMinimapSliderTop = Math.min(options.minimapHeight - sliderHeight, maxMinimapSliderTop);
            // The slider can move from 0 to `maxMinimapSliderTop`
            // in the same way `scrollTop` can move from 0 to `scrollHeight` - `viewportHeight`.
            const computedSliderRatio = (maxMinimapSliderTop) / (scrollHeight - viewportHeight);
            const sliderTop = (scrollTop * computedSliderRatio);
            if (minimapLinesFitting >= extraLinesAtTheTop + lineCount + extraLinesAtTheBottom) {
                // All lines fit in the minimap
                const sliderNeeded = (maxMinimapSliderTop > 0);
                return new MinimapLayout(scrollTop, scrollHeight, sliderNeeded, computedSliderRatio, sliderTop, sliderHeight, extraLinesAtTheTop, 1, lineCount);
            }
            else {
                let consideringStartLineNumber;
                if (viewportStartLineNumber > 1) {
                    consideringStartLineNumber = viewportStartLineNumber + extraLinesAtTheTop;
                }
                else {
                    consideringStartLineNumber = Math.max(1, scrollTop / lineHeight);
                }
                let topPaddingLineCount;
                let startLineNumber = Math.max(1, Math.floor(consideringStartLineNumber - sliderTop * pixelRatio / minimapLineHeight));
                if (startLineNumber < extraLinesAtTheTop) {
                    topPaddingLineCount = extraLinesAtTheTop - startLineNumber + 1;
                    startLineNumber = 1;
                }
                else {
                    topPaddingLineCount = 0;
                    startLineNumber = Math.max(1, startLineNumber - extraLinesAtTheTop);
                }
                // Avoid flickering caused by a partial viewport start line
                // by being consistent w.r.t. the previous layout decision
                if (previousLayout && previousLayout.scrollHeight === scrollHeight) {
                    if (previousLayout.scrollTop > scrollTop) {
                        // Scrolling up => never increase `startLineNumber`
                        startLineNumber = Math.min(startLineNumber, previousLayout.startLineNumber);
                        topPaddingLineCount = Math.max(topPaddingLineCount, previousLayout.topPaddingLineCount);
                    }
                    if (previousLayout.scrollTop < scrollTop) {
                        // Scrolling down => never decrease `startLineNumber`
                        startLineNumber = Math.max(startLineNumber, previousLayout.startLineNumber);
                        topPaddingLineCount = Math.min(topPaddingLineCount, previousLayout.topPaddingLineCount);
                    }
                }
                const endLineNumber = Math.min(lineCount, startLineNumber - topPaddingLineCount + minimapLinesFitting - 1);
                const partialLine = (scrollTop - viewportStartLineNumberVerticalOffset) / lineHeight;
                let sliderTopAligned;
                if (scrollTop >= options.paddingTop) {
                    sliderTopAligned = (viewportStartLineNumber - startLineNumber + topPaddingLineCount + partialLine) * minimapLineHeight / pixelRatio;
                }
                else {
                    sliderTopAligned = (scrollTop / options.paddingTop) * (topPaddingLineCount + partialLine) * minimapLineHeight / pixelRatio;
                }
                return new MinimapLayout(scrollTop, scrollHeight, true, computedSliderRatio, sliderTopAligned, sliderHeight, topPaddingLineCount, startLineNumber, endLineNumber);
            }
        }
    }
    class MinimapLine {
        static { this.INVALID = new MinimapLine(-1); }
        constructor(dy) {
            this.dy = dy;
        }
        onContentChanged() {
            this.dy = -1;
        }
        onTokensChanged() {
            this.dy = -1;
        }
    }
    class RenderData {
        constructor(renderedLayout, imageData, lines) {
            this.renderedLayout = renderedLayout;
            this.c = imageData;
            this.d = new viewLayer_1.$HW(() => MinimapLine.INVALID);
            this.d._set(renderedLayout.startLineNumber, lines);
        }
        /**
         * Check if the current RenderData matches accurately the new desired layout and no painting is needed.
         */
        linesEquals(layout) {
            if (!this.scrollEquals(layout)) {
                return false;
            }
            const tmp = this.d._get();
            const lines = tmp.lines;
            for (let i = 0, len = lines.length; i < len; i++) {
                if (lines[i].dy === -1) {
                    // This line is invalid
                    return false;
                }
            }
            return true;
        }
        /**
         * Check if the current RenderData matches the new layout's scroll position
         */
        scrollEquals(layout) {
            return this.renderedLayout.startLineNumber === layout.startLineNumber
                && this.renderedLayout.endLineNumber === layout.endLineNumber;
        }
        _get() {
            const tmp = this.d._get();
            return {
                imageData: this.c,
                rendLineNumberStart: tmp.rendLineNumberStart,
                lines: tmp.lines
            };
        }
        onLinesChanged(changeFromLineNumber, changeCount) {
            return this.d.onLinesChanged(changeFromLineNumber, changeCount);
        }
        onLinesDeleted(deleteFromLineNumber, deleteToLineNumber) {
            this.d.onLinesDeleted(deleteFromLineNumber, deleteToLineNumber);
        }
        onLinesInserted(insertFromLineNumber, insertToLineNumber) {
            this.d.onLinesInserted(insertFromLineNumber, insertToLineNumber);
        }
        onTokensChanged(ranges) {
            return this.d.onTokensChanged(ranges);
        }
    }
    /**
     * Some sort of double buffering.
     *
     * Keeps two buffers around that will be rotated for painting.
     * Always gives a buffer that is filled with the background color.
     */
    class MinimapBuffers {
        constructor(ctx, WIDTH, HEIGHT, background) {
            this.c = MinimapBuffers.h(WIDTH, HEIGHT, background);
            this.d = [
                ctx.createImageData(WIDTH, HEIGHT),
                ctx.createImageData(WIDTH, HEIGHT)
            ];
            this.f = 0;
        }
        getBuffer() {
            // rotate buffers
            this.f = 1 - this.f;
            const result = this.d[this.f];
            // fill with background color
            result.data.set(this.c);
            return result;
        }
        static h(WIDTH, HEIGHT, background) {
            const backgroundR = background.r;
            const backgroundG = background.g;
            const backgroundB = background.b;
            const backgroundA = background.a;
            const result = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
            let offset = 0;
            for (let i = 0; i < HEIGHT; i++) {
                for (let j = 0; j < WIDTH; j++) {
                    result[offset] = backgroundR;
                    result[offset + 1] = backgroundG;
                    result[offset + 2] = backgroundB;
                    result[offset + 3] = backgroundA;
                    offset += 4;
                }
            }
            return result;
        }
    }
    class MinimapSamplingState {
        static compute(options, viewLineCount, oldSamplingState) {
            if (options.renderMinimap === 0 /* RenderMinimap.None */ || !options.isSampling) {
                return [null, []];
            }
            // ratio is intentionally not part of the layout to avoid the layout changing all the time
            // so we need to recompute it again...
            const { minimapLineCount } = editorOptions_1.EditorLayoutInfoComputer.computeContainedMinimapLineCount({
                viewLineCount: viewLineCount,
                scrollBeyondLastLine: options.scrollBeyondLastLine,
                paddingTop: options.paddingTop,
                paddingBottom: options.paddingBottom,
                height: options.editorHeight,
                lineHeight: options.lineHeight,
                pixelRatio: options.pixelRatio
            });
            const ratio = viewLineCount / minimapLineCount;
            const halfRatio = ratio / 2;
            if (!oldSamplingState || oldSamplingState.minimapLines.length === 0) {
                const result = [];
                result[0] = 1;
                if (minimapLineCount > 1) {
                    for (let i = 0, lastIndex = minimapLineCount - 1; i < lastIndex; i++) {
                        result[i] = Math.round(i * ratio + halfRatio);
                    }
                    result[minimapLineCount - 1] = viewLineCount;
                }
                return [new MinimapSamplingState(ratio, result), []];
            }
            const oldMinimapLines = oldSamplingState.minimapLines;
            const oldLength = oldMinimapLines.length;
            const result = [];
            let oldIndex = 0;
            let oldDeltaLineCount = 0;
            let minViewLineNumber = 1;
            const MAX_EVENT_COUNT = 10; // generate at most 10 events, if there are more than 10 changes, just flush all previous data
            let events = [];
            let lastEvent = null;
            for (let i = 0; i < minimapLineCount; i++) {
                const fromViewLineNumber = Math.max(minViewLineNumber, Math.round(i * ratio));
                const toViewLineNumber = Math.max(fromViewLineNumber, Math.round((i + 1) * ratio));
                while (oldIndex < oldLength && oldMinimapLines[oldIndex] < fromViewLineNumber) {
                    if (events.length < MAX_EVENT_COUNT) {
                        const oldMinimapLineNumber = oldIndex + 1 + oldDeltaLineCount;
                        if (lastEvent && lastEvent.type === 'deleted' && lastEvent._oldIndex === oldIndex - 1) {
                            lastEvent.deleteToLineNumber++;
                        }
                        else {
                            lastEvent = { type: 'deleted', _oldIndex: oldIndex, deleteFromLineNumber: oldMinimapLineNumber, deleteToLineNumber: oldMinimapLineNumber };
                            events.push(lastEvent);
                        }
                        oldDeltaLineCount--;
                    }
                    oldIndex++;
                }
                let selectedViewLineNumber;
                if (oldIndex < oldLength && oldMinimapLines[oldIndex] <= toViewLineNumber) {
                    // reuse the old sampled line
                    selectedViewLineNumber = oldMinimapLines[oldIndex];
                    oldIndex++;
                }
                else {
                    if (i === 0) {
                        selectedViewLineNumber = 1;
                    }
                    else if (i + 1 === minimapLineCount) {
                        selectedViewLineNumber = viewLineCount;
                    }
                    else {
                        selectedViewLineNumber = Math.round(i * ratio + halfRatio);
                    }
                    if (events.length < MAX_EVENT_COUNT) {
                        const oldMinimapLineNumber = oldIndex + 1 + oldDeltaLineCount;
                        if (lastEvent && lastEvent.type === 'inserted' && lastEvent._i === i - 1) {
                            lastEvent.insertToLineNumber++;
                        }
                        else {
                            lastEvent = { type: 'inserted', _i: i, insertFromLineNumber: oldMinimapLineNumber, insertToLineNumber: oldMinimapLineNumber };
                            events.push(lastEvent);
                        }
                        oldDeltaLineCount++;
                    }
                }
                result[i] = selectedViewLineNumber;
                minViewLineNumber = selectedViewLineNumber;
            }
            if (events.length < MAX_EVENT_COUNT) {
                while (oldIndex < oldLength) {
                    const oldMinimapLineNumber = oldIndex + 1 + oldDeltaLineCount;
                    if (lastEvent && lastEvent.type === 'deleted' && lastEvent._oldIndex === oldIndex - 1) {
                        lastEvent.deleteToLineNumber++;
                    }
                    else {
                        lastEvent = { type: 'deleted', _oldIndex: oldIndex, deleteFromLineNumber: oldMinimapLineNumber, deleteToLineNumber: oldMinimapLineNumber };
                        events.push(lastEvent);
                    }
                    oldDeltaLineCount--;
                    oldIndex++;
                }
            }
            else {
                // too many events, just give up
                events = [{ type: 'flush' }];
            }
            return [new MinimapSamplingState(ratio, result), events];
        }
        constructor(samplingRatio, minimapLines) {
            this.samplingRatio = samplingRatio;
            this.minimapLines = minimapLines;
        }
        modelLineToMinimapLine(lineNumber) {
            return Math.min(this.minimapLines.length, Math.max(1, Math.round(lineNumber / this.samplingRatio)));
        }
        /**
         * Will return null if the model line ranges are not intersecting with a sampled model line.
         */
        modelLineRangeToMinimapLineRange(fromLineNumber, toLineNumber) {
            let fromLineIndex = this.modelLineToMinimapLine(fromLineNumber) - 1;
            while (fromLineIndex > 0 && this.minimapLines[fromLineIndex - 1] >= fromLineNumber) {
                fromLineIndex--;
            }
            let toLineIndex = this.modelLineToMinimapLine(toLineNumber) - 1;
            while (toLineIndex + 1 < this.minimapLines.length && this.minimapLines[toLineIndex + 1] <= toLineNumber) {
                toLineIndex++;
            }
            if (fromLineIndex === toLineIndex) {
                const sampledLineNumber = this.minimapLines[fromLineIndex];
                if (sampledLineNumber < fromLineNumber || sampledLineNumber > toLineNumber) {
                    // This line is not part of the sampled lines ==> nothing to do
                    return null;
                }
            }
            return [fromLineIndex + 1, toLineIndex + 1];
        }
        /**
         * Will always return a range, even if it is not intersecting with a sampled model line.
         */
        decorationLineRangeToMinimapLineRange(startLineNumber, endLineNumber) {
            let minimapLineStart = this.modelLineToMinimapLine(startLineNumber);
            let minimapLineEnd = this.modelLineToMinimapLine(endLineNumber);
            if (startLineNumber !== endLineNumber && minimapLineEnd === minimapLineStart) {
                if (minimapLineEnd === this.minimapLines.length) {
                    if (minimapLineStart > 1) {
                        minimapLineStart--;
                    }
                }
                else {
                    minimapLineEnd++;
                }
            }
            return [minimapLineStart, minimapLineEnd];
        }
        onLinesDeleted(e) {
            // have the mapping be sticky
            const deletedLineCount = e.toLineNumber - e.fromLineNumber + 1;
            let changeStartIndex = this.minimapLines.length;
            let changeEndIndex = 0;
            for (let i = this.minimapLines.length - 1; i >= 0; i--) {
                if (this.minimapLines[i] < e.fromLineNumber) {
                    break;
                }
                if (this.minimapLines[i] <= e.toLineNumber) {
                    // this line got deleted => move to previous available
                    this.minimapLines[i] = Math.max(1, e.fromLineNumber - 1);
                    changeStartIndex = Math.min(changeStartIndex, i);
                    changeEndIndex = Math.max(changeEndIndex, i);
                }
                else {
                    this.minimapLines[i] -= deletedLineCount;
                }
            }
            return [changeStartIndex, changeEndIndex];
        }
        onLinesInserted(e) {
            // have the mapping be sticky
            const insertedLineCount = e.toLineNumber - e.fromLineNumber + 1;
            for (let i = this.minimapLines.length - 1; i >= 0; i--) {
                if (this.minimapLines[i] < e.fromLineNumber) {
                    break;
                }
                this.minimapLines[i] += insertedLineCount;
            }
        }
    }
    class $IX extends viewPart_1.$FW {
        constructor(context) {
            super(context);
            this.tokensColorTracker = minimapTokensColorTracker_1.$FX.getInstance();
            this.c = [];
            this.m = null;
            this.options = new MinimapOptions(this._context.configuration, this._context.theme, this.tokensColorTracker);
            const [samplingState,] = MinimapSamplingState.compute(this.options, this._context.viewModel.getLineCount(), null);
            this.n = samplingState;
            this.s = false;
            this.t = new InnerMinimap(context.theme, this);
        }
        dispose() {
            this.t.dispose();
            super.dispose();
        }
        getDomNode() {
            return this.t.getDomNode();
        }
        u() {
            const opts = new MinimapOptions(this._context.configuration, this._context.theme, this.tokensColorTracker);
            if (this.options.equals(opts)) {
                return false;
            }
            this.options = opts;
            this.w();
            this.t.onDidChangeOptions();
            return true;
        }
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            return this.u();
        }
        onCursorStateChanged(e) {
            this.c = e.selections;
            this.m = null;
            return this.t.onSelectionChanged();
        }
        onDecorationsChanged(e) {
            if (e.affectsMinimap) {
                return this.t.onDecorationsChanged();
            }
            return false;
        }
        onFlushed(e) {
            if (this.n) {
                this.s = true;
            }
            return this.t.onFlushed();
        }
        onLinesChanged(e) {
            if (this.n) {
                const minimapLineRange = this.n.modelLineRangeToMinimapLineRange(e.fromLineNumber, e.fromLineNumber + e.count - 1);
                if (minimapLineRange) {
                    return this.t.onLinesChanged(minimapLineRange[0], minimapLineRange[1] - minimapLineRange[0] + 1);
                }
                else {
                    return false;
                }
            }
            else {
                return this.t.onLinesChanged(e.fromLineNumber, e.count);
            }
        }
        onLinesDeleted(e) {
            if (this.n) {
                const [changeStartIndex, changeEndIndex] = this.n.onLinesDeleted(e);
                if (changeStartIndex <= changeEndIndex) {
                    this.t.onLinesChanged(changeStartIndex + 1, changeEndIndex - changeStartIndex + 1);
                }
                this.s = true;
                return true;
            }
            else {
                return this.t.onLinesDeleted(e.fromLineNumber, e.toLineNumber);
            }
        }
        onLinesInserted(e) {
            if (this.n) {
                this.n.onLinesInserted(e);
                this.s = true;
                return true;
            }
            else {
                return this.t.onLinesInserted(e.fromLineNumber, e.toLineNumber);
            }
        }
        onScrollChanged(e) {
            return this.t.onScrollChanged();
        }
        onThemeChanged(e) {
            this.t.onThemeChanged();
            this.u();
            return true;
        }
        onTokensChanged(e) {
            if (this.n) {
                const ranges = [];
                for (const range of e.ranges) {
                    const minimapLineRange = this.n.modelLineRangeToMinimapLineRange(range.fromLineNumber, range.toLineNumber);
                    if (minimapLineRange) {
                        ranges.push({ fromLineNumber: minimapLineRange[0], toLineNumber: minimapLineRange[1] });
                    }
                }
                if (ranges.length) {
                    return this.t.onTokensChanged(ranges);
                }
                else {
                    return false;
                }
            }
            else {
                return this.t.onTokensChanged(e.ranges);
            }
        }
        onTokensColorsChanged(e) {
            this.u();
            return this.t.onTokensColorsChanged();
        }
        onZonesChanged(e) {
            return this.t.onZonesChanged();
        }
        // --- end event handlers
        prepareRender(ctx) {
            if (this.s) {
                this.s = false;
                this.w();
            }
        }
        render(ctx) {
            let viewportStartLineNumber = ctx.visibleRange.startLineNumber;
            let viewportEndLineNumber = ctx.visibleRange.endLineNumber;
            if (this.n) {
                viewportStartLineNumber = this.n.modelLineToMinimapLine(viewportStartLineNumber);
                viewportEndLineNumber = this.n.modelLineToMinimapLine(viewportEndLineNumber);
            }
            const minimapCtx = {
                viewportContainsWhitespaceGaps: (ctx.viewportData.whitespaceViewportData.length > 0),
                scrollWidth: ctx.scrollWidth,
                scrollHeight: ctx.scrollHeight,
                viewportStartLineNumber: viewportStartLineNumber,
                viewportEndLineNumber: viewportEndLineNumber,
                viewportStartLineNumberVerticalOffset: ctx.getVerticalOffsetForLineNumber(viewportStartLineNumber),
                scrollTop: ctx.scrollTop,
                scrollLeft: ctx.scrollLeft,
                viewportWidth: ctx.viewportWidth,
                viewportHeight: ctx.viewportHeight,
            };
            this.t.render(minimapCtx);
        }
        //#region IMinimapModel
        w() {
            this.m = null;
            const wasSampling = Boolean(this.n);
            const [samplingState, events] = MinimapSamplingState.compute(this.options, this._context.viewModel.getLineCount(), this.n);
            this.n = samplingState;
            if (wasSampling && this.n) {
                // was sampling, is sampling
                for (const event of events) {
                    switch (event.type) {
                        case 'deleted':
                            this.t.onLinesDeleted(event.deleteFromLineNumber, event.deleteToLineNumber);
                            break;
                        case 'inserted':
                            this.t.onLinesInserted(event.insertFromLineNumber, event.insertToLineNumber);
                            break;
                        case 'flush':
                            this.t.onFlushed();
                            break;
                    }
                }
            }
        }
        getLineCount() {
            if (this.n) {
                return this.n.minimapLines.length;
            }
            return this._context.viewModel.getLineCount();
        }
        getRealLineCount() {
            return this._context.viewModel.getLineCount();
        }
        getLineContent(lineNumber) {
            if (this.n) {
                return this._context.viewModel.getLineContent(this.n.minimapLines[lineNumber - 1]);
            }
            return this._context.viewModel.getLineContent(lineNumber);
        }
        getLineMaxColumn(lineNumber) {
            if (this.n) {
                return this._context.viewModel.getLineMaxColumn(this.n.minimapLines[lineNumber - 1]);
            }
            return this._context.viewModel.getLineMaxColumn(lineNumber);
        }
        getMinimapLinesRenderingData(startLineNumber, endLineNumber, needed) {
            if (this.n) {
                const result = [];
                for (let lineIndex = 0, lineCount = endLineNumber - startLineNumber + 1; lineIndex < lineCount; lineIndex++) {
                    if (needed[lineIndex]) {
                        result[lineIndex] = this._context.viewModel.getViewLineData(this.n.minimapLines[startLineNumber + lineIndex - 1]);
                    }
                    else {
                        result[lineIndex] = null;
                    }
                }
                return result;
            }
            return this._context.viewModel.getMinimapLinesRenderingData(startLineNumber, endLineNumber, needed).data;
        }
        getSelections() {
            if (this.m === null) {
                if (this.n) {
                    this.m = [];
                    for (const selection of this.c) {
                        const [minimapLineStart, minimapLineEnd] = this.n.decorationLineRangeToMinimapLineRange(selection.startLineNumber, selection.endLineNumber);
                        this.m.push(new selection_1.$ms(minimapLineStart, selection.startColumn, minimapLineEnd, selection.endColumn));
                    }
                }
                else {
                    this.m = this.c;
                }
            }
            return this.m;
        }
        getMinimapDecorationsInViewport(startLineNumber, endLineNumber) {
            let visibleRange;
            if (this.n) {
                const modelStartLineNumber = this.n.minimapLines[startLineNumber - 1];
                const modelEndLineNumber = this.n.minimapLines[endLineNumber - 1];
                visibleRange = new range_1.$ks(modelStartLineNumber, 1, modelEndLineNumber, this._context.viewModel.getLineMaxColumn(modelEndLineNumber));
            }
            else {
                visibleRange = new range_1.$ks(startLineNumber, 1, endLineNumber, this._context.viewModel.getLineMaxColumn(endLineNumber));
            }
            const decorations = this._context.viewModel.getMinimapDecorationsInRange(visibleRange);
            if (this.n) {
                const result = [];
                for (const decoration of decorations) {
                    if (!decoration.options.minimap) {
                        continue;
                    }
                    const range = decoration.range;
                    const minimapStartLineNumber = this.n.modelLineToMinimapLine(range.startLineNumber);
                    const minimapEndLineNumber = this.n.modelLineToMinimapLine(range.endLineNumber);
                    result.push(new viewModel_1.$dV(new range_1.$ks(minimapStartLineNumber, range.startColumn, minimapEndLineNumber, range.endColumn), decoration.options));
                }
                return result;
            }
            return decorations;
        }
        getOptions() {
            return this._context.viewModel.model.getOptions();
        }
        revealLineNumber(lineNumber) {
            if (this.n) {
                lineNumber = this.n.minimapLines[lineNumber - 1];
            }
            this._context.viewModel.revealRange('mouse', false, new range_1.$ks(lineNumber, 1, lineNumber, 1), 1 /* viewEvents.VerticalRevealType.Center */, 0 /* ScrollType.Smooth */);
        }
        setScrollTop(scrollTop) {
            this._context.viewModel.viewLayout.setScrollPosition({
                scrollTop: scrollTop
            }, 1 /* ScrollType.Immediate */);
        }
    }
    exports.$IX = $IX;
    class InnerMinimap extends lifecycle_1.$kc {
        constructor(theme, model) {
            super();
            this.L = false;
            this.M = false;
            this.c = theme;
            this.f = model;
            this.I = null;
            this.N = null;
            this.J = this.c.getColor(colorRegistry_1.$Dy);
            this.h = (0, fastDomNode_1.$GP)(document.createElement('div'));
            viewPart_1.$GW.write(this.h, 8 /* PartFingerprint.Minimap */);
            this.h.setClassName(this.Q());
            this.h.setPosition('absolute');
            this.h.setAttribute('role', 'presentation');
            this.h.setAttribute('aria-hidden', 'true');
            this.m = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.m.setClassName('minimap-shadow-hidden');
            this.h.appendChild(this.m);
            this.n = (0, fastDomNode_1.$GP)(document.createElement('canvas'));
            this.n.setPosition('absolute');
            this.n.setLeft(0);
            this.h.appendChild(this.n);
            this.s = (0, fastDomNode_1.$GP)(document.createElement('canvas'));
            this.s.setPosition('absolute');
            this.s.setClassName('minimap-decorations-layer');
            this.s.setLeft(0);
            this.h.appendChild(this.s);
            this.t = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.t.setPosition('absolute');
            this.t.setClassName('minimap-slider');
            this.t.setLayerHinting(true);
            this.t.setContain('strict');
            this.h.appendChild(this.t);
            this.u = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.u.setPosition('absolute');
            this.u.setClassName('minimap-slider-horizontal');
            this.t.appendChild(this.u);
            this.R();
            this.w = dom.$oO(this.h.domNode, dom.$3O.POINTER_DOWN, (e) => {
                e.preventDefault();
                const renderMinimap = this.f.options.renderMinimap;
                if (renderMinimap === 0 /* RenderMinimap.None */) {
                    return;
                }
                if (!this.I) {
                    return;
                }
                if (this.f.options.size !== 'proportional') {
                    if (e.button === 0 && this.I) {
                        // pretend the click occurred in the center of the slider
                        const position = dom.$FO(this.t.domNode);
                        const initialPosY = position.top + position.height / 2;
                        this.O(e, initialPosY, this.I.renderedLayout);
                    }
                    return;
                }
                const minimapLineHeight = this.f.options.minimapLineHeight;
                const internalOffsetY = (this.f.options.canvasInnerHeight / this.f.options.canvasOuterHeight) * e.offsetY;
                const lineIndex = Math.floor(internalOffsetY / minimapLineHeight);
                let lineNumber = lineIndex + this.I.renderedLayout.startLineNumber - this.I.renderedLayout.topPaddingLineCount;
                lineNumber = Math.min(lineNumber, this.f.getLineCount());
                this.f.revealLineNumber(lineNumber);
            });
            this.z = new globalPointerMoveMonitor_1.$HP();
            this.C = dom.$oO(this.t.domNode, dom.$3O.POINTER_DOWN, (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.button === 0 && this.I) {
                    this.O(e, e.pageY, this.I.renderedLayout);
                }
            });
            this.D = touch_1.$EP.addTarget(this.h.domNode);
            this.F = dom.$nO(this.h.domNode, touch_1.EventType.Start, (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.I) {
                    this.t.toggleClassName('active', true);
                    this.M = true;
                    this.P(e);
                }
            }, { passive: false });
            this.G = dom.$nO(this.h.domNode, touch_1.EventType.Change, (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.I && this.M) {
                    this.P(e);
                }
            }, { passive: false });
            this.H = dom.$oO(this.h.domNode, touch_1.EventType.End, (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.M = false;
                this.t.toggleClassName('active', false);
            });
        }
        O(e, initialPosY, initialSliderState) {
            if (!e.target || !(e.target instanceof Element)) {
                return;
            }
            const initialPosX = e.pageX;
            this.t.toggleClassName('active', true);
            const handlePointerMove = (posy, posx) => {
                const minimapPosition = dom.$FO(this.h.domNode);
                const pointerOrthogonalDelta = Math.min(Math.abs(posx - initialPosX), Math.abs(posx - minimapPosition.left), Math.abs(posx - minimapPosition.left - minimapPosition.width));
                if (platform.$i && pointerOrthogonalDelta > POINTER_DRAG_RESET_DISTANCE) {
                    // The pointer has wondered away from the scrollbar => reset dragging
                    this.f.setScrollTop(initialSliderState.scrollTop);
                    return;
                }
                const pointerDelta = posy - initialPosY;
                this.f.setScrollTop(initialSliderState.getDesiredScrollTopFromDelta(pointerDelta));
            };
            if (e.pageY !== initialPosY) {
                handlePointerMove(e.pageY, initialPosX);
            }
            this.z.startMonitoring(e.target, e.pointerId, e.buttons, pointerMoveData => handlePointerMove(pointerMoveData.pageY, pointerMoveData.pageX), () => {
                this.t.toggleClassName('active', false);
            });
        }
        P(touch) {
            const startY = this.h.domNode.getBoundingClientRect().top;
            const scrollTop = this.I.renderedLayout.getDesiredScrollTopFromTouchLocation(touch.pageY - startY);
            this.f.setScrollTop(scrollTop);
        }
        dispose() {
            this.w.dispose();
            this.z.dispose();
            this.C.dispose();
            this.D.dispose();
            this.F.dispose();
            this.G.dispose();
            this.H.dispose();
            super.dispose();
        }
        Q() {
            const class_ = ['minimap'];
            if (this.f.options.showSlider === 'always') {
                class_.push('slider-always');
            }
            else {
                class_.push('slider-mouseover');
            }
            if (this.f.options.autohide) {
                class_.push('autohide');
            }
            return class_.join(' ');
        }
        getDomNode() {
            return this.h;
        }
        R() {
            this.h.setLeft(this.f.options.minimapLeft);
            this.h.setWidth(this.f.options.minimapWidth);
            this.h.setHeight(this.f.options.minimapHeight);
            this.m.setHeight(this.f.options.minimapHeight);
            this.n.setWidth(this.f.options.canvasOuterWidth);
            this.n.setHeight(this.f.options.canvasOuterHeight);
            this.n.domNode.width = this.f.options.canvasInnerWidth;
            this.n.domNode.height = this.f.options.canvasInnerHeight;
            this.s.setWidth(this.f.options.canvasOuterWidth);
            this.s.setHeight(this.f.options.canvasOuterHeight);
            this.s.domNode.width = this.f.options.canvasInnerWidth;
            this.s.domNode.height = this.f.options.canvasInnerHeight;
            this.t.setWidth(this.f.options.minimapWidth);
        }
        S() {
            if (!this.N) {
                if (this.f.options.canvasInnerWidth > 0 && this.f.options.canvasInnerHeight > 0) {
                    this.N = new MinimapBuffers(this.n.domNode.getContext('2d'), this.f.options.canvasInnerWidth, this.f.options.canvasInnerHeight, this.f.options.backgroundColor);
                }
            }
            return this.N ? this.N.getBuffer() : null;
        }
        // ---- begin view event handlers
        onDidChangeOptions() {
            this.I = null;
            this.N = null;
            this.R();
            this.h.setClassName(this.Q());
        }
        onSelectionChanged() {
            this.L = true;
            return true;
        }
        onDecorationsChanged() {
            this.L = true;
            return true;
        }
        onFlushed() {
            this.I = null;
            return true;
        }
        onLinesChanged(changeFromLineNumber, changeCount) {
            if (this.I) {
                return this.I.onLinesChanged(changeFromLineNumber, changeCount);
            }
            return false;
        }
        onLinesDeleted(deleteFromLineNumber, deleteToLineNumber) {
            this.I?.onLinesDeleted(deleteFromLineNumber, deleteToLineNumber);
            return true;
        }
        onLinesInserted(insertFromLineNumber, insertToLineNumber) {
            this.I?.onLinesInserted(insertFromLineNumber, insertToLineNumber);
            return true;
        }
        onScrollChanged() {
            this.L = true;
            return true;
        }
        onThemeChanged() {
            this.J = this.c.getColor(colorRegistry_1.$Dy);
            this.L = true;
            return true;
        }
        onTokensChanged(ranges) {
            if (this.I) {
                return this.I.onTokensChanged(ranges);
            }
            return false;
        }
        onTokensColorsChanged() {
            this.I = null;
            this.N = null;
            return true;
        }
        onZonesChanged() {
            this.I = null;
            return true;
        }
        // --- end event handlers
        render(renderingCtx) {
            const renderMinimap = this.f.options.renderMinimap;
            if (renderMinimap === 0 /* RenderMinimap.None */) {
                this.m.setClassName('minimap-shadow-hidden');
                this.u.setWidth(0);
                this.u.setHeight(0);
                return;
            }
            if (renderingCtx.scrollLeft + renderingCtx.viewportWidth >= renderingCtx.scrollWidth) {
                this.m.setClassName('minimap-shadow-hidden');
            }
            else {
                this.m.setClassName('minimap-shadow-visible');
            }
            const layout = MinimapLayout.create(this.f.options, renderingCtx.viewportStartLineNumber, renderingCtx.viewportEndLineNumber, renderingCtx.viewportStartLineNumberVerticalOffset, renderingCtx.viewportHeight, renderingCtx.viewportContainsWhitespaceGaps, this.f.getLineCount(), this.f.getRealLineCount(), renderingCtx.scrollTop, renderingCtx.scrollHeight, this.I ? this.I.renderedLayout : null);
            this.t.setDisplay(layout.sliderNeeded ? 'block' : 'none');
            this.t.setTop(layout.sliderTop);
            this.t.setHeight(layout.sliderHeight);
            // Compute horizontal slider coordinates
            this.u.setLeft(0);
            this.u.setWidth(this.f.options.minimapWidth);
            this.u.setTop(0);
            this.u.setHeight(layout.sliderHeight);
            this.U(layout);
            this.I = this.cb(layout);
        }
        U(layout) {
            if (this.L) {
                this.L = false;
                const selections = this.f.getSelections();
                selections.sort(range_1.$ks.compareRangesUsingStarts);
                const decorations = this.f.getMinimapDecorationsInViewport(layout.startLineNumber, layout.endLineNumber);
                decorations.sort((a, b) => (a.options.zIndex || 0) - (b.options.zIndex || 0));
                const { canvasInnerWidth, canvasInnerHeight } = this.f.options;
                const minimapLineHeight = this.f.options.minimapLineHeight;
                const minimapCharWidth = this.f.options.minimapCharWidth;
                const tabSize = this.f.getOptions().tabSize;
                const canvasContext = this.s.domNode.getContext('2d');
                canvasContext.clearRect(0, 0, canvasInnerWidth, canvasInnerHeight);
                // We first need to render line highlights and then render decorations on top of those.
                // But we need to pick a single color for each line, and use that as a line highlight.
                // This needs to be the color of the decoration with the highest `zIndex`, but priority
                // is given to the selection.
                const highlightedLines = new ContiguousLineMap(layout.startLineNumber, layout.endLineNumber, false);
                this.W(canvasContext, selections, highlightedLines, layout, minimapLineHeight);
                this.X(canvasContext, decorations, highlightedLines, layout, minimapLineHeight);
                const lineOffsetMap = new ContiguousLineMap(layout.startLineNumber, layout.endLineNumber, null);
                this.Y(canvasContext, selections, lineOffsetMap, layout, minimapLineHeight, tabSize, minimapCharWidth, canvasInnerWidth);
                this.Z(canvasContext, decorations, lineOffsetMap, layout, minimapLineHeight, tabSize, minimapCharWidth, canvasInnerWidth);
            }
        }
        W(canvasContext, selections, highlightedLines, layout, minimapLineHeight) {
            if (!this.J || this.J.isTransparent()) {
                return;
            }
            canvasContext.fillStyle = this.J.transparent(0.5).toString();
            let y1 = 0;
            let y2 = 0;
            for (const selection of selections) {
                const intersection = layout.intersectWithViewport(selection);
                if (!intersection) {
                    // entirely outside minimap's viewport
                    continue;
                }
                const [startLineNumber, endLineNumber] = intersection;
                for (let line = startLineNumber; line <= endLineNumber; line++) {
                    highlightedLines.set(line, true);
                }
                const yy1 = layout.getYForLineNumber(startLineNumber, minimapLineHeight);
                const yy2 = layout.getYForLineNumber(endLineNumber, minimapLineHeight);
                if (y2 >= yy1) {
                    // merge into previous
                    y2 = yy2;
                }
                else {
                    if (y2 > y1) {
                        // flush
                        canvasContext.fillRect(editorOptions_1.MINIMAP_GUTTER_WIDTH, y1, canvasContext.canvas.width, y2 - y1);
                    }
                    y1 = yy1;
                    y2 = yy2;
                }
            }
            if (y2 > y1) {
                // flush
                canvasContext.fillRect(editorOptions_1.MINIMAP_GUTTER_WIDTH, y1, canvasContext.canvas.width, y2 - y1);
            }
        }
        X(canvasContext, decorations, highlightedLines, layout, minimapLineHeight) {
            const highlightColors = new Map();
            // Loop backwards to hit first decorations with higher `zIndex`
            for (let i = decorations.length - 1; i >= 0; i--) {
                const decoration = decorations[i];
                const minimapOptions = decoration.options.minimap;
                if (!minimapOptions || minimapOptions.position !== model_1.MinimapPosition.Inline) {
                    continue;
                }
                const intersection = layout.intersectWithViewport(decoration.range);
                if (!intersection) {
                    // entirely outside minimap's viewport
                    continue;
                }
                const [startLineNumber, endLineNumber] = intersection;
                const decorationColor = minimapOptions.getColor(this.c.value);
                if (!decorationColor || decorationColor.isTransparent()) {
                    continue;
                }
                let highlightColor = highlightColors.get(decorationColor.toString());
                if (!highlightColor) {
                    highlightColor = decorationColor.transparent(0.5).toString();
                    highlightColors.set(decorationColor.toString(), highlightColor);
                }
                canvasContext.fillStyle = highlightColor;
                for (let line = startLineNumber; line <= endLineNumber; line++) {
                    if (highlightedLines.has(line)) {
                        continue;
                    }
                    highlightedLines.set(line, true);
                    const y = layout.getYForLineNumber(startLineNumber, minimapLineHeight);
                    canvasContext.fillRect(editorOptions_1.MINIMAP_GUTTER_WIDTH, y, canvasContext.canvas.width, minimapLineHeight);
                }
            }
        }
        Y(canvasContext, selections, lineOffsetMap, layout, lineHeight, tabSize, characterWidth, canvasInnerWidth) {
            if (!this.J || this.J.isTransparent()) {
                return;
            }
            for (const selection of selections) {
                const intersection = layout.intersectWithViewport(selection);
                if (!intersection) {
                    // entirely outside minimap's viewport
                    continue;
                }
                const [startLineNumber, endLineNumber] = intersection;
                for (let line = startLineNumber; line <= endLineNumber; line++) {
                    this.$(canvasContext, lineOffsetMap, selection, this.J, layout, line, lineHeight, lineHeight, tabSize, characterWidth, canvasInnerWidth);
                }
            }
        }
        Z(canvasContext, decorations, lineOffsetMap, layout, minimapLineHeight, tabSize, characterWidth, canvasInnerWidth) {
            // Loop forwards to hit first decorations with lower `zIndex`
            for (const decoration of decorations) {
                const minimapOptions = decoration.options.minimap;
                if (!minimapOptions) {
                    continue;
                }
                const intersection = layout.intersectWithViewport(decoration.range);
                if (!intersection) {
                    // entirely outside minimap's viewport
                    continue;
                }
                const [startLineNumber, endLineNumber] = intersection;
                const decorationColor = minimapOptions.getColor(this.c.value);
                if (!decorationColor || decorationColor.isTransparent()) {
                    continue;
                }
                for (let line = startLineNumber; line <= endLineNumber; line++) {
                    switch (minimapOptions.position) {
                        case model_1.MinimapPosition.Inline:
                            this.$(canvasContext, lineOffsetMap, decoration.range, decorationColor, layout, line, minimapLineHeight, minimapLineHeight, tabSize, characterWidth, canvasInnerWidth);
                            continue;
                        case model_1.MinimapPosition.Gutter: {
                            const y = layout.getYForLineNumber(line, minimapLineHeight);
                            const x = 2;
                            this.bb(canvasContext, decorationColor, x, y, GUTTER_DECORATION_WIDTH, minimapLineHeight);
                            continue;
                        }
                    }
                }
            }
        }
        $(canvasContext, lineOffsetMap, decorationRange, decorationColor, layout, lineNumber, height, minimapLineHeight, tabSize, charWidth, canvasInnerWidth) {
            const y = layout.getYForLineNumber(lineNumber, minimapLineHeight);
            // Skip rendering the line if it's vertically outside our viewport
            if (y + height < 0 || y > this.f.options.canvasInnerHeight) {
                return;
            }
            const { startLineNumber, endLineNumber } = decorationRange;
            const startColumn = (startLineNumber === lineNumber ? decorationRange.startColumn : 1);
            const endColumn = (endLineNumber === lineNumber ? decorationRange.endColumn : this.f.getLineMaxColumn(lineNumber));
            const x1 = this.ab(lineOffsetMap, lineNumber, startColumn, tabSize, charWidth, canvasInnerWidth);
            const x2 = this.ab(lineOffsetMap, lineNumber, endColumn, tabSize, charWidth, canvasInnerWidth);
            this.bb(canvasContext, decorationColor, x1, y, x2 - x1, height);
        }
        ab(lineOffsetMap, lineNumber, column, tabSize, charWidth, canvasInnerWidth) {
            if (column === 1) {
                return editorOptions_1.MINIMAP_GUTTER_WIDTH;
            }
            const minimumXOffset = (column - 1) * charWidth;
            if (minimumXOffset >= canvasInnerWidth) {
                // there is no need to look at actual characters,
                // as this column is certainly after the minimap width
                return canvasInnerWidth;
            }
            // Cache line offset data so that it is only read once per line
            let lineIndexToXOffset = lineOffsetMap.get(lineNumber);
            if (!lineIndexToXOffset) {
                const lineData = this.f.getLineContent(lineNumber);
                lineIndexToXOffset = [editorOptions_1.MINIMAP_GUTTER_WIDTH];
                let prevx = editorOptions_1.MINIMAP_GUTTER_WIDTH;
                for (let i = 1; i < lineData.length + 1; i++) {
                    const charCode = lineData.charCodeAt(i - 1);
                    const dx = charCode === 9 /* CharCode.Tab */
                        ? tabSize * charWidth
                        : strings.$5e(charCode)
                            ? 2 * charWidth
                            : charWidth;
                    const x = prevx + dx;
                    if (x >= canvasInnerWidth) {
                        // no need to keep on going, as we've hit the canvas width
                        lineIndexToXOffset[i] = canvasInnerWidth;
                        break;
                    }
                    lineIndexToXOffset[i] = x;
                    prevx = x;
                }
                lineOffsetMap.set(lineNumber, lineIndexToXOffset);
            }
            if (column - 1 < lineIndexToXOffset.length) {
                return lineIndexToXOffset[column - 1];
            }
            // goes over the canvas width
            return canvasInnerWidth;
        }
        bb(canvasContext, decorationColor, x, y, width, height) {
            canvasContext.fillStyle = decorationColor && decorationColor.toString() || '';
            canvasContext.fillRect(x, y, width, height);
        }
        cb(layout) {
            const startLineNumber = layout.startLineNumber;
            const endLineNumber = layout.endLineNumber;
            const minimapLineHeight = this.f.options.minimapLineHeight;
            // Check if nothing changed w.r.t. lines from last frame
            if (this.I && this.I.linesEquals(layout)) {
                const _lastData = this.I._get();
                // Nice!! Nothing changed from last frame
                return new RenderData(layout, _lastData.imageData, _lastData.lines);
            }
            // Oh well!! We need to repaint some lines...
            const imageData = this.S();
            if (!imageData) {
                // 0 width or 0 height canvas, nothing to do
                return null;
            }
            // Render untouched lines by using last rendered data.
            const [_dirtyY1, _dirtyY2, needed] = InnerMinimap.db(imageData, layout.topPaddingLineCount, startLineNumber, endLineNumber, minimapLineHeight, this.I);
            // Fetch rendering info from view model for rest of lines that need rendering.
            const lineInfo = this.f.getMinimapLinesRenderingData(startLineNumber, endLineNumber, needed);
            const tabSize = this.f.getOptions().tabSize;
            const defaultBackground = this.f.options.defaultBackgroundColor;
            const background = this.f.options.backgroundColor;
            const foregroundAlpha = this.f.options.foregroundAlpha;
            const tokensColorTracker = this.f.tokensColorTracker;
            const useLighterFont = tokensColorTracker.backgroundIsLight();
            const renderMinimap = this.f.options.renderMinimap;
            const charRenderer = this.f.options.charRenderer();
            const fontScale = this.f.options.fontScale;
            const minimapCharWidth = this.f.options.minimapCharWidth;
            const baseCharHeight = (renderMinimap === 1 /* RenderMinimap.Text */ ? 2 /* Constants.BASE_CHAR_HEIGHT */ : 2 /* Constants.BASE_CHAR_HEIGHT */ + 1);
            const renderMinimapLineHeight = baseCharHeight * fontScale;
            const innerLinePadding = (minimapLineHeight > renderMinimapLineHeight ? Math.floor((minimapLineHeight - renderMinimapLineHeight) / 2) : 0);
            // Render the rest of lines
            const backgroundA = background.a / 255;
            const renderBackground = new rgba_1.$BX(Math.round((background.r - defaultBackground.r) * backgroundA + defaultBackground.r), Math.round((background.g - defaultBackground.g) * backgroundA + defaultBackground.g), Math.round((background.b - defaultBackground.b) * backgroundA + defaultBackground.b), 255);
            let dy = layout.topPaddingLineCount * minimapLineHeight;
            const renderedLines = [];
            for (let lineIndex = 0, lineCount = endLineNumber - startLineNumber + 1; lineIndex < lineCount; lineIndex++) {
                if (needed[lineIndex]) {
                    InnerMinimap.eb(imageData, renderBackground, background.a, useLighterFont, renderMinimap, minimapCharWidth, tokensColorTracker, foregroundAlpha, charRenderer, dy, innerLinePadding, tabSize, lineInfo[lineIndex], fontScale, minimapLineHeight);
                }
                renderedLines[lineIndex] = new MinimapLine(dy);
                dy += minimapLineHeight;
            }
            const dirtyY1 = (_dirtyY1 === -1 ? 0 : _dirtyY1);
            const dirtyY2 = (_dirtyY2 === -1 ? imageData.height : _dirtyY2);
            const dirtyHeight = dirtyY2 - dirtyY1;
            // Finally, paint to the canvas
            const ctx = this.n.domNode.getContext('2d');
            ctx.putImageData(imageData, 0, 0, 0, dirtyY1, imageData.width, dirtyHeight);
            // Save rendered data for reuse on next frame if possible
            return new RenderData(layout, imageData, renderedLines);
        }
        static db(target, topPaddingLineCount, startLineNumber, endLineNumber, minimapLineHeight, lastRenderData) {
            const needed = [];
            if (!lastRenderData) {
                for (let i = 0, len = endLineNumber - startLineNumber + 1; i < len; i++) {
                    needed[i] = true;
                }
                return [-1, -1, needed];
            }
            const _lastData = lastRenderData._get();
            const lastTargetData = _lastData.imageData.data;
            const lastStartLineNumber = _lastData.rendLineNumberStart;
            const lastLines = _lastData.lines;
            const lastLinesLength = lastLines.length;
            const WIDTH = target.width;
            const targetData = target.data;
            const maxDestPixel = (endLineNumber - startLineNumber + 1) * minimapLineHeight * WIDTH * 4;
            let dirtyPixel1 = -1; // the pixel offset up to which all the data is equal to the prev frame
            let dirtyPixel2 = -1; // the pixel offset after which all the data is equal to the prev frame
            let copySourceStart = -1;
            let copySourceEnd = -1;
            let copyDestStart = -1;
            let copyDestEnd = -1;
            let dest_dy = topPaddingLineCount * minimapLineHeight;
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const lineIndex = lineNumber - startLineNumber;
                const lastLineIndex = lineNumber - lastStartLineNumber;
                const source_dy = (lastLineIndex >= 0 && lastLineIndex < lastLinesLength ? lastLines[lastLineIndex].dy : -1);
                if (source_dy === -1) {
                    needed[lineIndex] = true;
                    dest_dy += minimapLineHeight;
                    continue;
                }
                const sourceStart = source_dy * WIDTH * 4;
                const sourceEnd = (source_dy + minimapLineHeight) * WIDTH * 4;
                const destStart = dest_dy * WIDTH * 4;
                const destEnd = (dest_dy + minimapLineHeight) * WIDTH * 4;
                if (copySourceEnd === sourceStart && copyDestEnd === destStart) {
                    // contiguous zone => extend copy request
                    copySourceEnd = sourceEnd;
                    copyDestEnd = destEnd;
                }
                else {
                    if (copySourceStart !== -1) {
                        // flush existing copy request
                        targetData.set(lastTargetData.subarray(copySourceStart, copySourceEnd), copyDestStart);
                        if (dirtyPixel1 === -1 && copySourceStart === 0 && copySourceStart === copyDestStart) {
                            dirtyPixel1 = copySourceEnd;
                        }
                        if (dirtyPixel2 === -1 && copySourceEnd === maxDestPixel && copySourceStart === copyDestStart) {
                            dirtyPixel2 = copySourceStart;
                        }
                    }
                    copySourceStart = sourceStart;
                    copySourceEnd = sourceEnd;
                    copyDestStart = destStart;
                    copyDestEnd = destEnd;
                }
                needed[lineIndex] = false;
                dest_dy += minimapLineHeight;
            }
            if (copySourceStart !== -1) {
                // flush existing copy request
                targetData.set(lastTargetData.subarray(copySourceStart, copySourceEnd), copyDestStart);
                if (dirtyPixel1 === -1 && copySourceStart === 0 && copySourceStart === copyDestStart) {
                    dirtyPixel1 = copySourceEnd;
                }
                if (dirtyPixel2 === -1 && copySourceEnd === maxDestPixel && copySourceStart === copyDestStart) {
                    dirtyPixel2 = copySourceStart;
                }
            }
            const dirtyY1 = (dirtyPixel1 === -1 ? -1 : dirtyPixel1 / (WIDTH * 4));
            const dirtyY2 = (dirtyPixel2 === -1 ? -1 : dirtyPixel2 / (WIDTH * 4));
            return [dirtyY1, dirtyY2, needed];
        }
        static eb(target, backgroundColor, backgroundAlpha, useLighterFont, renderMinimap, charWidth, colorTracker, foregroundAlpha, minimapCharRenderer, dy, innerLinePadding, tabSize, lineData, fontScale, minimapLineHeight) {
            const content = lineData.content;
            const tokens = lineData.tokens;
            const maxDx = target.width - charWidth;
            const force1pxHeight = (minimapLineHeight === 1);
            let dx = editorOptions_1.MINIMAP_GUTTER_WIDTH;
            let charIndex = 0;
            let tabsCharDelta = 0;
            for (let tokenIndex = 0, tokensLen = tokens.getCount(); tokenIndex < tokensLen; tokenIndex++) {
                const tokenEndIndex = tokens.getEndOffset(tokenIndex);
                const tokenColorId = tokens.getForeground(tokenIndex);
                const tokenColor = colorTracker.getColor(tokenColorId);
                for (; charIndex < tokenEndIndex; charIndex++) {
                    if (dx > maxDx) {
                        // hit edge of minimap
                        return;
                    }
                    const charCode = content.charCodeAt(charIndex);
                    if (charCode === 9 /* CharCode.Tab */) {
                        const insertSpacesCount = tabSize - (charIndex + tabsCharDelta) % tabSize;
                        tabsCharDelta += insertSpacesCount - 1;
                        // No need to render anything since tab is invisible
                        dx += insertSpacesCount * charWidth;
                    }
                    else if (charCode === 32 /* CharCode.Space */) {
                        // No need to render anything since space is invisible
                        dx += charWidth;
                    }
                    else {
                        // Render twice for a full width character
                        const count = strings.$5e(charCode) ? 2 : 1;
                        for (let i = 0; i < count; i++) {
                            if (renderMinimap === 2 /* RenderMinimap.Blocks */) {
                                minimapCharRenderer.blockRenderChar(target, dx, dy + innerLinePadding, tokenColor, foregroundAlpha, backgroundColor, backgroundAlpha, force1pxHeight);
                            }
                            else { // RenderMinimap.Text
                                minimapCharRenderer.renderChar(target, dx, dy + innerLinePadding, charCode, tokenColor, foregroundAlpha, backgroundColor, backgroundAlpha, fontScale, useLighterFont, force1pxHeight);
                            }
                            dx += charWidth;
                            if (dx > maxDx) {
                                // hit edge of minimap
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
    class ContiguousLineMap {
        constructor(startLineNumber, endLineNumber, defaultValue) {
            this.c = startLineNumber;
            this.d = endLineNumber;
            this.f = defaultValue;
            this.h = [];
            for (let i = 0, count = this.d - this.c + 1; i < count; i++) {
                this.h[i] = defaultValue;
            }
        }
        has(lineNumber) {
            return (this.get(lineNumber) !== this.f);
        }
        set(lineNumber, value) {
            if (lineNumber < this.c || lineNumber > this.d) {
                return;
            }
            this.h[lineNumber - this.c] = value;
        }
        get(lineNumber) {
            if (lineNumber < this.c || lineNumber > this.d) {
                return this.f;
            }
            return this.h[lineNumber - this.c];
        }
    }
});
//# sourceMappingURL=minimap.js.map