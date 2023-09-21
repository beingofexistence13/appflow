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
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/platform"], function (require, exports, nls_1, configurationRegistry_1, platform_1, workspace_1, configuration_1, lifecycle_1, event_1, remoteAgentService_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DynamicWorkbenchConfigurationWorkbenchContribution = exports.ConfigurationMigrationWorkbenchContribution = exports.Extensions = exports.securityConfigurationNodeBase = exports.workbenchConfigurationNodeBase = exports.applicationConfigurationNodeBase = void 0;
    exports.applicationConfigurationNodeBase = Object.freeze({
        'id': 'application',
        'order': 100,
        'title': (0, nls_1.localize)('applicationConfigurationTitle', "Application"),
        'type': 'object'
    });
    exports.workbenchConfigurationNodeBase = Object.freeze({
        'id': 'workbench',
        'order': 7,
        'title': (0, nls_1.localize)('workbenchConfigurationTitle', "Workbench"),
        'type': 'object',
    });
    exports.securityConfigurationNodeBase = Object.freeze({
        'id': 'security',
        'scope': 1 /* ConfigurationScope.APPLICATION */,
        'title': (0, nls_1.localize)('securityConfigurationTitle', "Security"),
        'type': 'object',
        'order': 7
    });
    exports.Extensions = {
        ConfigurationMigration: 'base.contributions.configuration.migration'
    };
    class ConfigurationMigrationRegistry {
        constructor() {
            this.migrations = [];
            this._onDidRegisterConfigurationMigrations = new event_1.Emitter();
            this.onDidRegisterConfigurationMigration = this._onDidRegisterConfigurationMigrations.event;
        }
        registerConfigurationMigrations(configurationMigrations) {
            this.migrations.push(...configurationMigrations);
        }
    }
    const configurationMigrationRegistry = new ConfigurationMigrationRegistry();
    platform_1.Registry.add(exports.Extensions.ConfigurationMigration, configurationMigrationRegistry);
    let ConfigurationMigrationWorkbenchContribution = class ConfigurationMigrationWorkbenchContribution extends lifecycle_1.Disposable {
        constructor(configurationService, workspaceService) {
            super();
            this.configurationService = configurationService;
            this.workspaceService = workspaceService;
            this._register(this.workspaceService.onDidChangeWorkspaceFolders(async (e) => {
                for (const folder of e.added) {
                    await this.migrateConfigurationsForFolder(folder, configurationMigrationRegistry.migrations);
                }
            }));
            this.migrateConfigurations(configurationMigrationRegistry.migrations);
            this._register(configurationMigrationRegistry.onDidRegisterConfigurationMigration(migration => this.migrateConfigurations(migration)));
        }
        async migrateConfigurations(migrations) {
            await this.migrateConfigurationsForFolder(undefined, migrations);
            for (const folder of this.workspaceService.getWorkspace().folders) {
                await this.migrateConfigurationsForFolder(folder, migrations);
            }
        }
        async migrateConfigurationsForFolder(folder, migrations) {
            await Promise.all(migrations.map(migration => this.migrateConfigurationsForFolderAndOverride(migration, { resource: folder?.uri })));
        }
        async migrateConfigurationsForFolderAndOverride(migration, overrides) {
            const data = this.configurationService.inspect(migration.key, overrides);
            await this.migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, 'userValue', 2 /* ConfigurationTarget.USER */);
            await this.migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, 'userLocalValue', 3 /* ConfigurationTarget.USER_LOCAL */);
            await this.migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, 'userRemoteValue', 4 /* ConfigurationTarget.USER_REMOTE */);
            await this.migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, 'workspaceFolderValue', 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
            await this.migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, 'workspaceValue', 5 /* ConfigurationTarget.WORKSPACE */);
            if (typeof overrides.overrideIdentifier === 'undefined' && typeof data.overrideIdentifiers !== 'undefined') {
                for (const overrideIdentifier of data.overrideIdentifiers) {
                    await this.migrateConfigurationsForFolderAndOverride(migration, { resource: overrides.resource, overrideIdentifier });
                }
            }
        }
        async migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, dataKey, target) {
            const value = data[dataKey];
            if (typeof value === 'undefined') {
                return;
            }
            const valueAccessor = (key) => this.configurationService.inspect(key, overrides)[dataKey];
            const result = await migration.migrateFn(value, valueAccessor);
            const keyValuePairs = Array.isArray(result) ? result : [[migration.key, result]];
            await Promise.allSettled(keyValuePairs.map(async ([key, value]) => this.configurationService.updateValue(key, value.value, overrides, target)));
        }
    };
    exports.ConfigurationMigrationWorkbenchContribution = ConfigurationMigrationWorkbenchContribution;
    exports.ConfigurationMigrationWorkbenchContribution = ConfigurationMigrationWorkbenchContribution = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], ConfigurationMigrationWorkbenchContribution);
    let DynamicWorkbenchConfigurationWorkbenchContribution = class DynamicWorkbenchConfigurationWorkbenchContribution extends lifecycle_1.Disposable {
        constructor(remoteAgentService) {
            super();
            (async () => {
                if (!platform_2.isWindows) {
                    const remoteEnvironment = await remoteAgentService.getEnvironment();
                    if (remoteEnvironment?.os !== 1 /* OperatingSystem.Windows */) {
                        return;
                    }
                }
                // Windows: UNC allow list security configuration
                const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
                registry.registerConfiguration({
                    ...exports.securityConfigurationNodeBase,
                    'properties': {
                        'security.allowedUNCHosts': {
                            'type': 'array',
                            'items': {
                                'type': 'string',
                                'pattern': '^[^\\\\]+$',
                                'patternErrorMessage': (0, nls_1.localize)('security.allowedUNCHosts.patternErrorMessage', 'UNC host names must not contain backslashes.')
                            },
                            'default': [],
                            'markdownDescription': (0, nls_1.localize)('security.allowedUNCHosts', 'A set of UNC host names (without leading or trailing backslash, for example `192.168.0.1` or `my-server`) to allow without user confirmation. If a UNC host is being accessed that is not allowed via this setting or has not been acknowledged via user confirmation, an error will occur and the operation stopped. A restart is required when changing this setting. Find out more about this setting at https://aka.ms/vscode-windows-unc.'),
                            'scope': 2 /* ConfigurationScope.MACHINE */
                        },
                        'security.restrictUNCAccess': {
                            'type': 'boolean',
                            'default': true,
                            'markdownDescription': (0, nls_1.localize)('security.restrictUNCAccess', 'If enabled, only allows access to UNC host names that are allowed by the `#security.allowedUNCHosts#` setting or after user confirmation. Find out more about this setting at https://aka.ms/vscode-windows-unc.'),
                            'scope': 2 /* ConfigurationScope.MACHINE */
                        }
                    }
                });
            })();
        }
    };
    exports.DynamicWorkbenchConfigurationWorkbenchContribution = DynamicWorkbenchConfigurationWorkbenchContribution;
    exports.DynamicWorkbenchConfigurationWorkbenchContribution = DynamicWorkbenchConfigurationWorkbenchContribution = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService)
    ], DynamicWorkbenchConfigurationWorkbenchContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vY29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhbkYsUUFBQSxnQ0FBZ0MsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFxQjtRQUNqRixJQUFJLEVBQUUsYUFBYTtRQUNuQixPQUFPLEVBQUUsR0FBRztRQUNaLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQywrQkFBK0IsRUFBRSxhQUFhLENBQUM7UUFDakUsTUFBTSxFQUFFLFFBQVE7S0FDaEIsQ0FBQyxDQUFDO0lBRVUsUUFBQSw4QkFBOEIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFxQjtRQUMvRSxJQUFJLEVBQUUsV0FBVztRQUNqQixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyw2QkFBNkIsRUFBRSxXQUFXLENBQUM7UUFDN0QsTUFBTSxFQUFFLFFBQVE7S0FDaEIsQ0FBQyxDQUFDO0lBRVUsUUFBQSw2QkFBNkIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFxQjtRQUM5RSxJQUFJLEVBQUUsVUFBVTtRQUNoQixPQUFPLHdDQUFnQztRQUN2QyxPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMsNEJBQTRCLEVBQUUsVUFBVSxDQUFDO1FBQzNELE1BQU0sRUFBRSxRQUFRO1FBQ2hCLE9BQU8sRUFBRSxDQUFDO0tBQ1YsQ0FBQyxDQUFDO0lBRVUsUUFBQSxVQUFVLEdBQUc7UUFDekIsc0JBQXNCLEVBQUUsNENBQTRDO0tBQ3BFLENBQUM7SUFXRixNQUFNLDhCQUE4QjtRQUFwQztZQUVVLGVBQVUsR0FBNkIsRUFBRSxDQUFDO1lBRWxDLDBDQUFxQyxHQUFHLElBQUksZUFBTyxFQUE0QixDQUFDO1lBQ3hGLHdDQUFtQyxHQUFHLElBQUksQ0FBQyxx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