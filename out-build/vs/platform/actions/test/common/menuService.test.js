/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/base/test/common/utils", "vs/platform/actions/common/actions", "vs/platform/actions/common/menuService", "vs/platform/commands/test/common/nullCommandService", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/storage/common/storage"], function (require, exports, assert, lifecycle_1, uuid_1, utils_1, actions_1, menuService_1, nullCommandService_1, mockKeybindingService_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --- service instances
    const contextKeyService = new class extends mockKeybindingService_1.$S0b {
        contextMatchesRules() {
            return true;
        }
    };
    // --- tests
    suite('MenuService', function () {
        let menuService;
        const disposables = new lifecycle_1.$jc();
        let testMenuId;
        setup(function () {
            menuService = new menuService_1.$lyb(nullCommandService_1.$f$b, new storage_1.$Zo());
            testMenuId = new actions_1.$Ru(`testo/${(0, uuid_1.$4f)()}`);
            disposables.clear();
        });
        teardown(function () {
            disposables.clear();
        });
        (0, utils_1.$bT)();
        test('group sorting', function () {
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'one', title: 'FOO' },
                group: '0_hello'
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'two', title: 'FOO' },
                group: 'hello'
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'three', title: 'FOO' },
                group: 'Hello'
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'four', title: 'FOO' },
                group: ''
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'five', title: 'FOO' },
                group: 'navigation'
            }));
            const groups = disposables.add(menuService.createMenu(testMenuId, contextKeyService)).getActions();
            assert.strictEqual(groups.length, 5);
            const [one, two, three, four, five] = groups;
            assert.strictEqual(one[0], 'navigation');
            assert.strictEqual(two[0], '0_hello');
            assert.strictEqual(three[0], 'hello');
            assert.strictEqual(four[0], 'Hello');
            assert.strictEqual(five[0], '');
        });
        test('in group sorting, by title', function () {
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'a', title: 'aaa' },
                group: 'Hello'
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'b', title: 'fff' },
                group: 'Hello'
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'c', title: 'zzz' },
                group: 'Hello'
            }));
            const groups = disposables.add(menuService.createMenu(testMenuId, contextKeyService)).getActions();
            assert.strictEqual(groups.length, 1);
            const [, actions] = groups[0];
            assert.strictEqual(actions.length, 3);
            const [one, two, three] = actions;
            assert.strictEqual(one.id, 'a');
            assert.strictEqual(two.id, 'b');
            assert.strictEqual(three.id, 'c');
        });
        test('in group sorting, by title and order', function () {
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'a', title: 'aaa' },
                group: 'Hello',
                order: 10
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'b', title: 'fff' },
                group: 'Hello'
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'c', title: 'zzz' },
                group: 'Hello',
                order: -1
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'd', title: 'yyy' },
                group: 'Hello',
                order: -1
            }));
            const groups = disposables.add(menuService.createMenu(testMenuId, contextKeyService)).getActions();
            assert.strictEqual(groups.length, 1);
            const [, actions] = groups[0];
            assert.strictEqual(actions.length, 4);
            const [one, two, three, four] = actions;
            assert.strictEqual(one.id, 'd');
            assert.strictEqual(two.id, 'c');
            assert.strictEqual(three.id, 'b');
            assert.strictEqual(four.id, 'a');
        });
        test('in group sorting, special: navigation', function () {
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'a', title: 'aaa' },
                group: 'navigation',
                order: 1.3
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'b', title: 'fff' },
                group: 'navigation',
                order: 1.2
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(testMenuId, {
                command: { id: 'c', title: 'zzz' },
                group: 'navigation',
                order: 1.1
            }));
            const groups = disposables.add(menuService.createMenu(testMenuId, contextKeyService)).getActions();
            assert.strictEqual(groups.length, 1);
            const [[, actions]] = groups;
            assert.strictEqual(actions.length, 3);
            const [one, two, three] = actions;
            assert.strictEqual(one.id, 'c');
            assert.strictEqual(two.id, 'b');
            assert.strictEqual(three.id, 'a');
        });
        test('special MenuId palette', function () {
            disposables.add(actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
                command: { id: 'a', title: 'Explicit' }
            }));
            disposables.add(actions_1.$Tu.addCommand({ id: 'b', title: 'Implicit' }));
            let foundA = false;
            let foundB = false;
            for (const item of actions_1.$Tu.getMenuItems(actions_1.$Ru.CommandPalette)) {
                if ((0, actions_1.$Pu)(item)) {
                    if (item.command.id === 'a') {
                        assert.strictEqual(item.command.title, 'Explicit');
                        foundA = true;
                    }
                    if (item.command.id === 'b') {
                        assert.strictEqual(item.command.title, 'Implicit');
                        foundB = true;
                    }
                }
            }
            assert.strictEqual(foundA, true);
            assert.strictEqual(foundB, true);
        });
        test('Extension contributed submenus missing with errors in output #155030', function () {
            const id = (0, uuid_1.$4f)();
            const menu = new actions_1.$Ru(id);
            assert.throws(() => new actions_1.$Ru(id));
            assert.ok(menu === actions_1.$Ru.for(id));
        });
    });
});
//# sourceMappingURL=menuService.test.js.map