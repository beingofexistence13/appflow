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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/objects", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/workbench/contrib/debug/common/debugUtils", "vs/platform/debug/common/extensionHostDebug", "vs/base/common/uri", "vs/platform/opener/common/opener", "vs/base/common/lifecycle", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/base/common/network"], function (require, exports, nls, event_1, objects, actions_1, errors, errorMessage_1, debugUtils_1, extensionHostDebug_1, uri_1, opener_1, lifecycle_1, notification_1, dialogs_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RawDebugSession = void 0;
    /**
     * Encapsulates the DebugAdapter lifecycle and some idiosyncrasies of the Debug Adapter Protocol.
     */
    let RawDebugSession = class RawDebugSession {
        constructor(debugAdapter, dbgr, sessionId, name, extensionHostDebugService, openerService, notificationService, dialogSerivce) {
            this.dbgr = dbgr;
            this.sessionId = sessionId;
            this.name = name;
            this.extensionHostDebugService = extensionHostDebugService;
            this.openerService = openerService;
            this.notificationService = notificationService;
            this.dialogSerivce = dialogSerivce;
            this.allThreadsContinued = true;
            this._readyForBreakpoints = false;
            // shutdown
            this.debugAdapterStopped = false;
            this.inShutdown = false;
            this.terminated = false;
            this.firedAdapterExitEvent = false;
            // telemetry
            this.startTime = 0;
            this.didReceiveStoppedEvent = false;
            // DAP events
            this._onDidInitialize = new event_1.Emitter();
            this._onDidStop = new event_1.Emitter();
            this._onDidContinued = new event_1.Emitter();
            this._onDidTerminateDebugee = new event_1.Emitter();
            this._onDidExitDebugee = new event_1.Emitter();
            this._onDidThread = new event_1.Emitter();
            this._onDidOutput = new event_1.Emitter();
            this._onDidBreakpoint = new event_1.Emitter();
            this._onDidLoadedSource = new event_1.Emitter();
            this._onDidProgressStart = new event_1.Emitter();
            this._onDidProgressUpdate = new event_1.Emitter();
            this._onDidProgressEnd = new event_1.Emitter();
            this._onDidInvalidated = new event_1.Emitter();
            this._onDidInvalidateMemory = new event_1.Emitter();
            this._onDidCustomEvent = new event_1.Emitter();
            this._onDidEvent = new event_1.Emitter();
            // DA events
            this._onDidExitAdapter = new event_1.Emitter();
            this.stoppedSinceLastStep = false;
            this.toDispose = [];
            this.debugAdapter = debugAdapter;
            this._capabilities = Object.create(null);
            this.toDispose.push(this.debugAdapter.onError(err => {
                this.shutdown(err);
            }));
            this.toDispose.push(this.debugAdapter.onExit(code => {
                if (code !== 0) {
                    this.shutdown(new Error(`exit code: ${code}`));
                }
                else {
                    // normal exit
                    this.shutdown();
                }
            }));
            this.debugAdapter.onEvent(event => {
                switch (event.event) {
                    case 'initialized':
                        this._readyForBreakpoints = true;
                        this._onDidInitialize.fire(event);
                        break;
                    case 'loadedSource':
                        this._onDidLoadedSource.fire(event);
                        break;
                    case 'capabilities':
                        if (event.body) {
                            const capabilities = event.body.capabilities;
                            this.mergeCapabilities(capabilities);
                        }
                        break;
                    case 'stopped':
                        this.didReceiveStoppedEvent = true; // telemetry: remember that debugger stopped successfully
                        this.stoppedSinceLastStep = true;
                        this._onDidStop.fire(event);
                        break;
                    case 'continued':
                        this.allThreadsContinued = event.body.allThreadsContinued === false ? false : true;
                        this._onDidContinued.fire(event);
                        break;
                    case 'thread':
                        this._onDidThread.fire(event);
                        break;
                    case 'output':
                        this._onDidOutput.fire(event);
                        break;
                    case 'breakpoint':
                        this._onDidBreakpoint.fire(event);
                        break;
                    case 'terminated':
                        this._onDidTerminateDebugee.fire(event);
                        break;
                    case 'exited':
                        this._onDidExitDebugee.fire(event);
                        break;
                    case 'progressStart':
                        this._onDidProgressStart.fire(event);
                        break;
                    case 'progressUpdate':
                        this._onDidProgressUpdate.fire(event);
                        break;
                    case 'progressEnd':
                        this._onDidProgressEnd.fire(event);
                        break;
                    case 'invalidated':
                        this._onDidInvalidated.fire(event);
                        break;
                    case 'memory':
                        this._onDidInvalidateMemory.fire(event);
                        break;
                    case 'process':
                        break;
                    case 'module':
                        break;
                    default:
                        this._onDidCustomEvent.fire(event);
                        break;
                }
                this._onDidEvent.fire(event);
            });
            this.debugAdapter.onRequest(request => this.dispatchRequest(request));
        }
        get isInShutdown() {
            return this.inShutdown;
        }
        get onDidExitAdapter() {
            return this._onDidExitAdapter.event;
        }
        get capabilities() {
            return this._capabilities;
        }
        /**
         * DA is ready to accepts setBreakpoint requests.
         * Becomes true after "initialized" events has been received.
         */
        get readyForBreakpoints() {
            return this._readyForBreakpoints;
        }
        //---- DAP events
        get onDidInitialize() {
            return this._onDidInitialize.event;
        }
        get onDidStop() {
            return this._onDidStop.event;
        }
        get onDidContinued() {
            return this._onDidContinued.event;
        }
        get onDidTerminateDebugee() {
            return this._onDidTerminateDebugee.event;
        }
        get onDidExitDebugee() {
            return this._onDidExitDebugee.event;
        }
        get onDidThread() {
            return this._onDidThread.event;
        }
        get onDidOutput() {
            return this._onDidOutput.event;
        }
        get onDidBreakpoint() {
            return this._onDidBreakpoint.event;
        }
        get onDidLoadedSource() {
            return this._onDidLoadedSource.event;
        }
        get onDidCustomEvent() {
            return this._onDidCustomEvent.event;
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
        get onDidInvalidated() {
            return this._onDidInvalidated.event;
        }
        get onDidInvalidateMemory() {
            return this._onDidInvalidateMemory.event;
        }
        get onDidEvent() {
            return this._onDidEvent.event;
        }
        //---- DebugAdapter lifecycle
        /**
         * Starts the underlying debug adapter and tracks the session time for telemetry.
         */
        async start() {
            if (!this.debugAdapter) {
                return Promise.reject(new Error(nls.localize('noDebugAdapterStart', "No debug adapter, can not start debug session.")));
            }
            await this.debugAdapter.startSession();
            this.startTime = new Date().getTime();
        }
        /**
         * Send client capabilities to the debug adapter and receive DA capabilities in return.
         */
        async initialize(args) {
            const response = await this.send('initialize', args, undefined, undefined, false);
            if (response) {
                this.mergeCapabilities(response.body);
            }
            return response;
        }
        /**
         * Terminate the debuggee and shutdown the adapter
         */
        disconnect(args) {
            const terminateDebuggee = this.capabilities.supportTerminateDebuggee ? args.terminateDebuggee : undefined;
            const suspendDebuggee = this.capabilities.supportTerminateDebuggee && this.capabilities.supportSuspendDebuggee ? args.suspendDebuggee : undefined;
            return this.shutdown(undefined, args.restart, terminateDebuggee, suspendDebuggee);
        }
        //---- DAP requests
        async launchOrAttach(config) {
            const response = await this.send(config.request, config, undefined, undefined, false);
            if (response) {
                this.mergeCapabilities(response.body);
            }
            return response;
        }
        /**
         * Try killing the debuggee softly...
         */
        terminate(restart = false) {
            if (this.capabilities.supportsTerminateRequest) {
                if (!this.terminated) {
                    this.terminated = true;
                    return this.send('terminate', { restart }, undefined);
                }
                return this.disconnect({ terminateDebuggee: true, restart });
            }
            return Promise.reject(new Error('terminated not supported'));
        }
        restart(args) {
            if (this.capabilities.supportsRestartRequest) {
                return this.send('restart', args);
            }
            return Promise.reject(new Error('restart not supported'));
        }
        async next(args) {
            this.stoppedSinceLastStep = false;
            const response = await this.send('next', args);
            if (!this.stoppedSinceLastStep) {
                this.fireSimulatedContinuedEvent(args.threadId);
            }
            return response;
        }
        async stepIn(args) {
            this.stoppedSinceLastStep = false;
            const response = await this.send('stepIn', args);
            if (!this.stoppedSinceLastStep) {
                this.fireSimulatedContinuedEvent(args.threadId);
            }
            return response;
        }
        async stepOut(args) {
            this.stoppedSinceLastStep = false;
            const response = await this.send('stepOut', args);
            if (!this.stoppedSinceLastStep) {
                this.fireSimulatedContinuedEvent(args.threadId);
            }
            return response;
        }
        async continue(args) {
            this.stoppedSinceLastStep = false;
            const response = await this.send('continue', args);
            if (response && response.body && response.body.allThreadsContinued !== undefined) {
                this.allThreadsContinued = response.body.allThreadsContinued;
            }
            if (!this.stoppedSinceLastStep) {
                this.fireSimulatedContinuedEvent(args.threadId, this.allThreadsContinued);
            }
            return response;
        }
        pause(args) {
            return this.send('pause', args);
        }
        terminateThreads(args) {
            if (this.capabilities.supportsTerminateThreadsRequest) {
                return this.send('terminateThreads', args);
            }
            return Promise.reject(new Error('terminateThreads not supported'));
        }
        setVariable(args) {
            if (this.capabilities.supportsSetVariable) {
                return this.send('setVariable', args);
            }
            return Promise.reject(new Error('setVariable not supported'));
        }
        setExpression(args) {
            if (this.capabilities.supportsSetExpression) {
                return this.send('setExpression', args);
            }
            return Promise.reject(new Error('setExpression not supported'));
        }
        async restartFrame(args, threadId) {
            if (this.capabilities.supportsRestartFrame) {
                this.stoppedSinceLastStep = false;
                const response = await this.send('restartFrame', args);
                if (!this.stoppedSinceLastStep) {
                    this.fireSimulatedContinuedEvent(threadId);
                }
                return response;
            }
            return Promise.reject(new Error('restartFrame not supported'));
        }
        stepInTargets(args) {
            if (this.capabilities.supportsStepInTargetsRequest) {
                return this.send('stepInTargets', args);
            }
            return Promise.reject(new Error('stepInTargets not supported'));
        }
        completions(args, token) {
            if (this.capabilities.supportsCompletionsRequest) {
                return this.send('completions', args, token);
            }
            return Promise.reject(new Error('completions not supported'));
        }
        setBreakpoints(args) {
            return this.send('setBreakpoints', args);
        }
        setFunctionBreakpoints(args) {
            if (this.capabilities.supportsFunctionBreakpoints) {
                return this.send('setFunctionBreakpoints', args);
            }
            return Promise.reject(new Error('setFunctionBreakpoints not supported'));
        }
        dataBreakpointInfo(args) {
            if (this.capabilities.supportsDataBreakpoints) {
                return this.send('dataBreakpointInfo', args);
            }
            return Promise.reject(new Error('dataBreakpointInfo not supported'));
        }
        setDataBreakpoints(args) {
            if (this.capabilities.supportsDataBreakpoints) {
                return this.send('setDataBreakpoints', args);
            }
            return Promise.reject(new Error('setDataBreakpoints not supported'));
        }
        setExceptionBreakpoints(args) {
            return this.send('setExceptionBreakpoints', args);
        }
        breakpointLocations(args) {
            if (this.capabilities.supportsBreakpointLocationsRequest) {
                return this.send('breakpointLocations', args);
            }
            return Promise.reject(new Error('breakpointLocations is not supported'));
        }
        configurationDone() {
            if (this.capabilities.supportsConfigurationDoneRequest) {
                return this.send('configurationDone', null);
            }
            return Promise.reject(new Error('configurationDone not supported'));
        }
        stackTrace(args, token) {
            return this.send('stackTrace', args, token);
        }
        exceptionInfo(args) {
            if (this.capabilities.supportsExceptionInfoRequest) {
                return this.send('exceptionInfo', args);
            }
            return Promise.reject(new Error('exceptionInfo not supported'));
        }
        scopes(args, token) {
            return this.send('scopes', args, token);
        }
        variables(args, token) {
            return this.send('variables', args, token);
        }
        source(args) {
            return this.send('source', args);
        }
        loadedSources(args) {
            if (this.capabilities.supportsLoadedSourcesRequest) {
                return this.send('loadedSources', args);
            }
            return Promise.reject(new Error('loadedSources not supported'));
        }
        threads() {
            return this.send('threads', null);
        }
        evaluate(args) {
            return this.send('evaluate', args);
        }
        async stepBack(args) {
            if (this.capabilities.supportsStepBack) {
                this.stoppedSinceLastStep = false;
                const response = await this.send('stepBack', args);
                if (!this.stoppedSinceLastStep) {
                    this.fireSimulatedContinuedEvent(args.threadId);
                }
                return response;
            }
            return Promise.reject(new Error('stepBack not supported'));
        }
        async reverseContinue(args) {
            if (this.capabilities.supportsStepBack) {
                this.stoppedSinceLastStep = false;
                const response = await this.send('reverseContinue', args);
                if (!this.stoppedSinceLastStep) {
                    this.fireSimulatedContinuedEvent(args.threadId);
                }
                return response;
            }
            return Promise.reject(new Error('reverseContinue not supported'));
        }
        gotoTargets(args) {
            if (this.capabilities.supportsGotoTargetsRequest) {
                return this.send('gotoTargets', args);
            }
            return Promise.reject(new Error('gotoTargets is not supported'));
        }
        async goto(args) {
            if (this.capabilities.supportsGotoTargetsRequest) {
                this.stoppedSinceLastStep = false;
                const response = await this.send('goto', args);
                if (!this.stoppedSinceLastStep) {
                    this.fireSimulatedContinuedEvent(args.threadId);
                }
                return response;
            }
            return Promise.reject(new Error('goto is not supported'));
        }
        async setInstructionBreakpoints(args) {
            if (this.capabilities.supportsInstructionBreakpoints) {
                return await this.send('setInstructionBreakpoints', args);
            }
            return Promise.reject(new Error('setInstructionBreakpoints is not supported'));
        }
        async disassemble(args) {
            if (this.capabilities.supportsDisassembleRequest) {
                return await this.send('disassemble', args);
            }
            return Promise.reject(new Error('disassemble is not supported'));
        }
        async readMemory(args) {
            if (this.capabilities.supportsReadMemoryRequest) {
                return await this.send('readMemory', args);
            }
            return Promise.reject(new Error('readMemory is not supported'));
        }
        async writeMemory(args) {
            if (this.capabilities.supportsWriteMemoryRequest) {
                return await this.send('writeMemory', args);
            }
            return Promise.reject(new Error('writeMemory is not supported'));
        }
        cancel(args) {
            return this.send('cancel', args);
        }
        custom(request, args) {
            return this.send(request, args);
        }
        //---- private
        async shutdown(error, restart = false, terminateDebuggee = undefined, suspendDebuggee = undefined) {
            if (!this.inShutdown) {
                this.inShutdown = true;
                if (this.debugAdapter) {
                    try {
                        const args = { restart };
                        if (typeof terminateDebuggee === 'boolean') {
                            args.terminateDebuggee = terminateDebuggee;
                        }
                        if (typeof suspendDebuggee === 'boolean') {
                            args.suspendDebuggee = suspendDebuggee;
                        }
                        // if there's an error, the DA is probably already gone, so give it a much shorter timeout.
                        await this.send('disconnect', args, undefined, error ? 200 : 2000);
                    }
                    catch (e) {
                        // Catch the potential 'disconnect' error - no need to show it to the user since the adapter is shutting down
                    }
                    finally {
                        await this.stopAdapter(error);
                    }
                }
                else {
                    return this.stopAdapter(error);
                }
            }
        }
        async stopAdapter(error) {
            try {
                if (this.debugAdapter) {
                    const da = this.debugAdapter;
                    this.debugAdapter = null;
                    await da.stopSession();
                    this.debugAdapterStopped = true;
                }
            }
            finally {
                this.fireAdapterExitEvent(error);
            }
        }
        fireAdapterExitEvent(error) {
            if (!this.firedAdapterExitEvent) {
                this.firedAdapterExitEvent = true;
                const e = {
                    emittedStopped: this.didReceiveStoppedEvent,
                    sessionLengthInSeconds: (new Date().getTime() - this.startTime) / 1000
                };
                if (error && !this.debugAdapterStopped) {
                    e.error = error;
                }
                this._onDidExitAdapter.fire(e);
            }
        }
        async dispatchRequest(request) {
            const response = {
                type: 'response',
                seq: 0,
                command: request.command,
                request_seq: request.seq,
                success: true
            };
            const safeSendResponse = (response) => this.debugAdapter && this.debugAdapter.sendResponse(response);
            if (request.command === 'launchVSCode') {
                try {
                    let result = await this.launchVsCode(request.arguments);
                    if (!result.success) {
                        const { confirmed } = await this.dialogSerivce.confirm({
                            type: notification_1.Severity.Warning,
                            message: nls.localize('canNotStart', "The debugger needs to open a new tab or window for the debuggee but the browser prevented this. You must give permission to continue."),
                            primaryButton: nls.localize({ key: 'continue', comment: ['&& denotes a mnemonic'] }, "&&Continue")
                        });
                        if (confirmed) {
                            result = await this.launchVsCode(request.arguments);
                        }
                        else {
                            response.success = false;
                            safeSendResponse(response);
                            await this.shutdown();
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
                    const shellProcessId = await this.dbgr.runInTerminal(request.arguments, this.sessionId);
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
                            name: args.configuration.name || this.name
                        }
                    };
                    const success = await this.dbgr.startDebugging(config, this.sessionId);
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
        launchVsCode(vscodeArgs) {
            const args = [];
            for (const arg of vscodeArgs.args) {
                const a2 = (arg.prefix || '') + (arg.path || '');
                const match = /^--(.+)=(.+)$/.exec(a2);
                if (match && match.length === 3) {
                    const key = match[1];
                    let value = match[2];
                    if ((key === 'file-uri' || key === 'folder-uri') && !(0, debugUtils_1.isUri)(arg.path)) {
                        value = (0, debugUtils_1.isUri)(value) ? value : uri_1.URI.file(value).toString();
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
            return this.extensionHostDebugService.openExtensionDevelopmentHostWindow(args, !!vscodeArgs.debugRenderer);
        }
        send(command, args, token, timeout, showErrors = true) {
            return new Promise((completeDispatch, errorDispatch) => {
                if (!this.debugAdapter) {
                    if (this.inShutdown) {
                        // We are in shutdown silently complete
                        completeDispatch(undefined);
                    }
                    else {
                        errorDispatch(new Error(nls.localize('noDebugAdapter', "No debugger available found. Can not send '{0}'.", command)));
                    }
                    return;
                }
                let cancelationListener;
                const requestId = this.debugAdapter.sendRequest(command, args, (response) => {
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
            }).then(undefined, err => Promise.reject(this.handleErrorResponse(err, showErrors)));
        }
        handleErrorResponse(errorResponse, showErrors) {
            if (errorResponse.command === 'canceled' && errorResponse.message === 'canceled') {
                return new errors.CancellationError();
            }
            const error = errorResponse?.body?.error;
            const errorMessage = errorResponse?.message || '';
            const userMessage = error ? (0, debugUtils_1.formatPII)(error.format, false, error.variables) : errorMessage;
            const url = error?.url;
            if (error && url) {
                const label = error.urlLabel ? error.urlLabel : nls.localize('moreInfo', "More Info");
                const uri = uri_1.URI.parse(url);
                // Use a suffixed id if uri invokes a command, so default 'Open launch.json' command is suppressed on dialog
                const actionId = uri.scheme === network_1.Schemas.command ? 'debug.moreInfo.command' : 'debug.moreInfo';
                return (0, errorMessage_1.createErrorWithActions)(userMessage, [(0, actions_1.toAction)({ id: actionId, label, run: () => this.openerService.open(uri, { allowCommands: true }) })]);
            }
            if (showErrors && error && error.format && error.showUser) {
                this.notificationService.error(userMessage);
            }
            const result = new errors.ErrorNoTelemetry(userMessage);
            result.showUser = error?.showUser;
            return result;
        }
        mergeCapabilities(capabilities) {
            if (capabilities) {
                this._capabilities = objects.mixin(this._capabilities, capabilities);
            }
        }
        fireSimulatedContinuedEvent(threadId, allThreadsContinued = false) {
            this._onDidContinued.fire({
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
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    };
    exports.RawDebugSession = RawDebugSession;
    exports.RawDebugSession = RawDebugSession = __decorate([
        __param(4, extensionHostDebug_1.IExtensionHostDebugService),
        __param(5, opener_1.IOpenerService),
        __param(6, notification_1.INotificationService),
        __param(7, dialogs_1.IDialogService)
    ], RawDebugSession);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF3RGVidWdTZXNzaW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9yYXdEZWJ1Z1Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUNoRzs7T0FFRztJQUNJLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7UUF5QzNCLFlBQ0MsWUFBMkIsRUFDWCxJQUFlLEVBQ2QsU0FBaUIsRUFDakIsSUFBWSxFQUNELHlCQUFzRSxFQUNsRixhQUE4QyxFQUN4QyxtQkFBMEQsRUFDaEUsYUFBOEM7WUFOOUMsU0FBSSxHQUFKLElBQUksQ0FBVztZQUNkLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFDakIsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUNnQiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTRCO1lBQ2pFLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN2Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQy9DLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQS9DdkQsd0JBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQzNCLHlCQUFvQixHQUFHLEtBQUssQ0FBQztZQUdyQyxXQUFXO1lBQ0gsd0JBQW1CLEdBQUcsS0FBSyxDQUFDO1lBQzVCLGVBQVUsR0FBRyxLQUFLLENBQUM7WUFDbkIsZUFBVSxHQUFHLEtBQUssQ0FBQztZQUNuQiwwQkFBcUIsR0FBRyxLQUFLLENBQUM7WUFFdEMsWUFBWTtZQUNKLGNBQVMsR0FBRyxDQUFDLENBQUM7WUFDZCwyQkFBc0IsR0FBRyxLQUFLLENBQUM7WUFFdkMsYUFBYTtZQUNJLHFCQUFnQixHQUFHLElBQUksZUFBTyxFQUFrQyxDQUFDO1lBQ2pFLGVBQVUsR0FBRyxJQUFJLGVBQU8sRUFBOEIsQ0FBQztZQUN2RCxvQkFBZSxHQUFHLElBQUksZUFBTyxFQUFn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