/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/uri", "vs/base/common/uriIpc", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, event_1, lifecycle_1, objects_1, uri_1, uriIpc_1, extensionManagement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionTipsChannel = exports.ExtensionManagementChannelClient = exports.ExtensionManagementChannel = void 0;
    function transformIncomingURI(uri, transformer) {
        return uri ? uri_1.URI.revive(transformer ? transformer.transformIncoming(uri) : uri) : undefined;
    }
    function transformOutgoingURI(uri, transformer) {
        return transformer ? transformer.transformOutgoingURI(uri) : uri;
    }
    function transformIncomingExtension(extension, transformer) {
        transformer = transformer ? transformer : uriIpc_1.DefaultURITransformer;
        const manifest = extension.manifest;
        const transformed = (0, uriIpc_1.transformAndReviveIncomingURIs)({ ...extension, ...{ manifest: undefined } }, transformer);
        return { ...transformed, ...{ manifest } };
    }
    function transformIncomingOptions(options, transformer) {
        return options?.profileLocation ? (0, uriIpc_1.transformAndReviveIncomingURIs)(options, transformer ?? uriIpc_1.DefaultURITransformer) : options;
    }
    function transformOutgoingExtension(extension, transformer) {
        return transformer ? (0, objects_1.cloneAndChange)(extension, value => value instanceof uri_1.URI ? transformer.transformOutgoingURI(value) : undefined) : extension;
    }
    class ExtensionManagementChannel {
        constructor(service, getUriTransformer) {
            this.service = service;
            this.getUriTransformer = getUriTransformer;
            this.onInstallExtension = event_1.Event.buffer(service.onInstallExtension, true);
            this.onDidInstallExtensions = event_1.Event.buffer(service.onDidInstallExtensions, true);
            this.onUninstallExtension = event_1.Event.buffer(service.onUninstallExtension, true);
            this.onDidUninstallExtension = event_1.Event.buffer(service.onDidUninstallExtension, true);
            this.onDidUpdateExtensionMetadata = event_1.Event.buffer(service.onDidUpdateExtensionMetadata, true);
        }
        listen(context, event) {
            const uriTransformer = this.getUriTransformer(context);
            switch (event) {
                case 'onInstallExtension': {
                    return event_1.Event.map(this.onInstallExtension, e => {
                        return {
                            ...e,
                            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
                        };
                    });
                }
                case 'onDidInstallExtensions': {
                    return event_1.Event.map(this.onDidInstallExtensions, results => results.map(i => ({
                        ...i,
                        local: i.local ? transformOutgoingExtension(i.local, uriTransformer) : i.local,
                        profileLocation: i.profileLocation ? transformOutgoingURI(i.profileLocation, uriTransformer) : i.profileLocation
                    })));
                }
                case 'onUninstallExtension': {
                    return event_1.Event.map(this.onUninstallExtension, e => {
                        return {
                            ...e,
                            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
                        };
                    });
                }
                case 'onDidUninstallExtension': {
                    return event_1.Event.map(this.onDidUninstallExtension, e => {
                        return {
                            ...e,
                            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
                        };
                    });
                }
                case 'onDidUpdateExtensionMetadata': {
                    return event_1.Event.map(this.onDidUpdateExtensionMetadata, e => transformOutgoingExtension(e, uriTransformer));
                }
            }
            throw new Error('Invalid listen');
        }
        async call(context, command, args) {
            const uriTransformer = this.getUriTransformer(context);
            switch (command) {
                case 'zip': {
                    const extension = transformIncomingExtension(args[0], uriTransformer);
                    const uri = await this.service.zip(extension);
                    return transformOutgoingURI(uri, uriTransformer);
                }
                case 'unzip': {
                    return this.service.unzip(transformIncomingURI(args[0], uriTransformer));
                }
                case 'install': {
                    return this.service.install(transformIncomingURI(args[0], uriTransformer), transformIncomingOptions(args[1], uriTransformer));
                }
                case 'installFromLocation': {
                    return this.service.installFromLocation(transformIncomingURI(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
                }
                case 'installExtensionsFromProfile': {
                    return this.service.installExtensionsFromProfile(args[0], transformIncomingURI(args[1], uriTransformer), transformIncomingURI(args[2], uriTransformer));
                }
                case 'getManifest': {
                    return this.service.getManifest(transformIncomingURI(args[0], uriTransformer));
                }
                case 'getTargetPlatform': {
                    return this.service.getTargetPlatform();
                }
                case 'canInstall': {
                    return this.service.canInstall(args[0]);
                }
                case 'installFromGallery': {
                    return this.service.installFromGallery(args[0], transformIncomingOptions(args[1], uriTransformer));
                }
                case 'installGalleryExtensions': {
                    const arg = args[0];
                    return this.service.installGalleryExtensions(arg.map(({ extension, options }) => ({ extension, options: transformIncomingOptions(options, uriTransformer) ?? {} })));
                }
                case 'uninstall': {
                    return this.service.uninstall(transformIncomingExtension(args[0], uriTransformer), transformIncomingOptions(args[1], uriTransformer));
                }
                case 'reinstallFromGallery': {
                    return this.service.reinstallFromGallery(transformIncomingExtension(args[0], uriTransformer));
                }
                case 'getInstalled': {
                    const extensions = await this.service.getInstalled(args[0], transformIncomingURI(args[1], uriTransformer));
                    return extensions.map(e => transformOutgoingExtension(e, uriTransformer));
                }
                case 'toggleAppliationScope': {
                    const extension = await this.service.toggleAppliationScope(transformIncomingExtension(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
                    return transformOutgoingExtension(extension, uriTransformer);
                }
                case 'copyExtensions': {
                    return this.service.copyExtensions(transformIncomingURI(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
                }
                case 'updateMetadata': {
                    const e = await this.service.updateMetadata(transformIncomingExtension(args[0], uriTransformer), args[1], transformIncomingURI(args[2], uriTransformer));
                    return transformOutgoingExtension(e, uriTransformer);
                }
                case 'getExtensionsControlManifest': {
                    return this.service.getExtensionsControlManifest();
                }
                case 'download': {
                    return this.service.download(args[0], args[1], args[2]);
                }
                case 'cleanUp': {
                    return this.service.cleanUp();
                }
            }
            throw new Error('Invalid call');
        }
    }
    exports.ExtensionManagementChannel = ExtensionManagementChannel;
    class ExtensionManagementChannelClient extends lifecycle_1.Disposable {
        get onInstallExtension() { return this._onInstallExtension.event; }
        get onDidInstallExtensions() { return this._onDidInstallExtensions.event; }
        get onUninstallExtension() { return this._onUninstallExtension.event; }
        get onDidUninstallExtension() { return this._onDidUninstallExtension.event; }
        get onDidUpdateExtensionMetadata() { return this._onDidUpdateExtensionMetadata.event; }
        constructor(channel) {
            super();
            this.channel = channel;
            this._onInstallExtension = this._register(new event_1.Emitter());
            this._onDidInstallExtensions = this._register(new event_1.Emitter());
            this._onUninstallExtension = this._register(new event_1.Emitter());
            this._onDidUninstallExtension = this._register(new event_1.Emitter());
            this._onDidUpdateExtensionMetadata = this._register(new event_1.Emitter());
            this._register(this.channel.listen('onInstallExtension')(e => this.fireEvent(this._onInstallExtension, { ...e, source: this.isUriComponents(e.source) ? uri_1.URI.revive(e.source) : e.source, profileLocation: uri_1.URI.revive(e.profileLocation) })));
            this._register(this.channel.listen('onDidInstallExtensions')(results => this.fireEvent(this._onDidInstallExtensions, results.map(e => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.isUriComponents(e.source) ? uri_1.URI.revive(e.source) : e.source, profileLocation: uri_1.URI.revive(e.profileLocation) })))));
            this._register(this.channel.listen('onUninstallExtension')(e => this.fireEvent(this._onUninstallExtension, { ...e, profileLocation: uri_1.URI.revive(e.profileLocation) })));
            this._register(this.channel.listen('onDidUninstallExtension')(e => this.fireEvent(this._onDidUninstallExtension, { ...e, profileLocation: uri_1.URI.revive(e.profileLocation) })));
            this._register(this.channel.listen('onDidUpdateExtensionMetadata')(e => this._onDidUpdateExtensionMetadata.fire(transformIncomingExtension(e, null))));
        }
        fireEvent(event, data) {
            event.fire(data);
        }
        isUriComponents(thing) {
            if (!thing) {
                return false;
            }
            return typeof thing.path === 'string' &&
                typeof thing.scheme === 'string';
        }
        getTargetPlatform() {
            if (!this._targetPlatformPromise) {
                this._targetPlatformPromise = this.channel.call('getTargetPlatform');
            }
            return this._targetPlatformPromise;
        }
        async canInstall(extension) {
            const currentTargetPlatform = await this.getTargetPlatform();
            return extension.allTargetPlatforms.some(targetPlatform => (0, extensionManagement_1.isTargetPlatformCompatible)(targetPlatform, extension.allTargetPlatforms, currentTargetPlatform));
        }
        zip(extension) {
            return Promise.resolve(this.channel.call('zip', [extension]).then(result => uri_1.URI.revive(result)));
        }
        unzip(zipLocation) {
            return Promise.resolve(this.channel.call('unzip', [zipLocation]));
        }
        install(vsix, options) {
            return Promise.resolve(this.channel.call('install', [vsix, options])).then(local => transformIncomingExtension(local, null));
        }
        installFromLocation(location, profileLocation) {
            return Promise.resolve(this.channel.call('installFromLocation', [location, profileLocation])).then(local => transformIncomingExtension(local, null));
        }
        async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
            const result = await this.channel.call('installExtensionsFromProfile', [extensions, fromProfileLocation, toProfileLocation]);
            return result.map(local => transformIncomingExtension(local, null));
        }
        getManifest(vsix) {
            return Promise.resolve(this.channel.call('getManifest', [vsix]));
        }
        installFromGallery(extension, installOptions) {
            return Promise.resolve(this.channel.call('installFromGallery', [extension, installOptions])).then(local => transformIncomingExtension(local, null));
        }
        async installGalleryExtensions(extensions) {
            const results = await this.channel.call('installGalleryExtensions', [extensions]);
            return results.map(e => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.isUriComponents(e.source) ? uri_1.URI.revive(e.source) : e.source, profileLocation: uri_1.URI.revive(e.profileLocation) }));
        }
        uninstall(extension, options) {
            return Promise.resolve(this.channel.call('uninstall', [extension, options]));
        }
        reinstallFromGallery(extension) {
            return Promise.resolve(this.channel.call('reinstallFromGallery', [extension])).then(local => transformIncomingExtension(local, null));
        }
        getInstalled(type = null, extensionsProfileResource) {
            return Promise.resolve(this.channel.call('getInstalled', [type, extensionsProfileResource]))
                .then(extensions => extensions.map(extension => transformIncomingExtension(extension, null)));
        }
        updateMetadata(local, metadata, extensionsProfileResource) {
            return Promise.resolve(this.channel.call('updateMetadata', [local, metadata, extensionsProfileResource]))
                .then(extension => transformIncomingExtension(extension, null));
        }
        toggleAppliationScope(local, fromProfileLocation) {
            return this.channel.call('toggleAppliationScope', [local, fromProfileLocation])
                .then(extension => transformIncomingExtension(extension, null));
        }
        copyExtensions(fromProfileLocation, toProfileLocation) {
            return this.channel.call('copyExtensions', [fromProfileLocation, toProfileLocation]);
        }
        getExtensionsControlManifest() {
            return Promise.resolve(this.channel.call('getExtensionsControlManifest'));
        }
        async download(extension, operation, donotVerifySignature) {
            const result = await this.channel.call('download', [extension, operation, donotVerifySignature]);
            return uri_1.URI.revive(result);
        }
        async cleanUp() {
            return this.channel.call('cleanUp');
        }
        registerParticipant() { throw new Error('Not Supported'); }
    }
    exports.ExtensionManagementChannelClient = ExtensionManagementChannelClient;
    class ExtensionTipsChannel {
        constructor(service) {
            this.service = service;
        }
        listen(context, event) {
            throw new Error('Invalid listen');
        }
        call(context, command, args) {
            switch (command) {
                case 'getConfigBasedTips': return this.service.getConfigBasedTips(uri_1.URI.revive(args[0]));
                case 'getImportantExecutableBasedTips': return this.service.getImportantExecutableBasedTips();
                case 'getOtherExecutableBasedTips': return this.service.getOtherExecutableBasedTips();
            }
            throw new Error('Invalid call');
        }
    }
    exports.ExtensionTipsChannel = ExtensionTipsChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudElwYy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvY29tbW9uL2V4dGVuc2lvbk1hbmFnZW1lbnRJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLFNBQVMsb0JBQW9CLENBQUMsR0FBOEIsRUFBRSxXQUFtQztRQUNoRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUM3RixDQUFDO0lBRUQsU0FBUyxvQkFBb0IsQ0FBQyxHQUFRLEVBQUUsV0FBbUM7UUFDMUUsT0FBTyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ2xFLENBQUM7SUFFRCxTQUFTLDBCQUEwQixDQUFDLFNBQTBCLEVBQUUsV0FBbUM7UUFDbEcsV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyw4QkFBcUIsQ0FBQztRQUNoRSxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO1FBQ3BDLE1BQU0sV0FBVyxHQUFHLElBQUEsdUNBQThCLEVBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDOUcsT0FBTyxFQUFFLEdBQUcsV0FBVyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFFRCxTQUFTLHdC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