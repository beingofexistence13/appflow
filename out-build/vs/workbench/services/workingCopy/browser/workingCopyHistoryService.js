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
define(["require", "exports", "vs/platform/files/common/files", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/environment/common/environmentService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/configuration/common/configuration", "vs/workbench/services/workingCopy/common/workingCopyHistoryService", "vs/platform/instantiation/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyHistory"], function (require, exports, files_1, remoteAgentService_1, environmentService_1, uriIdentity_1, label_1, log_1, configuration_1, workingCopyHistoryService_1, extensions_1, workingCopyHistory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$t4b = void 0;
    let $t4b = class $t4b extends workingCopyHistoryService_1.$r4b {
        constructor(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, logService, configurationService) {
            super(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, logService, configurationService);
        }
        H() {
            return { flushOnChange: true /* because browsers support no long running shutdown */ };
        }
    };
    exports.$t4b = $t4b;
    exports.$t4b = $t4b = __decorate([
        __param(0, files_1.$6j),
        __param(1, remoteAgentService_1.$jm),
        __param(2, environmentService_1.$hJ),
        __param(3, uriIdentity_1.$Ck),
        __param(4, label_1.$Vz),
        __param(5, log_1.$5i),
        __param(6, configuration_1.$8h)
    ], $t4b);
    // Register Service
    (0, extensions_1.$mr)(workingCopyHistory_1.$v1b, $t4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workingCopyHistoryService.js.map