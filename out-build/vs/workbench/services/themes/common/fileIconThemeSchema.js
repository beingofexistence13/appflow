define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/fileIconThemeSchema", "vs/platform/registry/common/platform", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/services/themes/common/productIconThemeSchema"], function (require, exports, nls, platform_1, jsonContributionRegistry_1, productIconThemeSchema_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mzb = void 0;
    const schemaId = 'vscode://schemas/icon-theme';
    const schema = {
        type: 'object',
        allowComments: true,
        allowTrailingCommas: true,
        definitions: {
            folderExpanded: {
                type: 'string',
                description: nls.localize(0, null)
            },
            folder: {
                type: 'string',
                description: nls.localize(1, null)
            },
            file: {
                type: 'string',
                description: nls.localize(2, null)
            },
            folderNames: {
                type: 'object',
                description: nls.localize(3, null),
                additionalProperties: {
                    type: 'string',
                    description: nls.localize(4, null)
                }
            },
            folderNamesExpanded: {
                type: 'object',
                description: nls.localize(5, null),
                additionalProperties: {
                    type: 'string',
                    description: nls.localize(6, null)
                }
            },
            fileExtensions: {
                type: 'object',
                description: nls.localize(7, null),
                additionalProperties: {
                    type: 'string',
                    description: nls.localize(8, null)
                }
            },
            fileNames: {
                type: 'object',
                description: nls.localize(9, null),
                additionalProperties: {
                    type: 'string',
                    description: nls.localize(10, null)
                }
            },
            languageIds: {
                type: 'object',
                description: nls.localize(11, null),
                additionalProperties: {
                    type: 'string',
                    description: nls.localize(12, null)
                }
            },
            associations: {
                type: 'object',
                properties: {
                    folderExpanded: {
                        $ref: '#/definitions/folderExpanded'
                    },
                    folder: {
                        $ref: '#/definitions/folder'
                    },
                    file: {
                        $ref: '#/definitions/file'
                    },
                    folderNames: {
                        $ref: '#/definitions/folderNames'
                    },
                    folderNamesExpanded: {
                        $ref: '#/definitions/folderNamesExpanded'
                    },
                    fileExtensions: {
                        $ref: '#/definitions/fileExtensions'
                    },
                    fileNames: {
                        $ref: '#/definitions/fileNames'
                    },
                    languageIds: {
                        $ref: '#/definitions/languageIds'
                    }
                }
            }
        },
        properties: {
            fonts: {
                type: 'array',
                description: nls.localize(13, null),
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: nls.localize(14, null),
                            pattern: productIconThemeSchema_1.$gzb,
                            patternErrorMessage: nls.localize(15, null)
                        },
                        src: {
                            type: 'array',
                            description: nls.localize(16, null),
                            items: {
                                type: 'object',
                                properties: {
                                    path: {
                                        type: 'string',
                                        description: nls.localize(17, null),
                                    },
                                    format: {
                                        type: 'string',
                                        description: nls.localize(18, null),
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
                            description: nls.localize(19, null),
                            pattern: productIconThemeSchema_1.$izb
                        },
                        style: {
                            type: 'string',
                            description: nls.localize(20, null),
                            pattern: productIconThemeSchema_1.$hzb
                        },
                        size: {
                            type: 'string',
                            description: nls.localize(21, null),
                            pattern: productIconThemeSchema_1.$jzb
                        }
                    },
                    required: [
                        'id',
                        'src'
                    ]
                }
            },
            iconDefinitions: {
                type: 'object',
                description: nls.localize(22, null),
                additionalProperties: {
                    type: 'object',
                    description: nls.localize(23, null),
                    properties: {
                        iconPath: {
                            type: 'string',
                            description: nls.localize(24, null)
                        },
                        fontCharacter: {
                            type: 'string',
                            description: nls.localize(25, null)
                        },
                        fontColor: {
                            type: 'string',
                            format: 'color-hex',
                            description: nls.localize(26, null)
                        },
                        fontSize: {
                            type: 'string',
                            description: nls.localize(27, null),
                            pattern: productIconThemeSchema_1.$jzb
                        },
                        fontId: {
                            type: 'string',
                            description: nls.localize(28, null)
                        }
                    }
                }
            },
            folderExpanded: {
                $ref: '#/definitions/folderExpanded'
            },
            folder: {
                $ref: '#/definitions/folder'
            },
            file: {
                $ref: '#/definitions/file'
            },
            folderNames: {
                $ref: '#/definitions/folderNames'
            },
            folderNamesExpanded: {
                $ref: '#/definitions/folderNamesExpanded'
            },
            fileExtensions: {
                $ref: '#/definitions/fileExtensions'
            },
            fileNames: {
                $ref: '#/definitions/fileNames'
            },
            languageIds: {
                $ref: '#/definitions/languageIds'
            },
            light: {
                $ref: '#/definitions/associations',
                description: nls.localize(29, null)
            },
            highContrast: {
                $ref: '#/definitions/associations',
                description: nls.localize(30, null)
            },
            hidesExplorerArrows: {
                type: 'boolean',
                description: nls.localize(31, null)
            },
            showLanguageModeIcons: {
                type: 'boolean',
                description: nls.localize(32, null)
            }
        }
    };
    function $mzb() {
        const schemaRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
        schemaRegistry.registerSchema(schemaId, schema);
    }
    exports.$mzb = $mzb;
});
//# sourceMappingURL=fileIconThemeSchema.js.map