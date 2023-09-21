/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/contrib/linesOperations/browser/sortLinesCommand", "vs/editor/test/browser/testCommand"], function (require, exports, utils_1, selection_1, sortLinesCommand_1, testCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testSortLinesAscendingCommand(lines, selection, expectedLines, expectedSelection) {
        (0, testCommand_1.$30b)(lines, null, selection, (accessor, sel) => new sortLinesCommand_1.$z9(sel, false), expectedLines, expectedSelection);
    }
    function testSortLinesDescendingCommand(lines, selection, expectedLines, expectedSelection) {
        (0, testCommand_1.$30b)(lines, null, selection, (accessor, sel) => new sortLinesCommand_1.$z9(sel, true), expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Sort Lines Command', () => {
        (0, utils_1.$bT)();
        test('no op unless at least two lines selected 1', function () {
            testSortLinesAscendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 1, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 1, 1));
        });
        test('no op unless at least two lines selected 2', function () {
            testSortLinesAscendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 2, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 2, 1));
        });
        test('sorting two lines ascending', function () {
            testSortLinesAscendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(3, 3, 4, 2), [
                'first',
                'second line',
                'fourth line',
                'third line',
                'fifth'
            ], new selection_1.$ms(3, 3, 4, 1));
        });
        test('sorting first 4 lines ascending', function () {
            testSortLinesAscendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 5, 1), [
                'first',
                'fourth line',
                'second line',
                'third line',
                'fifth'
            ], new selection_1.$ms(1, 1, 5, 1));
        });
        test('sorting all lines ascending', function () {
            testSortLinesAscendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 5, 6), [
                'fifth',
                'first',
                'fourth line',
                'second line',
                'third line',
            ], new selection_1.$ms(1, 1, 5, 11));
        });
        test('sorting first 4 lines descending', function () {
            testSortLinesDescendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 5, 1), [
                'third line',
                'second line',
                'fourth line',
                'first',
                'fifth'
            ], new selection_1.$ms(1, 1, 5, 1));
        });
        test('sorting all lines descending', function () {
            testSortLinesDescendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 5, 6), [
                'third line',
                'second line',
                'fourth line',
                'first',
                'fifth',
            ], new selection_1.$ms(1, 1, 5, 6));
        });
    });
});
//# sourceMappingURL=sortLinesCommand.test.js.map