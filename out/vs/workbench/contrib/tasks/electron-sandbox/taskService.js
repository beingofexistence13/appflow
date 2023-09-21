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
define(["require", "exports", "vs/nls", "vs/base/common/semver/semver", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/browser/abstractTaskService", "vs/workbench/contrib/tasks/common/taskService", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/tasks/browser/terminalTaskSystem", "vs/platform/dialogs/common/dialogs", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/markers/common/markers", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/workbench/common/views", "vs/workbench/services/output/common/output", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/path/common/pathService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/textfile/common/textfiles", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/theme/common/themeService", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, nls, semver, workspace_1, tasks_1, abstractTaskService_1, taskService_1, extensions_1, terminalTaskSystem_1, dialogs_1, model_1, resolverService_1, commands_1, configuration_1, contextkey_1, files_1, log_1, markers_1, notification_1, opener_1, progress_1, quickInput_1, storage_1, telemetry_1, views_1, output_1, terminal_1, configurationResolver_1, editorService_1, environmentService_1, extensions_2, lifecycle_1, pathService_1, preferences_1, textfiles_1, workspaceTrust_1, terminal_2, panecomposite_1, themeService_1, instantiation_1, remoteAgentService_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskService = void 0;
    let TaskService = class TaskService extends abstractTaskService_1.AbstractTaskService {
        constructor(configurationService, markerService, outputService, paneCompositeService, viewsService, commandService, editorService, fileService, contextService, telemetryService, textFileService, lifecycleService, modelService, extensionService, quickInputService, configurationResolverService, terminalService, terminalGroupService, storageService, progressService, openerService, dialogService, notificationService, contextKeyService, environmentService, terminalProfileResolverService, pathService, textModelResolverService, preferencesService, viewDescriptorService, workspaceTrustRequestService, workspaceTrustManagementService, logService, themeService, instantiationService, remoteAgentService, audioCueService) {
            super(configurationService, markerService, outputService, paneCompositeService, viewsService, commandService, editorService, fileService, contextService, telemetryService, textFileService, modelService, extensionService, quickInputService, configurationResolverService, terminalService, terminalGroupService, storageService, progressService, openerService, dialogService, notificationService, contextKeyService, environmentService, terminalProfileResolverService, pathService, textModelResolverService, preferencesService, viewDescriptorService, workspaceTrustRequestService, workspaceTrustManagementService, logService, themeService, lifecycleService, remoteAgentService, instantiationService);
            this._register(lifecycleService.onBeforeShutdown(event => event.veto(this.beforeShutdown(), 'veto.tasks')));
        }
        _getTaskSystem() {
            if (this._taskSystem) {
                return this._taskSystem;
            }
            const taskSystem = this._createTerminalTaskSystem();
            this._taskSystem = taskSystem;
            this._taskSystemListeners =
                [
                    this._taskSystem.onDidStateChange((event) => {
                        this._taskRunningState.set(this._taskSystem.isActiveSync());
                        this._onDidStateChange.fire(event);
                    })
                ];
            return this._taskSystem;
        }
        _computeLegacyConfiguration(workspaceFolder) {
            const { config, hasParseErrors } = this._getConfiguration(workspaceFolder);
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
        _versionAndEngineCompatible(filter) {
            const range = filter && filter.version ? filter.version : undefined;
            const engine = this.executionEngine;
            return (range === undefined) || ((semver.satisfies('0.1.0', range) && engine === tasks_1.ExecutionEngine.Process) || (semver.satisfies('2.0.0', range) && engine === tasks_1.ExecutionEngine.Terminal));
        }
        beforeShutdown() {
            if (!this._taskSystem) {
                return false;
            }
            if (!this._taskSystem.isActiveSync()) {
                return false;
            }
            // The terminal service kills all terminal on shutdown. So there
            // is nothing we can do to prevent this here.
            if (this._taskSystem instanceof terminalTaskSystem_1.TerminalTaskSystem) {
                return false;
            }
            let terminatePromise;
            if (this._taskSystem.canAutoTerminate()) {
                terminatePromise = Promise.resolve({ confirmed: true });
            }
            else {
                terminatePromise = this._dialogService.confirm({
                    message: nls.localize('TaskSystem.runningTask', 'There is a task running. Do you want to terminate it?'),
                    primaryButton: nls.localize({ key: 'TaskSystem.terminateTask', comment: ['&& denotes a mnemonic'] }, "&&Terminate Task")
                });
            }
            return terminatePromise.then(res => {
                if (res.confirmed) {
                    return this._taskSystem.terminateAll().then((responses) => {
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
                            this._taskSystem = undefined;
                            this._disposeTaskSystemListeners();
                            return false; // no veto
                        }
                        else if (code && code === 3 /* TerminateResponseCode.ProcessNotFound */) {
                            return this._dialogService.confirm({
                                message: nls.localize('TaskSystem.noProcess', 'The launched task doesn\'t exist anymore. If the task spawned background processes exiting VS Code might result in orphaned processes. To avoid this start the last background process with a wait flag.'),
                                primaryButton: nls.localize({ key: 'TaskSystem.exitAnyways', comment: ['&& denotes a mnemonic'] }, "&&Exit Anyways"),
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
    exports.TaskService = TaskService;
    exports.TaskService = TaskService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, markers_1.IMarkerService),
        __param(2, output_1.IOutputService),
        __param(3, panecomposite_1.IPaneCompositePartService),
        __param(4, views_1.IViewsService),
        __param(5, commands_1.ICommandService),
        __param(6, editorService_1.IEditorService),
        __param(7, files_1.IFileService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, textfiles_1.ITextFileService),
        __param(11, lifecycle_1.ILifecycleService),
        __param(12, model_1.IModelService),
        __param(13, extensions_2.IExtensionService),
        __param(14, quickInput_1.IQuickInputService),
        __param(15, configurationResolver_1.IConfigurationResolverService),
        __param(16, terminal_1.ITerminalService),
        __param(17, terminal_1.ITerminalGroupService),
        __param(18, storage_1.IStorageService),
        __param(19, progress_1.IProgressService),
        __param(20, opener_1.IOpenerService),
        __param(21, dialogs_1.IDialogService),
        __param(22, notification_1.INotificationService),
        __param(23, contextkey_1.IContextKeyService),
        __param(24, environmentService_1.IWorkbenchEnvironmentService),
        __param(25, terminal_2.ITerminalProfileResolverService),
        __param(26, pathService_1.IPathService),
        __param(27, resolverService_1.ITextModelService),
        __param(28, preferences_1.IPreferencesService),
        __param(29, views_1.IViewDescriptorService),
        __param(30, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(31, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(32, log_1.ILogService),
        __param(33, themeService_1.IThemeService),
        __param(34, instantiation_1.IInstantiationService),
        __param(35, remoteAgentService_1.IRemoteAgentService),
        __param(36, audioCueService_1.IAudioCueService)
    ], TaskService);
    (0, extensions_1.registerSingleton)(taskService_1.ITaskService, TaskService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YXNrcy9lbGVjdHJvbi1zYW5kYm94L3Rhc2tTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFEekYsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLHlDQUFtQjtRQUNuRCxZQUFtQyxvQkFBMkMsRUFDN0QsYUFBNkIsRUFDN0IsYUFBNkIsRUFDbEIsb0JBQStDLEVBQzNELFlBQTJCLEVBQ3pCLGNBQStCLEVBQ2hDLGFBQTZCLEVBQy9CLFdBQXlCLEVBQ2IsY0FBd0MsRUFDL0MsZ0JBQW1DLEVBQ3BDLGVBQWlDLEVBQ2hDLGdCQUFtQyxFQUN2QyxZQUEyQixFQUN2QixnQkFBbUMsRUFDbEMsaUJBQXFDLEVBQzFCLDRCQUEyRCxFQUN4RSxlQUFpQyxFQUM1QixvQkFBMkMsRUFDakQsY0FBK0IsRUFDOUIsZUFBaUMsRUFDbkMsYUFBNkIsRUFDN0IsYUFBNkIsRUFDdkIsbUJBQXlDLEVBQzNDLGlCQUFxQyxFQUMzQixrQkFBZ0QsRUFDN0MsOEJBQStELEVBQ2xGLFdBQXlCLEVBQ3BCLHdCQUEyQyxFQUN6QyxrQkFBdUMsRUFDcEMscUJBQTZDLEVBQ3RDLDRCQUEyRCxFQUN4RCwrQkFBaUUsRUFDdEYsVUFBdUIsRUFDckIsWUFBMkIsRUFDbkIsb0JBQTJDLEVBQzdDLGtCQUF1QyxFQUMxQyxlQUFpQztZQUVuRCxLQUFLLENBQUMsb0JBQW9CLEVBQ3pCLGFBQWEsRUFDYixhQUFhLEVBQ2Isb0JBQW9CLEVBQ3BCLFlBQVksRUFDWixjQUFjLEVBQ2QsYUFBYSxFQUNiLFdBQVcsRUFDWCxjQUFjLEVBQ2QsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZixZQUFZLEVBQ1osZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQiw0QkFBNEIsRUFD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