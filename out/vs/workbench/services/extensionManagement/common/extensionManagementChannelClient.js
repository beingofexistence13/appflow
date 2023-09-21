/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagementIpc", "vs/base/common/event", "vs/base/common/arrays", "vs/base/common/strings"], function (require, exports, extensions_1, extensionManagementIpc_1, event_1, arrays_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProfileAwareExtensionManagementChannelClient = void 0;
    class ProfileAwareExtensionManagementChannelClient extends extensionManagementIpc_1.ExtensionManagementChannelClient {
        constructor(channel, userDataProfileService, uriIdentityService) {
            super(channel);
            this.userDataProfileService = userDataProfileService;
            this.uriIdentityService = uriIdentityService;
            this._onDidChangeProfile = this._register(new event_1.Emitter());
            this.onDidChangeProfile = this._onDidChangeProfile.event;
            this._register(userDataProfileService.onDidChangeCurrentProfile(e => {
                if (!this.uriIdentityService.extUri.isEqual(e.previous.extensionsResource, e.profile.extensionsResource)) {
                    e.join(this.whenProfileChanged(e));
                }
            }));
        }
        async fireEvent(arg0, arg1) {
            if (Array.isArray(arg1)) {
                const event = arg0;
                const data = arg1;
                const filtered = [];
                for (const e of data) {
                    const result = this.filterEvent(e);
                    if (result instanceof Promise ? await result : result) {
                        filtered.push(e);
                    }
                }
                if (filtered.length) {
                    event.fire(filtered);
                }
            }
            else {
                const event = arg0;
                const data = arg1;
                const result = this.filterEvent(data);
                if (result instanceof Promise ? await result : result) {
                    event.fire(data);
                }
            }
        }
        async install(vsix, installOptions) {
            installOptions = { ...installOptions, profileLocation: await this.getProfileLocation(installOptions?.profileLocation) };
            return super.install(vsix, installOptions);
        }
        async installFromLocation(location, profileLocation) {
            return super.installFromLocation(location, await this.getProfileLocation(profileLocation));
        }
        async installFromGallery(extension, installOptions) {
            installOptions = { ...installOptions, profileLocation: await this.getProfileLocation(installOptions?.profileLocation) };
            return super.installFromGallery(extension, installOptions);
        }
        async installGalleryExtensions(extensions) {
            const infos = [];
            for (const extension of extensions) {
                infos.push({ ...extension, options: { ...extension.options, profileLocation: extension.options?.profileLocation ? (await this.getProfileLocation(extension.options?.profileLocation)) : undefined } });
            }
            return super.installGalleryExtensions(infos);
        }
        async uninstall(extension, options) {
            options = { ...options, profileLocation: await this.getProfileLocation(options?.profileLocation) };
            return super.uninstall(extension, options);
        }
        async getInstalled(type = null, extensionsProfileResource) {
            return super.getInstalled(type, await this.getProfileLocation(extensionsProfileResource));
        }
        async updateMetadata(local, metadata, extensionsProfileResource) {
            return super.updateMetadata(local, metadata, await this.getProfileLocation(extensionsProfileResource));
        }
        async toggleAppliationScope(local, fromProfileLocation) {
            return super.toggleAppliationScope(local, await this.getProfileLocation(fromProfileLocation));
        }
        async copyExtensions(fromProfileLocation, toProfileLocation) {
            return super.copyExtensions(await this.getProfileLocation(fromProfileLocation), await this.getProfileLocation(toProfileLocation));
        }
        async whenProfileChanged(e) {
            const previousProfileLocation = await this.getProfileLocation(e.previous.extensionsResource);
            const currentProfileLocation = await this.getProfileLocation(e.profile.extensionsResource);
            if (this.uriIdentityService.extUri.isEqual(previousProfileLocation, currentProfileLocation)) {
                return;
            }
            const eventData = await this.switchExtensionsProfile(previousProfileLocation, currentProfileLocation);
            this._onDidChangeProfile.fire(eventData);
        }
        async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
            const oldExtensions = await this.getInstalled(1 /* ExtensionType.User */, previousProfileLocation);
            const newExtensions = await this.getInstalled(1 /* ExtensionType.User */, currentProfileLocation);
            if (preserveExtensions?.length) {
                const extensionsToInstall = [];
                for (const extension of oldExtensions) {
                    if (preserveExtensions.some(id => extensions_1.ExtensionIdentifier.equals(extension.identifier.id, id)) &&
                        !newExtensions.some(e => extensions_1.ExtensionIdentifier.equals(e.identifier.id, extension.identifier.id))) {
                        extensionsToInstall.push(extension.identifier);
                    }
                }
                if (extensionsToInstall.length) {
                    await this.installExtensionsFromProfile(extensionsToInstall, previousProfileLocation, currentProfileLocation);
                }
            }
            return (0, arrays_1.delta)(oldExtensions, newExtensions, (a, b) => (0, strings_1.compare)(`${extensions_1.ExtensionIdentifier.toKey(a.identifier.id)}@${a.manifest.version}`, `${extensions_1.ExtensionIdentifier.toKey(b.identifier.id)}@${b.manifest.version}`));
        }
        async getProfileLocation(profileLocation) {
            return profileLocation ?? this.userDataProfileService.currentProfile.extensionsResource;
        }
    }
    exports.ProfileAwareExtensionManagementChannelClient = ProfileAwareExtensionManagementChannelClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudENoYW5uZWxDbGllbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vZXh0ZW5zaW9uTWFuYWdlbWVudENoYW5uZWxDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQXNCLDRDQUE2QyxTQUFRLHlEQUFvQztRQUs5RyxZQUFZLE9BQWlCLEVBQ1Qsc0JBQStDLEVBQy9DLGtCQUF1QztZQUUxRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFISSwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQy9DLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFMMUMsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBOEUsQ0FBQyxDQUFDO1lBQ3hJLHVCQUFrQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFPNUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbkUsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO29CQUN6RyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNuQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBUWtCLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBUyxFQUFFLElBQVM7WUFDdEQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFD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