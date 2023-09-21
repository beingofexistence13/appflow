/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/config/diffEditor", "vs/editor/common/config/editorOptions", "vs/editor/common/core/textModelDefaults", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, diffEditor_1, editorOptions_1, textModelDefaults_1, nls, configurationRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isDiffEditorConfigurationKey = exports.isEditorConfigurationKey = exports.editorConfigurationBaseNode = void 0;
    exports.editorConfigurationBaseNode = Object.freeze({
        id: 'editor',
        order: 5,
        type: 'object',
        title: nls.localize('editorConfigurationTitle', "Editor"),
        scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
    });
    const editorConfiguration = {
        ...exports.editorConfigurationBaseNode,
        properties: {
            'editor.tabSize': {
                type: 'number',
                default: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.tabSize,
                minimum: 1,
                markdownDescription: nls.localize('tabSize', "The number of spaces a tab is equal to. This setting is overridden based on the file contents when {0} is on.", '`#editor.detectIndentation#`')
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
                markdownDescription: nls.localize('indentSize', "The number of spaces used for indentation or `\"tabSize\"` to use the value from `#editor.tabSize#`. This setting is overridden based on the file contents when `#editor.detectIndentation#` is on.")
            },
            'editor.insertSpaces': {
                type: 'boolean',
                default: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.insertSpaces,
                markdownDescription: nls.localize('insertSpaces', "Insert spaces when pressing `Tab`. This setting is overridden based on the file contents when {0} is on.", '`#editor.detectIndentation#`')
            },
            'editor.detectIndentation': {
                type: 'boolean',
                default: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.detectIndentation,
                markdownDescription: nls.localize('detectIndentation', "Controls whether {0} and {1} will be automatically detected when a file is opened based on the file contents.", '`#editor.tabSize#`', '`#editor.insertSpaces#`')
            },
            'editor.trimAutoWhitespace': {
                type: 'boolean',
                default: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.trimAutoWhitespace,
                description: nls.localize('trimAutoWhitespace', "Remove trailing auto inserted whitespace.")
            },
            'editor.largeFileOptimizations': {
                type: 'boolean',
                default: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.largeFileOptimizations,
                description: nls.localize('largeFileOptimizations', "Special handling for large files to disable certain memory intensive features.")
            },
            'editor.wordBasedSuggestions': {
                type: 'boolean',
                default: true,
                description: nls.localize('wordBasedSuggestions', "Controls whether completions should be computed based on words in the document.")
            },
            'editor.wordBasedSuggestionsMode': {
                enum: ['currentDocument', 'matchingDocuments', 'allDocuments'],
                default: 'matchingDocuments',
                enumDescriptions: [
                    nls.localize('wordBasedSuggestionsMode.currentDocument', 'Only suggest words from the active document.'),
                    nls.localize('wordBasedSuggestionsMode.matchingDocuments', 'Suggest words from all open documents of the same language.'),
                    nls.localize('wordBasedSuggestionsMode.allDocuments', 'Suggest words from all open documents.')
                ],
                description: nls.localize('wordBasedSuggestionsMode', "Controls from which documents word based completions are computed.")
            },
            'editor.semanticHighlighting.enabled': {
                enum: [true, false, 'configuredByTheme'],
                enumDescriptions: [
                    nls.localize('semanticHighlighting.true', 'Semantic highlighting enabled for all color themes.'),
                    nls.localize('semanticHighlighting.false', 'Semantic highlighting disabled for all color themes.'),
                    nls.localize('semanticHighlighting.configuredByTheme', 'Semantic highlighting is configured by the current color theme\'s `semanticHighlighting` setting.')
                ],
                default: 'configuredByTheme',
                description: nls.localize('semanticHighlighting.enabled', "Controls whether the semanticHighlighting is shown for the languages that support it.")
            },
            'editor.stablePeek': {
                type: 'boolean',
                default: false,
                markdownDescription: nls.localize('stablePeek', "Keep peek editors open even when double-clicking their content or when hitting `Escape`.")
            },
            'editor.maxTokenizationLineLength': {
                type: 'integer',
                default: 20000,
                description: nls.localize('maxTokenizationLineLength', "Lines above this length will not be tokenized for performance reasons")
            },
            'editor.experimental.asyncTokenization': {
                type: 'boolean',
                default: false,
                description: nls.localize('editor.experimental.asyncTokenization', "Controls whether the tokenization should happen asynchronously on a web worker."),
                tags: ['experimental'],
            },
            'editor.experimental.asyncTokenizationLogging': {
                type: 'boolean',
                default: false,
                description: nls.localize('editor.experimental.asyncTokenizationLogging', "Controls whether async tokenization should be logged. For debugging only."),
            },
            'editor.experimental.asyncTokenizationVerification': {
                type: 'boolean',
                default: false,
                description: nls.localize('editor.experimental.asyncTokenizationVerification', "Controls whether async tokenization should be verified against legacy background tokenization. Might slow down tokenization. For debugging only."),
                tags: ['experimental'],
            },
            'editor.language.brackets': {
                type: ['array', 'null'],
                default: null,
                description: nls.localize('schema.brackets', 'Defines the bracket symbols that increase or decrease the indentation.'),
                items: {
                    type: 'array',
                    items: [
                        {
                            type: 'string',
                            description: nls.localize('schema.openBracket', 'The opening bracket character or string sequence.')
                        },
                        {
                            type: 'string',
                            description: nls.localize('schema.closeBracket', 'The closing bracket character or string sequence.')
                        }
                    ]
                }
            },
            'editor.language.colorizedBracketPairs': {
                type: ['array', 'null'],
                default: null,
                description: nls.localize('schema.colorizedBracketPairs', 'Defines the bracket pairs that are colorized by their nesting level if bracket pair colorization is enabled.'),
                items: {
                    type: 'array',
                    items: [
                        {
                            type: 'string',
                            description: nls.localize('schema.openBracket', 'The opening bracket character or string sequence.')
                        },
                        {
                            type: 'string',
                            description: nls.localize('schema.closeBracket', 'The closing bracket character or string sequence.')
                        }
                    ]
                }
            },
            'diffEditor.maxComputationTime': {
                type: 'number',
                default: diffEditor_1.diffEditorDefaultOptions.maxComputationTime,
                description: nls.localize('maxComputationTime', "Timeout in milliseconds after which diff computation is cancelled. Use 0 for no timeout.")
            },
            'diffEditor.maxFileSize': {
                type: 'number',
                default: diffEditor_1.diffEditorDefaultOptions.maxFileSize,
                description: nls.localize('maxFileSize', "Maximum file size in MB for which to compute diffs. Use 0 for no limit.")
            },
            'diffEditor.renderSideBySide': {
                type: 'boolean',
                default: diffEditor_1.diffEditorDefaultOptions.renderSideBySide,
                description: nls.localize('sideBySide', "Controls whether the diff editor shows the diff side by side or inline.")
            },
            'diffEditor.renderSideBySideInlineBreakpoint': {
                type: 'number',
                default: diffEditor_1.diffEditorDefaultOptions.renderSideBySideInlineBreakpoint,
                description: nls.localize('renderSideBySideInlineBreakpoint', "If the diff editor width is smaller than this value, the inline view is used.")
            },
            'diffEditor.useInlineViewWhenSpaceIsLimited': {
                type: 'boolean',
                default: diffEditor_1.diffEditorDefaultOptions.useInlineViewWhenSpaceIsLimited,
                description: nls.localize('useInlineViewWhenSpaceIsLimited', "If enabled and the editor width is too small, the inline view is used.")
            },
            'diffEditor.renderMarginRevertIcon': {
                type: 'boolean',
                default: diffEditor_1.diffEditorDefaultOptions.renderMarginRevertIcon,
                description: nls.localize('renderMarginRevertIcon', "When enabled, the diff editor shows arrows in its glyph margin to revert changes.")
            },
            'diffEditor.ignoreTrimWhitespace': {
                type: 'boolean',
                default: diffEditor_1.diffEditorDefaultOptions.ignoreTrimWhitespace,
                description: nls.localize('ignoreTrimWhitespace', "When enabled, the diff editor ignores changes in leading or trailing whitespace.")
            },
            'diffEditor.renderIndicators': {
                type: 'boolean',
                default: diffEditor_1.diffEditorDefaultOptions.renderIndicators,
                description: nls.localize('renderIndicators', "Controls whether the diff editor shows +/- indicators for added/removed changes.")
            },
            'diffEditor.codeLens': {
                type: 'boolean',
                default: diffEditor_1.diffEditorDefaultOptions.diffCodeLens,
                description: nls.localize('codeLens', "Controls whether the editor shows CodeLens.")
            },
            'diffEditor.wordWrap': {
                type: 'string',
                enum: ['off', 'on', 'inherit'],
                default: diffEditor_1.diffEditorDefaultOptions.diffWordWrap,
                markdownEnumDescriptions: [
                    nls.localize('wordWrap.off', "Lines will never wrap."),
                    nls.localize('wordWrap.on', "Lines will wrap at the viewport width."),
                    nls.localize('wordWrap.inherit', "Lines will wrap according to the {0} setting.", '`#editor.wordWrap#`'),
                ]
            },
            'diffEditor.diffAlgorithm': {
                type: 'string',
                enum: ['legacy', 'advanced'],
                default: diffEditor_1.diffEditorDefaultOptions.diffAlgorithm,
                markdownEnumDescriptions: [
                    nls.localize('diffAlgorithm.legacy', "Uses the legacy diffing algorithm."),
                    nls.localize('diffAlgorithm.advanced', "Uses the advanced diffing algorithm."),
                ],
                tags: ['experimental'],
            },
            'diffEditor.hideUnchangedRegions.enabled': {
                type: 'boolean',
                default: diffEditor_1.diffEditorDefaultOptions.hideUnchangedRegions.enabled,
                markdownDescription: nls.localize('hideUnchangedRegions.enabled', "Controls whether the diff editor shows unchanged regions."),
            },
            'diffEditor.hideUnchangedRegions.revealLineCount': {
                type: 'integer',
                default: diffEditor_1.diffEditorDefaultOptions.hideUnchangedRegions.revealLineCount,
                markdownDescription: nls.localize('hideUnchangedRegions.revealLineCount', "Controls how many lines are used for unchanged regions."),
                minimum: 1,
            },
            'diffEditor.hideUnchangedRegions.minimumLineCount': {
                type: 'integer',
                default: diffEditor_1.diffEditorDefaultOptions.hideUnchangedRegions.minimumLineCount,
                markdownDescription: nls.localize('hideUnchangedRegions.minimumLineCount', "Controls how many lines are used as a minimum for unchanged regions."),
                minimum: 1,
            },
            'diffEditor.hideUnchangedRegions.contextLineCount': {
                type: 'integer',
                default: diffEditor_1.diffEditorDefaultOptions.hideUnchangedRegions.contextLineCount,
                markdownDescription: nls.localize('hideUnchangedRegions.contextLineCount', "Controls how many lines are used as context when comparing unchanged regions."),
                minimum: 1,
            },
            'diffEditor.experimental.showMoves': {
                type: 'boolean',
                default: diffEditor_1.diffEditorDefaultOptions.experimental.showMoves,
                markdownDescription: nls.localize('showMoves', "Controls whether the diff editor should show detected code moves.")
            },
            'diffEditor.experimental.showEmptyDecorations': {
                type: 'boolean',
                default: diffEditor_1.diffEditorDefaultOptions.experimental.showEmptyDecorations,
                description: nls.localize('showEmptyDecorations', "Controls whether the diff editor shows empty decorations to see where characters got inserted or deleted."),
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
    function isEditorConfigurationKey(key) {
        const editorConfigurationKeys = getEditorConfigurationKeys();
        return (editorConfigurationKeys[`editor.${key}`] || false);
    }
    exports.isEditorConfigurationKey = isEditorConfigurationKey;
    function isDiffEditorConfigurationKey(key) {
        const editorConfigurationKeys = getEditorConfigurationKeys();
        return (editorConfigurationKeys[`diffEditor.${key}`] || false);
    }
    exports.isDiffEditorConfigurationKey = isDiffEditorConfigurationKey;
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration(editorConfiguration);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQ29uZmlndXJhdGlvblNjaGVtYS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29uZmlnL2VkaXRvckNvbmZpZ3VyYXRpb25TY2hlbWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU25GLFFBQUEsMkJBQTJCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBcUI7UUFDNUUsRUFBRSxFQUFFLFFBQVE7UUFDWixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDO1FBQ3pELEtBQUssaURBQXlDO0tBQzlDLENBQUMsQ0FBQztJQUVILE1BQU0sbUJBQW1CLEdBQXVCO1FBQy9DLEdBQUcsbUNBQTJCO1FBQzlCLFVBQVUsRUFBRTtZQUNYLGdCQUFnQixFQUFFO2dCQUNqQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUseUNBQXFCLENBQUMsT0FBTztnQkFDdEMsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsK0dBQStHLEVBQUUsOEJBQThCLENBQUM7YUFDN0w7WUFDRCxtQkFBbUIsRUFBRTtnQkFDcEIsT0FBTyxFQUFFO29CQUNSO3dCQUNDLElBQUksRUFBRSxRQUFRO3dCQUNkLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQztxQkFDakI7b0JBQ0Q7d0JBQ0MsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsT0FBTyxFQUFFLENBQUM7cUJBQ1Y7aUJBQ0Q7Z0JBQ0QsT0FBTyxFQUFFLFNBQVM7Z0JBQ2xCLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLHFNQUFxTSxDQUFDO2FBQ3RQO1lBQ0QscUJBQXFCLEVBQUU7Z0JBQ3RC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