/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uuid", "vs/workbench/contrib/extensions/browser/extensionsViews", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/services/extensionManagement/test/browser/extensionEnablementService.test", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/url/common/url", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/electron-sandbox/workbenchTestServices", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/url/common/urlService", "vs/base/common/uri", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/remote/electron-sandbox/remoteAgentService", "vs/platform/ipc/electron-sandbox/services", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/actions/common/actions", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/common/views", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/process", "vs/platform/product/common/productService", "vs/base/common/cancellation", "vs/base/test/common/utils"], function (require, exports, assert, uuid_1, extensionsViews_1, instantiationServiceMock_1, extensions_1, extensionsWorkbenchService_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, extensionManagementUtil_1, extensionEnablementService_test_1, extensionGalleryService_1, url_1, event_1, telemetry_1, telemetryUtils_1, extensions_2, workspace_1, workbenchTestServices_1, workbenchTestServices_2, configuration_1, log_1, urlService_1, uri_1, testConfigurationService_1, remoteAgentService_1, remoteAgentService_2, services_1, contextkey_1, mockKeybindingService_1, actions_1, workbenchTestServices_3, views_1, network_1, platform_1, process_1, productService_1, cancellation_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionsViews Tests', () => {
        const disposableStore = (0, utils_1.$bT)();
        let instantiationService;
        let testableView;
        let installEvent, didInstallEvent, uninstallEvent, didUninstallEvent;
        const localEnabledTheme = aLocalExtension('first-enabled-extension', { categories: ['Themes', 'random'] }, { installedTimestamp: 123456 });
        const localEnabledLanguage = aLocalExtension('second-enabled-extension', { categories: ['Programming languages'], version: '1.0.0' }, { installedTimestamp: Date.now(), updated: false });
        const localDisabledTheme = aLocalExtension('first-disabled-extension', { categories: ['themes'] }, { installedTimestamp: 234567 });
        const localDisabledLanguage = aLocalExtension('second-disabled-extension', { categories: ['programming languages'] }, { installedTimestamp: Date.now() - 50000, updated: true });
        const localRandom = aLocalExtension('random-enabled-extension', { categories: ['random'] }, { installedTimestamp: 345678 });
        const builtInTheme = aLocalExtension('my-theme', { contributes: { themes: ['my-theme'] } }, { type: 0 /* ExtensionType.System */, installedTimestamp: 222 });
        const builtInBasic = aLocalExtension('my-lang', { contributes: { grammars: [{ language: 'my-language' }] } }, { type: 0 /* ExtensionType.System */, installedTimestamp: 666666 });
        const galleryEnabledLanguage = aGalleryExtension(localEnabledLanguage.manifest.name, { ...localEnabledLanguage.manifest, version: '1.0.1', identifier: localDisabledLanguage.identifier });
        const workspaceRecommendationA = aGalleryExtension('workspace-recommendation-A');
        const workspaceRecommendationB = aGalleryExtension('workspace-recommendation-B');
        const configBasedRecommendationA = aGalleryExtension('configbased-recommendation-A');
        const configBasedRecommendationB = aGalleryExtension('configbased-recommendation-B');
        const fileBasedRecommendationA = aGalleryExtension('filebased-recommendation-A');
        const fileBasedRecommendationB = aGalleryExtension('filebased-recommendation-B');
        const otherRecommendationA = aGalleryExtension('other-recommendation-A');
        setup(async () => {
            installEvent = disposableStore.add(new event_1.$fd());
            didInstallEvent = disposableStore.add(new event_1.$fd());
            uninstallEvent = disposableStore.add(new event_1.$fd());
            didUninstallEvent = disposableStore.add(new event_1.$fd());
            instantiationService = disposableStore.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            instantiationService.stub(log_1.$5i, log_1.$fj);
            instantiationService.stub(productService_1.$kj, {});
            instantiationService.stub(workspace_1.$Kh, new workbenchTestServices_3.$6dc());
            instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b());
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
                async canInstall() { return true; },
                async getExtensionsControlManifest() { return { malicious: [], deprecated: {}, search: [] }; },
                async getTargetPlatform() { return (0, extensionManagement_1.$Un)(platform_1.$t, process_1.$4d); },
                async updateMetadata(local) { return local; }
            });
            instantiationService.stub(remoteAgentService_1.$jm, remoteAgentService_2.$8$b);
            instantiationService.stub(contextkey_1.$3i, new mockKeybindingService_1.$S0b());
            instantiationService.stub(actions_1.$Su, new workbenchTestServices_1.$tec());
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
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            const reasons = {};
            reasons[workspaceRecommendationA.identifier.id] = { reasonId: 0 /* ExtensionRecommendationReason.Workspace */ };
            reasons[workspaceRecommendationB.identifier.id] = { reasonId: 0 /* ExtensionRecommendationReason.Workspace */ };
            reasons[fileBasedRecommendationA.identifier.id] = { reasonId: 1 /* ExtensionRecommendationReason.File */ };
            reasons[fileBasedRecommendationB.identifier.id] = { reasonId: 1 /* ExtensionRecommendationReason.File */ };
            reasons[otherRecommendationA.identifier.id] = { reasonId: 2 /* ExtensionRecommendationReason.Executable */ };
            reasons[configBasedRecommendationA.identifier.id] = { reasonId: 3 /* ExtensionRecommendationReason.WorkspaceConfig */ };
            instantiationService.stub(extensionRecommendations_1.$9fb, {
                getWorkspaceRecommendations() {
                    return Promise.resolve([
                        workspaceRecommendationA.identifier.id,
                        workspaceRecommendationB.identifier.id
                    ]);
                },
                getConfigBasedRecommendations() {
                    return Promise.resolve({
                        important: [configBasedRecommendationA.identifier.id],
                        others: [configBasedRecommendationB.identifier.id],
                    });
                },
                getImportantRecommendations() {
                    return Promise.resolve([]);
                },
                getFileBasedRecommendations() {
                    return [
                        fileBasedRecommendationA.identifier.id,
                        fileBasedRecommendationB.identifier.id
                    ];
                },
                getOtherRecommendations() {
                    return Promise.resolve([
                        configBasedRecommendationB.identifier.id,
                        otherRecommendationA.identifier.id
                    ]);
                },
                getAllRecommendationsWithReason() {
                    return reasons;
                }
            });
            instantiationService.stub(url_1.$IT, urlService_1.$KT);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', [localEnabledTheme, localEnabledLanguage, localRandom, localDisabledTheme, localDisabledLanguage, builtInTheme, builtInBasic]);
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getExtensgetExtensionsControlManifestionsReport', {});
            instantiationService.stub(extensionManagement_1.$Zn, 'isEnabled', true);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(galleryEnabledLanguage));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'getCompatibleExtension', galleryEnabledLanguage);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', [galleryEnabledLanguage]);
            instantiationService.stub(views_1.$_E, {
                getViewLocationById() {
                    return 0 /* ViewContainerLocation.Sidebar */;
                },
                onDidChangeLocation: event_1.Event.None
            });
            instantiationService.stub(extensions_2.$MF, {
                onDidChangeExtensions: event_1.Event.None,
                extensions: [
                    (0, extensions_2.$UF)(localEnabledTheme),
                    (0, extensions_2.$UF)(localEnabledLanguage),
                    (0, extensions_2.$UF)(localRandom),
                    (0, extensions_2.$UF)(builtInTheme),
                    (0, extensions_2.$UF)(builtInBasic)
                ],
                canAddExtension: (extension) => true,
                whenInstalledExtensionsRegistered: () => Promise.resolve(true)
            });
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([localDisabledTheme], 6 /* EnablementState.DisabledGlobally */);
            await instantiationService.get(extensionManagement_2.$icb).setEnablement([localDisabledLanguage], 6 /* EnablementState.DisabledGlobally */);
            instantiationService.set(extensions_1.$Pfb, disposableStore.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub)));
            testableView = disposableStore.add(instantiationService.createInstance(extensionsViews_1.$_Tb, {}, { id: '', title: '' }));
        });
        test('Test query types', () => {
            assert.strictEqual(extensionsViews_1.$_Tb.isBuiltInExtensionsQuery('@builtin'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@installed'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@enabled'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@disabled'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@outdated'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@updates'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@sort:name'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@sort:updateDate'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@installed searchText'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@enabled searchText'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@disabled searchText'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@outdated searchText'), true);
            assert.strictEqual(extensionsViews_1.$_Tb.isLocalExtensionsQuery('@updates searchText'), true);
        });
        test('Test empty query equates to sort by install count', () => {
            const target = instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage());
            return testableView.show('').then(() => {
                assert.ok(target.calledOnce);
                const options = target.args[0][0];
                assert.strictEqual(options.sortBy, 4 /* SortBy.InstallCount */);
            });
        });
        test('Test non empty query without sort doesnt use sortBy', () => {
            const target = instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage());
            return testableView.show('some extension').then(() => {
                assert.ok(target.calledOnce);
                const options = target.args[0][0];
                assert.strictEqual(options.sortBy, undefined);
            });
        });
        test('Test query with sort uses sortBy', () => {
            const target = instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage());
            return testableView.show('some extension @sort:rating').then(() => {
                assert.ok(target.calledOnce);
                const options = target.args[0][0];
                assert.strictEqual(options.sortBy, 12 /* SortBy.WeightedRating */);
            });
        });
        test('Test default view actions required sorting', async () => {
            const workbenchService = instantiationService.get(extensions_1.$Pfb);
            const extension = (await workbenchService.queryLocal()).find(ex => ex.identifier === localEnabledLanguage.identifier);
            await new Promise(c => {
                const disposable = workbenchService.onChange(() => {
                    if (extension?.outdated) {
                        disposable.dispose();
                        c();
                    }
                });
                instantiationService.get(extensions_1.$Pfb).queryGallery(cancellation_1.CancellationToken.None);
            });
            const result = await testableView.show('@installed');
            assert.strictEqual(result.length, 5, 'Unexpected number of results for @installed query');
            const actual = [result.get(0).name, result.get(1).name, result.get(2).name, result.get(3).name, result.get(4).name];
            const expected = [localEnabledLanguage.manifest.name, localEnabledTheme.manifest.name, localRandom.manifest.name, localDisabledTheme.manifest.name, localDisabledLanguage.manifest.name];
            for (let i = 0; i < result.length; i++) {
                assert.strictEqual(actual[i], expected[i], 'Unexpected extension for @installed query with outadted extension.');
            }
        });
        test('Test installed query results', async () => {
            await testableView.show('@installed').then(result => {
                assert.strictEqual(result.length, 5, 'Unexpected number of results for @installed query');
                const actual = [result.get(0).name, result.get(1).name, result.get(2).name, result.get(3).name, result.get(4).name].sort();
                const expected = [localDisabledTheme.manifest.name, localEnabledTheme.manifest.name, localRandom.manifest.name, localDisabledLanguage.manifest.name, localEnabledLanguage.manifest.name];
                for (let i = 0; i < result.length; i++) {
                    assert.strictEqual(actual[i], expected[i], 'Unexpected extension for @installed query.');
                }
            });
            await testableView.show('@installed first').then(result => {
                assert.strictEqual(result.length, 2, 'Unexpected number of results for @installed query');
                assert.strictEqual(result.get(0).name, localEnabledTheme.manifest.name, 'Unexpected extension for @installed query with search text.');
                assert.strictEqual(result.get(1).name, localDisabledTheme.manifest.name, 'Unexpected extension for @installed query with search text.');
            });
            await testableView.show('@disabled').then(result => {
                assert.strictEqual(result.length, 2, 'Unexpected number of results for @disabled query');
                assert.strictEqual(result.get(0).name, localDisabledTheme.manifest.name, 'Unexpected extension for @disabled query.');
                assert.strictEqual(result.get(1).name, localDisabledLanguage.manifest.name, 'Unexpected extension for @disabled query.');
            });
            await testableView.show('@enabled').then(result => {
                assert.strictEqual(result.length, 3, 'Unexpected number of results for @enabled query');
                assert.strictEqual(result.get(0).name, localEnabledTheme.manifest.name, 'Unexpected extension for @enabled query.');
                assert.strictEqual(result.get(1).name, localRandom.manifest.name, 'Unexpected extension for @enabled query.');
                assert.strictEqual(result.get(2).name, localEnabledLanguage.manifest.name, 'Unexpected extension for @enabled query.');
            });
            await testableView.show('@builtin:themes').then(result => {
                assert.strictEqual(result.length, 1, 'Unexpected number of results for @builtin:themes query');
                assert.strictEqual(result.get(0).name, builtInTheme.manifest.name, 'Unexpected extension for @builtin:themes query.');
            });
            await testableView.show('@builtin:basics').then(result => {
                assert.strictEqual(result.length, 1, 'Unexpected number of results for @builtin:basics query');
                assert.strictEqual(result.get(0).name, builtInBasic.manifest.name, 'Unexpected extension for @builtin:basics query.');
            });
            await testableView.show('@builtin').then(result => {
                assert.strictEqual(result.length, 2, 'Unexpected number of results for @builtin query');
                assert.strictEqual(result.get(0).name, builtInBasic.manifest.name, 'Unexpected extension for @builtin query.');
                assert.strictEqual(result.get(1).name, builtInTheme.manifest.name, 'Unexpected extension for @builtin query.');
            });
            await testableView.show('@builtin my-theme').then(result => {
                assert.strictEqual(result.length, 1, 'Unexpected number of results for @builtin query');
                assert.strictEqual(result.get(0).name, builtInTheme.manifest.name, 'Unexpected extension for @builtin query.');
            });
        });
        test('Test installed query with category', async () => {
            await testableView.show('@installed category:themes').then(result => {
                assert.strictEqual(result.length, 2, 'Unexpected number of results for @installed query with category');
                assert.strictEqual(result.get(0).name, localEnabledTheme.manifest.name, 'Unexpected extension for @installed query with category.');
                assert.strictEqual(result.get(1).name, localDisabledTheme.manifest.name, 'Unexpected extension for @installed query with category.');
            });
            await testableView.show('@installed category:"themes"').then(result => {
                assert.strictEqual(result.length, 2, 'Unexpected number of results for @installed query with quoted category');
                assert.strictEqual(result.get(0).name, localEnabledTheme.manifest.name, 'Unexpected extension for @installed query with quoted category.');
                assert.strictEqual(result.get(1).name, localDisabledTheme.manifest.name, 'Unexpected extension for @installed query with quoted category.');
            });
            await testableView.show('@installed category:"programming languages"').then(result => {
                assert.strictEqual(result.length, 2, 'Unexpected number of results for @installed query with quoted category including space');
                assert.strictEqual(result.get(0).name, localEnabledLanguage.manifest.name, 'Unexpected extension for @installed query with quoted category including space.');
                assert.strictEqual(result.get(1).name, localDisabledLanguage.manifest.name, 'Unexpected extension for @installed query with quoted category inlcuding space.');
            });
            await testableView.show('@installed category:themes category:random').then(result => {
                assert.strictEqual(result.length, 3, 'Unexpected number of results for @installed query with multiple category');
                assert.strictEqual(result.get(0).name, localEnabledTheme.manifest.name, 'Unexpected extension for @installed query with multiple category.');
                assert.strictEqual(result.get(1).name, localRandom.manifest.name, 'Unexpected extension for @installed query with multiple category.');
                assert.strictEqual(result.get(2).name, localDisabledTheme.manifest.name, 'Unexpected extension for @installed query with multiple category.');
            });
            await testableView.show('@enabled category:themes').then(result => {
                assert.strictEqual(result.length, 1, 'Unexpected number of results for @enabled query with category');
                assert.strictEqual(result.get(0).name, localEnabledTheme.manifest.name, 'Unexpected extension for @enabled query with category.');
            });
            await testableView.show('@enabled category:"themes"').then(result => {
                assert.strictEqual(result.length, 1, 'Unexpected number of results for @enabled query with quoted category');
                assert.strictEqual(result.get(0).name, localEnabledTheme.manifest.name, 'Unexpected extension for @enabled query with quoted category.');
            });
            await testableView.show('@enabled category:"programming languages"').then(result => {
                assert.strictEqual(result.length, 1, 'Unexpected number of results for @enabled query with quoted category inlcuding space');
                assert.strictEqual(result.get(0).name, localEnabledLanguage.manifest.name, 'Unexpected extension for @enabled query with quoted category including space.');
            });
            await testableView.show('@disabled category:themes').then(result => {
                assert.strictEqual(result.length, 1, 'Unexpected number of results for @disabled query with category');
                assert.strictEqual(result.get(0).name, localDisabledTheme.manifest.name, 'Unexpected extension for @disabled query with category.');
            });
            await testableView.show('@disabled category:"themes"').then(result => {
                assert.strictEqual(result.length, 1, 'Unexpected number of results for @disabled query with quoted category');
                assert.strictEqual(result.get(0).name, localDisabledTheme.manifest.name, 'Unexpected extension for @disabled query with quoted category.');
            });
            await testableView.show('@disabled category:"programming languages"').then(result => {
                assert.strictEqual(result.length, 1, 'Unexpected number of results for @disabled query with quoted category inlcuding space');
                assert.strictEqual(result.get(0).name, localDisabledLanguage.manifest.name, 'Unexpected extension for @disabled query with quoted category including space.');
            });
        });
        test('Test local query with sorting order', async () => {
            await testableView.show('@recentlyUpdated').then(result => {
                assert.strictEqual(result.length, 1, 'Unexpected number of results for @recentlyUpdated');
                assert.strictEqual(result.get(0).name, localDisabledLanguage.manifest.name, 'Unexpected default sort order of extensions for @recentlyUpdate query');
            });
            await testableView.show('@installed @sort:updateDate').then(result => {
                assert.strictEqual(result.length, 5, 'Unexpected number of results for @sort:updateDate. Expected all localy installed Extension which are not builtin');
                const actual = [result.get(0).local?.installedTimestamp, result.get(1).local?.installedTimestamp, result.get(2).local?.installedTimestamp, result.get(3).local?.installedTimestamp, result.get(4).local?.installedTimestamp];
                const expected = [localEnabledLanguage.installedTimestamp, localDisabledLanguage.installedTimestamp, localRandom.installedTimestamp, localDisabledTheme.installedTimestamp, localEnabledTheme.installedTimestamp];
                for (let i = 0; i < result.length; i++) {
                    assert.strictEqual(actual[i], expected[i], 'Unexpected extension sorting for @sort:updateDate query.');
                }
            });
        });
        test('Test @recommended:workspace query', () => {
            const workspaceRecommendedExtensions = [
                workspaceRecommendationA,
                workspaceRecommendationB,
                configBasedRecommendationA,
            ];
            const target = instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', workspaceRecommendedExtensions);
            return testableView.show('@recommended:workspace').then(result => {
                const extensionInfos = target.args[0][0];
                assert.strictEqual(extensionInfos.length, workspaceRecommendedExtensions.length);
                assert.strictEqual(result.length, workspaceRecommendedExtensions.length);
                for (let i = 0; i < workspaceRecommendedExtensions.length; i++) {
                    assert.strictEqual(extensionInfos[i].id, workspaceRecommendedExtensions[i].identifier.id);
                    assert.strictEqual(result.get(i).identifier.id, workspaceRecommendedExtensions[i].identifier.id);
                }
            });
        });
        test('Test @recommended query', () => {
            const allRecommendedExtensions = [
                fileBasedRecommendationA,
                fileBasedRecommendationB,
                configBasedRecommendationB,
                otherRecommendationA
            ];
            const target = instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', allRecommendedExtensions);
            return testableView.show('@recommended').then(result => {
                const extensionInfos = target.args[0][0];
                assert.strictEqual(extensionInfos.length, allRecommendedExtensions.length);
                assert.strictEqual(result.length, allRecommendedExtensions.length);
                for (let i = 0; i < allRecommendedExtensions.length; i++) {
                    assert.strictEqual(extensionInfos[i].id, allRecommendedExtensions[i].identifier.id);
                    assert.strictEqual(result.get(i).identifier.id, allRecommendedExtensions[i].identifier.id);
                }
            });
        });
        test('Test @recommended:all query', () => {
            const allRecommendedExtensions = [
                workspaceRecommendationA,
                workspaceRecommendationB,
                configBasedRecommendationA,
                fileBasedRecommendationA,
                fileBasedRecommendationB,
                configBasedRecommendationB,
                otherRecommendationA,
            ];
            const target = instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', allRecommendedExtensions);
            return testableView.show('@recommended:all').then(result => {
                const extensionInfos = target.args[0][0];
                assert.strictEqual(extensionInfos.length, allRecommendedExtensions.length);
                assert.strictEqual(result.length, allRecommendedExtensions.length);
                for (let i = 0; i < allRecommendedExtensions.length; i++) {
                    assert.strictEqual(extensionInfos[i].id, allRecommendedExtensions[i].identifier.id);
                    assert.strictEqual(result.get(i).identifier.id, allRecommendedExtensions[i].identifier.id);
                }
            });
        });
        test('Test search', () => {
            const searchText = 'search-me';
            const results = [
                fileBasedRecommendationA,
                workspaceRecommendationA,
                otherRecommendationA,
                workspaceRecommendationB
            ];
            const queryTarget = instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(...results));
            return testableView.show('search-me').then(result => {
                const options = queryTarget.args[0][0];
                assert.ok(queryTarget.calledOnce);
                assert.strictEqual(options.text, searchText);
                assert.strictEqual(result.length, results.length);
                for (let i = 0; i < results.length; i++) {
                    assert.strictEqual(result.get(i).identifier.id, results[i].identifier.id);
                }
            });
        });
        test('Test preferred search experiment', () => {
            const searchText = 'search-me';
            const actual = [
                fileBasedRecommendationA,
                workspaceRecommendationA,
                otherRecommendationA,
                workspaceRecommendationB
            ];
            const expected = [
                workspaceRecommendationA,
                workspaceRecommendationB,
                fileBasedRecommendationA,
                otherRecommendationA
            ];
            const queryTarget = instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(...actual));
            const experimentTarget = instantiationService.stubPromise(extensionManagement_2.$hcb, 'getExtensionsControlManifest', {
                malicious: [], deprecated: {},
                search: [{
                        query: 'search-me',
                        preferredResults: [
                            workspaceRecommendationA.identifier.id,
                            'something-that-wasnt-in-first-page',
                            workspaceRecommendationB.identifier.id
                        ]
                    }]
            });
            testableView.dispose();
            testableView = disposableStore.add(instantiationService.createInstance(extensionsViews_1.$_Tb, {}, { id: '', title: '' }));
            return testableView.show('search-me').then(result => {
                const options = queryTarget.args[0][0];
                assert.ok(experimentTarget.calledTwice);
                assert.ok(queryTarget.calledOnce);
                assert.strictEqual(options.text, searchText);
                assert.strictEqual(result.length, expected.length);
                for (let i = 0; i < expected.length; i++) {
                    assert.strictEqual(result.get(i).identifier.id, expected[i].identifier.id);
                }
            });
        });
        test('Skip preferred search experiment when user defines sort order', () => {
            const searchText = 'search-me';
            const realResults = [
                fileBasedRecommendationA,
                workspaceRecommendationA,
                otherRecommendationA,
                workspaceRecommendationB
            ];
            const queryTarget = instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(...realResults));
            testableView.dispose();
            disposableStore.add(testableView = instantiationService.createInstance(extensionsViews_1.$_Tb, {}, { id: '', title: '' }));
            return testableView.show('search-me @sort:installs').then(result => {
                const options = queryTarget.args[0][0];
                assert.ok(queryTarget.calledOnce);
                assert.strictEqual(options.text, searchText);
                assert.strictEqual(result.length, realResults.length);
                for (let i = 0; i < realResults.length; i++) {
                    assert.strictEqual(result.get(i).identifier.id, realResults[i].identifier.id);
                }
            });
        });
        function aLocalExtension(name = 'someext', manifest = {}, properties = {}) {
            manifest = { name, publisher: 'pub', version: '1.0.0', ...manifest };
            properties = {
                type: 1 /* ExtensionType.User */,
                location: uri_1.URI.file(`pub.${name}`),
                identifier: { id: (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name) },
                metadata: { id: (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name), publisherId: manifest.publisher, publisherDisplayName: 'somename' },
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
            return galleryExtension;
        }
        function aPage(...objects) {
            return { firstPage: objects, total: objects.length, pageSize: objects.length, getPage: () => null };
        }
    });
});
//# sourceMappingURL=extensionsViews.test.js.map