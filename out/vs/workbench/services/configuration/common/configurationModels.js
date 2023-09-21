/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationModels", "vs/base/common/types", "vs/base/common/arrays"], function (require, exports, objects_1, configuration_1, configurationModels_1, types_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Configuration = exports.StandaloneConfigurationModelParser = exports.WorkspaceConfigurationModelParser = void 0;
    class WorkspaceConfigurationModelParser extends configurationModels_1.ConfigurationModelParser {
        constructor(name) {
            super(name);
            this._folders = [];
            this._transient = false;
            this._settingsModelParser = new configurationModels_1.ConfigurationModelParser(name);
            this._launchModel = new configurationModels_1.ConfigurationModel();
            this._tasksModel = new configurationModels_1.ConfigurationModel();
        }
        get folders() {
            return this._folders;
        }
        get transient() {
            return this._transient;
        }
        get settingsModel() {
            return this._settingsModelParser.configurationModel;
        }
        get launchModel() {
            return this._launchModel;
        }
        get tasksModel() {
            return this._tasksModel;
        }
        reparseWorkspaceSettings(configurationParseOptions) {
            this._settingsModelParser.reparse(configurationParseOptions);
        }
        getRestrictedWorkspaceSettings() {
            return this._settingsModelParser.restrictedConfigurations;
        }
        doParseRaw(raw, configurationParseOptions) {
            this._folders = (raw['folders'] || []);
            this._transient = (0, types_1.isBoolean)(raw['transient']) && raw['transient'];
            this._settingsModelParser.parseRaw(raw['settings'], configurationParseOptions);
            this._launchModel = this.createConfigurationModelFrom(raw, 'launch');
            this._tasksModel = this.createConfigurationModelFrom(raw, 'tasks');
            return super.doParseRaw(raw, configurationParseOptions);
        }
        createConfigurationModelFrom(raw, key) {
            const data = raw[key];
            if (data) {
                const contents = (0, configuration_1.toValuesTree)(data, message => console.error(`Conflict in settings file ${this._name}: ${message}`));
                const scopedContents = Object.create(null);
                scopedContents[key] = contents;
                const keys = Object.keys(data).map(k => `${key}.${k}`);
                return new configurationModels_1.ConfigurationModel(scopedContents, keys, []);
            }
            return new configurationModels_1.ConfigurationModel();
        }
    }
    exports.WorkspaceConfigurationModelParser = WorkspaceConfigurationModelParser;
    class StandaloneConfigurationModelParser extends configurationModels_1.ConfigurationModelParser {
        constructor(name, scope) {
            super(name);
            this.scope = scope;
        }
        doParseRaw(raw, configurationParseOptions) {
            const contents = (0, configuration_1.toValuesTree)(raw, message => console.error(`Conflict in settings file ${this._name}: ${message}`));
            const scopedContents = Object.create(null);
            scopedContents[this.scope] = contents;
            const keys = Object.keys(raw).map(key => `${this.scope}.${key}`);
            return { contents: scopedContents, keys, overrides: [] };
        }
    }
    exports.StandaloneConfigurationModelParser = StandaloneConfigurationModelParser;
    class Configuration extends configurationModels_1.Configuration {
        constructor(defaults, policy, application, localUser, remoteUser, workspaceConfiguration, folders, memoryConfiguration, memoryConfigurationByResource, _workspace) {
            super(defaults, policy, application, localUser, remoteUser, workspaceConfiguration, folders, memoryConfiguration, memoryConfigurationByResource);
            this._workspace = _workspace;
        }
        getValue(key, overrides = {}) {
            return super.getValue(key, overrides, this._workspace);
        }
        inspect(key, overrides = {}) {
            return super.inspect(key, overrides, this._workspace);
        }
        keys() {
            return super.keys(this._workspace);
        }
        compareAndDeleteFolderConfiguration(folder) {
            if (this._workspace && this._workspace.folders.length > 0 && this._workspace.folders[0].uri.toString() === folder.toString()) {
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
                    if (!(0, objects_1.equals)(this.getValue(key, { overrideIdentifier }), other.getValue(key, { overrideIdentifier }))) {
                        return true;
                    }
                    // Compare workspace folder value
                    return this._workspace && this._workspace.folders.some(folder => !(0, objects_1.equals)(this.getValue(key, { resource: folder.uri, overrideIdentifier }), other.getValue(key, { resource: folder.uri, overrideIdentifier })));
                }));
                return keys;
            };
            const keys = compare(this.allKeys(), other.allKeys());
            const overrides = [];
            const allOverrideIdentifiers = (0, arrays_1.distinct)([...this.allOverrideIdentifiers(), ...other.allOverrideIdentifiers()]);
            for (const overrideIdentifier of allOverrideIdentifiers) {
                const keys = compare(this.getAllKeysForOverrideIdentifier(overrideIdentifier), other.getAllKeysForOverrideIdentifier(overrideIdentifier), overrideIdentifier);
                if (keys.length) {
                    overrides.push([overrideIdentifier, keys]);
                }
            }
            return { keys, overrides };
        }
    }
    exports.Configuration = Configuration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbk1vZGVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jb25maWd1cmF0aW9uL2NvbW1vbi9jb25maWd1cmF0aW9uTW9kZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFhLGlDQUFrQyxTQUFRLDhDQUF3QjtRQVE5RSxZQUFZLElBQVk7WUFDdkIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBUEwsYUFBUSxHQUE2QixFQUFFLENBQUM7WUFDeEMsZUFBVSxHQUFZLEtBQUssQ0FBQztZQU9uQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSw4Q0FBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksd0NBQWtCLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksd0NBQWtCLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRUQsSUFBSSxPQUFPO1lBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQUksYUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQztRQUNyRCxDQUFDO1FBRUQsSUFBSSxXQUFXO1lBQ2QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzFCLENBQUM7UUFFRCxJQUFJLFVBQVU7WUFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDekIsQ0FBQztRQUVELHdCQUF3QixDQUFDLHlCQUFvRDtZQUM1RSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVELDhC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