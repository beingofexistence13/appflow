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
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/browser/runAutomaticTasks", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/contrib/tasks/common/tasks", "vs/platform/quickinput/common/quickInput", "vs/platform/actions/common/actions", "vs/platform/workspace/common/workspaceTrust", "vs/platform/configuration/common/configuration", "vs/base/common/event", "vs/platform/log/common/log"], function (require, exports, nls, resources, lifecycle_1, taskService_1, tasks_1, quickInput_1, actions_1, workspaceTrust_1, configuration_1, event_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pXb = exports.$oXb = void 0;
    const ALLOW_AUTOMATIC_TASKS = 'task.allowAutomaticTasks';
    let $oXb = class $oXb extends lifecycle_1.$kc {
        constructor(b, c, f, g) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = false;
            if (this.b.isReconnected) {
                this.h();
            }
            else {
                this.B(event_1.Event.once(this.b.onDidReconnectToTasks)(async () => await this.h()));
            }
            this.B(this.f.onDidChangeTrust(async () => await this.h()));
        }
        async h() {
            if (!this.f.isWorkspaceTrusted()) {
                return;
            }
            if (this.a || this.c.getValue(ALLOW_AUTOMATIC_TASKS) === 'off') {
                return;
            }
            this.a = true;
            this.g.trace('RunAutomaticTasks: Trying to run tasks.');
            // Wait until we have task system info (the extension host and workspace folders are available).
            if (!this.b.hasTaskSystemInfo) {
                this.g.trace('RunAutomaticTasks: Awaiting task system info.');
                await event_1.Event.toPromise(event_1.Event.once(this.b.onDidChangeTaskSystemInfo));
            }
            const workspaceTasks = await this.b.getWorkspaceTasks(2 /* TaskRunSource.FolderOpen */);
            this.g.trace(`RunAutomaticTasks: Found ${workspaceTasks.size} automatic tasks`);
            await this.r(this.b, this.c, workspaceTasks);
        }
        j(taskService, tasks) {
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
        m(source) {
            const taskKind = tasks_1.TaskSourceKind.toConfigurationTarget(source.kind);
            switch (taskKind) {
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */: {
                    return resources.$ig(source.config.workspaceFolder.uri, source.config.file);
                }
                case 5 /* ConfigurationTarget.WORKSPACE */: {
                    return source.config.workspace?.configuration ?? undefined;
                }
            }
            return undefined;
        }
        n(taskService, workspaceTaskResult) {
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
                                const location = this.m(task._source);
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
                                const location = this.m(configuredTask._source);
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
        async r(taskService, configurationService, workspaceTaskResult) {
            const { tasks, taskNames } = this.n(taskService, workspaceTaskResult);
            if (taskNames.length === 0) {
                return;
            }
            if (configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === 'off') {
                return;
            }
            this.j(taskService, tasks);
        }
    };
    exports.$oXb = $oXb;
    exports.$oXb = $oXb = __decorate([
        __param(0, taskService_1.$osb),
        __param(1, configuration_1.$8h),
        __param(2, workspaceTrust_1.$$z),
        __param(3, log_1.$5i)
    ], $oXb);
    class $pXb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.tasks.manageAutomaticRunning'; }
        static { this.LABEL = nls.localize(0, null); }
        constructor() {
            super({
                id: $pXb.ID,
                title: $pXb.LABEL,
                category: tasks_1.$bG
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const configurationService = accessor.get(configuration_1.$8h);
            const allowItem = { label: nls.localize(1, null) };
            const disallowItem = { label: nls.localize(2, null) };
            const value = await quickInputService.pick([allowItem, disallowItem], { canPickMany: false });
            if (!value) {
                return;
            }
            configurationService.updateValue(ALLOW_AUTOMATIC_TASKS, value === allowItem ? 'on' : 'off', 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.$pXb = $pXb;
});
//# sourceMappingURL=runAutomaticTasks.js.map