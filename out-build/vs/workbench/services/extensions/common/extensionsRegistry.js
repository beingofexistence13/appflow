/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/extensions/common/extensionsRegistry", "vs/base/common/errors", "vs/base/common/severity", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsApiProposals", "vs/platform/product/common/productService", "vs/platform/extensionManagement/common/implicitActivationEvents"], function (require, exports, nls, errors_1, severity_1, extensionManagement_1, jsonContributionRegistry_1, platform_1, extensions_1, extensionsApiProposals_1, productService_1, implicitActivationEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2F = exports.$1F = exports.$ZF = exports.$YF = exports.$XF = exports.$WF = void 0;
    const schemaRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
    class $WF {
        constructor(messageHandler, extension, extensionPointId) {
            this.a = messageHandler;
            this.b = extension;
            this.c = extensionPointId;
        }
        d(type, message) {
            this.a({
                type: type,
                message: message,
                extensionId: this.b.identifier,
                extensionPointId: this.c
            });
        }
        error(message) {
            this.d(severity_1.default.Error, message);
        }
        warn(message) {
            this.d(severity_1.default.Warning, message);
        }
        info(message) {
            this.d(severity_1.default.Info, message);
        }
    }
    exports.$WF = $WF;
    class $XF {
        static a(arr) {
            const result = new extensions_1.$Wl();
            for (let i = 0, len = arr.length; i < len; i++) {
                result.add(arr[i].description.identifier);
            }
            return result;
        }
        static compute(previous, current) {
            if (!previous || !previous.length) {
                return new $XF(current, []);
            }
            if (!current || !current.length) {
                return new $XF([], previous);
            }
            const previousSet = this.a(previous);
            const currentSet = this.a(current);
            const added = current.filter(user => !previousSet.has(user.description.identifier));
            const removed = previous.filter(user => !currentSet.has(user.description.identifier));
            return new $XF(added, removed);
        }
        constructor(added, removed) {
            this.added = added;
            this.removed = removed;
        }
    }
    exports.$XF = $XF;
    class $YF {
        constructor(name, defaultExtensionKind) {
            this.name = name;
            this.defaultExtensionKind = defaultExtensionKind;
            this.a = null;
            this.b = null;
            this.c = null;
        }
        setHandler(handler) {
            if (this.a !== null) {
                throw new Error('Handler already set!');
            }
            this.a = handler;
            this.d();
        }
        acceptUsers(users) {
            this.c = $XF.compute(this.b, users);
            this.b = users;
            this.d();
        }
        d() {
            if (this.a === null || this.b === null || this.c === null) {
                return;
            }
            try {
                this.a(this.b, this.c);
            }
            catch (err) {
                (0, errors_1.$Y)(err);
            }
        }
    }
    exports.$YF = $YF;
    const extensionKindSchema = {
        type: 'string',
        enum: [
            'ui',
            'workspace'
        ],
        enumDescriptions: [
            nls.localize(0, null),
            nls.localize(1, null),
        ],
    };
    const schemaId = 'vscode://schemas/vscode-extensions';
    exports.$ZF = {
        properties: {
            engines: {
                type: 'object',
                description: nls.localize(2, null),
                properties: {
                    'vscode': {
                        type: 'string',
                        description: nls.localize(3, null),
                        default: '^1.22.0',
                    }
                }
            },
            publisher: {
                description: nls.localize(4, null),
                type: 'string'
            },
            displayName: {
                description: nls.localize(5, null),
                type: 'string'
            },
            categories: {
                description: nls.localize(6, null),
                type: 'array',
                uniqueItems: true,
                items: {
                    oneOf: [{
                            type: 'string',
                            enum: extensions_1.$Ul,
                        },
                        {
                            type: 'string',
                            const: 'Languages',
                            deprecationMessage: nls.localize(7, null),
                        }]
                }
            },
            galleryBanner: {
                type: 'object',
                description: nls.localize(8, null),
                properties: {
                    color: {
                        description: nls.localize(9, null),
                        type: 'string'
                    },
                    theme: {
                        description: nls.localize(10, null),
                        type: 'string',
                        enum: ['dark', 'light']
                    }
                }
            },
            contributes: {
                description: nls.localize(11, null),
                type: 'object',
                properties: {
                // extensions will fill in
                },
                default: {}
            },
            preview: {
                type: 'boolean',
                description: nls.localize(12, null),
            },
            enableProposedApi: {
                type: 'boolean',
                deprecationMessage: nls.localize(13, null),
            },
            enabledApiProposals: {
                markdownDescription: nls.localize(14, null),
                type: 'array',
                uniqueItems: true,
                items: {
                    type: 'string',
                    enum: Object.keys(extensionsApiProposals_1.allApiProposals),
                    markdownEnumDescriptions: Object.values(extensionsApiProposals_1.allApiProposals)
                }
            },
            api: {
                markdownDescription: nls.localize(15, null),
                type: 'string',
                enum: ['none'],
                enumDescriptions: [
                    nls.localize(16, null)
                ]
            },
            activationEvents: {
                description: nls.localize(17, null),
                type: 'array',
                items: {
                    type: 'string',
                    defaultSnippets: [
                        {
                            label: 'onWebviewPanel',
                            description: nls.localize(18, null),
                            body: 'onWebviewPanel:viewType'
                        },
                        {
                            label: 'onLanguage',
                            description: nls.localize(19, null),
                            body: 'onLanguage:${1:languageId}'
                        },
                        {
                            label: 'onCommand',
                            description: nls.localize(20, null),
                            body: 'onCommand:${2:commandId}'
                        },
                        {
                            label: 'onDebug',
                            description: nls.localize(21, null),
                            body: 'onDebug'
                        },
                        {
                            label: 'onDebugInitialConfigurations',
                            description: nls.localize(22, null),
                            body: 'onDebugInitialConfigurations'
                        },
                        {
                            label: 'onDebugDynamicConfigurations',
                            description: nls.localize(23, null),
                            body: 'onDebugDynamicConfigurations'
                        },
                        {
                            label: 'onDebugResolve',
                            description: nls.localize(24, null),
                            body: 'onDebugResolve:${6:type}'
                        },
                        {
                            label: 'onDebugAdapterProtocolTracker',
                            description: nls.localize(25, null),
                            body: 'onDebugAdapterProtocolTracker:${6:type}'
                        },
                        {
                            label: 'workspaceContains',
                            description: nls.localize(26, null),
                            body: 'workspaceContains:${4:filePattern}'
                        },
                        {
                            label: 'onStartupFinished',
                            description: nls.localize(27, null),
                            body: 'onStartupFinished'
                        },
                        {
                            label: 'onTaskType',
                            description: nls.localize(28, null),
                            body: 'onTaskType:${1:taskType}'
                        },
                        {
                            label: 'onFileSystem',
                            description: nls.localize(29, null),
                            body: 'onFileSystem:${1:scheme}'
                        },
                        {
                            label: 'onEditSession',
                            description: nls.localize(30, null),
                            body: 'onEditSession:${1:scheme}'
                        },
                        {
                            label: 'onSearch',
                            description: nls.localize(31, null),
                            body: 'onSearch:${7:scheme}'
                        },
                        {
                            label: 'onView',
                            body: 'onView:${5:viewId}',
                            description: nls.localize(32, null),
                        },
                        {
                            label: 'onUri',
                            body: 'onUri',
                            description: nls.localize(33, null),
                        },
                        {
                            label: 'onOpenExternalUri',
                            body: 'onOpenExternalUri',
                            description: nls.localize(34, null),
                        },
                        {
                            label: 'onCustomEditor',
                            body: 'onCustomEditor:${9:viewType}',
                            description: nls.localize(35, null),
                        },
                        {
                            label: 'onNotebook',
                            body: 'onNotebook:${1:type}',
                            description: nls.localize(36, null),
                        },
                        {
                            label: 'onAuthenticationRequest',
                            body: 'onAuthenticationRequest:${11:authenticationProviderId}',
                            description: nls.localize(37, null)
                        },
                        {
                            label: 'onRenderer',
                            description: nls.localize(38, null),
                            body: 'onRenderer:${11:rendererId}'
                        },
                        {
                            label: 'onTerminalProfile',
                            body: 'onTerminalProfile:${1:terminalId}',
                            description: nls.localize(39, null),
                        },
                        {
                            label: 'onTerminalQuickFixRequest',
                            body: 'onTerminalQuickFixRequest:${1:quickFixId}',
                            description: nls.localize(40, null),
                        },
                        {
                            label: 'onWalkthrough',
                            body: 'onWalkthrough:${1:walkthroughID}',
                            description: nls.localize(41, null),
                        },
                        {
                            label: '*',
                            description: nls.localize(42, null),
                            body: '*'
                        }
                    ],
                }
            },
            badges: {
                type: 'array',
                description: nls.localize(43, null),
                items: {
                    type: 'object',
                    required: ['url', 'href', 'description'],
                    properties: {
                        url: {
                            type: 'string',
                            description: nls.localize(44, null)
                        },
                        href: {
                            type: 'string',
                            description: nls.localize(45, null)
                        },
                        description: {
                            type: 'string',
                            description: nls.localize(46, null)
                        }
                    }
                }
            },
            markdown: {
                type: 'string',
                description: nls.localize(47, null),
                enum: ['github', 'standard'],
                default: 'github'
            },
            qna: {
                default: 'marketplace',
                description: nls.localize(48, null),
                anyOf: [
                    {
                        type: ['string', 'boolean'],
                        enum: ['marketplace', false]
                    },
                    {
                        type: 'string'
                    }
                ]
            },
            extensionDependencies: {
                description: nls.localize(49, null),
                type: 'array',
                uniqueItems: true,
                items: {
                    type: 'string',
                    pattern: extensionManagement_1.$Mn
                }
            },
            extensionPack: {
                description: nls.localize(50, null),
                type: 'array',
                uniqueItems: true,
                items: {
                    type: 'string',
                    pattern: extensionManagement_1.$Mn
                }
            },
            extensionKind: {
                description: nls.localize(51, null),
                type: 'array',
                items: extensionKindSchema,
                default: ['workspace'],
                defaultSnippets: [
                    {
                        body: ['ui'],
                        description: nls.localize(52, null)
                    },
                    {
                        body: ['workspace'],
                        description: nls.localize(53, null)
                    },
                    {
                        body: ['ui', 'workspace'],
                        description: nls.localize(54, null)
                    },
                    {
                        body: ['workspace', 'ui'],
                        description: nls.localize(55, null)
                    },
                    {
                        body: [],
                        description: nls.localize(56, null)
                    }
                ]
            },
            capabilities: {
                description: nls.localize(57, null),
                type: 'object',
                properties: {
                    virtualWorkspaces: {
                        description: nls.localize(58, null),
                        type: ['boolean', 'object'],
                        defaultSnippets: [
                            { label: 'limited', body: { supported: '${1:limited}', description: '${2}' } },
                            { label: 'false', body: { supported: false, description: '${2}' } },
                        ],
                        default: true.valueOf,
                        properties: {
                            supported: {
                                markdownDescription: nls.localize(59, null),
                                type: ['string', 'boolean'],
                                enum: ['limited', true, false],
                                enumDescriptions: [
                                    nls.localize(60, null),
                                    nls.localize(61, null),
                                    nls.localize(62, null),
                                ]
                            },
                            description: {
                                type: 'string',
                                markdownDescription: nls.localize(63, null),
                            }
                        }
                    },
                    untrustedWorkspaces: {
                        description: nls.localize(64, null),
                        type: 'object',
                        required: ['supported'],
                        defaultSnippets: [
                            { body: { supported: '${1:limited}', description: '${2}' } },
                        ],
                        properties: {
                            supported: {
                                markdownDescription: nls.localize(65, null),
                                type: ['string', 'boolean'],
                                enum: ['limited', true, false],
                                enumDescriptions: [
                                    nls.localize(66, null),
                                    nls.localize(67, null),
                                    nls.localize(68, null),
                                ]
                            },
                            restrictedConfigurations: {
                                description: nls.localize(69, null),
                                type: 'array',
                                items: {
                                    type: 'string'
                                }
                            },
                            description: {
                                type: 'string',
                                markdownDescription: nls.localize(70, null),
                            }
                        }
                    }
                }
            },
            sponsor: {
                description: nls.localize(71, null),
                type: 'object',
                defaultSnippets: [
                    { body: { url: '${1:https:}' } },
                ],
                properties: {
                    'url': {
                        description: nls.localize(72, null),
                        type: 'string',
                    }
                }
            },
            scripts: {
                type: 'object',
                properties: {
                    'vscode:prepublish': {
                        description: nls.localize(73, null),
                        type: 'string'
                    },
                    'vscode:uninstall': {
                        description: nls.localize(74, null),
                        type: 'string'
                    }
                }
            },
            icon: {
                type: 'string',
                description: nls.localize(75, null)
            },
            l10n: {
                type: 'string',
                description: nls.localize(76, null)






            },
            pricing: {
                type: 'string',
                markdownDescription: nls.localize(77, null),
                enum: ['Free', 'Trial'],
                default: 'Free'
            }
        }
    };
    class $1F {
        constructor() {
            this.a = new Map();
        }
        registerExtensionPoint(desc) {
            if (this.a.has(desc.extensionPoint)) {
                throw new Error('Duplicate extension point: ' + desc.extensionPoint);
            }
            const result = new $YF(desc.extensionPoint, desc.defaultExtensionKind);
            this.a.set(desc.extensionPoint, result);
            if (desc.activationEventsGenerator) {
                implicitActivationEvents_1.$BF.register(desc.extensionPoint, desc.activationEventsGenerator);
            }
            exports.$ZF.properties['contributes'].properties[desc.extensionPoint] = desc.jsonSchema;
            schemaRegistry.registerSchema(schemaId, exports.$ZF);
            return result;
        }
        getExtensionPoints() {
            return Array.from(this.a.values());
        }
    }
    exports.$1F = $1F;
    const PRExtensions = {
        ExtensionsRegistry: 'ExtensionsRegistry'
    };
    platform_1.$8m.add(PRExtensions.ExtensionsRegistry, new $1F());
    exports.$2F = platform_1.$8m.as(PRExtensions.ExtensionsRegistry);
    schemaRegistry.registerSchema(schemaId, exports.$ZF);
    schemaRegistry.registerSchema(productService_1.$lj, {
        properties: {
            extensionEnabledApiProposals: {
                description: nls.localize(78, null),
                type: 'object',
                properties: {},
                additionalProperties: {
                    anyOf: [{
                            type: 'array',
                            uniqueItems: true,
                            items: {
                                type: 'string',
                                enum: Object.keys(extensionsApiProposals_1.allApiProposals),
                                markdownEnumDescriptions: Object.values(extensionsApiProposals_1.allApiProposals)
                            }
                        }]
                }
            }
        }
    });
});
//# sourceMappingURL=extensionsRegistry.js.map