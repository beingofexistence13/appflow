/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Syb = void 0;
    class $Syb {
        constructor(actual) {
            this.a = actual;
            this.b = new Map();
        }
        dumpDebugInfo() {
            return this.a.dumpDebugInfo();
        }
        resolveKeyboardEvent(keyboardEvent) {
            return this.a.resolveKeyboardEvent(keyboardEvent);
        }
        resolveKeybinding(keybinding) {
            const hashCode = keybinding.getHashCode();
            const resolved = this.b.get(hashCode);
            if (!resolved) {
                const r = this.a.resolveKeybinding(keybinding);
                this.b.set(hashCode, r);
                return r;
            }
            return resolved;
        }
    }
    exports.$Syb = $Syb;
});
//# sourceMappingURL=keyboardMapper.js.map