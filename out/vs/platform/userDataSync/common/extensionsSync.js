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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/jsonFormatter", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/extensionsMerge", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataProfile/common/userDataProfileStorageService"], function (require, exports, async_1, cancellation_1, errors_1, event_1, jsonFormatter_1, lifecycle_1, strings_1, configuration_1, environment_1, extensionEnablementService_1, extensionManagement_1, extensionManagementUtil_1, extensionStorage_1, extensions_1, files_1, instantiation_1, serviceCollection_1, log_1, storage_1, telemetry_1, uriIdentity_1, userDataProfile_1, abstractSynchronizer_1, extensionsMerge_1, ignoredExtensions_1, userDataSync_1, userDataProfileStorageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractExtensionsInitializer = exports.LocalExtensionsProvider = exports.ExtensionsSynchroniser = exports.stringify = exports.parseExtensions = void 0;
    async function parseAndMigrateExtensions(syncData, extensionManagementService) {
        const extensions = JSON.parse(syncData.content);
        if (syncData.version === 1
            || syncData.version === 2) {
            const builtinExtensions = (await extensionManagementService.getInstalled(0 /* ExtensionType.System */)).filter(e => e.isBuiltin);
            for (const extension of extensions) {
                // #region Migration from v1 (enabled -> disabled)
                if (syncData.version === 1) {
                    if (extension.enabled === false) {
                        extension.disabled = true;
                    }
                    delete extension.enabled;
                }
                // #endregion
                // #region Migration from v2 (set installed property on extension)
                if (syncData.version === 2) {
                    if (builtinExtensions.every(installed => !(0, extensionManagementUtil_1.areSameExtensions)(installed.identifier, extension.identifier))) {
                        extension.installed = true;
                    }
                }
                // #endregion
            }
        }
        return extensions;
    }
    function parseExtensions(syncData) {
        return JSON.parse(syncData.content);
    }
    exports.parseExtensions = parseExtensions;
    function stringify(extensions, format) {
        extensions.sort((e1, e2) => {
            if (!e1.identifier.uuid && e2.identifier.uuid) {
                return -1;
            }
            if (e1.identifier.uuid && !e2.identifier.uuid) {
                return 1;
            }
            return (0, strings_1.compare)(e1.identifier.id, e2.identifier.id);
        });
        return format ? (0, jsonFormatter_1.toFormattedString)(extensions, {}) : JSON.stringify(extensions);
    }
    exports.stringify = stringify;
    let ExtensionsSynchroniser = class ExtensionsSynchroniser extends abstractSynchronizer_1.AbstractSynchroniser {
        constructor(
        // profileLocation changes for default profile
        profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, extensionManagementService, ignoredExtensionsManagementService, logService, configurationService, userDataSyncEnablementService, telemetryService, extensionStorageService, uriIdentityService, userDataProfileStorageService, instantiationService) {
            super({ syncResource: "extensions" /* SyncResource.Extensions */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.extensionManagementService = extensionManagementService;
            this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
            this.instantiationService = instantiationService;
            /*
                Version 3 - Introduce installed property to skip installing built in extensions
                protected readonly version: number = 3;
            */
            /* Version 4: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
            /* Version 5: Introduce extension state */
            /* Version 6: Added isApplicationScoped property */
            this.version = 6;
            this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'extensions.json');
            this.baseResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' });
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' });
            this.localExtensionsProvider = this.instantiationService.createInstance(LocalExtensionsProvider);
            this._register(event_1.Event.any(event_1.Event.filter(this.extensionManagementService.onDidInstallExtensions, (e => e.some(({ local }) => !!local))), event_1.Event.filter(this.extensionManagementService.onDidUninstallExtension, (e => !e.error)), event_1.Event.filter(userDataProfileStorageService.onDidChange, e => e.valueChanges.some(({ profile, changes }) => this.syncResource.profile.id === profile.id && changes.some(change => change.key === extensionManagement_1.DISABLED_EXTENSIONS_STORAGE_PATH))), extensionStorageService.onDidChangeExtensionStorageToSync)(() => this.triggerLocalChange()));
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData) {
            const remoteExtensions = remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.extensionManagementService) : null;
            const skippedExtensions = lastSyncUserData?.skippedExtensions ?? [];
            const builtinExtensions = lastSyncUserData?.builtinExtensions ?? null;
            const lastSyncExtensions = lastSyncUserData?.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.extensionManagementService) : null;
            const { localExtensions, ignoredExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
            if (remoteExtensions) {
                this.logService.trace(`${this.syncResourceLogLabel}: Merging remote extensions with local extensions...`);
            }
            else {
                this.logService.trace(`${this.syncResourceLogLabel}: Remote extensions does not exist. Synchronizing extensions for the first time.`);
            }
            const { local, remote } = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, builtinExtensions);
            const previewResult = {
                local, remote,
                content: this.getPreviewContent(localExtensions, local.added, local.updated, local.removed),
                localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
            const localContent = this.stringify(localExtensions, false);
            return [{
                    skippedExtensions,
                    builtinExtensions,
                    baseResource: this.baseResource,
                    baseContent: lastSyncExtensions ? this.stringify(lastSyncExtensions, false) : localContent,
                    localResource: this.localResource,
                    localContent,
                    localExtensions,
                    remoteResource: this.remoteResource,
                    remoteExtensions,
                    remoteContent: remoteExtensions ? this.stringify(remoteExtensions, false) : null,
                    previewResource: this.previewResource,
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.acceptedResource,
                }];
        }
        async hasRemoteChanged(lastSyncUserData) {
            const lastSyncExtensions = lastSyncUserData.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.extensionManagementService) : null;
            const { localExtensions, ignoredExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
            const { remote } = (0, extensionsMerge_1.merge)(localExtensions, lastSyncExtensions, lastSyncExtensions, lastSyncUserData.skippedExtensions || [], ignoredExtensions, lastSyncUserData.builtinExtensions || []);
            return remote !== null;
        }
        getPreviewContent(localExtensions, added, updated, removed) {
            const preview = [...added, ...updated];
            const idsOrUUIDs = new Set();
            const addIdentifier = (identifier) => {
                idsOrUUIDs.add(identifier.id.toLowerCase());
                if (identifier.uuid) {
                    idsOrUUIDs.add(identifier.uuid);
                }
            };
            preview.forEach(({ identifier }) => addIdentifier(identifier));
            removed.forEach(addIdentifier);
            for (const localExtension of localExtensions) {
                if (idsOrUUIDs.has(localExtension.identifier.id.toLowerCase()) || (localExtension.identifier.uuid && idsOrUUIDs.has(localExtension.identifier.uuid))) {
                    // skip
                    continue;
                }
                preview.push(localExtension);
            }
            return this.stringify(preview, false);
        }
        async getMergeResult(resourcePreview, token) {
            return { ...resourcePreview.previewResult, hasConflicts: false };
        }
        async getAcceptResult(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.extUri.isEqual(resource, this.localResource)) {
                return this.acceptLocal(resourcePreview);
            }
            /* Accept remote resource */
            if (this.extUri.isEqual(resource, this.remoteResource)) {
                return this.acceptRemote(resourcePreview);
            }
            /* Accept preview resource */
            if (this.extUri.isEqual(resource, this.previewResource)) {
                return resourcePreview.previewResult;
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async acceptLocal(resourcePreview) {
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, this.syncResource.profile.extensionsResource);
            const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
            const mergeResult = (0, extensionsMerge_1.merge)(resourcePreview.localExtensions, null, null, resourcePreview.skippedExtensions, ignoredExtensions, resourcePreview.builtinExtensions);
            const { local, remote } = mergeResult;
            return {
                content: resourcePreview.localContent,
                local,
                remote,
                localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
        }
        async acceptRemote(resourcePreview) {
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, this.syncResource.profile.extensionsResource);
            const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
            const remoteExtensions = resourcePreview.remoteContent ? JSON.parse(resourcePreview.remoteContent) : null;
            if (remoteExtensions !== null) {
                const mergeResult = (0, extensionsMerge_1.merge)(resourcePreview.localExtensions, remoteExtensions, resourcePreview.localExtensions, [], ignoredExtensions, resourcePreview.builtinExtensions);
                const { local, remote } = mergeResult;
                return {
                    content: resourcePreview.remoteContent,
                    local,
                    remote,
                    localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                    remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
                };
            }
            else {
                return {
                    content: resourcePreview.remoteContent,
                    local: { added: [], removed: [], updated: [] },
                    remote: null,
                    localChange: 0 /* Change.None */,
                    remoteChange: 0 /* Change.None */,
                };
            }
        }
        async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            let { skippedExtensions, builtinExtensions, localExtensions } = resourcePreviews[0][0];
            const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing extensions.`);
            }
            if (localChange !== 0 /* Change.None */) {
                await this.backupLocal(JSON.stringify(localExtensions));
                skippedExtensions = await this.localExtensionsProvider.updateLocalExtensions(local.added, local.removed, local.updated, skippedExtensions, this.syncResource.profile);
            }
            if (remote) {
                // update remote
                this.logService.trace(`${this.syncResourceLogLabel}: Updating remote extensions...`);
                const content = JSON.stringify(remote.all);
                remoteUserData = await this.updateRemoteUserData(content, force ? null : remoteUserData.ref);
                this.logService.info(`${this.syncResourceLogLabel}: Updated remote extensions.${remote.added.length ? ` Added: ${JSON.stringify(remote.added.map(e => e.identifier.id))}.` : ''}${remote.updated.length ? ` Updated: ${JSON.stringify(remote.updated.map(e => e.identifier.id))}.` : ''}${remote.removed.length ? ` Removed: ${JSON.stringify(remote.removed.map(e => e.identifier.id))}.` : ''}`);
            }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                // update last sync
                this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized extensions...`);
                builtinExtensions = this.computeBuiltinExtensions(localExtensions, builtinExtensions);
                await this.updateLastSyncUserData(remoteUserData, { skippedExtensions, builtinExtensions });
                this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized extensions.${skippedExtensions.length ? ` Skipped: ${JSON.stringify(skippedExtensions.map(e => e.identifier.id))}.` : ''}`);
            }
        }
        computeBuiltinExtensions(localExtensions, previousBuiltinExtensions) {
            const localExtensionsSet = new Set();
            const builtinExtensions = [];
            for (const localExtension of localExtensions) {
                localExtensionsSet.add(localExtension.identifier.id.toLowerCase());
                if (!localExtension.installed) {
                    builtinExtensions.push(localExtension.identifier);
                }
            }
            if (previousBuiltinExtensions) {
                for (const builtinExtension of previousBuiltinExtensions) {
                    // Add previous builtin extension if it does not exist in local extensions
                    if (!localExtensionsSet.has(builtinExtension.id.toLowerCase())) {
                        builtinExtensions.push(builtinExtension);
                    }
                }
            }
            return builtinExtensions;
        }
        async resolveContent(uri) {
            if (this.extUri.isEqual(this.remoteResource, uri)
                || this.extUri.isEqual(this.baseResource, uri)
                || this.extUri.isEqual(this.localResource, uri)
                || this.extUri.isEqual(this.acceptedResource, uri)) {
                const content = await this.resolvePreviewContent(uri);
                return content ? this.stringify(JSON.parse(content), true) : content;
            }
            return null;
        }
        stringify(extensions, format) {
            return stringify(extensions, format);
        }
        async hasLocalData() {
            try {
                const { localExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
                if (localExtensions.some(e => e.installed || e.disabled)) {
                    return true;
                }
            }
            catch (error) {
                /* ignore error */
            }
            return false;
        }
    };
    exports.ExtensionsSynchroniser = ExtensionsSynchroniser;
    exports.ExtensionsSynchroniser = ExtensionsSynchroniser = __decorate([
        __param(2, environment_1.IEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, storage_1.IStorageService),
        __param(5, userDataSync_1.IUserDataSyncStoreService),
        __param(6, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(7, extensionManagement_1.IExtensionManagementService),
        __param(8, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(9, userDataSync_1.IUserDataSyncLogService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, userDataSync_1.IUserDataSyncEnablementService),
        __param(12, telemetry_1.ITelemetryService),
        __param(13, extensionStorage_1.IExtensionStorageService),
        __param(14, uriIdentity_1.IUriIdentityService),
        __param(15, userDataProfileStorageService_1.IUserDataProfileStorageService),
        __param(16, instantiation_1.IInstantiationService)
    ], ExtensionsSynchroniser);
    let LocalExtensionsProvider = class LocalExtensionsProvider {
        constructor(extensionManagementService, userDataProfileStorageService, extensionGalleryService, ignoredExtensionsManagementService, instantiationService, logService) {
            this.extensionManagementService = extensionManagementService;
            this.userDataProfileStorageService = userDataProfileStorageService;
            this.extensionGalleryService = extensionGalleryService;
            this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
            this.instantiationService = instantiationService;
            this.logService = logService;
        }
        async getLocalExtensions(profile) {
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
            const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
            const localExtensions = await this.withProfileScopedServices(profile, async (extensionEnablementService, extensionStorageService) => {
                const disabledExtensions = extensionEnablementService.getDisabledExtensions();
                return installedExtensions
                    .map(extension => {
                    const { identifier, isBuiltin, manifest, preRelease, pinned, isApplicationScoped } = extension;
                    const syncExntesion = { identifier, preRelease, version: manifest.version, pinned: !!pinned };
                    if (isApplicationScoped && !(0, extensions_1.isApplicationScopedExtension)(manifest)) {
                        syncExntesion.isApplicationScoped = isApplicationScoped;
                    }
                    if (disabledExtensions.some(disabledExtension => (0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, identifier))) {
                        syncExntesion.disabled = true;
                    }
                    if (!isBuiltin) {
                        syncExntesion.installed = true;
                    }
                    try {
                        const keys = extensionStorageService.getKeysForSync({ id: identifier.id, version: manifest.version });
                        if (keys) {
                            const extensionStorageState = extensionStorageService.getExtensionState(extension, true) || {};
                            syncExntesion.state = Object.keys(extensionStorageState).reduce((state, key) => {
                                if (keys.includes(key)) {
                                    state[key] = extensionStorageState[key];
                                }
                                return state;
                            }, {});
                        }
                    }
                    catch (error) {
                        this.logService.info(`${(0, abstractSynchronizer_1.getSyncResourceLogLabel)("extensions" /* SyncResource.Extensions */, profile)}: Error while parsing extension state`, (0, errors_1.getErrorMessage)(error));
                    }
                    return syncExntesion;
                });
            });
            return { localExtensions, ignoredExtensions };
        }
        async updateLocalExtensions(added, removed, updated, skippedExtensions, profile) {
            const syncResourceLogLabel = (0, abstractSynchronizer_1.getSyncResourceLogLabel)("extensions" /* SyncResource.Extensions */, profile);
            const extensionsToInstall = [];
            const syncExtensionsToInstall = new Map();
            const removeFromSkipped = [];
            const addToSkipped = [];
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
            // 1. Sync extensions state first so that the storage is flushed and updated in all opened windows
            if (added.length || updated.length) {
                await this.withProfileScopedServices(profile, async (extensionEnablementService, extensionStorageService) => {
                    await async_1.Promises.settled([...added, ...updated].map(async (e) => {
                        const installedExtension = installedExtensions.find(installed => (0, extensionManagementUtil_1.areSameExtensions)(installed.identifier, e.identifier));
                        // Builtin Extension Sync: Enablement & State
                        if (installedExtension && installedExtension.isBuiltin) {
                            if (e.state && installedExtension.manifest.version === e.version) {
                                this.updateExtensionState(e.state, installedExtension, installedExtension.manifest.version, extensionStorageService);
                            }
                            const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => (0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, e.identifier));
                            if (isDisabled !== !!e.disabled) {
                                if (e.disabled) {
                                    this.logService.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id);
                                    await extensionEnablementService.disableExtension(e.identifier);
                                    this.logService.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id);
                                }
                                else {
                                    this.logService.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id);
                                    await extensionEnablementService.enableExtension(e.identifier);
                                    this.logService.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id);
                                }
                            }
                            removeFromSkipped.push(e.identifier);
                            return;
                        }
                        // User Extension Sync: Install/Update, Enablement & State
                        const version = e.pinned ? e.version : undefined;
                        const extension = (await this.extensionGalleryService.getExtensions([{ ...e.identifier, version, preRelease: version ? undefined : e.preRelease }], cancellation_1.CancellationToken.None))[0];
                        /* Update extension state only if
                         *	extension is installed and version is same as synced version or
                         *	extension is not installed and installable
                         */
                        if (e.state &&
                            (installedExtension ? installedExtension.manifest.version === e.version /* Installed and remote has same version */
                                : !!extension /* Installable */)) {
                            this.updateExtensionState(e.state, installedExtension || extension, installedExtension?.manifest.version, extensionStorageService);
                        }
                        if (extension) {
                            try {
                                const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => (0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, e.identifier));
                                if (isDisabled !== !!e.disabled) {
                                    if (e.disabled) {
                                        this.logService.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id, extension.version);
                                        await extensionEnablementService.disableExtension(extension.identifier);
                                        this.logService.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id, extension.version);
                                    }
                                    else {
                                        this.logService.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id, extension.version);
                                        await extensionEnablementService.enableExtension(extension.identifier);
                                        this.logService.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id, extension.version);
                                    }
                                }
                                if (!installedExtension // Install if the extension does not exist
                                    || installedExtension.preRelease !== e.preRelease // Install if the extension pre-release preference has changed
                                    || installedExtension.pinned !== e.pinned // Install if the extension pinned preference has changed
                                    || (version && installedExtension.manifest.version !== version) // Install if the extension version has changed
                                ) {
                                    if (await this.extensionManagementService.canInstall(extension)) {
                                        extensionsToInstall.push({
                                            extension, options: {
                                                isMachineScoped: false /* set isMachineScoped value to prevent install and sync dialog in web */,
                                                donotIncludePackAndDependencies: true,
                                                installGivenVersion: e.pinned && !!e.version,
                                                installPreReleaseVersion: e.preRelease,
                                                profileLocation: profile.extensionsResource,
                                                isApplicationScoped: e.isApplicationScoped,
                                                context: { [extensionManagement_1.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true, [extensionManagement_1.EXTENSION_INSTALL_SYNC_CONTEXT]: true }
                                            }
                                        });
                                        syncExtensionsToInstall.set(extension.identifier.id.toLowerCase(), e);
                                    }
                                    else {
                                        this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because it cannot be installed.`, extension.displayName || extension.identifier.id);
                                        addToSkipped.push(e);
                                    }
                                }
                            }
                            catch (error) {
                                addToSkipped.push(e);
                                this.logService.error(error);
                                this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, extension.displayName || extension.identifier.id);
                            }
                        }
                        else {
                            addToSkipped.push(e);
                            this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the extension is not found.`, e.identifier.id);
                        }
                    }));
                });
            }
            // 2. Next uninstall the removed extensions
            if (removed.length) {
                const extensionsToRemove = installedExtensions.filter(({ identifier, isBuiltin }) => !isBuiltin && removed.some(r => (0, extensionManagementUtil_1.areSameExtensions)(identifier, r)));
                await async_1.Promises.settled(extensionsToRemove.map(async (extensionToRemove) => {
                    this.logService.trace(`${syncResourceLogLabel}: Uninstalling local extension...`, extensionToRemove.identifier.id);
                    await this.extensionManagementService.uninstall(extensionToRemove, { donotIncludePack: true, donotCheckDependents: true, profileLocation: profile.extensionsResource });
                    this.logService.info(`${syncResourceLogLabel}: Uninstalled local extension.`, extensionToRemove.identifier.id);
                    removeFromSkipped.push(extensionToRemove.identifier);
                }));
            }
            // 3. Install extensions at the end
            const results = await this.extensionManagementService.installGalleryExtensions(extensionsToInstall);
            for (const { identifier, local, error, source } of results) {
                const gallery = source;
                if (local) {
                    this.logService.info(`${syncResourceLogLabel}: Installed extension.`, identifier.id, gallery.version);
                    removeFromSkipped.push(identifier);
                }
                else {
                    const e = syncExtensionsToInstall.get(identifier.id.toLowerCase());
                    if (e) {
                        addToSkipped.push(e);
                        this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, gallery.displayName || gallery.identifier.id);
                    }
                    if (error instanceof extensionManagement_1.ExtensionManagementError && [extensionManagement_1.ExtensionManagementErrorCode.Incompatible, extensionManagement_1.ExtensionManagementErrorCode.IncompatibleTargetPlatform].includes(error.code)) {
                        this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the compatible extension is not found.`, gallery.displayName || gallery.identifier.id);
                    }
                    else if (error) {
                        this.logService.error(error);
                    }
                }
            }
            const newSkippedExtensions = [];
            for (const skippedExtension of skippedExtensions) {
                if (!removeFromSkipped.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e, skippedExtension.identifier))) {
                    newSkippedExtensions.push(skippedExtension);
                }
            }
            for (const skippedExtension of addToSkipped) {
                if (!newSkippedExtensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, skippedExtension.identifier))) {
                    newSkippedExtensions.push(skippedExtension);
                }
            }
            return newSkippedExtensions;
        }
        updateExtensionState(state, extension, version, extensionStorageService) {
            const extensionState = extensionStorageService.getExtensionState(extension, true) || {};
            const keys = version ? extensionStorageService.getKeysForSync({ id: extension.identifier.id, version }) : undefined;
            if (keys) {
                keys.forEach(key => { extensionState[key] = state[key]; });
            }
            else {
                Object.keys(state).forEach(key => extensionState[key] = state[key]);
            }
            extensionStorageService.setExtensionState(extension, extensionState, true);
        }
        async withProfileScopedServices(profile, fn) {
            return this.userDataProfileStorageService.withProfileScopedStorageService(profile, async (storageService) => {
                const disposables = new lifecycle_1.DisposableStore();
                const instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([storage_1.IStorageService, storageService]));
                const extensionEnablementService = disposables.add(instantiationService.createInstance(extensionEnablementService_1.GlobalExtensionEnablementService));
                const extensionStorageService = disposables.add(instantiationService.createInstance(extensionStorage_1.ExtensionStorageService));
                try {
                    return await fn(extensionEnablementService, extensionStorageService);
                }
                finally {
                    disposables.dispose();
                }
            });
        }
    };
    exports.LocalExtensionsProvider = LocalExtensionsProvider;
    exports.LocalExtensionsProvider = LocalExtensionsProvider = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, userDataProfileStorageService_1.IUserDataProfileStorageService),
        __param(2, extensionManagement_1.IExtensionGalleryService),
        __param(3, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, userDataSync_1.IUserDataSyncLogService)
    ], LocalExtensionsProvider);
    let AbstractExtensionsInitializer = class AbstractExtensionsInitializer extends abstractSynchronizer_1.AbstractInitializer {
        constructor(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super("extensions" /* SyncResource.Extensions */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
            this.extensionManagementService = extensionManagementService;
            this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
        }
        async parseExtensions(remoteUserData) {
            return remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.extensionManagementService) : null;
        }
        generatePreview(remoteExtensions, localExtensions) {
            const installedExtensions = [];
            const newExtensions = [];
            const disabledExtensions = [];
            for (const extension of remoteExtensions) {
                if (this.ignoredExtensionsManagementService.hasToNeverSyncExtension(extension.identifier.id)) {
                    // Skip extension ignored to sync
                    continue;
                }
                const installedExtension = localExtensions.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, extension.identifier));
                if (installedExtension) {
                    installedExtensions.push(installedExtension);
                    if (extension.disabled) {
                        disabledExtensions.push(extension.identifier);
                    }
                }
                else if (extension.installed) {
                    newExtensions.push({ ...extension.identifier, preRelease: !!extension.preRelease });
                    if (extension.disabled) {
                        disabledExtensions.push(extension.identifier);
                    }
                }
            }
            return { installedExtensions, newExtensions, disabledExtensions, remoteExtensions };
        }
    };
    exports.AbstractExtensionsInitializer = AbstractExtensionsInitializer;
    exports.AbstractExtensionsInitializer = AbstractExtensionsInitializer = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(2, files_1.IFileService),
        __param(3, userDataProfile_1.IUserDataProfilesService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, log_1.ILogService),
        __param(6, storage_1.IStorageService),
        __param(7, uriIdentity_1.IUriIdentityService)
    ], AbstractExtensionsInitializer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1N5bmMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL2V4dGVuc2lvbnNTeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQStDaEcsS0FBSyxVQUFVLHlCQUF5QixDQUFDLFFBQW1CLEVBQUUsMEJBQXVEO1FBQ3BILE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELElBQUksUUFBUSxDQUFDLE9BQU8sS0FBSyxDQUFDO2VBQ3RCLFFBQVEsQ0FBQyxPQUFPLEtBQUssQ0FBQyxFQUN4QjtZQUNELE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxNQUFNLDBCQUEwQixDQUFDLFlBQVksOEJBQXNCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekgsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7Z0JBQ25DLGtEQUFrRDtnQkFDbEQsSUFBSSxRQUFRLENBQUMsT0FBTyxLQUFLLENBQUMsRUFBRTtvQkFDM0IsSUFBVSxTQUFVLENBQUMsT0FBTyxLQUFLLEtBQUssRUFBRTt3QkFDdkMsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7cUJBQzFCO29CQUNELE9BQWEsU0FBVSxDQUFDLE9BQU8sQ0FBQztpQkFDaEM7Z0JBQ0QsYUFBYTtnQkFFYixrRUFBa0U7Z0JBQ2xFLElBQUksUUFBUSxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUU7b0JBQzNCLElBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLDJDQUFpQixFQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLFVBQVUs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