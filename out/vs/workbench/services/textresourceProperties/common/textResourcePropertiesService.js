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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/editor/common/services/textResourceConfiguration", "vs/base/common/platform", "vs/base/common/network", "vs/platform/storage/common/storage", "vs/workbench/services/environment/common/environmentService", "vs/platform/instantiation/common/extensions", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, configuration_1, textResourceConfiguration_1, platform_1, network_1, storage_1, environmentService_1, extensions_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextResourcePropertiesService = void 0;
    let TextResourcePropertiesService = class TextResourcePropertiesService {
        constructor(configurationService, remoteAgentService, environmentService, storageService) {
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.storageService = storageService;
            this.remoteEnvironment = null;
            remoteAgentService.getEnvironment().then(remoteEnv => this.remoteEnvironment = remoteEnv);
        }
        getEOL(resource, language) {
            const eol = this.configurationService.getValue('files.eol', { overrideIdentifier: language, resource });
            if (eol && typeof eol === 'string' && eol !== 'auto') {
                return eol;
            }
            const os = this.getOS(resource);
            return os === 3 /* OperatingSystem.Linux */ || os === 2 /* OperatingSystem.Macintosh */ ? '\n' : '\r\n';
        }
        getOS(resource) {
            let os = platform_1.OS;
            const remoteAuthority = this.environmentService.remoteAuthority;
            if (remoteAuthority) {
                if (resource && resource.scheme !== network_1.Schemas.file) {
                    const osCacheKey = `resource.authority.os.${remoteAuthority}`;
                    os = this.remoteEnvironment ? this.remoteEnvironment.os : /* Get it from cache */ this.storageService.getNumber(osCacheKey, 1 /* StorageScope.WORKSPACE */, platform_1.OS);
                    this.storageService.store(osCacheKey, os, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
            }
            return os;
        }
    };
    exports.TextResourcePropertiesService = TextResourcePropertiesService;
    exports.TextResourcePropertiesService = TextResourcePropertiesService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, remoteAgentService_1.IRemoteAgentService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, storage_1.IStorageService)
    ], TextResourcePropertiesService);
    (0, extensions_1.registerSingleton)(textResourceConfiguration_1.ITextResourcePropertiesService, TextResourcePropertiesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFJlc291cmNlUHJvcGVydGllc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dHJlc291cmNlUHJvcGVydGllcy9jb21tb24vdGV4dFJlc291cmNlUHJvcGVydGllc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0sNkJBQTZCLEdBQW5DLE1BQU0sNkJBQTZCO1FBTXpDLFlBQ3dCLG9CQUE0RCxFQUM5RCxrQkFBdUMsRUFDOUIsa0JBQWlFLEVBQzlFLGNBQWdEO1lBSHpCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFcEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtZQUM3RCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFOMUQsc0JBQWlCLEdBQW1DLElBQUksQ0FBQztZQVFoRSxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFjLEVBQUUsUUFBaUI7WUFDdkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN4RyxJQUFJLEdBQUcsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLLE1BQU0sRUFBRTtnQkFDckQsT0FBTyxHQUFHLENBQUM7YUFDWDtZQUNELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEMsT0FBTyxFQUFFLGtDQUEwQixJQUFJLEVBQUUsc0NBQThCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3pGLENBQUM7UUFFTyxLQUFLLENBQUMsUUFBYztZQUMzQixJQUFJLEVBQUUsR0FBRyxhQUFFLENBQUM7WUFFWixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDO1lBQ2hFLElBQUksZUFBZSxFQUFFO2dCQUNwQixJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxFQUFFO29CQUNqRCxNQUFNLFVBQVUsR0FBRyx5QkFBeUIsZUFBZSxFQUFFLENBQUM7b0JBQzlELEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLFVBQVUsa0NBQTBCLGFBQUUsQ0FBQyxDQUFDO29CQUN4SixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxnRUFBZ0QsQ0FBQztpQkFDekY7YUFDRDtZQUVELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUNELENBQUE7SUF0Q1ksc0VBQTZCOzRDQUE3Qiw2QkFBNkI7UUFPdkMsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHdDQUFtQixDQUFBO1FBQ25CLFdBQUEsaURBQTRCLENBQUE7UUFDNUIsV0FBQSx5QkFBZSxDQUFBO09BVkwsNkJBQTZCLENBc0N6QztJQUVELElBQUEsOEJBQWlCLEVBQUMsMERBQThCLEVBQUUsNkJBQTZCLG9DQUE0QixDQUFDIn0=