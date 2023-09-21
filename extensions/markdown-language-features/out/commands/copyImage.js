"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyImageCommand = void 0;
const vscode = require("vscode");
class CopyImageCommand {
    constructor(_webviewManager) {
        this._webviewManager = _webviewManager;
        this.id = '_markdown.copyImage';
    }
    execute(args) {
        const source = vscode.Uri.parse(args.resource);
        this._webviewManager.findPreview(source)?.copyImage(args.id);
    }
}
exports.CopyImageCommand = CopyImageCommand;
//# sourceMappingURL=copyImage.js.map