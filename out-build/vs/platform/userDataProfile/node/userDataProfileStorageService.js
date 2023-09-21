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
define(["require", "exports", "vs/platform/storage/common/storage", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/ipc/common/mainProcessService", "vs/platform/userDataProfile/common/userDataProfileStorageService"], function (require, exports, storage_1, log_1, userDataProfile_1, mainProcessService_1, userDataProfileStorageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$37b = void 0;
    let $37b = class $37b extends userDataProfileStorageService_1.$gAb {
        constructor(mainProcessService, userDataProfilesService, storageService, logService) {
            super(mainProcessService, userDataProfilesService, storageService, logService);
        }
    };
    exports.$37b = $37b;
    exports.$37b = $37b = __decorate([
        __param(0, mainProcessService_1.$o7b),
        __param(1, userDataProfile_1.$Ek),
        __param(2, storage_1.$Vo),
        __param(3, log_1.$5i)
    ], $37b);
});
//# sourceMappingURL=userDataProfileStorageService.js.map