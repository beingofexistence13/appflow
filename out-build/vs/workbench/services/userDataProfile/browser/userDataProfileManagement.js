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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/nls!vs/workbench/services/userDataProfile/browser/userDataProfileManagement", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/host/browser/host", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, cancellation_1, errors_1, lifecycle_1, nls_1, dialogs_1, extensions_1, log_1, productService_1, request_1, telemetry_1, userDataProfile_1, workspace_1, environmentService_1, extensions_2, host_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tAb = void 0;
    let $tAb = class $tAb extends lifecycle_1.$kc {
        constructor(a, b, c, f, g, h, j, m, n, r, s) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.B(a.onDidChangeProfiles(e => this.t(e)));
            this.B(a.onDidResetWorkspaces(() => this.u()));
            this.B(b.onDidChangeCurrentProfile(e => this.w(e)));
            this.B(a.onDidChangeProfiles(e => {
                const updatedCurrentProfile = e.updated.find(p => this.b.currentProfile.id === p.id);
                if (updatedCurrentProfile) {
                    this.y(updatedCurrentProfile, (0, nls_1.localize)(0, null));
                }
            }));
        }
        t(e) {
            if (e.removed.some(profile => profile.id === this.b.currentProfile.id)) {
                this.y(this.a.defaultProfile, (0, nls_1.localize)(1, null));
                return;
            }
        }
        u() {
            if (!this.b.currentProfile.isDefault) {
                this.y(this.a.defaultProfile, (0, nls_1.localize)(2, null));
                return;
            }
        }
        async w(e) {
            if (e.previous.isTransient) {
                await this.a.cleanUpTransientProfiles();
            }
        }
        async createAndEnterProfile(name, options) {
            const profile = await this.a.createNamedProfile(name, options, (0, workspace_1.$Ph)(this.g.getWorkspace()));
            await this.y(profile);
            this.m.publicLog2('profileManagementActionExecuted', { id: 'createAndEnterProfile' });
            return profile;
        }
        async createAndEnterTransientProfile() {
            const profile = await this.a.createTransientProfile((0, workspace_1.$Ph)(this.g.getWorkspace()));
            await this.y(profile);
            this.m.publicLog2('profileManagementActionExecuted', { id: 'createAndEnterTransientProfile' });
            return profile;
        }
        async updateProfile(profile, updateOptions) {
            if (!this.a.profiles.some(p => p.id === profile.id)) {
                throw new Error(`Profile ${profile.name} does not exist`);
            }
            if (profile.isDefault) {
                throw new Error((0, nls_1.localize)(3, null));
            }
            await this.a.updateProfile(profile, updateOptions);
            this.m.publicLog2('profileManagementActionExecuted', { id: 'updateProfile' });
        }
        async removeProfile(profile) {
            if (!this.a.profiles.some(p => p.id === profile.id)) {
                throw new Error(`Profile ${profile.name} does not exist`);
            }
            if (profile.isDefault) {
                throw new Error((0, nls_1.localize)(4, null));
            }
            await this.a.removeProfile(profile);
            this.m.publicLog2('profileManagementActionExecuted', { id: 'removeProfile' });
        }
        async switchProfile(profile) {
            const workspaceIdentifier = (0, workspace_1.$Ph)(this.g.getWorkspace());
            if (!this.a.profiles.some(p => p.id === profile.id)) {
                throw new Error(`Profile ${profile.name} does not exist`);
            }
            if (this.b.currentProfile.id === profile.id) {
                return;
            }
            await this.a.setProfileForWorkspace(workspaceIdentifier, profile);
            await this.y(profile);
            this.m.publicLog2('profileManagementActionExecuted', { id: 'switchProfile' });
        }
        async getBuiltinProfileTemplates() {
            if (this.n.profileTemplatesUrl) {
                try {
                    const context = await this.r.request({ type: 'GET', url: this.n.profileTemplatesUrl }, cancellation_1.CancellationToken.None);
                    if (context.res.statusCode === 200) {
                        return (await (0, request_1.$Oo)(context)) || [];
                    }
                    else {
                        this.s.error('Could not get profile templates.', context.res.statusCode);
                    }
                }
                catch (error) {
                    this.s.error(error);
                }
            }
            return [];
        }
        async y(profile, reloadMessage) {
            const isRemoteWindow = !!this.j.remoteAuthority;
            if (!isRemoteWindow) {
                if (!(await this.h.stopExtensionHosts((0, nls_1.localize)(5, null)))) {
                    // If extension host did not stop, do not switch profile
                    if (this.a.profiles.some(p => p.id === this.b.currentProfile.id)) {
                        await this.a.setProfileForWorkspace((0, workspace_1.$Ph)(this.g.getWorkspace()), this.b.currentProfile);
                    }
                    throw new errors_1.$3();
                }
            }
            // In a remote window update current profile before reloading so that data is preserved from current profile if asked to preserve
            await this.b.updateCurrentProfile(profile);
            if (isRemoteWindow) {
                const { confirmed } = await this.f.confirm({
                    message: reloadMessage ?? (0, nls_1.localize)(6, null),
                    primaryButton: (0, nls_1.localize)(7, null),
                });
                if (confirmed) {
                    await this.c.reload();
                }
            }
            else {
                await this.h.startExtensionHosts();
            }
        }
    };
    exports.$tAb = $tAb;
    exports.$tAb = $tAb = __decorate([
        __param(0, userDataProfile_1.$Ek),
        __param(1, userDataProfile_2.$CJ),
        __param(2, host_1.$VT),
        __param(3, dialogs_1.$oA),
        __param(4, workspace_1.$Kh),
        __param(5, extensions_2.$MF),
        __param(6, environmentService_1.$hJ),
        __param(7, telemetry_1.$9k),
        __param(8, productService_1.$kj),
        __param(9, request_1.$Io),
        __param(10, log_1.$5i)
    ], $tAb);
    (0, extensions_1.$mr)(userDataProfile_2.$DJ, $tAb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=userDataProfileManagement.js.map