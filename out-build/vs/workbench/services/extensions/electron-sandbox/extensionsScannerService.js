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
    exports.$V_b = void 0;
    let $V_b = class $V_b extends extensionsScannerService_1.$sp {
        constructor(userDataProfileService, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
            super(uri_1.URI.file(environmentService.builtinExtensionsPath), uri_1.URI.file(environmentService.extensionsPath), environmentService.userHome, userDataProfileService.currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService);
        }
    };
    exports.$V_b = $V_b;
    exports.$V_b = $V_b = __decorate([
        __param(0, userDataProfile_2.$CJ),
        __param(1, userDataProfile_1.$Ek),
        __param(2, extensionsProfileScannerService_1.$kp),
        __param(3, files_1.$6j),
        __param(4, log_1.$5i),
        __param(5, environment_1.$Jh),
        __param(6, productService_1.$kj),
        __param(7, uriIdentity_1.$Ck),
        __param(8, instantiation_1.$Ah)
    ], $V_b);
    (0, extensions_1.$mr)(extensionsScannerService_1.$op, $V_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionsScannerService.js.map