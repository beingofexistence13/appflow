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
    exports.BrowserWorkingCopyBackupService = void 0;
    let BrowserWorkingCopyBackupService = class BrowserWorkingCopyBackupService extends workingCopyBackupService_1.WorkingCopyBackupService {
        constructor(contextService, environmentService, fileService, logService) {
            super((0, resources_1.joinPath)(environmentService.userRoamingDataHome, 'Backups', contextService.getWorkspace().id), fileService, logService);
        }
    };
    exports.BrowserWorkingCopyBackupService = BrowserWorkingCopyBackupService;
    exports.BrowserWorkingCopyBackupService = BrowserWorkingCopyBackupService = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, files_1.IFileService),
        __param(3, log_1.ILogService)
    ], BrowserWorkingCopyBackupService);
    // Register Service
    (0, extensions_1.registerSingleton)(workingCopyBackup_1.IWorkingCopyBackupService, BrowserWorkingCopyBackupService, 0 /* InstantiationType.Eager */);
    // Register Backup Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workingCopyBackupTracker_1.BrowserWorkingCopyBackupTracker, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlCYWNrdXBTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2Jyb3dzZXIvd29ya2luZ0NvcHlCYWNrdXBTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWV6RixJQUFNLCtCQUErQixHQUFyQyxNQUFNLCtCQUFnQyxTQUFRLG1EQUF3QjtRQUU1RSxZQUMyQixjQUF3QyxFQUNwQyxrQkFBZ0QsRUFDaEUsV0FBeUIsRUFDMUIsVUFBdUI7WUFFcEMsS0FBSyxDQUFDLElBQUEsb0JBQVEsRUFBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvSCxDQUFDO0tBQ0QsQ0FBQTtJQVZZLDBFQUErQjs4Q0FBL0IsK0JBQStCO1FBR3pDLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSxpREFBNEIsQ0FBQTtRQUM1QixXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLGlCQUFXLENBQUE7T0FORCwrQkFBK0IsQ0FVM0M7SUFFRCxtQkFBbUI7SUFDbkIsSUFBQSw4QkFBaUIsRUFBQyw2Q0FBeUIsRUFBRSwrQkFBK0Isa0NBQTBCLENBQUM7SUFFdkcsMEJBQTBCO0lBQzFCLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQywwREFBK0Isa0NBQTBCLENBQUMifQ==