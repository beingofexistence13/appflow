/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/textMate/common/TMScopeRegistry"], function (require, exports, lifecycle_1, TMScopeRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wBb = exports.$vBb = void 0;
    exports.$vBb = 'No TM Grammar registered for this language.';
    class $wBb extends lifecycle_1.$kc {
        constructor(host, grammarDefinitions, vscodeTextmate, onigLib) {
            super();
            this.a = host;
            this.b = vscodeTextmate.INITIAL;
            this.c = new TMScopeRegistry_1.$uBb();
            this.f = {};
            this.g = {};
            this.h = new Map();
            this.j = this.B(new vscodeTextmate.Registry({
                onigLib: onigLib,
                loadGrammar: async (scopeName) => {
                    const grammarDefinition = this.c.getGrammarDefinition(scopeName);
                    if (!grammarDefinition) {
                        this.a.logTrace(`No grammar found for scope ${scopeName}`);
                        return null;
                    }
                    const location = grammarDefinition.location;
                    try {
                        const content = await this.a.readFile(location);
                        return vscodeTextmate.parseRawGrammar(content, location.path);
                    }
                    catch (e) {
                        this.a.logError(`Unable to load and parse grammar for scope ${scopeName} from ${location}`, e);
                        return null;
                    }
                },
                getInjections: (scopeName) => {
                    const scopeParts = scopeName.split('.');
                    let injections = [];
                    for (let i = 1; i <= scopeParts.length; i++) {
                        const subScopeName = scopeParts.slice(0, i).join('.');
                        injections = [...injections, ...(this.f[subScopeName] || [])];
                    }
                    return injections;
                }
            }));
            for (const validGrammar of grammarDefinitions) {
                this.c.register(validGrammar);
                if (validGrammar.injectTo) {
                    for (const injectScope of validGrammar.injectTo) {
                        let injections = this.f[injectScope];
                        if (!injections) {
                            this.f[injectScope] = injections = [];
                        }
                        injections.push(validGrammar.scopeName);
                    }
                    if (validGrammar.embeddedLanguages) {
                        for (const injectScope of validGrammar.injectTo) {
                            let injectedEmbeddedLanguages = this.g[injectScope];
                            if (!injectedEmbeddedLanguages) {
                                this.g[injectScope] = injectedEmbeddedLanguages = [];
                            }
                            injectedEmbeddedLanguages.push(validGrammar.embeddedLanguages);
                        }
                    }
                }
                if (validGrammar.language) {
                    this.h.set(validGrammar.language, validGrammar.scopeName);
                }
            }
        }
        has(languageId) {
            return this.h.has(languageId);
        }
        setTheme(theme, colorMap) {
            this.j.setTheme(theme, colorMap);
        }
        getColorMap() {
            return this.j.getColorMap();
        }
        async createGrammar(languageId, encodedLanguageId) {
            const scopeName = this.h.get(languageId);
            if (typeof scopeName !== 'string') {
                // No TM grammar defined
                throw new Error(exports.$vBb);
            }
            const grammarDefinition = this.c.getGrammarDefinition(scopeName);
            if (!grammarDefinition) {
                // No TM grammar defined
                throw new Error(exports.$vBb);
            }
            const embeddedLanguages = grammarDefinition.embeddedLanguages;
            if (this.g[scopeName]) {
                const injectedEmbeddedLanguages = this.g[scopeName];
                for (const injected of injectedEmbeddedLanguages) {
                    for (const scope of Object.keys(injected)) {
                        embeddedLanguages[scope] = injected[scope];
                    }
                }
            }
            const containsEmbeddedLanguages = (Object.keys(embeddedLanguages).length > 0);
            let grammar;
            try {
                grammar = await this.j.loadGrammarWithConfiguration(scopeName, encodedLanguageId, {
                    embeddedLanguages,
                    tokenTypes: grammarDefinition.tokenTypes,
                    balancedBracketSelectors: grammarDefinition.balancedBracketSelectors,
                    unbalancedBracketSelectors: grammarDefinition.unbalancedBracketSelectors,
                });
            }
            catch (err) {
                if (err.message && err.message.startsWith('No grammar provided for')) {
                    // No TM grammar defined
                    throw new Error(exports.$vBb);
                }
                throw err;
            }
            return {
                languageId: languageId,
                grammar: grammar,
                initialState: this.b,
                containsEmbeddedLanguages: containsEmbeddedLanguages,
                sourceExtensionId: grammarDefinition.sourceExtensionId,
            };
        }
    }
    exports.$wBb = $wBb;
});
//# sourceMappingURL=TMGrammarFactory.js.map