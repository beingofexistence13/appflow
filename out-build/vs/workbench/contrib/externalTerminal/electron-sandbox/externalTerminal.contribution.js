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
define(["require", "exports", "vs/nls!vs/workbench/contrib/externalTerminal/electron-sandbox/externalTerminal.contribution", "vs/base/common/path", "vs/platform/externalTerminal/common/externalTerminal", "vs/platform/actions/common/actions", "vs/workbench/services/history/common/history", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/network", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/externalTerminal/electron-sandbox/externalTerminalService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/remote/common/remoteAuthorityResolver"], function (require, exports, nls, paths, externalTerminal_1, actions_1, history_1, keybindingsRegistry_1, network_1, configurationRegistry_1, platform_1, contributions_1, externalTerminalService_1, configuration_1, terminalContextKey_1, remoteAuthorityResolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Tac = void 0;
    const OPEN_NATIVE_CONSOLE_COMMAND_ID = 'workbench.action.terminal.openNativeConsole';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */,
        when: terminalContextKey_1.TerminalContextKeys.notFocus,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        handler: async (accessor) => {
            const historyService = accessor.get(history_1.$SM);
            // Open external terminal in local workspaces
            const terminalService = accessor.get(externalTerminalService_1.$v$b);
            const configurationService = accessor.get(configuration_1.$8h);
            const remoteAuthorityResolverService = accessor.get(remoteAuthorityResolver_1.$Jk);
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
                terminalService.openTerminal(config, paths.$_d(activeFile.fsPath));
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
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
            title: { value: nls.localize(0, null), original: 'Open New External Terminal' }
        }
    });
    let $Tac = class $Tac {
        constructor(a) {
            this.a = a;
            this.b();
        }
        async b() {
            const terminals = await this.a.getDefaultTerminalForPlatforms();
            const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            configurationRegistry.registerConfiguration({
                id: 'externalTerminal',
                order: 100,
                title: nls.localize(1, null),
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
                            nls.localize(2, null),
                            nls.localize(3, null),
                            nls.localize(4, null)
                        ],
                        description: nls.localize(5, null),
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
                            nls.localize(6, null),
                            nls.localize(7, null),
                            nls.localize(8, null)
                        ],
                        description: nls.localize(9, null),
                        default: 'integrated'
                    },
                    'terminal.external.windowsExec': {
                        type: 'string',
                        description: nls.localize(10, null),
                        default: terminals.windows,
                        scope: 1 /* ConfigurationScope.APPLICATION */
                    },
                    'terminal.external.osxExec': {
                        type: 'string',
                        description: nls.localize(11, null),
                        default: externalTerminal_1.$kXb,
                        scope: 1 /* ConfigurationScope.APPLICATION */
                    },
                    'terminal.external.linuxExec': {
                        type: 'string',
                        description: nls.localize(12, null),
                        default: terminals.linux,
                        scope: 1 /* ConfigurationScope.APPLICATION */
                    }
                }
            });
        }
    };
    exports.$Tac = $Tac;
    exports.$Tac = $Tac = __decorate([
        __param(0, externalTerminalService_1.$v$b)
    ], $Tac);
    // Register workbench contributions
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution($Tac, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=externalTerminal.contribution.js.map