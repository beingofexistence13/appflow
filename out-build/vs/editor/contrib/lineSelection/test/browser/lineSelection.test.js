/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/contrib/lineSelection/browser/lineSelection", "vs/editor/test/browser/testCodeEditor"], function (require, exports, assert, utils_1, position_1, selection_1, lineSelection_1, testCodeEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function executeAction(action, editor) {
        action.run(null, editor, undefined);
    }
    suite('LineSelection', () => {
        (0, utils_1.$bT)();
        test('', () => {
            const LINE1 = '    \tMy First Line\t ';
            const LINE2 = '\tMy Second Line';
            const LINE3 = '    Third Line🐶';
            const LINE4 = '';
            const LINE5 = '1';
            const TEXT = LINE1 + '\r\n' +
                LINE2 + '\n' +
                LINE3 + '\n' +
                LINE4 + '\r\n' +
                LINE5;
            (0, testCodeEditor_1.$X0b)(TEXT, {}, (editor, viewModel) => {
                const action = new lineSelection_1.$u9();
                //              0          1         2
                //              01234 56789012345678 0
                // let LINE1 = '    \tMy First Line\t ';
                editor.setPosition(new position_1.$js(1, 1));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 2, 1));
                editor.setPosition(new position_1.$js(1, 2));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 2, 1));
                editor.setPosition(new position_1.$js(1, 5));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 2, 1));
                editor.setPosition(new position_1.$js(1, 19));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 2, 1));
                editor.setPosition(new position_1.$js(1, 20));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 2, 1));
                editor.setPosition(new position_1.$js(1, 21));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 2, 1));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 3, 1));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 4, 1));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 5, 1));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 5, LINE5.length + 1));
                executeAction(action, editor);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 5, LINE5.length + 1));
            });
        });
    });
});
//# sourceMappingURL=lineSelection.test.js.map