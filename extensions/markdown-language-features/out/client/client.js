"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.startClient = exports.MdLanguageClient = void 0;
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const proto = require("./protocol");
const file_1 = require("../util/file");
const workspace_1 = require("./workspace");
const fileWatchingManager_1 = require("./fileWatchingManager");
class MdLanguageClient {
    constructor(_client, _workspace) {
        this._client = _client;
        this._workspace = _workspace;
    }
    dispose() {
        this._client.stop();
        this._workspace.dispose();
    }
    resolveLinkTarget(linkText, uri) {
        return this._client.sendRequest(proto.resolveLinkTarget, { linkText, uri: uri.toString() });
    }
    getEditForFileRenames(files, token) {
        return this._client.sendRequest(proto.getEditForFileRenames, files, token);
    }
    getReferencesToFileInWorkspace(resource, token) {
        return this._client.sendRequest(proto.getReferencesToFileInWorkspace, { uri: resource.toString() }, token);
    }
}
exports.MdLanguageClient = MdLanguageClient;
async function startClient(factory, parser) {
    const mdFileGlob = `**/*.{${file_1.markdownFileExtensions.join(',')}}`;
    const clientOptions = {
        documentSelector: [{ language: 'markdown' }],
        synchronize: {
            configurationSection: ['markdown'],
            fileEvents: vscode.workspace.createFileSystemWatcher(mdFileGlob),
        },
        initializationOptions: {
            markdownFileExtensions: file_1.markdownFileExtensions,
            i10lLocation: vscode.l10n.uri?.toJSON(),
        },
        diagnosticPullOptions: {
            onChange: true,
            onTabs: true,
            match(_documentSelector, resource) {
                return (0, file_1.looksLikeMarkdownPath)(resource);
            },
        },
    };
    const client = factory('markdown', vscode.l10n.t("Markdown Language Server"), clientOptions);
    client.registerProposedFeatures();
    const notebookFeature = client.getFeature(vscode_languageclient_1.NotebookDocumentSyncRegistrationType.method);
    if (notebookFeature !== undefined) {
        notebookFeature.register({
            id: String(Date.now()),
            registerOptions: {
                notebookSelector: [{
                        notebook: '*',
                        cells: [{ language: 'markdown' }]
                    }]
            }
        });
    }
    const workspace = new workspace_1.VsCodeMdWorkspace();
    client.onRequest(proto.parse, async (e) => {
        const uri = vscode.Uri.parse(e.uri);
        const doc = await workspace.getOrLoadMarkdownDocument(uri);
        if (doc) {
            return parser.tokenize(doc);
        }
        else {
            return [];
        }
    });
    client.onRequest(proto.fs_readFile, async (e) => {
        const uri = vscode.Uri.parse(e.uri);
        return Array.from(await vscode.workspace.fs.readFile(uri));
    });
    client.onRequest(proto.fs_stat, async (e) => {
        const uri = vscode.Uri.parse(e.uri);
        try {
            const stat = await vscode.workspace.fs.stat(uri);
            return { isDirectory: stat.type === vscode.FileType.Directory };
        }
        catch {
            return undefined;
        }
    });
    client.onRequest(proto.fs_readDirectory, async (e) => {
        const uri = vscode.Uri.parse(e.uri);
        const result = await vscode.workspace.fs.readDirectory(uri);
        return result.map(([name, type]) => [name, { isDirectory: type === vscode.FileType.Directory }]);
    });
    client.onRequest(proto.findMarkdownFilesInWorkspace, async () => {
        return (await vscode.workspace.findFiles(mdFileGlob, '**/node_modules/**')).map(x => x.toString());
    });
    const watchers = new fileWatchingManager_1.FileWatcherManager();
    client.onRequest(proto.fs_watcher_create, async (params) => {
        const id = params.id;
        const uri = vscode.Uri.parse(params.uri);
        const sendWatcherChange = (kind) => {
            client.sendRequest(proto.fs_watcher_onChange, { id, uri: params.uri, kind });
        };
        watchers.create(id, uri, params.watchParentDirs, {
            create: params.options.ignoreCreate ? undefined : () => sendWatcherChange('create'),
            change: params.options.ignoreChange ? undefined : () => sendWatcherChange('change'),
            delete: params.options.ignoreDelete ? undefined : () => sendWatcherChange('delete'),
        });
    });
    client.onRequest(proto.fs_watcher_delete, async (params) => {
        watchers.delete(params.id);
    });
    vscode.commands.registerCommand('vscodeMarkdownLanguageservice.open', (uri, args) => {
        return vscode.commands.executeCommand('vscode.open', uri, args);
    });
    vscode.commands.registerCommand('vscodeMarkdownLanguageservice.rename', (uri, pos) => {
        return vscode.commands.executeCommand('editor.action.rename', [vscode.Uri.from(uri), new vscode.Position(pos.line, pos.character)]);
    });
    await client.start();
    return new MdLanguageClient(client, workspace);
}
exports.startClient = startClient;
//# sourceMappingURL=client.js.map