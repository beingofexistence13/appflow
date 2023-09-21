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
define(["require", "exports", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/workbench/api/common/extHostRpcService", "vs/base/common/lifecycle", "./extHostTypes", "vs/nls!vs/workbench/api/common/extHostTerminalService", "vs/base/common/errors", "vs/platform/terminal/common/environmentVariableShared", "vs/base/common/cancellation", "vs/base/common/uuid", "vs/platform/terminal/common/terminalDataBuffering", "vs/base/common/themables", "vs/base/common/async", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostCommands"], function (require, exports, event_1, extHost_protocol_1, instantiation_1, uri_1, extHostRpcService_1, lifecycle_1, extHostTypes_1, nls_1, errors_1, environmentVariableShared_1, cancellation_1, uuid_1, terminalDataBuffering_1, themables_1, async_1, extHostTypeConverters_1, extHostCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Hbc = exports.$Gbc = exports.$Fbc = exports.$Ebc = void 0;
    exports.$Ebc = (0, instantiation_1.$Bh)('IExtHostTerminalService');
    class $Fbc {
        constructor(l, _id, m, n) {
            this.l = l;
            this._id = _id;
            this.m = m;
            this.n = n;
            this.a = false;
            this.j = { isInteractedWith: false };
            this.isOpen = false;
            this.m = Object.freeze(this.m);
            this.b = new Promise(c => this.f = c);
            const that = this;
            this.value = {
                get name() {
                    return that.n || '';
                },
                get processId() {
                    return that.b;
                },
                get creationOptions() {
                    return that.m;
                },
                get exitStatus() {
                    return that.h;
                },
                get state() {
                    return that.j;
                },
                get selection() {
                    return that.k;
                },
                sendText(text, addNewLine = true) {
                    that.q();
                    that.l.$sendText(that._id, text, addNewLine);
                },
                show(preserveFocus) {
                    that.q();
                    that.l.$show(that._id, preserveFocus);
                },
                hide() {
                    that.q();
                    that.l.$hide(that._id);
                },
                dispose() {
                    if (!that.a) {
                        that.a = true;
                        that.l.$dispose(that._id);
                    }
                },
                get dimensions() {
                    if (that.d === undefined || that.g === undefined) {
                        return undefined;
                    }
                    return {
                        columns: that.d,
                        rows: that.g
                    };
                }
            };
        }
        async create(options, internalOptions) {
            if (typeof this._id !== 'string') {
                throw new Error('Terminal has already been created');
            }
            await this.l.$createTerminal(this._id, {
                name: options.name,
                shellPath: options.shellPath ?? undefined,
                shellArgs: options.shellArgs ?? undefined,
                cwd: options.cwd ?? undefined,
                env: options.env ?? undefined,
                icon: asTerminalIcon(options.iconPath) ?? undefined,
                color: themables_1.ThemeColor.isThemeColor(options.color) ? options.color.id : undefined,
                initialText: options.message ?? undefined,
                strictEnv: options.strictEnv ?? undefined,
                hideFromUser: options.hideFromUser ?? undefined,
                isFeatureTerminal: internalOptions?.isFeatureTerminal ?? undefined,
                isExtensionOwnedTerminal: true,
                useShellEnvironment: internalOptions?.useShellEnvironment ?? undefined,
                location: internalOptions?.location || this.o(options.location, internalOptions?.resolvedExtHostIdentifier),
                isTransient: options.isTransient ?? undefined,
            });
        }
        async createExtensionTerminal(location, parentTerminal, iconPath, color) {
            if (typeof this._id !== 'string') {
                throw new Error('Terminal has already been created');
            }
            await this.l.$createTerminal(this._id, {
                name: this.n,
                isExtensionCustomPtyTerminal: true,
                icon: iconPath,
                color: themables_1.ThemeColor.isThemeColor(color) ? color.id : undefined,
                location: this.o(location, parentTerminal),
                isTransient: true
            });
            // At this point, the id has been set via `$acceptTerminalOpened`
            if (typeof this._id === 'string') {
                throw new Error('Terminal creation failed');
            }
            return this._id;
        }
        o(location, parentTerminal) {
            if (typeof location === 'object') {
                if ('parentTerminal' in location && location.parentTerminal && parentTerminal) {
                    return { parentTerminal };
                }
                if ('viewColumn' in location) {
                    return { viewColumn: extHostTypeConverters_1.ViewColumn.from(location.viewColumn), preserveFocus: location.preserveFocus };
                }
                return undefined;
            }
            return location;
        }
        q() {
            if (this.a) {
                throw new Error('Terminal has already been disposed');
            }
        }
        set name(name) {
            this.n = name;
        }
        setExitStatus(code, reason) {
            this.h = Object.freeze({ code, reason });
        }
        setDimensions(cols, rows) {
            if (cols === this.d && rows === this.g) {
                // Nothing changed
                return false;
            }
            if (cols === 0 || rows === 0) {
                return false;
            }
            this.d = cols;
            this.g = rows;
            return true;
        }
        setInteractedWith() {
            if (!this.j.isInteractedWith) {
                this.j = { isInteractedWith: true };
                return true;
            }
            return false;
        }
        setSelection(selection) {
            this.k = selection;
        }
        _setProcessId(processId) {
            // The event may fire 2 times when the panel is restored
            if (this.f) {
                this.f(processId);
                this.f = undefined;
            }
            else {
                // Recreate the promise if this is the nth processId set (e.g. reused task terminals)
                this.b.then(pid => {
                    if (pid !== processId) {
                        this.b = Promise.resolve(processId);
                    }
                });
            }
        }
    }
    exports.$Fbc = $Fbc;
    class ExtHostPseudoterminal {
        get onProcessReady() { return this.b.event; }
        constructor(g) {
            this.g = g;
            this.id = 0;
            this.shouldPersist = false;
            this.a = new event_1.$fd();
            this.onProcessData = this.a.event;
            this.b = new event_1.$fd();
            this.d = new event_1.$fd();
            this.onDidChangeProperty = this.d.event;
            this.f = new event_1.$fd();
            this.onProcessExit = this.f.event;
        }
        refreshProperty(property) {
            throw new Error(`refreshProperty is not suppported in extension owned terminals. property: ${property}`);
        }
        updateProperty(property, value) {
            throw new Error(`updateProperty is not suppported in extension owned terminals. property: ${property}, value: ${value}`);
        }
        async start() {
            return undefined;
        }
        shutdown() {
            this.g.close();
        }
        input(data) {
            this.g.handleInput?.(data);
        }
        resize(cols, rows) {
            this.g.setDimensions?.({ columns: cols, rows });
        }
        clearBuffer() {
            // no-op
        }
        async processBinary(data) {
            // No-op, processBinary is not supported in extension owned terminals.
        }
        acknowledgeDataEvent(charCount) {
            // No-op, flow control is not supported in extension owned terminals. If this is ever
            // implemented it will need new pause and resume VS Code APIs.
        }
        async setUnicodeVersion(version) {
            // No-op, xterm-headless isn't used for extension owned terminals.
        }
        getInitialCwd() {
            return Promise.resolve('');
        }
        getCwd() {
            return Promise.resolve('');
        }
        startSendingEvents(initialDimensions) {
            // Attach the listeners
            this.g.onDidWrite(e => this.a.fire(e));
            this.g.onDidClose?.((e = undefined) => {
                this.f.fire(e === void 0 ? undefined : e);
            });
            this.g.onDidOverrideDimensions?.(e => {
                if (e) {
                    this.d.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: { cols: e.columns, rows: e.rows } });
                }
            });
            this.g.onDidChangeName?.(title => {
                this.d.fire({ type: "title" /* ProcessPropertyType.Title */, value: title });
            });
            this.g.open(initialDimensions ? initialDimensions : undefined);
            if (initialDimensions) {
                this.g.setDimensions?.(initialDimensions);
            }
            this.b.fire({ pid: -1, cwd: '', windowsPty: undefined });
        }
    }
    let nextLinkId = 1;
    let $Gbc = class $Gbc extends lifecycle_1.$kc {
        get activeTerminal() { return this.b?.value; }
        get terminals() { return this.f.map(term => term.value); }
        constructor(supportsProcesses, Q, extHostRpc) {
            super();
            this.Q = Q;
            this.f = [];
            this.g = new Map();
            this.h = {};
            this.j = {};
            this.m = {};
            this.n = new Map();
            this.w = this.B(new lifecycle_1.$lc());
            this.z = new Set();
            this.C = new Map();
            this.D = new Map();
            this.F = new Map();
            this.G = new Map();
            this.H = new event_1.$fd();
            this.onDidCloseTerminal = this.H.event;
            this.I = new event_1.$fd();
            this.onDidOpenTerminal = this.I.event;
            this.J = new event_1.$fd();
            this.onDidChangeActiveTerminal = this.J.event;
            this.L = new event_1.$fd();
            this.onDidChangeTerminalDimensions = this.L.event;
            this.M = new event_1.$fd();
            this.onDidChangeTerminalState = this.M.event;
            this.N = new event_1.$fd();
            this.onDidChangeShell = this.N.event;
            this.O = new event_1.$fd({
                onWillAddFirstListener: () => this.a.$startSendingDataEvents(),
                onDidRemoveLastListener: () => this.a.$stopSendingDataEvents()
            });
            this.onDidWriteTerminalData = this.O.event;
            this.P = new event_1.$fd({
                onWillAddFirstListener: () => this.a.$startSendingCommandEvents(),
                onDidRemoveLastListener: () => this.a.$stopSendingCommandEvents()
            });
            this.onDidExecuteTerminalCommand = this.P.event;
            this.a = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadTerminalService);
            this.y = new terminalDataBuffering_1.$Skb(this.a.$sendProcessData);
            this.a.$registerProcessSupport(supportsProcesses);
            this.Q.registerArgumentProcessor({
                processArgument: arg => {
                    const deserialize = (arg) => {
                        const cast = arg;
                        return this.W(cast.instanceId)?.value;
                    };
                    switch (arg?.$mid) {
                        case 15 /* MarshalledId.TerminalContext */: return deserialize(arg);
                        default: {
                            // Do array transformation in place as this is a hot path
                            if (Array.isArray(arg)) {
                                for (let i = 0; i < arg.length; i++) {
                                    if (arg[i].$mid === 15 /* MarshalledId.TerminalContext */) {
                                        arg[i] = deserialize(arg[i]);
                                    }
                                    else {
                                        // Probably something else, so exit early
                                        break;
                                    }
                                }
                            }
                            return arg;
                        }
                    }
                }
            });
            this.B({
                dispose: () => {
                    for (const [_, terminalProcess] of this.g) {
                        terminalProcess.shutdown(true);
                    }
                }
            });
        }
        getDefaultShell(useAutomationShell) {
            const profile = useAutomationShell ? this.u : this.s;
            return profile?.path || '';
        }
        getDefaultShellArgs(useAutomationShell) {
            const profile = useAutomationShell ? this.u : this.s;
            return profile?.args || [];
        }
        createExtensionTerminal(options, internalOptions) {
            const terminal = new $Fbc(this.a, (0, uuid_1.$4f)(), options, options.name);
            const p = new ExtHostPseudoterminal(options.pty);
            terminal.createExtensionTerminal(options.location, this.R(options, internalOptions).resolvedExtHostIdentifier, asTerminalIcon(options.iconPath), asTerminalColor(options.color)).then(id => {
                const disposable = this.S(id, p);
                this.h[id] = disposable;
            });
            this.f.push(terminal);
            return terminal.value;
        }
        R(options, internalOptions) {
            internalOptions = internalOptions ? internalOptions : {};
            if (options.location && typeof options.location === 'object' && 'parentTerminal' in options.location) {
                const parentTerminal = options.location.parentTerminal;
                if (parentTerminal) {
                    const parentExtHostTerminal = this.f.find(t => t.value === parentTerminal);
                    if (parentExtHostTerminal) {
                        internalOptions.resolvedExtHostIdentifier = parentExtHostTerminal._id;
                    }
                }
            }
            else if (options.location && typeof options.location !== 'object') {
                internalOptions.location = options.location;
            }
            else if (internalOptions.location && typeof internalOptions.location === 'object' && 'splitActiveTerminal' in internalOptions.location) {
                internalOptions.location = { splitActiveTerminal: true };
            }
            return internalOptions;
        }
        attachPtyToTerminal(id, pty) {
            const terminal = this.W(id);
            if (!terminal) {
                throw new Error(`Cannot resolve terminal with id ${id} for virtual process`);
            }
            const p = new ExtHostPseudoterminal(pty);
            const disposable = this.S(id, p);
            this.h[id] = disposable;
        }
        async $acceptActiveTerminalChanged(id) {
            const original = this.b;
            if (id === null) {
                this.b = undefined;
                if (original !== this.b) {
                    this.J.fire(this.b);
                }
                return;
            }
            const terminal = this.W(id);
            if (terminal) {
                this.b = terminal;
                if (original !== this.b) {
                    this.J.fire(this.b.value);
                }
            }
        }
        async $acceptTerminalProcessData(id, data) {
            const terminal = this.W(id);
            if (terminal) {
                this.O.fire({ terminal: terminal.value, data });
            }
        }
        async $acceptTerminalDimensions(id, cols, rows) {
            const terminal = this.W(id);
            if (terminal) {
                if (terminal.setDimensions(cols, rows)) {
                    this.L.fire({
                        terminal: terminal.value,
                        dimensions: terminal.value.dimensions
                    });
                }
            }
        }
        async $acceptDidExecuteCommand(id, command) {
            const terminal = this.W(id);
            if (terminal) {
                this.P.fire({ terminal: terminal.value, ...command });
            }
        }
        async $acceptTerminalMaximumDimensions(id, cols, rows) {
            // Extension pty terminal only - when virtual process resize fires it means that the
            // terminal's maximum dimensions changed
            this.g.get(id)?.resize(cols, rows);
        }
        async $acceptTerminalTitleChange(id, name) {
            const terminal = this.W(id);
            if (terminal) {
                terminal.name = name;
            }
        }
        async $acceptTerminalClosed(id, exitCode, exitReason) {
            const index = this.Y(this.f, id);
            if (index !== null) {
                const terminal = this.f.splice(index, 1)[0];
                terminal.setExitStatus(exitCode, exitReason);
                this.H.fire(terminal.value);
            }
        }
        $acceptTerminalOpened(id, extHostTerminalId, name, shellLaunchConfigDto) {
            if (extHostTerminalId) {
                // Resolve with the renderer generated id
                const index = this.Y(this.f, extHostTerminalId);
                if (index !== null) {
                    // The terminal has already been created (via createTerminal*), only fire the event
                    this.f[index]._id = id;
                    this.I.fire(this.terminals[index]);
                    this.f[index].isOpen = true;
                    return;
                }
            }
            const creationOptions = {
                name: shellLaunchConfigDto.name,
                shellPath: shellLaunchConfigDto.executable,
                shellArgs: shellLaunchConfigDto.args,
                cwd: typeof shellLaunchConfigDto.cwd === 'string' ? shellLaunchConfigDto.cwd : uri_1.URI.revive(shellLaunchConfigDto.cwd),
                env: shellLaunchConfigDto.env,
                hideFromUser: shellLaunchConfigDto.hideFromUser
            };
            const terminal = new $Fbc(this.a, id, creationOptions, name);
            this.f.push(terminal);
            this.I.fire(terminal.value);
            terminal.isOpen = true;
        }
        async $acceptTerminalProcessId(id, processId) {
            const terminal = this.W(id);
            terminal?._setProcessId(processId);
        }
        async $startExtensionTerminal(id, initialDimensions) {
            // Make sure the ExtHostTerminal exists so onDidOpenTerminal has fired before we call
            // Pseudoterminal.start
            const terminal = this.W(id);
            if (!terminal) {
                return { message: (0, nls_1.localize)(0, null, id) };
            }
            // Wait for onDidOpenTerminal to fire
            if (!terminal.isOpen) {
                await new Promise(r => {
                    // Ensure open is called after onDidOpenTerminal
                    const listener = this.onDidOpenTerminal(async (e) => {
                        if (e === terminal.value) {
                            listener.dispose();
                            r();
                        }
                    });
                });
            }
            const terminalProcess = this.g.get(id);
            if (terminalProcess) {
                terminalProcess.startSendingEvents(initialDimensions);
            }
            else {
                // Defer startSendingEvents call to when _setupExtHostProcessListeners is called
                this.j[id] = { initialDimensions };
            }
            return undefined;
        }
        S(id, p) {
            const disposables = new lifecycle_1.$jc();
            disposables.add(p.onProcessReady(e => this.a.$sendProcessReady(id, e.pid, e.cwd, e.windowsPty)));
            disposables.add(p.onDidChangeProperty(property => this.a.$sendProcessProperty(id, property)));
            // Buffer data events to reduce the amount of messages going to the renderer
            this.y.startBuffering(id, p.onProcessData);
            disposables.add(p.onProcessExit(exitCode => this.U(id, exitCode)));
            this.g.set(id, p);
            const awaitingStart = this.j[id];
            if (awaitingStart && p instanceof ExtHostPseudoterminal) {
                p.startSendingEvents(awaitingStart.initialDimensions);
                delete this.j[id];
            }
            return disposables;
        }
        $acceptProcessAckDataEvent(id, charCount) {
            this.g.get(id)?.acknowledgeDataEvent(charCount);
        }
        $acceptProcessInput(id, data) {
            this.g.get(id)?.input(data);
        }
        $acceptTerminalInteraction(id) {
            const terminal = this.W(id);
            if (terminal?.setInteractedWith()) {
                this.M.fire(terminal.value);
            }
        }
        $acceptTerminalSelection(id, selection) {
            this.W(id)?.setSelection(selection);
        }
        $acceptProcessResize(id, cols, rows) {
            try {
                this.g.get(id)?.resize(cols, rows);
            }
            catch (error) {
                // We tried to write to a closed pipe / channel.
                if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
                    throw (error);
                }
            }
        }
        $acceptProcessShutdown(id, immediate) {
            this.g.get(id)?.shutdown(immediate);
        }
        $acceptProcessRequestInitialCwd(id) {
            this.g.get(id)?.getInitialCwd().then(initialCwd => this.a.$sendProcessProperty(id, { type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: initialCwd }));
        }
        $acceptProcessRequestCwd(id) {
            this.g.get(id)?.getCwd().then(cwd => this.a.$sendProcessProperty(id, { type: "cwd" /* ProcessPropertyType.Cwd */, value: cwd }));
        }
        $acceptProcessRequestLatency(id) {
            return Promise.resolve(id);
        }
        registerLinkProvider(provider) {
            this.z.add(provider);
            if (this.z.size === 1) {
                this.a.$startLinkProvider();
            }
            return new extHostTypes_1.$3J(() => {
                this.z.delete(provider);
                if (this.z.size === 0) {
                    this.a.$stopLinkProvider();
                }
            });
        }
        registerProfileProvider(extension, id, provider) {
            if (this.C.has(id)) {
                throw new Error(`Terminal profile provider "${id}" already registered`);
            }
            this.C.set(id, provider);
            this.a.$registerProfileProvider(id, extension.identifier.value);
            return new extHostTypes_1.$3J(() => {
                this.C.delete(id);
                this.a.$unregisterProfileProvider(id);
            });
        }
        registerTerminalQuickFixProvider(id, extensionId, provider) {
            if (this.D.has(id)) {
                throw new Error(`Terminal quick fix provider "${id}" is already registered`);
            }
            this.D.set(id, provider);
            this.a.$registerQuickFixProvider(id, extensionId);
            return new extHostTypes_1.$3J(() => {
                this.D.delete(id);
                this.a.$unregisterQuickFixProvider(id);
            });
        }
        async $provideTerminalQuickFixes(id, matchResult) {
            const token = new cancellation_1.$pd().token;
            if (token.isCancellationRequested) {
                return;
            }
            const provider = this.D.get(id);
            if (!provider) {
                return;
            }
            const quickFixes = await provider.provideTerminalQuickFixes(matchResult, token);
            if (quickFixes === null || (Array.isArray(quickFixes) && quickFixes.length === 0)) {
                return undefined;
            }
            const store = new lifecycle_1.$jc();
            this.w.value = store;
            // Single
            if (!Array.isArray(quickFixes)) {
                return quickFixes ? extHostTypeConverters_1.TerminalQuickFix.from(quickFixes, this.Q.converter, store) : undefined;
            }
            // Many
            const result = [];
            for (const fix of quickFixes) {
                const converted = extHostTypeConverters_1.TerminalQuickFix.from(fix, this.Q.converter, store);
                if (converted) {
                    result.push(converted);
                }
            }
            return result;
        }
        async $createContributedProfileTerminal(id, options) {
            const token = new cancellation_1.$pd().token;
            let profile = await this.C.get(id)?.provideTerminalProfile(token);
            if (token.isCancellationRequested) {
                return;
            }
            if (profile && !('options' in profile)) {
                profile = { options: profile };
            }
            if (!profile || !('options' in profile)) {
                throw new Error(`No terminal profile options provided for id "${id}"`);
            }
            if ('pty' in profile.options) {
                this.createExtensionTerminal(profile.options, options);
                return;
            }
            this.createTerminalFromOptions(profile.options, options);
        }
        async $provideLinks(terminalId, line) {
            const terminal = this.W(terminalId);
            if (!terminal) {
                return [];
            }
            // Discard any cached links the terminal has been holding, currently all links are released
            // when new links are provided.
            this.F.delete(terminalId);
            const oldToken = this.G.get(terminalId);
            oldToken?.dispose(true);
            const cancellationSource = new cancellation_1.$pd();
            this.G.set(terminalId, cancellationSource);
            const result = [];
            const context = { terminal: terminal.value, line };
            const promises = [];
            for (const provider of this.z) {
                promises.push(async_1.Promises.withAsyncBody(async (r) => {
                    cancellationSource.token.onCancellationRequested(() => r({ provider, links: [] }));
                    const links = (await provider.provideTerminalLinks(context, cancellationSource.token)) || [];
                    if (!cancellationSource.token.isCancellationRequested) {
                        r({ provider, links });
                    }
                }));
            }
            const provideResults = await Promise.all(promises);
            if (cancellationSource.token.isCancellationRequested) {
                return [];
            }
            const cacheLinkMap = new Map();
            for (const provideResult of provideResults) {
                if (provideResult && provideResult.links.length > 0) {
                    result.push(...provideResult.links.map(providerLink => {
                        const link = {
                            id: nextLinkId++,
                            startIndex: providerLink.startIndex,
                            length: providerLink.length,
                            label: providerLink.tooltip
                        };
                        cacheLinkMap.set(link.id, {
                            provider: provideResult.provider,
                            link: providerLink
                        });
                        return link;
                    }));
                }
            }
            this.F.set(terminalId, cacheLinkMap);
            return result;
        }
        $activateLink(terminalId, linkId) {
            const cachedLink = this.F.get(terminalId)?.get(linkId);
            if (!cachedLink) {
                return;
            }
            cachedLink.provider.handleTerminalLink(cachedLink.link);
        }
        U(id, exitCode) {
            this.y.stopBuffering(id);
            // Remove process reference
            this.g.delete(id);
            delete this.j[id];
            // Clean up process disposables
            const processDiposable = this.h[id];
            if (processDiposable) {
                processDiposable.dispose();
                delete this.h[id];
            }
            // Send exit event to main side
            this.a.$sendProcessExit(id, exitCode);
        }
        W(id) {
            return this.X(this.f, id);
        }
        X(array, id) {
            const index = this.Y(array, id);
            return index !== null ? array[index] : null;
        }
        Y(array, id) {
            const index = array.findIndex(item => {
                return item._id === id;
            });
            if (index === -1) {
                return null;
            }
            return index;
        }
        getEnvironmentVariableCollection(extension) {
            let collection = this.n.get(extension.identifier.value);
            if (!collection) {
                collection = new UnifiedEnvironmentVariableCollection();
                this.$(extension.identifier.value, collection);
            }
            return collection.getScopedEnvironmentVariableCollection(undefined);
        }
        Z(extensionIdentifier, collection) {
            const serialized = (0, environmentVariableShared_1.$ar)(collection.map);
            const serializedDescription = (0, environmentVariableShared_1.$br)(collection.descriptionMap);
            this.a.$setEnvironmentVariableCollection(extensionIdentifier, collection.persistent, serialized.length === 0 ? undefined : serialized, serializedDescription);
        }
        $initEnvironmentVariableCollections(collections) {
            collections.forEach(entry => {
                const extensionIdentifier = entry[0];
                const collection = new UnifiedEnvironmentVariableCollection(entry[1]);
                this.$(extensionIdentifier, collection);
            });
        }
        $acceptDefaultProfile(profile, automationProfile) {
            const oldProfile = this.s;
            this.s = profile;
            this.u = automationProfile;
            if (oldProfile?.path !== profile.path) {
                this.N.fire(profile.path);
            }
        }
        $(extensionIdentifier, collection) {
            this.n.set(extensionIdentifier, collection);
            collection.onDidChangeCollection(() => {
                // When any collection value changes send this immediately, this is done to ensure
                // following calls to createTerminal will be created with the new environment. It will
                // result in more noise by sending multiple updates when called but collections are
                // expected to be small.
                this.Z(extensionIdentifier, collection);
            });
        }
    };
    exports.$Gbc = $Gbc;
    exports.$Gbc = $Gbc = __decorate([
        __param(1, extHostCommands_1.$lM),
        __param(2, extHostRpcService_1.$2L)
    ], $Gbc);
    /**
     * Unified environment variable collection carrying information for all scopes, for a specific extension.
     */
    class UnifiedEnvironmentVariableCollection {
        get persistent() { return this.b; }
        set persistent(value) {
            this.b = value;
            this.d.fire();
        }
        get onDidChangeCollection() { return this.d && this.d.event; }
        constructor(serialized) {
            this.map = new Map();
            this.a = new Map();
            this.descriptionMap = new Map();
            this.b = true;
            this.d = new event_1.$fd();
            this.map = new Map(serialized);
        }
        getScopedEnvironmentVariableCollection(scope) {
            const scopedCollectionKey = this.h(scope);
            let scopedCollection = this.a.get(scopedCollectionKey);
            if (!scopedCollection) {
                scopedCollection = new ScopedEnvironmentVariableCollection(this, scope);
                this.a.set(scopedCollectionKey, scopedCollection);
                scopedCollection.onDidChangeCollection(() => this.d.fire());
            }
            return scopedCollection;
        }
        replace(variable, value, options, scope) {
            this.f(variable, { value, type: extHostTypes_1.EnvironmentVariableMutatorType.Replace, options: options ?? { applyAtProcessCreation: true }, scope });
        }
        append(variable, value, options, scope) {
            this.f(variable, { value, type: extHostTypes_1.EnvironmentVariableMutatorType.Append, options: options ?? { applyAtProcessCreation: true }, scope });
        }
        prepend(variable, value, options, scope) {
            this.f(variable, { value, type: extHostTypes_1.EnvironmentVariableMutatorType.Prepend, options: options ?? { applyAtProcessCreation: true }, scope });
        }
        f(variable, mutator) {
            if (mutator.options && mutator.options.applyAtProcessCreation === false && !mutator.options.applyAtShellIntegration) {
                throw new Error('EnvironmentVariableMutatorOptions must apply at either process creation or shell integration');
            }
            const key = this.g(variable, mutator.scope);
            const current = this.map.get(key);
            const newOptions = mutator.options ? {
                applyAtProcessCreation: mutator.options.applyAtProcessCreation ?? false,
                applyAtShellIntegration: mutator.options.applyAtShellIntegration ?? false,
            } : {
                applyAtProcessCreation: true
            };
            if (!current ||
                current.value !== mutator.value ||
                current.type !== mutator.type ||
                current.options?.applyAtProcessCreation !== newOptions.applyAtProcessCreation ||
                current.options?.applyAtShellIntegration !== newOptions.applyAtShellIntegration ||
                current.scope?.workspaceFolder?.index !== mutator.scope?.workspaceFolder?.index) {
                const key = this.g(variable, mutator.scope);
                const value = {
                    variable,
                    ...mutator,
                    options: newOptions
                };
                this.map.set(key, value);
                this.d.fire();
            }
        }
        get(variable, scope) {
            const key = this.g(variable, scope);
            const value = this.map.get(key);
            // TODO: Set options to defaults if needed
            return value ? convertMutator(value) : undefined;
        }
        g(variable, scope) {
            const scopeKey = this.h(scope);
            return scopeKey.length ? `${variable}:::${scopeKey}` : variable;
        }
        h(scope) {
            return this.j(scope?.workspaceFolder) ?? '';
        }
        j(workspaceFolder) {
            return workspaceFolder ? workspaceFolder.uri.toString() : undefined;
        }
        getVariableMap(scope) {
            const map = new Map();
            for (const [_, value] of this.map) {
                if (this.h(value.scope) === this.h(scope)) {
                    map.set(value.variable, convertMutator(value));
                }
            }
            return map;
        }
        delete(variable, scope) {
            const key = this.g(variable, scope);
            this.map.delete(key);
            this.d.fire();
        }
        clear(scope) {
            if (scope?.workspaceFolder) {
                for (const [key, mutator] of this.map) {
                    if (mutator.scope?.workspaceFolder?.index === scope.workspaceFolder.index) {
                        this.map.delete(key);
                    }
                }
                this.k(scope);
            }
            else {
                this.map.clear();
                this.descriptionMap.clear();
            }
            this.d.fire();
        }
        setDescription(description, scope) {
            const key = this.h(scope);
            const current = this.descriptionMap.get(key);
            if (!current || current.description !== description) {
                let descriptionStr;
                if (typeof description === 'string') {
                    descriptionStr = description;
                }
                else {
                    // Only take the description before the first `\n\n`, so that the description doesn't mess up the UI
                    descriptionStr = description?.value.split('\n\n')[0];
                }
                const value = { description: descriptionStr, scope };
                this.descriptionMap.set(key, value);
                this.d.fire();
            }
        }
        getDescription(scope) {
            const key = this.h(scope);
            return this.descriptionMap.get(key)?.description;
        }
        k(scope) {
            const key = this.h(scope);
            this.descriptionMap.delete(key);
        }
    }
    class ScopedEnvironmentVariableCollection {
        get persistent() { return this.b.persistent; }
        set persistent(value) {
            this.b.persistent = value;
        }
        get onDidChangeCollection() { return this.a && this.a.event; }
        constructor(b, d) {
            this.b = b;
            this.d = d;
            this.a = new event_1.$fd();
        }
        getScoped(scope) {
            return this.b.getScopedEnvironmentVariableCollection(scope);
        }
        replace(variable, value, options) {
            this.b.replace(variable, value, options, this.d);
        }
        append(variable, value, options) {
            this.b.append(variable, value, options, this.d);
        }
        prepend(variable, value, options) {
            this.b.prepend(variable, value, options, this.d);
        }
        get(variable) {
            return this.b.get(variable, this.d);
        }
        forEach(callback, thisArg) {
            this.b.getVariableMap(this.d).forEach((value, variable) => callback.call(thisArg, variable, value, this), this.d);
        }
        [Symbol.iterator]() {
            return this.b.getVariableMap(this.d).entries();
        }
        delete(variable) {
            this.b.delete(variable, this.d);
            this.a.fire(undefined);
        }
        clear() {
            this.b.clear(this.d);
        }
        set description(description) {
            this.b.setDescription(description, this.d);
        }
        get description() {
            return this.b.getDescription(this.d);
        }
    }
    let $Hbc = class $Hbc extends $Gbc {
        constructor(extHostCommands, extHostRpc) {
            super(false, extHostCommands, extHostRpc);
        }
        createTerminal(name, shellPath, shellArgs) {
            throw new errors_1.$0();
        }
        createTerminalFromOptions(options, internalOptions) {
            throw new errors_1.$0();
        }
    };
    exports.$Hbc = $Hbc;
    exports.$Hbc = $Hbc = __decorate([
        __param(0, extHostCommands_1.$lM),
        __param(1, extHostRpcService_1.$2L)
    ], $Hbc);
    function asTerminalIcon(iconPath) {
        if (!iconPath || typeof iconPath === 'string') {
            return undefined;
        }
        if (!('id' in iconPath)) {
            return iconPath;
        }
        return {
            id: iconPath.id,
            color: iconPath.color
        };
    }
    function asTerminalColor(color) {
        return themables_1.ThemeColor.isThemeColor(color) ? color : undefined;
    }
    function convertMutator(mutator) {
        const newMutator = { ...mutator };
        delete newMutator.scope;
        newMutator.options = newMutator.options ?? undefined;
        delete newMutator.variable;
        return newMutator;
    }
});
//# sourceMappingURL=extHostTerminalService.js.map