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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/files/common/files", "vs/base/common/network", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/configuration/common/configuration", "vs/platform/extensionResourceLoader/common/extensionResourceLoader"], function (require, exports, extensions_1, files_1, network_1, productService_1, storage_1, environment_1, log_1, configuration_1, extensionResourceLoader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let ExtensionResourceLoaderService = class ExtensionResourceLoaderService extends extensionResourceLoader_1.AbstractExtensionResourceLoaderService {
        constructor(fileService, storageService, productService, environmentService, configurationService, _logService) {
            super(fileService, storageService, productService, environmentService, configurationService);
            this._logService = _logService;
        }
        async readExtensionResource(uri) {
            uri = network_1.FileAccess.uriToBrowserUri(uri);
            if (uri.scheme !== network_1.Schemas.http && uri.scheme !== network_1.Schemas.https) {
                const result = await this._fileService.readFile(uri);
                return result.value.toString();
            }
            const requestInit = {};
            if (this.isExtensionGalleryResource(uri)) {
                requestInit.headers = await this.getExtensionGalleryRequestHeaders();
                requestInit.mode = 'cors'; /* set mode to cors so that above headers are always passed */
            }
            const response = await fetch(uri.toString(true), requestInit);
            if (response.status !== 200) {
                this._logService.info(`Request to '${uri.toString(true)}' failed with status code ${response.status}`);
                throw new Error(response.statusText);
            }
            return response.text();
        }
    };
    ExtensionResourceLoaderService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, storage_1.IStorageService),
        __param(2, productService_1.IProductService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, log_1.ILogService)
    ], ExtensionResourceLoaderService);
    (0, extensions_1.registerSingleton)(extensionResourceLoader_1.IExtensionResourceLoaderService, ExtensionResourceLoaderService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVzb3VyY2VMb2FkZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uUmVzb3VyY2VMb2FkZXIvYnJvd3Nlci9leHRlbnNpb25SZXNvdXJjZUxvYWRlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFhaEcsSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBK0IsU0FBUSxnRUFBc0M7UUFJbEYsWUFDZSxXQUF5QixFQUN0QixjQUErQixFQUMvQixjQUErQixFQUMzQixrQkFBdUMsRUFDckMsb0JBQTJDLEVBQ3BDLFdBQXdCO1lBRXRELEtBQUssQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRi9ELGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBR3ZELENBQUM7UUFFRCxLQUFLLENBQUMscUJBQXFCLENBQUMsR0FBUTtZQUNuQyxHQUFHLEdBQUcsb0JBQVUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFdEMsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUMvQjtZQUVELE1BQU0sV0FBVyxHQUFnQixFQUFFLENBQUM7WUFDcEMsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3pDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsaUNBQWlDLEVBQUUsQ0FBQztnQkFDckUsV0FBVyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyw4REFBOEQ7YUFDekY7WUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzlELElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RyxNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNyQztZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3hCLENBQUM7S0FDRCxDQUFBO0lBcENLLDhCQUE4QjtRQUtqQyxXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLGdDQUFlLENBQUE7UUFDZixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxpQkFBVyxDQUFBO09BVlIsOEJBQThCLENBb0NuQztJQUVELElBQUEsOEJBQWlCLEVBQUMseURBQStCLEVBQUUsOEJBQThCLG9DQUE0QixDQUFDIn0=