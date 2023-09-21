/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uuid", "vs/platform/log/common/log", "vs/platform/log/node/spdlogLog"], function (require, exports, uuid_1, log_1, spdlogLog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cN = void 0;
    class $cN extends log_1.$dj {
        s(resource, logLevel, options) {
            return new spdlogLog_1.$bN((0, uuid_1.$4f)(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
        }
    }
    exports.$cN = $cN;
});
//# sourceMappingURL=loggerService.js.map