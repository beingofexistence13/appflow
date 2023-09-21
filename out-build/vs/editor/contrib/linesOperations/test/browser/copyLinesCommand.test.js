/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/contrib/linesOperations/browser/copyLinesCommand", "vs/editor/contrib/linesOperations/browser/linesOperations", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/browser/testCommand"], function (require, exports, assert, utils_1, selection_1, copyLinesCommand_1, linesOperations_1, testCodeEditor_1, testCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testCopyLinesDownCommand(lines, selection, expectedLines, expectedSelection) {
        (0, testCommand_1.$30b)(lines, null, selection, (accessor, sel) => new copyLinesCommand_1.$x9(sel, true), expectedLines, expectedSelection);
    }
    function testCopyLinesUpCommand(lines, selection, expectedLines, expectedSelection) {
        (0, testCommand_1.$30b)(lines, null, selection, (accessor, sel) => new copyLinesCommand_1.$x9(sel, false), expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Copy Lines Command', () => {
        (0, utils_1.$bT)();
        test('copy first line down', function () {
            testCopyLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 1, 1), [
                'first',
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 3, 2, 1));
        });
        test('copy first line up', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 1, 1), [
                'first',
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 1, 1));
        });
        test('copy last line down', function () {
            testCopyLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(5, 3, 5, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth',
                'fifth'
            ], new selection_1.$ms(6, 3, 6, 1));
        });
        test('copy last line up', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(5, 3, 5, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth',
                'fifth'
            ], new selection_1.$ms(5, 3, 5, 1));
        });
        test('issue #1322: copy line up', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(3, 11, 3, 11), [
                'first',
                'second line',
                'third line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(3, 11, 3, 11));
        });
        test('issue #1322: copy last line up', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(5, 6, 5, 6), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth',
                'fifth'
            ], new selection_1.$ms(5, 6, 5, 6));
        });
        test('copy many lines up', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(4, 3, 2, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(4, 3, 2, 1));
        });
        test('ignore empty selection', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 1, 1, 1), [
                'first',
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 1, 1, 1));
        });
    });
    suite('Editor Contrib - Duplicate Selection', () => {
        (0, utils_1.$bT)();
        const duplicateSelectionAction = new linesOperations_1.$A9();
        function testDuplicateSelectionAction(lines, selections, expectedLines, expectedSelections) {
            (0, testCodeEditor_1.$X0b)(lines.join('\n'), {}, (editor) => {
                editor.setSelections(selections);
                duplicateSelectionAction.run(null, editor, {});
                assert.deepStrictEqual(editor.getValue(), expectedLines.join('\n'));
                assert.deepStrictEqual(editor.getSelections().map(s => s.toString()), expectedSelections.map(s => s.toString()));
            });
        }
        test('empty selection', function () {
            testDuplicateSelectionAction([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], [new selection_1.$ms(2, 2, 2, 2), new selection_1.$ms(3, 2, 3, 2)], [
                'first',
                'second line',
                'second line',
                'third line',
                'third line',
                'fourth line',
                'fifth'
            ], [new selection_1.$ms(3, 2, 3, 2), new selection_1.$ms(5, 2, 5, 2)]);
        });
        test('with selection', function () {
            testDuplicateSelectionAction([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], [new selection_1.$ms(2, 1, 2, 4), new selection_1.$ms(3, 1, 3, 4)], [
                'first',
                'secsecond line',
                'thithird line',
                'fourth line',
                'fifth'
            ], [new selection_1.$ms(2, 4, 2, 7), new selection_1.$ms(3, 4, 3, 7)]);
        });
    });
});
//# sourceMappingURL=copyLinesCommand.test.js.map