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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/extensionManagement/common/unsupportedExtensionsMigration", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/log/common/log", "vs/platform/storage/common/storage"], function (require, exports, lifecycle_1, extensionManagement_1, extensionStorage_1, unsupportedExtensionsMigration_1, extensionManagementService_1, log_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsContributions = void 0;
    let ExtensionsContributions = class ExtensionsContributions extends lifecycle_1.Disposable {
        constructor(extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, storageService, logService) {
            super();
            extensionManagementService.cleanUp();
            (0, unsupportedExtensionsMigration_1.migrateUnsupportedExtensions)(extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService);
            extensionStorage_1.ExtensionStorageService.removeOutdatedExtensionVersions(extensionManagementService, storageService);
        }
    };
    exports.ExtensionsContributions = ExtensionsContributions;
    exports.ExtensionsContributions = ExtensionsContributions = __decorate([
        __param(0, extensionManagementService_1.INativeServerExtensionManagementService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, extensionStorage_1.IExtensionStorageService),
        __param(3, extensionManagement_1.IGlobalExtensionEnablementService),
        __param(4, storage_1.IStorageService),
        __param(5, log_1.ILogService)
    ], ExtensionsContributions);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2NvZGUvbm9kZS9zaGFyZWRQcm9jZXNzL2NvbnRyaWIvZXh0ZW5zaW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVekYsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSxzQkFBVTtRQUN0RCxZQUMwQywwQkFBbUUsRUFDbEYsdUJBQWlELEVBQ2pELHVCQUFpRCxFQUN4QywwQkFBNkQsRUFDL0UsY0FBK0IsRUFDbkMsVUFBdUI7WUFFcEMsS0FBSyxFQUFFLENBQUM7WUFFUiwwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNyQyxJQUFBLDZEQUE0QixFQUFDLDBCQUEwQixFQUFFLHVCQUF1QixFQUFFLHVCQUF1QixFQUFFLDBCQUEwQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ25KLDBDQUF1QixDQUFDLCtCQUErQixDQUFDLDBCQUEwQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3JHLENBQUM7S0FFRCxDQUFBO0lBaEJZLDBEQUF1QjtzQ0FBdkIsdUJBQXVCO1FBRWpDLFdBQUEsb0VBQXVDLENBQUE7UUFDdkMsV0FBQSw4Q0FBd0IsQ0FBQTtRQUN4QixXQUFBLDJDQUF3QixDQUFBO1FBQ3hCLFdBQUEsdURBQWlDLENBQUE7UUFDakMsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSxpQkFBVyxDQUFBO09BUEQsdUJBQXVCLENBZ0JuQyJ9