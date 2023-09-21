/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/uri", "vs/base/common/uriIpc", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, event_1, lifecycle_1, objects_1, uri_1, uriIpc_1, extensionManagement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_o = exports.$$o = exports.$0o = void 0;
    function transformIncomingURI(uri, transformer) {
        return uri ? uri_1.URI.revive(transformer ? transformer.transformIncoming(uri) : uri) : undefined;
    }
    function transformOutgoingURI(uri, transformer) {
        return transformer ? transformer.transformOutgoingURI(uri) : uri;
    }
    function transformIncomingExtension(extension, transformer) {
        transformer = transformer ? transformer : uriIpc_1.$Cm;
        const manifest = extension.manifest;
        const transformed = (0, uriIpc_1.$Fm)({ ...extension, ...{ manifest: undefined } }, transformer);
        return { ...transformed, ...{ manifest } };
    }
    function transformIncomingOptions(options, transformer) {
        return options?.profileLocation ? (0, uriIpc_1.$Fm)(options, transformer ?? uriIpc_1.$Cm) : options;
    }
    function transformOutgoingExtension(extension, transformer) {
        return transformer ? (0, objects_1.$Xm)(extension, value => value instanceof uri_1.URI ? transformer.transformOutgoingURI(value) : undefined) : extension;
    }
    class $0o {
        constructor(a, b) {
            this.a = a;
            this.b = b;
            this.onInstallExtension = event_1.Event.buffer(a.onInstallExtension, true);
            this.onDidInstallExtensions = event_1.Event.buffer(a.onDidInstallExtensions, true);
            this.onUninstallExtension = event_1.Event.buffer(a.onUninstallExtension, true);
            this.onDidUninstallExtension = event_1.Event.buffer(a.onDidUninstallExtension, true);
            this.onDidUpdateExtensionMetadata = event_1.Event.buffer(a.onDidUpdateExtensionMetadata, true);
        }
        listen(context, event) {
            const uriTransformer = this.b(context);
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
            const uriTransformer = this.b(context);
            switch (command) {
                case 'zip': {
                    const extension = transformIncomingExtension(args[0], uriTransformer);
                    const uri = await this.a.zip(extension);
                    return transformOutgoingURI(uri, uriTransformer);
                }
                case 'unzip': {
                    return this.a.unzip(transformIncomingURI(args[0], uriTransformer));
                }
                case 'install': {
                    return this.a.install(transformIncomingURI(args[0], uriTransformer), transformIncomingOptions(args[1], uriTransformer));
                }
                case 'installFromLocation': {
                    return this.a.installFromLocation(transformIncomingURI(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
                }
                case 'installExtensionsFromProfile': {
                    return this.a.installExtensionsFromProfile(args[0], transformIncomingURI(args[1], uriTransformer), transformIncomingURI(args[2], uriTransformer));
                }
                case 'getManifest': {
                    return this.a.getManifest(transformIncomingURI(args[0], uriTransformer));
                }
                case 'getTargetPlatform': {
                    return this.a.getTargetPlatform();
                }
                case 'canInstall': {
                    return this.a.canInstall(args[0]);
                }
                case 'installFromGallery': {
                    return this.a.installFromGallery(args[0], transformIncomingOptions(args[1], uriTransformer));
                }
                case 'installGalleryExtensions': {
                    const arg = args[0];
                    return this.a.installGalleryExtensions(arg.map(({ extension, options }) => ({ extension, options: transformIncomingOptions(options, uriTransformer) ?? {} })));
                }
                case 'uninstall': {
                    return this.a.uninstall(transformIncomingExtension(args[0], uriTransformer), transformIncomingOptions(args[1], uriTransformer));
                }
                case 'reinstallFromGallery': {
                    return this.a.reinstallFromGallery(transformIncomingExtension(args[0], uriTransformer));
                }
                case 'getInstalled': {
                    const extensions = await this.a.getInstalled(args[0], transformIncomingURI(args[1], uriTransformer));
                    return extensions.map(e => transformOutgoingExtension(e, uriTransformer));
                }
                case 'toggleAppliationScope': {
                    const extension = await this.a.toggleAppliationScope(transformIncomingExtension(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
                    return transformOutgoingExtension(extension, uriTransformer);
                }
                case 'copyExtensions': {
                    return this.a.copyExtensions(transformIncomingURI(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
                }
                case 'updateMetadata': {
                    const e = await this.a.updateMetadata(transformIncomingExtension(args[0], uriTransformer), args[1], transformIncomingURI(args[2], uriTransformer));
                    return transformOutgoingExtension(e, uriTransformer);
                }
                case 'getExtensionsControlManifest': {
                    return this.a.getExtensionsControlManifest();
                }
                case 'download': {
                    return this.a.download(args[0], args[1], args[2]);
                }
                case 'cleanUp': {
                    return this.a.cleanUp();
                }
            }
            throw new Error('Invalid call');
        }
    }
    exports.$0o = $0o;
    class $$o extends lifecycle_1.$kc {
        get onInstallExtension() { return this.c.event; }
        get onDidInstallExtensions() { return this.f.event; }
        get onUninstallExtension() { return this.g.event; }
        get onDidUninstallExtension() { return this.h.event; }
        get onDidUpdateExtensionMetadata() { return this.j.event; }
        constructor(m) {
            super();
            this.m = m;
            this.c = this.B(new event_1.$fd());
            this.f = this.B(new event_1.$fd());
            this.g = this.B(new event_1.$fd());
            this.h = this.B(new event_1.$fd());
            this.j = this.B(new event_1.$fd());
            this.B(this.m.listen('onInstallExtension')(e => this.n(this.c, { ...e, source: this.r(e.source) ? uri_1.URI.revive(e.source) : e.source, profileLocation: uri_1.URI.revive(e.profileLocation) })));
            this.B(this.m.listen('onDidInstallExtensions')(results => this.n(this.f, results.map(e => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.r(e.source) ? uri_1.URI.revive(e.source) : e.source, profileLocation: uri_1.URI.revive(e.profileLocation) })))));
            this.B(this.m.listen('onUninstallExtension')(e => this.n(this.g, { ...e, profileLocation: uri_1.URI.revive(e.profileLocation) })));
            this.B(this.m.listen('onDidUninstallExtension')(e => this.n(this.h, { ...e, profileLocation: uri_1.URI.revive(e.profileLocation) })));
            this.B(this.m.listen('onDidUpdateExtensionMetadata')(e => this.j.fire(transformIncomingExtension(e, null))));
        }
        n(event, data) {
            event.fire(data);
        }
        r(thing) {
            if (!thing) {
                return false;
            }
            return typeof thing.path === 'string' &&
                typeof thing.scheme === 'string';
        }
        getTargetPlatform() {
            if (!this.s) {
                this.s = this.m.call('getTargetPlatform');
            }
            return this.s;
        }
        async canInstall(extension) {
            const currentTargetPlatform = await this.getTargetPlatform();
            return extension.allTargetPlatforms.some(targetPlatform => (0, extensionManagement_1.$Wn)(targetPlatform, extension.allTargetPlatforms, currentTargetPlatform));
        }
        zip(extension) {
            return Promise.resolve(this.m.call('zip', [extension]).then(result => uri_1.URI.revive(result)));
        }
        unzip(zipLocation) {
            return Promise.resolve(this.m.call('unzip', [zipLocation]));
        }
        install(vsix, options) {
            return Promise.resolve(this.m.call('install', [vsix, options])).then(local => transformIncomingExtension(local, null));
        }
        installFromLocation(location, profileLocation) {
            return Promise.resolve(this.m.call('installFromLocation', [location, profileLocation])).then(local => transformIncomingExtension(local, null));
        }
        async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
            const result = await this.m.call('installExtensionsFromProfile', [extensions, fromProfileLocation, toProfileLocation]);
            return result.map(local => transformIncomingExtension(local, null));
        }
        getManifest(vsix) {
            return Promise.resolve(this.m.call('getManifest', [vsix]));
        }
        installFromGallery(extension, installOptions) {
            return Promise.resolve(this.m.call('installFromGallery', [extension, installOptions])).then(local => transformIncomingExtension(local, null));
        }
        async installGalleryExtensions(extensions) {
            const results = await this.m.call('installGalleryExtensions', [extensions]);
            return results.map(e => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.r(e.source) ? uri_1.URI.revive(e.source) : e.source, profileLocation: uri_1.URI.revive(e.profileLocation) }));
        }
        uninstall(extension, options) {
            return Promise.resolve(this.m.call('uninstall', [extension, options]));
        }
        reinstallFromGallery(extension) {
            return Promise.resolve(this.m.call('reinstallFromGallery', [extension])).then(local => transformIncomingExtension(local, null));
        }
        getInstalled(type = null, extensionsProfileResource) {
            return Promise.resolve(this.m.call('getInstalled', [type, extensionsProfileResource]))
                .then(extensions => extensions.map(extension => transformIncomingExtension(extension, null)));
        }
        updateMetadata(local, metadata, extensionsProfileResource) {
            return Promise.resolve(this.m.call('updateMetadata', [local, metadata, extensionsProfileResource]))
                .then(extension => transformIncomingExtension(extension, null));
        }
        toggleAppliationScope(local, fromProfileLocation) {
            return this.m.call('toggleAppliationScope', [local, fromProfileLocation])
                .then(extension => transformIncomingExtension(extension, null));
        }
        copyExtensions(fromProfileLocation, toProfileLocation) {
            return this.m.call('copyExtensions', [fromProfileLocation, toProfileLocation]);
        }
        getExtensionsControlManifest() {
            return Promise.resolve(this.m.call('getExtensionsControlManifest'));
        }
        async download(extension, operation, donotVerifySignature) {
            const result = await this.m.call('download', [extension, operation, donotVerifySignature]);
            return uri_1.URI.revive(result);
        }
        async cleanUp() {
            return this.m.call('cleanUp');
        }
        registerParticipant() { throw new Error('Not Supported'); }
    }
    exports.$$o = $$o;
    class $_o {
        constructor(a) {
            this.a = a;
        }
        listen(context, event) {
            throw new Error('Invalid listen');
        }
        call(context, command, args) {
            switch (command) {
                case 'getConfigBasedTips': return this.a.getConfigBasedTips(uri_1.URI.revive(args[0]));
                case 'getImportantExecutableBasedTips': return this.a.getImportantExecutableBasedTips();
                case 'getOtherExecutableBasedTips': return this.a.getOtherExecutableBasedTips();
            }
            throw new Error('Invalid call');
        }
    }
    exports.$_o = $_o;
});
//# sourceMappingURL=extensionManagementIpc.js.map