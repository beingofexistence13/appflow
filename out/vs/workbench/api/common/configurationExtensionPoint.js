/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/services/configuration/common/configuration", "vs/base/common/types", "vs/platform/extensions/common/extensions"], function (require, exports, nls, objects, platform_1, extensionsRegistry_1, configurationRegistry_1, jsonContributionRegistry_1, configuration_1, types_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const configurationEntrySchema = {
        type: 'object',
        defaultSnippets: [{ body: { title: '', properties: {} } }],
        properties: {
            title: {
                description: nls.localize('vscode.extension.contributes.configuration.title', 'A title for the current category of settings. This label will be rendered in the Settings editor as a subheading. If the title is the same as the extension display name, then the category will be grouped under the main extension heading.'),
                type: 'string'
            },
            order: {
                description: nls.localize('vscode.extension.contributes.configuration.order', 'When specified, gives the order of this category of settings relative to other categories.'),
                type: 'integer'
            },
            properties: {
                description: nls.localize('vscode.extension.contributes.configuration.properties', 'Description of the configuration properties.'),
                type: 'object',
                propertyNames: {
                    pattern: '\\S+',
                    patternErrorMessage: nls.localize('vscode.extension.contributes.configuration.property.empty', 'Property should not be empty.'),
                },
                additionalProperties: {
                    anyOf: [
                        {
                            title: nls.localize('vscode.extension.contributes.configuration.properties.schema', 'Schema of the configuration property.'),
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
                                        nls.localize('scope.application.description', "Configuration that can be configured only in the user settings."),
                                        nls.localize('scope.machine.description', "Configuration that can be configured only in the user settings or only in the remote settings."),
                                        nls.localize('scope.window.description', "Configuration that can be configured in the user, remote or workspace settings."),
                                        nls.localize('scope.resource.description', "Configuration that can be configured in the user, remote, workspace or folder settings."),
                                        nls.localize('scope.language-overridable.description', "Resource configuration that can be configured in language specific settings."),
                                        nls.localize('scope.machine-overridable.description', "Machine configuration that can be configured also in workspace or folder settings.")
                                    ],
                                    markdownDescription: nls.localize('scope.description', "Scope in which the configuration is applicable. Available scopes are `application`, `machine`, `window`, `resource`, and `machine-overridable`.")
                                },
                                enumDescriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: nls.localize('scope.enumDescriptions', 'Descriptions for enum values')
                                },
                                markdownEnumDescriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: nls.localize('scope.markdownEnumDescriptions', 'Descriptions for enum values in the markdown format.')
                                },
                                enumItemLabels: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    markdownDescription: nls.localize('scope.enumItemLabels', 'Labels for enum values to be displayed in the Settings editor. When specified, the {0} values still show after the labels, but less prominently.', '`enum`')
                                },
                                markdownDescription: {
                                    type: 'string',
                                    description: nls.localize('scope.markdownDescription', 'The description in the markdown format.')
                                },
                                deprecationMessage: {
                                    type: 'string',
                                    description: nls.localize('scope.deprecationMessage', 'If set, the property is marked as deprecated and the given message is shown as an explanation.')
                                },
                                markdownDeprecationMessage: {
                                    type: 'string',
                                    description: nls.localize('scope.markdownDeprecationMessage', 'If set, the property is marked as deprecated and the given message is shown as an explanation in the markdown format.')
                                },
                                editPresentation: {
                                    type: 'string',
                                    enum: ['singlelineText', 'multilineText'],
                                    enumDescriptions: [
                                        nls.localize('scope.singlelineText.description', 'The value will be shown in an inputbox.'),
                                        nls.localize('scope.multilineText.description', 'The value will be shown in a textarea.')
                                    ],
                                    default: 'singlelineText',
                                    description: nls.localize('scope.editPresentation', 'When specified, controls the presentation format of the string setting.')
                                },
                                order: {
                                    type: 'integer',
                                    description: nls.localize('scope.order', 'When specified, gives the order of this setting relative to other settings within the same category. Settings with an order property will be placed before settings without this property set.')
                                },
                                ignoreSync: {
                                    type: 'boolean',
                                    description: nls.localize('scope.ignoreSync', 'When enabled, Settings Sync will not sync the user value of this configuration by default.')
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
    const defaultConfigurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'configurationDefaults',
        jsonSchema: {
            $ref: configurationRegistry_1.configurationDefaultsSchemaId,
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
            const removedDefaultConfigurations = removed.map(extension => ({ overrides: objects.deepClone(extension.value), source: { id: extension.description.identifier.value, displayName: extension.description.displayName } }));
            _configDelta.removedDefaults = removedDefaultConfigurations;
        }
        if (added.length) {
            const registeredProperties = configurationRegistry.getConfigurationProperties();
            const allowedScopes = [6 /* ConfigurationScope.MACHINE_OVERRIDABLE */, 3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */];
            const addedDefaultConfigurations = added.map(extension => {
                const overrides = objects.deepClone(extension.value);
                for (const key of Object.keys(overrides)) {
                    if (!configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key)) {
                        const registeredPropertyScheme = registeredProperties[key];
                        if (registeredPropertyScheme?.scope && !allowedScopes.includes(registeredPropertyScheme.scope)) {
                            extension.collector.warn(nls.localize('config.property.defaultConfiguration.warning', "Cannot register configuration defaults for '{0}'. Only defaults for machine-overridable, window, resource and language overridable scoped settings are supported.", key));
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
    const configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'configuration',
        deps: [defaultConfigurationExtPoint],
        jsonSchema: {
            description: nls.localize('vscode.extension.contributes.configuration', 'Contributes configuration settings.'),
            oneOf: [
                configurationEntrySchema,
                {
                    type: 'array',
                    items: configurationEntrySchema
                }
            ]
        }
    });
    const extensionConfigurations = new extensions_1.ExtensionIdentifierMap();
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
            const configuration = objects.deepClone(node);
            if (configuration.title && (typeof configuration.title !== 'string')) {
                extension.collector.error(nls.localize('invalid.title', "'configuration.title' must be a string"));
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
                    extension.collector.error(nls.localize('invalid.properties', "'configuration.properties' must be an object"));
                    configuration.properties = {};
                }
                for (const key in properties) {
                    const propertyConfiguration = properties[key];
                    const message = (0, configurationRegistry_1.validateProperty)(key, propertyConfiguration);
                    if (message) {
                        delete properties[key];
                        extension.collector.warn(message);
                        continue;
                    }
                    if (seenProperties.has(key)) {
                        delete properties[key];
                        extension.collector.warn(nls.localize('config.property.duplicate', "Cannot register '{0}'. This property is already registered.", key));
                        continue;
                    }
                    if (!(0, types_1.isObject)(propertyConfiguration)) {
                        delete properties[key];
                        extension.collector.error(nls.localize('invalid.property', "configuration.properties property '{0}' must be an object", key));
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
                extension.collector.error(nls.localize('invalid.allOf', "'configuration.allOf' is deprecated and should no longer be used. Instead, pass multiple configuration sections as an array to the 'configuration' contribution point."));
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
                description: nls.localize('workspaceConfig.folders.description', "List of folders to be loaded in the workspace."),
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { path: '$1' } }],
                    oneOf: [{
                            properties: {
                                path: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.path.description', "A file path. e.g. `/root/folderA` or `./folderA` for a relative path that will be resolved against the location of the workspace file.")
                                },
                                name: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.name.description', "An optional name for the folder. ")
                                }
                            },
                            required: ['path']
                        }, {
                            properties: {
                                uri: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.uri.description', "URI of the folder")
                                },
                                name: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.name.description', "An optional name for the folder. ")
                                }
                            },
                            required: ['uri']
                        }]
                }
            },
            'settings': {
                type: 'object',
                default: {},
                description: nls.localize('workspaceConfig.settings.description', "Workspace settings"),
                $ref: configuration_1.workspaceSettingsSchemaId
            },
            'launch': {
                type: 'object',
                default: { configurations: [], compounds: [] },
                description: nls.localize('workspaceConfig.launch.description', "Workspace launch configurations"),
                $ref: configuration_1.launchSchemaId
            },
            'tasks': {
                type: 'object',
                default: { version: '2.0.0', tasks: [] },
                description: nls.localize('workspaceConfig.tasks.description', "Workspace task configurations"),
                $ref: configuration_1.tasksSchemaId
            },
            'extensions': {
                type: 'object',
                default: {},
                description: nls.localize('workspaceConfig.extensions.description', "Workspace extensions"),
                $ref: 'vscode://schemas/extensions'
            },
            'remoteAuthority': {
                type: 'string',
                doNotSuggest: true,
                description: nls.localize('workspaceConfig.remoteAuthority', "The remote server where the workspace is located."),
            },
            'transient': {
                type: 'boolean',
                doNotSuggest: true,
                description: nls.localize('workspaceConfig.transient', "A transient workspace will disappear when restarting or reloading."),
            }
        },
        errorMessage: nls.localize('unknownWorkspaceProperty', "Unknown workspace configuration property")
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbkV4dGVuc2lvblBvaW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vY29uZmlndXJhdGlvbkV4dGVuc2lvblBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBY2hHLE1BQU0sWUFBWSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUE0QixxQ0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDN0YsTUFBTSxxQkFBcUIsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUU1RixNQUFNLHdCQUF3QixHQUFnQjtRQUM3QyxJQUFJLEVBQUUsUUFBUTtRQUNkLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUMxRCxVQUFVLEVBQUU7WUFDWCxLQUFLLEVBQUU7Z0JBQ04sV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0RBQWtELEVBQUUsK09BQStPLENBQUM7Z0JBQzlULElBQUksRUFBRSxRQUFRO2FBQ2Q7WUFDRCxLQUFLLEVBQUU7Z0JBQ04sV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0RBQWtELEVBQUUsNEZBQTRGLENBQUM7Z0JBQzNLLElBQUksRUFBRSxTQUFTO2FBQ2Y7WUFDRCxVQUFVLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsdURBQXVELEVBQUUsOENBQThDLENBQUM7Z0JBQ2xJLElBQUksRUFBRSxRQUFRO2dCQUNkLGFBQWEsRUFBRTtvQkFDZCxPQUFPLEVBQUUsTUFBTTtvQkFDZixtQkFBbUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDJEQUEyRCxFQUFFLCtCQUErQixDQUFD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