"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOfScheme = exports.Schemes = void 0;
exports.Schemes = Object.freeze({
    file: 'file',
    untitled: 'untitled',
    mailto: 'mailto',
    vscode: 'vscode',
    'vscode-insiders': 'vscode-insiders',
    notebookCell: 'vscode-notebook-cell',
});
function isOfScheme(scheme, link) {
    return link.toLowerCase().startsWith(scheme + ':');
}
exports.isOfScheme = isOfScheme;
//# sourceMappingURL=schemes.js.map