/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lazy"], function (require, exports, assert, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Lazy', () => {
        test('lazy values should only be resolved once', () => {
            let counter = 0;
            const value = new lazy_1.$T(() => ++counter);
            assert.strictEqual(value.hasValue, false);
            assert.strictEqual(value.value, 1);
            assert.strictEqual(value.hasValue, true);
            assert.strictEqual(value.value, 1); // make sure we did not evaluate again
        });
        test('lazy values handle error case', () => {
            let counter = 0;
            const value = new lazy_1.$T(() => { throw new Error(`${++counter}`); });
            assert.strictEqual(value.hasValue, false);
            assert.throws(() => value.value, /\b1\b/);
            assert.strictEqual(value.hasValue, true);
            assert.throws(() => value.value, /\b1\b/);
        });
    });
});
//# sourceMappingURL=lazy.test.js.map