/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/product/common/product", "vs/workbench/browser/workbench", "vs/workbench/electron-sandbox/window", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/uri", "vs/workbench/services/configuration/browser/configurationService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/workbench/services/storage/electron-sandbox/storageService", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/base/common/lifecycle", "vs/platform/ipc/electron-sandbox/services", "vs/platform/ipc/common/mainProcessService", "vs/workbench/services/sharedProcess/electron-sandbox/sharedProcessService", "vs/platform/remote/electron-sandbox/remoteAuthorityResolverService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/remote/electron-sandbox/remoteAgentService", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/files/common/fileService", "vs/workbench/services/files/common/files", "vs/workbench/services/remote/common/remoteFileSystemProviderClient", "vs/workbench/services/configuration/common/configurationCache", "vs/platform/sign/common/sign", "vs/platform/product/common/productService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/services/keybinding/electron-sandbox/nativeKeyboardLayoutService", "vs/platform/ipc/electron-sandbox/mainProcessService", "vs/platform/log/common/logIpc", "vs/base/parts/ipc/common/ipc", "vs/workbench/services/log/electron-sandbox/logService", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/platform/workspace/common/workspaceTrust", "vs/base/common/objects", "vs/workbench/services/utilityProcess/electron-sandbox/utilityProcessWorkerWorkbenchService", "vs/base/common/platform", "vs/base/common/network", "vs/workbench/services/files/electron-sandbox/diskFileSystemProvider", "vs/platform/userData/common/fileUserDataProvider", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfileIpc", "vs/platform/policy/common/policyIpc", "vs/platform/policy/common/policy", "vs/workbench/services/userDataProfile/common/userDataProfileService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/remote/browser/browserSocketFactory", "vs/platform/remote/common/remoteSocketFactoryService", "vs/platform/remote/electron-sandbox/electronRemoteResourceLoader", "vs/platform/window/electron-sandbox/window"], function (require, exports, nls_1, product_1, workbench_1, window_1, browser_1, dom_1, errors_1, uri_1, configurationService_1, environmentService_1, serviceCollection_1, log_1, storageService_1, workspace_1, configuration_1, storage_1, lifecycle_1, services_1, mainProcessService_1, sharedProcessService_1, remoteAuthorityResolverService_1, remoteAuthorityResolver_1, remoteAgentService_1, remoteAgentService_2, fileService_1, files_1, remoteFileSystemProviderClient_1, configurationCache_1, sign_1, productService_1, uriIdentity_1, uriIdentityService_1, nativeKeyboardLayoutService_1, mainProcessService_2, logIpc_1, ipc_1, logService_1, workspaceTrust_1, workspaceTrust_2, objects_1, utilityProcessWorkerWorkbenchService_1, platform_1, network_1, diskFileSystemProvider_1, fileUserDataProvider_1, userDataProfile_1, userDataProfileIpc_1, policyIpc_1, policy_1, userDataProfileService_1, userDataProfile_2, browserSocketFactory_1, remoteSocketFactoryService_1, electronRemoteResourceLoader_1, window_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = exports.DesktopMain = void 0;
    class DesktopMain extends lifecycle_1.Disposable {
        constructor(configuration) {
            super();
            this.configuration = configuration;
            this.init();
        }
        init() {
            // Massage configuration file URIs
            this.reviveUris();
            // Apply fullscreen early if configured
            (0, browser_1.setFullscreen)(!!this.configuration.fullscreen);
        }
        reviveUris() {
            // Workspace
            const workspace = (0, workspace_1.reviveIdentifier)(this.configuration.workspace);
            if ((0, workspace_1.isWorkspaceIdentifier)(workspace) || (0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspace)) {
                this.configuration.workspace = workspace;
            }
            // Files
            const filesToWait = this.configuration.filesToWait;
            const filesToWaitPaths = filesToWait?.paths;
            for (const paths of [filesToWaitPaths, this.configuration.filesToOpenOrCreate, this.configuration.filesToDiff, this.configuration.filesToMerge]) {
                if (Array.isArray(paths)) {
                    for (const path of paths) {
                        if (path.fileUri) {
                            path.fileUri = uri_1.URI.revive(path.fileUri);
                        }
                    }
                }
            }
            if (filesToWait) {
                filesToWait.waitMarkerFileUri = uri_1.URI.revive(filesToWait.waitMarkerFileUri);
            }
        }
        async open() {
            // Init services and wait for DOM to be ready in parallel
            const [services] = await Promise.all([this.initServices(), (0, dom_1.domContentLoaded)()]);
            // Apply zoom level early once we have a configuration service
            // and before the workbench is created to prevent flickering.
            // We also need to respect that zoom level can be configured per
            // workspace, so we need the resolved configuration service.
            // (fixes https://github.com/microsoft/vscode/issues/187982)
            this.applyConfiguredWindowZoomLevel(services.configurationService);
            // Create Workbench
            const workbench = new workbench_1.Workbench(document.body, { extraClasses: this.getExtraClasses() }, services.serviceCollection, services.logService);
            // Listeners
            this.registerListeners(workbench, services.storageService);
            // Startup
            const instantiationService = workbench.startup();
            // Window
            this._register(instantiationService.createInstance(window_1.NativeWindow));
        }
        applyConfiguredWindowZoomLevel(configurationService) {
            const windowConfig = configurationService.getValue();
            const windowZoomLevel = typeof windowConfig.window?.zoomLevel === 'number' ? windowConfig.window.zoomLevel : 0;
            (0, window_2.applyZoom)(windowZoomLevel);
        }
        getExtraClasses() {
            if (platform_1.isMacintosh) {
                if (this.configuration.os.release > '20.0.0') {
                    return ['macos-bigsur-or-newer'];
                }
            }
            return [];
        }
        registerListeners(workbench, storageService) {
            // Workbench Lifecycle
            this._register(workbench.onWillShutdown(event => event.join(storageService.close(), { id: 'join.closeStorage', label: (0, nls_1.localize)('join.closeStorage', "Saving UI state") })));
            this._register(workbench.onDidShutdown(() => this.dispose()));
        }
        async initServices() {
            const serviceCollection = new serviceCollection_1.ServiceCollection();
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Main Process
            const mainProcessService = this._register(new mainProcessService_2.ElectronIPCMainProcessService(this.configuration.windowId));
            serviceCollection.set(mainProcessService_1.IMainProcessService, mainProcessService);
            // Policies
            const policyService = this.configuration.policiesData ? new policyIpc_1.PolicyChannelClient(this.configuration.policiesData, mainProcessService.getChannel('policy')) : new policy_1.NullPolicyService();
            serviceCollection.set(policy_1.IPolicyService, policyService);
            // Product
            const productService = { _serviceBrand: undefined, ...product_1.default };
            serviceCollection.set(productService_1.IProductService, productService);
            // Environment
            const environmentService = new environmentService_1.NativeWorkbenchEnvironmentService(this.configuration, productService);
            serviceCollection.set(environmentService_1.INativeWorkbenchEnvironmentService, environmentService);
            // Logger
            const loggers = [
                ...this.configuration.loggers.global.map(loggerResource => ({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource) })),
                ...this.configuration.loggers.window.map(loggerResource => ({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource), hidden: true })),
            ];
            const loggerService = new logIpc_1.LoggerChannelClient(this.configuration.windowId, this.configuration.logLevel, environmentService.windowLogsPath, loggers, mainProcessService.getChannel('logger'));
            serviceCollection.set(log_1.ILoggerService, loggerService);
            // Log
            const logService = this._register(new logService_1.NativeLogService(loggerService, environmentService));
            serviceCollection.set(log_1.ILogService, logService);
            if (platform_1.isCI) {
                logService.info('workbench#open()'); // marking workbench open helps to diagnose flaky integration/smoke tests
            }
            if (logService.getLevel() === log_1.LogLevel.Trace) {
                logService.trace('workbench#open(): with configuration', (0, objects_1.safeStringify)(this.configuration));
            }
            // Shared Process
            const sharedProcessService = new sharedProcessService_1.SharedProcessService(this.configuration.windowId, logService);
            serviceCollection.set(services_1.ISharedProcessService, sharedProcessService);
            // Utility Process Worker
            const utilityProcessWorkerWorkbenchService = new utilityProcessWorkerWorkbenchService_1.UtilityProcessWorkerWorkbenchService(this.configuration.windowId, logService, mainProcessService);
            serviceCollection.set(utilityProcessWorkerWorkbenchService_1.IUtilityProcessWorkerWorkbenchService, utilityProcessWorkerWorkbenchService);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Sign
            const signService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('sign'));
            serviceCollection.set(sign_1.ISignService, signService);
            // Files
            const fileService = this._register(new fileService_1.FileService(logService));
            serviceCollection.set(files_1.IWorkbenchFileService, fileService);
            // Remote
            const remoteAuthorityResolverService = new remoteAuthorityResolverService_1.RemoteAuthorityResolverService(productService, new electronRemoteResourceLoader_1.ElectronRemoteResourceLoader(environmentService.window.id, mainProcessService, fileService));
            serviceCollection.set(remoteAuthorityResolver_1.IRemoteAuthorityResolverService, remoteAuthorityResolverService);
            // Local Files
            const diskFileSystemProvider = this._register(new diskFileSystemProvider_1.DiskFileSystemProvider(mainProcessService, utilityProcessWorkerWorkbenchService, logService));
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // URI Identity
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            serviceCollection.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
            // User Data Profiles
            const userDataProfilesService = new userDataProfileIpc_1.UserDataProfilesService(this.configuration.profiles.all, uri_1.URI.revive(this.configuration.profiles.home).with({ scheme: environmentService.userRoamingDataHome.scheme }), mainProcessService.getChannel('userDataProfiles'));
            serviceCollection.set(userDataProfile_1.IUserDataProfilesService, userDataProfilesService);
            const userDataProfileService = new userDataProfileService_1.UserDataProfileService((0, userDataProfile_1.reviveProfile)(this.configuration.profiles.profile, userDataProfilesService.profilesHome.scheme));
            serviceCollection.set(userDataProfile_2.IUserDataProfileService, userDataProfileService);
            // Use FileUserDataProvider for user data to
            // enable atomic read / write operations.
            fileService.registerProvider(network_1.Schemas.vscodeUserData, this._register(new fileUserDataProvider_1.FileUserDataProvider(network_1.Schemas.file, diskFileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService)));
            // Remote Agent
            const remoteSocketFactoryService = new remoteSocketFactoryService_1.RemoteSocketFactoryService();
            remoteSocketFactoryService.register(0 /* RemoteConnectionType.WebSocket */, new browserSocketFactory_1.BrowserSocketFactory(null));
            serviceCollection.set(remoteSocketFactoryService_1.IRemoteSocketFactoryService, remoteSocketFactoryService);
            const remoteAgentService = this._register(new remoteAgentService_1.RemoteAgentService(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService));
            serviceCollection.set(remoteAgentService_2.IRemoteAgentService, remoteAgentService);
            // Remote Files
            this._register(remoteFileSystemProviderClient_1.RemoteFileSystemProviderClient.register(remoteAgentService, fileService, logService));
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Create services that require resolving in parallel
            const workspace = this.resolveWorkspaceIdentifier(environmentService);
            const [configurationService, storageService] = await Promise.all([
                this.createWorkspaceService(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService).then(service => {
                    // Workspace
                    serviceCollection.set(workspace_1.IWorkspaceContextService, service);
                    // Configuration
                    serviceCollection.set(configuration_1.IWorkbenchConfigurationService, service);
                    return service;
                }),
                this.createStorageService(workspace, environmentService, userDataProfileService, userDataProfilesService, mainProcessService).then(service => {
                    // Storage
                    serviceCollection.set(storage_1.IStorageService, service);
                    return service;
                }),
                this.createKeyboardLayoutService(mainProcessService).then(service => {
                    // KeyboardLayout
                    serviceCollection.set(nativeKeyboardLayoutService_1.INativeKeyboardLayoutService, service);
                    return service;
                })
            ]);
            // Workspace Trust Service
            const workspaceTrustEnablementService = new workspaceTrust_1.WorkspaceTrustEnablementService(configurationService, environmentService);
            serviceCollection.set(workspaceTrust_2.IWorkspaceTrustEnablementService, workspaceTrustEnablementService);
            const workspaceTrustManagementService = new workspaceTrust_1.WorkspaceTrustManagementService(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, configurationService, workspaceTrustEnablementService, fileService);
            serviceCollection.set(workspaceTrust_2.IWorkspaceTrustManagementService, workspaceTrustManagementService);
            // Update workspace trust so that configuration is updated accordingly
            configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
            this._register(workspaceTrustManagementService.onDidChangeTrust(() => configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted())));
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            return { serviceCollection, logService, storageService, configurationService };
        }
        resolveWorkspaceIdentifier(environmentService) {
            // Return early for when a folder or multi-root is opened
            if (this.configuration.workspace) {
                return this.configuration.workspace;
            }
            // Otherwise, workspace is empty, so we derive an identifier
            return (0, workspace_1.toWorkspaceIdentifier)(this.configuration.backupPath, environmentService.isExtensionDevelopment);
        }
        async createWorkspaceService(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService) {
            const configurationCache = new configurationCache_1.ConfigurationCache([network_1.Schemas.file, network_1.Schemas.vscodeUserData] /* Cache all non native resources */, environmentService, fileService);
            const workspaceService = new configurationService_1.WorkspaceService({ remoteAuthority: environmentService.remoteAuthority, configurationCache }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService);
            try {
                await workspaceService.initialize(workspace);
                return workspaceService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                return workspaceService;
            }
        }
        async createStorageService(workspace, environmentService, userDataProfileService, userDataProfilesService, mainProcessService) {
            const storageService = new storageService_1.NativeWorkbenchStorageService(workspace, userDataProfileService, userDataProfilesService, mainProcessService, environmentService);
            try {
                await storageService.initialize();
                return storageService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                return storageService;
            }
        }
        async createKeyboardLayoutService(mainProcessService) {
            const keyboardLayoutService = new nativeKeyboardLayoutService_1.NativeKeyboardLayoutService(mainProcessService);
            try {
                await keyboardLayoutService.initialize();
                return keyboardLayoutService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                return keyboardLayoutService;
            }
        }
    }
    exports.DesktopMain = DesktopMain;
    function main(configuration) {
        const workbench = new DesktopMain(configuration);
        return workbench.open();
    }
    exports.main = main;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVza3RvcC5tYWluLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2VsZWN0cm9uLXNhbmRib3gvZGVza3RvcC5tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTREaEcsTUFBYSxXQUFZLFNBQVEsc0JBQVU7UUFFMUMsWUFDa0IsYUFBeUM7WUFFMUQsS0FBSyxFQUFFLENBQUM7WUFGUyxrQkFBYSxHQUFiLGFBQWEsQ0FBNEI7WUFJMUQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsQ0FBQztRQUVPLElBQUk7WUFFWCxrQ0FBa0M7WUFDbEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRWxCLHVDQUF1QztZQUN2QyxJQUFBLHVCQUFhLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVPLFVBQVU7WUFFakIsWUFBWTtZQUNaLE1BQU0sU0FBUyxHQUFHLElBQUEsNEJBQWdCLEVBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNqRSxJQUFJLElBQUEsaUNBQXFCLEVBQUMsU0FBUyxDQUFDLElBQUksSUFBQSw2Q0FBaUMsRUFBQyxTQUFTLENBQUMsRUFBRTtnQkFDckYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2FBQ3pDO1lBRUQsUUFBUTtZQUNSLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDO1lBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsV0FBVyxFQUFFLEtBQUssQ0FBQztZQUM1QyxLQUFLLE1BQU0sS0FBSyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxJQUFJLENB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