/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/encodedTokenAttributes"], function (require, exports, encodedTokenAttributes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$k$b = exports.$j$b = exports.$i$b = void 0;
    /**
     * A token on a line.
     */
    class $i$b {
        constructor(endIndex, metadata) {
            this.endIndex = endIndex;
            this.c = metadata;
        }
        getForeground() {
            return encodedTokenAttributes_1.$Us.getForeground(this.c);
        }
        getType() {
            return encodedTokenAttributes_1.$Us.getClassNameFromMetadata(this.c);
        }
        getInlineStyle(colorMap) {
            return encodedTokenAttributes_1.$Us.getInlineStyleFromMetadata(this.c, colorMap);
        }
        getPresentation() {
            return encodedTokenAttributes_1.$Us.getPresentationFromMetadata(this.c);
        }
        static d(a, b) {
            return (a.endIndex === b.endIndex
                && a.c === b.c);
        }
        static equalsArr(a, b) {
            const aLen = a.length;
            const bLen = b.length;
            if (aLen !== bLen) {
                return false;
            }
            for (let i = 0; i < aLen; i++) {
                if (!this.d(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    exports.$i$b = $i$b;
    class $j$b {
        constructor(actual) {
            this.c = actual;
        }
        equals(other) {
            if (other instanceof $j$b) {
                return $i$b.equalsArr(this.c, other.c);
            }
            return false;
        }
        getCount() {
            return this.c.length;
        }
        getForeground(tokenIndex) {
            return this.c[tokenIndex].getForeground();
        }
        getEndOffset(tokenIndex) {
            return this.c[tokenIndex].endIndex;
        }
        getClassName(tokenIndex) {
            return this.c[tokenIndex].getType();
        }
        getInlineStyle(tokenIndex, colorMap) {
            return this.c[tokenIndex].getInlineStyle(colorMap);
        }
        getPresentation(tokenIndex) {
            return this.c[tokenIndex].getPresentation();
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
    exports.$j$b = $j$b;
    class $k$b {
        static inflateArr(tokens) {
            const tokensCount = (tokens.length >>> 1);
            const result = new Array(tokensCount);
            for (let i = 0; i < tokensCount; i++) {
                const endOffset = tokens[i << 1];
                const metadata = tokens[(i << 1) + 1];
                result[i] = new $i$b(endOffset, metadata);
            }
            return result;
        }
    }
    exports.$k$b = $k$b;
});
//# sourceMappingURL=testLineToken.js.map