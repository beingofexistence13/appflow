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
    exports.$36b = void 0;
    let $36b = class $36b extends lifecycle_1.$kc {
        constructor(lifecycleMainService, a, b) {
            super();
            this.a = a;
            this.b = b;
            this.B(lifecycleMainService.onWillLoadWindow(e => {
                if (e.reason === 2 /* LoadReason.LOAD */) {
                    this.c(e.window);
                }
            }));
            this.B(lifecycleMainService.onBeforeCloseWindow(window => this.c(window)));
            this.B(new async_1.$Sg(() => this.g(), 30 * 1000 /* after 30s */)).schedule();
        }
        async c(window) {
            const workspace = this.f(window);
            const profile = this.a.getProfileForWorkspace(workspace);
            if (profile?.isTransient) {
                this.a.unsetWorkspace(workspace, profile.isTransient);
                if (profile.isTransient) {
                    await this.a.cleanUpTransientProfiles();
                }
            }
        }
        f(window) {
            return window.openedWorkspace ?? (0, workspace_1.$Ph)(window.backupPath, window.isExtensionDevelopmentHost);
        }
        g() {
            const associatedEmptyWindows = this.a.getAssociatedEmptyWindows();
            if (associatedEmptyWindows.length === 0) {
                return;
            }
            const openedWorkspaces = this.b.getWindows().map(window => this.f(window));
            for (const associatedEmptyWindow of associatedEmptyWindows) {
                if (openedWorkspaces.some(openedWorkspace => openedWorkspace.id === associatedEmptyWindow.id)) {
                    continue;
                }
                this.a.unsetWorkspace(associatedEmptyWindow, false);
            }
        }
    };
    exports.$36b = $36b;
    exports.$36b = $36b = __decorate([
        __param(0, lifecycleMainService_1.$p5b),
        __param(1, userDataProfile_1.$v5b),
        __param(2, windows_1.$B5b)
    ], $36b);
});
//# sourceMappingURL=userDataProfilesHandler.js.map