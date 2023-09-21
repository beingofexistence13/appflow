"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewMarkdownEngine = void 0;
const vscode = require("vscode");
const markdownEngine_1 = require("../markdownEngine");
const markdownExtensions_1 = require("../markdownExtensions");
const slugify_1 = require("../slugify");
const nulLogging_1 = require("./nulLogging");
const emptyContributions = new class {
    constructor() {
        this.extensionUri = vscode.Uri.file('/');
        this.contributions = markdownExtensions_1.MarkdownContributions.Empty;
        this._onContributionsChanged = new vscode.EventEmitter();
        this.onContributionsChanged = this._onContributionsChanged.event;
    }
    dispose() {
        this._onContributionsChanged.dispose();
    }
};
function createNewMarkdownEngine() {
    return new markdownEngine_1.MarkdownItEngine(emptyContributions, slugify_1.githubSlugifier, nulLogging_1.nulLogger);
}
exports.createNewMarkdownEngine = createNewMarkdownEngine;
//# sourceMappingURL=engine.js.map