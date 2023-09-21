define(["require", "exports", "assert", "vs/base/common/jsonFormatter"], function (require, exports, assert, Formatter) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('JSON - formatter', () => {
        function format(content, expected, insertSpaces = true) {
            let range = undefined;
            const rangeStart = content.indexOf('|');
            const rangeEnd = content.lastIndexOf('|');
            if (rangeStart !== -1 && rangeEnd !== -1) {
                content = content.substring(0, rangeStart) + content.substring(rangeStart + 1, rangeEnd) + content.substring(rangeEnd + 1);
                range = { offset: rangeStart, length: rangeEnd - rangeStart };
            }
            const edits = Formatter.format(content, range, { tabSize: 2, insertSpaces: insertSpaces, eol: '\n' });
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
        test('object - single property', () => {
            const content = [
                '{"x" : 1}'
            ].join('\n');
            const expected = [
                '{',
                '  "x": 1',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('object - multiple properties', () => {
            const content = [
                '{"x" : 1,  "y" : "foo", "z"  : true}'
            ].join('\n');
            const expected = [
                '{',
                '  "x": 1,',
                '  "y": "foo",',
                '  "z": true',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('object - no properties ', () => {
            const content = [
                '{"x" : {    },  "y" : {}}'
            ].join('\n');
            const expected = [
                '{',
                '  "x": {},',
                '  "y": {}',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('object - nesting', () => {
            const content = [
                '{"x" : {  "y" : { "z"  : { }}, "a": true}}'
            ].join('\n');
            const expected = [
                '{',
                '  "x": {',
                '    "y": {',
                '      "z": {}',
                '    },',
                '    "a": true',
                '  }',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('array - single items', () => {
            const content = [
                '["[]"]'
            ].join('\n');
            const expected = [
                '[',
                '  "[]"',
                ']'
            ].join('\n');
            format(content, expected);
        });
        test('array - multiple items', () => {
            const content = [
                '[true,null,1.2]'
            ].join('\n');
            const expected = [
                '[',
                '  true,',
                '  null,',
                '  1.2',
                ']'
            ].join('\n');
            format(content, expected);
        });
        test('array - no items', () => {
            const content = [
                '[      ]'
            ].join('\n');
            const expected = [
                '[]'
            ].join('\n');
            format(content, expected);
        });
        test('array - nesting', () => {
            const content = [
                '[ [], [ [ {} ], "a" ]  ]'
            ].join('\n');
            const expected = [
                '[',
                '  [],',
                '  [',
                '    [',
                '      {}',
                '    ],',
                '    "a"',
                '  ]',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('syntax errors', () => {
            const content = [
                '[ null 1.2 ]'
            ].join('\n');
            const expected = [
                '[',
                '  null 1.2',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('empty lines', () => {
            const content = [
                '{',
                '"a": true,',
                '',
                '"b": true',
                '}',
            ].join('\n');
            const expected = [
                '{',
                '\t"a": true,',
                '\t"b": true',
                '}',
            ].join('\n');
            format(content, expected, false);
        });
        test('single line comment', () => {
            const content = [
                '[ ',
                '//comment',
                '"foo", "bar"',
                '] '
            ].join('\n');
            const expected = [
                '[',
                '  //comment',
                '  "foo",',
                '  "bar"',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('block line comment', () => {
            const content = [
                '[{',
                '        /*comment*/     ',
                '"foo" : true',
                '}] '
            ].join('\n');
            const expected = [
                '[',
                '  {',
                '    /*comment*/',
                '    "foo": true',
                '  }',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('single line comment on same line', () => {
            const content = [
                ' {  ',
                '        "a": {}// comment    ',
                ' } '
            ].join('\n');
            const expected = [
                '{',
                '  "a": {} // comment    ',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('single line comment on same line 2', () => {
            const content = [
                '{ //comment',
                '}'
            ].join('\n');
            const expected = [
                '{ //comment',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('block comment on same line', () => {
            const content = [
                '{      "a": {}, /*comment*/    ',
                '        /*comment*/ "b": {},    ',
                '        "c": {/*comment*/}    } ',
            ].join('\n');
            const expected = [
                '{',
                '  "a": {}, /*comment*/',
                '  /*comment*/ "b": {},',
                '  "c": { /*comment*/}',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('block comment on same line advanced', () => {
            const content = [
                ' {       "d": [',
                '             null',
                '        ] /*comment*/',
                '        ,"e": /*comment*/ [null] }',
            ].join('\n');
            const expected = [
                '{',
                '  "d": [',
                '    null',
                '  ] /*comment*/,',
                '  "e": /*comment*/ [',
                '    null',
                '  ]',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('multiple block comments on same line', () => {
            const content = [
                '{      "a": {} /*comment*/, /*comment*/   ',
                '        /*comment*/ "b": {}  /*comment*/  } '
            ].join('\n');
            const expected = [
                '{',
                '  "a": {} /*comment*/, /*comment*/',
                '  /*comment*/ "b": {} /*comment*/',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('multiple mixed comments on same line', () => {
            const content = [
                '[ /*comment*/  /*comment*/   // comment ',
                ']'
            ].join('\n');
            const expected = [
                '[ /*comment*/ /*comment*/ // comment ',
                ']'
            ].join('\n');
            format(content, expected);
        });
        test('range', () => {
            const content = [
                '{ "a": {},',
                '|"b": [null, null]|',
                '} '
            ].join('\n');
            const expected = [
                '{ "a": {},',
                '"b": [',
                '  null,',
                '  null',
                ']',
                '} ',
            ].join('\n');
            format(content, expected);
        });
        test('range with existing indent', () => {
            const content = [
                '{ "a": {},',
                '   |"b": [null],',
                '"c": {}',
                '}|'
            ].join('\n');
            const expected = [
                '{ "a": {},',
                '   "b": [',
                '    null',
                '  ],',
                '  "c": {}',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('range with existing indent - tabs', () => {
            const content = [
                '{ "a": {},',
                '|  "b": [null],   ',
                '"c": {}',
                '} |    '
            ].join('\n');
            const expected = [
                '{ "a": {},',
                '\t"b": [',
                '\t\tnull',
                '\t],',
                '\t"c": {}',
                '}',
            ].join('\n');
            format(content, expected, false);
        });
        test('block comment none-line breaking symbols', () => {
            const content = [
                '{ "a": [ 1',
                '/* comment */',
                ', 2',
                '/* comment */',
                ']',
                '/* comment */',
                ',',
                ' "b": true',
                '/* comment */',
                '}'
            ].join('\n');
            const expected = [
                '{',
                '  "a": [',
                '    1',
                '    /* comment */',
                '    ,',
                '    2',
                '    /* comment */',
                '  ]',
                '  /* comment */',
                '  ,',
                '  "b": true',
                '  /* comment */',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('line comment after none-line breaking symbols', () => {
            const content = [
                '{ "a":',
                '// comment',
                'null,',
                ' "b"',
                '// comment',
                ': null',
                '// comment',
                '}'
            ].join('\n');
            const expected = [
                '{',
                '  "a":',
                '  // comment',
                '  null,',
                '  "b"',
                '  // comment',
                '  : null',
                '  // comment',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('toFormattedString', () => {
            const obj = {
                a: { b: 1, d: ['hello'] }
            };
            const getExpected = (tab, eol) => {
                return [
                    `{`,
                    `${tab}"a": {`,
                    `${tab}${tab}"b": 1,`,
                    `${tab}${tab}"d": [`,
                    `${tab}${tab}${tab}"hello"`,
                    `${tab}${tab}]`,
                    `${tab}}`,
                    '}'
                ].join(eol);
            };
            let actual = Formatter.toFormattedString(obj, { insertSpaces: true, tabSize: 2, eol: '\n' });
            assert.strictEqual(actual, getExpected('  ', '\n'));
            actual = Formatter.toFormattedString(obj, { insertSpaces: true, tabSize: 2, eol: '\r\n' });
            assert.strictEqual(actual, getExpected('  ', '\r\n'));
            actual = Formatter.toFormattedString(obj, { insertSpaces: false, eol: '\r\n' });
            assert.strictEqual(actual, getExpected('\t', '\r\n'));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkZvcm1hdHRlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9qc29uRm9ybWF0dGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtRQUU5QixTQUFTLE1BQU0sQ0FBQyxPQUFlLEVBQUUsUUFBZ0IsRUFBRSxZQUFZLEdBQUcsSUFBSTtZQUNyRSxJQUFJLEtBQUssR0FBZ0MsU0FBUyxDQUFDO1lBQ25ELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLFVBQVUsS0FBSyxDQUFDLENBQUMsSUFBSSxRQUFRLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3pDLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzNILEtBQUssR0FBRyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsR0FBRyxVQUFVLEVBQUUsQ0FBQzthQUM5RDtZQUVELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV0RyxJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ3BDLEtB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