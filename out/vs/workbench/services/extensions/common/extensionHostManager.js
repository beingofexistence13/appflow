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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/extensions/common/extensionHostKind", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/rpcProtocol"], function (require, exports, async_1, buffer_1, errors, event_1, lifecycle_1, stopwatch_1, nls, actionCommonCategories_1, actions_1, instantiation_1, log_1, remoteAuthorityResolver_1, telemetry_1, editorService_1, environmentService_1, extHostCustomers_1, extensionHostKind_1, extensions_1, rpcProtocol_1) {
    "use strict";
    var ExtensionHostManager_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createExtensionHostManager = void 0;
    // Enable to see detailed message communication between window and extension host
    const LOG_EXTENSION_HOST_COMMUNICATION = false;
    const LOG_USE_COLORS = true;
    function createExtensionHostManager(instantiationService, extensionHost, initialActivationEvents, internalExtensionService) {
        if (extensionHost.startup === 3 /* ExtensionHostStartup.Lazy */ && initialActivationEvents.length === 0) {
            return instantiationService.createInstance(LazyCreateExtensionHostManager, extensionHost, internalExtensionService);
        }
        return instantiationService.createInstance(ExtensionHostManager, extensionHost, initialActivationEvents, internalExtensionService);
    }
    exports.createExtensionHostManager = createExtensionHostManager;
    let ExtensionHostManager = ExtensionHostManager_1 = class ExtensionHostManager extends lifecycle_1.Disposable {
        get kind() {
            return this._extensionHost.runningLocation.kind;
        }
        get startup() {
            return this._extensionHost.startup;
        }
        constructor(extensionHost, initialActivationEvents, _internalExtensionService, _instantiationService, _environmentService, _telemetryService, _logService) {
            super();
            this._internalExtensionService = _internalExtensionService;
            this._instantiationService = _instantiationService;
            this._environmentService = _environmentService;
            this._telemetryService = _telemetryService;
            this._logService = _logService;
            this._onDidChangeResponsiveState = this._register(new event_1.Emitter());
            this.onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
            this._hasStarted = false;
            this._cachedActivationEvents = new Map();
            this._resolvedActivationEvents = new Set();
            this._rpcProtocol = null;
            this._customers = [];
            this._extensionHost = extensionHost;
            this.onDidExit = this._extensionHost.onExit;
            const startingTelemetryEvent = {
                time: Date.now(),
                action: 'starting',
                kind: (0, extensionHostKind_1.extensionHostKindToString)(this.kind)
            };
            this._telemetryService.publicLog2('extensionHostStartup', startingTelemetryEvent);
            this._proxy = this._extensionHost.start().then((protocol) => {
                this._hasStarted = true;
                // Track healthy extension host startup
                const successTelemetryEvent = {
                    time: Date.now(),
                    action: 'success',
                    kind: (0, extensionHostKind_1.extensionHostKindToString)(this.kind)
                };
                this._telemetryService.publicLog2('extensionHostStartup', successTelemetryEvent);
                return this._createExtensionHostCustomers(this.kind, protocol);
            }, (err) => {
                this._logService.error(`Error received from starting extension host (kind: ${(0, extensionHostKind_1.extensionHostKindToString)(this.kind)})`);
                this._logService.error(err);
                // Track errors during extension host startup
                const failureTelemetryEvent = {
                    time: Date.now(),
                    action: 'error',
                    kind: (0, extensionHostKind_1.extensionHostKindToString)(this.kind)
                };
                if (err && err.name) {
                    failureTelemetryEvent.errorName = err.name;
                }
                if (err && err.message) {
                    failureTelemetryEvent.errorMessage = err.message;
                }
                if (err && err.stack) {
                    failureTelemetryEvent.errorStack = err.stack;
                }
                this._telemetryService.publicLog2('extensionHostStartup', failureTelemetryEvent);
                return null;
            });
            this._proxy.then(() => {
                initialActivationEvents.forEach((activationEvent) => this.activateByEvent(activationEvent, 0 /* ActivationKind.Normal */));
                this._register(registerLatencyTestProvider({
                    measure: () => this.measure()
                }));
            });
        }
        dispose() {
            if (this._extensionHost) {
                this._extensionHost.dispose();
            }
            if (this._rpcProtocol) {
                this._rpcProtocol.dispose();
            }
            for (let i = 0, len = this._customers.length; i < len; i++) {
                const customer = this._customers[i];
                try {
                    customer.dispose();
                }
                catch (err) {
                    errors.onUnexpectedError(err);
                }
            }
            this._proxy = null;
            super.dispose();
        }
        async measure() {
            const proxy = await this._proxy;
            if (!proxy) {
                return null;
            }
            const latency = await this._measureLatency(proxy);
            const down = await this._measureDown(proxy);
            const up = await this._measureUp(proxy);
            return {
                remoteAuthority: this._extensionHost.remoteAuthority,
                latency,
                down,
                up
            };
        }
        async ready() {
            await this._proxy;
        }
        async _measureLatency(proxy) {
            const COUNT = 10;
            let sum = 0;
            for (let i = 0; i < COUNT; i++) {
                const sw = stopwatch_1.StopWatch.create();
                await proxy.test_latency(i);
                sw.stop();
                sum += sw.elapsed();
            }
            return (sum / COUNT);
        }
        static _convert(byteCount, elapsedMillis) {
            return (byteCount * 1000 * 8) / elapsedMillis;
        }
        async _measureUp(proxy) {
            const SIZE = 10 * 1024 * 1024; // 10MB
            const buff = buffer_1.VSBuffer.alloc(SIZE);
            const value = Math.ceil(Math.random() * 256);
            for (let i = 0; i < buff.byteLength; i++) {
                buff.writeUInt8(i, value);
            }
            const sw = stopwatch_1.StopWatch.create();
            await proxy.test_up(buff);
            sw.stop();
            return ExtensionHostManager_1._convert(SIZE, sw.elapsed());
        }
        async _measureDown(proxy) {
            const SIZE = 10 * 1024 * 1024; // 10MB
            const sw = stopwatch_1.StopWatch.create();
            await proxy.test_down(SIZE);
            sw.stop();
            return ExtensionHostManager_1._convert(SIZE, sw.elapsed());
        }
        _createExtensionHostCustomers(kind, protocol) {
            let logger = null;
            if (LOG_EXTENSION_HOST_COMMUNICATION || this._environmentService.logExtensionHostCommunication) {
                logger = new RPCLogger(kind);
            }
            else if (TelemetryRPCLogger.isEnabled()) {
                logger = new TelemetryRPCLogger(this._telemetryService);
            }
            this._rpcProtocol = new rpcProtocol_1.RPCProtocol(protocol, logger);
            this._register(this._rpcProtocol.onDidChangeResponsiveState((responsiveState) => this._onDidChangeResponsiveState.fire(responsiveState)));
            let extensionHostProxy = null;
            let mainProxyIdentifiers = [];
            const extHostContext = {
                remoteAuthority: this._extensionHost.remoteAuthority,
                extensionHostKind: this.kind,
                getProxy: (identifier) => this._rpcProtocol.getProxy(identifier),
                set: (identifier, instance) => this._rpcProtocol.set(identifier, instance),
                dispose: () => this._rpcProtocol.dispose(),
                assertRegistered: (identifiers) => this._rpcProtocol.assertRegistered(identifiers),
                drain: () => this._rpcProtocol.drain(),
                //#region internal
                internalExtensionService: this._internalExtensionService,
                _setExtensionHostProxy: (value) => {
                    extensionHostProxy = value;
                },
                _setAllMainProxyIdentifiers: (value) => {
                    mainProxyIdentifiers = value;
                },
                //#endregion
            };
            // Named customers
            const namedCustomers = extHostCustomers_1.ExtHostCustomersRegistry.getNamedCustomers();
            for (let i = 0, len = namedCustomers.length; i < len; i++) {
                const [id, ctor] = namedCustomers[i];
                try {
                    const instance = this._instantiationService.createInstance(ctor, extHostContext);
                    this._customers.push(instance);
                    this._rpcProtocol.set(id, instance);
                }
                catch (err) {
                    this._logService.error(`Cannot instantiate named customer: '${id.sid}'`);
                    this._logService.error(err);
                    errors.onUnexpectedError(err);
                }
            }
            // Customers
            const customers = extHostCustomers_1.ExtHostCustomersRegistry.getCustomers();
            for (const ctor of customers) {
                try {
                    const instance = this._instantiationService.createInstance(ctor, extHostContext);
                    this._customers.push(instance);
                }
                catch (err) {
                    this._logService.error(err);
                    errors.onUnexpectedError(err);
                }
            }
            if (!extensionHostProxy) {
                throw new Error(`Missing IExtensionHostProxy!`);
            }
            // Check that no named customers are missing
            this._rpcProtocol.assertRegistered(mainProxyIdentifiers);
            return extensionHostProxy;
        }
        async activate(extension, reason) {
            const proxy = await this._proxy;
            if (!proxy) {
                return false;
            }
            return proxy.activate(extension, reason);
        }
        activateByEvent(activationEvent, activationKind) {
            if (activationKind === 1 /* ActivationKind.Immediate */ && !this._hasStarted) {
                return Promise.resolve();
            }
            if (!this._cachedActivationEvents.has(activationEvent)) {
                this._cachedActivationEvents.set(activationEvent, this._activateByEvent(activationEvent, activationKind));
            }
            return this._cachedActivationEvents.get(activationEvent);
        }
        activationEventIsDone(activationEvent) {
            return this._resolvedActivationEvents.has(activationEvent);
        }
        async _activateByEvent(activationEvent, activationKind) {
            if (!this._proxy) {
                return;
            }
            const proxy = await this._proxy;
            if (!proxy) {
                // this case is already covered above and logged.
                // i.e. the extension host could not be started
                return;
            }
            await proxy.activateByEvent(activationEvent, activationKind);
            this._resolvedActivationEvents.add(activationEvent);
        }
        async getInspectPort(tryEnableInspector) {
            if (this._extensionHost) {
                if (tryEnableInspector) {
                    await this._extensionHost.enableInspectPort();
                }
                const port = this._extensionHost.getInspectPort();
                if (port) {
                    return port;
                }
            }
            return 0;
        }
        async resolveAuthority(remoteAuthority, resolveAttempt) {
            const sw = stopwatch_1.StopWatch.create(false);
            const prefix = () => `[${(0, extensionHostKind_1.extensionHostKindToString)(this._extensionHost.runningLocation.kind)}${this._extensionHost.runningLocation.affinity}][resolveAuthority(${(0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthority)},${resolveAttempt})][${sw.elapsed()}ms] `;
            const logInfo = (msg) => this._logService.info(`${prefix()}${msg}`);
            const logError = (msg, err = undefined) => this._logService.error(`${prefix()}${msg}`, err);
            logInfo(`obtaining proxy...`);
            const proxy = await this._proxy;
            if (!proxy) {
                logError(`no proxy`);
                return {
                    type: 'error',
                    error: {
                        message: `Cannot resolve authority`,
                        code: remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.Unknown,
                        detail: undefined
                    }
                };
            }
            logInfo(`invoking...`);
            const intervalLogger = new async_1.IntervalTimer();
            try {
                intervalLogger.cancelAndSet(() => logInfo('waiting...'), 1000);
                const resolverResult = await proxy.resolveAuthority(remoteAuthority, resolveAttempt);
                intervalLogger.dispose();
                if (resolverResult.type === 'ok') {
                    logInfo(`returned ${resolverResult.value.authority.connectTo}`);
                }
                else {
                    logError(`returned an error`, resolverResult.error);
                }
                return resolverResult;
            }
            catch (err) {
                intervalLogger.dispose();
                logError(`returned an error`, err);
                return {
                    type: 'error',
                    error: {
                        message: err.message,
                        code: remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.Unknown,
                        detail: err
                    }
                };
            }
        }
        async getCanonicalURI(remoteAuthority, uri) {
            const proxy = await this._proxy;
            if (!proxy) {
                throw new Error(`Cannot resolve canonical URI`);
            }
            return proxy.getCanonicalURI(remoteAuthority, uri);
        }
        async start(extensionRegistryVersionId, allExtensions, myExtensions) {
            const proxy = await this._proxy;
            if (!proxy) {
                return;
            }
            const deltaExtensions = this._extensionHost.extensions.set(extensionRegistryVersionId, allExtensions, myExtensions);
            return proxy.startExtensionHost(deltaExtensions);
        }
        async extensionTestsExecute() {
            const proxy = await this._proxy;
            if (!proxy) {
                throw new Error('Could not obtain Extension Host Proxy');
            }
            return proxy.extensionTestsExecute();
        }
        representsRunningLocation(runningLocation) {
            return this._extensionHost.runningLocation.equals(runningLocation);
        }
        async deltaExtensions(incomingExtensionsDelta) {
            const proxy = await this._proxy;
            if (!proxy) {
                return;
            }
            const outgoingExtensionsDelta = this._extensionHost.extensions.delta(incomingExtensionsDelta);
            if (!outgoingExtensionsDelta) {
                // The extension host already has this version of the extensions.
                return;
            }
            return proxy.deltaExtensions(outgoingExtensionsDelta);
        }
        containsExtension(extensionId) {
            return this._extensionHost.extensions?.containsExtension(extensionId) ?? false;
        }
        async setRemoteEnvironment(env) {
            const proxy = await this._proxy;
            if (!proxy) {
                return;
            }
            return proxy.setRemoteEnvironment(env);
        }
    };
    ExtensionHostManager = ExtensionHostManager_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, log_1.ILogService)
    ], ExtensionHostManager);
    /**
     * Waits until `start()` and only if it has extensions proceeds to really start.
     */
    let LazyCreateExtensionHostManager = class LazyCreateExtensionHostManager extends lifecycle_1.Disposable {
        get kind() {
            return this._extensionHost.runningLocation.kind;
        }
        get startup() {
            return this._extensionHost.startup;
        }
        constructor(extensionHost, _internalExtensionService, _instantiationService, _logService) {
            super();
            this._internalExtensionService = _internalExtensionService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._onDidChangeResponsiveState = this._register(new event_1.Emitter());
            this.onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
            this._extensionHost = extensionHost;
            this.onDidExit = extensionHost.onExit;
            this._startCalled = new async_1.Barrier();
            this._actual = null;
            this._lazyStartExtensions = null;
        }
        _createActual(reason) {
            this._logService.info(`Creating lazy extension host: ${reason}`);
            this._actual = this._register(this._instantiationService.createInstance(ExtensionHostManager, this._extensionHost, [], this._internalExtensionService));
            this._register(this._actual.onDidChangeResponsiveState((e) => this._onDidChangeResponsiveState.fire(e)));
            return this._actual;
        }
        async _getOrCreateActualAndStart(reason) {
            if (this._actual) {
                // already created/started
                return this._actual;
            }
            const actual = this._createActual(reason);
            await actual.start(this._lazyStartExtensions.versionId, this._lazyStartExtensions.allExtensions, this._lazyStartExtensions.myExtensions);
            return actual;
        }
        async ready() {
            await this._startCalled.wait();
            if (this._actual) {
                await this._actual.ready();
            }
        }
        representsRunningLocation(runningLocation) {
            return this._extensionHost.runningLocation.equals(runningLocation);
        }
        async deltaExtensions(extensionsDelta) {
            await this._startCalled.wait();
            if (this._actual) {
                return this._actual.deltaExtensions(extensionsDelta);
            }
            this._lazyStartExtensions.delta(extensionsDelta);
            if (extensionsDelta.myToAdd.length > 0) {
                const actual = this._createActual(`contains ${extensionsDelta.myToAdd.length} new extension(s) (installed or enabled): ${extensionsDelta.myToAdd.map(extId => extId.value)}`);
                await actual.start(this._lazyStartExtensions.versionId, this._lazyStartExtensions.allExtensions, this._lazyStartExtensions.myExtensions);
                return;
            }
        }
        containsExtension(extensionId) {
            return this._extensionHost.extensions?.containsExtension(extensionId) ?? false;
        }
        async activate(extension, reason) {
            await this._startCalled.wait();
            if (this._actual) {
                return this._actual.activate(extension, reason);
            }
            return false;
        }
        async activateByEvent(activationEvent, activationKind) {
            if (activationKind === 1 /* ActivationKind.Immediate */) {
                // this is an immediate request, so we cannot wait for start to be called
                if (this._actual) {
                    return this._actual.activateByEvent(activationEvent, activationKind);
                }
                return;
            }
            await this._startCalled.wait();
            if (this._actual) {
                return this._actual.activateByEvent(activationEvent, activationKind);
            }
        }
        activationEventIsDone(activationEvent) {
            if (!this._startCalled.isOpen()) {
                return false;
            }
            if (this._actual) {
                return this._actual.activationEventIsDone(activationEvent);
            }
            return true;
        }
        async getInspectPort(tryEnableInspector) {
            await this._startCalled.wait();
            if (this._actual) {
                return this._actual.getInspectPort(tryEnableInspector);
            }
            return 0;
        }
        async resolveAuthority(remoteAuthority, resolveAttempt) {
            await this._startCalled.wait();
            if (this._actual) {
                return this._actual.resolveAuthority(remoteAuthority, resolveAttempt);
            }
            return {
                type: 'error',
                error: {
                    message: `Cannot resolve authority`,
                    code: remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.Unknown,
                    detail: undefined
                }
            };
        }
        async getCanonicalURI(remoteAuthority, uri) {
            await this._startCalled.wait();
            if (this._actual) {
                return this._actual.getCanonicalURI(remoteAuthority, uri);
            }
            throw new Error(`Cannot resolve canonical URI`);
        }
        async start(extensionRegistryVersionId, allExtensions, myExtensions) {
            if (myExtensions.length > 0) {
                // there are actual extensions, so let's launch the extension host
                const actual = this._createActual(`contains ${myExtensions.length} extension(s): ${myExtensions.map(extId => extId.value)}.`);
                const result = actual.start(extensionRegistryVersionId, allExtensions, myExtensions);
                this._startCalled.open();
                return result;
            }
            // there are no actual extensions running, store extensions in `this._lazyStartExtensions`
            this._lazyStartExtensions = new extensions_1.ExtensionHostExtensions(extensionRegistryVersionId, allExtensions, myExtensions);
            this._startCalled.open();
        }
        async extensionTestsExecute() {
            await this._startCalled.wait();
            const actual = await this._getOrCreateActualAndStart(`execute tests.`);
            return actual.extensionTestsExecute();
        }
        async setRemoteEnvironment(env) {
            await this._startCalled.wait();
            if (this._actual) {
                return this._actual.setRemoteEnvironment(env);
            }
        }
    };
    LazyCreateExtensionHostManager = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, log_1.ILogService)
    ], LazyCreateExtensionHostManager);
    const colorTables = [
        ['#2977B1', '#FC802D', '#34A13A', '#D3282F', '#9366BA'],
        ['#8B564C', '#E177C0', '#7F7F7F', '#BBBE3D', '#2EBECD']
    ];
    function prettyWithoutArrays(data) {
        if (Array.isArray(data)) {
            return data;
        }
        if (data && typeof data === 'object' && typeof data.toString === 'function') {
            const result = data.toString();
            if (result !== '[object Object]') {
                return result;
            }
        }
        return data;
    }
    function pretty(data) {
        if (Array.isArray(data)) {
            return data.map(prettyWithoutArrays);
        }
        return prettyWithoutArrays(data);
    }
    class RPCLogger {
        constructor(_kind) {
            this._kind = _kind;
            this._totalIncoming = 0;
            this._totalOutgoing = 0;
        }
        _log(direction, totalLength, msgLength, req, initiator, str, data) {
            data = pretty(data);
            const colorTable = colorTables[initiator];
            const color = LOG_USE_COLORS ? colorTable[req % colorTable.length] : '#000000';
            let args = [`%c[${(0, extensionHostKind_1.extensionHostKindToString)(this._kind)}][${direction}]%c[${String(totalLength).padStart(7)}]%c[len: ${String(msgLength).padStart(5)}]%c${String(req).padStart(5)} - ${str}`, 'color: darkgreen', 'color: grey', 'color: grey', `color: ${color}`];
            if (/\($/.test(str)) {
                args = args.concat(data);
                args.push(')');
            }
            else {
                args.push(data);
            }
            console.log.apply(console, args);
        }
        logIncoming(msgLength, req, initiator, str, data) {
            this._totalIncoming += msgLength;
            this._log('Ext \u2192 Win', this._totalIncoming, msgLength, req, initiator, str, data);
        }
        logOutgoing(msgLength, req, initiator, str, data) {
            this._totalOutgoing += msgLength;
            this._log('Win \u2192 Ext', this._totalOutgoing, msgLength, req, initiator, str, data);
        }
    }
    let TelemetryRPCLogger = class TelemetryRPCLogger {
        static isEnabled() {
            // this will be a very high frequency event, so we only log a small percentage of them
            return Math.trunc(Math.random() * 1000) < 0.5;
        }
        constructor(_telemetryService) {
            this._telemetryService = _telemetryService;
            this._pendingRequests = new Map();
        }
        logIncoming(msgLength, req, initiator, str) {
            if (initiator === 0 /* RequestInitiator.LocalSide */ && /^receiveReply(Err)?:/.test(str)) {
                // log the size of reply messages
                const requestStr = this._pendingRequests.get(req) ?? 'unknown_reply';
                this._pendingRequests.delete(req);
                this._telemetryService.publicLog2('extensionhost.incoming', {
                    type: `${str} ${requestStr}`,
                    length: msgLength
                });
            }
            if (initiator === 1 /* RequestInitiator.OtherSide */ && /^receiveRequest /.test(str)) {
                // incoming request
                this._telemetryService.publicLog2('extensionhost.incoming', {
                    type: `${str}`,
                    length: msgLength
                });
            }
        }
        logOutgoing(msgLength, req, initiator, str) {
            if (initiator === 0 /* RequestInitiator.LocalSide */ && str.startsWith('request: ')) {
                this._pendingRequests.set(req, str);
                this._telemetryService.publicLog2('extensionhost.outgoing', {
                    type: str,
                    length: msgLength
                });
            }
        }
    };
    TelemetryRPCLogger = __decorate([
        __param(0, telemetry_1.ITelemetryService)
    ], TelemetryRPCLogger);
    const providers = [];
    function registerLatencyTestProvider(provider) {
        providers.push(provider);
        return {
            dispose: () => {
                for (let i = 0; i < providers.length; i++) {
                    if (providers[i] === provider) {
                        providers.splice(i, 1);
                        return;
                    }
                }
            }
        };
    }
    function getLatencyTestProviders() {
        return providers.slice(0);
    }
    (0, actions_1.registerAction2)(class MeasureExtHostLatencyAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'editor.action.measureExtHostLatency',
                title: {
                    value: nls.localize('measureExtHostLatency', "Measure Extension Host Latency"),
                    original: 'Measure Extension Host Latency'
                },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const measurements = await Promise.all(getLatencyTestProviders().map(provider => provider.measure()));
            editorService.openEditor({ resource: undefined, contents: measurements.map(MeasureExtHostLatencyAction._print).join('\n\n'), options: { pinned: true } });
        }
        static _print(m) {
            if (!m) {
                return '';
            }
            return `${m.remoteAuthority ? `Authority: ${m.remoteAuthority}\n` : ``}Roundtrip latency: ${m.latency.toFixed(3)}ms\nUp: ${MeasureExtHostLatencyAction._printSpeed(m.up)}\nDown: ${MeasureExtHostLatencyAction._printSpeed(m.down)}\n`;
        }
        static _printSpeed(n) {
            if (n <= 1024) {
                return `${n} bps`;
            }
            if (n < 1024 * 1024) {
                return `${(n / 1024).toFixed(1)} kbps`;
            }
            return `${(n / 1024 / 1024).toFixed(1)} Mbps`;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9ucy9jb21tb24vZXh0ZW5zaW9uSG9zdE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTZCaEcsaUZBQWlGO0lBQ2pGLE1BQU0sZ0NBQWdDLEdBQUcsS0FBSyxDQUFDO0lBQy9DLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQztJQTBCNUIsU0FBZ0IsMEJBQTBCLENBQUMsb0JBQTJDLEVBQUUsYUFBNkIsRUFBRSx1QkFBaUMsRUFBRSx3QkFBbUQ7UUFDNU0sSUFBSSxhQUFhLENBQUMsT0FBTyxzQ0FBOEIsSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hHLE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLDhCQUE4QixFQUFFLGFBQWEsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1NBQ3BIO1FBQ0QsT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLEVBQUUsYUFBYSxFQUFFLHVCQUF1QixFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDcEksQ0FBQztJQUxELGdFQUtDO0lBc0JELElBQU0sb0JBQW9CLDRCQUExQixNQUFNLG9CQUFxQixTQUFRLHNCQUFVO1FBa0I1QyxJQUFXLElBQUk7WUFDZCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztRQUNqRCxDQUFDO1FBRUQsSUFBVyxPQUFPO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7UUFDcEMsQ0FBQztRQUVELFlBQ0MsYUFBNkIsRUFDN0IsdUJBQWlDLEVBQ2hCLHlCQUFvRCxFQUM5QyxxQkFBNkQsRUFDdEQsbUJBQWtFLEVBQzdFLGlCQUFxRCxFQUMzRCxX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