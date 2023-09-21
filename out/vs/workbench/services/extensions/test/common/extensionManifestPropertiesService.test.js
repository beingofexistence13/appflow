/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, lifecycle_1, platform_1, utils_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, log_1, productService_1, workspaceTrust_1, extensionManifestPropertiesService_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionManifestPropertiesService - ExtensionKind', () => {
        let disposables;
        let testObject;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            testObject = disposables.add(new extensionManifestPropertiesService_1.ExtensionManifestPropertiesService(workbenchTestServices_1.TestProductService, new testConfigurationService_1.TestConfigurationService(), new workbenchTestServices_1.TestWorkspaceTrustEnablementService(), new log_1.NullLogService()));
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('declarative with extension dependencies', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ extensionDependencies: ['ext1'] }), platform_1.isWeb ? ['workspace', 'web'] : ['workspace']);
        });
        test('declarative extension pack', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ extensionPack: ['ext1', 'ext2'] }), platform_1.isWeb ? ['workspace', 'web'] : ['workspace']);
        });
        test('declarative extension pack and extension dependencies', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ extensionPack: ['ext1', 'ext2'], extensionDependencies: ['ext1', 'ext2'] }), platform_1.isWeb ? ['workspace', 'web'] : ['workspace']);
        });
        test('declarative with unknown contribution point => workspace, web in web and => workspace in desktop', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ contributes: { 'unknownPoint': { something: true } } }), platform_1.isWeb ? ['workspace', 'web'] : ['workspace']);
        });
        test('declarative extension pack with unknown contribution point', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ extensionPack: ['ext1', 'ext2'], contributes: { 'unknownPoint': { something: true } } }), platform_1.isWeb ? ['workspace', 'web'] : ['workspace']);
        });
        test('simple declarative => ui, workspace, web', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({}), ['ui', 'workspace', 'web']);
        });
        test('only browser => web', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ browser: 'main.browser.js' }), ['web']);
        });
        test('only main => workspace', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ main: 'main.js' }), ['workspace']);
        });
        test('main and browser => workspace, web in web and workspace in desktop', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ main: 'main.js', browser: 'main.browser.js' }), platform_1.isWeb ? ['workspace', 'web'] : ['workspace']);
        });
        test('browser entry point with workspace extensionKind => workspace, web in web and workspace in desktop', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ main: 'main.js', browser: 'main.browser.js', extensionKind: ['workspace'] }), platform_1.isWeb ? ['workspace', 'web'] : ['workspace']);
        });
        test('only browser entry point with out extensionKind => web', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ browser: 'main.browser.js' }), ['web']);
        });
        test('simple descriptive with workspace, ui extensionKind => workspace, ui, web in web and workspace, ui in desktop', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ extensionKind: ['workspace', 'ui'] }), platform_1.isWeb ? ['workspace', 'ui', 'web'] : ['workspace', 'ui']);
        });
        test('opt out from web through settings even if it can run in web', () => {
            testObject = disposables.add(new extensionManifestPropertiesService_1.ExtensionManifestPropertiesService(workbenchTestServices_1.TestProductService, new testConfigurationService_1.TestConfigurationService({ remote: { extensionKind: { 'pub.a': ['-web'] } } }), new workbenchTestServices_1.TestWorkspaceTrustEnablementService(), new log_1.NullLogService()));
            assert.deepStrictEqual(testObject.getExtensionKind({ browser: 'main.browser.js', publisher: 'pub', name: 'a' }), ['ui', 'workspace']);
        });
        test('opt out from web and include only workspace through settings even if it can run in web', () => {
            testObject = disposables.add(new extensionManifestPropertiesService_1.ExtensionManifestPropertiesService(workbenchTestServices_1.TestProductService, new testConfigurationService_1.TestConfigurationService({ remote: { extensionKind: { 'pub.a': ['-web', 'workspace'] } } }), new workbenchTestServices_1.TestWorkspaceTrustEnablementService(), new log_1.NullLogService()));
            assert.deepStrictEqual(testObject.getExtensionKind({ browser: 'main.browser.js', publisher: 'pub', name: 'a' }), ['workspace']);
        });
        test('extension cannot opt out from web', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ browser: 'main.browser.js', extensionKind: ['-web'] }), ['web']);
        });
        test('extension cannot opt into web', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ main: 'main.js', extensionKind: ['web', 'workspace', 'ui'] }), ['workspace', 'ui']);
        });
        test('extension cannot opt into web only', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ main: 'main.js', extensionKind: ['web'] }), ['workspace']);
        });
    });
    // Workspace Trust is disabled in web at the moment
    if (!platform_1.isWeb) {
        suite('ExtensionManifestPropertiesService - ExtensionUntrustedWorkspaceSupportType', () => {
            let testObject;
            let instantiationService;
            let testConfigurationService;
            setup(async () => {
                instantiationService = new instantiationServiceMock_1.TestInstantiationService();
                testConfigurationService = new testConfigurationService_1.TestConfigurationService();
                instantiationService.stub(configuration_1.IConfigurationService, testConfigurationService);
            });
            teardown(() => {
                testObject.dispose();
                instantiationService.dispose();
            });
            function assertUntrustedWorkspaceSupport(extensionManifest, expected) {
                testObject = instantiationService.createInstance(extensionManifestPropertiesService_1.ExtensionManifestPropertiesService);
                const untrustedWorkspaceSupport = testObject.getExtensionUntrustedWorkspaceSupportType(extensionManifest);
                assert.strictEqual(untrustedWorkspaceSupport, expected);
            }
            function getExtensionManifest(properties = {}) {
                return Object.create({ name: 'a', publisher: 'pub', version: '1.0.0', ...properties });
            }
            test('test extension workspace trust request when main entry point is missing', () => {
                instantiationService.stub(productService_1.IProductService, {});
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                const extensionManifest = getExtensionManifest();
                assertUntrustedWorkspaceSupport(extensionManifest, true);
            });
            test('test extension workspace trust request when workspace trust is disabled', async () => {
                instantiationService.stub(productService_1.IProductService, {});
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService(false));
                const extensionManifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionManifest, true);
            });
            test('test extension workspace trust request when "true" override exists in settings.json', async () => {
                instantiationService.stub(productService_1.IProductService, {});
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                await testConfigurationService.setUserConfiguration('extensions', { supportUntrustedWorkspaces: { 'pub.a': { supported: true } } });
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, true);
            });
            test('test extension workspace trust request when override (false) exists in settings.json', async () => {
                instantiationService.stub(productService_1.IProductService, {});
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                await testConfigurationService.setUserConfiguration('extensions', { supportUntrustedWorkspaces: { 'pub.a': { supported: false } } });
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, false);
            });
            test('test extension workspace trust request when override (true) for the version exists in settings.json', async () => {
                instantiationService.stub(productService_1.IProductService, {});
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                await testConfigurationService.setUserConfiguration('extensions', { supportUntrustedWorkspaces: { 'pub.a': { supported: true, version: '1.0.0' } } });
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, true);
            });
            test('test extension workspace trust request when override (false) for the version exists in settings.json', async () => {
                instantiationService.stub(productService_1.IProductService, {});
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                await testConfigurationService.setUserConfiguration('extensions', { supportUntrustedWorkspaces: { 'pub.a': { supported: false, version: '1.0.0' } } });
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, false);
            });
            test('test extension workspace trust request when override for a different version exists in settings.json', async () => {
                instantiationService.stub(productService_1.IProductService, {});
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                await testConfigurationService.setUserConfiguration('extensions', { supportUntrustedWorkspaces: { 'pub.a': { supported: true, version: '2.0.0' } } });
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, 'limited');
            });
            test('test extension workspace trust request when default (true) exists in product.json', () => {
                instantiationService.stub(productService_1.IProductService, { extensionUntrustedWorkspaceSupport: { 'pub.a': { default: true } } });
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionManifest, true);
            });
            test('test extension workspace trust request when default (false) exists in product.json', () => {
                instantiationService.stub(productService_1.IProductService, { extensionUntrustedWorkspaceSupport: { 'pub.a': { default: false } } });
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionManifest, false);
            });
            test('test extension workspace trust request when override (limited) exists in product.json', () => {
                instantiationService.stub(productService_1.IProductService, { extensionUntrustedWorkspaceSupport: { 'pub.a': { override: 'limited' } } });
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: true } } });
                assertUntrustedWorkspaceSupport(extensionManifest, 'limited');
            });
            test('test extension workspace trust request when override (false) exists in product.json', () => {
                instantiationService.stub(productService_1.IProductService, { extensionUntrustedWorkspaceSupport: { 'pub.a': { override: false } } });
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: true } } });
                assertUntrustedWorkspaceSupport(extensionManifest, false);
            });
            test('test extension workspace trust request when value exists in package.json', () => {
                instantiationService.stub(productService_1.IProductService, {});
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, 'limited');
            });
            test('test extension workspace trust request when no value exists in package.json', () => {
                instantiationService.stub(productService_1.IProductService, {});
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionManifest, false);
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuaWZlc3RQcm9wZXJ0aWVzU2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvdGVzdC9jb21tb24vZXh0ZW5zaW9uTWFuaWZlc3RQcm9wZXJ0aWVzU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBZ0JoRyxLQUFLLENBQUMsb0RBQW9ELEVBQUUsR0FBRyxFQUFFO1FBRWhFLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLFVBQThDLENBQUM7UUFFbkQsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNwQyxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHVFQUFrQyxDQUFDLDBDQUFrQixFQUFFLElBQUksbURBQXdCLEVBQUUsRUFBRSxJQUFJLDJEQUFtQyxFQUFFLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1lBQ3BELE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFxQixFQUFFLHFCQUFxQixFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLGdCQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDNUosQ0FBQyxDQUFDLENB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