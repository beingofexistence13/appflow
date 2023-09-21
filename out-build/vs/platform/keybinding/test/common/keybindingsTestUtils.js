/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keybindings", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, keybindings_1, usLayoutResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$A$b = void 0;
    function $A$b(encodedKeybinding, OS) {
        if (encodedKeybinding === 0) {
            return undefined;
        }
        const keybinding = (0, keybindings_1.$wq)(encodedKeybinding, OS);
        if (!keybinding) {
            return undefined;
        }
        const result = usLayoutResolvedKeybinding_1.$n3b.resolveKeybinding(keybinding, OS);
        if (result.length > 0) {
            return result[0];
        }
        return undefined;
    }
    exports.$A$b = $A$b;
});
//# sourceMappingURL=keybindingsTestUtils.js.map