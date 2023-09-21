/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, nls_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VXb = void 0;
    const titleTranslated = (0, nls_1.localize)(0, null);
    exports.$VXb = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'walkthroughs',
        jsonSchema: {
            description: (0, nls_1.localize)(1, null),
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'title', 'description', 'steps'],
                defaultSnippets: [{ body: { 'id': '$1', 'title': '$2', 'description': '$3', 'steps': [] } }],
                properties: {
                    id: {
                        type: 'string',
                        description: (0, nls_1.localize)(2, null),
                    },
                    title: {
                        type: 'string',
                        description: (0, nls_1.localize)(3, null)
                    },
                    icon: {
                        type: 'string',
                        description: (0, nls_1.localize)(4, null),
                    },
                    description: {
                        type: 'string',
                        description: (0, nls_1.localize)(5, null)
                    },
                    featuredFor: {
                        type: 'array',
                        description: (0, nls_1.localize)(6, null),
                        items: {
                            type: 'string'
                        },
                    },
                    when: {
                        type: 'string',
                        description: (0, nls_1.localize)(7, null)
                    },
                    steps: {
                        type: 'array',
                        description: (0, nls_1.localize)(8, null),
                        items: {
                            type: 'object',
                            required: ['id', 'title', 'media'],
                            defaultSnippets: [{
                                    body: {
                                        'id': '$1', 'title': '$2', 'description': '$3',
                                        'completionEvents': ['$5'],
                                        'media': {},
                                    }
                                }],
                            properties: {
                                id: {
                                    type: 'string',
                                    description: (0, nls_1.localize)(9, null),
                                },
                                title: {
                                    type: 'string',
                                    description: (0, nls_1.localize)(10, null)
                                },
                                description: {
                                    type: 'string',
                                    description: (0, nls_1.localize)(11, null, `[${titleTranslated}](command:myext.command)`, `[${titleTranslated}](command:toSide:myext.command)`, `[${titleTranslated}](https://aka.ms)`)
                                },
                                button: {
                                    deprecationMessage: (0, nls_1.localize)(12, null, `[${titleTranslated}](command:myext.command)`, `[${titleTranslated}](command:toSide:myext.command)`, `[${titleTranslated}](https://aka.ms)`),
                                },
                                media: {
                                    type: 'object',
                                    description: (0, nls_1.localize)(13, null),
                                    oneOf: [
                                        {
                                            required: ['image', 'altText'],
                                            additionalProperties: false,
                                            properties: {
                                                path: {
                                                    deprecationMessage: (0, nls_1.localize)(14, null)
                                                },
                                                image: {
                                                    description: (0, nls_1.localize)(15, null),
                                                    oneOf: [
                                                        {
                                                            type: 'string',
                                                        },
                                                        {
                                                            type: 'object',
                                                            required: ['dark', 'light', 'hc', 'hcLight'],
                                                            properties: {
                                                                dark: {
                                                                    description: (0, nls_1.localize)(16, null),
                                                                    type: 'string',
                                                                },
                                                                light: {
                                                                    description: (0, nls_1.localize)(17, null),
                                                                    type: 'string',
                                                                },
                                                                hc: {
                                                                    description: (0, nls_1.localize)(18, null),
                                                                    type: 'string',
                                                                },
                                                                hcLight: {
                                                                    description: (0, nls_1.localize)(19, null),
                                                                    type: 'string',
                                                                }
                                                            }
                                                        }
                                                    ]
                                                },
                                                altText: {
                                                    type: 'string',
                                                    description: (0, nls_1.localize)(20, null)
                                                }
                                            }
                                        },
                                        {
                                            required: ['svg', 'altText'],
                                            additionalProperties: false,
                                            properties: {
                                                svg: {
                                                    description: (0, nls_1.localize)(21, null),
                                                    type: 'string',
                                                },
                                                altText: {
                                                    type: 'string',
                                                    description: (0, nls_1.localize)(22, null)
                                                },
                                            }
                                        },
                                        {
                                            required: ['markdown'],
                                            additionalProperties: false,
                                            properties: {
                                                path: {
                                                    deprecationMessage: (0, nls_1.localize)(23, null)
                                                },
                                                markdown: {
                                                    description: (0, nls_1.localize)(24, null),
                                                    type: 'string',
                                                }
                                            }
                                        }
                                    ]
                                },
                                completionEvents: {
                                    description: (0, nls_1.localize)(25, null),
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        defaultSnippets: [
                                            {
                                                label: 'onCommand',
                                                description: (0, nls_1.localize)(26, null),
                                                body: 'onCommand:${1:commandId}'
                                            },
                                            {
                                                label: 'onLink',
                                                description: (0, nls_1.localize)(27, null),
                                                body: 'onLink:${2:linkId}'
                                            },
                                            {
                                                label: 'onView',
                                                description: (0, nls_1.localize)(28, null),
                                                body: 'onView:${2:viewId}'
                                            },
                                            {
                                                label: 'onSettingChanged',
                                                description: (0, nls_1.localize)(29, null),
                                                body: 'onSettingChanged:${2:settingName}'
                                            },
                                            {
                                                label: 'onContext',
                                                description: (0, nls_1.localize)(30, null),
                                                body: 'onContext:${2:key}'
                                            },
                                            {
                                                label: 'onExtensionInstalled',
                                                description: (0, nls_1.localize)(31, null),
                                                body: 'onExtensionInstalled:${3:extensionId}'
                                            },
                                            {
                                                label: 'onStepSelected',
                                                description: (0, nls_1.localize)(32, null),
                                                body: 'onStepSelected'
                                            },
                                        ]
                                    }
                                },
                                doneOn: {
                                    description: (0, nls_1.localize)(33, null),
                                    deprecationMessage: (0, nls_1.localize)(34, null),
                                    type: 'object',
                                    required: ['command'],
                                    defaultSnippets: [{ 'body': { command: '$1' } }],
                                    properties: {
                                        'command': {
                                            description: (0, nls_1.localize)(35, null),
                                            type: 'string'
                                        }
                                    },
                                },
                                when: {
                                    type: 'string',
                                    description: (0, nls_1.localize)(36, null)
                                }
                            }
                        }
                    }
                }
            }
        },
        activationEventsGenerator: (walkthroughContributions, result) => {
            for (const walkthroughContribution of walkthroughContributions) {
                if (walkthroughContribution.id) {
                    result.push(`onWalkthrough:${walkthroughContribution.id}`);
                }
            }
        }
    });
});
//# sourceMappingURL=gettingStartedExtensionPoint.js.map