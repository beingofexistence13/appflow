/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/extensions/common/extensionQuery"], function (require, exports, assert, extensionQuery_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Extension query', () => {
        test('parse', () => {
            let query = extensionQuery_1.Query.parse('');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.Query.parse('hello');
            assert.strictEqual(query.value, 'hello');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.Query.parse('   hello world ');
            assert.strictEqual(query.value, 'hello world');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.Query.parse('@sort');
            assert.strictEqual(query.value, '@sort');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.Query.parse('@sort:');
            assert.strictEqual(query.value, '@sort:');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.Query.parse('  @sort:  ');
            assert.strictEqual(query.value, '@sort:');
            assert.strictEqual(query.sortBy, '');
            query = extensionQuery_1.Query.parse('@sort:installs');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('   @sort:installs   ');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('@sort:installs-');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('@sort:installs-foo');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('@sort:installs');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('@sort:installs');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('vs @sort:installs');
            assert.strictEqual(query.value, 'vs');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('vs @sort:installs code');
            assert.strictEqual(query.value, 'vs  code');
            assert.strictEqual(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('@sort:installs @sort:ratings');
            assert.strictEqual(query.value, '');
            assert.strictEqual(query.sortBy, 'ratings');
        });
        test('toString', () => {
            let query = new extensionQuery_1.Query('hello', '', '');
            assert.strictEqual(query.toString(), 'hello');
            query = new extensionQuery_1.Query('hello world', '', '');
            assert.strictEqual(query.toString(), 'hello world');
            query = new extensionQuery_1.Query('  hello    ', '', '');
            assert.strictEqual(query.toString(), 'hello');
            query = new extensionQuery_1.Query('', 'installs', '');
            assert.strictEqual(query.toString(), '@sort:installs');
            query = new extensionQuery_1.Query('', 'installs', '');
            assert.strictEqual(query.toString(), '@sort:installs');
            query = new extensionQuery_1.Query('', 'installs', '');
            assert.strictEqual(query.toString(), '@sort:installs');
            query = new extensionQuery_1.Query('hello', 'installs', '');
            assert.strictEqual(query.toString(), 'hello @sort:installs');
            query = new extensionQuery_1.Query('  hello      ', 'installs', '');
            assert.strictEqual(query.toString(), 'hello @sort:installs');
        });
        test('isValid', () => {
            let query = new extensionQuery_1.Query('hello', '', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('hello world', '', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('  hello    ', '', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('', 'installs', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('', 'installs', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('', 'installs', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('', 'installs', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('hello', 'installs', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('  hello      ', 'installs', '');
            assert(query.isValid());
        });
        test('equals', () => {
            const query1 = new extensionQuery_1.Query('hello', '', '');
            let query2 = new extensionQuery_1.Query('hello', '', '');
            assert(query1.equals(query2));
            query2 = new extensionQuery_1.Query('hello world', '', '');
            assert(!query1.equals(query2));
            query2 = new extensionQuery_1.Query('hello', 'installs', '');
            assert(!query1.equals(query2));
            query2 = new extensionQuery_1.Query('hello', 'installs', '');
            assert(!query1.equals(query2));
        });
        test('autocomplete', () => {
            extensionQuery_1.Query.suggestions('@sort:in').some(x => x === '@sort:installs ');
            extensionQuery_1.Query.suggestions('@sort:installs').every(x => x !== '@sort:rating ');
            extensionQuery_1.Query.suggestions('@category:blah').some(x => x === '@category:"extension packs" ');
            extensionQuery_1.Query.suggestions('@category:"extension packs"').every(x => x !== '@category:formatters ');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUXVlcnkudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvdGVzdC9jb21tb24vZXh0ZW5zaW9uUXVlcnkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQUtoRyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO1FBQzdCLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ2xCLElBQUksS0FBSyxHQUFHLHNCQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFckMsS0FBSyxHQUFHLHNCQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFckMsS0FBSyxHQUFHLHNCQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVyQyxLQUFLLEdBQUcsc0JBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVyQyxLQUFLLEdBQUcsc0JBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVyQyxLQUFLLEdBQUcsc0JBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVyQyxLQUFLLEdBQUcsc0JBQUssQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRTdDLEtBQUssR0FBRyxzQkFBSyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFN0MsS0FBSyxHQUFHLHNCQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU3QyxLQUFLLEdBQUcsc0JBQUssQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRTdDLEtBQUssR0FBRyxzQkFBSyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFN0MsS0FBSyxHQUFHLHNCQUFLLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU3QyxLQUFLLEdBQUcsc0JBQUssQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRTdDLEtBQUssR0FBRyxzQkFBSyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFN0MsS0FBSyxHQUFHLHNCQUFLLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFO1lBQ3JCLElBQUksS0FBSyxHQUFHLElBQUksc0JBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRTlDLEtBQUssR0FBRyxJQUFJLHNCQUFLLENBQUMsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUVwRCxLQUFLLEdBQUcsSUFBSSxzQkFBSyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFOUMsS0FBSyxHQUFHLElBQUksc0JBQUssQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFdkQsS0FBSyxHQUFHLElBQUksc0JBQUssQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFdkQsS0FBSyxHQUFHLElBQUksc0JBQUssQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFdkQsS0FBSyxHQUFHLElBQUksc0JBQUssQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFFN0QsS0FBSyxHQUFHLElBQUksc0JBQUssQ0FBQyxlQUFlLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtZQUNwQixJQUFJLEtBQUssR0FBRyxJQUFJLHNCQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFeEIsS0FBSyxHQUFHLElBQUksc0JBQUssQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUV4QixLQUFLLEdBQUcsSUFBSSxzQkFBSyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRXhCLEtBQUssR0FBRyxJQUFJLHNCQUFLLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFeEIsS0FBSyxHQUFHLElBQUksc0JBQUssQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUV4QixLQUFLLEdBQUcsSUFBSSxzQkFBSyxDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRXhCLEtBQUssR0FBRyxJQUFJLHNCQUFLLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFeEIsS0FBSyxHQUFHLElBQUksc0JBQUssQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUV4QixLQUFLLEdBQUcsSUFBSSxzQkFBSyxDQUFDLGVBQWUsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7WUFDbkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxzQkFBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxzQkFBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUU5QixNQUFNLEdBQUcsSUFBSSxzQkFBSyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRS9CLE1BQU0sR0FBRyxJQUFJLHNCQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM1QyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFL0IsTUFBTSxHQUFHLElBQUksc0JBQUssQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1lBQ3pCLHNCQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2pFLHNCQUFLLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLGVBQWUsQ0FBQyxDQUFDO1lBRXRFLHNCQUFLLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLDhCQUE4QixDQUFDLENBQUM7WUFDcEYsc0JBQUssQ0FBQyxXQUFXLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssdUJBQXVCLENBQUMsQ0FBQztRQUM1RixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=