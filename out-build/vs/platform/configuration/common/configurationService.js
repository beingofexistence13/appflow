/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configurations", "vs/platform/policy/common/policy"], function (require, exports, async_1, event_1, lifecycle_1, resources_1, configuration_1, configurationModels_1, configurations_1, policy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zn = void 0;
    class $zn extends lifecycle_1.$kc {
        constructor(j, fileService, policyService, logService) {
            super();
            this.j = j;
            this.h = this.B(new event_1.$fd());
            this.onDidChangeConfiguration = this.h.event;
            this.b = this.B(new configurations_1.$wn());
            this.c = policyService instanceof policy_1.$_m ? new configurations_1.$xn() : this.B(new configurations_1.$yn(this.b, policyService, logService));
            this.f = this.B(new configurationModels_1.$sn(this.j, {}, resources_1.$_f, fileService));
            this.a = new configurationModels_1.$tn(this.b.configurationModel, this.c.configurationModel, new configurationModels_1.$qn(), new configurationModels_1.$qn());
            this.g = this.B(new async_1.$Sg(() => this.reloadConfiguration(), 50));
            this.B(this.b.onDidChangeConfiguration(({ defaults, properties }) => this.n(defaults, properties)));
            this.B(this.c.onDidChangeConfiguration(model => this.r(model)));
            this.B(this.f.onDidChange(() => this.g.schedule()));
        }
        async initialize() {
            const [defaultModel, policyModel, userModel] = await Promise.all([this.b.initialize(), this.c.initialize(), this.f.loadConfiguration()]);
            this.a = new configurationModels_1.$tn(defaultModel, policyModel, new configurationModels_1.$qn(), userModel);
        }
        getConfigurationData() {
            return this.a.toData();
        }
        getValue(arg1, arg2) {
            const section = typeof arg1 === 'string' ? arg1 : undefined;
            const overrides = (0, configuration_1.$9h)(arg1) ? arg1 : (0, configuration_1.$9h)(arg2) ? arg2 : {};
            return this.a.getValue(section, overrides, undefined);
        }
        updateValue(key, value, arg3, arg4) {
            return Promise.reject(new Error('not supported'));
        }
        inspect(key) {
            return this.a.inspect(key, {}, undefined);
        }
        keys() {
            return this.a.keys(undefined);
        }
        async reloadConfiguration() {
            const configurationModel = await this.f.loadConfiguration();
            this.m(configurationModel);
        }
        m(userConfigurationModel) {
            const previous = this.a.toData();
            const change = this.a.compareAndUpdateLocalUserConfiguration(userConfigurationModel);
            this.s(change, previous, 2 /* ConfigurationTarget.USER */);
        }
        n(defaultConfigurationModel, properties) {
            const previous = this.a.toData();
            const change = this.a.compareAndUpdateDefaultConfiguration(defaultConfigurationModel, properties);
            this.s(change, previous, 7 /* ConfigurationTarget.DEFAULT */);
        }
        r(policyConfiguration) {
            const previous = this.a.toData();
            const change = this.a.compareAndUpdatePolicyConfiguration(policyConfiguration);
            this.s(change, previous, 7 /* ConfigurationTarget.DEFAULT */);
        }
        s(configurationChange, previous, source) {
            const event = new configurationModels_1.$vn(configurationChange, { data: previous }, this.a);
            event.source = source;
            event.sourceConfig = this.t(source);
            this.h.fire(event);
        }
        t(target) {
            switch (target) {
                case 7 /* ConfigurationTarget.DEFAULT */:
                    return this.a.defaults.contents;
                case 2 /* ConfigurationTarget.USER */:
                    return this.a.localUserConfiguration.contents;
            }
            return {};
        }
    }
    exports.$zn = $zn;
});
//# sourceMappingURL=configurationService.js.map