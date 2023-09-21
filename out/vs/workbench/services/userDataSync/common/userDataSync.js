/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/nls", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, instantiation_1, contextkey_1, nls_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SYNC_CONFLICTS_VIEW_ID = exports.SYNC_VIEW_CONTAINER_ID = exports.SHOW_SYNC_LOG_COMMAND_ID = exports.CONFIGURE_SYNC_COMMAND_ID = exports.CONTEXT_HAS_CONFLICTS = exports.CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW = exports.CONTEXT_ENABLE_ACTIVITY_VIEWS = exports.CONTEXT_ACCOUNT_STATE = exports.CONTEXT_SYNC_ENABLEMENT = exports.CONTEXT_SYNC_STATE = exports.SYNC_VIEW_ICON = exports.SYNC_TITLE = exports.SYNC_ORIGINAL_TITLE = exports.AccountStatus = exports.getSyncAreaLabel = exports.IUserDataSyncWorkbenchService = void 0;
    exports.IUserDataSyncWorkbenchService = (0, instantiation_1.createDecorator)('IUserDataSyncWorkbenchService');
    function getSyncAreaLabel(source) {
        switch (source) {
            case "settings" /* SyncResource.Settings */: return (0, nls_1.localize)('settings', "Settings");
            case "keybindings" /* SyncResource.Keybindings */: return (0, nls_1.localize)('keybindings', "Keyboard Shortcuts");
            case "snippets" /* SyncResource.Snippets */: return (0, nls_1.localize)('snippets', "User Snippets");
            case "tasks" /* SyncResource.Tasks */: return (0, nls_1.localize)('tasks', "User Tasks");
            case "extensions" /* SyncResource.Extensions */: return (0, nls_1.localize)('extensions', "Extensions");
            case "globalState" /* SyncResource.GlobalState */: return (0, nls_1.localize)('ui state label', "UI State");
            case "profiles" /* SyncResource.Profiles */: return (0, nls_1.localize)('profiles', "Profiles");
            case "workspaceState" /* SyncResource.WorkspaceState */: return (0, nls_1.localize)('workspace state label', "Workspace State");
        }
    }
    exports.getSyncAreaLabel = getSyncAreaLabel;
    var AccountStatus;
    (function (AccountStatus) {
        AccountStatus["Unavailable"] = "unavailable";
        AccountStatus["Available"] = "available";
    })(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
    exports.SYNC_ORIGINAL_TITLE = 'Settings Sync';
    exports.SYNC_TITLE = (0, nls_1.localize)('sync category', "Settings Sync");
    exports.SYNC_VIEW_ICON = (0, iconRegistry_1.registerIcon)('settings-sync-view-icon', codicons_1.Codicon.sync, (0, nls_1.localize)('syncViewIcon', 'View icon of the Settings Sync view.'));
    // Contexts
    exports.CONTEXT_SYNC_STATE = new contextkey_1.RawContextKey('syncStatus', "uninitialized" /* SyncStatus.Uninitialized */);
    exports.CONTEXT_SYNC_ENABLEMENT = new contextkey_1.RawContextKey('syncEnabled', false);
    exports.CONTEXT_ACCOUNT_STATE = new contextkey_1.RawContextKey('userDataSyncAccountStatus', "unavailable" /* AccountStatus.Unavailable */);
    exports.CONTEXT_ENABLE_ACTIVITY_VIEWS = new contextkey_1.RawContextKey(`enableSyncActivityViews`, false);
    exports.CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW = new contextkey_1.RawContextKey(`enableSyncConflictsView`, false);
    exports.CONTEXT_HAS_CONFLICTS = new contextkey_1.RawContextKey('hasConflicts', false);
    // Commands
    exports.CONFIGURE_SYNC_COMMAND_ID = 'workbench.userDataSync.actions.configure';
    exports.SHOW_SYNC_LOG_COMMAND_ID = 'workbench.userDataSync.actions.showLog';
    // VIEWS
    exports.SYNC_VIEW_CONTAINER_ID = 'workbench.view.sync';
    exports.SYNC_CONFLICTS_VIEW_ID = 'workbench.views.sync.conflicts';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3VzZXJEYXRhU3luYy9jb21tb24vdXNlckRhdGFTeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCbkYsUUFBQSw2QkFBNkIsR0FBRyxJQUFBLCtCQUFlLEVBQWdDLCtCQUErQixDQUFDLENBQUM7SUE2QjdILFNBQWdCLGdCQUFnQixDQUFDLE1BQW9CO1FBQ3BELFFBQVEsTUFBTSxFQUFFO1lBQ2YsMkNBQTBCLENBQUMsQ0FBQyxPQUFPLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNwRSxpREFBNkIsQ0FBQyxDQUFDLE9BQU8sSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDcEYsMkNBQTBCLENBQUMsQ0FBQyxPQUFPLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUN6RSxxQ0FBdUIsQ0FBQyxDQUFDLE9BQU8sSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ2hFLCtDQUE0QixDQUFDLENBQUMsT0FBTyxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDMUUsaURBQTZCLENBQUMsQ0FBQyxPQUFPLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzdFLDJDQUEwQixDQUFDLENBQUMsT0FBTyxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDcEUsdURBQWdDLENBQUMsQ0FBQyxPQUFPLElBQUEsY0FBUSxFQUFDLHVCQUF1QixFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDOUY7SUFDRixDQUFDO0lBWEQsNENBV0M7SUFFRCxJQUFrQixhQUdqQjtJQUhELFdBQWtCLGFBQWE7UUFDOUIsNENBQTJCLENBQUE7UUFDM0Isd0NBQXVCLENBQUE7SUFDeEIsQ0FBQyxFQUhpQixhQUFhLDZCQUFiLGFBQWEsUUFHOUI7SUFNWSxRQUFBLG1CQUFtQixHQUFHLGVBQWUsQ0FBQztJQUN0QyxRQUFBLFVBQVUsR0FBRyxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFFeEQsUUFBQSxjQUFjLEdBQUcsSUFBQSwyQkFBWSxFQUFDLHlCQUF5QixFQUFFLGtCQUFPLENBQUMsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDLENBQUM7SUFFdEosV0FBVztJQUNFLFFBQUEsa0JBQWtCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLFlBQVksaURBQTJCLENBQUM7SUFDdkYsUUFBQSx1QkFBdUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNFLFFBQUEscUJBQXFCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLDJCQUEyQixnREFBNEIsQ0FBQztJQUMxRyxRQUFBLDZCQUE2QixHQUFHLElBQUksMEJBQWEsQ0FBVSx5QkFBeUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RixRQUFBLGtDQUFrQyxHQUFHLElBQUksMEJBQWEsQ0FBVSx5QkFBeUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRyxRQUFBLHFCQUFxQixHQUFHLElBQUksMEJBQWEsQ0FBVSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFdkYsV0FBVztJQUNFLFFBQUEseUJBQXlCLEdBQUcsMENBQTBDLENBQUM7SUFDdkUsUUFBQSx3QkFBd0IsR0FBRyx3Q0FBd0MsQ0FBQztJQUVqRixRQUFRO0lBQ0ssUUFBQSxzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQztJQUMvQyxRQUFBLHNCQUFzQixHQUFHLGdDQUFnQyxDQUFDIn0=