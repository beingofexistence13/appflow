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
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/storage/common/storage", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/snippetsSync", "vs/platform/userDataSync/common/settingsSync", "vs/platform/userDataSync/common/keybindingsSync", "vs/platform/configuration/common/configuration", "vs/platform/userDataSync/common/tasksSync", "vs/platform/userDataSync/common/extensionsSync", "vs/platform/userDataSync/common/globalStateSync", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataProfilesManifestSync", "vs/base/common/jsonFormatter", "vs/base/common/strings"], function (require, exports, uri_1, nls_1, environment_1, files_1, serviceMachineId_1, storage_1, uriIdentity_1, userDataSync_1, userDataProfile_1, abstractSynchronizer_1, snippetsSync_1, settingsSync_1, keybindingsSync_1, configuration_1, tasksSync_1, extensionsSync_1, globalStateSync_1, instantiation_1, userDataProfilesManifestSync_1, jsonFormatter_1, strings_1) {
    "use strict";
    var UserDataSyncResourceProviderService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncResourceProviderService = void 0;
    let UserDataSyncResourceProviderService = class UserDataSyncResourceProviderService {
        static { UserDataSyncResourceProviderService_1 = this; }
        static { this.NOT_EXISTING_RESOURCE = 'not-existing-resource'; }
        static { this.REMOTE_BACKUP_AUTHORITY = 'remote-backup'; }
        static { this.LOCAL_BACKUP_AUTHORITY = 'local-backup'; }
        constructor(userDataSyncStoreService, userDataSyncLocalStoreService, logService, uriIdentityService, environmentService, storageService, fileService, userDataProfilesService, configurationService, instantiationService) {
            this.userDataSyncStoreService = userDataSyncStoreService;
            this.userDataSyncLocalStoreService = userDataSyncLocalStoreService;
            this.logService = logService;
            this.environmentService = environmentService;
            this.storageService = storageService;
            this.fileService = fileService;
            this.userDataProfilesService = userDataProfilesService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.extUri = uriIdentityService.extUri;
        }
        async getRemoteSyncedProfiles() {
            const userData = await this.userDataSyncStoreService.readResource("profiles" /* SyncResource.Profiles */, null, undefined);
            if (userData.content) {
                const syncData = this.parseSyncData(userData.content, "profiles" /* SyncResource.Profiles */);
                return (0, userDataProfilesManifestSync_1.parseUserDataProfilesManifest)(syncData);
            }
            return [];
        }
        async getLocalSyncedProfiles(location) {
            const refs = await this.userDataSyncLocalStoreService.getAllResourceRefs("profiles" /* SyncResource.Profiles */, undefined, location);
            if (refs.length) {
                const content = await this.userDataSyncLocalStoreService.resolveResourceContent("profiles" /* SyncResource.Profiles */, refs[0].ref, undefined, location);
                if (content) {
                    const syncData = this.parseSyncData(content, "profiles" /* SyncResource.Profiles */);
                    return (0, userDataProfilesManifestSync_1.parseUserDataProfilesManifest)(syncData);
                }
            }
            return [];
        }
        async getLocalSyncedMachines(location) {
            const refs = await this.userDataSyncLocalStoreService.getAllResourceRefs('machines', undefined, location);
            if (refs.length) {
                const content = await this.userDataSyncLocalStoreService.resolveResourceContent('machines', refs[0].ref, undefined, location);
                if (content) {
                    const machinesData = JSON.parse(content);
                    return machinesData.machines.map(m => ({ ...m, isCurrent: false }));
                }
            }
            return [];
        }
        async getRemoteSyncResourceHandles(syncResource, profile) {
            const handles = await this.userDataSyncStoreService.getAllResourceRefs(syncResource, profile?.collection);
            return handles.map(({ created, ref }) => ({
                created,
                uri: this.toUri({
                    remote: true,
                    syncResource,
                    profile: profile?.id ?? this.userDataProfilesService.defaultProfile.id,
                    location: undefined,
                    collection: profile?.collection,
                    ref,
                    node: undefined,
                })
            }));
        }
        async getLocalSyncResourceHandles(syncResource, profile, location) {
            const handles = await this.userDataSyncLocalStoreService.getAllResourceRefs(syncResource, profile?.collection, location);
            return handles.map(({ created, ref }) => ({
                created,
                uri: this.toUri({
                    remote: false,
                    syncResource,
                    profile: profile?.id ?? this.userDataProfilesService.defaultProfile.id,
                    collection: profile?.collection,
                    ref,
                    node: undefined,
                    location,
                })
            }));
        }
        resolveUserDataSyncResource({ uri }) {
            const resolved = this.resolveUri(uri);
            const profile = resolved ? this.userDataProfilesService.profiles.find(p => p.id === resolved.profile) : undefined;
            return resolved && profile ? { profile, syncResource: resolved?.syncResource } : undefined;
        }
        async getAssociatedResources({ uri }) {
            const resolved = this.resolveUri(uri);
            if (!resolved) {
                return [];
            }
            const profile = this.userDataProfilesService.profiles.find(p => p.id === resolved.profile);
            switch (resolved.syncResource) {
                case "settings" /* SyncResource.Settings */: return this.getSettingsAssociatedResources(uri, profile);
                case "keybindings" /* SyncResource.Keybindings */: return this.getKeybindingsAssociatedResources(uri, profile);
                case "tasks" /* SyncResource.Tasks */: return this.getTasksAssociatedResources(uri, profile);
                case "snippets" /* SyncResource.Snippets */: return this.getSnippetsAssociatedResources(uri, profile);
                case "globalState" /* SyncResource.GlobalState */: return this.getGlobalStateAssociatedResources(uri, profile);
                case "extensions" /* SyncResource.Extensions */: return this.getExtensionsAssociatedResources(uri, profile);
                case "profiles" /* SyncResource.Profiles */: return this.getProfilesAssociatedResources(uri, profile);
                case "workspaceState" /* SyncResource.WorkspaceState */: return [];
            }
        }
        async getMachineId({ uri }) {
            const resolved = this.resolveUri(uri);
            if (!resolved) {
                return undefined;
            }
            if (resolved.remote) {
                if (resolved.ref) {
                    const { content } = await this.getUserData(resolved.syncResource, resolved.ref, resolved.collection);
                    if (content) {
                        const syncData = this.parseSyncData(content, resolved.syncResource);
                        return syncData?.machineId;
                    }
                }
                return undefined;
            }
            if (resolved.location) {
                if (resolved.ref) {
                    const content = await this.userDataSyncLocalStoreService.resolveResourceContent(resolved.syncResource, resolved.ref, resolved.collection, resolved.location);
                    if (content) {
                        const syncData = this.parseSyncData(content, resolved.syncResource);
                        return syncData?.machineId;
                    }
                }
                return undefined;
            }
            return (0, serviceMachineId_1.getServiceMachineId)(this.environmentService, this.fileService, this.storageService);
        }
        async resolveContent(uri) {
            const resolved = this.resolveUri(uri);
            if (!resolved) {
                return null;
            }
            if (resolved.node === UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE) {
                return null;
            }
            if (resolved.ref) {
                const content = await this.getContentFromStore(resolved.remote, resolved.syncResource, resolved.collection, resolved.ref, resolved.location);
                if (resolved.node && content) {
                    return this.resolveNodeContent(resolved.syncResource, content, resolved.node);
                }
                return content;
            }
            if (!resolved.remote && !resolved.node) {
                return this.resolveLatestContent(resolved.syncResource, resolved.profile);
            }
            return null;
        }
        async getContentFromStore(remote, syncResource, collection, ref, location) {
            if (remote) {
                const { content } = await this.getUserData(syncResource, ref, collection);
                return content;
            }
            return this.userDataSyncLocalStoreService.resolveResourceContent(syncResource, ref, collection, location);
        }
        resolveNodeContent(syncResource, content, node) {
            const syncData = this.parseSyncData(content, syncResource);
            switch (syncResource) {
                case "settings" /* SyncResource.Settings */: return this.resolveSettingsNodeContent(syncData, node);
                case "keybindings" /* SyncResource.Keybindings */: return this.resolveKeybindingsNodeContent(syncData, node);
                case "tasks" /* SyncResource.Tasks */: return this.resolveTasksNodeContent(syncData, node);
                case "snippets" /* SyncResource.Snippets */: return this.resolveSnippetsNodeContent(syncData, node);
                case "globalState" /* SyncResource.GlobalState */: return this.resolveGlobalStateNodeContent(syncData, node);
                case "extensions" /* SyncResource.Extensions */: return this.resolveExtensionsNodeContent(syncData, node);
                case "profiles" /* SyncResource.Profiles */: return this.resolveProfileNodeContent(syncData, node);
                case "workspaceState" /* SyncResource.WorkspaceState */: return null;
            }
        }
        async resolveLatestContent(syncResource, profileId) {
            const profile = this.userDataProfilesService.profiles.find(p => p.id === profileId);
            if (!profile) {
                return null;
            }
            switch (syncResource) {
                case "globalState" /* SyncResource.GlobalState */: return this.resolveLatestGlobalStateContent(profile);
                case "extensions" /* SyncResource.Extensions */: return this.resolveLatestExtensionsContent(profile);
                case "profiles" /* SyncResource.Profiles */: return this.resolveLatestProfilesContent(profile);
                case "settings" /* SyncResource.Settings */: return null;
                case "keybindings" /* SyncResource.Keybindings */: return null;
                case "tasks" /* SyncResource.Tasks */: return null;
                case "snippets" /* SyncResource.Snippets */: return null;
                case "workspaceState" /* SyncResource.WorkspaceState */: return null;
            }
        }
        getSettingsAssociatedResources(uri, profile) {
            const resource = this.extUri.joinPath(uri, 'settings.json');
            const comparableResource = profile ? profile.settingsResource : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
            return [{ resource, comparableResource }];
        }
        resolveSettingsNodeContent(syncData, node) {
            switch (node) {
                case 'settings.json':
                    return (0, settingsSync_1.parseSettingsSyncContent)(syncData.content).settings;
            }
            return null;
        }
        getKeybindingsAssociatedResources(uri, profile) {
            const resource = this.extUri.joinPath(uri, 'keybindings.json');
            const comparableResource = profile ? profile.keybindingsResource : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
            return [{ resource, comparableResource }];
        }
        resolveKeybindingsNodeContent(syncData, node) {
            switch (node) {
                case 'keybindings.json':
                    return (0, keybindingsSync_1.getKeybindingsContentFromSyncContent)(syncData.content, !!this.configurationService.getValue(userDataSync_1.CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM), this.logService);
            }
            return null;
        }
        getTasksAssociatedResources(uri, profile) {
            const resource = this.extUri.joinPath(uri, 'tasks.json');
            const comparableResource = profile ? profile.tasksResource : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
            return [{ resource, comparableResource }];
        }
        resolveTasksNodeContent(syncData, node) {
            switch (node) {
                case 'tasks.json':
                    return (0, tasksSync_1.getTasksContentFromSyncContent)(syncData.content, this.logService);
            }
            return null;
        }
        async getSnippetsAssociatedResources(uri, profile) {
            const content = await this.resolveContent(uri);
            if (content) {
                const syncData = this.parseSyncData(content, "snippets" /* SyncResource.Snippets */);
                if (syncData) {
                    const snippets = (0, snippetsSync_1.parseSnippets)(syncData);
                    const result = [];
                    for (const snippet of Object.keys(snippets)) {
                        const resource = this.extUri.joinPath(uri, snippet);
                        const comparableResource = profile ? this.extUri.joinPath(profile.snippetsHome, snippet) : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
                        result.push({ resource, comparableResource });
                    }
                    return result;
                }
            }
            return [];
        }
        resolveSnippetsNodeContent(syncData, node) {
            return (0, snippetsSync_1.parseSnippets)(syncData)[node] || null;
        }
        getExtensionsAssociatedResources(uri, profile) {
            const resource = this.extUri.joinPath(uri, 'extensions.json');
            const comparableResource = profile
                ? this.toUri({
                    remote: false,
                    syncResource: "extensions" /* SyncResource.Extensions */,
                    profile: profile.id,
                    location: undefined,
                    collection: undefined,
                    ref: undefined,
                    node: undefined,
                })
                : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
            return [{ resource, comparableResource }];
        }
        resolveExtensionsNodeContent(syncData, node) {
            switch (node) {
                case 'extensions.json':
                    return (0, extensionsSync_1.stringify)((0, extensionsSync_1.parseExtensions)(syncData), true);
            }
            return null;
        }
        async resolveLatestExtensionsContent(profile) {
            const { localExtensions } = await this.instantiationService.createInstance(extensionsSync_1.LocalExtensionsProvider).getLocalExtensions(profile);
            return (0, extensionsSync_1.stringify)(localExtensions, true);
        }
        getGlobalStateAssociatedResources(uri, profile) {
            const resource = this.extUri.joinPath(uri, 'globalState.json');
            const comparableResource = profile
                ? this.toUri({
                    remote: false,
                    syncResource: "globalState" /* SyncResource.GlobalState */,
                    profile: profile.id,
                    location: undefined,
                    collection: undefined,
                    ref: undefined,
                    node: undefined,
                })
                : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
            return [{ resource, comparableResource }];
        }
        resolveGlobalStateNodeContent(syncData, node) {
            switch (node) {
                case 'globalState.json':
                    return (0, globalStateSync_1.stringify)(JSON.parse(syncData.content), true);
            }
            return null;
        }
        async resolveLatestGlobalStateContent(profile) {
            const localGlobalState = await this.instantiationService.createInstance(globalStateSync_1.LocalGlobalStateProvider).getLocalGlobalState(profile);
            return (0, globalStateSync_1.stringify)(localGlobalState, true);
        }
        getProfilesAssociatedResources(uri, profile) {
            const resource = this.extUri.joinPath(uri, 'profiles.json');
            const comparableResource = this.toUri({
                remote: false,
                syncResource: "profiles" /* SyncResource.Profiles */,
                profile: this.userDataProfilesService.defaultProfile.id,
                location: undefined,
                collection: undefined,
                ref: undefined,
                node: undefined,
            });
            return [{ resource, comparableResource }];
        }
        resolveProfileNodeContent(syncData, node) {
            switch (node) {
                case 'profiles.json':
                    return (0, jsonFormatter_1.toFormattedString)(JSON.parse(syncData.content), {});
            }
            return null;
        }
        async resolveLatestProfilesContent(profile) {
            return (0, userDataProfilesManifestSync_1.stringifyLocalProfiles)(this.userDataProfilesService.profiles.filter(p => !p.isDefault && !p.isTransient), true);
        }
        toUri(syncResourceUriInfo) {
            const authority = syncResourceUriInfo.remote ? UserDataSyncResourceProviderService_1.REMOTE_BACKUP_AUTHORITY : UserDataSyncResourceProviderService_1.LOCAL_BACKUP_AUTHORITY;
            const paths = [];
            if (syncResourceUriInfo.location) {
                paths.push(`scheme:${syncResourceUriInfo.location.scheme}`);
                paths.push(`authority:${syncResourceUriInfo.location.authority}`);
                paths.push((0, strings_1.trim)(syncResourceUriInfo.location.path, '/'));
            }
            paths.push(`syncResource:${syncResourceUriInfo.syncResource}`);
            paths.push(`profile:${syncResourceUriInfo.profile}`);
            paths.push(syncResourceUriInfo.profile);
            if (syncResourceUriInfo.collection) {
                paths.push(`collection:${syncResourceUriInfo.collection}`);
            }
            if (syncResourceUriInfo.ref) {
                paths.push(`ref:${syncResourceUriInfo.ref}`);
            }
            if (syncResourceUriInfo.node) {
                paths.push(syncResourceUriInfo.node);
            }
            return this.extUri.joinPath(uri_1.URI.from({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority, path: `/`, query: syncResourceUriInfo.location?.query, fragment: syncResourceUriInfo.location?.fragment }), ...paths);
        }
        resolveUri(uri) {
            if (uri.scheme !== userDataSync_1.USER_DATA_SYNC_SCHEME) {
                return undefined;
            }
            const paths = [];
            while (uri.path !== '/') {
                paths.unshift(this.extUri.basename(uri));
                uri = this.extUri.dirname(uri);
            }
            if (paths.length < 2) {
                return undefined;
            }
            const remote = uri.authority === UserDataSyncResourceProviderService_1.REMOTE_BACKUP_AUTHORITY;
            let scheme;
            let authority;
            const locationPaths = [];
            let syncResource;
            let profile;
            let collection;
            let ref;
            let node;
            while (paths.length) {
                const path = paths.shift();
                if (path.startsWith('scheme:')) {
                    scheme = path.substring('scheme:'.length);
                }
                else if (path.startsWith('authority:')) {
                    authority = path.substring('authority:'.length);
                }
                else if (path.startsWith('syncResource:')) {
                    syncResource = path.substring('syncResource:'.length);
                }
                else if (path.startsWith('profile:')) {
                    profile = path.substring('profile:'.length);
                }
                else if (path.startsWith('collection:')) {
                    collection = path.substring('collection:'.length);
                }
                else if (path.startsWith('ref:')) {
                    ref = path.substring('ref:'.length);
                }
                else if (!syncResource) {
                    locationPaths.push(path);
                }
                else {
                    node = path;
                }
            }
            return {
                remote,
                syncResource: syncResource,
                profile: profile,
                collection,
                ref,
                node,
                location: scheme && authority !== undefined ? this.extUri.joinPath(uri_1.URI.from({ scheme, authority, query: uri.query, fragment: uri.fragment, path: '/' }), ...locationPaths) : undefined
            };
        }
        parseSyncData(content, syncResource) {
            try {
                const syncData = JSON.parse(content);
                if ((0, abstractSynchronizer_1.isSyncData)(syncData)) {
                    return syncData;
                }
            }
            catch (error) {
                this.logService.error(error);
            }
            throw new userDataSync_1.UserDataSyncError((0, nls_1.localize)('incompatible sync data', "Cannot parse sync data as it is not compatible with the current version."), "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */, syncResource);
        }
        async getUserData(syncResource, ref, collection) {
            const content = await this.userDataSyncStoreService.resolveResourceContent(syncResource, ref, collection);
            return { ref, content };
        }
    };
    exports.UserDataSyncResourceProviderService = UserDataSyncResourceProviderService;
    exports.UserDataSyncResourceProviderService = UserDataSyncResourceProviderService = UserDataSyncResourceProviderService_1 = __decorate([
        __param(0, userDataSync_1.IUserDataSyncStoreService),
        __param(1, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(2, userDataSync_1.IUserDataSyncLogService),
        __param(3, uriIdentity_1.IUriIdentityService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, storage_1.IStorageService),
        __param(6, files_1.IFileService),
        __param(7, userDataProfile_1.IUserDataProfilesService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, instantiation_1.IInstantiationService)
    ], UserDataSyncResourceProviderService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jUmVzb3VyY2VQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhU3luYy9jb21tb24vdXNlckRhdGFTeW5jUmVzb3VyY2VQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBb0N6RixJQUFNLG1DQUFtQyxHQUF6QyxNQUFNLG1DQUFtQzs7aUJBSXZCLDBCQUFxQixHQUFHLHVCQUF1QixBQUExQixDQUEyQjtpQkFDaEQsNEJBQXVCLEdBQUcsZUFBZSxBQUFsQixDQUFtQjtpQkFDMUMsMkJBQXNCLEdBQUcsY0FBYyxBQUFqQixDQUFrQjtRQUloRSxZQUM2Qyx3QkFBbUQsRUFDOUMsNkJBQTZELEVBQ2xFLFVBQW1DLEVBQzFELGtCQUF1QyxFQUN0QixrQkFBdUMsRUFDM0MsY0FBK0IsRUFDbEMsV0FBeUIsRUFDYix1QkFBaUQsRUFDcEQsb0JBQTJDLEVBQzNDLG9CQUEyQztZQVR2Qyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTJCO1lBQzlDLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBZ0M7WUFDbEUsZUFBVSxHQUFWLFVBQVUsQ0FBeUI7WUFFekMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUMzQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDYiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ3BELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUVuRixJQUFJLENBQUMsTUFBTSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztRQUN6QyxDQUFDO1FBRUQsS0FBSyxDQUFDLHVCQUF1QjtZQUM1QixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyx3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