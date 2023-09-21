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
    exports.$Fcb = void 0;
    let $Fcb = class $Fcb {
        constructor(extHostContext, i) {
            this.i = i;
            this.b = new lifecycle_1.$jc();
            this.d = 1;
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostDebugService);
            const sessionListeners = new lifecycle_1.$sc();
            this.b.add(sessionListeners);
            this.b.add(i.onDidNewSession(session => {
                this.a.$acceptDebugSessionStarted(this.getSessionDto(session));
                const store = sessionListeners.get(session);
                store.add(session.onDidChangeName(name => {
                    this.a.$acceptDebugSessionNameChanged(this.getSessionDto(session), name);
                }));
            }));
            // Need to start listening early to new session events because a custom event can come while a session is initialising
            this.b.add(i.onWillNewSession(session => {
                let store = sessionListeners.get(session);
                if (!store) {
                    store = new lifecycle_1.$jc();
                    sessionListeners.set(session, store);
                }
                store.add(session.onDidCustomEvent(event => this.a.$acceptDebugSessionCustomEvent(this.getSessionDto(session), event)));
            }));
            this.b.add(i.onDidEndSession(session => {
                this.a.$acceptDebugSessionTerminated(this.getSessionDto(session));
                this.h.delete(session.getId());
                for (const [handle, value] of this.c) {
                    if (value.session === session) {
                        this.c.delete(handle);
                        // break;
                    }
                }
                sessionListeners.deleteAndDispose(session);
            }));
            this.b.add(i.getViewModel().onDidFocusSession(session => {
                this.a.$acceptDebugSessionActiveChanged(this.getSessionDto(session));
            }));
            this.b.add((0, lifecycle_1.$ic)(() => {
                for (const [handle, da] of this.c) {
                    da.fireError(handle, new Error('Extension host shut down'));
                }
            }));
            this.c = new Map();
            this.f = new Map();
            this.g = new Map();
            this.h = new Set();
            this.b.add(this.i.getViewModel().onDidFocusThread(({ thread, explicit, session }) => {
                if (session) {
                    const dto = {
                        kind: 'thread',
                        threadId: thread?.threadId,
                        sessionId: session.getId(),
                    };
                    this.a.$acceptStackFrameFocus(dto);
                }
            }));
            this.b.add(this.i.getViewModel().onDidFocusStackFrame(({ stackFrame, explicit, session }) => {
                if (session) {
                    const dto = {
                        kind: 'stackFrame',
                        threadId: stackFrame?.thread.threadId,
                        frameId: stackFrame?.frameId,
                        sessionId: session.getId(),
                    };
                    this.a.$acceptStackFrameFocus(dto);
                }
            }));
            this.j();
        }
        j() {
            // set up a handler to send more
            this.b.add(this.i.getModel().onDidChangeBreakpoints(e => {
                // Ignore session only breakpoint events since they should only reflect in the UI
                if (e && !e.sessionOnly) {
                    const delta = {};
                    if (e.added) {
                        delta.added = this.n(e.added);
                    }
                    if (e.removed) {
                        delta.removed = e.removed.map(x => x.getId());
                    }
                    if (e.changed) {
                        delta.changed = this.n(e.changed);
                    }
                    if (delta.added || delta.removed || delta.changed) {
                        this.a.$acceptBreakpointsDelta(delta);
                    }
                }
            }));
            // send all breakpoints
            const bps = this.i.getModel().getBreakpoints();
            const fbps = this.i.getModel().getFunctionBreakpoints();
            const dbps = this.i.getModel().getDataBreakpoints();
            if (bps.length > 0 || fbps.length > 0) {
                this.a.$acceptBreakpointsDelta({
                    added: this.n(bps).concat(this.n(fbps)).concat(this.n(dbps))
                });
            }
        }
        dispose() {
            this.b.dispose();
        }
        // interface IDebugAdapterProvider
        createDebugAdapter(session) {
            const handle = this.d++;
            const da = new ExtensionHostDebugAdapter(this, handle, this.a, session);
            this.c.set(handle, da);
            return da;
        }
        substituteVariables(folder, config) {
            return Promise.resolve(this.a.$substituteVariables(folder ? folder.uri : undefined, config));
        }
        runInTerminal(args, sessionId) {
            return this.a.$runInTerminal(args, sessionId);
        }
        // RPC methods (MainThreadDebugServiceShape)
        $registerDebugTypes(debugTypes) {
            this.b.add(this.i.getAdapterManager().registerDebugAdapterFactory(debugTypes, this));
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
                    this.i.addBreakpoints(uri_1.URI.revive(dto.uri), rawbps);
                }
                else if (dto.type === 'function') {
                    this.i.addFunctionBreakpoint(dto.functionName, dto.id);
                }
                else if (dto.type === 'data') {
                    this.i.addDataBreakpoint(dto.label, dto.dataId, dto.canPersist, dto.accessTypes, dto.accessType);
                }
            }
            return Promise.resolve();
        }
        $unregisterBreakpoints(breakpointIds, functionBreakpointIds, dataBreakpointIds) {
            breakpointIds.forEach(id => this.i.removeBreakpoints(id));
            functionBreakpointIds.forEach(id => this.i.removeFunctionBreakpoints(id));
            dataBreakpointIds.forEach(id => this.i.removeDataBreakpoints(id));
            return Promise.resolve();
        }
        $registerDebugConfigurationProvider(debugType, providerTriggerKind, hasProvide, hasResolve, hasResolve2, handle) {
            const provider = {
                type: debugType,
                triggerKind: providerTriggerKind
            };
            if (hasProvide) {
                provider.provideDebugConfigurations = (folder, token) => {
                    return this.a.$provideDebugConfigurations(handle, folder, token);
                };
            }
            if (hasResolve) {
                provider.resolveDebugConfiguration = (folder, config, token) => {
                    return this.a.$resolveDebugConfiguration(handle, folder, config, token);
                };
            }
            if (hasResolve2) {
                provider.resolveDebugConfigurationWithSubstitutedVariables = (folder, config, token) => {
                    return this.a.$resolveDebugConfigurationWithSubstitutedVariables(handle, folder, config, token);
                };
            }
            this.f.set(handle, provider);
            this.b.add(this.i.getConfigurationManager().registerDebugConfigurationProvider(provider));
            return Promise.resolve(undefined);
        }
        $unregisterDebugConfigurationProvider(handle) {
            const provider = this.f.get(handle);
            if (provider) {
                this.f.delete(handle);
                this.i.getConfigurationManager().unregisterDebugConfigurationProvider(provider);
            }
        }
        $registerDebugAdapterDescriptorFactory(debugType, handle) {
            const provider = {
                type: debugType,
                createDebugAdapterDescriptor: session => {
                    return Promise.resolve(this.a.$provideDebugAdapter(handle, this.getSessionDto(session)));
                }
            };
            this.g.set(handle, provider);
            this.b.add(this.i.getAdapterManager().registerDebugAdapterDescriptorFactory(provider));
            return Promise.resolve(undefined);
        }
        $unregisterDebugAdapterDescriptorFactory(handle) {
            const provider = this.g.get(handle);
            if (provider) {
                this.g.delete(handle);
                this.i.getAdapterManager().unregisterDebugAdapterDescriptorFactory(provider);
            }
        }
        k(sessionId) {
            if (sessionId) {
                return this.i.getModel().getSession(sessionId, true);
            }
            return undefined;
        }
        async $startDebugging(folder, nameOrConfig, options) {
            const folderUri = folder ? uri_1.URI.revive(folder) : undefined;
            const launch = this.i.getConfigurationManager().getLaunch(folderUri);
            const parentSession = this.k(options.parentSessionID);
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
                return this.i.startDebugging(launch, nameOrConfig, debugOptions, saveBeforeStart);
            }
            catch (err) {
                throw new errors_1.$_(err && err.message ? err.message : 'cannot start debugging');
            }
        }
        $setDebugSessionName(sessionId, name) {
            const session = this.i.getModel().getSession(sessionId);
            session?.setName(name);
        }
        $customDebugAdapterRequest(sessionId, request, args) {
            const session = this.i.getModel().getSession(sessionId, true);
            if (session) {
                return session.customRequest(request, args).then(response => {
                    if (response && response.success) {
                        return response.body;
                    }
                    else {
                        return Promise.reject(new errors_1.$_(response ? response.message : 'custom request failed'));
                    }
                });
            }
            return Promise.reject(new errors_1.$_('debug session not found'));
        }
        $getDebugProtocolBreakpoint(sessionId, breakpoinId) {
            const session = this.i.getModel().getSession(sessionId, true);
            if (session) {
                return Promise.resolve(session.getDebugProtocolBreakpoint(breakpoinId));
            }
            return Promise.reject(new errors_1.$_('debug session not found'));
        }
        $stopDebugging(sessionId) {
            if (sessionId) {
                const session = this.i.getModel().getSession(sessionId, true);
                if (session) {
                    return this.i.stopSession(session, (0, debugUtils_1.$kF)(session));
                }
            }
            else { // stop all
                return this.i.stopSession(undefined);
            }
            return Promise.reject(new errors_1.$_('debug session not found'));
        }
        $appendDebugConsole(value) {
            // Use warning as severity to get the orange color for messages coming from the debug extension
            const session = this.i.getViewModel().focusedSession;
            session?.appendToRepl({ output: value, sev: severity_1.default.Warning });
        }
        $acceptDAMessage(handle, message) {
            this.m(handle).acceptMessage((0, debugUtils_1.$rF)(message, false));
        }
        $acceptDAError(handle, name, message, stack) {
            this.m(handle).fireError(handle, new Error(`${name}: ${message}\n${stack}`));
        }
        $acceptDAExit(handle, code, signal) {
            this.m(handle).fireExit(handle, code, signal);
        }
        m(handle) {
            const adapter = this.c.get(handle);
            if (!adapter) {
                throw new Error('Invalid debug adapter');
            }
            return adapter;
        }
        // dto helpers
        $sessionCached(sessionID) {
            // remember that the EH has cached the session and we do not have to send it again
            this.h.add(sessionID);
        }
        getSessionDto(session) {
            if (session) {
                const sessionID = session.getId();
                if (this.h.has(sessionID)) {
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
        n(bps) {
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
    exports.$Fcb = $Fcb;
    exports.$Fcb = $Fcb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadDebugService),
        __param(1, debug_1.$nH)
    ], $Fcb);
    /**
     * DebugAdapter that communicates via extension protocol with another debug adapter.
     */
    class ExtensionHostDebugAdapter extends abstractDebugAdapter_1.$Ecb {
        constructor(a, b, c, session) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.session = session;
        }
        fireError(handle, err) {
            this.m.fire(err);
        }
        fireExit(handle, code, signal) {
            this.n.fire(code);
        }
        startSession() {
            return Promise.resolve(this.c.$startDASession(this.b, this.a.getSessionDto(this.session)));
        }
        sendMessage(message) {
            this.c.$sendDAMessage(this.b, (0, debugUtils_1.$qF)(message, true));
        }
        async stopSession() {
            await this.u();
            return Promise.resolve(this.c.$stopDASession(this.b));
        }
    }
});
//# sourceMappingURL=mainThreadDebugService.js.map