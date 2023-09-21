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
    exports.$13b = void 0;
    let $13b = class $13b extends extensionManagementChannelClient_1.$Z3b {
        constructor(channel, userDataProfileService, G, H, uriIdentityService) {
            super(channel, userDataProfileService, uriIdentityService);
            this.G = G;
            this.H = H;
        }
        async F(e) {
            if (e.applicationScoped) {
                return true;
            }
            if (!e.profileLocation && this.u.currentProfile.isDefault) {
                return true;
            }
            const currentRemoteProfile = await this.H.getRemoteProfile(this.u.currentProfile);
            if (this.w.extUri.isEqual(currentRemoteProfile.extensionsResource, e.profileLocation)) {
                return true;
            }
            return false;
        }
        async D(profileLocation) {
            if (!profileLocation && this.u.currentProfile.isDefault) {
                return undefined;
            }
            profileLocation = await super.D(profileLocation);
            let profile = this.G.profiles.find(p => this.w.extUri.isEqual(p.extensionsResource, profileLocation));
            if (profile) {
                profile = await this.H.getRemoteProfile(profile);
            }
            else {
                profile = (await this.H.getRemoteProfiles()).find(p => this.w.extUri.isEqual(p.extensionsResource, profileLocation));
            }
            return profile?.extensionsResource;
        }
        async C(previousProfileLocation, currentProfileLocation, preserveExtensions) {
            const remoteProfiles = await this.H.getRemoteProfiles();
            const previousProfile = remoteProfiles.find(p => this.w.extUri.isEqual(p.extensionsResource, previousProfileLocation));
            const currentProfile = remoteProfiles.find(p => this.w.extUri.isEqual(p.extensionsResource, currentProfileLocation));
            if (previousProfile?.id === currentProfile?.id) {
                return { added: [], removed: [] };
            }
            return super.C(previousProfileLocation, currentProfileLocation, preserveExtensions);
        }
    };
    exports.$13b = $13b;
    exports.$13b = $13b = __decorate([
        __param(1, userDataProfile_1.$CJ),
        __param(2, userDataProfile_2.$Ek),
        __param(3, remoteUserDataProfiles_1.$uAb),
        __param(4, uriIdentity_1.$Ck)
    ], $13b);
});
//# sourceMappingURL=remoteExtensionManagementService.js.map