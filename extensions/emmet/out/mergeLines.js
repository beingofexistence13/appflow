"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeLines = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
const parseDocument_1 = require("./parseDocument");
function mergeLines() {
    if (!(0, util_1.validate)(false) || !vscode.window.activeTextEditor) {
        return;
    }
    const editor = vscode.window.activeTextEditor;
    const rootNode = (0, parseDocument_1.getRootNode)(editor.document, true);
    if (!rootNode) {
        return;
    }
    return editor.edit(editBuilder => {
        Array.from(editor.selections).reverse().forEach(selection => {
            const textEdit = getRangesToReplace(editor.document, selection, rootNode);
            if (textEdit) {
                editBuilder.replace(textEdit.range, textEdit.newText);
            }
        });
    });
}
exports.mergeLines = mergeLines;
function getRangesToReplace(document, selection, rootNode) {
    let startNodeToUpdate;
    let endNodeToUpdate;
    const selectionStart = document.offsetAt(selection.start);
    const selectionEnd = document.offsetAt(selection.end);
    if (selection.isEmpty) {
        startNodeToUpdate = endNodeToUpdate = (0, util_1.getFlatNode)(rootNode, selectionStart, true);
    }
    else {
        startNodeToUpdate = (0, util_1.getFlatNode)(rootNode, selectionStart, true);
        endNodeToUpdate = (0, util_1.getFlatNode)(rootNode, selectionEnd, true);
    }
    if (!startNodeToUpdate || !endNodeToUpdate) {
        return;
    }
    const startPos = document.positionAt(startNodeToUpdate.start);
    const startLine = startPos.line;
    const startChar = startPos.character;
    const endPos = document.positionAt(endNodeToUpdate.end);
    const endLine = endPos.line;
    if (startLine === endLine) {
        return;
    }
    const rangeToReplace = (0, util_1.offsetRangeToVsRange)(document, startNodeToUpdate.start, endNodeToUpdate.end);
    let textToReplaceWith = document.lineAt(startLine).text.substr(startChar);
    for (let i = startLine + 1; i <= endLine; i++) {
        textToReplaceWith += document.lineAt(i).text.trim();
    }
    return new vscode.TextEdit(rangeToReplace, textToReplaceWith);
}
//# sourceMappingURL=mergeLines.js.map