/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/find/browser/findController", "vs/editor/test/browser/testCodeEditor"], function (require, exports, assert, utils_1, position_1, range_1, findController_1, testCodeEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Find', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('search string at position', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'ABC DEF',
                '0123 456'
            ], {}, (editor) => {
                // The cursor is at the very top, of the file, at the first ABC
                const searchStringAtTop = (0, findController_1.getSelectionSearchString)(editor);
                assert.strictEqual(searchStringAtTop, 'ABC');
                // Move cursor to the end of ABC
                editor.setPosition(new position_1.Position(1, 3));
                const searchStringAfterABC = (0, findController_1.getSelectionSearchString)(editor);
                assert.strictEqual(searchStringAfterABC, 'ABC');
                // Move cursor to DEF
                editor.setPosition(new position_1.Position(1, 5));
                const searchStringInsideDEF = (0, findController_1.getSelectionSearchString)(editor);
                assert.strictEqual(searchStringInsideDEF, 'DEF');
            });
        });
        test('search string with selection', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'ABC DEF',
                '0123 456'
            ], {}, (editor) => {
                // Select A of ABC
                editor.setSelection(new range_1.Range(1, 1, 1, 2));
                const searchStringSelectionA = (0, findController_1.getSelectionSearchString)(editor);
                assert.strictEqual(searchStringSelectionA, 'A');
                // Select BC of ABC
                editor.setSelection(new range_1.Range(1, 2, 1, 4));
                const searchStringSelectionBC = (0, findController_1.getSelectionSearchString)(editor);
                assert.strictEqual(searchStringSelectionBC, 'BC');
                // Select BC DE
                editor.setSelection(new range_1.Range(1, 2, 1, 7));
                const searchStringSelectionBCDE = (0, findController_1.getSelectionSearchString)(editor);
                assert.strictEqual(searchStringSelectionBCDE, 'BC DE');
            });
        });
        test('search string with multiline selection', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'ABC DEF',
                '0123 456'
            ], {}, (editor) => {
                // Select first line and newline
                editor.setSelection(new range_1.Range(1, 1, 2, 1));
                const searchStringSelectionWholeLine = (0, findController_1.getSelectionSearchString)(editor);
                assert.strictEqual(searchStringSelectionWholeLine, null);
                // Select first line and chunk of second
                editor.setSelection(new range_1.Range(1, 1, 2, 4));
                const searchStringSelectionTwoLines = (0, findController_1.getSelectionSearchString)(editor);
                assert.strictEqual(searchStringSelectionTwoLines, null);
                // Select end of first line newline and chunk of second
                editor.setSelection(new range_1.Range(1, 7, 2, 4));
                const searchStringSelectionSpanLines = (0, findController_1.getSelectionSearchString)(editor);
                assert.strictEqual(searchStringSelectionSpanLines, null);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZmluZC90ZXN0L2Jyb3dzZXIvZmluZC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBVWhHLEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO1FBRWxCLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1lBQ3RDLElBQUEsbUNBQWtCLEVBQUM7Z0JBQ2xCLFNBQVM7Z0JBQ1QsVUFBVTthQUNWLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBRWpCLCtEQUErRDtnQkFDL0QsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLHlDQUF3QixFQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUU3QyxnQ0FBZ0M7Z0JBQ2hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLG9CQUFvQixHQUFHLElBQUEseUNBQXdCLEVBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlELE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRWhELHFCQUFxQjtnQkFDckIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0scUJBQXFCLEdBQUcsSUFBQSx5Q0FBd0IsRUFBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVsRCxDQUFD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