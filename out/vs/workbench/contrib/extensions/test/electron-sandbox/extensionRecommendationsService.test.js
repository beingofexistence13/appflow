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
        const targetPlatform = (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch);
        const galleryExtension = Object.create({ name, publisher: 'pub', version: '1.0.0', allTargetPlatforms: [targetPlatform], properties: {}, assets: {}, ...properties });
        galleryExtension.properties = { ...galleryExtension.properties, dependencies: [], targetPlatform, ...galleryExtensionProperties };
        galleryExtension.assets = { ...galleryExtension.assets, ...assets };
        galleryExtension.identifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(galleryExtension.publisher, galleryExtension.name), uuid: uuid.generateUuid() };
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
            await (0, async_1.timeout)(0); // allow for async disposables to complete
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => {
            disposableStore = new lifecycle_2.DisposableStore();
            instantiationService = disposableStore.add(new instantiationServiceMock_1.TestInstantiationService());
            promptedEmitter = disposableStore.add(new event_1.Emitter());
            installEvent = disposableStore.add(new event_1.Emitter());
            didInstallEvent = disposableStore.add(new event_1.Emitter());
            uninstallEvent = disposableStore.add(new event_1.Emitter());
            didUninstallEvent = disposableStore.add(new event_1.Emitter());
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, extensionGalleryService_1.ExtensionGalleryService);
            instantiationService.stub(services_1.ISharedProcessService, workbenchTestServices_3.TestSharedProcessService);
            instantiationService.stub(lifecycle_1.ILifecycleService, disposableStore.add(new workbenchTestServices_1.TestLifecycleService()));
            testConfigurationService = new testConfigurationService_1.TestConfigurationService();
            instantiationService.stub(configuration_1.IConfigurationService, testConfigurationService);
            instantiationService.stub(notification_1.INotificationService, new testNotificationService_1.TestNotificationService());
            instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, {
                onInstallExtension: installEvent.event,
                onDidInstallExtensions: didInstallEvent.event,
                onUninstallExtension: uninstallEvent.event,
                onDidUninstallExtension: didUninstallEvent.event,
                onDidUpdateExtensionMetadata: event_1.Event.None,
                onDidChangeProfile: event_1.Event.None,
                async getInstalled() { return []; },
                async canInstall() { return true; },
                async getExtensionsControlManifest() { return { malicious: [], deprecated: {}, search: [] }; },
                async getTargetPlatform() { return (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch); }
            });
            instantiationService.stub(extensions_2.IExtensionService, {
                onDidChangeExtensions: event_1.Event.None,
                extensions: [],
                async whenInstalledExtensionsRegistered() { return true; }
            });
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(url_1.IURLService, urlService_1.NativeURLService);
            instantiationService.stub(workspaceTags_1.IWorkspaceTagsService, new workspaceTagsService_1.NoOpWorkspaceTagsService());
            instantiationService.stub(storage_1.IStorageService, disposableStore.add(new workbenchTestServices_2.TestStorageService()));
            instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
            instantiationService.stub(productService_1.IProductService, {
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
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, disposableStore.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService)));
            instantiationService.stub(extensionManagement_1.IExtensionTipsService, disposableStore.add(instantiationService.createInstance(workbenchTestServices_3.TestExtensionTipsService)));
            onModelAddedEvent = new event_1.Emitter();
            instantiationService.stub(environment_1.IEnvironmentService, {});
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', []);
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, 'isEnabled', true);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(...mockExtensionGallery));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getExtensions', mockExtensionGallery);
            prompted = false;
            class TestNotificationService2 extends testNotificationService_1.TestNotificationService {
                prompt(severity, message, choices, options) {
                    prompted = true;
                    promptedEmitter.fire();
                    return super.prompt(severity, message, choices, options);
                }
            }
            instantiationService.stub(notification_1.INotificationService, new TestNotificationService2());
            testConfigurationService.setUserConfiguration(extensions_1.ConfigurationKey, { ignoreRecommendations: false });
            instantiationService.stub(model_1.IModelService, {
                getModels() { return []; },
                onModelAdded: onModelAddedEvent.event
            });
        });
        function setUpFolderWorkspace(folderName, recommendedExtensions, ignoredRecommendations = []) {
            return setUpFolder(folderName, recommendedExtensions, ignoredRecommendations);
        }
        async function setUpFolder(folderName, recommendedExtensions, ignoredRecommendations = []) {
            const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
            const logService = new log_1.NullLogService();
            const fileService = disposableStore.add(new fileService_1.FileService(logService));
            const fileSystemProvider = disposableStore.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            disposableStore.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            const folderDir = (0, resources_1.joinPath)(ROOT, folderName);
            const workspaceSettingsDir = (0, resources_1.joinPath)(folderDir, '.vscode');
            await fileService.createFolder(workspaceSettingsDir);
            const configPath = (0, resources_1.joinPath)(workspaceSettingsDir, 'extensions.json');
            await fileService.writeFile(configPath, buffer_1.VSBuffer.fromString(JSON.stringify({
                'recommendations': recommendedExtensions,
                'unwantedRecommendations': ignoredRecommendations,
            }, null, '\t')));
            const myWorkspace = (0, testWorkspace_1.testWorkspace)(folderDir);
            instantiationService.stub(files_1.IFileService, fileService);
            workspaceService = new workbenchTestServices_2.TestContextService(myWorkspace);
            instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceService);
            instantiationService.stub(workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService, disposableStore.add(instantiationService.createInstance(workspaceExtensionsConfig_1.WorkspaceExtensionsConfigService)));
            instantiationService.stub(extensionRecommendations_1.IExtensionIgnoredRecommendationsService, disposableStore.add(instantiationService.createInstance(extensionIgnoredRecommendationsService_1.ExtensionIgnoredRecommendationsService)));
            instantiationService.stub(extensionRecommendations_2.IExtensionRecommendationNotificationService, disposableStore.add(instantiationService.createInstance(extensionRecommendationNotificationService_1.ExtensionRecommendationNotificationService)));
        }
        function testNoPromptForValidRecommendations(recommendations) {
            return setUpFolderWorkspace('myFolder', recommendations).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
                return testObject.activationPromise.then(() => {
                    assert.strictEqual(Object.keys(testObject.getAllRecommendationsWithReason()).length, recommendations.length);
                    assert.ok(!prompted);
                });
            });
        }
        function testNoPromptOrRecommendationsForValidRecommendations(recommendations) {
            return setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
                assert.ok(!prompted);
                return testObject.getWorkspaceRecommendations().then(() => {
                    assert.strictEqual(Object.keys(testObject.getAllRecommendationsWithReason()).length, 0);
                    assert.ok(!prompted);
                });
            });
        }
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations when galleryService is absent', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            const galleryQuerySpy = sinon.spy();
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, { query: galleryQuerySpy, isEnabled: () => false });
            return testNoPromptOrRecommendationsForValidRecommendations(mockTestData.validRecommendedExtensions)
                .then(() => assert.ok(galleryQuerySpy.notCalled));
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations during extension development', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            instantiationService.stub(environment_1.IEnvironmentService, { extensionDevelopmentLocationURI: [uri_1.URI.file('/folder/file')], isExtensionDevelopment: true });
            return testNoPromptOrRecommendationsForValidRecommendations(mockTestData.validRecommendedExtensions);
        }));
        test('ExtensionRecommendationsService: No workspace recommendations or prompts when extensions.json has empty array', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            return testNoPromptForValidRecommendations([]);
        }));
        test('ExtensionRecommendationsService: Prompt for valid workspace recommendations', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            await setUpFolderWorkspace('myFolder', mockTestData.recommendedExtensions);
            testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
            await event_1.Event.toPromise(promptedEmitter.event);
            const recommendations = Object.keys(testObject.getAllRecommendationsWithReason());
            const expected = [...mockTestData.validRecommendedExtensions, 'unknown.extension'];
            assert.strictEqual(recommendations.length, expected.length);
            expected.forEach(x => {
                assert.strictEqual(recommendations.indexOf(x.toLowerCase()) > -1, true);
            });
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations if they are already installed', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', mockExtensionLocal);
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions);
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations with casing mismatch if they are already installed', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', mockExtensionLocal);
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions.map(x => x.toUpperCase()));
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations if ignoreRecommendations is set', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            testConfigurationService.setUserConfiguration(extensions_1.ConfigurationKey, { ignoreRecommendations: true });
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions);
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations if showRecommendationsOnlyOnDemand is set', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            testConfigurationService.setUserConfiguration(extensions_1.ConfigurationKey, { showRecommendationsOnlyOnDemand: true });
            return setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
                return testObject.activationPromise.then(() => {
                    assert.ok(!prompted);
                });
            });
        }));
        test('ExtensionRecommendationsService: No Prompt for valid workspace recommendations if ignoreRecommendations is set for current workspace', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            instantiationService.get(storage_1.IStorageService).store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions);
        }));
        test('ExtensionRecommendationsService: No Recommendations of globally ignored recommendations', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            instantiationService.get(storage_1.IStorageService).store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            instantiationService.get(storage_1.IStorageService).store('extensionsAssistant/recommendations', '["ms-dotnettools.csharp", "ms-python.python", "ms-vscode.vscode-typescript-tslint-plugin"]', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            instantiationService.get(storage_1.IStorageService).store('extensionsAssistant/ignored_recommendations', '["ms-dotnettools.csharp", "mockpublisher2.mockextension2"]', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
                return testObject.activationPromise.then(() => {
                    const recommendations = testObject.getAllRecommendationsWithReason();
                    assert.ok(!recommendations['ms-dotnettools.csharp']); // stored recommendation that has been globally ignored
                    assert.ok(recommendations['ms-python.python']); // stored recommendation
                    assert.ok(recommendations['mockpublisher1.mockextension1']); // workspace recommendation
                    assert.ok(!recommendations['mockpublisher2.mockextension2']); // workspace recommendation that has been globally ignored
                });
            });
        }));
        test('ExtensionRecommendationsService: No Recommendations of workspace ignored recommendations', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            const ignoredRecommendations = ['ms-dotnettools.csharp', 'mockpublisher2.mockextension2']; // ignore a stored recommendation and a workspace recommendation.
            const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python"]';
            instantiationService.get(storage_1.IStorageService).store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            instantiationService.get(storage_1.IStorageService).store('extensionsAssistant/recommendations', storedRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions, ignoredRecommendations).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
                return testObject.activationPromise.then(() => {
                    const recommendations = testObject.getAllRecommendationsWithReason();
                    assert.ok(!recommendations['ms-dotnettools.csharp']); // stored recommendation that has been workspace ignored
                    assert.ok(recommendations['ms-python.python']); // stored recommendation
                    assert.ok(recommendations['mockpublisher1.mockextension1']); // workspace recommendation
                    assert.ok(!recommendations['mockpublisher2.mockextension2']); // workspace recommendation that has been workspace ignored
                });
            });
        }));
        test('ExtensionRecommendationsService: Able to retrieve collection of all ignored recommendations', async () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            const storageService = instantiationService.get(storage_1.IStorageService);
            const workspaceIgnoredRecommendations = ['ms-dotnettools.csharp']; // ignore a stored recommendation and a workspace recommendation.
            const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python"]';
            const globallyIgnoredRecommendations = '["mockpublisher2.mockextension2"]'; // ignore a workspace recommendation.
            storageService.store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('extensionsAssistant/recommendations', storedRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('extensionsAssistant/ignored_recommendations', globallyIgnoredRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            await setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions, workspaceIgnoredRecommendations);
            testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
            await testObject.activationPromise;
            const recommendations = testObject.getAllRecommendationsWithReason();
            assert.deepStrictEqual(Object.keys(recommendations), ['ms-python.python', 'mockpublisher1.mockextension1']);
        }));
        test('ExtensionRecommendationsService: Able to dynamically ignore/unignore global recommendations', async () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            const storageService = instantiationService.get(storage_1.IStorageService);
            const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python"]';
            const globallyIgnoredRecommendations = '["mockpublisher2.mockextension2"]'; // ignore a workspace recommendation.
            storageService.store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('extensionsAssistant/recommendations', storedRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('extensionsAssistant/ignored_recommendations', globallyIgnoredRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            await setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions);
            const extensionIgnoredRecommendationsService = instantiationService.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService);
            testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
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
        test('test global extensions are modified and recommendation change event is fired when an extension is ignored', async () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            const storageService = instantiationService.get(storage_1.IStorageService);
            const changeHandlerTarget = sinon.spy();
            const ignoredExtensionId = 'Some.Extension';
            storageService.store('extensionsAssistant/workspaceRecommendationsIgnore', true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('extensionsAssistant/ignored_recommendations', '["ms-vscode.vscode"]', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            await setUpFolderWorkspace('myFolder', []);
            testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
            const extensionIgnoredRecommendationsService = instantiationService.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService);
            disposableStore.add(extensionIgnoredRecommendationsService.onDidChangeGlobalIgnoredRecommendation(changeHandlerTarget));
            extensionIgnoredRecommendationsService.toggleGlobalIgnoredRecommendation(ignoredExtensionId, true);
            await testObject.activationPromise;
            assert.ok(changeHandlerTarget.calledOnce);
            assert.ok(changeHandlerTarget.getCall(0).calledWithMatch({ extensionId: ignoredExtensionId.toLowerCase(), isRecommended: false }));
        }));
        test('ExtensionRecommendationsService: Get file based recommendations from storage (old format)', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python", "ms-vscode.vscode-typescript-tslint-plugin"]';
            instantiationService.get(storage_1.IStorageService).store('extensionsAssistant/recommendations', storedRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return setUpFolderWorkspace('myFolder', []).then(() => {
                testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
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
            instantiationService.get(storage_1.IStorageService).store('extensionsAssistant/recommendations', storedRecommendations, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            await setUpFolderWorkspace('myFolder', []);
            testObject = disposableStore.add(instantiationService.createInstance(extensionRecommendationsService_1.ExtensionRecommendationsService));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zU2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy90ZXN0L2VsZWN0cm9uLXNhbmRib3gvZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBZ0VoRyxNQUFNLG9CQUFvQixHQUF3QjtRQUNqRCxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFBRTtZQUNuQyxXQUFXLEVBQUUsa0JBQWtCO1lBQy9CLE9BQU8sRUFBRSxLQUFLO1lBQ2QsV0FBVyxFQUFFLGtCQUFrQjtZQUMvQixTQUFTLEVBQUUsZ0JBQWdCO1lBQzNCLG9CQUFvQixFQUFFLGtCQUFrQjtZQUN4QyxXQUFXLEVBQUUsa0JBQWtCO1lBQy9CLFlBQVksRUFBRSxJQUFJO1lBQ2xCLE1BQU0sRUFBRSxDQUFDO1lBQ1QsV0FBVyxFQUFFLEdBQUc7U0FDaEIsRUFBRTtZQUNGLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQztTQUN2QixFQUFFO1lBQ0YsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUU7WUFDbkUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUU7WUFDN0QsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUU7WUFDckUsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUU7WUFDbkUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFO1lBQ3ZELE9BQU8sRUFBRSxFQUFFLEdBQUcs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