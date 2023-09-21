/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/uri", "vs/base/node/pfs", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/download/common/download", "vs/platform/download/common/downloadService", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/extensionManagement/common/extensionManagementCLI", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/node/extensionsScannerService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/languagePacks/common/languagePacks", "vs/platform/languagePacks/node/languagePacks", "vs/platform/log/common/log", "vs/platform/policy/common/filePolicyService", "vs/platform/policy/common/policy", "vs/platform/policy/node/nativePolicyService", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/request/node/requestService", "vs/platform/state/node/stateService", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/node/1dsAppender", "vs/platform/telemetry/node/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/node/userDataProfile", "vs/platform/telemetry/node/telemetryUtils", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/log/common/logService", "vs/platform/log/node/loggerService", "vs/nls", "vs/platform/userData/common/fileUserDataProvider"], function (require, exports, os_1, async_1, errorMessage_1, errors_1, lifecycle_1, network_1, path_1, platform_1, process_1, uri_1, pfs_1, configuration_1, configurationService_1, download_1, downloadService_1, environment_1, environmentService_1, extensionGalleryService_1, extensionManagement_1, extensionSignatureVerificationService_1, extensionManagementCLI_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionManagementService_1, extensionsScannerService_2, files_1, fileService_1, diskFileSystemProvider_1, descriptors_1, instantiationService_1, serviceCollection_1, languagePacks_1, languagePacks_2, log_1, filePolicyService_1, policy_1, nativePolicyService_1, product_1, productService_1, request_1, requestService_1, stateService_1, commonProperties_1, telemetry_1, telemetryService_1, telemetryUtils_1, _1dsAppender_1, telemetry_2, uriIdentity_1, uriIdentityService_1, userDataProfile_1, userDataProfile_2, telemetryUtils_2, extensionsProfileScannerService_2, logService_1, loggerService_1, nls_1, fileUserDataProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    class CliMain extends lifecycle_1.Disposable {
        constructor(argv) {
            super();
            this.argv = argv;
            this.registerListeners();
        }
        registerListeners() {
            // Dispose on exit
            process.once('exit', () => this.dispose());
        }
        async run() {
            // Services
            const [instantiationService, appenders] = await this.initServices();
            return instantiationService.invokeFunction(async (accessor) => {
                const logService = accessor.get(log_1.ILogService);
                const fileService = accessor.get(files_1.IFileService);
                const environmentService = accessor.get(environment_1.INativeEnvironmentService);
                const userDataProfilesService = accessor.get(userDataProfile_1.IUserDataProfilesService);
                // Log info
                logService.info('CLI main', this.argv);
                // Error handler
                this.registerErrorHandler(logService);
                // Run based on argv
                await this.doRun(environmentService, fileService, userDataProfilesService, instantiationService);
                // Flush the remaining data in AI adapter (with 1s timeout)
                await Promise.all(appenders.map(a => {
                    (0, async_1.raceTimeout)(a.flush(), 1000);
                }));
                return;
            });
        }
        async initServices() {
            const services = new serviceCollection_1.ServiceCollection();
            // Product
            const productService = { _serviceBrand: undefined, ...product_1.default };
            services.set(productService_1.IProductService, productService);
            // Environment
            const environmentService = new environmentService_1.NativeEnvironmentService(this.argv, productService);
            services.set(environment_1.INativeEnvironmentService, environmentService);
            // Init folders
            await Promise.all([
                environmentService.appSettingsHome.with({ scheme: network_1.Schemas.file }).fsPath,
                environmentService.extensionsPath
            ].map(path => path ? pfs_1.Promises.mkdir(path, { recursive: true }) : undefined));
            // Logger
            const loggerService = new loggerService_1.LoggerService((0, log_1.getLogLevel)(environmentService), environmentService.logsHome);
            services.set(log_1.ILoggerService, loggerService);
            // Log
            const logger = this._register(loggerService.createLogger('cli', { name: (0, nls_1.localize)('cli', "CLI") }));
            const otherLoggers = [];
            if (loggerService.getLogLevel() === log_1.LogLevel.Trace) {
                otherLoggers.push(new log_1.ConsoleLogger(loggerService.getLogLevel()));
            }
            const logService = this._register(new logService_1.LogService(logger, otherLoggers));
            services.set(log_1.ILogService, logService);
            // Files
            const fileService = this._register(new fileService_1.FileService(logService));
            services.set(files_1.IFileService, fileService);
            const diskFileSystemProvider = this._register(new diskFileSystemProvider_1.DiskFileSystemProvider(logService));
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // Uri Identity
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            services.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
            // User Data Profiles
            const stateService = new stateService_1.StateReadonlyService(1 /* SaveStrategy.DELAYED */, environmentService, logService, fileService);
            const userDataProfilesService = new userDataProfile_2.UserDataProfilesReadonlyService(stateService, uriIdentityService, environmentService, fileService, logService);
            services.set(userDataProfile_1.IUserDataProfilesService, userDataProfilesService);
            // Use FileUserDataProvider for user data to
            // enable atomic read / write operations.
            fileService.registerProvider(network_1.Schemas.vscodeUserData, new fileUserDataProvider_1.FileUserDataProvider(network_1.Schemas.file, diskFileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
            // Policy
            const policyService = platform_1.isWindows && productService.win32RegValueName ? this._register(new nativePolicyService_1.NativePolicyService(logService, productService.win32RegValueName))
                : environmentService.policyFile ? this._register(new filePolicyService_1.FilePolicyService(environmentService.policyFile, fileService, logService))
                    : new policy_1.NullPolicyService();
            services.set(policy_1.IPolicyService, policyService);
            // Configuration
            const configurationService = this._register(new configurationService_1.ConfigurationService(userDataProfilesService.defaultProfile.settingsResource, fileService, policyService, logService));
            services.set(configuration_1.IConfigurationService, configurationService);
            // Initialize
            await Promise.all([
                stateService.init(),
                configurationService.initialize()
            ]);
            // Get machine ID
            let machineId = undefined;
            try {
                machineId = await (0, telemetryUtils_2.resolveMachineId)(stateService, logService);
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    logService.error(error);
                }
            }
            // Initialize user data profiles after initializing the state
            userDataProfilesService.init();
            // URI Identity
            services.set(uriIdentity_1.IUriIdentityService, new uriIdentityService_1.UriIdentityService(fileService));
            // Request
            const requestService = new requestService_1.RequestService(configurationService, environmentService, logService, loggerService);
            services.set(request_1.IRequestService, requestService);
            // Download Service
            services.set(download_1.IDownloadService, new descriptors_1.SyncDescriptor(downloadService_1.DownloadService, undefined, true));
            // Extensions
            services.set(extensionsProfileScannerService_1.IExtensionsProfileScannerService, new descriptors_1.SyncDescriptor(extensionsProfileScannerService_2.ExtensionsProfileScannerService, undefined, true));
            services.set(extensionsScannerService_1.IExtensionsScannerService, new descriptors_1.SyncDescriptor(extensionsScannerService_2.ExtensionsScannerService, undefined, true));
            services.set(extensionSignatureVerificationService_1.IExtensionSignatureVerificationService, new descriptors_1.SyncDescriptor(extensionSignatureVerificationService_1.ExtensionSignatureVerificationService, undefined, true));
            services.set(extensionManagementService_1.INativeServerExtensionManagementService, new descriptors_1.SyncDescriptor(extensionManagementService_1.ExtensionManagementService, undefined, true));
            services.set(extensionManagement_1.IExtensionGalleryService, new descriptors_1.SyncDescriptor(extensionGalleryService_1.ExtensionGalleryServiceWithNoStorageService, undefined, true));
            // Localizations
            services.set(languagePacks_1.ILanguagePackService, new descriptors_1.SyncDescriptor(languagePacks_2.NativeLanguagePackService, undefined, false));
            // Telemetry
            const appenders = [];
            const isInternal = (0, telemetryUtils_1.isInternalTelemetry)(productService, configurationService);
            if ((0, telemetryUtils_1.supportsTelemetry)(productService, environmentService)) {
                if (productService.aiConfig && productService.aiConfig.ariaKey) {
                    appenders.push(new _1dsAppender_1.OneDataSystemAppender(requestService, isInternal, 'monacoworkbench', null, productService.aiConfig.ariaKey));
                }
                const config = {
                    appenders,
                    sendErrorTelemetry: false,
                    commonProperties: (0, commonProperties_1.resolveCommonProperties)((0, os_1.release)(), (0, os_1.hostname)(), process.arch, productService.commit, productService.version, machineId, isInternal),
                    piiPaths: (0, telemetryUtils_1.getPiiPathsFromEnvironment)(environmentService)
                };
                services.set(telemetry_1.ITelemetryService, new descriptors_1.SyncDescriptor(telemetryService_1.TelemetryService, [config], false));
            }
            else {
                services.set(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            }
            return [new instantiationService_1.InstantiationService(services), appenders];
        }
        registerErrorHandler(logService) {
            // Install handler for unexpected errors
            (0, errors_1.setUnexpectedErrorHandler)(error => {
                const message = (0, errorMessage_1.toErrorMessage)(error, true);
                if (!message) {
                    return;
                }
                logService.error(`[uncaught exception in CLI]: ${message}`);
            });
            // Handle unhandled errors that can occur
            process.on('uncaughtException', err => {
                if (!(0, errors_1.isSigPipeError)(err)) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            });
            process.on('unhandledRejection', (reason) => (0, errors_1.onUnexpectedError)(reason));
        }
        async doRun(environmentService, fileService, userDataProfilesService, instantiationService) {
            let profile = undefined;
            if (environmentService.args.profile) {
                profile = userDataProfilesService.profiles.find(p => p.name === environmentService.args.profile);
                if (!profile) {
                    throw new Error(`Profile '${environmentService.args.profile}' not found.`);
                }
            }
            const profileLocation = (profile ?? userDataProfilesService.defaultProfile).extensionsResource;
            // List Extensions
            if (this.argv['list-extensions']) {
                return instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, new log_1.ConsoleLogger(log_1.LogLevel.Info, false)).listExtensions(!!this.argv['show-versions'], this.argv['category'], profileLocation);
            }
            // Install Extension
            else if (this.argv['install-extension'] || this.argv['install-builtin-extension']) {
                const installOptions = { isMachineScoped: !!this.argv['do-not-sync'], installPreReleaseVersion: !!this.argv['pre-release'], profileLocation };
                return instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, new log_1.ConsoleLogger(log_1.LogLevel.Info, false)).installExtensions(this.asExtensionIdOrVSIX(this.argv['install-extension'] || []), this.asExtensionIdOrVSIX(this.argv['install-builtin-extension'] || []), installOptions, !!this.argv['force']);
            }
            // Uninstall Extension
            else if (this.argv['uninstall-extension']) {
                return instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, new log_1.ConsoleLogger(log_1.LogLevel.Info, false)).uninstallExtensions(this.asExtensionIdOrVSIX(this.argv['uninstall-extension']), !!this.argv['force'], profileLocation);
            }
            // Locate Extension
            else if (this.argv['locate-extension']) {
                return instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, new log_1.ConsoleLogger(log_1.LogLevel.Info, false)).locateExtension(this.argv['locate-extension']);
            }
            // Telemetry
            else if (this.argv['telemetry']) {
                console.log(await (0, telemetry_2.buildTelemetryMessage)(environmentService.appRoot, environmentService.extensionsPath));
            }
        }
        asExtensionIdOrVSIX(inputs) {
            return inputs.map(input => /\.vsix$/i.test(input) ? uri_1.URI.file((0, path_1.isAbsolute)(input) ? input : (0, path_1.join)((0, process_1.cwd)(), input)) : input);
        }
    }
    async function main(argv) {
        const cliMain = new CliMain(argv);
        try {
            await cliMain.run();
        }
        finally {
            cliMain.dispose();
        }
    }
    exports.main = main;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpUHJvY2Vzc01haW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9jb2RlL25vZGUvY2xpUHJvY2Vzc01haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBK0RoRyxNQUFNLE9BQVEsU0FBUSxzQkFBVTtRQUUvQixZQUNTLElBQXNCO1lBRTlCLEtBQUssRUFBRSxDQUFDO1lBRkEsU0FBSSxHQUFKLElBQUksQ0FBa0I7WUFJOUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QixrQkFBa0I7WUFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHO1lBRVIsV0FBVztZQUNYLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVwRSxPQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUMsUUFBUSxFQUFDLEVBQUU7Z0JBQzNELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQVcsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHVDQUF5QixDQUFDLENBQUM7Z0JBQ25FLE1BQU0sdUJBQXVCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQ0FBd0IsQ0FBQyxDQUFDO2dCQUV2RSxXQUFXO2dCQUNYLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFF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