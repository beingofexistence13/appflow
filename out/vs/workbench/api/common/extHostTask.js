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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/async", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostConfiguration", "vs/base/common/cancellation", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostInitDataService", "vs/platform/instantiation/common/instantiation", "vs/base/common/network", "vs/base/common/platform", "vs/platform/log/common/log", "vs/workbench/api/common/extHostApiDeprecationService", "vs/workbench/contrib/tasks/common/tasks", "vs/base/common/errors"], function (require, exports, uri_1, async_1, event_1, extHost_protocol_1, types, extHostWorkspace_1, extHostDocumentsAndEditors_1, extHostConfiguration_1, cancellation_1, extHostTerminalService_1, extHostRpcService_1, extHostInitDataService_1, instantiation_1, network_1, Platform, log_1, extHostApiDeprecationService_1, tasks_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostTask = exports.WorkerExtHostTask = exports.ExtHostTaskBase = exports.TaskDTO = exports.TaskHandleDTO = exports.CustomExecutionDTO = void 0;
    var TaskDefinitionDTO;
    (function (TaskDefinitionDTO) {
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return value;
        }
        TaskDefinitionDTO.from = from;
        function to(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return value;
        }
        TaskDefinitionDTO.to = to;
    })(TaskDefinitionDTO || (TaskDefinitionDTO = {}));
    var TaskPresentationOptionsDTO;
    (function (TaskPresentationOptionsDTO) {
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return value;
        }
        TaskPresentationOptionsDTO.from = from;
        function to(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return value;
        }
        TaskPresentationOptionsDTO.to = to;
    })(TaskPresentationOptionsDTO || (TaskPresentationOptionsDTO = {}));
    var ProcessExecutionOptionsDTO;
    (function (ProcessExecutionOptionsDTO) {
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return value;
        }
        ProcessExecutionOptionsDTO.from = from;
        function to(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return value;
        }
        ProcessExecutionOptionsDTO.to = to;
    })(ProcessExecutionOptionsDTO || (ProcessExecutionOptionsDTO = {}));
    var ProcessExecutionDTO;
    (function (ProcessExecutionDTO) {
        function is(value) {
            if (value) {
                const candidate = value;
                return candidate && !!candidate.process;
            }
            else {
                return false;
            }
        }
        ProcessExecutionDTO.is = is;
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            const result = {
                process: value.process,
                args: value.args
            };
            if (value.options) {
                result.options = ProcessExecutionOptionsDTO.from(value.options);
            }
            return result;
        }
        ProcessExecutionDTO.from = from;
        function to(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return new types.ProcessExecution(value.process, value.args, value.options);
        }
        ProcessExecutionDTO.to = to;
    })(ProcessExecutionDTO || (ProcessExecutionDTO = {}));
    var ShellExecutionOptionsDTO;
    (function (ShellExecutionOptionsDTO) {
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return value;
        }
        ShellExecutionOptionsDTO.from = from;
        function to(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return value;
        }
        ShellExecutionOptionsDTO.to = to;
    })(ShellExecutionOptionsDTO || (ShellExecutionOptionsDTO = {}));
    var ShellExecutionDTO;
    (function (ShellExecutionDTO) {
        function is(value) {
            if (value) {
                const candidate = value;
                return candidate && (!!candidate.commandLine || !!candidate.command);
            }
            else {
                return false;
            }
        }
        ShellExecutionDTO.is = is;
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            const result = {};
            if (value.commandLine !== undefined) {
                result.commandLine = value.commandLine;
            }
            else {
                result.command = value.command;
                result.args = value.args;
            }
            if (value.options) {
                result.options = ShellExecutionOptionsDTO.from(value.options);
            }
            return result;
        }
        ShellExecutionDTO.from = from;
        function to(value) {
            if (value === undefined || value === null || (value.command === undefined && value.commandLine === undefined)) {
                return undefined;
            }
            if (value.commandLine) {
                return new types.ShellExecution(value.commandLine, value.options);
            }
            else {
                return new types.ShellExecution(value.command, value.args ? value.args : [], value.options);
            }
        }
        ShellExecutionDTO.to = to;
    })(ShellExecutionDTO || (ShellExecutionDTO = {}));
    var CustomExecutionDTO;
    (function (CustomExecutionDTO) {
        function is(value) {
            if (value) {
                const candidate = value;
                return candidate && candidate.customExecution === 'customExecution';
            }
            else {
                return false;
            }
        }
        CustomExecutionDTO.is = is;
        function from(value) {
            return {
                customExecution: 'customExecution'
            };
        }
        CustomExecutionDTO.from = from;
        function to(taskId, providedCustomExeutions) {
            return providedCustomExeutions.get(taskId);
        }
        CustomExecutionDTO.to = to;
    })(CustomExecutionDTO || (exports.CustomExecutionDTO = CustomExecutionDTO = {}));
    var TaskHandleDTO;
    (function (TaskHandleDTO) {
        function from(value, workspaceService) {
            let folder;
            if (value.scope !== undefined && typeof value.scope !== 'number') {
                folder = value.scope.uri;
            }
            else if (value.scope !== undefined && typeof value.scope === 'number') {
                if ((value.scope === types.TaskScope.Workspace) && workspaceService && workspaceService.workspaceFile) {
                    folder = workspaceService.workspaceFile;
                }
                else {
                    folder = tasks_1.USER_TASKS_GROUP_KEY;
                }
            }
            return {
                id: value._id,
                workspaceFolder: folder
            };
        }
        TaskHandleDTO.from = from;
    })(TaskHandleDTO || (exports.TaskHandleDTO = TaskHandleDTO = {}));
    var TaskGroupDTO;
    (function (TaskGroupDTO) {
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            return { _id: value.id, isDefault: value.isDefault };
        }
        TaskGroupDTO.from = from;
    })(TaskGroupDTO || (TaskGroupDTO = {}));
    var TaskDTO;
    (function (TaskDTO) {
        function fromMany(tasks, extension) {
            if (tasks === undefined || tasks === null) {
                return [];
            }
            const result = [];
            for (const task of tasks) {
                const converted = from(task, extension);
                if (converted) {
                    result.push(converted);
                }
            }
            return result;
        }
        TaskDTO.fromMany = fromMany;
        function from(value, extension) {
            if (value === undefined || value === null) {
                return undefined;
            }
            let execution;
            if (value.execution instanceof types.ProcessExecution) {
                execution = ProcessExecutionDTO.from(value.execution);
            }
            else if (value.execution instanceof types.ShellExecution) {
                execution = ShellExecutionDTO.from(value.execution);
            }
            else if (value.execution && value.execution instanceof types.CustomExecution) {
                execution = CustomExecutionDTO.from(value.execution);
            }
            const definition = TaskDefinitionDTO.from(value.definition);
            let scope;
            if (value.scope) {
                if (typeof value.scope === 'number') {
                    scope = value.scope;
                }
                else {
                    scope = value.scope.uri;
                }
            }
            else {
                // To continue to support the deprecated task constructor that doesn't take a scope, we must add a scope here:
                scope = types.TaskScope.Workspace;
            }
            if (!definition || !scope) {
                return undefined;
            }
            const result = {
                _id: value._id,
                definition,
                name: value.name,
                source: {
                    extensionId: extension.identifier.value,
                    label: value.source,
                    scope: scope
                },
                execution: execution,
                isBackground: value.isBackground,
                group: TaskGroupDTO.from(value.group),
                presentationOptions: TaskPresentationOptionsDTO.from(value.presentationOptions),
                problemMatchers: value.problemMatchers,
                hasDefinedMatchers: value.hasDefinedMatchers,
                runOptions: value.runOptions ? value.runOptions : { reevaluateOnRerun: true },
                detail: value.detail
            };
            return result;
        }
        TaskDTO.from = from;
        async function to(value, workspace, providedCustomExeutions) {
            if (value === undefined || value === null) {
                return undefined;
            }
            let execution;
            if (ProcessExecutionDTO.is(value.execution)) {
                execution = ProcessExecutionDTO.to(value.execution);
            }
            else if (ShellExecutionDTO.is(value.execution)) {
                execution = ShellExecutionDTO.to(value.execution);
            }
            else if (CustomExecutionDTO.is(value.execution)) {
                execution = CustomExecutionDTO.to(value._id, providedCustomExeutions);
            }
            const definition = TaskDefinitionDTO.to(value.definition);
            let scope;
            if (value.source) {
                if (value.source.scope !== undefined) {
                    if (typeof value.source.scope === 'number') {
                        scope = value.source.scope;
                    }
                    else {
                        scope = await workspace.resolveWorkspaceFolder(uri_1.URI.revive(value.source.scope));
                    }
                }
                else {
                    scope = types.TaskScope.Workspace;
                }
            }
            if (!definition || !scope) {
                return undefined;
            }
            const result = new types.Task(definition, scope, value.name, value.source.label, execution, value.problemMatchers);
            if (value.isBackground !== undefined) {
                result.isBackground = value.isBackground;
            }
            if (value.group !== undefined) {
                result.group = types.TaskGroup.from(value.group._id);
                if (result.group && value.group.isDefault) {
                    result.group = new types.TaskGroup(result.group.id, result.group.label);
                    if (value.group.isDefault === true) {
                        result.group.isDefault = value.group.isDefault;
                    }
                }
            }
            if (value.presentationOptions) {
                result.presentationOptions = TaskPresentationOptionsDTO.to(value.presentationOptions);
            }
            if (value._id) {
                result._id = value._id;
            }
            if (value.detail) {
                result.detail = value.detail;
            }
            return result;
        }
        TaskDTO.to = to;
    })(TaskDTO || (exports.TaskDTO = TaskDTO = {}));
    var TaskFilterDTO;
    (function (TaskFilterDTO) {
        function from(value) {
            return value;
        }
        TaskFilterDTO.from = from;
        function to(value) {
            if (!value) {
                return undefined;
            }
            return Object.assign(Object.create(null), value);
        }
        TaskFilterDTO.to = to;
    })(TaskFilterDTO || (TaskFilterDTO = {}));
    class TaskExecutionImpl {
        #tasks;
        constructor(tasks, _id, _task) {
            this._id = _id;
            this._task = _task;
            this.#tasks = tasks;
        }
        get task() {
            return this._task;
        }
        terminate() {
            this.#tasks.terminateTask(this);
        }
        fireDidStartProcess(value) {
        }
        fireDidEndProcess(value) {
        }
    }
    let ExtHostTaskBase = class ExtHostTaskBase {
        constructor(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService) {
            this._onDidExecuteTask = new event_1.Emitter();
            this._onDidTerminateTask = new event_1.Emitter();
            this._onDidTaskProcessStarted = new event_1.Emitter();
            this._onDidTaskProcessEnded = new event_1.Emitter();
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadTask);
            this._workspaceProvider = workspaceService;
            this._editorService = editorService;
            this._configurationService = configurationService;
            this._terminalService = extHostTerminalService;
            this._handleCounter = 0;
            this._handlers = new Map();
            this._taskExecutions = new Map();
            this._taskExecutionPromises = new Map();
            this._providedCustomExecutions2 = new Map();
            this._notProvidedCustomExecutions = new Set();
            this._activeCustomExecutions2 = new Map();
            this._logService = logService;
            this._deprecationService = deprecationService;
            this._proxy.$registerSupportedExecutions(true);
        }
        registerTaskProvider(extension, type, provider) {
            if (!provider) {
                return new types.Disposable(() => { });
            }
            const handle = this.nextHandle();
            this._handlers.set(handle, { type, provider, extension });
            this._proxy.$registerTaskProvider(handle, type);
            return new types.Disposable(() => {
                this._handlers.delete(handle);
                this._proxy.$unregisterTaskProvider(handle);
            });
        }
        registerTaskSystem(scheme, info) {
            this._proxy.$registerTaskSystem(scheme, info);
        }
        fetchTasks(filter) {
            return this._proxy.$fetchTasks(TaskFilterDTO.from(filter)).then(async (values) => {
                const result = [];
                for (const value of values) {
                    const task = await TaskDTO.to(value, this._workspaceProvider, this._providedCustomExecutions2);
                    if (task) {
                        result.push(task);
                    }
                }
                return result;
            });
        }
        get taskExecutions() {
            const result = [];
            this._taskExecutions.forEach(value => result.push(value));
            return result;
        }
        terminateTask(execution) {
            if (!(execution instanceof TaskExecutionImpl)) {
                throw new Error('No valid task execution provided');
            }
            return this._proxy.$terminateTask(execution._id);
        }
        get onDidStartTask() {
            return this._onDidExecuteTask.event;
        }
        async $onDidStartTask(execution, terminalId, resolvedDefinition) {
            const customExecution = this._providedCustomExecutions2.get(execution.id);
            if (customExecution) {
                // Clone the custom execution to keep the original untouched. This is important for multiple runs of the same task.
                this._activeCustomExecutions2.set(execution.id, customExecution);
                this._terminalService.attachPtyToTerminal(terminalId, await customExecution.callback(resolvedDefinition));
            }
            this._lastStartedTask = execution.id;
            this._onDidExecuteTask.fire({
                execution: await this.getTaskExecution(execution)
            });
        }
        get onDidEndTask() {
            return this._onDidTerminateTask.event;
        }
        async $OnDidEndTask(execution) {
            const _execution = await this.getTaskExecution(execution);
            this._taskExecutionPromises.delete(execution.id);
            this._taskExecutions.delete(execution.id);
            this.customExecutionComplete(execution);
            this._onDidTerminateTask.fire({
                execution: _execution
            });
        }
        get onDidStartTaskProcess() {
            return this._onDidTaskProcessStarted.event;
        }
        async $onDidStartTaskProcess(value) {
            const execution = await this.getTaskExecution(value.id);
            this._onDidTaskProcessStarted.fire({
                execution: execution,
                processId: value.processId
            });
        }
        get onDidEndTaskProcess() {
            return this._onDidTaskProcessEnded.event;
        }
        async $onDidEndTaskProcess(value) {
            const execution = await this.getTaskExecution(value.id);
            this._onDidTaskProcessEnded.fire({
                execution: execution,
                exitCode: value.exitCode
            });
        }
        $provideTasks(handle, validTypes) {
            const handler = this._handlers.get(handle);
            if (!handler) {
                return Promise.reject(new Error('no handler found'));
            }
            // Set up a list of task ID promises that we can wait on
            // before returning the provided tasks. The ensures that
            // our task IDs are calculated for any custom execution tasks.
            // Knowing this ID ahead of time is needed because when a task
            // start event is fired this is when the custom execution is called.
            // The task start event is also the first time we see the ID from the main
            // thread, which is too late for us because we need to save an map
            // from an ID to the custom execution function. (Kind of a cart before the horse problem).
            const taskIdPromises = [];
            const fetchPromise = (0, async_1.asPromise)(() => handler.provider.provideTasks(cancellation_1.CancellationToken.None)).then(value => {
                return this.provideTasksInternal(validTypes, taskIdPromises, handler, value);
            });
            return new Promise((resolve) => {
                fetchPromise.then((result) => {
                    Promise.all(taskIdPromises).then(() => {
                        resolve(result);
                    });
                });
            });
        }
        async $resolveTask(handle, taskDTO) {
            const handler = this._handlers.get(handle);
            if (!handler) {
                return Promise.reject(new Error('no handler found'));
            }
            if (taskDTO.definition.type !== handler.type) {
                throw new Error(`Unexpected: Task of type [${taskDTO.definition.type}] cannot be resolved by provider of type [${handler.type}].`);
            }
            const task = await TaskDTO.to(taskDTO, this._workspaceProvider, this._providedCustomExecutions2);
            if (!task) {
                throw new Error('Unexpected: Task cannot be resolved.');
            }
            const resolvedTask = await handler.provider.resolveTask(task, cancellation_1.CancellationToken.None);
            if (!resolvedTask) {
                return;
            }
            this.checkDeprecation(resolvedTask, handler);
            const resolvedTaskDTO = TaskDTO.from(resolvedTask, handler.extension);
            if (!resolvedTaskDTO) {
                throw new Error('Unexpected: Task cannot be resolved.');
            }
            if (resolvedTask.definition !== task.definition) {
                throw new Error('Unexpected: The resolved task definition must be the same object as the original task definition. The task definition cannot be changed.');
            }
            if (CustomExecutionDTO.is(resolvedTaskDTO.execution)) {
                await this.addCustomExecution(resolvedTaskDTO, resolvedTask, true);
            }
            return await this.resolveTaskInternal(resolvedTaskDTO);
        }
        nextHandle() {
            return this._handleCounter++;
        }
        async addCustomExecution(taskDTO, task, isProvided) {
            const taskId = await this._proxy.$createTaskId(taskDTO);
            if (!isProvided && !this._providedCustomExecutions2.has(taskId)) {
                this._notProvidedCustomExecutions.add(taskId);
                // Also add to active executions when not coming from a provider to prevent timing issue.
                this._activeCustomExecutions2.set(taskId, task.execution);
            }
            this._providedCustomExecutions2.set(taskId, task.execution);
        }
        async getTaskExecution(execution, task) {
            if (typeof execution === 'string') {
                const taskExecution = this._taskExecutionPromises.get(execution);
                if (!taskExecution) {
                    throw new errors_1.ErrorNoTelemetry('Unexpected: The specified task is missing an execution');
                }
                return taskExecution;
            }
            const result = this._taskExecutionPromises.get(execution.id);
            if (result) {
                return result;
            }
            const createdResult = new Promise((resolve, reject) => {
                function resolvePromiseWithCreatedTask(that, execution, taskToCreate) {
                    if (!taskToCreate) {
                        reject('Unexpected: Task does not exist.');
                    }
                    else {
                        resolve(new TaskExecutionImpl(that, execution.id, taskToCreate));
                    }
                }
                if (task) {
                    resolvePromiseWithCreatedTask(this, execution, task);
                }
                else {
                    TaskDTO.to(execution.task, this._workspaceProvider, this._providedCustomExecutions2)
                        .then(task => resolvePromiseWithCreatedTask(this, execution, task));
                }
            });
            this._taskExecutionPromises.set(execution.id, createdResult);
            return createdResult.then(executionCreatedResult => {
                this._taskExecutions.set(execution.id, executionCreatedResult);
                return executionCreatedResult;
            }, rejected => {
                return Promise.reject(rejected);
            });
        }
        checkDeprecation(task, handler) {
            const tTask = task;
            if (tTask._deprecated) {
                this._deprecationService.report('Task.constructor', handler.extension, 'Use the Task constructor that takes a `scope` instead.');
            }
        }
        customExecutionComplete(execution) {
            const extensionCallback2 = this._activeCustomExecutions2.get(execution.id);
            if (extensionCallback2) {
                this._activeCustomExecutions2.delete(execution.id);
            }
            // Technically we don't really need to do this, however, if an extension
            // is executing a task through "executeTask" over and over again
            // with different properties in the task definition, then the map of executions
            // could grow indefinitely, something we don't want.
            if (this._notProvidedCustomExecutions.has(execution.id) && (this._lastStartedTask !== execution.id)) {
                this._providedCustomExecutions2.delete(execution.id);
                this._notProvidedCustomExecutions.delete(execution.id);
            }
            const iterator = this._notProvidedCustomExecutions.values();
            let iteratorResult = iterator.next();
            while (!iteratorResult.done) {
                if (!this._activeCustomExecutions2.has(iteratorResult.value) && (this._lastStartedTask !== iteratorResult.value)) {
                    this._providedCustomExecutions2.delete(iteratorResult.value);
                    this._notProvidedCustomExecutions.delete(iteratorResult.value);
                }
                iteratorResult = iterator.next();
            }
        }
    };
    exports.ExtHostTaskBase = ExtHostTaskBase;
    exports.ExtHostTaskBase = ExtHostTaskBase = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, extHostWorkspace_1.IExtHostWorkspace),
        __param(3, extHostDocumentsAndEditors_1.IExtHostDocumentsAndEditors),
        __param(4, extHostConfiguration_1.IExtHostConfiguration),
        __param(5, extHostTerminalService_1.IExtHostTerminalService),
        __param(6, log_1.ILogService),
        __param(7, extHostApiDeprecationService_1.IExtHostApiDeprecationService)
    ], ExtHostTaskBase);
    let WorkerExtHostTask = class WorkerExtHostTask extends ExtHostTaskBase {
        constructor(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService) {
            super(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService);
            this.registerTaskSystem(network_1.Schemas.vscodeRemote, {
                scheme: network_1.Schemas.vscodeRemote,
                authority: '',
                platform: Platform.PlatformToString(0 /* Platform.Platform.Web */)
            });
        }
        async executeTask(extension, task) {
            if (!task.execution) {
                throw new Error('Tasks to execute must include an execution');
            }
            const dto = TaskDTO.from(task, extension);
            if (dto === undefined) {
                throw new Error('Task is not valid');
            }
            // If this task is a custom execution, then we need to save it away
            // in the provided custom execution map that is cleaned up after the
            // task is executed.
            if (CustomExecutionDTO.is(dto.execution)) {
                await this.addCustomExecution(dto, task, false);
            }
            else {
                throw new errors_1.NotSupportedError();
            }
            // Always get the task execution first to prevent timing issues when retrieving it later
            const execution = await this.getTaskExecution(await this._proxy.$getTaskExecution(dto), task);
            this._proxy.$executeTask(dto).catch(error => { throw new Error(error); });
            return execution;
        }
        provideTasksInternal(validTypes, taskIdPromises, handler, value) {
            const taskDTOs = [];
            if (value) {
                for (const task of value) {
                    this.checkDeprecation(task, handler);
                    if (!task.definition || !validTypes[task.definition.type]) {
                        this._logService.warn(`The task [${task.source}, ${task.name}] uses an undefined task type. The task will be ignored in the future.`);
                    }
                    const taskDTO = TaskDTO.from(task, handler.extension);
                    if (taskDTO && CustomExecutionDTO.is(taskDTO.execution)) {
                        taskDTOs.push(taskDTO);
                        // The ID is calculated on the main thread task side, so, let's call into it here.
                        // We need the task id's pre-computed for custom task executions because when OnDidStartTask
                        // is invoked, we have to be able to map it back to our data.
                        taskIdPromises.push(this.addCustomExecution(taskDTO, task, true));
                    }
                    else {
                        this._logService.warn('Only custom execution tasks supported.');
                    }
                }
            }
            return {
                tasks: taskDTOs,
                extension: handler.extension
            };
        }
        async resolveTaskInternal(resolvedTaskDTO) {
            if (CustomExecutionDTO.is(resolvedTaskDTO.execution)) {
                return resolvedTaskDTO;
            }
            else {
                this._logService.warn('Only custom execution tasks supported.');
            }
            return undefined;
        }
        async $resolveVariables(uriComponents, toResolve) {
            const result = {
                process: undefined,
                variables: Object.create(null)
            };
            return result;
        }
        async $jsonTasksSupported() {
            return false;
        }
        async $findExecutable(command, cwd, paths) {
            return undefined;
        }
    };
    exports.WorkerExtHostTask = WorkerExtHostTask;
    exports.WorkerExtHostTask = WorkerExtHostTask = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, extHostWorkspace_1.IExtHostWorkspace),
        __param(3, extHostDocumentsAndEditors_1.IExtHostDocumentsAndEditors),
        __param(4, extHostConfiguration_1.IExtHostConfiguration),
        __param(5, extHostTerminalService_1.IExtHostTerminalService),
        __param(6, log_1.ILogService),
        __param(7, extHostApiDeprecationService_1.IExtHostApiDeprecationService)
    ], WorkerExtHostTask);
    exports.IExtHostTask = (0, instantiation_1.createDecorator)('IExtHostTask');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRhc2suanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0VGFzay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE2Q2hHLElBQVUsaUJBQWlCLENBYTFCO0lBYkQsV0FBVSxpQkFBaUI7UUFDMUIsU0FBZ0IsSUFBSSxDQUFDLEtBQTRCO1lBQ2hELElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUMxQyxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUxlLHNCQUFJLE9BS25CLENBQUE7UUFDRCxTQUFnQixFQUFFLENBQUMsS0FBK0I7WUFDakQsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQzFDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBTGUsb0JBQUUsS0FLakIsQ0FBQTtJQUNGLENBQUMsRUFiUyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBYTFCO0lBRUQsSUFBVSwwQkFBMEIsQ0FhbkM7SUFiRCxXQUFVLDBCQUEwQjtRQUNuQyxTQUFnQixJQUFJLENBQUMsS0FBcUM7WUFDekQsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQzFDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBTGUsK0JBQUksT0FLbkIsQ0FBQTtRQUNELFNBQWdCLEVBQUUsQ0FBQyxLQUF3QztZQUMxRCxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDMUMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFMZSw2QkFBRSxLQUtqQixDQUFBO0lBQ0YsQ0FBQyxFQWJTLDBCQUEwQixLQUExQiwwQkFBMEIsUUFhbkM7SUFFRCxJQUFVLDBCQUEwQixDQWFuQztJQWJELFdBQVUsMEJBQTBCO1FBQ25DLFNBQWdCLElBQUksQ0FBQyxLQUFxQztZQUN6RCxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDMUMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFMZSwrQkFBSSxPQUtuQixDQUFBO1FBQ0QsU0FBZ0IsRUFBRSxDQUFDLEtBQXdDO1lBQzFELElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUMxQyxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUxlLDZCQUFFLEtBS2pCLENBQUE7SUFDRixDQUFDLEVBYlMsMEJBQTBCLEtBQTFCLDBCQUEwQixRQWFuQztJQUVELElBQVUsbUJBQW1CLENBNEI1QjtJQTVCRCxXQUFVLG1CQUFtQjtRQUM1QixTQUFnQixFQUFFLENBQUMsS0FBb0c7WUFDdEgsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsTUFBTSxTQUFTLEdBQUcsS0FBbUMsQ0FBQztnQkFDdEQsT0FBTyxTQUFTLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7YUFDeEM7aUJBQU07Z0JBQ04sT0FBTyxLQUFLLENBQUM7YUFDYjtRQUNGLENBQUM7UUFQZSxzQkFBRSxLQU9qQixDQUFBO1FBQ0QsU0FBZ0IsSUFBSSxDQUFDLEtBQThCO1lBQ2xELElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUMxQyxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE1BQU0sTUFBTSxHQUErQjtnQkFDMUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO2dCQUN0QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7YUFDaEIsQ0FBQztZQUNGLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtnQkFDbEIsTUFBTSxDQUFDLE9BQU8sR0FBRywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ2hFO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBWmUsd0JBQUksT0FZbkIsQ0FBQTtRQUNELFNBQWdCLEVBQUUsQ0FBQyxLQUFpQztZQUNuRCxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDMUMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxPQUFPLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUxlLHNCQUFFLEtBS2pCLENBQUE7SUFDRixDQUFDLEVBNUJTLG1CQUFtQixLQUFuQixtQkFBbUIsUUE0QjVCO0lBRUQsSUFBVSx3QkFBd0IsQ0FhakM7SUFiRCxXQUFVLHdCQUF3QjtRQUNqQyxTQUFnQixJQUFJLENBQUMsS0FBbUM7WUFDdkQsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQzFDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBTGUsNkJBQUksT0FLbkIsQ0FBQTtRQUNELFNBQWdCLEVBQUUsQ0FBQyxLQUFzQztZQUN4RCxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDMUMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFMZSwyQkFBRSxLQUtqQixDQUFBO0lBQ0YsQ0FBQyxFQWJTLHdCQUF3QixLQUF4Qix3QkFBd0IsUUFhakM7SUFFRCxJQUFVLGlCQUFpQixDQW9DMUI7SUFwQ0QsV0FBVSxpQkFBaUI7UUFDMUIsU0FBZ0IsRUFBRSxDQUFDLEtBQW9HO1lBQ3RILElBQUksS0FBSyxFQUFFO2dCQUNWLE1BQU0sU0FBUyxHQUFHLEtBQWlDLENBQUM7Z0JBQ3BELE9BQU8sU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNyRTtpQkFBTTtnQkFDTixPQUFPLEtBQUssQ0FBQzthQUNiO1FBQ0YsQ0FBQztRQVBlLG9CQUFFLEtBT2pCLENBQUE7UUFDRCxTQUFnQixJQUFJLENBQUMsS0FBNEI7WUFDaEQsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQzFDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsTUFBTSxNQUFNLEdBQTZCLEVBQ3hDLENBQUM7WUFDRixJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxNQUFNLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7YUFDdkM7aUJBQU07Z0JBQ04sTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO2dCQUMvQixNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDekI7WUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsd0JBQXdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM5RDtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQWhCZSxzQkFBSSxPQWdCbkIsQ0FBQTtRQUNELFNBQWdCLEVBQUUsQ0FBQyxLQUErQjtZQUNqRCxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssU0FBUyxDQUFDLEVBQUU7Z0JBQzlHLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFO2dCQUN0QixPQUFPLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNsRTtpQkFBTTtnQkFDTixPQUFPLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBUSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0Y7UUFDRixDQUFDO1FBVGUsb0JBQUUsS0FTakIsQ0FBQTtJQUNGLENBQUMsRUFwQ1MsaUJBQWlCLEtBQWpCLGlCQUFpQixRQW9DMUI7SUFFRCxJQUFpQixrQkFBa0IsQ0FtQmxDO0lBbkJELFdBQWlCLGtCQUFrQjtRQUNsQyxTQUFnQixFQUFFLENBQUMsS0FBb0c7WUFDdEgsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsTUFBTSxTQUFTLEdBQUcsS0FBa0MsQ0FBQztnQkFDckQsT0FBTyxTQUFTLElBQUksU0FBUyxDQUFDLGVBQWUsS0FBSyxpQkFBaUIsQ0FBQzthQUNwRTtpQkFBTTtnQkFDTixPQUFPLEtBQUssQ0FBQzthQUNiO1FBQ0YsQ0FBQztRQVBlLHFCQUFFLEtBT2pCLENBQUE7UUFFRCxTQUFnQixJQUFJLENBQUMsS0FBNkI7WUFDakQsT0FBTztnQkFDTixlQUFlLEVBQUUsaUJBQWlCO2FBQ2xDLENBQUM7UUFDSCxDQUFDO1FBSmUsdUJBQUksT0FJbkIsQ0FBQTtRQUVELFNBQWdCLEVBQUUsQ0FBQyxNQUFjLEVBQUUsdUJBQTJEO1lBQzdGLE9BQU8sdUJBQXVCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFGZSxxQkFBRSxLQUVqQixDQUFBO0lBQ0YsQ0FBQyxFQW5CZ0Isa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFtQmxDO0lBR0QsSUFBaUIsYUFBYSxDQWlCN0I7SUFqQkQsV0FBaUIsYUFBYTtRQUM3QixTQUFnQixJQUFJLENBQUMsS0FBaUIsRUFBRSxnQkFBb0M7WUFDM0UsSUFBSSxNQUE4QixDQUFDO1lBQ25DLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDakUsTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO2FBQ3pCO2lCQUFNLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDeEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUU7b0JBQ3RHLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUM7aUJBQ3hDO3FCQUFNO29CQUNOLE1BQU0sR0FBRyw0QkFBb0IsQ0FBQztpQkFDOUI7YUFDRDtZQUNELE9BQU87Z0JBQ04sRUFBRSxFQUFFLEtBQUssQ0FBQyxHQUFJO2dCQUNkLGVBQWUsRUFBRSxNQUFPO2FBQ3hCLENBQUM7UUFDSCxDQUFDO1FBZmUsa0JBQUksT0FlbkIsQ0FBQTtJQUNGLENBQUMsRUFqQmdCLGFBQWEsNkJBQWIsYUFBYSxRQWlCN0I7SUFDRCxJQUFVLFlBQVksQ0FPckI7SUFQRCxXQUFVLFlBQVk7UUFDckIsU0FBZ0IsSUFBSSxDQUFDLEtBQXVCO1lBQzNDLElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUMxQyxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFMZSxpQkFBSSxPQUtuQixDQUFBO0lBQ0YsQ0FBQyxFQVBTLFlBQVksS0FBWixZQUFZLFFBT3JCO0lBRUQsSUFBaUIsT0FBTyxDQW1IdkI7SUFuSEQsV0FBaUIsT0FBTztRQUN2QixTQUFnQixRQUFRLENBQUMsS0FBb0IsRUFBRSxTQUFnQztZQUM5RSxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDMUMsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUNELE1BQU0sTUFBTSxHQUFxQixFQUFFLENBQUM7WUFDcEMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3pCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3hDLElBQUksU0FBUyxFQUFFO29CQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ3ZCO2FBQ0Q7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFaZSxnQkFBUSxXQVl2QixDQUFBO1FBRUQsU0FBZ0IsSUFBSSxDQUFDLEtBQWtCLEVBQUUsU0FBZ0M7WUFDeEUsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQzFDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxTQUF3RyxDQUFDO1lBQzdHLElBQUksS0FBSyxDQUFDLFNBQVMsWUFBWSxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3RELFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3REO2lCQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsWUFBWSxLQUFLLENBQUMsY0FBYyxFQUFFO2dCQUMzRCxTQUFTLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNwRDtpQkFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDLFNBQVMsWUFBWSxLQUFLLENBQUMsZUFBZSxFQUFFO2dCQUMvRSxTQUFTLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUF3QixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDNUU7WUFFRCxNQUFNLFVBQVUsR0FBeUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsRyxJQUFJLEtBQTZCLENBQUM7WUFDbEMsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO2dCQUNoQixJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7b0JBQ3BDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO2lCQUNwQjtxQkFBTTtvQkFDTixLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7aUJBQ3hCO2FBQ0Q7aUJBQU07Z0JBQ04sOEdBQThHO2dCQUM5RyxLQUFLLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7YUFDbEM7WUFDRCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUMxQixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE1BQU0sTUFBTSxHQUFtQjtnQkFDOUIsR0FBRyxFQUFHLEtBQW9CLENBQUMsR0FBSTtnQkFDL0IsVUFBVTtnQkFDVixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7Z0JBQ2hCLE1BQU0sRUFBRTtvQkFDUCxXQUFXLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLO29CQUN2QyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU07b0JBQ25CLEtBQUssRUFBRSxLQUFLO2lCQUNaO2dCQUNELFNBQVMsRUFBRSxTQUFVO2dCQUNyQixZQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVk7Z0JBQ2hDLEtBQUssRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUF5QixDQUFDO2dCQUN6RCxtQkFBbUIsRUFBRSwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDO2dCQUMvRSxlQUFlLEVBQUUsS0FBSyxDQUFDLGVBQWU7Z0JBQ3RDLGtCQUFrQixFQUFHLEtBQW9CLENBQUMsa0JBQWtCO2dCQUM1RCxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUU7Z0JBQzdFLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTthQUNwQixDQUFDO1lBQ0YsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBL0NlLFlBQUksT0ErQ25CLENBQUE7UUFDTSxLQUFLLFVBQVUsRUFBRSxDQUFDLEtBQWlDLEVBQUUsU0FBb0MsRUFBRSx1QkFBMkQ7WUFDNUosSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQzFDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxTQUE0RixDQUFDO1lBQ2pHLElBQUksbUJBQW1CLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDNUMsU0FBUyxHQUFHLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDcEQ7aUJBQU0sSUFBSSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNqRCxTQUFTLEdBQUcsaUJBQWlCLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNsRDtpQkFBTSxJQUFJLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ2xELFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO2FBQ3RFO1lBQ0QsTUFBTSxVQUFVLEdBQXNDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0YsSUFBSSxLQUFnRyxDQUFDO1lBQ3JHLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDakIsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQ3JDLElBQUksT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7d0JBQzNDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztxQkFDM0I7eUJBQU07d0JBQ04sS0FBSyxHQUFHLE1BQU0sU0FBUyxDQUFDLHNCQUFzQixDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3FCQUMvRTtpQkFDRDtxQkFBTTtvQkFDTixLQUFLLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7aUJBQ2xDO2FBQ0Q7WUFDRCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUMxQixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE1BQU0sTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNwSCxJQUFJLEtBQUssQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO2dCQUNyQyxNQUFNLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7YUFDekM7WUFDRCxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQUM5QixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JELElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtvQkFDMUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDeEUsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7d0JBQ25DLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO3FCQUMvQztpQkFDRDthQUNEO1lBQ0QsSUFBSSxLQUFLLENBQUMsbUJBQW1CLEVBQUU7Z0JBQzlCLE1BQU0sQ0FBQyxtQkFBbUIsR0FBRywwQkFBMEIsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFFLENBQUM7YUFDdkY7WUFDRCxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsTUFBTSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO2FBQ3ZCO1lBQ0QsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNqQixNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7YUFDN0I7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFuRHFCLFVBQUUsS0FtRHZCLENBQUE7SUFDRixDQUFDLEVBbkhnQixPQUFPLHVCQUFQLE9BQU8sUUFtSHZCO0lBRUQsSUFBVSxhQUFhLENBV3RCO0lBWEQsV0FBVSxhQUFhO1FBQ3RCLFNBQWdCLElBQUksQ0FBQyxLQUFvQztZQUN4RCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFGZSxrQkFBSSxPQUVuQixDQUFBO1FBRUQsU0FBZ0IsRUFBRSxDQUFDLEtBQTJCO1lBQzdDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBTGUsZ0JBQUUsS0FLakIsQ0FBQTtJQUNGLENBQUMsRUFYUyxhQUFhLEtBQWIsYUFBYSxRQVd0QjtJQUVELE1BQU0saUJBQWlCO1FBRWIsTUFBTSxDQUFrQjtRQUVqQyxZQUFZLEtBQXNCLEVBQVcsR0FBVyxFQUFtQixLQUFrQjtZQUFoRCxRQUFHLEdBQUgsR0FBRyxDQUFRO1lBQW1CLFVBQUssR0FBTCxLQUFLLENBQWE7WUFDNUYsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDckIsQ0FBQztRQUVELElBQVcsSUFBSTtZQUNkLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRU0sU0FBUztZQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxLQUFtQztRQUM5RCxDQUFDO1FBRU0saUJBQWlCLENBQUMsS0FBaUM7UUFDMUQsQ0FBQztLQUNEO0lBUU0sSUFBZSxlQUFlLEdBQTlCLE1BQWUsZUFBZTtRQXdCcEMsWUFDcUIsVUFBOEIsRUFDekIsUUFBaUMsRUFDdkMsZ0JBQW1DLEVBQ3pCLGFBQTBDLEVBQ2hELG9CQUEyQyxFQUN6QyxzQkFBK0MsRUFDM0QsVUFBdUIsRUFDTCxrQkFBaUQ7WUFkOUQsc0JBQWlCLEdBQW1DLElBQUksZUFBTyxFQUF5QixDQUFDO1lBQ3pGLHdCQUFtQixHQUFpQyxJQUFJLGVBQU8sRUFBdUIsQ0FBQztZQUV2Riw2QkFBd0IsR0FBMEMsSUFBSSxlQUFPLEVBQWdDLENBQUM7WUFDOUcsMkJBQXNCLEdBQXdDLElBQUksZUFBTyxFQUE4QixDQUFDO1lBWTFILElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxnQkFBZ0IsQ0FBQztZQUMzQyxJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztZQUNwQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7WUFDbEQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLHNCQUFzQixDQUFDO1lBQy9DLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7WUFDaEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztZQUM1RCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7WUFDNUUsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO1lBQzNFLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBQ3RELElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUM5QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7WUFDOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRU0sb0JBQW9CLENBQUMsU0FBZ0MsRUFBRSxJQUFZLEVBQUUsUUFBNkI7WUFDeEcsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxPQUFPLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUN2QztZQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEQsT0FBTyxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxNQUFjLEVBQUUsSUFBOEI7WUFDdkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLFVBQVUsQ0FBQyxNQUEwQjtZQUMzQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNoRixNQUFNLE1BQU0sR0FBa0IsRUFBRSxDQUFDO2dCQUNqQyxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtvQkFDM0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7b0JBQy9GLElBQUksSUFBSSxFQUFFO3dCQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ2xCO2lCQUNEO2dCQUNELE9BQU8sTUFBTSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBSUQsSUFBVyxjQUFjO1lBQ3hCLE1BQU0sTUFBTSxHQUEyQixFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDMUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU0sYUFBYSxDQUFDLFNBQStCO1lBQ25ELElBQUksQ0FBQyxDQUFDLFNBQVMsWUFBWSxpQkFBaUIsQ0FBQyxFQUFFO2dCQUM5QyxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7YUFDcEQ7WUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFFLFNBQStCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUVELElBQVcsY0FBYztZQUN4QixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7UUFDckMsQ0FBQztRQUVNLEtBQUssQ0FBQyxlQUFlLENBQUMsU0FBa0MsRUFBRSxVQUFrQixFQUFFLGtCQUE0QztZQUNoSSxNQUFNLGVBQWUsR0FBc0MsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0csSUFBSSxlQUFlLEVBQUU7Z0JBQ3BCLG1IQUFtSDtnQkFDbkgsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7YUFDMUc7WUFDRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUVyQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO2dCQUMzQixTQUFTLEVBQUUsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDO2FBQ2pELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFXLFlBQVk7WUFDdEIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLENBQUM7UUFFTSxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQWtDO1lBQzVELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQztnQkFDN0IsU0FBUyxFQUFFLFVBQVU7YUFDckIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELElBQVcscUJBQXFCO1lBQy9CLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQztRQUM1QyxDQUFDO1FBRU0sS0FBSyxDQUFDLHNCQUFzQixDQUFDLEtBQW1DO1lBQ3RFLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDO2dCQUNsQyxTQUFTLEVBQUUsU0FBUztnQkFDcEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO2FBQzFCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFXLG1CQUFtQjtZQUM3QixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7UUFDMUMsQ0FBQztRQUVNLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFpQztZQUNsRSxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQztnQkFDaEMsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTthQUN4QixDQUFDLENBQUM7UUFDSixDQUFDO1FBSU0sYUFBYSxDQUFDLE1BQWMsRUFBRSxVQUFzQztZQUMxRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNiLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7YUFDckQ7WUFFRCx3REFBd0Q7WUFDeEQsd0RBQXdEO1lBQ3hELDhEQUE4RDtZQUM5RCw4REFBOEQ7WUFDOUQsb0VBQW9FO1lBQ3BFLDBFQUEwRTtZQUMxRSxrRUFBa0U7WUFDbEUsMEZBQTBGO1lBQzFGLE1BQU0sY0FBYyxHQUFvQixFQUFFLENBQUM7WUFDM0MsTUFBTSxZQUFZLEdBQUcsSUFBQSxpQkFBUyxFQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN4RyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5RSxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDOUIsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO29CQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7d0JBQ3JDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDakIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFJTSxLQUFLLENBQUMsWUFBWSxDQUFDLE1BQWMsRUFBRSxPQUF1QjtZQUNoRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNiLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7YUFDckQ7WUFFRCxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQzdDLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSw2Q0FBNkMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7YUFDbkk7WUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUNqRyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQzthQUN4RDtZQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RGLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2xCLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFN0MsTUFBTSxlQUFlLEdBQStCLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRyxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7YUFDeEQ7WUFFRCxJQUFJLFlBQVksQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEQsTUFBTSxJQUFJLEtBQUssQ0FBQywwSUFBMEksQ0FBQyxDQUFDO2FBQzVKO1lBRUQsSUFBSSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNyRCxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ25FO1lBRUQsT0FBTyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBSU8sVUFBVTtZQUNqQixPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRVMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQXVCLEVBQUUsSUFBaUIsRUFBRSxVQUFtQjtZQUNqRyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNoRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5Qyx5RkFBeUY7Z0JBQ3pGLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUF5QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDakY7WUFDRCxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBeUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFUyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBMkMsRUFBRSxJQUFrQjtZQUMvRixJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRTtnQkFDbEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDakUsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDbkIsTUFBTSxJQUFJLHlCQUFnQixDQUFDLHdEQUF3RCxDQUFDLENBQUM7aUJBQ3JGO2dCQUNELE9BQU8sYUFBYSxDQUFDO2FBQ3JCO1lBRUQsTUFBTSxNQUFNLEdBQTJDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JHLElBQUksTUFBTSxFQUFFO2dCQUNYLE9BQU8sTUFBTSxDQUFDO2FBQ2Q7WUFDRCxNQUFNLGFBQWEsR0FBK0IsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ2pGLFNBQVMsNkJBQTZCLENBQUMsSUFBcUIsRUFBRSxTQUFrQyxFQUFFLFlBQWtEO29CQUNuSixJQUFJLENBQUMsWUFBWSxFQUFFO3dCQUNsQixNQUFNLENBQUMsa0NBQWtDLENBQUMsQ0FBQztxQkFDM0M7eUJBQU07d0JBQ04sT0FBTyxDQUFDLElBQUksaUJBQWlCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztxQkFDakU7Z0JBQ0YsQ0FBQztnQkFFRCxJQUFJLElBQUksRUFBRTtvQkFDVCw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNyRDtxQkFBTTtvQkFDTixPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQzt5QkFDbEYsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsNkJBQTZCLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUNyRTtZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzdELE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO2dCQUNsRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7Z0JBQy9ELE9BQU8sc0JBQXNCLENBQUM7WUFDL0IsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dCQUNiLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUyxnQkFBZ0IsQ0FBQyxJQUFpQixFQUFFLE9BQW9CO1lBQ2pFLE1BQU0sS0FBSyxHQUFJLElBQW1CLENBQUM7WUFDbkMsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFO2dCQUN0QixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsd0RBQXdELENBQUMsQ0FBQzthQUNqSTtRQUNGLENBQUM7UUFFTyx1QkFBdUIsQ0FBQyxTQUFrQztZQUNqRSxNQUFNLGtCQUFrQixHQUF1QyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMvRyxJQUFJLGtCQUFrQixFQUFFO2dCQUN2QixJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNuRDtZQUVELHdFQUF3RTtZQUN4RSxnRUFBZ0U7WUFDaEUsK0VBQStFO1lBQy9FLG9EQUFvRDtZQUNwRCxJQUFJLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixLQUFLLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDcEcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZEO1lBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzVELElBQUksY0FBYyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRTtnQkFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixLQUFLLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDakgsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzdELElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUMvRDtnQkFDRCxjQUFjLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2pDO1FBQ0YsQ0FBQztLQUtELENBQUE7SUF4VHFCLDBDQUFlOzhCQUFmLGVBQWU7UUF5QmxDLFdBQUEsc0NBQWtCLENBQUE7UUFDbEIsV0FBQSxnREFBdUIsQ0FBQTtRQUN2QixXQUFBLG9DQUFpQixDQUFBO1FBQ2pCLFdBQUEsd0RBQTJCLENBQUE7UUFDM0IsV0FBQSw0Q0FBcUIsQ0FBQTtRQUNyQixXQUFBLGdEQUF1QixDQUFBO1FBQ3ZCLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEsNERBQTZCLENBQUE7T0FoQ1YsZUFBZSxDQXdUcEM7SUFFTSxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLGVBQWU7UUFDckQsWUFDcUIsVUFBOEIsRUFDekIsUUFBaUMsRUFDdkMsZ0JBQW1DLEVBQ3pCLGFBQTBDLEVBQ2hELG9CQUEyQyxFQUN6QyxzQkFBK0MsRUFDM0QsVUFBdUIsRUFDTCxrQkFBaUQ7WUFFaEYsS0FBSyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFLHNCQUFzQixFQUFFLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQzNJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBTyxDQUFDLFlBQVksRUFBRTtnQkFDN0MsTUFBTSxFQUFFLGlCQUFPLENBQUMsWUFBWTtnQkFDNUIsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsUUFBUSxFQUFFLFFBQVEsQ0FBQyxnQkFBZ0IsK0JBQXVCO2FBQzFELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQWdDLEVBQUUsSUFBaUI7WUFDM0UsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQzthQUM5RDtZQUVELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtnQkFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2FBQ3JDO1lBRUQsbUVBQW1FO1lBQ25FLG9FQUFvRTtZQUNwRSxvQkFBb0I7WUFDcEIsSUFBSSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN6QyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2hEO2lCQUFNO2dCQUNOLE1BQU0sSUFBSSwwQkFBaUIsRUFBRSxDQUFDO2FBQzlCO1lBRUQsd0ZBQXdGO1lBQ3hGLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5RixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxNQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUUsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVTLG9CQUFvQixDQUFDLFVBQXNDLEVBQUUsY0FBK0IsRUFBRSxPQUFvQixFQUFFLEtBQXVDO1lBQ3BLLE1BQU0sUUFBUSxHQUFxQixFQUFFLENBQUM7WUFDdEMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7b0JBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQzFELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsSUFBSSx3RUFBd0UsQ0FBQyxDQUFDO3FCQUN0STtvQkFFRCxNQUFNLE9BQU8sR0FBK0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNsRixJQUFJLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUN4RCxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN2QixrRkFBa0Y7d0JBQ2xGLDRGQUE0Rjt3QkFDNUYsNkRBQTZEO3dCQUM3RCxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7cUJBQ2xFO3lCQUFNO3dCQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7cUJBQ2hFO2lCQUNEO2FBQ0Q7WUFDRCxPQUFPO2dCQUNOLEtBQUssRUFBRSxRQUFRO2dCQUNmLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUzthQUM1QixDQUFDO1FBQ0gsQ0FBQztRQUVTLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxlQUErQjtZQUNsRSxJQUFJLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3JELE9BQU8sZUFBZSxDQUFDO2FBQ3ZCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7YUFDaEU7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0sS0FBSyxDQUFDLGlCQUFpQixDQUFDLGFBQTRCLEVBQUUsU0FBMkY7WUFDdkosTUFBTSxNQUFNLEdBQUc7Z0JBQ2QsT0FBTyxFQUFXLFNBQW1CO2dCQUNyQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7YUFDOUIsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUI7WUFDL0IsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sS0FBSyxDQUFDLGVBQWUsQ0FBQyxPQUFlLEVBQUUsR0FBd0IsRUFBRSxLQUE0QjtZQUNuRyxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO0tBQ0QsQ0FBQTtJQS9GWSw4Q0FBaUI7Z0NBQWpCLGlCQUFpQjtRQUUzQixXQUFBLHNDQUFrQixDQUFBO1FBQ2xCLFdBQUEsZ0RBQXVCLENBQUE7UUFDdkIsV0FBQSxvQ0FBaUIsQ0FBQTtRQUNqQixXQUFBLHdEQUEyQixDQUFBO1FBQzNCLFdBQUEsNENBQXFCLENBQUE7UUFDckIsV0FBQSxnREFBdUIsQ0FBQTtRQUN2QixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLDREQUE2QixDQUFBO09BVG5CLGlCQUFpQixDQStGN0I7SUFFWSxRQUFBLFlBQVksR0FBRyxJQUFBLCtCQUFlLEVBQWUsY0FBYyxDQUFDLENBQUMifQ==