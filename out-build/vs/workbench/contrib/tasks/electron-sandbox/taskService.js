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
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/electron-sandbox/taskService", "vs/base/common/semver/semver", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/browser/abstractTaskService", "vs/workbench/contrib/tasks/common/taskService", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/tasks/browser/terminalTaskSystem", "vs/platform/dialogs/common/dialogs", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/markers/common/markers", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/workbench/common/views", "vs/workbench/services/output/common/output", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/path/common/pathService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/textfile/common/textfiles", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/theme/common/themeService", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, nls, semver, workspace_1, tasks_1, abstractTaskService_1, taskService_1, extensions_1, terminalTaskSystem_1, dialogs_1, model_1, resolverService_1, commands_1, configuration_1, contextkey_1, files_1, log_1, markers_1, notification_1, opener_1, progress_1, quickInput_1, storage_1, telemetry_1, views_1, output_1, terminal_1, configurationResolver_1, editorService_1, environmentService_1, extensions_2, lifecycle_1, pathService_1, preferences_1, textfiles_1, workspaceTrust_1, terminal_2, panecomposite_1, themeService_1, instantiation_1, remoteAgentService_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Sac = void 0;
    let $Sac = class $Sac extends abstractTaskService_1.$LXb {
        constructor(configurationService, markerService, outputService, paneCompositeService, viewsService, commandService, editorService, fileService, contextService, telemetryService, textFileService, lifecycleService, modelService, extensionService, quickInputService, configurationResolverService, terminalService, terminalGroupService, storageService, progressService, openerService, dialogService, notificationService, contextKeyService, environmentService, terminalProfileResolverService, pathService, textModelResolverService, preferencesService, viewDescriptorService, workspaceTrustRequestService, workspaceTrustManagementService, logService, themeService, instantiationService, remoteAgentService, audioCueService) {
            super(configurationService, markerService, outputService, paneCompositeService, viewsService, commandService, editorService, fileService, contextService, telemetryService, textFileService, modelService, extensionService, quickInputService, configurationResolverService, terminalService, terminalGroupService, storageService, progressService, openerService, dialogService, notificationService, contextKeyService, environmentService, terminalProfileResolverService, pathService, textModelResolverService, preferencesService, viewDescriptorService, workspaceTrustRequestService, workspaceTrustManagementService, logService, themeService, lifecycleService, remoteAgentService, instantiationService);
            this.B(lifecycleService.onBeforeShutdown(event => event.veto(this.beforeShutdown(), 'veto.tasks')));
        }
        Ic() {
            if (this.I) {
                return this.I;
            }
            const taskSystem = this.Hc();
            this.I = taskSystem;
            this.J =
                [
                    this.I.onDidStateChange((event) => {
                        this.O.set(this.I.isActiveSync());
                        this.Q.fire(event);
                    })
                ];
            return this.I;
        }
        Xc(workspaceFolder) {
            const { config, hasParseErrors } = this.ad(workspaceFolder);
            if (hasParseErrors) {
                return Promise.resolve({ workspaceFolder: workspaceFolder, hasErrors: true, config: undefined });
            }
            if (config) {
                return Promise.resolve({ workspaceFolder, config, hasErrors: false });
            }
            else {
                return Promise.resolve({ workspaceFolder: workspaceFolder, hasErrors: true, config: undefined });
            }
        }
        Xb(filter) {
            const range = filter && filter.version ? filter.version : undefined;
            const engine = this.Mb;
            return (range === undefined) || ((semver.satisfies('0.1.0', range) && engine === tasks_1.ExecutionEngine.Process) || (semver.satisfies('2.0.0', range) && engine === tasks_1.ExecutionEngine.Terminal));
        }
        beforeShutdown() {
            if (!this.I) {
                return false;
            }
            if (!this.I.isActiveSync()) {
                return false;
            }
            // The terminal service kills all terminal on shutdown. So there
            // is nothing we can do to prevent this here.
            if (this.I instanceof terminalTaskSystem_1.$FXb) {
                return false;
            }
            let terminatePromise;
            if (this.I.canAutoTerminate()) {
                terminatePromise = Promise.resolve({ confirmed: true });
            }
            else {
                terminatePromise = this.sb.confirm({
                    message: nls.localize(0, null),
                    primaryButton: nls.localize(1, null)
                });
            }
            return terminatePromise.then(res => {
                if (res.confirmed) {
                    return this.I.terminateAll().then((responses) => {
                        let success = true;
                        let code = undefined;
                        for (const response of responses) {
                            success = success && response.success;
                            // We only have a code in the old output runner which only has one task
                            // So we can use the first code.
                            if (code === undefined && response.code !== undefined) {
                                code = response.code;
                            }
                        }
                        if (success) {
                            this.I = undefined;
                            this.Tb();
                            return false; // no veto
                        }
                        else if (code && code === 3 /* TerminateResponseCode.ProcessNotFound */) {
                            return this.sb.confirm({
                                message: nls.localize(2, null),
                                primaryButton: nls.localize(3, null),
                                type: 'info'
                            }).then(res => !res.confirmed);
                        }
                        return true; // veto
                    }, (err) => {
                        return true; // veto
                    });
                }
                return true; // veto
            });
        }
    };
    exports.$Sac = $Sac;
    exports.$Sac = $Sac = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, markers_1.$3s),
        __param(2, output_1.$eJ),
        __param(3, panecomposite_1.$Yeb),
        __param(4, views_1.$$E),
        __param(5, commands_1.$Fr),
        __param(6, editorService_1.$9C),
        __param(7, files_1.$6j),
        __param(8, workspace_1.$Kh),
        __param(9, telemetry_1.$9k),
        __param(10, textfiles_1.$JD),
        __param(11, lifecycle_1.$7y),
        __param(12, model_1.$yA),
        __param(13, extensions_2.$MF),
        __param(14, quickInput_1.$Gq),
        __param(15, configurationResolver_1.$NM),
        __param(16, terminal_1.$Mib),
        __param(17, terminal_1.$Oib),
        __param(18, storage_1.$Vo),
        __param(19, progress_1.$2u),
        __param(20, opener_1.$NT),
        __param(21, dialogs_1.$oA),
        __param(22, notification_1.$Yu),
        __param(23, contextkey_1.$3i),
        __param(24, environmentService_1.$hJ),
        __param(25, terminal_2.$EM),
        __param(26, pathService_1.$yJ),
        __param(27, resolverService_1.$uA),
        __param(28, preferences_1.$BE),
        __param(29, views_1.$_E),
        __param(30, workspaceTrust_1.$_z),
        __param(31, workspaceTrust_1.$$z),
        __param(32, log_1.$5i),
        __param(33, themeService_1.$gv),
        __param(34, instantiation_1.$Ah),
        __param(35, remoteAgentService_1.$jm),
        __param(36, audioCueService_1.$sZ)
    ], $Sac);
    (0, extensions_1.$mr)(taskService_1.$osb, $Sac, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=taskService.js.map