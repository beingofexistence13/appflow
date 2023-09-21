/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/performance", "vs/base/browser/dom", "vs/base/common/types", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/log/browser/log", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/browser/workbench", "vs/workbench/services/remote/common/remoteFileSystemProviderClient", "vs/platform/product/common/productService", "vs/platform/product/common/product", "vs/workbench/services/remote/browser/remoteAgentService", "vs/platform/remote/browser/remoteAuthorityResolverService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/files/common/files", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/configuration", "vs/base/common/errors", "vs/base/browser/browser", "vs/base/common/uri", "vs/workbench/services/configuration/browser/configurationService", "vs/workbench/services/configuration/common/configurationCache", "vs/platform/sign/common/sign", "vs/platform/sign/browser/signService", "vs/workbench/services/storage/browser/storageService", "vs/platform/storage/common/storage", "vs/base/common/date", "vs/platform/window/common/window", "vs/workbench/services/workspaces/browser/workspaces", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/commands/common/commands", "vs/platform/files/browser/indexedDBFileSystemProvider", "vs/workbench/services/request/browser/requestService", "vs/platform/request/common/request", "vs/workbench/services/userData/browser/userDataInit", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/host/browser/host", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/browser/window", "vs/workbench/services/timer/browser/timerService", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/platform/workspace/common/workspaceTrust", "vs/platform/files/browser/htmlFileSystemProvider", "vs/platform/opener/common/opener", "vs/base/common/objects", "vs/base/browser/indexedDB", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/telemetry/common/telemetry", "vs/platform/progress/common/progress", "vs/workbench/services/output/common/delayedLogChannel", "vs/base/common/resources", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/policy/common/policy", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/tunnel/common/tunnel", "vs/platform/label/common/label", "vs/workbench/services/userDataProfile/common/userDataProfileService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/browser/userDataProfile", "vs/base/common/async", "vs/workbench/services/log/common/logConstants", "vs/platform/log/common/logService", "vs/platform/remote/common/remoteSocketFactoryService", "vs/platform/remote/browser/browserSocketFactory", "vs/base/common/buffer", "vs/workbench/services/userDataProfile/browser/userDataProfileInit", "vs/workbench/services/userDataSync/browser/userDataSyncInit", "vs/workbench/services/remote/browser/browserRemoteResourceHandler", "vs/platform/log/common/bufferLog", "vs/platform/log/common/fileLog", "vs/workbench/services/terminal/common/embedderTerminalService", "vs/workbench/services/secrets/browser/secretStorageService", "vs/workbench/services/encryption/browser/encryptionService", "vs/platform/encryption/common/encryptionService", "vs/platform/secrets/common/secrets", "vs/workbench/services/remote/common/tunnelModel"], function (require, exports, performance_1, dom_1, types_1, serviceCollection_1, log_1, log_2, lifecycle_1, environmentService_1, workbench_1, remoteFileSystemProviderClient_1, productService_1, product_1, remoteAgentService_1, remoteAuthorityResolverService_1, remoteAuthorityResolver_1, remoteAgentService_2, files_1, fileService_1, network_1, workspace_1, configuration_1, errors_1, browser_1, uri_1, configurationService_1, configurationCache_1, sign_1, signService_1, storageService_1, storage_1, date_1, window_1, workspaces_1, inMemoryFilesystemProvider_1, commands_1, indexedDBFileSystemProvider_1, requestService_1, request_1, userDataInit_1, userDataSyncStoreService_1, userDataSync_1, lifecycle_2, actions_1, instantiation_1, nls_1, actionCommonCategories_1, dialogs_1, host_1, uriIdentity_1, uriIdentityService_1, window_2, timerService_1, workspaceTrust_1, workspaceTrust_2, htmlFileSystemProvider_1, opener_1, objects_1, indexedDB_1, webFileSystemAccess_1, telemetry_1, progress_1, delayedLogChannel_1, resources_1, userDataProfile_1, policy_1, remoteExplorerService_1, tunnel_1, label_1, userDataProfileService_1, userDataProfile_2, userDataProfile_3, async_1, logConstants_1, logService_1, remoteSocketFactoryService_1, browserSocketFactory_1, buffer_1, userDataProfileInit_1, userDataSyncInit_1, browserRemoteResourceHandler_1, bufferLog_1, fileLog_1, embedderTerminalService_1, secretStorageService_1, encryptionService_1, encryptionService_2, secrets_1, tunnelModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserMain = void 0;
    class BrowserMain extends lifecycle_1.Disposable {
        constructor(domElement, configuration) {
            super();
            this.domElement = domElement;
            this.configuration = configuration;
            this.onWillShutdownDisposables = this._register(new lifecycle_1.DisposableStore());
            this.indexedDBFileSystemProviders = [];
            this.init();
        }
        init() {
            // Browser config
            (0, browser_1.setFullscreen)(!!(0, dom_1.detectFullscreen)());
        }
        async open() {
            // Init services and wait for DOM to be ready in parallel
            const [services] = await Promise.all([this.initServices(), (0, dom_1.domContentLoaded)()]);
            // Create Workbench
            const workbench = new workbench_1.Workbench(this.domElement, undefined, services.serviceCollection, services.logService);
            // Listeners
            this.registerListeners(workbench);
            // Startup
            const instantiationService = workbench.startup();
            // Window
            this._register(instantiationService.createInstance(window_2.BrowserWindow));
            // Logging
            services.logService.trace('workbench#open with configuration', (0, objects_1.safeStringify)(this.configuration));
            instantiationService.invokeFunction(accessor => {
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                for (const indexedDbFileSystemProvider of this.indexedDBFileSystemProviders) {
                    this._register(indexedDbFileSystemProvider.onReportError(e => telemetryService.publicLog2('indexedDBFileSystemProviderError', e)));
                }
            });
            // Return API Facade
            return instantiationService.invokeFunction(accessor => {
                const commandService = accessor.get(commands_1.ICommandService);
                const lifecycleService = accessor.get(lifecycle_2.ILifecycleService);
                const timerService = accessor.get(timerService_1.ITimerService);
                const openerService = accessor.get(opener_1.IOpenerService);
                const productService = accessor.get(productService_1.IProductService);
                const progressService = accessor.get(progress_1.IProgressService);
                const environmentService = accessor.get(environmentService_1.IBrowserWorkbenchEnvironmentService);
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const labelService = accessor.get(label_1.ILabelService);
                const embedderTerminalService = accessor.get(embedderTerminalService_1.IEmbedderTerminalService);
                let logger = undefined;
                return {
                    commands: {
                        executeCommand: (command, ...args) => commandService.executeCommand(command, ...args)
                    },
                    env: {
                        async getUriScheme() {
                            return productService.urlProtocol;
                        },
                        async retrievePerformanceMarks() {
                            await timerService.whenReady();
                            return timerService.getPerformanceMarks();
                        },
                        async openUri(uri) {
                            return openerService.open(uri, {});
                        }
                    },
                    logger: {
                        log: (level, message) => {
                            if (!logger) {
                                logger = instantiationService.createInstance(delayedLogChannel_1.DelayedLogChannel, 'webEmbedder', productService.embedderIdentifier || productService.nameShort, (0, resources_1.joinPath)((0, resources_1.dirname)(environmentService.logFile), 'webEmbedder.log'));
                            }
                            logger.log(level, message);
                        }
                    },
                    window: {
                        withProgress: (options, task) => progressService.withProgress(options, task),
                        createTerminal: async (options) => embedderTerminalService.createTerminal(options),
                    },
                    workspace: {
                        openTunnel: async (tunnelOptions) => {
                            const tunnel = (0, types_1.assertIsDefined)(await remoteExplorerService.forward({
                                remote: tunnelOptions.remoteAddress,
                                local: tunnelOptions.localAddressPort,
                                name: tunnelOptions.label,
                                source: {
                                    source: tunnelModel_1.TunnelSource.Extension,
                                    description: labelService.getHostLabel(network_1.Schemas.vscodeRemote, this.configuration.remoteAuthority)
                                },
                                elevateIfNeeded: false,
                                privacy: tunnelOptions.privacy
                            }, {
                                label: tunnelOptions.label,
                                elevateIfNeeded: undefined,
                                onAutoForward: undefined,
                                requireLocalPort: undefined,
                                protocol: tunnelOptions.protocol === tunnel_1.TunnelProtocol.Https ? tunnelOptions.protocol : tunnel_1.TunnelProtocol.Http
                            }));
                            if (typeof tunnel === 'string') {
                                throw new Error(tunnel);
                            }
                            return new class extends tunnel_1.DisposableTunnel {
                            }({
                                port: tunnel.tunnelRemotePort,
                                host: tunnel.tunnelRemoteHost
                            }, tunnel.localAddress, () => tunnel.dispose());
                        }
                    },
                    shutdown: () => lifecycleService.shutdown()
                };
            });
        }
        registerListeners(workbench) {
            // Workbench Lifecycle
            this._register(workbench.onWillShutdown(() => this.onWillShutdownDisposables.clear()));
            this._register(workbench.onDidShutdown(() => this.dispose()));
        }
        async initServices() {
            const serviceCollection = new serviceCollection_1.ServiceCollection();
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const workspace = this.resolveWorkspace();
            // Product
            const productService = (0, objects_1.mixin)({ _serviceBrand: undefined, ...product_1.default }, this.configuration.productConfiguration);
            serviceCollection.set(productService_1.IProductService, productService);
            // Environment
            const logsPath = uri_1.URI.file((0, date_1.toLocalISOString)(new Date()).replace(/-|:|\.\d+Z$/g, '')).with({ scheme: 'vscode-log' });
            const environmentService = new environmentService_1.BrowserWorkbenchEnvironmentService(workspace.id, logsPath, this.configuration, productService);
            serviceCollection.set(environmentService_1.IBrowserWorkbenchEnvironmentService, environmentService);
            // Files
            const fileLogger = new bufferLog_1.BufferLogger();
            const fileService = this._register(new fileService_1.FileService(fileLogger));
            serviceCollection.set(files_1.IWorkbenchFileService, fileService);
            // Logger
            const loggerService = new fileLog_1.FileLoggerService((0, log_1.getLogLevel)(environmentService), logsPath, fileService);
            serviceCollection.set(log_1.ILoggerService, loggerService);
            // Log Service
            const otherLoggers = [new log_1.ConsoleLogger(loggerService.getLogLevel())];
            if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
                otherLoggers.push(new log_2.ConsoleLogInAutomationLogger(loggerService.getLogLevel()));
            }
            const logger = loggerService.createLogger(environmentService.logFile, { id: logConstants_1.windowLogId, name: (0, nls_1.localize)('rendererLog', "Window") });
            const logService = new logService_1.LogService(logger, otherLoggers);
            serviceCollection.set(log_1.ILogService, logService);
            // Set the logger of the fileLogger after the log service is ready.
            // This is to avoid cyclic dependency
            fileLogger.logger = logService;
            // Register File System Providers depending on IndexedDB support
            // Register them early because they are needed for the profiles initialization
            await this.registerIndexedDBFileSystemProviders(environmentService, fileService, logService, loggerService, logsPath);
            // Remote
            const connectionToken = environmentService.options.connectionToken || (0, dom_1.getCookieValue)(network_1.connectionTokenCookieName);
            const remoteResourceLoader = this.configuration.remoteResourceProvider ? new browserRemoteResourceHandler_1.BrowserRemoteResourceLoader(fileService, this.configuration.remoteResourceProvider) : undefined;
            const resourceUriProvider = this.configuration.resourceUriProvider ?? remoteResourceLoader?.getResourceUriProvider();
            const remoteAuthorityResolverService = new remoteAuthorityResolverService_1.RemoteAuthorityResolverService(!environmentService.expectsResolverExtension, connectionToken, resourceUriProvider, productService, logService);
            serviceCollection.set(remoteAuthorityResolver_1.IRemoteAuthorityResolverService, remoteAuthorityResolverService);
            // Signing
            const signService = new signService_1.SignService(productService);
            serviceCollection.set(sign_1.ISignService, signService);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // URI Identity
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            serviceCollection.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
            // User Data Profiles
            const userDataProfilesService = new userDataProfile_3.BrowserUserDataProfilesService(environmentService, fileService, uriIdentityService, logService);
            serviceCollection.set(userDataProfile_1.IUserDataProfilesService, userDataProfilesService);
            const currentProfile = await this.getCurrentProfile(workspace, userDataProfilesService, environmentService);
            const userDataProfileService = new userDataProfileService_1.UserDataProfileService(currentProfile);
            serviceCollection.set(userDataProfile_2.IUserDataProfileService, userDataProfileService);
            // Remote Agent
            const remoteSocketFactoryService = new remoteSocketFactoryService_1.RemoteSocketFactoryService();
            remoteSocketFactoryService.register(0 /* RemoteConnectionType.WebSocket */, new browserSocketFactory_1.BrowserSocketFactory(this.configuration.webSocketFactory));
            serviceCollection.set(remoteSocketFactoryService_1.IRemoteSocketFactoryService, remoteSocketFactoryService);
            const remoteAgentService = this._register(new remoteAgentService_1.RemoteAgentService(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService));
            serviceCollection.set(remoteAgentService_2.IRemoteAgentService, remoteAgentService);
            this._register(remoteFileSystemProviderClient_1.RemoteFileSystemProviderClient.register(remoteAgentService, fileService, logService));
            // Long running services (workspace, config, storage)
            const [configurationService, storageService] = await Promise.all([
                this.createWorkspaceService(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService).then(service => {
                    // Workspace
                    serviceCollection.set(workspace_1.IWorkspaceContextService, service);
                    // Configuration
                    serviceCollection.set(configuration_1.IWorkbenchConfigurationService, service);
                    return service;
                }),
                this.createStorageService(workspace, logService, userDataProfileService).then(service => {
                    // Storage
                    serviceCollection.set(storage_1.IStorageService, service);
                    return service;
                })
            ]);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Workspace Trust Service
            const workspaceTrustEnablementService = new workspaceTrust_1.WorkspaceTrustEnablementService(configurationService, environmentService);
            serviceCollection.set(workspaceTrust_2.IWorkspaceTrustEnablementService, workspaceTrustEnablementService);
            const workspaceTrustManagementService = new workspaceTrust_1.WorkspaceTrustManagementService(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, configurationService, workspaceTrustEnablementService, fileService);
            serviceCollection.set(workspaceTrust_2.IWorkspaceTrustManagementService, workspaceTrustManagementService);
            // Update workspace trust so that configuration is updated accordingly
            configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
            this._register(workspaceTrustManagementService.onDidChangeTrust(() => configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted())));
            // Request Service
            const requestService = new requestService_1.BrowserRequestService(remoteAgentService, configurationService, loggerService);
            serviceCollection.set(request_1.IRequestService, requestService);
            // Userdata Sync Store Management Service
            const userDataSyncStoreManagementService = new userDataSyncStoreService_1.UserDataSyncStoreManagementService(productService, configurationService, storageService);
            serviceCollection.set(userDataSync_1.IUserDataSyncStoreManagementService, userDataSyncStoreManagementService);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const encryptionService = new encryptionService_1.EncryptionService();
            serviceCollection.set(encryptionService_2.IEncryptionService, encryptionService);
            const secretStorageService = new secretStorageService_1.BrowserSecretStorageService(storageService, encryptionService, environmentService, logService);
            serviceCollection.set(secrets_1.ISecretStorageService, secretStorageService);
            // Userdata Initialize Service
            const userDataInitializers = [];
            userDataInitializers.push(new userDataSyncInit_1.UserDataSyncInitializer(environmentService, secretStorageService, userDataSyncStoreManagementService, fileService, userDataProfilesService, storageService, productService, requestService, logService, uriIdentityService));
            if (environmentService.options.profile) {
                userDataInitializers.push(new userDataProfileInit_1.UserDataProfileInitializer(environmentService, fileService, userDataProfileService, storageService, logService, uriIdentityService, requestService));
            }
            const userDataInitializationService = new userDataInit_1.UserDataInitializationService(userDataInitializers);
            serviceCollection.set(userDataInit_1.IUserDataInitializationService, userDataInitializationService);
            try {
                await Promise.race([
                    // Do not block more than 5s
                    (0, async_1.timeout)(5000),
                    this.initializeUserData(userDataInitializationService, configurationService)
                ]);
            }
            catch (error) {
                logService.error(error);
            }
            return { serviceCollection, configurationService, logService };
        }
        async initializeUserData(userDataInitializationService, configurationService) {
            if (await userDataInitializationService.requiresInitialization()) {
                (0, performance_1.mark)('code/willInitRequiredUserData');
                // Initialize required resources - settings & global state
                await userDataInitializationService.initializeRequiredResources();
                // Important: Reload only local user configuration after initializing
                // Reloading complete configuration blocks workbench until remote configuration is loaded.
                await configurationService.reloadLocalUserConfiguration();
                (0, performance_1.mark)('code/didInitRequiredUserData');
            }
        }
        async registerIndexedDBFileSystemProviders(environmentService, fileService, logService, loggerService, logsPath) {
            // IndexedDB is used for logging and user data
            let indexedDB;
            const userDataStore = 'vscode-userdata-store';
            const logsStore = 'vscode-logs-store';
            const handlesStore = 'vscode-filehandles-store';
            try {
                indexedDB = await indexedDB_1.IndexedDB.create('vscode-web-db', 3, [userDataStore, logsStore, handlesStore]);
                // Close onWillShutdown
                this.onWillShutdownDisposables.add((0, lifecycle_1.toDisposable)(() => indexedDB?.close()));
            }
            catch (error) {
                logService.error('Error while creating IndexedDB', error);
            }
            // Logger
            if (indexedDB) {
                const logFileSystemProvider = new indexedDBFileSystemProvider_1.IndexedDBFileSystemProvider(logsPath.scheme, indexedDB, logsStore, false);
                this.indexedDBFileSystemProviders.push(logFileSystemProvider);
                fileService.registerProvider(logsPath.scheme, logFileSystemProvider);
            }
            else {
                fileService.registerProvider(logsPath.scheme, new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            }
            // User data
            let userDataProvider;
            if (indexedDB) {
                userDataProvider = new indexedDBFileSystemProvider_1.IndexedDBFileSystemProvider(network_1.Schemas.vscodeUserData, indexedDB, userDataStore, true);
                this.indexedDBFileSystemProviders.push(userDataProvider);
                this.registerDeveloperActions(userDataProvider);
            }
            else {
                logService.info('Using in-memory user data provider');
                userDataProvider = new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider();
            }
            fileService.registerProvider(network_1.Schemas.vscodeUserData, userDataProvider);
            // Local file access (if supported by browser)
            if (webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                fileService.registerProvider(network_1.Schemas.file, new htmlFileSystemProvider_1.HTMLFileSystemProvider(indexedDB, handlesStore, logService));
            }
            // In-memory
            fileService.registerProvider(network_1.Schemas.tmp, new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
        }
        registerDeveloperActions(provider) {
            (0, actions_1.registerAction2)(class ResetUserDataAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.resetUserData',
                        title: { original: 'Reset User Data', value: (0, nls_1.localize)('reset', "Reset User Data") },
                        category: actionCommonCategories_1.Categories.Developer,
                        menu: {
                            id: actions_1.MenuId.CommandPalette
                        }
                    });
                }
                async run(accessor) {
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const hostService = accessor.get(host_1.IHostService);
                    const storageService = accessor.get(storage_1.IStorageService);
                    const logService = accessor.get(log_1.ILogService);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)('reset user data message', "Would you like to reset your data (settings, keybindings, extensions, snippets and UI State) and reload?")
                    });
                    if (result.confirmed) {
                        try {
                            await provider?.reset();
                            if (storageService instanceof storageService_1.BrowserStorageService) {
                                await storageService.clear();
                            }
                        }
                        catch (error) {
                            logService.error(error);
                            throw error;
                        }
                    }
                    hostService.reload();
                }
            });
        }
        async createStorageService(workspace, logService, userDataProfileService) {
            const storageService = new storageService_1.BrowserStorageService(workspace, userDataProfileService, logService);
            try {
                await storageService.initialize();
                // Register to close on shutdown
                this.onWillShutdownDisposables.add((0, lifecycle_1.toDisposable)(() => storageService.close()));
                return storageService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                logService.error(error);
                return storageService;
            }
        }
        async createWorkspaceService(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService) {
            // Temporary workspaces do not exist on startup because they are
            // just in memory. As such, detect this case and eagerly create
            // the workspace file empty so that it is a valid workspace.
            if ((0, workspace_1.isWorkspaceIdentifier)(workspace) && (0, workspace_1.isTemporaryWorkspace)(workspace.configPath)) {
                try {
                    const emptyWorkspace = { folders: [] };
                    await fileService.createFile(workspace.configPath, buffer_1.VSBuffer.fromString(JSON.stringify(emptyWorkspace, null, '\t')), { overwrite: false });
                }
                catch (error) {
                    // ignore if workspace file already exists
                }
            }
            const configurationCache = new configurationCache_1.ConfigurationCache([network_1.Schemas.file, network_1.Schemas.vscodeUserData, network_1.Schemas.tmp] /* Cache all non native resources */, environmentService, fileService);
            const workspaceService = new configurationService_1.WorkspaceService({ remoteAuthority: this.configuration.remoteAuthority, configurationCache }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, new policy_1.NullPolicyService());
            try {
                await workspaceService.initialize(workspace);
                return workspaceService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                logService.error(error);
                return workspaceService;
            }
        }
        async getCurrentProfile(workspace, userDataProfilesService, environmentService) {
            if (environmentService.options?.profile) {
                const profile = userDataProfilesService.profiles.find(p => p.name === environmentService.options?.profile?.name);
                if (profile) {
                    return profile;
                }
                return userDataProfilesService.createNamedProfile(environmentService.options?.profile?.name, undefined, workspace);
            }
            return userDataProfilesService.getProfileForWorkspace(workspace) ?? userDataProfilesService.defaultProfile;
        }
        resolveWorkspace() {
            let workspace = undefined;
            if (this.configuration.workspaceProvider) {
                workspace = this.configuration.workspaceProvider.workspace;
            }
            // Multi-root workspace
            if (workspace && (0, window_1.isWorkspaceToOpen)(workspace)) {
                return (0, workspaces_1.getWorkspaceIdentifier)(workspace.workspaceUri);
            }
            // Single-folder workspace
            if (workspace && (0, window_1.isFolderToOpen)(workspace)) {
                return (0, workspaces_1.getSingleFolderWorkspaceIdentifier)(workspace.folderUri);
            }
            // Empty window workspace
            return workspace_1.UNKNOWN_EMPTY_WINDOW_WORKSPACE;
        }
    }
    exports.BrowserMain = BrowserMain;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLm1haW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci93ZWIubWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUErRmhHLE1BQWEsV0FBWSxTQUFRLHNCQUFVO1FBSzFDLFlBQ2tCLFVBQXVCLEVBQ3ZCLGFBQTRDO1lBRTdELEtBQUssRUFBRSxDQUFDO1lBSFMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUN2QixrQkFBYSxHQUFiLGFBQWEsQ0FBK0I7WUFMN0MsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLGlDQUE0QixHQUFrQyxFQUFFLENBQUM7WUFRakYsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsQ0FBQztRQUVPLElBQUk7WUFFWCxpQkFBaUI7WUFDakIsSUFBQSx1QkFBYSxFQUFDLENBQUMsQ0FBQyxJQUFBLHNCQUFnQixHQUFFLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUk7WUFFVCx5REFBeUQ7WUFDekQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFBLHNCQUFnQixHQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhGLG1CQUFtQjtZQUNuQixNQUFNLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUU3RyxZQUFZO1lBQ1osSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRWxDLFVBQVU7WUFDVixNQUFNLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxP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