"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.MdLinkOpener = void 0;
const vscode = require("vscode");
var OpenMarkdownLinks;
(function (OpenMarkdownLinks) {
    OpenMarkdownLinks["beside"] = "beside";
    OpenMarkdownLinks["currentGroup"] = "currentGroup";
})(OpenMarkdownLinks || (OpenMarkdownLinks = {}));
class MdLinkOpener {
    constructor(_client) {
        this._client = _client;
    }
    async resolveDocumentLink(linkText, fromResource) {
        return this._client.resolveLinkTarget(linkText, fromResource);
    }
    async openDocumentLink(linkText, fromResource, viewColumn) {
        const resolved = await this._client.resolveLinkTarget(linkText, fromResource);
        if (!resolved) {
            return;
        }
        const uri = vscode.Uri.from(resolved.uri);
        switch (resolved.kind) {
            case 'external':
                return vscode.commands.executeCommand('vscode.open', uri);
            case 'folder':
                return vscode.commands.executeCommand('revealInExplorer', uri);
            case 'file': {
                // If no explicit viewColumn is given, check if the editor is already open in a tab
                if (typeof viewColumn === 'undefined') {
                    for (const tab of vscode.window.tabGroups.all.flatMap(x => x.tabs)) {
                        if (tab.input instanceof vscode.TabInputText) {
                            if (tab.input.uri.fsPath === uri.fsPath) {
                                viewColumn = tab.group.viewColumn;
                                break;
                            }
                        }
                    }
                }
                return vscode.commands.executeCommand('vscode.open', uri, {
                    selection: resolved.position ? new vscode.Range(resolved.position.line, resolved.position.character, resolved.position.line, resolved.position.character) : undefined,
                    viewColumn: viewColumn ?? getViewColumn(fromResource),
                });
            }
        }
    }
}
exports.MdLinkOpener = MdLinkOpener;
function getViewColumn(resource) {
    const config = vscode.workspace.getConfiguration('markdown', resource);
    const openLinks = config.get('links.openLocation', OpenMarkdownLinks.currentGroup);
    switch (openLinks) {
        case OpenMarkdownLinks.beside:
            return vscode.ViewColumn.Beside;
        case OpenMarkdownLinks.currentGroup:
        default:
            return vscode.ViewColumn.Active;
    }
}
//# sourceMappingURL=openDocumentLink.js.map