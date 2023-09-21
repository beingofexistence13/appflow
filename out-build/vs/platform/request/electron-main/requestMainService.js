/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/platform/request/node/requestService"], function (require, exports, electron_1, requestService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$j7b = void 0;
    function getRawRequest(options) {
        return electron_1.net.request;
    }
    class $j7b extends requestService_1.$Oq {
        request(options, token) {
            return super.request({ ...(options || {}), getRawRequest, isChromiumNetwork: true }, token);
        }
    }
    exports.$j7b = $j7b;
});
//# sourceMappingURL=requestMainService.js.map