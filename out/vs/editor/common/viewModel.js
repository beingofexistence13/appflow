/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings", "vs/editor/common/core/range"], function (require, exports, arrays, strings, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OverviewRulerDecorationsGroup = exports.ViewModelDecoration = exports.SingleLineInlineDecoration = exports.InlineDecoration = exports.InlineDecorationType = exports.ViewLineRenderingData = exports.ViewLineData = exports.MinimapLinesRenderingData = exports.Viewport = void 0;
    class Viewport {
        constructor(top, left, width, height) {
            this._viewportBrand = undefined;
            this.top = top | 0;
            this.left = left | 0;
            this.width = width | 0;
            this.height = height | 0;
        }
    }
    exports.Viewport = Viewport;
    class MinimapLinesRenderingData {
        constructor(tabSize, data) {
            this.tabSize = tabSize;
            this.data = data;
        }
    }
    exports.MinimapLinesRenderingData = MinimapLinesRenderingData;
    class ViewLineData {
        constructor(content, continuesWithWrappedLine, minColumn, maxColumn, startVisibleColumn, tokens, inlineDecorations) {
            this._viewLineDataBrand = undefined;
            this.content = content;
            this.continuesWithWrappedLine = continuesWithWrappedLine;
            this.minColumn = minColumn;
            this.maxColumn = maxColumn;
            this.startVisibleColumn = startVisibleColumn;
            this.tokens = tokens;
            this.inlineDecorations = inlineDecorations;
        }
    }
    exports.ViewLineData = ViewLineData;
    class ViewLineRenderingData {
        constructor(minColumn, maxColumn, content, continuesWithWrappedLine, mightContainRTL, mightContainNonBasicASCII, tokens, inlineDecorations, tabSize, startVisibleColumn) {
            this.minColumn = minColumn;
            this.maxColumn = maxColumn;
            this.content = content;
            this.continuesWithWrappedLine = continuesWithWrappedLine;
            this.isBasicASCII = ViewLineRenderingData.isBasicASCII(content, mightContainNonBasicASCII);
            this.containsRTL = ViewLineRenderingData.containsRTL(content, this.isBasicASCII, mightContainRTL);
            this.tokens = tokens;
            this.inlineDecorations = inlineDecorations;
            this.tabSize = tabSize;
            this.startVisibleColumn = startVisibleColumn;
        }
        static isBasicASCII(lineContent, mightContainNonBasicASCII) {
            if (mightContainNonBasicASCII) {
                return strings.isBasicASCII(lineContent);
            }
            return true;
        }
        static containsRTL(lineContent, isBasicASCII, mightContainRTL) {
            if (!isBasicASCII && mightContainRTL) {
                return strings.containsRTL(lineContent);
            }
            return false;
        }
    }
    exports.ViewLineRenderingData = ViewLineRenderingData;
    var InlineDecorationType;
    (function (InlineDecorationType) {
        InlineDecorationType[InlineDecorationType["Regular"] = 0] = "Regular";
        InlineDecorationType[InlineDecorationType["Before"] = 1] = "Before";
        InlineDecorationType[InlineDecorationType["After"] = 2] = "After";
        InlineDecorationType[InlineDecorationType["RegularAffectingLetterSpacing"] = 3] = "RegularAffectingLetterSpacing";
    })(InlineDecorationType || (exports.InlineDecorationType = InlineDecorationType = {}));
    class InlineDecoration {
        constructor(range, inlineClassName, type) {
            this.range = range;
            this.inlineClassName = inlineClassName;
            this.type = type;
        }
    }
    exports.InlineDecoration = InlineDecoration;
    class SingleLineInlineDecoration {
        constructor(startOffset, endOffset, inlineClassName, inlineClassNameAffectsLetterSpacing) {
            this.startOffset = startOffset;
            this.endOffset = endOffset;
            this.inlineClassName = inlineClassName;
            this.inlineClassNameAffectsLetterSpacing = inlineClassNameAffectsLetterSpacing;
        }
        toInlineDecoration(lineNumber) {
            return new InlineDecoration(new range_1.Range(lineNumber, this.startOffset + 1, lineNumber, this.endOffset + 1), this.inlineClassName, this.inlineClassNameAffectsLetterSpacing ? 3 /* InlineDecorationType.RegularAffectingLetterSpacing */ : 0 /* InlineDecorationType.Regular */);
        }
    }
    exports.SingleLineInlineDecoration = SingleLineInlineDecoration;
    class ViewModelDecoration {
        constructor(range, options) {
            this._viewModelDecorationBrand = undefined;
            this.range = range;
            this.options = options;
        }
    }
    exports.ViewModelDecoration = ViewModelDecoration;
    class OverviewRulerDecorationsGroup {
        constructor(color, zIndex, 
        /**
         * Decorations are encoded in a number array using the following scheme:
         *  - 3*i = lane
         *  - 3*i+1 = startLineNumber
         *  - 3*i+2 = endLineNumber
         */
        data) {
            this.color = color;
            this.zIndex = zIndex;
            this.data = data;
        }
        static compareByRenderingProps(a, b) {
            if (a.zIndex === b.zIndex) {
                if (a.color < b.color) {
                    return -1;
                }
                if (a.color > b.color) {
                    return 1;
                }
                return 0;
            }
            return a.zIndex - b.zIndex;
        }
        static equals(a, b) {
            return (a.color === b.color
                && a.zIndex === b.zIndex
                && arrays.equals(a.data, b.data));
        }
        static equalsArr(a, b) {
            return arrays.equals(a, b, OverviewRulerDecorationsGroup.equals);
        }
    }
    exports.OverviewRulerDecorationsGroup = OverviewRulerDecorationsGroup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld01vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi92aWV3TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkxoRyxNQUFhLFFBQVE7UUFRcEIsWUFBWSxHQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWEsRUFBRSxNQUFjO1lBUDNELG1CQUFjLEdBQVMsU0FBUyxDQUFDO1lBUXpDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUMxQixDQUFDO0tBQ0Q7SUFkRCw0QkFjQztJQXdCRCxNQUFhLHlCQUF5QjtRQUlyQyxZQUNDLE9BQWUsRUFDZixJQUFnQztZQUVoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixDQUFDO0tBQ0Q7SUFYRCw4REFXQztJQUVELE1BQWEsWUFBWTtRQWlDeEIsWUFDQyxPQUFlLEVBQ2Ysd0JBQWlDLEVBQ2pDLFNBQWlCLEVBQ2pCLFNBQWlCLEVBQ2pCLGtCQUEwQixFQUMxQixNQUF1QixFQUN2QixpQkFBK0Q7WUF2Q2hFLHVCQUFrQixHQUFTLFNBQVMsQ0FBQztZQXlDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxDQUFDLHdCQUF3QixHQUFHLHdCQUF3QixDQUFDO1lBQ3pELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNC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