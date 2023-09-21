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
define(["require", "exports", "vs/platform/storage/common/storage", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/extensionManagement/common/extensionStorage", "vs/workbench/services/extensions/common/extensionStorageMigration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log"], function (require, exports, storage_1, extHost_protocol_1, extHostCustomers_1, lifecycle_1, platform_1, extensionStorage_1, extensionStorageMigration_1, instantiation_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Qkb = void 0;
    let $Qkb = class $Qkb {
        constructor(extHostContext, d, f, g, h) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = new lifecycle_1.$jc();
            this.c = new Map();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostStorage);
            this.b.add(this.f.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this.b)(e => {
                if (this.c.has(e.key)) {
                    const rawState = this.d.getExtensionStateRaw(e.key, true);
                    if (typeof rawState === 'string') {
                        this.a.$acceptValue(true, e.key, rawState);
                    }
                }
            }));
        }
        dispose() {
            this.b.dispose();
        }
        async $initializeExtensionStorage(shared, extensionId) {
            await this.i(extensionId, shared);
            if (shared) {
                this.c.set(extensionId, true);
            }
            return this.d.getExtensionStateRaw(extensionId, shared);
        }
        async $setValue(shared, key, value) {
            this.d.setExtensionState(key, value, shared);
        }
        $registerExtensionStorageKeysToSync(extension, keys) {
            this.d.setKeysForSync(extension, keys);
        }
        async i(extensionId, shared) {
            try {
                let sourceExtensionId = this.d.getSourceExtensionToMigrate(extensionId);
                // TODO: @sandy081 - Remove it after 6 months
                // If current extension does not have any migration requested
                // Then check if the extension has to be migrated for using lower case in web
                // If so, migrate the extension state from lower case id to its normal id.
                if (!sourceExtensionId && platform_1.$o && extensionId !== extensionId.toLowerCase()) {
                    sourceExtensionId = extensionId.toLowerCase();
                }
                if (sourceExtensionId) {
                    // TODO: @sandy081 - Remove it after 6 months
                    // In Web, extension state was used to be stored in lower case extension id.
                    // Hence check that if the lower cased source extension was not yet migrated in web
                    // If not take the lower cased source extension id for migration
                    if (platform_1.$o && sourceExtensionId !== sourceExtensionId.toLowerCase() && this.d.getExtensionState(sourceExtensionId.toLowerCase(), shared) && !this.d.getExtensionState(sourceExtensionId, shared)) {
                        sourceExtensionId = sourceExtensionId.toLowerCase();
                    }
                    await (0, extensionStorageMigration_1.$Pkb)(sourceExtensionId, extensionId, shared, this.g);
                }
            }
            catch (error) {
                this.h.error(error);
            }
        }
    };
    exports.$Qkb = $Qkb;
    exports.$Qkb = $Qkb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadStorage),
        __param(1, extensionStorage_1.$Tz),
        __param(2, storage_1.$Vo),
        __param(3, instantiation_1.$Ah),
        __param(4, log_1.$5i)
    ], $Qkb);
});
//# sourceMappingURL=mainThreadStorage.js.map