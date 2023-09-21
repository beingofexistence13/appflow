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
define(["require", "exports", "vs/base/browser/broadcast", "vs/base/common/marshalling", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, broadcast_1, marshalling_1, environment_1, files_1, log_1, uriIdentity_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserUserDataProfilesService = void 0;
    let BrowserUserDataProfilesService = class BrowserUserDataProfilesService extends userDataProfile_1.UserDataProfilesService {
        constructor(environmentService, fileService, uriIdentityService, logService) {
            super(environmentService, fileService, uriIdentityService, logService);
            this.changesBroadcastChannel = this._register(new broadcast_1.BroadcastDataChannel(`${userDataProfile_1.UserDataProfilesService.PROFILES_KEY}.changes`));
            this._register(this.changesBroadcastChannel.onDidReceiveData(changes => {
                try {
                    this._profilesObject = undefined;
                    const added = changes.added.map(p => (0, userDataProfile_1.reviveProfile)(p, this.profilesHome.scheme));
                    const removed = changes.removed.map(p => (0, userDataProfile_1.reviveProfile)(p, this.profilesHome.scheme));
                    const updated = changes.updated.map(p => (0, userDataProfile_1.reviveProfile)(p, this.profilesHome.scheme));
                    this.updateTransientProfiles(added.filter(a => a.isTransient), removed.filter(a => a.isTransient), updated.filter(a => a.isTransient));
                    this._onDidChangeProfiles.fire({
                        added,
                        removed,
                        updated,
                        all: this.profiles
                    });
                }
                catch (error) { /* ignore */ }
            }));
        }
        updateTransientProfiles(added, removed, updated) {
            if (added.length) {
                this.transientProfilesObject.profiles.push(...added);
            }
            if (removed.length || updated.length) {
                const allTransientProfiles = this.transientProfilesObject.profiles;
                this.transientProfilesObject.profiles = [];
                for (const profile of allTransientProfiles) {
                    if (removed.some(p => profile.id === p.id)) {
                        continue;
                    }
                    this.transientProfilesObject.profiles.push(updated.find(p => profile.id === p.id) ?? profile);
                }
            }
        }
        getStoredProfiles() {
            try {
                const value = window.localStorage.getItem(userDataProfile_1.UserDataProfilesService.PROFILES_KEY);
                if (value) {
                    return (0, marshalling_1.revive)(JSON.parse(value));
                }
            }
            catch (error) {
                /* ignore */
                this.logService.error(error);
            }
            return [];
        }
        triggerProfilesChanges(added, removed, updated) {
            super.triggerProfilesChanges(added, removed, updated);
            this.changesBroadcastChannel.postData({ added, removed, updated });
        }
        saveStoredProfiles(storedProfiles) {
            window.localStorage.setItem(userDataProfile_1.UserDataProfilesService.PROFILES_KEY, JSON.stringify(storedProfiles));
        }
        getStoredProfileAssociations() {
            const migrateKey = 'profileAssociationsMigration';
            try {
                const value = window.localStorage.getItem(userDataProfile_1.UserDataProfilesService.PROFILE_ASSOCIATIONS_KEY);
                if (value) {
                    let associations = JSON.parse(value);
                    if (!window.localStorage.getItem(migrateKey)) {
                        associations = this.migrateStoredProfileAssociations(associations);
                        this.saveStoredProfileAssociations(associations);
                        window.localStorage.setItem(migrateKey, 'true');
                    }
                    return associations;
                }
            }
            catch (error) {
                /* ignore */
                this.logService.error(error);
            }
            return {};
        }
        saveStoredProfileAssociations(storedProfileAssociations) {
            window.localStorage.setItem(userDataProfile_1.UserDataProfilesService.PROFILE_ASSOCIATIONS_KEY, JSON.stringify(storedProfileAssociations));
        }
    };
    exports.BrowserUserDataProfilesService = BrowserUserDataProfilesService;
    exports.BrowserUserDataProfilesService = BrowserUserDataProfilesService = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, log_1.ILogService)
    ], BrowserUserDataProfilesService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFQcm9maWxlL2Jyb3dzZXIvdXNlckRhdGFQcm9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUErQixTQUFRLHlDQUF1QjtRQUkxRSxZQUNzQixrQkFBdUMsRUFDOUMsV0FBeUIsRUFDbEIsa0JBQXVDLEVBQy9DLFVBQXVCO1lBRXBDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxnQ0FBb0IsQ0FBNEIsR0FBRyx5Q0FBdUIsQ0FBQyxZQUFZLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDdEosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3RFLElBQUk7b0JBQ0gsSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7b0JBQ2pDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSwrQkFBYSxFQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ2pGLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSwrQkFBYSxFQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ3JGLE1BQU0sT0FBTyxH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