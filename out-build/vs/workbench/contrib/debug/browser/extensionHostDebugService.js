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
    let BrowserExtensionHostDebugService = class BrowserExtensionHostDebugService extends extensionHostDebugIpc_1.$Cn {
        static { BrowserExtensionHostDebugService_1 = this; }
        static { this.c = 'debug.lastExtensionDevelopmentWorkspace'; }
        constructor(remoteAgentService, environmentService, logService, hostService, contextService, storageService, fileService) {
            const connection = remoteAgentService.getConnection();
            let channel;
            if (connection) {
                channel = connection.getChannel(extensionHostDebugIpc_1.$Bn.ChannelName);
            }
            else {
                // Extension host debugging not supported in serverless.
                channel = { call: async () => undefined, listen: () => event_1.Event.None };
            }
            super(channel);
            this.g = storageService;
            this.h = fileService;
            if (environmentService.options && environmentService.options.workspaceProvider) {
                this.f = environmentService.options.workspaceProvider;
            }
            else {
                this.f = { open: async () => true, workspace: undefined, trusted: undefined };
                logService.warn('Extension Host Debugging not available due to missing workspace provider.');
            }
            // Reload window on reload request
            this.B(this.onReload(event => {
                if (environmentService.isExtensionDevelopment && environmentService.debugExtensionHost.debugId === event.sessionId) {
                    hostService.reload();
                }
            }));
            // Close window on close request
            this.B(this.onClose(event => {
                if (environmentService.isExtensionDevelopment && environmentService.debugExtensionHost.debugId === event.sessionId) {
                    hostService.close();
                }
            }));
            // Remember workspace as last used for extension development
            // (unless this is API tests) to restore for a future session
            if (environmentService.isExtensionDevelopment && !environmentService.extensionTestsLocationURI) {
                const workspaceId = (0, workspace_1.$Ph)(contextService.getWorkspace());
                if ((0, workspace_1.$Lh)(workspaceId) || (0, workspace_1.$Qh)(workspaceId)) {
                    const serializedWorkspace = (0, workspace_1.$Lh)(workspaceId) ? { folderUri: workspaceId.uri.toJSON() } : { workspaceUri: workspaceId.configPath.toJSON() };
                    storageService.store(BrowserExtensionHostDebugService_1.c, JSON.stringify(serializedWorkspace), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                }
                else {
                    storageService.remove(BrowserExtensionHostDebugService_1.c, 0 /* StorageScope.PROFILE */);
                }
            }
        }
        async openExtensionDevelopmentHostWindow(args, _debugRenderer) {
            // Add environment parameters required for debug to work
            const environment = new Map();
            const fileUriArg = this.j('file-uri', args);
            if (fileUriArg && !(0, workspace_1.$7h)(fileUriArg)) {
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
                const value = this.j(argName, args);
                if (value) {
                    environment.set(argName, value);
                }
            }
            // Find out which workspace to open debug window on
            let debugWorkspace = undefined;
            const folderUriArg = this.j('folder-uri', args);
            if (folderUriArg) {
                debugWorkspace = { folderUri: uri_1.URI.parse(folderUriArg) };
            }
            else {
                const fileUriArg = this.j('file-uri', args);
                if (fileUriArg && (0, workspace_1.$7h)(fileUriArg)) {
                    debugWorkspace = { workspaceUri: uri_1.URI.parse(fileUriArg) };
                }
            }
            const extensionTestsPath = this.j('extensionTestsPath', args);
            if (!debugWorkspace && !extensionTestsPath) {
                const lastExtensionDevelopmentWorkspace = this.g.get(BrowserExtensionHostDebugService_1.c, 0 /* StorageScope.PROFILE */);
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
                const debugWorkspaceResource = (0, window_1.$RD)(debugWorkspace) ? debugWorkspace.folderUri : (0, window_1.$QD)(debugWorkspace) ? debugWorkspace.workspaceUri : undefined;
                if (debugWorkspaceResource) {
                    const workspaceExists = await this.h.exists(debugWorkspaceResource);
                    if (!workspaceExists) {
                        debugWorkspace = undefined;
                    }
                }
            }
            // Open debug window as new window. Pass arguments over.
            const success = await this.f.open(debugWorkspace, {
                reuse: false,
                payload: Array.from(environment.entries()) // mandatory properties to enable debugging
            });
            return { success };
        }
        j(key, args) {
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
        __param(0, remoteAgentService_1.$jm),
        __param(1, environmentService_1.$LT),
        __param(2, log_1.$5i),
        __param(3, host_1.$VT),
        __param(4, workspace_1.$Kh),
        __param(5, storage_1.$Vo),
        __param(6, files_1.$6j)
    ], BrowserExtensionHostDebugService);
    (0, extensions_1.$mr)(extensionHostDebug_1.$An, BrowserExtensionHostDebugService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionHostDebugService.js.map