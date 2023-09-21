/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/instantiation/common/descriptors", "vs/platform/configuration/common/configurationService", "vs/platform/configuration/common/configuration", "vs/platform/request/common/request", "vs/platform/request/node/requestService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/common/telemetry", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/instantiation/common/instantiationService", "vs/platform/product/common/product", "vs/base/common/lifecycle", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/base/common/network", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/server/node/serverEnvironmentService", "vs/platform/extensionManagement/common/extensionManagementCLI", "vs/platform/languagePacks/common/languagePacks", "vs/platform/languagePacks/node/languagePacks", "vs/base/common/errors", "vs/base/common/uri", "vs/base/common/path", "vs/base/common/process", "vs/platform/download/common/downloadService", "vs/platform/download/common/download", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/environment/node/argv", "vs/base/common/platform", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/server/node/extensionsScannerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/policy/common/policy", "vs/platform/userDataProfile/node/userDataProfile", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/log/common/logService", "vs/platform/log/node/loggerService", "vs/nls", "vs/base/node/unc"], function (require, exports, serviceCollection_1, log_1, descriptors_1, configurationService_1, configuration_1, request_1, requestService_1, telemetryUtils_1, telemetry_1, extensionManagement_1, extensionGalleryService_1, extensionManagementService_1, extensionSignatureVerificationService_1, instantiationService_1, product_1, lifecycle_1, fileService_1, diskFileSystemProvider_1, network_1, files_1, productService_1, serverEnvironmentService_1, extensionManagementCLI_1, languagePacks_1, languagePacks_2, errors_1, uri_1, path_1, process_1, downloadService_1, download_1, uriIdentity_1, uriIdentityService_1, argv_1, platform_1, extensionsScannerService_1, extensionsScannerService_2, userDataProfile_1, extensionsProfileScannerService_1, policy_1, userDataProfile_2, extensionsProfileScannerService_2, logService_1, loggerService_1, nls_1, unc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.run = void 0;
    class CliMain extends lifecycle_1.Disposable {
        constructor(args, remoteDataFolder) {
            super();
            this.args = args;
            this.remoteDataFolder = remoteDataFolder;
            this.registerListeners();
        }
        registerListeners() {
            // Dispose on exit
            process.once('exit', () => this.dispose());
        }
        async run() {
            const instantiationService = await this.initServices();
            await instantiationService.invokeFunction(async (accessor) => {
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                const logService = accessor.get(log_1.ILogService);
                // On Windows, configure the UNC allow list based on settings
                if (platform_1.isWindows) {
                    if (configurationService.getValue('security.restrictUNCAccess') === false) {
                        (0, unc_1.disableUNCAccessRestrictions)();
                    }
                    else {
                        (0, unc_1.addUNCHostToAllowlist)(configurationService.getValue('security.allowedUNCHosts'));
                    }
                }
                try {
                    await this.doRun(instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, new log_1.ConsoleLogger(logService.getLevel(), false)));
                }
                catch (error) {
                    logService.error(error);
                    console.error((0, errors_1.getErrorMessage)(error));
                    throw error;
                }
            });
        }
        async initServices() {
            const services = new serviceCollection_1.ServiceCollection();
            const productService = { _serviceBrand: undefined, ...product_1.default };
            services.set(productService_1.IProductService, productService);
            const environmentService = new serverEnvironmentService_1.ServerEnvironmentService(this.args, productService);
            services.set(serverEnvironmentService_1.IServerEnvironmentService, environmentService);
            const loggerService = new loggerService_1.LoggerService((0, log_1.getLogLevel)(environmentService), environmentService.logsHome);
            services.set(log_1.ILoggerService, loggerService);
            const logService = new logService_1.LogService(this._register(loggerService.createLogger('remoteCLI', { name: (0, nls_1.localize)('remotecli', "Remote CLI") })));
            services.set(log_1.ILogService, logService);
            logService.trace(`Remote configuration data at ${this.remoteDataFolder}`);
            logService.trace('process arguments:', this.args);
            // Files
            const fileService = this._register(new fileService_1.FileService(logService));
            services.set(files_1.IFileService, fileService);
            fileService.registerProvider(network_1.Schemas.file, this._register(new diskFileSystemProvider_1.DiskFileSystemProvider(logService)));
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            services.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
            // User Data Profiles
            const userDataProfilesService = this._register(new userDataProfile_2.ServerUserDataProfilesService(uriIdentityService, environmentService, fileService, logService));
            services.set(userDataProfile_1.IUserDataProfilesService, userDataProfilesService);
            // Configuration
            const configurationService = this._register(new configurationService_1.ConfigurationService(userDataProfilesService.defaultProfile.settingsResource, fileService, new policy_1.NullPolicyService(), logService));
            services.set(configuration_1.IConfigurationService, configurationService);
            // Initialize
            await Promise.all([
                configurationService.initialize(),
                userDataProfilesService.init()
            ]);
            services.set(request_1.IRequestService, new descriptors_1.SyncDescriptor(requestService_1.RequestService));
            services.set(download_1.IDownloadService, new descriptors_1.SyncDescriptor(downloadService_1.DownloadService));
            services.set(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            services.set(extensionManagement_1.IExtensionGalleryService, new descriptors_1.SyncDescriptor(extensionGalleryService_1.ExtensionGalleryServiceWithNoStorageService));
            services.set(extensionsProfileScannerService_1.IExtensionsProfileScannerService, new descriptors_1.SyncDescriptor(extensionsProfileScannerService_2.ExtensionsProfileScannerService));
            services.set(extensionsScannerService_1.IExtensionsScannerService, new descriptors_1.SyncDescriptor(extensionsScannerService_2.ExtensionsScannerService));
            services.set(extensionSignatureVerificationService_1.IExtensionSignatureVerificationService, new descriptors_1.SyncDescriptor(extensionSignatureVerificationService_1.ExtensionSignatureVerificationService));
            services.set(extensionManagementService_1.INativeServerExtensionManagementService, new descriptors_1.SyncDescriptor(extensionManagementService_1.ExtensionManagementService));
            services.set(languagePacks_1.ILanguagePackService, new descriptors_1.SyncDescriptor(languagePacks_2.NativeLanguagePackService));
            return new instantiationService_1.InstantiationService(services);
        }
        async doRun(extensionManagementCLI) {
            // List Extensions
            if (this.args['list-extensions']) {
                return extensionManagementCLI.listExtensions(!!this.args['show-versions'], this.args['category']);
            }
            // Install Extension
            else if (this.args['install-extension'] || this.args['install-builtin-extension']) {
                const installOptions = { isMachineScoped: !!this.args['do-not-sync'], installPreReleaseVersion: !!this.args['pre-release'] };
                return extensionManagementCLI.installExtensions(this.asExtensionIdOrVSIX(this.args['install-extension'] || []), this.asExtensionIdOrVSIX(this.args['install-builtin-extension'] || []), installOptions, !!this.args['force']);
            }
            // Uninstall Extension
            else if (this.args['uninstall-extension']) {
                return extensionManagementCLI.uninstallExtensions(this.asExtensionIdOrVSIX(this.args['uninstall-extension']), !!this.args['force']);
            }
            // Locate Extension
            else if (this.args['locate-extension']) {
                return extensionManagementCLI.locateExtension(this.args['locate-extension']);
            }
        }
        asExtensionIdOrVSIX(inputs) {
            return inputs.map(input => /\.vsix$/i.test(input) ? uri_1.URI.file((0, path_1.isAbsolute)(input) ? input : (0, path_1.join)((0, process_1.cwd)(), input)) : input);
        }
    }
    function eventuallyExit(code) {
        setTimeout(() => process.exit(code), 0);
    }
    async function run(args, REMOTE_DATA_FOLDER, optionDescriptions) {
        if (args.help) {
            const executable = product_1.default.serverApplicationName + (platform_1.isWindows ? '.cmd' : '');
            console.log((0, argv_1.buildHelpMessage)(product_1.default.nameLong, executable, product_1.default.version, optionDescriptions, { noInputFiles: true, noPipe: true }));
            return;
        }
        // Version Info
        if (args.version) {
            console.log((0, argv_1.buildVersionMessage)(product_1.default.version, product_1.default.commit));
            return;
        }
        const cliMain = new CliMain(args, REMOTE_DATA_FOLDER);
        try {
            await cliMain.run();
            eventuallyExit(0);
        }
        catch (err) {
            eventuallyExit(1);
        }
        finally {
            cliMain.dispose();
        }
    }
    exports.run = run;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXh0ZW5zaW9uSG9zdEFnZW50Q2xpLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvc2VydmVyL25vZGUvcmVtb3RlRXh0ZW5zaW9uSG9zdEFnZW50Q2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtEaEcsTUFBTSxPQUFRLFNBQVEsc0JBQVU7UUFFL0IsWUFBNkIsSUFBc0IsRUFBbUIsZ0JBQXdCO1lBQzdGLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQWtCO1lBQW1CLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBUTtZQUc3RixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBQ3hCLGtCQUFrQjtZQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUc7WUFDUixNQUFNLG9CQUFvQixHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3ZELE1BQU0sb0JBQW9CLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBQyxRQUFRLEVBQUMsRUFBRTtnQkFDMUQsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7Z0JBQ2pFLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQVcsQ0FBQyxDQUFDO2dCQUU3Qyw2REFBNkQ7Z0JBQzdELElBQUksb0JBQVMsRUFBRTtvQkFDZCxJQUFJLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLEtBQUssRUFBRTt3QkFDMUUsSUFBQSxrQ0FBNEIsR0FBRSxDQUFDO3FCQUMvQjt5QkFBTTt3QkFDTixJQUFBLDJC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