/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isGnome = exports.isKwallet = exports.KnownStorageProvider = exports.PasswordStoreCLIOption = exports.IEncryptionMainService = exports.IEncryptionService = void 0;
    exports.IEncryptionService = (0, instantiation_1.createDecorator)('encryptionService');
    exports.IEncryptionMainService = (0, instantiation_1.createDecorator)('encryptionMainService');
    // The values provided to the `password-store` command line switch.
    // Notice that they are not the same as the values returned by
    // `getSelectedStorageBackend` in the `safeStorage` API.
    var PasswordStoreCLIOption;
    (function (PasswordStoreCLIOption) {
        PasswordStoreCLIOption["kwallet"] = "kwallet";
        PasswordStoreCLIOption["kwallet5"] = "kwallet5";
        PasswordStoreCLIOption["gnome"] = "gnome";
        PasswordStoreCLIOption["gnomeKeyring"] = "gnome-keyring";
        PasswordStoreCLIOption["gnomeLibsecret"] = "gnome-libsecret";
        PasswordStoreCLIOption["basic"] = "basic";
    })(PasswordStoreCLIOption || (exports.PasswordStoreCLIOption = PasswordStoreCLIOption = {}));
    // The values returned by `getSelectedStorageBackend` in the `safeStorage` API.
    var KnownStorageProvider;
    (function (KnownStorageProvider) {
        KnownStorageProvider["unknown"] = "unknown";
        KnownStorageProvider["basicText"] = "basic_text";
        // Linux
        KnownStorageProvider["gnomeAny"] = "gnome_any";
        KnownStorageProvider["gnomeLibsecret"] = "gnome_libsecret";
        KnownStorageProvider["gnomeKeyring"] = "gnome_keyring";
        KnownStorageProvider["kwallet"] = "kwallet";
        KnownStorageProvider["kwallet5"] = "kwallet5";
        KnownStorageProvider["kwallet6"] = "kwallet6";
        // The rest of these are not returned by `getSelectedStorageBackend`
        // but these were added for platform completeness.
        // Windows
        KnownStorageProvider["dplib"] = "dpapi";
        // macOS
        KnownStorageProvider["keychainAccess"] = "keychain_access";
    })(KnownStorageProvider || (exports.KnownStorageProvider = KnownStorageProvider = {}));
    function isKwallet(backend) {
        return backend === "kwallet" /* KnownStorageProvider.kwallet */
            || backend === "kwallet5" /* KnownStorageProvider.kwallet5 */
            || backend === "kwallet6" /* KnownStorageProvider.kwallet6 */;
    }
    exports.isKwallet = isKwallet;
    function isGnome(backend) {
        return backend === "gnome_any" /* KnownStorageProvider.gnomeAny */
            || backend === "gnome_libsecret" /* KnownStorageProvider.gnomeLibsecret */
            || backend === "gnome_keyring" /* KnownStorageProvider.gnomeKeyring */;
    }
    exports.isGnome = isGnome;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jcnlwdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9lbmNyeXB0aW9uL2NvbW1vbi9lbmNyeXB0aW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJbkYsUUFBQSxrQkFBa0IsR0FBRyxJQUFBLCtCQUFlLEVBQXFCLG1CQUFtQixDQUFDLENBQUM7SUFNOUUsUUFBQSxzQkFBc0IsR0FBRyxJQUFBLCtCQUFlLEVBQXlCLHVCQUF1QixDQUFDLENBQUM7SUFjdkcsbUVBQW1FO0lBQ25FLDhEQUE4RDtJQUM5RCx3REFBd0Q7SUFDeEQsSUFBa0Isc0JBT2pCO0lBUEQsV0FBa0Isc0JBQXNCO1FBQ3ZDLDZDQUFtQixDQUFBO1FBQ25CLCtDQUFxQixDQUFBO1FBQ3JCLHlDQUFlLENBQUE7UUFDZix3REFBOEIsQ0FBQTtRQUM5Qiw0REFBa0MsQ0FBQTtRQUNsQyx5Q0FBZSxDQUFBO0lBQ2hCLENBQUMsRUFQaUIsc0JBQXNCLHNDQUF0QixzQkFBc0IsUUFPdkM7SUFFRCwrRUFBK0U7SUFDL0UsSUFBa0Isb0JBb0JqQjtJQXBCRCxXQUFrQixvQkFBb0I7UUFDckMsMkNBQW1CLENBQUE7UUFDbkIsZ0RBQXdCLENBQUE7UUFFeEIsUUFBUTtRQUNSLDhDQUFzQixDQUFBO1FBQ3RCLDBEQUFrQyxDQUFBO1FBQ2xDLHNEQUE4QixDQUFBO1FBQzlCLDJDQUFtQixDQUFBO1FBQ25CLDZDQUFxQixDQUFBO1FBQ3JCLDZDQUFxQixDQUFBO1FBRXJCLG9FQUFvRTtRQUNwRSxrREFBa0Q7UUFFbEQsVUFBVTtRQUNWLHVDQUFlLENBQUE7UUFFZixRQUFRO1FBQ1IsMERBQWtDLENBQUE7SUFDbkMsQ0FBQyxFQXBCaUIsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFvQnJDO0lBRUQsU0FBZ0IsU0FBUyxDQUFDLE9BQWU7UUFDeEMsT0FBTyxPQUFPLGlEQUFpQztlQUMzQyxPQUFPLG1EQUFrQztlQUN6QyxPQUFPLG1EQUFrQyxDQUFDO0lBQy9DLENBQUM7SUFKRCw4QkFJQztJQUVELFNBQWdCLE9BQU8sQ0FBQyxPQUFlO1FBQ3RDLE9BQU8sT0FBTyxvREFBa0M7ZUFDNUMsT0FBTyxnRUFBd0M7ZUFDL0MsT0FBTyw0REFBc0MsQ0FBQztJQUNuRCxDQUFDO0lBSkQsMEJBSUMifQ==