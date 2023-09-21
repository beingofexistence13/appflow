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
define(["require", "exports", "vs/base/common/path", "vs/base/common/uri", "vs/base/node/processes", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostConfiguration", "vs/platform/workspace/common/workspace", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostTask", "vs/base/common/network", "vs/platform/log/common/log", "vs/workbench/api/common/extHostApiDeprecationService", "vs/base/common/resources", "os", "vs/workbench/api/common/extHostVariableResolverService"], function (require, exports, path, uri_1, processes_1, extHostWorkspace_1, extHostDocumentsAndEditors_1, extHostConfiguration_1, workspace_1, extHostTerminalService_1, extHostRpcService_1, extHostInitDataService_1, extHostTask_1, network_1, log_1, extHostApiDeprecationService_1, resources, os_1, extHostVariableResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$idc = void 0;
    let $idc = class $idc extends extHostTask_1.$icc {
        constructor(extHostRpc, initData, B, editorService, configurationService, extHostTerminalService, logService, deprecationService, C) {
            super(extHostRpc, initData, B, editorService, configurationService, extHostTerminalService, logService, deprecationService);
            this.B = B;
            this.C = C;
            if (initData.remote.isRemote && initData.remote.authority) {
                this.registerTaskSystem(network_1.Schemas.vscodeRemote, {
                    scheme: network_1.Schemas.vscodeRemote,
                    authority: initData.remote.authority,
                    platform: process.platform
                });
            }
            else {
                this.registerTaskSystem(network_1.Schemas.file, {
                    scheme: network_1.Schemas.file,
                    authority: '',
                    platform: process.platform
                });
            }
            this.a.$registerSupportedExecutions(true, true, true);
        }
        async executeTask(extension, task) {
            const tTask = task;
            if (!task.execution && (tTask._id === undefined)) {
                throw new Error('Tasks to execute must include an execution');
            }
            // We have a preserved ID. So the task didn't change.
            if (tTask._id !== undefined) {
                // Always get the task execution first to prevent timing issues when retrieving it later
                const handleDto = extHostTask_1.TaskHandleDTO.from(tTask, this.B);
                const executionDTO = await this.a.$getTaskExecution(handleDto);
                if (executionDTO.task === undefined) {
                    throw new Error('Task from execution DTO is undefined');
                }
                const execution = await this.y(executionDTO, task);
                this.a.$executeTask(handleDto).catch(() => { });
                return execution;
            }
            else {
                const dto = extHostTask_1.TaskDTO.from(task, extension);
                if (dto === undefined) {
                    return Promise.reject(new Error('Task is not valid'));
                }
                // If this task is a custom execution, then we need to save it away
                // in the provided custom execution map that is cleaned up after the
                // task is executed.
                if (extHostTask_1.CustomExecutionDTO.is(dto.execution)) {
                    await this.x(dto, task, false);
                }
                // Always get the task execution first to prevent timing issues when retrieving it later
                const execution = await this.y(await this.a.$getTaskExecution(dto), task);
                this.a.$executeTask(dto).catch(() => { });
                return execution;
            }
        }
        u(validTypes, taskIdPromises, handler, value) {
            const taskDTOs = [];
            if (value) {
                for (const task of value) {
                    this.z(task, handler);
                    if (!task.definition || !validTypes[task.definition.type]) {
                        this.f.warn(`The task [${task.source}, ${task.name}] uses an undefined task type. The task will be ignored in the future.`);
                    }
                    const taskDTO = extHostTask_1.TaskDTO.from(task, handler.extension);
                    if (taskDTO) {
                        taskDTOs.push(taskDTO);
                        if (extHostTask_1.CustomExecutionDTO.is(taskDTO.execution)) {
                            // The ID is calculated on the main thread task side, so, let's call into it here.
                            // We need the task id's pre-computed for custom task executions because when OnDidStartTask
                            // is invoked, we have to be able to map it back to our data.
                            taskIdPromises.push(this.x(taskDTO, task, true));
                        }
                    }
                }
            }
            return {
                tasks: taskDTOs,
                extension: handler.extension
            };
        }
        async v(resolvedTaskDTO) {
            return resolvedTaskDTO;
        }
        async F(workspaceFolders) {
            let folder = (workspaceFolders && workspaceFolders.length > 0) ? workspaceFolders[0] : undefined;
            if (!folder) {
                const userhome = uri_1.URI.file((0, os_1.homedir)());
                folder = new workspace_1.$Vh({ uri: userhome, name: resources.$fg(userhome), index: 0 });
            }
            return {
                uri: folder.uri,
                name: folder.name,
                index: folder.index,
                toResource: () => {
                    throw new Error('Not implemented');
                }
            };
        }
        async $resolveVariables(uriComponents, toResolve) {
            const uri = uri_1.URI.revive(uriComponents);
            const result = {
                process: undefined,
                variables: Object.create(null)
            };
            const workspaceFolder = await this.b.resolveWorkspaceFolder(uri);
            const workspaceFolders = (await this.b.getWorkspaceFolders2()) ?? [];
            const resolver = await this.C.getResolver();
            const ws = workspaceFolder ? {
                uri: workspaceFolder.uri,
                name: workspaceFolder.name,
                index: workspaceFolder.index,
                toResource: () => {
                    throw new Error('Not implemented');
                }
            } : await this.F(workspaceFolders);
            for (const variable of toResolve.variables) {
                result.variables[variable] = await resolver.resolveAsync(ws, variable);
            }
            if (toResolve.process !== undefined) {
                let paths = undefined;
                if (toResolve.process.path !== undefined) {
                    paths = toResolve.process.path.split(path.$ge);
                    for (let i = 0; i < paths.length; i++) {
                        paths[i] = await resolver.resolveAsync(ws, paths[i]);
                    }
                }
                result.process = await processes_1.win32.findExecutable(await resolver.resolveAsync(ws, toResolve.process.name), toResolve.process.cwd !== undefined ? await resolver.resolveAsync(ws, toResolve.process.cwd) : undefined, paths);
            }
            return result;
        }
        async $jsonTasksSupported() {
            return true;
        }
        async $findExecutable(command, cwd, paths) {
            return processes_1.win32.findExecutable(command, cwd, paths);
        }
    };
    exports.$idc = $idc;
    exports.$idc = $idc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM),
        __param(2, extHostWorkspace_1.$jbc),
        __param(3, extHostDocumentsAndEditors_1.$aM),
        __param(4, extHostConfiguration_1.$mbc),
        __param(5, extHostTerminalService_1.$Ebc),
        __param(6, log_1.$5i),
        __param(7, extHostApiDeprecationService_1.$_ac),
        __param(8, extHostVariableResolverService_1.$ncc)
    ], $idc);
});
//# sourceMappingURL=extHostTask.js.map