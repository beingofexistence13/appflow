/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ET = exports.$DT = exports.KnownStorageProvider = exports.PasswordStoreCLIOption = exports.$CT = exports.$BT = void 0;
    exports.$BT = (0, instantiation_1.$Bh)('encryptionService');
    exports.$CT = (0, instantiation_1.$Bh)('encryptionMainService');
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
    function $DT(backend) {
        return backend === "kwallet" /* KnownStorageProvider.kwallet */
            || backend === "kwallet5" /* KnownStorageProvider.kwallet5 */
            || backend === "kwallet6" /* KnownStorageProvider.kwallet6 */;
    }
    exports.$DT = $DT;
    function $ET(backend) {
        return backend === "gnome_any" /* KnownStorageProvider.gnomeAny */
            || backend === "gnome_libsecret" /* KnownStorageProvider.gnomeLibsecret */
            || backend === "gnome_keyring" /* KnownStorageProvider.gnomeKeyring */;
    }
    exports.$ET = $ET;
});
//# sourceMappingURL=encryptionService.js.map