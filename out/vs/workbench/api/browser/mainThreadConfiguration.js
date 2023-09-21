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
    exports.MainThreadConfiguration = void 0;
    let MainThreadConfiguration = class MainThreadConfiguration {
        constructor(extHostContext, _workspaceContextService, configurationService, _environmentService) {
            this._workspaceContextService = _workspaceContextService;
            this.configurationService = configurationService;
            this._environmentService = _environmentService;
            const proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostConfiguration);
            proxy.$initializeConfiguration(this._getConfigurationData());
            this._configurationListener = configurationService.onDidChangeConfiguration(e => {
                proxy.$acceptConfigurationChanged(this._getConfigurationData(), e.change);
            });
        }
        _getConfigurationData() {
            const configurationData = { ...(this.configurationService.getConfigurationData()), configurationScopes: [] };
            // Send configurations scopes only in development mode.
            if (!this._environmentService.isBuilt || this._environmentService.isExtensionDevelopment) {
                configurationData.configurationScopes = (0, configurationRegistry_1.getScopes)();
            }
            return configurationData;
        }
        dispose() {
            this._configurationListener.dispose();
        }
        $updateConfigurationOption(target, key, value, overrides, scopeToLanguage) {
            overrides = { resource: overrides?.resource ? uri_1.URI.revive(overrides.resource) : undefined, overrideIdentifier: overrides?.overrideIdentifier };
            return this.writeConfiguration(target, key, value, overrides, scopeToLanguage);
        }
        $removeConfigurationOption(target, key, overrides, scopeToLanguage) {
            overrides = { resource: overrides?.resource ? uri_1.URI.revive(overrides.resource) : undefined, overrideIdentifier: overrides?.overrideIdentifier };
            return this.writeConfiguration(target, key, undefined, overrides, scopeToLanguage);
        }
        writeConfiguration(target, key, value, overrides, scopeToLanguage) {
            target = target !== null && target !== undefined ? target : this.deriveConfigurationTarget(key, overrides);
            const configurationValue = this.configurationService.inspect(key, overrides);
            switch (target) {
                case 8 /* ConfigurationTarget.MEMORY */:
                    return this._updateValue(key, value, target, configurationValue?.memory?.override, overrides, scopeToLanguage);
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                    return this._updateValue(key, value, target, configurationValue?.workspaceFolder?.override, overrides, scopeToLanguage);
                case 5 /* ConfigurationTarget.WORKSPACE */:
                    return this._updateValue(key, value, target, configurationValue?.workspace?.override, overrides, scopeToLanguage);
                case 4 /* ConfigurationTarget.USER_REMOTE */:
                    return this._updateValue(key, value, target, configurationValue?.userRemote?.override, overrides, scopeToLanguage);
                default:
                    return this._updateValue(key, value, target, configurationValue?.userLocal?.override, overrides, scopeToLanguage);
            }
        }
        _updateValue(key, value, configurationTarget, overriddenValue, overrides, scopeToLanguage) {
            overrides = scopeToLanguage === true ? overrides
                : scopeToLanguage === false ? { resource: overrides.resource }
                    : overrides.overrideIdentifier && overriddenValue !== undefined ? overrides
                        : { resource: overrides.resource };
            return this.configurationService.updateValue(key, value, overrides, configurationTarget, { donotNotifyError: true });
        }
        deriveConfigurationTarget(key, overrides) {
            if (overrides.resource && this._workspaceContextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
                if (configurationProperties[key] && (configurationProperties[key].scope === 4 /* ConfigurationScope.RESOURCE */ || configurationProperties[key].scope === 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */)) {
                    return 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
            }
            return 5 /* ConfigurationTarget.WORKSPACE */;
        }
    };
    exports.MainThreadConfiguration = MainThreadConfiguration;
    exports.MainThreadConfiguration = MainThreadConfiguration = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadConfiguration),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, environment_1.IEnvironmentService)
    ], MainThreadConfiguration);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZENvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXVCO1FBSW5DLFlBQ0MsY0FBK0IsRUFDWSx3QkFBa0QsRUFDckQsb0JBQTJDLEVBQzdDLG1CQUF3QztZQUZuQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3JELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDN0Msd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUU5RSxNQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUUzRSxLQUFLLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsb0JBQW9CLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQy9FLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0UsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8scUJBQXFCO1lBQzVCLE1BQU0saUJBQWlCLEdBQTJCLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxvQkFBb0IsRUFBRyxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDdEksdURBQXVEO1lBQ3ZELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxt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