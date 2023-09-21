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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/platform/progress/common/progress", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/services/output/common/output", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/common/contributions", "vs/workbench/contrib/tasks/browser/runAutomaticTasks", "vs/platform/keybinding/common/keybindingsRegistry", "../common/jsonSchema_v1", "../common/jsonSchema_v2", "vs/workbench/contrib/tasks/browser/abstractTaskService", "vs/workbench/services/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/contextkeys", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/tasks/browser/tasksQuickAccess", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry", "vs/base/common/types"], function (require, exports, nls, lifecycle_1, platform_1, actions_1, problemMatcher_1, progress_1, jsonContributionRegistry, statusbar_1, output_1, tasks_1, taskService_1, contributions_1, runAutomaticTasks_1, keybindingsRegistry_1, jsonSchema_v1_1, jsonSchema_v2_1, abstractTaskService_1, configuration_1, configurationRegistry_1, contextkeys_1, quickAccess_1, tasksQuickAccess_1, contextkey_1, taskDefinitionRegistry_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskStatusBarContributions = void 0;
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(runAutomaticTasks_1.RunAutomaticTasks, 4 /* LifecyclePhase.Eventually */);
    (0, actions_1.registerAction2)(runAutomaticTasks_1.ManageAutomaticTaskRunning);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: runAutomaticTasks_1.ManageAutomaticTaskRunning.ID,
            title: runAutomaticTasks_1.ManageAutomaticTaskRunning.LABEL,
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    let TaskStatusBarContributions = class TaskStatusBarContributions extends lifecycle_1.Disposable {
        constructor(_taskService, _statusbarService, _progressService) {
            super();
            this._taskService = _taskService;
            this._statusbarService = _statusbarService;
            this._progressService = _progressService;
            this._activeTasksCount = 0;
            this._registerListeners();
        }
        _registerListeners() {
            let promise = undefined;
            let resolver;
            this._taskService.onDidStateChange(event => {
                if (event.kind === "changed" /* TaskEventKind.Changed */) {
                    this._updateRunningTasksStatus();
                }
                if (!this._ignoreEventForUpdateRunningTasksCount(event)) {
                    switch (event.kind) {
                        case "active" /* TaskEventKind.Active */:
                            this._activeTasksCount++;
                            if (this._activeTasksCount === 1) {
                                if (!promise) {
                                    promise = new Promise((resolve) => {
                                        resolver = resolve;
                                    });
                                }
                            }
                            break;
                        case "inactive" /* TaskEventKind.Inactive */:
                            // Since the exiting of the sub process is communicated async we can't order inactive and terminate events.
                            // So try to treat them accordingly.
                            if (this._activeTasksCount > 0) {
                                this._activeTasksCount--;
                                if (this._activeTasksCount === 0) {
                                    if (promise && resolver) {
                                        resolver();
                                    }
                                }
                            }
                            break;
                        case "terminated" /* TaskEventKind.Terminated */:
                            if (this._activeTasksCount !== 0) {
                                this._activeTasksCount = 0;
                                if (promise && resolver) {
                                    resolver();
                                }
                            }
                            break;
                    }
                }
                if (promise && (event.kind === "active" /* TaskEventKind.Active */) && (this._activeTasksCount === 1)) {
                    this._progressService.withProgress({ location: 10 /* ProgressLocation.Window */, command: 'workbench.action.tasks.showTasks', type: 'loading' }, progress => {
                        progress.report({ message: nls.localize('building', 'Building...') });
                        return promise;
                    }).then(() => {
                        promise = undefined;
                    });
                }
            });
        }
        async _updateRunningTasksStatus() {
            const tasks = await this._taskService.getActiveTasks();
            if (tasks.length === 0) {
                if (this._runningTasksStatusItem) {
                    this._runningTasksStatusItem.dispose();
                    this._runningTasksStatusItem = undefined;
                }
            }
            else {
                const itemProps = {
                    name: nls.localize('status.runningTasks', "Running Tasks"),
                    text: `$(tools) ${tasks.length}`,
                    ariaLabel: nls.localize('numberOfRunningTasks', "{0} running tasks", tasks.length),
                    tooltip: nls.localize('runningTasks', "Show Running Tasks"),
                    command: 'workbench.action.tasks.showTasks',
                };
                if (!this._runningTasksStatusItem) {
                    this._runningTasksStatusItem = this._statusbarService.addEntry(itemProps, 'status.runningTasks', 0 /* StatusbarAlignment.LEFT */, 49 /* Medium Priority, next to Markers */);
                }
                else {
                    this._runningTasksStatusItem.update(itemProps);
                }
            }
        }
        _ignoreEventForUpdateRunningTasksCount(event) {
            if (!this._taskService.inTerminal() || event.kind === "changed" /* TaskEventKind.Changed */) {
                return false;
            }
            if (((0, types_1.isString)(event.group) ? event.group : event.group?._id) !== tasks_1.TaskGroup.Build._id) {
                return true;
            }
            return event.__task.configurationProperties.problemMatchers === undefined || event.__task.configurationProperties.problemMatchers.length === 0;
        }
    };
    exports.TaskStatusBarContributions = TaskStatusBarContributions;
    exports.TaskStatusBarContributions = TaskStatusBarContributions = __decorate([
        __param(0, taskService_1.ITaskService),
        __param(1, statusbar_1.IStatusbarService),
        __param(2, progress_1.IProgressService)
    ], TaskStatusBarContributions);
    workbenchRegistry.registerWorkbenchContribution(TaskStatusBarContributions, 3 /* LifecyclePhase.Restored */);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "2_run" /* TerminalMenuBarGroup.Run */,
        command: {
            id: 'workbench.action.tasks.runTask',
            title: nls.localize({ key: 'miRunTask', comment: ['&& denotes a mnemonic'] }, "&&Run Task...")
        },
        order: 1,
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "2_run" /* TerminalMenuBarGroup.Run */,
        command: {
            id: 'workbench.action.tasks.build',
            title: nls.localize({ key: 'miBuildTask', comment: ['&& denotes a mnemonic'] }, "Run &&Build Task...")
        },
        order: 2,
        when: taskService_1.TaskExecutionSupportedContext
    });
    // Manage Tasks
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "3_manage" /* TerminalMenuBarGroup.Manage */,
        command: {
            precondition: tasks_1.TASK_RUNNING_STATE,
            id: 'workbench.action.tasks.showTasks',
            title: nls.localize({ key: 'miRunningTask', comment: ['&& denotes a mnemonic'] }, "Show Runnin&&g Tasks...")
        },
        order: 1,
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "3_manage" /* TerminalMenuBarGroup.Manage */,
        command: {
            precondition: tasks_1.TASK_RUNNING_STATE,
            id: 'workbench.action.tasks.restartTask',
            title: nls.localize({ key: 'miRestartTask', comment: ['&& denotes a mnemonic'] }, "R&&estart Running Task...")
        },
        order: 2,
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "3_manage" /* TerminalMenuBarGroup.Manage */,
        command: {
            precondition: tasks_1.TASK_RUNNING_STATE,
            id: 'workbench.action.tasks.terminate',
            title: nls.localize({ key: 'miTerminateTask', comment: ['&& denotes a mnemonic'] }, "&&Terminate Task...")
        },
        order: 3,
        when: taskService_1.TaskExecutionSupportedContext
    });
    // Configure Tasks
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "4_configure" /* TerminalMenuBarGroup.Configure */,
        command: {
            id: 'workbench.action.tasks.configureTaskRunner',
            title: nls.localize({ key: 'miConfigureTask', comment: ['&& denotes a mnemonic'] }, "&&Configure Tasks...")
        },
        order: 1,
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "4_configure" /* TerminalMenuBarGroup.Configure */,
        command: {
            id: 'workbench.action.tasks.configureDefaultBuildTask',
            title: nls.localize({ key: 'miConfigureBuildTask', comment: ['&& denotes a mnemonic'] }, "Configure De&&fault Build Task...")
        },
        order: 2,
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.openWorkspaceFileTasks',
            title: { value: nls.localize('workbench.action.tasks.openWorkspaceFileTasks', "Open Workspace Tasks"), original: 'Open Workspace Tasks' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), taskService_1.TaskExecutionSupportedContext)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: abstractTaskService_1.ConfigureTaskAction.ID,
            title: { value: abstractTaskService_1.ConfigureTaskAction.TEXT, original: 'Configure Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.showLog',
            title: { value: nls.localize('ShowLogAction.label', "Show Task Log"), original: 'Show Task Log' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.runTask',
            title: { value: nls.localize('RunTaskAction.label', "Run Task"), original: 'Run Task' },
            category: tasks_1.TASKS_CATEGORY
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.reRunTask',
            title: { value: nls.localize('ReRunTaskAction.label', "Rerun Last Task"), original: 'Rerun Last Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.restartTask',
            title: { value: nls.localize('RestartTaskAction.label', "Restart Running Task"), original: 'Restart Running Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.showTasks',
            title: { value: nls.localize('ShowTasksAction.label', "Show Running Tasks"), original: 'Show Running Tasks' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.terminate',
            title: { value: nls.localize('TerminateAction.label', "Terminate Task"), original: 'Terminate Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.build',
            title: { value: nls.localize('BuildAction.label', "Run Build Task"), original: 'Run Build Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.test',
            title: { value: nls.localize('TestAction.label', "Run Test Task"), original: 'Run Test Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.configureDefaultBuildTask',
            title: {
                value: nls.localize('ConfigureDefaultBuildTask.label', "Configure Default Build Task"),
                original: 'Configure Default Build Task'
            },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.configureDefaultTestTask',
            title: {
                value: nls.localize('ConfigureDefaultTestTask.label', "Configure Default Test Task"),
                original: 'Configure Default Test Task'
            },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.openUserTasks',
            title: {
                value: nls.localize('workbench.action.tasks.openUserTasks', "Open User Tasks"),
                original: 'Open User Tasks'
            }, category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    class UserTasksGlobalActionContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this.registerActions();
        }
        registerActions() {
            const id = 'workbench.action.tasks.openUserTasks';
            const title = nls.localize('userTasks', "User Tasks");
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                command: {
                    id,
                    title
                },
                when: taskService_1.TaskExecutionSupportedContext,
                group: '2_configuration',
                order: 6
            }));
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                command: {
                    id,
                    title
                },
                when: taskService_1.TaskExecutionSupportedContext,
                group: '2_configuration',
                order: 6
            }));
        }
    }
    workbenchRegistry.registerWorkbenchContribution(UserTasksGlobalActionContribution, 3 /* LifecyclePhase.Restored */);
    // MenuRegistry.addCommand( { id: 'workbench.action.tasks.rebuild', title: nls.localize('RebuildAction.label', 'Run Rebuild Task'), category: tasksCategory });
    // MenuRegistry.addCommand( { id: 'workbench.action.tasks.clean', title: nls.localize('CleanAction.label', 'Run Clean Task'), category: tasksCategory });
    keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
        id: 'workbench.action.tasks.build',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: taskService_1.TaskCommandsRegistered,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 32 /* KeyCode.KeyB */
    });
    // Tasks Output channel. Register it before using it in Task Service.
    const outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
    outputChannelRegistry.registerChannel({ id: abstractTaskService_1.AbstractTaskService.OutputChannelId, label: abstractTaskService_1.AbstractTaskService.OutputChannelLabel, log: false });
    // Register Quick Access
    const quickAccessRegistry = (platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
    const tasksPickerContextKey = 'inTasksPicker';
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: tasksQuickAccess_1.TasksQuickAccessProvider,
        prefix: tasksQuickAccess_1.TasksQuickAccessProvider.PREFIX,
        contextKey: tasksPickerContextKey,
        placeholder: nls.localize('tasksQuickAccessPlaceholder', "Type the name of a task to run."),
        helpEntries: [{ description: nls.localize('tasksQuickAccessHelp', "Run Task"), commandCenterOrder: 60 }]
    });
    // tasks.json validation
    const schema = {
        id: configuration_1.tasksSchemaId,
        description: 'Task definition file',
        type: 'object',
        allowTrailingCommas: true,
        allowComments: true,
        default: {
            version: '2.0.0',
            tasks: [
                {
                    label: 'My Task',
                    command: 'echo hello',
                    type: 'shell',
                    args: [],
                    problemMatcher: ['$tsc'],
                    presentation: {
                        reveal: 'always'
                    },
                    group: 'build'
                }
            ]
        }
    };
    schema.definitions = {
        ...jsonSchema_v1_1.default.definitions,
        ...jsonSchema_v2_1.default.definitions,
    };
    schema.oneOf = [...(jsonSchema_v2_1.default.oneOf || []), ...(jsonSchema_v1_1.default.oneOf || [])];
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
    jsonRegistry.registerSchema(configuration_1.tasksSchemaId, schema);
    problemMatcher_1.ProblemMatcherRegistry.onMatcherChanged(() => {
        (0, jsonSchema_v2_1.updateProblemMatchers)();
        jsonRegistry.notifySchemaChanged(configuration_1.tasksSchemaId);
    });
    taskDefinitionRegistry_1.TaskDefinitionRegistry.onDefinitionsChanged(() => {
        (0, jsonSchema_v2_1.updateTaskDefinitions)();
        jsonRegistry.notifySchemaChanged(configuration_1.tasksSchemaId);
    });
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'task',
        order: 100,
        title: nls.localize('tasksConfigurationTitle', "Tasks"),
        type: 'object',
        properties: {
            ["task.problemMatchers.neverPrompt" /* TaskSettingId.ProblemMatchersNeverPrompt */]: {
                markdownDescription: nls.localize('task.problemMatchers.neverPrompt', "Configures whether to show the problem matcher prompt when running a task. Set to `true` to never prompt, or use a dictionary of task types to turn off prompting only for specific task types."),
                'oneOf': [
                    {
                        type: 'boolean',
                        markdownDescription: nls.localize('task.problemMatchers.neverPrompt.boolean', 'Sets problem matcher prompting behavior for all tasks.')
                    },
                    {
                        type: 'object',
                        patternProperties: {
                            '.*': {
                                type: 'boolean'
                            }
                        },
                        markdownDescription: nls.localize('task.problemMatchers.neverPrompt.array', 'An object containing task type-boolean pairs to never prompt for problem matchers on.'),
                        default: {
                            'shell': true
                        }
                    }
                ],
                default: false
            },
            ["task.autoDetect" /* TaskSettingId.AutoDetect */]: {
                markdownDescription: nls.localize('task.autoDetect', "Controls enablement of `provideTasks` for all task provider extension. If the Tasks: Run Task command is slow, disabling auto detect for task providers may help. Individual extensions may also provide settings that disable auto detection."),
                type: 'string',
                enum: ['on', 'off'],
                default: 'on'
            },
            ["task.slowProviderWarning" /* TaskSettingId.SlowProviderWarning */]: {
                markdownDescription: nls.localize('task.slowProviderWarning', "Configures whether a warning is shown when a provider is slow"),
                'oneOf': [
                    {
                        type: 'boolean',
                        markdownDescription: nls.localize('task.slowProviderWarning.boolean', 'Sets the slow provider warning for all tasks.')
                    },
                    {
                        type: 'array',
                        items: {
                            type: 'string',
                            markdownDescription: nls.localize('task.slowProviderWarning.array', 'An array of task types to never show the slow provider warning.')
                        }
                    }
                ],
                default: true
            },
            ["task.quickOpen.history" /* TaskSettingId.QuickOpenHistory */]: {
                markdownDescription: nls.localize('task.quickOpen.history', "Controls the number of recent items tracked in task quick open dialog."),
                type: 'number',
                default: 30, minimum: 0, maximum: 30
            },
            ["task.quickOpen.detail" /* TaskSettingId.QuickOpenDetail */]: {
                markdownDescription: nls.localize('task.quickOpen.detail', "Controls whether to show the task detail for tasks that have a detail in task quick picks, such as Run Task."),
                type: 'boolean',
                default: true
            },
            ["task.quickOpen.skip" /* TaskSettingId.QuickOpenSkip */]: {
                type: 'boolean',
                description: nls.localize('task.quickOpen.skip', "Controls whether the task quick pick is skipped when there is only one task to pick from."),
                default: false
            },
            ["task.quickOpen.showAll" /* TaskSettingId.QuickOpenShowAll */]: {
                type: 'boolean',
                description: nls.localize('task.quickOpen.showAll', "Causes the Tasks: Run Task command to use the slower \"show all\" behavior instead of the faster two level picker where tasks are grouped by provider."),
                default: false
            },
            ["task.allowAutomaticTasks" /* TaskSettingId.AllowAutomaticTasks */]: {
                type: 'string',
                enum: ['on', 'off'],
                enumDescriptions: [
                    nls.localize('task.allowAutomaticTasks.on', "Always"),
                    nls.localize('task.allowAutomaticTasks.off', "Never"),
                ],
                description: nls.localize('task.allowAutomaticTasks', "Enable automatic tasks - note that tasks won't run in an untrusted workspace."),
                default: 'on',
                restricted: true
            },
            ["task.reconnection" /* TaskSettingId.Reconnection */]: {
                type: 'boolean',
                description: nls.localize('task.reconnection', "On window reload, reconnect to tasks that have problem matchers."),
                default: true
            },
            ["task.saveBeforeRun" /* TaskSettingId.SaveBeforeRun */]: {
                markdownDescription: nls.localize('task.saveBeforeRun', 'Save all dirty editors before running a task.'),
                type: 'string',
                enum: ['always', 'never', 'prompt'],
                enumDescriptions: [
                    nls.localize('task.saveBeforeRun.always', 'Always saves all editors before running.'),
                    nls.localize('task.saveBeforeRun.never', 'Never saves editors before running.'),
                    nls.localize('task.SaveBeforeRun.prompt', 'Prompts whether to save editors before running.'),
                ],
                default: 'always',
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YXNrcy9icm93c2VyL3Rhc2suY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVDaEcsTUFBTSxpQkFBaUIsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEcsaUJBQWlCLENBQUMsNkJBQTZCLENBQUMscUNBQWlCLG9DQUE0QixDQUFDO0lBRTlGLElBQUEseUJBQWUsRUFBQyw4Q0FBMEIsQ0FBQyxDQUFDO0lBQzVDLHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsY0FBYyxFQUFFO1FBQ2xELE9BQU8sRUFBRTtZQUNSLEVBQUUsRUFBRSw4Q0FBMEIsQ0FBQyxFQUFFO1lBQ2pDLEtBQUssRUFBRSw4Q0FBMEIsQ0FBQyxLQUFLO1lBQ3ZDLFFBQVEsRUFBRSxzQkFBYztTQUN4QjtRQUNELElBQUksRUFBRSwyQ0FBNkI7S0FDbkMsQ0FBQyxDQUFDO0lBRUksSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMkIsU0FBUSxzQkFBVTtRQUl6RCxZQUNlLFlBQTJDLEVBQ3RDLGlCQUFxRCxFQUN0RCxnQkFBbUQ7WUFFckUsS0FBSyxFQUFFLENBQUM7WUFKdUIsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDckIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNyQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBTDlELHNCQUFpQixHQUFXLENBQUMsQ0FBQztZQVFyQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRU8sa0JBQWtCO1lBQ3pCLElBQUksT0FBTyxHQUE4QixTQUFTLENBQUM7WUFDbkQsSUFBSSxRQUFpRCxD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