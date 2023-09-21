/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ft = exports.$et = exports.$dt = void 0;
    function $dt(context, offset) {
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
        return new $et(context, desiredLanguageId, firstTokenIndex, lastTokenIndex + 1, context.getStartOffset(firstTokenIndex), context.getEndOffset(lastTokenIndex));
    }
    exports.$dt = $dt;
    class $et {
        constructor(actual, languageId, firstTokenIndex, lastTokenIndex, firstCharOffset, lastCharOffset) {
            this._scopedLineTokensBrand = undefined;
            this.a = actual;
            this.languageId = languageId;
            this.b = firstTokenIndex;
            this.c = lastTokenIndex;
            this.firstCharOffset = firstCharOffset;
            this.d = lastCharOffset;
        }
        getLineContent() {
            const actualLineContent = this.a.getLineContent();
            return actualLineContent.substring(this.firstCharOffset, this.d);
        }
        getActualLineContentBefore(offset) {
            const actualLineContent = this.a.getLineContent();
            return actualLineContent.substring(0, this.firstCharOffset + offset);
        }
        getTokenCount() {
            return this.c - this.b;
        }
        findTokenIndexAtOffset(offset) {
            return this.a.findTokenIndexAtOffset(offset + this.firstCharOffset) - this.b;
        }
        getStandardTokenType(tokenIndex) {
            return this.a.getStandardTokenType(tokenIndex + this.b);
        }
    }
    exports.$et = $et;
    var IgnoreBracketsInTokens;
    (function (IgnoreBracketsInTokens) {
        IgnoreBracketsInTokens[IgnoreBracketsInTokens["value"] = 3] = "value";
    })(IgnoreBracketsInTokens || (IgnoreBracketsInTokens = {}));
    function $ft(standardTokenType) {
        return (standardTokenType & 3 /* IgnoreBracketsInTokens.value */) !== 0;
    }
    exports.$ft = $ft;
});
//# sourceMappingURL=supports.js.map