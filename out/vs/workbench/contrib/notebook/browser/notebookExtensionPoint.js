/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls, extensionsRegistry_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.notebookPreloadExtensionPoint = exports.notebookRendererExtensionPoint = exports.notebooksExtensionPoint = void 0;
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
        description: nls.localize('contributes.notebook.provider', 'Contributes notebook document provider.'),
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
                    description: nls.localize('contributes.notebook.provider.viewType', 'Type of the notebook.'),
                },
                [NotebookEditorContribution.displayName]: {
                    type: 'string',
                    description: nls.localize('contributes.notebook.provider.displayName', 'Human readable name of the notebook.'),
                },
                [NotebookEditorContribution.selector]: {
                    type: 'array',
                    description: nls.localize('contributes.notebook.provider.selector', 'Set of globs that the notebook is for.'),
                    items: {
                        type: 'object',
                        properties: {
                            filenamePattern: {
                                type: 'string',
                                description: nls.localize('contributes.notebook.provider.selector.filenamePattern', 'Glob that the notebook is enabled for.'),
                            },
                            excludeFileNamePattern: {
                                type: 'string',
                                description: nls.localize('contributes.notebook.selector.provider.excludeFileNamePattern', 'Glob that the notebook is disabled for.')
                            }
                        }
                    }
                },
                [NotebookEditorContribution.priority]: {
                    type: 'string',
                    markdownDeprecationMessage: nls.localize('contributes.priority', 'Controls if the custom editor is enabled automatically when the user opens a file. This may be overridden by users using the `workbench.editorAssociations` setting.'),
                    enum: [
                        notebookCommon_1.NotebookEditorPriority.default,
                        notebookCommon_1.NotebookEditorPriority.option,
                    ],
                    markdownEnumDescriptions: [
                        nls.localize('contributes.priority.default', 'The editor is automatically used when the user opens a resource, provided that no other default custom editors are registered for that resource.'),
                        nls.localize('contributes.priority.option', 'The editor is not automatically used when the user opens a resource, but a user can switch to the editor using the `Reopen With` command.'),
                    ],
                    default: 'default'
                }
            }
        }
    };
    const defaultRendererSnippet = Object.freeze({ id: '', displayName: '', mimeTypes: [''], entrypoint: '' });
    const notebookRendererContribution = {
        description: nls.localize('contributes.notebook.renderer', 'Contributes notebook output renderer provider.'),
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
                            description: nls.localize('contributes.notebook.renderer.viewType', 'Unique identifier of the notebook output renderer.'),
                        },
                        [NotebookRendererContribution.displayName]: {
                            type: 'string',
                            description: nls.localize('contributes.notebook.renderer.displayName', 'Human readable name of the notebook output renderer.'),
                        },
                        [NotebookRendererContribution.hardDependencies]: {
                            type: 'array',
                            uniqueItems: true,
                            items: { type: 'string' },
                            markdownDescription: nls.localize('contributes.notebook.renderer.hardDependencies', 'List of kernel dependencies the renderer requires. If any of the dependencies are present in the `NotebookKernel.preloads`, the renderer can be used.'),
                        },
                        [NotebookRendererContribution.optionalDependencies]: {
                            type: 'array',
                            uniqueItems: true,
                            items: { type: 'string' },
                            markdownDescription: nls.localize('contributes.notebook.renderer.optionalDependencies', 'List of soft kernel dependencies the renderer can make use of. If any of the dependencies are present in the `NotebookKernel.preloads`, the renderer will be preferred over renderers that don\'t interact with the kernel.'),
                        },
                        [NotebookRendererContribution.requiresMessaging]: {
                            default: 'never',
                            enum: [
                                'always',
                                'optional',
                                'never',
                            ],
                            enumDescriptions: [
                                nls.localize('contributes.notebook.renderer.requiresMessaging.always', 'Messaging is required. The renderer will only be used when it\'s part of an extension that can be run in an extension host.'),
                                nls.localize('contributes.notebook.renderer.requiresMessaging.optional', 'The renderer is better with messaging available, but it\'s not requried.'),
                                nls.localize('contributes.notebook.renderer.requiresMessaging.never', 'The renderer does not require messaging.'),
                            ],
                            description: nls.localize('contributes.notebook.renderer.requiresMessaging', 'Defines how and if the renderer needs to communicate with an extension host, via `createRendererMessaging`. Renderers with stronger messaging requirements may not work in all environments.'),
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
                                    description: nls.localize('contributes.notebook.selector', 'Set of globs that the notebook is for.'),
                                    items: {
                                        type: 'string'
                                    }
                                },
                                [NotebookRendererContribution.entrypoint]: {
                                    description: nls.localize('contributes.notebook.renderer.entrypoint', 'File to load in the webview to render the extension.'),
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
                                    description: nls.localize('contributes.notebook.renderer.entrypoint', 'File to load in the webview to render the extension.'),
                                    type: 'object',
                                    required: ['extends', 'path'],
                                    properties: {
                                        extends: {
                                            type: 'string',
                                            description: nls.localize('contributes.notebook.renderer.entrypoint.extends', 'Existing renderer that this one extends.'),
                                        },
                                        path: {
                                            type: 'string',
                                            description: nls.localize('contributes.notebook.renderer.entrypoint', 'File to load in the webview to render the extension.'),
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
        description: nls.localize('contributes.preload.provider', 'Contributes notebook preloads.'),
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
                    description: nls.localize('contributes.preload.provider.viewType', 'Type of the notebook.'),
                },
                [NotebookPreloadContribution.entrypoint]: {
                    type: 'string',
                    description: nls.localize('contributes.preload.entrypoint', 'Path to file loaded in the webview.'),
                },
                [NotebookPreloadContribution.localResourceRoots]: {
                    type: 'array',
                    items: { type: 'string' },
                    description: nls.localize('contributes.preload.localResourceRoots', 'Paths to additional resources that should be allowed in the webview.'),
                },
            }
        }
    };
    exports.notebooksExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
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
    exports.notebookRendererExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
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
    exports.notebookPreloadExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'notebookPreload',
        jsonSchema: notebookPreloadContribution,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFeHRlbnNpb25Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvbm90ZWJvb2tFeHRlbnNpb25Qb2ludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsTUFBTSwwQkFBMEIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2hELElBQUksRUFBRSxNQUFNO1FBQ1osV0FBVyxFQUFFLGFBQWE7UUFDMUIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsUUFBUSxFQUFFLFVBQVU7S0FDcEIsQ0FBQyxDQUFDO0lBU0gsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2xELEVBQUUsRUFBRSxJQUFJO1FBQ1IsV0FBVyxFQUFFLGFBQWE7UUFDMUIsU0FBUyxFQUFFLFdBQVc7UUFDdEIsVUFBVSxFQUFFLFlBQVk7UUFDeEIsZ0JBQWdCLEVBQUUsY0FBYztRQUNoQyxvQkFBb0IsRUFBRSxzQkFBc0I7UUFDNUMsaUJBQWlCLEVBQUUsbUJBQW1CO0tBQ3RDLENBQUMsQ0FBQztJQVlILE1BQU0sMkJBQTJCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNqRCxJQUFJLEVBQUUsTUFBTTtRQUNaLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLGtCQUFrQixFQUFFLG9CQUFvQjtLQUN4QyxDQUFDLENBQUM7SUFRSCxNQUFNLDRCQUE0QixHQUFnQjtRQUNqRCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSx5Q0FBeUMsQ0FBQztRQUNyRyxJQUFJLEVBQUUsT0FBTztRQUNiLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFB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