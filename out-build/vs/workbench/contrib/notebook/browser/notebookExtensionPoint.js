/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/notebookExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls, extensionsRegistry_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oEb = exports.$nEb = exports.$mEb = void 0;
    const NotebookEditorContribution = Object.freeze({
        type: 'type',
        displayName: 'displayName',
        selector: 'selector',
        priority: 'priority',
    });
    const NotebookRendererContribution = Object.freeze({
        id: 'id',
        displayName: 'displayName',
        mimeTypes: 'mimeTypes',
        entrypoint: 'entrypoint',
        hardDependencies: 'dependencies',
        optionalDependencies: 'optionalDependencies',
        requiresMessaging: 'requiresMessaging',
    });
    const NotebookPreloadContribution = Object.freeze({
        type: 'type',
        entrypoint: 'entrypoint',
        localResourceRoots: 'localResourceRoots',
    });
    const notebookProviderContribution = {
        description: nls.localize(0, null),
        type: 'array',
        defaultSnippets: [{ body: [{ type: '', displayName: '', 'selector': [{ 'filenamePattern': '' }] }] }],
        items: {
            type: 'object',
            required: [
                NotebookEditorContribution.type,
                NotebookEditorContribution.displayName,
                NotebookEditorContribution.selector,
            ],
            properties: {
                [NotebookEditorContribution.type]: {
                    type: 'string',
                    description: nls.localize(1, null),
                },
                [NotebookEditorContribution.displayName]: {
                    type: 'string',
                    description: nls.localize(2, null),
                },
                [NotebookEditorContribution.selector]: {
                    type: 'array',
                    description: nls.localize(3, null),
                    items: {
                        type: 'object',
                        properties: {
                            filenamePattern: {
                                type: 'string',
                                description: nls.localize(4, null),
                            },
                            excludeFileNamePattern: {
                                type: 'string',
                                description: nls.localize(5, null)
                            }
                        }
                    }
                },
                [NotebookEditorContribution.priority]: {
                    type: 'string',
                    markdownDeprecationMessage: nls.localize(6, null),
                    enum: [
                        notebookCommon_1.NotebookEditorPriority.default,
                        notebookCommon_1.NotebookEditorPriority.option,
                    ],
                    markdownEnumDescriptions: [
                        nls.localize(7, null),
                        nls.localize(8, null),
                    ],
                    default: 'default'
                }
            }
        }
    };
    const defaultRendererSnippet = Object.freeze({ id: '', displayName: '', mimeTypes: [''], entrypoint: '' });
    const notebookRendererContribution = {
        description: nls.localize(9, null),
        type: 'array',
        defaultSnippets: [{ body: [defaultRendererSnippet] }],
        items: {
            defaultSnippets: [{ body: defaultRendererSnippet }],
            allOf: [
                {
                    type: 'object',
                    required: [
                        NotebookRendererContribution.id,
                        NotebookRendererContribution.displayName,
                    ],
                    properties: {
                        [NotebookRendererContribution.id]: {
                            type: 'string',
                            description: nls.localize(10, null),
                        },
                        [NotebookRendererContribution.displayName]: {
                            type: 'string',
                            description: nls.localize(11, null),
                        },
                        [NotebookRendererContribution.hardDependencies]: {
                            type: 'array',
                            uniqueItems: true,
                            items: { type: 'string' },
                            markdownDescription: nls.localize(12, null),
                        },
                        [NotebookRendererContribution.optionalDependencies]: {
                            type: 'array',
                            uniqueItems: true,
                            items: { type: 'string' },
                            markdownDescription: nls.localize(13, null),
                        },
                        [NotebookRendererContribution.requiresMessaging]: {
                            default: 'never',
                            enum: [
                                'always',
                                'optional',
                                'never',
                            ],
                            enumDescriptions: [
                                nls.localize(14, null),
                                nls.localize(15, null),
                                nls.localize(16, null),
                            ],
                            description: nls.localize(17, null),
                        },
                    }
                },
                {
                    oneOf: [
                        {
                            required: [
                                NotebookRendererContribution.entrypoint,
                                NotebookRendererContribution.mimeTypes,
                            ],
                            properties: {
                                [NotebookRendererContribution.mimeTypes]: {
                                    type: 'array',
                                    description: nls.localize(18, null),
                                    items: {
                                        type: 'string'
                                    }
                                },
                                [NotebookRendererContribution.entrypoint]: {
                                    description: nls.localize(19, null),
                                    type: 'string',
                                },
                            }
                        },
                        {
                            required: [
                                NotebookRendererContribution.entrypoint,
                            ],
                            properties: {
                                [NotebookRendererContribution.entrypoint]: {
                                    description: nls.localize(20, null),
                                    type: 'object',
                                    required: ['extends', 'path'],
                                    properties: {
                                        extends: {
                                            type: 'string',
                                            description: nls.localize(21, null),
                                        },
                                        path: {
                                            type: 'string',
                                            description: nls.localize(22, null),
                                        },
                                    }
                                },
                            }
                        }
                    ]
                }
            ]
        }
    };
    const notebookPreloadContribution = {
        description: nls.localize(23, null),
        type: 'array',
        defaultSnippets: [{ body: [{ type: '', entrypoint: '' }] }],
        items: {
            type: 'object',
            required: [
                NotebookPreloadContribution.type,
                NotebookPreloadContribution.entrypoint
            ],
            properties: {
                [NotebookPreloadContribution.type]: {
                    type: 'string',
                    description: nls.localize(24, null),
                },
                [NotebookPreloadContribution.entrypoint]: {
                    type: 'string',
                    description: nls.localize(25, null),
                },
                [NotebookPreloadContribution.localResourceRoots]: {
                    type: 'array',
                    items: { type: 'string' },
                    description: nls.localize(26, null),
                },
            }
        }
    };
    exports.$mEb = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'notebooks',
        jsonSchema: notebookProviderContribution,
        activationEventsGenerator: (contribs, result) => {
            for (const contrib of contribs) {
                if (contrib.type) {
                    result.push(`onNotebookSerializer:${contrib.type}`);
                }
            }
        }
    });
    exports.$nEb = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'notebookRenderer',
        jsonSchema: notebookRendererContribution,
        activationEventsGenerator: (contribs, result) => {
            for (const contrib of contribs) {
                if (contrib.id) {
                    result.push(`onRenderer:${contrib.id}`);
                }
            }
        }
    });
    exports.$oEb = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'notebookPreload',
        jsonSchema: notebookPreloadContribution,
    });
});
//# sourceMappingURL=notebookExtensionPoint.js.map