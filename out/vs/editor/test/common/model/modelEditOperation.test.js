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
            model = (0, testTextModel_1.createTextModel)(text);
        });
        teardown(() => {
            model.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
            const range = new range_1.Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxFZGl0T3BlcmF0aW9uLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZWwvbW9kZWxFZGl0T3BlcmF0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsRUFBRTtRQUNqRCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUM7UUFDOUIsTUFBTSxLQUFLLEdBQUcsb0JBQW9CLENBQUM7UUFDbkMsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUM7UUFDL0IsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUVsQixJQUFJLEtBQWdCLENBQUM7UUFFckIsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLE1BQU0sSUFBSSxHQUNULEtBQUssR0FBRyxNQUFNO2dCQUNkLEtBQUssR0FBRyxJQUFJO2dCQUNaLEtBQUssR0FBRyxJQUFJO2dCQUNaLEtBQUssR0FBRyxNQUFNO2dCQUNkLEtBQUssQ0FBQztZQUNQLEtBQUssR0FBRyxJQUFBLCtCQUFlLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLFNBQVMsa0JBQWtCLENBQUMsSUFBWSxFQUFFLGtCQUEwQixFQUFFLGNBQXNCLEVBQUUsc0JBQThCLGtCQUFrQixFQUFFLGtCQUEwQixjQUFjO1lBQ3ZMLE1BQU0sS0FBSyxHQUFHLElBQUksYUFBSyxDQUN0QixtQkFBbUIsRUFDbkIsZUFBZSxFQUNmLGtCQUFrQixFQUNsQixjQUFjLENBQ2QsQ0FBQztZQUVGLE9B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