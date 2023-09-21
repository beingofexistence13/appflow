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
define(["require", "exports", "vs/base/common/network", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/browser/log", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteExtensionsScanner", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/browser/webWorkerExtensionHost", "vs/workbench/services/extensions/browser/webWorkerFileSystemProvider", "vs/workbench/services/extensions/common/abstractExtensionService", "vs/workbench/services/extensions/common/extensionHostKind", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensionRunningLocationTracker", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsProposedApi", "vs/workbench/services/extensions/common/extensionsUtil", "vs/workbench/services/extensions/common/remoteExtensionHost", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/remote/common/remoteExplorerService", "vs/workbench/services/userData/browser/userDataInit", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, network_1, configuration_1, dialogs_1, files_1, extensions_1, instantiation_1, log_1, log_2, notification_1, productService_1, remoteAuthorityResolver_1, remoteExtensionsScanner_1, telemetry_1, workspace_1, workspaceTrust_1, environmentService_1, extensionManagement_1, webWorkerExtensionHost_1, webWorkerFileSystemProvider_1, abstractExtensionService_1, extensionHostKind_1, extensionManifestPropertiesService_1, extensionRunningLocationTracker_1, extensions_2, extensionsProposedApi_1, extensionsUtil_1, remoteExtensionHost_1, lifecycle_1, remoteAgentService_1, remoteExplorerService_1, userDataInit_1, userDataProfile_1) {
    "use strict";
    var BrowserExtensionHostKindPicker_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserExtensionHostKindPicker = exports.ExtensionService = void 0;
    let ExtensionService = class ExtensionService extends abstractExtensionService_1.AbstractExtensionService {
        constructor(instantiationService, notificationService, _browserEnvironmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, _webExtensionsScannerService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, _userDataInitializationService, _userDataProfileService, _workspaceTrustManagementService, _remoteExplorerService, dialogService) {
            const extensionsProposedApi = instantiationService.createInstance(extensionsProposedApi_1.ExtensionsProposedApi);
            const extensionHostFactory = new BrowserExtensionHostFactory(extensionsProposedApi, () => this._scanWebExtensions(), () => this._getExtensionRegistrySnapshotWhenReady(), instantiationService, remoteAgentService, remoteAuthorityResolverService, extensionEnablementService, logService);
            super(extensionsProposedApi, extensionHostFactory, new BrowserExtensionHostKindPicker(logService), instantiationService, notificationService, _browserEnvironmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, dialogService);
            this._browserEnvironmentService = _browserEnvironmentService;
            this._webExtensionsScannerService = _webExtensionsScannerService;
            this._userDataInitializationService = _userDataInitializationService;
            this._userDataProfileService = _userDataProfileService;
            this._workspaceTrustManagementService = _workspaceTrustManagementService;
            this._remoteExplorerService = _remoteExplorerService;
            // Initialize installed extensions first and do it only after workbench is ready
            lifecycleService.when(2 /* LifecyclePhase.Ready */).then(async () => {
                await this._userDataInitializationService.initializeInstalledExtensions(this._instantiationService);
                this._initialize();
            });
            this._initFetchFileSystem();
        }
        async _scanSingleExtension(extension) {
            if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                return this._remoteExtensionsScannerService.scanSingleExtension(extension.location, extension.type === 0 /* ExtensionType.System */);
            }
            const scannedExtension = await this._webExtensionsScannerService.scanExistingExtension(extension.location, extension.type, this._userDataProfileService.currentProfile.extensionsResource);
            if (scannedExtension) {
                return (0, extensions_2.toExtensionDescription)(scannedExtension);
            }
            return null;
        }
        _initFetchFileSystem() {
            const provider = new webWorkerFileSystemProvider_1.FetchFileSystemProvider();
            this._register(this._fileService.registerProvider(network_1.Schemas.http, provider));
            this._register(this._fileService.registerProvider(network_1.Schemas.https, provider));
        }
        async _scanWebExtensions() {
            const system = [], user = [], development = [];
            try {
                await Promise.all([
                    this._webExtensionsScannerService.scanSystemExtensions().then(extensions => system.push(...extensions.map(e => (0, extensions_2.toExtensionDescription)(e)))),
                    this._webExtensionsScannerService.scanUserExtensions(this._userDataProfileService.currentProfile.extensionsResource, { skipInvalidExtensions: true }).then(extensions => user.push(...extensions.map(e => (0, extensions_2.toExtensionDescription)(e)))),
                    this._webExtensionsScannerService.scanExtensionsUnderDevelopment().then(extensions => development.push(...extensions.map(e => (0, extensions_2.toExtensionDescription)(e, true))))
                ]);
            }
            catch (error) {
                this._logService.error(error);
            }
            return (0, extensionsUtil_1.dedupExtensions)(system, user, development, this._logService);
        }
        async _resolveExtensionsDefault() {
            const [localExtensions, remoteExtensions] = await Promise.all([
                this._scanWebExtensions(),
                this._remoteExtensionsScannerService.scanExtensions()
            ]);
            return new abstractExtensionService_1.ResolvedExtensions(localExtensions, remoteExtensions, /*hasLocalProcess*/ false, /*allowRemoteExtensionsInLocalWebWorker*/ true);
        }
        async _resolveExtensions() {
            if (!this._browserEnvironmentService.expectsResolverExtension) {
                return this._resolveExtensionsDefault();
            }
            const remoteAuthority = this._environmentService.remoteAuthority;
            // Now that the canonical URI provider has been registered, we need to wait for the trust state to be
            // calculated. The trust state will be used while resolving the authority, however the resolver can
            // override the trust state through the resolver result.
            await this._workspaceTrustManagementService.workspaceResolved;
            let resolverResult;
            try {
                resolverResult = await this._resolveAuthorityInitial(remoteAuthority);
            }
            catch (err) {
                if (remoteAuthorityResolver_1.RemoteAuthorityResolverError.isHandled(err)) {
                    console.log(`Error handled: Not showing a notification for the error`);
                }
                this._remoteAuthorityResolverService._setResolvedAuthorityError(remoteAuthority, err);
                // Proceed with the local extension host
                return this._resolveExtensionsDefault();
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
            return this._resolveExtensionsDefault();
        }
        async _onExtensionHostExit(code) {
            // Dispose everything associated with the extension host
            this._doStopExtensionHosts();
            // If we are running extension tests, forward logs and exit code
            const automatedWindow = window;
            if (typeof automatedWindow.codeAutomationExit === 'function') {
                automatedWindow.codeAutomationExit(code, await (0, log_1.getLogs)(this._fileService, this._environmentService));
            }
        }
        async _resolveAuthority(remoteAuthority) {
            return this._resolveAuthorityOnExtensionHosts(2 /* ExtensionHostKind.LocalWebWorker */, remoteAuthority);
        }
    };
    exports.ExtensionService = ExtensionService;
    exports.ExtensionService = ExtensionService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notification_1.INotificationService),
        __param(2, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(5, files_1.IFileService),
        __param(6, productService_1.IProductService),
        __param(7, extensionManagement_1.IWorkbenchExtensionManagementService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(11, extensionManagement_1.IWebExtensionsScannerService),
        __param(12, log_2.ILogService),
        __param(13, remoteAgentService_1.IRemoteAgentService),
        __param(14, remoteExtensionsScanner_1.IRemoteExtensionsScannerService),
        __param(15, lifecycle_1.ILifecycleService),
        __param(16, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(17, userDataInit_1.IUserDataInitializationService),
        __param(18, userDataProfile_1.IUserDataProfileService),
        __param(19, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(20, remoteExplorerService_1.IRemoteExplorerService),
        __param(21, dialogs_1.IDialogService)
    ], ExtensionService);
    let BrowserExtensionHostFactory = class BrowserExtensionHostFactory {
        constructor(_extensionsProposedApi, _scanWebExtensions, _getExtensionRegistrySnapshotWhenReady, _instantiationService, _remoteAgentService, _remoteAuthorityResolverService, _extensionEnablementService, _logService) {
            this._extensionsProposedApi = _extensionsProposedApi;
            this._scanWebExtensions = _scanWebExtensions;
            this._getExtensionRegistrySnapshotWhenReady = _getExtensionRegistrySnapshotWhenReady;
            this._instantiationService = _instantiationService;
            this._remoteAgentService = _remoteAgentService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._extensionEnablementService = _extensionEnablementService;
            this._logService = _logService;
        }
        createExtensionHost(runningLocations, runningLocation, isInitialStart) {
            switch (runningLocation.kind) {
                case 1 /* ExtensionHostKind.LocalProcess */: {
                    return null;
                }
                case 2 /* ExtensionHostKind.LocalWebWorker */: {
                    const startup = (isInitialStart
                        ? 2 /* ExtensionHostStartup.EagerManualStart */
                        : 1 /* ExtensionHostStartup.EagerAutoStart */);
                    return this._instantiationService.createInstance(webWorkerExtensionHost_1.WebWorkerExtensionHost, runningLocation, startup, this._createLocalExtensionHostDataProvider(runningLocations, runningLocation, isInitialStart));
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
        _createLocalExtensionHostDataProvider(runningLocations, desiredRunningLocation, isInitialStart) {
            return {
                getInitData: async () => {
                    if (isInitialStart) {
                        // Here we load even extensions that would be disabled by workspace trust
                        const localExtensions = (0, abstractExtensionService_1.checkEnabledAndProposedAPI)(this._logService, this._extensionEnablementService, this._extensionsProposedApi, await this._scanWebExtensions(), /* ignore workspace trust */ true);
                        const runningLocation = runningLocations.computeRunningLocation(localExtensions, [], false);
                        const myExtensions = (0, extensionRunningLocationTracker_1.filterExtensionDescriptions)(localExtensions, runningLocation, extRunningLocation => desiredRunningLocation.equals(extRunningLocation));
                        const extensions = new extensions_2.ExtensionHostExtensions(0, localExtensions, myExtensions.map(extension => extension.identifier));
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
    BrowserExtensionHostFactory = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, remoteAgentService_1.IRemoteAgentService),
        __param(5, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(6, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(7, log_2.ILogService)
    ], BrowserExtensionHostFactory);
    let BrowserExtensionHostKindPicker = BrowserExtensionHostKindPicker_1 = class BrowserExtensionHostKindPicker {
        constructor(_logService) {
            this._logService = _logService;
        }
        pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
            const result = BrowserExtensionHostKindPicker_1.pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference);
            this._logService.trace(`pickRunningLocation for ${extensionId.value}, extension kinds: [${extensionKinds.join(', ')}], isInstalledLocally: ${isInstalledLocally}, isInstalledRemotely: ${isInstalledRemotely}, preference: ${(0, extensionHostKind_1.extensionRunningPreferenceToString)(preference)} => ${(0, extensionHostKind_1.extensionHostKindToString)(result)}`);
            return result;
        }
        static pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
            const result = [];
            let canRunRemotely = false;
            for (const extensionKind of extensionKinds) {
                if (extensionKind === 'ui' && isInstalledRemotely) {
                    // ui extensions run remotely if possible (but only as a last resort)
                    if (preference === 2 /* ExtensionRunningPreference.Remote */) {
                        return 3 /* ExtensionHostKind.Remote */;
                    }
                    else {
                        canRunRemotely = true;
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
                if (extensionKind === 'web' && (isInstalledLocally || isInstalledRemotely)) {
                    // web worker extensions run in the local web worker if possible
                    if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 1 /* ExtensionRunningPreference.Local */) {
                        return 2 /* ExtensionHostKind.LocalWebWorker */;
                    }
                    else {
                        result.push(2 /* ExtensionHostKind.LocalWebWorker */);
                    }
                }
            }
            if (canRunRemotely) {
                result.push(3 /* ExtensionHostKind.Remote */);
            }
            return (result.length > 0 ? result[0] : null);
        }
    };
    exports.BrowserExtensionHostKindPicker = BrowserExtensionHostKindPicker;
    exports.BrowserExtensionHostKindPicker = BrowserExtensionHostKindPicker = BrowserExtensionHostKindPicker_1 = __decorate([
        __param(0, log_2.ILogService)
    ], BrowserExtensionHostKindPicker);
    (0, extensions_1.registerSingleton)(extensions_2.IExtensionService, ExtensionService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBd0N6RixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLG1EQUF3QjtRQUU3RCxZQUN3QixvQkFBMkMsRUFDNUMsbUJBQXlDLEVBQ1QsMEJBQStELEVBQ2xHLGdCQUFtQyxFQUNoQiwwQkFBZ0UsRUFDeEYsV0FBeUIsRUFDdEIsY0FBK0IsRUFDViwwQkFBZ0UsRUFDNUUsY0FBd0MsRUFDM0Msb0JBQTJDLEVBQzdCLGtDQUF1RSxFQUM3RCw0QkFBMEQsRUFDNUYsVUFBdUIsRUFDZixrQkFBdUMsRUFDM0IsOEJBQStELEVBQzdFLGdCQUFtQyxFQUNyQiw4QkFBK0QsRUFDL0MsOEJBQThELEVBQ3JFLHVCQUFnRCxFQUN2QyxnQ0FBa0UsRUFDNUUsc0JBQThDLEVBQ3ZFLGFBQTZCO1lBRTdDLE1BQU0scUJBQXFCLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDZDQUFxQixDQUFDLENBQUM7WUFDekYsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLDJCQUEyQixDQUMzRCxxQkFBcUIsRUFDckIsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQy9CLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsRUFBRSxFQUNuRCxvQkFBb0IsRUFDcEIsa0JBQWtCLEVBQ2xCLDhCQUE4QixFQUM5QiwwQkFBMEIsRUFDMUIsVUFBVSxDQUNWLENBQUM7WUFDRixLQUFLLENBQ0oscUJBQXFCLEVBQ3JCLG9CQUFvQixFQUNwQixJQUFJLDhCQUE4QixDQUFDLFVBQVUsQ0FBQyxFQUM5QyxvQkFBb0IsRUFDcEIsbUJBQW1CLEVBQ25CLDBCQUEwQixFQUMxQixnQkFBZ0IsRUFDaEIsMEJBQTBCLEVBQzFCLFdBQVcsRUFDWCxjQUFjLEVBQ2QsMEJBQTBCLEVBQzFCLGNBQWMsRUFDZCxvQkFBb0IsRUFDcEIsa0NBQWtDLEVBQ2xDLFVBQVUsRUFDVixrQkFBa0IsRUFDbEIsOEJBQThCLEVBQzlCLGdCQUFnQixFQUNoQiw4QkFBOEIsRUFDOUIsYUFBYSxDQUNiLENBQUM7WUFyRG9ELCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBcUM7WUFTdEUsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUE4QjtZQU14RCxtQ0FBOEIsR0FBOUIsOEJBQThCLENBQWdDO1lBQ3JFLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7WUFDdkMscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFrQztZQUM1RSwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1lBcUN2RixnRkFBZ0Y7WUFDaEYsZ0JBQWdCLENBQUMsSUFBSSw4QkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQzNELE1BQU0sSUFBSSxDQUFDLDhCQUE4QixDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUNwRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRVMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFNBQXFCO1lBQ3pELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZELE9BQU8sSUFBSSxDQUFDLCtCQUErQixDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLElBQUksaUNBQXlCLENBQUMsQ0FBQzthQUM3SDtZQUVELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUMzTCxJQUFJLGdCQUFnQixFQUFFO2dCQUNyQixPQUFPLElBQUEsbUNBQXNCLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUNoRDtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVPLG9CQUFvQjtZQUMzQixNQUFNLFFBQVEsR0FBRyxJQUFJLHFEQUF1QixFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLGlCQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLGlCQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVPLEtBQUssQ0FBQyxrQkFBa0I7WUFDL0IsTUFBTSxNQUFNLEdBQTRCLEVBQUUsRUFBRSxJQUFJLEdBQTRCLEVBQUUsRUFBRSxXQUFXLEdBQTRCLEVBQUUsQ0FBQztZQUMxSCxJQUFJO2dCQUNILE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztvQkFDakIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLG9CQUFvQixFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFBLG1DQUFzQixFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0ksSUFBSSxDQUFDLDRCQUE0QixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSxtQ0FBc0IsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyw4QkFBOEIsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSxtQ0FBc0IsRUFBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNoSyxDQUFDLENBQUM7YUFDSDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzlCO1lBQ0QsT0FBTyxJQUFBLGdDQUFlLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFUyxLQUFLLENBQUMseUJBQXlCO1lBQ3hDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQzdELElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDekIsSUFBSSxDQUFDLCtCQUErQixDQUFDLGNBQWMsRUFBRTthQUNyRCxDQUFDLENBQUM7WUFFSCxPQUFPLElBQUksNkNBQWtCLENBQUMsZUFBZSxFQUFFLGdCQUFnQixFQUFFLG1CQUFtQixDQUFBLEtBQUssRUFBRSx5Q0FBeUMsQ0FBQSxJQUFJLENBQUMsQ0FBQztRQUMzSSxDQUFDO1FBRVMsS0FBSyxDQUFDLGtCQUFrQjtZQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLHdCQUF3QixFQUFFO2dCQUM5RCxPQUFPLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2FBQ3hDO1lBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWdCLENBQUM7WUFFbEUscUdBQXFHO1lBQ3JHLG1HQUFtRztZQUNuRyx3REFBd0Q7WUFDeEQsTUFBTSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsaUJBQWlCLENBQUM7WUFHOUQsSUFBSSxjQUE4QixDQUFDO1lBQ25DLElBQUk7Z0JBQ0gsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQ3RFO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsSUFBSSxzREFBNEIsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMseURBQXlELENBQUMsQ0FBQztpQkFDdkU7Z0JBQ0QsSUFBSSxDQUFDLCtCQUErQixDQUFDLDBCQUEwQixDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFFdEYsd0NBQXdDO2dCQUN4QyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2FBQ3hDO1lBRUQsNkJBQTZCO1lBQzdCLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RyxJQUFJLENBQUMsc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFbkYsdUJBQXVCO1lBQ3ZCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM1RCxJQUFJLFVBQVUsRUFBRTtnQkFDZixVQUFVLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN2QyxJQUFJLENBQUMsQ0FBQyxJQUFJLHlEQUFpRCxFQUFFO3dCQUM1RCxJQUFJLENBQUMsK0JBQStCLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLENBQUM7cUJBQzlFO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2dCQUNILFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQzthQUMvRDtZQUVELE9BQU8sSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDekMsQ0FBQztRQUVTLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFZO1lBQ2hELHdEQUF3RDtZQUN4RCxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUU3QixnRUFBZ0U7WUFDaEUsTUFBTSxlQUFlLEdBQUcsTUFBcUMsQ0FBQztZQUM5RCxJQUFJLE9BQU8sZUFBZSxDQUFDLGtCQUFrQixLQUFLLFVBQVUsRUFBRTtnQkFDN0QsZUFBZSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxNQUFNLElBQUEsYUFBTyxFQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQzthQUNyRztRQUNGLENBQUM7UUFFUyxLQUFLLENBQUMsaUJBQWlCLENBQUMsZUFBdUI7WUFDeEQsT0FBTyxJQUFJLENBQUMsaUNBQWlDLDJDQUFtQyxlQUFlLENBQUMsQ0FBQztRQUNsRyxDQUFDO0tBQ0QsQ0FBQTtJQXpLWSw0Q0FBZ0I7K0JBQWhCLGdCQUFnQjtRQUcxQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsbUNBQW9CLENBQUE7UUFDcEIsV0FBQSx3REFBbUMsQ0FBQTtRQUNuQyxXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsMERBQW9DLENBQUE7UUFDcEMsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxnQ0FBZSxDQUFBO1FBQ2YsV0FBQSwwREFBb0MsQ0FBQTtRQUNwQyxXQUFBLG9DQUF3QixDQUFBO1FBQ3hCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsWUFBQSx3RUFBbUMsQ0FBQTtRQUNuQyxZQUFBLGtEQUE0QixDQUFBO1FBQzVCLFlBQUEsaUJBQVcsQ0FBQTtRQUNYLFlBQUEsd0NBQW1CLENBQUE7UUFDbkIsWUFBQSx5REFBK0IsQ0FBQTtRQUMvQixZQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFlBQUEseURBQStCLENBQUE7UUFDL0IsWUFBQSw2Q0FBOEIsQ0FBQTtRQUM5QixZQUFBLHlDQUF1QixDQUFBO1FBQ3ZCLFlBQUEsaURBQWdDLENBQUE7UUFDaEMsWUFBQSw4Q0FBc0IsQ0FBQTtRQUN0QixZQUFBLHdCQUFjLENBQUE7T0F4QkosZ0JBQWdCLENBeUs1QjtJQUVELElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTJCO1FBRWhDLFlBQ2tCLHNCQUE2QyxFQUM3QyxrQkFBMEQsRUFDMUQsc0NBQTJGLEVBQ3BFLHFCQUE0QyxFQUM5QyxtQkFBd0MsRUFDNUIsK0JBQWdFLEVBQzNELDJCQUFpRSxFQUMxRixXQUF3QjtZQVByQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXVCO1lBQzdDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBd0M7WUFDMUQsMkNBQXNDLEdBQXRDLHNDQUFzQyxDQUFxRDtZQUNwRSwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzlDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDNUIsb0NBQStCLEdBQS9CLCtCQUErQixDQUFpQztZQUMzRCxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQXNDO1lBQzFGLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ25ELENBQUM7UUFFTCxtQkFBbUIsQ0FBQyxnQkFBaUQsRUFBRSxlQUF5QyxFQUFFLGNBQXVCO1lBQ3hJLFFBQVEsZUFBZSxDQUFDLElBQUksRUFBRTtnQkFDN0IsMkNBQW1DLENBQUMsQ0FBQztvQkFDcEMsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBQ0QsNkNBQXFDLENBQUMsQ0FBQztvQkFDdEMsTUFBTSxPQUFPLEdBQUcsQ0FDZixjQUFjO3dCQUNiLENBQUM7d0JBQ0QsQ0FBQyw0Q0FBb0MsQ0FDdEMsQ0FBQztvQkFDRixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsK0NBQXNCLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMscUNBQXFDLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7aUJBQ2xNO2dCQUNELHFDQUE2QixDQUFDLENBQUM7b0JBQzlCLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUN2RSxJQUFJLHFCQUFxQixFQUFFO3dCQUMxQixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMseUNBQW1CLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxnQkFBZ0IsRUFBRSxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO3FCQUM3TDtvQkFDRCxPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1FBQ0YsQ0FBQztRQUVPLHFDQUFxQyxDQUFDLGdCQUFpRCxFQUFFLHNCQUFnRCxFQUFFLGNBQXVCO1lBQ3pLLE9BQU87Z0JBQ04sV0FBVyxFQUFFLEtBQUssSUFBOEMsRUFBRTtvQkFDakUsSUFBSSxjQUFjLEVBQUU7d0JBQ25CLHlFQUF5RTt3QkFDekUsTUFBTSxlQUFlLEdBQUcsSUFBQSxxREFBMEIsRUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSw0QkFBNEIsQ0FBQSxJQUFJLENBQUMsQ0FBQzt3QkFDdk0sTUFBTSxlQUFlLEdBQUcsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsZUFBZSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDNUYsTUFBTSxZQUFZLEdBQUcsSUFBQSw2REFBMkIsRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO3dCQUM1SixNQUFNLFVBQVUsR0FBRyxJQUFJLG9DQUF1QixDQUFDLENBQUMsRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUN4SCxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUM7cUJBQ3RCO3lCQUFNO3dCQUNOLGVBQWU7d0JBQ2YsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsc0NBQXNDLEVBQUUsQ0FBQzt3QkFDckUsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO3dCQUMzRyxNQUFNLFVBQVUsR0FBRyxJQUFJLG9DQUF1QixDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQzdJLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQztxQkFDdEI7Z0JBQ0YsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO1FBRU8sc0NBQXNDLENBQUMsZ0JBQWlELEVBQUUsZUFBdUI7WUFDeEgsT0FBTztnQkFDTixlQUFlLEVBQUUsZUFBZTtnQkFDaEMsV0FBVyxFQUFFLEtBQUssSUFBMkMsRUFBRTtvQkFDOUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsc0NBQXNDLEVBQUUsQ0FBQztvQkFFckUsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ2xFLElBQUksQ0FBQyxTQUFTLEVBQUU7d0JBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO3FCQUN2RTtvQkFFRCxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsVUFBVSxtQ0FBMkIsQ0FBQztvQkFDL0csTUFBTSxVQUFVLEdBQUcsSUFBSSxvQ0FBdUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUU3SSxPQUFPO3dCQUNOLGNBQWMsRUFBRSxJQUFJLENBQUMsK0JBQStCLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDO3dCQUN2RixHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUc7d0JBQ2xCLE9BQU8sRUFBRSxTQUFTLENBQUMsT0FBTzt3QkFDMUIscUJBQXFCLEVBQUUsU0FBUyxDQUFDLHFCQUFxQjt3QkFDdEQsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLGlCQUFpQjt3QkFDOUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLG9CQUFvQjt3QkFDcEQsVUFBVTtxQkFDVixDQUFDO2dCQUNILENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztLQUNELENBQUE7SUFuRkssMkJBQTJCO1FBTTlCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSx3Q0FBbUIsQ0FBQTtRQUNuQixXQUFBLHlEQUErQixDQUFBO1FBQy9CLFdBQUEsMERBQW9DLENBQUE7UUFDcEMsV0FBQSxpQkFBVyxDQUFBO09BVlIsMkJBQTJCLENBbUZoQztJQUVNLElBQU0sOEJBQThCLHNDQUFwQyxNQUFNLDhCQUE4QjtRQUUxQyxZQUMrQixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUNuRCxDQUFDO1FBRUwscUJBQXFCLENBQUMsV0FBZ0MsRUFBRSxjQUErQixFQUFFLGtCQUEyQixFQUFFLG1CQUE0QixFQUFFLFVBQXNDO1lBQ3pMLE1BQU0sTUFBTSxHQUFHLGdDQUE4QixDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN2SSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsV0FBVyxDQUFDLEtBQUssdUJBQXVCLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixrQkFBa0IsMEJBQTBCLG1CQUFtQixpQkFBaUIsSUFBQSxzREFBa0MsRUFBQyxVQUFVLENBQUMsT0FBTyxJQUFBLDZDQUF5QixFQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2VCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxNQUFNLENBQUMsbUJBQW1CLENBQUMsY0FBK0IsRUFBRSxrQkFBMkIsRUFBRSxtQkFBNEIsRUFBRSxVQUFzQztZQUNuSyxNQUFNLE1BQU0sR0FBd0IsRUFBRSxDQUFDO1lBQ3ZDLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztZQUMzQixLQUFLLE1BQU0sYUFBYSxJQUFJLGNBQWMsRUFBRTtnQkFDM0MsSUFBSSxhQUFhLEtBQUssSUFBSSxJQUFJLG1CQUFtQixFQUFFO29CQUNsRCxxRUFBcUU7b0JBQ3JFLElBQUksVUFBVSw4Q0FBc0MsRUFBRTt3QkFDckQsd0NBQWdDO3FCQUNoQzt5QkFBTTt3QkFDTixjQUFjLEdBQUcsSUFBSSxDQUFDO3FCQUN0QjtpQkFDRDtnQkFDRCxJQUFJLGFBQWEsS0FBSyxXQUFXLElBQUksbUJBQW1CLEVBQUU7b0JBQ3pELGdEQUFnRDtvQkFDaEQsSUFBSSxVQUFVLDRDQUFvQyxJQUFJLFVBQVUsOENBQXNDLEVBQUU7d0JBQ3ZHLHdDQUFnQztxQkFDaEM7eUJBQU07d0JBQ04sTUFBTSxDQUFDLElBQUksa0NBQTBCLENBQUM7cUJBQ3RDO2lCQUNEO2dCQUNELElBQUksYUFBYSxLQUFLLEtBQUssSUFBSSxDQUFDLGtCQUFrQixJQUFJLG1CQUFtQixDQUFDLEVBQUU7b0JBQzNFLGdFQUFnRTtvQkFDaEUsSUFBSSxVQUFVLDRDQUFvQyxJQUFJLFVBQVUsNkNBQXFDLEVBQUU7d0JBQ3RHLGdEQUF3QztxQkFDeEM7eUJBQU07d0JBQ04sTUFBTSxDQUFDLElBQUksMENBQWtDLENBQUM7cUJBQzlDO2lCQUNEO2FBQ0Q7WUFDRCxJQUFJLGNBQWMsRUFBRTtnQkFDbkIsTUFBTSxDQUFDLElBQUksa0NBQTBCLENBQUM7YUFDdEM7WUFDRCxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsQ0FBQztLQUNELENBQUE7SUE5Q1ksd0VBQThCOzZDQUE5Qiw4QkFBOEI7UUFHeEMsV0FBQSxpQkFBVyxDQUFBO09BSEQsOEJBQThCLENBOEMxQztJQUVELElBQUEsOEJBQWlCLEVBQUMsOEJBQWlCLEVBQUUsZ0JBQWdCLGtDQUEwQixDQUFDIn0=