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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/contrib/debug/common/abstractDebugAdapter", "vs/workbench/contrib/debug/common/debugUtils", "../common/extHostConfiguration", "./extHostVariableResolverService"], function (require, exports, async_1, event_1, uri_1, instantiation_1, extHost_protocol_1, extHostEditorTabs_1, extHostExtensionService_1, extHostRpcService_1, extHostTypes_1, extHostWorkspace_1, abstractDebugAdapter_1, debugUtils_1, extHostConfiguration_1, extHostVariableResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkerExtHostDebugService = exports.ExtHostDebugConsole = exports.ExtHostDebugSession = exports.ExtHostDebugServiceBase = exports.IExtHostDebugService = void 0;
    exports.IExtHostDebugService = (0, instantiation_1.createDecorator)('IExtHostDebugService');
    let ExtHostDebugServiceBase = class ExtHostDebugServiceBase {
        get onDidStartDebugSession() { return this._onDidStartDebugSession.event; }
        get onDidTerminateDebugSession() { return this._onDidTerminateDebugSession.event; }
        get onDidChangeActiveDebugSession() { return this._onDidChangeActiveDebugSession.event; }
        get activeDebugSession() { return this._activeDebugSession; }
        get onDidReceiveDebugSessionCustomEvent() { return this._onDidReceiveDebugSessionCustomEvent.event; }
        get activeDebugConsole() { return this._activeDebugConsole.value; }
        constructor(extHostRpcService, _workspaceService, _extensionService, _configurationService, _editorTabs, _variableResolver) {
            this._workspaceService = _workspaceService;
            this._extensionService = _extensionService;
            this._configurationService = _configurationService;
            this._editorTabs = _editorTabs;
            this._variableResolver = _variableResolver;
            this._debugSessions = new Map();
            this._configProviderHandleCounter = 0;
            this._configProviders = [];
            this._adapterFactoryHandleCounter = 0;
            this._adapterFactories = [];
            this._trackerFactoryHandleCounter = 0;
            this._trackerFactories = [];
            this._debugAdapters = new Map();
            this._debugAdaptersTrackers = new Map();
            this._onDidStartDebugSession = new event_1.Emitter();
            this._onDidTerminateDebugSession = new event_1.Emitter();
            this._onDidChangeActiveDebugSession = new event_1.Emitter();
            this._onDidReceiveDebugSessionCustomEvent = new event_1.Emitter();
            this._debugServiceProxy = extHostRpcService.getProxy(extHost_protocol_1.MainContext.MainThreadDebugService);
            this._onDidChangeBreakpoints = new event_1.Emitter();
            this._onDidChangeStackFrameFocus = new event_1.Emitter();
            this._activeDebugConsole = new ExtHostDebugConsole(this._debugServiceProxy);
            this._breakpoints = new Map();
            this._extensionService.getExtensionRegistry().then((extensionRegistry) => {
                extensionRegistry.onDidChange(_ => {
                    this.registerAllDebugTypes(extensionRegistry);
                });
                this.registerAllDebugTypes(extensionRegistry);
            });
        }
        asDebugSourceUri(src, session) {
            const source = src;
            if (typeof source.sourceReference === 'number' && source.sourceReference > 0) {
                // src can be retrieved via DAP's "source" request
                let debug = `debug:${encodeURIComponent(source.path || '')}`;
                let sep = '?';
                if (session) {
                    debug += `${sep}session=${encodeURIComponent(session.id)}`;
                    sep = '&';
                }
                debug += `${sep}ref=${source.sourceReference}`;
                return uri_1.URI.parse(debug);
            }
            else if (source.path) {
                // src is just a local file path
                return uri_1.URI.file(source.path);
            }
            else {
                throw new Error(`cannot create uri from DAP 'source' object; properties 'path' and 'sourceReference' are both missing.`);
            }
        }
        registerAllDebugTypes(extensionRegistry) {
            const debugTypes = [];
            for (const ed of extensionRegistry.getAllExtensionDescriptions()) {
                if (ed.contributes) {
                    const debuggers = ed.contributes['debuggers'];
                    if (debuggers && debuggers.length > 0) {
                        for (const dbg of debuggers) {
                            if ((0, debugUtils_1.isDebuggerMainContribution)(dbg)) {
                                debugTypes.push(dbg.type);
                            }
                        }
                    }
                }
            }
            this._debugServiceProxy.$registerDebugTypes(debugTypes);
        }
        // extension debug API
        get stackFrameFocus() {
            return this._stackFrameFocus;
        }
        get onDidChangeStackFrameFocus() {
            return this._onDidChangeStackFrameFocus.event;
        }
        get onDidChangeBreakpoints() {
            return this._onDidChangeBreakpoints.event;
        }
        get breakpoints() {
            const result = [];
            this._breakpoints.forEach(bp => result.push(bp));
            return result;
        }
        addBreakpoints(breakpoints0) {
            // filter only new breakpoints
            const breakpoints = breakpoints0.filter(bp => {
                const id = bp.id;
                if (!this._breakpoints.has(id)) {
                    this._breakpoints.set(id, bp);
                    return true;
                }
                return false;
            });
            // send notification for added breakpoints
            this.fireBreakpointChanges(breakpoints, [], []);
            // convert added breakpoints to DTOs
            const dtos = [];
            const map = new Map();
            for (const bp of breakpoints) {
                if (bp instanceof extHostTypes_1.SourceBreakpoint) {
                    let dto = map.get(bp.location.uri.toString());
                    if (!dto) {
                        dto = {
                            type: 'sourceMulti',
                            uri: bp.location.uri,
                            lines: []
                        };
                        map.set(bp.location.uri.toString(), dto);
                        dtos.push(dto);
                    }
                    dto.lines.push({
                        id: bp.id,
                        enabled: bp.enabled,
                        condition: bp.condition,
                        hitCondition: bp.hitCondition,
                        logMessage: bp.logMessage,
                        line: bp.location.range.start.line,
                        character: bp.location.range.start.character
                    });
                }
                else if (bp instanceof extHostTypes_1.FunctionBreakpoint) {
                    dtos.push({
                        type: 'function',
                        id: bp.id,
                        enabled: bp.enabled,
                        hitCondition: bp.hitCondition,
                        logMessage: bp.logMessage,
                        condition: bp.condition,
                        functionName: bp.functionName
                    });
                }
            }
            // send DTOs to VS Code
            return this._debugServiceProxy.$registerBreakpoints(dtos);
        }
        removeBreakpoints(breakpoints0) {
            // remove from array
            const breakpoints = breakpoints0.filter(b => this._breakpoints.delete(b.id));
            // send notification
            this.fireBreakpointChanges([], breakpoints, []);
            // unregister with VS Code
            const ids = breakpoints.filter(bp => bp instanceof extHostTypes_1.SourceBreakpoint).map(bp => bp.id);
            const fids = breakpoints.filter(bp => bp instanceof extHostTypes_1.FunctionBreakpoint).map(bp => bp.id);
            const dids = breakpoints.filter(bp => bp instanceof extHostTypes_1.DataBreakpoint).map(bp => bp.id);
            return this._debugServiceProxy.$unregisterBreakpoints(ids, fids, dids);
        }
        startDebugging(folder, nameOrConfig, options) {
            return this._debugServiceProxy.$startDebugging(folder ? folder.uri : undefined, nameOrConfig, {
                parentSessionID: options.parentSession ? options.parentSession.id : undefined,
                lifecycleManagedByParent: options.lifecycleManagedByParent,
                repl: options.consoleMode === extHostTypes_1.DebugConsoleMode.MergeWithParent ? 'mergeWithParent' : 'separate',
                noDebug: options.noDebug,
                compact: options.compact,
                suppressSaveBeforeStart: options.suppressSaveBeforeStart,
                // Check debugUI for back-compat, #147264
                suppressDebugStatusbar: options.suppressDebugStatusbar ?? options.debugUI?.simple,
                suppressDebugToolbar: options.suppressDebugToolbar ?? options.debugUI?.simple,
                suppressDebugView: options.suppressDebugView ?? options.debugUI?.simple,
            });
        }
        stopDebugging(session) {
            return this._debugServiceProxy.$stopDebugging(session ? session.id : undefined);
        }
        registerDebugConfigurationProvider(type, provider, trigger) {
            if (!provider) {
                return new extHostTypes_1.Disposable(() => { });
            }
            const handle = this._configProviderHandleCounter++;
            this._configProviders.push({ type, handle, provider });
            this._debugServiceProxy.$registerDebugConfigurationProvider(type, trigger, !!provider.provideDebugConfigurations, !!provider.resolveDebugConfiguration, !!provider.resolveDebugConfigurationWithSubstitutedVariables, handle);
            return new extHostTypes_1.Disposable(() => {
                this._configProviders = this._configProviders.filter(p => p.provider !== provider); // remove
                this._debugServiceProxy.$unregisterDebugConfigurationProvider(handle);
            });
        }
        registerDebugAdapterDescriptorFactory(extension, type, factory) {
            if (!factory) {
                return new extHostTypes_1.Disposable(() => { });
            }
            // a DebugAdapterDescriptorFactory can only be registered in the extension that contributes the debugger
            if (!this.definesDebugType(extension, type)) {
                throw new Error(`a DebugAdapterDescriptorFactory can only be registered from the extension that defines the '${type}' debugger.`);
            }
            // make sure that only one factory for this type is registered
            if (this.getAdapterDescriptorFactoryByType(type)) {
                throw new Error(`a DebugAdapterDescriptorFactory can only be registered once per a type.`);
            }
            const handle = this._adapterFactoryHandleCounter++;
            this._adapterFactories.push({ type, handle, factory });
            this._debugServiceProxy.$registerDebugAdapterDescriptorFactory(type, handle);
            return new extHostTypes_1.Disposable(() => {
                this._adapterFactories = this._adapterFactories.filter(p => p.factory !== factory); // remove
                this._debugServiceProxy.$unregisterDebugAdapterDescriptorFactory(handle);
            });
        }
        registerDebugAdapterTrackerFactory(type, factory) {
            if (!factory) {
                return new extHostTypes_1.Disposable(() => { });
            }
            const handle = this._trackerFactoryHandleCounter++;
            this._trackerFactories.push({ type, handle, factory });
            return new extHostTypes_1.Disposable(() => {
                this._trackerFactories = this._trackerFactories.filter(p => p.factory !== factory); // remove
            });
        }
        // RPC methods (ExtHostDebugServiceShape)
        async $runInTerminal(args, sessionId) {
            return Promise.resolve(undefined);
        }
        async $substituteVariables(folderUri, config) {
            let ws;
            const folder = await this.getFolder(folderUri);
            if (folder) {
                ws = {
                    uri: folder.uri,
                    name: folder.name,
                    index: folder.index,
                    toResource: () => {
                        throw new Error('Not implemented');
                    }
                };
            }
            const variableResolver = await this._variableResolver.getResolver();
            return variableResolver.resolveAnyAsync(ws, config);
        }
        createDebugAdapter(adapter, session) {
            if (adapter.type === 'implementation') {
                return new DirectDebugAdapter(adapter.implementation);
            }
            return undefined;
        }
        createSignService() {
            return undefined;
        }
        async $startDASession(debugAdapterHandle, sessionDto) {
            const mythis = this;
            const session = await this.getSession(sessionDto);
            return this.getAdapterDescriptor(this.getAdapterDescriptorFactoryByType(session.type), session).then(daDescriptor => {
                if (!daDescriptor) {
                    throw new Error(`Couldn't find a debug adapter descriptor for debug type '${session.type}' (extension might have failed to activate)`);
                }
                const adapterDescriptor = this.convertToDto(daDescriptor);
                const da = this.createDebugAdapter(adapterDescriptor, session);
                if (!da) {
                    throw new Error(`Couldn't create a debug adapter for type '${session.type}'.`);
                }
                const debugAdapter = da;
                this._debugAdapters.set(debugAdapterHandle, debugAdapter);
                return this.getDebugAdapterTrackers(session).then(tracker => {
                    if (tracker) {
                        this._debugAdaptersTrackers.set(debugAdapterHandle, tracker);
                    }
                    debugAdapter.onMessage(async (message) => {
                        if (message.type === 'request' && message.command === 'handshake') {
                            const request = message;
                            const response = {
                                type: 'response',
                                seq: 0,
                                command: request.command,
                                request_seq: request.seq,
                                success: true
                            };
                            if (!this._signService) {
                                this._signService = this.createSignService();
                            }
                            try {
                                if (this._signService) {
                                    const signature = await this._signService.sign(request.arguments.value);
                                    response.body = {
                                        signature: signature
                                    };
                                    debugAdapter.sendResponse(response);
                                }
                                else {
                                    throw new Error('no signer');
                                }
                            }
                            catch (e) {
                                response.success = false;
                                response.message = e.message;
                                debugAdapter.sendResponse(response);
                            }
                        }
                        else {
                            if (tracker && tracker.onDidSendMessage) {
                                tracker.onDidSendMessage(message);
                            }
                            // DA -> VS Code
                            message = (0, debugUtils_1.convertToVSCPaths)(message, true);
                            mythis._debugServiceProxy.$acceptDAMessage(debugAdapterHandle, message);
                        }
                    });
                    debugAdapter.onError(err => {
                        if (tracker && tracker.onError) {
                            tracker.onError(err);
                        }
                        this._debugServiceProxy.$acceptDAError(debugAdapterHandle, err.name, err.message, err.stack);
                    });
                    debugAdapter.onExit((code) => {
                        if (tracker && tracker.onExit) {
                            tracker.onExit(code ?? undefined, undefined);
                        }
                        this._debugServiceProxy.$acceptDAExit(debugAdapterHandle, code ?? undefined, undefined);
                    });
                    if (tracker && tracker.onWillStartSession) {
                        tracker.onWillStartSession();
                    }
                    return debugAdapter.startSession();
                });
            });
        }
        $sendDAMessage(debugAdapterHandle, message) {
            // VS Code -> DA
            message = (0, debugUtils_1.convertToDAPaths)(message, false);
            const tracker = this._debugAdaptersTrackers.get(debugAdapterHandle); // TODO@AW: same handle?
            if (tracker && tracker.onWillReceiveMessage) {
                tracker.onWillReceiveMessage(message);
            }
            const da = this._debugAdapters.get(debugAdapterHandle);
            da?.sendMessage(message);
        }
        $stopDASession(debugAdapterHandle) {
            const tracker = this._debugAdaptersTrackers.get(debugAdapterHandle);
            this._debugAdaptersTrackers.delete(debugAdapterHandle);
            if (tracker && tracker.onWillStopSession) {
                tracker.onWillStopSession();
            }
            const da = this._debugAdapters.get(debugAdapterHandle);
            this._debugAdapters.delete(debugAdapterHandle);
            if (da) {
                return da.stopSession();
            }
            else {
                return Promise.resolve(void 0);
            }
        }
        $acceptBreakpointsDelta(delta) {
            const a = [];
            const r = [];
            const c = [];
            if (delta.added) {
                for (const bpd of delta.added) {
                    const id = bpd.id;
                    if (id && !this._breakpoints.has(id)) {
                        let bp;
                        if (bpd.type === 'function') {
                            bp = new extHostTypes_1.FunctionBreakpoint(bpd.functionName, bpd.enabled, bpd.condition, bpd.hitCondition, bpd.logMessage);
                        }
                        else if (bpd.type === 'data') {
                            bp = new extHostTypes_1.DataBreakpoint(bpd.label, bpd.dataId, bpd.canPersist, bpd.enabled, bpd.hitCondition, bpd.condition, bpd.logMessage);
                        }
                        else {
                            const uri = uri_1.URI.revive(bpd.uri);
                            bp = new extHostTypes_1.SourceBreakpoint(new extHostTypes_1.Location(uri, new extHostTypes_1.Position(bpd.line, bpd.character)), bpd.enabled, bpd.condition, bpd.hitCondition, bpd.logMessage);
                        }
                        (0, extHostTypes_1.setBreakpointId)(bp, id);
                        this._breakpoints.set(id, bp);
                        a.push(bp);
                    }
                }
            }
            if (delta.removed) {
                for (const id of delta.removed) {
                    const bp = this._breakpoints.get(id);
                    if (bp) {
                        this._breakpoints.delete(id);
                        r.push(bp);
                    }
                }
            }
            if (delta.changed) {
                for (const bpd of delta.changed) {
                    if (bpd.id) {
                        const bp = this._breakpoints.get(bpd.id);
                        if (bp) {
                            if (bp instanceof extHostTypes_1.FunctionBreakpoint && bpd.type === 'function') {
                                const fbp = bp;
                                fbp.enabled = bpd.enabled;
                                fbp.condition = bpd.condition;
                                fbp.hitCondition = bpd.hitCondition;
                                fbp.logMessage = bpd.logMessage;
                                fbp.functionName = bpd.functionName;
                            }
                            else if (bp instanceof extHostTypes_1.SourceBreakpoint && bpd.type === 'source') {
                                const sbp = bp;
                                sbp.enabled = bpd.enabled;
                                sbp.condition = bpd.condition;
                                sbp.hitCondition = bpd.hitCondition;
                                sbp.logMessage = bpd.logMessage;
                                sbp.location = new extHostTypes_1.Location(uri_1.URI.revive(bpd.uri), new extHostTypes_1.Position(bpd.line, bpd.character));
                            }
                            c.push(bp);
                        }
                    }
                }
            }
            this.fireBreakpointChanges(a, r, c);
        }
        async $acceptStackFrameFocus(focusDto) {
            let focus;
            const session = focusDto.sessionId ? await this.getSession(focusDto.sessionId) : undefined;
            if (!session) {
                throw new Error('no DebugSession found for debug focus context');
            }
            if (focusDto.kind === 'thread') {
                focus = new extHostTypes_1.ThreadFocus(session, focusDto.threadId);
            }
            else {
                focus = new extHostTypes_1.StackFrameFocus(session, focusDto.threadId, focusDto.frameId);
            }
            this._stackFrameFocus = focus;
            this._onDidChangeStackFrameFocus.fire(this._stackFrameFocus);
        }
        $provideDebugConfigurations(configProviderHandle, folderUri, token) {
            return (0, async_1.asPromise)(async () => {
                const provider = this.getConfigProviderByHandle(configProviderHandle);
                if (!provider) {
                    throw new Error('no DebugConfigurationProvider found');
                }
                if (!provider.provideDebugConfigurations) {
                    throw new Error('DebugConfigurationProvider has no method provideDebugConfigurations');
                }
                const folder = await this.getFolder(folderUri);
                return provider.provideDebugConfigurations(folder, token);
            }).then(debugConfigurations => {
                if (!debugConfigurations) {
                    throw new Error('nothing returned from DebugConfigurationProvider.provideDebugConfigurations');
                }
                return debugConfigurations;
            });
        }
        $resolveDebugConfiguration(configProviderHandle, folderUri, debugConfiguration, token) {
            return (0, async_1.asPromise)(async () => {
                const provider = this.getConfigProviderByHandle(configProviderHandle);
                if (!provider) {
                    throw new Error('no DebugConfigurationProvider found');
                }
                if (!provider.resolveDebugConfiguration) {
                    throw new Error('DebugConfigurationProvider has no method resolveDebugConfiguration');
                }
                const folder = await this.getFolder(folderUri);
                return provider.resolveDebugConfiguration(folder, debugConfiguration, token);
            });
        }
        $resolveDebugConfigurationWithSubstitutedVariables(configProviderHandle, folderUri, debugConfiguration, token) {
            return (0, async_1.asPromise)(async () => {
                const provider = this.getConfigProviderByHandle(configProviderHandle);
                if (!provider) {
                    throw new Error('no DebugConfigurationProvider found');
                }
                if (!provider.resolveDebugConfigurationWithSubstitutedVariables) {
                    throw new Error('DebugConfigurationProvider has no method resolveDebugConfigurationWithSubstitutedVariables');
                }
                const folder = await this.getFolder(folderUri);
                return provider.resolveDebugConfigurationWithSubstitutedVariables(folder, debugConfiguration, token);
            });
        }
        async $provideDebugAdapter(adapterFactoryHandle, sessionDto) {
            const adapterDescriptorFactory = this.getAdapterDescriptorFactoryByHandle(adapterFactoryHandle);
            if (!adapterDescriptorFactory) {
                return Promise.reject(new Error('no adapter descriptor factory found for handle'));
            }
            const session = await this.getSession(sessionDto);
            return this.getAdapterDescriptor(adapterDescriptorFactory, session).then(adapterDescriptor => {
                if (!adapterDescriptor) {
                    throw new Error(`Couldn't find a debug adapter descriptor for debug type '${session.type}'`);
                }
                return this.convertToDto(adapterDescriptor);
            });
        }
        async $acceptDebugSessionStarted(sessionDto) {
            const session = await this.getSession(sessionDto);
            this._onDidStartDebugSession.fire(session);
        }
        async $acceptDebugSessionTerminated(sessionDto) {
            const session = await this.getSession(sessionDto);
            if (session) {
                this._onDidTerminateDebugSession.fire(session);
                this._debugSessions.delete(session.id);
            }
        }
        async $acceptDebugSessionActiveChanged(sessionDto) {
            this._activeDebugSession = sessionDto ? await this.getSession(sessionDto) : undefined;
            this._onDidChangeActiveDebugSession.fire(this._activeDebugSession);
        }
        async $acceptDebugSessionNameChanged(sessionDto, name) {
            const session = await this.getSession(sessionDto);
            session?._acceptNameChanged(name);
        }
        async $acceptDebugSessionCustomEvent(sessionDto, event) {
            const session = await this.getSession(sessionDto);
            const ee = {
                session: session,
                event: event.event,
                body: event.body
            };
            this._onDidReceiveDebugSessionCustomEvent.fire(ee);
        }
        // private & dto helpers
        convertToDto(x) {
            if (x instanceof extHostTypes_1.DebugAdapterExecutable) {
                return {
                    type: 'executable',
                    command: x.command,
                    args: x.args,
                    options: x.options
                };
            }
            else if (x instanceof extHostTypes_1.DebugAdapterServer) {
                return {
                    type: 'server',
                    port: x.port,
                    host: x.host
                };
            }
            else if (x instanceof extHostTypes_1.DebugAdapterNamedPipeServer) {
                return {
                    type: 'pipeServer',
                    path: x.path
                };
            }
            else if (x instanceof extHostTypes_1.DebugAdapterInlineImplementation) {
                return {
                    type: 'implementation',
                    implementation: x.implementation
                };
            }
            else {
                throw new Error('convertToDto unexpected type');
            }
        }
        getAdapterDescriptorFactoryByType(type) {
            const results = this._adapterFactories.filter(p => p.type === type);
            if (results.length > 0) {
                return results[0].factory;
            }
            return undefined;
        }
        getAdapterDescriptorFactoryByHandle(handle) {
            const results = this._adapterFactories.filter(p => p.handle === handle);
            if (results.length > 0) {
                return results[0].factory;
            }
            return undefined;
        }
        getConfigProviderByHandle(handle) {
            const results = this._configProviders.filter(p => p.handle === handle);
            if (results.length > 0) {
                return results[0].provider;
            }
            return undefined;
        }
        definesDebugType(ed, type) {
            if (ed.contributes) {
                const debuggers = ed.contributes['debuggers'];
                if (debuggers && debuggers.length > 0) {
                    for (const dbg of debuggers) {
                        // only debugger contributions with a "label" are considered a "defining" debugger contribution
                        if (dbg.label && dbg.type) {
                            if (dbg.type === type) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }
        getDebugAdapterTrackers(session) {
            const config = session.configuration;
            const type = config.type;
            const promises = this._trackerFactories
                .filter(tuple => tuple.type === type || tuple.type === '*')
                .map(tuple => (0, async_1.asPromise)(() => tuple.factory.createDebugAdapterTracker(session)).then(p => p, err => null));
            return Promise.race([
                Promise.all(promises).then(result => {
                    const trackers = result.filter(t => !!t); // filter null
                    if (trackers.length > 0) {
                        return new MultiTracker(trackers);
                    }
                    return undefined;
                }),
                new Promise(resolve => setTimeout(() => resolve(undefined), 1000)),
            ]).catch(err => {
                // ignore errors
                return undefined;
            });
        }
        async getAdapterDescriptor(adapterDescriptorFactory, session) {
            // a "debugServer" attribute in the launch config takes precedence
            const serverPort = session.configuration.debugServer;
            if (typeof serverPort === 'number') {
                return Promise.resolve(new extHostTypes_1.DebugAdapterServer(serverPort));
            }
            if (adapterDescriptorFactory) {
                const extensionRegistry = await this._extensionService.getExtensionRegistry();
                return (0, async_1.asPromise)(() => adapterDescriptorFactory.createDebugAdapterDescriptor(session, this.daExecutableFromPackage(session, extensionRegistry))).then(daDescriptor => {
                    if (daDescriptor) {
                        return daDescriptor;
                    }
                    return undefined;
                });
            }
            // fallback: use executable information from package.json
            const extensionRegistry = await this._extensionService.getExtensionRegistry();
            return Promise.resolve(this.daExecutableFromPackage(session, extensionRegistry));
        }
        daExecutableFromPackage(session, extensionRegistry) {
            return undefined;
        }
        fireBreakpointChanges(added, removed, changed) {
            if (added.length > 0 || removed.length > 0 || changed.length > 0) {
                this._onDidChangeBreakpoints.fire(Object.freeze({
                    added,
                    removed,
                    changed,
                }));
            }
        }
        async getSession(dto) {
            if (dto) {
                if (typeof dto === 'string') {
                    const ds = this._debugSessions.get(dto);
                    if (ds) {
                        return ds;
                    }
                }
                else {
                    let ds = this._debugSessions.get(dto.id);
                    if (!ds) {
                        const folder = await this.getFolder(dto.folderUri);
                        const parent = dto.parent ? this._debugSessions.get(dto.parent) : undefined;
                        ds = new ExtHostDebugSession(this._debugServiceProxy, dto.id, dto.type, dto.name, folder, dto.configuration, parent);
                        this._debugSessions.set(ds.id, ds);
                        this._debugServiceProxy.$sessionCached(ds.id);
                    }
                    return ds;
                }
            }
            throw new Error('cannot find session');
        }
        getFolder(_folderUri) {
            if (_folderUri) {
                const folderURI = uri_1.URI.revive(_folderUri);
                return this._workspaceService.resolveWorkspaceFolder(folderURI);
            }
            return Promise.resolve(undefined);
        }
    };
    exports.ExtHostDebugServiceBase = ExtHostDebugServiceBase;
    exports.ExtHostDebugServiceBase = ExtHostDebugServiceBase = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostWorkspace_1.IExtHostWorkspace),
        __param(2, extHostExtensionService_1.IExtHostExtensionService),
        __param(3, extHostConfiguration_1.IExtHostConfiguration),
        __param(4, extHostEditorTabs_1.IExtHostEditorTabs),
        __param(5, extHostVariableResolverService_1.IExtHostVariableResolverProvider)
    ], ExtHostDebugServiceBase);
    class ExtHostDebugSession {
        constructor(_debugServiceProxy, _id, _type, _name, _workspaceFolder, _configuration, _parentSession) {
            this._debugServiceProxy = _debugServiceProxy;
            this._id = _id;
            this._type = _type;
            this._name = _name;
            this._workspaceFolder = _workspaceFolder;
            this._configuration = _configuration;
            this._parentSession = _parentSession;
        }
        get id() {
            return this._id;
        }
        get type() {
            return this._type;
        }
        get name() {
            return this._name;
        }
        set name(name) {
            this._name = name;
            this._debugServiceProxy.$setDebugSessionName(this._id, name);
        }
        get parentSession() {
            return this._parentSession;
        }
        _acceptNameChanged(name) {
            this._name = name;
        }
        get workspaceFolder() {
            return this._workspaceFolder;
        }
        get configuration() {
            return this._configuration;
        }
        customRequest(command, args) {
            return this._debugServiceProxy.$customDebugAdapterRequest(this._id, command, args);
        }
        getDebugProtocolBreakpoint(breakpoint) {
            return this._debugServiceProxy.$getDebugProtocolBreakpoint(this._id, breakpoint.id);
        }
    }
    exports.ExtHostDebugSession = ExtHostDebugSession;
    class ExtHostDebugConsole {
        constructor(proxy) {
            this.value = Object.freeze({
                append(value) {
                    proxy.$appendDebugConsole(value);
                },
                appendLine(value) {
                    this.append(value + '\n');
                }
            });
        }
    }
    exports.ExtHostDebugConsole = ExtHostDebugConsole;
    class MultiTracker {
        constructor(trackers) {
            this.trackers = trackers;
        }
        onWillStartSession() {
            this.trackers.forEach(t => t.onWillStartSession ? t.onWillStartSession() : undefined);
        }
        onWillReceiveMessage(message) {
            this.trackers.forEach(t => t.onWillReceiveMessage ? t.onWillReceiveMessage(message) : undefined);
        }
        onDidSendMessage(message) {
            this.trackers.forEach(t => t.onDidSendMessage ? t.onDidSendMessage(message) : undefined);
        }
        onWillStopSession() {
            this.trackers.forEach(t => t.onWillStopSession ? t.onWillStopSession() : undefined);
        }
        onError(error) {
            this.trackers.forEach(t => t.onError ? t.onError(error) : undefined);
        }
        onExit(code, signal) {
            this.trackers.forEach(t => t.onExit ? t.onExit(code, signal) : undefined);
        }
    }
    /*
     * Call directly into a debug adapter implementation
     */
    class DirectDebugAdapter extends abstractDebugAdapter_1.AbstractDebugAdapter {
        constructor(implementation) {
            super();
            this.implementation = implementation;
            implementation.onDidSendMessage((message) => {
                this.acceptMessage(message);
            });
        }
        startSession() {
            return Promise.resolve(undefined);
        }
        sendMessage(message) {
            this.implementation.handleMessage(message);
        }
        stopSession() {
            this.implementation.dispose();
            return Promise.resolve(undefined);
        }
    }
    let WorkerExtHostDebugService = class WorkerExtHostDebugService extends ExtHostDebugServiceBase {
        constructor(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver) {
            super(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver);
        }
    };
    exports.WorkerExtHostDebugService = WorkerExtHostDebugService;
    exports.WorkerExtHostDebugService = WorkerExtHostDebugService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostWorkspace_1.IExtHostWorkspace),
        __param(2, extHostExtensionService_1.IExtHostExtensionService),
        __param(3, extHostConfiguration_1.IExtHostConfiguration),
        __param(4, extHostEditorTabs_1.IExtHostEditorTabs),
        __param(5, extHostVariableResolverService_1.IExtHostVariableResolverProvider)
    ], WorkerExtHostDebugService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERlYnVnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3REZWJ1Z1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJuRixRQUFBLG9CQUFvQixHQUFHLElBQUEsK0JBQWUsRUFBdUIsc0JBQXNCLENBQUMsQ0FBQztJQTJCM0YsSUFBZSx1QkFBdUIsR0FBdEMsTUFBZSx1QkFBdUI7UUFpQjVDLElBQUksc0JBQXNCLEtBQWlDLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFHdkcsSUFBSSwwQkFBMEIsS0FBaUMsT0FBTyxJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUcvRyxJQUFJLDZCQUE2QixLQUE2QyxPQUFPLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBR2pJLElBQUksa0JBQWtCLEtBQXNDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUc5RixJQUFJLG1DQUFtQyxLQUE0QyxPQUFPLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRzVJLElBQUksa0JBQWtCLEtBQTBCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFjeEYsWUFDcUIsaUJBQXFDLEVBQ3RDLGlCQUE4QyxFQUN2QyxpQkFBbUQsRUFDdEQscUJBQXNELEVBQ3pELFdBQXlDLEVBQzNCLGlCQUEyRDtZQUpoRSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQy9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBMEI7WUFDNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUMvQyxn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