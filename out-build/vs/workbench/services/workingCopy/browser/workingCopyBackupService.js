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
define(["require", "exports", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/platform/log/common/log", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/platform/instantiation/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/resources", "vs/platform/workspace/common/workspace", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/workingCopy/browser/workingCopyBackupTracker"], function (require, exports, files_1, environmentService_1, log_1, workingCopyBackupService_1, extensions_1, workingCopyBackup_1, resources_1, workspace_1, platform_1, contributions_1, workingCopyBackupTracker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$m4b = void 0;
    let $m4b = class $m4b extends workingCopyBackupService_1.$h4b {
        constructor(contextService, environmentService, fileService, logService) {
            super((0, resources_1.$ig)(environmentService.userRoamingDataHome, 'Backups', contextService.getWorkspace().id), fileService, logService);
        }
    };
    exports.$m4b = $m4b;
    exports.$m4b = $m4b = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, environmentService_1.$hJ),
        __param(2, files_1.$6j),
        __param(3, log_1.$5i)
    ], $m4b);
    // Register Service
    (0, extensions_1.$mr)(workingCopyBackup_1.$EA, $m4b, 0 /* InstantiationType.Eager */);
    // Register Backup Tracker
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workingCopyBackupTracker_1.$l4b, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=workingCopyBackupService.js.map