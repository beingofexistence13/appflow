/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/config/diffEditor", "vs/editor/common/config/editorOptions", "vs/editor/common/core/textModelDefaults", "vs/nls!vs/editor/common/config/editorConfigurationSchema", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, diffEditor_1, editorOptions_1, textModelDefaults_1, nls, configurationRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$m1 = exports.$l1 = exports.$k1 = void 0;
    exports.$k1 = Object.freeze({
        id: 'editor',
        order: 5,
        type: 'object',
        title: nls.localize(0, null),
        scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
    });
    const editorConfiguration = {
        ...exports.$k1,
        properties: {
            'editor.tabSize': {
                type: 'number',
                default: textModelDefaults_1.$Ur.tabSize,
                minimum: 1,
                markdownDescription: nls.localize(1, null, '`#editor.detectIndentation#`')
            },
            'editor.indentSize': {
                'anyOf': [
                    {
                        type: 'string',
                        enum: ['tabSize']
                    },
                    {
                        type: 'number',
                        minimum: 1
                    }
                ],
                default: 'tabSize',
                markdownDescription: nls.localize(2, null)
            },
            'editor.insertSpaces': {
                type: 'boolean',
                default: textModelDefaults_1.$Ur.insertSpaces,
                markdownDescription: nls.localize(3, null, '`#editor.detectIndentation#`')
            },
            'editor.detectIndentation': {
                type: 'boolean',
                default: textModelDefaults_1.$Ur.detectIndentation,
                markdownDescription: nls.localize(4, null, '`#editor.tabSize#`', '`#editor.insertSpaces#`')
            },
            'editor.trimAutoWhitespace': {
                type: 'boolean',
                default: textModelDefaults_1.$Ur.trimAutoWhitespace,
                description: nls.localize(5, null)
            },
            'editor.largeFileOptimizations': {
                type: 'boolean',
                default: textModelDefaults_1.$Ur.largeFileOptimizations,
                description: nls.localize(6, null)
            },
            'editor.wordBasedSuggestions': {
                type: 'boolean',
                default: true,
                description: nls.localize(7, null)
            },
            'editor.wordBasedSuggestionsMode': {
                enum: ['currentDocument', 'matchingDocuments', 'allDocuments'],
                default: 'matchingDocuments',
                enumDescriptions: [
                    nls.localize(8, null),
                    nls.localize(9, null),
                    nls.localize(10, null)
                ],
                description: nls.localize(11, null)
            },
            'editor.semanticHighlighting.enabled': {
                enum: [true, false, 'configuredByTheme'],
                enumDescriptions: [
                    nls.localize(12, null),
                    nls.localize(13, null),
                    nls.localize(14, null)
                ],
                default: 'configuredByTheme',
                description: nls.localize(15, null)
            },
            'editor.stablePeek': {
                type: 'boolean',
                default: false,
                markdownDescription: nls.localize(16, null)
            },
            'editor.maxTokenizationLineLength': {
                type: 'integer',
                default: 20000,
                description: nls.localize(17, null)
            },
            'editor.experimental.asyncTokenization': {
                type: 'boolean',
                default: false,
                description: nls.localize(18, null),
                tags: ['experimental'],
            },
            'editor.experimental.asyncTokenizationLogging': {
                type: 'boolean',
                default: false,
                description: nls.localize(19, null),
            },
            'editor.experimental.asyncTokenizationVerification': {
                type: 'boolean',
                default: false,
                description: nls.localize(20, null),
                tags: ['experimental'],
            },
            'editor.language.brackets': {
                type: ['array', 'null'],
                default: null,
                description: nls.localize(21, null),
                items: {
                    type: 'array',
                    items: [
                        {
                            type: 'string',
                            description: nls.localize(22, null)
                        },
                        {
                            type: 'string',
                            description: nls.localize(23, null)
                        }
                    ]
                }
            },
            'editor.language.colorizedBracketPairs': {
                type: ['array', 'null'],
                default: null,
                description: nls.localize(24, null),
                items: {
                    type: 'array',
                    items: [
                        {
                            type: 'string',
                            description: nls.localize(25, null)
                        },
                        {
                            type: 'string',
                            description: nls.localize(26, null)
                        }
                    ]
                }
            },
            'diffEditor.maxComputationTime': {
                type: 'number',
                default: diffEditor_1.$kZ.maxComputationTime,
                description: nls.localize(27, null)
            },
            'diffEditor.maxFileSize': {
                type: 'number',
                default: diffEditor_1.$kZ.maxFileSize,
                description: nls.localize(28, null)
            },
            'diffEditor.renderSideBySide': {
                type: 'boolean',
                default: diffEditor_1.$kZ.renderSideBySide,
                description: nls.localize(29, null)
            },
            'diffEditor.renderSideBySideInlineBreakpoint': {
                type: 'number',
                default: diffEditor_1.$kZ.renderSideBySideInlineBreakpoint,
                description: nls.localize(30, null)
            },
            'diffEditor.useInlineViewWhenSpaceIsLimited': {
                type: 'boolean',
                default: diffEditor_1.$kZ.useInlineViewWhenSpaceIsLimited,
                description: nls.localize(31, null)
            },
            'diffEditor.renderMarginRevertIcon': {
                type: 'boolean',
                default: diffEditor_1.$kZ.renderMarginRevertIcon,
                description: nls.localize(32, null)
            },
            'diffEditor.ignoreTrimWhitespace': {
                type: 'boolean',
                default: diffEditor_1.$kZ.ignoreTrimWhitespace,
                description: nls.localize(33, null)
            },
            'diffEditor.renderIndicators': {
                type: 'boolean',
                default: diffEditor_1.$kZ.renderIndicators,
                description: nls.localize(34, null)
            },
            'diffEditor.codeLens': {
                type: 'boolean',
                default: diffEditor_1.$kZ.diffCodeLens,
                description: nls.localize(35, null)
            },
            'diffEditor.wordWrap': {
                type: 'string',
                enum: ['off', 'on', 'inherit'],
                default: diffEditor_1.$kZ.diffWordWrap,
                markdownEnumDescriptions: [
                    nls.localize(36, null),
                    nls.localize(37, null),
                    nls.localize(38, null, '`#editor.wordWrap#`'),
                ]
            },
            'diffEditor.diffAlgorithm': {
                type: 'string',
                enum: ['legacy', 'advanced'],
                default: diffEditor_1.$kZ.diffAlgorithm,
                markdownEnumDescriptions: [
                    nls.localize(39, null),
                    nls.localize(40, null),
                ],
                tags: ['experimental'],
            },
            'diffEditor.hideUnchangedRegions.enabled': {
                type: 'boolean',
                default: diffEditor_1.$kZ.hideUnchangedRegions.enabled,
                markdownDescription: nls.localize(41, null),
            },
            'diffEditor.hideUnchangedRegions.revealLineCount': {
                type: 'integer',
                default: diffEditor_1.$kZ.hideUnchangedRegions.revealLineCount,
                markdownDescription: nls.localize(42, null),
                minimum: 1,
            },
            'diffEditor.hideUnchangedRegions.minimumLineCount': {
                type: 'integer',
                default: diffEditor_1.$kZ.hideUnchangedRegions.minimumLineCount,
                markdownDescription: nls.localize(43, null),
                minimum: 1,
            },
            'diffEditor.hideUnchangedRegions.contextLineCount': {
                type: 'integer',
                default: diffEditor_1.$kZ.hideUnchangedRegions.contextLineCount,
                markdownDescription: nls.localize(44, null),
                minimum: 1,
            },
            'diffEditor.experimental.showMoves': {
                type: 'boolean',
                default: diffEditor_1.$kZ.experimental.showMoves,
                markdownDescription: nls.localize(45, null)
            },
            'diffEditor.experimental.showEmptyDecorations': {
                type: 'boolean',
                default: diffEditor_1.$kZ.experimental.showEmptyDecorations,
                description: nls.localize(46, null),
            }
        }
    };
    function isConfigurationPropertySchema(x) {
        return (typeof x.type !== 'undefined' || typeof x.anyOf !== 'undefined');
    }
    // Add properties from the Editor Option Registry
    for (const editorOption of editorOptions_1.editorOptionsRegistry) {
        const schema = editorOption.schema;
        if (typeof schema !== 'undefined') {
            if (isConfigurationPropertySchema(schema)) {
                // This is a single schema contribution
                editorConfiguration.properties[`editor.${editorOption.name}`] = schema;
            }
            else {
                for (const key in schema) {
                    if (Object.hasOwnProperty.call(schema, key)) {
                        editorConfiguration.properties[key] = schema[key];
                    }
                }
            }
        }
    }
    let cachedEditorConfigurationKeys = null;
    function getEditorConfigurationKeys() {
        if (cachedEditorConfigurationKeys === null) {
            cachedEditorConfigurationKeys = Object.create(null);
            Object.keys(editorConfiguration.properties).forEach((prop) => {
                cachedEditorConfigurationKeys[prop] = true;
            });
        }
        return cachedEditorConfigurationKeys;
    }
    function $l1(key) {
        const editorConfigurationKeys = getEditorConfigurationKeys();
        return (editorConfigurationKeys[`editor.${key}`] || false);
    }
    exports.$l1 = $l1;
    function $m1(key) {
        const editorConfigurationKeys = getEditorConfigurationKeys();
        return (editorConfigurationKeys[`diffEditor.${key}`] || false);
    }
    exports.$m1 = $m1;
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration(editorConfiguration);
});
//# sourceMappingURL=editorConfigurationSchema.js.map