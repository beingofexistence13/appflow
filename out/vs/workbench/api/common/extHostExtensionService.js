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
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/resources", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostConfiguration", "vs/workbench/api/common/extHostExtensionActivator", "vs/workbench/api/common/extHostStorage", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionDescriptionRegistry", "vs/base/common/errors", "vs/platform/extensions/common/extensions", "vs/base/common/buffer", "vs/workbench/api/common/extHostMemento", "vs/workbench/api/common/extHostTypes", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostStoragePaths", "vs/workbench/api/common/extHostRpcService", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/api/common/extHostTerminalService", "vs/base/common/event", "vs/workbench/services/extensions/common/workspaceContains", "vs/workbench/api/common/extHostSecretState", "vs/workbench/api/common/extHostSecrets", "vs/base/common/network", "vs/workbench/api/common/extHostLocalizationService", "vs/base/common/stopwatch", "vs/base/common/platform", "vs/workbench/api/common/extHostManagedSockets"], function (require, exports, nls, path, performance, resources_1, async_1, lifecycle_1, ternarySearchTree_1, uri_1, log_1, extHost_protocol_1, extHostConfiguration_1, extHostExtensionActivator_1, extHostStorage_1, extHostWorkspace_1, extensions_1, extensionDescriptionRegistry_1, errors, extensions_2, buffer_1, extHostMemento_1, extHostTypes_1, remoteAuthorityResolver_1, instantiation_1, extHostInitDataService_1, extHostStoragePaths_1, extHostRpcService_1, serviceCollection_1, extHostTunnelService_1, extHostTerminalService_1, event_1, workspaceContains_1, extHostSecretState_1, extHostSecrets_1, network_1, extHostLocalizationService_1, stopwatch_1, platform_1, extHostManagedSockets_1) {
    "use strict";
    var AbstractExtHostExtensionService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionPaths = exports.Extension = exports.IExtHostExtensionService = exports.AbstractExtHostExtensionService = exports.IHostUtils = void 0;
    exports.IHostUtils = (0, instantiation_1.createDecorator)('IHostUtils');
    let AbstractExtHostExtensionService = AbstractExtHostExtensionService_1 = class AbstractExtHostExtensionService extends lifecycle_1.Disposable {
        constructor(instaService, hostUtils, extHostContext, extHostWorkspace, extHostConfiguration, logService, initData, storagePath, extHostTunnelService, extHostTerminalService, extHostLocalizationService, _extHostManagedSockets) {
            super();
            this._extHostManagedSockets = _extHostManagedSockets;
            this._onDidChangeRemoteConnectionData = this._register(new event_1.Emitter());
            this.onDidChangeRemoteConnectionData = this._onDidChangeRemoteConnectionData.event;
            this._isTerminating = false;
            this._hostUtils = hostUtils;
            this._extHostContext = extHostContext;
            this._initData = initData;
            this._extHostWorkspace = extHostWorkspace;
            this._extHostConfiguration = extHostConfiguration;
            this._logService = logService;
            this._extHostTunnelService = extHostTunnelService;
            this._extHostTerminalService = extHostTerminalService;
            this._extHostLocalizationService = extHostLocalizationService;
            this._mainThreadWorkspaceProxy = this._extHostContext.getProxy(extHost_protocol_1.MainContext.MainThreadWorkspace);
            this._mainThreadTelemetryProxy = this._extHostContext.getProxy(extHost_protocol_1.MainContext.MainThreadTelemetry);
            this._mainThreadExtensionsProxy = this._extHostContext.getProxy(extHost_protocol_1.MainContext.MainThreadExtensionService);
            this._almostReadyToRunExtensions = new async_1.Barrier();
            this._readyToStartExtensionHost = new async_1.Barrier();
            this._readyToRunExtensions = new async_1.Barrier();
            this._eagerExtensionsActivated = new async_1.Barrier();
            this._activationEventsReader = new SyncedActivationEventsReader(this._initData.extensions.activationEvents);
            this._globalRegistry = new extensionDescriptionRegistry_1.ExtensionDescriptionRegistry(this._activationEventsReader, this._initData.extensions.allExtensions);
            const myExtensionsSet = new extensions_2.ExtensionIdentifierSet(this._initData.extensions.myExtensions);
            this._myRegistry = new extensionDescriptionRegistry_1.ExtensionDescriptionRegistry(this._activationEventsReader, filterExtensions(this._globalRegistry, myExtensionsSet));
            if (platform_1.isCI) {
                this._logService.info(`Creating extension host with the following global extensions: ${printExtIds(this._globalRegistry)}`);
                this._logService.info(`Creating extension host with the following local extensions: ${printExtIds(this._myRegistry)}`);
            }
            this._storage = new extHostStorage_1.ExtHostStorage(this._extHostContext, this._logService);
            this._secretState = new extHostSecretState_1.ExtHostSecretState(this._extHostContext);
            this._storagePath = storagePath;
            this._instaService = instaService.createChild(new serviceCollection_1.ServiceCollection([extHostStorage_1.IExtHostStorage, this._storage], [extHostSecretState_1.IExtHostSecretState, this._secretState]));
            this._activator = this._register(new extHostExtensionActivator_1.ExtensionsActivator(this._myRegistry, this._globalRegistry, {
                onExtensionActivationError: (extensionId, error, missingExtensionDependency) => {
                    this._mainThreadExtensionsProxy.$onExtensionActivationError(extensionId, errors.transformErrorForSerialization(error), missingExtensionDependency);
                },
                actualActivateExtension: async (extensionId, reason) => {
                    if (extensionDescriptionRegistry_1.ExtensionDescriptionRegistry.isHostExtension(extensionId, this._myRegistry, this._globalRegistry)) {
                        await this._mainThreadExtensionsProxy.$activateExtension(extensionId, reason);
                        return new extHostExtensionActivator_1.HostExtension();
                    }
                    const extensionDescription = this._myRegistry.getExtensionDescription(extensionId);
                    return this._activateExtension(extensionDescription, reason);
                }
            }, this._logService));
            this._extensionPathIndex = null;
            this._resolvers = Object.create(null);
            this._started = false;
            this._remoteConnectionData = this._initData.remote.connectionData;
        }
        getRemoteConnectionData() {
            return this._remoteConnectionData;
        }
        async initialize() {
            try {
                await this._beforeAlmostReadyToRunExtensions();
                this._almostReadyToRunExtensions.open();
                await this._extHostWorkspace.waitForInitializeCall();
                performance.mark('code/extHost/ready');
                this._readyToStartExtensionHost.open();
                if (this._initData.autoStart) {
                    this._startExtensionHost();
                }
            }
            catch (err) {
                errors.onUnexpectedError(err);
            }
        }
        async _deactivateAll() {
            this._storagePath.onWillDeactivateAll();
            let allPromises = [];
            try {
                const allExtensions = this._myRegistry.getAllExtensionDescriptions();
                const allExtensionsIds = allExtensions.map(ext => ext.identifier);
                const activatedExtensions = allExtensionsIds.filter(id => this.isActivated(id));
                allPromises = activatedExtensions.map((extensionId) => {
                    return this._deactivate(extensionId);
                });
            }
            catch (err) {
                // TODO: write to log once we have one
            }
            await Promise.all(allPromises);
        }
        terminate(reason, code = 0) {
            if (this._isTerminating) {
                // we are already shutting down...
                return;
            }
            this._isTerminating = true;
            this._logService.info(`Extension host terminating: ${reason}`);
            this._logService.flush();
            this._extHostTerminalService.dispose();
            this._activator.dispose();
            errors.setUnexpectedErrorHandler((err) => {
                this._logService.error(err);
            });
            // Invalidate all proxies
            this._extHostContext.dispose();
            const extensionsDeactivated = this._deactivateAll();
            // Give extensions at most 5 seconds to wrap up any async deactivate, then exit
            Promise.race([(0, async_1.timeout)(5000), extensionsDeactivated]).finally(() => {
                if (this._hostUtils.pid) {
                    this._logService.info(`Extension host with pid ${this._hostUtils.pid} exiting with code ${code}`);
                }
                else {
                    this._logService.info(`Extension host exiting with code ${code}`);
                }
                this._logService.flush();
                this._logService.dispose();
                this._hostUtils.exit(code);
            });
        }
        isActivated(extensionId) {
            if (this._readyToRunExtensions.isOpen()) {
                return this._activator.isActivated(extensionId);
            }
            return false;
        }
        async getExtension(extensionId) {
            const ext = await this._mainThreadExtensionsProxy.$getExtension(extensionId);
            return ext && {
                ...ext,
                identifier: new extensions_2.ExtensionIdentifier(ext.identifier.value),
                extensionLocation: uri_1.URI.revive(ext.extensionLocation)
            };
        }
        _activateByEvent(activationEvent, startup) {
            return this._activator.activateByEvent(activationEvent, startup);
        }
        _activateById(extensionId, reason) {
            return this._activator.activateById(extensionId, reason);
        }
        activateByIdWithErrors(extensionId, reason) {
            return this._activateById(extensionId, reason).then(() => {
                const extension = this._activator.getActivatedExtension(extensionId);
                if (extension.activationFailed) {
                    // activation failed => bubble up the error as the promise result
                    return Promise.reject(extension.activationFailedError);
                }
                return undefined;
            });
        }
        getExtensionRegistry() {
            return this._readyToRunExtensions.wait().then(_ => this._myRegistry);
        }
        getExtensionExports(extensionId) {
            if (this._readyToRunExtensions.isOpen()) {
                return this._activator.getActivatedExtension(extensionId).exports;
            }
            else {
                try {
                    return this._activator.getActivatedExtension(extensionId).exports;
                }
                catch (err) {
                    return null;
                }
            }
        }
        /**
         * Applies realpath to file-uris and returns all others uris unmodified
         */
        async _realPathExtensionUri(uri) {
            if (uri.scheme === network_1.Schemas.file && this._hostUtils.fsRealpath) {
                const realpathValue = await this._hostUtils.fsRealpath(uri.fsPath);
                return uri_1.URI.file(realpathValue);
            }
            return uri;
        }
        // create trie to enable fast 'filename -> extension id' look up
        async getExtensionPathIndex() {
            if (!this._extensionPathIndex) {
                this._extensionPathIndex = this._createExtensionPathIndex(this._myRegistry.getAllExtensionDescriptions()).then((searchTree) => {
                    return new ExtensionPaths(searchTree);
                });
            }
            return this._extensionPathIndex;
        }
        /**
         * create trie to enable fast 'filename -> extension id' look up
         */
        async _createExtensionPathIndex(extensions) {
            const tst = ternarySearchTree_1.TernarySearchTree.forUris(key => {
                // using the default/biased extUri-util because the IExtHostFileSystemInfo-service
                // isn't ready to be used yet, e.g the knowledge about `file` protocol and others
                // comes in while this code runs
                return resources_1.extUriBiasedIgnorePathCase.ignorePathCasing(key);
            });
            // const tst = TernarySearchTree.forUris<IExtensionDescription>(key => true);
            await Promise.all(extensions.map(async (ext) => {
                if (this._getEntryPoint(ext)) {
                    const uri = await this._realPathExtensionUri(ext.extensionLocation);
                    tst.set(uri, ext);
                }
            }));
            return tst;
        }
        _deactivate(extensionId) {
            let result = Promise.resolve(undefined);
            if (!this._readyToRunExtensions.isOpen()) {
                return result;
            }
            if (!this._activator.isActivated(extensionId)) {
                return result;
            }
            const extension = this._activator.getActivatedExtension(extensionId);
            if (!extension) {
                return result;
            }
            // call deactivate if available
            try {
                if (typeof extension.module.deactivate === 'function') {
                    result = Promise.resolve(extension.module.deactivate()).then(undefined, (err) => {
                        this._logService.error(err);
                        return Promise.resolve(undefined);
                    });
                }
            }
            catch (err) {
                this._logService.error(`An error occurred when deactivating the extension '${extensionId.value}':`);
                this._logService.error(err);
            }
            // clean up subscriptions
            try {
                (0, lifecycle_1.dispose)(extension.subscriptions);
            }
            catch (err) {
                this._logService.error(`An error occurred when deactivating the subscriptions for extension '${extensionId.value}':`);
                this._logService.error(err);
            }
            return result;
        }
        // --- impl
        async _activateExtension(extensionDescription, reason) {
            if (!this._initData.remote.isRemote) {
                // local extension host process
                await this._mainThreadExtensionsProxy.$onWillActivateExtension(extensionDescription.identifier);
            }
            else {
                // remote extension host process
                // do not wait for renderer confirmation
                this._mainThreadExtensionsProxy.$onWillActivateExtension(extensionDescription.identifier);
            }
            return this._doActivateExtension(extensionDescription, reason).then((activatedExtension) => {
                const activationTimes = activatedExtension.activationTimes;
                this._mainThreadExtensionsProxy.$onDidActivateExtension(extensionDescription.identifier, activationTimes.codeLoadingTime, activationTimes.activateCallTime, activationTimes.activateResolvedTime, reason);
                this._logExtensionActivationTimes(extensionDescription, reason, 'success', activationTimes);
                return activatedExtension;
            }, (err) => {
                this._logExtensionActivationTimes(extensionDescription, reason, 'failure');
                throw err;
            });
        }
        _logExtensionActivationTimes(extensionDescription, reason, outcome, activationTimes) {
            const event = getTelemetryActivationEvent(extensionDescription, reason);
            this._mainThreadTelemetryProxy.$publicLog2('extensionActivationTimes', {
                ...event,
                ...(activationTimes || {}),
                outcome
            });
        }
        _doActivateExtension(extensionDescription, reason) {
            const event = getTelemetryActivationEvent(extensionDescription, reason);
            this._mainThreadTelemetryProxy.$publicLog2('activatePlugin', event);
            const entryPoint = this._getEntryPoint(extensionDescription);
            if (!entryPoint) {
                // Treat the extension as being empty => NOT AN ERROR CASE
                return Promise.resolve(new extHostExtensionActivator_1.EmptyExtension(extHostExtensionActivator_1.ExtensionActivationTimes.NONE));
            }
            this._logService.info(`ExtensionService#_doActivateExtension ${extensionDescription.identifier.value}, startup: ${reason.startup}, activationEvent: '${reason.activationEvent}'${extensionDescription.identifier.value !== reason.extensionId.value ? `, root cause: ${reason.extensionId.value}` : ``}`);
            this._logService.flush();
            const activationTimesBuilder = new extHostExtensionActivator_1.ExtensionActivationTimesBuilder(reason.startup);
            return Promise.all([
                this._loadCommonJSModule(extensionDescription, (0, resources_1.joinPath)(extensionDescription.extensionLocation, entryPoint), activationTimesBuilder),
                this._loadExtensionContext(extensionDescription)
            ]).then(values => {
                performance.mark(`code/extHost/willActivateExtension/${extensionDescription.identifier.value}`);
                return AbstractExtHostExtensionService_1._callActivate(this._logService, extensionDescription.identifier, values[0], values[1], activationTimesBuilder);
            }).then((activatedExtension) => {
                performance.mark(`code/extHost/didActivateExtension/${extensionDescription.identifier.value}`);
                return activatedExtension;
            });
        }
        _loadExtensionContext(extensionDescription) {
            const globalState = new extHostMemento_1.ExtensionGlobalMemento(extensionDescription, this._storage);
            const workspaceState = new extHostMemento_1.ExtensionMemento(extensionDescription.identifier.value, false, this._storage);
            const secrets = new extHostSecrets_1.ExtensionSecrets(extensionDescription, this._secretState);
            const extensionMode = extensionDescription.isUnderDevelopment
                ? (this._initData.environment.extensionTestsLocationURI ? extHostTypes_1.ExtensionMode.Test : extHostTypes_1.ExtensionMode.Development)
                : extHostTypes_1.ExtensionMode.Production;
            const extensionKind = this._initData.remote.isRemote ? extHostTypes_1.ExtensionKind.Workspace : extHostTypes_1.ExtensionKind.UI;
            this._logService.trace(`ExtensionService#loadExtensionContext ${extensionDescription.identifier.value}`);
            return Promise.all([
                globalState.whenReady,
                workspaceState.whenReady,
                this._storagePath.whenReady
            ]).then(() => {
                const that = this;
                let extension;
                let messagePassingProtocol;
                const messagePort = (0, extensions_1.isProposedApiEnabled)(extensionDescription, 'ipc')
                    ? this._initData.messagePorts?.get(extensions_2.ExtensionIdentifier.toKey(extensionDescription.identifier))
                    : undefined;
                return Object.freeze({
                    globalState,
                    workspaceState,
                    secrets,
                    subscriptions: [],
                    get extensionUri() { return extensionDescription.extensionLocation; },
                    get extensionPath() { return extensionDescription.extensionLocation.fsPath; },
                    asAbsolutePath(relativePath) { return path.join(extensionDescription.extensionLocation.fsPath, relativePath); },
                    get storagePath() { return that._storagePath.workspaceValue(extensionDescription)?.fsPath; },
                    get globalStoragePath() { return that._storagePath.globalValue(extensionDescription).fsPath; },
                    get logPath() { return path.join(that._initData.logsLocation.fsPath, extensionDescription.identifier.value); },
                    get logUri() { return uri_1.URI.joinPath(that._initData.logsLocation, extensionDescription.identifier.value); },
                    get storageUri() { return that._storagePath.workspaceValue(extensionDescription); },
                    get globalStorageUri() { return that._storagePath.globalValue(extensionDescription); },
                    get extensionMode() { return extensionMode; },
                    get extension() {
                        if (extension === undefined) {
                            extension = new Extension(that, extensionDescription.identifier, extensionDescription, extensionKind, false);
                        }
                        return extension;
                    },
                    get extensionRuntime() {
                        (0, extensions_1.checkProposedApiEnabled)(extensionDescription, 'extensionRuntime');
                        return that.extensionRuntime;
                    },
                    get environmentVariableCollection() { return that._extHostTerminalService.getEnvironmentVariableCollection(extensionDescription); },
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
        static _callActivate(logService, extensionId, extensionModule, context, activationTimesBuilder) {
            // Make sure the extension's surface is not undefined
            extensionModule = extensionModule || {
                activate: undefined,
                deactivate: undefined
            };
            return this._callActivateOptional(logService, extensionId, extensionModule, context, activationTimesBuilder).then((extensionExports) => {
                return new extHostExtensionActivator_1.ActivatedExtension(false, null, activationTimesBuilder.build(), extensionModule, extensionExports, context.subscriptions);
            });
        }
        static _callActivateOptional(logService, extensionId, extensionModule, context, activationTimesBuilder) {
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
        _activateOneStartupFinished(desc, activationEvent) {
            this._activateById(desc.identifier, {
                startup: false,
                extensionId: desc.identifier,
                activationEvent: activationEvent
            }).then(undefined, (err) => {
                this._logService.error(err);
            });
        }
        _activateAllStartupFinishedDeferred(extensions, start = 0) {
            const timeBudget = 50; // 50 milliseconds
            const startTime = Date.now();
            (0, platform_1.setTimeout0)(() => {
                for (let i = start; i < extensions.length; i += 1) {
                    const desc = extensions[i];
                    for (const activationEvent of (desc.activationEvents ?? [])) {
                        if (activationEvent === 'onStartupFinished') {
                            if (Date.now() - startTime > timeBudget) {
                                // time budget for current task has been exceeded
                                // set a new task to activate current and remaining extensions
                                this._activateAllStartupFinishedDeferred(extensions, i);
                                break;
                            }
                            else {
                                this._activateOneStartupFinished(desc, activationEvent);
                            }
                        }
                    }
                }
            });
        }
        _activateAllStartupFinished() {
            // startup is considered finished
            this._mainThreadExtensionsProxy.$setPerformanceMarks(performance.getMarks());
            this._extHostConfiguration.getConfigProvider().then((configProvider) => {
                const shouldDeferActivation = configProvider.getConfiguration('extensions.experimental').get('deferredStartupFinishedActivation');
                const allExtensionDescriptions = this._myRegistry.getAllExtensionDescriptions();
                if (shouldDeferActivation) {
                    this._activateAllStartupFinishedDeferred(allExtensionDescriptions);
                }
                else {
                    for (const desc of allExtensionDescriptions) {
                        if (desc.activationEvents) {
                            for (const activationEvent of desc.activationEvents) {
                                if (activationEvent === 'onStartupFinished') {
                                    this._activateOneStartupFinished(desc, activationEvent);
                                }
                            }
                        }
                    }
                }
            });
        }
        // Handle "eager" activation extensions
        _handleEagerExtensions() {
            const starActivation = this._activateByEvent('*', true).then(undefined, (err) => {
                this._logService.error(err);
            });
            this._register(this._extHostWorkspace.onDidChangeWorkspace((e) => this._handleWorkspaceContainsEagerExtensions(e.added)));
            const folders = this._extHostWorkspace.workspace ? this._extHostWorkspace.workspace.folders : [];
            const workspaceContainsActivation = this._handleWorkspaceContainsEagerExtensions(folders);
            const remoteResolverActivation = this._handleRemoteResolverEagerExtensions();
            const eagerExtensionsActivation = Promise.all([remoteResolverActivation, starActivation, workspaceContainsActivation]).then(() => { });
            Promise.race([eagerExtensionsActivation, (0, async_1.timeout)(10000)]).then(() => {
                this._activateAllStartupFinished();
            });
            return eagerExtensionsActivation;
        }
        _handleWorkspaceContainsEagerExtensions(folders) {
            if (folders.length === 0) {
                return Promise.resolve(undefined);
            }
            return Promise.all(this._myRegistry.getAllExtensionDescriptions().map((desc) => {
                return this._handleWorkspaceContainsEagerExtension(folders, desc);
            })).then(() => { });
        }
        async _handleWorkspaceContainsEagerExtension(folders, desc) {
            if (this.isActivated(desc.identifier)) {
                return;
            }
            const localWithRemote = !this._initData.remote.isRemote && !!this._initData.remote.authority;
            const host = {
                logService: this._logService,
                folders: folders.map(folder => folder.uri),
                forceUsingSearch: localWithRemote || !this._hostUtils.fsExists,
                exists: (uri) => this._hostUtils.fsExists(uri.fsPath),
                checkExists: (folders, includes, token) => this._mainThreadWorkspaceProxy.$checkExists(folders, includes, token)
            };
            const result = await (0, workspaceContains_1.checkActivateWorkspaceContainsExtension)(host, desc);
            if (!result) {
                return;
            }
            return (this._activateById(desc.identifier, { startup: true, extensionId: desc.identifier, activationEvent: result.activationEvent })
                .then(undefined, err => this._logService.error(err)));
        }
        async _handleRemoteResolverEagerExtensions() {
            if (this._initData.remote.authority) {
                return this._activateByEvent(`onResolveRemoteAuthority:${this._initData.remote.authority}`, false);
            }
        }
        async $extensionTestsExecute() {
            await this._eagerExtensionsActivated.wait();
            try {
                return await this._doHandleExtensionTests();
            }
            catch (error) {
                console.error(error); // ensure any error message makes it onto the console
                throw error;
            }
        }
        async _doHandleExtensionTests() {
            const { extensionDevelopmentLocationURI, extensionTestsLocationURI } = this._initData.environment;
            if (!extensionDevelopmentLocationURI || !extensionTestsLocationURI) {
                throw new Error(nls.localize('extensionTestError1', "Cannot load test runner."));
            }
            // Require the test runner via node require from the provided path
            const testRunner = await this._loadCommonJSModule(null, extensionTestsLocationURI, new extHostExtensionActivator_1.ExtensionActivationTimesBuilder(false));
            if (!testRunner || typeof testRunner.run !== 'function') {
                throw new Error(nls.localize('extensionTestError', "Path {0} does not point to a valid extension test runner.", extensionTestsLocationURI.toString()));
            }
            // Execute the runner if it follows the old `run` spec
            return new Promise((resolve, reject) => {
                const oldTestRunnerCallback = (error, failures) => {
                    if (error) {
                        if (platform_1.isCI) {
                            this._logService.error(`Test runner called back with error`, error);
                        }
                        reject(error);
                    }
                    else {
                        if (platform_1.isCI) {
                            if (failures) {
                                this._logService.info(`Test runner called back with ${failures} failures.`);
                            }
                            else {
                                this._logService.info(`Test runner called back with successful outcome.`);
                            }
                        }
                        resolve((typeof failures === 'number' && failures > 0) ? 1 /* ERROR */ : 0 /* OK */);
                    }
                };
                const extensionTestsPath = (0, resources_1.originalFSPath)(extensionTestsLocationURI); // for the old test runner API
                const runResult = testRunner.run(extensionTestsPath, oldTestRunnerCallback);
                // Using the new API `run(): Promise<void>`
                if (runResult && runResult.then) {
                    runResult
                        .then(() => {
                        if (platform_1.isCI) {
                            this._logService.info(`Test runner finished successfully.`);
                        }
                        resolve(0);
                    })
                        .catch((err) => {
                        if (platform_1.isCI) {
                            this._logService.error(`Test runner finished with error`, err);
                        }
                        reject(err instanceof Error && err.stack ? err.stack : String(err));
                    });
                }
            });
        }
        _startExtensionHost() {
            if (this._started) {
                throw new Error(`Extension host is already started!`);
            }
            this._started = true;
            return this._readyToStartExtensionHost.wait()
                .then(() => this._readyToRunExtensions.open())
                .then(() => {
                // wait for all activation events that came in during workbench startup, but at maximum 1s
                return Promise.race([this._activator.waitForActivatingExtensions(), (0, async_1.timeout)(1000)]);
            })
                .then(() => this._handleEagerExtensions())
                .then(() => {
                this._eagerExtensionsActivated.open();
                this._logService.info(`Eager extensions activated`);
            });
        }
        // -- called by extensions
        registerRemoteAuthorityResolver(authorityPrefix, resolver) {
            this._resolvers[authorityPrefix] = resolver;
            return (0, lifecycle_1.toDisposable)(() => {
                delete this._resolvers[authorityPrefix];
            });
        }
        async getRemoteExecServer(remoteAuthority) {
            const { resolver } = await this._activateAndGetResolver(remoteAuthority);
            return resolver?.resolveExecServer?.(remoteAuthority, { resolveAttempt: 0 });
        }
        // -- called by main thread
        async _activateAndGetResolver(remoteAuthority) {
            const authorityPlusIndex = remoteAuthority.indexOf('+');
            if (authorityPlusIndex === -1) {
                throw new extHostTypes_1.RemoteAuthorityResolverError(`Not an authority that can be resolved!`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.InvalidAuthority);
            }
            const authorityPrefix = remoteAuthority.substr(0, authorityPlusIndex);
            await this._almostReadyToRunExtensions.wait();
            await this._activateByEvent(`onResolveRemoteAuthority:${authorityPrefix}`, false);
            return { authorityPrefix, resolver: this._resolvers[authorityPrefix] };
        }
        async $resolveAuthority(remoteAuthorityChain, resolveAttempt) {
            const sw = stopwatch_1.StopWatch.create(false);
            const prefix = () => `[resolveAuthority(${(0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthorityChain)},${resolveAttempt})][${sw.elapsed()}ms] `;
            const logInfo = (msg) => this._logService.info(`${prefix()}${msg}`);
            const logWarning = (msg) => this._logService.warn(`${prefix()}${msg}`);
            const logError = (msg, err = undefined) => this._logService.error(`${prefix()}${msg}`, err);
            const normalizeError = (err) => {
                if (err instanceof extHostTypes_1.RemoteAuthorityResolverError) {
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
                const { resolver, authorityPrefix } = await this._activateAndGetResolver(remoteAuthority);
                if (!resolver) {
                    logError(`no resolver for ${authorityPrefix}`);
                    throw new extHostTypes_1.RemoteAuthorityResolverError(`No remote extension installed to resolve ${authorityPrefix}.`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.NoResolverFound);
                }
                return { resolver, authorityPrefix, remoteAuthority };
            };
            const chain = remoteAuthorityChain.split(/@|%40/g).reverse();
            logInfo(`activating remote resolvers ${chain.join(' -> ')}`);
            let resolvers;
            try {
                resolvers = await Promise.all(chain.map(getResolver)).catch(async (e) => {
                    if (!(e instanceof extHostTypes_1.RemoteAuthorityResolverError) || e._code !== remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.InvalidAuthority) {
                        throw e;
                    }
                    logWarning(`resolving nested authorities failed: ${e.message}`);
                    return [await getResolver(remoteAuthorityChain)];
                });
            }
            catch (e) {
                return normalizeError(e);
            }
            const intervalLogger = new async_1.IntervalTimer();
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
                        this._register(await this._extHostTunnelService.setTunnelFactory(resolver, extHostTypes_1.ManagedResolvedAuthority.isManagedResolvedAuthority(result) ? result : undefined));
                    }
                    else {
                        logInfo(`invoking resolveExecServer() for ${remoteAuthority}`);
                        performance.mark(`code/extHost/willResolveExecServer/${authorityPrefix}`);
                        execServer = await resolver.resolveExecServer?.(remoteAuthority, { resolveAttempt, execServer });
                        if (!execServer) {
                            throw new extHostTypes_1.RemoteAuthorityResolverError(`Exec server was not available for ${remoteAuthority}`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.NoResolverFound); // we did, in fact, break the chain :(
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
            logInfo(`returned ${extHostTypes_1.ManagedResolvedAuthority.isManagedResolvedAuthority(result) ? 'managed authority' : `${result.host}:${result.port}`}`);
            let authority;
            if (extHostTypes_1.ManagedResolvedAuthority.isManagedResolvedAuthority(result)) {
                // The socket factory is identified by the `resolveAttempt`, since that is a number which
                // always increments and is unique over all resolve() calls in a workbench session.
                const socketFactoryId = resolveAttempt;
                // There is only on managed socket factory at a time, so we can just overwrite the old one.
                this._extHostManagedSockets.setFactory(socketFactoryId, result.makeConnection);
                authority = {
                    authority: remoteAuthorityChain,
                    connectTo: new remoteAuthorityResolver_1.ManagedRemoteConnection(socketFactoryId),
                    connectionToken: result.connectionToken
                };
            }
            else {
                authority = {
                    authority: remoteAuthorityChain,
                    connectTo: new remoteAuthorityResolver_1.WebSocketRemoteConnection(result.host, result.port),
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
            this._logService.info(`$getCanonicalURI invoked for authority (${(0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthority)})`);
            const { resolver } = await this._activateAndGetResolver(remoteAuthority);
            if (!resolver) {
                // Return `null` if no resolver for `remoteAuthority` is found.
                return null;
            }
            const uri = uri_1.URI.revive(uriComponents);
            if (typeof resolver.getCanonicalURI === 'undefined') {
                // resolver cannot compute canonical URI
                return uri;
            }
            const result = await (0, async_1.asPromise)(() => resolver.getCanonicalURI(uri));
            if (!result) {
                return uri;
            }
            return result;
        }
        $startExtensionHost(extensionsDelta) {
            extensionsDelta.toAdd.forEach((extension) => extension.extensionLocation = uri_1.URI.revive(extension.extensionLocation));
            const { globalRegistry, myExtensions } = applyExtensionsDelta(this._activationEventsReader, this._globalRegistry, this._myRegistry, extensionsDelta);
            this._globalRegistry.set(globalRegistry.getAllExtensionDescriptions());
            this._myRegistry.set(myExtensions);
            if (platform_1.isCI) {
                this._logService.info(`$startExtensionHost: global extensions: ${printExtIds(this._globalRegistry)}`);
                this._logService.info(`$startExtensionHost: local extensions: ${printExtIds(this._myRegistry)}`);
            }
            return this._startExtensionHost();
        }
        $activateByEvent(activationEvent, activationKind) {
            if (activationKind === 1 /* ActivationKind.Immediate */) {
                return this._almostReadyToRunExtensions.wait()
                    .then(_ => this._activateByEvent(activationEvent, false));
            }
            return (this._readyToRunExtensions.wait()
                .then(_ => this._activateByEvent(activationEvent, false)));
        }
        async $activate(extensionId, reason) {
            await this._readyToRunExtensions.wait();
            if (!this._myRegistry.getExtensionDescription(extensionId)) {
                // unknown extension => ignore
                return false;
            }
            await this._activateById(extensionId, reason);
            return true;
        }
        async $deltaExtensions(extensionsDelta) {
            extensionsDelta.toAdd.forEach((extension) => extension.extensionLocation = uri_1.URI.revive(extension.extensionLocation));
            // First build up and update the trie and only afterwards apply the delta
            const { globalRegistry, myExtensions } = applyExtensionsDelta(this._activationEventsReader, this._globalRegistry, this._myRegistry, extensionsDelta);
            const newSearchTree = await this._createExtensionPathIndex(myExtensions);
            const extensionsPaths = await this.getExtensionPathIndex();
            extensionsPaths.setSearchTree(newSearchTree);
            this._globalRegistry.set(globalRegistry.getAllExtensionDescriptions());
            this._myRegistry.set(myExtensions);
            if (platform_1.isCI) {
                this._logService.info(`$deltaExtensions: global extensions: ${printExtIds(this._globalRegistry)}`);
                this._logService.info(`$deltaExtensions: local extensions: ${printExtIds(this._myRegistry)}`);
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
            const buff = buffer_1.VSBuffer.alloc(size);
            const value = Math.random() % 256;
            for (let i = 0; i < size; i++) {
                buff.writeUInt8(value, i);
            }
            return buff;
        }
        async $updateRemoteConnectionData(connectionData) {
            this._remoteConnectionData = connectionData;
            this._onDidChangeRemoteConnectionData.fire();
        }
    };
    exports.AbstractExtHostExtensionService = AbstractExtHostExtensionService;
    exports.AbstractExtHostExtensionService = AbstractExtHostExtensionService = AbstractExtHostExtensionService_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, exports.IHostUtils),
        __param(2, extHostRpcService_1.IExtHostRpcService),
        __param(3, extHostWorkspace_1.IExtHostWorkspace),
        __param(4, extHostConfiguration_1.IExtHostConfiguration),
        __param(5, log_1.ILogService),
        __param(6, extHostInitDataService_1.IExtHostInitDataService),
        __param(7, extHostStoragePaths_1.IExtensionStoragePaths),
        __param(8, extHostTunnelService_1.IExtHostTunnelService),
        __param(9, extHostTerminalService_1.IExtHostTerminalService),
        __param(10, extHostLocalizationService_1.IExtHostLocalizationService),
        __param(11, extHostManagedSockets_1.IExtHostManagedSockets)
    ], AbstractExtHostExtensionService);
    function applyExtensionsDelta(activationEventsReader, oldGlobalRegistry, oldMyRegistry, extensionsDelta) {
        activationEventsReader.addActivationEvents(extensionsDelta.addActivationEvents);
        const globalRegistry = new extensionDescriptionRegistry_1.ExtensionDescriptionRegistry(activationEventsReader, oldGlobalRegistry.getAllExtensionDescriptions());
        globalRegistry.deltaExtensions(extensionsDelta.toAdd, extensionsDelta.toRemove);
        const myExtensionsSet = new extensions_2.ExtensionIdentifierSet(oldMyRegistry.getAllExtensionDescriptions().map(extension => extension.identifier));
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
    exports.IExtHostExtensionService = (0, instantiation_1.createDecorator)('IExtHostExtensionService');
    class Extension {
        #extensionService;
        #originExtensionId;
        #identifier;
        constructor(extensionService, originExtensionId, description, kind, isFromDifferentExtensionHost) {
            this.#extensionService = extensionService;
            this.#originExtensionId = originExtensionId;
            this.#identifier = description.identifier;
            this.id = description.identifier.value;
            this.extensionUri = description.extensionLocation;
            this.extensionPath = path.normalize((0, resources_1.originalFSPath)(description.extensionLocation));
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
    exports.Extension = Extension;
    function filterExtensions(globalRegistry, desiredExtensions) {
        return globalRegistry.getAllExtensionDescriptions().filter(extension => desiredExtensions.has(extension.identifier));
    }
    class ExtensionPaths {
        constructor(_searchTree) {
            this._searchTree = _searchTree;
        }
        setSearchTree(searchTree) {
            this._searchTree = searchTree;
        }
        findSubstr(key) {
            return this._searchTree.findSubstr(key);
        }
        forEach(callback) {
            return this._searchTree.forEach(callback);
        }
    }
    exports.ExtensionPaths = ExtensionPaths;
    /**
     * This mirrors the activation events as seen by the renderer. The renderer
     * is the only one which can have a reliable view of activation events because
     * implicit activation events are generated via extension points, and they
     * are registered only on the renderer side.
     */
    class SyncedActivationEventsReader {
        constructor(activationEvents) {
            this._map = new extensions_2.ExtensionIdentifierMap();
            this.addActivationEvents(activationEvents);
        }
        readActivationEvents(extensionDescription) {
            return this._map.get(extensionDescription.identifier);
        }
        addActivationEvents(activationEvents) {
            for (const extensionId of Object.keys(activationEvents)) {
                this._map.set(extensionId, activationEvents[extensionId]);
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEV4dGVuc2lvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0RXh0ZW5zaW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeURuRixRQUFBLFVBQVUsR0FBRyxJQUFBLCtCQUFlLEVBQWEsWUFBWSxDQUFDLENBQUM7SUFxQjdELElBQWUsK0JBQStCLHVDQUE5QyxNQUFlLCtCQUFnQyxTQUFRLHNCQUFVO1FBNEN2RSxZQUN3QixZQUFtQyxFQUM5QyxTQUFxQixFQUNiLGNBQWtDLEVBQ25DLGdCQUFtQyxFQUMvQixvQkFBMkMsRUFDckQsVUFBdUIsRUFDWCxRQUFpQyxFQUNsQyxXQUFtQyxFQUNwQyxvQkFBMkMsRUFDekMsc0JBQStDLEVBQzNDLDBCQUF1RCxFQUM1RCxzQkFBK0Q7WUFFdkYsS0FBSyxFQUFFLENBQUM7WUFGaUMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtZQWxEdkUscUNBQWdDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDeEUsb0NBQStCLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLEtBQUssQ0FBQztZQWtDdEYsbUJBQWMsR0FBWSxLQUFLLENBQUM7WUFrQnZDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBRTFCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztZQUMxQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7WUFDbEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7WUFDOUIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDO1lBQ2xELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxzQkFBc0IsQ0FBQztZQUN0RCxJQUFJLENBQUMsMkJBQTJCLEdBQUcsMEJBQTBCLENBQUM7WUFFOUQsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ2hHLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFFeEcsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksZUFBTyxFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksZUFBTyxFQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksZUFBTyxFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksZUFBTyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksNEJBQTRCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM1RyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksMkRBQTRCLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQy9ILE1BQU0sZUFBZSxHQUFHLElBQUksbUNBQXNCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDM0YsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLDJEQUE0QixDQUNsRCxJQUFJLENBQUMsdUJBQXVCLEVBQzVCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQ3ZELENBQUM7WUFFRixJQUFJLGVBQUksRUFBRTtnQkFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxpRUFBaUUsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzVILElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGdFQUFnRSxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN2SDtZQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSwrQkFBYyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSx1Q0FBa0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7WUFFaEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUkscUNBQWlCLENBQ2xFLENBQUMsZ0NBQWUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQ2hDLENBQUMsd0NBQW1CLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUN4QyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwrQ0FBbUIsQ0FDdkQsSUFBSSxDQUFDLFdBQVcsRUFDaEIsSUFBSSxDQUFDLGVBQWUsRUFDcEI7Z0JBQ0MsMEJBQTBCLEVBQUUsQ0FBQyxXQUFnQyxFQUFFLEtBQVksRUFBRSwwQkFBNkQsRUFBUSxFQUFFO29CQUNuSixJQUFJLENBQUMsMEJBQTBCLENBQUMsMkJBQTJCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLENBQUMsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO2dCQUNwSixDQUFDO2dCQUVELHVCQUF1QixFQUFFLEtBQUssRUFBRSxXQUFnQyxFQUFFLE1BQWlDLEVBQStCLEVBQUU7b0JBQ25JLElBQUksMkRBQTRCLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRTt3QkFDdEcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUM5RSxPQUFPLElBQUkseUNBQWEsRUFBRSxDQUFDO3FCQUMzQjtvQkFDRCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFFLENBQUM7b0JBQ3BGLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO2FBQ0QsRUFDRCxJQUFJLENBQUMsV0FBVyxDQUNoQixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUN0QixJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO1FBQ25FLENBQUM7UUFFTSx1QkFBdUI7WUFDN0IsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUM7UUFDbkMsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVO1lBQ3RCLElBQUk7Z0JBRUgsTUFBTSxJQUFJLENBQUMsaUNBQWlDLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUV4QyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUNyRCxXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFdkMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7aUJBQzNCO2FBQ0Q7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYixNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDOUI7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLGNBQWM7WUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRXhDLElBQUksV0FBVyxHQUFvQixFQUFFLENBQUM7WUFDdEMsSUFBSTtnQkFDSCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLDJCQUEyQixFQUFFLENBQUM7Z0JBQ3JFLE1BQU0sZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDbEUsTUFBTSxtQkFBbUIsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRWhGLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDckQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDLENBQUMsQ0FBQzthQUNIO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2Isc0NBQXNDO2FBQ3RDO1lBQ0QsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFTSxTQUFTLENBQUMsTUFBYyxFQUFFLE9BQWUsQ0FBQztZQUNoRCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3hCLGtDQUFrQztnQkFDbEMsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUV6QixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUxQixNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLENBQUM7WUFFSCx5QkFBeUI7WUFDekIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUvQixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUVwRCwrRUFBK0U7WUFDL0UsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUEsZUFBTyxFQUFDLElBQUksQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO2dCQUNqRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQywyQkFBMkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLHNCQUFzQixJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUNsRztxQkFBTTtvQkFDTixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFDbEU7Z0JBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sV0FBVyxDQUFDLFdBQWdDO1lBQ2xELElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUN4QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ2hEO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sS0FBSyxDQUFDLFlBQVksQ0FBQyxXQUFtQjtZQUM1QyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDN0UsT0FBTyxHQUFHLElBQUk7Z0JBQ2IsR0FBRyxHQUFHO2dCQUNOLFVBQVUsRUFBRSxJQUFJLGdDQUFtQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO2dCQUN6RCxpQkFBaUIsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQzthQUNwRCxDQUFDO1FBQ0gsQ0FBQztRQUVPLGdCQUFnQixDQUFDLGVBQXVCLEVBQUUsT0FBZ0I7WUFDakUsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVPLGFBQWEsQ0FBQyxXQUFnQyxFQUFFLE1BQWlDO1lBQ3hGLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFTSxzQkFBc0IsQ0FBQyxXQUFnQyxFQUFFLE1BQWlDO1lBQ2hHLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDeEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDckUsSUFBSSxTQUFTLENBQUMsZ0JBQWdCLEVBQUU7b0JBQy9CLGlFQUFpRTtvQkFDakUsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2lCQUN2RDtnQkFDRCxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxvQkFBb0I7WUFDMUIsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxXQUFnQztZQUMxRCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDeEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQzthQUNsRTtpQkFBTTtnQkFDTixJQUFJO29CQUNILE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUM7aUJBQ2xFO2dCQUFDLE9BQU8sR0FBRyxFQUFFO29CQUNiLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2FBQ0Q7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSyxLQUFLLENBQUMscUJBQXFCLENBQUMsR0FBUTtZQUMzQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7Z0JBQzlELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRSxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDL0I7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFRCxnRUFBZ0U7UUFDekQsS0FBSyxDQUFDLHFCQUFxQjtZQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUM5QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO29CQUM3SCxPQUFPLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDLENBQUMsQ0FBQzthQUNIO1lBQ0QsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7UUFDakMsQ0FBQztRQUVEOztXQUVHO1FBQ0ssS0FBSyxDQUFDLHlCQUF5QixDQUFDLFVBQW1DO1lBQzFFLE1BQU0sR0FBRyxHQUFHLHFDQUFpQixDQUFDLE9BQU8sQ0FBd0IsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xFLGtGQUFrRjtnQkFDbEYsaUZBQWlGO2dCQUNqRixnQ0FBZ0M7Z0JBQ2hDLE9BQU8sc0NBQTBCLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekQsQ0FBQyxDQUFDLENBQUM7WUFDSCw2RUFBNkU7WUFDN0UsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO2dCQUM5QyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzdCLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO29CQUNwRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDbEI7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDO1FBRU8sV0FBVyxDQUFDLFdBQWdDO1lBQ25ELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDekMsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDOUMsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZixPQUFPLE1BQU0sQ0FBQzthQUNkO1lBRUQsK0JBQStCO1lBQy9CLElBQUk7Z0JBQ0gsSUFBSSxPQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxLQUFLLFVBQVUsRUFBRTtvQkFDdEQsTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTt3QkFDL0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzVCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDbkMsQ0FBQyxDQUFDLENBQUM7aUJBQ0g7YUFDRDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNiLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLHNEQUFzRCxXQUFXLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztnQkFDcEcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDNUI7WUFFRCx5QkFBeUI7WUFDekIsSUFBSTtnQkFDSCxJQUFBLG1CQUFPLEVBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ2pDO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsd0VBQXdFLFdBQVcsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO2dCQUN0SCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM1QjtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVELFdBQVc7UUFFSCxLQUFLLENBQUMsa0JBQWtCLENBQUMsb0JBQTJDLEVBQUUsTUFBaUM7WUFDOUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDcEMsK0JBQStCO2dCQUMvQixNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyx3QkFBd0IsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoRztpQkFBTTtnQkFDTixnQ0FBZ0M7Z0JBQ2hDLHdDQUF3QztnQkFDeEMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLHdCQUF3QixDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzFGO1lBQ0QsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsb0JBQW9CLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsRUFBRTtnQkFDMUYsTUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUMsZUFBZSxDQUFDO2dCQUMzRCxJQUFJLENBQUMsMEJBQTBCLENBQUMsdUJBQXVCLENBQUMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLG9CQUFvQixFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBQzVGLE9BQU8sa0JBQWtCLENBQUM7WUFDM0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLDRCQUE0QixDQUFDLG9CQUFvQixFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDM0UsTUFBTSxHQUFHLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyw0QkFBNEIsQ0FBQyxvQkFBMkMsRUFBRSxNQUFpQyxFQUFFLE9BQWUsRUFBRSxlQUEwQztZQUMvSyxNQUFNLEtBQUssR0FBRywyQkFBMkIsQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQWtCeEUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBd0UsMEJBQTBCLEVBQUU7Z0JBQzdJLEdBQUcsS0FBSztnQkFDUixHQUFHLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQztnQkFDMUIsT0FBTzthQUNQLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxvQkFBMkMsRUFBRSxNQUFpQztZQUMxRyxNQUFNLEtBQUssR0FBRywyQkFBMkIsQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUt4RSxJQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxDQUF5RCxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM1SCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsMERBQTBEO2dCQUMxRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSwwQ0FBYyxDQUFDLG9EQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDMUU7WUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLEtBQUssY0FBYyxNQUFNLENBQUMsT0FBTyx1QkFBdUIsTUFBTSxDQUFDLGVBQWUsSUFBSSxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxUyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRXpCLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSwyREFBK0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkYsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNsQixJQUFJLENBQUMsbUJBQW1CLENBQW1CLG9CQUFvQixFQUFFLElBQUEsb0JBQVEsRUFBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsRUFBRSxzQkFBc0IsQ0FBQztnQkFDdEosSUFBSSxDQUFDLHFCQUFxQixDQUFDLG9CQUFvQixDQUFDO2FBQ2hELENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2hCLFdBQVcsQ0FBQyxJQUFJLENBQUMsc0NBQXNDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRyxPQUFPLGlDQUErQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFDdkosQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsRUFBRTtnQkFDOUIsV0FBVyxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQy9GLE9BQU8sa0JBQWtCLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8scUJBQXFCLENBQUMsb0JBQTJDO1lBRXhFLE1BQU0sV0FBVyxHQUFHLElBQUksdUNBQXNCLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BGLE1BQU0sY0FBYyxHQUFHLElBQUksaUNBQWdCLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pHLE1BQU0sT0FBTyxHQUFHLElBQUksaUNBQWdCLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzlFLE1BQU0sYUFBYSxHQUFHLG9CQUFvQixDQUFDLGtCQUFrQjtnQkFDNUQsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLDRCQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyw0QkFBYSxDQUFDLFdBQVcsQ0FBQztnQkFDekcsQ0FBQyxDQUFDLDRCQUFhLENBQUMsVUFBVSxDQUFDO1lBQzVCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsNEJBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDRCQUFhLENBQUMsRUFBRSxDQUFDO1lBRWxHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUV6RyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ2xCLFdBQVcsQ0FBQyxTQUFTO2dCQUNyQixjQUFjLENBQUMsU0FBUztnQkFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO2FBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNaLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDbEIsSUFBSSxTQUE0QyxDQUFDO2dCQUVqRCxJQUFJLHNCQUFpRSxDQUFDO2dCQUN0RSxNQUFNLFdBQVcsR0FBRyxJQUFBLGlDQUFvQixFQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQztvQkFDcEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxnQ0FBbUIsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzlGLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBRWIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUEwQjtvQkFDN0MsV0FBVztvQkFDWCxjQUFjO29CQUNkLE9BQU87b0JBQ1AsYUFBYSxFQUFFLEVBQUU7b0JBQ2pCLElBQUksWUFBWSxLQUFLLE9BQU8sb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO29CQUNyRSxJQUFJLGFBQWEsS0FBSyxPQUFPLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQzdFLGNBQWMsQ0FBQyxZQUFvQixJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2SCxJQUFJLFdBQVcsS0FBSyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDNUYsSUFBSSxpQkFBaUIsS0FBSyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDOUYsSUFBSSxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5RyxJQUFJLE1BQU0sS0FBSyxPQUFPLFNBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekcsSUFBSSxVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbkYsSUFBSSxnQkFBZ0IsS0FBSyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0RixJQUFJLGFBQWEsS0FBSyxPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQzdDLElBQUksU0FBUzt3QkFDWixJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7NEJBQzVCLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLENBQUMsVUFBVSxFQUFFLG9CQUFvQixFQUFFLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQzt5QkFDN0c7d0JBQ0QsT0FBTyxTQUFTLENBQUM7b0JBQ2xCLENBQUM7b0JBQ0QsSUFBSSxnQkFBZ0I7d0JBQ25CLElBQUEsb0NBQXVCLEVBQUMsb0JBQW9CLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzt3QkFDbEUsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7b0JBQzlCLENBQUM7b0JBQ0QsSUFBSSw2QkFBNkIsS0FBSyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxnQ0FBZ0MsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbkksSUFBSSxzQkFBc0I7d0JBQ3pCLElBQUksQ0FBQyxzQkFBc0IsRUFBRTs0QkFDNUIsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQ0FDakIsT0FBTyxTQUFTLENBQUM7NkJBQ2pCOzRCQUVELE1BQU0sbUJBQW1CLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxhQUFLLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUN6RyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7NEJBQ3BCLHNCQUFzQixHQUFHO2dDQUN4QixtQkFBbUI7Z0NBQ25CLFdBQVcsRUFBRSxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQVE7NkJBQzdELENBQUM7eUJBQ0Y7d0JBRUQsT0FBTyxzQkFBc0IsQ0FBQztvQkFDL0IsQ0FBQztpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxNQUFNLENBQUMsYUFBYSxDQUFDLFVBQXVCLEVBQUUsV0FBZ0MsRUFBRSxlQUFpQyxFQUFFLE9BQWdDLEVBQUUsc0JBQXVEO1lBQ25OLHFEQUFxRDtZQUNyRCxlQUFlLEdBQUcsZUFBZSxJQUFJO2dCQUNwQyxRQUFRLEVBQUUsU0FBUztnQkFDbkIsVUFBVSxFQUFFLFNBQVM7YUFDckIsQ0FBQztZQUVGLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLGdCQUFnQixFQUFFLEVBQUU7Z0JBQ3RJLE9BQU8sSUFBSSw4Q0FBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixDQUFDLEtBQUssRUFBRSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdEksQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sTUFBTSxDQUFDLHFCQUFxQixDQUFDLFVBQXVCLEVBQUUsV0FBZ0MsRUFBRSxlQUFpQyxFQUFFLE9BQWdDLEVBQUUsc0JBQXVEO1lBQzNOLElBQUksT0FBTyxlQUFlLENBQUMsUUFBUSxLQUFLLFVBQVUsRUFBRTtnQkFDbkQsSUFBSTtvQkFDSCxzQkFBc0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO29CQUMzQyxVQUFVLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztvQkFDaEYsTUFBTSxLQUFLLEdBQUcsT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLGlEQUFpRDtvQkFDM0csTUFBTSxjQUFjLEdBQTJCLGVBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ2hHLHNCQUFzQixDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBRTFDLHNCQUFzQixDQUFDLG9CQUFvQixFQUFFLENBQUM7b0JBQzlDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTt3QkFDckQsc0JBQXNCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzt3QkFDN0MsT0FBTyxLQUFLLENBQUM7b0JBQ2QsQ0FBQyxDQUFDLENBQUM7aUJBQ0g7Z0JBQUMsT0FBTyxHQUFHLEVBQUU7b0JBQ2IsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUMzQjthQUNEO2lCQUFNO2dCQUNOLDZEQUE2RDtnQkFDN0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFnQixlQUFlLENBQUMsQ0FBQzthQUN2RDtRQUNGLENBQUM7UUFFRCxzQkFBc0I7UUFFZCwyQkFBMkIsQ0FBQyxJQUEyQixFQUFFLGVBQXVCO1lBQ3ZGLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDbkMsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUM1QixlQUFlLEVBQUUsZUFBZTthQUNoQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxtQ0FBbUMsQ0FBQyxVQUFvRCxFQUFFLFFBQWdCLENBQUM7WUFDbEgsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUMsa0JBQWtCO1lBQ3pDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUU3QixJQUFBLHNCQUFXLEVBQUMsR0FBRyxFQUFFO2dCQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNsRCxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLEtBQUssTUFBTSxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksRUFBRSxDQUFDLEVBQUU7d0JBQzVELElBQUksZUFBZSxLQUFLLG1CQUFtQixFQUFFOzRCQUM1QyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLEdBQUcsVUFBVSxFQUFFO2dDQUN4QyxpREFBaUQ7Z0NBQ2pELDhEQUE4RDtnQ0FDOUQsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQ0FDeEQsTUFBTTs2QkFDTjtpQ0FBTTtnQ0FDTixJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDOzZCQUN4RDt5QkFDRDtxQkFDRDtpQkFDRDtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLDJCQUEyQjtZQUNsQyxpQ0FBaUM7WUFDakMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRTdFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxFQUFFO2dCQUN0RSxNQUFNLHFCQUFxQixHQUFHLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEdBQUcsQ0FBVSxtQ0FBbUMsQ0FBQyxDQUFDO2dCQUMzSSxNQUFNLHdCQUF3QixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztnQkFDaEYsSUFBSSxxQkFBcUIsRUFBRTtvQkFDMUIsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLHdCQUF3QixDQUFDLENBQUM7aUJBQ25FO3FCQUFNO29CQUNOLEtBQUssTUFBTSxJQUFJLElBQUksd0JBQXdCLEVBQUU7d0JBQzVDLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFOzRCQUMxQixLQUFLLE1BQU0sZUFBZSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQ0FDcEQsSUFBSSxlQUFlLEtBQUssbUJBQW1CLEVBQUU7b0NBQzVDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7aUNBQ3hEOzZCQUNEO3lCQUNEO3FCQUNEO2lCQUNEO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsdUNBQXVDO1FBQy9CLHNCQUFzQjtZQUM3QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDL0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUgsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNqRyxNQUFNLDJCQUEyQixHQUFHLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxRixNQUFNLHdCQUF3QixHQUFHLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDO1lBQzdFLE1BQU0seUJBQXlCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLGNBQWMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXZJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyx5QkFBeUIsRUFBRSxJQUFBLGVBQU8sRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDbkUsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLHlCQUF5QixDQUFDO1FBQ2xDLENBQUM7UUFFTyx1Q0FBdUMsQ0FBQyxPQUE4QztZQUM3RixJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6QixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDbEM7WUFFRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQ2pCLElBQUksQ0FBQyxXQUFXLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDM0QsT0FBTyxJQUFJLENBQUMsc0NBQXNDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxDQUNGLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUM7UUFFTyxLQUFLLENBQUMsc0NBQXNDLENBQUMsT0FBOEMsRUFBRSxJQUEyQjtZQUMvSCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN0QyxPQUFPO2FBQ1A7WUFFRCxNQUFNLGVBQWUsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQzdGLE1BQU0sSUFBSSxHQUE2QjtnQkFDdEMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUM1QixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7Z0JBQzFDLGdCQUFnQixFQUFFLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUTtnQkFDOUQsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUN0RCxXQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQzthQUNoSCxDQUFDO1lBRUYsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLDJEQUF1QyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU87YUFDUDtZQUVELE9BQU8sQ0FDTixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7aUJBQzNILElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUNyRCxDQUFDO1FBQ0gsQ0FBQztRQUVPLEtBQUssQ0FBQyxvQ0FBb0M7WUFDakQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLDRCQUE0QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNuRztRQUNGLENBQUM7UUFFTSxLQUFLLENBQUMsc0JBQXNCO1lBQ2xDLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxDQUFDO1lBQzVDLElBQUk7Z0JBQ0gsT0FBTyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2FBQzVDO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLHFEQUFxRDtnQkFDM0UsTUFBTSxLQUFLLENBQUM7YUFDWjtRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsdUJBQXVCO1lBQ3BDLE1BQU0sRUFBRSwrQkFBK0IsRUFBRSx5QkFBeUIsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO1lBQ2xHLElBQUksQ0FBQywrQkFBK0IsSUFBSSxDQUFDLHlCQUF5QixFQUFFO2dCQUNuRSxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO2FBQ2pGO1lBRUQsa0VBQWtFO1lBQ2xFLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUEyQyxJQUFJLEVBQUUseUJBQXlCLEVBQUUsSUFBSSwyREFBK0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRXpLLElBQUksQ0FBQyxVQUFVLElBQUksT0FBTyxVQUFVLENBQUMsR0FBRyxLQUFLLFVBQVUsRUFBRTtnQkFDeEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLDJEQUEyRCxFQUFFLHlCQUF5QixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN2SjtZQUVELHNEQUFzRDtZQUN0RCxPQUFPLElBQUksT0FBTyxDQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUM5QyxNQUFNLHFCQUFxQixHQUFHLENBQUMsS0FBWSxFQUFFLFFBQTRCLEVBQUUsRUFBRTtvQkFDNUUsSUFBSSxLQUFLLEVBQUU7d0JBQ1YsSUFBSSxlQUFJLEVBQUU7NEJBQ1QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsS0FBSyxDQUFDLENBQUM7eUJBQ3BFO3dCQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDZDt5QkFBTTt3QkFDTixJQUFJLGVBQUksRUFBRTs0QkFDVCxJQUFJLFFBQVEsRUFBRTtnQ0FDYixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsUUFBUSxZQUFZLENBQUMsQ0FBQzs2QkFDNUU7aUNBQU07Z0NBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0RBQWtELENBQUMsQ0FBQzs2QkFDMUU7eUJBQ0Q7d0JBQ0QsT0FBTyxDQUFDLENBQUMsT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUNyRjtnQkFDRixDQUFDLENBQUM7Z0JBRUYsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLDBCQUFjLEVBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLDhCQUE4QjtnQkFFcEcsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO2dCQUU1RSwyQ0FBMkM7Z0JBQzNDLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUU7b0JBQ2hDLFNBQVM7eUJBQ1AsSUFBSSxDQUFDLEdBQUcsRUFBRTt3QkFDVixJQUFJLGVBQUksRUFBRTs0QkFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO3lCQUM1RDt3QkFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osQ0FBQyxDQUFDO3lCQUNELEtBQUssQ0FBQyxDQUFDLEdBQVksRUFBRSxFQUFFO3dCQUN2QixJQUFJLGVBQUksRUFBRTs0QkFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLENBQUMsQ0FBQzt5QkFDL0Q7d0JBQ0QsTUFBTSxDQUFDLEdBQUcsWUFBWSxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3JFLENBQUMsQ0FBQyxDQUFDO2lCQUNKO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sbUJBQW1CO1lBQzFCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO2FBQ3REO1lBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFFckIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxFQUFFO2lCQUMzQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxDQUFDO2lCQUM3QyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNWLDBGQUEwRjtnQkFDMUYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsRUFBRSxFQUFFLElBQUEsZUFBTyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRixDQUFDLENBQUM7aUJBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2lCQUN6QyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNWLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCwwQkFBMEI7UUFFbkIsK0JBQStCLENBQUMsZUFBdUIsRUFBRSxRQUF3QztZQUN2RyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUM1QyxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsZUFBdUI7WUFDdkQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3pFLE9BQU8sUUFBUSxFQUFFLGlCQUFpQixFQUFFLENBQUMsZUFBZSxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELDJCQUEyQjtRQUVuQixLQUFLLENBQUMsdUJBQXVCLENBQUMsZUFBdUI7WUFDNUQsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hELElBQUksa0JBQWtCLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzlCLE1BQU0sSUFBSSwyQ0FBNEIsQ0FBQyx3Q0FBd0MsRUFBRSwwREFBZ0MsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2FBQ3BJO1lBQ0QsTUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUV0RSxNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM5QyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyw0QkFBNEIsZUFBZSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFbEYsT0FBTyxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1FBQ3hFLENBQUM7UUFFTSxLQUFLLENBQUMsaUJBQWlCLENBQUMsb0JBQTRCLEVBQUUsY0FBc0I7WUFDbEYsTUFBTSxFQUFFLEdBQUcscUJBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkMsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMscUJBQXFCLElBQUEsa0RBQXdCLEVBQUMsb0JBQW9CLENBQUMsSUFBSSxjQUFjLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7WUFDbkksTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUM1RSxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQy9FLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBVyxFQUFFLE1BQVcsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3pHLE1BQU0sY0FBYyxHQUFHLENBQUMsR0FBWSxFQUFFLEVBQUU7Z0JBQ3ZDLElBQUksR0FBRyxZQUFZLDJDQUE0QixFQUFFO29CQUNoRCxPQUFPO3dCQUNOLElBQUksRUFBRSxPQUFnQjt3QkFDdEIsS0FBSyxFQUFFOzRCQUNOLElBQUksRUFBRSxHQUFHLENBQUMsS0FBSzs0QkFDZixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVE7NEJBQ3JCLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTzt5QkFDbkI7cUJBQ0QsQ0FBQztpQkFDRjtnQkFDRCxNQUFNLEdBQUcsQ0FBQztZQUNYLENBQUMsQ0FBQztZQUVGLE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxlQUF1QixFQUFFLEVBQUU7Z0JBQ3JELE9BQU8sQ0FBQywyQkFBMkIsZUFBZSxLQUFLLENBQUMsQ0FBQztnQkFDekQsTUFBTSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDMUYsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDZCxRQUFRLENBQUMsbUJBQW1CLGVBQWUsRUFBRSxDQUFDLENBQUM7b0JBQy9DLE1BQU0sSUFBSSwyQ0FBNEIsQ0FBQyw0Q0FBNEMsZUFBZSxHQUFHLEVBQUUsMERBQWdDLENBQUMsZUFBZSxDQUFDLENBQUM7aUJBQ3pKO2dCQUNELE9BQU8sRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxDQUFDO1lBQ3ZELENBQUMsQ0FBQztZQUVGLE1BQU0sS0FBSyxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM3RCxPQUFPLENBQUMsK0JBQStCLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRTdELElBQUksU0FBUyxDQUFDO1lBQ2QsSUFBSTtnQkFDSCxTQUFTLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQVEsRUFBRSxFQUFFO29CQUM5RSxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksMkNBQTRCLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLDBEQUFnQyxDQUFDLGdCQUFnQixFQUFFO3dCQUFFLE1BQU0sQ0FBQyxDQUFDO3FCQUFFO29CQUMvSCxVQUFVLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO29CQUNoRSxPQUFPLENBQUMsTUFBTSxXQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDLENBQUMsQ0FBQzthQUNIO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1gsT0FBTyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDekI7WUFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLHFCQUFhLEVBQUUsQ0FBQztZQUMzQyxjQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUUvRCxJQUFJLE1BQThCLENBQUM7WUFDbkMsSUFBSSxVQUF5QyxDQUFDO1lBQzlDLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLENBQUMsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3RGLElBQUk7b0JBQ0gsSUFBSSxDQUFDLEtBQUssU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQy9CLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO3dCQUN2QyxXQUFXLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO3dCQUN6RSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO3dCQUNqRixXQUFXLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO3dCQUMxRSxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQzt3QkFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FDL0QsUUFBUSxFQUNSLHVDQUErQixDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FDdkYsQ0FBQyxDQUFDO3FCQUNIO3lCQUFNO3dCQUNOLE9BQU8sQ0FBQyxvQ0FBb0MsZUFBZSxFQUFFLENBQUMsQ0FBQzt3QkFDL0QsV0FBVyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsZUFBZSxFQUFFLENBQUMsQ0FBQzt3QkFDMUUsVUFBVSxHQUFHLE1BQU0sUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsZUFBZSxFQUFFLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7d0JBQ2pHLElBQUksQ0FBQyxVQUFVLEVBQUU7NEJBQ2hCLE1BQU0sSUFBSSwyQ0FBNEIsQ0FBQyxxQ0FBcUMsZUFBZSxFQUFFLEVBQUUsMERBQWdDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxzQ0FBc0M7eUJBQ3hMO3dCQUNELFdBQVcsQ0FBQyxJQUFJLENBQUMsdUNBQXVDLGVBQWUsRUFBRSxDQUFDLENBQUM7cUJBQzNFO2lCQUNEO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLFdBQVcsQ0FBQyxJQUFJLENBQUMseUNBQXlDLGVBQWUsRUFBRSxDQUFDLENBQUM7b0JBQzdFLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDakMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN6QixPQUFPLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekI7YUFDRDtZQUVELGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUV6QixNQUFNLGlCQUFpQixHQUFzQjtnQkFDNUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLGtCQUFrQjtnQkFDN0MsUUFBUSxFQUFFLE1BQU0sQ0FBQyxjQUFjO2FBQy9CLENBQUM7WUFFRiwwREFBMEQ7WUFDMUQsTUFBTSxPQUFPLEdBQW9CO2dCQUNoQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCO2dCQUN6QyxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVM7Z0JBQzNCLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLDhDQUE4QyxDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLDhDQUE4QyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTO2FBQ3pPLENBQUM7WUFFRiwrSEFBK0g7WUFDL0gsT0FBTyxDQUFDLFlBQVksdUNBQStCLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVsSixJQUFJLFNBQTRCLENBQUM7WUFDakMsSUFBSSx1Q0FBK0IsQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdkUseUZBQXlGO2dCQUN6RixtRkFBbUY7Z0JBQ25GLE1BQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQztnQkFFdkMsMkZBQTJGO2dCQUMzRixJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRS9FLFNBQVMsR0FBRztvQkFDWCxTQUFTLEVBQUUsb0JBQW9CO29CQUMvQixTQUFTLEVBQUUsSUFBSSxpREFBdUIsQ0FBQyxlQUFlLENBQUM7b0JBQ3ZELGVBQWUsRUFBRSxNQUFNLENBQUMsZUFBZTtpQkFDdkMsQ0FBQzthQUNGO2lCQUFNO2dCQUNOLFNBQVMsR0FBRztvQkFDWCxTQUFTLEVBQUUsb0JBQW9CO29CQUMvQixTQUFTLEVBQUUsSUFBSSxtREFBeUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ2xFLGVBQWUsRUFBRSxNQUFNLENBQUMsZUFBZTtpQkFDdkMsQ0FBQzthQUNGO1lBRUQsT0FBTztnQkFDTixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUU7b0JBQ04sU0FBUyxFQUFFLFNBQW1DO29CQUM5QyxPQUFPO29CQUNQLGlCQUFpQjtpQkFDakI7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVNLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxlQUF1QixFQUFFLGFBQTRCO1lBQ2xGLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLDJDQUEyQyxJQUFBLGtEQUF3QixFQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUvRyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCwrREFBK0Q7Z0JBQy9ELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXRDLElBQUksT0FBTyxRQUFRLENBQUMsZUFBZSxLQUFLLFdBQVcsRUFBRTtnQkFDcEQsd0NBQXdDO2dCQUN4QyxPQUFPLEdBQUcsQ0FBQzthQUNYO1lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGlCQUFTLEVBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLGVBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sR0FBRyxDQUFDO2FBQ1g7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxlQUEyQztZQUNyRSxlQUFlLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQU8sU0FBVSxDQUFDLGlCQUFpQixHQUFHLFNBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUUzSCxNQUFNLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDckosSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVuQyxJQUFJLGVBQUksRUFBRTtnQkFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQywyQ0FBMkMsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNqRztZQUVELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVNLGdCQUFnQixDQUFDLGVBQXVCLEVBQUUsY0FBOEI7WUFDOUUsSUFBSSxjQUFjLHFDQUE2QixFQUFFO2dCQUNoRCxPQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLEVBQUU7cUJBQzVDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUMzRDtZQUVELE9BQU8sQ0FDTixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFO2lCQUMvQixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQzFELENBQUM7UUFDSCxDQUFDO1FBRU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFnQyxFQUFFLE1BQWlDO1lBQ3pGLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUMzRCw4QkFBOEI7Z0JBQzlCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzlDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxlQUEyQztZQUN4RSxlQUFlLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQU8sU0FBVSxDQUFDLGlCQUFpQixHQUFHLFNBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUUzSCx5RUFBeUU7WUFDekUsTUFBTSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ3JKLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDM0QsZUFBZSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRW5DLElBQUksZUFBSSxFQUFFO2dCQUNULElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbkcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsdUNBQXVDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzlGO1lBRUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTSxLQUFLLENBQUMsYUFBYSxDQUFDLENBQVM7WUFDbkMsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO1FBRU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFXO1lBQ2hDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUNyQixDQUFDO1FBRU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFZO1lBQ25DLE1BQU0sSUFBSSxHQUFHLGlCQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDbEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDMUI7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsMkJBQTJCLENBQUMsY0FBcUM7WUFDN0UsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGNBQWMsQ0FBQztZQUM1QyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUMsQ0FBQztLQU1ELENBQUE7SUFyOUJxQiwwRUFBK0I7OENBQS9CLCtCQUErQjtRQTZDbEQsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLGtCQUFVLENBQUE7UUFDVixXQUFBLHNDQUFrQixDQUFBO1FBQ2xCLFdBQUEsb0NBQWlCLENBQUE7UUFDakIsV0FBQSw0Q0FBcUIsQ0FBQTtRQUNyQixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLGdEQUF1QixDQUFBO1FBQ3ZCLFdBQUEsNENBQXNCLENBQUE7UUFDdEIsV0FBQSw0Q0FBcUIsQ0FBQTtRQUNyQixXQUFBLGdEQUF1QixDQUFBO1FBQ3ZCLFlBQUEsd0RBQTJCLENBQUE7UUFDM0IsWUFBQSw4Q0FBc0IsQ0FBQTtPQXhESCwrQkFBK0IsQ0FxOUJwRDtJQUVELFNBQVMsb0JBQW9CLENBQUMsc0JBQW9ELEVBQUUsaUJBQStDLEVBQUUsYUFBMkMsRUFBRSxlQUEyQztRQUM1TixzQkFBc0IsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNoRixNQUFNLGNBQWMsR0FBRyxJQUFJLDJEQUE0QixDQUFDLHNCQUFzQixFQUFFLGlCQUFpQixDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQztRQUNqSSxjQUFjLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWhGLE1BQU0sZUFBZSxHQUFHLElBQUksbUNBQXNCLENBQUMsYUFBYSxDQUFDLDJCQUEyQixFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDdkksS0FBSyxNQUFNLFdBQVcsSUFBSSxlQUFlLENBQUMsVUFBVSxFQUFFO1lBQ3JELGVBQWUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDcEM7UUFDRCxLQUFLLE1BQU0sV0FBVyxJQUFJLGVBQWUsQ0FBQyxPQUFPLEVBQUU7WUFDbEQsZUFBZSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNqQztRQUNELE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUV2RSxPQUFPLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFhRCxTQUFTLDJCQUEyQixDQUFDLG9CQUEyQyxFQUFFLE1BQWlDO1FBQ2xILE1BQU0sS0FBSyxHQUFHO1lBQ2IsRUFBRSxFQUFFLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxLQUFLO1lBQ3pDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxJQUFJO1lBQy9CLGdCQUFnQixFQUFFLG9CQUFvQixDQUFDLE9BQU87WUFDOUMsb0JBQW9CLEVBQUUsb0JBQW9CLENBQUMsU0FBUztZQUNwRCxnQkFBZ0IsRUFBRSxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ2hILFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxTQUFTO1lBQ3pDLE1BQU0sRUFBRSxNQUFNLENBQUMsZUFBZTtZQUM5QixRQUFRLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLO1NBQ2xDLENBQUM7UUFFRixPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCxTQUFTLFdBQVcsQ0FBQyxRQUFzQztRQUMxRCxPQUFPLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFWSxRQUFBLHdCQUF3QixHQUFHLElBQUEsK0JBQWUsRUFBMkIsMEJBQTBCLENBQUMsQ0FBQztJQW1COUcsTUFBYSxTQUFTO1FBRXJCLGlCQUFpQixDQUEyQjtRQUM1QyxrQkFBa0IsQ0FBc0I7UUFDeEMsV0FBVyxDQUFzQjtRQVNqQyxZQUFZLGdCQUEwQyxFQUFFLGlCQUFzQyxFQUFFLFdBQWtDLEVBQUUsSUFBbUIsRUFBRSw0QkFBcUM7WUFDN0wsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1lBQzFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQztZQUM1QyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUM7WUFDMUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUN2QyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztZQUNsRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSwwQkFBYyxFQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7WUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLDRCQUE0QixHQUFHLDRCQUE0QixDQUFDO1FBQ2xFLENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCw2QkFBNkI7WUFDN0IsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsSUFBSSxPQUFPO1lBQ1YsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLDRCQUE0QixFQUFFO2dCQUN6RSxPQUFPLFNBQVUsQ0FBQyxDQUFDLG1DQUFtQzthQUN0RDtZQUNELE9BQVUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsS0FBSyxDQUFDLFFBQVE7WUFDYixJQUFJLElBQUksQ0FBQyw0QkFBNEIsRUFBRTtnQkFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUMsNkJBQTZCO2FBQ25GO1lBQ0QsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN4SixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckIsQ0FBQztLQUNEO0lBNUNELDhCQTRDQztJQUVELFNBQVMsZ0JBQWdCLENBQUMsY0FBNEMsRUFBRSxpQkFBeUM7UUFDaEgsT0FBTyxjQUFjLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxNQUFNLENBQ3pELFNBQVMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FDeEQsQ0FBQztJQUNILENBQUM7SUFFRCxNQUFhLGNBQWM7UUFFMUIsWUFDUyxXQUEwRDtZQUExRCxnQkFBVyxHQUFYLFdBQVcsQ0FBK0M7UUFDL0QsQ0FBQztRQUVMLGFBQWEsQ0FBQyxVQUF5RDtZQUN0RSxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUMvQixDQUFDO1FBRUQsVUFBVSxDQUFDLEdBQVE7WUFDbEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRUQsT0FBTyxDQUFDLFFBQTJEO1lBQ2xFLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0MsQ0FBQztLQUNEO0lBakJELHdDQWlCQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSw0QkFBNEI7UUFJakMsWUFBWSxnQkFBcUQ7WUFGaEQsU0FBSSxHQUFHLElBQUksbUNBQXNCLEVBQVksQ0FBQztZQUc5RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRU0sb0JBQW9CLENBQUMsb0JBQTREO1lBQ3ZGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVNLG1CQUFtQixDQUFDLGdCQUFxRDtZQUMvRSxLQUFLLE1BQU0sV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDMUQ7UUFDRixDQUFDO0tBQ0QifQ==