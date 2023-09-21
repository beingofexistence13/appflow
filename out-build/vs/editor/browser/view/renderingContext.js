/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DW = exports.$CW = exports.$BW = exports.$AW = exports.$zW = exports.$yW = exports.$xW = void 0;
    class $xW {
        constructor(viewLayout, viewportData) {
            this._restrictedRenderingContextBrand = undefined;
            this.c = viewLayout;
            this.viewportData = viewportData;
            this.scrollWidth = this.c.getScrollWidth();
            this.scrollHeight = this.c.getScrollHeight();
            this.visibleRange = this.viewportData.visibleRange;
            this.bigNumbersDelta = this.viewportData.bigNumbersDelta;
            const vInfo = this.c.getCurrentViewport();
            this.scrollTop = vInfo.top;
            this.scrollLeft = vInfo.left;
            this.viewportWidth = vInfo.width;
            this.viewportHeight = vInfo.height;
        }
        getScrolledTopFromAbsoluteTop(absoluteTop) {
            return absoluteTop - this.scrollTop;
        }
        getVerticalOffsetForLineNumber(lineNumber, includeViewZones) {
            return this.c.getVerticalOffsetForLineNumber(lineNumber, includeViewZones);
        }
        getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones) {
            return this.c.getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones);
        }
        getDecorationsInViewport() {
            return this.viewportData.getDecorationsInViewport();
        }
    }
    exports.$xW = $xW;
    class $yW extends $xW {
        constructor(viewLayout, viewportData, viewLines) {
            super(viewLayout, viewportData);
            this._renderingContextBrand = undefined;
            this.d = viewLines;
        }
        linesVisibleRangesForRange(range, includeNewLines) {
            return this.d.linesVisibleRangesForRange(range, includeNewLines);
        }
        visibleRangeForPosition(position) {
            return this.d.visibleRangeForPosition(position);
        }
    }
    exports.$yW = $yW;
    class $zW {
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
    exports.$zW = $zW;
    class $AW {
        static from(ranges) {
            const result = new Array(ranges.length);
            for (let i = 0, len = ranges.length; i < len; i++) {
                const range = ranges[i];
                result[i] = new $AW(range.left, range.width);
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
    exports.$AW = $AW;
    class $BW {
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
    exports.$BW = $BW;
    class $CW {
        constructor(outsideRenderedLine, left) {
            this.outsideRenderedLine = outsideRenderedLine;
            this.originalLeft = left;
            this.left = Math.round(this.originalLeft);
        }
    }
    exports.$CW = $CW;
    class $DW {
        constructor(outsideRenderedLine, ranges) {
            this.outsideRenderedLine = outsideRenderedLine;
            this.ranges = ranges;
        }
    }
    exports.$DW = $DW;
});
//# sourceMappingURL=renderingContext.js.map