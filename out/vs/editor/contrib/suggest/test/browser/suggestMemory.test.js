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
            buffer = (0, testTextModel_1.createTextModel)('This is some text.\nthis.\nfoo: ,');
            items = [
                (0, completionModel_test_1.createSuggestItem)('foo', 0),
                (0, completionModel_test_1.createSuggestItem)('bar', 0)
            ];
        });
        teardown(() => {
            buffer.dispose();
        });
        test('AbstractMemory, select', function () {
            const mem = new class extends suggestMemory_1.Memory {
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
            const item1 = (0, completionModel_test_1.createSuggestItem)('fazz', 0);
            const item2 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            const item3 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            const item4 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            item1.completion.preselect = false;
            item2.completion.preselect = true;
            item3.completion.preselect = true;
            assert.strictEqual(mem.select(buffer, pos, [item1, item2, item3, item4]), 1);
        });
        test('[No|Prefix|LRU]Memory honor selection boost', function () {
            const item1 = (0, completionModel_test_1.createSuggestItem)('fazz', 0);
            const item2 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            const item3 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            const item4 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            item1.completion.preselect = false;
            item2.completion.preselect = true;
            item3.completion.preselect = true;
            const items = [item1, item2, item3, item4];
            assert.strictEqual(new suggestMemory_1.NoMemory().select(buffer, pos, items), 1);
            assert.strictEqual(new suggestMemory_1.LRUMemory().select(buffer, pos, items), 1);
            assert.strictEqual(new suggestMemory_1.PrefixMemory().select(buffer, pos, items), 1);
        });
        test('NoMemory', () => {
            const mem = new suggestMemory_1.NoMemory();
            assert.strictEqual(mem.select(buffer, pos, items), 0);
            assert.strictEqual(mem.select(buffer, pos, []), 0);
            mem.memorize(buffer, pos, items[0]);
            mem.memorize(buffer, pos, null);
        });
        test('LRUMemory', () => {
            pos = { lineNumber: 2, column: 6 };
            const mem = new suggestMemory_1.LRUMemory();
            mem.memorize(buffer, pos, items[1]);
            assert.strictEqual(mem.select(buffer, pos, items), 1);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 3 }, items), 0);
            mem.memorize(buffer, pos, items[0]);
            assert.strictEqual(mem.select(buffer, pos, items), 0);
            assert.strictEqual(mem.select(buffer, pos, [
                (0, completionModel_test_1.createSuggestItem)('new', 0),
                (0, completionModel_test_1.createSuggestItem)('bar', 0)
            ]), 1);
            assert.strictEqual(mem.select(buffer, pos, [
                (0, completionModel_test_1.createSuggestItem)('new1', 0),
                (0, completionModel_test_1.createSuggestItem)('new2', 0)
            ]), 0);
        });
        test('`"editor.suggestSelection": "recentlyUsed"` should be a little more sticky #78571', function () {
            const item1 = (0, completionModel_test_1.createSuggestItem)('gamma', 0);
            const item2 = (0, completionModel_test_1.createSuggestItem)('game', 0);
            items = [item1, item2];
            const mem = new suggestMemory_1.LRUMemory();
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
            const mem = new suggestMemory_1.LRUMemory();
            mem.memorize(buffer, pos, items[1]);
            assert.strictEqual(mem.select(buffer, pos, items), 1);
            assert.strictEqual(mem.select(buffer, { lineNumber: 3, column: 5 }, items), 0); // foo: |,
            assert.strictEqual(mem.select(buffer, { lineNumber: 3, column: 6 }, items), 1); // foo: ,|
        });
        test('PrefixMemory', () => {
            const mem = new suggestMemory_1.PrefixMemory();
            buffer.setValue('constructor');
            const item0 = (0, completionModel_test_1.createSuggestItem)('console', 0);
            const item1 = (0, completionModel_test_1.createSuggestItem)('const', 0);
            const item2 = (0, completionModel_test_1.createSuggestItem)('constructor', 0);
            const item3 = (0, completionModel_test_1.createSuggestItem)('constant', 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdE1lbW9yeS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3VnZ2VzdC90ZXN0L2Jyb3dzZXIvc3VnZ2VzdE1lbW9yeS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBVWhHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRTtRQUV4QixJQUFJLEdBQWMsQ0FBQztRQUNuQixJQUFJLE1BQWtCLENBQUM7UUFDdkIsSUFBSSxLQUF1QixDQUFDO1FBRTVCLEtBQUssQ0FBQztZQUNMLEdBQUcsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ25DLE1BQU0sR0FBRyxJQUFBLCtCQUFlLEVBQUMsbUNBQW1DLENBQUMsQ0FBQztZQUM5RCxLQUFLLEdBQUc7Z0JBQ1AsSUFBQSx3Q0FBaUIsRUFBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQixJQUFBLHdDQUFpQixFQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDM0IsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx3QkFBd0IsRUFBRTtZQUU5QixNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQU0sU0FBUSxzQkFBTTtnQkFDbkM7b0JBQ0MsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNoQixDQUFDO2dCQUNELFFBQVEsQ0FBQyxLQUFpQixFQUFFLEdBQWMsRUFBRSxJQUFvQjtvQkFDL0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUM1QyxDQUFDO2dCQUFDLE1BQU07b0JBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUM1QyxDQUFDO2dCQUNELFFBQVEsQ0FBQyxJQUFZO29CQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQzVDLENBQUM7YUFDRCxDQUFDO1lBRUYsTUFBTSxLQUFLLEdBQUcsSUFBQSx3Q0FBaUIsRUFBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0MsTUFBTSxLQUFLLEdBQUcsSUFBQSx3Q0FBaUIsRUFBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0MsTUFBTSxLQUFLLEdBQUcsSUFBQSx3Q0FBaUIsRUFBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0MsTUFBTSxLQUFLLEdBQUcsSUFBQSx3Q0FBaUIsRUFBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0MsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ25DLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUNsQyxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFFbEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDZDQUE2QyxFQUFFO1lBQ25ELE1BQU0sS0FBSyxHQUFHLElBQUEsd0NBQWlCLEVBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUEsd0NBQWlCLEVBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUEsd0NBQWlCLEVBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUEsd0NBQWlCLEVBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUNuQyxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDbEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLE1BQU0sS0FBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFHM0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLHdCQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUkseUJBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSw0QkFBWSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtZQUVyQixNQUFNLEdBQUcsR0FBRyxJQUFJLHdCQUFRLEVBQUUsQ0FBQztZQUUzQixNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVuRCxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUs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