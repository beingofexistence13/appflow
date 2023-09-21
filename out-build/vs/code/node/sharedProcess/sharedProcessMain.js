/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/arrays", "vs/base/common/event", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.mp", "vs/code/node/sharedProcess/contrib/codeCacheCleaner", "vs/code/node/sharedProcess/contrib/languagePackCachedDataCleaner", "vs/code/node/sharedProcess/contrib/localizationsUpdater", "vs/code/node/sharedProcess/contrib/logsDataCleaner", "vs/code/node/sharedProcess/contrib/storageDataCleaner", "vs/platform/checksum/common/checksumService", "vs/platform/checksum/node/checksumService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/diagnostics/common/diagnostics", "vs/platform/diagnostics/node/diagnosticsService", "vs/platform/download/common/download", "vs/platform/download/common/downloadService", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/extensionManagement/common/extensionManagementIpc", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/languagePacks/common/languagePacks", "vs/platform/languagePacks/node/languagePacks", "vs/platform/log/common/log", "vs/platform/log/common/logIpc", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/telemetry/common/telemetryLogAppender", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/node/customEndpointTelemetryService", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSyncLocalStoreService", "vs/platform/userDataSync/common/userDataSyncIpc", "vs/platform/userDataSync/common/userDataSyncLog", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/userDataSync/common/userDataSyncEnablementService", "vs/platform/userDataSync/common/userDataSyncService", "vs/platform/userDataSync/common/userDataSyncServiceIpc", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/userDataProfile/node/userDataProfileStorageService", "vs/platform/windows/node/windowTracker", "vs/platform/sign/common/sign", "vs/platform/sign/node/signService", "vs/platform/tunnel/common/tunnel", "vs/platform/tunnel/node/tunnelService", "vs/platform/remote/common/sharedProcessTunnelService", "vs/platform/tunnel/node/sharedProcessTunnelService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/common/platform", "vs/platform/userData/common/fileUserDataProvider", "vs/platform/files/common/diskFileSystemProviderClient", "vs/platform/profiling/node/profilingService", "vs/platform/profiling/common/profiling", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionsScannerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/policy/common/policyIpc", "vs/platform/policy/common/policy", "vs/platform/userDataProfile/common/userDataProfileIpc", "vs/platform/telemetry/node/1dsAppender", "vs/code/node/sharedProcess/contrib/userDataProfilesCleaner", "vs/platform/remoteTunnel/common/remoteTunnel", "vs/platform/userDataSync/common/userDataSyncResourceProvider", "vs/code/node/sharedProcess/contrib/extensions", "vs/nls!vs/code/node/sharedProcess/sharedProcessMain", "vs/platform/log/common/logService", "vs/platform/lifecycle/node/sharedProcessLifecycleService", "vs/platform/remoteTunnel/node/remoteTunnelService", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/request/common/requestIpc", "vs/platform/extensionRecommendations/common/extensionRecommendationsIpc", "vs/platform/native/common/native", "vs/platform/userDataSync/node/userDataAutoSyncService", "vs/platform/extensionManagement/node/extensionTipsService", "vs/platform/ipc/common/mainProcessService", "vs/platform/storage/common/storageService", "vs/platform/remote/common/remoteSocketFactoryService", "vs/platform/remote/node/nodeSocketFactory", "vs/platform/environment/node/environmentService", "vs/platform/voiceRecognition/node/voiceRecognitionService", "vs/code/node/sharedProcess/contrib/voiceTranscriber", "vs/platform/sharedProcess/common/sharedProcess"], function (require, exports, os_1, errorMessage_1, errors_1, lifecycle_1, network_1, uri_1, arrays_1, event_1, ipc_1, ipc_mp_1, codeCacheCleaner_1, languagePackCachedDataCleaner_1, localizationsUpdater_1, logsDataCleaner_1, storageDataCleaner_1, checksumService_1, checksumService_2, configuration_1, configurationService_1, diagnostics_1, diagnosticsService_1, download_1, downloadService_1, environment_1, extensionEnablementService_1, extensionGalleryService_1, extensionManagement_1, extensionSignatureVerificationService_1, extensionManagementIpc_1, extensionManagementService_1, extensionRecommendations_1, files_1, fileService_1, diskFileSystemProvider_1, descriptors_1, instantiation_1, instantiationService_1, serviceCollection_1, languagePacks_1, languagePacks_2, log_1, logIpc_1, product_1, productService_1, request_1, storage_1, commonProperties_1, telemetry_1, telemetryIpc_1, telemetryLogAppender_1, telemetryService_1, telemetryUtils_1, customEndpointTelemetryService_1, extensionStorage_1, ignoredExtensions_1, userDataSync_1, userDataSyncAccount_1, userDataSyncLocalStoreService_1, userDataSyncIpc_1, userDataSyncLog_1, userDataSyncMachines_1, userDataSyncEnablementService_1, userDataSyncService_1, userDataSyncServiceIpc_1, userDataSyncStoreService_1, userDataProfileStorageService_1, userDataProfileStorageService_2, windowTracker_1, sign_1, signService_1, tunnel_1, tunnelService_1, sharedProcessTunnelService_1, sharedProcessTunnelService_2, uriIdentity_1, uriIdentityService_1, platform_1, fileUserDataProvider_1, diskFileSystemProviderClient_1, profilingService_1, profiling_1, extensionsScannerService_1, extensionsScannerService_2, userDataProfile_1, extensionsProfileScannerService_1, policyIpc_1, policy_1, userDataProfileIpc_1, _1dsAppender_1, userDataProfilesCleaner_1, remoteTunnel_1, userDataSyncResourceProvider_1, extensions_1, nls_1, logService_1, sharedProcessLifecycleService_1, remoteTunnelService_1, extensionsProfileScannerService_2, requestIpc_1, extensionRecommendationsIpc_1, native_1, userDataAutoSyncService_1, extensionTipsService_1, mainProcessService_1, storageService_1, remoteSocketFactoryService_1, nodeSocketFactory_1, environmentService_1, voiceRecognitionService_1, voiceTranscriber_1, sharedProcess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    class SharedProcessMain extends lifecycle_1.$kc {
        constructor(f) {
            super();
            this.f = f;
            this.a = this.B(new ipc_mp_1.$8S(this));
            this.b = undefined;
            this.c = this.B(new event_1.$fd());
            this.g();
        }
        g() {
            // Shared process lifecycle
            let didExit = false;
            const onExit = () => {
                if (!didExit) {
                    didExit = true;
                    this.b?.fireOnWillShutdown();
                    this.dispose();
                }
            };
            process.once('exit', onExit);
            (0, ipc_mp_1.$9S)(process.parentPort, sharedProcess_1.$w6b.exit, onExit);
        }
        async init() {
            // Services
            const instantiationService = await this.h();
            // Config
            (0, userDataSync_1.$zgb)();
            instantiationService.invokeFunction(accessor => {
                const logService = accessor.get(log_1.$5i);
                // Log info
                logService.trace('sharedProcess configuration', JSON.stringify(this.f));
                // Channels
                this.j(accessor);
                // Error handler
                this.m(logService);
            });
            // Instantiate Contributions
            this.B((0, lifecycle_1.$hc)(instantiationService.createInstance(codeCacheCleaner_1.$L7b, this.f.codeCachePath), instantiationService.createInstance(languagePackCachedDataCleaner_1.$M7b), instantiationService.createInstance(storageDataCleaner_1.$P7b), instantiationService.createInstance(logsDataCleaner_1.$O7b), instantiationService.createInstance(localizationsUpdater_1.$N7b), instantiationService.createInstance(extensions_1.$d8b), instantiationService.createInstance(userDataProfilesCleaner_1.$87b), instantiationService.createInstance(voiceTranscriber_1.$p8b, this.c.event)));
        }
        async h() {
            const services = new serviceCollection_1.$zh();
            // Product
            const productService = { _serviceBrand: undefined, ...product_1.default };
            services.set(productService_1.$kj, productService);
            // Main Process
            const mainRouter = new ipc_1.$jh(ctx => ctx === 'main');
            const mainProcessService = new mainProcessService_1.$p7b(this.a, mainRouter);
            services.set(mainProcessService_1.$o7b, mainProcessService);
            // Policies
            const policyService = this.f.policiesData ? new policyIpc_1.$16b(this.f.policiesData, mainProcessService.getChannel('policy')) : new policy_1.$_m();
            services.set(policy_1.$0m, policyService);
            // Environment
            const environmentService = new environmentService_1.$_l(this.f.args, productService);
            services.set(environment_1.$Jh, environmentService);
            // Logger
            const loggerService = new logIpc_1.$1q(undefined, this.f.logLevel, environmentService.logsHome, this.f.loggers.map(loggerResource => ({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource) })), mainProcessService.getChannel('logger'));
            services.set(log_1.$6i, loggerService);
            // Log
            const logger = this.B(loggerService.createLogger('sharedprocess', { name: (0, nls_1.localize)(0, null) }));
            const consoleLogger = this.B(new log_1.$aj(logger.getLevel()));
            const logService = this.B(new logService_1.$mN(logger, [consoleLogger]));
            services.set(log_1.$5i, logService);
            // Lifecycle
            this.b = this.B(new sharedProcessLifecycleService_1.$f8b(logService));
            services.set(sharedProcessLifecycleService_1.$e8b, this.b);
            // Files
            const fileService = this.B(new fileService_1.$Dp(logService));
            services.set(files_1.$6j, fileService);
            const diskFileSystemProvider = this.B(new diskFileSystemProvider_1.$3p(logService));
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // URI Identity
            const uriIdentityService = new uriIdentityService_1.$pr(fileService);
            services.set(uriIdentity_1.$Ck, uriIdentityService);
            // User Data Profiles
            const userDataProfilesService = this.B(new userDataProfileIpc_1.$tN(this.f.profiles.all, uri_1.URI.revive(this.f.profiles.home).with({ scheme: environmentService.userRoamingDataHome.scheme }), mainProcessService.getChannel('userDataProfiles')));
            services.set(userDataProfile_1.$Ek, userDataProfilesService);
            const userDataFileSystemProvider = this.B(new fileUserDataProvider_1.$n7b(network_1.Schemas.file, 
            // Specifically for user data, use the disk file system provider
            // from the main process to enable atomic read/write operations.
            // Since user data can change very frequently across multiple
            // processes, we want a single process handling these operations.
            this.B(new diskFileSystemProviderClient_1.$8M(mainProcessService.getChannel(diskFileSystemProviderClient_1.$7M), { pathCaseSensitive: platform_1.$k })), network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
            fileService.registerProvider(network_1.Schemas.vscodeUserData, userDataFileSystemProvider);
            // Configuration
            const configurationService = this.B(new configurationService_1.$zn(userDataProfilesService.defaultProfile.settingsResource, fileService, policyService, logService));
            services.set(configuration_1.$8h, configurationService);
            // Storage (global access only)
            const storageService = new storageService_1.$l8b(undefined, { defaultProfile: userDataProfilesService.defaultProfile, currentProfile: userDataProfilesService.defaultProfile }, mainProcessService, environmentService);
            services.set(storage_1.$Vo, storageService);
            this.B((0, lifecycle_1.$ic)(() => storageService.flush()));
            // Initialize config & storage in parallel
            await Promise.all([
                configurationService.initialize(),
                storageService.initialize()
            ]);
            // Request
            const requestService = new requestIpc_1.$Mq(mainProcessService.getChannel('request'));
            services.set(request_1.$Io, requestService);
            // Checksum
            services.set(checksumService_1.$Q7b, new descriptors_1.$yh(checksumService_2.$R7b, undefined, false /* proxied to other processes */));
            // V8 Inspect profiler
            services.set(profiling_1.$CF, new descriptors_1.$yh(profilingService_1.$77b, undefined, false /* proxied to other processes */));
            // Native Host
            const nativeHostService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('nativeHost'));
            services.set(native_1.$05b, nativeHostService);
            // Download
            services.set(download_1.$Dn, new descriptors_1.$yh(downloadService_1.$BN, undefined, true));
            // Extension recommendations
            const activeWindowManager = this.B(new windowTracker_1.$X6b(nativeHostService));
            const activeWindowRouter = new ipc_1.$jh(ctx => activeWindowManager.getActiveClientId().then(id => ctx === id));
            services.set(extensionRecommendations_1.$TUb, new extensionRecommendationsIpc_1.$h8b(this.a.getChannel('extensionRecommendationNotification', activeWindowRouter)));
            // Telemetry
            let telemetryService;
            const appenders = [];
            const internalTelemetry = (0, telemetryUtils_1.$mo)(productService, configurationService);
            if ((0, telemetryUtils_1.$ho)(productService, environmentService)) {
                const logAppender = new telemetryLogAppender_1.$43b(logService, loggerService, environmentService, productService);
                appenders.push(logAppender);
                if (productService.aiConfig?.ariaKey) {
                    const collectorAppender = new _1dsAppender_1.$aN(requestService, internalTelemetry, 'monacoworkbench', null, productService.aiConfig.ariaKey);
                    this.B((0, lifecycle_1.$ic)(() => collectorAppender.flush())); // Ensure the 1DS appender is disposed so that it flushes remaining data
                    appenders.push(collectorAppender);
                }
                telemetryService = new telemetryService_1.$Qq({
                    appenders,
                    commonProperties: (0, commonProperties_1.$0n)((0, os_1.release)(), (0, os_1.hostname)(), process.arch, productService.commit, productService.version, this.f.machineId, internalTelemetry),
                    sendErrorTelemetry: true,
                    piiPaths: (0, telemetryUtils_1.$no)(environmentService),
                }, configurationService, productService);
            }
            else {
                telemetryService = telemetryUtils_1.$bo;
                const nullAppender = telemetryUtils_1.$fo;
                appenders.push(nullAppender);
            }
            this.a.registerChannel('telemetryAppender', new telemetryIpc_1.$B6b(appenders));
            services.set(telemetry_1.$9k, telemetryService);
            // Custom Endpoint Telemetry
            const customEndpointTelemetryService = new customEndpointTelemetryService_1.$S7b(configurationService, telemetryService, logService, loggerService, environmentService, productService);
            services.set(telemetry_1.$0k, customEndpointTelemetryService);
            // Extension Management
            services.set(extensionsProfileScannerService_1.$kp, new descriptors_1.$yh(extensionsProfileScannerService_2.$lN, undefined, true));
            services.set(extensionsScannerService_1.$op, new descriptors_1.$yh(extensionsScannerService_2.$26b, undefined, true));
            services.set(extensionSignatureVerificationService_1.$7o, new descriptors_1.$yh(extensionSignatureVerificationService_1.$8o, undefined, true));
            services.set(extensionManagementService_1.$yp, new descriptors_1.$yh(extensionManagementService_1.$zp, undefined, true));
            // Extension Gallery
            services.set(extensionManagement_1.$Zn, new descriptors_1.$yh(extensionGalleryService_1.$5o, undefined, true));
            // Extension Tips
            services.set(extensionManagement_1.$6n, new descriptors_1.$yh(extensionTipsService_1.$k8b, undefined, false /* Eagerly scans and computes exe based recommendations */));
            // Localizations
            services.set(languagePacks_1.$Iq, new descriptors_1.$yh(languagePacks_2.$Kq, undefined, false /* proxied to other processes */));
            // Diagnostics
            services.set(diagnostics_1.$gm, new descriptors_1.$yh(diagnosticsService_1.$wr, undefined, false /* proxied to other processes */));
            // Settings Sync
            services.set(userDataSyncAccount_1.$Ezb, new descriptors_1.$yh(userDataSyncAccount_1.$Fzb, undefined, true));
            services.set(userDataSync_1.$Ugb, new descriptors_1.$yh(userDataSyncLog_1.$RBb, undefined, true));
            services.set(userDataSync_1.$Tgb, new userDataSyncIpc_1.$V7b(this.a.getChannel('userDataSyncUtil', client => client.ctx !== 'main')));
            services.set(extensionManagement_1.$5n, new descriptors_1.$yh(extensionEnablementService_1.$Czb, undefined, false /* Eagerly resets installed extensions */));
            services.set(ignoredExtensions_1.$PBb, new descriptors_1.$yh(ignoredExtensions_1.$QBb, undefined, true));
            services.set(extensionStorage_1.$Tz, new descriptors_1.$yh(extensionStorage_1.$Uz));
            services.set(userDataSync_1.$Egb, new descriptors_1.$yh(userDataSyncStoreService_1.$1Ab, undefined, true));
            services.set(userDataSync_1.$Fgb, new descriptors_1.$yh(userDataSyncStoreService_1.$3Ab, undefined, true));
            services.set(userDataSyncMachines_1.$sgb, new descriptors_1.$yh(userDataSyncMachines_1.$ugb, undefined, true));
            services.set(userDataSync_1.$Ggb, new descriptors_1.$yh(userDataSyncLocalStoreService_1.$F4b, undefined, false /* Eagerly cleans up old backups */));
            services.set(userDataSync_1.$Pgb, new descriptors_1.$yh(userDataSyncEnablementService_1.$u4b, undefined, true));
            services.set(userDataSync_1.$Qgb, new descriptors_1.$yh(userDataSyncService_1.$K4b, undefined, false /* Initializes the Sync State */));
            services.set(userDataProfileStorageService_1.$eAb, new descriptors_1.$yh(userDataProfileStorageService_2.$37b, undefined, true));
            services.set(userDataSync_1.$Rgb, new descriptors_1.$yh(userDataSyncResourceProvider_1.$k5b, undefined, true));
            // Signing
            services.set(sign_1.$Wk, new descriptors_1.$yh(signService_1.$k7b, undefined, false /* proxied to other processes */));
            // Tunnel
            const remoteSocketFactoryService = new remoteSocketFactoryService_1.$Uk();
            services.set(remoteSocketFactoryService_1.$Tk, remoteSocketFactoryService);
            remoteSocketFactoryService.register(0 /* RemoteConnectionType.WebSocket */, nodeSocketFactory_1.$m8b);
            services.set(tunnel_1.$Xz, new descriptors_1.$yh(tunnelService_1.$i7b));
            services.set(sharedProcessTunnelService_1.$47b, new descriptors_1.$yh(sharedProcessTunnelService_2.$67b));
            // Remote Tunnel
            services.set(remoteTunnel_1.$97b, new descriptors_1.$yh(remoteTunnelService_1.$g8b));
            // Voice Recognition
            services.set(voiceRecognitionService_1.$n8b, new descriptors_1.$yh(voiceRecognitionService_1.$o8b));
            return new instantiationService_1.$6p(services);
        }
        j(accessor) {
            const disposables = this.B(new lifecycle_1.$jc());
            // Extensions Management
            const channel = new extensionManagementIpc_1.$0o(accessor.get(extensionManagement_1.$2n), () => null);
            this.a.registerChannel('extensions', channel);
            // Language Packs
            const languagePacksChannel = ipc_1.ProxyChannel.fromService(accessor.get(languagePacks_1.$Iq), disposables);
            this.a.registerChannel('languagePacks', languagePacksChannel);
            // Diagnostics
            const diagnosticsChannel = ipc_1.ProxyChannel.fromService(accessor.get(diagnostics_1.$gm), disposables);
            this.a.registerChannel('diagnostics', diagnosticsChannel);
            // Extension Tips
            const extensionTipsChannel = new extensionManagementIpc_1.$_o(accessor.get(extensionManagement_1.$6n));
            this.a.registerChannel('extensionTipsService', extensionTipsChannel);
            // Checksum
            const checksumChannel = ipc_1.ProxyChannel.fromService(accessor.get(checksumService_1.$Q7b), disposables);
            this.a.registerChannel('checksum', checksumChannel);
            // Profiling
            const profilingChannel = ipc_1.ProxyChannel.fromService(accessor.get(profiling_1.$CF), disposables);
            this.a.registerChannel('v8InspectProfiling', profilingChannel);
            // Settings Sync
            const userDataSyncMachineChannel = new userDataSyncIpc_1.$W7b(accessor.get(userDataSyncMachines_1.$sgb));
            this.a.registerChannel('userDataSyncMachines', userDataSyncMachineChannel);
            // Custom Endpoint Telemetry
            const customEndpointTelemetryChannel = ipc_1.ProxyChannel.fromService(accessor.get(telemetry_1.$0k), disposables);
            this.a.registerChannel('customEndpointTelemetry', customEndpointTelemetryChannel);
            const userDataSyncAccountChannel = new userDataSyncIpc_1.$X7b(accessor.get(userDataSyncAccount_1.$Ezb));
            this.a.registerChannel('userDataSyncAccount', userDataSyncAccountChannel);
            const userDataSyncStoreManagementChannel = new userDataSyncIpc_1.$Y7b(accessor.get(userDataSync_1.$Egb));
            this.a.registerChannel('userDataSyncStoreManagement', userDataSyncStoreManagementChannel);
            const userDataSyncChannel = new userDataSyncServiceIpc_1.$17b(accessor.get(userDataSync_1.$Qgb), accessor.get(userDataProfile_1.$Ek), accessor.get(log_1.$5i));
            this.a.registerChannel('userDataSync', userDataSyncChannel);
            const userDataAutoSync = this.B(accessor.get(instantiation_1.$Ah).createInstance(userDataAutoSyncService_1.$j8b));
            const userDataAutoSyncChannel = new userDataSyncIpc_1.$T7b(userDataAutoSync);
            this.a.registerChannel('userDataAutoSync', userDataAutoSyncChannel);
            this.a.registerChannel('IUserDataSyncResourceProviderService', ipc_1.ProxyChannel.fromService(accessor.get(userDataSync_1.$Rgb), disposables));
            // Tunnel
            const sharedProcessTunnelChannel = ipc_1.ProxyChannel.fromService(accessor.get(sharedProcessTunnelService_1.$47b), disposables);
            this.a.registerChannel(sharedProcessTunnelService_1.$57b, sharedProcessTunnelChannel);
            // Remote Tunnel
            const remoteTunnelChannel = ipc_1.ProxyChannel.fromService(accessor.get(remoteTunnel_1.$97b), disposables);
            this.a.registerChannel('remoteTunnel', remoteTunnelChannel);
        }
        m(logService) {
            // Listen on global error events
            process.on('uncaughtException', error => (0, errors_1.$Y)(error));
            process.on('unhandledRejection', (reason) => (0, errors_1.$Y)(reason));
            // Install handler for unexpected errors
            (0, errors_1.setUnexpectedErrorHandler)(error => {
                const message = (0, errorMessage_1.$mi)(error, true);
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
            if (e.data !== sharedProcess_1.$y6b.response) {
                return false;
            }
            const port = (0, arrays_1.$Mb)(e.ports);
            if (port) {
                this.c.fire(port);
                return true;
            }
            return false;
        }
    }
    async function main(configuration) {
        // create shared process and signal back to main that we are
        // ready to accept message ports as client connections
        const sharedProcess = new SharedProcessMain(configuration);
        process.parentPort.postMessage(sharedProcess_1.$w6b.ipcReady);
        // await initialization and signal this back to electron-main
        await sharedProcess.init();
        process.parentPort.postMessage(sharedProcess_1.$w6b.initDone);
    }
    exports.main = main;
    process.parentPort.once('message', (e) => {
        main(e.data);
    });
});
//# sourceMappingURL=sharedProcessMain.js.map