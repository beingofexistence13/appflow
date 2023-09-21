"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLinkPasteSupport = void 0;
const vscode = require("vscode");
const mimes_1 = require("../../util/mimes");
const shared_1 = require("./shared");
class PasteUrlEditProvider {
    async provideDocumentPasteEdits(document, ranges, dataTransfer, token) {
        const pasteUrlSetting = (0, shared_1.getPasteUrlAsFormattedLinkSetting)(document);
        if (pasteUrlSetting === shared_1.PasteUrlAsFormattedLink.Never) {
            return;
        }
        const item = dataTransfer.get(mimes_1.Mime.textPlain);
        const urlList = await item?.asString();
        if (token.isCancellationRequested || !urlList || !(0, shared_1.validateLink)(urlList).isValid) {
            return;
        }
        const pasteEdit = await (0, shared_1.createEditAddingLinksForUriList)(document, ranges, (0, shared_1.validateLink)(urlList).cleanedUrlList, true, pasteUrlSetting === shared_1.PasteUrlAsFormattedLink.Smart, token);
        if (!pasteEdit) {
            return;
        }
        const edit = new vscode.DocumentPasteEdit('', pasteEdit.label);
        edit.additionalEdit = pasteEdit.additionalEdits;
        edit.yieldTo = pasteEdit.markdownLink ? undefined : [{ mimeType: mimes_1.Mime.textPlain }];
        return edit;
    }
}
PasteUrlEditProvider.id = 'insertMarkdownLink';
PasteUrlEditProvider.pasteMimeTypes = [
    mimes_1.Mime.textPlain,
];
function registerLinkPasteSupport(selector) {
    return vscode.languages.registerDocumentPasteEditProvider(selector, new PasteUrlEditProvider(), PasteUrlEditProvider);
}
exports.registerLinkPasteSupport = registerLinkPasteSupport;
//# sourceMappingURL=pasteUrlProvider.js.map