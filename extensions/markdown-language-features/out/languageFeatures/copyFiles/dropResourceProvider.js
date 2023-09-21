"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDropIntoEditorSupport = void 0;
const vscode = require("vscode");
const mimes_1 = require("../../util/mimes");
const schemes_1 = require("../../util/schemes");
const shared_1 = require("./shared");
class ResourceDropProvider {
    constructor() {
        this._yieldTo = [
            { mimeType: 'text/plain' },
            { extensionId: 'vscode.ipynb', providerId: 'insertAttachment' },
        ];
    }
    async provideDocumentDropEdits(document, _position, dataTransfer, token) {
        const enabled = vscode.workspace.getConfiguration('markdown', document).get('editor.drop.enabled', true);
        if (!enabled) {
            return;
        }
        const filesEdit = await this._getMediaFilesEdit(document, dataTransfer, token);
        if (filesEdit) {
            return filesEdit;
        }
        if (token.isCancellationRequested) {
            return;
        }
        return this._getUriListEdit(document, dataTransfer, token);
    }
    async _getUriListEdit(document, dataTransfer, token) {
        const urlList = await dataTransfer.get(mimes_1.Mime.textUriList)?.asString();
        if (!urlList || token.isCancellationRequested) {
            return undefined;
        }
        const snippet = await (0, shared_1.tryGetUriListSnippet)(document, urlList, token);
        if (!snippet) {
            return undefined;
        }
        const edit = new vscode.DocumentDropEdit(snippet.snippet);
        edit.label = snippet.label;
        edit.yieldTo = this._yieldTo;
        return edit;
    }
    async _getMediaFilesEdit(document, dataTransfer, token) {
        if (document.uri.scheme === schemes_1.Schemes.untitled) {
            return;
        }
        const copyIntoWorkspace = vscode.workspace.getConfiguration('markdown', document).get('editor.drop.copyIntoWorkspace', 'mediaFiles');
        if (copyIntoWorkspace !== 'mediaFiles') {
            return;
        }
        const edit = await (0, shared_1.createEditForMediaFiles)(document, dataTransfer, token);
        if (!edit) {
            return;
        }
        const dropEdit = new vscode.DocumentDropEdit(edit.snippet);
        dropEdit.label = edit.label;
        dropEdit.additionalEdit = edit.additionalEdits;
        dropEdit.yieldTo = this._yieldTo;
        return dropEdit;
    }
}
ResourceDropProvider.id = 'insertLink';
ResourceDropProvider.dropMimeTypes = [
    mimes_1.Mime.textUriList,
    ...mimes_1.mediaMimes,
];
function registerDropIntoEditorSupport(selector) {
    return vscode.languages.registerDocumentDropEditProvider(selector, new ResourceDropProvider(), ResourceDropProvider);
}
exports.registerDropIntoEditorSupport = registerDropIntoEditorSupport;
//# sourceMappingURL=dropResourceProvider.js.map