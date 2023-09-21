define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/productIconThemeSchema", "vs/platform/registry/common/platform", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls, platform_1, jsonContributionRegistry_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lzb = exports.$kzb = exports.$jzb = exports.$izb = exports.$hzb = exports.$gzb = void 0;
    exports.$gzb = '^([\\w_-]+)$';
    exports.$hzb = '^(normal|italic|(oblique[ \\w\\s-]+))$';
    exports.$izb = '^(normal|bold|lighter|bolder|(\\d{0-1000}))$';
    exports.$jzb = '^([\\w .%_-]+)$';
    exports.$kzb = '^woff|woff2|truetype|opentype|embedded-opentype|svg$';
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
                            description: nls.localize(0, null),
                            pattern: exports.$gzb,
                            patternErrorMessage: nls.localize(1, null)
                        },
                        src: {
                            type: 'array',
                            description: nls.localize(2, null),
                            items: {
                                type: 'object',
                                properties: {
                                    path: {
                                        type: 'string',
                                        description: nls.localize(3, null),
                                    },
                                    format: {
                                        type: 'string',
                                        description: nls.localize(4, null),
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
                            description: nls.localize(5, null),
                            anyOf: [
                                { enum: ['normal', 'bold', 'lighter', 'bolder'] },
                                { type: 'string', pattern: exports.$izb }
                            ]
                        },
                        style: {
                            type: 'string',
                            description: nls.localize(6, null),
                            anyOf: [
                                { enum: ['normal', 'italic', 'oblique'] },
                                { type: 'string', pattern: exports.$hzb }
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
                description: nls.localize(7, null),
                $ref: iconRegistry_1.$$u
            }
        }
    };
    function $lzb() {
        const schemaRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
        schemaRegistry.registerSchema(schemaId, schema);
    }
    exports.$lzb = $lzb;
});
//# sourceMappingURL=productIconThemeSchema.js.map