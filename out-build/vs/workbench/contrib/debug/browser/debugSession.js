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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/severity", "vs/base/common/uuid", "vs/nls!vs/workbench/contrib/debug/browser/debugSession", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/debug/browser/rawDebugSession", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/contrib/debug/common/replModel", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/host/browser/host", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, aria, arrays_1, async_1, cancellation_1, errors_1, event_1, labels_1, lifecycle_1, objects_1, platform, resources, severity_1, uuid_1, nls_1, configuration_1, instantiation_1, log_1, notification_1, productService_1, telemetry_1, uriIdentity_1, workspace_1, rawDebugSession_1, debug_1, debugModel_1, debugSource_1, debugUtils_1, replModel_1, environmentService_1, host_1, lifecycle_2, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SRb = void 0;
    let $SRb = class $SRb {
        constructor(D, E, root, F, options, G, H, I, J, K, L, M, N, lifecycleService, O, P, Q, R, S) {
            this.D = D;
            this.E = E;
            this.root = root;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.K = K;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.b = false;
            this.d = new Map();
            this.f = new Map();
            this.g = [];
            this.h = new Map();
            this.j = new lifecycle_1.$jc();
            this.o = [];
            this.q = new event_1.$fd();
            this.r = new event_1.$fd();
            this.u = new event_1.$fd();
            this.v = new event_1.$fd();
            this.w = new event_1.$fd();
            this.x = new event_1.$fd();
            this.y = new event_1.$fd();
            this.z = new event_1.$fd();
            this.A = new event_1.$fd();
            this.C = new event_1.$fd();
            this.c = options || {};
            this.parentSession = this.c.parentSession;
            if (this.hasSeparateRepl()) {
                this.n = new replModel_1.$9Pb(this.J);
            }
            else {
                this.n = this.parentSession.n;
            }
            const toDispose = new lifecycle_1.$jc();
            const replListener = toDispose.add(new lifecycle_1.$lc());
            replListener.value = this.n.onDidChangeElements(() => this.A.fire());
            if (lifecycleService) {
                toDispose.add(lifecycleService.onWillShutdown(() => {
                    this.X();
                    (0, lifecycle_1.$fc)(toDispose);
                }));
            }
            const compoundRoot = this.c.compoundRoot;
            if (compoundRoot) {
                toDispose.add(compoundRoot.onDidSessionStop(() => this.terminate()));
            }
            this.l = new async_1.$Sg(() => {
                // If there is some session or thread that is stopped pass focus to it
                if (this.G.getModel().getSessions().some(s => s.state === 2 /* State.Stopped */) || this.getAllThreads().some(t => t.stopped)) {
                    if (typeof this.m === 'number') {
                        const thread = this.G.getViewModel().focusedThread;
                        if (thread && thread.threadId === this.m && !thread.stopped) {
                            const toFocusThreadId = this.getStoppedDetails()?.threadId;
                            const toFocusThread = typeof toFocusThreadId === 'number' ? this.getThread(toFocusThreadId) : undefined;
                            this.G.focusStackFrame(undefined, toFocusThread);
                        }
                    }
                    else {
                        const session = this.G.getViewModel().focusedSession;
                        if (session && session.getId() === this.getId() && session.state !== 2 /* State.Stopped */) {
                            this.G.focusStackFrame(undefined);
                        }
                    }
                }
            }, 800);
            const parent = this.c.parentSession;
            if (parent) {
                toDispose.add(parent.onDidEndAdapter(() => {
                    // copy the parent repl and get a new detached repl for this child, and
                    // remove its parent, if it's still running
                    if (!this.hasSeparateRepl() && this.raw?.isInShutdown === false) {
                        this.n = this.n.clone();
                        replListener.value = this.n.onDidChangeElements(() => this.A.fire());
                        this.parentSession = undefined;
                    }
                }));
            }
        }
        getId() {
            return this.D;
        }
        setSubId(subId) {
            this.a = subId;
        }
        getMemory(memoryReference) {
            return new debugModel_1.$PFb(memoryReference, this);
        }
        get subId() {
            return this.a;
        }
        get configuration() {
            return this.E.resolved;
        }
        get unresolvedConfiguration() {
            return this.E.unresolved;
        }
        get lifecycleManagedByParent() {
            return !!this.c.lifecycleManagedByParent;
        }
        get compact() {
            return !!this.c.compact;
        }
        get saveBeforeRestart() {
            return this.c.saveBeforeRestart ?? !this.c?.parentSession;
        }
        get compoundRoot() {
            return this.c.compoundRoot;
        }
        get suppressDebugStatusbar() {
            return this.c.suppressDebugStatusbar ?? false;
        }
        get suppressDebugToolbar() {
            return this.c.suppressDebugToolbar ?? false;
        }
        get suppressDebugView() {
            return this.c.suppressDebugView ?? false;
        }
        get autoExpandLazyVariables() {
            // This tiny helper avoids converting the entire debug model to use service injection
            return this.J.getValue('debug').autoExpandLazyVariables;
        }
        setConfiguration(configuration) {
            this.E = configuration;
        }
        getLabel() {
            const includeRoot = this.L.getWorkspace().folders.length > 1;
            return includeRoot && this.root ? `${this.name} (${resources.$eg(this.root.uri)})` : this.name;
        }
        setName(name) {
            this.B = name;
            this.C.fire(name);
        }
        get name() {
            return this.B || this.configuration.name;
        }
        get state() {
            if (!this.b) {
                return 1 /* State.Initializing */;
            }
            if (!this.raw) {
                return 0 /* State.Inactive */;
            }
            const focusedThread = this.G.getViewModel().focusedThread;
            if (focusedThread && focusedThread.session === this) {
                return focusedThread.stopped ? 2 /* State.Stopped */ : 3 /* State.Running */;
            }
            if (this.getAllThreads().some(t => t.stopped)) {
                return 2 /* State.Stopped */;
            }
            return 3 /* State.Running */;
        }
        get capabilities() {
            return this.raw ? this.raw.capabilities : Object.create(null);
        }
        //---- events
        get onDidChangeState() {
            return this.q.event;
        }
        get onDidEndAdapter() {
            return this.r.event;
        }
        get onDidChangeReplElements() {
            return this.A.event;
        }
        get onDidChangeName() {
            return this.C.event;
        }
        //---- DAP events
        get onDidCustomEvent() {
            return this.v.event;
        }
        get onDidLoadedSource() {
            return this.u.event;
        }
        get onDidProgressStart() {
            return this.w.event;
        }
        get onDidProgressUpdate() {
            return this.x.event;
        }
        get onDidProgressEnd() {
            return this.y.event;
        }
        get onDidInvalidateMemory() {
            return this.z.event;
        }
        //---- DAP requests
        /**
         * create and initialize a new debug adapter for this session
         */
        async initialize(dbgr) {
            if (this.raw) {
                // if there was already a connection make sure to remove old listeners
                await this.X();
            }
            try {
                const debugAdapter = await dbgr.createDebugAdapter(this);
                this.raw = this.P.createInstance(rawDebugSession_1.$RRb, debugAdapter, dbgr, this.D, this.configuration.name);
                await this.raw.start();
                this.V();
                await this.raw.initialize({
                    clientID: 'vscode',
                    clientName: this.M.nameLong,
                    adapterID: this.configuration.type,
                    pathFormat: 'path',
                    linesStartAt1: true,
                    columnsStartAt1: true,
                    supportsVariableType: true,
                    supportsVariablePaging: true,
                    supportsRunInTerminalRequest: true,
                    locale: platform.$v,
                    supportsProgressReporting: true,
                    supportsInvalidatedEvent: true,
                    supportsMemoryReferences: true,
                    supportsArgsCanBeInterpretedByShell: true,
                    supportsMemoryEvent: true,
                    supportsStartDebuggingRequest: true
                });
                this.b = true;
                this.q.fire();
                this.G.setExceptionBreakpointsForSession(this, (this.raw && this.raw.capabilities.exceptionBreakpointFilters) || []);
            }
            catch (err) {
                this.b = true;
                this.q.fire();
                await this.X();
                throw err;
            }
        }
        /**
         * launch or attach to the debuggee
         */
        async launchOrAttach(config) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(0, null, 'launch or attach'));
            }
            if (this.parentSession && this.parentSession.state === 0 /* State.Inactive */) {
                throw (0, errors_1.$4)();
            }
            // __sessionID only used for EH debugging (but we add it always for now...)
            config.__sessionId = this.getId();
            try {
                await this.raw.launchOrAttach(config);
            }
            catch (err) {
                this.X();
                throw err;
            }
        }
        /**
         * terminate the current debug adapter session
         */
        async terminate(restart = false) {
            if (!this.raw) {
                // Adapter went down but it did not send a 'terminated' event, simulate like the event has been sent
                this.W();
            }
            this.$();
            if (this.c.lifecycleManagedByParent && this.parentSession) {
                await this.parentSession.terminate(restart);
            }
            else if (this.raw) {
                if (this.raw.capabilities.supportsTerminateRequest && this.E.resolved.request === 'launch') {
                    await this.raw.terminate(restart);
                }
                else {
                    await this.raw.disconnect({ restart, terminateDebuggee: true });
                }
            }
            if (!restart) {
                this.c.compoundRoot?.sessionStopped();
            }
        }
        /**
         * end the current debug adapter session
         */
        async disconnect(restart = false, suspend = false) {
            if (!this.raw) {
                // Adapter went down but it did not send a 'terminated' event, simulate like the event has been sent
                this.W();
            }
            this.$();
            if (this.c.lifecycleManagedByParent && this.parentSession) {
                await this.parentSession.disconnect(restart, suspend);
            }
            else if (this.raw) {
                // TODO terminateDebuggee should be undefined by default?
                await this.raw.disconnect({ restart, terminateDebuggee: false, suspendDebuggee: suspend });
            }
            if (!restart) {
                this.c.compoundRoot?.sessionStopped();
            }
        }
        /**
         * restart debug adapter session
         */
        async restart() {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(1, null, 'restart'));
            }
            this.$();
            if (this.c.lifecycleManagedByParent && this.parentSession) {
                await this.parentSession.restart();
            }
            else {
                await this.raw.restart({ arguments: this.configuration });
            }
        }
        async sendBreakpoints(modelUri, breakpointsToSend, sourceModified) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(2, null, 'breakpoints'));
            }
            if (!this.raw.readyForBreakpoints) {
                return Promise.resolve(undefined);
            }
            const rawSource = this.Y(modelUri);
            if (breakpointsToSend.length && !rawSource.adapterData) {
                rawSource.adapterData = breakpointsToSend[0].adapterData;
            }
            // Normalize all drive letters going out from vscode to debug adapters so we are consistent with our resolving #43959
            if (rawSource.path) {
                rawSource.path = (0, labels_1.$fA)(rawSource.path);
            }
            const response = await this.raw.setBreakpoints({
                source: rawSource,
                lines: breakpointsToSend.map(bp => bp.sessionAgnosticData.lineNumber),
                breakpoints: breakpointsToSend.map(bp => ({ line: bp.sessionAgnosticData.lineNumber, column: bp.sessionAgnosticData.column, condition: bp.condition, hitCondition: bp.hitCondition, logMessage: bp.logMessage })),
                sourceModified
            });
            if (response && response.body) {
                const data = new Map();
                for (let i = 0; i < breakpointsToSend.length; i++) {
                    data.set(breakpointsToSend[i].getId(), response.body.breakpoints[i]);
                }
                this.F.setBreakpointSessionData(this.getId(), this.capabilities, data);
            }
        }
        async sendFunctionBreakpoints(fbpts) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(3, null, 'function breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const response = await this.raw.setFunctionBreakpoints({ breakpoints: fbpts });
                if (response && response.body) {
                    const data = new Map();
                    for (let i = 0; i < fbpts.length; i++) {
                        data.set(fbpts[i].getId(), response.body.breakpoints[i]);
                    }
                    this.F.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async sendExceptionBreakpoints(exbpts) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(4, null, 'exception breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const args = this.capabilities.supportsExceptionFilterOptions ? {
                    filters: [],
                    filterOptions: exbpts.map(exb => {
                        if (exb.condition) {
                            return { filterId: exb.filter, condition: exb.condition };
                        }
                        return { filterId: exb.filter };
                    })
                } : { filters: exbpts.map(exb => exb.filter) };
                const response = await this.raw.setExceptionBreakpoints(args);
                if (response && response.body && response.body.breakpoints) {
                    const data = new Map();
                    for (let i = 0; i < exbpts.length; i++) {
                        data.set(exbpts[i].getId(), response.body.breakpoints[i]);
                    }
                    this.F.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async dataBreakpointInfo(name, variablesReference) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(5, null, 'data breakpoints info'));
            }
            if (!this.raw.readyForBreakpoints) {
                throw new Error((0, nls_1.localize)(6, null));
            }
            const response = await this.raw.dataBreakpointInfo({ name, variablesReference });
            return response?.body;
        }
        async sendDataBreakpoints(dataBreakpoints) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(7, null, 'data breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const response = await this.raw.setDataBreakpoints({ breakpoints: dataBreakpoints });
                if (response && response.body) {
                    const data = new Map();
                    for (let i = 0; i < dataBreakpoints.length; i++) {
                        data.set(dataBreakpoints[i].getId(), response.body.breakpoints[i]);
                    }
                    this.F.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async sendInstructionBreakpoints(instructionBreakpoints) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(8, null, 'instruction breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const response = await this.raw.setInstructionBreakpoints({ breakpoints: instructionBreakpoints.map(ib => ib.toJSON()) });
                if (response && response.body) {
                    const data = new Map();
                    for (let i = 0; i < instructionBreakpoints.length; i++) {
                        data.set(instructionBreakpoints[i].getId(), response.body.breakpoints[i]);
                    }
                    this.F.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async breakpointsLocations(uri, lineNumber) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(9, null, 'breakpoints locations'));
            }
            const source = this.Y(uri);
            const response = await this.raw.breakpointLocations({ source, line: lineNumber });
            if (!response || !response.body || !response.body.breakpoints) {
                return [];
            }
            const positions = response.body.breakpoints.map(bp => ({ lineNumber: bp.line, column: bp.column || 1 }));
            return (0, arrays_1.$Kb)(positions, p => `${p.lineNumber}:${p.column}`);
        }
        getDebugProtocolBreakpoint(breakpointId) {
            return this.F.getDebugProtocolBreakpoint(breakpointId, this.getId());
        }
        customRequest(request, args) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(10, null, request));
            }
            return this.raw.custom(request, args);
        }
        stackTrace(threadId, startFrame, levels, token) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(11, null, 'stackTrace'));
            }
            const sessionToken = this.Z(threadId, token);
            return this.raw.stackTrace({ threadId, startFrame, levels }, sessionToken);
        }
        async exceptionInfo(threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(12, null, 'exceptionInfo'));
            }
            const response = await this.raw.exceptionInfo({ threadId });
            if (response) {
                return {
                    id: response.body.exceptionId,
                    description: response.body.description,
                    breakMode: response.body.breakMode,
                    details: response.body.details
                };
            }
            return undefined;
        }
        scopes(frameId, threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(13, null, 'scopes'));
            }
            const token = this.Z(threadId);
            return this.raw.scopes({ frameId }, token);
        }
        variables(variablesReference, threadId, filter, start, count) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(14, null, 'variables'));
            }
            const token = threadId ? this.Z(threadId) : undefined;
            return this.raw.variables({ variablesReference, filter, start, count }, token);
        }
        evaluate(expression, frameId, context) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(15, null, 'evaluate'));
            }
            return this.raw.evaluate({ expression, frameId, context });
        }
        async restartFrame(frameId, threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(16, null, 'restartFrame'));
            }
            await this.raw.restartFrame({ frameId }, threadId);
        }
        T(threadId, granularity) {
            const thread = this.getThread(threadId);
            if (thread) {
                thread.lastSteppingGranularity = granularity;
            }
        }
        async next(threadId, granularity) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(17, null, 'next'));
            }
            this.T(threadId, granularity);
            await this.raw.next({ threadId, granularity });
        }
        async stepIn(threadId, targetId, granularity) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(18, null, 'stepIn'));
            }
            this.T(threadId, granularity);
            await this.raw.stepIn({ threadId, targetId, granularity });
        }
        async stepOut(threadId, granularity) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(19, null, 'stepOut'));
            }
            this.T(threadId, granularity);
            await this.raw.stepOut({ threadId, granularity });
        }
        async stepBack(threadId, granularity) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(20, null, 'stepBack'));
            }
            this.T(threadId, granularity);
            await this.raw.stepBack({ threadId, granularity });
        }
        async continue(threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(21, null, 'continue'));
            }
            await this.raw.continue({ threadId });
        }
        async reverseContinue(threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(22, null, 'reverse continue'));
            }
            await this.raw.reverseContinue({ threadId });
        }
        async pause(threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(23, null, 'pause'));
            }
            await this.raw.pause({ threadId });
        }
        async terminateThreads(threadIds) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(24, null, 'terminateThreads'));
            }
            await this.raw.terminateThreads({ threadIds });
        }
        setVariable(variablesReference, name, value) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(25, null, 'setVariable'));
            }
            return this.raw.setVariable({ variablesReference, name, value });
        }
        setExpression(frameId, expression, value) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(26, null, 'setExpression'));
            }
            return this.raw.setExpression({ expression, value, frameId });
        }
        gotoTargets(source, line, column) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(27, null, 'gotoTargets'));
            }
            return this.raw.gotoTargets({ source, line, column });
        }
        goto(threadId, targetId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)(28, null, 'goto'));
            }
            return this.raw.goto({ threadId, targetId });
        }
        loadSource(resource) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)(29, null, 'loadSource')));
            }
            const source = this.getSourceForUri(resource);
            let rawSource;
            if (source) {
                rawSource = source.raw;
            }
            else {
                // create a Source
                const data = debugSource_1.$wF.getEncodedDebugData(resource);
                rawSource = { path: data.path, sourceReference: data.sourceReference };
            }
            return this.raw.source({ sourceReference: rawSource.sourceReference || 0, source: rawSource });
        }
        async getLoadedSources() {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)(30, null, 'getLoadedSources')));
            }
            const response = await this.raw.loadedSources({});
            if (response && response.body && response.body.sources) {
                return response.body.sources.map(src => this.getSource(src));
            }
            else {
                return [];
            }
        }
        async completions(frameId, threadId, text, position, overwriteBefore, token) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)(31, null, 'completions')));
            }
            const sessionCancelationToken = this.Z(threadId, token);
            return this.raw.completions({
                frameId,
                text,
                column: position.column,
                line: position.lineNumber,
            }, sessionCancelationToken);
        }
        async stepInTargets(frameId) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)(32, null, 'stepInTargets')));
            }
            const response = await this.raw.stepInTargets({ frameId });
            return response?.body.targets;
        }
        async cancel(progressId) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)(33, null, 'cancel')));
            }
            return this.raw.cancel({ progressId });
        }
        async disassemble(memoryReference, offset, instructionOffset, instructionCount) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)(34, null, 'disassemble')));
            }
            const response = await this.raw.disassemble({ memoryReference, offset, instructionOffset, instructionCount, resolveSymbols: true });
            return response?.body?.instructions;
        }
        readMemory(memoryReference, offset, count) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)(35, null, 'readMemory')));
            }
            return this.raw.readMemory({ count, memoryReference, offset });
        }
        writeMemory(memoryReference, offset, data, allowPartial) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)(36, null, 'disassemble')));
            }
            return this.raw.writeMemory({ memoryReference, offset, allowPartial, data });
        }
        //---- threads
        getThread(threadId) {
            return this.f.get(threadId);
        }
        getAllThreads() {
            const result = [];
            this.g.forEach((threadId) => {
                const thread = this.f.get(threadId);
                if (thread) {
                    result.push(thread);
                }
            });
            return result;
        }
        clearThreads(removeThreads, reference = undefined) {
            if (reference !== undefined && reference !== null) {
                const thread = this.f.get(reference);
                if (thread) {
                    thread.clearCallStack();
                    thread.stoppedDetails = undefined;
                    thread.stopped = false;
                    if (removeThreads) {
                        this.f.delete(reference);
                    }
                }
            }
            else {
                this.f.forEach(thread => {
                    thread.clearCallStack();
                    thread.stoppedDetails = undefined;
                    thread.stopped = false;
                });
                if (removeThreads) {
                    this.f.clear();
                    this.g = [];
                    debugModel_1.$HFb.allValues.clear();
                }
            }
        }
        getStoppedDetails() {
            return this.o.length >= 1 ? this.o[0] : undefined;
        }
        rawUpdate(data) {
            this.g = [];
            data.threads.forEach(thread => {
                this.g.push(thread.id);
                if (!this.f.has(thread.id)) {
                    // A new thread came in, initialize it.
                    this.f.set(thread.id, new debugModel_1.$NFb(this, thread.name, thread.id));
                }
                else if (thread.name) {
                    // Just the thread name got updated #18244
                    const oldThread = this.f.get(thread.id);
                    if (oldThread) {
                        oldThread.name = thread.name;
                    }
                }
            });
            this.f.forEach(t => {
                // Remove all old threads which are no longer part of the update #75980
                if (this.g.indexOf(t.threadId) === -1) {
                    this.f.delete(t.threadId);
                }
            });
            const stoppedDetails = data.stoppedDetails;
            if (stoppedDetails) {
                // Set the availability of the threads' callstacks depending on
                // whether the thread is stopped or not
                if (stoppedDetails.allThreadsStopped) {
                    this.f.forEach(thread => {
                        thread.stoppedDetails = thread.threadId === stoppedDetails.threadId ? stoppedDetails : { reason: thread.stoppedDetails?.reason };
                        thread.stopped = true;
                        thread.clearCallStack();
                    });
                }
                else {
                    const thread = typeof stoppedDetails.threadId === 'number' ? this.f.get(stoppedDetails.threadId) : undefined;
                    if (thread) {
                        // One thread is stopped, only update that thread.
                        thread.stoppedDetails = stoppedDetails;
                        thread.clearCallStack();
                        thread.stopped = true;
                    }
                }
            }
        }
        async U(stoppedDetails) {
            if (this.raw) {
                const response = await this.raw.threads();
                if (response && response.body && response.body.threads) {
                    this.F.rawUpdate({
                        sessionId: this.getId(),
                        threads: response.body.threads,
                        stoppedDetails
                    });
                }
            }
        }
        initializeForTest(raw) {
            this.raw = raw;
            this.V();
        }
        //---- private
        V() {
            if (!this.raw) {
                return;
            }
            this.j.add(this.raw.onDidInitialize(async () => {
                aria.$_P((0, nls_1.localize)(37, null));
                const sendConfigurationDone = async () => {
                    if (this.raw && this.raw.capabilities.supportsConfigurationDoneRequest) {
                        try {
                            await this.raw.configurationDone();
                        }
                        catch (e) {
                            // Disconnect the debug session on configuration done error #10596
                            this.N.error(e);
                            this.raw?.disconnect({});
                        }
                    }
                    return undefined;
                };
                // Send all breakpoints
                try {
                    await this.G.sendAllBreakpoints(this);
                }
                finally {
                    await sendConfigurationDone();
                    await this.U();
                }
            }));
            const statusQueue = new async_1.$Ng();
            this.j.add(this.raw.onDidStop(async (event) => {
                statusQueue.queue(async () => {
                    this.l.cancel();
                    this.o.push(event.body);
                    await this.U(event.body);
                    // If the focus for the current session is on a non-existent thread, clear the focus.
                    const focusedThread = this.G.getViewModel().focusedThread;
                    const focusedThreadDoesNotExist = focusedThread !== undefined && focusedThread.session === this && !this.f.has(focusedThread.threadId);
                    if (focusedThreadDoesNotExist) {
                        this.G.focusStackFrame(undefined, undefined);
                    }
                    const thread = typeof event.body.threadId === 'number' ? this.getThread(event.body.threadId) : undefined;
                    if (thread) {
                        // Call fetch call stack twice, the first only return the top stack frame.
                        // Second retrieves the rest of the call stack. For performance reasons #25605
                        const promises = this.F.refreshTopOfCallstack(thread);
                        const focus = async () => {
                            if (focusedThreadDoesNotExist || (!event.body.preserveFocusHint && thread.getCallStack().length)) {
                                const focusedStackFrame = this.G.getViewModel().focusedStackFrame;
                                if (!focusedStackFrame || focusedStackFrame.thread.session === this) {
                                    // Only take focus if nothing is focused, or if the focus is already on the current session
                                    const preserveFocus = !this.J.getValue('debug').focusEditorOnBreak;
                                    await this.G.focusStackFrame(undefined, thread, undefined, { preserveFocus });
                                }
                                if (thread.stoppedDetails) {
                                    if (thread.stoppedDetails.reason === 'breakpoint' && this.J.getValue('debug').openDebug === 'openOnDebugBreak' && !this.suppressDebugView) {
                                        await this.K.openPaneComposite(debug_1.$jG, 0 /* ViewContainerLocation.Sidebar */);
                                    }
                                    if (this.J.getValue('debug').focusWindowOnBreak && !this.R.extensionTestsLocationURI) {
                                        await this.I.focus({ force: true /* Application may not be active */ });
                                    }
                                }
                            }
                        };
                        await promises.topCallStack;
                        focus();
                        await promises.wholeCallStack;
                        const focusedStackFrame = this.G.getViewModel().focusedStackFrame;
                        if (!focusedStackFrame || !focusedStackFrame.source || focusedStackFrame.source.presentationHint === 'deemphasize' || focusedStackFrame.presentationHint === 'deemphasize') {
                            // The top stack frame can be deemphesized so try to focus again #68616
                            focus();
                        }
                    }
                    this.q.fire();
                });
            }));
            this.j.add(this.raw.onDidThread(event => {
                statusQueue.queue(async () => {
                    if (event.body.reason === 'started') {
                        // debounce to reduce threadsRequest frequency and improve performance
                        if (!this.k) {
                            this.k = new async_1.$Sg(() => {
                                this.U();
                            }, 100);
                            this.j.add(this.k);
                        }
                        if (!this.k.isScheduled()) {
                            this.k.schedule();
                        }
                    }
                    else if (event.body.reason === 'exited') {
                        this.F.clearThreads(this.getId(), true, event.body.threadId);
                        const viewModel = this.G.getViewModel();
                        const focusedThread = viewModel.focusedThread;
                        this.l.cancel();
                        if (focusedThread && event.body.threadId === focusedThread.threadId) {
                            // De-focus the thread in case it was focused
                            this.G.focusStackFrame(undefined, undefined, viewModel.focusedSession, { explicit: false });
                        }
                    }
                });
            }));
            this.j.add(this.raw.onDidTerminateDebugee(async (event) => {
                aria.$_P((0, nls_1.localize)(38, null));
                if (event.body && event.body.restart) {
                    await this.G.restartSession(this, event.body.restart);
                }
                else if (this.raw) {
                    await this.raw.disconnect({ terminateDebuggee: false });
                }
            }));
            this.j.add(this.raw.onDidContinued(event => {
                statusQueue.queue(async () => {
                    const threadId = event.body.allThreadsContinued !== false ? undefined : event.body.threadId;
                    if (typeof threadId === 'number') {
                        this.o = this.o.filter(sd => sd.threadId !== threadId);
                        const tokens = this.h.get(threadId);
                        this.h.delete(threadId);
                        tokens?.forEach(t => t.dispose(true));
                    }
                    else {
                        this.o = [];
                        this.$();
                    }
                    this.m = threadId;
                    // We need to pass focus to other sessions / threads with a timeout in case a quick stop event occurs #130321
                    this.l.schedule();
                    this.F.clearThreads(this.getId(), false, threadId);
                    this.q.fire();
                });
            }));
            const outputQueue = new async_1.$Ng();
            this.j.add(this.raw.onDidOutput(async (event) => {
                const outputSeverity = event.body.category === 'stderr' ? severity_1.default.Error : event.body.category === 'console' ? severity_1.default.Warning : severity_1.default.Info;
                // When a variables event is received, execute immediately to obtain the variables value #126967
                if (event.body.variablesReference) {
                    const source = event.body.source && event.body.line ? {
                        lineNumber: event.body.line,
                        column: event.body.column ? event.body.column : 1,
                        source: this.getSource(event.body.source)
                    } : undefined;
                    const container = new debugModel_1.$HFb(this, undefined, event.body.variablesReference, (0, uuid_1.$4f)());
                    const children = container.getChildren();
                    // we should put appendToRepl into queue to make sure the logs to be displayed in correct order
                    // see https://github.com/microsoft/vscode/issues/126967#issuecomment-874954269
                    outputQueue.queue(async () => {
                        const resolved = await children;
                        // For single logged variables, try to use the output if we can so
                        // present a better (i.e. ANSI-aware) representation of the output
                        if (resolved.length === 1) {
                            this.appendToRepl({ output: event.body.output, expression: resolved[0], sev: outputSeverity, source }, event.body.category === 'important');
                            return;
                        }
                        resolved.forEach((child) => {
                            // Since we can not display multiple trees in a row, we are displaying these variables one after the other (ignoring their names)
                            child.name = null;
                            this.appendToRepl({ output: '', expression: child, sev: outputSeverity, source }, event.body.category === 'important');
                        });
                    });
                    return;
                }
                outputQueue.queue(async () => {
                    if (!event.body || !this.raw) {
                        return;
                    }
                    if (event.body.category === 'telemetry') {
                        // only log telemetry events from debug adapter if the debug extension provided the telemetry key
                        // and the user opted in telemetry
                        const telemetryEndpoint = this.raw.dbgr.getCustomTelemetryEndpoint();
                        if (telemetryEndpoint && this.H.telemetryLevel !== 0 /* TelemetryLevel.NONE */) {
                            // __GDPR__TODO__ We're sending events in the name of the debug extension and we can not ensure that those are declared correctly.
                            let data = event.body.data;
                            if (!telemetryEndpoint.sendErrorTelemetry && event.body.data) {
                                data = (0, debugUtils_1.$jF)(event.body.data);
                            }
                            this.Q.publicLog(telemetryEndpoint, event.body.output, data);
                        }
                        return;
                    }
                    // Make sure to append output in the correct order by properly waiting on preivous promises #33822
                    const source = event.body.source && event.body.line ? {
                        lineNumber: event.body.line,
                        column: event.body.column ? event.body.column : 1,
                        source: this.getSource(event.body.source)
                    } : undefined;
                    if (event.body.group === 'start' || event.body.group === 'startCollapsed') {
                        const expanded = event.body.group === 'start';
                        this.n.startGroup(event.body.output || '', expanded, source);
                        return;
                    }
                    if (event.body.group === 'end') {
                        this.n.endGroup();
                        if (!event.body.output) {
                            // Only return if the end event does not have additional output in it
                            return;
                        }
                    }
                    if (typeof event.body.output === 'string') {
                        this.appendToRepl({ output: event.body.output, sev: outputSeverity, source }, event.body.category === 'important');
                    }
                });
            }));
            this.j.add(this.raw.onDidBreakpoint(event => {
                const id = event.body && event.body.breakpoint ? event.body.breakpoint.id : undefined;
                const breakpoint = this.F.getBreakpoints().find(bp => bp.getIdFromAdapter(this.getId()) === id);
                const functionBreakpoint = this.F.getFunctionBreakpoints().find(bp => bp.getIdFromAdapter(this.getId()) === id);
                const dataBreakpoint = this.F.getDataBreakpoints().find(dbp => dbp.getIdFromAdapter(this.getId()) === id);
                const exceptionBreakpoint = this.F.getExceptionBreakpoints().find(excbp => excbp.getIdFromAdapter(this.getId()) === id);
                if (event.body.reason === 'new' && event.body.breakpoint.source && event.body.breakpoint.line) {
                    const source = this.getSource(event.body.breakpoint.source);
                    const bps = this.F.addBreakpoints(source.uri, [{
                            column: event.body.breakpoint.column,
                            enabled: true,
                            lineNumber: event.body.breakpoint.line,
                        }], false);
                    if (bps.length === 1) {
                        const data = new Map([[bps[0].getId(), event.body.breakpoint]]);
                        this.F.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                }
                if (event.body.reason === 'removed') {
                    if (breakpoint) {
                        this.F.removeBreakpoints([breakpoint]);
                    }
                    if (functionBreakpoint) {
                        this.F.removeFunctionBreakpoints(functionBreakpoint.getId());
                    }
                    if (dataBreakpoint) {
                        this.F.removeDataBreakpoints(dataBreakpoint.getId());
                    }
                }
                if (event.body.reason === 'changed') {
                    if (breakpoint) {
                        if (!breakpoint.column) {
                            event.body.breakpoint.column = undefined;
                        }
                        const data = new Map([[breakpoint.getId(), event.body.breakpoint]]);
                        this.F.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                    if (functionBreakpoint) {
                        const data = new Map([[functionBreakpoint.getId(), event.body.breakpoint]]);
                        this.F.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                    if (dataBreakpoint) {
                        const data = new Map([[dataBreakpoint.getId(), event.body.breakpoint]]);
                        this.F.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                    if (exceptionBreakpoint) {
                        const data = new Map([[exceptionBreakpoint.getId(), event.body.breakpoint]]);
                        this.F.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                }
            }));
            this.j.add(this.raw.onDidLoadedSource(event => {
                this.u.fire({
                    reason: event.body.reason,
                    source: this.getSource(event.body.source)
                });
            }));
            this.j.add(this.raw.onDidCustomEvent(event => {
                this.v.fire(event);
            }));
            this.j.add(this.raw.onDidProgressStart(event => {
                this.w.fire(event);
            }));
            this.j.add(this.raw.onDidProgressUpdate(event => {
                this.x.fire(event);
            }));
            this.j.add(this.raw.onDidProgressEnd(event => {
                this.y.fire(event);
            }));
            this.j.add(this.raw.onDidInvalidateMemory(event => {
                this.z.fire(event);
            }));
            this.j.add(this.raw.onDidInvalidated(async (event) => {
                if (!(event.body.areas && event.body.areas.length === 1 && (event.body.areas[0] === 'variables' || event.body.areas[0] === 'watch'))) {
                    // If invalidated event only requires to update variables or watch, do that, otherwise refatch threads https://github.com/microsoft/vscode/issues/106745
                    this.$();
                    this.F.clearThreads(this.getId(), true);
                    await this.U(this.getStoppedDetails());
                }
                const viewModel = this.G.getViewModel();
                if (viewModel.focusedSession === this) {
                    viewModel.updateViews();
                }
            }));
            this.j.add(this.raw.onDidExitAdapter(event => this.W(event)));
        }
        W(event) {
            this.b = true;
            this.F.setBreakpointSessionData(this.getId(), this.capabilities, undefined);
            this.X();
            this.r.fire(event);
        }
        // Disconnects and clears state. Session can be initialized again for a new connection.
        X() {
            this.j.clear();
            if (this.raw) {
                // Send out disconnect and immediatly dispose (do not wait for response) #127418
                this.raw.disconnect({});
                this.raw.dispose();
                this.raw = undefined;
            }
            this.k?.dispose();
            this.k = undefined;
            this.l.cancel();
            this.l.dispose();
            this.F.clearThreads(this.getId(), true);
            this.q.fire();
        }
        dispose() {
            this.$();
            this.j.dispose();
        }
        //---- sources
        getSourceForUri(uri) {
            return this.d.get(this.O.asCanonicalUri(uri).toString());
        }
        getSource(raw) {
            let source = new debugSource_1.$wF(raw, this.getId(), this.O, this.S);
            const uriKey = source.uri.toString();
            const found = this.d.get(uriKey);
            if (found) {
                source = found;
                // merge attributes of new into existing
                source.raw = (0, objects_1.$Ym)(source.raw, raw);
                if (source.raw && raw) {
                    // Always take the latest presentation hint from adapter #42139
                    source.raw.presentationHint = raw.presentationHint;
                }
            }
            else {
                this.d.set(uriKey, source);
            }
            return source;
        }
        Y(uri) {
            const source = this.getSourceForUri(uri);
            if (source) {
                return source.raw;
            }
            else {
                const data = debugSource_1.$wF.getEncodedDebugData(uri);
                return { name: data.name, path: data.path, sourceReference: data.sourceReference };
            }
        }
        Z(threadId, token) {
            const tokenSource = new cancellation_1.$pd(token);
            const tokens = this.h.get(threadId) || [];
            tokens.push(tokenSource);
            this.h.set(threadId, tokens);
            return tokenSource.token;
        }
        $() {
            this.h.forEach(tokens => tokens.forEach(t => t.dispose(true)));
            this.h.clear();
        }
        // REPL
        getReplElements() {
            return this.n.getReplElements();
        }
        hasSeparateRepl() {
            return !this.parentSession || this.c.repl !== 'mergeWithParent';
        }
        removeReplExpressions() {
            this.n.removeReplExpressions();
        }
        async addReplExpression(stackFrame, name) {
            await this.n.addReplExpression(this, stackFrame, name);
            // Evaluate all watch expressions and fetch variables again since repl evaluation might have changed some.
            this.G.getViewModel().updateViews();
        }
        appendToRepl(data, isImportant) {
            this.n.appendToRepl(this, data);
            if (isImportant) {
                this.N.notify({ message: data.output.toString(), severity: data.sev, source: this.name });
            }
        }
    };
    exports.$SRb = $SRb;
    exports.$SRb = $SRb = __decorate([
        __param(5, debug_1.$nH),
        __param(6, telemetry_1.$9k),
        __param(7, host_1.$VT),
        __param(8, configuration_1.$8h),
        __param(9, panecomposite_1.$Yeb),
        __param(10, workspace_1.$Kh),
        __param(11, productService_1.$kj),
        __param(12, notification_1.$Yu),
        __param(13, lifecycle_2.$7y),
        __param(14, uriIdentity_1.$Ck),
        __param(15, instantiation_1.$Ah),
        __param(16, telemetry_1.$0k),
        __param(17, environmentService_1.$hJ),
        __param(18, log_1.$5i)
    ], $SRb);
});
//# sourceMappingURL=debugSession.js.map