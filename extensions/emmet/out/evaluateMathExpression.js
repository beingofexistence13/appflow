"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateMathExpression = void 0;
/* Based on @sergeche's work in his emmet plugin */
const vscode = require("vscode");
const math_expression_1 = require("@emmetio/math-expression");
function evaluateMathExpression() {
    if (!vscode.window.activeTextEditor) {
        vscode.window.showInformationMessage('No editor is active');
        return Promise.resolve(false);
    }
    const editor = vscode.window.activeTextEditor;
    return editor.edit(editBuilder => {
        editor.selections.forEach(selection => {
            // startpos always comes before endpos
            const startpos = selection.isReversed ? selection.active : selection.anchor;
            const endpos = selection.isReversed ? selection.anchor : selection.active;
            const selectionText = editor.document.getText(new vscode.Range(startpos, endpos));
            try {
                if (selectionText) {
                    // respect selections
                    const result = String((0, math_expression_1.default)(selectionText));
                    editBuilder.replace(new vscode.Range(startpos, endpos), result);
                }
                else {
                    // no selection made, extract expression from line
                    const lineToSelectionEnd = editor.document.getText(new vscode.Range(new vscode.Position(selection.end.line, 0), endpos));
                    const extractedIndices = (0, math_expression_1.extract)(lineToSelectionEnd);
                    if (!extractedIndices) {
                        throw new Error('Invalid extracted indices');
                    }
                    const result = String((0, math_expression_1.default)(lineToSelectionEnd.substr(extractedIndices[0], extractedIndices[1])));
                    const rangeToReplace = new vscode.Range(new vscode.Position(selection.end.line, extractedIndices[0]), new vscode.Position(selection.end.line, extractedIndices[1]));
                    editBuilder.replace(rangeToReplace, result);
                }
            }
            catch (err) {
                vscode.window.showErrorMessage('Could not evaluate expression');
                // Ignore error since most likely it's because of non-math expression
                console.warn('Math evaluation error', err);
            }
        });
    });
}
exports.evaluateMathExpression = evaluateMathExpression;
//# sourceMappingURL=evaluateMathExpression.js.map