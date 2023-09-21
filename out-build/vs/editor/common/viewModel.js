/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings", "vs/editor/common/core/range"], function (require, exports, arrays, strings, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eV = exports.$dV = exports.$cV = exports.$bV = exports.InlineDecorationType = exports.$aV = exports.$_U = exports.$$U = exports.$0U = void 0;
    class $0U {
        constructor(top, left, width, height) {
            this._viewportBrand = undefined;
            this.top = top | 0;
            this.left = left | 0;
            this.width = width | 0;
            this.height = height | 0;
        }
    }
    exports.$0U = $0U;
    class $$U {
        constructor(tabSize, data) {
            this.tabSize = tabSize;
            this.data = data;
        }
    }
    exports.$$U = $$U;
    class $_U {
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
    exports.$_U = $_U;
    class $aV {
        constructor(minColumn, maxColumn, content, continuesWithWrappedLine, mightContainRTL, mightContainNonBasicASCII, tokens, inlineDecorations, tabSize, startVisibleColumn) {
            this.minColumn = minColumn;
            this.maxColumn = maxColumn;
            this.content = content;
            this.continuesWithWrappedLine = continuesWithWrappedLine;
            this.isBasicASCII = $aV.isBasicASCII(content, mightContainNonBasicASCII);
            this.containsRTL = $aV.containsRTL(content, this.isBasicASCII, mightContainRTL);
            this.tokens = tokens;
            this.inlineDecorations = inlineDecorations;
            this.tabSize = tabSize;
            this.startVisibleColumn = startVisibleColumn;
        }
        static isBasicASCII(lineContent, mightContainNonBasicASCII) {
            if (mightContainNonBasicASCII) {
                return strings.$2e(lineContent);
            }
            return true;
        }
        static containsRTL(lineContent, isBasicASCII, mightContainRTL) {
            if (!isBasicASCII && mightContainRTL) {
                return strings.$1e(lineContent);
            }
            return false;
        }
    }
    exports.$aV = $aV;
    var InlineDecorationType;
    (function (InlineDecorationType) {
        InlineDecorationType[InlineDecorationType["Regular"] = 0] = "Regular";
        InlineDecorationType[InlineDecorationType["Before"] = 1] = "Before";
        InlineDecorationType[InlineDecorationType["After"] = 2] = "After";
        InlineDecorationType[InlineDecorationType["RegularAffectingLetterSpacing"] = 3] = "RegularAffectingLetterSpacing";
    })(InlineDecorationType || (exports.InlineDecorationType = InlineDecorationType = {}));
    class $bV {
        constructor(range, inlineClassName, type) {
            this.range = range;
            this.inlineClassName = inlineClassName;
            this.type = type;
        }
    }
    exports.$bV = $bV;
    class $cV {
        constructor(startOffset, endOffset, inlineClassName, inlineClassNameAffectsLetterSpacing) {
            this.startOffset = startOffset;
            this.endOffset = endOffset;
            this.inlineClassName = inlineClassName;
            this.inlineClassNameAffectsLetterSpacing = inlineClassNameAffectsLetterSpacing;
        }
        toInlineDecoration(lineNumber) {
            return new $bV(new range_1.$ks(lineNumber, this.startOffset + 1, lineNumber, this.endOffset + 1), this.inlineClassName, this.inlineClassNameAffectsLetterSpacing ? 3 /* InlineDecorationType.RegularAffectingLetterSpacing */ : 0 /* InlineDecorationType.Regular */);
        }
    }
    exports.$cV = $cV;
    class $dV {
        constructor(range, options) {
            this._viewModelDecorationBrand = undefined;
            this.range = range;
            this.options = options;
        }
    }
    exports.$dV = $dV;
    class $eV {
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
                && arrays.$sb(a.data, b.data));
        }
        static equalsArr(a, b) {
            return arrays.$sb(a, b, $eV.equals);
        }
    }
    exports.$eV = $eV;
});
//# sourceMappingURL=viewModel.js.map