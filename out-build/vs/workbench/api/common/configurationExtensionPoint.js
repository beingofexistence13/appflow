/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/api/common/configurationExtensionPoint", "vs/base/common/objects", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/services/configuration/common/configuration", "vs/base/common/types", "vs/platform/extensions/common/extensions"], function (require, exports, nls, objects, platform_1, extensionsRegistry_1, configurationRegistry_1, jsonContributionRegistry_1, configuration_1, types_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const jsonRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    const configurationEntrySchema = {
        type: 'object',
        defaultSnippets: [{ body: { title: '', properties: {} } }],
        properties: {
            title: {
                description: nls.localize(0, null),
                type: 'string'
            },
            order: {
                description: nls.localize(1, null),
                type: 'integer'
            },
            properties: {
                description: nls.localize(2, null),
                type: 'object',
                propertyNames: {
                    pattern: '\\S+',
                    patternErrorMessage: nls.localize(3, null),
                },
                additionalProperties: {
                    anyOf: [
                        {
                            title: nls.localize(4, null),
                            $ref: 'http://json-schema.org/draft-07/schema#'
                        },
                        {
                            type: 'object',
                            properties: {
                                scope: {
                                    type: 'string',
                                    enum: ['application', 'machine', 'window', 'resource', 'language-overridable', 'machine-overridable'],
                                    default: 'window',
                                    enumDescriptions: [
                                        nls.localize(5, null),
                                        nls.localize(6, null),
                                        nls.localize(7, null),
                                        nls.localize(8, null),
                                        nls.localize(9, null),
                                        nls.localize(10, null)
                                    ],
                                    markdownDescription: nls.localize(11, null)
                                },
                                enumDescriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: nls.localize(12, null)
                                },
                                markdownEnumDescriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: nls.localize(13, null)
                                },
                                enumItemLabels: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    markdownDescription: nls.localize(14, null, '`enum`')
                                },
                                markdownDescription: {
                                    type: 'string',
                                    description: nls.localize(15, null)
                                },
                                deprecationMessage: {
                                    type: 'string',
                                    description: nls.localize(16, null)
                                },
                                markdownDeprecationMessage: {
                                    type: 'string',
                                    description: nls.localize(17, null)
                                },
                                editPresentation: {
                                    type: 'string',
                                    enum: ['singlelineText', 'multilineText'],
                                    enumDescriptions: [
                                        nls.localize(18, null),
                                        nls.localize(19, null)
                                    ],
                                    default: 'singlelineText',
                                    description: nls.localize(20, null)
                                },
                                order: {
                                    type: 'integer',
                                    description: nls.localize(21, null)
                                },
                                ignoreSync: {
                                    type: 'boolean',
                                    description: nls.localize(22, null)
                                },
                            }
                        }
                    ]
                }
            }
        }
    };
    // build up a delta across two ext points and only apply it once
    let _configDelta;
    // BEGIN VSCode extension point `configurationDefaults`
    const defaultConfigurationExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'configurationDefaults',
        jsonSchema: {
            $ref: configurationRegistry_1.$in,
        }
    });
    defaultConfigurationExtPoint.setHandler((extensions, { added, removed }) => {
        if (_configDelta) {
            // HIGHLY unlikely, but just in case
            configurationRegistry.deltaConfiguration(_configDelta);
        }
        const configNow = _configDelta = {};
        // schedule a HIGHLY unlikely task in case only the default configurations EXT point changes
        queueMicrotask(() => {
            if (_configDelta === configNow) {
                configurationRegistry.deltaConfiguration(_configDelta);
                _configDelta = undefined;
            }
        });
        if (removed.length) {
            const removedDefaultConfigurations = removed.map(extension => ({ overrides: objects.$Vm(extension.value), source: { id: extension.description.identifier.value, displayName: extension.description.displayName } }));
            _configDelta.removedDefaults = removedDefaultConfigurations;
        }
        if (added.length) {
            const registeredProperties = configurationRegistry.getConfigurationProperties();
            const allowedScopes = [6 /* ConfigurationScope.MACHINE_OVERRIDABLE */, 3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */];
            const addedDefaultConfigurations = added.map(extension => {
                const overrides = objects.$Vm(extension.value);
                for (const key of Object.keys(overrides)) {
                    if (!configurationRegistry_1.$kn.test(key)) {
                        const registeredPropertyScheme = registeredProperties[key];
                        if (registeredPropertyScheme?.scope && !allowedScopes.includes(registeredPropertyScheme.scope)) {
                            extension.collector.warn(nls.localize(23, null, key));
                            delete overrides[key];
                        }
                    }
                }
                return { overrides, source: { id: extension.description.identifier.value, displayName: extension.description.displayName } };
            });
            _configDelta.addedDefaults = addedDefaultConfigurations;
        }
    });
    // END VSCode extension point `configurationDefaults`
    // BEGIN VSCode extension point `configuration`
    const configurationExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'configuration',
        deps: [defaultConfigurationExtPoint],
        jsonSchema: {
            description: nls.localize(24, null),
            oneOf: [
                configurationEntrySchema,
                {
                    type: 'array',
                    items: configurationEntrySchema
                }
            ]
        }
    });
    const extensionConfigurations = new extensions_1.$Xl();
    configurationExtPoint.setHandler((extensions, { added, removed }) => {
        // HIGHLY unlikely (only configuration but not defaultConfiguration EXT point changes)
        _configDelta ??= {};
        if (removed.length) {
            const removedConfigurations = [];
            for (const extension of removed) {
                removedConfigurations.push(...(extensionConfigurations.get(extension.description.identifier) || []));
                extensionConfigurations.delete(extension.description.identifier);
            }
            _configDelta.removedConfigurations = removedConfigurations;
        }
        const seenProperties = new Set();
        function handleConfiguration(node, extension) {
            const configurations = [];
            const configuration = objects.$Vm(node);
            if (configuration.title && (typeof configuration.title !== 'string')) {
                extension.collector.error(nls.localize(25, null));
            }
            validateProperties(configuration, extension);
            configuration.id = node.id || extension.description.identifier.value;
            configuration.extensionInfo = { id: extension.description.identifier.value, displayName: extension.description.displayName };
            configuration.restrictedProperties = extension.description.capabilities?.untrustedWorkspaces?.supported === 'limited' ? extension.description.capabilities?.untrustedWorkspaces.restrictedConfigurations : undefined;
            configuration.title = configuration.title || extension.description.displayName || extension.description.identifier.value;
            configurations.push(configuration);
            return configurations;
        }
        function validateProperties(configuration, extension) {
            const properties = configuration.properties;
            if (properties) {
                if (typeof properties !== 'object') {
                    extension.collector.error(nls.localize(26, null));
                    configuration.properties = {};
                }
                for (const key in properties) {
                    const propertyConfiguration = properties[key];
                    const message = (0, configurationRegistry_1.$on)(key, propertyConfiguration);
                    if (message) {
                        delete properties[key];
                        extension.collector.warn(message);
                        continue;
                    }
                    if (seenProperties.has(key)) {
                        delete properties[key];
                        extension.collector.warn(nls.localize(27, null, key));
                        continue;
                    }
                    if (!(0, types_1.$lf)(propertyConfiguration)) {
                        delete properties[key];
                        extension.collector.error(nls.localize(28, null, key));
                        continue;
                    }
                    seenProperties.add(key);
                    if (propertyConfiguration.scope) {
                        if (propertyConfiguration.scope.toString() === 'application') {
                            propertyConfiguration.scope = 1 /* ConfigurationScope.APPLICATION */;
                        }
                        else if (propertyConfiguration.scope.toString() === 'machine') {
                            propertyConfiguration.scope = 2 /* ConfigurationScope.MACHINE */;
                        }
                        else if (propertyConfiguration.scope.toString() === 'resource') {
                            propertyConfiguration.scope = 4 /* ConfigurationScope.RESOURCE */;
                        }
                        else if (propertyConfiguration.scope.toString() === 'machine-overridable') {
                            propertyConfiguration.scope = 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */;
                        }
                        else if (propertyConfiguration.scope.toString() === 'language-overridable') {
                            propertyConfiguration.scope = 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */;
                        }
                        else {
                            propertyConfiguration.scope = 3 /* ConfigurationScope.WINDOW */;
                        }
                    }
                    else {
                        propertyConfiguration.scope = 3 /* ConfigurationScope.WINDOW */;
                    }
                }
            }
            const subNodes = configuration.allOf;
            if (subNodes) {
                extension.collector.error(nls.localize(29, null));
                for (const node of subNodes) {
                    validateProperties(node, extension);
                }
            }
        }
        if (added.length) {
            const addedConfigurations = [];
            for (const extension of added) {
                const configurations = [];
                const value = extension.value;
                if (Array.isArray(value)) {
                    value.forEach(v => configurations.push(...handleConfiguration(v, extension)));
                }
                else {
                    configurations.push(...handleConfiguration(value, extension));
                }
                extensionConfigurations.set(extension.description.identifier, configurations);
                addedConfigurations.push(...configurations);
            }
            _configDelta.addedConfigurations = addedConfigurations;
        }
        configurationRegistry.deltaConfiguration(_configDelta);
        _configDelta = undefined;
    });
    // END VSCode extension point `configuration`
    jsonRegistry.registerSchema('vscode://schemas/workspaceConfig', {
        allowComments: true,
        allowTrailingCommas: true,
        default: {
            folders: [
                {
                    path: ''
                }
            ],
            settings: {}
        },
        required: ['folders'],
        properties: {
            'folders': {
                minItems: 0,
                uniqueItems: true,
                description: nls.localize(30, null),
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { path: '$1' } }],
                    oneOf: [{
                            properties: {
                                path: {
                                    type: 'string',
                                    description: nls.localize(31, null)
                                },
                                name: {
                                    type: 'string',
                                    description: nls.localize(32, null)
                                }
                            },
                            required: ['path']
                        }, {
                            properties: {
                                uri: {
                                    type: 'string',
                                    description: nls.localize(33, null)
                                },
                                name: {
                                    type: 'string',
                                    description: nls.localize(34, null)
                                }
                            },
                            required: ['uri']
                        }]
                }
            },
            'settings': {
                type: 'object',
                default: {},
                description: nls.localize(35, null),
                $ref: configuration_1.$0D
            },
            'launch': {
                type: 'object',
                default: { configurations: [], compounds: [] },
                description: nls.localize(36, null),
                $ref: configuration_1.$_D
            },
            'tasks': {
                type: 'object',
                default: { version: '2.0.0', tasks: [] },
                description: nls.localize(37, null),
                $ref: configuration_1.$aE
            },
            'extensions': {
                type: 'object',
                default: {},
                description: nls.localize(38, null),
                $ref: 'vscode://schemas/extensions'
            },
            'remoteAuthority': {
                type: 'string',
                doNotSuggest: true,
                description: nls.localize(39, null),
            },
            'transient': {
                type: 'boolean',
                doNotSuggest: true,
                description: nls.localize(40, null),
            }
        },
        errorMessage: nls.localize(41, null)
    });
});
//# sourceMappingURL=configurationExtensionPoint.js.map