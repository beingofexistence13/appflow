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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/types", "vs/base/common/uuid", "vs/base/node/pfs", "vs/base/node/zip", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/files/common/files", "vs/platform/log/common/log"], function (require, exports, async_1, errors_1, lifecycle_1, network_1, resources_1, semver, types_1, uuid_1, pfs_1, zip_1, configuration_1, environment_1, extensionManagement_1, extensionManagementUtil_1, extensionSignatureVerificationService_1, files_1, log_1) {
    "use strict";
    var $tp_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tp = void 0;
    let $tp = class $tp extends lifecycle_1.$kc {
        static { $tp_1 = this; }
        static { this.c = '.sigzip'; }
        constructor(environmentService, h, j, m, n, r) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.extensionsDownloadDir = environmentService.extensionsDownloadLocation;
            this.f = 20; // Cache 20 downloaded VSIX files
            this.g = this.y();
        }
        async download(extension, operation, verifySignature) {
            await this.g;
            const location = (0, resources_1.$ig)(this.extensionsDownloadDir, this.z(extension));
            try {
                await this.w(extension, location, location => this.j.download(extension, location, operation));
            }
            catch (error) {
                throw new extensionManagement_1.$1n(error.message, extensionManagement_1.ExtensionManagementErrorCode.Download);
            }
            let verificationStatus = false;
            if (verifySignature && this.t(extension)) {
                const signatureArchiveLocation = await this.u(extension);
                try {
                    verificationStatus = await this.n.verify(location.fsPath, signatureArchiveLocation.fsPath, this.r.getLevel() === log_1.LogLevel.Trace);
                }
                catch (error) {
                    const sigError = error;
                    verificationStatus = sigError.code;
                    if (sigError.output) {
                        this.r.trace(`Extension signature verification details for ${extension.identifier.id} ${extension.version}:\n${sigError.output}`);
                    }
                    if (verificationStatus === extensionManagement_1.ExtensionSignaturetErrorCode.PackageIsInvalidZip || verificationStatus === extensionManagement_1.ExtensionSignaturetErrorCode.SignatureArchiveIsInvalidZip) {
                        throw new extensionManagement_1.$1n(zip_1.$ap, extensionManagement_1.ExtensionManagementErrorCode.CorruptZip);
                    }
                }
                finally {
                    try {
                        // Delete signature archive always
                        await this.delete(signatureArchiveLocation);
                    }
                    catch (error) {
                        this.r.error(error);
                    }
                }
            }
            if (verificationStatus === true) {
                this.r.info(`Extension signature is verified: ${extension.identifier.id}`);
            }
            else if (verificationStatus === false) {
                this.r.info(`Extension signature verification is not done: ${extension.identifier.id}`);
            }
            else {
                this.r.warn(`Extension signature verification failed with error '${verificationStatus}': ${extension.identifier.id}`);
            }
            return { location, verificationStatus };
        }
        t(extension) {
            if (!extension.isSigned) {
                return false;
            }
            const value = this.m.getValue('extensions.verifySignature');
            return (0, types_1.$pf)(value) ? value : true;
        }
        async u(extension) {
            await this.g;
            const location = (0, resources_1.$ig)(this.extensionsDownloadDir, `${this.z(extension)}${$tp_1.c}`);
            await this.w(extension, location, location => this.j.downloadSignatureArchive(extension, location));
            return location;
        }
        async w(extension, location, downloadFn) {
            // Do not download if exists
            if (await this.h.exists(location)) {
                return;
            }
            // Download directly if locaiton is not file scheme
            if (location.scheme !== network_1.Schemas.file) {
                await downloadFn(location);
                return;
            }
            // Download to temporary location first only if file does not exist
            const tempLocation = (0, resources_1.$ig)(this.extensionsDownloadDir, `.${(0, uuid_1.$4f)()}`);
            if (!await this.h.exists(tempLocation)) {
                await downloadFn(tempLocation);
            }
            try {
                // Rename temp location to original
                await pfs_1.Promises.rename(tempLocation.fsPath, location.fsPath, 2 * 60 * 1000 /* Retry for 2 minutes */);
            }
            catch (error) {
                try {
                    await this.h.del(tempLocation);
                }
                catch (e) { /* ignore */ }
                if (error.code === 'ENOTEMPTY') {
                    this.r.info(`Rename failed because the file was downloaded by another source. So ignoring renaming.`, extension.identifier.id, location.path);
                }
                else {
                    this.r.info(`Rename failed because of ${(0, errors_1.$8)(error)}. Deleted the file from downloaded location`, tempLocation.path);
                    throw error;
                }
            }
        }
        async delete(location) {
            await this.g;
            await this.h.del(location);
        }
        async y() {
            try {
                if (!(await this.h.exists(this.extensionsDownloadDir))) {
                    this.r.trace('Extension VSIX downloads cache dir does not exist');
                    return;
                }
                const folderStat = await this.h.resolve(this.extensionsDownloadDir, { resolveMetadata: true });
                if (folderStat.children) {
                    const toDelete = [];
                    const vsixs = [];
                    const signatureArchives = [];
                    for (const stat of folderStat.children) {
                        if (stat.name.endsWith($tp_1.c)) {
                            signatureArchives.push(stat.resource);
                        }
                        else {
                            const extension = extensionManagementUtil_1.$qo.parse(stat.name);
                            if (extension) {
                                vsixs.push([extension, stat]);
                            }
                        }
                    }
                    const byExtension = (0, extensionManagementUtil_1.$vo)(vsixs, ([extension]) => extension);
                    const distinct = [];
                    for (const p of byExtension) {
                        p.sort((a, b) => semver.rcompare(a[0].version, b[0].version));
                        toDelete.push(...p.slice(1).map(e => e[1].resource)); // Delete outdated extensions
                        distinct.push(p[0][1]);
                    }
                    distinct.sort((a, b) => a.mtime - b.mtime); // sort by modified time
                    toDelete.push(...distinct.slice(0, Math.max(0, distinct.length - this.f)).map(s => s.resource)); // Retain minimum cacheSize and delete the rest
                    toDelete.push(...signatureArchives); // Delete all signature archives
                    await async_1.Promises.settled(toDelete.map(resource => {
                        this.r.trace('Deleting from cache', resource.path);
                        return this.h.del(resource);
                    }));
                }
            }
            catch (e) {
                this.r.error(e);
            }
        }
        z(extension) {
            return this.f ? extensionManagementUtil_1.$qo.create(extension).toString().toLowerCase() : (0, uuid_1.$4f)();
        }
    };
    exports.$tp = $tp;
    exports.$tp = $tp = $tp_1 = __decorate([
        __param(0, environment_1.$Jh),
        __param(1, files_1.$6j),
        __param(2, extensionManagement_1.$Zn),
        __param(3, configuration_1.$8h),
        __param(4, extensionSignatureVerificationService_1.$7o),
        __param(5, log_1.$5i)
    ], $tp);
});
//# sourceMappingURL=extensionDownloader.js.map