/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/contrib/suggest/test/browser/completionModel.test", "vs/editor/test/common/testTextModel"], function (require, exports, assert, suggestMemory_1, completionModel_test_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SuggestMemories', function () {
        let pos;
        let buffer;
        let items;
        setup(function () {
            pos = { lineNumber: 1, column: 1 };
            buffer = (0, testTextModel_1.$O0b)('This is some text.\nthis.\nfoo: ,');
            items = [
                (0, completionModel_test_1.$a$b)('foo', 0),
                (0, completionModel_test_1.$a$b)('bar', 0)
            ];
        });
        teardown(() => {
            buffer.dispose();
        });
        test('AbstractMemory, select', function () {
            const mem = new class extends suggestMemory_1.$m6 {
                constructor() {
                    super('first');
                }
                memorize(model, pos, item) {
                    throw new Error('Method not implemented.');
                }
                toJSON() {
                    throw new Error('Method not implemented.');
                }
                fromJSON(data) {
                    throw new Error('Method not implemented.');
                }
            };
            const item1 = (0, completionModel_test_1.$a$b)('fazz', 0);
            const item2 = (0, completionModel_test_1.$a$b)('bazz', 0);
            const item3 = (0, completionModel_test_1.$a$b)('bazz', 0);
            const item4 = (0, completionModel_test_1.$a$b)('bazz', 0);
            item1.completion.preselect = false;
            item2.completion.preselect = true;
            item3.completion.preselect = true;
            assert.strictEqual(mem.select(buffer, pos, [item1, item2, item3, item4]), 1);
        });
        test('[No|Prefix|LRU]Memory honor selection boost', function () {
            const item1 = (0, completionModel_test_1.$a$b)('fazz', 0);
            const item2 = (0, completionModel_test_1.$a$b)('bazz', 0);
            const item3 = (0, completionModel_test_1.$a$b)('bazz', 0);
            const item4 = (0, completionModel_test_1.$a$b)('bazz', 0);
            item1.completion.preselect = false;
            item2.completion.preselect = true;
            item3.completion.preselect = true;
            const items = [item1, item2, item3, item4];
            assert.strictEqual(new suggestMemory_1.$n6().select(buffer, pos, items), 1);
            assert.strictEqual(new suggestMemory_1.$o6().select(buffer, pos, items), 1);
            assert.strictEqual(new suggestMemory_1.$p6().select(buffer, pos, items), 1);
        });
        test('NoMemory', () => {
            const mem = new suggestMemory_1.$n6();
            assert.strictEqual(mem.select(buffer, pos, items), 0);
            assert.strictEqual(mem.select(buffer, pos, []), 0);
            mem.memorize(buffer, pos, items[0]);
            mem.memorize(buffer, pos, null);
        });
        test('LRUMemory', () => {
            pos = { lineNumber: 2, column: 6 };
            const mem = new suggestMemory_1.$o6();
            mem.memorize(buffer, pos, items[1]);
            assert.strictEqual(mem.select(buffer, pos, items), 1);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 3 }, items), 0);
            mem.memorize(buffer, pos, items[0]);
            assert.strictEqual(mem.select(buffer, pos, items), 0);
            assert.strictEqual(mem.select(buffer, pos, [
                (0, completionModel_test_1.$a$b)('new', 0),
                (0, completionModel_test_1.$a$b)('bar', 0)
            ]), 1);
            assert.strictEqual(mem.select(buffer, pos, [
                (0, completionModel_test_1.$a$b)('new1', 0),
                (0, completionModel_test_1.$a$b)('new2', 0)
            ]), 0);
        });
        test('`"editor.suggestSelection": "recentlyUsed"` should be a little more sticky #78571', function () {
            const item1 = (0, completionModel_test_1.$a$b)('gamma', 0);
            const item2 = (0, completionModel_test_1.$a$b)('game', 0);
            items = [item1, item2];
            const mem = new suggestMemory_1.$o6();
            buffer.setValue('    foo.');
            mem.memorize(buffer, { lineNumber: 1, column: 1 }, item2);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 2 }, items), 0); // leading whitespace -> ignore recent items
            mem.memorize(buffer, { lineNumber: 1, column: 9 }, item2);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 9 }, items), 1); // foo.
            buffer.setValue('    foo.g');
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 10 }, items), 1); // foo.g, 'gamma' and 'game' have the same score
            item1.score = [10, 0, 0];
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 10 }, items), 0); // foo.g, 'gamma' has higher score
        });
        test('intellisense is not showing top options first #43429', function () {
            // ensure we don't memorize for whitespace prefixes
            pos = { lineNumber: 2, column: 6 };
            const mem = new suggestMemory_1.$o6();
            mem.memorize(buffer, pos, items[1]);
            assert.strictEqual(mem.select(buffer, pos, items), 1);
            assert.strictEqual(mem.select(buffer, { lineNumber: 3, column: 5 }, items), 0); // foo: |,
            assert.strictEqual(mem.select(buffer, { lineNumber: 3, column: 6 }, items), 1); // foo: ,|
        });
        test('PrefixMemory', () => {
            const mem = new suggestMemory_1.$p6();
            buffer.setValue('constructor');
            const item0 = (0, completionModel_test_1.$a$b)('console', 0);
            const item1 = (0, completionModel_test_1.$a$b)('const', 0);
            const item2 = (0, completionModel_test_1.$a$b)('constructor', 0);
            const item3 = (0, completionModel_test_1.$a$b)('constant', 0);
            const items = [item0, item1, item2, item3];
            mem.memorize(buffer, { lineNumber: 1, column: 2 }, item1); // c -> const
            mem.memorize(buffer, { lineNumber: 1, column: 3 }, item0); // co -> console
            mem.memorize(buffer, { lineNumber: 1, column: 4 }, item2); // con -> constructor
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 1 }, items), 0);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 2 }, items), 1);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 3 }, items), 0);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 4 }, items), 2);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 7 }, items), 2); // find substr
        });
    });
});
//# sourceMappingURL=suggestMemory.test.js.map