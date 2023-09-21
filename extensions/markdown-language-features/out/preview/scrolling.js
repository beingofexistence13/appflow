"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartingScrollLine = exports.StartingScrollFragment = exports.scrollEditorToLine = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode = require("vscode");
/**
 * Change the top-most visible line of `editor` to be at `line`
 */
function scrollEditorToLine(line, editor) {
    const revealRange = toRevealRange(line, editor);
    editor.revealRange(revealRange, vscode.TextEditorRevealType.AtTop);
}
exports.scrollEditorToLine = scrollEditorToLine;
function toRevealRange(line, editor) {
    line = Math.max(0, line);
    const sourceLine = Math.floor(line);
    if (sourceLine >= editor.document.lineCount) {
        return new vscode.Range(editor.document.lineCount - 1, 0, editor.document.lineCount - 1, 0);
    }
    const fraction = line - sourceLine;
    const text = editor.document.lineAt(sourceLine).text;
    const start = Math.floor(fraction * text.length);
    return new vscode.Range(sourceLine, start, sourceLine + 1, 0);
}
class StartingScrollFragment {
    constructor(fragment) {
        this.fragment = fragment;
        this.type = 'fragment';
    }
}
exports.StartingScrollFragment = StartingScrollFragment;
class StartingScrollLine {
    constructor(line) {
        this.line = line;
        this.type = 'line';
    }
}
exports.StartingScrollLine = StartingScrollLine;
//# sourceMappingURL=scrolling.js.map