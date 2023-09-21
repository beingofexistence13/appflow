/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/test/common/utils"], function (require, exports, assert, actionbar_1, actions_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Actionbar', () => {
        const store = (0, utils_1.$bT)();
        test('prepareActions()', function () {
            const a1 = new actions_1.$ii();
            const a2 = new actions_1.$ii();
            const a3 = store.add(new actions_1.$gi('a3'));
            const a4 = new actions_1.$ii();
            const a5 = new actions_1.$ii();
            const a6 = store.add(new actions_1.$gi('a6'));
            const a7 = new actions_1.$ii();
            const actions = (0, actionbar_1.$2P)([a1, a2, a3, a4, a5, a6, a7]);
            assert.strictEqual(actions.length, 3); // duplicate separators get removed
            assert(actions[0] === a3);
            assert(actions[1] === a5);
            assert(actions[2] === a6);
        });
        test('hasAction()', function () {
            const container = document.createElement('div');
            const actionbar = store.add(new actionbar_1.$1P(container));
            const a1 = store.add(new actions_1.$gi('a1'));
            const a2 = store.add(new actions_1.$gi('a2'));
            actionbar.push(a1);
            assert.strictEqual(actionbar.hasAction(a1), true);
            assert.strictEqual(actionbar.hasAction(a2), false);
            actionbar.pull(0);
            assert.strictEqual(actionbar.hasAction(a1), false);
            actionbar.push(a1, { index: 1 });
            actionbar.push(a2, { index: 0 });
            assert.strictEqual(actionbar.hasAction(a1), true);
            assert.strictEqual(actionbar.hasAction(a2), true);
            actionbar.pull(0);
            assert.strictEqual(actionbar.hasAction(a1), true);
            assert.strictEqual(actionbar.hasAction(a2), false);
            actionbar.pull(0);
            assert.strictEqual(actionbar.hasAction(a1), false);
            assert.strictEqual(actionbar.hasAction(a2), false);
            actionbar.push(a1);
            assert.strictEqual(actionbar.hasAction(a1), true);
            actionbar.clear();
            assert.strictEqual(actionbar.hasAction(a1), false);
        });
    });
});
//# sourceMappingURL=actionbar.test.js.map