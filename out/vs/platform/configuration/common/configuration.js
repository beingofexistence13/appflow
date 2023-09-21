/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation"], function (require, exports, types, uri_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLanguageTagSettingPlainKey = exports.merge = exports.getConfigurationValue = exports.removeFromValueTree = exports.addToValueTree = exports.toValuesTree = exports.isConfigured = exports.ConfigurationTargetToString = exports.ConfigurationTarget = exports.isConfigurationUpdateOverrides = exports.isConfigurationOverrides = exports.IConfigurationService = void 0;
    exports.IConfigurationService = (0, instantiation_1.createDecorator)('configurationService');
    function isConfigurationOverrides(thing) {
        return thing
            && typeof thing === 'object'
            && (!thing.overrideIdentifier || typeof thing.overrideIdentifier === 'string')
            && (!thing.resource || thing.resource instanceof uri_1.URI);
    }
    exports.isConfigurationOverrides = isConfigurationOverrides;
    function isConfigurationUpdateOverrides(thing) {
        return thing
            && typeof thing === 'object'
            && (!thing.overrideIdentifiers || Array.isArray(thing.overrideIdentifiers))
            && !thing.overrideIdentifier
            && (!thing.resource || thing.resource instanceof uri_1.URI);
    }
    exports.isConfigurationUpdateOverrides = isConfigurationUpdateOverrides;
    var ConfigurationTarget;
    (function (ConfigurationTarget) {
        ConfigurationTarget[ConfigurationTarget["APPLICATION"] = 1] = "APPLICATION";
        ConfigurationTarget[ConfigurationTarget["USER"] = 2] = "USER";
        ConfigurationTarget[ConfigurationTarget["USER_LOCAL"] = 3] = "USER_LOCAL";
        ConfigurationTarget[ConfigurationTarget["USER_REMOTE"] = 4] = "USER_REMOTE";
        ConfigurationTarget[ConfigurationTarget["WORKSPACE"] = 5] = "WORKSPACE";
        ConfigurationTarget[ConfigurationTarget["WORKSPACE_FOLDER"] = 6] = "WORKSPACE_FOLDER";
        ConfigurationTarget[ConfigurationTarget["DEFAULT"] = 7] = "DEFAULT";
        ConfigurationTarget[ConfigurationTarget["MEMORY"] = 8] = "MEMORY";
    })(ConfigurationTarget || (exports.ConfigurationTarget = ConfigurationTarget = {}));
    function ConfigurationTargetToString(configurationTarget) {
        switch (configurationTarget) {
            case 1 /* ConfigurationTarget.APPLICATION */: return 'APPLICATION';
            case 2 /* ConfigurationTarget.USER */: return 'USER';
            case 3 /* ConfigurationTarget.USER_LOCAL */: return 'USER_LOCAL';
            case 4 /* ConfigurationTarget.USER_REMOTE */: return 'USER_REMOTE';
            case 5 /* ConfigurationTarget.WORKSPACE */: return 'WORKSPACE';
            case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */: return 'WORKSPACE_FOLDER';
            case 7 /* ConfigurationTarget.DEFAULT */: return 'DEFAULT';
            case 8 /* ConfigurationTarget.MEMORY */: return 'MEMORY';
        }
    }
    exports.ConfigurationTargetToString = ConfigurationTargetToString;
    function isConfigured(configValue) {
        return configValue.applicationValue !== undefined ||
            configValue.userValue !== undefined ||
            configValue.userLocalValue !== undefined ||
            configValue.userRemoteValue !== undefined ||
            configValue.workspaceValue !== undefined ||
            configValue.workspaceFolderValue !== undefined;
    }
    exports.isConfigured = isConfigured;
    function toValuesTree(properties, conflictReporter) {
        const root = Object.create(null);
        for (const key in properties) {
            addToValueTree(root, key, properties[key], conflictReporter);
        }
        return root;
    }
    exports.toValuesTree = toValuesTree;
    function addToValueTree(settingsTreeRoot, key, value, conflictReporter) {
        const segments = key.split('.');
        const last = segments.pop();
        let curr = settingsTreeRoot;
        for (let i = 0; i < segments.length; i++) {
            const s = segments[i];
            let obj = curr[s];
            switch (typeof obj) {
                case 'undefined':
                    obj = curr[s] = Object.create(null);
                    break;
                case 'object':
                    break;
                default:
                    conflictReporter(`Ignoring ${key} as ${segments.slice(0, i + 1).join('.')} is ${JSON.stringify(obj)}`);
                    return;
            }
            curr = obj;
        }
        if (typeof curr === 'object' && curr !== null) {
            try {
                curr[last] = value; // workaround https://github.com/microsoft/vscode/issues/13606
            }
            catch (e) {
                conflictReporter(`Ignoring ${key} as ${segments.join('.')} is ${JSON.stringify(curr)}`);
            }
        }
        else {
            conflictReporter(`Ignoring ${key} as ${segments.join('.')} is ${JSON.stringify(curr)}`);
        }
    }
    exports.addToValueTree = addToValueTree;
    function removeFromValueTree(valueTree, key) {
        const segments = key.split('.');
        doRemoveFromValueTree(valueTree, segments);
    }
    exports.removeFromValueTree = removeFromValueTree;
    function doRemoveFromValueTree(valueTree, segments) {
        const first = segments.shift();
        if (segments.length === 0) {
            // Reached last segment
            delete valueTree[first];
            return;
        }
        if (Object.keys(valueTree).indexOf(first) !== -1) {
            const value = valueTree[first];
            if (typeof value === 'object' && !Array.isArray(value)) {
                doRemoveFromValueTree(value, segments);
                if (Object.keys(value).length === 0) {
                    delete valueTree[first];
                }
            }
        }
    }
    /**
     * A helper function to get the configuration value with a specific settings path (e.g. config.some.setting)
     */
    function getConfigurationValue(config, settingPath, defaultValue) {
        function accessSetting(config, path) {
            let current = config;
            for (const component of path) {
                if (typeof current !== 'object' || current === null) {
                    return undefined;
                }
                current = current[component];
            }
            return current;
        }
        const path = settingPath.split('.');
        const result = accessSetting(config, path);
        return typeof result === 'undefined' ? defaultValue : result;
    }
    exports.getConfigurationValue = getConfigurationValue;
    function merge(base, add, overwrite) {
        Object.keys(add).forEach(key => {
            if (key !== '__proto__') {
                if (key in base) {
                    if (types.isObject(base[key]) && types.isObject(add[key])) {
                        merge(base[key], add[key], overwrite);
                    }
                    else if (overwrite) {
                        base[key] = add[key];
                    }
                }
                else {
                    base[key] = add[key];
                }
            }
        });
    }
    exports.merge = merge;
    function getLanguageTagSettingPlainKey(settingKey) {
        return settingKey.replace(/[\[\]]/g, '');
    }
    exports.getLanguageTagSettingPlainKey = getLanguageTagSettingPlainKey;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2NvbmZpZ3VyYXRpb24vY29tbW9uL2NvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUW5GLFFBQUEscUJBQXFCLEdBQUcsSUFBQSwrQkFBZSxFQUF3QixzQkFBc0IsQ0FBQyxDQUFDO0lBRXBHLFNBQWdCLHdCQUF3QixDQUFDLEtBQVU7UUFDbEQsT0FBTyxLQUFLO2VBQ1IsT0FBTyxLQUFLLEtBQUssUUFBUTtlQUN6QixDQUFDLENBQUMsS0FBSyxDQUFDLGtCQUFrQixJQUFJLE9BQU8sS0FBSyxDQUFDLGtCQUFrQixLQUFLLFFBQVEsQ0FBQztlQUMzRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsUUFBUSxZQUFZLFNBQUcsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFMRCw0REFLQztJQU9ELFNBQWdCLDhCQUE4QixDQUFDLEtBQVU7UUFDeEQsT0FBTyxLQUFLO2VBQ1IsT0FBTyxLQUFLLEtBQUssUUFBUTtlQUN6QixDQUFDLENBQUMsS0FBSyxDQUFDLG1CQUFtQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7ZUFDeEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCO2VBQ3pCLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLFlBQVksU0FBRyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQU5ELHdFQU1DO0lBSUQsSUFBa0IsbUJBU2pCO0lBVEQsV0FBa0IsbUJBQW1CO1FBQ3BDLDJFQUFlLENBQUE7UUFDZiw2REFBSSxDQUFBO1FBQ0oseUVBQVUsQ0FBQTtRQUNWLDJFQUFXLENBQUE7UUFDWCx1RUFBUyxDQUFBO1FBQ1QscUZBQWdCLENBQUE7UUFDaEIs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