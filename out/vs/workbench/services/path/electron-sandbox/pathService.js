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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/path/common/pathService", "vs/platform/workspace/common/workspace"], function (require, exports, extensions_1, remoteAgentService_1, environmentService_1, pathService_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativePathService = void 0;
    let NativePathService = class NativePathService extends pathService_1.AbstractPathService {
        constructor(remoteAgentService, environmentService, contextService) {
            super(environmentService.userHome, remoteAgentService, environmentService, contextService);
        }
    };
    exports.NativePathService = NativePathService;
    exports.NativePathService = NativePathService = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(2, workspace_1.IWorkspaceContextService)
    ], NativePathService);
    (0, extensions_1.registerSingleton)(pathService_1.IPathService, NativePathService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcGF0aC9lbGVjdHJvbi1zYW5kYm94L3BhdGhTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVF6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLGlDQUFtQjtRQUV6RCxZQUNzQixrQkFBdUMsRUFDeEIsa0JBQXNELEVBQ2hFLGNBQXdDO1lBRWxFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDNUYsQ0FBQztLQUNELENBQUE7SUFUWSw4Q0FBaUI7Z0NBQWpCLGlCQUFpQjtRQUczQixXQUFBLHdDQUFtQixDQUFBO1FBQ25CLFdBQUEsdURBQWtDLENBQUE7UUFDbEMsV0FBQSxvQ0FBd0IsQ0FBQTtPQUxkLGlCQUFpQixDQVM3QjtJQUVELElBQUEsOEJBQWlCLEVBQUMsMEJBQVksRUFBRSxpQkFBaUIsb0NBQTRCLENBQUMifQ==