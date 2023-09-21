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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/network", "vs/base/common/performance", "vs/base/common/platform", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteExtensionsScanner", "vs/platform/remote/common/remoteHosts", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/browser/webWorkerExtensionHost", "vs/workbench/services/extensions/common/abstractExtensionService", "vs/workbench/services/extensions/common/extensionDevOptions", "vs/workbench/services/extensions/common/extensionHostKind", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensionRunningLocationTracker", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsProposedApi", "vs/workbench/services/extensions/common/remoteExtensionHost", "vs/workbench/services/extensions/electron-sandbox/cachedExtensionScanner", "vs/workbench/services/extensions/electron-sandbox/localProcessExtensionHost", "vs/workbench/services/host/browser/host", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/remote/common/remoteExplorerService"], function (require, exports, async_1, cancellation_1, network_1, performance, platform_1, nls, actionCommonCategories_1, actions_1, commands_1, configuration_1, dialogs_1, extensionManagement_1, files_1, extensions_1, instantiation_1, log_1, native_1, notification_1, opener_1, productService_1, remoteAuthorityResolver_1, remoteExtensionsScanner_1, remoteHosts_1, request_1, telemetry_1, workspace_1, workspaceTrust_1, environmentService_1, extensionManagement_2, webWorkerExtensionHost_1, abstractExtensionService_1, extensionDevOptions_1, extensionHostKind_1, extensionManifestPropertiesService_1, extensionRunningLocationTracker_1, extensions_2, extensionsProposedApi_1, remoteExtensionHost_1, cachedExtensionScanner_1, localProcessExtensionHost_1, host_1, lifecycle_1, remoteAgentService_1, remoteExplorerService_1) {
    "use strict";
    var NativeExtensionHostKindPicker_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeExtensionHostKindPicker = exports.NativeExtensionService = void 0;
    let NativeExtensionService = class NativeExtensionService extends abstractExtensionService_1.AbstractExtensionService {
        constructor(instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, _nativeHostService, _hostService, _remoteExplorerService, _extensionGalleryService, _workspaceTrustManagementService, dialogService) {
            const extensionsProposedApi = instantiationService.createInstance(extensionsProposedApi_1.ExtensionsProposedApi);
            const extensionScanner = instantiationService.createInstance(cachedExtensionScanner_1.CachedExtensionScanner);
            const extensionHostFactory = new NativeExtensionHostFactory(extensionsProposedApi, extensionScanner, () => this._getExtensionRegistrySnapshotWhenReady(), instantiationService, environmentService, extensionEnablementService, configurationService, remoteAgentService, remoteAuthorityResolverService, logService);
            super(extensionsProposedApi, extensionHostFactory, new NativeExtensionHostKindPicker(environmentService, configurationService, logService), instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, dialogService);
            this._nativeHostService = _nativeHostService;
            this._hostService = _hostService;
            this._remoteExplorerService = _remoteExplorerService;
            this._extensionGalleryService = _extensionGalleryService;
            this._workspaceTrustManagementService = _workspaceTrustManagementService;
            this._localCrashTracker = new abstractExtensionService_1.ExtensionHostCrashTracker();
            this._extensionScanner = extensionScanner;
            // delay extension host creation and extension scanning
            // until the workbench is running. we cannot defer the
            // extension host more (LifecyclePhase.Restored) because
            // some editors require the extension host to restore
            // and this would result in a deadlock
            // see https://github.com/microsoft/vscode/issues/41322
            lifecycleService.when(2 /* LifecyclePhase.Ready */).then(() => {
                // reschedule to ensure this runs after restoring viewlets, panels, and editors
                (0, async_1.runWhenIdle)(() => {
                    this._initialize();
                }, 50 /*max delay*/);
            });
        }
        _scanSingleExtension(extension) {
            if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                return this._remoteExtensionsScannerService.scanSingleExtension(extension.location, extension.type === 0 /* ExtensionType.System */);
            }
            return this._extensionScanner.scanSingleExtension(extension.location.fsPath, extension.type === 0 /* ExtensionType.System */);
        }
        async _scanAllLocalExtensions() {
            return this._extensionScanner.scannedExtensions;
        }
        _onExtensionHostCrashed(extensionHost, code, signal) {
            const activatedExtensions = [];
            const extensionsStatus = this.getExtensionsStatus();
            for (const key of Object.keys(extensionsStatus)) {
                const extensionStatus = extensionsStatus[key];
                if (extensionStatus.activationStarted && extensionHost.containsExtension(extensionStatus.id)) {
                    activatedExtensions.push(extensionStatus.id);
                }
            }
            super._onExtensionHostCrashed(extensionHost, code, signal);
            if (extensionHost.kind === 1 /* ExtensionHostKind.LocalProcess */) {
                if (code === 55 /* ExtensionHostExitCode.VersionMismatch */) {
                    this._notificationService.prompt(notification_1.Severity.Error, nls.localize('extensionService.versionMismatchCrash', "Extension host cannot start: version mismatch."), [{
                            label: nls.localize('relaunch', "Relaunch VS Code"),
                            run: () => {
                                this._instantiationService.invokeFunction((accessor) => {
                                    const hostService = accessor.get(host_1.IHostService);
                                    hostService.restart();
                                });
                            }
                        }]);
                    return;
                }
                this._logExtensionHostCrash(extensionHost);
                this._sendExtensionHostCrashTelemetry(code, signal, activatedExtensions);
                this._localCrashTracker.registerCrash();
                if (this._localCrashTracker.shouldAutomaticallyRestart()) {
                    this._logService.info(`Automatically restarting the extension host.`);
                    this._notificationService.status(nls.localize('extensionService.autoRestart', "The extension host terminated unexpectedly. Restarting..."), { hideAfter: 5000 });
                    this.startExtensionHosts();
                }
                else {
                    const choices = [];
                    if (this._environmentService.isBuilt) {
                        choices.push({
                            label: nls.localize('startBisect', "Start Extension Bisect"),
                            run: () => {
                                this._instantiationService.invokeFunction(accessor => {
                                    const commandService = accessor.get(commands_1.ICommandService);
                                    commandService.executeCommand('extension.bisect.start');
                                });
                            }
                        });
                    }
                    else {
                        choices.push({
                            label: nls.localize('devTools', "Open Developer Tools"),
                            run: () => this._nativeHostService.openDevTools()
                        });
                    }
                    choices.push({
                        label: nls.localize('restart', "Restart Extension Host"),
                        run: () => this.startExtensionHosts()
                    });
                    if (this._environmentService.isBuilt) {
                        choices.push({
                            label: nls.localize('learnMore', "Learn More"),
                            run: () => {
                                this._instantiationService.invokeFunction(accessor => {
                                    const openerService = accessor.get(opener_1.IOpenerService);
                                    openerService.open('https://aka.ms/vscode-extension-bisect');
                                });
                            }
                        });
                    }
                    this._notificationService.prompt(notification_1.Severity.Error, nls.localize('extensionService.crash', "Extension host terminated unexpectedly 3 times within the last 5 minutes."), choices);
                }
            }
        }
        _sendExtensionHostCrashTelemetry(code, signal, activatedExtensions) {
            this._telemetryService.publicLog2('extensionHostCrash', {
                code,
                signal,
                extensionIds: activatedExtensions.map(e => e.value)
            });
            for (const extensionId of activatedExtensions) {
                this._telemetryService.publicLog2('extensionHostCrashExtension', {
                    code,
                    signal,
                    extensionId: extensionId.value
                });
            }
        }
        // --- impl
        async _resolveAuthority(remoteAuthority) {
            const authorityPlusIndex = remoteAuthority.indexOf('+');
            if (authorityPlusIndex === -1) {
                // This authority does not need to be resolved, simply parse the port number
                const { host, port } = (0, remoteHosts_1.parseAuthorityWithPort)(remoteAuthority);
                return {
                    authority: {
                        authority: remoteAuthority,
                        connectTo: {
                            type: 0 /* RemoteConnectionType.WebSocket */,
                            host,
                            port
                        },
                        connectionToken: undefined
                    }
                };
            }
            return this._resolveAuthorityOnExtensionHosts(1 /* ExtensionHostKind.LocalProcess */, remoteAuthority);
        }
        async _getCanonicalURI(remoteAuthority, uri) {
            const authorityPlusIndex = remoteAuthority.indexOf('+');
            if (authorityPlusIndex === -1) {
                // This authority does not use a resolver
                return uri;
            }
            const localProcessExtensionHosts = this._getExtensionHostManagers(1 /* ExtensionHostKind.LocalProcess */);
            if (localProcessExtensionHosts.length === 0) {
                // no local process extension hosts
                throw new Error(`Cannot resolve canonical URI`);
            }
            const results = await Promise.all(localProcessExtensionHosts.map(extHost => extHost.getCanonicalURI(remoteAuthority, uri)));
            for (const result of results) {
                if (result) {
                    return result;
                }
            }
            // we can only reach this if there was no resolver extension that can return the cannonical uri
            throw new Error(`Cannot get canonical URI because no extension is installed to resolve ${(0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthority)}`);
        }
        async _resolveExtensions() {
            this._extensionScanner.startScanningExtensions();
            const remoteAuthority = this._environmentService.remoteAuthority;
            let remoteEnv = null;
            let remoteExtensions = [];
            if (remoteAuthority) {
                this._remoteAuthorityResolverService._setCanonicalURIProvider(async (uri) => {
                    if (uri.scheme !== network_1.Schemas.vscodeRemote || uri.authority !== remoteAuthority) {
                        // The current remote authority resolver cannot give the canonical URI for this URI
                        return uri;
                    }
                    performance.mark(`code/willGetCanonicalURI/${(0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthority)}`);
                    if (platform_1.isCI) {
                        this._logService.info(`Invoking getCanonicalURI for authority ${(0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthority)}...`);
                    }
                    try {
                        return this._getCanonicalURI(remoteAuthority, uri);
                    }
                    finally {
                        performance.mark(`code/didGetCanonicalURI/${(0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthority)}`);
                        if (platform_1.isCI) {
                            this._logService.info(`getCanonicalURI returned for authority ${(0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthority)}.`);
                        }
                    }
                });
                if (platform_1.isCI) {
                    this._logService.info(`Starting to wait on IWorkspaceTrustManagementService.workspaceResolved...`);
                }
                // Now that the canonical URI provider has been registered, we need to wait for the trust state to be
                // calculated. The trust state will be used while resolving the authority, however the resolver can
                // override the trust state through the resolver result.
                await this._workspaceTrustManagementService.workspaceResolved;
                if (platform_1.isCI) {
                    this._logService.info(`Finished waiting on IWorkspaceTrustManagementService.workspaceResolved.`);
                }
                let resolverResult;
                try {
                    resolverResult = await this._resolveAuthorityInitial(remoteAuthority);
                }
                catch (err) {
                    if (remoteAuthorityResolver_1.RemoteAuthorityResolverError.isNoResolverFound(err)) {
                        err.isHandled = await this._handleNoResolverFound(remoteAuthority);
                    }
                    else {
                        if (remoteAuthorityResolver_1.RemoteAuthorityResolverError.isHandled(err)) {
                            console.log(`Error handled: Not showing a notification for the error`);
                        }
                    }
                    this._remoteAuthorityResolverService._setResolvedAuthorityError(remoteAuthority, err);
                    // Proceed with the local extension host
                    return this._startLocalExtensionHost();
                }
                // set the resolved authority
                this._remoteAuthorityResolverService._setResolvedAuthority(resolverResult.authority, resolverResult.options);
                this._remoteExplorerService.setTunnelInformation(resolverResult.tunnelInformation);
                // monitor for breakage
                const connection = this._remoteAgentService.getConnection();
                if (connection) {
                    connection.onDidStateChange(async (e) => {
                        if (e.type === 0 /* PersistentConnectionEventType.ConnectionLost */) {
                            this._remoteAuthorityResolverService._clearResolvedAuthority(remoteAuthority);
                        }
                    });
                    connection.onReconnecting(() => this._resolveAuthorityAgain());
                }
                // fetch the remote environment
                [remoteEnv, remoteExtensions] = await Promise.all([
                    this._remoteAgentService.getEnvironment(),
                    this._remoteExtensionsScannerService.scanExtensions()
                ]);
                if (!remoteEnv) {
                    this._notificationService.notify({ severity: notification_1.Severity.Error, message: nls.localize('getEnvironmentFailure', "Could not fetch remote environment") });
                    // Proceed with the local extension host
                    return this._startLocalExtensionHost();
                }
                (0, request_1.updateProxyConfigurationsScope)(remoteEnv.useHostProxy ? 1 /* ConfigurationScope.APPLICATION */ : 2 /* ConfigurationScope.MACHINE */);
            }
            else {
                this._remoteAuthorityResolverService._setCanonicalURIProvider(async (uri) => uri);
            }
            return this._startLocalExtensionHost(remoteExtensions);
        }
        async _startLocalExtensionHost(remoteExtensions = []) {
            // Ensure that the workspace trust state has been fully initialized so
            // that the extension host can start with the correct set of extensions.
            await this._workspaceTrustManagementService.workspaceTrustInitialized;
            return new abstractExtensionService_1.ResolvedExtensions(await this._scanAllLocalExtensions(), remoteExtensions, /*hasLocalProcess*/ true, /*allowRemoteExtensionsInLocalWebWorker*/ false);
        }
        _onExtensionHostExit(code) {
            // Dispose everything associated with the extension host
            this._doStopExtensionHosts();
            // Dispose the management connection to avoid reconnecting after the extension host exits
            const connection = this._remoteAgentService.getConnection();
            connection?.dispose();
            if ((0, extensionDevOptions_1.parseExtensionDevOptions)(this._environmentService).isExtensionDevTestFromCli) {
                // When CLI testing make sure to exit with proper exit code
                if (platform_1.isCI) {
                    this._logService.info(`Asking native host service to exit with code ${code}.`);
                }
                this._nativeHostService.exit(code);
            }
            else {
                // Expected development extension termination: When the extension host goes down we also shutdown the window
                this._nativeHostService.closeWindow();
            }
        }
        async _handleNoResolverFound(remoteAuthority) {
            const remoteName = (0, remoteHosts_1.getRemoteName)(remoteAuthority);
            const recommendation = this._productService.remoteExtensionTips?.[remoteName];
            if (!recommendation) {
                return false;
            }
            const sendTelemetry = (userReaction) => {
                /* __GDPR__
                "remoteExtensionRecommendations:popup" : {
                    "owner": "sandy081",
                    "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                }
                */
                this._telemetryService.publicLog('remoteExtensionRecommendations:popup', { userReaction, extensionId: resolverExtensionId });
            };
            const resolverExtensionId = recommendation.extensionId;
            const allExtensions = await this._scanAllLocalExtensions();
            const extension = allExtensions.filter(e => e.identifier.value === resolverExtensionId)[0];
            if (extension) {
                if (!(0, abstractExtensionService_1.extensionIsEnabled)(this._logService, this._extensionEnablementService, extension, false)) {
                    const message = nls.localize('enableResolver', "Extension '{0}' is required to open the remote window.\nOK to enable?", recommendation.friendlyName);
                    this._notificationService.prompt(notification_1.Severity.Info, message, [{
                            label: nls.localize('enable', 'Enable and Reload'),
                            run: async () => {
                                sendTelemetry('enable');
                                await this._extensionEnablementService.setEnablement([(0, extensions_2.toExtension)(extension)], 8 /* EnablementState.EnabledGlobally */);
                                await this._hostService.reload();
                            }
                        }], {
                        sticky: true,
                        priority: notification_1.NotificationPriority.URGENT
                    });
                }
            }
            else {
                // Install the Extension and reload the window to handle.
                const message = nls.localize('installResolver', "Extension '{0}' is required to open the remote window.\nDo you want to install the extension?", recommendation.friendlyName);
                this._notificationService.prompt(notification_1.Severity.Info, message, [{
                        label: nls.localize('install', 'Install and Reload'),
                        run: async () => {
                            sendTelemetry('install');
                            const [galleryExtension] = await this._extensionGalleryService.getExtensions([{ id: resolverExtensionId }], cancellation_1.CancellationToken.None);
                            if (galleryExtension) {
                                await this._extensionManagementService.installFromGallery(galleryExtension);
                                await this._hostService.reload();
                            }
                            else {
                                this._notificationService.error(nls.localize('resolverExtensionNotFound', "`{0}` not found on marketplace"));
                            }
                        }
                    }], {
                    sticky: true,
                    priority: notification_1.NotificationPriority.URGENT,
                    onCancel: () => sendTelemetry('cancel')
                });
            }
            return true;
        }
    };
    exports.NativeExtensionService = NativeExtensionService;
    exports.NativeExtensionService = NativeExtensionService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notification_1.INotificationService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(5, files_1.IFileService),
        __param(6, productService_1.IProductService),
        __param(7, extensionManagement_2.IWorkbenchExtensionManagementService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(11, log_1.ILogService),
        __param(12, remoteAgentService_1.IRemoteAgentService),
        __param(13, remoteExtensionsScanner_1.IRemoteExtensionsScannerService),
        __param(14, lifecycle_1.ILifecycleService),
        __param(15, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(16, native_1.INativeHostService),
        __param(17, host_1.IHostService),
        __param(18, remoteExplorerService_1.IRemoteExplorerService),
        __param(19, extensionManagement_1.IExtensionGalleryService),
        __param(20, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(21, dialogs_1.IDialogService)
    ], NativeExtensionService);
    let NativeExtensionHostFactory = class NativeExtensionHostFactory {
        constructor(_extensionsProposedApi, _extensionScanner, _getExtensionRegistrySnapshotWhenReady, _instantiationService, environmentService, _extensionEnablementService, configurationService, _remoteAgentService, _remoteAuthorityResolverService, _logService) {
            this._extensionsProposedApi = _extensionsProposedApi;
            this._extensionScanner = _extensionScanner;
            this._getExtensionRegistrySnapshotWhenReady = _getExtensionRegistrySnapshotWhenReady;
            this._instantiationService = _instantiationService;
            this._extensionEnablementService = _extensionEnablementService;
            this._remoteAgentService = _remoteAgentService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._logService = _logService;
            this._webWorkerExtHostEnablement = determineLocalWebWorkerExtHostEnablement(environmentService, configurationService);
        }
        createExtensionHost(runningLocations, runningLocation, isInitialStart) {
            switch (runningLocation.kind) {
                case 1 /* ExtensionHostKind.LocalProcess */: {
                    const startup = (isInitialStart
                        ? 2 /* ExtensionHostStartup.EagerManualStart */
                        : 1 /* ExtensionHostStartup.EagerAutoStart */);
                    return this._instantiationService.createInstance(localProcessExtensionHost_1.NativeLocalProcessExtensionHost, runningLocation, startup, this._createLocalProcessExtensionHostDataProvider(runningLocations, isInitialStart, runningLocation));
                }
                case 2 /* ExtensionHostKind.LocalWebWorker */: {
                    if (this._webWorkerExtHostEnablement !== 0 /* LocalWebWorkerExtHostEnablement.Disabled */) {
                        const startup = (isInitialStart
                            ? (this._webWorkerExtHostEnablement === 2 /* LocalWebWorkerExtHostEnablement.Lazy */ ? 3 /* ExtensionHostStartup.Lazy */ : 2 /* ExtensionHostStartup.EagerManualStart */)
                            : 1 /* ExtensionHostStartup.EagerAutoStart */);
                        return this._instantiationService.createInstance(webWorkerExtensionHost_1.WebWorkerExtensionHost, runningLocation, startup, this._createWebWorkerExtensionHostDataProvider(runningLocations, runningLocation));
                    }
                    return null;
                }
                case 3 /* ExtensionHostKind.Remote */: {
                    const remoteAgentConnection = this._remoteAgentService.getConnection();
                    if (remoteAgentConnection) {
                        return this._instantiationService.createInstance(remoteExtensionHost_1.RemoteExtensionHost, runningLocation, this._createRemoteExtensionHostDataProvider(runningLocations, remoteAgentConnection.remoteAuthority));
                    }
                    return null;
                }
            }
        }
        _createLocalProcessExtensionHostDataProvider(runningLocations, isInitialStart, desiredRunningLocation) {
            return {
                getInitData: async () => {
                    if (isInitialStart) {
                        // Here we load even extensions that would be disabled by workspace trust
                        const scannedExtensions = await this._extensionScanner.scannedExtensions;
                        if (platform_1.isCI) {
                            this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.scannedExtensions: ${scannedExtensions.map(ext => ext.identifier.value).join(',')}`);
                        }
                        const localExtensions = (0, abstractExtensionService_1.checkEnabledAndProposedAPI)(this._logService, this._extensionEnablementService, this._extensionsProposedApi, scannedExtensions, /* ignore workspace trust */ true);
                        if (platform_1.isCI) {
                            this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.localExtensions: ${localExtensions.map(ext => ext.identifier.value).join(',')}`);
                        }
                        const runningLocation = runningLocations.computeRunningLocation(localExtensions, [], false);
                        const myExtensions = (0, extensionRunningLocationTracker_1.filterExtensionDescriptions)(localExtensions, runningLocation, extRunningLocation => desiredRunningLocation.equals(extRunningLocation));
                        const extensions = new extensions_2.ExtensionHostExtensions(0, localExtensions, myExtensions.map(extension => extension.identifier));
                        if (platform_1.isCI) {
                            this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.myExtensions: ${myExtensions.map(ext => ext.identifier.value).join(',')}`);
                        }
                        return { extensions };
                    }
                    else {
                        // restart case
                        const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
                        const myExtensions = runningLocations.filterByRunningLocation(snapshot.extensions, desiredRunningLocation);
                        const extensions = new extensions_2.ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                        return { extensions };
                    }
                }
            };
        }
        _createWebWorkerExtensionHostDataProvider(runningLocations, desiredRunningLocation) {
            return {
                getInitData: async () => {
                    const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
                    const myExtensions = runningLocations.filterByRunningLocation(snapshot.extensions, desiredRunningLocation);
                    const extensions = new extensions_2.ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                    return { extensions };
                }
            };
        }
        _createRemoteExtensionHostDataProvider(runningLocations, remoteAuthority) {
            return {
                remoteAuthority: remoteAuthority,
                getInitData: async () => {
                    const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
                    const remoteEnv = await this._remoteAgentService.getEnvironment();
                    if (!remoteEnv) {
                        throw new Error('Cannot provide init data for remote extension host!');
                    }
                    const myExtensions = runningLocations.filterByExtensionHostKind(snapshot.extensions, 3 /* ExtensionHostKind.Remote */);
                    const extensions = new extensions_2.ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                    return {
                        connectionData: this._remoteAuthorityResolverService.getConnectionData(remoteAuthority),
                        pid: remoteEnv.pid,
                        appRoot: remoteEnv.appRoot,
                        extensionHostLogsPath: remoteEnv.extensionHostLogsPath,
                        globalStorageHome: remoteEnv.globalStorageHome,
                        workspaceStorageHome: remoteEnv.workspaceStorageHome,
                        extensions,
                    };
                }
            };
        }
    };
    NativeExtensionHostFactory = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, remoteAgentService_1.IRemoteAgentService),
        __param(8, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(9, log_1.ILogService)
    ], NativeExtensionHostFactory);
    function determineLocalWebWorkerExtHostEnablement(environmentService, configurationService) {
        if (environmentService.isExtensionDevelopment && environmentService.extensionDevelopmentKind?.some(k => k === 'web')) {
            return 1 /* LocalWebWorkerExtHostEnablement.Eager */;
        }
        else {
            const config = configurationService.getValue(extensions_2.webWorkerExtHostConfig);
            if (config === true) {
                return 1 /* LocalWebWorkerExtHostEnablement.Eager */;
            }
            else if (config === 'auto') {
                return 2 /* LocalWebWorkerExtHostEnablement.Lazy */;
            }
            else {
                return 0 /* LocalWebWorkerExtHostEnablement.Disabled */;
            }
        }
    }
    var LocalWebWorkerExtHostEnablement;
    (function (LocalWebWorkerExtHostEnablement) {
        LocalWebWorkerExtHostEnablement[LocalWebWorkerExtHostEnablement["Disabled"] = 0] = "Disabled";
        LocalWebWorkerExtHostEnablement[LocalWebWorkerExtHostEnablement["Eager"] = 1] = "Eager";
        LocalWebWorkerExtHostEnablement[LocalWebWorkerExtHostEnablement["Lazy"] = 2] = "Lazy";
    })(LocalWebWorkerExtHostEnablement || (LocalWebWorkerExtHostEnablement = {}));
    let NativeExtensionHostKindPicker = NativeExtensionHostKindPicker_1 = class NativeExtensionHostKindPicker {
        constructor(environmentService, configurationService, _logService) {
            this._logService = _logService;
            this._hasRemoteExtHost = Boolean(environmentService.remoteAuthority);
            const webWorkerExtHostEnablement = determineLocalWebWorkerExtHostEnablement(environmentService, configurationService);
            this._hasWebWorkerExtHost = (webWorkerExtHostEnablement !== 0 /* LocalWebWorkerExtHostEnablement.Disabled */);
        }
        pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
            const result = NativeExtensionHostKindPicker_1.pickExtensionHostKind(extensionKinds, isInstalledLocally, isInstalledRemotely, preference, this._hasRemoteExtHost, this._hasWebWorkerExtHost);
            this._logService.trace(`pickRunningLocation for ${extensionId.value}, extension kinds: [${extensionKinds.join(', ')}], isInstalledLocally: ${isInstalledLocally}, isInstalledRemotely: ${isInstalledRemotely}, preference: ${(0, extensionHostKind_1.extensionRunningPreferenceToString)(preference)} => ${(0, extensionHostKind_1.extensionHostKindToString)(result)}`);
            return result;
        }
        static pickExtensionHostKind(extensionKinds, isInstalledLocally, isInstalledRemotely, preference, hasRemoteExtHost, hasWebWorkerExtHost) {
            const result = [];
            for (const extensionKind of extensionKinds) {
                if (extensionKind === 'ui' && isInstalledLocally) {
                    // ui extensions run locally if possible
                    if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 1 /* ExtensionRunningPreference.Local */) {
                        return 1 /* ExtensionHostKind.LocalProcess */;
                    }
                    else {
                        result.push(1 /* ExtensionHostKind.LocalProcess */);
                    }
                }
                if (extensionKind === 'workspace' && isInstalledRemotely) {
                    // workspace extensions run remotely if possible
                    if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 2 /* ExtensionRunningPreference.Remote */) {
                        return 3 /* ExtensionHostKind.Remote */;
                    }
                    else {
                        result.push(3 /* ExtensionHostKind.Remote */);
                    }
                }
                if (extensionKind === 'workspace' && !hasRemoteExtHost) {
                    // workspace extensions also run locally if there is no remote
                    if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 1 /* ExtensionRunningPreference.Local */) {
                        return 1 /* ExtensionHostKind.LocalProcess */;
                    }
                    else {
                        result.push(1 /* ExtensionHostKind.LocalProcess */);
                    }
                }
                if (extensionKind === 'web' && isInstalledLocally && hasWebWorkerExtHost) {
                    // web worker extensions run in the local web worker if possible
                    if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 1 /* ExtensionRunningPreference.Local */) {
                        return 2 /* ExtensionHostKind.LocalWebWorker */;
                    }
                    else {
                        result.push(2 /* ExtensionHostKind.LocalWebWorker */);
                    }
                }
            }
            return (result.length > 0 ? result[0] : null);
        }
    };
    exports.NativeExtensionHostKindPicker = NativeExtensionHostKindPicker;
    exports.NativeExtensionHostKindPicker = NativeExtensionHostKindPicker = NativeExtensionHostKindPicker_1 = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, log_1.ILogService)
    ], NativeExtensionHostKindPicker);
    class RestartExtensionHostAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.restartExtensionHost',
                title: { value: nls.localize('restartExtensionHost', "Restart Extension Host"), original: 'Restart Extension Host' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const extensionService = accessor.get(extensions_2.IExtensionService);
            const stopped = await extensionService.stopExtensionHosts(nls.localize('restartExtensionHost.reason', "Restarting extension host on explicit request."));
            if (stopped) {
                extensionService.startExtensionHosts();
            }
        }
    }
    (0, actions_1.registerAction2)(RestartExtensionHostAction);
    (0, extensions_1.registerSingleton)(extensions_2.IExtensionService, NativeExtensionService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlRXh0ZW5zaW9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2VsZWN0cm9uLXNhbmRib3gvbmF0aXZlRXh0ZW5zaW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUR6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLG1EQUF3QjtRQUtuRSxZQUN3QixvQkFBMkMsRUFDNUMsbUJBQXlDLEVBQ2pDLGtCQUFnRCxFQUMzRCxnQkFBbUMsRUFDaEIsMEJBQWdFLEVBQ3hGLFdBQXlCLEVBQ3RCLGNBQStCLEVBQ1YsMEJBQWdFLEVBQzVFLGNBQXdDLEVBQzNDLG9CQUEyQyxFQUM3QixrQ0FBdUUsRUFDL0YsVUFBdUIsRUFDZixrQkFBdUMsRUFDM0IsOEJBQStELEVBQzdFLGdCQUFtQyxFQUNyQiw4QkFBK0QsRUFDNUUsa0JBQXVELEVBQzdELFlBQTJDLEVBQ2pDLHNCQUErRCxFQUM3RCx3QkFBbUUsRUFDM0QsZ0NBQW1GLEVBQ3JHLGFBQTZCO1lBRTdDLE1BQU0scUJBQXFCLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDZDQUFxQixDQUFDLENBQUM7WUFDekYsTUFBTSxnQkFBZ0IsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsK0NBQXNCLENBQUMsQ0FBQztZQUNyRixNQUFNLG9CQUFvQixHQUFHLElBQUksMEJBQTBCLENBQzFELHFCQUFxQixFQUNyQixnQkFBZ0IsRUFDaEIsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxFQUFFLEVBQ25ELG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIsMEJBQTBCLEVBQzFCLG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIsOEJBQThCLEVBQzlCLFVBQVUsQ0FDVixDQUFDO1lBQ0YsS0FBSyxDQUNKLHFCQUFxQixFQUNyQixvQkFBb0IsRUFDcEIsSUFBSSw2QkFBNkIsQ0FBQyxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxVQUFVLENBQUMsRUFDdkYsb0JBQW9CLEVBQ3BCLG1CQUFtQixFQUNuQixrQkFBa0IsRUFDbEIsZ0JBQWdCLEVBQ2hCLDBCQUEwQixFQUMxQixXQUFXLEVBQ1gsY0FBYyxFQUNkLDBCQUEwQixFQUMxQixjQUFjLEVBQ2Qsb0JBQW9CLEVBQ3BCLGtDQUFrQyxFQUNsQyxVQUFVLEVBQ1Ysa0JBQWtCLEVBQ2xCLDhCQUE4QixFQUM5QixnQkFBZ0IsRUFDaEIsOEJBQThCLEVBQzlCLGFBQWEsQ0FDYixDQUFDO1lBMUNtQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQzVDLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQ2hCLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7WUFDNUMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUMxQyxxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQWtDO1lBdkJyRyx1QkFBa0IsR0FBRyxJQUFJLG9EQUF5QixFQUFFLENBQUM7WUErRHJFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztZQUUxQyx1REFBdUQ7WUFDdkQsc0RBQXNEO1lBQ3RELHdEQUF3RDtZQUN4RCxxREFBcUQ7WUFDckQsc0NBQXNDO1lBQ3RDLHVEQUF1RDtZQUN2RCxnQkFBZ0IsQ0FBQyxJQUFJLDhCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ3JELCtFQUErRTtnQkFDL0UsSUFBQSxtQkFBVyxFQUFDLEdBQUcsRUFBRTtvQkFDaEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQixDQUFDLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVTLG9CQUFvQixDQUFDLFNBQXFCO1lBQ25ELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZELE9BQU8sSUFBSSxDQUFDLCtCQUErQixDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLElBQUksaUNBQXlCLENBQUMsQ0FBQzthQUM3SDtZQUVELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxJQUFJLGlDQUF5QixDQUFDLENBQUM7UUFDdkgsQ0FBQztRQUVPLEtBQUssQ0FBQyx1QkFBdUI7WUFDcEMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUM7UUFDakQsQ0FBQztRQUVrQix1QkFBdUIsQ0FBQyxhQUFvQyxFQUFFLElBQVksRUFBRSxNQUFxQjtZQUVuSCxNQUFNLG1CQUFtQixHQUEwQixFQUFFLENBQUM7WUFDdEQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUNwRCxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDaEQsTUFBTSxlQUFlLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzlDLElBQUksZUFBZSxDQUFDLGlCQUFpQixJQUFJLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQzdGLG1CQUFtQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQzdDO2FBQ0Q7WUFFRCxLQUFLLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUUzRCxJQUFJLGFBQWEsQ0FBQyxJQUFJLDJDQUFtQyxFQUFFO2dCQUMxRCxJQUFJLElBQUksbURBQTBDLEVBQUU7b0JBQ25ELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQy9CLHVCQUFRLENBQUMsS0FBSyxFQUNkLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUNBQXVDLEVBQUUsZ0RBQWdELENBQUMsRUFDdkcsQ0FBQzs0QkFDQSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLENBQUM7NEJBQ25ELEdBQUcsRUFBRSxHQUFHLEVBQUU7Z0NBQ1QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO29DQUN0RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1CQUFZLENBQUMsQ0FBQztvQ0FDL0MsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dDQUN2QixDQUFDLENBQUMsQ0FBQzs0QkFDSixDQUFDO3lCQUNELENBQUMsQ0FDRixDQUFDO29CQUNGLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2dCQUV6RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBRXhDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLDBCQUEwQixFQUFFLEVBQUU7b0JBQ3pELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7b0JBQ3RFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSwyREFBMkQsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQ2pLLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2lCQUMzQjtxQkFBTTtvQkFDTixNQUFNLE9BQU8sR0FBb0IsRUFBRSxDQUFDO29CQUNwQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUU7d0JBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUM7NEJBQ1osS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLHdCQUF3QixDQUFDOzRCQUM1RCxHQUFHLEVBQUUsR0FBRyxFQUFFO2dDQUNULElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7b0NBQ3BELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQWUsQ0FBQyxDQUFDO29DQUNyRCxjQUFjLENBQUMsY0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUM7Z0NBQ3pELENBQUMsQ0FBQyxDQUFDOzRCQUNKLENBQUM7eUJBQ0QsQ0FBQyxDQUFDO3FCQUNIO3lCQUFNO3dCQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUM7NEJBQ1osS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLHNCQUFzQixDQUFDOzRCQUN2RCxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRTt5QkFDakQsQ0FBQyxDQUFDO3FCQUNIO29CQUVELE9BQU8sQ0FBQyxJQUFJLENBQUM7d0JBQ1osS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLHdCQUF3QixDQUFDO3dCQUN4RCxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO3FCQUNyQyxDQUFDLENBQUM7b0JBRUgsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFO3dCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDOzRCQUNaLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUM7NEJBQzlDLEdBQUcsRUFBRSxHQUFHLEVBQUU7Z0NBQ1QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQ0FDcEQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBYyxDQUFDLENBQUM7b0NBQ25ELGFBQWEsQ0FBQyxJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztnQ0FDOUQsQ0FBQyxDQUFDLENBQUM7NEJBQ0osQ0FBQzt5QkFDRCxDQUFDLENBQUM7cUJBQ0g7b0JBRUQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyx1QkFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLDJFQUEyRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7aUJBQy9LO2FBQ0Q7UUFDRixDQUFDO1FBRU8sZ0NBQWdDLENBQUMsSUFBWSxFQUFFLE1BQXFCLEVBQUUsbUJBQTBDO1lBYXZILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQTRELG9CQUFvQixFQUFFO2dCQUNsSCxJQUFJO2dCQUNKLE1BQU07Z0JBQ04sWUFBWSxFQUFFLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7YUFDbkQsQ0FBQyxDQUFDO1lBRUgsS0FBSyxNQUFNLFdBQVcsSUFBSSxtQkFBbUIsRUFBRTtnQkFhOUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBOEUsNkJBQTZCLEVBQUU7b0JBQzdJLElBQUk7b0JBQ0osTUFBTTtvQkFDTixXQUFXLEVBQUUsV0FBVyxDQUFDLEtBQUs7aUJBQzlCLENBQUMsQ0FBQzthQUNIO1FBQ0YsQ0FBQztRQUVELFdBQVc7UUFFRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsZUFBdUI7WUFFeEQsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hELElBQUksa0JBQWtCLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzlCLDRFQUE0RTtnQkFDNUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFBLG9DQUFzQixFQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUMvRCxPQUFPO29CQUNOLFNBQVMsRUFBRTt3QkFDVixTQUFTLEVBQUUsZUFBZTt3QkFDMUIsU0FBUyxFQUFFOzRCQUNWLElBQUksd0NBQWdDOzRCQUNwQyxJQUFJOzRCQUNKLElBQUk7eUJBQ0o7d0JBQ0QsZUFBZSxFQUFFLFNBQVM7cUJBQzFCO2lCQUNELENBQUM7YUFDRjtZQUVELE9BQU8sSUFBSSxDQUFDLGlDQUFpQyx5Q0FBaUMsZUFBZSxDQUFDLENBQUM7UUFDaEcsQ0FBQztRQUVPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxlQUF1QixFQUFFLEdBQVE7WUFFL0QsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hELElBQUksa0JBQWtCLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzlCLHlDQUF5QztnQkFDekMsT0FBTyxHQUFHLENBQUM7YUFDWDtZQUVELE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDLHlCQUF5Qix3Q0FBZ0MsQ0FBQztZQUNsRyxJQUFJLDBCQUEwQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzVDLG1DQUFtQztnQkFDbkMsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2FBQ2hEO1lBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU1SCxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtnQkFDN0IsSUFBSSxNQUFNLEVBQUU7b0JBQ1gsT0FBTyxNQUFNLENBQUM7aUJBQ2Q7YUFDRDtZQUVELCtGQUErRjtZQUMvRixNQUFNLElBQUksS0FBSyxDQUFDLHlFQUF5RSxJQUFBLGtEQUF3QixFQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2SSxDQUFDO1FBRVMsS0FBSyxDQUFDLGtCQUFrQjtZQUNqQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUVqRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDO1lBRWpFLElBQUksU0FBUyxHQUFtQyxJQUFJLENBQUM7WUFDckQsSUFBSSxnQkFBZ0IsR0FBNEIsRUFBRSxDQUFDO1lBRW5ELElBQUksZUFBZSxFQUFFO2dCQUVwQixJQUFJLENBQUMsK0JBQStCLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO29CQUMzRSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxZQUFZLElBQUksR0FBRyxDQUFDLFNBQVMsS0FBSyxlQUFlLEVBQUU7d0JBQzdFLG1GQUFtRjt3QkFDbkYsT0FBTyxHQUFHLENBQUM7cUJBQ1g7b0JBQ0QsV0FBVyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsSUFBQSxrREFBd0IsRUFBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzFGLElBQUksZUFBSSxFQUFFO3dCQUNULElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxJQUFBLGtEQUF3QixFQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDaEg7b0JBQ0QsSUFBSTt3QkFDSCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7cUJBQ25EOzRCQUFTO3dCQUNULFdBQVcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLElBQUEsa0RBQXdCLEVBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUN6RixJQUFJLGVBQUksRUFBRTs0QkFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQywwQ0FBMEMsSUFBQSxrREFBd0IsRUFBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQzlHO3FCQUNEO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksZUFBSSxFQUFFO29CQUNULElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLDJFQUEyRSxDQUFDLENBQUM7aUJBQ25HO2dCQUVELHFHQUFxRztnQkFDckcsbUdBQW1HO2dCQUNuRyx3REFBd0Q7Z0JBQ3hELE1BQU0sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLGlCQUFpQixDQUFDO2dCQUU5RCxJQUFJLGVBQUksRUFBRTtvQkFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDO2lCQUNqRztnQkFFRCxJQUFJLGNBQThCLENBQUM7Z0JBQ25DLElBQUk7b0JBQ0gsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUN0RTtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDYixJQUFJLHNEQUE0QixDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUN4RCxHQUFHLENBQUMsU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxDQUFDO3FCQUNuRTt5QkFBTTt3QkFDTixJQUFJLHNEQUE0QixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTs0QkFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO3lCQUN2RTtxQkFDRDtvQkFDRCxJQUFJLENBQUMsK0JBQStCLENBQUMsMEJBQTBCLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUV0Rix3Q0FBd0M7b0JBQ3hDLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7aUJBQ3ZDO2dCQUVELDZCQUE2QjtnQkFDN0IsSUFBSSxDQUFDLCtCQUErQixDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM3RyxJQUFJLENBQUMsc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBRW5GLHVCQUF1QjtnQkFDdkIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUM1RCxJQUFJLFVBQVUsRUFBRTtvQkFDZixVQUFVLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUN2QyxJQUFJLENBQUMsQ0FBQyxJQUFJLHlEQUFpRCxFQUFFOzRCQUM1RCxJQUFJLENBQUMsK0JBQStCLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLENBQUM7eUJBQzlFO29CQUNGLENBQUMsQ0FBQyxDQUFDO29CQUNILFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQztpQkFDL0Q7Z0JBRUQsK0JBQStCO2dCQUMvQixDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztvQkFDakQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRTtvQkFDekMsSUFBSSxDQUFDLCtCQUErQixDQUFDLGNBQWMsRUFBRTtpQkFDckQsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQ2YsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSx1QkFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxvQ0FBb0MsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDckosd0NBQXdDO29CQUN4QyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2lCQUN2QztnQkFFRCxJQUFBLHdDQUE4QixFQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyx3Q0FBZ0MsQ0FBQyxtQ0FBMkIsQ0FBQyxDQUFDO2FBQ3JIO2lCQUFNO2dCQUVOLElBQUksQ0FBQywrQkFBK0IsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUVsRjtZQUVELE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVPLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxtQkFBNEMsRUFBRTtZQUNwRixzRUFBc0U7WUFDdEUsd0VBQXdFO1lBQ3hFLE1BQU0sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLHlCQUF5QixDQUFDO1lBRXRFLE9BQU8sSUFBSSw2Q0FBa0IsQ0FBQyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLGdCQUFnQixFQUFFLG1CQUFtQixDQUFBLElBQUksRUFBRSx5Q0FBeUMsQ0FBQSxLQUFLLENBQUMsQ0FBQztRQUNoSyxDQUFDO1FBRVMsb0JBQW9CLENBQUMsSUFBWTtZQUMxQyx3REFBd0Q7WUFDeEQsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFFN0IseUZBQXlGO1lBQ3pGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM1RCxVQUFVLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFFdEIsSUFBSSxJQUFBLDhDQUF3QixFQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLHlCQUF5QixFQUFFO2dCQUNqRiwyREFBMkQ7Z0JBQzNELElBQUksZUFBSSxFQUFFO29CQUNULElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGdEQUFnRCxJQUFJLEdBQUcsQ0FBQyxDQUFDO2lCQUMvRTtnQkFDRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25DO2lCQUFNO2dCQUNOLDRHQUE0RztnQkFDNUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQ3RDO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxlQUF1QjtZQUMzRCxNQUFNLFVBQVUsR0FBRyxJQUFBLDJCQUFhLEVBQUMsZUFBZSxDQUFDLENBQUM7WUFDbEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlFLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3BCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxNQUFNLGFBQWEsR0FBRyxDQUFDLFlBQTZDLEVBQUUsRUFBRTtnQkFDdkU7Ozs7OztrQkFNRTtnQkFDRixJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLHNDQUFzQyxFQUFFLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7WUFDOUgsQ0FBQyxDQUFDO1lBRUYsTUFBTSxtQkFBbUIsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDO1lBQ3ZELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDM0QsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0YsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLElBQUEsNkNBQWtCLEVBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsMkJBQTJCLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUFFO29CQUM5RixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLHVFQUF1RSxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDckosSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyx1QkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQ3RELENBQUM7NEJBQ0EsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLG1CQUFtQixDQUFDOzRCQUNsRCxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0NBQ2YsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUN4QixNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFBLHdCQUFXLEVBQUMsU0FBUyxDQUFDLENBQUMsMENBQWtDLENBQUM7Z0NBQ2hILE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs0QkFDbEMsQ0FBQzt5QkFDRCxDQUFDLEVBQ0Y7d0JBQ0MsTUFBTSxFQUFFLElBQUk7d0JBQ1osUUFBUSxFQUFFLG1DQUFvQixDQUFDLE1BQU07cUJBQ3JDLENBQ0QsQ0FBQztpQkFDRjthQUNEO2lCQUFNO2dCQUNOLHlEQUF5RDtnQkFDekQsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSwrRkFBK0YsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzlLLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsdUJBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUN0RCxDQUFDO3dCQUNBLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQzt3QkFDcEQsR0FBRyxFQUFFLEtBQUssSUFBSSxFQUFFOzRCQUNmLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDekIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNwSSxJQUFJLGdCQUFnQixFQUFFO2dDQUNyQixNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dDQUM1RSxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7NkJBQ2pDO2lDQUFNO2dDQUNOLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7NkJBQzdHO3dCQUVGLENBQUM7cUJBQ0QsQ0FBQyxFQUNGO29CQUNDLE1BQU0sRUFBRSxJQUFJO29CQUNaLFFBQVEsRUFBRSxtQ0FBb0IsQ0FBQyxNQUFNO29CQUNyQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztpQkFDdkMsQ0FDRCxDQUFDO2FBRUY7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FDRCxDQUFBO0lBdmNZLHdEQUFzQjtxQ0FBdEIsc0JBQXNCO1FBTWhDLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxtQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLGlEQUE0QixDQUFBO1FBQzVCLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSwwREFBb0MsQ0FBQTtRQUNwQyxXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLGdDQUFlLENBQUE7UUFDZixXQUFBLDBEQUFvQyxDQUFBO1FBQ3BDLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixZQUFBLHdFQUFtQyxDQUFBO1FBQ25DLFlBQUEsaUJBQVcsQ0FBQTtRQUNYLFlBQUEsd0NBQW1CLENBQUE7UUFDbkIsWUFBQSx5REFBK0IsQ0FBQTtRQUMvQixZQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFlBQUEseURBQStCLENBQUE7UUFDL0IsWUFBQSwyQkFBa0IsQ0FBQTtRQUNsQixZQUFBLG1CQUFZLENBQUE7UUFDWixZQUFBLDhDQUFzQixDQUFBO1FBQ3RCLFlBQUEsOENBQXdCLENBQUE7UUFDeEIsWUFBQSxpREFBZ0MsQ0FBQTtRQUNoQyxZQUFBLHdCQUFjLENBQUE7T0EzQkosc0JBQXNCLENBdWNsQztJQUVELElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTBCO1FBSS9CLFlBQ2tCLHNCQUE2QyxFQUM3QyxpQkFBeUMsRUFDekMsc0NBQTJGLEVBQ3BFLHFCQUE0QyxFQUN0RCxrQkFBZ0QsRUFDdkIsMkJBQWlFLEVBQ2pHLG9CQUEyQyxFQUM1QixtQkFBd0MsRUFDNUIsK0JBQWdFLEVBQ3BGLFdBQXdCO1lBVHJDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBdUI7WUFDN0Msc0JBQWlCLEdBQWpCLGlCQUFpQixDQUF3QjtZQUN6QywyQ0FBc0MsR0FBdEMsc0NBQXNDLENBQXFEO1lBQ3BFLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFFN0IsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUFzQztZQUVsRix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQzVCLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBaUM7WUFDcEYsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFFdEQsSUFBSSxDQUFDLDJCQUEyQixHQUFHLHdDQUF3QyxDQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDdkgsQ0FBQztRQUVNLG1CQUFtQixDQUFDLGdCQUFpRCxFQUFFLGVBQXlDLEVBQUUsY0FBdUI7WUFDL0ksUUFBUSxlQUFlLENBQUMsSUFBSSxFQUFFO2dCQUM3QiwyQ0FBbUMsQ0FBQyxDQUFDO29CQUNwQyxNQUFNLE9BQU8sR0FBRyxDQUNmLGNBQWM7d0JBQ2IsQ0FBQzt3QkFDRCxDQUFDLDRDQUFvQyxDQUN0QyxDQUFDO29CQUNGLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQywyREFBK0IsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztpQkFDbE47Z0JBQ0QsNkNBQXFDLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxJQUFJLENBQUMsMkJBQTJCLHFEQUE2QyxFQUFFO3dCQUNsRixNQUFNLE9BQU8sR0FBRyxDQUNmLGNBQWM7NEJBQ2IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDJCQUEyQixpREFBeUMsQ0FBQyxDQUFDLG1DQUEyQixDQUFDLDhDQUFzQyxDQUFDOzRCQUNqSixDQUFDLDRDQUFvQyxDQUN0QyxDQUFDO3dCQUNGLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQywrQ0FBc0IsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO3FCQUN0TDtvQkFDRCxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFDRCxxQ0FBNkIsQ0FBQyxDQUFDO29CQUM5QixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDdkUsSUFBSSxxQkFBcUIsRUFBRTt3QkFDMUIsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLHlDQUFtQixFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsc0NBQXNDLENBQUMsZ0JBQWdCLEVBQUUscUJBQXFCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztxQkFDN0w7b0JBQ0QsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtRQUNGLENBQUM7UUFFTyw0Q0FBNEMsQ0FBQyxnQkFBaUQsRUFBRSxjQUF1QixFQUFFLHNCQUFtRDtZQUNuTCxPQUFPO2dCQUNOLFdBQVcsRUFBRSxLQUFLLElBQWlELEVBQUU7b0JBQ3BFLElBQUksY0FBYyxFQUFFO3dCQUNuQix5RUFBeUU7d0JBQ3pFLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUM7d0JBQ3pFLElBQUksZUFBSSxFQUFFOzRCQUNULElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLDhGQUE4RixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7eUJBQ3BMO3dCQUVELE1BQU0sZUFBZSxHQUFHLElBQUEscURBQTBCLEVBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLGlCQUFpQixFQUFFLDRCQUE0QixDQUFBLElBQUksQ0FBQyxDQUFDO3dCQUN6TCxJQUFJLGVBQUksRUFBRTs0QkFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyw0RkFBNEYsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt5QkFDaEw7d0JBRUQsTUFBTSxlQUFlLEdBQUcsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsZUFBZSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDNUYsTUFBTSxZQUFZLEdBQUcsSUFBQSw2REFBMkIsRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO3dCQUM1SixNQUFNLFVBQVUsR0FBRyxJQUFJLG9DQUF1QixDQUFDLENBQUMsRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUN4SCxJQUFJLGVBQUksRUFBRTs0QkFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyx5RkFBeUYsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt5QkFDMUs7d0JBQ0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDO3FCQUN0Qjt5QkFBTTt3QkFDTixlQUFlO3dCQUNmLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLHNDQUFzQyxFQUFFLENBQUM7d0JBQ3JFLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsc0JBQXNCLENBQUMsQ0FBQzt3QkFDM0csTUFBTSxVQUFVLEdBQUcsSUFBSSxvQ0FBdUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUM3SSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUM7cUJBQ3RCO2dCQUNGLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVPLHlDQUF5QyxDQUFDLGdCQUFpRCxFQUFFLHNCQUFxRDtZQUN6SixPQUFPO2dCQUNOLFdBQVcsRUFBRSxLQUFLLElBQThDLEVBQUU7b0JBQ2pFLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLHNDQUFzQyxFQUFFLENBQUM7b0JBQ3JFLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztvQkFDM0csTUFBTSxVQUFVLEdBQUcsSUFBSSxvQ0FBdUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUM3SSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVPLHNDQUFzQyxDQUFDLGdCQUFpRCxFQUFFLGVBQXVCO1lBQ3hILE9BQU87Z0JBQ04sZUFBZSxFQUFFLGVBQWU7Z0JBQ2hDLFdBQVcsRUFBRSxLQUFLLElBQTJDLEVBQUU7b0JBQzlELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLHNDQUFzQyxFQUFFLENBQUM7b0JBRXJFLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUNsRSxJQUFJLENBQUMsU0FBUyxFQUFFO3dCQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELENBQUMsQ0FBQztxQkFDdkU7b0JBRUQsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLFVBQVUsbUNBQTJCLENBQUM7b0JBQy9HLE1BQU0sVUFBVSxHQUFHLElBQUksb0NBQXVCLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFFN0ksT0FBTzt3QkFDTixjQUFjLEVBQUUsSUFBSSxDQUFDLCtCQUErQixDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQzt3QkFDdkYsR0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFHO3dCQUNsQixPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU87d0JBQzFCLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxxQkFBcUI7d0JBQ3RELGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxpQkFBaUI7d0JBQzlDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxvQkFBb0I7d0JBQ3BELFVBQVU7cUJBQ1YsQ0FBQztnQkFDSCxDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBeEhLLDBCQUEwQjtRQVE3QixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsaURBQTRCLENBQUE7UUFDNUIsV0FBQSwwREFBb0MsQ0FBQTtRQUNwQyxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsd0NBQW1CLENBQUE7UUFDbkIsV0FBQSx5REFBK0IsQ0FBQTtRQUMvQixXQUFBLGlCQUFXLENBQUE7T0FkUiwwQkFBMEIsQ0F3SC9CO0lBRUQsU0FBUyx3Q0FBd0MsQ0FBQyxrQkFBZ0QsRUFBRSxvQkFBMkM7UUFDOUksSUFBSSxrQkFBa0IsQ0FBQyxzQkFBc0IsSUFBSSxrQkFBa0IsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDckgscURBQTZDO1NBQzdDO2FBQU07WUFDTixNQUFNLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQThCLG1DQUFzQixDQUFDLENBQUM7WUFDbEcsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO2dCQUNwQixxREFBNkM7YUFDN0M7aUJBQU0sSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO2dCQUM3QixvREFBNEM7YUFDNUM7aUJBQU07Z0JBQ04sd0RBQWdEO2FBQ2hEO1NBQ0Q7SUFDRixDQUFDO0lBRUQsSUFBVywrQkFJVjtJQUpELFdBQVcsK0JBQStCO1FBQ3pDLDZGQUFZLENBQUE7UUFDWix1RkFBUyxDQUFBO1FBQ1QscUZBQVEsQ0FBQTtJQUNULENBQUMsRUFKVSwrQkFBK0IsS0FBL0IsK0JBQStCLFFBSXpDO0lBRU0sSUFBTSw2QkFBNkIscUNBQW5DLE1BQU0sNkJBQTZCO1FBS3pDLFlBQytCLGtCQUFnRCxFQUN2RCxvQkFBMkMsRUFDcEMsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFFdEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNyRSxNQUFNLDBCQUEwQixHQUFHLHdDQUF3QyxDQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDdEgsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsMEJBQTBCLHFEQUE2QyxDQUFDLENBQUM7UUFDdkcsQ0FBQztRQUVNLHFCQUFxQixDQUFDLFdBQWdDLEVBQUUsY0FBK0IsRUFBRSxrQkFBMkIsRUFBRSxtQkFBNEIsRUFBRSxVQUFzQztZQUNoTSxNQUFNLE1BQU0sR0FBRywrQkFBNkIsQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUMzTCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsV0FBVyxDQUFDLEtBQUssdUJBQXVCLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixrQkFBa0IsMEJBQTBCLG1CQUFtQixpQkFBaUIsSUFBQSxzREFBa0MsRUFBQyxVQUFVLENBQUMsT0FBTyxJQUFBLDZDQUF5QixFQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2VCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxNQUFNLENBQUMscUJBQXFCLENBQUMsY0FBK0IsRUFBRSxrQkFBMkIsRUFBRSxtQkFBNEIsRUFBRSxVQUFzQyxFQUFFLGdCQUF5QixFQUFFLG1CQUE0QjtZQUM5TixNQUFNLE1BQU0sR0FBd0IsRUFBRSxDQUFDO1lBQ3ZDLEtBQUssTUFBTSxhQUFhLElBQUksY0FBYyxFQUFFO2dCQUMzQyxJQUFJLGFBQWEsS0FBSyxJQUFJLElBQUksa0JBQWtCLEVBQUU7b0JBQ2pELHdDQUF3QztvQkFDeEMsSUFBSSxVQUFVLDRDQUFvQyxJQUFJLFVBQVUsNkNBQXFDLEVBQUU7d0JBQ3RHLDhDQUFzQztxQkFDdEM7eUJBQU07d0JBQ04sTUFBTSxDQUFDLElBQUksd0NBQWdDLENBQUM7cUJBQzVDO2lCQUNEO2dCQUNELElBQUksYUFBYSxLQUFLLFdBQVcsSUFBSSxtQkFBbUIsRUFBRTtvQkFDekQsZ0RBQWdEO29CQUNoRCxJQUFJLFVBQVUsNENBQW9DLElBQUksVUFBVSw4Q0FBc0MsRUFBRTt3QkFDdkcsd0NBQWdDO3FCQUNoQzt5QkFBTTt3QkFDTixNQUFNLENBQUMsSUFBSSxrQ0FBMEIsQ0FBQztxQkFDdEM7aUJBQ0Q7Z0JBQ0QsSUFBSSxhQUFhLEtBQUssV0FBVyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7b0JBQ3ZELDhEQUE4RDtvQkFDOUQsSUFBSSxVQUFVLDRDQUFvQyxJQUFJLFVBQVUsNkNBQXFDLEVBQUU7d0JBQ3RHLDhDQUFzQztxQkFDdEM7eUJBQU07d0JBQ04sTUFBTSxDQUFDLElBQUksd0NBQWdDLENBQUM7cUJBQzVDO2lCQUNEO2dCQUNELElBQUksYUFBYSxLQUFLLEtBQUssSUFBSSxrQkFBa0IsSUFBSSxtQkFBbUIsRUFBRTtvQkFDekUsZ0VBQWdFO29CQUNoRSxJQUFJLFVBQVUsNENBQW9DLElBQUksVUFBVSw2Q0FBcUMsRUFBRTt3QkFDdEcsZ0RBQXdDO3FCQUN4Qzt5QkFBTTt3QkFDTixNQUFNLENBQUMsSUFBSSwwQ0FBa0MsQ0FBQztxQkFDOUM7aUJBQ0Q7YUFDRDtZQUNELE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxDQUFDO0tBQ0QsQ0FBQTtJQTNEWSxzRUFBNkI7NENBQTdCLDZCQUE2QjtRQU12QyxXQUFBLGlEQUE0QixDQUFBO1FBQzVCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxpQkFBVyxDQUFBO09BUkQsNkJBQTZCLENBMkR6QztJQUVELE1BQU0sMEJBQTJCLFNBQVEsaUJBQU87UUFFL0M7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHVDQUF1QztnQkFDM0MsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsd0JBQXdCLENBQUMsRUFBRSxRQUFRLEVBQUUsd0JBQXdCLEVBQUU7Z0JBQ3BILFFBQVEsRUFBRSxtQ0FBVSxDQUFDLFNBQVM7Z0JBQzlCLEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFpQixDQUFDLENBQUM7WUFFekQsTUFBTSxPQUFPLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLGdEQUFnRCxDQUFDLENBQUMsQ0FBQztZQUN6SixJQUFJLE9BQU8sRUFBRTtnQkFDWixnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2FBQ3ZDO1FBQ0YsQ0FBQztLQUNEO0lBRUQsSUFBQSx5QkFBZSxFQUFDLDBCQUEwQixDQUFDLENBQUM7SUFFNUMsSUFBQSw4QkFBaUIsRUFBQyw4QkFBaUIsRUFBRSxzQkFBc0Isa0NBQTBCLENBQUMifQ==