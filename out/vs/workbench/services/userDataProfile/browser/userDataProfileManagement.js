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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/host/browser/host", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, cancellation_1, errors_1, lifecycle_1, nls_1, dialogs_1, extensions_1, log_1, productService_1, request_1, telemetry_1, userDataProfile_1, workspace_1, environmentService_1, extensions_2, host_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfileManagementService = void 0;
    let UserDataProfileManagementService = class UserDataProfileManagementService extends lifecycle_1.Disposable {
        constructor(userDataProfilesService, userDataProfileService, hostService, dialogService, workspaceContextService, extensionService, environmentService, telemetryService, productService, requestService, logService) {
            super();
            this.userDataProfilesService = userDataProfilesService;
            this.userDataProfileService = userDataProfileService;
            this.hostService = hostService;
            this.dialogService = dialogService;
            this.workspaceContextService = workspaceContextService;
            this.extensionService = extensionService;
            this.environmentService = environmentService;
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.requestService = requestService;
            this.logService = logService;
            this._register(userDataProfilesService.onDidChangeProfiles(e => this.onDidChangeProfiles(e)));
            this._register(userDataProfilesService.onDidResetWorkspaces(() => this.onDidResetWorkspaces()));
            this._register(userDataProfileService.onDidChangeCurrentProfile(e => this.onDidChangeCurrentProfile(e)));
            this._register(userDataProfilesService.onDidChangeProfiles(e => {
                const updatedCurrentProfile = e.updated.find(p => this.userDataProfileService.currentProfile.id === p.id);
                if (updatedCurrentProfile) {
                    this.changeCurrentProfile(updatedCurrentProfile, (0, nls_1.localize)('reload message when updated', "The current profile has been updated. Please reload to switch back to the updated profile"));
                }
            }));
        }
        onDidChangeProfiles(e) {
            if (e.removed.some(profile => profile.id === this.userDataProfileService.currentProfile.id)) {
                this.changeCurrentProfile(this.userDataProfilesService.defaultProfile, (0, nls_1.localize)('reload message when removed', "The current profile has been removed. Please reload to switch back to default profile"));
                return;
            }
        }
        onDidResetWorkspaces() {
            if (!this.userDataProfileService.currentProfile.isDefault) {
                this.changeCurrentProfile(this.userDataProfilesService.defaultProfile, (0, nls_1.localize)('reload message when removed', "The current profile has been removed. Please reload to switch back to default profile"));
                return;
            }
        }
        async onDidChangeCurrentProfile(e) {
            if (e.previous.isTransient) {
                await this.userDataProfilesService.cleanUpTransientProfiles();
            }
        }
        async createAndEnterProfile(name, options) {
            const profile = await this.userDataProfilesService.createNamedProfile(name, options, (0, workspace_1.toWorkspaceIdentifier)(this.workspaceContextService.getWorkspace()));
            await this.changeCurrentProfile(profile);
            this.telemetryService.publicLog2('profileManagementActionExecuted', { id: 'createAndEnterProfile' });
            return profile;
        }
        async createAndEnterTransientProfile() {
            const profile = await this.userDataProfilesService.createTransientProfile((0, workspace_1.toWorkspaceIdentifier)(this.workspaceContextService.getWorkspace()));
            await this.changeCurrentProfile(profile);
            this.telemetryService.publicLog2('profileManagementActionExecuted', { id: 'createAndEnterTransientProfile' });
            return profile;
        }
        async updateProfile(profile, updateOptions) {
            if (!this.userDataProfilesService.profiles.some(p => p.id === profile.id)) {
                throw new Error(`Profile ${profile.name} does not exist`);
            }
            if (profile.isDefault) {
                throw new Error((0, nls_1.localize)('cannotRenameDefaultProfile', "Cannot rename the default profile"));
            }
            await this.userDataProfilesService.updateProfile(profile, updateOptions);
            this.telemetryService.publicLog2('profileManagementActionExecuted', { id: 'updateProfile' });
        }
        async removeProfile(profile) {
            if (!this.userDataProfilesService.profiles.some(p => p.id === profile.id)) {
                throw new Error(`Profile ${profile.name} does not exist`);
            }
            if (profile.isDefault) {
                throw new Error((0, nls_1.localize)('cannotDeleteDefaultProfile', "Cannot delete the default profile"));
            }
            await this.userDataProfilesService.removeProfile(profile);
            this.telemetryService.publicLog2('profileManagementActionExecuted', { id: 'removeProfile' });
        }
        async switchProfile(profile) {
            const workspaceIdentifier = (0, workspace_1.toWorkspaceIdentifier)(this.workspaceContextService.getWorkspace());
            if (!this.userDataProfilesService.profiles.some(p => p.id === profile.id)) {
                throw new Error(`Profile ${profile.name} does not exist`);
            }
            if (this.userDataProfileService.currentProfile.id === profile.id) {
                return;
            }
            await this.userDataProfilesService.setProfileForWorkspace(workspaceIdentifier, profile);
            await this.changeCurrentProfile(profile);
            this.telemetryService.publicLog2('profileManagementActionExecuted', { id: 'switchProfile' });
        }
        async getBuiltinProfileTemplates() {
            if (this.productService.profileTemplatesUrl) {
                try {
                    const context = await this.requestService.request({ type: 'GET', url: this.productService.profileTemplatesUrl }, cancellation_1.CancellationToken.None);
                    if (context.res.statusCode === 200) {
                        return (await (0, request_1.asJson)(context)) || [];
                    }
                    else {
                        this.logService.error('Could not get profile templates.', context.res.statusCode);
                    }
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            return [];
        }
        async changeCurrentProfile(profile, reloadMessage) {
            const isRemoteWindow = !!this.environmentService.remoteAuthority;
            if (!isRemoteWindow) {
                if (!(await this.extensionService.stopExtensionHosts((0, nls_1.localize)('switch profile', "Switching to a profile.")))) {
                    // If extension host did not stop, do not switch profile
                    if (this.userDataProfilesService.profiles.some(p => p.id === this.userDataProfileService.currentProfile.id)) {
                        await this.userDataProfilesService.setProfileForWorkspace((0, workspace_1.toWorkspaceIdentifier)(this.workspaceContextService.getWorkspace()), this.userDataProfileService.currentProfile);
                    }
                    throw new errors_1.CancellationError();
                }
            }
            // In a remote window update current profile before reloading so that data is preserved from current profile if asked to preserve
            await this.userDataProfileService.updateCurrentProfile(profile);
            if (isRemoteWindow) {
                const { confirmed } = await this.dialogService.confirm({
                    message: reloadMessage ?? (0, nls_1.localize)('reload message', "Switching a profile requires reloading VS Code."),
                    primaryButton: (0, nls_1.localize)('reload button', "&&Reload"),
                });
                if (confirmed) {
                    await this.hostService.reload();
                }
            }
            else {
                await this.extensionService.startExtensionHosts();
            }
        }
    };
    exports.UserDataProfileManagementService = UserDataProfileManagementService;
    exports.UserDataProfileManagementService = UserDataProfileManagementService = __decorate([
        __param(0, userDataProfile_1.IUserDataProfilesService),
        __param(1, userDataProfile_2.IUserDataProfileService),
        __param(2, host_1.IHostService),
        __param(3, dialogs_1.IDialogService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, extensions_2.IExtensionService),
        __param(6, environmentService_1.IWorkbenchEnvironmentService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, productService_1.IProductService),
        __param(9, request_1.IRequestService),
        __param(10, log_1.ILogService)
    ], UserDataProfileManagementService);
    (0, extensions_1.registerSingleton)(userDataProfile_2.IUserDataProfileManagementService, UserDataProfileManagementService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlTWFuYWdlbWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVByb2ZpbGUvYnJvd3Nlci91c2VyRGF0YVByb2ZpbGVNYW5hZ2VtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZCekYsSUFBTSxnQ0FBZ0MsR0FBdEMsTUFBTSxnQ0FBaUMsU0FBUSxzQkFBVTtRQUcvRCxZQUM0Qyx1QkFBaUQsRUFDbEQsc0JBQStDLEVBQzFELFdBQXlCLEVBQ3ZCLGFBQTZCLEVBQ25CLHVCQUFpRCxFQUN4RCxnQkFBbUMsRUFDeEIsa0JBQWdELEVBQzNELGdCQUFtQyxFQUNyQyxjQUErQixFQUMvQixjQUErQixFQUNuQyxVQUF1QjtZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQVptQyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ2xELDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDMUQsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDdkIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ25CLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDeEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN4Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBQzNELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDckMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQy9CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNuQyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBR3JELElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlG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