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
exports.disabledSchemes = exports.getSemanticSupportedSchemes = exports.officeScript = exports.vscodeVfs = exports.memFs = exports.vscodeNotebookCell = exports.walkThroughSnippet = exports.vsls = exports.azurerepos = exports.github = exports.git = exports.untitled = exports.file = void 0;
const vscode = __importStar(require("vscode"));
const platform_1 = require("../utils/platform");
exports.file = 'file';
exports.untitled = 'untitled';
exports.git = 'git';
exports.github = 'github';
exports.azurerepos = 'azurerepos';
/** Live share scheme */
exports.vsls = 'vsls';
exports.walkThroughSnippet = 'walkThroughSnippet';
exports.vscodeNotebookCell = 'vscode-notebook-cell';
exports.memFs = 'memfs';
exports.vscodeVfs = 'vscode-vfs';
exports.officeScript = 'office-script';
function getSemanticSupportedSchemes() {
    if ((0, platform_1.isWeb)() && vscode.workspace.workspaceFolders) {
        return vscode.workspace.workspaceFolders.map(folder => folder.uri.scheme);
    }
    return [
        exports.file,
        exports.untitled,
        exports.walkThroughSnippet,
        exports.vscodeNotebookCell,
    ];
}
exports.getSemanticSupportedSchemes = getSemanticSupportedSchemes;
/**
 * File scheme for which JS/TS language feature should be disabled
 */
exports.disabledSchemes = new Set([
    exports.git,
    exports.vsls,
    exports.github,
    exports.azurerepos,
]);
//# sourceMappingURL=fileSchemes.js.map