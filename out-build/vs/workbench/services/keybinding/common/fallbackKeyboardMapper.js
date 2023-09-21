/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keybindings", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, keybindings_1, usLayoutResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$o3b = void 0;
    /**
     * A keyboard mapper to be used when reading the keymap from the OS fails.
     */
    class $o3b {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        dumpDebugInfo() {
            return 'FallbackKeyboardMapper dispatching on keyCode';
        }
        resolveKeyboardEvent(keyboardEvent) {
            const ctrlKey = keyboardEvent.ctrlKey || (this.a && keyboardEvent.altGraphKey);
            const altKey = keyboardEvent.altKey || (this.a && keyboardEvent.altGraphKey);
            const chord = new keybindings_1.$yq(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
            const result = this.resolveKeybinding(new keybindings_1.$Aq([chord]));
            return result[0];
        }
        resolveKeybinding(keybinding) {
            return usLayoutResolvedKeybinding_1.$n3b.resolveKeybinding(keybinding, this.b);
        }
    }
    exports.$o3b = $o3b;
});
//# sourceMappingURL=fallbackKeyboardMapper.js.map