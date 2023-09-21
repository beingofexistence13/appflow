define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/tokenClassificationRegistry"], function (require, exports, nls, platform_1, jsonContributionRegistry_1, colorRegistry_1, tokenClassificationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerColorThemeSchemas = exports.colorThemeSchemaId = exports.textmateColorGroupSchemaId = exports.textmateColorsSchemaId = void 0;
    const textMateScopes = [
        'comment',
        'comment.block',
        'comment.block.documentation',
        'comment.line',
        'constant',
        'constant.character',
        'constant.character.escape',
        'constant.numeric',
        'constant.numeric.integer',
        'constant.numeric.float',
        'constant.numeric.hex',
        'constant.numeric.octal',
        'constant.other',
        'constant.regexp',
        'constant.rgb-value',
        'emphasis',
        'entity',
        'entity.name',
        'entity.name.class',
        'entity.name.function',
        'entity.name.method',
        'entity.name.section',
        'entity.name.selector',
        'entity.name.tag',
        'entity.name.type',
        'entity.other',
        'entity.other.attribute-name',
        'entity.other.inherited-class',
        'invalid',
        'invalid.deprecated',
        'invalid.illegal',
        'keyword',
        'keyword.control',
        'keyword.operator',
        'keyword.operator.new',
        'keyword.operator.assignment',
        'keyword.operator.arithmetic',
        'keyword.operator.logical',
        'keyword.other',
        'markup',
        'markup.bold',
        'markup.changed',
        'markup.deleted',
        'markup.heading',
        'markup.inline.raw',
        'markup.inserted',
        'markup.italic',
        'markup.list',
        'markup.list.numbered',
        'markup.list.unnumbered',
        'markup.other',
        'markup.quote',
        'markup.raw',
        'markup.underline',
        'markup.underline.link',
        'meta',
        'meta.block',
        'meta.cast',
        'meta.class',
        'meta.function',
        'meta.function-call',
        'meta.preprocessor',
        'meta.return-type',
        'meta.selector',
        'meta.tag',
        'meta.type.annotation',
        'meta.type',
        'punctuation.definition.string.begin',
        'punctuation.definition.string.end',
        'punctuation.separator',
        'punctuation.separator.continuation',
        'punctuation.terminator',
        'storage',
        'storage.modifier',
        'storage.type',
        'string',
        'string.interpolated',
        'string.other',
        'string.quoted',
        'string.quoted.double',
        'string.quoted.other',
        'string.quoted.single',
        'string.quoted.triple',
        'string.regexp',
        'string.unquoted',
        'strong',
        'support',
        'support.class',
        'support.constant',
        'support.function',
        'support.other',
        'support.type',
        'support.type.property-name',
        'support.variable',
        'variable',
        'variable.language',
        'variable.name',
        'variable.other',
        'variable.other.readwrite',
        'variable.parameter'
    ];
    exports.textmateColorsSchemaId = 'vscode://schemas/textmate-colors';
    exports.textmateColorGroupSchemaId = `${exports.textmateColorsSchemaId}#/definitions/colorGroup`;
    const textmateColorSchema = {
        type: 'array',
        definitions: {
            colorGroup: {
                default: '#FF0000',
                anyOf: [
                    {
                        type: 'string',
                        format: 'color-hex'
                    },
                    {
                        $ref: '#/definitions/settings'
                    }
                ]
            },
            settings: {
                type: 'object',
                description: nls.localize('schema.token.settings', 'Colors and styles for the token.'),
                properties: {
                    foreground: {
                        type: 'string',
                        description: nls.localize('schema.token.foreground', 'Foreground color for the token.'),
                        format: 'color-hex',
                        default: '#ff0000'
                    },
                    background: {
                        type: 'string',
                        deprecationMessage: nls.localize('schema.token.background.warning', 'Token background colors are currently not supported.')
                    },
                    fontStyle: {
                        type: 'string',
                        description: nls.localize('schema.token.fontStyle', 'Font style of the rule: \'italic\', \'bold\', \'underline\', \'strikethrough\' or a combination. The empty string unsets inherited settings.'),
                        pattern: '^(\\s*\\b(italic|bold|underline|strikethrough))*\\s*$',
                        patternErrorMessage: nls.localize('schema.fontStyle.error', 'Font style must be \'italic\', \'bold\', \'underline\', \'strikethrough\' or a combination or the empty string.'),
                        defaultSnippets: [
                            { label: nls.localize('schema.token.fontStyle.none', 'None (clear inherited style)'), bodyText: '""' },
                            { body: 'italic' },
                            { body: 'bold' },
                            { body: 'underline' },
                            { body: 'strikethrough' },
                            { body: 'italic bold' },
                            { body: 'italic underline' },
                            { body: 'italic strikethrough' },
                            { body: 'bold underline' },
                            { body: 'bold strikethrough' },
                            { body: 'underline strikethrough' },
                            { body: 'italic bold underline' },
                            { body: 'italic bold strikethrough' },
                            { body: 'italic underline strikethrough' },
                            { body: 'bold underline strikethrough' },
                            { body: 'italic bold underline strikethrough' }
                        ]
                    }
                },
                additionalProperties: false,
                defaultSnippets: [{ body: { foreground: '${1:#FF0000}', fontStyle: '${2:bold}' } }]
            }
        },
        items: {
            type: 'object',
            defaultSnippets: [{ body: { scope: '${1:keyword.operator}', settings: { foreground: '${2:#FF0000}' } } }],
            properties: {
                name: {
                    type: 'string',
                    description: nls.localize('schema.properties.name', 'Description of the rule.')
                },
                scope: {
                    description: nls.localize('schema.properties.scope', 'Scope selector against which this rule matches.'),
                    anyOf: [
                        {
                            enum: textMateScopes
                        },
                        {
                            type: 'string'
                        },
                        {
                            type: 'array',
                            items: {
                                enum: textMateScopes
                            }
                        },
                        {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        }
                    ]
                },
                settings: {
                    $ref: '#/definitions/settings'
                }
            },
            required: [
                'settings'
            ],
            additionalProperties: false
        }
    };
    exports.colorThemeSchemaId = 'vscode://schemas/color-theme';
    const colorThemeSchema = {
        type: 'object',
        allowComments: true,
        allowTrailingCommas: true,
        properties: {
            colors: {
                description: nls.localize('schema.workbenchColors', 'Colors in the workbench'),
                $ref: colorRegistry_1.workbenchColorsSchemaId,
                additionalProperties: false
            },
            tokenColors: {
                anyOf: [{
                        type: 'string',
                        description: nls.localize('schema.tokenColors.path', 'Path to a tmTheme file (relative to the current file).')
                    },
                    {
                        description: nls.localize('schema.colors', 'Colors for syntax highlighting'),
                        $ref: exports.textmateColorsSchemaId
                    }
                ]
            },
            semanticHighlighting: {
                type: 'boolean',
                description: nls.localize('schema.supportsSemanticHighlighting', 'Whether semantic highlighting should be enabled for this theme.')
            },
            semanticTokenColors: {
                type: 'object',
                description: nls.localize('schema.semanticTokenColors', 'Colors for semantic tokens'),
                $ref: tokenClassificationRegistry_1.tokenStylingSchemaId
            }
        }
    };
    function registerColorThemeSchemas() {
        const schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
        schemaRegistry.registerSchema(exports.colorThemeSchemaId, colorThemeSchema);
        schemaRegistry.registerSchema(exports.textmateColorsSchemaId, textmateColorSchema);
    }
    exports.registerColorThemeSchemas = registerColorThemeSchemas;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JUaGVtZVNjaGVtYS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90aGVtZXMvY29tbW9uL2NvbG9yVGhlbWVTY2hlbWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWFBLE1BQU0sY0FBYyxHQUFHO1FBQ3RCLFNBQVM7UUFDVCxlQUFlO1FBQ2YsNkJBQTZCO1FBQzdCLGNBQWM7UUFDZCxVQUFVO1FBQ1Ysb0JBQW9CO1FBQ3BCLDJCQUEyQjtRQUMzQixrQkFBa0I7UUFDbEIsMEJBQTBCO1FBQzFCLHdCQUF3QjtRQUN4QixzQkFBc0I7UUFDdEIsd0JBQXdCO1FBQ3hCLGdCQUFnQjtRQUNoQixpQkFBaUI7UUFDakIsb0JBQW9CO1FBQ3BCLFVBQVU7UUFDVixRQUFRO1FBQ1IsYUFBYTtRQUNiLG1CQUFtQjtRQUNuQixzQkFBc0I7UUFDdEIsb0JBQW9CO1FBQ3BCLHFCQUFxQjtRQUNyQixzQkFBc0I7UUFDdEIsaUJBQWlCO1FBQ2pCLGtCQUFrQjtRQUNsQixjQUFjO1FBQ2QsNkJBQTZCO1FBQzdCLDhCQUE4QjtRQUM5QixTQUFTO1FBQ1Qsb0JBQW9CO1FBQ3BCLGlCQUFpQjtRQUNqQixTQUFTO1FBQ1QsaUJBQWlCO1FBQ2pCLGtCQUFrQjtRQUNsQixzQkFBc0I7UUFDdEIsNkJBQTZCO1FBQzdCLDZCQUE2QjtRQUM3QiwwQkFBMEI7UUFDMUIsZUFBZTtRQUNmLFFBQVE7UUFDUixhQUFhO1FBQ2IsZ0JBQWdCO1FBQ2hCLGdCQUFnQjtRQUNoQixnQkFBZ0I7UUFDaEIsbUJBQW1CO1FBQ25CLGlCQUFpQjtRQUNqQixlQUFlO1FBQ2YsYUFBYTtRQUNiLHNCQUFzQjtRQUN0Qix3QkFBd0I7UUFDeEIsY0FBYztRQUNkLGNBQWM7UUFDZCxZQUFZO1FBQ1osa0JBQWtCO1FBQ2xCLHVCQUF1QjtRQUN2QixNQUFNO1FBQ04sWUFBWTtRQUNaLFdBQVc7UUFD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