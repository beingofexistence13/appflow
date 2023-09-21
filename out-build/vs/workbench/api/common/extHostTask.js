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
    exports.$kcc = exports.$jcc = exports.$icc = exports.TaskDTO = exports.TaskHandleDTO = exports.CustomExecutionDTO = void 0;
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
            return new types.$KK(value.process, value.args, value.options);
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
                return new types.$LK(value.commandLine, value.options);
            }
            else {
                return new types.$LK(value.command, value.args ? value.args : [], value.options);
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
                    folder = tasks_1.$_F;
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
            if (value.execution instanceof types.$KK) {
                execution = ProcessExecutionDTO.from(value.execution);
            }
            else if (value.execution instanceof types.$LK) {
                execution = ShellExecutionDTO.from(value.execution);
            }
            else if (value.execution && value.execution instanceof types.$MK) {
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
            const result = new types.$NK(definition, scope, value.name, value.source.label, execution, value.problemMatchers);
            if (value.isBackground !== undefined) {
                result.isBackground = value.isBackground;
            }
            if (value.group !== undefined) {
                result.group = types.$JK.from(value.group._id);
                if (result.group && value.group.isDefault) {
                    result.group = new types.$JK(result.group.id, result.group.label);
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
        constructor(tasks, _id, a) {
            this._id = _id;
            this.a = a;
            this.#tasks = tasks;
        }
        get task() {
            return this.a;
        }
        terminate() {
            this.#tasks.terminateTask(this);
        }
        fireDidStartProcess(value) {
        }
        fireDidEndProcess(value) {
        }
    }
    let $icc = class $icc {
        constructor(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService) {
            this.q = new event_1.$fd();
            this.r = new event_1.$fd();
            this.s = new event_1.$fd();
            this.t = new event_1.$fd();
            this.a = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadTask);
            this.b = workspaceService;
            this.c = editorService;
            this.d = configurationService;
            this.e = extHostTerminalService;
            this.h = 0;
            this.j = new Map();
            this.k = new Map();
            this.l = new Map();
            this.m = new Map();
            this.n = new Set();
            this.o = new Map();
            this.f = logService;
            this.g = deprecationService;
            this.a.$registerSupportedExecutions(true);
        }
        registerTaskProvider(extension, type, provider) {
            if (!provider) {
                return new types.$3J(() => { });
            }
            const handle = this.w();
            this.j.set(handle, { type, provider, extension });
            this.a.$registerTaskProvider(handle, type);
            return new types.$3J(() => {
                this.j.delete(handle);
                this.a.$unregisterTaskProvider(handle);
            });
        }
        registerTaskSystem(scheme, info) {
            this.a.$registerTaskSystem(scheme, info);
        }
        fetchTasks(filter) {
            return this.a.$fetchTasks(TaskFilterDTO.from(filter)).then(async (values) => {
                const result = [];
                for (const value of values) {
                    const task = await TaskDTO.to(value, this.b, this.m);
                    if (task) {
                        result.push(task);
                    }
                }
                return result;
            });
        }
        get taskExecutions() {
            const result = [];
            this.k.forEach(value => result.push(value));
            return result;
        }
        terminateTask(execution) {
            if (!(execution instanceof TaskExecutionImpl)) {
                throw new Error('No valid task execution provided');
            }
            return this.a.$terminateTask(execution._id);
        }
        get onDidStartTask() {
            return this.q.event;
        }
        async $onDidStartTask(execution, terminalId, resolvedDefinition) {
            const customExecution = this.m.get(execution.id);
            if (customExecution) {
                // Clone the custom execution to keep the original untouched. This is important for multiple runs of the same task.
                this.o.set(execution.id, customExecution);
                this.e.attachPtyToTerminal(terminalId, await customExecution.callback(resolvedDefinition));
            }
            this.p = execution.id;
            this.q.fire({
                execution: await this.y(execution)
            });
        }
        get onDidEndTask() {
            return this.r.event;
        }
        async $OnDidEndTask(execution) {
            const _execution = await this.y(execution);
            this.l.delete(execution.id);
            this.k.delete(execution.id);
            this.A(execution);
            this.r.fire({
                execution: _execution
            });
        }
        get onDidStartTaskProcess() {
            return this.s.event;
        }
        async $onDidStartTaskProcess(value) {
            const execution = await this.y(value.id);
            this.s.fire({
                execution: execution,
                processId: value.processId
            });
        }
        get onDidEndTaskProcess() {
            return this.t.event;
        }
        async $onDidEndTaskProcess(value) {
            const execution = await this.y(value.id);
            this.t.fire({
                execution: execution,
                exitCode: value.exitCode
            });
        }
        $provideTasks(handle, validTypes) {
            const handler = this.j.get(handle);
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
            const fetchPromise = (0, async_1.$zg)(() => handler.provider.provideTasks(cancellation_1.CancellationToken.None)).then(value => {
                return this.u(validTypes, taskIdPromises, handler, value);
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
            const handler = this.j.get(handle);
            if (!handler) {
                return Promise.reject(new Error('no handler found'));
            }
            if (taskDTO.definition.type !== handler.type) {
                throw new Error(`Unexpected: Task of type [${taskDTO.definition.type}] cannot be resolved by provider of type [${handler.type}].`);
            }
            const task = await TaskDTO.to(taskDTO, this.b, this.m);
            if (!task) {
                throw new Error('Unexpected: Task cannot be resolved.');
            }
            const resolvedTask = await handler.provider.resolveTask(task, cancellation_1.CancellationToken.None);
            if (!resolvedTask) {
                return;
            }
            this.z(resolvedTask, handler);
            const resolvedTaskDTO = TaskDTO.from(resolvedTask, handler.extension);
            if (!resolvedTaskDTO) {
                throw new Error('Unexpected: Task cannot be resolved.');
            }
            if (resolvedTask.definition !== task.definition) {
                throw new Error('Unexpected: The resolved task definition must be the same object as the original task definition. The task definition cannot be changed.');
            }
            if (CustomExecutionDTO.is(resolvedTaskDTO.execution)) {
                await this.x(resolvedTaskDTO, resolvedTask, true);
            }
            return await this.v(resolvedTaskDTO);
        }
        w() {
            return this.h++;
        }
        async x(taskDTO, task, isProvided) {
            const taskId = await this.a.$createTaskId(taskDTO);
            if (!isProvided && !this.m.has(taskId)) {
                this.n.add(taskId);
                // Also add to active executions when not coming from a provider to prevent timing issue.
                this.o.set(taskId, task.execution);
            }
            this.m.set(taskId, task.execution);
        }
        async y(execution, task) {
            if (typeof execution === 'string') {
                const taskExecution = this.l.get(execution);
                if (!taskExecution) {
                    throw new errors_1.$_('Unexpected: The specified task is missing an execution');
                }
                return taskExecution;
            }
            const result = this.l.get(execution.id);
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
                    TaskDTO.to(execution.task, this.b, this.m)
                        .then(task => resolvePromiseWithCreatedTask(this, execution, task));
                }
            });
            this.l.set(execution.id, createdResult);
            return createdResult.then(executionCreatedResult => {
                this.k.set(execution.id, executionCreatedResult);
                return executionCreatedResult;
            }, rejected => {
                return Promise.reject(rejected);
            });
        }
        z(task, handler) {
            const tTask = task;
            if (tTask._deprecated) {
                this.g.report('Task.constructor', handler.extension, 'Use the Task constructor that takes a `scope` instead.');
            }
        }
        A(execution) {
            const extensionCallback2 = this.o.get(execution.id);
            if (extensionCallback2) {
                this.o.delete(execution.id);
            }
            // Technically we don't really need to do this, however, if an extension
            // is executing a task through "executeTask" over and over again
            // with different properties in the task definition, then the map of executions
            // could grow indefinitely, something we don't want.
            if (this.n.has(execution.id) && (this.p !== execution.id)) {
                this.m.delete(execution.id);
                this.n.delete(execution.id);
            }
            const iterator = this.n.values();
            let iteratorResult = iterator.next();
            while (!iteratorResult.done) {
                if (!this.o.has(iteratorResult.value) && (this.p !== iteratorResult.value)) {
                    this.m.delete(iteratorResult.value);
                    this.n.delete(iteratorResult.value);
                }
                iteratorResult = iterator.next();
            }
        }
    };
    exports.$icc = $icc;
    exports.$icc = $icc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM),
        __param(2, extHostWorkspace_1.$jbc),
        __param(3, extHostDocumentsAndEditors_1.$aM),
        __param(4, extHostConfiguration_1.$mbc),
        __param(5, extHostTerminalService_1.$Ebc),
        __param(6, log_1.$5i),
        __param(7, extHostApiDeprecationService_1.$_ac)
    ], $icc);
    let $jcc = class $jcc extends $icc {
        constructor(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService) {
            super(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService);
            this.registerTaskSystem(network_1.Schemas.vscodeRemote, {
                scheme: network_1.Schemas.vscodeRemote,
                authority: '',
                platform: Platform.$h(0 /* Platform.Platform.Web */)
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
                await this.x(dto, task, false);
            }
            else {
                throw new errors_1.$0();
            }
            // Always get the task execution first to prevent timing issues when retrieving it later
            const execution = await this.y(await this.a.$getTaskExecution(dto), task);
            this.a.$executeTask(dto).catch(error => { throw new Error(error); });
            return execution;
        }
        u(validTypes, taskIdPromises, handler, value) {
            const taskDTOs = [];
            if (value) {
                for (const task of value) {
                    this.z(task, handler);
                    if (!task.definition || !validTypes[task.definition.type]) {
                        this.f.warn(`The task [${task.source}, ${task.name}] uses an undefined task type. The task will be ignored in the future.`);
                    }
                    const taskDTO = TaskDTO.from(task, handler.extension);
                    if (taskDTO && CustomExecutionDTO.is(taskDTO.execution)) {
                        taskDTOs.push(taskDTO);
                        // The ID is calculated on the main thread task side, so, let's call into it here.
                        // We need the task id's pre-computed for custom task executions because when OnDidStartTask
                        // is invoked, we have to be able to map it back to our data.
                        taskIdPromises.push(this.x(taskDTO, task, true));
                    }
                    else {
                        this.f.warn('Only custom execution tasks supported.');
                    }
                }
            }
            return {
                tasks: taskDTOs,
                extension: handler.extension
            };
        }
        async v(resolvedTaskDTO) {
            if (CustomExecutionDTO.is(resolvedTaskDTO.execution)) {
                return resolvedTaskDTO;
            }
            else {
                this.f.warn('Only custom execution tasks supported.');
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
    exports.$jcc = $jcc;
    exports.$jcc = $jcc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM),
        __param(2, extHostWorkspace_1.$jbc),
        __param(3, extHostDocumentsAndEditors_1.$aM),
        __param(4, extHostConfiguration_1.$mbc),
        __param(5, extHostTerminalService_1.$Ebc),
        __param(6, log_1.$5i),
        __param(7, extHostApiDeprecationService_1.$_ac)
    ], $jcc);
    exports.$kcc = (0, instantiation_1.$Bh)('IExtHostTask');
});
//# sourceMappingURL=extHostTask.js.map