/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/registry/common/platform", "vs/workbench/browser/panecomposite", "vs/base/common/types", "vs/base/test/common/utils"], function (require, exports, assert, platform_1, panecomposite_1, types_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Viewlets', () => {
        class TestViewlet extends panecomposite_1.$Ueb {
            constructor() {
                super('id', null, null, null, null, null, null, null);
            }
            layout(dimension) {
                throw new Error('Method not implemented.');
            }
            setBoundarySashes(sashes) {
                throw new Error('Method not implemented.');
            }
            m() { return null; }
        }
        test('ViewletDescriptor API', function () {
            const d = panecomposite_1.$Veb.create(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
            assert.strictEqual(d.cssClass, 'class');
            assert.strictEqual(d.order, 5);
        });
        test('Editor Aware ViewletDescriptor API', function () {
            let d = panecomposite_1.$Veb.create(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
            d = panecomposite_1.$Veb.create(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
        });
        test('Viewlet extension point and registration', function () {
            assert((0, types_1.$xf)(platform_1.$8m.as(panecomposite_1.$Web.Viewlets).registerPaneComposite));
            assert((0, types_1.$xf)(platform_1.$8m.as(panecomposite_1.$Web.Viewlets).getPaneComposite));
            assert((0, types_1.$xf)(platform_1.$8m.as(panecomposite_1.$Web.Viewlets).getPaneComposites));
            const oldCount = platform_1.$8m.as(panecomposite_1.$Web.Viewlets).getPaneComposites().length;
            const d = panecomposite_1.$Veb.create(TestViewlet, 'reg-test-id', 'name');
            platform_1.$8m.as(panecomposite_1.$Web.Viewlets).registerPaneComposite(d);
            assert(d === platform_1.$8m.as(panecomposite_1.$Web.Viewlets).getPaneComposite('reg-test-id'));
            assert.strictEqual(oldCount + 1, platform_1.$8m.as(panecomposite_1.$Web.Viewlets).getPaneComposites().length);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=viewlet.test.js.map