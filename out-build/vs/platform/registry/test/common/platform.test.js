/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/types", "vs/platform/registry/common/platform"], function (require, exports, assert, types_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Platform / Registry', () => {
        test('registry - api', function () {
            assert.ok((0, types_1.$xf)(platform_1.$8m.add));
            assert.ok((0, types_1.$xf)(platform_1.$8m.as));
            assert.ok((0, types_1.$xf)(platform_1.$8m.knows));
        });
        test('registry - mixin', function () {
            platform_1.$8m.add('foo', { bar: true });
            assert.ok(platform_1.$8m.knows('foo'));
            assert.ok(platform_1.$8m.as('foo').bar);
            assert.strictEqual(platform_1.$8m.as('foo').bar, true);
        });
        test('registry - knows, as', function () {
            const ext = {};
            platform_1.$8m.add('knows,as', ext);
            assert.ok(platform_1.$8m.knows('knows,as'));
            assert.ok(!platform_1.$8m.knows('knows,as1234'));
            assert.ok(platform_1.$8m.as('knows,as') === ext);
            assert.ok(platform_1.$8m.as('knows,as1234') === null);
        });
        test('registry - mixin, fails on duplicate ids', function () {
            platform_1.$8m.add('foo-dup', { bar: true });
            try {
                platform_1.$8m.add('foo-dup', { bar: false });
                assert.ok(false);
            }
            catch (e) {
                assert.ok(true);
            }
        });
    });
});
//# sourceMappingURL=platform.test.js.map