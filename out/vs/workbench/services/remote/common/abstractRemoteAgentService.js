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
    exports.AbstractRemoteAgentService = void 0;
    let AbstractRemoteAgentService = class AbstractRemoteAgentService extends lifecycle_1.Disposable {
        constructor(remoteSocketFactoryService, userDataProfileService, _environmentService, productService, _remoteAuthorityResolverService, signService, logService) {
            super();
            this.remoteSocketFactoryService = remoteSocketFactoryService;
            this.userDataProfileService = userDataProfileService;
            this._environmentService = _environmentService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            if (this._environmentService.remoteAuthority) {
                this._connection = this._register(new RemoteAgentConnection(this._environmentService.remoteAuthority, productService.commit, productService.quality, this.remoteSocketFactoryService, this._remoteAuthorityResolverService, signService, logService));
            }
            else {
                this._connection = null;
            }
            this._environment = null;
        }
        getConnection() {
            return this._connection;
        }
        getEnvironment() {
            return this.getRawEnvironment().then(undefined, () => null);
        }
        getRawEnvironment() {
            if (!this._environment) {
                this._environment = this._withChannel(async (channel, connection) => {
                    const env = await remoteAgentEnvironmentChannel_1.RemoteExtensionEnvironmentChannelClient.getEnvironmentData(channel, connection.remoteAuthority, this.userDataProfileService.currentProfile.isDefault ? undefined : this.userDataProfileService.currentProfile.id);
                    this._remoteAuthorityResolverService._setAuthorityConnectionToken(connection.remoteAuthority, env.connectionToken);
                    return env;
                }, null);
            }
            return this._environment;
        }
        getExtensionHostExitInfo(reconnectionToken) {
            return this._withChannel((channel, connection) => remoteAgentEnvironmentChannel_1.RemoteExtensionEnvironmentChannelClient.getExtensionHostExitInfo(channel, connection.remoteAuthority, reconnectionToken), null);
        }
        getDiagnosticInfo(options) {
            return this._withChannel(channel => remoteAgentEnvironmentChannel_1.RemoteExtensionEnvironmentChannelClient.getDiagnosticInfo(channel, options), undefined);
        }
        updateTelemetryLevel(telemetryLevel) {
            return this._withTelemetryChannel(channel => remoteAgentEnvironmentChannel_1.RemoteExtensionEnvironmentChannelClient.updateTelemetryLevel(channel, telemetryLevel), undefined);
        }
        logTelemetry(eventName, data) {
            return this._withTelemetryChannel(channel => remoteAgentEnvironmentChannel_1.RemoteExtensionEnvironmentChannelClient.logTelemetry(channel, eventName, data), undefined);
        }
        flushTelemetry() {
            return this._withTelemetryChannel(channel => remoteAgentEnvironmentChannel_1.RemoteExtensionEnvironmentChannelClient.flushTelemetry(channel), undefined);
        }
        getRoundTripTime() {
            return this._withTelemetryChannel(async (channel) => {
                const start = Date.now();
                await remoteAgentEnvironmentChannel_1.RemoteExtensionEnvironmentChannelClient.ping(channel);
                return Date.now() - start;
            }, undefined);
        }
        _withChannel(callback, fallback) {
            const connection = this.getConnection();
            if (!connection) {
                return Promise.resolve(fallback);
            }
            return connection.withChannel('remoteextensionsenvironment', (channel) => callback(channel, connection));
        }
        _withTelemetryChannel(callback, fallback) {
            const connection = this.getConnection();
            if (!connection) {
                return Promise.resolve(fallback);
            }
            return connection.withChannel('telemetry', (channel) => callback(channel, connection));
        }
    };
    exports.AbstractRemoteAgentService = AbstractRemoteAgentService;
    exports.AbstractRemoteAgentService = AbstractRemoteAgentService = __decorate([
        __param(0, remoteSocketFactoryService_1.IRemoteSocketFactoryService),
        __param(1, userDataProfile_1.IUserDataProfileService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, productService_1.IProductService),
        __param(4, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(5, sign_1.ISignService),
        __param(6, log_1.ILogService)
    ], AbstractRemoteAgentService);
    class RemoteAgentConnection extends lifecycle_1.Disposable {
        constructor(remoteAuthority, _commit, _quality, _remoteSocketFactoryService, _remoteAuthorityResolverService, _signService, _logService) {
            super();
            this._commit = _commit;
            this._quality = _quality;
            this._remoteSocketFactoryService = _remoteSocketFactoryService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._signService = _signService;
            this._logService = _logService;
            this._onReconnecting = this._register(new event_1.Emitter());
            this.onReconnecting = this._onReconnecting.event;
            this._onDidStateChange = this._register(new event_1.Emitter());
            this.onDidStateChange = this._onDidStateChange.event;
            this.remoteAuthority = remoteAuthority;
            this._connection = null;
        }
        getChannel(channelName) {
            return (0, ipc_1.getDelayedChannel)(this._getOrCreateConnection().then(c => c.getChannel(channelName)));
        }
        withChannel(channelName, callback) {
            const channel = this.getChannel(channelName);
            const result = callback(channel);
            return result;
        }
        registerChannel(channelName, channel) {
            this._getOrCreateConnection().then(client => client.registerChannel(channelName, channel));
        }
        async getInitialConnectionTimeMs() {
            try {
                await this._getOrCreateConnection();
            }
            catch {
                // ignored -- time is measured even if connection fails
            }
            return this._initialConnectionMs;
        }
        _getOrCreateConnection() {
            if (!this._connection) {
                this._connection = this._createConnection();
            }
            return this._connection;
        }
        async _createConnection() {
            let firstCall = true;
            const options = {
                commit: this._commit,
                quality: this._quality,
                addressProvider: {
                    getAddress: async () => {
                        if (firstCall) {
                            firstCall = false;
                        }
                        else {
                            this._onReconnecting.fire(undefined);
                        }
                        const { authority } = await this._remoteAuthorityResolverService.resolveAuthority(this.remoteAuthority);
                        return { connectTo: authority.connectTo, connectionToken: authority.connectionToken };
                    }
                },
                remoteSocketFactoryService: this._remoteSocketFactoryService,
                signService: this._signService,
                logService: this._logService,
                ipcLogger: false ? new ipc_1.IPCLogger(`Local \u2192 Remote`, `Remote \u2192 Local`) : null
            };
            let connection;
            const start = Date.now();
            try {
                connection = this._register(await (0, remoteAgentConnection_1.connectRemoteAgentManagement)(options, this.remoteAuthority, `renderer`));
            }
            finally {
                this._initialConnectionMs = Date.now() - start;
            }
            connection.protocol.onDidDispose(() => {
                connection.dispose();
            });
            this._register(connection.onDidStateChange(e => this._onDidStateChange.fire(e)));
            return connection.client;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RSZW1vdGVBZ2VudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcmVtb3RlL2NvbW1vbi9hYnN0cmFjdFJlbW90ZUFnZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQnpGLElBQWUsMEJBQTBCLEdBQXpDLE1BQWUsMEJBQTJCLFNBQVEsc0JBQVU7UUFPbEUsWUFDK0MsMEJBQXVELEVBQzNELHNCQUErQyxFQUN4QyxtQkFBaUQsRUFDakYsY0FBK0IsRUFDRSwrQkFBZ0UsRUFDcEcsV0FBeUIsRUFDMUIsVUFBdUI7WUFFcEMsS0FBSyxFQUFFLENBQUM7WUFSc0MsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUMzRCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQ3hDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBOEI7WUFFaEQsb0NBQStCLEdBQS9CLCtCQUErQixDQUFpQztZQUtsSCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsK0JBQStCLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7YUFDdFA7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7YUFDeEI7WUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUMxQixDQUFDO1FBRUQsYUFBYTtZQUNaLE9BQU8sSUFBSSxDQUFD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