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
define(["require", "exports", "vs/nls!vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupService", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/base/common/uri", "vs/platform/instantiation/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupTracker"], function (require, exports, nls_1, workingCopyBackupService_1, uri_1, extensions_1, workingCopyBackup_1, files_1, log_1, environmentService_1, platform_1, contributions_1, lifecycle_1, workingCopyBackupTracker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5_b = void 0;
    let $5_b = class $5_b extends workingCopyBackupService_1.$h4b {
        constructor(environmentService, fileService, logService, c) {
            super(environmentService.backupPath ? uri_1.URI.file(environmentService.backupPath).with({ scheme: environmentService.userRoamingDataHome.scheme }) : undefined, fileService, logService);
            this.c = c;
            this.j();
        }
        j() {
            // Lifecycle: ensure to prolong the shutdown for as long
            // as pending backup operations have not finished yet.
            // Otherwise, we risk writing partial backups to disk.
            this.B(this.c.onWillShutdown(event => event.join(this.joinBackups(), { id: 'join.workingCopyBackups', label: (0, nls_1.localize)(0, null) })));
        }
    };
    exports.$5_b = $5_b;
    exports.$5_b = $5_b = __decorate([
        __param(0, environmentService_1.$1$b),
        __param(1, files_1.$6j),
        __param(2, log_1.$5i),
        __param(3, lifecycle_1.$7y)
    ], $5_b);
    // Register Service
    (0, extensions_1.$mr)(workingCopyBackup_1.$EA, $5_b, 0 /* InstantiationType.Eager */);
    // Register Backup Tracker
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workingCopyBackupTracker_1.$4_b, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=workingCopyBackupService.js.map