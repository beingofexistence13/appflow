/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/list/listWidget", "vs/base/common/arrays", "vs/base/common/async", "vs/base/test/common/utils"], function (require, exports, assert, listWidget_1, arrays_1, async_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ListWidget', function () {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
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
            const listWidget = store.add(new listWidget_1.List('test', element, delegate, [renderer]));
            listWidget.layout(200);
            assert.strictEqual(templatesCount, 0, 'no templates have been allocated');
            listWidget.splice(0, 0, (0, arrays_1.range)(100));
            listWidget.focusFirst();
            listWidget.focusNextPage();
            assert.strictEqual(listWidget.getFocus()[0], 9, 'first page down moves focus to element at bottom');
            // scroll to next page is async
            listWidget.focusNextPage();
            await (0, async_1.timeout)(0);
            assert.strictEqual(listWidget.getFocus()[0], 19, 'page down to next page');
            listWidget.focusPreviousPage();
            assert.strictEqual(listWidget.getFocus()[0], 10, 'first page up moves focus to element at top');
            // scroll to previous page is async
            listWidget.focusPreviousPage();
            await (0, async_1.timeout)(0);
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
            const listWidget = store.add(new listWidget_1.List('test', element, delegate, [renderer]));
            listWidget.layout(200);
            assert.strictEqual(templatesCount, 0, 'no templates have been allocated');
            listWidget.splice(0, 0, (0, arrays_1.range)(100));
            listWidget.focusFirst();
            assert.strictEqual(listWidget.getFocus()[0], 0, 'initial focus is first element');
            // scroll to next page is async
            listWidget.focusNextPage();
            await (0, async_1.timeout)(0);
            assert.strictEqual(listWidget.getFocus()[0], 1, 'page down to next page');
            // scroll to previous page is async
            listWidget.focusPreviousPage();
            await (0, async_1.timeout)(0);
            assert.strictEqual(listWidget.getFocus()[0], 0, 'page up to next page');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFdpZGdldC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2Jyb3dzZXIvdWkvbGlzdC9saXN0V2lkZ2V0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsS0FBSyxDQUFDLFlBQVksRUFBRTtRQUNuQixNQUFNLEtBQUssR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFeEQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEtBQUs7WUFDN0IsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7WUFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO1lBRTlCLE1BQU0sUUFBUSxHQUFpQztnQkFDOUMsU0FBUyxLQUFLLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUIsYUFBYSxLQUFLLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQzthQUN0QyxDQUFDO1lBRUYsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBRXZCLE1BQU0sUUFBUSxHQUFnQztnQkFDN0MsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLGNBQWMsS0FBSyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLGFBQWEsS0FBSyxDQUFDO2dCQUNuQixlQUFlLEtBQUssY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3ZDLENBQUM7WUFFRixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksaUJBQUksQ0FBUyxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RixVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxD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