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
    exports.ExtHostTask = void 0;
    let ExtHostTask = class ExtHostTask extends extHostTask_1.ExtHostTaskBase {
        constructor(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService, variableResolver) {
            super(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService);
            this.workspaceService = workspaceService;
            this.variableResolver = variableResolver;
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
            this._proxy.$registerSupportedExecutions(true, true, true);
        }
        async executeTask(extension, task) {
            const tTask = task;
            if (!task.execution && (tTask._id === undefined)) {
                throw new Error('Tasks to execute must include an execution');
            }
            // We have a preserved ID. So the task didn't change.
            if (tTask._id !== undefined) {
                // Always get the task execution first to prevent timing issues when retrieving it later
                const handleDto = extHostTask_1.TaskHandleDTO.from(tTask, this.workspaceService);
                const executionDTO = await this._proxy.$getTaskExecution(handleDto);
                if (executionDTO.task === undefined) {
                    throw new Error('Task from execution DTO is undefined');
                }
                const execution = await this.getTaskExecution(executionDTO, task);
                this._proxy.$executeTask(handleDto).catch(() => { });
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
                    await this.addCustomExecution(dto, task, false);
                }
                // Always get the task execution first to prevent timing issues when retrieving it later
                const execution = await this.getTaskExecution(await this._proxy.$getTaskExecution(dto), task);
                this._proxy.$executeTask(dto).catch(() => { });
                return execution;
            }
        }
        provideTasksInternal(validTypes, taskIdPromises, handler, value) {
            const taskDTOs = [];
            if (value) {
                for (const task of value) {
                    this.checkDeprecation(task, handler);
                    if (!task.definition || !validTypes[task.definition.type]) {
                        this._logService.warn(`The task [${task.source}, ${task.name}] uses an undefined task type. The task will be ignored in the future.`);
                    }
                    const taskDTO = extHostTask_1.TaskDTO.from(task, handler.extension);
                    if (taskDTO) {
                        taskDTOs.push(taskDTO);
                        if (extHostTask_1.CustomExecutionDTO.is(taskDTO.execution)) {
                            // The ID is calculated on the main thread task side, so, let's call into it here.
                            // We need the task id's pre-computed for custom task executions because when OnDidStartTask
                            // is invoked, we have to be able to map it back to our data.
                            taskIdPromises.push(this.addCustomExecution(taskDTO, task, true));
                        }
                    }
                }
            }
            return {
                tasks: taskDTOs,
                extension: handler.extension
            };
        }
        async resolveTaskInternal(resolvedTaskDTO) {
            return resolvedTaskDTO;
        }
        async getAFolder(workspaceFolders) {
            let folder = (workspaceFolders && workspaceFolders.length > 0) ? workspaceFolders[0] : undefined;
            if (!folder) {
                const userhome = uri_1.URI.file((0, os_1.homedir)());
                folder = new workspace_1.WorkspaceFolder({ uri: userhome, name: resources.basename(userhome), index: 0 });
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
            const workspaceFolder = await this._workspaceProvider.resolveWorkspaceFolder(uri);
            const workspaceFolders = (await this._workspaceProvider.getWorkspaceFolders2()) ?? [];
            const resolver = await this.variableResolver.getResolver();
            const ws = workspaceFolder ? {
                uri: workspaceFolder.uri,
                name: workspaceFolder.name,
                index: workspaceFolder.index,
                toResource: () => {
                    throw new Error('Not implemented');
                }
            } : await this.getAFolder(workspaceFolders);
            for (const variable of toResolve.variables) {
                result.variables[variable] = await resolver.resolveAsync(ws, variable);
            }
            if (toResolve.process !== undefined) {
                let paths = undefined;
                if (toResolve.process.path !== undefined) {
                    paths = toResolve.process.path.split(path.delimiter);
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
    exports.ExtHostTask = ExtHostTask;
    exports.ExtHostTask = ExtHostTask = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, extHostWorkspace_1.IExtHostWorkspace),
        __param(3, extHostDocumentsAndEditors_1.IExtHostDocumentsAndEditors),
        __param(4, extHostConfiguration_1.IExtHostConfiguration),
        __param(5, extHostTerminalService_1.IExtHostTerminalService),
        __param(6, log_1.ILogService),
        __param(7, extHostApiDeprecationService_1.IExtHostApiDeprecationService),
        __param(8, extHostVariableResolverService_1.IExtHostVariableResolverProvider)
    ], ExtHostTask);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRhc2suanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL25vZGUvZXh0SG9zdFRhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJ6RixJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFZLFNBQVEsNkJBQWU7UUFDL0MsWUFDcUIsVUFBOEIsRUFDekIsUUFBaUMsRUFDdEIsZ0JBQW1DLEVBQzFDLGFBQTBDLEVBQ2hELG9CQUEyQyxFQUN6QyxzQkFBK0MsRUFDM0QsVUFBdUIsRUFDTCxrQkFBaUQsRUFDN0IsZ0JBQWtEO1lBRXJHLEtBQUssQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxzQkFBc0IsRUFBRSxVQUFVLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQVJ2RyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBTXBCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0M7WUFHckcsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtnQkFDMUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFPLENBQUMsWUFBWSxFQUFFO29CQUM3QyxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxZQUFZO29CQUM1QixTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTO29CQUNwQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7aUJBQzFCLENBQUMsQ0FBQzthQUNIO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRTtvQkFDckMsTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSTtvQkFDcEIsU0FBUyxFQUFFLEVBQUU7b0JBQ2IsUUFBUSxFQUFFLE9BQU8s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