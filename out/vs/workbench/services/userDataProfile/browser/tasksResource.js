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
define(["require", "exports", "vs/base/common/buffer", "vs/nls", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/common/views", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, buffer_1, nls_1, files_1, instantiation_1, log_1, uriIdentity_1, editorCommands_1, views_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TasksResourceTreeItem = exports.TasksResource = exports.TasksResourceInitializer = void 0;
    let TasksResourceInitializer = class TasksResourceInitializer {
        constructor(userDataProfileService, fileService, logService) {
            this.userDataProfileService = userDataProfileService;
            this.fileService = fileService;
            this.logService = logService;
        }
        async initialize(content) {
            const tasksContent = JSON.parse(content);
            if (!tasksContent.tasks) {
                this.logService.info(`Initializing Profile: No tasks to apply...`);
                return;
            }
            await this.fileService.writeFile(this.userDataProfileService.currentProfile.tasksResource, buffer_1.VSBuffer.fromString(tasksContent.tasks));
        }
    };
    exports.TasksResourceInitializer = TasksResourceInitializer;
    exports.TasksResourceInitializer = TasksResourceInitializer = __decorate([
        __param(0, userDataProfile_1.IUserDataProfileService),
        __param(1, files_1.IFileService),
        __param(2, log_1.ILogService)
    ], TasksResourceInitializer);
    let TasksResource = class TasksResource {
        constructor(fileService, logService) {
            this.fileService = fileService;
            this.logService = logService;
        }
        async getContent(profile) {
            const tasksContent = await this.getTasksResourceContent(profile);
            return JSON.stringify(tasksContent);
        }
        async getTasksResourceContent(profile) {
            const tasksContent = await this.getTasksContent(profile);
            return { tasks: tasksContent };
        }
        async apply(content, profile) {
            const tasksContent = JSON.parse(content);
            if (!tasksContent.tasks) {
                this.logService.info(`Importing Profile (${profile.name}): No tasks to apply...`);
                return;
            }
            await this.fileService.writeFile(profile.tasksResource, buffer_1.VSBuffer.fromString(tasksContent.tasks));
        }
        async getTasksContent(profile) {
            try {
                const content = await this.fileService.readFile(profile.tasksResource);
                return content.value.toString();
            }
            catch (error) {
                // File not found
                if (error instanceof files_1.FileOperationError && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    return null;
                }
                else {
                    throw error;
                }
            }
        }
    };
    exports.TasksResource = TasksResource;
    exports.TasksResource = TasksResource = __decorate([
        __param(0, files_1.IFileService),
        __param(1, log_1.ILogService)
    ], TasksResource);
    let TasksResourceTreeItem = class TasksResourceTreeItem {
        constructor(profile, uriIdentityService, instantiationService) {
            this.profile = profile;
            this.uriIdentityService = uriIdentityService;
            this.instantiationService = instantiationService;
            this.type = "tasks" /* ProfileResourceType.Tasks */;
            this.handle = "tasks" /* ProfileResourceType.Tasks */;
            this.label = { label: (0, nls_1.localize)('tasks', "User Tasks") };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
        }
        async getChildren() {
            return [{
                    handle: this.profile.tasksResource.toString(),
                    resourceUri: this.profile.tasksResource,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    parent: this,
                    accessibilityInformation: {
                        label: this.uriIdentityService.extUri.basename(this.profile.settingsResource)
                    },
                    command: {
                        id: editorCommands_1.API_OPEN_EDITOR_COMMAND_ID,
                        title: '',
                        arguments: [this.profile.tasksResource, undefined, undefined]
                    }
                }];
        }
        async hasContent() {
            const tasksContent = await this.instantiationService.createInstance(TasksResource).getTasksResourceContent(this.profile);
            return tasksContent.tasks !== null;
        }
        async getContent() {
            return this.instantiationService.createInstance(TasksResource).getContent(this.profile);
        }
        isFromDefaultProfile() {
            return !this.profile.isDefault && !!this.profile.useDefaultFlags?.tasks;
        }
    };
    exports.TasksResourceTreeItem = TasksResourceTreeItem;
    exports.TasksResourceTreeItem = TasksResourceTreeItem = __decorate([
        __param(1, uriIdentity_1.IUriIdentityService),
        __param(2, instantiation_1.IInstantiationService)
    ], TasksResourceTreeItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3NSZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVByb2ZpbGUvYnJvd3Nlci90YXNrc1Jlc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCekYsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBd0I7UUFFcEMsWUFDMkMsc0JBQStDLEVBQzFELFdBQXlCLEVBQzFCLFVBQXVCO1lBRlgsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUMxRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUMxQixlQUFVLEdBQVYsVUFBVSxDQUFhO1FBRXRELENBQUM7UUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQWU7WUFDL0IsTUFBTSxZQUFZLEdBQTBCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7Z0JBQ25FLE9BQU87YUFDUDtZQUNELE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDckksQ0FBQztLQUNELENBQUE7SUFqQlksNERBQXdCO3VDQUF4Qix3QkFBd0I7UUFHbEMsV0FBQSx5Q0FBdUIsQ0FBQTtRQUN2QixXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLGlCQUFXLENBQUE7T0FMRCx3QkFBd0IsQ0FpQnBDO0lBRU0sSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYTtRQUV6QixZQUNnQyxXQUF5QixFQUMx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