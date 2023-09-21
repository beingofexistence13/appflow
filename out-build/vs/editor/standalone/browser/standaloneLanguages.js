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
        modesRegistry_1.$Xt.registerLanguage(language);
    }
    exports.register = register;
    /**
     * Get the information of all the registered languages.
     */
    function getLanguages() {
        let result = [];
        result = result.concat(modesRegistry_1.$Xt.getLanguages());
        return result;
    }
    exports.getLanguages = getLanguages;
    function getEncodedLanguageId(languageId) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.$ct);
        return languageService.languageIdCodec.encodeLanguageId(languageId);
    }
    exports.getEncodedLanguageId = getEncodedLanguageId;
    /**
     * An event emitted when a language is associated for the first time with a text model.
     * @event
     */
    function onLanguage(languageId, callback) {
        return standaloneServices_1.StandaloneServices.withServices(() => {
            const languageService = standaloneServices_1.StandaloneServices.get(language_1.$ct);
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
            const languageService = standaloneServices_1.StandaloneServices.get(language_1.$ct);
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
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.$ct);
        if (!languageService.isRegisteredLanguageId(languageId)) {
            throw new Error(`Cannot set configuration for unknown language ${languageId}`);
        }
        const languageConfigurationService = standaloneServices_1.StandaloneServices.get(languageConfigurationRegistry_1.$2t);
        return languageConfigurationService.register(languageId, configuration, 100);
    }
    exports.setLanguageConfiguration = setLanguageConfiguration;
    /**
     * @internal
     */
    class EncodedTokenizationSupportAdapter {
        constructor(languageId, actual) {
            this.a = languageId;
            this.b = actual;
        }
        dispose() {
            // NOOP
        }
        getInitialState() {
            return this.b.getInitialState();
        }
        tokenize(line, hasEOL, state) {
            if (typeof this.b.tokenize === 'function') {
                return TokenizationSupportAdapter.adaptTokenize(this.a, this.b, line, state);
            }
            throw new Error('Not supported!');
        }
        tokenizeEncoded(line, hasEOL, state) {
            const result = this.b.tokenizeEncoded(line, state);
            return new languages.$6s(result.tokens, result.endState);
        }
    }
    exports.EncodedTokenizationSupportAdapter = EncodedTokenizationSupportAdapter;
    /**
     * @internal
     */
    class TokenizationSupportAdapter {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        dispose() {
            // NOOP
        }
        getInitialState() {
            return this.b.getInitialState();
        }
        static e(tokens, language) {
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
                result[i] = new languages.$4s(startIndex, t.scopes, language);
                previousStartIndex = startIndex;
            }
            return result;
        }
        static adaptTokenize(language, actual, line, state) {
            const actualResult = actual.tokenize(line, state);
            const tokens = TokenizationSupportAdapter.e(actualResult.tokens, language);
            let endState;
            // try to save an object if possible
            if (actualResult.endState.equals(state)) {
                endState = state;
            }
            else {
                endState = actualResult.endState;
            }
            return new languages.$5s(tokens, endState);
        }
        tokenize(line, hasEOL, state) {
            return TokenizationSupportAdapter.adaptTokenize(this.a, this.b, line, state);
        }
        f(languageIdCodec, tokens) {
            const languageId = languageIdCodec.encodeLanguageId(this.a);
            const tokenTheme = this.d.getColorTheme().tokenTheme;
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
            const actualResult = this.b.tokenize(line, state);
            const tokens = this.f(this.c.languageIdCodec, actualResult.tokens);
            let endState;
            // try to save an object if possible
            if (actualResult.endState.equals(state)) {
                endState = state;
            }
            else {
                endState = actualResult.endState;
            }
            return new languages.$6s(tokens, endState);
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
        const standaloneThemeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.$D8b);
        if (colorMap) {
            const result = [null];
            for (let i = 1, len = colorMap.length; i < len; i++) {
                result[i] = color_1.$Os.fromHex(colorMap[i]);
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
            return new TokenizationSupportAdapter(languageId, provider, standaloneServices_1.StandaloneServices.get(language_1.$ct), standaloneServices_1.StandaloneServices.get(standaloneTheme_1.$D8b));
        }
    }
    /**
     * Register a tokens provider factory for a language. This tokenizer will be exclusive with a tokenizer
     * set using `setTokensProvider` or one created using `setMonarchTokensProvider`, but will work together
     * with a tokens provider set using `registerDocumentSemanticTokensProvider` or `registerDocumentRangeSemanticTokensProvider`.
     */
    function registerTokensProviderFactory(languageId, factory) {
        const adaptedFactory = new languages.$at(async () => {
            const result = await Promise.resolve(factory.create());
            if (!result) {
                return null;
            }
            if (isATokensProvider(result)) {
                return createTokenizationSupportAdapter(languageId, result);
            }
            return new monarchLexer_1.$E8b(standaloneServices_1.StandaloneServices.get(language_1.$ct), standaloneServices_1.StandaloneServices.get(standaloneTheme_1.$D8b), languageId, (0, monarchCompile_1.$y9b)(languageId, result), standaloneServices_1.StandaloneServices.get(configuration_1.$8h));
        });
        return languages.$bt.registerFactory(languageId, adaptedFactory);
    }
    exports.registerTokensProviderFactory = registerTokensProviderFactory;
    /**
     * Set the tokens provider for a language (manual implementation). This tokenizer will be exclusive
     * with a tokenizer created using `setMonarchTokensProvider`, or with `registerTokensProviderFactory`,
     * but will work together with a tokens provider set using `registerDocumentSemanticTokensProvider`
     * or `registerDocumentRangeSemanticTokensProvider`.
     */
    function setTokensProvider(languageId, provider) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.$ct);
        if (!languageService.isRegisteredLanguageId(languageId)) {
            throw new Error(`Cannot set tokens provider for unknown language ${languageId}`);
        }
        if (isThenable(provider)) {
            return registerTokensProviderFactory(languageId, { create: () => provider });
        }
        return languages.$bt.register(languageId, createTokenizationSupportAdapter(languageId, provider));
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
            return new monarchLexer_1.$E8b(standaloneServices_1.StandaloneServices.get(language_1.$ct), standaloneServices_1.StandaloneServices.get(standaloneTheme_1.$D8b), languageId, (0, monarchCompile_1.$y9b)(languageId, languageDef), standaloneServices_1.StandaloneServices.get(configuration_1.$8h));
        };
        if (isThenable(languageDef)) {
            return registerTokensProviderFactory(languageId, { create: () => languageDef });
        }
        return languages.$bt.register(languageId, create(languageDef));
    }
    exports.setMonarchTokensProvider = setMonarchTokensProvider;
    /**
     * Register a reference provider (used by e.g. reference search).
     */
    function registerReferenceProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.referenceProvider.register(languageSelector, provider);
    }
    exports.registerReferenceProvider = registerReferenceProvider;
    /**
     * Register a rename provider (used by e.g. rename symbol).
     */
    function registerRenameProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.renameProvider.register(languageSelector, provider);
    }
    exports.registerRenameProvider = registerRenameProvider;
    /**
     * Register a signature help provider (used by e.g. parameter hints).
     */
    function registerSignatureHelpProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.signatureHelpProvider.register(languageSelector, provider);
    }
    exports.registerSignatureHelpProvider = registerSignatureHelpProvider;
    /**
     * Register a hover provider (used by e.g. editor hover).
     */
    function registerHoverProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.hoverProvider.register(languageSelector, {
            provideHover: (model, position, token) => {
                const word = model.getWordAtPosition(position);
                return Promise.resolve(provider.provideHover(model, position, token)).then((value) => {
                    if (!value) {
                        return undefined;
                    }
                    if (!value.range && word) {
                        value.range = new range_1.$ks(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
                    }
                    if (!value.range) {
                        value.range = new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column);
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
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.documentSymbolProvider.register(languageSelector, provider);
    }
    exports.registerDocumentSymbolProvider = registerDocumentSymbolProvider;
    /**
     * Register a document highlight provider (used by e.g. highlight occurrences).
     */
    function registerDocumentHighlightProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.documentHighlightProvider.register(languageSelector, provider);
    }
    exports.registerDocumentHighlightProvider = registerDocumentHighlightProvider;
    /**
     * Register an linked editing range provider.
     */
    function registerLinkedEditingRangeProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.linkedEditingRangeProvider.register(languageSelector, provider);
    }
    exports.registerLinkedEditingRangeProvider = registerLinkedEditingRangeProvider;
    /**
     * Register a definition provider (used by e.g. go to definition).
     */
    function registerDefinitionProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.definitionProvider.register(languageSelector, provider);
    }
    exports.registerDefinitionProvider = registerDefinitionProvider;
    /**
     * Register a implementation provider (used by e.g. go to implementation).
     */
    function registerImplementationProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.implementationProvider.register(languageSelector, provider);
    }
    exports.registerImplementationProvider = registerImplementationProvider;
    /**
     * Register a type definition provider (used by e.g. go to type definition).
     */
    function registerTypeDefinitionProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.typeDefinitionProvider.register(languageSelector, provider);
    }
    exports.registerTypeDefinitionProvider = registerTypeDefinitionProvider;
    /**
     * Register a code lens provider (used by e.g. inline code lenses).
     */
    function registerCodeLensProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.codeLensProvider.register(languageSelector, provider);
    }
    exports.registerCodeLensProvider = registerCodeLensProvider;
    /**
     * Register a code action provider (used by e.g. quick fix).
     */
    function registerCodeActionProvider(languageSelector, provider, metadata) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.codeActionProvider.register(languageSelector, {
            providedCodeActionKinds: metadata?.providedCodeActionKinds,
            documentation: metadata?.documentation,
            provideCodeActions: (model, range, context, token) => {
                const markerService = standaloneServices_1.StandaloneServices.get(markers_1.$3s);
                const markers = markerService.read({ resource: model.uri }).filter(m => {
                    return range_1.$ks.areIntersectingOrTouching(m, range);
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
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.documentFormattingEditProvider.register(languageSelector, provider);
    }
    exports.registerDocumentFormattingEditProvider = registerDocumentFormattingEditProvider;
    /**
     * Register a formatter that can handle a range inside a model.
     */
    function registerDocumentRangeFormattingEditProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.documentRangeFormattingEditProvider.register(languageSelector, provider);
    }
    exports.registerDocumentRangeFormattingEditProvider = registerDocumentRangeFormattingEditProvider;
    /**
     * Register a formatter than can do formatting as the user types.
     */
    function registerOnTypeFormattingEditProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.onTypeFormattingEditProvider.register(languageSelector, provider);
    }
    exports.registerOnTypeFormattingEditProvider = registerOnTypeFormattingEditProvider;
    /**
     * Register a link provider that can find links in text.
     */
    function registerLinkProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.linkProvider.register(languageSelector, provider);
    }
    exports.registerLinkProvider = registerLinkProvider;
    /**
     * Register a completion item provider (use by e.g. suggestions).
     */
    function registerCompletionItemProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.completionProvider.register(languageSelector, provider);
    }
    exports.registerCompletionItemProvider = registerCompletionItemProvider;
    /**
     * Register a document color provider (used by Color Picker, Color Decorator).
     */
    function registerColorProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.colorProvider.register(languageSelector, provider);
    }
    exports.registerColorProvider = registerColorProvider;
    /**
     * Register a folding range provider
     */
    function registerFoldingRangeProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.foldingRangeProvider.register(languageSelector, provider);
    }
    exports.registerFoldingRangeProvider = registerFoldingRangeProvider;
    /**
     * Register a declaration provider
     */
    function registerDeclarationProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.declarationProvider.register(languageSelector, provider);
    }
    exports.registerDeclarationProvider = registerDeclarationProvider;
    /**
     * Register a selection range provider
     */
    function registerSelectionRangeProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
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
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
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
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.documentRangeSemanticTokensProvider.register(languageSelector, provider);
    }
    exports.registerDocumentRangeSemanticTokensProvider = registerDocumentRangeSemanticTokensProvider;
    /**
     * Register an inline completions provider.
     */
    function registerInlineCompletionsProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
        return languageFeaturesService.inlineCompletionsProvider.register(languageSelector, provider);
    }
    exports.registerInlineCompletionsProvider = registerInlineCompletionsProvider;
    /**
     * Register an inlay hints provider.
     */
    function registerInlayHintsProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.$hF);
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
            FoldingRangeKind: languages.$_s,
            SelectedSuggestionInfo: languages.$7s,
        };
    }
    exports.createMonacoLanguagesAPI = createMonacoLanguagesAPI;
});
//# sourceMappingURL=standaloneLanguages.js.map