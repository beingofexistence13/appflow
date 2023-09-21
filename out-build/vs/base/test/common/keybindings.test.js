/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keybindings"], function (require, exports, assert, keybindings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('keyCodes', () => {
        test('issue #173325: wrong interpretations of special keys (e.g. [Equal] is mistaken for V)', () => {
            const a = new keybindings_1.$yq(true, false, false, false, 52 /* KeyCode.KeyV */);
            const b = new keybindings_1.$zq(true, false, false, false, 52 /* ScanCode.Equal */);
            assert.strictEqual(a.getHashCode() === b.getHashCode(), false);
        });
    });
});
//# sourceMappingURL=keybindings.test.js.map