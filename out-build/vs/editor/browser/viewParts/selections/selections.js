/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./selections"], function (require, exports, dynamicViewOverlay_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OX = void 0;
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
    class $OX extends dynamicViewOverlay_1.$eX {
        static { this.a = 'selected-text'; }
        static { this.b = 'top-left-radius'; }
        static { this.c = 'bottom-left-radius'; }
        static { this.g = 'top-right-radius'; }
        static { this.m = 'bottom-right-radius'; }
        static { this.r = 'monaco-editor-background'; }
        static { this.s = 10; }
        constructor(context) {
            super();
            this.J = [];
            this.t = context;
            const options = this.t.configuration.options;
            this.u = options.get(66 /* EditorOption.lineHeight */);
            this.w = options.get(100 /* EditorOption.roundedSelection */);
            this.y = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            this.z = [];
            this.C = null;
            this.t.addEventHandler(this);
        }
        dispose() {
            this.t.removeEventHandler(this);
            this.C = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this.t.configuration.options;
            this.u = options.get(66 /* EditorOption.lineHeight */);
            this.w = options.get(100 /* EditorOption.roundedSelection */);
            this.y = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            return true;
        }
        onCursorStateChanged(e) {
            this.z = e.selections.slice(0);
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
        D(linesVisibleRanges) {
            for (let i = 0, len = linesVisibleRanges.length; i < len; i++) {
                const lineVisibleRanges = linesVisibleRanges[i];
                if (lineVisibleRanges.ranges.length > 1) {
                    // There are two ranges on the same line
                    return true;
                }
            }
            return false;
        }
        F(viewport, linesVisibleRanges, previousFrame) {
            const epsilon = this.y / 4;
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
        G(selection, ctx, previousFrame) {
            const _linesVisibleRanges = ctx.linesVisibleRangesForRange(selection, true) || [];
            const linesVisibleRanges = _linesVisibleRanges.map(toStyled);
            const visibleRangesHaveGaps = this.D(linesVisibleRanges);
            if (!visibleRangesHaveGaps && this.w) {
                this.F(ctx.visibleRange, linesVisibleRanges, previousFrame);
            }
            // The visible ranges are sorted TOP-BOTTOM and LEFT-RIGHT
            return linesVisibleRanges;
        }
        H(top, height, className, left, width) {
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
        I(output2, visibleStartLineNumber, hasMultipleSelections, visibleRanges) {
            if (visibleRanges.length === 0) {
                return;
            }
            const visibleRangesHaveStyle = !!visibleRanges[0].ranges[0].startStyle;
            const fullLineHeight = (this.u).toString();
            const reducedLineHeight = (this.u - 1).toString();
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
                            innerCornerOutput += this.H(top, lineHeight, $OX.a, visibleRange.left - $OX.s, $OX.s);
                            // Second comes the background (white layer) with inverse border radius
                            let className = $OX.r;
                            if (startStyle.top === 1 /* CornerStyle.INTERN */) {
                                className += ' ' + $OX.g;
                            }
                            if (startStyle.bottom === 1 /* CornerStyle.INTERN */) {
                                className += ' ' + $OX.m;
                            }
                            innerCornerOutput += this.H(top, lineHeight, className, visibleRange.left - $OX.s, $OX.s);
                        }
                        if (endStyle.top === 1 /* CornerStyle.INTERN */ || endStyle.bottom === 1 /* CornerStyle.INTERN */) {
                            // Reverse rounded corner to the right
                            // First comes the selection (blue layer)
                            innerCornerOutput += this.H(top, lineHeight, $OX.a, visibleRange.left + visibleRange.width, $OX.s);
                            // Second comes the background (white layer) with inverse border radius
                            let className = $OX.r;
                            if (endStyle.top === 1 /* CornerStyle.INTERN */) {
                                className += ' ' + $OX.b;
                            }
                            if (endStyle.bottom === 1 /* CornerStyle.INTERN */) {
                                className += ' ' + $OX.c;
                            }
                            innerCornerOutput += this.H(top, lineHeight, className, visibleRange.left + visibleRange.width, $OX.s);
                        }
                    }
                    let className = $OX.a;
                    if (visibleRangesHaveStyle) {
                        const startStyle = visibleRange.startStyle;
                        const endStyle = visibleRange.endStyle;
                        if (startStyle.top === 0 /* CornerStyle.EXTERN */) {
                            className += ' ' + $OX.b;
                        }
                        if (startStyle.bottom === 0 /* CornerStyle.EXTERN */) {
                            className += ' ' + $OX.c;
                        }
                        if (endStyle.top === 0 /* CornerStyle.EXTERN */) {
                            className += ' ' + $OX.g;
                        }
                        if (endStyle.bottom === 0 /* CornerStyle.EXTERN */) {
                            className += ' ' + $OX.m;
                        }
                    }
                    restOfSelectionOutput += this.H(top, lineHeight, className, visibleRange.left, visibleRange.width);
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
            for (let i = 0, len = this.z.length; i < len; i++) {
                const selection = this.z[i];
                if (selection.isEmpty()) {
                    thisFrameVisibleRangesWithStyle[i] = null;
                    continue;
                }
                const visibleRangesWithStyle = this.G(selection, ctx, this.J[i]);
                thisFrameVisibleRangesWithStyle[i] = visibleRangesWithStyle;
                this.I(output, visibleStartLineNumber, this.z.length > 1, visibleRangesWithStyle);
            }
            this.J = thisFrameVisibleRangesWithStyle;
            this.C = output.map(([internalCorners, restOfSelection]) => internalCorners + restOfSelection);
        }
        render(startLineNumber, lineNumber) {
            if (!this.C) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this.C.length) {
                return '';
            }
            return this.C[lineIndex];
        }
    }
    exports.$OX = $OX;
    (0, themeService_1.$mv)((theme, collector) => {
        const editorSelectionForegroundColor = theme.getColor(colorRegistry_1.$Ow);
        if (editorSelectionForegroundColor && !editorSelectionForegroundColor.isTransparent()) {
            collector.addRule(`.monaco-editor .view-line span.inline-selected-text { color: ${editorSelectionForegroundColor}; }`);
        }
    });
    function abs(n) {
        return n < 0 ? -n : n;
    }
});
//# sourceMappingURL=selections.js.map