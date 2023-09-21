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
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/electron-sandbox/remote.contribution", "vs/platform/registry/common/platform", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/keyCodes", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/common/contributions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/label/common/label", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/workbench/services/extensions/common/extensions", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/dialogs/browser/simpleFileDialog", "vs/platform/workspace/common/workspace", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/contextkey/common/contextkey", "vs/platform/native/common/native", "vs/platform/storage/common/storage"], function (require, exports, nls, platform_1, remoteAgentService_1, lifecycle_1, platform_2, keyCodes_1, keybindingsRegistry_1, contributions_1, lifecycle_2, label_1, commands_1, network_1, extensions_1, globals_1, environmentService_1, configuration_1, configurationRegistry_1, remoteAuthorityResolver_1, simpleFileDialog_1, workspace_1, telemetry_1, telemetryUtils_1, contextkey_1, native_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let RemoteAgentDiagnosticListener = class RemoteAgentDiagnosticListener {
        constructor(remoteAgentService, labelService) {
            globals_1.$M.on('vscode:getDiagnosticInfo', (event, request) => {
                const connection = remoteAgentService.getConnection();
                if (connection) {
                    const hostName = labelService.getHostLabel(network_1.Schemas.vscodeRemote, connection.remoteAuthority);
                    remoteAgentService.getDiagnosticInfo(request.args)
                        .then(info => {
                        if (info) {
                            info.hostName = hostName;
                            if (remoteAgentService_1.$km.latency?.high) {
                                info.latency = {
                                    average: remoteAgentService_1.$km.latency.average,
                                    current: remoteAgentService_1.$km.latency.current
                                };
                            }
                        }
                        globals_1.$M.send(request.replyChannel, info);
                    })
                        .catch(e => {
                        const errorMessage = e && e.message ? `Connection to '${hostName}' could not be established  ${e.message}` : `Connection to '${hostName}' could not be established `;
                        globals_1.$M.send(request.replyChannel, { hostName, errorMessage });
                    });
                }
                else {
                    globals_1.$M.send(request.replyChannel);
                }
            });
        }
    };
    RemoteAgentDiagnosticListener = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, label_1.$Vz)
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
        __param(0, remoteAgentService_1.$jm),
        __param(1, remoteAuthorityResolver_1.$Jk),
        __param(2, extensions_1.$MF)
    ], RemoteExtensionHostEnvironmentUpdater);
    let RemoteTelemetryEnablementUpdater = class RemoteTelemetryEnablementUpdater extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.c();
            this.B(b.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(telemetry_1.$dl)) {
                    this.c();
                }
            }));
        }
        c() {
            return this.a.updateTelemetryLevel((0, telemetryUtils_1.$jo)(this.b));
        }
    };
    RemoteTelemetryEnablementUpdater = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, configuration_1.$8h)
    ], RemoteTelemetryEnablementUpdater);
    let RemoteEmptyWorkbenchPresentation = class RemoteEmptyWorkbenchPresentation extends lifecycle_1.$kc {
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
        __param(0, environmentService_1.$1$b),
        __param(1, remoteAuthorityResolver_1.$Jk),
        __param(2, configuration_1.$8h),
        __param(3, commands_1.$Fr),
        __param(4, workspace_1.$Kh)
    ], RemoteEmptyWorkbenchPresentation);
    /**
     * Sets the 'wslFeatureInstalled' context key if the WSL feature is or was installed on this machine.
     */
    let WSLContextKeyInitializer = class WSLContextKeyInitializer extends lifecycle_1.$kc {
        constructor(contextKeyService, nativeHostService, storageService, lifecycleService) {
            super();
            const contextKeyId = 'wslFeatureInstalled';
            const storageKey = 'remote.wslFeatureInstalled';
            const defaultValue = storageService.getBoolean(storageKey, -1 /* StorageScope.APPLICATION */, undefined);
            const hasWSLFeatureContext = new contextkey_1.$2i(contextKeyId, !!defaultValue, nls.localize(0, null));
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
        __param(0, contextkey_1.$3i),
        __param(1, native_1.$05b),
        __param(2, storage_1.$Vo),
        __param(3, lifecycle_2.$7y)
    ], WSLContextKeyInitializer);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteAgentDiagnosticListener, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteExtensionHostEnvironmentUpdater, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteTelemetryEnablementUpdater, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteEmptyWorkbenchPresentation, 2 /* LifecyclePhase.Ready */);
    if (platform_2.$i) {
        workbenchContributionsRegistry.registerWorkbenchContribution(WSLContextKeyInitializer, 2 /* LifecyclePhase.Ready */);
    }
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
        .registerConfiguration({
        id: 'remote',
        title: nls.localize(1, null),
        type: 'object',
        properties: {
            'remote.downloadExtensionsLocally': {
                type: 'boolean',
                markdownDescription: nls.localize(2, null),
                default: false
            },
        }
    });
    if (platform_2.$j) {
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: simpleFileDialog_1.OpenLocalFileFolderCommand.ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */,
            when: simpleFileDialog_1.$03b,
            description: { description: simpleFileDialog_1.OpenLocalFileFolderCommand.LABEL, args: [] },
            handler: simpleFileDialog_1.OpenLocalFileFolderCommand.handler()
        });
    }
    else {
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: simpleFileDialog_1.OpenLocalFileCommand.ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */,
            when: simpleFileDialog_1.$03b,
            description: { description: simpleFileDialog_1.OpenLocalFileCommand.LABEL, args: [] },
            handler: simpleFileDialog_1.OpenLocalFileCommand.handler()
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: simpleFileDialog_1.OpenLocalFolderCommand.ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */),
            when: simpleFileDialog_1.$03b,
            description: { description: simpleFileDialog_1.OpenLocalFolderCommand.LABEL, args: [] },
            handler: simpleFileDialog_1.OpenLocalFolderCommand.handler()
        });
    }
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: simpleFileDialog_1.SaveLocalFileCommand.ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 49 /* KeyCode.KeyS */,
        when: simpleFileDialog_1.$03b,
        description: { description: simpleFileDialog_1.SaveLocalFileCommand.LABEL, args: [] },
        handler: simpleFileDialog_1.SaveLocalFileCommand.handler()
    });
});
//# sourceMappingURL=remote.contribution.js.map