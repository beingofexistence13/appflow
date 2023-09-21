/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagementIpc", "vs/base/common/event", "vs/base/common/arrays", "vs/base/common/strings"], function (require, exports, extensions_1, extensionManagementIpc_1, event_1, arrays_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Z3b = void 0;
    class $Z3b extends extensionManagementIpc_1.$$o {
        constructor(channel, u, w) {
            super(channel);
            this.u = u;
            this.w = w;
            this.t = this.B(new event_1.$fd());
            this.onDidChangeProfile = this.t.event;
            this.B(u.onDidChangeCurrentProfile(e => {
                if (!this.w.extUri.isEqual(e.previous.extensionsResource, e.profile.extensionsResource)) {
                    e.join(this.z(e));
                }
            }));
        }
        async n(arg0, arg1) {
            if (Array.isArray(arg1)) {
                const event = arg0;
                const data = arg1;
                const filtered = [];
                for (const e of data) {
                    const result = this.F(e);
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
                const result = this.F(data);
                if (result instanceof Promise ? await result : result) {
                    event.fire(data);
                }
            }
        }
        async install(vsix, installOptions) {
            installOptions = { ...installOptions, profileLocation: await this.D(installOptions?.profileLocation) };
            return super.install(vsix, installOptions);
        }
        async installFromLocation(location, profileLocation) {
            return super.installFromLocation(location, await this.D(profileLocation));
        }
        async installFromGallery(extension, installOptions) {
            installOptions = { ...installOptions, profileLocation: await this.D(installOptions?.profileLocation) };
            return super.installFromGallery(extension, installOptions);
        }
        async installGalleryExtensions(extensions) {
            const infos = [];
            for (const extension of extensions) {
                infos.push({ ...extension, options: { ...extension.options, profileLocation: extension.options?.profileLocation ? (await this.D(extension.options?.profileLocation)) : undefined } });
            }
            return super.installGalleryExtensions(infos);
        }
        async uninstall(extension, options) {
            options = { ...options, profileLocation: await this.D(options?.profileLocation) };
            return super.uninstall(extension, options);
        }
        async getInstalled(type = null, extensionsProfileResource) {
            return super.getInstalled(type, await this.D(extensionsProfileResource));
        }
        async updateMetadata(local, metadata, extensionsProfileResource) {
            return super.updateMetadata(local, metadata, await this.D(extensionsProfileResource));
        }
        async toggleAppliationScope(local, fromProfileLocation) {
            return super.toggleAppliationScope(local, await this.D(fromProfileLocation));
        }
        async copyExtensions(fromProfileLocation, toProfileLocation) {
            return super.copyExtensions(await this.D(fromProfileLocation), await this.D(toProfileLocation));
        }
        async z(e) {
            const previousProfileLocation = await this.D(e.previous.extensionsResource);
            const currentProfileLocation = await this.D(e.profile.extensionsResource);
            if (this.w.extUri.isEqual(previousProfileLocation, currentProfileLocation)) {
                return;
            }
            const eventData = await this.C(previousProfileLocation, currentProfileLocation);
            this.t.fire(eventData);
        }
        async C(previousProfileLocation, currentProfileLocation, preserveExtensions) {
            const oldExtensions = await this.getInstalled(1 /* ExtensionType.User */, previousProfileLocation);
            const newExtensions = await this.getInstalled(1 /* ExtensionType.User */, currentProfileLocation);
            if (preserveExtensions?.length) {
                const extensionsToInstall = [];
                for (const extension of oldExtensions) {
                    if (preserveExtensions.some(id => extensions_1.$Vl.equals(extension.identifier.id, id)) &&
                        !newExtensions.some(e => extensions_1.$Vl.equals(e.identifier.id, extension.identifier.id))) {
                        extensionsToInstall.push(extension.identifier);
                    }
                }
                if (extensionsToInstall.length) {
                    await this.installExtensionsFromProfile(extensionsToInstall, previousProfileLocation, currentProfileLocation);
                }
            }
            return (0, arrays_1.$Cb)(oldExtensions, newExtensions, (a, b) => (0, strings_1.$Fe)(`${extensions_1.$Vl.toKey(a.identifier.id)}@${a.manifest.version}`, `${extensions_1.$Vl.toKey(b.identifier.id)}@${b.manifest.version}`));
        }
        async D(profileLocation) {
            return profileLocation ?? this.u.currentProfile.extensionsResource;
        }
    }
    exports.$Z3b = $Z3b;
});
//# sourceMappingURL=extensionManagementChannelClient.js.map