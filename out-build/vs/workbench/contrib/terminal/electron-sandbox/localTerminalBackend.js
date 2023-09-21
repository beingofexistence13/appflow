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
define(["require", "exports", "vs/base/common/event", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/electron-sandbox/localPty", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService", "vs/workbench/services/history/common/history", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/platform/product/common/productService", "vs/workbench/contrib/terminal/common/environmentVariable", "vs/workbench/contrib/terminal/browser/baseTerminalBackend", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/base/parts/ipc/common/ipc.mp", "vs/base/parts/ipc/electron-sandbox/ipc.mp", "vs/base/parts/ipc/common/ipc", "vs/base/common/performance", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/async", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/decorators", "vs/base/common/stopwatch", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, event_1, platform_1, configuration_1, instantiation_1, label_1, platform_2, storage_1, terminal_1, workspace_1, terminal_2, terminal_3, localPty_1, configurationResolver_1, shellEnvironmentService_1, history_1, terminalEnvironment, productService_1, environmentVariable_1, baseTerminalBackend_1, environmentService_1, ipc_mp_1, ipc_mp_2, ipc_1, performance_1, lifecycle_1, async_1, statusbar_1, decorators_1, stopwatch_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Eac = void 0;
    let $Eac = class $Eac {
        constructor(instantiationService, terminalInstanceService) {
            const backend = instantiationService.createInstance(LocalTerminalBackend);
            platform_2.$8m.as(terminal_1.$Xq.Backend).registerTerminalBackend(backend);
            terminalInstanceService.didRegisterBackend(backend.remoteAuthority);
        }
    };
    exports.$Eac = $Eac;
    exports.$Eac = $Eac = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, terminal_2.$Pib)
    ], $Eac);
    let LocalTerminalBackend = class LocalTerminalBackend extends baseTerminalBackend_1.$nWb {
        /**
         * Communicate to the direct proxy (renderer<->ptyhost) if it's available, otherwise use the
         * indirect proxy (renderer<->main<->ptyhost). The latter may not need to actually launch the
         * pty host, for example when detecting profiles.
         */
        get z() { return this.y || this.G; }
        get whenReady() { return this.C.p; }
        setReady() { this.C.complete(); }
        constructor(workspaceContextService, F, logService, G, H, I, J, L, M, N, O, P, Q, historyService, R, statusBarService, S) {
            super(G, logService, historyService, L, statusBarService, workspaceContextService);
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.remoteAuthority = undefined;
            this.u = new Map();
            this.C = new async_1.$2g();
            this.D = this.B(new event_1.$fd());
            this.onDidRequestDetach = this.D.event;
            this.onPtyHostRestart(() => {
                this.y = undefined;
                this.w = undefined;
                this.U();
            });
        }
        /**
         * Request a direct connection to the pty host, this will launch the pty host process if necessary.
         */
        async U() {
            // Check if connecting is in progress
            if (this.w) {
                await this.w.p;
                return;
            }
            this.j.debug('Starting pty host');
            const directProxyClientEventually = new async_1.$2g();
            this.w = directProxyClientEventually;
            const directProxy = ipc_1.ProxyChannel.toService((0, ipc_1.$hh)(this.w.p.then(client => client.getChannel(terminal_1.TerminalIpcChannels.PtyHostWindow))));
            this.y = directProxy;
            // The pty host should not get launched until at least the window restored phase
            // if remote auth exists, don't await
            if (!this.S.getConnection()?.remoteAuthority) {
                await this.F.when(3 /* LifecyclePhase.Restored */);
            }
            (0, performance_1.mark)('code/terminal/willConnectPtyHost');
            this.j.trace('Renderer->PtyHost#connect: before acquirePort');
            (0, ipc_mp_2.$6S)('vscode:createPtyHostMessageChannel', 'vscode:createPtyHostMessageChannelResult').then(port => {
                (0, performance_1.mark)('code/terminal/didConnectPtyHost');
                this.j.trace('Renderer->PtyHost#connect: connection established');
                // There are two connections to the pty host; one to the regular shared process
                // _localPtyService, and one directly via message port _ptyHostDirectProxy. The former is
                // used for pty host management messages, it would make sense in the future to use a
                // separate interface/service for this one.
                const client = new ipc_mp_1.$YS(port, `window:${this.R.window.id}`);
                directProxyClientEventually.complete(client);
                this.b.fire();
                // Attach process listeners
                directProxy.onProcessData(e => this.u.get(e.id)?.handleData(e.event));
                directProxy.onDidChangeProperty(e => this.u.get(e.id)?.handleDidChangeProperty(e.property));
                directProxy.onProcessExit(e => {
                    const pty = this.u.get(e.id);
                    if (pty) {
                        pty.handleExit(e.event);
                        this.u.delete(e.id);
                    }
                });
                directProxy.onProcessReady(e => this.u.get(e.id)?.handleReady(e.event));
                directProxy.onProcessReplay(e => this.u.get(e.id)?.handleReplay(e.event));
                directProxy.onProcessOrphanQuestion(e => this.u.get(e.id)?.handleOrphanQuestion());
                directProxy.onDidRequestDetach(e => this.D.fire(e));
                // Listen for config changes
                const initialConfig = this.M.getValue(terminal_3.$vM);
                for (const match of Object.keys(initialConfig.autoReplies)) {
                    // Ensure the reply is value
                    const reply = initialConfig.autoReplies[match];
                    if (reply) {
                        directProxy.installAutoReply(match, reply);
                    }
                }
                // TODO: Could simplify update to a single call
                this.B(this.M.onDidChangeConfiguration(async (e) => {
                    if (e.affectsConfiguration("terminal.integrated.autoReplies" /* TerminalSettingId.AutoReplies */)) {
                        directProxy.uninstallAllAutoReplies();
                        const config = this.M.getValue(terminal_3.$vM);
                        for (const match of Object.keys(config.autoReplies)) {
                            // Ensure the reply is value
                            const reply = config.autoReplies[match];
                            if (reply) {
                                this.z.installAutoReply(match, reply);
                            }
                        }
                    }
                }));
                // Eagerly fetch the backend's environment for memoization
                this.getEnvironment();
            });
        }
        async requestDetachInstance(workspaceId, instanceId) {
            return this.z.requestDetachInstance(workspaceId, instanceId);
        }
        async acceptDetachInstanceReply(requestId, persistentProcessId) {
            if (!persistentProcessId) {
                this.j.warn('Cannot attach to feature terminals, custom pty terminals, or those without a persistentProcessId');
                return;
            }
            return this.z.acceptDetachInstanceReply(requestId, persistentProcessId);
        }
        async persistTerminalState() {
            const ids = Array.from(this.u.keys());
            const serialized = await this.z.serializeTerminalState(ids);
            this.J.store("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, serialized, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async updateTitle(id, title, titleSource) {
            await this.z.updateTitle(id, title, titleSource);
        }
        async updateIcon(id, userInitiated, icon, color) {
            await this.z.updateIcon(id, userInitiated, icon, color);
        }
        async updateProperty(id, property, value) {
            return this.z.updateProperty(id, property, value);
        }
        async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, options, shouldPersist) {
            await this.U();
            const executableEnv = await this.I.getShellEnv();
            const id = await this.z.createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, this.s(), this.X());
            const pty = new localPty_1.$Dac(id, shouldPersist, this.z);
            this.u.set(id, pty);
            return pty;
        }
        async attachToProcess(id) {
            await this.U();
            try {
                await this.z.attachToProcess(id);
                const pty = new localPty_1.$Dac(id, true, this.z);
                this.u.set(id, pty);
                return pty;
            }
            catch (e) {
                this.j.warn(`Couldn't attach to process ${e.message}`);
            }
            return undefined;
        }
        async attachToRevivedProcess(id) {
            await this.U();
            try {
                const newId = await this.z.getRevivedPtyNewId(this.s(), id) ?? id;
                return await this.attachToProcess(newId);
            }
            catch (e) {
                this.j.warn(`Couldn't attach to process ${e.message}`);
            }
            return undefined;
        }
        async listProcesses() {
            await this.U();
            return this.z.listProcesses();
        }
        async getLatency() {
            const measurements = [];
            const sw = new stopwatch_1.$bd();
            if (this.y) {
                await this.y.getLatency();
                sw.stop();
                measurements.push({
                    label: 'window<->ptyhost (message port)',
                    latency: sw.elapsed()
                });
                sw.reset();
            }
            const results = await this.G.getLatency();
            sw.stop();
            measurements.push({
                label: 'window<->ptyhostservice<->ptyhost',
                latency: sw.elapsed()
            });
            return [
                ...measurements,
                ...results
            ];
        }
        async getPerformanceMarks() {
            return this.z.getPerformanceMarks();
        }
        async reduceConnectionGraceTime() {
            this.z.reduceConnectionGraceTime();
        }
        async getDefaultSystemShell(osOverride) {
            return this.z.getDefaultSystemShell(osOverride);
        }
        async getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
            return this.G.getProfiles(this.m.getWorkspace().id, profiles, defaultProfile, includeDetectedProfiles) || [];
        }
        async getEnvironment() {
            return this.z.getEnvironment();
        }
        async getShellEnvironment() {
            return this.I.getShellEnv();
        }
        async getWslPath(original, direction) {
            return this.z.getWslPath(original, direction);
        }
        async setTerminalLayoutInfo(layoutInfo) {
            const args = {
                workspaceId: this.s(),
                tabs: layoutInfo ? layoutInfo.tabs : []
            };
            await this.z.setTerminalLayoutInfo(args);
            // Store in the storage service as well to be used when reviving processes as normally this
            // is stored in memory on the pty host
            this.J.store("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, JSON.stringify(args), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async getTerminalLayoutInfo() {
            const workspaceId = this.s();
            const layoutArgs = { workspaceId };
            // Revive processes if needed
            const serializedState = this.J.get("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
            const reviveBufferState = this.n(serializedState);
            if (reviveBufferState && reviveBufferState.length > 0) {
                try {
                    // Create variable resolver
                    const activeWorkspaceRootUri = this.O.getLastActiveWorkspaceRoot();
                    const lastActiveWorkspace = activeWorkspaceRootUri ? this.m.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
                    const variableResolver = terminalEnvironment.$YM(lastActiveWorkspace, await this.P.getEnvironment(this.remoteAuthority), this.L);
                    // Re-resolve the environments and replace it on the state so local terminals use a fresh
                    // environment
                    (0, performance_1.mark)('code/terminal/willGetReviveEnvironments');
                    await Promise.all(reviveBufferState.map(state => new Promise(r => {
                        this.W(variableResolver, state.shellLaunchConfig).then(freshEnv => {
                            state.processLaunchConfig.env = freshEnv;
                            r();
                        });
                    })));
                    (0, performance_1.mark)('code/terminal/didGetReviveEnvironments');
                    (0, performance_1.mark)('code/terminal/willReviveTerminalProcesses');
                    await this.z.reviveTerminalProcesses(workspaceId, reviveBufferState, Intl.DateTimeFormat().resolvedOptions().locale);
                    (0, performance_1.mark)('code/terminal/didReviveTerminalProcesses');
                    this.J.remove("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
                    // If reviving processes, send the terminal layout info back to the pty host as it
                    // will not have been persisted on application exit
                    const layoutInfo = this.J.get("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                    if (layoutInfo) {
                        (0, performance_1.mark)('code/terminal/willSetTerminalLayoutInfo');
                        await this.z.setTerminalLayoutInfo(JSON.parse(layoutInfo));
                        (0, performance_1.mark)('code/terminal/didSetTerminalLayoutInfo');
                        this.J.remove("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                    }
                }
                catch (e) {
                    this.j.warn('LocalTerminalBackend#getTerminalLayoutInfo Error', e && typeof e === 'object' && 'message' in e ? e.message : e);
                }
            }
            return this.z.getTerminalLayoutInfo(layoutArgs);
        }
        async W(variableResolver, shellLaunchConfig) {
            const platformKey = platform_1.$i ? 'windows' : (platform_1.$j ? 'osx' : 'linux');
            const envFromConfigValue = this.M.getValue(`terminal.integrated.env.${platformKey}`);
            const baseEnv = await (shellLaunchConfig.useShellEnvironment ? this.getShellEnvironment() : this.getEnvironment());
            const env = await terminalEnvironment.$ZM(shellLaunchConfig, envFromConfigValue, variableResolver, this.N.version, this.M.getValue("terminal.integrated.detectLocale" /* TerminalSettingId.DetectLocale */), baseEnv);
            if (!shellLaunchConfig.strictEnv && !shellLaunchConfig.hideFromUser) {
                const workspaceFolder = terminalEnvironment.$2M(shellLaunchConfig.cwd, this.m, this.O);
                await this.Q.mergedCollection.applyToProcessEnvironment(env, { workspaceFolder }, variableResolver);
            }
            return env;
        }
        X() {
            return this.H.getWorkspaceLabel(this.m.getWorkspace());
        }
    };
    __decorate([
        decorators_1.$6g
    ], LocalTerminalBackend.prototype, "getEnvironment", null);
    __decorate([
        decorators_1.$6g
    ], LocalTerminalBackend.prototype, "getShellEnvironment", null);
    LocalTerminalBackend = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, lifecycle_1.$7y),
        __param(2, terminal_1.$Zq),
        __param(3, terminal_1.$Yq),
        __param(4, label_1.$Vz),
        __param(5, shellEnvironmentService_1.$K_b),
        __param(6, storage_1.$Vo),
        __param(7, configurationResolver_1.$NM),
        __param(8, configuration_1.$8h),
        __param(9, productService_1.$kj),
        __param(10, history_1.$SM),
        __param(11, terminal_3.$EM),
        __param(12, environmentVariable_1.$sM),
        __param(13, history_1.$SM),
        __param(14, environmentService_1.$1$b),
        __param(15, statusbar_1.$6$),
        __param(16, remoteAgentService_1.$jm)
    ], LocalTerminalBackend);
});
//# sourceMappingURL=localTerminalBackend.js.map