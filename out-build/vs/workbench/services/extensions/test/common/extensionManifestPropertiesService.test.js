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
            disposables = new lifecycle_1.$jc();
            testObject = disposables.add(new extensionManifestPropertiesService_1.$wcb(workbenchTestServices_1.$bec, new testConfigurationService_1.$G0b(), new workbenchTestServices_1.$eec(), new log_1.$fj()));
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('declarative with extension dependencies', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ extensionDependencies: ['ext1'] }), platform_1.$o ? ['workspace', 'web'] : ['workspace']);
        });
        test('declarative extension pack', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ extensionPack: ['ext1', 'ext2'] }), platform_1.$o ? ['workspace', 'web'] : ['workspace']);
        });
        test('declarative extension pack and extension dependencies', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ extensionPack: ['ext1', 'ext2'], extensionDependencies: ['ext1', 'ext2'] }), platform_1.$o ? ['workspace', 'web'] : ['workspace']);
        });
        test('declarative with unknown contribution point => workspace, web in web and => workspace in desktop', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ contributes: { 'unknownPoint': { something: true } } }), platform_1.$o ? ['workspace', 'web'] : ['workspace']);
        });
        test('declarative extension pack with unknown contribution point', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ extensionPack: ['ext1', 'ext2'], contributes: { 'unknownPoint': { something: true } } }), platform_1.$o ? ['workspace', 'web'] : ['workspace']);
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
            assert.deepStrictEqual(testObject.getExtensionKind({ main: 'main.js', browser: 'main.browser.js' }), platform_1.$o ? ['workspace', 'web'] : ['workspace']);
        });
        test('browser entry point with workspace extensionKind => workspace, web in web and workspace in desktop', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ main: 'main.js', browser: 'main.browser.js', extensionKind: ['workspace'] }), platform_1.$o ? ['workspace', 'web'] : ['workspace']);
        });
        test('only browser entry point with out extensionKind => web', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ browser: 'main.browser.js' }), ['web']);
        });
        test('simple descriptive with workspace, ui extensionKind => workspace, ui, web in web and workspace, ui in desktop', () => {
            assert.deepStrictEqual(testObject.getExtensionKind({ extensionKind: ['workspace', 'ui'] }), platform_1.$o ? ['workspace', 'ui', 'web'] : ['workspace', 'ui']);
        });
        test('opt out from web through settings even if it can run in web', () => {
            testObject = disposables.add(new extensionManifestPropertiesService_1.$wcb(workbenchTestServices_1.$bec, new testConfigurationService_1.$G0b({ remote: { extensionKind: { 'pub.a': ['-web'] } } }), new workbenchTestServices_1.$eec(), new log_1.$fj()));
            assert.deepStrictEqual(testObject.getExtensionKind({ browser: 'main.browser.js', publisher: 'pub', name: 'a' }), ['ui', 'workspace']);
        });
        test('opt out from web and include only workspace through settings even if it can run in web', () => {
            testObject = disposables.add(new extensionManifestPropertiesService_1.$wcb(workbenchTestServices_1.$bec, new testConfigurationService_1.$G0b({ remote: { extensionKind: { 'pub.a': ['-web', 'workspace'] } } }), new workbenchTestServices_1.$eec(), new log_1.$fj()));
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
    if (!platform_1.$o) {
        suite('ExtensionManifestPropertiesService - ExtensionUntrustedWorkspaceSupportType', () => {
            let testObject;
            let instantiationService;
            let testConfigurationService;
            setup(async () => {
                instantiationService = new instantiationServiceMock_1.$L0b();
                testConfigurationService = new testConfigurationService_1.$G0b();
                instantiationService.stub(configuration_1.$8h, testConfigurationService);
            });
            teardown(() => {
                testObject.dispose();
                instantiationService.dispose();
            });
            function assertUntrustedWorkspaceSupport(extensionManifest, expected) {
                testObject = instantiationService.createInstance(extensionManifestPropertiesService_1.$wcb);
                const untrustedWorkspaceSupport = testObject.getExtensionUntrustedWorkspaceSupportType(extensionManifest);
                assert.strictEqual(untrustedWorkspaceSupport, expected);
            }
            function getExtensionManifest(properties = {}) {
                return Object.create({ name: 'a', publisher: 'pub', version: '1.0.0', ...properties });
            }
            test('test extension workspace trust request when main entry point is missing', () => {
                instantiationService.stub(productService_1.$kj, {});
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                const extensionManifest = getExtensionManifest();
                assertUntrustedWorkspaceSupport(extensionManifest, true);
            });
            test('test extension workspace trust request when workspace trust is disabled', async () => {
                instantiationService.stub(productService_1.$kj, {});
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec(false));
                const extensionManifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionManifest, true);
            });
            test('test extension workspace trust request when "true" override exists in settings.json', async () => {
                instantiationService.stub(productService_1.$kj, {});
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                await testConfigurationService.setUserConfiguration('extensions', { supportUntrustedWorkspaces: { 'pub.a': { supported: true } } });
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, true);
            });
            test('test extension workspace trust request when override (false) exists in settings.json', async () => {
                instantiationService.stub(productService_1.$kj, {});
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                await testConfigurationService.setUserConfiguration('extensions', { supportUntrustedWorkspaces: { 'pub.a': { supported: false } } });
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, false);
            });
            test('test extension workspace trust request when override (true) for the version exists in settings.json', async () => {
                instantiationService.stub(productService_1.$kj, {});
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                await testConfigurationService.setUserConfiguration('extensions', { supportUntrustedWorkspaces: { 'pub.a': { supported: true, version: '1.0.0' } } });
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, true);
            });
            test('test extension workspace trust request when override (false) for the version exists in settings.json', async () => {
                instantiationService.stub(productService_1.$kj, {});
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                await testConfigurationService.setUserConfiguration('extensions', { supportUntrustedWorkspaces: { 'pub.a': { supported: false, version: '1.0.0' } } });
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, false);
            });
            test('test extension workspace trust request when override for a different version exists in settings.json', async () => {
                instantiationService.stub(productService_1.$kj, {});
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                await testConfigurationService.setUserConfiguration('extensions', { supportUntrustedWorkspaces: { 'pub.a': { supported: true, version: '2.0.0' } } });
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, 'limited');
            });
            test('test extension workspace trust request when default (true) exists in product.json', () => {
                instantiationService.stub(productService_1.$kj, { extensionUntrustedWorkspaceSupport: { 'pub.a': { default: true } } });
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionManifest, true);
            });
            test('test extension workspace trust request when default (false) exists in product.json', () => {
                instantiationService.stub(productService_1.$kj, { extensionUntrustedWorkspaceSupport: { 'pub.a': { default: false } } });
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionManifest, false);
            });
            test('test extension workspace trust request when override (limited) exists in product.json', () => {
                instantiationService.stub(productService_1.$kj, { extensionUntrustedWorkspaceSupport: { 'pub.a': { override: 'limited' } } });
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: true } } });
                assertUntrustedWorkspaceSupport(extensionManifest, 'limited');
            });
            test('test extension workspace trust request when override (false) exists in product.json', () => {
                instantiationService.stub(productService_1.$kj, { extensionUntrustedWorkspaceSupport: { 'pub.a': { override: false } } });
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: true } } });
                assertUntrustedWorkspaceSupport(extensionManifest, false);
            });
            test('test extension workspace trust request when value exists in package.json', () => {
                instantiationService.stub(productService_1.$kj, {});
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionManifest, 'limited');
            });
            test('test extension workspace trust request when no value exists in package.json', () => {
                instantiationService.stub(productService_1.$kj, {});
                instantiationService.stub(workspaceTrust_1.$0z, new workbenchTestServices_1.$eec());
                const extensionManifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionManifest, false);
            });
        });
    }
});
//# sourceMappingURL=extensionManifestPropertiesService.test.js.map