/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/test/browser/testCommand", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, trimTrailingWhitespaceCommand_1, position_1, range_1, selection_1, testCommand_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Create single edit operation
     */
    function createInsertDeleteSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
        return {
            range: new range_1.$ks(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
            text: text
        };
    }
    /**
     * Create single edit operation
     */
    function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
        return {
            range: new range_1.$ks(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
            text: text,
            forceMoveMarkers: false
        };
    }
    function assertTrimTrailingWhitespaceCommand(text, expected) {
        return (0, testTextModel_1.$N0b)(text, (model) => {
            const op = new trimTrailingWhitespaceCommand_1.$v9(new selection_1.$ms(1, 1, 1, 1), []);
            const actual = (0, testCommand_1.$40b)(model, op);
            assert.deepStrictEqual(actual, expected);
        });
    }
    function assertTrimTrailingWhitespace(text, cursors, expected) {
        return (0, testTextModel_1.$N0b)(text, (model) => {
            const actual = (0, trimTrailingWhitespaceCommand_1.$w9)(model, cursors);
            assert.deepStrictEqual(actual, expected);
        });
    }
    suite('Editor Commands - Trim Trailing Whitespace Command', () => {
        (0, utils_1.$bT)();
        test('remove trailing whitespace', function () {
            assertTrimTrailingWhitespaceCommand([''], []);
            assertTrimTrailingWhitespaceCommand(['text'], []);
            assertTrimTrailingWhitespaceCommand(['text   '], [createSingleEditOp(null, 1, 5, 1, 8)]);
            assertTrimTrailingWhitespaceCommand(['text\t   '], [createSingleEditOp(null, 1, 5, 1, 9)]);
            assertTrimTrailingWhitespaceCommand(['\t   '], [createSingleEditOp(null, 1, 1, 1, 5)]);
            assertTrimTrailingWhitespaceCommand(['text\t'], [createSingleEditOp(null, 1, 5, 1, 6)]);
            assertTrimTrailingWhitespaceCommand([
                'some text\t',
                'some more text',
                '\t  ',
                'even more text  ',
                'and some mixed\t   \t'
            ], [
                createSingleEditOp(null, 1, 10, 1, 11),
                createSingleEditOp(null, 3, 1, 3, 4),
                createSingleEditOp(null, 4, 15, 4, 17),
                createSingleEditOp(null, 5, 15, 5, 20)
            ]);
            assertTrimTrailingWhitespace(['text   '], [new position_1.$js(1, 1), new position_1.$js(1, 2), new position_1.$js(1, 3)], [createInsertDeleteSingleEditOp(null, 1, 5, 1, 8)]);
            assertTrimTrailingWhitespace(['text   '], [new position_1.$js(1, 1), new position_1.$js(1, 5)], [createInsertDeleteSingleEditOp(null, 1, 5, 1, 8)]);
            assertTrimTrailingWhitespace(['text   '], [new position_1.$js(1, 1), new position_1.$js(1, 5), new position_1.$js(1, 6)], [createInsertDeleteSingleEditOp(null, 1, 6, 1, 8)]);
            assertTrimTrailingWhitespace([
                'some text\t',
                'some more text',
                '\t  ',
                'even more text  ',
                'and some mixed\t   \t'
            ], [], [
                createInsertDeleteSingleEditOp(null, 1, 10, 1, 11),
                createInsertDeleteSingleEditOp(null, 3, 1, 3, 4),
                createInsertDeleteSingleEditOp(null, 4, 15, 4, 17),
                createInsertDeleteSingleEditOp(null, 5, 15, 5, 20)
            ]);
            assertTrimTrailingWhitespace([
                'some text\t',
                'some more text',
                '\t  ',
                'even more text  ',
                'and some mixed\t   \t'
            ], [new position_1.$js(1, 11), new position_1.$js(3, 2), new position_1.$js(5, 1), new position_1.$js(4, 1), new position_1.$js(5, 10)], [
                createInsertDeleteSingleEditOp(null, 3, 2, 3, 4),
                createInsertDeleteSingleEditOp(null, 4, 15, 4, 17),
                createInsertDeleteSingleEditOp(null, 5, 15, 5, 20)
            ]);
        });
    });
});
//# sourceMappingURL=trimTrailingWhitespaceCommand.test.js.map