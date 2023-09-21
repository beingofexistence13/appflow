/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/contrib/caretOperations/browser/moveCaretCommand", "vs/editor/test/browser/testCommand"], function (require, exports, utils_1, selection_1, moveCaretCommand_1, testCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testMoveCaretLeftCommand(lines, selection, expectedLines, expectedSelection) {
        (0, testCommand_1.testCommand)(lines, null, selection, (accessor, sel) => new moveCaretCommand_1.MoveCaretCommand(sel, true), expectedLines, expectedSelection);
    }
    function testMoveCaretRightCommand(lines, selection, expectedLines, expectedSelection) {
        (0, testCommand_1.testCommand)(lines, null, selection, (accessor, sel) => new moveCaretCommand_1.MoveCaretCommand(sel, false), expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Move Caret Command', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('move selection to left', function () {
            testMoveCaretLeftCommand([
                '012345'
            ], new selection_1.Selection(1, 3, 1, 5), [
                '023145'
            ], new selection_1.Selection(1, 2, 1, 4));
        });
        test('move selection to right', function () {
            testMoveCaretRightCommand([
                '012345'
            ], new selection_1.Selection(1, 3, 1, 5), [
                '014235'
            ], new selection_1.Selection(1, 4, 1, 6));
        });
        test('move selection to left - from first column - no change', function () {
            testMoveCaretLeftCommand([
                '012345'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '012345'
            ], new selection_1.Selection(1, 1, 1, 1));
        });
        test('move selection to right - from last column - no change', function () {
            testMoveCaretRightCommand([
                '012345'
            ], new selection_1.Selection(1, 5, 1, 7), [
                '012345'
            ], new selection_1.Selection(1, 5, 1, 7));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZUNhcnJldENvbW1hbmQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NhcmV0T3BlcmF0aW9ucy90ZXN0L2Jyb3dzZXIvbW92ZUNhcnJldENvbW1hbmQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVFoRyxTQUFTLHdCQUF3QixDQUFDLEtBQWUsRUFBRSxTQUFvQixFQUFFLGFBQXVCLEVBQUUsaUJBQTRCO1FBQzdILElBQUEseUJBQVcsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksbUNBQWdCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQzNILENBQUM7SUFFRCxTQUFTLHlCQUF5QixDQUFDLEtBQWUsRUFBRSxTQUFvQixFQUFFLGFBQXVCLEVBQUUsaUJBQTRCO1FBQzlILElBQUEseUJBQVcsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksbUNBQWdCLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQzVILENBQUM7SUFFRCxLQUFLLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO1FBRWpELElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsd0JBQXdCLEVBQUU7WUFDOUIsd0JBQXdCLENBQ3ZCO2dCQUNDLFFBQVE7YUFDUixFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsUUFBUTthQUNSLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMseUJBQXlCLEVBQUU7WUFDL0IseUJBQXlCLENBQ3hCO2dCQUNDLFFBQVE7YUFDUixFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsUUFBUTthQUNSLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsd0RBQXdELEVBQUU7WUFDOUQsd0JBQXdCLENBQ3ZCO2dCQUNDLFFBQVE7YUFDUixFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsUUFBUTthQUNSLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsd0RBQXdELEVBQUU7WUFDOUQseUJBQXlCLENBQ3hCO2dCQUNDLFFBQVE7YUFDUixFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsUUFBUTthQUNSLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9