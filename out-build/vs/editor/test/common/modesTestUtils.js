/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/tokens/lineTokens", "vs/editor/common/languages/supports", "vs/editor/common/services/languagesRegistry"], function (require, exports, lineTokens_1, supports_1, languagesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$h$b = void 0;
    function $h$b(rawTokens) {
        const tokens = new Uint32Array(rawTokens.length << 1);
        let line = '';
        for (let i = 0, len = rawTokens.length; i < len; i++) {
            const rawToken = rawTokens[i];
            const startOffset = line.length;
            const metadata = ((rawToken.type << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)) >>> 0;
            tokens[(i << 1)] = startOffset;
            tokens[(i << 1) + 1] = metadata;
            line += rawToken.text;
        }
        lineTokens_1.$Xs.convertToEndOffset(tokens, line.length);
        return (0, supports_1.$dt)(new lineTokens_1.$Xs(tokens, line, new languagesRegistry_1.$hmb()), 0);
    }
    exports.$h$b = $h$b;
});
//# sourceMappingURL=modesTestUtils.js.map