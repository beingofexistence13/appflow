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
define(["require", "exports", "vs/nls!vs/workbench/services/remote/browser/remoteAgentService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/remote/common/abstractRemoteAgentService", "vs/platform/product/common/productService", "vs/platform/sign/common/sign", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/host/browser/host", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/remote/common/remoteSocketFactoryService"], function (require, exports, nls, environmentService_1, remoteAgentService_1, remoteAuthorityResolver_1, abstractRemoteAgentService_1, productService_1, sign_1, log_1, notification_1, dialogs_1, platform_1, contributions_1, host_1, userDataProfile_1, remoteSocketFactoryService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$i2b = void 0;
    let $i2b = class $i2b extends abstractRemoteAgentService_1.$h2b {
        constructor(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService) {
            super(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService);
        }
    };
    exports.$i2b = $i2b;
    exports.$i2b = $i2b = __decorate([
        __param(0, remoteSocketFactoryService_1.$Tk),
        __param(1, userDataProfile_1.$CJ),
        __param(2, environmentService_1.$hJ),
        __param(3, productService_1.$kj),
        __param(4, remoteAuthorityResolver_1.$Jk),
        __param(5, sign_1.$Wk),
        __param(6, log_1.$5i)
    ], $i2b);
    let RemoteConnectionFailureNotificationContribution = class RemoteConnectionFailureNotificationContribution {
        constructor(remoteAgentService, a, b) {
            this.a = a;
            this.b = b;
            // Let's cover the case where connecting to fetch the remote extension info fails
            remoteAgentService.getRawEnvironment()
                .then(undefined, (err) => {
                if (!remoteAuthorityResolver_1.$Mk.isHandled(err)) {
                    this.c(err);
                }
            });
        }
        async c(err) {
            await this.a.prompt({
                type: notification_1.Severity.Error,
                message: nls.localize(0, null),
                detail: nls.localize(1, null, err ? err.message : ''),
                buttons: [
                    {
                        label: nls.localize(2, null),
                        run: () => this.b.reload()
                    }
                ]
            });
        }
    };
    RemoteConnectionFailureNotificationContribution = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, dialogs_1.$oA),
        __param(2, host_1.$VT)
    ], RemoteConnectionFailureNotificationContribution);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(RemoteConnectionFailureNotificationContribution, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=remoteAgentService.js.map