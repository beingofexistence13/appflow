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
define(["require", "exports", "vs/platform/remoteTunnel/common/remoteTunnel", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/environment/common/environment", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/base/common/path", "child_process", "vs/platform/product/common/productService", "vs/base/common/platform", "vs/base/common/async", "vs/platform/lifecycle/node/sharedProcessLifecycleService", "vs/platform/configuration/common/configuration", "vs/nls", "os", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/base/node/nodeStreams", "vs/base/common/resources"], function (require, exports, remoteTunnel_1, event_1, telemetry_1, environment_1, lifecycle_1, log_1, path_1, child_process_1, productService_1, platform_1, async_1, sharedProcessLifecycleService_1, configuration_1, nls_1, os_1, storage_1, types_1, nodeStreams_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteTunnelService = void 0;
    const restartTunnelOnConfigurationChanges = [
        remoteTunnel_1.CONFIGURATION_KEY_HOST_NAME,
        remoteTunnel_1.CONFIGURATION_KEY_PREVENT_SLEEP,
    ];
    // This is the session used run the tunnel access.
    // if set, the remote tunnel access is currently enabled.
    // if not set, the remote tunnel access is currently disabled.
    const TUNNEL_ACCESS_SESSION = 'remoteTunnelSession';
    // Boolean indicating whether the tunnel should be installed as a service.
    const TUNNEL_ACCESS_IS_SERVICE = 'remoteTunnelIsService';
    /**
     * This service runs on the shared service. It is running the `code-tunnel` command
     * to make the current machine available for remote access.
     */
    let RemoteTunnelService = class RemoteTunnelService extends lifecycle_1.Disposable {
        constructor(telemetryService, productService, environmentService, loggerService, sharedProcessLifecycleService, configurationService, storageService) {
            super();
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.environmentService = environmentService;
            this.configurationService = configurationService;
            this.storageService = storageService;
            this._onDidTokenFailedEmitter = new event_1.Emitter();
            this.onDidTokenFailed = this._onDidTokenFailedEmitter.event;
            this._onDidChangeTunnelStatusEmitter = new event_1.Emitter();
            this.onDidChangeTunnelStatus = this._onDidChangeTunnelStatusEmitter.event;
            this._onDidChangeModeEmitter = new event_1.Emitter();
            this.onDidChangeMode = this._onDidChangeModeEmitter.event;
            /**
             * "Mode" in the terminal state we want to get to -- started, stopped, and
             * the attributes associated with each.
             *
             * At any given time, work may be ongoing to get `_tunnelStatus` into a
             * state that reflects the desired `mode`.
             */
            this._mode = remoteTunnel_1.INACTIVE_TUNNEL_MODE;
            this._initialized = false;
            this.defaultOnOutput = (a, isErr) => {
                if (isErr) {
                    this._logger.error(a);
                }
                else {
                    this._logger.info(a);
                }
            };
            this._logger = this._register(loggerService.createLogger((0, resources_1.joinPath)(environmentService.logsHome, `${remoteTunnel_1.LOG_ID}.log`), { id: remoteTunnel_1.LOG_ID, name: remoteTunnel_1.LOGGER_NAME }));
            this._startTunnelProcessDelayer = new async_1.Delayer(100);
            this._register(this._logger.onDidChangeLogLevel(l => this._logger.info('Log level changed to ' + (0, log_1.LogLevelToString)(l))));
            this._register(sharedProcessLifecycleService.onWillShutdown(() => {
                this._tunnelProcess?.cancel();
                this._tunnelProcess = undefined;
                this.dispose();
            }));
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (restartTunnelOnConfigurationChanges.some(c => e.affectsConfiguration(c))) {
                    this._startTunnelProcessDelayer.trigger(() => this.updateTunnelProcess());
                }
            }));
            this._mode = this._restoreMode();
            this._tunnelStatus = remoteTunnel_1.TunnelStates.uninitialized;
        }
        async getTunnelStatus() {
            return this._tunnelStatus;
        }
        setTunnelStatus(tunnelStatus) {
            this._tunnelStatus = tunnelStatus;
            this._onDidChangeTunnelStatusEmitter.fire(tunnelStatus);
        }
        setMode(mode) {
            if (isSameMode(this._mode, mode)) {
                return;
            }
            this._mode = mode;
            this._storeMode(mode);
            this._onDidChangeModeEmitter.fire(this._mode);
            if (mode.active) {
                this._logger.info(`Session updated: ${mode.session.accountLabel} (${mode.session.providerId}) (service=${mode.asService})`);
                if (mode.session.token) {
                    this._logger.info(`Session token updated: ${mode.session.accountLabel} (${mode.session.providerId})`);
                }
            }
            else {
                this._logger.info(`Session reset`);
            }
        }
        getMode() {
            return Promise.resolve(this._mode);
        }
        async initialize(mode) {
            if (this._initialized) {
                return this._tunnelStatus;
            }
            this._initialized = true;
            this.setMode(mode);
            try {
                await this._startTunnelProcessDelayer.trigger(() => this.updateTunnelProcess());
            }
            catch (e) {
                this._logger.error(e);
            }
            return this._tunnelStatus;
        }
        getTunnelCommandLocation() {
            if (!this._tunnelCommand) {
                let binParentLocation;
                if (platform_1.isMacintosh) {
                    // appRoot = /Applications/Visual Studio Code - Insiders.app/Contents/Resources/app
                    // bin = /Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin
                    binParentLocation = this.environmentService.appRoot;
                }
                else {
                    // appRoot = C:\Users\<name>\AppData\Local\Programs\Microsoft VS Code Insiders\resources\app
                    // bin = C:\Users\<name>\AppData\Local\Programs\Microsoft VS Code Insiders\bin
                    // appRoot = /usr/share/code-insiders/resources/app
                    // bin = /usr/share/code-insiders/bin
                    binParentLocation = (0, path_1.dirname)((0, path_1.dirname)(this.environmentService.appRoot));
                }
                this._tunnelCommand = (0, path_1.join)(binParentLocation, 'bin', `${this.productService.tunnelApplicationName}${platform_1.isWindows ? '.exe' : ''}`);
            }
            return this._tunnelCommand;
        }
        async startTunnel(mode) {
            if (isSameMode(this._mode, mode) && this._tunnelStatus.type !== 'disconnected') {
                return this._tunnelStatus;
            }
            this.setMode(mode);
            try {
                await this._startTunnelProcessDelayer.trigger(() => this.updateTunnelProcess());
            }
            catch (e) {
                this._logger.error(e);
            }
            return this._tunnelStatus;
        }
        async stopTunnel() {
            if (this._tunnelProcess) {
                this._tunnelProcess.cancel();
                this._tunnelProcess = undefined;
            }
            if (!this._mode.active) {
                return;
            }
            // Be careful to only uninstall the service if we're the ones who installed it:
            const needsServiceUninstall = this._mode.asService;
            this.setMode(remoteTunnel_1.INACTIVE_TUNNEL_MODE);
            try {
                if (needsServiceUninstall) {
                    this.runCodeTunnelCommand('uninstallService', ['service', 'uninstall']);
                }
            }
            catch (e) {
                this._logger.error(e);
            }
            try {
                await this.runCodeTunnelCommand('stop', ['kill']);
            }
            catch (e) {
                this._logger.error(e);
            }
            this.setTunnelStatus(remoteTunnel_1.TunnelStates.disconnected());
        }
        async updateTunnelProcess() {
            this.telemetryService.publicLog2('remoteTunnel.enablement', {
                enabled: this._mode.active,
                service: this._mode.active && this._mode.asService,
            });
            if (this._tunnelProcess) {
                this._tunnelProcess.cancel();
                this._tunnelProcess = undefined;
            }
            let output = '';
            let isServiceInstalled = false;
            const onOutput = (a, isErr) => {
                if (isErr) {
                    this._logger.error(a);
                }
                else {
                    output += a;
                }
                if (!this.environmentService.isBuilt && a.startsWith('   Compiling')) {
                    this.setTunnelStatus(remoteTunnel_1.TunnelStates.connecting((0, nls_1.localize)('remoteTunnelService.building', 'Building CLI from sources')));
                }
            };
            const statusProcess = this.runCodeTunnelCommand('status', ['status'], onOutput);
            this._tunnelProcess = statusProcess;
            try {
                await statusProcess;
                if (this._tunnelProcess !== statusProcess) {
                    return;
                }
                // split and find the line, since in dev builds additional noise is
                // added by cargo to the output.
                const status = JSON.parse(output.trim().split('\n').find(l => l.startsWith('{')));
                isServiceInstalled = status.service_installed;
                this._logger.info(status.tunnel ? 'Other tunnel running, attaching...' : 'No other tunnel running');
                // If a tunnel is running but the mode isn't "active", we'll still attach
                // to the tunnel to show its state in the UI. If neither are true, disconnect
                if (!status.tunnel && !this._mode.active) {
                    this.setTunnelStatus(remoteTunnel_1.TunnelStates.disconnected());
                    return;
                }
            }
            catch (e) {
                this._logger.error(e);
                this.setTunnelStatus(remoteTunnel_1.TunnelStates.disconnected());
                return;
            }
            finally {
                if (this._tunnelProcess === statusProcess) {
                    this._tunnelProcess = undefined;
                }
            }
            const session = this._mode.active ? this._mode.session : undefined;
            if (session && session.token) {
                const token = session.token;
                this.setTunnelStatus(remoteTunnel_1.TunnelStates.connecting((0, nls_1.localize)({ key: 'remoteTunnelService.authorizing', comment: ['{0} is a user account name, {1} a provider name (e.g. Github)'] }, 'Connecting as {0} ({1})', session.accountLabel, session.providerId)));
                const onLoginOutput = (a, isErr) => {
                    a = a.replaceAll(token, '*'.repeat(4));
                    onOutput(a, isErr);
                };
                const loginProcess = this.runCodeTunnelCommand('login', ['user', 'login', '--provider', session.providerId, '--access-token', token, '--log', (0, log_1.LogLevelToString)(this._logger.getLevel())], onLoginOutput);
                this._tunnelProcess = loginProcess;
                try {
                    await loginProcess;
                    if (this._tunnelProcess !== loginProcess) {
                        return;
                    }
                }
                catch (e) {
                    this._logger.error(e);
                    this._tunnelProcess = undefined;
                    this._onDidTokenFailedEmitter.fire(session);
                    this.setTunnelStatus(remoteTunnel_1.TunnelStates.disconnected(session));
                    return;
                }
            }
            const hostName = this._getTunnelName();
            if (hostName) {
                this.setTunnelStatus(remoteTunnel_1.TunnelStates.connecting((0, nls_1.localize)({ key: 'remoteTunnelService.openTunnelWithName', comment: ['{0} is a tunnel name'] }, 'Opening tunnel {0}', hostName)));
            }
            else {
                this.setTunnelStatus(remoteTunnel_1.TunnelStates.connecting((0, nls_1.localize)('remoteTunnelService.openTunnel', 'Opening tunnel')));
            }
            const args = ['--accept-server-license-terms', '--log', (0, log_1.LogLevelToString)(this._logger.getLevel())];
            if (hostName) {
                args.push('--name', hostName);
            }
            else {
                args.push('--random-name');
            }
            let serviceInstallFailed = false;
            if (this._mode.active && this._mode.asService && !isServiceInstalled) {
                // I thought about calling `code tunnel kill` here, but having multiple
                // tunnel processes running is pretty much idempotent. If there's
                // another tunnel process running, the service process will
                // take over when it exits, no hard feelings.
                serviceInstallFailed = await this.installTunnelService(args) === false;
            }
            return this.serverOrAttachTunnel(session, args, serviceInstallFailed);
        }
        async installTunnelService(args) {
            let status;
            try {
                status = await this.runCodeTunnelCommand('serviceInstall', ['service', 'install', ...args]);
            }
            catch (e) {
                this._logger.error(e);
                status = 1;
            }
            if (status !== 0) {
                const msg = (0, nls_1.localize)('remoteTunnelService.serviceInstallFailed', 'Failed to install tunnel as a service, starting in session...');
                this._logger.warn(msg);
                this.setTunnelStatus(remoteTunnel_1.TunnelStates.connecting(msg));
                return false;
            }
            return true;
        }
        async serverOrAttachTunnel(session, args, serviceInstallFailed) {
            args.push('--parent-process-id', String(process.pid));
            if (this._preventSleep()) {
                args.push('--no-sleep');
            }
            let isAttached = false;
            const serveCommand = this.runCodeTunnelCommand('tunnel', args, (message, isErr) => {
                if (isErr) {
                    this._logger.error(message);
                }
                else {
                    this._logger.info(message);
                }
                if (message.includes('Connected to an existing tunnel process')) {
                    isAttached = true;
                }
                const m = message.match(/Open this link in your browser (https:\/\/([^\/\s]+)\/([^\/\s]+)\/([^\/\s]+))/);
                if (m) {
                    const info = { link: m[1], domain: m[2], tunnelName: m[4], isAttached };
                    this.setTunnelStatus(remoteTunnel_1.TunnelStates.connected(info, serviceInstallFailed));
                }
                else if (message.match(/error refreshing token/)) {
                    serveCommand.cancel();
                    this._onDidTokenFailedEmitter.fire(session);
                    this.setTunnelStatus(remoteTunnel_1.TunnelStates.disconnected(session));
                }
            });
            this._tunnelProcess = serveCommand;
            serveCommand.finally(() => {
                if (serveCommand === this._tunnelProcess) {
                    // process exited unexpectedly
                    this._logger.info(`tunnel process terminated`);
                    this._tunnelProcess = undefined;
                    this._mode = remoteTunnel_1.INACTIVE_TUNNEL_MODE;
                    this.setTunnelStatus(remoteTunnel_1.TunnelStates.disconnected());
                }
            });
        }
        runCodeTunnelCommand(logLabel, commandArgs, onOutput = this.defaultOnOutput) {
            return (0, async_1.createCancelablePromise)(token => {
                return new Promise((resolve, reject) => {
                    if (token.isCancellationRequested) {
                        resolve(-1);
                    }
                    let tunnelProcess;
                    const stdio = ['ignore', 'pipe', 'pipe'];
                    token.onCancellationRequested(() => {
                        if (tunnelProcess) {
                            this._logger.info(`${logLabel} terminating(${tunnelProcess.pid})`);
                            tunnelProcess.kill();
                        }
                    });
                    if (!this.environmentService.isBuilt) {
                        onOutput('Building tunnel CLI from sources and run\n', false);
                        onOutput(`${logLabel} Spawning: cargo run -- tunnel ${commandArgs.join(' ')}\n`, false);
                        tunnelProcess = (0, child_process_1.spawn)('cargo', ['run', '--', 'tunnel', ...commandArgs], { cwd: (0, path_1.join)(this.environmentService.appRoot, 'cli'), stdio });
                    }
                    else {
                        onOutput('Running tunnel CLI\n', false);
                        const tunnelCommand = this.getTunnelCommandLocation();
                        onOutput(`${logLabel} Spawning: ${tunnelCommand} tunnel ${commandArgs.join(' ')}\n`, false);
                        tunnelProcess = (0, child_process_1.spawn)(tunnelCommand, ['tunnel', ...commandArgs], { cwd: (0, os_1.homedir)(), stdio });
                    }
                    tunnelProcess.stdout.pipe(new nodeStreams_1.StreamSplitter('\n')).on('data', data => {
                        if (tunnelProcess) {
                            const message = data.toString();
                            onOutput(message, false);
                        }
                    });
                    tunnelProcess.stderr.pipe(new nodeStreams_1.StreamSplitter('\n')).on('data', data => {
                        if (tunnelProcess) {
                            const message = data.toString();
                            onOutput(message, true);
                        }
                    });
                    tunnelProcess.on('exit', e => {
                        if (tunnelProcess) {
                            onOutput(`${logLabel} exit(${tunnelProcess.pid}): + ${e} `, false);
                            tunnelProcess = undefined;
                            resolve(e || 0);
                        }
                    });
                    tunnelProcess.on('error', e => {
                        if (tunnelProcess) {
                            onOutput(`${logLabel} error(${tunnelProcess.pid}): + ${e} `, true);
                            tunnelProcess = undefined;
                            reject();
                        }
                    });
                });
            });
        }
        async getTunnelName() {
            return this._getTunnelName();
        }
        _preventSleep() {
            return !!this.configurationService.getValue(remoteTunnel_1.CONFIGURATION_KEY_PREVENT_SLEEP);
        }
        _getTunnelName() {
            let name = this.configurationService.getValue(remoteTunnel_1.CONFIGURATION_KEY_HOST_NAME) || (0, os_1.hostname)();
            name = name.replace(/^-+/g, '').replace(/[^\w-]/g, '').substring(0, 20);
            return name || undefined;
        }
        _restoreMode() {
            try {
                const tunnelAccessSession = this.storageService.get(TUNNEL_ACCESS_SESSION, -1 /* StorageScope.APPLICATION */);
                const asService = this.storageService.getBoolean(TUNNEL_ACCESS_IS_SERVICE, -1 /* StorageScope.APPLICATION */, false);
                if (tunnelAccessSession) {
                    const session = JSON.parse(tunnelAccessSession);
                    if (session && (0, types_1.isString)(session.accountLabel) && (0, types_1.isString)(session.sessionId) && (0, types_1.isString)(session.providerId)) {
                        return { active: true, session, asService };
                    }
                    this._logger.error('Problems restoring session from storage, invalid format', session);
                }
            }
            catch (e) {
                this._logger.error('Problems restoring session from storage', e);
            }
            return remoteTunnel_1.INACTIVE_TUNNEL_MODE;
        }
        _storeMode(mode) {
            if (mode.active) {
                const sessionWithoutToken = {
                    providerId: mode.session.providerId, sessionId: mode.session.sessionId, accountLabel: mode.session.accountLabel
                };
                this.storageService.store(TUNNEL_ACCESS_SESSION, JSON.stringify(sessionWithoutToken), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this.storageService.store(TUNNEL_ACCESS_IS_SERVICE, mode.asService, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(TUNNEL_ACCESS_SESSION, -1 /* StorageScope.APPLICATION */);
                this.storageService.remove(TUNNEL_ACCESS_IS_SERVICE, -1 /* StorageScope.APPLICATION */);
            }
        }
    };
    exports.RemoteTunnelService = RemoteTunnelService;
    exports.RemoteTunnelService = RemoteTunnelService = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, productService_1.IProductService),
        __param(2, environment_1.INativeEnvironmentService),
        __param(3, log_1.ILoggerService),
        __param(4, sharedProcessLifecycleService_1.ISharedProcessLifecycleService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, storage_1.IStorageService)
    ], RemoteTunnelService);
    function isSameSession(a1, a2) {
        if (a1 && a2) {
            return a1.sessionId === a2.sessionId && a1.providerId === a2.providerId && a1.token === a2.token;
        }
        return a1 === a2;
    }
    const isSameMode = (a, b) => {
        if (a.active !== b.active) {
            return false;
        }
        else if (a.active && b.active) {
            return a.asService === b.asService && isSameSession(a.session, b.session);
        }
        else {
            return true;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVHVubmVsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlbW90ZVR1bm5lbC9ub2RlL3JlbW90ZVR1bm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0NoRyxNQUFNLG1DQUFtQyxHQUFzQjtRQUM5RCwwQ0FBMkI7UUFDM0IsOENBQStCO0tBQy9CLENBQUM7SUFFRixrREFBa0Q7SUFDbEQseURBQXlEO0lBQ3pELDhEQUE4RDtJQUM5RCxNQUFNLHFCQUFxQixHQUFHLHFCQUFxQixDQUFDO0lBQ3BELDBFQUEwRTtJQUMxRSxNQUFNLHdCQUF3QixHQUFHLHVCQUF1QixDQUFDO0lBRXpEOzs7T0FHRztJQUNJLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7UUFpQ2xELFlBQ29CLGdCQUFvRCxFQUN0RCxjQUFnRCxFQUN0QyxrQkFBOEQsRUFDekUsYUFBNkIsRUFDYiw2QkFBNkQsRUFDdEUsb0JBQTRELEVBQ2xFLGNBQWdEO1lBRWpFLEtBQUssRUFBRSxDQUFDO1lBUjRCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDckMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ3JCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBMkI7WUFHakQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFwQ2pELDZCQUF3QixHQUFHLElBQUksZUFBTyxFQUFvQyxDQUFDO1lBQzVFLHFCQUFnQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUM7WUFFdEQsb0NBQStCLEdBQUcsSUFBSSxlQUFPLEVBQWdCLENBQUM7WUFDL0QsNEJBQXVCLEdBQUcsSUFBSSxDQUFDLCtCQUErQixDQUFDLEtBQUssQ0FBQztZQUVw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