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
        const result = await (0, async_1.raceTimeout)(new Promise(resolve => {
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
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let controller;
        setup(() => {
            const fixture = document.createElement('div');
            document.body.appendChild(fixture);
            store.add((0, lifecycle_1.toDisposable)(() => document.body.removeChild(fixture)));
            controller = store.add(new quickInputController_1.QuickInputController({
                container: fixture,
                idPrefix: 'testQuickInput',
                ignoreFocusOut() { return true; },
                returnFocus() { },
                backKeybindingLabel() { return undefined; },
                setContextKey() { return undefined; },
                linkOpenerDelegate(content) { },
                createList: (user, container, delegate, renderers, options) => new listWidget_1.List(user, container, delegate, renderers, options),
                hoverDelegate: {
                    showHover(options, focus) {
                        return undefined;
                    },
                    delay: 200
                },
                styles: {
                    button: button_1.unthemedButtonStyles,
                    countBadge: countBadge_1.unthemedCountStyles,
                    inputBox: inputBox_1.unthemedInboxStyles,
                    toggle: toggle_1.unthemedToggleStyles,
                    keybindingLabel: keybindingLabel_1.unthemedKeybindingLabelOptions,
                    list: listWidget_1.unthemedListStyles,
                    progressBar: progressbar_1.unthemedProgressBarOptions,
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
            }, new testThemeService_1.TestThemeService()));
            // initial layout
            controller.layout({ height: 20, width: 40 }, 0);
        });
        test('pick - basecase', async () => {
            const item = { label: 'foo' };
            const wait = setupWaitTilShownListener(controller);
            const pickPromise = controller.pick([item, { label: 'bar' }]);
            await wait;
            controller.accept();
            const pick = await (0, async_1.raceTimeout)(pickPromise, 2000);
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
            const value = await (0, async_1.raceTimeout)(inputPromise, 2000);
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
            const cursorTop = quickpick.scrollTop;
            assert.notStrictEqual(cursorTop, 0);
            quickpick.keepScrollPosition = true;
            quickpick.activeItems = [items[0]];
            assert.strictEqual(cursorTop, quickpick.scrollTop);
            quickpick.keepScrollPosition = false;
            quickpick.activeItems = [items[0]];
            assert.strictEqual(quickpick.scrollTop, 0);
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
            const cursorTop = quickpick.scrollTop;
            assert.notStrictEqual(cursorTop, 0);
            quickpick.keepScrollPosition = true;
            quickpick.items = items;
            assert.strictEqual(cursorTop, quickpick.scrollTop);
            quickpick.keepScrollPosition = false;
            quickpick.items = items;
            assert.strictEqual(quickpick.scrollTop, 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tpbnB1dC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcXVpY2tpbnB1dC90ZXN0L2Jyb3dzZXIvcXVpY2tpbnB1dC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBaUJoRywySkFBMko7SUFDM0osOEdBQThHO0lBQzlHLEtBQUssVUFBVSx5QkFBeUIsQ0FBQyxVQUFnQztRQUN4RSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsbUJBQVcsRUFBQyxJQUFJLE9BQU8sQ0FBVSxPQUFPLENBQUMsRUFBRTtZQUMvRCxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNuQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFVixJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUM3QjtJQUNGLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTtRQUN4QixNQUFNLEtBQUssR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFDeEQsSUFBSSxVQUFnQyxDQUFDO1FBRXJDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25DLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxD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