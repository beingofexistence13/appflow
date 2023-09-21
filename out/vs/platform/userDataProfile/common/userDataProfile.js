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
define(["require", "exports", "vs/base/common/hash", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/base/common/map", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/async", "vs/base/common/uuid", "vs/base/common/strings", "vs/base/common/types"], function (require, exports, hash_1, event_1, lifecycle_1, resources_1, uri_1, nls_1, environment_1, files_1, instantiation_1, log_1, workspace_1, map_1, uriIdentity_1, async_1, uuid_1, strings_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InMemoryUserDataProfilesService = exports.UserDataProfilesService = exports.toUserDataProfile = exports.reviveProfile = exports.IUserDataProfilesService = exports.isUserDataProfile = exports.ProfileResourceType = void 0;
    var ProfileResourceType;
    (function (ProfileResourceType) {
        ProfileResourceType["Settings"] = "settings";
        ProfileResourceType["Keybindings"] = "keybindings";
        ProfileResourceType["Snippets"] = "snippets";
        ProfileResourceType["Tasks"] = "tasks";
        ProfileResourceType["Extensions"] = "extensions";
        ProfileResourceType["GlobalState"] = "globalState";
    })(ProfileResourceType || (exports.ProfileResourceType = ProfileResourceType = {}));
    function isUserDataProfile(thing) {
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
    exports.isUserDataProfile = isUserDataProfile;
    exports.IUserDataProfilesService = (0, instantiation_1.createDecorator)('IUserDataProfilesService');
    function reviveProfile(profile, scheme) {
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
    exports.reviveProfile = reviveProfile;
    function toUserDataProfile(id, name, location, profilesCacheHome, options, defaultProfile) {
        return {
            id,
            name,
            location,
            isDefault: false,
            shortName: options?.shortName,
            globalStorageHome: defaultProfile && options?.useDefaultFlags?.globalState ? defaultProfile.globalStorageHome : (0, resources_1.joinPath)(location, 'globalStorage'),
            settingsResource: defaultProfile && options?.useDefaultFlags?.settings ? defaultProfile.settingsResource : (0, resources_1.joinPath)(location, 'settings.json'),
            keybindingsResource: defaultProfile && options?.useDefaultFlags?.keybindings ? defaultProfile.keybindingsResource : (0, resources_1.joinPath)(location, 'keybindings.json'),
            tasksResource: defaultProfile && options?.useDefaultFlags?.tasks ? defaultProfile.tasksResource : (0, resources_1.joinPath)(location, 'tasks.json'),
            snippetsHome: defaultProfile && options?.useDefaultFlags?.snippets ? defaultProfile.snippetsHome : (0, resources_1.joinPath)(location, 'snippets'),
            extensionsResource: defaultProfile && options?.useDefaultFlags?.extensions ? defaultProfile.extensionsResource : (0, resources_1.joinPath)(location, 'extensions.json'),
            cacheHome: (0, resources_1.joinPath)(profilesCacheHome, id),
            useDefaultFlags: options?.useDefaultFlags,
            isTransient: options?.transient
        };
    }
    exports.toUserDataProfile = toUserDataProfile;
    let UserDataProfilesService = class UserDataProfilesService extends lifecycle_1.Disposable {
        static { this.PROFILES_KEY = 'userDataProfiles'; }
        static { this.PROFILE_ASSOCIATIONS_KEY = 'profileAssociations'; }
        get defaultProfile() { return this.profiles[0]; }
        get profiles() { return [...this.profilesObject.profiles, ...this.transientProfilesObject.profiles]; }
        constructor(environmentService, fileService, uriIdentityService, logService) {
            super();
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.enabled = true;
            this._onDidChangeProfiles = this._register(new event_1.Emitter());
            this.onDidChangeProfiles = this._onDidChangeProfiles.event;
            this._onWillCreateProfile = this._register(new event_1.Emitter());
            this.onWillCreateProfile = this._onWillCreateProfile.event;
            this._onWillRemoveProfile = this._register(new event_1.Emitter());
            this.onWillRemoveProfile = this._onWillRemoveProfile.event;
            this._onDidResetWorkspaces = this._register(new event_1.Emitter());
            this.onDidResetWorkspaces = this._onDidResetWorkspaces.event;
            this.profileCreationPromises = new Map();
            this.transientProfilesObject = {
                profiles: [],
                workspaces: new map_1.ResourceMap(),
                emptyWindows: new Map()
            };
            this.profilesHome = (0, resources_1.joinPath)(this.environmentService.userRoamingDataHome, 'profiles');
            this.profilesCacheHome = (0, resources_1.joinPath)(this.environmentService.cacheHome, 'CachedProfilesData');
        }
        init() {
            this._profilesObject = undefined;
        }
        setEnablement(enabled) {
            if (this.enabled !== enabled) {
                this._profilesObject = undefined;
                this.enabled = enabled;
            }
        }
        isEnabled() {
            return this.enabled;
        }
        get profilesObject() {
            if (!this._profilesObject) {
                const defaultProfile = this.createDefaultProfile();
                const profiles = [defaultProfile];
                if (this.enabled) {
                    try {
                        for (const storedProfile of this.getStoredProfiles()) {
                            if (!storedProfile.name || !(0, types_1.isString)(storedProfile.name) || !storedProfile.location) {
                                this.logService.warn('Skipping the invalid stored profile', storedProfile.location || storedProfile.name);
                                continue;
                            }
                            profiles.push(toUserDataProfile((0, resources_1.basename)(storedProfile.location), storedProfile.name, storedProfile.location, this.profilesCacheHome, { shortName: storedProfile.shortName, useDefaultFlags: storedProfile.useDefaultFlags }, defaultProfile));
                        }
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                }
                const workspaces = new map_1.ResourceMap();
                const emptyWindows = new Map();
                if (profiles.length) {
                    try {
                        const profileAssociaitions = this.getStoredProfileAssociations();
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
                        this.logService.error(error);
                    }
                }
                this._profilesObject = { profiles, workspaces, emptyWindows };
            }
            return this._profilesObject;
        }
        createDefaultProfile() {
            const defaultProfile = toUserDataProfile('__default__profile__', (0, nls_1.localize)('defaultProfile', "Default"), this.environmentService.userRoamingDataHome, this.profilesCacheHome);
            return { ...defaultProfile, extensionsResource: this.getDefaultProfileExtensionsLocation() ?? defaultProfile.extensionsResource, isDefault: true };
        }
        async createTransientProfile(workspaceIdentifier) {
            const namePrefix = `Temp`;
            const nameRegEx = new RegExp(`${(0, strings_1.escapeRegExpCharacters)(namePrefix)}\\s(\\d+)`);
            let nameIndex = 0;
            for (const profile of this.profiles) {
                const matches = nameRegEx.exec(profile.name);
                const index = matches ? parseInt(matches[1]) : 0;
                nameIndex = index > nameIndex ? index : nameIndex;
            }
            const name = `${namePrefix} ${nameIndex + 1}`;
            return this.createProfile((0, hash_1.hash)((0, uuid_1.generateUuid)()).toString(16), name, { transient: true }, workspaceIdentifier);
        }
        async createNamedProfile(name, options, workspaceIdentifier) {
            return this.createProfile((0, hash_1.hash)((0, uuid_1.generateUuid)()).toString(16), name, options, workspaceIdentifier);
        }
        async createProfile(id, name, options, workspaceIdentifier) {
            if (!this.enabled) {
                throw new Error(`Profiles are disabled in the current environment.`);
            }
            const profile = await this.doCreateProfile(id, name, options);
            if (workspaceIdentifier) {
                await this.setProfileForWorkspace(workspaceIdentifier, profile);
            }
            return profile;
        }
        async doCreateProfile(id, name, options) {
            if (!(0, types_1.isString)(name) || !name) {
                throw new Error('Name of the profile is mandatory and must be of type `string`');
            }
            let profileCreationPromise = this.profileCreationPromises.get(name);
            if (!profileCreationPromise) {
                profileCreationPromise = (async () => {
                    try {
                        const existing = this.profiles.find(p => p.name === name || p.id === id);
                        if (existing) {
                            return existing;
                        }
                        const profile = toUserDataProfile(id, name, (0, resources_1.joinPath)(this.profilesHome, id), this.profilesCacheHome, options, this.defaultProfile);
                        await this.fileService.createFolder(profile.location);
                        const joiners = [];
                        this._onWillCreateProfile.fire({
                            profile,
                            join(promise) {
                                joiners.push(promise);
                            }
                        });
                        await async_1.Promises.settled(joiners);
                        this.updateProfiles([profile], [], []);
                        return profile;
                    }
                    finally {
                        this.profileCreationPromises.delete(name);
                    }
                })();
                this.profileCreationPromises.set(name, profileCreationPromise);
            }
            return profileCreationPromise;
        }
        async updateProfile(profileToUpdate, options) {
            if (!this.enabled) {
                throw new Error(`Profiles are disabled in the current environment.`);
            }
            let profile = this.profiles.find(p => p.id === profileToUpdate.id);
            if (!profile) {
                throw new Error(`Profile '${profileToUpdate.name}' does not exist`);
            }
            profile = toUserDataProfile(profile.id, options.name ?? profile.name, profile.location, this.profilesCacheHome, { shortName: options.shortName ?? profile.shortName, transient: options.transient ?? profile.isTransient, useDefaultFlags: options.useDefaultFlags ?? profile.useDefaultFlags }, this.defaultProfile);
            this.updateProfiles([], [], [profile]);
            return profile;
        }
        async removeProfile(profileToRemove) {
            if (!this.enabled) {
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
            this._onWillRemoveProfile.fire({
                profile,
                join(promise) {
                    joiners.push(promise);
                }
            });
            try {
                await Promise.allSettled(joiners);
            }
            catch (error) {
                this.logService.error(error);
            }
            for (const windowId of [...this.profilesObject.emptyWindows.keys()]) {
                if (profile.id === this.profilesObject.emptyWindows.get(windowId)?.id) {
                    this.profilesObject.emptyWindows.delete(windowId);
                }
            }
            for (const workspace of [...this.profilesObject.workspaces.keys()]) {
                if (profile.id === this.profilesObject.workspaces.get(workspace)?.id) {
                    this.profilesObject.workspaces.delete(workspace);
                }
            }
            this.updateStoredProfileAssociations();
            this.updateProfiles([], [profile], []);
            try {
                await this.fileService.del(profile.cacheHome, { recursive: true });
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
            }
        }
        async setProfileForWorkspace(workspaceIdentifier, profileToSet) {
            if (!this.enabled) {
                throw new Error(`Profiles are disabled in the current environment.`);
            }
            const profile = this.profiles.find(p => p.id === profileToSet.id);
            if (!profile) {
                throw new Error(`Profile '${profileToSet.name}' does not exist`);
            }
            this.updateWorkspaceAssociation(workspaceIdentifier, profile);
        }
        unsetWorkspace(workspaceIdentifier, transient) {
            if (!this.enabled) {
                throw new Error(`Profiles are disabled in the current environment.`);
            }
            this.updateWorkspaceAssociation(workspaceIdentifier, undefined, transient);
        }
        async resetWorkspaces() {
            this.transientProfilesObject.workspaces.clear();
            this.transientProfilesObject.emptyWindows.clear();
            this.profilesObject.workspaces.clear();
            this.profilesObject.emptyWindows.clear();
            this.updateStoredProfileAssociations();
            this._onDidResetWorkspaces.fire();
        }
        async cleanUp() {
            if (!this.enabled) {
                return;
            }
            if (await this.fileService.exists(this.profilesHome)) {
                const stat = await this.fileService.resolve(this.profilesHome);
                await Promise.all((stat.children || [])
                    .filter(child => child.isDirectory && this.profiles.every(p => !this.uriIdentityService.extUri.isEqual(p.location, child.resource)))
                    .map(child => this.fileService.del(child.resource, { recursive: true })));
            }
        }
        async cleanUpTransientProfiles() {
            if (!this.enabled) {
                return;
            }
            const unAssociatedTransientProfiles = this.transientProfilesObject.profiles.filter(p => !this.isProfileAssociatedToWorkspace(p));
            await Promise.allSettled(unAssociatedTransientProfiles.map(p => this.removeProfile(p)));
        }
        getProfileForWorkspace(workspaceIdentifier) {
            const workspace = this.getWorkspace(workspaceIdentifier);
            return uri_1.URI.isUri(workspace) ? this.transientProfilesObject.workspaces.get(workspace) ?? this.profilesObject.workspaces.get(workspace) : this.transientProfilesObject.emptyWindows.get(workspace) ?? this.profilesObject.emptyWindows.get(workspace);
        }
        getWorkspace(workspaceIdentifier) {
            if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier)) {
                return workspaceIdentifier.uri;
            }
            if ((0, workspace_1.isWorkspaceIdentifier)(workspaceIdentifier)) {
                return workspaceIdentifier.configPath;
            }
            return workspaceIdentifier.id;
        }
        isProfileAssociatedToWorkspace(profile) {
            if ([...this.transientProfilesObject.emptyWindows.values()].some(windowProfile => this.uriIdentityService.extUri.isEqual(windowProfile.location, profile.location))) {
                return true;
            }
            if ([...this.transientProfilesObject.workspaces.values()].some(workspaceProfile => this.uriIdentityService.extUri.isEqual(workspaceProfile.location, profile.location))) {
                return true;
            }
            if ([...this.profilesObject.emptyWindows.values()].some(windowProfile => this.uriIdentityService.extUri.isEqual(windowProfile.location, profile.location))) {
                return true;
            }
            if ([...this.profilesObject.workspaces.values()].some(workspaceProfile => this.uriIdentityService.extUri.isEqual(workspaceProfile.location, profile.location))) {
                return true;
            }
            return false;
        }
        updateProfiles(added, removed, updated) {
            const allProfiles = [...this.profiles, ...added];
            const storedProfiles = [];
            this.transientProfilesObject.profiles = [];
            for (let profile of allProfiles) {
                if (profile.isDefault) {
                    continue;
                }
                if (removed.some(p => profile.id === p.id)) {
                    continue;
                }
                profile = updated.find(p => profile.id === p.id) ?? profile;
                if (profile.isTransient) {
                    this.transientProfilesObject.profiles.push(profile);
                }
                else {
                    storedProfiles.push({ location: profile.location, name: profile.name, shortName: profile.shortName, useDefaultFlags: profile.useDefaultFlags });
                }
            }
            this.saveStoredProfiles(storedProfiles);
            this._profilesObject = undefined;
            this.triggerProfilesChanges(added, removed, updated);
        }
        triggerProfilesChanges(added, removed, updated) {
            this._onDidChangeProfiles.fire({ added, removed, updated, all: this.profiles });
        }
        updateWorkspaceAssociation(workspaceIdentifier, newProfile, transient) {
            // Force transient if the new profile to associate is transient
            transient = newProfile?.isTransient ? true : transient;
            if (!transient) {
                // Unset the transiet workspace association if any
                this.updateWorkspaceAssociation(workspaceIdentifier, undefined, true);
            }
            const workspace = this.getWorkspace(workspaceIdentifier);
            const profilesObject = transient ? this.transientProfilesObject : this.profilesObject;
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
                this.updateStoredProfileAssociations();
            }
        }
        updateStoredProfileAssociations() {
            const workspaces = {};
            for (const [workspace, profile] of this.profilesObject.workspaces.entries()) {
                workspaces[workspace.toString()] = profile.id;
            }
            const emptyWindows = {};
            for (const [windowId, profile] of this.profilesObject.emptyWindows.entries()) {
                emptyWindows[windowId.toString()] = profile.id;
            }
            this.saveStoredProfileAssociations({ workspaces, emptyWindows });
            this._profilesObject = undefined;
        }
        // TODO: @sandy081 Remove migration after couple of releases
        migrateStoredProfileAssociations(storedProfileAssociations) {
            const workspaces = {};
            const defaultProfile = this.createDefaultProfile();
            if (storedProfileAssociations.workspaces) {
                for (const [workspace, location] of Object.entries(storedProfileAssociations.workspaces)) {
                    const uri = uri_1.URI.parse(location);
                    workspaces[workspace] = this.uriIdentityService.extUri.isEqual(uri, defaultProfile.location) ? defaultProfile.id : this.uriIdentityService.extUri.basename(uri);
                }
            }
            const emptyWindows = {};
            if (storedProfileAssociations.emptyWindows) {
                for (const [workspace, location] of Object.entries(storedProfileAssociations.emptyWindows)) {
                    const uri = uri_1.URI.parse(location);
                    emptyWindows[workspace] = this.uriIdentityService.extUri.isEqual(uri, defaultProfile.location) ? defaultProfile.id : this.uriIdentityService.extUri.basename(uri);
                }
            }
            return { workspaces, emptyWindows };
        }
        getStoredProfiles() { return []; }
        saveStoredProfiles(storedProfiles) { throw new Error('not implemented'); }
        getStoredProfileAssociations() { return {}; }
        saveStoredProfileAssociations(storedProfileAssociations) { throw new Error('not implemented'); }
        getDefaultProfileExtensionsLocation() { return undefined; }
    };
    exports.UserDataProfilesService = UserDataProfilesService;
    exports.UserDataProfilesService = UserDataProfilesService = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, log_1.ILogService)
    ], UserDataProfilesService);
    class InMemoryUserDataProfilesService extends UserDataProfilesService {
        constructor() {
            super(...arguments);
            this.storedProfiles = [];
            this.storedProfileAssociations = {};
        }
        getStoredProfiles() { return this.storedProfiles; }
        saveStoredProfiles(storedProfiles) { this.storedProfiles = storedProfiles; }
        getStoredProfileAssociations() { return this.storedProfileAssociations; }
        saveStoredProfileAssociations(storedProfileAssociations) { this.storedProfileAssociations = storedProfileAssociations; }
    }
    exports.InMemoryUserDataProfilesService = InMemoryUserDataProfilesService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFQcm9maWxlL2NvbW1vbi91c2VyRGF0YVByb2ZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJoRyxJQUFrQixtQkFPakI7SUFQRCxXQUFrQixtQkFBbUI7UUFDcEMsNENBQXFCLENBQUE7UUFDckIsa0RBQTJCLENBQUE7UUFDM0IsNENBQXFCLENBQUE7UUFDckIsc0NBQWUsQ0FBQTtRQUNmLGdEQUF5QixDQUFBO1FBQ3pCLGtEQUEyQixDQUFBO0lBQzVCLENBQUMsRUFQaUIsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFPcEM7SUF3QkQsU0FBZ0IsaUJBQWlCLENBQUMsS0FBYztRQUMvQyxNQUFNLFNBQVMsR0FBRyxLQUFxQyxDQUFDO1FBRXhELE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVE7ZUFDaEQsT0FBTyxTQUFTLENBQUMsRUFBRSxLQUFLLFFBQVE7ZUFDaEMsT0FBTyxTQUFTLENBQUMsU0FBUyxLQUFLLFNBQVM7ZUFDeEMsT0FBTyxTQUFTLENBQUMsSUFBSSxLQUFLLFFBQVE7ZUFDbEMsU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO2VBQzdCLFNBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDO2VBQ3RDLFNBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDO2VBQ3JDLFNBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDO2VBQ3hDLFNBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztlQUNsQyxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUM7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