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
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/browser/task.contribution", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/platform/progress/common/progress", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/services/output/common/output", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/common/contributions", "vs/workbench/contrib/tasks/browser/runAutomaticTasks", "vs/platform/keybinding/common/keybindingsRegistry", "../common/jsonSchema_v1", "../common/jsonSchema_v2", "vs/workbench/contrib/tasks/browser/abstractTaskService", "vs/workbench/services/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/contextkeys", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/tasks/browser/tasksQuickAccess", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry", "vs/base/common/types"], function (require, exports, nls, lifecycle_1, platform_1, actions_1, problemMatcher_1, progress_1, jsonContributionRegistry, statusbar_1, output_1, tasks_1, taskService_1, contributions_1, runAutomaticTasks_1, keybindingsRegistry_1, jsonSchema_v1_1, jsonSchema_v2_1, abstractTaskService_1, configuration_1, configurationRegistry_1, contextkeys_1, quickAccess_1, tasksQuickAccess_1, contextkey_1, taskDefinitionRegistry_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NXb = void 0;
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(runAutomaticTasks_1.$oXb, 4 /* LifecyclePhase.Eventually */);
    (0, actions_1.$Xu)(runAutomaticTasks_1.$pXb);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: runAutomaticTasks_1.$pXb.ID,
            title: runAutomaticTasks_1.$pXb.LABEL,
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    let $NXb = class $NXb extends lifecycle_1.$kc {
        constructor(c, f, g) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.b = 0;
            this.h();
        }
        h() {
            let promise = undefined;
            let resolver;
            this.c.onDidStateChange(event => {
                if (event.kind === "changed" /* TaskEventKind.Changed */) {
                    this.j();
                }
                if (!this.m(event)) {
                    switch (event.kind) {
                        case "active" /* TaskEventKind.Active */:
                            this.b++;
                            if (this.b === 1) {
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
                            if (this.b > 0) {
                                this.b--;
                                if (this.b === 0) {
                                    if (promise && resolver) {
                                        resolver();
                                    }
                                }
                            }
                            break;
                        case "terminated" /* TaskEventKind.Terminated */:
                            if (this.b !== 0) {
                                this.b = 0;
                                if (promise && resolver) {
                                    resolver();
                                }
                            }
                            break;
                    }
                }
                if (promise && (event.kind === "active" /* TaskEventKind.Active */) && (this.b === 1)) {
                    this.g.withProgress({ location: 10 /* ProgressLocation.Window */, command: 'workbench.action.tasks.showTasks', type: 'loading' }, progress => {
                        progress.report({ message: nls.localize(0, null) });
                        return promise;
                    }).then(() => {
                        promise = undefined;
                    });
                }
            });
        }
        async j() {
            const tasks = await this.c.getActiveTasks();
            if (tasks.length === 0) {
                if (this.a) {
                    this.a.dispose();
                    this.a = undefined;
                }
            }
            else {
                const itemProps = {
                    name: nls.localize(1, null),
                    text: `$(tools) ${tasks.length}`,
                    ariaLabel: nls.localize(2, null, tasks.length),
                    tooltip: nls.localize(3, null),
                    command: 'workbench.action.tasks.showTasks',
                };
                if (!this.a) {
                    this.a = this.f.addEntry(itemProps, 'status.runningTasks', 0 /* StatusbarAlignment.LEFT */, 49 /* Medium Priority, next to Markers */);
                }
                else {
                    this.a.update(itemProps);
                }
            }
        }
        m(event) {
            if (!this.c.inTerminal() || event.kind === "changed" /* TaskEventKind.Changed */) {
                return false;
            }
            if (((0, types_1.$jf)(event.group) ? event.group : event.group?._id) !== tasks_1.TaskGroup.Build._id) {
                return true;
            }
            return event.__task.configurationProperties.problemMatchers === undefined || event.__task.configurationProperties.problemMatchers.length === 0;
        }
    };
    exports.$NXb = $NXb;
    exports.$NXb = $NXb = __decorate([
        __param(0, taskService_1.$osb),
        __param(1, statusbar_1.$6$),
        __param(2, progress_1.$2u)
    ], $NXb);
    workbenchRegistry.registerWorkbenchContribution($NXb, 3 /* LifecyclePhase.Restored */);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarTerminalMenu, {
        group: "2_run" /* TerminalMenuBarGroup.Run */,
        command: {
            id: 'workbench.action.tasks.runTask',
            title: nls.localize(4, null)
        },
        order: 1,
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarTerminalMenu, {
        group: "2_run" /* TerminalMenuBarGroup.Run */,
        command: {
            id: 'workbench.action.tasks.build',
            title: nls.localize(5, null)
        },
        order: 2,
        when: taskService_1.$nsb
    });
    // Manage Tasks
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarTerminalMenu, {
        group: "3_manage" /* TerminalMenuBarGroup.Manage */,
        command: {
            precondition: tasks_1.$aG,
            id: 'workbench.action.tasks.showTasks',
            title: nls.localize(6, null)
        },
        order: 1,
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarTerminalMenu, {
        group: "3_manage" /* TerminalMenuBarGroup.Manage */,
        command: {
            precondition: tasks_1.$aG,
            id: 'workbench.action.tasks.restartTask',
            title: nls.localize(7, null)
        },
        order: 2,
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarTerminalMenu, {
        group: "3_manage" /* TerminalMenuBarGroup.Manage */,
        command: {
            precondition: tasks_1.$aG,
            id: 'workbench.action.tasks.terminate',
            title: nls.localize(8, null)
        },
        order: 3,
        when: taskService_1.$nsb
    });
    // Configure Tasks
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarTerminalMenu, {
        group: "4_configure" /* TerminalMenuBarGroup.Configure */,
        command: {
            id: 'workbench.action.tasks.configureTaskRunner',
            title: nls.localize(9, null)
        },
        order: 1,
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarTerminalMenu, {
        group: "4_configure" /* TerminalMenuBarGroup.Configure */,
        command: {
            id: 'workbench.action.tasks.configureDefaultBuildTask',
            title: nls.localize(10, null)
        },
        order: 2,
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.openWorkspaceFileTasks',
            title: { value: nls.localize(11, null), original: 'Open Workspace Tasks' },
            category: tasks_1.$bG
        },
        when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.isEqualTo('workspace'), taskService_1.$nsb)
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: abstractTaskService_1.ConfigureTaskAction.ID,
            title: { value: abstractTaskService_1.ConfigureTaskAction.TEXT, original: 'Configure Task' },
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.showLog',
            title: { value: nls.localize(12, null), original: 'Show Task Log' },
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.runTask',
            title: { value: nls.localize(13, null), original: 'Run Task' },
            category: tasks_1.$bG
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.reRunTask',
            title: { value: nls.localize(14, null), original: 'Rerun Last Task' },
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.restartTask',
            title: { value: nls.localize(15, null), original: 'Restart Running Task' },
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.showTasks',
            title: { value: nls.localize(16, null), original: 'Show Running Tasks' },
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.terminate',
            title: { value: nls.localize(17, null), original: 'Terminate Task' },
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.build',
            title: { value: nls.localize(18, null), original: 'Run Build Task' },
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.test',
            title: { value: nls.localize(19, null), original: 'Run Test Task' },
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.configureDefaultBuildTask',
            title: {
                value: nls.localize(20, null),
                original: 'Configure Default Build Task'
            },
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.configureDefaultTestTask',
            title: {
                value: nls.localize(21, null),
                original: 'Configure Default Test Task'
            },
            category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.openUserTasks',
            title: {
                value: nls.localize(22, null),
                original: 'Open User Tasks'
            }, category: tasks_1.$bG
        },
        when: taskService_1.$nsb
    });
    class UserTasksGlobalActionContribution extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a();
        }
        a() {
            const id = 'workbench.action.tasks.openUserTasks';
            const title = nls.localize(23, null);
            this.B(actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                command: {
                    id,
                    title
                },
                when: taskService_1.$nsb,
                group: '2_configuration',
                order: 6
            }));
            this.B(actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarPreferencesMenu, {
                command: {
                    id,
                    title
                },
                when: taskService_1.$nsb,
                group: '2_configuration',
                order: 6
            }));
        }
    }
    workbenchRegistry.registerWorkbenchContribution(UserTasksGlobalActionContribution, 3 /* LifecyclePhase.Restored */);
    // MenuRegistry.addCommand( { id: 'workbench.action.tasks.rebuild', title: nls.localize('RebuildAction.label', 'Run Rebuild Task'), category: tasksCategory });
    // MenuRegistry.addCommand( { id: 'workbench.action.tasks.clean', title: nls.localize('CleanAction.label', 'Run Clean Task'), category: tasksCategory });
    keybindingsRegistry_1.$Nu.registerKeybindingRule({
        id: 'workbench.action.tasks.build',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: taskService_1.$ksb,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 32 /* KeyCode.KeyB */
    });
    // Tasks Output channel. Register it before using it in Task Service.
    const outputChannelRegistry = platform_1.$8m.as(output_1.$fJ.OutputChannels);
    outputChannelRegistry.registerChannel({ id: abstractTaskService_1.$LXb.OutputChannelId, label: abstractTaskService_1.$LXb.OutputChannelLabel, log: false });
    // Register Quick Access
    const quickAccessRegistry = (platform_1.$8m.as(quickAccess_1.$8p.Quickaccess));
    const tasksPickerContextKey = 'inTasksPicker';
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: tasksQuickAccess_1.$MXb,
        prefix: tasksQuickAccess_1.$MXb.PREFIX,
        contextKey: tasksPickerContextKey,
        placeholder: nls.localize(24, null),
        helpEntries: [{ description: nls.localize(25, null), commandCenterOrder: 60 }]
    });
    // tasks.json validation
    const schema = {
        id: configuration_1.$aE,
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
    const jsonRegistry = platform_1.$8m.as(jsonContributionRegistry.$9m.JSONContribution);
    jsonRegistry.registerSchema(configuration_1.$aE, schema);
    problemMatcher_1.$0F.onMatcherChanged(() => {
        (0, jsonSchema_v2_1.$rXb)();
        jsonRegistry.notifySchemaChanged(configuration_1.$aE);
    });
    taskDefinitionRegistry_1.$$F.onDefinitionsChanged(() => {
        (0, jsonSchema_v2_1.$qXb)();
        jsonRegistry.notifySchemaChanged(configuration_1.$aE);
    });
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'task',
        order: 100,
        title: nls.localize(26, null),
        type: 'object',
        properties: {
            ["task.problemMatchers.neverPrompt" /* TaskSettingId.ProblemMatchersNeverPrompt */]: {
                markdownDescription: nls.localize(27, null),
                'oneOf': [
                    {
                        type: 'boolean',
                        markdownDescription: nls.localize(28, null)
                    },
                    {
                        type: 'object',
                        patternProperties: {
                            '.*': {
                                type: 'boolean'
                            }
                        },
                        markdownDescription: nls.localize(29, null),
                        default: {
                            'shell': true
                        }
                    }
                ],
                default: false
            },
            ["task.autoDetect" /* TaskSettingId.AutoDetect */]: {
                markdownDescription: nls.localize(30, null),
                type: 'string',
                enum: ['on', 'off'],
                default: 'on'
            },
            ["task.slowProviderWarning" /* TaskSettingId.SlowProviderWarning */]: {
                markdownDescription: nls.localize(31, null),
                'oneOf': [
                    {
                        type: 'boolean',
                        markdownDescription: nls.localize(32, null)
                    },
                    {
                        type: 'array',
                        items: {
                            type: 'string',
                            markdownDescription: nls.localize(33, null)
                        }
                    }
                ],
                default: true
            },
            ["task.quickOpen.history" /* TaskSettingId.QuickOpenHistory */]: {
                markdownDescription: nls.localize(34, null),
                type: 'number',
                default: 30, minimum: 0, maximum: 30
            },
            ["task.quickOpen.detail" /* TaskSettingId.QuickOpenDetail */]: {
                markdownDescription: nls.localize(35, null),
                type: 'boolean',
                default: true
            },
            ["task.quickOpen.skip" /* TaskSettingId.QuickOpenSkip */]: {
                type: 'boolean',
                description: nls.localize(36, null),
                default: false
            },
            ["task.quickOpen.showAll" /* TaskSettingId.QuickOpenShowAll */]: {
                type: 'boolean',
                description: nls.localize(37, null),
                default: false
            },
            ["task.allowAutomaticTasks" /* TaskSettingId.AllowAutomaticTasks */]: {
                type: 'string',
                enum: ['on', 'off'],
                enumDescriptions: [
                    nls.localize(38, null),
                    nls.localize(39, null),
                ],
                description: nls.localize(40, null),
                default: 'on',
                restricted: true
            },
            ["task.reconnection" /* TaskSettingId.Reconnection */]: {
                type: 'boolean',
                description: nls.localize(41, null),
                default: true
            },
            ["task.saveBeforeRun" /* TaskSettingId.SaveBeforeRun */]: {
                markdownDescription: nls.localize(42, null),
                type: 'string',
                enum: ['always', 'never', 'prompt'],
                enumDescriptions: [
                    nls.localize(43, null),
                    nls.localize(44, null),
                    nls.localize(45, null),
                ],
                default: 'always',
            },
        }
    });
});
//# sourceMappingURL=task.contribution.js.map