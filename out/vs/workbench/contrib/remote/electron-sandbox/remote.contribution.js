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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/keyCodes", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/common/contributions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/label/common/label", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/workbench/services/extensions/common/extensions", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/dialogs/browser/simpleFileDialog", "vs/platform/workspace/common/workspace", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/contextkey/common/contextkey", "vs/platform/native/common/native", "vs/platform/storage/common/storage"], function (require, exports, nls, platform_1, remoteAgentService_1, lifecycle_1, platform_2, keyCodes_1, keybindingsRegistry_1, contributions_1, lifecycle_2, label_1, commands_1, network_1, extensions_1, globals_1, environmentService_1, configuration_1, configurationRegistry_1, remoteAuthorityResolver_1, simpleFileDialog_1, workspace_1, telemetry_1, telemetryUtils_1, contextkey_1, native_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let RemoteAgentDiagnosticListener = class RemoteAgentDiagnosticListener {
        constructor(remoteAgentService, labelService) {
            globals_1.ipcRenderer.on('vscode:getDiagnosticInfo', (event, request) => {
                const connection = remoteAgentService.getConnection();
                if (connection) {
                    const hostName = labelService.getHostLabel(network_1.Schemas.vscodeRemote, connection.remoteAuthority);
                    remoteAgentService.getDiagnosticInfo(request.args)
                        .then(info => {
                        if (info) {
                            info.hostName = hostName;
                            if (remoteAgentService_1.remoteConnectionLatencyMeasurer.latency?.high) {
                                info.latency = {
                                    average: remoteAgentService_1.remoteConnectionLatencyMeasurer.latency.average,
                                    current: remoteAgentService_1.remoteConnectionLatencyMeasurer.latency.current
                                };
                            }
                        }
                        globals_1.ipcRenderer.send(request.replyChannel, info);
                    })
                        .catch(e => {
                        const errorMessage = e && e.message ? `Connection to '${hostName}' could not be established  ${e.message}` : `Connection to '${hostName}' could not be established `;
                        globals_1.ipcRenderer.send(request.replyChannel, { hostName, errorMessage });
                    });
                }
                else {
                    globals_1.ipcRenderer.send(request.replyChannel);
                }
            });
        }
    };
    RemoteAgentDiagnosticListener = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, label_1.ILabelService)
    ], RemoteAgentDiagnosticListener);
    let RemoteExtensionHostEnvironmentUpdater = class RemoteExtensionHostEnvironmentUpdater {
        constructor(remoteAgentService, remoteResolverService, extensionService) {
            const connection = remoteAgentService.getConnection();
            if (connection) {
                connection.onDidStateChange(async (e) => {
                    if (e.type === 4 /* PersistentConnectionEventType.ConnectionGain */) {
                        const resolveResult = await remoteResolverService.resolveAuthority(connection.remoteAuthority);
                        if (resolveResult.options && resolveResult.options.extensionHostEnv) {
                            await extensionService.setRemoteEnvironment(resolveResult.options.extensionHostEnv);
                        }
                    }
                });
            }
        }
    };
    RemoteExtensionHostEnvironmentUpdater = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(2, extensions_1.IExtensionService)
    ], RemoteExtensionHostEnvironmentUpdater);
    let RemoteTelemetryEnablementUpdater = class RemoteTelemetryEnablementUpdater extends lifecycle_1.Disposable {
        constructor(remoteAgentService, configurationService) {
            super();
            this.remoteAgentService = remoteAgentService;
            this.configurationService = configurationService;
            this.updateRemoteTelemetryEnablement();
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(telemetry_1.TELEMETRY_SETTING_ID)) {
                    this.updateRemoteTelemetryEnablement();
                }
            }));
        }
        updateRemoteTelemetryEnablement() {
            return this.remoteAgentService.updateTelemetryLevel((0, telemetryUtils_1.getTelemetryLevel)(this.configurationService));
        }
    };
    RemoteTelemetryEnablementUpdater = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, configuration_1.IConfigurationService)
    ], RemoteTelemetryEnablementUpdater);
    let RemoteEmptyWorkbenchPresentation = class RemoteEmptyWorkbenchPresentation extends lifecycle_1.Disposable {
        constructor(environmentService, remoteAuthorityResolverService, configurationService, commandService, contextService) {
            super();
            function shouldShowExplorer() {
                const startupEditor = configurationService.getValue('workbench.startupEditor');
                return startupEditor !== 'welcomePage' && startupEditor !== 'welcomePageInEmptyWorkbench';
            }
            function shouldShowTerminal() {
                return shouldShowExplorer();
            }
            const { remoteAuthority, filesToDiff, filesToMerge, filesToOpenOrCreate, filesToWait } = environmentService;
            if (remoteAuthority && contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && !filesToDiff?.length && !filesToMerge?.length && !filesToOpenOrCreate?.length && !filesToWait) {
                remoteAuthorityResolverService.resolveAuthority(remoteAuthority).then(() => {
                    if (shouldShowExplorer()) {
                        commandService.executeCommand('workbench.view.explorer');
                    }
                    if (shouldShowTerminal()) {
                        commandService.executeCommand('workbench.action.terminal.toggleTerminal');
                    }
                });
            }
        }
    };
    RemoteEmptyWorkbenchPresentation = __decorate([
        __param(0, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(1, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, commands_1.ICommandService),
        __param(4, workspace_1.IWorkspaceContextService)
    ], RemoteEmptyWorkbenchPresentation);
    /**
     * Sets the 'wslFeatureInstalled' context key if the WSL feature is or was installed on this machine.
     */
    let WSLContextKeyInitializer = class WSLContextKeyInitializer extends lifecycle_1.Disposable {
        constructor(contextKeyService, nativeHostService, storageService, lifecycleService) {
            super();
            const contextKeyId = 'wslFeatureInstalled';
            const storageKey = 'remote.wslFeatureInstalled';
            const defaultValue = storageService.getBoolean(storageKey, -1 /* StorageScope.APPLICATION */, undefined);
            const hasWSLFeatureContext = new contextkey_1.RawContextKey(contextKeyId, !!defaultValue, nls.localize('wslFeatureInstalled', "Whether the platform has the WSL feature installed"));
            const contextKey = hasWSLFeatureContext.bindTo(contextKeyService);
            if (defaultValue === undefined) {
                lifecycleService.when(4 /* LifecyclePhase.Eventually */).then(async () => {
                    nativeHostService.hasWSLFeatureInstalled().then(res => {
                        if (res) {
                            contextKey.set(true);
                            // once detected, set to true
                            storageService.store(storageKey, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                        }
                    });
                });
            }
        }
    };
    WSLContextKeyInitializer = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, native_1.INativeHostService),
        __param(2, storage_1.IStorageService),
        __param(3, lifecycle_2.ILifecycleService)
    ], WSLContextKeyInitializer);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteAgentDiagnosticListener, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteExtensionHostEnvironmentUpdater, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteTelemetryEnablementUpdater, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteEmptyWorkbenchPresentation, 2 /* LifecyclePhase.Ready */);
    if (platform_2.isWindows) {
        workbenchContributionsRegistry.registerWorkbenchContribution(WSLContextKeyInitializer, 2 /* LifecyclePhase.Ready */);
    }
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'remote',
        title: nls.localize('remote', "Remote"),
        type: 'object',
        properties: {
            'remote.downloadExtensionsLocally': {
                type: 'boolean',
                markdownDescription: nls.localize('remote.downloadExtensionsLocally', "When enabled extensions are downloaded locally and installed on remote."),
                default: false
            },
        }
    });
    if (platform_2.isMacintosh) {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: simpleFileDialog_1.OpenLocalFileFolderCommand.ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */,
            when: simpleFileDialog_1.RemoteFileDialogContext,
            description: { description: simpleFileDialog_1.OpenLocalFileFolderCommand.LABEL, args: [] },
            handler: simpleFileDialog_1.OpenLocalFileFolderCommand.handler()
        });
    }
    else {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: simpleFileDialog_1.OpenLocalFileCommand.ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */,
            when: simpleFileDialog_1.RemoteFileDialogContext,
            description: { description: simpleFileDialog_1.OpenLocalFileCommand.LABEL, args: [] },
            handler: simpleFileDialog_1.OpenLocalFileCommand.handler()
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: simpleFileDialog_1.OpenLocalFolderCommand.ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */),
            when: simpleFileDialog_1.RemoteFileDialogContext,
            description: { description: simpleFileDialog_1.OpenLocalFolderCommand.LABEL, args: [] },
            handler: simpleFileDialog_1.OpenLocalFolderCommand.handler()
        });
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: simpleFileDialog_1.SaveLocalFileCommand.ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 49 /* KeyCode.KeyS */,
        when: simpleFileDialog_1.RemoteFileDialogContext,
        description: { description: simpleFileDialog_1.SaveLocalFileCommand.LABEL, args: [] },
        handler: simpleFileDialog_1.SaveLocalFileCommand.handler()
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3JlbW90ZS9lbGVjdHJvbi1zYW5kYm94L3JlbW90ZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUE4QmhHLElBQU0sNkJBQTZCLEdBQW5DLE1BQU0sNkJBQTZCO1FBQ2xDLFlBQ3NCLGtCQUF1QyxFQUM3QyxZQUEyQjtZQUUxQyxxQkFBVyxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxDQUFDLEtBQWMsRUFBRSxPQUErRCxFQUFRLEVBQUU7Z0JBQ3BJLE1BQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN0RCxJQUFJLFVBQVUsRUFBRTtvQkFDZixNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLGlCQUFPLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDN0Ysa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzt5QkFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNaLElBQUksSUFBSSxFQUFFOzRCQUNSLElBQThCLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzs0QkFDcEQsSUFBSSxvREFBK0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFO2dDQUNqRCxJQUE4QixDQUFDLE9BQU8sR0FBRztvQ0FDekMsT0FBTyxFQUFFLG9EQUErQixDQUFDLE9BQU8sQ0FBQyxPQUFPO29DQUN4RCxPQUFPLEVBQUUsb0RBQStCLENBQUMsT0FBTyxDQUFDLE9BQU87aUNBQ3hELENBQUM7NkJBQ0Y7eUJBQ0Q7d0JBRUQscUJBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMs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