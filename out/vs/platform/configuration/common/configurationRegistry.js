/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/types", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform"], function (require, exports, arrays_1, event_1, types, nls, configuration_1, jsonContributionRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getScopes = exports.validateProperty = exports.getDefaultValue = exports.keyFromOverrideIdentifiers = exports.overrideIdentifiersFromKey = exports.OVERRIDE_PROPERTY_REGEX = exports.OVERRIDE_PROPERTY_PATTERN = exports.configurationDefaultsSchemaId = exports.resourceLanguageSettingsSchemaId = exports.resourceSettings = exports.windowSettings = exports.machineOverridableSettings = exports.machineSettings = exports.applicationSettings = exports.allSettings = exports.ConfigurationScope = exports.Extensions = exports.EditPresentationTypes = void 0;
    var EditPresentationTypes;
    (function (EditPresentationTypes) {
        EditPresentationTypes["Multiline"] = "multilineText";
        EditPresentationTypes["Singleline"] = "singlelineText";
    })(EditPresentationTypes || (exports.EditPresentationTypes = EditPresentationTypes = {}));
    exports.Extensions = {
        Configuration: 'base.contributions.configuration'
    };
    var ConfigurationScope;
    (function (ConfigurationScope) {
        /**
         * Application specific configuration, which can be configured only in local user settings.
         */
        ConfigurationScope[ConfigurationScope["APPLICATION"] = 1] = "APPLICATION";
        /**
         * Machine specific configuration, which can be configured only in local and remote user settings.
         */
        ConfigurationScope[ConfigurationScope["MACHINE"] = 2] = "MACHINE";
        /**
         * Window specific configuration, which can be configured in the user or workspace settings.
         */
        ConfigurationScope[ConfigurationScope["WINDOW"] = 3] = "WINDOW";
        /**
         * Resource specific configuration, which can be configured in the user, workspace or folder settings.
         */
        ConfigurationScope[ConfigurationScope["RESOURCE"] = 4] = "RESOURCE";
        /**
         * Resource specific configuration that can be configured in language specific settings
         */
        ConfigurationScope[ConfigurationScope["LANGUAGE_OVERRIDABLE"] = 5] = "LANGUAGE_OVERRIDABLE";
        /**
         * Machine specific configuration that can also be configured in workspace or folder settings.
         */
        ConfigurationScope[ConfigurationScope["MACHINE_OVERRIDABLE"] = 6] = "MACHINE_OVERRIDABLE";
    })(ConfigurationScope || (exports.ConfigurationScope = ConfigurationScope = {}));
    exports.allSettings = { properties: {}, patternProperties: {} };
    exports.applicationSettings = { properties: {}, patternProperties: {} };
    exports.machineSettings = { properties: {}, patternProperties: {} };
    exports.machineOverridableSettings = { properties: {}, patternProperties: {} };
    exports.windowSettings = { properties: {}, patternProperties: {} };
    exports.resourceSettings = { properties: {}, patternProperties: {} };
    exports.resourceLanguageSettingsSchemaId = 'vscode://schemas/settings/resourceLanguage';
    exports.configurationDefaultsSchemaId = 'vscode://schemas/settings/configurationDefaults';
    const contributionRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    class ConfigurationRegistry {
        constructor() {
            this.overrideIdentifiers = new Set();
            this._onDidSchemaChange = new event_1.Emitter();
            this.onDidSchemaChange = this._onDidSchemaChange.event;
            this._onDidUpdateConfiguration = new event_1.Emitter();
            this.onDidUpdateConfiguration = this._onDidUpdateConfiguration.event;
            this.configurationDefaultsOverrides = new Map();
            this.defaultLanguageConfigurationOverridesNode = {
                id: 'defaultOverrides',
                title: nls.localize('defaultLanguageConfigurationOverrides.title', "Default Language Configuration Overrides"),
                properties: {}
            };
            this.configurationContributors = [this.defaultLanguageConfigurationOverridesNode];
            this.resourceLanguageSettingsSchema = {
                properties: {},
                patternProperties: {},
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            this.configurationProperties = {};
            this.policyConfigurations = new Map();
            this.excludedConfigurationProperties = {};
            contributionRegistry.registerSchema(exports.resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
            this.registerOverridePropertyPatternKey();
        }
        registerConfiguration(configuration, validate = true) {
            this.registerConfigurations([configuration], validate);
        }
        registerConfigurations(configurations, validate = true) {
            const properties = new Set();
            this.doRegisterConfigurations(configurations, validate, properties);
            contributionRegistry.registerSchema(exports.resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
            this._onDidSchemaChange.fire();
            this._onDidUpdateConfiguration.fire({ properties });
        }
        deregisterConfigurations(configurations) {
            const properties = new Set();
            this.doDeregisterConfigurations(configurations, properties);
            contributionRegistry.registerSchema(exports.resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
            this._onDidSchemaChange.fire();
            this._onDidUpdateConfiguration.fire({ properties });
        }
        updateConfigurations({ add, remove }) {
            const properties = new Set();
            this.doDeregisterConfigurations(remove, properties);
            this.doRegisterConfigurations(add, false, properties);
            contributionRegistry.registerSchema(exports.resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
            this._onDidSchemaChange.fire();
            this._onDidUpdateConfiguration.fire({ properties });
        }
        registerDefaultConfigurations(configurationDefaults) {
            const properties = new Set();
            this.doRegisterDefaultConfigurations(configurationDefaults, properties);
            this._onDidSchemaChange.fire();
            this._onDidUpdateConfiguration.fire({ properties, defaultsOverrides: true });
        }
        doRegisterDefaultConfigurations(configurationDefaults, bucket) {
            const overrideIdentifiers = [];
            for (const { overrides, source } of configurationDefaults) {
                for (const key in overrides) {
                    bucket.add(key);
                    if (exports.OVERRIDE_PROPERTY_REGEX.test(key)) {
                        const configurationDefaultOverride = this.configurationDefaultsOverrides.get(key);
                        const valuesSources = configurationDefaultOverride?.valuesSources ?? new Map();
                        if (source) {
                            for (const configuration of Object.keys(overrides[key])) {
                                valuesSources.set(configuration, source);
                            }
                        }
                        const defaultValue = { ...(configurationDefaultOverride?.value || {}), ...overrides[key] };
                        this.configurationDefaultsOverrides.set(key, { source, value: defaultValue, valuesSources });
                        const plainKey = (0, configuration_1.getLanguageTagSettingPlainKey)(key);
                        const property = {
                            type: 'object',
                            default: defaultValue,
                            description: nls.localize('defaultLanguageConfiguration.description', "Configure settings to be overridden for the {0} language.", plainKey),
                            $ref: exports.resourceLanguageSettingsSchemaId,
                            defaultDefaultValue: defaultValue,
                            source: types.isString(source) ? undefined : source,
                            defaultValueSource: source
                        };
                        overrideIdentifiers.push(...overrideIdentifiersFromKey(key));
                        this.configurationProperties[key] = property;
                        this.defaultLanguageConfigurationOverridesNode.properties[key] = property;
                    }
                    else {
                        this.configurationDefaultsOverrides.set(key, { value: overrides[key], source });
                        const property = this.configurationProperties[key];
                        if (property) {
                            this.updatePropertyDefaultValue(key, property);
                            this.updateSchema(key, property);
                        }
                    }
                }
            }
            this.doRegisterOverrideIdentifiers(overrideIdentifiers);
        }
        deregisterDefaultConfigurations(defaultConfigurations) {
            const properties = new Set();
            this.doDeregisterDefaultConfigurations(defaultConfigurations, properties);
            this._onDidSchemaChange.fire();
            this._onDidUpdateConfiguration.fire({ properties, defaultsOverrides: true });
        }
        doDeregisterDefaultConfigurations(defaultConfigurations, bucket) {
            for (const { overrides, source } of defaultConfigurations) {
                for (const key in overrides) {
                    const configurationDefaultsOverride = this.configurationDefaultsOverrides.get(key);
                    const id = types.isString(source) ? source : source?.id;
                    const configurationDefaultsOverrideSourceId = types.isString(configurationDefaultsOverride?.source) ? configurationDefaultsOverride?.source : configurationDefaultsOverride?.source?.id;
                    if (id !== configurationDefaultsOverrideSourceId) {
                        continue;
                    }
                    bucket.add(key);
                    this.configurationDefaultsOverrides.delete(key);
                    if (exports.OVERRIDE_PROPERTY_REGEX.test(key)) {
                        delete this.configurationProperties[key];
                        delete this.defaultLanguageConfigurationOverridesNode.properties[key];
                    }
                    else {
                        const property = this.configurationProperties[key];
                        if (property) {
                            this.updatePropertyDefaultValue(key, property);
                            this.updateSchema(key, property);
                        }
                    }
                }
            }
            this.updateOverridePropertyPatternKey();
        }
        deltaConfiguration(delta) {
            // defaults: remove
            let defaultsOverrides = false;
            const properties = new Set();
            if (delta.removedDefaults) {
                this.doDeregisterDefaultConfigurations(delta.removedDefaults, properties);
                defaultsOverrides = true;
            }
            // defaults: add
            if (delta.addedDefaults) {
                this.doRegisterDefaultConfigurations(delta.addedDefaults, properties);
                defaultsOverrides = true;
            }
            // configurations: remove
            if (delta.removedConfigurations) {
                this.doDeregisterConfigurations(delta.removedConfigurations, properties);
            }
            // configurations: add
            if (delta.addedConfigurations) {
                this.doRegisterConfigurations(delta.addedConfigurations, false, properties);
            }
            this._onDidSchemaChange.fire();
            this._onDidUpdateConfiguration.fire({ properties, defaultsOverrides });
        }
        notifyConfigurationSchemaUpdated(...configurations) {
            this._onDidSchemaChange.fire();
        }
        registerOverrideIdentifiers(overrideIdentifiers) {
            this.doRegisterOverrideIdentifiers(overrideIdentifiers);
            this._onDidSchemaChange.fire();
        }
        doRegisterOverrideIdentifiers(overrideIdentifiers) {
            for (const overrideIdentifier of overrideIdentifiers) {
                this.overrideIdentifiers.add(overrideIdentifier);
            }
            this.updateOverridePropertyPatternKey();
        }
        doRegisterConfigurations(configurations, validate, bucket) {
            configurations.forEach(configuration => {
                this.validateAndRegisterProperties(configuration, validate, configuration.extensionInfo, configuration.restrictedProperties, undefined, bucket);
                this.configurationContributors.push(configuration);
                this.registerJSONConfiguration(configuration);
            });
        }
        doDeregisterConfigurations(configurations, bucket) {
            const deregisterConfiguration = (configuration) => {
                if (configuration.properties) {
                    for (const key in configuration.properties) {
                        bucket.add(key);
                        const property = this.configurationProperties[key];
                        if (property?.policy?.name) {
                            this.policyConfigurations.delete(property.policy.name);
                        }
                        delete this.configurationProperties[key];
                        this.removeFromSchema(key, configuration.properties[key]);
                    }
                }
                configuration.allOf?.forEach(node => deregisterConfiguration(node));
            };
            for (const configuration of configurations) {
                deregisterConfiguration(configuration);
                const index = this.configurationContributors.indexOf(configuration);
                if (index !== -1) {
                    this.configurationContributors.splice(index, 1);
                }
            }
        }
        validateAndRegisterProperties(configuration, validate = true, extensionInfo, restrictedProperties, scope = 3 /* ConfigurationScope.WINDOW */, bucket) {
            scope = types.isUndefinedOrNull(configuration.scope) ? scope : configuration.scope;
            const properties = configuration.properties;
            if (properties) {
                for (const key in properties) {
                    const property = properties[key];
                    if (validate && validateProperty(key, property)) {
                        delete properties[key];
                        continue;
                    }
                    property.source = extensionInfo;
                    // update default value
                    property.defaultDefaultValue = properties[key].default;
                    this.updatePropertyDefaultValue(key, property);
                    // update scope
                    if (exports.OVERRIDE_PROPERTY_REGEX.test(key)) {
                        property.scope = undefined; // No scope for overridable properties `[${identifier}]`
                    }
                    else {
                        property.scope = types.isUndefinedOrNull(property.scope) ? scope : property.scope;
                        property.restricted = types.isUndefinedOrNull(property.restricted) ? !!restrictedProperties?.includes(key) : property.restricted;
                    }
                    // Add to properties maps
                    // Property is included by default if 'included' is unspecified
                    if (properties[key].hasOwnProperty('included') && !properties[key].included) {
                        this.excludedConfigurationProperties[key] = properties[key];
                        delete properties[key];
                        continue;
                    }
                    else {
                        this.configurationProperties[key] = properties[key];
                        if (properties[key].policy?.name) {
                            this.policyConfigurations.set(properties[key].policy.name, key);
                        }
                    }
                    if (!properties[key].deprecationMessage && properties[key].markdownDeprecationMessage) {
                        // If not set, default deprecationMessage to the markdown source
                        properties[key].deprecationMessage = properties[key].markdownDeprecationMessage;
                    }
                    bucket.add(key);
                }
            }
            const subNodes = configuration.allOf;
            if (subNodes) {
                for (const node of subNodes) {
                    this.validateAndRegisterProperties(node, validate, extensionInfo, restrictedProperties, scope, bucket);
                }
            }
        }
        // TODO: @sandy081 - Remove this method and include required info in getConfigurationProperties
        getConfigurations() {
            return this.configurationContributors;
        }
        getConfigurationProperties() {
            return this.configurationProperties;
        }
        getPolicyConfigurations() {
            return this.policyConfigurations;
        }
        getExcludedConfigurationProperties() {
            return this.excludedConfigurationProperties;
        }
        getConfigurationDefaultsOverrides() {
            return this.configurationDefaultsOverrides;
        }
        registerJSONConfiguration(configuration) {
            const register = (configuration) => {
                const properties = configuration.properties;
                if (properties) {
                    for (const key in properties) {
                        this.updateSchema(key, properties[key]);
                    }
                }
                const subNodes = configuration.allOf;
                subNodes?.forEach(register);
            };
            register(configuration);
        }
        updateSchema(key, property) {
            exports.allSettings.properties[key] = property;
            switch (property.scope) {
                case 1 /* ConfigurationScope.APPLICATION */:
                    exports.applicationSettings.properties[key] = property;
                    break;
                case 2 /* ConfigurationScope.MACHINE */:
                    exports.machineSettings.properties[key] = property;
                    break;
                case 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */:
                    exports.machineOverridableSettings.properties[key] = property;
                    break;
                case 3 /* ConfigurationScope.WINDOW */:
                    exports.windowSettings.properties[key] = property;
                    break;
                case 4 /* ConfigurationScope.RESOURCE */:
                    exports.resourceSettings.properties[key] = property;
                    break;
                case 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */:
                    exports.resourceSettings.properties[key] = property;
                    this.resourceLanguageSettingsSchema.properties[key] = property;
                    break;
            }
        }
        removeFromSchema(key, property) {
            delete exports.allSettings.properties[key];
            switch (property.scope) {
                case 1 /* ConfigurationScope.APPLICATION */:
                    delete exports.applicationSettings.properties[key];
                    break;
                case 2 /* ConfigurationScope.MACHINE */:
                    delete exports.machineSettings.properties[key];
                    break;
                case 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */:
                    delete exports.machineOverridableSettings.properties[key];
                    break;
                case 3 /* ConfigurationScope.WINDOW */:
                    delete exports.windowSettings.properties[key];
                    break;
                case 4 /* ConfigurationScope.RESOURCE */:
                case 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */:
                    delete exports.resourceSettings.properties[key];
                    delete this.resourceLanguageSettingsSchema.properties[key];
                    break;
            }
        }
        updateOverridePropertyPatternKey() {
            for (const overrideIdentifier of this.overrideIdentifiers.values()) {
                const overrideIdentifierProperty = `[${overrideIdentifier}]`;
                const resourceLanguagePropertiesSchema = {
                    type: 'object',
                    description: nls.localize('overrideSettings.defaultDescription', "Configure editor settings to be overridden for a language."),
                    errorMessage: nls.localize('overrideSettings.errorMessage', "This setting does not support per-language configuration."),
                    $ref: exports.resourceLanguageSettingsSchemaId,
                };
                this.updatePropertyDefaultValue(overrideIdentifierProperty, resourceLanguagePropertiesSchema);
                exports.allSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.applicationSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.machineSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.machineOverridableSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.windowSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.resourceSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
            }
        }
        registerOverridePropertyPatternKey() {
            const resourceLanguagePropertiesSchema = {
                type: 'object',
                description: nls.localize('overrideSettings.defaultDescription', "Configure editor settings to be overridden for a language."),
                errorMessage: nls.localize('overrideSettings.errorMessage', "This setting does not support per-language configuration."),
                $ref: exports.resourceLanguageSettingsSchemaId,
            };
            exports.allSettings.patternProperties[exports.OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
            exports.applicationSettings.patternProperties[exports.OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
            exports.machineSettings.patternProperties[exports.OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
            exports.machineOverridableSettings.patternProperties[exports.OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
            exports.windowSettings.patternProperties[exports.OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
            exports.resourceSettings.patternProperties[exports.OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
            this._onDidSchemaChange.fire();
        }
        updatePropertyDefaultValue(key, property) {
            const configurationdefaultOverride = this.configurationDefaultsOverrides.get(key);
            let defaultValue = configurationdefaultOverride?.value;
            let defaultSource = configurationdefaultOverride?.source;
            if (types.isUndefined(defaultValue)) {
                defaultValue = property.defaultDefaultValue;
                defaultSource = undefined;
            }
            if (types.isUndefined(defaultValue)) {
                defaultValue = getDefaultValue(property.type);
            }
            property.default = defaultValue;
            property.defaultValueSource = defaultSource;
        }
    }
    const OVERRIDE_IDENTIFIER_PATTERN = `\\[([^\\]]+)\\]`;
    const OVERRIDE_IDENTIFIER_REGEX = new RegExp(OVERRIDE_IDENTIFIER_PATTERN, 'g');
    exports.OVERRIDE_PROPERTY_PATTERN = `^(${OVERRIDE_IDENTIFIER_PATTERN})+$`;
    exports.OVERRIDE_PROPERTY_REGEX = new RegExp(exports.OVERRIDE_PROPERTY_PATTERN);
    function overrideIdentifiersFromKey(key) {
        const identifiers = [];
        if (exports.OVERRIDE_PROPERTY_REGEX.test(key)) {
            let matches = OVERRIDE_IDENTIFIER_REGEX.exec(key);
            while (matches?.length) {
                const identifier = matches[1].trim();
                if (identifier) {
                    identifiers.push(identifier);
                }
                matches = OVERRIDE_IDENTIFIER_REGEX.exec(key);
            }
        }
        return (0, arrays_1.distinct)(identifiers);
    }
    exports.overrideIdentifiersFromKey = overrideIdentifiersFromKey;
    function keyFromOverrideIdentifiers(overrideIdentifiers) {
        return overrideIdentifiers.reduce((result, overrideIdentifier) => `${result}[${overrideIdentifier}]`, '');
    }
    exports.keyFromOverrideIdentifiers = keyFromOverrideIdentifiers;
    function getDefaultValue(type) {
        const t = Array.isArray(type) ? type[0] : type;
        switch (t) {
            case 'boolean':
                return false;
            case 'integer':
            case 'number':
                return 0;
            case 'string':
                return '';
            case 'array':
                return [];
            case 'object':
                return {};
            default:
                return null;
        }
    }
    exports.getDefaultValue = getDefaultValue;
    const configurationRegistry = new ConfigurationRegistry();
    platform_1.Registry.add(exports.Extensions.Configuration, configurationRegistry);
    function validateProperty(property, schema) {
        if (!property.trim()) {
            return nls.localize('config.property.empty', "Cannot register an empty property");
        }
        if (exports.OVERRIDE_PROPERTY_REGEX.test(property)) {
            return nls.localize('config.property.languageDefault', "Cannot register '{0}'. This matches property pattern '\\\\[.*\\\\]$' for describing language specific editor settings. Use 'configurationDefaults' contribution.", property);
        }
        if (configurationRegistry.getConfigurationProperties()[property] !== undefined) {
            return nls.localize('config.property.duplicate', "Cannot register '{0}'. This property is already registered.", property);
        }
        if (schema.policy?.name && configurationRegistry.getPolicyConfigurations().get(schema.policy?.name) !== undefined) {
            return nls.localize('config.policy.duplicate', "Cannot register '{0}'. The associated policy {1} is already registered with {2}.", property, schema.policy?.name, configurationRegistry.getPolicyConfigurations().get(schema.policy?.name));
        }
        return null;
    }
    exports.validateProperty = validateProperty;
    function getScopes() {
        const scopes = [];
        const configurationProperties = configurationRegistry.getConfigurationProperties();
        for (const key of Object.keys(configurationProperties)) {
            scopes.push([key, configurationProperties[key].scope]);
        }
        scopes.push(['launch', 4 /* ConfigurationScope.RESOURCE */]);
        scopes.push(['task', 4 /* ConfigurationScope.RESOURCE */]);
        return scopes;
    }
    exports.getScopes = getScopes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vY29uZmlndXJhdGlvbi9jb21tb24vY29uZmlndXJhdGlvblJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxJQUFZLHFCQUdYO0lBSEQsV0FBWSxxQkFBcUI7UUFDaEMsb0RBQTJCLENBQUE7UUFDM0Isc0RBQTZCLENBQUE7SUFDOUIsQ0FBQyxFQUhXLHFCQUFxQixxQ0FBckIscUJBQXFCLFFBR2hDO0lBRVksUUFBQSxVQUFVLEdBQUc7UUFDekIsYUFBYSxFQUFFLGtDQUFrQztLQUNqRCxDQUFDO0lBa0dGLElBQWtCLGtCQXlCakI7SUF6QkQsV0FBa0Isa0JBQWtCO1FBQ25DOztXQUVHO1FBQ0gseUVBQWUsQ0FBQTtRQUNmOztXQUVHO1FBQ0gsaUVBQU8sQ0FBQTtRQUNQOztXQUVHO1FBQ0gsK0RBQU0sQ0FBQTtRQUNOOztXQUVHO1FBQ0gsbUVBQVEsQ0FBQTtRQUNSOztXQUVHO1FBQ0gsMkZBQW9CLENBQUE7UUFDcEI7O1dBRUc7UUFDSCx5RkFBbUIsQ0FBQTtJQUNwQixDQUFDLEVBekJpQixrQkFBa0Isa0NBQWxCLGtCQUFrQixRQXlCbkM7SUEwR1ksUUFBQSxXQUFXLEdBQXdJLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUM3TCxRQUFBLG1CQUFtQixHQUF3SSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDck0sUUFBQSxlQUFlLEdBQXdJLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNqTSxRQUFBLDBCQUEwQixHQUF3SSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsaUJB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