"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const node_1 = require("vscode-languageclient/node");
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
    const clientMain = vscode.extensions.getExtension('vscode.markdown-language-features')?.packageJSON?.main || '';
    const serverMain = `./server/${clientMain.indexOf('/dist/') !== -1 ? 'dist' : 'out'}/node/workerMain`;
    const serverModule = context.asAbsolutePath(serverMain);
    // The debug options for the server
    const debugOptions = { execArgv: ['--nolazy', '--inspect=' + (7000 + Math.round(Math.random() * 999))] };
    // If the extension is launch in debug mode the debug server options are use
    // Otherwise the run options are used
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: { module: serverModule, transport: node_1.TransportKind.ipc, options: debugOptions }
    };
    // pass the location of the localization bundle to the server
    process.env['VSCODE_L10N_BUNDLE_LOCATION'] = vscode.l10n.uri?.toString() ?? '';
    return (0, client_1.startClient)((id, name, clientOptions) => {
        return new node_1.LanguageClient(id, name, serverOptions, clientOptions);
    }, parser);
}
//# sourceMappingURL=extension.js.map