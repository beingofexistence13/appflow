/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_fb = exports.JSONEditingErrorCode = exports.$$fb = void 0;
    exports.$$fb = (0, instantiation_1.$Bh)('jsonEditingService');
    var JSONEditingErrorCode;
    (function (JSONEditingErrorCode) {
        /**
         * Error when trying to write to a file that contains JSON errors.
         */
        JSONEditingErrorCode[JSONEditingErrorCode["ERROR_INVALID_FILE"] = 0] = "ERROR_INVALID_FILE";
    })(JSONEditingErrorCode || (exports.JSONEditingErrorCode = JSONEditingErrorCode = {}));
    class $_fb extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.$_fb = $_fb;
});
//# sourceMappingURL=jsonEditing.js.map