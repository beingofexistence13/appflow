define(["require", "exports", "assert", "vs/base/common/json", "vs/base/common/jsonErrorMessages"], function (require, exports, assert, json_1, jsonErrorMessages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertKinds(text, ...kinds) {
        const scanner = (0, json_1.$Jm)(text);
        let kind;
        while ((kind = scanner.scan()) !== 17 /* SyntaxKind.EOF */) {
            assert.strictEqual(kind, kinds.shift());
        }
        assert.strictEqual(kinds.length, 0);
    }
    function assertScanError(text, expectedKind, scanError) {
        const scanner = (0, json_1.$Jm)(text);
        scanner.scan();
        assert.strictEqual(scanner.getToken(), expectedKind);
        assert.strictEqual(scanner.getTokenError(), scanError);
    }
    function assertValidParse(input, expected, options) {
        const errors = [];
        const actual = (0, json_1.$Lm)(input, errors, options);
        if (errors.length !== 0) {
            assert(false, (0, jsonErrorMessages_1.$mp)(errors[0].error));
        }
        assert.deepStrictEqual(actual, expected);
    }
    function assertInvalidParse(input, expected, options) {
        const errors = [];
        const actual = (0, json_1.$Lm)(input, errors, options);
        assert(errors.length > 0);
        assert.deepStrictEqual(actual, expected);
    }
    function assertTree(input, expected, expectedErrors = [], options) {
        const errors = [];
        const actual = (0, json_1.$Mm)(input, errors, options);
        assert.deepStrictEqual(errors.map(e => e.error, expected), expectedErrors);
        const checkParent = (node) => {
            if (node.children) {
                for (const child of node.children) {
                    assert.strictEqual(node, child.parent);
                    delete child.parent; // delete to avoid recursion in deep equal
                    checkParent(child);
                }
            }
        };
        checkParent(actual);
        assert.deepStrictEqual(actual, expected);
    }
    suite('JSON', () => {
        test('tokens', () => {
            assertKinds('{', 1 /* SyntaxKind.OpenBraceToken */);
            assertKinds('}', 2 /* SyntaxKind.CloseBraceToken */);
            assertKinds('[', 3 /* SyntaxKind.OpenBracketToken */);
            assertKinds(']', 4 /* SyntaxKind.CloseBracketToken */);
            assertKinds(':', 6 /* SyntaxKind.ColonToken */);
            assertKinds(',', 5 /* SyntaxKind.CommaToken */);
        });
        test('comments', () => {
            assertKinds('// this is a comment', 12 /* SyntaxKind.LineCommentTrivia */);
            assertKinds('// this is a comment\n', 12 /* SyntaxKind.LineCommentTrivia */, 14 /* SyntaxKind.LineBreakTrivia */);
            assertKinds('/* this is a comment*/', 13 /* SyntaxKind.BlockCommentTrivia */);
            assertKinds('/* this is a \r\ncomment*/', 13 /* SyntaxKind.BlockCommentTrivia */);
            assertKinds('/* this is a \ncomment*/', 13 /* SyntaxKind.BlockCommentTrivia */);
            // unexpected end
            assertKinds('/* this is a', 13 /* SyntaxKind.BlockCommentTrivia */);
            assertKinds('/* this is a \ncomment', 13 /* SyntaxKind.BlockCommentTrivia */);
            // broken comment
            assertKinds('/ ttt', 16 /* SyntaxKind.Unknown */, 15 /* SyntaxKind.Trivia */, 16 /* SyntaxKind.Unknown */);
        });
        test('strings', () => {
            assertKinds('"test"', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"\\""', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"\\/"', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"\\b"', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"\\f"', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"\\n"', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"\\r"', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"\\t"', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"\\v"', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"\u88ff"', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"​\u2028"', 10 /* SyntaxKind.StringLiteral */);
            // unexpected end
            assertKinds('"test', 10 /* SyntaxKind.StringLiteral */);
            assertKinds('"test\n"', 10 /* SyntaxKind.StringLiteral */, 14 /* SyntaxKind.LineBreakTrivia */, 10 /* SyntaxKind.StringLiteral */);
            // invalid characters
            assertScanError('"\t"', 10 /* SyntaxKind.StringLiteral */, 6 /* ScanError.InvalidCharacter */);
            assertScanError('"\t "', 10 /* SyntaxKind.StringLiteral */, 6 /* ScanError.InvalidCharacter */);
        });
        test('numbers', () => {
            assertKinds('0', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('0.1', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('-0.1', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('-1', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('1', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('123456789', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('10', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('90', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('90E+123', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('90e+123', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('90e-123', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('90E-123', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('90E123', 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('90e123', 11 /* SyntaxKind.NumericLiteral */);
            // zero handling
            assertKinds('01', 11 /* SyntaxKind.NumericLiteral */, 11 /* SyntaxKind.NumericLiteral */);
            assertKinds('-01', 11 /* SyntaxKind.NumericLiteral */, 11 /* SyntaxKind.NumericLiteral */);
            // unexpected end
            assertKinds('-', 16 /* SyntaxKind.Unknown */);
            assertKinds('.0', 16 /* SyntaxKind.Unknown */);
        });
        test('keywords: true, false, null', () => {
            assertKinds('true', 8 /* SyntaxKind.TrueKeyword */);
            assertKinds('false', 9 /* SyntaxKind.FalseKeyword */);
            assertKinds('null', 7 /* SyntaxKind.NullKeyword */);
            assertKinds('true false null', 8 /* SyntaxKind.TrueKeyword */, 15 /* SyntaxKind.Trivia */, 9 /* SyntaxKind.FalseKeyword */, 15 /* SyntaxKind.Trivia */, 7 /* SyntaxKind.NullKeyword */);
            // invalid words
            assertKinds('nulllll', 16 /* SyntaxKind.Unknown */);
            assertKinds('True', 16 /* SyntaxKind.Unknown */);
            assertKinds('foo-bar', 16 /* SyntaxKind.Unknown */);
            assertKinds('foo bar', 16 /* SyntaxKind.Unknown */, 15 /* SyntaxKind.Trivia */, 16 /* SyntaxKind.Unknown */);
        });
        test('trivia', () => {
            assertKinds(' ', 15 /* SyntaxKind.Trivia */);
            assertKinds('  \t  ', 15 /* SyntaxKind.Trivia */);
            assertKinds('  \t  \n  \t  ', 15 /* SyntaxKind.Trivia */, 14 /* SyntaxKind.LineBreakTrivia */, 15 /* SyntaxKind.Trivia */);
            assertKinds('\r\n', 14 /* SyntaxKind.LineBreakTrivia */);
            assertKinds('\r', 14 /* SyntaxKind.LineBreakTrivia */);
            assertKinds('\n', 14 /* SyntaxKind.LineBreakTrivia */);
            assertKinds('\n\r', 14 /* SyntaxKind.LineBreakTrivia */, 14 /* SyntaxKind.LineBreakTrivia */);
            assertKinds('\n   \n', 14 /* SyntaxKind.LineBreakTrivia */, 15 /* SyntaxKind.Trivia */, 14 /* SyntaxKind.LineBreakTrivia */);
        });
        test('parse: literals', () => {
            assertValidParse('true', true);
            assertValidParse('false', false);
            assertValidParse('null', null);
            assertValidParse('"foo"', 'foo');
            assertValidParse('"\\"-\\\\-\\/-\\b-\\f-\\n-\\r-\\t"', '"-\\-/-\b-\f-\n-\r-\t');
            assertValidParse('"\\u00DC"', 'Ü');
            assertValidParse('9', 9);
            assertValidParse('-9', -9);
            assertValidParse('0.129', 0.129);
            assertValidParse('23e3', 23e3);
            assertValidParse('1.2E+3', 1.2E+3);
            assertValidParse('1.2E-3', 1.2E-3);
            assertValidParse('1.2E-3 // comment', 1.2E-3);
        });
        test('parse: objects', () => {
            assertValidParse('{}', {});
            assertValidParse('{ "foo": true }', { foo: true });
            assertValidParse('{ "bar": 8, "xoo": "foo" }', { bar: 8, xoo: 'foo' });
            assertValidParse('{ "hello": [], "world": {} }', { hello: [], world: {} });
            assertValidParse('{ "a": false, "b": true, "c": [ 7.4 ] }', { a: false, b: true, c: [7.4] });
            assertValidParse('{ "lineComment": "//", "blockComment": ["/*", "*/"], "brackets": [ ["{", "}"], ["[", "]"], ["(", ")"] ] }', { lineComment: '//', blockComment: ['/*', '*/'], brackets: [['{', '}'], ['[', ']'], ['(', ')']] });
            assertValidParse('{ "hello": [], "world": {} }', { hello: [], world: {} });
            assertValidParse('{ "hello": { "again": { "inside": 5 }, "world": 1 }}', { hello: { again: { inside: 5 }, world: 1 } });
            assertValidParse('{ "foo": /*hello*/true }', { foo: true });
        });
        test('parse: arrays', () => {
            assertValidParse('[]', []);
            assertValidParse('[ [],  [ [] ]]', [[], [[]]]);
            assertValidParse('[ 1, 2, 3 ]', [1, 2, 3]);
            assertValidParse('[ { "a": null } ]', [{ a: null }]);
        });
        test('parse: objects with errors', () => {
            assertInvalidParse('{,}', {});
            assertInvalidParse('{ "foo": true, }', { foo: true }, { allowTrailingComma: false });
            assertInvalidParse('{ "bar": 8 "xoo": "foo" }', { bar: 8, xoo: 'foo' });
            assertInvalidParse('{ ,"bar": 8 }', { bar: 8 });
            assertInvalidParse('{ ,"bar": 8, "foo" }', { bar: 8 });
            assertInvalidParse('{ "bar": 8, "foo": }', { bar: 8 });
            assertInvalidParse('{ 8, "foo": 9 }', { foo: 9 });
        });
        test('parse: array with errors', () => {
            assertInvalidParse('[,]', []);
            assertInvalidParse('[ 1, 2, ]', [1, 2], { allowTrailingComma: false });
            assertInvalidParse('[ 1 2, 3 ]', [1, 2, 3]);
            assertInvalidParse('[ ,1, 2, 3 ]', [1, 2, 3]);
            assertInvalidParse('[ ,1, 2, 3, ]', [1, 2, 3], { allowTrailingComma: false });
        });
        test('parse: disallow commments', () => {
            const options = { disallowComments: true };
            assertValidParse('[ 1, 2, null, "foo" ]', [1, 2, null, 'foo'], options);
            assertValidParse('{ "hello": [], "world": {} }', { hello: [], world: {} }, options);
            assertInvalidParse('{ "foo": /*comment*/ true }', { foo: true }, options);
        });
        test('parse: trailing comma', () => {
            // default is allow
            assertValidParse('{ "hello": [], }', { hello: [] });
            let options = { allowTrailingComma: true };
            assertValidParse('{ "hello": [], }', { hello: [] }, options);
            assertValidParse('{ "hello": [] }', { hello: [] }, options);
            assertValidParse('{ "hello": [], "world": {}, }', { hello: [], world: {} }, options);
            assertValidParse('{ "hello": [], "world": {} }', { hello: [], world: {} }, options);
            assertValidParse('{ "hello": [1,] }', { hello: [1] }, options);
            options = { allowTrailingComma: false };
            assertInvalidParse('{ "hello": [], }', { hello: [] }, options);
            assertInvalidParse('{ "hello": [], "world": {}, }', { hello: [], world: {} }, options);
        });
        test('tree: literals', () => {
            assertTree('true', { type: 'boolean', offset: 0, length: 4, value: true });
            assertTree('false', { type: 'boolean', offset: 0, length: 5, value: false });
            assertTree('null', { type: 'null', offset: 0, length: 4, value: null });
            assertTree('23', { type: 'number', offset: 0, length: 2, value: 23 });
            assertTree('-1.93e-19', { type: 'number', offset: 0, length: 9, value: -1.93e-19 });
            assertTree('"hello"', { type: 'string', offset: 0, length: 7, value: 'hello' });
        });
        test('tree: arrays', () => {
            assertTree('[]', { type: 'array', offset: 0, length: 2, children: [] });
            assertTree('[ 1 ]', { type: 'array', offset: 0, length: 5, children: [{ type: 'number', offset: 2, length: 1, value: 1 }] });
            assertTree('[ 1,"x"]', {
                type: 'array', offset: 0, length: 8, children: [
                    { type: 'number', offset: 2, length: 1, value: 1 },
                    { type: 'string', offset: 4, length: 3, value: 'x' }
                ]
            });
            assertTree('[[]]', {
                type: 'array', offset: 0, length: 4, children: [
                    { type: 'array', offset: 1, length: 2, children: [] }
                ]
            });
        });
        test('tree: objects', () => {
            assertTree('{ }', { type: 'object', offset: 0, length: 3, children: [] });
            assertTree('{ "val": 1 }', {
                type: 'object', offset: 0, length: 12, children: [
                    {
                        type: 'property', offset: 2, length: 8, colonOffset: 7, children: [
                            { type: 'string', offset: 2, length: 5, value: 'val' },
                            { type: 'number', offset: 9, length: 1, value: 1 }
                        ]
                    }
                ]
            });
            assertTree('{"id": "$", "v": [ null, null] }', {
                type: 'object', offset: 0, length: 32, children: [
                    {
                        type: 'property', offset: 1, length: 9, colonOffset: 5, children: [
                            { type: 'string', offset: 1, length: 4, value: 'id' },
                            { type: 'string', offset: 7, length: 3, value: '$' }
                        ]
                    },
                    {
                        type: 'property', offset: 12, length: 18, colonOffset: 15, children: [
                            { type: 'string', offset: 12, length: 3, value: 'v' },
                            {
                                type: 'array', offset: 17, length: 13, children: [
                                    { type: 'null', offset: 19, length: 4, value: null },
                                    { type: 'null', offset: 25, length: 4, value: null }
                                ]
                            }
                        ]
                    }
                ]
            });
            assertTree('{  "id": { "foo": { } } , }', {
                type: 'object', offset: 0, length: 27, children: [
                    {
                        type: 'property', offset: 3, length: 20, colonOffset: 7, children: [
                            { type: 'string', offset: 3, length: 4, value: 'id' },
                            {
                                type: 'object', offset: 9, length: 14, children: [
                                    {
                                        type: 'property', offset: 11, length: 10, colonOffset: 16, children: [
                                            { type: 'string', offset: 11, length: 5, value: 'foo' },
                                            { type: 'object', offset: 18, length: 3, children: [] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }, [3 /* ParseErrorCode.PropertyNameExpected */, 4 /* ParseErrorCode.ValueExpected */], { allowTrailingComma: false });
        });
    });
});
//# sourceMappingURL=json.test.js.map