"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const nodeFs_1 = require("./nodeFs");
const vscode_1 = require("vscode");
const htmlClient_1 = require("../htmlClient");
const node_1 = require("vscode-languageclient/node");
const util_1 = require("util");
const fs = require("fs");
const extension_telemetry_1 = require("@vscode/extension-telemetry");
let telemetry;
let client;
// this method is called when vs code is activated
async function activate(context) {
    const clientPackageJSON = getPackageInfo(context);
    telemetry = new extension_telemetry_1.default(clientPackageJSON.aiKey);
    const serverMain = `./server/${clientPackageJSON.main.indexOf('/dist/') !== -1 ? 'dist' : 'out'}/node/htmlServerMain`;
    const serverModule = context.asAbsolutePath(serverMain);
    // The debug options for the server
    const debugOptions = { execArgv: ['--nolazy', '--inspect=' + (8000 + Math.round(Math.random() * 999))] };
    // If the extension is launch in debug mode the debug server options are use
    // Otherwise the run options are used
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: { module: serverModule, transport: node_1.TransportKind.ipc, options: debugOptions }
    };
    const newLanguageClient = (id, name, clientOptions) => {
        return new node_1.LanguageClient(id, name, serverOptions, clientOptions);
    };
    const timer = {
        setTimeout(callback, ms, ...args) {
            const handle = setTimeout(callback, ms, ...args);
            return { dispose: () => clearTimeout(handle) };
        }
    };
    // pass the location of the localization bundle to the server
    process.env['VSCODE_L10N_BUNDLE_LOCATION'] = vscode_1.l10n.uri?.toString() ?? '';
    client = await (0, htmlClient_1.startClient)(context, newLanguageClient, { fileFs: (0, nodeFs_1.getNodeFileFS)(), TextDecoder: util_1.TextDecoder, telemetry, timer });
}
exports.activate = activate;
async function deactivate() {
    if (client) {
        await client.dispose();
        client = undefined;
    }
}
exports.deactivate = deactivate;
function getPackageInfo(context) {
    const location = context.asAbsolutePath('./package.json');
    try {
        return JSON.parse(fs.readFileSync(location).toString());
    }
    catch (e) {
        console.log(`Problems reading ${location}: ${e}`);
        return { name: '', version: '', aiKey: '', main: '' };
    }
}
//# sourceMappingURL=htmlClientMain.js.map