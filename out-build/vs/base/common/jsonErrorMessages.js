/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/base/common/jsonErrorMessages"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mp = void 0;
    function $mp(errorCode) {
        switch (errorCode) {
            case 1 /* ParseErrorCode.InvalidSymbol */: return (0, nls_1.localize)(0, null);
            case 2 /* ParseErrorCode.InvalidNumberFormat */: return (0, nls_1.localize)(1, null);
            case 3 /* ParseErrorCode.PropertyNameExpected */: return (0, nls_1.localize)(2, null);
            case 4 /* ParseErrorCode.ValueExpected */: return (0, nls_1.localize)(3, null);
            case 5 /* ParseErrorCode.ColonExpected */: return (0, nls_1.localize)(4, null);
            case 6 /* ParseErrorCode.CommaExpected */: return (0, nls_1.localize)(5, null);
            case 7 /* ParseErrorCode.CloseBraceExpected */: return (0, nls_1.localize)(6, null);
            case 8 /* ParseErrorCode.CloseBracketExpected */: return (0, nls_1.localize)(7, null);
            case 9 /* ParseErrorCode.EndOfFileExpected */: return (0, nls_1.localize)(8, null);
            default:
                return '';
        }
    }
    exports.$mp = $mp;
});
//# sourceMappingURL=jsonErrorMessages.js.map