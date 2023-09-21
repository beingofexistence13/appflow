"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const browser_1 = require("vscode-languageclient/browser");
const client_1 = require("./client/client");
const extension_shared_1 = require("./extension.shared");
const logging_1 = require("./logging");
const markdownEngine_1 = require("./markdownEngine");
const markdownExtensions_1 = require("./markdownExtensions");
const slugify_1 = require("./slugify");
async function activate(context) {
    const contributions = (0, markdownExtensions_1.getMarkdownExtensionContributions)(context);
    context.subscriptions.push(contributions);
    const logger = new logging_1.VsCodeOutputLogger();
    context.subscriptions.push(logger);
    const engine = new markdownEngine_1.MarkdownItEngine(contributions, slugify_1.githubSlugifier, logger);
    const client = await startServer(context, engine);
    context.subscriptions.push(client);
    (0, extension_shared_1.activateShared)(context, client, engine, logger, contributions);
}
exports.activate = activate;
function startServer(context, parser) {
    const serverMain = vscode.Uri.joinPath(context.extensionUri, 'server/dist/browser/workerMain.js');
    const worker = new Worker(serverMain.toString());
    worker.postMessage({ i10lLocation: vscode.l10n.uri?.toString() ?? '' });
    return (0, client_1.startClient)((id, name, clientOptions) => {
        return new browser_1.LanguageClient(id, name, clientOptions, worker);
    }, parser);
}
//# sourceMappingURL=extension.browser.js.map