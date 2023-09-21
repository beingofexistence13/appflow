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
define(["require", "exports", "vs/base/common/hash", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/nls!vs/platform/userDataProfile/common/userDataProfile", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/base/common/map", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/async", "vs/base/common/uuid", "vs/base/common/strings", "vs/base/common/types"], function (require, exports, hash_1, event_1, lifecycle_1, resources_1, uri_1, nls_1, environment_1, files_1, instantiation_1, log_1, workspace_1, map_1, uriIdentity_1, async_1, uuid_1, strings_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ik = exports.$Hk = exports.$Gk = exports.$Fk = exports.$Ek = exports.$Dk = exports.ProfileResourceType = void 0;
    var ProfileResourceType;
    (function (ProfileResourceType) {
        ProfileResourceType["Settings"] = "settings";
        ProfileResourceType["Keybindings"] = "keybindings";
        ProfileResourceType["Snippets"] = "snippets";
        ProfileResourceType["Tasks"] = "tasks";
        ProfileResourceType["Extensions"] = "extensions";
        ProfileResourceType["GlobalState"] = "globalState";
    })(ProfileResourceType || (exports.ProfileResourceType = ProfileResourceType = {}));
    function $Dk(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && typeof candidate.id === 'string'
            && typeof candidate.isDefault === 'boolean'
            && typeof candidate.name === 'string'
            && uri_1.URI.isUri(candidate.location)
            && uri_1.URI.isUri(candidate.globalStorageHome)
            && uri_1.URI.isUri(candidate.settingsResource)
            && uri_1.URI.isUri(candidate.keybindingsResource)
            && uri_1.URI.isUri(candidate.tasksResource)
            && uri_1.URI.isUri(candidate.snippetsHome)
            && uri_1.URI.isUri(candidate.extensionsResource));
    }
    exports.$Dk = $Dk;
    exports.$Ek = (0, instantiation_1.$Bh)('IUserDataProfilesService');
    function $Fk(profile, scheme) {
        return {
            id: profile.id,
            isDefault: profile.isDefault,
            name: profile.name,
            shortName: profile.shortName,
            location: uri_1.URI.revive(profile.location).with({ scheme }),
            globalStorageHome: uri_1.URI.revive(profile.globalStorageHome).with({ scheme }),
            settingsResource: uri_1.URI.revive(profile.settingsResource).with({ scheme }),
            keybindingsResource: uri_1.URI.revive(profile.keybindingsResource).with({ scheme }),
            tasksResource: uri_1.URI.revive(profile.tasksResource).with({ scheme }),
            snippetsHome: uri_1.URI.revive(profile.snippetsHome).with({ scheme }),
            extensionsResource: uri_1.URI.revive(profile.extensionsResource).with({ scheme }),
            cacheHome: uri_1.URI.revive(profile.cacheHome).with({ scheme }),
            useDefaultFlags: profile.useDefaultFlags,
            isTransient: profile.isTransient,
        };
    }
    exports.$Fk = $Fk;
    function $Gk(id, name, location, profilesCacheHome, options, defaultProfile) {
        return {
            id,
            name,
            location,
            isDefault: false,
            shortName: options?.shortName,
            globalStorageHome: defaultProfile && options?.useDefaultFlags?.globalState ? defaultProfile.globalStorageHome : (0, resources_1.$ig)(location, 'globalStorage'),
            settingsResource: defaultProfile && options?.useDefaultFlags?.settings ? defaultProfile.settingsResource : (0, resources_1.$ig)(location, 'settings.json'),
            keybindingsResource: defaultProfile && options?.useDefaultFlags?.keybindings ? defaultProfile.keybindingsResource : (0, resources_1.$ig)(location, 'keybindings.json'),
            tasksResource: defaultProfile && options?.useDefaultFlags?.tasks ? defaultProfile.tasksResource : (0, resources_1.$ig)(location, 'tasks.json'),
            snippetsHome: defaultProfile && options?.useDefaultFlags?.snippets ? defaultProfile.snippetsHome : (0, resources_1.$ig)(location, 'snippets'),
            extensionsResource: defaultProfile && options?.useDefaultFlags?.extensions ? defaultProfile.extensionsResource : (0, resources_1.$ig)(location, 'extensions.json'),
            cacheHome: (0, resources_1.$ig)(profilesCacheHome, id),
            useDefaultFlags: options?.useDefaultFlags,
            isTransient: options?.transient
        };
    }
    exports.$Gk = $Gk;
    let $Hk = class $Hk extends lifecycle_1.$kc {
        static { this.b = 'userDataProfiles'; }
        static { this.c = 'profileAssociations'; }
        get defaultProfile() { return this.profiles[0]; }
        get profiles() { return [...this.C.profiles, ...this.s.profiles]; }
        constructor(t, u, w, y) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.f = true;
            this.h = this.B(new event_1.$fd());
            this.onDidChangeProfiles = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onWillCreateProfile = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onWillRemoveProfile = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onDidResetWorkspaces = this.n.event;
            this.r = new Map();
            this.s = {
                profiles: [],
                workspaces: new map_1.$zi(),
                emptyWindows: new Map()
            };
            this.profilesHome = (0, resources_1.$ig)(this.t.userRoamingDataHome, 'profiles');
            this.g = (0, resources_1.$ig)(this.t.cacheHome, 'CachedProfilesData');
        }
        init() {
            this.z = undefined;
        }
        setEnablement(enabled) {
            if (this.f !== enabled) {
                this.z = undefined;
                this.f = enabled;
            }
        }
        isEnabled() {
            return this.f;
        }
        get C() {
            if (!this.z) {
                const defaultProfile = this.D();
                const profiles = [defaultProfile];
                if (this.f) {
                    try {
                        for (const storedProfile of this.O()) {
                            if (!storedProfile.name || !(0, types_1.$jf)(storedProfile.name) || !storedProfile.location) {
                                this.y.warn('Skipping the invalid stored profile', storedProfile.location || storedProfile.name);
                                continue;
                            }
                            profiles.push($Gk((0, resources_1.$fg)(storedProfile.location), storedProfile.name, storedProfile.location, this.g, { shortName: storedProfile.shortName, useDefaultFlags: storedProfile.useDefaultFlags }, defaultProfile));
                        }
                    }
                    catch (error) {
                        this.y.error(error);
                    }
                }
                const workspaces = new map_1.$zi();
                const emptyWindows = new Map();
                if (profiles.length) {
                    try {
                        const profileAssociaitions = this.Q();
                        if (profileAssociaitions.workspaces) {
                            for (const [workspacePath, profileId] of Object.entries(profileAssociaitions.workspaces)) {
                                const workspace = uri_1.URI.parse(workspacePath);
                                const profile = profiles.find(p => p.id === profileId);
                                if (profile) {
                                    workspaces.set(workspace, profile);
                                }
                            }
                        }
                        if (profileAssociaitions.emptyWindows) {
                            for (const [windowId, profileId] of Object.entries(profileAssociaitions.emptyWindows)) {
                                const profile = profiles.find(p => p.id === profileId);
                                if (profile) {
                                    emptyWindows.set(windowId, profile);
                                }
                            }
                        }
                    }
                    catch (error) {
                        this.y.error(error);
                    }
                }
                this.z = { profiles, workspaces, emptyWindows };
            }
            return this.z;
        }
        D() {
            const defaultProfile = $Gk('__default__profile__', (0, nls_1.localize)(0, null), this.t.userRoamingDataHome, this.g);
            return { ...defaultProfile, extensionsResource: this.S() ?? defaultProfile.extensionsResource, isDefault: true };
        }
        async createTransientProfile(workspaceIdentifier) {
            const namePrefix = `Temp`;
            const nameRegEx = new RegExp(`${(0, strings_1.$qe)(namePrefix)}\\s(\\d+)`);
            let nameIndex = 0;
            for (const profile of this.profiles) {
                const matches = nameRegEx.exec(profile.name);
                const index = matches ? parseInt(matches[1]) : 0;
                nameIndex = index > nameIndex ? index : nameIndex;
            }
            const name = `${namePrefix} ${nameIndex + 1}`;
            return this.createProfile((0, hash_1.$pi)((0, uuid_1.$4f)()).toString(16), name, { transient: true }, workspaceIdentifier);
        }
        async createNamedProfile(name, options, workspaceIdentifier) {
            return this.createProfile((0, hash_1.$pi)((0, uuid_1.$4f)()).toString(16), name, options, workspaceIdentifier);
        }
        async createProfile(id, name, options, workspaceIdentifier) {
            if (!this.f) {
                throw new Error(`Profiles are disabled in the current environment.`);
            }
            const profile = await this.F(id, name, options);
            if (workspaceIdentifier) {
                await this.setProfileForWorkspace(workspaceIdentifier, profile);
            }
            return profile;
        }
        async F(id, name, options) {
            if (!(0, types_1.$jf)(name) || !name) {
                throw new Error('Name of the profile is mandatory and must be of type `string`');
            }
            let profileCreationPromise = this.r.get(name);
            if (!profileCreationPromise) {
                profileCreationPromise = (async () => {
                    try {
                        const existing = this.profiles.find(p => p.name === name || p.id === id);
                        if (existing) {
                            return existing;
                        }
                        const profile = $Gk(id, name, (0, resources_1.$ig)(this.profilesHome, id), this.g, options, this.defaultProfile);
                        await this.u.createFolder(profile.location);
                        const joiners = [];
                        this.j.fire({
                            profile,
                            join(promise) {
                                joiners.push(promise);
                            }
                        });
                        await async_1.Promises.settled(joiners);
                        this.I([profile], [], []);
                        return profile;
                    }
                    finally {
                        this.r.delete(name);
                    }
                })();
                this.r.set(name, profileCreationPromise);
            }
            return profileCreationPromise;
        }
        async updateProfile(profileToUpdate, options) {
            if (!this.f) {
                throw new Error(`Profiles are disabled in the current environment.`);
            }
            let profile = this.profiles.find(p => p.id === profileToUpdate.id);
            if (!profile) {
                throw new Error(`Profile '${profileToUpdate.name}' does not exist`);
            }
            profile = $Gk(profile.id, options.name ?? profile.name, profile.location, this.g, { shortName: options.shortName ?? profile.shortName, transient: options.transient ?? profile.isTransient, useDefaultFlags: options.useDefaultFlags ?? profile.useDefaultFlags }, this.defaultProfile);
            this.I([], [], [profile]);
            return profile;
        }
        async removeProfile(profileToRemove) {
            if (!this.f) {
                throw new Error(`Profiles are disabled in the current environment.`);
            }
            if (profileToRemove.isDefault) {
                throw new Error('Cannot remove default profile');
            }
            const profile = this.profiles.find(p => p.id === profileToRemove.id);
            if (!profile) {
                throw new Error(`Profile '${profileToRemove.name}' does not exist`);
            }
            const joiners = [];
            this.m.fire({
                profile,
                join(promise) {
                    joiners.push(promise);
                }
            });
            try {
                await Promise.allSettled(joiners);
            }
            catch (error) {
                this.y.error(error);
            }
            for (const windowId of [...this.C.emptyWindows.keys()]) {
                if (profile.id === this.C.emptyWindows.get(windowId)?.id) {
                    this.C.emptyWindows.delete(windowId);
                }
            }
            for (const workspace of [...this.C.workspaces.keys()]) {
                if (profile.id === this.C.workspaces.get(workspace)?.id) {
                    this.C.workspaces.delete(workspace);
                }
            }
            this.M();
            this.I([], [profile], []);
            try {
                await this.u.del(profile.cacheHome, { recursive: true });
            }
            catch (error) {
                if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.y.error(error);
                }
            }
        }
        async setProfileForWorkspace(workspaceIdentifier, profileToSet) {
            if (!this.f) {
                throw new Error(`Profiles are disabled in the current environment.`);
            }
            const profile = this.profiles.find(p => p.id === profileToSet.id);
            if (!profile) {
                throw new Error(`Profile '${profileToSet.name}' does not exist`);
            }
            this.L(workspaceIdentifier, profile);
        }
        unsetWorkspace(workspaceIdentifier, transient) {
            if (!this.f) {
                throw new Error(`Profiles are disabled in the current environment.`);
            }
            this.L(workspaceIdentifier, undefined, transient);
        }
        async resetWorkspaces() {
            this.s.workspaces.clear();
            this.s.emptyWindows.clear();
            this.C.workspaces.clear();
            this.C.emptyWindows.clear();
            this.M();
            this.n.fire();
        }
        async cleanUp() {
            if (!this.f) {
                return;
            }
            if (await this.u.exists(this.profilesHome)) {
                const stat = await this.u.resolve(this.profilesHome);
                await Promise.all((stat.children || [])
                    .filter(child => child.isDirectory && this.profiles.every(p => !this.w.extUri.isEqual(p.location, child.resource)))
                    .map(child => this.u.del(child.resource, { recursive: true })));
            }
        }
        async cleanUpTransientProfiles() {
            if (!this.f) {
                return;
            }
            const unAssociatedTransientProfiles = this.s.profiles.filter(p => !this.H(p));
            await Promise.allSettled(unAssociatedTransientProfiles.map(p => this.removeProfile(p)));
        }
        getProfileForWorkspace(workspaceIdentifier) {
            const workspace = this.G(workspaceIdentifier);
            return uri_1.URI.isUri(workspace) ? this.s.workspaces.get(workspace) ?? this.C.workspaces.get(workspace) : this.s.emptyWindows.get(workspace) ?? this.C.emptyWindows.get(workspace);
        }
        G(workspaceIdentifier) {
            if ((0, workspace_1.$Lh)(workspaceIdentifier)) {
                return workspaceIdentifier.uri;
            }
            if ((0, workspace_1.$Qh)(workspaceIdentifier)) {
                return workspaceIdentifier.configPath;
            }
            return workspaceIdentifier.id;
        }
        H(profile) {
            if ([...this.s.emptyWindows.values()].some(windowProfile => this.w.extUri.isEqual(windowProfile.location, profile.location))) {
                return true;
            }
            if ([...this.s.workspaces.values()].some(workspaceProfile => this.w.extUri.isEqual(workspaceProfile.location, profile.location))) {
                return true;
            }
            if ([...this.C.emptyWindows.values()].some(windowProfile => this.w.extUri.isEqual(windowProfile.location, profile.location))) {
                return true;
            }
            if ([...this.C.workspaces.values()].some(workspaceProfile => this.w.extUri.isEqual(workspaceProfile.location, profile.location))) {
                return true;
            }
            return false;
        }
        I(added, removed, updated) {
            const allProfiles = [...this.profiles, ...added];
            const storedProfiles = [];
            this.s.profiles = [];
            for (let profile of allProfiles) {
                if (profile.isDefault) {
                    continue;
                }
                if (removed.some(p => profile.id === p.id)) {
                    continue;
                }
                profile = updated.find(p => profile.id === p.id) ?? profile;
                if (profile.isTransient) {
                    this.s.profiles.push(profile);
                }
                else {
                    storedProfiles.push({ location: profile.location, name: profile.name, shortName: profile.shortName, useDefaultFlags: profile.useDefaultFlags });
                }
            }
            this.P(storedProfiles);
            this.z = undefined;
            this.J(added, removed, updated);
        }
        J(added, removed, updated) {
            this.h.fire({ added, removed, updated, all: this.profiles });
        }
        L(workspaceIdentifier, newProfile, transient) {
            // Force transient if the new profile to associate is transient
            transient = newProfile?.isTransient ? true : transient;
            if (!transient) {
                // Unset the transiet workspace association if any
                this.L(workspaceIdentifier, undefined, true);
            }
            const workspace = this.G(workspaceIdentifier);
            const profilesObject = transient ? this.s : this.C;
            // Folder or Multiroot workspace
            if (uri_1.URI.isUri(workspace)) {
                profilesObject.workspaces.delete(workspace);
                if (newProfile) {
                    profilesObject.workspaces.set(workspace, newProfile);
                }
            }
            // Empty Window
            else {
                profilesObject.emptyWindows.delete(workspace);
                if (newProfile) {
                    profilesObject.emptyWindows.set(workspace, newProfile);
                }
            }
            if (!transient) {
                this.M();
            }
        }
        M() {
            const workspaces = {};
            for (const [workspace, profile] of this.C.workspaces.entries()) {
                workspaces[workspace.toString()] = profile.id;
            }
            const emptyWindows = {};
            for (const [windowId, profile] of this.C.emptyWindows.entries()) {
                emptyWindows[windowId.toString()] = profile.id;
            }
            this.R({ workspaces, emptyWindows });
            this.z = undefined;
        }
        // TODO: @sandy081 Remove migration after couple of releases
        N(storedProfileAssociations) {
            const workspaces = {};
            const defaultProfile = this.D();
            if (storedProfileAssociations.workspaces) {
                for (const [workspace, location] of Object.entries(storedProfileAssociations.workspaces)) {
                    const uri = uri_1.URI.parse(location);
                    workspaces[workspace] = this.w.extUri.isEqual(uri, defaultProfile.location) ? defaultProfile.id : this.w.extUri.basename(uri);
                }
            }
            const emptyWindows = {};
            if (storedProfileAssociations.emptyWindows) {
                for (const [workspace, location] of Object.entries(storedProfileAssociations.emptyWindows)) {
                    const uri = uri_1.URI.parse(location);
                    emptyWindows[workspace] = this.w.extUri.isEqual(uri, defaultProfile.location) ? defaultProfile.id : this.w.extUri.basename(uri);
                }
            }
            return { workspaces, emptyWindows };
        }
        O() { return []; }
        P(storedProfiles) { throw new Error('not implemented'); }
        Q() { return {}; }
        R(storedProfileAssociations) { throw new Error('not implemented'); }
        S() { return undefined; }
    };
    exports.$Hk = $Hk;
    exports.$Hk = $Hk = __decorate([
        __param(0, environment_1.$Ih),
        __param(1, files_1.$6j),
        __param(2, uriIdentity_1.$Ck),
        __param(3, log_1.$5i)
    ], $Hk);
    class $Ik extends $Hk {
        constructor() {
            super(...arguments);
            this.a = [];
            this.X = {};
        }
        O() { return this.a; }
        P(storedProfiles) { this.a = storedProfiles; }
        Q() { return this.X; }
        R(storedProfileAssociations) { this.X = storedProfileAssociations; }
    }
    exports.$Ik = $Ik;
});
//# sourceMappingURL=userDataProfile.js.map