/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/base/test/common/utils", "vs/platform/actions/common/actions", "vs/platform/actions/common/menuService", "vs/platform/commands/test/common/nullCommandService", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/storage/common/storage"], function (require, exports, assert, lifecycle_1, uuid_1, utils_1, actions_1, menuService_1, nullCommandService_1, mockKeybindingService_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --- service instances
    const contextKeyService = new class extends mockKeybindingService_1.MockContextKeyService {
        contextMatchesRules() {
            return true;
        }
    };
    // --- tests
    suite('MenuService', function () {
        let menuService;
        const disposables = new lifecycle_1.DisposableStore();
        let testMenuId;
        setup(function () {
            menuService = new menuService_1.MenuService(nullCommandService_1.NullCommandService, new storage_1.InMemoryStorageService());
            testMenuId = new actions_1.MenuId(`testo/${(0, uuid_1.generateUuid)()}`);
            disposables.clear();
        });
        teardown(function () {
            disposables.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('group sorting', function () {
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'one', title: 'FOO' },
                group: '0_hello'
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'two', title: 'FOO' },
                group: 'hello'
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'three', title: 'FOO' },
                group: 'Hello'
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'four', title: 'FOO' },
                group: ''
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
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
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'a', title: 'aaa' },
                group: 'Hello'
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'b', title: 'fff' },
                group: 'Hello'
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
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
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'a', title: 'aaa' },
                group: 'Hello',
                order: 10
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'b', title: 'fff' },
                group: 'Hello'
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'c', title: 'zzz' },
                group: 'Hello',
                order: -1
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
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
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'a', title: 'aaa' },
                group: 'navigation',
                order: 1.3
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'b', title: 'fff' },
                group: 'navigation',
                order: 1.2
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
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
            disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
                command: { id: 'a', title: 'Explicit' }
            }));
            disposables.add(actions_1.MenuRegistry.addCommand({ id: 'b', title: 'Implicit' }));
            let foundA = false;
            let foundB = false;
            for (const item of actions_1.MenuRegistry.getMenuItems(actions_1.MenuId.CommandPalette)) {
                if ((0, actions_1.isIMenuItem)(item)) {
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
            const id = (0, uuid_1.generateUuid)();
            const menu = new actions_1.MenuId(id);
            assert.throws(() => new actions_1.MenuId(id));
            assert.ok(menu === actions_1.MenuId.for(id));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudVNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2FjdGlvbnMvdGVzdC9jb21tb24vbWVudVNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVloRyx3QkFBd0I7SUFFeEIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLEtBQU0sU0FBUSw2Q0FBcUI7UUFDdkQsbUJBQW1CO1lBQzNCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztLQUNELENBQUM7SUFFRixZQUFZO0lBRVosS0FBSyxDQUFDLGFBQWEsRUFBRTtRQUVwQixJQUFJLFdBQXdCLENBQUM7UUFDN0IsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDMUMsSUFBSSxVQUFrQixDQUFDO1FBRXZCLEtBQUssQ0FBQztZQUNMLFdBQVcsR0FBRyxJQUFJLHlCQUFXLENBQUMsdUNBQWtCLEVBQUUsSUFBSSxnQ0FBc0IsRUFBRSxDQUFDLENBQUM7WUFDaEYsVUFBVSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxTQUFTLElBQUEsbUJBQVksR0FBRSxFQUFFLENBQUMsQ0FBQztZQUNuRCxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUM7WUFDUixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUVyQixXQUFXLENBQUMsR0FBRyxDQUFDLHNCQUFZLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRTtnQkFDdkQsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO2dCQUNwQyxLQUFLLEVBQUUsU0FBUzthQUNoQixD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