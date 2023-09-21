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
define(["require", "exports", "vs/base/common/event", "vs/base/common/uri", "vs/platform/debug/common/extensionHostDebug", "vs/platform/debug/common/extensionHostDebugIpc", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/window/common/window", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/host/browser/host", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, event_1, uri_1, extensionHostDebug_1, extensionHostDebugIpc_1, files_1, extensions_1, log_1, storage_1, window_1, workspace_1, environmentService_1, host_1, remoteAgentService_1) {
    "use strict";
    var BrowserExtensionHostDebugService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let BrowserExtensionHostDebugService = class BrowserExtensionHostDebugService extends extensionHostDebugIpc_1.ExtensionHostDebugChannelClient {
        static { BrowserExtensionHostDebugService_1 = this; }
        static { this.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY = 'debug.lastExtensionDevelopmentWorkspace'; }
        constructor(remoteAgentService, environmentService, logService, hostService, contextService, storageService, fileService) {
            const connection = remoteAgentService.getConnection();
            let channel;
            if (connection) {
                channel = connection.getChannel(extensionHostDebugIpc_1.ExtensionHostDebugBroadcastChannel.ChannelName);
            }
            else {
                // Extension host debugging not supported in serverless.
                channel = { call: async () => undefined, listen: () => event_1.Event.None };
            }
            super(channel);
            this.storageService = storageService;
            this.fileService = fileService;
            if (environmentService.options && environmentService.options.workspaceProvider) {
                this.workspaceProvider = environmentService.options.workspaceProvider;
            }
            else {
                this.workspaceProvider = { open: async () => true, workspace: undefined, trusted: undefined };
                logService.warn('Extension Host Debugging not available due to missing workspace provider.');
            }
            // Reload window on reload request
            this._register(this.onReload(event => {
                if (environmentService.isExtensionDevelopment && environmentService.debugExtensionHost.debugId === event.sessionId) {
                    hostService.reload();
                }
            }));
            // Close window on close request
            this._register(this.onClose(event => {
                if (environmentService.isExtensionDevelopment && environmentService.debugExtensionHost.debugId === event.sessionId) {
                    hostService.close();
                }
            }));
            // Remember workspace as last used for extension development
            // (unless this is API tests) to restore for a future session
            if (environmentService.isExtensionDevelopment && !environmentService.extensionTestsLocationURI) {
                const workspaceId = (0, workspace_1.toWorkspaceIdentifier)(contextService.getWorkspace());
                if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceId) || (0, workspace_1.isWorkspaceIdentifier)(workspaceId)) {
                    const serializedWorkspace = (0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceId) ? { folderUri: workspaceId.uri.toJSON() } : { workspaceUri: workspaceId.configPath.toJSON() };
                    storageService.store(BrowserExtensionHostDebugService_1.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY, JSON.stringify(serializedWorkspace), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                }
                else {
                    storageService.remove(BrowserExtensionHostDebugService_1.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY, 0 /* StorageScope.PROFILE */);
                }
            }
        }
        async openExtensionDevelopmentHostWindow(args, _debugRenderer) {
            // Add environment parameters required for debug to work
            const environment = new Map();
            const fileUriArg = this.findArgument('file-uri', args);
            if (fileUriArg && !(0, workspace_1.hasWorkspaceFileExtension)(fileUriArg)) {
                environment.set('openFile', fileUriArg);
            }
            const copyArgs = [
                'extensionDevelopmentPath',
                'extensionTestsPath',
                'extensionEnvironment',
                'debugId',
                'inspect-brk-extensions',
                'inspect-extensions',
            ];
            for (const argName of copyArgs) {
                const value = this.findArgument(argName, args);
                if (value) {
                    environment.set(argName, value);
                }
            }
            // Find out which workspace to open debug window on
            let debugWorkspace = undefined;
            const folderUriArg = this.findArgument('folder-uri', args);
            if (folderUriArg) {
                debugWorkspace = { folderUri: uri_1.URI.parse(folderUriArg) };
            }
            else {
                const fileUriArg = this.findArgument('file-uri', args);
                if (fileUriArg && (0, workspace_1.hasWorkspaceFileExtension)(fileUriArg)) {
                    debugWorkspace = { workspaceUri: uri_1.URI.parse(fileUriArg) };
                }
            }
            const extensionTestsPath = this.findArgument('extensionTestsPath', args);
            if (!debugWorkspace && !extensionTestsPath) {
                const lastExtensionDevelopmentWorkspace = this.storageService.get(BrowserExtensionHostDebugService_1.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY, 0 /* StorageScope.PROFILE */);
                if (lastExtensionDevelopmentWorkspace) {
                    try {
                        const serializedWorkspace = JSON.parse(lastExtensionDevelopmentWorkspace);
                        if (serializedWorkspace.workspaceUri) {
                            debugWorkspace = { workspaceUri: uri_1.URI.revive(serializedWorkspace.workspaceUri) };
                        }
                        else if (serializedWorkspace.folderUri) {
                            debugWorkspace = { folderUri: uri_1.URI.revive(serializedWorkspace.folderUri) };
                        }
                    }
                    catch (error) {
                        // ignore
                    }
                }
            }
            // Validate workspace exists
            if (debugWorkspace) {
                const debugWorkspaceResource = (0, window_1.isFolderToOpen)(debugWorkspace) ? debugWorkspace.folderUri : (0, window_1.isWorkspaceToOpen)(debugWorkspace) ? debugWorkspace.workspaceUri : undefined;
                if (debugWorkspaceResource) {
                    const workspaceExists = await this.fileService.exists(debugWorkspaceResource);
                    if (!workspaceExists) {
                        debugWorkspace = undefined;
                    }
                }
            }
            // Open debug window as new window. Pass arguments over.
            const success = await this.workspaceProvider.open(debugWorkspace, {
                reuse: false,
                payload: Array.from(environment.entries()) // mandatory properties to enable debugging
            });
            return { success };
        }
        findArgument(key, args) {
            for (const a of args) {
                const k = `--${key}=`;
                if (a.indexOf(k) === 0) {
                    return a.substring(k.length);
                }
            }
            return undefined;
        }
    };
    BrowserExtensionHostDebugService = BrowserExtensionHostDebugService_1 = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(2, log_1.ILogService),
        __param(3, host_1.IHostService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, storage_1.IStorageService),
        __param(6, files_1.IFileService)
    ], BrowserExtensionHostDebugService);
    (0, extensions_1.registerSingleton)(extensionHostDebug_1.IExtensionHostDebugService, BrowserExtensionHostDebugService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdERlYnVnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvZXh0ZW5zaW9uSG9zdERlYnVnU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQmhHLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWlDLFNBQVEsdURBQStCOztpQkFFckQsNkNBQXdDLEdBQUcseUNBQXlDLEFBQTVDLENBQTZDO1FBTzdHLFlBQ3NCLGtCQUF1QyxFQUN2QixrQkFBdUQsRUFDL0UsVUFBdUIsRUFDdEIsV0FBeUIsRUFDYixjQUF3QyxFQUNqRCxjQUErQixFQUNsQyxXQUF5QjtZQUV2QyxNQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0RCxJQUFJLE9BQWlCLENBQUM7WUFDdEIsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsMERBQWtDLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDaEY7aUJBQU07Z0JBQ04sd0RBQXdEO2dCQUN4RCxPQUFPLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQUssQ0FBQyxJQUFJLEVBQVMsQ0FBQzthQUMzRTtZQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVmLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBRS9CLElBQUksa0JBQWtCLENBQUMsT0FBTyxJQUFJLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtnQkFDL0UsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGtC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