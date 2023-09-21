/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/userDataProfile/common/userDataProfile", "vs/base/common/uriIpc"], function (require, exports, event_1, lifecycle_1, userDataProfile_1, uriIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tN = exports.$sN = void 0;
    class $sN {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        listen(context, event) {
            const uriTransformer = this.b(context);
            switch (event) {
                case 'onDidChangeProfiles': return event_1.Event.map(this.a.onDidChangeProfiles, e => {
                    return {
                        all: e.all.map(p => (0, uriIpc_1.$Dm)({ ...p }, uriTransformer)),
                        added: e.added.map(p => (0, uriIpc_1.$Dm)({ ...p }, uriTransformer)),
                        removed: e.removed.map(p => (0, uriIpc_1.$Dm)({ ...p }, uriTransformer)),
                        updated: e.updated.map(p => (0, uriIpc_1.$Dm)({ ...p }, uriTransformer))
                    };
                });
            }
            throw new Error(`Invalid listen ${event}`);
        }
        async call(context, command, args) {
            const uriTransformer = this.b(context);
            switch (command) {
                case 'createProfile': {
                    const profile = await this.a.createProfile(args[0], args[1], args[2]);
                    return (0, uriIpc_1.$Dm)({ ...profile }, uriTransformer);
                }
                case 'updateProfile': {
                    let profile = (0, userDataProfile_1.$Fk)((0, uriIpc_1.$Em)(args[0], uriTransformer), this.a.profilesHome.scheme);
                    profile = await this.a.updateProfile(profile, args[1]);
                    return (0, uriIpc_1.$Dm)({ ...profile }, uriTransformer);
                }
                case 'removeProfile': {
                    const profile = (0, userDataProfile_1.$Fk)((0, uriIpc_1.$Em)(args[0], uriTransformer), this.a.profilesHome.scheme);
                    return this.a.removeProfile(profile);
                }
            }
            throw new Error(`Invalid call ${command}`);
        }
    }
    exports.$sN = $sN;
    class $tN extends lifecycle_1.$kc {
        get defaultProfile() { return this.profiles[0]; }
        get profiles() { return this.a; }
        constructor(profiles, profilesHome, f) {
            super();
            this.profilesHome = profilesHome;
            this.f = f;
            this.a = [];
            this.b = this.B(new event_1.$fd());
            this.onDidChangeProfiles = this.b.event;
            this.c = true;
            this.a = profiles.map(profile => (0, userDataProfile_1.$Fk)(profile, this.profilesHome.scheme));
            this.B(this.f.listen('onDidChangeProfiles')(e => {
                const added = e.added.map(profile => (0, userDataProfile_1.$Fk)(profile, this.profilesHome.scheme));
                const removed = e.removed.map(profile => (0, userDataProfile_1.$Fk)(profile, this.profilesHome.scheme));
                const updated = e.updated.map(profile => (0, userDataProfile_1.$Fk)(profile, this.profilesHome.scheme));
                this.a = e.all.map(profile => (0, userDataProfile_1.$Fk)(profile, this.profilesHome.scheme));
                this.b.fire({ added, removed, updated, all: this.profiles });
            }));
            this.onDidResetWorkspaces = this.f.listen('onDidResetWorkspaces');
        }
        setEnablement(enabled) {
            this.c = enabled;
        }
        isEnabled() {
            return this.c;
        }
        async createNamedProfile(name, options, workspaceIdentifier) {
            const result = await this.f.call('createNamedProfile', [name, options, workspaceIdentifier]);
            return (0, userDataProfile_1.$Fk)(result, this.profilesHome.scheme);
        }
        async createProfile(id, name, options, workspaceIdentifier) {
            const result = await this.f.call('createProfile', [id, name, options, workspaceIdentifier]);
            return (0, userDataProfile_1.$Fk)(result, this.profilesHome.scheme);
        }
        async createTransientProfile(workspaceIdentifier) {
            const result = await this.f.call('createTransientProfile', [workspaceIdentifier]);
            return (0, userDataProfile_1.$Fk)(result, this.profilesHome.scheme);
        }
        async setProfileForWorkspace(workspaceIdentifier, profile) {
            await this.f.call('setProfileForWorkspace', [workspaceIdentifier, profile]);
        }
        removeProfile(profile) {
            return this.f.call('removeProfile', [profile]);
        }
        async updateProfile(profile, updateOptions) {
            const result = await this.f.call('updateProfile', [profile, updateOptions]);
            return (0, userDataProfile_1.$Fk)(result, this.profilesHome.scheme);
        }
        resetWorkspaces() {
            return this.f.call('resetWorkspaces');
        }
        cleanUp() {
            return this.f.call('cleanUp');
        }
        cleanUpTransientProfiles() {
            return this.f.call('cleanUpTransientProfiles');
        }
    }
    exports.$tN = $tN;
});
//# sourceMappingURL=userDataProfileIpc.js.map