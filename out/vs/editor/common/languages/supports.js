/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ignoreBracketsInToken = exports.ScopedLineTokens = exports.createScopedLineTokens = void 0;
    function createScopedLineTokens(context, offset) {
        const tokenCount = context.getCount();
        const tokenIndex = context.findTokenIndexAtOffset(offset);
        const desiredLanguageId = context.getLanguageId(tokenIndex);
        let lastTokenIndex = tokenIndex;
        while (lastTokenIndex + 1 < tokenCount && context.getLanguageId(lastTokenIndex + 1) === desiredLanguageId) {
            lastTokenIndex++;
        }
        let firstTokenIndex = tokenIndex;
        while (firstTokenIndex > 0 && context.getLanguageId(firstTokenIndex - 1) === desiredLanguageId) {
            firstTokenIndex--;
        }
        return new ScopedLineTokens(context, desiredLanguageId, firstTokenIndex, lastTokenIndex + 1, context.getStartOffset(firstTokenIndex), context.getEndOffset(lastTokenIndex));
    }
    exports.createScopedLineTokens = createScopedLineTokens;
    class ScopedLineTokens {
        constructor(actual, languageId, firstTokenIndex, lastTokenIndex, firstCharOffset, lastCharOffset) {
            this._scopedLineTokensBrand = undefined;
            this._actual = actual;
            this.languageId = languageId;
            this._firstTokenIndex = firstTokenIndex;
            this._lastTokenIndex = lastTokenIndex;
            this.firstCharOffset = firstCharOffset;
            this._lastCharOffset = lastCharOffset;
        }
        getLineContent() {
            const actualLineContent = this._actual.getLineContent();
            return actualLineContent.substring(this.firstCharOffset, this._lastCharOffset);
        }
        getActualLineContentBefore(offset) {
            const actualLineContent = this._actual.getLineContent();
            return actualLineContent.substring(0, this.firstCharOffset + offset);
        }
        getTokenCount() {
            return this._lastTokenIndex - this._firstTokenIndex;
        }
        findTokenIndexAtOffset(offset) {
            return this._actual.findTokenIndexAtOffset(offset + this.firstCharOffset) - this._firstTokenIndex;
        }
        getStandardTokenType(tokenIndex) {
            return this._actual.getStandardTokenType(tokenIndex + this._firstTokenIndex);
        }
    }
    exports.ScopedLineTokens = ScopedLineTokens;
    var IgnoreBracketsInTokens;
    (function (IgnoreBracketsInTokens) {
        IgnoreBracketsInTokens[IgnoreBracketsInTokens["value"] = 3] = "value";
    })(IgnoreBracketsInTokens || (IgnoreBracketsInTokens = {}));
    function ignoreBracketsInToken(standardTokenType) {
        return (standardTokenType & 3 /* IgnoreBracketsInTokens.value */) !== 0;
    }
    exports.ignoreBracketsInToken = ignoreBracketsInToken;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VwcG9ydHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlcy9zdXBwb3J0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsU0FBZ0Isc0JBQXNCLENBQUMsT0FBbUIsRUFBRSxNQUFjO1FBQ3pFLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0QyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUQsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTVELElBQUksY0FBYyxHQUFHLFVBQVUsQ0FBQztRQUNoQyxPQUFPLGNBQWMsR0FBRyxDQUFDLEdBQUcsVUFBVSxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxLQUFLLGlCQUFpQixFQUFFO1lBQzFHLGNBQWMsRUFBRSxDQUFDO1NBQ2pCO1FBRUQsSUFBSSxlQUFlLEdBQUcsVUFBVSxDQUFDO1FBQ2pDLE9BQU8sZUFBZSxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsS0FBSyxpQkFBaUIsRUFBRTtZQUMvRixlQUFlLEVBQUUsQ0FBQztTQUNsQjtRQUVELE9BQU8sSUFBSSxnQkFBZ0IsQ0FDMUIsT0FBTyxFQUNQLGlCQUFpQixFQUNqQixlQUFlLEVBQ2YsY0FBYyxHQUFHLENBQUMsRUFDbEIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFDdkMsT0FBTyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FDcEMsQ0FBQztJQUNILENBQUM7SUF2QkQsd0RBdUJDO0lBRUQsTUFBYSxnQkFBZ0I7UUFVNUIsWUFDQyxNQUFrQixFQUNsQixVQUFrQixFQUNsQixlQUF1QixFQUN2QixjQUFzQixFQUN0QixlQUF1QixFQUN2QixjQUFzQjtZQWZ2QiwyQkFBc0IsR0FBUyxTQUFTLENBQUM7WUFpQnhDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzdCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7WUFDeEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7WUFDdEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7WUFDdkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdkMsQ0FBQztRQUVNLGNBQWM7WUFDcEIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3hELE9BQU8saUJBQWlCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTSwwQkFBMEIsQ0FBQyxNQUFjO1lBQy9DLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN4RCxPQUFPLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQ3JELENBQUM7UUFFTSxzQkFBc0IsQ0FBQyxNQUFjO1lBQzNDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUNuRyxDQUFDO1FBRU0sb0JBQW9CLENBQUMsVUFBa0I7WUFDN0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5RSxDQUFDO0tBQ0Q7SUEvQ0QsNENBK0NDO0lBRUQsSUFBVyxzQkFFVjtJQUZELFdBQVcsc0JBQXNCO1FBQ2hDLHFFQUFzRixDQUFBO0lBQ3ZGLENBQUMsRUFGVSxzQkFBc0IsS0FBdEIsc0JBQXNCLFFBRWhDO0lBRUQsU0FBZ0IscUJBQXFCLENBQUMsaUJBQW9DO1FBQ3pFLE9BQU8sQ0FBQyxpQkFBaUIsdUNBQStCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUZELHNEQUVDIn0=