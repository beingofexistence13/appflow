/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uuid", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/services/extensionManagement/test/browser/extensionEnablementService.test", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/url/common/url", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/test/electron-sandbox/workbenchTestServices", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/url/common/urlService", "vs/base/common/uri", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/remote/electron-sandbox/remoteAgentService", "vs/platform/ipc/electron-sandbox/services", "vs/base/common/cancellation", "vs/platform/label/common/label", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/progress/common/progress", "vs/workbench/services/progress/browser/progressService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/environment/common/environmentService", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncEnablementService", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/workspace/common/workspaceTrust", "vs/platform/environment/common/environment", "vs/base/common/platform", "vs/base/common/process", "vs/base/test/common/utils"], function (require, exports, assert, uuid_1, extensions_1, ExtensionsActions, extensionsWorkbenchService_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, extensionManagementUtil_1, extensionEnablementService_test_1, extensionGalleryService_1, url_1, instantiationServiceMock_1, event_1, telemetry_1, telemetryUtils_1, extensions_2, workspace_1, workbenchTestServices_1, workbenchTestServices_2, configuration_1, log_1, urlService_1, uri_1, testConfigurationService_1, remoteAgentService_1, remoteAgentService_2, services_1, cancellation_1, label_1, productService_1, network_1, progress_1, progressService_1, lifecycle_1, workbenchTestServices_3, environmentService_1, environmentService_2, userDataSync_1, userDataSyncEnablementService_1, contextkey_1, mockKeybindingService_1, workspaceTrust_1, environment_1, platform_1, process_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let instantiationService;
    let installEvent, didInstallEvent, uninstallEvent, didUninstallEvent;
    function setupTest(disposables) {
        installEvent = disposables.add(new event_1.$fd());
        didInstallEvent = disposables.add(new event_1.$fd());
        uninstallEvent = disposables.add(new event_1.$fd());
        didUninstallEvent = disposables.add(new event_1.$fd());
        instantiationService = disposables.add(new instantiationServiceMock_1.$L0b());
        instantiationService.stub(environment_1.$Ih, workbenchTestServices_3.$qec);
        instantiationService.stub(environmentService_2.$hJ, workbenchTestServices_3.$qec);
        instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
        instantiationService.stub(log_1.$5i, log_1.$fj);
        instantiationService.stub(workspace_1.$Kh, new workbenchTestServices_1.$6dc());
        instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b());
        instantiationService.stub(progress_1.$2u, progressService_1.$uyb);
        instantiationService.stub(productService_1.$kj, {});
        instantiationService.stub(contextkey_1.$3i, new mockKeybindingService_1.$S0b());
        instantiationService.stub(extensionManagement_1.$Zn, extensionGalleryService_1.$5o);
        instantiationService.stub(services_1.$A7b, workbenchTestServices_2.$wfc);
        instantiationService.stub(extensionManagement_1.$2n, {
            onInstallExtension: installEvent.event,
            onDidInstallExtensions: didInstallEvent.event,
            onUninstallExtension: uninstallEvent.event,
            onDidUninstallExtension: didUninstallEvent.event,
            onDidChangeProfile: event_1.Event.None,
            onDidUpdateExtensionMetadata: event_1.Event.None,
            async getInstalled() { return []; },
            async getExtensionsControlManifest() { return { malicious: [], deprecated: {}, search: [] }; },
            async updateMetadata(local, metadata) {
                local.identifier.uuid = metadata.id;
                local.publisherDisplayName = metadata.publisherDisplayName;
                local.publisherId = metadata.publisherId;
                return local;
            },
            async canInstall() { return true; },
            async getTargetPlatform() { return (0, extensionManagement_1.$Un)(platform_1.$t, process_1.$4d); },
        });
        instantiationService.stub(remoteAgentService_1.$jm, remoteAgentService_2.$8$b);
        const localExtensionManagementServer = { extensionManagementService: instantiationService.get(extensionManagement_1.$2n), label: 'local', id: 'vscode-local' };
        instantiationService.stub(extensionManagement_2.$fcb, {
            get localExtensionManagementServer() {
                return localExtensionManagementServer;
            },
            getExtensionManagementServer(extension) {
                if (extension.location.scheme === network_1.Schemas.file) {
                    return localExtensionManagementServer;
                }
                throw new Error(`Invalid Extension ${extension.location}`);
            }
        });
        instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
        instantiationService.stub(label_1.$Vz, { onDidChangeFormatters: disposables.add(new event_1.$fd()).event });
        instantiationService.stub(lifecycle_1.$7y, disposables.add(new workbenchTestServices_3.$Kec()));
        instantiationService.stub(extensionManagement_1.$6n, disposables.add(instantiationService.createInstance(workbenchTestServices_2.$yfc)));
        instantiationService.stub(extensionRecommendations_1.$9fb, {});
        instantiationService.stub(url_1.$IT, urlService_1.$KT);
        instantiationService.stub(extensionManagement_1.$Zn, 'isEnabled', true);
        instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage());
        instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', []);
        instantiationService.stub(extensions_2.$MF, { extensions: [], onDidChangeExtensions: event_1.Event.None, canAddExtension: (extension) => false, canRemoveExtension: (extension) => false, whenInstalledExtensionsRegistered: () => Promise.resolve(true) });
        instantiationService.get(extensionManagement_2.$icb).reset();
        instantiationService.stub(userDataSync_1.$Pgb, disposables.add(instantiationService.createInstance(userDataSyncEnablementService_1.$u4b)));
        instantiationService.set(extensions_1.$Pfb, disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub)));
        instantiationService.stub(workspaceTrust_1.$$z, disposables.add(new workbenchTestServices_1.$fec()));
    }
    suite('ExtensionsActions', () => {
        const disposables = (0, utils_1.$bT)();
        setup(() => setupTest(disposables));
        test('Install action is disabled when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$rhb, { installPreReleaseVersion: false }));
            assert.ok(!testObject.enabled);
        });
        test('Test Install action when state is installed', () => {
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$rhb, { installPreReleaseVersion: false }));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return workbenchService.queryLocal()
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: local.identifier })));
                return workbenchService.queryGallery(cancellation_1.CancellationToken.None)
                    .then((paged) => {
                    testObject.extension = paged.firstPage[0];
                    assert.ok(!testObject.enabled);
                    assert.strictEqual('Install', testObject.label);
                    assert.strictEqual('extension-action label prominent install', testObject.class);
                });
            });
        });
        test('Test InstallingLabelAction when state is installing', () => {
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$thb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            return workbenchService.queryGallery(cancellation_1.CancellationToken.None)
                .then((paged) => {
                testObject.extension = paged.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                assert.ok(!testObject.enabled);
                assert.strictEqual('Installing', testObject.label);
                assert.strictEqual('extension-action label install installing', testObject.class);
            });
        });
        test('Test Install action when state is uninstalled', async () => {
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$rhb, { installPreReleaseVersion: false }));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const paged = await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const promise = event_1.Event.toPromise(testObject.onDidChange);
            testObject.extension = paged.firstPage[0];
            await promise;
            assert.ok(testObject.enabled);
            assert.strictEqual('Install', testObject.label);
        });
        test('Test Install action when extension is system action', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$rhb, { installPreReleaseVersion: false }));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                uninstallEvent.fire({ identifier: local.identifier });
                didUninstallEvent.fire({ identifier: local.identifier });
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test Install action when extension doesnot has gallery', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$rhb, { installPreReleaseVersion: false }));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                uninstallEvent.fire({ identifier: local.identifier });
                didUninstallEvent.fire({ identifier: local.identifier });
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Uninstall action is disabled when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$yhb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            assert.ok(!testObject.enabled);
        });
        test('Test Uninstall action when state is uninstalling', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$yhb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                uninstallEvent.fire({ identifier: local.identifier });
                assert.ok(!testObject.enabled);
                assert.strictEqual('Uninstalling', testObject.label);
                assert.strictEqual('extension-action label uninstall uninstalling', testObject.class);
            });
        });
        test('Test Uninstall action when state is installed and is user extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$yhb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
                assert.strictEqual('Uninstall', testObject.label);
                assert.strictEqual('extension-action label uninstall', testObject.class);
            });
        });
        test('Test Uninstall action when state is installed and is system extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$yhb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
                assert.strictEqual('Uninstall', testObject.label);
                assert.strictEqual('extension-action label uninstall', testObject.class);
            });
        });
        test('Test Uninstall action when state is installing and is user extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$yhb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                const gallery = aGalleryExtension('a');
                const extension = extensions[0];
                extension.gallery = gallery;
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                testObject.extension = extension;
                assert.ok(!testObject.enabled);
            });
        });
        test('Test Uninstall action after extension is installed', async () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$yhb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            const promise = event_1.Event.toPromise(testObject.onDidChange);
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', gallery, gallery) }]);
            await promise;
            assert.ok(testObject.enabled);
            assert.strictEqual('Uninstall', testObject.label);
            assert.strictEqual('extension-action label uninstall', testObject.class);
        });
        test('Test UpdateAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$zhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            assert.ok(!testObject.enabled);
        });
        test('Test UpdateAction when extension is uninstalled', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$zhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None)
                .then((paged) => {
                testObject.extension = paged.firstPage[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test UpdateAction when extension is installed and not outdated', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$zhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: local.identifier, version: local.manifest.version })));
                return instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None)
                    .then(extensions => assert.ok(!testObject.enabled));
            });
        });
        test('Test UpdateAction when extension is installed outdated and system extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$zhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.0' }, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: local.identifier, version: '1.0.1' })));
                return instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None)
                    .then(extensions => assert.ok(!testObject.enabled));
            });
        });
        test('Test UpdateAction when extension is installed outdated and user extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$zhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            return workbenchService.queryLocal()
                .then(async (extensions) => {
                testObject.extension = extensions[0];
                const gallery = aGalleryExtension('a', { identifier: local.identifier, version: '1.0.1' });
                instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
                instantiationService.stubPromise(extensionManagement_1.$Zn, 'getCompatibleExtension', gallery);
                instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', [gallery]);
                assert.ok(!testObject.enabled);
                return new Promise(c => {
                    disposables.add(testObject.onDidChange(() => {
                        if (testObject.enabled) {
                            c();
                        }
                    }));
                    instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None);
                });
            });
        });
        test('Test UpdateAction when extension is installing and outdated and user extension', async () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$zhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await instantiationService.get(extensions_1.$Pfb).queryLocal();
            testObject.extension = extensions[0];
            const gallery = aGalleryExtension('a', { identifier: local.identifier, version: '1.0.1' });
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'getCompatibleExtension', gallery);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', [gallery]);
            await new Promise(c => {
                disposables.add(testObject.onDidChange(() => {
                    if (testObject.enabled) {
                        c();
                    }
                }));
                instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None);
            });
            await new Promise(c => {
                disposables.add(testObject.onDidChange(() => {
                    if (!testObject.enabled) {
                        c();
                    }
                }));
                installEvent.fire({ identifier: local.identifier, source: gallery });
            });
        });
        test('Test ManageExtensionAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ghb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            assert.ok(!testObject.enabled);
        });
        test('Test ManageExtensionAction when extension is installed', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ghb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
                assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage', testObject.class);
                assert.strictEqual('Manage', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is uninstalled', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ghb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                testObject.extension = page.firstPage[0];
                assert.ok(!testObject.enabled);
                assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage hide', testObject.class);
                assert.strictEqual('Manage', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is installing', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ghb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                testObject.extension = page.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                assert.ok(!testObject.enabled);
                assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage hide', testObject.class);
                assert.strictEqual('Manage', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is queried from gallery and installed', async () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ghb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            const promise = event_1.Event.toPromise(testObject.onDidChange);
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', gallery, gallery) }]);
            await promise;
            assert.ok(testObject.enabled);
            assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage', testObject.class);
            assert.strictEqual('Manage', testObject.tooltip);
        });
        test('Test ManageExtensionAction when extension is system extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ghb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
                assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage', testObject.class);
                assert.strictEqual('Manage', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is uninstalling', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ghb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                uninstallEvent.fire({ identifier: local.identifier });
                assert.ok(!testObject.enabled);
                assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage', testObject.class);
                assert.strictEqual('Manage', testObject.tooltip);
            });
        });
        test('Test EnableForWorkspaceAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Mhb));
            assert.ok(!testObject.enabled);
        });
        test('Test EnableForWorkspaceAction when there extension is not disabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Mhb));
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableForWorkspaceAction when the extension is disabled globally', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Mhb));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableForWorkspaceAction when extension is disabled for workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Mhb));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableForWorkspaceAction when the extension is disabled globally and workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */))
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Mhb));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableGloballyAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Nhb));
            assert.ok(!testObject.enabled);
        });
        test('Test EnableGloballyAction when the extension is not disabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Nhb));
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableGloballyAction when the extension is disabled for workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Nhb));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test EnableGloballyAction when the extension is disabled globally', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Nhb));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableGloballyAction when the extension is disabled in both', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */))
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Nhb));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Qhb));
            assert.ok(!testObject.enabled);
        });
        test('Test EnableDropDownAction when extension is installed and enabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Qhb));
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableDropDownAction when extension is installed and disabled globally', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Qhb));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableDropDownAction when extension is installed and disabled for workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Qhb));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableDropDownAction when extension is uninstalled', () => {
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Qhb));
                testObject.extension = page.firstPage[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableDropDownAction when extension is installing', () => {
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Qhb));
                testObject.extension = page.firstPage[0];
                disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableDropDownAction when extension is uninstalling', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Qhb));
                testObject.extension = extensions[0];
                uninstallEvent.fire({ identifier: local.identifier });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test DisableForWorkspaceAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ohb));
            assert.ok(!testObject.enabled);
        });
        test('Test DisableForWorkspaceAction when the extension is disabled globally', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ohb));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableForWorkspaceAction when the extension is disabled workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ohb));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableForWorkspaceAction when extension is enabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(local)],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Ohb));
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Phb));
            assert.ok(!testObject.enabled);
        });
        test('Test DisableGloballyAction when the extension is disabled globally', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Phb));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableGloballyAction when the extension is disabled for workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Phb));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableGloballyAction when the extension is enabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(local)],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Phb));
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when extension is installed and enabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(local)],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Phb));
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when extension is installed and disabled globally', () => {
            const local = aLocalExtension('a');
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(local)],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.$Pfb).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Phb));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableGloballyAction when extension is uninstalled', () => {
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('a'))],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Phb));
                testObject.extension = page.firstPage[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when extension is installing', () => {
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('a'))],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Phb));
                testObject.extension = page.firstPage[0];
                disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when extension is uninstalling', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(local)],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensions_1.$Pfb).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Phb));
                testObject.extension = extensions[0];
                disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
                uninstallEvent.fire({ identifier: local.identifier });
                assert.ok(!testObject.enabled);
            });
        });
    });
    suite('ReloadAction', () => {
        const disposables = (0, utils_1.$bT)();
        setup(() => setupTest(disposables));
        test('Test ReloadAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension state is installing', async () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const paged = await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension state is uninstalling', async () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await instantiationService.get(extensions_1.$Pfb).queryLocal();
            testObject.extension = extensions[0];
            uninstallEvent.fire({ identifier: local.identifier });
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is newly installed', async () => {
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('b'))],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            assert.ok(!testObject.enabled);
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            const promise = event_1.Event.toPromise(testObject.onDidChange);
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', gallery, gallery) }]);
            await promise;
            assert.ok(testObject.enabled);
            assert.strictEqual(testObject.tooltip, 'Please reload Visual Studio Code to enable this extension.');
        });
        test('Test ReloadAction when extension is newly installed and reload is not required', async () => {
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('b'))],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => true,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            assert.ok(!testObject.enabled);
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', gallery, gallery) }]);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is installed and uninstalled', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('b'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            const identifier = gallery.identifier;
            installEvent.fire({ identifier, source: gallery });
            didInstallEvent.fire([{ identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', gallery, { identifier }) }]);
            uninstallEvent.fire({ identifier });
            didUninstallEvent.fire({ identifier });
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is uninstalled', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('a', { version: '1.0.0' }))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            instantiationService.set(extensions_1.$Pfb, disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub)));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await instantiationService.get(extensions_1.$Pfb).queryLocal();
            testObject.extension = extensions[0];
            uninstallEvent.fire({ identifier: local.identifier });
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(testObject.enabled);
            assert.strictEqual(testObject.tooltip, 'Please reload Visual Studio Code to complete the uninstallation of this extension.');
        });
        test('Test ReloadAction when extension is uninstalled and can be removed', async () => {
            const local = aLocalExtension('a');
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(local)],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => true,
                canAddExtension: (extension) => true,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await instantiationService.get(extensions_1.$Pfb).queryLocal();
            testObject.extension = extensions[0];
            uninstallEvent.fire({ identifier: local.identifier });
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is uninstalled and installed', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('a', { version: '1.0.0' }))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await instantiationService.get(extensions_1.$Pfb).queryLocal();
            testObject.extension = extensions[0];
            uninstallEvent.fire({ identifier: local.identifier });
            didUninstallEvent.fire({ identifier: local.identifier });
            const gallery = aGalleryExtension('a');
            const identifier = gallery.identifier;
            installEvent.fire({ identifier, source: gallery });
            didInstallEvent.fire([{ identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local }]);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is updated while running', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('a', { version: '1.0.1' }))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => true,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            instantiationService.set(extensions_1.$Pfb, disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub)));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.1' });
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            return new Promise(c => {
                disposables.add(testObject.onDidChange(() => {
                    if (testObject.enabled && testObject.tooltip === 'Please reload Visual Studio Code to enable the updated extension.') {
                        c();
                    }
                }));
                const gallery = aGalleryExtension('a', { uuid: local.identifier.id, version: '1.0.2' });
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', gallery, gallery) }]);
            });
        });
        test('Test ReloadAction when extension is updated when not running', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('b'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const local = aLocalExtension('a', { version: '1.0.1' });
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            const gallery = aGalleryExtension('a', { identifier: local.identifier, version: '1.0.2' });
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 3 /* InstallOperation.Update */, local: aLocalExtension('a', gallery, gallery) }]);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is disabled when running', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('a'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            instantiationService.set(extensions_1.$Pfb, disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub)));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            await workbenchService.setEnablement(extensions[0], 6 /* EnablementState.DisabledGlobally */);
            await testObject.update();
            assert.ok(testObject.enabled);
            assert.strictEqual('Please reload Visual Studio Code to disable this extension.', testObject.tooltip);
        });
        test('Test ReloadAction when extension enablement is toggled when running', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('a', { version: '1.0.0' }))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            instantiationService.set(extensions_1.$Pfb, disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub)));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a');
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            await workbenchService.setEnablement(extensions[0], 6 /* EnablementState.DisabledGlobally */);
            await workbenchService.setEnablement(extensions[0], 8 /* EnablementState.EnabledGlobally */);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is enabled when not running', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('b'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const local = aLocalExtension('a');
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            await workbenchService.setEnablement(extensions[0], 8 /* EnablementState.EnabledGlobally */);
            await testObject.update();
            assert.ok(testObject.enabled);
            assert.strictEqual('Please reload Visual Studio Code to enable this extension.', testObject.tooltip);
        });
        test('Test ReloadAction when extension enablement is toggled when not running', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('b'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const local = aLocalExtension('a');
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            await workbenchService.setEnablement(extensions[0], 8 /* EnablementState.EnabledGlobally */);
            await workbenchService.setEnablement(extensions[0], 6 /* EnablementState.DisabledGlobally */);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is updated when not running and enabled', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('a'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const local = aLocalExtension('a', { version: '1.0.1' });
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            const gallery = aGalleryExtension('a', { identifier: local.identifier, version: '1.0.2' });
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', gallery, gallery) }]);
            await workbenchService.setEnablement(extensions[0], 8 /* EnablementState.EnabledGlobally */);
            await testObject.update();
            assert.ok(testObject.enabled);
            assert.strictEqual('Please reload Visual Studio Code to enable this extension.', testObject.tooltip);
        });
        test('Test ReloadAction when a localization extension is newly installed', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('b'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            assert.ok(!testObject.enabled);
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', { ...gallery, ...{ contributes: { localizations: [{ languageId: 'de', translations: [] }] } } }, gallery) }]);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when a localization extension is updated while running', async () => {
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(aLocalExtension('a', { version: '1.0.1' }))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.1', contributes: { localizations: [{ languageId: 'de', translations: [] }] } });
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            const gallery = aGalleryExtension('a', { uuid: local.identifier.id, version: '1.0.2' });
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', { ...gallery, ...{ contributes: { localizations: [{ languageId: 'de', translations: [] }] } } }, gallery) }]);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is not installed but extension from different server is installed and running', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const localExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file('pub.a') });
            const remoteExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(remoteExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is uninstalled but extension from different server is installed and running', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const localExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file('pub.a') });
            const remoteExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const localExtensionManagementService = createExtensionManagementService([localExtension]);
            const uninstallEvent = new event_1.$fd();
            const onDidUninstallEvent = new event_1.$fd();
            localExtensionManagementService.onUninstallExtension = uninstallEvent.event;
            localExtensionManagementService.onDidUninstallExtension = onDidUninstallEvent.event;
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(remoteExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
            uninstallEvent.fire({ identifier: localExtension.identifier });
            didUninstallEvent.fire({ identifier: localExtension.identifier });
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when workspace extension is disabled on local server and installed in remote server', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const remoteExtensionManagementService = createExtensionManagementService([]);
            const onDidInstallEvent = new event_1.$fd();
            remoteExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const localExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file('pub.a') });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), remoteExtensionManagementService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
            const remoteExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const promise = event_1.Event.toPromise(testObject.onDidChange);
            onDidInstallEvent.fire([{ identifier: remoteExtension.identifier, local: remoteExtension, operation: 2 /* InstallOperation.Install */ }]);
            await promise;
            assert.ok(testObject.enabled);
            assert.strictEqual(testObject.tooltip, 'Please reload Visual Studio Code to enable this extension.');
        });
        test('Test ReloadAction when ui extension is disabled on remote server and installed in local server', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const localExtensionManagementService = createExtensionManagementService([]);
            const onDidInstallEvent = new event_1.$fd();
            localExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const remoteExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
            const localExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file('pub.a') });
            const promise = event_1.Event.toPromise(event_1.Event.filter(testObject.onDidChange, () => testObject.enabled));
            onDidInstallEvent.fire([{ identifier: localExtension.identifier, local: localExtension, operation: 2 /* InstallOperation.Install */ }]);
            await promise;
            assert.ok(testObject.enabled);
            assert.strictEqual(testObject.tooltip, 'Please reload Visual Studio Code to enable this extension.');
        });
        test('Test ReloadAction for remote ui extension is disabled when it is installed and enabled in local server', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const localExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file('pub.a') });
            const localExtensionManagementService = createExtensionManagementService([localExtension]);
            const onDidInstallEvent = new event_1.$fd();
            localExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const remoteExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(localExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction for remote workspace+ui extension is enabled when it is installed and enabled in local server', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const localExtension = aLocalExtension('a', { extensionKind: ['workspace', 'ui'] }, { location: uri_1.URI.file('pub.a') });
            const localExtensionManagementService = createExtensionManagementService([localExtension]);
            const onDidInstallEvent = new event_1.$fd();
            localExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const remoteExtension = aLocalExtension('a', { extensionKind: ['workspace', 'ui'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(localExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(testObject.enabled);
        });
        test('Test ReloadAction for local ui+workspace extension is enabled when it is installed and enabled in remote server', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const localExtension = aLocalExtension('a', { extensionKind: ['ui', 'workspace'] }, { location: uri_1.URI.file('pub.a') });
            const remoteExtension = aLocalExtension('a', { extensionKind: ['ui', 'workspace'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const remoteExtensionManagementService = createExtensionManagementService([remoteExtension]);
            const onDidInstallEvent = new event_1.$fd();
            remoteExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), remoteExtensionManagementService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(remoteExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(testObject.enabled);
        });
        test('Test ReloadAction for local workspace+ui extension is enabled when it is installed in both servers but running in local server', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const localExtension = aLocalExtension('a', { extensionKind: ['workspace', 'ui'] }, { location: uri_1.URI.file('pub.a') });
            const localExtensionManagementService = createExtensionManagementService([localExtension]);
            const onDidInstallEvent = new event_1.$fd();
            localExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const remoteExtension = aLocalExtension('a', { extensionKind: ['workspace', 'ui'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(localExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(testObject.enabled);
        });
        test('Test ReloadAction for remote ui+workspace extension is enabled when it is installed on both servers but running in remote server', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const localExtension = aLocalExtension('a', { extensionKind: ['ui', 'workspace'] }, { location: uri_1.URI.file('pub.a') });
            const remoteExtension = aLocalExtension('a', { extensionKind: ['ui', 'workspace'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const remoteExtensionManagementService = createExtensionManagementService([remoteExtension]);
            const onDidInstallEvent = new event_1.$fd();
            remoteExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), remoteExtensionManagementService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.$fd();
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(remoteExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(testObject.enabled);
        });
        test('Test ReloadAction when ui+workspace+web extension is installed in web and remote and running in remote', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const webExtension = aLocalExtension('a', { extensionKind: ['ui', 'workspace'], 'browser': 'browser.js' }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeUserData }) });
            const remoteExtension = aLocalExtension('a', { extensionKind: ['ui', 'workspace'], 'browser': 'browser.js' }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, null, createExtensionManagementService([remoteExtension]), createExtensionManagementService([webExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(remoteExtension)],
                onDidChangeExtensions: event_1.Event.None,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when workspace+ui+web extension is installed in web and local and running in local', async () => {
            // multi server setup
            const gallery = aGalleryExtension('a');
            const webExtension = aLocalExtension('a', { extensionKind: ['workspace', 'ui'], 'browser': 'browser.js' }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeUserData }) });
            const localExtension = aLocalExtension('a', { extensionKind: ['workspace', 'ui'], 'browser': 'browser.js' }, { location: uri_1.URI.file('pub.a') });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), null, createExtensionManagementService([webExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            instantiationService.stub(extensions_2.$MF, {
                extensions: [(0, extensions_2.$UF)(localExtension)],
                onDidChangeExtensions: event_1.Event.None,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$Shb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
    });
    suite('RemoteInstallAction', () => {
        const disposables = (0, utils_1.$bT)();
        setup(() => setupTest(disposables));
        test('Test remote install action is enabled for local workspace extension', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install in remote', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test remote install action when installing local workspace extension', async () => {
            // multi server setup
            const remoteExtensionManagementService = createExtensionManagementService();
            const onInstallExtension = new event_1.$fd();
            remoteExtensionManagementService.onInstallExtension = onInstallExtension.event;
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]), remoteExtensionManagementService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.stub(extensions_1.$Pfb, workbenchService, 'open', undefined);
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const gallery = aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier });
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install in remote', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
            onInstallExtension.fire({ identifier: localWorkspaceExtension.identifier, source: gallery });
            assert.ok(testObject.enabled);
            assert.strictEqual('Installing', testObject.label);
            assert.strictEqual('extension-action label install installing', testObject.class);
        });
        test('Test remote install action when installing local workspace extension is finished', async () => {
            // multi server setup
            const remoteExtensionManagementService = createExtensionManagementService();
            const onInstallExtension = new event_1.$fd();
            remoteExtensionManagementService.onInstallExtension = onInstallExtension.event;
            const onDidInstallEvent = new event_1.$fd();
            remoteExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]), remoteExtensionManagementService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.stub(extensions_1.$Pfb, workbenchService, 'open', undefined);
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const gallery = aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier });
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install in remote', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
            onInstallExtension.fire({ identifier: localWorkspaceExtension.identifier, source: gallery });
            assert.ok(testObject.enabled);
            assert.strictEqual('Installing', testObject.label);
            assert.strictEqual('extension-action label install installing', testObject.class);
            const installedExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const promise = event_1.Event.toPromise(testObject.onDidChange);
            onDidInstallEvent.fire([{ identifier: installedExtension.identifier, local: installedExtension, operation: 2 /* InstallOperation.Install */ }]);
            await promise;
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is enabled for disabled local workspace extension', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const remoteWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([remoteWorkspaceExtension], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install in remote', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test remote install action is enabled local workspace+ui extension', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace', 'ui'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([localWorkspaceExtension], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install in remote', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test remote install action is enabled for local ui+workapace extension if can install is true', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['ui', 'workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([localWorkspaceExtension], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, true));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install in remote', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test remote install action is disabled for local ui+workapace extension if can install is false', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['ui', 'workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([localWorkspaceExtension], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled when extension is not set', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled for extension which is not installed', async () => {
            // multi server setup
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a')));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const pager = await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = pager.firstPage[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled for local workspace extension which is disabled in env', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]));
            const environmentService = { disableExtensions: true };
            instantiationService.stub(environment_1.$Ih, environmentService);
            instantiationService.stub(environment_1.$Jh, environmentService);
            instantiationService.stub(environmentService_2.$hJ, environmentService);
            instantiationService.stub(environmentService_1.$1$b, environmentService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled when remote server is not available', async () => {
            // single server setup
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            const extensionManagementServerService = instantiationService.get(extensionManagement_2.$fcb);
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [localWorkspaceExtension]);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled for local workspace extension if it is uninstalled locally', async () => {
            // multi server setup
            const extensionManagementService = instantiationService.get(extensionManagement_1.$2n);
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, extensionManagementService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [localWorkspaceExtension]);
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install in remote', testObject.label);
            uninstallEvent.fire({ identifier: localWorkspaceExtension.identifier });
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled for local workspace extension if it is installed in remote', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const remoteWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]), createExtensionManagementService([remoteWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is enabled for local workspace extension if it has not gallery', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(testObject.enabled);
        });
        test('Test remote install action is disabled for local workspace system extension', async () => {
            // multi server setup
            const localWorkspaceSystemExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`), type: 0 /* ExtensionType.System */ });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceSystemExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceSystemExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled for local ui extension if it is not installed in remote', async () => {
            // multi server setup
            const localUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled for local ui extension if it is also installed in remote', async () => {
            // multi server setup
            const localUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`) });
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localUIExtension]), createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is enabled for locally installed language pack extension', async () => {
            // multi server setup
            const languagePackExtension = aLocalExtension('a', { contributes: { localizations: [{ languageId: 'de', translations: [] }] } }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([languagePackExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: languagePackExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install in remote', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test remote install action is disabled if local language pack extension is uninstalled', async () => {
            // multi server setup
            const extensionManagementService = instantiationService.get(extensionManagement_1.$2n);
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, extensionManagementService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const languagePackExtension = aLocalExtension('a', { contributes: { localizations: [{ languageId: 'de', translations: [] }] } }, { location: uri_1.URI.file(`pub.a`) });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [languagePackExtension]);
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: languagePackExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$vhb, false));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install in remote', testObject.label);
            uninstallEvent.fire({ identifier: languagePackExtension.identifier });
            assert.ok(!testObject.enabled);
        });
    });
    suite('LocalInstallAction', () => {
        const disposables = (0, utils_1.$bT)();
        setup(() => setupTest(disposables));
        test('Test local install action is enabled for remote ui extension', async () => {
            // multi server setup
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install Locally', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test local install action is enabled for remote ui+workspace extension', async () => {
            // multi server setup
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui', 'workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install Locally', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test local install action when installing remote ui extension', async () => {
            // multi server setup
            const localExtensionManagementService = createExtensionManagementService();
            const onInstallExtension = new event_1.$fd();
            localExtensionManagementService.onInstallExtension = onInstallExtension.event;
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.stub(extensions_1.$Pfb, workbenchService, 'open', undefined);
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const gallery = aGalleryExtension('a', { identifier: remoteUIExtension.identifier });
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install Locally', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
            onInstallExtension.fire({ identifier: remoteUIExtension.identifier, source: gallery });
            assert.ok(testObject.enabled);
            assert.strictEqual('Installing', testObject.label);
            assert.strictEqual('extension-action label install installing', testObject.class);
        });
        test('Test local install action when installing remote ui extension is finished', async () => {
            // multi server setup
            const localExtensionManagementService = createExtensionManagementService();
            const onInstallExtension = new event_1.$fd();
            localExtensionManagementService.onInstallExtension = onInstallExtension.event;
            const onDidInstallEvent = new event_1.$fd();
            localExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.stub(extensions_1.$Pfb, workbenchService, 'open', undefined);
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const gallery = aGalleryExtension('a', { identifier: remoteUIExtension.identifier });
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install Locally', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
            onInstallExtension.fire({ identifier: remoteUIExtension.identifier, source: gallery });
            assert.ok(testObject.enabled);
            assert.strictEqual('Installing', testObject.label);
            assert.strictEqual('extension-action label install installing', testObject.class);
            const installedExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`) });
            const promise = event_1.Event.toPromise(testObject.onDidChange);
            onDidInstallEvent.fire([{ identifier: installedExtension.identifier, local: installedExtension, operation: 2 /* InstallOperation.Install */ }]);
            await promise;
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is enabled for disabled remote ui extension', async () => {
            // multi server setup
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            const localUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`) });
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([localUIExtension], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install Locally', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test local install action is disabled when extension is not set', async () => {
            // multi server setup
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled for extension which is not installed', async () => {
            // multi server setup
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a')));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const pager = await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = pager.firstPage[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled for remote ui extension which is disabled in env', async () => {
            // multi server setup
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const environmentService = { disableExtensions: true };
            instantiationService.stub(environment_1.$Ih, environmentService);
            instantiationService.stub(environment_1.$Jh, environmentService);
            instantiationService.stub(environmentService_2.$hJ, environmentService);
            instantiationService.stub(environmentService_1.$1$b, environmentService);
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled when local server is not available', async () => {
            // single server setup
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aSingleRemoteExtensionManagementServerService(instantiationService, createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled for remote ui extension if it is installed in local', async () => {
            // multi server setup
            const localUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`) });
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localUIExtension]), createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled for remoteUI extension if it is uninstalled locally', async () => {
            // multi server setup
            const extensionManagementService = instantiationService.get(extensionManagement_1.$2n);
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), extensionManagementService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [remoteUIExtension]);
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install Locally', testObject.label);
            uninstallEvent.fire({ identifier: remoteUIExtension.identifier });
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is enabled for remote UI extension if it has gallery', async () => {
            // multi server setup
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(testObject.enabled);
        });
        test('Test local install action is disabled for remote UI system extension', async () => {
            // multi server setup
            const remoteUISystemExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }), type: 0 /* ExtensionType.System */ });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteUISystemExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: remoteUISystemExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled for remote workspace extension if it is not installed in local', async () => {
            // multi server setup
            const remoteWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: remoteWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled for remote workspace extension if it is also installed in local', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspae'] }, { location: uri_1.URI.file(`pub.a`) });
            const remoteWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]), createExtensionManagementService([remoteWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is enabled for remotely installed language pack extension', async () => {
            // multi server setup
            const languagePackExtension = aLocalExtension('a', { contributes: { localizations: [{ languageId: 'de', translations: [] }] } }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([languagePackExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: languagePackExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install Locally', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test local install action is disabled if remote language pack extension is uninstalled', async () => {
            // multi server setup
            const extensionManagementService = instantiationService.get(extensionManagement_1.$2n);
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), extensionManagementService);
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposables.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const languagePackExtension = aLocalExtension('a', { contributes: { localizations: [{ languageId: 'de', translations: [] }] } }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [languagePackExtension]);
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            instantiationService.set(extensions_1.$Pfb, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a', { identifier: languagePackExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.$whb));
            disposables.add(instantiationService.createInstance(extensions_1.$Ufb, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install Locally', testObject.label);
            uninstallEvent.fire({ identifier: languagePackExtension.identifier });
            assert.ok(!testObject.enabled);
        });
    });
    function aLocalExtension(name = 'someext', manifest = {}, properties = {}) {
        manifest = { name, publisher: 'pub', version: '1.0.0', ...manifest };
        properties = {
            type: 1 /* ExtensionType.User */,
            location: uri_1.URI.file(`pub.${name}`),
            identifier: { id: (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name) },
            ...properties
        };
        properties.isBuiltin = properties.type === 0 /* ExtensionType.System */;
        return Object.create({ manifest, ...properties });
    }
    function aGalleryExtension(name, properties = {}, galleryExtensionProperties = {}, assets = {}) {
        const targetPlatform = (0, extensionManagement_1.$Un)(platform_1.$t, process_1.$4d);
        const galleryExtension = Object.create({ name, publisher: 'pub', version: '1.0.0', allTargetPlatforms: [targetPlatform], properties: {}, assets: {}, ...properties });
        galleryExtension.properties = { ...galleryExtension.properties, dependencies: [], targetPlatform, ...galleryExtensionProperties };
        galleryExtension.assets = { ...galleryExtension.assets, ...assets };
        galleryExtension.identifier = { id: (0, extensionManagementUtil_1.$uo)(galleryExtension.publisher, galleryExtension.name), uuid: (0, uuid_1.$4f)() };
        galleryExtension.hasReleaseVersion = true;
        return galleryExtension;
    }
    function aPage(...objects) {
        return { firstPage: objects, total: objects.length, pageSize: objects.length, getPage: () => null };
    }
    function aSingleRemoteExtensionManagementServerService(instantiationService, remoteExtensionManagementService) {
        const remoteExtensionManagementServer = {
            id: 'vscode-remote',
            label: 'remote',
            extensionManagementService: remoteExtensionManagementService || createExtensionManagementService(),
        };
        return {
            _serviceBrand: undefined,
            localExtensionManagementServer: null,
            remoteExtensionManagementServer,
            webExtensionManagementServer: null,
            getExtensionManagementServer: (extension) => {
                if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                    return remoteExtensionManagementServer;
                }
                return null;
            },
            getExtensionInstallLocation(extension) {
                const server = this.getExtensionManagementServer(extension);
                return server === remoteExtensionManagementServer ? 2 /* ExtensionInstallLocation.Remote */ : 1 /* ExtensionInstallLocation.Local */;
            }
        };
    }
    function aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, remoteExtensionManagementService, webExtensionManagementService) {
        const localExtensionManagementServer = localExtensionManagementService === null ? null : {
            id: 'vscode-local',
            label: 'local',
            extensionManagementService: localExtensionManagementService || createExtensionManagementService(),
        };
        const remoteExtensionManagementServer = remoteExtensionManagementService === null ? null : {
            id: 'vscode-remote',
            label: 'remote',
            extensionManagementService: remoteExtensionManagementService || createExtensionManagementService(),
        };
        const webExtensionManagementServer = webExtensionManagementService ? {
            id: 'vscode-web',
            label: 'web',
            extensionManagementService: webExtensionManagementService,
        } : null;
        return {
            _serviceBrand: undefined,
            localExtensionManagementServer,
            remoteExtensionManagementServer,
            webExtensionManagementServer,
            getExtensionManagementServer: (extension) => {
                if (extension.location.scheme === network_1.Schemas.file) {
                    return localExtensionManagementServer;
                }
                if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                    return remoteExtensionManagementServer;
                }
                if (extension.location.scheme === network_1.Schemas.vscodeUserData) {
                    return webExtensionManagementServer;
                }
                throw new Error('');
            },
            getExtensionInstallLocation(extension) {
                const server = this.getExtensionManagementServer(extension);
                if (server === null) {
                    return null;
                }
                if (server === remoteExtensionManagementServer) {
                    return 2 /* ExtensionInstallLocation.Remote */;
                }
                if (server === webExtensionManagementServer) {
                    return 3 /* ExtensionInstallLocation.Web */;
                }
                return 1 /* ExtensionInstallLocation.Local */;
            }
        };
    }
    function createExtensionManagementService(installed = []) {
        return {
            onInstallExtension: event_1.Event.None,
            onDidInstallExtensions: event_1.Event.None,
            onUninstallExtension: event_1.Event.None,
            onDidUninstallExtension: event_1.Event.None,
            onDidChangeProfile: event_1.Event.None,
            onDidUpdateExtensionMetadata: event_1.Event.None,
            getInstalled: () => Promise.resolve(installed),
            canInstall: async (extension) => { return true; },
            installFromGallery: (extension) => Promise.reject(new Error('not supported')),
            updateMetadata: async (local, metadata) => {
                local.identifier.uuid = metadata.id;
                local.publisherDisplayName = metadata.publisherDisplayName;
                local.publisherId = metadata.publisherId;
                return local;
            },
            async getTargetPlatform() { return (0, extensionManagement_1.$Un)(platform_1.$t, process_1.$4d); },
            async getExtensionsControlManifest() { return { malicious: [], deprecated: {}, search: [] }; },
        };
    }
});
//# sourceMappingURL=extensionsActions.test.js.map