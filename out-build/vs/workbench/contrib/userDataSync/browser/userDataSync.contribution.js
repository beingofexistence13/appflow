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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/contrib/userDataSync/browser/userDataSync", "vs/platform/userDataSync/common/userDataSync", "vs/platform/notification/common/notification", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/userDataSync/browser/userDataSync.contribution", "vs/base/common/platform", "vs/workbench/contrib/userDataSync/browser/userDataSyncTrigger", "vs/base/common/actions", "vs/platform/product/common/productService", "vs/platform/commands/common/commands", "vs/workbench/services/host/browser/host", "vs/workbench/services/userDataSync/common/userDataSync"], function (require, exports, contributions_1, platform_1, userDataSync_1, userDataSync_2, notification_1, lifecycle_1, nls_1, platform_2, userDataSyncTrigger_1, actions_1, productService_1, commands_1, host_1, userDataSync_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let UserDataSyncReportIssueContribution = class UserDataSyncReportIssueContribution extends lifecycle_1.$kc {
        constructor(userDataAutoSyncService, a, b, c, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.B(userDataAutoSyncService.onError(error => this.g(error)));
        }
        g(error) {
            switch (error.code) {
                case "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */: {
                    const message = platform_2.$o ? (0, nls_1.localize)(0, null, this.b.nameLong)
                        : (0, nls_1.localize)(1, null, this.b.nameLong);
                    this.a.notify({
                        severity: notification_1.Severity.Error,
                        message,
                        actions: {
                            primary: [
                                new actions_1.$gi('Show Sync Logs', (0, nls_1.localize)(2, null), undefined, true, () => this.c.executeCommand(userDataSync_3.$WAb)),
                                new actions_1.$gi('Restart', platform_2.$o ? (0, nls_1.localize)(3, null) : (0, nls_1.localize)(4, null), undefined, true, () => this.f.restart())
                            ]
                        }
                    });
                    return;
                }
                case "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */: {
                    const operationId = error.operationId ? (0, nls_1.localize)(5, null, error.operationId) : undefined;
                    const message = (0, nls_1.localize)(6, null);
                    this.a.notify({
                        severity: notification_1.Severity.Error,
                        message: operationId ? `${message} ${operationId}` : message,
                        source: error.operationId ? (0, nls_1.localize)(7, null, error.operationId) : undefined,
                        actions: {
                            primary: [
                                new actions_1.$gi('Show Sync Logs', (0, nls_1.localize)(8, null), undefined, true, () => this.c.executeCommand(userDataSync_3.$WAb)),
                            ]
                        }
                    });
                    return;
                }
            }
        }
    };
    UserDataSyncReportIssueContribution = __decorate([
        __param(0, userDataSync_2.$Sgb),
        __param(1, notification_1.$Yu),
        __param(2, productService_1.$kj),
        __param(3, commands_1.$Fr),
        __param(4, host_1.$VT)
    ], UserDataSyncReportIssueContribution);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(userDataSync_1.$IZb, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(userDataSyncTrigger_1.$JZb, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(UserDataSyncReportIssueContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=userDataSync.contribution.js.map