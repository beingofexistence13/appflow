/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/textMate/common/TMScopeRegistry"], function (require, exports, lifecycle_1, TMScopeRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TMGrammarFactory = exports.missingTMGrammarErrorMessage = void 0;
    exports.missingTMGrammarErrorMessage = 'No TM Grammar registered for this language.';
    class TMGrammarFactory extends lifecycle_1.Disposable {
        constructor(host, grammarDefinitions, vscodeTextmate, onigLib) {
            super();
            this._host = host;
            this._initialState = vscodeTextmate.INITIAL;
            this._scopeRegistry = new TMScopeRegistry_1.TMScopeRegistry();
            this._injections = {};
            this._injectedEmbeddedLanguages = {};
            this._languageToScope = new Map();
            this._grammarRegistry = this._register(new vscodeTextmate.Registry({
                onigLib: onigLib,
                loadGrammar: async (scopeName) => {
                    const grammarDefinition = this._scopeRegistry.getGrammarDefinition(scopeName);
                    if (!grammarDefinition) {
                        this._host.logTrace(`No grammar found for scope ${scopeName}`);
                        return null;
                    }
                    const location = grammarDefinition.location;
                    try {
                        const content = await this._host.readFile(location);
                        return vscodeTextmate.parseRawGrammar(content, location.path);
                    }
                    catch (e) {
                        this._host.logError(`Unable to load and parse grammar for scope ${scopeName} from ${location}`, e);
                        return null;
                    }
                },
                getInjections: (scopeName) => {
                    const scopeParts = scopeName.split('.');
                    let injections = [];
                    for (let i = 1; i <= scopeParts.length; i++) {
                        const subScopeName = scopeParts.slice(0, i).join('.');
                        injections = [...injections, ...(this._injections[subScopeName] || [])];
                    }
                    return injections;
                }
            }));
            for (const validGrammar of grammarDefinitions) {
                this._scopeRegistry.register(validGrammar);
                if (validGrammar.injectTo) {
                    for (const injectScope of validGrammar.injectTo) {
                        let injections = this._injections[injectScope];
                        if (!injections) {
                            this._injections[injectScope] = injections = [];
                        }
                        injections.push(validGrammar.scopeName);
                    }
                    if (validGrammar.embeddedLanguages) {
                        for (const injectScope of validGrammar.injectTo) {
                            let injectedEmbeddedLanguages = this._injectedEmbeddedLanguages[injectScope];
                            if (!injectedEmbeddedLanguages) {
                                this._injectedEmbeddedLanguages[injectScope] = injectedEmbeddedLanguages = [];
                            }
                            injectedEmbeddedLanguages.push(validGrammar.embeddedLanguages);
                        }
                    }
                }
                if (validGrammar.language) {
                    this._languageToScope.set(validGrammar.language, validGrammar.scopeName);
                }
            }
        }
        has(languageId) {
            return this._languageToScope.has(languageId);
        }
        setTheme(theme, colorMap) {
            this._grammarRegistry.setTheme(theme, colorMap);
        }
        getColorMap() {
            return this._grammarRegistry.getColorMap();
        }
        async createGrammar(languageId, encodedLanguageId) {
            const scopeName = this._languageToScope.get(languageId);
            if (typeof scopeName !== 'string') {
                // No TM grammar defined
                throw new Error(exports.missingTMGrammarErrorMessage);
            }
            const grammarDefinition = this._scopeRegistry.getGrammarDefinition(scopeName);
            if (!grammarDefinition) {
                // No TM grammar defined
                throw new Error(exports.missingTMGrammarErrorMessage);
            }
            const embeddedLanguages = grammarDefinition.embeddedLanguages;
            if (this._injectedEmbeddedLanguages[scopeName]) {
                const injectedEmbeddedLanguages = this._injectedEmbeddedLanguages[scopeName];
                for (const injected of injectedEmbeddedLanguages) {
                    for (const scope of Object.keys(injected)) {
                        embeddedLanguages[scope] = injected[scope];
                    }
                }
            }
            const containsEmbeddedLanguages = (Object.keys(embeddedLanguages).length > 0);
            let grammar;
            try {
                grammar = await this._grammarRegistry.loadGrammarWithConfiguration(scopeName, encodedLanguageId, {
                    embeddedLanguages,
                    tokenTypes: grammarDefinition.tokenTypes,
                    balancedBracketSelectors: grammarDefinition.balancedBracketSelectors,
                    unbalancedBracketSelectors: grammarDefinition.unbalancedBracketSelectors,
                });
            }
            catch (err) {
                if (err.message && err.message.startsWith('No grammar provided for')) {
                    // No TM grammar defined
                    throw new Error(exports.missingTMGrammarErrorMessage);
                }
                throw err;
            }
            return {
                languageId: languageId,
                grammar: grammar,
                initialState: this._initialState,
                containsEmbeddedLanguages: containsEmbeddedLanguages,
                sourceExtensionId: grammarDefinition.sourceExtensionId,
            };
        }
    }
    exports.TMGrammarFactory = TMGrammarFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVE1HcmFtbWFyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZXh0TWF0ZS9jb21tb24vVE1HcmFtbWFyRmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQm5GLFFBQUEsNEJBQTRCLEdBQUcsNkNBQTZDLENBQUM7SUFFMUYsTUFBYSxnQkFBaUIsU0FBUSxzQkFBVTtRQVUvQyxZQUFZLElBQTJCLEVBQUUsa0JBQTZDLEVBQUUsY0FBZ0QsRUFBRSxPQUEwQjtZQUNuSyxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQztZQUM1QyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksaUNBQWUsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQywwQkFBMEIsR0FBRyxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQ2xELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQztnQkFDbEUsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLFdBQVcsRUFBRSxLQUFLLEVBQUUsU0FBaUIsRUFBRSxFQUFFO29CQUN4QyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzlFLElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsOEJBQThCLFNBQVMsRUFBRSxDQUFDLENBQUM7d0JBQy9ELE9B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