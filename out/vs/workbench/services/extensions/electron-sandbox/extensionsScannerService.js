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
define(["require", "exports", "vs/base/common/uri", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, uri_1, environment_1, extensionsProfileScannerService_1, extensionsScannerService_1, files_1, extensions_1, instantiation_1, log_1, productService_1, uriIdentity_1, userDataProfile_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsScannerService = void 0;
    let ExtensionsScannerService = class ExtensionsScannerService extends extensionsScannerService_1.NativeExtensionsScannerService {
        constructor(userDataProfileService, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
            super(uri_1.URI.file(environmentService.builtinExtensionsPath), uri_1.URI.file(environmentService.extensionsPath), environmentService.userHome, userDataProfileService.currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService);
        }
    };
    exports.ExtensionsScannerService = ExtensionsScannerService;
    exports.ExtensionsScannerService = ExtensionsScannerService = __decorate([
        __param(0, userDataProfile_2.IUserDataProfileService),
        __param(1, userDataProfile_1.IUserDataProfilesService),
        __param(2, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(3, files_1.IFileService),
        __param(4, log_1.ILogService),
        __param(5, environment_1.INativeEnvironmentService),
        __param(6, productService_1.IProductService),
        __param(7, uriIdentity_1.IUriIdentityService),
        __param(8, instantiation_1.IInstantiationService)
    ], ExtensionsScannerService);
    (0, extensions_1.registerSingleton)(extensionsScannerService_1.IExtensionsScannerService, ExtensionsScannerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1NjYW5uZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvZWxlY3Ryb24tc2FuZGJveC9leHRlbnNpb25zU2Nhbm5lclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZXpGLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEseURBQThCO1FBRTNFLFlBQzBCLHNCQUErQyxFQUM5Qyx1QkFBaUQsRUFDekMsK0JBQWlFLEVBQ3JGLFdBQXlCLEVBQzFCLFVBQXVCLEVBQ1Qsa0JBQTZDLEVBQ3ZELGNBQStCLEVBQzNCLGtCQUF1QyxFQUNyQyxvQkFBMkM7WUFFbEUsS0FBSyxDQUNKLFNBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMscUJBQXFCLENBQUMsRUFDbEQsU0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsRUFDM0Msa0JBQWtCLENBQUMsUUFBUSxFQUMzQixzQkFBc0IsQ0FBQyxjQUFjLEVBQ3JDLHVCQUF1QixFQUFFLCtCQUErQixFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDbkssQ0FBQztLQUVELENBQUE7SUFyQlksNERBQXdCO3VDQUF4Qix3QkFBd0I7UUFHbEMsV0FBQSx5Q0FBdUIsQ0FBQTtRQUN2QixXQUFBLDBDQUF3QixDQUFBO1FBQ3hCLFdBQUEsa0VBQWdDLENBQUE7UUFDaEMsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxpQkFBVyxDQUFBO1FBQ1gsV0FBQSx1Q0FBeUIsQ0FBQTtRQUN6QixXQUFBLGdDQUFlLENBQUE7UUFDZixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEscUNBQXFCLENBQUE7T0FYWCx3QkFBd0IsQ0FxQnBDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyxvREFBeUIsRUFBRSx3QkFBd0Isb0NBQTRCLENBQUMifQ==