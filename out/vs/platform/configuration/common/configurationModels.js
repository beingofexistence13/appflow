/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, arrays, event_1, json, lifecycle_1, map_1, objects, types, uri_1, configuration_1, configurationRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigurationChangeEvent = exports.mergeChanges = exports.Configuration = exports.UserSettings = exports.ConfigurationModelParser = exports.ConfigurationModel = void 0;
    function freeze(data) {
        return Object.isFrozen(data) ? data : objects.deepFreeze(data);
    }
    class ConfigurationModel {
        constructor(_contents = {}, _keys = [], _overrides = [], raw) {
            this._contents = _contents;
            this._keys = _keys;
            this._overrides = _overrides;
            this.raw = raw;
            this.overrideConfigurations = new Map();
        }
        get rawConfiguration() {
            if (!this._rawConfiguration) {
                if (this.raw?.length) {
                    const rawConfigurationModels = this.raw.map(raw => {
                        if (raw instanceof ConfigurationModel) {
                            return raw;
                        }
                        const parser = new ConfigurationModelParser('');
                        parser.parseRaw(raw);
                        return parser.configurationModel;
                    });
                    this._rawConfiguration = rawConfigurationModels.reduce((previous, current) => current === previous ? current : previous.merge(current), rawConfigurationModels[0]);
                }
                else {
                    // raw is same as current
                    this._rawConfiguration = this;
                }
            }
            return this._rawConfiguration;
        }
        get contents() {
            return this._contents;
        }
        get overrides() {
            return this._overrides;
        }
        get keys() {
            return this._keys;
        }
        isEmpty() {
            return this._keys.length === 0 && Object.keys(this._contents).length === 0 && this._overrides.length === 0;
        }
        getValue(section) {
            return section ? (0, configuration_1.getConfigurationValue)(this.contents, section) : this.contents;
        }
        inspect(section, overrideIdentifier) {
            const value = this.rawConfiguration.getValue(section);
            const override = overrideIdentifier ? this.rawConfiguration.getOverrideValue(section, overrideIdentifier) : undefined;
            const merged = overrideIdentifier ? this.rawConfiguration.override(overrideIdentifier).getValue(section) : value;
            return { value, override, merged };
        }
        getOverrideValue(section, overrideIdentifier) {
            const overrideContents = this.getContentsForOverrideIdentifer(overrideIdentifier);
            return overrideContents
                ? section ? (0, configuration_1.getConfigurationValue)(overrideContents, section) : overrideContents
                : undefined;
        }
        getKeysForOverrideIdentifier(identifier) {
            const keys = [];
            for (const override of this.overrides) {
                if (override.identifiers.includes(identifier)) {
                    keys.push(...override.keys);
                }
            }
            return arrays.distinct(keys);
        }
        getAllOverrideIdentifiers() {
            const result = [];
            for (const override of this.overrides) {
                result.push(...override.identifiers);
            }
            return arrays.distinct(result);
        }
        override(identifier) {
            let overrideConfigurationModel = this.overrideConfigurations.get(identifier);
            if (!overrideConfigurationModel) {
                overrideConfigurationModel = this.createOverrideConfigurationModel(identifier);
                this.overrideConfigurations.set(identifier, overrideConfigurationModel);
            }
            return overrideConfigurationModel;
        }
        merge(...others) {
            const contents = objects.deepClone(this.contents);
            const overrides = objects.deepClone(this.overrides);
            const keys = [...this.keys];
            const raws = this.raw?.length ? [...this.raw] : [this];
            for (const other of others) {
                raws.push(...(other.raw?.length ? other.raw : [other]));
                if (other.isEmpty()) {
                    continue;
                }
                this.mergeContents(contents, other.contents);
                for (const otherOverride of other.overrides) {
                    const [override] = overrides.filter(o => arrays.equals(o.identifiers, otherOverride.identifiers));
                    if (override) {
                        this.mergeContents(override.contents, otherOverride.contents);
                        override.keys.push(...otherOverride.keys);
                        override.keys = arrays.distinct(override.keys);
                    }
                    else {
                        overrides.push(objects.deepClone(otherOverride));
                    }
                }
                for (const key of other.keys) {
                    if (keys.indexOf(key) === -1) {
                        keys.push(key);
                    }
                }
            }
            return new ConfigurationModel(contents, keys, overrides, raws.every(raw => raw instanceof ConfigurationModel) ? undefined : raws);
        }
        createOverrideConfigurationModel(identifier) {
            const overrideContents = this.getContentsForOverrideIdentifer(identifier);
            if (!overrideContents || typeof overrideContents !== 'object' || !Object.keys(overrideContents).length) {
                // If there are no valid overrides, return self
                return this;
            }
            const contents = {};
            for (const key of arrays.distinct([...Object.keys(this.contents), ...Object.keys(overrideContents)])) {
                let contentsForKey = this.contents[key];
                const overrideContentsForKey = overrideContents[key];
                // If there are override contents for the key, clone and merge otherwise use base contents
                if (overrideContentsForKey) {
                    // Clone and merge only if base contents and override contents are of type object otherwise just override
                    if (typeof contentsForKey === 'object' && typeof overrideContentsForKey === 'object') {
                        contentsForKey = objects.deepClone(contentsForKey);
                        this.mergeContents(contentsForKey, overrideContentsForKey);
                    }
                    else {
                        contentsForKey = overrideContentsForKey;
                    }
                }
                contents[key] = contentsForKey;
            }
            return new ConfigurationModel(contents, this.keys, this.overrides);
        }
        mergeContents(source, target) {
            for (const key of Object.keys(target)) {
                if (key in source) {
                    if (types.isObject(source[key]) && types.isObject(target[key])) {
                        this.mergeContents(source[key], target[key]);
                        continue;
                    }
                }
                source[key] = objects.deepClone(target[key]);
            }
        }
        getContentsForOverrideIdentifer(identifier) {
            let contentsForIdentifierOnly = null;
            let contents = null;
            const mergeContents = (contentsToMerge) => {
                if (contentsToMerge) {
                    if (contents) {
                        this.mergeContents(contents, contentsToMerge);
                    }
                    else {
                        contents = objects.deepClone(contentsToMerge);
                    }
                }
            };
            for (const override of this.overrides) {
                if (override.identifiers.length === 1 && override.identifiers[0] === identifier) {
                    contentsForIdentifierOnly = override.contents;
                }
                else if (override.identifiers.includes(identifier)) {
                    mergeContents(override.contents);
                }
            }
            // Merge contents of the identifier only at the end to take precedence.
            mergeContents(contentsForIdentifierOnly);
            return contents;
        }
        toJSON() {
            return {
                contents: this.contents,
                overrides: this.overrides,
                keys: this.keys
            };
        }
        // Update methods
        addValue(key, value) {
            this.updateValue(key, value, true);
        }
        setValue(key, value) {
            this.updateValue(key, value, false);
        }
        removeValue(key) {
            const index = this.keys.indexOf(key);
            if (index === -1) {
                return;
            }
            this.keys.splice(index, 1);
            (0, configuration_1.removeFromValueTree)(this.contents, key);
            if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key)) {
                this.overrides.splice(this.overrides.findIndex(o => arrays.equals(o.identifiers, (0, configurationRegistry_1.overrideIdentifiersFromKey)(key))), 1);
            }
        }
        updateValue(key, value, add) {
            (0, configuration_1.addToValueTree)(this.contents, key, value, e => console.error(e));
            add = add || this.keys.indexOf(key) === -1;
            if (add) {
                this.keys.push(key);
            }
            if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key)) {
                this.overrides.push({
                    identifiers: (0, configurationRegistry_1.overrideIdentifiersFromKey)(key),
                    keys: Object.keys(this.contents[key]),
                    contents: (0, configuration_1.toValuesTree)(this.contents[key], message => console.error(message)),
                });
            }
        }
    }
    exports.ConfigurationModel = ConfigurationModel;
    class ConfigurationModelParser {
        constructor(_name) {
            this._name = _name;
            this._raw = null;
            this._configurationModel = null;
            this._restrictedConfigurations = [];
            this._parseErrors = [];
        }
        get configurationModel() {
            return this._configurationModel || new ConfigurationModel();
        }
        get restrictedConfigurations() {
            return this._restrictedConfigurations;
        }
        get errors() {
            return this._parseErrors;
        }
        parse(content, options) {
            if (!types.isUndefinedOrNull(content)) {
                const raw = this.doParseContent(content);
                this.parseRaw(raw, options);
            }
        }
        reparse(options) {
            if (this._raw) {
                this.parseRaw(this._raw, options);
            }
        }
        parseRaw(raw, options) {
            this._raw = raw;
            const { contents, keys, overrides, restricted, hasExcludedProperties } = this.doParseRaw(raw, options);
            this._configurationModel = new ConfigurationModel(contents, keys, overrides, hasExcludedProperties ? [raw] : undefined /* raw has not changed */);
            this._restrictedConfigurations = restricted || [];
        }
        doParseContent(content) {
            let raw = {};
            let currentProperty = null;
            let currentParent = [];
            const previousParents = [];
            const parseErrors = [];
            function onValue(value) {
                if (Array.isArray(currentParent)) {
                    currentParent.push(value);
                }
                else if (currentProperty !== null) {
                    currentParent[currentProperty] = value;
                }
            }
            const visitor = {
                onObjectBegin: () => {
                    const object = {};
                    onValue(object);
                    previousParents.push(currentParent);
                    currentParent = object;
                    currentProperty = null;
                },
                onObjectProperty: (name) => {
                    currentProperty = name;
                },
                onObjectEnd: () => {
                    currentParent = previousParents.pop();
                },
                onArrayBegin: () => {
                    const array = [];
                    onValue(array);
                    previousParents.push(currentParent);
                    currentParent = array;
                    currentProperty = null;
                },
                onArrayEnd: () => {
                    currentParent = previousParents.pop();
                },
                onLiteralValue: onValue,
                onError: (error, offset, length) => {
                    parseErrors.push({ error, offset, length });
                }
            };
            if (content) {
                try {
                    json.visit(content, visitor);
                    raw = currentParent[0] || {};
                }
                catch (e) {
                    console.error(`Error while parsing settings file ${this._name}: ${e}`);
                    this._parseErrors = [e];
                }
            }
            return raw;
        }
        doParseRaw(raw, options) {
            const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            const filtered = this.filter(raw, configurationProperties, true, options);
            raw = filtered.raw;
            const contents = (0, configuration_1.toValuesTree)(raw, message => console.error(`Conflict in settings file ${this._name}: ${message}`));
            const keys = Object.keys(raw);
            const overrides = this.toOverrides(raw, message => console.error(`Conflict in settings file ${this._name}: ${message}`));
            return { contents, keys, overrides, restricted: filtered.restricted, hasExcludedProperties: filtered.hasExcludedProperties };
        }
        filter(properties, configurationProperties, filterOverriddenProperties, options) {
            let hasExcludedProperties = false;
            if (!options?.scopes && !options?.skipRestricted && !options?.exclude?.length) {
                return { raw: properties, restricted: [], hasExcludedProperties };
            }
            const raw = {};
            const restricted = [];
            for (const key in properties) {
                if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key) && filterOverriddenProperties) {
                    const result = this.filter(properties[key], configurationProperties, false, options);
                    raw[key] = result.raw;
                    hasExcludedProperties = hasExcludedProperties || result.hasExcludedProperties;
                    restricted.push(...result.restricted);
                }
                else {
                    const propertySchema = configurationProperties[key];
                    const scope = propertySchema ? typeof propertySchema.scope !== 'undefined' ? propertySchema.scope : 3 /* ConfigurationScope.WINDOW */ : undefined;
                    if (propertySchema?.restricted) {
                        restricted.push(key);
                    }
                    if (!options.exclude?.includes(key) /* Check exclude */
                        && (options.include?.includes(key) /* Check include */
                            || ((scope === undefined || options.scopes === undefined || options.scopes.includes(scope)) /* Check scopes */
                                && !(options.skipRestricted && propertySchema?.restricted)))) /* Check restricted */ {
                        raw[key] = properties[key];
                    }
                    else {
                        hasExcludedProperties = true;
                    }
                }
            }
            return { raw, restricted, hasExcludedProperties };
        }
        toOverrides(raw, conflictReporter) {
            const overrides = [];
            for (const key of Object.keys(raw)) {
                if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key)) {
                    const overrideRaw = {};
                    for (const keyInOverrideRaw in raw[key]) {
                        overrideRaw[keyInOverrideRaw] = raw[key][keyInOverrideRaw];
                    }
                    overrides.push({
                        identifiers: (0, configurationRegistry_1.overrideIdentifiersFromKey)(key),
                        keys: Object.keys(overrideRaw),
                        contents: (0, configuration_1.toValuesTree)(overrideRaw, conflictReporter)
                    });
                }
            }
            return overrides;
        }
    }
    exports.ConfigurationModelParser = ConfigurationModelParser;
    class UserSettings extends lifecycle_1.Disposable {
        constructor(userSettingsResource, parseOptions, extUri, fileService) {
            super();
            this.userSettingsResource = userSettingsResource;
            this.parseOptions = parseOptions;
            this.fileService = fileService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.parser = new ConfigurationModelParser(this.userSettingsResource.toString());
            this._register(this.fileService.watch(extUri.dirname(this.userSettingsResource)));
            // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
            this._register(this.fileService.watch(this.userSettingsResource));
            this._register(event_1.Event.any(event_1.Event.filter(this.fileService.onDidFilesChange, e => e.contains(this.userSettingsResource)), event_1.Event.filter(this.fileService.onDidRunOperation, e => (e.isOperation(0 /* FileOperation.CREATE */) || e.isOperation(3 /* FileOperation.COPY */) || e.isOperation(1 /* FileOperation.DELETE */) || e.isOperation(4 /* FileOperation.WRITE */)) && extUri.isEqual(e.resource, userSettingsResource)))(() => this._onDidChange.fire()));
        }
        async loadConfiguration() {
            try {
                const content = await this.fileService.readFile(this.userSettingsResource);
                this.parser.parse(content.value.toString() || '{}', this.parseOptions);
                return this.parser.configurationModel;
            }
            catch (e) {
                return new ConfigurationModel();
            }
        }
        reparse(parseOptions) {
            if (parseOptions) {
                this.parseOptions = parseOptions;
            }
            this.parser.reparse(this.parseOptions);
            return this.parser.configurationModel;
        }
        getRestrictedSettings() {
            return this.parser.restrictedConfigurations;
        }
    }
    exports.UserSettings = UserSettings;
    class ConfigurationInspectValue {
        constructor(key, overrides, _value, overrideIdentifiers, defaultConfiguration, policyConfiguration, applicationConfiguration, userConfiguration, localUserConfiguration, remoteUserConfiguration, workspaceConfiguration, folderConfigurationModel, memoryConfigurationModel) {
            this.key = key;
            this.overrides = overrides;
            this._value = _value;
            this.overrideIdentifiers = overrideIdentifiers;
            this.defaultConfiguration = defaultConfiguration;
            this.policyConfiguration = policyConfiguration;
            this.applicationConfiguration = applicationConfiguration;
            this.userConfiguration = userConfiguration;
            this.localUserConfiguration = localUserConfiguration;
            this.remoteUserConfiguration = remoteUserConfiguration;
            this.workspaceConfiguration = workspaceConfiguration;
            this.folderConfigurationModel = folderConfigurationModel;
            this.memoryConfigurationModel = memoryConfigurationModel;
        }
        get value() {
            return freeze(this._value);
        }
        inspect(model, section, overrideIdentifier) {
            const inspectValue = model.inspect(section, overrideIdentifier);
            return {
                get value() { return freeze(inspectValue.value); },
                get override() { return freeze(inspectValue.override); },
                get merged() { return freeze(inspectValue.merged); }
            };
        }
        get defaultInspectValue() {
            if (!this._defaultInspectValue) {
                this._defaultInspectValue = this.inspect(this.defaultConfiguration, this.key, this.overrides.overrideIdentifier);
            }
            return this._defaultInspectValue;
        }
        get defaultValue() {
            return this.defaultInspectValue.merged;
        }
        get default() {
            return this.defaultInspectValue.value !== undefined || this.defaultInspectValue.override !== undefined ? { value: this.defaultInspectValue.value, override: this.defaultInspectValue.override } : undefined;
        }
        get policyInspectValue() {
            if (this._policyInspectValue === undefined) {
                this._policyInspectValue = this.policyConfiguration ? this.inspect(this.policyConfiguration, this.key) : null;
            }
            return this._policyInspectValue;
        }
        get policyValue() {
            return this.policyInspectValue?.merged;
        }
        get policy() {
            return this.policyInspectValue?.value !== undefined ? { value: this.policyInspectValue.value } : undefined;
        }
        get applicationInspectValue() {
            if (this._applicationInspectValue === undefined) {
                this._applicationInspectValue = this.applicationConfiguration ? this.inspect(this.applicationConfiguration, this.key) : null;
            }
            return this._applicationInspectValue;
        }
        get applicationValue() {
            return this.applicationInspectValue?.merged;
        }
        get application() {
            return this.applicationInspectValue?.value !== undefined || this.applicationInspectValue?.override !== undefined ? { value: this.applicationInspectValue.value, override: this.applicationInspectValue.override } : undefined;
        }
        get userInspectValue() {
            if (!this._userInspectValue) {
                this._userInspectValue = this.inspect(this.userConfiguration, this.key, this.overrides.overrideIdentifier);
            }
            return this._userInspectValue;
        }
        get userValue() {
            return this.userInspectValue.merged;
        }
        get user() {
            return this.userInspectValue.value !== undefined || this.userInspectValue.override !== undefined ? { value: this.userInspectValue.value, override: this.userInspectValue.override } : undefined;
        }
        get userLocalInspectValue() {
            if (!this._userLocalInspectValue) {
                this._userLocalInspectValue = this.inspect(this.localUserConfiguration, this.key, this.overrides.overrideIdentifier);
            }
            return this._userLocalInspectValue;
        }
        get userLocalValue() {
            return this.userLocalInspectValue.merged;
        }
        get userLocal() {
            return this.userLocalInspectValue.value !== undefined || this.userLocalInspectValue.override !== undefined ? { value: this.userLocalInspectValue.value, override: this.userLocalInspectValue.override } : undefined;
        }
        get userRemoteInspectValue() {
            if (!this._userRemoteInspectValue) {
                this._userRemoteInspectValue = this.inspect(this.remoteUserConfiguration, this.key, this.overrides.overrideIdentifier);
            }
            return this._userRemoteInspectValue;
        }
        get userRemoteValue() {
            return this.userRemoteInspectValue.merged;
        }
        get userRemote() {
            return this.userRemoteInspectValue.value !== undefined || this.userRemoteInspectValue.override !== undefined ? { value: this.userRemoteInspectValue.value, override: this.userRemoteInspectValue.override } : undefined;
        }
        get workspaceInspectValue() {
            if (this._workspaceInspectValue === undefined) {
                this._workspaceInspectValue = this.workspaceConfiguration ? this.inspect(this.workspaceConfiguration, this.key, this.overrides.overrideIdentifier) : null;
            }
            return this._workspaceInspectValue;
        }
        get workspaceValue() {
            return this.workspaceInspectValue?.merged;
        }
        get workspace() {
            return this.workspaceInspectValue?.value !== undefined || this.workspaceInspectValue?.override !== undefined ? { value: this.workspaceInspectValue.value, override: this.workspaceInspectValue.override } : undefined;
        }
        get workspaceFolderInspectValue() {
            if (this._workspaceFolderInspectValue === undefined) {
                this._workspaceFolderInspectValue = this.folderConfigurationModel ? this.inspect(this.folderConfigurationModel, this.key, this.overrides.overrideIdentifier) : null;
            }
            return this._workspaceFolderInspectValue;
        }
        get workspaceFolderValue() {
            return this.workspaceFolderInspectValue?.merged;
        }
        get workspaceFolder() {
            return this.workspaceFolderInspectValue?.value !== undefined || this.workspaceFolderInspectValue?.override !== undefined ? { value: this.workspaceFolderInspectValue.value, override: this.workspaceFolderInspectValue.override } : undefined;
        }
        get memoryInspectValue() {
            if (this._memoryInspectValue === undefined) {
                this._memoryInspectValue = this.inspect(this.memoryConfigurationModel, this.key, this.overrides.overrideIdentifier);
            }
            return this._memoryInspectValue;
        }
        get memoryValue() {
            return this.memoryInspectValue.merged;
        }
        get memory() {
            return this.memoryInspectValue.value !== undefined || this.memoryInspectValue.override !== undefined ? { value: this.memoryInspectValue.value, override: this.memoryInspectValue.override } : undefined;
        }
    }
    class Configuration {
        constructor(_defaultConfiguration, _policyConfiguration, _applicationConfiguration, _localUserConfiguration, _remoteUserConfiguration = new ConfigurationModel(), _workspaceConfiguration = new ConfigurationModel(), _folderConfigurations = new map_1.ResourceMap(), _memoryConfiguration = new ConfigurationModel(), _memoryConfigurationByResource = new map_1.ResourceMap()) {
            this._defaultConfiguration = _defaultConfiguration;
            this._policyConfiguration = _policyConfiguration;
            this._applicationConfiguration = _applicationConfiguration;
            this._localUserConfiguration = _localUserConfiguration;
            this._remoteUserConfiguration = _remoteUserConfiguration;
            this._workspaceConfiguration = _workspaceConfiguration;
            this._folderConfigurations = _folderConfigurations;
            this._memoryConfiguration = _memoryConfiguration;
            this._memoryConfigurationByResource = _memoryConfigurationByResource;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations = new map_1.ResourceMap();
            this._userConfiguration = null;
        }
        getValue(section, overrides, workspace) {
            const consolidateConfigurationModel = this.getConsolidatedConfigurationModel(section, overrides, workspace);
            return consolidateConfigurationModel.getValue(section);
        }
        updateValue(key, value, overrides = {}) {
            let memoryConfiguration;
            if (overrides.resource) {
                memoryConfiguration = this._memoryConfigurationByResource.get(overrides.resource);
                if (!memoryConfiguration) {
                    memoryConfiguration = new ConfigurationModel();
                    this._memoryConfigurationByResource.set(overrides.resource, memoryConfiguration);
                }
            }
            else {
                memoryConfiguration = this._memoryConfiguration;
            }
            if (value === undefined) {
                memoryConfiguration.removeValue(key);
            }
            else {
                memoryConfiguration.setValue(key, value);
            }
            if (!overrides.resource) {
                this._workspaceConsolidatedConfiguration = null;
            }
        }
        inspect(key, overrides, workspace) {
            const consolidateConfigurationModel = this.getConsolidatedConfigurationModel(key, overrides, workspace);
            const folderConfigurationModel = this.getFolderConfigurationModelForResource(overrides.resource, workspace);
            const memoryConfigurationModel = overrides.resource ? this._memoryConfigurationByResource.get(overrides.resource) || this._memoryConfiguration : this._memoryConfiguration;
            const overrideIdentifiers = new Set();
            for (const override of consolidateConfigurationModel.overrides) {
                for (const overrideIdentifier of override.identifiers) {
                    if (consolidateConfigurationModel.getOverrideValue(key, overrideIdentifier) !== undefined) {
                        overrideIdentifiers.add(overrideIdentifier);
                    }
                }
            }
            return new ConfigurationInspectValue(key, overrides, consolidateConfigurationModel.getValue(key), overrideIdentifiers.size ? [...overrideIdentifiers] : undefined, this._defaultConfiguration, this._policyConfiguration.isEmpty() ? undefined : this._policyConfiguration, this.applicationConfiguration.isEmpty() ? undefined : this.applicationConfiguration, this.userConfiguration, this.localUserConfiguration, this.remoteUserConfiguration, workspace ? this._workspaceConfiguration : undefined, folderConfigurationModel ? folderConfigurationModel : undefined, memoryConfigurationModel);
        }
        keys(workspace) {
            const folderConfigurationModel = this.getFolderConfigurationModelForResource(undefined, workspace);
            return {
                default: this._defaultConfiguration.keys.slice(0),
                user: this.userConfiguration.keys.slice(0),
                workspace: this._workspaceConfiguration.keys.slice(0),
                workspaceFolder: folderConfigurationModel ? folderConfigurationModel.keys.slice(0) : []
            };
        }
        updateDefaultConfiguration(defaultConfiguration) {
            this._defaultConfiguration = defaultConfiguration;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations.clear();
        }
        updatePolicyConfiguration(policyConfiguration) {
            this._policyConfiguration = policyConfiguration;
        }
        updateApplicationConfiguration(applicationConfiguration) {
            this._applicationConfiguration = applicationConfiguration;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations.clear();
        }
        updateLocalUserConfiguration(localUserConfiguration) {
            this._localUserConfiguration = localUserConfiguration;
            this._userConfiguration = null;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations.clear();
        }
        updateRemoteUserConfiguration(remoteUserConfiguration) {
            this._remoteUserConfiguration = remoteUserConfiguration;
            this._userConfiguration = null;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations.clear();
        }
        updateWorkspaceConfiguration(workspaceConfiguration) {
            this._workspaceConfiguration = workspaceConfiguration;
            this._workspaceConsolidatedConfiguration = null;
            this._foldersConsolidatedConfigurations.clear();
        }
        updateFolderConfiguration(resource, configuration) {
            this._folderConfigurations.set(resource, configuration);
            this._foldersConsolidatedConfigurations.delete(resource);
        }
        deleteFolderConfiguration(resource) {
            this.folderConfigurations.delete(resource);
            this._foldersConsolidatedConfigurations.delete(resource);
        }
        compareAndUpdateDefaultConfiguration(defaults, keys) {
            const overrides = [];
            if (!keys) {
                const { added, updated, removed } = compare(this._defaultConfiguration, defaults);
                keys = [...added, ...updated, ...removed];
            }
            for (const key of keys) {
                for (const overrideIdentifier of (0, configurationRegistry_1.overrideIdentifiersFromKey)(key)) {
                    const fromKeys = this._defaultConfiguration.getKeysForOverrideIdentifier(overrideIdentifier);
                    const toKeys = defaults.getKeysForOverrideIdentifier(overrideIdentifier);
                    const keys = [
                        ...toKeys.filter(key => fromKeys.indexOf(key) === -1),
                        ...fromKeys.filter(key => toKeys.indexOf(key) === -1),
                        ...fromKeys.filter(key => !objects.equals(this._defaultConfiguration.override(overrideIdentifier).getValue(key), defaults.override(overrideIdentifier).getValue(key)))
                    ];
                    overrides.push([overrideIdentifier, keys]);
                }
            }
            this.updateDefaultConfiguration(defaults);
            return { keys, overrides };
        }
        compareAndUpdatePolicyConfiguration(policyConfiguration) {
            const { added, updated, removed } = compare(this._policyConfiguration, policyConfiguration);
            const keys = [...added, ...updated, ...removed];
            if (keys.length) {
                this.updatePolicyConfiguration(policyConfiguration);
            }
            return { keys, overrides: [] };
        }
        compareAndUpdateApplicationConfiguration(application) {
            const { added, updated, removed, overrides } = compare(this.applicationConfiguration, application);
            const keys = [...added, ...updated, ...removed];
            if (keys.length) {
                this.updateApplicationConfiguration(application);
            }
            return { keys, overrides };
        }
        compareAndUpdateLocalUserConfiguration(user) {
            const { added, updated, removed, overrides } = compare(this.localUserConfiguration, user);
            const keys = [...added, ...updated, ...removed];
            if (keys.length) {
                this.updateLocalUserConfiguration(user);
            }
            return { keys, overrides };
        }
        compareAndUpdateRemoteUserConfiguration(user) {
            const { added, updated, removed, overrides } = compare(this.remoteUserConfiguration, user);
            const keys = [...added, ...updated, ...removed];
            if (keys.length) {
                this.updateRemoteUserConfiguration(user);
            }
            return { keys, overrides };
        }
        compareAndUpdateWorkspaceConfiguration(workspaceConfiguration) {
            const { added, updated, removed, overrides } = compare(this.workspaceConfiguration, workspaceConfiguration);
            const keys = [...added, ...updated, ...removed];
            if (keys.length) {
                this.updateWorkspaceConfiguration(workspaceConfiguration);
            }
            return { keys, overrides };
        }
        compareAndUpdateFolderConfiguration(resource, folderConfiguration) {
            const currentFolderConfiguration = this.folderConfigurations.get(resource);
            const { added, updated, removed, overrides } = compare(currentFolderConfiguration, folderConfiguration);
            const keys = [...added, ...updated, ...removed];
            if (keys.length || !currentFolderConfiguration) {
                this.updateFolderConfiguration(resource, folderConfiguration);
            }
            return { keys, overrides };
        }
        compareAndDeleteFolderConfiguration(folder) {
            const folderConfig = this.folderConfigurations.get(folder);
            if (!folderConfig) {
                throw new Error('Unknown folder');
            }
            this.deleteFolderConfiguration(folder);
            const { added, updated, removed, overrides } = compare(folderConfig, undefined);
            return { keys: [...added, ...updated, ...removed], overrides };
        }
        get defaults() {
            return this._defaultConfiguration;
        }
        get applicationConfiguration() {
            return this._applicationConfiguration;
        }
        get userConfiguration() {
            if (!this._userConfiguration) {
                this._userConfiguration = this._remoteUserConfiguration.isEmpty() ? this._localUserConfiguration : this._localUserConfiguration.merge(this._remoteUserConfiguration);
            }
            return this._userConfiguration;
        }
        get localUserConfiguration() {
            return this._localUserConfiguration;
        }
        get remoteUserConfiguration() {
            return this._remoteUserConfiguration;
        }
        get workspaceConfiguration() {
            return this._workspaceConfiguration;
        }
        get folderConfigurations() {
            return this._folderConfigurations;
        }
        getConsolidatedConfigurationModel(section, overrides, workspace) {
            let configurationModel = this.getConsolidatedConfigurationModelForResource(overrides, workspace);
            if (overrides.overrideIdentifier) {
                configurationModel = configurationModel.override(overrides.overrideIdentifier);
            }
            if (!this._policyConfiguration.isEmpty() && this._policyConfiguration.getValue(section) !== undefined) {
                configurationModel = configurationModel.merge(this._policyConfiguration);
            }
            return configurationModel;
        }
        getConsolidatedConfigurationModelForResource({ resource }, workspace) {
            let consolidateConfiguration = this.getWorkspaceConsolidatedConfiguration();
            if (workspace && resource) {
                const root = workspace.getFolder(resource);
                if (root) {
                    consolidateConfiguration = this.getFolderConsolidatedConfiguration(root.uri) || consolidateConfiguration;
                }
                const memoryConfigurationForResource = this._memoryConfigurationByResource.get(resource);
                if (memoryConfigurationForResource) {
                    consolidateConfiguration = consolidateConfiguration.merge(memoryConfigurationForResource);
                }
            }
            return consolidateConfiguration;
        }
        getWorkspaceConsolidatedConfiguration() {
            if (!this._workspaceConsolidatedConfiguration) {
                this._workspaceConsolidatedConfiguration = this._defaultConfiguration.merge(this.applicationConfiguration, this.userConfiguration, this._workspaceConfiguration, this._memoryConfiguration);
            }
            return this._workspaceConsolidatedConfiguration;
        }
        getFolderConsolidatedConfiguration(folder) {
            let folderConsolidatedConfiguration = this._foldersConsolidatedConfigurations.get(folder);
            if (!folderConsolidatedConfiguration) {
                const workspaceConsolidateConfiguration = this.getWorkspaceConsolidatedConfiguration();
                const folderConfiguration = this._folderConfigurations.get(folder);
                if (folderConfiguration) {
                    folderConsolidatedConfiguration = workspaceConsolidateConfiguration.merge(folderConfiguration);
                    this._foldersConsolidatedConfigurations.set(folder, folderConsolidatedConfiguration);
                }
                else {
                    folderConsolidatedConfiguration = workspaceConsolidateConfiguration;
                }
            }
            return folderConsolidatedConfiguration;
        }
        getFolderConfigurationModelForResource(resource, workspace) {
            if (workspace && resource) {
                const root = workspace.getFolder(resource);
                if (root) {
                    return this._folderConfigurations.get(root.uri);
                }
            }
            return undefined;
        }
        toData() {
            return {
                defaults: {
                    contents: this._defaultConfiguration.contents,
                    overrides: this._defaultConfiguration.overrides,
                    keys: this._defaultConfiguration.keys
                },
                policy: {
                    contents: this._policyConfiguration.contents,
                    overrides: this._policyConfiguration.overrides,
                    keys: this._policyConfiguration.keys
                },
                application: {
                    contents: this.applicationConfiguration.contents,
                    overrides: this.applicationConfiguration.overrides,
                    keys: this.applicationConfiguration.keys
                },
                user: {
                    contents: this.userConfiguration.contents,
                    overrides: this.userConfiguration.overrides,
                    keys: this.userConfiguration.keys
                },
                workspace: {
                    contents: this._workspaceConfiguration.contents,
                    overrides: this._workspaceConfiguration.overrides,
                    keys: this._workspaceConfiguration.keys
                },
                folders: [...this._folderConfigurations.keys()].reduce((result, folder) => {
                    const { contents, overrides, keys } = this._folderConfigurations.get(folder);
                    result.push([folder, { contents, overrides, keys }]);
                    return result;
                }, [])
            };
        }
        allKeys() {
            const keys = new Set();
            this._defaultConfiguration.keys.forEach(key => keys.add(key));
            this.userConfiguration.keys.forEach(key => keys.add(key));
            this._workspaceConfiguration.keys.forEach(key => keys.add(key));
            this._folderConfigurations.forEach(folderConfiguration => folderConfiguration.keys.forEach(key => keys.add(key)));
            return [...keys.values()];
        }
        allOverrideIdentifiers() {
            const keys = new Set();
            this._defaultConfiguration.getAllOverrideIdentifiers().forEach(key => keys.add(key));
            this.userConfiguration.getAllOverrideIdentifiers().forEach(key => keys.add(key));
            this._workspaceConfiguration.getAllOverrideIdentifiers().forEach(key => keys.add(key));
            this._folderConfigurations.forEach(folderConfiguration => folderConfiguration.getAllOverrideIdentifiers().forEach(key => keys.add(key)));
            return [...keys.values()];
        }
        getAllKeysForOverrideIdentifier(overrideIdentifier) {
            const keys = new Set();
            this._defaultConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key));
            this.userConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key));
            this._workspaceConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key));
            this._folderConfigurations.forEach(folderConfiguration => folderConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key)));
            return [...keys.values()];
        }
        static parse(data) {
            const defaultConfiguration = this.parseConfigurationModel(data.defaults);
            const policyConfiguration = this.parseConfigurationModel(data.policy);
            const applicationConfiguration = this.parseConfigurationModel(data.application);
            const userConfiguration = this.parseConfigurationModel(data.user);
            const workspaceConfiguration = this.parseConfigurationModel(data.workspace);
            const folders = data.folders.reduce((result, value) => {
                result.set(uri_1.URI.revive(value[0]), this.parseConfigurationModel(value[1]));
                return result;
            }, new map_1.ResourceMap());
            return new Configuration(defaultConfiguration, policyConfiguration, applicationConfiguration, userConfiguration, new ConfigurationModel(), workspaceConfiguration, folders, new ConfigurationModel(), new map_1.ResourceMap());
        }
        static parseConfigurationModel(model) {
            return new ConfigurationModel(model.contents, model.keys, model.overrides);
        }
    }
    exports.Configuration = Configuration;
    function mergeChanges(...changes) {
        if (changes.length === 0) {
            return { keys: [], overrides: [] };
        }
        if (changes.length === 1) {
            return changes[0];
        }
        const keysSet = new Set();
        const overridesMap = new Map();
        for (const change of changes) {
            change.keys.forEach(key => keysSet.add(key));
            change.overrides.forEach(([identifier, keys]) => {
                const result = (0, map_1.getOrSet)(overridesMap, identifier, new Set());
                keys.forEach(key => result.add(key));
            });
        }
        const overrides = [];
        overridesMap.forEach((keys, identifier) => overrides.push([identifier, [...keys.values()]]));
        return { keys: [...keysSet.values()], overrides };
    }
    exports.mergeChanges = mergeChanges;
    class ConfigurationChangeEvent {
        constructor(change, previous, currentConfiguraiton, currentWorkspace) {
            this.change = change;
            this.previous = previous;
            this.currentConfiguraiton = currentConfiguraiton;
            this.currentWorkspace = currentWorkspace;
            this._marker = '\n';
            this._markerCode1 = this._marker.charCodeAt(0);
            this._markerCode2 = '.'.charCodeAt(0);
            this.affectedKeys = new Set();
            this._previousConfiguration = undefined;
            for (const key of change.keys) {
                this.affectedKeys.add(key);
            }
            for (const [, keys] of change.overrides) {
                for (const key of keys) {
                    this.affectedKeys.add(key);
                }
            }
            // Example: '\nfoo.bar\nabc.def\n'
            this._affectsConfigStr = this._marker;
            for (const key of this.affectedKeys) {
                this._affectsConfigStr += key + this._marker;
            }
        }
        get previousConfiguration() {
            if (!this._previousConfiguration && this.previous) {
                this._previousConfiguration = Configuration.parse(this.previous.data);
            }
            return this._previousConfiguration;
        }
        affectsConfiguration(section, overrides) {
            // we have one large string with all keys that have changed. we pad (marker) the section
            // and check that either find it padded or before a segment character
            const needle = this._marker + section;
            const idx = this._affectsConfigStr.indexOf(needle);
            if (idx < 0) {
                // NOT: (marker + section)
                return false;
            }
            const pos = idx + needle.length;
            if (pos >= this._affectsConfigStr.length) {
                return false;
            }
            const code = this._affectsConfigStr.charCodeAt(pos);
            if (code !== this._markerCode1 && code !== this._markerCode2) {
                // NOT: section + (marker | segment)
                return false;
            }
            if (overrides) {
                const value1 = this.previousConfiguration ? this.previousConfiguration.getValue(section, overrides, this.previous?.workspace) : undefined;
                const value2 = this.currentConfiguraiton.getValue(section, overrides, this.currentWorkspace);
                return !objects.equals(value1, value2);
            }
            return true;
        }
    }
    exports.ConfigurationChangeEvent = ConfigurationChangeEvent;
    function compare(from, to) {
        const { added, removed, updated } = compareConfigurationContents(to?.rawConfiguration, from?.rawConfiguration);
        const overrides = [];
        const fromOverrideIdentifiers = from?.getAllOverrideIdentifiers() || [];
        const toOverrideIdentifiers = to?.getAllOverrideIdentifiers() || [];
        if (to) {
            const addedOverrideIdentifiers = toOverrideIdentifiers.filter(key => !fromOverrideIdentifiers.includes(key));
            for (const identifier of addedOverrideIdentifiers) {
                overrides.push([identifier, to.getKeysForOverrideIdentifier(identifier)]);
            }
        }
        if (from) {
            const removedOverrideIdentifiers = fromOverrideIdentifiers.filter(key => !toOverrideIdentifiers.includes(key));
            for (const identifier of removedOverrideIdentifiers) {
                overrides.push([identifier, from.getKeysForOverrideIdentifier(identifier)]);
            }
        }
        if (to && from) {
            for (const identifier of fromOverrideIdentifiers) {
                if (toOverrideIdentifiers.includes(identifier)) {
                    const result = compareConfigurationContents({ contents: from.getOverrideValue(undefined, identifier) || {}, keys: from.getKeysForOverrideIdentifier(identifier) }, { contents: to.getOverrideValue(undefined, identifier) || {}, keys: to.getKeysForOverrideIdentifier(identifier) });
                    overrides.push([identifier, [...result.added, ...result.removed, ...result.updated]]);
                }
            }
        }
        return { added, removed, updated, overrides };
    }
    function compareConfigurationContents(to, from) {
        const added = to
            ? from ? to.keys.filter(key => from.keys.indexOf(key) === -1) : [...to.keys]
            : [];
        const removed = from
            ? to ? from.keys.filter(key => to.keys.indexOf(key) === -1) : [...from.keys]
            : [];
        const updated = [];
        if (to && from) {
            for (const key of from.keys) {
                if (to.keys.indexOf(key) !== -1) {
                    const value1 = (0, configuration_1.getConfigurationValue)(from.contents, key);
                    const value2 = (0, configuration_1.getConfigurationValue)(to.contents, key);
                    if (!objects.equals(value1, value2)) {
                        updated.push(key);
                    }
                }
            }
        }
        return { added, removed, updated };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbk1vZGVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2NvbmZpZ3VyYXRpb24vY29tbW9uL2NvbmZpZ3VyYXRpb25Nb2RlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxTQUFTLE1BQU0sQ0FBSSxJQUFPO1FBQ3pCLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFRRCxNQUFhLGtCQUFrQjtRQUk5QixZQUNrQixZQUFpQixFQUFFLEVBQ25CLFFBQWtCLEVBQUUsRUFDcEIsYUFBMkIsRUFBRSxFQUNyQyxHQUFnRTtZQUh4RCxjQUFTLEdBQVQsU0FBUyxDQUFVO1lBQ25CLFVBQUssR0FBTCxLQUFLLENBQWU7WUFDcEIsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7WUFDckMsUUFBRyxHQUFILEdBQUcsQ0FBNkQ7WUFOekQsMkJBQXNCLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7UUFRaEYsQ0FBQztRQUdELElBQUksZ0JBQWdCO1lBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzVCLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUU7b0JBQ3JCLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ2pELElBQUksR0FBRyxZQUFZLGtCQUFrQixFQUFFOzRCQUN0QyxPQUFPLEdBQUcsQ0FBQzt5QkFDWDt3QkFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNoRCxNQUFNLENBQUMsUUFBUSxDQUFD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