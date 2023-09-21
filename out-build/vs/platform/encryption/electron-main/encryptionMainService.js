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
define(["require", "exports", "electron", "vs/base/common/platform", "vs/platform/log/common/log"], function (require, exports, electron_1, platform_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Z5b = void 0;
    const safeStorage = electron_1.safeStorage;
    let $Z5b = class $Z5b {
        constructor(a) {
            this.a = a;
            // if this commandLine switch is set, the user has opted in to using basic text encryption
            if (electron_1.app.commandLine.getSwitchValue('password-store') === "basic" /* PasswordStoreCLIOption.basic */) {
                safeStorage.setUsePlainTextEncryption?.(true);
            }
        }
        async encrypt(value) {
            this.a.trace('[EncryptionMainService] Encrypting value.');
            try {
                const result = JSON.stringify(safeStorage.encryptString(value));
                this.a.trace('[EncryptionMainService] Encrypted value.');
                return result;
            }
            catch (e) {
                this.a.error(e);
                throw e;
            }
        }
        async decrypt(value) {
            let parsedValue;
            try {
                parsedValue = JSON.parse(value);
                if (!parsedValue.data) {
                    throw new Error(`[EncryptionMainService] Invalid encrypted value: ${value}`);
                }
                const bufferToDecrypt = Buffer.from(parsedValue.data);
                this.a.trace('[EncryptionMainService] Decrypting value.');
                const result = safeStorage.decryptString(bufferToDecrypt);
                this.a.trace('[EncryptionMainService] Decrypted value.');
                return result;
            }
            catch (e) {
                this.a.error(e);
                throw e;
            }
        }
        isEncryptionAvailable() {
            return Promise.resolve(safeStorage.isEncryptionAvailable());
        }
        getKeyStorageProvider() {
            if (platform_1.$i) {
                return Promise.resolve("dpapi" /* KnownStorageProvider.dplib */);
            }
            if (platform_1.$j) {
                return Promise.resolve("keychain_access" /* KnownStorageProvider.keychainAccess */);
            }
            if (safeStorage.getSelectedStorageBackend) {
                try {
                    const result = safeStorage.getSelectedStorageBackend();
                    return Promise.resolve(result);
                }
                catch (e) {
                    this.a.error(e);
                }
            }
            return Promise.resolve("unknown" /* KnownStorageProvider.unknown */);
        }
        async setUsePlainTextEncryption() {
            if (platform_1.$i) {
                throw new Error('Setting plain text encryption is not supported on Windows.');
            }
            if (platform_1.$j) {
                throw new Error('Setting plain text encryption is not supported on macOS.');
            }
            if (!safeStorage.setUsePlainTextEncryption) {
                throw new Error('Setting plain text encryption is not supported.');
            }
            safeStorage.setUsePlainTextEncryption(true);
        }
    };
    exports.$Z5b = $Z5b;
    exports.$Z5b = $Z5b = __decorate([
        __param(0, log_1.$5i)
    ], $Z5b);
});
//# sourceMappingURL=encryptionMainService.js.map