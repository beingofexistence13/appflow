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
define(["require", "exports", "vs/nls!vs/workbench/services/remote/electron-sandbox/remoteAgentService", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/product/common/productService", "vs/workbench/services/remote/common/abstractRemoteAgentService", "vs/platform/sign/common/sign", "vs/platform/log/common/log", "vs/workbench/services/environment/common/environmentService", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/telemetry/common/telemetry", "vs/platform/native/common/native", "vs/base/common/uri", "vs/platform/opener/common/opener", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/remote/common/remoteSocketFactoryService"], function (require, exports, nls, remoteAgentService_1, remoteAuthorityResolver_1, productService_1, abstractRemoteAgentService_1, sign_1, log_1, environmentService_1, notification_1, platform_1, contributions_1, telemetry_1, native_1, uri_1, opener_1, userDataProfile_1, remoteSocketFactoryService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8$b = void 0;
    let $8$b = class $8$b extends abstractRemoteAgentService_1.$h2b {
        constructor(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService) {
            super(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService);
        }
    };
    exports.$8$b = $8$b;
    exports.$8$b = $8$b = __decorate([
        __param(0, remoteSocketFactoryService_1.$Tk),
        __param(1, userDataProfile_1.$CJ),
        __param(2, environmentService_1.$hJ),
        __param(3, productService_1.$kj),
        __param(4, remoteAuthorityResolver_1.$Jk),
        __param(5, sign_1.$Wk),
        __param(6, log_1.$5i)
    ], $8$b);
    let RemoteConnectionFailureNotificationContribution = class RemoteConnectionFailureNotificationContribution {
        constructor(a, notificationService, environmentService, telemetryService, nativeHostService, b, openerService) {
            this.a = a;
            this.b = b;
            // Let's cover the case where connecting to fetch the remote extension info fails
            this.a.getRawEnvironment()
                .then(undefined, err => {
                if (!remoteAuthorityResolver_1.$Mk.isHandled(err)) {
                    const choices = [
                        {
                            label: nls.localize(0, null),
                            run: () => nativeHostService.openDevTools()
                        }
                    ];
                    const troubleshootingURL = this.c();
                    if (troubleshootingURL) {
                        choices.push({
                            label: nls.localize(1, null),
                            run: () => openerService.open(troubleshootingURL, { openExternal: true })
                        });
                    }
                    notificationService.prompt(notification_1.Severity.Error, nls.localize(2, null, err ? err.message : ''), choices);
                }
            });
        }
        c() {
            const remoteAgentConnection = this.a.getConnection();
            if (!remoteAgentConnection) {
                return null;
            }
            const connectionData = this.b.getConnectionData(remoteAgentConnection.remoteAuthority);
            if (!connectionData || connectionData.connectTo.type !== 0 /* RemoteConnectionType.WebSocket */) {
                return null;
            }
            return uri_1.URI.from({
                scheme: 'http',
                authority: `${connectionData.connectTo.host}:${connectionData.connectTo.port}`,
                path: `/version`
            });
        }
    };
    RemoteConnectionFailureNotificationContribution = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, notification_1.$Yu),
        __param(2, environmentService_1.$hJ),
        __param(3, telemetry_1.$9k),
        __param(4, native_1.$05b),
        __param(5, remoteAuthorityResolver_1.$Jk),
        __param(6, opener_1.$NT)
    ], RemoteConnectionFailureNotificationContribution);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(RemoteConnectionFailureNotificationContribution, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=remoteAgentService.js.map