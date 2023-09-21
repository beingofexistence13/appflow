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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/debugTaskRunner", "vs/base/common/severity", "vs/workbench/contrib/markers/common/markers", "vs/workbench/contrib/tasks/common/taskService", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/markers/common/markers", "vs/workbench/common/views", "vs/platform/storage/common/storage", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/workbench/contrib/debug/browser/debugCommands", "vs/platform/commands/common/commands"], function (require, exports, nls, severity_1, markers_1, taskService_1, configuration_1, dialogs_1, markers_2, views_1, storage_1, errorMessage_1, actions_1, debugCommands_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$TRb = exports.TaskRunResult = void 0;
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
    let $TRb = class $TRb {
        constructor(b, d, f, g, h, i, j) {
            this.b = b;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.a = false;
        }
        cancel() {
            this.a = true;
        }
        async runTaskAndCheckErrors(root, taskId) {
            try {
                this.a = false;
                const taskSummary = await this.runTask(root, taskId);
                if (this.a || (taskSummary && taskSummary.exitCode === undefined)) {
                    // User canceled, either debugging, or the prelaunch task
                    return 0 /* TaskRunResult.Failure */;
                }
                const errorCount = taskId ? this.d.read({ severities: markers_2.MarkerSeverity.Error, take: 2 }).length : 0;
                const successExitCode = taskSummary && taskSummary.exitCode === 0;
                const failureExitCode = taskSummary && taskSummary.exitCode !== 0;
                const onTaskErrors = this.f.getValue('debug').onTaskErrors;
                if (successExitCode || onTaskErrors === 'debugAnyway' || (errorCount === 0 && !failureExitCode)) {
                    return 1 /* TaskRunResult.Success */;
                }
                if (onTaskErrors === 'showErrors') {
                    await this.g.openView(markers_1.Markers.MARKERS_VIEW_ID, true);
                    return Promise.resolve(0 /* TaskRunResult.Failure */);
                }
                if (onTaskErrors === 'abort') {
                    return Promise.resolve(0 /* TaskRunResult.Failure */);
                }
                const taskLabel = typeof taskId === 'string' ? taskId : taskId ? taskId.name : '';
                const message = errorCount > 1
                    ? nls.localize(0, null, taskLabel)
                    : errorCount === 1
                        ? nls.localize(1, null, taskLabel)
                        : taskSummary && typeof taskSummary.exitCode === 'number'
                            ? nls.localize(2, null, taskLabel, taskSummary.exitCode)
                            : nls.localize(3, null, taskLabel);
                let DebugChoice;
                (function (DebugChoice) {
                    DebugChoice[DebugChoice["DebugAnyway"] = 1] = "DebugAnyway";
                    DebugChoice[DebugChoice["ShowErrors"] = 2] = "ShowErrors";
                    DebugChoice[DebugChoice["Cancel"] = 0] = "Cancel";
                })(DebugChoice || (DebugChoice = {}));
                const { result, checkboxChecked } = await this.h.prompt({
                    type: severity_1.default.Warning,
                    message,
                    buttons: [
                        {
                            label: nls.localize(4, null),
                            run: () => DebugChoice.DebugAnyway
                        },
                        {
                            label: nls.localize(5, null),
                            run: () => DebugChoice.ShowErrors
                        }
                    ],
                    cancelButton: {
                        label: nls.localize(6, null),
                        run: () => DebugChoice.Cancel
                    },
                    checkbox: {
                        label: nls.localize(7, null),
                    }
                });
                const debugAnyway = result === DebugChoice.DebugAnyway;
                const abort = result === DebugChoice.Cancel;
                if (checkboxChecked) {
                    this.f.updateValue('debug.onTaskErrors', result === DebugChoice.DebugAnyway ? 'debugAnyway' : abort ? 'abort' : 'showErrors');
                }
                if (abort) {
                    return Promise.resolve(0 /* TaskRunResult.Failure */);
                }
                if (debugAnyway) {
                    return 1 /* TaskRunResult.Success */;
                }
                await this.g.openView(markers_1.Markers.MARKERS_VIEW_ID, true);
                return Promise.resolve(0 /* TaskRunResult.Failure */);
            }
            catch (err) {
                const taskConfigureAction = this.b.configureAction();
                const choiceMap = JSON.parse(this.i.get(DEBUG_TASK_ERROR_CHOICE_KEY, 1 /* StorageScope.WORKSPACE */, '{}'));
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
                    const { result, checkboxChecked } = await this.h.prompt({
                        type: severity_1.default.Error,
                        message: err.message,
                        buttons: [
                            {
                                label: nls.localize(8, null),
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
                            label: nls.localize(9, null)
                        }
                    });
                    choice = result;
                    if (checkboxChecked) {
                        choiceMap[err.message] = choice;
                        this.i.store(DEBUG_TASK_ERROR_CHOICE_KEY, JSON.stringify(choiceMap), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
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
                return Promise.reject(new Error(nls.localize(10, null, typeof taskId === 'string' ? taskId : taskId.type)));
            }
            // run a task before starting a debug session
            const task = await this.b.getTask(root, taskId);
            if (!task) {
                const errorMessage = typeof taskId === 'string'
                    ? nls.localize(11, null, taskId)
                    : nls.localize(12, null);
                return Promise.reject((0, errorMessage_1.$oi)(errorMessage, [new actions_1.$gi(debugCommands_1.$AQb, debugCommands_1.$1Qb, undefined, true, () => this.j.executeCommand(debugCommands_1.$AQb))]));
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
            }, this.b.onDidStateChange)(e => {
                taskStarted = true;
                c(e.kind === "processEnded" /* TaskEventKind.ProcessEnded */ ? { exitCode: e.exitCode } : null);
            }));
            const promise = this.b.getActiveTasks().then(async (tasks) => {
                if (tasks.find(t => t.getMapKey() === taskKey)) {
                    // Check that the task isn't busy and if it is, wait for it
                    const busyTasks = await this.b.getBusyTasks();
                    if (busyTasks.find(t => t.getMapKey() === taskKey)) {
                        taskStarted = true;
                        return inactivePromise;
                    }
                    // task is already running and isn't busy - nothing to do.
                    return Promise.resolve(null);
                }
                once(e => ((e.kind === "active" /* TaskEventKind.Active */) || (e.kind === "dependsOnStarted" /* TaskEventKind.DependsOnStarted */)) && e.__task?.getMapKey() === taskKey, this.b.onDidStateChange)(() => {
                    // Task is active, so everything seems to be fine, no need to prompt after 10 seconds
                    // Use case being a slow running task should not be prompted even though it takes more than 10 seconds
                    taskStarted = true;
                });
                const taskPromise = this.b.run(task);
                if (task.configurationProperties.isBackground) {
                    return inactivePromise;
                }
                return taskPromise.then(x => x ?? null);
            });
            return new Promise((c, e) => {
                const waitForInput = new Promise(resolve => once(e => (e.kind === "acquiredInput" /* TaskEventKind.AcquiredInput */) && e.__task?.getMapKey() === taskKey, this.b.onDidStateChange)(() => {
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
                                ? nls.localize(13, null, taskId)
                                : nls.localize(14, null, JSON.stringify(taskId));
                            e({ severity: severity_1.default.Error, message: errorMessage });
                        }
                    }, waitTime);
                });
            });
        }
    };
    exports.$TRb = $TRb;
    exports.$TRb = $TRb = __decorate([
        __param(0, taskService_1.$osb),
        __param(1, markers_2.$3s),
        __param(2, configuration_1.$8h),
        __param(3, views_1.$$E),
        __param(4, dialogs_1.$oA),
        __param(5, storage_1.$Vo),
        __param(6, commands_1.$Fr)
    ], $TRb);
});
//# sourceMappingURL=debugTaskRunner.js.map