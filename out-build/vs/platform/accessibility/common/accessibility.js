/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3r = exports.$2r = exports.AccessibilitySupport = exports.$1r = void 0;
    exports.$1r = (0, instantiation_1.$Bh)('accessibilityService');
    var AccessibilitySupport;
    (function (AccessibilitySupport) {
        /**
         * This should be the browser case where it is not known if a screen reader is attached or no.
         */
        AccessibilitySupport[AccessibilitySupport["Unknown"] = 0] = "Unknown";
        AccessibilitySupport[AccessibilitySupport["Disabled"] = 1] = "Disabled";
        AccessibilitySupport[AccessibilitySupport["Enabled"] = 2] = "Enabled";
    })(AccessibilitySupport || (exports.AccessibilitySupport = AccessibilitySupport = {}));
    exports.$2r = new contextkey_1.$2i('accessibilityModeEnabled', false);
    function $3r(obj) {
        return obj && typeof obj === 'object'
            && typeof obj.label === 'string'
            && (typeof obj.role === 'undefined' || typeof obj.role === 'string');
    }
    exports.$3r = $3r;
});
//# sourceMappingURL=accessibility.js.map