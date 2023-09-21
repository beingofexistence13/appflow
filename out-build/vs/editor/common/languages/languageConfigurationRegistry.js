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
    exports.$8t = exports.$7t = exports.$6t = exports.$5t = exports.$4t = exports.$3t = exports.$2t = exports.$1t = void 0;
    class $1t {
        constructor(languageId) {
            this.languageId = languageId;
        }
        affects(languageId) {
            return !this.languageId ? true : this.languageId === languageId;
        }
    }
    exports.$1t = $1t;
    exports.$2t = (0, instantiation_1.$Bh)('languageConfigurationService');
    let $3t = class $3t extends lifecycle_1.$kc {
        constructor(h, j) {
            super();
            this.h = h;
            this.j = j;
            this.c = this.B(new $7t());
            this.f = this.B(new event_1.$fd());
            this.onDidChange = this.f.event;
            this.g = new Map();
            const languageConfigKeys = new Set(Object.values(customizedLanguageConfigKeys));
            this.B(this.h.onDidChangeConfiguration((e) => {
                const globalConfigChanged = e.change.keys.some((k) => languageConfigKeys.has(k));
                const localConfigChanged = e.change.overrides
                    .filter(([overrideLangName, keys]) => keys.some((k) => languageConfigKeys.has(k)))
                    .map(([overrideLangName]) => overrideLangName);
                if (globalConfigChanged) {
                    this.g.clear();
                    this.f.fire(new $1t(undefined));
                }
                else {
                    for (const languageId of localConfigChanged) {
                        if (this.j.isRegisteredLanguageId(languageId)) {
                            this.g.delete(languageId);
                            this.f.fire(new $1t(languageId));
                        }
                    }
                }
            }));
            this.B(this.c.onDidChange((e) => {
                this.g.delete(e.languageId);
                this.f.fire(new $1t(e.languageId));
            }));
        }
        register(languageId, configuration, priority) {
            return this.c.register(languageId, configuration, priority);
        }
        getLanguageConfiguration(languageId) {
            let result = this.g.get(languageId);
            if (!result) {
                result = computeConfig(languageId, this.c, this.h, this.j);
                this.g.set(languageId, result);
            }
            return result;
        }
    };
    exports.$3t = $3t;
    exports.$3t = $3t = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, language_1.$ct)
    ], $3t);
    function computeConfig(languageId, registry, configurationService, languageService) {
        let languageConfig = registry.getLanguageConfiguration(languageId);
        if (!languageConfig) {
            if (!languageService.isRegisteredLanguageId(languageId)) {
                // this happens for the null language, which can be returned by monarch.
                // Instead of throwing an error, we just return a default config.
                return new $8t(languageId, {});
            }
            languageConfig = new $8t(languageId, {});
        }
        const customizedConfig = getCustomizedLanguageConfig(languageConfig.languageId, configurationService);
        const data = combineLanguageConfigurations([languageConfig.underlyingConfig, customizedConfig]);
        const config = new $8t(languageConfig.languageId, data);
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
    function $4t(model, lineNumber, column) {
        const lineText = model.getLineContent(lineNumber);
        let indentation = strings.$Ce(lineText);
        if (indentation.length > column - 1) {
            indentation = indentation.substring(0, column - 1);
        }
        return indentation;
    }
    exports.$4t = $4t;
    function $5t(model, lineNumber, columnNumber) {
        model.tokenization.forceTokenization(lineNumber);
        const lineTokens = model.tokenization.getLineTokens(lineNumber);
        const column = (typeof columnNumber === 'undefined' ? model.getLineMaxColumn(lineNumber) - 1 : columnNumber - 1);
        return (0, supports_1.$dt)(lineTokens, column);
    }
    exports.$5t = $5t;
    class ComposedLanguageConfiguration {
        constructor(languageId) {
            this.languageId = languageId;
            this.f = null;
            this.c = [];
            this.d = 0;
            this.f = null;
        }
        register(configuration, priority) {
            const entry = new LanguageConfigurationContribution(configuration, priority, ++this.d);
            this.c.push(entry);
            this.f = null;
            return (0, lifecycle_1.$ic)(() => {
                for (let i = 0; i < this.c.length; i++) {
                    if (this.c[i] === entry) {
                        this.c.splice(i, 1);
                        this.f = null;
                        break;
                    }
                }
            });
        }
        getResolvedConfiguration() {
            if (!this.f) {
                const config = this.g();
                if (config) {
                    this.f = new $8t(this.languageId, config);
                }
            }
            return this.f;
        }
        g() {
            if (this.c.length === 0) {
                return null;
            }
            this.c.sort(LanguageConfigurationContribution.cmp);
            return combineLanguageConfigurations(this.c.map(e => e.configuration));
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
    class $6t {
        constructor(languageId) {
            this.languageId = languageId;
        }
    }
    exports.$6t = $6t;
    class $7t extends lifecycle_1.$kc {
        constructor() {
            super();
            this.c = new Map();
            this.f = this.B(new event_1.$fd());
            this.onDidChange = this.f.event;
            this.B(this.register(modesRegistry_1.$Yt, {
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
            let entries = this.c.get(languageId);
            if (!entries) {
                entries = new ComposedLanguageConfiguration(languageId);
                this.c.set(languageId, entries);
            }
            const disposable = entries.register(configuration, priority);
            this.f.fire(new $6t(languageId));
            return (0, lifecycle_1.$ic)(() => {
                disposable.dispose();
                this.f.fire(new $6t(languageId));
            });
        }
        getLanguageConfiguration(languageId) {
            const entries = this.c.get(languageId);
            return entries?.getResolvedConfiguration() || null;
        }
    }
    exports.$7t = $7t;
    /**
     * Immutable.
    */
    class $8t {
        constructor(languageId, underlyingConfig) {
            this.languageId = languageId;
            this.underlyingConfig = underlyingConfig;
            this.c = null;
            this.d = null;
            this.f =
                this.underlyingConfig.brackets ||
                    this.underlyingConfig.indentationRules ||
                    this.underlyingConfig.onEnterRules
                    ? new onEnter_1.$Ut(this.underlyingConfig)
                    : null;
            this.comments = $8t.g(this.underlyingConfig);
            this.characterPair = new characterPair_1.$Ot(this.underlyingConfig);
            this.wordDefinition = this.underlyingConfig.wordPattern || wordHelper_1.$Wr;
            this.indentationRules = this.underlyingConfig.indentationRules;
            if (this.underlyingConfig.indentationRules) {
                this.indentRulesSupport = new indentRules_1.$Tt(this.underlyingConfig.indentationRules);
            }
            else {
                this.indentRulesSupport = null;
            }
            this.foldingRules = this.underlyingConfig.folding || {};
            this.bracketsNew = new languageBracketsConfiguration_1.$it(languageId, this.underlyingConfig);
        }
        getWordDefinition() {
            return (0, wordHelper_1.$Xr)(this.wordDefinition);
        }
        get brackets() {
            if (!this.c && this.underlyingConfig.brackets) {
                this.c = new richEditBrackets_1.$Qt(this.languageId, this.underlyingConfig.brackets);
            }
            return this.c;
        }
        get electricCharacter() {
            if (!this.d) {
                this.d = new electricCharacter_1.$St(this.brackets);
            }
            return this.d;
        }
        onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
            if (!this.f) {
                return null;
            }
            return this.f.onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText);
        }
        getAutoClosingPairs() {
            return new languageConfiguration_1.$ht(this.characterPair.getAutoClosingPairs());
        }
        getAutoCloseBeforeSet(forQuotes) {
            return this.characterPair.getAutoCloseBeforeSet(forQuotes);
        }
        getSurroundingPairs() {
            return this.characterPair.getSurroundingPairs();
        }
        static g(conf) {
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
    exports.$8t = $8t;
    (0, extensions_1.$mr)(exports.$2t, $3t, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=languageConfigurationRegistry.js.map