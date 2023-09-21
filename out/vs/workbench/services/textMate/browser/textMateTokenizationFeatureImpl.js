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
define(["require", "exports", "vs/amdX", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/observable", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/types", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/supports/tokenization", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport", "vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit", "vs/workbench/services/textMate/browser/backgroundTokenization/threadedBackgroundTokenizerFactory", "vs/workbench/services/textMate/common/TMGrammarFactory", "vs/workbench/services/textMate/common/TMGrammars", "vs/workbench/services/themes/common/workbenchThemeService"], function (require, exports, amdX_1, dom, arrays_1, color_1, errors_1, lifecycle_1, network_1, observable_1, platform_1, resources, types, languages_1, language_1, tokenization_1, nls, configuration_1, extensionResourceLoader_1, instantiation_1, log_1, notification_1, progress_1, telemetry_1, environmentService_1, textMateTokenizationSupport_1, tokenizationSupportWithLineLimit_1, threadedBackgroundTokenizerFactory_1, TMGrammarFactory_1, TMGrammars_1, workbenchThemeService_1) {
    "use strict";
    var TextMateTokenizationFeature_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMateTokenizationFeature = void 0;
    let TextMateTokenizationFeature = class TextMateTokenizationFeature extends lifecycle_1.Disposable {
        static { TextMateTokenizationFeature_1 = this; }
        static { this.reportTokenizationTimeCounter = { sync: 0, async: 0 }; }
        constructor(_languageService, _themeService, _extensionResourceLoaderService, _notificationService, _logService, _configurationService, _progressService, _environmentService, _instantiationService, _telemetryService) {
            super();
            this._languageService = _languageService;
            this._themeService = _themeService;
            this._extensionResourceLoaderService = _extensionResourceLoaderService;
            this._notificationService = _notificationService;
            this._logService = _logService;
            this._configurationService = _configurationService;
            this._progressService = _progressService;
            this._environmentService = _environmentService;
            this._instantiationService = _instantiationService;
            this._telemetryService = _telemetryService;
            this._createdModes = [];
            this._encounteredLanguages = [];
            this._debugMode = false;
            this._debugModePrintFunc = () => { };
            this._grammarDefinitions = null;
            this._grammarFactory = null;
            this._tokenizersRegistrations = new lifecycle_1.DisposableStore();
            this._currentTheme = null;
            this._currentTokenColorMap = null;
            this._threadedBackgroundTokenizerFactory = this._instantiationService.createInstance(threadedBackgroundTokenizerFactory_1.ThreadedBackgroundTokenizerFactory, (timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) => this._reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, true, isRandomSample), () => this.getAsyncTokenizationEnabled());
            this._vscodeOniguruma = null;
            this._styleElement = dom.createStyleSheet();
            this._styleElement.className = 'vscode-tokens-styles';
            TMGrammars_1.grammarsExtPoint.setHandler((extensions) => this._handleGrammarsExtPoint(extensions));
            this._updateTheme(this._themeService.getColorTheme(), true);
            this._register(this._themeService.onDidColorThemeChange(() => {
                this._updateTheme(this._themeService.getColorTheme(), false);
            }));
            this._languageService.onDidRequestRichLanguageFeatures((languageId) => {
                this._createdModes.push(languageId);
            });
        }
        getAsyncTokenizationEnabled() {
            return !!this._configurationService.getValue('editor.experimental.asyncTokenization');
        }
        getAsyncTokenizationVerification() {
            return !!this._configurationService.getValue('editor.experimental.asyncTokenizationVerification');
        }
        _handleGrammarsExtPoint(extensions) {
            this._grammarDefinitions = null;
            if (this._grammarFactory) {
                this._grammarFactory.dispose();
                this._grammarFactory = null;
            }
            this._tokenizersRegistrations.clear();
            this._grammarDefinitions = [];
            for (const extension of extensions) {
                const grammars = extension.value;
                for (const grammar of grammars) {
                    const validatedGrammar = this._validateGrammarDefinition(extension, grammar);
                    if (validatedGrammar) {
                        this._grammarDefinitions.push(validatedGrammar);
                        if (validatedGrammar.language) {
                            const lazyTokenizationSupport = new languages_1.LazyTokenizationSupport(() => this._createTokenizationSupport(validatedGrammar.language));
                            this._tokenizersRegistrations.add(lazyTokenizationSupport);
                            this._tokenizersRegistrations.add(languages_1.TokenizationRegistry.registerFactory(validatedGrammar.language, lazyTokenizationSupport));
                        }
                    }
                }
            }
            this._threadedBackgroundTokenizerFactory.setGrammarDefinitions(this._grammarDefinitions);
            for (const createdMode of this._createdModes) {
                languages_1.TokenizationRegistry.getOrCreate(createdMode);
            }
        }
        _validateGrammarDefinition(extension, grammar) {
            if (!validateGrammarExtensionPoint(extension.description.extensionLocation, grammar, extension.collector, this._languageService)) {
                return null;
            }
            const grammarLocation = resources.joinPath(extension.description.extensionLocation, grammar.path);
            const embeddedLanguages = Object.create(null);
            if (grammar.embeddedLanguages) {
                const scopes = Object.keys(grammar.embeddedLanguages);
                for (let i = 0, len = scopes.length; i < len; i++) {
                    const scope = scopes[i];
                    const language = grammar.embeddedLanguages[scope];
                    if (typeof language !== 'string') {
                        // never hurts to be too careful
                        continue;
                    }
                    if (this._languageService.isRegisteredLanguageId(language)) {
                        embeddedLanguages[scope] = this._languageService.languageIdCodec.encodeLanguageId(language);
                    }
                }
            }
            const tokenTypes = Object.create(null);
            if (grammar.tokenTypes) {
                const scopes = Object.keys(grammar.tokenTypes);
                for (const scope of scopes) {
                    const tokenType = grammar.tokenTypes[scope];
                    switch (tokenType) {
                        case 'string':
                            tokenTypes[scope] = 2 /* StandardTokenType.String */;
                            break;
                        case 'other':
                            tokenTypes[scope] = 0 /* StandardTokenType.Other */;
                            break;
                        case 'comment':
                            tokenTypes[scope] = 1 /* StandardTokenType.Comment */;
                            break;
                    }
                }
            }
            const validLanguageId = grammar.language && this._languageService.isRegisteredLanguageId(grammar.language) ? grammar.language : null;
            function asStringArray(array, defaultValue) {
                if (!Array.isArray(array)) {
                    return defaultValue;
                }
                if (!array.every(e => typeof e === 'string')) {
                    return defaultValue;
                }
                return array;
            }
            return {
                location: grammarLocation,
                language: validLanguageId || undefined,
                scopeName: grammar.scopeName,
                embeddedLanguages: embeddedLanguages,
                tokenTypes: tokenTypes,
                injectTo: grammar.injectTo,
                balancedBracketSelectors: asStringArray(grammar.balancedBracketScopes, ['*']),
                unbalancedBracketSelectors: asStringArray(grammar.unbalancedBracketScopes, []),
                sourceExtensionId: extension.description.id,
            };
        }
        startDebugMode(printFn, onStop) {
            if (this._debugMode) {
                this._notificationService.error(nls.localize('alreadyDebugging', "Already Logging."));
                return;
            }
            this._debugModePrintFunc = printFn;
            this._debugMode = true;
            if (this._debugMode) {
                this._progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    buttons: [nls.localize('stop', "Stop")]
                }, (progress) => {
                    progress.report({
                        message: nls.localize('progress1', "Preparing to log TM Grammar parsing. Press Stop when finished.")
                    });
                    return this._getVSCodeOniguruma().then((vscodeOniguruma) => {
                        vscodeOniguruma.setDefaultDebugCall(true);
                        progress.report({
                            message: nls.localize('progress2', "Now logging TM Grammar parsing. Press Stop when finished.")
                        });
                        return new Promise((resolve, reject) => { });
                    });
                }, (choice) => {
                    this._getVSCodeOniguruma().then((vscodeOniguruma) => {
                        this._debugModePrintFunc = () => { };
                        this._debugMode = false;
                        vscodeOniguruma.setDefaultDebugCall(false);
                        onStop();
                    });
                });
            }
        }
        _canCreateGrammarFactory() {
            // Check if extension point is ready
            return !!this._grammarDefinitions;
        }
        async _getOrCreateGrammarFactory() {
            if (this._grammarFactory) {
                return this._grammarFactory;
            }
            const [vscodeTextmate, vscodeOniguruma] = await Promise.all([(0, amdX_1.importAMDNodeModule)('vscode-textmate', 'release/main.js'), this._getVSCodeOniguruma()]);
            const onigLib = Promise.resolve({
                createOnigScanner: (sources) => vscodeOniguruma.createOnigScanner(sources),
                createOnigString: (str) => vscodeOniguruma.createOnigString(str)
            });
            // Avoid duplicate instantiations
            if (this._grammarFactory) {
                return this._grammarFactory;
            }
            this._grammarFactory = new TMGrammarFactory_1.TMGrammarFactory({
                logTrace: (msg) => this._logService.trace(msg),
                logError: (msg, err) => this._logService.error(msg, err),
                readFile: (resource) => this._extensionResourceLoaderService.readExtensionResource(resource)
            }, this._grammarDefinitions || [], vscodeTextmate, onigLib);
            this._updateTheme(this._themeService.getColorTheme(), true);
            return this._grammarFactory;
        }
        async _createTokenizationSupport(languageId) {
            if (!this._languageService.isRegisteredLanguageId(languageId)) {
                return null;
            }
            if (!this._canCreateGrammarFactory()) {
                return null;
            }
            try {
                const grammarFactory = await this._getOrCreateGrammarFactory();
                if (!grammarFactory.has(languageId)) {
                    return null;
                }
                const encodedLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
                const r = await grammarFactory.createGrammar(languageId, encodedLanguageId);
                if (!r.grammar) {
                    return null;
                }
                const maxTokenizationLineLength = observableConfigValue('editor.maxTokenizationLineLength', languageId, -1, this._configurationService);
                const tokenization = new textMateTokenizationSupport_1.TextMateTokenizationSupport(r.grammar, r.initialState, r.containsEmbeddedLanguages, (textModel, tokenStore) => this._threadedBackgroundTokenizerFactory.createBackgroundTokenizer(textModel, tokenStore, maxTokenizationLineLength), () => this.getAsyncTokenizationVerification(), (timeMs, lineLength, isRandomSample) => {
                    this._reportTokenizationTime(timeMs, languageId, r.sourceExtensionId, lineLength, false, isRandomSample);
                }, true);
                tokenization.onDidEncounterLanguage((encodedLanguageId) => {
                    if (!this._encounteredLanguages[encodedLanguageId]) {
                        const languageId = this._languageService.languageIdCodec.decodeLanguageId(encodedLanguageId);
                        this._encounteredLanguages[encodedLanguageId] = true;
                        this._languageService.requestBasicLanguageFeatures(languageId);
                    }
                });
                return new tokenizationSupportWithLineLimit_1.TokenizationSupportWithLineLimit(encodedLanguageId, tokenization, maxTokenizationLineLength);
            }
            catch (err) {
                if (err.message && err.message === TMGrammarFactory_1.missingTMGrammarErrorMessage) {
                    // Don't log this error message
                    return null;
                }
                (0, errors_1.onUnexpectedError)(err);
                return null;
            }
        }
        _updateTheme(colorTheme, forceUpdate) {
            if (!forceUpdate && this._currentTheme && this._currentTokenColorMap && equalsTokenRules(this._currentTheme.settings, colorTheme.tokenColors)
                && (0, arrays_1.equals)(this._currentTokenColorMap, colorTheme.tokenColorMap)) {
                return;
            }
            this._currentTheme = { name: colorTheme.label, settings: colorTheme.tokenColors };
            this._currentTokenColorMap = colorTheme.tokenColorMap;
            this._grammarFactory?.setTheme(this._currentTheme, this._currentTokenColorMap);
            const colorMap = toColorMap(this._currentTokenColorMap);
            const cssRules = (0, tokenization_1.generateTokensCSSForColorMap)(colorMap);
            this._styleElement.textContent = cssRules;
            languages_1.TokenizationRegistry.setColorMap(colorMap);
            if (this._currentTheme && this._currentTokenColorMap) {
                this._threadedBackgroundTokenizerFactory.acceptTheme(this._currentTheme, this._currentTokenColorMap);
            }
        }
        async createTokenizer(languageId) {
            if (!this._languageService.isRegisteredLanguageId(languageId)) {
                return null;
            }
            const grammarFactory = await this._getOrCreateGrammarFactory();
            if (!grammarFactory.has(languageId)) {
                return null;
            }
            const encodedLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
            const { grammar } = await grammarFactory.createGrammar(languageId, encodedLanguageId);
            return grammar;
        }
        _getVSCodeOniguruma() {
            if (!this._vscodeOniguruma) {
                this._vscodeOniguruma = (async () => {
                    const [vscodeOniguruma, wasm] = await Promise.all([(0, amdX_1.importAMDNodeModule)('vscode-oniguruma', 'release/main.js'), this._loadVSCodeOnigurumaWASM()]);
                    await vscodeOniguruma.loadWASM({
                        data: wasm,
                        print: (str) => {
                            this._debugModePrintFunc(str);
                        }
                    });
                    return vscodeOniguruma;
                })();
            }
            return this._vscodeOniguruma;
        }
        async _loadVSCodeOnigurumaWASM() {
            if (platform_1.isWeb) {
                const response = await fetch(network_1.FileAccess.asBrowserUri('vscode-oniguruma/../onig.wasm').toString(true));
                // Using the response directly only works if the server sets the MIME type 'application/wasm'.
                // Otherwise, a TypeError is thrown when using the streaming compiler.
                // We therefore use the non-streaming compiler :(.
                return await response.arrayBuffer();
            }
            else {
                const response = await fetch(this._environmentService.isBuilt
                    ? network_1.FileAccess.asBrowserUri(`${network_1.nodeModulesAsarUnpackedPath}/vscode-oniguruma/release/onig.wasm`).toString(true)
                    : network_1.FileAccess.asBrowserUri(`${network_1.nodeModulesPath}/vscode-oniguruma/release/onig.wasm`).toString(true));
                return response;
            }
        }
        _reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, fromWorker, isRandomSample) {
            const key = fromWorker ? 'async' : 'sync';
            // 50 events per hour (one event has a low probability)
            if (TextMateTokenizationFeature_1.reportTokenizationTimeCounter[key] > 50) {
                // Don't flood telemetry with too many events
                return;
            }
            if (TextMateTokenizationFeature_1.reportTokenizationTimeCounter[key] === 0) {
                setTimeout(() => {
                    TextMateTokenizationFeature_1.reportTokenizationTimeCounter[key] = 0;
                }, 1000 * 60 * 60);
            }
            TextMateTokenizationFeature_1.reportTokenizationTimeCounter[key]++;
            this._telemetryService.publicLog2('editor.tokenizedLine', {
                timeMs,
                languageId,
                lineLength,
                fromWorker,
                sourceExtensionId,
                isRandomSample,
                tokenizationSetting: this.getAsyncTokenizationEnabled() ? (this.getAsyncTokenizationVerification() ? 2 : 1) : 0,
            });
        }
    };
    exports.TextMateTokenizationFeature = TextMateTokenizationFeature;
    exports.TextMateTokenizationFeature = TextMateTokenizationFeature = TextMateTokenizationFeature_1 = __decorate([
        __param(0, language_1.ILanguageService),
        __param(1, workbenchThemeService_1.IWorkbenchThemeService),
        __param(2, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(3, notification_1.INotificationService),
        __param(4, log_1.ILogService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, progress_1.IProgressService),
        __param(7, environmentService_1.IWorkbenchEnvironmentService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, telemetry_1.ITelemetryService)
    ], TextMateTokenizationFeature);
    function toColorMap(colorMap) {
        const result = [null];
        for (let i = 1, len = colorMap.length; i < len; i++) {
            result[i] = color_1.Color.fromHex(colorMap[i]);
        }
        return result;
    }
    function equalsTokenRules(a, b) {
        if (!b || !a || b.length !== a.length) {
            return false;
        }
        for (let i = b.length - 1; i >= 0; i--) {
            const r1 = b[i];
            const r2 = a[i];
            if (r1.scope !== r2.scope) {
                return false;
            }
            const s1 = r1.settings;
            const s2 = r2.settings;
            if (s1 && s2) {
                if (s1.fontStyle !== s2.fontStyle || s1.foreground !== s2.foreground || s1.background !== s2.background) {
                    return false;
                }
            }
            else if (!s1 || !s2) {
                return false;
            }
        }
        return true;
    }
    function validateGrammarExtensionPoint(extensionLocation, syntax, collector, _languageService) {
        if (syntax.language && ((typeof syntax.language !== 'string') || !_languageService.isRegisteredLanguageId(syntax.language))) {
            collector.error(nls.localize('invalid.language', "Unknown language in `contributes.{0}.language`. Provided value: {1}", TMGrammars_1.grammarsExtPoint.name, String(syntax.language)));
            return false;
        }
        if (!syntax.scopeName || (typeof syntax.scopeName !== 'string')) {
            collector.error(nls.localize('invalid.scopeName', "Expected string in `contributes.{0}.scopeName`. Provided value: {1}", TMGrammars_1.grammarsExtPoint.name, String(syntax.scopeName)));
            return false;
        }
        if (!syntax.path || (typeof syntax.path !== 'string')) {
            collector.error(nls.localize('invalid.path.0', "Expected string in `contributes.{0}.path`. Provided value: {1}", TMGrammars_1.grammarsExtPoint.name, String(syntax.path)));
            return false;
        }
        if (syntax.injectTo && (!Array.isArray(syntax.injectTo) || syntax.injectTo.some(scope => typeof scope !== 'string'))) {
            collector.error(nls.localize('invalid.injectTo', "Invalid value in `contributes.{0}.injectTo`. Must be an array of language scope names. Provided value: {1}", TMGrammars_1.grammarsExtPoint.name, JSON.stringify(syntax.injectTo)));
            return false;
        }
        if (syntax.embeddedLanguages && !types.isObject(syntax.embeddedLanguages)) {
            collector.error(nls.localize('invalid.embeddedLanguages', "Invalid value in `contributes.{0}.embeddedLanguages`. Must be an object map from scope name to language. Provided value: {1}", TMGrammars_1.grammarsExtPoint.name, JSON.stringify(syntax.embeddedLanguages)));
            return false;
        }
        if (syntax.tokenTypes && !types.isObject(syntax.tokenTypes)) {
            collector.error(nls.localize('invalid.tokenTypes', "Invalid value in `contributes.{0}.tokenTypes`. Must be an object map from scope name to token type. Provided value: {1}", TMGrammars_1.grammarsExtPoint.name, JSON.stringify(syntax.tokenTypes)));
            return false;
        }
        const grammarLocation = resources.joinPath(extensionLocation, syntax.path);
        if (!resources.isEqualOrParent(grammarLocation, extensionLocation)) {
            collector.warn(nls.localize('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", TMGrammars_1.grammarsExtPoint.name, grammarLocation.path, extensionLocation.path));
        }
        return true;
    }
    function observableConfigValue(key, languageId, defaultValue, configurationService) {
        return (0, observable_1.observableFromEvent)((handleChange) => configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(key, { overrideIdentifier: languageId })) {
                handleChange(e);
            }
        }), () => configurationService.getValue(key, { overrideIdentifier: languageId }) ?? defaultValue);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1hdGVUb2tlbml6YXRpb25GZWF0dXJlSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZXh0TWF0ZS9icm93c2VyL3RleHRNYXRlVG9rZW5pemF0aW9uRmVhdHVyZUltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXNDekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTs7aUJBQzNDLGtDQUE2QixHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEFBQXhCLENBQXlCO1FBcUJyRSxZQUNtQixnQkFBbUQsRUFDN0MsYUFBc0QsRUFDN0MsK0JBQWlGLEVBQzVGLG9CQUEyRCxFQUNwRSxXQUF5QyxFQUMvQixxQkFBNkQsRUFDbEUsZ0JBQW1ELEVBQ3ZDLG1CQUFrRSxFQUN6RSxxQkFBNkQsRUFDakUsaUJBQXFEO1lBRXhFLEtBQUssRUFBRSxDQUFDO1lBWDJCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDNUIsa0JBQWEsR0FBYixhQUFhLENBQXdCO1lBQzVCLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBaUM7WUFDM0UseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUNuRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNkLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDakQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUN0Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQThCO1lBQ3hELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDaEQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQTNCeEQsa0JBQWEsR0FBYSxFQUFFLENBQUM7WUFDN0IsMEJBQXFCLEdBQWMsRUFBRSxDQUFDO1lBRS9DLGVBQVUs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