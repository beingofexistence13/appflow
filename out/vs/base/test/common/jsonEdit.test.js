define(["require", "exports", "assert", "vs/base/common/jsonEdit"], function (require, exports, assert, jsonEdit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('JSON - edits', () => {
        function assertEdit(content, edits, expected) {
            assert(edits);
            let lastEditOffset = content.length;
            for (let i = edits.length - 1; i >= 0; i--) {
                const edit = edits[i];
                assert(edit.offset >= 0 && edit.length >= 0 && edit.offset + edit.length <= content.length);
                assert(typeof edit.content === 'string');
                assert(lastEditOffset >= edit.offset + edit.length); // make sure all edits are ordered
                lastEditOffset = edit.offset;
                content = content.substring(0, edit.offset) + edit.content + content.substring(edit.offset + edit.length);
            }
            assert.strictEqual(content, expected);
        }
        const formatterOptions = {
            insertSpaces: true,
            tabSize: 2,
            eol: '\n'
        };
        test('set property', () => {
            let content = '{\n  "x": "y"\n}';
            let edits = (0, jsonEdit_1.setProperty)(content, ['x'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": "bar"\n}');
            content = 'true';
            edits = (0, jsonEdit_1.setProperty)(content, [], 'bar', formatterOptions);
            assertEdit(content, edits, '"bar"');
            content = '{\n  "x": "y"\n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['x'], { key: true }, formatterOptions);
            assertEdit(content, edits, '{\n  "x": {\n    "key": true\n  }\n}');
            content = '{\n  "a": "b",  "x": "y"\n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['a'], null, formatterOptions);
            assertEdit(content, edits, '{\n  "a": null,  "x": "y"\n}');
        });
        test('insert property', () => {
            let content = '{}';
            let edits = (0, jsonEdit_1.setProperty)(content, ['foo'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "foo": "bar"\n}');
            edits = (0, jsonEdit_1.setProperty)(content, ['foo', 'foo2'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "foo": {\n    "foo2": "bar"\n  }\n}');
            content = '{\n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "foo": "bar"\n}');
            content = '  {\n  }';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo'], 'bar', formatterOptions);
            assertEdit(content, edits, '  {\n    "foo": "bar"\n  }');
            content = '{\n  "x": "y"\n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": "y",\n  "foo": "bar"\n}');
            content = '{\n  "x": "y"\n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['e'], 'null', formatterOptions);
            assertEdit(content, edits, '{\n  "x": "y",\n  "e": "null"\n}');
            edits = (0, jsonEdit_1.setProperty)(content, ['x'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": "bar"\n}');
            content = '{\n  "x": {\n    "a": 1,\n    "b": true\n  }\n}\n';
            edits = (0, jsonEdit_1.setProperty)(content, ['x'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": "bar"\n}\n');
            edits = (0, jsonEdit_1.setProperty)(content, ['x', 'b'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": {\n    "a": 1,\n    "b": "bar"\n  }\n}\n');
            edits = (0, jsonEdit_1.setProperty)(content, ['x', 'c'], 'bar', formatterOptions, () => 0);
            assertEdit(content, edits, '{\n  "x": {\n    "c": "bar",\n    "a": 1,\n    "b": true\n  }\n}\n');
            edits = (0, jsonEdit_1.setProperty)(content, ['x', 'c'], 'bar', formatterOptions, () => 1);
            assertEdit(content, edits, '{\n  "x": {\n    "a": 1,\n    "c": "bar",\n    "b": true\n  }\n}\n');
            edits = (0, jsonEdit_1.setProperty)(content, ['x', 'c'], 'bar', formatterOptions, () => 2);
            assertEdit(content, edits, '{\n  "x": {\n    "a": 1,\n    "b": true,\n    "c": "bar"\n  }\n}\n');
            edits = (0, jsonEdit_1.setProperty)(content, ['c'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": {\n    "a": 1,\n    "b": true\n  },\n  "c": "bar"\n}\n');
            content = '{\n  "a": [\n    {\n    } \n  ]  \n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "a": [\n    {\n    } \n  ],\n  "foo": "bar"\n}');
            content = '';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo', 0], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "foo": [\n    "bar"\n  ]\n}');
            content = '//comment';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo', 0], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "foo": [\n    "bar"\n  ]\n} //comment');
        });
        test('remove property', () => {
            let content = '{\n  "x": "y"\n}';
            let edits = (0, jsonEdit_1.removeProperty)(content, ['x'], formatterOptions);
            assertEdit(content, edits, '{\n}');
            content = '{\n  "x": "y", "a": []\n}';
            edits = (0, jsonEdit_1.removeProperty)(content, ['x'], formatterOptions);
            assertEdit(content, edits, '{\n  "a": []\n}');
            content = '{\n  "x": "y", "a": []\n}';
            edits = (0, jsonEdit_1.removeProperty)(content, ['a'], formatterOptions);
            assertEdit(content, edits, '{\n  "x": "y"\n}');
        });
        test('insert item at 0', () => {
            const content = '[\n  2,\n  3\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [0], 1, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  2,\n  3\n]');
        });
        test('insert item at 0 in empty array', () => {
            const content = '[\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [0], 1, formatterOptions);
            assertEdit(content, edits, '[\n  1\n]');
        });
        test('insert item at an index', () => {
            const content = '[\n  1,\n  3\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [1], 2, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  2,\n  3\n]');
        });
        test('insert item at an index im empty array', () => {
            const content = '[\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [1], 1, formatterOptions);
            assertEdit(content, edits, '[\n  1\n]');
        });
        test('insert item at end index', () => {
            const content = '[\n  1,\n  2\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [2], 3, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  2,\n  3\n]');
        });
        test('insert item at end to empty array', () => {
            const content = '[\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [-1], 'bar', formatterOptions);
            assertEdit(content, edits, '[\n  "bar"\n]');
        });
        test('insert item at end', () => {
            const content = '[\n  1,\n  2\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [-1], 'bar', formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  2,\n  "bar"\n]');
        });
        test('remove item in array with one item', () => {
            const content = '[\n  1\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [0], undefined, formatterOptions);
            assertEdit(content, edits, '[]');
        });
        test('remove item in the middle of the array', () => {
            const content = '[\n  1,\n  2,\n  3\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [1], undefined, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  3\n]');
        });
        test('remove last item in the array', () => {
            const content = '[\n  1,\n  2,\n  "bar"\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [2], undefined, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  2\n]');
        });
        test('remove last item in the array if ends with comma', () => {
            const content = '[\n  1,\n  "foo",\n  "bar",\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [2], undefined, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  "foo"\n]');
        });
        test('remove last item in the array if there is a comment in the beginning', () => {
            const content = '// This is a comment\n[\n  1,\n  "foo",\n  "bar"\n]';
            const edits = (0, jsonEdit_1.setProperty)(content, [2], undefined, formatterOptions);
            assertEdit(content, edits, '// This is a comment\n[\n  1,\n  "foo"\n]');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkVkaXQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9jb21tb24vanNvbkVkaXQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFRQSxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtRQUUxQixTQUFTLFVBQVUsQ0FBQyxPQUFlLEVBQUUsS0FBYSxFQUFFLFFBQWdCO1lBQ25FLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNkLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMzQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1RixNQUFNLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsa0NBQWtDO2dCQUN2RixjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDN0IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0s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