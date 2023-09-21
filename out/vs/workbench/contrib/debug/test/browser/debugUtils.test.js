/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, assert, utils_1, debugUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Utils', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('formatPII', () => {
            assert.strictEqual((0, debugUtils_1.formatPII)('Foo Bar', false, {}), 'Foo Bar');
            assert.strictEqual((0, debugUtils_1.formatPII)('Foo {key} Bar', false, {}), 'Foo {key} Bar');
            assert.strictEqual((0, debugUtils_1.formatPII)('Foo {key} Bar', false, { 'key': 'yes' }), 'Foo yes Bar');
            assert.strictEqual((0, debugUtils_1.formatPII)('Foo {_0} Bar {_0}', true, { '_0': 'yes' }), 'Foo yes Bar yes');
            assert.strictEqual((0, debugUtils_1.formatPII)('Foo {0} Bar {1}{2}', false, { '0': 'yes' }), 'Foo yes Bar {1}{2}');
            assert.strictEqual((0, debugUtils_1.formatPII)('Foo {0} Bar {1}{2}', false, { '0': 'yes', '1': 'undefined' }), 'Foo yes Bar undefined{2}');
            assert.strictEqual((0, debugUtils_1.formatPII)('Foo {_key0} Bar {key1}{key2}', true, { '_key0': 'yes', 'key1': '5', 'key2': 'false' }), 'Foo yes Bar {key1}{key2}');
            assert.strictEqual((0, debugUtils_1.formatPII)('Foo {_key0} Bar {key1}{key2}', false, { '_key0': 'yes', 'key1': '5', 'key2': 'false' }), 'Foo yes Bar 5false');
            assert.strictEqual((0, debugUtils_1.formatPII)('Unable to display threads:"{e}"', false, { 'e': 'detached from process' }), 'Unable to display threads:"detached from process"');
        });
        test('getExactExpressionStartAndEnd', () => {
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('foo', 1, 2), { start: 1, end: 3 });
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('foo', 1, 3), { start: 1, end: 3 });
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('foo', 1, 4), { start: 1, end: 3 });
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('this.name = "John"', 1, 10), { start: 1, end: 9 });
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('this.name = "John"', 6, 10), { start: 1, end: 9 });
            // Hovers over "address" should pick up this->address
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('this->address = "Main street"', 6, 10), { start: 1, end: 13 });
            // Hovers over "name" should pick up a.b.c.d.name
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('var t = a.b.c.d.name', 16, 20), { start: 9, end: 20 });
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('MyClass::StaticProp', 10, 20), { start: 1, end: 19 });
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('largeNumber = myVar?.prop', 21, 25), { start: 15, end: 25 });
            // For example in expression 'a.b.c.d', hover was under 'b', 'a.b' should be the exact range
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('var t = a.b.c.d.name', 11, 12), { start: 9, end: 11 });
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('var t = a.b;c.d.name', 16, 20), { start: 13, end: 20 });
            assert.deepStrictEqual((0, debugUtils_1.getExactExpressionStartAndEnd)('var t = a.b.c-d.name', 16, 20), { start: 15, end: 20 });
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
            const sorted = (0, debugUtils_1.getVisibleAndSorted)(configs);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdVdGlscy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvdGVzdC9icm93c2VyL2RlYnVnVXRpbHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU9oRyxLQUFLLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtRQUMzQixJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7WUFDdEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHNCQUFTLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsc0JBQVMsRUFBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSxzQkFBUyxFQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN2RixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsc0JBQVMsRUFBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzdGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSxzQkFBUyxFQUFDLG9CQUFvQixFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDakcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHNCQUFTLEVBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FB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