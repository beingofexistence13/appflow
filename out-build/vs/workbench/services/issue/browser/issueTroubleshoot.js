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
define(["require", "exports", "vs/nls!vs/workbench/services/issue/browser/issueTroubleshoot", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/product/common/productService", "vs/workbench/services/issue/common/issue", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/extensionManagement/browser/extensionBisect", "vs/platform/notification/common/notification", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/host/browser/host", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/instantiation/common/instantiation", "vs/platform/action/common/actionCommonCategories", "vs/platform/instantiation/common/extensions", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/storage/common/storage", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkeys"], function (require, exports, nls_1, extensionManagement_1, productService_1, issue_1, lifecycle_1, actions_1, userDataProfile_1, dialogs_1, extensionBisect_1, notification_1, extensionManagement_2, host_1, userDataProfile_2, instantiation_1, actionCommonCategories_1, extensions_1, contextkey_1, platform_1, contributions_1, storage_1, opener_1, uri_1, contextkeys_1, contextkeys_2) {
    "use strict";
    var TroubleshootIssueService_1, IssueTroubleshootUi_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const ITroubleshootIssueService = (0, instantiation_1.$Bh)('ITroubleshootIssueService');
    var TroubleshootStage;
    (function (TroubleshootStage) {
        TroubleshootStage[TroubleshootStage["EXTENSIONS"] = 1] = "EXTENSIONS";
        TroubleshootStage[TroubleshootStage["WORKBENCH"] = 2] = "WORKBENCH";
    })(TroubleshootStage || (TroubleshootStage = {}));
    class TroubleShootState {
        static fromJSON(raw) {
            if (!raw) {
                return undefined;
            }
            try {
                const data = JSON.parse(raw);
                if ((data.stage === TroubleshootStage.EXTENSIONS || data.stage === TroubleshootStage.WORKBENCH)
                    && typeof data.profile === 'string') {
                    return new TroubleShootState(data.stage, data.profile);
                }
            }
            catch { /* ignore */ }
            return undefined;
        }
        constructor(stage, profile) {
            this.stage = stage;
            this.profile = profile;
        }
    }
    let TroubleshootIssueService = class TroubleshootIssueService extends lifecycle_1.$kc {
        static { TroubleshootIssueService_1 = this; }
        static { this.storageKey = 'issueTroubleshootState'; }
        constructor(b, f, g, h, j, m, n, r, s, t, u, w, y, z) {
            super();
            this.b = b;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
        }
        isActive() {
            return this.state !== undefined;
        }
        async start() {
            if (this.isActive()) {
                throw new Error('invalid state');
            }
            const res = await this.j.confirm({
                message: (0, nls_1.localize)(0, null),
                detail: (0, nls_1.localize)(1, null, this.u.nameLong),
                primaryButton: (0, nls_1.localize)(2, null),
                custom: true
            });
            if (!res.confirmed) {
                return;
            }
            const originalProfile = this.b.currentProfile;
            await this.h.createTroubleshootProfile();
            this.state = new TroubleShootState(TroubleshootStage.EXTENSIONS, originalProfile.id);
            await this.resume();
        }
        async resume() {
            if (!this.isActive()) {
                return;
            }
            if (this.state?.stage === TroubleshootStage.EXTENSIONS && !this.m.isActive) {
                await this.C();
            }
            if (this.state?.stage === TroubleshootStage.WORKBENCH) {
                await this.D();
            }
            await this.stop();
        }
        async stop() {
            if (!this.isActive()) {
                return;
            }
            if (this.a) {
                this.a.close();
                this.a = undefined;
            }
            if (this.m.isActive) {
                await this.m.reset();
            }
            const profile = this.f.profiles.find(p => p.id === this.state?.profile) ?? this.f.defaultProfile;
            this.state = undefined;
            await this.g.switchProfile(profile);
        }
        async C() {
            if (!(await this.r.getInstalled(1 /* ExtensionType.User */)).length) {
                this.state = new TroubleShootState(TroubleshootStage.WORKBENCH, this.state.profile);
                return;
            }
            const result = await this.G((0, nls_1.localize)(3, null));
            if (result === 'good') {
                const profile = this.f.profiles.find(p => p.id === this.state.profile) ?? this.f.defaultProfile;
                await this.F(profile);
            }
            if (result === 'bad') {
                this.state = new TroubleShootState(TroubleshootStage.WORKBENCH, this.state.profile);
            }
            if (result === 'stop') {
                await this.stop();
            }
        }
        async D() {
            await this.g.createAndEnterTransientProfile();
            this.L(this.state);
            const result = await this.G((0, nls_1.localize)(4, null));
            if (result === 'stop') {
                await this.stop();
            }
            if (result === 'good') {
                await this.H((0, nls_1.localize)(5, null));
            }
            if (result === 'bad') {
                await this.H((0, nls_1.localize)(6, null, this.u.nameLong));
            }
        }
        async F(profile) {
            await this.g.switchProfile(profile);
            const extensions = (await this.r.getInstalled(1 /* ExtensionType.User */)).filter(ext => this.s.isEnabled(ext));
            await this.m.start(extensions);
            await this.w.reload();
        }
        G(message) {
            return new Promise((c, e) => {
                const goodPrompt = {
                    label: (0, nls_1.localize)(7, null),
                    run: () => c('good')
                };
                const badPrompt = {
                    label: (0, nls_1.localize)(8, null),
                    run: () => c('bad')
                };
                const stop = {
                    label: (0, nls_1.localize)(9, null),
                    run: () => c('stop')
                };
                this.a = this.n.prompt(notification_1.Severity.Info, message, [goodPrompt, badPrompt, stop], { sticky: true, priority: notification_1.NotificationPriority.URGENT });
            });
        }
        async H(message) {
            let isCheckedInInsiders = false;
            if (this.u.quality === 'stable') {
                const res = await this.I();
                if (res === 'good') {
                    await this.j.prompt({
                        type: notification_1.Severity.Info,
                        message: (0, nls_1.localize)(10, null),
                        detail: (0, nls_1.localize)(11, null, this.u.nameLong),
                        custom: true
                    });
                    return;
                }
                if (res === 'stop') {
                    await this.stop();
                    return;
                }
                if (res === 'bad') {
                    isCheckedInInsiders = true;
                }
            }
            await this.t.openReporter({
                issueBody: `> ${message} ${isCheckedInInsiders ? `It is confirmed that the issue exists in ${this.u.nameLong} Insiders` : ''}`,
            });
        }
        async I() {
            const confirmRes = await this.j.confirm({
                type: 'info',
                message: (0, nls_1.localize)(12, null),
                primaryButton: (0, nls_1.localize)(13, null, this.u.nameLong),
                cancelButton: (0, nls_1.localize)(14, null),
                detail: (0, nls_1.localize)(15, null, this.u.nameLong),
                custom: {
                    disableCloseAction: true,
                }
            });
            if (!confirmRes.confirmed) {
                return undefined;
            }
            const opened = await this.z.open(uri_1.URI.parse('https://aka.ms/vscode-insiders'));
            if (!opened) {
                return undefined;
            }
            const res = await this.j.prompt({
                type: 'info',
                message: (0, nls_1.localize)(16, null),
                buttons: [{
                        label: (0, nls_1.localize)(17, null),
                        run: () => 'good'
                    }, {
                        label: (0, nls_1.localize)(18, null),
                        run: () => 'bad'
                    }],
                cancelButton: {
                    label: (0, nls_1.localize)(19, null),
                    run: () => 'stop'
                },
                detail: (0, nls_1.localize)(20, null, this.u.nameLong),
                custom: {
                    disableCloseAction: true,
                }
            });
            return res.result;
        }
        get state() {
            if (this.J === undefined) {
                const raw = this.y.get(TroubleshootIssueService_1.storageKey, 0 /* StorageScope.PROFILE */);
                this.J = TroubleShootState.fromJSON(raw);
            }
            return this.J || undefined;
        }
        set state(state) {
            this.J = state ?? null;
            this.L(state);
        }
        L(state) {
            if (state) {
                this.y.store(TroubleshootIssueService_1.storageKey, JSON.stringify(state), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.y.remove(TroubleshootIssueService_1.storageKey, 0 /* StorageScope.PROFILE */);
            }
        }
    };
    TroubleshootIssueService = TroubleshootIssueService_1 = __decorate([
        __param(0, userDataProfile_1.$CJ),
        __param(1, userDataProfile_2.$Ek),
        __param(2, userDataProfile_1.$DJ),
        __param(3, userDataProfile_1.$HJ),
        __param(4, dialogs_1.$oA),
        __param(5, extensionBisect_1.$Gzb),
        __param(6, notification_1.$Yu),
        __param(7, extensionManagement_1.$2n),
        __param(8, extensionManagement_2.$icb),
        __param(9, issue_1.$rtb),
        __param(10, productService_1.$kj),
        __param(11, host_1.$VT),
        __param(12, storage_1.$Vo),
        __param(13, opener_1.$NT)
    ], TroubleshootIssueService);
    let IssueTroubleshootUi = class IssueTroubleshootUi extends lifecycle_1.$kc {
        static { IssueTroubleshootUi_1 = this; }
        static { this.ctxIsTroubleshootActive = new contextkey_1.$2i('isIssueTroubleshootActive', false); }
        constructor(a, b, storageService) {
            super();
            this.a = a;
            this.b = b;
            this.f();
            if (b.isActive()) {
                b.resume();
            }
            this.B(storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, TroubleshootIssueService.storageKey, this.B(new lifecycle_1.$jc()))(() => {
                this.f();
            }));
        }
        f() {
            IssueTroubleshootUi_1.ctxIsTroubleshootActive.bindTo(this.a).set(this.b.isActive());
        }
    };
    IssueTroubleshootUi = IssueTroubleshootUi_1 = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, ITroubleshootIssueService),
        __param(2, storage_1.$Vo)
    ], IssueTroubleshootUi);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(IssueTroubleshootUi, 3 /* LifecyclePhase.Restored */);
    (0, actions_1.$Xu)(class TroubleshootIssueAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.troubleshootIssue.start',
                title: { value: (0, nls_1.localize)(21, null), original: 'Troubleshoot Issue...' },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                precondition: contextkey_1.$Ii.and(IssueTroubleshootUi.ctxIsTroubleshootActive.negate(), contextkeys_1.$Vcb.isEqualTo(''), contextkeys_2.$23.negate()),
            });
        }
        run(accessor) {
            return accessor.get(ITroubleshootIssueService).start();
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.troubleshootIssue.stop',
                title: { value: (0, nls_1.localize)(22, null), original: 'Stop Troubleshoot Issue' },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                precondition: IssueTroubleshootUi.ctxIsTroubleshootActive
            });
        }
        async run(accessor) {
            return accessor.get(ITroubleshootIssueService).stop();
        }
    });
    (0, extensions_1.$mr)(ITroubleshootIssueService, TroubleshootIssueService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=issueTroubleshoot.js.map