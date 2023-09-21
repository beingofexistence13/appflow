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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/contrib/userDataSync/browser/userDataSync", "vs/platform/userDataSync/common/userDataSync", "vs/platform/notification/common/notification", "vs/base/common/lifecycle", "vs/nls", "vs/base/common/platform", "vs/workbench/contrib/userDataSync/browser/userDataSyncTrigger", "vs/base/common/actions", "vs/platform/product/common/productService", "vs/platform/commands/common/commands", "vs/workbench/services/host/browser/host", "vs/workbench/services/userDataSync/common/userDataSync"], function (require, exports, contributions_1, platform_1, userDataSync_1, userDataSync_2, notification_1, lifecycle_1, nls_1, platform_2, userDataSyncTrigger_1, actions_1, productService_1, commands_1, host_1, userDataSync_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let UserDataSyncReportIssueContribution = class UserDataSyncReportIssueContribution extends lifecycle_1.Disposable {
        constructor(userDataAutoSyncService, notificationService, productService, commandService, hostService) {
            super();
            this.notificationService = notificationService;
            this.productService = productService;
            this.commandService = commandService;
            this.hostService = hostService;
            this._register(userDataAutoSyncService.onError(error => this.onAutoSyncError(error)));
        }
        onAutoSyncError(error) {
            switch (error.code) {
                case "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */: {
                    const message = platform_2.isWeb ? (0, nls_1.localize)({ key: 'local too many requests - reload', comment: ['Settings Sync is the name of the feature'] }, "Settings sync is suspended temporarily because the current device is making too many requests. Please reload {0} to resume.", this.productService.nameLong)
                        : (0, nls_1.localize)({ key: 'local too many requests - restart', comment: ['Settings Sync is the name of the feature'] }, "Settings sync is suspended temporarily because the current device is making too many requests. Please restart {0} to resume.", this.productService.nameLong);
                    this.notificationService.notify({
                        severity: notification_1.Severity.Error,
                        message,
                        actions: {
                            primary: [
                                new actions_1.Action('Show Sync Logs', (0, nls_1.localize)('show sync logs', "Show Log"), undefined, true, () => this.commandService.executeCommand(userDataSync_3.SHOW_SYNC_LOG_COMMAND_ID)),
                                new actions_1.Action('Restart', platform_2.isWeb ? (0, nls_1.localize)('reload', "Reload") : (0, nls_1.localize)('restart', "Restart"), undefined, true, () => this.hostService.restart())
                            ]
                        }
                    });
                    return;
                }
                case "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */: {
                    const operationId = error.operationId ? (0, nls_1.localize)('operationId', "Operation Id: {0}", error.operationId) : undefined;
                    const message = (0, nls_1.localize)({ key: 'server too many requests', comment: ['Settings Sync is the name of the feature'] }, "Settings sync is disabled because the current device is making too many requests. Please wait for 10 minutes and turn on sync.");
                    this.notificationService.notify({
                        severity: notification_1.Severity.Error,
                        message: operationId ? `${message} ${operationId}` : message,
                        source: error.operationId ? (0, nls_1.localize)('settings sync', "Settings Sync. Operation Id: {0}", error.operationId) : undefined,
                        actions: {
                            primary: [
                                new actions_1.Action('Show Sync Logs', (0, nls_1.localize)('show sync logs', "Show Log"), undefined, true, () => this.commandService.executeCommand(userDataSync_3.SHOW_SYNC_LOG_COMMAND_ID)),
                            ]
                        }
                    });
                    return;
                }
            }
        }
    };
    UserDataSyncReportIssueContribution = __decorate([
        __param(0, userDataSync_2.IUserDataAutoSyncService),
        __param(1, notification_1.INotificationService),
        __param(2, productService_1.IProductService),
        __param(3, commands_1.ICommandService),
        __param(4, host_1.IHostService)
    ], UserDataSyncReportIssueContribution);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(userDataSync_1.UserDataSyncWorkbenchContribution, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(userDataSyncTrigger_1.UserDataSyncTrigger, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(UserDataSyncReportIssueContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VzZXJEYXRhU3luYy9icm93c2VyL3VzZXJEYXRhU3luYy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFrQmhHLElBQU0sbUNBQW1DLEdBQXpDLE1BQU0sbUNBQW9DLFNBQVEsc0JBQVU7UUFFM0QsWUFDMkIsdUJBQWlELEVBQ3BDLG1CQUF5QyxFQUM5QyxjQUErQixFQUMvQixjQUErQixFQUNsQyxXQUF5QjtZQUV4RCxLQUFLLEVBQUUsQ0FBQztZQUwrQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQzlDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUMvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFHeEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRU8sZUFBZSxDQUFDLEtBQXdCO1lBQy9DLFFBQVEsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDbkIsNEVBQStDLENBQUMsQ0FBQztvQkFDaEQsTUFBTSxPQUFPLEdBQUcsZ0JBQUssQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsa0NBQWtDLEVBQUUsT0FBTyxFQUFFLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLDZIQUE2SCxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDO3dCQUNoUyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsbUNBQW1DLEVBQUUsT0FBTyxFQUFFLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLDhIQUE4SCxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQy9RLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUM7d0JBQy9CLFFBQVEsRUFBRSx1QkFBUSxDQUFDLEtBQUs7d0JBQ3hCLE9BQU87d0JBQ1AsT0FBTyxFQUFFOzRCQUNSLE9BQU8sRUFBRTtnQ0FDUixJQUFJLGdCQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyx1Q0FBd0IsQ0FBQyxDQUFDO2dDQUN6SixJQUFJLGdCQUFNLENBQUMsU0FBUyxFQUFFLGdCQUFLLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs2QkFDL0k7eUJBQ0Q7cUJBQ0QsQ0FBQyxDQUFDO29CQUNILE9BQU87aUJBQ1A7Z0JBQ0Qsd0VBQTBDLENBQUMsQ0FBQztvQkFDM0MsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO29CQUNwSCxNQUFNLE9BQU8sR0FBRyxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSwwQkFBMEIsRUFBRSxPQUFPLEVBQUUsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsZ0lBQWdJLENBQUMsQ0FBQztvQkFDdlAsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQzt3QkFDL0IsUUFBUSxFQUFFLHVCQUFRLENBQUMsS0FBSzt3QkFDeEIsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU87d0JBQzVELE1BQU0sRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsa0NBQWtDLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO3dCQUN4SCxPQUFPLEVBQUU7NEJBQ1IsT0FBTyxFQUFFO2dDQUNSLElBQUksZ0JBQU0sQ0FBQyxnQkFBZ0IsRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLHVDQUF3QixDQUFDLENBQUM7NkJBQ3pKO3lCQUNEO3FCQUNELENBQUMsQ0FBQztvQkFDSCxPQUFPO2lCQUNQO2FBQ0Q7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQS9DSyxtQ0FBbUM7UUFHdEMsV0FBQSx1Q0FBd0IsQ0FBQTtRQUN4QixXQUFBLG1DQUFvQixDQUFBO1FBQ3BCLFdBQUEsZ0NBQWUsQ0FBQTtRQUNmLFdBQUEsMEJBQWUsQ0FBQTtRQUNmLFdBQUEsbUJBQVksQ0FBQTtPQVBULG1DQUFtQyxDQStDeEM7SUFFRCxNQUFNLGlCQUFpQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0RyxpQkFBaUIsQ0FBQyw2QkFBNkIsQ0FBQyxnREFBaUMsa0NBQTBCLENBQUM7SUFDNUcsaUJBQWlCLENBQUMsNkJBQTZCLENBQUMseUNBQW1CLG9DQUE0QixDQUFDO0lBQ2hHLGlCQUFpQixDQUFDLDZCQUE2QixDQUFDLG1DQUFtQyxvQ0FBNEIsQ0FBQyJ9