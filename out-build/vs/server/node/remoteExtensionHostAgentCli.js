/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/instantiation/common/descriptors", "vs/platform/configuration/common/configurationService", "vs/platform/configuration/common/configuration", "vs/platform/request/common/request", "vs/platform/request/node/requestService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/common/telemetry", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/instantiation/common/instantiationService", "vs/platform/product/common/product", "vs/base/common/lifecycle", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/base/common/network", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/server/node/serverEnvironmentService", "vs/platform/extensionManagement/common/extensionManagementCLI", "vs/platform/languagePacks/common/languagePacks", "vs/platform/languagePacks/node/languagePacks", "vs/base/common/errors", "vs/base/common/uri", "vs/base/common/path", "vs/base/common/process", "vs/platform/download/common/downloadService", "vs/platform/download/common/download", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/environment/node/argv", "vs/base/common/platform", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/server/node/extensionsScannerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/policy/common/policy", "vs/platform/userDataProfile/node/userDataProfile", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/log/common/logService", "vs/platform/log/node/loggerService", "vs/nls!vs/server/node/remoteExtensionHostAgentCli", "vs/base/node/unc"], function (require, exports, serviceCollection_1, log_1, descriptors_1, configurationService_1, configuration_1, request_1, requestService_1, telemetryUtils_1, telemetry_1, extensionManagement_1, extensionGalleryService_1, extensionManagementService_1, extensionSignatureVerificationService_1, instantiationService_1, product_1, lifecycle_1, fileService_1, diskFileSystemProvider_1, network_1, files_1, productService_1, serverEnvironmentService_1, extensionManagementCLI_1, languagePacks_1, languagePacks_2, errors_1, uri_1, path_1, process_1, downloadService_1, download_1, uriIdentity_1, uriIdentityService_1, argv_1, platform_1, extensionsScannerService_1, extensionsScannerService_2, userDataProfile_1, extensionsProfileScannerService_1, policy_1, userDataProfile_2, extensionsProfileScannerService_2, logService_1, loggerService_1, nls_1, unc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.run = void 0;
    class CliMain extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.c();
        }
        c() {
            // Dispose on exit
            process.once('exit', () => this.dispose());
        }
        async run() {
            const instantiationService = await this.f();
            await instantiationService.invokeFunction(async (accessor) => {
                const configurationService = accessor.get(configuration_1.$8h);
                const logService = accessor.get(log_1.$5i);
                // On Windows, configure the UNC allow list based on settings
                if (platform_1.$i) {
                    if (configurationService.getValue('security.restrictUNCAccess') === false) {
                        (0, unc_1.disableUNCAccessRestrictions)();
                    }
                    else {
                        (0, unc_1.addUNCHostToAllowlist)(configurationService.getValue('security.allowedUNCHosts'));
                    }
                }
                try {
                    await this.g(instantiationService.createInstance(extensionManagementCLI_1.$9o, new log_1.$aj(logService.getLevel(), false)));
                }
                catch (error) {
                    logService.error(error);
                    console.error((0, errors_1.$8)(error));
                    throw error;
                }
            });
        }
        async f() {
            const services = new serviceCollection_1.$zh();
            const productService = { _serviceBrand: undefined, ...product_1.default };
            services.set(productService_1.$kj, productService);
            const environmentService = new serverEnvironmentService_1.$em(this.a, productService);
            services.set(serverEnvironmentService_1.$dm, environmentService);
            const loggerService = new loggerService_1.$cN((0, log_1.$gj)(environmentService), environmentService.logsHome);
            services.set(log_1.$6i, loggerService);
            const logService = new logService_1.$mN(this.B(loggerService.createLogger('remoteCLI', { name: (0, nls_1.localize)(0, null) })));
            services.set(log_1.$5i, logService);
            logService.trace(`Remote configuration data at ${this.b}`);
            logService.trace('process arguments:', this.a);
            // Files
            const fileService = this.B(new fileService_1.$Dp(logService));
            services.set(files_1.$6j, fileService);
            fileService.registerProvider(network_1.Schemas.file, this.B(new diskFileSystemProvider_1.$3p(logService)));
            const uriIdentityService = new uriIdentityService_1.$pr(fileService);
            services.set(uriIdentity_1.$Ck, uriIdentityService);
            // User Data Profiles
            const userDataProfilesService = this.B(new userDataProfile_2.$kN(uriIdentityService, environmentService, fileService, logService));
            services.set(userDataProfile_1.$Ek, userDataProfilesService);
            // Configuration
            const configurationService = this.B(new configurationService_1.$zn(userDataProfilesService.defaultProfile.settingsResource, fileService, new policy_1.$_m(), logService));
            services.set(configuration_1.$8h, configurationService);
            // Initialize
            await Promise.all([
                configurationService.initialize(),
                userDataProfilesService.init()
            ]);
            services.set(request_1.$Io, new descriptors_1.$yh(requestService_1.$Oq));
            services.set(download_1.$Dn, new descriptors_1.$yh(downloadService_1.$BN));
            services.set(telemetry_1.$9k, telemetryUtils_1.$bo);
            services.set(extensionManagement_1.$Zn, new descriptors_1.$yh(extensionGalleryService_1.$6o));
            services.set(extensionsProfileScannerService_1.$kp, new descriptors_1.$yh(extensionsProfileScannerService_2.$lN));
            services.set(extensionsScannerService_1.$op, new descriptors_1.$yh(extensionsScannerService_2.$$M));
            services.set(extensionSignatureVerificationService_1.$7o, new descriptors_1.$yh(extensionSignatureVerificationService_1.$8o));
            services.set(extensionManagementService_1.$yp, new descriptors_1.$yh(extensionManagementService_1.$zp));
            services.set(languagePacks_1.$Iq, new descriptors_1.$yh(languagePacks_2.$Kq));
            return new instantiationService_1.$6p(services);
        }
        async g(extensionManagementCLI) {
            // List Extensions
            if (this.a['list-extensions']) {
                return extensionManagementCLI.listExtensions(!!this.a['show-versions'], this.a['category']);
            }
            // Install Extension
            else if (this.a['install-extension'] || this.a['install-builtin-extension']) {
                const installOptions = { isMachineScoped: !!this.a['do-not-sync'], installPreReleaseVersion: !!this.a['pre-release'] };
                return extensionManagementCLI.installExtensions(this.h(this.a['install-extension'] || []), this.h(this.a['install-builtin-extension'] || []), installOptions, !!this.a['force']);
            }
            // Uninstall Extension
            else if (this.a['uninstall-extension']) {
                return extensionManagementCLI.uninstallExtensions(this.h(this.a['uninstall-extension']), !!this.a['force']);
            }
            // Locate Extension
            else if (this.a['locate-extension']) {
                return extensionManagementCLI.locateExtension(this.a['locate-extension']);
            }
        }
        h(inputs) {
            return inputs.map(input => /\.vsix$/i.test(input) ? uri_1.URI.file((0, path_1.$8d)(input) ? input : (0, path_1.$9d)((0, process_1.cwd)(), input)) : input);
        }
    }
    function eventuallyExit(code) {
        setTimeout(() => process.exit(code), 0);
    }
    async function run(args, REMOTE_DATA_FOLDER, optionDescriptions) {
        if (args.help) {
            const executable = product_1.default.serverApplicationName + (platform_1.$i ? '.cmd' : '');
            console.log((0, argv_1.$Bl)(product_1.default.nameLong, executable, product_1.default.version, optionDescriptions, { noInputFiles: true, noPipe: true }));
            return;
        }
        // Version Info
        if (args.version) {
            console.log((0, argv_1.$Cl)(product_1.default.version, product_1.default.commit));
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
//# sourceMappingURL=remoteExtensionHostAgentCli.js.map