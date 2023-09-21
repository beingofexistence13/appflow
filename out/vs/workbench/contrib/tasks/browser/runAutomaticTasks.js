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
define(["require", "exports", "vs/nls", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/contrib/tasks/common/tasks", "vs/platform/quickinput/common/quickInput", "vs/platform/actions/common/actions", "vs/platform/workspace/common/workspaceTrust", "vs/platform/configuration/common/configuration", "vs/base/common/event", "vs/platform/log/common/log"], function (require, exports, nls, resources, lifecycle_1, taskService_1, tasks_1, quickInput_1, actions_1, workspaceTrust_1, configuration_1, event_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ManageAutomaticTaskRunning = exports.RunAutomaticTasks = void 0;
    const ALLOW_AUTOMATIC_TASKS = 'task.allowAutomaticTasks';
    let RunAutomaticTasks = class RunAutomaticTasks extends lifecycle_1.Disposable {
        constructor(_taskService, _configurationService, _workspaceTrustManagementService, _logService) {
            super();
            this._taskService = _taskService;
            this._configurationService = _configurationService;
            this._workspaceTrustManagementService = _workspaceTrustManagementService;
            this._logService = _logService;
            this._hasRunTasks = false;
            if (this._taskService.isReconnected) {
                this._tryRunTasks();
            }
            else {
                this._register(event_1.Event.once(this._taskService.onDidReconnectToTasks)(async () => await this._tryRunTasks()));
            }
            this._register(this._workspaceTrustManagementService.onDidChangeTrust(async () => await this._tryRunTasks()));
        }
        async _tryRunTasks() {
            if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
                return;
            }
            if (this._hasRunTasks || this._configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === 'off') {
                return;
            }
            this._hasRunTasks = true;
            this._logService.trace('RunAutomaticTasks: Trying to run tasks.');
            // Wait until we have task system info (the extension host and workspace folders are available).
            if (!this._taskService.hasTaskSystemInfo) {
                this._logService.trace('RunAutomaticTasks: Awaiting task system info.');
                await event_1.Event.toPromise(event_1.Event.once(this._taskService.onDidChangeTaskSystemInfo));
            }
            const workspaceTasks = await this._taskService.getWorkspaceTasks(2 /* TaskRunSource.FolderOpen */);
            this._logService.trace(`RunAutomaticTasks: Found ${workspaceTasks.size} automatic tasks`);
            await this._runWithPermission(this._taskService, this._configurationService, workspaceTasks);
        }
        _runTasks(taskService, tasks) {
            tasks.forEach(task => {
                if (task instanceof Promise) {
                    task.then(promiseResult => {
                        if (promiseResult) {
                            taskService.run(promiseResult);
                        }
                    });
                }
                else {
                    taskService.run(task);
                }
            });
        }
        _getTaskSource(source) {
            const taskKind = tasks_1.TaskSourceKind.toConfigurationTarget(source.kind);
            switch (taskKind) {
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */: {
                    return resources.joinPath(source.config.workspaceFolder.uri, source.config.file);
                }
                case 5 /* ConfigurationTarget.WORKSPACE */: {
                    return source.config.workspace?.configuration ?? undefined;
                }
            }
            return undefined;
        }
        _findAutoTasks(taskService, workspaceTaskResult) {
            const tasks = new Array();
            const taskNames = new Array();
            const locations = new Map();
            if (workspaceTaskResult) {
                workspaceTaskResult.forEach(resultElement => {
                    if (resultElement.set) {
                        resultElement.set.tasks.forEach(task => {
                            if (task.runOptions.runOn === tasks_1.RunOnOptions.folderOpen) {
                                tasks.push(task);
                                taskNames.push(task._label);
                                const location = this._getTaskSource(task._source);
                                if (location) {
                                    locations.set(location.fsPath, location);
                                }
                            }
                        });
                    }
                    if (resultElement.configurations) {
                        for (const configuredTask of Object.values(resultElement.configurations.byIdentifier)) {
                            if (configuredTask.runOptions.runOn === tasks_1.RunOnOptions.folderOpen) {
                                tasks.push(new Promise(resolve => {
                                    taskService.getTask(resultElement.workspaceFolder, configuredTask._id, true).then(task => resolve(task));
                                }));
                                if (configuredTask._label) {
                                    taskNames.push(configuredTask._label);
                                }
                                else {
                                    taskNames.push(configuredTask.configures.task);
                                }
                                const location = this._getTaskSource(configuredTask._source);
                                if (location) {
                                    locations.set(location.fsPath, location);
                                }
                            }
                        }
                    }
                });
            }
            return { tasks, taskNames, locations };
        }
        async _runWithPermission(taskService, configurationService, workspaceTaskResult) {
            const { tasks, taskNames } = this._findAutoTasks(taskService, workspaceTaskResult);
            if (taskNames.length === 0) {
                return;
            }
            if (configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === 'off') {
                return;
            }
            this._runTasks(taskService, tasks);
        }
    };
    exports.RunAutomaticTasks = RunAutomaticTasks;
    exports.RunAutomaticTasks = RunAutomaticTasks = __decorate([
        __param(0, taskService_1.ITaskService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(3, log_1.ILogService)
    ], RunAutomaticTasks);
    class ManageAutomaticTaskRunning extends actions_1.Action2 {
        static { this.ID = 'workbench.action.tasks.manageAutomaticRunning'; }
        static { this.LABEL = nls.localize('workbench.action.tasks.manageAutomaticRunning', "Manage Automatic Tasks"); }
        constructor() {
            super({
                id: ManageAutomaticTaskRunning.ID,
                title: ManageAutomaticTaskRunning.LABEL,
                category: tasks_1.TASKS_CATEGORY
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const allowItem = { label: nls.localize('workbench.action.tasks.allowAutomaticTasks', "Allow Automatic Tasks") };
            const disallowItem = { label: nls.localize('workbench.action.tasks.disallowAutomaticTasks', "Disallow Automatic Tasks") };
            const value = await quickInputService.pick([allowItem, disallowItem], { canPickMany: false });
            if (!value) {
                return;
            }
            configurationService.updateValue(ALLOW_AUTOMATIC_TASKS, value === allowItem ? 'on' : 'off', 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.ManageAutomaticTaskRunning = ManageAutomaticTaskRunning;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuQXV0b21hdGljVGFza3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YXNrcy9icm93c2VyL3J1bkF1dG9tYXRpY1Rhc2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCaEcsTUFBTSxxQkFBcUIsR0FBRywwQkFBMEIsQ0FBQztJQUVsRCxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHNCQUFVO1FBRWhELFlBQ2UsWUFBMkMsRUFDbEMscUJBQTZELEVBQ2xELGdDQUFtRixFQUN4RyxXQUF5QztZQUN0RCxLQUFLLEVBQUUsQ0FBQztZQUp1QixpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUNqQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ2pDLHFDQUFnQyxHQUFoQyxnQ0FBZ0MsQ0FBa0M7WUFDdkYsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFML0MsaUJBQVksR0FBWSxLQUFLLENBQUM7WUFPckMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3BCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDM0c7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvRyxDQUFDO1FBRU8sS0FBSyxDQUFDLFlBQVk7WUFD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