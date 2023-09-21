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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/severity", "vs/base/common/uuid", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/debug/browser/rawDebugSession", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/contrib/debug/common/replModel", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/host/browser/host", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, aria, arrays_1, async_1, cancellation_1, errors_1, event_1, labels_1, lifecycle_1, objects_1, platform, resources, severity_1, uuid_1, nls_1, configuration_1, instantiation_1, log_1, notification_1, productService_1, telemetry_1, uriIdentity_1, workspace_1, rawDebugSession_1, debug_1, debugModel_1, debugSource_1, debugUtils_1, replModel_1, environmentService_1, host_1, lifecycle_2, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugSession = void 0;
    let DebugSession = class DebugSession {
        constructor(id, _configuration, root, model, options, debugService, telemetryService, hostService, configurationService, paneCompositeService, workspaceContextService, productService, notificationService, lifecycleService, uriIdentityService, instantiationService, customEndpointTelemetryService, workbenchEnvironmentService, logService) {
            this.id = id;
            this._configuration = _configuration;
            this.root = root;
            this.model = model;
            this.debugService = debugService;
            this.telemetryService = telemetryService;
            this.hostService = hostService;
            this.configurationService = configurationService;
            this.paneCompositeService = paneCompositeService;
            this.workspaceContextService = workspaceContextService;
            this.productService = productService;
            this.notificationService = notificationService;
            this.uriIdentityService = uriIdentityService;
            this.instantiationService = instantiationService;
            this.customEndpointTelemetryService = customEndpointTelemetryService;
            this.workbenchEnvironmentService = workbenchEnvironmentService;
            this.logService = logService;
            this.initialized = false;
            this.sources = new Map();
            this.threads = new Map();
            this.threadIds = [];
            this.cancellationMap = new Map();
            this.rawListeners = new lifecycle_1.DisposableStore();
            this.stoppedDetails = [];
            this._onDidChangeState = new event_1.Emitter();
            this._onDidEndAdapter = new event_1.Emitter();
            this._onDidLoadedSource = new event_1.Emitter();
            this._onDidCustomEvent = new event_1.Emitter();
            this._onDidProgressStart = new event_1.Emitter();
            this._onDidProgressUpdate = new event_1.Emitter();
            this._onDidProgressEnd = new event_1.Emitter();
            this._onDidInvalidMemory = new event_1.Emitter();
            this._onDidChangeREPLElements = new event_1.Emitter();
            this._onDidChangeName = new event_1.Emitter();
            this._options = options || {};
            this.parentSession = this._options.parentSession;
            if (this.hasSeparateRepl()) {
                this.repl = new replModel_1.ReplModel(this.configurationService);
            }
            else {
                this.repl = this.parentSession.repl;
            }
            const toDispose = new lifecycle_1.DisposableStore();
            const replListener = toDispose.add(new lifecycle_1.MutableDisposable());
            replListener.value = this.repl.onDidChangeElements(() => this._onDidChangeREPLElements.fire());
            if (lifecycleService) {
                toDispose.add(lifecycleService.onWillShutdown(() => {
                    this.shutdown();
                    (0, lifecycle_1.dispose)(toDispose);
                }));
            }
            const compoundRoot = this._options.compoundRoot;
            if (compoundRoot) {
                toDispose.add(compoundRoot.onDidSessionStop(() => this.terminate()));
            }
            this.passFocusScheduler = new async_1.RunOnceScheduler(() => {
                // If there is some session or thread that is stopped pass focus to it
                if (this.debugService.getModel().getSessions().some(s => s.state === 2 /* State.Stopped */) || this.getAllThreads().some(t => t.stopped)) {
                    if (typeof this.lastContinuedThreadId === 'number') {
                        const thread = this.debugService.getViewModel().focusedThread;
                        if (thread && thread.threadId === this.lastContinuedThreadId && !thread.stopped) {
                            const toFocusThreadId = this.getStoppedDetails()?.threadId;
                            const toFocusThread = typeof toFocusThreadId === 'number' ? this.getThread(toFocusThreadId) : undefined;
                            this.debugService.focusStackFrame(undefined, toFocusThread);
                        }
                    }
                    else {
                        const session = this.debugService.getViewModel().focusedSession;
                        if (session && session.getId() === this.getId() && session.state !== 2 /* State.Stopped */) {
                            this.debugService.focusStackFrame(undefined);
                        }
                    }
                }
            }, 800);
            const parent = this._options.parentSession;
            if (parent) {
                toDispose.add(parent.onDidEndAdapter(() => {
                    // copy the parent repl and get a new detached repl for this child, and
                    // remove its parent, if it's still running
                    if (!this.hasSeparateRepl() && this.raw?.isInShutdown === false) {
                        this.repl = this.repl.clone();
                        replListener.value = this.repl.onDidChangeElements(() => this._onDidChangeREPLElements.fire());
                        this.parentSession = undefined;
                    }
                }));
            }
        }
        getId() {
            return this.id;
        }
        setSubId(subId) {
            this._subId = subId;
        }
        getMemory(memoryReference) {
            return new debugModel_1.MemoryRegion(memoryReference, this);
        }
        get subId() {
            return this._subId;
        }
        get configuration() {
            return this._configuration.resolved;
        }
        get unresolvedConfiguration() {
            return this._configuration.unresolved;
        }
        get lifecycleManagedByParent() {
            return !!this._options.lifecycleManagedByParent;
        }
        get compact() {
            return !!this._options.compact;
        }
        get saveBeforeRestart() {
            return this._options.saveBeforeRestart ?? !this._options?.parentSession;
        }
        get compoundRoot() {
            return this._options.compoundRoot;
        }
        get suppressDebugStatusbar() {
            return this._options.suppressDebugStatusbar ?? false;
        }
        get suppressDebugToolbar() {
            return this._options.suppressDebugToolbar ?? false;
        }
        get suppressDebugView() {
            return this._options.suppressDebugView ?? false;
        }
        get autoExpandLazyVariables() {
            // This tiny helper avoids converting the entire debug model to use service injection
            return this.configurationService.getValue('debug').autoExpandLazyVariables;
        }
        setConfiguration(configuration) {
            this._configuration = configuration;
        }
        getLabel() {
            const includeRoot = this.workspaceContextService.getWorkspace().folders.length > 1;
            return includeRoot && this.root ? `${this.name} (${resources.basenameOrAuthority(this.root.uri)})` : this.name;
        }
        setName(name) {
            this._name = name;
            this._onDidChangeName.fire(name);
        }
        get name() {
            return this._name || this.configuration.name;
        }
        get state() {
            if (!this.initialized) {
                return 1 /* State.Initializing */;
            }
            if (!this.raw) {
                return 0 /* State.Inactive */;
            }
            const focusedThread = this.debugService.getViewModel().focusedThread;
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
            return this._onDidChangeState.event;
        }
        get onDidEndAdapter() {
            return this._onDidEndAdapter.event;
        }
        get onDidChangeReplElements() {
            return this._onDidChangeREPLElements.event;
        }
        get onDidChangeName() {
            return this._onDidChangeName.event;
        }
        //---- DAP events
        get onDidCustomEvent() {
            return this._onDidCustomEvent.event;
        }
        get onDidLoadedSource() {
            return this._onDidLoadedSource.event;
        }
        get onDidProgressStart() {
            return this._onDidProgressStart.event;
        }
        get onDidProgressUpdate() {
            return this._onDidProgressUpdate.event;
        }
        get onDidProgressEnd() {
            return this._onDidProgressEnd.event;
        }
        get onDidInvalidateMemory() {
            return this._onDidInvalidMemory.event;
        }
        //---- DAP requests
        /**
         * create and initialize a new debug adapter for this session
         */
        async initialize(dbgr) {
            if (this.raw) {
                // if there was already a connection make sure to remove old listeners
                await this.shutdown();
            }
            try {
                const debugAdapter = await dbgr.createDebugAdapter(this);
                this.raw = this.instantiationService.createInstance(rawDebugSession_1.RawDebugSession, debugAdapter, dbgr, this.id, this.configuration.name);
                await this.raw.start();
                this.registerListeners();
                await this.raw.initialize({
                    clientID: 'vscode',
                    clientName: this.productService.nameLong,
                    adapterID: this.configuration.type,
                    pathFormat: 'path',
                    linesStartAt1: true,
                    columnsStartAt1: true,
                    supportsVariableType: true,
                    supportsVariablePaging: true,
                    supportsRunInTerminalRequest: true,
                    locale: platform.language,
                    supportsProgressReporting: true,
                    supportsInvalidatedEvent: true,
                    supportsMemoryReferences: true,
                    supportsArgsCanBeInterpretedByShell: true,
                    supportsMemoryEvent: true,
                    supportsStartDebuggingRequest: true
                });
                this.initialized = true;
                this._onDidChangeState.fire();
                this.debugService.setExceptionBreakpointsForSession(this, (this.raw && this.raw.capabilities.exceptionBreakpointFilters) || []);
            }
            catch (err) {
                this.initialized = true;
                this._onDidChangeState.fire();
                await this.shutdown();
                throw err;
            }
        }
        /**
         * launch or attach to the debuggee
         */
        async launchOrAttach(config) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'launch or attach'));
            }
            if (this.parentSession && this.parentSession.state === 0 /* State.Inactive */) {
                throw (0, errors_1.canceled)();
            }
            // __sessionID only used for EH debugging (but we add it always for now...)
            config.__sessionId = this.getId();
            try {
                await this.raw.launchOrAttach(config);
            }
            catch (err) {
                this.shutdown();
                throw err;
            }
        }
        /**
         * terminate the current debug adapter session
         */
        async terminate(restart = false) {
            if (!this.raw) {
                // Adapter went down but it did not send a 'terminated' event, simulate like the event has been sent
                this.onDidExitAdapter();
            }
            this.cancelAllRequests();
            if (this._options.lifecycleManagedByParent && this.parentSession) {
                await this.parentSession.terminate(restart);
            }
            else if (this.raw) {
                if (this.raw.capabilities.supportsTerminateRequest && this._configuration.resolved.request === 'launch') {
                    await this.raw.terminate(restart);
                }
                else {
                    await this.raw.disconnect({ restart, terminateDebuggee: true });
                }
            }
            if (!restart) {
                this._options.compoundRoot?.sessionStopped();
            }
        }
        /**
         * end the current debug adapter session
         */
        async disconnect(restart = false, suspend = false) {
            if (!this.raw) {
                // Adapter went down but it did not send a 'terminated' event, simulate like the event has been sent
                this.onDidExitAdapter();
            }
            this.cancelAllRequests();
            if (this._options.lifecycleManagedByParent && this.parentSession) {
                await this.parentSession.disconnect(restart, suspend);
            }
            else if (this.raw) {
                // TODO terminateDebuggee should be undefined by default?
                await this.raw.disconnect({ restart, terminateDebuggee: false, suspendDebuggee: suspend });
            }
            if (!restart) {
                this._options.compoundRoot?.sessionStopped();
            }
        }
        /**
         * restart debug adapter session
         */
        async restart() {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'restart'));
            }
            this.cancelAllRequests();
            if (this._options.lifecycleManagedByParent && this.parentSession) {
                await this.parentSession.restart();
            }
            else {
                await this.raw.restart({ arguments: this.configuration });
            }
        }
        async sendBreakpoints(modelUri, breakpointsToSend, sourceModified) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'breakpoints'));
            }
            if (!this.raw.readyForBreakpoints) {
                return Promise.resolve(undefined);
            }
            const rawSource = this.getRawSource(modelUri);
            if (breakpointsToSend.length && !rawSource.adapterData) {
                rawSource.adapterData = breakpointsToSend[0].adapterData;
            }
            // Normalize all drive letters going out from vscode to debug adapters so we are consistent with our resolving #43959
            if (rawSource.path) {
                rawSource.path = (0, labels_1.normalizeDriveLetter)(rawSource.path);
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
                this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
            }
        }
        async sendFunctionBreakpoints(fbpts) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'function breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const response = await this.raw.setFunctionBreakpoints({ breakpoints: fbpts });
                if (response && response.body) {
                    const data = new Map();
                    for (let i = 0; i < fbpts.length; i++) {
                        data.set(fbpts[i].getId(), response.body.breakpoints[i]);
                    }
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async sendExceptionBreakpoints(exbpts) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'exception breakpoints'));
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
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async dataBreakpointInfo(name, variablesReference) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'data breakpoints info'));
            }
            if (!this.raw.readyForBreakpoints) {
                throw new Error((0, nls_1.localize)('sessionNotReadyForBreakpoints', "Session is not ready for breakpoints"));
            }
            const response = await this.raw.dataBreakpointInfo({ name, variablesReference });
            return response?.body;
        }
        async sendDataBreakpoints(dataBreakpoints) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'data breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const response = await this.raw.setDataBreakpoints({ breakpoints: dataBreakpoints });
                if (response && response.body) {
                    const data = new Map();
                    for (let i = 0; i < dataBreakpoints.length; i++) {
                        data.set(dataBreakpoints[i].getId(), response.body.breakpoints[i]);
                    }
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async sendInstructionBreakpoints(instructionBreakpoints) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'instruction breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const response = await this.raw.setInstructionBreakpoints({ breakpoints: instructionBreakpoints.map(ib => ib.toJSON()) });
                if (response && response.body) {
                    const data = new Map();
                    for (let i = 0; i < instructionBreakpoints.length; i++) {
                        data.set(instructionBreakpoints[i].getId(), response.body.breakpoints[i]);
                    }
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async breakpointsLocations(uri, lineNumber) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'breakpoints locations'));
            }
            const source = this.getRawSource(uri);
            const response = await this.raw.breakpointLocations({ source, line: lineNumber });
            if (!response || !response.body || !response.body.breakpoints) {
                return [];
            }
            const positions = response.body.breakpoints.map(bp => ({ lineNumber: bp.line, column: bp.column || 1 }));
            return (0, arrays_1.distinct)(positions, p => `${p.lineNumber}:${p.column}`);
        }
        getDebugProtocolBreakpoint(breakpointId) {
            return this.model.getDebugProtocolBreakpoint(breakpointId, this.getId());
        }
        customRequest(request, args) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", request));
            }
            return this.raw.custom(request, args);
        }
        stackTrace(threadId, startFrame, levels, token) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'stackTrace'));
            }
            const sessionToken = this.getNewCancellationToken(threadId, token);
            return this.raw.stackTrace({ threadId, startFrame, levels }, sessionToken);
        }
        async exceptionInfo(threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'exceptionInfo'));
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
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'scopes'));
            }
            const token = this.getNewCancellationToken(threadId);
            return this.raw.scopes({ frameId }, token);
        }
        variables(variablesReference, threadId, filter, start, count) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'variables'));
            }
            const token = threadId ? this.getNewCancellationToken(threadId) : undefined;
            return this.raw.variables({ variablesReference, filter, start, count }, token);
        }
        evaluate(expression, frameId, context) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'evaluate'));
            }
            return this.raw.evaluate({ expression, frameId, context });
        }
        async restartFrame(frameId, threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'restartFrame'));
            }
            await this.raw.restartFrame({ frameId }, threadId);
        }
        setLastSteppingGranularity(threadId, granularity) {
            const thread = this.getThread(threadId);
            if (thread) {
                thread.lastSteppingGranularity = granularity;
            }
        }
        async next(threadId, granularity) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'next'));
            }
            this.setLastSteppingGranularity(threadId, granularity);
            await this.raw.next({ threadId, granularity });
        }
        async stepIn(threadId, targetId, granularity) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepIn'));
            }
            this.setLastSteppingGranularity(threadId, granularity);
            await this.raw.stepIn({ threadId, targetId, granularity });
        }
        async stepOut(threadId, granularity) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepOut'));
            }
            this.setLastSteppingGranularity(threadId, granularity);
            await this.raw.stepOut({ threadId, granularity });
        }
        async stepBack(threadId, granularity) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepBack'));
            }
            this.setLastSteppingGranularity(threadId, granularity);
            await this.raw.stepBack({ threadId, granularity });
        }
        async continue(threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'continue'));
            }
            await this.raw.continue({ threadId });
        }
        async reverseContinue(threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'reverse continue'));
            }
            await this.raw.reverseContinue({ threadId });
        }
        async pause(threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'pause'));
            }
            await this.raw.pause({ threadId });
        }
        async terminateThreads(threadIds) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'terminateThreads'));
            }
            await this.raw.terminateThreads({ threadIds });
        }
        setVariable(variablesReference, name, value) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'setVariable'));
            }
            return this.raw.setVariable({ variablesReference, name, value });
        }
        setExpression(frameId, expression, value) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'setExpression'));
            }
            return this.raw.setExpression({ expression, value, frameId });
        }
        gotoTargets(source, line, column) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'gotoTargets'));
            }
            return this.raw.gotoTargets({ source, line, column });
        }
        goto(threadId, targetId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'goto'));
            }
            return this.raw.goto({ threadId, targetId });
        }
        loadSource(resource) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'loadSource')));
            }
            const source = this.getSourceForUri(resource);
            let rawSource;
            if (source) {
                rawSource = source.raw;
            }
            else {
                // create a Source
                const data = debugSource_1.Source.getEncodedDebugData(resource);
                rawSource = { path: data.path, sourceReference: data.sourceReference };
            }
            return this.raw.source({ sourceReference: rawSource.sourceReference || 0, source: rawSource });
        }
        async getLoadedSources() {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'getLoadedSources')));
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
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'completions')));
            }
            const sessionCancelationToken = this.getNewCancellationToken(threadId, token);
            return this.raw.completions({
                frameId,
                text,
                column: position.column,
                line: position.lineNumber,
            }, sessionCancelationToken);
        }
        async stepInTargets(frameId) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepInTargets')));
            }
            const response = await this.raw.stepInTargets({ frameId });
            return response?.body.targets;
        }
        async cancel(progressId) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'cancel')));
            }
            return this.raw.cancel({ progressId });
        }
        async disassemble(memoryReference, offset, instructionOffset, instructionCount) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'disassemble')));
            }
            const response = await this.raw.disassemble({ memoryReference, offset, instructionOffset, instructionCount, resolveSymbols: true });
            return response?.body?.instructions;
        }
        readMemory(memoryReference, offset, count) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'readMemory')));
            }
            return this.raw.readMemory({ count, memoryReference, offset });
        }
        writeMemory(memoryReference, offset, data, allowPartial) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'disassemble')));
            }
            return this.raw.writeMemory({ memoryReference, offset, allowPartial, data });
        }
        //---- threads
        getThread(threadId) {
            return this.threads.get(threadId);
        }
        getAllThreads() {
            const result = [];
            this.threadIds.forEach((threadId) => {
                const thread = this.threads.get(threadId);
                if (thread) {
                    result.push(thread);
                }
            });
            return result;
        }
        clearThreads(removeThreads, reference = undefined) {
            if (reference !== undefined && reference !== null) {
                const thread = this.threads.get(reference);
                if (thread) {
                    thread.clearCallStack();
                    thread.stoppedDetails = undefined;
                    thread.stopped = false;
                    if (removeThreads) {
                        this.threads.delete(reference);
                    }
                }
            }
            else {
                this.threads.forEach(thread => {
                    thread.clearCallStack();
                    thread.stoppedDetails = undefined;
                    thread.stopped = false;
                });
                if (removeThreads) {
                    this.threads.clear();
                    this.threadIds = [];
                    debugModel_1.ExpressionContainer.allValues.clear();
                }
            }
        }
        getStoppedDetails() {
            return this.stoppedDetails.length >= 1 ? this.stoppedDetails[0] : undefined;
        }
        rawUpdate(data) {
            this.threadIds = [];
            data.threads.forEach(thread => {
                this.threadIds.push(thread.id);
                if (!this.threads.has(thread.id)) {
                    // A new thread came in, initialize it.
                    this.threads.set(thread.id, new debugModel_1.Thread(this, thread.name, thread.id));
                }
                else if (thread.name) {
                    // Just the thread name got updated #18244
                    const oldThread = this.threads.get(thread.id);
                    if (oldThread) {
                        oldThread.name = thread.name;
                    }
                }
            });
            this.threads.forEach(t => {
                // Remove all old threads which are no longer part of the update #75980
                if (this.threadIds.indexOf(t.threadId) === -1) {
                    this.threads.delete(t.threadId);
                }
            });
            const stoppedDetails = data.stoppedDetails;
            if (stoppedDetails) {
                // Set the availability of the threads' callstacks depending on
                // whether the thread is stopped or not
                if (stoppedDetails.allThreadsStopped) {
                    this.threads.forEach(thread => {
                        thread.stoppedDetails = thread.threadId === stoppedDetails.threadId ? stoppedDetails : { reason: thread.stoppedDetails?.reason };
                        thread.stopped = true;
                        thread.clearCallStack();
                    });
                }
                else {
                    const thread = typeof stoppedDetails.threadId === 'number' ? this.threads.get(stoppedDetails.threadId) : undefined;
                    if (thread) {
                        // One thread is stopped, only update that thread.
                        thread.stoppedDetails = stoppedDetails;
                        thread.clearCallStack();
                        thread.stopped = true;
                    }
                }
            }
        }
        async fetchThreads(stoppedDetails) {
            if (this.raw) {
                const response = await this.raw.threads();
                if (response && response.body && response.body.threads) {
                    this.model.rawUpdate({
                        sessionId: this.getId(),
                        threads: response.body.threads,
                        stoppedDetails
                    });
                }
            }
        }
        initializeForTest(raw) {
            this.raw = raw;
            this.registerListeners();
        }
        //---- private
        registerListeners() {
            if (!this.raw) {
                return;
            }
            this.rawListeners.add(this.raw.onDidInitialize(async () => {
                aria.status((0, nls_1.localize)('debuggingStarted', "Debugging started."));
                const sendConfigurationDone = async () => {
                    if (this.raw && this.raw.capabilities.supportsConfigurationDoneRequest) {
                        try {
                            await this.raw.configurationDone();
                        }
                        catch (e) {
                            // Disconnect the debug session on configuration done error #10596
                            this.notificationService.error(e);
                            this.raw?.disconnect({});
                        }
                    }
                    return undefined;
                };
                // Send all breakpoints
                try {
                    await this.debugService.sendAllBreakpoints(this);
                }
                finally {
                    await sendConfigurationDone();
                    await this.fetchThreads();
                }
            }));
            const statusQueue = new async_1.Queue();
            this.rawListeners.add(this.raw.onDidStop(async (event) => {
                statusQueue.queue(async () => {
                    this.passFocusScheduler.cancel();
                    this.stoppedDetails.push(event.body);
                    await this.fetchThreads(event.body);
                    // If the focus for the current session is on a non-existent thread, clear the focus.
                    const focusedThread = this.debugService.getViewModel().focusedThread;
                    const focusedThreadDoesNotExist = focusedThread !== undefined && focusedThread.session === this && !this.threads.has(focusedThread.threadId);
                    if (focusedThreadDoesNotExist) {
                        this.debugService.focusStackFrame(undefined, undefined);
                    }
                    const thread = typeof event.body.threadId === 'number' ? this.getThread(event.body.threadId) : undefined;
                    if (thread) {
                        // Call fetch call stack twice, the first only return the top stack frame.
                        // Second retrieves the rest of the call stack. For performance reasons #25605
                        const promises = this.model.refreshTopOfCallstack(thread);
                        const focus = async () => {
                            if (focusedThreadDoesNotExist || (!event.body.preserveFocusHint && thread.getCallStack().length)) {
                                const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                                if (!focusedStackFrame || focusedStackFrame.thread.session === this) {
                                    // Only take focus if nothing is focused, or if the focus is already on the current session
                                    const preserveFocus = !this.configurationService.getValue('debug').focusEditorOnBreak;
                                    await this.debugService.focusStackFrame(undefined, thread, undefined, { preserveFocus });
                                }
                                if (thread.stoppedDetails) {
                                    if (thread.stoppedDetails.reason === 'breakpoint' && this.configurationService.getValue('debug').openDebug === 'openOnDebugBreak' && !this.suppressDebugView) {
                                        await this.paneCompositeService.openPaneComposite(debug_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */);
                                    }
                                    if (this.configurationService.getValue('debug').focusWindowOnBreak && !this.workbenchEnvironmentService.extensionTestsLocationURI) {
                                        await this.hostService.focus({ force: true /* Application may not be active */ });
                                    }
                                }
                            }
                        };
                        await promises.topCallStack;
                        focus();
                        await promises.wholeCallStack;
                        const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                        if (!focusedStackFrame || !focusedStackFrame.source || focusedStackFrame.source.presentationHint === 'deemphasize' || focusedStackFrame.presentationHint === 'deemphasize') {
                            // The top stack frame can be deemphesized so try to focus again #68616
                            focus();
                        }
                    }
                    this._onDidChangeState.fire();
                });
            }));
            this.rawListeners.add(this.raw.onDidThread(event => {
                statusQueue.queue(async () => {
                    if (event.body.reason === 'started') {
                        // debounce to reduce threadsRequest frequency and improve performance
                        if (!this.fetchThreadsScheduler) {
                            this.fetchThreadsScheduler = new async_1.RunOnceScheduler(() => {
                                this.fetchThreads();
                            }, 100);
                            this.rawListeners.add(this.fetchThreadsScheduler);
                        }
                        if (!this.fetchThreadsScheduler.isScheduled()) {
                            this.fetchThreadsScheduler.schedule();
                        }
                    }
                    else if (event.body.reason === 'exited') {
                        this.model.clearThreads(this.getId(), true, event.body.threadId);
                        const viewModel = this.debugService.getViewModel();
                        const focusedThread = viewModel.focusedThread;
                        this.passFocusScheduler.cancel();
                        if (focusedThread && event.body.threadId === focusedThread.threadId) {
                            // De-focus the thread in case it was focused
                            this.debugService.focusStackFrame(undefined, undefined, viewModel.focusedSession, { explicit: false });
                        }
                    }
                });
            }));
            this.rawListeners.add(this.raw.onDidTerminateDebugee(async (event) => {
                aria.status((0, nls_1.localize)('debuggingStopped', "Debugging stopped."));
                if (event.body && event.body.restart) {
                    await this.debugService.restartSession(this, event.body.restart);
                }
                else if (this.raw) {
                    await this.raw.disconnect({ terminateDebuggee: false });
                }
            }));
            this.rawListeners.add(this.raw.onDidContinued(event => {
                statusQueue.queue(async () => {
                    const threadId = event.body.allThreadsContinued !== false ? undefined : event.body.threadId;
                    if (typeof threadId === 'number') {
                        this.stoppedDetails = this.stoppedDetails.filter(sd => sd.threadId !== threadId);
                        const tokens = this.cancellationMap.get(threadId);
                        this.cancellationMap.delete(threadId);
                        tokens?.forEach(t => t.dispose(true));
                    }
                    else {
                        this.stoppedDetails = [];
                        this.cancelAllRequests();
                    }
                    this.lastContinuedThreadId = threadId;
                    // We need to pass focus to other sessions / threads with a timeout in case a quick stop event occurs #130321
                    this.passFocusScheduler.schedule();
                    this.model.clearThreads(this.getId(), false, threadId);
                    this._onDidChangeState.fire();
                });
            }));
            const outputQueue = new async_1.Queue();
            this.rawListeners.add(this.raw.onDidOutput(async (event) => {
                const outputSeverity = event.body.category === 'stderr' ? severity_1.default.Error : event.body.category === 'console' ? severity_1.default.Warning : severity_1.default.Info;
                // When a variables event is received, execute immediately to obtain the variables value #126967
                if (event.body.variablesReference) {
                    const source = event.body.source && event.body.line ? {
                        lineNumber: event.body.line,
                        column: event.body.column ? event.body.column : 1,
                        source: this.getSource(event.body.source)
                    } : undefined;
                    const container = new debugModel_1.ExpressionContainer(this, undefined, event.body.variablesReference, (0, uuid_1.generateUuid)());
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
                        if (telemetryEndpoint && this.telemetryService.telemetryLevel !== 0 /* TelemetryLevel.NONE */) {
                            // __GDPR__TODO__ We're sending events in the name of the debug extension and we can not ensure that those are declared correctly.
                            let data = event.body.data;
                            if (!telemetryEndpoint.sendErrorTelemetry && event.body.data) {
                                data = (0, debugUtils_1.filterExceptionsFromTelemetry)(event.body.data);
                            }
                            this.customEndpointTelemetryService.publicLog(telemetryEndpoint, event.body.output, data);
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
                        this.repl.startGroup(event.body.output || '', expanded, source);
                        return;
                    }
                    if (event.body.group === 'end') {
                        this.repl.endGroup();
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
            this.rawListeners.add(this.raw.onDidBreakpoint(event => {
                const id = event.body && event.body.breakpoint ? event.body.breakpoint.id : undefined;
                const breakpoint = this.model.getBreakpoints().find(bp => bp.getIdFromAdapter(this.getId()) === id);
                const functionBreakpoint = this.model.getFunctionBreakpoints().find(bp => bp.getIdFromAdapter(this.getId()) === id);
                const dataBreakpoint = this.model.getDataBreakpoints().find(dbp => dbp.getIdFromAdapter(this.getId()) === id);
                const exceptionBreakpoint = this.model.getExceptionBreakpoints().find(excbp => excbp.getIdFromAdapter(this.getId()) === id);
                if (event.body.reason === 'new' && event.body.breakpoint.source && event.body.breakpoint.line) {
                    const source = this.getSource(event.body.breakpoint.source);
                    const bps = this.model.addBreakpoints(source.uri, [{
                            column: event.body.breakpoint.column,
                            enabled: true,
                            lineNumber: event.body.breakpoint.line,
                        }], false);
                    if (bps.length === 1) {
                        const data = new Map([[bps[0].getId(), event.body.breakpoint]]);
                        this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                }
                if (event.body.reason === 'removed') {
                    if (breakpoint) {
                        this.model.removeBreakpoints([breakpoint]);
                    }
                    if (functionBreakpoint) {
                        this.model.removeFunctionBreakpoints(functionBreakpoint.getId());
                    }
                    if (dataBreakpoint) {
                        this.model.removeDataBreakpoints(dataBreakpoint.getId());
                    }
                }
                if (event.body.reason === 'changed') {
                    if (breakpoint) {
                        if (!breakpoint.column) {
                            event.body.breakpoint.column = undefined;
                        }
                        const data = new Map([[breakpoint.getId(), event.body.breakpoint]]);
                        this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                    if (functionBreakpoint) {
                        const data = new Map([[functionBreakpoint.getId(), event.body.breakpoint]]);
                        this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                    if (dataBreakpoint) {
                        const data = new Map([[dataBreakpoint.getId(), event.body.breakpoint]]);
                        this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                    if (exceptionBreakpoint) {
                        const data = new Map([[exceptionBreakpoint.getId(), event.body.breakpoint]]);
                        this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                }
            }));
            this.rawListeners.add(this.raw.onDidLoadedSource(event => {
                this._onDidLoadedSource.fire({
                    reason: event.body.reason,
                    source: this.getSource(event.body.source)
                });
            }));
            this.rawListeners.add(this.raw.onDidCustomEvent(event => {
                this._onDidCustomEvent.fire(event);
            }));
            this.rawListeners.add(this.raw.onDidProgressStart(event => {
                this._onDidProgressStart.fire(event);
            }));
            this.rawListeners.add(this.raw.onDidProgressUpdate(event => {
                this._onDidProgressUpdate.fire(event);
            }));
            this.rawListeners.add(this.raw.onDidProgressEnd(event => {
                this._onDidProgressEnd.fire(event);
            }));
            this.rawListeners.add(this.raw.onDidInvalidateMemory(event => {
                this._onDidInvalidMemory.fire(event);
            }));
            this.rawListeners.add(this.raw.onDidInvalidated(async (event) => {
                if (!(event.body.areas && event.body.areas.length === 1 && (event.body.areas[0] === 'variables' || event.body.areas[0] === 'watch'))) {
                    // If invalidated event only requires to update variables or watch, do that, otherwise refatch threads https://github.com/microsoft/vscode/issues/106745
                    this.cancelAllRequests();
                    this.model.clearThreads(this.getId(), true);
                    await this.fetchThreads(this.getStoppedDetails());
                }
                const viewModel = this.debugService.getViewModel();
                if (viewModel.focusedSession === this) {
                    viewModel.updateViews();
                }
            }));
            this.rawListeners.add(this.raw.onDidExitAdapter(event => this.onDidExitAdapter(event)));
        }
        onDidExitAdapter(event) {
            this.initialized = true;
            this.model.setBreakpointSessionData(this.getId(), this.capabilities, undefined);
            this.shutdown();
            this._onDidEndAdapter.fire(event);
        }
        // Disconnects and clears state. Session can be initialized again for a new connection.
        shutdown() {
            this.rawListeners.clear();
            if (this.raw) {
                // Send out disconnect and immediatly dispose (do not wait for response) #127418
                this.raw.disconnect({});
                this.raw.dispose();
                this.raw = undefined;
            }
            this.fetchThreadsScheduler?.dispose();
            this.fetchThreadsScheduler = undefined;
            this.passFocusScheduler.cancel();
            this.passFocusScheduler.dispose();
            this.model.clearThreads(this.getId(), true);
            this._onDidChangeState.fire();
        }
        dispose() {
            this.cancelAllRequests();
            this.rawListeners.dispose();
        }
        //---- sources
        getSourceForUri(uri) {
            return this.sources.get(this.uriIdentityService.asCanonicalUri(uri).toString());
        }
        getSource(raw) {
            let source = new debugSource_1.Source(raw, this.getId(), this.uriIdentityService, this.logService);
            const uriKey = source.uri.toString();
            const found = this.sources.get(uriKey);
            if (found) {
                source = found;
                // merge attributes of new into existing
                source.raw = (0, objects_1.mixin)(source.raw, raw);
                if (source.raw && raw) {
                    // Always take the latest presentation hint from adapter #42139
                    source.raw.presentationHint = raw.presentationHint;
                }
            }
            else {
                this.sources.set(uriKey, source);
            }
            return source;
        }
        getRawSource(uri) {
            const source = this.getSourceForUri(uri);
            if (source) {
                return source.raw;
            }
            else {
                const data = debugSource_1.Source.getEncodedDebugData(uri);
                return { name: data.name, path: data.path, sourceReference: data.sourceReference };
            }
        }
        getNewCancellationToken(threadId, token) {
            const tokenSource = new cancellation_1.CancellationTokenSource(token);
            const tokens = this.cancellationMap.get(threadId) || [];
            tokens.push(tokenSource);
            this.cancellationMap.set(threadId, tokens);
            return tokenSource.token;
        }
        cancelAllRequests() {
            this.cancellationMap.forEach(tokens => tokens.forEach(t => t.dispose(true)));
            this.cancellationMap.clear();
        }
        // REPL
        getReplElements() {
            return this.repl.getReplElements();
        }
        hasSeparateRepl() {
            return !this.parentSession || this._options.repl !== 'mergeWithParent';
        }
        removeReplExpressions() {
            this.repl.removeReplExpressions();
        }
        async addReplExpression(stackFrame, name) {
            await this.repl.addReplExpression(this, stackFrame, name);
            // Evaluate all watch expressions and fetch variables again since repl evaluation might have changed some.
            this.debugService.getViewModel().updateViews();
        }
        appendToRepl(data, isImportant) {
            this.repl.appendToRepl(this, data);
            if (isImportant) {
                this.notificationService.notify({ message: data.output.toString(), severity: data.sev, source: this.name });
            }
        }
    };
    exports.DebugSession = DebugSession;
    exports.DebugSession = DebugSession = __decorate([
        __param(5, debug_1.IDebugService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, host_1.IHostService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, panecomposite_1.IPaneCompositePartService),
        __param(10, workspace_1.IWorkspaceContextService),
        __param(11, productService_1.IProductService),
        __param(12, notification_1.INotificationService),
        __param(13, lifecycle_2.ILifecycleService),
        __param(14, uriIdentity_1.IUriIdentityService),
        __param(15, instantiation_1.IInstantiationService),
        __param(16, telemetry_1.ICustomEndpointTelemetryService),
        __param(17, environmentService_1.IWorkbenchEnvironmentService),
        __param(18, log_1.ILogService)
    ], DebugSession);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdTZXNzaW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kZWJ1Z1Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUN6RixJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFZO1FBa0N4QixZQUNTLEVBQVUsRUFDVixjQUFzRSxFQUN2RSxJQUFrQyxFQUNqQyxLQUFpQixFQUN6QixPQUF5QyxFQUMxQixZQUE0QyxFQUN4QyxnQkFBb0QsRUFDekQsV0FBMEMsRUFDakMsb0JBQTRELEVBQ3hELG9CQUFnRSxFQUNqRSx1QkFBa0UsRUFDM0UsY0FBZ0QsRUFDM0MsbUJBQTBELEVBQzdELGdCQUFtQyxFQUNqQyxrQkFBd0QsRUFDdEQsb0JBQTRELEVBQ2xELDhCQUFnRixFQUNuRiwyQkFBMEUsRUFDM0YsVUFBd0M7WUFsQjdDLE9BQUUsR0FBRixFQUFFLENBQVE7WUFDVixtQkFBYyxHQUFkLGNBQWMsQ0FBd0Q7WUFDdkUsU0FBSSxHQUFKLElBQUksQ0FBOEI7WUFDakMsVUFBSyxHQUFMLEtBQUssQ0FBWTtZQUVPLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3ZCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDeEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDaEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUN2Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTJCO1lBQ2hELDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDMUQsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzFCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFFMUMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUNyQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2pDLG1DQUE4QixH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