/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "sinon", "assert", "vs/base/common/uuid", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/test/electron-sandbox/workbenchTestServices", "vs/platform/notification/test/common/testNotificationService", "vs/platform/configuration/common/configuration", "vs/base/common/uri", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/environment/common/environment", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/extensionManagement/test/browser/extensionEnablementService.test", "vs/platform/url/common/url", "vs/editor/common/services/model", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/notification/common/notification", "vs/platform/url/common/urlService", "vs/platform/storage/common/storage", "vs/platform/ipc/electron-sandbox/services", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/workbench/contrib/extensions/browser/extensionRecommendationsService", "vs/workbench/contrib/tags/browser/workspaceTagsService", "vs/workbench/contrib/tags/common/workspaceTags", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/services/extensionRecommendations/common/extensionIgnoredRecommendationsService", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/workbench/contrib/extensions/browser/extensionRecommendationNotificationService", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/resources", "vs/base/common/buffer", "vs/base/common/platform", "vs/base/common/process", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/base/common/lifecycle", "vs/base/common/async"], function (require, exports, sinon, assert, uuid, extensionManagement_1, extensionManagement_2, extensionGalleryService_1, instantiationServiceMock_1, event_1, telemetry_1, telemetryUtils_1, workspace_1, workbenchTestServices_1, workbenchTestServices_2, workbenchTestServices_3, testNotificationService_1, configuration_1, uri_1, testWorkspace_1, testConfigurationService_1, extensionManagementUtil_1, environment_1, extensions_1, extensionEnablementService_test_1, url_1, model_1, lifecycle_1, notification_1, urlService_1, storage_1, services_1, fileService_1, log_1, files_1, productService_1, extensionRecommendationsService_1, workspaceTagsService_1, workspaceTags_1, extensionsWorkbenchService_1, extensions_2, workspaceExtensionsConfig_1, extensionRecommendations_1, extensionIgnoredRecommendationsService_1, extensionRecommendations_2, extensionRecommendationNotificationService_1, contextkey_1, mockKeybindingService_1, inMemoryFilesystemProvider_1, resources_1, buffer_1, platform_1, process_1, timeTravelScheduler_1, utils_1, lifecycle_2, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mockExtensionGallery = [
        aGalleryExtension('MockExtension1', {
            displayName: 'Mock Extension 1',
            version: '1.5',
            publisherId: 'mockPublisher1Id',
            publisher: 'mockPublisher1',
            publisherDisplayName: 'Mock Publisher 1',
            description: 'Mock Description',
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
        }),
        aGalleryExtension('MockExtension2', {
            displayName: 'Mock Extension 2',
            version: '1.5',
            publisherId: 'mockPublisher2Id',
            publisher: 'mockPublisher2',
            publisherDisplayName: 'Mock Publisher 2',
            description: 'Mock Description',
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
        })
    ];
    const mockExtensionLocal = [
        {
            type: 1 /* ExtensionType.User */,
            identifier: mockExtensionGallery[0].identifier,
            manifest: {
                name: mockExtensionGallery[0].name,
                publisher: mockExtensionGallery[0].publisher,
                version: mockExtensionGallery[0].version
            },
            metadata: null,
            path: 'somepath',
            readmeUrl: 'some readmeUrl',
            changelogUrl: 'some changelogUrl'
        },
        {
            type: 1 /* ExtensionType.User */,
            identifier: mockExtensionGallery[1].identifier,
            manifest: {
                name: mockExtensionGallery[1].name,
                publisher: mockExtensionGallery[1].publisher,
                version: mockExtensionGallery[1].version
            },
            metadata: null,
            path: 'somepath',
            readmeUrl: 'some readmeUrl',
            changelogUrl: 'some changelogUrl'
        }
    ];
    const mockTestData = {
        recommendedExtensions: [
            'mockPublisher1.mockExtension1',
            'MOCKPUBLISHER2.mockextension2',
            'badlyformattedextension',
            'MOCKPUBLISHER2.mockextension2',
            'unknown.extension'
        ],
        validRecommendedExtensions: [
            'mockPublisher1.mockExtension1',
            'MOCKPUBLISHER2.mockextension2'
        ]
    };
    function aPage(...objects) {
        return { firstPage: objects, total: objects.length, pageSize: objects.length, getPage: () => null };
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
        galleryExtension.identifier = { id: (0, extensionManagementUtil_1.$uo)(galleryExtension.publisher, galleryExtension.name), uuid: uuid.$4f() };
        return galleryExtension;
    }
    suite('ExtensionRecommendationsService Test', () => {
        let disposableStore;
        let workspaceService;
        let instantiationService;
        let testConfigurationService;
        let testObject;
        let installEvent, didInstallEvent, uninstallEvent, didUninstallEvent;
        let prompted;
        let promptedEmitter;
        let onModelAddedEvent;
        teardown(async () => {
            disposableStore.dispose();
            await (0, async_1.$Hg)(0); // allow for async disposables to complete
        });
        (0, utils_1.$bT)();
        setup(() => {
            disposableStore = new lifecycle_2.$jc();
            instantiationService = disposableStore.add(new instantiationServiceMock_1.$L0b());
            promptedEmitter = disposableStore.add(new event_1.$fd());
            installEvent = disposableStore.add(new event_1.$fd());
            didInstallEvent = disposableStore.add(new event_1.$fd());
            uninstallEvent = disposableStore.add(new event_1.$fd());
            didUninstallEvent = disposableStore.add(new event_1.$fd());
            instantiationService.stub(extensionManagement_1.$Zn, extensionGalleryService_1.$5o);
            instantiationService.stub(services_1.$A7b, workbenchTestServices_3.$wfc);
            instantiationService.stub(lifecycle_1.$7y, disposableStore.add(new workbenchTestServices_1.$Kec()));
            testConfigurationService = new testConfigurationService_1.$G0b();
            instantiationService.stub(configuration_1.$8h, testConfigurationService);
            instantiationService.stub(notification_1.$Yu, new testNotificationService_1.$I0b());
            instantiationService.stub(contextkey_1.$3i, new mockKeybindingService_1.$S0b());
            instantiationService.stub(extensionManagement_1.$2n, {
                onInstallExtension: installEvent.event,
                onDidInstallExtensions: didInstallEvent.event,
                onUninstallExtension: uninstallEvent.event,
                onDidUninstallExtension: didUninstallEvent.event,
                onDidUpdateExtensionMetadata: event_1.Event.None,
                onDidChangeProfile: event_1.Event.None,
                async getInstalled() { return []; },
                async canInstall() { return true; },
                async getExtensionsControlManifest() { return { malicious: [], deprecated: {}, search: [] }; },
                async getTargetPlatform() { return (0, extensionManagement_1.$Un)(platform_1.$t, process_1.$4d); }
            });
            instantiationService.stub(extensions_2.$MF, {
                onDidChangeExtensions: event_1.Event.None,
                extensions: [],
                async whenInstalledExtensionsRegistered() { return true; }
            });
            instantiationService.stub(extensionManagement_2.$icb, disposableStore.add(new extensionEnablementService_test_1.$Dfc(instantiationService)));
            instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            instantiationService.stub(url_1.$IT, urlService_1.$KT);
            instantiationService.stub(workspaceTags_1.$NZb, new workspaceTagsService_1.$b5b());
            instantiationService.stub(storage_1.$Vo, disposableStore.add(new workbenchTestServices_2.$7dc()));
            instantiationService.stub(log_1.$5i, new log_1.$fj());
            instantiationService.stub(productService_1.$kj, {
                extensionTips: {
                    'ms-dotnettools.csharp': '{**/*.cs,**/project.json,**/global.json,**/*.csproj,**/*.sln,**/appsettings.json}',
                    'msjsdiag.debugger-for-chrome': '{**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.es6,**/*.mjs,**/*.cjs,**/.babelrc}',
                    'lukehoban.Go': '**/*.go'
                },
                extensionRecommendations: {
                    'ms-python.python': {
                        onFileOpen: [
                            {
                                'pathGlob': '{**/*.py}',
                                important: true
                            }
                        ]
                    },
                    'ms-vscode.PowerShell': {
                        onFileOpen: [
                            {
                                'pathGlob': '{**/*.ps,**/*.ps1}',
                                important: true
                            }
                        ]
                    },
                    'ms-dotnettools.csharp': {
                        onFileOpen: [
                            {
                                'pathGlob': '{**/*.cs,**/project.json,**/global.json,**/*.csproj,**/*.sln,**/appsettings.json}',
                            }
                        ]
                    },
                    'msjsdiag.debugger-for-chrome': {
                        onFileOpen: [
                            {
                                'pathGlob': '{**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.es6,**/*.mjs,**/*.cjs,**/.babelrc}',
                            }
                        ]
                    },
                    'lukehoban.Go': {
                        onFileOpen: [
                            {
                                'pathGlob': '**/*.go',
                            }
                        ]
                    }
                },
            });
            instantiationService.set(extensions_1.$Pfb, disposableStore.add(instantiationService.createInstance(extensionsWorkbenchService_1.$3Ub)));
            instantiationService.stub(extensionManagement_1.$6n, disposableStore.add(instantiationService.createInstance(workbenchTestServices_3.$yfc)));
            onModelAddedEvent = new event_1.$fd();
            instantiationService.stub(environment_1.$Ih, {});
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', []);
            instantiationService.stub(extensionManagement_1.$Zn, 'isEnabled', true);
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'query', aPage(...mockExtensionGallery));
            instantiationService.stubPromise(extensionManagement_1.$Zn, 'getExtensions', mockExtensionGallery);
            prompted = false;
            class TestNotificationService2 extends testNotificationService_1.$I0b {
                prompt(severity, message, choices, options) {
                    prompted = true;
                    promptedEmitter.fire();
                    return super.prompt(severity, message, choices, options);
                }
            }
            instantiationService.stub(notification_1.$Yu, new TestNotificationService2());
            testConfigurationService.setUserConfiguration(extensions_1.$Qfb, { ignoreRecommendations: false });
            instantiationService.stub(model_1.$yA, {
                getModels() { return []; },
                onModelAdded: onModelAddedEvent.event
            });
        });
        function setUpFolderWorkspace(folderName, recommendedExtensions, ignoredRecommendations = []) {
            return setUpFolder(folderName, recommendedExtensions, ignoredRecommendations);
        }
        async function setUpFolder(folderName, recommendedExtensions, ignoredRecommendations = []) {
            const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
            const logService = new log_1.$fj();
            const fileService = disposableStore.add(new fileService_1.$Dp(logService));
            const fileSystemProvider = disposableStore.add(new inMemoryFilesystemProvider_1.$rAb());
            disposableStore.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            const folderDir = (0, resources_1.$ig)(ROOT, folderName);
            const workspaceSettingsDir = (0, resources_1.$ig)(folderDir, '.vscode');
            await fileService.createFolder(workspaceSettingsDir);
            const configPath = (0, resources_1.$ig)(workspaceSettingsDir, 'extensions.json');
            await fileService.writeFile(configPath, buffer_1.$Fd.fromString(JSON.stringify({
                'recommendations': recommendedExtensions,
                'unwantedRecommendations': ignoredRecommendations,
            }, null, '\t')));
            const myWorkspace = (0, testWorkspace_1.$_0b)(folderDir);
            instantiationService.stub(files_1.$6j, fileService);
            workspaceService = new workbenchTestServices_2.$6dc(myWorkspace);
            instantiationService.stub(workspace_1.$Kh, workspaceService);
            instantiationService.stub(workspaceExtensionsConfig_1.$qgb, disposableStore.add(instantiationService.createInstance(workspaceExtensionsConfig_1.$rgb)));
            instantiationService.stub(extensionRecommendations_1.$0fb, disposableStore.add(instantiationService.createInstance(extensionIgnoredRecommendationsService_1.$Jzb)));
            instantiationService.stub(extensionRecommendations_2.$TUb, disposableStore.add(instantiationService.createInstance(extensionRecommendationNotificationService_1.$4Ub)));
        }
        function testNoPromptForValidRecommendations(recommendations) {
            return setUpFolderWorkspace('myFolder', recommendations).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
                return testObject.activationPromise.then(() => {
                    assert.strictEqual(Object.keys(testObject.getAllRecommendationsWithReason()).length, recommendations.length);
                    assert.ok(!prompted);
                });
            });
        }
        function testNoPromptOrRecommendationsForValidRecommendations(recommendations) {
            return setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
                assert.ok(!prompted);
                return testObject.getWorkspaceRecommendations().then(() => {
                    assert.strictEqual(Object.keys(testObject.getAllRecommendationsWithReason()).length, 0);
                    assert.ok(!prompted);
                });
            });
        }
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations when galleryService is absent', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const galleryQuerySpy = sinon.spy();
            instantiationService.stub(extensionManagement_1.$Zn, { query: galleryQuerySpy, isEnabled: () => false });
            return testNoPromptOrRecommendationsForValidRecommendations(mockTestData.validRecommendedExtensions)
                .then(() => assert.ok(galleryQuerySpy.notCalled));
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations during extension development', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            instantiationService.stub(environment_1.$Ih, { extensionDevelopmentLocationURI: [uri_1.URI.file('/folder/file')], isExtensionDevelopment: true });
            return testNoPromptOrRecommendationsForValidRecommendations(mockTestData.validRecommendedExtensions);
        }));
        test('ExtensionRecommendationsService: No workspace recommendations or prompts when extensions.json has empty array', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            return testNoPromptForValidRecommendations([]);
        }));
        test('ExtensionRecommendationsService: Prompt for valid workspace recommendations', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            await setUpFolderWorkspace('myFolder', mockTestData.recommendedExtensions);
            testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
            await event_1.Event.toPromise(promptedEmitter.event);
            const recommendations = Object.keys(testObject.getAllRecommendationsWithReason());
            const expected = [...mockTestData.validRecommendedExtensions, 'unknown.extension'];
            assert.strictEqual(recommendations.length, expected.length);
            expected.forEach(x => {
                assert.strictEqual(recommendations.indexOf(x.toLowerCase()) > -1, true);
            });
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations if they are already installed', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', mockExtensionLocal);
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions);
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations with casing mismatch if they are already installed', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            instantiationService.stubPromise(extensionManagement_1.$2n, 'getInstalled', mockExtensionLocal);
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions.map(x => x.toUpperCase()));
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations if ignoreRecommendations is set', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            testConfigurationService.setUserConfiguration(extensions_1.$Qfb, { ignoreRecommendations: true });
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions);
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations if showRecommendationsOnlyOnDemand is set', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            testConfigurationService.setUserConfiguration(extensions_1.$Qfb, { showRecommendationsOnlyOnDemand: true });
            return setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
                return testObject.activationPromise.then(() => {
                    assert.ok(!prompted);
                });
            });
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations if ignoreRecommendations is set for current workspace', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            instantiationService.get(storage_1.$Vo).store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions);
        }));
        test('ExtensionRecommendationsService: No Recommendations of globally ignored recommendations', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            instantiationService.get(storage_1.$Vo).store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            instantiationService.get(storage_1.$Vo).store('extensionsAssistant/recommendations', '["ms-dotnettools.csharp", "ms-python.python", "ms-vscode.vscode-typescript-tslint-plugin"]', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            instantiationService.get(storage_1.$Vo).store('extensionsAssistant/ignored_recommendations', '["ms-dotnettools.csharp", "mockpublisher2.mockextension2"]', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
                return testObject.activationPromise.then(() => {
                    const recommendations = testObject.getAllRecommendationsWithReason();
                    assert.ok(!recommendations['ms-dotnettools.csharp']); // stored recommendation that has been globally ignored
                    assert.ok(recommendations['ms-python.python']); // stored recommendation
                    assert.ok(recommendations['mockpublisher1.mockextension1']); // workspace recommendation
                    assert.ok(!recommendations['mockpublisher2.mockextension2']); // workspace recommendation that has been globally ignored
                });
            });
        }));
        test('ExtensionRecommendationsService: No Recommendations of workspace ignored recommendations', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const ignoredRecommendations = ['ms-dotnettools.csharp', 'mockpublisher2.mockextension2']; // ignore a stored recommendation and a workspace recommendation.
            const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python"]';
            instantiationService.get(storage_1.$Vo).store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            instantiationService.get(storage_1.$Vo).store('extensionsAssistant/recommendations', storedRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions, ignoredRecommendations).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
                return testObject.activationPromise.then(() => {
                    const recommendations = testObject.getAllRecommendationsWithReason();
                    assert.ok(!recommendations['ms-dotnettools.csharp']); // stored recommendation that has been workspace ignored
                    assert.ok(recommendations['ms-python.python']); // stored recommendation
                    assert.ok(recommendations['mockpublisher1.mockextension1']); // workspace recommendation
                    assert.ok(!recommendations['mockpublisher2.mockextension2']); // workspace recommendation that has been workspace ignored
                });
            });
        }));
        test('ExtensionRecommendationsService: Able to retrieve collection of all ignored recommendations', async () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storageService = instantiationService.get(storage_1.$Vo);
            const workspaceIgnoredRecommendations = ['ms-dotnettools.csharp']; // ignore a stored recommendation and a workspace recommendation.
            const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python"]';
            const globallyIgnoredRecommendations = '["mockpublisher2.mockextension2"]'; // ignore a workspace recommendation.
            storageService.store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('extensionsAssistant/recommendations', storedRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('extensionsAssistant/ignored_recommendations', globallyIgnoredRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            await setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions, workspaceIgnoredRecommendations);
            testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
            await testObject.activationPromise;
            const recommendations = testObject.getAllRecommendationsWithReason();
            assert.deepStrictEqual(Object.keys(recommendations), ['ms-python.python', 'mockpublisher1.mockextension1']);
        }));
        test('ExtensionRecommendationsService: Able to dynamically ignore/unignore global recommendations', async () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storageService = instantiationService.get(storage_1.$Vo);
            const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python"]';
            const globallyIgnoredRecommendations = '["mockpublisher2.mockextension2"]'; // ignore a workspace recommendation.
            storageService.store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('extensionsAssistant/recommendations', storedRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('extensionsAssistant/ignored_recommendations', globallyIgnoredRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            await setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions);
            const extensionIgnoredRecommendationsService = instantiationService.get(extensionRecommendations_1.$0fb);
            testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
            await testObject.activationPromise;
            let recommendations = testObject.getAllRecommendationsWithReason();
            assert.ok(recommendations['ms-python.python']);
            assert.ok(recommendations['mockpublisher1.mockextension1']);
            assert.ok(!recommendations['mockpublisher2.mockextension2']);
            extensionIgnoredRecommendationsService.toggleGlobalIgnoredRecommendation('mockpublisher1.mockextension1', true);
            recommendations = testObject.getAllRecommendationsWithReason();
            assert.ok(recommendations['ms-python.python']);
            assert.ok(!recommendations['mockpublisher1.mockextension1']);
            assert.ok(!recommendations['mockpublisher2.mockextension2']);
            extensionIgnoredRecommendationsService.toggleGlobalIgnoredRecommendation('mockpublisher1.mockextension1', false);
            recommendations = testObject.getAllRecommendationsWithReason();
            assert.ok(recommendations['ms-python.python']);
            assert.ok(recommendations['mockpublisher1.mockextension1']);
            assert.ok(!recommendations['mockpublisher2.mockextension2']);
        }));
        test('test global extensions are modified and recommendation change event is fired when an extension is ignored', async () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storageService = instantiationService.get(storage_1.$Vo);
            const changeHandlerTarget = sinon.spy();
            const ignoredExtensionId = 'Some.Extension';
            storageService.store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('extensionsAssistant/ignored_recommendations', '["ms-vscode.vscode"]', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            await setUpFolderWorkspace('myFolder', []);
            testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
            const extensionIgnoredRecommendationsService = instantiationService.get(extensionRecommendations_1.$0fb);
            disposableStore.add(extensionIgnoredRecommendationsService.onDidChangeGlobalIgnoredRecommendation(changeHandlerTarget));
            extensionIgnoredRecommendationsService.toggleGlobalIgnoredRecommendation(ignoredExtensionId, true);
            await testObject.activationPromise;
            assert.ok(changeHandlerTarget.calledOnce);
            assert.ok(changeHandlerTarget.getCall(0).calledWithMatch({ extensionId: ignoredExtensionId.toLowerCase(), isRecommended: false }));
        }));
        test('ExtensionRecommendationsService: Get file based recommendations from storage (old format)', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python", "ms-vscode.vscode-typescript-tslint-plugin"]';
            instantiationService.get(storage_1.$Vo).store('extensionsAssistant/recommendations', storedRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return setUpFolderWorkspace('myFolder', []).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
                return testObject.activationPromise.then(() => {
                    const recommendations = testObject.getFileBasedRecommendations();
                    assert.strictEqual(recommendations.length, 2);
                    assert.ok(recommendations.some(extensionId => extensionId === 'ms-dotnettools.csharp')); // stored recommendation that exists in product.extensionTips
                    assert.ok(recommendations.some(extensionId => extensionId === 'ms-python.python')); // stored recommendation that exists in product.extensionImportantTips
                    assert.ok(recommendations.every(extensionId => extensionId !== 'ms-vscode.vscode-typescript-tslint-plugin')); // stored recommendation that is no longer in neither product.extensionTips nor product.extensionImportantTips
                });
            });
        }));
        test('ExtensionRecommendationsService: Get file based recommendations from storage (new format)', async () => {
            const milliSecondsInADay = 1000 * 60 * 60 * 24;
            const now = Date.now();
            const tenDaysOld = 10 * milliSecondsInADay;
            const storedRecommendations = `{"ms-dotnettools.csharp": ${now}, "ms-python.python": ${now}, "ms-vscode.vscode-typescript-tslint-plugin": ${now}, "lukehoban.Go": ${tenDaysOld}}`;
            instantiationService.get(storage_1.$Vo).store('extensionsAssistant/recommendations', storedRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            await setUpFolderWorkspace('myFolder', []);
            testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.$1Ub));
            await testObject.activationPromise;
            const recommendations = testObject.getFileBasedRecommendations();
            assert.strictEqual(recommendations.length, 2);
            assert.ok(recommendations.some(extensionId => extensionId === 'ms-dotnettools.csharp')); // stored recommendation that exists in product.extensionTips
            assert.ok(recommendations.some(extensionId => extensionId === 'ms-python.python')); // stored recommendation that exists in product.extensionImportantTips
            assert.ok(recommendations.every(extensionId => extensionId !== 'ms-vscode.vscode-typescript-tslint-plugin')); // stored recommendation that is no longer in neither product.extensionTips nor product.extensionImportantTips
            assert.ok(recommendations.every(extensionId => extensionId !== 'lukehoban.Go')); //stored recommendation that is older than a week
        });
    });
});
//# sourceMappingURL=extensionRecommendationsService.test.js.map