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
define(["require", "exports", "vs/nls!vs/workbench/api/common/extHostExtensionService", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/resources", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostConfiguration", "vs/workbench/api/common/extHostExtensionActivator", "vs/workbench/api/common/extHostStorage", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionDescriptionRegistry", "vs/base/common/errors", "vs/platform/extensions/common/extensions", "vs/base/common/buffer", "vs/workbench/api/common/extHostMemento", "vs/workbench/api/common/extHostTypes", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostStoragePaths", "vs/workbench/api/common/extHostRpcService", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/api/common/extHostTerminalService", "vs/base/common/event", "vs/workbench/services/extensions/common/workspaceContains", "vs/workbench/api/common/extHostSecretState", "vs/workbench/api/common/extHostSecrets", "vs/base/common/network", "vs/workbench/api/common/extHostLocalizationService", "vs/base/common/stopwatch", "vs/base/common/platform", "vs/workbench/api/common/extHostManagedSockets"], function (require, exports, nls, path, performance, resources_1, async_1, lifecycle_1, ternarySearchTree_1, uri_1, log_1, extHost_protocol_1, extHostConfiguration_1, extHostExtensionActivator_1, extHostStorage_1, extHostWorkspace_1, extensions_1, extensionDescriptionRegistry_1, errors, extensions_2, buffer_1, extHostMemento_1, extHostTypes_1, remoteAuthorityResolver_1, instantiation_1, extHostInitDataService_1, extHostStoragePaths_1, extHostRpcService_1, serviceCollection_1, extHostTunnelService_1, extHostTerminalService_1, event_1, workspaceContains_1, extHostSecretState_1, extHostSecrets_1, network_1, extHostLocalizationService_1, stopwatch_1, platform_1, extHostManagedSockets_1) {
    "use strict";
    var $Qbc_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Tbc = exports.$Sbc = exports.$Rbc = exports.$Qbc = exports.$Pbc = void 0;
    exports.$Pbc = (0, instantiation_1.$Bh)('IHostUtils');
    let $Qbc = $Qbc_1 = class $Qbc extends lifecycle_1.$kc {
        constructor(instaService, hostUtils, extHostContext, extHostWorkspace, extHostConfiguration, logService, initData, storagePath, extHostTunnelService, extHostTerminalService, extHostLocalizationService, X) {
            super();
            this.X = X;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeRemoteConnectionData = this.a.event;
            this.U = false;
            this.c = hostUtils;
            this.g = extHostContext;
            this.f = initData;
            this.j = extHostWorkspace;
            this.m = extHostConfiguration;
            this.s = logService;
            this.t = extHostTunnelService;
            this.u = extHostTerminalService;
            this.w = extHostLocalizationService;
            this.y = this.g.getProxy(extHost_protocol_1.$1J.MainThreadWorkspace);
            this.z = this.g.getProxy(extHost_protocol_1.$1J.MainThreadTelemetry);
            this.C = this.g.getProxy(extHost_protocol_1.$1J.MainThreadExtensionService);
            this.D = new async_1.$Fg();
            this.F = new async_1.$Fg();
            this.G = new async_1.$Fg();
            this.H = new async_1.$Fg();
            this.I = new SyncedActivationEventsReader(this.f.extensions.activationEvents);
            this.L = new extensionDescriptionRegistry_1.$y3b(this.I, this.f.extensions.allExtensions);
            const myExtensionsSet = new extensions_2.$Wl(this.f.extensions.myExtensions);
            this.J = new extensionDescriptionRegistry_1.$y3b(this.I, filterExtensions(this.L, myExtensionsSet));
            if (platform_1.$s) {
                this.s.info(`Creating extension host with the following global extensions: ${printExtIds(this.L)}`);
                this.s.info(`Creating extension host with the following local extensions: ${printExtIds(this.J)}`);
            }
            this.M = new extHostStorage_1.$wbc(this.g, this.s);
            this.N = new extHostSecretState_1.$Ibc(this.g);
            this.O = storagePath;
            this.h = instaService.createChild(new serviceCollection_1.$zh([extHostStorage_1.$xbc, this.M], [extHostSecretState_1.$Jbc, this.N]));
            this.P = this.B(new extHostExtensionActivator_1.$vbc(this.J, this.L, {
                onExtensionActivationError: (extensionId, error, missingExtensionDependency) => {
                    this.C.$onExtensionActivationError(extensionId, errors.$1(error), missingExtensionDependency);
                },
                actualActivateExtension: async (extensionId, reason) => {
                    if (extensionDescriptionRegistry_1.$y3b.isHostExtension(extensionId, this.J, this.L)) {
                        await this.C.$activateExtension(extensionId, reason);
                        return new extHostExtensionActivator_1.$ubc();
                    }
                    const extensionDescription = this.J.getExtensionDescription(extensionId);
                    return this.db(extensionDescription, reason);
                }
            }, this.s));
            this.Q = null;
            this.R = Object.create(null);
            this.S = false;
            this.W = this.f.remote.connectionData;
        }
        getRemoteConnectionData() {
            return this.W;
        }
        async initialize() {
            try {
                await this.tb();
                this.D.open();
                await this.j.waitForInitializeCall();
                performance.mark('code/extHost/ready');
                this.F.open();
                if (this.f.autoStart) {
                    this.rb();
                }
            }
            catch (err) {
                errors.$Y(err);
            }
        }
        async Y() {
            this.O.onWillDeactivateAll();
            let allPromises = [];
            try {
                const allExtensions = this.J.getAllExtensionDescriptions();
                const allExtensionsIds = allExtensions.map(ext => ext.identifier);
                const activatedExtensions = allExtensionsIds.filter(id => this.isActivated(id));
                allPromises = activatedExtensions.map((extensionId) => {
                    return this.cb(extensionId);
                });
            }
            catch (err) {
                // TODO: write to log once we have one
            }
            await Promise.all(allPromises);
        }
        terminate(reason, code = 0) {
            if (this.U) {
                // we are already shutting down...
                return;
            }
            this.U = true;
            this.s.info(`Extension host terminating: ${reason}`);
            this.s.flush();
            this.u.dispose();
            this.P.dispose();
            errors.setUnexpectedErrorHandler((err) => {
                this.s.error(err);
            });
            // Invalidate all proxies
            this.g.dispose();
            const extensionsDeactivated = this.Y();
            // Give extensions at most 5 seconds to wrap up any async deactivate, then exit
            Promise.race([(0, async_1.$Hg)(5000), extensionsDeactivated]).finally(() => {
                if (this.c.pid) {
                    this.s.info(`Extension host with pid ${this.c.pid} exiting with code ${code}`);
                }
                else {
                    this.s.info(`Extension host exiting with code ${code}`);
                }
                this.s.flush();
                this.s.dispose();
                this.c.exit(code);
            });
        }
        isActivated(extensionId) {
            if (this.G.isOpen()) {
                return this.P.isActivated(extensionId);
            }
            return false;
        }
        async getExtension(extensionId) {
            const ext = await this.C.$getExtension(extensionId);
            return ext && {
                ...ext,
                identifier: new extensions_2.$Vl(ext.identifier.value),
                extensionLocation: uri_1.URI.revive(ext.extensionLocation)
            };
        }
        Z(activationEvent, startup) {
            return this.P.activateByEvent(activationEvent, startup);
        }
        $(extensionId, reason) {
            return this.P.activateById(extensionId, reason);
        }
        activateByIdWithErrors(extensionId, reason) {
            return this.$(extensionId, reason).then(() => {
                const extension = this.P.getActivatedExtension(extensionId);
                if (extension.activationFailed) {
                    // activation failed => bubble up the error as the promise result
                    return Promise.reject(extension.activationFailedError);
                }
                return undefined;
            });
        }
        getExtensionRegistry() {
            return this.G.wait().then(_ => this.J);
        }
        getExtensionExports(extensionId) {
            if (this.G.isOpen()) {
                return this.P.getActivatedExtension(extensionId).exports;
            }
            else {
                try {
                    return this.P.getActivatedExtension(extensionId).exports;
                }
                catch (err) {
                    return null;
                }
            }
        }
        /**
         * Applies realpath to file-uris and returns all others uris unmodified
         */
        async ab(uri) {
            if (uri.scheme === network_1.Schemas.file && this.c.fsRealpath) {
                const realpathValue = await this.c.fsRealpath(uri.fsPath);
                return uri_1.URI.file(realpathValue);
            }
            return uri;
        }
        // create trie to enable fast 'filename -> extension id' look up
        async getExtensionPathIndex() {
            if (!this.Q) {
                this.Q = this.bb(this.J.getAllExtensionDescriptions()).then((searchTree) => {
                    return new $Tbc(searchTree);
                });
            }
            return this.Q;
        }
        /**
         * create trie to enable fast 'filename -> extension id' look up
         */
        async bb(extensions) {
            const tst = ternarySearchTree_1.$Hh.forUris(key => {
                // using the default/biased extUri-util because the IExtHostFileSystemInfo-service
                // isn't ready to be used yet, e.g the knowledge about `file` protocol and others
                // comes in while this code runs
                return resources_1.$_f.ignorePathCasing(key);
            });
            // const tst = TernarySearchTree.forUris<IExtensionDescription>(key => true);
            await Promise.all(extensions.map(async (ext) => {
                if (this.ub(ext)) {
                    const uri = await this.ab(ext.extensionLocation);
                    tst.set(uri, ext);
                }
            }));
            return tst;
        }
        cb(extensionId) {
            let result = Promise.resolve(undefined);
            if (!this.G.isOpen()) {
                return result;
            }
            if (!this.P.isActivated(extensionId)) {
                return result;
            }
            const extension = this.P.getActivatedExtension(extensionId);
            if (!extension) {
                return result;
            }
            // call deactivate if available
            try {
                if (typeof extension.module.deactivate === 'function') {
                    result = Promise.resolve(extension.module.deactivate()).then(undefined, (err) => {
                        this.s.error(err);
                        return Promise.resolve(undefined);
                    });
                }
            }
            catch (err) {
                this.s.error(`An error occurred when deactivating the extension '${extensionId.value}':`);
                this.s.error(err);
            }
            // clean up subscriptions
            try {
                (0, lifecycle_1.$fc)(extension.subscriptions);
            }
            catch (err) {
                this.s.error(`An error occurred when deactivating the subscriptions for extension '${extensionId.value}':`);
                this.s.error(err);
            }
            return result;
        }
        // --- impl
        async db(extensionDescription, reason) {
            if (!this.f.remote.isRemote) {
                // local extension host process
                await this.C.$onWillActivateExtension(extensionDescription.identifier);
            }
            else {
                // remote extension host process
                // do not wait for renderer confirmation
                this.C.$onWillActivateExtension(extensionDescription.identifier);
            }
            return this.fb(extensionDescription, reason).then((activatedExtension) => {
                const activationTimes = activatedExtension.activationTimes;
                this.C.$onDidActivateExtension(extensionDescription.identifier, activationTimes.codeLoadingTime, activationTimes.activateCallTime, activationTimes.activateResolvedTime, reason);
                this.eb(extensionDescription, reason, 'success', activationTimes);
                return activatedExtension;
            }, (err) => {
                this.eb(extensionDescription, reason, 'failure');
                throw err;
            });
        }
        eb(extensionDescription, reason, outcome, activationTimes) {
            const event = getTelemetryActivationEvent(extensionDescription, reason);
            this.z.$publicLog2('extensionActivationTimes', {
                ...event,
                ...(activationTimes || {}),
                outcome
            });
        }
        fb(extensionDescription, reason) {
            const event = getTelemetryActivationEvent(extensionDescription, reason);
            this.z.$publicLog2('activatePlugin', event);
            const entryPoint = this.ub(extensionDescription);
            if (!entryPoint) {
                // Treat the extension as being empty => NOT AN ERROR CASE
                return Promise.resolve(new extHostExtensionActivator_1.$tbc(extHostExtensionActivator_1.$qbc.NONE));
            }
            this.s.info(`ExtensionService#_doActivateExtension ${extensionDescription.identifier.value}, startup: ${reason.startup}, activationEvent: '${reason.activationEvent}'${extensionDescription.identifier.value !== reason.extensionId.value ? `, root cause: ${reason.extensionId.value}` : ``}`);
            this.s.flush();
            const activationTimesBuilder = new extHostExtensionActivator_1.$rbc(reason.startup);
            return Promise.all([
                this.vb(extensionDescription, (0, resources_1.$ig)(extensionDescription.extensionLocation, entryPoint), activationTimesBuilder),
                this.gb(extensionDescription)
            ]).then(values => {
                performance.mark(`code/extHost/willActivateExtension/${extensionDescription.identifier.value}`);
                return $Qbc_1.hb(this.s, extensionDescription.identifier, values[0], values[1], activationTimesBuilder);
            }).then((activatedExtension) => {
                performance.mark(`code/extHost/didActivateExtension/${extensionDescription.identifier.value}`);
                return activatedExtension;
            });
        }
        gb(extensionDescription) {
            const globalState = new extHostMemento_1.$zbc(extensionDescription, this.M);
            const workspaceState = new extHostMemento_1.$ybc(extensionDescription.identifier.value, false, this.M);
            const secrets = new extHostSecrets_1.$Kbc(extensionDescription, this.N);
            const extensionMode = extensionDescription.isUnderDevelopment
                ? (this.f.environment.extensionTestsLocationURI ? extHostTypes_1.ExtensionMode.Test : extHostTypes_1.ExtensionMode.Development)
                : extHostTypes_1.ExtensionMode.Production;
            const extensionKind = this.f.remote.isRemote ? extHostTypes_1.ExtensionKind.Workspace : extHostTypes_1.ExtensionKind.UI;
            this.s.trace(`ExtensionService#loadExtensionContext ${extensionDescription.identifier.value}`);
            return Promise.all([
                globalState.whenReady,
                workspaceState.whenReady,
                this.O.whenReady
            ]).then(() => {
                const that = this;
                let extension;
                let messagePassingProtocol;
                const messagePort = (0, extensions_1.$PF)(extensionDescription, 'ipc')
                    ? this.f.messagePorts?.get(extensions_2.$Vl.toKey(extensionDescription.identifier))
                    : undefined;
                return Object.freeze({
                    globalState,
                    workspaceState,
                    secrets,
                    subscriptions: [],
                    get extensionUri() { return extensionDescription.extensionLocation; },
                    get extensionPath() { return extensionDescription.extensionLocation.fsPath; },
                    asAbsolutePath(relativePath) { return path.$9d(extensionDescription.extensionLocation.fsPath, relativePath); },
                    get storagePath() { return that.O.workspaceValue(extensionDescription)?.fsPath; },
                    get globalStoragePath() { return that.O.globalValue(extensionDescription).fsPath; },
                    get logPath() { return path.$9d(that.f.logsLocation.fsPath, extensionDescription.identifier.value); },
                    get logUri() { return uri_1.URI.joinPath(that.f.logsLocation, extensionDescription.identifier.value); },
                    get storageUri() { return that.O.workspaceValue(extensionDescription); },
                    get globalStorageUri() { return that.O.globalValue(extensionDescription); },
                    get extensionMode() { return extensionMode; },
                    get extension() {
                        if (extension === undefined) {
                            extension = new $Sbc(that, extensionDescription.identifier, extensionDescription, extensionKind, false);
                        }
                        return extension;
                    },
                    get extensionRuntime() {
                        (0, extensions_1.$QF)(extensionDescription, 'extensionRuntime');
                        return that.extensionRuntime;
                    },
                    get environmentVariableCollection() { return that.u.getEnvironmentVariableCollection(extensionDescription); },
                    get messagePassingProtocol() {
                        if (!messagePassingProtocol) {
                            if (!messagePort) {
                                return undefined;
                            }
                            const onDidReceiveMessage = event_1.Event.buffer(event_1.Event.fromDOMEventEmitter(messagePort, 'message', e => e.data));
                            messagePort.start();
                            messagePassingProtocol = {
                                onDidReceiveMessage,
                                postMessage: messagePort.postMessage.bind(messagePort)
                            };
                        }
                        return messagePassingProtocol;
                    }
                });
            });
        }
        static hb(logService, extensionId, extensionModule, context, activationTimesBuilder) {
            // Make sure the extension's surface is not undefined
            extensionModule = extensionModule || {
                activate: undefined,
                deactivate: undefined
            };
            return this.ib(logService, extensionId, extensionModule, context, activationTimesBuilder).then((extensionExports) => {
                return new extHostExtensionActivator_1.$sbc(false, null, activationTimesBuilder.build(), extensionModule, extensionExports, context.subscriptions);
            });
        }
        static ib(logService, extensionId, extensionModule, context, activationTimesBuilder) {
            if (typeof extensionModule.activate === 'function') {
                try {
                    activationTimesBuilder.activateCallStart();
                    logService.trace(`ExtensionService#_callActivateOptional ${extensionId.value}`);
                    const scope = typeof global === 'object' ? global : self; // `global` is nodejs while `self` is for workers
                    const activateResult = extensionModule.activate.apply(scope, [context]);
                    activationTimesBuilder.activateCallStop();
                    activationTimesBuilder.activateResolveStart();
                    return Promise.resolve(activateResult).then((value) => {
                        activationTimesBuilder.activateResolveStop();
                        return value;
                    });
                }
                catch (err) {
                    return Promise.reject(err);
                }
            }
            else {
                // No activate found => the module is the extension's exports
                return Promise.resolve(extensionModule);
            }
        }
        // -- eager activation
        jb(desc, activationEvent) {
            this.$(desc.identifier, {
                startup: false,
                extensionId: desc.identifier,
                activationEvent: activationEvent
            }).then(undefined, (err) => {
                this.s.error(err);
            });
        }
        kb(extensions, start = 0) {
            const timeBudget = 50; // 50 milliseconds
            const startTime = Date.now();
            (0, platform_1.$A)(() => {
                for (let i = start; i < extensions.length; i += 1) {
                    const desc = extensions[i];
                    for (const activationEvent of (desc.activationEvents ?? [])) {
                        if (activationEvent === 'onStartupFinished') {
                            if (Date.now() - startTime > timeBudget) {
                                // time budget for current task has been exceeded
                                // set a new task to activate current and remaining extensions
                                this.kb(extensions, i);
                                break;
                            }
                            else {
                                this.jb(desc, activationEvent);
                            }
                        }
                    }
                }
            });
        }
        lb() {
            // startup is considered finished
            this.C.$setPerformanceMarks(performance.getMarks());
            this.m.getConfigProvider().then((configProvider) => {
                const shouldDeferActivation = configProvider.getConfiguration('extensions.experimental').get('deferredStartupFinishedActivation');
                const allExtensionDescriptions = this.J.getAllExtensionDescriptions();
                if (shouldDeferActivation) {
                    this.kb(allExtensionDescriptions);
                }
                else {
                    for (const desc of allExtensionDescriptions) {
                        if (desc.activationEvents) {
                            for (const activationEvent of desc.activationEvents) {
                                if (activationEvent === 'onStartupFinished') {
                                    this.jb(desc, activationEvent);
                                }
                            }
                        }
                    }
                }
            });
        }
        // Handle "eager" activation extensions
        mb() {
            const starActivation = this.Z('*', true).then(undefined, (err) => {
                this.s.error(err);
            });
            this.B(this.j.onDidChangeWorkspace((e) => this.nb(e.added)));
            const folders = this.j.workspace ? this.j.workspace.folders : [];
            const workspaceContainsActivation = this.nb(folders);
            const remoteResolverActivation = this.pb();
            const eagerExtensionsActivation = Promise.all([remoteResolverActivation, starActivation, workspaceContainsActivation]).then(() => { });
            Promise.race([eagerExtensionsActivation, (0, async_1.$Hg)(10000)]).then(() => {
                this.lb();
            });
            return eagerExtensionsActivation;
        }
        nb(folders) {
            if (folders.length === 0) {
                return Promise.resolve(undefined);
            }
            return Promise.all(this.J.getAllExtensionDescriptions().map((desc) => {
                return this.ob(folders, desc);
            })).then(() => { });
        }
        async ob(folders, desc) {
            if (this.isActivated(desc.identifier)) {
                return;
            }
            const localWithRemote = !this.f.remote.isRemote && !!this.f.remote.authority;
            const host = {
                logService: this.s,
                folders: folders.map(folder => folder.uri),
                forceUsingSearch: localWithRemote || !this.c.fsExists,
                exists: (uri) => this.c.fsExists(uri.fsPath),
                checkExists: (folders, includes, token) => this.y.$checkExists(folders, includes, token)
            };
            const result = await (0, workspaceContains_1.$zlb)(host, desc);
            if (!result) {
                return;
            }
            return (this.$(desc.identifier, { startup: true, extensionId: desc.identifier, activationEvent: result.activationEvent })
                .then(undefined, err => this.s.error(err)));
        }
        async pb() {
            if (this.f.remote.authority) {
                return this.Z(`onResolveRemoteAuthority:${this.f.remote.authority}`, false);
            }
        }
        async $extensionTestsExecute() {
            await this.H.wait();
            try {
                return await this.qb();
            }
            catch (error) {
                console.error(error); // ensure any error message makes it onto the console
                throw error;
            }
        }
        async qb() {
            const { extensionDevelopmentLocationURI, extensionTestsLocationURI } = this.f.environment;
            if (!extensionDevelopmentLocationURI || !extensionTestsLocationURI) {
                throw new Error(nls.localize(0, null));
            }
            // Require the test runner via node require from the provided path
            const testRunner = await this.vb(null, extensionTestsLocationURI, new extHostExtensionActivator_1.$rbc(false));
            if (!testRunner || typeof testRunner.run !== 'function') {
                throw new Error(nls.localize(1, null, extensionTestsLocationURI.toString()));
            }
            // Execute the runner if it follows the old `run` spec
            return new Promise((resolve, reject) => {
                const oldTestRunnerCallback = (error, failures) => {
                    if (error) {
                        if (platform_1.$s) {
                            this.s.error(`Test runner called back with error`, error);
                        }
                        reject(error);
                    }
                    else {
                        if (platform_1.$s) {
                            if (failures) {
                                this.s.info(`Test runner called back with ${failures} failures.`);
                            }
                            else {
                                this.s.info(`Test runner called back with successful outcome.`);
                            }
                        }
                        resolve((typeof failures === 'number' && failures > 0) ? 1 /* ERROR */ : 0 /* OK */);
                    }
                };
                const extensionTestsPath = (0, resources_1.$9f)(extensionTestsLocationURI); // for the old test runner API
                const runResult = testRunner.run(extensionTestsPath, oldTestRunnerCallback);
                // Using the new API `run(): Promise<void>`
                if (runResult && runResult.then) {
                    runResult
                        .then(() => {
                        if (platform_1.$s) {
                            this.s.info(`Test runner finished successfully.`);
                        }
                        resolve(0);
                    })
                        .catch((err) => {
                        if (platform_1.$s) {
                            this.s.error(`Test runner finished with error`, err);
                        }
                        reject(err instanceof Error && err.stack ? err.stack : String(err));
                    });
                }
            });
        }
        rb() {
            if (this.S) {
                throw new Error(`Extension host is already started!`);
            }
            this.S = true;
            return this.F.wait()
                .then(() => this.G.open())
                .then(() => {
                // wait for all activation events that came in during workbench startup, but at maximum 1s
                return Promise.race([this.P.waitForActivatingExtensions(), (0, async_1.$Hg)(1000)]);
            })
                .then(() => this.mb())
                .then(() => {
                this.H.open();
                this.s.info(`Eager extensions activated`);
            });
        }
        // -- called by extensions
        registerRemoteAuthorityResolver(authorityPrefix, resolver) {
            this.R[authorityPrefix] = resolver;
            return (0, lifecycle_1.$ic)(() => {
                delete this.R[authorityPrefix];
            });
        }
        async getRemoteExecServer(remoteAuthority) {
            const { resolver } = await this.sb(remoteAuthority);
            return resolver?.resolveExecServer?.(remoteAuthority, { resolveAttempt: 0 });
        }
        // -- called by main thread
        async sb(remoteAuthority) {
            const authorityPlusIndex = remoteAuthority.indexOf('+');
            if (authorityPlusIndex === -1) {
                throw new extHostTypes_1.$9J(`Not an authority that can be resolved!`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.InvalidAuthority);
            }
            const authorityPrefix = remoteAuthority.substr(0, authorityPlusIndex);
            await this.D.wait();
            await this.Z(`onResolveRemoteAuthority:${authorityPrefix}`, false);
            return { authorityPrefix, resolver: this.R[authorityPrefix] };
        }
        async $resolveAuthority(remoteAuthorityChain, resolveAttempt) {
            const sw = stopwatch_1.$bd.create(false);
            const prefix = () => `[resolveAuthority(${(0, remoteAuthorityResolver_1.$Nk)(remoteAuthorityChain)},${resolveAttempt})][${sw.elapsed()}ms] `;
            const logInfo = (msg) => this.s.info(`${prefix()}${msg}`);
            const logWarning = (msg) => this.s.warn(`${prefix()}${msg}`);
            const logError = (msg, err = undefined) => this.s.error(`${prefix()}${msg}`, err);
            const normalizeError = (err) => {
                if (err instanceof extHostTypes_1.$9J) {
                    return {
                        type: 'error',
                        error: {
                            code: err._code,
                            message: err._message,
                            detail: err._detail
                        }
                    };
                }
                throw err;
            };
            const getResolver = async (remoteAuthority) => {
                logInfo(`activating resolver for ${remoteAuthority}...`);
                const { resolver, authorityPrefix } = await this.sb(remoteAuthority);
                if (!resolver) {
                    logError(`no resolver for ${authorityPrefix}`);
                    throw new extHostTypes_1.$9J(`No remote extension installed to resolve ${authorityPrefix}.`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.NoResolverFound);
                }
                return { resolver, authorityPrefix, remoteAuthority };
            };
            const chain = remoteAuthorityChain.split(/@|%40/g).reverse();
            logInfo(`activating remote resolvers ${chain.join(' -> ')}`);
            let resolvers;
            try {
                resolvers = await Promise.all(chain.map(getResolver)).catch(async (e) => {
                    if (!(e instanceof extHostTypes_1.$9J) || e._code !== remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.InvalidAuthority) {
                        throw e;
                    }
                    logWarning(`resolving nested authorities failed: ${e.message}`);
                    return [await getResolver(remoteAuthorityChain)];
                });
            }
            catch (e) {
                return normalizeError(e);
            }
            const intervalLogger = new async_1.$Rg();
            intervalLogger.cancelAndSet(() => logInfo('waiting...'), 1000);
            let result;
            let execServer;
            for (const [i, { authorityPrefix, resolver, remoteAuthority }] of resolvers.entries()) {
                try {
                    if (i === resolvers.length - 1) {
                        logInfo(`invoking final resolve()...`);
                        performance.mark(`code/extHost/willResolveAuthority/${authorityPrefix}`);
                        result = await resolver.resolve(remoteAuthority, { resolveAttempt, execServer });
                        performance.mark(`code/extHost/didResolveAuthorityOK/${authorityPrefix}`);
                        logInfo(`setting tunnel factory...`);
                        this.B(await this.t.setTunnelFactory(resolver, extHostTypes_1.$8J.isManagedResolvedAuthority(result) ? result : undefined));
                    }
                    else {
                        logInfo(`invoking resolveExecServer() for ${remoteAuthority}`);
                        performance.mark(`code/extHost/willResolveExecServer/${authorityPrefix}`);
                        execServer = await resolver.resolveExecServer?.(remoteAuthority, { resolveAttempt, execServer });
                        if (!execServer) {
                            throw new extHostTypes_1.$9J(`Exec server was not available for ${remoteAuthority}`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.NoResolverFound); // we did, in fact, break the chain :(
                        }
                        performance.mark(`code/extHost/didResolveExecServerOK/${authorityPrefix}`);
                    }
                }
                catch (e) {
                    performance.mark(`code/extHost/didResolveAuthorityError/${authorityPrefix}`);
                    logError(`returned an error`, e);
                    intervalLogger.dispose();
                    return normalizeError(e);
                }
            }
            intervalLogger.dispose();
            const tunnelInformation = {
                environmentTunnels: result.environmentTunnels,
                features: result.tunnelFeatures
            };
            // Split merged API result into separate authority/options
            const options = {
                extensionHostEnv: result.extensionHostEnv,
                isTrusted: result.isTrusted,
                authenticationSession: result.authenticationSessionForInitializingExtensions ? { id: result.authenticationSessionForInitializingExtensions.id, providerId: result.authenticationSessionForInitializingExtensions.providerId } : undefined
            };
            // extension are not required to return an instance of ResolvedAuthority or ManagedResolvedAuthority, so don't use `instanceof`
            logInfo(`returned ${extHostTypes_1.$8J.isManagedResolvedAuthority(result) ? 'managed authority' : `${result.host}:${result.port}`}`);
            let authority;
            if (extHostTypes_1.$8J.isManagedResolvedAuthority(result)) {
                // The socket factory is identified by the `resolveAttempt`, since that is a number which
                // always increments and is unique over all resolve() calls in a workbench session.
                const socketFactoryId = resolveAttempt;
                // There is only on managed socket factory at a time, so we can just overwrite the old one.
                this.X.setFactory(socketFactoryId, result.makeConnection);
                authority = {
                    authority: remoteAuthorityChain,
                    connectTo: new remoteAuthorityResolver_1.$Kk(socketFactoryId),
                    connectionToken: result.connectionToken
                };
            }
            else {
                authority = {
                    authority: remoteAuthorityChain,
                    connectTo: new remoteAuthorityResolver_1.$Lk(result.host, result.port),
                    connectionToken: result.connectionToken
                };
            }
            return {
                type: 'ok',
                value: {
                    authority: authority,
                    options,
                    tunnelInformation,
                }
            };
        }
        async $getCanonicalURI(remoteAuthority, uriComponents) {
            this.s.info(`$getCanonicalURI invoked for authority (${(0, remoteAuthorityResolver_1.$Nk)(remoteAuthority)})`);
            const { resolver } = await this.sb(remoteAuthority);
            if (!resolver) {
                // Return `null` if no resolver for `remoteAuthority` is found.
                return null;
            }
            const uri = uri_1.URI.revive(uriComponents);
            if (typeof resolver.getCanonicalURI === 'undefined') {
                // resolver cannot compute canonical URI
                return uri;
            }
            const result = await (0, async_1.$zg)(() => resolver.getCanonicalURI(uri));
            if (!result) {
                return uri;
            }
            return result;
        }
        $startExtensionHost(extensionsDelta) {
            extensionsDelta.toAdd.forEach((extension) => extension.extensionLocation = uri_1.URI.revive(extension.extensionLocation));
            const { globalRegistry, myExtensions } = applyExtensionsDelta(this.I, this.L, this.J, extensionsDelta);
            this.L.set(globalRegistry.getAllExtensionDescriptions());
            this.J.set(myExtensions);
            if (platform_1.$s) {
                this.s.info(`$startExtensionHost: global extensions: ${printExtIds(this.L)}`);
                this.s.info(`$startExtensionHost: local extensions: ${printExtIds(this.J)}`);
            }
            return this.rb();
        }
        $activateByEvent(activationEvent, activationKind) {
            if (activationKind === 1 /* ActivationKind.Immediate */) {
                return this.D.wait()
                    .then(_ => this.Z(activationEvent, false));
            }
            return (this.G.wait()
                .then(_ => this.Z(activationEvent, false)));
        }
        async $activate(extensionId, reason) {
            await this.G.wait();
            if (!this.J.getExtensionDescription(extensionId)) {
                // unknown extension => ignore
                return false;
            }
            await this.$(extensionId, reason);
            return true;
        }
        async $deltaExtensions(extensionsDelta) {
            extensionsDelta.toAdd.forEach((extension) => extension.extensionLocation = uri_1.URI.revive(extension.extensionLocation));
            // First build up and update the trie and only afterwards apply the delta
            const { globalRegistry, myExtensions } = applyExtensionsDelta(this.I, this.L, this.J, extensionsDelta);
            const newSearchTree = await this.bb(myExtensions);
            const extensionsPaths = await this.getExtensionPathIndex();
            extensionsPaths.setSearchTree(newSearchTree);
            this.L.set(globalRegistry.getAllExtensionDescriptions());
            this.J.set(myExtensions);
            if (platform_1.$s) {
                this.s.info(`$deltaExtensions: global extensions: ${printExtIds(this.L)}`);
                this.s.info(`$deltaExtensions: local extensions: ${printExtIds(this.J)}`);
            }
            return Promise.resolve(undefined);
        }
        async $test_latency(n) {
            return n;
        }
        async $test_up(b) {
            return b.byteLength;
        }
        async $test_down(size) {
            const buff = buffer_1.$Fd.alloc(size);
            const value = Math.random() % 256;
            for (let i = 0; i < size; i++) {
                buff.writeUInt8(value, i);
            }
            return buff;
        }
        async $updateRemoteConnectionData(connectionData) {
            this.W = connectionData;
            this.a.fire();
        }
    };
    exports.$Qbc = $Qbc;
    exports.$Qbc = $Qbc = $Qbc_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, exports.$Pbc),
        __param(2, extHostRpcService_1.$2L),
        __param(3, extHostWorkspace_1.$jbc),
        __param(4, extHostConfiguration_1.$mbc),
        __param(5, log_1.$5i),
        __param(6, extHostInitDataService_1.$fM),
        __param(7, extHostStoragePaths_1.$Cbc),
        __param(8, extHostTunnelService_1.$rsb),
        __param(9, extHostTerminalService_1.$Ebc),
        __param(10, extHostLocalizationService_1.$Mbc),
        __param(11, extHostManagedSockets_1.$Nbc)
    ], $Qbc);
    function applyExtensionsDelta(activationEventsReader, oldGlobalRegistry, oldMyRegistry, extensionsDelta) {
        activationEventsReader.addActivationEvents(extensionsDelta.addActivationEvents);
        const globalRegistry = new extensionDescriptionRegistry_1.$y3b(activationEventsReader, oldGlobalRegistry.getAllExtensionDescriptions());
        globalRegistry.deltaExtensions(extensionsDelta.toAdd, extensionsDelta.toRemove);
        const myExtensionsSet = new extensions_2.$Wl(oldMyRegistry.getAllExtensionDescriptions().map(extension => extension.identifier));
        for (const extensionId of extensionsDelta.myToRemove) {
            myExtensionsSet.delete(extensionId);
        }
        for (const extensionId of extensionsDelta.myToAdd) {
            myExtensionsSet.add(extensionId);
        }
        const myExtensions = filterExtensions(globalRegistry, myExtensionsSet);
        return { globalRegistry, myExtensions };
    }
    function getTelemetryActivationEvent(extensionDescription, reason) {
        const event = {
            id: extensionDescription.identifier.value,
            name: extensionDescription.name,
            extensionVersion: extensionDescription.version,
            publisherDisplayName: extensionDescription.publisher,
            activationEvents: extensionDescription.activationEvents ? extensionDescription.activationEvents.join(',') : null,
            isBuiltin: extensionDescription.isBuiltin,
            reason: reason.activationEvent,
            reasonId: reason.extensionId.value,
        };
        return event;
    }
    function printExtIds(registry) {
        return registry.getAllExtensionDescriptions().map(ext => ext.identifier.value).join(',');
    }
    exports.$Rbc = (0, instantiation_1.$Bh)('IExtHostExtensionService');
    class $Sbc {
        #extensionService;
        #originExtensionId;
        #identifier;
        constructor(extensionService, originExtensionId, description, kind, isFromDifferentExtensionHost) {
            this.#extensionService = extensionService;
            this.#originExtensionId = originExtensionId;
            this.#identifier = description.identifier;
            this.id = description.identifier.value;
            this.extensionUri = description.extensionLocation;
            this.extensionPath = path.$7d((0, resources_1.$9f)(description.extensionLocation));
            this.packageJSON = description;
            this.extensionKind = kind;
            this.isFromDifferentExtensionHost = isFromDifferentExtensionHost;
        }
        get isActive() {
            // TODO@alexdima support this
            return this.#extensionService.isActivated(this.#identifier);
        }
        get exports() {
            if (this.packageJSON.api === 'none' || this.isFromDifferentExtensionHost) {
                return undefined; // Strict nulloverride - Public api
            }
            return this.#extensionService.getExtensionExports(this.#identifier);
        }
        async activate() {
            if (this.isFromDifferentExtensionHost) {
                throw new Error('Cannot activate foreign extension'); // TODO@alexdima support this
            }
            await this.#extensionService.activateByIdWithErrors(this.#identifier, { startup: false, extensionId: this.#originExtensionId, activationEvent: 'api' });
            return this.exports;
        }
    }
    exports.$Sbc = $Sbc;
    function filterExtensions(globalRegistry, desiredExtensions) {
        return globalRegistry.getAllExtensionDescriptions().filter(extension => desiredExtensions.has(extension.identifier));
    }
    class $Tbc {
        constructor(a) {
            this.a = a;
        }
        setSearchTree(searchTree) {
            this.a = searchTree;
        }
        findSubstr(key) {
            return this.a.findSubstr(key);
        }
        forEach(callback) {
            return this.a.forEach(callback);
        }
    }
    exports.$Tbc = $Tbc;
    /**
     * This mirrors the activation events as seen by the renderer. The renderer
     * is the only one which can have a reliable view of activation events because
     * implicit activation events are generated via extension points, and they
     * are registered only on the renderer side.
     */
    class SyncedActivationEventsReader {
        constructor(activationEvents) {
            this.a = new extensions_2.$Xl();
            this.addActivationEvents(activationEvents);
        }
        readActivationEvents(extensionDescription) {
            return this.a.get(extensionDescription.identifier);
        }
        addActivationEvents(activationEvents) {
            for (const extensionId of Object.keys(activationEvents)) {
                this.a.set(extensionId, activationEvents[extensionId]);
            }
        }
    }
});
//# sourceMappingURL=extHostExtensionService.js.map