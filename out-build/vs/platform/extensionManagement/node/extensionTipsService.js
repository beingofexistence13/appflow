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
    exports.$k8b = void 0;
    let $k8b = class $k8b extends extensionTipsService_1.$D4b {
        constructor(environmentService, telemetryService, extensionManagementService, storageService, nativeHostService, extensionRecommendationNotificationService, fileService, productService) {
            super(environmentService.userHome, nativeHostService, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService);
        }
    };
    exports.$k8b = $k8b;
    exports.$k8b = $k8b = __decorate([
        __param(0, environment_1.$Jh),
        __param(1, telemetry_1.$9k),
        __param(2, extensionManagement_1.$2n),
        __param(3, storage_1.$Vo),
        __param(4, native_1.$05b),
        __param(5, extensionRecommendations_1.$TUb),
        __param(6, files_1.$6j),
        __param(7, productService_1.$kj)
    ], $k8b);
});
//# sourceMappingURL=extensionTipsService.js.map