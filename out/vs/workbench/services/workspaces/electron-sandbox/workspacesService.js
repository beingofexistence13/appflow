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
define(["require", "exports", "vs/platform/workspaces/common/workspaces", "vs/platform/ipc/common/mainProcessService", "vs/platform/instantiation/common/extensions", "vs/base/parts/ipc/common/ipc", "vs/platform/native/common/native"], function (require, exports, workspaces_1, mainProcessService_1, extensions_1, ipc_1, native_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeWorkspacesService = void 0;
    // @ts-ignore: interface is implemented via proxy
    let NativeWorkspacesService = class NativeWorkspacesService {
        constructor(mainProcessService, nativeHostService) {
            return ipc_1.ProxyChannel.toService(mainProcessService.getChannel('workspaces'), { context: nativeHostService.windowId });
        }
    };
    exports.NativeWorkspacesService = NativeWorkspacesService;
    exports.NativeWorkspacesService = NativeWorkspacesService = __decorate([
        __param(0, mainProcessService_1.IMainProcessService),
        __param(1, native_1.INativeHostService)
    ], NativeWorkspacesService);
    (0, extensions_1.registerSingleton)(workspaces_1.IWorkspacesService, NativeWorkspacesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya3NwYWNlcy9lbGVjdHJvbi1zYW5kYm94L3dvcmtzcGFjZXNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVFoRyxpREFBaUQ7SUFDMUMsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBdUI7UUFJbkMsWUFDc0Isa0JBQXVDLEVBQ3hDLGlCQUFxQztZQUV6RCxPQUFPLGtCQUFZLENBQUMsU0FBUyxDQUFxQixrQkFBa0IsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6SSxDQUFDO0tBQ0QsQ0FBQTtJQVZZLDBEQUF1QjtzQ0FBdkIsdUJBQXVCO1FBS2pDLFdBQUEsd0NBQW1CLENBQUE7UUFDbkIsV0FBQSwyQkFBa0IsQ0FBQTtPQU5SLHVCQUF1QixDQVVuQztJQUVELElBQUEsOEJBQWlCLEVBQUMsK0JBQWtCLEVBQUUsdUJBQXVCLG9DQUE0QixDQUFDIn0=