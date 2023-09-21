/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/performance", "vs/base/browser/dom", "vs/base/common/types", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/log/browser/log", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/browser/workbench", "vs/workbench/services/remote/common/remoteFileSystemProviderClient", "vs/platform/product/common/productService", "vs/platform/product/common/product", "vs/workbench/services/remote/browser/remoteAgentService", "vs/platform/remote/browser/remoteAuthorityResolverService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/files/common/files", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/configuration", "vs/base/common/errors", "vs/base/browser/browser", "vs/base/common/uri", "vs/workbench/services/configuration/browser/configurationService", "vs/workbench/services/configuration/common/configurationCache", "vs/platform/sign/common/sign", "vs/platform/sign/browser/signService", "vs/workbench/services/storage/browser/storageService", "vs/platform/storage/common/storage", "vs/base/common/date", "vs/platform/window/common/window", "vs/workbench/services/workspaces/browser/workspaces", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/commands/common/commands", "vs/platform/files/browser/indexedDBFileSystemProvider", "vs/workbench/services/request/browser/requestService", "vs/platform/request/common/request", "vs/workbench/services/userData/browser/userDataInit", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/nls!vs/workbench/browser/web.main", "vs/platform/action/common/actionCommonCategories", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/host/browser/host", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/browser/window", "vs/workbench/services/timer/browser/timerService", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/platform/workspace/common/workspaceTrust", "vs/platform/files/browser/htmlFileSystemProvider", "vs/platform/opener/common/opener", "vs/base/common/objects", "vs/base/browser/indexedDB", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/telemetry/common/telemetry", "vs/platform/progress/common/progress", "vs/workbench/services/output/common/delayedLogChannel", "vs/base/common/resources", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/policy/common/policy", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/tunnel/common/tunnel", "vs/platform/label/common/label", "vs/workbench/services/userDataProfile/common/userDataProfileService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/browser/userDataProfile", "vs/base/common/async", "vs/workbench/services/log/common/logConstants", "vs/platform/log/common/logService", "vs/platform/remote/common/remoteSocketFactoryService", "vs/platform/remote/browser/browserSocketFactory", "vs/base/common/buffer", "vs/workbench/services/userDataProfile/browser/userDataProfileInit", "vs/workbench/services/userDataSync/browser/userDataSyncInit", "vs/workbench/services/remote/browser/browserRemoteResourceHandler", "vs/platform/log/common/bufferLog", "vs/platform/log/common/fileLog", "vs/workbench/services/terminal/common/embedderTerminalService", "vs/workbench/services/secrets/browser/secretStorageService", "vs/workbench/services/encryption/browser/encryptionService", "vs/platform/encryption/common/encryptionService", "vs/platform/secrets/common/secrets", "vs/workbench/services/remote/common/tunnelModel"], function (require, exports, performance_1, dom_1, types_1, serviceCollection_1, log_1, log_2, lifecycle_1, environmentService_1, workbench_1, remoteFileSystemProviderClient_1, productService_1, product_1, remoteAgentService_1, remoteAuthorityResolverService_1, remoteAuthorityResolver_1, remoteAgentService_2, files_1, fileService_1, network_1, workspace_1, configuration_1, errors_1, browser_1, uri_1, configurationService_1, configurationCache_1, sign_1, signService_1, storageService_1, storage_1, date_1, window_1, workspaces_1, inMemoryFilesystemProvider_1, commands_1, indexedDBFileSystemProvider_1, requestService_1, request_1, userDataInit_1, userDataSyncStoreService_1, userDataSync_1, lifecycle_2, actions_1, instantiation_1, nls_1, actionCommonCategories_1, dialogs_1, host_1, uriIdentity_1, uriIdentityService_1, window_2, timerService_1, workspaceTrust_1, workspaceTrust_2, htmlFileSystemProvider_1, opener_1, objects_1, indexedDB_1, webFileSystemAccess_1, telemetry_1, progress_1, delayedLogChannel_1, resources_1, userDataProfile_1, policy_1, remoteExplorerService_1, tunnel_1, label_1, userDataProfileService_1, userDataProfile_2, userDataProfile_3, async_1, logConstants_1, logService_1, remoteSocketFactoryService_1, browserSocketFactory_1, buffer_1, userDataProfileInit_1, userDataSyncInit_1, browserRemoteResourceHandler_1, bufferLog_1, fileLog_1, embedderTerminalService_1, secretStorageService_1, encryptionService_1, encryptionService_2, secrets_1, tunnelModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$a3b = void 0;
    class $a3b extends lifecycle_1.$kc {
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = this.B(new lifecycle_1.$jc());
            this.b = [];
            this.g();
        }
        g() {
            // Browser config
            (0, browser_1.$2N)(!!(0, dom_1.$sP)());
        }
        async open() {
            // Init services and wait for DOM to be ready in parallel
            const [services] = await Promise.all([this.j(), (0, dom_1.$hP)()]);
            // Create Workbench
            const workbench = new workbench_1.$g2b(this.c, undefined, services.serviceCollection, services.logService);
            // Listeners
            this.h(workbench);
            // Startup
            const instantiationService = workbench.startup();
            // Window
            this.B(instantiationService.createInstance(window_2.$G2b));
            // Logging
            services.logService.trace('workbench#open with configuration', (0, objects_1.$1m)(this.f));
            instantiationService.invokeFunction(accessor => {
                const telemetryService = accessor.get(telemetry_1.$9k);
                for (const indexedDbFileSystemProvider of this.b) {
                    this.B(indexedDbFileSystemProvider.onReportError(e => telemetryService.publicLog2('indexedDBFileSystemProviderError', e)));
                }
            });
            // Return API Facade
            return instantiationService.invokeFunction(accessor => {
                const commandService = accessor.get(commands_1.$Fr);
                const lifecycleService = accessor.get(lifecycle_2.$7y);
                const timerService = accessor.get(timerService_1.$kkb);
                const openerService = accessor.get(opener_1.$NT);
                const productService = accessor.get(productService_1.$kj);
                const progressService = accessor.get(progress_1.$2u);
                const environmentService = accessor.get(environmentService_1.$LT);
                const instantiationService = accessor.get(instantiation_1.$Ah);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
                const labelService = accessor.get(label_1.$Vz);
                const embedderTerminalService = accessor.get(embedderTerminalService_1.$GV);
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
                                logger = instantiationService.createInstance(delayedLogChannel_1.$H2b, 'webEmbedder', productService.embedderIdentifier || productService.nameShort, (0, resources_1.$ig)((0, resources_1.$hg)(environmentService.logFile), 'webEmbedder.log'));
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
                            const tunnel = (0, types_1.$uf)(await remoteExplorerService.forward({
                                remote: tunnelOptions.remoteAddress,
                                local: tunnelOptions.localAddressPort,
                                name: tunnelOptions.label,
                                source: {
                                    source: tunnelModel_1.TunnelSource.Extension,
                                    description: labelService.getHostLabel(network_1.Schemas.vscodeRemote, this.f.remoteAuthority)
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
                            return new class extends tunnel_1.$6z {
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
        h(workbench) {
            // Workbench Lifecycle
            this.B(workbench.onWillShutdown(() => this.a.clear()));
            this.B(workbench.onDidShutdown(() => this.dispose()));
        }
        async j() {
            const serviceCollection = new serviceCollection_1.$zh();
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const workspace = this.w();
            // Product
            const productService = (0, objects_1.$Ym)({ _serviceBrand: undefined, ...product_1.default }, this.f.productConfiguration);
            serviceCollection.set(productService_1.$kj, productService);
            // Environment
            const logsPath = uri_1.URI.file((0, date_1.$7l)(new Date()).replace(/-|:|\.\d+Z$/g, '')).with({ scheme: 'vscode-log' });
            const environmentService = new environmentService_1.$MT(workspace.id, logsPath, this.f, productService);
            serviceCollection.set(environmentService_1.$LT, environmentService);
            // Files
            const fileLogger = new bufferLog_1.$92b();
            const fileService = this.B(new fileService_1.$Dp(fileLogger));
            serviceCollection.set(files_1.$okb, fileService);
            // Logger
            const loggerService = new fileLog_1.$02b((0, log_1.$gj)(environmentService), logsPath, fileService);
            serviceCollection.set(log_1.$6i, loggerService);
            // Log Service
            const otherLoggers = [new log_1.$aj(loggerService.getLogLevel())];
            if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
                otherLoggers.push(new log_2.$Z1b(loggerService.getLogLevel()));
            }
            const logger = loggerService.createLogger(environmentService.logFile, { id: logConstants_1.$mhb, name: (0, nls_1.localize)(0, null) });
            const logService = new logService_1.$mN(logger, otherLoggers);
            serviceCollection.set(log_1.$5i, logService);
            // Set the logger of the fileLogger after the log service is ready.
            // This is to avoid cyclic dependency
            fileLogger.logger = logService;
            // Register File System Providers depending on IndexedDB support
            // Register them early because they are needed for the profiles initialization
            await this.n(environmentService, fileService, logService, loggerService, logsPath);
            // Remote
            const connectionToken = environmentService.options.connectionToken || (0, dom_1.$yP)(network_1.$Uf);
            const remoteResourceLoader = this.f.remoteResourceProvider ? new browserRemoteResourceHandler_1.$82b(fileService, this.f.remoteResourceProvider) : undefined;
            const resourceUriProvider = this.f.resourceUriProvider ?? remoteResourceLoader?.getResourceUriProvider();
            const remoteAuthorityResolverService = new remoteAuthorityResolverService_1.$j2b(!environmentService.expectsResolverExtension, connectionToken, resourceUriProvider, productService, logService);
            serviceCollection.set(remoteAuthorityResolver_1.$Jk, remoteAuthorityResolverService);
            // Signing
            const signService = new signService_1.$y2b(productService);
            serviceCollection.set(sign_1.$Wk, signService);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // URI Identity
            const uriIdentityService = new uriIdentityService_1.$pr(fileService);
            serviceCollection.set(uriIdentity_1.$Ck, uriIdentityService);
            // User Data Profiles
            const userDataProfilesService = new userDataProfile_3.$J2b(environmentService, fileService, uriIdentityService, logService);
            serviceCollection.set(userDataProfile_1.$Ek, userDataProfilesService);
            const currentProfile = await this.u(workspace, userDataProfilesService, environmentService);
            const userDataProfileService = new userDataProfileService_1.$I2b(currentProfile);
            serviceCollection.set(userDataProfile_2.$CJ, userDataProfileService);
            // Remote Agent
            const remoteSocketFactoryService = new remoteSocketFactoryService_1.$Uk();
            remoteSocketFactoryService.register(0 /* RemoteConnectionType.WebSocket */, new browserSocketFactory_1.$HT(this.f.webSocketFactory));
            serviceCollection.set(remoteSocketFactoryService_1.$Tk, remoteSocketFactoryService);
            const remoteAgentService = this.B(new remoteAgentService_1.$i2b(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService));
            serviceCollection.set(remoteAgentService_2.$jm, remoteAgentService);
            this.B(remoteFileSystemProviderClient_1.$0M.register(remoteAgentService, fileService, logService));
            // Long running services (workspace, config, storage)
            const [configurationService, storageService] = await Promise.all([
                this.t(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService).then(service => {
                    // Workspace
                    serviceCollection.set(workspace_1.$Kh, service);
                    // Configuration
                    serviceCollection.set(configuration_1.$mE, service);
                    return service;
                }),
                this.s(workspace, logService, userDataProfileService).then(service => {
                    // Storage
                    serviceCollection.set(storage_1.$Vo, service);
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
            const workspaceTrustEnablementService = new workspaceTrust_1.$scb(configurationService, environmentService);
            serviceCollection.set(workspaceTrust_2.$0z, workspaceTrustEnablementService);
            const workspaceTrustManagementService = new workspaceTrust_1.$tcb(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, configurationService, workspaceTrustEnablementService, fileService);
            serviceCollection.set(workspaceTrust_2.$$z, workspaceTrustManagementService);
            // Update workspace trust so that configuration is updated accordingly
            configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
            this.B(workspaceTrustManagementService.onDidChangeTrust(() => configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted())));
            // Request Service
            const requestService = new requestService_1.$D2b(remoteAgentService, configurationService, loggerService);
            serviceCollection.set(request_1.$Io, requestService);
            // Userdata Sync Store Management Service
            const userDataSyncStoreManagementService = new userDataSyncStoreService_1.$1Ab(productService, configurationService, storageService);
            serviceCollection.set(userDataSync_1.$Egb, userDataSyncStoreManagementService);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const encryptionService = new encryptionService_1.$_2b();
            serviceCollection.set(encryptionService_2.$BT, encryptionService);
            const secretStorageService = new secretStorageService_1.$$2b(storageService, encryptionService, environmentService, logService);
            serviceCollection.set(secrets_1.$FT, secretStorageService);
            // Userdata Initialize Service
            const userDataInitializers = [];
            userDataInitializers.push(new userDataSyncInit_1.$72b(environmentService, secretStorageService, userDataSyncStoreManagementService, fileService, userDataProfilesService, storageService, productService, requestService, logService, uriIdentityService));
            if (environmentService.options.profile) {
                userDataInitializers.push(new userDataProfileInit_1.$K2b(environmentService, fileService, userDataProfileService, storageService, logService, uriIdentityService, requestService));
            }
            const userDataInitializationService = new userDataInit_1.$xzb(userDataInitializers);
            serviceCollection.set(userDataInit_1.$wzb, userDataInitializationService);
            try {
                await Promise.race([
                    // Do not block more than 5s
                    (0, async_1.$Hg)(5000),
                    this.m(userDataInitializationService, configurationService)
                ]);
            }
            catch (error) {
                logService.error(error);
            }
            return { serviceCollection, configurationService, logService };
        }
        async m(userDataInitializationService, configurationService) {
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
        async n(environmentService, fileService, logService, loggerService, logsPath) {
            // IndexedDB is used for logging and user data
            let indexedDB;
            const userDataStore = 'vscode-userdata-store';
            const logsStore = 'vscode-logs-store';
            const handlesStore = 'vscode-filehandles-store';
            try {
                indexedDB = await indexedDB_1.$3Q.create('vscode-web-db', 3, [userDataStore, logsStore, handlesStore]);
                // Close onWillShutdown
                this.a.add((0, lifecycle_1.$ic)(() => indexedDB?.close()));
            }
            catch (error) {
                logService.error('Error while creating IndexedDB', error);
            }
            // Logger
            if (indexedDB) {
                const logFileSystemProvider = new indexedDBFileSystemProvider_1.$B2b(logsPath.scheme, indexedDB, logsStore, false);
                this.b.push(logFileSystemProvider);
                fileService.registerProvider(logsPath.scheme, logFileSystemProvider);
            }
            else {
                fileService.registerProvider(logsPath.scheme, new inMemoryFilesystemProvider_1.$rAb());
            }
            // User data
            let userDataProvider;
            if (indexedDB) {
                userDataProvider = new indexedDBFileSystemProvider_1.$B2b(network_1.Schemas.vscodeUserData, indexedDB, userDataStore, true);
                this.b.push(userDataProvider);
                this.r(userDataProvider);
            }
            else {
                logService.info('Using in-memory user data provider');
                userDataProvider = new inMemoryFilesystemProvider_1.$rAb();
            }
            fileService.registerProvider(network_1.Schemas.vscodeUserData, userDataProvider);
            // Local file access (if supported by browser)
            if (webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                fileService.registerProvider(network_1.Schemas.file, new htmlFileSystemProvider_1.$46(indexedDB, handlesStore, logService));
            }
            // In-memory
            fileService.registerProvider(network_1.Schemas.tmp, new inMemoryFilesystemProvider_1.$rAb());
        }
        r(provider) {
            (0, actions_1.$Xu)(class ResetUserDataAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.resetUserData',
                        title: { original: 'Reset User Data', value: (0, nls_1.localize)(1, null) },
                        category: actionCommonCategories_1.$Nl.Developer,
                        menu: {
                            id: actions_1.$Ru.CommandPalette
                        }
                    });
                }
                async run(accessor) {
                    const dialogService = accessor.get(dialogs_1.$oA);
                    const hostService = accessor.get(host_1.$VT);
                    const storageService = accessor.get(storage_1.$Vo);
                    const logService = accessor.get(log_1.$5i);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)(2, null)
                    });
                    if (result.confirmed) {
                        try {
                            await provider?.reset();
                            if (storageService instanceof storageService_1.$z2b) {
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
        async s(workspace, logService, userDataProfileService) {
            const storageService = new storageService_1.$z2b(workspace, userDataProfileService, logService);
            try {
                await storageService.initialize();
                // Register to close on shutdown
                this.a.add((0, lifecycle_1.$ic)(() => storageService.close()));
                return storageService;
            }
            catch (error) {
                (0, errors_1.$Y)(error);
                logService.error(error);
                return storageService;
            }
        }
        async t(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService) {
            // Temporary workspaces do not exist on startup because they are
            // just in memory. As such, detect this case and eagerly create
            // the workspace file empty so that it is a valid workspace.
            if ((0, workspace_1.$Qh)(workspace) && (0, workspace_1.$3h)(workspace.configPath)) {
                try {
                    const emptyWorkspace = { folders: [] };
                    await fileService.createFile(workspace.configPath, buffer_1.$Fd.fromString(JSON.stringify(emptyWorkspace, null, '\t')), { overwrite: false });
                }
                catch (error) {
                    // ignore if workspace file already exists
                }
            }
            const configurationCache = new configurationCache_1.$w2b([network_1.Schemas.file, network_1.Schemas.vscodeUserData, network_1.Schemas.tmp] /* Cache all non native resources */, environmentService, fileService);
            const workspaceService = new configurationService_1.$v2b({ remoteAuthority: this.f.remoteAuthority, configurationCache }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, new policy_1.$_m());
            try {
                await workspaceService.initialize(workspace);
                return workspaceService;
            }
            catch (error) {
                (0, errors_1.$Y)(error);
                logService.error(error);
                return workspaceService;
            }
        }
        async u(workspace, userDataProfilesService, environmentService) {
            if (environmentService.options?.profile) {
                const profile = userDataProfilesService.profiles.find(p => p.name === environmentService.options?.profile?.name);
                if (profile) {
                    return profile;
                }
                return userDataProfilesService.createNamedProfile(environmentService.options?.profile?.name, undefined, workspace);
            }
            return userDataProfilesService.getProfileForWorkspace(workspace) ?? userDataProfilesService.defaultProfile;
        }
        w() {
            let workspace = undefined;
            if (this.f.workspaceProvider) {
                workspace = this.f.workspaceProvider.workspace;
            }
            // Multi-root workspace
            if (workspace && (0, window_1.$QD)(workspace)) {
                return (0, workspaces_1.$sU)(workspace.workspaceUri);
            }
            // Single-folder workspace
            if (workspace && (0, window_1.$RD)(workspace)) {
                return (0, workspaces_1.$tU)(workspace.folderUri);
            }
            // Empty window workspace
            return workspace_1.$Oh;
        }
    }
    exports.$a3b = $a3b;
});
//# sourceMappingURL=web.main.js.map