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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/parts/ipc/common/ipc", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/log/common/logIpc", "vs/platform/shell/node/shellEnv", "vs/platform/terminal/common/requestStore", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalPlatformConfiguration", "vs/platform/terminal/node/terminalProfiles", "vs/base/node/shell", "vs/base/common/stopwatch"], function (require, exports, event_1, lifecycle_1, platform_1, ipc_1, configuration_1, log_1, logIpc_1, shellEnv_1, requestStore_1, terminal_1, terminalPlatformConfiguration_1, terminalProfiles_1, shell_1, stopwatch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PtyHostService = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["MaxRestarts"] = 5] = "MaxRestarts";
    })(Constants || (Constants = {}));
    /**
     * This service implements IPtyService by launching a pty host process, forwarding messages to and
     * from the pty host process and manages the connection.
     */
    let PtyHostService = class PtyHostService extends lifecycle_1.Disposable {
        get _connection() {
            this._ensurePtyHost();
            return this.__connection;
        }
        get _proxy() {
            this._ensurePtyHost();
            return this.__proxy;
        }
        /**
         * Get the proxy if it exists, otherwise undefined. This is used when calls are not needed to be
         * passed through to the pty host if it has not yet been spawned.
         */
        get _optionalProxy() {
            return this.__proxy;
        }
        _ensurePtyHost() {
            if (!this.__connection) {
                this._startPtyHost();
            }
        }
        constructor(_ptyHostStarter, _configurationService, _logService, _loggerService) {
            super();
            this._ptyHostStarter = _ptyHostStarter;
            this._configurationService = _configurationService;
            this._logService = _logService;
            this._loggerService = _loggerService;
            this._wasQuitRequested = false;
            this._restartCount = 0;
            this._isResponsive = true;
            this._onPtyHostExit = this._register(new event_1.Emitter());
            this.onPtyHostExit = this._onPtyHostExit.event;
            this._onPtyHostStart = this._register(new event_1.Emitter());
            this.onPtyHostStart = this._onPtyHostStart.event;
            this._onPtyHostUnresponsive = this._register(new event_1.Emitter());
            this.onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
            this._onPtyHostResponsive = this._register(new event_1.Emitter());
            this.onPtyHostResponsive = this._onPtyHostResponsive.event;
            this._onPtyHostRequestResolveVariables = this._register(new event_1.Emitter());
            this.onPtyHostRequestResolveVariables = this._onPtyHostRequestResolveVariables.event;
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._onProcessData.event;
            this._onProcessReady = this._register(new event_1.Emitter());
            this.onProcessReady = this._onProcessReady.event;
            this._onProcessReplay = this._register(new event_1.Emitter());
            this.onProcessReplay = this._onProcessReplay.event;
            this._onProcessOrphanQuestion = this._register(new event_1.Emitter());
            this.onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
            this._onDidRequestDetach = this._register(new event_1.Emitter());
            this.onDidRequestDetach = this._onDidRequestDetach.event;
            this._onDidChangeProperty = this._register(new event_1.Emitter());
            this.onDidChangeProperty = this._onDidChangeProperty.event;
            this._onProcessExit = this._register(new event_1.Emitter());
            this.onProcessExit = this._onProcessExit.event;
            // Platform configuration is required on the process running the pty host (shared process or
            // remote server).
            (0, terminalPlatformConfiguration_1.registerTerminalPlatformConfiguration)();
            this._register(this._ptyHostStarter);
            this._register((0, lifecycle_1.toDisposable)(() => this._disposePtyHost()));
            this._resolveVariablesRequestStore = this._register(new requestStore_1.RequestStore(undefined, this._logService));
            this._resolveVariablesRequestStore.onCreateRequest(this._onPtyHostRequestResolveVariables.fire, this._onPtyHostRequestResolveVariables);
            // Start the pty host when a window requests a connection, if the starter has that capability.
            if (this._ptyHostStarter.onRequestConnection) {
                event_1.Event.once(this._ptyHostStarter.onRequestConnection)(() => this._ensurePtyHost());
            }
            this._ptyHostStarter.onWillShutdown?.(() => this._wasQuitRequested = true);
        }
        get _ignoreProcessNames() {
            return this._configurationService.getValue("terminal.integrated.ignoreProcessNames" /* TerminalSettingId.IgnoreProcessNames */);
        }
        async _refreshIgnoreProcessNames() {
            return this._optionalProxy?.refreshIgnoreProcessNames?.(this._ignoreProcessNames);
        }
        async _resolveShellEnv() {
            if (platform_1.isWindows) {
                return process.env;
            }
            try {
                return await (0, shellEnv_1.getResolvedShellEnv)(this._configurationService, this._logService, { _: [] }, process.env);
            }
            catch (error) {
                this._logService.error('ptyHost was unable to resolve shell environment', error);
                return {};
            }
        }
        _startPtyHost() {
            const connection = this._ptyHostStarter.start();
            const client = connection.client;
            // Log a full stack trace which will tell the exact reason the pty host is starting up
            if (this._logService.getLevel() === log_1.LogLevel.Trace) {
                this._logService.trace('PtyHostService#_startPtyHost', new Error().stack?.replace(/^Error/, ''));
            }
            // Setup heartbeat service and trigger a heartbeat immediately to reset the timeouts
            const heartbeatService = ipc_1.ProxyChannel.toService(client.getChannel(terminal_1.TerminalIpcChannels.Heartbeat));
            heartbeatService.onBeat(() => this._handleHeartbeat());
            this._handleHeartbeat(true);
            // Handle exit
            this._register(connection.onDidProcessExit(e => {
                this._onPtyHostExit.fire(e.code);
                if (!this._wasQuitRequested && !this._store.isDisposed) {
                    if (this._restartCount <= Constants.MaxRestarts) {
                        this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}`);
                        this._restartCount++;
                        this.restartPtyHost();
                    }
                    else {
                        this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}, giving up`);
                    }
                }
            }));
            // Create proxy and forward events
            const proxy = ipc_1.ProxyChannel.toService(client.getChannel(terminal_1.TerminalIpcChannels.PtyHost));
            this._register(proxy.onProcessData(e => this._onProcessData.fire(e)));
            this._register(proxy.onProcessReady(e => this._onProcessReady.fire(e)));
            this._register(proxy.onProcessExit(e => this._onProcessExit.fire(e)));
            this._register(proxy.onDidChangeProperty(e => this._onDidChangeProperty.fire(e)));
            this._register(proxy.onProcessReplay(e => this._onProcessReplay.fire(e)));
            this._register(proxy.onProcessOrphanQuestion(e => this._onProcessOrphanQuestion.fire(e)));
            this._register(proxy.onDidRequestDetach(e => this._onDidRequestDetach.fire(e)));
            this._register(new logIpc_1.RemoteLoggerChannelClient(this._loggerService, client.getChannel(terminal_1.TerminalIpcChannels.Logger)));
            this.__connection = connection;
            this.__proxy = proxy;
            this._onPtyHostStart.fire();
            this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("terminal.integrated.ignoreProcessNames" /* TerminalSettingId.IgnoreProcessNames */)) {
                    await this._refreshIgnoreProcessNames();
                }
            }));
            this._refreshIgnoreProcessNames();
            return [connection, proxy];
        }
        async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName) {
            const timeout = setTimeout(() => this._handleUnresponsiveCreateProcess(), terminal_1.HeartbeatConstants.CreateProcessTimeout);
            const id = await this._proxy.createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName);
            clearTimeout(timeout);
            return id;
        }
        updateTitle(id, title, titleSource) {
            return this._proxy.updateTitle(id, title, titleSource);
        }
        updateIcon(id, userInitiated, icon, color) {
            return this._proxy.updateIcon(id, userInitiated, icon, color);
        }
        attachToProcess(id) {
            return this._proxy.attachToProcess(id);
        }
        detachFromProcess(id, forcePersist) {
            return this._proxy.detachFromProcess(id, forcePersist);
        }
        shutdownAll() {
            return this._proxy.shutdownAll();
        }
        listProcesses() {
            return this._proxy.listProcesses();
        }
        async getPerformanceMarks() {
            return this._optionalProxy?.getPerformanceMarks() ?? [];
        }
        async reduceConnectionGraceTime() {
            return this._optionalProxy?.reduceConnectionGraceTime();
        }
        start(id) {
            return this._proxy.start(id);
        }
        shutdown(id, immediate) {
            return this._proxy.shutdown(id, immediate);
        }
        input(id, data) {
            return this._proxy.input(id, data);
        }
        processBinary(id, data) {
            return this._proxy.processBinary(id, data);
        }
        resize(id, cols, rows) {
            return this._proxy.resize(id, cols, rows);
        }
        clearBuffer(id) {
            return this._proxy.clearBuffer(id);
        }
        acknowledgeDataEvent(id, charCount) {
            return this._proxy.acknowledgeDataEvent(id, charCount);
        }
        setUnicodeVersion(id, version) {
            return this._proxy.setUnicodeVersion(id, version);
        }
        getInitialCwd(id) {
            return this._proxy.getInitialCwd(id);
        }
        getCwd(id) {
            return this._proxy.getCwd(id);
        }
        async getLatency() {
            const sw = new stopwatch_1.StopWatch();
            const results = await this._proxy.getLatency();
            sw.stop();
            return [
                {
                    label: 'ptyhostservice<->ptyhost',
                    latency: sw.elapsed()
                },
                ...results
            ];
        }
        orphanQuestionReply(id) {
            return this._proxy.orphanQuestionReply(id);
        }
        installAutoReply(match, reply) {
            return this._proxy.installAutoReply(match, reply);
        }
        uninstallAllAutoReplies() {
            return this._proxy.uninstallAllAutoReplies();
        }
        uninstallAutoReply(match) {
            return this._proxy.uninstallAutoReply(match);
        }
        getDefaultSystemShell(osOverride) {
            return this._optionalProxy?.getDefaultSystemShell(osOverride) ?? (0, shell_1.getSystemShell)(osOverride ?? platform_1.OS, process.env);
        }
        async getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles = false) {
            const shellEnv = await this._resolveShellEnv();
            return (0, terminalProfiles_1.detectAvailableProfiles)(profiles, defaultProfile, includeDetectedProfiles, this._configurationService, shellEnv, undefined, this._logService, this._resolveVariables.bind(this, workspaceId));
        }
        async getEnvironment() {
            // If the pty host is yet to be launched, just return the environment of this process as it
            // is essentially the same when used to evaluate terminal profiles.
            if (!this.__proxy) {
                return { ...process.env };
            }
            return this._proxy.getEnvironment();
        }
        getWslPath(original, direction) {
            return this._proxy.getWslPath(original, direction);
        }
        getRevivedPtyNewId(workspaceId, id) {
            return this._proxy.getRevivedPtyNewId(workspaceId, id);
        }
        setTerminalLayoutInfo(args) {
            return this._proxy.setTerminalLayoutInfo(args);
        }
        async getTerminalLayoutInfo(args) {
            // This is optional as we want reconnect requests to go through only if the pty host exists.
            // Revive is handled specially as reviveTerminalProcesses is guaranteed to be called before
            // the request for layout info.
            return this._optionalProxy?.getTerminalLayoutInfo(args);
        }
        async requestDetachInstance(workspaceId, instanceId) {
            return this._proxy.requestDetachInstance(workspaceId, instanceId);
        }
        async acceptDetachInstanceReply(requestId, persistentProcessId) {
            return this._proxy.acceptDetachInstanceReply(requestId, persistentProcessId);
        }
        async freePortKillProcess(port) {
            if (!this._proxy.freePortKillProcess) {
                throw new Error('freePortKillProcess does not exist on the pty proxy');
            }
            return this._proxy.freePortKillProcess(port);
        }
        async serializeTerminalState(ids) {
            return this._proxy.serializeTerminalState(ids);
        }
        async reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate) {
            return this._proxy.reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate);
        }
        async refreshProperty(id, property) {
            return this._proxy.refreshProperty(id, property);
        }
        async updateProperty(id, property, value) {
            return this._proxy.updateProperty(id, property, value);
        }
        async restartPtyHost() {
            this._disposePtyHost();
            this._isResponsive = true;
            this._startPtyHost();
        }
        _disposePtyHost() {
            this._proxy.shutdownAll();
            this._connection.store.dispose();
        }
        _handleHeartbeat(isConnecting) {
            this._clearHeartbeatTimeouts();
            this._heartbeatFirstTimeout = setTimeout(() => this._handleHeartbeatFirstTimeout(), isConnecting ? terminal_1.HeartbeatConstants.ConnectingBeatInterval : (terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier));
            if (!this._isResponsive) {
                this._isResponsive = true;
                this._onPtyHostResponsive.fire();
            }
        }
        _handleHeartbeatFirstTimeout() {
            this._logService.warn(`No ptyHost heartbeat after ${terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier / 1000} seconds`);
            this._heartbeatFirstTimeout = undefined;
            this._heartbeatSecondTimeout = setTimeout(() => this._handleHeartbeatSecondTimeout(), terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.SecondWaitMultiplier);
        }
        _handleHeartbeatSecondTimeout() {
            this._logService.error(`No ptyHost heartbeat after ${(terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier + terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier) / 1000} seconds`);
            this._heartbeatSecondTimeout = undefined;
            if (this._isResponsive) {
                this._isResponsive = false;
                this._onPtyHostUnresponsive.fire();
            }
        }
        _handleUnresponsiveCreateProcess() {
            this._clearHeartbeatTimeouts();
            this._logService.error(`No ptyHost response to createProcess after ${terminal_1.HeartbeatConstants.CreateProcessTimeout / 1000} seconds`);
            if (this._isResponsive) {
                this._isResponsive = false;
                this._onPtyHostUnresponsive.fire();
            }
        }
        _clearHeartbeatTimeouts() {
            if (this._heartbeatFirstTimeout) {
                clearTimeout(this._heartbeatFirstTimeout);
                this._heartbeatFirstTimeout = undefined;
            }
            if (this._heartbeatSecondTimeout) {
                clearTimeout(this._heartbeatSecondTimeout);
                this._heartbeatSecondTimeout = undefined;
            }
        }
        _resolveVariables(workspaceId, text) {
            return this._resolveVariablesRequestStore.createRequest({ workspaceId, originalText: text });
        }
        async acceptPtyHostResolvedVariables(requestId, resolved) {
            this._resolveVariablesRequestStore.acceptReply(requestId, resolved);
        }
    };
    exports.PtyHostService = PtyHostService;
    exports.PtyHostService = PtyHostService = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, log_1.ILogService),
        __param(3, log_1.ILoggerService)
    ], PtyHostService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHR5SG9zdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZXJtaW5hbC9ub2RlL3B0eUhvc3RTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFCaEcsSUFBSyxTQUVKO0lBRkQsV0FBSyxTQUFTO1FBQ2IsdURBQWUsQ0FBQTtJQUNoQixDQUFDLEVBRkksU0FBUyxLQUFULFNBQVMsUUFFYjtJQUVEOzs7T0FHRztJQUNJLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBVTtRQU83QyxJQUFZLFdBQVc7WUFDdEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLFlBQWEsQ0FBQztRQUMzQixDQUFDO1FBQ0QsSUFBWSxNQUFNO1lBQ2pCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixPQUFPLElBQUksQ0FBQyxPQUFRLENBQUM7UUFDdEIsQ0FBQztRQUNEOzs7V0FHRztRQUNILElBQVksY0FBYztZQUN6QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckIsQ0FBQztRQUVPLGNBQWM7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUNyQjtRQUNGLENBQUM7UUFtQ0QsWUFDa0IsZUFBZ0MsRUFDMUIscUJBQTZELEVBQ3ZFLFdBQXlDLEVBQ3RDLGNBQStDO1lBRS9ELEtBQUssRUFBRSxDQUFDO1lBTFMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ1QsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUN0RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNyQixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFwQ3hELHNCQUFpQixHQUFHLEtBQUssQ0FBQztZQUMxQixrQkFB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