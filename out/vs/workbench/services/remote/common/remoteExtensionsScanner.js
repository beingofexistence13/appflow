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
define(["require", "exports", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/remote/common/remoteExtensionsScanner", "vs/base/common/platform", "vs/base/common/uri", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/remoteUserDataProfiles", "vs/workbench/services/environment/common/environmentService", "vs/platform/log/common/log", "vs/platform/instantiation/common/extensions", "vs/workbench/services/localization/common/locale"], function (require, exports, remoteAgentService_1, remoteExtensionsScanner_1, platform, uri_1, userDataProfile_1, remoteUserDataProfiles_1, environmentService_1, log_1, extensions_1, locale_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let RemoteExtensionsScannerService = class RemoteExtensionsScannerService {
        constructor(remoteAgentService, environmentService, userDataProfileService, remoteUserDataProfilesService, logService, activeLanguagePackService) {
            this.remoteAgentService = remoteAgentService;
            this.environmentService = environmentService;
            this.userDataProfileService = userDataProfileService;
            this.remoteUserDataProfilesService = remoteUserDataProfilesService;
            this.logService = logService;
            this.activeLanguagePackService = activeLanguagePackService;
        }
        whenExtensionsReady() {
            return this.withChannel(channel => channel.call('whenExtensionsReady'), undefined);
        }
        async scanExtensions() {
            try {
                const languagePack = await this.activeLanguagePackService.getExtensionIdProvidingCurrentLocale();
                return await this.withChannel(async (channel) => {
                    const profileLocation = this.userDataProfileService.currentProfile.isDefault ? undefined : (await this.remoteUserDataProfilesService.getRemoteProfile(this.userDataProfileService.currentProfile)).extensionsResource;
                    const scannedExtensions = await channel.call('scanExtensions', [platform.language, profileLocation, this.environmentService.extensionDevelopmentLocationURI, languagePack]);
                    scannedExtensions.forEach((extension) => {
                        extension.extensionLocation = uri_1.URI.revive(extension.extensionLocation);
                    });
                    return scannedExtensions;
                }, []);
            }
            catch (error) {
                this.logService.error(error);
                return [];
            }
        }
        async scanSingleExtension(extensionLocation, isBuiltin) {
            try {
                return await this.withChannel(async (channel) => {
                    const extension = await channel.call('scanSingleExtension', [extensionLocation, isBuiltin, platform.language]);
                    if (extension !== null) {
                        extension.extensionLocation = uri_1.URI.revive(extension.extensionLocation);
                        // ImplicitActivationEvents.updateManifest(extension);
                    }
                    return extension;
                }, null);
            }
            catch (error) {
                this.logService.error(error);
                return null;
            }
        }
        withChannel(callback, fallback) {
            const connection = this.remoteAgentService.getConnection();
            if (!connection) {
                return Promise.resolve(fallback);
            }
            return connection.withChannel(remoteExtensionsScanner_1.RemoteExtensionsScannerChannelName, (channel) => callback(channel));
        }
    };
    RemoteExtensionsScannerService = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, userDataProfile_1.IUserDataProfileService),
        __param(3, remoteUserDataProfiles_1.IRemoteUserDataProfilesService),
        __param(4, log_1.ILogService),
        __param(5, locale_1.IActiveLanguagePackService)
    ], RemoteExtensionsScannerService);
    (0, extensions_1.registerSingleton)(remoteExtensionsScanner_1.IRemoteExtensionsScannerService, RemoteExtensionsScannerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXh0ZW5zaW9uc1NjYW5uZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcmVtb3RlL2NvbW1vbi9yZW1vdGVFeHRlbnNpb25zU2Nhbm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQWVoRyxJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUE4QjtRQUluQyxZQUN1QyxrQkFBdUMsRUFDOUIsa0JBQWdELEVBQ3JELHNCQUErQyxFQUN4Qyw2QkFBNkQsRUFDaEYsVUFBdUIsRUFDUix5QkFBcUQ7WUFMNUQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUM5Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBQ3JELDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDeEMsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFnQztZQUNoRixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ1IsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUE0QjtRQUMvRixDQUFDO1FBRUwsbUJBQW1CO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FDdEIsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQzlDLFNBQVMsQ0FDVCxDQUFDO1FBQ0gsQ0FBQztRQUVELEtBQUssQ0FBQyxjQUFjO1lBQ25CLElBQUk7Z0JBQ0gsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsb0NBQW9DLEVBQUUsQ0FBQztnQkFDakcsT0FBTyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQzVCLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtvQkFDakIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMs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