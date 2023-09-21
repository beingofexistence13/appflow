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
define(["require", "exports", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/workbench/api/common/extHostRpcService", "vs/base/common/lifecycle", "./extHostTypes", "vs/nls", "vs/base/common/errors", "vs/platform/terminal/common/environmentVariableShared", "vs/base/common/cancellation", "vs/base/common/uuid", "vs/platform/terminal/common/terminalDataBuffering", "vs/base/common/themables", "vs/base/common/async", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostCommands"], function (require, exports, event_1, extHost_protocol_1, instantiation_1, uri_1, extHostRpcService_1, lifecycle_1, extHostTypes_1, nls_1, errors_1, environmentVariableShared_1, cancellation_1, uuid_1, terminalDataBuffering_1, themables_1, async_1, extHostTypeConverters_1, extHostCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkerExtHostTerminalService = exports.BaseExtHostTerminalService = exports.ExtHostTerminal = exports.IExtHostTerminalService = void 0;
    exports.IExtHostTerminalService = (0, instantiation_1.createDecorator)('IExtHostTerminalService');
    class ExtHostTerminal {
        constructor(_proxy, _id, _creationOptions, _name) {
            this._proxy = _proxy;
            this._id = _id;
            this._creationOptions = _creationOptions;
            this._name = _name;
            this._disposed = false;
            this._state = { isInteractedWith: false };
            this.isOpen = false;
            this._creationOptions = Object.freeze(this._creationOptions);
            this._pidPromise = new Promise(c => this._pidPromiseComplete = c);
            const that = this;
            this.value = {
                get name() {
                    return that._name || '';
                },
                get processId() {
                    return that._pidPromise;
                },
                get creationOptions() {
                    return that._creationOptions;
                },
                get exitStatus() {
                    return that._exitStatus;
                },
                get state() {
                    return that._state;
                },
                get selection() {
                    return that._selection;
                },
                sendText(text, addNewLine = true) {
                    that._checkDisposed();
                    that._proxy.$sendText(that._id, text, addNewLine);
                },
                show(preserveFocus) {
                    that._checkDisposed();
                    that._proxy.$show(that._id, preserveFocus);
                },
                hide() {
                    that._checkDisposed();
                    that._proxy.$hide(that._id);
                },
                dispose() {
                    if (!that._disposed) {
                        that._disposed = true;
                        that._proxy.$dispose(that._id);
                    }
                },
                get dimensions() {
                    if (that._cols === undefined || that._rows === undefined) {
                        return undefined;
                    }
                    return {
                        columns: that._cols,
                        rows: that._rows
                    };
                }
            };
        }
        async create(options, internalOptions) {
            if (typeof this._id !== 'string') {
                throw new Error('Terminal has already been created');
            }
            await this._proxy.$createTerminal(this._id, {
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
                location: internalOptions?.location || this._serializeParentTerminal(options.location, internalOptions?.resolvedExtHostIdentifier),
                isTransient: options.isTransient ?? undefined,
            });
        }
        async createExtensionTerminal(location, parentTerminal, iconPath, color) {
            if (typeof this._id !== 'string') {
                throw new Error('Terminal has already been created');
            }
            await this._proxy.$createTerminal(this._id, {
                name: this._name,
                isExtensionCustomPtyTerminal: true,
                icon: iconPath,
                color: themables_1.ThemeColor.isThemeColor(color) ? color.id : undefined,
                location: this._serializeParentTerminal(location, parentTerminal),
                isTransient: true
            });
            // At this point, the id has been set via `$acceptTerminalOpened`
            if (typeof this._id === 'string') {
                throw new Error('Terminal creation failed');
            }
            return this._id;
        }
        _serializeParentTerminal(location, parentTerminal) {
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
        _checkDisposed() {
            if (this._disposed) {
                throw new Error('Terminal has already been disposed');
            }
        }
        set name(name) {
            this._name = name;
        }
        setExitStatus(code, reason) {
            this._exitStatus = Object.freeze({ code, reason });
        }
        setDimensions(cols, rows) {
            if (cols === this._cols && rows === this._rows) {
                // Nothing changed
                return false;
            }
            if (cols === 0 || rows === 0) {
                return false;
            }
            this._cols = cols;
            this._rows = rows;
            return true;
        }
        setInteractedWith() {
            if (!this._state.isInteractedWith) {
                this._state = { isInteractedWith: true };
                return true;
            }
            return false;
        }
        setSelection(selection) {
            this._selection = selection;
        }
        _setProcessId(processId) {
            // The event may fire 2 times when the panel is restored
            if (this._pidPromiseComplete) {
                this._pidPromiseComplete(processId);
                this._pidPromiseComplete = undefined;
            }
            else {
                // Recreate the promise if this is the nth processId set (e.g. reused task terminals)
                this._pidPromise.then(pid => {
                    if (pid !== processId) {
                        this._pidPromise = Promise.resolve(processId);
                    }
                });
            }
        }
    }
    exports.ExtHostTerminal = ExtHostTerminal;
    class ExtHostPseudoterminal {
        get onProcessReady() { return this._onProcessReady.event; }
        constructor(_pty) {
            this._pty = _pty;
            this.id = 0;
            this.shouldPersist = false;
            this._onProcessData = new event_1.Emitter();
            this.onProcessData = this._onProcessData.event;
            this._onProcessReady = new event_1.Emitter();
            this._onDidChangeProperty = new event_1.Emitter();
            this.onDidChangeProperty = this._onDidChangeProperty.event;
            this._onProcessExit = new event_1.Emitter();
            this.onProcessExit = this._onProcessExit.event;
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
            this._pty.close();
        }
        input(data) {
            this._pty.handleInput?.(data);
        }
        resize(cols, rows) {
            this._pty.setDimensions?.({ columns: cols, rows });
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
            this._pty.onDidWrite(e => this._onProcessData.fire(e));
            this._pty.onDidClose?.((e = undefined) => {
                this._onProcessExit.fire(e === void 0 ? undefined : e);
            });
            this._pty.onDidOverrideDimensions?.(e => {
                if (e) {
                    this._onDidChangeProperty.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: { cols: e.columns, rows: e.rows } });
                }
            });
            this._pty.onDidChangeName?.(title => {
                this._onDidChangeProperty.fire({ type: "title" /* ProcessPropertyType.Title */, value: title });
            });
            this._pty.open(initialDimensions ? initialDimensions : undefined);
            if (initialDimensions) {
                this._pty.setDimensions?.(initialDimensions);
            }
            this._onProcessReady.fire({ pid: -1, cwd: '', windowsPty: undefined });
        }
    }
    let nextLinkId = 1;
    let BaseExtHostTerminalService = class BaseExtHostTerminalService extends lifecycle_1.Disposable {
        get activeTerminal() { return this._activeTerminal?.value; }
        get terminals() { return this._terminals.map(term => term.value); }
        constructor(supportsProcesses, _extHostCommands, extHostRpc) {
            super();
            this._extHostCommands = _extHostCommands;
            this._terminals = [];
            this._terminalProcesses = new Map();
            this._terminalProcessDisposables = {};
            this._extensionTerminalAwaitingStart = {};
            this._getTerminalPromises = {};
            this._environmentVariableCollections = new Map();
            this._lastQuickFixCommands = this._register(new lifecycle_1.MutableDisposable());
            this._linkProviders = new Set();
            this._profileProviders = new Map();
            this._quickFixProviders = new Map();
            this._terminalLinkCache = new Map();
            this._terminalLinkCancellationSource = new Map();
            this._onDidCloseTerminal = new event_1.Emitter();
            this.onDidCloseTerminal = this._onDidCloseTerminal.event;
            this._onDidOpenTerminal = new event_1.Emitter();
            this.onDidOpenTerminal = this._onDidOpenTerminal.event;
            this._onDidChangeActiveTerminal = new event_1.Emitter();
            this.onDidChangeActiveTerminal = this._onDidChangeActiveTerminal.event;
            this._onDidChangeTerminalDimensions = new event_1.Emitter();
            this.onDidChangeTerminalDimensions = this._onDidChangeTerminalDimensions.event;
            this._onDidChangeTerminalState = new event_1.Emitter();
            this.onDidChangeTerminalState = this._onDidChangeTerminalState.event;
            this._onDidChangeShell = new event_1.Emitter();
            this.onDidChangeShell = this._onDidChangeShell.event;
            this._onDidWriteTerminalData = new event_1.Emitter({
                onWillAddFirstListener: () => this._proxy.$startSendingDataEvents(),
                onDidRemoveLastListener: () => this._proxy.$stopSendingDataEvents()
            });
            this.onDidWriteTerminalData = this._onDidWriteTerminalData.event;
            this._onDidExecuteCommand = new event_1.Emitter({
                onWillAddFirstListener: () => this._proxy.$startSendingCommandEvents(),
                onDidRemoveLastListener: () => this._proxy.$stopSendingCommandEvents()
            });
            this.onDidExecuteTerminalCommand = this._onDidExecuteCommand.event;
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadTerminalService);
            this._bufferer = new terminalDataBuffering_1.TerminalDataBufferer(this._proxy.$sendProcessData);
            this._proxy.$registerProcessSupport(supportsProcesses);
            this._extHostCommands.registerArgumentProcessor({
                processArgument: arg => {
                    const deserialize = (arg) => {
                        const cast = arg;
                        return this._getTerminalById(cast.instanceId)?.value;
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
            this._register({
                dispose: () => {
                    for (const [_, terminalProcess] of this._terminalProcesses) {
                        terminalProcess.shutdown(true);
                    }
                }
            });
        }
        getDefaultShell(useAutomationShell) {
            const profile = useAutomationShell ? this._defaultAutomationProfile : this._defaultProfile;
            return profile?.path || '';
        }
        getDefaultShellArgs(useAutomationShell) {
            const profile = useAutomationShell ? this._defaultAutomationProfile : this._defaultProfile;
            return profile?.args || [];
        }
        createExtensionTerminal(options, internalOptions) {
            const terminal = new ExtHostTerminal(this._proxy, (0, uuid_1.generateUuid)(), options, options.name);
            const p = new ExtHostPseudoterminal(options.pty);
            terminal.createExtensionTerminal(options.location, this._serializeParentTerminal(options, internalOptions).resolvedExtHostIdentifier, asTerminalIcon(options.iconPath), asTerminalColor(options.color)).then(id => {
                const disposable = this._setupExtHostProcessListeners(id, p);
                this._terminalProcessDisposables[id] = disposable;
            });
            this._terminals.push(terminal);
            return terminal.value;
        }
        _serializeParentTerminal(options, internalOptions) {
            internalOptions = internalOptions ? internalOptions : {};
            if (options.location && typeof options.location === 'object' && 'parentTerminal' in options.location) {
                const parentTerminal = options.location.parentTerminal;
                if (parentTerminal) {
                    const parentExtHostTerminal = this._terminals.find(t => t.value === parentTerminal);
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
            const terminal = this._getTerminalById(id);
            if (!terminal) {
                throw new Error(`Cannot resolve terminal with id ${id} for virtual process`);
            }
            const p = new ExtHostPseudoterminal(pty);
            const disposable = this._setupExtHostProcessListeners(id, p);
            this._terminalProcessDisposables[id] = disposable;
        }
        async $acceptActiveTerminalChanged(id) {
            const original = this._activeTerminal;
            if (id === null) {
                this._activeTerminal = undefined;
                if (original !== this._activeTerminal) {
                    this._onDidChangeActiveTerminal.fire(this._activeTerminal);
                }
                return;
            }
            const terminal = this._getTerminalById(id);
            if (terminal) {
                this._activeTerminal = terminal;
                if (original !== this._activeTerminal) {
                    this._onDidChangeActiveTerminal.fire(this._activeTerminal.value);
                }
            }
        }
        async $acceptTerminalProcessData(id, data) {
            const terminal = this._getTerminalById(id);
            if (terminal) {
                this._onDidWriteTerminalData.fire({ terminal: terminal.value, data });
            }
        }
        async $acceptTerminalDimensions(id, cols, rows) {
            const terminal = this._getTerminalById(id);
            if (terminal) {
                if (terminal.setDimensions(cols, rows)) {
                    this._onDidChangeTerminalDimensions.fire({
                        terminal: terminal.value,
                        dimensions: terminal.value.dimensions
                    });
                }
            }
        }
        async $acceptDidExecuteCommand(id, command) {
            const terminal = this._getTerminalById(id);
            if (terminal) {
                this._onDidExecuteCommand.fire({ terminal: terminal.value, ...command });
            }
        }
        async $acceptTerminalMaximumDimensions(id, cols, rows) {
            // Extension pty terminal only - when virtual process resize fires it means that the
            // terminal's maximum dimensions changed
            this._terminalProcesses.get(id)?.resize(cols, rows);
        }
        async $acceptTerminalTitleChange(id, name) {
            const terminal = this._getTerminalById(id);
            if (terminal) {
                terminal.name = name;
            }
        }
        async $acceptTerminalClosed(id, exitCode, exitReason) {
            const index = this._getTerminalObjectIndexById(this._terminals, id);
            if (index !== null) {
                const terminal = this._terminals.splice(index, 1)[0];
                terminal.setExitStatus(exitCode, exitReason);
                this._onDidCloseTerminal.fire(terminal.value);
            }
        }
        $acceptTerminalOpened(id, extHostTerminalId, name, shellLaunchConfigDto) {
            if (extHostTerminalId) {
                // Resolve with the renderer generated id
                const index = this._getTerminalObjectIndexById(this._terminals, extHostTerminalId);
                if (index !== null) {
                    // The terminal has already been created (via createTerminal*), only fire the event
                    this._terminals[index]._id = id;
                    this._onDidOpenTerminal.fire(this.terminals[index]);
                    this._terminals[index].isOpen = true;
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
            const terminal = new ExtHostTerminal(this._proxy, id, creationOptions, name);
            this._terminals.push(terminal);
            this._onDidOpenTerminal.fire(terminal.value);
            terminal.isOpen = true;
        }
        async $acceptTerminalProcessId(id, processId) {
            const terminal = this._getTerminalById(id);
            terminal?._setProcessId(processId);
        }
        async $startExtensionTerminal(id, initialDimensions) {
            // Make sure the ExtHostTerminal exists so onDidOpenTerminal has fired before we call
            // Pseudoterminal.start
            const terminal = this._getTerminalById(id);
            if (!terminal) {
                return { message: (0, nls_1.localize)('launchFail.idMissingOnExtHost', "Could not find the terminal with id {0} on the extension host", id) };
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
            const terminalProcess = this._terminalProcesses.get(id);
            if (terminalProcess) {
                terminalProcess.startSendingEvents(initialDimensions);
            }
            else {
                // Defer startSendingEvents call to when _setupExtHostProcessListeners is called
                this._extensionTerminalAwaitingStart[id] = { initialDimensions };
            }
            return undefined;
        }
        _setupExtHostProcessListeners(id, p) {
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(p.onProcessReady(e => this._proxy.$sendProcessReady(id, e.pid, e.cwd, e.windowsPty)));
            disposables.add(p.onDidChangeProperty(property => this._proxy.$sendProcessProperty(id, property)));
            // Buffer data events to reduce the amount of messages going to the renderer
            this._bufferer.startBuffering(id, p.onProcessData);
            disposables.add(p.onProcessExit(exitCode => this._onProcessExit(id, exitCode)));
            this._terminalProcesses.set(id, p);
            const awaitingStart = this._extensionTerminalAwaitingStart[id];
            if (awaitingStart && p instanceof ExtHostPseudoterminal) {
                p.startSendingEvents(awaitingStart.initialDimensions);
                delete this._extensionTerminalAwaitingStart[id];
            }
            return disposables;
        }
        $acceptProcessAckDataEvent(id, charCount) {
            this._terminalProcesses.get(id)?.acknowledgeDataEvent(charCount);
        }
        $acceptProcessInput(id, data) {
            this._terminalProcesses.get(id)?.input(data);
        }
        $acceptTerminalInteraction(id) {
            const terminal = this._getTerminalById(id);
            if (terminal?.setInteractedWith()) {
                this._onDidChangeTerminalState.fire(terminal.value);
            }
        }
        $acceptTerminalSelection(id, selection) {
            this._getTerminalById(id)?.setSelection(selection);
        }
        $acceptProcessResize(id, cols, rows) {
            try {
                this._terminalProcesses.get(id)?.resize(cols, rows);
            }
            catch (error) {
                // We tried to write to a closed pipe / channel.
                if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
                    throw (error);
                }
            }
        }
        $acceptProcessShutdown(id, immediate) {
            this._terminalProcesses.get(id)?.shutdown(immediate);
        }
        $acceptProcessRequestInitialCwd(id) {
            this._terminalProcesses.get(id)?.getInitialCwd().then(initialCwd => this._proxy.$sendProcessProperty(id, { type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: initialCwd }));
        }
        $acceptProcessRequestCwd(id) {
            this._terminalProcesses.get(id)?.getCwd().then(cwd => this._proxy.$sendProcessProperty(id, { type: "cwd" /* ProcessPropertyType.Cwd */, value: cwd }));
        }
        $acceptProcessRequestLatency(id) {
            return Promise.resolve(id);
        }
        registerLinkProvider(provider) {
            this._linkProviders.add(provider);
            if (this._linkProviders.size === 1) {
                this._proxy.$startLinkProvider();
            }
            return new extHostTypes_1.Disposable(() => {
                this._linkProviders.delete(provider);
                if (this._linkProviders.size === 0) {
                    this._proxy.$stopLinkProvider();
                }
            });
        }
        registerProfileProvider(extension, id, provider) {
            if (this._profileProviders.has(id)) {
                throw new Error(`Terminal profile provider "${id}" already registered`);
            }
            this._profileProviders.set(id, provider);
            this._proxy.$registerProfileProvider(id, extension.identifier.value);
            return new extHostTypes_1.Disposable(() => {
                this._profileProviders.delete(id);
                this._proxy.$unregisterProfileProvider(id);
            });
        }
        registerTerminalQuickFixProvider(id, extensionId, provider) {
            if (this._quickFixProviders.has(id)) {
                throw new Error(`Terminal quick fix provider "${id}" is already registered`);
            }
            this._quickFixProviders.set(id, provider);
            this._proxy.$registerQuickFixProvider(id, extensionId);
            return new extHostTypes_1.Disposable(() => {
                this._quickFixProviders.delete(id);
                this._proxy.$unregisterQuickFixProvider(id);
            });
        }
        async $provideTerminalQuickFixes(id, matchResult) {
            const token = new cancellation_1.CancellationTokenSource().token;
            if (token.isCancellationRequested) {
                return;
            }
            const provider = this._quickFixProviders.get(id);
            if (!provider) {
                return;
            }
            const quickFixes = await provider.provideTerminalQuickFixes(matchResult, token);
            if (quickFixes === null || (Array.isArray(quickFixes) && quickFixes.length === 0)) {
                return undefined;
            }
            const store = new lifecycle_1.DisposableStore();
            this._lastQuickFixCommands.value = store;
            // Single
            if (!Array.isArray(quickFixes)) {
                return quickFixes ? extHostTypeConverters_1.TerminalQuickFix.from(quickFixes, this._extHostCommands.converter, store) : undefined;
            }
            // Many
            const result = [];
            for (const fix of quickFixes) {
                const converted = extHostTypeConverters_1.TerminalQuickFix.from(fix, this._extHostCommands.converter, store);
                if (converted) {
                    result.push(converted);
                }
            }
            return result;
        }
        async $createContributedProfileTerminal(id, options) {
            const token = new cancellation_1.CancellationTokenSource().token;
            let profile = await this._profileProviders.get(id)?.provideTerminalProfile(token);
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
            const terminal = this._getTerminalById(terminalId);
            if (!terminal) {
                return [];
            }
            // Discard any cached links the terminal has been holding, currently all links are released
            // when new links are provided.
            this._terminalLinkCache.delete(terminalId);
            const oldToken = this._terminalLinkCancellationSource.get(terminalId);
            oldToken?.dispose(true);
            const cancellationSource = new cancellation_1.CancellationTokenSource();
            this._terminalLinkCancellationSource.set(terminalId, cancellationSource);
            const result = [];
            const context = { terminal: terminal.value, line };
            const promises = [];
            for (const provider of this._linkProviders) {
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
            this._terminalLinkCache.set(terminalId, cacheLinkMap);
            return result;
        }
        $activateLink(terminalId, linkId) {
            const cachedLink = this._terminalLinkCache.get(terminalId)?.get(linkId);
            if (!cachedLink) {
                return;
            }
            cachedLink.provider.handleTerminalLink(cachedLink.link);
        }
        _onProcessExit(id, exitCode) {
            this._bufferer.stopBuffering(id);
            // Remove process reference
            this._terminalProcesses.delete(id);
            delete this._extensionTerminalAwaitingStart[id];
            // Clean up process disposables
            const processDiposable = this._terminalProcessDisposables[id];
            if (processDiposable) {
                processDiposable.dispose();
                delete this._terminalProcessDisposables[id];
            }
            // Send exit event to main side
            this._proxy.$sendProcessExit(id, exitCode);
        }
        _getTerminalById(id) {
            return this._getTerminalObjectById(this._terminals, id);
        }
        _getTerminalObjectById(array, id) {
            const index = this._getTerminalObjectIndexById(array, id);
            return index !== null ? array[index] : null;
        }
        _getTerminalObjectIndexById(array, id) {
            const index = array.findIndex(item => {
                return item._id === id;
            });
            if (index === -1) {
                return null;
            }
            return index;
        }
        getEnvironmentVariableCollection(extension) {
            let collection = this._environmentVariableCollections.get(extension.identifier.value);
            if (!collection) {
                collection = new UnifiedEnvironmentVariableCollection();
                this._setEnvironmentVariableCollection(extension.identifier.value, collection);
            }
            return collection.getScopedEnvironmentVariableCollection(undefined);
        }
        _syncEnvironmentVariableCollection(extensionIdentifier, collection) {
            const serialized = (0, environmentVariableShared_1.serializeEnvironmentVariableCollection)(collection.map);
            const serializedDescription = (0, environmentVariableShared_1.serializeEnvironmentDescriptionMap)(collection.descriptionMap);
            this._proxy.$setEnvironmentVariableCollection(extensionIdentifier, collection.persistent, serialized.length === 0 ? undefined : serialized, serializedDescription);
        }
        $initEnvironmentVariableCollections(collections) {
            collections.forEach(entry => {
                const extensionIdentifier = entry[0];
                const collection = new UnifiedEnvironmentVariableCollection(entry[1]);
                this._setEnvironmentVariableCollection(extensionIdentifier, collection);
            });
        }
        $acceptDefaultProfile(profile, automationProfile) {
            const oldProfile = this._defaultProfile;
            this._defaultProfile = profile;
            this._defaultAutomationProfile = automationProfile;
            if (oldProfile?.path !== profile.path) {
                this._onDidChangeShell.fire(profile.path);
            }
        }
        _setEnvironmentVariableCollection(extensionIdentifier, collection) {
            this._environmentVariableCollections.set(extensionIdentifier, collection);
            collection.onDidChangeCollection(() => {
                // When any collection value changes send this immediately, this is done to ensure
                // following calls to createTerminal will be created with the new environment. It will
                // result in more noise by sending multiple updates when called but collections are
                // expected to be small.
                this._syncEnvironmentVariableCollection(extensionIdentifier, collection);
            });
        }
    };
    exports.BaseExtHostTerminalService = BaseExtHostTerminalService;
    exports.BaseExtHostTerminalService = BaseExtHostTerminalService = __decorate([
        __param(1, extHostCommands_1.IExtHostCommands),
        __param(2, extHostRpcService_1.IExtHostRpcService)
    ], BaseExtHostTerminalService);
    /**
     * Unified environment variable collection carrying information for all scopes, for a specific extension.
     */
    class UnifiedEnvironmentVariableCollection {
        get persistent() { return this._persistent; }
        set persistent(value) {
            this._persistent = value;
            this._onDidChangeCollection.fire();
        }
        get onDidChangeCollection() { return this._onDidChangeCollection && this._onDidChangeCollection.event; }
        constructor(serialized) {
            this.map = new Map();
            this.scopedCollections = new Map();
            this.descriptionMap = new Map();
            this._persistent = true;
            this._onDidChangeCollection = new event_1.Emitter();
            this.map = new Map(serialized);
        }
        getScopedEnvironmentVariableCollection(scope) {
            const scopedCollectionKey = this.getScopeKey(scope);
            let scopedCollection = this.scopedCollections.get(scopedCollectionKey);
            if (!scopedCollection) {
                scopedCollection = new ScopedEnvironmentVariableCollection(this, scope);
                this.scopedCollections.set(scopedCollectionKey, scopedCollection);
                scopedCollection.onDidChangeCollection(() => this._onDidChangeCollection.fire());
            }
            return scopedCollection;
        }
        replace(variable, value, options, scope) {
            this._setIfDiffers(variable, { value, type: extHostTypes_1.EnvironmentVariableMutatorType.Replace, options: options ?? { applyAtProcessCreation: true }, scope });
        }
        append(variable, value, options, scope) {
            this._setIfDiffers(variable, { value, type: extHostTypes_1.EnvironmentVariableMutatorType.Append, options: options ?? { applyAtProcessCreation: true }, scope });
        }
        prepend(variable, value, options, scope) {
            this._setIfDiffers(variable, { value, type: extHostTypes_1.EnvironmentVariableMutatorType.Prepend, options: options ?? { applyAtProcessCreation: true }, scope });
        }
        _setIfDiffers(variable, mutator) {
            if (mutator.options && mutator.options.applyAtProcessCreation === false && !mutator.options.applyAtShellIntegration) {
                throw new Error('EnvironmentVariableMutatorOptions must apply at either process creation or shell integration');
            }
            const key = this.getKey(variable, mutator.scope);
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
                const key = this.getKey(variable, mutator.scope);
                const value = {
                    variable,
                    ...mutator,
                    options: newOptions
                };
                this.map.set(key, value);
                this._onDidChangeCollection.fire();
            }
        }
        get(variable, scope) {
            const key = this.getKey(variable, scope);
            const value = this.map.get(key);
            // TODO: Set options to defaults if needed
            return value ? convertMutator(value) : undefined;
        }
        getKey(variable, scope) {
            const scopeKey = this.getScopeKey(scope);
            return scopeKey.length ? `${variable}:::${scopeKey}` : variable;
        }
        getScopeKey(scope) {
            return this.getWorkspaceKey(scope?.workspaceFolder) ?? '';
        }
        getWorkspaceKey(workspaceFolder) {
            return workspaceFolder ? workspaceFolder.uri.toString() : undefined;
        }
        getVariableMap(scope) {
            const map = new Map();
            for (const [_, value] of this.map) {
                if (this.getScopeKey(value.scope) === this.getScopeKey(scope)) {
                    map.set(value.variable, convertMutator(value));
                }
            }
            return map;
        }
        delete(variable, scope) {
            const key = this.getKey(variable, scope);
            this.map.delete(key);
            this._onDidChangeCollection.fire();
        }
        clear(scope) {
            if (scope?.workspaceFolder) {
                for (const [key, mutator] of this.map) {
                    if (mutator.scope?.workspaceFolder?.index === scope.workspaceFolder.index) {
                        this.map.delete(key);
                    }
                }
                this.clearDescription(scope);
            }
            else {
                this.map.clear();
                this.descriptionMap.clear();
            }
            this._onDidChangeCollection.fire();
        }
        setDescription(description, scope) {
            const key = this.getScopeKey(scope);
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
                this._onDidChangeCollection.fire();
            }
        }
        getDescription(scope) {
            const key = this.getScopeKey(scope);
            return this.descriptionMap.get(key)?.description;
        }
        clearDescription(scope) {
            const key = this.getScopeKey(scope);
            this.descriptionMap.delete(key);
        }
    }
    class ScopedEnvironmentVariableCollection {
        get persistent() { return this.collection.persistent; }
        set persistent(value) {
            this.collection.persistent = value;
        }
        get onDidChangeCollection() { return this._onDidChangeCollection && this._onDidChangeCollection.event; }
        constructor(collection, scope) {
            this.collection = collection;
            this.scope = scope;
            this._onDidChangeCollection = new event_1.Emitter();
        }
        getScoped(scope) {
            return this.collection.getScopedEnvironmentVariableCollection(scope);
        }
        replace(variable, value, options) {
            this.collection.replace(variable, value, options, this.scope);
        }
        append(variable, value, options) {
            this.collection.append(variable, value, options, this.scope);
        }
        prepend(variable, value, options) {
            this.collection.prepend(variable, value, options, this.scope);
        }
        get(variable) {
            return this.collection.get(variable, this.scope);
        }
        forEach(callback, thisArg) {
            this.collection.getVariableMap(this.scope).forEach((value, variable) => callback.call(thisArg, variable, value, this), this.scope);
        }
        [Symbol.iterator]() {
            return this.collection.getVariableMap(this.scope).entries();
        }
        delete(variable) {
            this.collection.delete(variable, this.scope);
            this._onDidChangeCollection.fire(undefined);
        }
        clear() {
            this.collection.clear(this.scope);
        }
        set description(description) {
            this.collection.setDescription(description, this.scope);
        }
        get description() {
            return this.collection.getDescription(this.scope);
        }
    }
    let WorkerExtHostTerminalService = class WorkerExtHostTerminalService extends BaseExtHostTerminalService {
        constructor(extHostCommands, extHostRpc) {
            super(false, extHostCommands, extHostRpc);
        }
        createTerminal(name, shellPath, shellArgs) {
            throw new errors_1.NotSupportedError();
        }
        createTerminalFromOptions(options, internalOptions) {
            throw new errors_1.NotSupportedError();
        }
    };
    exports.WorkerExtHostTerminalService = WorkerExtHostTerminalService;
    exports.WorkerExtHostTerminalService = WorkerExtHostTerminalService = __decorate([
        __param(0, extHostCommands_1.IExtHostCommands),
        __param(1, extHostRpcService_1.IExtHostRpcService)
    ], WorkerExtHostTerminalService);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRlcm1pbmFsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RUZXJtaW5hbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0VuRixRQUFBLHVCQUF1QixHQUFHLElBQUEsK0JBQWUsRUFBMEIseUJBQXlCLENBQUMsQ0FBQztJQUUzRyxNQUFhLGVBQWU7UUFjM0IsWUFDUyxNQUFzQyxFQUN2QyxHQUE4QixFQUNwQixnQkFBMEUsRUFDbkYsS0FBYztZQUhkLFdBQU0sR0FBTixNQUFNLENBQWdDO1lBQ3ZDLFFBQUcsR0FBSCxHQUFHLENBQTJCO1lBQ3BCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBMEQ7WUFDbkYsVUFBSyxHQUFMLEtBQUssQ0FBUztZQWpCZixjQUFTLEdBQVksS0FBSyxDQUFDO1lBTTNCLFdBQU0sR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUc1RCxXQUFNLEdBQVksS0FBSyxDQUFDO1lBVTlCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXRGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHO2dCQUNaLElBQUksSUFBSTtvQkFDUCxPQUFPLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUN6QixDQUFDO2dCQUNELElBQUksU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQ3pC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