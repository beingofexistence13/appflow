/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/cursor/cursorMoveCommands", "vs/editor/test/browser/testCodeEditor"], function (require, exports, assert, utils_1, coreCommands_1, position_1, range_1, cursorMoveCommands_1, testCodeEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Cursor move command test', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const TEXT = [
            '    \tMy First Line\t ',
            '\tMy Second Line',
            '    Third Line🐶',
            '',
            '1'
        ].join('\n');
        function executeTest(callback) {
            (0, testCodeEditor_1.withTestCodeEditor)(TEXT, {}, (editor, viewModel) => {
                callback(editor, viewModel);
            });
        }
        test('move left should move to left character', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 8);
                moveLeft(viewModel);
                cursorEqual(viewModel, 1, 7);
            });
        });
        test('move left should move to left by n characters', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 8);
                moveLeft(viewModel, 3);
                cursorEqual(viewModel, 1, 5);
            });
        });
        test('move left should move to left by half line', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 8);
                moveLeft(viewModel, 1, cursorMoveCommands_1.CursorMove.RawUnit.HalfLine);
                cursorEqual(viewModel, 1, 1);
            });
        });
        test('move left moves to previous line', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 2, 3);
                moveLeft(viewModel, 10);
                cursorEqual(viewModel, 1, 21);
            });
        });
        test('move right should move to right character', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 5);
                moveRight(viewModel);
                cursorEqual(viewModel, 1, 6);
            });
        });
        test('move right should move to right by n characters', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 2);
                moveRight(viewModel, 6);
                cursorEqual(viewModel, 1, 8);
            });
        });
        test('move right should move to right by half line', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 4);
                moveRight(viewModel, 1, cursorMoveCommands_1.CursorMove.RawUnit.HalfLine);
                cursorEqual(viewModel, 1, 14);
            });
        });
        test('move right moves to next line', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 8);
                moveRight(viewModel, 100);
                cursorEqual(viewModel, 2, 1);
            });
        });
        test('move to first character of line from middle', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 8);
                moveToLineStart(viewModel);
                cursorEqual(viewModel, 1, 1);
            });
        });
        test('move to first character of line from first non white space character', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 6);
                moveToLineStart(viewModel);
                cursorEqual(viewModel, 1, 1);
            });
        });
        test('move to first character of line from first character', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 1);
                moveToLineStart(viewModel);
                cursorEqual(viewModel, 1, 1);
            });
        });
        test('move to first non white space character of line from middle', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 8);
                moveToLineFirstNonWhitespaceCharacter(viewModel);
                cursorEqual(viewModel, 1, 6);
            });
        });
        test('move to first non white space character of line from first non white space character', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 6);
                moveToLineFirstNonWhitespaceCharacter(viewModel);
                cursorEqual(viewModel, 1, 6);
            });
        });
        test('move to first non white space character of line from first character', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 1);
                moveToLineFirstNonWhitespaceCharacter(viewModel);
                cursorEqual(viewModel, 1, 6);
            });
        });
        test('move to end of line from middle', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 8);
                moveToLineEnd(viewModel);
                cursorEqual(viewModel, 1, 21);
            });
        });
        test('move to end of line from last non white space character', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 19);
                moveToLineEnd(viewModel);
                cursorEqual(viewModel, 1, 21);
            });
        });
        test('move to end of line from line end', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 21);
                moveToLineEnd(viewModel);
                cursorEqual(viewModel, 1, 21);
            });
        });
        test('move to last non white space character from middle', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 8);
                moveToLineLastNonWhitespaceCharacter(viewModel);
                cursorEqual(viewModel, 1, 19);
            });
        });
        test('move to last non white space character from last non white space character', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 19);
                moveToLineLastNonWhitespaceCharacter(viewModel);
                cursorEqual(viewModel, 1, 19);
            });
        });
        test('move to last non white space character from line end', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 21);
                moveToLineLastNonWhitespaceCharacter(viewModel);
                cursorEqual(viewModel, 1, 19);
            });
        });
        test('move to center of line not from center', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 8);
                moveToLineCenter(viewModel);
                cursorEqual(viewModel, 1, 11);
            });
        });
        test('move to center of line from center', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 11);
                moveToLineCenter(viewModel);
                cursorEqual(viewModel, 1, 11);
            });
        });
        test('move to center of line from start', () => {
            executeTest((editor, viewModel) => {
                moveToLineStart(viewModel);
                moveToLineCenter(viewModel);
                cursorEqual(viewModel, 1, 11);
            });
        });
        test('move to center of line from end', () => {
            executeTest((editor, viewModel) => {
                moveToLineEnd(viewModel);
                moveToLineCenter(viewModel);
                cursorEqual(viewModel, 1, 11);
            });
        });
        test('move up by cursor move command', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 3, 5);
                cursorEqual(viewModel, 3, 5);
                moveUp(viewModel, 2);
                cursorEqual(viewModel, 1, 5);
                moveUp(viewModel, 1);
                cursorEqual(viewModel, 1, 1);
            });
        });
        test('move up by model line cursor move command', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 3, 5);
                cursorEqual(viewModel, 3, 5);
                moveUpByModelLine(viewModel, 2);
                cursorEqual(viewModel, 1, 5);
                moveUpByModelLine(viewModel, 1);
                cursorEqual(viewModel, 1, 1);
            });
        });
        test('move down by model line cursor move command', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 3, 5);
                cursorEqual(viewModel, 3, 5);
                moveDownByModelLine(viewModel, 2);
                cursorEqual(viewModel, 5, 2);
                moveDownByModelLine(viewModel, 1);
                cursorEqual(viewModel, 5, 2);
            });
        });
        test('move up with selection by cursor move command', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 3, 5);
                cursorEqual(viewModel, 3, 5);
                moveUp(viewModel, 1, true);
                cursorEqual(viewModel, 2, 2, 3, 5);
                moveUp(viewModel, 1, true);
                cursorEqual(viewModel, 1, 5, 3, 5);
            });
        });
        test('move up and down with tabs by cursor move command', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 1, 5);
                cursorEqual(viewModel, 1, 5);
                moveDown(viewModel, 4);
                cursorEqual(viewModel, 5, 2);
                moveUp(viewModel, 1);
                cursorEqual(viewModel, 4, 1);
                moveUp(viewModel, 1);
                cursorEqual(viewModel, 3, 5);
                moveUp(viewModel, 1);
                cursorEqual(viewModel, 2, 2);
                moveUp(viewModel, 1);
                cursorEqual(viewModel, 1, 5);
            });
        });
        test('move up and down with end of lines starting from a long one by cursor move command', () => {
            executeTest((editor, viewModel) => {
                moveToEndOfLine(viewModel);
                cursorEqual(viewModel, 1, 21);
                moveToEndOfLine(viewModel);
                cursorEqual(viewModel, 1, 21);
                moveDown(viewModel, 2);
                cursorEqual(viewModel, 3, 17);
                moveDown(viewModel, 1);
                cursorEqual(viewModel, 4, 1);
                moveDown(viewModel, 1);
                cursorEqual(viewModel, 5, 2);
                moveUp(viewModel, 4);
                cursorEqual(viewModel, 1, 21);
            });
        });
        test('move to view top line moves to first visible line if it is first line', () => {
            executeTest((editor, viewModel) => {
                viewModel.getCompletelyVisibleViewRange = () => new range_1.Range(1, 1, 10, 1);
                moveTo(viewModel, 2, 2);
                moveToTop(viewModel);
                cursorEqual(viewModel, 1, 6);
            });
        });
        test('move to view top line moves to top visible line when first line is not visible', () => {
            executeTest((editor, viewModel) => {
                viewModel.getCompletelyVisibleViewRange = () => new range_1.Range(2, 1, 10, 1);
                moveTo(viewModel, 4, 1);
                moveToTop(viewModel);
                cursorEqual(viewModel, 2, 2);
            });
        });
        test('move to view top line moves to nth line from top', () => {
            executeTest((editor, viewModel) => {
                viewModel.getCompletelyVisibleViewRange = () => new range_1.Range(1, 1, 10, 1);
                moveTo(viewModel, 4, 1);
                moveToTop(viewModel, 3);
                cursorEqual(viewModel, 3, 5);
            });
        });
        test('move to view top line moves to last line if n is greater than last visible line number', () => {
            executeTest((editor, viewModel) => {
                viewModel.getCompletelyVisibleViewRange = () => new range_1.Range(1, 1, 3, 1);
                moveTo(viewModel, 2, 2);
                moveToTop(viewModel, 4);
                cursorEqual(viewModel, 3, 5);
            });
        });
        test('move to view center line moves to the center line', () => {
            executeTest((editor, viewModel) => {
                viewModel.getCompletelyVisibleViewRange = () => new range_1.Range(3, 1, 3, 1);
                moveTo(viewModel, 2, 2);
                moveToCenter(viewModel);
                cursorEqual(viewModel, 3, 5);
            });
        });
        test('move to view bottom line moves to last visible line if it is last line', () => {
            executeTest((editor, viewModel) => {
                viewModel.getCompletelyVisibleViewRange = () => new range_1.Range(1, 1, 5, 1);
                moveTo(viewModel, 2, 2);
                moveToBottom(viewModel);
                cursorEqual(viewModel, 5, 1);
            });
        });
        test('move to view bottom line moves to last visible line when last line is not visible', () => {
            executeTest((editor, viewModel) => {
                viewModel.getCompletelyVisibleViewRange = () => new range_1.Range(2, 1, 3, 1);
                moveTo(viewModel, 2, 2);
                moveToBottom(viewModel);
                cursorEqual(viewModel, 3, 5);
            });
        });
        test('move to view bottom line moves to nth line from bottom', () => {
            executeTest((editor, viewModel) => {
                viewModel.getCompletelyVisibleViewRange = () => new range_1.Range(1, 1, 5, 1);
                moveTo(viewModel, 4, 1);
                moveToBottom(viewModel, 3);
                cursorEqual(viewModel, 3, 5);
            });
        });
        test('move to view bottom line moves to first line if n is lesser than first visible line number', () => {
            executeTest((editor, viewModel) => {
                viewModel.getCompletelyVisibleViewRange = () => new range_1.Range(2, 1, 5, 1);
                moveTo(viewModel, 4, 1);
                moveToBottom(viewModel, 5);
                cursorEqual(viewModel, 2, 2);
            });
        });
    });
    suite('Cursor move by blankline test', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const TEXT = [
            '    \tMy First Line\t ',
            '\tMy Second Line',
            '    Third Line🐶',
            '',
            '1',
            '2',
            '3',
            '',
            '         ',
            'a',
            'b',
        ].join('\n');
        function executeTest(callback) {
            (0, testCodeEditor_1.withTestCodeEditor)(TEXT, {}, (editor, viewModel) => {
                callback(editor, viewModel);
            });
        }
        test('move down should move to start of next blank line', () => {
            executeTest((editor, viewModel) => {
                moveDownByBlankLine(viewModel, false);
                cursorEqual(viewModel, 4, 1);
            });
        });
        test('move up should move to start of previous blank line', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 7, 1);
                moveUpByBlankLine(viewModel, false);
                cursorEqual(viewModel, 4, 1);
            });
        });
        test('move down should skip over whitespace if already on blank line', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 8, 1);
                moveDownByBlankLine(viewModel, false);
                cursorEqual(viewModel, 11, 1);
            });
        });
        test('move up should skip over whitespace if already on blank line', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 9, 1);
                moveUpByBlankLine(viewModel, false);
                cursorEqual(viewModel, 4, 1);
            });
        });
        test('move up should go to first column of first line if not empty', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 2, 1);
                moveUpByBlankLine(viewModel, false);
                cursorEqual(viewModel, 1, 1);
            });
        });
        test('move down should go to first column of last line if not empty', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 10, 1);
                moveDownByBlankLine(viewModel, false);
                cursorEqual(viewModel, 11, 1);
            });
        });
        test('select down should select to start of next blank line', () => {
            executeTest((editor, viewModel) => {
                moveDownByBlankLine(viewModel, true);
                selectionEqual(viewModel.getSelection(), 4, 1, 1, 1);
            });
        });
        test('select up should select to start of previous blank line', () => {
            executeTest((editor, viewModel) => {
                moveTo(viewModel, 7, 1);
                moveUpByBlankLine(viewModel, true);
                selectionEqual(viewModel.getSelection(), 4, 1, 7, 1);
            });
        });
    });
    // Move command
    function move(viewModel, args) {
        coreCommands_1.CoreNavigationCommands.CursorMove.runCoreEditorCommand(viewModel, args);
    }
    function moveToLineStart(viewModel) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.WrappedLineStart });
    }
    function moveToLineFirstNonWhitespaceCharacter(viewModel) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.WrappedLineFirstNonWhitespaceCharacter });
    }
    function moveToLineCenter(viewModel) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.WrappedLineColumnCenter });
    }
    function moveToLineEnd(viewModel) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.WrappedLineEnd });
    }
    function moveToLineLastNonWhitespaceCharacter(viewModel) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.WrappedLineLastNonWhitespaceCharacter });
    }
    function moveLeft(viewModel, value, by, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.Left, by: by, value: value, select: select });
    }
    function moveRight(viewModel, value, by, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.Right, by: by, value: value, select: select });
    }
    function moveUp(viewModel, noOfLines = 1, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.Up, by: cursorMoveCommands_1.CursorMove.RawUnit.WrappedLine, value: noOfLines, select: select });
    }
    function moveUpByBlankLine(viewModel, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.PrevBlankLine, by: cursorMoveCommands_1.CursorMove.RawUnit.WrappedLine, select: select });
    }
    function moveUpByModelLine(viewModel, noOfLines = 1, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.Up, value: noOfLines, select: select });
    }
    function moveDown(viewModel, noOfLines = 1, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.Down, by: cursorMoveCommands_1.CursorMove.RawUnit.WrappedLine, value: noOfLines, select: select });
    }
    function moveDownByBlankLine(viewModel, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.NextBlankLine, by: cursorMoveCommands_1.CursorMove.RawUnit.WrappedLine, select: select });
    }
    function moveDownByModelLine(viewModel, noOfLines = 1, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.Down, value: noOfLines, select: select });
    }
    function moveToTop(viewModel, noOfLines = 1, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.ViewPortTop, value: noOfLines, select: select });
    }
    function moveToCenter(viewModel, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.ViewPortCenter, select: select });
    }
    function moveToBottom(viewModel, noOfLines = 1, select) {
        move(viewModel, { to: cursorMoveCommands_1.CursorMove.RawDirection.ViewPortBottom, value: noOfLines, select: select });
    }
    function cursorEqual(viewModel, posLineNumber, posColumn, selLineNumber = posLineNumber, selColumn = posColumn) {
        positionEqual(viewModel.getPosition(), posLineNumber, posColumn);
        selectionEqual(viewModel.getSelection(), posLineNumber, posColumn, selLineNumber, selColumn);
    }
    function positionEqual(position, lineNumber, column) {
        assert.deepStrictEqual(position, new position_1.Position(lineNumber, column), 'position equal');
    }
    function selectionEqual(selection, posLineNumber, posColumn, selLineNumber, selColumn) {
        assert.deepStrictEqual({
            selectionStartLineNumber: selection.selectionStartLineNumber,
            selectionStartColumn: selection.selectionStartColumn,
            positionLineNumber: selection.positionLineNumber,
            positionColumn: selection.positionColumn
        }, {
            selectionStartLineNumber: selLineNumber,
            selectionStartColumn: selColumn,
            positionLineNumber: posLineNumber,
            positionColumn: posColumn
        }, 'selection equal');
    }
    function moveTo(viewModel, lineNumber, column, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.MoveToSelect.runCoreEditorCommand(viewModel, {
                position: new position_1.Position(lineNumber, column)
            });
        }
        else {
            coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, {
                position: new position_1.Position(lineNumber, column)
            });
        }
    }
    function moveToEndOfLine(viewModel, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorEndSelect.runCoreEditorCommand(viewModel, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorEnd.runCoreEditorCommand(viewModel, {});
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yTW92ZUNvbW1hbmQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2Jyb3dzZXIvY29udHJvbGxlci9jdXJzb3JNb3ZlQ29tbWFuZC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBWWhHLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7UUFFdEMsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLE1BQU0sSUFBSSxHQUFHO1lBQ1osd0JBQXdCO1lBQ3hCLGtCQUFrQjtZQUNsQixrQkFBa0I7WUFDbEIsRUFBRTtZQUNGLEdBQUc7U0FDSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUViLFNBQVMsV0FBVyxDQUFDLFFBQWlFO1lBQ3JGLElBQUEsbUNBQWtCLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRTtnQkFDbEQsUUFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFJLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1lBQ3BELFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRTtnQkFDakMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDcEIsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7WUFDMUQsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxF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