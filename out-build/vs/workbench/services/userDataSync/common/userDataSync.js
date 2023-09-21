/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/nls!vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, instantiation_1, contextkey_1, nls_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YAb = exports.$XAb = exports.$WAb = exports.$VAb = exports.$UAb = exports.$TAb = exports.$SAb = exports.$RAb = exports.$QAb = exports.$PAb = exports.$OAb = exports.$NAb = exports.$MAb = exports.AccountStatus = exports.$LAb = exports.$KAb = void 0;
    exports.$KAb = (0, instantiation_1.$Bh)('IUserDataSyncWorkbenchService');
    function $LAb(source) {
        switch (source) {
            case "settings" /* SyncResource.Settings */: return (0, nls_1.localize)(0, null);
            case "keybindings" /* SyncResource.Keybindings */: return (0, nls_1.localize)(1, null);
            case "snippets" /* SyncResource.Snippets */: return (0, nls_1.localize)(2, null);
            case "tasks" /* SyncResource.Tasks */: return (0, nls_1.localize)(3, null);
            case "extensions" /* SyncResource.Extensions */: return (0, nls_1.localize)(4, null);
            case "globalState" /* SyncResource.GlobalState */: return (0, nls_1.localize)(5, null);
            case "profiles" /* SyncResource.Profiles */: return (0, nls_1.localize)(6, null);
            case "workspaceState" /* SyncResource.WorkspaceState */: return (0, nls_1.localize)(7, null);
        }
    }
    exports.$LAb = $LAb;
    var AccountStatus;
    (function (AccountStatus) {
        AccountStatus["Unavailable"] = "unavailable";
        AccountStatus["Available"] = "available";
    })(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
    exports.$MAb = 'Settings Sync';
    exports.$NAb = (0, nls_1.localize)(8, null);
    exports.$OAb = (0, iconRegistry_1.$9u)('settings-sync-view-icon', codicons_1.$Pj.sync, (0, nls_1.localize)(9, null));
    // Contexts
    exports.$PAb = new contextkey_1.$2i('syncStatus', "uninitialized" /* SyncStatus.Uninitialized */);
    exports.$QAb = new contextkey_1.$2i('syncEnabled', false);
    exports.$RAb = new contextkey_1.$2i('userDataSyncAccountStatus', "unavailable" /* AccountStatus.Unavailable */);
    exports.$SAb = new contextkey_1.$2i(`enableSyncActivityViews`, false);
    exports.$TAb = new contextkey_1.$2i(`enableSyncConflictsView`, false);
    exports.$UAb = new contextkey_1.$2i('hasConflicts', false);
    // Commands
    exports.$VAb = 'workbench.userDataSync.actions.configure';
    exports.$WAb = 'workbench.userDataSync.actions.showLog';
    // VIEWS
    exports.$XAb = 'workbench.view.sync';
    exports.$YAb = 'workbench.views.sync.conflicts';
});
//# sourceMappingURL=userDataSync.js.map