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
define(["require", "exports", "vs/nls!vs/workbench/services/workspaces/electron-sandbox/workspaceEditingService", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/base/common/uri", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/jsonEditing", "vs/platform/workspaces/common/workspaces", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/commands/common/commands", "vs/base/common/resources", "vs/platform/notification/common/notification", "vs/platform/files/common/files", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/label/common/label", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/host/browser/host", "vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService", "vs/platform/native/common/native", "vs/base/common/platform", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/configuration/common/configuration", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, nls_1, workspaceEditing_1, uri_1, workspace_1, jsonEditing_1, workspaces_1, storage_1, extensions_1, workingCopyBackup_1, commands_1, resources_1, notification_1, files_1, environmentService_1, lifecycle_1, dialogs_1, extensions_2, label_1, textfiles_1, host_1, abstractWorkspaceEditingService_1, native_1, platform_1, workingCopyBackupService_1, uriIdentity_1, workspaceTrust_1, configuration_1, userDataProfile_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$J_b = void 0;
    let $J_b = class $J_b extends abstractWorkspaceEditingService_1.$83b {
        constructor(jsonEditingService, contextService, F, configurationService, G, H, I, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, J, K, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService) {
            super(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService);
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.K = K;
            this.L();
        }
        L() {
            this.J.onBeforeShutdown(e => {
                const saveOperation = this.M(e.reason);
                e.veto(saveOperation, 'veto.untitledWorkspace');
            });
        }
        async M(reason) {
            if (reason !== 4 /* ShutdownReason.LOAD */ && reason !== 1 /* ShutdownReason.CLOSE */) {
                return false; // only interested when window is closing or loading
            }
            const workspaceIdentifier = this.E();
            if (!workspaceIdentifier || !(0, workspace_1.$2h)(workspaceIdentifier.configPath, this.j)) {
                return false; // only care about untitled workspaces to ask for saving
            }
            const windowCount = await this.F.getWindowCount();
            if (reason === 1 /* ShutdownReason.CLOSE */ && !platform_1.$j && windowCount === 1) {
                return false; // Windows/Linux: quits when last window is closed, so do not ask then
            }
            const { result } = await this.l.prompt({
                type: notification_1.Severity.Warning,
                message: (0, nls_1.localize)(0, null),
                detail: (0, nls_1.localize)(1, null),
                buttons: [
                    {
                        label: (0, nls_1.localize)(2, null),
                        run: async () => {
                            const newWorkspacePath = await this.pickNewWorkspacePath();
                            if (!newWorkspacePath || !(0, workspace_1.$7h)(newWorkspacePath)) {
                                return true; // keep veto if no target was provided
                            }
                            try {
                                await this.v(workspaceIdentifier, newWorkspacePath);
                                // Make sure to add the new workspace to the history to find it again
                                const newWorkspaceIdentifier = await this.i.getWorkspaceIdentifier(newWorkspacePath);
                                await this.i.addRecentlyOpened([{
                                        label: this.K.getWorkspaceLabel(newWorkspaceIdentifier, { verbose: 2 /* Verbosity.LONG */ }),
                                        workspace: newWorkspaceIdentifier,
                                        remoteAuthority: this.j.remoteAuthority // remember whether this was a remote window
                                    }]);
                                // Delete the untitled one
                                await this.i.deleteUntitledWorkspace(workspaceIdentifier);
                            }
                            catch (error) {
                                // ignore
                            }
                            return false;
                        }
                    },
                    {
                        label: (0, nls_1.localize)(3, null),
                        run: async () => {
                            await this.i.deleteUntitledWorkspace(workspaceIdentifier);
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
            const windows = await this.F.getWindows();
            // Prevent overwriting a workspace that is currently opened in another window
            if (windows.some(window => (0, workspace_1.$Qh)(window.workspace) && this.n.extUri.isEqual(window.workspace.configPath, workspaceUri))) {
                await this.l.info((0, nls_1.localize)(4, null, (0, resources_1.$fg)(workspaceUri)), (0, nls_1.localize)(5, null));
                return false;
            }
            return true; // OK
        }
        async enterWorkspace(workspaceUri) {
            const stopped = await this.H.stopExtensionHosts((0, nls_1.localize)(6, null));
            if (!stopped) {
                return;
            }
            const result = await this.A(workspaceUri);
            if (result) {
                // Migrate storage to new workspace
                await this.G.switch(result.workspace, true /* preserve data */);
                // Reinitialize backup service
                if (this.I instanceof workingCopyBackupService_1.$h4b) {
                    const newBackupWorkspaceHome = result.backupPath ? uri_1.URI.file(result.backupPath).with({ scheme: this.j.userRoamingDataHome.scheme }) : undefined;
                    this.I.reinitialize(newBackupWorkspaceHome);
                }
            }
            // TODO@aeschli: workaround until restarting works
            if (this.j.remoteAuthority) {
                this.m.reload();
            }
            // Restart the extension host: entering a workspace means a new location for
            // storage and potentially a change in the workspace.rootPath property.
            else {
                this.H.startExtensionHosts();
            }
        }
    };
    exports.$J_b = $J_b;
    exports.$J_b = $J_b = __decorate([
        __param(0, jsonEditing_1.$$fb),
        __param(1, workspace_1.$Kh),
        __param(2, native_1.$05b),
        __param(3, configuration_1.$mE),
        __param(4, storage_1.$Vo),
        __param(5, extensions_1.$MF),
        __param(6, workingCopyBackup_1.$EA),
        __param(7, notification_1.$Yu),
        __param(8, commands_1.$Fr),
        __param(9, files_1.$6j),
        __param(10, textfiles_1.$JD),
        __param(11, workspaces_1.$fU),
        __param(12, environmentService_1.$1$b),
        __param(13, dialogs_1.$qA),
        __param(14, dialogs_1.$oA),
        __param(15, lifecycle_1.$7y),
        __param(16, label_1.$Vz),
        __param(17, host_1.$VT),
        __param(18, uriIdentity_1.$Ck),
        __param(19, workspaceTrust_1.$$z),
        __param(20, userDataProfile_1.$Ek),
        __param(21, userDataProfile_2.$CJ)
    ], $J_b);
    (0, extensions_2.$mr)(workspaceEditing_1.$pU, $J_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workspaceEditingService.js.map