/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHostLoggerService", "vs/base/common/network", "vs/platform/log/node/spdlogLog", "vs/base/common/uuid"], function (require, exports, extHostLoggerService_1, network_1, spdlogLog_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zdc = void 0;
    class $Zdc extends extHostLoggerService_1.$bdc {
        s(resource, logLevel, options) {
            if (resource.scheme === network_1.Schemas.file) {
                /* Create the logger in the Extension Host process to prevent loggers (log, output channels...) traffic  over IPC */
                return new spdlogLog_1.$bN(options?.name || (0, uuid_1.$4f)(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
            }
            return super.s(resource, logLevel, options);
        }
        registerLogger(resource) {
            super.registerLogger(resource);
            this.r.$registerLogger(resource);
        }
        deregisterLogger(resource) {
            super.deregisterLogger(resource);
            this.r.$deregisterLogger(resource);
        }
    }
    exports.$Zdc = $Zdc;
});
//# sourceMappingURL=extHostLoggerService.js.map