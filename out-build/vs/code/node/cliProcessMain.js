/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/uri", "vs/base/node/pfs", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/download/common/download", "vs/platform/download/common/downloadService", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/extensionManagement/common/extensionManagementCLI", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/node/extensionsScannerService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/languagePacks/common/languagePacks", "vs/platform/languagePacks/node/languagePacks", "vs/platform/log/common/log", "vs/platform/policy/common/filePolicyService", "vs/platform/policy/common/policy", "vs/platform/policy/node/nativePolicyService", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/request/node/requestService", "vs/platform/state/node/stateService", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/node/1dsAppender", "vs/platform/telemetry/node/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/node/userDataProfile", "vs/platform/telemetry/node/telemetryUtils", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/log/common/logService", "vs/platform/log/node/loggerService", "vs/nls!vs/code/node/cliProcessMain", "vs/platform/userData/common/fileUserDataProvider"], function (require, exports, os_1, async_1, errorMessage_1, errors_1, lifecycle_1, network_1, path_1, platform_1, process_1, uri_1, pfs_1, configuration_1, configurationService_1, download_1, downloadService_1, environment_1, environmentService_1, extensionGalleryService_1, extensionManagement_1, extensionSignatureVerificationService_1, extensionManagementCLI_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionManagementService_1, extensionsScannerService_2, files_1, fileService_1, diskFileSystemProvider_1, descriptors_1, instantiationService_1, serviceCollection_1, languagePacks_1, languagePacks_2, log_1, filePolicyService_1, policy_1, nativePolicyService_1, product_1, productService_1, request_1, requestService_1, stateService_1, commonProperties_1, telemetry_1, telemetryService_1, telemetryUtils_1, _1dsAppender_1, telemetry_2, uriIdentity_1, uriIdentityService_1, userDataProfile_1, userDataProfile_2, telemetryUtils_2, extensionsProfileScannerService_2, logService_1, loggerService_1, nls_1, fileUserDataProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    class CliMain extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
            this.c();
        }
        c() {
            // Dispose on exit
            process.once('exit', () => this.dispose());
        }
        async run() {
            // Services
            const [instantiationService, appenders] = await this.f();
            return instantiationService.invokeFunction(async (accessor) => {
                const logService = accessor.get(log_1.$5i);
                const fileService = accessor.get(files_1.$6j);
                const environmentService = accessor.get(environment_1.$Jh);
                const userDataProfilesService = accessor.get(userDataProfile_1.$Ek);
                // Log info
                logService.info('CLI main', this.b);
                // Error handler
                this.g(logService);
                // Run based on argv
                await this.h(environmentService, fileService, userDataProfilesService, instantiationService);
                // Flush the remaining data in AI adapter (with 1s timeout)
                await Promise.all(appenders.map(a => {
                    (0, async_1.$yg)(a.flush(), 1000);
                }));
                return;
            });
        }
        async f() {
            const services = new serviceCollection_1.$zh();
            // Product
            const productService = { _serviceBrand: undefined, ...product_1.default };
            services.set(productService_1.$kj, productService);
            // Environment
            const environmentService = new environmentService_1.$_l(this.b, productService);
            services.set(environment_1.$Jh, environmentService);
            // Init folders
            await Promise.all([
                environmentService.appSettingsHome.with({ scheme: network_1.Schemas.file }).fsPath,
                environmentService.extensionsPath
            ].map(path => path ? pfs_1.Promises.mkdir(path, { recursive: true }) : undefined));
            // Logger
            const loggerService = new loggerService_1.$cN((0, log_1.$gj)(environmentService), environmentService.logsHome);
            services.set(log_1.$6i, loggerService);
            // Log
            const logger = this.B(loggerService.createLogger('cli', { name: (0, nls_1.localize)(0, null) }));
            const otherLoggers = [];
            if (loggerService.getLogLevel() === log_1.LogLevel.Trace) {
                otherLoggers.push(new log_1.$aj(loggerService.getLogLevel()));
            }
            const logService = this.B(new logService_1.$mN(logger, otherLoggers));
            services.set(log_1.$5i, logService);
            // Files
            const fileService = this.B(new fileService_1.$Dp(logService));
            services.set(files_1.$6j, fileService);
            const diskFileSystemProvider = this.B(new diskFileSystemProvider_1.$3p(logService));
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // Uri Identity
            const uriIdentityService = new uriIdentityService_1.$pr(fileService);
            services.set(uriIdentity_1.$Ck, uriIdentityService);
            // User Data Profiles
            const stateService = new stateService_1.$gN(1 /* SaveStrategy.DELAYED */, environmentService, logService, fileService);
            const userDataProfilesService = new userDataProfile_2.$iN(stateService, uriIdentityService, environmentService, fileService, logService);
            services.set(userDataProfile_1.$Ek, userDataProfilesService);
            // Use FileUserDataProvider for user data to
            // enable atomic read / write operations.
            fileService.registerProvider(network_1.Schemas.vscodeUserData, new fileUserDataProvider_1.$n7b(network_1.Schemas.file, diskFileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
            // Policy
            const policyService = platform_1.$i && productService.win32RegValueName ? this.B(new nativePolicyService_1.$l7b(logService, productService.win32RegValueName))
                : environmentService.policyFile ? this.B(new filePolicyService_1.$m7b(environmentService.policyFile, fileService, logService))
                    : new policy_1.$_m();
            services.set(policy_1.$0m, policyService);
            // Configuration
            const configurationService = this.B(new configurationService_1.$zn(userDataProfilesService.defaultProfile.settingsResource, fileService, policyService, logService));
            services.set(configuration_1.$8h, configurationService);
            // Initialize
            await Promise.all([
                stateService.init(),
                configurationService.initialize()
            ]);
            // Get machine ID
            let machineId = undefined;
            try {
                machineId = await (0, telemetryUtils_2.$56b)(stateService, logService);
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    logService.error(error);
                }
            }
            // Initialize user data profiles after initializing the state
            userDataProfilesService.init();
            // URI Identity
            services.set(uriIdentity_1.$Ck, new uriIdentityService_1.$pr(fileService));
            // Request
            const requestService = new requestService_1.$Oq(configurationService, environmentService, logService, loggerService);
            services.set(request_1.$Io, requestService);
            // Download Service
            services.set(download_1.$Dn, new descriptors_1.$yh(downloadService_1.$BN, undefined, true));
            // Extensions
            services.set(extensionsProfileScannerService_1.$kp, new descriptors_1.$yh(extensionsProfileScannerService_2.$lN, undefined, true));
            services.set(extensionsScannerService_1.$op, new descriptors_1.$yh(extensionsScannerService_2.$26b, undefined, true));
            services.set(extensionSignatureVerificationService_1.$7o, new descriptors_1.$yh(extensionSignatureVerificationService_1.$8o, undefined, true));
            services.set(extensionManagementService_1.$yp, new descriptors_1.$yh(extensionManagementService_1.$zp, undefined, true));
            services.set(extensionManagement_1.$Zn, new descriptors_1.$yh(extensionGalleryService_1.$6o, undefined, true));
            // Localizations
            services.set(languagePacks_1.$Iq, new descriptors_1.$yh(languagePacks_2.$Kq, undefined, false));
            // Telemetry
            const appenders = [];
            const isInternal = (0, telemetryUtils_1.$mo)(productService, configurationService);
            if ((0, telemetryUtils_1.$ho)(productService, environmentService)) {
                if (productService.aiConfig && productService.aiConfig.ariaKey) {
                    appenders.push(new _1dsAppender_1.$aN(requestService, isInternal, 'monacoworkbench', null, productService.aiConfig.ariaKey));
                }
                const config = {
                    appenders,
                    sendErrorTelemetry: false,
                    commonProperties: (0, commonProperties_1.$0n)((0, os_1.release)(), (0, os_1.hostname)(), process.arch, productService.commit, productService.version, machineId, isInternal),
                    piiPaths: (0, telemetryUtils_1.$no)(environmentService)
                };
                services.set(telemetry_1.$9k, new descriptors_1.$yh(telemetryService_1.$Qq, [config], false));
            }
            else {
                services.set(telemetry_1.$9k, telemetryUtils_1.$bo);
            }
            return [new instantiationService_1.$6p(services), appenders];
        }
        g(logService) {
            // Install handler for unexpected errors
            (0, errors_1.setUnexpectedErrorHandler)(error => {
                const message = (0, errorMessage_1.$mi)(error, true);
                if (!message) {
                    return;
                }
                logService.error(`[uncaught exception in CLI]: ${message}`);
            });
            // Handle unhandled errors that can occur
            process.on('uncaughtException', err => {
                if (!(0, errors_1.$X)(err)) {
                    (0, errors_1.$Y)(err);
                }
            });
            process.on('unhandledRejection', (reason) => (0, errors_1.$Y)(reason));
        }
        async h(environmentService, fileService, userDataProfilesService, instantiationService) {
            let profile = undefined;
            if (environmentService.args.profile) {
                profile = userDataProfilesService.profiles.find(p => p.name === environmentService.args.profile);
                if (!profile) {
                    throw new Error(`Profile '${environmentService.args.profile}' not found.`);
                }
            }
            const profileLocation = (profile ?? userDataProfilesService.defaultProfile).extensionsResource;
            // List Extensions
            if (this.b['list-extensions']) {
                return instantiationService.createInstance(extensionManagementCLI_1.$9o, new log_1.$aj(log_1.LogLevel.Info, false)).listExtensions(!!this.b['show-versions'], this.b['category'], profileLocation);
            }
            // Install Extension
            else if (this.b['install-extension'] || this.b['install-builtin-extension']) {
                const installOptions = { isMachineScoped: !!this.b['do-not-sync'], installPreReleaseVersion: !!this.b['pre-release'], profileLocation };
                return instantiationService.createInstance(extensionManagementCLI_1.$9o, new log_1.$aj(log_1.LogLevel.Info, false)).installExtensions(this.j(this.b['install-extension'] || []), this.j(this.b['install-builtin-extension'] || []), installOptions, !!this.b['force']);
            }
            // Uninstall Extension
            else if (this.b['uninstall-extension']) {
                return instantiationService.createInstance(extensionManagementCLI_1.$9o, new log_1.$aj(log_1.LogLevel.Info, false)).uninstallExtensions(this.j(this.b['uninstall-extension']), !!this.b['force'], profileLocation);
            }
            // Locate Extension
            else if (this.b['locate-extension']) {
                return instantiationService.createInstance(extensionManagementCLI_1.$9o, new log_1.$aj(log_1.LogLevel.Info, false)).locateExtension(this.b['locate-extension']);
            }
            // Telemetry
            else if (this.b['telemetry']) {
                console.log(await (0, telemetry_2.$J7b)(environmentService.appRoot, environmentService.extensionsPath));
            }
        }
        j(inputs) {
            return inputs.map(input => /\.vsix$/i.test(input) ? uri_1.URI.file((0, path_1.$8d)(input) ? input : (0, path_1.$9d)((0, process_1.cwd)(), input)) : input);
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
//# sourceMappingURL=cliProcessMain.js.map