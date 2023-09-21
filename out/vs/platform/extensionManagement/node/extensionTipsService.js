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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/platform/environment/common/environment", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/native/common/native", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/extensionManagement/common/extensionTipsService"], function (require, exports, extensionManagement_1, files_1, productService_1, environment_1, extensionRecommendations_1, native_1, storage_1, telemetry_1, extensionTipsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionTipsService = void 0;
    let ExtensionTipsService = class ExtensionTipsService extends extensionTipsService_1.AbstractNativeExtensionTipsService {
        constructor(environmentService, telemetryService, extensionManagementService, storageService, nativeHostService, extensionRecommendationNotificationService, fileService, productService) {
            super(environmentService.userHome, nativeHostService, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService);
        }
    };
    exports.ExtensionTipsService = ExtensionTipsService;
    exports.ExtensionTipsService = ExtensionTipsService = __decorate([
        __param(0, environment_1.INativeEnvironmentService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, extensionManagement_1.IExtensionManagementService),
        __param(3, storage_1.IStorageService),
        __param(4, native_1.INativeHostService),
        __param(5, extensionRecommendations_1.IExtensionRecommendationNotificationService),
        __param(6, files_1.IFileService),
        __param(7, productService_1.IProductService)
    ], ExtensionTipsService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uVGlwc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L25vZGUvZXh0ZW5zaW9uVGlwc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBWXpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEseURBQWtDO1FBRTNFLFlBQzRCLGtCQUE2QyxFQUNyRCxnQkFBbUMsRUFDekIsMEJBQXVELEVBQ25FLGNBQStCLEVBQzVCLGlCQUFxQyxFQUNaLDBDQUF1RixFQUN0SCxXQUF5QixFQUN0QixjQUErQjtZQUVoRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLDBCQUEwQixFQUFFLGNBQWMsRUFBRSwwQ0FBMEMsRUFBRSxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDOUwsQ0FBQztLQUNELENBQUE7SUFkWSxvREFBb0I7bUNBQXBCLG9CQUFvQjtRQUc5QixXQUFBLHVDQUF5QixDQUFBO1FBQ3pCLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSxpREFBMkIsQ0FBQTtRQUMzQixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLDJCQUFrQixDQUFBO1FBQ2xCLFdBQUEsc0VBQTJDLENBQUE7UUFDM0MsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxnQ0FBZSxDQUFBO09BVkwsb0JBQW9CLENBY2hDIn0=