/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/encryption/common/encryptionService", "vs/platform/instantiation/common/extensions"], function (require, exports, encryptionService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_2b = void 0;
    class $_2b {
        encrypt(value) {
            return Promise.resolve(value);
        }
        decrypt(value) {
            return Promise.resolve(value);
        }
        isEncryptionAvailable() {
            return Promise.resolve(false);
        }
        getKeyStorageProvider() {
            return Promise.resolve("basic_text" /* KnownStorageProvider.basicText */);
        }
        setUsePlainTextEncryption() {
            return Promise.resolve(undefined);
        }
    }
    exports.$_2b = $_2b;
    (0, extensions_1.$mr)(encryptionService_1.$BT, $_2b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=encryptionService.js.map