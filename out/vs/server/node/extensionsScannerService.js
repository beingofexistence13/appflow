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
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/server/node/remoteLanguagePacks"], function (require, exports, resources_1, uri_1, environment_1, extensionsProfileScannerService_1, extensionsScannerService_1, files_1, instantiation_1, log_1, productService_1, uriIdentity_1, userDataProfile_1, remoteLanguagePacks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsScannerService = void 0;
    let ExtensionsScannerService = class ExtensionsScannerService extends extensionsScannerService_1.AbstractExtensionsScannerService {
        constructor(userDataProfilesService, extensionsProfileScannerService, fileService, logService, nativeEnvironmentService, productService, uriIdentityService, instantiationService) {
            super(uri_1.URI.file(nativeEnvironmentService.builtinExtensionsPath), uri_1.URI.file(nativeEnvironmentService.extensionsPath), (0, resources_1.joinPath)(nativeEnvironmentService.userHome, '.vscode-oss-dev', 'extensions', 'control.json'), userDataProfilesService.defaultProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, nativeEnvironmentService, productService, uriIdentityService, instantiationService);
            this.nativeEnvironmentService = nativeEnvironmentService;
        }
        async getTranslations(language) {
            const config = await (0, remoteLanguagePacks_1.getNLSConfiguration)(language, this.nativeEnvironmentService.userDataPath);
            if (remoteLanguagePacks_1.InternalNLSConfiguration.is(config)) {
                try {
                    const content = await this.fileService.readFile(uri_1.URI.file(config._translationsConfigFile));
                    return JSON.parse(content.value.toString());
                }
                catch (err) { /* Ignore error */ }
            }
            return Object.create(null);
        }
    };
    exports.ExtensionsScannerService = ExtensionsScannerService;
    exports.ExtensionsScannerService = ExtensionsScannerService = __decorate([
        __param(0, userDataProfile_1.IUserDataProfilesService),
        __param(1, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(2, files_1.IFileService),
        __param(3, log_1.ILogService),
        __param(4, environment_1.INativeEnvironmentService),
        __param(5, productService_1.IProductService),
        __param(6, uriIdentity_1.IUriIdentityService),
        __param(7, instantiation_1.IInstantiationService)
    ], ExtensionsScannerService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1NjYW5uZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvc2VydmVyL25vZGUvZXh0ZW5zaW9uc1NjYW5uZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWV6RixJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLDJEQUFnQztRQUU3RSxZQUMyQix1QkFBaUQsRUFDekMsK0JBQWlFLEVBQ3JGLFdBQXlCLEVBQzFCLFVBQXVCLEVBQ1Esd0JBQW1ELEVBQzlFLGNBQStCLEVBQzNCLGtCQUF1QyxFQUNyQyxvQkFBMkM7WUFFbEUsS0FBSyxDQUNKLFNBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMscUJBQXFCLENBQUMsRUFDeEQsU0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsRUFDakQsSUFBQSxvQkFBUSxFQUFDLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLEVBQzVGLHVCQUF1QixDQUFDLGNBQWMsRUFDdEMsdUJBQXVCLEVBQUUsK0JBQStCLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQVY1SCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTJCO1FBV2hHLENBQUM7UUFFUyxLQUFLLENBQUMsZUFBZSxDQUFDLFFBQWdCO1lBQy9DLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSx5Q0FBbUIsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQy9GLElBQUksOENBQXdCLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN4QyxJQUFJO29CQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO29CQUMxRixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUM1QztnQkFBQyxPQUFPLEdBQUcsRUFBRSxFQUFFLGtCQUFrQixFQUFFO2FBQ3BDO1lBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7S0FFRCxDQUFBO0lBL0JZLDREQUF3Qjt1Q0FBeEIsd0JBQXdCO1FBR2xDLFdBQUEsMENBQXdCLENBQUE7UUFDeEIsV0FBQSxrRUFBZ0MsQ0FBQTtRQUNoQyxXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLHVDQUF5QixDQUFBO1FBQ3pCLFdBQUEsZ0NBQWUsQ0FBQTtRQUNmLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxxQ0FBcUIsQ0FBQTtPQVZYLHdCQUF3QixDQStCcEMifQ==