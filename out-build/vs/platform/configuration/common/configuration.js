/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation"], function (require, exports, types, uri_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fi = exports.$ei = exports.$di = exports.$ci = exports.$bi = exports.$ai = exports.$_h = exports.$$h = exports.ConfigurationTarget = exports.$0h = exports.$9h = exports.$8h = void 0;
    exports.$8h = (0, instantiation_1.$Bh)('configurationService');
    function $9h(thing) {
        return thing
            && typeof thing === 'object'
            && (!thing.overrideIdentifier || typeof thing.overrideIdentifier === 'string')
            && (!thing.resource || thing.resource instanceof uri_1.URI);
    }
    exports.$9h = $9h;
    function $0h(thing) {
        return thing
            && typeof thing === 'object'
            && (!thing.overrideIdentifiers || Array.isArray(thing.overrideIdentifiers))
            && !thing.overrideIdentifier
            && (!thing.resource || thing.resource instanceof uri_1.URI);
    }
    exports.$0h = $0h;
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
    function $$h(configurationTarget) {
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
    exports.$$h = $$h;
    function $_h(configValue) {
        return configValue.applicationValue !== undefined ||
            configValue.userValue !== undefined ||
            configValue.userLocalValue !== undefined ||
            configValue.userRemoteValue !== undefined ||
            configValue.workspaceValue !== undefined ||
            configValue.workspaceFolderValue !== undefined;
    }
    exports.$_h = $_h;
    function $ai(properties, conflictReporter) {
        const root = Object.create(null);
        for (const key in properties) {
            $bi(root, key, properties[key], conflictReporter);
        }
        return root;
    }
    exports.$ai = $ai;
    function $bi(settingsTreeRoot, key, value, conflictReporter) {
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
    exports.$bi = $bi;
    function $ci(valueTree, key) {
        const segments = key.split('.');
        doRemoveFromValueTree(valueTree, segments);
    }
    exports.$ci = $ci;
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
    function $di(config, settingPath, defaultValue) {
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
    exports.$di = $di;
    function $ei(base, add, overwrite) {
        Object.keys(add).forEach(key => {
            if (key !== '__proto__') {
                if (key in base) {
                    if (types.$lf(base[key]) && types.$lf(add[key])) {
                        $ei(base[key], add[key], overwrite);
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
    exports.$ei = $ei;
    function $fi(settingKey) {
        return settingKey.replace(/[\[\]]/g, '');
    }
    exports.$fi = $fi;
});
//# sourceMappingURL=configuration.js.map