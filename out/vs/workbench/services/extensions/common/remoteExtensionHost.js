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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/platform/debug/common/extensionHostDebug", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteAgentConnection", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteSocketFactoryService", "vs/platform/sign/common/sign", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensionDevOptions", "vs/workbench/services/extensions/common/extensionHostProtocol"], function (require, exports, buffer_1, event_1, lifecycle_1, network_1, platform, extensionHostDebug_1, label_1, log_1, productService_1, remoteAgentConnection_1, remoteAuthorityResolver_1, remoteSocketFactoryService_1, sign_1, telemetry_1, telemetryUtils_1, workspace_1, environmentService_1, extensionDevOptions_1, extensionHostProtocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteExtensionHost = void 0;
    let RemoteExtensionHost = class RemoteExtensionHost extends lifecycle_1.Disposable {
        constructor(runningLocation, _initDataProvider, remoteSocketFactoryService, _contextService, _environmentService, _telemetryService, _logService, _loggerService, _labelService, remoteAuthorityResolverService, _extensionHostDebugService, _productService, _signService) {
            super();
            this.runningLocation = runningLocation;
            this._initDataProvider = _initDataProvider;
            this.remoteSocketFactoryService = remoteSocketFactoryService;
            this._contextService = _contextService;
            this._environmentService = _environmentService;
            this._telemetryService = _telemetryService;
            this._logService = _logService;
            this._loggerService = _loggerService;
            this._labelService = _labelService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this._extensionHostDebugService = _extensionHostDebugService;
            this._productService = _productService;
            this._signService = _signService;
            this.startup = 1 /* ExtensionHostStartup.EagerAutoStart */;
            this.extensions = null;
            this._onExit = this._register(new event_1.Emitter());
            this.onExit = this._onExit.event;
            this.remoteAuthority = this._initDataProvider.remoteAuthority;
            this._protocol = null;
            this._hasLostConnection = false;
            this._terminating = false;
            const devOpts = (0, extensionDevOptions_1.parseExtensionDevOptions)(this._environmentService);
            this._isExtensionDevHost = devOpts.isExtensionDevHost;
        }
        start() {
            const options = {
                commit: this._productService.commit,
                quality: this._productService.quality,
                addressProvider: {
                    getAddress: async () => {
                        const { authority } = await this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority);
                        return { connectTo: authority.connectTo, connectionToken: authority.connectionToken };
                    }
                },
                remoteSocketFactoryService: this.remoteSocketFactoryService,
                signService: this._signService,
                logService: this._logService,
                ipcLogger: null
            };
            return this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority).then((resolverResult) => {
                const startParams = {
                    language: platform.language,
                    debugId: this._environmentService.debugExtensionHost.debugId,
                    break: this._environmentService.debugExtensionHost.break,
                    port: this._environmentService.debugExtensionHost.port,
                    env: { ...this._environmentService.debugExtensionHost.env, ...resolverResult.options?.extensionHostEnv },
                };
                const extDevLocs = this._environmentService.extensionDevelopmentLocationURI;
                let debugOk = true;
                if (extDevLocs && extDevLocs.length > 0) {
                    // TODO@AW: handles only first path in array
                    if (extDevLocs[0].scheme === network_1.Schemas.file) {
                        debugOk = false;
                    }
                }
                if (!debugOk) {
                    startParams.break = false;
                }
                return (0, remoteAgentConnection_1.connectRemoteAgentExtensionHost)(options, startParams).then(result => {
                    this._register(result);
                    const { protocol, debugPort, reconnectionToken } = result;
                    const isExtensionDevelopmentDebug = typeof debugPort === 'number';
                    if (debugOk && this._environmentService.isExtensionDevelopment && this._environmentService.debugExtensionHost.debugId && debugPort) {
                        this._extensionHostDebugService.attachSession(this._environmentService.debugExtensionHost.debugId, debugPort, this._initDataProvider.remoteAuthority);
                    }
                    protocol.onDidDispose(() => {
                        this._onExtHostConnectionLost(reconnectionToken);
                    });
                    protocol.onSocketClose(() => {
                        if (this._isExtensionDevHost) {
                            this._onExtHostConnectionLost(reconnectionToken);
                        }
                    });
                    // 1) wait for the incoming `ready` event and send the initialization data.
                    // 2) wait for the incoming `initialized` event.
                    return new Promise((resolve, reject) => {
                        const handle = setTimeout(() => {
                            reject('The remote extension host took longer than 60s to send its ready message.');
                        }, 60 * 1000);
                        const disposable = protocol.onMessage(msg => {
                            if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 1 /* MessageType.Ready */)) {
                                // 1) Extension Host is ready to receive messages, initialize it
                                this._createExtHostInitData(isExtensionDevelopmentDebug).then(data => {
                                    protocol.send(buffer_1.VSBuffer.fromString(JSON.stringify(data)));
                                });
                                return;
                            }
                            if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 0 /* MessageType.Initialized */)) {
                                // 2) Extension Host is initialized
                                clearTimeout(handle);
                                // stop listening for messages here
                                disposable.dispose();
                                // release this promise
                                this._protocol = protocol;
                                resolve(protocol);
                                return;
                            }
                            console.error(`received unexpected message during handshake phase from the extension host: `, msg);
                        });
                    });
                });
            });
        }
        _onExtHostConnectionLost(reconnectionToken) {
            if (this._hasLostConnection) {
                // avoid re-entering this method
                return;
            }
            this._hasLostConnection = true;
            if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId) {
                this._extensionHostDebugService.close(this._environmentService.debugExtensionHost.debugId);
            }
            if (this._terminating) {
                // Expected termination path (we asked the process to terminate)
                return;
            }
            this._onExit.fire([0, reconnectionToken]);
        }
        async _createExtHostInitData(isExtensionDevelopmentDebug) {
            const remoteInitData = await this._initDataProvider.getInitData();
            this.extensions = remoteInitData.extensions;
            const workspace = this._contextService.getWorkspace();
            return {
                commit: this._productService.commit,
                version: this._productService.version,
                quality: this._productService.quality,
                parentPid: remoteInitData.pid,
                environment: {
                    isExtensionDevelopmentDebug,
                    appRoot: remoteInitData.appRoot,
                    appName: this._productService.nameLong,
                    appHost: this._productService.embedderIdentifier || 'desktop',
                    appUriScheme: this._productService.urlProtocol,
                    extensionTelemetryLogResource: this._environmentService.extHostTelemetryLogFile,
                    isExtensionTelemetryLoggingOnly: (0, telemetryUtils_1.isLoggingOnly)(this._productService, this._environmentService),
                    appLanguage: platform.language,
                    extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                    extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                    globalStorageHome: remoteInitData.globalStorageHome,
                    workspaceStorageHome: remoteInitData.workspaceStorageHome,
                    extensionLogLevel: this._environmentService.extensionLogLevel
                },
                workspace: this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? null : {
                    configuration: workspace.configuration,
                    id: workspace.id,
                    name: this._labelService.getWorkspaceLabel(workspace),
                    transient: workspace.transient
                },
                remote: {
                    isRemote: true,
                    authority: this._initDataProvider.remoteAuthority,
                    connectionData: remoteInitData.connectionData
                },
                consoleForward: {
                    includeStack: false,
                    logNative: Boolean(this._environmentService.debugExtensionHost.debugId)
                },
                extensions: this.extensions.toSnapshot(),
                telemetryInfo: {
                    sessionId: this._telemetryService.sessionId,
                    machineId: this._telemetryService.machineId,
                    firstSessionDate: this._telemetryService.firstSessionDate,
                    msftInternal: this._telemetryService.msftInternal
                },
                logLevel: this._logService.getLevel(),
                loggers: [...this._loggerService.getRegisteredLoggers()],
                logsLocation: remoteInitData.extensionHostLogsPath,
                autoStart: (this.startup === 1 /* ExtensionHostStartup.EagerAutoStart */),
                uiKind: platform.isWeb ? extensionHostProtocol_1.UIKind.Web : extensionHostProtocol_1.UIKind.Desktop
            };
        }
        getInspectPort() {
            return undefined;
        }
        enableInspectPort() {
            return Promise.resolve(false);
        }
        dispose() {
            super.dispose();
            this._terminating = true;
            if (this._protocol) {
                // Send the extension host a request to terminate itself
                // (graceful termination)
                // setTimeout(() => {
                // console.log(`SENDING TERMINATE TO REMOTE EXT HOST!`);
                const socket = this._protocol.getSocket();
                this._protocol.send((0, extensionHostProtocol_1.createMessageOfType)(2 /* MessageType.Terminate */));
                this._protocol.sendDisconnect();
                this._protocol.dispose();
                // this._protocol.drain();
                socket.end();
                this._protocol = null;
                // }, 1000);
            }
        }
    };
    exports.RemoteExtensionHost = RemoteExtensionHost;
    exports.RemoteExtensionHost = RemoteExtensionHost = __decorate([
        __param(2, remoteSocketFactoryService_1.IRemoteSocketFactoryService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, log_1.ILogService),
        __param(7, log_1.ILoggerService),
        __param(8, label_1.ILabelService),
        __param(9, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(10, extensionHostDebug_1.IExtensionHostDebugService),
        __param(11, productService_1.IProductService),
        __param(12, sign_1.ISignService)
    ], RemoteExtensionHost);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXh0ZW5zaW9uSG9zdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi9yZW1vdGVFeHRlbnNpb25Ib3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBDekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTtRQWNsRCxZQUNpQixlQUFzQyxFQUNyQyxpQkFBbUQsRUFDdkMsMEJBQXdFLEVBQzNFLGVBQTBELEVBQ3RELG1CQUFrRSxFQUM3RSxpQkFBcUQsRUFDM0QsV0FBeUMsRUFDdEMsY0FBaUQsRUFDbEQsYUFBNkMsRUFDM0IsOEJBQWdGLEVBQ3JGLDBCQUF1RSxFQUNsRixlQUFpRCxFQUNwRCxZQUEyQztZQUV6RCxLQUFLLEVBQUUsQ0FBQztZQWRRLG9CQUFlLEdBQWYsZUFBZSxDQUF1QjtZQUNyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtDO1lBQ3RCLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDMUQsb0JBQWUsR0FBZixlQUFlLENBQTBCO1lBQ3JDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBOEI7WUFDNUQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUMxQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNuQixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDakMsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDVixtQ0FBOEIsR0FBOUIsOEJBQThCLENBQWlDO1lBQ3BFLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNEI7WUFDakUsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ25DLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBeEIxQyxZQUFPLCtDQUF1QztZQUN2RCxlQUFVLEdBQW1DLElBQUksQ0FBQztZQUVqRCxZQUFPLEdBQXFD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