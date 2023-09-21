/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/userDataSync/browser/userDataSyncEnablementService"], function (require, exports, extensions_1, userDataSync_1, userDataSyncEnablementService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebUserDataSyncEnablementService = void 0;
    class WebUserDataSyncEnablementService extends userDataSyncEnablementService_1.UserDataSyncEnablementService {
        constructor() {
            super(...arguments);
            this.enabled = undefined;
        }
        canToggleEnablement() {
            return this.isTrusted() && super.canToggleEnablement();
        }
        isEnabled() {
            if (!this.isTrusted()) {
                return false;
            }
            if (this.enabled === undefined) {
                this.enabled = this.workbenchEnvironmentService.options?.settingsSyncOptions?.enabled;
            }
            if (this.enabled === undefined) {
                this.enabled = super.isEnabled();
            }
            return this.enabled;
        }
        setEnablement(enabled) {
            if (enabled && !this.canToggleEnablement()) {
                return;
            }
            if (this.enabled !== enabled) {
                this.enabled = enabled;
                super.setEnablement(enabled);
            }
        }
        getResourceSyncStateVersion(resource) {
            return resource === "extensions" /* SyncResource.Extensions */ ? this.workbenchEnvironmentService.options?.settingsSyncOptions?.extensionsSyncStateVersion : undefined;
        }
        isTrusted() {
            return !!this.workbenchEnvironmentService.options?.workspaceProvider?.trusted;
        }
    }
    exports.WebUserDataSyncEnablementService = WebUserDataSyncEnablementService;
    (0, extensions_1.registerSingleton)(userDataSync_1.IUserDataSyncEnablementService, WebUserDataSyncEnablementService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViVXNlckRhdGFTeW5jRW5hYmxlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdXNlckRhdGFTeW5jL2Jyb3dzZXIvd2ViVXNlckRhdGFTeW5jRW5hYmxlbWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsZ0NBQWlDLFNBQVEsNkRBQTZCO1FBQW5GOztZQUVTLFlBQU8sR0FBd0IsU0FBUyxDQUFDO1FBcUNsRCxDQUFDO1FBbkNTLG1CQUFtQjtZQUMzQixPQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUN4RCxDQUFDO1FBRVEsU0FBUztZQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO2dCQUN0QixPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE9BQU8sQ0FBQzthQUN0RjtZQUNELElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQ2pDO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7UUFFUSxhQUFhLENBQUMsT0FBZ0I7WUFDdEMsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtnQkFDM0MsT0FBTzthQUNQO1lBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLE9BQU8sRUFBRTtnQkFDN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0I7UUFDRixDQUFDO1FBRVEsMkJBQTJCLENBQUMsUUFBc0I7WUFDMUQsT0FBTyxRQUFRLCtDQUE0QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDckosQ0FBQztRQUVPLFNBQVM7WUFDaEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxPQUFPLENBQUM7UUFDL0UsQ0FBQztLQUVEO0lBdkNELDRFQXVDQztJQUVELElBQUEsOEJBQWlCLEVBQUMsNkNBQThCLEVBQUUsZ0NBQWdDLG9DQUE0QixDQUFDIn0=