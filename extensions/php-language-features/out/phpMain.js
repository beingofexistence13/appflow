"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const completionItemProvider_1 = require("./features/completionItemProvider");
const hoverProvider_1 = require("./features/hoverProvider");
const signatureHelpProvider_1 = require("./features/signatureHelpProvider");
const validationProvider_1 = require("./features/validationProvider");
function activate(context) {
    const validator = new validationProvider_1.default();
    validator.activate(context.subscriptions);
    // add providers
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('php', new completionItemProvider_1.default(), '>', '$'));
    context.subscriptions.push(vscode.languages.registerHoverProvider('php', new hoverProvider_1.default()));
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('php', new signatureHelpProvider_1.default(), '(', ','));
}
exports.activate = activate;
//# sourceMappingURL=phpMain.js.map