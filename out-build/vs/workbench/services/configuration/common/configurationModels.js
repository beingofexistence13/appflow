/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationModels", "vs/base/common/types", "vs/base/common/arrays"], function (require, exports, objects_1, configuration_1, configurationModels_1, types_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$m2b = exports.$l2b = exports.$k2b = void 0;
    class $k2b extends configurationModels_1.$rn {
        constructor(name) {
            super(name);
            this.l = [];
            this.m = false;
            this.n = new configurationModels_1.$rn(name);
            this.p = new configurationModels_1.$qn();
            this.q = new configurationModels_1.$qn();
        }
        get folders() {
            return this.l;
        }
        get transient() {
            return this.m;
        }
        get settingsModel() {
            return this.n.configurationModel;
        }
        get launchModel() {
            return this.p;
        }
        get tasksModel() {
            return this.q;
        }
        reparseWorkspaceSettings(configurationParseOptions) {
            this.n.reparse(configurationParseOptions);
        }
        getRestrictedWorkspaceSettings() {
            return this.n.restrictedConfigurations;
        }
        h(raw, configurationParseOptions) {
            this.l = (raw['folders'] || []);
            this.m = (0, types_1.$pf)(raw['transient']) && raw['transient'];
            this.n.parseRaw(raw['settings'], configurationParseOptions);
            this.p = this.s(raw, 'launch');
            this.q = this.s(raw, 'tasks');
            return super.h(raw, configurationParseOptions);
        }
        s(raw, key) {
            const data = raw[key];
            if (data) {
                const contents = (0, configuration_1.$ai)(data, message => console.error(`Conflict in settings file ${this.f}: ${message}`));
                const scopedContents = Object.create(null);
                scopedContents[key] = contents;
                const keys = Object.keys(data).map(k => `${key}.${k}`);
                return new configurationModels_1.$qn(scopedContents, keys, []);
            }
            return new configurationModels_1.$qn();
        }
    }
    exports.$k2b = $k2b;
    class $l2b extends configurationModels_1.$rn {
        constructor(name, l) {
            super(name);
            this.l = l;
        }
        h(raw, configurationParseOptions) {
            const contents = (0, configuration_1.$ai)(raw, message => console.error(`Conflict in settings file ${this.f}: ${message}`));
            const scopedContents = Object.create(null);
            scopedContents[this.l] = contents;
            const keys = Object.keys(raw).map(key => `${this.l}.${key}`);
            return { contents: scopedContents, keys, overrides: [] };
        }
    }
    exports.$l2b = $l2b;
    class $m2b extends configurationModels_1.$tn {
        constructor(defaults, policy, application, localUser, remoteUser, workspaceConfiguration, folders, memoryConfiguration, memoryConfigurationByResource, y) {
            super(defaults, policy, application, localUser, remoteUser, workspaceConfiguration, folders, memoryConfiguration, memoryConfigurationByResource);
            this.y = y;
        }
        getValue(key, overrides = {}) {
            return super.getValue(key, overrides, this.y);
        }
        inspect(key, overrides = {}) {
            return super.inspect(key, overrides, this.y);
        }
        keys() {
            return super.keys(this.y);
        }
        compareAndDeleteFolderConfiguration(folder) {
            if (this.y && this.y.folders.length > 0 && this.y.folders[0].uri.toString() === folder.toString()) {
                // Do not remove workspace configuration
                return { keys: [], overrides: [] };
            }
            return super.compareAndDeleteFolderConfiguration(folder);
        }
        compare(other) {
            const compare = (fromKeys, toKeys, overrideIdentifier) => {
                const keys = [];
                keys.push(...toKeys.filter(key => fromKeys.indexOf(key) === -1));
                keys.push(...fromKeys.filter(key => toKeys.indexOf(key) === -1));
                keys.push(...fromKeys.filter(key => {
                    // Ignore if the key does not exist in both models
                    if (toKeys.indexOf(key) === -1) {
                        return false;
                    }
                    // Compare workspace value
                    if (!(0, objects_1.$Zm)(this.getValue(key, { overrideIdentifier }), other.getValue(key, { overrideIdentifier }))) {
                        return true;
                    }
                    // Compare workspace folder value
                    return this.y && this.y.folders.some(folder => !(0, objects_1.$Zm)(this.getValue(key, { resource: folder.uri, overrideIdentifier }), other.getValue(key, { resource: folder.uri, overrideIdentifier })));
                }));
                return keys;
            };
            const keys = compare(this.allKeys(), other.allKeys());
            const overrides = [];
            const allOverrideIdentifiers = (0, arrays_1.$Kb)([...this.v(), ...other.v()]);
            for (const overrideIdentifier of allOverrideIdentifiers) {
                const keys = compare(this.w(overrideIdentifier), other.w(overrideIdentifier), overrideIdentifier);
                if (keys.length) {
                    overrides.push([overrideIdentifier, keys]);
                }
            }
            return { keys, overrides };
        }
    }
    exports.$m2b = $m2b;
});
//# sourceMappingURL=configurationModels.js.map