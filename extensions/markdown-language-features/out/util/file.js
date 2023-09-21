"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.looksLikeMarkdownPath = exports.isMarkdownFile = exports.markdownFileExtensions = void 0;
const vscode = require("vscode");
const URI = require("vscode-uri");
const schemes_1 = require("./schemes");
exports.markdownFileExtensions = Object.freeze([
    'md',
    'mkd',
    'mdwn',
    'mdown',
    'markdown',
    'markdn',
    'mdtxt',
    'mdtext',
    'workbook',
]);
function isMarkdownFile(document) {
    return document.languageId === 'markdown';
}
exports.isMarkdownFile = isMarkdownFile;
function looksLikeMarkdownPath(resolvedHrefPath) {
    const doc = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === resolvedHrefPath.toString());
    if (doc) {
        return isMarkdownFile(doc);
    }
    if (resolvedHrefPath.scheme === schemes_1.Schemes.notebookCell) {
        for (const notebook of vscode.workspace.notebookDocuments) {
            for (const cell of notebook.getCells()) {
                if (cell.kind === vscode.NotebookCellKind.Markup && isMarkdownFile(cell.document)) {
                    return true;
                }
            }
        }
        return false;
    }
    return exports.markdownFileExtensions.includes(URI.Utils.extname(resolvedHrefPath).toLowerCase().replace('.', ''));
}
exports.looksLikeMarkdownPath = looksLikeMarkdownPath;
//# sourceMappingURL=file.js.map