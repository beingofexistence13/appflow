/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/browser/view/renderingContext", "vs/editor/common/core/range", "vs/css!./decorations"], function (require, exports, dynamicViewOverlay_1, renderingContext_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecorationsOverlay = void 0;
    class DecorationsOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        constructor(context) {
            super();
            this._context = context;
            const options = this._context.configuration.options;
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._typicalHalfwidthCharacterWidth = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            this._renderResult = null;
            this._context.addEventHandler(this);
        }
        dispose() {
            this._context.removeEventHandler(this);
            this._renderResult = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._typicalHalfwidthCharacterWidth = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            return true;
        }
        onDecorationsChanged(e) {
            return true;
        }
        onFlushed(e) {
            return true;
        }
        onLinesChanged(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            return e.scrollTopChanged || e.scrollWidthChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            const _decorations = ctx.getDecorationsInViewport();
            // Keep only decorations with `className`
            let decorations = [];
            let decorationsLen = 0;
            for (let i = 0, len = _decorations.length; i < len; i++) {
                const d = _decorations[i];
                if (d.options.className) {
                    decorations[decorationsLen++] = d;
                }
            }
            // Sort decorations for consistent render output
            decorations = decorations.sort((a, b) => {
                if (a.options.zIndex < b.options.zIndex) {
                    return -1;
                }
                if (a.options.zIndex > b.options.zIndex) {
                    return 1;
                }
                const aClassName = a.options.className;
                const bClassName = b.options.className;
                if (aClassName < bClassName) {
                    return -1;
                }
                if (aClassName > bClassName) {
                    return 1;
                }
                return range_1.Range.compareRangesUsingStarts(a.range, b.range);
            });
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                output[lineIndex] = '';
            }
            // Render first whole line decorations and then regular decorations
            this._renderWholeLineDecorations(ctx, decorations, output);
            this._renderNormalDecorations(ctx, decorations, output);
            this._renderResult = output;
        }
        _renderWholeLineDecorations(ctx, decorations, output) {
            const lineHeight = String(this._lineHeight);
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            for (let i = 0, lenI = decorations.length; i < lenI; i++) {
                const d = decorations[i];
                if (!d.options.isWholeLine) {
                    continue;
                }
                const decorationOutput = ('<div class="cdr '
                    + d.options.className
                    + '" style="left:0;width:100%;height:'
                    + lineHeight
                    + 'px;"></div>');
                const startLineNumber = Math.max(d.range.startLineNumber, visibleStartLineNumber);
                const endLineNumber = Math.min(d.range.endLineNumber, visibleEndLineNumber);
                for (let j = startLineNumber; j <= endLineNumber; j++) {
                    const lineIndex = j - visibleStartLineNumber;
                    output[lineIndex] += decorationOutput;
                }
            }
        }
        _renderNormalDecorations(ctx, decorations, output) {
            const lineHeight = String(this._lineHeight);
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            let prevClassName = null;
            let prevShowIfCollapsed = false;
            let prevRange = null;
            let prevShouldFillLineOnLineBreak = false;
            for (let i = 0, lenI = decorations.length; i < lenI; i++) {
                const d = decorations[i];
                if (d.options.isWholeLine) {
                    continue;
                }
                const className = d.options.className;
                const showIfCollapsed = Boolean(d.options.showIfCollapsed);
                let range = d.range;
                if (showIfCollapsed && range.endColumn === 1 && range.endLineNumber !== range.startLineNumber) {
                    range = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber - 1, this._context.viewModel.getLineMaxColumn(range.endLineNumber - 1));
                }
                if (prevClassName === className && prevShowIfCollapsed === showIfCollapsed && range_1.Range.areIntersectingOrTouching(prevRange, range)) {
                    // merge into previous decoration
                    prevRange = range_1.Range.plusRange(prevRange, range);
                    continue;
                }
                // flush previous decoration
                if (prevClassName !== null) {
                    this._renderNormalDecoration(ctx, prevRange, prevClassName, prevShouldFillLineOnLineBreak, prevShowIfCollapsed, lineHeight, visibleStartLineNumber, output);
                }
                prevClassName = className;
                prevShowIfCollapsed = showIfCollapsed;
                prevRange = range;
                prevShouldFillLineOnLineBreak = d.options.shouldFillLineOnLineBreak ?? false;
            }
            if (prevClassName !== null) {
                this._renderNormalDecoration(ctx, prevRange, prevClassName, prevShouldFillLineOnLineBreak, prevShowIfCollapsed, lineHeight, visibleStartLineNumber, output);
            }
        }
        _renderNormalDecoration(ctx, range, className, shouldFillLineOnLineBreak, showIfCollapsed, lineHeight, visibleStartLineNumber, output) {
            const linesVisibleRanges = ctx.linesVisibleRangesForRange(range, /*TODO@Alex*/ className === 'findMatch');
            if (!linesVisibleRanges) {
                return;
            }
            for (let j = 0, lenJ = linesVisibleRanges.length; j < lenJ; j++) {
                const lineVisibleRanges = linesVisibleRanges[j];
                if (lineVisibleRanges.outsideRenderedLine) {
                    continue;
                }
                const lineIndex = lineVisibleRanges.lineNumber - visibleStartLineNumber;
                if (showIfCollapsed && lineVisibleRanges.ranges.length === 1) {
                    const singleVisibleRange = lineVisibleRanges.ranges[0];
                    if (singleVisibleRange.width < this._typicalHalfwidthCharacterWidth) {
                        // collapsed/very small range case => make the decoration visible by expanding its width
                        // expand its size on both sides (both to the left and to the right, keeping it centered)
                        const center = Math.round(singleVisibleRange.left + singleVisibleRange.width / 2);
                        const left = Math.max(0, Math.round(center - this._typicalHalfwidthCharacterWidth / 2));
                        lineVisibleRanges.ranges[0] = new renderingContext_1.HorizontalRange(left, this._typicalHalfwidthCharacterWidth);
                    }
                }
                for (let k = 0, lenK = lineVisibleRanges.ranges.length; k < lenK; k++) {
                    const expandToLeft = shouldFillLineOnLineBreak && lineVisibleRanges.continuesOnNextLine && lenK === 1;
                    const visibleRange = lineVisibleRanges.ranges[k];
                    const decorationOutput = ('<div class="cdr '
                        + className
                        + '" style="left:'
                        + String(visibleRange.left)
                        + (expandToLeft ?
                            'px;width:100%;height:' :
                            ('px;width:' + String(visibleRange.width) + 'px;height:'))
                        + lineHeight
                        + 'px;"></div>');
                    output[lineIndex] += decorationOutput;
                }
            }
        }
        render(startLineNumber, lineNumber) {
            if (!this._renderResult) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
                return '';
            }
            return this._renderResult[lineIndex];
        }
    }
    exports.DecorationsOverlay = DecorationsOverlay;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3UGFydHMvZGVjb3JhdGlvbnMvZGVjb3JhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQWEsa0JBQW1CLFNBQVEsdUNBQWtCO1FBT3pELFlBQVksT0FBb0I7WUFDL0IsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxrQ0FBeUIsQ0FBQztZQUN4RCxJQUFJLENBQUMsK0JBQStCLEdBQUcsT0FBTyxDQUFDLEdBQUcsZ0NBQXVCLENBQUMsOEJBQThCLENBQUM7WUFDekcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFFMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVlLE9BQU87WUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUMxQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVELDJCQUEyQjtRQUVYLHNCQUFzQixDQUFDLENBQTJDO1lBQ2pGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUNwRCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLGtDQUF5QixDQUFDO1lBQ3hELElBQUksQ0FBQywrQkFBK0IsR0FBRyxPQUFPLENB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