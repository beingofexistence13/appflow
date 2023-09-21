/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/test/common/mock", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/externalServices/common/marketplace", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/base/test/common/utils"], function (require, exports, assert, resources_1, uri_1, uuid_1, mock_1, testConfigurationService_1, extensionGalleryService_1, fileService_1, inMemoryFilesystemProvider_1, log_1, product_1, marketplace_1, storage_1, telemetry_1, telemetryUtils_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EnvironmentServiceMock extends (0, mock_1.mock)() {
        constructor(serviceMachineIdResource) {
            super();
            this.serviceMachineIdResource = serviceMachineIdResource;
            this.isBuilt = true;
        }
    }
    suite('Extension Gallery Service', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let fileService, environmentService, storageService, productService, configurationService;
        setup(() => {
            const serviceMachineIdResource = (0, resources_1.joinPath)(uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }), 'machineid');
            environmentService = new EnvironmentServiceMock(serviceMachineIdResource);
            fileService = disposables.add(new fileService_1.FileService(new log_1.NullLogService()));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            disposables.add(fileService.registerProvider(serviceMachineIdResource.scheme, fileSystemProvider));
            storageService = disposables.add(new storage_1.InMemoryStorageService());
            configurationService = new testConfigurationService_1.TestConfigurationService({ [telemetry_1.TELEMETRY_SETTING_ID]: "all" /* TelemetryConfiguration.ON */ });
            configurationService.updateValue(telemetry_1.TELEMETRY_SETTING_ID, "all" /* TelemetryConfiguration.ON */);
            productService = { _serviceBrand: undefined, ...product_1.default, enableTelemetry: true };
        });
        test('marketplace machine id', async () => {
            const headers = await (0, marketplace_1.resolveMarketplaceHeaders)(product_1.default.version, productService, environmentService, configurationService, fileService, storageService, telemetryUtils_1.NullTelemetryService);
            assert.ok((0, uuid_1.isUUID)(headers['X-Market-User-Id']));
            const headers2 = await (0, marketplace_1.resolveMarketplaceHeaders)(product_1.default.version, productService, environmentService, configurationService, fileService, storageService, telemetryUtils_1.NullTelemetryService);
            assert.strictEqual(headers['X-Market-User-Id'], headers2['X-Market-User-Id']);
        });
        test('sorting single extension version without target platform', async () => {
            const actual = [aExtensionVersion('1.1.2')];
            const expected = [...actual];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "darwin-x64" /* TargetPlatform.DARWIN_X64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting single extension version with preferred target platform', async () => {
            const actual = [aExtensionVersion('1.1.2', "darwin-x64" /* TargetPlatform.DARWIN_X64 */)];
            const expected = [...actual];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "darwin-x64" /* TargetPlatform.DARWIN_X64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting single extension version with fallback target platform', async () => {
            const actual = [aExtensionVersion('1.1.2', "win32-ia32" /* TargetPlatform.WIN32_IA32 */)];
            const expected = [...actual];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "win32-x64" /* TargetPlatform.WIN32_X64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting single extension version with not compatible target platform', async () => {
            const actual = [aExtensionVersion('1.1.2', "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */)];
            const expected = [...actual];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "win32-x64" /* TargetPlatform.WIN32_X64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting single extension version with multiple target platforms and preferred at first', async () => {
            const actual = [aExtensionVersion('1.1.2', "win32-x64" /* TargetPlatform.WIN32_X64 */), aExtensionVersion('1.1.2', "win32-ia32" /* TargetPlatform.WIN32_IA32 */), aExtensionVersion('1.1.2')];
            const expected = [...actual];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "win32-x64" /* TargetPlatform.WIN32_X64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting single extension version with multiple target platforms and preferred at first with no fallbacks', async () => {
            const actual = [aExtensionVersion('1.1.2', "darwin-x64" /* TargetPlatform.DARWIN_X64 */), aExtensionVersion('1.1.2'), aExtensionVersion('1.1.2', "win32-ia32" /* TargetPlatform.WIN32_IA32 */)];
            const expected = [...actual];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "darwin-x64" /* TargetPlatform.DARWIN_X64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting single extension version with multiple target platforms and preferred at first and fallback at last', async () => {
            const actual = [aExtensionVersion('1.1.2', "win32-x64" /* TargetPlatform.WIN32_X64 */), aExtensionVersion('1.1.2'), aExtensionVersion('1.1.2', "win32-ia32" /* TargetPlatform.WIN32_IA32 */)];
            const expected = [actual[0], actual[2], actual[1]];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "win32-x64" /* TargetPlatform.WIN32_X64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting single extension version with multiple target platforms and preferred is not first', async () => {
            const actual = [aExtensionVersion('1.1.2', "win32-ia32" /* TargetPlatform.WIN32_IA32 */), aExtensionVersion('1.1.2', "win32-x64" /* TargetPlatform.WIN32_X64 */), aExtensionVersion('1.1.2')];
            const expected = [actual[1], actual[0], actual[2]];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "win32-x64" /* TargetPlatform.WIN32_X64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting single extension version with multiple target platforms and preferred is at the end', async () => {
            const actual = [aExtensionVersion('1.1.2', "win32-ia32" /* TargetPlatform.WIN32_IA32 */), aExtensionVersion('1.1.2'), aExtensionVersion('1.1.2', "win32-x64" /* TargetPlatform.WIN32_X64 */)];
            const expected = [actual[2], actual[0], actual[1]];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "win32-x64" /* TargetPlatform.WIN32_X64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting multiple extension versions without target platforms', async () => {
            const actual = [aExtensionVersion('1.2.4'), aExtensionVersion('1.1.3'), aExtensionVersion('1.1.2'), aExtensionVersion('1.1.1')];
            const expected = [...actual];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "win32-arm64" /* TargetPlatform.WIN32_ARM64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting multiple extension versions with target platforms - 1', async () => {
            const actual = [aExtensionVersion('1.2.4', "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */), aExtensionVersion('1.2.4', "win32-arm64" /* TargetPlatform.WIN32_ARM64 */), aExtensionVersion('1.2.4', "linux-arm64" /* TargetPlatform.LINUX_ARM64 */), aExtensionVersion('1.1.3'), aExtensionVersion('1.1.2'), aExtensionVersion('1.1.1')];
            const expected = [actual[1], actual[0], actual[2], actual[3], actual[4], actual[5]];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "win32-arm64" /* TargetPlatform.WIN32_ARM64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting multiple extension versions with target platforms - 2', async () => {
            const actual = [aExtensionVersion('1.2.4'), aExtensionVersion('1.2.3', "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */), aExtensionVersion('1.2.3', "win32-arm64" /* TargetPlatform.WIN32_ARM64 */), aExtensionVersion('1.2.3', "linux-arm64" /* TargetPlatform.LINUX_ARM64 */), aExtensionVersion('1.1.2'), aExtensionVersion('1.1.1')];
            const expected = [actual[0], actual[3], actual[1], actual[2], actual[4], actual[5]];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "linux-arm64" /* TargetPlatform.LINUX_ARM64 */);
            assert.deepStrictEqual(actual, expected);
        });
        test('sorting multiple extension versions with target platforms - 3', async () => {
            const actual = [aExtensionVersion('1.2.4'), aExtensionVersion('1.1.2'), aExtensionVersion('1.1.1'), aExtensionVersion('1.0.0', "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */), aExtensionVersion('1.0.0', "win32-ia32" /* TargetPlatform.WIN32_IA32 */), aExtensionVersion('1.0.0', "win32-arm64" /* TargetPlatform.WIN32_ARM64 */)];
            const expected = [actual[0], actual[1], actual[2], actual[5], actual[4], actual[3]];
            (0, extensionGalleryService_1.sortExtensionVersions)(actual, "win32-arm64" /* TargetPlatform.WIN32_ARM64 */);
            assert.deepStrictEqual(actual, expected);
        });
        function aExtensionVersion(version, targetPlatform) {
            return { version, targetPlatform };
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uR2FsbGVyeVNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvdGVzdC9jb21tb24vZXh0ZW5zaW9uR2FsbGVyeVNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXdCaEcsTUFBTSxzQkFBdUIsU0FBUSxJQUFBLFdBQUksR0FBdUI7UUFFL0QsWUFBWSx3QkFBNkI7WUFDeEMsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsd0JBQXdCLEdBQUcsd0JBQXdCLENBQUM7WUFDekQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDckIsQ0FBQztLQUNEO0lBRUQsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtRQUN2QyxNQUFNLFdBQVcsR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFDOUQsSUFBSSxXQUF5QixFQUFFLGtCQUF1QyxFQUFFLGNBQStCLEVBQUUsY0FBK0IsRUFBRSxvQkFBMkMsQ0FBQztRQUV0TCxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsTUFBTSx3QkFBd0IsR0FBRyxJQUFBLG9CQUFRLEVBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUMzRyxrQkFBa0IsR0FBRyxJQUFJLHNCQUFzQixDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDMUUsV0FBVyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSx5QkFBVyxDQUFDLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRSxNQUFNLGtCQUFrQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSx1REFBMEIsRUFB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