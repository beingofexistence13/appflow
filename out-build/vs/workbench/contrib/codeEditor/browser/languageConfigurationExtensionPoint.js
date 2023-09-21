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
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/languageConfigurationExtensionPoint", "vs/base/common/json", "vs/base/common/types", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/language", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extensions", "vs/base/common/jsonErrorMessages", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/base/common/hash", "vs/base/common/lifecycle"], function (require, exports, nls, json_1, types, languageConfiguration_1, languageConfigurationRegistry_1, language_1, jsonContributionRegistry_1, platform_1, extensions_1, jsonErrorMessages_1, extensionResourceLoader_1, hash_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5$ = void 0;
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
    let $5$ = class $5$ extends lifecycle_1.$kc {
        constructor(b, c, f, g) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            /**
             * A map from language id to a hash computed from the config files locations.
             */
            this.a = new Map();
            this.B(this.b.onDidRequestBasicLanguageFeatures(async (languageIdentifier) => {
                // Modes can be instantiated before the extension points have finished registering
                this.f.whenInstalledExtensionsRegistered().then(() => {
                    this.h(languageIdentifier);
                });
            }));
            this.B(this.b.onDidChange(() => {
                // reload language configurations as necessary
                for (const [languageId] of this.a) {
                    this.h(languageId);
                }
            }));
        }
        async h(languageId) {
            const configurationFiles = this.b.getConfigurationFiles(languageId);
            const configurationHash = (0, hash_1.$pi)(configurationFiles.map(uri => uri.toString()));
            if (this.a.get(languageId) === configurationHash) {
                return;
            }
            this.a.set(languageId, configurationHash);
            const configs = await Promise.all(configurationFiles.map(configFile => this.j(configFile)));
            for (const config of configs) {
                this.w(languageId, config);
            }
        }
        async j(configFileLocation) {
            try {
                const contents = await this.c.readExtensionResource(configFileLocation);
                const errors = [];
                let configuration = (0, json_1.$Lm)(contents, errors);
                if (errors.length) {
                    console.error(nls.localize(0, null, configFileLocation.toString(), errors.map(e => (`[${e.offset}, ${e.length}] ${(0, jsonErrorMessages_1.$mp)(e.error)}`)).join('\n')));
                }
                if ((0, json_1.$Um)(configuration) !== 'object') {
                    console.error(nls.localize(1, null, configFileLocation.toString()));
                    configuration = {};
                }
                return configuration;
            }
            catch (err) {
                console.error(err);
                return {};
            }
        }
        m(languageId, configuration) {
            const source = configuration.comments;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!types.$lf(source)) {
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
        n(languageId, configuration) {
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
        r(languageId, configuration) {
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
                    if (!types.$lf(pair)) {
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
        s(languageId, configuration) {
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
                    if (!types.$lf(pair)) {
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
        t(languageId, configuration) {
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
        u(languageId, configuration) {
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
                if (!types.$lf(onEnterRule)) {
                    console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}]\` to be an object.`);
                    continue;
                }
                if (!types.$lf(onEnterRule.action)) {
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
                const beforeText = this.y(languageId, `onEnterRules[${i}].beforeText`, onEnterRule.beforeText);
                if (!beforeText) {
                    continue;
                }
                const resultingOnEnterRule = { beforeText, action };
                if (onEnterRule.afterText) {
                    const afterText = this.y(languageId, `onEnterRules[${i}].afterText`, onEnterRule.afterText);
                    if (afterText) {
                        resultingOnEnterRule.afterText = afterText;
                    }
                }
                if (onEnterRule.previousLineText) {
                    const previousLineText = this.y(languageId, `onEnterRules[${i}].previousLineText`, onEnterRule.previousLineText);
                    if (previousLineText) {
                        resultingOnEnterRule.previousLineText = previousLineText;
                    }
                }
                result = result || [];
                result.push(resultingOnEnterRule);
            }
            return result;
        }
        w(languageId, configuration) {
            const comments = this.m(languageId, configuration);
            const brackets = this.n(languageId, configuration);
            const autoClosingPairs = this.r(languageId, configuration);
            const surroundingPairs = this.s(languageId, configuration);
            const colorizedBracketPairs = this.t(languageId, configuration);
            const autoCloseBefore = (typeof configuration.autoCloseBefore === 'string' ? configuration.autoCloseBefore : undefined);
            const wordPattern = (configuration.wordPattern ? this.y(languageId, `wordPattern`, configuration.wordPattern) : undefined);
            const indentationRules = (configuration.indentationRules ? this.z(languageId, configuration.indentationRules) : undefined);
            let folding = undefined;
            if (configuration.folding) {
                const rawMarkers = configuration.folding.markers;
                const startMarker = (rawMarkers && rawMarkers.start ? this.y(languageId, `folding.markers.start`, rawMarkers.start) : undefined);
                const endMarker = (rawMarkers && rawMarkers.end ? this.y(languageId, `folding.markers.end`, rawMarkers.end) : undefined);
                const markers = (startMarker && endMarker ? { start: startMarker, end: endMarker } : undefined);
                folding = {
                    offSide: configuration.folding.offSide,
                    markers
                };
            }
            const onEnterRules = this.u(languageId, configuration);
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
            this.g.register(languageId, richEditConfig, 50);
        }
        y(languageId, confPath, value) {
            if (typeof value === 'string') {
                try {
                    return new RegExp(value, '');
                }
                catch (err) {
                    console.warn(`[${languageId}]: Invalid regular expression in \`${confPath}\`: `, err);
                    return undefined;
                }
            }
            if (types.$lf(value)) {
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
        z(languageId, indentationRules) {
            const increaseIndentPattern = this.y(languageId, `indentationRules.increaseIndentPattern`, indentationRules.increaseIndentPattern);
            if (!increaseIndentPattern) {
                return undefined;
            }
            const decreaseIndentPattern = this.y(languageId, `indentationRules.decreaseIndentPattern`, indentationRules.decreaseIndentPattern);
            if (!decreaseIndentPattern) {
                return undefined;
            }
            const result = {
                increaseIndentPattern: increaseIndentPattern,
                decreaseIndentPattern: decreaseIndentPattern
            };
            if (indentationRules.indentNextLinePattern) {
                result.indentNextLinePattern = this.y(languageId, `indentationRules.indentNextLinePattern`, indentationRules.indentNextLinePattern);
            }
            if (indentationRules.unIndentedLinePattern) {
                result.unIndentedLinePattern = this.y(languageId, `indentationRules.unIndentedLinePattern`, indentationRules.unIndentedLinePattern);
            }
            return result;
        }
    };
    exports.$5$ = $5$;
    exports.$5$ = $5$ = __decorate([
        __param(0, language_1.$ct),
        __param(1, extensionResourceLoader_1.$2$),
        __param(2, extensions_1.$MF),
        __param(3, languageConfigurationRegistry_1.$2t)
    ], $5$);
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
                description: nls.localize(2, null)
            },
            closeBracket: {
                type: 'string',
                description: nls.localize(3, null)
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
                description: nls.localize(4, null),
                type: 'object',
                properties: {
                    blockComment: {
                        type: 'array',
                        description: nls.localize(5, null),
                        items: [{
                                type: 'string',
                                description: nls.localize(6, null)
                            }, {
                                type: 'string',
                                description: nls.localize(7, null)
                            }]
                    },
                    lineComment: {
                        type: 'string',
                        description: nls.localize(8, null)
                    }
                }
            },
            brackets: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                markdownDescription: nls.localize(9, null, '\`colorizedBracketPairs\`'),
                type: 'array',
                items: {
                    $ref: '#/definitions/bracketPair'
                }
            },
            colorizedBracketPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                markdownDescription: nls.localize(10, null, '\`brackets\`'),
                type: 'array',
                items: {
                    $ref: '#/definitions/bracketPair'
                }
            },
            autoClosingPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                description: nls.localize(11, null),
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
                                    description: nls.localize(12, null),
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
                description: nls.localize(13, null),
                type: 'string',
            },
            surroundingPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                description: nls.localize(14, null),
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
                description: nls.localize(15, null),
                type: ['string', 'object'],
                properties: {
                    pattern: {
                        type: 'string',
                        description: nls.localize(16, null),
                        default: '',
                    },
                    flags: {
                        type: 'string',
                        description: nls.localize(17, null),
                        default: 'g',
                        pattern: '^([gimuy]+)$',
                        patternErrorMessage: nls.localize(18, null)
                    }
                }
            },
            indentationRules: {
                default: {
                    increaseIndentPattern: '',
                    decreaseIndentPattern: ''
                },
                description: nls.localize(19, null),
                type: 'object',
                properties: {
                    increaseIndentPattern: {
                        type: ['string', 'object'],
                        description: nls.localize(20, null),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize(21, null),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize(22, null),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize(23, null)
                            }
                        }
                    },
                    decreaseIndentPattern: {
                        type: ['string', 'object'],
                        description: nls.localize(24, null),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize(25, null),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize(26, null),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize(27, null)
                            }
                        }
                    },
                    indentNextLinePattern: {
                        type: ['string', 'object'],
                        description: nls.localize(28, null),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize(29, null),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize(30, null),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize(31, null)
                            }
                        }
                    },
                    unIndentedLinePattern: {
                        type: ['string', 'object'],
                        description: nls.localize(32, null),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize(33, null),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize(34, null),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize(35, null)
                            }
                        }
                    }
                }
            },
            folding: {
                type: 'object',
                description: nls.localize(36, null),
                properties: {
                    offSide: {
                        type: 'boolean',
                        description: nls.localize(37, null),
                    },
                    markers: {
                        type: 'object',
                        description: nls.localize(38, null),
                        properties: {
                            start: {
                                type: 'string',
                                description: nls.localize(39, null)
                            },
                            end: {
                                type: 'string',
                                description: nls.localize(40, null)
                            },
                        }
                    }
                }
            },
            onEnterRules: {
                type: 'array',
                description: nls.localize(41, null),
                items: {
                    type: 'object',
                    description: nls.localize(42, null),
                    required: ['beforeText', 'action'],
                    properties: {
                        beforeText: {
                            type: ['string', 'object'],
                            description: nls.localize(43, null),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize(44, null),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize(45, null),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize(46, null)
                                }
                            }
                        },
                        afterText: {
                            type: ['string', 'object'],
                            description: nls.localize(47, null),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize(48, null),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize(49, null),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize(50, null)
                                }
                            }
                        },
                        previousLineText: {
                            type: ['string', 'object'],
                            description: nls.localize(51, null),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize(52, null),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize(53, null),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize(54, null)
                                }
                            }
                        },
                        action: {
                            type: ['string', 'object'],
                            description: nls.localize(55, null),
                            required: ['indent'],
                            default: { 'indent': 'indent' },
                            properties: {
                                indent: {
                                    type: 'string',
                                    description: nls.localize(56, null),
                                    default: 'indent',
                                    enum: ['none', 'indent', 'indentOutdent', 'outdent'],
                                    markdownEnumDescriptions: [
                                        nls.localize(57, null),
                                        nls.localize(58, null),
                                        nls.localize(59, null),
                                        nls.localize(60, null)
                                    ]
                                },
                                appendText: {
                                    type: 'string',
                                    description: nls.localize(61, null),
                                    default: '',
                                },
                                removeText: {
                                    type: 'number',
                                    description: nls.localize(62, null),
                                    default: 0,
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    const schemaRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
    schemaRegistry.registerSchema(schemaId, schema);
});
//# sourceMappingURL=languageConfigurationExtensionPoint.js.map