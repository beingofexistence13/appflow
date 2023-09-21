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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/label/common/label", "vs/base/common/platform", "vs/base/common/network", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/log/common/log", "vs/nls!vs/workbench/contrib/remote/common/remote.contribution", "vs/base/common/lifecycle", "vs/platform/configuration/common/configurationRegistry", "vs/platform/files/common/files", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/common/environmentService", "vs/platform/workspace/common/workspace", "vs/base/common/arrays", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/remote/common/remoteAgentConnection", "vs/platform/telemetry/common/telemetry", "vs/platform/remote/common/remoteHosts", "vs/platform/download/common/download", "vs/platform/download/common/downloadIpc", "vs/platform/log/common/logIpc"], function (require, exports, contributions_1, platform_1, label_1, platform_2, network_1, remoteAgentService_1, log_1, nls_1, lifecycle_1, configurationRegistry_1, files_1, dialogs_1, environmentService_1, workspace_1, arrays_1, actions_1, actionCommonCategories_1, remoteAgentConnection_1, telemetry_1, remoteHosts_1, download_1, downloadIpc_1, logIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OXb = void 0;
    let $OXb = class $OXb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
            this.c();
        }
        c() {
            this.b.getEnvironment().then(remoteEnvironment => {
                const os = remoteEnvironment?.os || platform_2.OS;
                const formatting = {
                    label: '${path}',
                    separator: os === 1 /* OperatingSystem.Windows */ ? '\\' : '/',
                    tildify: os !== 1 /* OperatingSystem.Windows */,
                    normalizeDriveLetter: os === 1 /* OperatingSystem.Windows */,
                    workspaceSuffix: platform_2.$o ? undefined : network_1.Schemas.vscodeRemote
                };
                this.a.registerFormatter({
                    scheme: network_1.Schemas.vscodeRemote,
                    formatting
                });
                if (remoteEnvironment) {
                    this.a.registerFormatter({
                        scheme: network_1.Schemas.vscodeUserData,
                        formatting
                    });
                }
            });
        }
    };
    exports.$OXb = $OXb;
    exports.$OXb = $OXb = __decorate([
        __param(0, label_1.$Vz),
        __param(1, remoteAgentService_1.$jm)
    ], $OXb);
    let RemoteChannelsContribution = class RemoteChannelsContribution extends lifecycle_1.$kc {
        constructor(remoteAgentService, downloadService, loggerService) {
            super();
            const connection = remoteAgentService.getConnection();
            if (connection) {
                connection.registerChannel('download', new downloadIpc_1.$En(downloadService));
                connection.withChannel('logger', async (channel) => this.B(new logIpc_1.$3q(loggerService, channel)));
            }
        }
    };
    RemoteChannelsContribution = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, download_1.$Dn),
        __param(2, log_1.$6i)
    ], RemoteChannelsContribution);
    let RemoteInvalidWorkspaceDetector = class RemoteInvalidWorkspaceDetector extends lifecycle_1.$kc {
        constructor(a, b, c, f, g, remoteAgentService) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            // When connected to a remote workspace, we currently cannot
            // validate that the workspace exists before actually opening
            // it. As such, we need to check on that after startup and guide
            // the user to a valid workspace.
            // (see https://github.com/microsoft/vscode/issues/133872)
            if (this.c.remoteAuthority) {
                remoteAgentService.getEnvironment().then(remoteEnv => {
                    if (remoteEnv) {
                        // we use the presence of `remoteEnv` to figure out
                        // if we got a healthy remote connection
                        // (see https://github.com/microsoft/vscode/issues/135331)
                        this.h();
                    }
                });
            }
        }
        async h() {
            const workspace = this.f.getWorkspace();
            const workspaceUriToStat = workspace.configuration ?? (0, arrays_1.$Mb)(workspace.folders)?.uri;
            if (!workspaceUriToStat) {
                return; // only when in workspace
            }
            const exists = await this.a.exists(workspaceUriToStat);
            if (exists) {
                return; // all good!
            }
            const res = await this.b.confirm({
                type: 'warning',
                message: (0, nls_1.localize)(0, null),
                detail: (0, nls_1.localize)(1, null),
                primaryButton: (0, nls_1.localize)(2, null)
            });
            if (res.confirmed) {
                // Pick Workspace
                if (workspace.configuration) {
                    return this.g.pickWorkspaceAndOpen({});
                }
                // Pick Folder
                return this.g.pickFolderAndOpen({});
            }
        }
    };
    RemoteInvalidWorkspaceDetector = __decorate([
        __param(0, files_1.$6j),
        __param(1, dialogs_1.$oA),
        __param(2, environmentService_1.$hJ),
        __param(3, workspace_1.$Kh),
        __param(4, dialogs_1.$qA),
        __param(5, remoteAgentService_1.$jm)
    ], RemoteInvalidWorkspaceDetector);
    let InitialRemoteConnectionHealthContribution = class InitialRemoteConnectionHealthContribution {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            if (this.b.remoteAuthority) {
                this.d();
            }
        }
        async d() {
            try {
                await this.a.getRawEnvironment();
                this.c.publicLog2('remoteConnectionSuccess', {
                    web: platform_2.$o,
                    connectionTimeMs: await this.a.getConnection()?.getInitialConnectionTimeMs(),
                    remoteName: (0, remoteHosts_1.$Pk)(this.b.remoteAuthority)
                });
                await this.e();
            }
            catch (err) {
                this.c.publicLog2('remoteConnectionFailure', {
                    web: platform_2.$o,
                    connectionTimeMs: await this.a.getConnection()?.getInitialConnectionTimeMs(),
                    remoteName: (0, remoteHosts_1.$Pk)(this.b.remoteAuthority),
                    message: err ? err.message : ''
                });
            }
        }
        async e() {
            const measurement = await remoteAgentService_1.$km.measure(this.a);
            if (measurement === undefined) {
                return;
            }
            this.c.publicLog2('remoteConnectionLatency', {
                web: platform_2.$o,
                remoteName: (0, remoteHosts_1.$Pk)(this.b.remoteAuthority),
                latencyMs: measurement.current
            });
        }
    };
    InitialRemoteConnectionHealthContribution = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, environmentService_1.$hJ),
        __param(2, telemetry_1.$9k)
    ], InitialRemoteConnectionHealthContribution);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution($OXb, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteChannelsContribution, 3 /* LifecyclePhase.Restored */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteInvalidWorkspaceDetector, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(InitialRemoteConnectionHealthContribution, 3 /* LifecyclePhase.Restored */);
    const enableDiagnostics = true;
    if (enableDiagnostics) {
        class TriggerReconnectAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.triggerReconnect',
                    title: { value: (0, nls_1.localize)(3, null), original: 'Connection: Trigger Reconnect' },
                    category: actionCommonCategories_1.$Nl.Developer,
                    f1: true,
                });
            }
            async run(accessor) {
                remoteAgentConnection_1.$6k.debugTriggerReconnection();
            }
        }
        class PauseSocketWriting extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.pauseSocketWriting',
                    title: { value: (0, nls_1.localize)(4, null), original: 'Connection: Pause socket writing' },
                    category: actionCommonCategories_1.$Nl.Developer,
                    f1: true,
                });
            }
            async run(accessor) {
                remoteAgentConnection_1.$6k.debugPauseSocketWriting();
            }
        }
        (0, actions_1.$Xu)(TriggerReconnectAction);
        (0, actions_1.$Xu)(PauseSocketWriting);
    }
    const extensionKindSchema = {
        type: 'string',
        enum: [
            'ui',
            'workspace'
        ],
        enumDescriptions: [
            (0, nls_1.localize)(5, null),
            (0, nls_1.localize)(6, null)
        ],
    };
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
        .registerConfiguration({
        id: 'remote',
        title: (0, nls_1.localize)(7, null),
        type: 'object',
        properties: {
            'remote.extensionKind': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)(8, null),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                        oneOf: [{ type: 'array', items: extensionKindSchema }, extensionKindSchema],
                        default: ['ui'],
                    },
                },
                default: {
                    'pub.name': ['ui']
                }
            },
            'remote.restoreForwardedPorts': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)(9, null),
                default: true
            },
            'remote.autoForwardPorts': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)(10, null),
                default: true
            },
            'remote.autoForwardPortsSource': {
                type: 'string',
                markdownDescription: (0, nls_1.localize)(11, null, '`#remote.autoForwardPorts#`'),
                enum: ['process', 'output', 'hybrid'],
                enumDescriptions: [
                    (0, nls_1.localize)(12, null),
                    (0, nls_1.localize)(13, null),
                    (0, nls_1.localize)(14, null)
                ],
                default: 'process'
            },
            'remote.forwardOnOpen': {
                type: 'boolean',
                description: (0, nls_1.localize)(15, null),
                default: true
            },
            // Consider making changes to extensions\configuration-editing\schemas\devContainer.schema.src.json
            // and extensions\configuration-editing\schemas\attachContainer.schema.json
            // to keep in sync with devcontainer.json schema.
            'remote.portsAttributes': {
                type: 'object',
                patternProperties: {
                    '(^\\d+(-\\d+)?$)|(.+)': {
                        type: 'object',
                        description: (0, nls_1.localize)(16, null),
                        properties: {
                            'onAutoForward': {
                                type: 'string',
                                enum: ['notify', 'openBrowser', 'openBrowserOnce', 'openPreview', 'silent', 'ignore'],
                                enumDescriptions: [
                                    (0, nls_1.localize)(17, null),
                                    (0, nls_1.localize)(18, null),
                                    (0, nls_1.localize)(19, null),
                                    (0, nls_1.localize)(20, null),
                                    (0, nls_1.localize)(21, null),
                                    (0, nls_1.localize)(22, null)
                                ],
                                description: (0, nls_1.localize)(23, null),
                                default: 'notify'
                            },
                            'elevateIfNeeded': {
                                type: 'boolean',
                                description: (0, nls_1.localize)(24, null),
                                default: false
                            },
                            'label': {
                                type: 'string',
                                description: (0, nls_1.localize)(25, null),
                                default: (0, nls_1.localize)(26, null)
                            },
                            'requireLocalPort': {
                                type: 'boolean',
                                markdownDescription: (0, nls_1.localize)(27, null),
                                default: false
                            },
                            'protocol': {
                                type: 'string',
                                enum: ['http', 'https'],
                                description: (0, nls_1.localize)(28, null)
                            }
                        },
                        default: {
                            'label': (0, nls_1.localize)(29, null),
                            'onAutoForward': 'notify'
                        }
                    }
                },
                markdownDescription: (0, nls_1.localize)(30, null),
                defaultSnippets: [{ body: { '${1:3000}': { label: '${2:Application}', onAutoForward: 'openPreview' } } }],
                errorMessage: (0, nls_1.localize)(31, null),
                additionalProperties: false,
                default: {
                    '443': {
                        'protocol': 'https'
                    },
                    '8443': {
                        'protocol': 'https'
                    }
                }
            },
            'remote.otherPortsAttributes': {
                type: 'object',
                properties: {
                    'onAutoForward': {
                        type: 'string',
                        enum: ['notify', 'openBrowser', 'openPreview', 'silent', 'ignore'],
                        enumDescriptions: [
                            (0, nls_1.localize)(32, null),
                            (0, nls_1.localize)(33, null),
                            (0, nls_1.localize)(34, null),
                            (0, nls_1.localize)(35, null),
                            (0, nls_1.localize)(36, null)
                        ],
                        description: (0, nls_1.localize)(37, null),
                        default: 'notify'
                    },
                    'elevateIfNeeded': {
                        type: 'boolean',
                        description: (0, nls_1.localize)(38, null),
                        default: false
                    },
                    'label': {
                        type: 'string',
                        description: (0, nls_1.localize)(39, null),
                        default: (0, nls_1.localize)(40, null)
                    },
                    'requireLocalPort': {
                        type: 'boolean',
                        markdownDescription: (0, nls_1.localize)(41, null),
                        default: false
                    },
                    'protocol': {
                        type: 'string',
                        enum: ['http', 'https'],
                        description: (0, nls_1.localize)(42, null)
                    }
                },
                defaultSnippets: [{ body: { onAutoForward: 'ignore' } }],
                markdownDescription: (0, nls_1.localize)(43, null, '`#remote.portsAttributes#`'),
                additionalProperties: false
            },
            'remote.localPortHost': {
                type: 'string',
                enum: ['localhost', 'allInterfaces'],
                default: 'localhost',
                description: (0, nls_1.localize)(44, null)
            }
        }
    });
});
//# sourceMappingURL=remote.contribution.js.map