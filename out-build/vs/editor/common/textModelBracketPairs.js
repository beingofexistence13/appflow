/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iu = exports.$hu = exports.$gu = void 0;
    class $gu {
        constructor(range, 
        /** 0-based level */
        nestingLevel, nestingLevelOfEqualBracketType, isInvalid) {
            this.range = range;
            this.nestingLevel = nestingLevel;
            this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
            this.isInvalid = isInvalid;
        }
    }
    exports.$gu = $gu;
    class $hu {
        constructor(range, openingBracketRange, closingBracketRange, 
        /** 0-based */
        nestingLevel, nestingLevelOfEqualBracketType, a) {
            this.range = range;
            this.openingBracketRange = openingBracketRange;
            this.closingBracketRange = closingBracketRange;
            this.nestingLevel = nestingLevel;
            this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
            this.a = a;
        }
        get openingBracketInfo() {
            return this.a.openingBracket.bracketInfo;
        }
        get closingBracketInfo() {
            return this.a.closingBracket?.bracketInfo;
        }
    }
    exports.$hu = $hu;
    class $iu extends $hu {
        constructor(range, openingBracketRange, closingBracketRange, 
        /**
         * 0-based
        */
        nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode, 
        /**
         * -1 if not requested, otherwise the size of the minimum indentation in the bracket pair in terms of visible columns.
        */
        minVisibleColumnIndentation) {
            super(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode);
            this.minVisibleColumnIndentation = minVisibleColumnIndentation;
        }
    }
    exports.$iu = $iu;
});
//# sourceMappingURL=textModelBracketPairs.js.map