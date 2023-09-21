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
    exports.$U3b = void 0;
    let $U3b = class $U3b extends lifecycle_1.$kc {
        constructor(runningLocation, h, j, m, n, r, s, t, u, w, y, z, C) {
            super();
            this.runningLocation = runningLocation;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.startup = 1 /* ExtensionHostStartup.EagerAutoStart */;
            this.extensions = null;
            this.a = this.B(new event_1.$fd());
            this.onExit = this.a.event;
            this.remoteAuthority = this.h.remoteAuthority;
            this.b = null;
            this.c = false;
            this.f = false;
            const devOpts = (0, extensionDevOptions_1.$Ccb)(this.n);
            this.g = devOpts.isExtensionDevHost;
        }
        start() {
            const options = {
                commit: this.z.commit,
                quality: this.z.quality,
                addressProvider: {
                    getAddress: async () => {
                        const { authority } = await this.w.resolveAuthority(this.h.remoteAuthority);
                        return { connectTo: authority.connectTo, connectionToken: authority.connectionToken };
                    }
                },
                remoteSocketFactoryService: this.j,
                signService: this.C,
                logService: this.s,
                ipcLogger: null
            };
            return this.w.resolveAuthority(this.h.remoteAuthority).then((resolverResult) => {
                const startParams = {
                    language: platform.$v,
                    debugId: this.n.debugExtensionHost.debugId,
                    break: this.n.debugExtensionHost.break,
                    port: this.n.debugExtensionHost.port,
                    env: { ...this.n.debugExtensionHost.env, ...resolverResult.options?.extensionHostEnv },
                };
                const extDevLocs = this.n.extensionDevelopmentLocationURI;
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
                return (0, remoteAgentConnection_1.$Yk)(options, startParams).then(result => {
                    this.B(result);
                    const { protocol, debugPort, reconnectionToken } = result;
                    const isExtensionDevelopmentDebug = typeof debugPort === 'number';
                    if (debugOk && this.n.isExtensionDevelopment && this.n.debugExtensionHost.debugId && debugPort) {
                        this.y.attachSession(this.n.debugExtensionHost.debugId, debugPort, this.h.remoteAuthority);
                    }
                    protocol.onDidDispose(() => {
                        this.D(reconnectionToken);
                    });
                    protocol.onSocketClose(() => {
                        if (this.g) {
                            this.D(reconnectionToken);
                        }
                    });
                    // 1) wait for the incoming `ready` event and send the initialization data.
                    // 2) wait for the incoming `initialized` event.
                    return new Promise((resolve, reject) => {
                        const handle = setTimeout(() => {
                            reject('The remote extension host took longer than 60s to send its ready message.');
                        }, 60 * 1000);
                        const disposable = protocol.onMessage(msg => {
                            if ((0, extensionHostProtocol_1.$5l)(msg, 1 /* MessageType.Ready */)) {
                                // 1) Extension Host is ready to receive messages, initialize it
                                this.F(isExtensionDevelopmentDebug).then(data => {
                                    protocol.send(buffer_1.$Fd.fromString(JSON.stringify(data)));
                                });
                                return;
                            }
                            if ((0, extensionHostProtocol_1.$5l)(msg, 0 /* MessageType.Initialized */)) {
                                // 2) Extension Host is initialized
                                clearTimeout(handle);
                                // stop listening for messages here
                                disposable.dispose();
                                // release this promise
                                this.b = protocol;
                                resolve(protocol);
                                return;
                            }
                            console.error(`received unexpected message during handshake phase from the extension host: `, msg);
                        });
                    });
                });
            });
        }
        D(reconnectionToken) {
            if (this.c) {
                // avoid re-entering this method
                return;
            }
            this.c = true;
            if (this.g && this.n.debugExtensionHost.debugId) {
                this.y.close(this.n.debugExtensionHost.debugId);
            }
            if (this.f) {
                // Expected termination path (we asked the process to terminate)
                return;
            }
            this.a.fire([0, reconnectionToken]);
        }
        async F(isExtensionDevelopmentDebug) {
            const remoteInitData = await this.h.getInitData();
            this.extensions = remoteInitData.extensions;
            const workspace = this.m.getWorkspace();
            return {
                commit: this.z.commit,
                version: this.z.version,
                quality: this.z.quality,
                parentPid: remoteInitData.pid,
                environment: {
                    isExtensionDevelopmentDebug,
                    appRoot: remoteInitData.appRoot,
                    appName: this.z.nameLong,
                    appHost: this.z.embedderIdentifier || 'desktop',
                    appUriScheme: this.z.urlProtocol,
                    extensionTelemetryLogResource: this.n.extHostTelemetryLogFile,
                    isExtensionTelemetryLoggingOnly: (0, telemetryUtils_1.$io)(this.z, this.n),
                    appLanguage: platform.$v,
                    extensionDevelopmentLocationURI: this.n.extensionDevelopmentLocationURI,
                    extensionTestsLocationURI: this.n.extensionTestsLocationURI,
                    globalStorageHome: remoteInitData.globalStorageHome,
                    workspaceStorageHome: remoteInitData.workspaceStorageHome,
                    extensionLogLevel: this.n.extensionLogLevel
                },
                workspace: this.m.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? null : {
                    configuration: workspace.configuration,
                    id: workspace.id,
                    name: this.u.getWorkspaceLabel(workspace),
                    transient: workspace.transient
                },
                remote: {
                    isRemote: true,
                    authority: this.h.remoteAuthority,
                    connectionData: remoteInitData.connectionData
                },
                consoleForward: {
                    includeStack: false,
                    logNative: Boolean(this.n.debugExtensionHost.debugId)
                },
                extensions: this.extensions.toSnapshot(),
                telemetryInfo: {
                    sessionId: this.r.sessionId,
                    machineId: this.r.machineId,
                    firstSessionDate: this.r.firstSessionDate,
                    msftInternal: this.r.msftInternal
                },
                logLevel: this.s.getLevel(),
                loggers: [...this.t.getRegisteredLoggers()],
                logsLocation: remoteInitData.extensionHostLogsPath,
                autoStart: (this.startup === 1 /* ExtensionHostStartup.EagerAutoStart */),
                uiKind: platform.$o ? extensionHostProtocol_1.UIKind.Web : extensionHostProtocol_1.UIKind.Desktop
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
            this.f = true;
            if (this.b) {
                // Send the extension host a request to terminate itself
                // (graceful termination)
                // setTimeout(() => {
                // console.log(`SENDING TERMINATE TO REMOTE EXT HOST!`);
                const socket = this.b.getSocket();
                this.b.send((0, extensionHostProtocol_1.$4l)(2 /* MessageType.Terminate */));
                this.b.sendDisconnect();
                this.b.dispose();
                // this._protocol.drain();
                socket.end();
                this.b = null;
                // }, 1000);
            }
        }
    };
    exports.$U3b = $U3b;
    exports.$U3b = $U3b = __decorate([
        __param(2, remoteSocketFactoryService_1.$Tk),
        __param(3, workspace_1.$Kh),
        __param(4, environmentService_1.$hJ),
        __param(5, telemetry_1.$9k),
        __param(6, log_1.$5i),
        __param(7, log_1.$6i),
        __param(8, label_1.$Vz),
        __param(9, remoteAuthorityResolver_1.$Jk),
        __param(10, extensionHostDebug_1.$An),
        __param(11, productService_1.$kj),
        __param(12, sign_1.$Wk)
    ], $U3b);
});
//# sourceMappingURL=remoteExtensionHost.js.map