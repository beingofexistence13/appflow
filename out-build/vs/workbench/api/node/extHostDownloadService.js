/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/path", "os", "vs/base/common/uuid", "vs/workbench/api/common/extHostCommands", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/base/common/uri", "vs/workbench/api/common/extHostRpcService"], function (require, exports, path_1, os_1, uuid_1, extHostCommands_1, lifecycle_1, extHost_protocol_1, uri_1, extHostRpcService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mdc = void 0;
    let $Mdc = class $Mdc extends lifecycle_1.$kc {
        constructor(extHostRpc, commands) {
            super();
            const proxy = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadDownloadService);
            commands.registerCommand(false, '_workbench.downloadResource', async (resource) => {
                const location = uri_1.URI.file((0, path_1.$9d)((0, os_1.tmpdir)(), (0, uuid_1.$4f)()));
                await proxy.$download(resource, location);
                return location;
            });
        }
    };
    exports.$Mdc = $Mdc;
    exports.$Mdc = $Mdc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostCommands_1.$lM)
    ], $Mdc);
});
//# sourceMappingURL=extHostDownloadService.js.map