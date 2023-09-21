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
define(["require", "exports", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/ipc/common/mainProcessService"], function (require, exports, userDataProfileStorageService_1, extensions_1, storage_1, log_1, userDataProfile_1, mainProcessService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U$b = void 0;
    let $U$b = class $U$b extends userDataProfileStorageService_1.$gAb {
        constructor(mainProcessService, userDataProfilesService, storageService, logService) {
            super(mainProcessService, userDataProfilesService, storageService, logService);
        }
    };
    exports.$U$b = $U$b;
    exports.$U$b = $U$b = __decorate([
        __param(0, mainProcessService_1.$o7b),
        __param(1, userDataProfile_1.$Ek),
        __param(2, storage_1.$Vo),
        __param(3, log_1.$5i)
    ], $U$b);
    (0, extensions_1.$mr)(userDataProfileStorageService_1.$eAb, $U$b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=userDataProfileStorageService.js.map