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
    exports.AbstractExtensionsProfileScannerService = exports.IExtensionsProfileScannerService = exports.ExtensionsProfileScanningError = exports.ExtensionsProfileScanningErrorCode = void 0;
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
    class ExtensionsProfileScanningError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.ExtensionsProfileScanningError = ExtensionsProfileScanningError;
    exports.IExtensionsProfileScannerService = (0, instantiation_1.createDecorator)('IExtensionsProfileScannerService');
    let AbstractExtensionsProfileScannerService = class AbstractExtensionsProfileScannerService extends lifecycle_1.Disposable {
        constructor(extensionsLocation, fileService, userDataProfilesService, uriIdentityService, telemetryService, logService) {
            super();
            this.extensionsLocation = extensionsLocation;
            this.fileService = fileService;
            this.userDataProfilesService = userDataProfilesService;
            this.uriIdentityService = uriIdentityService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this._onAddExtensions = this._register(new event_1.Emitter());
            this.onAddExtensions = this._onAddExtensions.event;
            this._onDidAddExtensions = this._register(new event_1.Emitter());
            this.onDidAddExtensions = this._onDidAddExtensions.event;
            this._onRemoveExtensions = this._register(new event_1.Emitter());
            this.onRemoveExtensions = this._onRemoveExtensions.event;
            this._onDidRemoveExtensions = this._register(new event_1.Emitter());
            this.onDidRemoveExtensions = this._onDidRemoveExtensions.event;
            this.resourcesAccessQueueMap = new map_1.ResourceMap();
        }
        scanProfileExtensions(profileLocation, options) {
            return this.withProfileExtensions(profileLocation, undefined, options);
        }
        async addExtensionsToProfile(extensions, profileLocation) {
            const extensionsToRemove = [];
            const extensionsToAdd = [];
            try {
                await this.withProfileExtensions(profileLocation, existingExtensions => {
                    const result = [];
                    for (const existing of existingExtensions) {
                        if (extensions.some(([e]) => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, existing.identifier) && e.manifest.version !== existing.version)) {
                            // Remove the existing extension with different version
                            extensionsToRemove.push(existing);
                        }
                        else {
                            result.push(existing);
                        }
                    }
                    for (const [extension, metadata] of extensions) {
                        const index = result.findIndex(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier) && e.version === extension.manifest.version);
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
                        this._onAddExtensions.fire({ extensions: extensionsToAdd, profileLocation });
                    }
                    if (extensionsToRemove.length) {
                        this._onRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
                    }
                    return result;
                });
                if (extensionsToAdd.length) {
                    this._onDidAddExtensions.fire({ extensions: extensionsToAdd, profileLocation });
                }
                if (extensionsToRemove.length) {
                    this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
                }
                return extensionsToAdd;
            }
            catch (error) {
                if (extensionsToAdd.length) {
                    this._onDidAddExtensions.fire({ extensions: extensionsToAdd, error, profileLocation });
                }
                if (extensionsToRemove.length) {
                    this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, error, profileLocation });
                }
                throw error;
            }
        }
        async updateMetadata(extensions, profileLocation) {
            const updatedExtensions = [];
            await this.withProfileExtensions(profileLocation, profileExtensions => {
                const result = [];
                for (const profileExtension of profileExtensions) {
                    const extension = extensions.find(([e]) => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, profileExtension.identifier) && e.manifest.version === profileExtension.version);
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
                await this.withProfileExtensions(profileLocation, profileExtensions => {
                    const result = [];
                    for (const e of profileExtensions) {
                        if ((0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier)) {
                            extensionsToRemove.push(e);
                        }
                        else {
                            result.push(e);
                        }
                    }
                    if (extensionsToRemove.length) {
                        this._onRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
                    }
                    return result;
                });
                if (extensionsToRemove.length) {
                    this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
                }
            }
            catch (error) {
                if (extensionsToRemove.length) {
                    this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, error, profileLocation });
                }
                throw error;
            }
        }
        async withProfileExtensions(file, updateFn, options) {
            return this.getResourceAccessQueue(file).queue(async () => {
                let extensions = [];
                // Read
                let storedProfileExtensions;
                try {
                    const content = await this.fileService.readFile(file);
                    storedProfileExtensions = JSON.parse(content.value.toString().trim() || '[]');
                }
                catch (error) {
                    if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        throw error;
                    }
                    // migrate from old location, remove this after couple of releases
                    if (this.uriIdentityService.extUri.isEqual(file, this.userDataProfilesService.defaultProfile.extensionsResource)) {
                        storedProfileExtensions = await this.migrateFromOldDefaultProfileExtensionsLocation();
                    }
                    if (!storedProfileExtensions && options?.bailOutWhenFileNotFound) {
                        throw new ExtensionsProfileScanningError((0, errors_1.getErrorMessage)(error), "ERROR_PROFILE_NOT_FOUND" /* ExtensionsProfileScanningErrorCode.ERROR_PROFILE_NOT_FOUND */);
                    }
                }
                if (storedProfileExtensions) {
                    if (!Array.isArray(storedProfileExtensions)) {
                        this.reportAndThrowInvalidConentError(file);
                    }
                    // TODO @sandy081: Remove this migration after couple of releases
                    let migrate = false;
                    for (const e of storedProfileExtensions) {
                        if (!isStoredProfileExtension(e)) {
                            this.reportAndThrowInvalidConentError(file);
                        }
                        let location;
                        if ((0, types_1.isString)(e.relativeLocation) && e.relativeLocation) {
                            // Extension in new format. No migration needed.
                            location = this.resolveExtensionLocation(e.relativeLocation);
                        }
                        else if ((0, types_1.isString)(e.location)) {
                            // Extension in intermediate format. Migrate to new format.
                            location = this.resolveExtensionLocation(e.location);
                            migrate = true;
                            e.relativeLocation = e.location;
                            // retain old format so that old clients can read it
                            e.location = location.toJSON();
                        }
                        else {
                            location = uri_1.URI.revive(e.location);
                            const relativePath = this.toRelativePath(location);
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
                        await this.fileService.writeFile(file, buffer_1.VSBuffer.fromString(JSON.stringify(storedProfileExtensions)));
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
                        relativeLocation: this.toRelativePath(e.location),
                        metadata: e.metadata
                    }));
                    await this.fileService.writeFile(file, buffer_1.VSBuffer.fromString(JSON.stringify(storedProfileExtensions)));
                }
                return extensions;
            });
        }
        reportAndThrowInvalidConentError(file) {
            const error = new ExtensionsProfileScanningError(`Invalid extensions content in ${file.toString()}`, "ERROR_INVALID_CONTENT" /* ExtensionsProfileScanningErrorCode.ERROR_INVALID_CONTENT */);
            this.telemetryService.publicLogError2('extensionsProfileScanningError', { code: error.code });
            throw error;
        }
        toRelativePath(extensionLocation) {
            return this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.dirname(extensionLocation), this.extensionsLocation)
                ? this.uriIdentityService.extUri.basename(extensionLocation)
                : undefined;
        }
        resolveExtensionLocation(path) {
            return this.uriIdentityService.extUri.joinPath(this.extensionsLocation, path);
        }
        async migrateFromOldDefaultProfileExtensionsLocation() {
            if (!this._migrationPromise) {
                this._migrationPromise = (async () => {
                    const oldDefaultProfileExtensionsLocation = this.uriIdentityService.extUri.joinPath(this.userDataProfilesService.defaultProfile.location, 'extensions.json');
                    const oldDefaultProfileExtensionsInitLocation = this.uriIdentityService.extUri.joinPath(this.extensionsLocation, '.init-default-profile-extensions');
                    let content;
                    try {
                        content = (await this.fileService.readFile(oldDefaultProfileExtensionsLocation)).value.toString();
                    }
                    catch (error) {
                        if ((0, files_1.toFileOperationResult)(error) === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                            return undefined;
                        }
                        throw error;
                    }
                    this.logService.info('Migrating extensions from old default profile location', oldDefaultProfileExtensionsLocation.toString());
                    let storedProfileExtensions;
                    try {
                        const parsedData = JSON.parse(content);
                        if (Array.isArray(parsedData) && parsedData.every(candidate => isStoredProfileExtension(candidate))) {
                            storedProfileExtensions = parsedData;
                        }
                        else {
                            this.logService.warn('Skipping migrating from old default profile locaiton: Found invalid data', parsedData);
                        }
                    }
                    catch (error) {
                        /* Ignore */
                        this.logService.error(error);
                    }
                    if (storedProfileExtensions) {
                        try {
                            await this.fileService.createFile(this.userDataProfilesService.defaultProfile.extensionsResource, buffer_1.VSBuffer.fromString(JSON.stringify(storedProfileExtensions)), { overwrite: false });
                            this.logService.info('Migrated extensions from old default profile location to new location', oldDefaultProfileExtensionsLocation.toString(), this.userDataProfilesService.defaultProfile.extensionsResource.toString());
                        }
                        catch (error) {
                            if ((0, files_1.toFileOperationResult)(error) === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                                this.logService.info('Migration from old default profile location to new location is done by another window', oldDefaultProfileExtensionsLocation.toString(), this.userDataProfilesService.defaultProfile.extensionsResource.toString());
                            }
                            else {
                                throw error;
                            }
                        }
                    }
                    try {
                        await this.fileService.del(oldDefaultProfileExtensionsLocation);
                    }
                    catch (error) {
                        if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                            this.logService.error(error);
                        }
                    }
                    try {
                        await this.fileService.del(oldDefaultProfileExtensionsInitLocation);
                    }
                    catch (error) {
                        if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                            this.logService.error(error);
                        }
                    }
                    return storedProfileExtensions;
                })();
            }
            return this._migrationPromise;
        }
        getResourceAccessQueue(file) {
            let resourceQueue = this.resourcesAccessQueueMap.get(file);
            if (!resourceQueue) {
                resourceQueue = new async_1.Queue();
                this.resourcesAccessQueueMap.set(file, resourceQueue);
            }
            return resourceQueue;
        }
    };
    exports.AbstractExtensionsProfileScannerService = AbstractExtensionsProfileScannerService;
    exports.AbstractExtensionsProfileScannerService = AbstractExtensionsProfileScannerService = __decorate([
        __param(1, files_1.IFileService),
        __param(2, userDataProfile_1.IUserDataProfilesService),
        __param(3, uriIdentity_1.IUriIdentityService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, log_1.ILogService)
    ], AbstractExtensionsProfileScannerService);
    function isStoredProfileExtension(candidate) {
        return (0, types_1.isObject)(candidate)
            && (0, extensionManagement_1.isIExtensionIdentifier)(candidate.identifier)
            && (isUriComponents(candidate.location) || ((0, types_1.isString)(candidate.location) && candidate.location))
            && ((0, types_1.isUndefined)(candidate.relativeLocation) || (0, types_1.isString)(candidate.relativeLocation))
            && candidate.version && (0, types_1.isString)(candidate.version);
    }
    function isUriComponents(thing) {
        if (!thing) {
            return false;
        }
        return (0, types_1.isString)(thing.path) &&
            (0, types_1.isString)(thing.scheme);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1Byb2ZpbGVTY2FubmVyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvY29tbW9uL2V4dGVuc2lvbnNQcm9maWxlU2Nhbm5lclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNEJoRyxJQUFrQixrQ0FZakI7SUFaRCxXQUFrQixrQ0FBa0M7UUFFbkQ7O1dBRUc7UUFDSCx5RkFBbUQsQ0FBQTtRQUVuRDs7V0FFRztRQUNILHFGQUErQyxDQUFBO0lBRWhELENBQUMsRUFaaUIsa0NBQWtDLGtEQUFsQyxrQ0FBa0MsUUFZbkQ7SUFFRCxNQUFhLDhCQUErQixTQUFRLEtBQUs7UUFDeEQsWUFBWSxPQUFlLEVBQVMsSUFBd0M7WUFDM0UsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQW9DO1FBRTVFLENBQUM7S0FDRDtJQUpELHdFQUlDO0lBMEJZLFFBQUEsZ0NBQWdDLEdBQUcsSUFBQSwrQkFBZSxFQUFtQyxrQ0FBa0MsQ0FBQyxDQUFDO0lBZS9ILElBQWUsdUNBQXVDLEdBQXRELE1BQWUsdUNBQXdDLFNBQVEsc0JBQVU7UUFpQi9FLFlBQ2tCLGtCQUF1QixFQUMxQixXQUEwQyxFQUM5Qix1QkFBa0UsRUFDdkUsa0JBQXdELEVBQzFELGdCQUFvRCxFQUMxRCxVQUF3QztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQVBTLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBSztZQUNULGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2IsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUN0RCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3pDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDekMsZUFBVSxHQUFWLFVBQVUs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