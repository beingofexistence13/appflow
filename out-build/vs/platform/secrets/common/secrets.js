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
define(["require", "exports", "vs/base/common/async", "vs/platform/encryption/common/encryptionService", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/base/common/event", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/base/common/lazy"], function (require, exports, async_1, encryptionService_1, instantiation_1, storage_1, event_1, log_1, lifecycle_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GT = exports.$FT = void 0;
    exports.$FT = (0, instantiation_1.$Bh)('secretStorageService');
    let $GT = class $GT extends lifecycle_1.$kc {
        constructor(h, j, m, n) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.a = 'secret://';
            this.b = this.B(new event_1.$fd());
            this.onDidChangeSecret = this.b.event;
            this.c = new async_1.$Cg();
            this.f = 'unknown';
            this.g = this.B(new lifecycle_1.$jc());
            this.r = new lazy_1.$T(() => this.t());
        }
        /**
         * @Note initialize must be called first so that this can be resolved properly
         * otherwise it will return 'unknown'.
         */
        get type() {
            return this.f;
        }
        get s() {
            return this.r.value;
        }
        get(key) {
            return this.c.queue(key, async () => {
                const storageService = await this.s;
                const fullKey = this.y(key);
                this.n.trace('[secrets] getting secret for key:', fullKey);
                const encrypted = storageService.get(fullKey, -1 /* StorageScope.APPLICATION */);
                if (!encrypted) {
                    this.n.trace('[secrets] no secret found for key:', fullKey);
                    return undefined;
                }
                try {
                    this.n.trace('[secrets] decrypting gotten secret for key:', fullKey);
                    // If the storage service is in-memory, we don't need to decrypt
                    const result = this.f === 'in-memory'
                        ? encrypted
                        : await this.m.decrypt(encrypted);
                    this.n.trace('[secrets] decrypted secret for key:', fullKey);
                    return result;
                }
                catch (e) {
                    this.n.error(e);
                    this.delete(key);
                    return undefined;
                }
            });
        }
        set(key, value) {
            return this.c.queue(key, async () => {
                const storageService = await this.s;
                this.n.trace('[secrets] encrypting secret for key:', key);
                let encrypted;
                try {
                    // If the storage service is in-memory, we don't need to encrypt
                    encrypted = this.f === 'in-memory'
                        ? value
                        : await this.m.encrypt(value);
                }
                catch (e) {
                    this.n.error(e);
                    throw e;
                }
                const fullKey = this.y(key);
                this.n.trace('[secrets] storing encrypted secret for key:', fullKey);
                storageService.store(fullKey, encrypted, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this.n.trace('[secrets] stored encrypted secret for key:', fullKey);
            });
        }
        delete(key) {
            return this.c.queue(key, async () => {
                const storageService = await this.s;
                const fullKey = this.y(key);
                this.n.trace('[secrets] deleting secret for key:', fullKey);
                storageService.remove(fullKey, -1 /* StorageScope.APPLICATION */);
                this.n.trace('[secrets] deleted secret for key:', fullKey);
            });
        }
        async t() {
            let storageService;
            if (!this.h && await this.m.isEncryptionAvailable()) {
                this.n.trace(`[SecretStorageService] Encryption is available, using persisted storage`);
                this.f = 'persisted';
                storageService = this.j;
            }
            else {
                // If we already have an in-memory storage service, we don't need to recreate it
                if (this.f === 'in-memory') {
                    return this.j;
                }
                this.n.trace('[SecretStorageService] Encryption is not available, falling back to in-memory storage');
                this.f = 'in-memory';
                storageService = this.B(new storage_1.$Zo());
            }
            this.g.clear();
            this.g.add(storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, undefined, this.g)(e => {
                this.w(e.key);
            }));
            return storageService;
        }
        u() {
            this.r = new lazy_1.$T(() => this.t());
        }
        w(key) {
            if (!key.startsWith(this.a)) {
                return;
            }
            const secretKey = key.slice(this.a.length);
            this.n.trace(`[SecretStorageService] Notifying change in value for secret: ${secretKey}`);
            this.b.fire(secretKey);
        }
        y(key) {
            return `${this.a}${key}`;
        }
    };
    exports.$GT = $GT;
    exports.$GT = $GT = __decorate([
        __param(1, storage_1.$Vo),
        __param(2, encryptionService_1.$BT),
        __param(3, log_1.$5i)
    ], $GT);
});
//# sourceMappingURL=secrets.js.map