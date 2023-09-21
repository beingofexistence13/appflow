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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/product/common/productService", "vs/base/common/arrays", "vs/platform/log/common/log", "vs/base/common/types"], function (require, exports, instantiation_1, event_1, lifecycle_1, storage_1, extensionManagementUtil_1, productService_1, arrays_1, log_1, types_1) {
    "use strict";
    var ExtensionStorageService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionStorageService = exports.IExtensionStorageService = void 0;
    exports.IExtensionStorageService = (0, instantiation_1.createDecorator)('IExtensionStorageService');
    const EXTENSION_KEYS_ID_VERSION_REGEX = /^extensionKeys\/([^.]+\..+)@(\d+\.\d+\.\d+(-.*)?)$/;
    let ExtensionStorageService = class ExtensionStorageService extends lifecycle_1.Disposable {
        static { ExtensionStorageService_1 = this; }
        static { this.LARGE_STATE_WARNING_THRESHOLD = 512 * 1024; }
        static toKey(extension) {
            return `extensionKeys/${(0, extensionManagementUtil_1.adoptToGalleryExtensionId)(extension.id)}@${extension.version}`;
        }
        static fromKey(key) {
            const matches = EXTENSION_KEYS_ID_VERSION_REGEX.exec(key);
            if (matches && matches[1]) {
                return { id: matches[1], version: matches[2] };
            }
            return undefined;
        }
        /* TODO @sandy081: This has to be done across all profiles */
        static async removeOutdatedExtensionVersions(extensionManagementService, storageService) {
            const extensions = await extensionManagementService.getInstalled();
            const extensionVersionsToRemove = [];
            for (const [id, versions] of ExtensionStorageService_1.readAllExtensionsWithKeysForSync(storageService)) {
                const extensionVersion = extensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }))?.manifest.version;
                for (const version of versions) {
                    if (extensionVersion !== version) {
                        extensionVersionsToRemove.push(ExtensionStorageService_1.toKey({ id, version }));
                    }
                }
            }
            for (const key of extensionVersionsToRemove) {
                storageService.remove(key, 0 /* StorageScope.PROFILE */);
            }
        }
        static readAllExtensionsWithKeysForSync(storageService) {
            const extensionsWithKeysForSync = new Map();
            const keys = storageService.keys(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            for (const key of keys) {
                const extensionIdWithVersion = ExtensionStorageService_1.fromKey(key);
                if (extensionIdWithVersion) {
                    let versions = extensionsWithKeysForSync.get(extensionIdWithVersion.id.toLowerCase());
                    if (!versions) {
                        extensionsWithKeysForSync.set(extensionIdWithVersion.id.toLowerCase(), versions = []);
                    }
                    versions.push(extensionIdWithVersion.version);
                }
            }
            return extensionsWithKeysForSync;
        }
        constructor(storageService, productService, logService) {
            super();
            this.storageService = storageService;
            this.productService = productService;
            this.logService = logService;
            this._onDidChangeExtensionStorageToSync = this._register(new event_1.Emitter());
            this.onDidChangeExtensionStorageToSync = this._onDidChangeExtensionStorageToSync.event;
            this.extensionsWithKeysForSync = ExtensionStorageService_1.readAllExtensionsWithKeysForSync(storageService);
            this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this._register(new lifecycle_1.DisposableStore()))(e => this.onDidChangeStorageValue(e)));
        }
        onDidChangeStorageValue(e) {
            // State of extension with keys for sync has changed
            if (this.extensionsWithKeysForSync.has(e.key.toLowerCase())) {
                this._onDidChangeExtensionStorageToSync.fire();
                return;
            }
            // Keys for sync of an extension has changed
            const extensionIdWithVersion = ExtensionStorageService_1.fromKey(e.key);
            if (extensionIdWithVersion) {
                if (this.storageService.get(e.key, 0 /* StorageScope.PROFILE */) === undefined) {
                    this.extensionsWithKeysForSync.delete(extensionIdWithVersion.id.toLowerCase());
                }
                else {
                    let versions = this.extensionsWithKeysForSync.get(extensionIdWithVersion.id.toLowerCase());
                    if (!versions) {
                        this.extensionsWithKeysForSync.set(extensionIdWithVersion.id.toLowerCase(), versions = []);
                    }
                    versions.push(extensionIdWithVersion.version);
                    this._onDidChangeExtensionStorageToSync.fire();
                }
                return;
            }
        }
        getExtensionId(extension) {
            if ((0, types_1.isString)(extension)) {
                return extension;
            }
            const publisher = extension.manifest ? extension.manifest.publisher : extension.publisher;
            const name = extension.manifest ? extension.manifest.name : extension.name;
            return (0, extensionManagementUtil_1.getExtensionId)(publisher, name);
        }
        getExtensionState(extension, global) {
            const extensionId = this.getExtensionId(extension);
            const jsonValue = this.getExtensionStateRaw(extension, global);
            if (jsonValue) {
                try {
                    return JSON.parse(jsonValue);
                }
                catch (error) {
                    // Do not fail this call but log it for diagnostics
                    // https://github.com/microsoft/vscode/issues/132777
                    this.logService.error(`[mainThreadStorage] unexpected error parsing storage contents (extensionId: ${extensionId}, global: ${global}): ${error}`);
                }
            }
            return undefined;
        }
        getExtensionStateRaw(extension, global) {
            const extensionId = this.getExtensionId(extension);
            const rawState = this.storageService.get(extensionId, global ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */);
            if (rawState && rawState?.length > ExtensionStorageService_1.LARGE_STATE_WARNING_THRESHOLD) {
                this.logService.warn(`[mainThreadStorage] large extension state detected (extensionId: ${extensionId}, global: ${global}): ${rawState.length / 1024}kb. Consider to use 'storageUri' or 'globalStorageUri' to store this data on disk instead.`);
            }
            return rawState;
        }
        setExtensionState(extension, state, global) {
            const extensionId = this.getExtensionId(extension);
            if (state === undefined) {
                this.storageService.remove(extensionId, global ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */);
            }
            else {
                this.storageService.store(extensionId, JSON.stringify(state), global ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        setKeysForSync(extensionIdWithVersion, keys) {
            this.storageService.store(ExtensionStorageService_1.toKey(extensionIdWithVersion), JSON.stringify(keys), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        getKeysForSync(extensionIdWithVersion) {
            const extensionKeysForSyncFromProduct = this.productService.extensionSyncedKeys?.[extensionIdWithVersion.id.toLowerCase()];
            const extensionKeysForSyncFromStorageValue = this.storageService.get(ExtensionStorageService_1.toKey(extensionIdWithVersion), 0 /* StorageScope.PROFILE */);
            const extensionKeysForSyncFromStorage = extensionKeysForSyncFromStorageValue ? JSON.parse(extensionKeysForSyncFromStorageValue) : undefined;
            return extensionKeysForSyncFromStorage && extensionKeysForSyncFromProduct
                ? (0, arrays_1.distinct)([...extensionKeysForSyncFromStorage, ...extensionKeysForSyncFromProduct])
                : (extensionKeysForSyncFromStorage || extensionKeysForSyncFromProduct);
        }
        addToMigrationList(from, to) {
            if (from !== to) {
                // remove the duplicates
                const migrationList = this.migrationList.filter(entry => !entry.includes(from) && !entry.includes(to));
                migrationList.push([from, to]);
                this.migrationList = migrationList;
            }
        }
        getSourceExtensionToMigrate(toExtensionId) {
            const entry = this.migrationList.find(([, to]) => toExtensionId === to);
            return entry ? entry[0] : undefined;
        }
        get migrationList() {
            const value = this.storageService.get('extensionStorage.migrationList', -1 /* StorageScope.APPLICATION */, '[]');
            try {
                const migrationList = JSON.parse(value);
                if (Array.isArray(migrationList)) {
                    return migrationList;
                }
            }
            catch (error) { /* ignore */ }
            return [];
        }
        set migrationList(migrationList) {
            if (migrationList.length) {
                this.storageService.store('extensionStorage.migrationList', JSON.stringify(migrationList), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove('extensionStorage.migrationList', -1 /* StorageScope.APPLICATION */);
            }
        }
    };
    exports.ExtensionStorageService = ExtensionStorageService;
    exports.ExtensionStorageService = ExtensionStorageService = ExtensionStorageService_1 = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, productService_1.IProductService),
        __param(2, log_1.ILogService)
    ], ExtensionStorageService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uU3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvY29tbW9uL2V4dGVuc2lvblN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9CbkYsUUFBQSx3QkFBd0IsR0FBRyxJQUFBLCtCQUFlLEVBQTJCLDBCQUEwQixDQUFDLENBQUM7SUFpQjlHLE1BQU0sK0JBQStCLEdBQUcsb0RBQW9ELENBQUM7SUFFdEYsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSxzQkFBVTs7aUJBSXZDLGtDQUE2QixHQUFHLEdBQUcsR0FBRyxJQUFJLEFBQWIsQ0FBYztRQUVsRCxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQWtDO1lBQ3RELE9BQU8saUJBQWlCLElBQUEsbURBQXlCLEVBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4RixDQUFDO1FBRU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFXO1lBQ2pDLE1BQU0sT0FBTyxHQUFHLCtCQUErQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxRCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzthQUMvQztZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCw2REFBNkQ7UUFDN0QsTUFBTSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQywwQkFBdUQsRUFBRSxjQUErQjtZQUNwSSxNQUFNLFVBQVUsR0FBRyxNQUFNLDBCQUEwQixDQUFDLFlBQVks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