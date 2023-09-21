/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/encodedTokenAttributes"], function (require, exports, encodedTokenAttributes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestLineTokenFactory = exports.TestLineTokens = exports.TestLineToken = void 0;
    /**
     * A token on a line.
     */
    class TestLineToken {
        constructor(endIndex, metadata) {
            this.endIndex = endIndex;
            this._metadata = metadata;
        }
        getForeground() {
            return encodedTokenAttributes_1.TokenMetadata.getForeground(this._metadata);
        }
        getType() {
            return encodedTokenAttributes_1.TokenMetadata.getClassNameFromMetadata(this._metadata);
        }
        getInlineStyle(colorMap) {
            return encodedTokenAttributes_1.TokenMetadata.getInlineStyleFromMetadata(this._metadata, colorMap);
        }
        getPresentation() {
            return encodedTokenAttributes_1.TokenMetadata.getPresentationFromMetadata(this._metadata);
        }
        static _equals(a, b) {
            return (a.endIndex === b.endIndex
                && a._metadata === b._metadata);
        }
        static equalsArr(a, b) {
            const aLen = a.length;
            const bLen = b.length;
            if (aLen !== bLen) {
                return false;
            }
            for (let i = 0; i < aLen; i++) {
                if (!this._equals(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    exports.TestLineToken = TestLineToken;
    class TestLineTokens {
        constructor(actual) {
            this._actual = actual;
        }
        equals(other) {
            if (other instanceof TestLineTokens) {
                return TestLineToken.equalsArr(this._actual, other._actual);
            }
            return false;
        }
        getCount() {
            return this._actual.length;
        }
        getForeground(tokenIndex) {
            return this._actual[tokenIndex].getForeground();
        }
        getEndOffset(tokenIndex) {
            return this._actual[tokenIndex].endIndex;
        }
        getClassName(tokenIndex) {
            return this._actual[tokenIndex].getType();
        }
        getInlineStyle(tokenIndex, colorMap) {
            return this._actual[tokenIndex].getInlineStyle(colorMap);
        }
        getPresentation(tokenIndex) {
            return this._actual[tokenIndex].getPresentation();
        }
        findTokenIndexAtOffset(offset) {
            throw new Error('Not implemented');
        }
        getLineContent() {
            throw new Error('Not implemented');
        }
        getMetadata(tokenIndex) {
            throw new Error('Method not implemented.');
        }
        getLanguageId(tokenIndex) {
            throw new Error('Method not implemented.');
        }
    }
    exports.TestLineTokens = TestLineTokens;
    class TestLineTokenFactory {
        static inflateArr(tokens) {
            const tokensCount = (tokens.length >>> 1);
            const result = new Array(tokensCount);
            for (let i = 0; i < tokensCount; i++) {
                const endOffset = tokens[i << 1];
                const metadata = tokens[(i << 1) + 1];
                result[i] = new TestLineToken(endOffset, metadata);
            }
            return result;
        }
    }
    exports.TestLineTokenFactory = TestLineTokenFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdExpbmVUb2tlbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9jb3JlL3Rlc3RMaW5lVG9rZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHOztPQUVHO0lBQ0gsTUFBYSxhQUFhO1FBUXpCLFlBQVksUUFBZ0IsRUFBRSxRQUFnQjtZQUM3QyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMzQixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHNDQUFhLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRU0sT0FBTztZQUNiLE9BQU8sc0NBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVNLGNBQWMsQ0FBQyxRQUFrQjtZQUN2QyxPQUFPLHNDQUFhLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRU0sZUFBZTtZQUNyQixPQUFPLHNDQUFhLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFTyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQWdCLEVBQUUsQ0FBZ0I7WUFDeEQsT0FBTyxDQUNOLENBQUMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLFFBQVE7bUJBQ3RCLENBQUMsQ0FBQyxTQUFTLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FDOUIsQ0FBQztRQUNILENBQUM7UUFFTSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQWtCLEVBQUUsQ0FBa0I7WUFDN0QsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZ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