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
    exports.$uAb = void 0;
    const associatedRemoteProfilesKey = 'associatedRemoteProfiles';
    exports.$uAb = (0, instantiation_1.$Bh)('IRemoteUserDataProfilesService');
    let RemoteUserDataProfilesService = class RemoteUserDataProfilesService extends lifecycle_1.$kc {
        constructor(c, f, g, h, j, m) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = this.n();
        }
        async n() {
            const connection = this.f.getConnection();
            if (!connection) {
                return;
            }
            const environment = await this.f.getEnvironment();
            if (!environment) {
                return;
            }
            this.b = new userDataProfileIpc_1.$tN(environment.profiles.all, environment.profiles.home, connection.getChannel('userDataProfiles'));
            this.B(this.g.onDidChangeProfiles(e => this.r(e)));
            // Associate current local profile with remote profile
            const remoteProfile = await this.s(this.h.currentProfile, this.b);
            if (!remoteProfile.isDefault) {
                this.u([...this.t(), remoteProfile.id]);
            }
            this.y();
        }
        async r(e) {
            for (const profile of e.removed) {
                const remoteProfile = this.b?.profiles.find(p => p.id === profile.id);
                if (remoteProfile) {
                    await this.b?.removeProfile(remoteProfile);
                }
            }
        }
        async getRemoteProfiles() {
            await this.a;
            if (!this.b) {
                throw new Error('Remote profiles service not available in the current window');
            }
            return this.b.profiles;
        }
        async getRemoteProfile(localProfile) {
            await this.a;
            if (!this.b) {
                throw new Error('Remote profiles service not available in the current window');
            }
            return this.s(localProfile, this.b);
        }
        async s(localProfile, remoteUserDataProfilesService) {
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
                this.u([...this.t(), this.h.currentProfile.id]);
            }
            return profile;
        }
        t() {
            if (this.c.remoteAuthority) {
                const remotes = this.w();
                return remotes[this.c.remoteAuthority] ?? [];
            }
            return [];
        }
        u(profiles) {
            if (this.c.remoteAuthority) {
                const remotes = this.w();
                profiles = (0, arrays_1.$Kb)(profiles);
                if (profiles.length) {
                    remotes[this.c.remoteAuthority] = profiles;
                }
                else {
                    delete remotes[this.c.remoteAuthority];
                }
                if (Object.keys(remotes).length) {
                    this.j.store(associatedRemoteProfilesKey, JSON.stringify(remotes), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
                else {
                    this.j.remove(associatedRemoteProfilesKey, -1 /* StorageScope.APPLICATION */);
                }
            }
        }
        w() {
            if (this.c.remoteAuthority) {
                const value = this.j.get(associatedRemoteProfilesKey, -1 /* StorageScope.APPLICATION */);
                try {
                    return value ? JSON.parse(value) : {};
                }
                catch (error) {
                    this.m.error(error);
                }
            }
            return {};
        }
        async y() {
            const associatedRemoteProfiles = [];
            for (const profileId of this.t()) {
                const remoteProfile = this.b?.profiles.find(p => p.id === profileId);
                if (!remoteProfile) {
                    continue;
                }
                const localProfile = this.g.profiles.find(p => p.id === profileId);
                if (localProfile) {
                    if (localProfile.name !== remoteProfile.name || localProfile.shortName !== remoteProfile.shortName) {
                        await this.b?.updateProfile(remoteProfile, { name: localProfile.name, shortName: localProfile.shortName });
                    }
                    associatedRemoteProfiles.push(profileId);
                    continue;
                }
                if (remoteProfile) {
                    // Cleanup remote profiles those are not available locally
                    await this.b?.removeProfile(remoteProfile);
                }
            }
            this.u(associatedRemoteProfiles);
        }
    };
    RemoteUserDataProfilesService = __decorate([
        __param(0, environmentService_1.$hJ),
        __param(1, remoteAgentService_1.$jm),
        __param(2, userDataProfile_1.$Ek),
        __param(3, userDataProfile_2.$CJ),
        __param(4, storage_1.$Vo),
        __param(5, log_1.$5i)
    ], RemoteUserDataProfilesService);
    (0, extensions_1.$mr)(exports.$uAb, RemoteUserDataProfilesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=remoteUserDataProfiles.js.map