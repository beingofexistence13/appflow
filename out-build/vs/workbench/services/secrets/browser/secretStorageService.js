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
define(["require", "exports", "vs/base/common/async", "vs/platform/encryption/common/encryptionService", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/secrets/common/secrets", "vs/platform/storage/common/storage", "vs/workbench/services/environment/browser/environmentService"], function (require, exports, async_1, encryptionService_1, extensions_1, log_1, secrets_1, storage_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$2b = void 0;
    let $$2b = class $$2b extends secrets_1.$GT {
        constructor(storageService, encryptionService, environmentService, logService) {
            // We don't have encryption in the browser so instead we use the
            // in-memory base class implementation instead.
            super(true, storageService, encryptionService, logService);
            if (environmentService.options?.secretStorageProvider) {
                this.z = environmentService.options.secretStorageProvider;
                this.C = new async_1.$Cg();
            }
        }
        get(key) {
            if (this.z) {
                return this.C.queue(key, () => this.z.get(key));
            }
            return super.get(key);
        }
        set(key, value) {
            if (this.z) {
                return this.C.queue(key, async () => {
                    await this.z.set(key, value);
                    this.b.fire(key);
                });
            }
            return super.set(key, value);
        }
        delete(key) {
            if (this.z) {
                return this.C.queue(key, async () => {
                    await this.z.delete(key);
                    this.b.fire(key);
                });
            }
            return super.delete(key);
        }
        get type() {
            if (this.z) {
                return this.z.type;
            }
            return super.type;
        }
    };
    exports.$$2b = $$2b;
    exports.$$2b = $$2b = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, encryptionService_1.$BT),
        __param(2, environmentService_1.$LT),
        __param(3, log_1.$5i)
    ], $$2b);
    (0, extensions_1.$mr)(secrets_1.$FT, $$2b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=secretStorageService.js.map