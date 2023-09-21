/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet"], function (require, exports, assert, utils_1, smallImmutableSet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Bracket Pair Colorizer - ImmutableSet', () => {
        (0, utils_1.$bT)();
        test('Basic', () => {
            const keyProvider = new smallImmutableSet_1.$Nt();
            const empty = smallImmutableSet_1.$Lt.getEmpty();
            const items1 = empty.add('item1', keyProvider);
            const items12 = items1.add('item2', keyProvider);
            const items2 = empty.add('item2', keyProvider);
            const items21 = items2.add('item1', keyProvider);
            const items3 = empty.add('item3', keyProvider);
            assert.strictEqual(items12.intersects(items1), true);
            assert.strictEqual(items12.has('item1', keyProvider), true);
            assert.strictEqual(items12.intersects(items3), false);
            assert.strictEqual(items12.has('item3', keyProvider), false);
            assert.strictEqual(items21.equals(items12), true);
            assert.strictEqual(items21.equals(items2), false);
        });
        test('Many Elements', () => {
            const keyProvider = new smallImmutableSet_1.$Nt();
            let set = smallImmutableSet_1.$Lt.getEmpty();
            for (let i = 0; i < 100; i++) {
                keyProvider.getKey(`item${i}`);
                if (i % 2 === 0) {
                    set = set.add(`item${i}`, keyProvider);
                }
            }
            for (let i = 0; i < 100; i++) {
                assert.strictEqual(set.has(`item${i}`, keyProvider), i % 2 === 0);
            }
        });
    });
});
//# sourceMappingURL=smallImmutableSet.test.js.map