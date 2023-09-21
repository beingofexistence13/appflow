/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mm = exports.$lm = void 0;
    exports.$lm = (0, instantiation_1.$Bh)('extensionHostStatusService');
    class $mm {
        constructor() {
            this.a = new Map();
        }
        setExitInfo(reconnectionToken, info) {
            this.a.set(reconnectionToken, info);
        }
        getExitInfo(reconnectionToken) {
            return this.a.get(reconnectionToken) || null;
        }
    }
    exports.$mm = $mm;
});
//# sourceMappingURL=extensionHostStatusService.js.map