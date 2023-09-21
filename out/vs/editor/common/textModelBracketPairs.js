/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BracketPairWithMinIndentationInfo = exports.BracketPairInfo = exports.BracketInfo = void 0;
    class BracketInfo {
        constructor(range, 
        /** 0-based level */
        nestingLevel, nestingLevelOfEqualBracketType, isInvalid) {
            this.range = range;
            this.nestingLevel = nestingLevel;
            this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
            this.isInvalid = isInvalid;
        }
    }
    exports.BracketInfo = BracketInfo;
    class BracketPairInfo {
        constructor(range, openingBracketRange, closingBracketRange, 
        /** 0-based */
        nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode) {
            this.range = range;
            this.openingBracketRange = openingBracketRange;
            this.closingBracketRange = closingBracketRange;
            this.nestingLevel = nestingLevel;
            this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
            this.bracketPairNode = bracketPairNode;
        }
        get openingBracketInfo() {
            return this.bracketPairNode.openingBracket.bracketInfo;
        }
        get closingBracketInfo() {
            return this.bracketPairNode.closingBracket?.bracketInfo;
        }
    }
    exports.BracketPairInfo = BracketPairInfo;
    class BracketPairWithMinIndentationInfo extends BracketPairInfo {
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
    exports.BracketPairWithMinIndentationInfo = BracketPairWithMinIndentationInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsQnJhY2tldFBhaXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi90ZXh0TW9kZWxCcmFja2V0UGFpcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0VoRyxNQUFhLFdBQVc7UUFDdkIsWUFDaUIsS0FBWTtRQUM1QixvQkFBb0I7UUFDSixZQUFvQixFQUNwQiw4QkFBc0MsRUFDdEMsU0FBa0I7WUFKbEIsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUVaLGlCQUFZLEdBQVosWUFBWSxDQUFRO1lBQ3BCLG1DQUE4QixHQUE5Qiw4QkFBOEIsQ0FBUTtZQUN0QyxjQUFTLEdBQVQsU0FBUyxDQUFTO1FBQy9CLENBQUM7S0FDTDtJQVJELGtDQVFDO0lBRUQsTUFBYSxlQUFlO1FBQzNCLFlBQ2lCLEtBQVksRUFDWixtQkFBMEIsRUFDMUIsbUJBQXNDO1FBQ3RELGNBQWM7UUFDRSxZQUFvQixFQUNwQiw4QkFBc0MsRUFDckMsZUFBNEI7WUFON0IsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUNaLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBTztZQUMxQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQW1CO1lBRXRDLGlCQUFZLEdBQVosWUFBWSxDQUFRO1lBQ3BCLG1DQUE4QixHQUE5Qiw4QkFBOEIsQ0FBUTtZQUNyQyxvQkFBZSxHQUFmLGVBQWUsQ0FBYTtRQUc5QyxDQUFDO1FBRUQsSUFBVyxrQkFBa0I7WUFDNUIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxXQUFpQyxDQUFDO1FBQzlFLENBQUM7UUFFRCxJQUFXLGtCQUFrQjtZQUM1QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLFdBQTZDLENBQUM7UUFDM0YsQ0FBQztLQUNEO0lBcEJELDBDQW9CQztJQUVELE1BQWEsaUNBQWtDLFNBQVEsZUFBZTtRQUNyRSxZQUNDLEtBQVksRUFDWixtQkFBMEIsRUFDMUIsbUJBQXNDO1FBQ3RDOztVQUVFO1FBQ0YsWUFBb0IsRUFDcEIsOEJBQXNDLEVBQ3RDLGVBQTRCO1FBQzVCOztVQUVFO1FBQ2MsMkJBQW1DO1lBRW5ELEtBQUssQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFFLDhCQUE4QixFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBRnRHLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBUTtRQUdwRCxDQUFDO0tBQ0Q7SUFsQkQsOEVBa0JDIn0=