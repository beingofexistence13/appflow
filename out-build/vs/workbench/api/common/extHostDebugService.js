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
    exports.$tcc = exports.$scc = exports.$rcc = exports.$qcc = exports.$pcc = void 0;
    exports.$pcc = (0, instantiation_1.$Bh)('IExtHostDebugService');
    let $qcc = class $qcc {
        get onDidStartDebugSession() { return this.m.event; }
        get onDidTerminateDebugSession() { return this.n.event; }
        get onDidChangeActiveDebugSession() { return this.o.event; }
        get activeDebugSession() { return this.q; }
        get onDidReceiveDebugSessionCustomEvent() { return this.u.event; }
        get activeDebugConsole() { return this.v.value; }
        constructor(extHostRpcService, E, F, G, H, I) {
            this.E = E;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.l = new Map();
            this.d = 0;
            this.f = [];
            this.g = 0;
            this.h = [];
            this.i = 0;
            this.j = [];
            this.B = new Map();
            this.C = new Map();
            this.m = new event_1.$fd();
            this.n = new event_1.$fd();
            this.o = new event_1.$fd();
            this.u = new event_1.$fd();
            this.k = extHostRpcService.getProxy(extHost_protocol_1.$1J.MainThreadDebugService);
            this.y = new event_1.$fd();
            this.A = new event_1.$fd();
            this.v = new $scc(this.k);
            this.w = new Map();
            this.F.getExtensionRegistry().then((extensionRegistry) => {
                extensionRegistry.onDidChange(_ => {
                    this.J(extensionRegistry);
                });
                this.J(extensionRegistry);
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
        J(extensionRegistry) {
            const debugTypes = [];
            for (const ed of extensionRegistry.getAllExtensionDescriptions()) {
                if (ed.contributes) {
                    const debuggers = ed.contributes['debuggers'];
                    if (debuggers && debuggers.length > 0) {
                        for (const dbg of debuggers) {
                            if ((0, debugUtils_1.$mF)(dbg)) {
                                debugTypes.push(dbg.type);
                            }
                        }
                    }
                }
            }
            this.k.$registerDebugTypes(debugTypes);
        }
        // extension debug API
        get stackFrameFocus() {
            return this.z;
        }
        get onDidChangeStackFrameFocus() {
            return this.A.event;
        }
        get onDidChangeBreakpoints() {
            return this.y.event;
        }
        get breakpoints() {
            const result = [];
            this.w.forEach(bp => result.push(bp));
            return result;
        }
        addBreakpoints(breakpoints0) {
            // filter only new breakpoints
            const breakpoints = breakpoints0.filter(bp => {
                const id = bp.id;
                if (!this.w.has(id)) {
                    this.w.set(id, bp);
                    return true;
                }
                return false;
            });
            // send notification for added breakpoints
            this.U(breakpoints, [], []);
            // convert added breakpoints to DTOs
            const dtos = [];
            const map = new Map();
            for (const bp of breakpoints) {
                if (bp instanceof extHostTypes_1.$2K) {
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
                else if (bp instanceof extHostTypes_1.$3K) {
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
            return this.k.$registerBreakpoints(dtos);
        }
        removeBreakpoints(breakpoints0) {
            // remove from array
            const breakpoints = breakpoints0.filter(b => this.w.delete(b.id));
            // send notification
            this.U([], breakpoints, []);
            // unregister with VS Code
            const ids = breakpoints.filter(bp => bp instanceof extHostTypes_1.$2K).map(bp => bp.id);
            const fids = breakpoints.filter(bp => bp instanceof extHostTypes_1.$3K).map(bp => bp.id);
            const dids = breakpoints.filter(bp => bp instanceof extHostTypes_1.$4K).map(bp => bp.id);
            return this.k.$unregisterBreakpoints(ids, fids, dids);
        }
        startDebugging(folder, nameOrConfig, options) {
            return this.k.$startDebugging(folder ? folder.uri : undefined, nameOrConfig, {
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
            return this.k.$stopDebugging(session ? session.id : undefined);
        }
        registerDebugConfigurationProvider(type, provider, trigger) {
            if (!provider) {
                return new extHostTypes_1.$3J(() => { });
            }
            const handle = this.d++;
            this.f.push({ type, handle, provider });
            this.k.$registerDebugConfigurationProvider(type, trigger, !!provider.provideDebugConfigurations, !!provider.resolveDebugConfiguration, !!provider.resolveDebugConfigurationWithSubstitutedVariables, handle);
            return new extHostTypes_1.$3J(() => {
                this.f = this.f.filter(p => p.provider !== provider); // remove
                this.k.$unregisterDebugConfigurationProvider(handle);
            });
        }
        registerDebugAdapterDescriptorFactory(extension, type, factory) {
            if (!factory) {
                return new extHostTypes_1.$3J(() => { });
            }
            // a DebugAdapterDescriptorFactory can only be registered in the extension that contributes the debugger
            if (!this.Q(extension, type)) {
                throw new Error(`a DebugAdapterDescriptorFactory can only be registered from the extension that defines the '${type}' debugger.`);
            }
            // make sure that only one factory for this type is registered
            if (this.N(type)) {
                throw new Error(`a DebugAdapterDescriptorFactory can only be registered once per a type.`);
            }
            const handle = this.g++;
            this.h.push({ type, handle, factory });
            this.k.$registerDebugAdapterDescriptorFactory(type, handle);
            return new extHostTypes_1.$3J(() => {
                this.h = this.h.filter(p => p.factory !== factory); // remove
                this.k.$unregisterDebugAdapterDescriptorFactory(handle);
            });
        }
        registerDebugAdapterTrackerFactory(type, factory) {
            if (!factory) {
                return new extHostTypes_1.$3J(() => { });
            }
            const handle = this.i++;
            this.j.push({ type, handle, factory });
            return new extHostTypes_1.$3J(() => {
                this.j = this.j.filter(p => p.factory !== factory); // remove
            });
        }
        // RPC methods (ExtHostDebugServiceShape)
        async $runInTerminal(args, sessionId) {
            return Promise.resolve(undefined);
        }
        async $substituteVariables(folderUri, config) {
            let ws;
            const folder = await this.W(folderUri);
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
            const variableResolver = await this.I.getResolver();
            return variableResolver.resolveAnyAsync(ws, config);
        }
        K(adapter, session) {
            if (adapter.type === 'implementation') {
                return new DirectDebugAdapter(adapter.implementation);
            }
            return undefined;
        }
        L() {
            return undefined;
        }
        async $startDASession(debugAdapterHandle, sessionDto) {
            const mythis = this;
            const session = await this.V(sessionDto);
            return this.S(this.N(session.type), session).then(daDescriptor => {
                if (!daDescriptor) {
                    throw new Error(`Couldn't find a debug adapter descriptor for debug type '${session.type}' (extension might have failed to activate)`);
                }
                const adapterDescriptor = this.M(daDescriptor);
                const da = this.K(adapterDescriptor, session);
                if (!da) {
                    throw new Error(`Couldn't create a debug adapter for type '${session.type}'.`);
                }
                const debugAdapter = da;
                this.B.set(debugAdapterHandle, debugAdapter);
                return this.R(session).then(tracker => {
                    if (tracker) {
                        this.C.set(debugAdapterHandle, tracker);
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
                            if (!this.D) {
                                this.D = this.L();
                            }
                            try {
                                if (this.D) {
                                    const signature = await this.D.sign(request.arguments.value);
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
                            message = (0, debugUtils_1.$rF)(message, true);
                            mythis.k.$acceptDAMessage(debugAdapterHandle, message);
                        }
                    });
                    debugAdapter.onError(err => {
                        if (tracker && tracker.onError) {
                            tracker.onError(err);
                        }
                        this.k.$acceptDAError(debugAdapterHandle, err.name, err.message, err.stack);
                    });
                    debugAdapter.onExit((code) => {
                        if (tracker && tracker.onExit) {
                            tracker.onExit(code ?? undefined, undefined);
                        }
                        this.k.$acceptDAExit(debugAdapterHandle, code ?? undefined, undefined);
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
            message = (0, debugUtils_1.$qF)(message, false);
            const tracker = this.C.get(debugAdapterHandle); // TODO@AW: same handle?
            if (tracker && tracker.onWillReceiveMessage) {
                tracker.onWillReceiveMessage(message);
            }
            const da = this.B.get(debugAdapterHandle);
            da?.sendMessage(message);
        }
        $stopDASession(debugAdapterHandle) {
            const tracker = this.C.get(debugAdapterHandle);
            this.C.delete(debugAdapterHandle);
            if (tracker && tracker.onWillStopSession) {
                tracker.onWillStopSession();
            }
            const da = this.B.get(debugAdapterHandle);
            this.B.delete(debugAdapterHandle);
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
                    if (id && !this.w.has(id)) {
                        let bp;
                        if (bpd.type === 'function') {
                            bp = new extHostTypes_1.$3K(bpd.functionName, bpd.enabled, bpd.condition, bpd.hitCondition, bpd.logMessage);
                        }
                        else if (bpd.type === 'data') {
                            bp = new extHostTypes_1.$4K(bpd.label, bpd.dataId, bpd.canPersist, bpd.enabled, bpd.hitCondition, bpd.condition, bpd.logMessage);
                        }
                        else {
                            const uri = uri_1.URI.revive(bpd.uri);
                            bp = new extHostTypes_1.$2K(new extHostTypes_1.$cK(uri, new extHostTypes_1.$4J(bpd.line, bpd.character)), bpd.enabled, bpd.condition, bpd.hitCondition, bpd.logMessage);
                        }
                        (0, extHostTypes_1.$ZK)(bp, id);
                        this.w.set(id, bp);
                        a.push(bp);
                    }
                }
            }
            if (delta.removed) {
                for (const id of delta.removed) {
                    const bp = this.w.get(id);
                    if (bp) {
                        this.w.delete(id);
                        r.push(bp);
                    }
                }
            }
            if (delta.changed) {
                for (const bpd of delta.changed) {
                    if (bpd.id) {
                        const bp = this.w.get(bpd.id);
                        if (bp) {
                            if (bp instanceof extHostTypes_1.$3K && bpd.type === 'function') {
                                const fbp = bp;
                                fbp.enabled = bpd.enabled;
                                fbp.condition = bpd.condition;
                                fbp.hitCondition = bpd.hitCondition;
                                fbp.logMessage = bpd.logMessage;
                                fbp.functionName = bpd.functionName;
                            }
                            else if (bp instanceof extHostTypes_1.$2K && bpd.type === 'source') {
                                const sbp = bp;
                                sbp.enabled = bpd.enabled;
                                sbp.condition = bpd.condition;
                                sbp.hitCondition = bpd.hitCondition;
                                sbp.logMessage = bpd.logMessage;
                                sbp.location = new extHostTypes_1.$cK(uri_1.URI.revive(bpd.uri), new extHostTypes_1.$4J(bpd.line, bpd.character));
                            }
                            c.push(bp);
                        }
                    }
                }
            }
            this.U(a, r, c);
        }
        async $acceptStackFrameFocus(focusDto) {
            let focus;
            const session = focusDto.sessionId ? await this.V(focusDto.sessionId) : undefined;
            if (!session) {
                throw new Error('no DebugSession found for debug focus context');
            }
            if (focusDto.kind === 'thread') {
                focus = new extHostTypes_1.$0K(session, focusDto.threadId);
            }
            else {
                focus = new extHostTypes_1.$9K(session, focusDto.threadId, focusDto.frameId);
            }
            this.z = focus;
            this.A.fire(this.z);
        }
        $provideDebugConfigurations(configProviderHandle, folderUri, token) {
            return (0, async_1.$zg)(async () => {
                const provider = this.P(configProviderHandle);
                if (!provider) {
                    throw new Error('no DebugConfigurationProvider found');
                }
                if (!provider.provideDebugConfigurations) {
                    throw new Error('DebugConfigurationProvider has no method provideDebugConfigurations');
                }
                const folder = await this.W(folderUri);
                return provider.provideDebugConfigurations(folder, token);
            }).then(debugConfigurations => {
                if (!debugConfigurations) {
                    throw new Error('nothing returned from DebugConfigurationProvider.provideDebugConfigurations');
                }
                return debugConfigurations;
            });
        }
        $resolveDebugConfiguration(configProviderHandle, folderUri, debugConfiguration, token) {
            return (0, async_1.$zg)(async () => {
                const provider = this.P(configProviderHandle);
                if (!provider) {
                    throw new Error('no DebugConfigurationProvider found');
                }
                if (!provider.resolveDebugConfiguration) {
                    throw new Error('DebugConfigurationProvider has no method resolveDebugConfiguration');
                }
                const folder = await this.W(folderUri);
                return provider.resolveDebugConfiguration(folder, debugConfiguration, token);
            });
        }
        $resolveDebugConfigurationWithSubstitutedVariables(configProviderHandle, folderUri, debugConfiguration, token) {
            return (0, async_1.$zg)(async () => {
                const provider = this.P(configProviderHandle);
                if (!provider) {
                    throw new Error('no DebugConfigurationProvider found');
                }
                if (!provider.resolveDebugConfigurationWithSubstitutedVariables) {
                    throw new Error('DebugConfigurationProvider has no method resolveDebugConfigurationWithSubstitutedVariables');
                }
                const folder = await this.W(folderUri);
                return provider.resolveDebugConfigurationWithSubstitutedVariables(folder, debugConfiguration, token);
            });
        }
        async $provideDebugAdapter(adapterFactoryHandle, sessionDto) {
            const adapterDescriptorFactory = this.O(adapterFactoryHandle);
            if (!adapterDescriptorFactory) {
                return Promise.reject(new Error('no adapter descriptor factory found for handle'));
            }
            const session = await this.V(sessionDto);
            return this.S(adapterDescriptorFactory, session).then(adapterDescriptor => {
                if (!adapterDescriptor) {
                    throw new Error(`Couldn't find a debug adapter descriptor for debug type '${session.type}'`);
                }
                return this.M(adapterDescriptor);
            });
        }
        async $acceptDebugSessionStarted(sessionDto) {
            const session = await this.V(sessionDto);
            this.m.fire(session);
        }
        async $acceptDebugSessionTerminated(sessionDto) {
            const session = await this.V(sessionDto);
            if (session) {
                this.n.fire(session);
                this.l.delete(session.id);
            }
        }
        async $acceptDebugSessionActiveChanged(sessionDto) {
            this.q = sessionDto ? await this.V(sessionDto) : undefined;
            this.o.fire(this.q);
        }
        async $acceptDebugSessionNameChanged(sessionDto, name) {
            const session = await this.V(sessionDto);
            session?._acceptNameChanged(name);
        }
        async $acceptDebugSessionCustomEvent(sessionDto, event) {
            const session = await this.V(sessionDto);
            const ee = {
                session: session,
                event: event.event,
                body: event.body
            };
            this.u.fire(ee);
        }
        // private & dto helpers
        M(x) {
            if (x instanceof extHostTypes_1.$5K) {
                return {
                    type: 'executable',
                    command: x.command,
                    args: x.args,
                    options: x.options
                };
            }
            else if (x instanceof extHostTypes_1.$6K) {
                return {
                    type: 'server',
                    port: x.port,
                    host: x.host
                };
            }
            else if (x instanceof extHostTypes_1.$7K) {
                return {
                    type: 'pipeServer',
                    path: x.path
                };
            }
            else if (x instanceof extHostTypes_1.$8K) {
                return {
                    type: 'implementation',
                    implementation: x.implementation
                };
            }
            else {
                throw new Error('convertToDto unexpected type');
            }
        }
        N(type) {
            const results = this.h.filter(p => p.type === type);
            if (results.length > 0) {
                return results[0].factory;
            }
            return undefined;
        }
        O(handle) {
            const results = this.h.filter(p => p.handle === handle);
            if (results.length > 0) {
                return results[0].factory;
            }
            return undefined;
        }
        P(handle) {
            const results = this.f.filter(p => p.handle === handle);
            if (results.length > 0) {
                return results[0].provider;
            }
            return undefined;
        }
        Q(ed, type) {
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
        R(session) {
            const config = session.configuration;
            const type = config.type;
            const promises = this.j
                .filter(tuple => tuple.type === type || tuple.type === '*')
                .map(tuple => (0, async_1.$zg)(() => tuple.factory.createDebugAdapterTracker(session)).then(p => p, err => null));
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
        async S(adapterDescriptorFactory, session) {
            // a "debugServer" attribute in the launch config takes precedence
            const serverPort = session.configuration.debugServer;
            if (typeof serverPort === 'number') {
                return Promise.resolve(new extHostTypes_1.$6K(serverPort));
            }
            if (adapterDescriptorFactory) {
                const extensionRegistry = await this.F.getExtensionRegistry();
                return (0, async_1.$zg)(() => adapterDescriptorFactory.createDebugAdapterDescriptor(session, this.T(session, extensionRegistry))).then(daDescriptor => {
                    if (daDescriptor) {
                        return daDescriptor;
                    }
                    return undefined;
                });
            }
            // fallback: use executable information from package.json
            const extensionRegistry = await this.F.getExtensionRegistry();
            return Promise.resolve(this.T(session, extensionRegistry));
        }
        T(session, extensionRegistry) {
            return undefined;
        }
        U(added, removed, changed) {
            if (added.length > 0 || removed.length > 0 || changed.length > 0) {
                this.y.fire(Object.freeze({
                    added,
                    removed,
                    changed,
                }));
            }
        }
        async V(dto) {
            if (dto) {
                if (typeof dto === 'string') {
                    const ds = this.l.get(dto);
                    if (ds) {
                        return ds;
                    }
                }
                else {
                    let ds = this.l.get(dto.id);
                    if (!ds) {
                        const folder = await this.W(dto.folderUri);
                        const parent = dto.parent ? this.l.get(dto.parent) : undefined;
                        ds = new $rcc(this.k, dto.id, dto.type, dto.name, folder, dto.configuration, parent);
                        this.l.set(ds.id, ds);
                        this.k.$sessionCached(ds.id);
                    }
                    return ds;
                }
            }
            throw new Error('cannot find session');
        }
        W(_folderUri) {
            if (_folderUri) {
                const folderURI = uri_1.URI.revive(_folderUri);
                return this.E.resolveWorkspaceFolder(folderURI);
            }
            return Promise.resolve(undefined);
        }
    };
    exports.$qcc = $qcc;
    exports.$qcc = $qcc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostWorkspace_1.$jbc),
        __param(2, extHostExtensionService_1.$Rbc),
        __param(3, extHostConfiguration_1.$mbc),
        __param(4, extHostEditorTabs_1.$lcc),
        __param(5, extHostVariableResolverService_1.$ncc)
    ], $qcc);
    class $rcc {
        constructor(d, f, g, h, i, j, k) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
        }
        get id() {
            return this.f;
        }
        get type() {
            return this.g;
        }
        get name() {
            return this.h;
        }
        set name(name) {
            this.h = name;
            this.d.$setDebugSessionName(this.f, name);
        }
        get parentSession() {
            return this.k;
        }
        _acceptNameChanged(name) {
            this.h = name;
        }
        get workspaceFolder() {
            return this.i;
        }
        get configuration() {
            return this.j;
        }
        customRequest(command, args) {
            return this.d.$customDebugAdapterRequest(this.f, command, args);
        }
        getDebugProtocolBreakpoint(breakpoint) {
            return this.d.$getDebugProtocolBreakpoint(this.f, breakpoint.id);
        }
    }
    exports.$rcc = $rcc;
    class $scc {
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
    exports.$scc = $scc;
    class MultiTracker {
        constructor(d) {
            this.d = d;
        }
        onWillStartSession() {
            this.d.forEach(t => t.onWillStartSession ? t.onWillStartSession() : undefined);
        }
        onWillReceiveMessage(message) {
            this.d.forEach(t => t.onWillReceiveMessage ? t.onWillReceiveMessage(message) : undefined);
        }
        onDidSendMessage(message) {
            this.d.forEach(t => t.onDidSendMessage ? t.onDidSendMessage(message) : undefined);
        }
        onWillStopSession() {
            this.d.forEach(t => t.onWillStopSession ? t.onWillStopSession() : undefined);
        }
        onError(error) {
            this.d.forEach(t => t.onError ? t.onError(error) : undefined);
        }
        onExit(code, signal) {
            this.d.forEach(t => t.onExit ? t.onExit(code, signal) : undefined);
        }
    }
    /*
     * Call directly into a debug adapter implementation
     */
    class DirectDebugAdapter extends abstractDebugAdapter_1.$Ecb {
        constructor(h) {
            super();
            this.h = h;
            h.onDidSendMessage((message) => {
                this.acceptMessage(message);
            });
        }
        startSession() {
            return Promise.resolve(undefined);
        }
        sendMessage(message) {
            this.h.handleMessage(message);
        }
        stopSession() {
            this.h.dispose();
            return Promise.resolve(undefined);
        }
    }
    let $tcc = class $tcc extends $qcc {
        constructor(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver) {
            super(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver);
        }
    };
    exports.$tcc = $tcc;
    exports.$tcc = $tcc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostWorkspace_1.$jbc),
        __param(2, extHostExtensionService_1.$Rbc),
        __param(3, extHostConfiguration_1.$mbc),
        __param(4, extHostEditorTabs_1.$lcc),
        __param(5, extHostVariableResolverService_1.$ncc)
    ], $tcc);
});
//# sourceMappingURL=extHostDebugService.js.map