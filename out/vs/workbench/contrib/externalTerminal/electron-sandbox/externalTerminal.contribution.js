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
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/platform/externalTerminal/common/externalTerminal", "vs/platform/actions/common/actions", "vs/workbench/services/history/common/history", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/network", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/externalTerminal/electron-sandbox/externalTerminalService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/remote/common/remoteAuthorityResolver"], function (require, exports, nls, paths, externalTerminal_1, actions_1, history_1, keybindingsRegistry_1, network_1, configurationRegistry_1, platform_1, contributions_1, externalTerminalService_1, configuration_1, terminalContextKey_1, remoteAuthorityResolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExternalTerminalContribution = void 0;
    const OPEN_NATIVE_CONSOLE_COMMAND_ID = 'workbench.action.terminal.openNativeConsole';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */,
        when: terminalContextKey_1.TerminalContextKeys.notFocus,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        handler: async (accessor) => {
            const historyService = accessor.get(history_1.IHistoryService);
            // Open external terminal in local workspaces
            const terminalService = accessor.get(externalTerminalService_1.IExternalTerminalService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const remoteAuthorityResolverService = accessor.get(remoteAuthorityResolver_1.IRemoteAuthorityResolverService);
            const root = historyService.getLastActiveWorkspaceRoot();
            const config = configurationService.getValue('terminal.external');
            // It's a local workspace, open the root
            if (root?.scheme === network_1.Schemas.file) {
                terminalService.openTerminal(config, root.fsPath);
                return;
            }
            // If it's a remote workspace, open the canonical URI if it is a local folder
            try {
                if (root?.scheme === network_1.Schemas.vscodeRemote) {
                    const canonicalUri = await remoteAuthorityResolverService.getCanonicalURI(root);
                    if (canonicalUri.scheme === network_1.Schemas.file) {
                        terminalService.openTerminal(config, canonicalUri.fsPath);
                        return;
                    }
                }
            }
            catch { }
            // Open the current file's folder if it's local or its canonical URI is local
            // Opens current file's folder, if no folder is open in editor
            const activeFile = historyService.getLastActiveFile(network_1.Schemas.file);
            if (activeFile?.scheme === network_1.Schemas.file) {
                terminalService.openTerminal(config, paths.dirname(activeFile.fsPath));
                return;
            }
            try {
                if (activeFile?.scheme === network_1.Schemas.vscodeRemote) {
                    const canonicalUri = await remoteAuthorityResolverService.getCanonicalURI(activeFile);
                    if (canonicalUri.scheme === network_1.Schemas.file) {
                        terminalService.openTerminal(config, canonicalUri.fsPath);
                        return;
                    }
                }
            }
            catch { }
            // Fallback to opening without a cwd which will end up using the local home path
            terminalService.openTerminal(config, undefined);
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
            title: { value: nls.localize('globalConsoleAction', "Open New External Terminal"), original: 'Open New External Terminal' }
        }
    });
    let ExternalTerminalContribution = class ExternalTerminalContribution {
        constructor(_externalTerminalService) {
            this._externalTerminalService = _externalTerminalService;
            this._updateConfiguration();
        }
        async _updateConfiguration() {
            const terminals = await this._externalTerminalService.getDefaultTerminalForPlatforms();
            const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            configurationRegistry.registerConfiguration({
                id: 'externalTerminal',
                order: 100,
                title: nls.localize('terminalConfigurationTitle', "External Terminal"),
                type: 'object',
                properties: {
                    'terminal.explorerKind': {
                        type: 'string',
                        enum: [
                            'integrated',
                            'external',
                            'both'
                        ],
                        enumDescriptions: [
                            nls.localize('terminal.explorerKind.integrated', "Use VS Code's integrated terminal."),
                            nls.localize('terminal.explorerKind.external', "Use the configured external terminal."),
                            nls.localize('terminal.explorerKind.both', "Use the other two together.")
                        ],
                        description: nls.localize('explorer.openInTerminalKind', "When opening a file from the Explorer in a terminal, determines what kind of terminal will be launched"),
                        default: 'integrated'
                    },
                    'terminal.sourceControlRepositoriesKind': {
                        type: 'string',
                        enum: [
                            'integrated',
                            'external',
                            'both'
                        ],
                        enumDescriptions: [
                            nls.localize('terminal.sourceControlRepositoriesKind.integrated', "Use VS Code's integrated terminal."),
                            nls.localize('terminal.sourceControlRepositoriesKind.external', "Use the configured external terminal."),
                            nls.localize('terminal.sourceControlRepositoriesKind.both', "Use the other two together.")
                        ],
                        description: nls.localize('sourceControlRepositories.openInTerminalKind', "When opening a repository from the Source Control Repositories view in a terminal, determines what kind of terminal will be launched"),
                        default: 'integrated'
                    },
                    'terminal.external.windowsExec': {
                        type: 'string',
                        description: nls.localize('terminal.external.windowsExec', "Customizes which terminal to run on Windows."),
                        default: terminals.windows,
                        scope: 1 /* ConfigurationScope.APPLICATION */
                    },
                    'terminal.external.osxExec': {
                        type: 'string',
                        description: nls.localize('terminal.external.osxExec', "Customizes which terminal application to run on macOS."),
                        default: externalTerminal_1.DEFAULT_TERMINAL_OSX,
                        scope: 1 /* ConfigurationScope.APPLICATION */
                    },
                    'terminal.external.linuxExec': {
                        type: 'string',
                        description: nls.localize('terminal.external.linuxExec', "Customizes which terminal to run on Linux."),
                        default: terminals.linux,
                        scope: 1 /* ConfigurationScope.APPLICATION */
                    }
                }
            });
        }
    };
    exports.ExternalTerminalContribution = ExternalTerminalContribution;
    exports.ExternalTerminalContribution = ExternalTerminalContribution = __decorate([
        __param(0, externalTerminalService_1.IExternalTerminalService)
    ], ExternalTerminalContribution);
    // Register workbench contributions
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExternalTerminalContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxUZXJtaW5hbC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlcm5hbFRlcm1pbmFsL2VsZWN0cm9uLXNhbmRib3gvZXh0ZXJuYWxUZXJtaW5hbC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJoRyxNQUFNLDhCQUE4QixHQUFHLDZDQUE2QyxDQUFDO0lBQ3JGLHlDQUFtQixDQUFDLGdDQUFnQyxDQUFDO1FBQ3BELEVBQUUsRUFBRSw4QkFBOEI7UUFDbEMsT0FBTyxFQUFFLG1EQUE2Qix3QkFBZTtRQUNyRCxJQUFJLEVBQUUsd0NBQW1CLENBQUMsUUFBUTtRQUNsQyxNQUFNLDZDQUFtQztRQUN6QyxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQzNCLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQWUsQ0FBQyxDQUFDO1lBQ3JELDZDQUE2QztZQUM3QyxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGtEQUF3QixDQUFDLENBQUM7WUFDL0QsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7WUFDakUsTUFBTSw4QkFBOEIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHlEQUErQixDQUFDLENBQUM7WUFDckYsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFDekQsTUFBTSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUE0QixtQkFBbUIsQ0FBQyxDQUFDO1lBRTdGLHdDQUF3QztZQUN4QyxJQUFJLElBQUksRUFBRSxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xDLGVBQWUsQ0FB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