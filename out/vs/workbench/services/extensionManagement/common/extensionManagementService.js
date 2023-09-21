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
define(["require", "exports", "vs/base/common/event", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/nls", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/download/common/download", "vs/base/common/arrays", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/async", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/base/common/errors", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, event_1, extensionManagement_1, extensionManagement_2, extensions_1, lifecycle_1, configuration_1, cancellation_1, extensionManagementUtil_1, nls_1, productService_1, network_1, download_1, arrays_1, dialogs_1, severity_1, userDataSync_1, async_1, workspaceTrust_1, extensionManifestPropertiesService_1, instantiation_1, commands_1, types_1, files_1, log_1, errors_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementService = void 0;
    let ExtensionManagementService = class ExtensionManagementService extends lifecycle_1.Disposable {
        constructor(extensionManagementServerService, extensionGalleryService, userDataProfileService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService) {
            super();
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionGalleryService = extensionGalleryService;
            this.userDataProfileService = userDataProfileService;
            this.configurationService = configurationService;
            this.productService = productService;
            this.downloadService = downloadService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.dialogService = dialogService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.fileService = fileService;
            this.logService = logService;
            this.instantiationService = instantiationService;
            this.servers = [];
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                this.servers.push(this.extensionManagementServerService.localExtensionManagementServer);
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                this.servers.push(this.extensionManagementServerService.remoteExtensionManagementServer);
            }
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                this.servers.push(this.extensionManagementServerService.webExtensionManagementServer);
            }
            this.onInstallExtension = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(event_1.Event.map(server.extensionManagementService.onInstallExtension, e => ({ ...e, server })))); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
            this.onDidInstallExtensions = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(server.extensionManagementService.onDidInstallExtensions)); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
            this.onUninstallExtension = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(event_1.Event.map(server.extensionManagementService.onUninstallExtension, e => ({ ...e, server })))); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
            this.onDidUninstallExtension = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(event_1.Event.map(server.extensionManagementService.onDidUninstallExtension, e => ({ ...e, server })))); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
            this.onDidUpdateExtensionMetadata = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(server.extensionManagementService.onDidUpdateExtensionMetadata)); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
            this.onDidChangeProfile = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(event_1.Event.map(server.extensionManagementService.onDidChangeProfile, e => ({ ...e, server })))); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
        }
        async getInstalled(type, profileLocation) {
            const result = await Promise.all(this.servers.map(({ extensionManagementService }) => extensionManagementService.getInstalled(type, profileLocation)));
            return (0, arrays_1.flatten)(result);
        }
        async uninstall(extension, options) {
            const server = this.getServer(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            if (this.servers.length > 1) {
                if ((0, extensions_1.isLanguagePackExtension)(extension.manifest)) {
                    return this.uninstallEverywhere(extension, options);
                }
                return this.uninstallInServer(extension, server, options);
            }
            return server.extensionManagementService.uninstall(extension, options);
        }
        async uninstallEverywhere(extension, options) {
            const server = this.getServer(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            const promise = server.extensionManagementService.uninstall(extension, options);
            const otherServers = this.servers.filter(s => s !== server);
            if (otherServers.length) {
                for (const otherServer of otherServers) {
                    const installed = await otherServer.extensionManagementService.getInstalled();
                    extension = installed.filter(i => !i.isBuiltin && (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, extension.identifier))[0];
                    if (extension) {
                        await otherServer.extensionManagementService.uninstall(extension, options);
                    }
                }
            }
            return promise;
        }
        async uninstallInServer(extension, server, options) {
            if (server === this.extensionManagementServerService.localExtensionManagementServer) {
                const installedExtensions = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getInstalled(1 /* ExtensionType.User */);
                const dependentNonUIExtensions = installedExtensions.filter(i => !this.extensionManifestPropertiesService.prefersExecuteOnUI(i.manifest)
                    && i.manifest.extensionDependencies && i.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier)));
                if (dependentNonUIExtensions.length) {
                    return Promise.reject(new Error(this.getDependentsErrorMessage(extension, dependentNonUIExtensions)));
                }
            }
            return server.extensionManagementService.uninstall(extension, options);
        }
        getDependentsErrorMessage(extension, dependents) {
            if (dependents.length === 1) {
                return (0, nls_1.localize)('singleDependentError', "Cannot uninstall extension '{0}'. Extension '{1}' depends on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
            }
            if (dependents.length === 2) {
                return (0, nls_1.localize)('twoDependentsError', "Cannot uninstall extension '{0}'. Extensions '{1}' and '{2}' depend on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            return (0, nls_1.localize)('multipleDependentsError', "Cannot uninstall extension '{0}'. Extensions '{1}', '{2}' and others depend on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
        }
        async reinstallFromGallery(extension) {
            const server = this.getServer(extension);
            if (server) {
                await this.checkForWorkspaceTrust(extension.manifest);
                return server.extensionManagementService.reinstallFromGallery(extension);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        updateMetadata(extension, metadata, profileLocation) {
            const server = this.getServer(extension);
            if (server) {
                return server.extensionManagementService.updateMetadata(extension, metadata, profileLocation);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        zip(extension) {
            const server = this.getServer(extension);
            if (server) {
                return server.extensionManagementService.zip(extension);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        unzip(zipLocation) {
            return async_1.Promises.settled(this.servers
                // Filter out web server
                .filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer)
                .map(({ extensionManagementService }) => extensionManagementService.unzip(zipLocation))).then(([extensionIdentifier]) => extensionIdentifier);
        }
        download(extension, operation, donotVerifySignature) {
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.download(extension, operation, donotVerifySignature);
            }
            throw new Error('Cannot download extension');
        }
        async install(vsix, options) {
            const manifest = await this.getManifest(vsix);
            return this.installVSIX(vsix, manifest, options);
        }
        async installVSIX(vsix, manifest, options) {
            const serversToInstall = this.getServersToInstall(manifest);
            if (serversToInstall?.length) {
                await this.checkForWorkspaceTrust(manifest);
                const [local] = await async_1.Promises.settled(serversToInstall.map(server => this.installVSIXInServer(vsix, server, options)));
                return local;
            }
            return Promise.reject('No Servers to Install');
        }
        getServersToInstall(manifest) {
            if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                if ((0, extensions_1.isLanguagePackExtension)(manifest)) {
                    // Install on both servers
                    return [this.extensionManagementServerService.localExtensionManagementServer, this.extensionManagementServerService.remoteExtensionManagementServer];
                }
                if (this.extensionManifestPropertiesService.prefersExecuteOnUI(manifest)) {
                    // Install only on local server
                    return [this.extensionManagementServerService.localExtensionManagementServer];
                }
                // Install only on remote server
                return [this.extensionManagementServerService.remoteExtensionManagementServer];
            }
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                return [this.extensionManagementServerService.localExtensionManagementServer];
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                return [this.extensionManagementServerService.remoteExtensionManagementServer];
            }
            return undefined;
        }
        async installFromLocation(location) {
            if (location.scheme === network_1.Schemas.file) {
                if (this.extensionManagementServerService.localExtensionManagementServer) {
                    return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.installFromLocation(location, this.userDataProfileService.currentProfile.extensionsResource);
                }
                throw new Error('Local extension management server is not found');
            }
            if (location.scheme === network_1.Schemas.vscodeRemote) {
                if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                    return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.installFromLocation(location, this.userDataProfileService.currentProfile.extensionsResource);
                }
                throw new Error('Remote extension management server is not found');
            }
            if (!this.extensionManagementServerService.webExtensionManagementServer) {
                throw new Error('Web extension management server is not found');
            }
            return this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.installFromLocation(location, this.userDataProfileService.currentProfile.extensionsResource);
        }
        installVSIXInServer(vsix, server, options) {
            return server.extensionManagementService.install(vsix, options);
        }
        getManifest(vsix) {
            if (vsix.scheme === network_1.Schemas.file && this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            if (vsix.scheme === network_1.Schemas.file && this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            if (vsix.scheme === network_1.Schemas.vscodeRemote && this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            return Promise.reject('No Servers');
        }
        async canInstall(gallery) {
            if (this.extensionManagementServerService.localExtensionManagementServer
                && await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.canInstall(gallery)) {
                return true;
            }
            const manifest = await this.extensionGalleryService.getManifest(gallery, cancellation_1.CancellationToken.None);
            if (!manifest) {
                return false;
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer
                && await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.canInstall(gallery)
                && this.extensionManifestPropertiesService.canExecuteOnWorkspace(manifest)) {
                return true;
            }
            if (this.extensionManagementServerService.webExtensionManagementServer
                && await this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.canInstall(gallery)
                && this.extensionManifestPropertiesService.canExecuteOnWeb(manifest)) {
                return true;
            }
            return false;
        }
        async updateFromGallery(gallery, extension, installOptions) {
            const server = this.getServer(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            const servers = [];
            // Update Language pack on local and remote servers
            if ((0, extensions_1.isLanguagePackExtension)(extension.manifest)) {
                servers.push(...this.servers.filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer));
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
                    const servers = await this.validateAndGetExtensionManagementServersToInstall(extension, options);
                    if (!options.isMachineScoped && this.isExtensionsSyncEnabled()) {
                        if (this.extensionManagementServerService.localExtensionManagementServer && !servers.includes(this.extensionManagementServerService.localExtensionManagementServer) && (await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.canInstall(extension))) {
                            servers.push(this.extensionManagementServerService.localExtensionManagementServer);
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
            const servers = await this.validateAndGetExtensionManagementServersToInstall(gallery, installOptions);
            if (!installOptions || (0, types_1.isUndefined)(installOptions.isMachineScoped)) {
                const isMachineScoped = await this.hasToFlagExtensionsMachineScoped([gallery]);
                installOptions = { ...(installOptions || {}), isMachineScoped };
            }
            if (!installOptions.isMachineScoped && this.isExtensionsSyncEnabled()) {
                if (this.extensionManagementServerService.localExtensionManagementServer && !servers.includes(this.extensionManagementServerService.localExtensionManagementServer) && (await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.canInstall(gallery))) {
                    servers.push(this.extensionManagementServerService.localExtensionManagementServer);
                }
            }
            return async_1.Promises.settled(servers.map(server => server.extensionManagementService.installFromGallery(gallery, installOptions))).then(([local]) => local);
        }
        async validateAndGetExtensionManagementServersToInstall(gallery, installOptions) {
            const manifest = await this.extensionGalleryService.getManifest(gallery, cancellation_1.CancellationToken.None);
            if (!manifest) {
                return Promise.reject((0, nls_1.localize)('Manifest is not found', "Installing Extension {0} failed: Manifest is not found.", gallery.displayName || gallery.name));
            }
            const servers = [];
            // Install Language pack on local and remote servers
            if ((0, extensions_1.isLanguagePackExtension)(manifest)) {
                servers.push(...this.servers.filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer));
            }
            else {
                const server = this.getExtensionManagementServerToInstall(manifest);
                if (server) {
                    servers.push(server);
                }
            }
            if (!servers.length) {
                const error = new Error((0, nls_1.localize)('cannot be installed', "Cannot install the '{0}' extension because it is not available in this setup.", gallery.displayName || gallery.name));
                error.name = extensionManagement_1.ExtensionManagementErrorCode.Unsupported;
                throw error;
            }
            if (!installOptions?.context?.[extensionManagement_1.EXTENSION_INSTALL_SYNC_CONTEXT]) {
                await this.checkForWorkspaceTrust(manifest);
            }
            if (!installOptions?.donotIncludePackAndDependencies) {
                await this.checkInstallingExtensionOnWeb(gallery, manifest);
            }
            return servers;
        }
        getExtensionManagementServerToInstall(manifest) {
            // Only local server
            if (this.servers.length === 1 && this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer;
            }
            const extensionKind = this.extensionManifestPropertiesService.getExtensionKind(manifest);
            for (const kind of extensionKind) {
                if (kind === 'ui' && this.extensionManagementServerService.localExtensionManagementServer) {
                    return this.extensionManagementServerService.localExtensionManagementServer;
                }
                if (kind === 'workspace' && this.extensionManagementServerService.remoteExtensionManagementServer) {
                    return this.extensionManagementServerService.remoteExtensionManagementServer;
                }
                if (kind === 'web' && this.extensionManagementServerService.webExtensionManagementServer) {
                    return this.extensionManagementServerService.webExtensionManagementServer;
                }
            }
            // Local server can accept any extension. So return local server if not compatible server found.
            return this.extensionManagementServerService.localExtensionManagementServer;
        }
        isExtensionsSyncEnabled() {
            return this.userDataSyncEnablementService.isEnabled() && this.userDataSyncEnablementService.isResourceEnabled("extensions" /* SyncResource.Extensions */);
        }
        async hasToFlagExtensionsMachineScoped(extensions) {
            if (this.isExtensionsSyncEnabled()) {
                const { result } = await this.dialogService.prompt({
                    type: severity_1.default.Info,
                    message: extensions.length === 1 ? (0, nls_1.localize)('install extension', "Install Extension") : (0, nls_1.localize)('install extensions', "Install Extensions"),
                    detail: extensions.length === 1
                        ? (0, nls_1.localize)('install single extension', "Would you like to install and synchronize '{0}' extension across your devices?", extensions[0].displayName)
                        : (0, nls_1.localize)('install multiple extensions', "Would you like to install and synchronize extensions across your devices?"),
                    buttons: [
                        {
                            label: (0, nls_1.localize)({ key: 'install', comment: ['&& denotes a mnemonic'] }, "&&Install"),
                            run: () => false
                        },
                        {
                            label: (0, nls_1.localize)({ key: 'install and do no sync', comment: ['&& denotes a mnemonic'] }, "Install (Do &&not sync)"),
                            run: () => true
                        }
                    ],
                    cancelButton: {
                        run: () => {
                            throw new errors_1.CancellationError();
                        }
                    }
                });
                return result;
            }
            return false;
        }
        getExtensionsControlManifest() {
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
            }
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                return this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
            }
            return Promise.resolve({ malicious: [], deprecated: {}, search: [] });
        }
        getServer(extension) {
            return this.extensionManagementServerService.getExtensionManagementServer(extension);
        }
        async checkForWorkspaceTrust(manifest) {
            if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(manifest) === false) {
                const trustState = await this.workspaceTrustRequestService.requestWorkspaceTrust({
                    message: (0, nls_1.localize)('extensionInstallWorkspaceTrustMessage', "Enabling this extension requires a trusted workspace."),
                    buttons: [
                        { label: (0, nls_1.localize)('extensionInstallWorkspaceTrustButton', "Trust Workspace & Install"), type: 'ContinueWithTrust' },
                        { label: (0, nls_1.localize)('extensionInstallWorkspaceTrustContinueButton', "Install"), type: 'ContinueWithoutTrust' },
                        { label: (0, nls_1.localize)('extensionInstallWorkspaceTrustManageButton', "Learn More"), type: 'Manage' }
                    ]
                });
                if (trustState === undefined) {
                    throw new errors_1.CancellationError();
                }
            }
        }
        async checkInstallingExtensionOnWeb(extension, manifest) {
            if (this.servers.length !== 1 || this.servers[0] !== this.extensionManagementServerService.webExtensionManagementServer) {
                return;
            }
            const nonWebExtensions = [];
            if (manifest.extensionPack?.length) {
                const extensions = await this.extensionGalleryService.getExtensions(manifest.extensionPack.map(id => ({ id })), cancellation_1.CancellationToken.None);
                for (const extension of extensions) {
                    if (!(await this.servers[0].extensionManagementService.canInstall(extension))) {
                        nonWebExtensions.push(extension);
                    }
                }
                if (nonWebExtensions.length && nonWebExtensions.length === extensions.length) {
                    throw new extensionManagement_1.ExtensionManagementError('Not supported in Web', extensionManagement_1.ExtensionManagementErrorCode.Unsupported);
                }
            }
            const productName = (0, nls_1.localize)('VS Code for Web', "{0} for the Web", this.productService.nameLong);
            const virtualWorkspaceSupport = this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(manifest);
            const virtualWorkspaceSupportReason = (0, extensions_1.getWorkspaceSupportTypeMessage)(manifest.capabilities?.virtualWorkspaces);
            const hasLimitedSupport = virtualWorkspaceSupport === 'limited' || !!virtualWorkspaceSupportReason;
            if (!nonWebExtensions.length && !hasLimitedSupport) {
                return;
            }
            const limitedSupportMessage = (0, nls_1.localize)('limited support', "'{0}' has limited functionality in {1}.", extension.displayName || extension.identifier.id, productName);
            let message;
            let buttons = [];
            let detail;
            const installAnywayButton = {
                label: (0, nls_1.localize)({ key: 'install anyways', comment: ['&& denotes a mnemonic'] }, "&&Install Anyway"),
                run: () => { }
            };
            const showExtensionsButton = {
                label: (0, nls_1.localize)({ key: 'showExtensions', comment: ['&& denotes a mnemonic'] }, "&&Show Extensions"),
                run: () => this.instantiationService.invokeFunction(accessor => accessor.get(commands_1.ICommandService).executeCommand('extension.open', extension.identifier.id, 'extensionPack'))
            };
            if (nonWebExtensions.length && hasLimitedSupport) {
                message = limitedSupportMessage;
                detail = `${virtualWorkspaceSupportReason ? `${virtualWorkspaceSupportReason}\n` : ''}${(0, nls_1.localize)('non web extensions detail', "Contains extensions which are not supported.")}`;
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
                message = (0, nls_1.localize)('non web extensions', "'{0}' contains extensions which are not supported in {1}.", extension.displayName || extension.identifier.id, productName);
                buttons = [
                    installAnywayButton,
                    showExtensionsButton
                ];
            }
            await this.dialogService.prompt({
                type: severity_1.default.Info,
                message,
                detail,
                buttons,
                cancelButton: {
                    run: () => { throw new errors_1.CancellationError(); }
                }
            });
        }
        getTargetPlatform() {
            if (!this._targetPlatformPromise) {
                this._targetPlatformPromise = (0, extensionManagementUtil_1.computeTargetPlatform)(this.fileService, this.logService);
            }
            return this._targetPlatformPromise;
        }
        async cleanUp() {
            await Promise.allSettled(this.servers.map(server => server.extensionManagementService.cleanUp()));
        }
        toggleAppliationScope(extension, fromProfileLocation) {
            const server = this.getServer(extension);
            if (server) {
                return server.extensionManagementService.toggleAppliationScope(extension, fromProfileLocation);
            }
            throw new Error('Not Supported');
        }
        copyExtensions(from, to) {
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                throw new Error('Not Supported');
            }
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.copyExtensions(from, to);
            }
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                return this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.copyExtensions(from, to);
            }
            return Promise.resolve();
        }
        registerParticipant() { throw new Error('Not Supported'); }
        installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) { throw new Error('Not Supported'); }
    };
    exports.ExtensionManagementService = ExtensionManagementService;
    exports.ExtensionManagementService = ExtensionManagementService = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, userDataProfile_1.IUserDataProfileService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, productService_1.IProductService),
        __param(5, download_1.IDownloadService),
        __param(6, userDataSync_1.IUserDataSyncEnablementService),
        __param(7, dialogs_1.IDialogService),
        __param(8, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(9, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(10, files_1.IFileService),
        __param(11, log_1.ILogService),
        __param(12, instantiation_1.IInstantiationService)
    ], ExtensionManagementService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vZXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0N6RixJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEyQixTQUFRLHNCQUFVO1FBYXpELFlBQ29DLGdDQUFzRixFQUMvRix1QkFBa0UsRUFDbkUsc0JBQWdFLEVBQ2xFLG9CQUE4RCxFQUNwRSxjQUFrRCxFQUNqRCxlQUFvRCxFQUN0Qyw2QkFBOEUsRUFDOUYsYUFBOEMsRUFDL0IsNEJBQTRFLEVBQ3RFLGtDQUF3RixFQUMvRyxXQUEwQyxFQUMzQyxVQUF3QyxFQUM5QixvQkFBNEQ7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFkOEMscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFtQztZQUM5RSw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ2xELDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDL0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDOUIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ3JCLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBZ0M7WUFDN0Usa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ2QsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUErQjtZQUNyRCx1Q0FBa0MsR0FBbEMsa0NBQWtDLENBQXFDO1lBQzlGLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQzFCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDYix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBZmpFLFlBQU8sR0FBaUMsRUFBRSxDQUFDO1lB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