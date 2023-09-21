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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/stopwatch", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/extensionManagement/common/implicitActivationEvents", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteExtensionsScanner", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensionDescriptionRegistry", "vs/workbench/services/extensions/common/extensionDevOptions", "vs/workbench/services/extensions/common/extensionHostKind", "vs/workbench/services/extensions/common/extensionHostManager", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensionRunningLocation", "vs/workbench/services/extensions/common/extensionRunningLocationTracker", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/extensions/common/workspaceContains", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, async_1, errorMessage_1, event_1, lifecycle_1, network_1, perf, platform_1, resources_1, stopwatch_1, nls, configuration_1, dialogs_1, implicitActivationEvents_1, extensions_1, files_1, instantiation_1, lifecycle_2, log_1, notification_1, productService_1, remoteAuthorityResolver_1, remoteExtensionsScanner_1, telemetry_1, workspace_1, environmentService_1, extensionManagement_1, extensionDescriptionRegistry_1, extensionDevOptions_1, extensionHostKind_1, extensionHostManager_1, extensionManifestPropertiesService_1, extensionRunningLocation_1, extensionRunningLocationTracker_1, extensions_2, extensionsRegistry_1, workspaceContains_1, lifecycle_3, remoteAgentService_1) {
    "use strict";
    var AbstractExtensionService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostCrashTracker = exports.ExtensionStatus = exports.extensionIsEnabled = exports.filterEnabledExtensions = exports.checkEnabledAndProposedAPI = exports.ResolvedExtensions = exports.AbstractExtensionService = void 0;
    const hasOwnProperty = Object.hasOwnProperty;
    const NO_OP_VOID_PROMISE = Promise.resolve(undefined);
    let AbstractExtensionService = AbstractExtensionService_1 = class AbstractExtensionService extends lifecycle_1.Disposable {
        constructor(_extensionsProposedApi, _extensionHostFactory, _extensionHostKindPicker, _instantiationService, _notificationService, _environmentService, _telemetryService, _extensionEnablementService, _fileService, _productService, _extensionManagementService, _contextService, _configurationService, _extensionManifestPropertiesService, _logService, _remoteAgentService, _remoteExtensionsScannerService, _lifecycleService, _remoteAuthorityResolverService, _dialogService) {
            super();
            this._extensionsProposedApi = _extensionsProposedApi;
            this._extensionHostFactory = _extensionHostFactory;
            this._extensionHostKindPicker = _extensionHostKindPicker;
            this._instantiationService = _instantiationService;
            this._notificationService = _notificationService;
            this._environmentService = _environmentService;
            this._telemetryService = _telemetryService;
            this._extensionEnablementService = _extensionEnablementService;
            this._fileService = _fileService;
            this._productService = _productService;
            this._extensionManagementService = _extensionManagementService;
            this._contextService = _contextService;
            this._configurationService = _configurationService;
            this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
            this._logService = _logService;
            this._remoteAgentService = _remoteAgentService;
            this._remoteExtensionsScannerService = _remoteExtensionsScannerService;
            this._lifecycleService = _lifecycleService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._dialogService = _dialogService;
            this._onDidRegisterExtensions = this._register(new event_1.Emitter());
            this.onDidRegisterExtensions = this._onDidRegisterExtensions.event;
            this._onDidChangeExtensionsStatus = this._register(new event_1.Emitter());
            this.onDidChangeExtensionsStatus = this._onDidChangeExtensionsStatus.event;
            this._onDidChangeExtensions = this._register(new event_1.Emitter({ leakWarningThreshold: 400 }));
            this.onDidChangeExtensions = this._onDidChangeExtensions.event;
            this._onWillActivateByEvent = this._register(new event_1.Emitter());
            this.onWillActivateByEvent = this._onWillActivateByEvent.event;
            this._onDidChangeResponsiveChange = this._register(new event_1.Emitter());
            this.onDidChangeResponsiveChange = this._onDidChangeResponsiveChange.event;
            this._onWillStop = this._register(new event_1.Emitter());
            this.onWillStop = this._onWillStop.event;
            this._activationEventReader = new ImplicitActivationAwareReader();
            this._registry = new extensionDescriptionRegistry_1.LockableExtensionDescriptionRegistry(this._activationEventReader);
            this._installedExtensionsReady = new async_1.Barrier();
            this._extensionStatus = new extensions_1.ExtensionIdentifierMap();
            this._allRequestedActivateEvents = new Set();
            this._remoteCrashTracker = new ExtensionHostCrashTracker();
            this._deltaExtensionsQueue = [];
            this._inHandleDeltaExtensions = false;
            this._extensionHostManagers = [];
            this._resolveAuthorityAttempt = 0;
            // help the file service to activate providers by activating extensions by file system event
            this._register(this._fileService.onWillActivateFileSystemProvider(e => {
                if (e.scheme !== network_1.Schemas.vscodeRemote) {
                    e.join(this.activateByEvent(`onFileSystem:${e.scheme}`));
                }
            }));
            this._runningLocations = new extensionRunningLocationTracker_1.ExtensionRunningLocationTracker(this._registry, this._extensionHostKindPicker, this._environmentService, this._configurationService, this._logService, this._extensionManifestPropertiesService);
            this._register(this._extensionEnablementService.onEnablementChanged((extensions) => {
                const toAdd = [];
                const toRemove = [];
                for (const extension of extensions) {
                    if (this._safeInvokeIsEnabled(extension)) {
                        // an extension has been enabled
                        toAdd.push(extension);
                    }
                    else {
                        // an extension has been disabled
                        toRemove.push(extension);
                    }
                }
                if (platform_1.isCI) {
                    this._logService.info(`AbstractExtensionService.onEnablementChanged fired for ${extensions.map(e => e.identifier.id).join(', ')}`);
                }
                this._handleDeltaExtensions(new DeltaExtensionsQueueItem(toAdd, toRemove));
            }));
            this._register(this._extensionManagementService.onDidChangeProfile(({ added, removed }) => {
                if (added.length || removed.length) {
                    if (platform_1.isCI) {
                        this._logService.info(`AbstractExtensionService.onDidChangeProfile fired`);
                    }
                    this._handleDeltaExtensions(new DeltaExtensionsQueueItem(added, removed));
                }
            }));
            this._register(this._extensionManagementService.onDidInstallExtensions((result) => {
                const extensions = [];
                for (const { local, operation } of result) {
                    if (local && operation !== 4 /* InstallOperation.Migrate */ && this._safeInvokeIsEnabled(local)) {
                        extensions.push(local);
                    }
                }
                if (extensions.length) {
                    if (platform_1.isCI) {
                        this._logService.info(`AbstractExtensionService.onDidInstallExtensions fired for ${extensions.map(e => e.identifier.id).join(', ')}`);
                    }
                    this._handleDeltaExtensions(new DeltaExtensionsQueueItem(extensions, []));
                }
            }));
            this._register(this._extensionManagementService.onDidUninstallExtension((event) => {
                if (!event.error) {
                    // an extension has been uninstalled
                    if (platform_1.isCI) {
                        this._logService.info(`AbstractExtensionService.onDidUninstallExtension fired for ${event.identifier.id}`);
                    }
                    this._handleDeltaExtensions(new DeltaExtensionsQueueItem([], [event.identifier.id]));
                }
            }));
            this._register(this._lifecycleService.onDidShutdown(() => {
                // We need to disconnect the management connection before killing the local extension host.
                // Otherwise, the local extension host might terminate the underlying tunnel before the
                // management connection has a chance to send its disconnection message.
                const connection = this._remoteAgentService.getConnection();
                connection?.dispose();
                this._doStopExtensionHosts();
            }));
        }
        _getExtensionHostManagers(kind) {
            return this._extensionHostManagers.filter(extHostManager => extHostManager.kind === kind);
        }
        _getExtensionHostManagerByRunningLocation(runningLocation) {
            for (const extensionHostManager of this._extensionHostManagers) {
                if (extensionHostManager.representsRunningLocation(runningLocation)) {
                    return extensionHostManager;
                }
            }
            return null;
        }
        //#region deltaExtensions
        async _handleDeltaExtensions(item) {
            this._deltaExtensionsQueue.push(item);
            if (this._inHandleDeltaExtensions) {
                // Let the current item finish, the new one will be picked up
                return;
            }
            let lock = null;
            try {
                this._inHandleDeltaExtensions = true;
                // wait for _initialize to finish before hanlding any delta extension events
                await this._installedExtensionsReady.wait();
                lock = await this._registry.acquireLock('handleDeltaExtensions');
                while (this._deltaExtensionsQueue.length > 0) {
                    const item = this._deltaExtensionsQueue.shift();
                    await this._deltaExtensions(lock, item.toAdd, item.toRemove);
                }
            }
            finally {
                this._inHandleDeltaExtensions = false;
                lock?.dispose();
            }
        }
        async _deltaExtensions(lock, _toAdd, _toRemove) {
            if (platform_1.isCI) {
                this._logService.info(`AbstractExtensionService._deltaExtensions: toAdd: [${_toAdd.map(e => e.identifier.id).join(',')}] toRemove: [${_toRemove.map(e => typeof e === 'string' ? e : e.identifier.id).join(',')}]`);
            }
            let toRemove = [];
            for (let i = 0, len = _toRemove.length; i < len; i++) {
                const extensionOrId = _toRemove[i];
                const extensionId = (typeof extensionOrId === 'string' ? extensionOrId : extensionOrId.identifier.id);
                const extension = (typeof extensionOrId === 'string' ? null : extensionOrId);
                const extensionDescription = this._registry.getExtensionDescription(extensionId);
                if (!extensionDescription) {
                    // ignore disabling/uninstalling an extension which is not running
                    continue;
                }
                if (extension && extensionDescription.extensionLocation.scheme !== extension.location.scheme) {
                    // this event is for a different extension than mine (maybe for the local extension, while I have the remote extension)
                    continue;
                }
                if (!this.canRemoveExtension(extensionDescription)) {
                    // uses non-dynamic extension point or is activated
                    continue;
                }
                toRemove.push(extensionDescription);
            }
            const toAdd = [];
            for (let i = 0, len = _toAdd.length; i < len; i++) {
                const extension = _toAdd[i];
                const extensionDescription = await this._scanSingleExtension(extension);
                if (!extensionDescription) {
                    // could not scan extension...
                    continue;
                }
                if (!this._canAddExtension(extensionDescription, toRemove)) {
                    continue;
                }
                toAdd.push(extensionDescription);
            }
            if (toAdd.length === 0 && toRemove.length === 0) {
                return;
            }
            // Update the local registry
            const result = this._registry.deltaExtensions(lock, toAdd, toRemove.map(e => e.identifier));
            this._onDidChangeExtensions.fire({ added: toAdd, removed: toRemove });
            toRemove = toRemove.concat(result.removedDueToLooping);
            if (result.removedDueToLooping.length > 0) {
                this._notificationService.notify({
                    severity: notification_1.Severity.Error,
                    message: nls.localize('looping', "The following extensions contain dependency loops and have been disabled: {0}", result.removedDueToLooping.map(e => `'${e.identifier.value}'`).join(', '))
                });
            }
            // enable or disable proposed API per extension
            this._extensionsProposedApi.updateEnabledApiProposals(toAdd);
            // Update extension points
            this._doHandleExtensionPoints([].concat(toAdd).concat(toRemove));
            // Update the extension host
            await this._updateExtensionsOnExtHosts(result.versionId, toAdd, toRemove.map(e => e.identifier));
            for (let i = 0; i < toAdd.length; i++) {
                this._activateAddedExtensionIfNeeded(toAdd[i]);
            }
        }
        async _updateExtensionsOnExtHosts(versionId, toAdd, toRemove) {
            const removedRunningLocation = this._runningLocations.deltaExtensions(toAdd, toRemove);
            const promises = this._extensionHostManagers.map(extHostManager => this._updateExtensionsOnExtHost(extHostManager, versionId, toAdd, toRemove, removedRunningLocation));
            await Promise.all(promises);
        }
        async _updateExtensionsOnExtHost(extensionHostManager, versionId, toAdd, toRemove, removedRunningLocation) {
            const myToAdd = this._runningLocations.filterByExtensionHostManager(toAdd, extensionHostManager);
            const myToRemove = (0, extensionRunningLocationTracker_1.filterExtensionIdentifiers)(toRemove, removedRunningLocation, extRunningLocation => extensionHostManager.representsRunningLocation(extRunningLocation));
            const addActivationEvents = implicitActivationEvents_1.ImplicitActivationEvents.createActivationEventsMap(toAdd);
            if (platform_1.isCI) {
                const printExtIds = (extensions) => extensions.map(e => e.identifier.value).join(',');
                const printIds = (extensions) => extensions.map(e => e.value).join(',');
                this._logService.info(`AbstractExtensionService: Calling deltaExtensions: toRemove: [${printIds(toRemove)}], toAdd: [${printExtIds(toAdd)}], myToRemove: [${printIds(myToRemove)}], myToAdd: [${printExtIds(myToAdd)}],`);
            }
            await extensionHostManager.deltaExtensions({ versionId, toRemove, toAdd, addActivationEvents, myToRemove, myToAdd: myToAdd.map(extension => extension.identifier) });
        }
        canAddExtension(extension) {
            return this._canAddExtension(extension, []);
        }
        _canAddExtension(extension, extensionsBeingRemoved) {
            // (Also check for renamed extensions)
            const existing = this._registry.getExtensionDescriptionByIdOrUUID(extension.identifier, extension.id);
            if (existing) {
                // This extension is already known (most likely at a different version)
                // so it cannot be added again unless it is removed first
                const isBeingRemoved = extensionsBeingRemoved.some((extensionDescription) => extensions_1.ExtensionIdentifier.equals(extension.identifier, extensionDescription.identifier));
                if (!isBeingRemoved) {
                    return false;
                }
            }
            const extensionKinds = this._runningLocations.readExtensionKinds(extension);
            const isRemote = extension.extensionLocation.scheme === network_1.Schemas.vscodeRemote;
            const extensionHostKind = this._extensionHostKindPicker.pickExtensionHostKind(extension.identifier, extensionKinds, !isRemote, isRemote, 0 /* ExtensionRunningPreference.None */);
            if (extensionHostKind === null) {
                return false;
            }
            return true;
        }
        canRemoveExtension(extension) {
            const extensionDescription = this._registry.getExtensionDescription(extension.identifier);
            if (!extensionDescription) {
                // Can't remove an extension that is unknown!
                return false;
            }
            if (this._extensionStatus.get(extensionDescription.identifier)?.activationStarted) {
                // Extension is running, cannot remove it safely
                return false;
            }
            return true;
        }
        async _activateAddedExtensionIfNeeded(extensionDescription) {
            let shouldActivate = false;
            let shouldActivateReason = null;
            let hasWorkspaceContains = false;
            const activationEvents = this._activationEventReader.readActivationEvents(extensionDescription);
            for (let activationEvent of activationEvents) {
                // TODO@joao: there's no easy way to contribute this
                if (activationEvent === 'onUri') {
                    activationEvent = `onUri:${extensions_1.ExtensionIdentifier.toKey(extensionDescription.identifier)}`;
                }
                if (this._allRequestedActivateEvents.has(activationEvent)) {
                    // This activation event was fired before the extension was added
                    shouldActivate = true;
                    shouldActivateReason = activationEvent;
                    break;
                }
                if (activationEvent === '*') {
                    shouldActivate = true;
                    shouldActivateReason = activationEvent;
                    break;
                }
                if (/^workspaceContains/.test(activationEvent)) {
                    hasWorkspaceContains = true;
                }
                if (activationEvent === 'onStartupFinished') {
                    shouldActivate = true;
                    shouldActivateReason = activationEvent;
                    break;
                }
            }
            if (shouldActivate) {
                await Promise.all(this._extensionHostManagers.map(extHostManager => extHostManager.activate(extensionDescription.identifier, { startup: false, extensionId: extensionDescription.identifier, activationEvent: shouldActivateReason }))).then(() => { });
            }
            else if (hasWorkspaceContains) {
                const workspace = await this._contextService.getCompleteWorkspace();
                const forceUsingSearch = !!this._environmentService.remoteAuthority;
                const host = {
                    logService: this._logService,
                    folders: workspace.folders.map(folder => folder.uri),
                    forceUsingSearch: forceUsingSearch,
                    exists: (uri) => this._fileService.exists(uri),
                    checkExists: (folders, includes, token) => this._instantiationService.invokeFunction((accessor) => (0, workspaceContains_1.checkGlobFileExists)(accessor, folders, includes, token))
                };
                const result = await (0, workspaceContains_1.checkActivateWorkspaceContainsExtension)(host, extensionDescription);
                if (!result) {
                    return;
                }
                await Promise.all(this._extensionHostManagers.map(extHostManager => extHostManager.activate(extensionDescription.identifier, { startup: false, extensionId: extensionDescription.identifier, activationEvent: result.activationEvent }))).then(() => { });
            }
        }
        //#endregion
        async _initialize() {
            perf.mark('code/willLoadExtensions');
            this._startExtensionHostsIfNecessary(true, []);
            const lock = await this._registry.acquireLock('_initialize');
            try {
                const resolvedExtensions = await this._resolveExtensions();
                this._processExtensions(lock, resolvedExtensions);
                // Start extension hosts which are not automatically started
                const snapshot = this._registry.getSnapshot();
                for (const extHostManager of this._extensionHostManagers) {
                    if (extHostManager.startup !== 1 /* ExtensionHostStartup.EagerAutoStart */) {
                        const extensions = this._runningLocations.filterByExtensionHostManager(snapshot.extensions, extHostManager);
                        extHostManager.start(snapshot.versionId, snapshot.extensions, extensions.map(extension => extension.identifier));
                    }
                }
            }
            finally {
                lock.dispose();
            }
            this._releaseBarrier();
            perf.mark('code/didLoadExtensions');
            await this._handleExtensionTests();
        }
        _processExtensions(lock, resolvedExtensions) {
            const { allowRemoteExtensionsInLocalWebWorker, hasLocalProcess } = resolvedExtensions;
            const localExtensions = checkEnabledAndProposedAPI(this._logService, this._extensionEnablementService, this._extensionsProposedApi, resolvedExtensions.local, false);
            let remoteExtensions = checkEnabledAndProposedAPI(this._logService, this._extensionEnablementService, this._extensionsProposedApi, resolvedExtensions.remote, false);
            // `initializeRunningLocation` will look at the complete picture (e.g. an extension installed on both sides),
            // takes care of duplicates and picks a running location for each extension
            this._runningLocations.initializeRunningLocation(localExtensions, remoteExtensions);
            this._startExtensionHostsIfNecessary(true, []);
            // Some remote extensions could run locally in the web worker, so store them
            const remoteExtensionsThatNeedToRunLocally = (allowRemoteExtensionsInLocalWebWorker ? this._runningLocations.filterByExtensionHostKind(remoteExtensions, 2 /* ExtensionHostKind.LocalWebWorker */) : []);
            const localProcessExtensions = (hasLocalProcess ? this._runningLocations.filterByExtensionHostKind(localExtensions, 1 /* ExtensionHostKind.LocalProcess */) : []);
            const localWebWorkerExtensions = this._runningLocations.filterByExtensionHostKind(localExtensions, 2 /* ExtensionHostKind.LocalWebWorker */);
            remoteExtensions = this._runningLocations.filterByExtensionHostKind(remoteExtensions, 3 /* ExtensionHostKind.Remote */);
            // Add locally the remote extensions that need to run locally in the web worker
            for (const ext of remoteExtensionsThatNeedToRunLocally) {
                if (!includes(localWebWorkerExtensions, ext.identifier)) {
                    localWebWorkerExtensions.push(ext);
                }
            }
            const allExtensions = remoteExtensions.concat(localProcessExtensions).concat(localWebWorkerExtensions);
            const result = this._registry.deltaExtensions(lock, allExtensions, []);
            if (result.removedDueToLooping.length > 0) {
                this._notificationService.notify({
                    severity: notification_1.Severity.Error,
                    message: nls.localize('looping', "The following extensions contain dependency loops and have been disabled: {0}", result.removedDueToLooping.map(e => `'${e.identifier.value}'`).join(', '))
                });
            }
            this._doHandleExtensionPoints(this._registry.getAllExtensionDescriptions());
        }
        async _handleExtensionTests() {
            if (!this._environmentService.isExtensionDevelopment || !this._environmentService.extensionTestsLocationURI) {
                return;
            }
            const extensionHostManager = this.findTestExtensionHost(this._environmentService.extensionTestsLocationURI);
            if (!extensionHostManager) {
                const msg = nls.localize('extensionTestError', "No extension host found that can launch the test runner at {0}.", this._environmentService.extensionTestsLocationURI.toString());
                console.error(msg);
                this._notificationService.error(msg);
                return;
            }
            let exitCode;
            try {
                exitCode = await extensionHostManager.extensionTestsExecute();
                if (platform_1.isCI) {
                    this._logService.info(`Extension host test runner exit code: ${exitCode}`);
                }
            }
            catch (err) {
                if (platform_1.isCI) {
                    this._logService.error(`Extension host test runner error`, err);
                }
                console.error(err);
                exitCode = 1 /* ERROR */;
            }
            this._onExtensionHostExit(exitCode);
        }
        findTestExtensionHost(testLocation) {
            let runningLocation = null;
            for (const extension of this._registry.getAllExtensionDescriptions()) {
                if ((0, resources_1.isEqualOrParent)(testLocation, extension.extensionLocation)) {
                    runningLocation = this._runningLocations.getRunningLocation(extension.identifier);
                    break;
                }
            }
            if (runningLocation === null) {
                // not sure if we should support that, but it was possible to have an test outside an extension
                if (testLocation.scheme === network_1.Schemas.vscodeRemote) {
                    runningLocation = new extensionRunningLocation_1.RemoteRunningLocation();
                }
                else {
                    // When a debugger attaches to the extension host, it will surface all console.log messages from the extension host,
                    // but not necessarily from the window. So it would be best if any errors get printed to the console of the extension host.
                    // That is why here we use the local process extension host even for non-file URIs
                    runningLocation = new extensionRunningLocation_1.LocalProcessRunningLocation(0);
                }
            }
            if (runningLocation !== null) {
                return this._getExtensionHostManagerByRunningLocation(runningLocation);
            }
            return null;
        }
        _releaseBarrier() {
            this._installedExtensionsReady.open();
            this._onDidRegisterExtensions.fire(undefined);
            this._onDidChangeExtensionsStatus.fire(this._registry.getAllExtensionDescriptions().map(e => e.identifier));
        }
        //#region remote authority resolving
        async _resolveAuthorityInitial(remoteAuthority) {
            const MAX_ATTEMPTS = 5;
            for (let attempt = 1;; attempt++) {
                try {
                    return this._resolveAuthorityWithLogging(remoteAuthority);
                }
                catch (err) {
                    if (remoteAuthorityResolver_1.RemoteAuthorityResolverError.isNoResolverFound(err)) {
                        // There is no point in retrying if there is no resolver found
                        throw err;
                    }
                    if (remoteAuthorityResolver_1.RemoteAuthorityResolverError.isNotAvailable(err)) {
                        // The resolver is not available and asked us to not retry
                        throw err;
                    }
                    if (attempt >= MAX_ATTEMPTS) {
                        // Too many failed attempts, give up
                        throw err;
                    }
                }
            }
        }
        async _resolveAuthorityAgain() {
            const remoteAuthority = this._environmentService.remoteAuthority;
            if (!remoteAuthority) {
                return;
            }
            this._remoteAuthorityResolverService._clearResolvedAuthority(remoteAuthority);
            try {
                const result = await this._resolveAuthorityWithLogging(remoteAuthority);
                this._remoteAuthorityResolverService._setResolvedAuthority(result.authority, result.options);
            }
            catch (err) {
                this._remoteAuthorityResolverService._setResolvedAuthorityError(remoteAuthority, err);
            }
        }
        async _resolveAuthorityWithLogging(remoteAuthority) {
            const authorityPrefix = (0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthority);
            const sw = stopwatch_1.StopWatch.create(false);
            this._logService.info(`Invoking resolveAuthority(${authorityPrefix})...`);
            try {
                perf.mark(`code/willResolveAuthority/${authorityPrefix}`);
                const result = await this._resolveAuthority(remoteAuthority);
                perf.mark(`code/didResolveAuthorityOK/${authorityPrefix}`);
                this._logService.info(`resolveAuthority(${authorityPrefix}) returned '${result.authority.connectTo}' after ${sw.elapsed()} ms`);
                return result;
            }
            catch (err) {
                perf.mark(`code/didResolveAuthorityError/${authorityPrefix}`);
                this._logService.error(`resolveAuthority(${authorityPrefix}) returned an error after ${sw.elapsed()} ms`, err);
                throw err;
            }
        }
        async _resolveAuthorityOnExtensionHosts(kind, remoteAuthority) {
            const extensionHosts = this._getExtensionHostManagers(kind);
            if (extensionHosts.length === 0) {
                // no local process extension hosts
                throw new Error(`Cannot resolve authority`);
            }
            this._resolveAuthorityAttempt++;
            const results = await Promise.all(extensionHosts.map(extHost => extHost.resolveAuthority(remoteAuthority, this._resolveAuthorityAttempt)));
            let bestErrorResult = null;
            for (const result of results) {
                if (result.type === 'ok') {
                    return result.value;
                }
                if (!bestErrorResult) {
                    bestErrorResult = result;
                    continue;
                }
                const bestErrorIsUnknown = (bestErrorResult.error.code === remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.Unknown);
                const errorIsUnknown = (result.error.code === remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.Unknown);
                if (bestErrorIsUnknown && !errorIsUnknown) {
                    bestErrorResult = result;
                }
            }
            // we can only reach this if there is an error
            throw new remoteAuthorityResolver_1.RemoteAuthorityResolverError(bestErrorResult.error.message, bestErrorResult.error.code, bestErrorResult.error.detail);
        }
        //#endregion
        //#region Stopping / Starting / Restarting
        stopExtensionHosts(reason) {
            return this._doStopExtensionHostsWithVeto(reason);
        }
        _doStopExtensionHosts() {
            const previouslyActivatedExtensionIds = [];
            for (const extensionStatus of this._extensionStatus.values()) {
                if (extensionStatus.activationStarted) {
                    previouslyActivatedExtensionIds.push(extensionStatus.id);
                }
            }
            // See https://github.com/microsoft/vscode/issues/152204
            // Dispose extension hosts in reverse creation order because the local extension host
            // might be critical in sustaining a connection to the remote extension host
            for (let i = this._extensionHostManagers.length - 1; i >= 0; i--) {
                this._extensionHostManagers[i].dispose();
            }
            this._extensionHostManagers = [];
            for (const extensionStatus of this._extensionStatus.values()) {
                extensionStatus.clearRuntimeStatus();
            }
            if (previouslyActivatedExtensionIds.length > 0) {
                this._onDidChangeExtensionsStatus.fire(previouslyActivatedExtensionIds);
            }
        }
        async _doStopExtensionHostsWithVeto(reason) {
            const vetos = [];
            const vetoReasons = new Set();
            this._onWillStop.fire({
                reason,
                veto(value, reason) {
                    vetos.push(value);
                    if (typeof value === 'boolean') {
                        if (value === true) {
                            vetoReasons.add(reason);
                        }
                    }
                    else {
                        value.then(value => {
                            if (value) {
                                vetoReasons.add(reason);
                            }
                        }).catch(error => {
                            vetoReasons.add(nls.localize('extensionStopVetoError', "{0} (Error: {1})", reason, (0, errorMessage_1.toErrorMessage)(error)));
                        });
                    }
                }
            });
            const veto = await (0, lifecycle_2.handleVetos)(vetos, error => this._logService.error(error));
            if (!veto) {
                this._doStopExtensionHosts();
            }
            else {
                const vetoReasonsArray = Array.from(vetoReasons);
                this._logService.warn(`Extension host was not stopped because of veto (stop reason: ${reason}, veto reason: ${vetoReasonsArray.join(', ')})`);
                await this._dialogService.warn(nls.localize('extensionStopVetoMessage', "The following operation was blocked: {0}", reason), vetoReasonsArray.length === 1 ?
                    nls.localize('extensionStopVetoDetailsOne', "The reason for blocking the operation: {0}", vetoReasonsArray[0]) :
                    nls.localize('extensionStopVetoDetailsMany', "The reasons for blocking the operation:\n- {0}", vetoReasonsArray.join('\n -')));
            }
            return !veto;
        }
        _startExtensionHostsIfNecessary(isInitialStart, initialActivationEvents) {
            const locations = [];
            for (let affinity = 0; affinity <= this._runningLocations.maxLocalProcessAffinity; affinity++) {
                locations.push(new extensionRunningLocation_1.LocalProcessRunningLocation(affinity));
            }
            for (let affinity = 0; affinity <= this._runningLocations.maxLocalWebWorkerAffinity; affinity++) {
                locations.push(new extensionRunningLocation_1.LocalWebWorkerRunningLocation(affinity));
            }
            locations.push(new extensionRunningLocation_1.RemoteRunningLocation());
            for (const location of locations) {
                if (this._getExtensionHostManagerByRunningLocation(location)) {
                    // already running
                    continue;
                }
                const extHostManager = this._createExtensionHostManager(location, isInitialStart, initialActivationEvents);
                if (extHostManager) {
                    this._extensionHostManagers.push(extHostManager);
                }
            }
        }
        _createExtensionHostManager(runningLocation, isInitialStart, initialActivationEvents) {
            const extensionHost = this._extensionHostFactory.createExtensionHost(this._runningLocations, runningLocation, isInitialStart);
            if (!extensionHost) {
                return null;
            }
            const processManager = this._doCreateExtensionHostManager(extensionHost, initialActivationEvents);
            processManager.onDidExit(([code, signal]) => this._onExtensionHostCrashOrExit(processManager, code, signal));
            processManager.onDidChangeResponsiveState((responsiveState) => {
                this._onDidChangeResponsiveChange.fire({
                    extensionHostKind: processManager.kind,
                    isResponsive: responsiveState === 0 /* ResponsiveState.Responsive */,
                    getInspectPort: (tryEnableInspector) => {
                        return processManager.getInspectPort(tryEnableInspector);
                    }
                });
            });
            return processManager;
        }
        _doCreateExtensionHostManager(extensionHost, initialActivationEvents) {
            return (0, extensionHostManager_1.createExtensionHostManager)(this._instantiationService, extensionHost, initialActivationEvents, this._acquireInternalAPI(extensionHost));
        }
        _onExtensionHostCrashOrExit(extensionHost, code, signal) {
            // Unexpected termination
            const isExtensionDevHost = (0, extensionDevOptions_1.parseExtensionDevOptions)(this._environmentService).isExtensionDevHost;
            if (!isExtensionDevHost) {
                this._onExtensionHostCrashed(extensionHost, code, signal);
                return;
            }
            this._onExtensionHostExit(code);
        }
        _onExtensionHostCrashed(extensionHost, code, signal) {
            console.error(`Extension host (${(0, extensionHostKind_1.extensionHostKindToString)(extensionHost.kind)}) terminated unexpectedly. Code: ${code}, Signal: ${signal}`);
            if (extensionHost.kind === 1 /* ExtensionHostKind.LocalProcess */) {
                this._doStopExtensionHosts();
            }
            else if (extensionHost.kind === 3 /* ExtensionHostKind.Remote */) {
                if (signal) {
                    this._onRemoteExtensionHostCrashed(extensionHost, signal);
                }
                for (let i = 0; i < this._extensionHostManagers.length; i++) {
                    if (this._extensionHostManagers[i] === extensionHost) {
                        this._extensionHostManagers[i].dispose();
                        this._extensionHostManagers.splice(i, 1);
                        break;
                    }
                }
            }
        }
        _getExtensionHostExitInfoWithTimeout(reconnectionToken) {
            return new Promise((resolve, reject) => {
                const timeoutHandle = setTimeout(() => {
                    reject(new Error('getExtensionHostExitInfo timed out'));
                }, 2000);
                this._remoteAgentService.getExtensionHostExitInfo(reconnectionToken).then((r) => {
                    clearTimeout(timeoutHandle);
                    resolve(r);
                }, reject);
            });
        }
        async _onRemoteExtensionHostCrashed(extensionHost, reconnectionToken) {
            try {
                const info = await this._getExtensionHostExitInfoWithTimeout(reconnectionToken);
                if (info) {
                    this._logService.error(`Extension host (${(0, extensionHostKind_1.extensionHostKindToString)(extensionHost.kind)}) terminated unexpectedly with code ${info.code}.`);
                }
                this._logExtensionHostCrash(extensionHost);
                this._remoteCrashTracker.registerCrash();
                if (this._remoteCrashTracker.shouldAutomaticallyRestart()) {
                    this._logService.info(`Automatically restarting the remote extension host.`);
                    this._notificationService.status(nls.localize('extensionService.autoRestart', "The remote extension host terminated unexpectedly. Restarting..."), { hideAfter: 5000 });
                    this._startExtensionHostsIfNecessary(false, Array.from(this._allRequestedActivateEvents.keys()));
                }
                else {
                    this._notificationService.prompt(notification_1.Severity.Error, nls.localize('extensionService.crash', "Remote Extension host terminated unexpectedly 3 times within the last 5 minutes."), [{
                            label: nls.localize('restart', "Restart Remote Extension Host"),
                            run: () => {
                                this._startExtensionHostsIfNecessary(false, Array.from(this._allRequestedActivateEvents.keys()));
                            }
                        }]);
                }
            }
            catch (err) {
                // maybe this wasn't an extension host crash and it was a permanent disconnection
            }
        }
        _logExtensionHostCrash(extensionHost) {
            const activatedExtensions = [];
            for (const extensionStatus of this._extensionStatus.values()) {
                if (extensionStatus.activationStarted && extensionHost.containsExtension(extensionStatus.id)) {
                    activatedExtensions.push(extensionStatus.id);
                }
            }
            if (activatedExtensions.length > 0) {
                this._logService.error(`Extension host (${(0, extensionHostKind_1.extensionHostKindToString)(extensionHost.kind)}) terminated unexpectedly. The following extensions were running: ${activatedExtensions.map(id => id.value).join(', ')}`);
            }
            else {
                this._logService.error(`Extension host (${(0, extensionHostKind_1.extensionHostKindToString)(extensionHost.kind)}) terminated unexpectedly. No extensions were activated.`);
            }
        }
        async startExtensionHosts() {
            this._doStopExtensionHosts();
            const lock = await this._registry.acquireLock('startExtensionHosts');
            try {
                this._startExtensionHostsIfNecessary(false, Array.from(this._allRequestedActivateEvents.keys()));
                const localProcessExtensionHosts = this._getExtensionHostManagers(1 /* ExtensionHostKind.LocalProcess */);
                await Promise.all(localProcessExtensionHosts.map(extHost => extHost.ready()));
            }
            finally {
                lock.dispose();
            }
        }
        //#endregion
        //#region IExtensionService
        activateByEvent(activationEvent, activationKind = 0 /* ActivationKind.Normal */) {
            if (this._installedExtensionsReady.isOpen()) {
                // Extensions have been scanned and interpreted
                // Record the fact that this activationEvent was requested (in case of a restart)
                this._allRequestedActivateEvents.add(activationEvent);
                if (!this._registry.containsActivationEvent(activationEvent)) {
                    // There is no extension that is interested in this activation event
                    return NO_OP_VOID_PROMISE;
                }
                return this._activateByEvent(activationEvent, activationKind);
            }
            else {
                // Extensions have not been scanned yet.
                // Record the fact that this activationEvent was requested (in case of a restart)
                this._allRequestedActivateEvents.add(activationEvent);
                if (activationKind === 1 /* ActivationKind.Immediate */) {
                    // Do not wait for the normal start-up of the extension host(s)
                    return this._activateByEvent(activationEvent, activationKind);
                }
                return this._installedExtensionsReady.wait().then(() => this._activateByEvent(activationEvent, activationKind));
            }
        }
        _activateByEvent(activationEvent, activationKind) {
            const result = Promise.all(this._extensionHostManagers.map(extHostManager => extHostManager.activateByEvent(activationEvent, activationKind))).then(() => { });
            this._onWillActivateByEvent.fire({
                event: activationEvent,
                activation: result
            });
            return result;
        }
        activationEventIsDone(activationEvent) {
            if (!this._installedExtensionsReady.isOpen()) {
                return false;
            }
            if (!this._registry.containsActivationEvent(activationEvent)) {
                // There is no extension that is interested in this activation event
                return true;
            }
            return this._extensionHostManagers.every(manager => manager.activationEventIsDone(activationEvent));
        }
        whenInstalledExtensionsRegistered() {
            return this._installedExtensionsReady.wait();
        }
        get extensions() {
            return this._registry.getAllExtensionDescriptions();
        }
        _getExtensionRegistrySnapshotWhenReady() {
            return this._installedExtensionsReady.wait().then(() => this._registry.getSnapshot());
        }
        getExtension(id) {
            return this._installedExtensionsReady.wait().then(() => {
                return this._registry.getExtensionDescription(id);
            });
        }
        readExtensionPointContributions(extPoint) {
            return this._installedExtensionsReady.wait().then(() => {
                const availableExtensions = this._registry.getAllExtensionDescriptions();
                const result = [];
                for (const desc of availableExtensions) {
                    if (desc.contributes && hasOwnProperty.call(desc.contributes, extPoint.name)) {
                        result.push(new extensions_2.ExtensionPointContribution(desc, desc.contributes[extPoint.name]));
                    }
                }
                return result;
            });
        }
        getExtensionsStatus() {
            const result = Object.create(null);
            if (this._registry) {
                const extensions = this._registry.getAllExtensionDescriptions();
                for (const extension of extensions) {
                    const extensionStatus = this._extensionStatus.get(extension.identifier);
                    result[extension.identifier.value] = {
                        id: extension.identifier,
                        messages: extensionStatus?.messages ?? [],
                        activationStarted: extensionStatus?.activationStarted ?? false,
                        activationTimes: extensionStatus?.activationTimes ?? undefined,
                        runtimeErrors: extensionStatus?.runtimeErrors ?? [],
                        runningLocation: this._runningLocations.getRunningLocation(extension.identifier),
                    };
                }
            }
            return result;
        }
        async getInspectPorts(extensionHostKind, tryEnableInspector) {
            const result = await Promise.all(this._getExtensionHostManagers(extensionHostKind).map(extHost => extHost.getInspectPort(tryEnableInspector)));
            // remove 0s:
            return result.filter(element => Boolean(element));
        }
        async setRemoteEnvironment(env) {
            await this._extensionHostManagers
                .map(manager => manager.setRemoteEnvironment(env));
        }
        //#endregion
        // --- impl
        _safeInvokeIsEnabled(extension) {
            try {
                return this._extensionEnablementService.isEnabled(extension);
            }
            catch (err) {
                return false;
            }
        }
        _doHandleExtensionPoints(affectedExtensions) {
            const affectedExtensionPoints = Object.create(null);
            for (const extensionDescription of affectedExtensions) {
                if (extensionDescription.contributes) {
                    for (const extPointName in extensionDescription.contributes) {
                        if (hasOwnProperty.call(extensionDescription.contributes, extPointName)) {
                            affectedExtensionPoints[extPointName] = true;
                        }
                    }
                }
            }
            const messageHandler = (msg) => this._handleExtensionPointMessage(msg);
            const availableExtensions = this._registry.getAllExtensionDescriptions();
            const extensionPoints = extensionsRegistry_1.ExtensionsRegistry.getExtensionPoints();
            perf.mark('code/willHandleExtensionPoints');
            for (const extensionPoint of extensionPoints) {
                if (affectedExtensionPoints[extensionPoint.name]) {
                    perf.mark(`code/willHandleExtensionPoint/${extensionPoint.name}`);
                    AbstractExtensionService_1._handleExtensionPoint(extensionPoint, availableExtensions, messageHandler);
                    perf.mark(`code/didHandleExtensionPoint/${extensionPoint.name}`);
                }
            }
            perf.mark('code/didHandleExtensionPoints');
        }
        _getOrCreateExtensionStatus(extensionId) {
            if (!this._extensionStatus.has(extensionId)) {
                this._extensionStatus.set(extensionId, new ExtensionStatus(extensionId));
            }
            return this._extensionStatus.get(extensionId);
        }
        _handleExtensionPointMessage(msg) {
            const extensionStatus = this._getOrCreateExtensionStatus(msg.extensionId);
            extensionStatus.addMessage(msg);
            const extension = this._registry.getExtensionDescription(msg.extensionId);
            const strMsg = `[${msg.extensionId.value}]: ${msg.message}`;
            if (msg.type === notification_1.Severity.Error) {
                if (extension && extension.isUnderDevelopment) {
                    // This message is about the extension currently being developed
                    this._notificationService.notify({ severity: notification_1.Severity.Error, message: strMsg });
                }
                this._logService.error(strMsg);
            }
            else if (msg.type === notification_1.Severity.Warning) {
                if (extension && extension.isUnderDevelopment) {
                    // This message is about the extension currently being developed
                    this._notificationService.notify({ severity: notification_1.Severity.Warning, message: strMsg });
                }
                this._logService.warn(strMsg);
            }
            else {
                this._logService.info(strMsg);
            }
            if (msg.extensionId && this._environmentService.isBuilt && !this._environmentService.isExtensionDevelopment) {
                const { type, extensionId, extensionPointId, message } = msg;
                this._telemetryService.publicLog2('extensionsMessage', {
                    type, extensionId: extensionId.value, extensionPointId, message
                });
            }
        }
        static _handleExtensionPoint(extensionPoint, availableExtensions, messageHandler) {
            const users = [];
            for (const desc of availableExtensions) {
                if (desc.contributes && hasOwnProperty.call(desc.contributes, extensionPoint.name)) {
                    users.push({
                        description: desc,
                        value: desc.contributes[extensionPoint.name],
                        collector: new extensionsRegistry_1.ExtensionMessageCollector(messageHandler, desc, extensionPoint.name)
                    });
                }
            }
            extensionPoint.acceptUsers(users);
        }
        //#region Called by extension host
        _acquireInternalAPI(extensionHost) {
            return {
                _activateById: (extensionId, reason) => {
                    return this._activateById(extensionId, reason);
                },
                _onWillActivateExtension: (extensionId) => {
                    return this._onWillActivateExtension(extensionId, extensionHost.runningLocation);
                },
                _onDidActivateExtension: (extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) => {
                    return this._onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason);
                },
                _onDidActivateExtensionError: (extensionId, error) => {
                    return this._onDidActivateExtensionError(extensionId, error);
                },
                _onExtensionRuntimeError: (extensionId, err) => {
                    return this._onExtensionRuntimeError(extensionId, err);
                }
            };
        }
        async _activateById(extensionId, reason) {
            const results = await Promise.all(this._extensionHostManagers.map(manager => manager.activate(extensionId, reason)));
            const activated = results.some(e => e);
            if (!activated) {
                throw new Error(`Unknown extension ${extensionId.value}`);
            }
        }
        _onWillActivateExtension(extensionId, runningLocation) {
            this._runningLocations.set(extensionId, runningLocation);
            const extensionStatus = this._getOrCreateExtensionStatus(extensionId);
            extensionStatus.onWillActivate();
        }
        _onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
            const extensionStatus = this._getOrCreateExtensionStatus(extensionId);
            extensionStatus.setActivationTimes(new extensions_2.ActivationTimes(codeLoadingTime, activateCallTime, activateResolvedTime, activationReason));
            this._onDidChangeExtensionsStatus.fire([extensionId]);
        }
        _onDidActivateExtensionError(extensionId, error) {
            this._telemetryService.publicLog2('extensionActivationError', {
                extensionId: extensionId.value,
                error: error.message
            });
        }
        _onExtensionRuntimeError(extensionId, err) {
            const extensionStatus = this._getOrCreateExtensionStatus(extensionId);
            extensionStatus.addRuntimeError(err);
            this._onDidChangeExtensionsStatus.fire([extensionId]);
        }
    };
    exports.AbstractExtensionService = AbstractExtensionService;
    exports.AbstractExtensionService = AbstractExtensionService = AbstractExtensionService_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, notification_1.INotificationService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(8, files_1.IFileService),
        __param(9, productService_1.IProductService),
        __param(10, extensionManagement_1.IWorkbenchExtensionManagementService),
        __param(11, workspace_1.IWorkspaceContextService),
        __param(12, configuration_1.IConfigurationService),
        __param(13, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(14, log_1.ILogService),
        __param(15, remoteAgentService_1.IRemoteAgentService),
        __param(16, remoteExtensionsScanner_1.IRemoteExtensionsScannerService),
        __param(17, lifecycle_3.ILifecycleService),
        __param(18, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(19, dialogs_1.IDialogService)
    ], AbstractExtensionService);
    class ResolvedExtensions {
        constructor(local, remote, hasLocalProcess, allowRemoteExtensionsInLocalWebWorker) {
            this.local = local;
            this.remote = remote;
            this.hasLocalProcess = hasLocalProcess;
            this.allowRemoteExtensionsInLocalWebWorker = allowRemoteExtensionsInLocalWebWorker;
        }
    }
    exports.ResolvedExtensions = ResolvedExtensions;
    class DeltaExtensionsQueueItem {
        constructor(toAdd, toRemove) {
            this.toAdd = toAdd;
            this.toRemove = toRemove;
        }
    }
    /**
     * @argument extensions The extensions to be checked.
     * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
     */
    function checkEnabledAndProposedAPI(logService, extensionEnablementService, extensionsProposedApi, extensions, ignoreWorkspaceTrust) {
        // enable or disable proposed API per extension
        extensionsProposedApi.updateEnabledApiProposals(extensions);
        // keep only enabled extensions
        return filterEnabledExtensions(logService, extensionEnablementService, extensions, ignoreWorkspaceTrust);
    }
    exports.checkEnabledAndProposedAPI = checkEnabledAndProposedAPI;
    /**
     * Return the subset of extensions that are enabled.
     * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
     */
    function filterEnabledExtensions(logService, extensionEnablementService, extensions, ignoreWorkspaceTrust) {
        const enabledExtensions = [], extensionsToCheck = [], mappedExtensions = [];
        for (const extension of extensions) {
            if (extension.isUnderDevelopment) {
                // Never disable extensions under development
                enabledExtensions.push(extension);
            }
            else {
                extensionsToCheck.push(extension);
                mappedExtensions.push((0, extensions_2.toExtension)(extension));
            }
        }
        const enablementStates = extensionEnablementService.getEnablementStates(mappedExtensions, ignoreWorkspaceTrust ? { trusted: true } : undefined);
        for (let index = 0; index < enablementStates.length; index++) {
            if (extensionEnablementService.isEnabledEnablementState(enablementStates[index])) {
                enabledExtensions.push(extensionsToCheck[index]);
            }
            else {
                if (platform_1.isCI) {
                    logService.info(`filterEnabledExtensions: extension '${extensionsToCheck[index].identifier.value}' is disabled`);
                }
            }
        }
        return enabledExtensions;
    }
    exports.filterEnabledExtensions = filterEnabledExtensions;
    /**
     * @argument extension The extension to be checked.
     * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
     */
    function extensionIsEnabled(logService, extensionEnablementService, extension, ignoreWorkspaceTrust) {
        return filterEnabledExtensions(logService, extensionEnablementService, [extension], ignoreWorkspaceTrust).includes(extension);
    }
    exports.extensionIsEnabled = extensionIsEnabled;
    function includes(extensions, identifier) {
        for (const extension of extensions) {
            if (extensions_1.ExtensionIdentifier.equals(extension.identifier, identifier)) {
                return true;
            }
        }
        return false;
    }
    class ExtensionStatus {
        get messages() {
            return this._messages;
        }
        get activationTimes() {
            return this._activationTimes;
        }
        get runtimeErrors() {
            return this._runtimeErrors;
        }
        get activationStarted() {
            return this._activationStarted;
        }
        constructor(id) {
            this.id = id;
            this._messages = [];
            this._activationTimes = null;
            this._runtimeErrors = [];
            this._activationStarted = false;
        }
        clearRuntimeStatus() {
            this._activationStarted = false;
            this._activationTimes = null;
            this._runtimeErrors = [];
        }
        addMessage(msg) {
            this._messages.push(msg);
        }
        setActivationTimes(activationTimes) {
            this._activationTimes = activationTimes;
        }
        addRuntimeError(err) {
            this._runtimeErrors.push(err);
        }
        onWillActivate() {
            this._activationStarted = true;
        }
    }
    exports.ExtensionStatus = ExtensionStatus;
    class ExtensionHostCrashTracker {
        constructor() {
            this._recentCrashes = [];
        }
        static { this._TIME_LIMIT = 5 * 60 * 1000; } // 5 minutes
        static { this._CRASH_LIMIT = 3; }
        _removeOldCrashes() {
            const limit = Date.now() - ExtensionHostCrashTracker._TIME_LIMIT;
            while (this._recentCrashes.length > 0 && this._recentCrashes[0].timestamp < limit) {
                this._recentCrashes.shift();
            }
        }
        registerCrash() {
            this._removeOldCrashes();
            this._recentCrashes.push({ timestamp: Date.now() });
        }
        shouldAutomaticallyRestart() {
            this._removeOldCrashes();
            return (this._recentCrashes.length < ExtensionHostCrashTracker._CRASH_LIMIT);
        }
    }
    exports.ExtensionHostCrashTracker = ExtensionHostCrashTracker;
    /**
     * This can run correctly only on the renderer process because that is the only place
     * where all extension points and all implicit activation events generators are known.
     */
    class ImplicitActivationAwareReader {
        readActivationEvents(extensionDescription) {
            return implicitActivationEvents_1.ImplicitActivationEvents.readActivationEvents(extensionDescription);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RFeHRlbnNpb25TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvY29tbW9uL2Fic3RyYWN0RXh0ZW5zaW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBOENoRyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDO0lBQzdDLE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBTyxTQUFTLENBQUMsQ0FBQztJQUVyRCxJQUFlLHdCQUF3QixnQ0FBdkMsTUFBZSx3QkFBeUIsU0FBUSxzQkFBVTtRQXFDaEUsWUFDa0Isc0JBQTZDLEVBQzdDLHFCQUE0QyxFQUM1Qyx3QkFBa0QsRUFDNUMscUJBQStELEVBQ2hFLG9CQUE2RCxFQUNyRCxtQkFBb0UsRUFDL0UsaUJBQXVELEVBQ3BDLDJCQUFvRixFQUM1RyxZQUE2QyxFQUMxQyxlQUFtRCxFQUM5QiwyQkFBb0YsRUFDaEcsZUFBMEQsRUFDN0QscUJBQTZELEVBQy9DLG1DQUF5RixFQUNqSCxXQUEyQyxFQUNuQyxtQkFBMkQsRUFDL0MsK0JBQW1GLEVBQ2pHLGlCQUFxRCxFQUN2QywrQkFBbUYsRUFDcEcsY0FBK0M7WUFFL0QsS0FBSyxFQUFFLENBQUM7WUFyQlMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF1QjtZQUM3QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzVDLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDekIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM3Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ2xDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBOEI7WUFDNUQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNqQixnQ0FBMkIsR0FB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