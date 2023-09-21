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
define(["require", "exports", "vs/nls", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/base/common/uri", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/jsonEditing", "vs/platform/workspaces/common/workspaces", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/commands/common/commands", "vs/base/common/resources", "vs/platform/notification/common/notification", "vs/platform/files/common/files", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/label/common/label", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/host/browser/host", "vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService", "vs/platform/native/common/native", "vs/base/common/platform", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/configuration/common/configuration", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, nls_1, workspaceEditing_1, uri_1, workspace_1, jsonEditing_1, workspaces_1, storage_1, extensions_1, workingCopyBackup_1, commands_1, resources_1, notification_1, files_1, environmentService_1, lifecycle_1, dialogs_1, extensions_2, label_1, textfiles_1, host_1, abstractWorkspaceEditingService_1, native_1, platform_1, workingCopyBackupService_1, uriIdentity_1, workspaceTrust_1, configuration_1, userDataProfile_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeWorkspaceEditingService = void 0;
    let NativeWorkspaceEditingService = class NativeWorkspaceEditingService extends abstractWorkspaceEditingService_1.AbstractWorkspaceEditingService {
        constructor(jsonEditingService, contextService, nativeHostService, configurationService, storageService, extensionService, workingCopyBackupService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, lifecycleService, labelService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService) {
            super(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService);
            this.nativeHostService = nativeHostService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.lifecycleService = lifecycleService;
            this.labelService = labelService;
            this.registerListeners();
        }
        registerListeners() {
            this.lifecycleService.onBeforeShutdown(e => {
                const saveOperation = this.saveUntitledBeforeShutdown(e.reason);
                e.veto(saveOperation, 'veto.untitledWorkspace');
            });
        }
        async saveUntitledBeforeShutdown(reason) {
            if (reason !== 4 /* ShutdownReason.LOAD */ && reason !== 1 /* ShutdownReason.CLOSE */) {
                return false; // only interested when window is closing or loading
            }
            const workspaceIdentifier = this.getCurrentWorkspaceIdentifier();
            if (!workspaceIdentifier || !(0, workspace_1.isUntitledWorkspace)(workspaceIdentifier.configPath, this.environmentService)) {
                return false; // only care about untitled workspaces to ask for saving
            }
            const windowCount = await this.nativeHostService.getWindowCount();
            if (reason === 1 /* ShutdownReason.CLOSE */ && !platform_1.isMacintosh && windowCount === 1) {
                return false; // Windows/Linux: quits when last window is closed, so do not ask then
            }
            const { result } = await this.dialogService.prompt({
                type: notification_1.Severity.Warning,
                message: (0, nls_1.localize)('saveWorkspaceMessage', "Do you want to save your workspace configuration as a file?"),
                detail: (0, nls_1.localize)('saveWorkspaceDetail', "Save your workspace if you plan to open it again."),
                buttons: [
                    {
                        label: (0, nls_1.localize)({ key: 'save', comment: ['&& denotes a mnemonic'] }, "&&Save"),
                        run: async () => {
                            const newWorkspacePath = await this.pickNewWorkspacePath();
                            if (!newWorkspacePath || !(0, workspace_1.hasWorkspaceFileExtension)(newWorkspacePath)) {
                                return true; // keep veto if no target was provided
                            }
                            try {
                                await this.saveWorkspaceAs(workspaceIdentifier, newWorkspacePath);
                                // Make sure to add the new workspace to the history to find it again
                                const newWorkspaceIdentifier = await this.workspacesService.getWorkspaceIdentifier(newWorkspacePath);
                                await this.workspacesService.addRecentlyOpened([{
                                        label: this.labelService.getWorkspaceLabel(newWorkspaceIdentifier, { verbose: 2 /* Verbosity.LONG */ }),
                                        workspace: newWorkspaceIdentifier,
                                        remoteAuthority: this.environmentService.remoteAuthority // remember whether this was a remote window
                                    }]);
                                // Delete the untitled one
                                await this.workspacesService.deleteUntitledWorkspace(workspaceIdentifier);
                            }
                            catch (error) {
                                // ignore
                            }
                            return false;
                        }
                    },
                    {
                        label: (0, nls_1.localize)({ key: 'doNotSave', comment: ['&& denotes a mnemonic'] }, "Do&&n't Save"),
                        run: async () => {
                            await this.workspacesService.deleteUntitledWorkspace(workspaceIdentifier);
                            return false;
                        }
                    }
                ],
                cancelButton: {
                    run: () => true // veto
                }
            });
            return result;
        }
        async isValidTargetWorkspacePath(workspaceUri) {
            const windows = await this.nativeHostService.getWindows();
            // Prevent overwriting a workspace that is currently opened in another window
            if (windows.some(window => (0, workspace_1.isWorkspaceIdentifier)(window.workspace) && this.uriIdentityService.extUri.isEqual(window.workspace.configPath, workspaceUri))) {
                await this.dialogService.info((0, nls_1.localize)('workspaceOpenedMessage', "Unable to save workspace '{0}'", (0, resources_1.basename)(workspaceUri)), (0, nls_1.localize)('workspaceOpenedDetail', "The workspace is already opened in another window. Please close that window first and then try again."));
                return false;
            }
            return true; // OK
        }
        async enterWorkspace(workspaceUri) {
            const stopped = await this.extensionService.stopExtensionHosts((0, nls_1.localize)('restartExtensionHost.reason', "Opening a multi-root workspace."));
            if (!stopped) {
                return;
            }
            const result = await this.doEnterWorkspace(workspaceUri);
            if (result) {
                // Migrate storage to new workspace
                await this.storageService.switch(result.workspace, true /* preserve data */);
                // Reinitialize backup service
                if (this.workingCopyBackupService instanceof workingCopyBackupService_1.WorkingCopyBackupService) {
                    const newBackupWorkspaceHome = result.backupPath ? uri_1.URI.file(result.backupPath).with({ scheme: this.environmentService.userRoamingDataHome.scheme }) : undefined;
                    this.workingCopyBackupService.reinitialize(newBackupWorkspaceHome);
                }
            }
            // TODO@aeschli: workaround until restarting works
            if (this.environmentService.remoteAuthority) {
                this.hostService.reload();
            }
            // Restart the extension host: entering a workspace means a new location for
            // storage and potentially a change in the workspace.rootPath property.
            else {
                this.extensionService.startExtensionHosts();
            }
        }
    };
    exports.NativeWorkspaceEditingService = NativeWorkspaceEditingService;
    exports.NativeWorkspaceEditingService = NativeWorkspaceEditingService = __decorate([
        __param(0, jsonEditing_1.IJSONEditingService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, native_1.INativeHostService),
        __param(3, configuration_1.IWorkbenchConfigurationService),
        __param(4, storage_1.IStorageService),
        __param(5, extensions_1.IExtensionService),
        __param(6, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(7, notification_1.INotificationService),
        __param(8, commands_1.ICommandService),
        __param(9, files_1.IFileService),
        __param(10, textfiles_1.ITextFileService),
        __param(11, workspaces_1.IWorkspacesService),
        __param(12, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(13, dialogs_1.IFileDialogService),
        __param(14, dialogs_1.IDialogService),
        __param(15, lifecycle_1.ILifecycleService),
        __param(16, label_1.ILabelService),
        __param(17, host_1.IHostService),
        __param(18, uriIdentity_1.IUriIdentityService),
        __param(19, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(20, userDataProfile_1.IUserDataProfilesService),
        __param(21, userDataProfile_2.IUserDataProfileService)
    ], NativeWorkspaceEditingService);
    (0, extensions_2.registerSingleton)(workspaceEditing_1.IWorkspaceEditingService, NativeWorkspaceEditingService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlRWRpdGluZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya3NwYWNlcy9lbGVjdHJvbi1zYW5kYm94L3dvcmtzcGFjZUVkaXRpbmdTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlDekYsSUFBTSw2QkFBNkIsR0FBbkMsTUFBTSw2QkFBOEIsU0FBUSxpRUFBK0I7UUFFakYsWUFDc0Isa0JBQXVDLEVBQ2xDLGNBQWdDLEVBQzlCLGlCQUFxQyxFQUNqQyxvQkFBb0QsRUFDM0QsY0FBK0IsRUFDN0IsZ0JBQW1DLEVBQzNCLHdCQUFtRCxFQUNoRSxtQkFBeUMsRUFDOUMsY0FBK0IsRUFDbEMsV0FBeUIsRUFDckIsZUFBaUMsRUFDL0IsaUJBQXFDLEVBQ3JCLGtCQUFzRCxFQUN0RSxpQkFBcUMsRUFDekMsYUFBNkIsRUFDVCxnQkFBbUMsRUFDdkMsWUFBMkIsRUFDN0MsV0FBeUIsRUFDbEIsa0JBQXVDLEVBQzFCLCtCQUFpRSxFQUN6RSx1QkFBaUQsRUFDbEQsc0JBQStDO1lBRXhFLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSwrQkFBK0IsRUFBRSx1QkFBdUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1lBckJuUyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBRXhDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUM3QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQzNCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMkI7WUFTbEQs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