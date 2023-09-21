/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/language", "vs/editor/common/standalone/standaloneEnums", "vs/editor/standalone/browser/standaloneServices", "vs/editor/standalone/common/monarch/monarchCompile", "vs/editor/standalone/common/monarch/monarchLexer", "vs/editor/standalone/common/standaloneTheme", "vs/platform/markers/common/markers", "vs/editor/common/services/languageFeatures", "vs/platform/configuration/common/configuration"], function (require, exports, color_1, range_1, languages, languageConfigurationRegistry_1, modesRegistry_1, language_1, standaloneEnums, standaloneServices_1, monarchCompile_1, monarchLexer_1, standaloneTheme_1, markers_1, languageFeatures_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMonacoLanguagesAPI = exports.registerInlayHintsProvider = exports.registerInlineCompletionsProvider = exports.registerDocumentRangeSemanticTokensProvider = exports.registerDocumentSemanticTokensProvider = exports.registerSelectionRangeProvider = exports.registerDeclarationProvider = exports.registerFoldingRangeProvider = exports.registerColorProvider = exports.registerCompletionItemProvider = exports.registerLinkProvider = exports.registerOnTypeFormattingEditProvider = exports.registerDocumentRangeFormattingEditProvider = exports.registerDocumentFormattingEditProvider = exports.registerCodeActionProvider = exports.registerCodeLensProvider = exports.registerTypeDefinitionProvider = exports.registerImplementationProvider = exports.registerDefinitionProvider = exports.registerLinkedEditingRangeProvider = exports.registerDocumentHighlightProvider = exports.registerDocumentSymbolProvider = exports.registerHoverProvider = exports.registerSignatureHelpProvider = exports.registerRenameProvider = exports.registerReferenceProvider = exports.setMonarchTokensProvider = exports.setTokensProvider = exports.registerTokensProviderFactory = exports.setColorMap = exports.TokenizationSupportAdapter = exports.EncodedTokenizationSupportAdapter = exports.setLanguageConfiguration = exports.onLanguageEncountered = exports.onLanguage = exports.getEncodedLanguageId = exports.getLanguages = exports.register = void 0;
    /**
     * Register information about a new language.
     */
    function register(language) {
        // Intentionally using the `ModesRegistry` here to avoid
        // instantiating services too quickly in the standalone editor.
        modesRegistry_1.ModesRegistry.registerLanguage(language);
    }
    exports.register = register;
    /**
     * Get the information of all the registered languages.
     */
    function getLanguages() {
        let result = [];
        result = result.concat(modesRegistry_1.ModesRegistry.getLanguages());
        return result;
    }
    exports.getLanguages = getLanguages;
    function getEncodedLanguageId(languageId) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        return languageService.languageIdCodec.encodeLanguageId(languageId);
    }
    exports.getEncodedLanguageId = getEncodedLanguageId;
    /**
     * An event emitted when a language is associated for the first time with a text model.
     * @event
     */
    function onLanguage(languageId, callback) {
        return standaloneServices_1.StandaloneServices.withServices(() => {
            const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
            const disposable = languageService.onDidRequestRichLanguageFeatures((encounteredLanguageId) => {
                if (encounteredLanguageId === languageId) {
                    // stop listening
                    disposable.dispose();
                    // invoke actual listener
                    callback();
                }
            });
            return disposable;
        });
    }
    exports.onLanguage = onLanguage;
    /**
     * An event emitted when a language is associated for the first time with a text model or
     * when a language is encountered during the tokenization of another language.
     * @event
     */
    function onLanguageEncountered(languageId, callback) {
        return standaloneServices_1.StandaloneServices.withServices(() => {
            const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
            const disposable = languageService.onDidRequestBasicLanguageFeatures((encounteredLanguageId) => {
                if (encounteredLanguageId === languageId) {
                    // stop listening
                    disposable.dispose();
                    // invoke actual listener
                    callback();
                }
            });
            return disposable;
        });
    }
    exports.onLanguageEncountered = onLanguageEncountered;
    /**
     * Set the editing configuration for a language.
     */
    function setLanguageConfiguration(languageId, configuration) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        if (!languageService.isRegisteredLanguageId(languageId)) {
            throw new Error(`Cannot set configuration for unknown language ${languageId}`);
        }
        const languageConfigurationService = standaloneServices_1.StandaloneServices.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
        return languageConfigurationService.register(languageId, configuration, 100);
    }
    exports.setLanguageConfiguration = setLanguageConfiguration;
    /**
     * @internal
     */
    class EncodedTokenizationSupportAdapter {
        constructor(languageId, actual) {
            this._languageId = languageId;
            this._actual = actual;
        }
        dispose() {
            // NOOP
        }
        getInitialState() {
            return this._actual.getInitialState();
        }
        tokenize(line, hasEOL, state) {
            if (typeof this._actual.tokenize === 'function') {
                return TokenizationSupportAdapter.adaptTokenize(this._languageId, this._actual, line, state);
            }
            throw new Error('Not supported!');
        }
        tokenizeEncoded(line, hasEOL, state) {
            const result = this._actual.tokenizeEncoded(line, state);
            return new languages.EncodedTokenizationResult(result.tokens, result.endState);
        }
    }
    exports.EncodedTokenizationSupportAdapter = EncodedTokenizationSupportAdapter;
    /**
     * @internal
     */
    class TokenizationSupportAdapter {
        constructor(_languageId, _actual, _languageService, _standaloneThemeService) {
            this._languageId = _languageId;
            this._actual = _actual;
            this._languageService = _languageService;
            this._standaloneThemeService = _standaloneThemeService;
        }
        dispose() {
            // NOOP
        }
        getInitialState() {
            return this._actual.getInitialState();
        }
        static _toClassicTokens(tokens, language) {
            const result = [];
            let previousStartIndex = 0;
            for (let i = 0, len = tokens.length; i < len; i++) {
                const t = tokens[i];
                let startIndex = t.startIndex;
                // Prevent issues stemming from a buggy external tokenizer.
                if (i === 0) {
                    // Force first token to start at first index!
                    startIndex = 0;
                }
                else if (startIndex < previousStartIndex) {
                    // Force tokens to be after one another!
                    startIndex = previousStartIndex;
                }
                result[i] = new languages.Token(startIndex, t.scopes, language);
                previousStartIndex = startIndex;
            }
            return result;
        }
        static adaptTokenize(language, actual, line, state) {
            const actualResult = actual.tokenize(line, state);
            const tokens = TokenizationSupportAdapter._toClassicTokens(actualResult.tokens, language);
            let endState;
            // try to save an object if possible
            if (actualResult.endState.equals(state)) {
                endState = state;
            }
            else {
                endState = actualResult.endState;
            }
            return new languages.TokenizationResult(tokens, endState);
        }
        tokenize(line, hasEOL, state) {
            return TokenizationSupportAdapter.adaptTokenize(this._languageId, this._actual, line, state);
        }
        _toBinaryTokens(languageIdCodec, tokens) {
            const languageId = languageIdCodec.encodeLanguageId(this._languageId);
            const tokenTheme = this._standaloneThemeService.getColorTheme().tokenTheme;
            const result = [];
            let resultLen = 0;
            let previousStartIndex = 0;
            for (let i = 0, len = tokens.length; i < len; i++) {
                const t = tokens[i];
                const metadata = tokenTheme.match(languageId, t.scopes) | 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */;
                if (resultLen > 0 && result[resultLen - 1] === metadata) {
                    // same metadata
                    continue;
                }
                let startIndex = t.startIndex;
                // Prevent issues stemming from a buggy external tokenizer.
                if (i === 0) {
                    // Force first token to start at first index!
                    startIndex = 0;
                }
                else if (startIndex < previousStartIndex) {
                    // Force tokens to be after one another!
                    startIndex = previousStartIndex;
                }
                result[resultLen++] = startIndex;
                result[resultLen++] = metadata;
                previousStartIndex = startIndex;
            }
            const actualResult = new Uint32Array(resultLen);
            for (let i = 0; i < resultLen; i++) {
                actualResult[i] = result[i];
            }
            return actualResult;
        }
        tokenizeEncoded(line, hasEOL, state) {
            const actualResult = this._actual.tokenize(line, state);
            const tokens = this._toBinaryTokens(this._languageService.languageIdCodec, actualResult.tokens);
            let endState;
            // try to save an object if possible
            if (actualResult.endState.equals(state)) {
                endState = state;
            }
            else {
                endState = actualResult.endState;
            }
            return new languages.EncodedTokenizationResult(tokens, endState);
        }
    }
    exports.TokenizationSupportAdapter = TokenizationSupportAdapter;
    function isATokensProvider(provider) {
        return (typeof provider.getInitialState === 'function');
    }
    function isEncodedTokensProvider(provider) {
        return 'tokenizeEncoded' in provider;
    }
    function isThenable(obj) {
        return obj && typeof obj.then === 'function';
    }
    /**
     * Change the color map that is used for token colors.
     * Supported formats (hex): #RRGGBB, $RRGGBBAA, #RGB, #RGBA
     */
    function setColorMap(colorMap) {
        const standaloneThemeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        if (colorMap) {
            const result = [null];
            for (let i = 1, len = colorMap.length; i < len; i++) {
                result[i] = color_1.Color.fromHex(colorMap[i]);
            }
            standaloneThemeService.setColorMapOverride(result);
        }
        else {
            standaloneThemeService.setColorMapOverride(null);
        }
    }
    exports.setColorMap = setColorMap;
    /**
     * @internal
     */
    function createTokenizationSupportAdapter(languageId, provider) {
        if (isEncodedTokensProvider(provider)) {
            return new EncodedTokenizationSupportAdapter(languageId, provider);
        }
        else {
            return new TokenizationSupportAdapter(languageId, provider, standaloneServices_1.StandaloneServices.get(language_1.ILanguageService), standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService));
        }
    }
    /**
     * Register a tokens provider factory for a language. This tokenizer will be exclusive with a tokenizer
     * set using `setTokensProvider` or one created using `setMonarchTokensProvider`, but will work together
     * with a tokens provider set using `registerDocumentSemanticTokensProvider` or `registerDocumentRangeSemanticTokensProvider`.
     */
    function registerTokensProviderFactory(languageId, factory) {
        const adaptedFactory = new languages.LazyTokenizationSupport(async () => {
            const result = await Promise.resolve(factory.create());
            if (!result) {
                return null;
            }
            if (isATokensProvider(result)) {
                return createTokenizationSupportAdapter(languageId, result);
            }
            return new monarchLexer_1.MonarchTokenizer(standaloneServices_1.StandaloneServices.get(language_1.ILanguageService), standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService), languageId, (0, monarchCompile_1.compile)(languageId, result), standaloneServices_1.StandaloneServices.get(configuration_1.IConfigurationService));
        });
        return languages.TokenizationRegistry.registerFactory(languageId, adaptedFactory);
    }
    exports.registerTokensProviderFactory = registerTokensProviderFactory;
    /**
     * Set the tokens provider for a language (manual implementation). This tokenizer will be exclusive
     * with a tokenizer created using `setMonarchTokensProvider`, or with `registerTokensProviderFactory`,
     * but will work together with a tokens provider set using `registerDocumentSemanticTokensProvider`
     * or `registerDocumentRangeSemanticTokensProvider`.
     */
    function setTokensProvider(languageId, provider) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        if (!languageService.isRegisteredLanguageId(languageId)) {
            throw new Error(`Cannot set tokens provider for unknown language ${languageId}`);
        }
        if (isThenable(provider)) {
            return registerTokensProviderFactory(languageId, { create: () => provider });
        }
        return languages.TokenizationRegistry.register(languageId, createTokenizationSupportAdapter(languageId, provider));
    }
    exports.setTokensProvider = setTokensProvider;
    /**
     * Set the tokens provider for a language (monarch implementation). This tokenizer will be exclusive
     * with a tokenizer set using `setTokensProvider`, or with `registerTokensProviderFactory`, but will
     * work together with a tokens provider set using `registerDocumentSemanticTokensProvider` or
     * `registerDocumentRangeSemanticTokensProvider`.
     */
    function setMonarchTokensProvider(languageId, languageDef) {
        const create = (languageDef) => {
            return new monarchLexer_1.MonarchTokenizer(standaloneServices_1.StandaloneServices.get(language_1.ILanguageService), standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService), languageId, (0, monarchCompile_1.compile)(languageId, languageDef), standaloneServices_1.StandaloneServices.get(configuration_1.IConfigurationService));
        };
        if (isThenable(languageDef)) {
            return registerTokensProviderFactory(languageId, { create: () => languageDef });
        }
        return languages.TokenizationRegistry.register(languageId, create(languageDef));
    }
    exports.setMonarchTokensProvider = setMonarchTokensProvider;
    /**
     * Register a reference provider (used by e.g. reference search).
     */
    function registerReferenceProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.referenceProvider.register(languageSelector, provider);
    }
    exports.registerReferenceProvider = registerReferenceProvider;
    /**
     * Register a rename provider (used by e.g. rename symbol).
     */
    function registerRenameProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.renameProvider.register(languageSelector, provider);
    }
    exports.registerRenameProvider = registerRenameProvider;
    /**
     * Register a signature help provider (used by e.g. parameter hints).
     */
    function registerSignatureHelpProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.signatureHelpProvider.register(languageSelector, provider);
    }
    exports.registerSignatureHelpProvider = registerSignatureHelpProvider;
    /**
     * Register a hover provider (used by e.g. editor hover).
     */
    function registerHoverProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.hoverProvider.register(languageSelector, {
            provideHover: (model, position, token) => {
                const word = model.getWordAtPosition(position);
                return Promise.resolve(provider.provideHover(model, position, token)).then((value) => {
                    if (!value) {
                        return undefined;
                    }
                    if (!value.range && word) {
                        value.range = new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
                    }
                    if (!value.range) {
                        value.range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
                    }
                    return value;
                });
            }
        });
    }
    exports.registerHoverProvider = registerHoverProvider;
    /**
     * Register a document symbol provider (used by e.g. outline).
     */
    function registerDocumentSymbolProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentSymbolProvider.register(languageSelector, provider);
    }
    exports.registerDocumentSymbolProvider = registerDocumentSymbolProvider;
    /**
     * Register a document highlight provider (used by e.g. highlight occurrences).
     */
    function registerDocumentHighlightProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentHighlightProvider.register(languageSelector, provider);
    }
    exports.registerDocumentHighlightProvider = registerDocumentHighlightProvider;
    /**
     * Register an linked editing range provider.
     */
    function registerLinkedEditingRangeProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.linkedEditingRangeProvider.register(languageSelector, provider);
    }
    exports.registerLinkedEditingRangeProvider = registerLinkedEditingRangeProvider;
    /**
     * Register a definition provider (used by e.g. go to definition).
     */
    function registerDefinitionProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.definitionProvider.register(languageSelector, provider);
    }
    exports.registerDefinitionProvider = registerDefinitionProvider;
    /**
     * Register a implementation provider (used by e.g. go to implementation).
     */
    function registerImplementationProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.implementationProvider.register(languageSelector, provider);
    }
    exports.registerImplementationProvider = registerImplementationProvider;
    /**
     * Register a type definition provider (used by e.g. go to type definition).
     */
    function registerTypeDefinitionProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.typeDefinitionProvider.register(languageSelector, provider);
    }
    exports.registerTypeDefinitionProvider = registerTypeDefinitionProvider;
    /**
     * Register a code lens provider (used by e.g. inline code lenses).
     */
    function registerCodeLensProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.codeLensProvider.register(languageSelector, provider);
    }
    exports.registerCodeLensProvider = registerCodeLensProvider;
    /**
     * Register a code action provider (used by e.g. quick fix).
     */
    function registerCodeActionProvider(languageSelector, provider, metadata) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.codeActionProvider.register(languageSelector, {
            providedCodeActionKinds: metadata?.providedCodeActionKinds,
            documentation: metadata?.documentation,
            provideCodeActions: (model, range, context, token) => {
                const markerService = standaloneServices_1.StandaloneServices.get(markers_1.IMarkerService);
                const markers = markerService.read({ resource: model.uri }).filter(m => {
                    return range_1.Range.areIntersectingOrTouching(m, range);
                });
                return provider.provideCodeActions(model, range, { markers, only: context.only, trigger: context.trigger }, token);
            },
            resolveCodeAction: provider.resolveCodeAction
        });
    }
    exports.registerCodeActionProvider = registerCodeActionProvider;
    /**
     * Register a formatter that can handle only entire models.
     */
    function registerDocumentFormattingEditProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentFormattingEditProvider.register(languageSelector, provider);
    }
    exports.registerDocumentFormattingEditProvider = registerDocumentFormattingEditProvider;
    /**
     * Register a formatter that can handle a range inside a model.
     */
    function registerDocumentRangeFormattingEditProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentRangeFormattingEditProvider.register(languageSelector, provider);
    }
    exports.registerDocumentRangeFormattingEditProvider = registerDocumentRangeFormattingEditProvider;
    /**
     * Register a formatter than can do formatting as the user types.
     */
    function registerOnTypeFormattingEditProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.onTypeFormattingEditProvider.register(languageSelector, provider);
    }
    exports.registerOnTypeFormattingEditProvider = registerOnTypeFormattingEditProvider;
    /**
     * Register a link provider that can find links in text.
     */
    function registerLinkProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.linkProvider.register(languageSelector, provider);
    }
    exports.registerLinkProvider = registerLinkProvider;
    /**
     * Register a completion item provider (use by e.g. suggestions).
     */
    function registerCompletionItemProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.completionProvider.register(languageSelector, provider);
    }
    exports.registerCompletionItemProvider = registerCompletionItemProvider;
    /**
     * Register a document color provider (used by Color Picker, Color Decorator).
     */
    function registerColorProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.colorProvider.register(languageSelector, provider);
    }
    exports.registerColorProvider = registerColorProvider;
    /**
     * Register a folding range provider
     */
    function registerFoldingRangeProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.foldingRangeProvider.register(languageSelector, provider);
    }
    exports.registerFoldingRangeProvider = registerFoldingRangeProvider;
    /**
     * Register a declaration provider
     */
    function registerDeclarationProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.declarationProvider.register(languageSelector, provider);
    }
    exports.registerDeclarationProvider = registerDeclarationProvider;
    /**
     * Register a selection range provider
     */
    function registerSelectionRangeProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.selectionRangeProvider.register(languageSelector, provider);
    }
    exports.registerSelectionRangeProvider = registerSelectionRangeProvider;
    /**
     * Register a document semantic tokens provider. A semantic tokens provider will complement and enhance a
     * simple top-down tokenizer. Simple top-down tokenizers can be set either via `setMonarchTokensProvider`
     * or `setTokensProvider`.
     *
     * For the best user experience, register both a semantic tokens provider and a top-down tokenizer.
     */
    function registerDocumentSemanticTokensProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentSemanticTokensProvider.register(languageSelector, provider);
    }
    exports.registerDocumentSemanticTokensProvider = registerDocumentSemanticTokensProvider;
    /**
     * Register a document range semantic tokens provider. A semantic tokens provider will complement and enhance a
     * simple top-down tokenizer. Simple top-down tokenizers can be set either via `setMonarchTokensProvider`
     * or `setTokensProvider`.
     *
     * For the best user experience, register both a semantic tokens provider and a top-down tokenizer.
     */
    function registerDocumentRangeSemanticTokensProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentRangeSemanticTokensProvider.register(languageSelector, provider);
    }
    exports.registerDocumentRangeSemanticTokensProvider = registerDocumentRangeSemanticTokensProvider;
    /**
     * Register an inline completions provider.
     */
    function registerInlineCompletionsProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.inlineCompletionsProvider.register(languageSelector, provider);
    }
    exports.registerInlineCompletionsProvider = registerInlineCompletionsProvider;
    /**
     * Register an inlay hints provider.
     */
    function registerInlayHintsProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.inlayHintsProvider.register(languageSelector, provider);
    }
    exports.registerInlayHintsProvider = registerInlayHintsProvider;
    /**
     * @internal
     */
    function createMonacoLanguagesAPI() {
        return {
            register: register,
            getLanguages: getLanguages,
            onLanguage: onLanguage,
            onLanguageEncountered: onLanguageEncountered,
            getEncodedLanguageId: getEncodedLanguageId,
            // provider methods
            setLanguageConfiguration: setLanguageConfiguration,
            setColorMap: setColorMap,
            registerTokensProviderFactory: registerTokensProviderFactory,
            setTokensProvider: setTokensProvider,
            setMonarchTokensProvider: setMonarchTokensProvider,
            registerReferenceProvider: registerReferenceProvider,
            registerRenameProvider: registerRenameProvider,
            registerCompletionItemProvider: registerCompletionItemProvider,
            registerSignatureHelpProvider: registerSignatureHelpProvider,
            registerHoverProvider: registerHoverProvider,
            registerDocumentSymbolProvider: registerDocumentSymbolProvider,
            registerDocumentHighlightProvider: registerDocumentHighlightProvider,
            registerLinkedEditingRangeProvider: registerLinkedEditingRangeProvider,
            registerDefinitionProvider: registerDefinitionProvider,
            registerImplementationProvider: registerImplementationProvider,
            registerTypeDefinitionProvider: registerTypeDefinitionProvider,
            registerCodeLensProvider: registerCodeLensProvider,
            registerCodeActionProvider: registerCodeActionProvider,
            registerDocumentFormattingEditProvider: registerDocumentFormattingEditProvider,
            registerDocumentRangeFormattingEditProvider: registerDocumentRangeFormattingEditProvider,
            registerOnTypeFormattingEditProvider: registerOnTypeFormattingEditProvider,
            registerLinkProvider: registerLinkProvider,
            registerColorProvider: registerColorProvider,
            registerFoldingRangeProvider: registerFoldingRangeProvider,
            registerDeclarationProvider: registerDeclarationProvider,
            registerSelectionRangeProvider: registerSelectionRangeProvider,
            registerDocumentSemanticTokensProvider: registerDocumentSemanticTokensProvider,
            registerDocumentRangeSemanticTokensProvider: registerDocumentRangeSemanticTokensProvider,
            registerInlineCompletionsProvider: registerInlineCompletionsProvider,
            registerInlayHintsProvider: registerInlayHintsProvider,
            // enums
            DocumentHighlightKind: standaloneEnums.DocumentHighlightKind,
            CompletionItemKind: standaloneEnums.CompletionItemKind,
            CompletionItemTag: standaloneEnums.CompletionItemTag,
            CompletionItemInsertTextRule: standaloneEnums.CompletionItemInsertTextRule,
            SymbolKind: standaloneEnums.SymbolKind,
            SymbolTag: standaloneEnums.SymbolTag,
            IndentAction: standaloneEnums.IndentAction,
            CompletionTriggerKind: standaloneEnums.CompletionTriggerKind,
            SignatureHelpTriggerKind: standaloneEnums.SignatureHelpTriggerKind,
            InlayHintKind: standaloneEnums.InlayHintKind,
            InlineCompletionTriggerKind: standaloneEnums.InlineCompletionTriggerKind,
            CodeActionTriggerType: standaloneEnums.CodeActionTriggerType,
            // classes
            FoldingRangeKind: languages.FoldingRangeKind,
            SelectedSuggestionInfo: languages.SelectedSuggestionInfo,
        };
    }
    exports.createMonacoLanguagesAPI = createMonacoLanguagesAPI;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUxhbmd1YWdlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9zdGFuZGFsb25lL2Jyb3dzZXIvc3RhbmRhbG9uZUxhbmd1YWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF5QmhHOztPQUVHO0lBQ0gsU0FBZ0IsUUFBUSxDQUFDLFFBQWlDO1FBQ3pELHdEQUF3RDtRQUN4RCwrREFBK0Q7UUFDL0QsNkJBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBSkQsNEJBSUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLFlBQVk7UUFDM0IsSUFBSSxNQUFNLEdBQThCLEVBQUUsQ0FBQztRQUMzQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyw2QkFBYSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDckQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBSkQsb0NBSUM7SUFFRCxTQUFnQixvQkFBb0IsQ0FBQyxVQUFrQjtRQUN0RCxNQUFNLGVBQWUsR0FBRyx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsMkJBQWdCLENBQUMsQ0FBQztRQUNqRSxPQUFPLGVBQWUsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUhELG9EQUdDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsVUFBVSxDQUFDLFVBQWtCLEVBQUUsUUFBb0I7UUFDbEUsT0FBTyx1Q0FBa0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFO1lBQzNDLE1BQU0sZUFBZSxHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLEVBQUU7Z0JBQzdGLElBQUkscUJB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