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
define(["require", "exports", "vs/platform/remoteTunnel/common/remoteTunnel", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/environment/common/environment", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/base/common/path", "child_process", "vs/platform/product/common/productService", "vs/base/common/platform", "vs/base/common/async", "vs/platform/lifecycle/node/sharedProcessLifecycleService", "vs/platform/configuration/common/configuration", "vs/nls!vs/platform/remoteTunnel/node/remoteTunnelService", "os", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/base/node/nodeStreams", "vs/base/common/resources"], function (require, exports, remoteTunnel_1, event_1, telemetry_1, environment_1, lifecycle_1, log_1, path_1, child_process_1, productService_1, platform_1, async_1, sharedProcessLifecycleService_1, configuration_1, nls_1, os_1, storage_1, types_1, nodeStreams_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$g8b = void 0;
    const restartTunnelOnConfigurationChanges = [
        remoteTunnel_1.$_7b,
        remoteTunnel_1.$a8b,
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
    let $g8b = class $g8b extends lifecycle_1.$kc {
        constructor(y, z, C, loggerService, sharedProcessLifecycleService, D, F) {
            super();
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.f = new event_1.$fd();
            this.onDidTokenFailed = this.f.event;
            this.g = new event_1.$fd();
            this.onDidChangeTunnelStatus = this.g.event;
            this.h = new event_1.$fd();
            this.onDidChangeMode = this.h.event;
            /**
             * "Mode" in the terminal state we want to get to -- started, stopped, and
             * the attributes associated with each.
             *
             * At any given time, work may be ongoing to get `_tunnelStatus` into a
             * state that reflects the desired `mode`.
             */
            this.n = remoteTunnel_1.$07b;
            this.w = false;
            this.I = (a, isErr) => {
                if (isErr) {
                    this.j.error(a);
                }
                else {
                    this.j.info(a);
                }
            };
            this.j = this.B(loggerService.createLogger((0, resources_1.$ig)(C.logsHome, `${remoteTunnel_1.$b8b}.log`), { id: remoteTunnel_1.$b8b, name: remoteTunnel_1.$c8b }));
            this.t = new async_1.$Dg(100);
            this.B(this.j.onDidChangeLogLevel(l => this.j.info('Log level changed to ' + (0, log_1.$hj)(l))));
            this.B(sharedProcessLifecycleService.onWillShutdown(() => {
                this.r?.cancel();
                this.r = undefined;
                this.dispose();
            }));
            this.B(D.onDidChangeConfiguration(e => {
                if (restartTunnelOnConfigurationChanges.some(c => e.affectsConfiguration(c))) {
                    this.t.trigger(() => this.L());
                }
            }));
            this.n = this.R();
            this.s = remoteTunnel_1.TunnelStates.uninitialized;
        }
        async getTunnelStatus() {
            return this.s;
        }
        G(tunnelStatus) {
            this.s = tunnelStatus;
            this.g.fire(tunnelStatus);
        }
        H(mode) {
            if (isSameMode(this.n, mode)) {
                return;
            }
            this.n = mode;
            this.S(mode);
            this.h.fire(this.n);
            if (mode.active) {
                this.j.info(`Session updated: ${mode.session.accountLabel} (${mode.session.providerId}) (service=${mode.asService})`);
                if (mode.session.token) {
                    this.j.info(`Session token updated: ${mode.session.accountLabel} (${mode.session.providerId})`);
                }
            }
            else {
                this.j.info(`Session reset`);
            }
        }
        getMode() {
            return Promise.resolve(this.n);
        }
        async initialize(mode) {
            if (this.w) {
                return this.s;
            }
            this.w = true;
            this.H(mode);
            try {
                await this.t.trigger(() => this.L());
            }
            catch (e) {
                this.j.error(e);
            }
            return this.s;
        }
        J() {
            if (!this.u) {
                let binParentLocation;
                if (platform_1.$j) {
                    // appRoot = /Applications/Visual Studio Code - Insiders.app/Contents/Resources/app
                    // bin = /Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin
                    binParentLocation = this.C.appRoot;
                }
                else {
                    // appRoot = C:\Users\<name>\AppData\Local\Programs\Microsoft VS Code Insiders\resources\app
                    // bin = C:\Users\<name>\AppData\Local\Programs\Microsoft VS Code Insiders\bin
                    // appRoot = /usr/share/code-insiders/resources/app
                    // bin = /usr/share/code-insiders/bin
                    binParentLocation = (0, path_1.$_d)((0, path_1.$_d)(this.C.appRoot));
                }
                this.u = (0, path_1.$9d)(binParentLocation, 'bin', `${this.z.tunnelApplicationName}${platform_1.$i ? '.exe' : ''}`);
            }
            return this.u;
        }
        async startTunnel(mode) {
            if (isSameMode(this.n, mode) && this.s.type !== 'disconnected') {
                return this.s;
            }
            this.H(mode);
            try {
                await this.t.trigger(() => this.L());
            }
            catch (e) {
                this.j.error(e);
            }
            return this.s;
        }
        async stopTunnel() {
            if (this.r) {
                this.r.cancel();
                this.r = undefined;
            }
            if (!this.n.active) {
                return;
            }
            // Be careful to only uninstall the service if we're the ones who installed it:
            const needsServiceUninstall = this.n.asService;
            this.H(remoteTunnel_1.$07b);
            try {
                if (needsServiceUninstall) {
                    this.O('uninstallService', ['service', 'uninstall']);
                }
            }
            catch (e) {
                this.j.error(e);
            }
            try {
                await this.O('stop', ['kill']);
            }
            catch (e) {
                this.j.error(e);
            }
            this.G(remoteTunnel_1.TunnelStates.disconnected());
        }
        async L() {
            this.y.publicLog2('remoteTunnel.enablement', {
                enabled: this.n.active,
                service: this.n.active && this.n.asService,
            });
            if (this.r) {
                this.r.cancel();
                this.r = undefined;
            }
            let output = '';
            let isServiceInstalled = false;
            const onOutput = (a, isErr) => {
                if (isErr) {
                    this.j.error(a);
                }
                else {
                    output += a;
                }
                if (!this.C.isBuilt && a.startsWith('   Compiling')) {
                    this.G(remoteTunnel_1.TunnelStates.connecting((0, nls_1.localize)(0, null)));
                }
            };
            const statusProcess = this.O('status', ['status'], onOutput);
            this.r = statusProcess;
            try {
                await statusProcess;
                if (this.r !== statusProcess) {
                    return;
                }
                // split and find the line, since in dev builds additional noise is
                // added by cargo to the output.
                const status = JSON.parse(output.trim().split('\n').find(l => l.startsWith('{')));
                isServiceInstalled = status.service_installed;
                this.j.info(status.tunnel ? 'Other tunnel running, attaching...' : 'No other tunnel running');
                // If a tunnel is running but the mode isn't "active", we'll still attach
                // to the tunnel to show its state in the UI. If neither are true, disconnect
                if (!status.tunnel && !this.n.active) {
                    this.G(remoteTunnel_1.TunnelStates.disconnected());
                    return;
                }
            }
            catch (e) {
                this.j.error(e);
                this.G(remoteTunnel_1.TunnelStates.disconnected());
                return;
            }
            finally {
                if (this.r === statusProcess) {
                    this.r = undefined;
                }
            }
            const session = this.n.active ? this.n.session : undefined;
            if (session && session.token) {
                const token = session.token;
                this.G(remoteTunnel_1.TunnelStates.connecting((0, nls_1.localize)(1, null, session.accountLabel, session.providerId)));
                const onLoginOutput = (a, isErr) => {
                    a = a.replaceAll(token, '*'.repeat(4));
                    onOutput(a, isErr);
                };
                const loginProcess = this.O('login', ['user', 'login', '--provider', session.providerId, '--access-token', token, '--log', (0, log_1.$hj)(this.j.getLevel())], onLoginOutput);
                this.r = loginProcess;
                try {
                    await loginProcess;
                    if (this.r !== loginProcess) {
                        return;
                    }
                }
                catch (e) {
                    this.j.error(e);
                    this.r = undefined;
                    this.f.fire(session);
                    this.G(remoteTunnel_1.TunnelStates.disconnected(session));
                    return;
                }
            }
            const hostName = this.Q();
            if (hostName) {
                this.G(remoteTunnel_1.TunnelStates.connecting((0, nls_1.localize)(2, null, hostName)));
            }
            else {
                this.G(remoteTunnel_1.TunnelStates.connecting((0, nls_1.localize)(3, null)));
            }
            const args = ['--accept-server-license-terms', '--log', (0, log_1.$hj)(this.j.getLevel())];
            if (hostName) {
                args.push('--name', hostName);
            }
            else {
                args.push('--random-name');
            }
            let serviceInstallFailed = false;
            if (this.n.active && this.n.asService && !isServiceInstalled) {
                // I thought about calling `code tunnel kill` here, but having multiple
                // tunnel processes running is pretty much idempotent. If there's
                // another tunnel process running, the service process will
                // take over when it exits, no hard feelings.
                serviceInstallFailed = await this.M(args) === false;
            }
            return this.N(session, args, serviceInstallFailed);
        }
        async M(args) {
            let status;
            try {
                status = await this.O('serviceInstall', ['service', 'install', ...args]);
            }
            catch (e) {
                this.j.error(e);
                status = 1;
            }
            if (status !== 0) {
                const msg = (0, nls_1.localize)(4, null);
                this.j.warn(msg);
                this.G(remoteTunnel_1.TunnelStates.connecting(msg));
                return false;
            }
            return true;
        }
        async N(session, args, serviceInstallFailed) {
            args.push('--parent-process-id', String(process.pid));
            if (this.P()) {
                args.push('--no-sleep');
            }
            let isAttached = false;
            const serveCommand = this.O('tunnel', args, (message, isErr) => {
                if (isErr) {
                    this.j.error(message);
                }
                else {
                    this.j.info(message);
                }
                if (message.includes('Connected to an existing tunnel process')) {
                    isAttached = true;
                }
                const m = message.match(/Open this link in your browser (https:\/\/([^\/\s]+)\/([^\/\s]+)\/([^\/\s]+))/);
                if (m) {
                    const info = { link: m[1], domain: m[2], tunnelName: m[4], isAttached };
                    this.G(remoteTunnel_1.TunnelStates.connected(info, serviceInstallFailed));
                }
                else if (message.match(/error refreshing token/)) {
                    serveCommand.cancel();
                    this.f.fire(session);
                    this.G(remoteTunnel_1.TunnelStates.disconnected(session));
                }
            });
            this.r = serveCommand;
            serveCommand.finally(() => {
                if (serveCommand === this.r) {
                    // process exited unexpectedly
                    this.j.info(`tunnel process terminated`);
                    this.r = undefined;
                    this.n = remoteTunnel_1.$07b;
                    this.G(remoteTunnel_1.TunnelStates.disconnected());
                }
            });
        }
        O(logLabel, commandArgs, onOutput = this.I) {
            return (0, async_1.$ug)(token => {
                return new Promise((resolve, reject) => {
                    if (token.isCancellationRequested) {
                        resolve(-1);
                    }
                    let tunnelProcess;
                    const stdio = ['ignore', 'pipe', 'pipe'];
                    token.onCancellationRequested(() => {
                        if (tunnelProcess) {
                            this.j.info(`${logLabel} terminating(${tunnelProcess.pid})`);
                            tunnelProcess.kill();
                        }
                    });
                    if (!this.C.isBuilt) {
                        onOutput('Building tunnel CLI from sources and run\n', false);
                        onOutput(`${logLabel} Spawning: cargo run -- tunnel ${commandArgs.join(' ')}\n`, false);
                        tunnelProcess = (0, child_process_1.spawn)('cargo', ['run', '--', 'tunnel', ...commandArgs], { cwd: (0, path_1.$9d)(this.C.appRoot, 'cli'), stdio });
                    }
                    else {
                        onOutput('Running tunnel CLI\n', false);
                        const tunnelCommand = this.J();
                        onOutput(`${logLabel} Spawning: ${tunnelCommand} tunnel ${commandArgs.join(' ')}\n`, false);
                        tunnelProcess = (0, child_process_1.spawn)(tunnelCommand, ['tunnel', ...commandArgs], { cwd: (0, os_1.homedir)(), stdio });
                    }
                    tunnelProcess.stdout.pipe(new nodeStreams_1.$QS('\n')).on('data', data => {
                        if (tunnelProcess) {
                            const message = data.toString();
                            onOutput(message, false);
                        }
                    });
                    tunnelProcess.stderr.pipe(new nodeStreams_1.$QS('\n')).on('data', data => {
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
            return this.Q();
        }
        P() {
            return !!this.D.getValue(remoteTunnel_1.$a8b);
        }
        Q() {
            let name = this.D.getValue(remoteTunnel_1.$_7b) || (0, os_1.hostname)();
            name = name.replace(/^-+/g, '').replace(/[^\w-]/g, '').substring(0, 20);
            return name || undefined;
        }
        R() {
            try {
                const tunnelAccessSession = this.F.get(TUNNEL_ACCESS_SESSION, -1 /* StorageScope.APPLICATION */);
                const asService = this.F.getBoolean(TUNNEL_ACCESS_IS_SERVICE, -1 /* StorageScope.APPLICATION */, false);
                if (tunnelAccessSession) {
                    const session = JSON.parse(tunnelAccessSession);
                    if (session && (0, types_1.$jf)(session.accountLabel) && (0, types_1.$jf)(session.sessionId) && (0, types_1.$jf)(session.providerId)) {
                        return { active: true, session, asService };
                    }
                    this.j.error('Problems restoring session from storage, invalid format', session);
                }
            }
            catch (e) {
                this.j.error('Problems restoring session from storage', e);
            }
            return remoteTunnel_1.$07b;
        }
        S(mode) {
            if (mode.active) {
                const sessionWithoutToken = {
                    providerId: mode.session.providerId, sessionId: mode.session.sessionId, accountLabel: mode.session.accountLabel
                };
                this.F.store(TUNNEL_ACCESS_SESSION, JSON.stringify(sessionWithoutToken), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this.F.store(TUNNEL_ACCESS_IS_SERVICE, mode.asService, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.F.remove(TUNNEL_ACCESS_SESSION, -1 /* StorageScope.APPLICATION */);
                this.F.remove(TUNNEL_ACCESS_IS_SERVICE, -1 /* StorageScope.APPLICATION */);
            }
        }
    };
    exports.$g8b = $g8b;
    exports.$g8b = $g8b = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, productService_1.$kj),
        __param(2, environment_1.$Jh),
        __param(3, log_1.$6i),
        __param(4, sharedProcessLifecycleService_1.$e8b),
        __param(5, configuration_1.$8h),
        __param(6, storage_1.$Vo)
    ], $g8b);
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
//# sourceMappingURL=remoteTunnelService.js.map