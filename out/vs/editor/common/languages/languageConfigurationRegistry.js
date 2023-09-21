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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/core/wordHelper", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/supports", "vs/editor/common/languages/supports/characterPair", "vs/editor/common/languages/supports/electricCharacter", "vs/editor/common/languages/supports/indentRules", "vs/editor/common/languages/supports/onEnter", "vs/editor/common/languages/supports/richEditBrackets", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/editor/common/languages/language", "vs/platform/instantiation/common/extensions", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/supports/languageBracketsConfiguration"], function (require, exports, event_1, lifecycle_1, strings, wordHelper_1, languageConfiguration_1, supports_1, characterPair_1, electricCharacter_1, indentRules_1, onEnter_1, richEditBrackets_1, instantiation_1, configuration_1, language_1, extensions_1, modesRegistry_1, languageBracketsConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResolvedLanguageConfiguration = exports.LanguageConfigurationRegistry = exports.LanguageConfigurationChangeEvent = exports.getScopedLineTokens = exports.getIndentationAtPosition = exports.LanguageConfigurationService = exports.ILanguageConfigurationService = exports.LanguageConfigurationServiceChangeEvent = void 0;
    class LanguageConfigurationServiceChangeEvent {
        constructor(languageId) {
            this.languageId = languageId;
        }
        affects(languageId) {
            return !this.languageId ? true : this.languageId === languageId;
        }
    }
    exports.LanguageConfigurationServiceChangeEvent = LanguageConfigurationServiceChangeEvent;
    exports.ILanguageConfigurationService = (0, instantiation_1.createDecorator)('languageConfigurationService');
    let LanguageConfigurationService = class LanguageConfigurationService extends lifecycle_1.Disposable {
        constructor(configurationService, languageService) {
            super();
            this.configurationService = configurationService;
            this.languageService = languageService;
            this._registry = this._register(new LanguageConfigurationRegistry());
            this.onDidChangeEmitter = this._register(new event_1.Emitter());
            this.onDidChange = this.onDidChangeEmitter.event;
            this.configurations = new Map();
            const languageConfigKeys = new Set(Object.values(customizedLanguageConfigKeys));
            this._register(this.configurationService.onDidChangeConfiguration((e) => {
                const globalConfigChanged = e.change.keys.some((k) => languageConfigKeys.has(k));
                const localConfigChanged = e.change.overrides
                    .filter(([overrideLangName, keys]) => keys.some((k) => languageConfigKeys.has(k)))
                    .map(([overrideLangName]) => overrideLangName);
                if (globalConfigChanged) {
                    this.configurations.clear();
                    this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(undefined));
                }
                else {
                    for (const languageId of localConfigChanged) {
                        if (this.languageService.isRegisteredLanguageId(languageId)) {
                            this.configurations.delete(languageId);
                            this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(languageId));
                        }
                    }
                }
            }));
            this._register(this._registry.onDidChange((e) => {
                this.configurations.delete(e.languageId);
                this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(e.languageId));
            }));
        }
        register(languageId, configuration, priority) {
            return this._registry.register(languageId, configuration, priority);
        }
        getLanguageConfiguration(languageId) {
            let result = this.configurations.get(languageId);
            if (!result) {
                result = computeConfig(languageId, this._registry, this.configurationService, this.languageService);
                this.configurations.set(languageId, result);
            }
            return result;
        }
    };
    exports.LanguageConfigurationService = LanguageConfigurationService;
    exports.LanguageConfigurationService = LanguageConfigurationService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, language_1.ILanguageService)
    ], LanguageConfigurationService);
    function computeConfig(languageId, registry, configurationService, languageService) {
        let languageConfig = registry.getLanguageConfiguration(languageId);
        if (!languageConfig) {
            if (!languageService.isRegisteredLanguageId(languageId)) {
                // this happens for the null language, which can be returned by monarch.
                // Instead of throwing an error, we just return a default config.
                return new ResolvedLanguageConfiguration(languageId, {});
            }
            languageConfig = new ResolvedLanguageConfiguration(languageId, {});
        }
        const customizedConfig = getCustomizedLanguageConfig(languageConfig.languageId, configurationService);
        const data = combineLanguageConfigurations([languageConfig.underlyingConfig, customizedConfig]);
        const config = new ResolvedLanguageConfiguration(languageConfig.languageId, data);
        return config;
    }
    const customizedLanguageConfigKeys = {
        brackets: 'editor.language.brackets',
        colorizedBracketPairs: 'editor.language.colorizedBracketPairs'
    };
    function getCustomizedLanguageConfig(languageId, configurationService) {
        const brackets = configurationService.getValue(customizedLanguageConfigKeys.brackets, {
            overrideIdentifier: languageId,
        });
        const colorizedBracketPairs = configurationService.getValue(customizedLanguageConfigKeys.colorizedBracketPairs, {
            overrideIdentifier: languageId,
        });
        return {
            brackets: validateBracketPairs(brackets),
            colorizedBracketPairs: validateBracketPairs(colorizedBracketPairs),
        };
    }
    function validateBracketPairs(data) {
        if (!Array.isArray(data)) {
            return undefined;
        }
        return data.map(pair => {
            if (!Array.isArray(pair) || pair.length !== 2) {
                return undefined;
            }
            return [pair[0], pair[1]];
        }).filter((p) => !!p);
    }
    function getIndentationAtPosition(model, lineNumber, column) {
        const lineText = model.getLineContent(lineNumber);
        let indentation = strings.getLeadingWhitespace(lineText);
        if (indentation.length > column - 1) {
            indentation = indentation.substring(0, column - 1);
        }
        return indentation;
    }
    exports.getIndentationAtPosition = getIndentationAtPosition;
    function getScopedLineTokens(model, lineNumber, columnNumber) {
        model.tokenization.forceTokenization(lineNumber);
        const lineTokens = model.tokenization.getLineTokens(lineNumber);
        const column = (typeof columnNumber === 'undefined' ? model.getLineMaxColumn(lineNumber) - 1 : columnNumber - 1);
        return (0, supports_1.createScopedLineTokens)(lineTokens, column);
    }
    exports.getScopedLineTokens = getScopedLineTokens;
    class ComposedLanguageConfiguration {
        constructor(languageId) {
            this.languageId = languageId;
            this._resolved = null;
            this._entries = [];
            this._order = 0;
            this._resolved = null;
        }
        register(configuration, priority) {
            const entry = new LanguageConfigurationContribution(configuration, priority, ++this._order);
            this._entries.push(entry);
            this._resolved = null;
            return (0, lifecycle_1.toDisposable)(() => {
                for (let i = 0; i < this._entries.length; i++) {
                    if (this._entries[i] === entry) {
                        this._entries.splice(i, 1);
                        this._resolved = null;
                        break;
                    }
                }
            });
        }
        getResolvedConfiguration() {
            if (!this._resolved) {
                const config = this._resolve();
                if (config) {
                    this._resolved = new ResolvedLanguageConfiguration(this.languageId, config);
                }
            }
            return this._resolved;
        }
        _resolve() {
            if (this._entries.length === 0) {
                return null;
            }
            this._entries.sort(LanguageConfigurationContribution.cmp);
            return combineLanguageConfigurations(this._entries.map(e => e.configuration));
        }
    }
    function combineLanguageConfigurations(configs) {
        let result = {
            comments: undefined,
            brackets: undefined,
            wordPattern: undefined,
            indentationRules: undefined,
            onEnterRules: undefined,
            autoClosingPairs: undefined,
            surroundingPairs: undefined,
            autoCloseBefore: undefined,
            folding: undefined,
            colorizedBracketPairs: undefined,
            __electricCharacterSupport: undefined,
        };
        for (const entry of configs) {
            result = {
                comments: entry.comments || result.comments,
                brackets: entry.brackets || result.brackets,
                wordPattern: entry.wordPattern || result.wordPattern,
                indentationRules: entry.indentationRules || result.indentationRules,
                onEnterRules: entry.onEnterRules || result.onEnterRules,
                autoClosingPairs: entry.autoClosingPairs || result.autoClosingPairs,
                surroundingPairs: entry.surroundingPairs || result.surroundingPairs,
                autoCloseBefore: entry.autoCloseBefore || result.autoCloseBefore,
                folding: entry.folding || result.folding,
                colorizedBracketPairs: entry.colorizedBracketPairs || result.colorizedBracketPairs,
                __electricCharacterSupport: entry.__electricCharacterSupport || result.__electricCharacterSupport,
            };
        }
        return result;
    }
    class LanguageConfigurationContribution {
        constructor(configuration, priority, order) {
            this.configuration = configuration;
            this.priority = priority;
            this.order = order;
        }
        static cmp(a, b) {
            if (a.priority === b.priority) {
                // higher order last
                return a.order - b.order;
            }
            // higher priority last
            return a.priority - b.priority;
        }
    }
    class LanguageConfigurationChangeEvent {
        constructor(languageId) {
            this.languageId = languageId;
        }
    }
    exports.LanguageConfigurationChangeEvent = LanguageConfigurationChangeEvent;
    class LanguageConfigurationRegistry extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._entries = new Map();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(this.register(modesRegistry_1.PLAINTEXT_LANGUAGE_ID, {
                brackets: [
                    ['(', ')'],
                    ['[', ']'],
                    ['{', '}'],
                ],
                surroundingPairs: [
                    { open: '{', close: '}' },
                    { open: '[', close: ']' },
                    { open: '(', close: ')' },
                    { open: '<', close: '>' },
                    { open: '\"', close: '\"' },
                    { open: '\'', close: '\'' },
                    { open: '`', close: '`' },
                ],
                colorizedBracketPairs: [],
                folding: {
                    offSide: true
                }
            }, 0));
        }
        /**
         * @param priority Use a higher number for higher priority
         */
        register(languageId, configuration, priority = 0) {
            let entries = this._entries.get(languageId);
            if (!entries) {
                entries = new ComposedLanguageConfiguration(languageId);
                this._entries.set(languageId, entries);
            }
            const disposable = entries.register(configuration, priority);
            this._onDidChange.fire(new LanguageConfigurationChangeEvent(languageId));
            return (0, lifecycle_1.toDisposable)(() => {
                disposable.dispose();
                this._onDidChange.fire(new LanguageConfigurationChangeEvent(languageId));
            });
        }
        getLanguageConfiguration(languageId) {
            const entries = this._entries.get(languageId);
            return entries?.getResolvedConfiguration() || null;
        }
    }
    exports.LanguageConfigurationRegistry = LanguageConfigurationRegistry;
    /**
     * Immutable.
    */
    class ResolvedLanguageConfiguration {
        constructor(languageId, underlyingConfig) {
            this.languageId = languageId;
            this.underlyingConfig = underlyingConfig;
            this._brackets = null;
            this._electricCharacter = null;
            this._onEnterSupport =
                this.underlyingConfig.brackets ||
                    this.underlyingConfig.indentationRules ||
                    this.underlyingConfig.onEnterRules
                    ? new onEnter_1.OnEnterSupport(this.underlyingConfig)
                    : null;
            this.comments = ResolvedLanguageConfiguration._handleComments(this.underlyingConfig);
            this.characterPair = new characterPair_1.CharacterPairSupport(this.underlyingConfig);
            this.wordDefinition = this.underlyingConfig.wordPattern || wordHelper_1.DEFAULT_WORD_REGEXP;
            this.indentationRules = this.underlyingConfig.indentationRules;
            if (this.underlyingConfig.indentationRules) {
                this.indentRulesSupport = new indentRules_1.IndentRulesSupport(this.underlyingConfig.indentationRules);
            }
            else {
                this.indentRulesSupport = null;
            }
            this.foldingRules = this.underlyingConfig.folding || {};
            this.bracketsNew = new languageBracketsConfiguration_1.LanguageBracketsConfiguration(languageId, this.underlyingConfig);
        }
        getWordDefinition() {
            return (0, wordHelper_1.ensureValidWordDefinition)(this.wordDefinition);
        }
        get brackets() {
            if (!this._brackets && this.underlyingConfig.brackets) {
                this._brackets = new richEditBrackets_1.RichEditBrackets(this.languageId, this.underlyingConfig.brackets);
            }
            return this._brackets;
        }
        get electricCharacter() {
            if (!this._electricCharacter) {
                this._electricCharacter = new electricCharacter_1.BracketElectricCharacterSupport(this.brackets);
            }
            return this._electricCharacter;
        }
        onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
            if (!this._onEnterSupport) {
                return null;
            }
            return this._onEnterSupport.onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText);
        }
        getAutoClosingPairs() {
            return new languageConfiguration_1.AutoClosingPairs(this.characterPair.getAutoClosingPairs());
        }
        getAutoCloseBeforeSet(forQuotes) {
            return this.characterPair.getAutoCloseBeforeSet(forQuotes);
        }
        getSurroundingPairs() {
            return this.characterPair.getSurroundingPairs();
        }
        static _handleComments(conf) {
            const commentRule = conf.comments;
            if (!commentRule) {
                return null;
            }
            // comment configuration
            const comments = {};
            if (commentRule.lineComment) {
                comments.lineCommentToken = commentRule.lineComment;
            }
            if (commentRule.blockComment) {
                const [blockStart, blockEnd] = commentRule.blockComment;
                comments.blockCommentStartToken = blockStart;
                comments.blockCommentEndToken = blockEnd;
            }
            return comments;
        }
    }
    exports.ResolvedLanguageConfiguration = ResolvedLanguageConfiguration;
    (0, extensions_1.registerSingleton)(exports.ILanguageConfigurationService, LanguageConfigurationService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VDb25maWd1cmF0aW9uUmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlcy9sYW5ndWFnZUNvbmZpZ3VyYXRpb25SZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE2Q2hHLE1BQWEsdUNBQXVDO1FBQ25ELFlBQTRCLFVBQThCO1lBQTlCLGVBQVUsR0FBVixVQUFVLENBQW9CO1FBQUksQ0FBQztRQUV4RCxPQUFPLENBQUMsVUFBa0I7WUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUM7UUFDakUsQ0FBQztLQUNEO0lBTkQsMEZBTUM7SUFFWSxRQUFBLDZCQUE2QixHQUFHLElBQUEsK0JBQWUsRUFBZ0MsOEJBQThCLENBQUMsQ0FBQztJQUVySCxJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE2QixTQUFRLHNCQUFVO1FBVTNELFlBQ3dCLG9CQUE0RCxFQUNqRSxlQUFrRDtZQUVwRSxLQUFLLEVBQUUsQ0FBQztZQUhnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2hELG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQVRwRCxjQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUE2QixFQUFFLENBQUMsQ0FBQztZQUVoRSx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUEyQyxDQUFDLENBQUM7WUFDN0YsZ0JBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1lBRTNDLG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQXlDLENBQUM7WUFRbEYsTUFBTSxrQkFBa0IsR0FBRyxJQUFJ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