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
define(["require", "exports", "vs/amdX", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/observable", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/types", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/supports/tokenization", "vs/nls!vs/workbench/services/textMate/browser/textMateTokenizationFeatureImpl", "vs/platform/configuration/common/configuration", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport", "vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit", "vs/workbench/services/textMate/browser/backgroundTokenization/threadedBackgroundTokenizerFactory", "vs/workbench/services/textMate/common/TMGrammarFactory", "vs/workbench/services/textMate/common/TMGrammars", "vs/workbench/services/themes/common/workbenchThemeService"], function (require, exports, amdX_1, dom, arrays_1, color_1, errors_1, lifecycle_1, network_1, observable_1, platform_1, resources, types, languages_1, language_1, tokenization_1, nls, configuration_1, extensionResourceLoader_1, instantiation_1, log_1, notification_1, progress_1, telemetry_1, environmentService_1, textMateTokenizationSupport_1, tokenizationSupportWithLineLimit_1, threadedBackgroundTokenizerFactory_1, TMGrammarFactory_1, TMGrammars_1, workbenchThemeService_1) {
    "use strict";
    var $HBb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HBb = void 0;
    let $HBb = class $HBb extends lifecycle_1.$kc {
        static { $HBb_1 = this; }
        static { this.c = { sync: 0, async: 0 }; }
        constructor(z, C, D, F, G, H, I, J, L, M) {
            super();
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.g = [];
            this.h = [];
            this.j = false;
            this.m = () => { };
            this.n = null;
            this.s = null;
            this.t = new lifecycle_1.$jc();
            this.u = null;
            this.w = null;
            this.y = this.L.createInstance(threadedBackgroundTokenizerFactory_1.$FBb, (timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) => this.$(timeMs, languageId, sourceExtensionId, lineLength, true, isRandomSample), () => this.N());
            this.X = null;
            this.f = dom.$XO();
            this.f.className = 'vscode-tokens-styles';
            TMGrammars_1.$GBb.setHandler((extensions) => this.P(extensions));
            this.W(this.C.getColorTheme(), true);
            this.B(this.C.onDidColorThemeChange(() => {
                this.W(this.C.getColorTheme(), false);
            }));
            this.z.onDidRequestRichLanguageFeatures((languageId) => {
                this.g.push(languageId);
            });
        }
        N() {
            return !!this.H.getValue('editor.experimental.asyncTokenization');
        }
        O() {
            return !!this.H.getValue('editor.experimental.asyncTokenizationVerification');
        }
        P(extensions) {
            this.n = null;
            if (this.s) {
                this.s.dispose();
                this.s = null;
            }
            this.t.clear();
            this.n = [];
            for (const extension of extensions) {
                const grammars = extension.value;
                for (const grammar of grammars) {
                    const validatedGrammar = this.Q(extension, grammar);
                    if (validatedGrammar) {
                        this.n.push(validatedGrammar);
                        if (validatedGrammar.language) {
                            const lazyTokenizationSupport = new languages_1.$at(() => this.U(validatedGrammar.language));
                            this.t.add(lazyTokenizationSupport);
                            this.t.add(languages_1.$bt.registerFactory(validatedGrammar.language, lazyTokenizationSupport));
                        }
                    }
                }
            }
            this.y.setGrammarDefinitions(this.n);
            for (const createdMode of this.g) {
                languages_1.$bt.getOrCreate(createdMode);
            }
        }
        Q(extension, grammar) {
            if (!validateGrammarExtensionPoint(extension.description.extensionLocation, grammar, extension.collector, this.z)) {
                return null;
            }
            const grammarLocation = resources.$ig(extension.description.extensionLocation, grammar.path);
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
                    if (this.z.isRegisteredLanguageId(language)) {
                        embeddedLanguages[scope] = this.z.languageIdCodec.encodeLanguageId(language);
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
            const validLanguageId = grammar.language && this.z.isRegisteredLanguageId(grammar.language) ? grammar.language : null;
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
            if (this.j) {
                this.F.error(nls.localize(0, null));
                return;
            }
            this.m = printFn;
            this.j = true;
            if (this.j) {
                this.I.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    buttons: [nls.localize(1, null)]
                }, (progress) => {
                    progress.report({
                        message: nls.localize(2, null)
                    });
                    return this.Y().then((vscodeOniguruma) => {
                        vscodeOniguruma.setDefaultDebugCall(true);
                        progress.report({
                            message: nls.localize(3, null)
                        });
                        return new Promise((resolve, reject) => { });
                    });
                }, (choice) => {
                    this.Y().then((vscodeOniguruma) => {
                        this.m = () => { };
                        this.j = false;
                        vscodeOniguruma.setDefaultDebugCall(false);
                        onStop();
                    });
                });
            }
        }
        R() {
            // Check if extension point is ready
            return !!this.n;
        }
        async S() {
            if (this.s) {
                return this.s;
            }
            const [vscodeTextmate, vscodeOniguruma] = await Promise.all([(0, amdX_1.$aD)('vscode-textmate', 'release/main.js'), this.Y()]);
            const onigLib = Promise.resolve({
                createOnigScanner: (sources) => vscodeOniguruma.createOnigScanner(sources),
                createOnigString: (str) => vscodeOniguruma.createOnigString(str)
            });
            // Avoid duplicate instantiations
            if (this.s) {
                return this.s;
            }
            this.s = new TMGrammarFactory_1.$wBb({
                logTrace: (msg) => this.G.trace(msg),
                logError: (msg, err) => this.G.error(msg, err),
                readFile: (resource) => this.D.readExtensionResource(resource)
            }, this.n || [], vscodeTextmate, onigLib);
            this.W(this.C.getColorTheme(), true);
            return this.s;
        }
        async U(languageId) {
            if (!this.z.isRegisteredLanguageId(languageId)) {
                return null;
            }
            if (!this.R()) {
                return null;
            }
            try {
                const grammarFactory = await this.S();
                if (!grammarFactory.has(languageId)) {
                    return null;
                }
                const encodedLanguageId = this.z.languageIdCodec.encodeLanguageId(languageId);
                const r = await grammarFactory.createGrammar(languageId, encodedLanguageId);
                if (!r.grammar) {
                    return null;
                }
                const maxTokenizationLineLength = observableConfigValue('editor.maxTokenizationLineLength', languageId, -1, this.H);
                const tokenization = new textMateTokenizationSupport_1.$rBb(r.grammar, r.initialState, r.containsEmbeddedLanguages, (textModel, tokenStore) => this.y.createBackgroundTokenizer(textModel, tokenStore, maxTokenizationLineLength), () => this.O(), (timeMs, lineLength, isRandomSample) => {
                    this.$(timeMs, languageId, r.sourceExtensionId, lineLength, false, isRandomSample);
                }, true);
                tokenization.onDidEncounterLanguage((encodedLanguageId) => {
                    if (!this.h[encodedLanguageId]) {
                        const languageId = this.z.languageIdCodec.decodeLanguageId(encodedLanguageId);
                        this.h[encodedLanguageId] = true;
                        this.z.requestBasicLanguageFeatures(languageId);
                    }
                });
                return new tokenizationSupportWithLineLimit_1.$sBb(encodedLanguageId, tokenization, maxTokenizationLineLength);
            }
            catch (err) {
                if (err.message && err.message === TMGrammarFactory_1.$vBb) {
                    // Don't log this error message
                    return null;
                }
                (0, errors_1.$Y)(err);
                return null;
            }
        }
        W(colorTheme, forceUpdate) {
            if (!forceUpdate && this.u && this.w && equalsTokenRules(this.u.settings, colorTheme.tokenColors)
                && (0, arrays_1.$sb)(this.w, colorTheme.tokenColorMap)) {
                return;
            }
            this.u = { name: colorTheme.label, settings: colorTheme.tokenColors };
            this.w = colorTheme.tokenColorMap;
            this.s?.setTheme(this.u, this.w);
            const colorMap = toColorMap(this.w);
            const cssRules = (0, tokenization_1.$Rob)(colorMap);
            this.f.textContent = cssRules;
            languages_1.$bt.setColorMap(colorMap);
            if (this.u && this.w) {
                this.y.acceptTheme(this.u, this.w);
            }
        }
        async createTokenizer(languageId) {
            if (!this.z.isRegisteredLanguageId(languageId)) {
                return null;
            }
            const grammarFactory = await this.S();
            if (!grammarFactory.has(languageId)) {
                return null;
            }
            const encodedLanguageId = this.z.languageIdCodec.encodeLanguageId(languageId);
            const { grammar } = await grammarFactory.createGrammar(languageId, encodedLanguageId);
            return grammar;
        }
        Y() {
            if (!this.X) {
                this.X = (async () => {
                    const [vscodeOniguruma, wasm] = await Promise.all([(0, amdX_1.$aD)('vscode-oniguruma', 'release/main.js'), this.Z()]);
                    await vscodeOniguruma.loadWASM({
                        data: wasm,
                        print: (str) => {
                            this.m(str);
                        }
                    });
                    return vscodeOniguruma;
                })();
            }
            return this.X;
        }
        async Z() {
            if (platform_1.$o) {
                const response = await fetch(network_1.$2f.asBrowserUri('vscode-oniguruma/../onig.wasm').toString(true));
                // Using the response directly only works if the server sets the MIME type 'application/wasm'.
                // Otherwise, a TypeError is thrown when using the streaming compiler.
                // We therefore use the non-streaming compiler :(.
                return await response.arrayBuffer();
            }
            else {
                const response = await fetch(this.J.isBuilt
                    ? network_1.$2f.asBrowserUri(`${network_1.$1f}/vscode-oniguruma/release/onig.wasm`).toString(true)
                    : network_1.$2f.asBrowserUri(`${network_1.$Yf}/vscode-oniguruma/release/onig.wasm`).toString(true));
                return response;
            }
        }
        $(timeMs, languageId, sourceExtensionId, lineLength, fromWorker, isRandomSample) {
            const key = fromWorker ? 'async' : 'sync';
            // 50 events per hour (one event has a low probability)
            if ($HBb_1.c[key] > 50) {
                // Don't flood telemetry with too many events
                return;
            }
            if ($HBb_1.c[key] === 0) {
                setTimeout(() => {
                    $HBb_1.c[key] = 0;
                }, 1000 * 60 * 60);
            }
            $HBb_1.c[key]++;
            this.M.publicLog2('editor.tokenizedLine', {
                timeMs,
                languageId,
                lineLength,
                fromWorker,
                sourceExtensionId,
                isRandomSample,
                tokenizationSetting: this.N() ? (this.O() ? 2 : 1) : 0,
            });
        }
    };
    exports.$HBb = $HBb;
    exports.$HBb = $HBb = $HBb_1 = __decorate([
        __param(0, language_1.$ct),
        __param(1, workbenchThemeService_1.$egb),
        __param(2, extensionResourceLoader_1.$2$),
        __param(3, notification_1.$Yu),
        __param(4, log_1.$5i),
        __param(5, configuration_1.$8h),
        __param(6, progress_1.$2u),
        __param(7, environmentService_1.$hJ),
        __param(8, instantiation_1.$Ah),
        __param(9, telemetry_1.$9k)
    ], $HBb);
    function toColorMap(colorMap) {
        const result = [null];
        for (let i = 1, len = colorMap.length; i < len; i++) {
            result[i] = color_1.$Os.fromHex(colorMap[i]);
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
            collector.error(nls.localize(4, null, TMGrammars_1.$GBb.name, String(syntax.language)));
            return false;
        }
        if (!syntax.scopeName || (typeof syntax.scopeName !== 'string')) {
            collector.error(nls.localize(5, null, TMGrammars_1.$GBb.name, String(syntax.scopeName)));
            return false;
        }
        if (!syntax.path || (typeof syntax.path !== 'string')) {
            collector.error(nls.localize(6, null, TMGrammars_1.$GBb.name, String(syntax.path)));
            return false;
        }
        if (syntax.injectTo && (!Array.isArray(syntax.injectTo) || syntax.injectTo.some(scope => typeof scope !== 'string'))) {
            collector.error(nls.localize(7, null, TMGrammars_1.$GBb.name, JSON.stringify(syntax.injectTo)));
            return false;
        }
        if (syntax.embeddedLanguages && !types.$lf(syntax.embeddedLanguages)) {
            collector.error(nls.localize(8, null, TMGrammars_1.$GBb.name, JSON.stringify(syntax.embeddedLanguages)));
            return false;
        }
        if (syntax.tokenTypes && !types.$lf(syntax.tokenTypes)) {
            collector.error(nls.localize(9, null, TMGrammars_1.$GBb.name, JSON.stringify(syntax.tokenTypes)));
            return false;
        }
        const grammarLocation = resources.$ig(extensionLocation, syntax.path);
        if (!resources.$cg(grammarLocation, extensionLocation)) {
            collector.warn(nls.localize(10, null, TMGrammars_1.$GBb.name, grammarLocation.path, extensionLocation.path));
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
//# sourceMappingURL=textMateTokenizationFeatureImpl.js.map