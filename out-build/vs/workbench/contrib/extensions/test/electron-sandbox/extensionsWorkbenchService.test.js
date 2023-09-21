/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "sinon", "assert", "vs/base/common/uuid", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/services/extensionManagement/test/browser/extensionEnablementService.test", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/url/common/url", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/test/electron-sandbox/workbenchTestServices", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/workbench/services/progress/browser/progressService", "vs/platform/notification/common/notification", "vs/platform/url/common/urlService", "vs/base/common/uri", "vs/base/common/cancellation", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/remote/electron-sandbox/remoteAgentService", "vs/platform/ipc/electron-sandbox/services", "vs/workbench/test/common/workbenchTestServices", "vs/platform/product/common/productService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/network", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/base/common/platform", "vs/base/common/process", "vs/workbench/services/extensions/common/extensions", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, sinon, assert, uuid_1, extensions_1, extensionsWorkbenchService_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, extensionManagementUtil_1, extensionEnablementService_test_1, extensionGalleryService_1, url_1, instantiationServiceMock_1, event_1, telemetry_1, telemetryUtils_1, workspace_1, workbenchTestServices_1, configuration_1, log_1, progress_1, progressService_1, notification_1, urlService_1, uri_1, cancellation_1, remoteAgentService_1, remoteAgentService_2, services_1, workbenchTestServices_2, productService_1, lifecycle_1, workbenchTestServices_3, network_1, contextkey_1, mockKeybindingService_1, platform_1, process_1, extensions_2, lifecycle_2, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionsWorkbenchServiceTest', () => {
        let instantiationService;
        let testObject;
        const disposableStore = (0, utils_1.$bT)();
        let installEvent, didInstallEvent, uninstallEvent, didUninstallEvent;
        setup(async () => {
            disposableStore.add((0, lifecycle_2.$ic)(() => sinon.restore()));
            installEvent = disposableStore.add(new event_1.$fd());
            didInstallEvent = disposableStore.add(new event_1.$fd());
            uninstallEvent = disposableStore.add(new event_1.$fd());
            didUninstallEvent = disposableStore.add(new event_1.$fd());
            instantiationService = disposableStore.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            instantiationService.stub(log_1.$5i, log_1.$fj);
            instantiationService.stub(progress_1.$2u, progressService_1.$uyb);
            instantiationService.stub(productService_1.$kj, {});
            instantiationService.stub(extensionManagement_1.$Zn, extensionGalleryService_1.$5o);
            instantiationService.stub(url_1.$IT, urlService_1.$KT);
            instantiationService.stub(services_1.$A7b, workbenchTestServices_1.$wfc);
            instantiationService.stub(contextkey_1.$3i, new mockKeybindingService_1.$S0b());
            instantiationService.stub(workspace_1.$Kh, new workbenchTestServices_2.$6dc());
            instantiationService.stub(configuration_1.$8h, {
                onDidChangeConfiguration: () => { return undefined; },
                getValue: (key) => {
                    return (key === extensions_1.$Sfb || key === extensions_1.$Rfb) ? true : undefined;
                }
            });
            instantiationService.stub(remoteAgentService_1.$jm, remoteAgentService_2.$8$b);
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
                getTargetPlatform: async () => (0, extensionManagement_1.$Un)(platform_1.$t, process_1.$4d)
            });
            instantiationService.stub(extensionManagement_2.$fcb, (0, extensionEnablementService_test_1.$Efc)({
                id: 'local',
                label: 'local',
                extensionManagementService: instantiationService.get(extensionManagement_1.$2n),
            }, null, null));
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            instantiationService.stub(lifecycle_1.$7y, disposableStore.add(new workbenchTestServices_3.$Kec()));
            instantiationService.stub(extensionManagement_1.$6n, disposableStore.add(instantiationService.createInstance(workbenchTestServices_1.$yfc)));
            instantiationService.stub(extensionRecommendations_1.$9fb, {});
            instantiationService.stub(notification_1.$Yu, { prompt: () => null });
            instantiationService.stub(extensions_2.$MF, {
                onDidChangeExtensions: event_1.Event.None,
                extensions: [],
                async whenInstalledExtensionsRegistered() { return true; }
            });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', []);
            instantiationService.stub(extensionManagement_1.$Zn, 'isEnabled', true);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage());
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', []);
            instantiationService.stubPromise(notification_1.$Yu, 'prompt', 0);
            instantiationService.get(extensionManagement_2.$icb).reset();
        });
        test('test gallery extension', async () => {
            const expected = aGalleryExtension('expectedName', {
                displayName: 'expectedDisplayName',
                version: '1.5.0',
                publisherId: 'expectedPublisherId',
                publisher: 'expectedPublisher',
                publisherDisplayName: 'expectedPublisherDisplayName',
                description: 'expectedDescription',
                installCount: 1000,
                rating: 4,
                ratingCount: 100
            }, {
                dependencies: ['pub.1', 'pub.2'],
            }, {
                manifest: { uri: 'uri:manifest', fallbackUri: 'fallback:manifest' },
                readme: { uri: 'uri:readme', fallbackUri: 'fallback:readme' },
                changelog: { uri: 'uri:changelog', fallbackUri: 'fallback:changlog' },
                download: { uri: 'uri:download', fallbackUri: 'fallback:download' },
                icon: { uri: 'uri:icon', fallbackUri: 'fallback:icon' },
                license: { uri: 'uri:license', fallbackUri: 'fallback:license' },
                repository: { uri: 'uri:repository', fallbackUri: 'fallback:repository' },
                signature: { uri: 'uri:signature', fallbackUri: 'fallback:signature' },
                coreTranslations: []
            });
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(expected));
            return testObject.queryGallery(cancellation_1.CancellationToken.None).then(pagedResponse => {
                assert.strictEqual(1, pagedResponse.firstPage.length);
                const actual = pagedResponse.firstPage[0];
                assert.strictEqual(1 /* ExtensionType.User */, actual.type);
                assert.strictEqual('expectedName', actual.name);
                assert.strictEqual('expectedDisplayName', actual.displayName);
                assert.strictEqual('expectedpublisher.expectedname', actual.identifier.id);
                assert.strictEqual('expectedPublisher', actual.publisher);
                assert.strictEqual('expectedPublisherDisplayName', actual.publisherDisplayName);
                assert.strictEqual('1.5.0', actual.version);
                assert.strictEqual('1.5.0', actual.latestVersion);
                assert.strictEqual('expectedDescription', actual.description);
                assert.strictEqual('uri:icon', actual.iconUrl);
                assert.strictEqual('fallback:icon', actual.iconUrlFallback);
                assert.strictEqual('uri:license', actual.licenseUrl);
                assert.strictEqual(3 /* ExtensionState.Uninstalled */, actual.state);
                assert.strictEqual(1000, actual.installCount);
                assert.strictEqual(4, actual.rating);
                assert.strictEqual(100, actual.ratingCount);
                assert.strictEqual(false, actual.outdated);
                assert.deepStrictEqual(['pub.1', 'pub.2'], actual.dependencies);
            });
        });
        test('test for empty installed extensions', async () => {
            testObject = await aWorkbenchService();
            assert.deepStrictEqual([], testObject.local);
        });
        test('test for installed extensions', async () => {
            const expected1 = aLocalExtension('local1', {
                publisher: 'localPublisher1',
                version: '1.1.0',
                displayName: 'localDisplayName1',
                description: 'localDescription1',
                icon: 'localIcon1',
                extensionDependencies: ['pub.1', 'pub.2'],
            }, {
                type: 1 /* ExtensionType.User */,
                readmeUrl: 'localReadmeUrl1',
                changelogUrl: 'localChangelogUrl1',
                location: uri_1.URI.file('localPath1')
            });
            const expected2 = aLocalExtension('local2', {
                publisher: 'localPublisher2',
                version: '1.2.0',
                displayName: 'localDisplayName2',
                description: 'localDescription2',
            }, {
                type: 0 /* ExtensionType.System */,
                readmeUrl: 'localReadmeUrl2',
                changelogUrl: 'localChangelogUrl2',
            });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [expected1, expected2]);
            testObject = await aWorkbenchService();
            const actuals = testObject.local;
            assert.strictEqual(2, actuals.length);
            let actual = actuals[0];
            assert.strictEqual(1 /* ExtensionType.User */, actual.type);
            assert.strictEqual('local1', actual.name);
            assert.strictEqual('localDisplayName1', actual.displayName);
            assert.strictEqual('localpublisher1.local1', actual.identifier.id);
            assert.strictEqual('localPublisher1', actual.publisher);
            assert.strictEqual('1.1.0', actual.version);
            assert.strictEqual('1.1.0', actual.latestVersion);
            assert.strictEqual('localDescription1', actual.description);
            assert.ok(actual.iconUrl === 'file:///localPath1/localIcon1' || actual.iconUrl === 'vscode-file://vscode-app/localPath1/localIcon1');
            assert.ok(actual.iconUrlFallback === 'file:///localPath1/localIcon1' || actual.iconUrlFallback === 'vscode-file://vscode-app/localPath1/localIcon1');
            assert.strictEqual(undefined, actual.licenseUrl);
            assert.strictEqual(1 /* ExtensionState.Installed */, actual.state);
            assert.strictEqual(undefined, actual.installCount);
            assert.strictEqual(undefined, actual.rating);
            assert.strictEqual(undefined, actual.ratingCount);
            assert.strictEqual(false, actual.outdated);
            assert.deepStrictEqual(['pub.1', 'pub.2'], actual.dependencies);
            actual = actuals[1];
            assert.strictEqual(0 /* ExtensionType.System */, actual.type);
            assert.strictEqual('local2', actual.name);
            assert.strictEqual('localDisplayName2', actual.displayName);
            assert.strictEqual('localpublisher2.local2', actual.identifier.id);
            assert.strictEqual('localPublisher2', actual.publisher);
            assert.strictEqual('1.2.0', actual.version);
            assert.strictEqual('1.2.0', actual.latestVersion);
            assert.strictEqual('localDescription2', actual.description);
            assert.strictEqual(undefined, actual.licenseUrl);
            assert.strictEqual(1 /* ExtensionState.Installed */, actual.state);
            assert.strictEqual(undefined, actual.installCount);
            assert.strictEqual(undefined, actual.rating);
            assert.strictEqual(undefined, actual.ratingCount);
            assert.strictEqual(false, actual.outdated);
            assert.deepStrictEqual([], actual.dependencies);
        });
        test('test installed extensions get syncs with gallery', async () => {
            const local1 = aLocalExtension('local1', {
                publisher: 'localPublisher1',
                version: '1.1.0',
                displayName: 'localDisplayName1',
                description: 'localDescription1',
                icon: 'localIcon1',
                extensionDependencies: ['pub.1', 'pub.2'],
            }, {
                type: 1 /* ExtensionType.User */,
                readmeUrl: 'localReadmeUrl1',
                changelogUrl: 'localChangelogUrl1',
                location: uri_1.URI.file('localPath1')
            });
            const local2 = aLocalExtension('local2', {
                publisher: 'localPublisher2',
                version: '1.2.0',
                displayName: 'localDisplayName2',
                description: 'localDescription2',
            }, {
                type: 0 /* ExtensionType.System */,
                readmeUrl: 'localReadmeUrl2',
                changelogUrl: 'localChangelogUrl2',
            });
            const gallery1 = aGalleryExtension(local1.manifest.name, {
                identifier: local1.identifier,
                displayName: 'expectedDisplayName',
                version: '1.5.0',
                publisherId: 'expectedPublisherId',
                publisher: local1.manifest.publisher,
                publisherDisplayName: 'expectedPublisherDisplayName',
                description: 'expectedDescription',
                installCount: 1000,
                rating: 4,
                ratingCount: 100
            }, {
                dependencies: ['pub.1'],
            }, {
                manifest: { uri: 'uri:manifest', fallbackUri: 'fallback:manifest' },
                readme: { uri: 'uri:readme', fallbackUri: 'fallback:readme' },
                changelog: { uri: 'uri:changelog', fallbackUri: 'fallback:changlog' },
                download: { uri: 'uri:download', fallbackUri: 'fallback:download' },
                icon: { uri: 'uri:icon', fallbackUri: 'fallback:icon' },
                license: { uri: 'uri:license', fallbackUri: 'fallback:license' },
                repository: { uri: 'uri:repository', fallbackUri: 'fallback:repository' },
                signature: { uri: 'uri:signature', fallbackUri: 'fallback:signature' },
                coreTranslations: []
            });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local1, local2]);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery1));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'getCompatibleExtension', gallery1);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', [gallery1]);
            testObject = await aWorkbenchService();
            await testObject.queryLocal();
            return event_1.Event.toPromise(testObject.onChange).then(() => {
                const actuals = testObject.local;
                assert.strictEqual(2, actuals.length);
                let actual = actuals[0];
                assert.strictEqual(1 /* ExtensionType.User */, actual.type);
                assert.strictEqual('local1', actual.name);
                assert.strictEqual('expectedDisplayName', actual.displayName);
                assert.strictEqual('localpublisher1.local1', actual.identifier.id);
                assert.strictEqual('localPublisher1', actual.publisher);
                assert.strictEqual('1.1.0', actual.version);
                assert.strictEqual('1.5.0', actual.latestVersion);
                assert.strictEqual('expectedDescription', actual.description);
                assert.strictEqual('uri:icon', actual.iconUrl);
                assert.strictEqual('fallback:icon', actual.iconUrlFallback);
                assert.strictEqual(1 /* ExtensionState.Installed */, actual.state);
                assert.strictEqual('uri:license', actual.licenseUrl);
                assert.strictEqual(1000, actual.installCount);
                assert.strictEqual(4, actual.rating);
                assert.strictEqual(100, actual.ratingCount);
                assert.strictEqual(true, actual.outdated);
                assert.deepStrictEqual(['pub.1'], actual.dependencies);
                actual = actuals[1];
                assert.strictEqual(0 /* ExtensionType.System */, actual.type);
                assert.strictEqual('local2', actual.name);
                assert.strictEqual('localDisplayName2', actual.displayName);
                assert.strictEqual('localpublisher2.local2', actual.identifier.id);
                assert.strictEqual('localPublisher2', actual.publisher);
                assert.strictEqual('1.2.0', actual.version);
                assert.strictEqual('1.2.0', actual.latestVersion);
                assert.strictEqual('localDescription2', actual.description);
                assert.strictEqual(undefined, actual.licenseUrl);
                assert.strictEqual(1 /* ExtensionState.Installed */, actual.state);
                assert.strictEqual(undefined, actual.installCount);
                assert.strictEqual(undefined, actual.rating);
                assert.strictEqual(undefined, actual.ratingCount);
                assert.strictEqual(false, actual.outdated);
                assert.deepStrictEqual([], actual.dependencies);
            });
        });
        test('test extension state computation', async () => {
            const gallery = aGalleryExtension('gallery1');
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            return testObject.queryGallery(cancellation_1.CancellationToken.None).then(page => {
                const extension = page.firstPage[0];
                assert.strictEqual(3 /* ExtensionState.Uninstalled */, extension.state);
                testObject.install(extension);
                const identifier = gallery.identifier;
                // Installing
                installEvent.fire({ identifier, source: gallery });
                const local = testObject.local;
                assert.strictEqual(1, local.length);
                const actual = local[0];
                assert.strictEqual(`${gallery.publisher}.${gallery.name}`, actual.identifier.id);
                assert.strictEqual(0 /* ExtensionState.Installing */, actual.state);
                // Installed
                didInstallEvent.fire([{ identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension(gallery.name, gallery, { identifier }) }]);
                assert.strictEqual(1 /* ExtensionState.Installed */, actual.state);
                assert.strictEqual(1, testObject.local.length);
                testObject.uninstall(actual);
                // Uninstalling
                uninstallEvent.fire({ identifier });
                assert.strictEqual(2 /* ExtensionState.Uninstalling */, actual.state);
                // Uninstalled
                didUninstallEvent.fire({ identifier });
                assert.strictEqual(3 /* ExtensionState.Uninstalled */, actual.state);
                assert.strictEqual(0, testObject.local.length);
            });
        });
        test('test extension doesnot show outdated for system extensions', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension(local.manifest.name, { identifier: local.identifier, version: '1.0.2' })));
            testObject = await aWorkbenchService();
            await testObject.queryLocal();
            assert.ok(!testObject.local[0].outdated);
        });
        test('test canInstall returns false for extensions with out gallery', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            testObject = await aWorkbenchService();
            const target = testObject.local[0];
            testObject.uninstall(target);
            uninstallEvent.fire({ identifier: local.identifier });
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(!(await testObject.canInstall(target)));
        });
        test('test canInstall returns false for a system extension', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension(local.manifest.name, { identifier: local.identifier })));
            testObject = await aWorkbenchService();
            const target = testObject.local[0];
            assert.ok(!(await testObject.canInstall(target)));
        });
        test('test canInstall returns true for extensions with gallery', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 1 /* ExtensionType.User */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const gallery = aGalleryExtension(local.manifest.name, { identifier: local.identifier });
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'getCompatibleExtension', gallery);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', [gallery]);
            testObject = await aWorkbenchService();
            const target = testObject.local[0];
            await event_1.Event.toPromise(event_1.Event.filter(testObject.onChange, e => !!e?.gallery));
            assert.ok(await testObject.canInstall(target));
        });
        test('test onchange event is triggered while installing', async () => {
            const gallery = aGalleryExtension('gallery1');
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const page = await testObject.queryGallery(cancellation_1.CancellationToken.None);
            const extension = page.firstPage[0];
            assert.strictEqual(3 /* ExtensionState.Uninstalled */, extension.state);
            testObject.install(extension);
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            const promise = event_1.Event.toPromise(testObject.onChange);
            // Installed
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension(gallery.name, gallery, gallery) }]);
            await promise;
        });
        test('test onchange event is triggered when installation is finished', async () => {
            const gallery = aGalleryExtension('gallery1');
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(gallery));
            const target = sinon.spy();
            return testObject.queryGallery(cancellation_1.CancellationToken.None).then(page => {
                const extension = page.firstPage[0];
                assert.strictEqual(3 /* ExtensionState.Uninstalled */, extension.state);
                testObject.install(extension);
                disposableStore.add(testObject.onChange(target));
                // Installing
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                assert.ok(target.calledOnce);
            });
        });
        test('test onchange event is triggered while uninstalling', async () => {
            const local = aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            testObject = await aWorkbenchService();
            const target = sinon.spy();
            testObject.uninstall(testObject.local[0]);
            disposableStore.add(testObject.onChange(target));
            uninstallEvent.fire({ identifier: local.identifier });
            assert.ok(target.calledOnce);
        });
        test('test onchange event is triggered when uninstalling is finished', async () => {
            const local = aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            testObject = await aWorkbenchService();
            const target = sinon.spy();
            testObject.uninstall(testObject.local[0]);
            uninstallEvent.fire({ identifier: local.identifier });
            disposableStore.add(testObject.onChange(target));
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(target.calledOnce);
        });
        test('test uninstalled extensions are always enabled', async () => {
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('b')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('c')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                testObject = await aWorkbenchService();
                instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(aGalleryExtension('a')));
                return testObject.queryGallery(cancellation_1.CancellationToken.None).then(pagedResponse => {
                    const actual = pagedResponse.firstPage[0];
                    assert.strictEqual(actual.enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test enablement state installed enabled extension', async () => {
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('b')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('c')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [aLocalExtension('a')]);
                testObject = await aWorkbenchService();
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 8 /* EnablementState.EnabledGlobally */);
            });
        });
        test('test workspace disabled extension', async () => {
            const extensionA = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('b')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('d')], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 7 /* EnablementState.DisabledWorkspace */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('e')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA]);
                testObject = await aWorkbenchService();
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 7 /* EnablementState.DisabledWorkspace */);
            });
        });
        test('test globally disabled extension', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([localExtension], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('d')], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('c')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 6 /* EnablementState.DisabledGlobally */);
            });
        });
        test('test enablement state is updated for user extensions', async () => {
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('c')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('b')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [aLocalExtension('a')]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 7 /* EnablementState.DisabledWorkspace */)
                    .then(() => {
                    const actual = testObject.local[0];
                    assert.strictEqual(actual.enablementState, 7 /* EnablementState.DisabledWorkspace */);
                });
            });
        });
        test('test enable extension globally when extension is disabled for workspace', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([localExtension], 7 /* EnablementState.DisabledWorkspace */)
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    const actual = testObject.local[0];
                    assert.strictEqual(actual.enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test disable extension globally', async () => {
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [aLocalExtension('a')]);
            testObject = await aWorkbenchService();
            return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 6 /* EnablementState.DisabledGlobally */);
            });
        });
        test('test system extensions can be disabled', async () => {
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ })]);
            testObject = await aWorkbenchService();
            return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 6 /* EnablementState.DisabledGlobally */);
            });
        });
        test('test enablement state is updated on change from outside', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('c')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('b')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                return instantiationService.get(extensionManagement_2.$icb).setEnablement([localExtension], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    const actual = testObject.local[0];
                    assert.strictEqual(actual.enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable extension with dependencies disable only itself', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test disable extension pack disables the pack', async () => {
            const extensionA = aLocalExtension('a', { extensionPack: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable extension pack disable all', async () => {
            const extensionA = aLocalExtension('a', { extensionPack: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable extension fails if extension is a dependent of other', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            instantiationService.stub(notification_1.$Yu, {
                prompt(severity, message, choices, options) {
                    options.onCancel();
                }
            });
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[1], 6 /* EnablementState.DisabledGlobally */).then(() => assert.fail('Should fail'), error => assert.ok(true));
            });
        });
        test('test disable extension disables all dependents when chosen to disable all', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            instantiationService.stub(notification_1.$Yu, {
                prompt(severity, message, choices, options) {
                    choices[0].run();
                }
            });
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                await testObject.setEnablement(testObject.local[1], 6 /* EnablementState.DisabledGlobally */);
                assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                assert.strictEqual(testObject.local[1].enablementState, 6 /* EnablementState.DisabledGlobally */);
            });
        });
        test('test disable extension when extension is part of a pack', async () => {
            const extensionA = aLocalExtension('a', { extensionPack: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[1], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable both dependency and dependent do not promot and do not fail', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement([testObject.local[1], testObject.local[0]], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test enable both dependency and dependent do not promot and do not fail', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement([testObject.local[1], testObject.local[0]], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 8 /* EnablementState.EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test disable extension does not fail if its dependency is a dependent of other but chosen to disable only itself', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable extension if its dependency is a dependent of other disabled extension', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable extension if its dependencys dependency is itself', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b', { extensionDependencies: ['pub.a'] });
            const extensionC = aLocalExtension('c');
            instantiationService.stub(notification_1.$Yu, {
                prompt(severity, message, choices, options) {
                    options.onCancel();
                }
            });
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => assert.fail('An extension with dependent should not be disabled'), () => null);
            });
        });
        test('test disable extension if its dependency is dependent and is disabled', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */));
            });
        });
        test('test disable extension with cyclic dependencies', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b', { extensionDependencies: ['pub.c'] });
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.a'] });
            instantiationService.stub(notification_1.$Yu, {
                prompt(severity, message, choices, options) {
                    options.onCancel();
                }
            });
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => assert.fail('An extension with dependent should not be disabled'), () => null);
            });
        });
        test('test enable extension with dependencies enable all', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 8 /* EnablementState.EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test enable extension with dependencies does not prompt if dependency is enabled already', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test enable extension with dependency does not prompt if both are enabled', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement([testObject.local[1], testObject.local[0]], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 8 /* EnablementState.EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test enable extension with cyclic dependencies', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b', { extensionDependencies: ['pub.c'] });
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.a'] });
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionA], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionB], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 8 /* EnablementState.EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 8 /* EnablementState.EnabledGlobally */);
                    assert.strictEqual(testObject.local[2].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test change event is fired when disablement flags are changed', async () => {
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('c')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('b')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [aLocalExtension('a')]);
                testObject = await aWorkbenchService();
                const target = sinon.spy();
                disposableStore.add(testObject.onChange(target));
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => assert.ok(target.calledOnce));
            });
        });
        test('test change event is fired when disablement flags are changed from outside', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('c')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.$icb).setEnablement([aLocalExtension('b')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                const target = sinon.spy();
                disposableStore.add(testObject.onChange(target));
                return instantiationService.get(extensionManagement_2.$icb).setEnablement([localExtension], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => assert.ok(target.calledOnce));
            });
        });
        test('test updating an extension does not re-eanbles it when disabled globally', async () => {
            testObject = await aWorkbenchService();
            const local = aLocalExtension('pub.a');
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 6 /* EnablementState.DisabledGlobally */);
            didInstallEvent.fire([{ local, identifier: local.identifier, operation: 3 /* InstallOperation.Update */ }]);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
        });
        test('test updating an extension does not re-eanbles it when workspace disabled', async () => {
            testObject = await aWorkbenchService();
            const local = aLocalExtension('pub.a');
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */);
            didInstallEvent.fire([{ local, identifier: local.identifier, operation: 3 /* InstallOperation.Update */ }]);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [local]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual[0].enablementState, 7 /* EnablementState.DisabledWorkspace */);
        });
        test('test user extension is preferred when the same extension exists as system and user extension', async () => {
            testObject = await aWorkbenchService();
            const userExtension = aLocalExtension('pub.a');
            const systemExtension = aLocalExtension('pub.a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [systemExtension, userExtension]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, userExtension);
        });
        test('test user extension is disabled when the same extension exists as system and user extension and system extension is disabled', async () => {
            testObject = await aWorkbenchService();
            const systemExtension = aLocalExtension('pub.a', {}, { type: 0 /* ExtensionType.System */ });
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([systemExtension], 6 /* EnablementState.DisabledGlobally */);
            const userExtension = aLocalExtension('pub.a');
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [systemExtension, userExtension]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, userExtension);
            assert.strictEqual(actual[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
        });
        test('Test local ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local web extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace,ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace', 'ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,workspace,web extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace', 'web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,web,workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui', 'web', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local web,ui,workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['web', 'ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local web,workspace,ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['web', 'workspace', 'ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace,web,ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace', 'web', 'ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace,ui,web extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace', 'ui', 'web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local UI extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,workspace extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test remote workspace extension is chosen if it exists in remote server', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
        });
        test('Test remote workspace extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
        });
        test('Test remote workspace extension is chosen if it exists in both servers and local is disabled', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([remoteExtension], 6 /* EnablementState.DisabledGlobally */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
            assert.strictEqual(actual[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
        });
        test('Test remote workspace extension is chosen if it exists in both servers and remote is disabled in workspace', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([remoteExtension], 7 /* EnablementState.DisabledWorkspace */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
            assert.strictEqual(actual[0].enablementState, 7 /* EnablementState.DisabledWorkspace */);
        });
        test('Test local ui, workspace extension is chosen if it exists in both servers and local is disabled', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([localExtension], 6 /* EnablementState.DisabledGlobally */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
            assert.strictEqual(actual[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
        });
        test('Test local ui, workspace extension is chosen if it exists in both servers and local is disabled in workspace', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([localExtension], 7 /* EnablementState.DisabledWorkspace */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
            assert.strictEqual(actual[0].enablementState, 7 /* EnablementState.DisabledWorkspace */);
        });
        test('Test local web extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test remote web extension is chosen if it exists only in remote', async () => {
            // multi server setup
            const extensionKind = ['web'];
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.$fcb, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
        });
        async function aWorkbenchService() {
            const workbenchService = disposableStore.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub));
            await workbenchService.queryLocal();
            return workbenchService;
        }
        function aLocalExtension(name = 'someext', manifest = {}, properties = {}) {
            manifest = { name, publisher: 'pub', version: '1.0.0', ...manifest };
            properties = {
                type: 1 /* ExtensionType.User */,
                location: uri_1.URI.file(`pub.${name}`),
                identifier: { id: (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name) },
                ...properties
            };
            return Object.create({ manifest, ...properties });
        }
        const noAssets = {
            changelog: null,
            download: null,
            icon: null,
            license: null,
            manifest: null,
            readme: null,
            repository: null,
            signature: null,
            coreTranslations: []
        };
        function aGalleryExtension(name, properties = {}, galleryExtensionProperties = {}, assets = noAssets) {
            const targetPlatform = (0, extensionManagement_1.$Un)(platform_1.$t, process_1.$4d);
            const galleryExtension = Object.create({ name, publisher: 'pub', version: '1.0.0', allTargetPlatforms: [targetPlatform], properties: {}, assets: {}, ...properties });
            galleryExtension.properties = { ...galleryExtension.properties, dependencies: [], targetPlatform, ...galleryExtensionProperties };
            galleryExtension.assets = { ...galleryExtension.assets, ...assets };
            galleryExtension.identifier = { id: (0, extensionManagementUtil_1.$uo)(galleryExtension.publisher, galleryExtension.name), uuid: (0, uuid_1.$4f)() };
            return galleryExtension;
        }
        function aPage(...objects) {
            return { firstPage: objects, total: objects.length, pageSize: objects.length, getPage: () => null };
        }
        function aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, remoteExtensionManagementService) {
            const localExtensionManagementServer = {
                id: 'vscode-local',
                label: 'local',
                extensionManagementService: localExtensionManagementService || createExtensionManagementService(),
            };
            const remoteExtensionManagementServer = {
                id: 'vscode-remote',
                label: 'remote',
                extensionManagementService: remoteExtensionManagementService || createExtensionManagementService(),
            };
            return (0, extensionEnablementService_test_1.$Efc)(localExtensionManagementServer, remoteExtensionManagementServer, null);
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
                installFromGallery: (extension) => Promise.reject(new Error('not supported')),
                updateMetadata: async (local, metadata) => {
                    local.identifier.uuid = metadata.id;
                    local.publisherDisplayName = metadata.publisherDisplayName;
                    local.publisherId = metadata.publisherId;
                    return local;
                },
                getTargetPlatform: async () => (0, extensionManagement_1.$Un)(platform_1.$t, process_1.$4d),
                async getExtensionsControlManifest() { return { malicious: [], deprecated: {}, search: [] }; },
            };
        }
    });
});
//# sourceMappingURL=extensionsWorkbenchService.test.js.map