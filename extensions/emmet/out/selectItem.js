"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSelectItem = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
const selectItemHTML_1 = require("./selectItemHTML");
const selectItemStylesheet_1 = require("./selectItemStylesheet");
const parseDocument_1 = require("./parseDocument");
function fetchSelectItem(direction) {
    if (!(0, util_1.validate)() || !vscode.window.activeTextEditor) {
        return;
    }
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const rootNode = (0, parseDocument_1.getRootNode)(document, true);
    if (!rootNode) {
        return;
    }
    const newSelections = [];
    editor.selections.forEach(selection => {
        const selectionStart = selection.isReversed ? selection.active : selection.anchor;
        const selectionEnd = selection.isReversed ? selection.anchor : selection.active;
        let updatedSelection;
        if ((0, util_1.isStyleSheet)(editor.document.languageId)) {
            updatedSelection = direction === 'next' ?
                (0, selectItemStylesheet_1.nextItemStylesheet)(document, selectionStart, selectionEnd, rootNode) :
                (0, selectItemStylesheet_1.prevItemStylesheet)(document, selectionStart, selectionEnd, rootNode);
        }
        else {
            updatedSelection = direction === 'next' ?
                (0, selectItemHTML_1.nextItemHTML)(document, selectionStart, selectionEnd, rootNode) :
                (0, selectItemHTML_1.prevItemHTML)(document, selectionStart, selectionEnd, rootNode);
        }
        newSelections.push(updatedSelection ? updatedSelection : selection);
    });
    editor.selections = newSelections;
    editor.revealRange(editor.selections[editor.selections.length - 1]);
}
exports.fetchSelectItem = fetchSelectItem;
//# sourceMappingURL=selectItem.js.map