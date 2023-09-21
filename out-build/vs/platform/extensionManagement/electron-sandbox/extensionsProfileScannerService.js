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
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/telemetry/common/telemetry", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/files/common/files", "vs/platform/environment/common/environment", "vs/base/common/uri"], function (require, exports, log_1, userDataProfile_1, uriIdentity_1, telemetry_1, extensionsProfileScannerService_1, files_1, environment_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$t$b = void 0;
    let $t$b = class $t$b extends extensionsProfileScannerService_1.$lp {
        constructor(environmentService, fileService, userDataProfilesService, uriIdentityService, telemetryService, logService) {
            super(uri_1.URI.file(environmentService.extensionsPath), fileService, userDataProfilesService, uriIdentityService, telemetryService, logService);
        }
    };
    exports.$t$b = $t$b;
    exports.$t$b = $t$b = __decorate([
        __param(0, environment_1.$Jh),
        __param(1, files_1.$6j),
        __param(2, userDataProfile_1.$Ek),
        __param(3, uriIdentity_1.$Ck),
        __param(4, telemetry_1.$9k),
        __param(5, log_1.$5i)
    ], $t$b);
});
//# sourceMappingURL=extensionsProfileScannerService.js.map