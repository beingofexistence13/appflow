"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMarkdownFile = exports.looksLikeMarkdownPath = void 0;
const vscode_uri_1 = require("vscode-uri");
function looksLikeMarkdownPath(config, resolvedHrefPath) {
    return config.markdownFileExtensions.includes(vscode_uri_1.Utils.extname(resolvedHrefPath).toLowerCase().replace('.', ''));
}
exports.looksLikeMarkdownPath = looksLikeMarkdownPath;
function isMarkdownFile(document) {
    return document.languageId === 'markdown';
}
exports.isMarkdownFile = isMarkdownFile;
//# sourceMappingURL=file.js.map