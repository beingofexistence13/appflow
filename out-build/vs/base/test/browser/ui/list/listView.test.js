/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/list/listView", "vs/base/common/arrays", "vs/base/test/common/utils"], function (require, exports, assert, listView_1, arrays_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ListView', function () {
        (0, utils_1.$bT)();
        test('all rows get disposed', function () {
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
            const listView = new listView_1.$mQ(element, delegate, [renderer]);
            listView.layout(200);
            assert.strictEqual(templatesCount, 0, 'no templates have been allocated');
            listView.splice(0, 0, (0, arrays_1.$Qb)(100));
            assert.strictEqual(templatesCount, 10, 'some templates have been allocated');
            listView.dispose();
            assert.strictEqual(templatesCount, 0, 'all templates have been disposed');
        });
    });
});
//# sourceMappingURL=listView.test.js.map