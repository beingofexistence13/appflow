define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls, platform_1, jsonContributionRegistry_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerProductIconThemeSchemas = exports.fontFormatRegex = exports.fontSizeRegex = exports.fontWeightRegex = exports.fontStyleRegex = exports.fontIdRegex = void 0;
    exports.fontIdRegex = '^([\\w_-]+)$';
    exports.fontStyleRegex = '^(normal|italic|(oblique[ \\w\\s-]+))$';
    exports.fontWeightRegex = '^(normal|bold|lighter|bolder|(\\d{0-1000}))$';
    exports.fontSizeRegex = '^([\\w .%_-]+)$';
    exports.fontFormatRegex = '^woff|woff2|truetype|opentype|embedded-opentype|svg$';
    const schemaId = 'vscode://schemas/product-icon-theme';
    const schema = {
        type: 'object',
        allowComments: true,
        allowTrailingCommas: true,
        properties: {
            fonts: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: nls.localize('schema.id', 'The ID of the font.'),
                            pattern: exports.fontIdRegex,
                            patternErrorMessage: nls.localize('schema.id.formatError', 'The ID must only contain letters, numbers, underscore and minus.')
                        },
                        src: {
                            type: 'array',
                            description: nls.localize('schema.src', 'The location of the font.'),
                            items: {
                                type: 'object',
                                properties: {
                                    path: {
                                        type: 'string',
                                        description: nls.localize('schema.font-path', 'The font path, relative to the current product icon theme file.'),
                                    },
                                    format: {
                                        type: 'string',
                                        description: nls.localize('schema.font-format', 'The format of the font.'),
                                        enum: ['woff', 'woff2', 'truetype', 'opentype', 'embedded-opentype', 'svg']
                                    }
                                },
                                required: [
                                    'path',
                                    'format'
                                ]
                            }
                        },
                        weight: {
                            type: 'string',
                            description: nls.localize('schema.font-weight', 'The weight of the font. See https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight for valid values.'),
                            anyOf: [
                                { enum: ['normal', 'bold', 'lighter', 'bolder'] },
                                { type: 'string', pattern: exports.fontWeightRegex }
                            ]
                        },
                        style: {
                            type: 'string',
                            description: nls.localize('schema.font-style', 'The style of the font. See https://developer.mozilla.org/en-US/docs/Web/CSS/font-style for valid values.'),
                            anyOf: [
                                { enum: ['normal', 'italic', 'oblique'] },
                                { type: 'string', pattern: exports.fontStyleRegex }
                            ]
                        }
                    },
                    required: [
                        'id',
                        'src'
                    ]
                }
            },
            iconDefinitions: {
                description: nls.localize('schema.iconDefinitions', 'Association of icon name to a font character.'),
                $ref: iconRegistry_1.iconsSchemaId
            }
        }
    };
    function registerProductIconThemeSchemas() {
        const schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
        schemaRegistry.registerSchema(schemaId, schema);
    }
    exports.registerProductIconThemeSchemas = registerProductIconThemeSchemas;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdEljb25UaGVtZVNjaGVtYS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90aGVtZXMvY29tbW9uL3Byb2R1Y3RJY29uVGhlbWVTY2hlbWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVdhLFFBQUEsV0FBVyxHQUFHLGNBQWMsQ0FBQztJQUM3QixRQUFBLGNBQWMsR0FBRyx3Q0FBd0MsQ0FBQztJQUMxRCxRQUFBLGVBQWUsR0FBRyw4Q0FBOEMsQ0FBQztJQUNqRSxRQUFBLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQztJQUNsQyxRQUFBLGVBQWUsR0FBRyxzREFBc0QsQ0FBQztJQUV0RixNQUFNLFFBQVEsR0FBRyxxQ0FBcUMsQ0FBQztJQUN2RCxNQUFNLE1BQU0sR0FBZ0I7UUFDM0IsSUFBSSxFQUFFLFFBQVE7UUFDZCxhQUFhLEVBQUUsSUFBSTtRQUNuQixtQkFBbUIsRUFBRSxJQUFJO1FBQ3pCLFVBQVUsRUFBRTtZQUNYLEtBQUssRUFBRTtnQkFDTixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUU7b0JBQ04sSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNYLEVBQUUsRUFBRTs0QkFDSCxJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUscUJBQXFCLENBQUM7NEJBQzdELE9BQU8sRUFBRSxtQkFBVzs0QkFDcEIsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxrRUFBa0UsQ0FBQzt5QkFDOUg7d0JBQ0QsR0FBRyxFQUFFOzRCQUNKLElBQUksRUFBRSxPQUFPOzRCQUNiLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSwyQkFBMkIsQ0FBQzs0QkFDcEUsS0FBSyxFQUFFO2dDQUNOLElBQUksRUFBRSxRQUFRO2dDQUNkLFVBQVUsRUFBRTtvQ0FDWCxJQUFJLEVBQUU7d0NBQ0wsSUFBSSxFQUFFLFFBQVE7d0NBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsaUVBQWlFLENBQUM7cUNBQ2hIO29DQUNELE1BQU0sRUFBRTt3Q0FDUCxJQUFJLEVBQUUsUUFBUTt3Q0FDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSx5QkFBeUIsQ0FBQzt3Q0FDMUUsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLEtBQUssQ0FBQztxQ0FDM0U7aUNBQ0Q7Z0NBQ0QsUUFBUSxFQUFFO29DQUNULE1BQU07b0NBQ04sUUFBUTtpQ0FDUjs2QkFDRDt5QkFDRDt3QkFDRCxNQUFNLEVBQUU7NEJBQ1AsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsNEdBQTRHLENBQUM7NEJBQzdKLEtBQUssRUFBRTtnQ0FDTixFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dDQUNqRCxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLHVCQUFlLEVBQUU7NkJBQzVDO3lCQUNEO3dCQUNELEtBQUssRUFBRTs0QkFDTixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSwwR0FBMEcsQ0FBQzs0QkFDMUosS0FBSyxFQUFFO2dDQUNOLEVBQUUsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFBRTtnQ0FDekMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxzQkFBYyxFQUFFOzZCQUMzQzt5QkFDRDtxQkFDRDtvQkFDRCxRQUFRLEVBQUU7d0JBQ1QsSUFBSTt3QkFDSixLQUFLO3FCQUNMO2lCQUNEO2FBQ0Q7WUFDRCxlQUFlLEVBQUU7Z0JBQ2hCLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLCtDQUErQyxDQUFDO2dCQUNwRyxJQUFJLEVBQUUsNEJBQWE7YUFDbkI7U0FDRDtLQUNELENBQUM7SUFFRixTQUFnQiwrQkFBK0I7UUFDOUMsTUFBTSxjQUFjLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQTRCLHFDQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMvRixjQUFjLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBSEQsMEVBR0MifQ==