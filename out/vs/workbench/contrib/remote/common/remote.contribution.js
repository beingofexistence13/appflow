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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/label/common/label", "vs/base/common/platform", "vs/base/common/network", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/log/common/log", "vs/nls", "vs/base/common/lifecycle", "vs/platform/configuration/common/configurationRegistry", "vs/platform/files/common/files", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/common/environmentService", "vs/platform/workspace/common/workspace", "vs/base/common/arrays", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/remote/common/remoteAgentConnection", "vs/platform/telemetry/common/telemetry", "vs/platform/remote/common/remoteHosts", "vs/platform/download/common/download", "vs/platform/download/common/downloadIpc", "vs/platform/log/common/logIpc"], function (require, exports, contributions_1, platform_1, label_1, platform_2, network_1, remoteAgentService_1, log_1, nls_1, lifecycle_1, configurationRegistry_1, files_1, dialogs_1, environmentService_1, workspace_1, arrays_1, actions_1, actionCommonCategories_1, remoteAgentConnection_1, telemetry_1, remoteHosts_1, download_1, downloadIpc_1, logIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LabelContribution = void 0;
    let LabelContribution = class LabelContribution {
        constructor(labelService, remoteAgentService) {
            this.labelService = labelService;
            this.remoteAgentService = remoteAgentService;
            this.registerFormatters();
        }
        registerFormatters() {
            this.remoteAgentService.getEnvironment().then(remoteEnvironment => {
                const os = remoteEnvironment?.os || platform_2.OS;
                const formatting = {
                    label: '${path}',
                    separator: os === 1 /* OperatingSystem.Windows */ ? '\\' : '/',
                    tildify: os !== 1 /* OperatingSystem.Windows */,
                    normalizeDriveLetter: os === 1 /* OperatingSystem.Windows */,
                    workspaceSuffix: platform_2.isWeb ? undefined : network_1.Schemas.vscodeRemote
                };
                this.labelService.registerFormatter({
                    scheme: network_1.Schemas.vscodeRemote,
                    formatting
                });
                if (remoteEnvironment) {
                    this.labelService.registerFormatter({
                        scheme: network_1.Schemas.vscodeUserData,
                        formatting
                    });
                }
            });
        }
    };
    exports.LabelContribution = LabelContribution;
    exports.LabelContribution = LabelContribution = __decorate([
        __param(0, label_1.ILabelService),
        __param(1, remoteAgentService_1.IRemoteAgentService)
    ], LabelContribution);
    let RemoteChannelsContribution = class RemoteChannelsContribution extends lifecycle_1.Disposable {
        constructor(remoteAgentService, downloadService, loggerService) {
            super();
            const connection = remoteAgentService.getConnection();
            if (connection) {
                connection.registerChannel('download', new downloadIpc_1.DownloadServiceChannel(downloadService));
                connection.withChannel('logger', async (channel) => this._register(new logIpc_1.RemoteLoggerChannelClient(loggerService, channel)));
            }
        }
    };
    RemoteChannelsContribution = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, download_1.IDownloadService),
        __param(2, log_1.ILoggerService)
    ], RemoteChannelsContribution);
    let RemoteInvalidWorkspaceDetector = class RemoteInvalidWorkspaceDetector extends lifecycle_1.Disposable {
        constructor(fileService, dialogService, environmentService, contextService, fileDialogService, remoteAgentService) {
            super();
            this.fileService = fileService;
            this.dialogService = dialogService;
            this.environmentService = environmentService;
            this.contextService = contextService;
            this.fileDialogService = fileDialogService;
            // When connected to a remote workspace, we currently cannot
            // validate that the workspace exists before actually opening
            // it. As such, we need to check on that after startup and guide
            // the user to a valid workspace.
            // (see https://github.com/microsoft/vscode/issues/133872)
            if (this.environmentService.remoteAuthority) {
                remoteAgentService.getEnvironment().then(remoteEnv => {
                    if (remoteEnv) {
                        // we use the presence of `remoteEnv` to figure out
                        // if we got a healthy remote connection
                        // (see https://github.com/microsoft/vscode/issues/135331)
                        this.validateRemoteWorkspace();
                    }
                });
            }
        }
        async validateRemoteWorkspace() {
            const workspace = this.contextService.getWorkspace();
            const workspaceUriToStat = workspace.configuration ?? (0, arrays_1.firstOrDefault)(workspace.folders)?.uri;
            if (!workspaceUriToStat) {
                return; // only when in workspace
            }
            const exists = await this.fileService.exists(workspaceUriToStat);
            if (exists) {
                return; // all good!
            }
            const res = await this.dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)('invalidWorkspaceMessage', "Workspace does not exist"),
                detail: (0, nls_1.localize)('invalidWorkspaceDetail', "Please select another workspace to open."),
                primaryButton: (0, nls_1.localize)({ key: 'invalidWorkspacePrimary', comment: ['&& denotes a mnemonic'] }, "&&Open Workspace...")
            });
            if (res.confirmed) {
                // Pick Workspace
                if (workspace.configuration) {
                    return this.fileDialogService.pickWorkspaceAndOpen({});
                }
                // Pick Folder
                return this.fileDialogService.pickFolderAndOpen({});
            }
        }
    };
    RemoteInvalidWorkspaceDetector = __decorate([
        __param(0, files_1.IFileService),
        __param(1, dialogs_1.IDialogService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, dialogs_1.IFileDialogService),
        __param(5, remoteAgentService_1.IRemoteAgentService)
    ], RemoteInvalidWorkspaceDetector);
    let InitialRemoteConnectionHealthContribution = class InitialRemoteConnectionHealthContribution {
        constructor(_remoteAgentService, _environmentService, _telemetryService) {
            this._remoteAgentService = _remoteAgentService;
            this._environmentService = _environmentService;
            this._telemetryService = _telemetryService;
            if (this._environmentService.remoteAuthority) {
                this._checkInitialRemoteConnectionHealth();
            }
        }
        async _checkInitialRemoteConnectionHealth() {
            try {
                await this._remoteAgentService.getRawEnvironment();
                this._telemetryService.publicLog2('remoteConnectionSuccess', {
                    web: platform_2.isWeb,
                    connectionTimeMs: await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),
                    remoteName: (0, remoteHosts_1.getRemoteName)(this._environmentService.remoteAuthority)
                });
                await this._measureExtHostLatency();
            }
            catch (err) {
                this._telemetryService.publicLog2('remoteConnectionFailure', {
                    web: platform_2.isWeb,
                    connectionTimeMs: await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),
                    remoteName: (0, remoteHosts_1.getRemoteName)(this._environmentService.remoteAuthority),
                    message: err ? err.message : ''
                });
            }
        }
        async _measureExtHostLatency() {
            const measurement = await remoteAgentService_1.remoteConnectionLatencyMeasurer.measure(this._remoteAgentService);
            if (measurement === undefined) {
                return;
            }
            this._telemetryService.publicLog2('remoteConnectionLatency', {
                web: platform_2.isWeb,
                remoteName: (0, remoteHosts_1.getRemoteName)(this._environmentService.remoteAuthority),
                latencyMs: measurement.current
            });
        }
    };
    InitialRemoteConnectionHealthContribution = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, telemetry_1.ITelemetryService)
    ], InitialRemoteConnectionHealthContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(LabelContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteChannelsContribution, 3 /* LifecyclePhase.Restored */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteInvalidWorkspaceDetector, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(InitialRemoteConnectionHealthContribution, 3 /* LifecyclePhase.Restored */);
    const enableDiagnostics = true;
    if (enableDiagnostics) {
        class TriggerReconnectAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.triggerReconnect',
                    title: { value: (0, nls_1.localize)('triggerReconnect', "Connection: Trigger Reconnect"), original: 'Connection: Trigger Reconnect' },
                    category: actionCommonCategories_1.Categories.Developer,
                    f1: true,
                });
            }
            async run(accessor) {
                remoteAgentConnection_1.PersistentConnection.debugTriggerReconnection();
            }
        }
        class PauseSocketWriting extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.pauseSocketWriting',
                    title: { value: (0, nls_1.localize)('pauseSocketWriting', "Connection: Pause socket writing"), original: 'Connection: Pause socket writing' },
                    category: actionCommonCategories_1.Categories.Developer,
                    f1: true,
                });
            }
            async run(accessor) {
                remoteAgentConnection_1.PersistentConnection.debugPauseSocketWriting();
            }
        }
        (0, actions_1.registerAction2)(TriggerReconnectAction);
        (0, actions_1.registerAction2)(PauseSocketWriting);
    }
    const extensionKindSchema = {
        type: 'string',
        enum: [
            'ui',
            'workspace'
        ],
        enumDescriptions: [
            (0, nls_1.localize)('ui', "UI extension kind. In a remote window, such extensions are enabled only when available on the local machine."),
            (0, nls_1.localize)('workspace', "Workspace extension kind. In a remote window, such extensions are enabled only when available on the remote.")
        ],
    };
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'remote',
        title: (0, nls_1.localize)('remote', "Remote"),
        type: 'object',
        properties: {
            'remote.extensionKind': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)('remote.extensionKind', "Override the kind of an extension. `ui` extensions are installed and run on the local machine while `workspace` extensions are run on the remote. By overriding an extension's default kind using this setting, you specify if that extension should be installed and enabled locally or remotely."),
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
                markdownDescription: (0, nls_1.localize)('remote.restoreForwardedPorts', "Restores the ports you forwarded in a workspace."),
                default: true
            },
            'remote.autoForwardPorts': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)('remote.autoForwardPorts', "When enabled, new running processes are detected and ports that they listen on are automatically forwarded. Disabling this setting will not prevent all ports from being forwarded. Even when disabled, extensions will still be able to cause ports to be forwarded, and opening some URLs will still cause ports to forwarded."),
                default: true
            },
            'remote.autoForwardPortsSource': {
                type: 'string',
                markdownDescription: (0, nls_1.localize)('remote.autoForwardPortsSource', "Sets the source from which ports are automatically forwarded when {0} is true. On Windows and Mac remotes, the `process` and `hybrid` options have no effect and `output` will be used. Requires a reload to take effect.", '`#remote.autoForwardPorts#`'),
                enum: ['process', 'output', 'hybrid'],
                enumDescriptions: [
                    (0, nls_1.localize)('remote.autoForwardPortsSource.process', "Ports will be automatically forwarded when discovered by watching for processes that are started and include a port."),
                    (0, nls_1.localize)('remote.autoForwardPortsSource.output', "Ports will be automatically forwarded when discovered by reading terminal and debug output. Not all processes that use ports will print to the integrated terminal or debug console, so some ports will be missed. Ports forwarded based on output will not be \"un-forwarded\" until reload or until the port is closed by the user in the Ports view."),
                    (0, nls_1.localize)('remote.autoForwardPortsSource.hybrid', "Ports will be automatically forwarded when discovered by reading terminal and debug output. Not all processes that use ports will print to the integrated terminal or debug console, so some ports will be missed. Ports will be \"un-forwarded\" by watching for processes that listen on that port to be terminated.")
                ],
                default: 'process'
            },
            'remote.forwardOnOpen': {
                type: 'boolean',
                description: (0, nls_1.localize)('remote.forwardOnClick', "Controls whether local URLs with a port will be forwarded when opened from the terminal and the debug console."),
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
                        description: (0, nls_1.localize)('remote.portsAttributes.port', "A port, range of ports (ex. \"40000-55000\"), host and port (ex. \"db:1234\"), or regular expression (ex. \".+\\\\/server.js\").  For a port number or range, the attributes will apply to that port number or range of port numbers. Attributes which use a regular expression will apply to ports whose associated process command line matches the expression."),
                        properties: {
                            'onAutoForward': {
                                type: 'string',
                                enum: ['notify', 'openBrowser', 'openBrowserOnce', 'openPreview', 'silent', 'ignore'],
                                enumDescriptions: [
                                    (0, nls_1.localize)('remote.portsAttributes.notify', "Shows a notification when a port is automatically forwarded."),
                                    (0, nls_1.localize)('remote.portsAttributes.openBrowser', "Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser."),
                                    (0, nls_1.localize)('remote.portsAttributes.openBrowserOnce', "Opens the browser when the port is automatically forwarded, but only the first time the port is forward during a session. Depending on your settings, this could open an embedded browser."),
                                    (0, nls_1.localize)('remote.portsAttributes.openPreview', "Opens a preview in the same window when the port is automatically forwarded."),
                                    (0, nls_1.localize)('remote.portsAttributes.silent', "Shows no notification and takes no action when this port is automatically forwarded."),
                                    (0, nls_1.localize)('remote.portsAttributes.ignore', "This port will not be automatically forwarded.")
                                ],
                                description: (0, nls_1.localize)('remote.portsAttributes.onForward', "Defines the action that occurs when the port is discovered for automatic forwarding"),
                                default: 'notify'
                            },
                            'elevateIfNeeded': {
                                type: 'boolean',
                                description: (0, nls_1.localize)('remote.portsAttributes.elevateIfNeeded', "Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port."),
                                default: false
                            },
                            'label': {
                                type: 'string',
                                description: (0, nls_1.localize)('remote.portsAttributes.label', "Label that will be shown in the UI for this port."),
                                default: (0, nls_1.localize)('remote.portsAttributes.labelDefault', "Application")
                            },
                            'requireLocalPort': {
                                type: 'boolean',
                                markdownDescription: (0, nls_1.localize)('remote.portsAttributes.requireLocalPort', "When true, a modal dialog will show if the chosen local port isn't used for forwarding."),
                                default: false
                            },
                            'protocol': {
                                type: 'string',
                                enum: ['http', 'https'],
                                description: (0, nls_1.localize)('remote.portsAttributes.protocol', "The protocol to use when forwarding this port.")
                            }
                        },
                        default: {
                            'label': (0, nls_1.localize)('remote.portsAttributes.labelDefault', "Application"),
                            'onAutoForward': 'notify'
                        }
                    }
                },
                markdownDescription: (0, nls_1.localize)('remote.portsAttributes', "Set properties that are applied when a specific port number is forwarded. For example:\n\n```\n\"3000\": {\n  \"label\": \"Application\"\n},\n\"40000-55000\": {\n  \"onAutoForward\": \"ignore\"\n},\n\".+\\\\/server.js\": {\n \"onAutoForward\": \"openPreview\"\n}\n```"),
                defaultSnippets: [{ body: { '${1:3000}': { label: '${2:Application}', onAutoForward: 'openPreview' } } }],
                errorMessage: (0, nls_1.localize)('remote.portsAttributes.patternError', "Must be a port number, range of port numbers, or regular expression."),
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
                            (0, nls_1.localize)('remote.portsAttributes.notify', "Shows a notification when a port is automatically forwarded."),
                            (0, nls_1.localize)('remote.portsAttributes.openBrowser', "Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser."),
                            (0, nls_1.localize)('remote.portsAttributes.openPreview', "Opens a preview in the same window when the port is automatically forwarded."),
                            (0, nls_1.localize)('remote.portsAttributes.silent', "Shows no notification and takes no action when this port is automatically forwarded."),
                            (0, nls_1.localize)('remote.portsAttributes.ignore', "This port will not be automatically forwarded.")
                        ],
                        description: (0, nls_1.localize)('remote.portsAttributes.onForward', "Defines the action that occurs when the port is discovered for automatic forwarding"),
                        default: 'notify'
                    },
                    'elevateIfNeeded': {
                        type: 'boolean',
                        description: (0, nls_1.localize)('remote.portsAttributes.elevateIfNeeded', "Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port."),
                        default: false
                    },
                    'label': {
                        type: 'string',
                        description: (0, nls_1.localize)('remote.portsAttributes.label', "Label that will be shown in the UI for this port."),
                        default: (0, nls_1.localize)('remote.portsAttributes.labelDefault', "Application")
                    },
                    'requireLocalPort': {
                        type: 'boolean',
                        markdownDescription: (0, nls_1.localize)('remote.portsAttributes.requireLocalPort', "When true, a modal dialog will show if the chosen local port isn't used for forwarding."),
                        default: false
                    },
                    'protocol': {
                        type: 'string',
                        enum: ['http', 'https'],
                        description: (0, nls_1.localize)('remote.portsAttributes.protocol', "The protocol to use when forwarding this port.")
                    }
                },
                defaultSnippets: [{ body: { onAutoForward: 'ignore' } }],
                markdownDescription: (0, nls_1.localize)('remote.portsAttributes.defaults', "Set default properties that are applied to all ports that don't get properties from the setting {0}. For example:\n\n```\n{\n  \"onAutoForward\": \"ignore\"\n}\n```", '`#remote.portsAttributes#`'),
                additionalProperties: false
            },
            'remote.localPortHost': {
                type: 'string',
                enum: ['localhost', 'allInterfaces'],
                default: 'localhost',
                description: (0, nls_1.localize)('remote.localPortHost', "Specifies the local host name that will be used for port forwarding.")
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3JlbW90ZS9jb21tb24vcmVtb3RlLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE2QnpGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWlCO1FBQzdCLFlBQ2lDLFlBQTJCLEVBQ3JCLGtCQUF1QztZQUQ3QyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNyQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQzdFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTyxrQkFBa0I7WUFDekIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO2dCQUNqRSxNQUFNLEVBQUUsR0FBRyxpQkFBaUIsRUFBRSxFQUFFLElBQUksYUFBRSxDQUFDO2dCQUN2QyxNQUFNLFVBQVUsR0FBNEI7b0JBQzNDLEtBQUssRUFBRSxTQUFTO29CQUNoQixTQUFTLEVBQUUsRUFBRSxvQ0FBNEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHO29CQUN0RCxPQUFPLEVBQUUsRUFBRSxvQ0FBNEI7b0JBQ3ZDLG9CQUFvQixFQUFFLEVBQUUsb0NBQTRCO29CQUNwRCxlQUFlLEVBQUUsZ0JBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxpQkFBTyxDQUFDLFlBQVk7aUJBQ3pELENBQUM7Z0JBQ0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztvQkFDbkMsTUFBTSxFQUFFLGlCQUFPLENBQUMsWUFBWTtvQkFDNUIsVUFBVTtpQkFDVixDQUFDLENBQUM7Z0JBRUgsSUFBSSxpQkFBaUIsRUFB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