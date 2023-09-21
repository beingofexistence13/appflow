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
define(["require", "exports", "vs/base/common/uri", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/workspace/common/workspace", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment"], function (require, exports, uri_1, platform_1, configurationRegistry_1, workspace_1, extHost_protocol_1, extHostCustomers_1, configuration_1, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zcb = void 0;
    let $zcb = class $zcb {
        constructor(extHostContext, b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            const proxy = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostConfiguration);
            proxy.$initializeConfiguration(this.f());
            this.a = c.onDidChangeConfiguration(e => {
                proxy.$acceptConfigurationChanged(this.f(), e.change);
            });
        }
        f() {
            const configurationData = { ...(this.c.getConfigurationData()), configurationScopes: [] };
            // Send configurations scopes only in development mode.
            if (!this.d.isBuilt || this.d.isExtensionDevelopment) {
                configurationData.configurationScopes = (0, configurationRegistry_1.$pn)();
            }
            return configurationData;
        }
        dispose() {
            this.a.dispose();
        }
        $updateConfigurationOption(target, key, value, overrides, scopeToLanguage) {
            overrides = { resource: overrides?.resource ? uri_1.URI.revive(overrides.resource) : undefined, overrideIdentifier: overrides?.overrideIdentifier };
            return this.g(target, key, value, overrides, scopeToLanguage);
        }
        $removeConfigurationOption(target, key, overrides, scopeToLanguage) {
            overrides = { resource: overrides?.resource ? uri_1.URI.revive(overrides.resource) : undefined, overrideIdentifier: overrides?.overrideIdentifier };
            return this.g(target, key, undefined, overrides, scopeToLanguage);
        }
        g(target, key, value, overrides, scopeToLanguage) {
            target = target !== null && target !== undefined ? target : this.i(key, overrides);
            const configurationValue = this.c.inspect(key, overrides);
            switch (target) {
                case 8 /* ConfigurationTarget.MEMORY */:
                    return this.h(key, value, target, configurationValue?.memory?.override, overrides, scopeToLanguage);
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                    return this.h(key, value, target, configurationValue?.workspaceFolder?.override, overrides, scopeToLanguage);
                case 5 /* ConfigurationTarget.WORKSPACE */:
                    return this.h(key, value, target, configurationValue?.workspace?.override, overrides, scopeToLanguage);
                case 4 /* ConfigurationTarget.USER_REMOTE */:
                    return this.h(key, value, target, configurationValue?.userRemote?.override, overrides, scopeToLanguage);
                default:
                    return this.h(key, value, target, configurationValue?.userLocal?.override, overrides, scopeToLanguage);
            }
        }
        h(key, value, configurationTarget, overriddenValue, overrides, scopeToLanguage) {
            overrides = scopeToLanguage === true ? overrides
                : scopeToLanguage === false ? { resource: overrides.resource }
                    : overrides.overrideIdentifier && overriddenValue !== undefined ? overrides
                        : { resource: overrides.resource };
            return this.c.updateValue(key, value, overrides, configurationTarget, { donotNotifyError: true });
        }
        i(key, overrides) {
            if (overrides.resource && this.b.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                const configurationProperties = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
                if (configurationProperties[key] && (configurationProperties[key].scope === 4 /* ConfigurationScope.RESOURCE */ || configurationProperties[key].scope === 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */)) {
                    return 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
            }
            return 5 /* ConfigurationTarget.WORKSPACE */;
        }
    };
    exports.$zcb = $zcb;
    exports.$zcb = $zcb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadConfiguration),
        __param(1, workspace_1.$Kh),
        __param(2, configuration_1.$8h),
        __param(3, environment_1.$Ih)
    ], $zcb);
});
//# sourceMappingURL=mainThreadConfiguration.js.map