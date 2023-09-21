/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/arrays", "vs/base/common/event", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.mp", "vs/code/node/sharedProcess/contrib/codeCacheCleaner", "vs/code/node/sharedProcess/contrib/languagePackCachedDataCleaner", "vs/code/node/sharedProcess/contrib/localizationsUpdater", "vs/code/node/sharedProcess/contrib/logsDataCleaner", "vs/code/node/sharedProcess/contrib/storageDataCleaner", "vs/platform/checksum/common/checksumService", "vs/platform/checksum/node/checksumService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/diagnostics/common/diagnostics", "vs/platform/diagnostics/node/diagnosticsService", "vs/platform/download/common/download", "vs/platform/download/common/downloadService", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/extensionManagement/common/extensionManagementIpc", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/languagePacks/common/languagePacks", "vs/platform/languagePacks/node/languagePacks", "vs/platform/log/common/log", "vs/platform/log/common/logIpc", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/telemetry/common/telemetryLogAppender", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/node/customEndpointTelemetryService", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSyncLocalStoreService", "vs/platform/userDataSync/common/userDataSyncIpc", "vs/platform/userDataSync/common/userDataSyncLog", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/userDataSync/common/userDataSyncEnablementService", "vs/platform/userDataSync/common/userDataSyncService", "vs/platform/userDataSync/common/userDataSyncServiceIpc", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/userDataProfile/node/userDataProfileStorageService", "vs/platform/windows/node/windowTracker", "vs/platform/sign/common/sign", "vs/platform/sign/node/signService", "vs/platform/tunnel/common/tunnel", "vs/platform/tunnel/node/tunnelService", "vs/platform/remote/common/sharedProcessTunnelService", "vs/platform/tunnel/node/sharedProcessTunnelService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/common/platform", "vs/platform/userData/common/fileUserDataProvider", "vs/platform/files/common/diskFileSystemProviderClient", "vs/platform/profiling/node/profilingService", "vs/platform/profiling/common/profiling", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionsScannerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/policy/common/policyIpc", "vs/platform/policy/common/policy", "vs/platform/userDataProfile/common/userDataProfileIpc", "vs/platform/telemetry/node/1dsAppender", "vs/code/node/sharedProcess/contrib/userDataProfilesCleaner", "vs/platform/remoteTunnel/common/remoteTunnel", "vs/platform/userDataSync/common/userDataSyncResourceProvider", "vs/code/node/sharedProcess/contrib/extensions", "vs/nls", "vs/platform/log/common/logService", "vs/platform/lifecycle/node/sharedProcessLifecycleService", "vs/platform/remoteTunnel/node/remoteTunnelService", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/request/common/requestIpc", "vs/platform/extensionRecommendations/common/extensionRecommendationsIpc", "vs/platform/native/common/native", "vs/platform/userDataSync/node/userDataAutoSyncService", "vs/platform/extensionManagement/node/extensionTipsService", "vs/platform/ipc/common/mainProcessService", "vs/platform/storage/common/storageService", "vs/platform/remote/common/remoteSocketFactoryService", "vs/platform/remote/node/nodeSocketFactory", "vs/platform/environment/node/environmentService", "vs/platform/voiceRecognition/node/voiceRecognitionService", "vs/code/node/sharedProcess/contrib/voiceTranscriber", "vs/platform/sharedProcess/common/sharedProcess"], function (require, exports, os_1, errorMessage_1, errors_1, lifecycle_1, network_1, uri_1, arrays_1, event_1, ipc_1, ipc_mp_1, codeCacheCleaner_1, languagePackCachedDataCleaner_1, localizationsUpdater_1, logsDataCleaner_1, storageDataCleaner_1, checksumService_1, checksumService_2, configuration_1, configurationService_1, diagnostics_1, diagnosticsService_1, download_1, downloadService_1, environment_1, extensionEnablementService_1, extensionGalleryService_1, extensionManagement_1, extensionSignatureVerificationService_1, extensionManagementIpc_1, extensionManagementService_1, extensionRecommendations_1, files_1, fileService_1, diskFileSystemProvider_1, descriptors_1, instantiation_1, instantiationService_1, serviceCollection_1, languagePacks_1, languagePacks_2, log_1, logIpc_1, product_1, productService_1, request_1, storage_1, commonProperties_1, telemetry_1, telemetryIpc_1, telemetryLogAppender_1, telemetryService_1, telemetryUtils_1, customEndpointTelemetryService_1, extensionStorage_1, ignoredExtensions_1, userDataSync_1, userDataSyncAccount_1, userDataSyncLocalStoreService_1, userDataSyncIpc_1, userDataSyncLog_1, userDataSyncMachines_1, userDataSyncEnablementService_1, userDataSyncService_1, userDataSyncServiceIpc_1, userDataSyncStoreService_1, userDataProfileStorageService_1, userDataProfileStorageService_2, windowTracker_1, sign_1, signService_1, tunnel_1, tunnelService_1, sharedProcessTunnelService_1, sharedProcessTunnelService_2, uriIdentity_1, uriIdentityService_1, platform_1, fileUserDataProvider_1, diskFileSystemProviderClient_1, profilingService_1, profiling_1, extensionsScannerService_1, extensionsScannerService_2, userDataProfile_1, extensionsProfileScannerService_1, policyIpc_1, policy_1, userDataProfileIpc_1, _1dsAppender_1, userDataProfilesCleaner_1, remoteTunnel_1, userDataSyncResourceProvider_1, extensions_1, nls_1, logService_1, sharedProcessLifecycleService_1, remoteTunnelService_1, extensionsProfileScannerService_2, requestIpc_1, extensionRecommendationsIpc_1, native_1, userDataAutoSyncService_1, extensionTipsService_1, mainProcessService_1, storageService_1, remoteSocketFactoryService_1, nodeSocketFactory_1, environmentService_1, voiceRecognitionService_1, voiceTranscriber_1, sharedProcess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    class SharedProcessMain extends lifecycle_1.Disposable {
        constructor(configuration) {
            super();
            this.configuration = configuration;
            this.server = this._register(new ipc_mp_1.Server(this));
            this.lifecycleService = undefined;
            this.onDidWindowConnectRaw = this._register(new event_1.Emitter());
            this.registerListeners();
        }
        registerListeners() {
            // Shared process lifecycle
            let didExit = false;
            const onExit = () => {
                if (!didExit) {
                    didExit = true;
                    this.lifecycleService?.fireOnWillShutdown();
                    this.dispose();
                }
            };
            process.once('exit', onExit);
            (0, ipc_mp_1.once)(process.parentPort, sharedProcess_1.SharedProcessLifecycle.exit, onExit);
        }
        async init() {
            // Services
            const instantiationService = await this.initServices();
            // Config
            (0, userDataSync_1.registerConfiguration)();
            instantiationService.invokeFunction(accessor => {
                const logService = accessor.get(log_1.ILogService);
                // Log info
                logService.trace('sharedProcess configuration', JSON.stringify(this.configuration));
                // Channels
                this.initChannels(accessor);
                // Error handler
                this.registerErrorHandler(logService);
            });
            // Instantiate Contributions
            this._register((0, lifecycle_1.combinedDisposable)(instantiationService.createInstance(codeCacheCleaner_1.CodeCacheCleaner, this.configuration.codeCachePath), instantiationService.createInstance(languagePackCachedDataCleaner_1.LanguagePackCachedDataCleaner), instantiationService.createInstance(storageDataCleaner_1.UnusedWorkspaceStorageDataCleaner), instantiationService.createInstance(logsDataCleaner_1.LogsDataCleaner), instantiationService.createInstance(localizationsUpdater_1.LocalizationsUpdater), instantiationService.createInstance(extensions_1.ExtensionsContributions), instantiationService.createInstance(userDataProfilesCleaner_1.UserDataProfilesCleaner), instantiationService.createInstance(voiceTranscriber_1.VoiceTranscriptionManager, this.onDidWindowConnectRaw.event)));
        }
        async initServices() {
            const services = new serviceCollection_1.ServiceCollection();
            // Product
            const productService = { _serviceBrand: undefined, ...product_1.default };
            services.set(productService_1.IProductService, productService);
            // Main Process
            const mainRouter = new ipc_1.StaticRouter(ctx => ctx === 'main');
            const mainProcessService = new mainProcessService_1.MainProcessService(this.server, mainRouter);
            services.set(mainProcessService_1.IMainProcessService, mainProcessService);
            // Policies
            const policyService = this.configuration.policiesData ? new policyIpc_1.PolicyChannelClient(this.configuration.policiesData, mainProcessService.getChannel('policy')) : new policy_1.NullPolicyService();
            services.set(policy_1.IPolicyService, policyService);
            // Environment
            const environmentService = new environmentService_1.NativeEnvironmentService(this.configuration.args, productService);
            services.set(environment_1.INativeEnvironmentService, environmentService);
            // Logger
            const loggerService = new logIpc_1.LoggerChannelClient(undefined, this.configuration.logLevel, environmentService.logsHome, this.configuration.loggers.map(loggerResource => ({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource) })), mainProcessService.getChannel('logger'));
            services.set(log_1.ILoggerService, loggerService);
            // Log
            const logger = this._register(loggerService.createLogger('sharedprocess', { name: (0, nls_1.localize)('sharedLog', "Shared") }));
            const consoleLogger = this._register(new log_1.ConsoleLogger(logger.getLevel()));
            const logService = this._register(new logService_1.LogService(logger, [consoleLogger]));
            services.set(log_1.ILogService, logService);
            // Lifecycle
            this.lifecycleService = this._register(new sharedProcessLifecycleService_1.SharedProcessLifecycleService(logService));
            services.set(sharedProcessLifecycleService_1.ISharedProcessLifecycleService, this.lifecycleService);
            // Files
            const fileService = this._register(new fileService_1.FileService(logService));
            services.set(files_1.IFileService, fileService);
            const diskFileSystemProvider = this._register(new diskFileSystemProvider_1.DiskFileSystemProvider(logService));
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // URI Identity
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            services.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
            // User Data Profiles
            const userDataProfilesService = this._register(new userDataProfileIpc_1.UserDataProfilesService(this.configuration.profiles.all, uri_1.URI.revive(this.configuration.profiles.home).with({ scheme: environmentService.userRoamingDataHome.scheme }), mainProcessService.getChannel('userDataProfiles')));
            services.set(userDataProfile_1.IUserDataProfilesService, userDataProfilesService);
            const userDataFileSystemProvider = this._register(new fileUserDataProvider_1.FileUserDataProvider(network_1.Schemas.file, 
            // Specifically for user data, use the disk file system provider
            // from the main process to enable atomic read/write operations.
            // Since user data can change very frequently across multiple
            // processes, we want a single process handling these operations.
            this._register(new diskFileSystemProviderClient_1.DiskFileSystemProviderClient(mainProcessService.getChannel(diskFileSystemProviderClient_1.LOCAL_FILE_SYSTEM_CHANNEL_NAME), { pathCaseSensitive: platform_1.isLinux })), network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
            fileService.registerProvider(network_1.Schemas.vscodeUserData, userDataFileSystemProvider);
            // Configuration
            const configurationService = this._register(new configurationService_1.ConfigurationService(userDataProfilesService.defaultProfile.settingsResource, fileService, policyService, logService));
            services.set(configuration_1.IConfigurationService, configurationService);
            // Storage (global access only)
            const storageService = new storageService_1.RemoteStorageService(undefined, { defaultProfile: userDataProfilesService.defaultProfile, currentProfile: userDataProfilesService.defaultProfile }, mainProcessService, environmentService);
            services.set(storage_1.IStorageService, storageService);
            this._register((0, lifecycle_1.toDisposable)(() => storageService.flush()));
            // Initialize config & storage in parallel
            await Promise.all([
                configurationService.initialize(),
                storageService.initialize()
            ]);
            // Request
            const requestService = new requestIpc_1.RequestChannelClient(mainProcessService.getChannel('request'));
            services.set(request_1.IRequestService, requestService);
            // Checksum
            services.set(checksumService_1.IChecksumService, new descriptors_1.SyncDescriptor(checksumService_2.ChecksumService, undefined, false /* proxied to other processes */));
            // V8 Inspect profiler
            services.set(profiling_1.IV8InspectProfilingService, new descriptors_1.SyncDescriptor(profilingService_1.InspectProfilingService, undefined, false /* proxied to other processes */));
            // Native Host
            const nativeHostService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('nativeHost'));
            services.set(native_1.INativeHostService, nativeHostService);
            // Download
            services.set(download_1.IDownloadService, new descriptors_1.SyncDescriptor(downloadService_1.DownloadService, undefined, true));
            // Extension recommendations
            const activeWindowManager = this._register(new windowTracker_1.ActiveWindowManager(nativeHostService));
            const activeWindowRouter = new ipc_1.StaticRouter(ctx => activeWindowManager.getActiveClientId().then(id => ctx === id));
            services.set(extensionRecommendations_1.IExtensionRecommendationNotificationService, new extensionRecommendationsIpc_1.ExtensionRecommendationNotificationServiceChannelClient(this.server.getChannel('extensionRecommendationNotification', activeWindowRouter)));
            // Telemetry
            let telemetryService;
            const appenders = [];
            const internalTelemetry = (0, telemetryUtils_1.isInternalTelemetry)(productService, configurationService);
            if ((0, telemetryUtils_1.supportsTelemetry)(productService, environmentService)) {
                const logAppender = new telemetryLogAppender_1.TelemetryLogAppender(logService, loggerService, environmentService, productService);
                appenders.push(logAppender);
                if (productService.aiConfig?.ariaKey) {
                    const collectorAppender = new _1dsAppender_1.OneDataSystemAppender(requestService, internalTelemetry, 'monacoworkbench', null, productService.aiConfig.ariaKey);
                    this._register((0, lifecycle_1.toDisposable)(() => collectorAppender.flush())); // Ensure the 1DS appender is disposed so that it flushes remaining data
                    appenders.push(collectorAppender);
                }
                telemetryService = new telemetryService_1.TelemetryService({
                    appenders,
                    commonProperties: (0, commonProperties_1.resolveCommonProperties)((0, os_1.release)(), (0, os_1.hostname)(), process.arch, productService.commit, productService.version, this.configuration.machineId, internalTelemetry),
                    sendErrorTelemetry: true,
                    piiPaths: (0, telemetryUtils_1.getPiiPathsFromEnvironment)(environmentService),
                }, configurationService, productService);
            }
            else {
                telemetryService = telemetryUtils_1.NullTelemetryService;
                const nullAppender = telemetryUtils_1.NullAppender;
                appenders.push(nullAppender);
            }
            this.server.registerChannel('telemetryAppender', new telemetryIpc_1.TelemetryAppenderChannel(appenders));
            services.set(telemetry_1.ITelemetryService, telemetryService);
            // Custom Endpoint Telemetry
            const customEndpointTelemetryService = new customEndpointTelemetryService_1.CustomEndpointTelemetryService(configurationService, telemetryService, logService, loggerService, environmentService, productService);
            services.set(telemetry_1.ICustomEndpointTelemetryService, customEndpointTelemetryService);
            // Extension Management
            services.set(extensionsProfileScannerService_1.IExtensionsProfileScannerService, new descriptors_1.SyncDescriptor(extensionsProfileScannerService_2.ExtensionsProfileScannerService, undefined, true));
            services.set(extensionsScannerService_1.IExtensionsScannerService, new descriptors_1.SyncDescriptor(extensionsScannerService_2.ExtensionsScannerService, undefined, true));
            services.set(extensionSignatureVerificationService_1.IExtensionSignatureVerificationService, new descriptors_1.SyncDescriptor(extensionSignatureVerificationService_1.ExtensionSignatureVerificationService, undefined, true));
            services.set(extensionManagementService_1.INativeServerExtensionManagementService, new descriptors_1.SyncDescriptor(extensionManagementService_1.ExtensionManagementService, undefined, true));
            // Extension Gallery
            services.set(extensionManagement_1.IExtensionGalleryService, new descriptors_1.SyncDescriptor(extensionGalleryService_1.ExtensionGalleryService, undefined, true));
            // Extension Tips
            services.set(extensionManagement_1.IExtensionTipsService, new descriptors_1.SyncDescriptor(extensionTipsService_1.ExtensionTipsService, undefined, false /* Eagerly scans and computes exe based recommendations */));
            // Localizations
            services.set(languagePacks_1.ILanguagePackService, new descriptors_1.SyncDescriptor(languagePacks_2.NativeLanguagePackService, undefined, false /* proxied to other processes */));
            // Diagnostics
            services.set(diagnostics_1.IDiagnosticsService, new descriptors_1.SyncDescriptor(diagnosticsService_1.DiagnosticsService, undefined, false /* proxied to other processes */));
            // Settings Sync
            services.set(userDataSyncAccount_1.IUserDataSyncAccountService, new descriptors_1.SyncDescriptor(userDataSyncAccount_1.UserDataSyncAccountService, undefined, true));
            services.set(userDataSync_1.IUserDataSyncLogService, new descriptors_1.SyncDescriptor(userDataSyncLog_1.UserDataSyncLogService, undefined, true));
            services.set(userDataSync_1.IUserDataSyncUtilService, new userDataSyncIpc_1.UserDataSyncUtilServiceClient(this.server.getChannel('userDataSyncUtil', client => client.ctx !== 'main')));
            services.set(extensionManagement_1.IGlobalExtensionEnablementService, new descriptors_1.SyncDescriptor(extensionEnablementService_1.GlobalExtensionEnablementService, undefined, false /* Eagerly resets installed extensions */));
            services.set(ignoredExtensions_1.IIgnoredExtensionsManagementService, new descriptors_1.SyncDescriptor(ignoredExtensions_1.IgnoredExtensionsManagementService, undefined, true));
            services.set(extensionStorage_1.IExtensionStorageService, new descriptors_1.SyncDescriptor(extensionStorage_1.ExtensionStorageService));
            services.set(userDataSync_1.IUserDataSyncStoreManagementService, new descriptors_1.SyncDescriptor(userDataSyncStoreService_1.UserDataSyncStoreManagementService, undefined, true));
            services.set(userDataSync_1.IUserDataSyncStoreService, new descriptors_1.SyncDescriptor(userDataSyncStoreService_1.UserDataSyncStoreService, undefined, true));
            services.set(userDataSyncMachines_1.IUserDataSyncMachinesService, new descriptors_1.SyncDescriptor(userDataSyncMachines_1.UserDataSyncMachinesService, undefined, true));
            services.set(userDataSync_1.IUserDataSyncLocalStoreService, new descriptors_1.SyncDescriptor(userDataSyncLocalStoreService_1.UserDataSyncLocalStoreService, undefined, false /* Eagerly cleans up old backups */));
            services.set(userDataSync_1.IUserDataSyncEnablementService, new descriptors_1.SyncDescriptor(userDataSyncEnablementService_1.UserDataSyncEnablementService, undefined, true));
            services.set(userDataSync_1.IUserDataSyncService, new descriptors_1.SyncDescriptor(userDataSyncService_1.UserDataSyncService, undefined, false /* Initializes the Sync State */));
            services.set(userDataProfileStorageService_1.IUserDataProfileStorageService, new descriptors_1.SyncDescriptor(userDataProfileStorageService_2.NativeUserDataProfileStorageService, undefined, true));
            services.set(userDataSync_1.IUserDataSyncResourceProviderService, new descriptors_1.SyncDescriptor(userDataSyncResourceProvider_1.UserDataSyncResourceProviderService, undefined, true));
            // Signing
            services.set(sign_1.ISignService, new descriptors_1.SyncDescriptor(signService_1.SignService, undefined, false /* proxied to other processes */));
            // Tunnel
            const remoteSocketFactoryService = new remoteSocketFactoryService_1.RemoteSocketFactoryService();
            services.set(remoteSocketFactoryService_1.IRemoteSocketFactoryService, remoteSocketFactoryService);
            remoteSocketFactoryService.register(0 /* RemoteConnectionType.WebSocket */, nodeSocketFactory_1.nodeSocketFactory);
            services.set(tunnel_1.ISharedTunnelsService, new descriptors_1.SyncDescriptor(tunnelService_1.SharedTunnelsService));
            services.set(sharedProcessTunnelService_1.ISharedProcessTunnelService, new descriptors_1.SyncDescriptor(sharedProcessTunnelService_2.SharedProcessTunnelService));
            // Remote Tunnel
            services.set(remoteTunnel_1.IRemoteTunnelService, new descriptors_1.SyncDescriptor(remoteTunnelService_1.RemoteTunnelService));
            // Voice Recognition
            services.set(voiceRecognitionService_1.IVoiceRecognitionService, new descriptors_1.SyncDescriptor(voiceRecognitionService_1.VoiceRecognitionService));
            return new instantiationService_1.InstantiationService(services);
        }
        initChannels(accessor) {
            const disposables = this._register(new lifecycle_1.DisposableStore());
            // Extensions Management
            const channel = new extensionManagementIpc_1.ExtensionManagementChannel(accessor.get(extensionManagement_1.IExtensionManagementService), () => null);
            this.server.registerChannel('extensions', channel);
            // Language Packs
            const languagePacksChannel = ipc_1.ProxyChannel.fromService(accessor.get(languagePacks_1.ILanguagePackService), disposables);
            this.server.registerChannel('languagePacks', languagePacksChannel);
            // Diagnostics
            const diagnosticsChannel = ipc_1.ProxyChannel.fromService(accessor.get(diagnostics_1.IDiagnosticsService), disposables);
            this.server.registerChannel('diagnostics', diagnosticsChannel);
            // Extension Tips
            const extensionTipsChannel = new extensionManagementIpc_1.ExtensionTipsChannel(accessor.get(extensionManagement_1.IExtensionTipsService));
            this.server.registerChannel('extensionTipsService', extensionTipsChannel);
            // Checksum
            const checksumChannel = ipc_1.ProxyChannel.fromService(accessor.get(checksumService_1.IChecksumService), disposables);
            this.server.registerChannel('checksum', checksumChannel);
            // Profiling
            const profilingChannel = ipc_1.ProxyChannel.fromService(accessor.get(profiling_1.IV8InspectProfilingService), disposables);
            this.server.registerChannel('v8InspectProfiling', profilingChannel);
            // Settings Sync
            const userDataSyncMachineChannel = new userDataSyncIpc_1.UserDataSyncMachinesServiceChannel(accessor.get(userDataSyncMachines_1.IUserDataSyncMachinesService));
            this.server.registerChannel('userDataSyncMachines', userDataSyncMachineChannel);
            // Custom Endpoint Telemetry
            const customEndpointTelemetryChannel = ipc_1.ProxyChannel.fromService(accessor.get(telemetry_1.ICustomEndpointTelemetryService), disposables);
            this.server.registerChannel('customEndpointTelemetry', customEndpointTelemetryChannel);
            const userDataSyncAccountChannel = new userDataSyncIpc_1.UserDataSyncAccountServiceChannel(accessor.get(userDataSyncAccount_1.IUserDataSyncAccountService));
            this.server.registerChannel('userDataSyncAccount', userDataSyncAccountChannel);
            const userDataSyncStoreManagementChannel = new userDataSyncIpc_1.UserDataSyncStoreManagementServiceChannel(accessor.get(userDataSync_1.IUserDataSyncStoreManagementService));
            this.server.registerChannel('userDataSyncStoreManagement', userDataSyncStoreManagementChannel);
            const userDataSyncChannel = new userDataSyncServiceIpc_1.UserDataSyncChannel(accessor.get(userDataSync_1.IUserDataSyncService), accessor.get(userDataProfile_1.IUserDataProfilesService), accessor.get(log_1.ILogService));
            this.server.registerChannel('userDataSync', userDataSyncChannel);
            const userDataAutoSync = this._register(accessor.get(instantiation_1.IInstantiationService).createInstance(userDataAutoSyncService_1.UserDataAutoSyncService));
            const userDataAutoSyncChannel = new userDataSyncIpc_1.UserDataAutoSyncChannel(userDataAutoSync);
            this.server.registerChannel('userDataAutoSync', userDataAutoSyncChannel);
            this.server.registerChannel('IUserDataSyncResourceProviderService', ipc_1.ProxyChannel.fromService(accessor.get(userDataSync_1.IUserDataSyncResourceProviderService), disposables));
            // Tunnel
            const sharedProcessTunnelChannel = ipc_1.ProxyChannel.fromService(accessor.get(sharedProcessTunnelService_1.ISharedProcessTunnelService), disposables);
            this.server.registerChannel(sharedProcessTunnelService_1.ipcSharedProcessTunnelChannelName, sharedProcessTunnelChannel);
            // Remote Tunnel
            const remoteTunnelChannel = ipc_1.ProxyChannel.fromService(accessor.get(remoteTunnel_1.IRemoteTunnelService), disposables);
            this.server.registerChannel('remoteTunnel', remoteTunnelChannel);
        }
        registerErrorHandler(logService) {
            // Listen on global error events
            process.on('uncaughtException', error => (0, errors_1.onUnexpectedError)(error));
            process.on('unhandledRejection', (reason) => (0, errors_1.onUnexpectedError)(reason));
            // Install handler for unexpected errors
            (0, errors_1.setUnexpectedErrorHandler)(error => {
                const message = (0, errorMessage_1.toErrorMessage)(error, true);
                if (!message) {
                    return;
                }
                logService.error(`[uncaught exception in sharedProcess]: ${message}`);
            });
        }
        handledClientConnection(e) {
            // This filter on message port messages will look for
            // attempts of a window to connect raw to the shared
            // process to handle these connections separate from
            // our IPC based protocol.
            if (e.data !== sharedProcess_1.SharedProcessRawConnection.response) {
                return false;
            }
            const port = (0, arrays_1.firstOrDefault)(e.ports);
            if (port) {
                this.onDidWindowConnectRaw.fire(port);
                return true;
            }
            return false;
        }
    }
    async function main(configuration) {
        // create shared process and signal back to main that we are
        // ready to accept message ports as client connections
        const sharedProcess = new SharedProcessMain(configuration);
        process.parentPort.postMessage(sharedProcess_1.SharedProcessLifecycle.ipcReady);
        // await initialization and signal this back to electron-main
        await sharedProcess.init();
        process.parentPort.postMessage(sharedProcess_1.SharedProcessLifecycle.initDone);
    }
    exports.main = main;
    process.parentPort.once('message', (e) => {
        main(e.data);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkUHJvY2Vzc01haW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9jb2RlL25vZGUvc2hhcmVkUHJvY2Vzcy9zaGFyZWRQcm9jZXNzTWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxSGhHLE1BQU0saUJBQWtCLFNBQVEsc0JBQVU7UUFRekMsWUFBb0IsYUFBMEM7WUFDN0QsS0FBSyxFQUFFLENBQUM7WUFEVyxrQkFBYSxHQUFiLGFBQWEsQ0FBNkI7WUFON0MsV0FBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUErQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFNUUscUJBQWdCLEdBQThDLFNBQVMsQ0FBQztZQUUvRCwwQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFtQixDQUFDLENBQUM7WUFLdkYsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QiwyQkFBMkI7WUFDM0IsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLE1BQU0sTUFBTSxHQUFHLEdBQUcsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDYixPQUFPLEdBQUcsSUFBSSxDQUFDO29CQUVmLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxDQUFDO29CQUM1QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ2Y7WUFDRixDQUFDLENBQUM7WUFDRixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM3QixJQUFBLGFBQUksRUFBQyxPQUFPLENBQUMsVUFBVSxFQUFFLHNDQUFzQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUk7WUFFVCxX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