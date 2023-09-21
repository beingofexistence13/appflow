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
define(["require", "exports", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/workbench/services/workingCopy/common/workingCopyBackupTracker", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, workingCopyBackup_1, filesConfigurationService_1, workingCopyService_1, lifecycle_1, log_1, workingCopyBackupTracker_1, workingCopyEditorService_1, editorService_1, editorGroupsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserWorkingCopyBackupTracker = void 0;
    let BrowserWorkingCopyBackupTracker = class BrowserWorkingCopyBackupTracker extends workingCopyBackupTracker_1.WorkingCopyBackupTracker {
        constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, logService, workingCopyEditorService, editorService, editorGroupService) {
            super(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService, editorGroupService);
        }
        onFinalBeforeShutdown(reason) {
            // Web: we cannot perform long running in the shutdown phase
            // As such we need to check sync if there are any modified working
            // copies that have not been backed up yet and then prevent the
            // shutdown if that is the case.
            const modifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
            if (!modifiedWorkingCopies.length) {
                return false; // nothing modified: no veto
            }
            if (!this.filesConfigurationService.isHotExitEnabled) {
                return true; // modified without backup: veto
            }
            for (const modifiedWorkingCopy of modifiedWorkingCopies) {
                if (!this.workingCopyBackupService.hasBackupSync(modifiedWorkingCopy, this.getContentVersion(modifiedWorkingCopy))) {
                    this.logService.warn('Unload veto: pending backups');
                    return true; // modified without backup: veto
                }
            }
            return false; // modified and backed up: no veto
        }
    };
    exports.BrowserWorkingCopyBackupTracker = BrowserWorkingCopyBackupTracker;
    exports.BrowserWorkingCopyBackupTracker = BrowserWorkingCopyBackupTracker = __decorate([
        __param(0, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(1, filesConfigurationService_1.IFilesConfigurationService),
        __param(2, workingCopyService_1.IWorkingCopyService),
        __param(3, lifecycle_1.ILifecycleService),
        __param(4, log_1.ILogService),
        __param(5, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(6, editorService_1.IEditorService),
        __param(7, editorGroupsService_1.IEditorGroupsService)
    ], BrowserWorkingCopyBackupTracker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlCYWNrdXBUcmFja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2Jyb3dzZXIvd29ya2luZ0NvcHlCYWNrdXBUcmFja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLCtCQUErQixHQUFyQyxNQUFNLCtCQUFnQyxTQUFRLG1EQUF3QjtRQUU1RSxZQUM0Qix3QkFBbUQsRUFDbEQseUJBQXFELEVBQzVELGtCQUF1QyxFQUN6QyxnQkFBbUMsRUFDekMsVUFBdUIsRUFDVCx3QkFBbUQsRUFDOUQsYUFBNkIsRUFDdkIsa0JBQXdDO1lBRTlELEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUseUJBQXlCLEVBQUUsd0JBQXdCLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDM0ssQ0FBQztRQUVTLHFCQUFxQixDQUFDLE1BQXNCO1lBRXJELDREQUE0RDtZQUM1RCxrRUFBa0U7WUFDbEUsK0RBQStEO1lBQy9ELGdDQUFnQztZQUVoQyxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxxQkFBcUIsQ0FBQztZQUM1RSxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFO2dCQUNsQyxPQUFPLEtBQUssQ0FBQyxDQUFDLDRCQUE0QjthQUMxQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3JELE9BQU8sSUFBSSxDQUFDLENBQUMsZ0NBQWdDO2FBQzdDO1lBRUQsS0FBSyxNQUFNLG1CQUFtQixJQUFJLHFCQUFxQixFQUFFO2dCQUN4RCxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFO29CQUNuSCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO29CQUVyRCxPQUFPLElBQUksQ0FBQyxDQUFDLGdDQUFnQztpQkFDN0M7YUFDRDtZQUVELE9BQU8sS0FBSyxDQUFDLENBQUMsa0NBQWtDO1FBQ2pELENBQUM7S0FDRCxDQUFBO0lBekNZLDBFQUErQjs4Q0FBL0IsK0JBQStCO1FBR3pDLFdBQUEsNkNBQXlCLENBQUE7UUFDekIsV0FBQSxzREFBMEIsQ0FBQTtRQUMxQixXQUFBLHdDQUFtQixDQUFBO1FBQ25CLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSxpQkFBVyxDQUFBO1FBQ1gsV0FBQSxvREFBeUIsQ0FBQTtRQUN6QixXQUFBLDhCQUFjLENBQUE7UUFDZCxXQUFBLDBDQUFvQixDQUFBO09BVlYsK0JBQStCLENBeUMzQyJ9