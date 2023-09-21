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
    exports.NativeUserDataProfileStorageService = void 0;
    let NativeUserDataProfileStorageService = class NativeUserDataProfileStorageService extends userDataProfileStorageService_1.RemoteUserDataProfileStorageService {
        constructor(mainProcessService, userDataProfilesService, storageService, logService) {
            super(mainProcessService, userDataProfilesService, storageService, logService);
        }
    };
    exports.NativeUserDataProfileStorageService = NativeUserDataProfileStorageService;
    exports.NativeUserDataProfileStorageService = NativeUserDataProfileStorageService = __decorate([
        __param(0, mainProcessService_1.IMainProcessService),
        __param(1, userDataProfile_1.IUserDataProfilesService),
        __param(2, storage_1.IStorageService),
        __param(3, log_1.ILogService)
    ], NativeUserDataProfileStorageService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlU3RvcmFnZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVByb2ZpbGUvbm9kZS91c2VyRGF0YVByb2ZpbGVTdG9yYWdlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFRekYsSUFBTSxtQ0FBbUMsR0FBekMsTUFBTSxtQ0FBb0MsU0FBUSxtRUFBbUM7UUFFM0YsWUFDc0Isa0JBQXVDLEVBQ2xDLHVCQUFpRCxFQUMxRCxjQUErQixFQUNuQyxVQUF1QjtZQUVwQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsdUJBQXVCLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7S0FDRCxDQUFBO0lBVlksa0ZBQW1DO2tEQUFuQyxtQ0FBbUM7UUFHN0MsV0FBQSx3Q0FBbUIsQ0FBQTtRQUNuQixXQUFBLDBDQUF3QixDQUFBO1FBQ3hCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsaUJBQVcsQ0FBQTtPQU5ELG1DQUFtQyxDQVUvQyJ9