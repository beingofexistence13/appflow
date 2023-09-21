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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/rawDebugSession", "vs/base/common/event", "vs/base/common/objects", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/workbench/contrib/debug/common/debugUtils", "vs/platform/debug/common/extensionHostDebug", "vs/base/common/uri", "vs/platform/opener/common/opener", "vs/base/common/lifecycle", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/base/common/network"], function (require, exports, nls, event_1, objects, actions_1, errors, errorMessage_1, debugUtils_1, extensionHostDebug_1, uri_1, opener_1, lifecycle_1, notification_1, dialogs_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RRb = void 0;
    /**
     * Encapsulates the DebugAdapter lifecycle and some idiosyncrasies of the Debug Adapter Protocol.
     */
    let $RRb = class $RRb {
        constructor(debugAdapter, dbgr, E, F, G, H, I, J) {
            this.dbgr = dbgr;
            this.E = E;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.a = true;
            this.b = false;
            // shutdown
            this.d = false;
            this.f = false;
            this.g = false;
            this.h = false;
            // telemetry
            this.i = 0;
            this.j = false;
            // DAP events
            this.k = new event_1.$fd();
            this.l = new event_1.$fd();
            this.m = new event_1.$fd();
            this.n = new event_1.$fd();
            this.o = new event_1.$fd();
            this.p = new event_1.$fd();
            this.q = new event_1.$fd();
            this.r = new event_1.$fd();
            this.s = new event_1.$fd();
            this.t = new event_1.$fd();
            this.u = new event_1.$fd();
            this.v = new event_1.$fd();
            this.w = new event_1.$fd();
            this.x = new event_1.$fd();
            this.y = new event_1.$fd();
            this.z = new event_1.$fd();
            // DA events
            this.A = new event_1.$fd();
            this.C = false;
            this.D = [];
            this.B = debugAdapter;
            this.c = Object.create(null);
            this.D.push(this.B.onError(err => {
                this.K(err);
            }));
            this.D.push(this.B.onExit(code => {
                if (code !== 0) {
                    this.K(new Error(`exit code: ${code}`));
                }
                else {
                    // normal exit
                    this.K();
                }
            }));
            this.B.onEvent(event => {
                switch (event.event) {
                    case 'initialized':
                        this.b = true;
                        this.k.fire(event);
                        break;
                    case 'loadedSource':
                        this.s.fire(event);
                        break;
                    case 'capabilities':
                        if (event.body) {
                            const capabilities = event.body.capabilities;
                            this.S(capabilities);
                        }
                        break;
                    case 'stopped':
                        this.j = true; // telemetry: remember that debugger stopped successfully
                        this.C = true;
                        this.l.fire(event);
                        break;
                    case 'continued':
                        this.a = event.body.allThreadsContinued === false ? false : true;
                        this.m.fire(event);
                        break;
                    case 'thread':
                        this.p.fire(event);
                        break;
                    case 'output':
                        this.q.fire(event);
                        break;
                    case 'breakpoint':
                        this.r.fire(event);
                        break;
                    case 'terminated':
                        this.n.fire(event);
                        break;
                    case 'exited':
                        this.o.fire(event);
                        break;
                    case 'progressStart':
                        this.t.fire(event);
                        break;
                    case 'progressUpdate':
                        this.u.fire(event);
                        break;
                    case 'progressEnd':
                        this.v.fire(event);
                        break;
                    case 'invalidated':
                        this.w.fire(event);
                        break;
                    case 'memory':
                        this.x.fire(event);
                        break;
                    case 'process':
                        break;
                    case 'module':
                        break;
                    default:
                        this.y.fire(event);
                        break;
                }
                this.z.fire(event);
            });
            this.B.onRequest(request => this.N(request));
        }
        get isInShutdown() {
            return this.f;
        }
        get onDidExitAdapter() {
            return this.A.event;
        }
        get capabilities() {
            return this.c;
        }
        /**
         * DA is ready to accepts setBreakpoint requests.
         * Becomes true after "initialized" events has been received.
         */
        get readyForBreakpoints() {
            return this.b;
        }
        //---- DAP events
        get onDidInitialize() {
            return this.k.event;
        }
        get onDidStop() {
            return this.l.event;
        }
        get onDidContinued() {
            return this.m.event;
        }
        get onDidTerminateDebugee() {
            return this.n.event;
        }
        get onDidExitDebugee() {
            return this.o.event;
        }
        get onDidThread() {
            return this.p.event;
        }
        get onDidOutput() {
            return this.q.event;
        }
        get onDidBreakpoint() {
            return this.r.event;
        }
        get onDidLoadedSource() {
            return this.s.event;
        }
        get onDidCustomEvent() {
            return this.y.event;
        }
        get onDidProgressStart() {
            return this.t.event;
        }
        get onDidProgressUpdate() {
            return this.u.event;
        }
        get onDidProgressEnd() {
            return this.v.event;
        }
        get onDidInvalidated() {
            return this.w.event;
        }
        get onDidInvalidateMemory() {
            return this.x.event;
        }
        get onDidEvent() {
            return this.z.event;
        }
        //---- DebugAdapter lifecycle
        /**
         * Starts the underlying debug adapter and tracks the session time for telemetry.
         */
        async start() {
            if (!this.B) {
                return Promise.reject(new Error(nls.localize(0, null)));
            }
            await this.B.startSession();
            this.i = new Date().getTime();
        }
        /**
         * Send client capabilities to the debug adapter and receive DA capabilities in return.
         */
        async initialize(args) {
            const response = await this.P('initialize', args, undefined, undefined, false);
            if (response) {
                this.S(response.body);
            }
            return response;
        }
        /**
         * Terminate the debuggee and shutdown the adapter
         */
        disconnect(args) {
            const terminateDebuggee = this.capabilities.supportTerminateDebuggee ? args.terminateDebuggee : undefined;
            const suspendDebuggee = this.capabilities.supportTerminateDebuggee && this.capabilities.supportSuspendDebuggee ? args.suspendDebuggee : undefined;
            return this.K(undefined, args.restart, terminateDebuggee, suspendDebuggee);
        }
        //---- DAP requests
        async launchOrAttach(config) {
            const response = await this.P(config.request, config, undefined, undefined, false);
            if (response) {
                this.S(response.body);
            }
            return response;
        }
        /**
         * Try killing the debuggee softly...
         */
        terminate(restart = false) {
            if (this.capabilities.supportsTerminateRequest) {
                if (!this.g) {
                    this.g = true;
                    return this.P('terminate', { restart }, undefined);
                }
                return this.disconnect({ terminateDebuggee: true, restart });
            }
            return Promise.reject(new Error('terminated not supported'));
        }
        restart(args) {
            if (this.capabilities.supportsRestartRequest) {
                return this.P('restart', args);
            }
            return Promise.reject(new Error('restart not supported'));
        }
        async next(args) {
            this.C = false;
            const response = await this.P('next', args);
            if (!this.C) {
                this.T(args.threadId);
            }
            return response;
        }
        async stepIn(args) {
            this.C = false;
            const response = await this.P('stepIn', args);
            if (!this.C) {
                this.T(args.threadId);
            }
            return response;
        }
        async stepOut(args) {
            this.C = false;
            const response = await this.P('stepOut', args);
            if (!this.C) {
                this.T(args.threadId);
            }
            return response;
        }
        async continue(args) {
            this.C = false;
            const response = await this.P('continue', args);
            if (response && response.body && response.body.allThreadsContinued !== undefined) {
                this.a = response.body.allThreadsContinued;
            }
            if (!this.C) {
                this.T(args.threadId, this.a);
            }
            return response;
        }
        pause(args) {
            return this.P('pause', args);
        }
        terminateThreads(args) {
            if (this.capabilities.supportsTerminateThreadsRequest) {
                return this.P('terminateThreads', args);
            }
            return Promise.reject(new Error('terminateThreads not supported'));
        }
        setVariable(args) {
            if (this.capabilities.supportsSetVariable) {
                return this.P('setVariable', args);
            }
            return Promise.reject(new Error('setVariable not supported'));
        }
        setExpression(args) {
            if (this.capabilities.supportsSetExpression) {
                return this.P('setExpression', args);
            }
            return Promise.reject(new Error('setExpression not supported'));
        }
        async restartFrame(args, threadId) {
            if (this.capabilities.supportsRestartFrame) {
                this.C = false;
                const response = await this.P('restartFrame', args);
                if (!this.C) {
                    this.T(threadId);
                }
                return response;
            }
            return Promise.reject(new Error('restartFrame not supported'));
        }
        stepInTargets(args) {
            if (this.capabilities.supportsStepInTargetsRequest) {
                return this.P('stepInTargets', args);
            }
            return Promise.reject(new Error('stepInTargets not supported'));
        }
        completions(args, token) {
            if (this.capabilities.supportsCompletionsRequest) {
                return this.P('completions', args, token);
            }
            return Promise.reject(new Error('completions not supported'));
        }
        setBreakpoints(args) {
            return this.P('setBreakpoints', args);
        }
        setFunctionBreakpoints(args) {
            if (this.capabilities.supportsFunctionBreakpoints) {
                return this.P('setFunctionBreakpoints', args);
            }
            return Promise.reject(new Error('setFunctionBreakpoints not supported'));
        }
        dataBreakpointInfo(args) {
            if (this.capabilities.supportsDataBreakpoints) {
                return this.P('dataBreakpointInfo', args);
            }
            return Promise.reject(new Error('dataBreakpointInfo not supported'));
        }
        setDataBreakpoints(args) {
            if (this.capabilities.supportsDataBreakpoints) {
                return this.P('setDataBreakpoints', args);
            }
            return Promise.reject(new Error('setDataBreakpoints not supported'));
        }
        setExceptionBreakpoints(args) {
            return this.P('setExceptionBreakpoints', args);
        }
        breakpointLocations(args) {
            if (this.capabilities.supportsBreakpointLocationsRequest) {
                return this.P('breakpointLocations', args);
            }
            return Promise.reject(new Error('breakpointLocations is not supported'));
        }
        configurationDone() {
            if (this.capabilities.supportsConfigurationDoneRequest) {
                return this.P('configurationDone', null);
            }
            return Promise.reject(new Error('configurationDone not supported'));
        }
        stackTrace(args, token) {
            return this.P('stackTrace', args, token);
        }
        exceptionInfo(args) {
            if (this.capabilities.supportsExceptionInfoRequest) {
                return this.P('exceptionInfo', args);
            }
            return Promise.reject(new Error('exceptionInfo not supported'));
        }
        scopes(args, token) {
            return this.P('scopes', args, token);
        }
        variables(args, token) {
            return this.P('variables', args, token);
        }
        source(args) {
            return this.P('source', args);
        }
        loadedSources(args) {
            if (this.capabilities.supportsLoadedSourcesRequest) {
                return this.P('loadedSources', args);
            }
            return Promise.reject(new Error('loadedSources not supported'));
        }
        threads() {
            return this.P('threads', null);
        }
        evaluate(args) {
            return this.P('evaluate', args);
        }
        async stepBack(args) {
            if (this.capabilities.supportsStepBack) {
                this.C = false;
                const response = await this.P('stepBack', args);
                if (!this.C) {
                    this.T(args.threadId);
                }
                return response;
            }
            return Promise.reject(new Error('stepBack not supported'));
        }
        async reverseContinue(args) {
            if (this.capabilities.supportsStepBack) {
                this.C = false;
                const response = await this.P('reverseContinue', args);
                if (!this.C) {
                    this.T(args.threadId);
                }
                return response;
            }
            return Promise.reject(new Error('reverseContinue not supported'));
        }
        gotoTargets(args) {
            if (this.capabilities.supportsGotoTargetsRequest) {
                return this.P('gotoTargets', args);
            }
            return Promise.reject(new Error('gotoTargets is not supported'));
        }
        async goto(args) {
            if (this.capabilities.supportsGotoTargetsRequest) {
                this.C = false;
                const response = await this.P('goto', args);
                if (!this.C) {
                    this.T(args.threadId);
                }
                return response;
            }
            return Promise.reject(new Error('goto is not supported'));
        }
        async setInstructionBreakpoints(args) {
            if (this.capabilities.supportsInstructionBreakpoints) {
                return await this.P('setInstructionBreakpoints', args);
            }
            return Promise.reject(new Error('setInstructionBreakpoints is not supported'));
        }
        async disassemble(args) {
            if (this.capabilities.supportsDisassembleRequest) {
                return await this.P('disassemble', args);
            }
            return Promise.reject(new Error('disassemble is not supported'));
        }
        async readMemory(args) {
            if (this.capabilities.supportsReadMemoryRequest) {
                return await this.P('readMemory', args);
            }
            return Promise.reject(new Error('readMemory is not supported'));
        }
        async writeMemory(args) {
            if (this.capabilities.supportsWriteMemoryRequest) {
                return await this.P('writeMemory', args);
            }
            return Promise.reject(new Error('writeMemory is not supported'));
        }
        cancel(args) {
            return this.P('cancel', args);
        }
        custom(request, args) {
            return this.P(request, args);
        }
        //---- private
        async K(error, restart = false, terminateDebuggee = undefined, suspendDebuggee = undefined) {
            if (!this.f) {
                this.f = true;
                if (this.B) {
                    try {
                        const args = { restart };
                        if (typeof terminateDebuggee === 'boolean') {
                            args.terminateDebuggee = terminateDebuggee;
                        }
                        if (typeof suspendDebuggee === 'boolean') {
                            args.suspendDebuggee = suspendDebuggee;
                        }
                        // if there's an error, the DA is probably already gone, so give it a much shorter timeout.
                        await this.P('disconnect', args, undefined, error ? 200 : 2000);
                    }
                    catch (e) {
                        // Catch the potential 'disconnect' error - no need to show it to the user since the adapter is shutting down
                    }
                    finally {
                        await this.L(error);
                    }
                }
                else {
                    return this.L(error);
                }
            }
        }
        async L(error) {
            try {
                if (this.B) {
                    const da = this.B;
                    this.B = null;
                    await da.stopSession();
                    this.d = true;
                }
            }
            finally {
                this.M(error);
            }
        }
        M(error) {
            if (!this.h) {
                this.h = true;
                const e = {
                    emittedStopped: this.j,
                    sessionLengthInSeconds: (new Date().getTime() - this.i) / 1000
                };
                if (error && !this.d) {
                    e.error = error;
                }
                this.A.fire(e);
            }
        }
        async N(request) {
            const response = {
                type: 'response',
                seq: 0,
                command: request.command,
                request_seq: request.seq,
                success: true
            };
            const safeSendResponse = (response) => this.B && this.B.sendResponse(response);
            if (request.command === 'launchVSCode') {
                try {
                    let result = await this.O(request.arguments);
                    if (!result.success) {
                        const { confirmed } = await this.J.confirm({
                            type: notification_1.Severity.Warning,
                            message: nls.localize(1, null),
                            primaryButton: nls.localize(2, null)
                        });
                        if (confirmed) {
                            result = await this.O(request.arguments);
                        }
                        else {
                            response.success = false;
                            safeSendResponse(response);
                            await this.K();
                        }
                    }
                    response.body = {
                        rendererDebugPort: result.rendererDebugPort,
                    };
                    safeSendResponse(response);
                }
                catch (err) {
                    response.success = false;
                    response.message = err.message;
                    safeSendResponse(response);
                }
            }
            else if (request.command === 'runInTerminal') {
                try {
                    const shellProcessId = await this.dbgr.runInTerminal(request.arguments, this.E);
                    const resp = response;
                    resp.body = {};
                    if (typeof shellProcessId === 'number') {
                        resp.body.shellProcessId = shellProcessId;
                    }
                    safeSendResponse(resp);
                }
                catch (err) {
                    response.success = false;
                    response.message = err.message;
                    safeSendResponse(response);
                }
            }
            else if (request.command === 'startDebugging') {
                try {
                    const args = request.arguments;
                    const config = {
                        ...args.configuration,
                        ...{
                            request: args.request,
                            type: this.dbgr.type,
                            name: args.configuration.name || this.F
                        }
                    };
                    const success = await this.dbgr.startDebugging(config, this.E);
                    if (success) {
                        safeSendResponse(response);
                    }
                    else {
                        response.success = false;
                        response.message = 'Failed to start debugging';
                        safeSendResponse(response);
                    }
                }
                catch (err) {
                    response.success = false;
                    response.message = err.message;
                    safeSendResponse(response);
                }
            }
            else {
                response.success = false;
                response.message = `unknown request '${request.command}'`;
                safeSendResponse(response);
            }
        }
        O(vscodeArgs) {
            const args = [];
            for (const arg of vscodeArgs.args) {
                const a2 = (arg.prefix || '') + (arg.path || '');
                const match = /^--(.+)=(.+)$/.exec(a2);
                if (match && match.length === 3) {
                    const key = match[1];
                    let value = match[2];
                    if ((key === 'file-uri' || key === 'folder-uri') && !(0, debugUtils_1.$pF)(arg.path)) {
                        value = (0, debugUtils_1.$pF)(value) ? value : uri_1.URI.file(value).toString();
                    }
                    args.push(`--${key}=${value}`);
                }
                else {
                    args.push(a2);
                }
            }
            if (vscodeArgs.env) {
                args.push(`--extensionEnvironment=${JSON.stringify(vscodeArgs.env)}`);
            }
            return this.G.openExtensionDevelopmentHostWindow(args, !!vscodeArgs.debugRenderer);
        }
        P(command, args, token, timeout, showErrors = true) {
            return new Promise((completeDispatch, errorDispatch) => {
                if (!this.B) {
                    if (this.f) {
                        // We are in shutdown silently complete
                        completeDispatch(undefined);
                    }
                    else {
                        errorDispatch(new Error(nls.localize(3, null, command)));
                    }
                    return;
                }
                let cancelationListener;
                const requestId = this.B.sendRequest(command, args, (response) => {
                    cancelationListener?.dispose();
                    if (response.success) {
                        completeDispatch(response);
                    }
                    else {
                        errorDispatch(response);
                    }
                }, timeout);
                if (token) {
                    cancelationListener = token.onCancellationRequested(() => {
                        cancelationListener.dispose();
                        if (this.capabilities.supportsCancelRequest) {
                            this.cancel({ requestId });
                        }
                    });
                }
            }).then(undefined, err => Promise.reject(this.Q(err, showErrors)));
        }
        Q(errorResponse, showErrors) {
            if (errorResponse.command === 'canceled' && errorResponse.message === 'canceled') {
                return new errors.$3();
            }
            const error = errorResponse?.body?.error;
            const errorMessage = errorResponse?.message || '';
            const userMessage = error ? (0, debugUtils_1.$iF)(error.format, false, error.variables) : errorMessage;
            const url = error?.url;
            if (error && url) {
                const label = error.urlLabel ? error.urlLabel : nls.localize(4, null);
                const uri = uri_1.URI.parse(url);
                // Use a suffixed id if uri invokes a command, so default 'Open launch.json' command is suppressed on dialog
                const actionId = uri.scheme === network_1.Schemas.command ? 'debug.moreInfo.command' : 'debug.moreInfo';
                return (0, errorMessage_1.$oi)(userMessage, [(0, actions_1.$li)({ id: actionId, label, run: () => this.H.open(uri, { allowCommands: true }) })]);
            }
            if (showErrors && error && error.format && error.showUser) {
                this.I.error(userMessage);
            }
            const result = new errors.$_(userMessage);
            result.showUser = error?.showUser;
            return result;
        }
        S(capabilities) {
            if (capabilities) {
                this.c = objects.$Ym(this.c, capabilities);
            }
        }
        T(threadId, allThreadsContinued = false) {
            this.m.fire({
                type: 'event',
                event: 'continued',
                body: {
                    threadId,
                    allThreadsContinued
                },
                seq: undefined
            });
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.D);
        }
    };
    exports.$RRb = $RRb;
    exports.$RRb = $RRb = __decorate([
        __param(4, extensionHostDebug_1.$An),
        __param(5, opener_1.$NT),
        __param(6, notification_1.$Yu),
        __param(7, dialogs_1.$oA)
    ], $RRb);
});
//# sourceMappingURL=rawDebugSession.js.map