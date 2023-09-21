/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, assert, utils_1, debugUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Utils', () => {
        (0, utils_1.$bT)();
        test('formatPII', () => {
            assert.strictEqual((0, debugUtils_1.$iF)('Foo Bar', false, {}), 'Foo Bar');
            assert.strictEqual((0, debugUtils_1.$iF)('Foo {key} Bar', false, {}), 'Foo {key} Bar');
            assert.strictEqual((0, debugUtils_1.$iF)('Foo {key} Bar', false, { 'key': 'yes' }), 'Foo yes Bar');
            assert.strictEqual((0, debugUtils_1.$iF)('Foo {_0} Bar {_0}', true, { '_0': 'yes' }), 'Foo yes Bar yes');
            assert.strictEqual((0, debugUtils_1.$iF)('Foo {0} Bar {1}{2}', false, { '0': 'yes' }), 'Foo yes Bar {1}{2}');
            assert.strictEqual((0, debugUtils_1.$iF)('Foo {0} Bar {1}{2}', false, { '0': 'yes', '1': 'undefined' }), 'Foo yes Bar undefined{2}');
            assert.strictEqual((0, debugUtils_1.$iF)('Foo {_key0} Bar {key1}{key2}', true, { '_key0': 'yes', 'key1': '5', 'key2': 'false' }), 'Foo yes Bar {key1}{key2}');
            assert.strictEqual((0, debugUtils_1.$iF)('Foo {_key0} Bar {key1}{key2}', false, { '_key0': 'yes', 'key1': '5', 'key2': 'false' }), 'Foo yes Bar 5false');
            assert.strictEqual((0, debugUtils_1.$iF)('Unable to display threads:"{e}"', false, { 'e': 'detached from process' }), 'Unable to display threads:"detached from process"');
        });
        test('getExactExpressionStartAndEnd', () => {
            assert.deepStrictEqual((0, debugUtils_1.$nF)('foo', 1, 2), { start: 1, end: 3 });
            assert.deepStrictEqual((0, debugUtils_1.$nF)('foo', 1, 3), { start: 1, end: 3 });
            assert.deepStrictEqual((0, debugUtils_1.$nF)('foo', 1, 4), { start: 1, end: 3 });
            assert.deepStrictEqual((0, debugUtils_1.$nF)('this.name = "John"', 1, 10), { start: 1, end: 9 });
            assert.deepStrictEqual((0, debugUtils_1.$nF)('this.name = "John"', 6, 10), { start: 1, end: 9 });
            // Hovers over "address" should pick up this->address
            assert.deepStrictEqual((0, debugUtils_1.$nF)('this->address = "Main street"', 6, 10), { start: 1, end: 13 });
            // Hovers over "name" should pick up a.b.c.d.name
            assert.deepStrictEqual((0, debugUtils_1.$nF)('var t = a.b.c.d.name', 16, 20), { start: 9, end: 20 });
            assert.deepStrictEqual((0, debugUtils_1.$nF)('MyClass::StaticProp', 10, 20), { start: 1, end: 19 });
            assert.deepStrictEqual((0, debugUtils_1.$nF)('largeNumber = myVar?.prop', 21, 25), { start: 15, end: 25 });
            // For example in expression 'a.b.c.d', hover was under 'b', 'a.b' should be the exact range
            assert.deepStrictEqual((0, debugUtils_1.$nF)('var t = a.b.c.d.name', 11, 12), { start: 9, end: 11 });
            assert.deepStrictEqual((0, debugUtils_1.$nF)('var t = a.b;c.d.name', 16, 20), { start: 13, end: 20 });
            assert.deepStrictEqual((0, debugUtils_1.$nF)('var t = a.b.c-d.name', 16, 20), { start: 15, end: 20 });
        });
        test('config presentation', () => {
            const configs = [];
            configs.push({
                type: 'node',
                request: 'launch',
                name: 'p'
            });
            configs.push({
                type: 'node',
                request: 'launch',
                name: 'a'
            });
            configs.push({
                type: 'node',
                request: 'launch',
                name: 'b',
                presentation: {
                    hidden: false
                }
            });
            configs.push({
                type: 'node',
                request: 'launch',
                name: 'c',
                presentation: {
                    hidden: true
                }
            });
            configs.push({
                type: 'node',
                request: 'launch',
                name: 'd',
                presentation: {
                    group: '2_group',
                    order: 5
                }
            });
            configs.push({
                type: 'node',
                request: 'launch',
                name: 'e',
                presentation: {
                    group: '2_group',
                    order: 52
                }
            });
            configs.push({
                type: 'node',
                request: 'launch',
                name: 'f',
                presentation: {
                    group: '1_group',
                    order: 500
                }
            });
            configs.push({
                type: 'node',
                request: 'launch',
                name: 'g',
                presentation: {
                    group: '5_group',
                    order: 500
                }
            });
            configs.push({
                type: 'node',
                request: 'launch',
                name: 'h',
                presentation: {
                    order: 700
                }
            });
            configs.push({
                type: 'node',
                request: 'launch',
                name: 'i',
                presentation: {
                    order: 1000
                }
            });
            const sorted = (0, debugUtils_1.$sF)(configs);
            assert.strictEqual(sorted.length, 9);
            assert.strictEqual(sorted[0].name, 'f');
            assert.strictEqual(sorted[1].name, 'd');
            assert.strictEqual(sorted[2].name, 'e');
            assert.strictEqual(sorted[3].name, 'g');
            assert.strictEqual(sorted[4].name, 'h');
            assert.strictEqual(sorted[5].name, 'i');
            assert.strictEqual(sorted[6].name, 'b');
            assert.strictEqual(sorted[7].name, 'p');
            assert.strictEqual(sorted[8].name, 'a');
        });
    });
});
//# sourceMappingURL=debugUtils.test.js.map