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
define(["require", "exports", "vs/nls", "vs/base/common/severity", "vs/workbench/contrib/markers/common/markers", "vs/workbench/contrib/tasks/common/taskService", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/markers/common/markers", "vs/workbench/common/views", "vs/platform/storage/common/storage", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/workbench/contrib/debug/browser/debugCommands", "vs/platform/commands/common/commands"], function (require, exports, nls, severity_1, markers_1, taskService_1, configuration_1, dialogs_1, markers_2, views_1, storage_1, errorMessage_1, actions_1, debugCommands_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugTaskRunner = exports.TaskRunResult = void 0;
    function once(match, event) {
        return (listener, thisArgs = null, disposables) => {
            const result = event(e => {
                if (match(e)) {
                    result.dispose();
                    return listener.call(thisArgs, e);
                }
            }, null, disposables);
            return result;
        };
    }
    var TaskRunResult;
    (function (TaskRunResult) {
        TaskRunResult[TaskRunResult["Failure"] = 0] = "Failure";
        TaskRunResult[TaskRunResult["Success"] = 1] = "Success";
    })(TaskRunResult || (exports.TaskRunResult = TaskRunResult = {}));
    const DEBUG_TASK_ERROR_CHOICE_KEY = 'debug.taskerrorchoice';
    let DebugTaskRunner = class DebugTaskRunner {
        constructor(taskService, markerService, configurationService, viewsService, dialogService, storageService, commandService) {
            this.taskService = taskService;
            this.markerService = markerService;
            this.configurationService = configurationService;
            this.viewsService = viewsService;
            this.dialogService = dialogService;
            this.storageService = storageService;
            this.commandService = commandService;
            this.canceled = false;
        }
        cancel() {
            this.canceled = true;
        }
        async runTaskAndCheckErrors(root, taskId) {
            try {
                this.canceled = false;
                const taskSummary = await this.runTask(root, taskId);
                if (this.canceled || (taskSummary && taskSummary.exitCode === undefined)) {
                    // User canceled, either debugging, or the prelaunch task
                    return 0 /* TaskRunResult.Failure */;
                }
                const errorCount = taskId ? this.markerService.read({ severities: markers_2.MarkerSeverity.Error, take: 2 }).length : 0;
                const successExitCode = taskSummary && taskSummary.exitCode === 0;
                const failureExitCode = taskSummary && taskSummary.exitCode !== 0;
                const onTaskErrors = this.configurationService.getValue('debug').onTaskErrors;
                if (successExitCode || onTaskErrors === 'debugAnyway' || (errorCount === 0 && !failureExitCode)) {
                    return 1 /* TaskRunResult.Success */;
                }
                if (onTaskErrors === 'showErrors') {
                    await this.viewsService.openView(markers_1.Markers.MARKERS_VIEW_ID, true);
                    return Promise.resolve(0 /* TaskRunResult.Failure */);
                }
                if (onTaskErrors === 'abort') {
                    return Promise.resolve(0 /* TaskRunResult.Failure */);
                }
                const taskLabel = typeof taskId === 'string' ? taskId : taskId ? taskId.name : '';
                const message = errorCount > 1
                    ? nls.localize('preLaunchTaskErrors', "Errors exist after running preLaunchTask '{0}'.", taskLabel)
                    : errorCount === 1
                        ? nls.localize('preLaunchTaskError', "Error exists after running preLaunchTask '{0}'.", taskLabel)
                        : taskSummary && typeof taskSummary.exitCode === 'number'
                            ? nls.localize('preLaunchTaskExitCode', "The preLaunchTask '{0}' terminated with exit code {1}.", taskLabel, taskSummary.exitCode)
                            : nls.localize('preLaunchTaskTerminated', "The preLaunchTask '{0}' terminated.", taskLabel);
                let DebugChoice;
                (function (DebugChoice) {
                    DebugChoice[DebugChoice["DebugAnyway"] = 1] = "DebugAnyway";
                    DebugChoice[DebugChoice["ShowErrors"] = 2] = "ShowErrors";
                    DebugChoice[DebugChoice["Cancel"] = 0] = "Cancel";
                })(DebugChoice || (DebugChoice = {}));
                const { result, checkboxChecked } = await this.dialogService.prompt({
                    type: severity_1.default.Warning,
                    message,
                    buttons: [
                        {
                            label: nls.localize({ key: 'debugAnyway', comment: ['&& denotes a mnemonic'] }, "&&Debug Anyway"),
                            run: () => DebugChoice.DebugAnyway
                        },
                        {
                            label: nls.localize({ key: 'showErrors', comment: ['&& denotes a mnemonic'] }, "&&Show Errors"),
                            run: () => DebugChoice.ShowErrors
                        }
                    ],
                    cancelButton: {
                        label: nls.localize('abort', "Abort"),
                        run: () => DebugChoice.Cancel
                    },
                    checkbox: {
                        label: nls.localize('remember', "Remember my choice in user settings"),
                    }
                });
                const debugAnyway = result === DebugChoice.DebugAnyway;
                const abort = result === DebugChoice.Cancel;
                if (checkboxChecked) {
                    this.configurationService.updateValue('debug.onTaskErrors', result === DebugChoice.DebugAnyway ? 'debugAnyway' : abort ? 'abort' : 'showErrors');
                }
                if (abort) {
                    return Promise.resolve(0 /* TaskRunResult.Failure */);
                }
                if (debugAnyway) {
                    return 1 /* TaskRunResult.Success */;
                }
                await this.viewsService.openView(markers_1.Markers.MARKERS_VIEW_ID, true);
                return Promise.resolve(0 /* TaskRunResult.Failure */);
            }
            catch (err) {
                const taskConfigureAction = this.taskService.configureAction();
                const choiceMap = JSON.parse(this.storageService.get(DEBUG_TASK_ERROR_CHOICE_KEY, 1 /* StorageScope.WORKSPACE */, '{}'));
                let choice = -1;
                let DebugChoice;
                (function (DebugChoice) {
                    DebugChoice[DebugChoice["DebugAnyway"] = 0] = "DebugAnyway";
                    DebugChoice[DebugChoice["ConfigureTask"] = 1] = "ConfigureTask";
                    DebugChoice[DebugChoice["Cancel"] = 2] = "Cancel";
                })(DebugChoice || (DebugChoice = {}));
                if (choiceMap[err.message] !== undefined) {
                    choice = choiceMap[err.message];
                }
                else {
                    const { result, checkboxChecked } = await this.dialogService.prompt({
                        type: severity_1.default.Error,
                        message: err.message,
                        buttons: [
                            {
                                label: nls.localize({ key: 'debugAnyway', comment: ['&& denotes a mnemonic'] }, "&&Debug Anyway"),
                                run: () => DebugChoice.DebugAnyway
                            },
                            {
                                label: taskConfigureAction.label,
                                run: () => DebugChoice.ConfigureTask
                            }
                        ],
                        cancelButton: {
                            run: () => DebugChoice.Cancel
                        },
                        checkbox: {
                            label: nls.localize('rememberTask', "Remember my choice for this task")
                        }
                    });
                    choice = result;
                    if (checkboxChecked) {
                        choiceMap[err.message] = choice;
                        this.storageService.store(DEBUG_TASK_ERROR_CHOICE_KEY, JSON.stringify(choiceMap), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                    }
                }
                if (choice === DebugChoice.ConfigureTask) {
                    await taskConfigureAction.run();
                }
                return choice === DebugChoice.DebugAnyway ? 1 /* TaskRunResult.Success */ : 0 /* TaskRunResult.Failure */;
            }
        }
        async runTask(root, taskId) {
            if (!taskId) {
                return Promise.resolve(null);
            }
            if (!root) {
                return Promise.reject(new Error(nls.localize('invalidTaskReference', "Task '{0}' can not be referenced from a launch configuration that is in a different workspace folder.", typeof taskId === 'string' ? taskId : taskId.type)));
            }
            // run a task before starting a debug session
            const task = await this.taskService.getTask(root, taskId);
            if (!task) {
                const errorMessage = typeof taskId === 'string'
                    ? nls.localize('DebugTaskNotFoundWithTaskId', "Could not find the task '{0}'.", taskId)
                    : nls.localize('DebugTaskNotFound', "Could not find the specified task.");
                return Promise.reject((0, errorMessage_1.createErrorWithActions)(errorMessage, [new actions_1.Action(debugCommands_1.DEBUG_CONFIGURE_COMMAND_ID, debugCommands_1.DEBUG_CONFIGURE_LABEL, undefined, true, () => this.commandService.executeCommand(debugCommands_1.DEBUG_CONFIGURE_COMMAND_ID))]));
            }
            // If a task is missing the problem matcher the promise will never complete, so we need to have a workaround #35340
            let taskStarted = false;
            const taskKey = task.getMapKey();
            const inactivePromise = new Promise((c) => once(e => {
                // When a task isBackground it will go inactive when it is safe to launch.
                // But when a background task is terminated by the user, it will also fire an inactive event.
                // This means that we will not get to see the real exit code from running the task (undefined when terminated by the user).
                // Catch the ProcessEnded event here, which occurs before inactive, and capture the exit code to prevent this.
                return (e.kind === "inactive" /* TaskEventKind.Inactive */
                    || (e.kind === "processEnded" /* TaskEventKind.ProcessEnded */ && e.exitCode === undefined))
                    && e.__task?.getMapKey() === taskKey;
            }, this.taskService.onDidStateChange)(e => {
                taskStarted = true;
                c(e.kind === "processEnded" /* TaskEventKind.ProcessEnded */ ? { exitCode: e.exitCode } : null);
            }));
            const promise = this.taskService.getActiveTasks().then(async (tasks) => {
                if (tasks.find(t => t.getMapKey() === taskKey)) {
                    // Check that the task isn't busy and if it is, wait for it
                    const busyTasks = await this.taskService.getBusyTasks();
                    if (busyTasks.find(t => t.getMapKey() === taskKey)) {
                        taskStarted = true;
                        return inactivePromise;
                    }
                    // task is already running and isn't busy - nothing to do.
                    return Promise.resolve(null);
                }
                once(e => ((e.kind === "active" /* TaskEventKind.Active */) || (e.kind === "dependsOnStarted" /* TaskEventKind.DependsOnStarted */)) && e.__task?.getMapKey() === taskKey, this.taskService.onDidStateChange)(() => {
                    // Task is active, so everything seems to be fine, no need to prompt after 10 seconds
                    // Use case being a slow running task should not be prompted even though it takes more than 10 seconds
                    taskStarted = true;
                });
                const taskPromise = this.taskService.run(task);
                if (task.configurationProperties.isBackground) {
                    return inactivePromise;
                }
                return taskPromise.then(x => x ?? null);
            });
            return new Promise((c, e) => {
                const waitForInput = new Promise(resolve => once(e => (e.kind === "acquiredInput" /* TaskEventKind.AcquiredInput */) && e.__task?.getMapKey() === taskKey, this.taskService.onDidStateChange)(() => {
                    resolve();
                }));
                promise.then(result => {
                    taskStarted = true;
                    c(result);
                }, error => e(error));
                waitForInput.then(() => {
                    const waitTime = task.configurationProperties.isBackground ? 5000 : 10000;
                    setTimeout(() => {
                        if (!taskStarted) {
                            const errorMessage = typeof taskId === 'string'
                                ? nls.localize('taskNotTrackedWithTaskId', "The task '{0}' cannot be tracked. Make sure to have a problem matcher defined.", taskId)
                                : nls.localize('taskNotTracked', "The task '{0}' cannot be tracked. Make sure to have a problem matcher defined.", JSON.stringify(taskId));
                            e({ severity: severity_1.default.Error, message: errorMessage });
                        }
                    }, waitTime);
                });
            });
        }
    };
    exports.DebugTaskRunner = DebugTaskRunner;
    exports.DebugTaskRunner = DebugTaskRunner = __decorate([
        __param(0, taskService_1.ITaskService),
        __param(1, markers_2.IMarkerService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, views_1.IViewsService),
        __param(4, dialogs_1.IDialogService),
        __param(5, storage_1.IStorageService),
        __param(6, commands_1.ICommandService)
    ], DebugTaskRunner);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdUYXNrUnVubmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kZWJ1Z1Rhc2tSdW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0JoRyxTQUFTLElBQUksQ0FBQyxLQUFpQyxFQUFFLEtBQXdCO1FBQ3hFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxHQUFHLElBQUksRUFBRSxXQUFZLEVBQUUsRUFBRTtZQUNsRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3hCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNiLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDakIsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDbEM7WUFDRixDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQWtCLGFBR2pCO0lBSEQsV0FBa0IsYUFBYTtRQUM5Qix1REFBTyxDQUFBO1FBQ1AsdURBQU8sQ0FBQTtJQUNSLENBQUMsRUFIaUIsYUFBYSw2QkFBYixhQUFhLFFBRzlCO0lBRUQsTUFBTSwyQkFBMkIsR0FBRyx1QkFBdUIsQ0FBQztJQUVyRCxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFlO1FBSTNCLFlBQ2UsV0FBMEMsRUFDeEMsYUFBOEMsRUFDdkMsb0JBQTRELEVBQ3BFLFlBQTRDLEVBQzNDLGFBQThDLEVBQzdDLGNBQWdELEVBQ2hELGNBQWdEO1lBTmxDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3ZCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN0Qix5QkFBb0IsR0FB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