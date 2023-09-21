/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, arrays, event_1, json, lifecycle_1, map_1, objects, types, uri_1, configuration_1, configurationRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vn = exports.$un = exports.$tn = exports.$sn = exports.$rn = exports.$qn = void 0;
    function freeze(data) {
        return Object.isFrozen(data) ? data : objects.$Wm(data);
    }
    class $qn {
        constructor(b = {}, c = [], d = [], raw) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.raw = raw;
            this.a = new Map();
        }
        get rawConfiguration() {
            if (!this.f) {
                if (this.raw?.length) {
                    const rawConfigurationModels = this.raw.map(raw => {
                        if (raw instanceof $qn) {
                            return raw;
                        }
                        const parser = new $rn('');
                        parser.parseRaw(raw);
                        return parser.configurationModel;
                    });
                    this.f = rawConfigurationModels.reduce((previous, current) => current === previous ? current : previous.merge(current), rawConfigurationModels[0]);
                }
                else {
                    // raw is same as current
                    this.f = this;
                }
            }
            return this.f;
        }
        get contents() {
            return this.b;
        }
        get overrides() {
            return this.d;
        }
        get keys() {
            return this.c;
        }
        isEmpty() {
            return this.c.length === 0 && Object.keys(this.b).length === 0 && this.d.length === 0;
        }
        getValue(section) {
            return section ? (0, configuration_1.$di)(this.contents, section) : this.contents;
        }
        inspect(section, overrideIdentifier) {
            const value = this.rawConfiguration.getValue(section);
            const override = overrideIdentifier ? this.rawConfiguration.getOverrideValue(section, overrideIdentifier) : undefined;
            const merged = overrideIdentifier ? this.rawConfiguration.override(overrideIdentifier).getValue(section) : value;
            return { value, override, merged };
        }
        getOverrideValue(section, overrideIdentifier) {
            const overrideContents = this.i(overrideIdentifier);
            return overrideContents
                ? section ? (0, configuration_1.$di)(overrideContents, section) : overrideContents
                : undefined;
        }
        getKeysForOverrideIdentifier(identifier) {
            const keys = [];
            for (const override of this.overrides) {
                if (override.identifiers.includes(identifier)) {
                    keys.push(...override.keys);
                }
            }
            return arrays.$Kb(keys);
        }
        getAllOverrideIdentifiers() {
            const result = [];
            for (const override of this.overrides) {
                result.push(...override.identifiers);
            }
            return arrays.$Kb(result);
        }
        override(identifier) {
            let overrideConfigurationModel = this.a.get(identifier);
            if (!overrideConfigurationModel) {
                overrideConfigurationModel = this.g(identifier);
                this.a.set(identifier, overrideConfigurationModel);
            }
            return overrideConfigurationModel;
        }
        merge(...others) {
            const contents = objects.$Vm(this.contents);
            const overrides = objects.$Vm(this.overrides);
            const keys = [...this.keys];
            const raws = this.raw?.length ? [...this.raw] : [this];
            for (const other of others) {
                raws.push(...(other.raw?.length ? other.raw : [other]));
                if (other.isEmpty()) {
                    continue;
                }
                this.h(contents, other.contents);
                for (const otherOverride of other.overrides) {
                    const [override] = overrides.filter(o => arrays.$sb(o.identifiers, otherOverride.identifiers));
                    if (override) {
                        this.h(override.contents, otherOverride.contents);
                        override.keys.push(...otherOverride.keys);
                        override.keys = arrays.$Kb(override.keys);
                    }
                    else {
                        overrides.push(objects.$Vm(otherOverride));
                    }
                }
                for (const key of other.keys) {
                    if (keys.indexOf(key) === -1) {
                        keys.push(key);
                    }
                }
            }
            return new $qn(contents, keys, overrides, raws.every(raw => raw instanceof $qn) ? undefined : raws);
        }
        g(identifier) {
            const overrideContents = this.i(identifier);
            if (!overrideContents || typeof overrideContents !== 'object' || !Object.keys(overrideContents).length) {
                // If there are no valid overrides, return self
                return this;
            }
            const contents = {};
            for (const key of arrays.$Kb([...Object.keys(this.contents), ...Object.keys(overrideContents)])) {
                let contentsForKey = this.contents[key];
                const overrideContentsForKey = overrideContents[key];
                // If there are override contents for the key, clone and merge otherwise use base contents
                if (overrideContentsForKey) {
                    // Clone and merge only if base contents and override contents are of type object otherwise just override
                    if (typeof contentsForKey === 'object' && typeof overrideContentsForKey === 'object') {
                        contentsForKey = objects.$Vm(contentsForKey);
                        this.h(contentsForKey, overrideContentsForKey);
                    }
                    else {
                        contentsForKey = overrideContentsForKey;
                    }
                }
                contents[key] = contentsForKey;
            }
            return new $qn(contents, this.keys, this.overrides);
        }
        h(source, target) {
            for (const key of Object.keys(target)) {
                if (key in source) {
                    if (types.$lf(source[key]) && types.$lf(target[key])) {
                        this.h(source[key], target[key]);
                        continue;
                    }
                }
                source[key] = objects.$Vm(target[key]);
            }
        }
        i(identifier) {
            let contentsForIdentifierOnly = null;
            let contents = null;
            const mergeContents = (contentsToMerge) => {
                if (contentsToMerge) {
                    if (contents) {
                        this.h(contents, contentsToMerge);
                    }
                    else {
                        contents = objects.$Vm(contentsToMerge);
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
            this.j(key, value, true);
        }
        setValue(key, value) {
            this.j(key, value, false);
        }
        removeValue(key) {
            const index = this.keys.indexOf(key);
            if (index === -1) {
                return;
            }
            this.keys.splice(index, 1);
            (0, configuration_1.$ci)(this.contents, key);
            if (configurationRegistry_1.$kn.test(key)) {
                this.overrides.splice(this.overrides.findIndex(o => arrays.$sb(o.identifiers, (0, configurationRegistry_1.$ln)(key))), 1);
            }
        }
        j(key, value, add) {
            (0, configuration_1.$bi)(this.contents, key, value, e => console.error(e));
            add = add || this.keys.indexOf(key) === -1;
            if (add) {
                this.keys.push(key);
            }
            if (configurationRegistry_1.$kn.test(key)) {
                this.overrides.push({
                    identifiers: (0, configurationRegistry_1.$ln)(key),
                    keys: Object.keys(this.contents[key]),
                    contents: (0, configuration_1.$ai)(this.contents[key], message => console.error(message)),
                });
            }
        }
    }
    exports.$qn = $qn;
    class $rn {
        constructor(f) {
            this.f = f;
            this.a = null;
            this.b = null;
            this.c = [];
            this.d = [];
        }
        get configurationModel() {
            return this.b || new $qn();
        }
        get restrictedConfigurations() {
            return this.c;
        }
        get errors() {
            return this.d;
        }
        parse(content, options) {
            if (!types.$sf(content)) {
                const raw = this.g(content);
                this.parseRaw(raw, options);
            }
        }
        reparse(options) {
            if (this.a) {
                this.parseRaw(this.a, options);
            }
        }
        parseRaw(raw, options) {
            this.a = raw;
            const { contents, keys, overrides, restricted, hasExcludedProperties } = this.h(raw, options);
            this.b = new $qn(contents, keys, overrides, hasExcludedProperties ? [raw] : undefined /* raw has not changed */);
            this.c = restricted || [];
        }
        g(content) {
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
                    json.$Sm(content, visitor);
                    raw = currentParent[0] || {};
                }
                catch (e) {
                    console.error(`Error while parsing settings file ${this.f}: ${e}`);
                    this.d = [e];
                }
            }
            return raw;
        }
        h(raw, options) {
            const configurationProperties = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
            const filtered = this.i(raw, configurationProperties, true, options);
            raw = filtered.raw;
            const contents = (0, configuration_1.$ai)(raw, message => console.error(`Conflict in settings file ${this.f}: ${message}`));
            const keys = Object.keys(raw);
            const overrides = this.j(raw, message => console.error(`Conflict in settings file ${this.f}: ${message}`));
            return { contents, keys, overrides, restricted: filtered.restricted, hasExcludedProperties: filtered.hasExcludedProperties };
        }
        i(properties, configurationProperties, filterOverriddenProperties, options) {
            let hasExcludedProperties = false;
            if (!options?.scopes && !options?.skipRestricted && !options?.exclude?.length) {
                return { raw: properties, restricted: [], hasExcludedProperties };
            }
            const raw = {};
            const restricted = [];
            for (const key in properties) {
                if (configurationRegistry_1.$kn.test(key) && filterOverriddenProperties) {
                    const result = this.i(properties[key], configurationProperties, false, options);
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
        j(raw, conflictReporter) {
            const overrides = [];
            for (const key of Object.keys(raw)) {
                if (configurationRegistry_1.$kn.test(key)) {
                    const overrideRaw = {};
                    for (const keyInOverrideRaw in raw[key]) {
                        overrideRaw[keyInOverrideRaw] = raw[key][keyInOverrideRaw];
                    }
                    overrides.push({
                        identifiers: (0, configurationRegistry_1.$ln)(key),
                        keys: Object.keys(overrideRaw),
                        contents: (0, configuration_1.$ai)(overrideRaw, conflictReporter)
                    });
                }
            }
            return overrides;
        }
    }
    exports.$rn = $rn;
    class $sn extends lifecycle_1.$kc {
        constructor(c, f, extUri, g) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.a = new $rn(this.c.toString());
            this.B(this.g.watch(extUri.dirname(this.c)));
            // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
            this.B(this.g.watch(this.c));
            this.B(event_1.Event.any(event_1.Event.filter(this.g.onDidFilesChange, e => e.contains(this.c)), event_1.Event.filter(this.g.onDidRunOperation, e => (e.isOperation(0 /* FileOperation.CREATE */) || e.isOperation(3 /* FileOperation.COPY */) || e.isOperation(1 /* FileOperation.DELETE */) || e.isOperation(4 /* FileOperation.WRITE */)) && extUri.isEqual(e.resource, c)))(() => this.b.fire()));
        }
        async loadConfiguration() {
            try {
                const content = await this.g.readFile(this.c);
                this.a.parse(content.value.toString() || '{}', this.f);
                return this.a.configurationModel;
            }
            catch (e) {
                return new $qn();
            }
        }
        reparse(parseOptions) {
            if (parseOptions) {
                this.f = parseOptions;
            }
            this.a.reparse(this.f);
            return this.a.configurationModel;
        }
        getRestrictedSettings() {
            return this.a.restrictedConfigurations;
        }
    }
    exports.$sn = $sn;
    class ConfigurationInspectValue {
        constructor(a, b, c, overrideIdentifiers, d, f, g, h, i, j, k, l, m) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.overrideIdentifiers = overrideIdentifiers;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
        }
        get value() {
            return freeze(this.c);
        }
        n(model, section, overrideIdentifier) {
            const inspectValue = model.inspect(section, overrideIdentifier);
            return {
                get value() { return freeze(inspectValue.value); },
                get override() { return freeze(inspectValue.override); },
                get merged() { return freeze(inspectValue.merged); }
            };
        }
        get q() {
            if (!this.p) {
                this.p = this.n(this.d, this.a, this.b.overrideIdentifier);
            }
            return this.p;
        }
        get defaultValue() {
            return this.q.merged;
        }
        get default() {
            return this.q.value !== undefined || this.q.override !== undefined ? { value: this.q.value, override: this.q.override } : undefined;
        }
        get s() {
            if (this.r === undefined) {
                this.r = this.f ? this.n(this.f, this.a) : null;
            }
            return this.r;
        }
        get policyValue() {
            return this.s?.merged;
        }
        get policy() {
            return this.s?.value !== undefined ? { value: this.s.value } : undefined;
        }
        get u() {
            if (this.t === undefined) {
                this.t = this.g ? this.n(this.g, this.a) : null;
            }
            return this.t;
        }
        get applicationValue() {
            return this.u?.merged;
        }
        get application() {
            return this.u?.value !== undefined || this.u?.override !== undefined ? { value: this.u.value, override: this.u.override } : undefined;
        }
        get w() {
            if (!this.v) {
                this.v = this.n(this.h, this.a, this.b.overrideIdentifier);
            }
            return this.v;
        }
        get userValue() {
            return this.w.merged;
        }
        get user() {
            return this.w.value !== undefined || this.w.override !== undefined ? { value: this.w.value, override: this.w.override } : undefined;
        }
        get y() {
            if (!this.x) {
                this.x = this.n(this.i, this.a, this.b.overrideIdentifier);
            }
            return this.x;
        }
        get userLocalValue() {
            return this.y.merged;
        }
        get userLocal() {
            return this.y.value !== undefined || this.y.override !== undefined ? { value: this.y.value, override: this.y.override } : undefined;
        }
        get A() {
            if (!this.z) {
                this.z = this.n(this.j, this.a, this.b.overrideIdentifier);
            }
            return this.z;
        }
        get userRemoteValue() {
            return this.A.merged;
        }
        get userRemote() {
            return this.A.value !== undefined || this.A.override !== undefined ? { value: this.A.value, override: this.A.override } : undefined;
        }
        get D() {
            if (this.B === undefined) {
                this.B = this.k ? this.n(this.k, this.a, this.b.overrideIdentifier) : null;
            }
            return this.B;
        }
        get workspaceValue() {
            return this.D?.merged;
        }
        get workspace() {
            return this.D?.value !== undefined || this.D?.override !== undefined ? { value: this.D.value, override: this.D.override } : undefined;
        }
        get F() {
            if (this.E === undefined) {
                this.E = this.l ? this.n(this.l, this.a, this.b.overrideIdentifier) : null;
            }
            return this.E;
        }
        get workspaceFolderValue() {
            return this.F?.merged;
        }
        get workspaceFolder() {
            return this.F?.value !== undefined || this.F?.override !== undefined ? { value: this.F.value, override: this.F.override } : undefined;
        }
        get H() {
            if (this.G === undefined) {
                this.G = this.n(this.m, this.a, this.b.overrideIdentifier);
            }
            return this.G;
        }
        get memoryValue() {
            return this.H.merged;
        }
        get memory() {
            return this.H.value !== undefined || this.H.override !== undefined ? { value: this.H.value, override: this.H.override } : undefined;
        }
    }
    class $tn {
        constructor(c, d, f, g, h = new $qn(), i = new $qn(), j = new map_1.$zi(), l = new $qn(), m = new map_1.$zi()) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.l = l;
            this.m = m;
            this.a = null;
            this.b = new map_1.$zi();
            this.n = null;
        }
        getValue(section, overrides, workspace) {
            const consolidateConfigurationModel = this.q(section, overrides, workspace);
            return consolidateConfigurationModel.getValue(section);
        }
        updateValue(key, value, overrides = {}) {
            let memoryConfiguration;
            if (overrides.resource) {
                memoryConfiguration = this.m.get(overrides.resource);
                if (!memoryConfiguration) {
                    memoryConfiguration = new $qn();
                    this.m.set(overrides.resource, memoryConfiguration);
                }
            }
            else {
                memoryConfiguration = this.l;
            }
            if (value === undefined) {
                memoryConfiguration.removeValue(key);
            }
            else {
                memoryConfiguration.setValue(key, value);
            }
            if (!overrides.resource) {
                this.a = null;
            }
        }
        inspect(key, overrides, workspace) {
            const consolidateConfigurationModel = this.q(key, overrides, workspace);
            const folderConfigurationModel = this.u(overrides.resource, workspace);
            const memoryConfigurationModel = overrides.resource ? this.m.get(overrides.resource) || this.l : this.l;
            const overrideIdentifiers = new Set();
            for (const override of consolidateConfigurationModel.overrides) {
                for (const overrideIdentifier of override.identifiers) {
                    if (consolidateConfigurationModel.getOverrideValue(key, overrideIdentifier) !== undefined) {
                        overrideIdentifiers.add(overrideIdentifier);
                    }
                }
            }
            return new ConfigurationInspectValue(key, overrides, consolidateConfigurationModel.getValue(key), overrideIdentifiers.size ? [...overrideIdentifiers] : undefined, this.c, this.d.isEmpty() ? undefined : this.d, this.applicationConfiguration.isEmpty() ? undefined : this.applicationConfiguration, this.userConfiguration, this.localUserConfiguration, this.remoteUserConfiguration, workspace ? this.i : undefined, folderConfigurationModel ? folderConfigurationModel : undefined, memoryConfigurationModel);
        }
        keys(workspace) {
            const folderConfigurationModel = this.u(undefined, workspace);
            return {
                default: this.c.keys.slice(0),
                user: this.userConfiguration.keys.slice(0),
                workspace: this.i.keys.slice(0),
                workspaceFolder: folderConfigurationModel ? folderConfigurationModel.keys.slice(0) : []
            };
        }
        updateDefaultConfiguration(defaultConfiguration) {
            this.c = defaultConfiguration;
            this.a = null;
            this.b.clear();
        }
        updatePolicyConfiguration(policyConfiguration) {
            this.d = policyConfiguration;
        }
        updateApplicationConfiguration(applicationConfiguration) {
            this.f = applicationConfiguration;
            this.a = null;
            this.b.clear();
        }
        updateLocalUserConfiguration(localUserConfiguration) {
            this.g = localUserConfiguration;
            this.n = null;
            this.a = null;
            this.b.clear();
        }
        updateRemoteUserConfiguration(remoteUserConfiguration) {
            this.h = remoteUserConfiguration;
            this.n = null;
            this.a = null;
            this.b.clear();
        }
        updateWorkspaceConfiguration(workspaceConfiguration) {
            this.i = workspaceConfiguration;
            this.a = null;
            this.b.clear();
        }
        updateFolderConfiguration(resource, configuration) {
            this.j.set(resource, configuration);
            this.b.delete(resource);
        }
        deleteFolderConfiguration(resource) {
            this.p.delete(resource);
            this.b.delete(resource);
        }
        compareAndUpdateDefaultConfiguration(defaults, keys) {
            const overrides = [];
            if (!keys) {
                const { added, updated, removed } = compare(this.c, defaults);
                keys = [...added, ...updated, ...removed];
            }
            for (const key of keys) {
                for (const overrideIdentifier of (0, configurationRegistry_1.$ln)(key)) {
                    const fromKeys = this.c.getKeysForOverrideIdentifier(overrideIdentifier);
                    const toKeys = defaults.getKeysForOverrideIdentifier(overrideIdentifier);
                    const keys = [
                        ...toKeys.filter(key => fromKeys.indexOf(key) === -1),
                        ...fromKeys.filter(key => toKeys.indexOf(key) === -1),
                        ...fromKeys.filter(key => !objects.$Zm(this.c.override(overrideIdentifier).getValue(key), defaults.override(overrideIdentifier).getValue(key)))
                    ];
                    overrides.push([overrideIdentifier, keys]);
                }
            }
            this.updateDefaultConfiguration(defaults);
            return { keys, overrides };
        }
        compareAndUpdatePolicyConfiguration(policyConfiguration) {
            const { added, updated, removed } = compare(this.d, policyConfiguration);
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
            const currentFolderConfiguration = this.p.get(resource);
            const { added, updated, removed, overrides } = compare(currentFolderConfiguration, folderConfiguration);
            const keys = [...added, ...updated, ...removed];
            if (keys.length || !currentFolderConfiguration) {
                this.updateFolderConfiguration(resource, folderConfiguration);
            }
            return { keys, overrides };
        }
        compareAndDeleteFolderConfiguration(folder) {
            const folderConfig = this.p.get(folder);
            if (!folderConfig) {
                throw new Error('Unknown folder');
            }
            this.deleteFolderConfiguration(folder);
            const { added, updated, removed, overrides } = compare(folderConfig, undefined);
            return { keys: [...added, ...updated, ...removed], overrides };
        }
        get defaults() {
            return this.c;
        }
        get applicationConfiguration() {
            return this.f;
        }
        get userConfiguration() {
            if (!this.n) {
                this.n = this.h.isEmpty() ? this.g : this.g.merge(this.h);
            }
            return this.n;
        }
        get localUserConfiguration() {
            return this.g;
        }
        get remoteUserConfiguration() {
            return this.h;
        }
        get workspaceConfiguration() {
            return this.i;
        }
        get p() {
            return this.j;
        }
        q(section, overrides, workspace) {
            let configurationModel = this.r(overrides, workspace);
            if (overrides.overrideIdentifier) {
                configurationModel = configurationModel.override(overrides.overrideIdentifier);
            }
            if (!this.d.isEmpty() && this.d.getValue(section) !== undefined) {
                configurationModel = configurationModel.merge(this.d);
            }
            return configurationModel;
        }
        r({ resource }, workspace) {
            let consolidateConfiguration = this.s();
            if (workspace && resource) {
                const root = workspace.getFolder(resource);
                if (root) {
                    consolidateConfiguration = this.t(root.uri) || consolidateConfiguration;
                }
                const memoryConfigurationForResource = this.m.get(resource);
                if (memoryConfigurationForResource) {
                    consolidateConfiguration = consolidateConfiguration.merge(memoryConfigurationForResource);
                }
            }
            return consolidateConfiguration;
        }
        s() {
            if (!this.a) {
                this.a = this.c.merge(this.applicationConfiguration, this.userConfiguration, this.i, this.l);
            }
            return this.a;
        }
        t(folder) {
            let folderConsolidatedConfiguration = this.b.get(folder);
            if (!folderConsolidatedConfiguration) {
                const workspaceConsolidateConfiguration = this.s();
                const folderConfiguration = this.j.get(folder);
                if (folderConfiguration) {
                    folderConsolidatedConfiguration = workspaceConsolidateConfiguration.merge(folderConfiguration);
                    this.b.set(folder, folderConsolidatedConfiguration);
                }
                else {
                    folderConsolidatedConfiguration = workspaceConsolidateConfiguration;
                }
            }
            return folderConsolidatedConfiguration;
        }
        u(resource, workspace) {
            if (workspace && resource) {
                const root = workspace.getFolder(resource);
                if (root) {
                    return this.j.get(root.uri);
                }
            }
            return undefined;
        }
        toData() {
            return {
                defaults: {
                    contents: this.c.contents,
                    overrides: this.c.overrides,
                    keys: this.c.keys
                },
                policy: {
                    contents: this.d.contents,
                    overrides: this.d.overrides,
                    keys: this.d.keys
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
                    contents: this.i.contents,
                    overrides: this.i.overrides,
                    keys: this.i.keys
                },
                folders: [...this.j.keys()].reduce((result, folder) => {
                    const { contents, overrides, keys } = this.j.get(folder);
                    result.push([folder, { contents, overrides, keys }]);
                    return result;
                }, [])
            };
        }
        allKeys() {
            const keys = new Set();
            this.c.keys.forEach(key => keys.add(key));
            this.userConfiguration.keys.forEach(key => keys.add(key));
            this.i.keys.forEach(key => keys.add(key));
            this.j.forEach(folderConfiguration => folderConfiguration.keys.forEach(key => keys.add(key)));
            return [...keys.values()];
        }
        v() {
            const keys = new Set();
            this.c.getAllOverrideIdentifiers().forEach(key => keys.add(key));
            this.userConfiguration.getAllOverrideIdentifiers().forEach(key => keys.add(key));
            this.i.getAllOverrideIdentifiers().forEach(key => keys.add(key));
            this.j.forEach(folderConfiguration => folderConfiguration.getAllOverrideIdentifiers().forEach(key => keys.add(key)));
            return [...keys.values()];
        }
        w(overrideIdentifier) {
            const keys = new Set();
            this.c.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key));
            this.userConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key));
            this.i.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key));
            this.j.forEach(folderConfiguration => folderConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach(key => keys.add(key)));
            return [...keys.values()];
        }
        static parse(data) {
            const defaultConfiguration = this.x(data.defaults);
            const policyConfiguration = this.x(data.policy);
            const applicationConfiguration = this.x(data.application);
            const userConfiguration = this.x(data.user);
            const workspaceConfiguration = this.x(data.workspace);
            const folders = data.folders.reduce((result, value) => {
                result.set(uri_1.URI.revive(value[0]), this.x(value[1]));
                return result;
            }, new map_1.$zi());
            return new $tn(defaultConfiguration, policyConfiguration, applicationConfiguration, userConfiguration, new $qn(), workspaceConfiguration, folders, new $qn(), new map_1.$zi());
        }
        static x(model) {
            return new $qn(model.contents, model.keys, model.overrides);
        }
    }
    exports.$tn = $tn;
    function $un(...changes) {
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
                const result = (0, map_1.$wi)(overridesMap, identifier, new Set());
                keys.forEach(key => result.add(key));
            });
        }
        const overrides = [];
        overridesMap.forEach((keys, identifier) => overrides.push([identifier, [...keys.values()]]));
        return { keys: [...keysSet.values()], overrides };
    }
    exports.$un = $un;
    class $vn {
        constructor(change, f, g, h) {
            this.change = change;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = '\n';
            this.b = this.a.charCodeAt(0);
            this.c = '.'.charCodeAt(0);
            this.affectedKeys = new Set();
            this.i = undefined;
            for (const key of change.keys) {
                this.affectedKeys.add(key);
            }
            for (const [, keys] of change.overrides) {
                for (const key of keys) {
                    this.affectedKeys.add(key);
                }
            }
            // Example: '\nfoo.bar\nabc.def\n'
            this.d = this.a;
            for (const key of this.affectedKeys) {
                this.d += key + this.a;
            }
        }
        get previousConfiguration() {
            if (!this.i && this.f) {
                this.i = $tn.parse(this.f.data);
            }
            return this.i;
        }
        affectsConfiguration(section, overrides) {
            // we have one large string with all keys that have changed. we pad (marker) the section
            // and check that either find it padded or before a segment character
            const needle = this.a + section;
            const idx = this.d.indexOf(needle);
            if (idx < 0) {
                // NOT: (marker + section)
                return false;
            }
            const pos = idx + needle.length;
            if (pos >= this.d.length) {
                return false;
            }
            const code = this.d.charCodeAt(pos);
            if (code !== this.b && code !== this.c) {
                // NOT: section + (marker | segment)
                return false;
            }
            if (overrides) {
                const value1 = this.previousConfiguration ? this.previousConfiguration.getValue(section, overrides, this.f?.workspace) : undefined;
                const value2 = this.g.getValue(section, overrides, this.h);
                return !objects.$Zm(value1, value2);
            }
            return true;
        }
    }
    exports.$vn = $vn;
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
                    const value1 = (0, configuration_1.$di)(from.contents, key);
                    const value2 = (0, configuration_1.$di)(to.contents, key);
                    if (!objects.$Zm(value1, value2)) {
                        updated.push(key);
                    }
                }
            }
        }
        return { added, removed, updated };
    }
});
//# sourceMappingURL=configurationModels.js.map