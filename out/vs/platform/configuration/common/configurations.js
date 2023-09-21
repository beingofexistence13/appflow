/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/types", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configurationRegistry", "vs/platform/log/common/log", "vs/platform/policy/common/policy", "vs/platform/registry/common/platform"], function (require, exports, arrays_1, event_1, lifecycle_1, objects_1, types_1, configurationModels_1, configurationRegistry_1, log_1, policy_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PolicyConfiguration = exports.NullPolicyConfiguration = exports.DefaultConfiguration = void 0;
    class DefaultConfiguration extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this._configurationModel = new configurationModels_1.ConfigurationModel();
        }
        get configurationModel() {
            return this._configurationModel;
        }
        async initialize() {
            this.resetConfigurationModel();
            this._register(platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).onDidUpdateConfiguration(({ properties, defaultsOverrides }) => this.onDidUpdateConfiguration(Array.from(properties), defaultsOverrides)));
            return this.configurationModel;
        }
        reload() {
            this.resetConfigurationModel();
            return this.configurationModel;
        }
        onDidUpdateConfiguration(properties, defaultsOverrides) {
            this.updateConfigurationModel(properties, platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties());
            this._onDidChangeConfiguration.fire({ defaults: this.configurationModel, properties });
        }
        getConfigurationDefaultOverrides() {
            return {};
        }
        resetConfigurationModel() {
            this._configurationModel = new configurationModels_1.ConfigurationModel();
            const properties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            this.updateConfigurationModel(Object.keys(properties), properties);
        }
        updateConfigurationModel(properties, configurationProperties) {
            const configurationDefaultsOverrides = this.getConfigurationDefaultOverrides();
            for (const key of properties) {
                const defaultOverrideValue = configurationDefaultsOverrides[key];
                const propertySchema = configurationProperties[key];
                if (defaultOverrideValue !== undefined) {
                    this._configurationModel.addValue(key, defaultOverrideValue);
                }
                else if (propertySchema) {
                    this._configurationModel.addValue(key, propertySchema.default);
                }
                else {
                    this._configurationModel.removeValue(key);
                }
            }
        }
    }
    exports.DefaultConfiguration = DefaultConfiguration;
    class NullPolicyConfiguration {
        constructor() {
            this.onDidChangeConfiguration = event_1.Event.None;
            this.configurationModel = new configurationModels_1.ConfigurationModel();
        }
        async initialize() { return this.configurationModel; }
    }
    exports.NullPolicyConfiguration = NullPolicyConfiguration;
    let PolicyConfiguration = class PolicyConfiguration extends lifecycle_1.Disposable {
        get configurationModel() { return this._configurationModel; }
        constructor(defaultConfiguration, policyService, logService) {
            super();
            this.defaultConfiguration = defaultConfiguration;
            this.policyService = policyService;
            this.logService = logService;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this._configurationModel = new configurationModels_1.ConfigurationModel();
        }
        async initialize() {
            this.logService.trace('PolicyConfiguration#initialize');
            this.update(await this.updatePolicyDefinitions(this.defaultConfiguration.configurationModel.keys), false);
            this._register(this.policyService.onDidChange(policyNames => this.onDidChangePolicies(policyNames)));
            this._register(this.defaultConfiguration.onDidChangeConfiguration(async ({ properties }) => this.update(await this.updatePolicyDefinitions(properties), true)));
            return this._configurationModel;
        }
        async updatePolicyDefinitions(properties) {
            this.logService.trace('PolicyConfiguration#updatePolicyDefinitions', properties);
            const policyDefinitions = {};
            const keys = [];
            const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            for (const key of properties) {
                const config = configurationProperties[key];
                if (!config) {
                    // Config is removed. So add it to the list if in case it was registered as policy before
                    keys.push(key);
                    continue;
                }
                if (config.policy) {
                    if (config.type !== 'string' && config.type !== 'number') {
                        this.logService.warn(`Policy ${config.policy.name} has unsupported type ${config.type}`);
                        continue;
                    }
                    keys.push(key);
                    policyDefinitions[config.policy.name] = { type: config.type };
                }
            }
            if (!(0, types_1.isEmptyObject)(policyDefinitions)) {
                await this.policyService.updatePolicyDefinitions(policyDefinitions);
            }
            return keys;
        }
        onDidChangePolicies(policyNames) {
            this.logService.trace('PolicyConfiguration#onDidChangePolicies', policyNames);
            const policyConfigurations = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getPolicyConfigurations();
            const keys = (0, arrays_1.coalesce)(policyNames.map(policyName => policyConfigurations.get(policyName)));
            this.update(keys, true);
        }
        update(keys, trigger) {
            this.logService.trace('PolicyConfiguration#update', keys);
            const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            const changed = [];
            const wasEmpty = this._configurationModel.isEmpty();
            for (const key of keys) {
                const policyName = configurationProperties[key]?.policy?.name;
                if (policyName) {
                    const policyValue = this.policyService.getPolicyValue(policyName);
                    if (wasEmpty ? policyValue !== undefined : !(0, objects_1.equals)(this._configurationModel.getValue(key), policyValue)) {
                        changed.push([key, policyValue]);
                    }
                }
                else {
                    if (this._configurationModel.getValue(key) !== undefined) {
                        changed.push([key, undefined]);
                    }
                }
            }
            if (changed.length) {
                this.logService.trace('PolicyConfiguration#changed', changed);
                const old = this._configurationModel;
                this._configurationModel = new configurationModels_1.ConfigurationModel();
                for (const key of old.keys) {
                    this._configurationModel.setValue(key, old.getValue(key));
                }
                for (const [key, policyValue] of changed) {
                    if (policyValue === undefined) {
                        this._configurationModel.removeValue(key);
                    }
                    else {
                        this._configurationModel.setValue(key, policyValue);
                    }
                }
                if (trigger) {
                    this._onDidChangeConfiguration.fire(this._configurationModel);
                }
            }
        }
    };
    exports.PolicyConfiguration = PolicyConfiguration;
    exports.PolicyConfiguration = PolicyConfiguration = __decorate([
        __param(1, policy_1.IPolicyService),
        __param(2, log_1.ILogService)
    ], PolicyConfiguration);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9jb25maWd1cmF0aW9uL2NvbW1vbi9jb25maWd1cmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjaEcsTUFBYSxvQkFBcUIsU0FBUSxzQkFBVTtRQUFwRDs7WUFFa0IsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBMEQsQ0FBQyxDQUFDO1lBQzFILDZCQUF3QixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUM7WUFFakUsd0JBQW1CLEdBQUcsSUFBSSx3Q0FBa0IsRUFBRSxDQUFDO1FBOEN4RCxDQUFDO1FBN0NBLElBQUksa0JBQWtCO1lBQ3JCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ2pDLENBQUM7UUFFRCxLQUFLLENBQUMsVUFBVTtZQUNmLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4TixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNoQyxDQUFDO1FBRUQsTUFBTTtZQUNMLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBQy9CLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQ2hDLENBQUM7UUFFUyx3QkFBd0IsQ0FBQyxVQUFvQixFQUFFLGlCQUEyQjtZ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