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
        installEvent = disposables.add(new event_1.Emitter());
        didInstallEvent = disposables.add(new event_1.Emitter());
        uninstallEvent = disposables.add(new event_1.Emitter());
        didUninstallEvent = disposables.add(new event_1.Emitter());
        instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService());
        instantiationService.stub(environment_1.IEnvironmentService, workbenchTestServices_3.TestEnvironmentService);
        instantiationService.stub(environmentService_2.IWorkbenchEnvironmentService, workbenchTestServices_3.TestEnvironmentService);
        instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
        instantiationService.stub(log_1.ILogService, log_1.NullLogService);
        instantiationService.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
        instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
        instantiationService.stub(progress_1.IProgressService, progressService_1.ProgressService);
        instantiationService.stub(productService_1.IProductService, {});
        instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
        instantiationService.stub(extensionManagement_1.IExtensionGalleryService, extensionGalleryService_1.ExtensionGalleryService);
        instantiationService.stub(services_1.ISharedProcessService, workbenchTestServices_2.TestSharedProcessService);
        instantiationService.stub(extensionManagement_1.IExtensionManagementService, {
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
            async getTargetPlatform() { return (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch); },
        });
        instantiationService.stub(remoteAgentService_1.IRemoteAgentService, remoteAgentService_2.RemoteAgentService);
        const localExtensionManagementServer = { extensionManagementService: instantiationService.get(extensionManagement_1.IExtensionManagementService), label: 'local', id: 'vscode-local' };
        instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, {
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
        instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
        instantiationService.stub(label_1.ILabelService, { onDidChangeFormatters: disposables.add(new event_1.Emitter()).event });
        instantiationService.stub(lifecycle_1.ILifecycleService, disposables.add(new workbenchTestServices_3.TestLifecycleService()));
        instantiationService.stub(extensionManagement_1.IExtensionTipsService, disposables.add(instantiationService.createInstance(workbenchTestServices_2.TestExtensionTipsService)));
        instantiationService.stub(extensionRecommendations_1.IExtensionRecommendationsService, {});
        instantiationService.stub(url_1.IURLService, urlService_1.NativeURLService);
        instantiationService.stub(extensionManagement_1.IExtensionGalleryService, 'isEnabled', true);
        instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage());
        instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getExtensions', []);
        instantiationService.stub(extensions_2.IExtensionService, { extensions: [], onDidChangeExtensions: event_1.Event.None, canAddExtension: (extension) => false, canRemoveExtension: (extension) => false, whenInstalledExtensionsRegistered: () => Promise.resolve(true) });
        instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).reset();
        instantiationService.stub(userDataSync_1.IUserDataSyncEnablementService, disposables.add(instantiationService.createInstance(userDataSyncEnablementService_1.UserDataSyncEnablementService)));
        instantiationService.set(extensions_1.IExtensionsWorkbenchService, disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService)));
        instantiationService.stub(workspaceTrust_1.IWorkspaceTrustManagementService, disposables.add(new workbenchTestServices_1.TestWorkspaceTrustManagementService()));
    }
    suite('ExtensionsActions', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => setupTest(disposables));
        test('Install action is disabled when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.InstallAction, { installPreReleaseVersion: false }));
            assert.ok(!testObject.enabled);
        });
        test('Test Install action when state is installed', () => {
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.InstallAction, { installPreReleaseVersion: false }));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return workbenchService.queryLocal()
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: local.identifier })));
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
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.InstallingLabelAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.InstallAction, { installPreReleaseVersion: false }));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const paged = await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const promise = event_1.Event.toPromise(testObject.onDidChange);
            testObject.extension = paged.firstPage[0];
            await promise;
            assert.ok(testObject.enabled);
            assert.strictEqual('Install', testObject.label);
        });
        test('Test Install action when extension is system action', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.InstallAction, { installPreReleaseVersion: false }));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                uninstallEvent.fire({ identifier: local.identifier });
                didUninstallEvent.fire({ identifier: local.identifier });
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test Install action when extension doesnot has gallery', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.InstallAction, { installPreReleaseVersion: false }));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                uninstallEvent.fire({ identifier: local.identifier });
                didUninstallEvent.fire({ identifier: local.identifier });
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Uninstall action is disabled when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UninstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            assert.ok(!testObject.enabled);
        });
        test('Test Uninstall action when state is uninstalling', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UninstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                uninstallEvent.fire({ identifier: local.identifier });
                assert.ok(!testObject.enabled);
                assert.strictEqual('Uninstalling', testObject.label);
                assert.strictEqual('extension-action label uninstall uninstalling', testObject.class);
            });
        });
        test('Test Uninstall action when state is installed and is user extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UninstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
                assert.strictEqual('Uninstall', testObject.label);
                assert.strictEqual('extension-action label uninstall', testObject.class);
            });
        });
        test('Test Uninstall action when state is installed and is system extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UninstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
                assert.strictEqual('Uninstall', testObject.label);
                assert.strictEqual('extension-action label uninstall', testObject.class);
            });
        });
        test('Test Uninstall action when state is installing and is user extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UninstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
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
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UninstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None);
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
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UpdateAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            assert.ok(!testObject.enabled);
        });
        test('Test UpdateAction when extension is uninstalled', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UpdateAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None)
                .then((paged) => {
                testObject.extension = paged.firstPage[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test UpdateAction when extension is installed and not outdated', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UpdateAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: local.identifier, version: local.manifest.version })));
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None)
                    .then(extensions => assert.ok(!testObject.enabled));
            });
        });
        test('Test UpdateAction when extension is installed outdated and system extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UpdateAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.0' }, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: local.identifier, version: '1.0.1' })));
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None)
                    .then(extensions => assert.ok(!testObject.enabled));
            });
        });
        test('Test UpdateAction when extension is installed outdated and user extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UpdateAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            return workbenchService.queryLocal()
                .then(async (extensions) => {
                testObject.extension = extensions[0];
                const gallery = aGalleryExtension('a', { identifier: local.identifier, version: '1.0.1' });
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getCompatibleExtension', gallery);
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getExtensions', [gallery]);
                assert.ok(!testObject.enabled);
                return new Promise(c => {
                    disposables.add(testObject.onDidChange(() => {
                        if (testObject.enabled) {
                            c();
                        }
                    }));
                    instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None);
                });
            });
        });
        test('Test UpdateAction when extension is installing and outdated and user extension', async () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.UpdateAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const extensions = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal();
            testObject.extension = extensions[0];
            const gallery = aGalleryExtension('a', { identifier: local.identifier, version: '1.0.1' });
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getCompatibleExtension', gallery);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getExtensions', [gallery]);
            await new Promise(c => {
                disposables.add(testObject.onDidChange(() => {
                    if (testObject.enabled) {
                        c();
                    }
                }));
                instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None);
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
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ManageExtensionAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            assert.ok(!testObject.enabled);
        });
        test('Test ManageExtensionAction when extension is installed', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ManageExtensionAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
                assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage', testObject.class);
                assert.strictEqual('Manage', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is uninstalled', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ManageExtensionAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                testObject.extension = page.firstPage[0];
                assert.ok(!testObject.enabled);
                assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage hide', testObject.class);
                assert.strictEqual('Manage', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is installing', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ManageExtensionAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                testObject.extension = page.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                assert.ok(!testObject.enabled);
                assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage hide', testObject.class);
                assert.strictEqual('Manage', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is queried from gallery and installed', async () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ManageExtensionAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None);
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
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ManageExtensionAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
                assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage', testObject.class);
                assert.strictEqual('Manage', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is uninstalling', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ManageExtensionAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                testObject.extension = extensions[0];
                uninstallEvent.fire({ identifier: local.identifier });
                assert.ok(!testObject.enabled);
                assert.strictEqual('extension-action icon manage codicon codicon-extensions-manage', testObject.class);
                assert.strictEqual('Manage', testObject.tooltip);
            });
        });
        test('Test EnableForWorkspaceAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableForWorkspaceAction));
            assert.ok(!testObject.enabled);
        });
        test('Test EnableForWorkspaceAction when there extension is not disabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableForWorkspaceAction));
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableForWorkspaceAction when the extension is disabled globally', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableForWorkspaceAction));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableForWorkspaceAction when extension is disabled for workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableForWorkspaceAction));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableForWorkspaceAction when the extension is disabled globally and workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */))
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableForWorkspaceAction));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableGloballyAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableGloballyAction));
            assert.ok(!testObject.enabled);
        });
        test('Test EnableGloballyAction when the extension is not disabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableGloballyAction));
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableGloballyAction when the extension is disabled for workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableGloballyAction));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test EnableGloballyAction when the extension is disabled globally', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableGloballyAction));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableGloballyAction when the extension is disabled in both', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */))
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableGloballyAction));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableDropDownAction));
            assert.ok(!testObject.enabled);
        });
        test('Test EnableDropDownAction when extension is installed and enabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableDropDownAction));
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableDropDownAction when extension is installed and disabled globally', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableDropDownAction));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableDropDownAction when extension is installed and disabled for workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableDropDownAction));
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableDropDownAction when extension is uninstalled', () => {
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableDropDownAction));
                testObject.extension = page.firstPage[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableDropDownAction when extension is installing', () => {
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableDropDownAction));
                testObject.extension = page.firstPage[0];
                disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableDropDownAction when extension is uninstalling', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.EnableDropDownAction));
                testObject.extension = extensions[0];
                uninstallEvent.fire({ identifier: local.identifier });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test DisableForWorkspaceAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableForWorkspaceAction));
            assert.ok(!testObject.enabled);
        });
        test('Test DisableForWorkspaceAction when the extension is disabled globally', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableForWorkspaceAction));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableForWorkspaceAction when the extension is disabled workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableForWorkspaceAction));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableForWorkspaceAction when extension is enabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(local)],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableForWorkspaceAction));
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableGloballyAction));
            assert.ok(!testObject.enabled);
        });
        test('Test DisableGloballyAction when the extension is disabled globally', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableGloballyAction));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableGloballyAction when the extension is disabled for workspace', () => {
            const local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableGloballyAction));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableGloballyAction when the extension is enabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(local)],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableGloballyAction));
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when extension is installed and enabled', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(local)],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableGloballyAction));
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when extension is installed and disabled globally', () => {
            const local = aLocalExtension('a');
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(local)],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(extensions => {
                    const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableGloballyAction));
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableGloballyAction when extension is uninstalled', () => {
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('a'))],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableGloballyAction));
                testObject.extension = page.firstPage[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when extension is installing', () => {
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('a'))],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None)
                .then(page => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableGloballyAction));
                testObject.extension = page.firstPage[0];
                disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when extension is uninstalling', () => {
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(local)],
                onDidChangeExtensions: event_1.Event.None,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(extensions => {
                const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.DisableGloballyAction));
                testObject.extension = extensions[0];
                disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
                uninstallEvent.fire({ identifier: local.identifier });
                assert.ok(!testObject.enabled);
            });
        });
    });
    suite('ReloadAction', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => setupTest(disposables));
        test('Test ReloadAction when there is no extension', () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension state is installing', async () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const paged = await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension state is uninstalling', async () => {
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const extensions = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal();
            testObject.extension = extensions[0];
            uninstallEvent.fire({ identifier: local.identifier });
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is newly installed', async () => {
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('b'))],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None);
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
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('b'))],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => true,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            assert.ok(!testObject.enabled);
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', gallery, gallery) }]);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is installed and uninstalled', async () => {
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('b'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            const identifier = gallery.identifier;
            installEvent.fire({ identifier, source: gallery });
            didInstallEvent.fire([{ identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', gallery, { identifier }) }]);
            uninstallEvent.fire({ identifier });
            didUninstallEvent.fire({ identifier });
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is uninstalled', async () => {
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('a', { version: '1.0.0' }))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService)));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const extensions = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal();
            testObject.extension = extensions[0];
            uninstallEvent.fire({ identifier: local.identifier });
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(testObject.enabled);
            assert.strictEqual(testObject.tooltip, 'Please reload Visual Studio Code to complete the uninstallation of this extension.');
        });
        test('Test ReloadAction when extension is uninstalled and can be removed', async () => {
            const local = aLocalExtension('a');
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(local)],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => true,
                canAddExtension: (extension) => true,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const extensions = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal();
            testObject.extension = extensions[0];
            uninstallEvent.fire({ identifier: local.identifier });
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is uninstalled and installed', async () => {
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('a', { version: '1.0.0' }))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const extensions = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal();
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
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('a', { version: '1.0.1' }))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => true,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService)));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.1' });
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
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
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('b'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const local = aLocalExtension('a', { version: '1.0.1' });
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            const gallery = aGalleryExtension('a', { identifier: local.identifier, version: '1.0.2' });
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 3 /* InstallOperation.Update */, local: aLocalExtension('a', gallery, gallery) }]);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is disabled when running', async () => {
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('a'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService)));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            await workbenchService.setEnablement(extensions[0], 6 /* EnablementState.DisabledGlobally */);
            await testObject.update();
            assert.ok(testObject.enabled);
            assert.strictEqual('Please reload Visual Studio Code to disable this extension.', testObject.tooltip);
        });
        test('Test ReloadAction when extension enablement is toggled when running', async () => {
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('a', { version: '1.0.0' }))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService)));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a');
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            await workbenchService.setEnablement(extensions[0], 6 /* EnablementState.DisabledGlobally */);
            await workbenchService.setEnablement(extensions[0], 8 /* EnablementState.EnabledGlobally */);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is enabled when not running', async () => {
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('b'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const local = aLocalExtension('a');
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            await workbenchService.setEnablement(extensions[0], 8 /* EnablementState.EnabledGlobally */);
            await testObject.update();
            assert.ok(testObject.enabled);
            assert.strictEqual('Please reload Visual Studio Code to enable this extension.', testObject.tooltip);
        });
        test('Test ReloadAction when extension enablement is toggled when not running', async () => {
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('b'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const local = aLocalExtension('a');
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const extensions = await workbenchService.queryLocal();
            testObject.extension = extensions[0];
            await workbenchService.setEnablement(extensions[0], 8 /* EnablementState.EnabledGlobally */);
            await workbenchService.setEnablement(extensions[0], 6 /* EnablementState.DisabledGlobally */);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension is updated when not running and enabled', async () => {
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('a'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const local = aLocalExtension('a', { version: '1.0.1' });
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
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
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('b'))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const paged = await instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = paged.firstPage[0];
            assert.ok(!testObject.enabled);
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension('a', { ...gallery, ...{ contributes: { localizations: [{ languageId: 'de', translations: [] }] } } }, gallery) }]);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when a localization extension is updated while running', async () => {
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(aLocalExtension('a', { version: '1.0.1' }))],
                onDidChangeExtensions: event_1.Event.None,
                canRemoveExtension: (extension) => false,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const local = aLocalExtension('a', { version: '1.0.1', contributes: { localizations: [{ languageId: 'de', translations: [] }] } });
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(remoteExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            const uninstallEvent = new event_1.Emitter();
            const onDidUninstallEvent = new event_1.Emitter();
            localExtensionManagementService.onUninstallExtension = uninstallEvent.event;
            localExtensionManagementService.onDidUninstallExtension = onDidUninstallEvent.event;
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(remoteExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            const onDidInstallEvent = new event_1.Emitter();
            remoteExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const localExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file('pub.a') });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), remoteExtensionManagementService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            const onDidInstallEvent = new event_1.Emitter();
            localExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const remoteExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            const onDidInstallEvent = new event_1.Emitter();
            localExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const remoteExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(localExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            const onDidInstallEvent = new event_1.Emitter();
            localExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const remoteExtension = aLocalExtension('a', { extensionKind: ['workspace', 'ui'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(localExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            const onDidInstallEvent = new event_1.Emitter();
            remoteExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), remoteExtensionManagementService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(remoteExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            const onDidInstallEvent = new event_1.Emitter();
            localExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const remoteExtension = aLocalExtension('a', { extensionKind: ['workspace', 'ui'] }, { location: uri_1.URI.file('pub.a').with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(localExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            const onDidInstallEvent = new event_1.Emitter();
            remoteExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), remoteExtensionManagementService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const onDidChangeExtensionsEmitter = new event_1.Emitter();
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(remoteExtension)],
                onDidChangeExtensions: onDidChangeExtensionsEmitter.event,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(remoteExtension)],
                onDidChangeExtensions: event_1.Event.None,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            instantiationService.stub(extensions_2.IExtensionService, {
                extensions: [(0, extensions_2.toExtensionDescription)(localExtension)],
                onDidChangeExtensions: event_1.Event.None,
                canAddExtension: (extension) => false,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.ReloadAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
    });
    suite('RemoteInstallAction', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => setupTest(disposables));
        test('Test remote install action is enabled for local workspace extension', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            const onInstallExtension = new event_1.Emitter();
            remoteExtensionManagementService.onInstallExtension = onInstallExtension.event;
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]), remoteExtensionManagementService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.stub(extensions_1.IExtensionsWorkbenchService, workbenchService, 'open', undefined);
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const gallery = aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier });
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            const onInstallExtension = new event_1.Emitter();
            remoteExtensionManagementService.onInstallExtension = onInstallExtension.event;
            const onDidInstallEvent = new event_1.Emitter();
            remoteExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]), remoteExtensionManagementService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.stub(extensions_1.IExtensionsWorkbenchService, workbenchService, 'open', undefined);
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const gallery = aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier });
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const remoteWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([remoteWorkspaceExtension], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localWorkspaceExtension], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localWorkspaceExtension], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, true));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localWorkspaceExtension], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled when extension is not set', async () => {
            // multi server setup
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled for extension which is not installed', async () => {
            // multi server setup
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a')));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(environment_1.IEnvironmentService, environmentService);
            instantiationService.stub(environment_1.INativeEnvironmentService, environmentService);
            instantiationService.stub(environmentService_2.IWorkbenchEnvironmentService, environmentService);
            instantiationService.stub(environmentService_1.INativeWorkbenchEnvironmentService, environmentService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled when remote server is not available', async () => {
            // single server setup
            const workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            const extensionManagementServerService = instantiationService.get(extensionManagement_2.IExtensionManagementServerService);
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localWorkspaceExtension]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled for local workspace extension if it is uninstalled locally', async () => {
            // multi server setup
            const extensionManagementService = instantiationService.get(extensionManagement_1.IExtensionManagementService);
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, extensionManagementService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const localWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localWorkspaceExtension]);
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(testObject.enabled);
        });
        test('Test remote install action is disabled for local workspace system extension', async () => {
            // multi server setup
            const localWorkspaceSystemExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`), type: 0 /* ExtensionType.System */ });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localWorkspaceSystemExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceSystemExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is disabled for local ui extension if it is not installed in remote', async () => {
            // multi server setup
            const localUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localUIExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test remote install action is enabled for locally installed language pack extension', async () => {
            // multi server setup
            const languagePackExtension = aLocalExtension('a', { contributes: { localizations: [{ languageId: 'de', translations: [] }] } }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([languagePackExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: languagePackExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.localExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install in remote', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test remote install action is disabled if local language pack extension is uninstalled', async () => {
            // multi server setup
            const extensionManagementService = instantiationService.get(extensionManagement_1.IExtensionManagementService);
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, extensionManagementService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const languagePackExtension = aLocalExtension('a', { contributes: { localizations: [{ languageId: 'de', translations: [] }] } }, { location: uri_1.URI.file(`pub.a`) });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [languagePackExtension]);
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: languagePackExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.RemoteInstallAction, false));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => setupTest(disposables));
        test('Test local install action is enabled for remote ui extension', async () => {
            // multi server setup
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            const onInstallExtension = new event_1.Emitter();
            localExtensionManagementService.onInstallExtension = onInstallExtension.event;
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.stub(extensions_1.IExtensionsWorkbenchService, workbenchService, 'open', undefined);
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const gallery = aGalleryExtension('a', { identifier: remoteUIExtension.identifier });
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            const onInstallExtension = new event_1.Emitter();
            localExtensionManagementService.onInstallExtension = onInstallExtension.event;
            const onDidInstallEvent = new event_1.Emitter();
            localExtensionManagementService.onDidInstallExtensions = onDidInstallEvent.event;
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.stub(extensions_1.IExtensionsWorkbenchService, workbenchService, 'open', undefined);
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const gallery = aGalleryExtension('a', { identifier: remoteUIExtension.identifier });
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            const localUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`) });
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localUIExtension], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled for extension which is not installed', async () => {
            // multi server setup
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a')));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const pager = await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = pager.firstPage[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled for remote ui extension which is disabled in env', async () => {
            // multi server setup
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const environmentService = { disableExtensions: true };
            instantiationService.stub(environment_1.IEnvironmentService, environmentService);
            instantiationService.stub(environment_1.INativeEnvironmentService, environmentService);
            instantiationService.stub(environmentService_2.IWorkbenchEnvironmentService, environmentService);
            instantiationService.stub(environmentService_1.INativeWorkbenchEnvironmentService, environmentService);
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteUIExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled for remoteUI extension if it is uninstalled locally', async () => {
            // multi server setup
            const extensionManagementService = instantiationService.get(extensionManagement_1.IExtensionManagementService);
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), extensionManagementService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const remoteUIExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [remoteUIExtension]);
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: remoteUIExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(testObject.enabled);
        });
        test('Test local install action is disabled for remote UI system extension', async () => {
            // multi server setup
            const remoteUISystemExtension = aLocalExtension('a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }), type: 0 /* ExtensionType.System */ });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteUISystemExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: remoteUISystemExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is disabled for remote workspace extension if it is not installed in local', async () => {
            // multi server setup
            const remoteWorkspaceExtension = aLocalExtension('a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteWorkspaceExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: remoteWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: localWorkspaceExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            testObject.extension = extensions[0];
            assert.ok(testObject.extension);
            assert.ok(!testObject.enabled);
        });
        test('Test local install action is enabled for remotely installed language pack extension', async () => {
            // multi server setup
            const languagePackExtension = aLocalExtension('a', { contributes: { localizations: [{ languageId: 'de', translations: [] }] } }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([languagePackExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: languagePackExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
            const extensions = await workbenchService.queryLocal(extensionManagementServerService.remoteExtensionManagementServer);
            await workbenchService.queryGallery(cancellation_1.CancellationToken.None);
            testObject.extension = extensions[0];
            assert.ok(testObject.enabled);
            assert.strictEqual('Install Locally', testObject.label);
            assert.strictEqual('extension-action label prominent install', testObject.class);
        });
        test('Test local install action is disabled if remote language pack extension is uninstalled', async () => {
            // multi server setup
            const extensionManagementService = instantiationService.get(extensionManagement_1.IExtensionManagementService);
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), extensionManagementService);
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposables.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            const languagePackExtension = aLocalExtension('a', { contributes: { localizations: [{ languageId: 'de', translations: [] }] } }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [languagePackExtension]);
            const workbenchService = disposables.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, workbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: languagePackExtension.identifier })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsActions.LocalInstallAction));
            disposables.add(instantiationService.createInstance(extensions_1.ExtensionContainers, [testObject]));
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
            identifier: { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) },
            ...properties
        };
        properties.isBuiltin = properties.type === 0 /* ExtensionType.System */;
        return Object.create({ manifest, ...properties });
    }
    function aGalleryExtension(name, properties = {}, galleryExtensionProperties = {}, assets = {}) {
        const targetPlatform = (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch);
        const galleryExtension = Object.create({ name, publisher: 'pub', version: '1.0.0', allTargetPlatforms: [targetPlatform], properties: {}, assets: {}, ...properties });
        galleryExtension.properties = { ...galleryExtension.properties, dependencies: [], targetPlatform, ...galleryExtensionProperties };
        galleryExtension.assets = { ...galleryExtension.assets, ...assets };
        galleryExtension.identifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(galleryExtension.publisher, galleryExtension.name), uuid: (0, uuid_1.generateUuid)() };
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
            async getTargetPlatform() { return (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch); },
            async getExtensionsControlManifest() { return { malicious: [], deprecated: {}, search: [] }; },
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0FjdGlvbnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvdGVzdC9lbGVjdHJvbi1zYW5kYm94L2V4dGVuc2lvbnNBY3Rpb25zLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUF3RGhHLElBQUksb0JBQThDLENBQUM7SUFDbkQsSUFBSSxZQUE0QyxFQUMvQyxlQUEyRCxFQUMzRCxjQUFnRCxFQUNoRCxpQkFBc0QsQ0FBQztJQUV4RCxTQUFTLFNBQVMsQ0FBQyxXQUF5QztRQUMzRCxZQUFZLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQU8sRUFBeUIsQ0FBQyxDQUFDO1FBQ3JFLGVBQWUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksZUFBTyxFQUFxQyxDQUFDLENBQUM7UUFDcEYsY0FBYyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFPLEVBQTJCLENBQUMsQ0FBQztRQUN6RSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksZUFBTyxFQUE4QixDQUFDLENBQUM7UUFFL0Usb0JBQW9CLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLG1EQUF3QixFQUFFLENBQUMsQ0FBQztRQUV2RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaUNBQW1CLEVBQUUsOENBQXNCLENBQUMsQ0FBQztRQUN2RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaURBQTRCLEVBQUUsOENBQXNCLENBQUMsQ0FBQztRQUVoRixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsNkJBQWlCLEVBQUUscUNBQW9CLENBQUMsQ0FBQztRQUNuRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaUJBQVcsRUFBRSxvQkFBYyxDQUFDLENBQUM7UUFFdkQsb0JBQW9CLENBQUMsSUFB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