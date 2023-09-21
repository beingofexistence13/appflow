/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JSONEditingError = exports.JSONEditingErrorCode = exports.IJSONEditingService = void 0;
    exports.IJSONEditingService = (0, instantiation_1.createDecorator)('jsonEditingService');
    var JSONEditingErrorCode;
    (function (JSONEditingErrorCode) {
        /**
         * Error when trying to write to a file that contains JSON errors.
         */
        JSONEditingErrorCode[JSONEditingErrorCode["ERROR_INVALID_FILE"] = 0] = "ERROR_INVALID_FILE";
    })(JSONEditingErrorCode || (exports.JSONEditingErrorCode = JSONEditingErrorCode = {}));
    class JSONEditingError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.JSONEditingError = JSONEditingError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkVkaXRpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvY29uZmlndXJhdGlvbi9jb21tb24vanNvbkVkaXRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTW5GLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSwrQkFBZSxFQUFzQixvQkFBb0IsQ0FBQyxDQUFDO0lBRTlGLElBQWtCLG9CQU1qQjtJQU5ELFdBQWtCLG9CQUFvQjtRQUVyQzs7V0FFRztRQUNILDJGQUFrQixDQUFBO0lBQ25CLENBQUMsRUFOaUIsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFNckM7SUFFRCxNQUFhLGdCQUFpQixTQUFRLEtBQUs7UUFDMUMsWUFBWSxPQUFlLEVBQVMsSUFBMEI7WUFDN0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQXNCO1FBRTlELENBQUM7S0FDRDtJQUpELDRDQUlDIn0=