/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/ternarySearchTree", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, event_1, ternarySearchTree_1, configuration_1, configurationRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$G0b = void 0;
    class $G0b {
        constructor(configuration) {
            this.onDidChangeConfigurationEmitter = new event_1.$fd();
            this.onDidChangeConfiguration = this.onDidChangeConfigurationEmitter.event;
            this.b = ternarySearchTree_1.$Hh.forPaths();
            this.c = new Map();
            this.a = configuration || Object.create(null);
        }
        reloadConfiguration() {
            return Promise.resolve(this.getValue());
        }
        getValue(arg1, arg2) {
            let configuration;
            const overrides = (0, configuration_1.$9h)(arg1) ? arg1 : (0, configuration_1.$9h)(arg2) ? arg2 : undefined;
            if (overrides) {
                if (overrides.resource) {
                    configuration = this.b.findSubstr(overrides.resource.fsPath);
                }
            }
            configuration = configuration ? configuration : this.a;
            if (arg1 && typeof arg1 === 'string') {
                return configuration[arg1] ?? (0, configuration_1.$di)(configuration, arg1);
            }
            return configuration;
        }
        updateValue(key, value) {
            return Promise.resolve(undefined);
        }
        setUserConfiguration(key, value, root) {
            if (root) {
                const configForRoot = this.b.get(root.fsPath) || Object.create(null);
                configForRoot[key] = value;
                this.b.set(root.fsPath, configForRoot);
            }
            else {
                this.a[key] = value;
            }
            return Promise.resolve(undefined);
        }
        setOverrideIdentifiers(key, identifiers) {
            this.c.set(key, identifiers);
        }
        inspect(key, overrides) {
            const config = this.getValue(undefined, overrides);
            return {
                value: (0, configuration_1.$di)(config, key),
                defaultValue: (0, configuration_1.$di)(config, key),
                userValue: (0, configuration_1.$di)(config, key),
                overrideIdentifiers: this.c.get(key)
            };
        }
        keys() {
            return {
                default: Object.keys(platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties()),
                user: Object.keys(this.a),
                workspace: [],
                workspaceFolder: []
            };
        }
        getConfigurationData() {
            return null;
        }
    }
    exports.$G0b = $G0b;
});
//# sourceMappingURL=testConfigurationService.js.map