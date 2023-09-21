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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/log/common/log", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, errors_1, lifecycle_1, uri_1, log_1, environmentService_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RZb = void 0;
    let $RZb = class $RZb extends lifecycle_1.$kc {
        constructor(environmentService, userDataProfileImportExportService, logService) {
            super();
            if (environmentService.options?.profileToPreview) {
                userDataProfileImportExportService.importProfile(uri_1.URI.revive(environmentService.options.profileToPreview), { mode: 'both' })
                    .then(null, error => logService.error('Error while previewing the profile', (0, errors_1.$8)(error)));
            }
        }
    };
    exports.$RZb = $RZb;
    exports.$RZb = $RZb = __decorate([
        __param(0, environmentService_1.$LT),
        __param(1, userDataProfile_1.$HJ),
        __param(2, log_1.$5i)
    ], $RZb);
});
//# sourceMappingURL=userDataProfilePreview.js.map