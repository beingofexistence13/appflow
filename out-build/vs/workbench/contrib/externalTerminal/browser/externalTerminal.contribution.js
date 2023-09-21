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
define(["require", "exports", "vs/nls!vs/workbench/contrib/externalTerminal/browser/externalTerminal.contribution", "vs/platform/configuration/common/configuration", "vs/base/common/uri", "vs/platform/actions/common/actions", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/common/contextkeys", "vs/platform/files/common/files", "vs/platform/list/browser/listService", "vs/workbench/contrib/files/browser/files", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/base/common/arrays", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/contributions", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/path", "vs/platform/registry/common/platform", "vs/platform/externalTerminal/common/externalTerminal", "vs/platform/terminal/common/terminal"], function (require, exports, nls, configuration_1, uri_1, actions_1, terminal_1, contextkeys_1, files_1, listService_1, files_2, commands_1, network_1, arrays_1, editorService_1, remoteAgentService_1, contextkey_1, contributions_1, lifecycle_1, platform_1, path_1, platform_2, externalTerminal_1, terminal_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lXb = void 0;
    const OPEN_IN_TERMINAL_COMMAND_ID = 'openInTerminal';
    const OPEN_IN_INTEGRATED_TERMINAL_COMMAND_ID = 'openInIntegratedTerminal';
    function registerOpenTerminalCommand(id, explorerKind) {
        commands_1.$Gr.registerCommand({
            id: id,
            handler: async (accessor, resource) => {
                const configurationService = accessor.get(configuration_1.$8h);
                const editorService = accessor.get(editorService_1.$9C);
                const fileService = accessor.get(files_1.$6j);
                const integratedTerminalService = accessor.get(terminal_1.$Mib);
                const remoteAgentService = accessor.get(remoteAgentService_1.$jm);
                const terminalGroupService = accessor.get(terminal_1.$Oib);
                let externalTerminalService = undefined;
                try {
                    externalTerminalService = accessor.get(externalTerminal_1.$jXb);
                }
                catch {
                }
                const resources = (0, files_2.$zHb)(resource, accessor.get(listService_1.$03), editorService, accessor.get(files_2.$xHb));
                return fileService.resolveAll(resources.map(r => ({ resource: r }))).then(async (stats) => {
                    // Always use integrated terminal when using a remote
                    const config = configurationService.getValue();
                    const useIntegratedTerminal = remoteAgentService.getConnection() || explorerKind === 'integrated';
                    const targets = (0, arrays_1.$Kb)(stats.filter(data => data.success));
                    if (useIntegratedTerminal) {
                        // TODO: Use uri for cwd in createterminal
                        const opened = {};
                        const cwds = targets.map(({ stat }) => {
                            const resource = stat.resource;
                            if (stat.isDirectory) {
                                return resource;
                            }
                            return uri_1.URI.from({
                                scheme: resource.scheme,
                                authority: resource.authority,
                                fragment: resource.fragment,
                                query: resource.query,
                                path: (0, path_1.$_d)(resource.path)
                            });
                        });
                        for (const cwd of cwds) {
                            if (opened[cwd.path]) {
                                return;
                            }
                            opened[cwd.path] = true;
                            const instance = await integratedTerminalService.createTerminal({ config: { cwd } });
                            if (instance && instance.target !== terminal_2.TerminalLocation.Editor && (resources.length === 1 || !resource || cwd.path === resource.path || cwd.path === (0, path_1.$_d)(resource.path))) {
                                integratedTerminalService.setActiveInstance(instance);
                                terminalGroupService.showPanel(true);
                            }
                        }
                    }
                    else if (externalTerminalService) {
                        (0, arrays_1.$Kb)(targets.map(({ stat }) => stat.isDirectory ? stat.resource.fsPath : (0, path_1.$_d)(stat.resource.fsPath))).forEach(cwd => {
                            externalTerminalService.openTerminal(config.terminal.external, cwd);
                        });
                    }
                });
            }
        });
    }
    registerOpenTerminalCommand(OPEN_IN_TERMINAL_COMMAND_ID, 'external');
    registerOpenTerminalCommand(OPEN_IN_INTEGRATED_TERMINAL_COMMAND_ID, 'integrated');
    let $lXb = class $lXb extends lifecycle_1.$kc {
        constructor(c) {
            super();
            this.c = c;
            const shouldShowIntegratedOnLocal = contextkey_1.$Ii.and(contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.file), contextkey_1.$Ii.or(contextkey_1.$Ii.equals('config.terminal.explorerKind', 'integrated'), contextkey_1.$Ii.equals('config.terminal.explorerKind', 'both')));
            const shouldShowExternalKindOnLocal = contextkey_1.$Ii.and(contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.file), contextkey_1.$Ii.or(contextkey_1.$Ii.equals('config.terminal.explorerKind', 'external'), contextkey_1.$Ii.equals('config.terminal.explorerKind', 'both')));
            this.a = {
                group: 'navigation',
                order: 30,
                command: {
                    id: OPEN_IN_INTEGRATED_TERMINAL_COMMAND_ID,
                    title: nls.localize(0, null)
                },
                when: contextkey_1.$Ii.or(shouldShowIntegratedOnLocal, contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.vscodeRemote))
            };
            this.b = {
                group: 'navigation',
                order: 31,
                command: {
                    id: OPEN_IN_TERMINAL_COMMAND_ID,
                    title: nls.localize(1, null)
                },
                when: shouldShowExternalKindOnLocal
            };
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, this.b);
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, this.a);
            this.c.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('terminal.explorerKind') || e.affectsConfiguration('terminal.external')) {
                    this.g();
                }
            });
            this.g();
        }
        f() {
            const config = this.c.getValue().terminal;
            if (platform_1.$i && config.external?.windowsExec) {
                const file = (0, path_1.$ae)(config.external.windowsExec);
                if (file === 'wt' || file === 'wt.exe') {
                    return true;
                }
            }
            return false;
        }
        g() {
            if (this.f()) {
                this.b.command.title = nls.localize(2, null);
            }
        }
    };
    exports.$lXb = $lXb;
    exports.$lXb = $lXb = __decorate([
        __param(0, configuration_1.$8h)
    ], $lXb);
    platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($lXb, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=externalTerminal.contribution.js.map