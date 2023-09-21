/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionDownloader", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/extensionManagement/node/extensionsScannerService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, assert, buffer_1, lifecycle_1, platform_1, process_1, resources_1, types_1, uri_1, uuid_1, mock_1, utils_1, configuration_1, testConfigurationService_1, environment_1, extensionManagement_1, extensionManagementUtil_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionDownloader_1, extensionManagementService_1, extensionSignatureVerificationService_1, extensionsProfileScannerService_2, extensionsScannerService_2, files_1, fileService_1, inMemoryFilesystemProvider_1, instantiationServiceMock_1, log_1, productService_1, telemetry_1, telemetryUtils_1, uriIdentity_1, uriIdentityService_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
    class TestExtensionsScanner extends (0, mock_1.$rT)() {
        async scanExtensions() { return []; }
    }
    class TestExtensionSignatureVerificationService extends (0, mock_1.$rT)() {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
        }
        async verify() {
            if ((0, types_1.$pf)(this.a)) {
                return this.a;
            }
            const error = Error(this.a);
            error.code = this.a;
            error.didExecute = this.b;
            throw error;
        }
    }
    class TestInstallGalleryExtensionTask extends extensionManagementService_1.$Bp {
        constructor(extension, extensionDownloader, disposables) {
            const instantiationService = disposables.add(new instantiationServiceMock_1.$L0b());
            const logService = instantiationService.stub(log_1.$5i, new log_1.$fj());
            const fileService = instantiationService.stub(files_1.$6j, disposables.add(new fileService_1.$Dp(logService)));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            const systemExtensionsLocation = (0, resources_1.$ig)(ROOT, 'system');
            const userExtensionsLocation = (0, resources_1.$ig)(ROOT, 'extensions');
            instantiationService.stub(environment_1.$Jh, {
                userHome: ROOT,
                userRoamingDataHome: ROOT,
                builtinExtensionsPath: systemExtensionsLocation.fsPath,
                extensionsPath: userExtensionsLocation.fsPath,
                userDataPath: userExtensionsLocation.fsPath,
                cacheHome: ROOT,
            });
            instantiationService.stub(productService_1.$kj, {});
            instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            const uriIdentityService = instantiationService.stub(uriIdentity_1.$Ck, disposables.add(instantiationService.createInstance(uriIdentityService_1.$pr)));
            const userDataProfilesService = instantiationService.stub(userDataProfile_1.$Ek, disposables.add(instantiationService.createInstance(userDataProfile_1.$Hk)));
            const extensionsProfileScannerService = instantiationService.stub(extensionsProfileScannerService_1.$kp, disposables.add(instantiationService.createInstance(extensionsProfileScannerService_2.$lN)));
            const extensionsScannerService = instantiationService.stub(extensionsScannerService_1.$op, disposables.add(instantiationService.createInstance(extensionsScannerService_2.$26b)));
            super({
                name: extension.name,
                publisher: extension.publisher,
                version: extension.version,
                engines: { vscode: '*' },
            }, extension, { profileLocation: userDataProfilesService.defaultProfile.extensionsResource }, extensionDownloader, new TestExtensionsScanner(), uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService);
            this.installed = false;
        }
        async h(token) {
            const result = await this.x(token);
            return result[0];
        }
        async u() {
            this.installed = true;
            return new class extends (0, mock_1.$rT)() {
            };
        }
        async B() { }
    }
    suite('InstallGalleryExtensionTask Tests', () => {
        const disposables = (0, utils_1.$bT)();
        test('if verification is enabled by default, the task completes', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: true, didExecute: true }), disposables.add(new lifecycle_1.$jc()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, true);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification is enabled in stable, the task completes', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: true, didExecute: true, quality: 'stable' }), disposables.add(new lifecycle_1.$jc()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, true);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification is disabled by setting set to false, the task skips verification', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: false, verificationResult: 'error', didExecute: false }), disposables.add(new lifecycle_1.$jc()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, false);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification is disabled because the module is not loaded, the task skips verification', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: false, didExecute: false }), disposables.add(new lifecycle_1.$jc()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, false);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification fails to execute, the task completes', async () => {
            const errorCode = 'ENOENT';
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: errorCode, didExecute: false }), disposables.add(new lifecycle_1.$jc()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, errorCode);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification fails', async () => {
            const errorCode = 'IntegrityCheckFailed';
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: errorCode, didExecute: true }), disposables.add(new lifecycle_1.$jc()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, errorCode);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification succeeds, the task completes', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: true, didExecute: true }), disposables.add(new lifecycle_1.$jc()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, true);
            assert.strictEqual(testObject.installed, true);
        });
        test('task completes for unsigned extension', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: false }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: true, didExecute: false }), disposables.add(new lifecycle_1.$jc()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, false);
            assert.strictEqual(testObject.installed, true);
        });
        test('task completes for an unsigned extension even when signature verification throws error', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: false }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: 'error', didExecute: true }), disposables.add(new lifecycle_1.$jc()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, false);
            assert.strictEqual(testObject.installed, true);
        });
        function anExtensionsDownloader(options) {
            const logService = new log_1.$fj();
            const fileService = disposables.add(new fileService_1.$Dp(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            const instantiationService = disposables.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(productService_1.$kj, { quality: options.quality ?? 'insiders' });
            instantiationService.stub(files_1.$6j, fileService);
            instantiationService.stub(log_1.$5i, logService);
            instantiationService.stub(environment_1.$Jh, { extensionsDownloadLocation: (0, resources_1.$ig)(ROOT, 'CachedExtensionVSIXs') });
            instantiationService.stub(extensionManagement_1.$Zn, {
                async download(extension, location, operation) {
                    await fileService.writeFile(location, buffer_1.$Fd.fromString('extension vsix'));
                },
                async downloadSignatureArchive(extension, location) {
                    await fileService.writeFile(location, buffer_1.$Fd.fromString('extension signature'));
                },
            });
            instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b((0, types_1.$pf)(options.isSignatureVerificationEnabled) ? { extensions: { verifySignature: options.isSignatureVerificationEnabled } } : undefined));
            instantiationService.stub(extensionSignatureVerificationService_1.$7o, new TestExtensionSignatureVerificationService(options.verificationResult, !!options.didExecute));
            return disposables.add(instantiationService.createInstance(extensionDownloader_1.$tp));
        }
        function aGalleryExtension(name, properties = {}, galleryExtensionProperties = {}, assets = {}) {
            const targetPlatform = (0, extensionManagement_1.$Un)(platform_1.$t, process_1.$4d);
            const galleryExtension = Object.create({ name, publisher: 'pub', version: '1.0.0', allTargetPlatforms: [targetPlatform], properties: {}, assets: {}, ...properties });
            galleryExtension.properties = { ...galleryExtension.properties, dependencies: [], targetPlatform, ...galleryExtensionProperties };
            galleryExtension.assets = { ...galleryExtension.assets, ...assets };
            galleryExtension.identifier = { id: (0, extensionManagementUtil_1.$uo)(galleryExtension.publisher, galleryExtension.name), uuid: (0, uuid_1.$4f)() };
            return galleryExtension;
        }
    });
});
//# sourceMappingURL=installGalleryExtensionTask.test.js.map