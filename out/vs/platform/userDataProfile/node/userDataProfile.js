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
define(["require", "exports", "vs/base/common/uri", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/state/node/state", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/base/common/types", "vs/platform/state/node/stateService"], function (require, exports, uri_1, environment_1, files_1, log_1, state_1, uriIdentity_1, userDataProfile_1, types_1, stateService_1) {
    "use strict";
    var UserDataProfilesReadonlyService_1, UserDataProfilesService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServerUserDataProfilesService = exports.UserDataProfilesService = exports.UserDataProfilesReadonlyService = void 0;
    let UserDataProfilesReadonlyService = class UserDataProfilesReadonlyService extends userDataProfile_1.UserDataProfilesService {
        static { UserDataProfilesReadonlyService_1 = this; }
        static { this.PROFILE_ASSOCIATIONS_MIGRATION_KEY = 'profileAssociationsMigration'; }
        constructor(stateReadonlyService, uriIdentityService, nativeEnvironmentService, fileService, logService) {
            super(nativeEnvironmentService, fileService, uriIdentityService, logService);
            this.stateReadonlyService = stateReadonlyService;
            this.nativeEnvironmentService = nativeEnvironmentService;
        }
        getStoredProfiles() {
            const storedProfilesState = this.stateReadonlyService.getItem(UserDataProfilesReadonlyService_1.PROFILES_KEY, []);
            return storedProfilesState.map(p => ({ ...p, location: (0, types_1.isString)(p.location) ? this.uriIdentityService.extUri.joinPath(this.profilesHome, p.location) : uri_1.URI.revive(p.location) }));
        }
        getStoredProfileAssociations() {
            const associations = this.stateReadonlyService.getItem(UserDataProfilesReadonlyService_1.PROFILE_ASSOCIATIONS_KEY, {});
            const migrated = this.stateReadonlyService.getItem(UserDataProfilesReadonlyService_1.PROFILE_ASSOCIATIONS_MIGRATION_KEY, false);
            return migrated ? associations : this.migrateStoredProfileAssociations(associations);
        }
        getDefaultProfileExtensionsLocation() {
            return this.uriIdentityService.extUri.joinPath(uri_1.URI.file(this.nativeEnvironmentService.extensionsPath).with({ scheme: this.profilesHome.scheme }), 'extensions.json');
        }
    };
    exports.UserDataProfilesReadonlyService = UserDataProfilesReadonlyService;
    exports.UserDataProfilesReadonlyService = UserDataProfilesReadonlyService = UserDataProfilesReadonlyService_1 = __decorate([
        __param(0, state_1.IStateReadService),
        __param(1, uriIdentity_1.IUriIdentityService),
        __param(2, environment_1.INativeEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, log_1.ILogService)
    ], UserDataProfilesReadonlyService);
    let UserDataProfilesService = UserDataProfilesService_1 = class UserDataProfilesService extends UserDataProfilesReadonlyService {
        constructor(stateService, uriIdentityService, environmentService, fileService, logService) {
            super(stateService, uriIdentityService, environmentService, fileService, logService);
            this.stateService = stateService;
        }
        saveStoredProfiles(storedProfiles) {
            if (storedProfiles.length) {
                this.stateService.setItem(UserDataProfilesService_1.PROFILES_KEY, storedProfiles.map(profile => ({ ...profile, location: this.uriIdentityService.extUri.basename(profile.location) })));
            }
            else {
                this.stateService.removeItem(UserDataProfilesService_1.PROFILES_KEY);
            }
        }
        getStoredProfiles() {
            const storedProfiles = super.getStoredProfiles();
            if (!this.stateService.getItem('userDataProfilesMigration', false)) {
                this.saveStoredProfiles(storedProfiles);
                this.stateService.setItem('userDataProfilesMigration', true);
            }
            return storedProfiles;
        }
        saveStoredProfileAssociations(storedProfileAssociations) {
            if (storedProfileAssociations.emptyWindows || storedProfileAssociations.workspaces) {
                this.stateService.setItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_KEY, storedProfileAssociations);
            }
            else {
                this.stateService.removeItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_KEY);
            }
        }
        getStoredProfileAssociations() {
            const oldKey = 'workspaceAndProfileInfo';
            const storedWorkspaceInfos = this.stateService.getItem(oldKey, undefined);
            if (storedWorkspaceInfos) {
                this.stateService.removeItem(oldKey);
                const workspaces = storedWorkspaceInfos.reduce((result, { workspace, profile }) => {
                    result[uri_1.URI.revive(workspace).toString()] = uri_1.URI.revive(profile).toString();
                    return result;
                }, {});
                this.stateService.setItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_KEY, { workspaces });
            }
            const associations = super.getStoredProfileAssociations();
            if (!this.stateService.getItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_MIGRATION_KEY, false)) {
                this.saveStoredProfileAssociations(associations);
                this.stateService.setItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_MIGRATION_KEY, true);
            }
            return associations;
        }
    };
    exports.UserDataProfilesService = UserDataProfilesService;
    exports.UserDataProfilesService = UserDataProfilesService = UserDataProfilesService_1 = __decorate([
        __param(0, state_1.IStateService),
        __param(1, uriIdentity_1.IUriIdentityService),
        __param(2, environment_1.INativeEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, log_1.ILogService)
    ], UserDataProfilesService);
    let ServerUserDataProfilesService = class ServerUserDataProfilesService extends UserDataProfilesService {
        constructor(uriIdentityService, environmentService, fileService, logService) {
            super(new stateService_1.StateService(0 /* SaveStrategy.IMMEDIATE */, environmentService, logService, fileService), uriIdentityService, environmentService, fileService, logService);
        }
        async init() {
            await this.stateService.init();
            return super.init();
        }
    };
    exports.ServerUserDataProfilesService = ServerUserDataProfilesService;
    exports.ServerUserDataProfilesService = ServerUserDataProfilesService = __decorate([
        __param(0, uriIdentity_1.IUriIdentityService),
        __param(1, environment_1.INativeEnvironmentService),
        __param(2, files_1.IFileService),
        __param(3, log_1.ILogService)
    ], ServerUserDataProfilesService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFQcm9maWxlL25vZGUvdXNlckRhdGFQcm9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFlekYsSUFBTSwrQkFBK0IsR0FBckMsTUFBTSwrQkFBZ0MsU0FBUSx5Q0FBMkI7O2lCQUVyRCx1Q0FBa0MsR0FBRyw4QkFBOEIsQUFBakMsQ0FBa0M7UUFFOUYsWUFDcUMsb0JBQXVDLEVBQ3RELGtCQUF1QyxFQUNoQix3QkFBbUQsRUFDakYsV0FBeUIsRUFDMUIsVUFBdUI7WUFFcEMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQztZQU56Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQW1CO1lBRS9CLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMkI7UUFLaEcsQ0FBQztRQUVrQixpQkFBaUI7WUFDbkMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUF1QyxpQ0FBK0IsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEosT0FBTyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUEsZ0JBQVEsRUFBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FB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