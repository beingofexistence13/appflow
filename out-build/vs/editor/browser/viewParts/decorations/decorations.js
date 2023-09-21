/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/browser/view/renderingContext", "vs/editor/common/core/range", "vs/css!./decorations"], function (require, exports, dynamicViewOverlay_1, renderingContext_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qX = void 0;
    class $qX extends dynamicViewOverlay_1.$eX {
        constructor(context) {
            super();
            this.c = context;
            const options = this.c.configuration.options;
            this.g = options.get(66 /* EditorOption.lineHeight */);
            this.m = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            this.n = null;
            this.c.addEventHandler(this);
        }
        dispose() {
            this.c.removeEventHandler(this);
            this.n = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this.c.configuration.options;
            this.g = options.get(66 /* EditorOption.lineHeight */);
            this.m = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
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
                return range_1.$ks.compareRangesUsingStarts(a.range, b.range);
            });
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                output[lineIndex] = '';
            }
            // Render first whole line decorations and then regular decorations
            this.r(ctx, decorations, output);
            this.s(ctx, decorations, output);
            this.n = output;
        }
        r(ctx, decorations, output) {
            const lineHeight = String(this.g);
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
        s(ctx, decorations, output) {
            const lineHeight = String(this.g);
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
                    range = new range_1.$ks(range.startLineNumber, range.startColumn, range.endLineNumber - 1, this.c.viewModel.getLineMaxColumn(range.endLineNumber - 1));
                }
                if (prevClassName === className && prevShowIfCollapsed === showIfCollapsed && range_1.$ks.areIntersectingOrTouching(prevRange, range)) {
                    // merge into previous decoration
                    prevRange = range_1.$ks.plusRange(prevRange, range);
                    continue;
                }
                // flush previous decoration
                if (prevClassName !== null) {
                    this.t(ctx, prevRange, prevClassName, prevShouldFillLineOnLineBreak, prevShowIfCollapsed, lineHeight, visibleStartLineNumber, output);
                }
                prevClassName = className;
                prevShowIfCollapsed = showIfCollapsed;
                prevRange = range;
                prevShouldFillLineOnLineBreak = d.options.shouldFillLineOnLineBreak ?? false;
            }
            if (prevClassName !== null) {
                this.t(ctx, prevRange, prevClassName, prevShouldFillLineOnLineBreak, prevShowIfCollapsed, lineHeight, visibleStartLineNumber, output);
            }
        }
        t(ctx, range, className, shouldFillLineOnLineBreak, showIfCollapsed, lineHeight, visibleStartLineNumber, output) {
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
                    if (singleVisibleRange.width < this.m) {
                        // collapsed/very small range case => make the decoration visible by expanding its width
                        // expand its size on both sides (both to the left and to the right, keeping it centered)
                        const center = Math.round(singleVisibleRange.left + singleVisibleRange.width / 2);
                        const left = Math.max(0, Math.round(center - this.m / 2));
                        lineVisibleRanges.ranges[0] = new renderingContext_1.$AW(left, this.m);
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
            if (!this.n) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this.n.length) {
                return '';
            }
            return this.n[lineIndex];
        }
    }
    exports.$qX = $qX;
});
//# sourceMappingURL=decorations.js.map