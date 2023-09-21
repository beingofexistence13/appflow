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
define(["require", "exports", "vs/platform/backup/electron-main/backup", "vs/platform/windows/electron-main/windows", "vs/platform/workspaces/electron-main/workspacesHistoryMainService", "vs/platform/workspaces/electron-main/workspacesManagementMainService"], function (require, exports, backup_1, windows_1, workspacesHistoryMainService_1, workspacesManagementMainService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Y6b = void 0;
    let $Y6b = class $Y6b {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            //#endregion
            //#region Workspaces History
            this.onDidChangeRecentlyOpened = this.c.onDidChangeRecentlyOpened;
        }
        //#region Workspace Management
        async enterWorkspace(windowId, path) {
            const window = this.b.getWindowById(windowId);
            if (window) {
                return this.a.enterWorkspace(window, this.b.getWindows(), path);
            }
            return undefined;
        }
        createUntitledWorkspace(windowId, folders, remoteAuthority) {
            return this.a.createUntitledWorkspace(folders, remoteAuthority);
        }
        deleteUntitledWorkspace(windowId, workspace) {
            return this.a.deleteUntitledWorkspace(workspace);
        }
        getWorkspaceIdentifier(windowId, workspacePath) {
            return this.a.getWorkspaceIdentifier(workspacePath);
        }
        getRecentlyOpened(windowId) {
            return this.c.getRecentlyOpened();
        }
        addRecentlyOpened(windowId, recents) {
            return this.c.addRecentlyOpened(recents);
        }
        removeRecentlyOpened(windowId, paths) {
            return this.c.removeRecentlyOpened(paths);
        }
        clearRecentlyOpened(windowId) {
            return this.c.clearRecentlyOpened();
        }
        //#endregion
        //#region Dirty Workspaces
        async getDirtyWorkspaces() {
            return this.d.getDirtyWorkspaces();
        }
    };
    exports.$Y6b = $Y6b;
    exports.$Y6b = $Y6b = __decorate([
        __param(0, workspacesManagementMainService_1.$S5b),
        __param(1, windows_1.$B5b),
        __param(2, workspacesHistoryMainService_1.$p6b),
        __param(3, backup_1.$G5b)
    ], $Y6b);
});
//# sourceMappingURL=workspacesMainService.js.map