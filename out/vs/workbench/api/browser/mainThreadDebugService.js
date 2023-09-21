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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/contrib/debug/common/debug", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/severity", "vs/workbench/contrib/debug/common/abstractDebugAdapter", "vs/workbench/contrib/debug/common/debugUtils", "vs/base/common/errors"], function (require, exports, lifecycle_1, uri_1, debug_1, extHost_protocol_1, extHostCustomers_1, severity_1, abstractDebugAdapter_1, debugUtils_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadDebugService = void 0;
    let MainThreadDebugService = class MainThreadDebugService {
        constructor(extHostContext, debugService) {
            this.debugService = debugService;
            this._toDispose = new lifecycle_1.DisposableStore();
            this._debugAdaptersHandleCounter = 1;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDebugService);
            const sessionListeners = new lifecycle_1.DisposableMap();
            this._toDispose.add(sessionListeners);
            this._toDispose.add(debugService.onDidNewSession(session => {
                this._proxy.$acceptDebugSessionStarted(this.getSessionDto(session));
                const store = sessionListeners.get(session);
                store.add(session.onDidChangeName(name => {
                    this._proxy.$acceptDebugSessionNameChanged(this.getSessionDto(session), name);
                }));
            }));
            // Need to start listening early to new session events because a custom event can come while a session is initialising
            this._toDispose.add(debugService.onWillNewSession(session => {
                let store = sessionListeners.get(session);
                if (!store) {
                    store = new lifecycle_1.DisposableStore();
                    sessionListeners.set(session, store);
                }
                store.add(session.onDidCustomEvent(event => this._proxy.$acceptDebugSessionCustomEvent(this.getSessionDto(session), event)));
            }));
            this._toDispose.add(debugService.onDidEndSession(session => {
                this._proxy.$acceptDebugSessionTerminated(this.getSessionDto(session));
                this._sessions.delete(session.getId());
                for (const [handle, value] of this._debugAdapters) {
                    if (value.session === session) {
                        this._debugAdapters.delete(handle);
                        // break;
                    }
                }
                sessionListeners.deleteAndDispose(session);
            }));
            this._toDispose.add(debugService.getViewModel().onDidFocusSession(session => {
                this._proxy.$acceptDebugSessionActiveChanged(this.getSessionDto(session));
            }));
            this._toDispose.add((0, lifecycle_1.toDisposable)(() => {
                for (const [handle, da] of this._debugAdapters) {
                    da.fireError(handle, new Error('Extension host shut down'));
                }
            }));
            this._debugAdapters = new Map();
            this._debugConfigurationProviders = new Map();
            this._debugAdapterDescriptorFactories = new Map();
            this._sessions = new Set();
            this._toDispose.add(this.debugService.getViewModel().onDidFocusThread(({ thread, explicit, session }) => {
                if (session) {
                    const dto = {
                        kind: 'thread',
                        threadId: thread?.threadId,
                        sessionId: session.getId(),
                    };
                    this._proxy.$acceptStackFrameFocus(dto);
                }
            }));
            this._toDispose.add(this.debugService.getViewModel().onDidFocusStackFrame(({ stackFrame, explicit, session }) => {
                if (session) {
                    const dto = {
                        kind: 'stackFrame',
                        threadId: stackFrame?.thread.threadId,
                        frameId: stackFrame?.frameId,
                        sessionId: session.getId(),
                    };
                    this._proxy.$acceptStackFrameFocus(dto);
                }
            }));
            this.sendBreakpointsAndListen();
        }
        sendBreakpointsAndListen() {
            // set up a handler to send more
            this._toDispose.add(this.debugService.getModel().onDidChangeBreakpoints(e => {
                // Ignore session only breakpoint events since they should only reflect in the UI
                if (e && !e.sessionOnly) {
                    const delta = {};
                    if (e.added) {
                        delta.added = this.convertToDto(e.added);
                    }
                    if (e.removed) {
                        delta.removed = e.removed.map(x => x.getId());
                    }
                    if (e.changed) {
                        delta.changed = this.convertToDto(e.changed);
                    }
                    if (delta.added || delta.removed || delta.changed) {
                        this._proxy.$acceptBreakpointsDelta(delta);
                    }
                }
            }));
            // send all breakpoints
            const bps = this.debugService.getModel().getBreakpoints();
            const fbps = this.debugService.getModel().getFunctionBreakpoints();
            const dbps = this.debugService.getModel().getDataBreakpoints();
            if (bps.length > 0 || fbps.length > 0) {
                this._proxy.$acceptBreakpointsDelta({
                    added: this.convertToDto(bps).concat(this.convertToDto(fbps)).concat(this.convertToDto(dbps))
                });
            }
        }
        dispose() {
            this._toDispose.dispose();
        }
        // interface IDebugAdapterProvider
        createDebugAdapter(session) {
            const handle = this._debugAdaptersHandleCounter++;
            const da = new ExtensionHostDebugAdapter(this, handle, this._proxy, session);
            this._debugAdapters.set(handle, da);
            return da;
        }
        substituteVariables(folder, config) {
            return Promise.resolve(this._proxy.$substituteVariables(folder ? folder.uri : undefined, config));
        }
        runInTerminal(args, sessionId) {
            return this._proxy.$runInTerminal(args, sessionId);
        }
        // RPC methods (MainThreadDebugServiceShape)
        $registerDebugTypes(debugTypes) {
            this._toDispose.add(this.debugService.getAdapterManager().registerDebugAdapterFactory(debugTypes, this));
        }
        $registerBreakpoints(DTOs) {
            for (const dto of DTOs) {
                if (dto.type === 'sourceMulti') {
                    const rawbps = dto.lines.map(l => ({
                        id: l.id,
                        enabled: l.enabled,
                        lineNumber: l.line + 1,
                        column: l.character > 0 ? l.character + 1 : undefined,
                        condition: l.condition,
                        hitCondition: l.hitCondition,
                        logMessage: l.logMessage
                    }));
                    this.debugService.addBreakpoints(uri_1.URI.revive(dto.uri), rawbps);
                }
                else if (dto.type === 'function') {
                    this.debugService.addFunctionBreakpoint(dto.functionName, dto.id);
                }
                else if (dto.type === 'data') {
                    this.debugService.addDataBreakpoint(dto.label, dto.dataId, dto.canPersist, dto.accessTypes, dto.accessType);
                }
            }
            return Promise.resolve();
        }
        $unregisterBreakpoints(breakpointIds, functionBreakpointIds, dataBreakpointIds) {
            breakpointIds.forEach(id => this.debugService.removeBreakpoints(id));
            functionBreakpointIds.forEach(id => this.debugService.removeFunctionBreakpoints(id));
            dataBreakpointIds.forEach(id => this.debugService.removeDataBreakpoints(id));
            return Promise.resolve();
        }
        $registerDebugConfigurationProvider(debugType, providerTriggerKind, hasProvide, hasResolve, hasResolve2, handle) {
            const provider = {
                type: debugType,
                triggerKind: providerTriggerKind
            };
            if (hasProvide) {
                provider.provideDebugConfigurations = (folder, token) => {
                    return this._proxy.$provideDebugConfigurations(handle, folder, token);
                };
            }
            if (hasResolve) {
                provider.resolveDebugConfiguration = (folder, config, token) => {
                    return this._proxy.$resolveDebugConfiguration(handle, folder, config, token);
                };
            }
            if (hasResolve2) {
                provider.resolveDebugConfigurationWithSubstitutedVariables = (folder, config, token) => {
                    return this._proxy.$resolveDebugConfigurationWithSubstitutedVariables(handle, folder, config, token);
                };
            }
            this._debugConfigurationProviders.set(handle, provider);
            this._toDispose.add(this.debugService.getConfigurationManager().registerDebugConfigurationProvider(provider));
            return Promise.resolve(undefined);
        }
        $unregisterDebugConfigurationProvider(handle) {
            const provider = this._debugConfigurationProviders.get(handle);
            if (provider) {
                this._debugConfigurationProviders.delete(handle);
                this.debugService.getConfigurationManager().unregisterDebugConfigurationProvider(provider);
            }
        }
        $registerDebugAdapterDescriptorFactory(debugType, handle) {
            const provider = {
                type: debugType,
                createDebugAdapterDescriptor: session => {
                    return Promise.resolve(this._proxy.$provideDebugAdapter(handle, this.getSessionDto(session)));
                }
            };
            this._debugAdapterDescriptorFactories.set(handle, provider);
            this._toDispose.add(this.debugService.getAdapterManager().registerDebugAdapterDescriptorFactory(provider));
            return Promise.resolve(undefined);
        }
        $unregisterDebugAdapterDescriptorFactory(handle) {
            const provider = this._debugAdapterDescriptorFactories.get(handle);
            if (provider) {
                this._debugAdapterDescriptorFactories.delete(handle);
                this.debugService.getAdapterManager().unregisterDebugAdapterDescriptorFactory(provider);
            }
        }
        getSession(sessionId) {
            if (sessionId) {
                return this.debugService.getModel().getSession(sessionId, true);
            }
            return undefined;
        }
        async $startDebugging(folder, nameOrConfig, options) {
            const folderUri = folder ? uri_1.URI.revive(folder) : undefined;
            const launch = this.debugService.getConfigurationManager().getLaunch(folderUri);
            const parentSession = this.getSession(options.parentSessionID);
            const saveBeforeStart = typeof options.suppressSaveBeforeStart === 'boolean' ? !options.suppressSaveBeforeStart : undefined;
            const debugOptions = {
                noDebug: options.noDebug,
                parentSession,
                lifecycleManagedByParent: options.lifecycleManagedByParent,
                repl: options.repl,
                compact: options.compact,
                compoundRoot: parentSession?.compoundRoot,
                saveBeforeRestart: saveBeforeStart,
                suppressDebugStatusbar: options.suppressDebugStatusbar,
                suppressDebugToolbar: options.suppressDebugToolbar,
                suppressDebugView: options.suppressDebugView,
            };
            try {
                return this.debugService.startDebugging(launch, nameOrConfig, debugOptions, saveBeforeStart);
            }
            catch (err) {
                throw new errors_1.ErrorNoTelemetry(err && err.message ? err.message : 'cannot start debugging');
            }
        }
        $setDebugSessionName(sessionId, name) {
            const session = this.debugService.getModel().getSession(sessionId);
            session?.setName(name);
        }
        $customDebugAdapterRequest(sessionId, request, args) {
            const session = this.debugService.getModel().getSession(sessionId, true);
            if (session) {
                return session.customRequest(request, args).then(response => {
                    if (response && response.success) {
                        return response.body;
                    }
                    else {
                        return Promise.reject(new errors_1.ErrorNoTelemetry(response ? response.message : 'custom request failed'));
                    }
                });
            }
            return Promise.reject(new errors_1.ErrorNoTelemetry('debug session not found'));
        }
        $getDebugProtocolBreakpoint(sessionId, breakpoinId) {
            const session = this.debugService.getModel().getSession(sessionId, true);
            if (session) {
                return Promise.resolve(session.getDebugProtocolBreakpoint(breakpoinId));
            }
            return Promise.reject(new errors_1.ErrorNoTelemetry('debug session not found'));
        }
        $stopDebugging(sessionId) {
            if (sessionId) {
                const session = this.debugService.getModel().getSession(sessionId, true);
                if (session) {
                    return this.debugService.stopSession(session, (0, debugUtils_1.isSessionAttach)(session));
                }
            }
            else { // stop all
                return this.debugService.stopSession(undefined);
            }
            return Promise.reject(new errors_1.ErrorNoTelemetry('debug session not found'));
        }
        $appendDebugConsole(value) {
            // Use warning as severity to get the orange color for messages coming from the debug extension
            const session = this.debugService.getViewModel().focusedSession;
            session?.appendToRepl({ output: value, sev: severity_1.default.Warning });
        }
        $acceptDAMessage(handle, message) {
            this.getDebugAdapter(handle).acceptMessage((0, debugUtils_1.convertToVSCPaths)(message, false));
        }
        $acceptDAError(handle, name, message, stack) {
            this.getDebugAdapter(handle).fireError(handle, new Error(`${name}: ${message}\n${stack}`));
        }
        $acceptDAExit(handle, code, signal) {
            this.getDebugAdapter(handle).fireExit(handle, code, signal);
        }
        getDebugAdapter(handle) {
            const adapter = this._debugAdapters.get(handle);
            if (!adapter) {
                throw new Error('Invalid debug adapter');
            }
            return adapter;
        }
        // dto helpers
        $sessionCached(sessionID) {
            // remember that the EH has cached the session and we do not have to send it again
            this._sessions.add(sessionID);
        }
        getSessionDto(session) {
            if (session) {
                const sessionID = session.getId();
                if (this._sessions.has(sessionID)) {
                    return sessionID;
                }
                else {
                    // this._sessions.add(sessionID); 	// #69534: see $sessionCached above
                    return {
                        id: sessionID,
                        type: session.configuration.type,
                        name: session.name,
                        folderUri: session.root ? session.root.uri : undefined,
                        configuration: session.configuration,
                        parent: session.parentSession?.getId(),
                    };
                }
            }
            return undefined;
        }
        convertToDto(bps) {
            return bps.map(bp => {
                if ('name' in bp) {
                    const fbp = bp;
                    return {
                        type: 'function',
                        id: fbp.getId(),
                        enabled: fbp.enabled,
                        condition: fbp.condition,
                        hitCondition: fbp.hitCondition,
                        logMessage: fbp.logMessage,
                        functionName: fbp.name
                    };
                }
                else if ('dataId' in bp) {
                    const dbp = bp;
                    return {
                        type: 'data',
                        id: dbp.getId(),
                        dataId: dbp.dataId,
                        enabled: dbp.enabled,
                        condition: dbp.condition,
                        hitCondition: dbp.hitCondition,
                        logMessage: dbp.logMessage,
                        label: dbp.description,
                        canPersist: dbp.canPersist
                    };
                }
                else {
                    const sbp = bp;
                    return {
                        type: 'source',
                        id: sbp.getId(),
                        enabled: sbp.enabled,
                        condition: sbp.condition,
                        hitCondition: sbp.hitCondition,
                        logMessage: sbp.logMessage,
                        uri: sbp.uri,
                        line: sbp.lineNumber > 0 ? sbp.lineNumber - 1 : 0,
                        character: (typeof sbp.column === 'number' && sbp.column > 0) ? sbp.column - 1 : 0,
                    };
                }
            });
        }
    };
    exports.MainThreadDebugService = MainThreadDebugService;
    exports.MainThreadDebugService = MainThreadDebugService = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadDebugService),
        __param(1, debug_1.IDebugService)
    ], MainThreadDebugService);
    /**
     * DebugAdapter that communicates via extension protocol with another debug adapter.
     */
    class ExtensionHostDebugAdapter extends abstractDebugAdapter_1.AbstractDebugAdapter {
        constructor(_ds, _handle, _proxy, session) {
            super();
            this._ds = _ds;
            this._handle = _handle;
            this._proxy = _proxy;
            this.session = session;
        }
        fireError(handle, err) {
            this._onError.fire(err);
        }
        fireExit(handle, code, signal) {
            this._onExit.fire(code);
        }
        startSession() {
            return Promise.resolve(this._proxy.$startDASession(this._handle, this._ds.getSessionDto(this.session)));
        }
        sendMessage(message) {
            this._proxy.$sendDAMessage(this._handle, (0, debugUtils_1.convertToDAPaths)(message, true));
        }
        async stopSession() {
            await this.cancelPendingRequests();
            return Promise.resolve(this._proxy.$stopDASession(this._handle));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERlYnVnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkRGVidWdTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCekYsSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBc0I7UUFVbEMsWUFDQyxjQUErQixFQUNoQixZQUE0QztZQUEzQixpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQVQzQyxlQUFVLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFNUMsZ0NBQTJCLEdBQUcsQ0FBQyxDQUFDO1lBU3ZDLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFFMUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHlCQUFhLEVBQWtDLENBQUM7WUFDN0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMxRCxJQUFJLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDcEUsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM1QyxLQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztn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