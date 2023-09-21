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
define(["require", "exports", "child_process", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/node/shell", "vs/platform/log/common/log", "vs/platform/terminal/common/requestStore", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalDataBuffering", "vs/platform/terminal/common/terminalEnvironment", "xterm-headless", "vs/platform/terminal/node/terminalEnvironment", "vs/platform/terminal/node/terminalProcess", "vs/nls", "vs/platform/terminal/node/childProcessMonitor", "vs/platform/terminal/common/terminalAutoResponder", "vs/base/common/errors", "vs/platform/terminal/common/xterm/shellIntegrationAddon", "vs/platform/terminal/common/terminalStrings", "path", "vs/base/common/decorators", "vs/base/common/performance"], function (require, exports, child_process_1, async_1, event_1, lifecycle_1, platform_1, shell_1, log_1, requestStore_1, terminal_1, terminalDataBuffering_1, terminalEnvironment_1, xterm_headless_1, terminalEnvironment_2, terminalProcess_1, nls_1, childProcessMonitor_1, terminalAutoResponder_1, errors_1, shellIntegrationAddon_1, terminalStrings_1, path_1, decorators_1, performance) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PtyService = exports.traceRpc = void 0;
    function traceRpc(_target, key, descriptor) {
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
                await (0, async_1.timeout)(this.traceRpcArgs.simulatedLatency);
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
    exports.traceRpc = traceRpc;
    let SerializeAddon;
    let Unicode11Addon;
    class PtyService extends lifecycle_1.Disposable {
        _traceEvent(name, event) {
            event(e => {
                if (this._logService.getLevel() === log_1.LogLevel.Trace) {
                    this._logService.trace(`[RPC Event] PtyService#${name}.fire(${JSON.stringify(e)})`);
                }
            });
            return event;
        }
        get traceRpcArgs() {
            return {
                logService: this._logService,
                simulatedLatency: this._simulatedLatency
            };
        }
        constructor(_logService, _productService, _reconnectConstants, _simulatedLatency) {
            super();
            this._logService = _logService;
            this._productService = _productService;
            this._reconnectConstants = _reconnectConstants;
            this._simulatedLatency = _simulatedLatency;
            this._ptys = new Map();
            this._workspaceLayoutInfos = new Map();
            this._revivedPtyIdMap = new Map();
            this._autoReplies = new Map();
            this._lastPtyId = 0;
            this._onHeartbeat = this._register(new event_1.Emitter());
            this.onHeartbeat = this._traceEvent('_onHeartbeat', this._onHeartbeat.event);
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._traceEvent('_onProcessData', this._onProcessData.event);
            this._onProcessReplay = this._register(new event_1.Emitter());
            this.onProcessReplay = this._traceEvent('_onProcessReplay', this._onProcessReplay.event);
            this._onProcessReady = this._register(new event_1.Emitter());
            this.onProcessReady = this._traceEvent('_onProcessReady', this._onProcessReady.event);
            this._onProcessExit = this._register(new event_1.Emitter());
            this.onProcessExit = this._traceEvent('_onProcessExit', this._onProcessExit.event);
            this._onProcessOrphanQuestion = this._register(new event_1.Emitter());
            this.onProcessOrphanQuestion = this._traceEvent('_onProcessOrphanQuestion', this._onProcessOrphanQuestion.event);
            this._onDidRequestDetach = this._register(new event_1.Emitter());
            this.onDidRequestDetach = this._traceEvent('_onDidRequestDetach', this._onDidRequestDetach.event);
            this._onDidChangeProperty = this._register(new event_1.Emitter());
            this.onDidChangeProperty = this._traceEvent('_onDidChangeProperty', this._onDidChangeProperty.event);
            this._register((0, lifecycle_1.toDisposable)(() => {
                for (const pty of this._ptys.values()) {
                    pty.shutdown(true);
                }
                this._ptys.clear();
            }));
            this._detachInstanceRequestStore = this._register(new requestStore_1.RequestStore(undefined, this._logService));
            this._detachInstanceRequestStore.onCreateRequest(this._onDidRequestDetach.fire, this._onDidRequestDetach);
        }
        async refreshIgnoreProcessNames(names) {
            childProcessMonitor_1.ignoreProcessNames.length = 0;
            childProcessMonitor_1.ignoreProcessNames.push(...names);
        }
        async requestDetachInstance(workspaceId, instanceId) {
            return this._detachInstanceRequestStore.createRequest({ workspaceId, instanceId });
        }
        async acceptDetachInstanceReply(requestId, persistentProcessId) {
            let processDetails = undefined;
            const pty = this._ptys.get(persistentProcessId);
            if (pty) {
                processDetails = await this._buildProcessDetails(persistentProcessId, pty);
            }
            this._detachInstanceRequestStore.acceptReply(requestId, processDetails);
        }
        async freePortKillProcess(port) {
            const stdout = await new Promise((resolve, reject) => {
                (0, child_process_1.exec)(platform_1.isWindows ? `netstat -ano | findstr "${port}"` : `lsof -nP -iTCP -sTCP:LISTEN | grep ${port}`, {}, (err, stdout) => {
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
            for (const [persistentProcessId, persistentProcess] of this._ptys.entries()) {
                // Only serialize persistent processes that have had data written or performed a replay
                if (persistentProcess.hasWrittenData && ids.indexOf(persistentProcessId) !== -1) {
                    promises.push(async_1.Promises.withAsyncBody(async (r) => {
                        r({
                            id: persistentProcessId,
                            shellLaunchConfig: persistentProcess.shellLaunchConfig,
                            processDetails: await this._buildProcessDetails(persistentProcessId, persistentProcess),
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
                promises.push(this._reviveTerminalProcess(workspaceId, terminal));
            }
            await Promise.all(promises);
        }
        async _reviveTerminalProcess(workspaceId, terminal) {
            const restoreMessage = (0, nls_1.localize)('terminal-history-restored', "History restored");
            // TODO: We may at some point want to show date information in a hover via a custom sequence:
            //   new Date(terminal.timestamp).toLocaleDateString(dateTimeFormatLocale)
            //   new Date(terminal.timestamp).toLocaleTimeString(dateTimeFormatLocale)
            const newId = await this.createProcess({
                ...terminal.shellLaunchConfig,
                cwd: terminal.processDetails.cwd,
                color: terminal.processDetails.color,
                icon: terminal.processDetails.icon,
                name: terminal.processDetails.titleSource === terminal_1.TitleEventSource.Api ? terminal.processDetails.title : undefined,
                initialText: terminal.replayEvent.events[0].data + (0, terminalStrings_1.formatMessageForTerminal)(restoreMessage, { loudFormatting: true })
            }, terminal.processDetails.cwd, terminal.replayEvent.events[0].cols, terminal.replayEvent.events[0].rows, terminal.unicodeVersion, terminal.processLaunchConfig.env, terminal.processLaunchConfig.executableEnv, terminal.processLaunchConfig.options, true, terminal.processDetails.workspaceId, terminal.processDetails.workspaceName, true, terminal.replayEvent.events[0].data);
            // Don't start the process here as there's no terminal to answer CPR
            const oldId = this._getRevivingProcessId(workspaceId, terminal.id);
            this._revivedPtyIdMap.set(oldId, { newId, state: terminal });
            this._logService.info(`Revived process, old id ${oldId} -> new id ${newId}`);
        }
        async shutdownAll() {
            this.dispose();
        }
        async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName, isReviving, rawReviveBuffer) {
            if (shellLaunchConfig.attachPersistentProcess) {
                throw new Error('Attempt to create a process when attach object was provided');
            }
            const id = ++this._lastPtyId;
            const process = new terminalProcess_1.TerminalProcess(shellLaunchConfig, cwd, cols, rows, env, executableEnv, options, this._logService, this._productService);
            const processLaunchOptions = {
                env,
                executableEnv,
                options
            };
            const persistentProcess = new PersistentTerminalProcess(id, process, workspaceId, workspaceName, shouldPersist, cols, rows, processLaunchOptions, unicodeVersion, this._reconnectConstants, this._logService, isReviving && typeof shellLaunchConfig.initialText === 'string' ? shellLaunchConfig.initialText : undefined, rawReviveBuffer, shellLaunchConfig.icon, shellLaunchConfig.color, shellLaunchConfig.name, shellLaunchConfig.fixedDimensions);
            process.onProcessExit(event => {
                persistentProcess.dispose();
                this._ptys.delete(id);
                this._onProcessExit.fire({ id, event });
            });
            persistentProcess.onProcessData(event => this._onProcessData.fire({ id, event }));
            persistentProcess.onProcessReplay(event => this._onProcessReplay.fire({ id, event }));
            persistentProcess.onProcessReady(event => this._onProcessReady.fire({ id, event }));
            persistentProcess.onProcessOrphanQuestion(() => this._onProcessOrphanQuestion.fire({ id }));
            persistentProcess.onDidChangeProperty(property => this._onDidChangeProperty.fire({ id, property }));
            persistentProcess.onPersistentProcessReady(() => {
                for (const e of this._autoReplies.entries()) {
                    persistentProcess.installAutoReply(e[0], e[1]);
                }
            });
            this._ptys.set(id, persistentProcess);
            return id;
        }
        async attachToProcess(id) {
            try {
                await this._throwIfNoPty(id).attach();
                this._logService.info(`Persistent process reconnection "${id}"`);
            }
            catch (e) {
                this._logService.warn(`Persistent process reconnection "${id}" failed`, e.message);
                throw e;
            }
        }
        async updateTitle(id, title, titleSource) {
            this._throwIfNoPty(id).setTitle(title, titleSource);
        }
        async updateIcon(id, userInitiated, icon, color) {
            this._throwIfNoPty(id).setIcon(userInitiated, icon, color);
        }
        async clearBuffer(id) {
            this._throwIfNoPty(id).clearBuffer();
        }
        async refreshProperty(id, type) {
            return this._throwIfNoPty(id).refreshProperty(type);
        }
        async updateProperty(id, type, value) {
            return this._throwIfNoPty(id).updateProperty(type, value);
        }
        async detachFromProcess(id, forcePersist) {
            return this._throwIfNoPty(id).detach(forcePersist);
        }
        async reduceConnectionGraceTime() {
            for (const pty of this._ptys.values()) {
                pty.reduceGraceTime();
            }
        }
        async listProcesses() {
            const persistentProcesses = Array.from(this._ptys.entries()).filter(([_, pty]) => pty.shouldPersistTerminal);
            this._logService.info(`Listing ${persistentProcesses.length} persistent terminals, ${this._ptys.size} total terminals`);
            const promises = persistentProcesses.map(async ([id, terminalProcessData]) => this._buildProcessDetails(id, terminalProcessData));
            const allTerminals = await Promise.all(promises);
            return allTerminals.filter(entry => entry.isOrphan);
        }
        async getPerformanceMarks() {
            return performance.getMarks();
        }
        async start(id) {
            const pty = this._ptys.get(id);
            return pty ? pty.start() : { message: `Could not find pty with id "${id}"` };
        }
        async shutdown(id, immediate) {
            // Don't throw if the pty is already shutdown
            return this._ptys.get(id)?.shutdown(immediate);
        }
        async input(id, data) {
            return this._throwIfNoPty(id).input(data);
        }
        async processBinary(id, data) {
            return this._throwIfNoPty(id).writeBinary(data);
        }
        async resize(id, cols, rows) {
            return this._throwIfNoPty(id).resize(cols, rows);
        }
        async getInitialCwd(id) {
            return this._throwIfNoPty(id).getInitialCwd();
        }
        async getCwd(id) {
            return this._throwIfNoPty(id).getCwd();
        }
        async acknowledgeDataEvent(id, charCount) {
            return this._throwIfNoPty(id).acknowledgeDataEvent(charCount);
        }
        async setUnicodeVersion(id, version) {
            return this._throwIfNoPty(id).setUnicodeVersion(version);
        }
        async getLatency() {
            return [];
        }
        async orphanQuestionReply(id) {
            return this._throwIfNoPty(id).orphanQuestionReply();
        }
        async installAutoReply(match, reply) {
            this._autoReplies.set(match, reply);
            // If the auto reply exists on any existing terminals it will be overridden
            for (const p of this._ptys.values()) {
                p.installAutoReply(match, reply);
            }
        }
        async uninstallAllAutoReplies() {
            for (const match of this._autoReplies.keys()) {
                for (const p of this._ptys.values()) {
                    p.uninstallAutoReply(match);
                }
            }
        }
        async uninstallAutoReply(match) {
            for (const p of this._ptys.values()) {
                p.uninstallAutoReply(match);
            }
        }
        async getDefaultSystemShell(osOverride = platform_1.OS) {
            return (0, shell_1.getSystemShell)(osOverride, process.env);
        }
        async getEnvironment() {
            return { ...process.env };
        }
        async getWslPath(original, direction) {
            if (direction === 'win-to-unix') {
                if (!platform_1.isWindows) {
                    return original;
                }
                if ((0, terminalEnvironment_2.getWindowsBuildNumber)() < 17063) {
                    return original.replace(/\\/g, '/');
                }
                const wslExecutable = this._getWSLExecutablePath();
                if (!wslExecutable) {
                    return original;
                }
                return new Promise(c => {
                    const proc = (0, child_process_1.execFile)(wslExecutable, ['-e', 'wslpath', original], {}, (error, stdout, stderr) => {
                        c(error ? original : (0, terminalEnvironment_1.escapeNonWindowsPath)(stdout.trim()));
                    });
                    proc.stdin.end();
                });
            }
            if (direction === 'unix-to-win') {
                // The backend is Windows, for example a local Windows workspace with a wsl session in
                // the terminal.
                if (platform_1.isWindows) {
                    if ((0, terminalEnvironment_2.getWindowsBuildNumber)() < 17063) {
                        return original;
                    }
                    const wslExecutable = this._getWSLExecutablePath();
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
        _getWSLExecutablePath() {
            const useWSLexe = (0, terminalEnvironment_2.getWindowsBuildNumber)() >= 16299;
            const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
            const systemRoot = process.env['SystemRoot'];
            if (systemRoot) {
                return (0, path_1.join)(systemRoot, is32ProcessOn64Windows ? 'Sysnative' : 'System32', useWSLexe ? 'wsl.exe' : 'bash.exe');
            }
            return undefined;
        }
        async getRevivedPtyNewId(workspaceId, id) {
            try {
                return this._revivedPtyIdMap.get(this._getRevivingProcessId(workspaceId, id))?.newId;
            }
            catch (e) {
                this._logService.warn(`Couldn't find terminal ID ${workspaceId}-${id}`, e.message);
            }
            return undefined;
        }
        async setTerminalLayoutInfo(args) {
            this._workspaceLayoutInfos.set(args.workspaceId, args);
        }
        async getTerminalLayoutInfo(args) {
            performance.mark('code/willGetTerminalLayoutInfo');
            const layout = this._workspaceLayoutInfos.get(args.workspaceId);
            if (layout) {
                const doneSet = new Set();
                const expandedTabs = await Promise.all(layout.tabs.map(async (tab) => this._expandTerminalTab(args.workspaceId, tab, doneSet)));
                const tabs = expandedTabs.filter(t => t.terminals.length > 0);
                performance.mark('code/didGetTerminalLayoutInfo');
                return { tabs };
            }
            performance.mark('code/didGetTerminalLayoutInfo');
            return undefined;
        }
        async _expandTerminalTab(workspaceId, tab, doneSet) {
            const expandedTerminals = (await Promise.all(tab.terminals.map(t => this._expandTerminalInstance(workspaceId, t, doneSet))));
            const filtered = expandedTerminals.filter(term => term.terminal !== null);
            return {
                isActive: tab.isActive,
                activePersistentProcessId: tab.activePersistentProcessId,
                terminals: filtered
            };
        }
        async _expandTerminalInstance(workspaceId, t, doneSet) {
            try {
                const oldId = this._getRevivingProcessId(workspaceId, t.terminal);
                const revivedPtyId = this._revivedPtyIdMap.get(oldId)?.newId;
                this._logService.info(`Expanding terminal instance, old id ${oldId} -> new id ${revivedPtyId}`);
                this._revivedPtyIdMap.delete(oldId);
                const persistentProcessId = revivedPtyId ?? t.terminal;
                if (doneSet.has(persistentProcessId)) {
                    throw new Error(`Terminal ${persistentProcessId} has already been expanded`);
                }
                doneSet.add(persistentProcessId);
                const persistentProcess = this._throwIfNoPty(persistentProcessId);
                const processDetails = persistentProcess && await this._buildProcessDetails(t.terminal, persistentProcess, revivedPtyId !== undefined);
                return {
                    terminal: { ...processDetails, id: persistentProcessId },
                    relativeSize: t.relativeSize
                };
            }
            catch (e) {
                this._logService.warn(`Couldn't get layout info, a terminal was probably disconnected`, e.message);
                this._logService.debug('Reattach to wrong terminal debug info - layout info by id', t);
                this._logService.debug('Reattach to wrong terminal debug info - _revivePtyIdMap', Array.from(this._revivedPtyIdMap.values()));
                this._logService.debug('Reattach to wrong terminal debug info - _ptys ids', Array.from(this._ptys.keys()));
                // this will be filtered out and not reconnected
                return {
                    terminal: null,
                    relativeSize: t.relativeSize
                };
            }
        }
        _getRevivingProcessId(workspaceId, ptyId) {
            return `${workspaceId}-${ptyId}`;
        }
        async _buildProcessDetails(id, persistentProcess, wasRevived = false) {
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
        _throwIfNoPty(id) {
            const pty = this._ptys.get(id);
            if (!pty) {
                throw new errors_1.ErrorNoTelemetry(`Could not find pty on pty host`);
            }
            return pty;
        }
    }
    exports.PtyService = PtyService;
    __decorate([
        decorators_1.memoize
    ], PtyService.prototype, "traceRpcArgs", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "refreshIgnoreProcessNames", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "requestDetachInstance", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "acceptDetachInstanceReply", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "freePortKillProcess", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "serializeTerminalState", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "reviveTerminalProcesses", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "shutdownAll", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "createProcess", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "attachToProcess", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "updateTitle", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "updateIcon", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "clearBuffer", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "refreshProperty", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "updateProperty", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "detachFromProcess", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "reduceConnectionGraceTime", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "listProcesses", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "getPerformanceMarks", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "start", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "shutdown", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "input", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "processBinary", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "resize", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "getInitialCwd", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "getCwd", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "acknowledgeDataEvent", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "setUnicodeVersion", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "getLatency", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "orphanQuestionReply", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "installAutoReply", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "uninstallAllAutoReplies", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "uninstallAutoReply", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "getDefaultSystemShell", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "getEnvironment", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "getWslPath", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "getRevivedPtyNewId", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "setTerminalLayoutInfo", null);
    __decorate([
        traceRpc
    ], PtyService.prototype, "getTerminalLayoutInfo", null);
    var InteractionState;
    (function (InteractionState) {
        /** The terminal has not been interacted with. */
        InteractionState["None"] = "None";
        /** The terminal has only been interacted with by the replay mechanism. */
        InteractionState["ReplayOnly"] = "ReplayOnly";
        /** The terminal has been directly interacted with this session. */
        InteractionState["Session"] = "Session";
    })(InteractionState || (InteractionState = {}));
    class PersistentTerminalProcess extends lifecycle_1.Disposable {
        get pid() { return this._pid; }
        get shellLaunchConfig() { return this._terminalProcess.shellLaunchConfig; }
        get hasWrittenData() { return this._interactionState.value !== "None" /* InteractionState.None */; }
        get title() { return this._title || this._terminalProcess.currentTitle; }
        get titleSource() { return this._titleSource; }
        get icon() { return this._icon; }
        get color() { return this._color; }
        get fixedDimensions() { return this._fixedDimensions; }
        get hasChildProcesses() { return this._terminalProcess.hasChildProcesses; }
        setTitle(title, titleSource) {
            if (titleSource === terminal_1.TitleEventSource.Api) {
                this._interactionState.setValue("Session" /* InteractionState.Session */, 'setTitle');
                this._serializer.freeRawReviveBuffer();
            }
            this._title = title;
            this._titleSource = titleSource;
        }
        setIcon(userInitiated, icon, color) {
            if (!this._icon || 'id' in icon && 'id' in this._icon && icon.id !== this._icon.id ||
                !this.color || color !== this._color) {
                this._serializer.freeRawReviveBuffer();
                if (userInitiated) {
                    this._interactionState.setValue("Session" /* InteractionState.Session */, 'setIcon');
                }
            }
            this._icon = icon;
            this._color = color;
        }
        _setFixedDimensions(fixedDimensions) {
            this._fixedDimensions = fixedDimensions;
        }
        constructor(_persistentProcessId, _terminalProcess, workspaceId, workspaceName, shouldPersistTerminal, cols, rows, processLaunchOptions, unicodeVersion, reconnectConstants, _logService, reviveBuffer, rawReviveBuffer, _icon, _color, name, fixedDimensions) {
            super();
            this._persistentProcessId = _persistentProcessId;
            this._terminalProcess = _terminalProcess;
            this.workspaceId = workspaceId;
            this.workspaceName = workspaceName;
            this.shouldPersistTerminal = shouldPersistTerminal;
            this.processLaunchOptions = processLaunchOptions;
            this.unicodeVersion = unicodeVersion;
            this._logService = _logService;
            this._icon = _icon;
            this._color = _color;
            this._autoReplies = new Map();
            this._pendingCommands = new Map();
            this._isStarted = false;
            this._orphanRequestQueue = new async_1.Queue();
            this._onProcessReplay = this._register(new event_1.Emitter());
            this.onProcessReplay = this._onProcessReplay.event;
            this._onProcessReady = this._register(new event_1.Emitter());
            this.onProcessReady = this._onProcessReady.event;
            this._onPersistentProcessReady = this._register(new event_1.Emitter());
            /** Fired when the persistent process has a ready process and has finished its replay. */
            this.onPersistentProcessReady = this._onPersistentProcessReady.event;
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._onProcessData.event;
            this._onProcessOrphanQuestion = this._register(new event_1.Emitter());
            this.onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
            this._onDidChangeProperty = this._register(new event_1.Emitter());
            this.onDidChangeProperty = this._onDidChangeProperty.event;
            this._inReplay = false;
            this._pid = -1;
            this._cwd = '';
            this._titleSource = terminal_1.TitleEventSource.Process;
            this._interactionState = new MutationLogger(`Persistent process "${this._persistentProcessId}" interaction state`, "None" /* InteractionState.None */, this._logService);
            this._wasRevived = reviveBuffer !== undefined;
            this._serializer = new XtermSerializer(cols, rows, reconnectConstants.scrollback, unicodeVersion, reviveBuffer, processLaunchOptions.options.shellIntegration.nonce, shouldPersistTerminal ? rawReviveBuffer : undefined, this._logService);
            if (name) {
                this.setTitle(name, terminal_1.TitleEventSource.Api);
            }
            this._fixedDimensions = fixedDimensions;
            this._orphanQuestionBarrier = null;
            this._orphanQuestionReplyTime = 0;
            this._disconnectRunner1 = this._register(new async_1.ProcessTimeRunOnceScheduler(() => {
                this._logService.info(`Persistent process "${this._persistentProcessId}": The reconnection grace time of ${printTime(reconnectConstants.graceTime)} has expired, shutting down pid "${this._pid}"`);
                this.shutdown(true);
            }, reconnectConstants.graceTime));
            this._disconnectRunner2 = this._register(new async_1.ProcessTimeRunOnceScheduler(() => {
                this._logService.info(`Persistent process "${this._persistentProcessId}": The short reconnection grace time of ${printTime(reconnectConstants.shortGraceTime)} has expired, shutting down pid ${this._pid}`);
                this.shutdown(true);
            }, reconnectConstants.shortGraceTime));
            this._register(this._terminalProcess.onProcessExit(() => this._bufferer.stopBuffering(this._persistentProcessId)));
            this._register(this._terminalProcess.onProcessReady(e => {
                this._pid = e.pid;
                this._cwd = e.cwd;
                this._onProcessReady.fire(e);
            }));
            this._register(this._terminalProcess.onDidChangeProperty(e => {
                this._onDidChangeProperty.fire(e);
            }));
            // Data buffering to reduce the amount of messages going to the renderer
            this._bufferer = new terminalDataBuffering_1.TerminalDataBufferer((_, data) => this._onProcessData.fire(data));
            this._register(this._bufferer.startBuffering(this._persistentProcessId, this._terminalProcess.onProcessData));
            // Data recording for reconnect
            this._register(this.onProcessData(e => this._serializer.handleData(e)));
            // Clean up other disposables
            this._register((0, lifecycle_1.toDisposable)(() => {
                for (const e of this._autoReplies.values()) {
                    e.dispose();
                }
                this._autoReplies.clear();
            }));
        }
        async attach() {
            if (!this._disconnectRunner1.isScheduled() && !this._disconnectRunner2.isScheduled()) {
                this._logService.warn(`Persistent process "${this._persistentProcessId}": Process had no disconnect runners but was an orphan`);
            }
            this._disconnectRunner1.cancel();
            this._disconnectRunner2.cancel();
        }
        async detach(forcePersist) {
            // Keep the process around if it was indicated to persist and it has had some iteraction or
            // was replayed
            if (this.shouldPersistTerminal && (this._interactionState.value !== "None" /* InteractionState.None */ || forcePersist)) {
                this._disconnectRunner1.schedule();
            }
            else {
                this.shutdown(true);
            }
        }
        serializeNormalBuffer() {
            return this._serializer.generateReplayEvent(true, this._interactionState.value !== "Session" /* InteractionState.Session */);
        }
        async refreshProperty(type) {
            return this._terminalProcess.refreshProperty(type);
        }
        async updateProperty(type, value) {
            if (type === "fixedDimensions" /* ProcessPropertyType.FixedDimensions */) {
                return this._setFixedDimensions(value);
            }
        }
        async start() {
            if (!this._isStarted) {
                const result = await this._terminalProcess.start();
                if (result && 'message' in result) {
                    // it's a terminal launch error
                    return result;
                }
                this._isStarted = true;
                // If the process was revived, trigger a replay on first start. An alternative approach
                // could be to start it on the pty host before attaching but this fails on Windows as
                // conpty's inherit cursor option which is required, ends up sending DSR CPR which
                // causes conhost to hang when no response is received from the terminal (which wouldn't
                // be attached yet). https://github.com/microsoft/terminal/issues/11213
                if (this._wasRevived) {
                    this.triggerReplay();
                }
                else {
                    this._onPersistentProcessReady.fire();
                }
                return result;
            }
            this._onProcessReady.fire({ pid: this._pid, cwd: this._cwd, windowsPty: this._terminalProcess.getWindowsPty() });
            this._onDidChangeProperty.fire({ type: "title" /* ProcessPropertyType.Title */, value: this._terminalProcess.currentTitle });
            this._onDidChangeProperty.fire({ type: "shellType" /* ProcessPropertyType.ShellType */, value: this._terminalProcess.shellType });
            this.triggerReplay();
            return undefined;
        }
        shutdown(immediate) {
            return this._terminalProcess.shutdown(immediate);
        }
        input(data) {
            this._interactionState.setValue("Session" /* InteractionState.Session */, 'input');
            this._serializer.freeRawReviveBuffer();
            if (this._inReplay) {
                return;
            }
            for (const listener of this._autoReplies.values()) {
                listener.handleInput();
            }
            return this._terminalProcess.input(data);
        }
        writeBinary(data) {
            return this._terminalProcess.processBinary(data);
        }
        resize(cols, rows) {
            if (this._inReplay) {
                return;
            }
            this._serializer.handleResize(cols, rows);
            // Buffered events should flush when a resize occurs
            this._bufferer.flushBuffer(this._persistentProcessId);
            for (const listener of this._autoReplies.values()) {
                listener.handleResize();
            }
            return this._terminalProcess.resize(cols, rows);
        }
        async clearBuffer() {
            this._serializer.clearBuffer();
            this._terminalProcess.clearBuffer();
        }
        setUnicodeVersion(version) {
            this.unicodeVersion = version;
            this._serializer.setUnicodeVersion?.(version);
            // TODO: Pass in unicode version in ctor
        }
        acknowledgeDataEvent(charCount) {
            if (this._inReplay) {
                return;
            }
            return this._terminalProcess.acknowledgeDataEvent(charCount);
        }
        getInitialCwd() {
            return this._terminalProcess.getInitialCwd();
        }
        getCwd() {
            return this._terminalProcess.getCwd();
        }
        async triggerReplay() {
            if (this._interactionState.value === "None" /* InteractionState.None */) {
                this._interactionState.setValue("ReplayOnly" /* InteractionState.ReplayOnly */, 'triggerReplay');
            }
            const ev = await this._serializer.generateReplayEvent();
            let dataLength = 0;
            for (const e of ev.events) {
                dataLength += e.data.length;
            }
            this._logService.info(`Persistent process "${this._persistentProcessId}": Replaying ${dataLength} chars and ${ev.events.length} size events`);
            this._onProcessReplay.fire(ev);
            this._terminalProcess.clearUnacknowledgedChars();
            this._onPersistentProcessReady.fire();
        }
        installAutoReply(match, reply) {
            this._autoReplies.get(match)?.dispose();
            this._autoReplies.set(match, new terminalAutoResponder_1.TerminalAutoResponder(this._terminalProcess, match, reply, this._logService));
        }
        uninstallAutoReply(match) {
            const autoReply = this._autoReplies.get(match);
            autoReply?.dispose();
            this._autoReplies.delete(match);
        }
        sendCommandResult(reqId, isError, serializedPayload) {
            const data = this._pendingCommands.get(reqId);
            if (!data) {
                return;
            }
            this._pendingCommands.delete(reqId);
        }
        orphanQuestionReply() {
            this._orphanQuestionReplyTime = Date.now();
            if (this._orphanQuestionBarrier) {
                const barrier = this._orphanQuestionBarrier;
                this._orphanQuestionBarrier = null;
                barrier.open();
            }
        }
        reduceGraceTime() {
            if (this._disconnectRunner2.isScheduled()) {
                // we are disconnected and already running the short reconnection timer
                return;
            }
            if (this._disconnectRunner1.isScheduled()) {
                // we are disconnected and running the long reconnection timer
                this._disconnectRunner2.schedule();
            }
        }
        async isOrphaned() {
            return await this._orphanRequestQueue.queue(async () => this._isOrphaned());
        }
        async _isOrphaned() {
            // The process is already known to be orphaned
            if (this._disconnectRunner1.isScheduled() || this._disconnectRunner2.isScheduled()) {
                return true;
            }
            // Ask whether the renderer(s) whether the process is orphaned and await the reply
            if (!this._orphanQuestionBarrier) {
                // the barrier opens after 4 seconds with or without a reply
                this._orphanQuestionBarrier = new async_1.AutoOpenBarrier(4000);
                this._orphanQuestionReplyTime = 0;
                this._onProcessOrphanQuestion.fire();
            }
            await this._orphanQuestionBarrier.wait();
            return (Date.now() - this._orphanQuestionReplyTime > 500);
        }
    }
    class MutationLogger {
        get value() { return this._value; }
        setValue(value, reason) {
            if (this._value !== value) {
                this._value = value;
                this._log(reason);
            }
        }
        constructor(_name, _value, _logService) {
            this._name = _name;
            this._value = _value;
            this._logService = _logService;
            this._log('initialized');
        }
        _log(reason) {
            this._logService.debug(`MutationLogger "${this._name}" set to "${this._value}", reason: ${reason}`);
        }
    }
    class XtermSerializer {
        constructor(cols, rows, scrollback, unicodeVersion, reviveBufferWithRestoreMessage, shellIntegrationNonce, _rawReviveBuffer, logService) {
            this._rawReviveBuffer = _rawReviveBuffer;
            this._xterm = new xterm_headless_1.Terminal({
                cols,
                rows,
                scrollback,
                allowProposedApi: true
            });
            if (reviveBufferWithRestoreMessage) {
                this._xterm.writeln(reviveBufferWithRestoreMessage);
            }
            this.setUnicodeVersion(unicodeVersion);
            this._shellIntegrationAddon = new shellIntegrationAddon_1.ShellIntegrationAddon(shellIntegrationNonce, true, undefined, logService);
            this._xterm.loadAddon(this._shellIntegrationAddon);
        }
        freeRawReviveBuffer() {
            // Free the memory of the terminal if it will need to be re-serialized
            this._rawReviveBuffer = undefined;
        }
        handleData(data) {
            this._xterm.write(data);
        }
        handleResize(cols, rows) {
            this._xterm.resize(cols, rows);
        }
        clearBuffer() {
            this._xterm.clear();
        }
        async generateReplayEvent(normalBufferOnly, restoreToLastReviveBuffer) {
            const serialize = new (await this._getSerializeConstructor());
            this._xterm.loadAddon(serialize);
            const options = {
                scrollback: this._xterm.options.scrollback
            };
            if (normalBufferOnly) {
                options.excludeAltBuffer = true;
                options.excludeModes = true;
            }
            let serialized;
            if (restoreToLastReviveBuffer && this._rawReviveBuffer) {
                serialized = this._rawReviveBuffer;
            }
            else {
                serialized = serialize.serialize(options);
            }
            return {
                events: [
                    {
                        cols: this._xterm.cols,
                        rows: this._xterm.rows,
                        data: serialized
                    }
                ],
                commands: this._shellIntegrationAddon.serialize()
            };
        }
        async setUnicodeVersion(version) {
            if (this._xterm.unicode.activeVersion === version) {
                return;
            }
            if (version === '11') {
                this._unicodeAddon = new (await this._getUnicode11Constructor());
                this._xterm.loadAddon(this._unicodeAddon);
            }
            else {
                this._unicodeAddon?.dispose();
                this._unicodeAddon = undefined;
            }
            this._xterm.unicode.activeVersion = version;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHR5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL25vZGUvcHR5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7SUFnQ2hHLFNBQWdCLFFBQVEsQ0FBQyxPQUFZLEVBQUUsR0FBVyxFQUFFLFVBQWU7UUFDbEUsSUFBSSxPQUFPLFVBQVUsQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFO1lBQzNDLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDakM7UUFDRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUM7UUFDdEIsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUM1QixVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxXQUFXLEdBQUcsSUFBVztZQUNqRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxLQUFLLGNBQVEsQ0FBQyxLQUFLLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDMUg7WUFDRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBQSxlQUFPLEVBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2FBQ2xEO1lBQ0QsSUFBSSxNQUFXLENBQUM7WUFDaEIsSUFBSTtnQkFDSCxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFD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RTtZQUNaLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN2QixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNaO1FBQ0QsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ1osQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ1o7UUFDRCxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1QixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1QixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1QixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNoQyxPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDaEMsQ0FBQyJ9