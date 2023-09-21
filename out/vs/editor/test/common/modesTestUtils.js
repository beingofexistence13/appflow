/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/tokens/lineTokens", "vs/editor/common/languages/supports", "vs/editor/common/services/languagesRegistry"], function (require, exports, lineTokens_1, supports_1, languagesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createFakeScopedLineTokens = void 0;
    function createFakeScopedLineTokens(rawTokens) {
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
        lineTokens_1.LineTokens.convertToEndOffset(tokens, line.length);
        return (0, supports_1.createScopedLineTokens)(new lineTokens_1.LineTokens(tokens, line, new languagesRegistry_1.LanguageIdCodec()), 0);
    }
    exports.createFakeScopedLineTokens = createFakeScopedLineTokens;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZXNUZXN0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZXNUZXN0VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLFNBQWdCLDBCQUEwQixDQUFDLFNBQXNCO1FBQ2hFLE1BQU0sTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdEQsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyRCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFOUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxNQUFNLFFBQVEsR0FBRyxDQUNoQixDQUFDLFFBQVEsQ0FBQyxJQUFJLDRDQUFvQyxDQUFDLENBQ25ELEtBQUssQ0FBQyxDQUFDO1lBRVIsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7WUFDaEMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUM7U0FDdEI7UUFFRCx1QkFBVSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFBLGlDQUFzQixFQUFDLElBQUksdUJBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksbUNBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQW5CRCxnRUFtQkMifQ==