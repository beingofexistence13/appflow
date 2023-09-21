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
define(["require", "exports", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/services/extensions/common/extensions", "vs/platform/commands/common/commands", "vs/platform/files/common/files", "vs/base/common/buffer", "vs/base/common/uri", "vs/platform/product/common/productService"], function (require, exports, environmentService_1, platform_1, configurationRegistry_1, extensions_1, commands_1, files_1, buffer_1, uri_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yac = void 0;
    let $yac = class $yac {
        constructor(environmentService, c, d, e, f) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            const exportDefaultConfigurationPath = environmentService.args['export-default-configuration'];
            if (exportDefaultConfigurationPath) {
                this.g(uri_1.URI.file(exportDefaultConfigurationPath));
            }
        }
        async g(target) {
            try {
                await this.c.whenInstalledExtensionsRegistered();
                await this.h(target);
            }
            finally {
                this.d.executeCommand('workbench.action.quit');
            }
        }
        async h(target) {
            const config = this.i();
            const resultString = JSON.stringify(config, undefined, '  ');
            await this.e.writeFile(target, buffer_1.$Fd.fromString(resultString));
        }
        i() {
            const configRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            const configurations = configRegistry.getConfigurations().slice();
            const settings = [];
            const processedNames = new Set();
            const processProperty = (name, prop) => {
                if (processedNames.has(name)) {
                    console.warn('Setting is registered twice: ' + name);
                    return;
                }
                processedNames.add(name);
                const propDetails = {
                    name,
                    description: prop.description || prop.markdownDescription || '',
                    default: prop.default,
                    type: prop.type
                };
                if (prop.enum) {
                    propDetails.enum = prop.enum;
                }
                if (prop.enumDescriptions || prop.markdownEnumDescriptions) {
                    propDetails.enumDescriptions = prop.enumDescriptions || prop.markdownEnumDescriptions;
                }
                settings.push(propDetails);
            };
            const processConfig = (config) => {
                if (config.properties) {
                    for (const name in config.properties) {
                        processProperty(name, config.properties[name]);
                    }
                }
                config.allOf?.forEach(processConfig);
            };
            configurations.forEach(processConfig);
            const excludedProps = configRegistry.getExcludedConfigurationProperties();
            for (const name in excludedProps) {
                processProperty(name, excludedProps[name]);
            }
            const result = {
                settings: settings.sort((a, b) => a.name.localeCompare(b.name)),
                buildTime: Date.now(),
                commit: this.f.commit,
                buildNumber: this.f.settingsSearchBuildId
            };
            return result;
        }
    };
    exports.$yac = $yac;
    exports.$yac = $yac = __decorate([
        __param(0, environmentService_1.$1$b),
        __param(1, extensions_1.$MF),
        __param(2, commands_1.$Fr),
        __param(3, files_1.$6j),
        __param(4, productService_1.$kj)
    ], $yac);
});
//# sourceMappingURL=configurationExportHelper.js.map