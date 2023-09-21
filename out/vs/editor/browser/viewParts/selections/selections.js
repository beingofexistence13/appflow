/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./selections"], function (require, exports, dynamicViewOverlay_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectionsOverlay = void 0;
    var CornerStyle;
    (function (CornerStyle) {
        CornerStyle[CornerStyle["EXTERN"] = 0] = "EXTERN";
        CornerStyle[CornerStyle["INTERN"] = 1] = "INTERN";
        CornerStyle[CornerStyle["FLAT"] = 2] = "FLAT";
    })(CornerStyle || (CornerStyle = {}));
    class HorizontalRangeWithStyle {
        constructor(other) {
            this.left = other.left;
            this.width = other.width;
            this.startStyle = null;
            this.endStyle = null;
        }
    }
    class LineVisibleRangesWithStyle {
        constructor(lineNumber, ranges) {
            this.lineNumber = lineNumber;
            this.ranges = ranges;
        }
    }
    function toStyledRange(item) {
        return new HorizontalRangeWithStyle(item);
    }
    function toStyled(item) {
        return new LineVisibleRangesWithStyle(item.lineNumber, item.ranges.map(toStyledRange));
    }
    class SelectionsOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        static { this.SELECTION_CLASS_NAME = 'selected-text'; }
        static { this.SELECTION_TOP_LEFT = 'top-left-radius'; }
        static { this.SELECTION_BOTTOM_LEFT = 'bottom-left-radius'; }
        static { this.SELECTION_TOP_RIGHT = 'top-right-radius'; }
        static { this.SELECTION_BOTTOM_RIGHT = 'bottom-right-radius'; }
        static { this.EDITOR_BACKGROUND_CLASS_NAME = 'monaco-editor-background'; }
        static { this.ROUNDED_PIECE_WIDTH = 10; }
        constructor(context) {
            super();
            this._previousFrameVisibleRangesWithStyle = [];
            this._context = context;
            const options = this._context.configuration.options;
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._roundedSelection = options.get(100 /* EditorOption.roundedSelection */);
            this._typicalHalfwidthCharacterWidth = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            this._selections = [];
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
            this._roundedSelection = options.get(100 /* EditorOption.roundedSelection */);
            this._typicalHalfwidthCharacterWidth = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            return true;
        }
        onCursorStateChanged(e) {
            this._selections = e.selections.slice(0);
            return true;
        }
        onDecorationsChanged(e) {
            // true for inline decorations that can end up relayouting text
            return true; //e.inlineDecorationsChanged;
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
            return e.scrollTopChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        _visibleRangesHaveGaps(linesVisibleRanges) {
            for (let i = 0, len = linesVisibleRanges.length; i < len; i++) {
                const lineVisibleRanges = linesVisibleRanges[i];
                if (lineVisibleRanges.ranges.length > 1) {
                    // There are two ranges on the same line
                    return true;
                }
            }
            return false;
        }
        _enrichVisibleRangesWithStyle(viewport, linesVisibleRanges, previousFrame) {
            const epsilon = this._typicalHalfwidthCharacterWidth / 4;
            let previousFrameTop = null;
            let previousFrameBottom = null;
            if (previousFrame && previousFrame.length > 0 && linesVisibleRanges.length > 0) {
                const topLineNumber = linesVisibleRanges[0].lineNumber;
                if (topLineNumber === viewport.startLineNumber) {
                    for (let i = 0; !previousFrameTop && i < previousFrame.length; i++) {
                        if (previousFrame[i].lineNumber === topLineNumber) {
                            previousFrameTop = previousFrame[i].ranges[0];
                        }
                    }
                }
                const bottomLineNumber = linesVisibleRanges[linesVisibleRanges.length - 1].lineNumber;
                if (bottomLineNumber === viewport.endLineNumber) {
                    for (let i = previousFrame.length - 1; !previousFrameBottom && i >= 0; i--) {
                        if (previousFrame[i].lineNumber === bottomLineNumber) {
                            previousFrameBottom = previousFrame[i].ranges[0];
                        }
                    }
                }
                if (previousFrameTop && !previousFrameTop.startStyle) {
                    previousFrameTop = null;
                }
                if (previousFrameBottom && !previousFrameBottom.startStyle) {
                    previousFrameBottom = null;
                }
            }
            for (let i = 0, len = linesVisibleRanges.length; i < len; i++) {
                // We know for a fact that there is precisely one range on each line
                const curLineRange = linesVisibleRanges[i].ranges[0];
                const curLeft = curLineRange.left;
                const curRight = curLineRange.left + curLineRange.width;
                const startStyle = {
                    top: 0 /* CornerStyle.EXTERN */,
                    bottom: 0 /* CornerStyle.EXTERN */
                };
                const endStyle = {
                    top: 0 /* CornerStyle.EXTERN */,
                    bottom: 0 /* CornerStyle.EXTERN */
                };
                if (i > 0) {
                    // Look above
                    const prevLeft = linesVisibleRanges[i - 1].ranges[0].left;
                    const prevRight = linesVisibleRanges[i - 1].ranges[0].left + linesVisibleRanges[i - 1].ranges[0].width;
                    if (abs(curLeft - prevLeft) < epsilon) {
                        startStyle.top = 2 /* CornerStyle.FLAT */;
                    }
                    else if (curLeft > prevLeft) {
                        startStyle.top = 1 /* CornerStyle.INTERN */;
                    }
                    if (abs(curRight - prevRight) < epsilon) {
                        endStyle.top = 2 /* CornerStyle.FLAT */;
                    }
                    else if (prevLeft < curRight && curRight < prevRight) {
                        endStyle.top = 1 /* CornerStyle.INTERN */;
                    }
                }
                else if (previousFrameTop) {
                    // Accept some hiccups near the viewport edges to save on repaints
                    startStyle.top = previousFrameTop.startStyle.top;
                    endStyle.top = previousFrameTop.endStyle.top;
                }
                if (i + 1 < len) {
                    // Look below
                    const nextLeft = linesVisibleRanges[i + 1].ranges[0].left;
                    const nextRight = linesVisibleRanges[i + 1].ranges[0].left + linesVisibleRanges[i + 1].ranges[0].width;
                    if (abs(curLeft - nextLeft) < epsilon) {
                        startStyle.bottom = 2 /* CornerStyle.FLAT */;
                    }
                    else if (nextLeft < curLeft && curLeft < nextRight) {
                        startStyle.bottom = 1 /* CornerStyle.INTERN */;
                    }
                    if (abs(curRight - nextRight) < epsilon) {
                        endStyle.bottom = 2 /* CornerStyle.FLAT */;
                    }
                    else if (curRight < nextRight) {
                        endStyle.bottom = 1 /* CornerStyle.INTERN */;
                    }
                }
                else if (previousFrameBottom) {
                    // Accept some hiccups near the viewport edges to save on repaints
                    startStyle.bottom = previousFrameBottom.startStyle.bottom;
                    endStyle.bottom = previousFrameBottom.endStyle.bottom;
                }
                curLineRange.startStyle = startStyle;
                curLineRange.endStyle = endStyle;
            }
        }
        _getVisibleRangesWithStyle(selection, ctx, previousFrame) {
            const _linesVisibleRanges = ctx.linesVisibleRangesForRange(selection, true) || [];
            const linesVisibleRanges = _linesVisibleRanges.map(toStyled);
            const visibleRangesHaveGaps = this._visibleRangesHaveGaps(linesVisibleRanges);
            if (!visibleRangesHaveGaps && this._roundedSelection) {
                this._enrichVisibleRangesWithStyle(ctx.visibleRange, linesVisibleRanges, previousFrame);
            }
            // The visible ranges are sorted TOP-BOTTOM and LEFT-RIGHT
            return linesVisibleRanges;
        }
        _createSelectionPiece(top, height, className, left, width) {
            return ('<div class="cslr '
                + className
                + '" style="top:'
                + top.toString()
                + 'px;left:'
                + left.toString()
                + 'px;width:'
                + width.toString()
                + 'px;height:'
                + height
                + 'px;"></div>');
        }
        _actualRenderOneSelection(output2, visibleStartLineNumber, hasMultipleSelections, visibleRanges) {
            if (visibleRanges.length === 0) {
                return;
            }
            const visibleRangesHaveStyle = !!visibleRanges[0].ranges[0].startStyle;
            const fullLineHeight = (this._lineHeight).toString();
            const reducedLineHeight = (this._lineHeight - 1).toString();
            const firstLineNumber = visibleRanges[0].lineNumber;
            const lastLineNumber = visibleRanges[visibleRanges.length - 1].lineNumber;
            for (let i = 0, len = visibleRanges.length; i < len; i++) {
                const lineVisibleRanges = visibleRanges[i];
                const lineNumber = lineVisibleRanges.lineNumber;
                const lineIndex = lineNumber - visibleStartLineNumber;
                const lineHeight = hasMultipleSelections ? (lineNumber === lastLineNumber || lineNumber === firstLineNumber ? reducedLineHeight : fullLineHeight) : fullLineHeight;
                const top = hasMultipleSelections ? (lineNumber === firstLineNumber ? 1 : 0) : 0;
                let innerCornerOutput = '';
                let restOfSelectionOutput = '';
                for (let j = 0, lenJ = lineVisibleRanges.ranges.length; j < lenJ; j++) {
                    const visibleRange = lineVisibleRanges.ranges[j];
                    if (visibleRangesHaveStyle) {
                        const startStyle = visibleRange.startStyle;
                        const endStyle = visibleRange.endStyle;
                        if (startStyle.top === 1 /* CornerStyle.INTERN */ || startStyle.bottom === 1 /* CornerStyle.INTERN */) {
                            // Reverse rounded corner to the left
                            // First comes the selection (blue layer)
                            innerCornerOutput += this._createSelectionPiece(top, lineHeight, SelectionsOverlay.SELECTION_CLASS_NAME, visibleRange.left - SelectionsOverlay.ROUNDED_PIECE_WIDTH, SelectionsOverlay.ROUNDED_PIECE_WIDTH);
                            // Second comes the background (white layer) with inverse border radius
                            let className = SelectionsOverlay.EDITOR_BACKGROUND_CLASS_NAME;
                            if (startStyle.top === 1 /* CornerStyle.INTERN */) {
                                className += ' ' + SelectionsOverlay.SELECTION_TOP_RIGHT;
                            }
                            if (startStyle.bottom === 1 /* CornerStyle.INTERN */) {
                                className += ' ' + SelectionsOverlay.SELECTION_BOTTOM_RIGHT;
                            }
                            innerCornerOutput += this._createSelectionPiece(top, lineHeight, className, visibleRange.left - SelectionsOverlay.ROUNDED_PIECE_WIDTH, SelectionsOverlay.ROUNDED_PIECE_WIDTH);
                        }
                        if (endStyle.top === 1 /* CornerStyle.INTERN */ || endStyle.bottom === 1 /* CornerStyle.INTERN */) {
                            // Reverse rounded corner to the right
                            // First comes the selection (blue layer)
                            innerCornerOutput += this._createSelectionPiece(top, lineHeight, SelectionsOverlay.SELECTION_CLASS_NAME, visibleRange.left + visibleRange.width, SelectionsOverlay.ROUNDED_PIECE_WIDTH);
                            // Second comes the background (white layer) with inverse border radius
                            let className = SelectionsOverlay.EDITOR_BACKGROUND_CLASS_NAME;
                            if (endStyle.top === 1 /* CornerStyle.INTERN */) {
                                className += ' ' + SelectionsOverlay.SELECTION_TOP_LEFT;
                            }
                            if (endStyle.bottom === 1 /* CornerStyle.INTERN */) {
                                className += ' ' + SelectionsOverlay.SELECTION_BOTTOM_LEFT;
                            }
                            innerCornerOutput += this._createSelectionPiece(top, lineHeight, className, visibleRange.left + visibleRange.width, SelectionsOverlay.ROUNDED_PIECE_WIDTH);
                        }
                    }
                    let className = SelectionsOverlay.SELECTION_CLASS_NAME;
                    if (visibleRangesHaveStyle) {
                        const startStyle = visibleRange.startStyle;
                        const endStyle = visibleRange.endStyle;
                        if (startStyle.top === 0 /* CornerStyle.EXTERN */) {
                            className += ' ' + SelectionsOverlay.SELECTION_TOP_LEFT;
                        }
                        if (startStyle.bottom === 0 /* CornerStyle.EXTERN */) {
                            className += ' ' + SelectionsOverlay.SELECTION_BOTTOM_LEFT;
                        }
                        if (endStyle.top === 0 /* CornerStyle.EXTERN */) {
                            className += ' ' + SelectionsOverlay.SELECTION_TOP_RIGHT;
                        }
                        if (endStyle.bottom === 0 /* CornerStyle.EXTERN */) {
                            className += ' ' + SelectionsOverlay.SELECTION_BOTTOM_RIGHT;
                        }
                    }
                    restOfSelectionOutput += this._createSelectionPiece(top, lineHeight, className, visibleRange.left, visibleRange.width);
                }
                output2[lineIndex][0] += innerCornerOutput;
                output2[lineIndex][1] += restOfSelectionOutput;
            }
        }
        prepareRender(ctx) {
            // Build HTML for inner corners separate from HTML for the rest of selections,
            // as the inner corner HTML can interfere with that of other selections.
            // In final render, make sure to place the inner corner HTML before the rest of selection HTML. See issue #77777.
            const output = [];
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                output[lineIndex] = ['', ''];
            }
            const thisFrameVisibleRangesWithStyle = [];
            for (let i = 0, len = this._selections.length; i < len; i++) {
                const selection = this._selections[i];
                if (selection.isEmpty()) {
                    thisFrameVisibleRangesWithStyle[i] = null;
                    continue;
                }
                const visibleRangesWithStyle = this._getVisibleRangesWithStyle(selection, ctx, this._previousFrameVisibleRangesWithStyle[i]);
                thisFrameVisibleRangesWithStyle[i] = visibleRangesWithStyle;
                this._actualRenderOneSelection(output, visibleStartLineNumber, this._selections.length > 1, visibleRangesWithStyle);
            }
            this._previousFrameVisibleRangesWithStyle = thisFrameVisibleRangesWithStyle;
            this._renderResult = output.map(([internalCorners, restOfSelection]) => internalCorners + restOfSelection);
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
    exports.SelectionsOverlay = SelectionsOverlay;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const editorSelectionForegroundColor = theme.getColor(colorRegistry_1.editorSelectionForeground);
        if (editorSelectionForegroundColor && !editorSelectionForegroundColor.isTransparent()) {
            collector.addRule(`.monaco-editor .view-line span.inline-selected-text { color: ${editorSelectionForegroundColor}; }`);
        }
    });
    function abs(n) {
        return n < 0 ? -n : n;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXdQYXJ0cy9zZWxlY3Rpb25zL3NlbGVjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLElBQVcsV0FJVjtJQUpELFdBQVcsV0FBVztRQUNyQixpREFBTSxDQUFBO1FBQ04saURBQU0sQ0FBQTtRQUNOLDZDQUFJLENBQUE7SUFDTCxDQUFDLEVBSlUsV0FBVyxLQUFYLFdBQVcsUUFJckI7SUFPRCxNQUFNLHdCQUF3QjtRQU03QixZQUFZLEtBQXNCO1lBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQztLQUNEO0lBRUQsTUFBTSwwQkFBMEI7UUFJL0IsWUFBWSxVQUFrQixFQUFFLE1BQWtDO1lBQ2pFLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLENBQUM7S0FDRDtJQUVELFNBQVMsYUFBYSxDQUFDLElBQXFCO1FBQzNDLE9BQU8sSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsU0FBUyxRQUFRLENBQUMsSUFBdUI7UUFDeEMsT0FBTyxJQUFJLDBCQUEwQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBRUQsTUFBYSxpQkFBa0IsU0FBUSx1Q0FBa0I7aUJB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