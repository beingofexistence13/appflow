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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/map", "vs/base/common/uri", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/types", "vs/base/common/errors", "vs/platform/telemetry/common/telemetry"], function (require, exports, async_1, buffer_1, lifecycle_1, event_1, map_1, uri_1, extensionManagement_1, extensionManagementUtil_1, files_1, instantiation_1, log_1, userDataProfile_1, uriIdentity_1, types_1, errors_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lp = exports.$kp = exports.$jp = exports.ExtensionsProfileScanningErrorCode = void 0;
    var ExtensionsProfileScanningErrorCode;
    (function (ExtensionsProfileScanningErrorCode) {
        /**
         * Error when trying to scan extensions from a profile that does not exist.
         */
        ExtensionsProfileScanningErrorCode["ERROR_PROFILE_NOT_FOUND"] = "ERROR_PROFILE_NOT_FOUND";
        /**
         * Error when profile file is invalid.
         */
        ExtensionsProfileScanningErrorCode["ERROR_INVALID_CONTENT"] = "ERROR_INVALID_CONTENT";
    })(ExtensionsProfileScanningErrorCode || (exports.ExtensionsProfileScanningErrorCode = ExtensionsProfileScanningErrorCode = {}));
    class $jp extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.$jp = $jp;
    exports.$kp = (0, instantiation_1.$Bh)('IExtensionsProfileScannerService');
    let $lp = class $lp extends lifecycle_1.$kc {
        constructor(j, m, n, r, s, t) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.b = this.B(new event_1.$fd());
            this.onAddExtensions = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidAddExtensions = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onRemoveExtensions = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidRemoveExtensions = this.g.event;
            this.h = new map_1.$zi();
        }
        scanProfileExtensions(profileLocation, options) {
            return this.u(profileLocation, undefined, options);
        }
        async addExtensionsToProfile(extensions, profileLocation) {
            const extensionsToRemove = [];
            const extensionsToAdd = [];
            try {
                await this.u(profileLocation, existingExtensions => {
                    const result = [];
                    for (const existing of existingExtensions) {
                        if (extensions.some(([e]) => (0, extensionManagementUtil_1.$po)(e.identifier, existing.identifier) && e.manifest.version !== existing.version)) {
                            // Remove the existing extension with different version
                            extensionsToRemove.push(existing);
                        }
                        else {
                            result.push(existing);
                        }
                    }
                    for (const [extension, metadata] of extensions) {
                        const index = result.findIndex(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier) && e.version === extension.manifest.version);
                        const extensionToAdd = { identifier: extension.identifier, version: extension.manifest.version, location: extension.location, metadata };
                        if (index === -1) {
                            extensionsToAdd.push(extensionToAdd);
                            result.push(extensionToAdd);
                        }
                        else {
                            result.splice(index, 1, extensionToAdd);
                        }
                    }
                    if (extensionsToAdd.length) {
                        this.b.fire({ extensions: extensionsToAdd, profileLocation });
                    }
                    if (extensionsToRemove.length) {
                        this.f.fire({ extensions: extensionsToRemove, profileLocation });
                    }
                    return result;
                });
                if (extensionsToAdd.length) {
                    this.c.fire({ extensions: extensionsToAdd, profileLocation });
                }
                if (extensionsToRemove.length) {
                    this.g.fire({ extensions: extensionsToRemove, profileLocation });
                }
                return extensionsToAdd;
            }
            catch (error) {
                if (extensionsToAdd.length) {
                    this.c.fire({ extensions: extensionsToAdd, error, profileLocation });
                }
                if (extensionsToRemove.length) {
                    this.g.fire({ extensions: extensionsToRemove, error, profileLocation });
                }
                throw error;
            }
        }
        async updateMetadata(extensions, profileLocation) {
            const updatedExtensions = [];
            await this.u(profileLocation, profileExtensions => {
                const result = [];
                for (const profileExtension of profileExtensions) {
                    const extension = extensions.find(([e]) => (0, extensionManagementUtil_1.$po)(e.identifier, profileExtension.identifier) && e.manifest.version === profileExtension.version);
                    if (extension) {
                        profileExtension.metadata = { ...profileExtension.metadata, ...extension[1] };
                        updatedExtensions.push(profileExtension);
                        result.push(profileExtension);
                    }
                    else {
                        result.push(profileExtension);
                    }
                }
                return result;
            });
            return updatedExtensions;
        }
        async removeExtensionFromProfile(extension, profileLocation) {
            const extensionsToRemove = [];
            try {
                await this.u(profileLocation, profileExtensions => {
                    const result = [];
                    for (const e of profileExtensions) {
                        if ((0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier)) {
                            extensionsToRemove.push(e);
                        }
                        else {
                            result.push(e);
                        }
                    }
                    if (extensionsToRemove.length) {
                        this.f.fire({ extensions: extensionsToRemove, profileLocation });
                    }
                    return result;
                });
                if (extensionsToRemove.length) {
                    this.g.fire({ extensions: extensionsToRemove, profileLocation });
                }
            }
            catch (error) {
                if (extensionsToRemove.length) {
                    this.g.fire({ extensions: extensionsToRemove, error, profileLocation });
                }
                throw error;
            }
        }
        async u(file, updateFn, options) {
            return this.F(file).queue(async () => {
                let extensions = [];
                // Read
                let storedProfileExtensions;
                try {
                    const content = await this.m.readFile(file);
                    storedProfileExtensions = JSON.parse(content.value.toString().trim() || '[]');
                }
                catch (error) {
                    if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        throw error;
                    }
                    // migrate from old location, remove this after couple of releases
                    if (this.r.extUri.isEqual(file, this.n.defaultProfile.extensionsResource)) {
                        storedProfileExtensions = await this.D();
                    }
                    if (!storedProfileExtensions && options?.bailOutWhenFileNotFound) {
                        throw new $jp((0, errors_1.$8)(error), "ERROR_PROFILE_NOT_FOUND" /* ExtensionsProfileScanningErrorCode.ERROR_PROFILE_NOT_FOUND */);
                    }
                }
                if (storedProfileExtensions) {
                    if (!Array.isArray(storedProfileExtensions)) {
                        this.w(file);
                    }
                    // TODO @sandy081: Remove this migration after couple of releases
                    let migrate = false;
                    for (const e of storedProfileExtensions) {
                        if (!isStoredProfileExtension(e)) {
                            this.w(file);
                        }
                        let location;
                        if ((0, types_1.$jf)(e.relativeLocation) && e.relativeLocation) {
                            // Extension in new format. No migration needed.
                            location = this.z(e.relativeLocation);
                        }
                        else if ((0, types_1.$jf)(e.location)) {
                            // Extension in intermediate format. Migrate to new format.
                            location = this.z(e.location);
                            migrate = true;
                            e.relativeLocation = e.location;
                            // retain old format so that old clients can read it
                            e.location = location.toJSON();
                        }
                        else {
                            location = uri_1.URI.revive(e.location);
                            const relativePath = this.y(location);
                            if (relativePath) {
                                // Extension in old format. Migrate to new format.
                                migrate = true;
                                e.relativeLocation = relativePath;
                            }
                        }
                        extensions.push({
                            identifier: e.identifier,
                            location,
                            version: e.version,
                            metadata: e.metadata,
                        });
                    }
                    if (migrate) {
                        await this.m.writeFile(file, buffer_1.$Fd.fromString(JSON.stringify(storedProfileExtensions)));
                    }
                }
                // Update
                if (updateFn) {
                    extensions = updateFn(extensions);
                    const storedProfileExtensions = extensions.map(e => ({
                        identifier: e.identifier,
                        version: e.version,
                        // retain old format so that old clients can read it
                        location: e.location.toJSON(),
                        relativeLocation: this.y(e.location),
                        metadata: e.metadata
                    }));
                    await this.m.writeFile(file, buffer_1.$Fd.fromString(JSON.stringify(storedProfileExtensions)));
                }
                return extensions;
            });
        }
        w(file) {
            const error = new $jp(`Invalid extensions content in ${file.toString()}`, "ERROR_INVALID_CONTENT" /* ExtensionsProfileScanningErrorCode.ERROR_INVALID_CONTENT */);
            this.s.publicLogError2('extensionsProfileScanningError', { code: error.code });
            throw error;
        }
        y(extensionLocation) {
            return this.r.extUri.isEqual(this.r.extUri.dirname(extensionLocation), this.j)
                ? this.r.extUri.basename(extensionLocation)
                : undefined;
        }
        z(path) {
            return this.r.extUri.joinPath(this.j, path);
        }
        async D() {
            if (!this.C) {
                this.C = (async () => {
                    const oldDefaultProfileExtensionsLocation = this.r.extUri.joinPath(this.n.defaultProfile.location, 'extensions.json');
                    const oldDefaultProfileExtensionsInitLocation = this.r.extUri.joinPath(this.j, '.init-default-profile-extensions');
                    let content;
                    try {
                        content = (await this.m.readFile(oldDefaultProfileExtensionsLocation)).value.toString();
                    }
                    catch (error) {
                        if ((0, files_1.$jk)(error) === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                            return undefined;
                        }
                        throw error;
                    }
                    this.t.info('Migrating extensions from old default profile location', oldDefaultProfileExtensionsLocation.toString());
                    let storedProfileExtensions;
                    try {
                        const parsedData = JSON.parse(content);
                        if (Array.isArray(parsedData) && parsedData.every(candidate => isStoredProfileExtension(candidate))) {
                            storedProfileExtensions = parsedData;
                        }
                        else {
                            this.t.warn('Skipping migrating from old default profile locaiton: Found invalid data', parsedData);
                        }
                    }
                    catch (error) {
                        /* Ignore */
                        this.t.error(error);
                    }
                    if (storedProfileExtensions) {
                        try {
                            await this.m.createFile(this.n.defaultProfile.extensionsResource, buffer_1.$Fd.fromString(JSON.stringify(storedProfileExtensions)), { overwrite: false });
                            this.t.info('Migrated extensions from old default profile location to new location', oldDefaultProfileExtensionsLocation.toString(), this.n.defaultProfile.extensionsResource.toString());
                        }
                        catch (error) {
                            if ((0, files_1.$jk)(error) === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                                this.t.info('Migration from old default profile location to new location is done by another window', oldDefaultProfileExtensionsLocation.toString(), this.n.defaultProfile.extensionsResource.toString());
                            }
                            else {
                                throw error;
                            }
                        }
                    }
                    try {
                        await this.m.del(oldDefaultProfileExtensionsLocation);
                    }
                    catch (error) {
                        if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                            this.t.error(error);
                        }
                    }
                    try {
                        await this.m.del(oldDefaultProfileExtensionsInitLocation);
                    }
                    catch (error) {
                        if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                            this.t.error(error);
                        }
                    }
                    return storedProfileExtensions;
                })();
            }
            return this.C;
        }
        F(file) {
            let resourceQueue = this.h.get(file);
            if (!resourceQueue) {
                resourceQueue = new async_1.$Ng();
                this.h.set(file, resourceQueue);
            }
            return resourceQueue;
        }
    };
    exports.$lp = $lp;
    exports.$lp = $lp = __decorate([
        __param(1, files_1.$6j),
        __param(2, userDataProfile_1.$Ek),
        __param(3, uriIdentity_1.$Ck),
        __param(4, telemetry_1.$9k),
        __param(5, log_1.$5i)
    ], $lp);
    function isStoredProfileExtension(candidate) {
        return (0, types_1.$lf)(candidate)
            && (0, extensionManagement_1.$Yn)(candidate.identifier)
            && (isUriComponents(candidate.location) || ((0, types_1.$jf)(candidate.location) && candidate.location))
            && ((0, types_1.$qf)(candidate.relativeLocation) || (0, types_1.$jf)(candidate.relativeLocation))
            && candidate.version && (0, types_1.$jf)(candidate.version);
    }
    function isUriComponents(thing) {
        if (!thing) {
            return false;
        }
        return (0, types_1.$jf)(thing.path) &&
            (0, types_1.$jf)(thing.scheme);
    }
});
//# sourceMappingURL=extensionsProfileScannerService.js.map