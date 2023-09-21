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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/nls!vs/workbench/services/extensions/common/extensionHostManager", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/extensions/common/extensionHostKind", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/rpcProtocol"], function (require, exports, async_1, buffer_1, errors, event_1, lifecycle_1, stopwatch_1, nls, actionCommonCategories_1, actions_1, instantiation_1, log_1, remoteAuthorityResolver_1, telemetry_1, editorService_1, environmentService_1, extHostCustomers_1, extensionHostKind_1, extensions_1, rpcProtocol_1) {
    "use strict";
    var ExtensionHostManager_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$I3b = void 0;
    // Enable to see detailed message communication between window and extension host
    const LOG_EXTENSION_HOST_COMMUNICATION = false;
    const LOG_USE_COLORS = true;
    function $I3b(instantiationService, extensionHost, initialActivationEvents, internalExtensionService) {
        if (extensionHost.startup === 3 /* ExtensionHostStartup.Lazy */ && initialActivationEvents.length === 0) {
            return instantiationService.createInstance(LazyCreateExtensionHostManager, extensionHost, internalExtensionService);
        }
        return instantiationService.createInstance(ExtensionHostManager, extensionHost, initialActivationEvents, internalExtensionService);
    }
    exports.$I3b = $I3b;
    let ExtensionHostManager = ExtensionHostManager_1 = class ExtensionHostManager extends lifecycle_1.$kc {
        get kind() {
            return this.h.runningLocation.kind;
        }
        get startup() {
            return this.h.startup;
        }
        constructor(extensionHost, initialActivationEvents, s, t, u, w, y) {
            super();
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeResponsiveState = this.a.event;
            this.r = false;
            this.b = new Map();
            this.c = new Set();
            this.f = null;
            this.g = [];
            this.h = extensionHost;
            this.onDidExit = this.h.onExit;
            const startingTelemetryEvent = {
                time: Date.now(),
                action: 'starting',
                kind: (0, extensionHostKind_1.$DF)(this.kind)
            };
            this.w.publicLog2('extensionHostStartup', startingTelemetryEvent);
            this.j = this.h.start().then((protocol) => {
                this.r = true;
                // Track healthy extension host startup
                const successTelemetryEvent = {
                    time: Date.now(),
                    action: 'success',
                    kind: (0, extensionHostKind_1.$DF)(this.kind)
                };
                this.w.publicLog2('extensionHostStartup', successTelemetryEvent);
                return this.H(this.kind, protocol);
            }, (err) => {
                this.y.error(`Error received from starting extension host (kind: ${(0, extensionHostKind_1.$DF)(this.kind)})`);
                this.y.error(err);
                // Track errors during extension host startup
                const failureTelemetryEvent = {
                    time: Date.now(),
                    action: 'error',
                    kind: (0, extensionHostKind_1.$DF)(this.kind)
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
                this.w.publicLog2('extensionHostStartup', failureTelemetryEvent);
                return null;
            });
            this.j.then(() => {
                initialActivationEvents.forEach((activationEvent) => this.activateByEvent(activationEvent, 0 /* ActivationKind.Normal */));
                this.B(registerLatencyTestProvider({
                    measure: () => this.z()
                }));
            });
        }
        dispose() {
            if (this.h) {
                this.h.dispose();
            }
            if (this.f) {
                this.f.dispose();
            }
            for (let i = 0, len = this.g.length; i < len; i++) {
                const customer = this.g[i];
                try {
                    customer.dispose();
                }
                catch (err) {
                    errors.$Y(err);
                }
            }
            this.j = null;
            super.dispose();
        }
        async z() {
            const proxy = await this.j;
            if (!proxy) {
                return null;
            }
            const latency = await this.C(proxy);
            const down = await this.G(proxy);
            const up = await this.F(proxy);
            return {
                remoteAuthority: this.h.remoteAuthority,
                latency,
                down,
                up
            };
        }
        async ready() {
            await this.j;
        }
        async C(proxy) {
            const COUNT = 10;
            let sum = 0;
            for (let i = 0; i < COUNT; i++) {
                const sw = stopwatch_1.$bd.create();
                await proxy.test_latency(i);
                sw.stop();
                sum += sw.elapsed();
            }
            return (sum / COUNT);
        }
        static D(byteCount, elapsedMillis) {
            return (byteCount * 1000 * 8) / elapsedMillis;
        }
        async F(proxy) {
            const SIZE = 10 * 1024 * 1024; // 10MB
            const buff = buffer_1.$Fd.alloc(SIZE);
            const value = Math.ceil(Math.random() * 256);
            for (let i = 0; i < buff.byteLength; i++) {
                buff.writeUInt8(i, value);
            }
            const sw = stopwatch_1.$bd.create();
            await proxy.test_up(buff);
            sw.stop();
            return ExtensionHostManager_1.D(SIZE, sw.elapsed());
        }
        async G(proxy) {
            const SIZE = 10 * 1024 * 1024; // 10MB
            const sw = stopwatch_1.$bd.create();
            await proxy.test_down(SIZE);
            sw.stop();
            return ExtensionHostManager_1.D(SIZE, sw.elapsed());
        }
        H(kind, protocol) {
            let logger = null;
            if (LOG_EXTENSION_HOST_COMMUNICATION || this.u.logExtensionHostCommunication) {
                logger = new RPCLogger(kind);
            }
            else if (TelemetryRPCLogger.isEnabled()) {
                logger = new TelemetryRPCLogger(this.w);
            }
            this.f = new rpcProtocol_1.$H3b(protocol, logger);
            this.B(this.f.onDidChangeResponsiveState((responsiveState) => this.a.fire(responsiveState)));
            let extensionHostProxy = null;
            let mainProxyIdentifiers = [];
            const extHostContext = {
                remoteAuthority: this.h.remoteAuthority,
                extensionHostKind: this.kind,
                getProxy: (identifier) => this.f.getProxy(identifier),
                set: (identifier, instance) => this.f.set(identifier, instance),
                dispose: () => this.f.dispose(),
                assertRegistered: (identifiers) => this.f.assertRegistered(identifiers),
                drain: () => this.f.drain(),
                //#region internal
                internalExtensionService: this.s,
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
                    const instance = this.t.createInstance(ctor, extHostContext);
                    this.g.push(instance);
                    this.f.set(id, instance);
                }
                catch (err) {
                    this.y.error(`Cannot instantiate named customer: '${id.sid}'`);
                    this.y.error(err);
                    errors.$Y(err);
                }
            }
            // Customers
            const customers = extHostCustomers_1.ExtHostCustomersRegistry.getCustomers();
            for (const ctor of customers) {
                try {
                    const instance = this.t.createInstance(ctor, extHostContext);
                    this.g.push(instance);
                }
                catch (err) {
                    this.y.error(err);
                    errors.$Y(err);
                }
            }
            if (!extensionHostProxy) {
                throw new Error(`Missing IExtensionHostProxy!`);
            }
            // Check that no named customers are missing
            this.f.assertRegistered(mainProxyIdentifiers);
            return extensionHostProxy;
        }
        async activate(extension, reason) {
            const proxy = await this.j;
            if (!proxy) {
                return false;
            }
            return proxy.activate(extension, reason);
        }
        activateByEvent(activationEvent, activationKind) {
            if (activationKind === 1 /* ActivationKind.Immediate */ && !this.r) {
                return Promise.resolve();
            }
            if (!this.b.has(activationEvent)) {
                this.b.set(activationEvent, this.I(activationEvent, activationKind));
            }
            return this.b.get(activationEvent);
        }
        activationEventIsDone(activationEvent) {
            return this.c.has(activationEvent);
        }
        async I(activationEvent, activationKind) {
            if (!this.j) {
                return;
            }
            const proxy = await this.j;
            if (!proxy) {
                // this case is already covered above and logged.
                // i.e. the extension host could not be started
                return;
            }
            await proxy.activateByEvent(activationEvent, activationKind);
            this.c.add(activationEvent);
        }
        async getInspectPort(tryEnableInspector) {
            if (this.h) {
                if (tryEnableInspector) {
                    await this.h.enableInspectPort();
                }
                const port = this.h.getInspectPort();
                if (port) {
                    return port;
                }
            }
            return 0;
        }
        async resolveAuthority(remoteAuthority, resolveAttempt) {
            const sw = stopwatch_1.$bd.create(false);
            const prefix = () => `[${(0, extensionHostKind_1.$DF)(this.h.runningLocation.kind)}${this.h.runningLocation.affinity}][resolveAuthority(${(0, remoteAuthorityResolver_1.$Nk)(remoteAuthority)},${resolveAttempt})][${sw.elapsed()}ms] `;
            const logInfo = (msg) => this.y.info(`${prefix()}${msg}`);
            const logError = (msg, err = undefined) => this.y.error(`${prefix()}${msg}`, err);
            logInfo(`obtaining proxy...`);
            const proxy = await this.j;
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
            const intervalLogger = new async_1.$Rg();
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
            const proxy = await this.j;
            if (!proxy) {
                throw new Error(`Cannot resolve canonical URI`);
            }
            return proxy.getCanonicalURI(remoteAuthority, uri);
        }
        async start(extensionRegistryVersionId, allExtensions, myExtensions) {
            const proxy = await this.j;
            if (!proxy) {
                return;
            }
            const deltaExtensions = this.h.extensions.set(extensionRegistryVersionId, allExtensions, myExtensions);
            return proxy.startExtensionHost(deltaExtensions);
        }
        async extensionTestsExecute() {
            const proxy = await this.j;
            if (!proxy) {
                throw new Error('Could not obtain Extension Host Proxy');
            }
            return proxy.extensionTestsExecute();
        }
        representsRunningLocation(runningLocation) {
            return this.h.runningLocation.equals(runningLocation);
        }
        async deltaExtensions(incomingExtensionsDelta) {
            const proxy = await this.j;
            if (!proxy) {
                return;
            }
            const outgoingExtensionsDelta = this.h.extensions.delta(incomingExtensionsDelta);
            if (!outgoingExtensionsDelta) {
                // The extension host already has this version of the extensions.
                return;
            }
            return proxy.deltaExtensions(outgoingExtensionsDelta);
        }
        containsExtension(extensionId) {
            return this.h.extensions?.containsExtension(extensionId) ?? false;
        }
        async setRemoteEnvironment(env) {
            const proxy = await this.j;
            if (!proxy) {
                return;
            }
            return proxy.setRemoteEnvironment(env);
        }
    };
    ExtensionHostManager = ExtensionHostManager_1 = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, environmentService_1.$hJ),
        __param(5, telemetry_1.$9k),
        __param(6, log_1.$5i)
    ], ExtensionHostManager);
    /**
     * Waits until `start()` and only if it has extensions proceeds to really start.
     */
    let LazyCreateExtensionHostManager = class LazyCreateExtensionHostManager extends lifecycle_1.$kc {
        get kind() {
            return this.b.runningLocation.kind;
        }
        get startup() {
            return this.b.startup;
        }
        constructor(extensionHost, h, j, r) {
            super();
            this.h = h;
            this.j = j;
            this.r = r;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeResponsiveState = this.a.event;
            this.b = extensionHost;
            this.onDidExit = extensionHost.onExit;
            this.c = new async_1.$Fg();
            this.f = null;
            this.g = null;
        }
        s(reason) {
            this.r.info(`Creating lazy extension host: ${reason}`);
            this.f = this.B(this.j.createInstance(ExtensionHostManager, this.b, [], this.h));
            this.B(this.f.onDidChangeResponsiveState((e) => this.a.fire(e)));
            return this.f;
        }
        async t(reason) {
            if (this.f) {
                // already created/started
                return this.f;
            }
            const actual = this.s(reason);
            await actual.start(this.g.versionId, this.g.allExtensions, this.g.myExtensions);
            return actual;
        }
        async ready() {
            await this.c.wait();
            if (this.f) {
                await this.f.ready();
            }
        }
        representsRunningLocation(runningLocation) {
            return this.b.runningLocation.equals(runningLocation);
        }
        async deltaExtensions(extensionsDelta) {
            await this.c.wait();
            if (this.f) {
                return this.f.deltaExtensions(extensionsDelta);
            }
            this.g.delta(extensionsDelta);
            if (extensionsDelta.myToAdd.length > 0) {
                const actual = this.s(`contains ${extensionsDelta.myToAdd.length} new extension(s) (installed or enabled): ${extensionsDelta.myToAdd.map(extId => extId.value)}`);
                await actual.start(this.g.versionId, this.g.allExtensions, this.g.myExtensions);
                return;
            }
        }
        containsExtension(extensionId) {
            return this.b.extensions?.containsExtension(extensionId) ?? false;
        }
        async activate(extension, reason) {
            await this.c.wait();
            if (this.f) {
                return this.f.activate(extension, reason);
            }
            return false;
        }
        async activateByEvent(activationEvent, activationKind) {
            if (activationKind === 1 /* ActivationKind.Immediate */) {
                // this is an immediate request, so we cannot wait for start to be called
                if (this.f) {
                    return this.f.activateByEvent(activationEvent, activationKind);
                }
                return;
            }
            await this.c.wait();
            if (this.f) {
                return this.f.activateByEvent(activationEvent, activationKind);
            }
        }
        activationEventIsDone(activationEvent) {
            if (!this.c.isOpen()) {
                return false;
            }
            if (this.f) {
                return this.f.activationEventIsDone(activationEvent);
            }
            return true;
        }
        async getInspectPort(tryEnableInspector) {
            await this.c.wait();
            if (this.f) {
                return this.f.getInspectPort(tryEnableInspector);
            }
            return 0;
        }
        async resolveAuthority(remoteAuthority, resolveAttempt) {
            await this.c.wait();
            if (this.f) {
                return this.f.resolveAuthority(remoteAuthority, resolveAttempt);
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
            await this.c.wait();
            if (this.f) {
                return this.f.getCanonicalURI(remoteAuthority, uri);
            }
            throw new Error(`Cannot resolve canonical URI`);
        }
        async start(extensionRegistryVersionId, allExtensions, myExtensions) {
            if (myExtensions.length > 0) {
                // there are actual extensions, so let's launch the extension host
                const actual = this.s(`contains ${myExtensions.length} extension(s): ${myExtensions.map(extId => extId.value)}.`);
                const result = actual.start(extensionRegistryVersionId, allExtensions, myExtensions);
                this.c.open();
                return result;
            }
            // there are no actual extensions running, store extensions in `this._lazyStartExtensions`
            this.g = new extensions_1.$OF(extensionRegistryVersionId, allExtensions, myExtensions);
            this.c.open();
        }
        async extensionTestsExecute() {
            await this.c.wait();
            const actual = await this.t(`execute tests.`);
            return actual.extensionTestsExecute();
        }
        async setRemoteEnvironment(env) {
            await this.c.wait();
            if (this.f) {
                return this.f.setRemoteEnvironment(env);
            }
        }
    };
    LazyCreateExtensionHostManager = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, log_1.$5i)
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
        constructor(c) {
            this.c = c;
            this.a = 0;
            this.b = 0;
        }
        d(direction, totalLength, msgLength, req, initiator, str, data) {
            data = pretty(data);
            const colorTable = colorTables[initiator];
            const color = LOG_USE_COLORS ? colorTable[req % colorTable.length] : '#000000';
            let args = [`%c[${(0, extensionHostKind_1.$DF)(this.c)}][${direction}]%c[${String(totalLength).padStart(7)}]%c[len: ${String(msgLength).padStart(5)}]%c${String(req).padStart(5)} - ${str}`, 'color: darkgreen', 'color: grey', 'color: grey', `color: ${color}`];
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
            this.a += msgLength;
            this.d('Ext \u2192 Win', this.a, msgLength, req, initiator, str, data);
        }
        logOutgoing(msgLength, req, initiator, str, data) {
            this.b += msgLength;
            this.d('Win \u2192 Ext', this.b, msgLength, req, initiator, str, data);
        }
    }
    let TelemetryRPCLogger = class TelemetryRPCLogger {
        static isEnabled() {
            // this will be a very high frequency event, so we only log a small percentage of them
            return Math.trunc(Math.random() * 1000) < 0.5;
        }
        constructor(b) {
            this.b = b;
            this.a = new Map();
        }
        logIncoming(msgLength, req, initiator, str) {
            if (initiator === 0 /* RequestInitiator.LocalSide */ && /^receiveReply(Err)?:/.test(str)) {
                // log the size of reply messages
                const requestStr = this.a.get(req) ?? 'unknown_reply';
                this.a.delete(req);
                this.b.publicLog2('extensionhost.incoming', {
                    type: `${str} ${requestStr}`,
                    length: msgLength
                });
            }
            if (initiator === 1 /* RequestInitiator.OtherSide */ && /^receiveRequest /.test(str)) {
                // incoming request
                this.b.publicLog2('extensionhost.incoming', {
                    type: `${str}`,
                    length: msgLength
                });
            }
        }
        logOutgoing(msgLength, req, initiator, str) {
            if (initiator === 0 /* RequestInitiator.LocalSide */ && str.startsWith('request: ')) {
                this.a.set(req, str);
                this.b.publicLog2('extensionhost.outgoing', {
                    type: str,
                    length: msgLength
                });
            }
        }
    };
    TelemetryRPCLogger = __decorate([
        __param(0, telemetry_1.$9k)
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
    (0, actions_1.$Xu)(class MeasureExtHostLatencyAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'editor.action.measureExtHostLatency',
                title: {
                    value: nls.localize(0, null),
                    original: 'Measure Extension Host Latency'
                },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const measurements = await Promise.all(getLatencyTestProviders().map(provider => provider.measure()));
            editorService.openEditor({ resource: undefined, contents: measurements.map(MeasureExtHostLatencyAction.a).join('\n\n'), options: { pinned: true } });
        }
        static a(m) {
            if (!m) {
                return '';
            }
            return `${m.remoteAuthority ? `Authority: ${m.remoteAuthority}\n` : ``}Roundtrip latency: ${m.latency.toFixed(3)}ms\nUp: ${MeasureExtHostLatencyAction.b(m.up)}\nDown: ${MeasureExtHostLatencyAction.b(m.down)}\n`;
        }
        static b(n) {
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
//# sourceMappingURL=extensionHostManager.js.map