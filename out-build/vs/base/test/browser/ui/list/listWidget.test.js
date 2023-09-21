/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/list/listWidget", "vs/base/common/arrays", "vs/base/common/async", "vs/base/test/common/utils"], function (require, exports, assert, listWidget_1, arrays_1, async_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ListWidget', function () {
        const store = (0, utils_1.$bT)();
        test('Page up and down', async function () {
            const element = document.createElement('div');
            element.style.height = '200px';
            element.style.width = '200px';
            const delegate = {
                getHeight() { return 20; },
                getTemplateId() { return 'template'; }
            };
            let templatesCount = 0;
            const renderer = {
                templateId: 'template',
                renderTemplate() { templatesCount++; },
                renderElement() { },
                disposeTemplate() { templatesCount--; }
            };
            const listWidget = store.add(new listWidget_1.$wQ('test', element, delegate, [renderer]));
            listWidget.layout(200);
            assert.strictEqual(templatesCount, 0, 'no templates have been allocated');
            listWidget.splice(0, 0, (0, arrays_1.$Qb)(100));
            listWidget.focusFirst();
            listWidget.focusNextPage();
            assert.strictEqual(listWidget.getFocus()[0], 9, 'first page down moves focus to element at bottom');
            // scroll to next page is async
            listWidget.focusNextPage();
            await (0, async_1.$Hg)(0);
            assert.strictEqual(listWidget.getFocus()[0], 19, 'page down to next page');
            listWidget.focusPreviousPage();
            assert.strictEqual(listWidget.getFocus()[0], 10, 'first page up moves focus to element at top');
            // scroll to previous page is async
            listWidget.focusPreviousPage();
            await (0, async_1.$Hg)(0);
            assert.strictEqual(listWidget.getFocus()[0], 0, 'page down to previous page');
        });
        test('Page up and down with item taller than viewport #149502', async function () {
            const element = document.createElement('div');
            element.style.height = '200px';
            element.style.width = '200px';
            const delegate = {
                getHeight() { return 200; },
                getTemplateId() { return 'template'; }
            };
            let templatesCount = 0;
            const renderer = {
                templateId: 'template',
                renderTemplate() { templatesCount++; },
                renderElement() { },
                disposeTemplate() { templatesCount--; }
            };
            const listWidget = store.add(new listWidget_1.$wQ('test', element, delegate, [renderer]));
            listWidget.layout(200);
            assert.strictEqual(templatesCount, 0, 'no templates have been allocated');
            listWidget.splice(0, 0, (0, arrays_1.$Qb)(100));
            listWidget.focusFirst();
            assert.strictEqual(listWidget.getFocus()[0], 0, 'initial focus is first element');
            // scroll to next page is async
            listWidget.focusNextPage();
            await (0, async_1.$Hg)(0);
            assert.strictEqual(listWidget.getFocus()[0], 1, 'page down to next page');
            // scroll to previous page is async
            listWidget.focusPreviousPage();
            await (0, async_1.$Hg)(0);
            assert.strictEqual(listWidget.getFocus()[0], 0, 'page up to next page');
        });
    });
});
//# sourceMappingURL=listWidget.test.js.map