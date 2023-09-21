"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const jsonClient_1 = require("../jsonClient");
const node_1 = require("vscode-languageclient/node");
const fs_1 = require("fs");
const path = require("path");
const request_light_1 = require("request-light");
const extension_telemetry_1 = require("@vscode/extension-telemetry");
const schemaCache_1 = require("./schemaCache");
let telemetry;
let client;
// this method is called when vs code is activated
async function activate(context) {
    const clientPackageJSON = await getPackageInfo(context);
    telemetry = new extension_telemetry_1.default(clientPackageJSON.aiKey);
    const outputChannel = vscode_1.window.createOutputChannel(jsonClient_1.languageServerDescription);
    const serverMain = `./server/${clientPackageJSON.main.indexOf('/dist/') !== -1 ? 'dist' : 'out'}/node/jsonServerMain`;
    const serverModule = context.asAbsolutePath(serverMain);
    // The debug options for the server
    const debugOptions = { execArgv: ['--nolazy', '--inspect=' + (6000 + Math.round(Math.random() * 999))] };
    // If the extension is launch in debug mode the debug server options are use
    // Otherwise the run options are used
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: { module: serverModule, transport: node_1.TransportKind.ipc, options: debugOptions }
    };
    const newLanguageClient = (id, name, clientOptions) => {
        clientOptions.outputChannel = outputChannel;
        return new node_1.LanguageClient(id, name, serverOptions, clientOptions);
    };
    const log = getLog(outputChannel);
    context.subscriptions.push(log);
    // pass the location of the localization bundle to the server
    process.env['VSCODE_L10N_BUNDLE_LOCATION'] = vscode_1.l10n.uri?.toString() ?? '';
    const schemaRequests = await getSchemaRequestService(context, log);
    client = await (0, jsonClient_1.startClient)(context, newLanguageClient, { schemaRequests, telemetry });
}
exports.activate = activate;
async function deactivate() {
    if (client) {
        await client.stop();
        client = undefined;
    }
    telemetry?.dispose();
}
exports.deactivate = deactivate;
async function getPackageInfo(context) {
    const location = context.asAbsolutePath('./package.json');
    try {
        return JSON.parse((await fs_1.promises.readFile(location)).toString());
    }
    catch (e) {
        console.log(`Problems reading ${location}: ${e}`);
        return { name: '', version: '', aiKey: '', main: '' };
    }
}
const traceSetting = 'json.trace.server';
function getLog(outputChannel) {
    let trace = vscode_1.workspace.getConfiguration().get(traceSetting) === 'verbose';
    const configListener = vscode_1.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(traceSetting)) {
            trace = vscode_1.workspace.getConfiguration().get(traceSetting) === 'verbose';
        }
    });
    return {
        trace(message) {
            if (trace) {
                outputChannel.appendLine(message);
            }
        },
        isTrace() {
            return trace;
        },
        dispose: () => configListener.dispose()
    };
}
const retryTimeoutInHours = 2 * 24; // 2 days
async function getSchemaRequestService(context, log) {
    let cache = undefined;
    const globalStorage = context.globalStorageUri;
    let clearCache;
    if (globalStorage.scheme === 'file') {
        const schemaCacheLocation = path.join(globalStorage.fsPath, 'json-schema-cache');
        await fs_1.promises.mkdir(schemaCacheLocation, { recursive: true });
        const schemaCache = new schemaCache_1.JSONSchemaCache(schemaCacheLocation, context.globalState);
        log.trace(`[json schema cache] initial state: ${JSON.stringify(schemaCache.getCacheInfo(), null, ' ')}`);
        cache = schemaCache;
        clearCache = async () => {
            const cachedSchemas = await schemaCache.clearCache();
            log.trace(`[json schema cache] cache cleared. Previously cached schemas: ${cachedSchemas.join(', ')}`);
            return cachedSchemas;
        };
    }
    const isXHRResponse = (error) => typeof error?.status === 'number';
    const request = async (uri, etag) => {
        const headers = {
            'Accept-Encoding': 'gzip, deflate',
            'User-Agent': `${vscode_1.env.appName} (${vscode_1.env.appHost})`
        };
        if (etag) {
            headers['If-None-Match'] = etag;
        }
        try {
            log.trace(`[json schema cache] Requesting schema ${uri} etag ${etag}...`);
            const response = await (0, request_light_1.xhr)({ url: uri, followRedirects: 5, headers });
            if (cache) {
                const etag = response.headers['etag'];
                if (typeof etag === 'string') {
                    log.trace(`[json schema cache] Storing schema ${uri} etag ${etag} in cache`);
                    await cache.putSchema(uri, etag, response.responseText);
                }
                else {
                    log.trace(`[json schema cache] Response: schema ${uri} no etag`);
                }
            }
            return response.responseText;
        }
        catch (error) {
            if (isXHRResponse(error)) {
                if (error.status === 304 && etag && cache) {
                    log.trace(`[json schema cache] Response: schema ${uri} unchanged etag ${etag}`);
                    const content = await cache.getSchema(uri, etag, true);
                    if (content) {
                        log.trace(`[json schema cache] Get schema ${uri} etag ${etag} from cache`);
                        return content;
                    }
                    return request(uri);
                }
                let status = (0, request_light_1.getErrorStatusDescription)(error.status);
                if (status && error.responseText) {
                    status = `${status}\n${error.responseText.substring(0, 200)}`;
                }
                if (!status) {
                    status = error.toString();
                }
                log.trace(`[json schema cache] Respond schema ${uri} error ${status}`);
                throw status;
            }
            throw error;
        }
    };
    return {
        getContent: async (uri) => {
            if (cache && /^https?:\/\/json\.schemastore\.org\//.test(uri)) {
                const content = await cache.getSchemaIfUpdatedSince(uri, retryTimeoutInHours);
                if (content) {
                    if (log.isTrace()) {
                        log.trace(`[json schema cache] Schema ${uri} from cache without request (last accessed ${cache.getLastUpdatedInHours(uri)} hours ago)`);
                    }
                    return content;
                }
            }
            return request(uri, cache?.getETag(uri));
        },
        clearCache
    };
}
//# sourceMappingURL=jsonClientMain.js.map