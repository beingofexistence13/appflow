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
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/common/types", "vs/base/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/base/common/errors"], function (require, exports, nls, uri_1, uuid_1, Types, Platform, workspace_1, tasks_1, taskService_1, extHostCustomers_1, extHost_protocol_1, configurationResolver_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTask = void 0;
    var TaskExecutionDTO;
    (function (TaskExecutionDTO) {
        function from(value) {
            return {
                id: value.id,
                task: TaskDTO.from(value.task)
            };
        }
        TaskExecutionDTO.from = from;
    })(TaskExecutionDTO || (TaskExecutionDTO = {}));
    var TaskProcessStartedDTO;
    (function (TaskProcessStartedDTO) {
        function from(value, processId) {
            return {
                id: value.id,
                processId
            };
        }
        TaskProcessStartedDTO.from = from;
    })(TaskProcessStartedDTO || (TaskProcessStartedDTO = {}));
    var TaskProcessEndedDTO;
    (function (TaskProcessEndedDTO) {
        function from(value, exitCode) {
            return {
                id: value.id,
                exitCode
            };
        }
        TaskProcessEndedDTO.from = from;
    })(TaskProcessEndedDTO || (TaskProcessEndedDTO = {}));
    var TaskDefinitionDTO;
    (function (TaskDefinitionDTO) {
        function from(value) {
            const result = Object.assign(Object.create(null), value);
            delete result._key;
            return result;
        }
        TaskDefinitionDTO.from = from;
        function to(value, executeOnly) {
            let result = tasks_1.TaskDefinition.createTaskIdentifier(value, console);
            if (result === undefined && executeOnly) {
                result = {
                    _key: (0, uuid_1.generateUuid)(),
                    type: '$executeOnly'
                };
            }
            return result;
        }
        TaskDefinitionDTO.to = to;
    })(TaskDefinitionDTO || (TaskDefinitionDTO = {}));
    var TaskPresentationOptionsDTO;
    (function (TaskPresentationOptionsDTO) {
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return Object.assign(Object.create(null), value);
        }
        TaskPresentationOptionsDTO.from = from;
        function to(value) {
            if (value === undefined || value === null) {
                return tasks_1.PresentationOptions.defaults;
            }
            return Object.assign(Object.create(null), tasks_1.PresentationOptions.defaults, value);
        }
        TaskPresentationOptionsDTO.to = to;
    })(TaskPresentationOptionsDTO || (TaskPresentationOptionsDTO = {}));
    var RunOptionsDTO;
    (function (RunOptionsDTO) {
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return Object.assign(Object.create(null), value);
        }
        RunOptionsDTO.from = from;
        function to(value) {
            if (value === undefined || value === null) {
                return tasks_1.RunOptions.defaults;
            }
            return Object.assign(Object.create(null), tasks_1.RunOptions.defaults, value);
        }
        RunOptionsDTO.to = to;
    })(RunOptionsDTO || (RunOptionsDTO = {}));
    var ProcessExecutionOptionsDTO;
    (function (ProcessExecutionOptionsDTO) {
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return {
                cwd: value.cwd,
                env: value.env
            };
        }
        ProcessExecutionOptionsDTO.from = from;
        function to(value) {
            if (value === undefined || value === null) {
                return tasks_1.CommandOptions.defaults;
            }
            return {
                cwd: value.cwd || tasks_1.CommandOptions.defaults.cwd,
                env: value.env
            };
        }
        ProcessExecutionOptionsDTO.to = to;
    })(ProcessExecutionOptionsDTO || (ProcessExecutionOptionsDTO = {}));
    var ProcessExecutionDTO;
    (function (ProcessExecutionDTO) {
        function is(value) {
            const candidate = value;
            return candidate && !!candidate.process;
        }
        ProcessExecutionDTO.is = is;
        function from(value) {
            const process = Types.isString(value.name) ? value.name : value.name.value;
            const args = value.args ? value.args.map(value => Types.isString(value) ? value : value.value) : [];
            const result = {
                process: process,
                args: args
            };
            if (value.options) {
                result.options = ProcessExecutionOptionsDTO.from(value.options);
            }
            return result;
        }
        ProcessExecutionDTO.from = from;
        function to(value) {
            const result = {
                runtime: tasks_1.RuntimeType.Process,
                name: value.process,
                args: value.args,
                presentation: undefined
            };
            result.options = ProcessExecutionOptionsDTO.to(value.options);
            return result;
        }
        ProcessExecutionDTO.to = to;
    })(ProcessExecutionDTO || (ProcessExecutionDTO = {}));
    var ShellExecutionOptionsDTO;
    (function (ShellExecutionOptionsDTO) {
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            const result = {
                cwd: value.cwd || tasks_1.CommandOptions.defaults.cwd,
                env: value.env
            };
            if (value.shell) {
                result.executable = value.shell.executable;
                result.shellArgs = value.shell.args;
                result.shellQuoting = value.shell.quoting;
            }
            return result;
        }
        ShellExecutionOptionsDTO.from = from;
        function to(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            const result = {
                cwd: value.cwd,
                env: value.env
            };
            if (value.executable) {
                result.shell = {
                    executable: value.executable
                };
                if (value.shellArgs) {
                    result.shell.args = value.shellArgs;
                }
                if (value.shellQuoting) {
                    result.shell.quoting = value.shellQuoting;
                }
            }
            return result;
        }
        ShellExecutionOptionsDTO.to = to;
    })(ShellExecutionOptionsDTO || (ShellExecutionOptionsDTO = {}));
    var ShellExecutionDTO;
    (function (ShellExecutionDTO) {
        function is(value) {
            const candidate = value;
            return candidate && (!!candidate.commandLine || !!candidate.command);
        }
        ShellExecutionDTO.is = is;
        function from(value) {
            const result = {};
            if (value.name && Types.isString(value.name) && (value.args === undefined || value.args === null || value.args.length === 0)) {
                result.commandLine = value.name;
            }
            else {
                result.command = value.name;
                result.args = value.args;
            }
            if (value.options) {
                result.options = ShellExecutionOptionsDTO.from(value.options);
            }
            return result;
        }
        ShellExecutionDTO.from = from;
        function to(value) {
            const result = {
                runtime: tasks_1.RuntimeType.Shell,
                name: value.commandLine ? value.commandLine : value.command,
                args: value.args,
                presentation: undefined
            };
            if (value.options) {
                result.options = ShellExecutionOptionsDTO.to(value.options);
            }
            return result;
        }
        ShellExecutionDTO.to = to;
    })(ShellExecutionDTO || (ShellExecutionDTO = {}));
    var CustomExecutionDTO;
    (function (CustomExecutionDTO) {
        function is(value) {
            const candidate = value;
            return candidate && candidate.customExecution === 'customExecution';
        }
        CustomExecutionDTO.is = is;
        function from(value) {
            return {
                customExecution: 'customExecution'
            };
        }
        CustomExecutionDTO.from = from;
        function to(value) {
            return {
                runtime: tasks_1.RuntimeType.CustomExecution,
                presentation: undefined
            };
        }
        CustomExecutionDTO.to = to;
    })(CustomExecutionDTO || (CustomExecutionDTO = {}));
    var TaskSourceDTO;
    (function (TaskSourceDTO) {
        function from(value) {
            const result = {
                label: value.label
            };
            if (value.kind === tasks_1.TaskSourceKind.Extension) {
                result.extensionId = value.extension;
                if (value.workspaceFolder) {
                    result.scope = value.workspaceFolder.uri;
                }
                else {
                    result.scope = value.scope;
                }
            }
            else if (value.kind === tasks_1.TaskSourceKind.Workspace) {
                result.extensionId = '$core';
                result.scope = value.config.workspaceFolder ? value.config.workspaceFolder.uri : 1 /* TaskScope.Global */;
            }
            return result;
        }
        TaskSourceDTO.from = from;
        function to(value, workspace) {
            let scope;
            let workspaceFolder;
            if ((value.scope === undefined) || ((typeof value.scope === 'number') && (value.scope !== 1 /* TaskScope.Global */))) {
                if (workspace.getWorkspace().folders.length === 0) {
                    scope = 1 /* TaskScope.Global */;
                    workspaceFolder = undefined;
                }
                else {
                    scope = 3 /* TaskScope.Folder */;
                    workspaceFolder = workspace.getWorkspace().folders[0];
                }
            }
            else if (typeof value.scope === 'number') {
                scope = value.scope;
            }
            else {
                scope = 3 /* TaskScope.Folder */;
                workspaceFolder = workspace.getWorkspaceFolder(uri_1.URI.revive(value.scope)) ?? undefined;
            }
            const result = {
                kind: tasks_1.TaskSourceKind.Extension,
                label: value.label,
                extension: value.extensionId,
                scope,
                workspaceFolder
            };
            return result;
        }
        TaskSourceDTO.to = to;
    })(TaskSourceDTO || (TaskSourceDTO = {}));
    var TaskHandleDTO;
    (function (TaskHandleDTO) {
        function is(value) {
            const candidate = value;
            return candidate && Types.isString(candidate.id) && !!candidate.workspaceFolder;
        }
        TaskHandleDTO.is = is;
    })(TaskHandleDTO || (TaskHandleDTO = {}));
    var TaskDTO;
    (function (TaskDTO) {
        function from(task) {
            if (task === undefined || task === null || (!tasks_1.CustomTask.is(task) && !tasks_1.ContributedTask.is(task) && !tasks_1.ConfiguringTask.is(task))) {
                return undefined;
            }
            const result = {
                _id: task._id,
                name: task.configurationProperties.name,
                definition: TaskDefinitionDTO.from(task.getDefinition(true)),
                source: TaskSourceDTO.from(task._source),
                execution: undefined,
                presentationOptions: !tasks_1.ConfiguringTask.is(task) && task.command ? TaskPresentationOptionsDTO.from(task.command.presentation) : undefined,
                isBackground: task.configurationProperties.isBackground,
                problemMatchers: [],
                hasDefinedMatchers: tasks_1.ContributedTask.is(task) ? task.hasDefinedMatchers : false,
                runOptions: RunOptionsDTO.from(task.runOptions),
            };
            result.group = TaskGroupDTO.from(task.configurationProperties.group);
            if (task.configurationProperties.detail) {
                result.detail = task.configurationProperties.detail;
            }
            if (!tasks_1.ConfiguringTask.is(task) && task.command) {
                switch (task.command.runtime) {
                    case tasks_1.RuntimeType.Process:
                        result.execution = ProcessExecutionDTO.from(task.command);
                        break;
                    case tasks_1.RuntimeType.Shell:
                        result.execution = ShellExecutionDTO.from(task.command);
                        break;
                    case tasks_1.RuntimeType.CustomExecution:
                        result.execution = CustomExecutionDTO.from(task.command);
                        break;
                }
            }
            if (task.configurationProperties.problemMatchers) {
                for (const matcher of task.configurationProperties.problemMatchers) {
                    if (Types.isString(matcher)) {
                        result.problemMatchers.push(matcher);
                    }
                }
            }
            return result;
        }
        TaskDTO.from = from;
        function to(task, workspace, executeOnly, icon, hide) {
            if (!task || (typeof task.name !== 'string')) {
                return undefined;
            }
            let command;
            if (task.execution) {
                if (ShellExecutionDTO.is(task.execution)) {
                    command = ShellExecutionDTO.to(task.execution);
                }
                else if (ProcessExecutionDTO.is(task.execution)) {
                    command = ProcessExecutionDTO.to(task.execution);
                }
                else if (CustomExecutionDTO.is(task.execution)) {
                    command = CustomExecutionDTO.to(task.execution);
                }
            }
            if (!command) {
                return undefined;
            }
            command.presentation = TaskPresentationOptionsDTO.to(task.presentationOptions);
            const source = TaskSourceDTO.to(task.source, workspace);
            const label = nls.localize('task.label', '{0}: {1}', source.label, task.name);
            const definition = TaskDefinitionDTO.to(task.definition, executeOnly);
            const id = (CustomExecutionDTO.is(task.execution) && task._id) ? task._id : `${task.source.extensionId}.${definition._key}`;
            const result = new tasks_1.ContributedTask(id, // uuidMap.getUUID(identifier)
            source, label, definition.type, definition, command, task.hasDefinedMatchers, RunOptionsDTO.to(task.runOptions), {
                name: task.name,
                identifier: label,
                group: task.group,
                isBackground: !!task.isBackground,
                problemMatchers: task.problemMatchers.slice(),
                detail: task.detail,
                icon,
                hide
            });
            return result;
        }
        TaskDTO.to = to;
    })(TaskDTO || (TaskDTO = {}));
    var TaskGroupDTO;
    (function (TaskGroupDTO) {
        function from(value) {
            if (value === undefined) {
                return undefined;
            }
            return {
                _id: (typeof value === 'string') ? value : value._id,
                isDefault: (typeof value === 'string') ? false : ((typeof value.isDefault === 'string') ? false : value.isDefault)
            };
        }
        TaskGroupDTO.from = from;
    })(TaskGroupDTO || (TaskGroupDTO = {}));
    var TaskFilterDTO;
    (function (TaskFilterDTO) {
        function from(value) {
            return value;
        }
        TaskFilterDTO.from = from;
        function to(value) {
            return value;
        }
        TaskFilterDTO.to = to;
    })(TaskFilterDTO || (TaskFilterDTO = {}));
    let MainThreadTask = class MainThreadTask {
        constructor(extHostContext, _taskService, _workspaceContextServer, _configurationResolverService) {
            this._taskService = _taskService;
            this._workspaceContextServer = _workspaceContextServer;
            this._configurationResolverService = _configurationResolverService;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostTask);
            this._providers = new Map();
            this._taskService.onDidStateChange(async (event) => {
                if (event.kind === "changed" /* TaskEventKind.Changed */) {
                    return;
                }
                const task = event.__task;
                if (event.kind === "start" /* TaskEventKind.Start */) {
                    const execution = TaskExecutionDTO.from(task.getTaskExecution());
                    let resolvedDefinition = execution.task.definition;
                    if (execution.task?.execution && CustomExecutionDTO.is(execution.task.execution) && event.resolvedVariables) {
                        const dictionary = {};
                        for (const [key, value] of event.resolvedVariables.entries()) {
                            dictionary[key] = value;
                        }
                        resolvedDefinition = await this._configurationResolverService.resolveAnyAsync(task.getWorkspaceFolder(), execution.task.definition, dictionary);
                    }
                    this._proxy.$onDidStartTask(execution, event.terminalId, resolvedDefinition);
                }
                else if (event.kind === "processStarted" /* TaskEventKind.ProcessStarted */) {
                    this._proxy.$onDidStartTaskProcess(TaskProcessStartedDTO.from(task.getTaskExecution(), event.processId));
                }
                else if (event.kind === "processEnded" /* TaskEventKind.ProcessEnded */) {
                    this._proxy.$onDidEndTaskProcess(TaskProcessEndedDTO.from(task.getTaskExecution(), event.exitCode));
                }
                else if (event.kind === "end" /* TaskEventKind.End */) {
                    this._proxy.$OnDidEndTask(TaskExecutionDTO.from(task.getTaskExecution()));
                }
            });
        }
        dispose() {
            for (const value of this._providers.values()) {
                value.disposable.dispose();
            }
            this._providers.clear();
        }
        $createTaskId(taskDTO) {
            return new Promise((resolve, reject) => {
                const task = TaskDTO.to(taskDTO, this._workspaceContextServer, true);
                if (task) {
                    resolve(task._id);
                }
                else {
                    reject(new Error('Task could not be created from DTO'));
                }
            });
        }
        $registerTaskProvider(handle, type) {
            const provider = {
                provideTasks: (validTypes) => {
                    return Promise.resolve(this._proxy.$provideTasks(handle, validTypes)).then((value) => {
                        const tasks = [];
                        for (const dto of value.tasks) {
                            const task = TaskDTO.to(dto, this._workspaceContextServer, true);
                            if (task) {
                                tasks.push(task);
                            }
                            else {
                                console.error(`Task System: can not convert task: ${JSON.stringify(dto.definition, undefined, 0)}. Task will be dropped`);
                            }
                        }
                        return {
                            tasks,
                            extension: value.extension
                        };
                    });
                },
                resolveTask: (task) => {
                    const dto = TaskDTO.from(task);
                    if (dto) {
                        dto.name = ((dto.name === undefined) ? '' : dto.name); // Using an empty name causes the name to default to the one given by the provider.
                        return Promise.resolve(this._proxy.$resolveTask(handle, dto)).then(resolvedTask => {
                            if (resolvedTask) {
                                return TaskDTO.to(resolvedTask, this._workspaceContextServer, true, task.configurationProperties.icon, task.configurationProperties.hide);
                            }
                            return undefined;
                        });
                    }
                    return Promise.resolve(undefined);
                }
            };
            const disposable = this._taskService.registerTaskProvider(provider, type);
            this._providers.set(handle, { disposable, provider });
            return Promise.resolve(undefined);
        }
        $unregisterTaskProvider(handle) {
            const provider = this._providers.get(handle);
            if (provider) {
                provider.disposable.dispose();
                this._providers.delete(handle);
            }
            return Promise.resolve(undefined);
        }
        $fetchTasks(filter) {
            return this._taskService.tasks(TaskFilterDTO.to(filter)).then((tasks) => {
                const result = [];
                for (const task of tasks) {
                    const item = TaskDTO.from(task);
                    if (item) {
                        result.push(item);
                    }
                }
                return result;
            });
        }
        getWorkspace(value) {
            let workspace;
            if (typeof value === 'string') {
                workspace = value;
            }
            else {
                const workspaceObject = this._workspaceContextServer.getWorkspace();
                const uri = uri_1.URI.revive(value);
                if (workspaceObject.configuration?.toString() === uri.toString()) {
                    workspace = workspaceObject;
                }
                else {
                    workspace = this._workspaceContextServer.getWorkspaceFolder(uri);
                }
            }
            return workspace;
        }
        async $getTaskExecution(value) {
            if (TaskHandleDTO.is(value)) {
                const workspace = this.getWorkspace(value.workspaceFolder);
                if (workspace) {
                    const task = await this._taskService.getTask(workspace, value.id, true);
                    if (task) {
                        return {
                            id: task._id,
                            task: TaskDTO.from(task)
                        };
                    }
                    throw new Error('Task not found');
                }
                else {
                    throw new Error('No workspace folder');
                }
            }
            else {
                const task = TaskDTO.to(value, this._workspaceContextServer, true);
                return {
                    id: task._id,
                    task: TaskDTO.from(task)
                };
            }
        }
        // Passing in a TaskHandleDTO will cause the task to get re-resolved, which is important for tasks are coming from the core,
        // such as those gotten from a fetchTasks, since they can have missing configuration properties.
        $executeTask(value) {
            return new Promise((resolve, reject) => {
                if (TaskHandleDTO.is(value)) {
                    const workspace = this.getWorkspace(value.workspaceFolder);
                    if (workspace) {
                        this._taskService.getTask(workspace, value.id, true).then((task) => {
                            if (!task) {
                                reject(new Error('Task not found'));
                            }
                            else {
                                const result = {
                                    id: value.id,
                                    task: TaskDTO.from(task)
                                };
                                this._taskService.run(task).then(summary => {
                                    // Ensure that the task execution gets cleaned up if the exit code is undefined
                                    // This can happen when the task has dependent tasks and one of them failed
                                    if ((summary?.exitCode === undefined) || (summary.exitCode !== 0)) {
                                        this._proxy.$OnDidEndTask(result);
                                    }
                                }, reason => {
                                    // eat the error, it has already been surfaced to the user and we don't care about it here
                                });
                                resolve(result);
                            }
                        }, (_error) => {
                            reject(new Error('Task not found'));
                        });
                    }
                    else {
                        reject(new Error('No workspace folder'));
                    }
                }
                else {
                    const task = TaskDTO.to(value, this._workspaceContextServer, true);
                    this._taskService.run(task).then(undefined, reason => {
                        // eat the error, it has already been surfaced to the user and we don't care about it here
                    });
                    const result = {
                        id: task._id,
                        task: TaskDTO.from(task)
                    };
                    resolve(result);
                }
            });
        }
        $customExecutionComplete(id, result) {
            return new Promise((resolve, reject) => {
                this._taskService.getActiveTasks().then((tasks) => {
                    for (const task of tasks) {
                        if (id === task._id) {
                            this._taskService.extensionCallbackTaskComplete(task, result).then((value) => {
                                resolve(undefined);
                            }, (error) => {
                                reject(error);
                            });
                            return;
                        }
                    }
                    reject(new Error('Task to mark as complete not found'));
                });
            });
        }
        $terminateTask(id) {
            return new Promise((resolve, reject) => {
                this._taskService.getActiveTasks().then((tasks) => {
                    for (const task of tasks) {
                        if (id === task._id) {
                            this._taskService.terminate(task).then((value) => {
                                resolve(undefined);
                            }, (error) => {
                                reject(undefined);
                            });
                            return;
                        }
                    }
                    reject(new errors_1.ErrorNoTelemetry('Task to terminate not found'));
                });
            });
        }
        $registerTaskSystem(key, info) {
            let platform;
            switch (info.platform) {
                case 'Web':
                    platform = 0 /* Platform.Platform.Web */;
                    break;
                case 'win32':
                    platform = 3 /* Platform.Platform.Windows */;
                    break;
                case 'darwin':
                    platform = 1 /* Platform.Platform.Mac */;
                    break;
                case 'linux':
                    platform = 2 /* Platform.Platform.Linux */;
                    break;
                default:
                    platform = Platform.platform;
            }
            this._taskService.registerTaskSystem(key, {
                platform: platform,
                uriProvider: (path) => {
                    return uri_1.URI.from({ scheme: info.scheme, authority: info.authority, path });
                },
                context: this._extHostContext,
                resolveVariables: (workspaceFolder, toResolve, target) => {
                    const vars = [];
                    toResolve.variables.forEach(item => vars.push(item));
                    return Promise.resolve(this._proxy.$resolveVariables(workspaceFolder.uri, { process: toResolve.process, variables: vars })).then(values => {
                        const partiallyResolvedVars = Array.from(Object.values(values.variables));
                        return new Promise((resolve, reject) => {
                            this._configurationResolverService.resolveWithInteraction(workspaceFolder, partiallyResolvedVars, 'tasks', undefined, target).then(resolvedVars => {
                                if (!resolvedVars) {
                                    resolve(undefined);
                                }
                                const result = {
                                    process: undefined,
                                    variables: new Map()
                                };
                                for (let i = 0; i < partiallyResolvedVars.length; i++) {
                                    const variableName = vars[i].substring(2, vars[i].length - 1);
                                    if (resolvedVars && values.variables[vars[i]] === vars[i]) {
                                        const resolved = resolvedVars.get(variableName);
                                        if (typeof resolved === 'string') {
                                            result.variables.set(variableName, resolved);
                                        }
                                    }
                                    else {
                                        result.variables.set(variableName, partiallyResolvedVars[i]);
                                    }
                                }
                                if (Types.isString(values.process)) {
                                    result.process = values.process;
                                }
                                resolve(result);
                            }, reason => {
                                reject(reason);
                            });
                        });
                    });
                },
                findExecutable: (command, cwd, paths) => {
                    return this._proxy.$findExecutable(command, cwd, paths);
                }
            });
        }
        async $registerSupportedExecutions(custom, shell, process) {
            return this._taskService.registerSupportedExecutions(custom, shell, process);
        }
    };
    exports.MainThreadTask = MainThreadTask;
    exports.MainThreadTask = MainThreadTask = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadTask),
        __param(1, taskService_1.ITaskService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, configurationResolver_1.IConfigurationResolverService)
    ], MainThreadTask);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFRhc2suanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZFRhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0NoRyxJQUFVLGdCQUFnQixDQU96QjtJQVBELFdBQVUsZ0JBQWdCO1FBQ3pCLFNBQWdCLElBQUksQ0FBQyxLQUFxQjtZQUN6QyxPQUFPO2dCQUNOLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDWixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2FBQzlCLENBQUM7UUFDSCxDQUFDO1FBTGUscUJBQUksT0FLbkIsQ0FBQTtJQUNGLENBQUMsRUFQUyxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBT3pCO0lBRUQsSUFBVSxxQkFBcUIsQ0FPOUI7SUFQRCxXQUFVLHFCQUFxQjtRQUM5QixTQUFnQixJQUFJLENBQUMsS0FBcUIsRUFBRSxTQUFpQjtZQUM1RCxPQUFPO2dCQUNOLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDWixTQUFTO2FBQ1QsQ0FBQztRQUNILENBQUM7UUFMZSwwQkFBSSxPQUtuQixDQUFBO0lBQ0YsQ0FBQyxFQVBTLHFCQUFxQixLQUFyQixxQkFBcUIsUUFPOUI7SUFFRCxJQUFVLG1CQUFtQixDQU81QjtJQVBELFdBQVUsbUJBQW1CO1FBQzVCLFNBQWdCLElBQUksQ0FBQyxLQUFxQixFQUFFLFFBQTRCO1lBQ3ZFLE9BQU87Z0JBQ04sRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUNaLFFBQVE7YUFDUixDQUFDO1FBQ0gsQ0FBQztRQUxlLHdCQUFJLE9BS25CLENBQUE7SUFDRixDQUFDLEVBUFMsbUJBQW1CLEtBQW5CLG1CQUFtQixRQU81QjtJQUVELElBQVUsaUJBQWlCLENBZ0IxQjtJ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