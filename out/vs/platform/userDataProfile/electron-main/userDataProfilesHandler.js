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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/workspace/common/workspace", "vs/base/common/async", "vs/platform/windows/electron-main/windows"], function (require, exports, lifecycle_1, lifecycleMainService_1, userDataProfile_1, workspace_1, async_1, windows_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfilesHandler = void 0;
    let UserDataProfilesHandler = class UserDataProfilesHandler extends lifecycle_1.Disposable {
        constructor(lifecycleMainService, userDataProfilesService, windowsMainService) {
            super();
            this.userDataProfilesService = userDataProfilesService;
            this.windowsMainService = windowsMainService;
            this._register(lifecycleMainService.onWillLoadWindow(e => {
                if (e.reason === 2 /* LoadReason.LOAD */) {
                    this.unsetProfileForWorkspace(e.window);
                }
            }));
            this._register(lifecycleMainService.onBeforeCloseWindow(window => this.unsetProfileForWorkspace(window)));
            this._register(new async_1.RunOnceScheduler(() => this.cleanUpEmptyWindowAssociations(), 30 * 1000 /* after 30s */)).schedule();
        }
        async unsetProfileForWorkspace(window) {
            const workspace = this.getWorkspace(window);
            const profile = this.userDataProfilesService.getProfileForWorkspace(workspace);
            if (profile?.isTransient) {
                this.userDataProfilesService.unsetWorkspace(workspace, profile.isTransient);
                if (profile.isTransient) {
                    await this.userDataProfilesService.cleanUpTransientProfiles();
                }
            }
        }
        getWorkspace(window) {
            return window.openedWorkspace ?? (0, workspace_1.toWorkspaceIdentifier)(window.backupPath, window.isExtensionDevelopmentHost);
        }
        cleanUpEmptyWindowAssociations() {
            const associatedEmptyWindows = this.userDataProfilesService.getAssociatedEmptyWindows();
            if (associatedEmptyWindows.length === 0) {
                return;
            }
            const openedWorkspaces = this.windowsMainService.getWindows().map(window => this.getWorkspace(window));
            for (const associatedEmptyWindow of associatedEmptyWindows) {
                if (openedWorkspaces.some(openedWorkspace => openedWorkspace.id === associatedEmptyWindow.id)) {
                    continue;
                }
                this.userDataProfilesService.unsetWorkspace(associatedEmptyWindow, false);
            }
        }
    };
    exports.UserDataProfilesHandler = UserDataProfilesHandler;
    exports.UserDataProfilesHandler = UserDataProfilesHandler = __decorate([
        __param(0, lifecycleMainService_1.ILifecycleMainService),
        __param(1, userDataProfile_1.IUserDataProfilesMainService),
        __param(2, windows_1.IWindowsMainService)
    ], UserDataProfilesHandler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlc0hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVByb2ZpbGUvZWxlY3Ryb24tbWFpbi91c2VyRGF0YVByb2ZpbGVzSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVekYsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSxzQkFBVTtRQUV0RCxZQUN3QixvQkFBMkMsRUFDbkIsdUJBQXFELEVBQzlELGtCQUF1QztZQUU3RSxLQUFLLEVBQUUsQ0FBQztZQUh1Qyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQThCO1lBQzlELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFHN0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDeEQsSUFBSSxDQUFDLENBQUMsTUFBTSw0QkFBb0IsRUFBRTtvQkFDakMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDeEM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN6SCxDQUFDO1FBRU8sS0FBSyxDQUFDLHdCQUF3QixDQUFDLE1BQW1CO1lBQ3pELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQy9FLElBQUksT0FBTyxFQUFFLFdBQVcsRUFBRTtnQkFDekIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUM1RSxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUU7b0JBQ3hCLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLHdCQUF3QixFQUFFLENBQUM7aUJBQzlEO2FBQ0Q7UUFDRixDQUFDO1FBRU8sWUFBWSxDQUFDLE1BQW1CO1lBQ3ZDLE9BQU8sTUFBTSxDQUFDLGVBQWUsSUFBSSxJQUFBLGlDQUFxQixFQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDOUcsQ0FBQztRQUVPLDhCQUE4QjtZQUNyQyxNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ3hGLElBQUksc0JBQXNCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDeEMsT0FBTzthQUNQO1lBQ0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLEtBQUssTUFBTSxxQkFBcUIsSUFBSSxzQkFBc0IsRUFBRTtnQkFDM0QsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxLQUFLLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUM5RixTQUFTO2lCQUNUO2dCQUNELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDMUU7UUFDRixDQUFDO0tBRUQsQ0FBQTtJQTlDWSwwREFBdUI7c0NBQXZCLHVCQUF1QjtRQUdqQyxXQUFBLDRDQUFxQixDQUFBO1FBQ3JCLFdBQUEsOENBQTRCLENBQUE7UUFDNUIsV0FBQSw2QkFBbUIsQ0FBQTtPQUxULHVCQUF1QixDQThDbkMifQ==