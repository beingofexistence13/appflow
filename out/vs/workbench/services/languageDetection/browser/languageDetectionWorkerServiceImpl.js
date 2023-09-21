/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/base/common/network", "vs/workbench/services/environment/common/environmentService", "vs/platform/configuration/common/configuration", "vs/editor/common/languages/language", "vs/base/common/uri", "vs/base/common/platform", "vs/platform/instantiation/common/extensions", "vs/editor/common/services/model", "vs/base/common/worker/simpleWorker", "vs/platform/telemetry/common/telemetry", "vs/editor/browser/services/editorWorkerService", "vs/editor/common/languages/languageConfigurationRegistry", "vs/platform/diagnostics/common/diagnostics", "vs/platform/workspace/common/workspace", "vs/workbench/services/editor/common/editorService", "vs/platform/storage/common/storage", "vs/base/common/map", "vs/platform/log/common/log"], function (require, exports, lifecycle_1, languageDetectionWorkerService_1, network_1, environmentService_1, configuration_1, language_1, uri_1, platform_1, extensions_1, model_1, simpleWorker_1, telemetry_1, editorWorkerService_1, languageConfigurationRegistry_1, diagnostics_1, workspace_1, editorService_1, storage_1, map_1, log_1) {
    "use strict";
    var LanguageDetectionService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageDetectionWorkerClient = exports.LanguageDetectionWorkerHost = exports.LanguageDetectionService = void 0;
    const TOP_LANG_COUNTS = 12;
    const regexpModuleLocation = `${network_1.nodeModulesPath}/vscode-regexp-languagedetection`;
    const regexpModuleLocationAsar = `${network_1.nodeModulesAsarPath}/vscode-regexp-languagedetection`;
    const moduleLocation = `${network_1.nodeModulesPath}/@vscode/vscode-languagedetection`;
    const moduleLocationAsar = `${network_1.nodeModulesAsarPath}/@vscode/vscode-languagedetection`;
    let LanguageDetectionService = class LanguageDetectionService extends lifecycle_1.Disposable {
        static { LanguageDetectionService_1 = this; }
        static { this.enablementSettingKey = 'workbench.editor.languageDetection'; }
        static { this.historyBasedEnablementConfig = 'workbench.editor.historyBasedLanguageDetection'; }
        static { this.preferHistoryConfig = 'workbench.editor.preferHistoryBasedLanguageDetection'; }
        static { this.workspaceOpenedLanguagesStorageKey = 'workbench.editor.languageDetectionOpenedLanguages.workspace'; }
        static { this.globalOpenedLanguagesStorageKey = 'workbench.editor.languageDetectionOpenedLanguages.global'; }
        constructor(_environmentService, languageService, _configurationService, _diagnosticsService, _workspaceContextService, modelService, _editorService, telemetryService, storageService, _logService, languageConfigurationService) {
            super();
            this._environmentService = _environmentService;
            this._configurationService = _configurationService;
            this._diagnosticsService = _diagnosticsService;
            this._workspaceContextService = _workspaceContextService;
            this._editorService = _editorService;
            this._logService = _logService;
            this.hasResolvedWorkspaceLanguageIds = false;
            this.workspaceLanguageIds = new Set();
            this.sessionOpenedLanguageIds = new Set();
            this.historicalGlobalOpenedLanguageIds = new map_1.LRUCache(TOP_LANG_COUNTS);
            this.historicalWorkspaceOpenedLanguageIds = new map_1.LRUCache(TOP_LANG_COUNTS);
            this.dirtyBiases = true;
            this.langBiases = {};
            this._languageDetectionWorkerClient = this._register(new LanguageDetectionWorkerClient(modelService, languageService, telemetryService, 
            // TODO: See if it's possible to bundle vscode-languagedetection
            this._environmentService.isBuilt && !platform_1.isWeb
                ? network_1.FileAccess.asBrowserUri(`${moduleLocationAsar}/dist/lib/index.js`).toString(true)
                : network_1.FileAccess.asBrowserUri(`${moduleLocation}/dist/lib/index.js`).toString(true), this._environmentService.isBuilt && !platform_1.isWeb
                ? network_1.FileAccess.asBrowserUri(`${moduleLocationAsar}/model/model.json`).toString(true)
                : network_1.FileAccess.asBrowserUri(`${moduleLocation}/model/model.json`).toString(true), this._environmentService.isBuilt && !platform_1.isWeb
                ? network_1.FileAccess.asBrowserUri(`${moduleLocationAsar}/model/group1-shard1of1.bin`).toString(true)
                : network_1.FileAccess.asBrowserUri(`${moduleLocation}/model/group1-shard1of1.bin`).toString(true), this._environmentService.isBuilt && !platform_1.isWeb
                ? network_1.FileAccess.asBrowserUri(`${regexpModuleLocationAsar}/dist/index.js`).toString(true)
                : network_1.FileAccess.asBrowserUri(`${regexpModuleLocation}/dist/index.js`).toString(true), languageConfigurationService));
            this.initEditorOpenedListeners(storageService);
        }
        async resolveWorkspaceLanguageIds() {
            if (this.hasResolvedWorkspaceLanguageIds) {
                return;
            }
            this.hasResolvedWorkspaceLanguageIds = true;
            const fileExtensions = await this._diagnosticsService.getWorkspaceFileExtensions(this._workspaceContextService.getWorkspace());
            let count = 0;
            for (const ext of fileExtensions.extensions) {
                const langId = this._languageDetectionWorkerClient.getLanguageId(ext);
                if (langId && count < TOP_LANG_COUNTS) {
                    this.workspaceLanguageIds.add(langId);
                    count++;
                    if (count > TOP_LANG_COUNTS) {
                        break;
                    }
                }
            }
            this.dirtyBiases = true;
        }
        isEnabledForLanguage(languageId) {
            return !!languageId && this._configurationService.getValue(LanguageDetectionService_1.enablementSettingKey, { overrideIdentifier: languageId });
        }
        getLanguageBiases() {
            if (!this.dirtyBiases) {
                return this.langBiases;
            }
            const biases = {};
            // Give different weight to the biases depending on relevance of source
            this.sessionOpenedLanguageIds.forEach(lang => biases[lang] = (biases[lang] ?? 0) + 7);
            this.workspaceLanguageIds.forEach(lang => biases[lang] = (biases[lang] ?? 0) + 5);
            [...this.historicalWorkspaceOpenedLanguageIds.keys()].forEach(lang => biases[lang] = (biases[lang] ?? 0) + 3);
            [...this.historicalGlobalOpenedLanguageIds.keys()].forEach(lang => biases[lang] = (biases[lang] ?? 0) + 1);
            this._logService.trace('Session Languages:', JSON.stringify([...this.sessionOpenedLanguageIds]));
            this._logService.trace('Workspace Languages:', JSON.stringify([...this.workspaceLanguageIds]));
            this._logService.trace('Historical Workspace Opened Languages:', JSON.stringify([...this.historicalWorkspaceOpenedLanguageIds.keys()]));
            this._logService.trace('Historical Globally Opened Languages:', JSON.stringify([...this.historicalGlobalOpenedLanguageIds.keys()]));
            this._logService.trace('Computed Language Detection Biases:', JSON.stringify(biases));
            this.dirtyBiases = false;
            this.langBiases = biases;
            return biases;
        }
        async detectLanguage(resource, supportedLangs) {
            const useHistory = this._configurationService.getValue(LanguageDetectionService_1.historyBasedEnablementConfig);
            const preferHistory = this._configurationService.getValue(LanguageDetectionService_1.preferHistoryConfig);
            if (useHistory) {
                await this.resolveWorkspaceLanguageIds();
            }
            const biases = useHistory ? this.getLanguageBiases() : undefined;
            return this._languageDetectionWorkerClient.detectLanguage(resource, biases, preferHistory, supportedLangs);
        }
        // TODO: explore using the history service or something similar to provide this list of opened editors
        // so this service can support delayed instantiation. This may be tricky since it seems the IHistoryService
        // only gives history for a workspace... where this takes advantage of history at a global level as well.
        initEditorOpenedListeners(storageService) {
            try {
                const globalLangHistoryData = JSON.parse(storageService.get(LanguageDetectionService_1.globalOpenedLanguagesStorageKey, 0 /* StorageScope.PROFILE */, '[]'));
                this.historicalGlobalOpenedLanguageIds.fromJSON(globalLangHistoryData);
            }
            catch (e) {
                console.error(e);
            }
            try {
                const workspaceLangHistoryData = JSON.parse(storageService.get(LanguageDetectionService_1.workspaceOpenedLanguagesStorageKey, 1 /* StorageScope.WORKSPACE */, '[]'));
                this.historicalWorkspaceOpenedLanguageIds.fromJSON(workspaceLangHistoryData);
            }
            catch (e) {
                console.error(e);
            }
            this._register(this._editorService.onDidActiveEditorChange(() => {
                const activeLanguage = this._editorService.activeTextEditorLanguageId;
                if (activeLanguage && this._editorService.activeEditor?.resource?.scheme !== network_1.Schemas.untitled) {
                    this.sessionOpenedLanguageIds.add(activeLanguage);
                    this.historicalGlobalOpenedLanguageIds.set(activeLanguage, true);
                    this.historicalWorkspaceOpenedLanguageIds.set(activeLanguage, true);
                    storageService.store(LanguageDetectionService_1.globalOpenedLanguagesStorageKey, JSON.stringify(this.historicalGlobalOpenedLanguageIds.toJSON()), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                    storageService.store(LanguageDetectionService_1.workspaceOpenedLanguagesStorageKey, JSON.stringify(this.historicalWorkspaceOpenedLanguageIds.toJSON()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                    this.dirtyBiases = true;
                }
            }));
        }
    };
    exports.LanguageDetectionService = LanguageDetectionService;
    exports.LanguageDetectionService = LanguageDetectionService = LanguageDetectionService_1 = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, language_1.ILanguageService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, diagnostics_1.IDiagnosticsService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, model_1.IModelService),
        __param(6, editorService_1.IEditorService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, storage_1.IStorageService),
        __param(9, log_1.ILogService),
        __param(10, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], LanguageDetectionService);
    class LanguageDetectionWorkerHost {
        constructor(_indexJsUri, _modelJsonUri, _weightsUri, _telemetryService) {
            this._indexJsUri = _indexJsUri;
            this._modelJsonUri = _modelJsonUri;
            this._weightsUri = _weightsUri;
            this._telemetryService = _telemetryService;
        }
        async getIndexJsUri() {
            return this._indexJsUri;
        }
        async getModelJsonUri() {
            return this._modelJsonUri;
        }
        async getWeightsUri() {
            return this._weightsUri;
        }
        async sendTelemetryEvent(languages, confidences, timeSpent) {
            this._telemetryService.publicLog2('automaticlanguagedetection.stats', {
                languages: languages.join(','),
                confidences: confidences.join(','),
                timeSpent
            });
        }
    }
    exports.LanguageDetectionWorkerHost = LanguageDetectionWorkerHost;
    class LanguageDetectionWorkerClient extends editorWorkerService_1.EditorWorkerClient {
        constructor(modelService, _languageService, _telemetryService, _indexJsUri, _modelJsonUri, _weightsUri, _regexpModelUri, languageConfigurationService) {
            super(modelService, true, 'languageDetectionWorkerService', languageConfigurationService);
            this._languageService = _languageService;
            this._telemetryService = _telemetryService;
            this._indexJsUri = _indexJsUri;
            this._modelJsonUri = _modelJsonUri;
            this._weightsUri = _weightsUri;
            this._regexpModelUri = _regexpModelUri;
        }
        _getOrCreateLanguageDetectionWorker() {
            if (this.workerPromise) {
                return this.workerPromise;
            }
            this.workerPromise = new Promise((resolve, reject) => {
                resolve(this._register(new simpleWorker_1.SimpleWorkerClient(this._workerFactory, 'vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker', new editorWorkerService_1.EditorWorkerHost(this))));
            });
            return this.workerPromise;
        }
        _guessLanguageIdByUri(uri) {
            const guess = this._languageService.guessLanguageIdByFilepathOrFirstLine(uri);
            if (guess && guess !== 'unknown') {
                return guess;
            }
            return undefined;
        }
        async _getProxy() {
            return (await this._getOrCreateLanguageDetectionWorker()).getProxyObject();
        }
        // foreign host request
        async fhr(method, args) {
            switch (method) {
                case 'getIndexJsUri':
                    return this.getIndexJsUri();
                case 'getModelJsonUri':
                    return this.getModelJsonUri();
                case 'getWeightsUri':
                    return this.getWeightsUri();
                case 'getRegexpModelUri':
                    return this.getRegexpModelUri();
                case 'getLanguageId':
                    return this.getLanguageId(args[0]);
                case 'sendTelemetryEvent':
                    return this.sendTelemetryEvent(args[0], args[1], args[2]);
                default:
                    return super.fhr(method, args);
            }
        }
        async getIndexJsUri() {
            return this._indexJsUri;
        }
        getLanguageId(languageIdOrExt) {
            if (!languageIdOrExt) {
                return undefined;
            }
            if (this._languageService.isRegisteredLanguageId(languageIdOrExt)) {
                return languageIdOrExt;
            }
            const guessed = this._guessLanguageIdByUri(uri_1.URI.file(`file.${languageIdOrExt}`));
            if (!guessed || guessed === 'unknown') {
                return undefined;
            }
            return guessed;
        }
        async getModelJsonUri() {
            return this._modelJsonUri;
        }
        async getWeightsUri() {
            return this._weightsUri;
        }
        async getRegexpModelUri() {
            return this._regexpModelUri;
        }
        async sendTelemetryEvent(languages, confidences, timeSpent) {
            this._telemetryService.publicLog2(languageDetectionWorkerService_1.LanguageDetectionStatsId, {
                languages: languages.join(','),
                confidences: confidences.join(','),
                timeSpent
            });
        }
        async detectLanguage(resource, langBiases, preferHistory, supportedLangs) {
            const startTime = Date.now();
            const quickGuess = this._guessLanguageIdByUri(resource);
            if (quickGuess) {
                return quickGuess;
            }
            await this._withSyncedResources([resource]);
            const modelId = await (await this._getProxy()).detectLanguage(resource.toString(), langBiases, preferHistory, supportedLangs);
            const languageId = this.getLanguageId(modelId);
            const LanguageDetectionStatsId = 'automaticlanguagedetection.perf';
            this._telemetryService.publicLog2(LanguageDetectionStatsId, {
                timeSpent: Date.now() - startTime,
                detection: languageId || 'unknown',
            });
            return languageId;
        }
    }
    exports.LanguageDetectionWorkerClient = LanguageDetectionWorkerClient;
    // For now we use Eager until we handle keeping track of history better.
    (0, extensions_1.registerSingleton)(languageDetectionWorkerService_1.ILanguageDetectionService, LanguageDetectionService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VEZXRlY3Rpb25Xb3JrZXJTZXJ2aWNlSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9sYW5ndWFnZURldGVjdGlvbi9icm93c2VyL2xhbmd1YWdlRGV0ZWN0aW9uV29ya2VyU2VydmljZUltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXdCaEcsTUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDO0lBRTNCLE1BQU0sb0JBQW9CLEdBQW9CLEdBQUcseUJBQWUsa0NBQWtDLENBQUM7SUFDbkcsTUFBTSx3QkFBd0IsR0FBb0IsR0FBRyw2QkFBbUIsa0NBQWtDLENBQUM7SUFDM0csTUFBTSxjQUFjLEdBQW9CLEdBQUcseUJBQWUsbUNBQW1DLENBQUM7SUFDOUYsTUFBTSxrQkFBa0IsR0FBb0IsR0FBRyw2QkFBbUIsbUNBQW1DLENBQUM7SUFFL0YsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxzQkFBVTs7aUJBQ3ZDLHlCQUFvQixHQUFHLG9DQUFvQyxBQUF2QyxDQUF3QztpQkFDNUQsaUNBQTRCLEdBQUcsZ0RBQWdELEFBQW5ELENBQW9EO2lCQUNoRix3QkFBbUIsR0FBRyxzREFBc0QsQUFBekQsQ0FBMEQ7aUJBQzdFLHVDQUFrQyxHQUFHLDZEQUE2RCxBQUFoRSxDQUFpRTtpQkFDbkcsb0NBQStCLEdBQUcsMERBQTBELEFBQTdELENBQThEO1FBYzdHLFlBQytCLG1CQUFrRSxFQUM5RSxlQUFpQyxFQUM1QixxQkFBNkQsRUFDL0QsbUJBQXlELEVBQ3BELHdCQUFtRSxFQUM5RSxZQUEyQixFQUMxQixjQUErQyxFQUM1QyxnQkFBbUMsRUFDckMsY0FBK0IsRUFDbkMsV0FBeUMsRUFDdkIsNEJBQTJEO1lBRTFGLEtBQUssRUFBRSxDQUFDO1lBWnVDLHdCQUFtQixHQUFuQixt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