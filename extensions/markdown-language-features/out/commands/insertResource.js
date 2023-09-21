"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertImageFromWorkspace = exports.InsertLinkFromWorkspace = void 0;
const vscode = require("vscode");
const vscode_uri_1 = require("vscode-uri");
const shared_1 = require("../languageFeatures/copyFiles/shared");
const arrays_1 = require("../util/arrays");
const document_1 = require("../util/document");
const schemes_1 = require("../util/schemes");
class InsertLinkFromWorkspace {
    constructor() {
        this.id = 'markdown.editor.insertLinkFromWorkspace';
    }
    async execute(resources) {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }
        resources ?? (resources = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: true,
            openLabel: vscode.l10n.t("Insert link"),
            title: vscode.l10n.t("Insert link"),
            defaultUri: getDefaultUri(activeEditor.document),
        }));
        return insertLink(activeEditor, resources ?? [], false);
    }
}
exports.InsertLinkFromWorkspace = InsertLinkFromWorkspace;
class InsertImageFromWorkspace {
    constructor() {
        this.id = 'markdown.editor.insertImageFromWorkspace';
    }
    async execute(resources) {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }
        resources ?? (resources = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: true,
            filters: {
                [vscode.l10n.t("Media")]: Array.from(shared_1.mediaFileExtensions.keys())
            },
            openLabel: vscode.l10n.t("Insert image"),
            title: vscode.l10n.t("Insert image"),
            defaultUri: getDefaultUri(activeEditor.document),
        }));
        return insertLink(activeEditor, resources ?? [], true);
    }
}
exports.InsertImageFromWorkspace = InsertImageFromWorkspace;
function getDefaultUri(document) {
    const docUri = (0, document_1.getParentDocumentUri)(document.uri);
    if (docUri.scheme === schemes_1.Schemes.untitled) {
        return vscode.workspace.workspaceFolders?.[0]?.uri;
    }
    return vscode_uri_1.Utils.dirname(docUri);
}
async function insertLink(activeEditor, selectedFiles, insertAsImage) {
    if (!selectedFiles.length) {
        return;
    }
    const edit = createInsertLinkEdit(activeEditor, selectedFiles, insertAsImage);
    await vscode.workspace.applyEdit(edit);
}
function createInsertLinkEdit(activeEditor, selectedFiles, insertAsMedia, title = '', placeholderValue = 0, pasteAsMarkdownLink = true, isExternalLink = false) {
    const snippetEdits = (0, arrays_1.coalesce)(activeEditor.selections.map((selection, i) => {
        const selectionText = activeEditor.document.getText(selection);
        const snippet = (0, shared_1.createUriListSnippet)(activeEditor.document, selectedFiles, [], title, placeholderValue, pasteAsMarkdownLink, isExternalLink, {
            insertAsMedia,
            placeholderText: selectionText,
            placeholderStartIndex: (i + 1) * selectedFiles.length,
            separator: insertAsMedia ? '\n' : ' ',
        });
        return snippet ? new vscode.SnippetTextEdit(selection, snippet.snippet) : undefined;
    }));
    const edit = new vscode.WorkspaceEdit();
    edit.set(activeEditor.document.uri, snippetEdits);
    return edit;
}
//# sourceMappingURL=insertResource.js.map