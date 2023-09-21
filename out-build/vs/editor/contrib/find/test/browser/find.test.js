/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/find/browser/findController", "vs/editor/test/browser/testCodeEditor"], function (require, exports, assert, utils_1, position_1, range_1, findController_1, testCodeEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Find', () => {
        (0, utils_1.$bT)();
        test('search string at position', () => {
            (0, testCodeEditor_1.$X0b)([
                'ABC DEF',
                '0123 456'
            ], {}, (editor) => {
                // The cursor is at the very top, of the file, at the first ABC
                const searchStringAtTop = (0, findController_1.$V7)(editor);
                assert.strictEqual(searchStringAtTop, 'ABC');
                // Move cursor to the end of ABC
                editor.setPosition(new position_1.$js(1, 3));
                const searchStringAfterABC = (0, findController_1.$V7)(editor);
                assert.strictEqual(searchStringAfterABC, 'ABC');
                // Move cursor to DEF
                editor.setPosition(new position_1.$js(1, 5));
                const searchStringInsideDEF = (0, findController_1.$V7)(editor);
                assert.strictEqual(searchStringInsideDEF, 'DEF');
            });
        });
        test('search string with selection', () => {
            (0, testCodeEditor_1.$X0b)([
                'ABC DEF',
                '0123 456'
            ], {}, (editor) => {
                // Select A of ABC
                editor.setSelection(new range_1.$ks(1, 1, 1, 2));
                const searchStringSelectionA = (0, findController_1.$V7)(editor);
                assert.strictEqual(searchStringSelectionA, 'A');
                // Select BC of ABC
                editor.setSelection(new range_1.$ks(1, 2, 1, 4));
                const searchStringSelectionBC = (0, findController_1.$V7)(editor);
                assert.strictEqual(searchStringSelectionBC, 'BC');
                // Select BC DE
                editor.setSelection(new range_1.$ks(1, 2, 1, 7));
                const searchStringSelectionBCDE = (0, findController_1.$V7)(editor);
                assert.strictEqual(searchStringSelectionBCDE, 'BC DE');
            });
        });
        test('search string with multiline selection', () => {
            (0, testCodeEditor_1.$X0b)([
                'ABC DEF',
                '0123 456'
            ], {}, (editor) => {
                // Select first line and newline
                editor.setSelection(new range_1.$ks(1, 1, 2, 1));
                const searchStringSelectionWholeLine = (0, findController_1.$V7)(editor);
                assert.strictEqual(searchStringSelectionWholeLine, null);
                // Select first line and chunk of second
                editor.setSelection(new range_1.$ks(1, 1, 2, 4));
                const searchStringSelectionTwoLines = (0, findController_1.$V7)(editor);
                assert.strictEqual(searchStringSelectionTwoLines, null);
                // Select end of first line newline and chunk of second
                editor.setSelection(new range_1.$ks(1, 7, 2, 4));
                const searchStringSelectionSpanLines = (0, findController_1.$V7)(editor);
                assert.strictEqual(searchStringSelectionSpanLines, null);
            });
        });
    });
});
//# sourceMappingURL=find.test.js.map