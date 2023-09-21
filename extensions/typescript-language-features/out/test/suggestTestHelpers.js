"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeCommitCharacter = exports.acceptFirstSuggestion = void 0;
require("mocha");
const vscode = __importStar(require("vscode"));
const testUtils_1 = require("./testUtils");
async function acceptFirstSuggestion(uri, _disposables) {
    return (0, testUtils_1.retryUntilDocumentChanges)(uri, { retries: 10, timeout: 0 }, _disposables, async () => {
        await vscode.commands.executeCommand('editor.action.triggerSuggest');
        await (0, testUtils_1.wait)(1000);
        await vscode.commands.executeCommand('acceptSelectedSuggestion');
    });
}
exports.acceptFirstSuggestion = acceptFirstSuggestion;
async function typeCommitCharacter(uri, character, _disposables) {
    const didChangeDocument = (0, testUtils_1.onChangedDocument)(uri, _disposables);
    await vscode.commands.executeCommand('editor.action.triggerSuggest');
    await (0, testUtils_1.wait)(3000); // Give time for suggestions to show
    await vscode.commands.executeCommand('type', { text: character });
    return await didChangeDocument;
}
exports.typeCommitCharacter = typeCommitCharacter;
//# sourceMappingURL=suggestTestHelpers.js.map