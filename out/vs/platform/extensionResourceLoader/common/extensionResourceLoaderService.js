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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/storage/common/storage", "vs/platform/environment/common/environment", "vs/platform/configuration/common/configuration", "vs/base/common/cancellation", "vs/platform/extensionResourceLoader/common/extensionResourceLoader"], function (require, exports, extensions_1, files_1, productService_1, request_1, storage_1, environment_1, configuration_1, cancellation_1, extensionResourceLoader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionResourceLoaderService = void 0;
    let ExtensionResourceLoaderService = class ExtensionResourceLoaderService extends extensionResourceLoader_1.AbstractExtensionResourceLoaderService {
        constructor(fileService, storageService, productService, environmentService, configurationService, _requestService) {
            super(fileService, storageService, productService, environmentService, configurationService);
            this._requestService = _requestService;
        }
        async readExtensionResource(uri) {
            if (this.isExtensionGalleryResource(uri)) {
                const headers = await this.getExtensionGalleryRequestHeaders();
                const requestContext = await this._requestService.request({ url: uri.toString(), headers }, cancellation_1.CancellationToken.None);
                return (await (0, request_1.asTextOrError)(requestContext)) || '';
            }
            const result = await this._fileService.readFile(uri);
            return result.value.toString();
        }
    };
    exports.ExtensionResourceLoaderService = ExtensionResourceLoaderService;
    exports.ExtensionResourceLoaderService = ExtensionResourceLoaderService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, storage_1.IStorageService),
        __param(2, productService_1.IProductService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, request_1.IRequestService)
    ], ExtensionResourceLoaderService);
    (0, extensions_1.registerSingleton)(extensionResourceLoader_1.IExtensionResourceLoaderService, ExtensionResourceLoaderService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVzb3VyY2VMb2FkZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uUmVzb3VyY2VMb2FkZXIvY29tbW9uL2V4dGVuc2lvblJlc291cmNlTG9hZGVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhekYsSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBK0IsU0FBUSxnRUFBc0M7UUFFekYsWUFDZSxXQUF5QixFQUN0QixjQUErQixFQUMvQixjQUErQixFQUMzQixrQkFBdUMsRUFDckMsb0JBQTJDLEVBQ2hDLGVBQWdDO1lBRWxFLEtBQUssQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRjNELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUduRSxDQUFDO1FBRUQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEdBQVE7WUFDbkMsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3pDLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxFQUFFLENBQUM7Z0JBQy9ELE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwSCxPQUFPLENBQUMsTUFBTSxJQUFBLHVCQUFhLEVBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDbkQ7WUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQyxDQUFDO0tBRUQsQ0FBQTtJQXZCWSx3RUFBOEI7NkNBQTlCLDhCQUE4QjtRQUd4QyxXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLGdDQUFlLENBQUE7UUFDZixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSx5QkFBZSxDQUFBO09BUkwsOEJBQThCLENBdUIxQztJQUVELElBQUEsOEJBQWlCLEVBQUMseURBQStCLEVBQUUsOEJBQThCLG9DQUE0QixDQUFDIn0=