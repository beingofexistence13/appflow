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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/nls!vs/workbench/contrib/terminal/browser/terminalProcessManager", "vs/platform/terminal/common/terminalStrings", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteHosts", "vs/platform/telemetry/common/telemetry", "vs/platform/terminal/common/capabilities/naiveCwdDetectionCapability", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalRecorder", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/environmentVariableInfo", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/common/environmentVariable", "vs/platform/terminal/common/environmentVariableCollection", "vs/platform/terminal/common/environmentVariableShared", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/history/common/history", "vs/workbench/services/path/common/pathService", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/severity", "vs/platform/notification/common/notification", "vs/base/common/uuid", "vs/base/common/async"], function (require, exports, event_1, lifecycle_1, network_1, platform_1, nls_1, terminalStrings_1, configuration_1, instantiation_1, productService_1, remoteHosts_1, telemetry_1, naiveCwdDetectionCapability_1, terminalCapabilityStore_1, terminal_1, terminalRecorder_1, workspace_1, environmentVariableInfo_1, terminal_2, environmentVariable_1, environmentVariableCollection_1, environmentVariableShared_1, terminal_3, terminalEnvironment, configurationResolver_1, environmentService_1, history_1, pathService_1, remoteAgentService_1, severity_1, notification_1, uuid_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7Vb = void 0;
    var ProcessConstants;
    (function (ProcessConstants) {
        /**
         * The amount of time to consider terminal errors to be related to the launch.
         */
        ProcessConstants[ProcessConstants["ErrorLaunchThresholdDuration"] = 500] = "ErrorLaunchThresholdDuration";
        /**
         * The minimum amount of time between latency requests.
         */
        ProcessConstants[ProcessConstants["LatencyMeasuringInterval"] = 1000] = "LatencyMeasuringInterval";
    })(ProcessConstants || (ProcessConstants = {}));
    var ProcessType;
    (function (ProcessType) {
        ProcessType[ProcessType["Process"] = 0] = "Process";
        ProcessType[ProcessType["PsuedoTerminal"] = 1] = "PsuedoTerminal";
    })(ProcessType || (ProcessType = {}));
    /**
     * Holds all state related to the creation and management of terminal processes.
     *
     * Internal definitions:
     * - Process: The process launched with the terminalProcess.ts file, or the pty as a whole
     * - Pty Process: The pseudoterminal parent process (or the conpty/winpty agent process)
     * - Shell Process: The pseudoterminal child process (ie. the shell)
     */
    let $7Vb = class $7Vb extends lifecycle_1.$kc {
        get persistentProcessId() { return this.b?.id; }
        get shouldPersist() { return !!this.reconnectionProperties || (this.b ? this.b.shouldPersist : false); }
        get hasWrittenData() { return this.n; }
        get hasChildProcesses() { return this.r; }
        get reconnectionProperties() { return this.z?.attachPersistentProcess?.reconnectionProperties || this.z?.reconnectionProperties || undefined; }
        get extEnvironmentVariableCollection() { return this.j; }
        constructor(R, S, cwd, environmentVariableCollections, shellIntegrationNonce, U, W, X, Y, Z, $, ab, bb, cb, db, eb, fb, gb, hb, ib) {
            super();
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.processState = 1 /* ProcessState.Uninitialized */;
            this.capabilities = new terminalCapabilityStore_1.$eib();
            this.a = false;
            this.b = null;
            this.f = 0 /* ProcessType.Process */;
            this.g = [];
            this.n = false;
            this.r = false;
            this.t = false;
            this.y = false;
            this.C = { cols: 0, rows: 0 };
            this.D = this.B(new event_1.$fd());
            this.onPtyDisconnect = this.D.event;
            this.F = this.B(new event_1.$fd());
            this.onPtyReconnect = this.F.event;
            this.G = this.B(new event_1.$fd());
            this.onProcessReady = this.G.event;
            this.H = this.B(new event_1.$fd());
            this.onProcessStateChange = this.H.event;
            this.I = this.B(new event_1.$fd());
            this.onBeforeProcessData = this.I.event;
            this.J = this.B(new event_1.$fd());
            this.onProcessData = this.J.event;
            this.L = this.B(new event_1.$fd());
            this.onProcessReplayComplete = this.L.event;
            this.M = this.B(new event_1.$fd());
            this.onDidChangeProperty = this.M.event;
            this.N = this.B(new event_1.$fd());
            this.onEnvironmentVariableInfoChanged = this.N.event;
            this.O = this.B(new event_1.$fd());
            this.onProcessExit = this.O.event;
            this.P = this.B(new event_1.$fd());
            this.onRestoreCommands = this.P.event;
            this.Q = terminalEnvironment.$2M(cwd, this.Y, this.U);
            this.ptyProcessReady = this.jb();
            this.m = new AckDataBufferer(e => this.b?.acknowledgeDataEvent(e));
            this.u = this.W.createInstance(SeamlessRelaunchDataFilter);
            this.u.onProcessData(ev => {
                const data = (typeof ev === 'string' ? ev : ev.data);
                const beforeProcessDataEvent = { data };
                this.I.fire(beforeProcessDataEvent);
                if (beforeProcessDataEvent.data && beforeProcessDataEvent.data.length > 0) {
                    // This event is used by the caller so the object must be reused
                    if (typeof ev !== 'string') {
                        ev.data = beforeProcessDataEvent.data;
                    }
                    this.J.fire(typeof ev !== 'string' ? ev : { data: beforeProcessDataEvent.data, trackCommit: false });
                }
            });
            if (cwd && typeof cwd === 'object') {
                this.remoteAuthority = (0, remoteHosts_1.$Ok)(cwd);
            }
            else {
                this.remoteAuthority = this.$.remoteAuthority;
            }
            if (environmentVariableCollections) {
                this.j = new environmentVariableCollection_1.$gr(environmentVariableCollections);
                this.B(this.db.onDidChangeCollections(newCollection => this.qb(newCollection)));
                this.environmentVariableInfo = this.W.createInstance(environmentVariableInfo_1.$6Vb, this.j);
                this.N.fire(this.environmentVariableInfo);
            }
            this.shellIntegrationNonce = shellIntegrationNonce ?? (0, uuid_1.$4f)();
        }
        async freePortKillProcess(port) {
            try {
                if (this.b?.freePortKillProcess) {
                    await this.b?.freePortKillProcess(port);
                }
            }
            catch (e) {
                this.ib.notify({ message: (0, nls_1.localize)(0, null, port, e), severity: severity_1.default.Warning });
            }
        }
        dispose(immediate = false) {
            this.a = true;
            if (this.b) {
                // If the process was still connected this dispose came from
                // within VS Code, not the process, so mark the process as
                // killed by the user.
                this.pb(5 /* ProcessState.KilledByUser */);
                this.b.shutdown(immediate);
                this.b = null;
            }
            super.dispose();
        }
        jb() {
            return new Promise(c => {
                const listener = this.onProcessReady(() => {
                    this.X.debug(`Terminal process ready (shellProcessId: ${this.shellProcessId})`);
                    listener.dispose();
                    c(undefined);
                });
            });
        }
        async detachFromProcess(forcePersist) {
            await this.b?.detach?.(forcePersist);
            this.b = null;
        }
        async createProcess(shellLaunchConfig, cols, rows, reset = true) {
            this.z = shellLaunchConfig;
            this.C.cols = cols;
            this.C.rows = rows;
            let newProcess;
            if (shellLaunchConfig.customPtyImplementation) {
                this.f = 1 /* ProcessType.PsuedoTerminal */;
                newProcess = shellLaunchConfig.customPtyImplementation(this.R, cols, rows);
            }
            else {
                const backend = await this.gb.getBackend(this.remoteAuthority);
                if (!backend) {
                    throw new Error(`No terminal backend registered for remote authority '${this.remoteAuthority}'`);
                }
                this.backend = backend;
                // Create variable resolver
                const variableResolver = terminalEnvironment.$YM(this.Q, await this.eb.getEnvironment(this.remoteAuthority), this.Z);
                // resolvedUserHome is needed here as remote resolvers can launch local terminals before
                // they're connected to the remote.
                this.userHome = this.cb.resolvedUserHome?.fsPath;
                this.os = platform_1.OS;
                if (!!this.remoteAuthority) {
                    const userHomeUri = await this.cb.userHome();
                    this.userHome = userHomeUri.path;
                    const remoteEnv = await this.bb.getEnvironment();
                    if (!remoteEnv) {
                        throw new Error(`Failed to get remote environment for remote authority "${this.remoteAuthority}"`);
                    }
                    this.userHome = remoteEnv.userHome.path;
                    this.os = remoteEnv.os;
                    // this is a copy of what the merged environment collection is on the remote side
                    const env = await this.kb(backend, variableResolver, shellLaunchConfig);
                    const shouldPersist = ((this.fb.getValue("task.reconnection" /* TaskSettingId.Reconnection */) && shellLaunchConfig.reconnectionProperties) || !shellLaunchConfig.isFeatureTerminal) && this.S.config.enablePersistentSessions && !shellLaunchConfig.isTransient;
                    if (shellLaunchConfig.attachPersistentProcess) {
                        const result = await backend.attachToProcess(shellLaunchConfig.attachPersistentProcess.id);
                        if (result) {
                            newProcess = result;
                        }
                        else {
                            // Warn and just create a new terminal if attach failed for some reason
                            this.X.warn(`Attach to process failed for terminal`, shellLaunchConfig.attachPersistentProcess);
                            shellLaunchConfig.attachPersistentProcess = undefined;
                        }
                    }
                    if (!newProcess) {
                        await this.eb.resolveShellLaunchConfig(shellLaunchConfig, {
                            remoteAuthority: this.remoteAuthority,
                            os: this.os
                        });
                        const options = {
                            shellIntegration: {
                                enabled: this.fb.getValue("terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */),
                                suggestEnabled: this.fb.getValue("terminal.integrated.shellIntegration.suggestEnabled" /* TerminalSettingId.ShellIntegrationSuggestEnabled */),
                                nonce: this.shellIntegrationNonce
                            },
                            windowsEnableConpty: this.S.config.windowsEnableConpty,
                            environmentVariableCollections: this.j?.collections ? (0, environmentVariableShared_1.$er)(this.j.collections) : undefined,
                            workspaceFolder: this.Q,
                        };
                        try {
                            newProcess = await backend.createProcess(shellLaunchConfig, '', // TODO: Fix cwd
                            cols, rows, this.S.config.unicodeVersion, env, // TODO:
                            options, shouldPersist);
                        }
                        catch (e) {
                            if (e?.message === 'Could not fetch remote environment') {
                                this.X.trace(`Could not fetch remote environment, silently failing`);
                                return undefined;
                            }
                            throw e;
                        }
                    }
                    if (!this.a) {
                        this.mb(backend);
                    }
                }
                else {
                    if (shellLaunchConfig.attachPersistentProcess) {
                        const result = shellLaunchConfig.attachPersistentProcess.findRevivedId ? await backend.attachToRevivedProcess(shellLaunchConfig.attachPersistentProcess.id) : await backend.attachToProcess(shellLaunchConfig.attachPersistentProcess.id);
                        if (result) {
                            newProcess = result;
                        }
                        else {
                            // Warn and just create a new terminal if attach failed for some reason
                            this.X.warn(`Attach to process failed for terminal`, shellLaunchConfig.attachPersistentProcess);
                            shellLaunchConfig.attachPersistentProcess = undefined;
                        }
                    }
                    if (!newProcess) {
                        newProcess = await this.lb(backend, shellLaunchConfig, cols, rows, this.userHome, variableResolver);
                    }
                    if (!this.a) {
                        this.mb(backend);
                    }
                }
            }
            // If the process was disposed during its creation, shut it down and return failure
            if (this.a) {
                newProcess.shutdown(false);
                return undefined;
            }
            this.b = newProcess;
            this.pb(2 /* ProcessState.Launching */);
            // Add any capabilities inherent to the backend
            if (this.os === 3 /* OperatingSystem.Linux */ || this.os === 2 /* OperatingSystem.Macintosh */) {
                this.capabilities.add(1 /* TerminalCapability.NaiveCwdDetection */, new naiveCwdDetectionCapability_1.$3Vb(this.b));
            }
            this.u.newProcess(this.b, reset);
            if (this.w) {
                (0, lifecycle_1.$fc)(this.w);
            }
            this.w = [
                newProcess.onProcessReady((e) => {
                    this.shellProcessId = e.pid;
                    this.h = e.cwd;
                    this.M.fire({ type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: this.h });
                    this.G.fire(e);
                    if (this.g.length > 0 && this.b) {
                        // Send any queued data that's waiting
                        newProcess.input(this.g.join(''));
                        this.g.length = 0;
                    }
                }),
                newProcess.onProcessExit(exitCode => this.ob(exitCode)),
                newProcess.onDidChangeProperty(({ type, value }) => {
                    switch (type) {
                        case "hasChildProcesses" /* ProcessPropertyType.HasChildProcesses */:
                            this.r = value;
                            break;
                        case "failedShellIntegrationActivation" /* ProcessPropertyType.FailedShellIntegrationActivation */:
                            this.hb?.publicLog2('terminal/shellIntegrationActivationFailureCustomArgs');
                            break;
                    }
                    this.M.fire({ type, value });
                })
            ];
            if (newProcess.onProcessReplayComplete) {
                this.w.push(newProcess.onProcessReplayComplete(() => this.L.fire()));
            }
            if (newProcess.onRestoreCommands) {
                this.w.push(newProcess.onRestoreCommands(e => this.P.fire(e)));
            }
            setTimeout(() => {
                if (this.processState === 2 /* ProcessState.Launching */) {
                    this.pb(3 /* ProcessState.Running */);
                }
            }, 500 /* ProcessConstants.ErrorLaunchThresholdDuration */);
            const result = await newProcess.start();
            if (result) {
                // Error
                return result;
            }
            // Report the latency to the pty host when idle
            (0, async_1.$Wg)(() => {
                this.backend?.getLatency().then(measurements => {
                    this.X.info(`Latency measurements for ${this.remoteAuthority ?? 'local'} backend\n${measurements.map(e => `${e.label}: ${e.latency.toFixed(2)}ms`).join('\n')}`);
                });
            });
            return undefined;
        }
        async relaunch(shellLaunchConfig, cols, rows, reset) {
            this.ptyProcessReady = this.jb();
            this.X.trace(`Relaunching terminal instance ${this.R}`);
            // Fire reconnect if needed to ensure the terminal is usable again
            if (this.y) {
                this.y = false;
                this.F.fire();
            }
            // Clear data written flag to re-enable seamless relaunch if this relaunch was manually
            // triggered
            this.n = false;
            return this.createProcess(shellLaunchConfig, cols, rows, reset);
        }
        // Fetch any extension environment additions and apply them
        async kb(backend, variableResolver, shellLaunchConfig) {
            const workspaceFolder = terminalEnvironment.$2M(shellLaunchConfig.cwd, this.Y, this.U);
            const platformKey = platform_1.$i ? 'windows' : (platform_1.$j ? 'osx' : 'linux');
            const envFromConfigValue = this.fb.getValue(`terminal.integrated.env.${platformKey}`);
            this.S.showRecommendations(shellLaunchConfig);
            let baseEnv;
            if (shellLaunchConfig.useShellEnvironment) {
                // TODO: Avoid as any?
                baseEnv = await backend.getShellEnvironment();
            }
            else {
                baseEnv = await this.eb.getEnvironment(this.remoteAuthority);
            }
            const env = await terminalEnvironment.$ZM(shellLaunchConfig, envFromConfigValue, variableResolver, this.ab.version, this.S.config.detectLocale, baseEnv);
            if (!this.a && !shellLaunchConfig.strictEnv && !shellLaunchConfig.hideFromUser) {
                this.j = this.db.mergedCollection;
                this.B(this.db.onDidChangeCollections(newCollection => this.qb(newCollection)));
                // For remote terminals, this is a copy of the mergedEnvironmentCollection created on
                // the remote side. Since the environment collection is synced between the remote and
                // local sides immediately this is a fairly safe way of enabling the env var diffing and
                // info widget. While technically these could differ due to the slight change of a race
                // condition, the chance is minimal plus the impact on the user is also not that great
                // if it happens - it's not worth adding plumbing to sync back the resolved collection.
                await this.j.applyToProcessEnvironment(env, { workspaceFolder }, variableResolver);
                if (this.j.getVariableMap({ workspaceFolder }).size) {
                    this.environmentVariableInfo = this.W.createInstance(environmentVariableInfo_1.$6Vb, this.j);
                    this.N.fire(this.environmentVariableInfo);
                }
            }
            return env;
        }
        async lb(backend, shellLaunchConfig, cols, rows, userHome, variableResolver) {
            await this.eb.resolveShellLaunchConfig(shellLaunchConfig, {
                remoteAuthority: undefined,
                os: platform_1.OS
            });
            const activeWorkspaceRootUri = this.U.getLastActiveWorkspaceRoot(network_1.Schemas.file);
            const initialCwd = await terminalEnvironment.$XM(shellLaunchConfig, userHome, variableResolver, activeWorkspaceRootUri, this.S.config.cwd, this.X);
            const env = await this.kb(backend, variableResolver, shellLaunchConfig);
            const options = {
                shellIntegration: {
                    enabled: this.fb.getValue("terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */),
                    suggestEnabled: this.fb.getValue("terminal.integrated.shellIntegration.suggestEnabled" /* TerminalSettingId.ShellIntegrationSuggestEnabled */),
                    nonce: this.shellIntegrationNonce
                },
                windowsEnableConpty: this.S.config.windowsEnableConpty,
                environmentVariableCollections: this.j ? (0, environmentVariableShared_1.$er)(this.j.collections) : undefined,
                workspaceFolder: this.Q,
            };
            const shouldPersist = ((this.fb.getValue("task.reconnection" /* TaskSettingId.Reconnection */) && shellLaunchConfig.reconnectionProperties) || !shellLaunchConfig.isFeatureTerminal) && this.S.config.enablePersistentSessions && !shellLaunchConfig.isTransient;
            return await backend.createProcess(shellLaunchConfig, initialCwd, cols, rows, this.S.config.unicodeVersion, env, options, shouldPersist);
        }
        mb(backend) {
            if (this.t) {
                return;
            }
            this.t = true;
            // Mark the process as disconnected is the pty host is unresponsive, the responsive event
            // will fire only when the pty host was already unresponsive
            this.B(backend.onPtyHostUnresponsive(() => {
                this.y = true;
                this.D.fire();
            }));
            this.s = backend.onPtyHostResponsive(() => {
                this.y = false;
                this.F.fire();
            });
            this.B((0, lifecycle_1.$ic)(() => this.s?.dispose()));
            // When the pty host restarts, reconnect is no longer possible so dispose the responsive
            // listener
            this.B(backend.onPtyHostRestart(async () => {
                // When the pty host restarts, reconnect is no longer possible
                if (!this.y) {
                    this.y = true;
                    this.D.fire();
                }
                this.s?.dispose();
                this.s = undefined;
                if (this.z) {
                    if (this.z.isFeatureTerminal && !this.reconnectionProperties) {
                        // Indicate the process is exited (and gone forever) only for feature terminals
                        // so they can react to the exit, this is particularly important for tasks so
                        // that it knows that the process is not still active. Note that this is not
                        // done for regular terminals because otherwise the terminal instance would be
                        // disposed.
                        this.ob(-1);
                    }
                    else {
                        // For normal terminals write a message indicating what happened and relaunch
                        // using the previous shellLaunchConfig
                        const message = (0, nls_1.localize)(1, null);
                        this.J.fire({ data: (0, terminalStrings_1.$zKb)(message, { loudFormatting: true }), trackCommit: false });
                        await this.relaunch(this.z, this.C.cols, this.C.rows, false);
                    }
                }
            }));
        }
        async getBackendOS() {
            let os = platform_1.OS;
            if (!!this.remoteAuthority) {
                const remoteEnv = await this.bb.getEnvironment();
                if (!remoteEnv) {
                    throw new Error(`Failed to get remote environment for remote authority "${this.remoteAuthority}"`);
                }
                os = remoteEnv.os;
            }
            return os;
        }
        setDimensions(cols, rows, sync) {
            if (sync) {
                this.nb(cols, rows);
                return;
            }
            return this.ptyProcessReady.then(() => this.nb(cols, rows));
        }
        async setUnicodeVersion(version) {
            return this.b?.setUnicodeVersion(version);
        }
        nb(cols, rows) {
            if (!this.b) {
                return;
            }
            // The child process could already be terminated
            try {
                this.b.resize(cols, rows);
            }
            catch (error) {
                // We tried to write to a closed pipe / channel.
                if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
                    throw (error);
                }
            }
            this.C.cols = cols;
            this.C.rows = rows;
        }
        async write(data) {
            await this.ptyProcessReady;
            this.u.disableSeamlessRelaunch();
            this.n = true;
            if (this.shellProcessId || this.f === 1 /* ProcessType.PsuedoTerminal */) {
                if (this.b) {
                    // Send data if the pty is ready
                    this.b.input(data);
                }
            }
            else {
                // If the pty is not ready, queue the data received to send later
                this.g.push(data);
            }
        }
        async processBinary(data) {
            await this.ptyProcessReady;
            this.u.disableSeamlessRelaunch();
            this.n = true;
            this.b?.processBinary(data);
        }
        get initialCwd() {
            return this.h ?? '';
        }
        async refreshProperty(type) {
            if (!this.b) {
                throw new Error('Cannot refresh property when process is not set');
            }
            return this.b.refreshProperty(type);
        }
        async updateProperty(type, value) {
            return this.b?.updateProperty(type, value);
        }
        acknowledgeDataEvent(charCount) {
            this.m.ack(charCount);
        }
        ob(exitCode) {
            this.b = null;
            // If the process is marked as launching then mark the process as killed
            // during launch. This typically means that there is a problem with the
            // shell and args.
            if (this.processState === 2 /* ProcessState.Launching */) {
                this.pb(4 /* ProcessState.KilledDuringLaunch */);
            }
            // If TerminalInstance did not know about the process exit then it was
            // triggered by the process, not on VS Code's side.
            if (this.processState === 3 /* ProcessState.Running */) {
                this.pb(6 /* ProcessState.KilledByProcess */);
            }
            this.O.fire(exitCode);
        }
        pb(state) {
            this.processState = state;
            this.H.fire();
        }
        qb(newCollection) {
            const diff = this.j.diff(newCollection, { workspaceFolder: this.Q });
            if (diff === undefined) {
                // If there are no longer differences, remove the stale info indicator
                if (this.environmentVariableInfo instanceof environmentVariableInfo_1.$5Vb) {
                    this.environmentVariableInfo = this.W.createInstance(environmentVariableInfo_1.$6Vb, this.j);
                    this.N.fire(this.environmentVariableInfo);
                }
                return;
            }
            this.environmentVariableInfo = this.W.createInstance(environmentVariableInfo_1.$5Vb, diff, this.R, newCollection);
            this.N.fire(this.environmentVariableInfo);
        }
        async clearBuffer() {
            this.b?.clearBuffer?.();
        }
    };
    exports.$7Vb = $7Vb;
    exports.$7Vb = $7Vb = __decorate([
        __param(5, history_1.$SM),
        __param(6, instantiation_1.$Ah),
        __param(7, terminal_1.$Zq),
        __param(8, workspace_1.$Kh),
        __param(9, configurationResolver_1.$NM),
        __param(10, environmentService_1.$hJ),
        __param(11, productService_1.$kj),
        __param(12, remoteAgentService_1.$jm),
        __param(13, pathService_1.$yJ),
        __param(14, environmentVariable_1.$sM),
        __param(15, terminal_3.$EM),
        __param(16, configuration_1.$8h),
        __param(17, terminal_2.$Pib),
        __param(18, telemetry_1.$9k),
        __param(19, notification_1.$Yu)
    ], $7Vb);
    class AckDataBufferer {
        constructor(b) {
            this.b = b;
            this.a = 0;
        }
        ack(charCount) {
            this.a += charCount;
            while (this.a > 5000 /* FlowControlConstants.CharCountAckSize */) {
                this.a -= 5000 /* FlowControlConstants.CharCountAckSize */;
                this.b(5000 /* FlowControlConstants.CharCountAckSize */);
            }
        }
    }
    var SeamlessRelaunchConstants;
    (function (SeamlessRelaunchConstants) {
        /**
         * How long to record data events for new terminals.
         */
        SeamlessRelaunchConstants[SeamlessRelaunchConstants["RecordTerminalDuration"] = 10000] = "RecordTerminalDuration";
        /**
         * The maximum duration after a relaunch occurs to trigger a swap.
         */
        SeamlessRelaunchConstants[SeamlessRelaunchConstants["SwapWaitMaximumDuration"] = 3000] = "SwapWaitMaximumDuration";
    })(SeamlessRelaunchConstants || (SeamlessRelaunchConstants = {}));
    /**
     * Filters data events from the process and supports seamlessly restarting swapping out the process
     * with another, delaying the swap in output in order to minimize flickering/clearing of the
     * terminal.
     */
    let SeamlessRelaunchDataFilter = class SeamlessRelaunchDataFilter extends lifecycle_1.$kc {
        get onProcessData() { return this.r.event; }
        constructor(s) {
            super();
            this.s = s;
            this.m = false;
            this.r = this.B(new event_1.$fd());
        }
        newProcess(process, reset) {
            // Stop listening to the old process and trigger delayed shutdown (for hang issue #71966)
            this.h?.dispose();
            this.j?.shutdown(false);
            this.j = process;
            // Start firing events immediately if:
            // - there's no recorder, which means it's a new terminal
            // - this is not a reset, so seamless relaunch isn't necessary
            // - seamless relaunch is disabled because the terminal has accepted input
            if (!this.a || !reset || this.m) {
                this.f?.dispose();
                [this.a, this.f] = this.u(process);
                if (this.m && reset) {
                    this.r.fire('\x1bc');
                }
                this.h = process.onProcessData(e => this.r.fire(e));
                this.m = false;
                return;
            }
            // Trigger a swap if there was a recent relaunch
            if (this.b) {
                this.triggerSwap();
            }
            this.n = window.setTimeout(() => this.triggerSwap(), 3000 /* SeamlessRelaunchConstants.SwapWaitMaximumDuration */);
            // Pause all outgoing data events
            this.h?.dispose();
            this.f?.dispose();
            const recorder = this.u(process);
            [this.b, this.g] = recorder;
        }
        /**
         * Disables seamless relaunch for the active process
         */
        disableSeamlessRelaunch() {
            this.m = true;
            this.t();
            this.triggerSwap();
        }
        /**
         * Trigger the swap of the processes if needed (eg. timeout, input)
         */
        triggerSwap() {
            // Clear the swap timeout if it exists
            if (this.n) {
                window.clearTimeout(this.n);
                this.n = undefined;
            }
            // Do nothing if there's nothing being recorder
            if (!this.a) {
                return;
            }
            // Clear the first recorder if no second process was attached before the swap trigger
            if (!this.b) {
                this.a = undefined;
                this.f?.dispose();
                return;
            }
            // Generate data for each recorder
            const firstData = this.w(this.a);
            const secondData = this.w(this.b);
            // Re-write the terminal if the data differs
            if (firstData === secondData) {
                this.s.trace(`Seamless terminal relaunch - identical content`);
            }
            else {
                this.s.trace(`Seamless terminal relaunch - resetting content`);
                // Fire full reset (RIS) followed by the new data so the update happens in the same frame
                this.r.fire({ data: `\x1bc${secondData}`, trackCommit: false });
            }
            // Set up the new data listener
            this.h?.dispose();
            this.h = this.j.onProcessData(e => this.r.fire(e));
            // Replace first recorder with second
            this.a = this.b;
            this.f?.dispose();
            this.f = this.g;
            this.b = undefined;
        }
        t() {
            // Continue recording if a swap is coming
            if (this.n) {
                return;
            }
            // Stop recording
            this.a = undefined;
            this.f?.dispose();
            this.b = undefined;
            this.g?.dispose();
        }
        u(process) {
            const recorder = new terminalRecorder_1.$4Vb(0, 0);
            const disposable = process.onProcessData(e => recorder.handleData(typeof e === 'string' ? e : e.data));
            return [recorder, disposable];
        }
        w(recorder) {
            return recorder.generateReplayEventSync().events.filter(e => !!e.data).map(e => e.data).join('');
        }
    };
    SeamlessRelaunchDataFilter = __decorate([
        __param(0, terminal_1.$Zq)
    ], SeamlessRelaunchDataFilter);
});
//# sourceMappingURL=terminalProcessManager.js.map