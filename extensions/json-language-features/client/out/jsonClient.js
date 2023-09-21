"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.startClient = exports.languageServerDescription = exports.SettingIds = void 0;
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const hash_1 = require("./utils/hash");
const languageStatus_1 = require("./languageStatus");
var VSCodeContentRequest;
(function (VSCodeContentRequest) {
    VSCodeContentRequest.type = new vscode_languageclient_1.RequestType('vscode/content');
})(VSCodeContentRequest || (VSCodeContentRequest = {}));
var SchemaContentChangeNotification;
(function (SchemaContentChangeNotification) {
    SchemaContentChangeNotification.type = new vscode_languageclient_1.NotificationType('json/schemaContent');
})(SchemaContentChangeNotification || (SchemaContentChangeNotification = {}));
var ForceValidateRequest;
(function (ForceValidateRequest) {
    ForceValidateRequest.type = new vscode_languageclient_1.RequestType('json/validate');
})(ForceValidateRequest || (ForceValidateRequest = {}));
var LanguageStatusRequest;
(function (LanguageStatusRequest) {
    LanguageStatusRequest.type = new vscode_languageclient_1.RequestType('json/languageStatus');
})(LanguageStatusRequest || (LanguageStatusRequest = {}));
var DocumentSortingRequest;
(function (DocumentSortingRequest) {
    DocumentSortingRequest.type = new vscode_languageclient_1.RequestType('json/sort');
})(DocumentSortingRequest || (DocumentSortingRequest = {}));
var SchemaAssociationNotification;
(function (SchemaAssociationNotification) {
    SchemaAssociationNotification.type = new vscode_languageclient_1.NotificationType('json/schemaAssociations');
})(SchemaAssociationNotification || (SchemaAssociationNotification = {}));
var SettingIds;
(function (SettingIds) {
    SettingIds.enableFormatter = 'json.format.enable';
    SettingIds.enableKeepLines = 'json.format.keepLines';
    SettingIds.enableValidation = 'json.validate.enable';
    SettingIds.enableSchemaDownload = 'json.schemaDownload.enable';
    SettingIds.maxItemsComputed = 'json.maxItemsComputed';
    SettingIds.editorFoldingMaximumRegions = 'editor.foldingMaximumRegions';
    SettingIds.editorColorDecoratorsLimit = 'editor.colorDecoratorsLimit';
    SettingIds.editorSection = 'editor';
    SettingIds.foldingMaximumRegions = 'foldingMaximumRegions';
    SettingIds.colorDecoratorsLimit = 'colorDecoratorsLimit';
})(SettingIds || (exports.SettingIds = SettingIds = {}));
exports.languageServerDescription = vscode_1.l10n.t('JSON Language Server');
let resultLimit = 5000;
let jsonFoldingLimit = 5000;
let jsoncFoldingLimit = 5000;
let jsonColorDecoratorLimit = 5000;
let jsoncColorDecoratorLimit = 5000;
async function startClient(context, newLanguageClient, runtime) {
    const toDispose = context.subscriptions;
    let rangeFormatting = undefined;
    const documentSelector = ['json', 'jsonc'];
    const schemaResolutionErrorStatusBarItem = vscode_1.window.createStatusBarItem('status.json.resolveError', vscode_1.StatusBarAlignment.Right, 0);
    schemaResolutionErrorStatusBarItem.name = vscode_1.l10n.t('JSON: Schema Resolution Error');
    schemaResolutionErrorStatusBarItem.text = '$(alert)';
    toDispose.push(schemaResolutionErrorStatusBarItem);
    const fileSchemaErrors = new Map();
    let schemaDownloadEnabled = true;
    let isClientReady = false;
    const documentSymbolsLimitStatusbarItem = (0, languageStatus_1.createLimitStatusItem)((limit) => (0, languageStatus_1.createDocumentSymbolsLimitItem)(documentSelector, SettingIds.maxItemsComputed, limit));
    toDispose.push(documentSymbolsLimitStatusbarItem);
    toDispose.push(vscode_1.commands.registerCommand('json.clearCache', async () => {
        if (isClientReady && runtime.schemaRequests.clearCache) {
            const cachedSchemas = await runtime.schemaRequests.clearCache();
            await client.sendNotification(SchemaContentChangeNotification.type, cachedSchemas);
        }
        vscode_1.window.showInformationMessage(vscode_1.l10n.t('JSON schema cache cleared.'));
    }));
    toDispose.push(vscode_1.commands.registerCommand('json.sort', async () => {
        if (isClientReady) {
            const textEditor = vscode_1.window.activeTextEditor;
            if (textEditor) {
                const documentOptions = textEditor.options;
                const textEdits = await getSortTextEdits(textEditor.document, documentOptions.tabSize, documentOptions.insertSpaces);
                const success = await textEditor.edit(mutator => {
                    for (const edit of textEdits) {
                        mutator.replace(client.protocol2CodeConverter.asRange(edit.range), edit.newText);
                    }
                });
                if (!success) {
                    vscode_1.window.showErrorMessage(vscode_1.l10n.t('Failed to sort the JSONC document, please consider opening an issue.'));
                }
            }
        }
    }));
    // Options to control the language client
    const clientOptions = {
        // Register the server for json documents
        documentSelector,
        initializationOptions: {
            handledSchemaProtocols: ['file'],
            provideFormatter: false,
            customCapabilities: { rangeFormatting: { editLimit: 10000 } }
        },
        synchronize: {
            // Synchronize the setting section 'json' to the server
            configurationSection: ['json', 'http'],
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/*.json')
        },
        middleware: {
            workspace: {
                didChangeConfiguration: () => client.sendNotification(vscode_languageclient_1.DidChangeConfigurationNotification.type, { settings: getSettings() })
            },
            handleDiagnostics: (uri, diagnostics, next) => {
                const schemaErrorIndex = diagnostics.findIndex(isSchemaResolveError);
                if (schemaErrorIndex === -1) {
                    fileSchemaErrors.delete(uri.toString());
                    return next(uri, diagnostics);
                }
                const schemaResolveDiagnostic = diagnostics[schemaErrorIndex];
                fileSchemaErrors.set(uri.toString(), schemaResolveDiagnostic.message);
                if (!schemaDownloadEnabled) {
                    diagnostics = diagnostics.filter(d => !isSchemaResolveError(d));
                }
                if (vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document.uri.toString() === uri.toString()) {
                    schemaResolutionErrorStatusBarItem.show();
                }
                next(uri, diagnostics);
            },
            // testing the replace / insert mode
            provideCompletionItem(document, position, context, token, next) {
                function update(item) {
                    const range = item.range;
                    if (range instanceof vscode_1.Range && range.end.isAfter(position) && range.start.isBeforeOrEqual(position)) {
                        item.range = { inserting: new vscode_1.Range(range.start, position), replacing: range };
                    }
                    if (item.documentation instanceof vscode_1.MarkdownString) {
                        item.documentation = updateMarkdownString(item.documentation);
                    }
                }
                function updateProposals(r) {
                    if (r) {
                        (Array.isArray(r) ? r : r.items).forEach(update);
                    }
                    return r;
                }
                const r = next(document, position, context, token);
                if (isThenable(r)) {
                    return r.then(updateProposals);
                }
                return updateProposals(r);
            },
            provideHover(document, position, token, next) {
                function updateHover(r) {
                    if (r && Array.isArray(r.contents)) {
                        r.contents = r.contents.map(h => h instanceof vscode_1.MarkdownString ? updateMarkdownString(h) : h);
                    }
                    return r;
                }
                const r = next(document, position, token);
                if (isThenable(r)) {
                    return r.then(updateHover);
                }
                return updateHover(r);
            },
            provideFoldingRanges(document, context, token, next) {
                const r = next(document, context, token);
                if (isThenable(r)) {
                    return r;
                }
                return r;
            },
            provideDocumentColors(document, token, next) {
                const r = next(document, token);
                if (isThenable(r)) {
                    return r;
                }
                return r;
            },
            provideDocumentSymbols(document, token, next) {
                function countDocumentSymbols(symbols) {
                    return symbols.reduce((previousValue, s) => previousValue + 1 + countDocumentSymbols(s.children), 0);
                }
                function isDocumentSymbol(r) {
                    return r[0] instanceof vscode_1.DocumentSymbol;
                }
                function checkLimit(r) {
                    if (Array.isArray(r) && (isDocumentSymbol(r) ? countDocumentSymbols(r) : r.length) > resultLimit) {
                        documentSymbolsLimitStatusbarItem.update(document, resultLimit);
                    }
                    else {
                        documentSymbolsLimitStatusbarItem.update(document, false);
                    }
                    return r;
                }
                const r = next(document, token);
                if (isThenable(r)) {
                    return r.then(checkLimit);
                }
                return checkLimit(r);
            }
        }
    };
    // Create the language client and start the client.
    const client = newLanguageClient('json', exports.languageServerDescription, clientOptions);
    client.registerProposedFeatures();
    const schemaDocuments = {};
    // handle content request
    client.onRequest(VSCodeContentRequest.type, (uriPath) => {
        const uri = vscode_1.Uri.parse(uriPath);
        if (uri.scheme === 'untitled') {
            return Promise.reject(new vscode_languageclient_1.ResponseError(3, vscode_1.l10n.t('Unable to load {0}', uri.toString())));
        }
        if (uri.scheme !== 'http' && uri.scheme !== 'https') {
            return vscode_1.workspace.openTextDocument(uri).then(doc => {
                schemaDocuments[uri.toString()] = true;
                return doc.getText();
            }, error => {
                return Promise.reject(new vscode_languageclient_1.ResponseError(2, error.toString()));
            });
        }
        else if (schemaDownloadEnabled) {
            if (runtime.telemetry && uri.authority === 'schema.management.azure.com') {
                /* __GDPR__
                    "json.schema" : {
                        "owner": "aeschli",
                        "comment": "Measure the use of the Azure resource manager schemas",
                        "schemaURL" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The azure schema URL that was requested." }
                    }
                */
                runtime.telemetry.sendTelemetryEvent('json.schema', { schemaURL: uriPath });
            }
            return runtime.schemaRequests.getContent(uriPath).catch(e => {
                return Promise.reject(new vscode_languageclient_1.ResponseError(4, e.toString()));
            });
        }
        else {
            return Promise.reject(new vscode_languageclient_1.ResponseError(1, vscode_1.l10n.t('Downloading schemas is disabled through setting \'{0}\'', SettingIds.enableSchemaDownload)));
        }
    });
    await client.start();
    isClientReady = true;
    const handleContentChange = (uriString) => {
        if (schemaDocuments[uriString]) {
            client.sendNotification(SchemaContentChangeNotification.type, uriString);
            return true;
        }
        return false;
    };
    const handleActiveEditorChange = (activeEditor) => {
        if (!activeEditor) {
            return;
        }
        const activeDocUri = activeEditor.document.uri.toString();
        if (activeDocUri && fileSchemaErrors.has(activeDocUri)) {
            schemaResolutionErrorStatusBarItem.show();
        }
        else {
            schemaResolutionErrorStatusBarItem.hide();
        }
    };
    toDispose.push(vscode_1.workspace.onDidChangeTextDocument(e => handleContentChange(e.document.uri.toString())));
    toDispose.push(vscode_1.workspace.onDidCloseTextDocument(d => {
        const uriString = d.uri.toString();
        if (handleContentChange(uriString)) {
            delete schemaDocuments[uriString];
        }
        fileSchemaErrors.delete(uriString);
    }));
    toDispose.push(vscode_1.window.onDidChangeActiveTextEditor(handleActiveEditorChange));
    const handleRetryResolveSchemaCommand = () => {
        if (vscode_1.window.activeTextEditor) {
            schemaResolutionErrorStatusBarItem.text = '$(watch)';
            const activeDocUri = vscode_1.window.activeTextEditor.document.uri.toString();
            client.sendRequest(ForceValidateRequest.type, activeDocUri).then((diagnostics) => {
                const schemaErrorIndex = diagnostics.findIndex(isSchemaResolveError);
                if (schemaErrorIndex !== -1) {
                    // Show schema resolution errors in status bar only; ref: #51032
                    const schemaResolveDiagnostic = diagnostics[schemaErrorIndex];
                    fileSchemaErrors.set(activeDocUri, schemaResolveDiagnostic.message);
                }
                else {
                    schemaResolutionErrorStatusBarItem.hide();
                }
                schemaResolutionErrorStatusBarItem.text = '$(alert)';
            });
        }
    };
    toDispose.push(vscode_1.commands.registerCommand('_json.retryResolveSchema', handleRetryResolveSchemaCommand));
    client.sendNotification(SchemaAssociationNotification.type, getSchemaAssociations(context));
    toDispose.push(vscode_1.extensions.onDidChange(_ => {
        client.sendNotification(SchemaAssociationNotification.type, getSchemaAssociations(context));
    }));
    // manually register / deregister format provider based on the `json.format.enable` setting avoiding issues with late registration. See #71652.
    updateFormatterRegistration();
    toDispose.push({ dispose: () => rangeFormatting && rangeFormatting.dispose() });
    updateSchemaDownloadSetting();
    toDispose.push(vscode_1.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(SettingIds.enableFormatter)) {
            updateFormatterRegistration();
        }
        else if (e.affectsConfiguration(SettingIds.enableSchemaDownload)) {
            updateSchemaDownloadSetting();
        }
        else if (e.affectsConfiguration(SettingIds.editorFoldingMaximumRegions) || e.affectsConfiguration(SettingIds.editorColorDecoratorsLimit)) {
            client.sendNotification(vscode_languageclient_1.DidChangeConfigurationNotification.type, { settings: getSettings() });
        }
    }));
    toDispose.push((0, languageStatus_1.createLanguageStatusItem)(documentSelector, (uri) => client.sendRequest(LanguageStatusRequest.type, uri)));
    function updateFormatterRegistration() {
        const formatEnabled = vscode_1.workspace.getConfiguration().get(SettingIds.enableFormatter);
        if (!formatEnabled && rangeFormatting) {
            rangeFormatting.dispose();
            rangeFormatting = undefined;
        }
        else if (formatEnabled && !rangeFormatting) {
            rangeFormatting = vscode_1.languages.registerDocumentRangeFormattingEditProvider(documentSelector, {
                provideDocumentRangeFormattingEdits(document, range, options, token) {
                    const filesConfig = vscode_1.workspace.getConfiguration('files', document);
                    const fileFormattingOptions = {
                        trimTrailingWhitespace: filesConfig.get('trimTrailingWhitespace'),
                        trimFinalNewlines: filesConfig.get('trimFinalNewlines'),
                        insertFinalNewline: filesConfig.get('insertFinalNewline'),
                    };
                    const params = {
                        textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(document),
                        range: client.code2ProtocolConverter.asRange(range),
                        options: client.code2ProtocolConverter.asFormattingOptions(options, fileFormattingOptions)
                    };
                    return client.sendRequest(vscode_languageclient_1.DocumentRangeFormattingRequest.type, params, token).then(client.protocol2CodeConverter.asTextEdits, (error) => {
                        client.handleFailedRequest(vscode_languageclient_1.DocumentRangeFormattingRequest.type, undefined, error, []);
                        return Promise.resolve([]);
                    });
                }
            });
        }
    }
    function updateSchemaDownloadSetting() {
        schemaDownloadEnabled = vscode_1.workspace.getConfiguration().get(SettingIds.enableSchemaDownload) !== false;
        if (schemaDownloadEnabled) {
            schemaResolutionErrorStatusBarItem.tooltip = vscode_1.l10n.t('Unable to resolve schema. Click to retry.');
            schemaResolutionErrorStatusBarItem.command = '_json.retryResolveSchema';
            handleRetryResolveSchemaCommand();
        }
        else {
            schemaResolutionErrorStatusBarItem.tooltip = vscode_1.l10n.t('Downloading schemas is disabled. Click to configure.');
            schemaResolutionErrorStatusBarItem.command = { command: 'workbench.action.openSettings', arguments: [SettingIds.enableSchemaDownload], title: '' };
        }
    }
    async function getSortTextEdits(document, tabSize = 4, insertSpaces = true) {
        const filesConfig = vscode_1.workspace.getConfiguration('files', document);
        const options = {
            tabSize: Number(tabSize),
            insertSpaces: Boolean(insertSpaces),
            trimTrailingWhitespace: filesConfig.get('trimTrailingWhitespace'),
            trimFinalNewlines: filesConfig.get('trimFinalNewlines'),
            insertFinalNewline: filesConfig.get('insertFinalNewline'),
        };
        const params = {
            uri: document.uri.toString(),
            options
        };
        const edits = await client.sendRequest(DocumentSortingRequest.type, params);
        // Here we convert the JSON objects to real TextEdit objects
        return edits.map((edit) => {
            return new vscode_1.TextEdit(new vscode_1.Range(edit.range.start.line, edit.range.start.character, edit.range.end.line, edit.range.end.character), edit.newText);
        });
    }
    return client;
}
exports.startClient = startClient;
function getSchemaAssociations(_context) {
    const associations = [];
    vscode_1.extensions.all.forEach(extension => {
        const packageJSON = extension.packageJSON;
        if (packageJSON && packageJSON.contributes && packageJSON.contributes.jsonValidation) {
            const jsonValidation = packageJSON.contributes.jsonValidation;
            if (Array.isArray(jsonValidation)) {
                jsonValidation.forEach(jv => {
                    let { fileMatch, url } = jv;
                    if (typeof fileMatch === 'string') {
                        fileMatch = [fileMatch];
                    }
                    if (Array.isArray(fileMatch) && typeof url === 'string') {
                        let uri = url;
                        if (uri[0] === '.' && uri[1] === '/') {
                            uri = vscode_1.Uri.joinPath(extension.extensionUri, uri).toString();
                        }
                        fileMatch = fileMatch.map(fm => {
                            if (fm[0] === '%') {
                                fm = fm.replace(/%APP_SETTINGS_HOME%/, '/User');
                                fm = fm.replace(/%MACHINE_SETTINGS_HOME%/, '/Machine');
                                fm = fm.replace(/%APP_WORKSPACES_HOME%/, '/Workspaces');
                            }
                            else if (!fm.match(/^(\w+:\/\/|\/|!)/)) {
                                fm = '/' + fm;
                            }
                            return fm;
                        });
                        associations.push({ fileMatch, uri });
                    }
                });
            }
        }
    });
    return associations;
}
function getSettings() {
    const configuration = vscode_1.workspace.getConfiguration();
    const httpSettings = vscode_1.workspace.getConfiguration('http');
    const normalizeLimit = (settingValue) => Math.trunc(Math.max(0, Number(settingValue))) || 5000;
    resultLimit = normalizeLimit(vscode_1.workspace.getConfiguration().get(SettingIds.maxItemsComputed));
    const editorJSONSettings = vscode_1.workspace.getConfiguration(SettingIds.editorSection, { languageId: 'json' });
    const editorJSONCSettings = vscode_1.workspace.getConfiguration(SettingIds.editorSection, { languageId: 'jsonc' });
    jsonFoldingLimit = normalizeLimit(editorJSONSettings.get(SettingIds.foldingMaximumRegions));
    jsoncFoldingLimit = normalizeLimit(editorJSONCSettings.get(SettingIds.foldingMaximumRegions));
    jsonColorDecoratorLimit = normalizeLimit(editorJSONSettings.get(SettingIds.colorDecoratorsLimit));
    jsoncColorDecoratorLimit = normalizeLimit(editorJSONCSettings.get(SettingIds.colorDecoratorsLimit));
    const schemas = [];
    const settings = {
        http: {
            proxy: httpSettings.get('proxy'),
            proxyStrictSSL: httpSettings.get('proxyStrictSSL')
        },
        json: {
            validate: { enable: configuration.get(SettingIds.enableValidation) },
            format: { enable: configuration.get(SettingIds.enableFormatter) },
            keepLines: { enable: configuration.get(SettingIds.enableKeepLines) },
            schemas,
            resultLimit: resultLimit + 1,
            jsonFoldingLimit: jsonFoldingLimit + 1,
            jsoncFoldingLimit: jsoncFoldingLimit + 1,
            jsonColorDecoratorLimit: jsonColorDecoratorLimit + 1,
            jsoncColorDecoratorLimit: jsoncColorDecoratorLimit + 1
        }
    };
    /*
     * Add schemas from the settings
     * folderUri to which folder the setting is scoped to. `undefined` means global (also external files)
     * settingsLocation against which path relative schema URLs are resolved
     */
    const collectSchemaSettings = (schemaSettings, folderUri, settingsLocation) => {
        if (schemaSettings) {
            for (const setting of schemaSettings) {
                const url = getSchemaId(setting, settingsLocation);
                if (url) {
                    const schemaSetting = { url, fileMatch: setting.fileMatch, folderUri, schema: setting.schema };
                    schemas.push(schemaSetting);
                }
            }
        }
    };
    const folders = vscode_1.workspace.workspaceFolders ?? [];
    const schemaConfigInfo = vscode_1.workspace.getConfiguration('json', null).inspect('schemas');
    if (schemaConfigInfo) {
        // settings in user config
        collectSchemaSettings(schemaConfigInfo.globalValue, undefined, undefined);
        if (vscode_1.workspace.workspaceFile) {
            if (schemaConfigInfo.workspaceValue) {
                const settingsLocation = vscode_1.Uri.joinPath(vscode_1.workspace.workspaceFile, '..');
                // settings in the workspace configuration file apply to all files (also external files)
                collectSchemaSettings(schemaConfigInfo.workspaceValue, undefined, settingsLocation);
            }
            for (const folder of folders) {
                const folderUri = folder.uri;
                const folderSchemaConfigInfo = vscode_1.workspace.getConfiguration('json', folderUri).inspect('schemas');
                collectSchemaSettings(folderSchemaConfigInfo?.workspaceFolderValue, folderUri.toString(false), folderUri);
            }
        }
        else {
            if (schemaConfigInfo.workspaceValue && folders.length === 1) {
                // single folder workspace: settings apply to all files (also external files)
                collectSchemaSettings(schemaConfigInfo.workspaceValue, undefined, folders[0].uri);
            }
        }
    }
    return settings;
}
function getSchemaId(schema, settingsLocation) {
    let url = schema.url;
    if (!url) {
        if (schema.schema) {
            url = schema.schema.id || `vscode://schemas/custom/${encodeURIComponent((0, hash_1.hash)(schema.schema).toString(16))}`;
        }
    }
    else if (settingsLocation && (url[0] === '.' || url[0] === '/')) {
        url = vscode_1.Uri.joinPath(settingsLocation, url).toString(false);
    }
    return url;
}
function isThenable(obj) {
    return obj && obj['then'];
}
function updateMarkdownString(h) {
    const n = new vscode_1.MarkdownString(h.value, true);
    n.isTrusted = h.isTrusted;
    return n;
}
function isSchemaResolveError(d) {
    return d.code === /* SchemaResolveError */ 0x300;
}
//# sourceMappingURL=jsonClient.js.map