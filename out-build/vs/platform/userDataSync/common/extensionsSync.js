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
    exports.$Q2b = exports.$P2b = exports.$O2b = exports.$N2b = exports.$M2b = void 0;
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
                    if (builtinExtensions.every(installed => !(0, extensionManagementUtil_1.$po)(installed.identifier, extension.identifier))) {
                        extension.installed = true;
                    }
                }
                // #endregion
            }
        }
        return extensions;
    }
    function $M2b(syncData) {
        return JSON.parse(syncData.content);
    }
    exports.$M2b = $M2b;
    function $N2b(extensions, format) {
        extensions.sort((e1, e2) => {
            if (!e1.identifier.uuid && e2.identifier.uuid) {
                return -1;
            }
            if (e1.identifier.uuid && !e2.identifier.uuid) {
                return 1;
            }
            return (0, strings_1.$Fe)(e1.identifier.id, e2.identifier.id);
        });
        return format ? (0, jsonFormatter_1.$yS)(extensions, {}) : JSON.stringify(extensions);
    }
    exports.$N2b = $N2b;
    let $O2b = class $O2b extends abstractSynchronizer_1.$8Ab {
        constructor(
        // profileLocation changes for default profile
        profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, Cb, Db, logService, configurationService, userDataSyncEnablementService, telemetryService, extensionStorageService, uriIdentityService, userDataProfileStorageService, Eb) {
            super({ syncResource: "extensions" /* SyncResource.Extensions */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.Cb = Cb;
            this.Db = Db;
            this.Eb = Eb;
            /*
                Version 3 - Introduce installed property to skip installing built in extensions
                protected readonly version: number = 3;
            */
            /* Version 4: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
            /* Version 5: Introduce extension state */
            /* Version 6: Added isApplicationScoped property */
            this.pb = 6;
            this.wb = this.h.joinPath(this.g, 'extensions.json');
            this.xb = this.wb.with({ scheme: userDataSync_1.$Wgb, authority: 'base' });
            this.yb = this.wb.with({ scheme: userDataSync_1.$Wgb, authority: 'local' });
            this.zb = this.wb.with({ scheme: userDataSync_1.$Wgb, authority: 'remote' });
            this.Ab = this.wb.with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' });
            this.Bb = this.Eb.createInstance($P2b);
            this.B(event_1.Event.any(event_1.Event.filter(this.Cb.onDidInstallExtensions, (e => e.some(({ local }) => !!local))), event_1.Event.filter(this.Cb.onDidUninstallExtension, (e => !e.error)), event_1.Event.filter(userDataProfileStorageService.onDidChange, e => e.valueChanges.some(({ profile, changes }) => this.syncResource.profile.id === profile.id && changes.some(change => change.key === extensionManagement_1.$3n))), extensionStorageService.onDidChangeExtensionStorageToSync)(() => this.Q()));
        }
        async qb(remoteUserData, lastSyncUserData) {
            const remoteExtensions = remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.Cb) : null;
            const skippedExtensions = lastSyncUserData?.skippedExtensions ?? [];
            const builtinExtensions = lastSyncUserData?.builtinExtensions ?? null;
            const lastSyncExtensions = lastSyncUserData?.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.Cb) : null;
            const { localExtensions, ignoredExtensions } = await this.Bb.getLocalExtensions(this.syncResource.profile);
            if (remoteExtensions) {
                this.O.trace(`${this.D}: Merging remote extensions with local extensions...`);
            }
            else {
                this.O.trace(`${this.D}: Remote extensions does not exist. Synchronizing extensions for the first time.`);
            }
            const { local, remote } = (0, extensionsMerge_1.$L2b)(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, builtinExtensions);
            const previewResult = {
                local, remote,
                content: this.Hb(localExtensions, local.added, local.updated, local.removed),
                localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
            const localContent = this.Ob(localExtensions, false);
            return [{
                    skippedExtensions,
                    builtinExtensions,
                    baseResource: this.xb,
                    baseContent: lastSyncExtensions ? this.Ob(lastSyncExtensions, false) : localContent,
                    localResource: this.yb,
                    localContent,
                    localExtensions,
                    remoteResource: this.zb,
                    remoteExtensions,
                    remoteContent: remoteExtensions ? this.Ob(remoteExtensions, false) : null,
                    previewResource: this.wb,
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.Ab,
                }];
        }
        async ub(lastSyncUserData) {
            const lastSyncExtensions = lastSyncUserData.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.Cb) : null;
            const { localExtensions, ignoredExtensions } = await this.Bb.getLocalExtensions(this.syncResource.profile);
            const { remote } = (0, extensionsMerge_1.$L2b)(localExtensions, lastSyncExtensions, lastSyncExtensions, lastSyncUserData.skippedExtensions || [], ignoredExtensions, lastSyncUserData.builtinExtensions || []);
            return remote !== null;
        }
        Hb(localExtensions, added, updated, removed) {
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
            return this.Ob(preview, false);
        }
        async rb(resourcePreview, token) {
            return { ...resourcePreview.previewResult, hasConflicts: false };
        }
        async sb(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.h.isEqual(resource, this.yb)) {
                return this.Kb(resourcePreview);
            }
            /* Accept remote resource */
            if (this.h.isEqual(resource, this.zb)) {
                return this.Lb(resourcePreview);
            }
            /* Accept preview resource */
            if (this.h.isEqual(resource, this.wb)) {
                return resourcePreview.previewResult;
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async Kb(resourcePreview) {
            const installedExtensions = await this.Cb.getInstalled(undefined, this.syncResource.profile.extensionsResource);
            const ignoredExtensions = this.Db.getIgnoredExtensions(installedExtensions);
            const mergeResult = (0, extensionsMerge_1.$L2b)(resourcePreview.localExtensions, null, null, resourcePreview.skippedExtensions, ignoredExtensions, resourcePreview.builtinExtensions);
            const { local, remote } = mergeResult;
            return {
                content: resourcePreview.localContent,
                local,
                remote,
                localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
        }
        async Lb(resourcePreview) {
            const installedExtensions = await this.Cb.getInstalled(undefined, this.syncResource.profile.extensionsResource);
            const ignoredExtensions = this.Db.getIgnoredExtensions(installedExtensions);
            const remoteExtensions = resourcePreview.remoteContent ? JSON.parse(resourcePreview.remoteContent) : null;
            if (remoteExtensions !== null) {
                const mergeResult = (0, extensionsMerge_1.$L2b)(resourcePreview.localExtensions, remoteExtensions, resourcePreview.localExtensions, [], ignoredExtensions, resourcePreview.builtinExtensions);
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
        async tb(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            let { skippedExtensions, builtinExtensions, localExtensions } = resourcePreviews[0][0];
            const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.O.info(`${this.D}: No changes found during synchronizing extensions.`);
            }
            if (localChange !== 0 /* Change.None */) {
                await this.nb(JSON.stringify(localExtensions));
                skippedExtensions = await this.Bb.updateLocalExtensions(local.added, local.removed, local.updated, skippedExtensions, this.syncResource.profile);
            }
            if (remote) {
                // update remote
                this.O.trace(`${this.D}: Updating remote extensions...`);
                const content = JSON.stringify(remote.all);
                remoteUserData = await this.mb(content, force ? null : remoteUserData.ref);
                this.O.info(`${this.D}: Updated remote extensions.${remote.added.length ? ` Added: ${JSON.stringify(remote.added.map(e => e.identifier.id))}.` : ''}${remote.updated.length ? ` Updated: ${JSON.stringify(remote.updated.map(e => e.identifier.id))}.` : ''}${remote.removed.length ? ` Removed: ${JSON.stringify(remote.removed.map(e => e.identifier.id))}.` : ''}`);
            }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                // update last sync
                this.O.trace(`${this.D}: Updating last synchronized extensions...`);
                builtinExtensions = this.Nb(localExtensions, builtinExtensions);
                await this.fb(remoteUserData, { skippedExtensions, builtinExtensions });
                this.O.info(`${this.D}: Updated last synchronized extensions.${skippedExtensions.length ? ` Skipped: ${JSON.stringify(skippedExtensions.map(e => e.identifier.id))}.` : ''}`);
            }
        }
        Nb(localExtensions, previousBuiltinExtensions) {
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
            if (this.h.isEqual(this.zb, uri)
                || this.h.isEqual(this.xb, uri)
                || this.h.isEqual(this.yb, uri)
                || this.h.isEqual(this.Ab, uri)) {
                const content = await this.db(uri);
                return content ? this.Ob(JSON.parse(content), true) : content;
            }
            return null;
        }
        Ob(extensions, format) {
            return $N2b(extensions, format);
        }
        async hasLocalData() {
            try {
                const { localExtensions } = await this.Bb.getLocalExtensions(this.syncResource.profile);
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
    exports.$O2b = $O2b;
    exports.$O2b = $O2b = __decorate([
        __param(2, environment_1.$Ih),
        __param(3, files_1.$6j),
        __param(4, storage_1.$Vo),
        __param(5, userDataSync_1.$Fgb),
        __param(6, userDataSync_1.$Ggb),
        __param(7, extensionManagement_1.$2n),
        __param(8, ignoredExtensions_1.$PBb),
        __param(9, userDataSync_1.$Ugb),
        __param(10, configuration_1.$8h),
        __param(11, userDataSync_1.$Pgb),
        __param(12, telemetry_1.$9k),
        __param(13, extensionStorage_1.$Tz),
        __param(14, uriIdentity_1.$Ck),
        __param(15, userDataProfileStorageService_1.$eAb),
        __param(16, instantiation_1.$Ah)
    ], $O2b);
    let $P2b = class $P2b {
        constructor(a, b, c, d, f, g) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
        }
        async getLocalExtensions(profile) {
            const installedExtensions = await this.a.getInstalled(undefined, profile.extensionsResource);
            const ignoredExtensions = this.d.getIgnoredExtensions(installedExtensions);
            const localExtensions = await this.j(profile, async (extensionEnablementService, extensionStorageService) => {
                const disabledExtensions = extensionEnablementService.getDisabledExtensions();
                return installedExtensions
                    .map(extension => {
                    const { identifier, isBuiltin, manifest, preRelease, pinned, isApplicationScoped } = extension;
                    const syncExntesion = { identifier, preRelease, version: manifest.version, pinned: !!pinned };
                    if (isApplicationScoped && !(0, extensions_1.$Yl)(manifest)) {
                        syncExntesion.isApplicationScoped = isApplicationScoped;
                    }
                    if (disabledExtensions.some(disabledExtension => (0, extensionManagementUtil_1.$po)(disabledExtension, identifier))) {
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
                        this.g.info(`${(0, abstractSynchronizer_1.$7Ab)("extensions" /* SyncResource.Extensions */, profile)}: Error while parsing extension state`, (0, errors_1.$8)(error));
                    }
                    return syncExntesion;
                });
            });
            return { localExtensions, ignoredExtensions };
        }
        async updateLocalExtensions(added, removed, updated, skippedExtensions, profile) {
            const syncResourceLogLabel = (0, abstractSynchronizer_1.$7Ab)("extensions" /* SyncResource.Extensions */, profile);
            const extensionsToInstall = [];
            const syncExtensionsToInstall = new Map();
            const removeFromSkipped = [];
            const addToSkipped = [];
            const installedExtensions = await this.a.getInstalled(undefined, profile.extensionsResource);
            // 1. Sync extensions state first so that the storage is flushed and updated in all opened windows
            if (added.length || updated.length) {
                await this.j(profile, async (extensionEnablementService, extensionStorageService) => {
                    await async_1.Promises.settled([...added, ...updated].map(async (e) => {
                        const installedExtension = installedExtensions.find(installed => (0, extensionManagementUtil_1.$po)(installed.identifier, e.identifier));
                        // Builtin Extension Sync: Enablement & State
                        if (installedExtension && installedExtension.isBuiltin) {
                            if (e.state && installedExtension.manifest.version === e.version) {
                                this.h(e.state, installedExtension, installedExtension.manifest.version, extensionStorageService);
                            }
                            const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => (0, extensionManagementUtil_1.$po)(disabledExtension, e.identifier));
                            if (isDisabled !== !!e.disabled) {
                                if (e.disabled) {
                                    this.g.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id);
                                    await extensionEnablementService.disableExtension(e.identifier);
                                    this.g.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id);
                                }
                                else {
                                    this.g.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id);
                                    await extensionEnablementService.enableExtension(e.identifier);
                                    this.g.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id);
                                }
                            }
                            removeFromSkipped.push(e.identifier);
                            return;
                        }
                        // User Extension Sync: Install/Update, Enablement & State
                        const version = e.pinned ? e.version : undefined;
                        const extension = (await this.c.getExtensions([{ ...e.identifier, version, preRelease: version ? undefined : e.preRelease }], cancellation_1.CancellationToken.None))[0];
                        /* Update extension state only if
                         *	extension is installed and version is same as synced version or
                         *	extension is not installed and installable
                         */
                        if (e.state &&
                            (installedExtension ? installedExtension.manifest.version === e.version /* Installed and remote has same version */
                                : !!extension /* Installable */)) {
                            this.h(e.state, installedExtension || extension, installedExtension?.manifest.version, extensionStorageService);
                        }
                        if (extension) {
                            try {
                                const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => (0, extensionManagementUtil_1.$po)(disabledExtension, e.identifier));
                                if (isDisabled !== !!e.disabled) {
                                    if (e.disabled) {
                                        this.g.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id, extension.version);
                                        await extensionEnablementService.disableExtension(extension.identifier);
                                        this.g.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id, extension.version);
                                    }
                                    else {
                                        this.g.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id, extension.version);
                                        await extensionEnablementService.enableExtension(extension.identifier);
                                        this.g.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id, extension.version);
                                    }
                                }
                                if (!installedExtension // Install if the extension does not exist
                                    || installedExtension.preRelease !== e.preRelease // Install if the extension pre-release preference has changed
                                    || installedExtension.pinned !== e.pinned // Install if the extension pinned preference has changed
                                    || (version && installedExtension.manifest.version !== version) // Install if the extension version has changed
                                ) {
                                    if (await this.a.canInstall(extension)) {
                                        extensionsToInstall.push({
                                            extension, options: {
                                                isMachineScoped: false /* set isMachineScoped value to prevent install and sync dialog in web */,
                                                donotIncludePackAndDependencies: true,
                                                installGivenVersion: e.pinned && !!e.version,
                                                installPreReleaseVersion: e.preRelease,
                                                profileLocation: profile.extensionsResource,
                                                isApplicationScoped: e.isApplicationScoped,
                                                context: { [extensionManagement_1.$Pn]: true, [extensionManagement_1.$Qn]: true }
                                            }
                                        });
                                        syncExtensionsToInstall.set(extension.identifier.id.toLowerCase(), e);
                                    }
                                    else {
                                        this.g.info(`${syncResourceLogLabel}: Skipped synchronizing extension because it cannot be installed.`, extension.displayName || extension.identifier.id);
                                        addToSkipped.push(e);
                                    }
                                }
                            }
                            catch (error) {
                                addToSkipped.push(e);
                                this.g.error(error);
                                this.g.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, extension.displayName || extension.identifier.id);
                            }
                        }
                        else {
                            addToSkipped.push(e);
                            this.g.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the extension is not found.`, e.identifier.id);
                        }
                    }));
                });
            }
            // 2. Next uninstall the removed extensions
            if (removed.length) {
                const extensionsToRemove = installedExtensions.filter(({ identifier, isBuiltin }) => !isBuiltin && removed.some(r => (0, extensionManagementUtil_1.$po)(identifier, r)));
                await async_1.Promises.settled(extensionsToRemove.map(async (extensionToRemove) => {
                    this.g.trace(`${syncResourceLogLabel}: Uninstalling local extension...`, extensionToRemove.identifier.id);
                    await this.a.uninstall(extensionToRemove, { donotIncludePack: true, donotCheckDependents: true, profileLocation: profile.extensionsResource });
                    this.g.info(`${syncResourceLogLabel}: Uninstalled local extension.`, extensionToRemove.identifier.id);
                    removeFromSkipped.push(extensionToRemove.identifier);
                }));
            }
            // 3. Install extensions at the end
            const results = await this.a.installGalleryExtensions(extensionsToInstall);
            for (const { identifier, local, error, source } of results) {
                const gallery = source;
                if (local) {
                    this.g.info(`${syncResourceLogLabel}: Installed extension.`, identifier.id, gallery.version);
                    removeFromSkipped.push(identifier);
                }
                else {
                    const e = syncExtensionsToInstall.get(identifier.id.toLowerCase());
                    if (e) {
                        addToSkipped.push(e);
                        this.g.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, gallery.displayName || gallery.identifier.id);
                    }
                    if (error instanceof extensionManagement_1.$1n && [extensionManagement_1.ExtensionManagementErrorCode.Incompatible, extensionManagement_1.ExtensionManagementErrorCode.IncompatibleTargetPlatform].includes(error.code)) {
                        this.g.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the compatible extension is not found.`, gallery.displayName || gallery.identifier.id);
                    }
                    else if (error) {
                        this.g.error(error);
                    }
                }
            }
            const newSkippedExtensions = [];
            for (const skippedExtension of skippedExtensions) {
                if (!removeFromSkipped.some(e => (0, extensionManagementUtil_1.$po)(e, skippedExtension.identifier))) {
                    newSkippedExtensions.push(skippedExtension);
                }
            }
            for (const skippedExtension of addToSkipped) {
                if (!newSkippedExtensions.some(e => (0, extensionManagementUtil_1.$po)(e.identifier, skippedExtension.identifier))) {
                    newSkippedExtensions.push(skippedExtension);
                }
            }
            return newSkippedExtensions;
        }
        h(state, extension, version, extensionStorageService) {
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
        async j(profile, fn) {
            return this.b.withProfileScopedStorageService(profile, async (storageService) => {
                const disposables = new lifecycle_1.$jc();
                const instantiationService = this.f.createChild(new serviceCollection_1.$zh([storage_1.$Vo, storageService]));
                const extensionEnablementService = disposables.add(instantiationService.createInstance(extensionEnablementService_1.$Czb));
                const extensionStorageService = disposables.add(instantiationService.createInstance(extensionStorage_1.$Uz));
                try {
                    return await fn(extensionEnablementService, extensionStorageService);
                }
                finally {
                    disposables.dispose();
                }
            });
        }
    };
    exports.$P2b = $P2b;
    exports.$P2b = $P2b = __decorate([
        __param(0, extensionManagement_1.$2n),
        __param(1, userDataProfileStorageService_1.$eAb),
        __param(2, extensionManagement_1.$Zn),
        __param(3, ignoredExtensions_1.$PBb),
        __param(4, instantiation_1.$Ah),
        __param(5, userDataSync_1.$Ugb)
    ], $P2b);
    let $Q2b = class $Q2b extends abstractSynchronizer_1.$$Ab {
        constructor(p, q, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super("extensions" /* SyncResource.Extensions */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
            this.p = p;
            this.q = q;
        }
        async t(remoteUserData) {
            return remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.p) : null;
        }
        u(remoteExtensions, localExtensions) {
            const installedExtensions = [];
            const newExtensions = [];
            const disabledExtensions = [];
            for (const extension of remoteExtensions) {
                if (this.q.hasToNeverSyncExtension(extension.identifier.id)) {
                    // Skip extension ignored to sync
                    continue;
                }
                const installedExtension = localExtensions.find(i => (0, extensionManagementUtil_1.$po)(i.identifier, extension.identifier));
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
    exports.$Q2b = $Q2b;
    exports.$Q2b = $Q2b = __decorate([
        __param(0, extensionManagement_1.$2n),
        __param(1, ignoredExtensions_1.$PBb),
        __param(2, files_1.$6j),
        __param(3, userDataProfile_1.$Ek),
        __param(4, environment_1.$Ih),
        __param(5, log_1.$5i),
        __param(6, storage_1.$Vo),
        __param(7, uriIdentity_1.$Ck)
    ], $Q2b);
});
//# sourceMappingURL=extensionsSync.js.map