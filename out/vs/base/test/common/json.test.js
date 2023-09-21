define(["require", "exports", "assert", "vs/base/common/json", "vs/base/common/jsonErrorMessages"], function (require, exports, assert, json_1, jsonErrorMessages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertKinds(text, ...kinds) {
        const scanner = (0, json_1.createScanner)(text);
        let kind;
        while ((kind = scanner.scan()) !== 17 /* SyntaxKind.EOF */) {
            assert.strictEqual(kind, kinds.shift());
        }
        assert.strictEqual(kinds.length, 0);
    }
    function assertScanError(text, expectedKind, scanError) {
        const scanner = (0, json_1.createScanner)(text);
        scanner.scan();
        assert.strictEqual(scanner.getToken(), expectedKind);
        assert.strictEqual(scanner.getTokenError(), scanError);
    }
    function assertValidParse(input, expected, options) {
        const errors = [];
        const actual = (0, json_1.parse)(input, errors, options);
        if (errors.length !== 0) {
            assert(false, (0, jsonErrorMessages_1.getParseErrorMessage)(errors[0].error));
        }
        assert.deepStrictEqual(actual, expected);
    }
    function assertInvalidParse(input, expected, options) {
        const errors = [];
        const actual = (0, json_1.parse)(input, errors, options);
        assert(errors.length > 0);
        assert.deepStrictEqual(actual, expected);
    }
    function assertTree(input, expected, expectedErrors = [], options) {
        const errors = [];
        const actual = (0, json_1.parseTree)(input, errors, options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9qc29uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsU0FBUyxXQUFXLENBQUMsSUFBWSxFQUFFLEdBQUcsS0FBbUI7UUFDeEQsTUFBTSxPQUFPLEdBQUcsSUFBQSxvQkFBYSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksSUFBZ0IsQ0FBQztRQUNyQixPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyw0QkFBbUIsRUFBRTtZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUN4QztRQUNELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBQ0QsU0FBUyxlQUFlLENBQUMsSUFBWSxFQUFFLFlBQXdCLEVBQUUsU0FBb0I7UUFDcEYsTUFBTSxPQUFPLEdBQUcsSUFBQSxvQkFBYSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFDLEtBQWEsRUFBRSxRQUFhLEVBQUUsT0FBc0I7UUFDN0UsTUFBTSxNQUFNLEdBQWlCLEVBQUUsQ0FBQztRQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFBLFlBQUssRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FB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