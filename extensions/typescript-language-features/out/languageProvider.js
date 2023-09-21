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
const path_1 = require("path");
const vscode = __importStar(require("vscode"));
const fileSchemes = __importStar(require("./configuration/fileSchemes"));
const cachedResponse_1 = require("./tsServer/cachedResponse");
const typescriptService_1 = require("./typescriptService");
const dispose_1 = require("./utils/dispose");
const platform_1 = require("./utils/platform");
const validateSetting = 'validate.enable';
const suggestionSetting = 'suggestionActions.enabled';
class LanguageProvider extends dispose_1.Disposable {
    constructor(client, description, commandManager, telemetryReporter, typingsStatus, fileConfigurationManager, onCompletionAccepted) {
        super();
        this.client = client;
        this.description = description;
        this.commandManager = commandManager;
        this.telemetryReporter = telemetryReporter;
        this.typingsStatus = typingsStatus;
        this.fileConfigurationManager = fileConfigurationManager;
        this.onCompletionAccepted = onCompletionAccepted;
        vscode.workspace.onDidChangeConfiguration(this.configurationChanged, this, this._disposables);
        this.configurationChanged();
        client.onReady(() => this.registerProviders());
    }
    get documentSelector() {
        const semantic = [];
        const syntax = [];
        for (const language of this.description.languageIds) {
            syntax.push({ language });
            for (const scheme of fileSchemes.getSemanticSupportedSchemes()) {
                semantic.push({ language, scheme });
            }
        }
        return { semantic, syntax };
    }
    async registerProviders() {
        const selector = this.documentSelector;
        const cachedResponse = new cachedResponse_1.CachedResponse();
        await Promise.all([
            Promise.resolve().then(() => __importStar(require('./languageFeatures/callHierarchy'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/codeLens/implementationsCodeLens'))).then(provider => this._register(provider.register(selector, this.description, this.client, cachedResponse))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/codeLens/referencesCodeLens'))).then(provider => this._register(provider.register(selector, this.description, this.client, cachedResponse))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/completions'))).then(provider => this._register(provider.register(selector, this.description, this.client, this.typingsStatus, this.fileConfigurationManager, this.commandManager, this.telemetryReporter, this.onCompletionAccepted))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/definitions'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/directiveCommentCompletions'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/documentHighlight'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/documentSymbol'))).then(provider => this._register(provider.register(selector, this.client, cachedResponse))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/fileReferences'))).then(provider => this._register(provider.register(this.client, this.commandManager))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/fixAll'))).then(provider => this._register(provider.register(selector, this.client, this.fileConfigurationManager, this.client.diagnosticsManager))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/folding'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/formatting'))).then(provider => this._register(provider.register(selector, this.description, this.client, this.fileConfigurationManager))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/hover'))).then(provider => this._register(provider.register(selector, this.client, this.fileConfigurationManager))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/implementations'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/inlayHints'))).then(provider => this._register(provider.register(selector, this.description, this.client, this.fileConfigurationManager, this.telemetryReporter))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/jsDocCompletions'))).then(provider => this._register(provider.register(selector, this.description, this.client, this.fileConfigurationManager))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/linkedEditing'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/organizeImports'))).then(provider => this._register(provider.register(selector, this.client, this.commandManager, this.fileConfigurationManager, this.telemetryReporter))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/quickFix'))).then(provider => this._register(provider.register(selector, this.client, this.fileConfigurationManager, this.commandManager, this.client.diagnosticsManager, this.telemetryReporter))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/refactor'))).then(provider => this._register(provider.register(selector, this.client, this.fileConfigurationManager, this.commandManager, this.telemetryReporter))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/references'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/rename'))).then(provider => this._register(provider.register(selector, this.description, this.client, this.fileConfigurationManager))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/semanticTokens'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/signatureHelp'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/smartSelect'))).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/sourceDefinition'))).then(provider => this._register(provider.register(this.client, this.commandManager))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/tagClosing'))).then(provider => this._register(provider.register(selector, this.description, this.client))),
            Promise.resolve().then(() => __importStar(require('./languageFeatures/typeDefinitions'))).then(provider => this._register(provider.register(selector, this.client))),
        ]);
    }
    configurationChanged() {
        const config = vscode.workspace.getConfiguration(this.id, null);
        this.updateValidate(config.get(validateSetting, true));
        this.updateSuggestionDiagnostics(config.get(suggestionSetting, true));
    }
    handlesUri(resource) {
        const ext = (0, path_1.extname)(resource.path).slice(1).toLowerCase();
        return this.description.standardFileExtensions.includes(ext) || this.handlesConfigFile(resource);
    }
    handlesDocument(doc) {
        return this.description.languageIds.includes(doc.languageId) || this.handlesConfigFile(doc.uri);
    }
    handlesConfigFile(resource) {
        const base = (0, path_1.basename)(resource.fsPath);
        return !!base && (!!this.description.configFilePattern && this.description.configFilePattern.test(base));
    }
    get id() {
        return this.description.id;
    }
    get diagnosticSource() {
        return this.description.diagnosticSource;
    }
    updateValidate(value) {
        this.client.diagnosticsManager.setValidate(this._diagnosticLanguage, value);
    }
    updateSuggestionDiagnostics(value) {
        this.client.diagnosticsManager.setEnableSuggestions(this._diagnosticLanguage, value);
    }
    reInitialize() {
        this.client.diagnosticsManager.reInitialize();
    }
    triggerAllDiagnostics() {
        this.client.bufferSyncSupport.requestAllDiagnostics();
    }
    diagnosticsReceived(diagnosticsKind, file, diagnostics) {
        if (diagnosticsKind !== 0 /* DiagnosticKind.Syntax */ && !this.client.hasCapabilityForResource(file, typescriptService_1.ClientCapability.Semantic)) {
            return;
        }
        if (diagnosticsKind === 1 /* DiagnosticKind.Semantic */ && (0, platform_1.isWeb)() && this.client.configuration.webProjectWideIntellisenseSuppressSemanticErrors) {
            return;
        }
        const config = vscode.workspace.getConfiguration(this.id, file);
        const reportUnnecessary = config.get('showUnused', true);
        const reportDeprecated = config.get('showDeprecated', true);
        this.client.diagnosticsManager.updateDiagnostics(file, this._diagnosticLanguage, diagnosticsKind, diagnostics.filter(diag => {
            // Don't bother reporting diagnostics we know will not be rendered
            if (!reportUnnecessary) {
                if (diag.reportUnnecessary && diag.severity === vscode.DiagnosticSeverity.Hint) {
                    return false;
                }
            }
            if (!reportDeprecated) {
                if (diag.reportDeprecated && diag.severity === vscode.DiagnosticSeverity.Hint) {
                    return false;
                }
            }
            return true;
        }));
    }
    configFileDiagnosticsReceived(file, diagnostics) {
        this.client.diagnosticsManager.configFileDiagnosticsReceived(file, diagnostics);
    }
    get _diagnosticLanguage() {
        return this.description.diagnosticLanguage;
    }
}
exports.default = LanguageProvider;
//# sourceMappingURL=languageProvider.js.map