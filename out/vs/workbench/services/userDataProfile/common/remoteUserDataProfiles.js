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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/storage/common/storage", "vs/platform/log/common/log", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/arrays", "vs/workbench/services/environment/common/environmentService", "vs/platform/userDataProfile/common/userDataProfileIpc"], function (require, exports, lifecycle_1, extensions_1, instantiation_1, userDataProfile_1, remoteAgentService_1, storage_1, log_1, userDataProfile_2, arrays_1, environmentService_1, userDataProfileIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IRemoteUserDataProfilesService = void 0;
    const associatedRemoteProfilesKey = 'associatedRemoteProfiles';
    exports.IRemoteUserDataProfilesService = (0, instantiation_1.createDecorator)('IRemoteUserDataProfilesService');
    let RemoteUserDataProfilesService = class RemoteUserDataProfilesService extends lifecycle_1.Disposable {
        constructor(environmentService, remoteAgentService, userDataProfilesService, userDataProfileService, storageService, logService) {
            super();
            this.environmentService = environmentService;
            this.remoteAgentService = remoteAgentService;
            this.userDataProfilesService = userDataProfilesService;
            this.userDataProfileService = userDataProfileService;
            this.storageService = storageService;
            this.logService = logService;
            this.initPromise = this.init();
        }
        async init() {
            const connection = this.remoteAgentService.getConnection();
            if (!connection) {
                return;
            }
            const environment = await this.remoteAgentService.getEnvironment();
            if (!environment) {
                return;
            }
            this.remoteUserDataProfilesService = new userDataProfileIpc_1.UserDataProfilesService(environment.profiles.all, environment.profiles.home, connection.getChannel('userDataProfiles'));
            this._register(this.userDataProfilesService.onDidChangeProfiles(e => this.onDidChangeLocalProfiles(e)));
            // Associate current local profile with remote profile
            const remoteProfile = await this.getAssociatedRemoteProfile(this.userDataProfileService.currentProfile, this.remoteUserDataProfilesService);
            if (!remoteProfile.isDefault) {
                this.setAssociatedRemoteProfiles([...this.getAssociatedRemoteProfiles(), remoteProfile.id]);
            }
            this.cleanUp();
        }
        async onDidChangeLocalProfiles(e) {
            for (const profile of e.removed) {
                const remoteProfile = this.remoteUserDataProfilesService?.profiles.find(p => p.id === profile.id);
                if (remoteProfile) {
                    await this.remoteUserDataProfilesService?.removeProfile(remoteProfile);
                }
            }
        }
        async getRemoteProfiles() {
            await this.initPromise;
            if (!this.remoteUserDataProfilesService) {
                throw new Error('Remote profiles service not available in the current window');
            }
            return this.remoteUserDataProfilesService.profiles;
        }
        async getRemoteProfile(localProfile) {
            await this.initPromise;
            if (!this.remoteUserDataProfilesService) {
                throw new Error('Remote profiles service not available in the current window');
            }
            return this.getAssociatedRemoteProfile(localProfile, this.remoteUserDataProfilesService);
        }
        async getAssociatedRemoteProfile(localProfile, remoteUserDataProfilesService) {
            // If the local profile is the default profile, return the remote default profile
            if (localProfile.isDefault) {
                return remoteUserDataProfilesService.defaultProfile;
            }
            let profile = remoteUserDataProfilesService.profiles.find(p => p.id === localProfile.id);
            if (!profile) {
                profile = await remoteUserDataProfilesService.createProfile(localProfile.id, localProfile.name, {
                    shortName: localProfile.shortName,
                    transient: localProfile.isTransient,
                    useDefaultFlags: localProfile.useDefaultFlags,
                });
                this.setAssociatedRemoteProfiles([...this.getAssociatedRemoteProfiles(), this.userDataProfileService.currentProfile.id]);
            }
            return profile;
        }
        getAssociatedRemoteProfiles() {
            if (this.environmentService.remoteAuthority) {
                const remotes = this.parseAssociatedRemoteProfiles();
                return remotes[this.environmentService.remoteAuthority] ?? [];
            }
            return [];
        }
        setAssociatedRemoteProfiles(profiles) {
            if (this.environmentService.remoteAuthority) {
                const remotes = this.parseAssociatedRemoteProfiles();
                profiles = (0, arrays_1.distinct)(profiles);
                if (profiles.length) {
                    remotes[this.environmentService.remoteAuthority] = profiles;
                }
                else {
                    delete remotes[this.environmentService.remoteAuthority];
                }
                if (Object.keys(remotes).length) {
                    this.storageService.store(associatedRemoteProfilesKey, JSON.stringify(remotes), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
                else {
                    this.storageService.remove(associatedRemoteProfilesKey, -1 /* StorageScope.APPLICATION */);
                }
            }
        }
        parseAssociatedRemoteProfiles() {
            if (this.environmentService.remoteAuthority) {
                const value = this.storageService.get(associatedRemoteProfilesKey, -1 /* StorageScope.APPLICATION */);
                try {
                    return value ? JSON.parse(value) : {};
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            return {};
        }
        async cleanUp() {
            const associatedRemoteProfiles = [];
            for (const profileId of this.getAssociatedRemoteProfiles()) {
                const remoteProfile = this.remoteUserDataProfilesService?.profiles.find(p => p.id === profileId);
                if (!remoteProfile) {
                    continue;
                }
                const localProfile = this.userDataProfilesService.profiles.find(p => p.id === profileId);
                if (localProfile) {
                    if (localProfile.name !== remoteProfile.name || localProfile.shortName !== remoteProfile.shortName) {
                        await this.remoteUserDataProfilesService?.updateProfile(remoteProfile, { name: localProfile.name, shortName: localProfile.shortName });
                    }
                    associatedRemoteProfiles.push(profileId);
                    continue;
                }
                if (remoteProfile) {
                    // Cleanup remote profiles those are not available locally
                    await this.remoteUserDataProfilesService?.removeProfile(remoteProfile);
                }
            }
            this.setAssociatedRemoteProfiles(associatedRemoteProfiles);
        }
    };
    RemoteUserDataProfilesService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, remoteAgentService_1.IRemoteAgentService),
        __param(2, userDataProfile_1.IUserDataProfilesService),
        __param(3, userDataProfile_2.IUserDataProfileService),
        __param(4, storage_1.IStorageService),
        __param(5, log_1.ILogService)
    ], RemoteUserDataProfilesService);
    (0, extensions_1.registerSingleton)(exports.IRemoteUserDataProfilesService, RemoteUserDataProfilesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVXNlckRhdGFQcm9maWxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVByb2ZpbGUvY29tbW9uL3JlbW90ZVVzZXJEYXRhUHJvZmlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZWhHLE1BQU0sMkJBQTJCLEdBQUcsMEJBQTBCLENBQUM7SUFFbEQsUUFBQSw4QkFBOEIsR0FBRyxJQUFBLCtCQUFlLEVBQWlDLGdDQUFnQyxDQUFDLENBQUM7SUFPaEksSUFBTSw2QkFBNkIsR0FBbkMsTUFBTSw2QkFBOEIsU0FBUSxzQkFBVTtRQVFyRCxZQUNnRCxrQkFBZ0QsRUFDekQsa0JBQXVDLEVBQ2xDLHVCQUFpRCxFQUNsRCxzQkFBK0MsRUFDdkQsY0FBK0IsRUFDbkMsVUFBdUI7WUFFckQsS0FBSyxFQUFFLENBQUM7WUFQdUMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtZQUN6RCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ2xDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDbEQsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUN2RCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbkMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUdyRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRU8sS0FBSyxDQUFDLElBQUk7WUFDakIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hCLE9BQU87YUFDUDtZQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDO1lB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