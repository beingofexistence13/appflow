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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inMemoryResourcePrefix = exports.emptyAuthority = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const diagnostics_1 = require("./languageFeatures/diagnostics");
const protocol_const_1 = require("./tsServer/protocol/protocol.const");
const api_1 = require("./tsServer/api");
const bufferSyncSupport_1 = __importDefault(require("./tsServer/bufferSyncSupport"));
const pluginPathsProvider_1 = require("./tsServer/pluginPathsProvider");
const serverError_1 = require("./tsServer/serverError");
const spawner_1 = require("./tsServer/spawner");
const versionManager_1 = require("./tsServer/versionManager");
const typescriptService_1 = require("./typescriptService");
const configuration_1 = require("./configuration/configuration");
const dispose_1 = require("./utils/dispose");
const fileSchemes = __importStar(require("./configuration/fileSchemes"));
const platform_1 = require("./utils/platform");
const telemetry_1 = require("./logging/telemetry");
const tracer_1 = __importDefault(require("./logging/tracer"));
const tsconfig_1 = require("./tsconfig");
const schemes_1 = require("./configuration/schemes");
const nodeManager_1 = require("./tsServer/nodeManager");
var ServerState;
(function (ServerState) {
    ServerState.None = { type: 0 /* Type.None */ };
    class Running {
        constructor(server, 
        /**
         * API version obtained from the version picker after checking the corresponding path exists.
         */
        apiVersion, 
        /**
         * Version reported by currently-running tsserver.
         */
        tsserverVersion, languageServiceEnabled) {
            this.server = server;
            this.apiVersion = apiVersion;
            this.tsserverVersion = tsserverVersion;
            this.languageServiceEnabled = languageServiceEnabled;
            this.type = 1 /* Type.Running */;
            this.toCancelOnResourceChange = new Set();
        }
        updateTsserverVersion(tsserverVersion) {
            this.tsserverVersion = tsserverVersion;
        }
        updateLanguageServiceEnabled(enabled) {
            this.languageServiceEnabled = enabled;
        }
    }
    ServerState.Running = Running;
    class Errored {
        constructor(error, tsServerLog) {
            this.error = error;
            this.tsServerLog = tsServerLog;
            this.type = 2 /* Type.Errored */;
        }
    }
    ServerState.Errored = Errored;
})(ServerState || (ServerState = {}));
exports.emptyAuthority = 'ts-nul-authority';
exports.inMemoryResourcePrefix = '^';
class TypeScriptServiceClient extends dispose_1.Disposable {
    constructor(context, onCaseInsenitiveFileSystem, services, allModeIds) {
        super();
        this.context = context;
        this.serverState = ServerState.None;
        this._isPromptingAfterCrash = false;
        this.isRestarting = false;
        this.hasServerFatallyCrashedTooManyTimes = false;
        this.loadingIndicator = this._register(new ServerInitializingIndicator());
        this._onDidChangeCapabilities = this._register(new vscode.EventEmitter());
        this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
        this._onTsServerStarted = this._register(new vscode.EventEmitter());
        this.onTsServerStarted = this._onTsServerStarted.event;
        this._onDiagnosticsReceived = this._register(new vscode.EventEmitter());
        this.onDiagnosticsReceived = this._onDiagnosticsReceived.event;
        this._onConfigDiagnosticsReceived = this._register(new vscode.EventEmitter());
        this.onConfigDiagnosticsReceived = this._onConfigDiagnosticsReceived.event;
        this._onResendModelsRequested = this._register(new vscode.EventEmitter());
        this.onResendModelsRequested = this._onResendModelsRequested.event;
        this._onProjectLanguageServiceStateChanged = this._register(new vscode.EventEmitter());
        this.onProjectLanguageServiceStateChanged = this._onProjectLanguageServiceStateChanged.event;
        this._onDidBeginInstallTypings = this._register(new vscode.EventEmitter());
        this.onDidBeginInstallTypings = this._onDidBeginInstallTypings.event;
        this._onDidEndInstallTypings = this._register(new vscode.EventEmitter());
        this.onDidEndInstallTypings = this._onDidEndInstallTypings.event;
        this._onTypesInstallerInitializationFailed = this._register(new vscode.EventEmitter());
        this.onTypesInstallerInitializationFailed = this._onTypesInstallerInitializationFailed.event;
        this._onSurveyReady = this._register(new vscode.EventEmitter());
        this.onSurveyReady = this._onSurveyReady.event;
        this.token = 0;
        this.logger = services.logger;
        this.tracer = new tracer_1.default(this.logger);
        this.pluginManager = services.pluginManager;
        this.logDirectoryProvider = services.logDirectoryProvider;
        this.cancellerFactory = services.cancellerFactory;
        this.versionProvider = services.versionProvider;
        this.processFactory = services.processFactory;
        this.lastStart = Date.now();
        let resolve;
        let reject;
        const p = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        this._onReady = { promise: p, resolve: resolve, reject: reject };
        this.numberRestarts = 0;
        this._configuration = services.serviceConfigurationProvider.loadFromWorkspace();
        this.versionProvider.updateConfiguration(this._configuration);
        this.pluginPathsProvider = new pluginPathsProvider_1.TypeScriptPluginPathsProvider(this._configuration);
        this._versionManager = this._register(new versionManager_1.TypeScriptVersionManager(this._configuration, this.versionProvider, context.workspaceState));
        this._register(this._versionManager.onDidPickNewVersion(() => {
            this.restartTsServer();
        }));
        this._nodeVersionManager = this._register(new nodeManager_1.NodeVersionManager(this._configuration, context.workspaceState));
        this._register(this._nodeVersionManager.onDidPickNewVersion(() => {
            this.restartTsServer();
        }));
        this.bufferSyncSupport = new bufferSyncSupport_1.default(this, allModeIds, onCaseInsenitiveFileSystem);
        this.onReady(() => { this.bufferSyncSupport.listen(); });
        this.bufferSyncSupport.onDelete(resource => {
            this.cancelInflightRequestsForResource(resource);
            this.diagnosticsManager.deleteAllDiagnosticsInFile(resource);
        }, null, this._disposables);
        this.bufferSyncSupport.onWillChange(resource => {
            this.cancelInflightRequestsForResource(resource);
        });
        vscode.workspace.onDidChangeConfiguration(() => {
            const oldConfiguration = this._configuration;
            this._configuration = services.serviceConfigurationProvider.loadFromWorkspace();
            this.versionProvider.updateConfiguration(this._configuration);
            this._versionManager.updateConfiguration(this._configuration);
            this.pluginPathsProvider.updateConfiguration(this._configuration);
            this._nodeVersionManager.updateConfiguration(this._configuration);
            if (this.serverState.type === 1 /* ServerState.Type.Running */) {
                if (!this._configuration.implicitProjectConfiguration.isEqualTo(oldConfiguration.implicitProjectConfiguration)) {
                    this.setCompilerOptionsForInferredProjects(this._configuration);
                }
                if (!(0, configuration_1.areServiceConfigurationsEqual)(this._configuration, oldConfiguration)) {
                    this.restartTsServer();
                }
            }
        }, this, this._disposables);
        this.telemetryReporter = new telemetry_1.VSCodeTelemetryReporter(services.experimentTelemetryReporter, () => {
            if (this.serverState.type === 1 /* ServerState.Type.Running */) {
                if (this.serverState.tsserverVersion) {
                    return this.serverState.tsserverVersion;
                }
            }
            return this.apiVersion.fullVersionString;
        });
        this.diagnosticsManager = new diagnostics_1.DiagnosticsManager('typescript', this._configuration, this.telemetryReporter, onCaseInsenitiveFileSystem);
        this.typescriptServerSpawner = new spawner_1.TypeScriptServerSpawner(this.versionProvider, this._versionManager, this._nodeVersionManager, this.logDirectoryProvider, this.pluginPathsProvider, this.logger, this.telemetryReporter, this.tracer, this.processFactory);
        this._register(this.pluginManager.onDidUpdateConfig(update => {
            this.configurePlugin(update.pluginId, update.config);
        }));
        this._register(this.pluginManager.onDidChangePlugins(() => {
            this.restartTsServer();
        }));
    }
    get capabilities() {
        if (this._configuration.useSyntaxServer === 1 /* SyntaxServerConfiguration.Always */) {
            return new typescriptService_1.ClientCapabilities(typescriptService_1.ClientCapability.Syntax, typescriptService_1.ClientCapability.EnhancedSyntax);
        }
        if ((0, platform_1.isWeb)()) {
            if (this.isProjectWideIntellisenseOnWebEnabled()) {
                return new typescriptService_1.ClientCapabilities(typescriptService_1.ClientCapability.Syntax, typescriptService_1.ClientCapability.EnhancedSyntax, typescriptService_1.ClientCapability.Semantic);
            }
            else {
                return new typescriptService_1.ClientCapabilities(typescriptService_1.ClientCapability.Syntax, typescriptService_1.ClientCapability.EnhancedSyntax);
            }
        }
        if (this.apiVersion.gte(api_1.API.v400)) {
            return new typescriptService_1.ClientCapabilities(typescriptService_1.ClientCapability.Syntax, typescriptService_1.ClientCapability.EnhancedSyntax, typescriptService_1.ClientCapability.Semantic);
        }
        return new typescriptService_1.ClientCapabilities(typescriptService_1.ClientCapability.Syntax, typescriptService_1.ClientCapability.Semantic);
    }
    isProjectWideIntellisenseOnWebEnabled() {
        return (0, platform_1.isWebAndHasSharedArrayBuffers)() && this._configuration.webProjectWideIntellisenseEnabled;
    }
    cancelInflightRequestsForResource(resource) {
        if (this.serverState.type !== 1 /* ServerState.Type.Running */) {
            return;
        }
        for (const request of this.serverState.toCancelOnResourceChange) {
            if (request.resource.toString() === resource.toString()) {
                request.cancel();
            }
        }
    }
    get configuration() {
        return this._configuration;
    }
    dispose() {
        super.dispose();
        this.bufferSyncSupport.dispose();
        if (this.serverState.type === 1 /* ServerState.Type.Running */) {
            this.serverState.server.kill();
        }
        this.loadingIndicator.reset();
    }
    restartTsServer(fromUserAction = false) {
        if (this.serverState.type === 1 /* ServerState.Type.Running */) {
            this.info('Killing TS Server');
            this.isRestarting = true;
            this.serverState.server.kill();
        }
        if (fromUserAction) {
            // Reset crash trackers
            this.hasServerFatallyCrashedTooManyTimes = false;
            this.numberRestarts = 0;
            this.lastStart = Date.now();
        }
        this.serverState = this.startService(true);
    }
    get apiVersion() {
        if (this.serverState.type === 1 /* ServerState.Type.Running */) {
            return this.serverState.apiVersion;
        }
        return api_1.API.defaultVersion;
    }
    onReady(f) {
        return this._onReady.promise.then(f);
    }
    info(message, data) {
        this.logger.info(message, data);
    }
    error(message, data) {
        this.logger.error(message, data);
    }
    logTelemetry(eventName, properties) {
        this.telemetryReporter.logTelemetry(eventName, properties);
    }
    ensureServiceStarted() {
        if (this.serverState.type !== 1 /* ServerState.Type.Running */) {
            this.startService();
        }
    }
    startService(resendModels = false) {
        this.info(`Starting TS Server`);
        if (this.isDisposed) {
            this.info(`Not starting server: disposed`);
            return ServerState.None;
        }
        if (this.hasServerFatallyCrashedTooManyTimes) {
            this.info(`Not starting server: too many crashes`);
            return ServerState.None;
        }
        let version = this._versionManager.currentVersion;
        if (!version.isValid) {
            vscode.window.showWarningMessage(vscode.l10n.t("The path {0} doesn't point to a valid tsserver install. Falling back to bundled TypeScript version.", version.path));
            this._versionManager.reset();
            version = this._versionManager.currentVersion;
        }
        this.info(`Using tsserver from: ${version.path}`);
        const nodePath = this._nodeVersionManager.currentVersion;
        if (nodePath) {
            this.info(`Using Node installation from ${nodePath} to run TS Server`);
        }
        const apiVersion = version.apiVersion || api_1.API.defaultVersion;
        const mytoken = ++this.token;
        const handle = this.typescriptServerSpawner.spawn(version, this.capabilities, this.configuration, this.pluginManager, this.cancellerFactory, {
            onFatalError: (command, err) => this.fatalError(command, err),
        });
        this.serverState = new ServerState.Running(handle, apiVersion, undefined, true);
        this.lastStart = Date.now();
        /* __GDPR__
            "tsserver.spawned" : {
                "owner": "mjbvz",
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ],
                "localTypeScriptVersion": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "typeScriptVersionSource": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
        */
        this.logTelemetry('tsserver.spawned', {
            localTypeScriptVersion: this.versionProvider.localVersion ? this.versionProvider.localVersion.displayName : '',
            typeScriptVersionSource: version.source,
        });
        handle.onError((err) => {
            if (this.token !== mytoken) {
                // this is coming from an old process
                return;
            }
            if (err) {
                vscode.window.showErrorMessage(vscode.l10n.t("TypeScript language server exited with error. Error message is: {0}", err.message || err.name));
            }
            this.serverState = new ServerState.Errored(err, handle.tsServerLog);
            this.error('TSServer errored with error.', err);
            if (handle.tsServerLog?.type === 'file') {
                this.error(`TSServer log file: ${handle.tsServerLog.uri.fsPath}`);
            }
            /* __GDPR__
                "tsserver.error" : {
                    "owner": "mjbvz",
                    "${include}": [
                        "${TypeScriptCommonProperties}"
                    ]
                }
            */
            this.logTelemetry('tsserver.error');
            this.serviceExited(false);
        });
        handle.onExit((data) => {
            const { code, signal } = data;
            this.error(`TSServer exited. Code: ${code}. Signal: ${signal}`);
            // In practice, the exit code is an integer with no ties to any identity,
            // so it can be classified as SystemMetaData, rather than CallstackOrException.
            /* __GDPR__
                "tsserver.exitWithCode" : {
                    "owner": "mjbvz",
                    "code" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "signal" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "${include}": [
                        "${TypeScriptCommonProperties}"
                    ]
                }
            */
            this.logTelemetry('tsserver.exitWithCode', { code: code ?? undefined, signal: signal ?? undefined });
            if (this.token !== mytoken) {
                // this is coming from an old process
                return;
            }
            if (handle.tsServerLog?.type === 'file') {
                this.info(`TSServer log file: ${handle.tsServerLog.uri.fsPath}`);
            }
            this.serviceExited(!this.isRestarting);
            this.isRestarting = false;
        });
        handle.onEvent(event => this.dispatchEvent(event));
        this.serviceStarted(resendModels);
        this._onReady.resolve();
        this._onTsServerStarted.fire({ version: version, usedApiVersion: apiVersion });
        this._onDidChangeCapabilities.fire();
        return this.serverState;
    }
    async showVersionPicker() {
        this._versionManager.promptUserForVersion();
    }
    async openTsServerLogFile() {
        if (this._configuration.tsServerLogLevel === configuration_1.TsServerLogLevel.Off) {
            vscode.window.showErrorMessage(vscode.l10n.t("TS Server logging is off. Please set 'typescript.tsserver.log' and restart the TS server to enable logging"), {
                title: vscode.l10n.t("Enable logging and restart TS server"),
            })
                .then(selection => {
                if (selection) {
                    return vscode.workspace.getConfiguration().update('typescript.tsserver.log', 'verbose', true).then(() => {
                        this.restartTsServer();
                    });
                }
                return undefined;
            });
            return false;
        }
        if (this.serverState.type !== 1 /* ServerState.Type.Running */ || !this.serverState.server.tsServerLog) {
            vscode.window.showWarningMessage(vscode.l10n.t("TS Server has not started logging."));
            return false;
        }
        switch (this.serverState.server.tsServerLog.type) {
            case 'output': {
                this.serverState.server.tsServerLog.output.show();
                return true;
            }
            case 'file': {
                try {
                    const doc = await vscode.workspace.openTextDocument(this.serverState.server.tsServerLog.uri);
                    await vscode.window.showTextDocument(doc);
                    return true;
                }
                catch {
                    // noop
                }
                try {
                    await vscode.commands.executeCommand('revealFileInOS', this.serverState.server.tsServerLog.uri);
                    return true;
                }
                catch {
                    vscode.window.showWarningMessage(vscode.l10n.t("Could not open TS Server log file"));
                    return false;
                }
            }
        }
    }
    serviceStarted(resendModels) {
        this.bufferSyncSupport.reset();
        const watchOptions = this.apiVersion.gte(api_1.API.v380)
            ? this.configuration.watchOptions
            : undefined;
        const configureOptions = {
            hostInfo: 'vscode',
            preferences: {
                providePrefixAndSuffixTextForRename: true,
                allowRenameOfImportPath: true,
                includePackageJsonAutoImports: this._configuration.includePackageJsonAutoImports,
                excludeLibrarySymbolsInNavTo: this._configuration.workspaceSymbolsExcludeLibrarySymbols,
            },
            watchOptions
        };
        this.executeWithoutWaitingForResponse('configure', configureOptions);
        this.setCompilerOptionsForInferredProjects(this._configuration);
        if (resendModels) {
            this._onResendModelsRequested.fire();
            this.bufferSyncSupport.reinitialize();
            this.bufferSyncSupport.requestAllDiagnostics();
        }
        // Reconfigure any plugins
        for (const [pluginName, config] of this.pluginManager.configurations()) {
            this.configurePlugin(pluginName, config);
        }
    }
    setCompilerOptionsForInferredProjects(configuration) {
        const args = {
            options: this.getCompilerOptionsForInferredProjects(configuration)
        };
        this.executeWithoutWaitingForResponse('compilerOptionsForInferredProjects', args);
    }
    getCompilerOptionsForInferredProjects(configuration) {
        return {
            ...(0, tsconfig_1.inferredProjectCompilerOptions)(0 /* ProjectType.TypeScript */, configuration),
            allowJs: true,
            allowSyntheticDefaultImports: true,
            allowNonTsExtensions: true,
            resolveJsonModule: true,
        };
    }
    serviceExited(restart) {
        this.loadingIndicator.reset();
        const previousState = this.serverState;
        this.serverState = ServerState.None;
        if (restart) {
            const diff = Date.now() - this.lastStart;
            this.numberRestarts++;
            let startService = true;
            const pluginExtensionList = this.pluginManager.plugins.map(plugin => plugin.extension.id).join(', ');
            const reportIssueItem = {
                title: vscode.l10n.t("Report Issue"),
            };
            let prompt = undefined;
            if (this.numberRestarts > 5) {
                this.numberRestarts = 0;
                if (diff < 10 * 1000 /* 10 seconds */) {
                    this.lastStart = Date.now();
                    startService = false;
                    this.hasServerFatallyCrashedTooManyTimes = true;
                    if (this.pluginManager.plugins.length) {
                        prompt = vscode.window.showErrorMessage(vscode.l10n.t("The JS/TS language service immediately crashed 5 times. The service will not be restarted.\nThis may be caused by a plugin contributed by one of these extensions: {0}.\nPlease try disabling these extensions before filing an issue against VS Code.", pluginExtensionList));
                    }
                    else {
                        prompt = vscode.window.showErrorMessage(vscode.l10n.t("The JS/TS language service immediately crashed 5 times. The service will not be restarted."), reportIssueItem);
                    }
                    /* __GDPR__
                        "serviceExited" : {
                            "owner": "mjbvz",
                            "${include}": [
                                "${TypeScriptCommonProperties}"
                            ]
                        }
                    */
                    this.logTelemetry('serviceExited');
                }
                else if (diff < 60 * 1000 * 5 /* 5 Minutes */) {
                    this.lastStart = Date.now();
                    if (!this._isPromptingAfterCrash) {
                        if (this.pluginManager.plugins.length) {
                            prompt = vscode.window.showWarningMessage(vscode.l10n.t("The JS/TS language service crashed 5 times in the last 5 Minutes.\nThis may be caused by a plugin contributed by one of these extensions: {0}\nPlease try disabling these extensions before filing an issue against VS Code.", pluginExtensionList));
                        }
                        else {
                            prompt = vscode.window.showWarningMessage(vscode.l10n.t("The JS/TS language service crashed 5 times in the last 5 Minutes."), reportIssueItem);
                        }
                    }
                }
            }
            else if (['vscode-insiders', 'code-oss'].includes(vscode.env.uriScheme)) {
                // Prompt after a single restart
                this.numberRestarts = 0;
                if (!this._isPromptingAfterCrash) {
                    if (this.pluginManager.plugins.length) {
                        prompt = vscode.window.showWarningMessage(vscode.l10n.t("The JS/TS language service crashed.\nThis may be caused by a plugin contributed by one of these extensions: {0}.\nPlease try disabling these extensions before filing an issue against VS Code.", pluginExtensionList));
                    }
                    else {
                        prompt = vscode.window.showWarningMessage(vscode.l10n.t("The JS/TS language service crashed."), reportIssueItem);
                    }
                }
            }
            if (prompt) {
                this._isPromptingAfterCrash = true;
            }
            prompt?.then(item => {
                this._isPromptingAfterCrash = false;
                if (item === reportIssueItem) {
                    const minModernTsVersion = this.versionProvider.bundledVersion.apiVersion;
                    if (minModernTsVersion &&
                        previousState.type === 2 /* ServerState.Type.Errored */ &&
                        previousState.error instanceof serverError_1.TypeScriptServerError &&
                        previousState.error.version.apiVersion?.lt(minModernTsVersion)) {
                        vscode.window.showWarningMessage(vscode.l10n.t("Please update your TypeScript version"), {
                            modal: true,
                            detail: vscode.l10n.t("The workspace is using an old version of TypeScript ({0}).\n\nBefore reporting an issue, please update the workspace to use TypeScript {1} or newer to make sure the bug has not already been fixed.", previousState.error.version.apiVersion.displayName, minModernTsVersion.displayName),
                        });
                    }
                    else {
                        const args = previousState.type === 2 /* ServerState.Type.Errored */ && previousState.error instanceof serverError_1.TypeScriptServerError
                            ? getReportIssueArgsForError(previousState.error, previousState.tsServerLog, this.pluginManager.plugins)
                            : undefined;
                        vscode.commands.executeCommand('workbench.action.openIssueReporter', args);
                    }
                }
            });
            if (startService) {
                this.startService(true);
            }
        }
    }
    toTsFilePath(resource) {
        if (fileSchemes.disabledSchemes.has(resource.scheme)) {
            return undefined;
        }
        if (resource.scheme === fileSchemes.file && !(0, platform_1.isWeb)()) {
            return resource.fsPath;
        }
        return (this.isProjectWideIntellisenseOnWebEnabled() ? '' : exports.inMemoryResourcePrefix)
            + '/' + resource.scheme
            + '/' + (resource.authority || exports.emptyAuthority)
            + (resource.path.startsWith('/') ? resource.path : '/' + resource.path)
            + (resource.fragment ? '#' + resource.fragment : '');
    }
    toOpenTsFilePath(document, options = {}) {
        if (!this.bufferSyncSupport.ensureHasBuffer(document.uri)) {
            if (!options.suppressAlertOnFailure && !fileSchemes.disabledSchemes.has(document.uri.scheme)) {
                console.error(`Unexpected resource ${document.uri}`);
            }
            return undefined;
        }
        return this.toTsFilePath(document.uri);
    }
    hasCapabilityForResource(resource, capability) {
        if (!this.capabilities.has(capability)) {
            return false;
        }
        switch (capability) {
            case typescriptService_1.ClientCapability.Semantic: {
                return fileSchemes.getSemanticSupportedSchemes().includes(resource.scheme);
            }
            case typescriptService_1.ClientCapability.Syntax:
            case typescriptService_1.ClientCapability.EnhancedSyntax: {
                return true;
            }
        }
    }
    toResource(filepath) {
        if ((0, platform_1.isWeb)()) {
            // On web, the stdlib paths that TS return look like: '/lib.es2015.collection.d.ts'
            // TODO: Find out what extensionUri is when testing (should be http://localhost:8080/static/sources/extensions/typescript-language-features/)
            // TODO:  make sure that this code path is getting hit
            if (filepath.startsWith('/lib.') && filepath.endsWith('.d.ts')) {
                return vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'browser', 'typescript', filepath.slice(1));
            }
            const parts = filepath.match(/^\/([^\/]+)\/([^\/]*)\/(.+)$/);
            if (parts) {
                const resource = vscode.Uri.parse(parts[1] + '://' + (parts[2] === exports.emptyAuthority ? '' : parts[2]) + '/' + parts[3]);
                return this.bufferSyncSupport.toVsCodeResource(resource);
            }
        }
        if (filepath.startsWith(exports.inMemoryResourcePrefix)) {
            const parts = filepath.match(/^\^\/([^\/]+)\/([^\/]*)\/(.+)$/);
            if (parts) {
                const resource = vscode.Uri.parse(parts[1] + '://' + (parts[2] === exports.emptyAuthority ? '' : parts[2]) + '/' + parts[3]);
                return this.bufferSyncSupport.toVsCodeResource(resource);
            }
        }
        return this.bufferSyncSupport.toResource(filepath);
    }
    getWorkspaceRootForResource(resource) {
        const roots = vscode.workspace.workspaceFolders ? Array.from(vscode.workspace.workspaceFolders) : undefined;
        if (!roots?.length) {
            return undefined;
        }
        // For notebook cells, we need to use the notebook document to look up the workspace
        if (resource.scheme === schemes_1.Schemes.notebookCell) {
            for (const notebook of vscode.workspace.notebookDocuments) {
                for (const cell of notebook.getCells()) {
                    if (cell.document.uri.toString() === resource.toString()) {
                        resource = notebook.uri;
                        break;
                    }
                }
            }
        }
        for (const root of roots.sort((a, b) => a.uri.fsPath.length - b.uri.fsPath.length)) {
            if (root.uri.scheme === resource.scheme && root.uri.authority === resource.authority) {
                if (resource.fsPath.startsWith(root.uri.fsPath + path.sep)) {
                    return root.uri;
                }
            }
        }
        return vscode.workspace.getWorkspaceFolder(resource)?.uri;
    }
    execute(command, args, token, config) {
        let executions;
        if (config?.cancelOnResourceChange) {
            const runningServerState = this.serverState;
            if (runningServerState.type === 1 /* ServerState.Type.Running */) {
                const source = new vscode.CancellationTokenSource();
                token.onCancellationRequested(() => source.cancel());
                const inFlight = {
                    resource: config.cancelOnResourceChange,
                    cancel: () => source.cancel(),
                };
                runningServerState.toCancelOnResourceChange.add(inFlight);
                executions = this.executeImpl(command, args, {
                    isAsync: false,
                    token: source.token,
                    expectsResult: true,
                    ...config,
                });
                executions[0].finally(() => {
                    runningServerState.toCancelOnResourceChange.delete(inFlight);
                    source.dispose();
                });
            }
        }
        if (!executions) {
            executions = this.executeImpl(command, args, {
                isAsync: false,
                token,
                expectsResult: true,
                ...config,
            });
        }
        if (config?.nonRecoverable) {
            executions[0].catch(err => this.fatalError(command, err));
        }
        if (command === 'updateOpen') {
            // If update open has completed, consider that the project has loaded
            Promise.all(executions).then(() => {
                this.loadingIndicator.reset();
            });
        }
        return executions[0];
    }
    executeWithoutWaitingForResponse(command, args) {
        this.executeImpl(command, args, {
            isAsync: false,
            token: undefined,
            expectsResult: false
        });
    }
    executeAsync(command, args, token) {
        return this.executeImpl(command, args, {
            isAsync: true,
            token,
            expectsResult: true
        })[0];
    }
    executeImpl(command, args, executeInfo) {
        const serverState = this.serverState;
        if (serverState.type === 1 /* ServerState.Type.Running */) {
            this.bufferSyncSupport.beforeCommand(command);
            return serverState.server.executeImpl(command, args, executeInfo);
        }
        else {
            return [Promise.resolve(typescriptService_1.ServerResponse.NoServer)];
        }
    }
    interruptGetErr(f) {
        return this.bufferSyncSupport.interruptGetErr(f);
    }
    fatalError(command, error) {
        /* __GDPR__
            "fatalError" : {
                "owner": "mjbvz",
                "${include}": [
                    "${TypeScriptCommonProperties}",
                    "${TypeScriptRequestErrorProperties}"
                ],
                "command" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
        */
        this.logTelemetry('fatalError', { ...(error instanceof serverError_1.TypeScriptServerError ? error.telemetry : { command }) });
        console.error(`A non-recoverable error occurred while executing tsserver command: ${command}`);
        if (error instanceof serverError_1.TypeScriptServerError && error.serverErrorText) {
            console.error(error.serverErrorText);
        }
        if (this.serverState.type === 1 /* ServerState.Type.Running */) {
            this.info('Killing TS Server');
            const logfile = this.serverState.server.tsServerLog;
            this.serverState.server.kill();
            if (error instanceof serverError_1.TypeScriptServerError) {
                this.serverState = new ServerState.Errored(error, logfile);
            }
        }
    }
    dispatchEvent(event) {
        switch (event.event) {
            case protocol_const_1.EventName.syntaxDiag:
            case protocol_const_1.EventName.semanticDiag:
            case protocol_const_1.EventName.suggestionDiag: {
                // This event also roughly signals that projects have been loaded successfully (since the TS server is synchronous)
                this.loadingIndicator.reset();
                const diagnosticEvent = event;
                if (diagnosticEvent.body?.diagnostics) {
                    this._onDiagnosticsReceived.fire({
                        kind: getDiagnosticsKind(event),
                        resource: this.toResource(diagnosticEvent.body.file),
                        diagnostics: diagnosticEvent.body.diagnostics
                    });
                }
                break;
            }
            case protocol_const_1.EventName.configFileDiag:
                this._onConfigDiagnosticsReceived.fire(event);
                break;
            case protocol_const_1.EventName.telemetry: {
                const body = event.body;
                this.dispatchTelemetryEvent(body);
                break;
            }
            case protocol_const_1.EventName.projectLanguageServiceState: {
                const body = event.body;
                if (this.serverState.type === 1 /* ServerState.Type.Running */) {
                    this.serverState.updateLanguageServiceEnabled(body.languageServiceEnabled);
                }
                this._onProjectLanguageServiceStateChanged.fire(body);
                break;
            }
            case protocol_const_1.EventName.projectsUpdatedInBackground: {
                this.loadingIndicator.reset();
                const body = event.body;
                const resources = body.openFiles.map(file => this.toResource(file));
                this.bufferSyncSupport.getErr(resources);
                break;
            }
            case protocol_const_1.EventName.beginInstallTypes:
                this._onDidBeginInstallTypings.fire(event.body);
                break;
            case protocol_const_1.EventName.endInstallTypes:
                this._onDidEndInstallTypings.fire(event.body);
                break;
            case protocol_const_1.EventName.typesInstallerInitializationFailed:
                this._onTypesInstallerInitializationFailed.fire(event.body);
                break;
            case protocol_const_1.EventName.surveyReady:
                this._onSurveyReady.fire(event.body);
                break;
            case protocol_const_1.EventName.projectLoadingStart:
                this.loadingIndicator.startedLoadingProject(event.body.projectName);
                break;
            case protocol_const_1.EventName.projectLoadingFinish:
                this.loadingIndicator.finishedLoadingProject(event.body.projectName);
                break;
        }
    }
    dispatchTelemetryEvent(telemetryData) {
        const properties = Object.create(null);
        switch (telemetryData.telemetryEventName) {
            case 'typingsInstalled': {
                const typingsInstalledPayload = telemetryData.payload;
                properties['installedPackages'] = typingsInstalledPayload.installedPackages;
                if (typeof typingsInstalledPayload.installSuccess === 'boolean') {
                    properties['installSuccess'] = typingsInstalledPayload.installSuccess.toString();
                }
                if (typeof typingsInstalledPayload.typingsInstallerVersion === 'string') {
                    properties['typingsInstallerVersion'] = typingsInstalledPayload.typingsInstallerVersion;
                }
                break;
            }
            default: {
                const payload = telemetryData.payload;
                if (payload) {
                    Object.keys(payload).forEach((key) => {
                        try {
                            if (payload.hasOwnProperty(key)) {
                                properties[key] = typeof payload[key] === 'string' ? payload[key] : JSON.stringify(payload[key]);
                            }
                        }
                        catch (e) {
                            // noop
                        }
                    });
                }
                break;
            }
        }
        if (telemetryData.telemetryEventName === 'projectInfo') {
            if (this.serverState.type === 1 /* ServerState.Type.Running */) {
                this.serverState.updateTsserverVersion(properties['version']);
            }
        }
        /* __GDPR__
            "typingsInstalled" : {
                "owner": "mjbvz",
                "installedPackages" : { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                "installSuccess": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                "typingsInstallerVersion": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ]
            }
        */
        // __GDPR__COMMENT__: Other events are defined by TypeScript.
        this.logTelemetry(telemetryData.telemetryEventName, properties);
    }
    configurePlugin(pluginName, configuration) {
        if (this.apiVersion.gte(api_1.API.v314)) {
            this.executeWithoutWaitingForResponse('configurePlugin', { pluginName, configuration });
        }
    }
}
exports.default = TypeScriptServiceClient;
function getReportIssueArgsForError(error, tsServerLog, globalPlugins) {
    if (!error.serverStack || !error.serverMessage) {
        return undefined;
    }
    // Note these strings are intentionally not localized
    // as we want users to file issues in english
    const sections = [
        `❗️❗️❗️ Please fill in the sections below to help us diagnose the issue ❗️❗️❗️`,
        `**TypeScript Version:** ${error.version.apiVersion?.fullVersionString}`,
        `**Steps to reproduce crash**

1.
2.
3.`,
    ];
    if (globalPlugins.length) {
        sections.push([
            `**Global TypeScript Server Plugins**`,
            `❗️ Please test with extensions disabled. Extensions are the root cause of most TypeScript server crashes`,
            globalPlugins.map(plugin => `- \`${plugin.name}\` contributed by the \`${plugin.extension.id}\` extension`).join('\n')
        ].join('\n\n'));
    }
    if (tsServerLog?.type === 'file') {
        sections.push(`**TS Server Log**

❗️ Please review and upload this log file to help us diagnose this crash:

\`${tsServerLog.uri.fsPath}\`

The log file may contain personal data, including full paths and source code from your workspace. You can scrub the log file to remove paths or other personal information.
`);
    }
    else {
        sections.push(`**TS Server Log**

❗️ Server logging disabled. To help us fix crashes like this, please enable logging by setting:

\`\`\`json
"typescript.tsserver.log": "verbose"
\`\`\`

After enabling this setting, future crash reports will include the server log.`);
    }
    sections.push(`**TS Server Error Stack**

Server: \`${error.serverId}\`

\`\`\`
${error.serverStack}
\`\`\``);
    return {
        extensionId: 'vscode.typescript-language-features',
        issueTitle: `TS Server fatal error:  ${error.serverMessage}`,
        issueBody: sections.join('\n\n')
    };
}
function getDiagnosticsKind(event) {
    switch (event.event) {
        case 'syntaxDiag': return 0 /* DiagnosticKind.Syntax */;
        case 'semanticDiag': return 1 /* DiagnosticKind.Semantic */;
        case 'suggestionDiag': return 2 /* DiagnosticKind.Suggestion */;
    }
    throw new Error('Unknown dignostics kind');
}
class ServerInitializingIndicator extends dispose_1.Disposable {
    reset() {
        if (this._task) {
            this._task.resolve();
            this._task = undefined;
        }
    }
    /**
     * Signal that a project has started loading.
     */
    startedLoadingProject(projectName) {
        // TS projects are loaded sequentially. Cancel existing task because it should always be resolved before
        // the incoming project loading task is.
        this.reset();
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: vscode.l10n.t("Initializing JS/TS language features"),
        }, () => new Promise(resolve => {
            this._task = { project: projectName, resolve };
        }));
    }
    finishedLoadingProject(projectName) {
        if (this._task && this._task.project === projectName) {
            this._task.resolve();
            this._task = undefined;
        }
    }
}
//# sourceMappingURL=typescriptServiceClient.js.map