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
    exports.$lr = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["MaxRestarts"] = 5] = "MaxRestarts";
    })(Constants || (Constants = {}));
    /**
     * This service implements IPtyService by launching a pty host process, forwarding messages to and
     * from the pty host process and manages the connection.
     */
    let $lr = class $lr extends lifecycle_1.$kc {
        get c() {
            this.h();
            return this.a;
        }
        get f() {
            this.h();
            return this.b;
        }
        /**
         * Get the proxy if it exists, otherwise undefined. This is used when calls are not needed to be
         * passed through to the pty host if it has not yet been spawned.
         */
        get g() {
            return this.b;
        }
        h() {
            if (!this.a) {
                this.U();
            }
        }
        constructor(M, N, O, P) {
            super();
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.m = false;
            this.n = 0;
            this.r = true;
            this.u = this.B(new event_1.$fd());
            this.onPtyHostExit = this.u.event;
            this.w = this.B(new event_1.$fd());
            this.onPtyHostStart = this.w.event;
            this.y = this.B(new event_1.$fd());
            this.onPtyHostUnresponsive = this.y.event;
            this.z = this.B(new event_1.$fd());
            this.onPtyHostResponsive = this.z.event;
            this.C = this.B(new event_1.$fd());
            this.onPtyHostRequestResolveVariables = this.C.event;
            this.D = this.B(new event_1.$fd());
            this.onProcessData = this.D.event;
            this.F = this.B(new event_1.$fd());
            this.onProcessReady = this.F.event;
            this.G = this.B(new event_1.$fd());
            this.onProcessReplay = this.G.event;
            this.H = this.B(new event_1.$fd());
            this.onProcessOrphanQuestion = this.H.event;
            this.I = this.B(new event_1.$fd());
            this.onDidRequestDetach = this.I.event;
            this.J = this.B(new event_1.$fd());
            this.onDidChangeProperty = this.J.event;
            this.L = this.B(new event_1.$fd());
            this.onProcessExit = this.L.event;
            // Platform configuration is required on the process running the pty host (shared process or
            // remote server).
            (0, terminalPlatformConfiguration_1.$$q)();
            this.B(this.M);
            this.B((0, lifecycle_1.$ic)(() => this.W()));
            this.j = this.B(new requestStore_1.$4q(undefined, this.O));
            this.j.onCreateRequest(this.C.fire, this.C);
            // Start the pty host when a window requests a connection, if the starter has that capability.
            if (this.M.onRequestConnection) {
                event_1.Event.once(this.M.onRequestConnection)(() => this.h());
            }
            this.M.onWillShutdown?.(() => this.m = true);
        }
        get Q() {
            return this.N.getValue("terminal.integrated.ignoreProcessNames" /* TerminalSettingId.IgnoreProcessNames */);
        }
        async R() {
            return this.g?.refreshIgnoreProcessNames?.(this.Q);
        }
        async S() {
            if (platform_1.$i) {
                return process.env;
            }
            try {
                return await (0, shellEnv_1.$Ml)(this.N, this.O, { _: [] }, process.env);
            }
            catch (error) {
                this.O.error('ptyHost was unable to resolve shell environment', error);
                return {};
            }
        }
        U() {
            const connection = this.M.start();
            const client = connection.client;
            // Log a full stack trace which will tell the exact reason the pty host is starting up
            if (this.O.getLevel() === log_1.LogLevel.Trace) {
                this.O.trace('PtyHostService#_startPtyHost', new Error().stack?.replace(/^Error/, ''));
            }
            // Setup heartbeat service and trigger a heartbeat immediately to reset the timeouts
            const heartbeatService = ipc_1.ProxyChannel.toService(client.getChannel(terminal_1.TerminalIpcChannels.Heartbeat));
            heartbeatService.onBeat(() => this.X());
            this.X(true);
            // Handle exit
            this.B(connection.onDidProcessExit(e => {
                this.u.fire(e.code);
                if (!this.m && !this.q.isDisposed) {
                    if (this.n <= Constants.MaxRestarts) {
                        this.O.error(`ptyHost terminated unexpectedly with code ${e.code}`);
                        this.n++;
                        this.restartPtyHost();
                    }
                    else {
                        this.O.error(`ptyHost terminated unexpectedly with code ${e.code}, giving up`);
                    }
                }
            }));
            // Create proxy and forward events
            const proxy = ipc_1.ProxyChannel.toService(client.getChannel(terminal_1.TerminalIpcChannels.PtyHost));
            this.B(proxy.onProcessData(e => this.D.fire(e)));
            this.B(proxy.onProcessReady(e => this.F.fire(e)));
            this.B(proxy.onProcessExit(e => this.L.fire(e)));
            this.B(proxy.onDidChangeProperty(e => this.J.fire(e)));
            this.B(proxy.onProcessReplay(e => this.G.fire(e)));
            this.B(proxy.onProcessOrphanQuestion(e => this.H.fire(e)));
            this.B(proxy.onDidRequestDetach(e => this.I.fire(e)));
            this.B(new logIpc_1.$3q(this.P, client.getChannel(terminal_1.TerminalIpcChannels.Logger)));
            this.a = connection;
            this.b = proxy;
            this.w.fire();
            this.B(this.N.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("terminal.integrated.ignoreProcessNames" /* TerminalSettingId.IgnoreProcessNames */)) {
                    await this.R();
                }
            }));
            this.R();
            return [connection, proxy];
        }
        async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName) {
            const timeout = setTimeout(() => this.$(), terminal_1.HeartbeatConstants.CreateProcessTimeout);
            const id = await this.f.createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName);
            clearTimeout(timeout);
            return id;
        }
        updateTitle(id, title, titleSource) {
            return this.f.updateTitle(id, title, titleSource);
        }
        updateIcon(id, userInitiated, icon, color) {
            return this.f.updateIcon(id, userInitiated, icon, color);
        }
        attachToProcess(id) {
            return this.f.attachToProcess(id);
        }
        detachFromProcess(id, forcePersist) {
            return this.f.detachFromProcess(id, forcePersist);
        }
        shutdownAll() {
            return this.f.shutdownAll();
        }
        listProcesses() {
            return this.f.listProcesses();
        }
        async getPerformanceMarks() {
            return this.g?.getPerformanceMarks() ?? [];
        }
        async reduceConnectionGraceTime() {
            return this.g?.reduceConnectionGraceTime();
        }
        start(id) {
            return this.f.start(id);
        }
        shutdown(id, immediate) {
            return this.f.shutdown(id, immediate);
        }
        input(id, data) {
            return this.f.input(id, data);
        }
        processBinary(id, data) {
            return this.f.processBinary(id, data);
        }
        resize(id, cols, rows) {
            return this.f.resize(id, cols, rows);
        }
        clearBuffer(id) {
            return this.f.clearBuffer(id);
        }
        acknowledgeDataEvent(id, charCount) {
            return this.f.acknowledgeDataEvent(id, charCount);
        }
        setUnicodeVersion(id, version) {
            return this.f.setUnicodeVersion(id, version);
        }
        getInitialCwd(id) {
            return this.f.getInitialCwd(id);
        }
        getCwd(id) {
            return this.f.getCwd(id);
        }
        async getLatency() {
            const sw = new stopwatch_1.$bd();
            const results = await this.f.getLatency();
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
            return this.f.orphanQuestionReply(id);
        }
        installAutoReply(match, reply) {
            return this.f.installAutoReply(match, reply);
        }
        uninstallAllAutoReplies() {
            return this.f.uninstallAllAutoReplies();
        }
        uninstallAutoReply(match) {
            return this.f.uninstallAutoReply(match);
        }
        getDefaultSystemShell(osOverride) {
            return this.g?.getDefaultSystemShell(osOverride) ?? (0, shell_1.$wl)(osOverride ?? platform_1.OS, process.env);
        }
        async getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles = false) {
            const shellEnv = await this.S();
            return (0, terminalProfiles_1.$kr)(profiles, defaultProfile, includeDetectedProfiles, this.N, shellEnv, undefined, this.O, this.bb.bind(this, workspaceId));
        }
        async getEnvironment() {
            // If the pty host is yet to be launched, just return the environment of this process as it
            // is essentially the same when used to evaluate terminal profiles.
            if (!this.b) {
                return { ...process.env };
            }
            return this.f.getEnvironment();
        }
        getWslPath(original, direction) {
            return this.f.getWslPath(original, direction);
        }
        getRevivedPtyNewId(workspaceId, id) {
            return this.f.getRevivedPtyNewId(workspaceId, id);
        }
        setTerminalLayoutInfo(args) {
            return this.f.setTerminalLayoutInfo(args);
        }
        async getTerminalLayoutInfo(args) {
            // This is optional as we want reconnect requests to go through only if the pty host exists.
            // Revive is handled specially as reviveTerminalProcesses is guaranteed to be called before
            // the request for layout info.
            return this.g?.getTerminalLayoutInfo(args);
        }
        async requestDetachInstance(workspaceId, instanceId) {
            return this.f.requestDetachInstance(workspaceId, instanceId);
        }
        async acceptDetachInstanceReply(requestId, persistentProcessId) {
            return this.f.acceptDetachInstanceReply(requestId, persistentProcessId);
        }
        async freePortKillProcess(port) {
            if (!this.f.freePortKillProcess) {
                throw new Error('freePortKillProcess does not exist on the pty proxy');
            }
            return this.f.freePortKillProcess(port);
        }
        async serializeTerminalState(ids) {
            return this.f.serializeTerminalState(ids);
        }
        async reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate) {
            return this.f.reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate);
        }
        async refreshProperty(id, property) {
            return this.f.refreshProperty(id, property);
        }
        async updateProperty(id, property, value) {
            return this.f.updateProperty(id, property, value);
        }
        async restartPtyHost() {
            this.W();
            this.r = true;
            this.U();
        }
        W() {
            this.f.shutdownAll();
            this.c.store.dispose();
        }
        X(isConnecting) {
            this.ab();
            this.s = setTimeout(() => this.Y(), isConnecting ? terminal_1.HeartbeatConstants.ConnectingBeatInterval : (terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier));
            if (!this.r) {
                this.r = true;
                this.z.fire();
            }
        }
        Y() {
            this.O.warn(`No ptyHost heartbeat after ${terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier / 1000} seconds`);
            this.s = undefined;
            this.t = setTimeout(() => this.Z(), terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.SecondWaitMultiplier);
        }
        Z() {
            this.O.error(`No ptyHost heartbeat after ${(terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier + terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier) / 1000} seconds`);
            this.t = undefined;
            if (this.r) {
                this.r = false;
                this.y.fire();
            }
        }
        $() {
            this.ab();
            this.O.error(`No ptyHost response to createProcess after ${terminal_1.HeartbeatConstants.CreateProcessTimeout / 1000} seconds`);
            if (this.r) {
                this.r = false;
                this.y.fire();
            }
        }
        ab() {
            if (this.s) {
                clearTimeout(this.s);
                this.s = undefined;
            }
            if (this.t) {
                clearTimeout(this.t);
                this.t = undefined;
            }
        }
        bb(workspaceId, text) {
            return this.j.createRequest({ workspaceId, originalText: text });
        }
        async acceptPtyHostResolvedVariables(requestId, resolved) {
            this.j.acceptReply(requestId, resolved);
        }
    };
    exports.$lr = $lr;
    exports.$lr = $lr = __decorate([
        __param(1, configuration_1.$8h),
        __param(2, log_1.$5i),
        __param(3, log_1.$6i)
    ], $lr);
});
//# sourceMappingURL=ptyHostService.js.map