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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/node/pfs", "vs/base/node/zip", "vs/nls!vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/download/common/download", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/abstractExtensionManagementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionDownloader", "vs/platform/extensionManagement/node/extensionLifecycle", "vs/platform/extensionManagement/node/extensionManagementUtil", "vs/platform/extensionManagement/node/extensionsManifestCache", "vs/platform/extensionManagement/node/extensionsWatcher", "vs/platform/extensions/common/extensionValidator", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, async_1, buffer_1, cancellation_1, errorMessage_1, errors_1, event_1, hash_1, lifecycle_1, map_1, network_1, path, resources_1, semver, types_1, uri_1, uuid_1, pfs, zip_1, nls, download_1, environment_1, abstractExtensionManagementService_1, extensionManagement_1, extensionManagementUtil_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionDownloader_1, extensionLifecycle_1, extensionManagementUtil_2, extensionsManifestCache_1, extensionsWatcher_1, extensionValidator_1, files_1, instantiation_1, log_1, productService_1, telemetry_1, uriIdentity_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Bp = exports.$Ap = exports.$zp = exports.$yp = void 0;
    exports.$yp = (0, instantiation_1.$Ch)(extensionManagement_1.$2n);
    const DELETED_FOLDER_POSTFIX = '.vsctmp';
    let $zp = class $zp extends abstractExtensionManagementService_1.$fp {
        constructor(galleryService, telemetryService, logService, environmentService, fb, gb, hb, instantiationService, ib, productService, uriIdentityService, userDataProfilesService) {
            super(galleryService, telemetryService, uriIdentityService, logService, productService, userDataProfilesService);
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.eb = new Map();
            this.rb = new map_1.$Ai();
            const extensionLifecycle = this.B(instantiationService.createInstance(extensionLifecycle_1.$up));
            this.bb = this.B(instantiationService.createInstance($Ap, extension => extensionLifecycle.postUninstall(extension)));
            this.cb = this.B(new extensionsManifestCache_1.$wp(userDataProfilesService, ib, uriIdentityService, this, this.F));
            this.db = this.B(instantiationService.createInstance(extensionDownloader_1.$tp));
            const extensionsWatcher = this.B(new extensionsWatcher_1.$xp(this, this.fb, userDataProfilesService, gb, uriIdentityService, ib, logService));
            this.B(extensionsWatcher.onDidChangeExtensionsByAnotherSource(e => this.qb(e)));
            this.sb();
        }
        getTargetPlatform() {
            if (!this.jb) {
                this.jb = (0, extensionManagementUtil_1.$Ao)(this.ib, this.F);
            }
            return this.jb;
        }
        async zip(extension) {
            this.F.trace('ExtensionManagementService#zip', extension.identifier.id);
            const files = await this.pb(extension);
            const location = await (0, zip_1.zip)((0, resources_1.$ig)(this.db.extensionsDownloadDir, (0, uuid_1.$4f)()).fsPath, files);
            return uri_1.URI.file(location);
        }
        async unzip(zipLocation) {
            this.F.trace('ExtensionManagementService#unzip', zipLocation.toString());
            const local = await this.install(zipLocation);
            return local.identifier;
        }
        async getManifest(vsix) {
            const { location, cleanup } = await this.lb(vsix);
            const zipPath = path.$0d(location.fsPath);
            try {
                return await (0, extensionManagementUtil_2.$vp)(zipPath);
            }
            finally {
                await cleanup();
            }
        }
        getInstalled(type, profileLocation = this.H.defaultProfile.extensionsResource) {
            return this.bb.scanExtensions(type ?? null, profileLocation);
        }
        scanAllUserInstalledExtensions() {
            return this.bb.scanAllUserExtensions(false);
        }
        scanInstalledExtensionAtLocation(location) {
            return this.bb.scanUserExtensionAtLocation(location);
        }
        async install(vsix, options = {}) {
            this.F.trace('ExtensionManagementService#install', vsix.toString());
            const { location, cleanup } = await this.lb(vsix);
            try {
                const manifest = await (0, extensionManagementUtil_2.$vp)(path.$0d(location.fsPath));
                const extensionId = (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name);
                if (manifest.engines && manifest.engines.vscode && !(0, extensionValidator_1.$Ho)(manifest.engines.vscode, this.G.version, this.G.date)) {
                    throw new Error(nls.localize(0, null, extensionId, this.G.version));
                }
                const results = await this.I([{ manifest, extension: location, options }]);
                const result = results.find(({ identifier }) => (0, extensionManagementUtil_1.$po)(identifier, { id: extensionId }));
                if (result?.local) {
                    return result.local;
                }
                if (result?.error) {
                    throw result.error;
                }
                throw (0, abstractExtensionManagementService_1.$hp)(new Error(`Unknown error while installing extension ${extensionId}`));
            }
            finally {
                await cleanup();
            }
        }
        async installFromLocation(location, profileLocation) {
            this.F.trace('ExtensionManagementService#installFromLocation', location.toString());
            const local = await this.bb.scanUserExtensionAtLocation(location);
            if (!local) {
                throw new Error(`Cannot find a valid extension from the location ${location.toString()}`);
            }
            await this.ub([[local, undefined]], profileLocation);
            this.F.info('Successfully installed extension', local.identifier.id, profileLocation.toString());
            return local;
        }
        async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
            this.F.trace('ExtensionManagementService#installExtensionsFromProfile', extensions, fromProfileLocation.toString(), toProfileLocation.toString());
            const extensionsToInstall = (await this.bb.scanExtensions(1 /* ExtensionType.User */, fromProfileLocation)).filter(e => extensions.some(id => (0, extensionManagementUtil_1.$po)(id, e.identifier)));
            if (extensionsToInstall.length) {
                const metadata = await Promise.all(extensionsToInstall.map(e => this.bb.scanMetadata(e, fromProfileLocation)));
                await this.ub(extensionsToInstall.map((e, index) => [e, metadata[index]]), toProfileLocation);
                this.F.info('Successfully installed extensions', extensionsToInstall.map(e => e.identifier.id), toProfileLocation.toString());
            }
            return extensionsToInstall;
        }
        async updateMetadata(local, metadata, profileLocation = this.H.defaultProfile.extensionsResource) {
            this.F.trace('ExtensionManagementService#updateMetadata', local.identifier.id);
            if (metadata.isPreReleaseVersion) {
                metadata.preRelease = true;
            }
            // unset if false
            metadata.isMachineScoped = metadata.isMachineScoped || undefined;
            metadata.isBuiltin = metadata.isBuiltin || undefined;
            metadata.pinned = metadata.pinned || undefined;
            local = await this.bb.updateMetadata(local, metadata, profileLocation);
            this.cb.invalidate(profileLocation);
            this.w.fire(local);
            return local;
        }
        async reinstallFromGallery(extension) {
            this.F.trace('ExtensionManagementService#reinstallFromGallery', extension.identifier.id);
            if (!this.z.isEnabled()) {
                throw new Error(nls.localize(1, null));
            }
            const targetPlatform = await this.getTargetPlatform();
            const [galleryExtension] = await this.z.getExtensions([{ ...extension.identifier, preRelease: extension.preRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None);
            if (!galleryExtension) {
                throw new Error(nls.localize(2, null));
            }
            await this.bb.setUninstalled(extension);
            try {
                await this.bb.removeUninstalledExtension(extension);
            }
            catch (e) {
                throw new Error(nls.localize(3, null, (0, errorMessage_1.$mi)(e)));
            }
            return this.installFromGallery(galleryExtension);
        }
        ab(extension, fromProfileLocation, toProfileLocation, metadata) {
            return this.bb.copyExtension(extension, fromProfileLocation, toProfileLocation, metadata);
        }
        copyExtensions(fromProfileLocation, toProfileLocation) {
            return this.bb.copyExtensions(fromProfileLocation, toProfileLocation);
        }
        markAsUninstalled(...extensions) {
            return this.bb.setUninstalled(...extensions);
        }
        async cleanUp() {
            this.F.trace('ExtensionManagementService#cleanUp');
            try {
                await this.bb.cleanUp();
            }
            catch (error) {
                this.F.error(error);
            }
        }
        async download(extension, operation, donotVerifySignature) {
            const { location } = await this.db.download(extension, operation, !donotVerifySignature);
            return location;
        }
        async lb(vsix) {
            if (vsix.scheme === network_1.Schemas.file) {
                return { location: vsix, async cleanup() { } };
            }
            this.F.trace('Downloading extension from', vsix.toString());
            const location = (0, resources_1.$ig)(this.db.extensionsDownloadDir, (0, uuid_1.$4f)());
            await this.hb.download(vsix, location);
            this.F.info('Downloaded extension to', location.toString());
            const cleanup = async () => {
                try {
                    await this.ib.del(location);
                }
                catch (error) {
                    this.F.error(error);
                }
            };
            return { location, cleanup };
        }
        Y() {
            return this.H.defaultProfile.extensionsResource;
        }
        Z(manifest, extension, options) {
            if (uri_1.URI.isUri(extension)) {
                return new InstallVSIXTask(manifest, extension, options, this.z, this.bb, this.D, this.H, this.fb, this.gb, this.F);
            }
            const key = extensionManagementUtil_1.$qo.create(extension).toString();
            let installExtensionTask = this.eb.get(key);
            if (!installExtensionTask) {
                this.eb.set(key, installExtensionTask = new $Bp(manifest, extension, options, this.db, this.bb, this.D, this.H, this.fb, this.gb, this.F));
                installExtensionTask.waitUntilTaskIsFinished().finally(() => this.eb.delete(key));
            }
            return installExtensionTask;
        }
        $(extension, options) {
            return new UninstallExtensionTask(extension, options.profileLocation, this.gb);
        }
        async pb(extension) {
            const collectFilesFromDirectory = async (dir) => {
                let entries = await pfs.Promises.readdir(dir);
                entries = entries.map(e => path.$9d(dir, e));
                const stats = await Promise.all(entries.map(e => pfs.Promises.stat(e)));
                let promise = Promise.resolve([]);
                stats.forEach((stat, index) => {
                    const entry = entries[index];
                    if (stat.isFile()) {
                        promise = promise.then(result => ([...result, entry]));
                    }
                    if (stat.isDirectory()) {
                        promise = promise
                            .then(result => collectFilesFromDirectory(entry)
                            .then(files => ([...result, ...files])));
                    }
                });
                return promise;
            };
            const files = await collectFilesFromDirectory(extension.location.fsPath);
            return files.map(f => ({ path: `extension/${path.$$d(extension.location.fsPath, f)}`, localPath: f }));
        }
        async qb({ added, removed }) {
            if (removed) {
                for (const identifier of removed.extensions) {
                    this.F.info('Extensions removed from another source', identifier.id, removed.profileLocation.toString());
                    this.u.fire({ identifier, profileLocation: removed.profileLocation });
                }
            }
            if (added) {
                const extensions = await this.bb.scanExtensions(1 /* ExtensionType.User */, added.profileLocation);
                const addedExtensions = extensions.filter(e => added.extensions.some(identifier => (0, extensionManagementUtil_1.$po)(identifier, e.identifier)));
                this.s.fire(addedExtensions.map(local => {
                    this.F.info('Extensions added from another source', local.identifier.id, added.profileLocation.toString());
                    return { identifier: local.identifier, local, profileLocation: added.profileLocation, operation: 1 /* InstallOperation.None */ };
                }));
            }
        }
        async sb() {
            this.B(this.bb.onExtract(resource => this.rb.add(resource)));
            const stat = await this.ib.resolve(this.fb.userExtensionsLocation);
            for (const childStat of stat.children ?? []) {
                if (childStat.isDirectory) {
                    this.rb.add(childStat.resource);
                }
            }
            this.B(this.ib.watch(this.fb.userExtensionsLocation));
            this.B(this.ib.onDidFilesChange(e => this.tb(e)));
        }
        async tb(e) {
            if (!e.affects(this.fb.userExtensionsLocation, 1 /* FileChangeType.ADDED */)) {
                return;
            }
            const added = [];
            for (const resource of e.rawAdded) {
                // Check if this is a known directory
                if (this.rb.has(resource)) {
                    continue;
                }
                // Is not immediate child of extensions resource
                if (!this.D.extUri.isEqual(this.D.extUri.dirname(resource), this.fb.userExtensionsLocation)) {
                    continue;
                }
                // .obsolete file changed
                if (this.D.extUri.isEqual(resource, this.D.extUri.joinPath(this.fb.userExtensionsLocation, '.obsolete'))) {
                    continue;
                }
                // Ignore changes to files starting with `.`
                if (this.D.extUri.basename(resource).startsWith('.')) {
                    continue;
                }
                // Check if this is a directory
                if (!(await this.ib.stat(resource)).isDirectory) {
                    continue;
                }
                // Check if this is an extension added by another source
                // Extension added by another source will not have installed timestamp
                const extension = await this.bb.scanUserExtensionAtLocation(resource);
                if (extension && extension.installedTimestamp === undefined) {
                    this.rb.add(resource);
                    added.push(extension);
                }
            }
            if (added.length) {
                await this.ub(added.map(e => [e, undefined]), this.H.defaultProfile.extensionsResource);
                this.F.info('Added extensions to default profile from external source', added.map(e => e.identifier.id));
            }
        }
        async ub(extensions, profileLocation) {
            const localExtensions = extensions.map(e => e[0]);
            await this.vb(localExtensions);
            await this.gb.addExtensionsToProfile(extensions, profileLocation);
            this.s.fire(localExtensions.map(local => ({ local, identifier: local.identifier, operation: 1 /* InstallOperation.None */, profileLocation })));
        }
        async vb(extensions) {
            const uninstalled = await this.bb.getUninstalledExtensions();
            for (const extension of extensions) {
                const extensionKey = extensionManagementUtil_1.$qo.create(extension);
                if (!uninstalled[extensionKey.toString()]) {
                    continue;
                }
                this.F.trace('Removing the extension from uninstalled list:', extensionKey.id);
                await this.bb.setInstalled(extensionKey);
                this.F.info('Removed the extension from uninstalled list:', extensionKey.id);
            }
        }
    };
    exports.$zp = $zp;
    exports.$zp = $zp = __decorate([
        __param(0, extensionManagement_1.$Zn),
        __param(1, telemetry_1.$9k),
        __param(2, log_1.$5i),
        __param(3, environment_1.$Jh),
        __param(4, extensionsScannerService_1.$op),
        __param(5, extensionsProfileScannerService_1.$kp),
        __param(6, download_1.$Dn),
        __param(7, instantiation_1.$Ah),
        __param(8, files_1.$6j),
        __param(9, productService_1.$kj),
        __param(10, uriIdentity_1.$Ck),
        __param(11, userDataProfile_1.$Ek)
    ], $zp);
    let $Ap = class $Ap extends lifecycle_1.$kc {
        constructor(j, m, n, s, t, u) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.s = s;
            this.t = t;
            this.u = u;
            this.h = this.B(new event_1.$fd());
            this.onExtract = this.h.event;
            this.c = (0, resources_1.$ig)(this.n.userExtensionsLocation, '.obsolete');
            this.g = new async_1.$Ng();
        }
        async cleanUp() {
            await this.H();
            await this.G();
        }
        async scanExtensions(type, profileLocation) {
            const userScanOptions = { includeInvalid: true, profileLocation };
            let scannedExtensions = [];
            if (type === null || type === 0 /* ExtensionType.System */) {
                scannedExtensions.push(...await this.n.scanAllExtensions({ includeInvalid: true }, userScanOptions, false));
            }
            else if (type === 1 /* ExtensionType.User */) {
                scannedExtensions.push(...await this.n.scanUserExtensions(userScanOptions));
            }
            scannedExtensions = type !== null ? scannedExtensions.filter(r => r.type === type) : scannedExtensions;
            return Promise.all(scannedExtensions.map(extension => this.F(extension)));
        }
        async scanAllUserExtensions(excludeOutdated) {
            const scannedExtensions = await this.n.scanUserExtensions({ includeAllVersions: !excludeOutdated, includeInvalid: true });
            return Promise.all(scannedExtensions.map(extension => this.F(extension)));
        }
        async scanUserExtensionAtLocation(location) {
            try {
                const scannedExtension = await this.n.scanExistingExtension(location, 1 /* ExtensionType.User */, { includeInvalid: true });
                if (scannedExtension) {
                    return await this.F(scannedExtension);
                }
            }
            catch (error) {
                this.u.error(error);
            }
            return null;
        }
        async extractUserExtension(extensionKey, zipPath, metadata, removeIfExists, token) {
            const folderName = extensionKey.toString();
            const tempLocation = uri_1.URI.file(path.$9d(this.n.userExtensionsLocation.fsPath, `.${(0, uuid_1.$4f)()}`));
            const extensionLocation = uri_1.URI.file(path.$9d(this.n.userExtensionsLocation.fsPath, folderName));
            let exists = await this.m.exists(extensionLocation);
            if (exists && removeIfExists) {
                try {
                    await this.y(extensionKey.id, extensionLocation, 'removeExisting');
                }
                catch (error) {
                    throw new extensionManagement_1.$1n(nls.localize(4, null, extensionLocation.fsPath, extensionKey.id), extensionManagement_1.ExtensionManagementErrorCode.Delete);
                }
                exists = false;
            }
            if (!exists) {
                try {
                    // Extract
                    try {
                        this.u.trace(`Started extracting the extension from ${zipPath} to ${extensionLocation.fsPath}`);
                        await (0, zip_1.$dp)(zipPath, tempLocation.fsPath, { sourcePath: 'extension', overwrite: true }, token);
                        this.u.info(`Extracted extension to ${extensionLocation}:`, extensionKey.id);
                    }
                    catch (e) {
                        let errorCode = extensionManagement_1.ExtensionManagementErrorCode.Extract;
                        if (e instanceof zip_1.$bp) {
                            if (e.type === 'CorruptZip') {
                                errorCode = extensionManagement_1.ExtensionManagementErrorCode.CorruptZip;
                            }
                            else if (e.type === 'Incomplete') {
                                errorCode = extensionManagement_1.ExtensionManagementErrorCode.IncompleteZip;
                            }
                        }
                        throw new extensionManagement_1.$1n(e.message, errorCode);
                    }
                    await this.n.updateMetadata(tempLocation, metadata);
                    // Rename
                    try {
                        this.u.trace(`Started renaming the extension from ${tempLocation.fsPath} to ${extensionLocation.fsPath}`);
                        await this.C(tempLocation.fsPath, extensionLocation.fsPath);
                        this.u.info('Renamed to', extensionLocation.fsPath);
                    }
                    catch (error) {
                        if (error.code === 'ENOTEMPTY') {
                            this.u.info(`Rename failed because extension was installed by another source. So ignoring renaming.`, extensionKey.id);
                        }
                        else {
                            this.u.info(`Rename failed because of ${(0, errors_1.$8)(error)}. Deleted from extracted location`, tempLocation);
                            throw error;
                        }
                    }
                    this.h.fire(extensionLocation);
                }
                catch (error) {
                    try {
                        await this.m.del(tempLocation, { recursive: true });
                    }
                    catch (e) { /* ignore */ }
                    throw error;
                }
            }
            return this.D(extensionLocation, 1 /* ExtensionType.User */);
        }
        async scanMetadata(local, profileLocation) {
            if (profileLocation) {
                const extension = await this.w(local, profileLocation);
                return extension?.metadata;
            }
            else {
                return this.n.scanMetadata(local.location);
            }
        }
        async w(local, profileLocation) {
            const extensions = await this.s.scanProfileExtensions(profileLocation);
            return extensions.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, local.identifier));
        }
        async updateMetadata(local, metadata, profileLocation) {
            if (profileLocation) {
                await this.s.updateMetadata([[local, metadata]], profileLocation);
            }
            else {
                await this.n.updateMetadata(local.location, metadata);
            }
            return this.D(local.location, local.type, profileLocation);
        }
        getUninstalledExtensions() {
            return this.z();
        }
        async setUninstalled(...extensions) {
            const extensionKeys = extensions.map(e => extensionManagementUtil_1.$qo.create(e));
            await this.z(uninstalled => extensionKeys.forEach(extensionKey => {
                uninstalled[extensionKey.toString()] = true;
                this.u.info('Marked extension as uninstalled', extensionKey.toString());
            }));
        }
        async setInstalled(extensionKey) {
            await this.z(uninstalled => delete uninstalled[extensionKey.toString()]);
        }
        async removeExtension(extension, type) {
            if (this.t.extUri.isEqualOrParent(extension.location, this.n.userExtensionsLocation)) {
                return this.y(extension.identifier.id, extension.location, type);
            }
        }
        async removeUninstalledExtension(extension) {
            await this.removeExtension(extension, 'uninstalled');
            await this.z(uninstalled => delete uninstalled[extensionManagementUtil_1.$qo.create(extension).toString()]);
        }
        async copyExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
            const source = await this.w(extension, fromProfileLocation);
            const target = await this.w(extension, toProfileLocation);
            metadata = { ...source?.metadata, ...metadata };
            if (target) {
                await this.s.updateMetadata([[extension, { ...target.metadata, ...metadata }]], toProfileLocation);
            }
            else {
                await this.s.addExtensionsToProfile([[extension, metadata]], toProfileLocation);
            }
            return this.D(extension.location, extension.type, toProfileLocation);
        }
        async copyExtensions(fromProfileLocation, toProfileLocation) {
            const fromExtensions = await this.scanExtensions(1 /* ExtensionType.User */, fromProfileLocation);
            const extensions = await Promise.all(fromExtensions
                .filter(e => !e.isApplicationScoped) /* remove application scoped extensions */
                .map(async (e) => ([e, await this.scanMetadata(e, fromProfileLocation)])));
            await this.s.addExtensionsToProfile(extensions, toProfileLocation);
        }
        async y(id, location, type) {
            this.u.trace(`Deleting ${type} extension from disk`, id, location.fsPath);
            const renamedLocation = this.t.extUri.joinPath(this.t.extUri.dirname(location), `${this.t.extUri.basename(location)}.${(0, hash_1.$pi)((0, uuid_1.$4f)()).toString(16)}${DELETED_FOLDER_POSTFIX}`);
            await this.C(location.fsPath, renamedLocation.fsPath);
            await this.m.del(renamedLocation, { recursive: true });
            this.u.info(`Deleted ${type} extension from disk`, id, location.fsPath);
        }
        async z(updateFn) {
            return this.g.queue(async () => {
                let raw;
                try {
                    const content = await this.m.readFile(this.c, 'utf8');
                    raw = content.value.toString();
                }
                catch (error) {
                    if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        throw error;
                    }
                }
                let uninstalled = {};
                if (raw) {
                    try {
                        uninstalled = JSON.parse(raw);
                    }
                    catch (e) { /* ignore */ }
                }
                if (updateFn) {
                    updateFn(uninstalled);
                    if (Object.keys(uninstalled).length) {
                        await this.m.writeFile(this.c, buffer_1.$Fd.fromString(JSON.stringify(uninstalled)));
                    }
                    else {
                        await this.m.del(this.c);
                    }
                }
                return uninstalled;
            });
        }
        async C(extractPath, renamePath) {
            try {
                await pfs.Promises.rename(extractPath, renamePath, 2 * 60 * 1000 /* Retry for 2 minutes */);
            }
            catch (error) {
                throw new extensionManagement_1.$1n(error.message || nls.localize(5, null, extractPath, renamePath), error.code || extensionManagement_1.ExtensionManagementErrorCode.Rename);
            }
        }
        async D(location, type, profileLocation) {
            if (profileLocation) {
                const scannedExtensions = await this.n.scanUserExtensions({ profileLocation });
                const scannedExtension = scannedExtensions.find(e => this.t.extUri.isEqual(e.location, location));
                if (scannedExtension) {
                    return this.F(scannedExtension);
                }
            }
            else {
                const scannedExtension = await this.n.scanExistingExtension(location, type, { includeInvalid: true });
                if (scannedExtension) {
                    return this.F(scannedExtension);
                }
            }
            throw new Error(nls.localize(6, null, location.path));
        }
        async F(extension) {
            const stat = await this.m.resolve(extension.location);
            let readmeUrl;
            let changelogUrl;
            if (stat.children) {
                readmeUrl = stat.children.find(({ name }) => /^readme(\.txt|\.md|)$/i.test(name))?.resource;
                changelogUrl = stat.children.find(({ name }) => /^changelog(\.txt|\.md|)$/i.test(name))?.resource;
            }
            return {
                identifier: extension.identifier,
                type: extension.type,
                isBuiltin: extension.isBuiltin || !!extension.metadata?.isBuiltin,
                location: extension.location,
                manifest: extension.manifest,
                targetPlatform: extension.targetPlatform,
                validations: extension.validations,
                isValid: extension.isValid,
                readmeUrl,
                changelogUrl,
                publisherDisplayName: extension.metadata?.publisherDisplayName || null,
                publisherId: extension.metadata?.publisherId || null,
                isApplicationScoped: !!extension.metadata?.isApplicationScoped,
                isMachineScoped: !!extension.metadata?.isMachineScoped,
                isPreReleaseVersion: !!extension.metadata?.isPreReleaseVersion,
                preRelease: !!extension.metadata?.preRelease,
                installedTimestamp: extension.metadata?.installedTimestamp,
                updated: !!extension.metadata?.updated,
                pinned: !!extension.metadata?.pinned,
            };
        }
        async G() {
            const uninstalled = await this.getUninstalledExtensions();
            if (Object.keys(uninstalled).length === 0) {
                this.u.debug(`No uninstalled extensions found.`);
                return;
            }
            this.u.debug(`Removing uninstalled extensions:`, Object.keys(uninstalled));
            const extensions = await this.n.scanUserExtensions({ includeAllVersions: true, includeUninstalled: true, includeInvalid: true }); // All user extensions
            const installed = new Set();
            for (const e of extensions) {
                if (!uninstalled[extensionManagementUtil_1.$qo.create(e).toString()]) {
                    installed.add(e.identifier.id.toLowerCase());
                }
            }
            try {
                // running post uninstall tasks for extensions that are not installed anymore
                const byExtension = (0, extensionManagementUtil_1.$vo)(extensions, e => e.identifier);
                await async_1.Promises.settled(byExtension.map(async (e) => {
                    const latest = e.sort((a, b) => semver.rcompare(a.manifest.version, b.manifest.version))[0];
                    if (!installed.has(latest.identifier.id.toLowerCase())) {
                        await this.j(await this.F(latest));
                    }
                }));
            }
            catch (error) {
                this.u.error(error);
            }
            const toRemove = extensions.filter(e => e.metadata /* Installed by System */ && uninstalled[extensionManagementUtil_1.$qo.create(e).toString()]);
            await Promise.allSettled(toRemove.map(e => this.removeUninstalledExtension(e)));
        }
        async H() {
            this.u.trace('ExtensionManagementService#removeTempDeleteFolders');
            let stat;
            try {
                stat = await this.m.resolve(this.n.userExtensionsLocation);
            }
            catch (error) {
                if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.u.error(error);
                }
                return;
            }
            if (!stat?.children) {
                return;
            }
            try {
                await Promise.allSettled(stat.children.map(async (child) => {
                    if (!child.isDirectory || !child.name.endsWith(DELETED_FOLDER_POSTFIX)) {
                        return;
                    }
                    this.u.trace('Deleting the temporarily deleted folder', child.resource.toString());
                    try {
                        await this.m.del(child.resource, { recursive: true });
                        this.u.trace('Deleted the temporarily deleted folder', child.resource.toString());
                    }
                    catch (error) {
                        if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                            this.u.error(error);
                        }
                    }
                }));
            }
            catch (error) { /* ignore */ }
        }
    };
    exports.$Ap = $Ap;
    exports.$Ap = $Ap = __decorate([
        __param(1, files_1.$6j),
        __param(2, extensionsScannerService_1.$op),
        __param(3, extensionsProfileScannerService_1.$kp),
        __param(4, uriIdentity_1.$Ck),
        __param(5, log_1.$5i)
    ], $Ap);
    class InstallExtensionTask extends abstractExtensionManagementService_1.$ip {
        get profileLocation() { return this.j; }
        get verificationStatus() { return this.k; }
        get operation() { return (0, types_1.$qf)(this.options.operation) ? this.l : this.options.operation; }
        constructor(identifier, source, options, m, n, o, p, q, s) {
            super();
            this.identifier = identifier;
            this.source = source;
            this.options = options;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.s = s;
            this.j = this.options.profileLocation;
            this.k = false;
            this.l = 2 /* InstallOperation.Install */;
        }
        async h(token) {
            const [local, metadata] = await this.x(token);
            this.j = local.isBuiltin || local.isApplicationScoped ? this.o.defaultProfile.extensionsResource : this.options.profileLocation;
            if (this.n.extUri.isEqual(this.o.defaultProfile.extensionsResource, this.j)) {
                await this.p.initializeDefaultProfileExtensions();
            }
            await this.q.addExtensionsToProfile([[local, metadata]], this.j);
            return local;
        }
        async u({ zipPath, key, metadata }, removeIfExists, token) {
            let local = await this.v(key);
            if (!local) {
                this.s.trace('Extracting extension...', key.id);
                local = await this.m.extractUserExtension(key, zipPath, metadata, removeIfExists, token);
                this.s.info('Extracting extension completed.', key.id);
            }
            return local;
        }
        async v(extensionKey) {
            const isUninstalled = await this.w(extensionKey);
            if (!isUninstalled) {
                return undefined;
            }
            this.s.trace('Removing the extension from uninstalled list:', extensionKey.id);
            // If the same version of extension is marked as uninstalled, remove it from there and return the local.
            await this.m.setInstalled(extensionKey);
            this.s.info('Removed the extension from uninstalled list:', extensionKey.id);
            const userExtensions = await this.m.scanAllUserExtensions(true);
            return userExtensions.find(i => extensionManagementUtil_1.$qo.create(i).equals(extensionKey));
        }
        async w(extensionId) {
            const uninstalled = await this.m.getUninstalledExtensions();
            return !!uninstalled[extensionId.toString()];
        }
    }
    class $Bp extends InstallExtensionTask {
        constructor(manifest, y, options, z, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService) {
            super(y.identifier, y, options, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService);
            this.y = y;
            this.z = z;
        }
        async x(token) {
            const installed = await this.m.scanExtensions(null, this.options.profileLocation);
            const existingExtension = installed.find(i => (0, extensionManagementUtil_1.$po)(i.identifier, this.y.identifier));
            if (existingExtension) {
                this.l = 3 /* InstallOperation.Update */;
            }
            const metadata = {
                id: this.y.identifier.uuid,
                publisherId: this.y.publisherId,
                publisherDisplayName: this.y.publisherDisplayName,
                targetPlatform: this.y.properties.targetPlatform,
                isApplicationScoped: this.options.isApplicationScoped || existingExtension?.isApplicationScoped,
                isMachineScoped: this.options.isMachineScoped || existingExtension?.isMachineScoped,
                isBuiltin: this.options.isBuiltin || existingExtension?.isBuiltin,
                isSystem: existingExtension?.type === 0 /* ExtensionType.System */ ? true : undefined,
                updated: !!existingExtension,
                isPreReleaseVersion: this.y.properties.isPreReleaseVersion,
                installedTimestamp: Date.now(),
                pinned: this.options.installGivenVersion ? true : undefined,
                preRelease: this.y.properties.isPreReleaseVersion ||
                    ((0, types_1.$pf)(this.options.installPreReleaseVersion)
                        ? this.options.installPreReleaseVersion /* Respect the passed flag */
                        : existingExtension?.preRelease /* Respect the existing pre-release flag if it was set */)
            };
            if (existingExtension?.manifest.version === this.y.version) {
                const local = await this.m.updateMetadata(existingExtension, metadata);
                return [local, metadata];
            }
            const { location, verificationStatus } = await this.z.download(this.y, this.l, !this.options.donotVerifySignature);
            try {
                this.k = verificationStatus;
                this.B(location.fsPath);
                const local = await this.u({ zipPath: location.fsPath, key: extensionManagementUtil_1.$qo.create(this.y), metadata }, false, token);
                return [local, metadata];
            }
            catch (error) {
                try {
                    await this.z.delete(location);
                }
                catch (error) {
                    /* Ignore */
                    this.s.warn(`Error while deleting the downloaded file`, location.toString(), (0, errors_1.$8)(error));
                }
                throw error;
            }
        }
        async B(zipPath) {
            try {
                await (0, extensionManagementUtil_2.$vp)(zipPath);
            }
            catch (error) {
                throw new extensionManagement_1.$1n((0, abstractExtensionManagementService_1.$gp)(error).message, extensionManagement_1.ExtensionManagementErrorCode.Invalid);
            }
        }
    }
    exports.$Bp = $Bp;
    class InstallVSIXTask extends InstallExtensionTask {
        constructor(y, z, options, A, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService) {
            super({ id: (0, extensionManagementUtil_1.$uo)(y.publisher, y.name) }, z, options, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService);
            this.y = y;
            this.z = z;
            this.A = A;
        }
        async h(token) {
            const local = await super.h(token);
            this.D(local, token);
            return local;
        }
        async x(token) {
            const extensionKey = new extensionManagementUtil_1.$qo(this.identifier, this.y.version);
            const installedExtensions = await this.m.scanExtensions(1 /* ExtensionType.User */, this.options.profileLocation);
            const existing = installedExtensions.find(i => (0, extensionManagementUtil_1.$po)(this.identifier, i.identifier));
            const metadata = {
                isApplicationScoped: this.options.isApplicationScoped || existing?.isApplicationScoped,
                isMachineScoped: this.options.isMachineScoped || existing?.isMachineScoped,
                isBuiltin: this.options.isBuiltin || existing?.isBuiltin,
                installedTimestamp: Date.now(),
                pinned: this.options.installGivenVersion ? true : undefined,
            };
            if (existing) {
                this.l = 3 /* InstallOperation.Update */;
                if (extensionKey.equals(new extensionManagementUtil_1.$qo(existing.identifier, existing.manifest.version))) {
                    try {
                        await this.m.removeExtension(existing, 'existing');
                    }
                    catch (e) {
                        throw new Error(nls.localize(7, null, this.y.displayName || this.y.name));
                    }
                }
                else if (!this.options.profileLocation && semver.gt(existing.manifest.version, this.y.version)) {
                    await this.m.setUninstalled(existing);
                }
            }
            else {
                // Remove the extension with same version if it is already uninstalled.
                // Installing a VSIX extension shall replace the existing extension always.
                const existing = await this.v(extensionKey);
                if (existing) {
                    try {
                        await this.m.removeExtension(existing, 'existing');
                    }
                    catch (e) {
                        throw new Error(nls.localize(8, null, this.y.displayName || this.y.name));
                    }
                }
            }
            const local = await this.u({ zipPath: path.$0d(this.z.fsPath), key: extensionKey, metadata }, true, token);
            return [local, metadata];
        }
        async D(extension, token) {
            try {
                let [galleryExtension] = await this.A.getExtensions([{ id: extension.identifier.id, version: extension.manifest.version }], token);
                if (!galleryExtension) {
                    [galleryExtension] = await this.A.getExtensions([{ id: extension.identifier.id }], token);
                }
                if (galleryExtension) {
                    const metadata = {
                        id: galleryExtension.identifier.uuid,
                        publisherDisplayName: galleryExtension.publisherDisplayName,
                        publisherId: galleryExtension.publisherId,
                        isPreReleaseVersion: galleryExtension.properties.isPreReleaseVersion,
                        preRelease: galleryExtension.properties.isPreReleaseVersion || this.options.installPreReleaseVersion
                    };
                    await this.m.updateMetadata(extension, metadata, this.options.profileLocation);
                }
            }
            catch (error) {
                /* Ignore Error */
            }
        }
    }
    class UninstallExtensionTask extends abstractExtensionManagementService_1.$ip {
        constructor(extension, j, k) {
            super();
            this.extension = extension;
            this.j = j;
            this.k = k;
        }
        async h(token) {
            await this.k.removeExtensionFromProfile(this.extension, this.j);
        }
    }
});
//# sourceMappingURL=extensionManagementService.js.map