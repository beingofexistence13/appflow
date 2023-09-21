/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/types", "vs/nls!vs/platform/configuration/common/configurationRegistry", "vs/platform/configuration/common/configuration", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform"], function (require, exports, arrays_1, event_1, types, nls, configuration_1, jsonContributionRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pn = exports.$on = exports.$nn = exports.$mn = exports.$ln = exports.$kn = exports.$jn = exports.$in = exports.$hn = exports.$gn = exports.$fn = exports.$en = exports.$dn = exports.$cn = exports.$bn = exports.ConfigurationScope = exports.$an = exports.EditPresentationTypes = void 0;
    var EditPresentationTypes;
    (function (EditPresentationTypes) {
        EditPresentationTypes["Multiline"] = "multilineText";
        EditPresentationTypes["Singleline"] = "singlelineText";
    })(EditPresentationTypes || (exports.EditPresentationTypes = EditPresentationTypes = {}));
    exports.$an = {
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
    exports.$bn = { properties: {}, patternProperties: {} };
    exports.$cn = { properties: {}, patternProperties: {} };
    exports.$dn = { properties: {}, patternProperties: {} };
    exports.$en = { properties: {}, patternProperties: {} };
    exports.$fn = { properties: {}, patternProperties: {} };
    exports.$gn = { properties: {}, patternProperties: {} };
    exports.$hn = 'vscode://schemas/settings/resourceLanguage';
    exports.$in = 'vscode://schemas/settings/configurationDefaults';
    const contributionRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
    class ConfigurationRegistry {
        constructor() {
            this.h = new Set();
            this.i = new event_1.$fd();
            this.onDidSchemaChange = this.i.event;
            this.j = new event_1.$fd();
            this.onDidUpdateConfiguration = this.j.event;
            this.a = new Map();
            this.b = {
                id: 'defaultOverrides',
                title: nls.localize(0, null),
                properties: {}
            };
            this.c = [this.b];
            this.g = {
                properties: {},
                patternProperties: {},
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            this.d = {};
            this.e = new Map();
            this.f = {};
            contributionRegistry.registerSchema(exports.$hn, this.g);
            this.v();
        }
        registerConfiguration(configuration, validate = true) {
            this.registerConfigurations([configuration], validate);
        }
        registerConfigurations(configurations, validate = true) {
            const properties = new Set();
            this.n(configurations, validate, properties);
            contributionRegistry.registerSchema(exports.$hn, this.g);
            this.i.fire();
            this.j.fire({ properties });
        }
        deregisterConfigurations(configurations) {
            const properties = new Set();
            this.o(configurations, properties);
            contributionRegistry.registerSchema(exports.$hn, this.g);
            this.i.fire();
            this.j.fire({ properties });
        }
        updateConfigurations({ add, remove }) {
            const properties = new Set();
            this.o(remove, properties);
            this.n(add, false, properties);
            contributionRegistry.registerSchema(exports.$hn, this.g);
            this.i.fire();
            this.j.fire({ properties });
        }
        registerDefaultConfigurations(configurationDefaults) {
            const properties = new Set();
            this.k(configurationDefaults, properties);
            this.i.fire();
            this.j.fire({ properties, defaultsOverrides: true });
        }
        k(configurationDefaults, bucket) {
            const overrideIdentifiers = [];
            for (const { overrides, source } of configurationDefaults) {
                for (const key in overrides) {
                    bucket.add(key);
                    if (exports.$kn.test(key)) {
                        const configurationDefaultOverride = this.a.get(key);
                        const valuesSources = configurationDefaultOverride?.valuesSources ?? new Map();
                        if (source) {
                            for (const configuration of Object.keys(overrides[key])) {
                                valuesSources.set(configuration, source);
                            }
                        }
                        const defaultValue = { ...(configurationDefaultOverride?.value || {}), ...overrides[key] };
                        this.a.set(key, { source, value: defaultValue, valuesSources });
                        const plainKey = (0, configuration_1.$fi)(key);
                        const property = {
                            type: 'object',
                            default: defaultValue,
                            description: nls.localize(1, null, plainKey),
                            $ref: exports.$hn,
                            defaultDefaultValue: defaultValue,
                            source: types.$jf(source) ? undefined : source,
                            defaultValueSource: source
                        };
                        overrideIdentifiers.push(...$ln(key));
                        this.d[key] = property;
                        this.b.properties[key] = property;
                    }
                    else {
                        this.a.set(key, { value: overrides[key], source });
                        const property = this.d[key];
                        if (property) {
                            this.w(key, property);
                            this.r(key, property);
                        }
                    }
                }
            }
            this.m(overrideIdentifiers);
        }
        deregisterDefaultConfigurations(defaultConfigurations) {
            const properties = new Set();
            this.l(defaultConfigurations, properties);
            this.i.fire();
            this.j.fire({ properties, defaultsOverrides: true });
        }
        l(defaultConfigurations, bucket) {
            for (const { overrides, source } of defaultConfigurations) {
                for (const key in overrides) {
                    const configurationDefaultsOverride = this.a.get(key);
                    const id = types.$jf(source) ? source : source?.id;
                    const configurationDefaultsOverrideSourceId = types.$jf(configurationDefaultsOverride?.source) ? configurationDefaultsOverride?.source : configurationDefaultsOverride?.source?.id;
                    if (id !== configurationDefaultsOverrideSourceId) {
                        continue;
                    }
                    bucket.add(key);
                    this.a.delete(key);
                    if (exports.$kn.test(key)) {
                        delete this.d[key];
                        delete this.b.properties[key];
                    }
                    else {
                        const property = this.d[key];
                        if (property) {
                            this.w(key, property);
                            this.r(key, property);
                        }
                    }
                }
            }
            this.u();
        }
        deltaConfiguration(delta) {
            // defaults: remove
            let defaultsOverrides = false;
            const properties = new Set();
            if (delta.removedDefaults) {
                this.l(delta.removedDefaults, properties);
                defaultsOverrides = true;
            }
            // defaults: add
            if (delta.addedDefaults) {
                this.k(delta.addedDefaults, properties);
                defaultsOverrides = true;
            }
            // configurations: remove
            if (delta.removedConfigurations) {
                this.o(delta.removedConfigurations, properties);
            }
            // configurations: add
            if (delta.addedConfigurations) {
                this.n(delta.addedConfigurations, false, properties);
            }
            this.i.fire();
            this.j.fire({ properties, defaultsOverrides });
        }
        notifyConfigurationSchemaUpdated(...configurations) {
            this.i.fire();
        }
        registerOverrideIdentifiers(overrideIdentifiers) {
            this.m(overrideIdentifiers);
            this.i.fire();
        }
        m(overrideIdentifiers) {
            for (const overrideIdentifier of overrideIdentifiers) {
                this.h.add(overrideIdentifier);
            }
            this.u();
        }
        n(configurations, validate, bucket) {
            configurations.forEach(configuration => {
                this.p(configuration, validate, configuration.extensionInfo, configuration.restrictedProperties, undefined, bucket);
                this.c.push(configuration);
                this.q(configuration);
            });
        }
        o(configurations, bucket) {
            const deregisterConfiguration = (configuration) => {
                if (configuration.properties) {
                    for (const key in configuration.properties) {
                        bucket.add(key);
                        const property = this.d[key];
                        if (property?.policy?.name) {
                            this.e.delete(property.policy.name);
                        }
                        delete this.d[key];
                        this.s(key, configuration.properties[key]);
                    }
                }
                configuration.allOf?.forEach(node => deregisterConfiguration(node));
            };
            for (const configuration of configurations) {
                deregisterConfiguration(configuration);
                const index = this.c.indexOf(configuration);
                if (index !== -1) {
                    this.c.splice(index, 1);
                }
            }
        }
        p(configuration, validate = true, extensionInfo, restrictedProperties, scope = 3 /* ConfigurationScope.WINDOW */, bucket) {
            scope = types.$sf(configuration.scope) ? scope : configuration.scope;
            const properties = configuration.properties;
            if (properties) {
                for (const key in properties) {
                    const property = properties[key];
                    if (validate && $on(key, property)) {
                        delete properties[key];
                        continue;
                    }
                    property.source = extensionInfo;
                    // update default value
                    property.defaultDefaultValue = properties[key].default;
                    this.w(key, property);
                    // update scope
                    if (exports.$kn.test(key)) {
                        property.scope = undefined; // No scope for overridable properties `[${identifier}]`
                    }
                    else {
                        property.scope = types.$sf(property.scope) ? scope : property.scope;
                        property.restricted = types.$sf(property.restricted) ? !!restrictedProperties?.includes(key) : property.restricted;
                    }
                    // Add to properties maps
                    // Property is included by default if 'included' is unspecified
                    if (properties[key].hasOwnProperty('included') && !properties[key].included) {
                        this.f[key] = properties[key];
                        delete properties[key];
                        continue;
                    }
                    else {
                        this.d[key] = properties[key];
                        if (properties[key].policy?.name) {
                            this.e.set(properties[key].policy.name, key);
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
                    this.p(node, validate, extensionInfo, restrictedProperties, scope, bucket);
                }
            }
        }
        // TODO: @sandy081 - Remove this method and include required info in getConfigurationProperties
        getConfigurations() {
            return this.c;
        }
        getConfigurationProperties() {
            return this.d;
        }
        getPolicyConfigurations() {
            return this.e;
        }
        getExcludedConfigurationProperties() {
            return this.f;
        }
        getConfigurationDefaultsOverrides() {
            return this.a;
        }
        q(configuration) {
            const register = (configuration) => {
                const properties = configuration.properties;
                if (properties) {
                    for (const key in properties) {
                        this.r(key, properties[key]);
                    }
                }
                const subNodes = configuration.allOf;
                subNodes?.forEach(register);
            };
            register(configuration);
        }
        r(key, property) {
            exports.$bn.properties[key] = property;
            switch (property.scope) {
                case 1 /* ConfigurationScope.APPLICATION */:
                    exports.$cn.properties[key] = property;
                    break;
                case 2 /* ConfigurationScope.MACHINE */:
                    exports.$dn.properties[key] = property;
                    break;
                case 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */:
                    exports.$en.properties[key] = property;
                    break;
                case 3 /* ConfigurationScope.WINDOW */:
                    exports.$fn.properties[key] = property;
                    break;
                case 4 /* ConfigurationScope.RESOURCE */:
                    exports.$gn.properties[key] = property;
                    break;
                case 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */:
                    exports.$gn.properties[key] = property;
                    this.g.properties[key] = property;
                    break;
            }
        }
        s(key, property) {
            delete exports.$bn.properties[key];
            switch (property.scope) {
                case 1 /* ConfigurationScope.APPLICATION */:
                    delete exports.$cn.properties[key];
                    break;
                case 2 /* ConfigurationScope.MACHINE */:
                    delete exports.$dn.properties[key];
                    break;
                case 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */:
                    delete exports.$en.properties[key];
                    break;
                case 3 /* ConfigurationScope.WINDOW */:
                    delete exports.$fn.properties[key];
                    break;
                case 4 /* ConfigurationScope.RESOURCE */:
                case 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */:
                    delete exports.$gn.properties[key];
                    delete this.g.properties[key];
                    break;
            }
        }
        u() {
            for (const overrideIdentifier of this.h.values()) {
                const overrideIdentifierProperty = `[${overrideIdentifier}]`;
                const resourceLanguagePropertiesSchema = {
                    type: 'object',
                    description: nls.localize(2, null),
                    errorMessage: nls.localize(3, null),
                    $ref: exports.$hn,
                };
                this.w(overrideIdentifierProperty, resourceLanguagePropertiesSchema);
                exports.$bn.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.$cn.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.$dn.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.$en.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.$fn.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.$gn.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
            }
        }
        v() {
            const resourceLanguagePropertiesSchema = {
                type: 'object',
                description: nls.localize(4, null),
                errorMessage: nls.localize(5, null),
                $ref: exports.$hn,
            };
            exports.$bn.patternProperties[exports.$jn] = resourceLanguagePropertiesSchema;
            exports.$cn.patternProperties[exports.$jn] = resourceLanguagePropertiesSchema;
            exports.$dn.patternProperties[exports.$jn] = resourceLanguagePropertiesSchema;
            exports.$en.patternProperties[exports.$jn] = resourceLanguagePropertiesSchema;
            exports.$fn.patternProperties[exports.$jn] = resourceLanguagePropertiesSchema;
            exports.$gn.patternProperties[exports.$jn] = resourceLanguagePropertiesSchema;
            this.i.fire();
        }
        w(key, property) {
            const configurationdefaultOverride = this.a.get(key);
            let defaultValue = configurationdefaultOverride?.value;
            let defaultSource = configurationdefaultOverride?.source;
            if (types.$qf(defaultValue)) {
                defaultValue = property.defaultDefaultValue;
                defaultSource = undefined;
            }
            if (types.$qf(defaultValue)) {
                defaultValue = $nn(property.type);
            }
            property.default = defaultValue;
            property.defaultValueSource = defaultSource;
        }
    }
    const OVERRIDE_IDENTIFIER_PATTERN = `\\[([^\\]]+)\\]`;
    const OVERRIDE_IDENTIFIER_REGEX = new RegExp(OVERRIDE_IDENTIFIER_PATTERN, 'g');
    exports.$jn = `^(${OVERRIDE_IDENTIFIER_PATTERN})+$`;
    exports.$kn = new RegExp(exports.$jn);
    function $ln(key) {
        const identifiers = [];
        if (exports.$kn.test(key)) {
            let matches = OVERRIDE_IDENTIFIER_REGEX.exec(key);
            while (matches?.length) {
                const identifier = matches[1].trim();
                if (identifier) {
                    identifiers.push(identifier);
                }
                matches = OVERRIDE_IDENTIFIER_REGEX.exec(key);
            }
        }
        return (0, arrays_1.$Kb)(identifiers);
    }
    exports.$ln = $ln;
    function $mn(overrideIdentifiers) {
        return overrideIdentifiers.reduce((result, overrideIdentifier) => `${result}[${overrideIdentifier}]`, '');
    }
    exports.$mn = $mn;
    function $nn(type) {
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
    exports.$nn = $nn;
    const configurationRegistry = new ConfigurationRegistry();
    platform_1.$8m.add(exports.$an.Configuration, configurationRegistry);
    function $on(property, schema) {
        if (!property.trim()) {
            return nls.localize(6, null);
        }
        if (exports.$kn.test(property)) {
            return nls.localize(7, null, property);
        }
        if (configurationRegistry.getConfigurationProperties()[property] !== undefined) {
            return nls.localize(8, null, property);
        }
        if (schema.policy?.name && configurationRegistry.getPolicyConfigurations().get(schema.policy?.name) !== undefined) {
            return nls.localize(9, null, property, schema.policy?.name, configurationRegistry.getPolicyConfigurations().get(schema.policy?.name));
        }
        return null;
    }
    exports.$on = $on;
    function $pn() {
        const scopes = [];
        const configurationProperties = configurationRegistry.getConfigurationProperties();
        for (const key of Object.keys(configurationProperties)) {
            scopes.push([key, configurationProperties[key].scope]);
        }
        scopes.push(['launch', 4 /* ConfigurationScope.RESOURCE */]);
        scopes.push(['task', 4 /* ConfigurationScope.RESOURCE */]);
        return scopes;
    }
    exports.$pn = $pn;
});
//# sourceMappingURL=configurationRegistry.js.map