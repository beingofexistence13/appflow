"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const assert = require("assert");
const vscode_1 = require("vscode");
const testUtils_1 = require("./testUtils");
const evaluateMathExpression_1 = require("../evaluateMathExpression");
suite('Tests for Evaluate Math Expression', () => {
    teardown(testUtils_1.closeAllEditors);
    function testEvaluateMathExpression(fileContents, selection, expectedFileContents) {
        return (0, testUtils_1.withRandomFileEditor)(fileContents, 'html', async (editor, _doc) => {
            const selectionToUse = typeof selection === 'number' ?
                new vscode_1.Selection(new vscode_1.Position(0, selection), new vscode_1.Position(0, selection)) :
                new vscode_1.Selection(new vscode_1.Position(0, selection[0]), new vscode_1.Position(0, selection[1]));
            editor.selection = selectionToUse;
            await (0, evaluateMathExpression_1.evaluateMathExpression)();
            assert.strictEqual(editor.document.getText(), expectedFileContents);
            return Promise.resolve();
        });
    }
    test('Selected sanity check', () => {
        return testEvaluateMathExpression('1 + 2', [0, 5], '3');
    });
    test('Selected with surrounding text', () => {
        return testEvaluateMathExpression('test1 + 2test', [4, 9], 'test3test');
    });
    test('Selected with number not part of selection', () => {
        return testEvaluateMathExpression('test3 1+2', [6, 9], 'test3 3');
    });
    test('Non-selected sanity check', () => {
        return testEvaluateMathExpression('1 + 2', 5, '3');
    });
    test('Non-selected midway', () => {
        return testEvaluateMathExpression('1 + 2', 1, '1 + 2');
    });
    test('Non-selected with surrounding text', () => {
        return testEvaluateMathExpression('test1 + 3test', 9, 'test4test');
    });
});
//# sourceMappingURL=evaluateMathExpression.test.js.map