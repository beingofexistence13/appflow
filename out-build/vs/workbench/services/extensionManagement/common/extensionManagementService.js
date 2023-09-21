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
define(["require", "exports", "vs/base/common/event", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/nls!vs/workbench/services/extensionManagement/common/extensionManagementService", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/download/common/download", "vs/base/common/arrays", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/async", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/base/common/errors", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, event_1, extensionManagement_1, extensionManagement_2, extensions_1, lifecycle_1, configuration_1, cancellation_1, extensionManagementUtil_1, nls_1, productService_1, network_1, download_1, arrays_1, dialogs_1, severity_1, userDataSync_1, async_1, workspaceTrust_1, extensionManifestPropertiesService_1, instantiation_1, commands_1, types_1, files_1, log_1, errors_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$E4b = void 0;
    let $E4b = class $E4b extends lifecycle_1.$kc {
        constructor(b, c, f, g, h, j, m, n, r, t, u, w, y) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.a = [];
            if (this.b.localExtensionManagementServer) {
                this.a.push(this.b.localExtensionManagementServer);
            }
            if (this.b.remoteExtensionManagementServer) {
                this.a.push(this.b.remoteExtensionManagementServer);
            }
            if (this.b.webExtensionManagementServer) {
                this.a.push(this.b.webExtensionManagementServer);
            }
            this.onInstallExtension = this.B(this.a.reduce((emitter, server) => { this.B(emitter.add(event_1.Event.map(server.extensionManagementService.onInstallExtension, e => ({ ...e, server })))); return emitter; }, this.B(new event_1.$ld()))).event;
            this.onDidInstallExtensions = this.B(this.a.reduce((emitter, server) => { this.B(emitter.add(server.extensionManagementService.onDidInstallExtensions)); return emitter; }, this.B(new event_1.$ld()))).event;
            this.onUninstallExtension = this.B(this.a.reduce((emitter, server) => { this.B(emitter.add(event_1.Event.map(server.extensionManagementService.onUninstallExtension, e => ({ ...e, server })))); return emitter; }, this.B(new event_1.$ld()))).event;
            this.onDidUninstallExtension = this.B(this.a.reduce((emitter, server) => { this.B(emitter.add(event_1.Event.map(server.extensionManagementService.onDidUninstallExtension, e => ({ ...e, server })))); return emitter; }, this.B(new event_1.$ld()))).event;
            this.onDidUpdateExtensionMetadata = this.B(this.a.reduce((emitter, server) => { this.B(emitter.add(server.extensionManagementService.onDidUpdateExtensionMetadata)); return emitter; }, this.B(new event_1.$ld()))).event;
            this.onDidChangeProfile = this.B(this.a.reduce((emitter, server) => { this.B(emitter.add(event_1.Event.map(server.extensionManagementService.onDidChangeProfile, e => ({ ...e, server })))); return emitter; }, this.B(new event_1.$ld()))).event;
        }
        async getInstalled(type, profileLocation) {
            const result = await Promise.all(this.a.map(({ extensionManagementService }) => extensionManagementService.getInstalled(type, profileLocation)));
            return (0, arrays_1.$Pb)(result);
        }
        async uninstall(extension, options) {
            const server = this.M(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            if (this.a.length > 1) {
                if ((0, extensions_1.$Zl)(extension.manifest)) {
                    return this.z(extension, options);
                }
                return this.C(extension, server, options);
            }
            return server.extensionManagementService.uninstall(extension, options);
        }
        async z(extension, options) {
            const server = this.M(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            const promise = server.extensionManagementService.uninstall(extension, options);
            const otherServers = this.a.filter(s => s !== server);
            if (otherServers.length) {
                for (const otherServer of otherServers) {
                    const installed = await otherServer.extensionManagementService.getInstalled();
                    extension = installed.filter(i => !i.isBuiltin && (0, extensionManagementUtil_1.$po)(i.identifier, extension.identifier))[0];
                    if (extension) {
                        await otherServer.extensionManagementService.uninstall(extension, options);
                    }
                }
            }
            return promise;
        }
        async C(extension, server, options) {
            if (server === this.b.localExtensionManagementServer) {
                const installedExtensions = await this.b.remoteExtensionManagementServer.extensionManagementService.getInstalled(1 /* ExtensionType.User */);
                const dependentNonUIExtensions = installedExtensions.filter(i => !this.t.prefersExecuteOnUI(i.manifest)
                    && i.manifest.extensionDependencies && i.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.$po)({ id }, extension.identifier)));
                if (dependentNonUIExtensions.length) {
                    return Promise.reject(new Error(this.D(extension, dependentNonUIExtensions)));
                }
            }
            return server.extensionManagementService.uninstall(extension, options);
        }
        D(extension, dependents) {
            if (dependents.length === 1) {
                return (0, nls_1.localize)(0, null, extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
            }
            if (dependents.length === 2) {
                return (0, nls_1.localize)(1, null, extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            return (0, nls_1.localize)(2, null, extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
        }
        async reinstallFromGallery(extension) {
            const server = this.M(extension);
            if (server) {
                await this.N(extension.manifest);
                return server.extensionManagementService.reinstallFromGallery(extension);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        updateMetadata(extension, metadata, profileLocation) {
            const server = this.M(extension);
            if (server) {
                return server.extensionManagementService.updateMetadata(extension, metadata, profileLocation);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        zip(extension) {
            const server = this.M(extension);
            if (server) {
                return server.extensionManagementService.zip(extension);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        unzip(zipLocation) {
            return async_1.Promises.settled(this.a
                // Filter out web server
                .filter(server => server !== this.b.webExtensionManagementServer)
                .map(({ extensionManagementService }) => extensionManagementService.unzip(zipLocation))).then(([extensionIdentifier]) => extensionIdentifier);
        }
        download(extension, operation, donotVerifySignature) {
            if (this.b.localExtensionManagementServer) {
                return this.b.localExtensionManagementServer.extensionManagementService.download(extension, operation, donotVerifySignature);
            }
            throw new Error('Cannot download extension');
        }
        async install(vsix, options) {
            const manifest = await this.getManifest(vsix);
            return this.installVSIX(vsix, manifest, options);
        }
        async installVSIX(vsix, manifest, options) {
            const serversToInstall = this.F(manifest);
            if (serversToInstall?.length) {
                await this.N(manifest);
                const [local] = await async_1.Promises.settled(serversToInstall.map(server => this.G(vsix, server, options)));
                return local;
            }
            return Promise.reject('No Servers to Install');
        }
        F(manifest) {
            if (this.b.localExtensionManagementServer && this.b.remoteExtensionManagementServer) {
                if ((0, extensions_1.$Zl)(manifest)) {
                    // Install on both servers
                    return [this.b.localExtensionManagementServer, this.b.remoteExtensionManagementServer];
                }
                if (this.t.prefersExecuteOnUI(manifest)) {
                    // Install only on local server
                    return [this.b.localExtensionManagementServer];
                }
                // Install only on remote server
                return [this.b.remoteExtensionManagementServer];
            }
            if (this.b.localExtensionManagementServer) {
                return [this.b.localExtensionManagementServer];
            }
            if (this.b.remoteExtensionManagementServer) {
                return [this.b.remoteExtensionManagementServer];
            }
            return undefined;
        }
        async installFromLocation(location) {
            if (location.scheme === network_1.Schemas.file) {
                if (this.b.localExtensionManagementServer) {
                    return this.b.localExtensionManagementServer.extensionManagementService.installFromLocation(location, this.f.currentProfile.extensionsResource);
                }
                throw new Error('Local extension management server is not found');
            }
            if (location.scheme === network_1.Schemas.vscodeRemote) {
                if (this.b.remoteExtensionManagementServer) {
                    return this.b.remoteExtensionManagementServer.extensionManagementService.installFromLocation(location, this.f.currentProfile.extensionsResource);
                }
                throw new Error('Remote extension management server is not found');
            }
            if (!this.b.webExtensionManagementServer) {
                throw new Error('Web extension management server is not found');
            }
            return this.b.webExtensionManagementServer.extensionManagementService.installFromLocation(location, this.f.currentProfile.extensionsResource);
        }
        G(vsix, server, options) {
            return server.extensionManagementService.install(vsix, options);
        }
        getManifest(vsix) {
            if (vsix.scheme === network_1.Schemas.file && this.b.localExtensionManagementServer) {
                return this.b.localExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            if (vsix.scheme === network_1.Schemas.file && this.b.remoteExtensionManagementServer) {
                return this.b.remoteExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            if (vsix.scheme === network_1.Schemas.vscodeRemote && this.b.remoteExtensionManagementServer) {
                return this.b.remoteExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            return Promise.reject('No Servers');
        }
        async canInstall(gallery) {
            if (this.b.localExtensionManagementServer
                && await this.b.localExtensionManagementServer.extensionManagementService.canInstall(gallery)) {
                return true;
            }
            const manifest = await this.c.getManifest(gallery, cancellation_1.CancellationToken.None);
            if (!manifest) {
                return false;
            }
            if (this.b.remoteExtensionManagementServer
                && await this.b.remoteExtensionManagementServer.extensionManagementService.canInstall(gallery)
                && this.t.canExecuteOnWorkspace(manifest)) {
                return true;
            }
            if (this.b.webExtensionManagementServer
                && await this.b.webExtensionManagementServer.extensionManagementService.canInstall(gallery)
                && this.t.canExecuteOnWeb(manifest)) {
                return true;
            }
            return false;
        }
        async updateFromGallery(gallery, extension, installOptions) {
            const server = this.M(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            const servers = [];
            // Update Language pack on local and remote servers
            if ((0, extensions_1.$Zl)(extension.manifest)) {
                servers.push(...this.a.filter(server => server !== this.b.webExtensionManagementServer));
            }
            else {
                servers.push(server);
            }
            return async_1.Promises.settled(servers.map(server => server.extensionManagementService.installFromGallery(gallery, installOptions))).then(([local]) => local);
        }
        async installGalleryExtensions(extensions) {
            const results = new Map();
            const extensionsByServer = new Map();
            await Promise.all(extensions.map(async ({ extension, options }) => {
                try {
                    const servers = await this.H(extension, options);
                    if (!options.isMachineScoped && this.J()) {
                        if (this.b.localExtensionManagementServer && !servers.includes(this.b.localExtensionManagementServer) && (await this.b.localExtensionManagementServer.extensionManagementService.canInstall(extension))) {
                            servers.push(this.b.localExtensionManagementServer);
                        }
                    }
                    for (const server of servers) {
                        let exensions = extensionsByServer.get(server);
                        if (!exensions) {
                            extensionsByServer.set(server, exensions = []);
                        }
                        exensions.push({ extension, options });
                    }
                }
                catch (error) {
                    results.set(extension.identifier.id.toLowerCase(), { identifier: extension.identifier, source: extension, error, operation: 2 /* InstallOperation.Install */ });
                }
            }));
            await Promise.all([...extensionsByServer.entries()].map(async ([server, extensions]) => {
                const serverResults = await server.extensionManagementService.installGalleryExtensions(extensions);
                for (const result of serverResults) {
                    results.set(result.identifier.id.toLowerCase(), result);
                }
            }));
            return [...results.values()];
        }
        async installFromGallery(gallery, installOptions) {
            const servers = await this.H(gallery, installOptions);
            if (!installOptions || (0, types_1.$qf)(installOptions.isMachineScoped)) {
                const isMachineScoped = await this.L([gallery]);
                installOptions = { ...(installOptions || {}), isMachineScoped };
            }
            if (!installOptions.isMachineScoped && this.J()) {
                if (this.b.localExtensionManagementServer && !servers.includes(this.b.localExtensionManagementServer) && (await this.b.localExtensionManagementServer.extensionManagementService.canInstall(gallery))) {
                    servers.push(this.b.localExtensionManagementServer);
                }
            }
            return async_1.Promises.settled(servers.map(server => server.extensionManagementService.installFromGallery(gallery, installOptions))).then(([local]) => local);
        }
        async H(gallery, installOptions) {
            const manifest = await this.c.getManifest(gallery, cancellation_1.CancellationToken.None);
            if (!manifest) {
                return Promise.reject((0, nls_1.localize)(3, null, gallery.displayName || gallery.name));
            }
            const servers = [];
            // Install Language pack on local and remote servers
            if ((0, extensions_1.$Zl)(manifest)) {
                servers.push(...this.a.filter(server => server !== this.b.webExtensionManagementServer));
            }
            else {
                const server = this.I(manifest);
                if (server) {
                    servers.push(server);
                }
            }
            if (!servers.length) {
                const error = new Error((0, nls_1.localize)(4, null, gallery.displayName || gallery.name));
                error.name = extensionManagement_1.ExtensionManagementErrorCode.Unsupported;
                throw error;
            }
            if (!installOptions?.context?.[extensionManagement_1.$Qn]) {
                await this.N(manifest);
            }
            if (!installOptions?.donotIncludePackAndDependencies) {
                await this.O(gallery, manifest);
            }
            return servers;
        }
        I(manifest) {
            // Only local server
            if (this.a.length === 1 && this.b.localExtensionManagementServer) {
                return this.b.localExtensionManagementServer;
            }
            const extensionKind = this.t.getExtensionKind(manifest);
            for (const kind of extensionKind) {
                if (kind === 'ui' && this.b.localExtensionManagementServer) {
                    return this.b.localExtensionManagementServer;
                }
                if (kind === 'workspace' && this.b.remoteExtensionManagementServer) {
                    return this.b.remoteExtensionManagementServer;
                }
                if (kind === 'web' && this.b.webExtensionManagementServer) {
                    return this.b.webExtensionManagementServer;
                }
            }
            // Local server can accept any extension. So return local server if not compatible server found.
            return this.b.localExtensionManagementServer;
        }
        J() {
            return this.m.isEnabled() && this.m.isResourceEnabled("extensions" /* SyncResource.Extensions */);
        }
        async L(extensions) {
            if (this.J()) {
                const { result } = await this.n.prompt({
                    type: severity_1.default.Info,
                    message: extensions.length === 1 ? (0, nls_1.localize)(5, null) : (0, nls_1.localize)(6, null),
                    detail: extensions.length === 1
                        ? (0, nls_1.localize)(7, null, extensions[0].displayName)
                        : (0, nls_1.localize)(8, null),
                    buttons: [
                        {
                            label: (0, nls_1.localize)(9, null),
                            run: () => false
                        },
                        {
                            label: (0, nls_1.localize)(10, null),
                            run: () => true
                        }
                    ],
                    cancelButton: {
                        run: () => {
                            throw new errors_1.$3();
                        }
                    }
                });
                return result;
            }
            return false;
        }
        getExtensionsControlManifest() {
            if (this.b.localExtensionManagementServer) {
                return this.b.localExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
            }
            if (this.b.remoteExtensionManagementServer) {
                return this.b.remoteExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
            }
            if (this.b.webExtensionManagementServer) {
                return this.b.webExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
            }
            return Promise.resolve({ malicious: [], deprecated: {}, search: [] });
        }
        M(extension) {
            return this.b.getExtensionManagementServer(extension);
        }
        async N(manifest) {
            if (this.t.getExtensionUntrustedWorkspaceSupportType(manifest) === false) {
                const trustState = await this.r.requestWorkspaceTrust({
                    message: (0, nls_1.localize)(11, null),
                    buttons: [
                        { label: (0, nls_1.localize)(12, null), type: 'ContinueWithTrust' },
                        { label: (0, nls_1.localize)(13, null), type: 'ContinueWithoutTrust' },
                        { label: (0, nls_1.localize)(14, null), type: 'Manage' }
                    ]
                });
                if (trustState === undefined) {
                    throw new errors_1.$3();
                }
            }
        }
        async O(extension, manifest) {
            if (this.a.length !== 1 || this.a[0] !== this.b.webExtensionManagementServer) {
                return;
            }
            const nonWebExtensions = [];
            if (manifest.extensionPack?.length) {
                const extensions = await this.c.getExtensions(manifest.extensionPack.map(id => ({ id })), cancellation_1.CancellationToken.None);
                for (const extension of extensions) {
                    if (!(await this.a[0].extensionManagementService.canInstall(extension))) {
                        nonWebExtensions.push(extension);
                    }
                }
                if (nonWebExtensions.length && nonWebExtensions.length === extensions.length) {
                    throw new extensionManagement_1.$1n('Not supported in Web', extensionManagement_1.ExtensionManagementErrorCode.Unsupported);
                }
            }
            const productName = (0, nls_1.localize)(15, null, this.h.nameLong);
            const virtualWorkspaceSupport = this.t.getExtensionVirtualWorkspaceSupportType(manifest);
            const virtualWorkspaceSupportReason = (0, extensions_1.$Tl)(manifest.capabilities?.virtualWorkspaces);
            const hasLimitedSupport = virtualWorkspaceSupport === 'limited' || !!virtualWorkspaceSupportReason;
            if (!nonWebExtensions.length && !hasLimitedSupport) {
                return;
            }
            const limitedSupportMessage = (0, nls_1.localize)(16, null, extension.displayName || extension.identifier.id, productName);
            let message;
            let buttons = [];
            let detail;
            const installAnywayButton = {
                label: (0, nls_1.localize)(17, null),
                run: () => { }
            };
            const showExtensionsButton = {
                label: (0, nls_1.localize)(18, null),
                run: () => this.y.invokeFunction(accessor => accessor.get(commands_1.$Fr).executeCommand('extension.open', extension.identifier.id, 'extensionPack'))
            };
            if (nonWebExtensions.length && hasLimitedSupport) {
                message = limitedSupportMessage;
                detail = `${virtualWorkspaceSupportReason ? `${virtualWorkspaceSupportReason}\n` : ''}${(0, nls_1.localize)(19, null)}`;
                buttons = [
                    installAnywayButton,
                    showExtensionsButton
                ];
            }
            else if (hasLimitedSupport) {
                message = limitedSupportMessage;
                detail = virtualWorkspaceSupportReason || undefined;
                buttons = [installAnywayButton];
            }
            else {
                message = (0, nls_1.localize)(20, null, extension.displayName || extension.identifier.id, productName);
                buttons = [
                    installAnywayButton,
                    showExtensionsButton
                ];
            }
            await this.n.prompt({
                type: severity_1.default.Info,
                message,
                detail,
                buttons,
                cancelButton: {
                    run: () => { throw new errors_1.$3(); }
                }
            });
        }
        getTargetPlatform() {
            if (!this.P) {
                this.P = (0, extensionManagementUtil_1.$Ao)(this.u, this.w);
            }
            return this.P;
        }
        async cleanUp() {
            await Promise.allSettled(this.a.map(server => server.extensionManagementService.cleanUp()));
        }
        toggleAppliationScope(extension, fromProfileLocation) {
            const server = this.M(extension);
            if (server) {
                return server.extensionManagementService.toggleAppliationScope(extension, fromProfileLocation);
            }
            throw new Error('Not Supported');
        }
        copyExtensions(from, to) {
            if (this.b.remoteExtensionManagementServer) {
                throw new Error('Not Supported');
            }
            if (this.b.localExtensionManagementServer) {
                return this.b.localExtensionManagementServer.extensionManagementService.copyExtensions(from, to);
            }
            if (this.b.webExtensionManagementServer) {
                return this.b.webExtensionManagementServer.extensionManagementService.copyExtensions(from, to);
            }
            return Promise.resolve();
        }
        registerParticipant() { throw new Error('Not Supported'); }
        installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) { throw new Error('Not Supported'); }
    };
    exports.$E4b = $E4b;
    exports.$E4b = $E4b = __decorate([
        __param(0, extensionManagement_2.$fcb),
        __param(1, extensionManagement_1.$Zn),
        __param(2, userDataProfile_1.$CJ),
        __param(3, configuration_1.$8h),
        __param(4, productService_1.$kj),
        __param(5, download_1.$Dn),
        __param(6, userDataSync_1.$Pgb),
        __param(7, dialogs_1.$oA),
        __param(8, workspaceTrust_1.$_z),
        __param(9, extensionManifestPropertiesService_1.$vcb),
        __param(10, files_1.$6j),
        __param(11, log_1.$5i),
        __param(12, instantiation_1.$Ah)
    ], $E4b);
});
//# sourceMappingURL=extensionManagementService.js.map