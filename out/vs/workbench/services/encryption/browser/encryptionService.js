/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/encryption/common/encryptionService", "vs/platform/instantiation/common/extensions"], function (require, exports, encryptionService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EncryptionService = void 0;
    class EncryptionService {
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
    exports.EncryptionService = EncryptionService;
    (0, extensions_1.registerSingleton)(encryptionService_1.IEncryptionService, EncryptionService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jcnlwdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZW5jcnlwdGlvbi9icm93c2VyL2VuY3J5cHRpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxNQUFhLGlCQUFpQjtRQUk3QixPQUFPLENBQUMsS0FBYTtZQUNwQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELE9BQU8sQ0FBQyxLQUFhO1lBQ3BCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQscUJBQXFCO1lBQ3BCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQscUJBQXFCO1lBQ3BCLE9BQU8sT0FBTyxDQUFDLE9BQU8sbURBQWdDLENBQUM7UUFDeEQsQ0FBQztRQUVELHlCQUF5QjtZQUN4QixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsQ0FBQztLQUNEO0lBdkJELDhDQXVCQztJQUVELElBQUEsOEJBQWlCLEVBQUMsc0NBQWtCLEVBQUUsaUJBQWlCLG9DQUE0QixDQUFDIn0=