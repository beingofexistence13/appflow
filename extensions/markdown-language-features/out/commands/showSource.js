"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowSourceCommand = void 0;
const vscode = require("vscode");
class ShowSourceCommand {
    constructor(_previewManager) {
        this._previewManager = _previewManager;
        this.id = 'markdown.showSource';
    }
    execute() {
        const { activePreviewResource, activePreviewResourceColumn } = this._previewManager;
        if (activePreviewResource && activePreviewResourceColumn) {
            return vscode.workspace.openTextDocument(activePreviewResource).then(document => {
                return vscode.window.showTextDocument(document, activePreviewResourceColumn);
            });
        }
        return undefined;
    }
}
exports.ShowSourceCommand = ShowSourceCommand;
//# sourceMappingURL=showSource.js.map