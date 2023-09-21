/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/base/common/uri", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/uuid", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/product/common/productService"], function (require, exports, assert, extensionsWorkbenchService_1, uri_1, extensionManagementUtil_1, uuid_1, instantiationServiceMock_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Extension Test', () => {
        let instantiationService;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.$L0b();
            instantiationService.stub(productService_1.$kj, { quality: 'insiders' });
        });
        teardown(() => {
            instantiationService.dispose();
        });
        test('extension is not outdated when there is no local and gallery', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, undefined, undefined);
            assert.strictEqual(extension.outdated, false);
        });
        test('extension is not outdated when there is local and no gallery', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension(), undefined);
            assert.strictEqual(extension.outdated, false);
        });
        test('extension is not outdated when there is no local and has gallery', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, undefined, aGalleryExtension());
            assert.strictEqual(extension.outdated, false);
        });
        test('extension is not outdated when local and gallery are on same version', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension(), aGalleryExtension());
            assert.strictEqual(extension.outdated, false);
        });
        test('extension is outdated when local is older than gallery', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext', { version: '1.0.0' }), aGalleryExtension('somext', { version: '1.0.1' }));
            assert.strictEqual(extension.outdated, true);
        });
        test('extension is outdated when local is built in and older than gallery', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext', { version: '1.0.0' }, { type: 0 /* ExtensionType.System */ }), aGalleryExtension('somext', { version: '1.0.1' }));
            assert.strictEqual(extension.outdated, true);
        });
        test('extension is not outdated when local is built in and older than gallery but product quality is stable', () => {
            instantiationService.stub(productService_1.$kj, { quality: 'stable' });
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext', { version: '1.0.0' }, { type: 0 /* ExtensionType.System */ }), aGalleryExtension('somext', { version: '1.0.1' }));
            assert.strictEqual(extension.outdated, false);
        });
        test('extension is outdated when local and gallery are on same version but on different target platforms', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext', {}, { targetPlatform: "win32-ia32" /* TargetPlatform.WIN32_IA32 */ }), aGalleryExtension('somext', {}, { targetPlatform: "win32-x64" /* TargetPlatform.WIN32_X64 */ }));
            assert.strictEqual(extension.outdated, true);
        });
        test('extension is not outdated when local and gallery are on same version and local is on web', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext', {}, { targetPlatform: "web" /* TargetPlatform.WEB */ }), aGalleryExtension('somext'));
            assert.strictEqual(extension.outdated, false);
        });
        test('extension is not outdated when local and gallery are on same version and gallery is on web', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext'), aGalleryExtension('somext', {}, { targetPlatform: "web" /* TargetPlatform.WEB */ }));
            assert.strictEqual(extension.outdated, false);
        });
        test('extension is not outdated when local is not pre-release but gallery is pre-release', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext', { version: '1.0.0' }), aGalleryExtension('somext', { version: '1.0.1' }, { isPreReleaseVersion: true }));
            assert.strictEqual(extension.outdated, false);
        });
        test('extension is outdated when local and gallery are pre-releases', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext', { version: '1.0.0' }, { preRelease: true, isPreReleaseVersion: true }), aGalleryExtension('somext', { version: '1.0.1' }, { isPreReleaseVersion: true }));
            assert.strictEqual(extension.outdated, true);
        });
        test('extension is outdated when local was opted to pre-release but current version is not pre-release', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext', { version: '1.0.0' }, { preRelease: true, isPreReleaseVersion: false }), aGalleryExtension('somext', { version: '1.0.1' }, { isPreReleaseVersion: true }));
            assert.strictEqual(extension.outdated, true);
        });
        test('extension is outdated when local is pre-release but gallery is not', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext', { version: '1.0.0' }, { preRelease: true, isPreReleaseVersion: true }), aGalleryExtension('somext', { version: '1.0.1' }));
            assert.strictEqual(extension.outdated, true);
        });
        test('extension is outdated when local was opted pre-release but current version is not and gallery is not', () => {
            const extension = instantiationService.createInstance(extensionsWorkbenchService_1.$2Ub, () => 1 /* ExtensionState.Installed */, () => undefined, undefined, aLocalExtension('somext', { version: '1.0.0' }, { preRelease: true, isPreReleaseVersion: false }), aGalleryExtension('somext', { version: '1.0.1' }));
            assert.strictEqual(extension.outdated, true);
        });
        function aLocalExtension(name = 'someext', manifest = {}, properties = {}) {
            manifest = { name, publisher: 'pub', version: '1.0.0', ...manifest };
            properties = {
                type: 1 /* ExtensionType.User */,
                location: uri_1.URI.file(`pub.${name}`),
                identifier: { id: (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name) },
                targetPlatform: "undefined" /* TargetPlatform.UNDEFINED */,
                ...properties
            };
            return Object.create({ manifest, ...properties });
        }
        function aGalleryExtension(name = 'somext', properties = {}, galleryExtensionProperties = {}) {
            const targetPlatform = galleryExtensionProperties.targetPlatform ?? "undefined" /* TargetPlatform.UNDEFINED */;
            const galleryExtension = Object.create({ name, publisher: 'pub', version: '1.0.0', allTargetPlatforms: [targetPlatform], properties: {}, assets: {}, ...properties });
            galleryExtension.properties = { ...galleryExtension.properties, dependencies: [], targetPlatform, ...galleryExtensionProperties };
            galleryExtension.identifier = { id: (0, extensionManagementUtil_1.$uo)(galleryExtension.publisher, galleryExtension.name), uuid: (0, uuid_1.$4f)() };
            return galleryExtension;
        }
    });
});
//# sourceMappingURL=extension.test.js.map