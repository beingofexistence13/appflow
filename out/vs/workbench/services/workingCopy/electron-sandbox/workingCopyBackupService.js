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
define(["require", "exports", "vs/nls", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/base/common/uri", "vs/platform/instantiation/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupTracker"], function (require, exports, nls_1, workingCopyBackupService_1, uri_1, extensions_1, workingCopyBackup_1, files_1, log_1, environmentService_1, platform_1, contributions_1, lifecycle_1, workingCopyBackupTracker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeWorkingCopyBackupService = void 0;
    let NativeWorkingCopyBackupService = class NativeWorkingCopyBackupService extends workingCopyBackupService_1.WorkingCopyBackupService {
        constructor(environmentService, fileService, logService, lifecycleService) {
            super(environmentService.backupPath ? uri_1.URI.file(environmentService.backupPath).with({ scheme: environmentService.userRoamingDataHome.scheme }) : undefined, fileService, logService);
            this.lifecycleService = lifecycleService;
            this.registerListeners();
        }
        registerListeners() {
            // Lifecycle: ensure to prolong the shutdown for as long
            // as pending backup operations have not finished yet.
            // Otherwise, we risk writing partial backups to disk.
            this._register(this.lifecycleService.onWillShutdown(event => event.join(this.joinBackups(), { id: 'join.workingCopyBackups', label: (0, nls_1.localize)('join.workingCopyBackups', "Backup working copies") })));
        }
    };
    exports.NativeWorkingCopyBackupService = NativeWorkingCopyBackupService;
    exports.NativeWorkingCopyBackupService = NativeWorkingCopyBackupService = __decorate([
        __param(0, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, log_1.ILogService),
        __param(3, lifecycle_1.ILifecycleService)
    ], NativeWorkingCopyBackupService);
    // Register Service
    (0, extensions_1.registerSingleton)(workingCopyBackup_1.IWorkingCopyBackupService, NativeWorkingCopyBackupService, 0 /* InstantiationType.Eager */);
    // Register Backup Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workingCopyBackupTracker_1.NativeWorkingCopyBackupTracker, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlCYWNrdXBTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2VsZWN0cm9uLXNhbmRib3gvd29ya2luZ0NvcHlCYWNrdXBTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWV6RixJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUErQixTQUFRLG1EQUF3QjtRQUUzRSxZQUNxQyxrQkFBc0QsRUFDNUUsV0FBeUIsRUFDMUIsVUFBdUIsRUFDQSxnQkFBbUM7WUFFdkUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUZoSixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBSXZFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFFeEIsd0RBQXdEO1lBQ3hELHNEQUFzRDtZQUN0RCxzREFBc0Q7WUFDdEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUseUJBQXlCLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHlCQUF5QixFQUFFLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2TSxDQUFDO0tBQ0QsQ0FBQTtJQXBCWSx3RUFBOEI7NkNBQTlCLDhCQUE4QjtRQUd4QyxXQUFBLHVEQUFrQyxDQUFBO1FBQ2xDLFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEsNkJBQWlCLENBQUE7T0FOUCw4QkFBOEIsQ0FvQjFDO0lBRUQsbUJBQW1CO0lBQ25CLElBQUEsOEJBQWlCLEVBQUMsNkNBQXlCLEVBQUUsOEJBQThCLGtDQUEwQixDQUFDO0lBRXRHLDBCQUEwQjtJQUMxQixtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMseURBQThCLGtDQUEwQixDQUFDIn0=