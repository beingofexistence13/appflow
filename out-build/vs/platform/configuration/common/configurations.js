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
    exports.$yn = exports.$xn = exports.$wn = void 0;
    class $wn extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new event_1.$fd());
            this.onDidChangeConfiguration = this.a.event;
            this.b = new configurationModels_1.$qn();
        }
        get configurationModel() {
            return this.b;
        }
        async initialize() {
            this.g();
            this.B(platform_1.$8m.as(configurationRegistry_1.$an.Configuration).onDidUpdateConfiguration(({ properties, defaultsOverrides }) => this.c(Array.from(properties), defaultsOverrides)));
            return this.configurationModel;
        }
        reload() {
            this.g();
            return this.configurationModel;
        }
        c(properties, defaultsOverrides) {
            this.h(properties, platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties());
            this.a.fire({ defaults: this.configurationModel, properties });
        }
        f() {
            return {};
        }
        g() {
            this.b = new configurationModels_1.$qn();
            const properties = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
            this.h(Object.keys(properties), properties);
        }
        h(properties, configurationProperties) {
            const configurationDefaultsOverrides = this.f();
            for (const key of properties) {
                const defaultOverrideValue = configurationDefaultsOverrides[key];
                const propertySchema = configurationProperties[key];
                if (defaultOverrideValue !== undefined) {
                    this.b.addValue(key, defaultOverrideValue);
                }
                else if (propertySchema) {
                    this.b.addValue(key, propertySchema.default);
                }
                else {
                    this.b.removeValue(key);
                }
            }
        }
    }
    exports.$wn = $wn;
    class $xn {
        constructor() {
            this.onDidChangeConfiguration = event_1.Event.None;
            this.configurationModel = new configurationModels_1.$qn();
        }
        async initialize() { return this.configurationModel; }
    }
    exports.$xn = $xn;
    let $yn = class $yn extends lifecycle_1.$kc {
        get configurationModel() { return this.b; }
        constructor(c, f, g) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeConfiguration = this.a.event;
            this.b = new configurationModels_1.$qn();
        }
        async initialize() {
            this.g.trace('PolicyConfiguration#initialize');
            this.m(await this.h(this.c.configurationModel.keys), false);
            this.B(this.f.onDidChange(policyNames => this.j(policyNames)));
            this.B(this.c.onDidChangeConfiguration(async ({ properties }) => this.m(await this.h(properties), true)));
            return this.b;
        }
        async h(properties) {
            this.g.trace('PolicyConfiguration#updatePolicyDefinitions', properties);
            const policyDefinitions = {};
            const keys = [];
            const configurationProperties = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
            for (const key of properties) {
                const config = configurationProperties[key];
                if (!config) {
                    // Config is removed. So add it to the list if in case it was registered as policy before
                    keys.push(key);
                    continue;
                }
                if (config.policy) {
                    if (config.type !== 'string' && config.type !== 'number') {
                        this.g.warn(`Policy ${config.policy.name} has unsupported type ${config.type}`);
                        continue;
                    }
                    keys.push(key);
                    policyDefinitions[config.policy.name] = { type: config.type };
                }
            }
            if (!(0, types_1.$wf)(policyDefinitions)) {
                await this.f.updatePolicyDefinitions(policyDefinitions);
            }
            return keys;
        }
        j(policyNames) {
            this.g.trace('PolicyConfiguration#onDidChangePolicies', policyNames);
            const policyConfigurations = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getPolicyConfigurations();
            const keys = (0, arrays_1.$Fb)(policyNames.map(policyName => policyConfigurations.get(policyName)));
            this.m(keys, true);
        }
        m(keys, trigger) {
            this.g.trace('PolicyConfiguration#update', keys);
            const configurationProperties = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
            const changed = [];
            const wasEmpty = this.b.isEmpty();
            for (const key of keys) {
                const policyName = configurationProperties[key]?.policy?.name;
                if (policyName) {
                    const policyValue = this.f.getPolicyValue(policyName);
                    if (wasEmpty ? policyValue !== undefined : !(0, objects_1.$Zm)(this.b.getValue(key), policyValue)) {
                        changed.push([key, policyValue]);
                    }
                }
                else {
                    if (this.b.getValue(key) !== undefined) {
                        changed.push([key, undefined]);
                    }
                }
            }
            if (changed.length) {
                this.g.trace('PolicyConfiguration#changed', changed);
                const old = this.b;
                this.b = new configurationModels_1.$qn();
                for (const key of old.keys) {
                    this.b.setValue(key, old.getValue(key));
                }
                for (const [key, policyValue] of changed) {
                    if (policyValue === undefined) {
                        this.b.removeValue(key);
                    }
                    else {
                        this.b.setValue(key, policyValue);
                    }
                }
                if (trigger) {
                    this.a.fire(this.b);
                }
            }
        }
    };
    exports.$yn = $yn;
    exports.$yn = $yn = __decorate([
        __param(1, policy_1.$0m),
        __param(2, log_1.$5i)
    ], $yn);
});
//# sourceMappingURL=configurations.js.map