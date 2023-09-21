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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaXBDb21tZW50cy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9zdHJpcENvbW1lbnRzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsOEVBQThFO0lBRTlFLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7UUFDNUIsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7WUFDekIsTUFBTSxPQUFPLEdBQVc7Z0JBQ3ZCLEdBQUc7Z0JBQ0gsNkJBQTZCO2dCQUM3QixHQUFHO2FBQ0gsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDYixNQUFNLFFBQVEsR0FBRztnQkFDaEIsR0FBRztnQkFDSCxpQkFBaUI7Z0JBQ2pCLEdBQUc7YUFDSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNiLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSw2QkFBYSxFQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtZQUMvQixNQUFNLE9BQU8sR0FBVztnQkFDdkIsR0FBRztnQkFDSCxHQUFHO2dCQUNILGNBQWM7YUFDZCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNiLE1BQU0sUUFBUSxHQUFHO2dCQUNoQixHQUFHO2dCQUNILEdBQUc7Z0JBQ0gsRUFBRTthQUNGLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBQ2xDLE1BQU0sT0FBTyxHQUFX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