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
define(["require", "exports", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/userDataProfile/common/remoteUserDataProfiles", "vs/workbench/services/extensionManagement/common/extensionManagementChannelClient", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, uriIdentity_1, remoteUserDataProfiles_1, extensionManagementChannelClient_1, userDataProfile_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteExtensionManagementService = void 0;
    let RemoteExtensionManagementService = class RemoteExtensionManagementService extends extensionManagementChannelClient_1.ProfileAwareExtensionManagementChannelClient {
        constructor(channel, userDataProfileService, userDataProfilesService, remoteUserDataProfilesService, uriIdentityService) {
            super(channel, userDataProfileService, uriIdentityService);
            this.userDataProfilesService = userDataProfilesService;
            this.remoteUserDataProfilesService = remoteUserDataProfilesService;
        }
        async filterEvent(e) {
            if (e.applicationScoped) {
                return true;
            }
            if (!e.profileLocation && this.userDataProfileService.currentProfile.isDefault) {
                return true;
            }
            const currentRemoteProfile = await this.remoteUserDataProfilesService.getRemoteProfile(this.userDataProfileService.currentProfile);
            if (this.uriIdentityService.extUri.isEqual(currentRemoteProfile.extensionsResource, e.profileLocation)) {
                return true;
            }
            return false;
        }
        async getProfileLocation(profileLocation) {
            if (!profileLocation && this.userDataProfileService.currentProfile.isDefault) {
                return undefined;
            }
            profileLocation = await super.getProfileLocation(profileLocation);
            let profile = this.userDataProfilesService.profiles.find(p => this.uriIdentityService.extUri.isEqual(p.extensionsResource, profileLocation));
            if (profile) {
                profile = await this.remoteUserDataProfilesService.getRemoteProfile(profile);
            }
            else {
                profile = (await this.remoteUserDataProfilesService.getRemoteProfiles()).find(p => this.uriIdentityService.extUri.isEqual(p.extensionsResource, profileLocation));
            }
            return profile?.extensionsResource;
        }
        async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
            const remoteProfiles = await this.remoteUserDataProfilesService.getRemoteProfiles();
            const previousProfile = remoteProfiles.find(p => this.uriIdentityService.extUri.isEqual(p.extensionsResource, previousProfileLocation));
            const currentProfile = remoteProfiles.find(p => this.uriIdentityService.extUri.isEqual(p.extensionsResource, currentProfileLocation));
            if (previousProfile?.id === currentProfile?.id) {
                return { added: [], removed: [] };
            }
            return super.switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions);
        }
    };
    exports.RemoteExtensionManagementService = RemoteExtensionManagementService;
    exports.RemoteExtensionManagementService = RemoteExtensionManagementService = __decorate([
        __param(1, userDataProfile_1.IUserDataProfileService),
        __param(2, userDataProfile_2.IUserDataProfilesService),
        __param(3, remoteUserDataProfiles_1.IRemoteUserDataProfilesService),
        __param(4, uriIdentity_1.IUriIdentityService)
    ], RemoteExtensionManagementService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vcmVtb3RlRXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWlDLFNBQVEsK0VBQTRDO1FBRWpHLFlBQ0MsT0FBaUIsRUFDUSxzQkFBK0MsRUFDN0IsdUJBQWlELEVBQzNDLDZCQUE2RCxFQUN6RixrQkFBdUM7WUFFNUQsS0FBSyxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBSmhCLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDM0Msa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFnQztRQUkvRyxDQUFDO1FBRVMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUF1QjtZQUNsRCxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDeEIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELElBQUksQ0FBQyxDQUFDLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUMvRSxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbkksSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLEVBQUU7Z0JBQ3ZH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