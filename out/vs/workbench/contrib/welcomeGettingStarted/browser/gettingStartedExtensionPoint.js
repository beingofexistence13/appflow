/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, nls_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.walkthroughsExtensionPoint = void 0;
    const titleTranslated = (0, nls_1.localize)('title', "Title");
    exports.walkthroughsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'walkthroughs',
        jsonSchema: {
            description: (0, nls_1.localize)('walkthroughs', "Contribute walkthroughs to help users getting started with your extension."),
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'title', 'description', 'steps'],
                defaultSnippets: [{ body: { 'id': '$1', 'title': '$2', 'description': '$3', 'steps': [] } }],
                properties: {
                    id: {
                        type: 'string',
                        description: (0, nls_1.localize)('walkthroughs.id', "Unique identifier for this walkthrough."),
                    },
                    title: {
                        type: 'string',
                        description: (0, nls_1.localize)('walkthroughs.title', "Title of walkthrough.")
                    },
                    icon: {
                        type: 'string',
                        description: (0, nls_1.localize)('walkthroughs.icon', "Relative path to the icon of the walkthrough. The path is relative to the extension location. If not specified, the icon defaults to the extension icon if available."),
                    },
                    description: {
                        type: 'string',
                        description: (0, nls_1.localize)('walkthroughs.description', "Description of walkthrough.")
                    },
                    featuredFor: {
                        type: 'array',
                        description: (0, nls_1.localize)('walkthroughs.featuredFor', "Walkthroughs that match one of these glob patterns appear as 'featured' in workspaces with the specified files. For example, a walkthrough for TypeScript projects might specify `tsconfig.json` here."),
                        items: {
                            type: 'string'
                        },
                    },
                    when: {
                        type: 'string',
                        description: (0, nls_1.localize)('walkthroughs.when', "Context key expression to control the visibility of this walkthrough.")
                    },
                    steps: {
                        type: 'array',
                        description: (0, nls_1.localize)('walkthroughs.steps', "Steps to complete as part of this walkthrough."),
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
                                    description: (0, nls_1.localize)('walkthroughs.steps.id', "Unique identifier for this step. This is used to keep track of which steps have been completed."),
                                },
                                title: {
                                    type: 'string',
                                    description: (0, nls_1.localize)('walkthroughs.steps.title', "Title of step.")
                                },
                                description: {
                                    type: 'string',
                                    description: (0, nls_1.localize)('walkthroughs.steps.description.interpolated', "Description of step. Supports ``preformatted``, __italic__, and **bold** text. Use markdown-style links for commands or external links: {0}, {1}, or {2}. Links on their own line will be rendered as buttons.", `[${titleTranslated}](command:myext.command)`, `[${titleTranslated}](command:toSide:myext.command)`, `[${titleTranslated}](https://aka.ms)`)
                                },
                                button: {
                                    deprecationMessage: (0, nls_1.localize)('walkthroughs.steps.button.deprecated.interpolated', "Deprecated. Use markdown links in the description instead, i.e. {0}, {1}, or {2}", `[${titleTranslated}](command:myext.command)`, `[${titleTranslated}](command:toSide:myext.command)`, `[${titleTranslated}](https://aka.ms)`),
                                },
                                media: {
                                    type: 'object',
                                    description: (0, nls_1.localize)('walkthroughs.steps.media', "Media to show alongside this step, either an image or markdown content."),
                                    oneOf: [
                                        {
                                            required: ['image', 'altText'],
                                            additionalProperties: false,
                                            properties: {
                                                path: {
                                                    deprecationMessage: (0, nls_1.localize)('pathDeprecated', "Deprecated. Please use `image` or `markdown` instead")
                                                },
                                                image: {
                                                    description: (0, nls_1.localize)('walkthroughs.steps.media.image.path.string', "Path to an image - or object consisting of paths to light, dark, and hc images - relative to extension directory. Depending on context, the image will be displayed from 400px to 800px wide, with similar bounds on height. To support HIDPI displays, the image will be rendered at 1.5x scaling, for example a 900 physical pixels wide image will be displayed as 600 logical pixels wide."),
                                                    oneOf: [
                                                        {
                                                            type: 'string',
                                                        },
                                                        {
                                                            type: 'object',
                                                            required: ['dark', 'light', 'hc', 'hcLight'],
                                                            properties: {
                                                                dark: {
                                                                    description: (0, nls_1.localize)('walkthroughs.steps.media.image.path.dark.string', "Path to the image for dark themes, relative to extension directory."),
                                                                    type: 'string',
                                                                },
                                                                light: {
                                                                    description: (0, nls_1.localize)('walkthroughs.steps.media.image.path.light.string', "Path to the image for light themes, relative to extension directory."),
                                                                    type: 'string',
                                                                },
                                                                hc: {
                                                                    description: (0, nls_1.localize)('walkthroughs.steps.media.image.path.hc.string', "Path to the image for hc themes, relative to extension directory."),
                                                                    type: 'string',
                                                                },
                                                                hcLight: {
                                                                    description: (0, nls_1.localize)('walkthroughs.steps.media.image.path.hcLight.string', "Path to the image for hc light themes, relative to extension directory."),
                                                                    type: 'string',
                                                                }
                                                            }
                                                        }
                                                    ]
                                                },
                                                altText: {
                                                    type: 'string',
                                                    description: (0, nls_1.localize)('walkthroughs.steps.media.altText', "Alternate text to display when the image cannot be loaded or in screen readers.")
                                                }
                                            }
                                        },
                                        {
                                            required: ['svg', 'altText'],
                                            additionalProperties: false,
                                            properties: {
                                                svg: {
                                                    description: (0, nls_1.localize)('walkthroughs.steps.media.image.path.svg', "Path to an svg, color tokens are supported in variables to support theming to match the workbench."),
                                                    type: 'string',
                                                },
                                                altText: {
                                                    type: 'string',
                                                    description: (0, nls_1.localize)('walkthroughs.steps.media.altText', "Alternate text to display when the image cannot be loaded or in screen readers.")
                                                },
                                            }
                                        },
                                        {
                                            required: ['markdown'],
                                            additionalProperties: false,
                                            properties: {
                                                path: {
                                                    deprecationMessage: (0, nls_1.localize)('pathDeprecated', "Deprecated. Please use `image` or `markdown` instead")
                                                },
                                                markdown: {
                                                    description: (0, nls_1.localize)('walkthroughs.steps.media.markdown.path', "Path to the markdown document, relative to extension directory."),
                                                    type: 'string',
                                                }
                                            }
                                        }
                                    ]
                                },
                                completionEvents: {
                                    description: (0, nls_1.localize)('walkthroughs.steps.completionEvents', "Events that should trigger this step to become checked off. If empty or not defined, the step will check off when any of the step's buttons or links are clicked; if the step has no buttons or links it will check on when it is selected."),
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        defaultSnippets: [
                                            {
                                                label: 'onCommand',
                                                description: (0, nls_1.localize)('walkthroughs.steps.completionEvents.onCommand', 'Check off step when a given command is executed anywhere in VS Code.'),
                                                body: 'onCommand:${1:commandId}'
                                            },
                                            {
                                                label: 'onLink',
                                                description: (0, nls_1.localize)('walkthroughs.steps.completionEvents.onLink', 'Check off step when a given link is opened via a walkthrough step.'),
                                                body: 'onLink:${2:linkId}'
                                            },
                                            {
                                                label: 'onView',
                                                description: (0, nls_1.localize)('walkthroughs.steps.completionEvents.onView', 'Check off step when a given view is opened'),
                                                body: 'onView:${2:viewId}'
                                            },
                                            {
                                                label: 'onSettingChanged',
                                                description: (0, nls_1.localize)('walkthroughs.steps.completionEvents.onSettingChanged', 'Check off step when a given setting is changed'),
                                                body: 'onSettingChanged:${2:settingName}'
                                            },
                                            {
                                                label: 'onContext',
                                                description: (0, nls_1.localize)('walkthroughs.steps.completionEvents.onContext', 'Check off step when a context key expression is true.'),
                                                body: 'onContext:${2:key}'
                                            },
                                            {
                                                label: 'onExtensionInstalled',
                                                description: (0, nls_1.localize)('walkthroughs.steps.completionEvents.extensionInstalled', 'Check off step when an extension with the given id is installed. If the extension is already installed, the step will start off checked.'),
                                                body: 'onExtensionInstalled:${3:extensionId}'
                                            },
                                            {
                                                label: 'onStepSelected',
                                                description: (0, nls_1.localize)('walkthroughs.steps.completionEvents.stepSelected', 'Check off step as soon as it is selected.'),
                                                body: 'onStepSelected'
                                            },
                                        ]
                                    }
                                },
                                doneOn: {
                                    description: (0, nls_1.localize)('walkthroughs.steps.doneOn', "Signal to mark step as complete."),
                                    deprecationMessage: (0, nls_1.localize)('walkthroughs.steps.doneOn.deprecation', "doneOn is deprecated. By default steps will be checked off when their buttons are clicked, to configure further use completionEvents"),
                                    type: 'object',
                                    required: ['command'],
                                    defaultSnippets: [{ 'body': { command: '$1' } }],
                                    properties: {
                                        'command': {
                                            description: (0, nls_1.localize)('walkthroughs.steps.oneOn.command', "Mark step done when the specified command is executed."),
                                            type: 'string'
                                        }
                                    },
                                },
                                when: {
                                    type: 'string',
                                    description: (0, nls_1.localize)('walkthroughs.steps.when', "Context key expression to control the visibility of this step.")
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGluZ1N0YXJ0ZWRFeHRlbnNpb25Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlbGNvbWVHZXR0aW5nU3RhcnRlZC9icm93c2VyL2dldHRpbmdTdGFydGVkRXh0ZW5zaW9uUG9pbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQU0sZUFBZSxHQUFHLElBQUEsY0FBUSxFQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUV0QyxRQUFBLDBCQUEwQixHQUFHLHVDQUFrQixDQUFDLHNCQUFzQixDQUFpQjtRQUNuRyxjQUFjLEVBQUUsY0FBYztRQUM5QixVQUFVLEVBQUU7WUFDWCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLDRFQUE0RSxDQUFDO1lBQ25ILElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQztnQkFDakQsZUFBZSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztnQkFDNUYsVUFBVSxFQUFFO29CQUNYLEVBQUUsRUFBRTt3QkFDSCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUseUNBQXlDLENBQUM7cUJBQ25GO29CQUNELEtBQUssRUFBRTt3QkFDTixJQUFJLEVBQUUsUUFBUTt3QkFDZCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsdUJBQXVCLENBQUM7cUJBQ3BF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