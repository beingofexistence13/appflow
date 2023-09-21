/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VisibleRanges = exports.HorizontalPosition = exports.FloatHorizontalRange = exports.HorizontalRange = exports.LineVisibleRanges = exports.RenderingContext = exports.RestrictedRenderingContext = void 0;
    class RestrictedRenderingContext {
        constructor(viewLayout, viewportData) {
            this._restrictedRenderingContextBrand = undefined;
            this._viewLayout = viewLayout;
            this.viewportData = viewportData;
            this.scrollWidth = this._viewLayout.getScrollWidth();
            this.scrollHeight = this._viewLayout.getScrollHeight();
            this.visibleRange = this.viewportData.visibleRange;
            this.bigNumbersDelta = this.viewportData.bigNumbersDelta;
            const vInfo = this._viewLayout.getCurrentViewport();
            this.scrollTop = vInfo.top;
            this.scrollLeft = vInfo.left;
            this.viewportWidth = vInfo.width;
            this.viewportHeight = vInfo.height;
        }
        getScrolledTopFromAbsoluteTop(absoluteTop) {
            return absoluteTop - this.scrollTop;
        }
        getVerticalOffsetForLineNumber(lineNumber, includeViewZones) {
            return this._viewLayout.getVerticalOffsetForLineNumber(lineNumber, includeViewZones);
        }
        getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones) {
            return this._viewLayout.getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones);
        }
        getDecorationsInViewport() {
            return this.viewportData.getDecorationsInViewport();
        }
    }
    exports.RestrictedRenderingContext = RestrictedRenderingContext;
    class RenderingContext extends RestrictedRenderingContext {
        constructor(viewLayout, viewportData, viewLines) {
            super(viewLayout, viewportData);
            this._renderingContextBrand = undefined;
            this._viewLines = viewLines;
        }
        linesVisibleRangesForRange(range, includeNewLines) {
            return this._viewLines.linesVisibleRangesForRange(range, includeNewLines);
        }
        visibleRangeForPosition(position) {
            return this._viewLines.visibleRangeForPosition(position);
        }
    }
    exports.RenderingContext = RenderingContext;
    class LineVisibleRanges {
        /**
         * Returns the element with the smallest `lineNumber`.
         */
        static firstLine(ranges) {
            if (!ranges) {
                return null;
            }
            let result = null;
            for (const range of ranges) {
                if (!result || range.lineNumber < result.lineNumber) {
                    result = range;
                }
            }
            return result;
        }
        /**
         * Returns the element with the largest `lineNumber`.
         */
        static lastLine(ranges) {
            if (!ranges) {
                return null;
            }
            let result = null;
            for (const range of ranges) {
                if (!result || range.lineNumber > result.lineNumber) {
                    result = range;
                }
            }
            return result;
        }
        constructor(outsideRenderedLine, lineNumber, ranges, 
        /**
         * Indicates if the requested range does not end in this line, but continues on the next line.
         */
        continuesOnNextLine) {
            this.outsideRenderedLine = outsideRenderedLine;
            this.lineNumber = lineNumber;
            this.ranges = ranges;
            this.continuesOnNextLine = continuesOnNextLine;
        }
    }
    exports.LineVisibleRanges = LineVisibleRanges;
    class HorizontalRange {
        static from(ranges) {
            const result = new Array(ranges.length);
            for (let i = 0, len = ranges.length; i < len; i++) {
                const range = ranges[i];
                result[i] = new HorizontalRange(range.left, range.width);
            }
            return result;
        }
        constructor(left, width) {
            this._horizontalRangeBrand = undefined;
            this.left = Math.round(left);
            this.width = Math.round(width);
        }
        toString() {
            return `[${this.left},${this.width}]`;
        }
    }
    exports.HorizontalRange = HorizontalRange;
    class FloatHorizontalRange {
        constructor(left, width) {
            this._floatHorizontalRangeBrand = undefined;
            this.left = left;
            this.width = width;
        }
        toString() {
            return `[${this.left},${this.width}]`;
        }
        static compare(a, b) {
            return a.left - b.left;
        }
    }
    exports.FloatHorizontalRange = FloatHorizontalRange;
    class HorizontalPosition {
        constructor(outsideRenderedLine, left) {
            this.outsideRenderedLine = outsideRenderedLine;
            this.originalLeft = left;
            this.left = Math.round(this.originalLeft);
        }
    }
    exports.HorizontalPosition = HorizontalPosition;
    class VisibleRanges {
        constructor(outsideRenderedLine, ranges) {
            this.outsideRenderedLine = outsideRenderedLine;
            this.ranges = ranges;
        }
    }
    exports.VisibleRanges = VisibleRanges;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyaW5nQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXcvcmVuZGVyaW5nQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBc0IsMEJBQTBCO1FBbUIvQyxZQUFZLFVBQXVCLEVBQUUsWUFBMEI7WUFsQi9ELHFDQUFnQyxHQUFTLFNBQVMsQ0FBQztZQW1CbEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7WUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7WUFFakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3JELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUV2RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDO1lBQ25ELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUM7WUFFekQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNwQyxDQUFDO1FBRU0sNkJBQTZCLENBQUMsV0FBbUI7WUFDdkQsT0FBTyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNyQyxDQUFDO1FB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