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
    var $Uz_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Uz = exports.$Tz = void 0;
    exports.$Tz = (0, instantiation_1.$Bh)('IExtensionStorageService');
    const EXTENSION_KEYS_ID_VERSION_REGEX = /^extensionKeys\/([^.]+\..+)@(\d+\.\d+\.\d+(-.*)?)$/;
    let $Uz = class $Uz extends lifecycle_1.$kc {
        static { $Uz_1 = this; }
        static { this.a = 512 * 1024; }
        static b(extension) {
            return `extensionKeys/${(0, extensionManagementUtil_1.$to)(extension.id)}@${extension.version}`;
        }
        static c(key) {
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
            for (const [id, versions] of $Uz_1.f(storageService)) {
                const extensionVersion = extensions.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id }))?.manifest.version;
                for (const version of versions) {
                    if (extensionVersion !== version) {
                        extensionVersionsToRemove.push($Uz_1.b({ id, version }));
                    }
                }
            }
            for (const key of extensionVersionsToRemove) {
                storageService.remove(key, 0 /* StorageScope.PROFILE */);
            }
        }
        static f(storageService) {
            const extensionsWithKeysForSync = new Map();
            const keys = storageService.keys(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            for (const key of keys) {
                const extensionIdWithVersion = $Uz_1.c(key);
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
        constructor(j, m, n) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeExtensionStorageToSync = this.g.event;
            this.h = $Uz_1.f(j);
            this.B(this.j.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this.B(new lifecycle_1.$jc()))(e => this.r(e)));
        }
        r(e) {
            // State of extension with keys for sync has changed
            if (this.h.has(e.key.toLowerCase())) {
                this.g.fire();
                return;
            }
            // Keys for sync of an extension has changed
            const extensionIdWithVersion = $Uz_1.c(e.key);
            if (extensionIdWithVersion) {
                if (this.j.get(e.key, 0 /* StorageScope.PROFILE */) === undefined) {
                    this.h.delete(extensionIdWithVersion.id.toLowerCase());
                }
                else {
                    let versions = this.h.get(extensionIdWithVersion.id.toLowerCase());
                    if (!versions) {
                        this.h.set(extensionIdWithVersion.id.toLowerCase(), versions = []);
                    }
                    versions.push(extensionIdWithVersion.version);
                    this.g.fire();
                }
                return;
            }
        }
        s(extension) {
            if ((0, types_1.$jf)(extension)) {
                return extension;
            }
            const publisher = extension.manifest ? extension.manifest.publisher : extension.publisher;
            const name = extension.manifest ? extension.manifest.name : extension.name;
            return (0, extensionManagementUtil_1.$so)(publisher, name);
        }
        getExtensionState(extension, global) {
            const extensionId = this.s(extension);
            const jsonValue = this.getExtensionStateRaw(extension, global);
            if (jsonValue) {
                try {
                    return JSON.parse(jsonValue);
                }
                catch (error) {
                    // Do not fail this call but log it for diagnostics
                    // https://github.com/microsoft/vscode/issues/132777
                    this.n.error(`[mainThreadStorage] unexpected error parsing storage contents (extensionId: ${extensionId}, global: ${global}): ${error}`);
                }
            }
            return undefined;
        }
        getExtensionStateRaw(extension, global) {
            const extensionId = this.s(extension);
            const rawState = this.j.get(extensionId, global ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */);
            if (rawState && rawState?.length > $Uz_1.a) {
                this.n.warn(`[mainThreadStorage] large extension state detected (extensionId: ${extensionId}, global: ${global}): ${rawState.length / 1024}kb. Consider to use 'storageUri' or 'globalStorageUri' to store this data on disk instead.`);
            }
            return rawState;
        }
        setExtensionState(extension, state, global) {
            const extensionId = this.s(extension);
            if (state === undefined) {
                this.j.remove(extensionId, global ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */);
            }
            else {
                this.j.store(extensionId, JSON.stringify(state), global ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        setKeysForSync(extensionIdWithVersion, keys) {
            this.j.store($Uz_1.b(extensionIdWithVersion), JSON.stringify(keys), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        getKeysForSync(extensionIdWithVersion) {
            const extensionKeysForSyncFromProduct = this.m.extensionSyncedKeys?.[extensionIdWithVersion.id.toLowerCase()];
            const extensionKeysForSyncFromStorageValue = this.j.get($Uz_1.b(extensionIdWithVersion), 0 /* StorageScope.PROFILE */);
            const extensionKeysForSyncFromStorage = extensionKeysForSyncFromStorageValue ? JSON.parse(extensionKeysForSyncFromStorageValue) : undefined;
            return extensionKeysForSyncFromStorage && extensionKeysForSyncFromProduct
                ? (0, arrays_1.$Kb)([...extensionKeysForSyncFromStorage, ...extensionKeysForSyncFromProduct])
                : (extensionKeysForSyncFromStorage || extensionKeysForSyncFromProduct);
        }
        addToMigrationList(from, to) {
            if (from !== to) {
                // remove the duplicates
                const migrationList = this.t.filter(entry => !entry.includes(from) && !entry.includes(to));
                migrationList.push([from, to]);
                this.t = migrationList;
            }
        }
        getSourceExtensionToMigrate(toExtensionId) {
            const entry = this.t.find(([, to]) => toExtensionId === to);
            return entry ? entry[0] : undefined;
        }
        get t() {
            const value = this.j.get('extensionStorage.migrationList', -1 /* StorageScope.APPLICATION */, '[]');
            try {
                const migrationList = JSON.parse(value);
                if (Array.isArray(migrationList)) {
                    return migrationList;
                }
            }
            catch (error) { /* ignore */ }
            return [];
        }
        set t(migrationList) {
            if (migrationList.length) {
                this.j.store('extensionStorage.migrationList', JSON.stringify(migrationList), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.j.remove('extensionStorage.migrationList', -1 /* StorageScope.APPLICATION */);
            }
        }
    };
    exports.$Uz = $Uz;
    exports.$Uz = $Uz = $Uz_1 = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, productService_1.$kj),
        __param(2, log_1.$5i)
    ], $Uz);
});
//# sourceMappingURL=extensionStorage.js.map