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
define(["require", "exports", "vs/nls", "vs/base/common/json", "vs/base/common/types", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/language", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extensions", "vs/base/common/jsonErrorMessages", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/base/common/hash", "vs/base/common/lifecycle"], function (require, exports, nls, json_1, types, languageConfiguration_1, languageConfigurationRegistry_1, language_1, jsonContributionRegistry_1, platform_1, extensions_1, jsonErrorMessages_1, extensionResourceLoader_1, hash_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageConfigurationFileHandler = void 0;
    function isStringArr(something) {
        if (!Array.isArray(something)) {
            return false;
        }
        for (let i = 0, len = something.length; i < len; i++) {
            if (typeof something[i] !== 'string') {
                return false;
            }
        }
        return true;
    }
    function isCharacterPair(something) {
        return (isStringArr(something)
            && something.length === 2);
    }
    let LanguageConfigurationFileHandler = class LanguageConfigurationFileHandler extends lifecycle_1.Disposable {
        constructor(_languageService, _extensionResourceLoaderService, _extensionService, _languageConfigurationService) {
            super();
            this._languageService = _languageService;
            this._extensionResourceLoaderService = _extensionResourceLoaderService;
            this._extensionService = _extensionService;
            this._languageConfigurationService = _languageConfigurationService;
            /**
             * A map from language id to a hash computed from the config files locations.
             */
            this._done = new Map();
            this._register(this._languageService.onDidRequestBasicLanguageFeatures(async (languageIdentifier) => {
                // Modes can be instantiated before the extension points have finished registering
                this._extensionService.whenInstalledExtensionsRegistered().then(() => {
                    this._loadConfigurationsForMode(languageIdentifier);
                });
            }));
            this._register(this._languageService.onDidChange(() => {
                // reload language configurations as necessary
                for (const [languageId] of this._done) {
                    this._loadConfigurationsForMode(languageId);
                }
            }));
        }
        async _loadConfigurationsForMode(languageId) {
            const configurationFiles = this._languageService.getConfigurationFiles(languageId);
            const configurationHash = (0, hash_1.hash)(configurationFiles.map(uri => uri.toString()));
            if (this._done.get(languageId) === configurationHash) {
                return;
            }
            this._done.set(languageId, configurationHash);
            const configs = await Promise.all(configurationFiles.map(configFile => this._readConfigFile(configFile)));
            for (const config of configs) {
                this._handleConfig(languageId, config);
            }
        }
        async _readConfigFile(configFileLocation) {
            try {
                const contents = await this._extensionResourceLoaderService.readExtensionResource(configFileLocation);
                const errors = [];
                let configuration = (0, json_1.parse)(contents, errors);
                if (errors.length) {
                    console.error(nls.localize('parseErrors', "Errors parsing {0}: {1}", configFileLocation.toString(), errors.map(e => (`[${e.offset}, ${e.length}] ${(0, jsonErrorMessages_1.getParseErrorMessage)(e.error)}`)).join('\n')));
                }
                if ((0, json_1.getNodeType)(configuration) !== 'object') {
                    console.error(nls.localize('formatError', "{0}: Invalid format, JSON object expected.", configFileLocation.toString()));
                    configuration = {};
                }
                return configuration;
            }
            catch (err) {
                console.error(err);
                return {};
            }
        }
        _extractValidCommentRule(languageId, configuration) {
            const source = configuration.comments;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!types.isObject(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`comments\` to be an object.`);
                return undefined;
            }
            let result = undefined;
            if (typeof source.lineComment !== 'undefined') {
                if (typeof source.lineComment !== 'string') {
                    console.warn(`[${languageId}]: language configuration: expected \`comments.lineComment\` to be a string.`);
                }
                else {
                    result = result || {};
                    result.lineComment = source.lineComment;
                }
            }
            if (typeof source.blockComment !== 'undefined') {
                if (!isCharacterPair(source.blockComment)) {
                    console.warn(`[${languageId}]: language configuration: expected \`comments.blockComment\` to be an array of two strings.`);
                }
                else {
                    result = result || {};
                    result.blockComment = source.blockComment;
                }
            }
            return result;
        }
        _extractValidBrackets(languageId, configuration) {
            const source = configuration.brackets;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`brackets\` to be an array.`);
                return undefined;
            }
            let result = undefined;
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (!isCharacterPair(pair)) {
                    console.warn(`[${languageId}]: language configuration: expected \`brackets[${i}]\` to be an array of two strings.`);
                    continue;
                }
                result = result || [];
                result.push(pair);
            }
            return result;
        }
        _extractValidAutoClosingPairs(languageId, configuration) {
            const source = configuration.autoClosingPairs;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs\` to be an array.`);
                return undefined;
            }
            let result = undefined;
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (Array.isArray(pair)) {
                    if (!isCharacterPair(pair)) {
                        console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    result = result || [];
                    result.push({ open: pair[0], close: pair[1] });
                }
                else {
                    if (!types.isObject(pair)) {
                        console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    if (typeof pair.open !== 'string') {
                        console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i}].open\` to be a string.`);
                        continue;
                    }
                    if (typeof pair.close !== 'string') {
                        console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i}].close\` to be a string.`);
                        continue;
                    }
                    if (typeof pair.notIn !== 'undefined') {
                        if (!isStringArr(pair.notIn)) {
                            console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i}].notIn\` to be a string array.`);
                            continue;
                        }
                    }
                    result = result || [];
                    result.push({ open: pair.open, close: pair.close, notIn: pair.notIn });
                }
            }
            return result;
        }
        _extractValidSurroundingPairs(languageId, configuration) {
            const source = configuration.surroundingPairs;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs\` to be an array.`);
                return undefined;
            }
            let result = undefined;
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (Array.isArray(pair)) {
                    if (!isCharacterPair(pair)) {
                        console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    result = result || [];
                    result.push({ open: pair[0], close: pair[1] });
                }
                else {
                    if (!types.isObject(pair)) {
                        console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    if (typeof pair.open !== 'string') {
                        console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i}].open\` to be a string.`);
                        continue;
                    }
                    if (typeof pair.close !== 'string') {
                        console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i}].close\` to be a string.`);
                        continue;
                    }
                    result = result || [];
                    result.push({ open: pair.open, close: pair.close });
                }
            }
            return result;
        }
        _extractValidColorizedBracketPairs(languageId, configuration) {
            const source = configuration.colorizedBracketPairs;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`colorizedBracketPairs\` to be an array.`);
                return undefined;
            }
            const result = [];
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (!isCharacterPair(pair)) {
                    console.warn(`[${languageId}]: language configuration: expected \`colorizedBracketPairs[${i}]\` to be an array of two strings.`);
                    continue;
                }
                result.push([pair[0], pair[1]]);
            }
            return result;
        }
        _extractValidOnEnterRules(languageId, configuration) {
            const source = configuration.onEnterRules;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`onEnterRules\` to be an array.`);
                return undefined;
            }
            let result = undefined;
            for (let i = 0, len = source.length; i < len; i++) {
                const onEnterRule = source[i];
                if (!types.isObject(onEnterRule)) {
                    console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}]\` to be an object.`);
                    continue;
                }
                if (!types.isObject(onEnterRule.action)) {
                    console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}].action\` to be an object.`);
                    continue;
                }
                let indentAction;
                if (onEnterRule.action.indent === 'none') {
                    indentAction = languageConfiguration_1.IndentAction.None;
                }
                else if (onEnterRule.action.indent === 'indent') {
                    indentAction = languageConfiguration_1.IndentAction.Indent;
                }
                else if (onEnterRule.action.indent === 'indentOutdent') {
                    indentAction = languageConfiguration_1.IndentAction.IndentOutdent;
                }
                else if (onEnterRule.action.indent === 'outdent') {
                    indentAction = languageConfiguration_1.IndentAction.Outdent;
                }
                else {
                    console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}].action.indent\` to be 'none', 'indent', 'indentOutdent' or 'outdent'.`);
                    continue;
                }
                const action = { indentAction };
                if (onEnterRule.action.appendText) {
                    if (typeof onEnterRule.action.appendText === 'string') {
                        action.appendText = onEnterRule.action.appendText;
                    }
                    else {
                        console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}].action.appendText\` to be undefined or a string.`);
                    }
                }
                if (onEnterRule.action.removeText) {
                    if (typeof onEnterRule.action.removeText === 'number') {
                        action.removeText = onEnterRule.action.removeText;
                    }
                    else {
                        console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}].action.removeText\` to be undefined or a number.`);
                    }
                }
                const beforeText = this._parseRegex(languageId, `onEnterRules[${i}].beforeText`, onEnterRule.beforeText);
                if (!beforeText) {
                    continue;
                }
                const resultingOnEnterRule = { beforeText, action };
                if (onEnterRule.afterText) {
                    const afterText = this._parseRegex(languageId, `onEnterRules[${i}].afterText`, onEnterRule.afterText);
                    if (afterText) {
                        resultingOnEnterRule.afterText = afterText;
                    }
                }
                if (onEnterRule.previousLineText) {
                    const previousLineText = this._parseRegex(languageId, `onEnterRules[${i}].previousLineText`, onEnterRule.previousLineText);
                    if (previousLineText) {
                        resultingOnEnterRule.previousLineText = previousLineText;
                    }
                }
                result = result || [];
                result.push(resultingOnEnterRule);
            }
            return result;
        }
        _handleConfig(languageId, configuration) {
            const comments = this._extractValidCommentRule(languageId, configuration);
            const brackets = this._extractValidBrackets(languageId, configuration);
            const autoClosingPairs = this._extractValidAutoClosingPairs(languageId, configuration);
            const surroundingPairs = this._extractValidSurroundingPairs(languageId, configuration);
            const colorizedBracketPairs = this._extractValidColorizedBracketPairs(languageId, configuration);
            const autoCloseBefore = (typeof configuration.autoCloseBefore === 'string' ? configuration.autoCloseBefore : undefined);
            const wordPattern = (configuration.wordPattern ? this._parseRegex(languageId, `wordPattern`, configuration.wordPattern) : undefined);
            const indentationRules = (configuration.indentationRules ? this._mapIndentationRules(languageId, configuration.indentationRules) : undefined);
            let folding = undefined;
            if (configuration.folding) {
                const rawMarkers = configuration.folding.markers;
                const startMarker = (rawMarkers && rawMarkers.start ? this._parseRegex(languageId, `folding.markers.start`, rawMarkers.start) : undefined);
                const endMarker = (rawMarkers && rawMarkers.end ? this._parseRegex(languageId, `folding.markers.end`, rawMarkers.end) : undefined);
                const markers = (startMarker && endMarker ? { start: startMarker, end: endMarker } : undefined);
                folding = {
                    offSide: configuration.folding.offSide,
                    markers
                };
            }
            const onEnterRules = this._extractValidOnEnterRules(languageId, configuration);
            const richEditConfig = {
                comments,
                brackets,
                wordPattern,
                indentationRules,
                onEnterRules,
                autoClosingPairs,
                surroundingPairs,
                colorizedBracketPairs,
                autoCloseBefore,
                folding,
                __electricCharacterSupport: undefined,
            };
            this._languageConfigurationService.register(languageId, richEditConfig, 50);
        }
        _parseRegex(languageId, confPath, value) {
            if (typeof value === 'string') {
                try {
                    return new RegExp(value, '');
                }
                catch (err) {
                    console.warn(`[${languageId}]: Invalid regular expression in \`${confPath}\`: `, err);
                    return undefined;
                }
            }
            if (types.isObject(value)) {
                if (typeof value.pattern !== 'string') {
                    console.warn(`[${languageId}]: language configuration: expected \`${confPath}.pattern\` to be a string.`);
                    return undefined;
                }
                if (typeof value.flags !== 'undefined' && typeof value.flags !== 'string') {
                    console.warn(`[${languageId}]: language configuration: expected \`${confPath}.flags\` to be a string.`);
                    return undefined;
                }
                try {
                    return new RegExp(value.pattern, value.flags);
                }
                catch (err) {
                    console.warn(`[${languageId}]: Invalid regular expression in \`${confPath}\`: `, err);
                    return undefined;
                }
            }
            console.warn(`[${languageId}]: language configuration: expected \`${confPath}\` to be a string or an object.`);
            return undefined;
        }
        _mapIndentationRules(languageId, indentationRules) {
            const increaseIndentPattern = this._parseRegex(languageId, `indentationRules.increaseIndentPattern`, indentationRules.increaseIndentPattern);
            if (!increaseIndentPattern) {
                return undefined;
            }
            const decreaseIndentPattern = this._parseRegex(languageId, `indentationRules.decreaseIndentPattern`, indentationRules.decreaseIndentPattern);
            if (!decreaseIndentPattern) {
                return undefined;
            }
            const result = {
                increaseIndentPattern: increaseIndentPattern,
                decreaseIndentPattern: decreaseIndentPattern
            };
            if (indentationRules.indentNextLinePattern) {
                result.indentNextLinePattern = this._parseRegex(languageId, `indentationRules.indentNextLinePattern`, indentationRules.indentNextLinePattern);
            }
            if (indentationRules.unIndentedLinePattern) {
                result.unIndentedLinePattern = this._parseRegex(languageId, `indentationRules.unIndentedLinePattern`, indentationRules.unIndentedLinePattern);
            }
            return result;
        }
    };
    exports.LanguageConfigurationFileHandler = LanguageConfigurationFileHandler;
    exports.LanguageConfigurationFileHandler = LanguageConfigurationFileHandler = __decorate([
        __param(0, language_1.ILanguageService),
        __param(1, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(2, extensions_1.IExtensionService),
        __param(3, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], LanguageConfigurationFileHandler);
    const schemaId = 'vscode://schemas/language-configuration';
    const schema = {
        allowComments: true,
        allowTrailingCommas: true,
        default: {
            comments: {
                blockComment: ['/*', '*/'],
                lineComment: '//'
            },
            brackets: [['(', ')'], ['[', ']'], ['{', '}']],
            autoClosingPairs: [['(', ')'], ['[', ']'], ['{', '}']],
            surroundingPairs: [['(', ')'], ['[', ']'], ['{', '}']]
        },
        definitions: {
            openBracket: {
                type: 'string',
                description: nls.localize('schema.openBracket', 'The opening bracket character or string sequence.')
            },
            closeBracket: {
                type: 'string',
                description: nls.localize('schema.closeBracket', 'The closing bracket character or string sequence.')
            },
            bracketPair: {
                type: 'array',
                items: [{
                        $ref: '#/definitions/openBracket'
                    }, {
                        $ref: '#/definitions/closeBracket'
                    }]
            }
        },
        properties: {
            comments: {
                default: {
                    blockComment: ['/*', '*/'],
                    lineComment: '//'
                },
                description: nls.localize('schema.comments', 'Defines the comment symbols'),
                type: 'object',
                properties: {
                    blockComment: {
                        type: 'array',
                        description: nls.localize('schema.blockComments', 'Defines how block comments are marked.'),
                        items: [{
                                type: 'string',
                                description: nls.localize('schema.blockComment.begin', 'The character sequence that starts a block comment.')
                            }, {
                                type: 'string',
                                description: nls.localize('schema.blockComment.end', 'The character sequence that ends a block comment.')
                            }]
                    },
                    lineComment: {
                        type: 'string',
                        description: nls.localize('schema.lineComment', 'The character sequence that starts a line comment.')
                    }
                }
            },
            brackets: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                markdownDescription: nls.localize('schema.brackets', 'Defines the bracket symbols that increase or decrease the indentation. When bracket pair colorization is enabled and {0} is not defined, this also defines the bracket pairs that are colorized by their nesting level.', '\`colorizedBracketPairs\`'),
                type: 'array',
                items: {
                    $ref: '#/definitions/bracketPair'
                }
            },
            colorizedBracketPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                markdownDescription: nls.localize('schema.colorizedBracketPairs', 'Defines the bracket pairs that are colorized by their nesting level if bracket pair colorization is enabled. Any brackets included here that are not included in {0} will be automatically included in {0}.', '\`brackets\`'),
                type: 'array',
                items: {
                    $ref: '#/definitions/bracketPair'
                }
            },
            autoClosingPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                description: nls.localize('schema.autoClosingPairs', 'Defines the bracket pairs. When a opening bracket is entered, the closing bracket is inserted automatically.'),
                type: 'array',
                items: {
                    oneOf: [{
                            $ref: '#/definitions/bracketPair'
                        }, {
                            type: 'object',
                            properties: {
                                open: {
                                    $ref: '#/definitions/openBracket'
                                },
                                close: {
                                    $ref: '#/definitions/closeBracket'
                                },
                                notIn: {
                                    type: 'array',
                                    description: nls.localize('schema.autoClosingPairs.notIn', 'Defines a list of scopes where the auto pairs are disabled.'),
                                    items: {
                                        enum: ['string', 'comment']
                                    }
                                }
                            }
                        }]
                }
            },
            autoCloseBefore: {
                default: ';:.,=}])> \n\t',
                description: nls.localize('schema.autoCloseBefore', 'Defines what characters must be after the cursor in order for bracket or quote autoclosing to occur when using the \'languageDefined\' autoclosing setting. This is typically the set of characters which can not start an expression.'),
                type: 'string',
            },
            surroundingPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                description: nls.localize('schema.surroundingPairs', 'Defines the bracket pairs that can be used to surround a selected string.'),
                type: 'array',
                items: {
                    oneOf: [{
                            $ref: '#/definitions/bracketPair'
                        }, {
                            type: 'object',
                            properties: {
                                open: {
                                    $ref: '#/definitions/openBracket'
                                },
                                close: {
                                    $ref: '#/definitions/closeBracket'
                                }
                            }
                        }]
                }
            },
            wordPattern: {
                default: '',
                description: nls.localize('schema.wordPattern', 'Defines what is considered to be a word in the programming language.'),
                type: ['string', 'object'],
                properties: {
                    pattern: {
                        type: 'string',
                        description: nls.localize('schema.wordPattern.pattern', 'The RegExp pattern used to match words.'),
                        default: '',
                    },
                    flags: {
                        type: 'string',
                        description: nls.localize('schema.wordPattern.flags', 'The RegExp flags used to match words.'),
                        default: 'g',
                        pattern: '^([gimuy]+)$',
                        patternErrorMessage: nls.localize('schema.wordPattern.flags.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                    }
                }
            },
            indentationRules: {
                default: {
                    increaseIndentPattern: '',
                    decreaseIndentPattern: ''
                },
                description: nls.localize('schema.indentationRules', 'The language\'s indentation settings.'),
                type: 'object',
                properties: {
                    increaseIndentPattern: {
                        type: ['string', 'object'],
                        description: nls.localize('schema.indentationRules.increaseIndentPattern', 'If a line matches this pattern, then all the lines after it should be indented once (until another rule matches).'),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.increaseIndentPattern.pattern', 'The RegExp pattern for increaseIndentPattern.'),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.increaseIndentPattern.flags', 'The RegExp flags for increaseIndentPattern.'),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize('schema.indentationRules.increaseIndentPattern.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                            }
                        }
                    },
                    decreaseIndentPattern: {
                        type: ['string', 'object'],
                        description: nls.localize('schema.indentationRules.decreaseIndentPattern', 'If a line matches this pattern, then all the lines after it should be unindented once (until another rule matches).'),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.decreaseIndentPattern.pattern', 'The RegExp pattern for decreaseIndentPattern.'),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.decreaseIndentPattern.flags', 'The RegExp flags for decreaseIndentPattern.'),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize('schema.indentationRules.decreaseIndentPattern.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                            }
                        }
                    },
                    indentNextLinePattern: {
                        type: ['string', 'object'],
                        description: nls.localize('schema.indentationRules.indentNextLinePattern', 'If a line matches this pattern, then **only the next line** after it should be indented once.'),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.indentNextLinePattern.pattern', 'The RegExp pattern for indentNextLinePattern.'),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.indentNextLinePattern.flags', 'The RegExp flags for indentNextLinePattern.'),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize('schema.indentationRules.indentNextLinePattern.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                            }
                        }
                    },
                    unIndentedLinePattern: {
                        type: ['string', 'object'],
                        description: nls.localize('schema.indentationRules.unIndentedLinePattern', 'If a line matches this pattern, then its indentation should not be changed and it should not be evaluated against the other rules.'),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.unIndentedLinePattern.pattern', 'The RegExp pattern for unIndentedLinePattern.'),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.unIndentedLinePattern.flags', 'The RegExp flags for unIndentedLinePattern.'),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize('schema.indentationRules.unIndentedLinePattern.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                            }
                        }
                    }
                }
            },
            folding: {
                type: 'object',
                description: nls.localize('schema.folding', 'The language\'s folding settings.'),
                properties: {
                    offSide: {
                        type: 'boolean',
                        description: nls.localize('schema.folding.offSide', 'A language adheres to the off-side rule if blocks in that language are expressed by their indentation. If set, empty lines belong to the subsequent block.'),
                    },
                    markers: {
                        type: 'object',
                        description: nls.localize('schema.folding.markers', 'Language specific folding markers such as \'#region\' and \'#endregion\'. The start and end regexes will be tested against the contents of all lines and must be designed efficiently'),
                        properties: {
                            start: {
                                type: 'string',
                                description: nls.localize('schema.folding.markers.start', 'The RegExp pattern for the start marker. The regexp must start with \'^\'.')
                            },
                            end: {
                                type: 'string',
                                description: nls.localize('schema.folding.markers.end', 'The RegExp pattern for the end marker. The regexp must start with \'^\'.')
                            },
                        }
                    }
                }
            },
            onEnterRules: {
                type: 'array',
                description: nls.localize('schema.onEnterRules', 'The language\'s rules to be evaluated when pressing Enter.'),
                items: {
                    type: 'object',
                    description: nls.localize('schema.onEnterRules', 'The language\'s rules to be evaluated when pressing Enter.'),
                    required: ['beforeText', 'action'],
                    properties: {
                        beforeText: {
                            type: ['string', 'object'],
                            description: nls.localize('schema.onEnterRules.beforeText', 'This rule will only execute if the text before the cursor matches this regular expression.'),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.beforeText.pattern', 'The RegExp pattern for beforeText.'),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.beforeText.flags', 'The RegExp flags for beforeText.'),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize('schema.onEnterRules.beforeText.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                                }
                            }
                        },
                        afterText: {
                            type: ['string', 'object'],
                            description: nls.localize('schema.onEnterRules.afterText', 'This rule will only execute if the text after the cursor matches this regular expression.'),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.afterText.pattern', 'The RegExp pattern for afterText.'),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.afterText.flags', 'The RegExp flags for afterText.'),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize('schema.onEnterRules.afterText.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                                }
                            }
                        },
                        previousLineText: {
                            type: ['string', 'object'],
                            description: nls.localize('schema.onEnterRules.previousLineText', 'This rule will only execute if the text above the line matches this regular expression.'),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.previousLineText.pattern', 'The RegExp pattern for previousLineText.'),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.previousLineText.flags', 'The RegExp flags for previousLineText.'),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize('schema.onEnterRules.previousLineText.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                                }
                            }
                        },
                        action: {
                            type: ['string', 'object'],
                            description: nls.localize('schema.onEnterRules.action', 'The action to execute.'),
                            required: ['indent'],
                            default: { 'indent': 'indent' },
                            properties: {
                                indent: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.action.indent', "Describe what to do with the indentation"),
                                    default: 'indent',
                                    enum: ['none', 'indent', 'indentOutdent', 'outdent'],
                                    markdownEnumDescriptions: [
                                        nls.localize('schema.onEnterRules.action.indent.none', "Insert new line and copy the previous line's indentation."),
                                        nls.localize('schema.onEnterRules.action.indent.indent', "Insert new line and indent once (relative to the previous line's indentation)."),
                                        nls.localize('schema.onEnterRules.action.indent.indentOutdent', "Insert two new lines:\n - the first one indented which will hold the cursor\n - the second one at the same indentation level"),
                                        nls.localize('schema.onEnterRules.action.indent.outdent', "Insert new line and outdent once (relative to the previous line's indentation).")
                                    ]
                                },
                                appendText: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.action.appendText', 'Describes text to be appended after the new line and after the indentation.'),
                                    default: '',
                                },
                                removeText: {
                                    type: 'number',
                                    description: nls.localize('schema.onEnterRules.action.removeText', 'Describes the number of characters to remove from the new line\'s indentation.'),
                                    default: 0,
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    const schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    schemaRegistry.registerSchema(schemaId, schema);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VDb25maWd1cmF0aW9uRXh0ZW5zaW9uUG9pbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb2RlRWRpdG9yL2Jyb3dzZXIvbGFuZ3VhZ2VDb25maWd1cmF0aW9uRXh0ZW5zaW9uUG9pbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUVoRyxTQUFTLFdBQVcsQ0FBQyxTQUEwQjtRQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM5QixPQUFPLEtBQUssQ0FBQztTQUNiO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyRCxJQUFJLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDckMsT0FBTyxLQUFLLENBQUM7YUFDYjtTQUNEO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFFYixDQUFDO0lBRUQsU0FBUyxlQUFlLENBQUMsU0FBK0I7UUFDdkQsT0FBTyxDQUNOLFdBQVcsQ0FBQyxTQUFTLENBQUM7ZUFDbkIsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQ3pCLENBQUM7SUFDSCxDQUFDO0lBRU0sSUFBTSxnQ0FBZ0MsR0FBdEMsTUFBTSxnQ0FBaUMsU0FBUSxzQkFBVTtRQU8vRCxZQUNtQixnQkFBbUQsRUFDcEMsK0JBQWlGLEVBQy9GLGlCQUFxRCxFQUN6Qyw2QkFBNkU7WUFFNUcsS0FBSyxFQUFFLENBQUM7WUFMMkIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNuQixvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWlDO1lBQzlFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FB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