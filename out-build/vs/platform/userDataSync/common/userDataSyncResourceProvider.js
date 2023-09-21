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
define(["require", "exports", "vs/base/common/uri", "vs/nls!vs/platform/userDataSync/common/userDataSyncResourceProvider", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/storage/common/storage", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/snippetsSync", "vs/platform/userDataSync/common/settingsSync", "vs/platform/userDataSync/common/keybindingsSync", "vs/platform/configuration/common/configuration", "vs/platform/userDataSync/common/tasksSync", "vs/platform/userDataSync/common/extensionsSync", "vs/platform/userDataSync/common/globalStateSync", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataProfilesManifestSync", "vs/base/common/jsonFormatter", "vs/base/common/strings"], function (require, exports, uri_1, nls_1, environment_1, files_1, serviceMachineId_1, storage_1, uriIdentity_1, userDataSync_1, userDataProfile_1, abstractSynchronizer_1, snippetsSync_1, settingsSync_1, keybindingsSync_1, configuration_1, tasksSync_1, extensionsSync_1, globalStateSync_1, instantiation_1, userDataProfilesManifestSync_1, jsonFormatter_1, strings_1) {
    "use strict";
    var $k5b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$k5b = void 0;
    let $k5b = class $k5b {
        static { $k5b_1 = this; }
        static { this.a = 'not-existing-resource'; }
        static { this.b = 'remote-backup'; }
        static { this.c = 'local-backup'; }
        constructor(e, f, g, uriIdentityService, h, i, j, k, l, n) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.n = n;
            this.d = uriIdentityService.extUri;
        }
        async getRemoteSyncedProfiles() {
            const userData = await this.e.readResource("profiles" /* SyncResource.Profiles */, null, undefined);
            if (userData.content) {
                const syncData = this.L(userData.content, "profiles" /* SyncResource.Profiles */);
                return (0, userDataProfilesManifestSync_1.$J4b)(syncData);
            }
            return [];
        }
        async getLocalSyncedProfiles(location) {
            const refs = await this.f.getAllResourceRefs("profiles" /* SyncResource.Profiles */, undefined, location);
            if (refs.length) {
                const content = await this.f.resolveResourceContent("profiles" /* SyncResource.Profiles */, refs[0].ref, undefined, location);
                if (content) {
                    const syncData = this.L(content, "profiles" /* SyncResource.Profiles */);
                    return (0, userDataProfilesManifestSync_1.$J4b)(syncData);
                }
            }
            return [];
        }
        async getLocalSyncedMachines(location) {
            const refs = await this.f.getAllResourceRefs('machines', undefined, location);
            if (refs.length) {
                const content = await this.f.resolveResourceContent('machines', refs[0].ref, undefined, location);
                if (content) {
                    const machinesData = JSON.parse(content);
                    return machinesData.machines.map(m => ({ ...m, isCurrent: false }));
                }
            }
            return [];
        }
        async getRemoteSyncResourceHandles(syncResource, profile) {
            const handles = await this.e.getAllResourceRefs(syncResource, profile?.collection);
            return handles.map(({ created, ref }) => ({
                created,
                uri: this.J({
                    remote: true,
                    syncResource,
                    profile: profile?.id ?? this.k.defaultProfile.id,
                    location: undefined,
                    collection: profile?.collection,
                    ref,
                    node: undefined,
                })
            }));
        }
        async getLocalSyncResourceHandles(syncResource, profile, location) {
            const handles = await this.f.getAllResourceRefs(syncResource, profile?.collection, location);
            return handles.map(({ created, ref }) => ({
                created,
                uri: this.J({
                    remote: false,
                    syncResource,
                    profile: profile?.id ?? this.k.defaultProfile.id,
                    collection: profile?.collection,
                    ref,
                    node: undefined,
                    location,
                })
            }));
        }
        resolveUserDataSyncResource({ uri }) {
            const resolved = this.K(uri);
            const profile = resolved ? this.k.profiles.find(p => p.id === resolved.profile) : undefined;
            return resolved && profile ? { profile, syncResource: resolved?.syncResource } : undefined;
        }
        async getAssociatedResources({ uri }) {
            const resolved = this.K(uri);
            if (!resolved) {
                return [];
            }
            const profile = this.k.profiles.find(p => p.id === resolved.profile);
            switch (resolved.syncResource) {
                case "settings" /* SyncResource.Settings */: return this.s(uri, profile);
                case "keybindings" /* SyncResource.Keybindings */: return this.u(uri, profile);
                case "tasks" /* SyncResource.Tasks */: return this.w(uri, profile);
                case "snippets" /* SyncResource.Snippets */: return this.y(uri, profile);
                case "globalState" /* SyncResource.GlobalState */: return this.D(uri, profile);
                case "extensions" /* SyncResource.Extensions */: return this.A(uri, profile);
                case "profiles" /* SyncResource.Profiles */: return this.G(uri, profile);
                case "workspaceState" /* SyncResource.WorkspaceState */: return [];
            }
        }
        async getMachineId({ uri }) {
            const resolved = this.K(uri);
            if (!resolved) {
                return undefined;
            }
            if (resolved.remote) {
                if (resolved.ref) {
                    const { content } = await this.M(resolved.syncResource, resolved.ref, resolved.collection);
                    if (content) {
                        const syncData = this.L(content, resolved.syncResource);
                        return syncData?.machineId;
                    }
                }
                return undefined;
            }
            if (resolved.location) {
                if (resolved.ref) {
                    const content = await this.f.resolveResourceContent(resolved.syncResource, resolved.ref, resolved.collection, resolved.location);
                    if (content) {
                        const syncData = this.L(content, resolved.syncResource);
                        return syncData?.machineId;
                    }
                }
                return undefined;
            }
            return (0, serviceMachineId_1.$2o)(this.h, this.j, this.i);
        }
        async resolveContent(uri) {
            const resolved = this.K(uri);
            if (!resolved) {
                return null;
            }
            if (resolved.node === $k5b_1.a) {
                return null;
            }
            if (resolved.ref) {
                const content = await this.o(resolved.remote, resolved.syncResource, resolved.collection, resolved.ref, resolved.location);
                if (resolved.node && content) {
                    return this.q(resolved.syncResource, content, resolved.node);
                }
                return content;
            }
            if (!resolved.remote && !resolved.node) {
                return this.r(resolved.syncResource, resolved.profile);
            }
            return null;
        }
        async o(remote, syncResource, collection, ref, location) {
            if (remote) {
                const { content } = await this.M(syncResource, ref, collection);
                return content;
            }
            return this.f.resolveResourceContent(syncResource, ref, collection, location);
        }
        q(syncResource, content, node) {
            const syncData = this.L(content, syncResource);
            switch (syncResource) {
                case "settings" /* SyncResource.Settings */: return this.t(syncData, node);
                case "keybindings" /* SyncResource.Keybindings */: return this.v(syncData, node);
                case "tasks" /* SyncResource.Tasks */: return this.x(syncData, node);
                case "snippets" /* SyncResource.Snippets */: return this.z(syncData, node);
                case "globalState" /* SyncResource.GlobalState */: return this.E(syncData, node);
                case "extensions" /* SyncResource.Extensions */: return this.B(syncData, node);
                case "profiles" /* SyncResource.Profiles */: return this.H(syncData, node);
                case "workspaceState" /* SyncResource.WorkspaceState */: return null;
            }
        }
        async r(syncResource, profileId) {
            const profile = this.k.profiles.find(p => p.id === profileId);
            if (!profile) {
                return null;
            }
            switch (syncResource) {
                case "globalState" /* SyncResource.GlobalState */: return this.F(profile);
                case "extensions" /* SyncResource.Extensions */: return this.C(profile);
                case "profiles" /* SyncResource.Profiles */: return this.I(profile);
                case "settings" /* SyncResource.Settings */: return null;
                case "keybindings" /* SyncResource.Keybindings */: return null;
                case "tasks" /* SyncResource.Tasks */: return null;
                case "snippets" /* SyncResource.Snippets */: return null;
                case "workspaceState" /* SyncResource.WorkspaceState */: return null;
            }
        }
        s(uri, profile) {
            const resource = this.d.joinPath(uri, 'settings.json');
            const comparableResource = profile ? profile.settingsResource : this.d.joinPath(uri, $k5b_1.a);
            return [{ resource, comparableResource }];
        }
        t(syncData, node) {
            switch (node) {
                case 'settings.json':
                    return (0, settingsSync_1.$V2b)(syncData.content).settings;
            }
            return null;
        }
        u(uri, profile) {
            const resource = this.d.joinPath(uri, 'keybindings.json');
            const comparableResource = profile ? profile.keybindingsResource : this.d.joinPath(uri, $k5b_1.a);
            return [{ resource, comparableResource }];
        }
        v(syncData, node) {
            switch (node) {
                case 'keybindings.json':
                    return (0, keybindingsSync_1.$S2b)(syncData.content, !!this.l.getValue(userDataSync_1.$ygb), this.g);
            }
            return null;
        }
        w(uri, profile) {
            const resource = this.d.joinPath(uri, 'tasks.json');
            const comparableResource = profile ? profile.tasksResource : this.d.joinPath(uri, $k5b_1.a);
            return [{ resource, comparableResource }];
        }
        x(syncData, node) {
            switch (node) {
                case 'tasks.json':
                    return (0, tasksSync_1.$42b)(syncData.content, this.g);
            }
            return null;
        }
        async y(uri, profile) {
            const content = await this.resolveContent(uri);
            if (content) {
                const syncData = this.L(content, "snippets" /* SyncResource.Snippets */);
                if (syncData) {
                    const snippets = (0, snippetsSync_1.$12b)(syncData);
                    const result = [];
                    for (const snippet of Object.keys(snippets)) {
                        const resource = this.d.joinPath(uri, snippet);
                        const comparableResource = profile ? this.d.joinPath(profile.snippetsHome, snippet) : this.d.joinPath(uri, $k5b_1.a);
                        result.push({ resource, comparableResource });
                    }
                    return result;
                }
            }
            return [];
        }
        z(syncData, node) {
            return (0, snippetsSync_1.$12b)(syncData)[node] || null;
        }
        A(uri, profile) {
            const resource = this.d.joinPath(uri, 'extensions.json');
            const comparableResource = profile
                ? this.J({
                    remote: false,
                    syncResource: "extensions" /* SyncResource.Extensions */,
                    profile: profile.id,
                    location: undefined,
                    collection: undefined,
                    ref: undefined,
                    node: undefined,
                })
                : this.d.joinPath(uri, $k5b_1.a);
            return [{ resource, comparableResource }];
        }
        B(syncData, node) {
            switch (node) {
                case 'extensions.json':
                    return (0, extensionsSync_1.$N2b)((0, extensionsSync_1.$M2b)(syncData), true);
            }
            return null;
        }
        async C(profile) {
            const { localExtensions } = await this.n.createInstance(extensionsSync_1.$P2b).getLocalExtensions(profile);
            return (0, extensionsSync_1.$N2b)(localExtensions, true);
        }
        D(uri, profile) {
            const resource = this.d.joinPath(uri, 'globalState.json');
            const comparableResource = profile
                ? this.J({
                    remote: false,
                    syncResource: "globalState" /* SyncResource.GlobalState */,
                    profile: profile.id,
                    location: undefined,
                    collection: undefined,
                    ref: undefined,
                    node: undefined,
                })
                : this.d.joinPath(uri, $k5b_1.a);
            return [{ resource, comparableResource }];
        }
        E(syncData, node) {
            switch (node) {
                case 'globalState.json':
                    return (0, globalStateSync_1.$aBb)(JSON.parse(syncData.content), true);
            }
            return null;
        }
        async F(profile) {
            const localGlobalState = await this.n.createInstance(globalStateSync_1.$cBb).getLocalGlobalState(profile);
            return (0, globalStateSync_1.$aBb)(localGlobalState, true);
        }
        G(uri, profile) {
            const resource = this.d.joinPath(uri, 'profiles.json');
            const comparableResource = this.J({
                remote: false,
                syncResource: "profiles" /* SyncResource.Profiles */,
                profile: this.k.defaultProfile.id,
                location: undefined,
                collection: undefined,
                ref: undefined,
                node: undefined,
            });
            return [{ resource, comparableResource }];
        }
        H(syncData, node) {
            switch (node) {
                case 'profiles.json':
                    return (0, jsonFormatter_1.$yS)(JSON.parse(syncData.content), {});
            }
            return null;
        }
        async I(profile) {
            return (0, userDataProfilesManifestSync_1.$I4b)(this.k.profiles.filter(p => !p.isDefault && !p.isTransient), true);
        }
        J(syncResourceUriInfo) {
            const authority = syncResourceUriInfo.remote ? $k5b_1.b : $k5b_1.c;
            const paths = [];
            if (syncResourceUriInfo.location) {
                paths.push(`scheme:${syncResourceUriInfo.location.scheme}`);
                paths.push(`authority:${syncResourceUriInfo.location.authority}`);
                paths.push((0, strings_1.$te)(syncResourceUriInfo.location.path, '/'));
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
            return this.d.joinPath(uri_1.URI.from({ scheme: userDataSync_1.$Wgb, authority, path: `/`, query: syncResourceUriInfo.location?.query, fragment: syncResourceUriInfo.location?.fragment }), ...paths);
        }
        K(uri) {
            if (uri.scheme !== userDataSync_1.$Wgb) {
                return undefined;
            }
            const paths = [];
            while (uri.path !== '/') {
                paths.unshift(this.d.basename(uri));
                uri = this.d.dirname(uri);
            }
            if (paths.length < 2) {
                return undefined;
            }
            const remote = uri.authority === $k5b_1.b;
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
                location: scheme && authority !== undefined ? this.d.joinPath(uri_1.URI.from({ scheme, authority, query: uri.query, fragment: uri.fragment, path: '/' }), ...locationPaths) : undefined
            };
        }
        L(content, syncResource) {
            try {
                const syncData = JSON.parse(content);
                if ((0, abstractSynchronizer_1.$6Ab)(syncData)) {
                    return syncData;
                }
            }
            catch (error) {
                this.g.error(error);
            }
            throw new userDataSync_1.$Kgb((0, nls_1.localize)(0, null), "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */, syncResource);
        }
        async M(syncResource, ref, collection) {
            const content = await this.e.resolveResourceContent(syncResource, ref, collection);
            return { ref, content };
        }
    };
    exports.$k5b = $k5b;
    exports.$k5b = $k5b = $k5b_1 = __decorate([
        __param(0, userDataSync_1.$Fgb),
        __param(1, userDataSync_1.$Ggb),
        __param(2, userDataSync_1.$Ugb),
        __param(3, uriIdentity_1.$Ck),
        __param(4, environment_1.$Ih),
        __param(5, storage_1.$Vo),
        __param(6, files_1.$6j),
        __param(7, userDataProfile_1.$Ek),
        __param(8, configuration_1.$8h),
        __param(9, instantiation_1.$Ah)
    ], $k5b);
});
//# sourceMappingURL=userDataSyncResourceProvider.js.map