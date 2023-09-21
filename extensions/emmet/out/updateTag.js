"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTag = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
const parseDocument_1 = require("./parseDocument");
async function updateTag(tagName) {
    if (!(0, util_1.validate)(false) || !vscode.window.activeTextEditor) {
        return;
    }
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const rootNode = (0, parseDocument_1.getRootNode)(document, true);
    if (!rootNode) {
        return;
    }
    const rangesToUpdate = editor.selections
        .reduceRight((prev, selection) => prev.concat(getRangesToUpdate(document, selection, rootNode)), []);
    if (!rangesToUpdate.length) {
        return;
    }
    const firstTagName = rangesToUpdate[0].name;
    const tagNamesAreEqual = rangesToUpdate.every(range => range.name === firstTagName);
    if (tagName === undefined) {
        tagName = await vscode.window.showInputBox({
            prompt: 'Enter Tag',
            value: tagNamesAreEqual ? firstTagName : undefined
        });
        // TODO: Accept fragments for JSX and TSX
        if (!tagName) {
            return false;
        }
    }
    return editor.edit(editBuilder => {
        rangesToUpdate.forEach(tagRange => {
            editBuilder.replace(tagRange.range, tagName);
        });
    });
}
exports.updateTag = updateTag;
function getRangesFromNode(node, document) {
    const ranges = [];
    if (node.open) {
        const start = document.positionAt(node.open.start);
        ranges.push({
            name: node.name,
            range: new vscode.Range(start.translate(0, 1), start.translate(0, 1).translate(0, node.name.length))
        });
    }
    if (node.close) {
        const endTagStart = document.positionAt(node.close.start);
        const end = document.positionAt(node.close.end);
        ranges.push({
            name: node.name,
            range: new vscode.Range(endTagStart.translate(0, 2), end.translate(0, -1))
        });
    }
    return ranges;
}
function getRangesToUpdate(document, selection, rootNode) {
    const documentText = document.getText();
    const offset = document.offsetAt(selection.start);
    const nodeToUpdate = (0, util_1.getHtmlFlatNode)(documentText, rootNode, offset, true);
    if (!nodeToUpdate) {
        return [];
    }
    return getRangesFromNode(nodeToUpdate, document);
}
//# sourceMappingURL=updateTag.js.map