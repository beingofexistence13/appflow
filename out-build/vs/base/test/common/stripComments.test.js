define(["require", "exports", "assert", "vs/base/common/stripComments"], function (require, exports, assert, stripComments_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // We use this regular expression quite often to strip comments in JSON files.
    suite('Strip Comments', () => {
        test('Line comment', () => {
            const content = [
                "{",
                "  \"prop\": 10 // a comment",
                "}",
            ].join('\n');
            const expected = [
                "{",
                "  \"prop\": 10 ",
                "}",
            ].join('\n');
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
        test('Line comment - EOF', () => {
            const content = [
                "{",
                "}",
                "// a comment"
            ].join('\n');
            const expected = [
                "{",
                "}",
                ""
            ].join('\n');
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
        test('Line comment - \\r\\n', () => {
            const content = [
                "{",
                "  \"prop\": 10 // a comment",
                "}",
            ].join('\r\n');
            const expected = [
                "{",
                "  \"prop\": 10 ",
                "}",
            ].join('\r\n');
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
        test('Line comment - EOF - \\r\\n', () => {
            const content = [
                "{",
                "}",
                "// a comment"
            ].join('\r\n');
            const expected = [
                "{",
                "}",
                ""
            ].join('\r\n');
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
        test('Block comment - single line', () => {
            const content = [
                "{",
                "  /* before */\"prop\": 10/* after */",
                "}",
            ].join('\n');
            const expected = [
                "{",
                "  \"prop\": 10",
                "}",
            ].join('\n');
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
        test('Block comment - multi line', () => {
            const content = [
                "{",
                "  /**",
                "   * Some comment",
                "   */",
                "  \"prop\": 10",
                "}",
            ].join('\n');
            const expected = [
                "{",
                "  ",
                "  \"prop\": 10",
                "}",
            ].join('\n');
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
        test('Block comment - shortest match', () => {
            const content = "/* abc */ */";
            const expected = " */";
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
        test('No strings - double quote', () => {
            const content = [
                "{",
                "  \"/* */\": 10",
                "}"
            ].join('\n');
            const expected = [
                "{",
                "  \"/* */\": 10",
                "}"
            ].join('\n');
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
        test('No strings - single quote', () => {
            const content = [
                "{",
                "  '/* */': 10",
                "}"
            ].join('\n');
            const expected = [
                "{",
                "  '/* */': 10",
                "}"
            ].join('\n');
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
        test('Trailing comma in object', () => {
            const content = [
                "{",
                `  "a": 10,`,
                "}"
            ].join('\n');
            const expected = [
                "{",
                `  "a": 10`,
                "}"
            ].join('\n');
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
        test('Trailing comma in array', () => {
            const content = [
                `[ "a", "b", "c", ]`
            ].join('\n');
            const expected = [
                `[ "a", "b", "c" ]`
            ].join('\n');
            assert.strictEqual((0, stripComments_1.stripComments)(content), expected);
        });
    });
});
//# sourceMappingURL=stripComments.test.js.map