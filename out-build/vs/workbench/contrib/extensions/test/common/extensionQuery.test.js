/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/extensions/common/extensionQuery"], function (require, exports, assert, extensionQuery_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Extension query', () => {
        test('parse', () => {
            let query = extensionQuery_1.$$Tb.parse('');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.$$Tb.parse('hello');
            assert.strictEqual(query.value, 'hello');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.$$Tb.parse('   hello world ');
            assert.strictEqual(query.value, 'hello world');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.$$Tb.parse('@sort');
            assert.strictEqual(query.value, '@sort');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.$$Tb.parse('@sort:');
            assert.strictEqual(query.value, '@sort:');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.$$Tb.parse('  @sort:  ');
            assert.strictEqual(query.value, '@sort:');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.$$Tb.parse('@sort:installs');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.$$Tb.parse('   @sort:installs   ');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.$$Tb.parse('@sort:installs-');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.$$Tb.parse('@sort:installs-foo');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.$$Tb.parse('@sort:installs');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.$$Tb.parse('@sort:installs');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.$$Tb.parse('vs @sort:installs');
            assert.strictEqual(query.value, 'vs');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.$$Tb.parse('vs @sort:installs code');
            assert.strictEqual(query.value, 'vs  code');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.$$Tb.parse('@sort:installs @sort:ratings');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'ratings');
        });
        test('toString', () => {
            let query = new extensionQuery_1.$$Tb('hello', '', '');
            assert.strictEqual(query.toString(), 'hello');
            query = new extensionQuery_1.$$Tb('hello world', '', '');
            assert.strictEqual(query.toString(), 'hello world');
            query = new extensionQuery_1.$$Tb('  hello    ', '', '');
            assert.strictEqual(query.toString(), 'hello');
            query = new extensionQuery_1.$$Tb('', 'installs', '');
            assert.strictEqual(query.toString(), '@sort:installs');
            query = new extensionQuery_1.$$Tb('', 'installs', '');
            assert.strictEqual(query.toString(), '@sort:installs');
            query = new extensionQuery_1.$$Tb('', 'installs', '');
            assert.strictEqual(query.toString(), '@sort:installs');
            query = new extensionQuery_1.$$Tb('hello', 'installs', '');
            assert.strictEqual(query.toString(), 'hello @sort:installs');
            query = new extensionQuery_1.$$Tb('  hello      ', 'installs', '');
            assert.strictEqual(query.toString(), 'hello @sort:installs');
        });
        test('isValid', () => {
            let query = new extensionQuery_1.$$Tb('hello', '', '');
            assert(query.isValid());
            query = new extensionQuery_1.$$Tb('hello world', '', '');
            assert(query.isValid());
            query = new extensionQuery_1.$$Tb('  hello    ', '', '');
            assert(query.isValid());
            query = new extensionQuery_1.$$Tb('', 'installs', '');
            assert(query.isValid());
            query = new extensionQuery_1.$$Tb('', 'installs', '');
            assert(query.isValid());
            query = new extensionQuery_1.$$Tb('', 'installs', '');
            assert(query.isValid());
            query = new extensionQuery_1.$$Tb('', 'installs', '');
            assert(query.isValid());
            query = new extensionQuery_1.$$Tb('hello', 'installs', '');
            assert(query.isValid());
            query = new extensionQuery_1.$$Tb('  hello      ', 'installs', '');
            assert(query.isValid());
        });
        test('equals', () => {
            const query1 = new extensionQuery_1.$$Tb('hello', '', '');
            let query2 = new extensionQuery_1.$$Tb('hello', '', '');
            assert(query1.equals(query2));
            query2 = new extensionQuery_1.$$Tb('hello world', '', '');
            assert(!query1.equals(query2));
            query2 = new extensionQuery_1.$$Tb('hello', 'installs', '');
            assert(!query1.equals(query2));
            query2 = new extensionQuery_1.$$Tb('hello', 'installs', '');
            assert(!query1.equals(query2));
        });
        test('autocomplete', () => {
            extensionQuery_1.$$Tb.suggestions('@sort:in').some(x => x === '@sort:installs ');
            extensionQuery_1.$$Tb.suggestions('@sort:installs').every(x => x !== '@sort:rating ');
            extensionQuery_1.$$Tb.suggestions('@category:blah').some(x => x === '@category:"extension packs" ');
            extensionQuery_1.$$Tb.suggestions('@category:"extension packs"').every(x => x !== '@category:formatters ');
        });
    });
});
//# sourceMappingURL=extensionQuery.test.js.map