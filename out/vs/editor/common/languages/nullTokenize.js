/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languages"], function (require, exports, languages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nullTokenizeEncoded = exports.nullTokenize = exports.NullState = void 0;
    exports.NullState = new class {
        clone() {
            return this;
        }
        equals(other) {
            return (this === other);
        }
    };
    function nullTokenize(languageId, state) {
        return new languages_1.TokenizationResult([new languages_1.Token(0, '', languageId)], state);
    }
    exports.nullTokenize = nullTokenize;
    function nullTokenizeEncoded(languageId, state) {
        const tokens = new Uint32Array(2);
        tokens[0] = 0;
        tokens[1] = ((languageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)
            | (0 /* StandardTokenType.Other */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)
            | (0 /* FontStyle.None */ << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
            | (1 /* ColorId.DefaultForeground */ << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
            | (2 /* ColorId.DefaultBackground */ << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0;
        return new languages_1.EncodedTokenizationResult(tokens, state === null ? exports.NullState : state);
    }
    exports.nullTokenizeEncoded = nullTokenizeEncoded;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVsbFRva2VuaXplLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9sYW5ndWFnZXMvbnVsbFRva2VuaXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtuRixRQUFBLFNBQVMsR0FBVyxJQUFJO1FBQzdCLEtBQUs7WUFDWCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFDTSxNQUFNLENBQUMsS0FBYTtZQUMxQixPQUFPLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLENBQUM7S0FDRCxDQUFDO0lBRUYsU0FBZ0IsWUFBWSxDQUFDLFVBQWtCLEVBQUUsS0FBYTtRQUM3RCxPQUFPLElBQUksOEJBQWtCLENBQUMsQ0FBQyxJQUFJLGlCQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFGRCxvQ0FFQztJQUVELFNBQWdCLG1CQUFtQixDQUFDLFVBQXNCLEVBQUUsS0FBb0I7UUFDL0UsTUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNkLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUNYLENBQUMsVUFBVSw0Q0FBb0MsQ0FBQztjQUM5QyxDQUFDLDJFQUEyRCxDQUFDO2NBQzdELENBQUMsbUVBQWtELENBQUM7Y0FDcEQsQ0FBQyw4RUFBNkQsQ0FBQztjQUMvRCxDQUFDLDhFQUE2RCxDQUFDLENBQ2pFLEtBQUssQ0FBQyxDQUFDO1FBRVIsT0FBTyxJQUFJLHFDQUF5QixDQUFDLE1BQU0sRUFBRSxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxpQkFBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRixDQUFDO0lBWkQsa0RBWUMifQ==