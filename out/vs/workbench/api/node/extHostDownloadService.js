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
    exports.ExtHostDownloadService = void 0;
    let ExtHostDownloadService = class ExtHostDownloadService extends lifecycle_1.Disposable {
        constructor(extHostRpc, commands) {
            super();
            const proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadDownloadService);
            commands.registerCommand(false, '_workbench.downloadResource', async (resource) => {
                const location = uri_1.URI.file((0, path_1.join)((0, os_1.tmpdir)(), (0, uuid_1.generateUuid)()));
                await proxy.$download(resource, location);
                return location;
            });
        }
    };
    exports.ExtHostDownloadService = ExtHostDownloadService;
    exports.ExtHostDownloadService = ExtHostDownloadService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostCommands_1.IExtHostCommands)
    ], ExtHostDownloadService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERvd25sb2FkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvbm9kZS9leHRIb3N0RG93bmxvYWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVd6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHNCQUFVO1FBRXJELFlBQ3FCLFVBQThCLEVBQ2hDLFFBQTBCO1lBRTVDLEtBQUssRUFBRSxDQUFDO1lBRVIsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFFekUsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsNkJBQTZCLEVBQUUsS0FBSyxFQUFFLFFBQWEsRUFBZ0IsRUFBRTtnQkFDcEcsTUFBTSxRQUFRLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFBLFdBQUksRUFBQyxJQUFBLFdBQU0sR0FBRSxFQUFFLElBQUEsbUJBQVksR0FBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDMUMsT0FBTyxRQUFRLENBQUM7WUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0QsQ0FBQTtJQWhCWSx3REFBc0I7cUNBQXRCLHNCQUFzQjtRQUdoQyxXQUFBLHNDQUFrQixDQUFBO1FBQ2xCLFdBQUEsa0NBQWdCLENBQUE7T0FKTixzQkFBc0IsQ0FnQmxDIn0=