/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/userDataProfile/common/userDataProfile", "vs/base/common/uriIpc"], function (require, exports, event_1, lifecycle_1, userDataProfile_1, uriIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfilesService = exports.RemoteUserDataProfilesServiceChannel = void 0;
    class RemoteUserDataProfilesServiceChannel {
        constructor(service, getUriTransformer) {
            this.service = service;
            this.getUriTransformer = getUriTransformer;
        }
        listen(context, event) {
            const uriTransformer = this.getUriTransformer(context);
            switch (event) {
                case 'onDidChangeProfiles': return event_1.Event.map(this.service.onDidChangeProfiles, e => {
                    return {
                        all: e.all.map(p => (0, uriIpc_1.transformOutgoingURIs)({ ...p }, uriTransformer)),
                        added: e.added.map(p => (0, uriIpc_1.transformOutgoingURIs)({ ...p }, uriTransformer)),
                        removed: e.removed.map(p => (0, uriIpc_1.transformOutgoingURIs)({ ...p }, uriTransformer)),
                        updated: e.updated.map(p => (0, uriIpc_1.transformOutgoingURIs)({ ...p }, uriTransformer))
                    };
                });
            }
            throw new Error(`Invalid listen ${event}`);
        }
        async call(context, command, args) {
            const uriTransformer = this.getUriTransformer(context);
            switch (command) {
                case 'createProfile': {
                    const profile = await this.service.createProfile(args[0], args[1], args[2]);
                    return (0, uriIpc_1.transformOutgoingURIs)({ ...profile }, uriTransformer);
                }
                case 'updateProfile': {
                    let profile = (0, userDataProfile_1.reviveProfile)((0, uriIpc_1.transformIncomingURIs)(args[0], uriTransformer), this.service.profilesHome.scheme);
                    profile = await this.service.updateProfile(profile, args[1]);
                    return (0, uriIpc_1.transformOutgoingURIs)({ ...profile }, uriTransformer);
                }
                case 'removeProfile': {
                    const profile = (0, userDataProfile_1.reviveProfile)((0, uriIpc_1.transformIncomingURIs)(args[0], uriTransformer), this.service.profilesHome.scheme);
                    return this.service.removeProfile(profile);
                }
            }
            throw new Error(`Invalid call ${command}`);
        }
    }
    exports.RemoteUserDataProfilesServiceChannel = RemoteUserDataProfilesServiceChannel;
    class UserDataProfilesService extends lifecycle_1.Disposable {
        get defaultProfile() { return this.profiles[0]; }
        get profiles() { return this._profiles; }
        constructor(profiles, profilesHome, channel) {
            super();
            this.profilesHome = profilesHome;
            this.channel = channel;
            this._profiles = [];
            this._onDidChangeProfiles = this._register(new event_1.Emitter());
            this.onDidChangeProfiles = this._onDidChangeProfiles.event;
            this.enabled = true;
            this._profiles = profiles.map(profile => (0, userDataProfile_1.reviveProfile)(profile, this.profilesHome.scheme));
            this._register(this.channel.listen('onDidChangeProfiles')(e => {
                const added = e.added.map(profile => (0, userDataProfile_1.reviveProfile)(profile, this.profilesHome.scheme));
                const removed = e.removed.map(profile => (0, userDataProfile_1.reviveProfile)(profile, this.profilesHome.scheme));
                const updated = e.updated.map(profile => (0, userDataProfile_1.reviveProfile)(profile, this.profilesHome.scheme));
                this._profiles = e.all.map(profile => (0, userDataProfile_1.reviveProfile)(profile, this.profilesHome.scheme));
                this._onDidChangeProfiles.fire({ added, removed, updated, all: this.profiles });
            }));
            this.onDidResetWorkspaces = this.channel.listen('onDidResetWorkspaces');
        }
        setEnablement(enabled) {
            this.enabled = enabled;
        }
        isEnabled() {
            return this.enabled;
        }
        async createNamedProfile(name, options, workspaceIdentifier) {
            const result = await this.channel.call('createNamedProfile', [name, options, workspaceIdentifier]);
            return (0, userDataProfile_1.reviveProfile)(result, this.profilesHome.scheme);
        }
        async createProfile(id, name, options, workspaceIdentifier) {
            const result = await this.channel.call('createProfile', [id, name, options, workspaceIdentifier]);
            return (0, userDataProfile_1.reviveProfile)(result, this.profilesHome.scheme);
        }
        async createTransientProfile(workspaceIdentifier) {
            const result = await this.channel.call('createTransientProfile', [workspaceIdentifier]);
            return (0, userDataProfile_1.reviveProfile)(result, this.profilesHome.scheme);
        }
        async setProfileForWorkspace(workspaceIdentifier, profile) {
            await this.channel.call('setProfileForWorkspace', [workspaceIdentifier, profile]);
        }
        removeProfile(profile) {
            return this.channel.call('removeProfile', [profile]);
        }
        async updateProfile(profile, updateOptions) {
            const result = await this.channel.call('updateProfile', [profile, updateOptions]);
            return (0, userDataProfile_1.reviveProfile)(result, this.profilesHome.scheme);
        }
        resetWorkspaces() {
            return this.channel.call('resetWorkspaces');
        }
        cleanUp() {
            return this.channel.call('cleanUp');
        }
        cleanUpTransientProfiles() {
            return this.channel.call('cleanUpTransientProfiles');
        }
    }
    exports.UserDataProfilesService = UserDataProfilesService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlSXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFQcm9maWxlL2NvbW1vbi91c2VyRGF0YVByb2ZpbGVJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsb0NBQW9DO1FBRWhELFlBQ2tCLE9BQWlDLEVBQ2pDLGlCQUEyRDtZQUQzRCxZQUFPLEdBQVAsT0FBTyxDQUEwQjtZQUNqQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQTBDO1FBQ3pFLENBQUM7UUFFTCxNQUFNLENBQUMsT0FBWSxFQUFFLEtBQWE7WUFDakMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELFFBQVEsS0FBSyxFQUFFO2dCQUNkLEtBQUsscUJBQXFCLENBQUMsQ0FBQyxPQUFPLGFBQUssQ0FBQyxHQUFHLENBQWlELElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ2xJLE9BQU87d0JBQ04sR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSw4QkFBcUIsRUFBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7d0JBQ3BFLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsOEJBQXFCLEVBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO3dCQUN4RSxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFBLDhCQUFxQixFQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQzt3QkFDNUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSw4QkFBcUIsRUFBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7cUJBQzVFLENBQUM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBWSxFQUFFLE9BQWUsRUFBRSxJQUFVO1lBQ25ELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RCxRQUFRLE9BQU8sRUFBRTtnQkFDaEIsS0FBSyxlQUFlLENBQUMsQ0FBQztvQkFDckIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1RSxPQUFPLElBQUEsOEJBQXFCLEVBQUMsRUFBRSxHQUFHLE9BQU8sRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2lCQUM3RDtnQkFDRCxLQUFLLGVBQWUsQ0FBQyxDQUFDO29CQUNyQixJQUFJLE9BQU8sR0FBRyxJQUFBLCtCQUFhLEVBQUMsSUFBQSw4QkFBcUIsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzlHLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0QsT0FBTyxJQUFBLDhCQUFxQixFQUFDLEVBQUUsR0FBRyxPQUFPLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztpQkFDN0Q7Z0JBQ0QsS0FBSyxlQUFlLENBQUMsQ0FBQztvQkFDckIsTUFBTSxPQUFPLEdBQUcsSUFBQSwrQkFBYSxFQUFDLElBQUEsOEJBQXFCLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNoSCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUMzQzthQUNEO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM1QyxDQUFDO0tBQ0Q7SUF6Q0Qsb0ZBeUNDO0lBRUQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBVTtRQUl0RCxJQUFJLGNBQWMsS0FBdUIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVuRSxJQUFJLFFBQVEsS0FBeUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQVM3RCxZQUNDLFFBQTZDLEVBQ3BDLFlBQWlCLEVBQ1QsT0FBaUI7WUFFbEMsS0FBSyxFQUFFLENBQUM7WUFIQyxpQkFBWSxHQUFaLFlBQVksQ0FBSztZQUNULFlBQU8sR0FBUCxPQUFPLENBQVU7WUFiM0IsY0FBUyxHQUF1QixFQUFFLENBQUM7WUFHMUIseUJBQW9CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBMEIsQ0FBQyxDQUFDO1lBQ3JGLHdCQUFtQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFJdkQsWUFBTyxHQUFZLElBQUksQ0FBQztZQVEvQixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFBLCtCQUFhLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUF5QixxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNyRixNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUEsK0JBQWEsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUEsK0JBQWEsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUMzRixNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUEsK0JBQWEsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUMzRixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBQSwrQkFBYSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3hGLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDakYsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBTyxzQkFBc0IsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFRCxhQUFhLENBQUMsT0FBZ0I7WUFDN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUVELFNBQVM7WUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckIsQ0FBQztRQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFZLEVBQUUsT0FBaUMsRUFBRSxtQkFBNkM7WUFDdEgsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBMkIsb0JBQW9CLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUM3SCxPQUFPLElBQUEsK0JBQWEsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFVLEVBQUUsSUFBWSxFQUFFLE9BQWlDLEVBQUUsbUJBQTZDO1lBQzdILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQTJCLGVBQWUsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUM1SCxPQUFPLElBQUEsK0JBQWEsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsS0FBSyxDQUFDLHNCQUFzQixDQUFDLG1CQUE2QztZQUN6RSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUEyQix3QkFBd0IsRUFBRSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUNsSCxPQUFPLElBQUEsK0JBQWEsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsS0FBSyxDQUFDLHNCQUFzQixDQUFDLG1CQUE0QyxFQUFFLE9BQXlCO1lBQ25HLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQTJCLHdCQUF3QixFQUFFLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3RyxDQUFDO1FBRUQsYUFBYSxDQUFDLE9BQXlCO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUF5QixFQUFFLGFBQTRDO1lBQzFGLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQTJCLGVBQWUsRUFBRSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzVHLE9BQU8sSUFBQSwrQkFBYSxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxlQUFlO1lBQ2QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFFRCxPQUFPO1lBQ04sT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsd0JBQXdCO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBRUQ7SUFoRkQsMERBZ0ZDIn0=