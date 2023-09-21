"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const htmlClient_1 = require("../htmlClient");
const browser_1 = require("vscode-languageclient/browser");
let client;
// this method is called when vs code is activated
async function activate(context) {
    const serverMain = vscode_1.Uri.joinPath(context.extensionUri, 'server/dist/browser/htmlServerMain.js');
    try {
        const worker = new Worker(serverMain.toString());
        worker.postMessage({ i10lLocation: vscode_1.l10n.uri?.toString(false) ?? '' });
        const newLanguageClient = (id, name, clientOptions) => {
            return new browser_1.LanguageClient(id, name, clientOptions, worker);
        };
        const timer = {
            setTimeout(callback, ms, ...args) {
                const handle = setTimeout(callback, ms, ...args);
                return { dispose: () => clearTimeout(handle) };
            }
        };
        client = await (0, htmlClient_1.startClient)(context, newLanguageClient, { TextDecoder, timer });
    }
    catch (e) {
        console.log(e);
    }
}
exports.activate = activate;
async function deactivate() {
    if (client) {
        await client.dispose();
        client = undefined;
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=htmlClientMain.js.map