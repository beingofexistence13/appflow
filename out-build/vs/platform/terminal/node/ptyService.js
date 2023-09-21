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
define(["require", "exports", "child_process", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/node/shell", "vs/platform/log/common/log", "vs/platform/terminal/common/requestStore", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalDataBuffering", "vs/platform/terminal/common/terminalEnvironment", "xterm-headless", "vs/platform/terminal/node/terminalEnvironment", "vs/platform/terminal/node/terminalProcess", "vs/nls!vs/platform/terminal/node/ptyService", "vs/platform/terminal/node/childProcessMonitor", "vs/platform/terminal/common/terminalAutoResponder", "vs/base/common/errors", "vs/platform/terminal/common/xterm/shellIntegrationAddon", "vs/platform/terminal/common/terminalStrings", "path", "vs/base/common/decorators", "vs/base/common/performance"], function (require, exports, child_process_1, async_1, event_1, lifecycle_1, platform_1, shell_1, log_1, requestStore_1, terminal_1, terminalDataBuffering_1, terminalEnvironment_1, xterm_headless_1, terminalEnvironment_2, terminalProcess_1, nls_1, childProcessMonitor_1, terminalAutoResponder_1, errors_1, shellIntegrationAddon_1, terminalStrings_1, path_1, decorators_1, performance) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T$b = exports.$S$b = void 0;
    function $S$b(_target, key, descriptor) {
        if (typeof descriptor.value !== 'function') {
            throw new Error('not supported');
        }
        const fnKey = 'value';
        const fn = descriptor.value;
        descriptor[fnKey] = async function (...args) {
            if (this.traceRpcArgs.logService.getLevel() === log_1.LogLevel.Trace) {
                this.traceRpcArgs.logService.trace(`[RPC Request] PtyService#${fn.name}(${args.map(e => JSON.stringify(e)).join(', ')})`);
            }
            if (this.traceRpcArgs.simulatedLatency) {
                await (0, async_1.$Hg)(this.traceRpcArgs.simulatedLatency);
            }
            let result;
            try {
                result = await fn.apply(this, args);
            }
            catch (e) {
                this.traceRpcArgs.logService.error(`[RPC Response] PtyService#${fn.name}`, e);
                throw e;
            }
            if (this.traceRpcArgs.logService.getLevel() === log_1.LogLevel.Trace) {
                this.traceRpcArgs.logService.trace(`[RPC Response] PtyService#${fn.name}`, result);
            }
            return result;
        };
    }
    exports.$S$b = $S$b;
    let SerializeAddon;
    let Unicode11Addon;
    class $T$b extends lifecycle_1.$kc {
        H(name, event) {
            event(e => {
                if (this.I.getLevel() === log_1.LogLevel.Trace) {
                    this.I.trace(`[RPC Event] PtyService#${name}.fire(${JSON.stringify(e)})`);
                }
            });
            return event;
        }
        get traceRpcArgs() {
            return {
                logService: this.I,
                simulatedLatency: this.M
            };
        }
        constructor(I, J, L, M) {
            super();
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.a = new Map();
            this.b = new Map();
            this.g = new Map();
            this.j = new Map();
            this.n = 0;
            this.u = this.B(new event_1.$fd());
            this.onHeartbeat = this.H('_onHeartbeat', this.u.event);
            this.w = this.B(new event_1.$fd());
            this.onProcessData = this.H('_onProcessData', this.w.event);
            this.y = this.B(new event_1.$fd());
            this.onProcessReplay = this.H('_onProcessReplay', this.y.event);
            this.z = this.B(new event_1.$fd());
            this.onProcessReady = this.H('_onProcessReady', this.z.event);
            this.C = this.B(new event_1.$fd());
            this.onProcessExit = this.H('_onProcessExit', this.C.event);
            this.D = this.B(new event_1.$fd());
            this.onProcessOrphanQuestion = this.H('_onProcessOrphanQuestion', this.D.event);
            this.F = this.B(new event_1.$fd());
            this.onDidRequestDetach = this.H('_onDidRequestDetach', this.F.event);
            this.G = this.B(new event_1.$fd());
            this.onDidChangeProperty = this.H('_onDidChangeProperty', this.G.event);
            this.B((0, lifecycle_1.$ic)(() => {
                for (const pty of this.a.values()) {
                    pty.shutdown(true);
                }
                this.a.clear();
            }));
            this.f = this.B(new requestStore_1.$4q(undefined, this.I));
            this.f.onCreateRequest(this.F.fire, this.F);
        }
        async refreshIgnoreProcessNames(names) {
            childProcessMonitor_1.$N$b.length = 0;
            childProcessMonitor_1.$N$b.push(...names);
        }
        async requestDetachInstance(workspaceId, instanceId) {
            return this.f.createRequest({ workspaceId, instanceId });
        }
        async acceptDetachInstanceReply(requestId, persistentProcessId) {
            let processDetails = undefined;
            const pty = this.a.get(persistentProcessId);
            if (pty) {
                processDetails = await this.S(persistentProcessId, pty);
            }
            this.f.acceptReply(requestId, processDetails);
        }
        async freePortKillProcess(port) {
            const stdout = await new Promise((resolve, reject) => {
                (0, child_process_1.exec)(platform_1.$i ? `netstat -ano | findstr "${port}"` : `lsof -nP -iTCP -sTCP:LISTEN | grep ${port}`, {}, (err, stdout) => {
                    if (err) {
                        return reject('Problem occurred when listing active processes');
                    }
                    resolve(stdout);
                });
            });
            const processesForPort = stdout.split(/\r?\n/).filter(s => !!s.trim());
            if (processesForPort.length >= 1) {
                const capturePid = /\s+(\d+)(?:\s+|$)/;
                const processId = processesForPort[0].match(capturePid)?.[1];
                if (processId) {
                    try {
                        process.kill(Number.parseInt(processId));
                    }
                    catch { }
                }
                else {
                    throw new Error(`Processes for port ${port} were not found`);
                }
                return { port, processId };
            }
            throw new Error(`Could not kill process with port ${port}`);
        }
        async serializeTerminalState(ids) {
            const promises = [];
            for (const [persistentProcessId, persistentProcess] of this.a.entries()) {
                // Only serialize persistent processes that have had data written or performed a replay
                if (persistentProcess.hasWrittenData && ids.indexOf(persistentProcessId) !== -1) {
                    promises.push(async_1.Promises.withAsyncBody(async (r) => {
                        r({
                            id: persistentProcessId,
                            shellLaunchConfig: persistentProcess.shellLaunchConfig,
                            processDetails: await this.S(persistentProcessId, persistentProcess),
                            processLaunchConfig: persistentProcess.processLaunchOptions,
                            unicodeVersion: persistentProcess.unicodeVersion,
                            replayEvent: await persistentProcess.serializeNormalBuffer(),
                            timestamp: Date.now()
                        });
                    }));
                }
            }
            const serialized = {
                version: 1,
                state: await Promise.all(promises)
            };
            return JSON.stringify(serialized);
        }
        async reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocale) {
            const promises = [];
            for (const terminal of state) {
                promises.push(this.N(workspaceId, terminal));
            }
            await Promise.all(promises);
        }
        async N(workspaceId, terminal) {
            const restoreMessage = (0, nls_1.localize)(0, null);
            // TODO: We may at some point want to show date information in a hover via a custom sequence:
            //   new Date(terminal.timestamp).toLocaleDateString(dateTimeFormatLocale)
            //   new Date(terminal.timestamp).toLocaleTimeString(dateTimeFormatLocale)
            const newId = await this.createProcess({
                ...terminal.shellLaunchConfig,
                cwd: terminal.processDetails.cwd,
                color: terminal.processDetails.color,
                icon: terminal.processDetails.icon,
                name: terminal.processDetails.titleSource === terminal_1.TitleEventSource.Api ? terminal.processDetails.title : undefined,
                initialText: terminal.replayEvent.events[0].data + (0, terminalStrings_1.$zKb)(restoreMessage, { loudFormatting: true })
            }, terminal.processDetails.cwd, terminal.replayEvent.events[0].cols, terminal.replayEvent.events[0].rows, terminal.unicodeVersion, terminal.processLaunchConfig.env, terminal.processLaunchConfig.executableEnv, terminal.processLaunchConfig.options, true, terminal.processDetails.workspaceId, terminal.processDetails.workspaceName, true, terminal.replayEvent.events[0].data);
            // Don't start the process here as there's no terminal to answer CPR
            const oldId = this.R(workspaceId, terminal.id);
            this.g.set(oldId, { newId, state: terminal });
            this.I.info(`Revived process, old id ${oldId} -> new id ${newId}`);
        }
        async shutdownAll() {
            this.dispose();
        }
        async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName, isReviving, rawReviveBuffer) {
            if (shellLaunchConfig.attachPersistentProcess) {
                throw new Error('Attempt to create a process when attach object was provided');
            }
            const id = ++this.n;
            const process = new terminalProcess_1.$R$b(shellLaunchConfig, cwd, cols, rows, env, executableEnv, options, this.I, this.J);
            const processLaunchOptions = {
                env,
                executableEnv,
                options
            };
            const persistentProcess = new PersistentTerminalProcess(id, process, workspaceId, workspaceName, shouldPersist, cols, rows, processLaunchOptions, unicodeVersion, this.L, this.I, isReviving && typeof shellLaunchConfig.initialText === 'string' ? shellLaunchConfig.initialText : undefined, rawReviveBuffer, shellLaunchConfig.icon, shellLaunchConfig.color, shellLaunchConfig.name, shellLaunchConfig.fixedDimensions);
            process.onProcessExit(event => {
                persistentProcess.dispose();
                this.a.delete(id);
                this.C.fire({ id, event });
            });
            persistentProcess.onProcessData(event => this.w.fire({ id, event }));
            persistentProcess.onProcessReplay(event => this.y.fire({ id, event }));
            persistentProcess.onProcessReady(event => this.z.fire({ id, event }));
            persistentProcess.onProcessOrphanQuestion(() => this.D.fire({ id }));
            persistentProcess.onDidChangeProperty(property => this.G.fire({ id, property }));
            persistentProcess.onPersistentProcessReady(() => {
                for (const e of this.j.entries()) {
                    persistentProcess.installAutoReply(e[0], e[1]);
                }
            });
            this.a.set(id, persistentProcess);
            return id;
        }
        async attachToProcess(id) {
            try {
                await this.U(id).attach();
                this.I.info(`Persistent process reconnection "${id}"`);
            }
            catch (e) {
                this.I.warn(`Persistent process reconnection "${id}" failed`, e.message);
                throw e;
            }
        }
        async updateTitle(id, title, titleSource) {
            this.U(id).setTitle(title, titleSource);
        }
        async updateIcon(id, userInitiated, icon, color) {
            this.U(id).setIcon(userInitiated, icon, color);
        }
        async clearBuffer(id) {
            this.U(id).clearBuffer();
        }
        async refreshProperty(id, type) {
            return this.U(id).refreshProperty(type);
        }
        async updateProperty(id, type, value) {
            return this.U(id).updateProperty(type, value);
        }
        async detachFromProcess(id, forcePersist) {
            return this.U(id).detach(forcePersist);
        }
        async reduceConnectionGraceTime() {
            for (const pty of this.a.values()) {
                pty.reduceGraceTime();
            }
        }
        async listProcesses() {
            const persistentProcesses = Array.from(this.a.entries()).filter(([_, pty]) => pty.shouldPersistTerminal);
            this.I.info(`Listing ${persistentProcesses.length} persistent terminals, ${this.a.size} total terminals`);
            const promises = persistentProcesses.map(async ([id, terminalProcessData]) => this.S(id, terminalProcessData));
            const allTerminals = await Promise.all(promises);
            return allTerminals.filter(entry => entry.isOrphan);
        }
        async getPerformanceMarks() {
            return performance.getMarks();
        }
        async start(id) {
            const pty = this.a.get(id);
            return pty ? pty.start() : { message: `Could not find pty with id "${id}"` };
        }
        async shutdown(id, immediate) {
            // Don't throw if the pty is already shutdown
            return this.a.get(id)?.shutdown(immediate);
        }
        async input(id, data) {
            return this.U(id).input(data);
        }
        async processBinary(id, data) {
            return this.U(id).writeBinary(data);
        }
        async resize(id, cols, rows) {
            return this.U(id).resize(cols, rows);
        }
        async getInitialCwd(id) {
            return this.U(id).getInitialCwd();
        }
        async getCwd(id) {
            return this.U(id).getCwd();
        }
        async acknowledgeDataEvent(id, charCount) {
            return this.U(id).acknowledgeDataEvent(charCount);
        }
        async setUnicodeVersion(id, version) {
            return this.U(id).setUnicodeVersion(version);
        }
        async getLatency() {
            return [];
        }
        async orphanQuestionReply(id) {
            return this.U(id).orphanQuestionReply();
        }
        async installAutoReply(match, reply) {
            this.j.set(match, reply);
            // If the auto reply exists on any existing terminals it will be overridden
            for (const p of this.a.values()) {
                p.installAutoReply(match, reply);
            }
        }
        async uninstallAllAutoReplies() {
            for (const match of this.j.keys()) {
                for (const p of this.a.values()) {
                    p.uninstallAutoReply(match);
                }
            }
        }
        async uninstallAutoReply(match) {
            for (const p of this.a.values()) {
                p.uninstallAutoReply(match);
            }
        }
        async getDefaultSystemShell(osOverride = platform_1.OS) {
            return (0, shell_1.$wl)(osOverride, process.env);
        }
        async getEnvironment() {
            return { ...process.env };
        }
        async getWslPath(original, direction) {
            if (direction === 'win-to-unix') {
                if (!platform_1.$i) {
                    return original;
                }
                if ((0, terminalEnvironment_2.$hr)() < 17063) {
                    return original.replace(/\\/g, '/');
                }
                const wslExecutable = this.O();
                if (!wslExecutable) {
                    return original;
                }
                return new Promise(c => {
                    const proc = (0, child_process_1.execFile)(wslExecutable, ['-e', 'wslpath', original], {}, (error, stdout, stderr) => {
                        c(error ? original : (0, terminalEnvironment_1.$PM)(stdout.trim()));
                    });
                    proc.stdin.end();
                });
            }
            if (direction === 'unix-to-win') {
                // The backend is Windows, for example a local Windows workspace with a wsl session in
                // the terminal.
                if (platform_1.$i) {
                    if ((0, terminalEnvironment_2.$hr)() < 17063) {
                        return original;
                    }
                    const wslExecutable = this.O();
                    if (!wslExecutable) {
                        return original;
                    }
                    return new Promise(c => {
                        const proc = (0, child_process_1.execFile)(wslExecutable, ['-e', 'wslpath', '-w', original], {}, (error, stdout, stderr) => {
                            c(error ? original : stdout.trim());
                        });
                        proc.stdin.end();
                    });
                }
            }
            // Fallback just in case
            return original;
        }
        O() {
            const useWSLexe = (0, terminalEnvironment_2.$hr)() >= 16299;
            const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
            const systemRoot = process.env['SystemRoot'];
            if (systemRoot) {
                return (0, path_1.join)(systemRoot, is32ProcessOn64Windows ? 'Sysnative' : 'System32', useWSLexe ? 'wsl.exe' : 'bash.exe');
            }
            return undefined;
        }
        async getRevivedPtyNewId(workspaceId, id) {
            try {
                return this.g.get(this.R(workspaceId, id))?.newId;
            }
            catch (e) {
                this.I.warn(`Couldn't find terminal ID ${workspaceId}-${id}`, e.message);
            }
            return undefined;
        }
        async setTerminalLayoutInfo(args) {
            this.b.set(args.workspaceId, args);
        }
        async getTerminalLayoutInfo(args) {
            performance.mark('code/willGetTerminalLayoutInfo');
            const layout = this.b.get(args.workspaceId);
            if (layout) {
                const doneSet = new Set();
                const expandedTabs = await Promise.all(layout.tabs.map(async (tab) => this.P(args.workspaceId, tab, doneSet)));
                const tabs = expandedTabs.filter(t => t.terminals.length > 0);
                performance.mark('code/didGetTerminalLayoutInfo');
                return { tabs };
            }
            performance.mark('code/didGetTerminalLayoutInfo');
            return undefined;
        }
        async P(workspaceId, tab, doneSet) {
            const expandedTerminals = (await Promise.all(tab.terminals.map(t => this.Q(workspaceId, t, doneSet))));
            const filtered = expandedTerminals.filter(term => term.terminal !== null);
            return {
                isActive: tab.isActive,
                activePersistentProcessId: tab.activePersistentProcessId,
                terminals: filtered
            };
        }
        async Q(workspaceId, t, doneSet) {
            try {
                const oldId = this.R(workspaceId, t.terminal);
                const revivedPtyId = this.g.get(oldId)?.newId;
                this.I.info(`Expanding terminal instance, old id ${oldId} -> new id ${revivedPtyId}`);
                this.g.delete(oldId);
                const persistentProcessId = revivedPtyId ?? t.terminal;
                if (doneSet.has(persistentProcessId)) {
                    throw new Error(`Terminal ${persistentProcessId} has already been expanded`);
                }
                doneSet.add(persistentProcessId);
                const persistentProcess = this.U(persistentProcessId);
                const processDetails = persistentProcess && await this.S(t.terminal, persistentProcess, revivedPtyId !== undefined);
                return {
                    terminal: { ...processDetails, id: persistentProcessId },
                    relativeSize: t.relativeSize
                };
            }
            catch (e) {
                this.I.warn(`Couldn't get layout info, a terminal was probably disconnected`, e.message);
                this.I.debug('Reattach to wrong terminal debug info - layout info by id', t);
                this.I.debug('Reattach to wrong terminal debug info - _revivePtyIdMap', Array.from(this.g.values()));
                this.I.debug('Reattach to wrong terminal debug info - _ptys ids', Array.from(this.a.keys()));
                // this will be filtered out and not reconnected
                return {
                    terminal: null,
                    relativeSize: t.relativeSize
                };
            }
        }
        R(workspaceId, ptyId) {
            return `${workspaceId}-${ptyId}`;
        }
        async S(id, persistentProcess, wasRevived = false) {
            performance.mark(`code/willBuildProcessDetails/${id}`);
            // If the process was just revived, don't do the orphan check as it will
            // take some time
            const [cwd, isOrphan] = await Promise.all([persistentProcess.getCwd(), wasRevived ? true : persistentProcess.isOrphaned()]);
            const result = {
                id,
                title: persistentProcess.title,
                titleSource: persistentProcess.titleSource,
                pid: persistentProcess.pid,
                workspaceId: persistentProcess.workspaceId,
                workspaceName: persistentProcess.workspaceName,
                cwd,
                isOrphan,
                icon: persistentProcess.icon,
                color: persistentProcess.color,
                fixedDimensions: persistentProcess.fixedDimensions,
                environmentVariableCollections: persistentProcess.processLaunchOptions.options.environmentVariableCollections,
                reconnectionProperties: persistentProcess.shellLaunchConfig.reconnectionProperties,
                waitOnExit: persistentProcess.shellLaunchConfig.waitOnExit,
                hideFromUser: persistentProcess.shellLaunchConfig.hideFromUser,
                isFeatureTerminal: persistentProcess.shellLaunchConfig.isFeatureTerminal,
                type: persistentProcess.shellLaunchConfig.type,
                hasChildProcesses: persistentProcess.hasChildProcesses,
                shellIntegrationNonce: persistentProcess.processLaunchOptions.options.shellIntegration.nonce
            };
            performance.mark(`code/didBuildProcessDetails/${id}`);
            return result;
        }
        U(id) {
            const pty = this.a.get(id);
            if (!pty) {
                throw new errors_1.$_(`Could not find pty on pty host`);
            }
            return pty;
        }
    }
    exports.$T$b = $T$b;
    __decorate([
        decorators_1.$6g
    ], $T$b.prototype, "traceRpcArgs", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "refreshIgnoreProcessNames", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "requestDetachInstance", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "acceptDetachInstanceReply", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "freePortKillProcess", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "serializeTerminalState", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "reviveTerminalProcesses", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "shutdownAll", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "createProcess", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "attachToProcess", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "updateTitle", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "updateIcon", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "clearBuffer", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "refreshProperty", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "updateProperty", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "detachFromProcess", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "reduceConnectionGraceTime", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "listProcesses", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "getPerformanceMarks", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "start", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "shutdown", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "input", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "processBinary", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "resize", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "getInitialCwd", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "getCwd", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "acknowledgeDataEvent", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "setUnicodeVersion", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "getLatency", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "orphanQuestionReply", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "installAutoReply", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "uninstallAllAutoReplies", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "uninstallAutoReply", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "getDefaultSystemShell", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "getEnvironment", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "getWslPath", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "getRevivedPtyNewId", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "setTerminalLayoutInfo", null);
    __decorate([
        $S$b
    ], $T$b.prototype, "getTerminalLayoutInfo", null);
    var InteractionState;
    (function (InteractionState) {
        /** The terminal has not been interacted with. */
        InteractionState["None"] = "None";
        /** The terminal has only been interacted with by the replay mechanism. */
        InteractionState["ReplayOnly"] = "ReplayOnly";
        /** The terminal has been directly interacted with this session. */
        InteractionState["Session"] = "Session";
    })(InteractionState || (InteractionState = {}));
    class PersistentTerminalProcess extends lifecycle_1.$kc {
        get pid() { return this.L; }
        get shellLaunchConfig() { return this.W.shellLaunchConfig; }
        get hasWrittenData() { return this.j.value !== "None" /* InteractionState.None */; }
        get title() { return this.N || this.W.currentTitle; }
        get titleSource() { return this.O; }
        get icon() { return this.Y; }
        get color() { return this.Z; }
        get fixedDimensions() { return this.R; }
        get hasChildProcesses() { return this.W.hasChildProcesses; }
        setTitle(title, titleSource) {
            if (titleSource === terminal_1.TitleEventSource.Api) {
                this.j.setValue("Session" /* InteractionState.Session */, 'setTitle');
                this.P.freeRawReviveBuffer();
            }
            this.N = title;
            this.O = titleSource;
        }
        setIcon(userInitiated, icon, color) {
            if (!this.Y || 'id' in icon && 'id' in this.Y && icon.id !== this.Y.id ||
                !this.color || color !== this.Z) {
                this.P.freeRawReviveBuffer();
                if (userInitiated) {
                    this.j.setValue("Session" /* InteractionState.Session */, 'setIcon');
                }
            }
            this.Y = icon;
            this.Z = color;
        }
        S(fixedDimensions) {
            this.R = fixedDimensions;
        }
        constructor(U, W, workspaceId, workspaceName, shouldPersistTerminal, cols, rows, processLaunchOptions, unicodeVersion, reconnectConstants, X, reviveBuffer, rawReviveBuffer, Y, Z, name, fixedDimensions) {
            super();
            this.U = U;
            this.W = W;
            this.workspaceId = workspaceId;
            this.workspaceName = workspaceName;
            this.shouldPersistTerminal = shouldPersistTerminal;
            this.processLaunchOptions = processLaunchOptions;
            this.unicodeVersion = unicodeVersion;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.b = new Map();
            this.f = new Map();
            this.g = false;
            this.w = new async_1.$Ng();
            this.C = this.B(new event_1.$fd());
            this.onProcessReplay = this.C.event;
            this.D = this.B(new event_1.$fd());
            this.onProcessReady = this.D.event;
            this.F = this.B(new event_1.$fd());
            /** Fired when the persistent process has a ready process and has finished its replay. */
            this.onPersistentProcessReady = this.F.event;
            this.G = this.B(new event_1.$fd());
            this.onProcessData = this.G.event;
            this.H = this.B(new event_1.$fd());
            this.onProcessOrphanQuestion = this.H.event;
            this.I = this.B(new event_1.$fd());
            this.onDidChangeProperty = this.I.event;
            this.J = false;
            this.L = -1;
            this.M = '';
            this.O = terminal_1.TitleEventSource.Process;
            this.j = new MutationLogger(`Persistent process "${this.U}" interaction state`, "None" /* InteractionState.None */, this.X);
            this.Q = reviveBuffer !== undefined;
            this.P = new XtermSerializer(cols, rows, reconnectConstants.scrollback, unicodeVersion, reviveBuffer, processLaunchOptions.options.shellIntegration.nonce, shouldPersistTerminal ? rawReviveBuffer : undefined, this.X);
            if (name) {
                this.setTitle(name, terminal_1.TitleEventSource.Api);
            }
            this.R = fixedDimensions;
            this.n = null;
            this.u = 0;
            this.y = this.B(new async_1.$Tg(() => {
                this.X.info(`Persistent process "${this.U}": The reconnection grace time of ${printTime(reconnectConstants.graceTime)} has expired, shutting down pid "${this.L}"`);
                this.shutdown(true);
            }, reconnectConstants.graceTime));
            this.z = this.B(new async_1.$Tg(() => {
                this.X.info(`Persistent process "${this.U}": The short reconnection grace time of ${printTime(reconnectConstants.shortGraceTime)} has expired, shutting down pid ${this.L}`);
                this.shutdown(true);
            }, reconnectConstants.shortGraceTime));
            this.B(this.W.onProcessExit(() => this.a.stopBuffering(this.U)));
            this.B(this.W.onProcessReady(e => {
                this.L = e.pid;
                this.M = e.cwd;
                this.D.fire(e);
            }));
            this.B(this.W.onDidChangeProperty(e => {
                this.I.fire(e);
            }));
            // Data buffering to reduce the amount of messages going to the renderer
            this.a = new terminalDataBuffering_1.$Skb((_, data) => this.G.fire(data));
            this.B(this.a.startBuffering(this.U, this.W.onProcessData));
            // Data recording for reconnect
            this.B(this.onProcessData(e => this.P.handleData(e)));
            // Clean up other disposables
            this.B((0, lifecycle_1.$ic)(() => {
                for (const e of this.b.values()) {
                    e.dispose();
                }
                this.b.clear();
            }));
        }
        async attach() {
            if (!this.y.isScheduled() && !this.z.isScheduled()) {
                this.X.warn(`Persistent process "${this.U}": Process had no disconnect runners but was an orphan`);
            }
            this.y.cancel();
            this.z.cancel();
        }
        async detach(forcePersist) {
            // Keep the process around if it was indicated to persist and it has had some iteraction or
            // was replayed
            if (this.shouldPersistTerminal && (this.j.value !== "None" /* InteractionState.None */ || forcePersist)) {
                this.y.schedule();
            }
            else {
                this.shutdown(true);
            }
        }
        serializeNormalBuffer() {
            return this.P.generateReplayEvent(true, this.j.value !== "Session" /* InteractionState.Session */);
        }
        async refreshProperty(type) {
            return this.W.refreshProperty(type);
        }
        async updateProperty(type, value) {
            if (type === "fixedDimensions" /* ProcessPropertyType.FixedDimensions */) {
                return this.S(value);
            }
        }
        async start() {
            if (!this.g) {
                const result = await this.W.start();
                if (result && 'message' in result) {
                    // it's a terminal launch error
                    return result;
                }
                this.g = true;
                // If the process was revived, trigger a replay on first start. An alternative approach
                // could be to start it on the pty host before attaching but this fails on Windows as
                // conpty's inherit cursor option which is required, ends up sending DSR CPR which
                // causes conhost to hang when no response is received from the terminal (which wouldn't
                // be attached yet). https://github.com/microsoft/terminal/issues/11213
                if (this.Q) {
                    this.triggerReplay();
                }
                else {
                    this.F.fire();
                }
                return result;
            }
            this.D.fire({ pid: this.L, cwd: this.M, windowsPty: this.W.getWindowsPty() });
            this.I.fire({ type: "title" /* ProcessPropertyType.Title */, value: this.W.currentTitle });
            this.I.fire({ type: "shellType" /* ProcessPropertyType.ShellType */, value: this.W.shellType });
            this.triggerReplay();
            return undefined;
        }
        shutdown(immediate) {
            return this.W.shutdown(immediate);
        }
        input(data) {
            this.j.setValue("Session" /* InteractionState.Session */, 'input');
            this.P.freeRawReviveBuffer();
            if (this.J) {
                return;
            }
            for (const listener of this.b.values()) {
                listener.handleInput();
            }
            return this.W.input(data);
        }
        writeBinary(data) {
            return this.W.processBinary(data);
        }
        resize(cols, rows) {
            if (this.J) {
                return;
            }
            this.P.handleResize(cols, rows);
            // Buffered events should flush when a resize occurs
            this.a.flushBuffer(this.U);
            for (const listener of this.b.values()) {
                listener.handleResize();
            }
            return this.W.resize(cols, rows);
        }
        async clearBuffer() {
            this.P.clearBuffer();
            this.W.clearBuffer();
        }
        setUnicodeVersion(version) {
            this.unicodeVersion = version;
            this.P.setUnicodeVersion?.(version);
            // TODO: Pass in unicode version in ctor
        }
        acknowledgeDataEvent(charCount) {
            if (this.J) {
                return;
            }
            return this.W.acknowledgeDataEvent(charCount);
        }
        getInitialCwd() {
            return this.W.getInitialCwd();
        }
        getCwd() {
            return this.W.getCwd();
        }
        async triggerReplay() {
            if (this.j.value === "None" /* InteractionState.None */) {
                this.j.setValue("ReplayOnly" /* InteractionState.ReplayOnly */, 'triggerReplay');
            }
            const ev = await this.P.generateReplayEvent();
            let dataLength = 0;
            for (const e of ev.events) {
                dataLength += e.data.length;
            }
            this.X.info(`Persistent process "${this.U}": Replaying ${dataLength} chars and ${ev.events.length} size events`);
            this.C.fire(ev);
            this.W.clearUnacknowledgedChars();
            this.F.fire();
        }
        installAutoReply(match, reply) {
            this.b.get(match)?.dispose();
            this.b.set(match, new terminalAutoResponder_1.$M$b(this.W, match, reply, this.X));
        }
        uninstallAutoReply(match) {
            const autoReply = this.b.get(match);
            autoReply?.dispose();
            this.b.delete(match);
        }
        sendCommandResult(reqId, isError, serializedPayload) {
            const data = this.f.get(reqId);
            if (!data) {
                return;
            }
            this.f.delete(reqId);
        }
        orphanQuestionReply() {
            this.u = Date.now();
            if (this.n) {
                const barrier = this.n;
                this.n = null;
                barrier.open();
            }
        }
        reduceGraceTime() {
            if (this.z.isScheduled()) {
                // we are disconnected and already running the short reconnection timer
                return;
            }
            if (this.y.isScheduled()) {
                // we are disconnected and running the long reconnection timer
                this.z.schedule();
            }
        }
        async isOrphaned() {
            return await this.w.queue(async () => this.$());
        }
        async $() {
            // The process is already known to be orphaned
            if (this.y.isScheduled() || this.z.isScheduled()) {
                return true;
            }
            // Ask whether the renderer(s) whether the process is orphaned and await the reply
            if (!this.n) {
                // the barrier opens after 4 seconds with or without a reply
                this.n = new async_1.$Gg(4000);
                this.u = 0;
                this.H.fire();
            }
            await this.n.wait();
            return (Date.now() - this.u > 500);
        }
    }
    class MutationLogger {
        get value() { return this.b; }
        setValue(value, reason) {
            if (this.b !== value) {
                this.b = value;
                this.f(reason);
            }
        }
        constructor(a, b, d) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.f('initialized');
        }
        f(reason) {
            this.d.debug(`MutationLogger "${this.a}" set to "${this.b}", reason: ${reason}`);
        }
    }
    class XtermSerializer {
        constructor(cols, rows, scrollback, unicodeVersion, reviveBufferWithRestoreMessage, shellIntegrationNonce, f, logService) {
            this.f = f;
            this.a = new xterm_headless_1.Terminal({
                cols,
                rows,
                scrollback,
                allowProposedApi: true
            });
            if (reviveBufferWithRestoreMessage) {
                this.a.writeln(reviveBufferWithRestoreMessage);
            }
            this.setUnicodeVersion(unicodeVersion);
            this.b = new shellIntegrationAddon_1.$jib(shellIntegrationNonce, true, undefined, logService);
            this.a.loadAddon(this.b);
        }
        freeRawReviveBuffer() {
            // Free the memory of the terminal if it will need to be re-serialized
            this.f = undefined;
        }
        handleData(data) {
            this.a.write(data);
        }
        handleResize(cols, rows) {
            this.a.resize(cols, rows);
        }
        clearBuffer() {
            this.a.clear();
        }
        async generateReplayEvent(normalBufferOnly, restoreToLastReviveBuffer) {
            const serialize = new (await this._getSerializeConstructor());
            this.a.loadAddon(serialize);
            const options = {
                scrollback: this.a.options.scrollback
            };
            if (normalBufferOnly) {
                options.excludeAltBuffer = true;
                options.excludeModes = true;
            }
            let serialized;
            if (restoreToLastReviveBuffer && this.f) {
                serialized = this.f;
            }
            else {
                serialized = serialize.serialize(options);
            }
            return {
                events: [
                    {
                        cols: this.a.cols,
                        rows: this.a.rows,
                        data: serialized
                    }
                ],
                commands: this.b.serialize()
            };
        }
        async setUnicodeVersion(version) {
            if (this.a.unicode.activeVersion === version) {
                return;
            }
            if (version === '11') {
                this.d = new (await this._getUnicode11Constructor());
                this.a.loadAddon(this.d);
            }
            else {
                this.d?.dispose();
                this.d = undefined;
            }
            this.a.unicode.activeVersion = version;
        }
        async _getUnicode11Constructor() {
            if (!Unicode11Addon) {
                Unicode11Addon = (await new Promise((resolve_1, reject_1) => { require(['xterm-addon-unicode11'], resolve_1, reject_1); })).Unicode11Addon;
            }
            return Unicode11Addon;
        }
        async _getSerializeConstructor() {
            if (!SerializeAddon) {
                SerializeAddon = (await new Promise((resolve_2, reject_2) => { require(['xterm-addon-serialize'], resolve_2, reject_2); })).SerializeAddon;
            }
            return SerializeAddon;
        }
    }
    function printTime(ms) {
        let h = 0;
        let m = 0;
        let s = 0;
        if (ms >= 1000) {
            s = Math.floor(ms / 1000);
            ms -= s * 1000;
        }
        if (s >= 60) {
            m = Math.floor(s / 60);
            s -= m * 60;
        }
        if (m >= 60) {
            h = Math.floor(m / 60);
            m -= h * 60;
        }
        const _h = h ? `${h}h` : ``;
        const _m = m ? `${m}m` : ``;
        const _s = s ? `${s}s` : ``;
        const _ms = ms ? `${ms}ms` : ``;
        return `${_h}${_m}${_s}${_ms}`;
    }
});
//# sourceMappingURL=ptyService.js.map