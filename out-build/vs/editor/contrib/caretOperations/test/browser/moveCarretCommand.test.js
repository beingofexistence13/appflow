/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/contrib/caretOperations/browser/moveCaretCommand", "vs/editor/test/browser/testCommand"], function (require, exports, utils_1, selection_1, moveCaretCommand_1, testCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testMoveCaretLeftCommand(lines, selection, expectedLines, expectedSelection) {
        (0, testCommand_1.$30b)(lines, null, selection, (accessor, sel) => new moveCaretCommand_1.$g1(sel, true), expectedLines, expectedSelection);
    }
    function testMoveCaretRightCommand(lines, selection, expectedLines, expectedSelection) {
        (0, testCommand_1.$30b)(lines, null, selection, (accessor, sel) => new moveCaretCommand_1.$g1(sel, false), expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Move Caret Command', () => {
        (0, utils_1.$bT)();
        test('move selection to left', function () {
            testMoveCaretLeftCommand([
                '012345'
            ], new selection_1.$ms(1, 3, 1, 5), [
                '023145'
            ], new selection_1.$ms(1, 2, 1, 4));
        });
        test('move selection to right', function () {
            testMoveCaretRightCommand([
                '012345'
            ], new selection_1.$ms(1, 3, 1, 5), [
                '014235'
            ], new selection_1.$ms(1, 4, 1, 6));
        });
        test('move selection to left - from first column - no change', function () {
            testMoveCaretLeftCommand([
                '012345'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '012345'
            ], new selection_1.$ms(1, 1, 1, 1));
        });
        test('move selection to right - from last column - no change', function () {
            testMoveCaretRightCommand([
                '012345'
            ], new selection_1.$ms(1, 5, 1, 7), [
                '012345'
            ], new selection_1.$ms(1, 5, 1, 7));
        });
    });
});
//# sourceMappingURL=moveCarretCommand.test.js.map