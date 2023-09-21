define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, range_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Model - Model Edit Operation', () => {
        const LINE1 = 'My First Line';
        const LINE2 = '\t\tMy Second Line';
        const LINE3 = '    Third Line';
        const LINE4 = '';
        const LINE5 = '1';
        let model;
        setup(() => {
            const text = LINE1 + '\r\n' +
                LINE2 + '\n' +
                LINE3 + '\n' +
                LINE4 + '\r\n' +
                LINE5;
            model = (0, testTextModel_1.$O0b)(text);
        });
        teardown(() => {
            model.dispose();
        });
        (0, utils_1.$bT)();
        function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
            const range = new range_1.$ks(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn);
            return {
                range: range,
                text: text,
                forceMoveMarkers: false
            };
        }
        function assertSingleEditOp(singleEditOp, editedLines) {
            const editOp = [singleEditOp];
            const inverseEditOp = model.applyEdits(editOp, true);
            assert.strictEqual(model.getLineCount(), editedLines.length);
            for (let i = 0; i < editedLines.length; i++) {
                assert.strictEqual(model.getLineContent(i + 1), editedLines[i]);
            }
            const originalOp = model.applyEdits(inverseEditOp, true);
            assert.strictEqual(model.getLineCount(), 5);
            assert.strictEqual(model.getLineContent(1), LINE1);
            assert.strictEqual(model.getLineContent(2), LINE2);
            assert.strictEqual(model.getLineContent(3), LINE3);
            assert.strictEqual(model.getLineContent(4), LINE4);
            assert.strictEqual(model.getLineContent(5), LINE5);
            const simplifyEdit = (edit) => {
                return {
                    range: edit.range,
                    text: edit.text,
                    forceMoveMarkers: edit.forceMoveMarkers || false
                };
            };
            assert.deepStrictEqual(originalOp.map(simplifyEdit), editOp.map(simplifyEdit));
        }
        test('Insert inline', () => {
            assertSingleEditOp(createSingleEditOp('a', 1, 1), [
                'aMy First Line',
                LINE2,
                LINE3,
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/inline 1', () => {
            assertSingleEditOp(createSingleEditOp(' incredibly awesome', 1, 3), [
                'My incredibly awesome First Line',
                LINE2,
                LINE3,
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/inline 2', () => {
            assertSingleEditOp(createSingleEditOp(' with text at the end.', 1, 14), [
                'My First Line with text at the end.',
                LINE2,
                LINE3,
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/inline 3', () => {
            assertSingleEditOp(createSingleEditOp('My new First Line.', 1, 1, 1, 14), [
                'My new First Line.',
                LINE2,
                LINE3,
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/multi line 1', () => {
            assertSingleEditOp(createSingleEditOp('My new First Line.', 1, 1, 3, 15), [
                'My new First Line.',
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/multi line 2', () => {
            assertSingleEditOp(createSingleEditOp('My new First Line.', 1, 2, 3, 15), [
                'MMy new First Line.',
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/multi line 3', () => {
            assertSingleEditOp(createSingleEditOp('My new First Line.', 1, 2, 3, 2), [
                'MMy new First Line.   Third Line',
                LINE4,
                LINE5
            ]);
        });
        test('Replace muli line/multi line', () => {
            assertSingleEditOp(createSingleEditOp('1\n2\n3\n4\n', 1, 1), [
                '1',
                '2',
                '3',
                '4',
                LINE1,
                LINE2,
                LINE3,
                LINE4,
                LINE5
            ]);
        });
    });
});
//# sourceMappingURL=modelEditOperation.test.js.map