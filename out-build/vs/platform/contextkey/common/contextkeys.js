/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/nls!vs/platform/contextkey/common/contextkeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, platform_1, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$93 = exports.$83 = exports.$73 = exports.$63 = exports.$53 = exports.$43 = exports.$33 = exports.$23 = exports.$13 = exports.$Z3 = exports.$Y3 = void 0;
    exports.$Y3 = new contextkey_1.$2i('isMac', platform_1.$j, (0, nls_1.localize)(0, null));
    exports.$Z3 = new contextkey_1.$2i('isLinux', platform_1.$k, (0, nls_1.localize)(1, null));
    exports.$13 = new contextkey_1.$2i('isWindows', platform_1.$i, (0, nls_1.localize)(2, null));
    exports.$23 = new contextkey_1.$2i('isWeb', platform_1.$o, (0, nls_1.localize)(3, null));
    exports.$33 = new contextkey_1.$2i('isMacNative', platform_1.$j && !platform_1.$o, (0, nls_1.localize)(4, null));
    exports.$43 = new contextkey_1.$2i('isIOS', platform_1.$q, (0, nls_1.localize)(5, null));
    exports.$53 = new contextkey_1.$2i('isMobile', platform_1.$r, (0, nls_1.localize)(6, null));
    exports.$63 = new contextkey_1.$2i('isDevelopment', false, true);
    exports.$73 = new contextkey_1.$2i('productQualityType', '', (0, nls_1.localize)(7, null));
    exports.$83 = 'inputFocus';
    exports.$93 = new contextkey_1.$2i(exports.$83, false, (0, nls_1.localize)(8, null));
});
//# sourceMappingURL=contextkeys.js.map