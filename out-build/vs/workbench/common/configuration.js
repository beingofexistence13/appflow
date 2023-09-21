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
define(["require", "exports", "vs/nls!vs/workbench/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/platform"], function (require, exports, nls_1, configurationRegistry_1, platform_1, workspace_1, configuration_1, lifecycle_1, event_1, remoteAgentService_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cz = exports.$bz = exports.$az = exports.$_y = exports.$$y = exports.$0y = void 0;
    exports.$0y = Object.freeze({
        'id': 'application',
        'order': 100,
        'title': (0, nls_1.localize)(0, null),
        'type': 'object'
    });
    exports.$$y = Object.freeze({
        'id': 'workbench',
        'order': 7,
        'title': (0, nls_1.localize)(1, null),
        'type': 'object',
    });
    exports.$_y = Object.freeze({
        'id': 'security',
        'scope': 1 /* ConfigurationScope.APPLICATION */,
        'title': (0, nls_1.localize)(2, null),
        'type': 'object',
        'order': 7
    });
    exports.$az = {
        ConfigurationMigration: 'base.contributions.configuration.migration'
    };
    class ConfigurationMigrationRegistry {
        constructor() {
            this.migrations = [];
            this.a = new event_1.$fd();
            this.onDidRegisterConfigurationMigration = this.a.event;
        }
        registerConfigurationMigrations(configurationMigrations) {
            this.migrations.push(...configurationMigrations);
        }
    }
    const configurationMigrationRegistry = new ConfigurationMigrationRegistry();
    platform_1.$8m.add(exports.$az.ConfigurationMigration, configurationMigrationRegistry);
    let $bz = class $bz extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.B(this.b.onDidChangeWorkspaceFolders(async (e) => {
                for (const folder of e.added) {
                    await this.f(folder, configurationMigrationRegistry.migrations);
                }
            }));
            this.c(configurationMigrationRegistry.migrations);
            this.B(configurationMigrationRegistry.onDidRegisterConfigurationMigration(migration => this.c(migration)));
        }
        async c(migrations) {
            await this.f(undefined, migrations);
            for (const folder of this.b.getWorkspace().folders) {
                await this.f(folder, migrations);
            }
        }
        async f(folder, migrations) {
            await Promise.all(migrations.map(migration => this.g(migration, { resource: folder?.uri })));
        }
        async g(migration, overrides) {
            const data = this.a.inspect(migration.key, overrides);
            await this.h(migration, overrides, data, 'userValue', 2 /* ConfigurationTarget.USER */);
            await this.h(migration, overrides, data, 'userLocalValue', 3 /* ConfigurationTarget.USER_LOCAL */);
            await this.h(migration, overrides, data, 'userRemoteValue', 4 /* ConfigurationTarget.USER_REMOTE */);
            await this.h(migration, overrides, data, 'workspaceFolderValue', 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
            await this.h(migration, overrides, data, 'workspaceValue', 5 /* ConfigurationTarget.WORKSPACE */);
            if (typeof overrides.overrideIdentifier === 'undefined' && typeof data.overrideIdentifiers !== 'undefined') {
                for (const overrideIdentifier of data.overrideIdentifiers) {
                    await this.g(migration, { resource: overrides.resource, overrideIdentifier });
                }
            }
        }
        async h(migration, overrides, data, dataKey, target) {
            const value = data[dataKey];
            if (typeof value === 'undefined') {
                return;
            }
            const valueAccessor = (key) => this.a.inspect(key, overrides)[dataKey];
            const result = await migration.migrateFn(value, valueAccessor);
            const keyValuePairs = Array.isArray(result) ? result : [[migration.key, result]];
            await Promise.allSettled(keyValuePairs.map(async ([key, value]) => this.a.updateValue(key, value.value, overrides, target)));
        }
    };
    exports.$bz = $bz;
    exports.$bz = $bz = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, workspace_1.$Kh)
    ], $bz);
    let $cz = class $cz extends lifecycle_1.$kc {
        constructor(remoteAgentService) {
            super();
            (async () => {
                if (!platform_2.$i) {
                    const remoteEnvironment = await remoteAgentService.getEnvironment();
                    if (remoteEnvironment?.os !== 1 /* OperatingSystem.Windows */) {
                        return;
                    }
                }
                // Windows: UNC allow list security configuration
                const registry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
                registry.registerConfiguration({
                    ...exports.$_y,
                    'properties': {
                        'security.allowedUNCHosts': {
                            'type': 'array',
                            'items': {
                                'type': 'string',
                                'pattern': '^[^\\\\]+$',
                                'patternErrorMessage': (0, nls_1.localize)(3, null)
                            },
                            'default': [],
                            'markdownDescription': (0, nls_1.localize)(4, null),
                            'scope': 2 /* ConfigurationScope.MACHINE */
                        },
                        'security.restrictUNCAccess': {
                            'type': 'boolean',
                            'default': true,
                            'markdownDescription': (0, nls_1.localize)(5, null),
                            'scope': 2 /* ConfigurationScope.MACHINE */
                        }
                    }
                });
            })();
        }
    };
    exports.$cz = $cz;
    exports.$cz = $cz = __decorate([
        __param(0, remoteAgentService_1.$jm)
    ], $cz);
});
//# sourceMappingURL=configuration.js.map