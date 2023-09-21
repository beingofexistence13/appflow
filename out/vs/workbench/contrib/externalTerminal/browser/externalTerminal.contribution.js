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
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configuration", "vs/base/common/uri", "vs/platform/actions/common/actions", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/common/contextkeys", "vs/platform/files/common/files", "vs/platform/list/browser/listService", "vs/workbench/contrib/files/browser/files", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/base/common/arrays", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/contributions", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/path", "vs/platform/registry/common/platform", "vs/platform/externalTerminal/common/externalTerminal", "vs/platform/terminal/common/terminal"], function (require, exports, nls, configuration_1, uri_1, actions_1, terminal_1, contextkeys_1, files_1, listService_1, files_2, commands_1, network_1, arrays_1, editorService_1, remoteAgentService_1, contextkey_1, contributions_1, lifecycle_1, platform_1, path_1, platform_2, externalTerminal_1, terminal_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExternalTerminalContribution = void 0;
    const OPEN_IN_TERMINAL_COMMAND_ID = 'openInTerminal';
    const OPEN_IN_INTEGRATED_TERMINAL_COMMAND_ID = 'openInIntegratedTerminal';
    function registerOpenTerminalCommand(id, explorerKind) {
        commands_1.CommandsRegistry.registerCommand({
            id: id,
            handler: async (accessor, resource) => {
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                const editorService = accessor.get(editorService_1.IEditorService);
                const fileService = accessor.get(files_1.IFileService);
                const integratedTerminalService = accessor.get(terminal_1.ITerminalService);
                const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
                const terminalGroupService = accessor.get(terminal_1.ITerminalGroupService);
                let externalTerminalService = undefined;
                try {
                    externalTerminalService = accessor.get(externalTerminal_1.IExternalTerminalService);
                }
                catch {
                }
                const resources = (0, files_2.getMultiSelectedResources)(resource, accessor.get(listService_1.IListService), editorService, accessor.get(files_2.IExplorerService));
                return fileService.resolveAll(resources.map(r => ({ resource: r }))).then(async (stats) => {
                    // Always use integrated terminal when using a remote
                    const config = configurationService.getValue();
                    const useIntegratedTerminal = remoteAgentService.getConnection() || explorerKind === 'integrated';
                    const targets = (0, arrays_1.distinct)(stats.filter(data => data.success));
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
                                path: (0, path_1.dirname)(resource.path)
                            });
                        });
                        for (const cwd of cwds) {
                            if (opened[cwd.path]) {
                                return;
                            }
                            opened[cwd.path] = true;
                            const instance = await integratedTerminalService.createTerminal({ config: { cwd } });
                            if (instance && instance.target !== terminal_2.TerminalLocation.Editor && (resources.length === 1 || !resource || cwd.path === resource.path || cwd.path === (0, path_1.dirname)(resource.path))) {
                                integratedTerminalService.setActiveInstance(instance);
                                terminalGroupService.showPanel(true);
                            }
                        }
                    }
                    else if (externalTerminalService) {
                        (0, arrays_1.distinct)(targets.map(({ stat }) => stat.isDirectory ? stat.resource.fsPath : (0, path_1.dirname)(stat.resource.fsPath))).forEach(cwd => {
                            externalTerminalService.openTerminal(config.terminal.external, cwd);
                        });
                    }
                });
            }
        });
    }
    registerOpenTerminalCommand(OPEN_IN_TERMINAL_COMMAND_ID, 'external');
    registerOpenTerminalCommand(OPEN_IN_INTEGRATED_TERMINAL_COMMAND_ID, 'integrated');
    let ExternalTerminalContribution = class ExternalTerminalContribution extends lifecycle_1.Disposable {
        constructor(_configurationService) {
            super();
            this._configurationService = _configurationService;
            const shouldShowIntegratedOnLocal = contextkey_1.ContextKeyExpr.and(contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.terminal.explorerKind', 'integrated'), contextkey_1.ContextKeyExpr.equals('config.terminal.explorerKind', 'both')));
            const shouldShowExternalKindOnLocal = contextkey_1.ContextKeyExpr.and(contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.terminal.explorerKind', 'external'), contextkey_1.ContextKeyExpr.equals('config.terminal.explorerKind', 'both')));
            this._openInIntegratedTerminalMenuItem = {
                group: 'navigation',
                order: 30,
                command: {
                    id: OPEN_IN_INTEGRATED_TERMINAL_COMMAND_ID,
                    title: nls.localize('scopedConsoleAction.Integrated', "Open in Integrated Terminal")
                },
                when: contextkey_1.ContextKeyExpr.or(shouldShowIntegratedOnLocal, contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.vscodeRemote))
            };
            this._openInTerminalMenuItem = {
                group: 'navigation',
                order: 31,
                command: {
                    id: OPEN_IN_TERMINAL_COMMAND_ID,
                    title: nls.localize('scopedConsoleAction.external', "Open in External Terminal")
                },
                when: shouldShowExternalKindOnLocal
            };
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, this._openInTerminalMenuItem);
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, this._openInIntegratedTerminalMenuItem);
            this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('terminal.explorerKind') || e.affectsConfiguration('terminal.external')) {
                    this._refreshOpenInTerminalMenuItemTitle();
                }
            });
            this._refreshOpenInTerminalMenuItemTitle();
        }
        isWindows() {
            const config = this._configurationService.getValue().terminal;
            if (platform_1.isWindows && config.external?.windowsExec) {
                const file = (0, path_1.basename)(config.external.windowsExec);
                if (file === 'wt' || file === 'wt.exe') {
                    return true;
                }
            }
            return false;
        }
        _refreshOpenInTerminalMenuItemTitle() {
            if (this.isWindows()) {
                this._openInTerminalMenuItem.command.title = nls.localize('scopedConsoleAction.wt', "Open in Windows Terminal");
            }
        }
    };
    exports.ExternalTerminalContribution = ExternalTerminalContribution;
    exports.ExternalTerminalContribution = ExternalTerminalContribution = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], ExternalTerminalContribution);
    platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ExternalTerminalContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxUZXJtaW5hbC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlcm5hbFRlcm1pbmFsL2Jyb3dzZXIvZXh0ZXJuYWxUZXJtaW5hbC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMEJoRyxNQUFNLDJCQUEyQixHQUFHLGdCQUFnQixDQUFDO0lBQ3JELE1BQU0sc0NBQXNDLEdBQUcsMEJBQTBCLENBQUM7SUFFMUUsU0FBUywyQkFBMkIsQ0FBQyxFQUFVLEVBQUUsWUFBdUM7UUFDdkYsMkJBQWdCLENBQUMsZUFBZSxDQUFDO1lBQ2hDLEVBQUUsRUFBRSxFQUFFO1lBQ04sT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBYSxFQUFFLEVBQUU7Z0JBRTFDLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxDQUFDLENBQUM7Z0JBQy9DLE1BQU0seUJBQXlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBMEIsQ0FBQyxDQUFDO2dCQUMzRSxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0NBQW1CLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGdDQUFxQixDQUFDLENBQUM7Z0JBQ2pFLElBQUksdUJBQXVCLEdBQXlDLFNBQVMsQ0FBQztnQkFDOUUsSUFBSTtvQkFDSCx1QkFBdUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJD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