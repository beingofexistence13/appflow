"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchTag = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
const parseDocument_1 = require("./parseDocument");
function matchTag() {
    if (!(0, util_1.validate)(false) || !vscode.window.activeTextEditor) {
        return;
    }
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const rootNode = (0, parseDocument_1.getRootNode)(document, true);
    if (!rootNode) {
        return;
    }
    const updatedSelections = [];
    editor.selections.forEach(selection => {
        const updatedSelection = getUpdatedSelections(document, rootNode, selection.start);
        if (updatedSelection) {
            updatedSelections.push(updatedSelection);
        }
    });
    if (updatedSelections.length) {
        editor.selections = updatedSelections;
        editor.revealRange(editor.selections[updatedSelections.length - 1]);
    }
}
exports.matchTag = matchTag;
function getUpdatedSelections(document, rootNode, position) {
    const offset = document.offsetAt(position);
    const currentNode = (0, util_1.getHtmlFlatNode)(document.getText(), rootNode, offset, true);
    if (!currentNode) {
        return;
    }
    // If no opening/closing tag or cursor is between open and close tag, then no-op
    if (!currentNode.open
        || !currentNode.close
        || (offset > currentNode.open.end && offset < currentNode.close.start)) {
        return;
    }
    // Place cursor inside the close tag if cursor is inside the open tag, else place it inside the open tag
    const finalOffset = (offset <= currentNode.open.end) ? currentNode.close.start + 2 : currentNode.start + 1;
    return (0, util_1.offsetRangeToSelection)(document, finalOffset, finalOffset);
}
//# sourceMappingURL=matchTag.js.map