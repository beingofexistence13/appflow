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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/editor/common/services/getIconClasses", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/workspace", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls", "vs/workbench/services/configuration/common/jsonEditing", "vs/base/common/map"], function (require, exports, arrays_1, event_1, json_1, lifecycle_1, getIconClasses_1, files_1, extensions_1, instantiation_1, workspace_1, quickInput_1, model_1, language_1, nls_1, jsonEditing_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceExtensionsConfigService = exports.IWorkspaceExtensionsConfigService = exports.EXTENSIONS_CONFIG = void 0;
    exports.EXTENSIONS_CONFIG = '.vscode/extensions.json';
    exports.IWorkspaceExtensionsConfigService = (0, instantiation_1.createDecorator)('IWorkspaceExtensionsConfigService');
    let WorkspaceExtensionsConfigService = class WorkspaceExtensionsConfigService extends lifecycle_1.Disposable {
        constructor(workspaceContextService, fileService, quickInputService, modelService, languageService, jsonEditingService) {
            super();
            this.workspaceContextService = workspaceContextService;
            this.fileService = fileService;
            this.quickInputService = quickInputService;
            this.modelService = modelService;
            this.languageService = languageService;
            this.jsonEditingService = jsonEditingService;
            this._onDidChangeExtensionsConfigs = this._register(new event_1.Emitter());
            this.onDidChangeExtensionsConfigs = this._onDidChangeExtensionsConfigs.event;
            this._register(workspaceContextService.onDidChangeWorkspaceFolders(e => this._onDidChangeExtensionsConfigs.fire()));
            this._register(fileService.onDidFilesChange(e => {
                const workspace = workspaceContextService.getWorkspace();
                if ((workspace.configuration && e.affects(workspace.configuration))
                    || workspace.folders.some(folder => e.affects(folder.toResource(exports.EXTENSIONS_CONFIG)))) {
                    this._onDidChangeExtensionsConfigs.fire();
                }
            }));
        }
        async getExtensionsConfigs() {
            const workspace = this.workspaceContextService.getWorkspace();
            const result = [];
            const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : undefined;
            if (workspaceExtensionsConfigContent) {
                result.push(workspaceExtensionsConfigContent);
            }
            result.push(...await Promise.all(workspace.folders.map(workspaceFolder => this.resolveWorkspaceFolderExtensionConfig(workspaceFolder))));
            return result;
        }
        async getRecommendations() {
            const configs = await this.getExtensionsConfigs();
            return (0, arrays_1.distinct)((0, arrays_1.flatten)(configs.map(c => c.recommendations ? c.recommendations.map(c => c.toLowerCase()) : [])));
        }
        async getUnwantedRecommendations() {
            const configs = await this.getExtensionsConfigs();
            return (0, arrays_1.distinct)((0, arrays_1.flatten)(configs.map(c => c.unwantedRecommendations ? c.unwantedRecommendations.map(c => c.toLowerCase()) : [])));
        }
        async toggleRecommendation(extensionId) {
            extensionId = extensionId.toLowerCase();
            const workspace = this.workspaceContextService.getWorkspace();
            const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : undefined;
            const workspaceFolderExtensionsConfigContents = new map_1.ResourceMap();
            await Promise.all(workspace.folders.map(async (workspaceFolder) => {
                const extensionsConfigContent = await this.resolveWorkspaceFolderExtensionConfig(workspaceFolder);
                workspaceFolderExtensionsConfigContents.set(workspaceFolder.uri, extensionsConfigContent);
            }));
            const isWorkspaceRecommended = workspaceExtensionsConfigContent && workspaceExtensionsConfigContent.recommendations?.some(r => r.toLowerCase() === extensionId);
            const recommendedWorksapceFolders = workspace.folders.filter(workspaceFolder => workspaceFolderExtensionsConfigContents.get(workspaceFolder.uri)?.recommendations?.some(r => r.toLowerCase() === extensionId));
            const isRecommended = isWorkspaceRecommended || recommendedWorksapceFolders.length > 0;
            const workspaceOrFolders = isRecommended
                ? await this.pickWorkspaceOrFolders(recommendedWorksapceFolders, isWorkspaceRecommended ? workspace : undefined, (0, nls_1.localize)('select for remove', "Remove extension recommendation from"))
                : await this.pickWorkspaceOrFolders(workspace.folders, workspace.configuration ? workspace : undefined, (0, nls_1.localize)('select for add', "Add extension recommendation to"));
            for (const workspaceOrWorkspaceFolder of workspaceOrFolders) {
                if ((0, workspace_1.isWorkspace)(workspaceOrWorkspaceFolder)) {
                    await this.addOrRemoveWorkspaceRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceExtensionsConfigContent, !isRecommended);
                }
                else {
                    await this.addOrRemoveWorkspaceFolderRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceFolderExtensionsConfigContents.get(workspaceOrWorkspaceFolder.uri), !isRecommended);
                }
            }
        }
        async toggleUnwantedRecommendation(extensionId) {
            const workspace = this.workspaceContextService.getWorkspace();
            const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : undefined;
            const workspaceFolderExtensionsConfigContents = new map_1.ResourceMap();
            await Promise.all(workspace.folders.map(async (workspaceFolder) => {
                const extensionsConfigContent = await this.resolveWorkspaceFolderExtensionConfig(workspaceFolder);
                workspaceFolderExtensionsConfigContents.set(workspaceFolder.uri, extensionsConfigContent);
            }));
            const isWorkspaceUnwanted = workspaceExtensionsConfigContent && workspaceExtensionsConfigContent.unwantedRecommendations?.some(r => r === extensionId);
            const unWantedWorksapceFolders = workspace.folders.filter(workspaceFolder => workspaceFolderExtensionsConfigContents.get(workspaceFolder.uri)?.unwantedRecommendations?.some(r => r === extensionId));
            const isUnwanted = isWorkspaceUnwanted || unWantedWorksapceFolders.length > 0;
            const workspaceOrFolders = isUnwanted
                ? await this.pickWorkspaceOrFolders(unWantedWorksapceFolders, isWorkspaceUnwanted ? workspace : undefined, (0, nls_1.localize)('select for remove', "Remove extension recommendation from"))
                : await this.pickWorkspaceOrFolders(workspace.folders, workspace.configuration ? workspace : undefined, (0, nls_1.localize)('select for add', "Add extension recommendation to"));
            for (const workspaceOrWorkspaceFolder of workspaceOrFolders) {
                if ((0, workspace_1.isWorkspace)(workspaceOrWorkspaceFolder)) {
                    await this.addOrRemoveWorkspaceUnwantedRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceExtensionsConfigContent, !isUnwanted);
                }
                else {
                    await this.addOrRemoveWorkspaceFolderUnwantedRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceFolderExtensionsConfigContents.get(workspaceOrWorkspaceFolder.uri), !isUnwanted);
                }
            }
        }
        async addOrRemoveWorkspaceFolderRecommendation(extensionId, workspaceFolder, extensionsConfigContent, add) {
            const values = [];
            if (add) {
                values.push({ path: ['recommendations'], value: [...extensionsConfigContent.recommendations || [], extensionId] });
                if (extensionsConfigContent.unwantedRecommendations && extensionsConfigContent.unwantedRecommendations.some(e => e === extensionId)) {
                    values.push({ path: ['unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
                }
            }
            else if (extensionsConfigContent.recommendations) {
                values.push({ path: ['recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
            }
            if (values.length) {
                return this.jsonEditingService.write(workspaceFolder.toResource(exports.EXTENSIONS_CONFIG), values, true);
            }
        }
        async addOrRemoveWorkspaceRecommendation(extensionId, workspace, extensionsConfigContent, add) {
            const values = [];
            if (extensionsConfigContent) {
                if (add) {
                    values.push({ path: ['extensions', 'recommendations'], value: [...extensionsConfigContent.recommendations || [], extensionId] });
                    if (extensionsConfigContent.unwantedRecommendations && extensionsConfigContent.unwantedRecommendations.some(e => e === extensionId)) {
                        values.push({ path: ['extensions', 'unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
                    }
                }
                else if (extensionsConfigContent.recommendations) {
                    values.push({ path: ['extensions', 'recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
                }
            }
            else if (add) {
                values.push({ path: ['extensions'], value: { recommendations: [extensionId] } });
            }
            if (values.length) {
                return this.jsonEditingService.write(workspace.configuration, values, true);
            }
        }
        async addOrRemoveWorkspaceFolderUnwantedRecommendation(extensionId, workspaceFolder, extensionsConfigContent, add) {
            const values = [];
            if (add) {
                values.push({ path: ['unwantedRecommendations'], value: [...extensionsConfigContent.unwantedRecommendations || [], extensionId] });
                if (extensionsConfigContent.recommendations && extensionsConfigContent.recommendations.some(e => e === extensionId)) {
                    values.push({ path: ['recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
                }
            }
            else if (extensionsConfigContent.unwantedRecommendations) {
                values.push({ path: ['unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
            }
            if (values.length) {
                return this.jsonEditingService.write(workspaceFolder.toResource(exports.EXTENSIONS_CONFIG), values, true);
            }
        }
        async addOrRemoveWorkspaceUnwantedRecommendation(extensionId, workspace, extensionsConfigContent, add) {
            const values = [];
            if (extensionsConfigContent) {
                if (add) {
                    values.push({ path: ['extensions', 'unwantedRecommendations'], value: [...extensionsConfigContent.unwantedRecommendations || [], extensionId] });
                    if (extensionsConfigContent.recommendations && extensionsConfigContent.recommendations.some(e => e === extensionId)) {
                        values.push({ path: ['extensions', 'recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
                    }
                }
                else if (extensionsConfigContent.unwantedRecommendations) {
                    values.push({ path: ['extensions', 'unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
                }
            }
            else if (add) {
                values.push({ path: ['extensions'], value: { unwantedRecommendations: [extensionId] } });
            }
            if (values.length) {
                return this.jsonEditingService.write(workspace.configuration, values, true);
            }
        }
        async pickWorkspaceOrFolders(workspaceFolders, workspace, placeHolder) {
            const workspaceOrFolders = workspace ? [...workspaceFolders, workspace] : [...workspaceFolders];
            if (workspaceOrFolders.length === 1) {
                return workspaceOrFolders;
            }
            const folderPicks = workspaceFolders.map(workspaceFolder => {
                return {
                    label: workspaceFolder.name,
                    description: (0, nls_1.localize)('workspace folder', "Workspace Folder"),
                    workspaceOrFolder: workspaceFolder,
                    iconClasses: (0, getIconClasses_1.getIconClasses)(this.modelService, this.languageService, workspaceFolder.uri, files_1.FileKind.ROOT_FOLDER)
                };
            });
            if (workspace) {
                folderPicks.push({ type: 'separator' });
                folderPicks.push({
                    label: (0, nls_1.localize)('workspace', "Workspace"),
                    workspaceOrFolder: workspace,
                });
            }
            const result = await this.quickInputService.pick(folderPicks, { placeHolder, canPickMany: true }) || [];
            return result.map(r => r.workspaceOrFolder);
        }
        async resolveWorkspaceExtensionConfig(workspaceConfigurationResource) {
            try {
                const content = await this.fileService.readFile(workspaceConfigurationResource);
                const extensionsConfigContent = (0, json_1.parse)(content.value.toString())['extensions'];
                return extensionsConfigContent ? this.parseExtensionConfig(extensionsConfigContent) : undefined;
            }
            catch (e) { /* Ignore */ }
            return undefined;
        }
        async resolveWorkspaceFolderExtensionConfig(workspaceFolder) {
            try {
                const content = await this.fileService.readFile(workspaceFolder.toResource(exports.EXTENSIONS_CONFIG));
                const extensionsConfigContent = (0, json_1.parse)(content.value.toString());
                return this.parseExtensionConfig(extensionsConfigContent);
            }
            catch (e) { /* ignore */ }
            return {};
        }
        parseExtensionConfig(extensionsConfigContent) {
            return {
                recommendations: (0, arrays_1.distinct)((extensionsConfigContent.recommendations || []).map(e => e.toLowerCase())),
                unwantedRecommendations: (0, arrays_1.distinct)((extensionsConfigContent.unwantedRecommendations || []).map(e => e.toLowerCase()))
            };
        }
    };
    exports.WorkspaceExtensionsConfigService = WorkspaceExtensionsConfigService;
    exports.WorkspaceExtensionsConfigService = WorkspaceExtensionsConfigService = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, files_1.IFileService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, model_1.IModelService),
        __param(4, language_1.ILanguageService),
        __param(5, jsonEditing_1.IJSONEditingService)
    ], WorkspaceExtensionsConfigService);
    (0, extensions_1.registerSingleton)(exports.IWorkspaceExtensionsConfigService, WorkspaceExtensionsConfigService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlRXh0ZW5zaW9uc0NvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25SZWNvbW1lbmRhdGlvbnMvY29tbW9uL3dvcmtzcGFjZUV4dGVuc2lvbnNDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJuRixRQUFBLGlCQUFpQixHQUFHLHlCQUF5QixDQUFDO0lBTzlDLFFBQUEsaUNBQWlDLEdBQUcsSUFBQSwrQkFBZSxFQUFvQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBY2xJLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWlDLFNBQVEsc0JBQVU7UUFPL0QsWUFDMkIsdUJBQWtFLEVBQzlFLFdBQTBDLEVBQ3BDLGlCQUFzRCxFQUMzRCxZQUE0QyxFQUN6QyxlQUFrRCxFQUMvQyxrQkFBd0Q7WUFFN0UsS0FBSyxFQUFFLENBQUM7WUFQbUMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUM3RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNuQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQzFDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3hCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUM5Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBVDdELGtDQUE2QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzVFLGlDQUE0QixHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUM7WUFXaEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEgs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