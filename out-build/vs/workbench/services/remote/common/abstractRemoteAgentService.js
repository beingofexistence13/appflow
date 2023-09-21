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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc", "vs/workbench/services/environment/common/environmentService", "vs/platform/remote/common/remoteAgentConnection", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/remote/common/remoteAgentEnvironmentChannel", "vs/base/common/event", "vs/platform/sign/common/sign", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/remote/common/remoteSocketFactoryService"], function (require, exports, lifecycle_1, ipc_1, environmentService_1, remoteAgentConnection_1, remoteAuthorityResolver_1, remoteAgentEnvironmentChannel_1, event_1, sign_1, log_1, productService_1, userDataProfile_1, remoteSocketFactoryService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$h2b = void 0;
    let $h2b = class $h2b extends lifecycle_1.$kc {
        constructor(f, g, h, productService, j, signService, logService) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            if (this.h.remoteAuthority) {
                this.a = this.B(new RemoteAgentConnection(this.h.remoteAuthority, productService.commit, productService.quality, this.f, this.j, signService, logService));
            }
            else {
                this.a = null;
            }
            this.b = null;
        }
        getConnection() {
            return this.a;
        }
        getEnvironment() {
            return this.getRawEnvironment().then(undefined, () => null);
        }
        getRawEnvironment() {
            if (!this.b) {
                this.b = this.m(async (channel, connection) => {
                    const env = await remoteAgentEnvironmentChannel_1.$rr.getEnvironmentData(channel, connection.remoteAuthority, this.g.currentProfile.isDefault ? undefined : this.g.currentProfile.id);
                    this.j._setAuthorityConnectionToken(connection.remoteAuthority, env.connectionToken);
                    return env;
                }, null);
            }
            return this.b;
        }
        getExtensionHostExitInfo(reconnectionToken) {
            return this.m((channel, connection) => remoteAgentEnvironmentChannel_1.$rr.getExtensionHostExitInfo(channel, connection.remoteAuthority, reconnectionToken), null);
        }
        getDiagnosticInfo(options) {
            return this.m(channel => remoteAgentEnvironmentChannel_1.$rr.getDiagnosticInfo(channel, options), undefined);
        }
        updateTelemetryLevel(telemetryLevel) {
            return this.n(channel => remoteAgentEnvironmentChannel_1.$rr.updateTelemetryLevel(channel, telemetryLevel), undefined);
        }
        logTelemetry(eventName, data) {
            return this.n(channel => remoteAgentEnvironmentChannel_1.$rr.logTelemetry(channel, eventName, data), undefined);
        }
        flushTelemetry() {
            return this.n(channel => remoteAgentEnvironmentChannel_1.$rr.flushTelemetry(channel), undefined);
        }
        getRoundTripTime() {
            return this.n(async (channel) => {
                const start = Date.now();
                await remoteAgentEnvironmentChannel_1.$rr.ping(channel);
                return Date.now() - start;
            }, undefined);
        }
        m(callback, fallback) {
            const connection = this.getConnection();
            if (!connection) {
                return Promise.resolve(fallback);
            }
            return connection.withChannel('remoteextensionsenvironment', (channel) => callback(channel, connection));
        }
        n(callback, fallback) {
            const connection = this.getConnection();
            if (!connection) {
                return Promise.resolve(fallback);
            }
            return connection.withChannel('telemetry', (channel) => callback(channel, connection));
        }
    };
    exports.$h2b = $h2b;
    exports.$h2b = $h2b = __decorate([
        __param(0, remoteSocketFactoryService_1.$Tk),
        __param(1, userDataProfile_1.$CJ),
        __param(2, environmentService_1.$hJ),
        __param(3, productService_1.$kj),
        __param(4, remoteAuthorityResolver_1.$Jk),
        __param(5, sign_1.$Wk),
        __param(6, log_1.$5i)
    ], $h2b);
    class RemoteAgentConnection extends lifecycle_1.$kc {
        constructor(remoteAuthority, h, j, m, n, r, s) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.a = this.B(new event_1.$fd());
            this.onReconnecting = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidStateChange = this.b.event;
            this.remoteAuthority = remoteAuthority;
            this.f = null;
        }
        getChannel(channelName) {
            return (0, ipc_1.$hh)(this.t().then(c => c.getChannel(channelName)));
        }
        withChannel(channelName, callback) {
            const channel = this.getChannel(channelName);
            const result = callback(channel);
            return result;
        }
        registerChannel(channelName, channel) {
            this.t().then(client => client.registerChannel(channelName, channel));
        }
        async getInitialConnectionTimeMs() {
            try {
                await this.t();
            }
            catch {
                // ignored -- time is measured even if connection fails
            }
            return this.g;
        }
        t() {
            if (!this.f) {
                this.f = this.u();
            }
            return this.f;
        }
        async u() {
            let firstCall = true;
            const options = {
                commit: this.h,
                quality: this.j,
                addressProvider: {
                    getAddress: async () => {
                        if (firstCall) {
                            firstCall = false;
                        }
                        else {
                            this.a.fire(undefined);
                        }
                        const { authority } = await this.n.resolveAuthority(this.remoteAuthority);
                        return { connectTo: authority.connectTo, connectionToken: authority.connectionToken };
                    }
                },
                remoteSocketFactoryService: this.m,
                signService: this.r,
                logService: this.s,
                ipcLogger: false ? new ipc_1.$kh(`Local \u2192 Remote`, `Remote \u2192 Local`) : null
            };
            let connection;
            const start = Date.now();
            try {
                connection = this.B(await (0, remoteAgentConnection_1.$Xk)(options, this.remoteAuthority, `renderer`));
            }
            finally {
                this.g = Date.now() - start;
            }
            connection.protocol.onDidDispose(() => {
                connection.dispose();
            });
            this.B(connection.onDidStateChange(e => this.b.fire(e)));
            return connection.client;
        }
    }
});
//# sourceMappingURL=abstractRemoteAgentService.js.map