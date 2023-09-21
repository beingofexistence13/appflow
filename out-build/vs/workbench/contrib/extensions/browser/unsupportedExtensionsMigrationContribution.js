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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/extensionManagement/common/unsupportedExtensionsMigration", "vs/platform/log/common/log", "vs/workbench/services/extensionManagement/common/extensionManagement"], function (require, exports, extensionManagement_1, extensionStorage_1, unsupportedExtensionsMigration_1, log_1, extensionManagement_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$Ub = void 0;
    let $$Ub = class $$Ub {
        constructor(extensionManagementServerService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService) {
            // Unsupported extensions are not migrated for local extension management server, because it is done in shared process
            if (extensionManagementServerService.remoteExtensionManagementServer) {
                (0, unsupportedExtensionsMigration_1.$0Ub)(extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService);
            }
            if (extensionManagementServerService.webExtensionManagementServer) {
                (0, unsupportedExtensionsMigration_1.$0Ub)(extensionManagementServerService.webExtensionManagementServer.extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService);
            }
        }
    };
    exports.$$Ub = $$Ub;
    exports.$$Ub = $$Ub = __decorate([
        __param(0, extensionManagement_2.$fcb),
        __param(1, extensionManagement_1.$Zn),
        __param(2, extensionStorage_1.$Tz),
        __param(3, extensionManagement_1.$5n),
        __param(4, log_1.$5i)
    ], $$Ub);
});
//# sourceMappingURL=unsupportedExtensionsMigrationContribution.js.map