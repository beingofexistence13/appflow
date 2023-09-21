/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/button/button", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/toggle/toggle", "vs/base/common/async", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/browser/ui/progressbar/progressbar", "vs/platform/quickinput/browser/quickInputController", "vs/platform/theme/test/common/testThemeService", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, inputBox_1, button_1, listWidget_1, toggle_1, async_1, countBadge_1, keybindingLabel_1, progressbar_1, quickInputController_1, testThemeService_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Sets up an `onShow` listener to allow us to wait until the quick pick is shown (useful when triggering an `accept()` right after launching a quick pick)
    // kick this off before you launch the picker and then await the promise returned after you launch the picker.
    async function setupWaitTilShownListener(controller) {
        const result = await (0, async_1.$yg)(new Promise(resolve => {
            const event = controller.onShow(_ => {
                event.dispose();
                resolve(true);
            });
        }), 2000);
        if (!result) {
            throw new Error('Cancelled');
        }
    }
    suite('QuickInput', () => {
        const store = (0, utils_1.$bT)();
        let controller;
        setup(() => {
            const fixture = document.createElement('div');
            document.body.appendChild(fixture);
            store.add((0, lifecycle_1.$ic)(() => document.body.removeChild(fixture)));
            controller = store.add(new quickInputController_1.$GAb({
                container: fixture,
                idPrefix: 'testQuickInput',
                ignoreFocusOut() { return true; },
                returnFocus() { },
                backKeybindingLabel() { return undefined; },
                setContextKey() { return undefined; },
                linkOpenerDelegate(content) { },
                createList: (user, container, delegate, renderers, options) => new listWidget_1.$wQ(user, container, delegate, renderers, options),
                hoverDelegate: {
                    showHover(options, focus) {
                        return undefined;
                    },
                    delay: 200
                },
                styles: {
                    button: button_1.$6Q,
                    countBadge: countBadge_1.$mR,
                    inputBox: inputBox_1.$rR,
                    toggle: toggle_1.$IQ,
                    keybindingLabel: keybindingLabel_1.$SR,
                    list: listWidget_1.$vQ,
                    progressBar: progressbar_1.$XR,
                    widget: {
                        quickInputBackground: undefined,
                        quickInputForeground: undefined,
                        quickInputTitleBackground: undefined,
                        widgetBorder: undefined,
                        widgetShadow: undefined,
                    },
                    pickerGroup: {
                        pickerGroupBorder: undefined,
                        pickerGroupForeground: undefined,
                    }
                }
            }, new testThemeService_1.$K0b()));
            // initial layout
            controller.layout({ height: 20, width: 40 }, 0);
        });
        test('pick - basecase', async () => {
            const item = { label: 'foo' };
            const wait = setupWaitTilShownListener(controller);
            const pickPromise = controller.pick([item, { label: 'bar' }]);
            await wait;
            controller.accept();
            const pick = await (0, async_1.$yg)(pickPromise, 2000);
            assert.strictEqual(pick, item);
        });
        test('pick - activeItem is honored', async () => {
            const item = { label: 'foo' };
            const wait = setupWaitTilShownListener(controller);
            const pickPromise = controller.pick([{ label: 'bar' }, item], { activeItem: item });
            await wait;
            controller.accept();
            const pick = await pickPromise;
            assert.strictEqual(pick, item);
        });
        test('input - basecase', async () => {
            const wait = setupWaitTilShownListener(controller);
            const inputPromise = controller.input({ value: 'foo' });
            await wait;
            controller.accept();
            const value = await (0, async_1.$yg)(inputPromise, 2000);
            assert.strictEqual(value, 'foo');
        });
        test('onDidChangeValue - gets triggered when .value is set', async () => {
            const quickpick = store.add(controller.createQuickPick());
            let value = undefined;
            store.add(quickpick.onDidChangeValue((e) => value = e));
            // Trigger a change
            quickpick.value = 'changed';
            try {
                assert.strictEqual(value, quickpick.value);
            }
            finally {
                quickpick.dispose();
            }
        });
        test('keepScrollPosition - works with activeItems', async () => {
            const quickpick = store.add(controller.createQuickPick());
            const items = [];
            for (let i = 0; i < 1000; i++) {
                items.push({ label: `item ${i}` });
            }
            quickpick.items = items;
            // setting the active item should cause the quick pick to scroll to the bottom
            quickpick.activeItems = [items[items.length - 1]];
            quickpick.show();
            const cursorTop = quickpick.Nb;
            assert.notStrictEqual(cursorTop, 0);
            quickpick.keepScrollPosition = true;
            quickpick.activeItems = [items[0]];
            assert.strictEqual(cursorTop, quickpick.Nb);
            quickpick.keepScrollPosition = false;
            quickpick.activeItems = [items[0]];
            assert.strictEqual(quickpick.Nb, 0);
        });
        test('keepScrollPosition - works with items', async () => {
            const quickpick = store.add(controller.createQuickPick());
            const items = [];
            for (let i = 0; i < 1000; i++) {
                items.push({ label: `item ${i}` });
            }
            quickpick.items = items;
            // setting the active item should cause the quick pick to scroll to the bottom
            quickpick.activeItems = [items[items.length - 1]];
            quickpick.show();
            const cursorTop = quickpick.Nb;
            assert.notStrictEqual(cursorTop, 0);
            quickpick.keepScrollPosition = true;
            quickpick.items = items;
            assert.strictEqual(cursorTop, quickpick.Nb);
            quickpick.keepScrollPosition = false;
            quickpick.items = items;
            assert.strictEqual(quickpick.Nb, 0);
        });
        test('selectedItems - verify previous selectedItems does not hang over to next set of items', async () => {
            const quickpick = store.add(controller.createQuickPick());
            quickpick.items = [{ label: 'step 1' }];
            quickpick.show();
            void (await new Promise(resolve => {
                store.add(quickpick.onDidAccept(() => {
                    quickpick.canSelectMany = true;
                    quickpick.items = [{ label: 'a' }, { label: 'b' }, { label: 'c' }];
                    resolve();
                }));
                // accept 'step 1'
                controller.accept();
            }));
            // accept in multi-select
            controller.accept();
            // Since we don't select any items, the selected items should be empty
            assert.strictEqual(quickpick.selectedItems.length, 0);
        });
    });
});
//# sourceMappingURL=quickinput.test.js.map