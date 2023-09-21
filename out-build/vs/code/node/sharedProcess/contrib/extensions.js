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
    exports.$d8b = void 0;
    let $d8b = class $d8b extends lifecycle_1.$kc {
        constructor(extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, storageService, logService) {
            super();
            extensionManagementService.cleanUp();
            (0, unsupportedExtensionsMigration_1.$0Ub)(extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService);
            extensionStorage_1.$Uz.removeOutdatedExtensionVersions(extensionManagementService, storageService);
        }
    };
    exports.$d8b = $d8b;
    exports.$d8b = $d8b = __decorate([
        __param(0, extensionManagementService_1.$yp),
        __param(1, extensionManagement_1.$Zn),
        __param(2, extensionStorage_1.$Tz),
        __param(3, extensionManagement_1.$5n),
        __param(4, storage_1.$Vo),
        __param(5, log_1.$5i)
    ], $d8b);
});
//# sourceMappingURL=extensions.js.map