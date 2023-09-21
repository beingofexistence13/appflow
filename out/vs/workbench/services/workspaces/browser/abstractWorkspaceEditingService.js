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
define(["require", "exports", "vs/nls", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/jsonEditing", "vs/platform/workspaces/common/workspaces", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/commands/common/commands", "vs/base/common/arrays", "vs/base/common/resources", "vs/platform/notification/common/notification", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/platform/dialogs/common/dialogs", "vs/base/common/labels", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/host/browser/host", "vs/base/common/network", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/configuration/common/configuration", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, nls_1, workspace_1, jsonEditing_1, workspaces_1, configurationRegistry_1, platform_1, commands_1, arrays_1, resources_1, notification_1, files_1, environmentService_1, dialogs_1, labels_1, textfiles_1, host_1, network_1, uriIdentity_1, workspaceTrust_1, configuration_1, userDataProfile_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractWorkspaceEditingService = void 0;
    let AbstractWorkspaceEditingService = class AbstractWorkspaceEditingService {
        constructor(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService) {
            this.jsonEditingService = jsonEditingService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.notificationService = notificationService;
            this.commandService = commandService;
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.workspacesService = workspacesService;
            this.environmentService = environmentService;
            this.fileDialogService = fileDialogService;
            this.dialogService = dialogService;
            this.hostService = hostService;
            this.uriIdentityService = uriIdentityService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.userDataProfilesService = userDataProfilesService;
            this.userDataProfileService = userDataProfileService;
        }
        async pickNewWorkspacePath() {
            const availableFileSystems = [network_1.Schemas.file];
            if (this.environmentService.remoteAuthority) {
                availableFileSystems.unshift(network_1.Schemas.vscodeRemote);
            }
            let workspacePath = await this.fileDialogService.showSaveDialog({
                saveLabel: (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)('save', "Save")),
                title: (0, nls_1.localize)('saveWorkspace', "Save Workspace"),
                filters: workspace_1.WORKSPACE_FILTER,
                defaultUri: (0, resources_1.joinPath)(await this.fileDialogService.defaultWorkspacePath(), this.getNewWorkspaceName()),
                availableFileSystems
            });
            if (!workspacePath) {
                return; // canceled
            }
            if (!(0, workspace_1.hasWorkspaceFileExtension)(workspacePath)) {
                // Always ensure we have workspace file extension
                // (see https://github.com/microsoft/vscode/issues/84818)
                workspacePath = workspacePath.with({ path: `${workspacePath.path}.${workspace_1.WORKSPACE_EXTENSION}` });
            }
            return workspacePath;
        }
        getNewWorkspaceName() {
            // First try with existing workspace name
            const configPathURI = this.getCurrentWorkspaceIdentifier()?.configPath;
            if (configPathURI && (0, workspace_1.isSavedWorkspace)(configPathURI, this.environmentService)) {
                return (0, resources_1.basename)(configPathURI);
            }
            // Then fallback to first folder if any
            const folder = (0, arrays_1.firstOrDefault)(this.contextService.getWorkspace().folders);
            if (folder) {
                return `${(0, resources_1.basename)(folder.uri)}.${workspace_1.WORKSPACE_EXTENSION}`;
            }
            // Finally pick a good default
            return `workspace.${workspace_1.WORKSPACE_EXTENSION}`;
        }
        async updateFolders(index, deleteCount, foldersToAddCandidates, donotNotifyError) {
            const folders = this.contextService.getWorkspace().folders;
            let foldersToDelete = [];
            if (typeof deleteCount === 'number') {
                foldersToDelete = folders.slice(index, index + deleteCount).map(folder => folder.uri);
            }
            let foldersToAdd = [];
            if (Array.isArray(foldersToAddCandidates)) {
                foldersToAdd = foldersToAddCandidates.map(folderToAdd => ({ uri: (0, resources_1.removeTrailingPathSeparator)(folderToAdd.uri), name: folderToAdd.name })); // Normalize
            }
            const wantsToDelete = foldersToDelete.length > 0;
            const wantsToAdd = foldersToAdd.length > 0;
            if (!wantsToAdd && !wantsToDelete) {
                return; // return early if there is nothing to do
            }
            // Add Folders
            if (wantsToAdd && !wantsToDelete) {
                return this.doAddFolders(foldersToAdd, index, donotNotifyError);
            }
            // Delete Folders
            if (wantsToDelete && !wantsToAdd) {
                return this.removeFolders(foldersToDelete);
            }
            // Add & Delete Folders
            else {
                // if we are in single-folder state and the folder is replaced with
                // other folders, we handle this specially and just enter workspace
                // mode with the folders that are being added.
                if (this.includesSingleFolderWorkspace(foldersToDelete)) {
                    return this.createAndEnterWorkspace(foldersToAdd);
                }
                // if we are not in workspace-state, we just add the folders
                if (this.contextService.getWorkbenchState() !== 3 /* WorkbenchState.WORKSPACE */) {
                    return this.doAddFolders(foldersToAdd, index, donotNotifyError);
                }
                // finally, update folders within the workspace
                return this.doUpdateFolders(foldersToAdd, foldersToDelete, index, donotNotifyError);
            }
        }
        async doUpdateFolders(foldersToAdd, foldersToDelete, index, donotNotifyError = false) {
            try {
                await this.contextService.updateFolders(foldersToAdd, foldersToDelete, index);
            }
            catch (error) {
                if (donotNotifyError) {
                    throw error;
                }
                this.handleWorkspaceConfigurationEditingError(error);
            }
        }
        addFolders(foldersToAddCandidates, donotNotifyError = false) {
            // Normalize
            const foldersToAdd = foldersToAddCandidates.map(folderToAdd => ({ uri: (0, resources_1.removeTrailingPathSeparator)(folderToAdd.uri), name: folderToAdd.name }));
            return this.doAddFolders(foldersToAdd, undefined, donotNotifyError);
        }
        async doAddFolders(foldersToAdd, index, donotNotifyError = false) {
            const state = this.contextService.getWorkbenchState();
            const remoteAuthority = this.environmentService.remoteAuthority;
            if (remoteAuthority) {
                // https://github.com/microsoft/vscode/issues/94191
                foldersToAdd = foldersToAdd.filter(folder => folder.uri.scheme !== network_1.Schemas.file && (folder.uri.scheme !== network_1.Schemas.vscodeRemote || (0, resources_1.isEqualAuthority)(folder.uri.authority, remoteAuthority)));
            }
            // If we are in no-workspace or single-folder workspace, adding folders has to
            // enter a workspace.
            if (state !== 3 /* WorkbenchState.WORKSPACE */) {
                let newWorkspaceFolders = this.contextService.getWorkspace().folders.map(folder => ({ uri: folder.uri }));
                newWorkspaceFolders.splice(typeof index === 'number' ? index : newWorkspaceFolders.length, 0, ...foldersToAdd);
                newWorkspaceFolders = (0, arrays_1.distinct)(newWorkspaceFolders, folder => this.uriIdentityService.extUri.getComparisonKey(folder.uri));
                if (state === 1 /* WorkbenchState.EMPTY */ && newWorkspaceFolders.length === 0 || state === 2 /* WorkbenchState.FOLDER */ && newWorkspaceFolders.length === 1) {
                    return; // return if the operation is a no-op for the current state
                }
                return this.createAndEnterWorkspace(newWorkspaceFolders);
            }
            // Delegate addition of folders to workspace service otherwise
            try {
                await this.contextService.addFolders(foldersToAdd, index);
            }
            catch (error) {
                if (donotNotifyError) {
                    throw error;
                }
                this.handleWorkspaceConfigurationEditingError(error);
            }
        }
        async removeFolders(foldersToRemove, donotNotifyError = false) {
            // If we are in single-folder state and the opened folder is to be removed,
            // we create an empty workspace and enter it.
            if (this.includesSingleFolderWorkspace(foldersToRemove)) {
                return this.createAndEnterWorkspace([]);
            }
            // Delegate removal of folders to workspace service otherwise
            try {
                await this.contextService.removeFolders(foldersToRemove);
            }
            catch (error) {
                if (donotNotifyError) {
                    throw error;
                }
                this.handleWorkspaceConfigurationEditingError(error);
            }
        }
        includesSingleFolderWorkspace(folders) {
            if (this.contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                const workspaceFolder = this.contextService.getWorkspace().folders[0];
                return (folders.some(folder => this.uriIdentityService.extUri.isEqual(folder, workspaceFolder.uri)));
            }
            return false;
        }
        async createAndEnterWorkspace(folders, path) {
            if (path && !await this.isValidTargetWorkspacePath(path)) {
                return;
            }
            const remoteAuthority = this.environmentService.remoteAuthority;
            const untitledWorkspace = await this.workspacesService.createUntitledWorkspace(folders, remoteAuthority);
            if (path) {
                try {
                    await this.saveWorkspaceAs(untitledWorkspace, path);
                }
                finally {
                    await this.workspacesService.deleteUntitledWorkspace(untitledWorkspace); // https://github.com/microsoft/vscode/issues/100276
                }
            }
            else {
                path = untitledWorkspace.configPath;
                if (!this.userDataProfileService.currentProfile.isDefault) {
                    await this.userDataProfilesService.setProfileForWorkspace(untitledWorkspace, this.userDataProfileService.currentProfile);
                }
            }
            return this.enterWorkspace(path);
        }
        async saveAndEnterWorkspace(workspaceUri) {
            const workspaceIdentifier = this.getCurrentWorkspaceIdentifier();
            if (!workspaceIdentifier) {
                return;
            }
            // Allow to save the workspace of the current window
            // if we have an identical match on the path
            if ((0, resources_1.isEqual)(workspaceIdentifier.configPath, workspaceUri)) {
                return this.saveWorkspace(workspaceIdentifier);
            }
            // From this moment on we require a valid target that is not opened already
            if (!await this.isValidTargetWorkspacePath(workspaceUri)) {
                return;
            }
            await this.saveWorkspaceAs(workspaceIdentifier, workspaceUri);
            return this.enterWorkspace(workspaceUri);
        }
        async isValidTargetWorkspacePath(workspaceUri) {
            return true; // OK
        }
        async saveWorkspaceAs(workspace, targetConfigPathURI) {
            const configPathURI = workspace.configPath;
            const isNotUntitledWorkspace = !(0, workspace_1.isUntitledWorkspace)(targetConfigPathURI, this.environmentService);
            if (isNotUntitledWorkspace && !this.userDataProfileService.currentProfile.isDefault) {
                const newWorkspace = await this.workspacesService.getWorkspaceIdentifier(targetConfigPathURI);
                await this.userDataProfilesService.setProfileForWorkspace(newWorkspace, this.userDataProfileService.currentProfile);
            }
            // Return early if target is same as source
            if (this.uriIdentityService.extUri.isEqual(configPathURI, targetConfigPathURI)) {
                return;
            }
            const isFromUntitledWorkspace = (0, workspace_1.isUntitledWorkspace)(configPathURI, this.environmentService);
            // Read the contents of the workspace file, update it to new location and save it.
            const raw = await this.fileService.readFile(configPathURI);
            const newRawWorkspaceContents = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(raw.value.toString(), configPathURI, isFromUntitledWorkspace, targetConfigPathURI, this.uriIdentityService.extUri);
            await this.textFileService.create([{ resource: targetConfigPathURI, value: newRawWorkspaceContents, options: { overwrite: true } }]);
            // Set trust for the workspace file
            await this.trustWorkspaceConfiguration(targetConfigPathURI);
        }
        async saveWorkspace(workspace) {
            const configPathURI = workspace.configPath;
            // First: try to save any existing model as it could be dirty
            const existingModel = this.textFileService.files.get(configPathURI);
            if (existingModel) {
                await existingModel.save({ force: true, reason: 1 /* SaveReason.EXPLICIT */ });
                return;
            }
            // Second: if the file exists on disk, simply return
            const workspaceFileExists = await this.fileService.exists(configPathURI);
            if (workspaceFileExists) {
                return;
            }
            // Finally, we need to re-create the file as it was deleted
            const newWorkspace = { folders: [] };
            const newRawWorkspaceContents = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(JSON.stringify(newWorkspace, null, '\t'), configPathURI, false, configPathURI, this.uriIdentityService.extUri);
            await this.textFileService.create([{ resource: configPathURI, value: newRawWorkspaceContents }]);
        }
        handleWorkspaceConfigurationEditingError(error) {
            switch (error.code) {
                case 0 /* JSONEditingErrorCode.ERROR_INVALID_FILE */:
                    this.onInvalidWorkspaceConfigurationFileError();
                    break;
                default:
                    this.notificationService.error(error.message);
            }
        }
        onInvalidWorkspaceConfigurationFileError() {
            const message = (0, nls_1.localize)('errorInvalidTaskConfiguration', "Unable to write into workspace configuration file. Please open the file to correct errors/warnings in it and try again.");
            this.askToOpenWorkspaceConfigurationFile(message);
        }
        askToOpenWorkspaceConfigurationFile(message) {
            this.notificationService.prompt(notification_1.Severity.Error, message, [{
                    label: (0, nls_1.localize)('openWorkspaceConfigurationFile', "Open Workspace Configuration"),
                    run: () => this.commandService.executeCommand('workbench.action.openWorkspaceConfigFile')
                }]);
        }
        async doEnterWorkspace(workspaceUri) {
            if (!!this.environmentService.extensionTestsLocationURI) {
                throw new Error('Entering a new workspace is not possible in tests.');
            }
            const workspace = await this.workspacesService.getWorkspaceIdentifier(workspaceUri);
            // Settings migration (only if we come from a folder workspace)
            if (this.contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                await this.migrateWorkspaceSettings(workspace);
            }
            await this.configurationService.initialize(workspace);
            return this.workspacesService.enterWorkspace(workspaceUri);
        }
        migrateWorkspaceSettings(toWorkspace) {
            return this.doCopyWorkspaceSettings(toWorkspace, setting => setting.scope === 3 /* ConfigurationScope.WINDOW */);
        }
        copyWorkspaceSettings(toWorkspace) {
            return this.doCopyWorkspaceSettings(toWorkspace);
        }
        doCopyWorkspaceSettings(toWorkspace, filter) {
            const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            const targetWorkspaceConfiguration = {};
            for (const key of this.configurationService.keys().workspace) {
                if (configurationProperties[key]) {
                    if (filter && !filter(configurationProperties[key])) {
                        continue;
                    }
                    targetWorkspaceConfiguration[key] = this.configurationService.inspect(key).workspaceValue;
                }
            }
            return this.jsonEditingService.write(toWorkspace.configPath, [{ path: ['settings'], value: targetWorkspaceConfiguration }], true);
        }
        async trustWorkspaceConfiguration(configPathURI) {
            if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && this.workspaceTrustManagementService.isWorkspaceTrusted()) {
                await this.workspaceTrustManagementService.setUrisTrust([configPathURI], true);
            }
        }
        getCurrentWorkspaceIdentifier() {
            const identifier = (0, workspace_1.toWorkspaceIdentifier)(this.contextService.getWorkspace());
            if ((0, workspace_1.isWorkspaceIdentifier)(identifier)) {
                return identifier;
            }
            return undefined;
        }
    };
    exports.AbstractWorkspaceEditingService = AbstractWorkspaceEditingService;
    exports.AbstractWorkspaceEditingService = AbstractWorkspaceEditingService = __decorate([
        __param(0, jsonEditing_1.IJSONEditingService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, configuration_1.IWorkbenchConfigurationService),
        __param(3, notification_1.INotificationService),
        __param(4, commands_1.ICommandService),
        __param(5, files_1.IFileService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, workspaces_1.IWorkspacesService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, dialogs_1.IFileDialogService),
        __param(10, dialogs_1.IDialogService),
        __param(11, host_1.IHostService),
        __param(12, uriIdentity_1.IUriIdentityService),
        __param(13, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(14, userDataProfile_1.IUserDataProfilesService),
        __param(15, userDataProfile_2.IUserDataProfileService)
    ], AbstractWorkspaceEditingService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RXb3Jrc3BhY2VFZGl0aW5nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3Jrc3BhY2VzL2Jyb3dzZXIvYWJzdHJhY3RXb3Jrc3BhY2VFZGl0aW5nU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE2QnpGLElBQWUsK0JBQStCLEdBQTlDLE1BQWUsK0JBQStCO1FBSXBELFlBQ3VDLGtCQUF1QyxFQUNoQyxjQUFnQyxFQUM1QixvQkFBb0QsRUFDOUQsbUJBQXlDLEVBQzlDLGNBQStCLEVBQ2xDLFdBQXlCLEVBQ3JCLGVBQWlDLEVBQzdCLGlCQUFxQyxFQUMzQixrQkFBZ0QsRUFDNUQsaUJBQXFDLEVBQ3ZDLGFBQTZCLEVBQy9CLFdBQXlCLEVBQ2xCLGtCQUF1QyxFQUM1QiwrQkFBaUUsRUFDekUsdUJBQWlELEVBQ2xELHNCQUErQztZQWZuRCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ2hDLG1CQUFjLEdBQWQsY0FBYyxDQUFrQjtZQUM1Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQWdDO1lBQzlELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDOUMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2xDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3JCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUM3QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQzNCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBOEI7WUFDNUQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN2QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDL0IsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDbEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUM1QixvQ0FBK0IsR0FBL0IsK0JB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