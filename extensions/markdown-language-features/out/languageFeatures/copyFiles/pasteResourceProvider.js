"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPasteSupport = void 0;
const vscode = require("vscode");
const mimes_1 = require("../../util/mimes");
const schemes_1 = require("../../util/schemes");
const shared_1 = require("./shared");
class PasteResourceEditProvider {
    constructor() {
        this._yieldTo = [
            { mimeType: 'text/plain' },
            { extensionId: 'vscode.ipynb', providerId: 'insertAttachment' },
        ];
    }
    async provideDocumentPasteEdits(document, ranges, dataTransfer, token) {
        const enabled = vscode.workspace.getConfiguration('markdown', document).get('editor.filePaste.enabled', true);
        if (!enabled) {
            return;
        }
        const createEdit = await this._getMediaFilesEdit(document, dataTransfer, token);
        if (createEdit) {
            return createEdit;
        }
        if (token.isCancellationRequested) {
            return;
        }
        return this._getUriListEdit(document, ranges, dataTransfer, token);
    }
    async _getUriListEdit(document, ranges, dataTransfer, token) {
        const uriList = await dataTransfer.get(mimes_1.Mime.textUriList)?.asString();
        if (!uriList || token.isCancellationRequested) {
            return;
        }
        const pasteUrlSetting = (0, shared_1.getPasteUrlAsFormattedLinkSetting)(document);
        const pasteEdit = await (0, shared_1.createEditAddingLinksForUriList)(document, ranges, uriList, false, pasteUrlSetting === shared_1.PasteUrlAsFormattedLink.Smart, token);
        if (!pasteEdit) {
            return;
        }
        const uriEdit = new vscode.DocumentPasteEdit('', pasteEdit.label);
        uriEdit.additionalEdit = pasteEdit.additionalEdits;
        uriEdit.yieldTo = this._yieldTo;
        return uriEdit;
    }
    async _getMediaFilesEdit(document, dataTransfer, token) {
        if (document.uri.scheme === schemes_1.Schemes.untitled) {
            return;
        }
        const copyFilesIntoWorkspace = vscode.workspace.getConfiguration('markdown', document).get('editor.filePaste.copyIntoWorkspace', 'mediaFiles');
        if (copyFilesIntoWorkspace === 'never') {
            return;
        }
        const edit = await (0, shared_1.createEditForMediaFiles)(document, dataTransfer, token);
        if (!edit) {
            return;
        }
        const pasteEdit = new vscode.DocumentPasteEdit(edit.snippet, edit.label);
        pasteEdit.additionalEdit = edit.additionalEdits;
        pasteEdit.yieldTo = this._yieldTo;
        return pasteEdit;
    }
}
PasteResourceEditProvider.id = 'insertLink';
PasteResourceEditProvider.pasteMimeTypes = [
    mimes_1.Mime.textUriList,
    ...mimes_1.mediaMimes,
];
function registerPasteSupport(selector) {
    return vscode.languages.registerDocumentPasteEditProvider(selector, new PasteResourceEditProvider(), PasteResourceEditProvider);
}
exports.registerPasteSupport = registerPasteSupport;
//# sourceMappingURL=pasteResourceProvider.js.map