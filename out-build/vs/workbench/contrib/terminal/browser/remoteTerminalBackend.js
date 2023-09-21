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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/marshalling", "vs/base/common/performance", "vs/base/common/stopwatch", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/storage/common/storage", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/baseTerminalBackend", "vs/workbench/contrib/terminal/browser/remotePty", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/common/remote/remoteTerminalChannel", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/history/common/history", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/statusbar/browser/statusbar"], function (require, exports, async_1, event_1, marshalling_1, performance_1, stopwatch_1, commands_1, configuration_1, instantiation_1, platform_1, remoteAuthorityResolver_1, storage_1, terminal_1, workspace_1, baseTerminalBackend_1, remotePty_1, terminal_2, remoteTerminalChannel_1, terminal_3, configurationResolver_1, history_1, remoteAgentService_1, statusbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pWb = void 0;
    let $pWb = class $pWb {
        constructor(instantiationService, remoteAgentService, terminalInstanceService) {
            const connection = remoteAgentService.getConnection();
            if (connection?.remoteAuthority) {
                const channel = instantiationService.createInstance(remoteTerminalChannel_1.$6M, connection.remoteAuthority, connection.getChannel(remoteTerminalChannel_1.$5M));
                const backend = instantiationService.createInstance(RemoteTerminalBackend, connection.remoteAuthority, channel);
                platform_1.$8m.as(terminal_1.$Xq.Backend).registerTerminalBackend(backend);
                terminalInstanceService.didRegisterBackend(backend.remoteAuthority);
            }
        }
    };
    exports.$pWb = $pWb;
    exports.$pWb = $pWb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, remoteAgentService_1.$jm),
        __param(2, terminal_2.$Pib)
    ], $pWb);
    let RemoteTerminalBackend = class RemoteTerminalBackend extends baseTerminalBackend_1.$nWb {
        get whenReady() { return this.u.p; }
        setReady() { this.u.complete(); }
        constructor(remoteAuthority, z, C, D, logService, F, G, H, workspaceContextService, configurationResolverService, I, J, statusBarService) {
            super(z, logService, I, configurationResolverService, statusBarService, workspaceContextService);
            this.remoteAuthority = remoteAuthority;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.r = new Map();
            this.u = new async_1.$2g();
            this.w = this.B(new event_1.$fd());
            this.onDidRequestDetach = this.w.event;
            this.y = this.B(new event_1.$fd());
            this.onRestoreCommands = this.y.event;
            this.z.onProcessData(e => this.r.get(e.id)?.handleData(e.event));
            this.z.onProcessReplay(e => {
                this.r.get(e.id)?.handleReplay(e.event);
                if (e.event.commands.commands.length > 0) {
                    this.y.fire({ id: e.id, commands: e.event.commands.commands });
                }
            });
            this.z.onProcessOrphanQuestion(e => this.r.get(e.id)?.handleOrphanQuestion());
            this.z.onDidRequestDetach(e => this.w.fire(e));
            this.z.onProcessReady(e => this.r.get(e.id)?.handleReady(e.event));
            this.z.onDidChangeProperty(e => this.r.get(e.id)?.handleDidChangeProperty(e.property));
            this.z.onProcessExit(e => {
                const pty = this.r.get(e.id);
                if (pty) {
                    pty.handleExit(e.event);
                    this.r.delete(e.id);
                }
            });
            const allowedCommands = ['_remoteCLI.openExternal', '_remoteCLI.windowOpen', '_remoteCLI.getSystemStatus', '_remoteCLI.manageExtensions'];
            this.z.onExecuteCommand(async (e) => {
                // Ensure this request for for this window
                const pty = this.r.get(e.persistentProcessId);
                if (!pty) {
                    return;
                }
                const reqId = e.reqId;
                const commandId = e.commandId;
                if (!allowedCommands.includes(commandId)) {
                    this.z.sendCommandResult(reqId, true, 'Invalid remote cli command: ' + commandId);
                    return;
                }
                const commandArgs = e.commandArgs.map(arg => (0, marshalling_1.$$g)(arg));
                try {
                    const result = await this.F.executeCommand(e.commandId, ...commandArgs);
                    this.z.sendCommandResult(reqId, false, result);
                }
                catch (err) {
                    this.z.sendCommandResult(reqId, true, err);
                }
            });
            // Listen for config changes
            const initialConfig = this.J.getValue(terminal_3.$vM);
            for (const match of Object.keys(initialConfig.autoReplies)) {
                // Ensure the value is truthy
                const reply = initialConfig.autoReplies[match];
                if (reply) {
                    this.z.installAutoReply(match, reply);
                }
            }
            // TODO: Could simplify update to a single call
            this.B(this.J.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("terminal.integrated.autoReplies" /* TerminalSettingId.AutoReplies */)) {
                    this.z.uninstallAllAutoReplies();
                    const config = this.J.getValue(terminal_3.$vM);
                    for (const match of Object.keys(config.autoReplies)) {
                        // Ensure the value is truthy
                        const reply = config.autoReplies[match];
                        if (reply) {
                            await this.z.installAutoReply(match, reply);
                        }
                    }
                }
            }));
            this.b.fire();
        }
        async requestDetachInstance(workspaceId, instanceId) {
            if (!this.z) {
                throw new Error(`Cannot request detach instance when there is no remote!`);
            }
            return this.z.requestDetachInstance(workspaceId, instanceId);
        }
        async acceptDetachInstanceReply(requestId, persistentProcessId) {
            if (!this.z) {
                throw new Error(`Cannot accept detached instance when there is no remote!`);
            }
            else if (!persistentProcessId) {
                this.j.warn('Cannot attach to feature terminals, custom pty terminals, or those without a persistentProcessId');
                return;
            }
            return this.z.acceptDetachInstanceReply(requestId, persistentProcessId);
        }
        async persistTerminalState() {
            if (!this.z) {
                throw new Error(`Cannot persist terminal state when there is no remote!`);
            }
            const ids = Array.from(this.r.keys());
            const serialized = await this.z.serializeTerminalState(ids);
            this.G.store("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, serialized, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async createProcess(shellLaunchConfig, cwd, // TODO: This is ignored
        cols, rows, unicodeVersion, env, // TODO: This is ignored
        options, shouldPersist) {
            if (!this.z) {
                throw new Error(`Cannot create remote terminal when there is no remote!`);
            }
            // Fetch the environment to check shell permissions
            const remoteEnv = await this.C.getEnvironment();
            if (!remoteEnv) {
                // Extension host processes are only allowed in remote extension hosts currently
                throw new Error('Could not fetch remote environment');
            }
            const terminalConfig = this.J.getValue(terminal_3.$vM);
            const configuration = {
                'terminal.integrated.env.windows': this.J.getValue("terminal.integrated.env.windows" /* TerminalSettingId.EnvWindows */),
                'terminal.integrated.env.osx': this.J.getValue("terminal.integrated.env.osx" /* TerminalSettingId.EnvMacOs */),
                'terminal.integrated.env.linux': this.J.getValue("terminal.integrated.env.linux" /* TerminalSettingId.EnvLinux */),
                'terminal.integrated.cwd': this.J.getValue("terminal.integrated.cwd" /* TerminalSettingId.Cwd */),
                'terminal.integrated.detectLocale': terminalConfig.detectLocale
            };
            const shellLaunchConfigDto = {
                name: shellLaunchConfig.name,
                executable: shellLaunchConfig.executable,
                args: shellLaunchConfig.args,
                cwd: shellLaunchConfig.cwd,
                env: shellLaunchConfig.env,
                useShellEnvironment: shellLaunchConfig.useShellEnvironment,
                reconnectionProperties: shellLaunchConfig.reconnectionProperties,
                type: shellLaunchConfig.type,
                isFeatureTerminal: shellLaunchConfig.isFeatureTerminal
            };
            const activeWorkspaceRootUri = this.I.getLastActiveWorkspaceRoot();
            const result = await this.z.createProcess(shellLaunchConfigDto, configuration, activeWorkspaceRootUri, options, shouldPersist, cols, rows, unicodeVersion);
            const pty = this.D.createInstance(remotePty_1.$oWb, result.persistentTerminalId, shouldPersist, this.z);
            this.r.set(result.persistentTerminalId, pty);
            return pty;
        }
        async attachToProcess(id) {
            if (!this.z) {
                throw new Error(`Cannot create remote terminal when there is no remote!`);
            }
            try {
                await this.z.attachToProcess(id);
                const pty = this.D.createInstance(remotePty_1.$oWb, id, true, this.z);
                this.r.set(id, pty);
                return pty;
            }
            catch (e) {
                this.j.trace(`Couldn't attach to process ${e.message}`);
            }
            return undefined;
        }
        async attachToRevivedProcess(id) {
            if (!this.z) {
                throw new Error(`Cannot create remote terminal when there is no remote!`);
            }
            try {
                const newId = await this.z.getRevivedPtyNewId(id) ?? id;
                return await this.attachToProcess(newId);
            }
            catch (e) {
                this.j.trace(`Couldn't attach to process ${e.message}`);
            }
            return undefined;
        }
        async listProcesses() {
            return this.z.listProcesses();
        }
        async getLatency() {
            const sw = new stopwatch_1.$bd();
            const results = await this.z.getLatency();
            sw.stop();
            return [
                {
                    label: 'window<->ptyhostservice<->ptyhost',
                    latency: sw.elapsed()
                },
                ...results
            ];
        }
        async updateProperty(id, property, value) {
            await this.z.updateProperty(id, property, value);
        }
        async updateTitle(id, title, titleSource) {
            await this.z.updateTitle(id, title, titleSource);
        }
        async updateIcon(id, userInitiated, icon, color) {
            await this.z.updateIcon(id, userInitiated, icon, color);
        }
        async getDefaultSystemShell(osOverride) {
            return this.z.getDefaultSystemShell(osOverride) || '';
        }
        async getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
            return this.z.getProfiles(profiles, defaultProfile, includeDetectedProfiles) || [];
        }
        async getEnvironment() {
            return this.z.getEnvironment() || {};
        }
        async getShellEnvironment() {
            const connection = this.C.getConnection();
            if (!connection) {
                return undefined;
            }
            const resolverResult = await this.H.resolveAuthority(connection.remoteAuthority);
            return resolverResult.options?.extensionHostEnv;
        }
        async getWslPath(original, direction) {
            const env = await this.C.getEnvironment();
            if (env?.os !== 1 /* OperatingSystem.Windows */) {
                return original;
            }
            return this.z.getWslPath(original, direction) || original;
        }
        async setTerminalLayoutInfo(layout) {
            if (!this.z) {
                throw new Error(`Cannot call setActiveInstanceId when there is no remote`);
            }
            return this.z.setTerminalLayoutInfo(layout);
        }
        async reduceConnectionGraceTime() {
            if (!this.z) {
                throw new Error('Cannot reduce grace time when there is no remote');
            }
            return this.z.reduceConnectionGraceTime();
        }
        async getTerminalLayoutInfo() {
            if (!this.z) {
                throw new Error(`Cannot call getActiveInstanceId when there is no remote`);
            }
            const workspaceId = this.s();
            // Revive processes if needed
            const serializedState = this.G.get("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
            const reviveBufferState = this.n(serializedState);
            if (reviveBufferState && reviveBufferState.length > 0) {
                try {
                    // Note that remote terminals do not get their environment re-resolved unlike in local terminals
                    (0, performance_1.mark)('code/terminal/willReviveTerminalProcessesRemote');
                    await this.z.reviveTerminalProcesses(workspaceId, reviveBufferState, Intl.DateTimeFormat().resolvedOptions().locale);
                    (0, performance_1.mark)('code/terminal/didReviveTerminalProcessesRemote');
                    this.G.remove("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
                    // If reviving processes, send the terminal layout info back to the pty host as it
                    // will not have been persisted on application exit
                    const layoutInfo = this.G.get("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                    if (layoutInfo) {
                        (0, performance_1.mark)('code/terminal/willSetTerminalLayoutInfoRemote');
                        await this.z.setTerminalLayoutInfo(JSON.parse(layoutInfo));
                        (0, performance_1.mark)('code/terminal/didSetTerminalLayoutInfoRemote');
                        this.G.remove("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                    }
                }
                catch (e) {
                    this.j.warn('RemoteTerminalBackend#getTerminalLayoutInfo Error', e && typeof e === 'object' && 'message' in e ? e.message : e);
                }
            }
            return this.z.getTerminalLayoutInfo();
        }
        async getPerformanceMarks() {
            return this.z.getPerformanceMarks();
        }
    };
    RemoteTerminalBackend = __decorate([
        __param(2, remoteAgentService_1.$jm),
        __param(3, instantiation_1.$Ah),
        __param(4, terminal_1.$Zq),
        __param(5, commands_1.$Fr),
        __param(6, storage_1.$Vo),
        __param(7, remoteAuthorityResolver_1.$Jk),
        __param(8, workspace_1.$Kh),
        __param(9, configurationResolver_1.$NM),
        __param(10, history_1.$SM),
        __param(11, configuration_1.$8h),
        __param(12, statusbar_1.$6$)
    ], RemoteTerminalBackend);
});
//# sourceMappingURL=remoteTerminalBackend.js.map